import { withApi, parseBody } from "@/lib/api/handler";
import { ok, unauthorized } from "@/lib/api/errors";
import { loginSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { verifyPassword } from "@/auth/password";
import { createSession, setSessionCookie, type SessionUser } from "@/auth/session";
import { clientIp } from "@/lib/api/rate-limit";
import type { Permission, RoleKey } from "@/lib/domain/constants";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/login — password login, opaque session cookie.
 * Uniform "invalid credentials" response prevents user enumeration;
 * failures are logged (with ip) for brute-force monitoring.
 */
export const POST = withApi({ rateLimit: "auth", bucket: "auth:login" }, async (ctx) => {
  const { email, password } = await parseBody(ctx.req, loginSchema);

  const user = await db.user.findUnique({
    where: { email },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });

  const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    logger.warn("login_failed", { email, ip: clientIp(ctx.req) });
    throw unauthorized("Invalid email or password");
  }
  if (user.status !== "ACTIVE") {
    throw unauthorized("This account is not active — contact support");
  }

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
    role: user.role.key as RoleKey,
    permissions: user.role.rolePermissions.map((rp) => rp.permission.key as Permission),
  };

  const res = ok({ user: sessionUser });
  setSessionCookie(res, token, expiresAt);
  return res;
});
