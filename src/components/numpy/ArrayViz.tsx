"use client";

/**
 * ArrayViz — the interactive array visualization suite for the NumPy course.
 *
 * Five modes, driven by `arrayViz` content blocks:
 *
 *   explore    — click any element of a grid: see its [row, col] index, its
 *                row and column, its flat (row-major) position, and the
 *                array's shape / ndim / size / dtype. Toggle flat-index
 *                overlay. This is the "see rows, columns, indexes, shape
 *                and individual elements at once" view.
 *   slice      — step through slice expressions and watch exactly which
 *                cells they select, plus the resulting array.
 *   reshape    — move the same values between shapes and watch the
 *                row-major (C-order) fill order; every cell keeps its
 *                original flat index.
 *   axis       — pick an operation and an axis, and watch which direction
 *                collapses; groups are color-coded and the result is laid
 *                out exactly like NumPy prints it.
 *   broadcast  — real operand pairs with live arithmetic, stretch
 *                annotations per dimension, plus a free-form shape checker
 *                implementing NumPy's broadcasting rules.
 *
 * All math lives in src/lib/numpycourse/vizlogic.ts (pure functions,
 * unit-tested). This file is presentation + interaction only.
 */
import { useMemo, useState } from "react";
import { Grid3x3, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArrayVizBlock, AxisOp, SliceSelection } from "@/lib/numpycourse/types";
import {
  axisReduce,
  broadcastAdd,
  broadcastShapes,
  cellRuns,
  flatIndex,
  formatScalar,
  formatShape,
  parseShape,
  reshapePanels,
  selectionResult,
  selectionResult1d,
  shapeSize,
  vizGrid,
  vizShape,
} from "@/lib/numpycourse/vizlogic";

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

/* Categorical group colors — the platform's data-viz palette (viz-1..8),
   tinted with alpha so they sit on any surface in either theme. */
const GROUP_COLORS = [
  "bg-viz-1/15 border-viz-1/50",
  "bg-viz-2/15 border-viz-2/50",
  "bg-viz-4/15 border-viz-4/50",
  "bg-viz-9/15 border-viz-9/50",
  "bg-viz-6/15 border-viz-6/50",
  "bg-viz-7/15 border-viz-7/50",
  "bg-viz-8/15 border-viz-8/50",
  "bg-viz-3/15 border-viz-3/50",
];

function Chip({
  active,
  onClick,
  children,
  mono = true,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        mono && "font-mono",
        active
          ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-e1 dark:border-cyan-500 dark:bg-cyan-950/60 dark:text-cyan-200"
          : "border-border bg-background text-muted-foreground hover:border-cyan-300 hover:text-foreground dark:hover:border-cyan-700"
      )}
    >
      {children}
    </button>
  );
}

interface ArrayGridProps {
  grid: number[][];
  /** "r,c" keys of selected cells (strong cyan highlight). */
  selected?: Set<string>;
  /** "r,c" keys with a group color index for coloring. */
  groups?: Map<string, number>;
  /** Rows tinted lightly (e.g. the row of the selected element). */
  tintRows?: Set<number>;
  /** Columns tinted lightly. */
  tintCols?: Set<number>;
  /** Show the flat (row-major) index under each value. */
  showFlat?: boolean;
  rowLabels?: string[];
  colLabels?: string[];
  onCellClick?: (r: number, c: number) => void;
  /** Compact cells (used inside broadcast operands). */
  compact?: boolean;
}

