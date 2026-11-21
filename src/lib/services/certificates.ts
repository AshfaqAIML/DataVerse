import { db } from "@/lib/db";
import { AppError, conflict } from "@/lib/api/errors";
import { notify } from "./notifications";

/**
 * Certificate service.
 *
 * A certificate is issued exactly once per (userId, courseId) — enforced by
 * a UNIQUE constraint — when the learner completes the course. The public
 * `code` (DVA-<year>-<random>) allows offline verification via
 * GET /api/certificates/verify/[code].
 */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 — transcription-safe

function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  let rand = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) rand += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `DVA-${year}-${rand}`;
}

export type CertificateEligibility = {
  eligible: boolean;
  reason?: string;
  lessonsCompleted: number;
  lessonsTotal: number;
};

export async function checkCertificateEligibility(userId: string, courseId: string): Promise<CertificateEligibility> {
  const [enrollment, progress, course] = await Promise.all([
    db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    db.courseProgress.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    db.course.findUnique({ where: { id: courseId }, include: { modules: { include: { chapters: { include: { lessons: true } } } } } }),
  ]);

  if (!course) throw new AppError("NOT_FOUND", "Course not found");
  if (!enrollment) return { eligible: false, reason: "You are not enrolled in this course", lessonsCompleted: 0, lessonsTotal: 0 };
  if (enrollment.status === "DROPPED") return { eligible: false, reason: "Enrollment was dropped", lessonsCompleted: 0, lessonsTotal: 0 };

  const lessonsTotal = course.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons)).length;
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;

  if (lessonsTotal === 0) return { eligible: false, reason: "Course has no lessons yet", lessonsCompleted, lessonsTotal };
  if (lessonsCompleted < lessonsTotal) {
    return { eligible: false, reason: `Complete all lessons first (${lessonsCompleted}/${lessonsTotal} done)`, lessonsCompleted, lessonsTotal };
  }
  return { eligible: true, lessonsCompleted, lessonsTotal };
}

export async function issueCertificate(userId: string, courseId: string) {
  const eligibility = await checkCertificateEligibility(userId, courseId);
  if (!eligibility.eligible) {
    throw new AppError("UNPROCESSABLE", `Certificate not available: ${eligibility.reason}`);
  }

  const existing = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return existing; // idempotent

  const [course, user] = await Promise.all([
    db.course.findUnique({ where: { id: courseId } }),
    db.user.findUnique({ where: { id: userId } }),
  ]);
  if (!course || !user) throw new AppError("NOT_FOUND", "Course or user not found");

  try {
    const certificate = await db.certificate.create({
      data: {
        code: generateCertificateCode(),
        userId,
        courseId,
        title: `DataVerse Academy — ${course.title} Certificate`,
        grade: "PASS",
        metadata: {
          lessonsCompleted: eligibility.lessonsCompleted,
          lessonsTotal: eligibility.lessonsTotal,
          recipient: user.name,
          courseSlug: course.slug,
        },
      },
    });
    await notify(
      userId,
      "COURSE",
      "Certificate issued",
      `Congratulations! Your certificate for "${course.title}" is ready. Verification code: ${certificate.code}`,
      "/academy/certificates"
    );
    return certificate;
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      throw conflict("Certificate already issued for this course");
    }
    throw err;
  }
}
