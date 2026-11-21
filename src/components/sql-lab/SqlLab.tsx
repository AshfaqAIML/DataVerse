"use client";

/**
 * SqlLab — the browser-based SQL editor.
 *
 * Real PostgreSQL (PGlite, WASM) inside an isolated, in-memory database
 * in the learner's own browser. Features:
 *   - query editor (CodeMirror, SQL highlighting + schema autocomplete)
 *   - Run button (Ctrl/Cmd+Enter) with measured execution time
 *   - database selector across the six sample datasets
 *   - schema explorer (tables, columns, types, PK / FK badges, row counts)
 *   - table viewer (click any table to preview its rows)
 *   - results grid, execution errors with position carets
 *   - query history (localStorage, click to restore)
 *   - reset database (re-seed from the pristine copy)
 *   - isolation banner: nothing here can ever touch a production system
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Clock,
  Database,
  Eye,
  History,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatasetId } from "@/lib/sqlcourse/types";
import { DATASETS } from "@/content/sql/datasets";
import { useSqlEngine, type SchemaTable, type RunOutcome } from "@/lib/sql-lab/useSqlEngine";
import { SqlEditor } from "./SqlEditor";
import { ResultGrid, ErrorPanel, SchemaExplorer, EngineStatusBanner } from "./panels";

const HISTORY_KEY = "dataverse-sql-lab-history-v1";
const MAX_HISTORY = 60;

interface HistoryItem {
  sql: string;
  dataset: DatasetId;
  at: number;
  ok: boolean;
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function SqlLab({ initialDataset }: { initialDataset?: DatasetId }) {
  const engine = useSqlEngine();
  const [dataset, setDataset] = useState<DatasetId>(initialDataset ?? "ecommerce");
  const [sql, setSql] = useState("-- The SQL Lab: real PostgreSQL, in your browser.\n-- Pick a database on the left, write a query, press Run.\n\nSELECT customer_id, first_name, last_name, city\nFROM customers\nORDER BY customer_id\nLIMIT 10;");
  const [schema, setSchema] = useState<SchemaTable[] | null>(null);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => []);
  const [showHistory, setShowHistory] = useState(false);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<RunOutcome | null>(null);
  const [schemaRefreshKey, setSchemaRefreshKey] = useState(0);
  const bootedDataset = useRef<string | null>(null);

  /* restore history once after mount (client-only value) */
  useEffect(() => {
    const stored = loadHistory();
    if (stored.length > 0) {
      queueMicrotask(() => setHistory(stored));
    }
  }, []);

  /* boot the engine + dataset once */
  useEffect(() => {
    const ds = initialDataset ?? "ecommerce";
    if (bootedDataset.current === ds) return;
    bootedDataset.current = ds;
    void engine.use(ds);
  }, []);

  /* refresh the schema whenever the engine becomes ready (or after DDL) */
  useEffect(() => {
    let alive = true;
    if (engine.status.phase === "ready") {
      void engine.schema().then((s) => {
        if (alive && s) setSchema(s);
      });
    }
    return () => {
      alive = false;
    };
  }, [engine, engine.status.phase, schemaRefreshKey]);

  const pushHistory = useCallback((item: HistoryItem) => {
    setHistory((h) => {
      const next = [item, ...h.filter((x) => x.sql !== item.sql)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* storage full — history is best-effort */
      }
      return next;
    });
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setOutcome(null);
    const started = performance.now();
    const res = await engine.run(sql, dataset);
    const elapsed = res.elapsedMs ?? Math.round(performance.now() - started);
    setOutcome({ ...res, elapsedMs: elapsed });
    pushHistory({ sql, dataset, at: Date.now(), ok: !res.error });
    setRunning(false);
    setSchemaRefreshKey((k) => k + 1);
  }, [engine, sql, dataset, pushHistory]);

  const switchDataset = useCallback(
    async (next: DatasetId) => {
      setDataset(next);
      setSchema(null);
      setOutcome(null);
      setPreviewTable(null);
      await engine.use(next);
    },
    [engine]
  );

  const resetDatabase = useCallback(async () => {
    await engine.reset();
    setSchemaRefreshKey((k) => k + 1);
    setOutcome(null);
  }, [engine]);

  const openPreview = useCallback(
    async (table: string) => {
      setPreviewTable(table);
      setPreviewResult(null);
      setPreviewResult(await engine.preview(table, 100));
    },
    [engine]
  );

  const meta = DATASETS.find((d) => d.id === dataset)!;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">SQL Lab</h1>
            <p className="text-xs text-muted-foreground">
              PostgreSQL 18 running locally in your browser — isolated by design
            </p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              showHistory
                ? "border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-4 w-4" />
            History ({history.length})
          </button>
          <button
            type="button"
            onClick={() => void resetDatabase()}
            title="Restore the database to its original state"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset database
          </button>
          <button
            type="button"
            onClick={() => void run()}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white dv-lift hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {running ? "Running..." : "Run"}
            <kbd className="ml-1 hidden rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-mono sm:inline">Ctrl+↵</kbd>
          </button>
        </div>
      </div>

      <EngineStatusBanner status={engine.status} error={engine.engineError} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* left: dataset selector + schema explorer */}
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card">
            <div className="border-b px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sample databases
              </p>
            </div>
            <ul className="p-1.5">
              {DATASETS.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => void switchDataset(d.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      dataset === d.id
                        ? "bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                        : "text-foreground/85 hover:bg-muted/50"
                    )}
                  >
                    <Database className={cn("h-4 w-4 shrink-0", dataset === d.id ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{d.name}</span>
                      <span className="block truncate text-[11px] font-normal text-muted-foreground">{d.domain}</span>
                    </span>
                    {dataset === d.id && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              {meta.blurb}
            </p>
          </div>

          <div className="h-[420px] overflow-hidden rounded-xl border bg-card">
            <SchemaExplorer schema={schema} onPreview={(t) => void openPreview(t)} datasetId={dataset} />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-success-border bg-success-bg/60 px-3 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
            <p className="text-[11.5px] leading-relaxed text-success-text">
              <span className="font-semibold">Isolated by design.</span> Your queries run against a
              private, in-memory copy of this sample database inside your own browser. No server, no
              shared state, nothing to break — and no production system is ever reachable.
            </p>
          </div>
        </aside>

        {/* right: editor + results */}
        <div className="min-w-0 space-y-4">
          <SqlEditor
            value={sql}
            onChange={setSql}
            schema={schema}
            height="h-56"
            onRunShortcut={() => void run()}
          />

          {/* results / error / empty */}
          {outcome && (
            <div className="dv-fade-up rounded-xl border bg-card p-4">
              {outcome.result ? (
                <ResultGrid result={outcome.result} elapsedMs={outcome.elapsedMs} compact />
              ) : outcome.error ? (
                <ErrorPanel error={outcome.error} sql={sql} />
              ) : (
                <p className="text-sm text-muted-foreground">The engine is unavailable.</p>
              )}
            </div>
          )}
          {!outcome && engine.status.phase === "ready" && (
            <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Press <span className="font-semibold text-foreground">Run</span> to execute the query above —
                results, timing and errors appear here.
              </p>
            </div>
          )}

          {/* table viewer */}
          {previewTable && (
            <div className="dv-fade-up rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="font-mono text-sm font-semibold text-foreground">
                  {previewTable}
                </p>
                <span className="text-xs text-muted-foreground">— first 100 rows</span>
                <button
                  type="button"
                  onClick={() => setPreviewTable(null)}
                  className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              {previewResult?.result ? (
                <ResultGrid result={previewResult.result} compact />
              ) : previewResult?.error ? (
                <ErrorPanel error={previewResult.error} />
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">Loading rows...</p>
              )}
            </div>
          )}

          {/* history */}
          {showHistory && (
            <div className="dv-fade-up rounded-xl border bg-card">
              <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <History className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Query history</p>
                <span className="text-xs text-muted-foreground">(stored in your browser only)</span>
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem(HISTORY_KEY);
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-danger-text"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Nothing yet — every query you run is remembered here.
                </p>
              ) : (
                <ul className="max-h-80 divide-y overflow-y-auto">
                  {history.map((h, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          setSql(h.sql);
                          if (h.dataset !== dataset) void switchDataset(h.dataset);
                        }}
                        className="group flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-muted/40"
                      >
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            h.ok ? "bg-success-text" : "bg-danger-text"
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-[12px] text-foreground/85">
                            {h.sql.replace(/\s+/g, " ").slice(0, 110)}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(h.at).toLocaleString()}
                            <span className="font-mono">{h.dataset}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
