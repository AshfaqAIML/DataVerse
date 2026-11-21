/**
 * Search algorithm engines for the Classical AI Laboratory — pure, genuine
 * implementations of BFS, DFS, uniform-cost, greedy best-first and A* over
 * weighted graphs. Each run produces a full step trace (the real execution:
 * every dequeue, every expansion, every relaxation) plus a result record.
 * Dijkstra (UCS from every node) provides the TRUE cost-to-go used by the
 * Heuristic Explorer's admissibility/consistency audit.
 *
 * Everything here is deterministic and pure: same input → same trace.
 */

export interface SNode {
  id: string;
  label: string;
  x: number; // 0–100 author grid
  y: number;
  h?: number; // heuristic estimate to goal (when the lab uses one)
}

export interface SEdge {
  id: string;
  a: string;
  b: string;
  w: number;
}

export interface SGraph {
  nodes: SNode[];
  edges: SEdge[];
  start: string;
  goal: string;
}

export type SearchKind = "bfs" | "dfs" | "ucs" | "greedy" | "astar";

export const SEARCH_LABEL: Record<SearchKind, string> = {
  bfs: "Breadth-first",
  dfs: "Depth-first",
  ucs: "Uniform-cost (Dijkstra)",
  greedy: "Greedy best-first",
  astar: "A*",
};

export interface SearchStep {
  note: string;
  line: number;
  phase: string;
  /** node statuses at this instant */
  explored: string[];
  frontier: string[];
  current?: string;
  g: Record<string, number>;
  parent: Record<string, string>;
  /** ordered frontier entries with their priority keys */
  queue: Array<{ id: string; key: number }>;
  path?: string[];
  cost?: number;
  done?: boolean;
  failed?: boolean;
  found?: boolean;
}

export interface SearchResult {
  found: boolean;
  path: string[];
  cost: number;
  expanded: number; // nodes dequeued/expanded
  generated: number; // nodes ever added to the frontier
  maxFrontier: number;
  steps: SearchStep[];
}

export const SEARCH_PSEUDOCODE = {
  bfs: [
    { text: "frontier ← FIFO queue [start]", indent: 0 },
    { text: "while frontier is not empty:", indent: 0 },
    { text: "n ← frontier.pop-first()", indent: 1, tone: "key" as const },
    { text: "mark n explored", indent: 1 },
    { text: "if n = goal: return path, depth", indent: 1 },
    { text: "for each neighbour s of n:", indent: 1 },
    { text: "if s unvisited: frontier.push(s)", indent: 2 },
  ],
  dfs: [
    { text: "frontier ← LIFO stack [start]", indent: 0 },
    { text: "while frontier is not empty:", indent: 0 },
    { text: "n ← frontier.pop-last()", indent: 1, tone: "key" as const },
    { text: "mark n explored", indent: 1 },
    { text: "if n = goal: return path, depth", indent: 1 },
    { text: "for each neighbour s of n:", indent: 1 },
    { text: "if s unvisited: frontier.push(s)", indent: 2 },
  ],
  ucs: [
    { text: "frontier ← priority queue by g (cost so far)", indent: 0 },
    { text: "g[start] ← 0", indent: 0 },
    { text: "while frontier is not empty:", indent: 0 },
    { text: "n ← frontier.pop-min-g()", indent: 1, tone: "key" as const },
    { text: "if n = goal: return path, g[n]", indent: 1 },
    { text: "for each edge (n → s, cost w):", indent: 1 },
    { text: "if g[n] + w < g[s]: relax and update parent[s] ← n", indent: 2, tone: "key" as const },
  ],
  greedy: [
    { text: "frontier ← priority queue by h (estimate to goal)", indent: 0 },
    { text: "while frontier is not empty:", indent: 0 },
    { text: "n ← frontier.pop-min-h()", indent: 1, tone: "key" as const },
    { text: "if n = goal: return path, cost", indent: 1 },
    { text: "for each neighbour s of n:", indent: 1 },
    { text: "if s unvisited: frontier.push(s, key = h[s])", indent: 2 },
  ],
  astar: [
    { text: "frontier ← priority queue by f = g + h", indent: 0 },
    { text: "g[start] ← 0; parent[start] ← none", indent: 0 },
    { text: "while frontier is not empty:", indent: 0 },
    { text: "n ← frontier.pop-min-f()", indent: 1, tone: "key" as const },
    { text: "if n = goal: return path, g[n]   // optimal if h admissible", indent: 1, tone: "key" as const },
    { text: "for each edge (n → s, cost w):", indent: 1 },
    { text: "if g[n] + w < g[s]: g[s] ← g[n] + w; parent[s] ← n", indent: 2, tone: "key" as const },
  ],
};

