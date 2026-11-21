import "../__setup";
import { describe, expect, test, beforeAll } from "bun:test";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cleanAll, mkCourseTree, mkExercise, mkQuiz, mkUser } from "../helpers";
import { SESSION_COOKIE } from "@/lib/domain/constants";

/**
 * API contract tests — invoke the real route handlers with NextRequest
 * objects (no HTTP server needed): envelope shape, auth, RBAC, validation,
 * rate limiting, pagination/filter/sort/search and error mapping.
 */

// route handlers under test
import { GET as health } from "@/app/api/route";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as session } from "@/app/api/auth/session/route";
import { GET as listCourses, POST as createCourse } from "@/app/api/courses/route";
import { GET as getCourseById } from "@/app/api/courses/[id]/route";
import { GET as search } from "@/app/api/search/route";
import { GET as listUsers } from "@/app/api/users/route";
import { GET as listExercises } from "@/app/api/exercises/route";
import { GET as overview } from "@/app/api/admin/overview/route";
import { GET as analyticsPlatform } from "@/app/api/analytics/platform/route";

type Json = Record<string, unknown>;

function req(
  path: string,
  init?: { method?: string; body?: unknown; cookie?: string; ip?: string }
) {
  const headers: Record<string, string> = {};
  if (init?.cookie) headers.cookie = init.cookie;
  if (init?.ip) headers["x-forwarded-for"] = init.ip;
  if (init?.body !== undefined) headers["content-type"] = "application/json";
  return new NextRequest(`http://localhost${path}`, {
    method: init?.method ?? "GET",
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

function extractCookie(res: Response, name: string): string | undefined {
  const setCookie =
    (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")!] : []);
  for (const c of setCookie) {
    const m = c.match(new RegExp(`^${name}=([^;]+)`));
    if (m) return m[1];
  }
  return undefined;
}

async function json(res: Response): Promise<Json> {
  return (await res.json()) as Json;
}

const ids = { params: Promise.resolve({ id: "nonexistent" }) } as never;

beforeAll(cleanAll);

describe("health & envelope", () => {
  test("GET /api returns healthy envelope", async () => {
    const res = await health();
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.success).toBe(true);
    expect((body.data as Json).status).toBe("healthy");
  });
});

describe("auth flow (register -> session -> login -> logout)", () => {
  test("register creates a STUDENT + session cookie", async () => {
    const res = await register(
      req("/api/auth/register", {
        method: "POST",
        body: { email: "api-user@t.test", password: "Passw0rd!", name: "Api User" },
      })
    );
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.success).toBe(true);
    const user = body.data as { user: { role: string } };
    expect(user.user.role).toBe("STUDENT");
    const token = extractCookie(res, SESSION_COOKIE);
    expect(token).toBeTruthy();
  });

  test("duplicate registration returns 409 CONFLICT", async () => {
    const res = await register(
      req("/api/auth/register", {
        method: "POST",
        body: { email: "api-user@t.test", password: "Passw0rd!", name: "Dupe" },
      })
    );
    expect(res.status).toBe(409);
    const body = await json(res);
    expect(body.success).toBe(false);
    expect((body.error as Json).code).toBe("CONFLICT");
  });

  test("registration validation: weak password -> 422 with field issues", async () => {
    const res = await register(
      req("/api/auth/register", {
        method: "POST",
        body: { email: "not-an-email", password: "short", name: "" },
      })
    );
    expect(res.status).toBe(422);
    const body = await json(res);
    const issues = (body.error as { details: { issues: { path: string }[] } }).details.issues;
    expect(issues.length).toBeGreaterThanOrEqual(3);
    expect(issues.map((i) => i.path)).toContain("email");
    expect(issues.map((i) => i.path)).toContain("password");
    expect(issues.map((i) => i.path)).toContain("name");
  });

  test("login with valid credentials returns user + cookie", async () => {
    const res = await login(
      req("/api/auth/login", { method: "POST", body: { email: "api-user@t.test", password: "Passw0rd!" } })
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(((body.data as Json).user as Json).role).toBe("STUDENT");
    expect(extractCookie(res, SESSION_COOKIE)).toBeTruthy();
  });

  test("login with wrong password returns 401 without user enumeration", async () => {
    const res = await login(
      req("/api/auth/login", { method: "POST", body: { email: "api-user@t.test", password: "Wrong1!" }, ip: "9.9.9.9" })
    );
    expect(res.status).toBe(401);
    const body = await json(res);
    expect((body.error as Json).message).toBe("Invalid email or password");

    const res2 = await login(
      req("/api/auth/login", { method: "POST", body: { email: "ghost@t.test", password: "Wrong1!" }, ip: "9.9.9.9" })
    );
    expect((await json(res2)).error).toEqual(body.error); // identical response
  });

  test("session endpoint resolves the cookie to the user", async () => {
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: "api-user@t.test", password: "Passw0rd!" }, ip: "8.8.8.8" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const res = await session(req("/api/auth/session", { cookie: `${SESSION_COOKIE}=${token}` }));
    expect(res.status).toBe(200);
    const body = await json(res);
    const data = body.data as { authenticated: boolean; user: { email: string }; roleMatrix: Record<string, unknown> };
    expect(data.authenticated).toBe(true);
    expect(data.user.email).toBe("api-user@t.test");
    // role matrix included for the console RBAC panel
    expect(data.roleMatrix).toBeDefined();
    expect(Object.keys(data.roleMatrix).length).toBe(5);
  });

  test("invalid session cookie -> authenticated: false (not an error)", async () => {
    const res = await session(req("/api/auth/session", { cookie: `${SESSION_COOKIE}=garbage` }));
    expect(res.status).toBe(200);
    const body = await json(res);
    expect((body.data as { authenticated: boolean }).authenticated).toBe(false);
  });

  test("logout revokes the session server-side", async () => {
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: "api-user@t.test", password: "Passw0rd!" }, ip: "7.7.7.7" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const out = await logout(req("/api/auth/logout", { method: "POST", cookie: `${SESSION_COOKIE}=${token}` }));
    expect(out.status).toBe(200);
    // the token is dead even before the cookie expires
    const res = await session(req("/api/auth/session", { cookie: `${SESSION_COOKIE}=${token}` }));
    expect(((await json(res)).data as { authenticated: boolean }).authenticated).toBe(false);
    expect(await db.session.count({ where: { id: token } })).toBe(0);
  });
});

describe("catalog: pagination, filtering, sorting, search, visibility", () => {
  test("guests see only PUBLISHED courses, with pagination meta", async () => {
    await mkCourseTree("api-pub-1", { status: "PUBLISHED" });
    await mkCourseTree("api-pub-2", { status: "PUBLISHED" });
    await mkCourseTree("api-draft-1", { status: "DRAFT" });

    const res = await listCourses(req("/api/courses?page=1&pageSize=10"));
    expect(res.status).toBe(200);
    const body = await json(res);
    const data = body.data as { slug: string }[];
    const slugs = data.map((c) => c.slug);
    expect(slugs).toContain("api-pub-1");
    expect(slugs).toContain("api-pub-2");
    expect(slugs).not.toContain("api-draft-1");

    const meta = body.meta as { pagination: { page: number; pageSize: number; total: number; totalPages: number } };
    expect(meta.pagination).toMatchObject({ page: 1, pageSize: 10 });
    expect(meta.pagination.total).toBeGreaterThanOrEqual(2);
  });

  test("staff see drafts too", async () => {
    const staff = await mkUser("api-staff@t.test", "CONTENT_EDITOR");
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: staff.email, password: "Passw0rd!" }, ip: "6.6.6.6" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const res = await listCourses(req("/api/courses?filter[status]=DRAFT", { cookie: `${SESSION_COOKIE}=${token}` }));
    const body = await json(res);
    const slugs = (body.data as { slug: string }[]).map((c) => c.slug);
    expect(slugs).toContain("api-draft-1");
    expect(slugs).not.toContain("api-pub-1");
  });

  test("filter by subject + sort by title + search", async () => {
    // all published courses share the seeded test subject; search narrows by title
    const res = await listCourses(req("/api/courses?search=api-pub&sort=title"));
    expect(res.status).toBe(200);
    const body = await json(res);
    const data = body.data as { slug: string; title: string }[];
    expect(data.length).toBe(2);
    expect(data[0].slug).toBe("api-pub-1"); // sorted by title asc
    expect(data[1].slug).toBe("api-pub-2");
  });

  test("search requires 2+ characters (400)", async () => {
    const res = await listCourses(req("/api/courses?search=a"));
    expect(res.status).toBe(400);
  });

  test("unknown course id -> 404 NOT_FOUND", async () => {
    const res = await getCourseById(req("/api/courses/whatever"), { params: Promise.resolve({ id: "nope" }) } as never);
    expect(res.status).toBe(404);
    const body = await json(res);
    expect((body.error as Json).code).toBe("NOT_FOUND");
  });

  test("every response carries a request id header", async () => {
    const res = await listCourses(req("/api/courses"));
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });
});

