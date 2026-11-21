import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { getAttempt } from "@/lib/services/assessment";
import { hasPermission } from "@/auth/rbac";

/**
 * GET /api/assessment-attempts/[id] — attempt detail with questions.
 * Answer keys (isCorrect) are hidden until the attempt is GRADED.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const staff = hasPermission(ctx.user, "analytics:read-all");
  const result = await getAttempt(ctx.user!.id, ctx.params.id, staff);
  return ok(result);
});
