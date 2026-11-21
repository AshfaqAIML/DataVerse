import { ROLE_RANK, type Permission, type RoleKey } from "@/lib/domain/constants";
import { forbidden } from "@/lib/api/errors";
import type { SessionUser } from "./session";

/**
 * Role-based access control guards.
 *
 * Permission catalogue + role matrix live in src/lib/domain/constants.ts
 * (mirrored into the DB by prisma/seed.ts). Guards are pure functions so
 * they are directly unit-testable.
 */

export function hasPermission(user: Pick<SessionUser, "permissions"> | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: Pick<SessionUser, "permissions"> | null | undefined,
  ...permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function requirePermission(user: SessionUser, permission: Permission | Permission[]): SessionUser {
  const needed = Array.isArray(permission) ? permission : [permission];
  if (!needed.some((p) => user.permissions.includes(p))) {
    throw forbidden(`Missing required permission: ${needed.join(" | ")}`);
  }
  return user;
}

export function requireRole(user: SessionUser, ...roles: RoleKey[]): SessionUser {
  if (!roles.includes(user.role)) {
    throw forbidden(`Requires role: ${roles.join(" | ")} (you are ${user.role})`);
  }
  return user;
}

export function requireRoleRank(user: SessionUser, minRank: number): SessionUser {
  if (ROLE_RANK[user.role] < minRank) {
    throw forbidden(`Insufficient role rank (need >= ${minRank})`);
  }
  return user;
}

/** Can `actor` manage records owned by `targetUserId`? Admins and self only. */
export function canManageUser(actor: SessionUser, targetUserId: string): boolean {
  return actor.role === "ADMINISTRATOR" || actor.id === targetUserId;
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return !!user && user.role === "ADMINISTRATOR";
}

export function isStaff(user: SessionUser | null | undefined): boolean {
  return !!user && ROLE_RANK[user.role] >= ROLE_RANK.INSTRUCTOR;
}
