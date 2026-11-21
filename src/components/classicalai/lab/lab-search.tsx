"use client";

/**
 * LAB 1 — Search Algorithm Visualizer.
 *
 * Genuine BFS / DFS / uniform-cost / greedy best-first / A* over editable
 * weighted graphs (the classic Romania map, a city grid, a weighted trap,
 * or the student's own). Every visual state is one step of the real
 * execution trace from search-algorithms.ts; the comparison table runs all
 * five algorithms silently to produce honest numbers.
 */
import { useCallback, useMemo, useState } from "react";
import { CircleDot, Link2, MousePointer2, Plus, Star, Trash2 } from "lucide-react";
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
  useGraphGeometry,
  useStepper,
  useSvgDrag,
  type PseudoLine,
} from "./framework";
import {
  GRAPH_PRESETS,
  SEARCH_LABEL,
  SEARCH_PSEUDOCODE,
  cloneGraph,
  nodeById,
  runSearch,
  type SGraph,
  type SearchKind,
} from "./search-algorithms";

type EditMode = "move" | "addNode" | "connect" | "delete" | "setStart" | "setGoal";

const MODE_LABEL: Record<EditMode, string> = {
  move: "Move",
  addNode: "Add node",
  connect: "Connect",
  delete: "Delete",
  setStart: "Set start",
  setGoal: "Set goal",
};

const ALGOS: SearchKind[] = ["bfs", "dfs", "ucs", "greedy", "astar"];

const W = 640;
const H = 440;
const R = 13;

