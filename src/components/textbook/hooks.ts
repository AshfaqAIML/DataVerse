"use client";

/**
 * The textbook reader's shared hooks: whole-document reading progress,
 * scroll-spy over the lesson's sections, global keyboard navigation,
 * and a resilient copy-to-clipboard.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** Reading progress of the whole document, as a 0–1 ratio. */
export function useReadingProgress() {
  const [ratio, setRatio] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setRatio(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return ratio;
}

/** Which of the given section ids is currently in view (scroll-spy). */
export function useScrollSpy(ids: string[], offset = 100) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const idsKey = ids.join("|");
  useEffect(() => {
    const list = idsKey ? idsKey.split("|") : [];
    if (list.length === 0) return;
    const visible = new Map<string, DOMRect>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect);
          else visible.delete(e.target.id);
        }
        if (visible.size > 0) {
          // The topmost visible section is the one being read.
          let best: string | null = null;
          let bestTop = Infinity;
          visible.forEach((rect, id) => {
            if (rect.top < bestTop) {
              bestTop = rect.top;
              best = id;
            }
          });
          if (best) setActive(best);
        }
      },
      { rootMargin: `-${offset}px 0px -62% 0px` }
    );
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [idsKey, offset]);
  return active;
}

/** True while any modal dialog (mobile drawer, auth sheet) is open. */
function modalOpen(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

/**
 * The reader's keyboard map: ← / → turn to the previous / next lesson,
 * Escape closes overlays. Typing in form fields and any open dialog
 * suspends the shortcuts.
 */
export function useLessonKeyboard(opts: {
  onPrev?: () => void;
  onNext?: () => void;
  onEscape?: () => void;
}) {
  const ref = useRef(opts);
  useEffect(() => {
    ref.current = opts;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        // Escape always escapes — even from a text field.
        if (e.key === "Escape" && ref.current.onEscape) ref.current.onEscape();
        return;
      }
      if (e.key === "Escape") {
        ref.current.onEscape?.();
        return;
      }
      if (modalOpen()) return;
      if (e.key === "ArrowLeft" && ref.current.onPrev) {
        e.preventDefault();
        ref.current.onPrev();
      } else if (e.key === "ArrowRight" && ref.current.onNext) {
        e.preventDefault();
        ref.current.onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** Copy to clipboard with a transient confirmation state. */
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(ta);
        }
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeout);
    },
    [timeout]
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return { copied, copy };
}
