import { withApi, parseBody } from "@/lib/api/handler";
import { created, paginated } from "@/lib/api/errors";
import { certificateIssueSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hasPermission, requirePermission } from "@/auth/rbac";
import { issueCertificate } from "@/lib/services/certificates";
import { combineWhere, listWithPagination, parsePagination, parseSearch, parseSort } from "@/lib/api/query";

/**
 * GET  /api/certificates — own certificates (staff: all).
 * POST /api/certificates — issue: self-service after completing a course
 *       (or staff with certificate:issue on behalf via { userId }).
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["issuedAt", "title"]);
  const search = parseSearch(ctx.req, ["title", "code"]);
  const sp = ctx.req.nextUrl.searchParams;

  const staff = hasPermission(ctx.user, "certificate:issue") || hasPermission(ctx.user, "analytics:read-all");
  const whereParts: Record<string, unknown>[] = [];
  if (staff) {
    const userId = sp.get("userId");
    if (userId) whereParts.push({ userId });
  } else {
    whereParts.push({ userId: ctx.user!.id });
  }
  if (search) whereParts.push({ OR: search.fields.map((f) => ({ [f]: { contains: search.q } })) });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { issuedAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.certificate.findMany({
        where,
        orderBy,
        ...a,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
          course: { select: { id: true, slug: true, title: true, level: true, subject: { select: { title: true, color: true } } } },
        },
      }),
    () => db.certificate.count({ where }),
    page,
    pageSize
  );
  return paginated(items, meta);
});

export const POST = withApi({ auth: true, rateLimit: "write", bucket: "cert-issue" }, async (ctx) => {
  const { courseId, userId } = await parseBody(ctx.req, certificateIssueSchema);
  const targetUserId = userId ?? ctx.user!.id;

  if (targetUserId !== ctx.user!.id) {
    requirePermission(ctx.user!, "certificate:issue");
  }

  const certificate = await issueCertificate(targetUserId, courseId);
  return created(certificate, { message: "Certificate issued — share your verification code!" });
});

