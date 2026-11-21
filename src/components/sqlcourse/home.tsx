"use client";

/**
 * SqlHomeView — the SQL course home: hero, progress, the ten-part
 * syllabus, the six sample databases, case studies, and the Lab.
 */
import {
  ArrowRight,
  Beaker,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Database,
  Dumbbell,
  GraduationCap,
  Play,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SqlCourse, CaseStudy } from "@/lib/sqlcourse/types";
import { countCaseQuestions } from "@/lib/sqlcourse/types";
import { useSqlProgress } from "@/lib/sqlcourse/progress";
import { DATASETS } from "@/content/sql/datasets";
import { Reveal } from "@/components/academy/motion";

const PART_ICONS: Record<string, string> = {
  A: "🧭", B: "🚀", C: "🔍", D: "✏️", E: "📊", F: "🔗", G: "🧩", H: "🧰", I: "🪟", J: "🎓",
};

export function SqlHomeView({
  course,
  cases,
  navigate,
}: {
  course: SqlCourse;
  cases: CaseStudy[];
  navigate: (hash: string) => void;
}) {
  const lessonsDone = useSqlProgress((s) => s.lessonsDone);
  const exercisesPassed = useSqlProgress((s) => s.exercisesPassed);
  const caseDone = useSqlProgress((s) => s.caseQuestionsPassed);

  const realParts = course.parts.filter((p) => !p.stub);
  const totalLessons = realParts.reduce((n, p) => n + p.lessons.length, 0);
  const doneLessons = realParts.reduce(
    (n, p) => n + p.lessons.filter((l) => lessonsDone[l.slug]).length,
    0
  );
  const totalExercises = realParts.reduce((n, p) => n + p.exercises.length, 0);
  const doneExercises = Object.keys(exercisesPassed).filter((k) => !k.startsWith("lab:")).length;
  const totalCaseQ = countCaseQuestions(cases);
  const doneCaseQ = cases.reduce(
    (n, c) => n + c.questions.filter((q) => caseDone[q.id]).length,
    0
  );
  const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const nextLesson =
    realParts.flatMap((p) => p.lessons).find((l) => !lessonsDone[l.slug]) ?? null;

  return (
    <div className="space-y-10">
      {/* hero */}
      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-card to-blue-500/25 p-6 dark:from-blue-950/40 dark:via-card dark:to-blue-500/15 sm:p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-1">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Database className="h-3.5 w-3.5" />
              {course.level}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              The Complete <span className="dv-gradient-text">SQL &amp; PostgreSQL</span> Course
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{course.subtitle}</p>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-foreground/85">
              {course.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => navigate(`#/sql/lesson/${nextLesson.slug}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  {doneLessons > 0 ? "Continue learning" : "Start the course"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                realParts.length > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-success-solid px-6 py-3 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" /> Every lesson complete
                  </span>
                )
              )}
              <button
                type="button"
                onClick={() => navigate("#/sql/lab")}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-background px-5 py-3 text-sm font-semibold text-blue-800 dv-lift hover:-translate-y-0.5 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <Play className="h-4 w-4" />
                Open the SQL Lab
              </button>
            </div>
          </div>
          <div className="w-full shrink-0 sm:w-64">
            <div className="rounded-xl border bg-card/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your progress
              </p>
              <p className="mt-1 text-3xl font-black text-foreground">{pct}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="dv-meter h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  {doneLessons}/{totalLessons} lessons
                </li>
                <li className="flex items-center gap-2">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {doneExercises}/{totalExercises} exercises
                </li>
                {totalCaseQ > 0 && (
                  <li className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {doneCaseQ}/{totalCaseQ} case questions
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* syllabus */}
      <Reveal as="section" className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">The programme</h2>
          <p className="text-sm text-muted-foreground">
            {realParts.length} of {course.parts.length} parts published — every part ships complete
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {course.parts.map((part) => {
            const isStub = !!part.stub;
            const partDone = part.lessons.filter((l) => lessonsDone[l.slug]).length;
            const partPct =
              part.lessons.length > 0 ? Math.round((partDone / part.lessons.length) * 100) : 0;
            return (
              <button
                key={part.letter}
                type="button"
                onClick={() => navigate(`#/sql/part/${part.letter}`)}
                className={cn(
                  "group flex items-start gap-4 rounded-xl border bg-card p-4 text-left dv-lift sm:p-5",
                  isStub
                    ? "border-dashed opacity-75"
                    : "hover:-translate-y-0.5 hover:border-blue-400 hover:bg-muted/30"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black",
                    isStub
                      ? "bg-muted text-muted-foreground"
                      : "bg-blue-600 text-white"
                  )}
                >
                  {part.letter}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400">
                      {part.title}
                    </span>
                    {isStub && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        coming soon
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {part.tagline}
                  </span>
                  {!isStub && (
                    <span className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {part.lessons.length} lessons
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {part.exercises.length} exercises
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {part.lessons.reduce((n, l) => n + l.minutes, 0)} min
                      </span>
                      {partPct > 0 && (
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{partPct}%</span>
                      )}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* sample databases */}
      <Reveal as="section" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Six realistic databases, yours to break
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATASETS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate(`#/sql/lab?db=${d.id}`)}
              className="group rounded-xl border bg-card p-4 text-left dv-lift hover:-translate-y-0.5 hover:border-blue-400 hover:bg-muted/30"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {d.name}
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {d.domain}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.blurb}</p>
            </button>
          ))}
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
          Every query runs on a private, in-memory copy of these databases inside your own browser
          (real PostgreSQL compiled to WebAssembly). Resetting is one click; nothing you do can ever
          reach a production system — there is none connected.
        </p>
      </Reveal>

      {/* case studies */}
      {cases.length > 0 && (
        <Reveal as="section" className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Real-world case studies</h2>
            <p className="text-sm text-muted-foreground">
              {cases.length} businesses &middot; {totalCaseQ} questions
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => {
              const solved = c.questions.filter((q) => caseDone[q.id]).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`#/sql/case/${c.id}`)}
                  className="group rounded-xl border bg-card p-4 text-left dv-lift hover:-translate-y-0.5 hover:border-blue-400 hover:bg-muted/30"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Beaker className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span className="font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-400">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.domain}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.scenario.slice(0, 110)}...</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {solved}/{c.questions.length} questions solved
                  </p>
                </button>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* audience */}
      <section className="rounded-xl border bg-muted/30 p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Who this is for
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-foreground/85">{course.audience}</p>
      </section>
    </div>
  );
}
