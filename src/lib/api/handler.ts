import type { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";
import { AppError, toErrorResponse } from "./errors";
import { checkRateLimit, clientIp, rateLimitHeaders, RATE_LIMITS, type RateLimitPreset } from "./rate-limit";
import { logger } from "@/lib/logger";
import type { SessionUser } from "@/auth/session";
import { getSessionUser } from "@/auth/session";

/**
 * withApi — the single composition point for every route handler:
 *
 *   request ──► structured logging (requestId, method, path, duration, status)
 *           ──► rate limiting (per-IP preset + optional per-user bucket)
 *           ──► authentication (resolves SessionUser, optional requirement)
 *           ──► handler(ctx)
 *           ──► unified error mapping (AppError / Zod / Prisma) to envelope
 */

export type ApiContext = {
  req: NextRequest;
  user: SessionUser | null; // null when unauthenticated
  requestId: string;
  params: Record<string, string>;
};

type Handler = (ctx: ApiContext) => Promise<NextResponse>;

export type WithApiOptions = {
  /** Require any authenticated user. */
  auth?: boolean;
  /** Rate limit preset; disable with `false` (health checks). */
  rateLimit?: RateLimitPreset | false;
  /** Override the rate limit bucket key (defaults to pathname). */
  bucket?: string;
};

export function withApi(options: WithApiOptions, handler: Handler) {
  return async (req: NextRequest, route?: { params?: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const start = Date.now();
    const path = req.nextUrl.pathname;

    // resolve dynamic params (Next 15+: params is a Promise)
    let params: Record<string, string> = {};
    if (route?.params) {
      try {
        params = await route.params;
      } catch {
        params = {};
      }
    }

    let res: NextResponse;
    try {
      // 1) rate limiting
      const preset = options.rateLimit === false ? null : options.rateLimit ?? "read";
      const rlConfig = preset ? RATE_LIMITS[preset] : null;
      if (rlConfig) {
        const ip = clientIp(req);
        const rl = checkRateLimit(
          { key: options.bucket ?? path, limit: rlConfig.limit, windowMs: rlConfig.windowMs },
          ip
        );
        if (!rl.ok) {
          res = toErrorResponse(new AppError("RATE_LIMITED", "Too many requests. Please slow down."));
          res.headers.set("Retry-After", String(rl.retryAfterSeconds));
          for (const [k, v] of Object.entries(rateLimitHeaders(rl))) res.headers.set(k, v);
          logger.warn("rate_limited", { requestId, path, ip });
          return res;
        }
      }

      // 2) authentication
      const user = await getSessionUser(req);
      if (options.auth && !user) throw new AppError("UNAUTHORIZED", "Authentication required");

      // 3) handler
      res = await handler({ req, user, requestId, params });
    } catch (err) {
      res = toErrorResponse(err);
      if (res.status >= 500) {
        logger.error("request_failed", {
          requestId,
          method: req.method,
          path,
          status: res.status,
          durationMs: Date.now() - start,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info("request", {
      requestId,
      method: req.method,
      path,
      status: res.status,
      durationMs: Date.now() - start,
      userId: res.headers.get("X-User-Id") ?? undefined,
    });

    res.headers.set("X-Request-Id", requestId);
    return res;
  };
}

/** Parses + validates a JSON body through a Zod schema. */
export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AppError("BAD_REQUEST", "Request body must be valid JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Request validation failed", {
    issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
  return parsed.data;
}

/** Validates URL search params through a Zod schema. */
export function parseQuery<T>(req: NextRequest, schema: ZodType<T>): T {
  const obj: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const parsed = schema.safeParse(obj);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid query parameters", {
    issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
  return parsed.data;
}

export { AppError };
