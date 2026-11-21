import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { studentDashboard } from "@/lib/services/analytics";

/**
 * GET /api/analytics/dashboard — the personalized student-dashboard payload
 * (weekly activity, today's goal counters, day streak, skills, revision
 * recommendations, continue-learning pointers, unified activity feed).
 * Own data only — computed live from the progress tables.
 */
export const GET = withApi({ auth: true, rateLimit: "read", bucket: "analytics-dashboard" }, async (ctx) => {
  const dashboard = await studentDashboard(ctx.user!.id);
  return ok(dashboard);
});
