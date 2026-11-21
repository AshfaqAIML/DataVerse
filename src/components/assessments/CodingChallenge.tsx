"use client";

/**
 * CodingChallenge — a server-graded programming challenge with a real
 * editor. Run executes the code in the browser (the same Pyodide engine as
 * the laboratories, including numpy when the challenge needs it); Submit
 * sends the code to POST /api/exercises/[id]/submissions where it is
 * executed against the exercise's test cases (visible + hidden) by the
 * platform's runner, with per-case results returned and persisted.
 */
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, ArrowLeft, Brain, CheckCircle2, ChevronLeft, Clock, Code2,
  Loader2, Play, RotateCcw, Send, Trophy, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/focus-trap";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/labs/CodeEditor";
import { usePyodide } from "@/components/playground/usePyodide";
import { AuthDialog } from "@/components/academy/auth-dialogs";

/* --------------------------------- types --------------------------------- */

interface TestCaseView {
  id: string;
  name: string;
  input?: string | null;
  expectedOutput?: string | null;
  hidden: boolean;
}

interface ExerciseView {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  language: string;
  difficulty: string;
  points: number;
  lesson: {
    id: string;
    title: string;
    chapter?: { module?: { courseId?: string; title?: string; course?: { title?: string } } };
  };
  testCases: TestCaseView[];
}

interface TestResultView {
  testCaseId: string;
  name: string;
  passed: boolean;
  expected: string;
  received: string;
  hidden: boolean;
}

interface SubmissionResult {
  id: string;
  status: "PASSED" | "FAILED" | "ERROR" | string;
  score: number;
  results: TestResultView[];
  runtimeMs: number;
  error?: string | null;
}

interface PriorSubmission {
  id: string;
  status: string;
  score: number;
  createdAt: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(path, { cache: "no-store", ...init });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: (body?.data ?? body) ?? null, error: body?.error?.message };
  } catch {
    return { ok: false, status: 0, data: null, error: "network" };
  }
}

/* ============================== the challenge ============================== */

