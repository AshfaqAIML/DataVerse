"use client";

/**
 * LAB 2 — Heuristic Search Explorer.
 *
 * Students adjust the heuristic value of every node with live sliders and
 * watch how A* and greedy best-first reorder their frontiers. The audit
 * panel is computed, not asserted: true costs-to-go come from a real
 * Dijkstra run, and admissibility (h ≤ h*) and consistency
 * (h(u) ≤ w + h(v)) are checked edge by edge against them.
 */
import { useMemo, useState } from "react";
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
  useGraphGeometry,
  useStepper,
} from "./framework";
import { cloneGraph, nodeById, runSearch, trueCosts, type SearchKind } from "./search-algorithms";

const BASE = cloneGraph({
  start: "S",
  goal: "G",
  nodes: [
    { id: "S", label: "S", x: 8, y: 50, h: 0 },
    { id: "A", label: "A", x: 30, y: 22, h: 0 },
    { id: "B", label: "B", x: 30, y: 50, h: 0 },
    { id: "C", label: "C", x: 30, y: 78, h: 0 },
    { id: "D", label: "D", x: 54, y: 22, h: 0 },
    { id: "E", label: "E", x: 54, y: 78, h: 0 },
    { id: "F", label: "F", x: 74, y: 50, h: 0 },
    { id: "G", label: "G", x: 92, y: 50, h: 0 },
  ],
  edges: [
    { id: "t1", a: "S", b: "A", w: 2 },
    { id: "t2", a: "S", b: "B", w: 3 },
    { id: "t3", a: "S", b: "C", w: 5 },
    { id: "t4", a: "A", b: "D", w: 8 },
    { id: "t5", a: "B", b: "F", w: 14 },
    { id: "t6", a: "C", b: "E", w: 3 },
    { id: "t7", a: "D", b: "F", w: 3 },
    { id: "t8", a: "E", b: "F", w: 6 },
    { id: "t9", a: "F", b: "G", w: 2 },
  ],
});

const W = 640;
const H = 400;
const R = 14;

type HPreset = "exact" | "half" | "zero" | "inadmissible" | "inconsistent";

const H_PRESETS: Array<{ id: HPreset; name: string; note: string }> = [
  { id: "exact", name: "Exact h*", note: "The true cost-to-go everywhere (computed by Dijkstra): the most informed admissible heuristic possible." },
  { id: "half", name: "Half h*", note: "Halve every value — still admissible and consistent, but less informed: more expansions for the same answer." },
  { id: "zero", name: "All zeros", note: "h ≡ 0 turns A* into uniform-cost search — the no-knowledge baseline." },
  { id: "inadmissible", name: "Overestimates", note: "Values near the goal are doubled: h > h* breaks admissibility, and A* may return a suboptimal path." },
  { id: "inconsistent", name: "Inconsistent", note: "h(B) is dropped to 0 while neighbours keep exact values: every value still underestimates, but the triangle inequality fails on edge S–B." },
];

function computeH(p: HPreset, truth: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of BASE.nodes) {
    const t = Math.round(truth[n.id] ?? 0);
    if (p === "exact") out[n.id] = t;
    else if (p === "half") out[n.id] = Math.floor(t / 2);
    else if (p === "zero") out[n.id] = 0;
    else if (p === "inadmissible") out[n.id] = t === 0 || t <= 3 ? Math.round(t * 2.5) : t;
    else out[n.id] = t;
  }
  if (p === "inconsistent") {
    out.B = 0;
    out.S = Math.round(truth.S ?? 0);
  }
  return out;
}

