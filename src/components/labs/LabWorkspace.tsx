"use client";

/**
 * LabWorkspace — the unified laboratory interface shared by all seven
 * disciplines (Python, SQL, NumPy, pandas, Statistics, Data Visualization,
 * Machine Learning).
 *
 * Every element of the editor layout is real:
 *   - instructions panel   — the exercise prompt, concepts, progressive hint
 *   - code editor          — CodeMirror (Python) / SQL editor with live schema
 *   - run controls         — Run executes on the real engine (Pyodide worker
 *                            with vendored wheels / PGlite worker); Check
 *                            compares against the engine-verified expected
 *                            output; Reset restores the starter
 *   - console & results    — captured stdout, matplotlib figures, result grids
 *   - error messages       — full tracebacks / PostgreSQL errors with hints
 *   - test results         — pass/fail with expected-vs-actual diff
 *   - explanations         — the teaching note, revealed after a check
 *
 * Lab progress (which exercises passed) is kept per browser in
 * localStorage — the same contract as the guest course readers.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Brain, CheckCircle2, Circle,
  Grid3x3, Lightbulb, Loader2, Play, RotateCcw, Sigma, Table2, Terminal, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import { Button } from "@/components/ui/button";
import { labDiscipline, type LabDisciplineMeta, type LabExercise, type SqlExercise } from "@/lib/labs/lab-data";
import { CodeEditor } from "./CodeEditor";
import { SqlEditor } from "@/components/sql-lab/SqlEditor";
import { ResultGrid, ErrorPanel, SchemaExplorer, EngineStatusBanner } from "@/components/sql-lab/panels";
import { useSqlEngine, type SqlCellView, type SqlErrorView, type SchemaTable } from "@/lib/sql-lab/useSqlEngine";
import { usePyodide, type RunResult } from "@/components/playground/usePyodide";

/* ------------------------------ lab progress ------------------------------ */

const LAB_PROGRESS_KEY = "dv-lab-progress-v1";

function readLabProgress(): Record<string, { passed: boolean; at: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LAB_PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLabProgress(next: Record<string, { passed: boolean; at: string }>) {
  try {
    localStorage.setItem(LAB_PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — progress simply is not persisted */
  }
}

/* -------------------------------- helpers -------------------------------- */

function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .trim();
}

function cellsEqual(a: string | number | null, b: string | null): boolean {
  const sa = a === null ? "" : String(a);
  const sb = b === null ? "" : String(b);
  if (sa === sb) return true;
  const na = Number(sa);
  const nb = Number(sb);
  if (sa !== "" && sb !== "" && Number.isFinite(na) && Number.isFinite(nb)) {
    return Math.abs(na - nb) <= Math.max(1e-9, Math.abs(nb) * 1e-9);
  }
  return false;
}

function gridsEqual(
  expected: { columns: string[]; rows: (string | number | null)[][] },
  actual: SqlCellView
): boolean {
  if (JSON.stringify(expected.columns.map((c) => c.toLowerCase())) !== JSON.stringify(actual.columns.map((c) => c.toLowerCase()))) {
    return false;
  }
  if (expected.rows.length !== actual.rows.length) return false;
  for (let r = 0; r < expected.rows.length; r++) {
    for (let c = 0; c < expected.columns.length; c++) {
      if (!cellsEqual(expected.rows[r][c], actual.rows[r][c])) return false;
    }
  }
  return true;
}

function gridDiffSummary(
  expected: { columns: string[]; rows: (string | number | null)[][] },
  actual: SqlCellView
): string {
  const parts: string[] = [];
  if (expected.rows.length !== actual.rows.length) {
    parts.push(`row count: expected ${expected.rows.length}, got ${actual.rows.length}`);
  }
  const colExp = expected.columns.map((c) => c.toLowerCase()).join(", ");
  const colAct = actual.columns.map((c) => c.toLowerCase()).join(", ");
  if (colExp !== colAct) parts.push(`columns: expected [${colExp}], got [${colAct}]`);
  const n = Math.min(expected.rows.length, actual.rows.length);
  for (let r = 0; r < n && parts.length < 3; r++) {
    for (let c = 0; c < expected.columns.length && parts.length < 3; c++) {
      if (!cellsEqual(expected.rows[r][c], actual.rows[r][c])) {
        parts.push(
          `row ${r + 1}, “${expected.columns[c]}”: expected “${expected.rows[r][c]}”, got “${actual.rows[r][c]}”`
        );
      }
    }
  }
  if (parts.length === 0) parts.push("row order differs — check your ORDER BY");
  return parts.join(" · ");
}

/* ================================ pieces ================================= */

function LabIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  switch (name) {
    case "python":
      return <Terminal className={className} />;
    case "sql":
      return <Table2 className={className} />;
    case "numpy":
      return <Grid3x3 className={className} />;
    case "pandas":
      return <BookOpen className={className} />;
    case "statistics":
      return <Sigma className={className} />;
    case "dataviz":
      return <BarChart3 className={className} />;
    case "ml":
      return <Brain className={className} />;
    default:
      return <Terminal className={className} />;
  }
}

