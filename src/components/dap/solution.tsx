"use client";

/**
 * SolutionView — the instructor's reference: the model answer for the
 * nine analysis sections (quality findings, cleaning, EDA, statistics,
 * charts, findings, recommendations, report). Gated behind a
 * deliberate reveal so it doesn't spoil the work.
 */
import { Eye, EyeOff } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { RUBRIC_DIMENSIONS, RUBRIC_META } from "@/lib/dap/types";
import { Bullets, SectionCard } from "./bits";
import { useDapProgress } from "@/lib/dap/progress";

export function SolutionView({ project }: { project: DapProject }) {
  const { solutionRevealed, revealSolution } = useDapProgress();
  const revealed = Boolean(solutionRevealed[project.id]);

  if (!revealed) {
    return (
      <div className="rounded-xl border-2 border-dashed border-danger-border bg-danger-bg/30 p-8 text-center">
        <EyeOff className="mx-auto h-6 w-6 text-danger-text" />
        <h2 className="mt-3 font-serif text-xl font-semibold text-ink">The instructor&apos;s reference</h2>
        <p className="mx-auto mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-2">
          This is the full model answer: the seeded quality defects and their treatments, the EDA and statistical
          plan, the expected findings, the recommendations and the executive summary. It is deliberately locked —
          reading it before attempting the project converts learning into spoilers.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-[13px] font-medium text-danger-text">
          Attempt the project first (either mode). Reveal when you want to compare your work against the reference.
        </p>
        <button
          onClick={() => { if (confirm("Reveal the instructor reference? Come back after attempting the analysis — this is the model answer.")) revealSolution(project.id); }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-danger-border bg-surface px-5 py-2.5 text-[13px] font-semibold text-danger-text transition-colors hover:bg-danger-bg/60"
        >
          <Eye className="h-4 w-4" /> I&apos;ve attempted it — reveal the reference
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-subtle/50 px-4 py-3">
        <p className="text-[12.5px] font-medium text-ink-2">
          Instructor reference for {project.code} — compare, don&apos;t copy: your findings&apos; <em>shape</em> should
          match; your exact numbers depend on your cleaning decisions.
        </p>
      </div>

      <SectionCard title="Seeded data-quality findings" step="A">
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2 font-semibold">Issue</th>
                <th className="px-3 py-2 font-semibold">Where</th>
                <th className="px-3 py-2 font-semibold">Detection</th>
                <th className="px-3 py-2 font-semibold">Treatment</th>
              </tr>
            </thead>
            <tbody>
              {project.dataQuality.map((q, i) => (
                <tr key={i} className="border-b border-border-subtle/60 align-top last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{q.issue}</td>
                  <td className="px-3 py-2 text-ink-2">{q.where}</td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-ink-3">{q.detection}</td>
                  <td className="px-3 py-2 text-ink-2">{q.treatment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Cleaning plan" step="B">
        <ul className="space-y-2.5">
          {project.cleaningPlan.map((c, i) => (
            <li key={i} className="rounded-lg border border-border-subtle bg-card p-3">
              <p className="text-[13.5px] font-medium text-ink">{c.action}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{c.rationale}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Exploratory analysis plan" step="C">
          <ul className="space-y-2.5">
            {project.edaPlan.map((e, i) => (
              <li key={i}>
                <p className="text-[13px] font-semibold text-ink">{e.question}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-semibold">Method:</span> {e.method}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-semibold">Expected:</span> {e.expectation}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Statistical analysis plan" step="D">
          <ul className="space-y-2.5">
            {project.statisticsPlan.map((s, i) => (
              <li key={i}>
                <p className="text-[13px] font-semibold text-ink">{s.technique}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-semibold">Purpose:</span> {s.purpose}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-semibold">Expected:</span> {s.expectation}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="The visual set" step="E">
        <ul className="space-y-2.5">
          {project.visualisationPlan.map((v, i) => (
            <li key={i} className="rounded-lg border border-border-subtle bg-card p-3">
              <p className="text-[13.5px] font-semibold text-ink">{v.chart}</p>
              <p className="mt-1 text-[12.5px] text-ink-2"><span className="font-semibold">Answers:</span> {v.answers}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-3"><span className="font-semibold">How to read:</span> {v.reads}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Expected findings" step="F">
        <Bullets items={project.findings} marker="→" />
      </SectionCard>

      <SectionCard title="Recommendations" step="G">
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-[11px] uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2 font-semibold">Action</th>
                <th className="px-3 py-2 font-semibold">Why</th>
                <th className="px-3 py-2 font-semibold">Impact</th>
                <th className="px-3 py-2 font-semibold">Horizon</th>
              </tr>
            </thead>
            <tbody>
              {project.recommendations.map((r, i) => (
                <tr key={i} className="border-b border-border-subtle/60 align-top last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{r.what}</td>
                  <td className="px-3 py-2 text-ink-2">{r.why}</td>
                  <td className="px-3 py-2 text-ink-2">{r.impact}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-3">{r.horizon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Executive summary & report structure" step="H">
        <p className="rounded-lg border-l-4 border-viz-10 bg-viz-10/10 px-3.5 py-3 text-[13.5px] leading-relaxed text-ink">
          {project.finalReport.executiveSummary}
        </p>
        <ol className="mt-3 space-y-1">
          {project.finalReport.structure.map((s, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-ink-2">
              <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.replace(/^\d+\.\s*/, "")}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard title="What the evaluator looks for" step="I" tone="quiet">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RUBRIC_DIMENSIONS.map((d) => {
            const checks = project.evaluationChecks[d];
            if (!checks?.length) return null;
            return (
              <div key={d} className="rounded-lg border border-border-subtle bg-card p-3.5">
                <p className="text-[13px] font-semibold text-ink">{RUBRIC_META[d].label}</p>
                <ul className="mt-1.5 space-y-1">
                  {checks.map((c, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-2">
                      <span className="text-viz-10">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
