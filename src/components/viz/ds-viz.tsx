"use client";

/**
 * ds-viz.tsx — the Data Science collection:
 *
 *   DataTableViz          sort, filter, per-column stats on real records
 *   DataFrameViz          pandas-style preview: dtypes, head/tail, describe()
 *   ArrayViz              NumPy arrays: shape, indexing, slicing, reshape
 *   BroadcastingViz       the NumPy rule engine, dimension by dimension
 *   AlgorithmViz          sorting algorithms, step-by-step with counters
 *   DecisionBoundaryViz   real k-NN / logistic training on 2-D datasets
 *   ConfusionMatrixViz    threshold sweep, metrics, ROC + AUC
 *   FeatureImportanceViz  permutation importance, computed for real
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  C,
  CLASS_A,
  CLASS_B,
  Legend,
  Plane,
  Readouts,
  Seg,
  ToggleChip,
  VizButton,
  VizCard,
  VizSlider,
  fmtNum,
} from "./core";
import {
  mean,
  mulberry32,
  sd,
  quantile,
  binCounts,
  type Rng,
} from "@/lib/viz/stats";
import {
  confusionAt,
  generateDataset,
  generateFeatureTable,
  generateScores,
  knnGrid,
  knnClassify,
  logisticGrid,
  metricsFrom,
  permutationImportance,
  rocAuc,
  rocCurve,
  standardize,
  trainLogistic,
  trainTestSplit,
  type DatasetKind,
  type Metric,
  type Pt,
} from "@/lib/viz/ml";
import { broadcastShapes, formatShape } from "@/lib/numpycourse/vizlogic";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared sample datasets (tabular)
// ---------------------------------------------------------------------------

type ColType = "numeric" | "categorical";

interface TabCol {
  name: string;
  type: ColType;
  values: Array<string | number>;
}

interface TabSet {
  id: string;
  label: string;
  blurb: string;
  cols: TabCol[];
}

const STUDENTS: TabSet = {
  id: "students",
  label: "Students (n = 24)",
  blurb: "Study hours, attendance, prior grade and final exam outcome.",
  cols: [
    { name: "student", type: "categorical", values: ["Aisha", "Bruno", "Chen", "Dora", "Emil", "Farah", "Gustav", "Hana", "Igor", "Julia", "Kwame", "Lena", "Marco", "Nadia", "Omar", "Pia", "Quinn", "Rosa", "Sven", "Tara", "Ugo", "Vera", "Wes", "Xiu"] },
    { name: "hours", type: "numeric", values: [12, 8, 15, 3, 10, 14, 6, 16, 4, 11, 9, 13, 2, 17, 7, 12, 5, 15, 3, 10, 8, 14, 6, 11] },
    { name: "attendance", type: "numeric", values: [92, 78, 96, 55, 84, 90, 70, 98, 60, 88, 81, 93, 45, 97, 74, 89, 65, 95, 52, 85, 79, 91, 72, 86] },
    { name: "prior", type: "numeric", values: [71, 62, 84, 48, 66, 79, 58, 88, 52, 70, 64, 76, 44, 90, 60, 72, 55, 83, 47, 68, 63, 78, 59, 69] },
    { name: "outcome", type: "categorical", values: ["pass", "pass", "pass", "fail", "pass", "pass", "fail", "pass", "fail", "pass", "pass", "pass", "fail", "pass", "fail", "pass", "fail", "pass", "fail", "pass", "pass", "pass", "fail", "pass"] },
  ],
};

const HOUSING: TabSet = {
  id: "housing",
  label: "Flats (n = 18)",
  blurb: "Size, rooms, floor, distance to centre, monthly rent.",
  cols: [
    { name: "flat", type: "categorical", values: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "D3", "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2"] },
    { name: "m2", type: "numeric", values: [28, 35, 42, 55, 68, 31, 44, 58, 72, 85, 33, 47, 61, 76, 39, 52, 66, 90] },
    { name: "rooms", type: "numeric", values: [1, 1, 2, 2, 3, 1, 2, 2, 3, 4, 1, 2, 2, 3, 2, 2, 3, 4] },
    { name: "dist_km", type: "numeric", values: [3.2, 2.1, 4.8, 1.5, 6.3, 5.1, 2.9, 3.7, 7.4, 8.2, 1.8, 4.4, 2.6, 6.8, 3.9, 5.5, 7.1, 9.3] },
    { name: "rent", type: "numeric", values: [520, 610, 660, 890, 950, 580, 700, 910, 1120, 1290, 640, 780, 860, 1050, 720, 870, 1010, 1380] },
    { name: "district", type: "categorical", values: ["north", "centre", "south", "centre", "east", "east", "centre", "south", "east", "north", "centre", "south", "north", "east", "south", "north", "east", "north"] },
  ],
};

const PENGUINS: TabSet = {
  id: "penguins",
  label: "Penguins (n = 20)",
  blurb: "A small slice of the classic size-measurement dataset, with two missing values.",
  cols: [
    { name: "id", type: "numeric", values: Array.from({ length: 20 }, (_, i) => i + 1) },
    { name: "species", type: "categorical", values: ["Adelie", "Adelie", "Adelie", "Adelie", "Adelie", "Adelie", "Adelie", "Chinstrap", "Chinstrap", "Chinstrap", "Chinstrap", "Chinstrap", "Gentoo", "Gentoo", "Gentoo", "Gentoo", "Gentoo", "Gentoo", "Gentoo", "Gentoo"] },
    { name: "bill_mm", type: "numeric", values: [39.1, 39.5, 40.3, NaN, 36.7, 39.3, 38.9, 46.5, 50.2, 48.7, 50.6, 46.6, 46.1, 50.0, 48.7, 50.5, 47.6, 46.5, 45.9, NaN] },
    { name: "mass_g", type: "numeric", values: [3750, 3800, 3250, NaN, 3450, 3650, 3625, 4500, 5700, 4450, 5400, 4800, 4500, 5000, 4750, 5200, 4600, 4350, 4150, 4800] },
    { name: "flipper_mm", type: "numeric", values: [181, 186, 195, 193, 180, 190, 181, 192, 196, 197, 201, 193, 210, 216, 214, 215, 212, 213, 210, 208] },
  ],
};

const TAB_SETS = [STUDENTS, HOUSING, PENGUINS];

// ===========================================================================
// 24. Data table
// ===========================================================================

export function DataTableViz() {
  const [setId, setSetId] = useState(STUDENTS.id);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const [statCol, setStatCol] = useState<string | null>(null);
  const ds = TAB_SETS.find((d) => d.id === setId) ?? STUDENTS;
  const n = ds.cols[0].values.length;

  const rows = useMemo(() => {
    let idx = Array.from({ length: n }, (_, i) => i);
    const q = filter.trim().toLowerCase();
    if (q) {
      idx = idx.filter((i) => ds.cols.some((c) => String(c.values[i]).toLowerCase().includes(q)));
    }
    if (sortCol) {
      const col = ds.cols.find((c) => c.name === sortCol);
      if (col) {
        idx = [...idx].sort((a, b) => {
          const va = col.values[a];
          const vb = col.values[b];
          const cmp = col.type === "numeric" ? Number(va) - Number(vb) : String(va).localeCompare(String(vb));
          return sortAsc ? cmp : -cmp;
        });
      }
    }
    return idx;
  }, [ds, filter, sortCol, sortAsc, n]);

  const colStats = (col: TabCol) => {
    if (col.type === "numeric") {
      const vals = col.values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      const sorted = [...vals].sort((a, b) => a - b);
      return `min ${fmtNum(sorted[0], 1)} · mean ${fmtNum(mean(vals), 1)} · median ${fmtNum(quantile(sorted, 0.5), 1)} · max ${fmtNum(sorted[sorted.length - 1], 1)} · sd ${fmtNum(sd(vals), 1)} · missing ${col.values.length - vals.length}`;
    }
    const counts = new Map<string, number>();
    col.values.forEach((v) => counts.set(String(v), (counts.get(String(v)) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return `${counts.size} categories · top: ${top[0][0]} (${top[0][1]}) · missing 0`;
  };

  return (
    <VizCard
      title="Data tables: sort, filter, profile"
      subtitle="A table is data plus structure. Click a header to sort, type to filter, and open a column profile to see its summary statistics — all computed live."
      domain="ds"
      explanation={
        <>
          Numeric columns carry a distribution (mean, median, spread, missing values); categorical columns carry a
          count of levels and a mode. Profiling columns <em>before</em> modelling is half of practical data science:
          the missing-value counts in the penguins set would already tell you to plan around NaNs.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {TAB_SETS.map((d) => (
              <button
                key={d.id}
                type="button"
                title={d.blurb}
                onClick={() => { setSetId(d.id); setSortCol(null); setFilter(""); setStatCol(null); }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  setId === d.id ? "border-viz-4/60 bg-viz-4/10 text-viz-4" : "border-border-subtle text-ink-3 hover:text-ink",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${n} rows by any value…`}
            className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface-inset px-3 py-1.5 text-xs text-ink placeholder:text-ink-3 focus:border-viz-4/50 focus:outline-none"
          />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Columns", value: String(ds.cols.length) },
            { label: "Rows total", value: String(n) },
            { label: "Rows matching", value: String(rows.length) },
            { label: "Sorted by", value: sortCol ? `${sortCol} (${sortAsc ? "↑" : "↓"})` : "row order", mono: false },
          ]}
        />
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-inset">
              {ds.cols.map((c) => (
                <th key={c.name} className="px-3 py-2 align-bottom">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortCol === c.name) setSortAsc((v) => !v);
                        else {
                          setSortCol(c.name);
                          setSortAsc(true);
                        }
                      }}
                      className="text-[11px] font-bold uppercase tracking-wider text-ink hover:text-ink-2"
                    >
                      {c.name} {sortCol === c.name ? (sortAsc ? "↑" : "↓") : ""}
                    </button>
                    <span
                      className={cn(
                        "rounded px-1 py-px text-[9px] font-bold uppercase",
                        c.type === "numeric" ? "bg-viz-5/15 text-viz-5" : "bg-viz-3/15 text-viz-3",
                      )}
                    >
                      {c.type === "numeric" ? "num" : "cat"}
                    </span>
                    <button
                      type="button"
                      title="column profile"
                      onClick={() => setStatCol(statCol === c.name ? null : c.name)}
                      className={cn(
                        "ml-auto rounded px-1 text-[10px] font-bold",
                        statCol === c.name ? "text-viz-4" : "text-ink-3 hover:text-ink",
                      )}
                    >
                      ⓘ
                    </button>
                  </div>
                </th>
              ))}
            </tr>
            {statCol && (
              <tr className="border-b border-border-subtle bg-viz-4/5">
                <td colSpan={ds.cols.length} className="px-3 py-2 font-mono text-[11px] text-ink-2">
                  <strong className="text-viz-4">{statCol}:</strong> {colStats(ds.cols.find((c) => c.name === statCol)!)}
                </td>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-inset">
                {ds.cols.map((c) => (
                  <td key={c.name} className={cn("px-3 py-1.5 text-[12px]", c.type === "numeric" ? "font-mono tabular text-ink" : "text-ink-2")}>
                    {typeof c.values[r] === "number" && Number.isNaN(c.values[r] as number) ? (
                      <span className="rounded bg-warning-bg px-1.5 py-px font-mono text-[10.5px] font-bold text-warning-text">NaN</span>
                    ) : (
                      String(c.values[r])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={ds.cols.length} className="px-3 py-6 text-center text-xs text-ink-3">
                  no rows match &ldquo;{filter}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </VizCard>
  );
}

// ===========================================================================
// 25. DataFrame preview (pandas-style)
// ===========================================================================

export function DataFrameViz() {
  const [setId, setSetId] = useState(PENGUINS.id);
  const [headN, setHeadN] = useState(5);
  const [showTail, setShowTail] = useState(false);
  const [panel, setPanel] = useState<"describe" | "dtypes" | "missing">("describe");
  const ds = TAB_SETS.find((d) => d.id === setId) ?? PENGUINS;
  const n = ds.cols[0].values.length;
  const shown = useMemo(() => {
    if (!showTail) return Array.from({ length: Math.min(headN, n) }, (_, i) => i);
    return Array.from({ length: Math.min(headN, n) }, (_, i) => n - Math.min(headN, n) + i);
  }, [showTail, headN, n]);

  const dtypeOf = (c: TabCol): string => {
    if (c.type === "categorical") return "object";
    const hasNaN = c.values.some((v) => typeof v === "number" && Number.isNaN(v));
    const allInt = c.values.every((v) => typeof v !== "number" || Number.isNaN(v) || Number.isInteger(v));
    return allInt && !hasNaN ? "int64" : "float64";
  };

  return (
    <VizCard
      title="DataFrame preview — the pandas mental model"
      subtitle="shape, dtypes, head()/tail() and describe(), exactly as a notebook would render them — computed from the same data."
      domain="ds"
      explanation={
        <>
          <code className="rounded bg-surface-inset px-1">df.shape</code> is (rows, columns).{" "}
          <code className="rounded bg-surface-inset px-1">describe()</code> reports count, mean, std, min, quartiles
          and max per numeric column — notice count drops where NaN lives. dtypes leak the future: pandas stores
          integers only if a column has no missing value; one NaN turns the whole column float64.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {TAB_SETS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setSetId(d.id); setShowTail(false); }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  setId === d.id ? "border-viz-4/60 bg-viz-4/10 text-viz-4" : "border-border-subtle text-ink-3 hover:text-ink",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <VizSlider label={`rows in df.${showTail ? "tail" : "head"}()`} value={headN} min={3} max={10} step={1} onChange={setHeadN} format={(v) => String(v)} />
            <ToggleChip active={showTail} onClick={() => setShowTail((v) => !v)}>{showTail ? "tail(n)" : "head(n)"}</ToggleChip>
          </div>
          <Seg
            value={panel}
            onChange={(v) => setPanel(v)}
            options={[
              { value: "describe" as const, label: "describe()" },
              { value: "dtypes" as const, label: "dtypes" },
              { value: "missing" as const, label: "isna().sum()" },
            ]}
          />
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl bg-surface-inset px-4 py-2.5 font-mono text-[11.5px] text-ink-2">
          <span>&gt;&gt;&gt; df.shape</span>
          <span className="font-bold text-ink">({n}, {ds.cols.length})</span>
          <span className="opacity-40">|</span>
          <span>&gt;&gt;&gt; df.columns.tolist()</span>
          <span className="font-bold text-ink">[{ds.cols.map((c) => `'${c.name}'`).join(", ")}]</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-inset">
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">index</th>
                {ds.cols.map((c) => (
                  <th key={c.name} className="px-3 py-2 text-[11px] font-bold text-ink">
                    {c.name}
                    <span className="ml-1.5 font-mono text-[9.5px] font-normal text-ink-3">{dtypeOf(c)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r} className="border-b border-border-subtle/50 last:border-b-0">
                  <td className="px-3 py-1.5 font-mono text-[11px] tabular text-ink-3">{r}</td>
                  {ds.cols.map((c) => (
                    <td key={c.name} className="px-3 py-1.5 font-mono text-[12px] tabular text-ink">
                      {typeof c.values[r] === "number" && Number.isNaN(c.values[r] as number) ? (
                        <span className="rounded bg-warning-bg px-1.5 py-px text-[10.5px] font-bold text-warning-text">NaN</span>
                      ) : (
                        String(c.values[r])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {panel === "describe" && (
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-inset">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">describe()</th>
                  {ds.cols.filter((c) => c.type === "numeric").map((c) => (
                    <th key={c.name} className="px-3 py-2 font-mono text-[11px] font-bold text-ink">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["count", (v: number[]) => String(v.length)],
                    ["mean", (v: number[]) => fmtNum(mean(v), 3)],
                    ["std", (v: number[]) => fmtNum(sd(v), 3)],
                    ["min", (v: number[]) => fmtNum(Math.min(...v), 3)],
                    ["25%", (v: number[]) => fmtNum(quantile([...v].sort((a, b) => a - b), 0.25), 3)],
                    ["50%", (v: number[]) => fmtNum(quantile([...v].sort((a, b) => a - b), 0.5), 3)],
                    ["75%", (v: number[]) => fmtNum(quantile([...v].sort((a, b) => a - b), 0.75), 3)],
                    ["max", (v: number[]) => fmtNum(Math.max(...v), 3)],
                  ] as Array<[string, (v: number[]) => string]>
                ).map(([stat, fn]) => (
                  <tr key={stat} className="border-b border-border-subtle/50 last:border-b-0">
                    <td className="px-3 py-1.5 font-mono text-[11px] font-semibold text-ink-3">{stat}</td>
                    {ds.cols.filter((c) => c.type === "numeric").map((c) => {
                      const vals = c.values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
                      return (
                        <td key={c.name} className="px-3 py-1.5 font-mono text-[12px] tabular text-ink">
                          {vals.length ? fn(vals) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {panel === "dtypes" && (
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-inset">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">column</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">dtype</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">why</th>
                </tr>
              </thead>
              <tbody>
                {ds.cols.map((c) => (
                  <tr key={c.name} className="border-b border-border-subtle/50 last:border-b-0">
                    <td className="px-3 py-1.5 font-mono text-[12px] text-ink">{c.name}</td>
                    <td className="px-3 py-1.5 font-mono text-[12px] font-bold" style={{ color: c.type === "numeric" ? "#0E8FA8" : "#B45309" }}>{dtypeOf(c)}</td>
                    <td className="px-3 py-1.5 text-[11.5px] text-ink-3">
                      {c.type === "categorical"
                        ? "text values → object (strings)"
                        : c.values.some((v) => typeof v === "number" && Number.isNaN(v))
                          ? "missing values force float64"
                          : "all integers, none missing → int64"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {panel === "missing" && (
          <div className="rounded-xl border border-border-subtle p-4">
            <p className="mb-3 font-mono text-[11.5px] text-ink-3">&gt;&gt;&gt; df.isna().sum()</p>
            {ds.cols.map((c) => {
              const miss = c.values.filter((v) => typeof v === "number" && Number.isNaN(v)).length;
              const frac = miss / n;
              return (
                <div key={c.name} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between font-mono text-[11.5px]">
                    <span className="text-ink">{c.name}</span>
                    <span className={miss ? "font-bold text-warning-text" : "text-ink-3"}>{miss}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-surface-inset">
                    <div className="h-1.5 rounded-full bg-warning-border" style={{ width: `${frac * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VizCard>
  );
}

// ===========================================================================
// 26. NumPy arrays
// ===========================================================================

type ArrayMode = "1d" | "2d" | "3d";

export function ArrayViz() {
  const [mode, setMode] = useState<ArrayMode>("2d");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [depth, setDepth] = useState(2);
  const [sel, setSel] = useState<[number, number, number]>([1, 1, 0]);
  const [slice, setSlice] = useState<"none" | "row" | "col" | "step" | "reverse">("none");

  const size = mode === "1d" ? rows : mode === "2d" ? rows * cols : rows * cols * depth;
  const values = useMemo(() => Array.from({ length: size }, (_, i) => (i * 7) % 23 + 1), [size]);

  const shape = mode === "1d" ? [rows] : mode === "2d" ? [rows, cols] : [depth, rows, cols];
  const at = (d: number, r: number, c: number): number =>
    mode === "1d" ? values[r] : mode === "2d" ? values[r * cols + c] : values[d * rows * cols + r * cols + c];

  const selValid: [number, number, number] = [
    Math.min(sel[0], (mode === "3d" ? depth : 1) - 1),
    Math.min(sel[1], rows - 1),
    Math.min(sel[2], (mode === "1d" ? 1 : cols) - 1),
  ];
  const selValue = mode === "1d" ? at(0, selValid[1], 0) : at(selValid[0], selValid[1], selValid[2]);

  const cellCls = (hi: boolean, dim: boolean) =>
    cn(
      "flex h-9 items-center justify-center rounded-md border font-mono text-[12px] tabular transition-colors",
      hi ? "border-viz-5 bg-viz-5/20 font-bold text-ink" : "border-border-subtle bg-surface-inset text-ink-2",
      dim && "opacity-35",
    );

  const inSlice = (d: number, r: number, c: number): boolean => {
    switch (slice) {
      case "none": return false;
      case "row": return mode === "1d" ? r % 2 === 1 : r === selValid[1] && (mode !== "3d" || d === selValid[0]);
      case "col": return c === selValid[2] && (mode !== "3d" || d === selValid[0]);
      case "step": return mode === "1d" ? r % 2 === 0 : (mode === "2d" || d === selValid[0]) && r % 2 === 0 && c % 2 === 1;
      case "reverse": return mode === "1d" ? r >= rows - 2 : (mode === "2d" || d === selValid[0]) && c >= cols - 2;
    }
  };

  const sliceExpr =
    slice === "none" ? "" :
    slice === "row" ? (mode === "1d" ? "a[1::2]" : `a[${selValid[1]}]`) :
    slice === "col" ? `a[:, ${selValid[2]}]` :
    slice === "step" ? (mode === "1d" ? "a[::2]" : "a[::2, 1::2]") :
    "a[..., -2:]";

  const sliceShape = (): string => {
    if (slice === "none") return "";
    if (mode === "1d") {
      if (slice === "row" || slice === "step") return `(${Math.ceil((slice === "row" ? rows - 1 : rows) / 2)},)`;
      return `(2,)`;
    }
    const lead = mode === "3d" ? `${depth}, ` : "";
    switch (slice) {
      case "row": return `(${cols},)`;
      case "col": return mode === "3d" ? `(${depth}, ${rows})` : `(${rows},)`;
      case "step": return `(${lead}${Math.ceil(rows / 2)}, ${Math.floor((cols - 1) / 2)})`;
      default: return `(${lead}${rows}, 2)`;
    }
  };

  return (
    <VizCard
      title="Arrays: shape, indexing, slicing"
      subtitle="An ndarray is one block of numbers plus a shape. Pick a shape, pick an index, and watch exactly which element lights up."
      domain="ds"
      explanation={
        <>
          NumPy stores values in one flat, row-major buffer; the shape decides how indices map onto it. Indexing{" "}
          <code className="rounded bg-surface-inset px-1">a[d, r, c]</code> is arithmetic on the buffer — no lookup
          tables. Slices like <code className="rounded bg-surface-inset px-1">a[:, 2]</code> or{" "}
          <code className="rounded bg-surface-inset px-1">a[::2, 1::2]</code> are <em>views</em>, not copies: they
          select without moving data. Every highlighted cell below is computed from the flat buffer by exactly that
          arithmetic.
        </>
      }
      controls={
        <>
          <Seg
            value={mode}
            onChange={(v) => { setMode(v); setSlice("none"); setSel([0, 0, 0]); }}
            options={[
              { value: "1d" as ArrayMode, label: "1-D" },
              { value: "2d" as ArrayMode, label: "2-D" },
              { value: "3d" as ArrayMode, label: "3-D" },
            ]}
          />
          <div className="flex flex-wrap gap-4">
            <VizSlider label="rows (axis −2)" value={rows} min={2} max={6} step={1} onChange={setRows} format={(v) => String(v)} />
            {mode !== "1d" && <VizSlider label="cols (axis −1)" value={cols} min={2} max={6} step={1} onChange={setCols} format={(v) => String(v)} />}
            {mode === "3d" && <VizSlider label="depth (axis 0)" value={depth} min={2} max={3} step={1} onChange={setDepth} format={(v) => String(v)} />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">slice demo:</span>
            {(
              [
                ["none", "off"],
                ["row", mode === "1d" ? "a[1::2]" : "one row"],
                ["col", mode === "1d" ? "a[::2]" : "one column"],
                ["step", mode === "1d" ? "a[::2]" : "a[::2, 1::2]"],
                ["reverse", mode === "1d" ? "a[-2:]" : "a[..., -2:]"],
              ] as Array<[typeof slice, string]>
            ).map(([s, lbl]) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlice(s)}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors",
                  slice === s ? "border-viz-5/60 bg-viz-5/10 text-viz-5" : "border-border-subtle text-ink-3 hover:text-ink",
                )}
              >
                {lbl}
              </button>
            ))}
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "a.shape", value: `(${shape.join(", ")})`, tone: "accent" },
            { label: "a.size", value: String(size) },
            { label: "a.dtype", value: "int64" },
            { label: mode === "1d" ? `a[${selValid[1]}] =` : `a[${selValid[0]}, ${selValid[1]}, ${selValid[2]}] =`, value: String(selValue), tone: "good" },
          ]}
        />
      }
      footer={
        slice !== "none" && (
          <div className="border-t border-border-subtle bg-surface-inset px-5 py-3 font-mono text-[12px] text-ink-2">
            <span className="font-bold text-viz-5">{sliceExpr}</span> → shape {sliceShape()}
            <span className="ml-2 text-ink-3">(highlighted cells; a view, not a copy)</span>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {mode === "3d" &&
            Array.from({ length: depth }, (_, d) => (
              <div key={d}>
                <p className="mb-1.5 text-center font-mono text-[10.5px] font-bold text-ink-3">a[{d}]</p>
                <ArrayGrid
                  rows={rows}
                  cols={cols}
                  render={(r, c) => (
                    <button
                      type="button"
                      className={cellCls(d === selValid[0] && r === selValid[1] && c === selValid[2], !inSlice(d, r, c) && slice !== "none")}
                      onClick={() => setSel([d, r, c])}
                    >
                      {at(d, r, c)}
                    </button>
                  )}
                />
              </div>
            ))}
          {mode === "2d" && (
            <ArrayGrid
              rows={rows}
              cols={cols}
              render={(r, c) => (
                <button
                  type="button"
                  className={cellCls(r === selValid[1] && c === selValid[2], !inSlice(0, r, c) && slice !== "none")}
                  onClick={() => setSel([0, r, c])}
                >
                  {at(0, r, c)}
                </button>
              )}
            />
          )}
          {mode === "1d" && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: rows }, (_, r) => (
                <button
                  key={r}
                  type="button"
                  className={cn(cellCls(r === selValid[1], !inSlice(0, r, 0) && slice !== "none"), "w-11")}
                  onClick={() => setSel([0, r, 0])}
                >
                  {at(0, r, 0)}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="font-mono text-[11.5px] text-ink-3">
          values: [{values.slice(0, 12).join(", ")}{values.length > 12 ? ", …" : ""}] — one flat buffer,{" "}
          {mode === "1d" ? "" : "row-major, "}viewed as {formatShape(shape)}
        </p>
      </div>
    </VizCard>
  );
}

function ArrayGrid({ rows, cols, render }: { rows: number; cols: number; render: (r: number, c: number) => React.ReactNode }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.25rem, 1fr))` }}>
      {Array.from({ length: rows * cols }, (_, i) => render(Math.floor(i / cols), i % cols))}
    </div>
  );
}

// ===========================================================================
// 27. Broadcasting
// ===========================================================================

const B_PRESETS: Array<{ a: number[]; b: number[]; label: string; note: string }> = [
  { a: [3, 1], b: [1, 4], label: "(3,1) + (1,4)", note: "the outer-product classic — both expand" },
  { a: [256, 8], b: [8], label: "(256,8) + (8,)", note: "adding a bias vector to a batch" },
  { a: [64, 1, 32], b: [32], label: "(64,1,32) + (32,)", note: "the transformer scaling pattern" },
  { a: [3, 4], b: [2], label: "(3,4) + (2,)", note: "incompatible — the classic error" },
];

function DimRow({ shape, vals, tone, label }: { shape: number[]; vals: number[]; tone: string; label: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-bold" style={{ color: tone }}>{label}</span>
        {shape.map((d, i) => (
          <span
            key={i}
            className="rounded-md border px-2 py-0.5 font-mono text-[12px] font-bold text-ink"
            style={{ borderColor: tone }}
          >
            {d}
          </span>
        ))}
        <span className="font-mono text-[11px] text-ink-3">{formatShape(shape)}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {vals.slice(0, 16).map((v, i) => (
          <span key={i} className="rounded bg-surface-inset px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2">{v}</span>
        ))}
        {vals.length > 16 && <span className="font-mono text-[10.5px] text-ink-3">…</span>}
      </div>
    </div>
  );
}

export function BroadcastingViz() {
  const [preset, setPreset] = useState(0);
  const [aShape, setAShape] = useState<number[]>(B_PRESETS[0].a);
  const [bShape, setBShape] = useState<number[]>(B_PRESETS[0].b);
  const result = useMemo(() => broadcastShapes(aShape, bShape), [aShape, bShape]);

  // element values for the concrete arithmetic demo
  const aVals = useMemo(() => seededValues(aShape, 7), [aShape]);
  const bVals = useMemo(() => seededValues(bShape, 3), [bShape]);

  return (
    <VizCard
      title="Broadcasting: NumPy&rsquo;s shape rule"
      subtitle="Align shapes from the right; each dimension must match or be 1 (which stretches). Get the verdict — and the exact arithmetic — for any pair."
      domain="ds"
      explanation={
        <>
          Broadcasting lets arrays of different shapes cooperate without copying data. The engine walks both shapes
          right-to-left: equal sizes pass; a 1 stretches to the other size; anything else fails with a precise
          reason. Try the incompatible preset to meet the error message you will see a hundred times in practice.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {B_PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                title={p.note}
                onClick={() => {
                  setPreset(i);
                  setAShape([...p.a]);
                  setBShape([...p.b]);
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors",
                  preset === i ? "border-viz-5/60 bg-viz-5/10 text-viz-5" : "border-border-subtle text-ink-3 hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <ShapeSteppers label="shape of A" shape={aShape} tone={C.cyan} onChange={setAShape} />
          <ShapeSteppers label="shape of B" shape={bShape} tone={C.rose} onChange={setBShape} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "A shape", value: formatShape(aShape) },
            { label: "B shape", value: formatShape(bShape) },
            {
              label: "A + B shape",
              value: result.ok && result.result ? formatShape(result.result) : "ERROR",
              tone: result.ok ? "accent" : "bad",
            },
            { label: "Verdict", value: result.ok ? "broadcastable" : "incompatible", mono: false, tone: result.ok ? "good" : "bad" },
          ]}
        />
      }
      footer={
        <div className="border-t border-border-subtle bg-surface-inset px-5 py-3.5 font-mono text-[12px] leading-relaxed text-ink-2">
          {result.ok ? (
            <>
              <span className="text-ink-3">np.add(</span>
              <span style={{ color: C.cyan }}>A{formatShape(aShape)}</span>, <span style={{ color: C.rose }}>B{formatShape(bShape)}</span>
              <span className="text-ink-3">) → </span>
              <span className="font-bold text-ink">{result.result ? formatShape(result.result) : ""}</span>
              <div className="mt-2 text-[11.5px] text-ink-3">
                sample: A[0]={aVals[0]} + B[0]={bVals[0]} = {aVals[0] + bVals[0]} · A[{Math.min(1, aVals.length - 1)}]={aVals[Math.min(1, aVals.length - 1)]} + B[{Math.min(1, bVals.length - 1)}]={bVals[Math.min(1, bVals.length - 1)]} = {aVals[Math.min(1, aVals.length - 1)] + bVals[Math.min(1, bVals.length - 1)]}
              </div>
            </>
          ) : (
            <span className="text-danger-text">ValueError: operands could not be broadcast together with shapes {formatShape(aShape)} {formatShape(bShape)} — {result.reason ?? "dimensions must match or be 1"}</span>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <DimRow shape={aShape} vals={aVals} tone={C.cyan} label="A" />
        <DimRow shape={bShape} vals={bVals} tone={C.rose} label="B" />
        {/* dimension-by-dimension verdict */}
        <div className="rounded-xl border border-border-subtle p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">Rule engine, right to left</p>
          <div className="space-y-1.5">
            {alignShapes(aShape, bShape).map(([da, db, i], k) => {
              const ok = da === db || da === 1 || db === 1;
              const stretched = da !== db;
              return (
                <div key={k} className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
                  <span className="w-16 text-ink-3">dim −{i + 1}</span>
                  <span className="rounded border px-1.5" style={{ borderColor: C.cyan, color: C.cyan }}>{da}</span>
                  <span className={ok ? "text-ink-3" : "font-bold text-danger-text"}>{ok ? "↔" : "✗"}</span>
                  <span className="rounded border px-1.5" style={{ borderColor: C.rose, color: C.rose }}>{db}</span>
                  {ok ? (
                    <span className="text-ink-2">
                      {stretched ? `1 stretches to ${Math.max(da, db)}` : "sizes match"}
                    </span>
                  ) : (
                    <span className="font-semibold text-danger-text">3 vs 4 — must match or be 1</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VizCard>
  );
}

function ShapeSteppers({ label, shape, tone, onChange }: { label: string; shape: number[]; tone: string; onChange: (s: number[]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</span>
      <button
        type="button"
        onClick={() => shape.length < 3 && onChange([1, ...shape])}
        className="rounded-md border border-border-subtle px-1.5 py-0.5 text-[11px] font-bold text-ink-3 hover:text-ink"
        title="add a dimension"
      >
        +
      </button>
      {shape.map((d, i) => (
        <span key={i} className="inline-flex items-center overflow-hidden rounded-md border" style={{ borderColor: tone }}>
          <button type="button" className="px-1.5 py-0.5 text-[11px] font-bold hover:bg-surface-inset" style={{ color: tone }} onClick={() => onChange(shape.map((v, j) => (j === i ? Math.max(1, v - 1) : v)))}>
            −
          </button>
          <span className="w-8 text-center font-mono text-[12px] font-bold tabular text-ink">{d}</span>
          <button type="button" className="px-1.5 py-0.5 text-[11px] font-bold hover:bg-surface-inset" style={{ color: tone }} onClick={() => onChange(shape.map((v, j) => (j === i ? Math.min(9, v + 1) : v)))}>
            +
          </button>
        </span>
      ))}
      {shape.length > 0 && (
        <button
          type="button"
          onClick={() => onChange(shape.slice(1))}
          className="rounded-md border border-border-subtle px-1.5 py-0.5 text-[11px] font-bold text-ink-3 hover:text-ink"
          title="remove leading dimension"
        >
          −dim
        </button>
      )}
    </div>
  );
}

function alignShapes(a: number[], b: number[]): Array<[number, number, number]> {
  const len = Math.max(a.length, b.length);
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < len; i++) {
    const da = a[a.length - 1 - i] ?? 1;
    const db = b[b.length - 1 - i] ?? 1;
    out.push([da, db, i]);
  }
  return out;
}

function seededValues(shape: number[], seed: number): number[] {
  const rng = mulberry32(seed);
  const size = shape.reduce((s, v) => s * v, 1);
  return Array.from({ length: size }, () => Math.floor(rng() * 90) + 10);
}

// ===========================================================================
// 28. Algorithm diagrams — sorting, stepped
// ===========================================================================

type Algo = "bubble" | "insertion" | "selection" | "merge" | "quick";

interface SortStep {
  arr: number[];
  compare: [number, number] | null;
  write: number[] | null; // indices written this step
  sorted: number[]; // known-sorted indices
  line: number; // pseudocode line highlight
  note: string;
}

function buildSteps(algo: Algo, start: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...start];
  const push = (s: Omit<SortStep, "arr">) => steps.push({ ...s, arr: [...a] });
  push({ compare: null, write: null, sorted: [], line: 0, note: "start" });

  const bubble = () => {
    const n = a.length;
    const sorted: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        push({ compare: [j, j + 1], write: null, sorted: [...sorted], line: 1, note: `compare a[${j}] and a[${j + 1}]` });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          push({ compare: [j, j + 1], write: [j, j + 1], sorted: [...sorted], line: 2, note: "swap" });
        }
      }
      sorted.push(n - 1 - i);
      push({ compare: null, write: null, sorted: [...sorted], line: 3, note: `a[${n - 1 - i}] locked in place` });
    }
    push({ compare: null, write: null, sorted: a.map((_, i) => i), line: 4, note: "sorted" });
  };

  const insertion = () => {
    const sorted = [0];
    for (let i = 1; i < a.length; i++) {
      let j = i;
      push({ compare: [j, j - 1], write: null, sorted: [...sorted], line: 1, note: `take a[${i}] into the sorted prefix` });
      while (j > 0 && a[j - 1] > a[j]) {
        push({ compare: [j, j - 1], write: null, sorted: [...sorted], line: 2, note: `a[${j - 1}] > a[${j}] — shift right` });
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        push({ compare: null, write: [j, j - 1], sorted: [...sorted], line: 3, note: "shift" });
        j--;
      }
      sorted.push(i);
    }
    push({ compare: null, write: null, sorted: a.map((_, i) => i), line: 4, note: "sorted" });
  };

  const selection = () => {
    const sorted: number[] = [];
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        push({ compare: [j, min], write: null, sorted: [...sorted], line: 1, note: `compare a[${j}] with current min` });
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) {
        [a[i], a[min]] = [a[min], a[i]];
        push({ compare: null, write: [i, min], sorted: [...sorted], line: 2, note: "swap minimum to the front" });
      }
      sorted.push(i);
    }
    sorted.push(a.length - 1);
    push({ compare: null, write: null, sorted, line: 3, note: "sorted" });
  };

  const merge = () => {
    const buf = [...a];
    const msort = (lo: number, hi: number, depth: number) => {
      if (hi - lo < 2) return;
      const mid = (lo + hi) >> 1;
      msort(lo, mid, depth + 1);
      msort(mid, hi, depth + 1);
      let i = lo;
      let j = mid;
      let k = lo;
      while (i < mid && j < hi) {
        push({ compare: [i, j], write: null, sorted: [], line: 1, note: `merge halves (depth ${depth})` });
        buf[k++] = a[i] <= a[j] ? a[i++] : a[j++];
      }
      while (i < mid) buf[k++] = a[i++];
      while (j < hi) buf[k++] = a[j++];
      for (let t = lo; t < hi; t++) a[t] = buf[t];
      push({ compare: null, write: Array.from({ length: hi - lo }, (_, t) => lo + t), sorted: [], line: 2, note: "write merged run back" });
    };
    msort(0, a.length, 0);
    push({ compare: null, write: null, sorted: a.map((_, i) => i), line: 3, note: "sorted" });
  };

  const quick = () => {
    const qsort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const pivot = a[hi];
      push({ compare: null, write: [hi], sorted: [], line: 1, note: `pivot = a[${hi}] = ${pivot}` });
      let store = lo;
      for (let j = lo; j < hi; j++) {
        push({ compare: [j, hi], write: null, sorted: [], line: 2, note: `a[${j}] < pivot?` });
        if (a[j] < pivot) {
          [a[store], a[j]] = [a[j], a[store]];
          push({ compare: null, write: [store, j], sorted: [], line: 3, note: "move into the low side" });
          store++;
        }
      }
      [a[store], a[hi]] = [a[hi], a[store]];
      push({ compare: null, write: [store, hi], sorted: [], line: 4, note: "pivot lands at its final index" });
      qsort(lo, store - 1);
      qsort(store + 1, hi);
    };
    qsort(0, a.length - 1);
    push({ compare: null, write: null, sorted: a.map((_, i) => i), line: 5, note: "sorted" });
  };

  switch (algo) {
    case "bubble": bubble(); break;
    case "insertion": insertion(); break;
    case "selection": selection(); break;
    case "merge": merge(); break;
    case "quick": quick(); break;
  }
  return steps;
}

