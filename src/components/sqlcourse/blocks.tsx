"use client";

/**
 * SQL course lesson block renderers.
 *
 * Mirrors the Python course's progressive-disclosure rendering with
 * SQL-specific blocks:
 *   - sql: code panel + REAL machine-verified result (rendered from the
 *     block's result field, produced by scripts/verify-sql-outputs.ts)
 *   - lab: an interactive mini editor backed by the shared SQL engine
 *   - psql: a terminal session transcript (display only)
 *   - visual / table / callout / steps: as in the Python course
 */
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Database,
  Flame,
  Info,
  Lightbulb,
  ListOrdered,
  Play,
  RefreshCw,
  Sparkles,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block, SqlResult } from "@/lib/sqlcourse/types";
import type { DatasetId } from "@/lib/sqlcourse/types";
import { datasetName } from "@/content/sql/datasets";
import { useSqlEngine } from "@/lib/sql-lab/useSqlEngine";
import { useSqlProgress } from "@/lib/sqlcourse/progress";
import { SqlEditor } from "@/components/sql-lab/SqlEditor";
import { ResultGrid, ErrorPanel } from "@/components/sql-lab/panels";
import { CopyButton } from "@/components/textbook/chrome";

/* -------------------- inline markdown (shared) -------------------- */

export function InlineText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/* -------------------- callout styles -------------------- */

const CALLOUT_STYLES = {
  tip: {
    icon: Lightbulb,
    wrapper: "border-success-border bg-success-bg/70",
    iconClass: "text-success-text",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-warning-border bg-warning-bg/70",
    iconClass: "text-warning-text",
  },
  info: {
    icon: Info,
    wrapper: "border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  analogy: {
    icon: Sparkles,
    wrapper: "border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/30",
    iconClass: "text-violet-600 dark:text-violet-400",
  },
} as const;

/* -------------------- verified result (static) -------------------- */

