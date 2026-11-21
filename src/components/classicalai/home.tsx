"use client";

/**
 * ClassicalCourseHome — the front page of "Classical Artificial
 * Intelligence: The Complete Course": the six parts as navigable
 * sections with live progress, plus the honest numbers (lessons,
 * minutes, exercises, components) computed from the course data.
 */
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, FlaskConical, Layers, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassicalCourse } from "@/lib/classicalai/types";
import { allClassicalLessons } from "@/lib/classicalai/types";
import { curriculum } from "@/lib/curriculum/data";
import { useClassicalProgress } from "@/lib/classicalai/progress";
import { formatHours } from "@/components/academy/shared";
import { Reveal } from "@/components/academy/motion";

export function ClassicalCourseHome({
  course,
  navigate,
}: {
  course: ClassicalCourse;
  navigate: (hash: string) => void;
}) {
  const flat = allClassicalLessons(course);
  const done = useClassicalProgress((s) => s.lessonsDone);
  const lastSlug = useClassicalProgress((s) => s.lastLesson);
  const minutes = flat.reduce((n, l) => n + l.lesson.minutes, 0);
  const exercises = course.parts.reduce((n, p) => n + p.exercises.length, 0);
  const resume = lastSlug ? flat.find((l) => l.lesson.slug === lastSlug) : null;
  const doneCount = flat.filter((l) => done[l.lesson.slug]).length;

  return (
    <div className="min-w-0 space-y-10">
      {/* header */}
      <header className="dv-band rounded-2xl border border-border-subtle px-6 py-8 sm:px-9 sm:py-10">
        <p className="eyebrow text-viz-3">School J · the interactive course</p>
        <h1 className="t-display mt-2 text-ink">
          <span className="dv-gradient-text">{course.title}</span>
        </h1>
        <p className="t-lede mt-4 max-w-3xl">{course.description}</p>
        <div className="tabular mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-ink-3">
          <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {course.parts.length} parts</span>
          <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {flat.length} lessons</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatHours(minutes / 60)}</span>
          <span className="flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> {exercises} exercises</span>
          <span className="flex items-center gap-1.5"><Sigma className="h-3.5 w-3.5" /> {course.parts.length} projects</span>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`#/classical/lesson/${(resume ?? flat[0]).lesson.slug}`)}
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-e2 dv-lift hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            <ArrowRight className="h-4 w-4" />
            {resume ? `Resume: ${resume.lesson.title}` : doneCount > 0 ? "Continue the course" : "Start the course"}
          </button>
          <button
            type="button"
            onClick={() => navigate("#/school/classical-ai")}
            className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink shadow-e1 transition-colors hover:bg-surface-subtle"
          >
            The school page
          </button>
          <button
            type="button"
            onClick={() => navigate("#/classical/lab")}
            className="flex h-11 items-center gap-2 rounded-lg border border-viz-3/50 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] px-5 text-sm font-medium text-viz-3 shadow-e1 dv-lift hover:-translate-y-0.5 hover:shadow-e2"
          >
            <FlaskConical className="h-4 w-4" />
            The Classical AI Laboratory
          </button>
        </div>
        {doneCount > 0 && (
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-[11px] text-ink-3">
              <span className="tabular">{doneCount}/{flat.length} lessons complete</span>
              <span className="tabular">{Math.round((doneCount / flat.length) * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-inset">
              <div className="dv-meter h-full rounded-full bg-viz-3 transition-all duration-500" style={{ width: `${(doneCount / flat.length) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      {/* the parts */}
      <Reveal className="space-y-5">
        {course.parts.map((part) => {
          const partFlat = part.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons));
          const partDone = partFlat.filter((l) => done[l.slug]).length;
          const subject = curriculum.subject(part.subjectSlug);
          const partMinutes = partFlat.reduce((n, l) => n + l.minutes, 0);
          return (
            <section key={part.letter} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle px-5 py-4">
                <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)] font-mono text-[13px] font-bold text-viz-3">
                  {part.letter}
                </span>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`#/classical/part/${part.letter}`)}
                    className="group flex items-center gap-2 text-left"
                  >
                    <span className="text-[16px] font-semibold text-ink group-hover:text-primary">{part.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <p className="tabular mt-0.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-ink-3">
                    <span>{subject.code} · {subject.code === "J1" ? "the foundation" : "registry subject " + subject.code}</span>
                    <span>{partFlat.length} lessons · {formatHours(partMinutes / 60)}</span>
                    <span>{part.modules.length} modules · {part.exercises.length} exercises</span>
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {partDone === partFlat.length ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg/50 px-3 py-1 text-[11px] font-semibold text-success-text">
                      <CheckCircle2 className="h-3.5 w-3.5" /> complete
                    </span>
                  ) : partDone > 0 ? (
                    <span className="tabular rounded-full border border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] px-3 py-1 font-mono text-[11px] font-semibold text-viz-3">
                      {partDone}/{partFlat.length}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="px-5 pt-3.5 text-[13.5px] leading-relaxed text-ink-3">{part.tagline}</p>
              <div className="grid grid-cols-1 gap-px bg-border-subtle/60 px-0 py-0 sm:grid-cols-2">
                {part.modules.map((m) => (
                  <div key={m.title} className="bg-surface px-5 py-4">
                    <p className="text-[12.5px] font-semibold text-ink-2">{m.title}</p>
                    <div className="mt-2 space-y-0.5">
                      {m.chapters.flatMap((c) => c.lessons).map((l) => {
                        const isDone = !!done[l.slug];
                        return (
                          <button
                            key={l.slug}
                            type="button"
                            onClick={() => navigate(`#/classical/lesson/${l.slug}`)}
                            className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-subtle/60"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success-text" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-border-strong" />
                            )}
                            <span className={cn("min-w-0 flex-1 truncate text-[13px]", isDone ? "text-ink-3" : "text-ink-2 group-hover:text-ink")}>
                              {l.title}
                            </span>
                            <span className="tabular shrink-0 font-mono text-[11px] text-ink-3">{l.minutes}m</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </Reveal>
    </div>
  );
}