function StdoutConsole({ stdout }: { stdout: string }) {
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-editor-ink">
      {stdout.replace(/\n$/, "")}
    </pre>
  );
}

function TracebackPanel({ error }: { error: string }) {
  // split the final error line (highlight) from the frames
  const lines = error.trim().split("\n");
  const lastLine = lines[lines.length - 1];
  const frames = lines.slice(0, -1);
  return (
    <div className="space-y-2">
      {frames.length > 0 && (
        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-editor-ink/70">
          {frames.join("\n")}
        </pre>
      )}
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-editor-err/10 px-3 py-2 font-mono text-[13px] leading-relaxed text-editor-err">
        {lastLine}
      </pre>
    </div>
  );
}

function FigureGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div className="space-y-3">
      {images.map((b64, i) => (
        <figure key={i} className="overflow-hidden rounded-xl border border-editor-border bg-white">
          {/* max-w-full h-auto: matplotlib figures are 640–800px wide and
              were being cropped (content loss) on phones. */}
          <img src={`data:image/png;base64,${b64}`} alt={`Figure ${i + 1} rendered by your code`} className="mx-auto block h-auto max-w-full" />
          <figcaption className="border-t border-border-subtle bg-surface-subtle px-3 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-3">
            Figure {i + 1} — rendered by matplotlib in your browser
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ExpectedVsActual({ expected, actual }: { expected: string; actual: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div>
        <p className="dv-kicker mb-1.5 text-editor-ok">Expected</p>
        <pre className="overflow-x-auto rounded-lg border border-editor-ok/25 bg-editor-ok/10 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-editor-ink">
          {expected || "(no output)"}
        </pre>
      </div>
      <div>
        <p className="dv-kicker mb-1.5 text-editor-warn">Your output</p>
        <pre className="overflow-x-auto rounded-lg border border-editor-warn/25 bg-editor-warn/10 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-editor-ink">
          {actual || "(no output)"}
        </pre>
      </div>
    </div>
  );
}

function ConceptChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border-subtle bg-surface-subtle px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-ink-3">
      {children}
    </span>
  );
}

/* ============================== the workspace ============================= */

export function LabWorkspace({ disciplineId, initialExercise, navigate }: { disciplineId: string; initialExercise?: number; navigate: (hash: string) => void }) {
  const meta = labDiscipline(disciplineId);
  const [mode, setMode] = useState<"exercises" | "scratch">("exercises");
  const [exerciseIndex, setExerciseIndex] = useState(initialExercise ?? 0);
  const [code, setCode] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [progress, setProgress] = useState<Record<string, { passed: boolean; at: string }>>({});
  const [checked, setChecked] = useState<null | { passed: boolean }>(null);

  // python-family engine
  const { run, loadingEngine, running, engineError } = usePyodide();
  const [runResult, setRunResult] = useState<(RunResult & { checked?: { passed: boolean } }) | null>(null);

  // sql engine
  const sqlEngine = useSqlEngine();
  const [sqlSchema, setSqlSchema] = useState<SchemaTable[] | null>(null);
  const [sqlResult, setSqlResult] = useState<SqlCellView | null>(null);
  const [sqlError, setSqlError] = useState<SqlErrorView | null>(null);
  const [sqlElapsed, setSqlElapsed] = useState<number | undefined>(undefined);
  const [sqlBusy, setSqlBusy] = useState(false);

  const isSql = meta?.kind === "sql";
  const exercise: LabExercise | SqlExercise | undefined =
    meta && mode === "exercises" ? (meta.sqlExercises ?? meta.exercises)[exerciseIndex] : undefined;
  const busy = isSql ? sqlBusy : running || loadingEngine;
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // lab progress lives in localStorage — an external store, read post-mount
    queueMicrotask(() => setProgress(readLabProgress()));
  }, []);

  // load starter code when the exercise/mode changes — resetting editor
  // state is a post-render concern, so it rides a microtask
  useEffect(() => {
    const starter = meta ? (mode === "scratch" ? meta.scratchStarter : (exercise?.starter ?? meta.scratchStarter)) : null;
    queueMicrotask(() => {
      setChecked(null);
      setHintOpen(false);
      setShowSolution(false);
      setRunResult(null);
      setSqlResult(null);
      setSqlError(null);
      if (starter !== null) setCode(starter);
    });
  }, [disciplineId, mode, exerciseIndex]);

  // SQL: boot engine + schema on mount (exercises and scratch both need it)
  useEffect(() => {
    if (!isSql) return;
    let cancelled = false;
    (async () => {
      setSqlBusy(true);
      const ok = await sqlEngine.use("ecommerce");
      if (ok && !cancelled) {
        const schema = await sqlEngine.schema();
        if (!cancelled) setSqlSchema(schema);
      }
      if (!cancelled) setSqlBusy(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isSql]);

  const list = useMemo(() => (meta ? meta.sqlExercises ?? meta.exercises : []), [meta]);
  const passedCount = useMemo(
    () => list.filter((e) => progress[e.id]?.passed).length,
    [list, progress]
  );

  const markPassed = useCallback(
    (exerciseId: string) => {
      setProgress((prev) => {
        if (prev[exerciseId]?.passed) return prev;
        const next = { ...prev, [exerciseId]: { passed: true, at: new Date().toISOString() } };
        writeLabProgress(next);
        return next;
      });
    },
    []
  );

  /* ------------------------------ run paths ------------------------------ */

  const runPython = useCallback(async () => {
    if (!meta) return;
    setChecked(null);
    const r = await run(code, { packages: meta.packages });
    setRunResult(r);
  }, [code, meta, run]);

  const runSql = useCallback(async () => {
    setChecked(null);
    setSqlResult(null);
    setSqlError(null);
    setSqlBusy(true);
    const outcome = await sqlEngine.run(code, "ecommerce");
    setSqlBusy(false);
    if (outcome?.error) setSqlError(outcome.error);
    else if (outcome?.result) {
      setSqlResult(outcome.result);
      setSqlElapsed(outcome.elapsedMs);
    }
  }, [code, sqlEngine]);

  const doRun = isSql ? runSql : runPython;

  const doCheck = useCallback(async () => {
    if (!meta || !exercise) return;
    if (isSql) {
      const sqlEx = exercise as SqlExercise;
      setSqlBusy(true);
      setSqlError(null);
      setSqlResult(null);
      const outcome = await sqlEngine.run(code, "ecommerce");
      if (outcome?.error) {
        setSqlError(outcome.error);
        setSqlBusy(false);
        setChecked({ passed: false });
        return;
      }
      const grid = outcome?.result ?? null;
      if (grid) {
        setSqlResult(grid);
        setSqlElapsed(outcome.elapsedMs);
        const passed = gridsEqual(sqlEx.expected, grid);
        setChecked({ passed });
        if (passed) markPassed(sqlEx.id);
      }
      setSqlBusy(false);
    } else {
      const r = await run(code, { packages: meta.packages });
      setRunResult(r);
      if (!r.error && "expectedOutput" in exercise) {
        const passed = normalizeOutput(r.stdout) === normalizeOutput(exercise.expectedOutput);
        setChecked({ passed });
        if (passed) markPassed(exercise.id);
      } else {
        setChecked({ passed: false });
      }
    }
  }, [code, exercise, isSql, markPassed, meta, run, sqlEngine]);

  const doReset = useCallback(() => {
    setCode(mode === "scratch" ? meta?.scratchStarter ?? "" : exercise?.starter ?? "");
    setChecked(null);
    setRunResult(null);
    setSqlResult(null);
    setSqlError(null);
  }, [exercise?.starter, meta?.scratchStarter, mode]);

  /* ------------------------------- render ------------------------------- */

  if (!meta) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Unknown laboratory: {disciplineId}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("#/labs")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All laboratories
        </Button>
      </div>
    );
  }

  const scrollToOutput = () => requestAnimationFrame(() => {
    if (outputRef.current) scrollIntoViewSafe(outputRef.current, { block: "nearest" });
  });

  return (
    <div className="min-w-0 space-y-5">
      {/* --------------------------------------------- header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("#/labs")}
            className="mb-1.5 flex items-center gap-1 text-[12px] font-medium text-ink-3 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All laboratories
          </button>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.hue} 14%, transparent)` }}
            >
              <LabIcon name={meta.icon} className="h-5 w-5" />
            </span>
            <div>
              <h1 className="t-page text-ink">{meta.name}</h1>
              <p className="t-caption mt-0.5">{meta.tagline}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border-subtle bg-surface p-1 shadow-e1" role="group" aria-label="Workspace mode">
            <button
              type="button"
              onClick={() => setMode("exercises")}
              aria-pressed={mode === "exercises"}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                mode === "exercises" ? "bg-primary text-primary-foreground" : "text-ink-3 hover:text-ink"
              )}
            >
              Exercises {list.length > 0 && <span className="tabular ml-1 rounded-md bg-black/20 px-1.5 py-px text-[12px]">{passedCount}/{list.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setMode("scratch")}
              aria-pressed={mode === "scratch"}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                mode === "scratch" ? "bg-primary text-primary-foreground" : "text-ink-3 hover:text-ink"
              )}
            >
              Scratch pad
            </button>
          </div>
        </div>
      </header>

      <div className={cn("grid grid-cols-1 gap-5", mode === "exercises" ? "lg:grid-cols-[240px_1fr]" : "")}>
        {/* ------------------------------------ exercise rail */}
        {mode === "exercises" && (
          <aside className="space-y-1.5 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
            {list.map((ex, i) => {
              const passed = !!progress[ex.id]?.passed;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setExerciseIndex(i)}
                  aria-current={i === exerciseIndex ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                    i === exerciseIndex
                      ? "border-primary/40 bg-surface shadow-e1"
                      : "border-transparent hover:border-border-subtle hover:bg-surface"
                  )}
                >
                  {passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3/80" />
                  )}
                  <span className="min-w-0">
                    <span className={cn("block line-clamp-2 text-[13px] font-medium leading-snug", i === exerciseIndex ? "text-ink" : "text-ink-2")}>
                      {ex.title}
                    </span>
                    <span className="t-meta capitalize">{ex.difficulty}</span>
                  </span>
                </button>
              );
            })}
          </aside>
        )}

        {/* ---------------------------------------- main column */}
        <div className="min-w-0 space-y-4">
          {/* instructions */}
          {mode === "exercises" && exercise && (
            <section key={exercise.id} className="dv-fade-up rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="dv-kicker" style={{ color: meta.hue }}>
                  {meta.name.replace(" Laboratory", "")} exercise
                </p>
                <span className="text-ink-3">·</span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.concepts.map((c) => (
                    <ConceptChip key={c}>{c}</ConceptChip>
                  ))}
                </div>
              </div>
              <h2 className="t-sub mt-2 text-ink">{exercise.title}</h2>
              <p className="t-body mt-2 leading-relaxed">{exercise.prompt}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHintOpen((v) => !v)}
                  aria-expanded={hintOpen}
                  aria-controls="dv-lab-hint"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-border-strong"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-warning-text" />
                  {hintOpen ? "Hide hint" : "Hint"}
                </button>
                {(progress[exercise.id]?.passed || showSolution) && (
                  <button
                    type="button"
                    onClick={() => setShowSolution((v) => !v)}
                    aria-expanded={showSolution}
                    aria-controls="dv-lab-solution"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-border-strong"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-ink-3" />
                    {showSolution ? "Hide reference" : "Reference solution"}
                  </button>
                )}
              </div>

              {hintOpen && (
                <p id="dv-lab-hint" className="dv-expand mt-3 rounded-xl border border-warning-border bg-warning-bg/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
                  <Lightbulb className="mr-1.5 inline h-4 w-4 align-[-3px] text-warning-text" />
                  {exercise.hint}
                </p>
              )}

              {(progress[exercise.id]?.passed || showSolution) && showSolution && (
                <div id="dv-lab-solution" className="dv-expand mt-3">
                  <p className="dv-kicker mb-1.5">Reference solution</p>
                  <pre
                    className="dv-scroll-region overflow-x-auto rounded-xl border border-editor-border bg-editor-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-editor-ink"
                    tabIndex={0}
                    role="region"
                    aria-label="Reference solution — scrollable"
                  >
                    {exercise.solution}
                  </pre>
                </div>
              )}
            </section>
          )}

          {/* editor + run controls */}
          <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
            <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-subtle/60 px-4 py-2.5">
              <span className="mr-auto flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-3">
                <Terminal className="h-4 w-4" />
                {isSql ? "editor · PostgreSQL" : "editor · Python"}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void doRun();
                  scrollToOutput();
                }}
                disabled={busy}
                className="h-8 gap-1.5"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {mode === "exercises" ? "Run" : "Run"}
              </Button>
              {mode === "exercises" && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void doCheck();
                    scrollToOutput();
                  }}
                  disabled={busy}
                  className="h-8 gap-1.5"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Check
                </Button>
              )}
              <Button type="button" size="sm" variant="ghost" onClick={doReset} disabled={busy} className="h-8 gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {isSql ? (
              <div className="p-1">
                <SqlEditor
                  value={code}
                  onChange={setCode}
                  schema={sqlSchema}
                  height="300px"
                  onRunShortcut={() => {
                    void doRun();
                    scrollToOutput();
                  }}
                />
              </div>
            ) : (
              <div className="p-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  height="300px"
                  onRunShortcut={() => {
                    void doRun();
                    scrollToOutput();
                  }}
                />
              </div>
            )}

            <p className="border-t border-border-subtle bg-surface-subtle/40 px-4 py-1.5 text-[11px] text-ink-3">
              {isSql
                ? "Ctrl/Cmd+Enter runs · the schema browser below lists every table"
                : loadingEngine && !runResult
                  ? meta.firstLoadNote
                  : "Ctrl/Cmd+Enter runs · Python " + (meta.packages.length > 0 ? `+ ${meta.packages.join(", ")}` : "3.12") + " in your browser"}
            </p>
          </section>

          {/* sql schema browser */}
          {isSql && (
            <section className="rounded-2xl border border-border-subtle bg-surface shadow-e1">
              <div className="border-b border-border-subtle px-4 py-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Schema · ShopSphere</p>
              </div>
              <div className="p-3">
                <SchemaExplorer schema={sqlSchema} />
              </div>
            </section>
          )}

          {/* output: console · errors · figures · results · tests · explanation */}
          <div ref={outputRef} className="space-y-4">
            {isSql && sqlEngine.status.phase !== "ready" && sqlEngine.status.phase !== "idle" && (
              <EngineStatusBanner status={sqlEngine.status} error={sqlEngine.engineError} onReset={() => void sqlEngine.reset().then(() => window.location.reload())} />
            )}

            {isSql && sqlError && (
              <section className="dv-fade-up rounded-2xl border border-border-subtle bg-surface p-4 shadow-e1">
                <p className="dv-kicker mb-2 text-danger-text">PostgreSQL error</p>
                <ErrorPanel error={sqlError} sql={code} />
              </section>
            )}

            {isSql && sqlResult && (
              <section className="dv-fade-up rounded-2xl border border-border-subtle bg-surface p-4 shadow-e1">
                <p className="dv-kicker mb-2">Result</p>
                <ResultGrid result={sqlResult} elapsedMs={sqlElapsed} />
              </section>
            )}

            {!isSql && (runResult || engineError) && (
              <section aria-live="polite" className="dv-fade-up rounded-2xl border border-editor-border bg-editor-bg p-4 shadow-e1">
                <p className="dv-kicker mb-3 text-editor-ink/70">Console</p>
                {engineError && (
                  <p className="rounded-lg border border-editor-warn/40 bg-editor-warn/10 px-3 py-2 text-[13px] text-editor-warn">
                    {engineError}
                  </p>
                )}
                {runResult?.stdout && <StdoutConsole stdout={runResult.stdout} />}
                {runResult?.error && <TracebackPanel error={runResult.error} />}
                {runResult && !runResult.stdout && !runResult.error && (
                  <p className="text-[13px] text-editor-ink/70">
                    Program finished with no output — check that you called print().
                  </p>
                )}
                {runResult?.images && runResult.images.length > 0 && (
                  <div className="mt-4">
                    <FigureGallery images={runResult.images} />
                  </div>
                )}
              </section>
            )}

            {/* test verdict */}
            {mode === "exercises" && checked && exercise && (
              <section
                role="status"
                aria-label="Check result"
                className={cn(
                  "dv-fade-up rounded-2xl border p-4 shadow-e1",
                  checked.passed
                    ? "border-success-text/40 bg-success-text/10"
                    : "border-warning-text/40 bg-warning-text/10"
                )}
              >
                <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  {checked.passed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success-text" />
                      Tests passed — solved
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-warning-text" />
                      Not quite yet
                    </>
                  )}
                </p>

                {!checked.passed && isSql && sqlResult && exercise && "expected" in exercise && (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                    {gridDiffSummary(
                      (exercise as { expected: { columns: string[]; rows: (string | number | null)[][] } }).expected,
                      sqlResult
                    )}
                  </p>
                )}
                {!checked.passed && !isSql && runResult && exercise && (
                  <div className="mt-3">
                    <ExpectedVsActual
                      expected={"expectedOutput" in exercise ? exercise.expectedOutput : ""}
                      actual={runResult.stdout}
                    />
                  </div>
                )}
                {!checked.passed && !isSql && runResult?.error && (
                  <p className="mt-2 text-[13px] text-ink-2">
                    The program raised an error before printing anything — fix the traceback above first.
                  </p>
                )}

                <div className="mt-3 border-t border-ink/5 pt-3">
                  <p className="dv-kicker mb-1">Why it works</p>
                  <p className="text-[13.5px] leading-relaxed text-ink-2">{exercise.explanation}</p>
                </div>

                {checked.passed && exerciseIndex < list.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    onClick={() => setExerciseIndex((i) => i + 1)}
                  >
                    Next exercise <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
