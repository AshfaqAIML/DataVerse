import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { courseAnalytics } from "@/lib/services/analytics";
import { requirePermission } from "@/auth/rbac";

/**
 * GET /api/analytics/courses/[id] — per-course funnel analytics.
 * Staff (analytics:read-all); enrolled learners may see their own course
 * standings through /api/progress/overview instead.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  requirePermission(ctx.user!, "analytics:read-all");
  const analytics = await courseAnalytics(ctx.params.id);
  return ok(analytics);
});

