"use client";

/**
 * LAB 6 — Expert System Builder: a real production system. The rule base is
 * editable (inspect, add, delete rules); forward chaining runs the
 * recognize-act cycle with specificity-first conflict resolution and MYCIN
 * certainty-factor combination; backward chaining proves a chosen goal and
 * emits the WHY/HOW trace. Every firing in the trace is the engine
 * executing over the current rules and facts.
 */
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Chip,
  ChipRow,
  ExecutionControls,
  Insights,
  LabFrame,
  Panel,
  Pseudocode,
  Stat,
  StepNarration,
  useStepper,
} from "./framework";

/* ----------------------------------------------------------- the domain */

interface Rule {
  id: string;
  label: string;
  if: string[];
  then: string;
  cf: number;
  note?: string;
}

const OBSERVABLES = [
  "soggy_soil",
  "dry_soil",
  "yellow_leaves",
  "wilting",
  "spots",
  "pests_visible",
  "humid_air",
  "stunted_growth",
  "pale_leaves",
];

const BASE_RULES: Rule[] = [
  { id: "R1", label: "R1", if: ["soggy_soil", "yellow_leaves"], then: "overwatering", cf: 0.9 },
  { id: "R2", label: "R2", if: ["overwatering", "wilting"], then: "root_rot", cf: 0.8, note: "a derived rule: fires on R1's conclusion" },
  { id: "R3", label: "R3", if: ["dry_soil", "wilting"], then: "underwatering", cf: 0.95 },
  { id: "R4", label: "R4", if: ["spots", "humid_air"], then: "fungal_infection", cf: 0.85 },
  { id: "R5", label: "R5", if: ["pests_visible"], then: "pest_infestation", cf: 1.0 },
  { id: "R6", label: "R6", if: ["pest_infestation", "stunted_growth"], then: "severe_infestation", cf: 0.7 },
  { id: "R7", label: "R7", if: ["pale_leaves", "soggy_soil"], then: "nutrient_deficiency", cf: 0.6 },
  { id: "R8", label: "R8", if: ["yellow_leaves", "dry_soil"], then: "nutrient_deficiency", cf: 0.75 },
  { id: "R9", label: "R9", if: ["fungal_infection", "wilting"], then: "root_rot", cf: 0.6, note: "a second route to the same conclusion — watch the CFs combine" },
];

const DEFAULT_FACTS = ["soggy_soil", "yellow_leaves", "wilting"];

/* -------------------------------------------------------- the forward engine */

interface FCStep {
  note: string;
  line: number;
  phase: string;
  facts: Array<{ name: string; cf: number; from?: string }>;
  conflictSet: Array<{ rule: string; conditions: string[]; then: string }>;
  fired?: string;
  cycle: number;
  done?: boolean;
}

interface FCRun {
  steps: FCStep[];
  fired: Array<{ rule: string; from: string[]; then: string; cf: number }>;
  facts: Array<{ name: string; cf: number; from?: string }>;
  cycles: number;
}

function combineCf(a: number, b: number): number {
  if (a >= 0 && b >= 0) return a + b * (1 - a);
  if (a <= 0 && b <= 0) return a + b * (1 + a);
  return (a * b) / (1 - Math.min(Math.abs(a), Math.abs(b)));
}

