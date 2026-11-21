"use client";

/**
 * HomeView — the course landing page: hero with live stats, continue card,
 * the ten-part curriculum map with per-part progress, and how-it-works.
 */
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  Hammer,
  MonitorPlay,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/course/types";
import { allLessons, countAssessmentQuestions, countExercises, countQuizzes, totalMinutes } from "@/lib/course/types";
import { useCourseProgress } from "@/lib/course/progress";
import { Reveal } from "@/components/academy/motion";

export function HomeView({ course, navigate }: { course: Course; navigate: (hash: string) => void }) {
  const lessonsDone = useCourseProgress((s) => s.lessonsDone);
  const assessments = useCourseProgress((s) => s.assessments);
  const exercisesPassed = useCourseProgress((s) => s.exercisesPassed);
  const projectsDone = useCourseProgress((s) => s.projectsDone);
  const resetAll = useCourseProgress((s) => s.resetAll);

  const lessonCount = allLessons(course).length;
  const doneCount = allLessons(course).filter((l) => lessonsDone[l.lesson.slug]).length;
  const minutes = totalMinutes(course);
  const overall = lessonCount > 0 ? Math.round((doneCount / lessonCount) * 100) : 0;

  const flat = allLessons(course);
  const nextLesson = flat.find((l) => !lessonsDone[l.lesson.slug]);
  const lastLesson = flat[flat.length - 1];

  const stats = [
    { icon: BookOpen, label: "lessons", value: lessonCount },
    { icon: Dumbbell, label: "exercises", value: countExercises(course) },
    { icon: ClipboardCheck, label: "assessment questions", value: countAssessmentQuestions(course) },
    { icon: FlaskConical, label: "knowledge-check questions", value: countQuizzes(course) },
    { icon: Hammer, label: "mini projects", value: course.parts.length },
    { icon: Clock, label: "hours of learning", value: `~${Math.round(minutes / 60)}` },
  ];

  return (
    <div className="space-y-12">
      {/* hero */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-success-border bg-success-bg px-3 py-1 text-xs font-semibold text-success-text">
          <Sparkles className="h-3.5 w-3.5" />
          Zero to advanced · every output verified by actually running the code
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
          The Complete <span className="dv-gradient-text">Python Programming</span> Course
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          For someone who has <span className="font-semibold text-foreground">never written a line of code</span>.
          Ten parts take you from &ldquo;what is programming?&rdquo; to advanced Python — with plain-English lessons,
          visual explanations, runnable code, tiered exercises, chapter assessments, mini projects, and a Python
          playground built into every page.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(nextLesson ? `#/lesson/${nextLesson.lesson.slug}` : "#/lesson/a-01")}
            className="inline-flex items-center gap-2 rounded-lg bg-success-solid px-6 py-3 text-sm font-semibold text-white hover:bg-success-solid dv-lift hover:-translate-y-0.5"
          >
            {doneCount === 0 ? (
              <>
                <GraduationCap className="h-4 w-4" />
                Start with your first lesson
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                {nextLesson ? `Continue: ${nextLesson.lesson.title}` : "You finished every lesson"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("#/playground")}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/50"
          >
            <Terminal className="h-4 w-4" />
            Open the Python playground
          </button>
        </div>

        {/* progress + stats */}
        <div className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Your progress</p>
            <p className="text-sm text-muted-foreground">
              {doneCount}/{lessonCount} lessons · {overall}%
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success-text transition-all dv-meter"
              style={{ width: `${Math.max(overall, 2)}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/40 p-3 text-center">
                <s.icon className="mx-auto mb-1.5 h-4 w-4 text-success-text" />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* curriculum map */}
      <Reveal as="section" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">The curriculum — ten parts, A to J</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each part: complete lessons, beginner/intermediate/advanced exercises, an 8-question assessment, and a
              mini project.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {course.parts.map((part) => {
            const partDone = part.lessons.filter((l) => lessonsDone[l.slug]).length;
            const pct = Math.round((partDone / part.lessons.length) * 100);
            const partNext = part.lessons.find((l) => !lessonsDone[l.slug]);
            const assessment = assessments[part.letter];
            return (
              <button
                key={part.letter}
                type="button"
                onClick={() => navigate(`#/part/${part.letter}`)}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 text-left dv-lift hover:-translate-y-0.5 hover:border-success-text hover:shadow-e2"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black",
                        pct === 100
                          ? "bg-success-solid text-white"
                          : "bg-muted text-foreground group-hover:bg-success-bg group-hover:text-success-text"
                      )}
                    >
                      {part.letter}
                    </span>
                    <div>
                      <h3 className="font-bold leading-tight text-foreground">{part.title}</h3>
                      <p className="text-xs text-muted-foreground">{part.tagline}</p>
                    </div>
                  </div>
                  {pct === 100 && <CheckCircle2 className="h-5 w-5 shrink-0 text-success-text" />}
                </div>

                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{part.description}</p>

                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {part.lessons.length} lessons
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5" />
                    {part.exercises.length} exercises
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {assessment ? `assessment ${assessment.score}/${assessment.total}` : "8-question assessment"}
                  </span>
                  {projectsDone[part.letter] && (
                    <span className="inline-flex items-center gap-1 text-success-text">
                      <Hammer className="h-3.5 w-3.5" /> project done
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-success-text dv-meter" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {partNext ? (partDone === 0 ? "Start" : `${partDone}/${part.lessons.length}`) : "Complete"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* how it works */}
      <Reveal as="section" className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">How this course teaches</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Lessons that assume nothing",
              text: "Every concept starts from everyday life, then builds to the formal definition. No jargon without explanation, no skipped foundations.",
            },
            {
              icon: MonitorPlay,
              title: "Code you can run anywhere",
              text: "Every example shows its real, verified output — and opens in the built-in browser playground so you can change it and run it again.",
            },
            {
              icon: Dumbbell,
              title: "Practice at three levels",
              text: "Beginner, intermediate and advanced exercises in every part — with hints, auto-checked outputs and worked solutions.",
            },
            {
              icon: ClipboardCheck,
              title: "Assessments and projects",
              text: "Each part ends with an 8-question assessment (80% to pass) and a mini project that turns the chapter into something real.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5">
              <f.icon className="mb-3 h-5 w-5 text-success-text" />
              <h3 className="mb-1.5 text-sm font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* reset */}
      {doneCount > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            Progress is saved in this browser (localStorage) — nothing leaves your machine.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all course progress in this browser? This cannot be undone.")) resetAll();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset progress
          </button>
        </div>
      )}
    </div>
  );
}
