import { withApi, parseBody } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/errors";
import { exerciseSubmitSchema } from "@/lib/domain/schemas";
import { submitSolution } from "@/lib/services/submissions";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";

/**
 * POST /api/exercises/[id]/submissions — submit code against the exercise's
 * test cases. Runs through the CodeRunner (JS: node:vm sandbox; Python:
 * isolated child process with hard timeout), stores per-case results,
 * updates lesson best-score and achievements. Hidden cases are masked.
 *
 * GET /api/exercises/[id]/submissions — submissions for this exercise
 * (own, or all for staff with submission:review).
 */
export const POST = withApi({ auth: true, rateLimit: "write", bucket: "submit-solution" }, async (ctx) => {
  const { code, language } = await parseBody(ctx.req, exerciseSubmitSchema);
  const result = await submitSolution(ctx.user!.id, ctx.params.id, code, language);
  return created(result, {
    message:
      result.results.every((r) => r.passed)
        ? `All tests passed (${result.results.length} cases)`
        : `${result.results.filter((r) => r.passed).length}/${result.results.length} tests passed`,
  });
});

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const exercise = await db.exercise.findUnique({ where: { id: ctx.params.id }, select: { id: true } });
  if (!exercise) return ok([]);
  const staff = hasPermission(ctx.user, "submission:review");
  const submissions = await db.submission.findMany({
    where: staff ? { exerciseId: exercise.id } : { exerciseId: exercise.id, userId: ctx.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  return ok(submissions);
});
