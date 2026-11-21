import { withApi, parseQuery } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { z } from "zod";
import { searchAll } from "@/lib/services/search";

/**
 * GET /api/search?q=... — cross-entity search across courses, lessons,
 * glossary terms and (for authenticated users) discussions.
 */
const querySchema = z.object({ q: z.string().trim().min(2, "Search query must be at least 2 characters").max(100) });

export const GET = withApi({ auth: false, rateLimit: "search" }, async (ctx) => {
  const { q } = parseQuery(ctx.req, querySchema);
  const results = await searchAll(q, !!ctx.user);
  return ok(results);
});
