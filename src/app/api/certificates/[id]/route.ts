import { withApi } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";

/**
 * GET /api/certificates/[id] — certificate detail (owner or staff).
 * Public verification without auth: GET /api/certificates/verify/[code].
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const certificate = await db.certificate.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      course: { select: { id: true, slug: true, title: true, level: true, estimatedHours: true, subject: { select: { title: true, color: true } } } },
    },
  });
  if (!certificate) throw notFound("Certificate not found");
  if (certificate.userId !== ctx.user!.id && !hasPermission(ctx.user, "analytics:read-all")) {
    throw forbidden("This certificate belongs to another learner");
  }
  return ok(certificate);
});