/* ---------------------------------------------------------------- engine */

function adjacency(graph: SGraph): Map<string, Array<{ to: string; w: number }>> {
  const adj = new Map<string, Array<{ to: string; w: number }>>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    adj.get(e.a)?.push({ to: e.b, w: e.w });
    adj.get(e.b)?.push({ to: e.a, w: e.w });
  }
  for (const list of adj.values()) list.sort((p, q) => p.to.localeCompare(q.to));
  return adj;
}

export function nodeById(graph: SGraph, id: string): SNode {
  return graph.nodes.find((n) => n.id === id) ?? graph.nodes[0];
}

interface Frontier {
  entries: Array<{ id: string; key: number }>;
  remove(): { id: string; key: number } | undefined;
  push(id: string, key: number): void;
  update(id: string, key: number): void;
  has(id: string): boolean;
}

function makeFrontier(kind: SearchKind): Frontier {
  const entries: Array<{ id: string; key: number }> = [];
  const cmp: (a: { key: number; id: string }, b: { key: number; id: string }) => number =
    kind === "dfs"
      ? (a, b) => b.id.localeCompare(a.id) // pop-last semantics; stable display
      : (a, b) => a.key - b.key || a.id.localeCompare(b.id);
  return {
    entries,
    remove() {
      if (entries.length === 0) return undefined;
      entries.sort(cmp);
      return kind === "dfs" ? entries.pop() : entries.shift();
    },
    push(id, key) {
      entries.push({ id, key });
      entries.sort(cmp);
    },
    update(id, key) {
      const at = entries.findIndex((e) => e.id === id);
      if (at >= 0) entries[at] = { id, key };
      else entries.push({ id, key });
      entries.sort(cmp);
    },
    has: (id) => entries.some((e) => e.id === id),
  };
}

