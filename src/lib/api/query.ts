import type { NextRequest } from "next/server";
import { z } from "zod";
import { AppError, type PageMeta } from "./errors";
import type { Prisma } from "@prisma/client";

/**
 * Pagination / filtering / sorting / search parsing for list endpoints.
 *
 * Conventions (documented in the console API explorer):
 *   ?page=1&pageSize=20            offset pagination (max 100)
 *   ?sort=-createdAt,title         "-" prefix = descending, whitelisted fields
 *   ?search=python                 ILIKE-style contains across whitelisted columns
 *   ?filter[status]=PUBLISHED      exact filters per whitelisted field
 *   ?filter[level]=BEGINNER,INTERMEDIATE  comma separated = IN (...)
 */

export const PAGINATION_DEFAULTS = { page: 1, pageSize: 20, maxPageSize: 100 };

const zPage = z.coerce.number().int().min(1).max(10_000).optional();
const zPageSize = z.coerce.number().int().min(1).max(PAGINATION_DEFAULTS.maxPageSize).optional();

export function parsePagination(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = zPage.safeParse(sp.get("page") ?? undefined);
  const pageSize = zPageSize.safeParse(sp.get("pageSize") ?? undefined);
  if (!page.success) throw new AppError("BAD_REQUEST", "Invalid 'page' parameter", page.error.issues);
  if (!pageSize.success) throw new AppError("BAD_REQUEST", "Invalid 'pageSize' parameter (1-100)", pageSize.error.issues);
  const p = page.success && page.data !== undefined ? page.data : PAGINATION_DEFAULTS.page;
  const ps = pageSize.success && pageSize.data !== undefined ? pageSize.data : PAGINATION_DEFAULTS.pageSize;
  return { page: p, pageSize: ps, skip: (p - 1) * ps, take: ps };
}

export function buildPageMeta(page: number, pageSize: number, total: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ------------------------------------------------------------------ sorting
export type SortSpec = { field: string; dir: "asc" | "desc" };

export function parseSort(req: NextRequest, allowed: readonly string[]): SortSpec[] {
  const raw = req.nextUrl.searchParams.get("sort");
  if (!raw) return [];
  const specs: SortSpec[] = [];
  for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const dir = part.startsWith("-") ? "desc" : "asc";
    const field = dir === "desc" ? part.slice(1) : part;
    if (!allowed.includes(field)) {
      throw new AppError("BAD_REQUEST", `Cannot sort by '${field}'. Allowed: ${allowed.join(", ")}`);
    }
    specs.push({ field, dir });
  }
  return specs;
}

export function toPrismaOrderBy(specs: SortSpec[]): Record<string, "asc" | "desc">[] {
  return specs.map((s) => ({ [s.field]: s.dir }));
}

// ------------------------------------------------------------------ search
export function parseSearch(req: NextRequest, fields: readonly string[]): { q: string; fields: string[] } | null {
  const q = req.nextUrl.searchParams.get("search")?.trim();
  if (!q) return null;
  if (q.length < 2) throw new AppError("BAD_REQUEST", "'search' must be at least 2 characters");
  return { q, fields: [...fields] };
}

export function toPrismaWhereSearch(
  search: { q: string; fields: string[] } | null
): Prisma.StringFilter | undefined {
  if (!search) return undefined;
  return { contains: search.q }; // SQLite LIKE via Prisma is case-insensitive for ASCII
}

// ----------------------------------------------------------------- filters
export type FilterConfig = Record<string, { column: string; type: "string" | "number" | "boolean" }>;

/**
 * Parses `filter[field]=value` query params. Values may be comma-separated
 * which translates to a Prisma `in` condition.
 */
export function parseFilters(req: NextRequest, config: FilterConfig): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [param, def] of Object.entries(config)) {
    const raw = req.nextUrl.searchParams.get(`filter[${param}]`);
    if (raw === null || raw === "") continue;
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    if (values.length === 0) continue;

    if (def.type === "number") {
      const nums = values.map((v) => {
        const n = Number(v);
        if (Number.isNaN(n)) throw new AppError("BAD_REQUEST", `Filter '${param}' expects numeric values`);
        return n;
      });
      out[def.column] = nums.length === 1 ? { equals: nums[0] } : { in: nums };
      continue;
    }

    if (def.type === "boolean") {
      const v = values[0].toLowerCase();
      if (v !== "true" && v !== "false") throw new AppError("BAD_REQUEST", `Filter '${param}' expects true|false`);
      out[def.column] = { equals: v === "true" };
      continue;
    }

    out[def.column] = values.length === 1 ? { equals: values[0] } : { in: values };
  }
  return out;
}

/** Combines AND-joins where fragments (search + filters + base); null/empty parts are skipped. */
export function combineWhere(...parts: (Record<string, unknown> | null | undefined)[]): Record<string, unknown> {
  const filtered = parts.filter((p): p is Record<string, unknown> => !!p && Object.keys(p).length > 0);
  if (filtered.length === 0) return {};
  if (filtered.length === 1) return filtered[0];
  return { AND: filtered };
}

/** Standard list query execution with count + page meta. Returns a [items, meta] tuple. */
export async function listWithPagination<T>(
  findMany: (args: { skip: number; take: number }) => Promise<T[]>,
  count: () => Promise<number>,
  page: number,
  pageSize: number
): Promise<[T[], PageMeta]> {
  const [items, total] = await Promise.all([findMany({ skip: (page - 1) * pageSize, take: pageSize }), count()]);
  return [items, buildPageMeta(page, pageSize, total)];
}
