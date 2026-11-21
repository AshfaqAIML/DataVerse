import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { roleUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { requirePermission } from "@/auth/rbac";

/**
 * GET   /api/roles/[id] — role detail with permissions
 * PATCH /api/roles/[id] — update role metadata (user:manage-role, admin)
 */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const role = await db.role.findUnique({
    where: { id: ctx.params.id },
    include: {
      rolePermissions: { include: { permission: { select: { key: true, description: true } } } },
      _count: { select: { users: true } },
    },
  });
  if (!role) throw notFound("Role not found");
  return ok(role);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  requirePermission(ctx.user!, "user:manage-role");
  const data = await parseBody(ctx.req, roleUpdateSchema);
  const role = await db.role.update({
    where: { id: ctx.params.id },
    data,
    include: { rolePermissions: { include: { permission: true } }, _count: { select: { users: true } } },
  });
  return ok(role);
});
