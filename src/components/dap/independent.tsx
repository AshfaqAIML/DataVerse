"use client";

/**
 * IndependentView — the brief-and-dataset-only mode: the scenario, the
 * deliverables checklist (interactive), the guardrails, and a pointer
 * to evaluation. No hints live here by design.
 */
import { useState } from "react";
import { ArrowRight, CheckSquare, Download, Square } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { Bullets, SectionCard } from "./bits";
import { buildDataset, downloadDataset } from "@/lib/dap/datasets";
import { useDapProgress } from "@/lib/dap/progress";
import { cn } from "@/lib/utils";

const DELIVERABLE_KEY = "dap-deliverables";

export function IndependentView({
  project,
  onEvaluate,
}: {
  project: DapProject;
  onEvaluate: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { submissions } = useDapProgress();
  const priorSubs = submissions[project.id] ?? [];

  const toggle = (d: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border-2 border-dashed border-warning-border bg-warning-bg/40 p-5">
        <p className="eyebrow text-warning-text">Independent mode</p>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
          This is the portfolio path: from here on you get the business scenario, the dataset and the
          deliverables — no hints, no steps, no scaffolding. Every methodological choice (grain, cleaning
          policy, metrics, model) is yours to make and yours to defend in the evaluation. Work the way a
          hired analyst would: notebook first, cleaning log as you go, report at the end.
        </p>
        {priorSubs.length > 0 ? (
          <p className="mt-2 text-[12.5px] font-medium text-warning-text">
            You have {priorSubs.length} previous submission{priorSubs.length > 1 ? "s" : ""} on this project —
            a fresh independent run is the strongest portfolio piece.
          </p>
        ) : null}
      </div>

      <SectionCard title="The engagement" step="00">
        <p className="text-[13.5px] leading-relaxed text-ink-2">{project.independentBrief.scenario}</p>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Problem statement (the client's ask)" step="01">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{project.problemStatement}</p>
          <p className="mt-3 text-[12.5px] italic text-ink-3">
            The full brief (background, objectives, data dictionary, initial questions) is on the Project brief tab —
            that part you keep.
          </p>
        </SectionCard>
        <SectionCard title="Your dataset" step="02">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{project.datasetDescription}</p>
          <button
            onClick={() => downloadDataset(project, buildDataset(project))}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-viz-10 px-4 py-2 text-[13px] font-semibold text-ink-inverse transition-colors hover:bg-viz-10/85"
          >
            <Download className="h-4 w-4" /> Download {project.dataset.filename}
          </button>
        </SectionCard>
      </div>

      <SectionCard title="Deliverables checklist" step="03">
        <ul className="space-y-2">
          {project.independentBrief.deliverables.map((d) => {
            const on = checked.has(d);
            return (
              <li key={d}>
                <button
                  onClick={() => toggle(d)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed transition-colors",
                    on ? "border-viz-10/50 bg-viz-10/10 text-ink" : "border-border-subtle bg-card text-ink-2 hover:border-viz-10/50"
                  )}
                >
                  {on ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-viz-10" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-border-strong" />
                  )}
                  <span className={on ? "font-medium" : undefined}>{d}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12.5px] text-ink-3">
          {checked.size}/{project.independentBrief.deliverables.length} ticked — this checklist mirrors the
          evaluation&apos;s expectations.
        </p>
      </SectionCard>

      <SectionCard title="Guardrails (the stakeholder's red lines)" step="04" tone="quiet">
        <Bullets items={project.independentBrief.guardrails} marker="!" />
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-card p-5">
        <div>
          <p className="font-serif text-[15px] font-semibold text-ink">Analysis complete?</p>
          <p className="mt-1 text-[13px] text-ink-3">
            Submit your notebook or repository for the instructor evaluation — six dimensions, evidence-based feedback.
          </p>
        </div>
        <button
          onClick={onEvaluate}
          className="inline-flex items-center gap-2 rounded-full bg-viz-10 px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-e1 transition-colors hover:bg-viz-10/85"
        >
          Go to evaluation <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
