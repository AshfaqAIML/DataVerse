"use client";

/**
 * LAB 7 — Automated Planning Lab: a real STRIPS blocks world. States are
 * predicate sets; the four operators (pickup / putdown / stack / unstack)
 * carry genuine preconditions and add/delete effects. Progression search
 * (BFS, or A* with a goal-count heuristic) runs to completion and the trace
 * continues straight into plan playback — every step carries the state it
 * describes, so the canvas always shows a real state of the run.
 */
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Canvas,
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

/* ------------------------------------------------------ STRIPS machinery */

type Pred = string; // "On(A,B)", "OnTable(A)", "Clear(A)", "Holding(A)", "ArmEmpty"
type State = string[];

interface Action {
  name: string;
  pre: Pred[];
  add: Pred[];
  del: Pred[];
}

const BLOCKS = ["A", "B", "C"];

function actionsFor(blocks: string[]): Action[] {
  const out: Action[] = [];
  for (const x of blocks) {
    out.push({
      name: `pickup(${x})`,
      pre: [`OnTable(${x})`, `Clear(${x})`, "ArmEmpty"],
      add: [`Holding(${x})`],
      del: [`OnTable(${x})`, "ArmEmpty"],
    });
    out.push({
      name: `putdown(${x})`,
      pre: [`Holding(${x})`],
      add: [`OnTable(${x})`, `Clear(${x})`, "ArmEmpty"],
      del: [`Holding(${x})`],
    });
    for (const y of blocks) {
      if (x === y) continue;
      out.push({
        name: `stack(${x},${y})`,
        pre: [`Holding(${x})`, `Clear(${y})`],
        add: [`On(${x},${y})`, `Clear(${x})`, "ArmEmpty"],
        del: [`Holding(${x})`, `Clear(${y})`],
      });
      out.push({
        name: `unstack(${x},${y})`,
        pre: [`On(${x},${y})`, `Clear(${x})`, "ArmEmpty"],
        add: [`Holding(${x})`, `Clear(${y})`],
        del: [`On(${x},${y})`, `Clear(${x})`, "ArmEmpty"],
      });
    }
  }
  return out;
}

function applyAction(state: State, a: Action): State {
  const s = new Set(state);
  a.del.forEach((d) => s.delete(d));
  a.add.forEach((p) => s.add(p));
  return [...s].sort();
}

function applicable(state: State, a: Action): boolean {
  const s = new Set(state);
  return a.pre.every((p) => s.has(p));
}

function goalCount(state: State, goal: Pred[]): number {
  const s = new Set(state);
  return goal.filter((g) => !s.has(g)).length;
}

const satisfies = (state: State, goal: Pred[]) => goalCount(state, goal) === 0;

/* ------------------------------------------------------------- presets */

interface PlanPreset {
  id: string;
  name: string;
  blurb: string;
  init: State;
  goal: Pred[];
}

const PRESETS: PlanPreset[] = [
  {
    id: "tower",
    name: "Build a tower",
    blurb: "All three blocks on the table — build the tower A-B-C (B on A, C on B). The 4-action optimum.",
    init: ["ArmEmpty", "Clear(A)", "Clear(B)", "Clear(C)", "OnTable(A)", "OnTable(B)", "OnTable(C)"],
    goal: ["On(B,A)", "On(C,B)"],
  },
  {
    id: "sussman",
    name: "The Sussman anomaly",
    blurb: "A on B on the table, C aside. Goal: B on C and A on B. The classic where greedy subgoal order fails — the optimum must momentarily UNDO progress.",
    init: ["ArmEmpty", "On(A,B)", "OnTable(B)", "OnTable(C)", "Clear(A)", "Clear(C)"],
    goal: ["On(B,C)", "On(A,B)"],
  },
  {
    id: "shuffle",
    name: "Shuffle two towers",
    blurb: "Start with the tower A-B-C; end with its mirror C-B-A. Six actions of honest demolition and rebuild.",
    init: ["ArmEmpty", "OnTable(A)", "On(B,A)", "On(C,B)", "Clear(C)"],
    goal: ["On(B,C)", "On(A,B)"],
  },
];

