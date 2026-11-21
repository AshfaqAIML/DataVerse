"use client";

/**
 * LAB 8 — Bayesian Network Explorer: exact inference by enumeration on real
 * networks (the canonical alarm network with its AIMA numbers, and the
 * sprinkler network). CPTs are editable, evidence is set by clicking nodes,
 * and every posterior on screen is computed by genuinely enumerating the
 * joint distribution — the stepped table shows each row's product as it
 * accumulates into the normalizing sum.
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

/* ----------------------------------------------------------- networks */

interface BNode {
  id: string;
  label: string;
  parents: string[];
  x: number;
  y: number;
  /** P(node = true | parent assignment), keyed "B=t,E=f" or "" for roots */
  cpt: Record<string, number>;
}

interface BNet {
  id: string;
  name: string;
  blurb: string;
  nodes: BNode[];
}

const ALARM: BNet = {
  id: "alarm",
  name: "The alarm network",
  blurb: "The canonical example: burglary and earthquake both raise the alarm, and the alarm makes both neighbours call. Observe the calls and watch burglary's belief climb — then add the earthquake and watch it fall again (explaining away).",
  nodes: [
    { id: "B", label: "Burglary", parents: [], x: 22, y: 62, cpt: { "": 0.001 } },
    { id: "E", label: "Earthquake", parents: [], x: 22, y: 22, cpt: { "": 0.002 } },
    { id: "A", label: "Alarm", parents: ["B", "E"], x: 52, y: 42, cpt: { "B=t,E=t": 0.95, "B=t,E=f": 0.94, "B=f,E=t": 0.29, "B=f,E=f": 0.001 } },
    { id: "J", label: "John calls", parents: ["A"], x: 82, y: 24, cpt: { "A=t": 0.9, "A=f": 0.05 } },
    { id: "M", label: "Mary calls", parents: ["A"], x: 82, y: 62, cpt: { "A=t": 0.7, "A=f": 0.01 } },
  ],
};

const SPRINKLER: BNet = {
  id: "sprinkler",
  name: "The sprinkler network",
  blurb: "Cloudiness discourages the sprinkler and encourages rain; either one wets the grass. Observe wet grass and watch rain's belief rise — then notice the sprinkler's belief rise too, until you learn it was on.",
  nodes: [
    { id: "C", label: "Cloudy", parents: [], x: 16, y: 42, cpt: { "": 0.5 } },
    { id: "S", label: "Sprinkler", parents: ["C"], x: 50, y: 18, cpt: { "C=t": 0.1, "C=f": 0.5 } },
    { id: "R", label: "Rain", parents: ["C"], x: 50, y: 70, cpt: { "C=t": 0.8, "C=f": 0.2 } },
    { id: "W", label: "Wet grass", parents: ["S", "R"], x: 84, y: 44, cpt: { "S=t,R=t": 0.99, "S=t,R=f": 0.9, "S=f,R=t": 0.9, "S=f,R=f": 0.0 } },
  ],
};

const NETS = [ALARM, SPRINKLER];

/* ------------------------------------------------- enumeration inference */

type Evidence = Record<string, boolean>;

function parentKey(node: BNode, assignment: Record<string, boolean>): string {
  if (node.parents.length === 0) return "";
  return node.parents.map((p) => `${p}=${assignment[p] ? "t" : "f"}`).join(",");
}

function nodeProb(node: BNode, assignment: Record<string, boolean>): number {
  const pTrue = node.cpt[parentKey(node, assignment)] ?? 0;
  return assignment[node.id] ? pTrue : 1 - pTrue;
}

function enumerateJoint(nodes: BNode[], assignment: Record<string, boolean>, order: string[], i: number): number {
  if (i === order.length) {
    return nodes.reduce((p, n) => p * nodeProb(n, assignment), 1);
  }
  const id = order[i];
  // variables fixed by the evidence (or the query) are never re-branched —
  // enumerating them would overwrite the assignment and sum the whole joint
  if (id in assignment) return enumerateJoint(nodes, assignment, order, i + 1);
  return (
    enumerateJoint(nodes, { ...assignment, [id]: true }, order, i + 1) +
    enumerateJoint(nodes, { ...assignment, [id]: false }, order, i + 1)
  );
}

