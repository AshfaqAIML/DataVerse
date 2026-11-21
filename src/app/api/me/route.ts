import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound } from "@/lib/api/errors";
import { meUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/auth/session";
import { studentOverview } from "@/lib/services/analytics";

/** GET /api/me — own profile + learner dashboard payload. */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const user = await requireSessionUser(ctx.req);
  const userRow = await db.user.findUnique({
    where: { id: user.id },
    include: { role: { select: { key: true, name: true } } },
  });
  if (!userRow) throw notFound("User not found");

  const overview = userRow.role.key === "STUDENT" ? await studentOverview(user.id) : null;

  return ok({
    user: {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      avatarUrl: userRow.avatarUrl,
      headline: userRow.headline,
      bio: userRow.bio,
      role: userRow.role,
      createdAt: userRow.createdAt,
    },
    overview,
  });
});

/** PATCH /api/me — update own profile fields. */
export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const user = await requireSessionUser(ctx.req);
  const data = await parseBody(ctx.req, meUpdateSchema);
  const updated = await db.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, avatarUrl: true, headline: true, bio: true },
  });
  return ok(updated);
});