/* ------------------------------------------------------------ the run */

interface PlanStep {
  note: string;
  line: number;
  phase: string;
  state: State;
  frontier?: string[][];
  planSoFar?: string[];
  expanded?: number;
  actionApplied?: string;
  done?: boolean;
}

interface PlanRun {
  steps: PlanStep[];
  plan: string[];
  expanded: number;
  found: boolean;
  planStates: State[];
}

function searchPlan(init: State, goal: Pred[], useAStar: boolean): PlanRun {
  const actions = actionsFor(BLOCKS);
  const steps: PlanStep[] = [];
  const visited = new Set<string>();
  const frontier: Array<{ state: State; path: string[]; f: number }> = [
    { state: [...init].sort(), path: [], f: goalCount(init, goal) },
  ];
  let expanded = 0;
  let plan: string[] | null = null;

  const snap = (note: string, line: number, phase: string, extra?: Partial<PlanStep>) =>
    steps.push({
      note,
      line,
      phase,
      state: extra?.state ?? (frontier[0]?.state ?? [...init].sort()),
      frontier: frontier.map((f) => f.state),
      planSoFar: frontier[0]?.path ?? [],
      expanded,
      ...extra,
    });

  snap(
    `Initial state: ${init.length} facts (${init.join(", ")}). Goal: ${goal.join(" ∧ ")}. ${
      useAStar ? "A* with the goal-count heuristic" : "Breadth-first search"
    } explores states forward, one operator application at a time.`,
    0,
    "initialise",
    { state: [...init].sort() }
  );

  let guard = 0;
  while (frontier.length > 0 && guard++ < 4000) {
    frontier.sort((a, b) => (useAStar ? a.f - b.f : a.path.length - b.path.length) || a.state.join().localeCompare(b.state.join()));
    const node = frontier.shift()!;
    const key = node.state.join();
    if (visited.has(key)) continue;
    visited.add(key);
    expanded += 1;

    if (satisfies(node.state, goal)) {
      plan = node.path;
      snap(
        `Goal reached after ${plan.length} action${plan.length === 1 ? "" : "s"} and ${expanded} state expansions. The plan: ${plan.join(" → ")}.`,
        2,
        "solved",
        { state: node.state, planSoFar: plan, done: true }
      );
      break;
    }

    const apps = actions.filter((a) => applicable(node.state, a));
    snap(
      `Expand state ${expanded}: ${node.state.length} facts. ${apps.length} of ${actions.length} operators applicable${
        node.path.length > 0 ? ` (arrived via ${node.path[node.path.length - 1]})` : ""
      }.`,
      3,
      "expand",
      { state: node.state, planSoFar: node.path }
    );

    let newOnes = 0;
    for (const a of apps) {
      const ns = applyAction(node.state, a);
      if (visited.has(ns.join())) continue;
      if (frontier.some((f) => f.state.join() === ns.join())) continue;
      frontier.push({
        state: ns,
        path: [...node.path, a.name],
        f: node.path.length + 1 + goalCount(ns, goal),
      });
      newOnes += 1;
    }
    if (apps.length > 0) {
      snap(
        `${apps.map((a) => a.name).join(", ")} → ${newOnes} new state${newOnes === 1 ? "" : "s"} on the frontier (now ${frontier.length}).`,
        5,
        "generate",
        { state: node.state }
      );
    }
  }

  const planStates: State[] = [];
  if (plan) {
    let cur = [...init].sort();
    planStates.push(cur);
    for (const aName of plan) {
      const a = actions.find((x) => x.name === aName)!;
      cur = applyAction(cur, a);
      planStates.push(cur);
    }
    // playback steps
    for (let i = 0; i < plan.length; i++) {
      const a = actions.find((x) => x.name === plan[i])!;
      steps.push({
        note: `EXECUTE step ${i + 1}: ${a.name} — preconditions ${a.pre.join(", ")} hold; effects delete {${a.del.join(", ")|| "∅"}} and add {${a.add.join(", ")}}.`,
        line: 7,
        phase: "execute",
        state: planStates[i + 1],
        planSoFar: plan.slice(0, i + 1),
        actionApplied: a.name,
        expanded,
        done: i === plan.length - 1,
      });
    }
  } else {
    snap("The search exhausted every reachable state — no plan exists for this goal.", 1, "fail", { done: true });
  }

  return { steps, plan: plan ?? [], expanded, found: plan !== null, planStates };
}

