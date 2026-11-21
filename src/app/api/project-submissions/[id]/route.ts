import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { projectReviewSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hasPermission, requirePermission } from "@/auth/rbac";
import { notify } from "@/lib/services/notifications";

/**
 * GET   /api/project-submissions/[id] — submission detail (owner or staff)
 * PATCH /api/project-submissions/[id] — review (project:review staff):
 *         status/score/feedback; notifies the learner.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const submission = await db.projectSubmission.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      project: { select: { id: true, title: true, brief: true, requirements: true, points: true, course: { select: { id: true, slug: true, title: true } } } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });
  if (!submission) throw notFound("Submission not found");
  if (submission.userId !== ctx.user!.id && !hasPermission(ctx.user, "project:review")) {
    throw forbidden("This submission belongs to another learner");
  }
  return ok(submission);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  requirePermission(ctx.user!, "project:review");
  const submission = await db.projectSubmission.findUnique({
    where: { id: ctx.params.id },
    include: { project: { select: { title: true } } },
  });
  if (!submission) throw notFound("Submission not found");

  const data = await parseBody(ctx.req, projectReviewSchema);

  const updated = await db.projectSubmission.update({
    where: { id: submission.id },
    data: {
      status: data.status,
      score: data.score,
      feedback: data.feedback,
      reviewedById: ctx.user!.id,
      reviewedAt: new Date(),
    },
    include: { reviewedBy: { select: { id: true, name: true } } },
  });

  await notify(
    submission.userId,
    "COURSE",
    `Capstone review: ${data.status.toLowerCase().replace("_", " ")}`,
    `${ctx.user!.name} reviewed your submission for "${submission.project.title}"${data.score !== undefined ? ` — score ${data.score}/100` : ""}.`,
    "/academy/projects"
  );

  return ok(updated);
});