export function HeuristicLab() {
  const baseTrue = useMemo(() => trueCosts(BASE), []);
  const [kind, setKind] = useState<SearchKind>("astar");
  const [preset, setPreset] = useState<HPreset>("exact");
  const [manual, setManual] = useState(false);
  const [h, setH] = useState<Record<string, number>>(() => computeH("exact", trueCosts(BASE)));

  const graph = useMemo(() => ({ ...BASE, nodes: BASE.nodes.map((n) => ({ ...n, h: h[n.id] ?? 0 })) }), [h]);

  const result = useMemo(() => runSearch(graph, kind), [graph, kind]);
  const stepper = useStepper(result.steps);
  const step = stepper.step;
  const geo = useGraphGeometry(W, H, 22);

  const dijkstra = useMemo(() => runSearch(
    { ...graph, nodes: graph.nodes.map((n) => ({ ...n, h: 0 })) },
    "ucs"
  ), [graph]);

  const applyPreset = (p: HPreset) => {
    setPreset(p);
    setManual(false);
    setH(computeH(p, baseTrue));
  };

  /* ----------------------------------------------------- the live audit */

  const audit = useMemo(() => {
    const inadmissible = BASE.nodes.filter((n) => (h[n.id] ?? 0) > (baseTrue[n.id] ?? 0));
    const inconsistent: string[] = [];
    for (const e of BASE.edges) {
      const hu = h[e.a] ?? 0;
      const hv = h[e.b] ?? 0;
      if (hu > e.w + hv) inconsistent.push(`${nodeById(BASE, e.a).label}–${nodeById(BASE, e.b).label}: h(${nodeById(BASE, e.a).label})=${hu} > ${e.w} + h(${nodeById(BASE, e.b).label})=${e.w + hv}`);
      if (hv > e.w + hu) inconsistent.push(`${nodeById(BASE, e.b).label}–${nodeById(BASE, e.a).label}: h(${nodeById(BASE, e.b).label})=${hv} > ${e.w} + h(${nodeById(BASE, e.a).label})=${e.w + hu}`);
    }
    return { admissible: inadmissible.length === 0, consistent: inconsistent.length === 0, inadmissible, inconsistent };
  }, [h, baseTrue]);

  const insights = useMemo(() => {
    const items: string[] = [];
    if (!audit.admissible) {
      items.push(
        `Admissibility is VIOLATED at ${audit.inadmissible.map((n) => n.label).join(", ")}: h exceeds the true cost-to-go. With an inadmissible heuristic, A*'s optimality proof no longer applies — and this run ${result.found && result.cost > dijkstra.cost ? `indeed returned cost ${result.cost} while ${dijkstra.cost} is achievable` : "happened to find the optimum anyway — luck, not guarantee"}.`
      );
    } else if (preset === "exact") {
      items.push("With h = h*, every frontier node has f = C* once the optimal path is touched — A* glides down a single corridor and expands the minimum possible.");
    }
    if (!audit.consistent) {
      items.push(
        `Consistency is VIOLATED on edge ${audit.inconsistent[0]?.split(":")[0] ?? ""}: the triangle inequality h(u) ≤ w + h(v) fails. Graph search without reopening can then settle a node with a stale g and return a suboptimal path — Lesson a-08's counterexample, live.`
      );
    }
    if (audit.admissible && audit.consistent && kind === "astar") {
      items.push(
        `A* with this h expanded ${result.expanded} nodes; uniform-cost (h ≡ 0) expands ${dijkstra.expanded} for the same optimal cost ${dijkstra.cost}. That gap is the heuristic's measured value: ${(dijkstra.expanded - result.expanded).toString().replace("-", "")} ${dijkstra.expanded >= result.expanded ? "fewer" : "MORE (check admissibility!)"} expansions.`
      );
    }
    if (kind === "greedy") {
      items.push(
        result.cost === dijkstra.cost
          ? "Greedy best-first found the optimal path this time — but nothing about h (or this audit) promised it."
          : `Greedy best-first paid ${result.cost} for a path worth ${dijkstra.cost} — the cost of trusting h alone, measured.`
      );
    }
    items.push("Drag any h slider and watch the frontier re-order instantly: f = g + h is recomputed on every real step — nothing here is canned.");
    return items;
  }, [audit, result, dijkstra, kind, preset]);

  const pseudo = kind === "astar"
    ? [
        { text: "frontier ← priority queue by f = g + h", indent: 0 },
        { text: "g[S] ← 0", indent: 0 },
        { text: "while frontier not empty:", indent: 0 },
        { text: "n ← pop-min-f()", indent: 1, tone: "key" as const },
        { text: "if n = goal: return path, g[n]  // optimal iff h admissible", indent: 1, tone: "key" as const },
        { text: "for each edge (n → s, w):", indent: 1 },
        { text: "if g[n] + w < g[s]: g[s] ← g[n] + w; push s with f = g[s] + h[s]", indent: 2 },
      ]
    : [
        { text: "frontier ← priority queue by h alone", indent: 0 },
        { text: "while frontier not empty:", indent: 0 },
        { text: "n ← pop-min-h()", indent: 1, tone: "key" as const },
        { text: "if n = goal: return path  // no optimality claim", indent: 1 },
        { text: "for each unvisited neighbour s: push s with key h[s]", indent: 1 },
      ];

  return (
    <LabFrame
      kicker="Laboratory 02 · informed search"
      title="Heuristic Search Explorer"
      description="A heuristic is a claim about the future. Adjust h at every node — by preset or by hand — and watch A* and greedy best-first reorder around your estimates. The audit panel checks your heuristic against the true costs-to-go (computed by Dijkstra, live) and reports exactly where admissibility and consistency break."
      aside={
        <>
          <Panel title="Algorithm">
            <ChipRow>
              <Chip active={kind === "astar"} onClick={() => setKind("astar")} hue="var(--dv-viz-3)">A* (f = g + h)</Chip>
              <Chip active={kind === "greedy"} onClick={() => setKind("greedy")} hue="var(--dv-viz-3)">Greedy (h only)</Chip>
            </ChipRow>
          </Panel>

          <Panel title="Heuristic presets">
            <ChipRow>
              {H_PRESETS.map((p) => (
                <Chip key={p.id} active={!manual && preset === p.id} onClick={() => applyPreset(p.id)} hue="var(--dv-viz-3)">
                  {p.name}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-3">{H_PRESETS.find((p) => p.id === preset)?.note}</p>
            <p className="t-caption mt-2">
              True costs h* (Dijkstra): {BASE.nodes.map((n) => `${n.label}=${baseTrue[n.id]}`).join(" · ")}
            </p>
          </Panel>

          <Panel title="Heuristic values — drag to edit">
            <div className="space-y-2.5">
              {BASE.nodes.map((n) => (
                <label key={n.id} className="flex items-center gap-2.5">
                  <span className="w-5 shrink-0 font-mono text-[12px] font-semibold text-ink">{n.label}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10, Math.round((baseTrue[n.id] ?? 0) * 2))}
                    value={h[n.id] ?? 0}
                    onChange={(e) => {
                      setManual(true);
                      setH((old) => ({ ...old, [n.id]: Number(e.target.value) }));
                    }}
                    className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
                  />
                  <span
                    className="tabular w-14 shrink-0 text-right font-mono text-[11.5px]"
                    style={{ color: (h[n.id] ?? 0) > (baseTrue[n.id] ?? 0) ? "var(--dv-danger-text)" : "var(--dv-viz-3)" }}
                  >
                    h={h[n.id] ?? 0}
                    <span className="ml-1 text-[9px] text-ink-3">/{baseTrue[n.id] ?? 0}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="t-caption mt-2">The number after the slash is the true cost-to-go h* — cross it and the value turns red (inadmissible).</p>
          </Panel>

          <Panel title="Audit — computed live">
            <div className="space-y-2">
              <Verdict ok={audit.admissible} label="Admissible" detail="h(n) ≤ h*(n) at every node" />
              <Verdict ok={audit.consistent} label="Consistent" detail="h(u) ≤ w(u,v) + h(v) on every edge" />
            </div>
            {audit.inadmissible.length > 0 && (
              <ul className="mt-3 space-y-1 text-[11.5px] text-danger-text">
                {audit.inadmissible.map((n) => (
                  <li key={n.id} className="font-mono">
                    h({n.label})={h[n.id]} &gt; h*= {baseTrue[n.id]}
                  </li>
                ))}
              </ul>
            )}
            {audit.inconsistent.length > 0 && (
              <ul className="mt-3 space-y-1 text-[11.5px] text-danger-text">
                {audit.inconsistent.map((s, i) => (
                  <li key={i} className="font-mono">{s}</li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Results">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="expanded (this h)" value={result.expanded} />
              <Stat label="expanded (h=0)" value={dijkstra.expanded} />
              <Stat label="path cost" value={result.found ? result.cost : "—"} tone="var(--dv-success-text)" />
              <Stat
                label="optimal cost"
                value={dijkstra.found ? dijkstra.cost : "—"}
              />
            </div>
          </Panel>
        </>
      }
    >
      <Canvas>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Heuristic search graph">
          {BASE.edges.map((e) => {
            const a = nodeById(BASE, e.a);
            const b = nodeById(BASE, e.b);
            const on = step.path && (() => {
              const p = step.path!;
              for (let i = 0; i < p.length - 1; i++) {
                if ((p[i] === e.a && p[i + 1] === e.b) || (p[i] === e.b && p[i + 1] === e.a)) return true;
              }
              return false;
            })();
            return (
              <g key={e.id}>
                <line
                  x1={geo.px(a.x)} y1={geo.py(a.y)} x2={geo.px(b.x)} y2={geo.py(b.y)}
                  stroke={on ? "var(--dv-viz-3)" : "var(--dv-border-strong)"}
                  strokeWidth={on ? 4 : 1.6}
                  opacity={step.path && !on ? 0.4 : 1}
                  style={{ transition: "all 180ms" }}
                />
                <text
                  x={(geo.px(a.x) + geo.px(b.x)) / 2}
                  y={(geo.py(a.y) + geo.py(b.y)) / 2 - 5}
                  textAnchor="middle"
                  className="fill-[var(--dv-ink-3)] font-mono"
                  fontSize="10"
                >
                  {e.w}
                </text>
              </g>
            );
          })}
          {BASE.nodes.map((n) => {
            const isStart = n.id === BASE.start;
            const isGoal = n.id === BASE.goal;
            const isExplored = step.explored.includes(n.id);
            const isFrontier = step.frontier.includes(n.id);
            const onPath = step.path?.includes(n.id);
            const over = (h[n.id] ?? 0) > (baseTrue[n.id] ?? 0);
            return (
              <g key={n.id}>
                {step.current === n.id && (
                  <circle cx={geo.px(n.x)} cy={geo.py(n.y)} r={R + 6} fill="none" stroke="var(--dv-primary)" strokeWidth="1.6" className="dv-pulse" />
                )}
                <circle
                  cx={geo.px(n.x)}
                  cy={geo.py(n.y)}
                  r={R}
                  fill={
                    isStart || isGoal
                      ? isStart ? "var(--dv-viz-3)" : "var(--dv-success-text)"
                      : onPath
                        ? "var(--dv-viz-3)"
                        : isExplored
                          ? "color-mix(in srgb, var(--dv-primary) 22%, var(--dv-surface))"
                          : isFrontier
                            ? "color-mix(in srgb, var(--dv-violet-500) 18%, var(--dv-surface))"
                            : "var(--dv-surface)"
                  }
                  stroke={onPath ? "var(--dv-viz-3)" : isFrontier ? "var(--dv-violet-500)" : over ? "var(--dv-danger-text)" : "var(--dv-border-strong)"}
                  strokeWidth={onPath ? 3 : 2}
                  style={{ transition: "all 180ms" }}
                />
                <text x={geo.px(n.x)} y={geo.py(n.y) + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="11" className="font-mono font-semibold" fill={isStart || isGoal || onPath ? "#fff" : "var(--dv-ink)"} pointerEvents="none">
                  {n.label}
                </text>
                <text x={geo.px(n.x)} y={geo.py(n.y) - R - 6} textAnchor="middle" fontSize="10.5" className="font-mono" fill={over ? "var(--dv-danger-text)" : "var(--dv-ink-2)"} pointerEvents="none">
                  h={h[n.id] ?? 0}
                </text>
                <text x={geo.px(n.x)} y={geo.py(n.y) + R + 12} textAnchor="middle" fontSize="10.5" className="font-mono" fill="var(--dv-ink-3)" pointerEvents="none">
                  g={step.g[n.id] !== undefined ? step.g[n.id] : "·"}
                </text>
              </g>
            );
          })}
        </svg>
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title={kind === "astar" ? "A* — the window is f = g + h" : "Greedy best-first — h is the whole story"}>
          <ExecutionControls stepper={stepper} countLabel="step" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {step.queue.map((q) => (
              <span key={q.id} className="tabular rounded-md border border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] px-1.5 py-0.5 font-mono text-[11px] text-viz-3">
                {q.id}
                {kind === "astar" ? ` f=${q.key}` : ` h=${q.key}`}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="The algorithm, line by line">
          <Pseudocode lines={pseudo} active={step.line} />
        </Panel>
      </div>

      <Insights items={insights} />
    </LabFrame>
  );
}

function Verdict({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className={cnRow(ok)}>
      <span className={cnDot(ok)}>{ok ? "✓" : "✗"}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">{label}</p>
        <p className="t-caption">{detail}</p>
      </div>
    </div>
  );
}

function cnRow(ok: boolean) {
  return `flex items-start gap-2.5 rounded-lg border px-3 py-2 ${ok ? "border-success-border bg-success-bg/40" : "border-danger-border bg-danger-bg/40"}`;
}
function cnDot(ok: boolean) {
  return `mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${ok ? "bg-success-solid" : "bg-danger-solid"}`;
}
