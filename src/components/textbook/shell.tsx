"use client";

/**
 * TextbookShell — the three-pane digital textbook layout shared by the
 * course lesson readers:
 *
 *   ┌──────────┬────────────────────────────┬──────────┐
 *   │  outline │  the lesson, at an         │  tools   │
 *   │  tree    │  adjustable measure        │  rail    │
 *   │  (lg+)   │  (breadcrumb → … → nav)    │  (xl+)   │
 *   └──────────┴────────────────────────────┴──────────┘
 *
 * Chrome it owns: the reading-progress hairline under the site header,
 * the mobile Contents / Tools drawers, ← / → keyboard page-turns, and
 * the per-course reading width. The accent colour is injected as the
 * --tb-accent custom property so every child can tint itself on-brand.
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PanelLeft, PanelRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/focus-trap";
import { READER_WIDTHS, useReaderPrefs, type ContentWidth } from "./prefs";
import { useLessonKeyboard, useReadingProgress } from "./hooks";

export interface ReaderContextValue {
  courseKey: string;
  slug: string;
  /** The accent colour as a CSS value, e.g. "var(--dv-viz-2)". */
  accent: string;
  ratio: number;
  width: ContentWidth;
  setWidth: (w: ContentWidth) => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function useReader(): ReaderContextValue {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReader must be used inside <TextbookShell>");
  return ctx;
}

export interface TextbookShellProps {
  courseKey: string;
  /** The current lesson's slug (notes + resume position are keyed on it). */
  slug: string;
  /** Accent colour as a CSS value, e.g. "var(--dv-viz-2)". Defaults to the brand primary. */
  accent?: string;
  /** The course outline tree (left pane). */
  left: ReactNode;
  /** The lesson tools rail (right pane). */
  right: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  children: ReactNode;
}

export function TextbookShell({
  courseKey,
  slug,
  accent = "var(--dv-primary)",
  left,
  right,
  onPrev,
  onNext,
  children,
}: TextbookShellProps) {
  const ratio = useReadingProgress();
  const width = useReaderPrefs((s) => s.widths[courseKey] ?? "comfortable");
  const setWidth = useReaderPrefs((s) => s.setWidth);
  const setReading = useReaderPrefs((s) => s.setReading);

  const [leftOpen, setLeftOpen] = useDrawer();
  const [rightOpen, setRightOpen] = useDrawer();

  // A drawer opened on a small screen must not linger invisibly "open" when
  // the viewport grows past its breakpoint (it would keep the page scrolled
  // locked and the keyboard shortcuts suspended).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setLeftOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setLeftOpen]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setRightOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setRightOpen]);

  useLessonKeyboard({
    onPrev: onPrev ? () => onPrev() : undefined,
    onNext: onNext ? () => onNext() : undefined,
    onEscape: () => {
      setLeftOpen(false);
      setRightOpen(false);
    },
  });

  // Persist the reading position at most once a second — the resume dot
  // on the course home reads it back.
  const lastWrite = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastWrite.current < 1000) return;
    lastWrite.current = now;
    setReading(courseKey, slug, ratio);
  }, [courseKey, slug, ratio, setReading]);

  // Navigating from inside a drawer (outline links) closes it.
  useEffect(() => {
    if (!leftOpen && !rightOpen) return;
    const close = () => {
      setLeftOpen(false);
      setRightOpen(false);
    };
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [leftOpen, rightOpen, setLeftOpen, setRightOpen]);

  const ctx: ReaderContextValue = {
    courseKey,
    slug,
    accent,
    ratio,
    width,
    setWidth: (w: ContentWidth) => setWidth(courseKey, w),
  };

  return (
    <ReaderContext.Provider value={ctx}>
      <div
        className="dv-reader relative min-h-[calc(100vh-4rem)]"
        style={{ "--tb-accent": accent } as CSSProperties}
      >
        {/* reading progress hairline */}
        <div className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5">
          <div
            className="h-full transition-[width] duration-150"
            style={{ width: `${ratio * 100}%`, background: "var(--tb-accent)" }}
          />
        </div>

        <div className="mx-auto flex w-full max-w-[1680px] gap-0 px-0 xl:px-6">
          {/* ------------------------------------------------ left rail (lg+) */}
          <aside aria-label="Lesson outline" className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[286px] shrink-0 border-r border-border-subtle bg-surface/60 lg:block">
            {left}
          </aside>

          {/* ------------------------------------------------ center column */}
          <article className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 xl:py-10">
            {/* mobile lesson toolbar — sticky under the site header so the
                curriculum and tools stay one thumb-tap away anywhere in a
                long lesson. The Contents button retires at lg (the outline
                pane takes over); the Tools button at xl (the rail takes
                over) — closing the old lg–xl gap where the rail was
                unreachable. */}
            <div className="sticky top-16 z-30 -mx-1 mb-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-canvas/90 px-2.5 py-2 shadow-e1 backdrop-blur-md xl:hidden">
              <button
                type="button"
                onClick={() => setLeftOpen(true)}
                aria-expanded={leftOpen}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:text-ink lg:hidden"
              >
                <PanelLeft className="h-4 w-4" /> Contents
              </button>
              <button
                type="button"
                onClick={() => setRightOpen(true)}
                aria-expanded={rightOpen}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:text-ink"
              >
                <PanelRight className="h-4 w-4" /> Tools
              </button>
              <span className="tabular ml-auto font-mono text-[11px] text-ink-3" aria-hidden="true">
                {Math.round(ratio * 100)}%
              </span>
              <span className="sr-only">Lesson {Math.round(ratio * 100)}% read</span>
            </div>

            <div className="mx-auto" style={{ maxWidth: READER_WIDTHS[width].max }}>
              {children}
            </div>
          </article>

          {/* ------------------------------------------------ right rail (xl+) */}
          <aside aria-label="Lesson tools" className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[320px] shrink-0 border-l border-border-subtle bg-surface/60 xl:block">
            {right}
          </aside>
        </div>

        {/* ------------------------------------------------ mobile drawers */}
        <Drawer
          open={leftOpen}
          onClose={() => setLeftOpen(false)}
          side="left"
          title="Course contents"
          breakpoint="lg"
        >
          {left}
        </Drawer>
        <Drawer
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          side="right"
          title="Lesson tools"
          breakpoint="xl"
        >
          {right}
        </Drawer>
      </div>
    </ReaderContext.Provider>
  );
}

/* ------------------------------------------------------------- drawer utils */

/** Drawer open state with page-scroll locking while open. */
function useDrawer(): [boolean, (v: boolean) => void] {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  return [open, setOpen];
}

function Drawer({
  open,
  onClose,
  side,
  title,
  breakpoint,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  title: string;
  breakpoint: "lg" | "xl";
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // WCAG 2.4.3 — a modal dialog must hold keyboard focus: trap Tab inside,
  // move focus in on open, restore it to the trigger on close.
  useFocusTrap(open, panelRef);
  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-(--dv-z-modal)",
        breakpoint === "lg" ? "lg:hidden" : "xl:hidden"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="dv-fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-y-0 w-[320px] max-w-[88vw] border-border-subtle bg-surface shadow-e3",
          side === "left" ? "dv-drawer-left left-0 border-r" : "dv-drawer-right right-0 border-l"
        )}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="dv-hit rounded-md p-1.5 text-ink-3 transition-colors hover:bg-surface-subtle hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="h-[calc(100%-53px)]">{children}</div>
      </div>
    </div>
  );
}
