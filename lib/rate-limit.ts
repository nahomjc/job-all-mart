import "server-only";

/**
 * Token-bucket-ish rate limiter, in-memory.
 *
 * For production: swap the backing Map for Upstash Redis or @vercel/kv —
 * the public API stays the same.
 */
const BUCKETS = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  /** Logical key — e.g. `submit-job:<userId>`. */
  key: string;
  /** Max actions allowed in the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInSeconds: number;
}

export async function rateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = BUCKETS.get(opts.key);

  if (!bucket || now >= bucket.resetAt) {
    BUCKETS.set(opts.key, {
      count: 1,
      resetAt: now + opts.windowSeconds * 1000,
    });
    return {
      ok: true,
      remaining: opts.limit - 1,
      resetInSeconds: opts.windowSeconds,
    };
  }

  if (bucket.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: opts.limit - bucket.count,
    resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/**
 * Periodically reap expired entries so the Map doesn't grow unbounded.
 * Called opportunistically from the rate limiter would also work; we use an
 * interval here for simplicity.
 */
if (typeof setInterval === "function") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of BUCKETS) {
      if (now >= v.resetAt) BUCKETS.delete(k);
    }
  }, 60_000).unref?.();
}