/** The genuine search — all five algorithms, one step-emitting core. */
export function runSearch(graph: SGraph, kind: SearchKind): SearchResult {
  const adj = adjacency(graph);
  const h = (id: string) => nodeById(graph, id).h ?? 0;
  const start = graph.start;
  const goal = graph.goal;
  const g: Record<string, number> = { [start]: 0 };
  const parent: Record<string, string> = {};
  const explored = new Set<string>();
  const generated = new Set<string>([start]);
  const frontier = makeFrontier(kind);
  frontier.push(start, kind === "bfs" || kind === "dfs" ? 0 : kind === "ucs" ? 0 : kind === "greedy" ? h(start) : h(start));
  const steps: SearchStep[] = [];
  let maxFrontier = 1;
  let expanded = 0;
  let found = false;
  let cost = 0;

  const snapshot = (note: string, line: number, phase: string, extra?: Partial<SearchStep>): SearchStep => ({
    note,
    line,
    phase,
    explored: [...explored],
    frontier: frontier.entries.map((e) => e.id),
    g: { ...g },
    parent: { ...parent },
    queue: frontier.entries.map((e) => ({ ...e })),
    ...extra,
  });

  const keyOf = (id: string) =>
    kind === "bfs" || kind === "dfs" ? 0 : kind === "ucs" ? (g[id] ?? Infinity) : kind === "greedy" ? h(id) : (g[id] ?? Infinity) + h(id);

  const keyLabel = (id: string) => {
    const v = keyOf(id);
    if (!Number.isFinite(v)) return "∞";
    if (kind === "ucs") return `g=${v}`;
    if (kind === "greedy") return `h=${v}`;
    if (kind === "astar") return `f=${v}`;
    return "";
  };

  steps.push(
    snapshot(
      `${SEARCH_LABEL[kind]} begins: the frontier holds only the start, ${nodeById(graph, start).label}.`,
      0,
      "initialise"
    )
  );

  const pathTo = (end: string): string[] => {
    const path = [end];
    let cur = end;
    while (parent[cur]) {
      cur = parent[cur];
      path.unshift(cur);
    }
    return path;
  };

  let guard = 0;
  while (frontier.entries.length > 0 && guard++ < 10000) {
    const entry = frontier.remove();
    if (!entry) break;
    const n = entry.id;
    if (explored.has(n)) continue; // stale entry (priority queues may hold dupes)
    expanded += 1;
    explored.add(n);

    if (n === goal) {
      const path = pathTo(n);
      cost = g[n] ?? (kind === "bfs" || kind === "dfs" ? path.length - 1 : 0);
      steps.push(
        snapshot(
          `Goal ${nodeById(graph, goal).label} is dequeued — the search stops. Path (${path.length - 1} step${path.length - 1 === 1 ? "" : "s"}): ${path
            .map((p) => nodeById(graph, p).label)
            .join(" → ")}. Total cost ${cost}.`,
          4,
          "goal",
          { path, cost, done: true, found: true }
        )
      );
      found = true;
      break;
    }

    steps.push(
      snapshot(
        `${nodeById(graph, n).label} is expanded${kind === "bfs" || kind === "dfs" ? ` (depth ${g[n] ?? 0})` : ` (${keyLabel(n)})`}.`,
        kind === "bfs" || kind === "dfs" ? 2 : 3,
        "expand"
      )
    );

    for (const { to, w } of adj.get(n) ?? []) {
      if (explored.has(to)) continue;
      const newG = (g[n] ?? 0) + w;
      if (kind === "ucs" || kind === "astar") {
        if (newG < (g[to] ?? Infinity)) {
          const better = newG < (g[to] ?? Infinity);
          g[to] = newG;
          parent[to] = n;
          if (!frontier.has(to)) {
            frontier.push(to, keyOf(to));
            generated.add(to);
          } else {
            frontier.update(to, keyOf(to));
          }
          steps.push(
            snapshot(
              better
                ? `Edge ${nodeById(graph, n).label}–${nodeById(graph, to).label} (w=${w}): ${nodeById(graph, to).label} enters the frontier with g=${newG}${kind === "astar" ? `, f=${newG + h(to)}` : ""}.`
                : `Edge ${nodeById(graph, n).label}–${nodeById(graph, to).label}: ${nodeById(graph, to).label} is already better in the frontier — ignored.`,
              6,
              "generate",
              { current: n }
            )
          );
        }
      } else {
        if (!generated.has(to) && !frontier.has(to)) {
          g[to] = newG;
          parent[to] = n;
          frontier.push(to, kind === "bfs" || kind === "dfs" ? 0 : h(to));
          generated.add(to);
          steps.push(
            snapshot(
              `Edge ${nodeById(graph, n).label}–${nodeById(graph, to).label}: ${nodeById(graph, to).label} joins the frontier${kind === "greedy" ? ` with h=${h(to)}` : ""}.`,
              6,
              "generate",
              { current: n }
            )
          );
        }
      }
    }
    maxFrontier = Math.max(maxFrontier, frontier.entries.length);
  }

  if (!found) {
    steps.push(
      snapshot(
        `The frontier is empty and ${nodeById(graph, goal).label} was never reached — this search fails on this graph.`,
        1,
        "fail",
        { failed: true, done: true }
      )
    );
  }

  return {
    found,
    path: found ? pathTo(goal) : [],
    cost: found ? cost : Infinity,
    expanded,
    generated: generated.size,
    maxFrontier,
    steps,
  };
}

