"use client";

/**
 * AssessmentRunner — the professional exam-taking interface.
 *
 * Flow (all real, all server-side):
 *   GET  /api/quizzes/[id]                    — the paper (no answer keys)
 *   POST /api/quizzes/[id]/attempts           — start (enrollment + limits)
 *   POST /api/assessment-attempts/[id]/submit — deterministic grading
 *   GET  /api/assessment-attempts/[id]        — graded review with keys,
 *                                               per-option feedback and
 *                                               explanations
 *
 * Question kinds: MCQ · MULTI_SELECT · TRUE_FALSE · SHORT_ANSWER · NUMERICAL.
 * Timed quizzes show a live countdown and auto-submit at zero.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, FileCheck2, GraduationCap, ListChecks, Loader2, Lock, Timer, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/academy/auth-dialogs";
import { Reveal } from "@/components/academy/motion";
import { prefersReducedMotion } from "@/lib/focus-trap";

/* --------------------------------- types --------------------------------- */

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
  feedback?: string | null;
}

interface Question {
  id: string;
  prompt: string;
  kind: string;
  points: number;
  explanation?: string | null;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  kind: string;
  passingScore: number;
  maxAttempts: number | null;
  timeLimitMinutes?: number | null;
  lesson: { id: string; title: string; chapter: { module: { courseId: string; title: string } } };
  questions?: Question[];
}

interface Grade {
  score: number;
  passed: boolean;
  gradedAnswers: Array<{ questionId: string; correct: boolean; pointsEarned: number; pointsPossible: number }>;
  correctCount: number;
  totalQuestions: number;
}

type Phase =
  | { stage: "loading" }
  | { stage: "need-auth" }
  | { stage: "need-enroll"; courseTitle: string; courseId: string }
  | { stage: "limit"; used: number; max: number }
  | { stage: "brief" }
  | { stage: "taking"; attemptId: string }
  | { stage: "submitting"; attemptId: string }
  | { stage: "graded"; grade: Grade };

interface Answer {
  selectedOptionIds?: string[];
  text?: string;
}

/* -------------------------------- helpers -------------------------------- */

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(path, { cache: "no-store", ...init });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: (body?.data ?? body) ?? null, error: body?.error?.message };
  } catch {
    return { ok: false, status: 0, data: null, error: "network" };
  }
}

function fmtClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ================================ runner ================================= */

