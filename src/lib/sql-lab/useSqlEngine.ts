"use client";

/**
 * useSqlEngine — React hook wrapping the PostgreSQL runner worker.
 *
 * The engine (worker + PGlite + current dataset) is a MODULE-LEVEL
 * SINGLETON shared by every component on the page: the Lab, lesson
 * mini-labs and exercise editors all talk to the same in-browser
 * PostgreSQL instance.
 *
 * Guarantees (mirrors the proven Pyodide hook pattern):
 *   - one shared worker for the whole page (created lazily)
 *   - per-request ids so stale responses are ignored
 *   - a hard timeout per request: a query that never finishes (e.g. an
 *     unbounded recursive CTE) cannot freeze the page — the worker is
 *     terminated and transparently recreated
 *   - status events during engine boot / dataset seeding for the UI
 */
import { useCallback, useSyncExternalStore } from "react";
import type { DatasetId } from "@/lib/sqlcourse/types";

export interface SqlCellView {
  columns: string[];
  rows: (string | null)[][];
  command?: string | null;
  rowCount?: number | null;
  affectedRows?: number | null;
}

export interface SqlErrorView {
  message: string;
  code?: string | null;
  severity?: string | null;
  detail?: string | null;
  hint?: string | null;
  position?: string | null;
}

export interface RunOutcome {
  result?: SqlCellView & { statementCount?: number; commands?: string[] };
  error?: SqlErrorView;
  elapsedMs?: number;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  primaryKey: boolean;
  references: string[];
}

export interface SchemaTable {
  name: string;
  rowCount: number | null;
  columns: SchemaColumn[];
}

export interface ValidationVerdict {
  pass: boolean;
  reason: string | null;
  expected: SqlCellView | null;
  actual: SqlCellView | null;
  actualError?: SqlErrorView | null;
}

export type EngineStatus =
  | { phase: "idle" }
  | { phase: "boot"; detail?: string }
  | { phase: "seed"; detail?: string }
  | { phase: "ready"; dataset?: string }
  | { phase: "validating"; detail?: string }
  | { phase: "error"; message: string };

export interface SqlEngineState {
  /** Switch to (and load) a sample database. Idempotent. */
  use: (dataset: DatasetId) => Promise<boolean>;
  /** Execute SQL (optionally ensuring a dataset first). */
  run: (sql: string, dataset?: DatasetId) => Promise<RunOutcome>;
  /** Introspect the current database for the schema explorer. */
  schema: () => Promise<SchemaTable[] | null>;
  /** First N rows of one table. */
  preview: (table: string, limit?: number) => Promise<RunOutcome>;
  /** Re-seed the current database from scratch. */
  reset: () => Promise<boolean>;
  /**
   * Grade student SQL against a reference solution. Both run on
   * pristine re-seeds of the exercise's dataset inside the worker.
   */
  validate: (
    dataset: DatasetId,
    sql: string,
    reference: string,
    ordered: boolean
  ) => Promise<ValidationVerdict | null>;
  /** true while a request is in flight. */
  busy: boolean;
  /** Progress of engine + dataset lifecycle (for UI banners). */
  status: EngineStatus;
  /** Set when the engine failed to load or a request timed out. */
  engineError: string | null;
}

const REQUEST_TIMEOUT_MS = 15_000;

interface Pending {
  resolve: (value: any) => void;
  timer: ReturnType<typeof setTimeout>;
}

/* ------------------- module-level singleton engine ------------------- */

let worker: Worker | null = null;
const pending = new Map<number, Pending>();
let nextId = 0;
const statusListeners = new Set<(s: EngineStatus) => void>();
let currentStatus: EngineStatus = { phase: "idle" };
let currentError: string | null = null;
let inFlight = 0;
const busyListeners = new Set<(b: boolean) => void>();

function setStatus(s: EngineStatus) {
  currentStatus = s;
  for (const fn of statusListeners) fn(s);
}

function setBusyDelta(delta: number) {
  inFlight = Math.max(0, inFlight + delta);
  for (const fn of busyListeners) fn(inFlight > 0);
}

