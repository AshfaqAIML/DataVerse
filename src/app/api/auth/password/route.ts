import { withApi, parseBody } from "@/lib/api/handler";
import { ok, unauthorized, badRequest } from "@/lib/api/errors";
import { changePasswordSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/auth/password";

/**
 * PATCH /api/auth/password — change own password.
 * All other sessions are revoked after a successful change.
 */
export const PATCH = withApi({ auth: true, rateLimit: "auth" }, async (ctx) => {
  const { currentPassword, newPassword } = await parseBody(ctx.req, changePasswordSchema);
  const user = await db.user.findUnique({ where: { id: ctx.user!.id } });
  if (!user) throw unauthorized();

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw badRequest("Current password is incorrect");

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  // revoke every session (force re-login everywhere)
  await db.session.deleteMany({ where: { userId: user.id } });

  const res = ok({ changed: true, sessionsRevoked: true });
  return res;
});
