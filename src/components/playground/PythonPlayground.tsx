"use client";

/**
 * PythonPlayground — the in-browser Python editor.
 *
 * Used in three places:
 *   - standalone (the course's Playground page)
 *   - embedded in lessons ("Try it" blocks)
 *   - embedded in exercises and projects (with an optional Check button
 *     that compares the learner's output against the verified expected
 *     output)
 *
 * The editor is deliberately simple (a well-behaved textarea with
 * auto-indent and tab-to-spaces) so nothing distracts from the code —
 * this is a learning playground, not a production IDE.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw, Terminal, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePyodide, type RunResult } from "./usePyodide";

export interface PlaygroundResult extends RunResult {
  /** Present only when checking against an expected output. */
  checked?: { passed: boolean; expected: string; actual: string };
}

interface PythonPlaygroundProps {
  initialCode: string;
  /** When provided, a Check button compares normalized output. */
  expectedOutput?: string;
  /** Editor height class, e.g. "h-40" or "h-[420px]". */
  editorHeight?: string;
  /** Persisted label for the reset source. */
  compact?: boolean;
  /** Extra vendored packages to install before running (e.g. ["numpy"]). */
  packages?: string[];
  /** Label shown in the header ("Python playground" / "NumPy playground"). */
  engineLabel?: string;
  /** Note shown while the engine downloads on the first run. */
  firstLoadNote?: string;
  onResult?: (result: PlaygroundResult) => void;
}

function normalize(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

export function PythonPlayground({
  initialCode,
  expectedOutput,
  editorHeight = "h-40",
  compact = false,
  packages,
  engineLabel,
  firstLoadNote,
  onResult,
}: PythonPlaygroundProps) {
  const { run, loadingEngine, running, engineError } = usePyodide();
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [ranOnce, setRanOnce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = running || loadingEngine;

  const reset = useCallback(() => {
    setCode(initialCode);
    setResult(null);
    setRanOnce(false);
  }, [initialCode]);

  const doRun = useCallback(async () => {
    const r = await run(code, { packages });
    const out: PlaygroundResult = r;
    setResult(out);
    setRanOnce(true);
    onResult?.(out);
  }, [code, run, onResult, packages]);

  const doCheck = useCallback(async () => {
    const r = await run(code, { packages });
    const actual = normalize(r.stdout);
    const expected = normalize(expectedOutput ?? "");
    const passed = r.ok && actual === expected;
    const out: PlaygroundResult = {
      ...r,
      checked: { passed, expected: expectedOutput ?? "", actual: r.stdout },
    };
    setResult(out);
    setRanOnce(true);
    onResult?.(out);
  }, [code, run, expectedOutput, onResult, packages]);

  // Keyboard: Cmd/Ctrl+Enter runs.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy) void doRun();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
      return;
    }
    if (e.key === "Enter") {
      // Auto-indent: keep the previous line's indentation; add one level
      // after a line that ends with ":" (block opener).
      const el = e.currentTarget;
      const start = el.selectionStart;
      const before = code.slice(0, start);
      const lineStart = before.lastIndexOf("\n") + 1;
      const line = before.slice(lineStart);
      const indent = (line.match(/^[ \t]*/) ?? [""])[0];
      const extra = /:\s*$/.test(line) ? "    " : "";
      e.preventDefault();
      const insert = "\n" + indent + extra;
      const next = before + insert + code.slice(el.selectionEnd);
      setCode(next);
      requestAnimationFrame(() => {
        const pos = start + insert.length;
        el.selectionStart = el.selectionEnd = pos;
      });
    }
  };

  const outputBody = useMemo(() => {
    if (!ranOnce) return null;
    const parts: React.ReactNode[] = [];
    if (result?.checked) {
      parts.push(
        <div
          key="check"
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2 text-sm font-medium",
            result.checked.passed
              ? "border-success-border bg-success-bg text-success-text"
              : "border-warning-border bg-warning-bg text-warning-text"
          )}
        >
          {result.checked.passed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            {result.checked.passed ? (
              <span>Output matches — solved!</span>
            ) : (
              <span>Output does not match yet. Compare carefully, line by line:</span>
            )}
            {!result.checked.passed && (
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">
                <span className="opacity-60">Expected:</span>
                {"\n"}
                {result.checked.expected}
                {"\n\n"}
                <span className="opacity-60">Your output:</span>
                {"\n"}
                {result.checked.actual || "(no output)"}
              </pre>
            )}
          </div>
        </div>
      );
    }
    if (result?.stdout) {
      parts.push(
        <pre key="stdout" className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
          {result.stdout.replace(/\n$/, "")}
        </pre>
      );
    }
    if (result?.error) {
      parts.push(
        <pre
          key="error"
          className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-danger-text"
        >
          {result.error.replace(/\n$/, "")}
        </pre>
      );
    }
    if (!result?.stdout && !result?.error) {
      parts.push(
        <p key="empty" className="text-sm text-muted-foreground">
          Program finished with no output. (Nothing was printed — check that you called print().)
        </p>
      );
    }
    return parts;
  }, [ranOnce, result]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-e1">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <Terminal className="h-4 w-4 text-success-text" />
        <span className="mr-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {engineLabel ?? "Python playground"} — runs in your browser
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => void doRun()}
          disabled={busy}
          className="h-8 bg-success-solid text-white hover:bg-success-solid dark:text-white"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {loadingEngine && !ranOnce ? "Load engine & run" : "Run"}
        </Button>
        {expectedOutput !== undefined && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void doCheck()}
            disabled={busy}
            className="h-8"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Check
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={busy} className="h-8">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {engineError && (
        <div className="border-t border-warning-border bg-warning-bg px-4 py-2.5 text-sm font-medium text-warning-text">
          <XCircle className="mr-2 inline h-4 w-4 align-[-3px]" />
          {engineError} Reload the page and try again — your code is kept.
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Python code editor"
        className={cn(
          "block w-full resize-y bg-background px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none",
          compact ? "min-h-24" : "min-h-32",
          editorHeight
        )}
      />

      <div className="border-t bg-muted/20 px-3 py-1.5">
        <p className="text-[11px] text-muted-foreground">
          {loadingEngine && !ranOnce
            ? firstLoadNote ??
              "First run downloads the Python engine once (~13 MB, cached afterwards by your browser)."
            : "Ctrl/Cmd + Enter runs · Tab inserts 4 spaces · Enter auto-indents after a colon"}
        </p>
      </div>

      {ranOnce && (
        <div className="max-h-72 space-y-3 overflow-y-auto border-t px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output</p>
          {outputBody}
        </div>
      )}
    </div>
  );
}
