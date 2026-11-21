import { withApi, parseBody } from "@/lib/api/handler";
import { created, ok, notFound, forbidden } from "@/lib/api/errors";
import { projectSubmitSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";
import { notify } from "@/lib/services/notifications";

/**
 * POST /api/projects/[id]/submissions — submit a capstone project
 * (repo URL + notes). Requires enrollment; notifies the instructor.
 *
 * GET  /api/projects/[id]/submissions — submissions for this project
 * (own, or all for staff with project:review).
 */
export const POST = withApi({ auth: true, rateLimit: "write", bucket: "project-submit" }, async (ctx) => {
  const project = await db.project.findUnique({
    where: { id: ctx.params.id },
    include: { course: { include: { instructor: { select: { id: true } } } } },
  });
  if (!project) throw notFound("Project not found");

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: ctx.user!.id, courseId: project.courseId } },
  });
  if (!enrollment || enrollment.status === "DROPPED") {
    throw forbidden("Enroll in the course before submitting the capstone");
  }

  const body = await parseBody(ctx.req, projectSubmitSchema);
  if (!body.repoUrl && !body.artifactsUrl && !body.notes) {
    throw forbidden("Submit at least a repository URL, an artifacts URL or notes");
  }

  const submission = await db.projectSubmission.create({
    data: {
      projectId: project.id,
      userId: ctx.user!.id,
      repoUrl: body.repoUrl,
      artifactsUrl: body.artifactsUrl,
      notes: body.notes,
      status: "SUBMITTED",
    },
    include: { user: { select: { id: true, name: true } } },
  });

  if (project.course.instructorId) {
    await notify(
      project.course.instructorId,
      "COURSE",
      `New capstone submission: ${project.title}`,
      `${submission.user.name} submitted their capstone for review.`,
      "/academy/projects"
    );
  }
  await notify(
    ctx.user!.id,
    "COURSE",
    "Capstone submitted",
    `Your submission for "${project.title}" is in the review queue.`,
    "/academy/projects"
  );

  return created(submission, { message: "Capstone submitted — under review" });
});

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const project = await db.project.findUnique({ where: { id: ctx.params.id }, select: { id: true } });
  if (!project) throw notFound("Project not found");

  const staff = hasPermission(ctx.user, "project:review");
  const submissions = await db.projectSubmission.findMany({
    where: staff ? { projectId: project.id } : { projectId: project.id, userId: ctx.user!.id },
    orderBy: { submittedAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });
  return ok(submissions);
});
