"use client";

/**
 * DapBrief — the project brief reader: the six framing sections every
 * engagement starts from, plus the deliverables checklist and the
 * evaluation rubric overview.
 */
import { ClipboardList, FileText } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { RUBRIC_META, RUBRIC_DIMENSIONS } from "@/lib/dap/types";
import { Bullets, SectionCard } from "./bits";

const KIND_LABEL: Record<string, string> = {
  id: "id", text: "text", categorical: "category", integer: "int", decimal: "decimal",
  currency: "$", percent: "%", date: "date", datetime: "datetime", boolean: "bool",
};

export function DapBrief({ project }: { project: DapProject }) {
  return (
    <div className="space-y-5">
      {/* The engagement frame */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Business background" step="01">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{project.businessBackground}</p>
        </SectionCard>
        <SectionCard title="Problem statement" step="02">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{project.problemStatement}</p>
        </SectionCard>
      </div>

      <SectionCard title="Business objectives" step="03">
        <Bullets items={project.businessObjectives} marker="→" />
      </SectionCard>

      <SectionCard title="Dataset description" step="04">
        <p className="text-[13.5px] leading-relaxed text-ink-2">{project.datasetDescription}</p>
        <p className="mt-3 rounded-lg bg-surface-subtle px-3 py-2 font-mono text-[12px] text-ink-3">
          {project.dataset.filename} · ~{project.dataset.rows.toLocaleString()} rows · download from the Dataset tab
        </p>
      </SectionCard>

      <SectionCard title="Data dictionary" step="05">
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2 font-semibold">Column</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody>
              {project.dataDictionary.map((d) => (
                <tr key={d.column} className="border-b border-border-subtle/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono font-medium text-ink">{d.column}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-ink-3">{KIND_LABEL[d.kind] ?? d.kind}</td>
                  <td className="px-3 py-2 text-ink-2">{d.description}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[11.5px] text-ink-3">{d.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Initial questions" step="06">
        <Bullets items={project.initialQuestions} marker="?" />
        <p className="mt-3 text-[12.5px] italic text-ink-3">
          Your analysis must answer all of these — the evaluation&apos;s interpretation dimension grades exactly this.
        </p>
      </SectionCard>

      {/* What you must produce */}
      <SectionCard title="Deliverables (either mode)" step="07">
        <Bullets items={project.independentBrief.deliverables} marker="✓" />
      </SectionCard>

      <SectionCard title="Guardrails" step="08">
        <Bullets items={project.independentBrief.guardrails} marker="!" />
      </SectionCard>

      {/* Rubric preview */}
      <SectionCard title="How you&apos;ll be evaluated" step="09" tone="quiet">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {RUBRIC_DIMENSIONS.map((d) => (
            <div key={d} className="rounded-lg border border-border-subtle bg-card p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink">{RUBRIC_META[d].label}</span>
                <span className="font-mono text-[11px] text-ink-3">{Math.round(RUBRIC_META[d].weight * 100)}%</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-ink-3">{RUBRIC_META[d].blurb}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-3">
          <ClipboardList className="h-3.5 w-3.5 shrink-0" />
          Submit work on the Evaluation tab — a GitHub link or uploaded files — for the instructor review.
        </p>
      </SectionCard>

      {/* Skills */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border-subtle p-4">
        <FileText className="h-4 w-4 text-ink-3" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Skills exercised:</span>
        {project.skills.map((s) => (
          <span key={s} className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[12px] font-medium text-ink-2">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
