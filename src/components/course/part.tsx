"use client";

/**
 * PartView — one chapter of the course, with four tabs:
 *   Lessons (the reading path), Exercises (tiered practice with the
 *   playground + auto-check), Assessment (8 questions, 80% to pass),
 *   and Project (the mini project with guided steps).
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Code2,
  Dumbbell,
  FolderKanban,
  Hammer,
  Lightbulb,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Difficulty, Exercise, Part } from "@/lib/course/types";
import { useCourseProgress } from "@/lib/course/progress";
import { InlineText } from "./blocks";
import { QuizCard, AssessmentPanel } from "./quiz";
import { PythonPlayground } from "@/components/playground/PythonPlayground";

const TIER_META: Record<Difficulty, { label: string; className: string }> = {
  beginner: {
    label: "Beginner",
    className: "bg-success-bg text-success-text",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-warning-bg text-warning-text",
  },
  advanced: {
    label: "Advanced",
    className: "bg-danger-bg text-danger-text",
  },
};

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const passed = useCourseProgress((s) => !!s.exercisesPassed[exercise.id]);
  const markPassed = useCourseProgress((s) => s.markExercisePassed);
  const [showSolution, setShowSolution] = useState(false);
  const tier = TIER_META[exercise.tier];

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-muted-foreground">{exercise.id.toUpperCase()}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tier.className)}>{tier.label}</span>
        {passed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-text">
            <CheckCircle2 className="h-3 w-3" /> solved
          </span>
        )}
      </div>

      <h3 className="mb-2 text-lg font-bold text-foreground">{exercise.title}</h3>
      <p className="mb-3 text-sm leading-relaxed text-foreground/90">
        <InlineText text={exercise.prompt} />
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {exercise.concepts.map((c) => (
          <span key={c} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {c}
          </span>
        ))}
      </div>

      <PythonPlayground
        initialCode={exercise.starter ?? "# Write your solution here\n"}
        expectedOutput={exercise.expectedOutput}
        editorHeight="h-44"
        onResult={(r) => {
          if (r.checked?.passed) markPassed(exercise.id);
        }}
      />

      {exercise.hint && (
        <details className="mt-3 rounded-lg border bg-muted/30 px-4 py-2.5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Need a hint?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <InlineText text={exercise.hint} />
          </p>
        </details>
      )}

      {exercise.solution !== undefined && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            {showSolution ? "Hide the worked solution" : "Show the worked solution (try it yourself first)"}
          </button>
          {showSolution && (
            <div className="mt-2 overflow-hidden rounded-lg border border-editor-border bg-editor-bg dv-fade-up">
              <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">
                {exercise.solution.trimEnd()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectPanel({ part }: { part: Part }) {
  const project = part.project;
  const done = useCourseProgress((s) => !!s.projectsDone[part.letter]);
  const markProject = useCourseProgress((s) => s.markProject);

  return (
    <div className="space-y-6 dv-fade-up">
      <div className="rounded-xl border border-success-border bg-success-bg/50 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-success-text" />
          <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
        </div>
        <p className="text-[15px] leading-7 text-foreground/90">
          <InlineText text={project.brief} />
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <ClipboardCheck className="h-4 w-4" />
            Requirements
          </h4>
          <ul className="space-y-2">
            {project.requirements.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <InlineText text={r} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Hammer className="h-4 w-4" />
            Build it step by step
          </h4>
          <ol className="space-y-2.5">
            {project.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-bg text-[11px] font-bold text-success-text">
                  {i + 1}
                </span>
                <InlineText text={s} />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Code2 className="h-4 w-4" />
          Starter file — build your project here
        </h4>
        <PythonPlayground initialCode={project.starter} editorHeight="h-72" />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {project.concepts.map((c) => (
            <span key={c} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => markProject(part.letter, !done)}
          className={cn(
            "ml-auto inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold dv-lift hover:-translate-y-0.5",
            done
              ? "border border-success-border bg-success-bg text-success-text"
              : "bg-success-solid text-white hover:bg-success-solid"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {done ? "Project marked done — undo" : "I finished this project"}
        </button>
      </div>

      {project.extension && (
        <aside className="rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-3.5 dark:border-violet-900/60 dark:bg-violet-950/30">
          <p className="flex gap-3 text-sm leading-relaxed text-foreground/85">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="font-semibold text-foreground">Level up: </span>
              <InlineText text={project.extension} />
            </span>
          </p>
        </aside>
      )}
    </div>
  );
}

export function PartView({
  course,
  part,
  navigate,
}: {
  course: Course;
  part: Part;
  navigate: (hash: string) => void;
}) {
  const [tab, setTab] = useState<"lessons" | "exercises" | "assessment" | "project">("lessons");
  const lessonsDone = useCourseProgress((s) => s.lessonsDone);
  const assessmentState = useCourseProgress((s) => s.assessments[part.letter]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [part.letter]);

  const doneCount = part.lessons.filter((l) => lessonsDone[l.slug]).length;
  const totalMinutes = part.lessons.reduce((sum, l) => sum + l.minutes, 0);
  const firstUndone = part.lessons.find((l) => !lessonsDone[l.slug]) ?? part.lessons[0];

  const tabs = [
    { id: "lessons" as const, label: "Lessons", icon: BookOpen, count: part.lessons.length },
    { id: "exercises" as const, label: "Exercises", icon: Dumbbell, count: part.exercises.length },
    { id: "assessment" as const, label: "Assessment", icon: ClipboardCheck, count: part.assessment.length },
    { id: "project" as const, label: "Mini project", icon: FolderKanban, count: undefined },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <button onClick={() => navigate("#/")} className="hover:text-foreground hover:underline">
            Course
          </button>
          <span>/</span>
          <span className="text-foreground">Part {part.letter}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-solid text-xl font-black text-white">
            {part.letter}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{part.title}</h1>
            <p className="text-sm text-muted-foreground">{part.tagline}</p>
          </div>
        </div>

        <p className="text-[15px] leading-7 text-foreground/90">{part.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {part.lessons.length} lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4" />
            {part.exercises.length} exercises
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />~{totalMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            {doneCount}/{part.lessons.length} lessons done
          </span>
          {assessmentState && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
              Assessment: {assessmentState.score}/{assessmentState.total}
            </span>
          )}
        </div>

        {tab === "lessons" && (
          <button
            type="button"
            onClick={() => navigate(`#/lesson/${firstUndone.slug}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-success-solid px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-solid dv-lift hover:-translate-y-0.5"
          >
            {doneCount === 0 ? "Start Part " + part.letter : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-e1"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.count !== undefined && (
              <span className="rounded-full bg-muted px-1.5 text-[11px] font-semibold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "lessons" && (
        <ol className="space-y-2.5 dv-fade-up">
          {part.lessons.map((lesson, i) => {
            const isDone = !!lessonsDone[lesson.slug];
            return (
              <li key={lesson.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`#/lesson/${lesson.slug}`)}
                  className="group flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left dv-lift hover:-translate-y-0.5 hover:border-success-text hover:bg-muted/30 sm:p-5"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      isDone
                        ? "bg-success-solid text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-success-bg group-hover:text-success-text"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground group-hover:text-success-text">
                        {lesson.title}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{lesson.slug}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lesson.minutes} min
                      </span>
                    </span>
                    <span className="block text-sm leading-relaxed text-muted-foreground">{lesson.summary}</span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {lesson.quiz.length > 0 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {lesson.quiz.length} quiz questions
                        </span>
                      )}
                      {lesson.blocks.some((b) => b.kind === "tryIt") && (
                        <span className="rounded-md bg-success-bg px-1.5 py-0.5 text-[11px] font-medium text-success-text">
                          hands-on playground
                        </span>
                      )}
                    </span>
                  </span>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {tab === "exercises" && (
        <div className="space-y-5 dv-fade-up">
          <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">How to practice: </span>
            each exercise opens in the browser playground. Press <span className="font-mono">Check</span> to run your
            code and compare against the expected output automatically. Hints first, solutions only after your own
            attempt — the struggle IS the learning.
          </p>
          {(["beginner", "intermediate", "advanced"] as const).map((tier) => {
            const exs = part.exercises.filter((e) => e.tier === tier);
            if (exs.length === 0) return null;
            return (
              <section key={tier} className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  {TIER_META[tier].label} exercises ({exs.length})
                </h3>
                <div className="space-y-5">
                  {exs.map((ex) => (
                    <ExerciseCard key={ex.id} exercise={ex} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === "assessment" && <AssessmentPanel partLetter={part.letter} questions={part.assessment} />}

      {tab === "project" && <ProjectPanel part={part} />}
    </div>
  );
}
