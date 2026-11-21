import { withApi } from "@/lib/api/handler";
import { ok, notFound } from "@/lib/api/errors";
import { db } from "@/lib/db";

/**
 * GET /api/certificates/verify/[code] — public certificate verification.
 * Returns only the shareable facts (never full learner data).
 */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const certificate = await db.certificate.findUnique({
    where: { code: ctx.params.code },
    include: {
      user: { select: { name: true, headline: true } },
      course: { select: { title: true, level: true, estimatedHours: true, subject: { select: { title: true } } } },
    },
  });
  if (!certificate) throw notFound("No certificate found for this verification code");

  return ok({
    valid: true,
    code: certificate.code,
    issuedAt: certificate.issuedAt,
    grade: certificate.grade,
    recipient: {
      name: certificate.user.name,
      headline: certificate.user.headline,
    },
    course: {
      title: certificate.course.title,
      level: certificate.course.level,
      estimatedHours: certificate.course.estimatedHours,
      subject: certificate.course.subject.title,
    },
    metadata: certificate.metadata,
  });
});
