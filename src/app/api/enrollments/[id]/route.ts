import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { enrollmentUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { dropEnrollment } from "@/lib/services/enrollment";
import { hasPermission } from "@/auth/rbac";
import { notify } from "@/lib/services/notifications";

/**
 * GET    /api/enrollments/[id] — enrollment detail (owner or staff)
 * PATCH  /api/enrollments/[id] — status change: DROP (owner/staff),
 *         COMPLETE/REACTIVATE (staff only — completion normally happens
 *         automatically through the progress engine)
 * DELETE /api/enrollments/[id] — drop (owner/staff)
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const enrollment = await db.enrollment.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, slug: true, title: true, level: true, subject: { select: { title: true, color: true } } } },
      courseProgress: true,
    },
  });
  if (!enrollment) throw notFound("Enrollment not found");
  const staff = hasPermission(ctx.user, "analytics:read-all");
  if (enrollment.userId !== ctx.user!.id && !staff) {
    throw forbidden("This enrollment belongs to another learner");
  }
  return ok(enrollment);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const actor = ctx.user!;
  const enrollment = await db.enrollment.findUnique({ where: { id: ctx.params.id } });
  if (!enrollment) throw notFound("Enrollment not found");

  const isOwner = enrollment.userId === actor.id;
  const staff = hasPermission(actor, "user:update");
  if (!isOwner && !staff) throw forbidden("This enrollment belongs to another learner");

  const { status } = await parseBody(ctx.req, enrollmentUpdateSchema);

  if (status === "DROPPED") {
    const dropped = await dropEnrollment(enrollment.userId, enrollment.courseId, actor);
    return ok(dropped);
  }

  // COMPLETED / ACTIVE transitions are staff-controlled
  if (!staff) throw forbidden("Only staff can change enrollment status beyond dropping");
  if (status === "COMPLETED") {
    throw forbidden("Completion is granted by the progress engine — finish all lessons instead");
  }

  const updated = await db.enrollment.update({
    where: { id: enrollment.id },
    data: { status, completedAt: null },
  });
  if (status === "ACTIVE" && enrollment.status === "DROPPED") {
    await notify(enrollment.userId, "COURSE", "Enrollment reactivated", "Your enrollment was reactivated by the team — welcome back.");
  }
  return ok(updated);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const actor = ctx.user!;
  const enrollment = await db.enrollment.findUnique({ where: { id: ctx.params.id } });
  if (!enrollment) throw notFound("Enrollment not found");
  const dropped = await dropEnrollment(enrollment.userId, enrollment.courseId, actor);
  return ok({ id: dropped.id, status: dropped.status });
});
