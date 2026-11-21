"use client";

/**
 * usePyodide — React hook wrapping the Pyodide runner worker.
 *
 * Guarantees:
 *   - one shared worker for the whole page (created lazily on first run)
 *   - per-run request ids, so stale responses are ignored
 *   - a hard timeout per run: an infinite loop cannot freeze the page —
 *     the worker is terminated and transparently recreated
 *   - a first-load state, so the UI can explain the one-time engine download
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface RunResult {
  stdout: string;
  stderr: string;
  error: string | null;
  ok: boolean;
  /** matplotlib figures rendered by the run (raw base64 PNG payloads). */
  images?: string[];
}

export interface RunOptions {
  /** Extra vendored packages to install before running (e.g. ["numpy"]). */
  packages?: string[];
  /** Per-run hard timeout in ms (default 20s). */
  timeoutMs?: number;
}

export interface PyodideState {
  /** Runs code. Resolves with the captured stdout/stderr and error, if any. */
  run: (code: string, opts?: RunOptions) => Promise<RunResult>;
  /** true while the Python engine is downloading/booting (first run only). */
  loadingEngine: boolean;
  /** true while code is executing. */
  running: boolean;
  /** Set when the engine failed to load or a run timed out. */
  engineError: string | null;
}

const RUN_TIMEOUT_MS = 20_000;

/** Packages can take a while to install on the first run (download + wasm
 * compile), so runs that request packages get a more generous budget. */
const PACKAGE_RUN_TIMEOUT_MS = 60_000;

export function usePyodide(): PyodideState {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, { resolve: (r: RunResult) => void; timer: ReturnType<typeof setTimeout> }>>(new Map());
  const idRef = useRef(0);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [running, setRunning] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  const ensureWorker = useCallback((): Worker => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker("/workers/pyodide-runner.js");
    worker.onmessage = (event: MessageEvent) => {
      const { id, stdout, stderr, error, ok, images } = event.data || {};
      const pending = pendingRef.current.get(id);
      if (!pending) return;
      clearTimeout(pending.timer);
      pendingRef.current.delete(id);
      if (pendingRef.current.size === 0) setRunning(false);
      pending.resolve({ stdout, stderr, error, ok, images: images ?? [] });
    };
    worker.onerror = (event) => {
      setEngineError(event.message || "The Python engine failed to load.");
      setLoadingEngine(false);
      setRunning(false);
      for (const [, p] of pendingRef.current) {
        clearTimeout(p.timer);
        p.resolve({ stdout: "", stderr: "", error: "The Python engine failed to load.", ok: false });
      }
      pendingRef.current.clear();
    };
    workerRef.current = worker;
    return worker;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const run = useCallback(
    async (code: string, opts?: RunOptions): Promise<RunResult> => {
      setEngineError(null);
      setRunning(true);
      setLoadingEngine(true);
      const worker = ensureWorker();
      const id = ++idRef.current;
      const packages = opts?.packages ?? [];
      const timeoutMs = opts?.timeoutMs ?? (packages.length > 0 ? PACKAGE_RUN_TIMEOUT_MS : RUN_TIMEOUT_MS);

      const result = await new Promise<RunResult>((resolve) => {
        const timer = setTimeout(() => {
          // Infinite loop protection: kill and recreate the worker.
          pendingRef.current.delete(id);
          workerRef.current?.terminate();
          workerRef.current = null;
          if (pendingRef.current.size === 0) {
            setRunning(false);
            setLoadingEngine(false);
          }
          resolve({
            stdout: "",
            stderr: "",
            error:
              `Execution timed out after ${Math.round(timeoutMs / 1000)} seconds.\n` +
              "A program that never finishes is usually an infinite loop — check that your `while` condition can become false,\n" +
              "or that your loop variable actually changes.",
            ok: false,
          });
        }, timeoutMs);

        pendingRef.current.set(id, { resolve, timer });
        worker.postMessage({ id, code, packages });
      });

      setLoadingEngine(false);
      return result;
    },
    [ensureWorker]
  );

  return { run, loadingEngine, running, engineError };
}