/* --------------------------------------------------------------- the lab */

export function PlanningLab() {
  const [presetId, setPresetId] = useState("sussman");
  const [useAStar, setUseAStar] = useState(false);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const [init, setInit] = useState<State>(preset.init);
  const [goal, setGoal] = useState<Pred[]>(preset.goal);

  useEffect(() => {
    setInit(preset.init);
    setGoal(preset.goal);
  }, [preset]);

  const run = useMemo(() => searchPlan(init, goal, useAStar), [init, goal, useAStar]);
  const other = useMemo(() => searchPlan(init, goal, !useAStar), [init, goal, useAStar]);
  const stepper = useStepper(run.steps);
  const step = stepper.step;

  const goalPalette = useMemo(() => {
    const preds: string[] = [];
    for (const x of BLOCKS) preds.push(`OnTable(${x})`);
    for (const x of BLOCKS) for (const y of BLOCKS) if (x !== y) preds.push(`On(${x},${y})`);
    return preds;
  }, []);

  const factsPalette = useMemo(() => {
    const preds = new Set<string>(["ArmEmpty"]);
    for (const x of BLOCKS) {
      preds.add(`OnTable(${x})`);
      preds.add(`Clear(${x})`);
    }
    for (const x of BLOCKS) for (const y of BLOCKS) if (x !== y) preds.add(`On(${x},${y})`);
    return [...preds];
  }, []);

  const toggle = (arr: string[], set: (v: string[]) => void, item: string) =>
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const insights = useMemo(() => {
    const items: string[] = [];
    items.push(
      `The found plan uses ${run.plan.length} actions; the ${useAStar ? "BFS" : "A* (goal-count)"} alternative expands ${other.expanded} states against this run's ${run.expanded}. Both are optimal in plan length here — breadth-first by construction, A* because goal-count is admissible in this domain (each action adds at most one goal fact).`
    );
    if (presetId === "sussman") {
      items.push(
        "The Sussman anomaly's lesson: the optimal plan unstacks A from B even though A-on-B is PART OF THE GOAL — achieving subgoals greedily (B onto C first) forces a longer plan. Planning is global, not greedy."
      );
    }
    items.push(
      "Each state in the trace is a full predicate set — hover the state panel and compare states before/after an operator: STRIPS effects are exactly the add/delete deltas you see."
    );
    items.push(
      `The search explored ${run.expanded} states; the blocks world with three blocks has only a few dozen reachable configurations. Growth is combinatorial in the number of blocks — which is why real planners never search blindly: heuristics (Part E, e-04) relax the problem first.`
    );
    return items;
  }, [run, other, useAStar, presetId]);

  return (
    <LabFrame
      kicker="Laboratory 07 · automated planning"
      title="Automated Planning Lab"
      description="A genuine STRIPS system: states as predicate sets, operators with preconditions and add/delete effects, and forward (progression) search over them. Pick a problem — including the Sussman anomaly, where the optimal plan must undo apparent progress — then watch the search find the plan and play it back, action by action."
      aside={
        <>
          <Panel title="Problem">
            <ChipRow>
              {PRESETS.map((p) => (
                <Chip key={p.id} active={presetId === p.id} onClick={() => setPresetId(p.id)} hue="var(--dv-viz-3)">
                  {p.name}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-2">{preset.blurb}</p>
            <ChipRow className="mt-3">
              <Chip active={useAStar} onClick={() => setUseAStar(!useAStar)} hue="var(--dv-primary)">
                {useAStar ? "A* (goal-count heuristic)" : "Breadth-first search"}
              </Chip>
            </ChipRow>
          </Panel>

          <Panel title="Initial state — toggle facts">
            <div className="flex flex-wrap gap-1.5">
              {factsPalette.map((f) => (
                <Chip key={f} active={init.includes(f)} onClick={() => toggle(init, setInit, f)} hue="var(--dv-success-text)">
                  {f}
                </Chip>
              ))}
            </div>
          </Panel>

          <Panel title="Goal — toggle predicates">
            <div className="flex flex-wrap gap-1.5">
              {goalPalette.map((g) => (
                <Chip key={g} active={goal.includes(g)} onClick={() => toggle(goal, setGoal, g)} hue="var(--dv-viz-3)">
                  {g}
                </Chip>
              ))}
            </div>
            <p className="t-caption mt-2">The plan must reach a state where every goal predicate holds.</p>
          </Panel>

          <Panel title="Results">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="plan length" value={run.found ? run.plan.length : "—"} />
              <Stat label="states expanded" value={run.expanded} />
              <Stat label={useAStar ? "BFS expands" : "A* expands"} value={other.expanded} />
            </div>
            {run.found && (
              <ol className="mt-3 space-y-1">
                {run.plan.map((p, i) => (
                  <li
                    key={i}
                    className={cn(
                      "rounded-md px-2 py-1 font-mono text-[11px]",
                      step.planSoFar?.includes(p) && step.planSoFar?.length === i + 1
                        ? "bg-[color-mix(in_srgb,var(--dv-viz-3)_16%,transparent)] text-viz-3"
                        : "bg-surface-subtle text-ink-2"
                    )}
                  >
                    {i + 1}. {p}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </>
      }
    >
      <Canvas>
        <BlocksWorld state={step.state} action={step.actionApplied} goal={goal} />
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Execution">
          <ExecutionControls stepper={stepper} countLabel="step" />
          <div className="mt-3 space-y-1">
            <p className="dv-kicker">State — {step.state.length} facts</p>
            <div className="flex flex-wrap gap-1">
              {step.state.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px]",
                    goal.includes(s) ? "bg-success-bg text-success-text" : "bg-surface-subtle text-ink-2"
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Panel>
        <Panel title="Progression search, line by line">
          <Pseudocode
            lines={[
              { text: "frontier ← {initial state}", indent: 0 },
              { text: "while frontier not empty:", indent: 0 },
              { text: "s ← best of frontier   // BFS: shallowest; A*: g + h", indent: 1, tone: "key" },
              { text: "if s satisfies goal: return path to s", indent: 1 },
              { text: "for each operator a applicable in s:", indent: 1 },
              { text: "s' ← (s − del(a)) ∪ add(a)   // STRIPS successor", indent: 2, tone: "key" },
              { text: "if s' unseen: add s' with path + [a]", indent: 2 },
              { text: "execute plan: apply actions in order", indent: 0 },
            ]}
            active={step.line}
          />
        </Panel>
      </div>

      <Insights items={insights} />
    </LabFrame>
  );
}

/* ------------------------------------------------------ the visual world */

function BlocksWorld({ state, action, goal }: { state: State; action?: string; goal: Pred[] }) {
  const W = 720;
  const H = 300;
  const s = new Set(state);
  const holding = BLOCKS.find((b) => s.has(`Holding(${b})`));
  // build stacks from On
  const onPairs = BLOCKS.flatMap((x) => BLOCKS.filter((y) => x !== y && s.has(`On(${x},${y})`)).map((y) => [x, y] as const));
  const onTable = BLOCKS.filter((b) => s.has(`OnTable(${b})`));
  const tops = new Set<string>(onTable);
  for (const [x] of onPairs) tops.add(x);
  // each top-of-stack block on table roots a column
  const columns: string[][] = onTable.map((root) => {
    const stack = [root];
    for (;;) {
      const next = onPairs.find(([x, y]) => y === stack[stack.length - 1])?.[0];
      if (!next) break;
      stack.push(next);
    }
    return stack;
  });
  const bw = 84;
  const gap = 26;
  const totalW = columns.length * bw + Math.max(0, columns.length - 1) * gap;
  const x0 = (W - totalW) / 2;
  const tableY = 250;
  const blockH = 46;

  const blockX = (col: number) => x0 + col * (bw + gap);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Blocks world state">
      {/* goal banner */}
      <text x={W / 2} y={24} textAnchor="middle" fontSize="12" className="fill-[var(--dv-ink-2)] font-mono">
        goal: {goal.join(" ∧ ")}
      </text>
      {/* the arm */}
      <g style={{ transition: "transform 250ms" }}>
        <rect x={W / 2 - 58} y={44} width="116" height="10" rx="4" fill="var(--dv-surface-inset)" stroke="var(--dv-border-strong)" />
        <line x1={W / 2} y1={54} x2={W / 2} y2={holding ? 92 : 78} stroke="var(--dv-border-strong)" strokeWidth="3" />
        {holding ? (
          <>
            <rect
              x={W / 2 - bw / 2}
              y={92}
              width={bw}
              height={blockH}
              rx={5}
              fill="var(--dv-viz-3)"
              stroke="var(--dv-border-strong)"
              strokeWidth="1.5"
            />
            <text x={W / 2} y={92 + blockH / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="17" className="font-mono font-bold" fill="#fff" pointerEvents="none">
              {holding}
            </text>
            <text x={W / 2} y={66} textAnchor="middle" fontSize="10" className="fill-[var(--dv-ink-3)] font-mono">
              holding
            </text>
          </>
        ) : (
          <text x={W / 2} y={72} textAnchor="middle" fontSize="10" className="fill-[var(--dv-ink-3)] font-mono">
            arm empty
          </text>
        )}
      </g>
      {/* table */}
      <rect x={x0 - 18} y={tableY} width={totalW + 36} height="10" rx="4" fill="var(--dv-surface-inset)" stroke="var(--dv-border-strong)" />
      <text x={x0 - 18} y={tableY + 26} fontSize="10" className="fill-[var(--dv-ink-3)] font-mono">
        table
      </text>
      {/* columns */}
      {columns.map((stack, ci) =>
        stack.map((b, bi) => {
          const x = blockX(ci);
          const y = tableY - (stack.length - bi) * blockH - 2;
          const inGoal = goal.some((g) => g === `On(${b},${stack[bi - 1] ?? ""})` && bi > 0) || (bi === 0 && goal.includes(`OnTable(${b})`));
          return (
            <g key={b} style={{ transition: "all 220ms" }}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={blockH}
                rx={5}
                fill={s.has(`Clear(${b})`) ? "color-mix(in srgb, var(--dv-primary) 24%, var(--dv-surface))" : "var(--dv-surface)"}
                stroke={inGoal ? "var(--dv-success-text)" : "var(--dv-border-strong)"}
                strokeWidth={inGoal ? 2.4 : 1.5}
              />
              <text x={x + bw / 2} y={y + blockH / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" className="font-mono font-bold" fill="var(--dv-ink)" pointerEvents="none">
                {b}
              </text>
              {s.has(`Clear(${b})`) && bi === stack.length - 1 && (
                <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="8.5" className="fill-[var(--dv-success-text)] font-mono" pointerEvents="none">
                  clear
                </text>
              )}
            </g>
          );
        })
      )}
      {action && (
        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="12.5" className="fill-[var(--dv-viz-3)] font-mono font-semibold">
          {action}
        </text>
      )}
    </svg>
  );
}
