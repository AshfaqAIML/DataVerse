"use client";

/**
 * DiagnosticView — the prerequisite diagnostic and its adaptive result.
 *
 * One question at a time, gentle tone, back-navigation allowed. The result
 * screen shows per-area scores, the placement (which can never skip past a
 * weak part), and the dependency-ordered revision list.
 */
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, Compass, HeartHandshake, RefreshCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/focus-trap";
import type { MathCourse } from "@/lib/mathcourse/types";
import { computeDiagnosticResult } from "@/lib/mathcourse/diagnostic";
import { useMathProgress } from "@/lib/mathcourse/progress";

export function DiagnosticView({ course, navigate }: { course: MathCourse; navigate: (hash: string) => void }) {
  const recordDiagnostic = useMathProgress((s) => s.recordDiagnostic);
  const existing = useMathProgress((s) => s.diagnostic);
  const [stage, setStage] = useState<"intro" | "test" | "result">(existing ? "result" : "intro");
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ReturnType<typeof computeDiagnosticResult> | null>(null);

  const questions = course.diagnostic.questions;
  const q = questions[idx];
  const answeredCount = questions.filter((qq) => picks[qq.id] !== undefined).length;

  const finish = (finalPicks: Record<string, number>) => {
    const r = computeDiagnosticResult(course, { picks: finalPicks });
    setResult(r);
    recordDiagnostic({
      takenAt: new Date().toISOString(),
      areaScores: r.areaScores,
      placement: r.placement,
      revisionLessonIds: r.revisionLessonIds,
      correct: r.correct,
      total: r.total,
    });
    setStage("result");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const restart = () => {
    setPicks({});
    setIdx(0);
    setResult(null);
    setStage("intro");
  };

  // ------------------------------------------------------------------ intro
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 to-white p-6 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-card sm:p-8">
          <ClipboardCheck className="h-9 w-9 text-violet-600 dark:text-violet-400" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Where should you start?</h1>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{course.diagnostic.intro}</p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/90">
            <li className="flex gap-2.5"><HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" /> {questions.length} questions, about 10 minutes — school-level basics to early calculus.</li>
            <li className="flex gap-2.5"><Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" /> Wrong answers are useful: each one maps to the exact lesson that teaches it.</li>
            <li className="flex gap-2.5"><Compass className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" /> You can never be placed ahead of a weak foundation — even if later answers look strong.</li>
            <li className="flex gap-2.5"><RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" /> Retake any time. Skipping questions is allowed and counts as “teach me this”.</li>
          </ul>
          <button
            type="button"
            onClick={() => setStage("test")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Begin <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ test
  if (stage === "test") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setStage("intro")}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Intro
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>{idx + 1} / {questions.length}</span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-violet-600 transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Part {q.part} · {course.parts.find((p) => p.letter === q.part)?.title}
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-relaxed text-foreground"><InlineTextSafe text={q.prompt} /></h2>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => {
                  const nextPicks = { ...picks, [q.id]: oi };
                  setPicks(nextPicks);
                  if (idx + 1 < questions.length) {
                    setIdx(idx + 1);
                  } else {
                    finish(nextPicks);
                  }
                }}
                className="flex w-full items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm leading-relaxed transition-colors hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/40 text-[11px] font-bold">
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="text-foreground/90">{opt}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <button type="button" disabled={idx === 0} onClick={() => setIdx(idx - 1)}
              className={cn("inline-flex items-center gap-1 text-xs font-medium", idx === 0 ? "cursor-not-allowed text-muted-foreground/40" : "text-muted-foreground hover:text-foreground")}>
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <div className="flex items-center gap-3">
              {picks[q.id] !== undefined && <span className="text-[11px] text-muted-foreground">answered — pick again to change</span>}
              <button
                type="button"
                onClick={() => {
                  if (idx + 1 < questions.length) setIdx(idx + 1);
                  else finish(picks);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">{answeredCount} of {questions.length} answered</p>
      </div>
    );
  }

  // ------------------------------------------------------------------ result
  const r = result ?? computeDiagnosticResult(course, { picks });
  const placedLesson = course.parts.flatMap((p) => p.lessons).find((l) => l.slug === r.placement.lessonId);
  return (
    <div className="dv-fade-up mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-violet-300/70 bg-gradient-to-br from-violet-50 to-white p-6 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Your starting point</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Begin with {placedLesson ? placedLesson.title : r.placement.lessonId.toUpperCase()}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{r.placement.lessonId.toUpperCase()} · Part {r.placement.partId}</p>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{r.placement.note}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`#/math/lesson/${r.placement.lessonId}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start there <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("#/math")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-300 px-5 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40"
          >
            See the whole course
          </button>
          <button type="button" onClick={restart}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <RefreshCcw className="h-4 w-4" /> Retake
          </button>
        </div>
      </div>

      {/* area scores */}
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Area by area</h2>
        <div className="mt-3 space-y-3">
          {course.parts.map((p) => {
            const s = r.areaScores[p.letter];
            const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : null;
            return (
              <div key={p.letter} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm font-medium text-foreground">Part {p.letter} · {p.title}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("dv-meter h-full", pct !== null && pct >= 80 ? "bg-success-text" : "bg-warning-text")}
                    style={{ width: `${pct ?? 0}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {pct === null ? "—" : `${s!.correct}/${s!.total}`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Green (≥ 80%) means the diagnostic clears that area — those lessons stay open but optional. Amber means
          “start here”, whatever your later scores say: exposure is not mastery, and calculus on soft algebra is
          where math anxiety is born.
        </p>
      </div>

      {/* revision plan */}
      {r.revisionLessonIds.length > 0 && (
        <div className="rounded-xl border border-warning-border/70 bg-warning-bg/40 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-warning-text">
            <RefreshCcw className="h-4 w-4" /> Your revision list ({r.revisionLessonIds.length} lessons, dependency-ordered)
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-warning-text/80">
            Every question you missed (or skipped) maps to one lesson; each brings its own prerequisites along, so
            this list never asks you to revise something before its own foundation.
          </p>
          <ol className="mt-3 space-y-1.5">
            {r.revisionLessonIds.map((slug, i) => {
              const lesson = course.parts.flatMap((p) => p.lessons).find((l) => l.slug === slug);
              if (!lesson) return null;
              const part = course.parts.find((p) => p.lessons.some((l) => l.slug === slug))!;
              return (
                <li key={slug}>
                  <button type="button" onClick={() => navigate(`#/math/lesson/${slug}`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-warning-border/70 bg-background/70 px-3 py-2 text-left text-xs hover:border-warning-text">
                    <span className="font-mono font-bold text-warning-text">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{part.letter}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">{lesson.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-warning-text" />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function InlineTextSafe({ text }: { text: string }) {
  return <>{text}</>;
}
