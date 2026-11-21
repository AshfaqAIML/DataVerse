"use client";

/**
 * ReaderChrome — the reusable pieces of a lesson's center column:
 * breadcrumbs, the meta chip row (with bookmark + reading-width
 * controls), the title block, the objectives card, the "why this
 * matters" panel, section headings, the terminology / mistakes /
 * takeaways sections, and the prev/next + completion footer.
 *
 * Everything is presentational; the data and behaviour come from each
 * course's lesson view. Accent tints come from --tb-accent, set by
 * the surrounding <TextbookShell>.
 */
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Lightbulb,
  PanelRight,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { READER_WIDTHS, noteKey, useReaderPrefs, type ContentWidth } from "./prefs";
import { useCopy } from "./hooks";
import { useReader } from "./shell";

/* ------------------------------------------------------------- breadcrumbs */

export interface Crumb {
  label: string;
  onClick?: () => void;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium text-ink-3"
    >
      {items.map((c, i) => (
        <span
          key={i}
          className="flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap"
        >
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
          {c.onClick ? (
            <button
              type="button"
              onClick={c.onClick}
              className="min-w-0 truncate hover:text-ink hover:underline"
              title={c.label}
            >
              {c.label}
            </button>
          ) : (
            <span className="max-w-[16rem] truncate text-ink-2">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------ the meta row */

/**
 * The row of lesson metadata chips. Renders the bookmark + width
 * controls on the right unless `controls` overrides them.
 */
export function MetaRow({ children, controls }: { children?: ReactNode; controls?: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {children}
      <span className="ml-auto flex items-center gap-1.5">{controls ?? <ReaderControls />}</span>
    </div>
  );
}

/** Small pill of lesson metadata. `tone="accent"` uses the course accent. */
export function MetaChip({
  icon: Icon,
  tone = "plain",
  children,
}: {
  icon?: ComponentType<{ className?: string }>;
  tone?: "plain" | "accent" | "success";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
        tone === "accent" && "tb-chip border-transparent font-bold",
        tone === "plain" && "border-border-subtle text-ink-3",
        tone === "success" &&
          "border-success-border bg-success-bg/50 font-sans text-[11px] font-semibold text-success-text"
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

/**
 * The right-aligned reader controls: bookmark this lesson and adjust
 * the reading width.
 */
export function ReaderControls() {
  const { courseKey, slug } = useReader();
  const key = noteKey(courseKey, slug);
  const bookmarked = !!useReaderPrefs((s) => s.bookmarks[key]);
  const toggleBookmark = useReaderPrefs((s) => s.toggleBookmark);
  return (
    <>
      <button
        type="button"
        onClick={() => toggleBookmark(key)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors",
          bookmarked ? "tb-chip tb-border-accent" : "border-border-subtle bg-surface text-ink-3 hover:text-ink"
        )}
        aria-pressed={bookmarked}
      >
        {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      <WidthControl />
    </>
  );
}

/** Compact / Comfortable / Wide — the adjustable reading measure. */
export function WidthControl() {
  const { width, setWidth } = useReader();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const options = Object.keys(READER_WIDTHS) as ContentWidth[];

  // Escape closes the popup (WCAG 2.1.2); the radiogroup carries proper
  // radio semantics with a roving tabindex (aria-checked selection).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const focusOption = (index: number) => {
    const btns = menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']");
    if (!btns || btns.length === 0) return;
    btns[(index + btns.length) % btns.length].focus();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-ink"
        aria-label="Adjust reading width"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <PanelRight className="h-4 w-4" />
        <span className="hidden sm:inline">{READER_WIDTHS[width].label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="radiogroup"
            aria-label="Reading width"
            className="dv-menu absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-e3"
          >
            {options.map((w, i) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={w === width}
                tabIndex={w === width ? 0 : -1}
                onClick={() => {
                  setWidth(w);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    focusOption(i + 1);
                  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    focusOption(i - 1);
                  }
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                  w === width
                    ? "bg-surface-subtle font-semibold text-ink"
                    : "text-ink-2 hover:bg-surface-subtle/70"
                )}
              >
                <span>
                  {READER_WIDTHS[w].label}
                  <span className="ml-1.5 text-[10px] text-ink-3">{READER_WIDTHS[w].hint}</span>
                </span>
                {w === width && <CheckCircle2 className="tb-accent h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- title block */

export function TitleBlock({
  title,
  summary,
  summaryNode,
}: {
  title: string;
  summary?: string;
  /** When the summary carries inline markup, pass a node instead. */
  summaryNode?: ReactNode;
}) {
  return (
    <header className="mt-4">
      <h1 className="dv-lesson-title text-ink">{title}</h1>
      {summaryNode ?? (summary ? <p className="dv-lesson-summary mt-3">{summary}</p> : null)}
    </header>
  );
}

/* -------------------------------------------------------- opening sections */

export function ObjectivesCard({
  objectives,
  label = "Learning objectives",
  render,
  id,
}: {
  objectives: string[];
  label?: string;
  /** Inline text renderer (each course's InlineText); plain text otherwise. */
  render?: (text: string) => ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="tb-panel mt-7 scroll-mt-24 rounded-2xl px-5 py-4">
      <h2 className="dv-kicker tb-accent flex items-center gap-1.5">
        <Target className="h-4 w-4" /> {label}
      </h2>
      <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {objectives.map((o, i) => (
          <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
            <CheckCircle2 className="tb-accent mt-0.5 h-4 w-4 shrink-0" />
            <span>{render ? render(o) : o}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The motivation panel — an accent-ruled quotation from the syllabus. */
export function WhyPanel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className="mt-6 scroll-mt-24 border-l-2 pl-5"
      style={{
        borderColor: "color-mix(in srgb, var(--tb-accent, var(--dv-primary)) 50%, transparent)",
      }}
    >
      <p className="dv-kicker">Why this topic matters</p>
      <div className="dv-lesson-text mt-1.5 text-[15.5px] italic leading-[1.85]">{children}</div>
    </section>
  );
}

/* --------------------------------------------------------- section heading */

export function SectionHeading({
  id,
  icon: Icon,
  children,
  className,
}: {
  id?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn("dv-lesson-h3 scroll-mt-24 text-ink", className)}>
      {Icon && <Icon className="tb-accent mr-1.5 inline-block h-5 w-5 align-[-0.25em]" />}
      {children}
    </h2>
  );
}

/* -------------------------------------------------------- closing sections */

export interface TermItem {
  term: string;
  definition: string;
}

export function TermsSection({ id, terms }: { id?: string; terms: TermItem[] }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <SectionHeading icon={BookOpen}>Important terminology</SectionHeading>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {terms.map((t, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border border-border-subtle bg-surface px-4 py-3.5",
              terms.length % 2 === 1 && i === terms.length - 1 && "sm:col-span-2"
            )}
          >
            <dt className="tb-accent font-mono text-[13px] font-semibold">{t.term}</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-3">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export interface MistakeItem {
  mistake: string;
  why: string;
  fix: string;
}

export function MistakesSection({
  id,
  title = "Common mistakes — and how to fix them",
  mistakes,
  render,
}: {
  id?: string;
  title?: string;
  mistakes: MistakeItem[];
  /** Inline text renderer (each course's InlineText). */
  render: (text: string) => ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <SectionHeading icon={AlertTriangle}>{title}</SectionHeading>
      <div className="mt-4 space-y-2.5">
        {mistakes.map((m, i) => (
          <div key={i} className="rounded-xl border border-warning-border/40 bg-warning-bg/25 px-4 py-3.5">
            <p className="flex items-start gap-2.5 text-[14px] font-semibold text-ink">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning-bg font-mono text-[11px] font-bold text-warning-text ring-1 ring-warning-border/50">
                {i + 1}
              </span>
              {render(m.mistake)}
            </p>
            <p className="mt-2 pl-8 text-[13.5px] leading-relaxed text-ink-3">
              <span className="font-semibold text-ink-2">Why it happens: </span>
              {render(m.why)}
            </p>
            <p className="mt-1 pl-8 text-[13.5px] leading-relaxed text-ink-2">
              <span className="tb-accent font-semibold">The fix: </span>
              {render(m.fix)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TakeawaysSection({
  id,
  title = "Key takeaways",
  takeaways,
  render,
}: {
  id?: string;
  title?: string;
  takeaways: string[];
  render: (text: string) => ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <SectionHeading icon={Lightbulb}>{title}</SectionHeading>
      <ul className="mt-4 space-y-2 rounded-2xl border border-border-subtle bg-surface px-5 py-4">
        {takeaways.map((t, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-2">
            <CheckCircle2 className="tb-accent mt-0.5 h-4 w-4 shrink-0" />
            <span>{render(t)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------- footer nav */

export interface FooterNavProps {
  complete: {
    done: boolean;
    onToggle: () => void;
    doneLabel?: string;
    todoLabel?: string;
  };
  prev?: { title: string; onClick: () => void } | null;
  next?: { title: string; onClick: () => void; label?: string } | null;
  /** Small centred colophon under the buttons. */
  colophon?: ReactNode;
}

export function LessonFooterNav({ complete, prev, next, colophon }: FooterNavProps) {
  return (
    <footer className="mt-12 border-t border-border-subtle pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={complete.onToggle}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
            complete.done
              ? "border border-success-border bg-success-bg/40 text-success-text hover:bg-success-bg/70"
              : "text-primary-foreground shadow-e1 hover:opacity-90"
          )}
          style={complete.done ? undefined : { backgroundColor: "var(--tb-accent, var(--dv-primary))" }}
        >
          <CheckCircle2 className="h-4 w-4" />
          {complete.done
            ? (complete.doneLabel ?? "Completed — click to undo")
            : (complete.todoLabel ?? "Mark this lesson complete")}
        </button>
        <div className="flex gap-2">
          {prev && (
            <button
              type="button"
              onClick={prev.onClick}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2.5 text-sm text-ink-2 shadow-e1 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                  Previous
                </span>
                <span className="block max-w-[11rem] truncate font-medium">{prev.title}</span>
              </span>
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={next.onClick}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2.5 text-sm shadow-e1 transition-colors hover:border-current"
            >
              <span className="min-w-0 text-right">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                  {next.label ?? "Up next"}
                </span>
                <span className="block max-w-[11rem] truncate font-medium text-ink">{next.title}</span>
              </span>
              <ArrowRight className="tb-accent h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
      {colophon && <div className="tabular mt-4 text-center font-mono text-[11px] text-ink-3">{colophon}</div>}
    </footer>
  );
}

/* ------------------------------------------------------------- copy button */

/** A small copy-to-clipboard button for code blocks. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => void copy(text)}
      className={cn(
        "dv-hit inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-ink-3 transition-colors hover:bg-surface-subtle hover:text-ink",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success-text" /> : <Copy className="h-3.5 w-3.5" />}
      {/* The confirmation swaps inside a persistent live region so screen
          readers hear "Copied" (WCAG 4.1.3). */}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only"> code to clipboard</span>
    </button>
  );
}

/** A meta chip showing minutes, for the meta row. */
export function MinutesChip({ minutes }: { minutes: number }) {
  return (
    <MetaChip icon={Clock}>
      {minutes} min
    </MetaChip>
  );
}