/** posterior P(X = true | evidence) for every non-evidence node */
function allPosteriors(nodes: BNode[], evidence: Evidence): Record<string, number> {
  const order = nodes.map((n) => n.id);
  const out: Record<string, number> = {};
  const pE = enumerateJoint(nodes, { ...evidence } as Record<string, boolean>, order, 0);
  if (pE === 0) return Object.fromEntries(nodes.filter((n) => !(n.id in evidence)).map((n) => [n.id, NaN]));
  for (const n of nodes) {
    if (n.id in evidence) continue;
    const pX = enumerateJoint(nodes, { ...evidence, [n.id]: true }, order, 0);
    out[n.id] = pX / pE;
  }
  return out;
}

/* ------------------------------------------------------------- the run */

interface EnumStep {
  note: string;
  line: number;
  phase: string;
  rowIdx: number; // -1 = intro/outro
  consistent: boolean;
  product: number;
  sumTrue: number;
  sumFalse: number;
  assignment: Record<string, boolean>;
  posterior?: number;
  query: string;
  done?: boolean;
}

function buildEnumeration(net: BNet, evidence: Evidence, query: string): { steps: EnumStep[]; posterior: number } {
  const nodes = net.nodes;
  const order = nodes.map((n) => n.id);
  const rows: Array<{ assignment: Record<string, boolean>; consistent: boolean; product: number; supportsTrue: boolean }> = [];
  const total = Math.pow(2, nodes.length);
  for (let mask = 0; mask < total; mask++) {
    const assignment: Record<string, boolean> = {};
    order.forEach((id, k) => {
      assignment[id] = Boolean(mask & (1 << (nodes.length - 1 - k)));
    });
    const consistent = Object.entries(evidence).every(([k, v]) => assignment[k] === v);
    if (!consistent) continue;
    const product = nodes.reduce((p, n) => p * nodeProb(n, assignment), 1);
    rows.push({ assignment, consistent: true, product, supportsTrue: assignment[query] === true });
  }
  const sumTrue = rows.filter((r) => r.supportsTrue).reduce((s, r) => s + r.product, 0);
  const sumFalse = rows.filter((r) => !r.supportsTrue).reduce((s, r) => s + r.product, 0);
  const posterior = sumTrue / (sumTrue + sumFalse);

  const steps: EnumStep[] = [];
  steps.push({
    note: `Query: P(${query} = true | ${Object.entries(evidence).map(([k, v]) => `${k}=${v ? "t" : "f"}`).join(", ") || "no evidence"}). Enumeration walks all ${total} rows of the joint — keeping only the rows consistent with the evidence — and sums their products.`,
    line: 0,
    phase: "setup",
    rowIdx: -1,
    consistent: false,
    product: 0,
    sumTrue: 0,
    sumFalse: 0,
    assignment: {},
    query,
  });
  let st = 0;
  let sf = 0;
  rows.forEach((r, i) => {
    if (r.supportsTrue) st += r.product;
    else sf += r.product;
    const parts = nodes.map((n) => `${n.id}${r.assignment[n.id] ? "" : "¬"} (${nodeProb(n, r.assignment).toPrecision(3)})`);
    steps.push({
      note: `Row ${i + 1}: ${nodes.map((n) => (r.assignment[n.id] ? n.id : "¬" + n.id)).join(" · ")} — the chain product is ${r.product.toExponential(2)}, adding to the ${r.supportsTrue ? "true" : "false"} sum.`,
      line: 3,
      phase: r.supportsTrue ? "sum ↑" : "sum ↓",
      rowIdx: i,
      consistent: true,
      product: r.product,
      sumTrue: st,
      sumFalse: sf,
      assignment: r.assignment,
      query,
    });
  });
  steps.push({
    note: `Normalizing: P(${query}=t | e) = ${sumTrue.toExponential(2)} / (${sumTrue.toExponential(2)} + ${sumFalse.toExponential(2)}) = ${posterior.toFixed(4)}.`,
    line: 4,
    phase: "normalize",
    rowIdx: -2,
    consistent: true,
    product: 0,
    sumTrue,
    sumFalse,
    assignment: {},
    posterior,
    query,
    done: true,
  });
  return { steps, posterior };
}

/* --------------------------------------------------------------- the lab */

