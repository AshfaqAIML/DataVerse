"use client";

/**
 * GuidedView — the step-by-step walkthrough: phase rail, current step
 * card (goal, instructions, three-level progressive hints, reference
 * snippets, checkpoint) and completion tracking persisted per project.
 */
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Circle, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { PHASE_LABELS } from "@/lib/dap/types";
import { CodeBlock, Collapse } from "./bits";
import { countStepsDone, dapStepKey, useDapProgress } from "@/lib/dap/progress";
import { cn } from "@/lib/utils";

const HINT_LABELS = ["Hint 1 · a nudge", "Hint 2 · the approach", "Hint 3 · a worked sketch"];

export function GuidedView({ project }: { project: DapProject }) {
  const { stepsDone, hintsRevealed, revealHint, toggleStep, resetProject } = useDapProgress();
  const done = countStepsDone(stepsDone, project.id);
  const firstUndone = useMemo(() => {
    const idx = project.guidedSteps.findIndex((_, i) => !stepsDone[dapStepKey(project.id, i)]);
    return idx === -1 ? project.guidedSteps.length - 1 : idx;
  }, [project, stepsDone]);
  const [current, setCurrent] = useState(firstUndone);
  const step = project.guidedSteps[Math.min(current, project.guidedSteps.length - 1)];
  const stepKey = dapStepKey(project.id, current);
  const isDone = Boolean(stepsDone[stepKey]);
  const revealed = hintsRevealed[stepKey] ?? 0;
  const pct = Math.round((done / project.guidedSteps.length) * 100);

  return (
    <div className="space-y-5">
      {/* progress header */}
      <div className="rounded-xl border border-border-subtle bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-ink">
            Guided walkthrough · {done}/{project.guidedSteps.length} steps complete
          </p>
          <button
            onClick={() => { if (confirm("Reset this project's guided progress?")) resetProject(project.id); }}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-danger-text"
          >
            <RotateCcw className="h-3 w-3" /> Reset progress
          </button>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-viz-10 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
        {/* ------------------------------------------------------ step rail */}
        <nav aria-label="Guided steps" className="max-h-[32rem] space-y-1 overflow-y-auto rounded-xl border border-border-subtle bg-card p-2 lg:sticky lg:top-24 lg:self-start">
          {project.guidedSteps.map((s, i) => {
            const key = dapStepKey(project.id, i);
            const stepDone = Boolean(stepsDone[key]);
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors",
                  i === current ? "bg-viz-10/10 text-ink" : "text-ink-2 hover:bg-accent"
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {stepDone ? (
                    <Check className="h-4 w-4 text-viz-10" aria-label="completed" />
                  ) : (
                    <Circle className={cn("h-4 w-4", i === current ? "text-viz-10" : "text-border-strong")} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-3">
                    {PHASE_LABELS[s.phase]}
                  </span>
                  <span className={cn("block leading-snug", i === current && "font-semibold")}>{s.title}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* ----------------------------------------------------- current step */}
        <article className="space-y-4">
          <header>
            <p className="eyebrow">
              Step {current + 1} of {project.guidedSteps.length} · {PHASE_LABELS[step.phase]}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{step.title}</h2>
            <p className="mt-2 rounded-lg border-l-4 border-viz-10 bg-viz-10/10 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink">
              <span className="font-semibold">Goal: </span>
              {step.goal}
            </p>
          </header>

          {/* instructions */}
          <div className="space-y-2.5">
            {step.instructions.map((para, i) => (
              <p key={i} className="text-[13.5px] leading-relaxed text-ink-2">
                {para}
              </p>
            ))}
          </div>

          {/* progressive hints */}
          <section className="rounded-xl border border-border-subtle bg-card p-4">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Lightbulb className="h-4 w-4 text-warning-text" />
              Progressive hints — reveal only when stuck
            </h3>
            <div className="mt-3 space-y-2">
              {[0, 1, 2].map((lvl) => {
                const unlocked = revealed >= lvl + 1;
                return unlocked ? (
                  <div key={lvl} className="rounded-lg border border-warning-border bg-warning-bg/60 px-3.5 py-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-warning-text">{HINT_LABELS[lvl]}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{step.hints[lvl]}</p>
                  </div>
                ) : (
                  <button
                    key={lvl}
                    onClick={() => revealHint(stepKey, lvl + 1)}
                    disabled={lvl > 0 && revealed < lvl}
                    className={cn(
                      "w-full rounded-lg border border-dashed px-3.5 py-2 text-left text-[12.5px] font-semibold transition-colors",
                      lvl > 0 && revealed < lvl
                        ? "cursor-not-allowed border-border-subtle text-ink-3 opacity-60"
                        : "border-warning-border bg-surface text-warning-text hover:bg-warning-bg/60"
                    )}
                  >
                    <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
                    Reveal {HINT_LABELS[lvl]}
                    {lvl > 0 && revealed < lvl ? " (reveal the previous hint first)" : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11.5px] italic text-ink-3">
              Hints are ordered by how much they give away — a nudge first, a worked sketch last. Using hints does
              not lower your score; not finishing does.
            </p>
          </section>

          {/* reference code */}
          {step.code ? (
            <Collapse
              summary={
                <>
                  <span className="font-semibold text-ink">Reference snippet</span>
                  <span className="font-mono text-[11px] text-ink-3">— {step.code.label}</span>
                </>
              }
            >
              <CodeBlock label={step.code.label} language={step.code.language} source={step.code.source} />
              <p className="mt-2.5 text-[12.5px] italic text-ink-3">
                One way to do this step — not the only way. Type it out and adapt it rather than pasting blindly.
              </p>
            </Collapse>
          ) : null}

          {/* checkpoint */}
          <div className="rounded-xl border border-border-subtle bg-surface-subtle/60 p-4">
            <p className="text-[12px] font-bold uppercase tracking-wide text-ink-3">Checkpoint</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{step.checkpoint}</p>
          </div>

          {/* nav + completion */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-card px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous step
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStep(stepKey, !isDone)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors",
                  isDone
                    ? "bg-viz-10 text-ink-inverse hover:bg-viz-10/85"
                    : "border border-viz-10 bg-surface text-viz-10 hover:bg-viz-10/10"
                )}
              >
                <Check className="h-4 w-4" />
                {isDone ? "Step complete" : "Mark step complete"}
              </button>
              <button
                onClick={() => setCurrent((c) => Math.min(project.guidedSteps.length - 1, c + 1))}
                disabled={current === project.guidedSteps.length - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-card px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-accent disabled:opacity-40"
              >
                Next step <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
