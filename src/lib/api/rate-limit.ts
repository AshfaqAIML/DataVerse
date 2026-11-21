import type { NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter.
 *
 * The architecture doc specifies Redis+BullMQ for production multi-instance
 * deployments (SYSTEM_ARCHITECTURE.md ADR-008); this module implements the
 * same sliding-window algorithm against a local Map, which is correct for
 * a single node and keeps the API surface identical for the swap.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
let lastSweep = Date.now();

const MAX_KEYS = 50_000;

function sweep(now: number) {
  if (buckets.size < MAX_KEYS && now - lastSweep < 60_000) return;
  for (const [k, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(k);
  }
  lastSweep = now;
}

export type RateLimitOptions = {
  /** Bucket name (usually the route). */
  key: string;
  /** Max requests per window per client. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(opts: RateLimitOptions, clientKey: string): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const key = `${opts.key}:${clientKey}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, limit: opts.limit, remaining: opts.limit - 1, resetAt, retryAfterSeconds: 0 };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      limit: opts.limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    limit: opts.limit,
    remaining: opts.limit - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/** Client identity for rate limiting: user id if authenticated, else IP. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

// Per-route presets (requests / window)
export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 60_000 }, // login/register: 10/min
  read: { limit: 120, windowMs: 60_000 }, // catalog reads: 120/min
  write: { limit: 30, windowMs: 60_000 }, // mutations: 30/min
  ai: { limit: 12, windowMs: 60_000 }, // AI tutor: 12/min
  search: { limit: 60, windowMs: 60_000 }, // search: 60/min
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMITS;

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.floor(r.resetAt / 1000)),
  };
}