export function CodingChallenge({ exerciseId, navigate }: { exerciseId: string; navigate: (hash: string) => void }) {
  const [exercise, setExercise] = useState<ExerciseView | null>(null);
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [runOut, setRunOut] = useState<{ stdout: string; error: string | null } | null>(null);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [history, setHistory] = useState<PriorSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { run, running, loadingEngine } = usePyodide();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [exRes, sessionRes] = await Promise.all([
        api<ExerciseView>(`/api/exercises/${exerciseId}`),
        api<{ authenticated: boolean }>("/api/auth/session"),
      ]);
      if (cancelled) return;
      if (!exRes.ok || !exRes.data) {
        setError("This coding challenge could not be found.");
        return;
      }
      setExercise(exRes.data);
      setCode(exRes.data.starterCode);
      setAuthed(!!sessionRes.data?.authenticated);
      if (sessionRes.data?.authenticated) {
        const hist = await api<PriorSubmission[]>(`/api/exercises/${exerciseId}/submissions`);
        if (!cancelled && hist.ok && Array.isArray(hist.data)) {
          setHistory((hist.data as PriorSubmission[]).slice(0, 5));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
      }, [exerciseId]);

  const doRun = useCallback(async () => {
    setSubmission(null);
    const r = await run(code, { packages: [] });
    setRunOut({ stdout: r.stdout, error: r.error });
  }, [code, run]);

  const doSubmit = useCallback(async () => {
    if (!exercise) return;
    setSubmitting(true);
    setError(null);
    const res = await api<SubmissionResult>(`/api/exercises/${exercise.id}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: exercise.language }),
    });
    setSubmitting(false);
    if (!res.ok || !res.data) {
      if (res.status === 403) {
        setError("Enroll in the course first (from the Assessment Center) — submissions track to your account.");
      } else {
        setError(res.error ?? "Submission failed — try again.");
      }
      return;
    }
    setSubmission(res.data);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [code, exercise]);

  const doReset = useCallback(() => {
    setCode(exercise?.starterCode ?? "");
    setRunOut(null);
    setSubmission(null);
  }, [exercise]);

  if (error && !exercise) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning-text" />
        <p className="mt-3 text-[15px] font-semibold text-ink">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("#/assessments")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Assessment Center
        </Button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="dv-skel h-24 rounded-2xl border border-border-subtle" />
        <div className="dv-skel h-80 rounded-2xl border border-border-subtle" />
      </div>
    );
  }

  const visibleTests = exercise.testCases.filter((t) => !t.hidden);
  const busy = running || loadingEngine || submitting;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button type="button" onClick={() => navigate("#/assessments")} className="flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink">
        <ChevronLeft className="h-3.5 w-3.5" /> Assessment Center
      </button>

      {/* ------------------------------------ brief */}
      <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/12 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            <Code2 className="h-3 w-3" /> Coding challenge
          </span>
          <span className="t-meta">{exercise.lesson.chapter?.module?.course?.title ?? exercise.lesson.chapter?.module?.title ?? "Course"}</span>
          <span className="t-meta">· {exercise.lesson?.title}</span>
          <span className="t-meta ml-auto capitalize">{exercise.difficulty.toLowerCase()} · {exercise.points} pts</span>
        </div>
        <h1 className="t-title mt-3 text-ink">{exercise.title}</h1>
        <p className="t-body mt-2 leading-relaxed">{exercise.prompt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-subtle pt-3 text-[12.5px] text-ink-3">
          <span className="inline-flex items-center gap-1"><Brain className="h-3.5 w-3.5" />{visibleTests.length} visible test{visibleTests.length === 1 ? "" : "s"} + hidden cases</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />5s runtime cap per case</span>
          <span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />best submission counts</span>
        </div>
      </section>

      {submission && (
        <section
          className={cn(
            "dv-pop rounded-2xl border p-5 shadow-e1",
            submission.status === "PASSED" ? "border-success-text/40 bg-success-text/10" : submission.status === "ERROR" ? "border-danger-text/40 bg-danger-text/10" : "border-warning-text/40 bg-warning-text/10"
          )}
        >
          <p className="flex items-center gap-2 text-[15.5px] font-bold text-ink">
            {submission.status === "PASSED" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success-text" /> All tests green — {Math.round(submission.score)}%
              </>
            ) : submission.status === "ERROR" ? (
              <>
                <XCircle className="h-5 w-5 text-danger-text" /> Runtime error
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-warning-text" /> {submission.results.filter((r) => r.passed).length}/{submission.results.length} tests passed
              </>
            )}
            <span className="t-meta ml-auto tabular">{submission.runtimeMs}ms on the server</span>
          </p>

          <div className="mt-4 space-y-1.5">
            {submission.results.map((r, i) => (
              <div
                key={r.testCaseId}
                className={cn(
                  "rounded-lg border px-3.5 py-2.5 text-[13px]",
                  r.passed ? "border-success-text/30 bg-success-text/5" : "border-warning-text/30 bg-warning-text/5"
                )}
              >
                <p className="flex items-center gap-2 font-medium text-ink">
                  {r.passed ? <CheckCircle2 className="h-4 w-4 text-success-text" /> : <XCircle className="h-4 w-4 text-warning-text" />}
                  Case {i + 1} · {r.name}
                  {r.hidden && <span className="t-meta">hidden case</span>}
                </p>
                {!r.passed && !r.hidden && (
                  <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink-2">
                    <span className="opacity-60">expected:</span>
                    {"\n"}
                    {r.expected}
                    {"\n"}
                    <span className="opacity-60">received:</span>
                    {"\n"}
                    {r.received}
                  </pre>
                )}
                {!r.passed && r.hidden && (
                  <p className="t-caption mt-1">The expected output of this case is not shown — that is the point of hidden tests.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------ editor */}
      <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-subtle/60 px-4 py-2.5">
          <span className="mr-auto text-[12px] font-semibold uppercase tracking-wide text-ink-3">
            {exercise.language} editor
          </span>
          <Button type="button" size="sm" onClick={() => void doRun()} disabled={busy} className="h-8 gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run in browser
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => (authed ? void doSubmit() : setAuthOpen(true))}
            disabled={busy}
            className="h-8 gap-1.5"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for grading
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={doReset} disabled={busy} className="h-8 gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
        <div className="p-1">
          <CodeEditor value={code} onChange={setCode} height="340px" onRunShortcut={() => void doRun()} />
        </div>
        <p className="border-t border-border-subtle bg-surface-subtle/40 px-4 py-1.5 text-[11px] text-ink-3">
          Run executes in your browser · Submit grades server-side against every test case (visible and hidden) —
          Ctrl/Cmd+Enter to run
        </p>
      </section>

      {/* visible test cases */}
      {visibleTests.length > 0 && (
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <p className="dv-kicker mb-3">Visible test cases (hidden ones grade too — silently)</p>
          <div className="space-y-2">
            {visibleTests.map((t, i) => (
              <div key={t.id} className="rounded-lg border border-border-subtle bg-surface-subtle/50 px-3.5 py-2.5">
                <p className="text-[13px] font-medium text-ink">Case {i + 1} · {t.name}</p>
                <div className="mt-1 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
                  {t.input && (
                    <div>
                      <p className="t-meta">input</p>
                      <pre className="mt-0.5 whitespace-pre-wrap font-mono text-ink-2">{t.input}</pre>
                    </div>
                  )}
                  <div>
                    <p className="t-meta">expected output</p>
                    <pre className="mt-0.5 whitespace-pre-wrap font-mono text-ink-2">{t.expectedOutput ?? "(revealed at grading)"}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* console */}
      {runOut && (
        <section className="dv-fade-up rounded-2xl border border-editor-border bg-editor-bg p-4 shadow-e1">
          <p className="dv-kicker mb-2.5 text-editor-ink/70">Console (browser run)</p>
          {runOut.stdout && (
            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-editor-ink">
              {runOut.stdout.replace(/\n$/, "")}
            </pre>
          )}
          {runOut.error && (
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-editor-err/10 px-3 py-2 font-mono text-[13px] leading-relaxed text-editor-err">
              {runOut.error.split("\n").slice(-1)[0]}
            </pre>
          )}
          {!runOut.stdout && !runOut.error && <p className="text-[13px] text-editor-ink/70">No output — did you print?</p>}
        </section>
      )}

      {error && (
        <p role="alert" className="dv-toast rounded-xl border border-warning-border bg-warning-bg px-4 py-2.5 text-[13px] text-warning-text">
          {error}
        </p>
      )}

      {history.length > 0 && (
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <p className="dv-kicker mb-3">Your submissions</p>
          <div className="space-y-1.5">
            {history.map((h) => (
              <p key={h.id} className="flex items-center gap-2 text-[13px] text-ink-2">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px] font-bold",
                    h.status === "PASSED" ? "bg-success-text/15 text-success-text" : "bg-warning-text/15 text-warning-text"
                  )}
                >
                  {h.status}
                </span>
                <span className="tabular">{Math.round(h.score)}%</span>
                <span className="t-meta ml-auto">{new Date(h.createdAt).toLocaleString()}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => window.location.reload()} reason="Submissions, scores and history belong to your account." />
    </div>
  );
}
