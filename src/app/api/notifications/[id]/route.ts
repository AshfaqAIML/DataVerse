import { withApi } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { db } from "@/lib/db";

/**
 * PATCH  /api/notifications/[id] — mark own notification read/unread
 * DELETE /api/notifications/[id] — delete own notification
 */
export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const notification = await db.notification.findUnique({ where: { id: ctx.params.id } });
  if (!notification) throw notFound("Notification not found");
  if (notification.userId !== ctx.user!.id) throw forbidden("This notification belongs to another user");

  const updated = await db.notification.update({
    where: { id: notification.id },
    data: { readAt: notification.readAt ? null : new Date() },
  });
  return ok(updated);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const notification = await db.notification.findUnique({ where: { id: ctx.params.id } });
  if (!notification) throw notFound("Notification not found");
  if (notification.userId !== ctx.user!.id) throw forbidden("This notification belongs to another user");

  await db.notification.delete({ where: { id: notification.id } });
  return ok({ id: notification.id, deleted: true });
});
