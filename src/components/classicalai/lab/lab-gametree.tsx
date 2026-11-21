"use client";

/**
 * LAB 3 — Game Tree Visualizer: genuine minimax and alpha-beta on editable
 * trees. The step trace IS the recursion: every visit, every backed-up
 * value, every window narrowing and every cut comes from running the real
 * algorithms over the current leaf values. Metrics compare against a silent
 * plain-minimax run on the same tree.
 */
import { useMemo, useState } from "react";
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

/* ------------------------------------------------------------ the tree */

interface GTN {
  id: string;
  kind: "max" | "min" | "leaf";
  depth: number;
  value: number | undefined;
  children: GTN[];
  edge?: string;
}

function buildTree(depth: number, branching: number, leaves: number[]): GTN {
  let leafIdx = 0;
  const letters = ["a", "b", "c", "d"];
  function make(d: number, path: string): GTN {
    if (d === depth) {
      const v = leaves[leafIdx++];
      return { id: `L${leafIdx}`, kind: "leaf", depth: d, value: v, children: [] };
    }
    const kind: "max" | "min" = d % 2 === 0 ? "max" : "min";
    const children: GTN[] = [];
    for (let i = 0; i < branching; i++) {
      const c = make(d + 1, path + letters[i]);
      c.edge = `${letters[i]}${d + 1}`;
      children.push(c);
    }
    return { id: `N${path || "R"}`, kind, depth: d, value: undefined, children };
  }
  return make(0, "");
}

function countLeaves(depth: number, branching: number): number {
  return Math.pow(branching, depth);
}

/** deterministic seeded leaf values in a spicy range */
function seededLeaves(n: number, seed: number): number[] {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return Array.from({ length: n }, () => 1 + Math.floor(rnd() * 15));
}

const CANONICAL = [3, 12, 8, 2, 4, 6, 14, 5, 2]; // the b-02/b-05 tree, 3×3

/* --------------------------------------------------- the step engines */

interface GTStep {
  note: string;
  line: number;
  phase: string;
  values: Record<string, number>;
  visiting?: string;
  visited: string[];
  windows: Record<string, { alpha: number; beta: number }>;
  cuts: string[];
  cutEdges: string[];
  rootMove?: string;
  done?: boolean;
}

function minimaxTrace(root: GTN): { steps: GTStep[]; visits: number } {
  const steps: GTStep[] = [];
  const values: Record<string, number> = {};
  const visited: string[] = [];
  let visits = 0;
  const snap = (note: string, line: number, phase: string, extra?: Partial<GTStep>) =>
    steps.push({ note, line, phase, values: { ...values }, visited: [...visited], windows: {}, cuts: [], cutEdges: [], ...extra });

  function rec(n: GTN): number {
    visits += 1;
    visited.push(n.id);
    if (n.kind === "leaf") {
      values[n.id] = n.value ?? 0;
      snap(`Leaf ${n.value} — a terminal utility, a fact.`, 2, "leaf", { visiting: n.id });
      return n.value ?? 0;
    }
    snap(`Enter ${n.kind === "max" ? "MAX" : "MIN"} node — its children are evaluated left to right.`, 0, n.kind, { visiting: n.id });
    const vals = n.children.map((c) => rec(c));
    const v = n.kind === "max" ? Math.max(...vals) : Math.min(...vals);
    values[n.id] = v;
    snap(
      `${n.kind === "max" ? "MAX" : "MIN"} takes the ${n.kind === "max" ? "largest" : "smallest"} of [${vals.join(", ")}] → ${v}.`,
      n.kind === "max" ? 4 : 5,
      "backup",
      { visiting: n.id }
    );
    return v;
  }
  const rootValue = rec(root);
  const best = root.children.findIndex((c) => values[c.id] === rootValue);
  snap(
    `Root value ${rootValue}; minimax plays move ${root.children[best]?.edge ?? "?"}. ${visits} nodes visited, no cuts possible.`,
    6,
    "decide",
    { done: true, rootMove: root.children[best]?.edge }
  );
  return { steps, visits };
}

