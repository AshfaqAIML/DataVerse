/**
 * Canonical cell formatting — ONE rule for how PostgreSQL values become
 * display/comparison text.
 *
 * Used in three places that MUST agree:
 *   - the browser SQL worker (normalizes results before postMessage)
 *   - scripts/verify-sql-outputs.ts (verifies authored lesson/exercise
 *     results against the same rules in Node)
 *   - exercise validation (student query vs reference query, both
 *     normalized with these rules inside the worker)
 *
 * Because both sides of any comparison go through identical PGlite
 * parsing + these rules, output is deterministic across environments.
 */
import type { SqlCell } from "@/lib/sqlcourse/types";

export function formatCell(value: unknown): SqlCell {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return JSON.stringify(value.map((v) => plain(v)));
  // jsonb / objects
  try {
    return JSON.stringify(plain(value));
  } catch {
    return String(value);
  }
}

/** Format like PGlite renders: dates as YYYY-MM-DD, timestamps as
 *  YYYY-MM-DD HH:MM:SS (with fractional seconds only when present). */
export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const date = `${y}-${mo}-${day}`;
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  const ms = d.getUTCMilliseconds();
  if (h === "00" && mi === "00" && s === "00" && ms === 0) return date;
  let time = `${h}:${mi}:${s}`;
  if (ms !== 0) time += `.${String(ms).padEnd(3, "0")}`;
  return `${date} ${time}`;
}

/** Numbers render without float noise (2.25 stays "2.25"). */
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return String(n);
}

/** Make plain JSON-safe values for stringify. */
function plain(v: unknown): unknown {
  if (v instanceof Date) return formatDate(v);
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v)) return v.map(plain);
  if (v !== null && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = plain(val);
    }
    return out;
  }
  return v;
}

/** Normalize a whole result set (rows of unknown cells -> text cells). */
export function formatRows(rows: Record<string, unknown>[], columns: string[]): SqlCell[][] {
  return rows.map((row) => columns.map((c) => formatCell(row[c])));
}

/**
 * Compare two normalized result sets for exercise auto-grading.
 * `ordered` decides whether row order matters.
 * Returns null when equal, or a human explanation of the first difference.
 */
export function diffResults(
  expected: { columns: string[]; rows: SqlCell[][] },
  actual: { columns: string[]; rows: SqlCell[][] },
  ordered: boolean
): string | null {
  if (expected.columns.length !== actual.columns.length) {
    return `Expected ${expected.columns.length} column(s) but your query returned ${actual.columns.length}.`;
  }
  for (let i = 0; i < expected.columns.length; i++) {
    const e = expected.columns[i].toLowerCase();
    const a = actual.columns[i]?.toLowerCase() ?? "";
    if (e !== a) {
      return `Column ${i + 1} should be named "${expected.columns[i]}", but yours returned "${actual.columns[i] ?? ""}". (Use a column alias if needed.)`;
    }
  }
  if (expected.rows.length !== actual.rows.length) {
    return `Expected ${expected.rows.length} row(s) but your query returned ${actual.rows.length}.`;
  }
  const key = (r: SqlCell[]) => JSON.stringify(r.map((c) => (c === null ? null : String(c))));
  const byKey = (a: SqlCell[], b: SqlCell[]) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
  let expRows = expected.rows;
  let actRows = actual.rows;
  if (!ordered) {
    expRows = [...expRows].sort(byKey);
    actRows = [...actRows].sort(byKey);
  }
  for (let i = 0; i < expRows.length; i++) {
    if (key(expRows[i]) !== key(actRows[i])) {
      const rowNo = ordered ? i + 1 : "a row";
      return `Row ${rowNo} does not match the expected result. Expected ${describeRow(expected.columns, expRows[i])} but got ${describeRow(actual.columns, actRows[i])}.`;
    }
  }
  return null;
}

function describeRow(columns: string[], row: SqlCell[]): string {
  const pairs = columns.map((c, i) => {
    const v = row[i] === null ? "NULL" : row[i] === "" ? "''" : row[i];
    return `${c}=${v}`;
  });
  return `(${pairs.join(", ")})`;
}
