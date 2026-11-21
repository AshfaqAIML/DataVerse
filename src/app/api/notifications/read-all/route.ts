import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { db } from "@/lib/db";

/** POST /api/notifications/read-all — mark all own notifications as read. */
export const POST = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const result = await db.notification.updateMany({
    where: { userId: ctx.user!.id, readAt: null },
    data: { readAt: new Date() },
  });
  return ok({ updated: result.count });
});
