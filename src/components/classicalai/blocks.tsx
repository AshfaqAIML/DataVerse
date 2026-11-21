"use client";

/**
 * The Classical AI textbook's block dispatcher — renders every block kind:
 * the base course blocks (text, code, tryIt, table, callout, steps, visual)
 * plus the sixteen specialized classical-AI components and the four
 * textbook devices (definition, math, example, exercise).
 */
import { useState } from "react";
import {
  ArrowRight,
  BookText,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Cpu,
  FlaskConical,
  Gauge,
  GraduationCap,
  Hash,
  Lightbulb,
  ListChecks,
  Quote,
  Scale,
  Sparkles,
  Terminal,
  Wrench,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassicalBlock } from "@/lib/classicalai/types";
import { BlockView, InlineText } from "@/components/course/blocks";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { useClassicalProgress } from "@/lib/classicalai/progress";
import { CodeBlock, OutputBlock } from "./code";
import { MathDisplayLine, MathInline } from "./math";
import {
  BayesNetViz,
  ConstraintGraphViz,
  DecisionTreeViz,
  GameTreeViz,
  GraphViz,
  InferenceChainViz,
  PlanningGraphViz,
  SearchTreeViz,
} from "./viz";

/* --------------------------------------------------------- small helpers */

function BlockHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="dv-lesson-h3 mt-10 flex items-center gap-2.5 text-ink">
      {children}
    </h3>
  );
}

/* ----------------------------------------------------- 1 · algorithm card */

