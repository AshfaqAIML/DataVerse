import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden, badRequest, conflict } from "@/lib/api/errors";
import { userUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { canManageUser, isAdmin, hasPermission } from "@/auth/rbac";

/**
 * GET    /api/users/[id]   — profile (user:read, or self)
 * PATCH  /api/users/[id]   — update profile (self) / role+status (user:update)
 * DELETE /api/users/[id]   — delete user (user:delete); last admin protected
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const target = await db.user.findUnique({
    where: { id: ctx.params.id },
    select: {
      id: true, email: true, name: true, avatarUrl: true, headline: true, bio: true,
      status: true, createdAt: true,
      role: { select: { id: true, key: true, name: true } },
      _count: { select: { enrollments: true, certificates: true, achievementUnlocks: true, taughtCourses: true, discussions: true } },
    },
  });
  if (!target) throw notFound("User not found");

  const self = target.id === ctx.user?.id;
  if (!self && !hasPermission(ctx.user, "user:read")) throw forbidden("Missing permission: user:read");
  return ok(target);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const actor = ctx.user!;
  const target = await db.user.findUnique({ where: { id: ctx.params.id } });
  if (!target) throw notFound("User not found");

  const self = target.id === actor.id;
  if (!self && !hasPermission(actor, "user:update")) {
    throw forbidden("Missing permission: user:update");
  }

  const data = await parseBody(ctx.req, userUpdateSchema);

  // role management is admin-only (user:manage-role) — even for self
  if (data.roleId !== undefined) {
    if (!hasPermission(actor, "user:manage-role")) throw forbidden("Missing permission: user:manage-role");
    const role = await db.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw badRequest("Unknown roleId");
    // never demote the last administrator
    if (target.roleId !== role.id && (await isLastAdmin(target.id, target.roleId))) {
      throw conflict("Cannot change the role of the last administrator");
    }
  }
  // status changes require user:update (admins)
  if (data.status !== undefined && !hasPermission(actor, "user:update")) {
    throw forbidden("Missing permission: user:update");
  }
  // non-admins can only edit their own profile fields
  if (!isAdmin(actor)) {
    delete (data as Record<string, unknown>).roleId;
    delete (data as Record<string, unknown>).status;
  }

  const updated = await db.user.update({
    where: { id: target.id },
    data,
    select: { id: true, name: true, email: true, headline: true, bio: true, avatarUrl: true, status: true, role: { select: { key: true, name: true } } },
  });
  return ok(updated);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const actor = ctx.user!;
  if (!hasPermission(actor, "user:delete")) throw forbidden("Missing permission: user:delete");
  const target = await db.user.findUnique({ where: { id: ctx.params.id } });
  if (!target) throw notFound("User not found");
  if (target.id === actor.id) throw badRequest("You cannot delete your own account");
  if (await isLastAdmin(target.id, target.roleId)) {
    throw conflict("Cannot delete the last administrator");
  }

  await db.user.delete({ where: { id: target.id } }); // cascades sessions/progress/etc.
  return ok({ id: target.id, deleted: true });
});

async function isLastAdmin(userId: string, roleId: string): Promise<boolean> {
  const adminRole = await db.role.findUnique({ where: { key: "ADMINISTRATOR" } });
  if (!adminRole || roleId !== adminRole.id) return false;
  const admins = await db.user.count({ where: { roleId: adminRole.id, id: { not: userId } } });
  return admins === 0;
}