function ArrayGrid({ grid, selected, groups, tintRows, tintCols, showFlat, rowLabels, colLabels, onCellClick, compact }: ArrayGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const shape = [rows, cols];
  return (
    <div className="inline-block">
      {/* column axis label + column indices */}
      <div className="flex">
        <div className={cn("shrink-0", compact ? "w-8" : "w-16")} />
        <div className={cn("flex gap-1", compact && "gap-0.5")}>
          {Array.from({ length: cols }, (_, c) => (
            <div
              key={c}
              className={cn(
                "flex flex-col items-center justify-end text-[11px] font-semibold text-muted-foreground",
                compact ? "w-9" : "w-12"
              )}
            >
              {rowLabels || colLabels ? (colLabels?.[c] ?? String(c)) : String(c)}
            </div>
          ))}
        </div>
      </div>
      {grid.map((row, r) => (
        <div key={r} className="flex items-center">
          {/* row index + optional semantic label */}
          <div className={cn("shrink-0 pr-1.5 text-right", compact ? "w-8" : "w-16")}>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {rowLabels ? rowLabels[r] : String(r)}
            </span>
          </div>
          <div className={cn("flex gap-1", compact && "gap-0.5")}>
            {row.map((v, c) => {
              const key = `${r},${c}`;
              const sel = selected?.has(key) ?? false;
              const group = groups?.get(key);
              const tinted = tintRows?.has(r) || tintCols?.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={onCellClick ? () => onCellClick(r, c) : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-md border font-mono transition-colors",
                    compact ? "h-9 w-9 text-[11px]" : "h-12 w-12 text-sm",
                    onCellClick && "cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/60",
                    !onCellClick && "cursor-default",
                    group !== undefined ? GROUP_COLORS[group % GROUP_COLORS.length] : "border-border bg-background",
                    tinted && group === undefined && "bg-cyan-50/70 dark:bg-cyan-950/40",
                    sel && "border-cyan-600 bg-cyan-200 font-bold ring-2 ring-cyan-400 dark:bg-cyan-800 dark:text-cyan-50"
                  )}
                >
                  <span className={cn(compact && "text-[11px]")}>{formatScalar(v)}</span>
                  {showFlat && (
                    <span className="absolute bottom-0 right-0.5 text-[8px] font-medium text-muted-foreground/70">
                      {flatIndex(shape, r, c)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShapeBadge({ shape, dtype }: { shape: number[]; dtype?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
      <span>
        .shape = <span className="font-semibold text-foreground">{formatShape(shape)}</span>
      </span>
      <span>
        .ndim = <span className="font-semibold text-foreground">{shape.length}</span>
      </span>
      <span>
        .size = <span className="font-semibold text-foreground">{shapeSize(shape)}</span>
      </span>
      {dtype && (
        <span>
          .dtype = <span className="font-semibold text-foreground">{dtype}</span>
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// explore mode
// ---------------------------------------------------------------------------

function ExploreMode({ block }: { block: ArrayVizBlock }) {
  const data = block.data ?? [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8]];
  const name = block.name ?? "a";
  const is1d = data.length > 0 && typeof data[0] === "number";
  const grid = vizGrid(data);
  const shape = vizShape(data);
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const [showFlat, setShowFlat] = useState(false);
  const [r, c] = sel;
  const flat = is1d ? c : flatIndex(shape, r, c);
  const colValues = grid.map((row) => row[c]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ShapeBadge shape={shape} dtype={block.dtype} />
        <button
          type="button"
          onClick={() => setShowFlat(!showFlat)}
          className={cn(
            "ml-auto rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            showFlat
              ? "border-cyan-500 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/60 dark:text-cyan-200"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {showFlat ? "Hide" : "Show"} flat indexes
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          {is1d ? (
            <ArrayGrid
              grid={grid}
              selected={new Set([`0,${c}`])}
              onCellClick={(rr, cc) => setSel([rr, cc])}
              showFlat={showFlat}
            />
          ) : (
            <ArrayGrid
              grid={grid}
              selected={new Set([`${r},${c}`])}
              tintRows={new Set([r])}
              tintCols={new Set([c])}
              onCellClick={(rr, cc) => setSel([rr, cc])}
              showFlat={showFlat}
              rowLabels={block.labels?.rows}
            />
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {is1d ? (
              <>axis 0 runs along the row → &nbsp;indexes 0…{shape[0] - 1}</>
            ) : (
              <>
                axis 0 (rows) ↓ &nbsp;·&nbsp; axis 1 (columns) →
              </>
            )}
          </p>
        </div>

        <div className="min-w-56 flex-1 space-y-3 rounded-xl border bg-card p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            Click a cell — the inspector
          </p>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-foreground">
              <span className="text-muted-foreground">{name}[</span>
              <span className="font-bold text-cyan-700 dark:text-cyan-400">{is1d ? c : `${r}, ${c}`}</span>
              <span className="text-muted-foreground">]</span> ={" "}
              <span className="font-bold">{formatScalar(grid[r][c])}</span>
            </p>
            <p className="text-muted-foreground">
              flat index <span className="font-semibold text-foreground">{flat}</span> of {shapeSize(shape)}
              <span className="ml-1 text-xs">(row-major: {is1d ? "trivial" : `${r} × ${shape[1]} + ${c}`})</span>
            </p>
            <div className="border-t pt-2" />
            <p className="text-xs leading-6 text-muted-foreground">
              row {r} (axis 0 index {r}) ={" "}
              <span className="font-semibold text-foreground">[{grid[r].map(formatScalar).join(", ")}]</span>
            </p>
            {!is1d && (
              <p className="text-xs leading-6 text-muted-foreground">
                column {c} (axis 1 index {c}) ={" "}
                <span className="font-semibold text-foreground">[{colValues.map(formatScalar).join(", ")}]</span>
              </p>
            )}
            <div className="border-t pt-2" />
            <p className="text-xs leading-6 text-muted-foreground">
              {is1d ? (
                <>a 1-D array is a single axis — one row, no columns dimension</>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{shape[0]} rows × {shape[1]} columns</span> — shape{" "}
                  {formatShape(shape)} means {shape[0]} entries along axis 0 and {shape[1]} along axis 1
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// slice mode
// ---------------------------------------------------------------------------

function SliceMode({ block }: { block: ArrayVizBlock }) {
  const data = block.data ?? [[10, 11, 12, 13], [20, 21, 22, 23], [30, 31, 32, 33]];
  const name = block.name ?? "a";
  const is1d = data.length > 0 && typeof data[0] === "number";
  const grid = vizGrid(data);
  const selections: SliceSelection[] = block.selections ?? [];
  const [i, setI] = useState(0);
  const sel = selections[Math.min(i, Math.max(selections.length - 1, 0))];
  const selected = new Set((sel?.cells ?? []).map(([r, c]) => `${r},${c}`));
  const result = sel ? (is1d ? selectionResult1d(data as number[], sel.cells) : selectionResult(grid, sel.cells)) : "";

  const runs = sel ? cellRuns(sel.cells) : [];
  const touchedRows = new Set(runs.map((run) => run.row));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {selections.map((s, idx) => (
          <Chip key={s.expr} active={idx === i} onClick={() => setI(idx)}>
            {s.expr}
          </Chip>
        ))}
        {selections.length > 1 && (
          <span className="ml-1 flex gap-1">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Previous selection"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setI((v) => Math.min(selections.length - 1, v + 1))}
              className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Next selection"
            >
              →
            </button>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <ArrayGrid grid={grid} selected={selected} tintRows={touchedRows} />
        </div>
        {sel && (
          <div className="min-w-52 flex-1 space-y-3 rounded-xl border bg-card p-4">
            <p className="font-mono text-sm text-foreground">
              <span className="text-muted-foreground">&gt;&gt;&gt; </span>
              {sel.expr}
            </p>
            <p className="rounded-lg border border-l-2 border-l-cyan-500 bg-muted/40 px-3 py-2 font-mono text-sm text-foreground">
              {result}
            </p>
            {sel.note && (
              <p className="text-sm leading-relaxed text-foreground/85">
                {sel.note}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Selected {sel.cells.length} element{sel.cells.length === 1 ? "" : "s"}
              {runs.length > 1 ? " — note the row-by-row visiting order" : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// reshape mode
// ---------------------------------------------------------------------------

function ReshapeMode({ block }: { block: ArrayVizBlock }) {
  const data = block.data ?? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const name = block.name ?? "a";
  const values = Array.isArray(data) && data.length > 0 && typeof data[0] === "number" ? (data as number[]) : (data as number[][]).flat();
  const targets = block.targets?.filter((t) => shapeSize(t) === values.length) ?? [];
  const [i, setI] = useState(0);
  const target = targets[Math.min(i, Math.max(targets.length - 1, 0))] ?? [values.length];
  const panels = reshapePanels(values, target);
  const is3d = target.length === 3;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {targets.map((t, idx) => (
          <Chip key={t.join("x")} active={idx === i} onClick={() => setI(idx)}>
            {name}.reshape({t.join(", ")})
          </Chip>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-mono text-xs text-muted-foreground">
            {values.length} values, flat: [{values.map((v) => formatScalar(v)).join(", ")}]
          </p>
          <p className="ml-auto font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
            shape {formatShape(target)} · {is3d ? `${target[0]} panels × ${target[1]} rows × ${target[2]} cols` : target.length === 2 ? `${target[0]} rows × ${target[1]} cols` : "one axis"}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          {panels.map((p) => (
            <div key={p.panel} className="space-y-1.5">
              {is3d && (
                <p className="text-center font-mono text-[11px] font-semibold text-muted-foreground">
                  {name}[{p.panel}] — axis 0 = {p.panel}
                </p>
              )}
              <div className="rounded-lg border bg-background/60 p-2.5">
                <ArrayGrid grid={p.rows.map((row) => row.map((cell) => cell.value))} showFlat compact />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The small number in each corner is the element&apos;s <span className="font-semibold text-foreground">flat index</span> —
          NumPy fills row by row (C order): the last axis changes fastest. Reshaping never moves values in memory; it only
          changes how the same {values.length} numbers are grouped.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// axis mode
// ---------------------------------------------------------------------------

const AXIS_OP_LABEL: Record<AxisOp, string> = {
  sum: "np.sum",
  mean: "np.mean",
  max: "np.max",
  min: "np.min",
  prod: "np.prod",
};

function AxisMode({ block }: { block: ArrayVizBlock }) {
  const data = block.data ?? [[1, 2, 3], [4, 5, 6]];
  const name = block.name ?? "a";
  const grid = vizGrid(data);
  const ops: AxisOp[] = block.ops ?? ["sum"];
  const [op, setOp] = useState<AxisOp>(ops[0]);
  const [axis, setAxis] = useState<0 | 1 | null>(0);
  const result = useMemo(() => axisReduce(grid, op, axis), [grid, op, axis]);

  // group coloring: cells that combine into the same output value share a color
  const groups = new Map<string, number>();
  if (axis === 0) {
    for (let c = 0; c < grid[0].length; c++) for (let r = 0; r < grid.length; r++) groups.set(`${r},${c}`, c);
  } else if (axis === 1) {
    for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) groups.set(`${r},${c}`, r);
  }

  const fmt = (v: number) => formatScalar(Number(v.toFixed(4)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">operation</span>
        {ops.map((o) => (
          <Chip key={o} active={o === op} onClick={() => setOp(o)}>
            {AXIS_OP_LABEL[o]}
          </Chip>
        ))}
        <span className="ml-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">axis</span>
        <Chip active={axis === null} onClick={() => setAxis(null)}>
          axis=None
        </Chip>
        <Chip active={axis === 0} onClick={() => setAxis(0)}>
          axis=0
        </Chip>
        <Chip active={axis === 1} onClick={() => setAxis(1)}>
          axis=1
        </Chip>
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-muted/20 p-4">
        <div>
          <ArrayGrid grid={grid} groups={axis === null ? undefined : groups} />
          <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">{name} · shape {formatShape([grid.length, grid[0]?.length ?? 0])}</p>
        </div>

        <div className="text-2xl font-bold text-muted-foreground">→</div>

        <div className="min-w-44">
          {axis === null ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan-600 bg-cyan-100 font-mono text-sm font-bold dark:bg-cyan-950/70 dark:text-cyan-200">
              {fmt(result.scalar ?? result.values[0])}
            </div>
          ) : axis === 0 ? (
            <div>
              <div className="flex gap-1">
                {result.values.map((v, c) => (
                  <div
                    key={c}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-md border font-mono text-sm font-bold",
                      GROUP_COLORS[c % GROUP_COLORS.length]
                    )}
                  >
                    {fmt(v)}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">one value per <span className="font-semibold">column</span> → a 1-D row</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {result.values.map((v, r) => (
                <div
                  key={r}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-md border font-mono text-sm font-bold",
                    GROUP_COLORS[r % GROUP_COLORS.length]
                  )}
                >
                  {fmt(v)}
                </div>
              ))}
              <p className="mt-2 text-[11px] text-muted-foreground">one value per <span className="font-semibold">row</span> → a 1-D column</p>
            </div>
          )}
          <p className="mt-2 font-mono text-xs text-foreground">
            {AXIS_OP_LABEL[op]}({name}{axis !== null ? `, axis=${axis}` : ""}) → shape {formatShape(axis === null ? [] : [result.values.length])}
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {axis === null
          ? "axis=None collapses everything into a single number — every cell had the same job."
          : axis === 0
            ? "axis=0 collapses along the row direction: each column's cells (color groups) combine into one value, so the result has one entry per column."
            : "axis=1 collapses along the column direction: each row's cells (color groups) combine into one value, so the result has one entry per row."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// broadcast mode
// ---------------------------------------------------------------------------

function BroadcastOperand({
  label,
  grid,
  shape,
  stretchNote,
}: {
  label: string;
  grid: number[][];
  shape: number[];
  stretchNote: string | null;
}) {
  return (
    <div className="space-y-2">
      <p className="text-center font-mono text-xs font-semibold text-muted-foreground">
        {label} · {formatShape(shape)}
      </p>
      <div className="rounded-lg border bg-muted/20 p-2.5">
        <ArrayGrid grid={grid} compact />
      </div>
      {stretchNote && <p className="max-w-44 text-center text-[11px] leading-snug text-warning-text">{stretchNote}</p>}
    </div>
  );
}

function ShapeChecker() {
  const [aText, setAText] = useState("3, 1");
  const [bText, setBText] = useState("1, 4");
  const a = parseShape(aText);
  const b = parseShape(bText);
  const verdict = useMemo(
    () => (a && b ? broadcastShapes(a, b) : null),
    [a, b]
  );

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Shape checker — try any two shapes
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={aText}
          onChange={(e) => setAText(e.target.value)}
          aria-label="First shape"
          className="w-24 rounded-lg border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan-500"
          placeholder="3, 1"
        />
        <span className="font-mono text-sm text-muted-foreground">op</span>
        <input
          value={bText}
          onChange={(e) => setBText(e.target.value)}
          aria-label="Second shape"
          className="w-24 rounded-lg border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan-500"
          placeholder="4"
        />
        <span className="font-mono text-sm text-muted-foreground">→</span>
        {verdict === null ? (
          <span className="text-xs text-muted-foreground">
            enter shapes like <span className="font-mono">3, 1</span> (1–3 dims, each 1–8)
          </span>
        ) : verdict.ok ? (
          <span className="rounded-lg border border-success-border bg-success-bg px-3 py-2 font-mono text-sm font-semibold text-success-text">
            {formatShape(verdict.result ?? [])}
          </span>
        ) : (
          <span className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 font-mono text-xs text-danger-text">
            ValueError
          </span>
        )}
      </div>
      {verdict && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="py-1 pr-3 font-medium">dim (from right)</th>
                <th className="py-1 pr-3 font-medium">A</th>
                <th className="py-1 pr-3 font-medium">B</th>
                <th className="py-1 pr-3 font-medium">result</th>
                <th className="py-1 font-medium">rule</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {verdict.dims.map((d) => (
                <tr key={d.fromRight} className={cn("border-t border-border/60", d.rule === "incompatible" && "bg-danger-bg/60")}>
                  <td className="py-1.5 pr-3">{d.fromRight}</td>
                  <td className="py-1.5 pr-3">{d.a}</td>
                  <td className="py-1.5 pr-3">{d.b}</td>
                  <td className="py-1.5 pr-3 font-semibold text-foreground">{Number.isNaN(d.result) ? "—" : d.result}</td>
                  <td className="py-1.5 text-muted-foreground">
                    {d.rule === "equal" && "sizes match"}
                    {d.rule === "stretch-a" && "A is 1 → stretched"}
                    {d.rule === "stretch-b" && "B is 1 → stretched"}
                    {d.rule === "missing-a" && "A has no axis → treated as 1"}
                    {d.rule === "missing-b" && "B has no axis → treated as 1"}
                    {d.rule === "incompatible" && "sizes differ, neither is 1 → error"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {verdict && !verdict.ok && (
        <p className="rounded-lg border border-l-2 border-l-danger-text bg-danger-bg/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-danger-text">
          {verdict.reason}
        </p>
      )}
    </div>
  );
}

function BroadcastMode({ block }: { block: ArrayVizBlock }) {
  const presets = block.presets ?? [];
  const [i, setI] = useState(0);
  const preset = presets[Math.min(i, Math.max(presets.length - 1, 0))];
  const [aName, bName] = useMemo(() => (block.name ? block.name.split("+").map((s) => s.trim()) : ["a", "b"]), [block.name]);

  if (!preset) {
    return <ShapeChecker />;
  }

  const sa = [preset.a.length, preset.a[0]?.length ?? 0];
  const sb = [preset.b.length, preset.b[0]?.length ?? 0];
  const verdict = broadcastShapes(sa, sb);
  const result = broadcastAdd(preset.a, preset.b);

  /** Which axes of this operand get stretched to reach the result shape. */
  const stretchNote = (s: number[]): string | null => {
    const res = verdict.result ?? [];
    if (res.length < 2) return null;
    const notes: string[] = [];
    if (s[0] === 1 && res[0] > 1) notes.push(`axis 0: 1 → ${res[0]} (stretched)`);
    if (s[1] === 1 && res[1] > 1) notes.push(`axis 1: 1 → ${res[1]} (stretched)`);
    return notes.length > 0 ? notes.join(" · ") : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p, idx) => (
          <Chip key={p.label} active={idx === i} onClick={() => setI(idx)}>
            {p.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-5 rounded-xl border bg-muted/20 p-4">
        <BroadcastOperand
          label={aName}
          grid={preset.a}
          shape={sa}
          stretchNote={stretchNote(sa)}
        />
        <span className="pt-8 text-2xl font-bold text-muted-foreground">+</span>
        <BroadcastOperand
          label={bName}
          grid={preset.b}
          shape={sb}
          stretchNote={stretchNote(sb)}
        />
        <span className="pt-8 text-2xl font-bold text-muted-foreground">=</span>
        <div className="space-y-2">
          <p className="text-center font-mono text-xs font-semibold text-muted-foreground">
            result · {formatShape(verdict.result ?? [])}
          </p>
          <div className="rounded-lg border border-cyan-300 bg-cyan-50/50 p-2.5 dark:border-cyan-800 dark:bg-cyan-950/30">
            {result ? (
              <ArrayGrid grid={result} compact />
            ) : (
              <p className="p-4 font-mono text-xs text-danger-text">shapes do not broadcast</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card px-4 py-3">
        <p className="font-mono text-xs leading-6 text-muted-foreground">
          {formatShape(sa)} + {formatShape(sb)} → {formatShape(verdict.result ?? [])} ·{" "}
          <span className="text-foreground">
            {verdict.dims
              .slice()
              .reverse()
              .map((d) =>
                d.rule === "equal"
                  ? `${d.a}=${d.b}`
                  : d.rule === "stretch-a" || d.rule === "missing-a"
                    ? `A:${d.a}→${d.result}`
                    : `B:${d.b}→${d.result}`
              )
              .join(" · ")}
          </span>
        </p>
        {preset.note && <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{preset.note}</p>}
      </div>

      <ShapeChecker />
    </div>
  );
}

// ---------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------

export function ArrayViz({ block }: { block: ArrayVizBlock }) {
  return (
    <figure className="space-y-3">
      <figcaption className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Grid3x3 className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-300" />
        Interactive — {block.title}
      </figcaption>
      <div className="rounded-xl border border-cyan-200 bg-cyan-50/30 p-4 dark:border-cyan-900/60 dark:bg-cyan-950/20 sm:p-5">
        {block.mode === "explore" && <ExploreMode block={block} />}
        {block.mode === "slice" && <SliceMode block={block} />}
        {block.mode === "reshape" && <ReshapeMode block={block} />}
        {block.mode === "axis" && <AxisMode block={block} />}
        {block.mode === "broadcast" && <BroadcastMode block={block} />}
      </div>
      {block.caption && <p className="text-xs leading-relaxed text-muted-foreground">{block.caption}</p>}
    </figure>
  );
}