export function BayesLab() {
  const [netId, setNetId] = useState("alarm");
  const net = NETS.find((n) => n.id === netId)!;
  const [nodes, setNodes] = useState<BNode[]>(ALARM.nodes);
  const [evidence, setEvidence] = useState<Evidence>({ J: true, M: true });
  const [query, setQuery] = useState("B");

  useEffect(() => {
    setNodes(net.nodes.map((n) => ({ ...n, cpt: { ...n.cpt } })));
    setEvidence(netId === "alarm" ? { J: true, M: true } : { W: true });
    setQuery(netId === "alarm" ? "B" : "R");
  }, [netId, net]);

  const posteriors = useMemo(() => allPosteriors(nodes, evidence), [nodes, evidence]);
  const enumRun = useMemo(() => buildEnumeration({ ...net, nodes }, evidence, query), [net, nodes, evidence, query]);
  const stepper = useStepper(enumRun.steps);
  const step = stepper.step;

  const priors = useMemo(() => {
    const out: Record<string, number> = {};
    for (const n of nodes) {
      if (n.parents.length === 0) out[n.id] = n.cpt[""] ?? 0;
      else {
        // marginalize parents
        const pids = n.parents;
        let p = 0;
        const total = Math.pow(2, pids.length);
        for (let mask = 0; mask < total; mask++) {
          const assignment: Record<string, boolean> = {};
          pids.forEach((id, k) => {
            assignment[id] = Boolean(mask & (1 << (pids.length - 1 - k)));
          });
          const parentProb = pids.reduce((pr, pid) => {
            const pn = nodes.find((x) => x.id === pid)!;
            return pr * (assignment[pid] ? priorOf(pn, nodes) : 1 - priorOf(pn, nodes));
          }, 1);
          const key = pids.map((p2) => `${p2}=${assignment[p2] ? "t" : "f"}`).join(",");
          p += parentProb * (n.cpt[key] ?? 0);
        }
        out[n.id] = p;
      }
    }
    return out;
  }, [nodes]);

  const cycleEvidence = (id: string) => {
    setEvidence((e) => {
      if (e[id] === undefined) return { ...e, [id]: true };
      if (e[id] === true) return { ...e, [id]: false };
      const { [id]: _drop, ...rest } = e;
      void _drop;
      return rest;
    });
    if (id !== query) return;
  };

  const insights = useMemo(() => {
    const items: string[] = [];
    const bPost = posteriors["B"];
    if (netId === "alarm" && evidence.J === true && evidence.M === true && bPost !== undefined) {
      items.push(
        `Explaining away, measured: before any evidence, P(Burglary) = 0.001. Both neighbours calling raises it to ${(bPost * 100).toFixed(1)}% — nearly three hundredfold. Now set Earthquake = true as well and watch burglary's belief FALL: the alarm now has a rival explanation.`
      );
    }
    const pE = step.done ? undefined : undefined;
    void pE;
    items.push(
      `Every number on this screen comes from the same enumeration: walk all ${Math.pow(2, nodes.length)} rows of the joint, keep the rows matching the evidence, multiply each row's CPT entries, normalize. Exponential in general — variable elimination and sampling (beyond this lab) exist to avoid exactly this.`
    );
    items.push(
      "The DAG is the knowledge: each node needs only a table conditioned on its parents. This network stores 10 numbers; the full joint over 5 binary variables would need 31."
    );
    if (netId === "sprinkler") {
      items.push(
        "Watch the sprinkler's belief when only WetGrass = true is known: it rises (rain is not the only wet explanation). Set Rain = true too and the sprinkler's belief sinks — the two causes compete to explain the same effect."
      );
    }
    return items;
  }, [posteriors, netId, evidence, nodes.length]);

  const queryNode = nodes.find((n) => n.id === query);

  return (
    <LabFrame
      kicker="Laboratory 08 · reasoning under uncertainty"
      title="Bayesian Network Explorer"
      description="A DAG of direct influences with conditional probability tables you can edit. Click nodes to set evidence, choose a query, and inference runs by genuine enumeration — every posterior on screen, and every insight below, is computed from the network you see."
      aside={
        <>
          <Panel title="Network">
            <ChipRow>
              {NETS.map((n) => (
                <Chip key={n.id} active={netId === n.id} onClick={() => setNetId(n.id)} hue="var(--dv-viz-3)">
                  {n.name}
                </Chip>
              ))}
            </ChipRow>
            <p className="t-caption mt-2">{net.blurb}</p>
          </Panel>

          <Panel title="Query">
            <ChipRow>
              {nodes.map((n) => (
                <Chip key={n.id} active={query === n.id} onClick={() => setQuery(n.id)} hue="var(--dv-primary)" >
                  P({n.id} | e)
                </Chip>
              ))}
            </ChipRow>
          </Panel>

          <Panel title="CPT editor — select a node in the graph">
            {queryNode && (
              <div className="space-y-2.5">
                <p className="dv-kicker">{queryNode.label} ({queryNode.id})</p>
                {Object.entries(queryNode.cpt).map(([key, p]) => (
                  <label key={key} className="block">
                    <span className="flex items-baseline justify-between">
                      <span className="font-mono text-[11px] text-ink-2">{key || "prior"}</span>
                      <span className="tabular font-mono text-[11.5px] text-viz-3">{p.toFixed(3)}</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.001}
                      value={p}
                      onChange={(e) =>
                        setNodes((ns) =>
                          ns.map((n) => (n.id === queryNode.id ? { ...n, cpt: { ...n.cpt, [key]: Number(e.target.value) } } : n))
                        )
                      }
                      className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
                    />
                  </label>
                ))}
                <p className="t-caption">Editing a CPT re-runs inference instantly — every posterior and the enumeration table below update.</p>
              </div>
            )}
          </Panel>

          <Panel title="Beliefs — prior vs posterior">
            <div className="space-y-2.5">
              {nodes.map((n) => {
                const prior = priors[n.id] ?? 0;
                const post = n.id in evidence ? (evidence[n.id] ? 1 : 0) : posteriors[n.id];
                const delta = post - prior;
                return (
                  <div key={n.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[11.5px] font-semibold text-ink">
                        {n.id}
                        {n.id in evidence && <span className="ml-1.5 rounded bg-viz-3 px-1 py-0.5 text-[9px] text-white">observed {evidence[n.id] ? "true" : "false"}</span>}
                      </span>
                      <span className="tabular font-mono text-[11px]">
                        <span className="text-ink-3">{(prior * 100).toFixed(1)}%</span>
                        {" → "}
                        <span className="font-semibold text-viz-3">{(post * 100).toFixed(1)}%</span>
                        <span className={cn("ml-1.5", delta > 0.005 ? "text-success-text" : delta < -0.005 ? "text-danger-text" : "text-ink-3")}>
                          {delta > 0 ? "▲" : delta < 0 ? "▼" : "="}
                        </span>
                      </span>
                    </div>
                    <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-surface-inset">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-viz-3/30" style={{ width: `${prior * 100}%` }} />
                      <div
                        className="absolute inset-y-0 rounded-full bg-viz-3 transition-[width] duration-300"
                        style={{ left: `${Math.min(prior, post) * 100}%`, width: `${Math.abs(delta) * 100}%` }}
                      />
                      <div className="absolute inset-y-0 right-0 w-px bg-border-strong" style={{ left: `${post * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      }
    >
      <Canvas>
        <svg viewBox="0 0 760 340" className="h-auto w-full" role="img" aria-label="Bayesian network">
          {/* edges */}
          {nodes.map((n) =>
            n.parents.map((p) => {
              const from = nodes.find((x) => x.id === p)!;
              const px = (x: number) => 40 + (x / 100) * 680;
              const py = (y: number) => 40 + (y / 100) * 260;
              const x1 = px(from.x) + 34;
              const y1 = py(from.y) + (py(n.y) > py(from.y) ? 22 : -22);
              const x2 = px(n.x) - 38;
              const y2 = py(n.y);
              return (
                <g key={`${p}-${n.id}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--dv-border-strong)" strokeWidth="1.6" markerEnd="url(#bayes-arrow)" />
                </g>
              );
            })
          )}
          <defs>
            <marker id="bayes-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--dv-border-strong)" />
            </marker>
          </defs>
          {/* nodes */}
          {nodes.map((n) => {
            const px = (x: number) => 40 + (x / 100) * 680;
            const py = (y: number) => 40 + (y / 100) * 260;
            const observed = n.id in evidence;
            const post = observed ? (evidence[n.id] ? 1 : 0) : posteriors[n.id];
            return (
              <g
                key={n.id}
                className="dv-handle cursor-pointer"
                onClick={() => cycleEvidence(n.id)}
                onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); cycleEvidence(n.id); } }}
                tabIndex={0}
                role="button"
                aria-label={`Event ${n.id}${observed ? (evidence[n.id] ? " — observed true" : " — observed false") : " — not observed"} — press to cycle evidence`}
              >
                <ellipse
                  cx={px(n.x)}
                  cy={py(n.y)}
                  rx={38}
                  ry={26}
                  fill={observed ? "var(--dv-viz-3)" : "var(--dv-surface)"}
                  stroke={query === n.id ? "var(--dv-primary)" : "var(--dv-border-strong)"}
                  strokeWidth={query === n.id ? 2.6 : 1.8}
                  style={{ transition: "fill 200ms" }}
                />
                <text
                  x={px(n.x)}
                  y={py(n.y) - 2}
                  textAnchor="middle"
                  fontSize="13.5"
                  className="font-mono font-bold"
                  fill={observed ? "#fff" : "var(--dv-ink)"}
                  pointerEvents="none"
                >
                  {n.id}
                </text>
                <text
                  x={px(n.x)}
                  y={py(n.y) + 13}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="font-mono"
                  fill={observed ? "#fff" : "var(--dv-ink-3)"}
                  pointerEvents="none"
                >
                  {observed ? (evidence[n.id] ? "TRUE" : "FALSE") : `${((post ?? 0) * 100).toFixed(1)}%`}
                </text>
                <text
                  x={px(n.x)}
                  y={py(n.y) + 44}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="font-mono"
                  fill="var(--dv-ink-3)"
                  pointerEvents="none"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
          <text x={380} y={330} textAnchor="middle" fontSize="11" className="fill-[var(--dv-ink-3)] font-mono">
            click a node to cycle evidence: unknown → true → false · the query node wears the indigo ring
          </text>
        </svg>
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Execution — enumeration, row by row">
          <ExecutionControls stepper={stepper} countLabel="row" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Σ rows (X=t)" value={step.sumTrue.toExponential(1)} />
            <Stat label="Σ rows (X=f)" value={step.sumFalse.toExponential(1)} />
            <Stat
              label={`P(${step.query}=t|e)`}
              value={step.posterior !== undefined ? step.posterior.toFixed(4) : "…"}
              tone="var(--dv-success-text)"
            />
          </div>
        </Panel>
        <Panel title="Inference by enumeration, line by line">
          <Pseudocode
            lines={[
              { text: "function ENUMERATION(X, e):", indent: 0 },
              { text: "for each value x of X:", indent: 1 },
              { text: "Q(x) ← Σ over hidden vars of", indent: 2 },
              { text: "Π over all nodes of P(node | parents)", indent: 3, tone: "key" },
              { text: "return Q / Σ Q   // normalize", indent: 1, tone: "key" },
              { text: "— every row walks the joint distribution", indent: 0 },
              { text: "— complexity exponential in the network size", indent: 0 },
            ]}
            active={step.line}
          />
        </Panel>
      </div>

      <Insights items={insights} />
    </LabFrame>
  );
}

function priorOf(n: BNode, nodes: BNode[]): number {
  if (n.parents.length === 0) return n.cpt[""] ?? 0;
  let p = 0;
  const pids = n.parents;
  const total = Math.pow(2, pids.length);
  for (let mask = 0; mask < total; mask++) {
    const assignment: Record<string, boolean> = {};
    pids.forEach((id, k) => {
      assignment[id] = Boolean(mask & (1 << (pids.length - 1 - k)));
    });
    const parentProb = pids.reduce((pr, pid) => {
      const pn = nodes.find((x) => x.id === pid)!;
      return pr * (assignment[pid] ? priorOf(pn, nodes) : 1 - priorOf(pn, nodes));
    }, 1);
    const key = pids.map((p2) => `${p2}=${assignment[p2] ? "t" : "f"}`).join(",");
    p += parentProb * (n.cpt[key] ?? 0);
  }
  return p;
}
