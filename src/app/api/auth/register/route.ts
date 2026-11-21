import { withApi, parseBody } from "@/lib/api/handler";
import { created, conflict, badRequest } from "@/lib/api/errors";
import { registerSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hashPassword } from "@/auth/password";
import { createSession, setSessionCookie, type SessionUser } from "@/auth/session";
import { clientIp } from "@/lib/api/rate-limit";
import type { Permission, RoleKey } from "@/lib/domain/constants";

/**
 * POST /api/auth/register — create a STUDENT account and start a session.
 * Roles are assigned, never self-selected; staff accounts are provisioned
 * by an administrator through PATCH /api/users/[id].
 */
export const POST = withApi({ rateLimit: "auth", bucket: "auth:register" }, async (ctx) => {
  const { email, password, name, headline } = await parseBody(ctx.req, registerSchema);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw conflict("An account with this email already exists");

  const studentRole = await db.role.findUnique({
    where: { key: "STUDENT" },
    include: { rolePermissions: { include: { permission: true } } },
  });
  if (!studentRole) throw badRequest("Roles not initialized — run the database seed first");

  const user = await db.user.create({
    data: {
      email,
      name,
      headline,
      passwordHash: await hashPassword(password),
      roleId: studentRole.id,
    },
  });

  const { token, expiresAt } = await createSession(user.id, {
    ip: clientIp(ctx.req),
    userAgent: ctx.req.headers.get("user-agent") ?? undefined,
  });

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    headline: user.headline,
    status: user.status,
    role: studentRole.key as RoleKey,
    permissions: studentRole.rolePermissions.map((rp) => rp.permission.key as Permission),
  };

  const res = created({ user: sessionUser }, { message: "Welcome to DataVerse Academy" });
  setSessionCookie(res, token, expiresAt);
  return res;
});
