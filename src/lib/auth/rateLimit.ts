import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let hasLoggedUpstashWarning = false;
export const STAT_MAX_REQUESTS = 120;
export const STAT_WINDOW_MS = 60 * 60 * 1000;
export const API_MAX_REQUESTS = 60;
export const API_WINDOW_MS = 60 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
export const GLOBAL_LOGIN_MAX_FAILURES = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_MEM_CACHE_SIZE = 1_000;
const UPSTASH_PLACEHOLDERS = [
  "your-database.upstash.io",
  "your-upstash-token",
  "your-redis",
  "your-token",
];
type LimiterAlgorithm = ConstructorParameters<typeof Ratelimit>[0]["limiter"];
function isUpstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token || !URL.canParse(url)) return false;
  return !UPSTASH_PLACEHOLDERS.some(
    (placeholder) => url.includes(placeholder) || token.includes(placeholder),
  );
}
function getRedis(): Redis | null {
  if (!isUpstashConfigured()) {
    if (!hasLoggedUpstashWarning) {
      console.warn(
        "[RateLimit] Upstash Redis credentials not configured. Falling back to in-memory rate limiting. Note: brute-force lockout requires persistent Redis in multi-instance serverless deployments.",
      );
      hasLoggedUpstashWarning = true;
    }
    return null;
  }
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) return null;
    redis = new Redis({ url, token });
  }
  return redis;
}
function retryAfterFromReset(resetMs: number, nowMs = Date.now()): number {
  return Math.max(0, Math.ceil((resetMs - nowMs) / 1000));
}
function createLazyLimiter(
  prefix: string,
  createAlgorithm: () => LimiterAlgorithm,
): (r: Redis) => Ratelimit {
  let instance: Ratelimit | null = null;
  const ephemeralCache = new Map<string, number>();
  return (r: Redis) => {
    if (!instance) {
      instance = new Ratelimit({
        redis: r,
        limiter: createAlgorithm(),
        prefix,
        ephemeralCache,
      });
    }
    return instance;
  };
}
function pruneExpiredMapEntries<T extends { resetAt: number }>(
  map: Map<string, T>,
  now: number,
): void {
  for (const [k, v] of map.entries()) {
    if (now > v.resetAt) {
      map.delete(k);
    }
  }
  if (map.size > MAX_MEM_CACHE_SIZE) {
    const sortedEntries = Array.from(map.entries())
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, Math.floor(MAX_MEM_CACHE_SIZE / 2));
    for (const [k] of sortedEntries) {
      map.delete(k);
    }
  }
}
export interface ApiRateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
}
function createSlidingLimiter(config: {
  prefix: string;
  maxRequests: number;
  windowMs: number;
  windowLabel: "1 h";
}) {
  const getLimiter = createLazyLimiter(config.prefix, () =>
    Ratelimit.slidingWindow(config.maxRequests, config.windowLabel),
  );
  const memStore = new Map<string, { count: number; resetAt: number }>();
  async function consume(key: string): Promise<ApiRateLimitResult> {
    const r = getRedis();
    if (r) {
      try {
        const { success, limit, remaining, reset } =
          await getLimiter(r).limit(key);
        return {
          limited: !success,
          limit,
          remaining,
          reset,
          retryAfterSeconds: success ? 0 : retryAfterFromReset(reset),
        };
      } catch (err) {
        console.warn("[RateLimit] Upstash limit() error, using fallback:", err);
      }
    }
    const now = Date.now();
    const entry = memStore.get(key);
    if (!entry || now > entry.resetAt) {
      pruneExpiredMapEntries(memStore, now);
      const reset = now + config.windowMs;
      memStore.set(key, { count: 1, resetAt: reset });
      return {
        limited: false,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset,
        retryAfterSeconds: 0,
      };
    }
    if (entry.count >= config.maxRequests) {
      return {
        limited: true,
        limit: config.maxRequests,
        remaining: 0,
        reset: entry.resetAt,
        retryAfterSeconds: retryAfterFromReset(entry.resetAt, now),
      };
    }
    entry.count += 1;
    return {
      limited: false,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      reset: entry.resetAt,
      retryAfterSeconds: 0,
    };
  }
  return { consume, memStore };
}
type LoginFailureEntry =
  | { status: "counting"; failures: number; resetAt: number }
  | { status: "locked"; resetAt: number };
