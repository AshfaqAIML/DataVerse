"use client";

/**
 * LAB 4 — Constraint Satisfaction Lab: N-Queens, map colouring (Australia)
 * and 4×4 Sudoku on one genuine backtracking engine with optional MRV
 * variable ordering and forward checking. Every assignment, conflict check,
 * domain prune and backtrack in the trace is the real solver executing; the
 * comparison table runs the same problem three ways, silently, to produce
 * honest numbers.
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

/* --------------------------------------------------------- the engine */

interface CSPStep {
  note: string;
  line: number;
  phase: string;
  assignment: Record<string, number>;
  domains: Record<string, number[]>;
  current?: string;
  checking?: { value: number; against?: string; ok: boolean };
  pruned?: Array<{ var: string; values: number[] }>;
  backtracking?: boolean;
  checks: number;
  backtracks: number;
  assignments: number;
  done?: boolean;
  failed?: boolean;
}

interface CspSpec {
  vars: string[];
  domainSize: number;
  initial: Record<string, number[]>;
  fixed: Record<string, number>;
  conflicts: (a: string, av: number, b: string, bv: number) => boolean;
  label: (v: string) => string;
  valueName: (v: number) => string;
  mrv: boolean;
  fc: boolean;
}

interface CspRun {
  steps: CSPStep[];
  solution: Record<string, number> | null;
  checks: number;
  backtracks: number;
  assignments: number;
}

function solveCsp(spec: CspSpec): CspRun {
  const steps: CSPStep[] = [];
  const assignment: Record<string, number> = { ...spec.fixed };
  const domains: Record<string, number[]> = {};
  for (const v of spec.vars) domains[v] = [...(spec.initial[v] ?? Array.from({ length: spec.domainSize }, (_, i) => i))];
  // propagate fixed values into domains
  for (const [v, val] of Object.entries(spec.fixed)) {
    domains[v] = [val];
    for (const u of spec.vars) {
      if (u === v || assignment[u] !== undefined) continue;
      domains[u] = domains[u].filter((x) => !spec.conflicts(v, val, u, x));
    }
  }
  let checks = 0;
  let backtracks = 0;
  let assignments = Object.keys(spec.fixed).length;

  const snap = (note: string, line: number, phase: string, extra?: Partial<CSPStep>): void => {
    steps.push({
      note,
      line,
      phase,
      assignment: { ...assignment },
      domains: JSON.parse(JSON.stringify(domains)),
      checks,
      backtracks,
      assignments,
      ...extra,
    });
  };

  const unassigned = () => spec.vars.filter((v) => assignment[v] === undefined);

  const consistent = (v: string, val: number): boolean => {
    for (const [u, uv] of Object.entries(assignment)) {
      if (u === v) continue;
      checks += 1;
      if (spec.conflicts(v, val, u, uv)) {
        snap(
          `Try ${spec.label(v)} = ${spec.valueName(val)} — conflicts with ${spec.label(u)} = ${spec.valueName(uv)}. Rejected.`,
          4,
          "check",
          { current: v, checking: { value: val, against: u, ok: false } }
        );
        return false;
      }
    }
    return true;
  };

  const pruneForward = (v: string, val: number): Array<{ var: string; values: number[] }> => {
    const pruned: Array<{ var: string; values: number[] }> = [];
    if (!spec.fc) return pruned;
    for (const u of unassigned()) {
      const before = domains[u];
      const after = before.filter((x) => {
        checks += 1;
        return !spec.conflicts(v, val, u, x);
      });
      if (after.length !== before.length) {
        pruned.push({ var: u, values: before.filter((x) => !after.includes(x)) });
        domains[u] = after;
      }
    }
    return pruned;
  };

  function backtrack(): boolean {
    const rem = unassigned();
    if (rem.length === 0) {
      snap("Every variable has a consistent value — a complete solution.", 2, "solved", { done: true });
      return true;
    }
    // variable selection
    let v: string;
    if (spec.mrv) {
      v = [...rem].sort((a, b) => domains[a].length - domains[b].length || spec.vars.indexOf(a) - spec.vars.indexOf(b))[0];
      snap(
        `MRV picks ${spec.label(v)} — the fewest remaining values (${domains[v].length}: ${domains[v].map(spec.valueName).join(", ")}).`,
        1,
        "select",
        { current: v }
      );
    } else {
      v = rem[0];
      snap(
        `Next variable in order: ${spec.label(v)} (domain ${domains[v].length}: ${domains[v].map(spec.valueName).join(", ")}).`,
        1,
        "select",
        { current: v }
      );
    }
    const values = [...domains[v]];
    let placed = false;
    for (const val of values) {
      if (consistent(v, val)) {
        assignment[v] = val;
        assignments += 1;
        const pruned = pruneForward(v, val);
        if (pruned.some((p) => domains[p.var].length === 0)) {
          // a domain was wiped — immediate backtrack
          const wiped = pruned.find((p) => domains[p.var].length === 0)!;
          snap(
            `Assign ${spec.label(v)} = ${spec.valueName(val)}; forward checking empties ${spec.label(wiped.var)}'s domain — dead end seen early, undoing.`,
            6,
            "dead end",
            { current: v, pruned, backtracking: true }
          );
          backtracks += 1;
          delete assignment[v];
          // restore pruned domains
          for (const p of pruned) {
            domains[p.var] = [...(spec.initial[p.var] ?? Array.from({ length: spec.domainSize }, (_, i) => i))].filter(
              (x) => !Object.entries(assignment).some(([u, uv]) => u !== p.var && spec.conflicts(u, uv, p.var, x))
            );
          }
          continue;
        }
        snap(
          `Assign ${spec.label(v)} = ${spec.valueName(val)}${pruned.length > 0 ? `; forward checking prunes ${pruned.map((p) => `${spec.label(p.var)} loses ${p.values.map(spec.valueName).join("/")}`).join(", ")}` : ""}.`,
          5,
          "assign",
          { current: v, pruned }
        );
        if (backtrack()) return true;
        snap(`Backtrack: undo ${spec.label(v)} = ${spec.valueName(val)} — no completion below it.`, 8, "backtrack", { current: v, backtracking: true });
        delete assignment[v];
        backtracks += 1;
        // restore domains pruned by this assignment
        for (const u of unassigned()) {
          domains[u] = [...(spec.initial[u] ?? Array.from({ length: spec.domainSize }, (_, i) => i))].filter(
            (x) => !Object.entries(assignment).some(([w, wv]) => w !== u && spec.conflicts(w, wv, u, x))
          );
        }
        placed = true;
      }
    }
    void placed;
    return false;
  }

  const ok = backtrack();
  if (!ok) {
    snap("The search exhausted the root — no solution exists under these givens.", 9, "fail", { done: true, failed: true });
  }
  return { steps, solution: ok ? { ...assignment } : null, checks, backtracks, assignments };
}

