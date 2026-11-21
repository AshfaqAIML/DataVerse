/**
 * Dataset engine — assembles a project's dataset on demand.
 *
 * `buildDataset(project)` runs the project's seeded builder and returns a
 * column-ordered table plus a quality profile (missing cells, duplicate
 * rows, per-column uniqueness) the Dataset tab renders. `toCsv` produces
 * the downloadable file; `downloadDataset` triggers the browser download.
 */
import type { DapProject } from "./types";
import { makeRng } from "./rng";
import type { DatasetRow } from "./dataset-builders-a";
import { ret1, ret2, ret3, ecm1, ecm2, ecm3, sal1, sal2, sal3, cus1, cus2, cus3, mkt1, mkt2, mkt3, fin1, fin2, fin3 } from "./dataset-builders-a";
import { hlt1, hlt2, hlt3, edu1, edu2, edu3, hr1, hr2, hr3, spt1, spt2, spt3, pub1, pub2, pub3, biq1, biq2, biq3 } from "./dataset-builders-b";

export type { DatasetRow } from "./dataset-builders-a";

export const DATASET_BUILDERS: Record<string, (r: ReturnType<typeof makeRng>, rows: number) => DatasetRow[]> = {
  "retail-1": ret1, "retail-2": ret2, "retail-3": ret3,
  "ecommerce-1": ecm1, "ecommerce-2": ecm2, "ecommerce-3": ecm3,
  "sales-1": sal1, "sales-2": sal2, "sales-3": sal3,
  "customer-1": cus1, "customer-2": cus2, "customer-3": cus3,
  "marketing-1": mkt1, "marketing-2": mkt2, "marketing-3": mkt3,
  "financial-1": fin1, "financial-2": fin2, "financial-3": fin3,
  "healthcare-1": hlt1, "healthcare-2": hlt2, "healthcare-3": hlt3,
  "education-1": edu1, "education-2": edu2, "education-3": edu3,
  "hr-1": hr1, "hr-2": hr2, "hr-3": hr3,
  "sports-1": spt1, "sports-2": spt2, "sports-3": spt3,
  "public-1": pub1, "public-2": pub2, "public-3": pub3,
  "bi-1": biq1, "bi-2": biq2, "bi-3": biq3,
};

export interface DatasetTable {
  columns: string[];
  rows: DatasetRow[];
}

export interface ColumnProfile {
  column: string;
  missing: number;
  missingPct: number;
  unique: number;
  sample: string;
}

export interface DatasetProfile {
  rows: number;
  columns: number;
  duplicateRows: number;
  missingCells: number;
  missingPct: number;
  columnProfiles: ColumnProfile[];
}

export function buildDataset(project: DapProject): DatasetTable {
  const builder = DATASET_BUILDERS[project.id];
  const rng = makeRng(`dap:${project.id}:v1`);
  const rows = builder ? builder(rng, project.dataset.rows) : [];
  const columns = project.dataDictionary.map((d) => d.column);
  return { columns, rows };
}

export function toCsv(table: DatasetTable): string {
  const esc = (v: string | number | boolean | null | undefined) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [table.columns.join(",")];
  for (const row of table.rows) lines.push(table.columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n");
}

export function profileDataset(table: DatasetTable): DatasetProfile {
  const seen = new Set<string>();
  let duplicateRows = 0;
  let missingCells = 0;
  const profiles: ColumnProfile[] = table.columns.map((column) => {
    let missing = 0;
    const uniques = new Set<string>();
    let sample = "";
    for (const row of table.rows) {
      const v = row[column];
      const s = v === undefined || v === null || v === "" ? "" : String(v);
      if (s === "") missing++;
      else if (!sample) sample = s;
      uniques.add(s);
    }
    missingCells += missing;
    return {
      column,
      missing,
      missingPct: table.rows.length ? Math.round((missing / table.rows.length) * 1000) / 10 : 0,
      unique: uniques.size,
      sample: sample || "—",
    };
  });
  for (const row of table.rows) {
    const key = table.columns.map((c) => String(row[c] ?? "")).join("\u0001");
    if (seen.has(key)) duplicateRows++;
    else seen.add(key);
  }
  return {
    rows: table.rows.length,
    columns: table.columns.length,
    duplicateRows,
    missingCells,
    missingPct: table.rows.length * table.columns.length
      ? Math.round((missingCells / (table.rows.length * table.columns.length)) * 1000) / 10
      : 0,
    columnProfiles: profiles,
  };
}

/** Trigger a CSV download in the browser. */
export function downloadDataset(project: DapProject, table: DatasetTable): void {
  const csv = toCsv(table);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = project.dataset.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A short statistical peek used by the Dataset tab preview header. */
export function numericPeek(table: DatasetTable, column: string): { min: number; max: number; mean: number } | null {
  const values: number[] = [];
  for (const row of table.rows) {
    const v = row[column];
    const n = typeof v === "number" ? v : Number(String(v).replace(/[$,%\s,]/g, ""));
    if (Number.isFinite(n)) values.push(n);
  }
  if (!values.length) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
  };
}
