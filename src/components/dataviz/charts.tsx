"use client";

/**
 * ChartRenderer — the shared SVG chart engine for the Data Visualization
 * Academy. One component, ten chart types, no external chart libraries.
 * The SAME engine renders lesson charts, interpretation exercises and
 * the Chart Playground's live preview: what the learner configures is
 * literally what the lessons teach.
 *
 * Every chart is a pure function of its ChartSpec — deterministic,
 * SSR-safe, and honest by default (bars start at zero unless a lesson
 * deliberately demonstrates the truncated axis).
 */
import { useMemo } from "react";
import type {
  BoxStat,
  ChartSpec,
  ChartType,
  PaletteName,
} from "@/lib/dataviz/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ palettes */

export const PALETTES: Record<PaletteName, string[]> = {
  categorical: ["#0d9488", "#c2410c", "#7c3aed", "#0f766e", "#b45309", "#4d7c0f"],
  "okabe-ito": ["#0072b2", "#e69f00", "#009e73", "#d55e00", "#cc79a7", "#56b4e9", "#f0e442"],
  set2: ["#b07aa1", "#fd7f6f", "#8ecae6", "#ffd166", "#06d6a0", "#ef8354"],
  warm: ["#c2410c", "#ea580c", "#f59e0b", "#d97706", "#b45309", "#f97316"],
  cool: ["#155e75", "#0e7490", "#0891b2", "#0d9488", "#14b8a6", "#06b6d4"],
  greens: ["#14532d", "#166534", "#15803d", "#16a34a", "#22c55e", "#4ade80"],
  oranges: ["#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c"],
  traffic: ["#dc2626", "#f59e0b", "#16a34a", "#0d9488", "#7c3aed", "#475569"],
  earth: ["#78350f", "#a16207", "#4d7c0f", "#166534", "#155e75", "#6b21a8"],
};

function paletteColors(spec: ChartSpec): string[] {
  return PALETTES[spec.palette ?? "categorical"] ?? PALETTES.categorical;
}

/* ------------------------------------------------------------------- helpers */

function niceCeil(v: number): number {
  if (v <= 0) return 0;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const f = v / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

function niceFloor(v: number): number {
  if (v >= 0) return 0;
  return -niceCeil(-v);
}

interface Scale {
  min: number;
  max: number;
  step: number;
}

function niceScale(min: number, max: number, fromZero: boolean): Scale {
  const lo = fromZero ? Math.min(0, min) : niceFloor(min);
  const hi = Math.max(niceCeil(Math.abs(max - lo) > 0 ? max : lo + 1), lo + 1e-9);
  const rawStep = (hi - lo) / 5;
  const exp = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exp);
  const f = rawStep / base;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * base;
  return { min: lo, max: hi, step };
}