function alphabetaTrace(root: GTN): { steps: GTStep[]; visits: number; cuts: number; leafEvals: number } {
  const steps: GTStep[] = [];
  const values: Record<string, number> = {};
  const windows: Record<string, { alpha: number; beta: number }> = {};
  const visited: string[] = [];
  const cuts: string[] = [];
  const cutEdges: string[] = [];
  let visits = 0;
  let leafEvals = 0;
  const snap = (note: string, line: number, phase: string, extra?: Partial<GTStep>) =>
    steps.push({
      note,
      line,
      phase,
      values: { ...values },
      visited: [...visited],
      windows: JSON.parse(JSON.stringify(windows)),
      cuts: [...cuts],
      cutEdges: [...cutEdges],
      ...extra,
    });

  function rec(n: GTN, alpha: number, beta: number): number {
    visits += 1;
    visited.push(n.id);
    if (n.kind === "leaf") {
      leafEvals += 1;
      values[n.id] = n.value ?? 0;
      snap(`Leaf ${n.value} — terminal utility.`, 1, "leaf", { visiting: n.id });
      return n.value ?? 0;
    }
    windows[n.id] = { alpha, beta };
    snap(`Enter ${n.kind === "max" ? "MAX" : "MIN"} with window α=${alpha}, β=${beta}.`, 0, n.kind, { visiting: n.id });
    if (n.kind === "max") {
      let v = -Infinity;
      for (let i = 0; i < n.children.length; i++) {
        const c = n.children[i];
        v = Math.max(v, rec(c, alpha, beta));
        alpha = Math.max(alpha, v);
        values[n.id] = v;
        windows[n.id] = { alpha, beta };
        if (alpha >= beta) {
          const skipped = n.children.slice(i + 1);
          if (skipped.length > 0) {
            cuts.push(...skipped.map((s) => s.id));
            cutEdges.push(...skipped.map((s) => `${n.id}>${s.id}`));
            snap(
              `β-cut: v=${v} ≥ β=${beta} — the remaining ${skipped.length} branch${skipped.length > 1 ? "es" : ""} under this node cannot change anything upstream. Skipped.`,
              7,
              "cut",
              { visiting: n.id }
            );
          }
          return v;
        }
        snap(`Child returns ${v}; α rises to ${alpha}. Window now [${alpha}, ${beta}].`, 4, "narrow", { visiting: n.id });
      }
      values[n.id] = v;
      return v;
    }
    let v = Infinity;
    for (let i = 0; i < n.children.length; i++) {
      const c = n.children[i];
      v = Math.min(v, rec(c, alpha, beta));
      beta = Math.min(beta, v);
      values[n.id] = v;
      windows[n.id] = { alpha, beta };
      if (beta <= alpha) {
        const skipped = n.children.slice(i + 1);
        if (skipped.length > 0) {
          cuts.push(...skipped.map((s) => s.id));
          cutEdges.push(...skipped.map((s) => `${n.id}>${s.id}`));
          snap(
            `α-cut: v=${v} ≤ α=${alpha} — MAX already has ${alpha} elsewhere; this whole branch is irrelevant. ${skipped.length} branch${skipped.length > 1 ? "es" : ""} skipped.`,
            11,
            "cut",
            { visiting: n.id }
          );
        }
        return v;
      }
      snap(`Child returns ${v}; β falls to ${beta}. Window now [${alpha}, ${beta}].`, 8, "narrow", { visiting: n.id });
    }
    values[n.id] = v;
    return v;
  }

  const rootValue = rec(root, -Infinity, Infinity);
  const best = root.children.findIndex((c) => values[c.id] === rootValue);
  snap(
    `Root value ${rootValue} — identical to plain minimax — after ${visits} visits and ${cuts.length} skipped branch${cuts.length === 1 ? "" : "es"}. Alpha-beta plays move ${root.children[best]?.edge ?? "?"}: the same move, for less.`,
    12,
    "decide",
    { done: true, rootMove: root.children[best]?.edge }
  );
  return { steps, visits, cuts: cuts.length, leafEvals };
}

const MM_PSEUDO = [
  { text: "function MINIMAX(n)", indent: 0 },
  { text: "if n is a leaf: return its utility", indent: 1 },
  { text: "if n is MAX:", indent: 1 },
  { text: "return max over children of MINIMAX(c)", indent: 2 },
  { text: "else:", indent: 1 },
  { text: "return min over children of MINIMAX(c)", indent: 2 },
  { text: "play the child whose value equals the root's", indent: 0 },
];

const AB_PSEUDO = [
  { text: "function AB(n, α, β)", indent: 0 },
  { text: "if n is a leaf: return its utility", indent: 1 },
  { text: "if n is MAX:", indent: 1 },
  { text: "v ← −∞", indent: 2 },
  { text: "for each child c: v ← max(v, AB(c, α, β)); α ← max(α, v)", indent: 2, tone: "key" as const },
  { text: "if α ≥ β: cut — return v   // β-cut", indent: 2, tone: "key" as const },
  { text: "else:", indent: 1 },
  { text: "v ← +∞", indent: 2 },
  { text: "for each child c: v ← min(v, AB(c, α, β)); β ← min(β, v)", indent: 2 },
  { text: "if β ≤ α: cut — return v   // α-cut", indent: 2, tone: "key" as const },
  { text: "return v", indent: 1 },
  { text: "root call: AB(root, −∞, +∞) — same move as minimax, guaranteed", indent: 0 },
];

