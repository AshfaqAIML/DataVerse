import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { getSessionUser } from "@/auth/session";
import { ROLE_PERMISSIONS, ROLE_LABELS, type RoleKey } from "@/lib/domain/constants";

/**
 * GET /api/auth/session — current session (user + permissions) or null.
 * Public so the shell can render the right nav for guests.
 */
export const GET = withApi({ rateLimit: "read" }, async (ctx) => {
  const user = await getSessionUser(ctx.req);
  return ok({
    authenticated: !!user,
    user,
    // static role matrix powers the console RBAC panel (mirrors DB seed)
    roleMatrix: Object.fromEntries(
      (Object.keys(ROLE_PERMISSIONS) as RoleKey[]).map((k) => [
        k,
        { name: ROLE_LABELS[k], permissions: ROLE_PERMISSIONS[k] },
      ])
    ),
  });
});
