"use client";

/**
 * The Classical AI textbook's diagram renderers — nine specialized SVG
 * components, all sharing the platform's design tokens:
 *
 *   SearchTreeViz      — search trees (frontier / expanded / goal / pruned)
 *   GraphViz           — positioned labeled graphs (state spaces,
 *                        knowledge graphs)
 *   ConstraintGraphViz — CSP networks with live domains
 *   DecisionTreeViz    — attribute tests with class leaves
 *   GameTreeViz        — minimax trees with alpha-beta windows and cuts
 *   InferenceChainViz  — forward/backward rule-chaining flows
 *   BayesNetViz        — DAGs of direct influence with CPT tables
 *   PlanningGraphViz   — Graphplan's alternating levels with mutex arcs
 *
 * Layout is deterministic: authors supply coordinates on a 0–100 grid
 * (graphs) or the renderer computes positions from the tree structure.
 */
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  BayesNetBlock,
  ConstraintGraphBlock,
  DecisionNode,
  DecisionTreeBlock,
  GameNode,
  GameTreeBlock,
  GraphSpec,
  InferenceChainBlock,
  PlanLevel,
  PlanningGraphBlock,
  SearchTreeNode,
  SearchTreeBlock,
} from "@/lib/classicalai/types";

/* ------------------------------------------------------------ shared bits */

const TONE_FILL: Record<string, string> = {
  default: "var(--dv-surface)",
  start: "var(--dv-viz-3)",
  goal: "var(--dv-success-text)",
  highlight: "var(--dv-viz-3)",
  muted: "var(--dv-surface-inset)",
  danger: "var(--dv-danger-border)",
};

const TONE_TEXT: Record<string, string> = {
  default: "var(--dv-ink)",
  start: "#ffffff",
  goal: "#ffffff",
  highlight: "#ffffff",
  muted: "var(--dv-ink-3)",
  danger: "#ffffff",
};

function DiagramFrame({
  title,
  caption,
  children,
  meta,
}: {
  title?: string;
  caption?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="dv-diagram overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
      {title && (
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-subtle/50 px-4 py-2.5">
          <span className="text-[12px] font-semibold tracking-wide text-ink">{title}</span>
          {meta}
        </figcaption>
      )}
      <div className="overflow-x-auto px-3 py-4 sm:px-4">{children}</div>
      {caption && (
        <p className="border-t border-border-subtle px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-3">
          {caption}
        </p>
      )}
    </figure>
  );
}

