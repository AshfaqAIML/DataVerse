"use client";

/**
 * Auth dialogs — real sign-in and registration against /api/auth/login and
 * /api/auth/register. The shell opens these from the account controls; a
 * successful sign-in reloads so every server-rendered surface (session,
 * dashboard, tutor) picks up the cookie.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, LogIn, ShieldCheck, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/focus-trap";

type Mode = "sign-in" | "register";

interface AuthDialogProps {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
  /** Called after a successful sign-in / registration (the app reloads). */
  onAuthed?: () => void;
  /** Optional heading override (e.g. "Sign in to see your dashboard"). */
  reason?: string;
}

export function AuthDialog({ open, initialMode = "sign-in", onClose, onAuthed, reason }: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // WCAG 2.4.3 — a modal dialog must hold keyboard focus: trap Tab inside
  // the card, move focus in on open, restore it to the trigger on close.
  useFocusTrap(open, dialogRef, { initialFocus: true });

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
    }
  }, [open, initialMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const path = mode === "sign-in" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "sign-in"
          ? { email, password }
          : { email, password, name: name.trim(), headline: headline.trim() || undefined };
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? (mode === "sign-in" ? "Sign-in failed" : "Registration failed"));
      }
      onAuthed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const inputCls =
    "h-11 w-full rounded-xl border border-border-subtle bg-surface-inset px-3.5 text-[14px] text-ink placeholder:text-ink-3 outline-none transition-colors focus:border-primary/50";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-(--dv-z-top) flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "sign-in" ? "Sign in" : "Create your account"}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="dv-fade absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div ref={dialogRef} className="dv-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e3">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="eyebrow text-primary">DataVerse Academy</p>
            <h2 className="t-sub mt-1.5 text-ink">
              {mode === "sign-in" ? "Sign in to your account" : "Create your learner account"}
            </h2>
            {reason && <p className="t-caption mt-1">{reason}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-accent hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3.5 px-6 pb-6 pt-5">
          <button
            type="button"
            onClick={() => { window.location.href = "/api/auth/google"; }}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border-subtle bg-surface text-[14px] font-semibold text-ink shadow-e1 transition-colors hover:border-border-strong hover:bg-surface-subtle"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <div className="relative py-1 text-center text-[12px] text-ink-3">
            <span className="relative z-10 bg-surface px-2">or continue with email</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
          </div>
          {mode === "register" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">
                  Headline <span className="font-normal text-ink-3">(optional)</span>
                </span>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={inputCls}
                  placeholder="Career switcher → data analyst"
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Password</span>
            <input
              required
              type="password"
              minLength={mode === "register" ? 8 : undefined}
              aria-describedby={mode === "register" ? "dv-pw-hint" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
            {mode === "register" && (
              <span id="dv-pw-hint" className="mt-1 block text-[11.5px] text-ink-3">
                Use at least 8 characters.
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-danger-border/60 bg-danger-bg px-3 py-2 text-[13px] text-danger-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground shadow-e1 transition-colors hover:bg-primary-hover",
              busy && "opacity-70"
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "sign-in" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>

          <p className="pt-1 text-center text-[13px] text-ink-3">
            {mode === "sign-in" ? (
              <>
                New to the Academy?{" "}
                <button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setMode("register"); setError(null); }}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setMode("sign-in"); setError(null); }}>
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="flex items-start gap-1.5 border-t border-border-subtle pt-3 text-[11.5px] leading-relaxed text-ink-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your progress, notes and Ada conversations are saved to your account. Guest course progress on this
            device is not lost — it stays in this browser.
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}
