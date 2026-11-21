import "../__setup";
import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { buildPageMeta, parseFilters, parsePagination, parseSearch, parseSort } from "@/lib/api/query";
import { AppError } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";

function req(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

describe("pagination parsing", () => {
  test("defaults to page 1, pageSize 20", () => {
    const p = parsePagination(req("/api/courses"));
    expect(p).toEqual({ page: 1, pageSize: 20, skip: 0, take: 20 });
  });

  test("respects page & pageSize", () => {
    const p = parsePagination(req("/api/courses?page=3&pageSize=50"));
    expect(p).toEqual({ page: 3, pageSize: 50, skip: 100, take: 50 });
  });

  test("caps pageSize at 100", () => {
    expect(() => parsePagination(req("/api/courses?pageSize=1000"))).toThrow(AppError);
  });

  test("rejects zero/negative/non-numeric pages", () => {
    expect(() => parsePagination(req("/api/courses?page=0"))).toThrow(AppError);
    expect(() => parsePagination(req("/api/courses?page=-2"))).toThrow(AppError);
    expect(() => parsePagination(req("/api/courses?page=abc"))).toThrow(AppError);
  });

  test("builds consistent page meta", () => {
    expect(buildPageMeta(1, 20, 0)).toEqual({ page: 1, pageSize: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
    expect(buildPageMeta(2, 10, 35)).toEqual({ page: 2, pageSize: 10, total: 35, totalPages: 4, hasNext: true, hasPrev: true });
    expect(buildPageMeta(4, 10, 35)).toEqual({ page: 4, pageSize: 10, total: 35, totalPages: 4, hasNext: false, hasPrev: true });
  });
});

describe("sort parsing", () => {
  test("parses multi-field sort with direction", () => {
    const s = parseSort(req("/api/courses?sort=-createdAt,title"), ["createdAt", "title"]);
    expect(s).toEqual([
      { field: "createdAt", dir: "desc" },
      { field: "title", dir: "asc" },
    ]);
  });

  test("rejects non-whitelisted fields", () => {
    expect(() => parseSort(req("/api/courses?sort=passwordHash"), ["createdAt"])).toThrow(AppError);
  });

  test("empty sort yields empty list", () => {
    expect(parseSort(req("/api/courses"), ["createdAt"])).toEqual([]);
  });
});

describe("search parsing", () => {
  test("returns null without a query", () => {
    expect(parseSearch(req("/api/courses"), ["title"])).toBeNull();
  });

  test("requires at least 2 characters", () => {
    expect(() => parseSearch(req("/api/courses?search=a"), ["title"])).toThrow(AppError);
  });

  test("returns q + whitelisted fields", () => {
    expect(parseSearch(req("/api/courses?search=python"), ["title", "description"])).toEqual({
      q: "python",
      fields: ["title", "description"],
    });
  });
});

describe("filter parsing", () => {
  test("single value becomes equals", () => {
    const f = parseFilters(req("/api/courses?filter[status]=PUBLISHED"), { status: { column: "status", type: "string" } });
    expect(f).toEqual({ status: { equals: "PUBLISHED" } });
  });

  test("comma separated becomes in-list", () => {
    const f = parseFilters(req("/api/courses?filter[level]=BEGINNER,ADVANCED"), { level: { column: "level", type: "string" } });
    expect(f).toEqual({ level: { in: ["BEGINNER", "ADVANCED"] } });
  });

  test("numeric filters reject non-numbers", () => {
    expect(() =>
      parseFilters(req("/api/courses?filter[hours]=ten"), { hours: { column: "estimatedHours", type: "number" } })
    ).toThrow(AppError);
    const f = parseFilters(req("/api/courses?filter[hours]=12"), { hours: { column: "estimatedHours", type: "number" } });
    expect(f).toEqual({ estimatedHours: { equals: 12 } });
  });

  test("boolean filters accept only true/false", () => {
    const f = parseFilters(req("/api/exercises?filter[hidden]=false"), { hidden: { column: "hidden", type: "boolean" } });
    expect(f).toEqual({ hidden: { equals: false } });
    expect(() =>
      parseFilters(req("/api/exercises?filter[hidden]=maybe"), { hidden: { column: "hidden", type: "boolean" } })
    ).toThrow(AppError);
  });

  test("ignores unknown filter params", () => {
    const f = parseFilters(req("/api/courses?filter[hax]=1"), { status: { column: "status", type: "string" } });
    expect(f).toEqual({});
  });
});

describe("rate limiter (sliding window)", () => {
  test("allows up to the limit then blocks", () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    const opts = { key, limit: 3, windowMs: 1000 };
    expect(checkRateLimit(opts, "client").ok).toBe(true);
    expect(checkRateLimit(opts, "client").ok).toBe(true);
    const third = checkRateLimit(opts, "client");
    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);
    const blocked = checkRateLimit(opts, "client");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  test("isolates clients", () => {
    const key = `test-iso:${Date.now()}`;
    const opts = { key, limit: 1, windowMs: 1000 };
    expect(checkRateLimit(opts, "alice").ok).toBe(true);
    expect(checkRateLimit(opts, "bob").ok).toBe(true);
    expect(checkRateLimit(opts, "alice").ok).toBe(false);
  });

  test("window resets after expiry", async () => {
    const key = `test-exp:${Date.now()}`;
    const opts = { key, limit: 1, windowMs: 60 };
    expect(checkRateLimit(opts, "carol").ok).toBe(true);
    expect(checkRateLimit(opts, "carol").ok).toBe(false);
    await new Promise((r) => setTimeout(r, 90));
    expect(checkRateLimit(opts, "carol").ok).toBe(true);
  });
});
