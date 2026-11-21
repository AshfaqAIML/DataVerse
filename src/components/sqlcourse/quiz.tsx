"use client";

/**
 * Quiz and assessment UI for the SQL course (wired to the SQL progress
 * store). Mirrors the Python course's components:
 *   - SqlQuizCard: 2-3 knowledge-check questions per lesson.
 *   - SqlAssessmentPanel: the 8-question part assessment, 80% to pass.
 */
import { useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/sqlcourse/types";
import { useSqlProgress, type SqlAssessmentState } from "@/lib/sqlcourse/progress";
import { InlineText } from "./blocks";

export function SqlQuizCard({
  questions,
  storagePrefix,
}: {
  questions: QuizQuestion[];
  storagePrefix: string;
}) {
  const recordAnswer = useSqlProgress((s) => s.recordQuizAnswer);
  const saved = useSqlProgress((s) => s.quizAnswers);
  const [chosen, setChosen] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const q of questions) {
      const a = saved[`${storagePrefix}:${q.id}`];
      if (a) out[q.id] = a.chosen;
    }
    return out;
  });

  const answeredCount = questions.filter((q) => chosen[q.id] !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {answeredCount}/{questions.length} answered
        </p>
        {answeredCount === questions.length && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-success-text">
            <Award className="h-4 w-4" /> knowledge check complete
          </span>
        )}
      </div>
      {questions.map((q, qi) => {
        const pick = chosen[q.id];
        const answered = pick !== undefined;
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="mb-4 text-[15px] font-semibold leading-relaxed text-foreground">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {qi + 1}
              </span>
              <InlineText text={q.prompt} />
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen = pick === oi;
                const isCorrect = opt.correct;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={answered}
                    onClick={() => {
                      setChosen((c) => ({ ...c, [q.id]: oi }));
                      recordAnswer(`${storagePrefix}:${q.id}`, { chosen: oi, correct: isCorrect });
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm leading-relaxed transition-colors",
                      !answered && "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
                      answered && isCorrect && "border-success-border bg-success-bg/70",
                      answered && !isCorrect && isChosen && "border-danger-border bg-danger-bg/60",
                      answered && !isCorrect && !isChosen && "opacity-60",
                      !answered && isChosen && "border-blue-400"
                    )}
                  >
                    {answered ? (
                      isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                      ) : isChosen ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />
                      ) : (
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-muted-foreground/40" />
                      )
                    ) : (
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 text-[11px] font-bold text-muted-foreground">
                        {String.fromCharCode(65 + oi)}
                      </span>
                    )}
                    <span>
                      <span className={cn("block", answered && isCorrect && "font-semibold text-success-text")}>
                        <InlineText text={opt.text} />
                      </span>
                      {answered && (
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {opt.feedback}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className="mt-3 rounded-lg bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85">
                <span className="font-semibold">Takeaway: </span>
                <InlineText text={q.explanation} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SqlAssessmentPanel({
  partLetter,
  questions,
}: {
  partLetter: string;
  questions: QuizQuestion[];
}) {
  const recordAssessment = useSqlProgress((s) => s.recordAssessment);
  const existing = useSqlProgress((s) => s.assessments[partLetter]);
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(existing?.answers ?? {}).map(([k, v]) => [k, v.chosen]))
  );
  const [submitted, setSubmitted] = useState(!!existing);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const score = questions.filter((q) => q.options[answers[q.id]]?.correct).length;
  const passed = score / questions.length >= 0.8;

  const submit = () => {
    const state: SqlAssessmentState = {
      answers: Object.fromEntries(
        Object.entries(answers).map(([qId, chosen]) => [
          qId,
          { chosen, correct: !!questions.find((q) => q.id === qId)?.options[chosen]?.correct },
        ])
      ),
      score,
      total: questions.length,
      completedAt: new Date().toISOString(),
    };
    recordAssessment(partLetter, state);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div
          className={cn(
            "rounded-xl border p-6 text-center",
            passed
              ? "border-success-border bg-success-bg/70"
              : "border-warning-border bg-warning-bg/70"
          )}
        >
          <Award className={cn("mx-auto h-10 w-10", passed ? "text-success-text" : "text-warning-text")} />
          <p className="mt-2 text-3xl font-black text-foreground">
            {score}/{questions.length}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {passed ? "Passed — 80% or better. Onward!" : "Below 80% — review the lessons and try again."}
          </p>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" />
            Retake assessment
          </button>
        </div>
        <ol className="space-y-3">
          {questions.map((q, i) => {
            const pick = answers[q.id];
            const correct = q.options[pick]?.correct;
            return (
              <li key={q.id} className="rounded-xl border bg-card p-4">
                <p className="mb-2 text-sm font-semibold leading-relaxed text-foreground">
                  {i + 1}. <InlineText text={q.prompt} />
                </p>
                <p
                  className={cn(
                    "text-sm font-medium",
                    correct ? "text-success-text" : "text-danger-text"
                  )}
                >
                  Your answer: {pick !== undefined ? q.options[pick].text : "(skipped)"}{" "}
                  {correct ? "✓" : "✗"}
                </p>
                {!correct && (
                  <p className="mt-1 text-sm text-foreground/80">
                    Correct: <span className="font-medium">{q.options.find((o) => o.correct)?.text}</span>
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Chapter assessment: </span>
        {questions.length} questions, one correct answer each. You need 80% to pass. Answers are not
        graded until you submit — changing your mind is free.
      </p>
      {questions.map((q, i) => {
        const pick = answers[q.id];
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="mb-4 text-[15px] font-semibold leading-relaxed text-foreground">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {i + 1}
              </span>
              <InlineText text={q.prompt} />
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm leading-relaxed transition-colors hover:border-blue-400",
                    pick === oi
                      ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/30"
                      : "hover:bg-muted/30"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                      pick === oi
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-muted-foreground/50 text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <InlineText text={opt.text} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={submit}
        disabled={!allAnswered}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {allAnswered ? `Submit — grade my ${questions.length} answers` : `Answer all ${questions.length} questions to submit`}
      </button>
    </div>
  );
}
