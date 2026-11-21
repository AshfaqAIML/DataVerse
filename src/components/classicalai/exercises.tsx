"use client";

/**
 * The course practice battery — tiered exercises with the platform's
 * honest grading: write-code exercises with expected output are checked
 * by RUNNING them in the browser; everything else reveals worked
 * solutions after an attempt.
 */
import { useState } from "react";
import { CheckCircle2, ChevronDown, Flame, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/course/types";
import { InlineText } from "@/components/course/blocks";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { useClassicalProgress } from "@/lib/classicalai/progress";

const TIER_STYLE: Record<string, { label: string; cls: string }> = {
  beginner: { label: "basic", cls: "border-success-border/50 bg-success-bg/40 text-success-text" },
  intermediate: { label: "intermediate", cls: "border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] text-viz-3" },
  advanced: { label: "advanced", cls: "border-warning-border/50 bg-warning-bg/40 text-warning-text" },
};

export function ExerciseBattery({ exercises }: { exercises: Exercise[] }) {
  return (
    <div className="space-y-3">
      {exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const passed = !!useClassicalProgress((s) => s.exercisesPassed[exercise.id]);
  const markPassed = useClassicalProgress((s) => s.markExercisePassed);
  const [open, setOpen] = useState(false);
  const tier = TIER_STYLE[exercise.tier] ?? TIER_STYLE.beginner;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-e1 transition-colors",
        passed ? "border-success-border/60" : "border-border-subtle"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider", tier.cls)}>
          {tier.label}
        </span>
        <p className="min-w-0 flex-1 text-[13.5px] font-medium text-ink">{exercise.title}</p>
        {passed && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-success-text">
            <CheckCircle2 className="h-3.5 w-3.5" /> solved
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 text-[12px] font-medium text-ink-2 transition-colors hover:text-ink"
          aria-expanded={open}
        >
          {open ? "Hide" : "Open"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border-subtle px-4 py-4">
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            <InlineText text={exercise.prompt} />
          </p>
          <div className="flex flex-wrap gap-1.5">
            {exercise.concepts.map((c) => (
              <span key={c} className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[11px] text-ink-3">
                {c}
              </span>
            ))}
          </div>

          {(exercise.starter || exercise.expectedOutput) && (
            <div className="rounded-xl border border-border-subtle">
              <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/50 px-3.5 py-2">
                <Flame className="h-3.5 w-3.5 text-viz-3" />
                <span className="font-mono text-[11px] font-medium text-ink-2">
                  {exercise.expectedOutput ? "solve and check in-browser" : "starter provided"}
                </span>
              </div>
              <div className="p-1">
                <PythonPlayground
                  initialCode={exercise.starter ?? "# your solution here\n"}
                  compact
                  expectedOutput={exercise.expectedOutput}
                  engineLabel="Python playground"
                  firstLoadNote="First run downloads the Python engine once (~10 MB, cached afterwards)."
                  onResult={(r) => {
                    if (r.ok && (!exercise.expectedOutput || r.checked)) markPassed(exercise.id);
                  }}
                />
              </div>
            </div>
          )}

          {exercise.hint && (
            <details className="rounded-lg border border-border-subtle bg-surface-subtle/40 px-4 py-2.5">
              <summary className="cursor-pointer text-[12.5px] font-medium text-ink-3">Need a hint?</summary>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                <InlineText text={exercise.hint} />
              </p>
            </details>
          )}

          <details className="rounded-lg border border-border-subtle bg-surface-subtle/40 px-4 py-2.5">
            <summary className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-ink-3">
              <Wrench className="h-3.5 w-3.5" /> Worked solution
            </summary>
            <pre className="mt-2.5 overflow-x-auto rounded-lg bg-surface-inset px-3.5 py-3 font-mono text-[12px] leading-relaxed text-ink">
              <code>{exercise.solution}</code>
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