const PSEUDO: Record<Algo, string[]> = {
  bubble: ["for i in range(n):", "  if a[j] > a[j+1]:", "    swap(a[j], a[j+1])", "  # largest bubbled to the end", "return a"],
  insertion: ["for i in 1..n-1:", "  while j > 0 and a[j-1] > a[j]:", "    shift a[j-1] right", "insert the held value", "return a"],
  selection: ["for i in 0..n-2:", "  swap a[i] with the minimum of a[i:]", "# prefix is final", "return a"],
  merge: ["if len < 2: return", "compare heads of both halves", "copy the smaller back", "return a"],
  quick: ["pivot = a[hi]", "compare a[j] with pivot", "a[j] < pivot → move left", "place pivot at final index", "recurse both sides", "return a"],
};

const ALGO_COMPLEXITY: Record<Algo, string> = {
  bubble: "O(n²) compares — adjacent swaps only",
  insertion: "O(n²) worst, O(n) on nearly-sorted data",
  selection: "O(n²) compares, only n−1 swaps",
  merge: "O(n log n) always — but needs O(n) scratch",
  quick: "O(n log n) average, O(n²) worst — in place",
};

export function AlgorithmViz() {
  const [algo, setAlgo] = useState<Algo>("bubble");
  const [size, setSize] = useState(12);
  const [dist, setDist] = useState<"random" | "nearly" | "reversed" | "few">("random");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(12);
  const [seed, setSeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startArr = useMemo(() => {
    const rng = mulberry32(seed * 97 + size);
    let arr: number[];
    switch (dist) {
      case "random": arr = Array.from({ length: size }, () => Math.floor(rng() * 90) + 10); break;
      case "nearly": {
        arr = Array.from({ length: size }, (_, i) => 10 + Math.round((i / size) * 85));
        for (let k = 0; k < Math.max(1, Math.floor(size / 10)); k++) {
          const i = Math.floor(rng() * size);
          const j = Math.min(size - 1, i + 1 + Math.floor(rng() * 2));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        break;
      }
      case "reversed": arr = Array.from({ length: size }, (_, i) => 95 - Math.round((i / size) * 85)); break;
      default: {
        const buckets = [15, 38, 62, 85];
        arr = Array.from({ length: size }, () => buckets[Math.floor(rng() * 4)]);
      }
    }
    return arr;
  }, [seed, size, dist]);

  const steps = useMemo(() => buildSteps(algo, startArr), [algo, startArr]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const isDone = stepIdx >= steps.length - 1;

  /** A new trace means stepping restarts from zero. */
  const restartTrace = useCallback(() => {
    setStepIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || isDone) return;
    timerRef.current = setTimeout(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
      if (stepIdx + 1 >= steps.length - 1) setPlaying(false); // finished
    }, 1600 / speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, speed, steps.length, isDone]);

  const compares = steps.slice(0, stepIdx + 1).filter((s) => s.compare).length;
  const writes = steps.slice(0, stepIdx + 1).reduce((acc, s) => acc + (s.write?.length ? 1 : 0), 0);
  const maxVal = Math.max(...startArr);

  return (
    <VizCard
      title="Algorithm diagrams: sorting, one step at a time"
      subtitle="A real execution trace: play, pause, step and scrub. Compared indices glow amber; writes flash rose; the pseudocode tracks the current line."
      domain="ds"
      explanation={
        <>
          Every bar state you see was produced by running the actual algorithm on the array — not an animation
          artist&rsquo;s impression. The counters distinguish <strong>compares</strong> (reads) from{" "}
          <strong>writes</strong>: selection sort is compare-heavy but barely writes; merge sort writes constantly.
          Switch the input distribution — insertion sort is unbeatable on nearly-sorted data and embarrassing on
          reversed data.
        </>
      }
      controls={
        <>
          <Seg
            value={algo}
            onChange={(v) => {
              setAlgo(v);
              restartTrace();
            }}
            options={[
              { value: "bubble" as Algo, label: "Bubble" },
              { value: "insertion" as Algo, label: "Insertion" },
              { value: "selection" as Algo, label: "Selection" },
              { value: "merge" as Algo, label: "Merge" },
              { value: "quick" as Algo, label: "Quick" },
            ]}
          />
          <Seg
            value={dist}
            onChange={(v) => {
              setDist(v);
              restartTrace();
            }}
            options={[
              { value: "random" as const, label: "Random" },
              { value: "nearly" as const, label: "Nearly sorted" },
              { value: "reversed" as const, label: "Reversed" },
              { value: "few" as const, label: "Few unique" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <VizButton variant="primary" onClick={() => setPlaying((p) => !p)}>{playing ? "❚❚ Pause" : "▶ Play"}</VizButton>
            <VizButton onClick={() => { setPlaying(false); setStepIdx((i) => Math.min(i + 1, steps.length - 1)); }}>Step →</VizButton>
            <VizButton onClick={() => { setPlaying(false); setStepIdx(0); }}>↺ Restart</VizButton>
            <VizButton
              onClick={() => {
                setSeed((s) => s + 1);
                restartTrace();
              }}
            >
              New array
            </VizButton>
            <span className="text-[11px] text-ink-3">step {stepIdx} / {steps.length - 1}</span>
          </div>
          <VizSlider label="speed" value={speed} min={2} max={40} step={1} onChange={setSpeed} format={(v) => `${v}×`} />
          <VizSlider
            label="array size n"
            value={size}
            min={6}
            max={28}
            step={1}
            onChange={(v) => {
              setSize(v);
              restartTrace();
            }}
            format={(v) => String(v)}
          />
          <label className="flex items-center gap-3 text-xs font-medium text-ink-2">
            <span className="w-32 shrink-0 text-ink-3">scrub steps</span>
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={Math.min(stepIdx, steps.length - 1)}
              onChange={(e) => { setPlaying(false); setStepIdx(Number(e.target.value)); }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-inset accent-viz-4"
              aria-label="scrub through steps"
            />
            <span className="w-20 shrink-0 text-right font-mono text-xs tabular text-ink">{stepIdx}</span>
          </label>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Compares so far", value: String(compares), tone: "accent" },
            { label: "Write steps so far", value: String(writes) },
            { label: "Total steps", value: String(steps.length - 1) },
            { label: "n", value: String(size) },
          ]}
        />
      }
      footer={
        <div className="border-t border-border-subtle bg-surface-inset px-5 py-3.5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-3">pseudocode — {ALGO_COMPLEXITY[algo]}</p>
          <pre className="overflow-x-auto font-mono text-[11.5px] leading-relaxed">
            {PSEUDO[algo].map((line, i) => (
              <div key={i} className={cn("rounded px-2", step.line === i ? "bg-viz-4/15 font-bold text-ink" : "text-ink-3")}>
                {line}
              </div>
            ))}
          </pre>
          <p className="mt-2 font-mono text-[11px] text-ink-3">↳ {step.note}</p>
        </div>
      }
    >
      <div className="flex h-48 items-end gap-1 sm:h-56">
        {step.arr.map((v, i) => {
          const isCompare = step.compare?.includes(i);
          const isWrite = step.write?.includes(i);
          const isSorted = step.sorted.includes(i);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t transition-colors duration-100",
                isWrite ? "bg-viz-4" : isCompare ? "bg-viz-3" : isSorted ? "bg-viz-9/80" : "bg-viz-4/70",
              )}
              style={{ height: `${(v / maxVal) * 100}%` }}
              title={`a[${i}] = ${v}`}
            >
              <span className="block -mt-5 text-center font-mono text-[10px] tabular font-semibold text-ink-2">{size <= 16 ? v : ""}</span>
            </div>
          );
        })}
      </div>
      <Legend
        className="mt-3"
        items={[
          { color: "#f59e0b", label: "comparing", shape: "square" },
          { color: "#ef4444", label: "writing", shape: "square" },
          { color: "#10b981", label: "final position", shape: "square" },
          { color: "rgba(194, 65, 91, 0.65)", label: "unvisited", shape: "square" },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 29. Decision boundaries
// ===========================================================================

export function DecisionBoundaryViz() {
  const [kind, setKind] = useState<DatasetKind>("moons");
  const [noise, setNoise] = useState(0.35);
  const [k, setK] = useState(5);
  const [model, setModel] = useState<"knn" | "logistic">("knn");
  const [metric, setMetric] = useState<Metric>("euclidean");
  const [seed, setSeed] = useState(4);

  const data = useMemo(() => generateDataset(kind, 160, noise, seed), [kind, noise, seed]);
  const split = useMemo(() => trainTestSplit(data, 0.3, seed + 50), [data]);
  const std = useMemo(() => standardize(split.train), [split]);

  const grid = useMemo(() => {
    if (model === "knn") {
      return knnGrid(std.xs, k, metric, -3, 3, -3, 3, 40);
    }
    const lg = trainLogistic(std.xs, { lr: 0.6, iterations: 500 });
    return logisticGrid(lg, -3, 3, -3, 3, 40);
  }, [model, std, k, metric]);

  const lg = useMemo(() => (model === "logistic" ? trainLogistic(std.xs, { lr: 0.6, iterations: 500 }) : null), [model, std]);

  const project = (p: Pt): Pt => ({ x: (p.x - std.meanX) / std.sdX, y: (p.y - std.meanY) / std.sdY, label: p.label });
  const predict = (p: Pt): 0 | 1 => {
    if (model === "knn") return knnClassify(std.xs, k, p, metric);
    if (!lg) return 0;
    const z = lg.w1 * ((p.x - std.meanX) / std.sdX) + lg.w2 * ((p.y - std.meanY) / std.sdY) + lg.b;
    return z >= 0 ? 1 : 0;
  };

  const trainAcc = useMemo(() => {
    let right = 0;
    for (const p of split.train) if (predict(project(p)) === p.label) right++;
    return right / split.train.length;
  }, [split, predict]);
  const testAcc = useMemo(() => {
    let right = 0;
    for (const p of split.test) if (predict(project(p)) === p.label) right++;
    return right / split.test.length;
  }, [split, predict]);

  const CELLS = 40;

  return (
    <VizCard
      title="Decision boundaries"
      subtitle="Watch a model carve the plane. k-NN votes among neighbours; logistic regression learns one straight cut — really trained, right here."
      domain="ds"
      explanation={
        <>
          The shaded regions are the model&rsquo;s answers for every point of the plane (computed by classifying a
          40×40 grid through the actual model). k = 1 wraps tightly around each point — high variance; large k
          smooths toward a majority vote — high bias. Logistic regression, whatever the data, can only draw a
          <em> line</em>: on the moons or circles it can never succeed fully. Train accuracy vs test accuracy is the
          overfitting story in two numbers.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            <Seg
              value={kind}
              onChange={(v) => setKind(v)}
              options={[
                { value: "blobs" as DatasetKind, label: "Two blobs" },
                { value: "moons" as DatasetKind, label: "Moons" },
                { value: "circles" as DatasetKind, label: "Circles" },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Seg
              value={model}
              onChange={(v) => setModel(v)}
              options={[
                { value: "knn" as const, label: "k-NN" },
                { value: "logistic" as const, label: "Logistic reg." },
              ]}
            />
          </div>
          {model === "knn" && (
            <>
              <VizSlider label="neighbours (k)" symbol="k" value={k} min={1} max={15} step={2} onChange={setK} format={(v) => String(v)} />
              <Seg
                value={metric}
                onChange={(v) => setMetric(v)}
                options={[
                  { value: "euclidean" as Metric, label: "Euclidean" },
                  { value: "manhattan" as Metric, label: "Manhattan" },
                ]}
              />
            </>
          )}
          <VizSlider label="class noise" value={noise} min={0} max={1} step={0.05} onChange={setNoise} format={(v) => v.toFixed(2)} />
          <div className="flex items-center gap-2">
            <VizButton onClick={() => setSeed((s) => s + 1)}>Resample data</VizButton>
            <span className="text-[11px] text-ink-3">seed {seed} · 70/30 train/test (fixed split)</span>
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Train accuracy", value: `${(trainAcc * 100).toFixed(1)}%` },
            { label: "Test accuracy", value: `${(testAcc * 100).toFixed(1)}%`, tone: "accent" },
            { label: "Gap (overfit)", value: `${((trainAcc - testAcc) * 100).toFixed(1)}pp`, tone: trainAcc - testAcc > 0.15 ? "warn" : "default" },
            { label: "Model", value: model === "knn" ? `k-NN (k=${k}, ${metric})` : `logistic (${lg?.iterations} GD iters, loss ${fmtNum(lg?.loss ?? NaN, 3)})`, mono: false },
          ]}
        />
      }
    >
      <Plane xMin={-3.15} xMax={3.15} yMin={-3.15} yMax={3.15} aspect={1} xLabel="feature 1 (standardised)" yLabel="feature 2 (standardised)" ariaLabel="Decision regions with training and test points">
        {(m) => (
          <>
            {/* decision regions as grid cells */}
            {Array.from({ length: CELLS * CELLS }, (_, idx) => {
              const i = idx % CELLS;
              const j = Math.floor(idx / CELLS);
              const x = -3 + (6 * (i + 0.5)) / CELLS;
              const y = -3 + (6 * (j + 0.5)) / CELLS;
              const cls = grid[j * CELLS + i];
              const px = m.toX(x - 3 / CELLS);
              const py = m.toY(y + 3 / CELLS);
              const w = m.toX(x + 3 / CELLS) - px;
              const h = m.toY(y - 3 / CELLS) - py;
              return (
                <rect
                  key={idx}
                  x={px}
                  y={py}
                  width={Math.max(w + 0.6, 1)}
                  height={Math.max(h + 0.6, 1)}
                  fill={cls === 1 ? CLASS_B : CLASS_A}
                  fillOpacity={0.13}
                />
              );
            })}
            {/* points: train (filled) + test (ringed) */}
            {split.train.map((p, i) => {
              const pp = project(p);
              const pred = predict(pp);
              const wrong = pred !== p.label;
              return (
                <circle
                  key={`tr${i}`}
                  cx={m.toX(pp.x)}
                  cy={m.toY(pp.y)}
                  r={wrong ? 5 : 3.8}
                  fill={p.label === 1 ? CLASS_B : CLASS_A}
                  stroke={wrong ? C.gold : "none"}
                  strokeWidth={wrong ? 2 : 0}
                />
              );
            })}
            {split.test.map((p, i) => {
              const pp = project(p);
              const pred = predict(pp);
              const wrong = pred !== p.label;
              return (
                <circle
                  key={`te${i}`}
                  cx={m.toX(pp.x)}
                  cy={m.toY(pp.y)}
                  r={wrong ? 6 : 4.5}
                  fill="none"
                  stroke={p.label === 1 ? CLASS_B : CLASS_A}
                  strokeWidth={wrong ? 3 : 1.8}
                />
              );
            })}
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: CLASS_A, label: "class A region / points" },
          { color: CLASS_B, label: "class B region / points" },
          { color: C.gold, label: "misclassified (gold ring)" },
          { color: C.slate, label: "test points (hollow)", shape: "dot" },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 30. Confusion matrix + ROC
// ===========================================================================

export function ConfusionMatrixViz() {
  const [separation, setSeparation] = useState(0.5);
  const [threshold, setThreshold] = useState(0.5);
  const [n, setN] = useState(200);
  const [seed, setSeed] = useState(3);

  const scores = useMemo(() => generateScores(n, separation, seed), [n, separation, seed]);
  const cm = confusionAt(scores, threshold);
  const metrics = metricsFrom(cm);
  const auc = useMemo(() => rocAuc(scores), [scores]);
  const roc = useMemo(() => rocCurve(scores), [scores]);
  const binsNeg = useMemo(() => binCounts(scores.filter((s) => s.label === 0).map((s) => s.score), 0, 1, 24), [scores]);
  const binsPos = useMemo(() => binCounts(scores.filter((s) => s.label === 1).map((s) => s.score), 0, 1, 24), [scores]);
  const maxBin = Math.max(...binsNeg, ...binsPos, 1);
  // current ROC position
  const rocPt = roc.find((p) => p.threshold <= threshold) ?? roc[roc.length - 1];

  return (
    <VizCard
      title="Confusion matrix & the threshold trade-off"
      subtitle="One slider sweeps the decision threshold of a classifier: the 2×2 counts, every derived metric and the point on the ROC curve move together."
      domain="ds"
      explanation={
        <>
          Precision answers &ldquo;of my alarms, how many were real?&rdquo;; recall answers &ldquo;of the real cases,
          how many did I catch?&rdquo;. They trade off along the threshold: a high threshold keeps precision but
          misses cases; a low one catches everything but cries wolf. The ROC curve traces that trade across{" "}
          <em>every</em> threshold; AUC (area under it, computed by trapezoid) summarises the classifier in one
          number — 1.0 is perfect separation, 0.5 is a coin flip.
        </>
      }
      controls={
        <>
          <VizSlider label="threshold (decision boundary)" value={threshold} min={0.02} max={0.98} step={0.01} onChange={setThreshold} format={(v) => v.toFixed(2)} />
          <VizSlider label="class separation (model quality)" value={separation} min={0.05} max={0.95} step={0.05} onChange={setSeparation} format={(v) => v.toFixed(2)} />
          <div className="flex flex-wrap gap-4">
            <VizSlider label="scored instances" value={n} min={50} max={400} step={50} onChange={setN} format={(v) => String(v)} />
            <VizButton onClick={() => setSeed((s) => s + 1)}>Resample</VizButton>
          </div>
        </>
      }
      readouts={
        <Readouts
          cols={5}
          items={[
            { label: "Accuracy", value: `${(metrics.accuracy * 100).toFixed(1)}%` },
            { label: "Precision", value: fmtNum(metrics.precision, 3), tone: "accent" },
            { label: "Recall (TPR)", value: fmtNum(metrics.recall, 3), tone: "accent" },
            { label: "F1", value: fmtNum(metrics.f1, 3) },
            { label: "ROC AUC", value: fmtNum(auc, 3), tone: "good" },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-3">Score distributions by true class</p>
          <Plane xMin={0} xMax={1} yMin={0} yMax={maxBin * 1.15} xLabel="model score (threshold = dashed line)" yLabel="count" aspect={16 / 10} ariaLabel="Histograms of predicted scores for each class">
            {(m) => (
              <>
                {binsNeg.map((c, i) => {
                  const x0 = m.toX(i / 24);
                  const x1 = m.toX((i + 1) / 24);
                  return <rect key={`n${i}`} x={x0 + 0.5} y={m.toY(c)} width={Math.max(0.6, x1 - x0 - 1)} height={m.toY(0) - m.toY(c)} fill={CLASS_A} fillOpacity={0.72} />;
                })}
                {binsPos.map((c, i) => {
                  const x0 = m.toX(i / 24);
                  const x1 = m.toX((i + 1) / 24);
                  return <rect key={`p${i}`} x={x0 + 0.5} y={m.toY(c)} width={Math.max(0.6, x1 - x0 - 1)} height={m.toY(0) - m.toY(c)} fill={CLASS_B} fillOpacity={0.72} />;
                })}
                <line x1={m.toX(threshold)} y1={m.toY(0)} x2={m.toX(threshold)} y2={m.toY(maxBin * 1.1)} stroke={C.gold} strokeWidth={2.2} strokeDasharray="6 4" />
                <text x={m.toX(threshold)} y={m.toY(maxBin * 1.1) - 5} textAnchor="middle" className="text-[10.5px] font-bold" fill={C.gold}>{threshold.toFixed(2)}</text>
              </>
            )}
          </Plane>
          {/* the 2×2 matrix */}
          <div className="mt-4 flex justify-center">
            <table className="border-collapse text-center">
              <tbody>
                <tr>
                  <td className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-3"></td>
                  <td className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">pred −</td>
                  <td className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-3">pred +</td>
                </tr>
                <tr>
                  <td className="pr-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">actual −</td>
                  <td className="h-16 w-24 border border-border-subtle bg-success-bg/60 align-middle">
                    <span className="block text-lg font-bold tabular text-success-text">{cm.tn}</span>
                    <span className="text-[10px] font-semibold text-ink-3">TN</span>
                  </td>
                  <td className="h-16 w-24 border border-border-subtle bg-danger-bg/60 align-middle">
                    <span className="block text-lg font-bold tabular text-danger-text">{cm.fp}</span>
                    <span className="text-[10px] font-semibold text-ink-3">FP (false alarm)</span>
                  </td>
                </tr>
                <tr>
                  <td className="pr-2 text-[10px] font-bold uppercase tracking-wider text-ink-3">actual +</td>
                  <td className="h-16 w-24 border border-border-subtle bg-danger-bg/60 align-middle">
                    <span className="block text-lg font-bold tabular text-danger-text">{cm.fn}</span>
                    <span className="text-[10px] font-semibold text-ink-3">FN (missed)</span>
                  </td>
                  <td className="h-16 w-24 border border-border-subtle bg-success-bg/60 align-middle">
                    <span className="block text-lg font-bold tabular text-success-text">{cm.tp}</span>
                    <span className="text-[10px] font-semibold text-ink-3">TP (caught)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-3">ROC curve — every threshold at once</p>
          <Plane xMin={0} xMax={1} yMin={0} yMax={1.05} xLabel="false positive rate (1 − specificity)" yLabel="true positive rate (recall)" aspect={1} ariaLabel="ROC curve with the current threshold marked">
            {(m) => (
              <>
                <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(1)} y2={m.toY(1)} stroke={C.slate} strokeWidth={1.2} strokeDasharray="5 4" opacity={0.6} />
                <polyline
                  points={roc.map((p) => `${m.toX(p.fpr)},${m.toY(p.tpr)}`).join(" ")}
                  fill="none"
                  stroke={C.indigo}
                  strokeWidth={2.4}
                />
                {rocPt && <circle cx={m.toX(rocPt.fpr)} cy={m.toY(rocPt.tpr)} r={5.5} fill={C.gold} stroke="var(--color-canvas, #fff)" strokeWidth={2} />}
                <text x={m.toX(0.62)} y={m.toY(0.35)} className="fill-current text-[10.5px] font-bold opacity-50">AUC = {auc.toFixed(3)}</text>
                <text x={m.toX(0.5)} y={m.toY(0.47)} textAnchor="end" className="fill-current text-[9.5px] opacity-40">coin flip →</text>
              </>
            )}
          </Plane>
          <p className="mt-2 text-center text-[11px] text-ink-3">
            specificity = TN/(TN+FP) = {fmtNum(metrics.specificity, 3)} — recall&rsquo;s mirror on the negative class.
          </p>
        </div>
      </div>
      <Legend className="mt-3" items={[{ color: CLASS_A, label: "actual negative scores" }, { color: CLASS_B, label: "actual positive scores" }, { color: C.gold, label: "current threshold / ROC point" }, { color: C.indigo, label: "ROC curve" }]} />
    </VizCard>
  );
}

// ===========================================================================
// 31. Feature importance
// ===========================================================================

export function FeatureImportanceViz() {
  const [n, setN] = useState(300);
  const [signal, setSignal] = useState(1.4);
  const [k, setK] = useState(7);
  const [seed, setSeed] = useState(8);
  const [busy, setBusy] = useState(false);

  const result = useMemo(() => {
    const table = generateFeatureTable(n, signal, seed);
    return permutationImportance(table, { k, testFrac: 0.3, seed: seed + 1 });
  }, [n, signal, k, seed]);

  const rows = [...result.rows].sort((a, b) => b.drop - a.drop);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.drop)), 0.001);
  const { baseline } = result;

  return (
    <VizCard
      title="Feature importance, computed by permutation"
      subtitle="Three features carry real signal, three are pure noise. Shuffle one column at a time, re-test the model, and the accuracy drop tells the truth."
      domain="ds"
      explanation={
        <>
          The model (k-NN, k = {k}) is trained on 70% of the table; baseline test accuracy is{" "}
          <strong>{(baseline * 100).toFixed(1)}%</strong>. For each feature we shuffle <em>just that column</em> in
          the training set, keep everything else fixed, and re-measure: a big drop means the model leaned on the
          feature; a drop near zero — or negative — means noise. x1 carries the most signal by construction (the
          label generator uses x1, x2, x3 only). Resample to see how the ranking wobbles with the draw — importance
          is itself a noisy estimate.
        </>
      }
      controls={
        <>
          <VizSlider label="signal strength" value={signal} min={0.2} max={3} step={0.1} onChange={setSignal} format={(v) => v.toFixed(1)} />
          <VizSlider label="rows in the table" symbol="n" value={n} min={100} max={600} step={50} onChange={setN} format={(v) => String(v)} />
          <VizSlider label="k-NN neighbours" symbol="k" value={k} min={3} max={15} step={2} onChange={setK} format={(v) => String(v)} />
          <div className="flex items-center gap-2">
            <VizButton
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  setSeed((s) => s + 1);
                  setBusy(false);
                }, 30);
              }}
            >
              {busy ? "computing…" : "Resample dataset"}
            </VizButton>
            <span className="text-[11px] text-ink-3">seed {seed} · every bar = one real re-train + re-test</span>
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Baseline test acc", value: `${(baseline * 100).toFixed(1)}%`, tone: "good" },
            { label: "Top feature", value: rows[0]?.feature ?? "—", mono: false, tone: "accent" },
            { label: "Its importance (drop)", value: rows[0] ? `${(rows[0].drop * 100).toFixed(1)}pp` : "—" },
            { label: "Seed", value: String(seed) },
          ]}
        />
      }
    >
      <div className="space-y-2.5">
        {rows.map((r) => {
          const w = (Math.abs(r.drop) / maxAbs) * 100;
          return (
            <div key={r.feature} className="flex items-center gap-3">
              <span className={cn("w-28 shrink-0 text-right font-mono text-[11.5px]", r.informative ? "font-bold text-ink" : "text-ink-3")}>{r.feature}</span>
              <div className="relative h-6 flex-1 rounded-md bg-surface-inset">
                <div
                  className={cn("absolute inset-y-0.5 rounded", r.drop >= 0 ? (r.informative ? "bg-viz-4" : "bg-viz-4/45") : "bg-warning-border", r.drop >= 0 ? "left-1/2" : "right-1/2")}
                  style={{ width: `${w / 2}%` }}
                />
                <div className="absolute inset-y-0 left-1/2 w-px bg-border-subtle" />
              </div>
              <span className={cn("w-16 shrink-0 text-right font-mono text-[11.5px] tabular", r.drop >= 0 ? "text-ink" : "text-warning-text")}>
                {r.drop >= 0 ? "+" : "−"}{Math.abs(r.drop * 100).toFixed(1)}pp
              </span>
            </div>
          );
        })}
      </div>
      <Legend
        className="mt-4"
        items={[
          { color: C.indigo, label: "informative feature (real signal)" },
          { color: "rgba(194, 65, 91, 0.45)", label: "noise feature (hovering near zero)" },
          { color: "#d97706", label: "negative drop — shuffling accidentally helped", shape: "line" },
        ]}
      />
    </VizCard>
  );
}
