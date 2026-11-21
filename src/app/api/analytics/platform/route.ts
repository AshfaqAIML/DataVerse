import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { platformOverview } from "@/lib/services/analytics";
import { requirePermission } from "@/auth/rbac";

/**
 * GET /api/analytics/platform — platform-wide KPIs for the admin panel:
 * totals, completion rate, 14-day enrollment trend, top courses, role mix.
 * Requires analytics:read-all.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  requirePermission(ctx.user!, "analytics:read-all");
  const overview = await platformOverview();
  return ok(overview);
});
