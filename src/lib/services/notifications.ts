import { db } from "@/lib/db";
import type { NOTIFICATION_KINDS } from "@/lib/domain/constants";
import { logger } from "@/lib/logger";

/**
 * Notification service — writes in-app notifications and (production)
 * fans out through the BullMQ `notifications` queue (ADR-008). The queue
 * worker handles email/push transport; this module owns the payload.
 */

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export async function notify(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string,
  link?: string
) {
  try {
    return await db.notification.create({
      data: { userId, kind, title, body, link },
    });
  } catch (err) {
    // notification failure must never break the business operation
    logger.warn("notification_failed", { userId, kind, err: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function notifyMany(
  userIds: string[],
  kind: NotificationKind,
  title: string,
  body: string,
  link?: string
) {
  if (userIds.length === 0) return;
  await Promise.all(userIds.map((id) => notify(id, kind, title, body, link)));
}
