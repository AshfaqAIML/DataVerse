"use client";

import { useEffect } from "react";

/**
 * ChunkErrorRecovery — self-healing for stale chunk loads.
 *
 * When the dev server restarts while a visitor has the app open (sandbox
 * recycle, OOM recovery, redeploy), their next in-app navigation requests
 * JS chunks that no longer exist. The failure surfaces as a
 * ChunkLoadError / "Failed to fetch dynamically imported module" and
 * React unmounts the app to the "Application error" screen — the visitor
 * is stranded on a broken page through no fault of their own.
 *
 * Instead, we listen for exactly those failures and reload the page once.
 * The academy shell is a hash router (#/view), and the hash survives a
 * reload, so the visitor lands back on the same view — rebuilt from the
 * fresh chunks.
 *
 * A session-storage timestamp guards against reload loops: at most one
 * recovery per 30 s window.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    const KEY = "dv-chunk-reload-at";
    const WINDOW_MS = 30_000;

    const CHUNK_ERROR =
      /ChunkLoadError|Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i;

    const recover = () => {
      try {
        const last = Number(sessionStorage.getItem(KEY) || 0);
        if (Date.now() - last < WINDOW_MS) return; // already tried — don't loop
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        // Storage unavailable (private mode): fall through — a single
        // recovery per page lifetime is still better than a dead screen.
      }
      window.location.reload();
    };

    // Script <link>/<script> resource failures surface as ErrorEvents whose
    // target is the element (captured here in the bubble-less capture phase).
    const onError = (e: ErrorEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "SCRIPT" || t.tagName === "LINK")) {
        recover();
        return;
      }
      if (e.error?.name === "ChunkLoadError" || CHUNK_ERROR.test(e.message ?? "")) {
        recover();
      }
    };

    // Dynamic-import failures surface as unhandled promise rejections.
    const onRejection = (e: PromiseRejectionEvent) => {
      const r: unknown = e.reason;
      const name =
        typeof r === "object" && r !== null && "name" in r
          ? String((r as { name?: unknown }).name)
          : "";
      const message =
        typeof r === "object" && r !== null && "message" in r
          ? String((r as { message?: unknown }).message)
          : String(r ?? "");
      if (name === "ChunkLoadError" || CHUNK_ERROR.test(message)) {
        recover();
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
