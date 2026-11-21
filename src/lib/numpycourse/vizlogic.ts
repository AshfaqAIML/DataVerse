/**
 * Pure logic for the interactive array visualizations.
 *
 * No React here — every helper is a plain, side-effect-free function so it
 * can be unit-tested (tests/unit/numpy-viz.test.ts) and reused by every
 * ArrayViz mode. The rendering lives in ArrayViz.tsx; the MATH lives here.
 */
import type { AxisOp, VizData } from "./types";

// ---------------------------------------------------------------------------
// shape helpers
// ---------------------------------------------------------------------------

/** Shape of VizData: [n] for 1D, [rows, cols] for 2D. */
export function vizShape(data: VizData): number[] {
  if (data.length === 0) return [0];
  if (typeof data[0] === "number") return [data.length];
  const rows = data as number[][];
  const cols = rows[0]?.length ?? 0;
  return [rows.length, cols];
}

/** Coerce VizData to a 2D grid (a 1D array becomes a single row). */
export function vizGrid(data: VizData): number[][] {
  if (data.length === 0) return [[]];
  if (typeof data[0] === "number") return [data as number[]];
  return data as number[][];
}

/** Row-major flat index of [r, c] in an array with the given 2D shape. */
export function flatIndex(shape: number[], r: number, c: number): number {
  return r * shape[1] + c;
}

/** Total number of elements in a shape tuple. */
export function shapeSize(shape: number[]): number {
  return shape.reduce((p, d) => p * d, 1);
}

/** "3, 4" / "(3,4)" / "3 4" -> [3, 4]; null when unparseable or out of bounds. */
export function parseShape(input: string): number[] | null {
  const cleaned = input.replace(/[()\[\]{}]/g, "").trim();
  if (cleaned === "") return null;
  const parts = cleaned.split(/[\s,]+/).filter((p) => p.length > 0);
  if (parts.length === 0 || parts.length > 3) return null;
  const dims: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const d = Number(p);
    if (d < 1 || d > 8) return null;
    dims.push(d);
  }
  if (shapeSize(dims) > 64) return null;
  return dims;
}

/** "(3, 4)" display form of a shape tuple (numpy style, with the trailing
 * comma for 1-D: "(12,)"). */
export function formatShape(shape: number[]): string {
  return shape.length === 1 ? `(${shape[0]},)` : `(${shape.join(", ")})`;
}

// ---------------------------------------------------------------------------
// broadcasting — NumPy's rules, faithfully
// ---------------------------------------------------------------------------

export interface BroadcastDim {
  /** Alignment position counted from the RIGHT (1 = last dimension). */
  fromRight: number;
  a: number;
  b: number;
  result: number;
  /** Why this pair is compatible (or why it failed). */
  rule: "equal" | "stretch-a" | "stretch-b" | "missing-a" | "missing-b" | "incompatible";
}

export interface BroadcastResult {
  ok: boolean;
  result: number[] | null;
  dims: BroadcastDim[];
  /** Human-readable failure reason when ok is false. */
  reason: string | null;
}

/**
 * The NumPy broadcasting rules:
 *   1. Compare shapes right-aligned, missing leading dimensions count as 1.
 *   2. Two dimensions are compatible when they are equal or one of them is 1.
 *   3. The result dimension is the larger of the two.
 */
export function broadcastShapes(a: number[], b: number[]): BroadcastResult {
  const dims: BroadcastDim[] = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const da = a[a.length - 1 - i] ?? null;
    const db = b[b.length - 1 - i] ?? null;
    const fromRight = i + 1;
    if (da === null) {
      dims.push({ fromRight, a: 1, b: db as number, result: db as number, rule: "missing-a" });
    } else if (db === null) {
      dims.push({ fromRight, a: da, b: 1, result: da, rule: "missing-b" });
    } else if (da === db) {
      dims.push({ fromRight, a: da, b: db, result: da, rule: "equal" });
    } else if (da === 1) {
      dims.push({ fromRight, a: da, b: db, result: db, rule: "stretch-a" });
    } else if (db === 1) {
      dims.push({ fromRight, a: da, b: db, result: da, rule: "stretch-b" });
    } else {
      dims.push({ fromRight, a: da, b: db, result: NaN, rule: "incompatible" });
      return {
        ok: false,
        result: null,
        dims,
        reason: `operands could not be broadcast together with shapes ${formatShape(a)} and ${formatShape(b)}: the dimension ${db} (counting from the right, dim ${fromRight}) does not match ${da}, and neither is 1`,
      };
    }
  }
  return { ok: true, result: dims.map((d) => d.result).reverse(), dims, reason: null };
}

/**
 * Broadcast two value grids (2D) to a common result and add them.
 * Returns null when the shapes do not broadcast.
 */
export function broadcastAdd(a: number[][], b: number[][]): number[][] | null {
  const sa = a.length > 0 && Array.isArray(a[0]) ? [a.length, (a[0] as number[]).length] : [a.length, 0];
  const sb = b.length > 0 && Array.isArray(b[0]) ? [b.length, (b[0] as number[]).length] : [b.length, 0];
  const verdict = broadcastShapes(sa, sb);
  if (!verdict.ok || !verdict.result || verdict.result.length !== 2) return null;
  const [rows, cols] = verdict.result;
  const out: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      // Indices into a and b; a dimension of size 1 always reads index 0.
      const ar = sa[0] === 1 ? 0 : r;
      const ac = sa[1] === 1 ? 0 : c;
      const br = sb[0] === 1 ? 0 : r;
      const bc = sb[1] === 1 ? 0 : c;
      row.push((a[ar] as number[])[ac] + (b[br] as number[])[bc]);
    }
    out.push(row);
  }
  return out;
}

