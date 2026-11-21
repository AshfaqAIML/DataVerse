"use client";

/**
 * SqlCaseStudiesView / SqlCaseView — the real-world case studies.
 *
 * One case study per sample database: a business scenario, the context
 * worth knowing, and 3-5 progressive questions — each auto-validated
 * against a verified reference solution, with a professional's
 * explanation.
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Beaker,
  CheckCircle2,
  Database,
  Info,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStudy, CaseQuestion } from "@/lib/sqlcourse/types";
import { useSqlProgress } from "@/lib/sqlcourse/progress";
import { useSqlEngine, type ValidationVerdict } from "@/lib/sql-lab/useSqlEngine";
import { SqlEditor } from "@/components/sql-lab/SqlEditor";
import { ResultGrid, ErrorPanel, EngineStatusBanner } from "@/components/sql-lab/panels";
import { InlineText } from "./blocks";
import { Reveal } from "@/components/academy/motion";

function CaseQuestionCard({
  question,
  dataset,
  index,
  total,
}: {
  question: CaseQuestion;
  dataset: CaseStudy["id"];
  index: number;
  total: number;
}) {
  const passed = useSqlProgress((s) => !!s.caseQuestionsPassed[question.id]);
  const markPassed = useSqlProgress((s) => s.markCaseQuestionPassed);
  const engine = useSqlEngine();
  const [value, setValue] = useState(question.starter ?? "-- Write your SQL here\n");
  const [verdict, setVerdict] = useState<ValidationVerdict | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const check = async () => {
    setChecking(true);
    setVerdict(null);
    const v = await engine.validate(dataset, value, question.solution, question.ordered);
    setVerdict(v);
    if (v?.pass) markPassed(question.id);
    setChecking(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 sm:p-6",
        passed && "border-success-border"
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
          {index + 1}
        </span>
        <h3 className="text-lg font-bold text-foreground">{question.title}</h3>
        {passed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-text">
            <CheckCircle2 className="h-3 w-3" /> solved
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          question {index + 1} of {total}
        </span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-foreground/90">
        <InlineText text={question.problem} />
      </p>

      <SqlEditor value={value} onChange={setValue} height="h-40" onRunShortcut={() => void check()} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-violet-700 disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {checking ? "Checking on fresh data..." : "Check my answer"}
        </button>
        {(engine.status.phase === "boot" ||
          engine.status.phase === "seed" ||
          engine.status.phase === "validating") && (
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
            {verdict.pass ? "Correct — that is exactly what the business needed." : "Not quite yet"}
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
        </div>
      )}

      {question.hint && (
        <details className="mt-3 rounded-lg border bg-muted/30 px-4 py-2.5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Need a hint?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <InlineText text={question.hint} />
          </p>
        </details>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          {showSolution ? "Hide the professional's solution" : "Show how a professional would do it"}
        </button>
        {showSolution && (
          <div className="dv-fade-up mt-2 space-y-2">
            <div className="overflow-hidden rounded-lg border border-editor-border bg-editor-bg">
              <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">
                {question.solution.trimEnd()}
              </pre>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">The professional&apos;s reasoning: </span>
              <InlineText text={question.explanation} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SqlCaseView({
  study,
  navigate,
}: {
  study: CaseStudy;
  navigate: (hash: string) => void;
}) {
  const caseDone = useSqlProgress((s) => s.caseQuestionsPassed);
  const solved = study.questions.filter((q) => caseDone[q.id]).length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [study.id]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <button onClick={() => navigate("#/sql")} className="hover:text-foreground hover:underline">
            SQL Course
          </button>
          <span>/</span>
          <button onClick={() => navigate("#/sql/cases")} className="hover:text-foreground hover:underline">
            Case studies
          </button>
          <span>/</span>
          <span className="text-foreground">{study.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Beaker className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {study.title}
            </h1>
            <p className="text-sm text-muted-foreground">{study.domain} case study</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            runs on the {study.id} database
          </span>
        </div>

        <div className="rounded-xl border bg-muted/30 p-5">
          <p className="text-[15px] leading-7 text-foreground/90">
            <InlineText text={study.scenario} />
          </p>
        </div>

        {study.context.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">
              <Info className="h-4 w-4" />
              Know your data
            </p>
            <ul className="space-y-1.5">
              {study.context.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <InlineText text={c} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm font-medium text-muted-foreground">
          {solved}/{study.questions.length} questions solved
        </p>
      </header>

      <Reveal className="space-y-6">
        {study.questions.map((q, i) => (
          <CaseQuestionCard
            key={q.id}
            question={q}
            dataset={study.id}
            index={i}
            total={study.questions.length}
          />
        ))}
      </Reveal>

      {study.takeaways.length > 0 && (
        <Reveal as="section" className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-900/60 dark:bg-violet-950/20 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-violet-800 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            What this case taught you
          </h2>
          <ul className="space-y-2">
            {study.takeaways.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-7 text-foreground/90">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                <InlineText text={t} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <footer className="flex justify-between border-t pt-6">
        <button
          type="button"
          onClick={() => navigate("#/sql/cases")}
          className="rounded-lg border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
        >
          All case studies
        </button>
        <button
          type="button"
          onClick={() => navigate("#/sql/lab")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Explore freely in the Lab
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}

export function SqlCaseStudiesHub({
  cases,
  navigate,
}: {
  cases: CaseStudy[];
  navigate: (hash: string) => void;
}) {
  const caseDone = useSqlProgress((s) => s.caseQuestionsPassed);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <button onClick={() => navigate("#/sql")} className="hover:text-foreground hover:underline">
            SQL Course
          </button>
          <span>/</span>
          <span className="text-foreground">Case studies</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Real-world case studies
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-foreground/85">
          Six businesses, six databases, real questions a data person would actually be asked. Every
          question is auto-validated against a verified reference solution, and every solution comes
          with a professional&apos;s reasoning.
        </p>
      </header>
      <Reveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => {
          const solved = c.questions.filter((q) => caseDone[q.id]).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`#/sql/case/${c.id}`)}
              className="group rounded-xl border bg-card p-4 text-left dv-lift hover:-translate-y-0.5 hover:border-violet-400 hover:bg-muted/30"
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
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {c.scenario.slice(0, 130)}...
              </p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {solved}/{c.questions.length} solved
              </p>
            </button>
          );
        })}
      </Reveal>
    </div>
  );
}
