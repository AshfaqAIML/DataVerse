import { withApi } from "@/lib/api/handler";
import { created, badRequest } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { enrollUser } from "@/lib/services/enrollment";
import { hasPermission } from "@/auth/rbac";

/**
 * POST /api/courses/[id]/enroll — self-enroll in a published course.
 * Body (optional, staff only): { "userId": "..." } to enroll on behalf.
 */
export const POST = withApi({ auth: true, rateLimit: "write", bucket: "enroll" }, async (ctx) => {
  const course = await db.course.findUnique({ where: { id: ctx.params.id } });
  if (!course) throw badRequest("Course not found");

  let targetUserId = ctx.user!.id;

  const hasBody = (ctx.req.headers.get("content-length") ?? "0") !== "0";
  if (hasBody) {
    let body: { userId?: string } = {};
    try {
      body = (await ctx.req.json()) as { userId?: string };
    } catch {
      throw badRequest("Request body must be valid JSON");
    }
    if (body.userId && body.userId !== targetUserId) {
      if (!hasPermission(ctx.user, "user:update")) {
        throw badRequest("Only staff can enroll learners on their behalf");
      }
      targetUserId = body.userId;
    }
  }

  const enrollment = await enrollUser(targetUserId, course.id, targetUserId === ctx.user!.id ? "self" : "admin");
  return created(enrollment, { message: `Enrolled in ${course.title}` });
});