describe("RBAC on API routes", () => {
  test("guest cannot create a course (401 without session)", async () => {
    const res = await createCourse(
      req("/api/courses", { method: "POST", body: { slug: "x", title: "X", description: "Y", subjectId: "z" } })
    );
    expect(res.status).toBe(401);
  });

  test("student cannot create a course (403)", async () => {
    const student = await mkUser("api-student@t.test", "STUDENT");
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: student.email, password: "Passw0rd!" }, ip: "5.5.5.5" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const res = await createCourse(
      req("/api/courses", {
        method: "POST",
        cookie: `${SESSION_COOKIE}=${token}`,
        body: { slug: "denied", title: "Denied", description: "Nope", subjectId: "none" },
      })
    );
    expect(res.status).toBe(403);
    expect(((await json(res)).error as Json).code).toBe("FORBIDDEN");
  });

  test("student cannot list users or read platform analytics (403)", async () => {
    const student = await mkUser("api-student2@t.test", "STUDENT");
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: student.email, password: "Passw0rd!" }, ip: "4.4.4.4" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const cookie = `${SESSION_COOKIE}=${token}`;

    const usersRes = await listUsers(req("/api/users", { cookie }));
    expect(usersRes.status).toBe(403);

    const analyticsRes = await analyticsPlatform(req("/api/analytics/platform", { cookie }));
    expect(analyticsRes.status).toBe(403);
  });

  test("admin can list users with pagination", async () => {
    const admin = await mkUser("api-admin@t.test", "ADMINISTRATOR");
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: admin.email, password: "Passw0rd!" }, ip: "3.3.3.3" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const res = await listUsers(req("/api/users?filter[role]=STUDENT", { cookie: `${SESSION_COOKIE}=${token}` }));
    expect(res.status).toBe(200);
    const body = await json(res);
    const users = body.data as { role: { key: string } }[];
    expect(users.length).toBeGreaterThan(0);
    expect(users.every((u) => u.role.key === "STUDENT")).toBe(true);
  });

  test("admin overview + platform analytics work for admins", async () => {
    const admin = await mkUser("api-admin2@t.test", "ADMINISTRATOR");
    const loginRes = await login(
      req("/api/auth/login", { method: "POST", body: { email: admin.email, password: "Passw0rd!" }, ip: "2.2.2.2" })
    );
    const token = extractCookie(loginRes, SESSION_COOKIE)!;
    const cookie = `${SESSION_COOKIE}=${token}`;

    const overviewRes = await overview(req("/api/admin/overview", { cookie }));
    expect(overviewRes.status).toBe(200);
    const body = await json(overviewRes);
    expect((body.data as { platform: { totals: Record<string, number> } }).platform.totals.users).toBeGreaterThan(0);

    const analyticsRes = await analyticsPlatform(req("/api/analytics/platform", { cookie }));
    expect(analyticsRes.status).toBe(200);
    const a = (await json(analyticsRes)).data as { enrollmentTrend14d: unknown[]; topCourses: unknown[] };
    expect(Array.isArray(a.enrollmentTrend14d)).toBe(true);
    expect(a.enrollmentTrend14d.length).toBe(14);
    expect(Array.isArray(a.topCourses)).toBe(true);
  });
});

