import { withApi, parseQuery } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { z } from "zod";
import { studentOverview } from "@/lib/services/analytics";
import { assertAnalyticsScope } from "@/lib/services/analytics";

/**
 * GET /api/analytics/overview — learner dashboard analytics.
 * ?userId=... for any learner (staff with analytics:read-all); default self.
 */
const querySchema = z.object({ userId: z.string().optional() });

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const q = parseQuery(ctx.req, querySchema);
  const targetUserId = q.userId ?? ctx.user!.id;
  assertAnalyticsScope(ctx.user!, targetUserId);
  const overview = await studentOverview(targetUserId);
  return ok(overview);
});
