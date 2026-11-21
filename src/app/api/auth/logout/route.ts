import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { clearSessionCookie, destroySession } from "@/auth/session";

/** POST /api/auth/logout — revoke the session server-side + clear cookie. */
export const POST = withApi({ auth: false, rateLimit: false }, async (ctx) => {
  await destroySession(ctx.req);
  const res = ok({ loggedOut: true });
  clearSessionCookie(res);
  return res;
});
