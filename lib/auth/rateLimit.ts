import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
let redis: Redis | null = null;
let hasLoggedUpstashWarning = false;
const STAT_MAX_REQUESTS = 120;
const STAT_WINDOW_MS = 60 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
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
    if (!hasLoggedUpstashWarning && process.env.NODE_ENV !== "production") {
      console.warn(
        "[RateLimit] Upstash Redis credentials not configured. Falling back to in-memory rate limiting.",
      );
      hasLoggedUpstashWarning = true;
    }
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}
let _statLimiter: Ratelimit | null = null;
let _loginLimiter: Ratelimit | null = null;
function getStatLimiter(r: Redis): Ratelimit {
  if (!_statLimiter) {
    _statLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(STAT_MAX_REQUESTS, "1 h"),
      ephemeralCache: new Map(),
      prefix: "rl:stat",
    });
  }
  return _statLimiter;
}
function getLoginLimiter(r: Redis): Ratelimit {
  if (!_loginLimiter) {
    _loginLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.fixedWindow(LOGIN_MAX_FAILURES, "15 m"),
      ephemeralCache: new Map(),
      prefix: "rl:login",
    });
  }
  return _loginLimiter;
}
const memStatStore = new Map<string, { count: number; resetAt: number }>();
const memLoginFailures = new Map<
  string,
  { failures: number; resetAt: number; lockedUntil?: number }
>();
export async function checkRateLimit(
  key: string,
  _maxRequests: number = STAT_MAX_REQUESTS,
  _windowMs: number = STAT_WINDOW_MS,
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
    memStatStore.set(key, { count: 1, resetAt: now + _windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }
  if (entry.count >= _maxRequests) {
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
  const now = Date.now();
  const entry = memLoginFailures.get(key);
  if (!entry) return 0;
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return Math.max(0, Math.ceil((entry.lockedUntil - now) / 1000));
  }
  return 0;
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
  const now = Date.now();
  const entry = memLoginFailures.get(key);
  if (!entry || now > entry.resetAt) {
    memLoginFailures.set(key, {
      failures: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    });
    return { lockedOut: false, retryAfterSeconds: 0 };
  }
  entry.failures += 1;
  if (entry.failures >= LOGIN_MAX_FAILURES) {
    entry.lockedUntil = now + LOGIN_WINDOW_MS;
    return {
      lockedOut: true,
      retryAfterSeconds: Math.ceil(LOGIN_WINDOW_MS / 1000),
    };
  }
  return { lockedOut: false, retryAfterSeconds: 0 };
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