function fmt(v: number): string {
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M`;
  if (a >= 10_000) return `${(v / 1000).toFixed(0)}k`;
  if (a >= 1_000) return `${(v / 1000).toFixed(1)}k`;
  if (a >= 10) return String(Math.round(v));
  if (a >= 1) return String(Math.round(v * 10) / 10);
  return String(Math.round(v * 100) / 100);
}

function ticks(scale: Scale): number[] {
  const out: number[] = [];
  for (let t = scale.min; t <= scale.max + 1e-9; t += scale.step) out.push(Math.round(t * 1e9) / 1e9);
  return out;
}

/* --------------------------------------------------------------------- frame */

const W = 720;
const M = { top: 12, right: 16, bottom: 46, left: 56 };
function Axes({
  h,
  scale,
  xLabels,
  xLabel,
  yLabel,
  yTicks,
  truncateWarning,
}: {
  h: number;
  scale: Scale;
  xLabels: string[];
  xLabel?: string;
  yLabel?: string;
  yTicks: number[];
  truncateWarning?: boolean;
}) {
  const plotW = W - M.left - M.right;
  const plotH = h - M.top - M.bottom;
  const bandW = plotW / Math.max(xLabels.length, 1);
  const y = (v: number) => h - M.bottom - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const labelEvery = Math.ceil(xLabels.length / 14);
  return (
    <g>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--dv-border-subtle)" strokeWidth={1} />
          <text x={M.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--dv-ink-3)">
            {fmt(t)}
          </text>
        </g>
      ))}
      {xLabels.map((l, i) =>
        i % labelEvery === 0 ? (
          <text
            key={`${l}-${i}`}
            x={M.left + bandW * (i + 0.5)}
            y={h - M.bottom + 16}
            textAnchor="middle"
            fontSize={11}
            fill="var(--dv-ink-3)"
          >
            {l.length > 9 ? `${l.slice(0, 8)}…` : l}
          </text>
        ) : null,
      )}
      {xLabel ? (
        <text x={M.left + plotW / 2} y={h - 6} textAnchor="middle" fontSize={12} fill="var(--dv-ink-2)" fontWeight={500}>
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text
          x={-(M.top + plotH / 2)}
          y={14}
          textAnchor="middle"
          fontSize={12}
          fill="var(--dv-ink-2)"
          fontWeight={500}
          transform="rotate(-90)"
        >
          {yLabel}
        </text>
      ) : null}
      <line
        x1={M.left}
        x2={W - M.right}
        y1={h - M.bottom}
        y2={h - M.bottom}
        stroke="var(--dv-border-strong)"
        strokeWidth={1}
      />
      <line x1={M.left} x2={M.left} y1={M.top} y2={h - M.bottom} stroke="var(--dv-border-strong)" strokeWidth={1} />
      {truncateWarning ? (
        <g>
          <path
            d={`M ${M.left - 6} ${y(scale.min) + 12} L ${M.left} ${y(scale.min)} L ${M.left + 6} ${y(scale.min) + 12}`}
            fill="none"
            stroke="#dc2626"
            strokeWidth={1.5}
          />
          <text x={M.left + 10} y={y(scale.min) + 10} fontSize={10} fill="#dc2626" fontWeight={600}>
            axis truncated
          </text>
        </g>
      ) : null}
    </g>
  );
}

function Legend({ names, colors }: { names: string[]; colors: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2">
      {names.map((n, i) => (
        <span key={n} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
          {n}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ bar family */

function BarChart({ spec }: { spec: ChartSpec }) {
  const SVG_H = spec.height ?? 320;
  const colors = paletteColors(spec);
  const stacked = spec.type === "stacked-bar";
  const grouped = spec.type === "grouped-bar" || (spec.type === "bar" && (spec.series?.length ?? 1) > 1);
  const series = spec.series ?? [];
  let categories = spec.categories ?? [];
  let s = series;
  if (spec.sortDesc && categories.length) {
    const key = series.length > 1 ? (i: number) => series.reduce((a, sr) => a + (sr.values[i] ?? 0), 0) : (i: number) => series[0]?.values[i] ?? 0;
    const order = categories.map((_, i) => i).sort((a, b) => key(b) - key(a));
    categories = order.map((i) => categories[i]);
    s = series.map((sr) => ({ ...sr, values: order.map((i) => sr.values[i] ?? 0) }));
  }
  const totals = categories.map((_, i) => s.reduce((a, sr) => a + (sr.values[i] ?? 0), 0));
  const rawMax = stacked ? Math.max(...totals, 0) : Math.max(...s.flatMap((sr) => sr.values), 0);
  const fromZero = spec.yFromZero !== false;
  const scale = niceScale(fromZero ? 0 : Math.min(...s.flatMap((sr) => sr.values), rawMax), rawMax, fromZero);
  const plotW = W - M.left - M.right;
  const plotH = SVG_H - M.top - M.bottom;
  const y = (v: number) => SVG_H - M.bottom - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const bandW = plotW / Math.max(categories.length, 1);
  const single = s.length === 1;
  const groupW = single ? bandW * 0.62 : stacked ? bandW * 0.6 : (bandW * 0.78) / s.length;

  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "bar chart"}>
      <Axes
        h={SVG_H}
        scale={scale}
        xLabels={categories}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel}
        yTicks={ticks(scale)}
        truncateWarning={fromZero ? false : true}
      />
      {categories.map((c, i) => {
        const cx = M.left + bandW * (i + 0.5);
        if (stacked) {
          let acc = 0;
          return (
            <g key={c}>
              {s.map((sr, si) => {
                const v = sr.values[i] ?? 0;
                const y0 = y(acc + v);
                const h = Math.max(y(acc) - y(acc + v), 0.5);
                acc += v;
                return <rect key={sr.name} x={cx - groupW / 2} y={y0} width={groupW} height={h} fill={sr.color ?? colors[si % colors.length]} />;
              })}
              {spec.showValues ? (
                <text x={cx} y={y(acc) - 5} textAnchor="middle" fontSize={10} fill="var(--dv-ink-2)" fontWeight={600}>
                  {fmt(acc)}
                </text>
              ) : null}
            </g>
          );
        }
        return (
          <g key={c}>
            {s.map((sr, si) => {
              const v = sr.values[i] ?? 0;
              const x = single
                ? cx - groupW / 2
                : M.left + bandW * i + bandW * 0.11 + (groupW + 1) * si;
              const yv = y(Math.max(v, scale.min));
              const h = Math.max(y(scale.min) - yv, 0.5);
              return (
                <g key={sr.name}>
                  <rect x={x} y={yv} width={groupW} height={h} fill={sr.color ?? colors[si % colors.length]} rx={1.5} />
                  {spec.showValues && (single || s.length <= 3) ? (
                    <text x={x + groupW / 2} y={yv - 4} textAnchor="middle" fontSize={9.5} fill="var(--dv-ink-2)" fontWeight={600}>
                      {fmt(v)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------- line / area */

function LineChart({ spec, area }: { spec: ChartSpec; area?: boolean }) {
  const SVG_H = spec.height ?? 320;
  const colors = paletteColors(spec);
  const series = spec.series ?? [];
  const cats = spec.categories ?? [];
  const allVals = series.flatMap((s) => s.values);
  const fromZero = area === true || spec.yFromZero === true;
  const scale = niceScale(fromZero ? 0 : Math.min(...allVals), Math.max(...allVals), fromZero);
  const plotW = W - M.left - M.right;
  const plotH = SVG_H - M.top - M.bottom;
  const x = (i: number) => M.left + (cats.length > 1 ? (plotW * i) / (cats.length - 1) : plotW / 2);
  const y = (v: number) => SVG_H - M.bottom - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "line chart"}>
      <Axes h={SVG_H} scale={scale} xLabels={cats} xLabel={spec.xLabel} yLabel={spec.yLabel} yTicks={ticks(scale)} />
      {series.map((sr, si) => {
        const color = sr.color ?? colors[si % colors.length];
        const pts = sr.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (
          <g key={sr.name}>
            {area ? (
              <polygon
                points={`${M.left},${y(scale.min)} ${pts} ${x(sr.values.length - 1)},${y(scale.min)}`}
                fill={color}
                opacity={0.18}
              />
            ) : null}
            <polyline points={pts} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
            {sr.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#fff" stroke={color} strokeWidth={1.75} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------- scatter */

function ScatterPlot({ spec }: { spec: ChartSpec }) {
  const SVG_H = spec.height ?? 320;
  const colors = paletteColors(spec);
  const pts = spec.points ?? [];
  const groups = useMemo(() => {
    const g = new Map<string, { x: number; y: number; label?: string }[]>();
    for (const p of pts) {
      const key = p.label ?? "";
      const arr = g.get(key) ?? [];
      arr.push(p);
      g.set(key, arr);
    }
    return [...g.entries()];
  }, [pts]);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const sx = niceScale(Math.min(...xs), Math.max(...xs), false);
  const sy = niceScale(Math.min(...ys), Math.max(...ys), false);
  const plotW = W - M.left - M.right;
  const plotH = SVG_H - M.top - M.bottom;
  const x = (v: number) => M.left + ((v - sx.min) / (sx.max - sx.min)) * plotW;
  const y = (v: number) => SVG_H - M.bottom - ((v - sy.min) / (sy.max - sy.min)) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "scatter plot"}>
      <Axes
        h={SVG_H}
        scale={sy}
        xLabels={ticks(sx).map((t) => fmt(t))}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel}
        yTicks={ticks(sy)}
      />
      {groups.map(([label, list], gi) => (
        <g key={label || "series"} fill={label ? colors[gi % colors.length] : colors[0]}>
          {list.map((p, i) => (
            <circle key={i} cx={x(p.x)} cy={y(p.y)} r={4} opacity={0.82}>
              <title>{label ? `${label}: ` : ""}{fmt(p.x)} × {fmt(p.y)}</title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- histogram */

function Histogram({ spec }: { spec: ChartSpec }) {
  const SVG_H = spec.height ?? 320;
  const values = spec.values ?? [];
  const nbins = Math.max(2, Math.min(spec.bins ?? 10, 40));
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const width = (hi - lo) / nbins || 1;
  const counts = new Array(nbins).fill(0);
  for (const v of values) {
    const idx = Math.min(Math.floor((v - lo) / width), nbins - 1);
    counts[idx] += 1;
  }
  const scale = niceScale(0, Math.max(...counts), true);
  const plotW = W - M.left - M.right;
  const plotH = SVG_H - M.top - M.bottom;
  const bandW = plotW / nbins;
  const y = (v: number) => SVG_H - M.bottom - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const color = paletteColors(spec)[0];
  const edge = (i: number) => lo + width * i;
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "histogram"}>
      <Axes
        h={SVG_H}
        scale={scale}
        xLabels={Array.from({ length: nbins + 1 }, (_, i) => fmt(edge(i)))}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel ?? "count"}
        yTicks={ticks(scale)}
      />
      {counts.map((c, i) => (
        <g key={i}>
          <rect
            x={M.left + bandW * i + 0.75}
            y={y(c)}
            width={bandW - 1.5}
            height={Math.max(y(0) - y(c), 0.5)}
            fill={color}
            opacity={0.88}
            rx={1.5}
          />
          {spec.showValues && c > 0 ? (
            <text x={M.left + bandW * (i + 0.5)} y={y(c) - 4} textAnchor="middle" fontSize={9.5} fill="var(--dv-ink-2)" fontWeight={600}>
              {c}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------------- pie */

function PieChart({ spec }: { spec: ChartSpec }) {
  const colors = paletteColors(spec);
  const cats = spec.categories ?? [];
  const vals = spec.series?.[0]?.values ?? [];
  const total = vals.reduce((a, v) => a + v, 0) || 1;
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 108;
  // Precompute the arcs (angles, paths, label positions) before rendering.
  const slices: { i: number; frac: number; path: string; lx: number; ly: number }[] = [];
  let angle = -Math.PI / 2;
  for (let i = 0; i < vals.length; i++) {
    const frac = vals[i] / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const mid = (a0 + a1) / 2;
    slices.push({
      i,
      frac,
      path: `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`,
      lx: cx + r * 0.62 * Math.cos(mid),
      ly: cy + r * 0.62 * Math.sin(mid),
    });
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[300px]" role="img" aria-label={spec.title ?? "pie chart"}>
      {slices.map((s) => (
        <g key={cats[s.i] ?? s.i}>
          <path d={s.path} fill={colors[s.i % colors.length]} stroke="#fff" strokeWidth={1.5} />
          {s.frac >= 0.045 ? (
            <text x={s.lx} y={s.ly + 3.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
              {Math.round(s.frac * 100)}%
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------------- box */

function BoxPlot({ spec }: { spec: ChartSpec }) {
  const SVG_H = spec.height ?? 320;
  const boxes = spec.boxes ?? [];
  const all = boxes.flatMap((b) => [b.min, ...(b.outliers ?? []), b.max]);
  const scale = niceScale(Math.min(...all), Math.max(...all), false);
  const plotW = W - M.left - M.right;
  const plotH = SVG_H - M.top - M.bottom;
  const y = (v: number) => SVG_H - M.bottom - ((v - scale.min) / (scale.max - scale.min)) * plotH;
  const bandW = plotW / Math.max(boxes.length, 1);
  const color = paletteColors(spec)[0];
  return (
    <svg viewBox={`0 0 ${W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "box plot"}>
      <Axes
        h={SVG_H}
        scale={scale}
        xLabels={boxes.map((b) => b.label)}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel}
        yTicks={ticks(scale)}
      />
      {boxes.map((b, i) => {
        const cx = M.left + bandW * (i + 0.5);
        const bw = Math.min(bandW * 0.42, 74);
        const yMax = y(b.max);
        const yQ3 = y(b.q3);
        const yMed = y(b.median);
        const yQ1 = y(b.q1);
        const yMin = y(b.min);
        return (
          <g key={b.label} stroke={color} strokeWidth={1.5}>
            <line x1={cx} x2={cx} y1={yMax} y2={yQ3} />
            <line x1={cx - 8} x2={cx + 8} y1={yMax} y2={yMax} />
            <rect x={cx - bw / 2} y={yQ3} width={bw} height={Math.max(yQ1 - yQ3, 1)} fill={color} opacity={0.16} rx={2} />
            <line x1={cx - bw / 2} x2={cx + bw / 2} y1={yMed} y2={yMed} strokeWidth={2.5} />
            <line x1={cx} x2={cx} y1={yQ1} y2={yMin} />
            <line x1={cx - 8} x2={cx + 8} y1={yMin} y2={yMin} />
            {(b.outliers ?? []).map((o, oi) => (
              <circle key={oi} cx={cx} cy={y(o)} r={2.6} fill={color} stroke="none" opacity={0.7} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ heatmap */

function Heatmap({ spec }: { spec: ChartSpec }) {
  const m = spec.matrix;
  if (!m) return null;
  const palette = paletteColors(spec);
  const base = palette[0];
  const cells = m.cells;
  const rows = m.rowLabels.length;
  const cols = m.colLabels.length;
  const labelW = 110;
  const topH = 26;
  const cell = Math.min(Math.floor((W - labelW - 12) / Math.max(cols, 1)), 46);
  const H = topH + rows * cell + 8;
  const flat = cells.flat();
  const lo = Math.min(...flat);
  const hi = Math.max(...flat);
  const t = (v: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));
  const shade = (v: number) => mixColor("#f8fafc", base, 0.12 + 0.82 * t(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={spec.title ?? "heatmap"}>
      {m.colLabels.map((c, j) => (
        <text key={c} x={labelW + cell * (j + 0.5)} y={16} textAnchor="middle" fontSize={11} fill="var(--dv-ink-2)" fontWeight={600}>
          {c}
        </text>
      ))}
      {m.rowLabels.map((r, i) => (
        <text key={r} x={labelW - 8} y={topH + cell * (i + 0.5) + 4} textAnchor="end" fontSize={11} fill="var(--dv-ink-2)" fontWeight={600}>
          {r}
        </text>
      ))}
      {cells.map((row, i) =>
        row.map((v, j) => {
          const dark = t(v) > 0.52;
          return (
            <g key={`${i}-${j}`}>
              <rect x={labelW + cell * j} y={topH + cell * i} width={cell - 2} height={cell - 2} rx={3} fill={shade(v)}>
                <title>{`${m.rowLabels[i]} × ${m.colLabels[j]}: ${fmt(v)}`}</title>
              </rect>
              <text
                x={labelW + cell * (j + 0.5) - 1}
                y={topH + cell * (i + 0.5) + 4}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={650}
                fill={dark ? "#ffffff" : "#334155"}
              >
                {fmt(v)}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

function mixColor(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const pc = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${pc.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ------------------------------------------------------------------ renderer */

export function ChartRenderer({ spec, className }: { spec: ChartSpec; className?: string }) {
  const wrapped = (
    <figure className={cn("w-full", className)}>
      {spec.title ? (
        <figcaption className="mb-1 text-center text-sm font-semibold text-ink">{spec.title}</figcaption>
      ) : null}
      {/* Mobile chart viewport — keeps axis text readable, pans when the
          plot is wider than the card (WCAG 1.4.10 reflow). */}
      <div className="dv-chart-scroll">
        <ChartBody spec={spec} />
      </div>
      {spec.showLegend !== false && (spec.series?.length ?? 0) > 1 ? (
        <Legend names={(spec.series ?? []).map((s) => s.name)} colors={(spec.series ?? []).map((s, i) => s.color ?? paletteColors(spec)[i % paletteColors(spec).length])} />
      ) : null}
      {spec.caption ? <p className="pt-2 text-center text-xs leading-relaxed text-ink-3">{spec.caption}</p> : null}
    </figure>
  );
  return wrapped;
}

function ChartBody({ spec }: { spec: ChartSpec }) {
  switch (spec.type as ChartType) {
    case "bar":
    case "grouped-bar":
    case "stacked-bar":
      return <BarChart spec={spec} />;
    case "line":
      return <LineChart spec={spec} />;
    case "area":
      return <LineChart spec={spec} area />;
    case "scatter":
      return <ScatterPlot spec={spec} />;
    case "histogram":
      return <Histogram spec={spec} />;
    case "pie":
      return <PieChart spec={spec} />;
    case "box":
      return <BoxPlot spec={spec} />;
    case "heatmap":
      return <Heatmap spec={spec} />;
    default:
      return null;
  }
}
