import { withApi, parseBody } from "@/lib/api/handler";
import { created, paginated, notFound } from "@/lib/api/errors";
import { notificationCreateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { requirePermission } from "@/auth/rbac";
import { combineWhere, listWithPagination, parsePagination, parseSort } from "@/lib/api/query";

/**
 * GET  /api/notifications — own notifications (filter[read]=true|false)
 * POST /api/notifications — broadcast to a user (notification:send, staff)
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["createdAt", "readAt"]);
  const sp = ctx.req.nextUrl.searchParams;

  const whereParts: Record<string, unknown>[] = [{ userId: ctx.user!.id }];
  const read = sp.get("filter[read]");
  if (read === "true") whereParts.push({ readAt: { not: null } });
  if (read === "false") whereParts.push({ readAt: null });
  const kind = sp.get("filter[kind]");
  if (kind) whereParts.push({ kind });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { createdAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) => db.notification.findMany({ where, orderBy, ...a }),
    () => db.notification.count({ where }),
    page,
    pageSize
  );

  const unread = await db.notification.count({ where: { userId: ctx.user!.id, readAt: null } });
  return paginated(items, meta, { unread });
});

export const POST = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  requirePermission(ctx.user!, "notification:send");
  const data = await parseBody(ctx.req, notificationCreateSchema);
  const target = await db.user.findUnique({ where: { id: data.userId }, select: { id: true, name: true } });
  if (!target) throw notFound("Target user not found");
  const notification = await db.notification.create({ data });
  return created(notification, { message: `Notification sent to ${target.name}` });
});