function Swatch({ color, dashed, label }: { color: string; dashed?: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      {dashed ? (
        <svg width="22" height="6" aria-hidden="true">
          <line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="1.6" strokeDasharray="4 4" />
        </svg>
      ) : (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}

function Legend({ entries }: { entries: Array<[string, string]> }) {
  const COLOR: Record<string, string> = {
    start: "var(--dv-viz-3)",
    goal: "var(--dv-success-text)",
    edge: "var(--dv-border-strong)",
    expanded: "var(--dv-ink-3)",
    frontier: "var(--dv-viz-3)",
    pruned: "var(--dv-danger-border)",
    muted: "var(--dv-ink-3)",
    mutex: "var(--dv-danger-border)",
    path: "var(--dv-viz-3)",
    highlight: "var(--dv-viz-3)",
    assigned: "var(--dv-success-text)",
    current: "var(--dv-viz-3)",
    wiped: "var(--dv-danger-border)",
  };
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-3">
      {entries.map(([k, label]) => (
        <Swatch key={k} color={COLOR[k] ?? "var(--dv-ink-3)"} dashed={k === "mutex"} label={label} />
      ))}
    </div>
  );
}

/** Approximate rendered width of a short label (px at the given size). */
function textW(s: string, size = 11) {
  return s.length * size * 0.62 + 8;
}

/* ------------------------------------------------------------- 5 · search tree */

const NODE_STATUS_STROKE: Record<string, string> = {
  root: "var(--dv-viz-3)",
  frontier: "var(--dv-viz-3)",
  expanded: "var(--dv-ink-3)",
  goal: "var(--dv-success-text)",
  pruned: "var(--dv-danger-border)",
  muted: "var(--dv-border-strong)",
};

const NODE_STATUS_FILL: Record<string, string> = {
  root: "color-mix(in srgb, var(--dv-viz-3) 14%, var(--dv-surface))",
  frontier: "var(--dv-surface)",
  expanded: "color-mix(in srgb, var(--dv-ink-3) 10%, var(--dv-surface))",
  goal: "color-mix(in srgb, var(--dv-success-text) 18%, var(--dv-surface))",
  pruned: "color-mix(in srgb, var(--dv-danger-border) 10%, var(--dv-surface))",
  muted: "var(--dv-surface-inset)",
};

interface LaidNode {
  x: number;
  y: number;
  node: SearchTreeNode;
  parent?: LaidNode;
  depth: number;
}

/** In-order leaf-count layout — deterministic, no measurement needed. */
function layoutTree(root: SearchTreeNode): { nodes: LaidNode[]; width: number; height: number } {
  const nodes: LaidNode[] = [];
  let leafX = 0;
  const H_GAP = 58;
  const V_GAP = 74;
  let maxDepth = 0;

  const walk = (node: SearchTreeNode, depth: number, parent?: LaidNode): LaidNode => {
    maxDepth = Math.max(maxDepth, depth);
    const me: LaidNode = { x: 0, y: 0, node, parent, depth };
    const kids = node.children ?? [];
    if (kids.length === 0) {
      me.x = leafX * H_GAP + H_GAP / 2;
      leafX += 1;
    } else {
      const laidKids = kids.map((k) => walk(k, depth + 1, me));
      me.x = (laidKids[0].x + laidKids[laidKids.length - 1].x) / 2;
    }
    me.y = depth * V_GAP + 30;
    nodes.push(me);
    return me;
  };

  walk(root, 0);
  return {
    nodes,
    width: Math.max(leafX * H_GAP, 120),
    height: (maxDepth + 1) * V_GAP + 14,
  };
}

function nodeBadges(n: SearchTreeNode): string {
  const parts: string[] = [];
  if (n.cost !== undefined) parts.push(`g=${n.cost}`);
  if (n.heuristic !== undefined) parts.push(`h=${n.heuristic}`);
  if (n.cost !== undefined && n.heuristic !== undefined) parts.push(`f=${n.cost + n.heuristic}`);
  return parts.join(" · ");
}

export function SearchTreeViz({ block }: { block: SearchTreeBlock }) {
  const { nodes, width, height } = useMemo(() => layoutTree(block.root), [block.root]);
  return (
    <DiagramFrame
      title={block.title}
      caption={block.caption}
      meta={
        <span className="font-mono text-[11px] text-ink-3">
          {block.legend ?? "g = cost so far · h = estimate to go"}
        </span>
      }
    >
      <svg viewBox={`0 0 ${Math.max(width, 240)} ${height}`} className="h-auto w-full min-w-[420px]" role="img" aria-label={block.title}>
        {nodes.map(({ node, parent, x, y }, i) =>
          parent ? (
            <g key={`e${i}`}>
              <line
                x1={parent.x}
                y1={parent.y + 13}
                x2={x}
                y2={y - 15}
                stroke={node.status === "pruned" ? "var(--dv-danger-border)" : "var(--dv-border-strong)"}
                strokeWidth={1.5}
                strokeDasharray={node.status === "pruned" ? "4 4" : undefined}
              />
              {node.edge && (
                <text
                  x={(parent.x + x) / 2 + (x - parent.x) * 0.04}
                  y={(parent.y + y) / 2 - 3}
                  textAnchor="middle"
                  className="fill-[var(--dv-ink-3)] font-mono"
                  fontSize="9.5"
                >
                  {node.edge}
                </text>
              )}
            </g>
          ) : null
        )}
        {nodes.map(({ node, x, y }, i) => {
          const st = node.status ?? "default";
          return (
            <g key={`n${i}`}>
              <rect
                x={x - 27}
                y={y - 15}
                width={54}
                height={30}
                rx={7}
                fill={NODE_STATUS_FILL[st] ?? "var(--dv-surface)"}
                stroke={NODE_STATUS_STROKE[st] ?? "var(--dv-border-strong)"}
                strokeWidth={st === "goal" || st === "root" || st === "frontier" ? 2 : 1.4}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="600" className="fill-[var(--dv-ink)]">
                {node.label}
              </text>
              {nodeBadges(node) && (
                <text x={x} y={y + 27} textAnchor="middle" fontSize="9.5" className="fill-[var(--dv-ink-3)] font-mono">
                  {nodeBadges(node)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

/* ----------------------------------------------- 6 & 10 · positioned graphs */

export function GraphViz({
  spec,
  title,
  caption,
  accentNote,
}: {
  spec: GraphSpec;
  title: string;
  caption?: string;
  accentNote?: string;
}) {
  const W = 640;
  const H = 400;
  const px = (x: number) => 34 + (x / 100) * (W - 68);
  const py = (y: number) => 26 + (y / 100) * (H - 60);
  return (
    <DiagramFrame
      title={title}
      caption={caption}
      meta={spec.legend ? <Legend entries={spec.legend} /> : undefined}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label={title}>
        <defs>
          <marker id="g-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 1.2 L8.5 5 L0 8.8 z" fill="var(--dv-border-strong)" />
          </marker>
          <marker id="g-arrow-hi" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 1.2 L8.5 5 L0 8.8 z" fill="var(--dv-viz-3)" />
          </marker>
        </defs>
        {spec.edges.map((e, i) => {
          const a = spec.nodes.find((n) => n.id === e.from);
          const b = spec.nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const x1 = px(a.x);
          const y1 = py(a.y);
          const x2 = px(b.x);
          const y2 = py(b.y);
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const trim = 26;
          const sx = x1 + (dx / len) * trim;
          const sy = y1 + (dy / len) * trim;
          const ex = x2 - (dx / len) * trim;
          const ey = y2 - (dy / len) * trim;
          return (
            <g key={i}>
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={e.highlighted ? "var(--dv-viz-3)" : "var(--dv-border-strong)"}
                strokeWidth={e.highlighted ? 2.4 : 1.6}
                strokeDasharray={e.dashed ? "5 5" : undefined}
                markerEnd={e.directed === false ? undefined : `url(#${e.highlighted ? "g-arrow-hi" : "g-arrow"})`}
              />
            </g>
          );
        })}
        {spec.nodes.map((n) => {
          const w = Math.max(textW(n.label, 11) + 16, 44);
          const tone = n.tone ?? "default";
          return (
            <g key={n.id}>
              <rect
                x={px(n.x) - w / 2}
                y={py(n.y) - 15}
                width={w}
                height={n.sub ? 34 : 30}
                rx={8}
                fill={tone === "start" || tone === "goal" || tone === "highlight" ? TONE_FILL[tone] : "var(--dv-surface)"}
                stroke={tone === "muted" ? "var(--dv-border-strong)" : tone === "default" ? "var(--dv-border-strong)" : "transparent"}
                strokeWidth={1.5}
                opacity={tone === "muted" ? 0.75 : 1}
              />
              <text
                x={px(n.x)}
                y={py(n.y) + (n.sub ? 0 : 4)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={tone === "start" || tone === "goal" || tone === "highlight" ? "#fff" : "var(--dv-ink)"}
              >
                {n.label}
              </text>
              {n.sub && (
                <text
                  x={px(n.x)}
                  y={py(n.y) + 12}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={tone === "start" || tone === "goal" || tone === "highlight" ? "rgba(255,255,255,0.85)" : "var(--dv-ink-3)"}
                >
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
        {/* edge labels LAST — above node boxes, haloed for legibility */}
        {spec.edges.map((e, i) => {
          const a = spec.nodes.find((n) => n.id === e.from);
          const b = spec.nodes.find((n) => n.id === e.to);
          if (!a || !b || !e.label) return null;
          const x1 = px(a.x), y1 = py(a.y), x2 = px(b.x), y2 = py(b.y);
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const lx = (x1 + x2) / 2 + (dy / len) * 11;
          const ly = (y1 + y2) / 2 - (dx / len) * 11 + 3;
          return (
            <text
              key={`l${i}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              fontSize="9.5"
              className="fill-[var(--dv-ink-2)] font-mono"
              stroke="var(--dv-surface)"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {e.label}
            </text>
          );
        })}
      </svg>
      {accentNote && <p className="mt-2 text-[12.5px] text-ink-3">{accentNote}</p>}
    </DiagramFrame>
  );
}

/* --------------------------------------------------------- 11 · CSP network */

const CSP_TONE: Record<string, { stroke: string; fill: string; badge: string }> = {
  default: { stroke: "var(--dv-border-strong)", fill: "var(--dv-surface)", badge: "" },
  assigned: { stroke: "var(--dv-success-text)", fill: "color-mix(in srgb, var(--dv-success-text) 10%, var(--dv-surface))", badge: "assigned" },
  current: { stroke: "var(--dv-viz-3)", fill: "color-mix(in srgb, var(--dv-viz-3) 14%, var(--dv-surface))", badge: "current" },
  wiped: { stroke: "var(--dv-danger-border)", fill: "color-mix(in srgb, var(--dv-danger-border) 10%, var(--dv-surface))", badge: "wiped out" },
  highlight: { stroke: "var(--dv-viz-3)", fill: "color-mix(in srgb, var(--dv-viz-3) 8%, var(--dv-surface))", badge: "" },
};

export function ConstraintGraphViz({ block }: { block: ConstraintGraphBlock }) {
  const W = 640;
  const H = 420;
  const px = (x: number) => 40 + (x / 100) * (W - 80);
  const py = (y: number) => 30 + (y / 100) * (H - 70);
  const byId = useMemo(() => new Map(block.variables.map((v) => [v.id, v])), [block.variables]);
  return (
    <DiagramFrame
      title={block.title}
      caption={block.caption}
      meta={
        <span className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-ink-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-viz-3)]" />current</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-success-text)]" />assigned</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-danger-border)]" />domain wiped</span>
        </span>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label={block.title}>
        {block.constraints.map((c, i) => {
          const a = byId.get(c.a);
          const b = byId.get(c.b);
          if (!a || !b) return null;
          return (
            <g key={i}>
              <line x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)} stroke="var(--dv-border-strong)" strokeWidth={1.6} />
              <text
                x={(px(a.x) + px(b.x)) / 2}
                y={(py(a.y) + py(b.y)) / 2 - 5}
                textAnchor="middle"
                fontSize="9.5"
                className="fill-[var(--dv-ink-3)] font-mono"
                stroke="var(--dv-surface)"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {c.label}
              </text>
            </g>
          );
        })}
        {block.variables.map((v) => {
          const tone = CSP_TONE[v.tone ?? "default"];
          const w = Math.max(textW(v.label, 11), 40);
          return (
            <g key={v.id}>
              <rect x={px(v.x) - w / 2} y={py(v.y) - 16} width={w} height={32} rx={16} fill={tone.fill} stroke={tone.stroke} strokeWidth={2} />
              <text x={px(v.x)} y={py(v.y) + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" className="fill-[var(--dv-ink)]">
                {v.label}
              </text>
              <g>
                <rect
                  x={px(v.x) - w / 2}
                  y={py(v.y) + 20}
                  width={w}
                  height={18}
                  rx={6}
                  fill="var(--dv-surface-inset)"
                  stroke="var(--dv-border-subtle)"
                />
                <text
                  x={px(v.x)}
                  y={py(v.y) + 33}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="fill-[var(--dv-ink-2)] font-mono"
                  style={v.tone === "wiped" ? { textDecoration: "line-through" } : undefined}
                >
                  {v.domain.length ? `{${v.domain.join(",")}}` : "∅"}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      {(block.groups?.length || block.frameNote) && (
        <div className="mt-2 space-y-1.5">
          {block.frameNote && <p className="text-[12.5px] font-medium text-ink-2">{block.frameNote}</p>}
          {block.groups?.map((g) => (
            <p key={g.label} className="font-mono text-[11px] text-ink-3">
              {g.label}: all-different({"{ "}{g.vars.map((id) => byId.get(id)?.label ?? id).join(", ")}{" }"})
            </p>
          ))}
        </div>
      )}
    </DiagramFrame>
  );
}

/* ------------------------------------------------------- 12 · decision tree */

interface DNode {
  x: number;
  y: number;
  node: DecisionNode;
  parent?: DNode;
  edgeLabel?: string;
  depth: number;
}

function layoutDecision(root: DecisionNode): { nodes: DNode[]; width: number; height: number } {
  const nodes: DNode[] = [];
  let leafX = 0;
  const H_GAP = 150;
  const V_GAP = 64;
  let maxDepth = 0;
  const walk = (node: DecisionNode, depth: number, parent?: DNode, edgeLabel?: string): DNode => {
    maxDepth = Math.max(maxDepth, depth);
    const me: DNode = { x: 0, y: 0, node, parent, edgeLabel, depth };
    const kids = node.children ?? [];
    if (kids.length === 0) {
      me.x = leafX * H_GAP + H_GAP / 2;
      leafX += 1;
    } else {
      const laid = kids.map((k) => walk(k.child, depth + 1, me, k.label));
      me.x = (laid[0].x + laid[laid.length - 1].x) / 2;
    }
    me.y = depth * V_GAP + 24;
    nodes.push(me);
    return me;
  };
  walk(root, 0);
  return { nodes, width: Math.max(leafX * H_GAP, 260), height: (maxDepth + 1) * V_GAP + 10 };
}

export function DecisionTreeViz({ block }: { block: DecisionTreeBlock }) {
  const { nodes, width, height } = useMemo(() => layoutDecision(block.root), [block.root]);
  return (
    <DiagramFrame title={block.title} caption={block.caption ?? block.trace}>
      <svg viewBox={`0 0 ${Math.max(width, 300)} ${height}`} className="h-auto w-full min-w-[460px]" role="img" aria-label={block.title}>
        {nodes.map(({ node, parent, x, y, edgeLabel }, i) =>
          parent ? (
            <g key={`e${i}`}>
              <line
                x1={parent.x}
                y1={parent.y + 13}
                x2={x}
                y2={y - 13}
                stroke={node.highlight ? "var(--dv-viz-3)" : "var(--dv-border-strong)"}
                strokeWidth={node.highlight ? 2.2 : 1.4}
              />
              {edgeLabel && (
                <text
                  x={(parent.x + x) / 2 + (x - parent.x) * 0.03}
                  y={(parent.y + y) / 2 - 3}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="fill-[var(--dv-ink-3)] font-mono"
                  stroke="var(--dv-surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {edgeLabel}
                </text>
              )}
            </g>
          ) : null
        )}
        {nodes.map(({ node, x, y }, i) => {
          const leaf = !node.children?.length;
          const w = leaf ? Math.max(textW(node.class ?? "?", 10.5), 46) : Math.max(textW(node.test ?? "?", 10), 64);
          return (
            <g key={`n${i}`}>
              <rect
                x={x - w / 2}
                y={y - 14}
                width={w}
                height={28}
                rx={leaf ? 14 : 7}
                fill={leaf ? "color-mix(in srgb, var(--dv-success-text) 14%, var(--dv-surface))" : node.highlight ? "color-mix(in srgb, var(--dv-viz-3) 12%, var(--dv-surface))" : "var(--dv-surface)"}
                stroke={leaf ? "var(--dv-success-text)" : node.highlight ? "var(--dv-viz-3)" : "var(--dv-border-strong)"}
                strokeWidth={node.highlight || leaf ? 1.8 : 1.4}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" className="fill-[var(--dv-ink)]">
                {leaf ? node.class : node.test}
              </text>
              {node.note && (
                <text x={x} y={y - 19} textAnchor="middle" fontSize="8.5" className="fill-[var(--dv-ink-3)] font-mono">
                  {node.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

/* ----------------------------------------------------------- 13 · game tree */

interface GNode {
  x: number;
  y: number;
  node: GameNode;
  parent?: GNode;
  edgeLabel?: string;
  depth: number;
}

const GAME_KIND_STYLE: Record<string, { label: string; ring: string }> = {
  max: { label: "MAX", ring: "var(--dv-viz-3)" },
  min: { label: "MIN", ring: "var(--dv-violet-500)" },
  leaf: { label: "", ring: "var(--dv-border-strong)" },
  chance: { label: "CHANCE", ring: "var(--dv-blue-500)" },
};

function layoutGame(root: GameNode): { nodes: GNode[]; width: number; height: number } {
  const nodes: GNode[] = [];
  let leafX = 0;
  const H_GAP = 62;
  const V_GAP = 72;
  let maxDepth = 0;
  const walk = (node: GameNode, depth: number, parent?: GNode, edgeLabel?: string): GNode => {
    maxDepth = Math.max(maxDepth, depth);
    const me: GNode = { x: 0, y: 0, node, parent, edgeLabel, depth };
    const kids = node.children ?? [];
    if (kids.length === 0 || node.pruned) {
      me.x = leafX * H_GAP + H_GAP / 2;
      leafX += 1;
      if (node.pruned) {
        // pruned subtrees collapse to a single slot
        const count = (function countKids(n: GameNode): number {
          return (n.children ?? []).length === 0 || n.pruned ? 1 : (n.children ?? []).reduce((a, c) => a + countKids(c.child), 0);
        })(node);
        leafX += count - 1;
        me.x += ((count - 1) * H_GAP) / 2;
      }
    } else {
      const laid = kids.map((k) => walk(k.child, depth + 1, me, k.edgeLabel));
      me.x = (laid[0].x + laid[laid.length - 1].x) / 2;
    }
    me.y = depth * V_GAP + 26;
    nodes.push(me);
    return me;
  };
  walk(root, 0);
  return { nodes, width: Math.max(leafX * H_GAP, 260), height: (maxDepth + 1) * V_GAP + 8 };
}

export function GameTreeViz({ block }: { block: GameTreeBlock }) {
  const { nodes, width, height } = useMemo(() => layoutGame(block.root), [block.root]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <DiagramFrame
      title={block.title}
      caption={block.caption}
      meta={
        <span className="flex flex-wrap items-center gap-3 text-[11px] text-ink-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-viz-3)]" />MAX</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-violet-500)]" />MIN</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-blue-500)]" />chance</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--dv-danger-border)]" />pruned / cut</span>
        </span>
      }
    >
      <svg viewBox={`0 0 ${Math.max(width, 300)} ${height}`} className="h-auto w-full min-w-[480px]" role="img" aria-label={block.title}>
        <defs>
          <marker id={`gt-${uid}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 1.4 L8.5 5 L0 8.6 z" fill="var(--dv-border-strong)" />
          </marker>
        </defs>
        {nodes.map(({ node, parent, x, y, edgeLabel }, i) =>
          parent ? (
            <g key={`e${i}`}>
              <line
                x1={parent.x}
                y1={parent.y + 14}
                x2={x}
                y2={y - 16}
                stroke={node.pruned ? "var(--dv-danger-border)" : "var(--dv-border-strong)"}
                strokeWidth={1.5}
                strokeDasharray={node.pruned ? "4 4" : undefined}
                markerEnd={`url(#gt-${uid})`}
              />
              {edgeLabel && (
                <text
                  x={(parent.x + x) / 2}
                  y={(parent.y + y) / 2 - 3}
                  textAnchor="middle"
                  fontSize="9.5"
                  className="fill-[var(--dv-ink-3)] font-mono"
                  stroke="var(--dv-surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {edgeLabel}
                </text>
              )}
            </g>
          ) : null
        )}
        {nodes.map(({ node, x, y }, i) => {
          const style = GAME_KIND_STYLE[node.kind] ?? GAME_KIND_STYLE.leaf;
          const isLeaf = node.kind === "leaf";
          const w = isLeaf ? 40 : node.pruned ? 56 : 46;
          const h = isLeaf ? 26 : 30;
          return (
            <g key={`n${i}`} opacity={node.pruned ? 0.62 : 1}>
              {node.kind === "chance" && !isLeaf && (
                <polygon
                  points={`${x},${y - 15} ${x + w / 2},${y} ${x},${y + 15} ${x - w / 2},${y}`}
                  fill="color-mix(in srgb, var(--dv-blue-500) 10%, var(--dv-surface))"
                  stroke="var(--dv-blue-500)"
                  strokeWidth={1.6}
                />
              )}
              {node.kind !== "chance" && (
                <rect
                  x={x - w / 2}
                  y={y - h / 2}
                  width={w}
                  height={h}
                  rx={isLeaf ? 13 : 7}
                  fill={node.cut ? "color-mix(in srgb, var(--dv-danger-border) 14%, var(--dv-surface))" : "var(--dv-surface)"}
                  stroke={node.cut ? "var(--dv-danger-border)" : style.ring}
                  strokeWidth={node.cut ? 2.2 : node.kind === "leaf" ? 1.4 : 1.8}
                />
              )}
              {/* the value */}
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" className="fill-[var(--dv-ink)]">
                {node.value !== undefined ? node.value : node.pruned ? "⌧" : node.label ?? ""}
              </text>
              {/* windows */}
              {block.showWindows && (node.alpha !== undefined || node.beta !== undefined) && (
                <text x={x} y={y - h / 2 - 5} textAnchor="middle" fontSize="9" className="fill-[var(--dv-ink-3)] font-mono">
                  {node.alpha !== undefined ? `α=${node.alpha}` : ""}
                  {node.alpha !== undefined && node.beta !== undefined ? " " : ""}
                  {node.beta !== undefined ? `β=${node.beta}` : ""}
                </text>
              )}
              {/* the kind tag for internal nodes */}
              {!isLeaf && node.kind !== "chance" && (
                <text x={x} y={y + h / 2 + 11} textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="0.5" fill={style.ring}>
                  {style.label}
                </text>
              )}
              {node.kind === "chance" && (
                <text x={x} y={y + 26} textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="0.5" fill="var(--dv-blue-500)">
                  CHANCE
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {block.conclusion && (
        <p className="mt-2 rounded-lg border border-border-subtle bg-surface-subtle/60 px-3 py-2 text-[12.5px] font-medium text-ink-2">
          {block.conclusion}
        </p>
      )}
    </DiagramFrame>
  );
}

/* ----------------------------------------------------- 14 · inference chain */

export function InferenceChainViz({ block }: { block: InferenceChainBlock }) {
  const facts = block.facts;
  const rules = block.rules;
  const derived = block.derived;
  const backward = block.direction === "backward";

  // Layout: three columns of pills; edges computed from rule conditions.
  const colW = 178;
  const W = colW * 3 + 130;
  const rowH = 44;
  const H = Math.max(facts.length, rules.length, derived.length) * rowH + 66;

  const factY = (i: number) => 46 + i * rowH;
  const ruleY = (i: number) => 46 + i * rowH + 4;
  const derivedY = (i: number) => 46 + i * rowH + 4;

  const factIndex = new Map<string, number>();
  facts.forEach((f, i) => factIndex.set(f, i));

  const ruleConsumes = rules.map((r) =>
    r.if.map((c) => {
      const fi = factIndex.get(c);
      const di = derived.findIndex((d) => d === c);
      return fi !== undefined && fi >= 0 ? { col: 0, idx: fi } : { col: 0, idx: derived.slice(0, Math.max(di, 0)).length + Math.max(factIndex.size ? 0 : 0) + (di >= 0 ? di + facts.length : 0) };
    })
  );

  // Simpler model: conditions may be facts (col 0) or earlier derived (col 2);
  // we draw edges from whichever column holds them.
  const derivedIndex = new Map<string, number>();
  derived.forEach((d, i) => derivedIndex.set(d, i));
  const posOf = (name: string): { x: number; y: number } | null => {
    const fi = factIndex.get(name);
    if (fi !== undefined) return { x: 12, y: factY(fi) };
    const di = derivedIndex.get(name);
    if (di !== undefined) return { x: 2 * colW + 150, y: derivedY(di) };
    return null;
  };

  return (
    <DiagramFrame
      title={block.title}
      caption={block.caption}
      meta={
        <span className="rounded-full border border-border-subtle bg-surface-subtle/60 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-3">
          {backward ? "backward chaining · goal-driven" : "forward chaining · data-driven"}
        </span>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]" role="img" aria-label={block.title}>
        <defs>
          <marker id="ic-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 1.2 L8.5 5 L0 8.8 z" fill="var(--dv-ink-3)" />
          </marker>
        </defs>
        {/* column headers */}
        {[
          { x: 12 + 75, label: backward ? "ask (premises)" : "facts" },
          { x: colW + 65 + 65, label: "rules" },
          { x: 2 * colW + 150 + 75, label: backward ? "goal" : "derived" },
        ].map((h) => (
          <text key={h.label} x={h.x} y={22} textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1" className="fill-[var(--dv-ink-3)] uppercase">
            {h.label}
          </text>
        ))}

        {/* rule → conclusion edges */}
        {rules.map((r, ri) => {
          const targetName = backward ? (r.if[0] ?? "") : r.then;
          const t = posOf(targetName) ?? { x: 2 * colW + 150, y: derivedY(ri) };
          return (
            <line
              key={`rc${r.id}`}
              x1={colW + 130}
              y1={ruleY(ri) + 10}
              x2={t.x + 8}
              y2={t.y + 10}
              stroke="var(--dv-ink-3)"
              strokeWidth={1.3}
              markerEnd="url(#ic-arrow)"
              opacity={0.75}
            />
          );
        })}
        {/* premise → rule edges */}
        {rules.map((r, ri) =>
          r.if.map((c, ci) => {
            const s = posOf(c);
            if (!s) return null;
            return (
              <line
                key={`${r.id}-${ci}`}
                x1={s.x + 8}
                y1={s.y + 10}
                x2={colW}
                y2={ruleY(ri) + 10}
                stroke="var(--dv-border-strong)"
                strokeWidth={1.2}
                markerEnd="url(#ic-arrow)"
                opacity={0.8}
              />
            );
          })
        )}

        {/* facts column */}
        {facts.map((f, i) => (
          <g key={f}>
            <rect x={12} y={factY(i)} width={150} height={22} rx={11} fill="color-mix(in srgb, var(--dv-viz-3) 10%, var(--dv-surface))" stroke="var(--dv-viz-3)" strokeWidth={1.4} />
            <text x={87} y={factY(i) + 15} textAnchor="middle" fontSize="10" className="fill-[var(--dv-ink)]">{f}</text>
          </g>
        ))}
        {/* rules column */}
        {rules.map((r, i) => (
          <g key={r.id}>
            <rect x={colW} y={ruleY(i)} width={130} height={22} rx={6} fill="var(--dv-surface)" stroke="var(--dv-border-strong)" strokeWidth={1.4} />
            <text x={colW + 65} y={ruleY(i) + 15} textAnchor="middle" fontSize="9.5" fontWeight="700" className="fill-[var(--dv-ink)] font-mono">
              {r.label}
            </text>
          </g>
        ))}
        {/* derived column */}
        {(backward && block.goal ? [block.goal] : derived).map((d, i) => (
          <g key={d}>
            <rect x={2 * colW + 150} y={derivedY(i)} width={150} height={22} rx={11} fill={backward ? "color-mix(in srgb, var(--dv-viz-3) 16%, var(--dv-surface))" : "color-mix(in srgb, var(--dv-success-text) 12%, var(--dv-surface))"} stroke={backward ? "var(--dv-viz-3)" : "var(--dv-success-text)"} strokeWidth={1.6} />
            <text x={2 * colW + 225} y={derivedY(i) + 15} textAnchor="middle" fontSize="10" fontWeight="600" className="fill-[var(--dv-ink)]">{d}</text>
          </g>
        ))}
      </svg>
      {/* the rule list, spelled out */}
      <div className="mt-3 space-y-1 rounded-lg border border-border-subtle bg-surface-subtle/40 px-3.5 py-3">
        {rules.map((r) => (
          <p key={r.id} className="font-mono text-[11px] leading-relaxed text-ink-2">
            <span className="font-bold text-ink">{r.label}:</span> {r.if.join(" ∧ ")} <span className="text-ink-3">⇒</span> {r.then}
          </p>
        ))}
      </div>
    </DiagramFrame>
  );
}

/* ---------------------------------------------------------- 15 · bayes net */

export function BayesNetViz({ block }: { block: BayesNetBlock }) {
  const W = 560;
  const H = 360;
  const px = (x: number) => 50 + (x / 100) * (W - 100);
  const py = (y: number) => 26 + (y / 100) * (H - 66);
  const byId = useMemo(() => new Map(block.nodes.map((n) => [n.id, n])), [block.nodes]);
  const cptNodes = block.nodes.filter((n) => n.showCpt && block.cpts?.[n.id]);

  return (
    <DiagramFrame title={block.title} caption={block.caption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[440px]" role="img" aria-label={block.title}>
        <defs>
          <marker id="bn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 1.2 L9 5 L0 8.8 z" fill="var(--dv-ink-3)" />
          </marker>
        </defs>
        {block.nodes.flatMap((n) =>
          n.parents.map((p) => {
            const a = byId.get(p);
            if (!a) return null;
            const x1 = px(a.x);
            const y1 = py(a.y);
            const x2 = px(n.x);
            const y2 = py(n.y);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            return (
              <line
                key={`${p}-${n.id}`}
                x1={x1 + (dx / len) * 24}
                y1={y1 + (dy / len) * 24}
                x2={x2 - (dx / len) * 26}
                y2={y2 - (dy / len) * 26}
                stroke="var(--dv-ink-3)"
                strokeWidth={1.5}
                markerEnd="url(#bn-arrow)"
              />
            );
          })
        )}
        {block.nodes.map((n) => (
          <g key={n.id}>
            <ellipse cx={px(n.x)} cy={py(n.y)} rx={Math.max(textW(n.label, 11) / 2 + 12, 34)} ry={20} fill="var(--dv-surface)" stroke="var(--dv-viz-3)" strokeWidth={1.8} />
            <text x={px(n.x)} y={py(n.y) + 4} textAnchor="middle" fontSize="11" fontWeight="700" className="fill-[var(--dv-ink)]">
              {n.label}
            </text>
            {block.cpts?.[n.id] && (
              <text x={px(n.x)} y={py(n.y) + 32} textAnchor="middle" fontSize="8.5" className="fill-[var(--dv-ink-3)] font-mono">
                CPT below
              </text>
            )}
          </g>
        ))}
      </svg>

      {(cptNodes.length > 0) && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cptNodes.map((n) => {
            const rows = block.cpts?.[n.id] ?? [];
            const st = n.states;
            return (
              <div key={n.id} className="overflow-hidden rounded-lg border border-border-subtle">
                <p className="border-b border-border-subtle bg-surface-subtle/60 px-3 py-1.5 font-mono text-[11px] font-semibold text-ink">
                  P({n.label} {n.parents.length ? `| ${n.parents.join(", ")}` : ""})
                </p>
                <table className="w-full font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-border-subtle text-ink-3">
                      {n.parents.length > 0 && <th className="px-2.5 py-1 text-left font-medium">given</th>}
                      {st.map((s) => (
                        <th key={s} className="px-2.5 py-1 text-right font-medium">{n.label}={s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-border-subtle/60 last:border-0">
                        {n.parents.length > 0 && <td className="px-2.5 py-1 text-ink-2">{r.given || "—"}</td>}
                        {r.probs.map((p, j) => (
                          <td key={j} className="px-2.5 py-1 text-right text-ink">{p}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {(block.query || block.answer) && (
        <div className="mt-3 rounded-lg border border-viz-3/30 bg-[color-mix(in_srgb,var(--dv-viz-3)_7%,var(--dv-surface))] px-3.5 py-2.5">
          {block.query && <p className="font-mono text-[12px] text-ink-2">{block.query}</p>}
          {block.answer && <p className="mt-1 text-[12.5px] font-medium text-ink">{block.answer}</p>}
        </div>
      )}
      {block.independences && block.independences.length > 0 && (
        <div className="mt-2 text-[12px] leading-relaxed text-ink-3">
          <span className="font-semibold text-ink-2">Independences the DAG asserts: </span>
          {block.independences.join(" · ")}
        </div>
      )}
    </DiagramFrame>
  );
}

/* ------------------------------------------------------- 16 · planning graph */

export function PlanningGraphViz({ block }: { block: PlanningGraphBlock }) {
  const levels: PlanLevel[] = block.levels;
  const pillH = 26;
  const rowGap = 18;
  const bandGap = 14;
  const padX = 16;
  const pillW = (s: string) => Math.max(textW(s, 9.5), 34);

  // deterministic layout: rows of pills, measured by approximation
  const rows = levels.flatMap((lv, li) => {
    const propRow = {
      kind: "props" as const,
      level: li,
      items: lv.propositions.map((p) => ({ label: p })),
    };
    const actRow = {
      kind: "actions" as const,
      level: li,
      items: lv.actions.map((a) => ({ label: a.name })),
    };
    // Empty action levels are omitted — no orphan labels under the arcs.
    return lv.actions.length > 0 ? [propRow, actRow] : [propRow];
  });

  const width = Math.max(
    ...rows.map(
      (r) => padX * 2 + r.items.reduce((a, it) => a + pillW(it.label) + 8, 0)
    ),
    320
  );

  // Prefix sums of row offsets — no mutation during render.
  const offsets: number[] = [10];
  rows.forEach((r, i) => {
    offsets.push(offsets[i] + pillH + rowGap + (r.kind === "actions" ? bandGap : 0));
  });
  const rowPos = rows.map((r, i) => ({ y: offsets[i], row: r, h: pillH }));
  const height = offsets[rows.length] + 6;

  const itemX = (row: typeof rows[number], label: string): number | null => {
    let x = padX;
    for (const it of row.items) {
      if (it.label === label) return x;
      x += pillW(it.label) + 8;
    }
    return null;
  };

  const rowOf = (kind: "props" | "actions", level: number) =>
    rows.find((r) => r.kind === kind && r.level === level);

  return (
    <DiagramFrame
      title={block.title}
      caption={block.caption}
      meta={
        block.leveledOff ? (
          <span className="rounded-full border border-viz-3/40 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,var(--dv-surface))] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink-2">
            leveled off
          </span>
        ) : undefined
      }
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[520px]" role="img" aria-label={block.title}>
        {rowPos.map(({ y: ry, row, h }, ri) => (
          <g key={ri}>
            <text x={padX} y={ry - 4} fontSize="8.5" fontWeight="700" letterSpacing="1" className="fill-[var(--dv-ink-3)] uppercase">
              {row.kind === "props" ? `S${row.level} · propositions` : `A${row.level} · actions`}
            </text>
            {row.items.map((it, ii) => {
              let x = padX;
              for (let k = 0; k < ii; k++) x += pillW(row.items[k].label) + 8;
              const w = pillW(it.label);
              return (
                <g key={it.label}>
                  <rect
                    x={x}
                    y={ry}
                    width={w}
                    height={h}
                    rx={5}
                    fill={row.kind === "props" ? "color-mix(in srgb, var(--dv-viz-3) 9%, var(--dv-surface))" : "var(--dv-surface)"}
                    stroke={row.kind === "props" ? "var(--dv-viz-3)" : "var(--dv-border-strong)"}
                    strokeWidth={1.3}
                  />
                  <text x={x + w / 2} y={ry + h / 2 + 3.5} textAnchor="middle" fontSize="9.5" className="fill-[var(--dv-ink)]">
                    {it.label}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        {/* mutex arcs */}
        {block.mutexProps?.map((m, i) => {
          const row = rowOf("props", m.level);
          if (!row) return null;
          const x1 = itemX(row, m.a);
          const x2 = itemX(row, m.b);
          const rp = rowPos[rows.indexOf(row)];
          if (x1 === null || x2 === null || !rp) return null;
          const cx = (x1 + x2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1 + pillW(m.a) / 2} ${rp.y + rp.h} Q ${cx} ${rp.y + rp.h + 18} ${x2 + pillW(m.b) / 2} ${rp.y + rp.h}`}
                stroke="var(--dv-danger-border)"
                strokeWidth={1.3}
                fill="none"
                strokeDasharray="4 3"
              />
            </g>
          );
        })}
      </svg>
      {block.reading && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{block.reading}</p>}
    </DiagramFrame>
  );
}
