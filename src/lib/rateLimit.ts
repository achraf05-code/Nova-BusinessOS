/**
 * Tiny in-memory token-bucket rate limiter. Per-process, sliding window.
 *
 * For a beta launch this protects the high-risk endpoints (login,
 * invitations, AI CFO generation) from accidental abuse without adding
 * Redis. For production scale-out replace this with Upstash Ratelimit or
 * a similar distributed counter.
 */

declare global {
  // eslint-disable-next-line no-var
  var __novaRateLimiter:
    | Map<string, { count: number; resetAt: number }>
    | undefined;
}

function bucket() {
  if (!globalThis.__novaRateLimiter) globalThis.__novaRateLimiter = new Map();
  return globalThis.__novaRateLimiter;
}

export interface RateLimitOptions {
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Maximum hits within the window. */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  opts: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const map = bucket();
  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + opts.windowMs;
    map.set(key, { count: 1, resetAt });
    return { ok: true, remaining: opts.max - 1, resetAt };
  }
  if (entry.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { ok: true, remaining: opts.max - entry.count, resetAt: entry.resetAt };
}

/** Extracts a stable client key from a Request — used for IP-bound limits. */
export function clientKey(req: Request, scope = "default") {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