function VerifiedResult({ result }: { result: SqlResult }) {
  const hasRows = result.rows.length > 0;
  return (
    <div className="space-y-1.5 rounded-lg border border-l-2 border-l-success-text bg-muted/50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-success-text">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Real result — verified by executing this SQL on real PostgreSQL
        </span>
        {result.command && !hasRows && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
            {result.command}
          </span>
        )}
        {hasRows && (
          <span>
            {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {hasRows && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border/70">
                {result.columns.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-1.5 text-left font-mono text-[12px] font-semibold text-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-muted/30" : undefined}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "whitespace-nowrap border-b border-border/40 px-3 py-1 font-mono text-[12.5px]",
                        cell === null ? "italic text-muted-foreground/70" : "text-foreground/90"
                      )}
                    >
                      {cell === null ? "NULL" : cell === "" ? "''" : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result.note && (
        <p className="border-t pt-2 text-xs leading-relaxed text-muted-foreground">
          <InlineText text={result.note} />
        </p>
      )}
    </div>
  );
}

function ExplainList({ explain }: { explain: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-background">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/40"
        aria-expanded={open}
      >
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
        <span>Explain the result, line by line</span>
      </button>
      {open && (
        <ul className="space-y-2.5 border-t px-4 py-3">
          {explain.map((line, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <InlineText text={line} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------- mini lab (interactive) -------------------- */

export function MiniLab({
  title,
  task,
  code,
  dataset,
  hint,
}: {
  title: string;
  task?: string;
  code: string;
  dataset?: DatasetId;
  hint?: string;
}) {
  const engine = useSqlEngine();
  const [value, setValue] = useState(code);
  const [outcome, setOutcome] = useState<Awaited<ReturnType<typeof engine.run>> | null>(null);
  const [running, setRunning] = useState(false);
  const passedId = `lab:${title}`;
  const passed = useSqlProgress((s) => !!s.exercisesPassed[passedId]);

  const run = async () => {
    setRunning(true);
    setOutcome(null);
    const res = await engine.run(value, dataset);
    setOutcome(res);
    if (res.result) useSqlProgress.getState().markExercisePassed(passedId);
    setRunning(false);
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <Flame className="h-3.5 w-3.5" />
          Lab — run it yourself
        </span>
        {dataset && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Database className="h-3 w-3" />
            {datasetName(dataset)} database
          </span>
        )}
        {passed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-text">
            <CheckCircle2 className="h-3.5 w-3.5" /> ran successfully
          </span>
        )}
      </div>
      <p className="text-[15px] font-semibold leading-relaxed text-foreground">{title}</p>
      {task && (
        <p className="text-sm leading-relaxed text-foreground/85">
          <InlineText text={task} />
        </p>
      )}
      <SqlEditor value={value} onChange={setValue} height="h-40" onRunShortcut={() => void run()} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Running..." : "Run"}
          <kbd className="ml-0.5 hidden rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-mono sm:inline">Ctrl+↵</kbd>
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(code);
            setOutcome(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
        {(engine.status.phase === "boot" || engine.status.phase === "seed") && (
          <span className="text-xs text-muted-foreground">
            <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" />
            {engine.status.detail ?? "Preparing PostgreSQL..."}
          </span>
        )}
      </div>
      {engine.engineError && (
        <p className="rounded-lg border border-l-4 border-l-warning-text bg-warning-bg/70 px-3 py-2 text-xs leading-relaxed text-warning-text">
          {engine.engineError}
        </p>
      )}
      {outcome && (
        <div>
          {outcome.result ? (
            <ResultGrid result={outcome.result} elapsedMs={outcome.elapsedMs} compact />
          ) : outcome.error ? (
            <ErrorPanel error={outcome.error} sql={value} />
          ) : (
            <p className="text-sm text-muted-foreground">The engine is unavailable.</p>
          )}
        </div>
      )}
      {hint && (
        <details className="rounded-lg border bg-background/70 px-4 py-2.5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Need a hint?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <InlineText text={hint} />
          </p>
        </details>
      )}
    </div>
  );
}

/* -------------------- block dispatcher -------------------- */

export function BlockView({ block, anchorId }: { block: Block; anchorId?: string }) {
  switch (block.kind) {
    case "text":
      return (
        <p className="dv-lesson-text">
          <InlineText text={block.text} />
        </p>
      );

    case "heading":
      return (
        <h3 id={anchorId} className="dv-lesson-h3 mt-10 flex scroll-mt-24 items-baseline gap-2.5 text-ink">
          <span className="tb-bar self-stretch" aria-hidden />
          <span>{block.text}</span>
        </h3>
      );

    case "sql": {
      const isPsql = block.lang === "psql";
      return (
        <figure className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-editor-border bg-editor-bg shadow-e1">
            <div className="flex items-center gap-2 border-b border-editor-border bg-editor-chrome px-3 py-1">
              <span className="flex gap-1" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-editor-err/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-editor-warn/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-editor-ok/80" />
              </span>
              <span className="truncate font-mono text-[11px] uppercase tracking-wide text-editor-ink/60">
                {isPsql ? "psql — lines after = are PostgreSQL's answers" : (block.title ?? "SQL")}
              </span>
              {block.dataset && (
                <span className="ml-auto hidden items-center gap-1 font-mono text-[11px] text-editor-ink/70 sm:inline-flex">
                  <Database className="h-3 w-3" />
                  {datasetName(block.dataset)}
                </span>
              )}
              <CopyButton
                text={block.code}
                className="ml-auto text-editor-ink/60 hover:bg-editor-chrome hover:text-editor-ink"
              />
            </div>
            <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">
              {block.code.trimEnd()}
            </pre>
          </div>

          {block.expectError && (
            <div className="rounded-lg border border-l-2 border-l-danger-text bg-danger-bg/60 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger-text">
                <AlertTriangle className="h-3.5 w-3.5" />
                This statement deliberately fails — the real error is:
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-danger-text">
                {`ERROR:  ${block.expectError}`}
              </pre>
            </div>
          )}

          {block.result && <VerifiedResult result={block.result} />}
          {block.explain && block.explain.length > 0 && <ExplainList explain={block.explain} />}
        </figure>
      );
    }

    case "lab":
      return (
        <MiniLab
          title={block.title}
          task={block.task}
          code={block.code}
          dataset={block.dataset}
          hint={block.hint}
        />
      );

    case "visual":
      return (
        <figure className="space-y-2.5">
          <figcaption className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {block.title}
          </figcaption>
          <div className="overflow-x-auto rounded-lg border bg-muted/40 px-4 py-4">
            <pre className="font-mono text-[12.5px] leading-relaxed text-foreground/90">{block.ascii.trimEnd()}</pre>
          </div>
          {block.caption && (
            <p className="text-xs leading-relaxed text-muted-foreground">{block.caption}</p>
          )}
        </figure>
      );

    case "table":
      return (
        <figure className="space-y-2.5">
          {block.title && (
            <figcaption className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Table2 className="h-3.5 w-3.5" />
              {block.title}
            </figcaption>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  {block.headers.map((h, i) => (
                    <th key={i} scope="col" className="border-b px-4 py-2.5 text-left font-semibold text-foreground">
                      {h.trim() ? <InlineText text={h} /> : <span className="sr-only">Column {i + 1}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? "bg-muted/20" : undefined}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-border/60 px-4 py-2.5 align-top text-foreground/90">
                        <InlineText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <p className="text-xs leading-relaxed text-muted-foreground">{block.caption}</p>
          )}
        </figure>
      );

    case "callout": {
      const style = CALLOUT_STYLES[block.tone];
      const Icon = style.icon;
      return (
        <aside className={cn("rounded-lg border px-4 py-3.5", style.wrapper)}>
          <div className="flex gap-3">
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClass)} />
            <div>
              {block.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.title}</p>}
              <p className="text-sm leading-relaxed text-foreground/85">
                <InlineText text={block.text} />
              </p>
            </div>
          </div>
        </aside>
      );
    }

    case "steps":
      return (
        <div className="space-y-2.5">
          {block.title && (
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListOrdered className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {block.title}
            </p>
          )}
          <ol className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {i + 1}
                </span>
                <p className="text-[15px] leading-7 text-foreground/90">
                  <InlineText text={item} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      );

    default:
      return null;
  }
}

export function BlocksList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} anchorId={block.kind === "heading" ? `blk-${i}` : undefined} />
      ))}
    </div>
  );
}
