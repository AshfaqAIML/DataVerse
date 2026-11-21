import { NextResponse } from "next/server";

/**
 * GET /api/auth/google — initiate Google sign-in.
 *
 * In a fully configured deployment this redirects to Google's OAuth consent
 * screen. When credentials are not configured we bounce back to the home
 * route with an `authError` flag so the UI can surface a friendly message
 * instead of crashing.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.redirect(new URL("/?authError=google_not_configured", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