/** True optimal cost-to-go from every node (Dijkstra from the goal) — the
 *  ground truth the heuristic audit compares against. */
export function trueCosts(graph: SGraph): Record<string, number> {
  const adj = adjacency(graph);
  const dist: Record<string, number> = {};
  for (const n of graph.nodes) dist[n.id] = Infinity;
  dist[graph.goal] = 0;
  const pq: Array<{ id: string; d: number }> = [{ id: graph.goal, d: 0 }];
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { id, d } = pq.shift()!;
    if (d > dist[id]) continue;
    for (const { to, w } of adj.get(id) ?? []) {
      if (dist[id] + w < dist[to]) {
        dist[to] = dist[id] + w;
        pq.push({ id: to, d: dist[to] });
      }
    }
  }
  return dist;
}

/* --------------------------------------------------------------- presets */

export interface GraphPreset {
  id: string;
  name: string;
  blurb: string;
  graph: SGraph;
}

/** The classic Romania map (AIMA), western subset — real road costs and the
 *  canonical straight-line distances to Bucharest. */
export const ROMANIA: SGraph = {
  start: "Arad",
  goal: "Bucharest",
  nodes: [
    { id: "Arad", label: "Arad", x: 8, y: 40, h: 366 },
    { id: "Zerind", label: "Zerind", x: 14, y: 22, h: 374 },
    { id: "Oradea", label: "Oradea", x: 30, y: 10, h: 380 },
    { id: "Timisoara", label: "Timișoara", x: 6, y: 66, h: 329 },
    { id: "Lugoj", label: "Lugoj", x: 22, y: 80, h: 244 },
    { id: "Mehadia", label: "Mehadia", x: 34, y: 90, h: 241 },
    { id: "Drobeta", label: "Drobeta", x: 46, y: 94, h: 242 },
    { id: "Sibiu", label: "Sibiu", x: 36, y: 46, h: 253 },
    { id: "RVilcea", label: "R. Vâlcea", x: 54, y: 62, h: 193 },
    { id: "Craiova", label: "Craiova", x: 56, y: 88, h: 160 },
    { id: "Fagaras", label: "Făgăraș", x: 58, y: 34, h: 176 },
    { id: "Pitesti", label: "Pitești", x: 72, y: 66, h: 100 },
    { id: "Bucharest", label: "Bucharest", x: 90, y: 58, h: 0 },
    { id: "Giurgiu", label: "Giurgiu", x: 86, y: 84, h: 77 },
  ],
  edges: [
    { id: "e1", a: "Arad", b: "Zerind", w: 75 },
    { id: "e2", a: "Zerind", b: "Oradea", w: 71 },
    { id: "e3", a: "Oradea", b: "Sibiu", w: 151 },
    { id: "e4", a: "Arad", b: "Timisoara", w: 118 },
    { id: "e5", a: "Arad", b: "Sibiu", w: 140 },
    { id: "e6", a: "Timisoara", b: "Lugoj", w: 111 },
    { id: "e7", a: "Lugoj", b: "Mehadia", w: 70 },
    { id: "e8", a: "Mehadia", b: "Drobeta", w: 75 },
    { id: "e9", a: "Drobeta", b: "Craiova", w: 120 },
    { id: "e10", a: "Sibiu", b: "Fagaras", w: 99 },
    { id: "e11", a: "Sibiu", b: "RVilcea", w: 80 },
    { id: "e12", a: "RVilcea", b: "Pitesti", w: 97 },
    { id: "e13", a: "RVilcea", b: "Craiova", w: 146 },
    { id: "e14", a: "Craiova", b: "Pitesti", w: 138 },
    { id: "e15", a: "Fagaras", b: "Bucharest", w: 211 },
    { id: "e16", a: "Pitesti", b: "Bucharest", w: 101 },
    { id: "e17", a: "Bucharest", b: "Giurgiu", w: 90 },
  ],
};

