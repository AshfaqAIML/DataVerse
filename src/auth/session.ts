import type { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_DAYS, type Permission, type RoleKey } from "@/lib/domain/constants";
import { unauthorized } from "@/lib/api/errors";
import { generateToken } from "./password";

/**
 * DB-backed opaque-session auth.
 *
 * - The cookie carries an opaque random token (no client-visible claims).
 * - Sessions live in the Session table and can be revoked server-side.
 * - On production Postgres the same model maps to the isolated `academy`
 *   schema (see DATABASE_DESIGN.md — pluggable auth, IC-6).
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  status: string;
  role: RoleKey;
  permissions: Permission[];
};

export async function createSession(
  userId: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: { id: token, userId, expiresAt, ip: meta?.ip, userAgent: meta?.userAgent },
  });
  return { token, expiresAt };
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: SESSION_COOKIE, value: "", httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: token },
    include: {
      user: {
        include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: token } }).catch(() => undefined);
    return null;
  }
  if (session.user.status !== "ACTIVE") return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    avatarUrl: session.user.avatarUrl,
    headline: session.user.headline,
    status: session.user.status,
    role: session.user.role.key as RoleKey,
    permissions: session.user.role.rolePermissions.map((rp) => rp.permission.key as Permission),
  };
}

export async function destroySession(req: NextRequest): Promise<void> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { id: token } }).catch(() => undefined);
  }
}

export async function requireSessionUser(req: NextRequest): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw unauthorized();
  return user;
}
