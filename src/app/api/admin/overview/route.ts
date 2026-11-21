import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { requirePermission } from "@/auth/rbac";
import { platformOverview } from "@/lib/services/analytics";

/**
 * GET /api/admin/overview — the content administration panel:
 * platform KPIs, content pipeline by status, recent signups, role mix.
 * Requires user:read (admins, and instructors see a scoped subset).
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  requirePermission(ctx.user!, "user:read");

  const [platform, coursesByStatus, lessonsByStatus, recentUsers, recentSubmissions] = await Promise.all([
    platformOverview(),
    db.course.groupBy({ by: ["status"], _count: true }),
    db.lesson.groupBy({ by: ["status"], _count: true }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true, role: { select: { key: true, name: true } }, _count: { select: { enrollments: true } } },
    }),
    db.projectSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 5,
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      include: { user: { select: { name: true } }, project: { select: { title: true } } },
    }),
  ]);

  return ok({
    platform,
    contentPipeline: {
      courses: Object.fromEntries(coursesByStatus.map((c) => [c.status, c._count])),
      lessons: Object.fromEntries(lessonsByStatus.map((l) => [l.status, l._count])),
    },
    recentUsers,
    reviewQueue: recentSubmissions.map((s) => ({
      id: s.id,
      projectTitle: s.project.title,
      user: s.user.name,
      status: s.status,
      submittedAt: s.submittedAt,
    })),
  });
});
