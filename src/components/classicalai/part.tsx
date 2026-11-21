"use client";

/**
 * ClassicalPartView — one part of the course: the module/chapter map with
 * lesson navigation and completion, the tiered exercise battery, the part
 * checkpoint quiz, and the project brief.
 */
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ClipboardList, FlaskConical, FolderGit2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassicalCourse, ClassicalPart } from "@/lib/classicalai/types";
import { allClassicalLessons } from "@/lib/classicalai/types";
import { curriculum } from "@/lib/curriculum/data";
import { useClassicalProgress } from "@/lib/classicalai/progress";
import { InlineText } from "@/components/course/blocks";
import { ClassicalQuiz } from "./quiz";
import { ExerciseBattery } from "./exercises";
import { Reveal } from "@/components/academy/motion";

export function ClassicalPartView({
  course,
  part,
  navigate,
}: {
  course: ClassicalCourse;
  part: ClassicalPart;
  navigate: (hash: string) => void;
}) {
  const done = useClassicalProgress((s) => s.lessonsDone);
  const flat = allClassicalLessons(course);
  const partLessons = part.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons));
  const partDone = partLessons.filter((l) => done[l.slug]).length;
  const subject = curriculum.subject(part.subjectSlug);

  return (
    <div className="min-w-0 space-y-9">
      {/* header */}
      <header className="dv-band rounded-2xl border border-border-subtle px-6 py-7 sm:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium text-ink-3">
          <button onClick={() => navigate("#/classical")} className="hover:text-ink hover:underline">The course</button>
          <span>/</span>
          <span className="text-ink-2">Part {part.letter}</span>
        </nav>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)] font-mono text-[15px] font-bold text-viz-3">
            {part.letter}
          </span>
          <div className="min-w-0">
            <h1 className="t-page text-ink">{part.title}</h1>
            <p className="tabular mt-0.5 font-mono text-[11px] text-ink-3">
              {subject.code} — {subject.title} · {part.modules.length} modules · {partLessons.length} lessons ·{" "}
              {part.exercises.length} exercises · {partDone}/{partLessons.length} complete
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`#/subject/${part.subjectSlug}`)}
            className="ml-auto hidden h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3.5 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:text-ink sm:flex"
          >
            The registry subject <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-ink-2">{part.description}</p>
      </header>

      {/* modules & lessons */}
      <Reveal as="section" className="space-y-4">
        <h2 className="t-section text-ink">The modules</h2>
        {part.modules.map((m, mi) => (
          <div key={m.title} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
            <div className="border-b border-border-subtle bg-surface-subtle/50 px-5 py-3.5">
              <p className="flex flex-wrap items-center gap-2.5 text-[14px] font-semibold text-ink">
                <Layers className="h-4 w-4 text-viz-3" />
                Module {mi + 1} · {m.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{m.summary}</p>
            </div>
            <div className="divide-y divide-border-subtle">
              {m.chapters.map((ch) => (
                <div key={ch.title} className="px-5 py-4">
                  <p className="text-[12px font-semibold] text-[12.5px] font-semibold text-ink-2">
                    {ch.title}
                    <span className="ml-2 font-normal text-ink-3">— {ch.focus}</span>
                  </p>
                  <div className="mt-2.5 space-y-1">
                    {ch.lessons.map((l) => {
                      const isDone = !!done[l.slug];
                      const num = flat.findIndex((x) => x.lesson.slug === l.slug) + 1;
                      return (
                        <button
                          key={l.slug}
                          type="button"
                          onClick={() => navigate(`#/classical/lesson/${l.slug}`)}
                          className="group flex w-full items-center gap-3 rounded-xl border border-border-subtle/70 bg-surface px-3.5 py-2.5 text-left dv-lift hover:-translate-y-0.5 hover:border-viz-3/40 hover:shadow-e1"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-success-text" />
                          ) : (
                            <Circle className="h-4.5 w-4.5 shrink-0 text-border-strong" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className={cn("block truncate text-[13.5px] font-medium", isDone ? "text-ink-3" : "text-ink group-hover:text-primary")}>
                              {l.title}
                            </span>
                            <span className="block truncate text-[11.5px] text-ink-3">{l.summary}</span>
                          </span>
                          <span className="tabular shrink-0 text-right font-mono text-[11px] text-ink-3">
                            <span className="block">{String(num).padStart(2, "0")}</span>
                            <span className="block">{l.minutes} min</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Reveal>

      {/* exercises */}
      <Reveal as="section" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="t-section text-ink">Practice battery</h2>
          <span className="tabular font-mono text-[11px] text-ink-3">{part.exercises.length} tiered exercises</span>
        </div>
        <ExerciseBattery exercises={part.exercises} />
      </Reveal>

      {/* checkpoint */}
      <Reveal as="section" className="space-y-4">
        <h2 className="t-section text-ink">Part checkpoint</h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-3">
          The part checkpoint covers every module — the same register as the module checkpoints and final
          exam described in the registry. Answers are checked immediately and explained.
        </p>
        <ClassicalQuiz questions={part.assessment} storagePrefix={`part-${part.letter}`} title={`Part ${part.letter} checkpoint`} />
      </Reveal>

      {/* project */}
      <Reveal as="section" className="space-y-4">
        <h2 className="t-section text-ink">The part project</h2>
        <div className="overflow-hidden rounded-2xl border border-viz-3/30 bg-surface shadow-e1">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-viz-3/20 bg-[color-mix(in_srgb,var(--dv-viz-3)_7%,var(--dv-surface))] px-5 py-3.5">
            <FolderGit2 className="h-4.5 w-4.5 text-viz-3" />
            <p className="text-[15px] font-semibold text-ink">{part.project.title}</p>
            <span className="ml-auto rounded-full border border-viz-3/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-viz-3">
              {subject.projects[0]?.tier ?? "guided"} tier
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 px-5 py-4 lg:grid-cols-2">
            <div>
              <p className="dv-kicker">Brief</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{part.project.brief}</p>
              <p className="dv-kicker mt-4">Concepts applied</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {part.project.concepts.map((c) => (
                  <span key={c} className="rounded-full border border-border-subtle bg-surface-subtle/60 px-2 py-0.5 font-mono text-[11px] text-ink-2">
                    {c}
                  </span>
                ))}
              </div>
              {part.project.extension && (
                <p className="mt-4 rounded-lg border border-viz-3/25 bg-[color-mix(in_srgb,var(--dv-viz-3)_6%,transparent)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
                  <span className="font-semibold text-viz-3">Stretch: </span>
                  {part.project.extension}
                </p>
              )}
            </div>
            <div>
              <p className="dv-kicker flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" /> Requirements
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {part.project.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-viz-3" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="dv-kicker mt-4 flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" /> Build it in the laboratory
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                Build the project in the Python Playground — every technique it needs is taught in this part's lessons.
              </p>
              <button
                type="button"
                onClick={() => navigate("#/playground")}
                className="mt-2.5 flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3.5 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:text-ink"
              >
                Open the playground <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* footer nav */}
      <footer className="flex items-center justify-between border-t border-border-subtle pt-5">
        <button
          type="button"
          onClick={() => navigate("#/classical")}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> All parts
        </button>
        <span className="tabular font-mono text-[11px] text-ink-3">
          {partDone}/{partLessons.length} lessons complete
        </span>
      </footer>
    </div>
  );
}

export { InlineText };