function teardown(message?: string) {
  worker?.terminate();
  worker = null;
  for (const [, p] of pending) {
    clearTimeout(p.timer);
    p.resolve(null);
  }
  pending.clear();
  inFlight = 0;
  for (const fn of busyListeners) fn(false);
  if (message) {
    currentError = message;
    setStatus({ phase: "error", message });
  }
}

function ensureWorker(): Worker {
  if (worker) return worker;
  const w = new Worker("/workers/pg-runner.js", { type: "module" });
  w.onmessage = (event: MessageEvent) => {
    const data = event.data || {};
    if (data.stage) {
      if (data.stage === "boot") setStatus({ phase: "boot", detail: data.detail });
      else if (data.stage === "seed") setStatus({ phase: "seed", detail: data.detail });
      else if (data.stage === "ready") setStatus({ phase: "ready", dataset: data.detail });
      else if (data.stage === "validating") setStatus({ phase: "validating", detail: data.detail });
      return;
    }
    const p = pending.get(data.id);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(data.id);
    setBusyDelta(-1);
    p.resolve(data);
  };
  w.onerror = (event) => {
    teardown(
      `The PostgreSQL engine failed to load: ${event.message || "unknown error"}. ` +
        "Reload the page to try again."
    );
  };
  worker = w;
  return w;
}

function request(payload: Record<string, unknown>): Promise<any> {
  currentError = null;
  setBusyDelta(1);
  const w = ensureWorker();
  const id = ++nextId;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      setBusyDelta(-1);
      // Hard kill: an unfinishable query wedges the worker thread.
      teardown(
        "The query was stopped after 15 seconds — it probably never finishes " +
          "(an unbounded recursive CTE, for example). The database was reset. " +
          "Add a bound to the recursion and try again."
      );
      resolve(null);
    }, REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    w.postMessage({ id, ...payload });
  });
}

/* ----------------------------- the hook ----------------------------- */

function subscribeStatus(fn: () => void) {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}
function subscribeBusy(fn: () => void) {
  busyListeners.add(fn);
  return () => busyListeners.delete(fn);
}

export function useSqlEngine(): SqlEngineState {
  const status = useSyncExternalStore(subscribeStatus, () => currentStatus);
  const busy = useSyncExternalStore(subscribeBusy, () => inFlight > 0);
  const engineError = useSyncExternalStore(subscribeBusy, () => currentError);

  const use = useCallback(async (dataset: DatasetId) => {
    const res = await request({ kind: "boot", dataset });
    return res?.ok === true;
  }, []);

  const run = useCallback(async (sql: string, dataset?: DatasetId): Promise<RunOutcome> => {
    const res = await request({ kind: "run", sql, dataset: dataset ?? null });
    if (!res) return { error: { message: "The engine is unavailable — see the message above." } };
    if (res.ok) return { result: res.result, elapsedMs: res.elapsedMs };
    return { error: res.error };
  }, []);

  const schema = useCallback(async (): Promise<SchemaTable[] | null> => {
    const res = await request({ kind: "schema" });
    return res?.ok === true ? (res.schema as SchemaTable[]) : null;
  }, []);

  const preview = useCallback(async (table: string, limit = 50): Promise<RunOutcome> => {
    const res = await request({ kind: "preview", table, limit });
    if (!res) return { error: { message: "The engine is unavailable — see the message above." } };
    if (res.ok) return { result: res.result };
    return { error: res.error };
  }, []);

  const reset = useCallback(async () => {
    const res = await request({ kind: "reset" });
    return res?.ok === true;
  }, []);

  const validate = useCallback(
    async (dataset: DatasetId, sql: string, reference: string, ordered: boolean): Promise<ValidationVerdict | null> => {
      const res = await request({ kind: "validate", sql, reference, ordered, dataset });
      return res?.ok === true ? (res.verdict as ValidationVerdict) : null;
    },
    []
  );

  return { use, run, schema, preview, reset, validate, busy, status, engineError };
}
