"use client";

/**
 * The Chart Playground — School H's laboratory.
 *
 * Capabilities (the user-facing contract):
 *   1. Datasets: six built-in samples OR upload your own CSV.
 *   2. Chart types: ten, from bar to heatmap.
 *   3. Parameters: column mapping, aggregation, bins, sorting, top-N.
 *   4. Colours: nine named palettes (colour-blind-safe included).
 *   5. Labels: title, axis labels, legend toggle, value labels.
 *   6. Immediate output: every control re-renders the chart live.
 *   7. Compare: two chart configurations side by side, A/B.
 *   8. Interpret: chart-reading drills — what does this chart SAY?
 */
import { useCallback, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Columns3,
  GitCompareArrows,
  Grid3x3,
  LineChart as LineIcon,
  MessagesSquare,
  PieChart as PieIcon,
  ScatterChart,
  Sparkles,
  Upload,
} from "lucide-react";
import { ChartRenderer, PALETTES } from "./charts";
import {
  parseCsv,
  SAMPLE_DATASETS,
  type SampleDataset,
} from "@/content/dataviz/datasets";
import type { ChartSpec, ChartType, PaletteName } from "@/lib/dataviz/types";
import { buildBoxStats } from "@/lib/dataviz/aggregate";
import { INTERPRETATION_DRILLS } from "@/content/dataviz/drills";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ config */

type Aggregation = "count" | "sum" | "avg" | "min" | "max";

interface ChartConfig {
  type: ChartType;
  xColumn: string;
  yColumn: string;
  groupColumn: string; // "" = none
  agg: Aggregation;
  bins: number;
  topN: number; // 0 = all
  palette: PaletteName;
  title: string;
  xLabel: string;
  yLabel: string;
  showLegend: boolean;
  showValues: boolean;
  yFromZero: boolean;
  sortDesc: boolean;
}

const CHART_TYPES: { type: ChartType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "bar", label: "Bar", icon: BarChart3 },
  { type: "grouped-bar", label: "Grouped bar", icon: Columns3 },
  { type: "stacked-bar", label: "Stacked bar", icon: Columns3 },
  { type: "line", label: "Line", icon: LineIcon },
  { type: "area", label: "Area", icon: LineIcon },
  { type: "scatter", label: "Scatter", icon: ScatterChart },
  { type: "histogram", label: "Histogram", icon: BarChart3 },
  { type: "pie", label: "Pie", icon: PieIcon },
  { type: "box", label: "Box", icon: Grid3x3 },
  { type: "heatmap", label: "Heatmap", icon: Grid3x3 },
];

function defaultConfig(ds: SampleDataset, type: ChartType = "bar"): ChartConfig {
  const cats = ds.columns.find((c) => c.type === "categorical");
  const nums = ds.columns.filter((c) => c.type === "numeric");
  return {
    type,
    xColumn: cats?.name ?? ds.columns[0]?.name ?? "",
    yColumn: nums[0]?.name ?? "",
    groupColumn: "",
    agg: nums.length ? "sum" : "count",
    bins: 10,
    topN: 0,
    palette: "categorical",
    title: `${ds.name} — ${type}`,
    xLabel: cats?.name ?? "",
    yLabel: nums[0]?.name ?? "count",
    showLegend: true,
    showValues: false,
    yFromZero: true,
    sortDesc: false,
  };
}

/* --------------------------------------------------- dataset → ChartSpec */

