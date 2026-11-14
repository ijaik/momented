import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let hasLoggedUpstashWarning = false;
export const STAT_MAX_REQUESTS = 120;
export const STAT_WINDOW_MS = 60 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
export const GLOBAL_LOGIN_MAX_FAILURES = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
function isUpstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(
    url &&
      token &&
      !url.includes("your-redis") &&
      !token.includes("your-token"),
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
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    redis = new Redis({
      url,
      token,
    });
  }
  return redis;
}
let _statLimiter: Ratelimit | null = null;
let _loginLimiter: Ratelimit | null = null;
let _globalLoginLimiter: Ratelimit | null = null;
const statEphemeralCache = new Map<string, number>();
const loginEphemeralCache = new Map<string, number>();
const globalLoginEphemeralCache = new Map<string, number>();
function getStatLimiter(r: Redis): Ratelimit {
  if (!_statLimiter) {
    _statLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(STAT_MAX_REQUESTS, "1 h"),
      prefix: "rl:stat",
      ephemeralCache: statEphemeralCache,
    });
  }
  return _statLimiter;
}
function getLoginLimiter(r: Redis): Ratelimit {
  if (!_loginLimiter) {
    _loginLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.fixedWindow(LOGIN_MAX_FAILURES, "15 m"),
      prefix: "rl:login",
      ephemeralCache: loginEphemeralCache,
    });
  }
  return _loginLimiter;
}
function getGlobalLoginLimiter(r: Redis): Ratelimit {
  if (!_globalLoginLimiter) {
    _globalLoginLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.fixedWindow(GLOBAL_LOGIN_MAX_FAILURES, "15 m"),
      prefix: "rl:login:global",
      ephemeralCache: globalLoginEphemeralCache,
    });
  }
  return _globalLoginLimiter;
}
const MAX_MEM_CACHE_SIZE = 1_000;
const memStatStore = new Map<string, { count: number; resetAt: number }>();
type LoginFailureEntry =
  | { status: "counting"; failures: number; resetAt: number }
  | { status: "locked"; resetAt: number };
const memLoginFailures = new Map<string, LoginFailureEntry>();
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
function getInMemoryLockoutSeconds(key: string): number {
  const now = Date.now();
  const entry = memLoginFailures.get(key);
  if (!entry) return 0;
  if (now > entry.resetAt) {
    memLoginFailures.delete(key);
    return 0;
  }
  if (entry.status === "locked")
    return Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
  return 0;
}
function recordInMemoryFailure(
  key: string,
  maxFailures: number,
): { lockedOut: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = memLoginFailures.get(key);
  if (!entry || now > entry.resetAt) {
    pruneExpiredMapEntries(memLoginFailures, now);
    memLoginFailures.set(key, {
      status: "counting",
      failures: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
    return { lockedOut: false, retryAfterSeconds: 0 };
  }
  if (entry.status === "locked")
    return {
      lockedOut: true,
      retryAfterSeconds: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
    };
  const nextFailures = entry.failures + 1;
  if (nextFailures >= maxFailures) {
    memLoginFailures.set(key, {
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
export async function checkRateLimit(
  key: string,
): Promise<{ limited: boolean; retryAfterSeconds: number }> {
  const r = getRedis();
  if (r) {
    try {
      const { success, reset } = await getStatLimiter(r).limit(key);
      const retryAfterSeconds = success
        ? 0
        : Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return { limited: !success, retryAfterSeconds };
    } catch (err) {
      console.warn("[RateLimit] Upstash limit() error, using fallback:", err);
    }
  }
  const now = Date.now();
  const entry = memStatStore.get(key);
  if (!entry || now > entry.resetAt) {
    pruneExpiredMapEntries(memStatStore, now);
    memStatStore.set(key, { count: 1, resetAt: now + STAT_WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }
  if (entry.count >= STAT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((entry.resetAt - now) / 1000),
    );
    return { limited: true, retryAfterSeconds };
  }
  entry.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}
export async function getLoginLockout(key: string): Promise<number> {
  const r = getRedis();
  if (r) {
    try {
      const { remaining, reset } = await getLoginLimiter(r).getRemaining(key);
      if (remaining <= 0) {
        return Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      }
      return 0;
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash getRemaining() error, using fallback:",
        err,
      );
    }
  }
  return getInMemoryLockoutSeconds(key);
}
export async function recordLoginFailure(
  key: string,
): Promise<{ lockedOut: boolean; retryAfterSeconds: number }> {
  const r = getRedis();
  if (r) {
    try {
      const { success, reset } = await getLoginLimiter(r).limit(key);
      const retryAfterSeconds = success
        ? 0
        : Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return { lockedOut: !success, retryAfterSeconds };
    } catch (err) {
      console.warn("[RateLimit] Upstash limit() error, using fallback:", err);
    }
  }
  return recordInMemoryFailure(key, LOGIN_MAX_FAILURES);
}
export async function getGlobalLoginLockout(): Promise<number> {
  const r = getRedis();
  if (r) {
    try {
      const { remaining, reset } =
        await getGlobalLoginLimiter(r).getRemaining("system");
      if (remaining <= 0) {
        return Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      }
      return 0;
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash global getRemaining() error, using fallback:",
        err,
      );
    }
  }
  return getInMemoryLockoutSeconds("login:global");
}
export async function recordGlobalLoginFailure(): Promise<{
  lockedOut: boolean;
  retryAfterSeconds: number;
}> {
  const r = getRedis();
  if (r) {
    try {
      const { success, reset } = await getGlobalLoginLimiter(r).limit("system");
      const retryAfterSeconds = success
        ? 0
        : Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return { lockedOut: !success, retryAfterSeconds };
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash global limit() error, using fallback:",
        err,
      );
    }
  }
  return recordInMemoryFailure("login:global", GLOBAL_LOGIN_MAX_FAILURES);
}
export async function clearLoginFailures(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await getLoginLimiter(r).resetUsedTokens(key);
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash resetUsedTokens() error, using fallback:",
        err,
      );
    }
  }
  memLoginFailures.delete(key);
}
export async function clearGlobalLoginFailures(): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await getGlobalLoginLimiter(r).resetUsedTokens("system");
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash global resetUsedTokens() error, using fallback:",
        err,
      );
    }
  }
  memLoginFailures.delete("login:global");
}