/** A 5×5 city grid — BFS's ring expansion, one step per edge, Manhattan h. */
function gridGraph(): SGraph {
  const nodes: SNode[] = [];
  const edges: SEdge[] = [];
  const id = (r: number, c: number) => `n${r}${c}`;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      nodes.push({
        id: id(r, c),
        label: `${String.fromCharCode(65 + c)}${r + 1}`,
        x: 8 + c * 21,
        y: 8 + r * 21,
        h: (4 - c) + (4 - r),
      });
    }
  }
  let e = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (c < 4) edges.push({ id: `g${e++}`, a: id(r, c), b: id(r, c + 1), w: 1 });
      if (r < 4) edges.push({ id: `g${e++}`, a: id(r, c), b: id(r + 1, c), w: 1 });
    }
  }
  return { nodes, edges, start: id(0, 0), goal: id(4, 4) };
}

/** The weighted trap: a cheap-looking direct edge that is not optimal, and a
 *  heuristic that tempts greedy search the wrong way. */
const TRAP: SGraph = {
  start: "S",
  goal: "G",
  nodes: [
    { id: "S", label: "S", x: 8, y: 50, h: 8 },
    { id: "A", label: "A", x: 30, y: 22, h: 6 },
    { id: "B", label: "B", x: 30, y: 50, h: 6 }, // the seduction: low h, dead-end-ish
    { id: "C", label: "C", x: 30, y: 78, h: 7 },
    { id: "D", label: "D", x: 54, y: 22, h: 4 },
    { id: "E", label: "E", x: 54, y: 78, h: 4 },
    { id: "F", label: "F", x: 74, y: 50, h: 2 },
    { id: "G", label: "G", x: 92, y: 50, h: 0 },
  ],
  edges: [
    { id: "t1", a: "S", b: "A", w: 2 },
    { id: "t2", a: "S", b: "B", w: 3 }, // greedy loves B (h=6, cheap edge)
    { id: "t3", a: "S", b: "C", w: 5 },
    { id: "t4", a: "A", b: "D", w: 8 },
    { id: "t5", a: "B", b: "F", w: 14 }, // through B is a long road
    { id: "t6", a: "C", b: "E", w: 3 },
    { id: "t7", a: "D", b: "F", w: 3 },
    { id: "t8", a: "E", b: "F", w: 6 },
    { id: "t9", a: "F", b: "G", w: 2 },
  ],
};

export const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: "romania",
    name: "Romania (Arad → Bucharest)",
    blurb: "The classic AIMA map with real road costs and the canonical straight-line distances to Bucharest.",
    graph: ROMANIA,
  },
  {
    id: "grid",
    name: "5×5 city grid",
    blurb: "Unit-cost grid — watch BFS expand in rings, DFS dive along one arm, and A* aim for the diagonal.",
    graph: gridGraph(),
  },
  {
    id: "trap",
    name: "The weighted trap",
    blurb: "A small graph engineered so greedy best-first follows the cheap-looking middle road — and pays for it.",
    graph: TRAP,
  },
  {
    id: "blank",
    name: "Your own graph",
    blurb: "Start from three nodes: add nodes, connect them, set weights, pick start and goal — then run any algorithm on your own map.",
    graph: {
      start: "A",
      goal: "C",
      nodes: [
        { id: "A", label: "A", x: 15, y: 50 },
        { id: "B", label: "B", x: 50, y: 25 },
        { id: "C", label: "C", x: 85, y: 50 },
      ],
      edges: [
        { id: "u1", a: "A", b: "B", w: 4 },
        { id: "u2", a: "B", b: "C", w: 4 },
      ],
    },
  },
];

export function cloneGraph(g: SGraph): SGraph {
  return {
    start: g.start,
    goal: g.goal,
    nodes: g.nodes.map((n) => ({ ...n })),
    edges: g.edges.map((e) => ({ ...e })),
  };
}
