/**
 * Shared aggregation helpers for the Data Visualization course — used by
 * the Chart Playground (dataset → ChartSpec) and the interpretation
 * drills, so a box plot in a drill is computed by the same quartile
 * function the playground uses.
 */
import type { BoxStat } from "./types";

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export interface TabularDataset {
  columns: { name: string; type: "numeric" | "categorical"; values: (number | string)[] }[];
}

export function buildBoxStats(ds: TabularDataset, catCol: string, numCol: string): BoxStat[] {
  const groups = new Map<string, number[]>();
  const ci = ds.columns.findIndex((c) => c.name === catCol);
  const ni = ds.columns.findIndex((c) => c.name === numCol);
  if (ci === -1 || ni === -1) return [];
  ds.columns[ci].values.forEach((v, r) => {
    const key = String(v);
    const arr = groups.get(key) ?? [];
    const n = ds.columns[ni].values[r];
    if (typeof n === "number") arr.push(n);
    groups.set(key, arr);
  });
  return [...groups.entries()].map(([label, vals]) => {
    const s = [...vals].sort((a, b) => a - b);
    const q1 = quantile(s, 0.25);
    const med = quantile(s, 0.5);
    const q3 = quantile(s, 0.75);
    const iqr = q3 - q1;
    const inliers = s.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
    const outliers = s.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
    return {
      label,
      min: inliers[0] ?? s[0],
      q1,
      median: med,
      q3,
      max: inliers[inliers.length - 1] ?? s[s.length - 1],
      outliers,
    };
  });
}

export interface DataRow {
  [key: string]: number | string;
}

export function toRows(ds: TabularDataset): DataRow[] {
  const n = ds.columns[0]?.values.length ?? 0;
  return Array.from({ length: n }, (_, i) =>
    Object.fromEntries(ds.columns.map((c) => [c.name, c.values[i]])),
  );
}
