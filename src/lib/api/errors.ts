import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Unified API error model + response envelope.
 *
 * Every response is one of:
 *   { success: true,  data: ..., meta?: ... }
 *   { success: false, error: { code, message, details? } }
 */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNPROCESSABLE"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

export const badRequest = (m: string, d?: unknown) => new AppError("BAD_REQUEST", m, d);
export const unauthorized = (m = "Authentication required") => new AppError("UNAUTHORIZED", m);
export const forbidden = (m = "You do not have permission to perform this action") => new AppError("FORBIDDEN", m);
export const notFound = (m = "Resource not found") => new AppError("NOT_FOUND", m);
export const conflict = (m: string, d?: unknown) => new AppError("CONFLICT", m, d);
export const unprocessable = (m: string, d?: unknown) => new AppError("UNPROCESSABLE", m, d);

// ------------------------------------------------------------- responses
export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, data, ...(meta !== undefined ? { meta } : {}) }, { status });
}

export function created<T>(data: T, meta?: Record<string, unknown>) {
  return ok(data, meta, 201);
}

export function paginated<T>(items: T[], pageMeta: PageMeta, extraMeta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: true,
      data: items,
      meta: { pagination: pageMeta, ...extraMeta },
    },
    { status: 200 }
  );
}

export function fail(code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status: STATUS_BY_CODE[code] }
  );
}

// ------------------------------------------------------ error normalizer
/** Maps any thrown value onto the envelope. Prisma/Zod get special cases. */
export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return fail(err.code, err.message, err.details);
  }

  if (err instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Request validation failed", flattenZod(err));
  }

  // Prisma known errors
  const e = err as { code?: string; meta?: Record<string, unknown>; message?: string };
  if (e?.code === "P2002") {
    const target = Array.isArray(e.meta?.target) ? (e.meta?.target as string[]).join(", ") : String(e.meta?.target ?? "");
    return fail("CONFLICT", `Unique constraint violated: ${target}`);
  }
  if (e?.code === "P2025") {
    return fail("NOT_FOUND", "Resource not found");
  }
  if (e?.code === "P2003") {
    return fail("CONFLICT", "Operation violates a relation constraint (record still referenced elsewhere)");
  }

  return fail("INTERNAL_ERROR", "An unexpected error occurred");
}

function flattenZod(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
}
