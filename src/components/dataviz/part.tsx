"use client";

/**
 * DataVizPartView — one part: modules, chapters and lesson cards, plus
 * the part's exercise battery, assessment and project.
 */
import { useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardCheck, Clock, Hammer, Target } from "lucide-react";
import type { DataVizCourse, DataVizPart } from "@/lib/dataviz/types";
import { allDataVizLessons } from "@/lib/dataviz/types";
import { cn } from "@/lib/utils";

type Tab = "syllabus" | "exercises" | "assessment" | "project";

export function DataVizPartView({
  course,
  part,
  navigate,
}: {
  course: DataVizCourse;
  part: DataVizPart;
  navigate: (hash: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("syllabus");
  const lessons = allDataVizLessons(course).filter((r) => r.partLetter === part.letter);
  const minutes = lessons.reduce((a, r) => a + r.lesson.minutes, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-3">
        <button className="hover:text-viz-10" onClick={() => navigate("#/viz")}>
          Data Visualization
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-ink-2">Part {part.letter}</span>
      </nav>

      <header className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-5xl font-bold text-viz-10 dark:text-viz-10/25">{part.letter}</span>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-ink">{part.title}</h1>
            <p className="mt-1 text-sm text-ink-3">{part.tagline}</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-2">{part.description}</p>
        <p className="mt-3 text-xs font-semibold text-ink-3">
          {lessons.length} lessons · ~{Math.round(minutes / 60)}h {minutes % 60}m · {part.exercises.length} exercises · {part.assessment.length}-question checkpoint
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {(
          [
            ["syllabus", "Syllabus", BookIcon],
            ["exercises", `Exercises (${part.exercises.length})`, Target],
            ["assessment", `Checkpoint (${part.assessment.length})`, ClipboardCheck],
            ["project", "Project", Hammer],
          ] as [Tab, string, React.ComponentType<{ className?: string }>][]
        ).map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              tab === t ? "bg-viz-10 text-ink-inverse" : "bg-surface-inset text-ink-2 hover:bg-surface-inset",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "syllabus" ? (
        <div className="dv-fade-up space-y-6">
          {part.modules.map((mod) => (
            <section key={mod.title}>
              <h2 className="font-serif text-lg font-semibold text-ink">{mod.title}</h2>
              <p className="mb-3 text-xs text-ink-3">{mod.summary}</p>
              <div className="space-y-3">
                {mod.chapters.map((ch) => (
                  <div key={ch.title} className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-viz-10">{ch.title}</p>
                    <p className="mb-2 text-xs text-ink-3">{ch.focus}</p>
                    <div className="divide-y divide-border-subtle">
                      {ch.lessons.map((l) => (
                        <button
                          key={l.slug}
                          onClick={() => navigate(`#/viz/lesson/${l.slug}`)}
                          className="group flex w-full items-center justify-between gap-3 py-2.5 text-left"
                        >
                          <span>
                            <span className="text-sm font-semibold text-ink group-hover:text-viz-10">
                              <span className="mr-2 font-mono text-xs text-ink-3">{l.slug}</span>
                              {l.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{l.summary}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2 text-[11px] text-ink-3">
                            <Clock className="h-3 w-3" />
                            {l.minutes}m
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {tab === "exercises" ? (
        <div className="dv-fade-up space-y-3">
          {part.exercises.map((ex) => (
            <div key={ex.id} className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
                {ex.id} · {ex.tier}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{ex.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{ex.prompt}</p>
              {ex.hint ? (
                <p className="mt-2 rounded-md bg-surface-subtle px-3 py-2 text-xs text-ink-3">
                  <strong>Hint:</strong> {ex.hint}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "assessment" ? (
        <div className="dv-fade-up space-y-3">
          {part.assessment.map((q, qi) => (
            <details key={q.id} className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
              <summary className="cursor-pointer text-sm font-semibold text-ink">
                {qi + 1}. {q.prompt}
              </summary>
              <div className="mt-3 space-y-1.5">
                {q.options.map((o) => (
                  <p
                    key={o.text}
                    className={cn(
                      "rounded-md px-3 py-2 text-xs",
                      o.correct ? "bg-success-bg font-semibold text-success-text" : "text-ink-2",
                    )}
                  >
                    {o.correct ? <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" /> : null}
                    {o.text}
                    {o.correct ? <span className="mt-1 block font-normal text-success-text">{o.feedback}</span> : null}
                  </p>
                ))}
                <p className="mt-2 rounded-md bg-surface-subtle px-3 py-2 text-xs leading-relaxed text-ink-2">
                  <strong>Why:</strong> {q.explanation}
                </p>
              </div>
            </details>
          ))}
        </div>
      ) : null}

      {tab === "project" ? (
        <div className="dv-fade-up rounded-xl border border-border-subtle bg-surface p-5 shadow-e1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">Part project</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{part.project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{part.project.brief}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3">Requirements</p>
              <ul className="mt-1.5 space-y-1.5">
                {part.project.requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-viz-10" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3">Steps</p>
              <ol className="mt-1.5 space-y-1.5">
                {part.project.steps.map((s, i) => (
                  <li key={s} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                    <span className="font-mono text-ink-3">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