// ---------------------------------------------------------------------------
// reshape — row-major fill order
// ---------------------------------------------------------------------------

export interface ReshapePanel {
  /** Index along axis 0 (the panel number for 3D targets). */
  panel: number;
  rows: Array<Array<{ value: number; flat: number }>>;
}

/**
 * Lay a flat list of values out into a target shape using NumPy's
 * row-major (C order) fill: the last axis changes fastest.
 *  - 1D target -> one row of cells
 *  - 2D target -> one panel of rows
 *  - 3D target -> several panels of rows
 */
export function reshapePanels(values: number[], target: number[]): ReshapePanel[] {
  const total = shapeSize(target);
  if (values.length !== total) return [];
  if (target.length === 1) {
    return [{ panel: 0, rows: [values.map((value, flat) => ({ value, flat }))] }];
  }
  if (target.length === 2) {
    const [rows, cols] = target;
    const panels: ReshapePanel[] = [];
    let flat = 0;
    const grid: Array<Array<{ value: number; flat: number }>> = [];
    for (let r = 0; r < rows; r++) {
      const row: Array<{ value: number; flat: number }> = [];
      for (let c = 0; c < cols; c++) {
        row.push({ value: values[flat], flat });
        flat += 1;
      }
      grid.push(row);
    }
    panels.push({ panel: 0, rows: grid });
    return panels;
  }
  // 3D: [p, r, c]
  const [p, rows, cols] = target;
  const panels: ReshapePanel[] = [];
  let flat = 0;
  for (let k = 0; k < p; k++) {
    const grid: Array<Array<{ value: number; flat: number }>> = [];
    for (let r = 0; r < rows; r++) {
      const row: Array<{ value: number; flat: number }> = [];
      for (let c = 0; c < cols; c++) {
        row.push({ value: values[flat], flat });
        flat += 1;
      }
      grid.push(row);
    }
    panels.push({ panel: k, rows: grid });
  }
  return panels;
}

/** Format a numpy expression creating the given shape, for display. */
export function shapeExpr(name: string, shape: number[]): string {
  return `${name}.reshape(${shape.join(", ")})`;
}

// ---------------------------------------------------------------------------
// axis — reductions over a 2D grid
// ---------------------------------------------------------------------------

export interface AxisResult {
  /** null axis reduces everything to a single number. */
  axis: 0 | 1 | null;
  op: AxisOp;
  /** Result values laid out as displayed (a row for axis=0, a column for axis=1). */
  values: number[];
  /** Single scalar when axis is null. */
  scalar: number | null;
}

function applyOp(values: number[], op: AxisOp): number {
  switch (op) {
    case "sum":
      return values.reduce((s, v) => s + v, 0);
    case "prod":
      return values.reduce((s, v) => s * v, 1);
    case "mean":
      return values.reduce((s, v) => s + v, 0) / values.length;
    case "max":
      return Math.max(...values);
    case "min":
      return Math.min(...values);
  }
}

/**
 * Reduce a 2D grid along an axis, mirroring numpy semantics:
 *   axis=0 collapses rows (result has one value per column),
 *   axis=1 collapses columns (result has one value per row),
 *   null collapses everything to one scalar.
 */
export function axisReduce(grid: number[][], op: AxisOp, axis: 0 | 1 | null): AxisResult {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (axis === null) {
    const all = grid.flat();
    return { axis, op, values: [applyOp(all, op)], scalar: applyOp(all, op) };
  }
  if (axis === 0) {
    const values: number[] = [];
    for (let c = 0; c < cols; c++) values.push(applyOp(grid.map((row) => row[c]), op));
    return { axis, op, values, scalar: null };
  }
  const values = grid.map((row) => applyOp(row, op));
  return { axis, op, values, scalar: null };
}

// ---------------------------------------------------------------------------
// slice selections — extracting the result of author-picked cells
// ---------------------------------------------------------------------------

/**
 * Extract the values of the selected cells in visit order and render them
 * as a small grid string for display under the selection (mirrors what
 * NumPy would print for that selection).
 */
export function selectionResult(grid: number[][], cells: number[][]): string {
  const rows = cells.filter((c) => c.length >= 2).map(([r, c]) => grid[r]?.[c]);
  if (rows.some((v) => v === undefined)) return "(invalid cells)";
  const vals = rows as number[];
  if (cells.length === 1) return formatScalar(vals[0]);
  return "[" + vals.map((v) => formatScalar(v)).join(", ") + "]";
}

/** One-dimensional selection (single index list). */
export function selectionResult1d(values: number[], cells: number[][]): string {
  const picked = cells.map(([r, c]) => (r === 0 ? values[c] : undefined));
  if (picked.some((v) => v === undefined)) return "(invalid cells)";
  const vals = picked as number[];
  if (vals.length === 1) return formatScalar(vals[0]);
  return "[" + vals.map((v) => formatScalar(v)).join(", ") + "]";
}

export function formatScalar(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(6)));
}

/**
 * Group consecutive cells into runs (rows), used to draw multi-cell
 * selections compactly: [[0,1],[0,2],[0,3]] -> [{row: 0, from: 1, to: 3}].
 */
export function cellRuns(cells: number[][]): Array<{ row: number; from: number; to: number }> {
  const runs: Array<{ row: number; from: number; to: number }> = [];
  for (const [r, c] of cells) {
    const last = runs[runs.length - 1];
    if (last && last.row === r && c === last.to + 1) {
      last.to = c;
    } else {
      runs.push({ row: r, from: c, to: c });
    }
  }
  return runs;
}