describe("answer-material protection", () => {
  test("exercise solutionCode is stripped for students, kept for staff", async () => {
    const { course, lessons } = await mkCourseTree("api-secrets");
    const exercise = await mkExercise(lessons[0].id, "42");

    const student = await mkUser("api-peek@t.test", "STUDENT");
    await db.enrollment.create({ data: { userId: student.id, courseId: course.id } });
    const sLogin = await login(
      req("/api/auth/login", { method: "POST", body: { email: student.email, password: "Passw0rd!" }, ip: "1.1.1.1" })
    );
    const sToken = extractCookie(sLogin, SESSION_COOKIE)!;

    const res = await listExercises(req("/api/exercises", { cookie: `${SESSION_COOKIE}=${sToken}` }));
    const body = await json(res);
    const ex = (body.data as { id: string; solutionCode?: string; testCases: { hidden: boolean; expectedOutput?: string }[] }[]).find((e) => e.id === exercise.id)!;
    expect(ex.solutionCode).toBeUndefined();
    expect(ex.testCases.every((tc) => !tc.hidden)).toBe(true); // hidden cases not even listed
    expect(ex.testCases[0].expectedOutput).toBeUndefined(); // keys stripped

    const editor = await mkUser("api-editor@t.test", "CONTENT_EDITOR");
    const eLogin = await login(
      req("/api/auth/login", { method: "POST", body: { email: editor.email, password: "Passw0rd!" }, ip: "1.1.1.2" })
    );
    const eToken = extractCookie(eLogin, SESSION_COOKIE)!;
    const res2 = await listExercises(req("/api/exercises", { cookie: `${SESSION_COOKIE}=${eToken}` }));
    const body2 = await json(res2);
    const ex2 = (body2.data as { id: string; solutionCode: string; testCases: { hidden: boolean; expectedOutput: string }[] }[]).find((e) => e.id === exercise.id)!;
    expect(ex2.solutionCode).toContain("print(42)");
    expect(ex2.testCases.length).toBe(2);
    expect(ex2.testCases[1].hidden).toBe(true);
    expect(ex2.testCases[1].expectedOutput).toBe("42");
  });
});