/* ------------------------------------------------------------- the lab */

export function GameTreeLab() {
  const [algo, setAlgo] = useState<"minimax" | "alphabeta">("alphabeta");
  const [depth, setDepth] = useState(2);
  const [branching, setBranching] = useState(3);
  const [leafValues, setLeafValues] = useState<number[]>(CANONICAL);
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);

  const tree = useMemo(() => {
    const n = countLeaves(depth, branching);
    const leaves = leafValues.slice(0, n);
    while (leaves.length < n) leaves.push(seededLeaves(n, 42)[leaves.length]);
    return buildTree(depth, branching, leaves);
  }, [depth, branching, leafValues]);

  const trace = useMemo(
    () => (algo === "minimax" ? minimaxTrace(tree) : alphabetaTrace(tree)),
    [tree, algo]
  );
  const mm = useMemo(() => minimaxTrace(tree), [tree]);
  const ab = useMemo(() => alphabetaTrace(tree), [tree]);
  const stepper = useStepper(trace.steps);
  const step = stepper.step;

  const flat = useMemo(() => {
    const out: GTN[] = [];
    (function walk(n: GTN) {
      out.push(n);
      n.children.forEach(walk);
    })(tree);
    return out;
  }, [tree]);

  const leaves = flat.filter((n) => n.kind === "leaf");
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const maxDepth = Math.max(...flat.map((n) => n.depth));
    const W = 940;
    const H = 320;
    leaves.forEach((l, i) => {
      pos[l.id] = { x: ((i + 0.5) / leaves.length) * (W - 120) + 60, y: 40 + (maxDepth / Math.max(1, maxDepth)) * (H - 80) };
    });
    (function place(n: GTN): { x: number; y: number } {
      if (pos[n.id]) return pos[n.id];
      const ps = n.children.map(place);
      const x = ps.reduce((s, p) => s + p.x, 0) / ps.length;
      const y = 40 + (n.depth / Math.max(1, maxDepth)) * (H - 80);
      pos[n.id] = { x, y };
      return pos[n.id];
    })(tree);
    return pos;
  }, [flat, leaves, tree]);

  const insights = useMemo(() => {
    const items: string[] = [];
    const totalNodes = flat.length;
    const saved = mm.visits - ab.visits;
    items.push(
      `This tree has ${totalNodes} nodes (${leaves.length} leaves). Plain minimax visits all ${mm.visits}; alpha-beta visits ${ab.visits} — ${saved} node${saved === 1 ? "" : "s"} (${Math.round((saved / Math.max(1, mm.visits)) * 100)}%) skipped by proof, not by luck.`
    );
    if (ab.cuts > 0) {
      items.push(
        `The first child of the root always runs to completion — its empty window has nothing to cut against. Every cut you see fires on a LATER sibling, after an earlier sibling armed the window.`
      );
    } else {
      items.push(
        `No cuts fired on these leaf values — the ordering is adversarial for pruning. Shuffle or edit the leaves and watch cuts appear: the tree is constant, the ordering is everything.`
      );
    }
    const rootVal = ab.steps[ab.steps.length - 1]?.note.match(/Root value (-?\d+)/)?.[1];
    if (rootVal) items.push(`Root value ${rootVal} under BOTH algorithms — pruning never changes the answer, only the work. If your own implementation ever disagrees, you have found a window bug.`);
    items.push(`With perfect ordering the savings would approach the square root: about O(b^(m/2)) of the tree. Try depth 3, branching 3, and hunt for a leaf arrangement that maximizes the cuts.`);
    return items;
  }, [mm, ab, flat, leaves]);

  const selectedValue = selectedLeaf !== null ? leafValues[selectedLeaf] : null;

  return (
    <LabFrame
      kicker="Laboratory 03 · adversarial search"
      title="Game Tree Visualizer"
      description="Minimax and alpha-beta on trees you control: pick depth and branching, edit any leaf, and step through the genuine recursion — values backing up, the α–β window narrowing, branches cut the moment they cannot matter. MAX nodes are circles, MIN nodes are squares, cuts are struck through."
      aside={
        <>
          <Panel title="Algorithm">
            <ChipRow>
              <Chip active={algo === "minimax"} onClick={() => setAlgo("minimax")} hue="var(--dv-viz-3)">Minimax</Chip>
              <Chip active={algo === "alphabeta"} onClick={() => setAlgo("alphabeta")} hue="var(--dv-viz-3)">Alpha-beta</Chip>
            </ChipRow>
          </Panel>
          <Panel title="Tree">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[12px] text-ink-2">
                depth
                <select
                  value={depth}
                  onChange={(e) => {
                    const d = Number(e.target.value);
                    setDepth(d);
                    const n = countLeaves(d, branching);
                    const base = seededLeaves(n, 7);
                    setLeafValues(base);
                  }}
                  className="rounded-md border border-border-subtle bg-surface px-2 py-1 font-mono text-[12px]"
                >
                  <option value={2}>2 plies</option>
                  <option value={3}>3 plies</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-[12px] text-ink-2">
                branching
                <select
                  value={branching}
                  onChange={(e) => {
                    const b = Number(e.target.value);
                    setBranching(b);
                    const n = countLeaves(depth, b);
                    setLeafValues(seededLeaves(n, 7));
                  }}
                  className="rounded-md border border-border-subtle bg-surface px-2 py-1 font-mono text-[12px]"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip onClick={() => setLeafValues(CANONICAL.slice(0, countLeaves(depth, branching)).concat(seededLeaves(27, 3)).slice(0, countLeaves(depth, branching)))} hue="var(--dv-primary)">
                The canonical tree
              </Chip>
              <Chip onClick={() => setLeafValues(seededLeaves(countLeaves(depth, branching), Date.now() % 9973))} hue="var(--dv-primary)">
                Shuffle leaves
              </Chip>
              <Chip onClick={() => setLeafValues(Array.from({ length: countLeaves(depth, branching) }, (_, i) => 15 - i))} hue="var(--dv-primary)">
                Descending (worst order)
              </Chip>
            </div>
            {selectedLeaf !== null && (
              <div className="mt-3 border-t border-border-subtle pt-3">
                <p className="dv-kicker">Leaf #{selectedLeaf + 1}</p>
                <input
                  type="range"
                  min={-5}
                  max={20}
                  value={selectedValue ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLeafValues((old) => old.map((x, i) => (i === selectedLeaf ? v : x)));
                  }}
                  className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
                />
                <p className="tabular mt-1 font-mono text-[12px] text-viz-3">utility = {selectedValue}</p>
              </div>
            )}
            <p className="t-caption mt-3">Click any leaf in the tree to edit its utility — the trace re-runs instantly on your values.</p>
          </Panel>
          <Panel title="Results">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="visits (this run)" value={algo === "minimax" ? mm.visits : ab.visits} />
              <Stat label="plain minimax" value={mm.visits} />
              <Stat label="cut branches" value={ab.cuts} />
              <Stat
                label="saved"
                value={`${Math.round(((mm.visits - ab.visits) / Math.max(1, mm.visits)) * 100)}%`}
                tone="var(--dv-success-text)"
              />
            </div>
          </Panel>
        </>
      }
    >
      <Canvas>
        <svg viewBox="0 0 940 320" className="h-auto w-full" role="img" aria-label="Game tree">
          {/* edges */}
          {flat.map((n) =>
            n.children.map((c) => {
              const p = positions[n.id];
              const q = positions[c.id];
              const isCut = step.cutEdges.includes(`${n.id}>${c.id}`);
              return (
                <g key={`${n.id}-${c.id}`}>
                  <line
                    x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                    stroke={isCut ? "var(--dv-danger-border)" : step.visiting === c.id ? "var(--dv-primary)" : "var(--dv-border-strong)"}
                    strokeWidth={isCut ? 1.2 : 1.6}
                    strokeDasharray={isCut ? "5 4" : undefined}
                    opacity={isCut ? 0.7 : 1}
                    style={{ transition: "all 160ms" }}
                  />
                  {c.edge && (
                    <text x={(p.x + q.x) / 2 + 4} y={(p.y + q.y) / 2 - 3} fontSize="9" className="fill-[var(--dv-ink-3)] font-mono">
                      {c.edge}
                    </text>
                  )}
                </g>
              );
            })
          )}
          {/* nodes */}
          {flat.map((n) => {
            const p = positions[n.id];
            const val = step.values[n.id];
            const win = step.windows[n.id];
            const visiting = step.visiting === n.id;
            const isCut = step.cuts.includes(n.id);
            const isLeaf = n.kind === "leaf";
            return (
              <g
                key={n.id}
                className={cn(isLeaf && "dv-handle cursor-pointer")}
                onClick={() => { if (isLeaf) setSelectedLeaf(leaves.findIndex((l) => l.id === n.id)); }}
                onKeyDown={(ev) => {
                  if (isLeaf && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    setSelectedLeaf(leaves.findIndex((l) => l.id === n.id));
                  }
                }}
                tabIndex={isLeaf ? 0 : -1}
                role={isLeaf ? "button" : undefined}
                aria-label={isLeaf ? `Leaf ${n.id} — select this outcome` : undefined}
              >
                {visiting && (
                  <circle cx={p.x} cy={p.y} r={isLeaf ? 18 : 24} fill="none" stroke="var(--dv-primary)" strokeWidth="1.5" className="dv-pulse" />
                )}
                {isLeaf ? (
                  <rect
                    x={p.x - 15} y={p.y - 13} width={30} height={26} rx={4}
                    fill={isCut ? "var(--dv-surface-inset)" : val !== undefined ? "color-mix(in srgb, var(--dv-viz-3) 16%, var(--dv-surface))" : "var(--dv-surface)"}
                    stroke={isCut ? "var(--dv-danger-border)" : "var(--dv-border-strong)"}
                    strokeWidth={1.6}
                    opacity={isCut ? 0.55 : 1}
                    style={{ transition: "all 160ms" }}
                  />
                ) : n.kind === "max" ? (
                  <circle
                    cx={p.x} cy={p.y} r={17}
                    fill={val !== undefined ? "color-mix(in srgb, var(--dv-primary) 18%, var(--dv-surface))" : "var(--dv-surface)"}
                    stroke={isCut ? "var(--dv-danger-border)" : "var(--dv-primary)"}
                    strokeWidth={1.8}
                    opacity={isCut ? 0.55 : 1}
                    style={{ transition: "all 160ms" }}
                  />
                ) : (
                  <rect
                    x={p.x - 17} y={p.y - 17} width={34} height={34} rx={6}
                    fill={val !== undefined ? "color-mix(in srgb, var(--dv-violet-500) 16%, var(--dv-surface))" : "var(--dv-surface)"}
                    stroke={isCut ? "var(--dv-danger-border)" : "var(--dv-violet-500)"}
                    strokeWidth={1.8}
                    opacity={isCut ? 0.55 : 1}
                    style={{ transition: "all 160ms" }}
                  />
                )}
                <text
                  x={p.x} y={isLeaf ? p.y + 4 : n.kind === "max" ? p.y + 5 : p.y + 5}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isLeaf ? 11.5 : 12}
                  className={cn("font-mono font-semibold", val !== undefined ? "fill-[var(--dv-ink)]" : "fill-[var(--dv-ink-3)]")}
                  opacity={isCut ? 0.5 : 1}
                  pointerEvents="none"
                >
                  {isLeaf ? n.value : val !== undefined ? val : n.kind === "max" ? "MAX" : "MIN"}
                </text>
                {algo === "alphabeta" && win && !isLeaf && (
                  <text x={p.x} y={p.y - 24} textAnchor="middle" fontSize="9.5" className="font-mono" fill="var(--dv-ink-3)" pointerEvents="none">
                    {`α=${win.alpha === -Infinity ? "−∞" : win.alpha} β=${win.beta === Infinity ? "∞" : win.beta}`}
                  </text>
                )}
                {isCut && (
                  <text x={p.x} y={p.y - 28} textAnchor="middle" fontSize="11" fill="var(--dv-danger-text)" pointerEvents="none" className="font-mono font-bold">
                    ✗
                  </text>
                )}
              </g>
            );
          })}
          {step.rootMove && (
            <text x={470} y={310} textAnchor="middle" fontSize="12" className="fill-[var(--dv-viz-3)] font-mono">
              selected move: {step.rootMove}
            </text>
          )}
        </svg>
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Execution">
          <ExecutionControls stepper={stepper} countLabel="step" />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-3">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--dv-primary)]" />MAX</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[var(--dv-violet-500)]" />MIN</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-[var(--dv-border-strong)]" />leaf</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-[var(--dv-danger-border)] border-dashed" />cut</span>
          </div>
        </Panel>
        <Panel title="The algorithm, line by line">
          <Pseudocode lines={algo === "minimax" ? MM_PSEUDO : AB_PSEUDO} active={step.line} />
        </Panel>
      </div>

      <Insights items={insights} />
    </LabFrame>
  );
}
