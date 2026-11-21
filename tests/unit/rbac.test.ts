import "../__setup";
import { describe, expect, test } from "bun:test";
import { ROLE_PERMISSIONS, ROLE_RANK, type RoleKey } from "@/lib/domain/constants";
import { hasPermission, requirePermission, requireRole, isAdmin, isStaff } from "@/auth/rbac";
import { AppError } from "@/lib/api/errors";
import type { SessionUser } from "@/auth/session";

function fakeUser(role: RoleKey, permissions?: string[]): SessionUser {
  return {
    id: "u1",
    email: "u@t.test",
    name: "U",
    avatarUrl: null,
    headline: null,
    status: "ACTIVE",
    role,
    permissions: (permissions ?? [...ROLE_PERMISSIONS[role]]) as SessionUser["permissions"],
  };
}

describe("RBAC permission matrix", () => {
  test("matrix covers all 5 roles", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual(
      ["ADMINISTRATOR", "CONTENT_EDITOR", "GUEST", "INSTRUCTOR", "STUDENT"].sort()
    );
  });

  test("guest can only read the catalog", () => {
    const guest = fakeUser("GUEST");
    expect(hasPermission(guest, "catalog:read")).toBe(true);
    expect(hasPermission(guest, "content:create")).toBe(false);
    expect(hasPermission(guest, "user:read")).toBe(false);
  });

  test("student can study but not author content", () => {
    const student = fakeUser("STUDENT");
    for (const p of ["catalog:read", "submission:submit", "progress:write", "note:write", "bookmark:write", "ai:use", "analytics:read-own"]) {
      expect(hasPermission(student, p as never)).toBe(true);
    }
    for (const p of ["content:create", "content:publish", "user:read", "submission:review", "analytics:read-all"]) {
      expect(hasPermission(student, p as never)).toBe(false);
    }
  });

  test("instructor can author + review but not publish or delete", () => {
    const instructor = fakeUser("INSTRUCTOR");
    expect(hasPermission(instructor, "content:create")).toBe(true);
    expect(hasPermission(instructor, "submission:review")).toBe(true);
    expect(hasPermission(instructor, "content:publish")).toBe(false);
    expect(hasPermission(instructor, "content:delete")).toBe(false);
    expect(hasPermission(instructor, "user:manage-role")).toBe(false);
  });

  test("content editor owns the publishing pipeline", () => {
    const editor = fakeUser("CONTENT_EDITOR");
    expect(hasPermission(editor, "content:publish")).toBe(true);
    expect(hasPermission(editor, "content:delete")).toBe(true);
    expect(hasPermission(editor, "submission:review")).toBe(false);
    expect(hasPermission(editor, "user:delete")).toBe(false);
  });

  test("administrator holds every permission", () => {
    const admin = fakeUser("ADMINISTRATOR");
    for (const p of ROLE_PERMISSIONS.ADMINISTRATOR) {
      expect(hasPermission(admin, p)).toBe(true);
    }
  });

  test("role rank ordering: guest < student < instructor < editor < admin", () => {
    expect(ROLE_RANK.GUEST).toBeLessThan(ROLE_RANK.STUDENT);
    expect(ROLE_RANK.STUDENT).toBeLessThan(ROLE_RANK.INSTRUCTOR);
    expect(ROLE_RANK.INSTRUCTOR).toBeLessThan(ROLE_RANK.CONTENT_EDITOR);
    expect(ROLE_RANK.CONTENT_EDITOR).toBeLessThan(ROLE_RANK.ADMINISTRATOR);
  });
});

describe("RBAC guards", () => {
  test("requirePermission passes with the right permission", () => {
    const editor = fakeUser("CONTENT_EDITOR");
    expect(requirePermission(editor, "content:publish").id).toBe("u1");
  });

  test("requirePermission throws FORBIDDEN (403) without it", () => {
    const student = fakeUser("STUDENT");
    try {
      requirePermission(student, "content:publish");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).status).toBe(403);
      expect((err as AppError).code).toBe("FORBIDDEN");
    }
  });

  test("requireRole accepts any of the allowed roles", () => {
    expect(requireRole(fakeUser("ADMINISTRATOR"), "INSTRUCTOR", "ADMINISTRATOR").role).toBe("ADMINISTRATOR");
  });

  test("requireRole rejects outsiders with 403", () => {
    try {
      requireRole(fakeUser("STUDENT"), "INSTRUCTOR", "CONTENT_EDITOR");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AppError).status).toBe(403);
    }
  });

  test("isAdmin / isStaff helpers handle nulls", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isStaff(null)).toBe(false);
    expect(isAdmin(fakeUser("ADMINISTRATOR"))).toBe(true);
    expect(isStaff(fakeUser("INSTRUCTOR"))).toBe(true);
    expect(isStaff(fakeUser("STUDENT"))).toBe(false);
  });

  test("hasPermission handles null/undefined users", () => {
    expect(hasPermission(null, "catalog:read")).toBe(false);
    expect(hasPermission(undefined, "catalog:read")).toBe(false);
  });
});