function forwardChain(rules: Rule[], initialFacts: string[]): FCRun {
  const steps: FCStep[] = [];
  const facts = new Map<string, { cf: number; from?: string }>();
  for (const f of initialFacts) facts.set(f, { cf: 1 });
  const fired: Array<{ rule: string; from: string[]; then: string; cf: number }> = [];
  const fireHistory: string[] = [];
  let cycle = 0;

  const snap = (note: string, line: number, phase: string, extra?: Partial<FCStep>) =>
    steps.push({
      note,
      line,
      phase,
      cycle,
      facts: [...facts.entries()].map(([name, v]) => ({ name, cf: v.cf, from: v.from })),
      conflictSet: [],
      ...extra,
    });

  for (;;) {
    cycle += 1;
    // match phase
    const conflict = rules
      .filter((r) => r.if.every((c) => facts.has(c)))
      .filter((r) => {
        const existing = facts.get(r.then);
        if (!existing) return true;
        // would firing change anything? (higher cf via combination)
        const antecedent = Math.min(...r.if.map((c) => facts.get(c)!.cf));
        return combineCf(existing.cf, antecedent * r.cf) > existing.cf + 1e-9;
      })
      .map((r) => ({ rule: r.label, conditions: [...r.if], then: r.then }));

    if (conflict.length === 0) {
      snap(
        `Cycle ${cycle}: no rule's conditions are fully satisfied by working memory — the recognize-act cycle halts at a fixpoint after ${fired.length} firing${fired.length === 1 ? "" : "s"}.`,
        1,
        "fixpoint",
        { done: true }
      );
      break;
    }

    // conflict resolution: most conditions first (specificity), then rule order
    const bySpecificity = rules
      .filter((r) => conflict.some((c) => c.rule === r.label))
      .sort((a, b) => b.if.length - a.if.length || a.label.localeCompare(b.label));
    const chosen = bySpecificity[0];

    snap(
      `Cycle ${cycle}: match phase finds ${conflict.length} eligible rule${conflict.length > 1 ? "s" : ""} (${conflict.map((c) => c.rule).join(", ")}). Conflict resolution takes the most specific: ${chosen.label} — IF ${chosen.if.join(" AND ")} THEN ${chosen.then}.`,
      2,
      "match",
      { conflictSet: conflict }
    );

    // fire
    const antecedent = Math.min(...chosen.if.map((c) => facts.get(c)!.cf));
    const derived = antecedent * chosen.cf;
    const prev = facts.get(chosen.then);
    const newCf = prev ? combineCf(prev.cf, derived) : derived;
    const prevText = prev ? ` combining with the previous ${prev.cf.toFixed(2)} → ${newCf.toFixed(2)}` : "";
    facts.set(chosen.then, { cf: newCf, from: chosen.label });
    fired.push({ rule: chosen.label, from: [...chosen.if], then: chosen.then, cf: derived });
    fireHistory.push(chosen.label);
    snap(
      `Fire ${chosen.label}: antecedent CF = min(${chosen.if.map((c) => facts.get(c)?.cf.toFixed(2) ?? "1").join(", ")}) = ${antecedent.toFixed(2)}; × rule CF ${chosen.cf.toFixed(2)} → ${chosen.then} at ${derived.toFixed(2)}${prevText}.`,
      4,
      "act",
      { fired: chosen.label }
    );

    if (cycle > 60) {
      snap("Safety stop after 60 cycles.", 1, "stop", { done: true });
      break;
    }
  }

  return { steps, fired, facts: [...facts.entries()].map(([name, v]) => ({ name, cf: v.cf, from: v.from })), cycles: cycle - 1 };
}

/* -------------------------------------------------------- the backward engine */

interface BCStep {
  note: string;
  phase: string;
  goal: string;
  depth: number;
  status?: "proved" | "failed" | "asked";
  done?: boolean;
}

interface BCRun {
  steps: BCStep[];
  proved: boolean;
}

function backwardChain(rules: Rule[], facts: string[], goal: string): BCRun {
  const steps: BCStep[] = [];
  const known = new Set(facts);

  const push = (note: string, phase: string, g: string, depth: number, extra?: Partial<BCStep>) =>
    steps.push({ note, phase, goal: g, depth, ...extra });

  function prove(g: string, depth: number, trail: Set<string>): boolean {
    if (known.has(g)) {
      push(`Goal ${g}: it is already a known fact — proved, no rule needed.`, "fact", g, depth, { status: "proved" });
      return true;
    }
    const rulesFor = rules.filter((r) => r.then === g && !trail.has(r.label));
    if (rulesFor.length === 0) {
      push(`Goal ${g}: no known fact and no rule concludes it — the goal FAILS here.`, "fail", g, depth, { status: "failed" });
      return false;
    }
    for (const r of rulesFor) {
      push(`Goal ${g}: trying ${r.label} — IF ${r.if.join(" AND ")} THEN ${g}. Its conditions become sub-goals.`, "try-rule", g, depth);
      const sub = r.if.map((c) => {
        const t = new Set(trail);
        t.add(r.label);
        return prove(c, depth + 1, t);
      });
      if (sub.every(Boolean)) {
        known.add(g);
        push(`All of ${r.label}'s conditions proved — ${g} is ESTABLISHED (CF ${r.cf.toFixed(2)} × antecedents).`, "established", g, depth, { status: "proved" });
        return true;
      }
      push(`${r.label}'s conditions did not all prove — trying another route to ${g}…`, "backtrack", g, depth);
    }
    push(`Every route to ${g} failed — ${g} cannot be established.`, "fail", g, depth, { status: "failed" });
    return false;
  }

  push(`Backward chaining begins: is ${goal} true? The engine works goal-driven, asking only for what it needs.`, "query", goal, 0);
  const proved = prove(goal, 0, new Set());
  push(
    proved
      ? `Conclusion: ${goal} is PROVED from the known facts — and the trace above is the HOW explanation a clinician would read.`
      : `Conclusion: ${goal} is NOT provable from the known facts. The WHY trace shows exactly which sub-goal blocked each route.`,
    "verdict",
    goal,
    0,
    { done: true, status: proved ? "proved" : "failed" }
  );
  return { steps, proved };
}