/* -------------------------------------------------------- the problems */

type ProblemId = "queens" | "map" | "sudoku";

const AUSTRALIA = {
  regions: [
    { id: "WA", label: "WA", x: 14, y: 46 },
    { id: "NT", label: "NT", x: 38, y: 26 },
    { id: "SA", label: "SA", x: 42, y: 56 },
    { id: "Q", label: "Q", x: 68, y: 36 },
    { id: "NSW", label: "NSW", x: 76, y: 64 },
    { id: "V", label: "V", x: 62, y: 82 },
    { id: "T", label: "T", x: 74, y: 94 },
  ],
  adj: [
    ["WA", "NT"], ["WA", "SA"], ["NT", "SA"], ["NT", "Q"],
    ["SA", "Q"], ["SA", "NSW"], ["SA", "V"], ["Q", "NSW"], ["NSW", "V"],
  ] as Array<[string, string]>,
};

const COLOR_HEX = ["#B3362B", "#2D62C8", "#1B7A4E", "#96601A"];

const SUDOKU_PUZZLES: Array<{ name: string; givens: Record<string, number> }> = [
  {
    name: "Puzzle 1 (gentle)",
    givens: { r1c1: 0, r1c3: 3, r2c2: 2, r3c1: 1, r3c4: 2, r4c2: 0, r4c4: 3 },
  },
  {
    name: "Puzzle 2 (one backtrack)",
    givens: { r1c2: 3, r2c1: 2, r2c4: 0, r3c1: 0, r3c3: 2, r4c2: 1, r4c3: 3 },
  },
];