describe("rate limiting", () => {
  test("11th login within a minute from one IP -> 429 + Retry-After", async () => {
    const ip = "10.20.30.40";
    let saw429 = false;
    for (let i = 0; i < 12; i++) {
      const res = await login(
        req("/api/auth/login", { method: "POST", body: { email: "nobody@t.test", password: "Bad1pass" }, ip })
      );
      if (res.status === 429) {
        saw429 = true;
        expect(res.headers.get("retry-after")).toBeTruthy();
        const body = await json(res);
        expect((body.error as Json).code).toBe("RATE_LIMITED");
        expect(i).toBeGreaterThanOrEqual(10); // limit is 10/min
        break;
      }
      expect(res.status).toBe(401); // failed logins, not other errors
    }
    expect(saw429).toBe(true);
  });

  test("a different IP is not blocked by another client's window", async () => {
    const res = await login(
      req("/api/auth/login", { method: "POST", body: { email: "nobody@t.test", password: "Bad1pass" }, ip: "55.66.77.88" })
    );
    expect(res.status).toBe(401);
  });
});

describe("global search", () => {
  test("finds courses, lessons and glossary across entities", async () => {
    const { chapter } = await mkCourseTree("api-searchable");
    // a lesson whose title actually matches the query
    await db.lesson.create({
      data: { chapterId: chapter.id, title: "Searchable lesson", slug: "searchable-lesson", status: "PUBLISHED", orderIndex: 9 },
    });
    await db.glossaryTerm.create({
      data: { term: "Searchable Term", slug: "searchable-term", definition: "A term about python searching" },
    }).catch(() => undefined);

    const res = await search(req("/api/search?q=searchable"));
    expect(res.status).toBe(200);
    const body = await json(res);
    const data = body.data as { totalHits: number; buckets: Record<string, { total: number }> };
    expect(data.totalHits).toBeGreaterThan(0);
    expect(data.buckets.courses.total).toBe(1);
    expect(data.buckets.lessons.total).toBe(1);
    expect(data.buckets.glossary.total).toBe(1);
  });

  test("rejects short queries (422)", async () => {
    const res = await search(req("/api/search?q=x"));
    expect(res.status).toBe(422);
  });
});
