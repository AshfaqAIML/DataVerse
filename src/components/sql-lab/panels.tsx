"use client";

/**
 * Shared SQL Lab display components: the results grid, the error panel
 * and the schema explorer. Used by the full Lab, lesson mini-labs and
 * exercise cards alike.
 */
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Database,
  Hash,
  KeyRound,
  Link2,
  RefreshCw,
  Search,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SqlCellView, SqlErrorView, SchemaTable } from "@/lib/sql-lab/useSqlEngine";
import { DATASET_MAP } from "@/content/sql/datasets";

/* ------------------------- results grid ------------------------- */

export function ResultGrid({
  result,
  elapsedMs,
  compact,
}: {
  result: SqlCellView;
  elapsedMs?: number;
  compact?: boolean;
}) {
  const hasRows = result.rows.length > 0;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-success-text">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {result.command ? result.command.toUpperCase() : "OK"}
        </span>
        {hasRows ? (
          <span>
            {result.rows.length} row{result.rows.length === 1 ? "" : "s"} &times; {result.columns.length}{" "}
            column{result.columns.length === 1 ? "" : "s"}
          </span>
        ) : (
          <span>executed successfully — no rows returned</span>
        )}
        {typeof elapsedMs === "number" && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {elapsedMs} ms
          </span>
        )}
      </div>
      {hasRows && (
        <div className={cn("overflow-auto rounded-lg border", compact ? "max-h-64" : "max-h-96")}>
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted">
                <th className="border-b px-2 py-1.5 text-left font-mono text-[11px] font-medium text-muted-foreground">
                  #
                </th>
                {result.columns.map((c) => (
                  <th
                    key={c}
                    className="border-b px-3 py-1.5 text-left font-mono text-[12px] font-semibold text-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-muted/25" : undefined}>
                  <td className="border-b border-border/50 px-2 py-1 text-right font-mono text-[11px] text-muted-foreground">
                    {ri + 1}
                  </td>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "whitespace-nowrap border-b border-border/50 px-3 py-1 font-mono text-[12.5px]",
                        cell === null
                          ? "italic text-muted-foreground/70"
                          : "text-foreground/90"
                      )}
                    >
                      {cell === null ? "NULL" : cell === "" ? <span className="text-muted-foreground/60">&apos;&apos;</span> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------- error panel ------------------------- */

export function ErrorPanel({ error, sql }: { error: SqlErrorView; sql?: string }) {
  let caret: string | null = null;
  if (sql && error.position) {
    const pos = Number(error.position);
    if (Number.isFinite(pos) && pos > 0 && pos <= sql.length + 1) {
      const before = sql.slice(0, pos - 1);
      const lastNewline = before.lastIndexOf("\n") + 1;
      const col = pos - 1 - lastNewline;
      caret = " ".repeat(col) + "^";
    }
  }
  return (
    <div className="rounded-lg border border-l-2 border-l-danger-text bg-danger-bg/60 px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger-text">
        <AlertTriangle className="h-3.5 w-3.5" />
        PostgreSQL returned an error{error.code ? ` (${error.code})` : ""}
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-danger-text">
        {`ERROR:  ${error.message}`}
        {error.detail ? `\nDETAIL: ${error.detail}` : ""}
        {error.hint ? `\nHINT:  ${error.hint}` : ""}
      </pre>
      {caret && sql && <CaretBlock sql={sql} position={Number(error.position)} />}
    </div>
  );
}

function CaretBlock({ sql, position }: { sql: string; position: number }) {
  const lines: string[] = [];
  let charCount = 0;
  for (const line of sql.split("\n")) {
    const start = charCount;
    charCount += line.length + 1;
    if (position > start && position <= charCount) {
      lines.push(line);
      lines.push(" ".repeat(position - 1 - start) + "^");
    }
  }
  return (
    <pre className="mt-2 overflow-x-auto rounded bg-danger-bg/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-danger-text">
      {lines.join("\n")}
    </pre>
  );
}

/* ------------------------- schema explorer ------------------------- */

export function SchemaExplorer({
  schema,
  onPreview,
  datasetId,
}: {
  schema: SchemaTable[] | null;
  onPreview?: (table: string) => void;
  datasetId?: string;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");

  const meta = datasetId ? DATASET_MAP[datasetId as keyof typeof DATASET_MAP] : null;
  const tables = (schema ?? []).filter(
    (t) => !filter || t.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Database className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            type="search"
            aria-label="Filter tables by name"
            placeholder="Filter tables…"
            className="h-8 w-full rounded-md border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!schema && (
          <p className="px-2 py-4 text-xs leading-relaxed text-muted-foreground">
            Run any query (or press refresh) to load the schema of the current database.
          </p>
        )}
        {schema && tables.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">No tables match the filter.</p>
        )}
        <ul className="space-y-0.5">
          {tables.map((t) => {
            const doc = meta?.tables.find((d) => d.name === t.name);
            const isOpen = !!open[t.name];
            return (
              <li key={t.name}>
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-muted/60",
                    isOpen && "bg-muted/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [t.name]: !o[t.name] }))}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                        !isOpen && "-rotate-90"
                      )}
                    />
                    <Table2 className="h-3.5 w-3.5 shrink-0 text-warning-text" />
                    <span className="truncate font-mono text-[12.5px] font-medium text-foreground">
                      {t.name}
                    </span>
                    <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                      {t.rowCount ?? "?"}
                    </span>
                  </button>
                  {onPreview && (
                    <button
                      type="button"
                      title={`Preview ${t.name}`}
                      aria-label={`Preview ${t.name} — first rows`}
                      onClick={() => onPreview(t.name)}
                      className="dv-hit shrink-0 rounded p-1.5 text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ul className="ml-[22px] border-l border-border/60 pl-2 pt-0.5">
                    {doc && (
                      <li className="py-1 text-[11px] leading-snug text-muted-foreground">{doc.purpose}</li>
                    )}
                    {t.columns.map((c) => (
                      <li
                        key={c.name}
                        title={
                          c.references.length > 0
                            ? `References ${c.references.join(", ")}`
                            : `${c.type}${c.nullable ? " — nullable" : ""}`
                        }
                        className="flex items-center gap-1.5 py-0.5"
                      >
                        {c.primaryKey ? (
                          <KeyRound className="h-3 w-3 shrink-0 text-warning-text" />
                        ) : c.references.length > 0 ? (
                          <Link2 className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Hash className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                        )}
                        <span className="truncate font-mono text-[11.5px] text-foreground/90">{c.name}</span>
                        <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                          {c.type.replace("character varying", "varchar").replace("timestamp without time zone", "timestamp")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------- misc bits ------------------------- */

export function EngineStatusBanner({
  status,
  error,
  onReset,
}: {
  status: { phase: string; detail?: string };
  error: string | null;
  onReset?: () => void;
}) {
  if (error) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-l-4 border-l-warning-text bg-warning-bg/70 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-text" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-warning-text">{error}</p>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-warning-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/50"
            >
              <RefreshCw className="h-3 w-3" />
              Restart the engine
            </button>
          )}
        </div>
      </div>
    );
  }
  if (status.phase === "boot") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {status.detail ?? "Starting PostgreSQL (WebAssembly)..."}
        <span className="text-xs">first run downloads ~9 MB, then it is instant</span>
      </div>
    );
  }
  if (status.phase === "seed") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {status.detail ?? "Loading the sample database..."}
      </div>
    );
  }
  return null;
}
