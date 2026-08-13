import "server-only";
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const MAX_ENTRIES = 10_000;
const entries = new Map<string, RateLimitEntry>();
function pruneExpired(now: number): void {
  if (entries.size <= MAX_ENTRIES) return;
  for (const [key, entry] of entries)
    if (entry.resetAt <= now) entries.delete(key);
}
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  pruneExpired(now);
  const entry = entries.get(key);
  if (!entry || entry.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  return {
    limited: entry.count > maxRequests,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
export function getLoginLockout(key: string): number {
  const entry = entries.get(key);
  if (!entry) return 0;
  const remainingMs = entry.resetAt - Date.now();
  return remainingMs > 0 && entry.count > LOGIN_MAX_FAILURES
    ? Math.ceil(remainingMs / 1000)
    : 0;
}
export function recordLoginFailure(key: string): {
  lockedOut: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpired(now);
  const entry = entries.get(key);
  if (!entry || entry.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { lockedOut: false, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  return {
    lockedOut: entry.count > LOGIN_MAX_FAILURES,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}
export function clearLoginFailures(key: string): void {
  entries.delete(key);
}