function sudokuPeers(): Record<string, string[]> {
  const peers: Record<string, string[]> = {};
  const cells: string[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cells.push(`r${r + 1}c${c + 1}`);
  for (const cell of cells) peers[cell] = [];
  for (const a of cells) {
    for (const b of cells) {
      if (a === b) continue;
      const [ra, ca] = [Number(a[1]), Number(a[4])];
      const [rb, cb] = [Number(b[1]), Number(b[4])];
      const sameRow = ra === rb;
      const sameCol = ca === cb;
      const sameBlock = Math.ceil(ra / 2) === Math.ceil(rb / 2) && Math.ceil(ca / 2) === Math.ceil(cb / 2);
      if (sameRow || sameCol || sameBlock) peers[a].push(b);
    }
  }
  return peers;
}

const SUDOKU_PEERS = sudokuPeers();

/* -------------------------------------------------------------- the lab */

export function CspLab() {
  const [problem, setProblem] = useState<ProblemId>("queens");
  const [nQueens, setNQueens] = useState(4);
  const [colors, setColors] = useState(3);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [mrv, setMrv] = useState(true);
  const [fc, setFc] = useState(true);

  const spec = useMemo<CspSpec>(() => {
    if (problem === "queens") {
      const vars = Array.from({ length: nQueens }, (_, i) => `q${i}`);
      return {
        vars,
        domainSize: nQueens,
        initial: Object.fromEntries(vars.map((v) => [v, Array.from({ length: nQueens }, (_, i) => i)])),
        fixed: {},
        conflicts: (a, av, b, bv) => {
          const ca = Number(a.slice(1));
          const cb = Number(b.slice(1));
          return av === bv || Math.abs(av - bv) === Math.abs(ca - cb);
        },
        label: (v) => `column ${v.slice(1)}`,
        valueName: (v) => `row ${v + 1}`,
        mrv,
        fc,
      };
    }
    if (problem === "map") {
      const vars = AUSTRALIA.regions.map((r) => r.id);
      const adjSet = new Set(AUSTRALIA.adj.map(([a, b]) => `${a}|${b}`).concat(AUSTRALIA.adj.map(([a, b]) => `${b}|${a}`)));
      return {
        vars,
        domainSize: colors,
        initial: Object.fromEntries(vars.map((v) => [v, Array.from({ length: colors }, (_, i) => i)])),
        fixed: {},
        conflicts: (a, av, b, bv) => av === bv && adjSet.has(`${a}|${b}`),
        label: (v) => v,
        valueName: (v) => ["red", "blue", "green", "gold"][v],
        mrv,
        fc,
      };
    }
    const puzzle = SUDOKU_PUZZLES[puzzleIdx];
    const vars = Object.keys(SUDOKU_PEERS);
    return {
      vars,
      domainSize: 4,
      initial: Object.fromEntries(vars.map((v) => [v, Array.from({ length: 4 }, (_, i) => i)])),
      fixed: puzzle.givens,
      conflicts: (a, av, b, bv) => SUDOKU_PEERS[a].includes(b) && av === bv,
      label: (v) => v,
      valueName: (v) => `${v + 1}`,
      mrv,
      fc,
    };
  }, [problem, nQueens, colors, puzzleIdx, mrv, fc]);

  const run = useMemo(() => solveCsp(spec), [spec]);
  const stepper = useStepper(run.steps);
  const step = stepper.step;

  const comparisons = useMemo(
    () => [
      { name: "plain backtracking", mrv: false, fc: false, run: solveCsp({ ...spec, mrv: false, fc: false }) },
      { name: "+ MRV", mrv: true, fc: false, run: solveCsp({ ...spec, mrv: true, fc: false }) },
      { name: "+ MRV + forward checking", mrv: true, fc: true, run: solveCsp({ ...spec, mrv: true, fc: true }) },
    ],
    [spec]
  );

  const insights = useMemo(() => {
    const items: string[] = [];
    const plain = comparisons[0].run;
    const full = comparisons[2].run;
    items.push(
      `On this instance: plain backtracking made ${plain.backtracks} backtrack${plain.backtracks === 1 ? "" : "s"} and ${plain.checks} consistency checks; MRV + forward checking made ${full.backtracks} and ${full.checks}. Same solution, very different bills — the heuristics' whole point.`
    );
    if (fc) {
      items.push("Forward checking prunes the FUTURE — watch a domain shrink the moment its last compatible value is assigned elsewhere; the dead end is then met one level earlier, before it is even reached.");
    }
    if (mrv) {
      items.push("MRV (minimum remaining values) always takes the most constrained variable next — fail-first: whatever forces the crisis soonest settles it cheapest.");
    }
    if (problem === "map") {
      items.push(`SA is adjacent to five of the six other regions — the most constrained variable and the one MRV finds first. Australia's map really is 3-colourable; every adjacent pair here must simply differ.`);
    }
    if (problem === "queens") {
      items.push("The 4-queens search visits a few dozen states; 8-queens plain backtracking checks thousands of partial placements — the same engine, an exponentially worse surface.");
    }
    if (problem === "sudoku") {
      items.push("A 4×4 Sudoku is 16 variables with 12 peers each (row, column and 2×2 block all-different). The givens are pre-assigned and their consequences propagated into every domain before step 1.");
    }
    return items;
  }, [comparisons, fc, mrv, problem]);

  return (
    <LabFrame
      kicker="Laboratory 04 · constraint satisfaction"
      title="Constraint Satisfaction Lab"
      description="Variables, domains, constraints — and the depth-first search that respects them. Watch assignments happen, conflicts get caught, domains shrink under forward checking and dead ends trigger genuine backtracks, on three classic problems."
      aside={
        <>
          <Panel title="Problem">
            <ChipRow>
              <Chip active={problem === "queens"} onClick={() => setProblem("queens")} hue="var(--dv-viz-3)">N-Queens</Chip>
              <Chip active={problem === "map"} onClick={() => setProblem("map")} hue="var(--dv-viz-3)">Map colouring</Chip>
              <Chip active={problem === "sudoku"} onClick={() => setProblem("sudoku")} hue="var(--dv-viz-3)">Sudoku 4×4</Chip>
            </ChipRow>
            {problem === "queens" && (
              <ChipRow className="mt-2">
                {[4, 6, 8].map((n) => (
                  <Chip key={n} active={nQueens === n} onClick={() => setNQueens(n)} hue="var(--dv-primary)">{n} queens</Chip>
                ))}
              </ChipRow>
            )}
            {problem === "map" && (
              <ChipRow className="mt-2">
                {[3, 4].map((k) => (
                  <Chip key={k} active={colors === k} onClick={() => setColors(k)} hue="var(--dv-primary)">{k} colours</Chip>
                ))}
              </ChipRow>
            )}
            {problem === "sudoku" && (
              <ChipRow className="mt-2">
                {SUDOKU_PUZZLES.map((p, i) => (
                  <Chip key={p.name} active={puzzleIdx === i} onClick={() => setPuzzleIdx(i)} hue="var(--dv-primary)">{p.name}</Chip>
                ))}
              </ChipRow>
            )}
          </Panel>
          <Panel title="Heuristics">
            <ChipRow>
              <Chip active={mrv} onClick={() => setMrv(!mrv)} hue="var(--dv-viz-3)">MRV {mrv ? "on" : "off"}</Chip>
              <Chip active={fc} onClick={() => setFc(!fc)} hue="var(--dv-viz-3)">Forward checking {fc ? "on" : "off"}</Chip>
            </ChipRow>
            <p className="t-caption mt-2">MRV picks the most-constrained variable; forward checking prunes incompatible values from unassigned neighbours after every assignment.</p>
          </Panel>
          <Panel title="Domains — live">
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {spec.vars.map((v) => {
                const dom = step.domains[v] ?? [];
                const assigned = step.assignment[v];
                return (
                  <div key={v} className={cn("flex items-center gap-2 rounded-md px-1.5 py-1", step.current === v && "bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]")}>
                    <span className="w-10 shrink-0 font-mono text-[11px] font-semibold text-ink">{v}</span>
                    {assigned !== undefined ? (
                      <span className="rounded bg-viz-3 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                        {problem === "map" ? ["red", "blue", "green", "gold"][assigned] : problem === "sudoku" ? assigned + 1 : `r${assigned + 1}`}
                      </span>
                    ) : (
                      <span className="flex gap-1">
                        {dom.map((d) => (
                          <span key={d} className="tabular rounded border border-border-subtle px-1 font-mono text-[11px] text-ink-3">
                            {problem === "map" ? ["r", "b", "g", "y"][d] : problem === "sudoku" ? d + 1 : d + 1}
                          </span>
                        ))}
                        {dom.length === 0 && <span className="font-mono text-[11px] text-danger-text">∅ wiped</span>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Results">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="assignments" value={step.assignments} />
              <Stat label="checks" value={step.checks} />
              <Stat label="backtracks" value={step.backtracks} tone="var(--dv-danger-text)" />
            </div>
          </Panel>
        </>
      }
    >
      <Canvas>
        {problem === "queens" && <QueensBoard n={nQueens} step={step} spec={spec} />}
        {problem === "map" && <MapBoard step={step} colors={colors} />}
        {problem === "sudoku" && <SudokuBoard step={step} givens={SUDOKU_PUZZLES[puzzleIdx].givens} />}
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Execution">
          <ExecutionControls stepper={stepper} countLabel="step" />
        </Panel>
        <Panel title="Backtracking, line by line">
          <Pseudocode
            lines={[
              { text: "function BACKTRACK(assignment, domains)", indent: 0 },
              { text: "if assignment is complete: return it", indent: 1 },
              { text: "v ← pick-variable()   // in order, or MRV", indent: 1, tone: "key" },
              { text: "for each value in domain[v]:", indent: 1 },
              { text: "if value conflicts with no assignment: assign v ← value", indent: 2, tone: "key" },
              { text: "forward-check: prune future domains", indent: 2 },
              { text: "if a domain empties: undo, continue", indent: 2 },
              { text: "recurse; on success return", indent: 2 },
              { text: "undo v — this value is a dead end   // backtrack", indent: 2, tone: "key" },
              { text: "return failure", indent: 1 },
            ]}
            active={step.line}
          />
        </Panel>
      </div>

      <Panel title="The same problem, three configurations">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle text-left font-mono text-[11px] uppercase tracking-wider text-ink-3">
                <th className="py-2 pr-3">configuration</th>
                <th className="py-2 pr-3">solved</th>
                <th className="py-2 pr-3">assignments</th>
                <th className="py-2 pr-3">checks</th>
                <th className="py-2">backtracks</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => (
                <tr
                  key={c.name}
                  className={cn(
                    "border-b border-border-subtle/60",
                    c.mrv === mrv && c.fc === fc && "bg-surface-subtle"
                  )}
                >
                  <td className="py-2 pr-3 font-medium text-ink">{c.name}</td>
                  <td className="py-2 pr-3">{c.run.solution ? <span className="text-success-text">yes</span> : <span className="text-danger-text">no</span>}</td>
                  <td className="tabular py-2 pr-3 font-mono">{c.run.assignments}</td>
                  <td className="tabular py-2 pr-3 font-mono">{c.run.checks}</td>
                  <td className="tabular py-2 font-mono">{c.run.backtracks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="t-caption mt-2">Computed live by silently running the solver three times on the current problem instance.</p>
      </Panel>

      <Insights items={insights} />
    </LabFrame>
  );
}

/* ------------------------------------------------------- visual boards */

function QueensBoard({ n, step, spec }: { n: number; step: CSPStep; spec: CspSpec }) {
  const size = 380;
  const cell = size / n;
  const col = (v: string) => Number(v.slice(1));
  const currentCol = step.current ? col(step.current) : -1;
  const assigned = new Map(Object.entries(step.assignment).map(([v, r]) => [col(v), r]));
  const attacked = new Set<string>();
  for (let r = 0; r < n; r++) {
    for (const [c, row] of assigned) {
      if (spec.conflicts(`q${currentCol}`, r, `q${c}`, row)) {
        attacked.add(`${currentCol},${r}`);
        break;
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label="Queens board">
      {Array.from({ length: n * n }).map((_, i) => {
        const c = i % n;
        const r = Math.floor(i / n);
        const dark = (r + c) % 2 === 1;
        const isAttacked = c === currentCol && attacked.has(`${c},${r}`);
        return (
          <rect
            key={i}
            x={c * cell} y={r * cell} width={cell} height={cell}
            fill={isAttacked ? "var(--dv-danger-bg)" : dark ? "var(--dv-surface-inset)" : "var(--dv-surface)"}
            stroke="var(--dv-border-subtle)"
            strokeWidth="0.5"
            style={{ transition: "fill 150ms" }}
          />
        );
      })}
      {[...assigned.entries()].map(([c, r]) => (
        <text
          key={c}
          x={c * cell + cell / 2}
          y={r * cell + cell / 2 + cell * 0.16}
          textAnchor="middle"
          fontSize={cell * 0.72}
          className="select-none font-serif"
          fill="var(--dv-ink)"
          pointerEvents="none"
        >
          ♛
        </text>
      ))}
      {step.checking && step.checking.value !== undefined && step.current && (
        <text
          x={col(step.current) * cell + cell / 2}
          y={step.checking.value * cell + cell / 2 + cell * 0.16}
          textAnchor="middle"
          fontSize={cell * 0.72}
          fill={step.checking.ok ? "var(--dv-viz-3)" : "var(--dv-danger-text)"}
          opacity={step.checking.ok ? 0.9 : 0.45}
          pointerEvents="none"
        >
          ♛
        </text>
      )}
    </svg>
  );
}

function MapBoard({ step, colors }: { step: CSPStep; colors: number }) {
  const W = 560;
  const H = 380;
  const colorOf = (v: number) => COLOR_HEX[v] ?? "#999";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Australia constraint graph">
      {AUSTRALIA.adj.map(([a, b]) => {
        const na = AUSTRALIA.regions.find((r) => r.id === a)!;
        const nb = AUSTRALIA.regions.find((r) => r.id === b)!;
        const px = (x: number) => 40 + (x / 100) * (W - 80);
        const py = (y: number) => 40 + (y / 100) * (H - 80);
        return (
          <line key={`${a}-${b}`} x1={px(na.x)} y1={py(na.y)} x2={px(nb.x)} y2={py(nb.y)} stroke="var(--dv-border-strong)" strokeWidth="1.6" />
        );
      })}
      {AUSTRALIA.regions.map((r) => {
        const px = (x: number) => 40 + (x / 100) * (W - 80);
        const py = (y: number) => 40 + (y / 100) * (H - 80);
        const assigned = step.assignment[r.id];
        const dom = step.domains[r.id] ?? [];
        return (
          <g key={r.id}>
            {step.current === r.id && <circle cx={px(r.x)} cy={py(r.y)} r={34} fill="none" stroke="var(--dv-primary)" strokeWidth="1.6" className="dv-pulse" />}
            <circle
              cx={px(r.x)} cy={py(r.y)} r={27}
              fill={assigned !== undefined ? colorOf(assigned) : "var(--dv-surface)"}
              stroke={step.current === r.id ? "var(--dv-primary)" : "var(--dv-border-strong)"}
              strokeWidth="2"
              style={{ transition: "fill 200ms" }}
            />
            <text x={px(r.x)} y={py(r.y)} textAnchor="middle" dominantBaseline="middle" fontSize="13" className="font-mono font-bold" fill={assigned !== undefined ? "#fff" : "var(--dv-ink)"} pointerEvents="none">
              {r.id}
            </text>
            <text x={px(r.x)} y={py(r.y) + 40} textAnchor="middle" fontSize="10" className="font-mono" fill="var(--dv-ink-3)" pointerEvents="none">
              {assigned !== undefined ? ["red", "blue", "green", "gold"][assigned] : dom.length + " left"}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="11" className="fill-[var(--dv-ink-3)] font-mono">
        {colors} colours available — adjacent regions must differ
      </text>
    </svg>
  );
}

function SudokuBoard({ step, givens }: { step: CSPStep; givens: Record<string, number> }) {
  const size = 320;
  const cell = size / 4;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[340px]" role="img" aria-label="Sudoku board">
      {Array.from({ length: 16 }).map((_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const id = `r${r + 1}c${c + 1}`;
        const val = step.assignment[id];
        const isFixed = givens[id] !== undefined && givens[id] === val;
        const dom = step.domains[id] ?? [];
        return (
          <g key={id}>
            <rect
              x={c * cell} y={r * cell} width={cell} height={cell}
              fill={step.current === id ? "color-mix(in srgb, var(--dv-viz-3) 16%, var(--dv-surface))" : "var(--dv-surface)"}
              stroke="var(--dv-border)"
              strokeWidth="1"
              style={{ transition: "fill 150ms" }}
            />
            {val !== undefined ? (
              <text
                x={c * cell + cell / 2} y={r * cell + cell / 2 + 5}
                textAnchor="middle" fontSize="19"
                className={cn("font-mono", isFixed ? "font-bold" : "")}
                fill="var(--dv-ink)"
                pointerEvents="none"
              >
                {val + 1}
              </text>
            ) : (
              <text
                x={c * cell + cell / 2} y={r * cell + cell / 2 + 3}
                textAnchor="middle" fontSize="8.5"
                className="font-mono"
                fill="var(--dv-ink-3)"
                pointerEvents="none"
              >
                {dom.map((d) => d + 1).join("")}
              </text>
            )}
          </g>
        );
      })}
      {/* block separators */}
      {[1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * cell} x2={size} y2={i * cell} stroke="var(--dv-border-strong)" strokeWidth={i % 2 === 0 ? 2.4 : 1} />
      ))}
      {[1, 2, 3].map((i) => (
        <line key={`v${i}`} x1={i * cell} y1="0" x2={i * cell} y2={size} stroke="var(--dv-border-strong)" strokeWidth={i % 2 === 0 ? 2.4 : 1} />
      ))}
    </svg>
  );
}