export function buildSpec(ds: SampleDataset, cfg: ChartConfig): ChartSpec {
  const col = (name: string) => ds.columns.find((c) => c.name === name);
  const spec: ChartSpec = {
    type: cfg.type,
    title: cfg.title || undefined,
    xLabel: cfg.xLabel || undefined,
    yLabel: cfg.yLabel || undefined,
    palette: cfg.palette,
    showLegend: cfg.showLegend,
    showValues: cfg.showValues,
    yFromZero: cfg.yFromZero,
    sortDesc: cfg.sortDesc,
  };

  if (cfg.type === "histogram") {
    const y = col(cfg.yColumn) ?? ds.columns.find((c) => c.type === "numeric");
    spec.values = (y?.values ?? []).filter((v): v is number => typeof v === "number");
    spec.bins = cfg.bins;
    spec.xLabel = cfg.xLabel || y?.name;
    spec.yLabel = "count";
    return spec;
  }
  if (cfg.type === "box") {
    spec.boxes = buildBoxStats(ds, cfg.xColumn, cfg.yColumn);
    return spec;
  }
  if (cfg.type === "scatter") {
    const xc = col(cfg.xColumn);
    const yc = col(cfg.yColumn);
    const gc = cfg.groupColumn ? col(cfg.groupColumn) : undefined;
    if (xc && yc) {
      spec.points = xc.values
        .map((x, i) => ({
          x: Number(x),
          y: Number(yc.values[i]),
          label: gc ? String(gc.values[i]) : undefined,
        }))
        .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y));
    }
    return spec;
  }
  if (cfg.type === "heatmap") {
    const rows = cfg.groupColumn ? col(cfg.groupColumn) : undefined;
    const cols = col(cfg.xColumn);
    const val = col(cfg.yColumn);
    if (rows && cols && val) {
      const rowKeys = [...new Set(rows.values.map(String))];
      const colKeys = [...new Set(cols.values.map(String))];
      const cells = rowKeys.map(() => colKeys.map(() => 0));
      const counts = rowKeys.map(() => colKeys.map(() => 0));
      cols.values.forEach((cv, i) => {
        const r = rowKeys.indexOf(String(rows.values[i]));
        const c = colKeys.indexOf(String(cv));
        const v = val.values[i];
        if (r >= 0 && c >= 0 && typeof v === "number") {
          cells[r][c] += v;
          counts[r][c] += 1;
        }
      });
      const final = cfg.agg === "avg" ? cells.map((r, ri) => r.map((v, ci) => (counts[ri][ci] ? v / counts[ri][ci] : 0))) : cells;
      spec.matrix = { rowLabels: rowKeys, colLabels: colKeys, cells: final };
    }
    return spec;
  }

  // bar families, line, area, pie: aggregate y by x (optionally per group)
  const xc = col(cfg.xColumn) ?? ds.columns[0];
  const yc = col(cfg.yColumn);
  const gc = cfg.groupColumn ? col(cfg.groupColumn) : undefined;
  if (!xc) return spec;
  let rowIdx = xc.values.map((_, i) => i);
  let cats = [...new Set(xc.values.map(String))];
  if (cfg.topN > 0) cats = cats.slice(0, cfg.topN);
  const agg = (vals: number[]): number => {
    if (!vals.length) return 0;
    switch (cfg.agg) {
      case "count":
        return vals.length;
      case "sum":
        return vals.reduce((a, v) => a + v, 0);
      case "avg":
        return vals.reduce((a, v) => a + v, 0) / vals.length;
      case "min":
        return Math.min(...vals);
      case "max":
        return Math.max(...vals);
    }
  };
  const groupKeys = gc ? [...new Set(gc.values.map(String))] : [""];
  const series = groupKeys.map((gk) => ({
    name: gc ? gk : yc?.name ?? "count",
    values: cats.map((cat) => {
      const idx = rowIdx.filter(
        (i) => String(xc.values[i]) === cat && (!gc || String(gc.values[i]) === gk),
      );
      if (yc) return agg(idx.map((i) => Number(yc.values[i])).filter((v) => !Number.isNaN(v)));
      return idx.length;
    }),
  }));
  spec.categories = cats;
  spec.series = series;
  return spec;
}

/* ------------------------------------------------------------------- panels */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle px-4 py-3 last:border-b-0">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">{title}</p>
      {children}
    </div>
  );
}

const selectCls =
  "w-full rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-sm text-ink-2 focus:border-ring focus:outline-none";