export function AssessmentRunner({ quizId, navigate }: { quizId: string; navigate: (hash: string) => void }) {
  const [phase, setPhase] = useState<Phase>({ stage: "loading" });
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [review, setReview] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [qIndex, setQIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const submitRef = useRef<(() => void) | null>(null);

  /* ------------------------------- load quiz ------------------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [quizRes, sessionRes] = await Promise.all([
        api<Quiz>(`/api/quizzes/${quizId}`),
        api<{ authenticated: boolean }>("/api/auth/session"),
      ]);
      if (cancelled) return;
      if (!quizRes.ok || !quizRes.data) {
        setError("This assessment could not be found.");
        return;
      }
      const q = quizRes.data as Quiz;
      // the API ships answerOptions; the runner speaks options
      const raw = (quizRes.data as { questions?: Array<Question & { answerOptions?: Option[] }> }).questions ?? [];
      q.questions = raw.map((qq) => ({ ...qq, options: qq.answerOptions ?? qq.options ?? [] }));
      setQuiz(q);
      if (!sessionRes.data?.authenticated) {
        setPhase({ stage: "need-auth" });
        return;
      }
      // enrollment gate (the start-attempt endpoint enforces it too — this
      // pre-flight just gives a friendlier screen)
      const courseRes = await api<Array<{ courseId: string; course?: { id: string; title: string } }>>("/api/enrollments");
      if (cancelled) return;
      const rows = courseRes.data ?? [];
      const enrolled = rows.some((r) => r.courseId === (q.lesson?.chapter?.module?.courseId ?? r.courseId) || r.course?.id === q.lesson?.chapter?.module?.courseId);
      if (!enrolled && q.lesson?.chapter?.module?.courseId) {
        setPhase({ stage: "need-enroll", courseId: q.lesson.chapter.module.courseId, courseTitle: q.lesson.chapter.module.title });
        return;
      }
      setPhase({ stage: "brief" });
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* --------------------------------- start --------------------------------- */
  const start = useCallback(async () => {
    setError(null);
    const res = await api<{ id: string }>(`/api/quizzes/${quizId}/attempts`, { method: "POST" });
    if (!res.ok || !res.data) {
      const msg = res.error ?? "Could not start the attempt.";
      if (res.status === 409) {
        // attempt limit
        setPhase({ stage: "limit", used: 99, max: quiz?.maxAttempts ?? 0 });
      } else if (res.status === 403) {
        setPhase({
          stage: "need-enroll",
          courseId: quiz?.lesson?.chapter?.module?.courseId ?? "",
          courseTitle: quiz?.lesson?.chapter?.module?.title ?? "the course",
        });
      } else {
        setError(msg);
      }
      return;
    }
    setAnswers({});
    setQIndex(0);
    setReview(null);
    startedAtRef.current = Date.now();
    if (quiz?.timeLimitMinutes) setSecondsLeft(quiz.timeLimitMinutes * 60);
    setPhase({ stage: "taking", attemptId: res.data.id });
  }, [quiz, quizId]);

  /* --------------------------------- submit -------------------------------- */
  const submit = useCallback(async () => {
    if (!quiz?.questions) return;
    setPhase((p) => (p.stage === "taking" ? { stage: "submitting", attemptId: p.attemptId } : p));
    const payload = {
      answers: quiz.questions.map((q) => {
        const a = answers[q.id] ?? {};
        if (q.kind === "SHORT_ANSWER" || q.kind === "NUMERICAL") {
          return { questionId: q.id, text: a.text ?? "" };
        }
        return { questionId: q.id, selectedOptionIds: a.selectedOptionIds ?? [] };
      }),
    };
    const res = await api<{ attempt: { id: string }; grade: Grade }>(
      `/api/assessment-attempts/${(phase as { attemptId: string }).attemptId}/submit`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    if (!res.ok || !res.data?.grade) {
      setError(res.error ?? "Submission failed — try again.");
      setPhase((p) => (p.stage === "submitting" ? { stage: "taking", attemptId: p.attemptId } : p));
      return;
    }
    // fetch the graded review (keys + feedback + explanations)
    const detail = await api<{ questions: Question[]; attempt: { id: string } }>(
      `/api/assessment-attempts/${(phase as { attemptId: string }).attemptId}`
    );
    if (detail.ok && detail.data?.questions) setReview(detail.data.questions);
    setSecondsLeft(null);
    setPhase({ stage: "graded", grade: res.data.grade });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [answers, phase, quiz]);

  useEffect(() => {
    // keep the auto-submit closure fresh after every render
    submitRef.current = () => void submit();
  });

  /* Time announcements for screen-reader users: the visible clock ticks
     silently (role=timer is aria-live=off by design — announcing every
     second would be unbearable); the polite live region below changes its
     text exactly at the 5-minute and 1-minute marks, so those thresholds
     are announced without any effect-level state. */
  const timeNotice =
    secondsLeft === 300 ? "5 minutes remaining"
    : secondsLeft === 60 ? "1 minute remaining"
    : "";

  /* ------------------------------- the clock -------------------------------- */
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submitRef.current?.();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  /* --------------------------------- enroll --------------------------------- */
  const doEnroll = useCallback(async () => {
    if (phase.stage !== "need-enroll") return;
    setEnrolling(true);
    const res = await api("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: phase.courseId }),
    });
    setEnrolling(false);
    if (res.ok) {
      setToast("Enrolled — the assessment is unlocked");
      setPhase({ stage: "brief" });
    } else {
      setToast(res.error ?? "Could not enroll right now");
    }
  }, [phase]);

  /* --------------------------------- states --------------------------------- */

  if (phase.stage === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <div className="dv-skel h-28 rounded-2xl border border-border-subtle" />
        <div className="dv-skel h-64 rounded-2xl border border-border-subtle" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning-text" />
        <p className="mt-3 text-[15px] font-semibold text-ink">{error ?? "Assessment not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("#/assessments")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to the Assessment Center
        </Button>
      </div>
    );
  }

  const isFinal = quiz.kind === "FINAL_EXAM";
  const questions = review ?? quiz.questions ?? [];
  const answeredCount = Object.values(answers).filter((a) =>
    a.selectedOptionIds ? a.selectedOptionIds.length > 0 : a.text !== undefined && a.text !== ""
  ).length;

  /* ------------------------------- brief screen ------------------------------ */
  if (phase.stage === "need-auth") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-e1">
          <Lock className="mx-auto h-8 w-8 text-ink-3" />
          <h1 className="t-sub mt-3 text-ink">{quiz.title}</h1>
          <p className="t-body mt-2">Attempts are tied to your account — sign in to begin.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => setAuthOpen(true)}>Sign in / create account</Button>
            <Button variant="outline" onClick={() => navigate("#/assessments")}>Back</Button>
          </div>
        </div>
        <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => window.location.reload()} />
      </div>
    );
  }

  if (phase.stage === "need-enroll") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-e1">
          <GraduationCap className="mx-auto h-8 w-8 text-primary" />
          <h1 className="t-sub mt-3 text-ink">Enrollment required</h1>
          <p className="t-body mt-2">
            {quiz.title} sits inside <strong>{phase.courseTitle}</strong> — enroll (one click, free) and every attempt,
            lesson and certificate tracks to your account.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => void doEnroll()} disabled={enrolling}>
              {enrolling ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Enroll now
            </Button>
            <Button variant="outline" onClick={() => navigate("#/assessments")}>Back</Button>
          </div>
        </div>
        {toast && <div role="status" className="dv-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-e3">{toast}</div>}
      </div>
    );
  }

  if (phase.stage === "limit") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-e1">
        <ListChecks className="mx-auto h-8 w-8 text-warning-text" />
        <h1 className="t-sub mt-3 text-ink">Attempt limit reached</h1>
        <p className="t-body mt-2">
          This assessment allows {quiz.maxAttempts} graded attempt{quiz.maxAttempts === 1 ? "" : "s"} and you have used
          them all. Your best score stands.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => navigate("#/assessments")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Assessment Center
        </Button>
      </div>
    );
  }

  /* --------------------------------- brief ---------------------------------- */
  if (phase.stage === "brief") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button type="button" onClick={() => navigate("#/assessments")} className="flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink">
          <ChevronLeft className="h-3.5 w-3.5" /> Assessment Center
        </button>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e2">
          <div className={cn("px-6 py-5", isFinal && "bg-gradient-to-br from-violet-500/10 to-transparent")}>
            <div className="flex items-center gap-2">
              {isFinal ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <GraduationCap className="h-3 w-3" /> Final examination
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <FileCheck2 className="h-3 w-3" /> Checkpoint
                </span>
              )}
              {quiz.timeLimitMinutes && (
                <span className="inline-flex items-center gap-1 rounded-md bg-warning-text/15 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-warning-text">
                  <Timer className="h-3 w-3" /> Timed · {quiz.timeLimitMinutes} min
                </span>
              )}
            </div>
            <h1 className="t-title mt-3 text-ink">{quiz.title}</h1>
            {quiz.description && <p className="t-lede mt-2">{quiz.description}</p>}
          </div>
          <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle bg-surface-subtle/50">
            {[
              [String(questions.length), "questions"],
              [`${quiz.passingScore}%`, "to pass"],
              [quiz.maxAttempts ? String(quiz.maxAttempts) : "∞", "attempts allowed"],
            ].map(([v, l]) => (
              <div key={l} className="px-3 py-3.5 text-center sm:px-4">
                <p className="tabular text-[20px] font-semibold text-ink">{v}</p>
                <p className="t-meta">{l}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-5">
            {quiz.timeLimitMinutes && (
              <p className="mb-3 flex items-start gap-2 rounded-xl border border-warning-text/30 bg-warning-text/10 px-4 py-2.5 text-[13px] text-warning-text">
                <Timer className="mt-0.5 h-4 w-4 shrink-0" />
                The clock starts the moment you begin and auto-submits at zero. Answer order is yours to choose.
              </p>
            )}
            <Button size="lg" className="w-full" onClick={() => void start()}>
              Begin {isFinal ? "the examination" : "the checkpoint"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------- taking --------------------------------- */
  if (phase.stage === "taking" || phase.stage === "submitting") {
    const q = questions[qIndex];
    const answer = answers[q.id] ?? {};
    const canNext = qIndex < questions.length - 1;
    const allAnswered = answeredCount === questions.length;

    const setAnswer = (patch: Answer) =>
      setAnswers((prev) => ({ ...prev, [q.id]: { ...prev[q.id], ...patch } }));

    const toggleOption = (optionId: string) => {
      const cur = answer.selectedOptionIds ?? [];
      setAnswer({
        selectedOptionIds: cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId],
      });
    };

    const isRadio = q.kind === "MCQ" || q.kind === "TRUE_FALSE";

    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {/* progress header */}
        <div className="sticky top-20 z-30 rounded-2xl border border-border-subtle bg-surface/95 px-5 py-3 shadow-e2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <p className="mr-auto truncate text-[14px] font-semibold text-ink">{quiz.title}</p>
            {secondsLeft !== null && (
              <span
                role="timer"
                aria-label={`Time remaining: ${fmtClock(secondsLeft)}`}
                className={cn(
                  "tabular inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13.5px] font-bold",
                  secondsLeft < 60 ? "bg-danger-text/15 text-danger-text" : "bg-surface-subtle text-ink"
                )}
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                {fmtClock(secondsLeft)}
              </span>
            )}
            {/* polite, threshold-based announcements — see the clock effect */}
            <span className="sr-only" role="status">{timeNotice}</span>
            <span className="tabular text-[13px] font-semibold text-ink-2">
              {qIndex + 1} / {questions.length}
            </span>
          </div>
          {/* progress dots — the visual bar stays 6px; the button around it
              pads the target to a WCAG 2.5.8-compliant height */}
          <div className="mt-1.5 flex items-center gap-1.5">
            {questions.map((qq, i) => {
              const a = answers[qq.id];
              const done = a ? (a.selectedOptionIds ? a.selectedOptionIds.length > 0 : !!a.text) : false;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setQIndex(i)}
                  aria-label={`Question ${i + 1}${done ? " (answered)" : ""}`}
                  aria-current={i === qIndex ? "true" : undefined}
                  className="group flex-1 py-2"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-colors",
                      i === qIndex
                        ? "bg-primary"
                        : done
                          ? "bg-primary/40 group-hover:bg-primary/60"
                          : "bg-surface-inset group-hover:bg-border-strong"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* the question — re-keyed so each step fades up as you move through the paper */}
        <section
          key={q.id + qIndex}
          aria-labelledby={`dv-q-${q.id}`}
          className="dv-fade-up rounded-2xl border border-border-subtle bg-surface p-6 shadow-e1"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="dv-kicker">Question {qIndex + 1} of {questions.length}</p>
            <span className="t-meta">{q.points} point{q.points === 1 ? "" : "s"} · {q.kind.replace("_", " ").toLowerCase()}</span>
          </div>
          <h2 id={`dv-q-${q.id}`} className="t-sub mt-3 leading-relaxed text-ink">{q.prompt}</h2>

          <div className="mt-5 space-y-2.5">
            {q.kind === "SHORT_ANSWER" && (
              <>
                <label htmlFor={`dv-ans-${q.id}`} className="sr-only">
                  Answer — question {qIndex + 1} of {questions.length}
                </label>
                <input
                  id={`dv-ans-${q.id}`}
                  value={answer.text ?? ""}
                  onChange={(e) => setAnswer({ text: e.target.value })}
                  placeholder="Type your answer…"
                  aria-describedby={`dv-q-${q.id}`}
                  className="h-12 w-full rounded-xl border border-border-subtle bg-surface-inset px-4 text-[15px] text-ink placeholder:text-ink-3 focus:border-primary/50 focus:outline-none"
                />
              </>
            )}
            {q.kind === "NUMERICAL" && (
              <>
                <label htmlFor={`dv-ans-${q.id}`} className="sr-only">
                  Numerical answer — question {qIndex + 1} of {questions.length}
                </label>
                <input
                  id={`dv-ans-${q.id}`}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={answer.text ?? ""}
                  onChange={(e) => setAnswer({ text: e.target.value })}
                  placeholder="Enter a number"
                  aria-describedby={`dv-q-${q.id}`}
                  className="tabular h-12 w-full max-w-xs rounded-xl border border-border-subtle bg-surface-inset px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-primary/50 focus:outline-none"
                />
              </>
            )}
            {(isRadio || q.kind === "MULTI_SELECT") && (
              <div
                role={isRadio ? "radiogroup" : "group"}
                aria-label={`Answer options — question ${qIndex + 1}`}
                className="space-y-2.5"
              >
                {q.options.map((opt, oi) => {
                  const selected = isRadio
                    ? answer.selectedOptionIds?.[0] === opt.id
                    : (answer.selectedOptionIds ?? []).includes(opt.id);
                  const anySelected = (answer.selectedOptionIds ?? []).length > 0;
                  // Radio roving tabindex: the selected option (or the first)
                  // is the tab stop; arrows move selection (WCAG 2.1.1).
                  const radioTabStop = selected || (!anySelected && oi === 0);
                  const focusOption = (dir: 1 | -1) => {
                    const next = q.options[oi + dir];
                    if (!next) return;
                    if (isRadio) setAnswer({ selectedOptionIds: [next.id] });
                    const btn = document.querySelector<HTMLButtonElement>(
                      `[data-option="${next.id}"]`
                    );
                    btn?.focus();
                  };
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-option={opt.id}
                      onClick={() => (isRadio ? setAnswer({ selectedOptionIds: [opt.id] }) : toggleOption(opt.id))}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                          e.preventDefault();
                          focusOption(1);
                        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          focusOption(-1);
                        }
                      }}
                      role={isRadio ? "radio" : undefined}
                      aria-checked={isRadio ? selected : undefined}
                      aria-pressed={isRadio ? undefined : selected}
                      tabIndex={isRadio ? (radioTabStop ? 0 : -1) : 0}
                      className={cn(
                        "dv-lift flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left",
                        selected
                          ? "border-primary bg-primary/8 shadow-e1"
                          : "border-border-subtle bg-surface hover:border-border-strong"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-5.5 w-5.5 shrink-0 items-center justify-center border-2 text-[11px] font-bold transition-colors",
                          isRadio ? "rounded-full" : "rounded-md",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong text-transparent"
                        )}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1 text-[14.5px] leading-relaxed text-ink">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {q.kind === "MULTI_SELECT" && (
            <p className="t-caption mt-3">Select all that apply — exact set match required.</p>
          )}
        </section>

        {/* nav */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" disabled={qIndex === 0} onClick={() => setQIndex((i) => i - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {canNext ? (
            <Button onClick={() => setQIndex((i) => i + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => void submit()}
              disabled={phase.stage === "submitting" || !allAnswered}
              className={cn(!allAnswered && "opacity-70")}
            >
              {phase.stage === "submitting" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
              {allAnswered ? "Submit for grading" : `${questions.length - answeredCount} unanswered`}
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-danger-border/50 bg-danger-bg px-4 py-2.5 text-[13px] text-danger-text">
            {error}
          </p>
        )}
      </div>
    );
  }

  /* --------------------------------- graded --------------------------------- */
  if (phase.stage === "graded" && phase.grade) {
    const g = phase.grade;
    const byQ = new Map(g.gradedAnswers.map((a) => [a.questionId, a]));
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <button type="button" onClick={() => navigate("#/assessments")} className="flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink">
          <ChevronLeft className="h-3.5 w-3.5" /> Assessment Center
        </button>

        <section
          className={cn(
            "dv-pop overflow-hidden rounded-2xl border shadow-e2",
            g.passed ? "border-success-text/40" : "border-warning-text/40"
          )}
        >
          <div className={cn("flex flex-col items-center gap-4 px-6 py-7 sm:flex-row sm:px-8", g.passed ? "bg-success-text/10" : "bg-warning-text/10")}>
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${g.passed ? "#10b981" : "#f59e0b"} ${g.score * 3.6}deg, color-mix(in srgb, var(--dv-ink) 8%, transparent) 0deg)`,
              }}
            >
              <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-surface">
                <span className="tabular text-[24px] font-bold leading-none text-ink">{Math.round(g.score)}%</span>
                <span className="t-meta">score</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="flex items-center justify-center gap-2 text-[18px] font-bold text-ink sm:justify-start">
                {g.passed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success-text" /> Passed — {g.correctCount} of {g.totalQuestions} correct
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-warning-text" /> {quiz.passingScore}% needed — you scored {Math.round(g.score)}%
                  </>
                )}
              </p>
              <p className="t-body mt-1">
                {g.passed
                  ? "Graded server-side; your best score for this assessment is kept."
                  : "Review the explanations below, then retake it — the best attempt counts."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 border-t border-border-subtle bg-surface px-6 py-4">
            <Button variant="outline" onClick={() => navigate("#/assessments")}>Back to assessments</Button>
            <Button onClick={() => void start()}>
              <Timer className="mr-1.5 h-4 w-4" /> Retake
            </Button>
          </div>
        </section>

        {/* per-question review */}
        <Reveal as="section" className="space-y-4">
          <h2 className="t-sub text-ink">Answer review</h2>
          {questions.map((q, i) => {
            const graded = byQ.get(q.id);
            const correct = graded?.correct ?? false;
            const answer = answers[q.id] ?? {};
            return (
              <article
                key={q.id}
                className={cn(
                  "rounded-2xl border bg-surface p-5 shadow-e1",
                  correct ? "border-success-text/35" : "border-warning-text/35"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold leading-relaxed text-ink">
                    <span className="t-meta mr-2">Q{i + 1}</span>
                    {q.prompt}
                  </p>
                  {graded && (
                    <span className={cn("tabular shrink-0 rounded-md px-2 py-0.5 text-[11.5px] font-bold", correct ? "bg-success-text/15 text-success-text" : "bg-warning-text/15 text-warning-text")}>
                      {graded.pointsEarned}/{graded.pointsPossible}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  {q.kind === "SHORT_ANSWER" || q.kind === "NUMERICAL" ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <p className="rounded-lg border border-border-subtle bg-surface-subtle/60 px-3 py-2 text-[13px]">
                        <span className="t-meta block">Your answer</span>
                        <span className="font-mono text-ink">{answer.text || "(blank)"}</span>
                      </p>
                      <p className={cn("rounded-lg border px-3 py-2 text-[13px]", correct ? "border-success-text/30 bg-success-text/10" : "border-border-subtle bg-surface-subtle/60")}>
                        <span className="t-meta block">Accepted answer</span>
                        <span className="font-mono text-ink">{q.options.find((o) => o.isCorrect)?.text ?? "—"}</span>
                      </p>
                    </div>
                  ) : (
                    q.options.map((opt) => {
                      const chosen = (answer.selectedOptionIds ?? []).includes(opt.id);
                      const isKey = !!opt.isCorrect;
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[13.5px]",
                            isKey
                              ? "border-success-text/40 bg-success-text/10"
                              : chosen
                                ? "border-danger-text/40 bg-danger-text/10"
                                : "border-border-subtle bg-surface-subtle/40"
                          )}
                        >
                          {isKey ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                          ) : chosen ? (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />
                          ) : (
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border-strong" />
                          )}
                          <div className="min-w-0">
                            <p className="leading-relaxed text-ink">
                              {opt.text}
                              {chosen && !isKey && <span className="t-meta ml-1.5">· your choice</span>}
                            </p>
                            {opt.feedback && (
                              <p className="t-caption mt-0.5">{opt.feedback}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {q.explanation && (
                  <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                    <p className="dv-kicker mb-1 text-primary">Why</p>
                    <p className="text-[13.5px] leading-relaxed text-ink-2">{q.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </Reveal>
        {toast && <div role="status" className="dv-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-e3">{toast}</div>}
      </div>
    );
  }

  return null;
}
