"use client";

/**
 * MathHomeView — the course front door.
 *
 * Leads with empathy (the method panel explains the ten steps every lesson
 * walks), then the diagnostic, then the five parts with live progress and
 * the revision radar.
 */
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Compass,
  Lightbulb,
  RefreshCcw,
  Sigma,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MathCourse } from "@/lib/mathcourse/types";
import { allMathLessons, countMathLessons, mathCourseMinutes } from "@/lib/mathcourse/types";
import { revisionRadar } from "@/lib/mathcourse/diagnostic";
import { useMathProgress } from "@/lib/mathcourse/progress";
import { groupDigits } from "@/lib/mathcourse/numeric";
import { InlineText } from "@/components/course/blocks";
import { Reveal } from "@/components/academy/motion";

const METHOD_STEPS: Array<[string, string]> = [
  ["An everyday scene", "every lesson opens with something you already understand — no symbols in sight"],
  ["Plain words first", "the idea explained with zero jargon"],
  ["Proper names", "only then do we learn what mathematicians call it"],
  ["See it, move it", "an interactive picture you can drag and bend"],
  ["Where formulas come from", "every rule derived step by step — no leaps"],
  ["Worked numbers", "concrete examples, computed in front of you"],
  ["Do it in Python", "the same idea as running code — every output real"],
  ["Machine learning", "exactly where models use this idea"],
  ["Practice, tiered", "gentle to ambitious, hints when you want them"],
  ["Full solutions", "worked answers you can check against, step by step"],
];

