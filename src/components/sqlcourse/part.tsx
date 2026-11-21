"use client";

/**
 * SqlPartView — one part of the SQL course, four tabs:
 *   Lessons, Exercises (12, tiered, auto-validated against reference
 *   solutions on real PostgreSQL), Assessment (8 questions, 80% to pass)
 *   and Project (mini project with a Lab-backed starter editor).
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Code2,
  Database,
  Dumbbell,
  Eye,
  FolderKanban,
  Hammer,
  Lightbulb,
  Play,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty, Part, SqlCourse, SqlExercise } from "@/lib/sqlcourse/types";
import { useSqlProgress } from "@/lib/sqlcourse/progress";
import { useSqlEngine, type ValidationVerdict, type SchemaTable } from "@/lib/sql-lab/useSqlEngine";
import { datasetName } from "@/content/sql/datasets";
import { SqlEditor } from "@/components/sql-lab/SqlEditor";
import { ResultGrid, ErrorPanel, EngineStatusBanner } from "@/components/sql-lab/panels";
import { InlineText } from "./blocks";
import { SqlAssessmentPanel } from "./quiz";

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

/* --------------------- sample tables preview --------------------- */

function SampleTablesChip({ tables, dataset }: { tables: string[]; dataset: string }) {
  const engine = useSqlEngine();
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState<SchemaTable[] | null>(null);
  const [previews, setPreviews] = useState<Record<string, Awaited<ReturnType<typeof engine.preview>>>>({});

  const load = async () => {
    setOpen(!open);
    if (schema) return;
    await engine.use(dataset as SqlExercise["dataset"]);
    const s = await engine.schema();
    if (s) setSchema(s.filter((t) => tables.includes(t.name)));
    for (const t of tables) {
      const p = await engine.preview(t, 5);
      setPreviews((prev) => ({ ...prev, [t]: p }));
    }
  };

  return (
    <div className="rounded-lg border bg-muted/20">
      <button
        type="button"
        onClick={() => void load()}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <Eye className="h-3.5 w-3.5" />
        Sample tables: <span className="font-mono text-foreground/80">{tables.join(", ")}</span>
        <span className="ml-auto">{open ? "hide" : "show 5 rows"}</span>
      </button>
      {open && schema && (
        <div className="dv-fade-up space-y-4 border-t px-3.5 py-3">
          {schema.map((t) => {
            const doc = (
              <span key={t.name} className="text-muted-foreground" />
            );
            const preview = previews[t.name];
            return (
              <div key={t.name} className="space-y-1.5">
                <p className="font-mono text-xs font-bold text-foreground">
                  {t.name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {t.rowCount} rows &middot; {t.columns.length} columns
                  </span>
                </p>
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {t.columns.map((c) => c.name + (c.primaryKey ? " 🔑" : "")).join(", ")}
                </p>
                {preview?.result ? (
                  <ResultGrid result={preview.result} compact />
                ) : (
                  <p className="text-[11px] text-muted-foreground">loading rows...</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------- SQL-mode exercise card --------------------- */

function SqlExerciseCard({ exercise }: { exercise: SqlExercise }) {
  const passed = useSqlProgress((s) => !!s.exercisesPassed[exercise.id]);
  const markPassed = useSqlProgress((s) => s.markExercisePassed);
  const engine = useSqlEngine();
  const [value, setValue] = useState(exercise.starter ?? "-- Write your SQL here\n");
  const [verdict, setVerdict] = useState<ValidationVerdict | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const tier = TIER_META[exercise.tier];

  const check = async () => {
    if (!exercise.solution || exercise.ordered === undefined) return;
    setChecking(true);
    setVerdict(null);
    const v = await engine.validate(exercise.dataset, value, exercise.solution, exercise.ordered);
    setVerdict(v);
    if (v?.pass) markPassed(exercise.id);
    setChecking(false);
  };

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-muted-foreground">{exercise.id.toUpperCase()}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tier.className)}>{tier.label}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Database className="h-3 w-3" />
          {datasetName(exercise.dataset)}
        </span>
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

      <div className="mb-3">
        <SampleTablesChip tables={exercise.sampleTables} dataset={exercise.dataset} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {exercise.concepts.map((c) => (
          <span key={c} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {c}
          </span>
        ))}
      </div>

      <SqlEditor value={value} onChange={setValue} height="h-40" onRunShortcut={() => void check()} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {checking ? "Checking on fresh data..." : "Check my answer"}
          <kbd className="ml-1 hidden rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-mono sm:inline">Ctrl+↵</kbd>
        </button>
        {(engine.status.phase === "boot" || engine.status.phase === "seed" || engine.status.phase === "validating") && (
          <span className="text-xs text-muted-foreground">
            <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" />
            {engine.status.detail ?? "Preparing PostgreSQL..."}
          </span>
        )}
      </div>

      {engine.engineError && (
        <div className="mt-3">
          <EngineStatusBanner status={engine.status} error={engine.engineError} />
        </div>
      )}

      {verdict && (
        <div
          className={cn(
            "dv-fade-up mt-4 rounded-lg border p-4",
            verdict.pass
              ? "border-success-border bg-success-bg/70"
              : "border-warning-border bg-warning-bg/70"
          )}
        >
          <p
            className={cn(
              "mb-2 text-sm font-bold",
              verdict.pass ? "text-success-text" : "text-warning-text"
            )}
          >
            {verdict.pass ? "Correct — outputs match. Solved!" : "Not quite yet"}
          </p>
          {verdict.reason && (
            <p className="text-sm leading-relaxed text-foreground/85">{verdict.reason}</p>
          )}
          {!verdict.pass && verdict.expected && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                Show the expected result
              </summary>
              <div className="mt-2">
                <ResultGrid result={verdict.expected} compact />
              </div>
            </details>
          )}
          {!verdict.pass && verdict.actualError && (
            <div className="mt-2">
              <ErrorPanel error={verdict.actualError} sql={value} />
            </div>
          )}
          {verdict.pass && (
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">Why this works: </span>
              <InlineText text={exercise.explanation} />
            </p>
          )}
        </div>
      )}

      {exercise.hint && (
        <details className="mt-3 rounded-lg border bg-muted/30 px-4 py-2.5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Need a hint?</summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <InlineText text={exercise.hint} />
          </p>
        </details>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          {showSolution ? "Hide the worked solution" : "Show the worked solution (try it yourself first)"}
        </button>
        {showSolution && (
          <div className="dv-fade-up mt-2 space-y-2">
            <div className="overflow-hidden rounded-lg border border-editor-border bg-editor-bg">
              <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">
                {exercise.solution?.trimEnd()}
              </pre>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">How it works: </span>
              <InlineText text={exercise.explanation} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- concept-mode exercise card --------------------- */

function ConceptExerciseCard({ exercise }: { exercise: SqlExercise }) {
  const passed = useSqlProgress((s) => !!s.exercisesPassed[exercise.id]);
  const markPassed = useSqlProgress((s) => s.markExercisePassed);
  const [chosen, setChosen] = useState<number | null>(null);
  const tier = TIER_META[exercise.tier];
  const answered = chosen !== null;
  const isCorrect = answered && !!exercise.choices?.[chosen]?.correct;

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-muted-foreground">{exercise.id.toUpperCase()}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tier.className)}>{tier.label}</span>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          concept
        </span>
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

      <div className="mb-3">
        <SampleTablesChip tables={exercise.sampleTables} dataset={exercise.dataset} />
      </div>

      <div className="space-y-2">
        {exercise.choices?.map((choice, ci) => {
          const isChosen = chosen === ci;
          return (
            <button
              key={ci}
              type="button"
              disabled={answered}
              onClick={() => {
                setChosen(ci);
                if (choice.correct) markPassed(exercise.id);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm leading-relaxed transition-colors",
                !answered && "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
                answered && choice.correct && "border-success-border bg-success-bg/70",
                answered && !choice.correct && isChosen && "border-danger-border bg-danger-bg/60",
                answered && !choice.correct && !isChosen && "opacity-60"
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 text-[11px] font-bold text-muted-foreground">
                {String.fromCharCode(65 + ci)}
              </span>
              <span>
                <InlineText text={choice.text} />
                {answered && (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{choice.feedback}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <p
          className={cn(
            "dv-fade-up mt-3 rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            isCorrect ? "bg-success-bg text-success-text" : "bg-muted/60 text-foreground/85"
          )}
        >
          <span className="font-semibold">{isCorrect ? "Correct. " : "Explanation: "}</span>
          <InlineText text={exercise.explanation} />
        </p>
      )}
    </div>
  );
}

/* --------------------- project panel --------------------- */

function SqlProjectPanel({ part }: { part: Part }) {
  const project = part.project;
  const done = useSqlProgress((s) => !!s.projectsDone[part.letter]);
  const markProject = useSqlProgress((s) => s.markProject);

  return (
    <div className="dv-fade-up space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
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
          Starter — open it in the SQL Lab and build there
        </h4>
        <div className="overflow-hidden rounded-lg border border-editor-border bg-editor-bg">
          <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">
            {project.starter.trimEnd()}
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          Copy this into the <span className="font-semibold text-foreground">SQL Lab</span> (or your local
          PostgreSQL) and work through the steps — the Lab gives you every sample database, a schema
          explorer and instant results.
        </p>
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
            "ml-auto inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
            done
              ? "border border-success-border bg-success-bg text-success-text"
              : "bg-blue-600 text-white hover:bg-blue-700"
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

/* --------------------- the part view --------------------- */

export function SqlPartView({
  course,
  part,
  navigate,
}: {
  course: SqlCourse;
  part: Part;
  navigate: (hash: string) => void;
}) {
  const [tab, setTab] = useState<"lessons" | "exercises" | "assessment" | "project">("lessons");
  const lessonsDone = useSqlProgress((s) => s.lessonsDone);
  const assessmentState = useSqlProgress((s) => s.assessments[part.letter]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [part.letter]);

  if (part.stub) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <button onClick={() => navigate("#/sql")} className="hover:text-foreground hover:underline">
              SQL Course
            </button>
            <span>/</span>
            <span className="text-foreground">Part {part.letter}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl font-black text-muted-foreground">
              {part.letter}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{part.title}</h1>
              <p className="text-sm text-muted-foreground">{part.tagline}</p>
            </div>
          </div>
        </header>
        <div className="rounded-xl border border-dashed bg-card/60 p-10 text-center">
          <p className="text-sm font-medium text-foreground">Coming soon</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {part.description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            This part is being written right now. The full course ships with every part complete — no
            placeholders, no stubs.
          </p>
        </div>
      </div>
    );
  }

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
          <button onClick={() => navigate("#/sql")} className="hover:text-foreground hover:underline">
            SQL Course
          </button>
          <span>/</span>
          <span className="text-foreground">Part {part.letter}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white">
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
            onClick={() => navigate(`#/sql/lesson/${firstUndone.slug}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-blue-700"
          >
            {doneCount === 0 ? `Start Part ${part.letter}` : "Continue"}
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
              tab === t.id ? "bg-background text-foreground shadow-e1" : "text-muted-foreground hover:text-foreground"
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
        <ol className="dv-fade-up space-y-2.5">
          {part.lessons.map((lesson, i) => {
            const isDone = !!lessonsDone[lesson.slug];
            return (
              <li key={lesson.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`#/sql/lesson/${lesson.slug}`)}
                  className="group flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left dv-lift hover:-translate-y-0.5 hover:border-blue-400 hover:bg-muted/30 sm:p-5"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      isDone
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-blue-100 group-hover:text-blue-800 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-300"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400">
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
                      {lesson.blocks.some((b) => b.kind === "lab") && (
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          hands-on lab
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
        <div className="dv-fade-up space-y-5">
          <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">How to practice: </span>
            each exercise shows its sample tables and runs on real PostgreSQL in your browser. Press{" "}
            <span className="font-mono">Check my answer</span> to run your query and the reference
            solution on two fresh copies of the data — matching outputs pass automatically. Hints
            first, solutions only after your own attempt: the struggle IS the learning.
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
                  {exs.map((ex) =>
                    ex.mode === "concept" ? (
                      <ConceptExerciseCard key={ex.id} exercise={ex} />
                    ) : (
                      <SqlExerciseCard key={ex.id} exercise={ex} />
                    )
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === "assessment" && (
        <div className="dv-fade-up">
          <SqlAssessmentPanel partLetter={part.letter} questions={part.assessment} />
        </div>
      )}

      {tab === "project" && <SqlProjectPanel part={part} />}
    </div>
  );
}
