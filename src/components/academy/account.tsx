"use client";

/**
 * Account cluster — the header's auth-aware utility group, driven by the
 * real /api/auth/session.
 *
 *   guest      → [Sign in] (opens the AuthDialog) + [Start learning] CTA
 *   signed in  → [Dashboard] pill + avatar menu (dashboard, assessments,
 *                Ada, sign out)
 *   loading    → a shape-stable skeleton (never an invented user)
 *
 * The session is fetched once by the shell (useSession) and passed in, so
 * the header and the mobile sheet share a single request.
 */
import { useEffect, useState } from "react";
import { GraduationCap, LayoutDashboard, LogIn, LogOut, MessagesSquare, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthDialog } from "./auth-dialogs";

export interface SessionUser {
  id?: string;
  email: string;
  name?: string;
  role?: { key?: string; name?: string } | string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

/** Poll the real session endpoint once on mount (and on focus). */
export function useSession() {
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as SessionResponse & { data?: SessionResponse };
        // The API wraps payloads as { success, data } — unwrap to the session shape.
        const data = json.data ?? json;
        if (!cancelled) setSession(data);
      } catch {
        if (!cancelled) setSession({ authenticated: false, user: null });
      }
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", load);
    };
  }, []);

  return session;
}

export function AccountCluster({
  session,
  navigate,
}: {
  session: SessionResponse | null;
  navigate: (hash: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-account-menu]")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (session === null) {
    // loading: keep the cluster's shape without inventing a user
    return (
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <div className="dv-skel h-9 w-9 rounded-lg" />
        <div className="dv-skel hidden h-9 w-24 rounded-lg lg:block" />
      </div>
    );
  }

  /* ---------------------------------------------------------- guest */
  if (!session.authenticated || !session.user) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 text-[13px] font-medium text-ink shadow-e1 transition-colors hover:border-border-strong sm:flex sm:px-3"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden md:inline">Sign in</span>
        </button>
        <button
          type="button"
          onClick={() => navigate("#/course")}
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-e1 transition-colors hover:bg-primary-hover lg:flex"
        >
          <GraduationCap className="h-4 w-4" />
          Start learning
        </button>
        <AuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          reason="A DataVerse account unlocks the personalized dashboard, Ada the AI tutor, synced progress and certificates."
          onAuthed={() => window.location.reload()}
        />
      </div>
    );
  }

  /* ------------------------------------------------------- signed in */
  const name = session.user.name ?? session.user.email;
  const initial = name.slice(0, 1).toUpperCase();
  const menuItem =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface-subtle hover:text-ink";

  return (
    <div className={cn("relative")} data-account-menu>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => navigate("#/dashboard")}
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 text-[13px] font-medium text-ink shadow-e1 transition-colors hover:border-border-strong md:flex"
        >
          <LayoutDashboard className="h-4 w-4 text-ink-3" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 shadow-e1 transition-colors hover:border-border-strong"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-primary-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[8rem] truncate text-[13px] font-medium text-ink xl:inline">{name}</span>
        </button>
      </div>
      {open && (
        <div
          role="menu"
          className="dv-menu absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-e3"
        >
          <p className="truncate px-3 py-2 text-[13px] font-medium text-ink">{name}</p>
          <p className="truncate px-3 pb-2 text-[11.5px] text-ink-3">{session.user.email}</p>
          <div className="my-1 h-px bg-border-subtle" />
          <button type="button" role="menuitem" className={menuItem} onClick={() => { setOpen(false); navigate("#/dashboard"); }}>
            <LayoutDashboard className="h-4 w-4 text-ink-3" />
            My dashboard
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => { setOpen(false); navigate("#/assessments"); }}>
            <ClipboardCheck className="h-4 w-4 text-ink-3" />
            My assessments
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => { setOpen(false); navigate("#/tutor"); }}>
            <MessagesSquare className="h-4 w-4 text-ink-3" />
            Ask Ada
          </button>
          <div className="my-1 h-px bg-border-subtle" />
          <button
            type="button"
            role="menuitem"
            className={menuItem}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
              window.location.hash = "#/";
              window.location.reload();
            }}
          >
            <LogOut className="h-4 w-4 text-ink-3" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export { AuthDialog };
