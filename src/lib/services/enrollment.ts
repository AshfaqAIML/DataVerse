import { db } from "@/lib/db";
import { AppError, conflict, notFound } from "@/lib/api/errors";
import { notify } from "./notifications";
import type { SessionUser } from "@/auth/session";
import { hasPermission } from "@/auth/rbac";

/**
 * Enrollment service — self-service enroll, admin enroll, drop, complete.
 * Progress + CourseProgress rows are created eagerly so the dashboard and
 * analytics always have a denormalized record to read.
 */

export async function enrollUser(userId: string, courseId: string, source: "self" | "admin" = "self") {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "PUBLISHED") {
    throw new AppError("UNPROCESSABLE", "Course is not open for enrollment (not published)");
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    if (existing.status === "DROPPED") {
      // re-enroll reactivates the record
      const re = await db.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: { status: "ACTIVE", enrolledAt: new Date(), completedAt: null, source },
      });
      await notify(userId, "COURSE", `Re-enrolled: ${course.title}`, "Welcome back — your previous progress is preserved.", "/academy/courses/" + course.slug);
      return re;
    }
    throw conflict("Already enrolled in this course");
  }

  const enrollment = await db.$transaction(async (tx) => {
    const e = await tx.enrollment.create({ data: { userId, courseId, source } });
    // eager CourseProgress so dashboards have a row from day 0
    const lessonsTotal = await tx.lesson.count({ where: { chapter: { module: { courseId } } } });
    await tx.courseProgress.create({
      data: { userId, courseId, enrollmentId: e.id, lessonsTotal },
    });
    return e;
  });

  await notify(
    userId,
    "COURSE",
    `Enrolled: ${course.title}`,
    `You're in! Start with the first lesson of "${course.title}".`,
    "/academy/courses/" + course.slug
  );

  return enrollment;
}

export async function dropEnrollment(userId: string, courseId: string, actor: SessionUser) {
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) throw notFound("Enrollment not found");

  // students may drop their own enrollment; staff with user:update may drop any
  if (enrollment.userId !== actor.id && !hasPermission(actor, "user:update")) {
    throw new AppError("FORBIDDEN", "You can only drop your own enrollment");
  }

  return db.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "DROPPED" },
  });
}

export async function listEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          subject: { select: { id: true, title: true, color: true } },
          _count: { select: { modules: true } },
        },
      },
      courseProgress: true,
    },
    orderBy: { enrolledAt: "desc" },
  });
}