function AlgorithmCard({ block }: { block: Extract<ClassicalBlock, { kind: "algorithm" }> }) {
  return (
    <section className="dv-card overflow-hidden rounded-2xl border border-viz-3/25 bg-surface shadow-e1">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-viz-3/20 bg-[color-mix(in_srgb,var(--dv-viz-3)_8%,var(--dv-surface))] px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-viz-3)_16%,transparent)]">
          <Cpu className="h-4.5 w-4.5 text-viz-3" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight text-ink">{block.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{block.family}</p>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <div>
            <p className="dv-kicker">The problem it solves</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{block.problem}</p>
          </div>
          <div>
            <p className="dv-kicker">The idea</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{block.idea}</p>
          </div>
          <div>
            <p className="dv-kicker">The strategy</p>
            <ol className="mt-2 space-y-2">
              {block.strategy.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dv-viz-3)_13%,transparent)] font-mono text-[11px] font-bold text-viz-3">
                    {i + 1}
                  </span>
                  <span><InlineText text={s} /></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="min-w-0 space-y-5">
          <div className="rounded-xl border border-success-border/50 bg-success-bg/40 px-4 py-3.5">
            <p className="dv-kicker flex items-center gap-1.5 text-success-text">
              <Scale className="h-3.5 w-3.5" /> Guarantees — with their conditions
            </p>
            <ul className="mt-2 space-y-1.5">
              {block.guarantees.map((g, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                  <span><InlineText text={g} /></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-subtle/50 px-4 py-3.5">
            <p className="dv-kicker flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-viz-3" /> Reach for it when
            </p>
            <ul className="mt-2 space-y-1.5">
              {block.useWhen.map((g, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <span><InlineText text={g} /></span>
                </li>
              ))}
            </ul>
          </div>
          {block.pitfalls && block.pitfalls.length > 0 && (
            <div className="rounded-xl border border-warning-border/50 bg-warning-bg/40 px-4 py-3.5">
              <p className="dv-kicker flex items-center gap-1.5 text-warning-text">
                <CircleAlert className="h-3.5 w-3.5" /> Pitfalls
              </p>
              <ul className="mt-2 space-y-1.5">
                {block.pitfalls.map((g, i) => (
                  <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-text" />
                    <span><InlineText text={g} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 2 · pseudocode */

function PseudocodeView({ block }: { block: Extract<ClassicalBlock, { kind: "pseudocode" }> }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-inset shadow-e1">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-2">
          <Hash className="h-3.5 w-3.5 text-viz-3" />
          {block.title}
        </span>
        <span className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ink-3">
          pseudocode
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.75] text-ink">
          <code>
            {block.lines.map((l, i) => (
              <span
                key={i}
                className={cn(
                  "block whitespace-pre",
                  l.tone === "key" && "rounded bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]",
                  l.tone === "muted" && "text-ink-3"
                )}
              >
                <span className="mr-3 inline-block w-5 select-none text-right text-ink-3/80">{i + 1}</span>
                <span style={{ paddingLeft: `${(l.indent ?? 0) * 1.6}rem` }}>{l.text}</span>
              </span>
            ))}
          </code>
        </pre>
        <div className="border-t border-border-subtle bg-surface/60 px-4 py-3.5 lg:border-l lg:border-t-0">
          <p className="dv-kicker mb-2">Margin notes</p>
          <ul className="space-y-2.5">
            {block.lines
              .map((l, i) => ({ l, i }))
              .filter(({ l }) => l.note)
              .map(({ l, i }) => (
                <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold text-viz-3">L{i + 1}</span>
                  <span>{l.note}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
      {block.note && (
        <p className="border-t border-border-subtle bg-surface px-4 py-2.5 text-[12.5px] text-ink-2">
          <InlineText text={block.note} />
        </p>
      )}
    </section>
  );
}

/* -------------------------------------------------------- 3 · python impl */

function PythonImplView({ block }: { block: Extract<ClassicalBlock, { kind: "pythonImpl" }> }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[15px] font-semibold text-ink">{block.title}</p>
        <p className="text-[13px] text-ink-3">{block.intent}</p>
      </div>
      <CodeBlock code={block.code} title={`${(block.title || "implementation").toLowerCase().replace(/\s+/g, "-")}.py`} />
      {(block.output || block.expectError) && (
        <OutputBlock output={block.output} error={block.expectError} note="The output above is what this exact program printed when the course was verified." />
      )}
      {block.walkthrough.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface px-4 py-3.5">
          <p className="dv-kicker mb-2 flex items-center gap-1.5">
            <BookText className="h-3.5 w-3.5 text-viz-3" /> Walkthrough
          </p>
          <ul className="space-y-2">
            {block.walkthrough.map((w, i) => (
              <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-inset font-mono text-[11px] font-bold text-ink-3">
                  {i + 1}
                </span>
                <span><InlineText text={w} /></span>
              </li>
            ))}
          </ul>
          {block.project && (
            <p className="mt-3 border-t border-border-subtle pt-2.5 font-mono text-[11px] text-ink-3">
              <Wrench className="mr-1.5 inline h-3.5 w-3.5" />
              reappears in: {block.project}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------- 4 · complexity */

function ComplexityView({ block }: { block: Extract<ClassicalBlock, { kind: "complexity" }> }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/60 px-4 py-2.5">
        <Gauge className="h-4 w-4 text-viz-3" />
        <p className="text-[13px] font-semibold text-ink">{block.title}</p>
        <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-ink-3">time · space</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="border-b border-border-subtle text-left text-[11px] uppercase tracking-wider text-ink-3">
              <th className="px-4 py-2 font-semibold">Algorithm</th>
              <th className="px-3 py-2 font-semibold">Best</th>
              <th className="px-3 py-2 font-semibold">Average</th>
              <th className="px-3 py-2 font-semibold">Worst</th>
              <th className="px-3 py-2 font-semibold">Space</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr
                key={r.algorithm}
                className={cn(
                  "border-b border-border-subtle/60 last:border-0",
                  r.highlight && "bg-[color-mix(in_srgb,var(--dv-viz-3)_7%,transparent)]"
                )}
              >
                <td className="px-4 py-2.5">
                  <span className={cn("font-medium", r.highlight ? "text-viz-3" : "text-ink")}>{r.algorithm}</span>
                  {r.note && <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">{r.note}</p>}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-ink-2">{r.best}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-ink-2">{r.average}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] font-medium text-ink">{r.worst}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-ink-2">{r.space}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.reading && (
        <p className="border-t border-border-subtle px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-3">
          <InlineText text={block.reading} />
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------- 7 & 9 · propositions */

const PROP_TONE: Record<string, string> = {
  default: "border-border-subtle bg-surface",
  law: "border-viz-3/35 bg-[color-mix(in_srgb,var(--dv-viz-3)_6%,var(--dv-surface))]",
  fallacy: "border-danger-border/50 bg-danger-bg/30",
  definition: "border-violet-400/35 bg-[color-mix(in_srgb,var(--dv-violet-500)_6%,var(--dv-surface))]",
};

function PropositionRow({ formula, name, reading, tone }: { formula: string; name?: string; reading: string; tone?: string }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", PROP_TONE[tone ?? "default"])}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <MathDisplayLine expr={formula} />
        {name && (
          <span className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
            tone === "fallacy" ? "border-danger-border/50 text-danger-text" : "border-border-subtle text-ink-3"
          )}>
            {name}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{reading}</p>
    </div>
  );
}

function PropositionsView({ block }: { block: Extract<ClassicalBlock, { kind: "propositions" }> }) {
  return (
    <section className="space-y-2.5">
      <p className="dv-kicker flex items-center gap-1.5">
        <Quote className="h-3.5 w-3.5 text-viz-3" /> {block.title}
      </p>
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {block.entries.map((e, i) => (
          <PropositionRow key={i} formula={e.formula} name={e.name} reading={e.reading} tone={e.tone} />
        ))}
      </div>
      {block.caption && <p className="text-[12.5px] leading-relaxed text-ink-3">{block.caption}</p>}
    </section>
  );
}

function PredicateLogicView({ block }: { block: Extract<ClassicalBlock, { kind: "predicateLogic" }> }) {
  return (
    <section className="space-y-3">
      <p className="dv-kicker flex items-center gap-1.5">
        <Quote className="h-3.5 w-3.5 text-viz-3" /> {block.title}
      </p>
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {block.entries.map((e, i) => (
          <PropositionRow key={i} formula={e.formula} name={e.name} reading={e.reading} tone={e.tone} />
        ))}
      </div>
      {block.unification && block.unification.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
          <p className="border-b border-border-subtle bg-surface-subtle/60 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-2">
            unification, worked
          </p>
          <div className="divide-y divide-border-subtle">
            {block.unification.map((u, i) => (
              <div key={i} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <MathDisplayLine expr={u.lhs} />
                  <span className="font-mono text-[13px] text-ink-3">≟</span>
                  <MathDisplayLine expr={u.rhs} />
                </div>
                {u.steps && u.steps.length > 0 && (
                  <ol className="mt-2 space-y-1 border-l border-border-subtle pl-3.5">
                    {u.steps.map((s, j) => (
                      <li key={j} className="font-mono text-[11.5px] leading-relaxed text-ink-3">{s}</li>
                    ))}
                  </ol>
                )}
                <p className="mt-2 font-mono text-[12px] font-semibold text-viz-3">σ = {u.result}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {block.caption && <p className="text-[12.5px] leading-relaxed text-ink-3">{block.caption}</p>}
    </section>
  );
}

/* ---------------------------------------------------------- 8 · truth table */

const VERDICT_STYLE: Record<string, string> = {
  tautology: "border-success-border bg-success-bg/50 text-success-text",
  contradiction: "border-danger-border bg-danger-bg/50 text-danger-text",
  contingent: "border-warning-border bg-warning-bg/50 text-warning-text",
  equivalent: "border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_9%,transparent)] text-viz-3",
  satisfiable: "border-border-strong bg-surface-subtle text-ink-2",
};

const VERDICT_WORD: Record<string, string> = {
  tautology: "tautology — true under every assignment",
  contradiction: "contradiction — false under every assignment",
  contingent: "contingent — true under some assignments only",
  equivalent: "the columns are equivalent",
  satisfiable: "satisfiable",
};

function TruthTableView({ block }: { block: Extract<ClassicalBlock, { kind: "truthTable" }> }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-subtle/60 px-4 py-2.5">
        <p className="text-[13px] font-semibold text-ink">{block.title}</p>
        {block.verdict && (
          <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", VERDICT_STYLE[block.verdict])}>
            {VERDICT_WORD[block.verdict]}
          </span>
        )}
      </div>
      <div className="overflow-x-auto px-1 py-1">
        <table className="mx-auto min-w-max text-center">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="w-8 px-2 py-2" aria-label="row number" />
              {block.columns.map((c, i) => (
                <th key={i} className={cn("min-w-[72px] px-4 py-2.5 text-[13px] font-semibold", i === block.columns.length - 1 ? "text-ink" : "text-ink-2")}>
                  <MathInline expr={c} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => {
              const marked = row.some((c) => typeof c === "object" && c.highlight);
              return (
                <tr key={i} className={cn("border-b border-border-subtle/50 last:border-0", marked && "bg-[color-mix(in_srgb,var(--dv-viz-3)_8%,transparent)]")}>
                  <td className="select-none px-2 py-1.5 text-right font-mono text-[11px] text-ink-3/80">{i + 1}</td>
                  {row.map((cell, j) => {
                    const v = typeof cell === "boolean" ? cell : cell.v;
                    const hi = typeof cell === "object" && cell.highlight;
                    return (
                      <td key={j} className={cn("px-4 py-1.5 font-mono text-[13px]", hi ? "font-bold text-viz-3" : "text-ink-2")}>
                        {v ? "T" : "F"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(block.verdictNote || block.caption) && (
        <p className="border-t border-border-subtle px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-3">
          {block.verdictNote}
          {block.verdictNote && block.caption ? " " : ""}
          {block.caption}
        </p>
      )}
    </section>
  );
}

/* ----------------------------------------------- textbook devices */

function DefinitionView({ block }: { block: Extract<ClassicalBlock, { kind: "definition" }> }) {
  return (
    <section className="dv-definition rounded-xl border border-violet-400/30 bg-[color-mix(in_srgb,var(--dv-violet-500)_5%,var(--dv-surface))] px-5 py-4">
      <p className="dv-kicker flex items-center gap-1.5 text-violet-500">
        <GraduationCap className="h-3.5 w-3.5" /> Definition · {block.term}
      </p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{block.informal}</p>
      <div className="mt-3 rounded-lg border border-violet-400/25 bg-surface px-4 py-3">
        <MathDisplayLine expr={block.formal} />
      </div>
      {block.why && (
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-3">
          <span className="font-semibold text-ink-2">Why the formality matters: </span>
          {block.why}
        </p>
      )}
    </section>
  );
}

function MathView({ block }: { block: Extract<ClassicalBlock, { kind: "math" }> }) {
  return (
    <section className="dv-math-block rounded-xl border border-border-subtle bg-surface px-5 py-4">
      {block.title && <p className="dv-kicker mb-3">{block.title}</p>}
      {block.displays && block.displays.length > 0 && (
        <div className="space-y-3">
          {block.displays.map((d, i) => (
            <MathDisplayLine key={i} expr={d.expr} label={d.label} />
          ))}
        </div>
      )}
      {block.derivation && (
        <div className="space-y-0">
          <p className="dv-kicker mb-2.5">{block.derivation.title}</p>
          <ol className="space-y-2.5">
            {block.derivation.steps.map((s, i) => (
              <li key={i} className="flex flex-col gap-1 border-l-2 border-viz-3/40 pl-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <MathDisplayLine expr={s.expr} />
                {s.reason && <span className="shrink-0 text-[12px] italic text-ink-3">{s.reason}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {block.caption && <p className="mt-3 border-t border-border-subtle pt-2.5 text-[12.5px] leading-relaxed text-ink-3">{block.caption}</p>}
    </section>
  );
}

function ExampleView({ block }: { block: Extract<ClassicalBlock, { kind: "example" }> }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/60 px-4 py-2.5">
        <BookText className="h-4 w-4 text-viz-3" />
        <p className="text-[13px] font-semibold text-ink">{block.title}</p>
        <span className="ml-auto rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ink-3">
          worked example
        </span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[14px] leading-relaxed text-ink-2">{block.problem}</p>
        <ol className="mt-4 space-y-3.5 border-l border-border-subtle pl-5">
          {block.steps.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dv-viz-3)_13%,transparent)] font-mono text-[11px] font-bold text-viz-3">
                {i + 1}
              </span>
              <p className="text-[13.5px] font-medium text-ink">{s.text}</p>
              {s.detail && <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{s.detail}</p>}
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-lg border border-success-border/50 bg-success-bg/40 px-4 py-3">
          <p className="dv-kicker text-success-text">Result</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{block.result}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ exercise */

function normalizeOutput(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\s+$/, "");
}

function ExerciseView({ block }: { block: Extract<ClassicalBlock, { kind: "exercise" }> }) {
  const passed = useClassicalProgress((s) => !!s.exercisesPassed[block.id]);
  const markPassed = useClassicalProgress((s) => s.markExercisePassed);
  const [answered, setAnswered] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<null | boolean>(null);

  const KIND_LABEL: Record<string, string> = {
    "concept-check": "Concept check",
    "predict-output": "Predict the output",
    trace: "Trace it by hand",
    "write-code": "Write the code",
  };

  const isCorrect = answered !== null && !!block.options?.[answered]?.correct;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border shadow-e1 transition-colors",
        passed ? "border-success-border/60 bg-success-bg/20" : "border-viz-3/30 bg-surface"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-subtle/50 px-4 py-2.5">
        <span className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--dv-viz-3)_13%,transparent)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-viz-3">
          <ListChecks className="h-3.5 w-3.5" /> {KIND_LABEL[block.exerciseKind]}
        </span>
        {block.concepts.map((c) => (
          <span key={c} className="rounded-full border border-border-subtle px-2 py-0.5 font-mono text-[11px] text-ink-3">
            {c}
          </span>
        ))}
        {passed && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-success-text">
            <CheckCircle2 className="h-3.5 w-3.5" /> solved
          </span>
        )}
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-[14.5px] leading-relaxed text-ink-2">{block.prompt}</p>

        {/* concept-check */}
        {block.exerciseKind === "concept-check" && block.options && (
          <div className="space-y-2">
            {block.options.map((o, i) => {
              const chosen = answered === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAnswered(i);
                    if (o.correct) markPassed(block.id);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150",
                    answered === null
                      ? "border-border-subtle bg-surface hover:border-viz-3/50 hover:shadow-e1"
                      : o.correct
                        ? "border-success-border bg-success-bg/40"
                        : chosen
                          ? "border-danger-border bg-danger-bg/30"
                          : "border-border-subtle bg-surface opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold",
                      answered !== null && o.correct
                        ? "border-success-text text-success-text"
                        : chosen
                          ? "border-danger-text text-danger-text"
                          : "border-border-strong text-ink-3"
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] leading-relaxed text-ink">{o.text}</span>
                    {answered !== null && (
                      <span className={cn("mt-1.5 block text-[12px] leading-relaxed", o.correct ? "text-success-text" : "text-ink-3")}>
                        {o.feedback}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {answered !== null && (
              <div className={cn("rounded-lg border px-4 py-3", isCorrect ? "border-success-border/60 bg-success-bg/30" : "border-warning-border/50 bg-warning-bg/25")}>
                <p className="text-[13px] font-medium text-ink">{isCorrect ? "Correct." : "Not quite."}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{block.explanation}</p>
                <details className="group mt-2.5">
                  <summary className="cursor-pointer font-mono text-[11px] font-semibold text-ink-3 hover:text-ink">
                    solution
                  </summary>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{block.solution}</p>
                </details>
              </div>
            )}
          </div>
        )}

        {/* predict-output */}
        {block.exerciseKind === "predict-output" && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  setChecked(null);
                }}
                placeholder="type the exact output…"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border-subtle bg-surface-inset px-3.5 font-mono text-[13px] text-ink placeholder:text-ink-3 focus:border-viz-3/60 focus:outline-none"
                aria-label="Your predicted output"
              />
              <button
                type="button"
                onClick={() => {
                  const ok = normalizeOutput(typed) === normalizeOutput(block.expectedOutput ?? block.solution);
                  setChecked(ok);
                  if (ok) markPassed(block.id);
                }}
                className="h-10 shrink-0 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Check
              </button>
            </div>
            {checked === true && (
              <p className="flex items-center gap-2 text-[13px] font-medium text-success-text">
                <CheckCircle2 className="h-4 w-4" /> Exactly right.
              </p>
            )}
            {checked === false && (
              <p className="flex items-center gap-2 text-[13px] font-medium text-warning-text">
                <CircleAlert className="h-4 w-4" /> Not yet — check spacing and punctuation, then try the reveal.
              </p>
            )}
          </div>
        )}

        {/* write-code */}
        {block.exerciseKind === "write-code" && (
          <div className="rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/50 px-3.5 py-2">
              <FlaskConical className="h-3.5 w-3.5 text-viz-3" />
              <span className="font-mono text-[11px] font-medium text-ink-2">solve it in the browser</span>
              {block.expectedOutput && (
                <span className="ml-auto font-mono text-[11px] text-ink-3">checked against the real output</span>
              )}
            </div>
            <div className="p-1">
              <PythonPlayground
                initialCode={block.starter ?? "# your solution here\n"}
                compact
                expectedOutput={block.expectedOutput}
                engineLabel="Python playground"
                firstLoadNote="First run downloads the Python engine once (~10 MB, cached afterwards by your browser)."
                onResult={(r) => {
                  if (r.ok && (!block.expectedOutput || r.checked)) markPassed(block.id);
                }}
              />
            </div>
          </div>
        )}

        {/* trace + reveal */}
        {(block.exerciseKind === "trace" || revealed || block.exerciseKind !== "concept-check") && (
          <details className="group rounded-lg border border-border-subtle bg-surface-subtle/40 px-4 py-2.5" open={revealed || undefined}>
            <summary
              className="cursor-pointer font-mono text-[11.5px] font-semibold uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
              onClick={(e) => {
                // details/summary toggle happens natively; record reveal
                if (!revealed) setRevealed(true);
                e.preventDefault();
                const det = (e.currentTarget.parentElement as HTMLDetailsElement);
                det.open = !det.open;
              }}
            >
              {revealed ? "solution & explanation" : "reveal the solution"}
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-[13px] leading-relaxed text-ink-2">{block.solution}</p>
              <p className="border-t border-border-subtle pt-2 text-[13px] leading-relaxed text-ink-3">{block.explanation}</p>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ dispatcher */

export function ClassicalBlockView({ block }: { block: ClassicalBlock }) {
  switch (block.kind) {
    case "algorithm":
      return <AlgorithmCard block={block} />;
    case "pseudocode":
      return <PseudocodeView block={block} />;
    case "pythonImpl":
      return <PythonImplView block={block} />;
    case "complexity":
      return <ComplexityView block={block} />;
    case "searchTree":
      return <SearchTreeViz block={block} />;
    case "stateSpace":
      return <GraphViz spec={block.graph} title={block.title} caption={block.graph.caption ?? block.solutionNote} accentNote={block.graph.caption ? block.solutionNote : undefined} />;
    case "propositions":
      return <PropositionsView block={block} />;
    case "truthTable":
      return <TruthTableView block={block} />;
    case "predicateLogic":
      return <PredicateLogicView block={block} />;
    case "knowledgeGraph":
      return (
        <div className="space-y-3">
          <GraphViz spec={block.graph} title={block.title} caption={block.graph.caption} />
          {block.queries && block.queries.length > 0 && (
            <div className="rounded-xl border border-border-subtle bg-surface px-4 py-3.5">
              <p className="dv-kicker mb-2 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-viz-3" /> queries this graph answers
              </p>
              <ul className="space-y-1.5">
                {block.queries.map((q, i) => (
                  <li key={i} className="font-mono text-[12px] leading-relaxed text-ink-2">? {q}</li>
                ))}
              </ul>
            </div>
          )}
          {block.schemaNote && (
            <p className="text-[12.5px] leading-relaxed text-ink-3">
              <span className="font-semibold text-ink-2">Schema: </span>
              {block.schemaNote}
            </p>
          )}
        </div>
      );
    case "constraintGraph":
      return <ConstraintGraphViz block={block} />;
    case "decisionTree":
      return <DecisionTreeViz block={block} />;
    case "gameTree":
      return <GameTreeViz block={block} />;
    case "inferenceChain":
      return <InferenceChainViz block={block} />;
    case "bayesNet":
      return <BayesNetViz block={block} />;
    case "planningGraph":
      return <PlanningGraphViz block={block} />;
    case "definition":
      return <DefinitionView block={block} />;
    case "math":
      return <MathView block={block} />;
    case "example":
      return <ExampleView block={block} />;
    case "exercise":
      return <ExerciseView block={block} />;
    default:
      return <BlockView block={block} />;
  }
}

/** Precomputed heading anchors: block index -> section id (no render-phase mutation). */
function headingAnchors(blocks: ClassicalBlock[]): Map<number, string> {
  const map = new Map<number, string>();
  let n = 0;
  blocks.forEach((b, i) => {
    if (b.kind === "heading") {
      n += 1;
      map.set(i, `section-${n}`);
    }
  });
  return map;
}

/** Render a lesson's blocks with auto section-ids for the table of contents. */
export function ClassicalBlocksList({ blocks }: { blocks: ClassicalBlock[] }) {
  const anchors = headingAnchors(blocks);
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <BlockHeading key={i} id={anchors.get(i) ?? `section-${i}`}>
              <span className="h-4 w-1 rounded-full bg-viz-3" />
              {block.text}
            </BlockHeading>
          );
        }
        if (block.kind === "text") {
          return (
            <p key={i} className="dv-lesson-text">
              <InlineText text={block.text} />
            </p>
          );
        }
        return <ClassicalBlockView key={i} block={block} />;
      })}
    </div>
  );
}

/** The section list for the right-hand table of contents. */
export function lessonSections(blocks: ClassicalBlock[]): Array<{ id: string; text: string }> {
  const out: Array<{ id: string; text: string }> = [];
  let n = 0;
  for (const b of blocks) {
    if (b.kind === "heading") {
      n += 1;
      out.push({ id: `section-${n}`, text: b.text });
    }
  }
  return out;
}
