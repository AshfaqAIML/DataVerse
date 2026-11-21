"use client";

/**
 * ReaderRail — the right sidebar of the textbook reader: table of
 * contents with scroll-spy, this lesson's reading progress, key
 * concepts, important terminology, related lessons, personal notes
 * (saved to this device, debounced) and one-tap access to Ada, the
 * AI tutor.
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Keyboard,
  ListTree,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import { noteKey, useReaderPrefs } from "./prefs";
import { useScrollSpy } from "./hooks";
import { useReader } from "./shell";

export interface RailTocItem {
  id: string;
  title: string;
}

export interface RailTerm {
  term: string;
  definition: string;
  /** The mathematical symbol, e.g. "∇f" — shown next to the term. */
  symbol?: string;
}

export interface RailRelated {
  title: string;
  sub: string;
  href: string;
}

export interface ReaderRailProps {
  /** Section anchors inside the article (scroll-spy + jump links). */
  toc: RailTocItem[];
  /** The lesson's objectives — "what to keep in mind while reading". */
  concepts?: string[];
  /** The lesson's terminology. */
  terms?: RailTerm[];
  /** Same part first, then shared vocabulary. */
  related?: RailRelated[];
  /** Suggested opening lines for the AI tutor. */
  tutorPrompts?: string[];
  /** Where the "Open Ada" button leads (the tutor route). */
  onOpenTutor: () => void;
}

export function ReaderRail({ toc, concepts, terms, related, tutorPrompts, onOpenTutor }: ReaderRailProps) {
  const { ratio, courseKey, slug } = useReader();
  const active = useScrollSpy(toc.map((t) => t.id));

  return (
    /* The shell already wraps this rail in <aside aria-label="Lesson tools">;
       a nested aside would be a complementary-inside-complementary landmark
       violation, so this inner element is a plain div. */
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto px-5 py-4">
      {/* on this page */}
      {toc.length > 0 && (
        <div>
          <p className="dv-kicker mb-2 flex items-center gap-1.5">
            <ListTree className="tb-accent h-3.5 w-3.5" /> On this page
          </p>
          <ul className="space-y-0.5 border-l border-border-subtle">
            {toc.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(s.id);
                    if (el) scrollIntoViewSafe(el, { block: "start" });
                  }}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 text-[12px] leading-snug transition-colors",
                    active === s.id
                      ? "tb-accent border-current font-medium"
                      : "border-transparent text-ink-3 hover:text-ink"
                  )}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* reading progress */}
      <div>
        <p className="dv-kicker mb-2">This lesson · reading progress</p>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.round(ratio * 100)}%`, background: "var(--tb-accent)" }}
            />
          </div>
          <span className="tabular font-mono text-[11px] text-ink-3">{Math.round(ratio * 100)}%</span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-ink-3">
          <Keyboard className="h-3 w-3" />
          <span>
            <kbd className="rounded border border-border-subtle bg-surface-subtle px-1 font-sans text-[10px]">←</kbd>{" "}
            <kbd className="rounded border border-border-subtle bg-surface-subtle px-1 font-sans text-[10px]">→</kbd>{" "}
            turn lessons
          </span>
        </p>
      </div>

      {/* key concepts */}
      {concepts && concepts.length > 0 && (
        <div>
          <p className="dv-kicker mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="tb-accent h-3.5 w-3.5" /> Key concepts
          </p>
          <ul className="space-y-1.5">
            {concepts.map((c, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-3">
                <span className="tb-dot mt-[7px] h-1 w-1 shrink-0 rounded-full" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* important terminology */}
      {terms && terms.length > 0 && (
        <div>
          <p className="dv-kicker mb-2 flex items-center gap-1.5">
            <BookOpen className="tb-accent h-3.5 w-3.5" /> Terminology
          </p>
          <dl className="space-y-2.5">
            {terms.map((t) => (
              <div key={t.term} className="rounded-lg border border-border-subtle bg-surface px-3 py-2">
                <dt className="flex items-baseline gap-2 text-[11.5px] font-semibold text-ink">
                  <span className="tb-accent font-mono">{t.term}</span>
                  {t.symbol && <span className="math-line-inline text-[11px] text-ink-3">{t.symbol}</span>}
                </dt>
                <dd className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* related lessons */}
      {related && related.length > 0 && (
        <div>
          <p className="dv-kicker mb-2">Related lessons</p>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.href + r.title}>
                <a
                  href={r.href}
                  className="group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
                >
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium leading-snug text-ink-2 group-hover:text-ink">
                      {r.title}
                    </span>
                    <span className="block font-mono text-[10px] text-ink-3">{r.sub}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* personal notes */}
      <NotesPanel courseKey={courseKey} slug={slug} />

      {/* AI tutor */}
      <div className="tb-panel rounded-xl px-3.5 py-3">
        <p className="dv-kicker tb-accent flex items-center gap-1.5">
          <MessagesSquare className="h-3.5 w-3.5" /> Ada, your AI tutor
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
          Stuck on this lesson? Ada can walk you through it, step by step.
        </p>
        {tutorPrompts && tutorPrompts.length > 0 && (
          <ul className="mt-2 space-y-1">
            {tutorPrompts.map((p, i) => (
              <li
                key={i}
                className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 font-mono text-[11px] leading-snug text-ink-2"
              >
                {p}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onOpenTutor}
          className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Open Ada <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- personal notes */

function NotesPanel({ courseKey, slug }: { courseKey: string; slug: string }) {
  const key = noteKey(courseKey, slug);
  const note = useReaderPrefs((s) => s.notes[key]);
  const saveNote = useReaderPrefs((s) => s.saveNote);
  const [draft, setDraft] = useState(note?.text ?? "");
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The rail is remounted per lesson (keyed by slug at the usage site).
  const onChange = (v: string) => {
    setDraft(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveNote(key, v);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }, 600);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <div>
      <p className="dv-kicker mb-2 flex items-center gap-1.5">
        <NotebookPen className="tb-accent h-3.5 w-3.5" /> My notes
        {/* Announce the save confirmation to screen readers (WCAG 4.1.3):
            the region persists; only its text swaps in and out. */}
        <span aria-live="polite" className="font-mono text-[10px] font-normal text-success-text">
          {saved ? "saved ✓" : ""}
        </span>
      </p>
      <label htmlFor="dv-note-area" className="sr-only">
        Personal notes for this lesson
      </label>
      <textarea
        id="dv-note-area"
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write what you want to remember — notes stay on this device, attached to this lesson."
        className="tb-note min-h-[110px] w-full resize-y rounded-lg border bg-surface-inset px-3 py-2.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none"
      />
    </div>
  );
}
