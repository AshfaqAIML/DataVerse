import { withApi, parseQuery } from "@/lib/api/handler";
import { ok, badRequest } from "@/lib/api/errors";
import { z } from "zod";
import { getCourseProgressOverview } from "@/lib/services/progress";
import { hasPermission } from "@/auth/rbac";

/**
 * GET /api/progress/overview?courseId=... — the course progress tree for the
 * learner dashboard (modules → lessons with per-lesson status).
 * Staff may query any learner via ?userId=.
 */
const querySchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  userId: z.string().optional(),
});

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const q = parseQuery(ctx.req, querySchema);
  let targetUserId = ctx.user!.id;
  if (q.userId && q.userId !== targetUserId) {
    if (!hasPermission(ctx.user, "analytics:read-all")) {
      throw badRequest("You can only view your own progress");
    }
    targetUserId = q.userId;
  }
  const overview = await getCourseProgressOverview(targetUserId, q.courseId);
  return ok(overview);
});