const memLoginFailures = new Map<string, LoginFailureEntry>();
function createLockoutLimiter(config: { prefix: string; maxFailures: number }) {
  const getLimiter = createLazyLimiter(config.prefix, () =>
    Ratelimit.fixedWindow(config.maxFailures, "15 m"),
  );
  async function getLockout(redisKey: string, memKey: string): Promise<number> {
    const r = getRedis();
    if (r) {
      try {
        const { remaining, reset } = await getLimiter(r).getRemaining(redisKey);
        return remaining <= 0 ? retryAfterFromReset(reset) : 0;
      } catch (err) {
        console.warn(
          "[RateLimit] Upstash getRemaining() error, using fallback:",
          err,
        );
      }
    }
    const now = Date.now();
    const entry = memLoginFailures.get(memKey);
    if (!entry) return 0;
    if (now > entry.resetAt) {
      memLoginFailures.delete(memKey);
      return 0;
    }
    return entry.status === "locked"
      ? retryAfterFromReset(entry.resetAt, now)
      : 0;
  }
  async function recordFailure(
    redisKey: string,
    memKey: string,
  ): Promise<{ lockedOut: boolean; retryAfterSeconds: number }> {
    const r = getRedis();
    if (r) {
      try {
        const { success, reset } = await getLimiter(r).limit(redisKey);
        return {
          lockedOut: !success,
          retryAfterSeconds: success ? 0 : retryAfterFromReset(reset),
        };
      } catch (err) {
        console.warn("[RateLimit] Upstash limit() error, using fallback:", err);
      }
    }
    const now = Date.now();
    const entry = memLoginFailures.get(memKey);
    if (!entry || now > entry.resetAt) {
      pruneExpiredMapEntries(memLoginFailures, now);
      memLoginFailures.set(memKey, {
        status: "counting",
        failures: 1,
        resetAt: now + LOGIN_WINDOW_MS,
      });
      return { lockedOut: false, retryAfterSeconds: 0 };
    }
    if (entry.status === "locked") {
      return {
        lockedOut: true,
        retryAfterSeconds: retryAfterFromReset(entry.resetAt, now),
      };
    }
    const nextFailures = entry.failures + 1;
    if (nextFailures >= config.maxFailures) {
      memLoginFailures.set(memKey, {
        status: "locked",
        resetAt: now + LOGIN_WINDOW_MS,
      });
      return {
        lockedOut: true,
        retryAfterSeconds: Math.ceil(LOGIN_WINDOW_MS / 1000),
      };
    }
    entry.failures = nextFailures;
    return { lockedOut: false, retryAfterSeconds: 0 };
  }
  async function clearFailures(
    redisKey: string,
    memKey: string,
  ): Promise<void> {
    const r = getRedis();
    if (r) {
      try {
        await getLimiter(r).resetUsedTokens(redisKey);
      } catch (err) {
        console.warn(
          "[RateLimit] Upstash resetUsedTokens() error, using fallback:",
          err,
        );
      }
    }
    memLoginFailures.delete(memKey);
  }
  return { getLockout, recordFailure, clearFailures };
}
const statLimiter = createSlidingLimiter({
  prefix: "rl:stat",
  maxRequests: STAT_MAX_REQUESTS,
  windowMs: STAT_WINDOW_MS,
  windowLabel: "1 h",
});
const apiLimiter = createSlidingLimiter({
  prefix: "rl:api",
  maxRequests: API_MAX_REQUESTS,
  windowMs: API_WINDOW_MS,
  windowLabel: "1 h",
});
const userLoginLimiter = createLockoutLimiter({
  prefix: "rl:login",
  maxFailures: LOGIN_MAX_FAILURES,
});
const globalLoginLimiter = createLockoutLimiter({
  prefix: "rl:login:global",
  maxFailures: GLOBAL_LOGIN_MAX_FAILURES,
});
export async function checkRateLimit(
  key: string,
): Promise<{ limited: boolean; retryAfterSeconds: number }> {
  const { limited, retryAfterSeconds } = await statLimiter.consume(key);
  return { limited, retryAfterSeconds };
}
// shortcut: IP-based sliding window rate limiter without API keys; upgrade to signed user tokens if tenant isolation is required
export async function checkApiRateLimit(
  ip: string,
): Promise<ApiRateLimitResult> {
  return apiLimiter.consume(`api:random:${ip}`);
}
export function clearApiRateLimitForTest(ip?: string): void {
  if (ip) apiLimiter.memStore.delete(`api:random:${ip}`);
  else apiLimiter.memStore.clear();
}
export async function getLoginLockout(key: string): Promise<number> {
  return userLoginLimiter.getLockout(key, key);
}
export async function recordLoginFailure(
  key: string,
): Promise<{ lockedOut: boolean; retryAfterSeconds: number }> {
  return userLoginLimiter.recordFailure(key, key);
}
export async function getGlobalLoginLockout(): Promise<number> {
  return globalLoginLimiter.getLockout("system", "login:global");
}
export async function recordGlobalLoginFailure(): Promise<{
  lockedOut: boolean;
  retryAfterSeconds: number;
}> {
  return globalLoginLimiter.recordFailure("system", "login:global");
}
export async function clearLoginFailures(key: string): Promise<void> {
  return userLoginLimiter.clearFailures(key, key);
}
export async function clearGlobalLoginFailures(): Promise<void> {
  return globalLoginLimiter.clearFailures("system", "login:global");
}
