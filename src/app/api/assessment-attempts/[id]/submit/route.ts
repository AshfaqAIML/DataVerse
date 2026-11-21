import { withApi, parseBody } from "@/lib/api/handler";
import { created } from "@/lib/api/errors";
import { attemptSubmitSchema } from "@/lib/domain/schemas";
import { submitAttempt } from "@/lib/services/assessment";

/**
 * POST /api/assessment-attempts/[id]/submit — submit answers for an
 * IN_PROGRESS attempt. Server-side deterministic grading; per-question
 * correctness, lesson best-score and achievements update as side effects.
 */
export const POST = withApi({ auth: true, rateLimit: "write", bucket: "attempt-submit" }, async (ctx) => {
  const { answers } = await parseBody(ctx.req, attemptSubmitSchema);
  const result = await submitAttempt(ctx.user!.id, ctx.params.id, answers);
  return created(result, {
    message: result.grade.passed
      ? `Passed with ${result.grade.score}%`
      : `Scored ${result.grade.score}% — below the passing score`,
  });
});
