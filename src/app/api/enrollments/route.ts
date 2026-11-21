import { withApi, parseBody } from "@/lib/api/handler";
import { ok, created } from "@/lib/api/errors";
import { requirePermission } from "@/auth/rbac";
import { listEnrollments, enrollUser } from "@/lib/services/enrollment";
import { db } from "@/lib/db";
import { z } from "zod";

/**
 * GET  /api/enrollments — own enrollments (students) or all (analytics:read-all
 * staff, filterable by user/course/status).
 *
 * POST /api/enrollments — self-service enrollment in a PUBLISHED course
 * (powers the dashboard's course picker; the service creates the eager
 * CourseProgress row and sends the welcome notification).
 */
const enrollCreateSchema = z.object({ courseId: z.string().min(1, "courseId is required") }).strict();

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const user = ctx.user!;
  const sp = ctx.req.nextUrl.searchParams;

  // staff with read-all may list every enrollment
  const canSeeAll = user.permissions.includes("analytics:read-all");
  const userId = canSeeAll && sp.get("userId") ? sp.get("userId")! : user.id;
  if (userId !== user.id && !canSeeAll) {
    requirePermission(user, "analytics:read-all");
  }

  if (userId === user.id && !sp.get("all")) {
    const rows = await listEnrollments(user.id);
    return ok(rows);
  }

  // paginated global view for staff
  const where: Record<string, unknown> = { userId };
  const courseId = sp.get("courseId");
  if (courseId) where.courseId = courseId;
  const status = sp.get("status");
  if (status) where.status = status;

  const rows = await db.enrollment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      course: { select: { id: true, slug: true, title: true, level: true } },
      courseProgress: true,
    },
    orderBy: { enrolledAt: "desc" },
    take: 100,
  });
  return ok(rows);
});

export const POST = withApi({ auth: true, rateLimit: "write", bucket: "enroll-create" }, async (ctx) => {
  const { courseId } = await parseBody(ctx.req, enrollCreateSchema);
  const enrollment = await enrollUser(ctx.user!.id, courseId, "self");
  return created(enrollment, { message: "Enrolled — your first lesson is waiting" });
});