/* --------------------------------------------------------------- the lab */

type Mode = "forward" | "backward";

export function ExpertLab() {
  const [mode, setMode] = useState<Mode>("forward");
  const [rules, setRules] = useState<Rule[]>(BASE_RULES);
  const [factsOn, setFactsOn] = useState<string[]>(DEFAULT_FACTS);
  const [goal, setGoal] = useState("root_rot");
  const [newIf, setNewIf] = useState<string[]>([]);
  const [newThen, setNewThen] = useState("");
  const [newCf, setNewCf] = useState(0.8);

  const derivables = useMemo(() => [...new Set(rules.map((r) => r.then))], [rules]);
  const palette = [...OBSERVABLES, ...derivables];

  const fcRun = useMemo(() => forwardChain(rules, factsOn), [rules, factsOn]);
  const bcRun = useMemo(() => backwardChain(rules, factsOn, goal), [rules, factsOn, goal]);

  const stepper = useStepper<FCStep | BCStep>(mode === "forward" ? fcRun.steps : bcRun.steps);
  const step = stepper.step;
  const activeLine = "line" in step ? step.line : undefined;

  const conclusions = fcRun.facts.filter((f) => !OBSERVABLES.includes(f.name));

  const toggleFact = (f: string) =>
    setFactsOn((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]));

  const addRule = () => {
    if (newIf.length === 0 || !newThen.trim()) return;
    const id = `R${rules.length + 1}`;
    setRules((rs) => [...rs, { id, label: id, if: [...newIf], then: newThen.trim().toLowerCase().replace(/\s+/g, "_"), cf: newCf }]);
    setNewIf([]);
    setNewThen("");
    setNewCf(0.8);
  };

  return (
    <LabFrame
      kicker="Laboratory 06 · knowledge-based systems"
      title="Expert System Builder"
      description="Inspect, edit and extend a real production system: forward chaining with conflict resolution and MYCIN-style certainty factors, plus goal-driven backward chaining with the WHY/HOW trace that made rule systems auditable. The domain is a greenhouse advisor — but the engine is the point."
      aside={
        <>
          <Panel title="Inference direction">
            <ChipRow>
              <Chip active={mode === "forward"} onClick={() => setMode("forward")} hue="var(--dv-viz-3)">
                Forward chaining
              </Chip>
              <Chip active={mode === "backward"} onClick={() => setMode("backward")} hue="var(--dv-viz-3)">
                Backward chaining
              </Chip>
            </ChipRow>
            <p className="t-caption mt-2">
              {mode === "forward"
                ? "Data-driven: feed observations, watch the recognize-act cycle derive everything the rules license."
                : "Goal-driven: pick a hypothesis; the engine works backwards, asking only for what it needs."}
            </p>
          </Panel>

          {mode === "backward" && (
            <Panel title="Goal (hypothesis)">
              <ChipRow>
                {derivables.map((d) => (
                  <Chip key={d} active={goal === d} onClick={() => setGoal(d)} hue="var(--dv-primary)">
                    {d}
                  </Chip>
                ))}
              </ChipRow>
            </Panel>
          )}

          <Panel title="Working memory — the observations">
            <ChipRow>
              {OBSERVABLES.map((f) => (
                <Chip key={f} active={factsOn.includes(f)} onClick={() => toggleFact(f)} hue="var(--dv-success-text)">
                  {f}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-2">Toggle what you observe about the plant; both engines run live on the result.</p>
          </Panel>

          <Panel title={`Rule base — ${rules.length} rules`}>
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {rules.map((r) => (
                <div key={r.id} className="group flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-2">
                  <span className="mt-0.5 shrink-0 rounded bg-viz-3 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{r.label}</span>
                  <p className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-ink-2">
                    IF {r.if.join(" ∧ ")} <span className="text-viz-3">→</span> {r.then} <span className="text-ink-3">(CF {r.cf.toFixed(2)})</span>
                  </p>
                  <button
                    type="button"
                    aria-label={`Delete ${r.label}`}
                    onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}
                    className="shrink-0 text-ink-3 opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* the builder */}
            <div className="mt-3 border-t border-border-subtle pt-3">
              <p className="dv-kicker mb-2">Add your own rule</p>
              <ChipRow>
                {palette.map((p) => (
                  <Chip
                    key={p}
                    active={newIf.includes(p)}
                    onClick={() => setNewIf((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]))}
                    hue="var(--dv-primary)"
                  >
                    {p}
                  </Chip>
                ))}
              </ChipRow>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={newThen}
                  onChange={(e) => setNewThen(e.target.value)}
                  placeholder="concludes… (e.g. cold_damage)"
                  className="min-w-0 flex-1 rounded-md border border-border-subtle bg-surface px-2 py-1.5 font-mono text-[12px] text-ink outline-none"
                />
                <input
                  type="range"
                  min={0.3}
                  max={1}
                  step={0.05}
                  value={newCf}
                  onChange={(e) => setNewCf(Number(e.target.value))}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
                  aria-label="certainty factor"
                />
                <span className="tabular w-8 font-mono text-[11px] text-viz-3">{newCf.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={addRule}
                  disabled={newIf.length === 0 || !newThen.trim()}
                  className="flex h-8 items-center gap-1 rounded-md bg-primary px-2.5 text-[12px] font-semibold text-primary-foreground disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" /> add
                </button>
              </div>
            </div>
          </Panel>

          {mode === "forward" && (
            <Panel title="Conclusions — derived">
              {conclusions.length === 0 ? (
                <p className="t-caption">Nothing derived yet — toggle observations to give the engine something to work with.</p>
              ) : (
                <div className="space-y-2">
                  {conclusions.map((c) => (
                    <div key={c.name}>
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[12px] font-semibold text-ink">{c.name}</span>
                        <span className="tabular font-mono text-[11px] text-viz-3">{c.cf.toFixed(2)} {c.from ? `· ${c.from}` : ""}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-inset">
                        <div className="h-full rounded-full bg-viz-3 transition-[width] duration-300" style={{ width: `${c.cf * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </>
      }
    >
      {mode === "forward" ? (
        <>
          <Panel title="The inference chain — firings in order">
            <ol className="space-y-2">
              {fcRun.fired.map((f, i) => {
                const active = mode === "forward" && (step as FCStep).fired === f.rule;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 dv-lift",
                      active ? "border-viz-3 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] shadow-e1" : "border-border-subtle bg-surface-subtle"
                    )}
                  >
                    <span className="rounded bg-viz-3 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{f.rule}</span>
                    {f.from.map((c, k) => (
                      <span key={c} className="flex items-center gap-2">
                        <span className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{c}</span>
                        {k < f.from.length - 1 && <span className="text-ink-3">∧</span>}
                      </span>
                    ))}
                    <span className="text-viz-3">→</span>
                    <span className="rounded bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-viz-3">
                      {f.then}
                    </span>
                    <span className="tabular ml-auto font-mono text-[11px] text-ink-3">CF {f.cf.toFixed(2)}</span>
                  </li>
                );
              })}
              {fcRun.fired.length === 0 && <p className="t-caption">No rule fires on these observations.</p>}
            </ol>
          </Panel>

          <StepNarration step={step} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Execution — the recognize-act cycle">
              <ExecutionControls stepper={stepper} countLabel="cycle" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat label="fired" value={fcRun.fired.length} />
                <Stat label="cycles" value={fcRun.cycles} />
                <Stat label="derived facts" value={conclusions.length} />
              </div>
            </Panel>
            <Panel title="Forward chaining, line by line">
              <Pseudocode
                lines={[
                  { text: "repeat recognize-act:", indent: 0 },
                  { text: "conflict ← all rules whose IF ⊆ working memory", indent: 1, tone: "key" },
                  { text: "if conflict is empty: stop  // fixpoint", indent: 1 },
                  { text: "resolve: most specific rule wins", indent: 1, tone: "key" },
                  { text: "fire it: antecedent ← min CF of conditions", indent: 1 },
                  { text: "conclusion CF ← antecedent × rule CF", indent: 1 },
                  { text: "combine with any prior CF for that conclusion", indent: 1 },
                ]}
                active={activeLine}
              />
            </Panel>
          </div>

          <Insights
            items={[
              `R2 fired only because R1 fired first — the chain soggy_soil ∧ yellow_leaves → overwatering → root_rot is exactly the multi-step reasoning MYCIN was built to make inspectable.`,
              `Conflict resolution is a design decision, not a theorem: this engine prefers the most specific rule (most conditions). Change the rule base and the firing order changes with it.`,
              `Certainty factors combine by MYCIN's rule — two independent routes to root_rot (R2 and R9) would give min-CFs that merge as CF₁ + CF₂(1 − CF₁): evidence accumulates, it does not average.`,
              `Everything halts at a fixpoint: no new rule can fire, so nothing new can be derived. Toggle an observation and watch the cycle count and conclusions move — the engine is genuinely re-running.`,
            ]}
          />
        </>
      ) : (
        <>
          <Panel title="The proof tree — the WHY trace">
            <ol className="space-y-1.5">
              {bcRun.steps.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border px-3 py-2 dv-lift",
                    s.status === "proved" && "border-success-border bg-success-bg/30",
                    s.status === "failed" && "border-danger-border bg-danger-bg/30",
                    (!s.status || s.status === "asked") && "border-border-subtle bg-surface-subtle"
                  )}
                  style={{ marginLeft: `${Math.min(s.depth, 4) * 18}px` }}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] text-ink-3">{s.phase}</span>
                  <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-ink-2">{s.note}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <StepNarration step={step} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Execution — goal-driven">
              <ExecutionControls stepper={stepper} countLabel="step" />
              <div className="mt-3 flex gap-2">
                <Stat
                  label="verdict"
                  value={bcRun.proved ? "PROVED" : "NOT PROVED"}
                  tone={bcRun.proved ? "var(--dv-success-text)" : "var(--dv-danger-text)"}
                />
                <Stat label="steps" value={bcRun.steps.length} />
              </div>
            </Panel>
            <Panel title="Backward chaining, line by line">
              <Pseudocode
                lines={[
                  { text: "function PROVE(goal)", indent: 0 },
                  { text: "if goal is a known fact: return true", indent: 1, tone: "key" },
                  { text: "for each rule R concluding goal:", indent: 1 },
                  { text: "if PROVE of every R.IF condition: return true", indent: 2, tone: "key" },
                  { text: "return false  // no route established the goal", indent: 1 },
                  { text: "// the recursion's shape IS the WHY trace:", indent: 0 },
                  { text: "// 'to show goal I needed R, to show R I needed…'", indent: 1 },
                ]}
                active={activeLine}
              />
            </Panel>
          </div>

          <Insights
            items={[
              `Backward chaining asks only for what it needs: proving root_rot touches R2 (via overwatering) and never looks at fungal_infection. Forward chaining derives everything; backward chaining interrogates.`,
              `The depth indentation is the goal stack: each nested line is a sub-goal the line above it required — read the trace aloud and you have recited MYCIN's WHY explanation.`,
              `Flip to forward chaining with the same facts and compare: same rule base, same logic, completely different work profile. Choosing a direction is an engineering decision about which side is bigger — the facts or the hypotheses.`,
            ]}
          />
        </>
      )}
    </LabFrame>
  );
}
