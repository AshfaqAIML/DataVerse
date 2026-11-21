import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { getSubmission } from "@/lib/services/submissions";
import { hasPermission } from "@/auth/rbac";

/**
 * GET /api/submissions/[id] — submission detail with per-test-case results
 * (owner or staff). Grading evidence for exercise review.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const staff = hasPermission(ctx.user, "submission:review");
  const submission = await getSubmission(ctx.user!.id, ctx.params.id, staff);
  return ok(submission);
});