function ConfigPanel({
  ds,
  cfg,
  onChange,
}: {
  ds: SampleDataset;
  cfg: ChartConfig;
  onChange: (patch: Partial<ChartConfig>) => void;
}) {
  const numCols = ds.columns.filter((c) => c.type === "numeric").map((c) => c.name);
  const catCols = ds.columns.filter((c) => c.type === "categorical").map((c) => c.name);
  const isBarFamily = cfg.type === "bar" || cfg.type === "grouped-bar" || cfg.type === "stacked-bar" || cfg.type === "pie";
  return (
    <div>
      <Section title="Chart type">
        <div className="grid grid-cols-2 gap-1.5">
          {CHART_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onChange({ type, title: `${ds.name} — ${label}` })}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors",
                cfg.type === type
                  ? "border-viz-10 bg-viz-10/10 text-viz-10"
                  : "border-border-subtle bg-surface text-ink-2 hover:border-border hover:bg-surface-subtle",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Data mapping">
        <label className="mb-1 block text-xs text-ink-3">
          X (categories){cfg.type === "heatmap" ? " — columns" : ""}
          <select className={cn(selectCls, "mt-1")} value={cfg.xColumn} onChange={(e) => onChange({ xColumn: e.target.value, xLabel: e.target.value })}>
            {(cfg.type === "scatter" ? numCols : catCols.length ? catCols : ds.columns.map((c) => c.name)).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        {cfg.type !== "histogram" ? (
          <label className="mb-1 mt-2 block text-xs text-ink-3">
            Y (values){cfg.type === "heatmap" ? " — cell values" : ""}
            <select className={cn(selectCls, "mt-1")} value={cfg.yColumn} onChange={(e) => onChange({ yColumn: e.target.value, yLabel: e.target.value })}>
              {numCols.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className="mb-1 mt-2 block text-xs text-ink-3">
            Sample (values)
            <select className={cn(selectCls, "mt-1")} value={cfg.yColumn} onChange={(e) => onChange({ yColumn: e.target.value, xLabel: e.target.value })}>
              {numCols.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        {cfg.type !== "histogram" && cfg.type !== "box" ? (
          <label className="mt-2 block text-xs text-ink-3">
            Group / split by (optional)
            <select className={cn(selectCls, "mt-1")} value={cfg.groupColumn} onChange={(e) => onChange({ groupColumn: e.target.value })}>
              <option value="">— none —</option>
              {catCols.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        ) : null}
      </Section>
      <Section title="Parameters">
        {isBarFamily || cfg.type === "line" || cfg.type === "area" ? (
          <label className="mb-2 block text-xs text-ink-3">
            Aggregation of Y per X
            <select className={cn(selectCls, "mt-1")} value={cfg.agg} onChange={(e) => onChange({ agg: e.target.value as Aggregation })}>
              {(["sum", "avg", "count", "min", "max"] as Aggregation[]).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        ) : null}
        {cfg.type === "histogram" ? (
          <label className="mb-2 block text-xs text-ink-3">
            Bins: {cfg.bins}
            <input
              type="range"
              min={4}
              max={30}
              value={cfg.bins}
              onChange={(e) => onChange({ bins: Number(e.target.value) })}
              className="mt-1 w-full accent-viz-10"
            />
          </label>
        ) : null}
        {isBarFamily ? (
          <label className="mb-2 block text-xs text-ink-3">
            Top-N categories (0 = all): {cfg.topN}
            <input
              type="range"
              min={0}
              max={12}
              value={cfg.topN}
              onChange={(e) => onChange({ topN: Number(e.target.value) })}
              className="mt-1 w-full accent-viz-10"
            />
          </label>
        ) : null}
        {isBarFamily ? (
          <label className="flex items-center gap-2 text-xs text-ink-2">
            <input type="checkbox" checked={cfg.sortDesc} onChange={(e) => onChange({ sortDesc: e.target.checked })} className="accent-viz-10" />
            Sort categories by value (descending)
          </label>
        ) : null}
        <label className="mt-2 flex items-center gap-2 text-xs text-ink-2">
          <input type="checkbox" checked={!cfg.yFromZero} onChange={(e) => onChange({ yFromZero: !e.target.checked })} className="accent-viz-10" />
          Truncate y-axis (careful — often misleading!)
        </label>
      </Section>
      <Section title="Colours">
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(PALETTES) as PaletteName[]).map((p) => (
            <button
              key={p}
              onClick={() => onChange({ palette: p })}
              className={cn(
                "rounded-md border p-1.5 transition-colors",
                cfg.palette === p ? "border-viz-10 bg-viz-10/10" : "border-border-subtle hover:border-border",
              )}
              title={p}
            >
              <span className="flex gap-0.5">
                {PALETTES[p].slice(0, 5).map((c) => (
                  <span key={c} className="h-3 w-2.5 rounded-[2px]" style={{ background: c }} />
                ))}
              </span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Labels">
        <label className="sr-only" htmlFor="dv-pg-title">Chart title</label>
        <input id="dv-pg-title" className={cn(selectCls, "mb-2")} placeholder="Chart title" value={cfg.title} onChange={(e) => onChange({ title: e.target.value })} />
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="dv-pg-xlabel">x-axis label</label>
          <input id="dv-pg-xlabel" className={selectCls} placeholder="x-axis label" value={cfg.xLabel} onChange={(e) => onChange({ xLabel: e.target.value })} />
          <label className="sr-only" htmlFor="dv-pg-ylabel">y-axis label</label>
          <input id="dv-pg-ylabel" className={selectCls} placeholder="y-axis label" value={cfg.yLabel} onChange={(e) => onChange({ yLabel: e.target.value })} />
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <label className="flex items-center gap-2 text-xs text-ink-2">
            <input type="checkbox" checked={cfg.showLegend} onChange={(e) => onChange({ showLegend: e.target.checked })} className="accent-viz-10" />
            Show legend
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-2">
            <input type="checkbox" checked={cfg.showValues} onChange={(e) => onChange({ showValues: e.target.checked })} className="accent-viz-10" />
            Show value labels
          </label>
        </div>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------- the shell */

type Mode = "build" | "compare" | "interpret";

export function VizPlayground() {
  const [mode, setMode] = useState<Mode>("build");
  const [datasets, setDatasets] = useState<SampleDataset[]>(SAMPLE_DATASETS);
  const [dsId, setDsId] = useState(SAMPLE_DATASETS[0].id);
  const ds = datasets.find((d) => d.id === dsId) ?? datasets[0];
  const [cfgA, setCfgA] = useState<ChartConfig>(() => defaultConfig(SAMPLE_DATASETS[0]));
  const [cfgB, setCfgB] = useState<ChartConfig>(() => ({ ...defaultConfig(SAMPLE_DATASETS[0], "line"), palette: "warm" }));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setDataset = useCallback(
    (id: string) => {
      setDsId(id);
      const next = datasets.find((d) => d.id === id);
      if (next) {
        setCfgA(defaultConfig(next));
        setCfgB({ ...defaultConfig(next, "line"), palette: "warm" });
      }
    },
    [datasets],
  );

  const onUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = parseCsv(`upload-${Date.now()}`, file.name.replace(/\.csv$/i, ""), String(reader.result));
          setDatasets((prev) => [...prev, parsed]);
          setDsId(parsed.id);
          setCfgA(defaultConfig(parsed));
          setCfgB({ ...defaultConfig(parsed, "line"), palette: "warm" });
          setUploadError(null);
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : "Could not parse that CSV");
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const specA = useMemo(() => buildSpec(ds, cfgA), [ds, cfgA]);
  const specB = useMemo(() => buildSpec(ds, cfgB), [ds, cfgB]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-viz-10">Learning Laboratory</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">The Chart Playground</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
          Pick a dataset or upload a CSV, choose a chart type, then bend every encoding decision —
          mapping, aggregation, colours, labels — and watch the chart answer immediately. Then switch
          to <strong>Interpret</strong> and prove you can read charts, not just build them.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(
            [
              ["build", "Build", Sparkles],
              ["compare", "Compare", GitCompareArrows],
              ["interpret", "Interpret", MessagesSquare],
            ] as [Mode, string, React.ComponentType<{ className?: string }>][]
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                mode === m ? "bg-viz-10 text-ink-inverse" : "bg-surface-inset text-ink-2 hover:bg-surface-inset",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {mode === "interpret" ? (
        <InterpretMode />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
          {/* left: dataset + config */}
          <aside className="h-fit rounded-xl border border-border-subtle bg-surface shadow-e1 lg:sticky lg:top-4">
            <div className="border-b border-border-subtle p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">Dataset</p>
              <select className={selectCls} value={dsId} onChange={(e) => setDataset(e.target.value)}>
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-ink-3">{ds.description}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:border-viz-10/60 hover:text-viz-10"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.target.value = "";
                }}
              />
              {uploadError ? <p className="mt-2 text-xs text-danger-text">{uploadError}</p> : null}
            </div>
            {mode === "build" ? (
              <ConfigPanel ds={ds} cfg={cfgA} onChange={(patch) => setCfgA((c) => ({ ...c, ...patch }))} />
            ) : (
              <ConfigPanel ds={ds} cfg={cfgB} onChange={(patch) => setCfgB((c) => ({ ...c, ...patch }))} />
            )}
          </aside>

          {/* right: charts */}
          <div>
            {mode === "build" ? (
              <div className="dv-fade-up rounded-xl border border-border-subtle bg-surface p-5 shadow-e1">
                <ChartRenderer spec={specA} />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="dv-fade-up rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
                  <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-viz-10">Chart A — configure on the left</p>
                  <ChartRenderer spec={specA} />
                </div>
                <div className="dv-fade-up rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
                  <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-gold-600">Chart B — configure on the left</p>
                  <ChartRenderer spec={specB} />
                </div>
                <p className="text-xs leading-relaxed text-ink-3 xl:col-span-2">
                  Same dataset, two encodings. The classic use: which chart answers your question better —
                  and what does each one hide?
                </p>
              </div>
            )}
            <p className="mt-4 text-center text-xs text-ink-3">
              Every chart is rendered from data by the same engine the lessons use — what you configure
              here is exactly what the course teaches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- interpret mode */

function InterpretMode() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const drill = INTERPRETATION_DRILLS[idx % INTERPRETATION_DRILLS.length];

  const choose = (text: string, correct: boolean) => {
    if (picked) return;
    setPicked(text);
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setIdx((i) => i + 1);
    setPicked(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-3">
          Drill {idx + 1} of {INTERPRETATION_DRILLS.length}
        </p>
        <p className="text-xs font-semibold text-viz-10">
          {score.right}/{score.total} correct
        </p>
      </div>
      <div className="dv-fade-up rounded-xl border border-border-subtle bg-surface p-5 shadow-e1">
        <p className="mb-4 text-center text-sm font-semibold text-ink">{drill.prompt}</p>
        <ChartRenderer spec={drill.chart} />
        <div className="mt-5 space-y-2">
          {drill.options.map((o) => {
            const isPicked = picked === o.text;
            const reveal = picked !== null;
            return (
              <button
                key={o.text}
                onClick={() => choose(o.text, o.correct)}
                disabled={reveal}
                className={cn(
                  "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                  !reveal && "border-border-subtle hover:border-viz-10/60 hover:bg-viz-10/10",
                  reveal && o.correct && "border-success-text bg-success-bg text-success-text",
                  reveal && !o.correct && isPicked && "border-danger-text bg-danger-bg text-danger-text",
                  reveal && !o.correct && !isPicked && "border-border-subtle opacity-60",
                )}
              >
                <span className="font-medium">{o.text}</span>
                {reveal && isPicked ? (
                  <span className="mt-1 block text-xs leading-relaxed text-ink-2">{o.feedback}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {picked ? (
          <div className="mt-4 rounded-lg bg-surface-subtle p-3.5">
            <p className="text-xs leading-relaxed text-ink-2">
              <strong>Why:</strong> {drill.explanation}
            </p>
            <button
              onClick={next}
              className="mt-3 rounded-full bg-viz-10 px-4 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-viz-10/85"
            >
              Next drill →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
