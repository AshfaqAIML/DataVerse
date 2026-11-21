"use client";

/**
 * MathPartView — one part: lessons with readiness, the assessment
 * checkpoint, the Python workshop, and the part's revision radar.
 */
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Hammer,
  Lock,
  RefreshCcw,
  Sigma,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MathCourse, MathPart } from "@/lib/mathcourse/types";
import { allMathLessons } from "@/lib/mathcourse/types";
import { lessonReady, revisionRadar } from "@/lib/mathcourse/diagnostic";
import { useMathProgress } from "@/lib/mathcourse/progress";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { InlineText } from "@/components/course/blocks";
import { MathAssessmentPanel } from "./quiz";

type Tab = "lessons" | "assessment" | "workshop" | "revision";

export function MathPartView({ course, part, navigate }: { course: MathCourse; part: MathPart; navigate: (hash: string) => void }) {
  const lessonsDone = useMathProgress((s) => s.lessonsDone);
  const quizAnswers = useMathProgress((s) => s.quizAnswers);
  const assessments = useMathProgress((s) => s.assessments);
  const workshopsDone = useMathProgress((s) => s.workshopsDone);
  const markWorkshop = useMathProgress((s) => s.markWorkshop);
  const diagnostic = useMathProgress((s) => s.diagnostic);
  const [tab, setTab] = useState<Tab>("lessons");

  const cleared = diagnostic
    ? new Set(course.parts.filter((p) => {
        const s = diagnostic.areaScores[p.letter];
        return s && s.total > 0 && s.correct / s.total >= 0.8;
      }).map((p) => p.letter))
    : new Set<string>();

  const done = part.lessons.filter((l) => lessonsDone[l.slug]).length;
  const partIndex = course.parts.findIndex((p) => p.letter === part.letter);
  const prevPart = course.parts[partIndex - 1];
  const nextPart = course.parts[partIndex + 1];
  const radar = revisionRadar(course, part.letter, { lessonsDone, quizAnswers });
  const assessmentState = assessments[part.letter];

  const globalStart = allMathLessons(course).findIndex((l) => l.lesson.slug === part.lessons[0].slug) + 1;

  return (
    <div className="space-y-8">
      {/* header */}
      <header className="space-y-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <button onClick={() => navigate("#/math")} className="hover:text-foreground hover:underline">Math Course</button>
          <span>/</span>
          <span className="text-foreground">Part {part.letter}</span>
        </nav>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
            {part.letter}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{part.title}</h1>
            <p className="text-sm italic text-violet-700 dark:text-violet-300">{part.tagline}</p>
          </div>
        </div>
        <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">{part.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><BookOpen className="h-3.5 w-3.5" /> {part.lessons.length} lessons</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Clock className="h-3.5 w-3.5" /> ~{Math.round(part.lessons.reduce((s, l) => s + l.minutes, 0) / 60)} hours</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"><Sigma className="h-3.5 w-3.5" /> lessons {globalStart}–{globalStart + part.lessons.length - 1}</span>
          {assessmentState && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              <Target className="h-3.5 w-3.5" /> assessment {assessmentState.score}/{assessmentState.total}
            </span>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">When you finish this part you can</p>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {part.outcomes.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                <InlineText text={o} />
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-0">
        {([
          ["lessons", `Lessons (${done}/${part.lessons.length})`],
          ["assessment", assessmentState ? `Assessment ✓ ${assessmentState.score}/${assessmentState.total}` : "Assessment"],
          ["workshop", `Workshop${workshopsDone[part.letter] ? " ✓" : ""}`],
          ["revision", `Revision radar${radar.length > 0 ? ` (${radar.length})` : ""}`],
        ] as Array<[Tab, string]>).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-violet-600 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- lessons tab */}
      {tab === "lessons" && (
        <ol className="dv-fade-up space-y-3">
          {part.lessons.map((lesson, i) => {
            const isDone = !!lessonsDone[lesson.slug];
            const readiness = lessonReady(course, lesson, { lessonsDone, quizAnswers }, cleared);
            const unmetCount = readiness.unmet.length;
            return (
              <li key={lesson.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`#/math/lesson/${lesson.slug}`)}
                  className={cn(
                    "dv-lift flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-e1 sm:p-5",
                    isDone && "border-success-border/80"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isDone ? "bg-success-solid text-white" : "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
                  )}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">{lesson.slug.toUpperCase()}</span>
                      <h3 className="text-[15px] font-semibold text-foreground">{lesson.title}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.minutes} min</span>
                      <span className="inline-flex items-center gap-1"><Sigma className="h-3 w-3" /> {lesson.exercises.length} exercises · {lesson.quiz.length}-question check</span>
                      {lesson.visuals.some((v) => v.kind === "lab" || v.kind === "graph") && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">interactive</span>
                      )}
                    </div>
                  </div>
                  {!readiness.ready && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-2 py-1 text-[11px] font-semibold text-warning-text">
                      <Lock className="h-3 w-3" /> {unmetCount} prereq{unmetCount > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* ---------------------------------------------------- assessment tab */}
      {tab === "assessment" && (
        <div className="dv-fade-up space-y-4">
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 dark:border-violet-900/50 dark:bg-violet-950/15">
            <h2 className="text-base font-bold text-foreground">Part {part.letter} checkpoint</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Six questions across the whole part. Pass at 80% — misses feed the revision radar, so a lower score is a
              map, not a verdict.
            </p>
          </div>
          <MathAssessmentPanel partLetter={part.letter} questions={part.assessment.questions} />
        </div>
      )}

      {/* ---------------------------------------------------- workshop tab */}
      {tab === "workshop" && (
        <div className="dv-fade-up space-y-5">
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Hammer className="h-5 w-5 text-violet-600 dark:text-violet-400" /> {part.workshop.title}
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{part.workshop.brief}</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Requirements</p>
                <ul className="mt-2 space-y-1.5">
                  {part.workshop.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                      <InlineText text={r} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Suggested path</p>
                <ol className="mt-2 space-y-1.5">
                  {part.workshop.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">{i + 1}</span>
                      <InlineText text={s} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Your workshop bench (Python, in-browser)</p>
              <button
                type="button"
                onClick={() => markWorkshop(part.letter, !workshopsDone[part.letter])}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors",
                  workshopsDone[part.letter] ? "bg-success-text hover:bg-success-text" : "bg-violet-600 hover:bg-violet-700"
                )}
              >
                {workshopsDone[part.letter] ? "Completed — undo" : "Mark complete"}
              </button>
            </div>
            <PythonPlayground
              initialCode={part.workshop.starter}
              expectedOutput={part.workshop.expectedOutput}
              editorHeight="h-64"
              onResult={(r) => {
                if (r.checked?.passed) markWorkshop(part.letter, true);
              }}
            />
            <details>
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                Stuck? Reveal the reference solution (output machine-verified)
              </summary>
              <pre className="custom-scroll mt-2 overflow-x-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">{part.workshop.solution}</pre>
            </details>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- revision tab */}
      {tab === "revision" && (
        <div className="dv-fade-up space-y-4">
          {radar.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success-text" />
              <p className="mt-2 text-sm font-semibold text-foreground">Nothing flagged in this part</p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                The radar watches your lesson quizzes and your prerequisites. Miss a question or skip a foundation,
                and it will point you back in dependency order.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-warning-border/70 bg-warning-bg/50 p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-warning-text">
                  <RefreshCcw className="h-4 w-4" /> Revise in this order
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-warning-text/80">
                  Dependencies first, always — that is what keeps revision from becoming frustration.
                </p>
              </div>
              <ol className="space-y-2.5">
                {radar.map((r, i) => (
                  <li key={r.lessonId}>
                    <button
                      type="button"
                      onClick={() => navigate(`#/math/lesson/${r.lessonId}`)}
                      className="flex w-full items-start gap-3.5 rounded-xl border border-warning-border/80 bg-card p-4 text-left transition-colors hover:border-warning-text"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-bg text-xs font-bold text-warning-text">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          <span className="font-mono text-[11px] text-muted-foreground">{r.lessonId.toUpperCase()}</span> · {r.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.reason}</p>
                      </div>
                      <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-warning-text" />
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {/* part navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        {prevPart ? (
          <button onClick={() => navigate(`#/math/part/${prevPart.letter}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Part {prevPart.letter} — {prevPart.title}
          </button>
        ) : (
          <button onClick={() => navigate("#/math")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Course home
          </button>
        )}
        {nextPart ? (
          <button onClick={() => navigate(`#/math/part/${nextPart.letter}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
            Part {nextPart.letter} — {nextPart.title} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => navigate("#/course")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
            Continue with Python <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