export function SearchLab() {
  const [presetId, setPresetId] = useState("romania");
  const [graph, setGraph] = useState<SGraph>(() => cloneGraph(GRAPH_PRESETS[0].graph));
  const [kind, setKind] = useState<SearchKind>("astar");
  const [mode, setMode] = useState<EditMode>("move");
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const result = useMemo(() => runSearch(graph, kind), [graph, kind]);
  const stepper = useStepper(result.steps);
  const step = stepper.step;
  const geo = useGraphGeometry(W, H, 22);
  const svgRef = useMemo(() => ({ current: null as SVGSVGElement | null }), []);
  const dragHandlers = useSvgDrag(svgRef, (dx, dy, e) => {
    const id = (e.target as Element).closest("[data-node]")?.getAttribute("data-node");
    if (!id || mode !== "move") return;
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) =>
        n.id === id
          ? { ...n, x: Math.max(0, Math.min(100, n.x + (dx / (W - 44)) * 100)), y: Math.max(0, Math.min(100, n.y + (dy / (H - 44)) * 100)) }
          : n
      ),
    }));
  });

  const onCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "addNode") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGraph((g) => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let i = g.nodes.length;
      let id = letters[i % 26];
      while (g.nodes.some((n) => n.id === id) && i < 260) {
        i += 1;
        id = letters[i % 26] + Math.floor(i / 26);
      }
      return { ...g, nodes: [...g.nodes, { id, label: id, x: Math.max(3, Math.min(97, x)), y: Math.max(4, Math.min(96, y)) }] };
    });
  };

  const onNodeClick = (id: string) => {
    if (mode === "connect") {
      if (!connectFrom) setConnectFrom(id);
      else if (connectFrom !== id) {
        const a = connectFrom;
        setGraph((g) => {
          const eid = `c${g.edges.length + 1}`;
          setSelectedEdge(eid);
          return { ...g, edges: [...g.edges, { id: eid, a, b: id, w: 1 }] };
        });
        setConnectFrom(null);
      }
    } else if (mode === "delete") {
      setGraph((g) => ({
        ...g,
        nodes: g.nodes.filter((n) => n.id !== id),
        edges: g.edges.filter((e) => e.a !== id && e.b !== id),
        start: g.start === id ? g.nodes.find((n) => n.id !== id)?.id ?? "" : g.start,
        goal: g.goal === id ? g.nodes.find((n) => n.id !== id)?.id ?? "" : g.goal,
      }));
    } else if (mode === "setStart" && id !== graph.goal) {
      setGraph((g) => ({ ...g, start: id }));
    } else if (mode === "setGoal" && id !== graph.start) {
      setGraph((g) => ({ ...g, goal: id }));
    } else if (mode === "move") {
      setSelectedNode(id);
      setSelectedEdge(null);
    }
  };

  const onEdgeClick = (id: string) => {
    if (mode === "delete") {
      setGraph((g) => ({ ...g, edges: g.edges.filter((e) => e.id !== id) }));
    } else if (mode === "move") {
      setSelectedEdge(id);
      setSelectedNode(null);
    }
  };

  const loadPreset = (id: string) => {
    const p = GRAPH_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setGraph(cloneGraph(p.graph));
    setSelectedEdge(null);
    setSelectedNode(null);
    setConnectFrom(null);
  };

  /* ---------------------------------------------------------- rendering */

  const edge = graph.edges.find((e) => e.id === selectedEdge);
  const node = graph.nodes.find((n) => n.id === selectedNode);
  const pathSet = new Set(step.path ?? []);
  const inPath = (a: string, b: string) => {
    if (!step.path) return false;
    for (let i = 0; i < step.path.length - 1; i++) {
      const p = step.path[i];
      const q = step.path[i + 1];
      if ((p === a && q === b) || (p === b && q === a)) return true;
    }
    return false;
  };

  const comparisons = useMemo(() => {
    const rows = ALGOS.map((k) => {
      const r = runSearch(graph, k);
      return { kind: k, ...r };
    });
    return rows;
  }, [graph]);

  const insights = useMemo(() => {
    const items: string[] = [];
    const optimal = Math.min(...comparisons.filter((c) => c.found).map((c) => c.cost));
    const greedy = comparisons.find((c) => c.kind === "greedy");
    const astar = comparisons.find((c) => c.kind === "astar");
    const ucs = comparisons.find((c) => c.kind === "ucs");
    const bfs = comparisons.find((c) => c.kind === "bfs");
    const dfs = comparisons.find((c) => c.kind === "dfs");
    if (greedy && greedy.found && greedy.cost > optimal) {
      items.push(
        `Greedy best-first returns a path of cost ${greedy.cost} here — the optimal cost is ${optimal}. Following h alone buys speed, not optimality.`
      );
    } else if (greedy && greedy.found && greedy.cost === optimal) {
      items.push(`On this graph greedy is lucky: its h-only path also costs ${optimal} — but that is fortune, not a guarantee.`);
    }
    if (astar && ucs && astar.found && ucs.found) {
      items.push(
        `A* expanded ${astar.expanded} nodes against uniform-cost's ${ucs.expanded} for the same optimal cost ${optimal} — the heuristic's savings, measured.`
      );
    }
    if (bfs && dfs && bfs.found && dfs.found) {
      items.push(
        `BFS guaranteed the fewest edges (${bfs.path.length - 1} steps) before weights could say anything; DFS wandered to ${dfs.path.length - 1} steps. Neither looks at edge weights.`
      );
    }
    if (graph === undefined) return items;
    const hN = graph.nodes.map((n) => n.h ?? 0);
    if (hN.some((v) => v > 0)) {
      items.push("Watch the frontier panel: it is a real queue/stack/priority queue — its ordering discipline is the ONLY difference between the five algorithms.");
    }
    return items;
  }, [comparisons, graph]);

  const pseudo: PseudoLine[] = SEARCH_PSEUDOCODE[kind];

  return (
    <LabFrame
      kicker="Laboratory 01 · search"
      title="Search Algorithm Visualizer"
      description="Run five classical search algorithms on real weighted maps — the Romania network with its canonical distances, a city grid, a weighted trap, or a graph you build yourself. Every dot, frontier and path is the genuine execution: step through it, or run it at speed."
      aside={
        <>
          <Panel title="Algorithm">
            <ChipRow>
              {ALGOS.map((k) => (
                <Chip key={k} active={kind === k} onClick={() => setKind(k)} hue="var(--dv-viz-3)">
                  {SEARCH_LABEL[k].replace(" (Dijkstra)", "")}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-3">
              {kind === "bfs" && "FIFO frontier — shallowest first. Optimal only when all edges cost the same."}
              {kind === "dfs" && "LIFO frontier — deepest first. Frugal memory, no optimality."}
              {kind === "ucs" && "Priority by g = cost-so-far. Optimal for any non-negative weights."}
              {kind === "greedy" && "Priority by h = estimate-to-go. Fast, not optimal."}
              {kind === "astar" && "Priority by f = g + h. Optimal when h never overestimates."}
            </p>
          </Panel>

          <Panel title="Map">
            <ChipRow>
              {GRAPH_PRESETS.map((p) => (
                <Chip key={p.id} active={presetId === p.id} onClick={() => loadPreset(p.id)} hue="var(--dv-viz-3)">
                  {p.name}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-3">{GRAPH_PRESETS.find((p) => p.id === presetId)?.blurb}</p>
          </Panel>

          <Panel title="Edit the graph">
            <ChipRow>
              {(["move", "addNode", "connect", "delete", "setStart", "setGoal"] as EditMode[]).map((m) => (
                <Chip key={m} active={mode === m} onClick={() => { setMode(m); setConnectFrom(null); }} hue="var(--dv-primary)">
                  {MODE_LABEL[m]}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-3">
              {mode === "move" && "Drag nodes to rearrange; click a node or an edge to inspect and edit it in this panel."}
              {mode === "addNode" && "Click anywhere on the canvas to drop a new node."}
              {mode === "connect" && connectFrom && `Now click a second node to draw the edge from ${connectFrom}.`}
              {mode === "connect" && !connectFrom && "Click one node, then another, to connect them (weight 1 to start)."}
              {mode === "delete" && "Click a node or edge to remove it."}
              {mode === "setStart" && "Click a node to make it the start (bronze)."}
              {mode === "setGoal" && "Click a node to make it the goal (green)."}
            </p>
            {node && (
              <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                <p className="dv-kicker">Node {node.label}</p>
                <label className="flex items-center gap-2 text-[12px] text-ink-2">
                  heuristic h
                  <input
                    type="number"
                    value={node.h ?? 0}
                    onChange={(e) =>
                      setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === node.id ? { ...n, h: Number(e.target.value) } : n)) }))
                    }
                    className="w-20 rounded-md border border-border-subtle bg-surface px-2 py-1 font-mono text-[12px]"
                  />
                </label>
              </div>
            )}
            {edge && (
              <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                <p className="dv-kicker">
                  Edge {nodeById(graph, edge.a).label} — {nodeById(graph, edge.b).label}
                </p>
                <label className="flex items-center gap-2 text-[12px] text-ink-2">
                  weight
                  <input
                    type="number"
                    min={1}
                    value={edge.w}
                    onChange={(e) =>
                      setGraph((g) => ({ ...g, edges: g.edges.map((x) => (x.id === edge.id ? { ...x, w: Math.max(1, Number(e.target.value)) } : x)) }))
                    }
                    className="w-20 rounded-md border border-border-subtle bg-surface px-2 py-1 font-mono text-[12px]"
                  />
                </label>
              </div>
            )}
          </Panel>

          <Panel title="Frontier — live">
            <div className="flex min-h-[76px] flex-wrap content-start gap-1.5">
              {step.queue.length === 0 && <span className="t-caption">empty</span>}
              {step.queue.map((q) => (
                <span
                  key={q.id}
                  className="tabular rounded-md border border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] px-1.5 py-0.5 font-mono text-[11px] text-viz-3"
                >
                  {nodeById(graph, q.id).label}
                  {kind === "ucs" && ` g=${q.key}`}
                  {kind === "greedy" && ` h=${q.key}`}
                  {kind === "astar" && ` f=${q.key}`}
                </span>
              ))}
            </div>
            <p className="t-caption mt-2">
              {kind === "bfs" && "A FIFO queue — entries leave in arrival order."}
              {kind === "dfs" && "A LIFO stack — the newest entry leaves first."}
              {kind === "ucs" && "A priority queue ordered by g (cost so far)."}
              {kind === "greedy" && "A priority queue ordered by h (estimated distance to go)."}
              {kind === "astar" && "A priority queue ordered by f = g + h."}
            </p>
          </Panel>

          <Panel title="Results">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="expanded" value={step.explored.length} />
              <Stat label="frontier max" value={result.maxFrontier} />
              <Stat
                label="path cost"
                value={step.cost !== undefined ? step.cost : "—"}
                tone="var(--dv-success-text)"
              />
              <Stat label="path steps" value={step.path ? step.path.length - 1 : "—"} />
            </div>
            {step.path && (
              <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-ink-2">
                {step.path.map((p) => nodeById(graph, p).label).join(" → ")}
              </p>
            )}
          </Panel>
        </>
      }
    >
      <Canvas>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none"
          onClick={onCanvasClick}
          role="img"
          aria-label="Search graph visualization"
        >
          {/* edges */}
          {graph.edges.map((e) => {
            const a = nodeById(graph, e.a);
            const b = nodeById(graph, e.b);
            const on = inPath(e.a, e.b);
            const dim = (step.path && !on) || false;
            return (
              <g
                key={e.id}
                className="dv-handle cursor-pointer"
                onClick={(ev) => { ev.stopPropagation(); onEdgeClick(e.id); }}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onEdgeClick(e.id); } }}
                tabIndex={0}
                role="button"
                aria-label={`Edge ${e.a}–${e.b}, weight ${e.w} — select`}
              >
                <line
                  x1={geo.px(a.x)}
                  y1={geo.py(a.y)}
                  x2={geo.px(b.x)}
                  y2={geo.py(b.y)}
                  stroke={on ? "var(--dv-viz-3)" : selectedEdge === e.id ? "var(--dv-primary)" : "var(--dv-border-strong)"}
                  strokeWidth={on ? 4 : selectedEdge === e.id ? 2.5 : 1.6}
                  opacity={dim ? 0.45 : 1}
                  style={{ transition: "stroke 160ms, stroke-width 160ms, opacity 160ms" }}
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
          {/* nodes */}
          {graph.nodes.map((n) => {
            const isStart = n.id === graph.start;
            const isGoal = n.id === graph.goal;
            const isExplored = step.explored.includes(n.id);
            const isFrontier = step.frontier.includes(n.id);
            const isCurrent = step.current === n.id;
            const onPath = pathSet.has(n.id);
            const fill = isStart
              ? "var(--dv-viz-3)"
              : isGoal
                ? "var(--dv-success-text)"
                : onPath
                  ? "var(--dv-viz-3)"
                  : isExplored
                    ? "color-mix(in srgb, var(--dv-primary) 22%, var(--dv-surface))"
                    : isFrontier
                      ? "color-mix(in srgb, var(--dv-violet-500) 18%, var(--dv-surface))"
                      : "var(--dv-surface)";
            const ring = onPath
              ? "var(--dv-viz-3)"
              : isCurrent
                ? "var(--dv-primary)"
                : isFrontier
                  ? "var(--dv-violet-500)"
                  : "var(--dv-border-strong)";
            return (
              <g
                key={n.id}
                data-node={n.id}
                className={cn(mode !== "addNode" && "dv-handle cursor-pointer")}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (mode !== "addNode") onNodeClick(n.id);
                }}
                onKeyDown={(ev) => {
                  if ((ev.key === "Enter" || ev.key === " ") && mode !== "addNode") {
                    ev.preventDefault();
                    onNodeClick(n.id);
                  }
                }}
                tabIndex={mode !== "addNode" ? 0 : -1}
                role={mode !== "addNode" ? "button" : undefined}
                aria-label={`Node ${n.id} — select`}
                style={{ cursor: mode === "move" ? "grab" : undefined }}
                {...(mode === "move" ? dragHandlers : {})}
              >
                {(isCurrent || isFrontier) && !onPath && (
                  <circle
                    cx={geo.px(n.x)}
                    cy={geo.py(n.y)}
                    r={R + 5}
                    fill="none"
                    stroke={isCurrent ? "var(--dv-primary)" : "var(--dv-violet-400)"}
                    strokeWidth="1.6"
                    strokeDasharray={isCurrent ? undefined : "3 3"}
                    className={isCurrent ? "dv-pulse" : undefined}
                  />
                )}
                <circle
                  cx={geo.px(n.x)}
                  cy={geo.py(n.y)}
                  r={R}
                  fill={fill}
                  stroke={ring}
                  strokeWidth={onPath ? 3 : 2}
                  style={{ transition: "fill 200ms, stroke 200ms" }}
                />
                <text
                  x={geo.px(n.x)}
                  y={geo.py(n.y) + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={n.label.length > 6 ? 8 : 10}
                  className={cn(
                    "font-mono font-semibold",
                    isStart || isGoal || onPath ? "fill-white" : "fill-[var(--dv-ink)]"
                  )}
                  pointerEvents="none"
                >
                  {n.label.length > 9 ? n.label.slice(0, 8) + "…" : n.label}
                </text>
                {n.h !== undefined && n.h > 0 && (
                  <text
                    x={geo.px(n.x)}
                    y={geo.py(n.y) + R + 11}
                    textAnchor="middle"
                    fontSize="9.5"
                    className="fill-[var(--dv-ink-3)] font-mono"
                    pointerEvents="none"
                  >
                    h={n.h}
                  </text>
                )}
              </g>
            );
          })}
          {connectFrom && (
            <text x={16} y={H - 10} className="fill-[var(--dv-primary)] font-mono" fontSize="11">
              connect: click a second node…
            </text>
          )}
        </svg>
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title={`Execution — ${SEARCH_LABEL[kind]}`}>
          <ExecutionControls stepper={stepper} countLabel="step" />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-3">
            <LegendSwatch color="var(--dv-viz-3)" label="start / path" />
            <LegendSwatch color="var(--dv-success-text)" label="goal" />
            <LegendSwatch color="color-mix(in srgb, var(--dv-primary) 22%, var(--dv-surface))" label="explored" />
            <LegendSwatch color="var(--dv-violet-500)" label="frontier" />
            <LegendSwatch color="var(--dv-primary)" label="current" />
          </div>
        </Panel>
        <Panel title="The algorithm, line by line">
          <Pseudocode lines={pseudo} active={step.line} />
          <p className="t-caption mt-2">The highlighted line is what the algorithm is doing in the step above — the trace and the code stay in lockstep.</p>
        </Panel>
      </div>

      <Panel title="All five algorithms, measured on this graph">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle text-left font-mono text-[11px] uppercase tracking-wider text-ink-3">
                <th className="py-2 pr-3">algorithm</th>
                <th className="py-2 pr-3">path</th>
                <th className="py-2 pr-3">cost</th>
                <th className="py-2 pr-3">expanded</th>
                <th className="py-2 pr-3">max frontier</th>
                <th className="py-2">verdict</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => {
                const opt = Math.min(...comparisons.filter((x) => x.found).map((x) => x.cost));
                return (
                  <tr
                    key={c.kind}
                    className={cn("border-b border-border-subtle/60", c.kind === kind && "bg-surface-subtle")}
                  >
                    <td className="py-2 pr-3 font-medium text-ink">{SEARCH_LABEL[c.kind]}</td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-ink-2">
                      {c.found ? c.path.map((p) => nodeById(graph, p).label).join("→") : "not found"}
                    </td>
                    <td className="tabular py-2 pr-3 font-mono">{c.found ? c.cost : "—"}</td>
                    <td className="tabular py-2 pr-3 font-mono">{c.expanded}</td>
                    <td className="tabular py-2 pr-3 font-mono">{c.maxFrontier}</td>
                    <td className="py-2 text-[11.5px]">
                      {c.found ? (
                        c.cost === opt ? (
                          <span className="text-success-text">optimal</span>
                        ) : (
                          <span className="text-danger-text">suboptimal (opt {opt})</span>
                        )
                      ) : (
                        <span className="text-danger-text">failed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="t-caption mt-2">
          This table is computed live by silently running all five searches on the current graph — change the map or the weights and it updates.
        </p>
      </Panel>

      <Insights items={insights} />
    </LabFrame>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full border" style={{ background: color, borderColor: "var(--dv-border-strong)" }} />
      {label}
    </span>
  );
}