export function MathHomeView({ course, navigate }: { course: MathCourse; navigate: (hash: string) => void }) {
  const lessonsDone = useMathProgress((s) => s.lessonsDone);
  const quizAnswers = useMathProgress((s) => s.quizAnswers);
  const diagnostic = useMathProgress((s) => s.diagnostic);

  const totalLessons = countMathLessons(course);
  const totalMinutes = mathCourseMinutes(course);
  const doneCount = allMathLessons(course).filter((l) => lessonsDone[l.lesson.slug]).length;

  const radar = course.parts.flatMap((p) => revisionRadar(course, p.letter, { lessonsDone, quizAnswers }));
  const uniqueRadar = [...new Map(radar.map((r) => [r.lessonId, r])).values()];
  const placed = diagnostic?.placement;

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-100 via-violet-50 to-white p-6 dark:border-violet-900/50 dark:from-violet-950/50 dark:via-violet-950/20 dark:to-card sm:p-9">
        <div className="absolute -right-10 -top-10 opacity-[0.07] dark:opacity-[0.12]">
          <Sigma className="h-56 w-56 text-violet-600" strokeWidth={1} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">DataVerse Academy · Third course</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-[2.6rem] sm:leading-[1.15]">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-muted-foreground">{course.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip-math">{totalLessons} lessons</span>
          <span className="chip-math">{Math.round(totalMinutes / 60)} hours</span>
          <span className="chip-math">5 parts · foundations → calculus</span>
          <span className="chip-math">14 interactive labs</span>
          <span className="chip-math">every Python output machine-verified</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(placed ? `#/math/lesson/${placed.lessonId}` : "#/math/diagnostic")}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-e1 transition-colors hover:bg-violet-700"
          >
            {placed ? <ArrowRight className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
            {placed ? `Continue — start at ${placed.lessonId.toUpperCase()}` : "Take the diagnostic first (10 min)"}
          </button>
          <button
            type="button"
            onClick={() => navigate("#/math/part/A")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-background px-5 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40"
          >
            <BookOpen className="h-4 w-4" /> Start from Part A anyway
          </button>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Written for people who believe they are “not a math person”. There is no such thing — only math that was never explained in your order.
        </p>
      </section>

      {/* ------------------------------------------------ diagnostic / placement status */}
      <Reveal as="section" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={cn(
          "rounded-xl border p-5 sm:p-6",
          placed ? "border-success-border/70 bg-success-bg/40" : "border-violet-300/70 bg-violet-50/40 dark:border-violet-900/50 dark:bg-violet-950/15"
        )}>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
            <Compass className="h-4 w-4" /> Your placement
          </h2>
          {placed && diagnostic ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed text-foreground/90">
                <span className="font-semibold">Start at {placed.lessonId.toUpperCase()}</span> ({diagnostic.correct}/{diagnostic.total} diagnostic questions right).
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{placed.note}</p>
              <div className="flex flex-wrap gap-2">
                {course.parts.map((p) => {
                  const s = diagnostic.areaScores[p.letter];
                  const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : null;
                  return (
                    <span key={p.letter} className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      pct !== null && pct >= 80 ? "border-success-text/70 bg-background text-success-text" :
                      pct !== null ? "border-warning-text/70 bg-background text-warning-text" :
                      "border-border bg-background text-muted-foreground"
                    )}>
                      Part {p.letter}: {pct === null ? "—" : `${pct}%`}
                    </span>
                  );
                })}
              </div>
              <button type="button" onClick={() => navigate("#/math/diagnostic")}
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400">
                Retake the diagnostic →
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed text-foreground/90">
                Twenty-four quick questions, no grade, no shame. It finds where your foundations stand and builds a
                personal starting point — you will never be dropped into calculus without the algebra it rests on.
              </p>
              <button type="button" onClick={() => navigate("#/math/diagnostic")}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                <ClipboardCheck className="h-4 w-4" /> Take the diagnostic
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
            <RefreshCcw className="h-4 w-4" /> Revision radar
          </h2>
          {uniqueRadar.length === 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nothing flagged. As you take lesson quizzes, any miss — or any skipped prerequisite — lights up here
                with the exact lessons to revisit, always in dependency order.
              </p>
              <p className="text-xs text-muted-foreground">
                Progress so far: {doneCount}/{totalLessons} lessons · {Math.round((doneCount / totalLessons) * 100)}%
              </p>
              <progress value={doneCount} max={totalLessons} className="h-1.5 w-full accent-violet-600" />
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-warning-text">
                {uniqueRadar.length} lesson{uniqueRadar.length > 1 ? "s" : ""} to revisit:
              </p>
              <ol className="space-y-1.5">
                {uniqueRadar.slice(0, 6).map((r) => (
                  <li key={r.lessonId}>
                    <button type="button" onClick={() => navigate(`#/math/lesson/${r.lessonId}`)}
                      className="w-full rounded-lg border border-warning-border/70 bg-warning-bg/40 px-3 py-2 text-left text-xs leading-relaxed text-foreground/90 hover:border-warning-text">
                      <span className="font-mono font-bold text-warning-text">{r.lessonId.toUpperCase()}</span>{" "}
                      {r.title} — <span className="text-muted-foreground">{r.reason}</span>
                    </button>
                  </li>
                ))}
              </ol>
              {uniqueRadar.length > 6 && <p className="text-xs text-muted-foreground">+ {uniqueRadar.length - 6} more across the parts below</p>}
            </div>
          )}
        </div>
      </Reveal>

      {/* ------------------------------------------------ method */}
      <Reveal as="section" className="rounded-xl border bg-card p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          How every single lesson is taught
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          The same ten steps, in the same order, every time. You always know what is coming — and nothing is ever
          used before it has been built.
        </p>
        <ol className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {METHOD_STEPS.map(([title, desc], i) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">{title}</span>
                <span className="text-muted-foreground"> — {desc}</span>
              </p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* ------------------------------------------------ parts */}
      <Reveal as="section" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-foreground">The five parts</h2>
          <p className="text-xs text-muted-foreground">Each part ends with an assessment and a Python workshop</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {course.parts.map((part, pi) => {
            const done = part.lessons.filter((l) => lessonsDone[l.slug]).length;
            const pct = Math.round((done / part.lessons.length) * 100);
            const cleared = diagnostic && (() => {
              const s = diagnostic.areaScores[part.letter];
              return s && s.total > 0 && s.correct / s.total >= 0.8;
            })();
            return (
              <button
                key={part.letter}
                type="button"
                onClick={() => navigate(`#/math/part/${part.letter}`)}
                className={cn(
                  "group dv-lift rounded-xl border bg-card p-5 text-left hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-e2",
                  done === part.lessons.length && "border-success-border"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
                    {part.letter}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-bold text-foreground">{part.title}</h3>
                    <p className="text-xs text-muted-foreground">{part.tagline}</p>
                  </div>
                  {done === part.lessons.length && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-success-text" />}
                  {done !== part.lessons.length && cleared && (
                    <span className="ml-auto rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-bold text-success-text">DIAG CLEARED</span>
                  )}
                </div>
                <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{part.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {part.lessons.length} lessons</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{Math.round(part.lessons.reduce((s, l) => s + l.minutes, 0) / 60)}h</span>
                  {pi === 0 && <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-violet-500">start here</span>}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <progress value={done} max={part.lessons.length} className="h-1.5 flex-1 accent-violet-600" />
                  <span className="w-16 shrink-0 text-right text-[11px] font-medium text-muted-foreground">{groupDigits(done)}/{part.lessons.length}</span>
                </div>
              </button>
            );
          })}
          <div className="flex flex-col justify-center rounded-xl border border-dashed p-5 text-center">
            <p className="text-sm font-semibold text-foreground">After Part E</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Linear algebra, calculus and the numerical instincts that machine learning is built on — all yours,
              all prerequisite-honest.
            </p>
            <button type="button" onClick={() => navigate("#/course")}
              className="mx-auto mt-3 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400">
              Continue to the Python course →
            </button>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------ honesty footer */}
      <section className="rounded-xl border border-border bg-muted/30 p-5 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">The honesty panel</p>
        <p className="mt-1.5">
          Every Python output in this course was produced by actually running the code (CPython-verified, 0 hand-written
          results). Every lesson carries all ten teaching steps — a verifier script enforces it. The prerequisite graph
          is acyclic and forward-only: no lesson can ask for an idea built later. The diagnostic can place you
          <InlineText text=" at the right entry point, but it can never place you past a weak foundation — that rule is code, not a promise." />
        </p>
      </section>
    </div>
  );
}
