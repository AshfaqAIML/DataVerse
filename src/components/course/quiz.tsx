"use client";

/**
 * Quiz and assessment UI.
 *
 * - QuizCard: 2-3 knowledge-check questions at the end of every lesson.
 *   Each option gives immediate per-option feedback.
 * - AssessmentPanel: the 8-question chapter assessment with a final score,
 *   pass threshold (>= 80%) and per-question review.
 */
import { useMemo, useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/focus-trap";
import type { QuizQuestion } from "@/lib/course/types";
import { useCourseProgress, type AssessmentState } from "@/lib/course/progress";
import { InlineText } from "./blocks";

export function QuizCard({ questions, storagePrefix }: { questions: QuizQuestion[]; storagePrefix: string }) {
  const recordAnswer = useCourseProgress((s) => s.recordQuizAnswer);
  const saved = useCourseProgress((s) => s.quizAnswers);
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
      </div>
      {questions.map((q, qi) => {
        const pick = chosen[q.id];
        const answered = pick !== undefined;
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="mb-4 text-[15px] font-semibold leading-relaxed text-foreground">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-bg text-xs font-bold text-success-text">
                {qi + 1}
              </span>
              <InlineText text={q.prompt} />
            </p>
            <div className="space-y-2" role="group" aria-label={`Answer options for question ${qi + 1}`}>
              {q.options.map((opt, oi) => {
                const isChosen = pick === oi;
                const isCorrect = opt.correct;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={answered}
                    aria-pressed={answered ? undefined : isChosen}
                    aria-disabled={answered || undefined}
                    onClick={() => {
                      setChosen((c) => ({ ...c, [q.id]: oi }));
                      recordAnswer(`${storagePrefix}:${q.id}`, { chosen: oi, correct: isCorrect });
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
                      !answered && "hover:border-success-text hover:bg-muted/40",
                      answered && isCorrect && "border-success-text bg-success-bg",
                      answered && isChosen && !isCorrect && "border-danger-border bg-danger-bg",
                      answered && !isChosen && !isCorrect && "border-border opacity-60",
                      !answered && "border-border bg-background"
                    )}
                  >
                    {answered && isCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />}
                    {answered && !isCorrect && isChosen && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />}
                    <span className="text-foreground/90">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div role="status" className="mt-3 space-y-2 border-t pt-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  <span className="font-semibold">{q.options[pick].correct ? "Correct. " : "Not quite. "}</span>
                  {q.options[pick].feedback}
                </p>
                <p className="rounded-lg bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Takeaway: </span>
                  <InlineText text={q.explanation} />
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AssessmentPanel({
  partLetter,
  questions,
}: {
  partLetter: string;
  questions: QuizQuestion[];
}) {
  const recordAssessment = useCourseProgress((s) => s.recordAssessment);
  const saved = useCourseProgress((s) => s.assessments[partLetter]);
  const [answers, setAnswers] = useState<Record<string, number>>(() => saved?.answers ? Object.fromEntries(Object.entries(saved.answers).map(([k, v]) => [k, v.chosen])) : {});
  const [submitted, setSubmitted] = useState<boolean>(() => !!saved);

  const passThreshold = Math.ceil(questions.length * 0.8);
  const score = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined && q.options[answers[q.id]].correct).length,
    [answers, questions]
  );

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const submit = () => {
    setSubmitted(true);
    const state: AssessmentState = {
      answers: Object.fromEntries(
        questions.filter((q) => answers[q.id] !== undefined).map((q) => [
          q.id,
          { chosen: answers[q.id], correct: q.options[answers[q.id]].correct },
        ])
      ),
      score: questions.filter((q) => answers[q.id] !== undefined && q.options[answers[q.id]].correct).length,
      total: questions.length,
      completedAt: new Date().toISOString(),
    };
    recordAssessment(partLetter, state);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const retake = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (submitted) {
    const passed = score >= passThreshold;
    return (
      <div className="space-y-6">
        <div
          role="status"
          className={cn(
            "rounded-xl border p-6 text-center",
            passed
              ? "border-success-border bg-success-bg"
              : "border-warning-border bg-warning-bg"
          )}
        >
          <Award className={cn("mx-auto mb-3 h-10 w-10", passed ? "text-success-text" : "text-warning-text")} />
          <p className="text-3xl font-bold text-foreground">
            {score}/{questions.length}
          </p>
          <p className={cn("mt-1 text-sm font-semibold", passed ? "text-success-text" : "text-warning-text")}>
            {passed ? "Passed — 80% or better." : "Not yet passed — 80% is the goal."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {passed
              ? "You have cleared this chapter's assessment. Move on to the mini project, or review any question you missed below."
              : "Review the questions below (each shows its explanation), revisit the lessons they point to, then retake the assessment."}
          </p>
          <button
            type="button"
            onClick={retake}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" />
            Retake assessment
          </button>
        </div>

        {questions.map((q, qi) => {
          const pick = answers[q.id];
          const correct = pick !== undefined && q.options[pick].correct;
          return (
            <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-start gap-2.5">
                {correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-text" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-text" />
                )}
                <p className="text-[15px] font-semibold leading-relaxed text-foreground">
                  {qi + 1}. <InlineText text={q.prompt} />
                </p>
              </div>
              <div className="ml-7.5 space-y-1.5 text-sm">
                <p className="text-foreground/90">
                  <span className="text-muted-foreground">Your answer: </span>
                  {pick !== undefined ? q.options[pick].text : "(no answer)"}
                  {!correct && (
                    <>
                      <br />
                      <span className="text-muted-foreground">Correct answer: </span>
                      {q.options.find((o) => o.correct)?.text}
                    </>
                  )}
                </p>
                <p className="text-muted-foreground">
                  <InlineText text={q.explanation} />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Answer all {questions.length} questions, then submit. You pass at {passThreshold}/{questions.length} (80%).
        Every answer gets an explanation — the review is part of the learning.
      </p>
      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
          <p className="mb-4 text-[15px] font-semibold leading-relaxed text-foreground">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-bg text-xs font-bold text-success-text">
              {qi + 1}
            </span>
            <InlineText text={q.prompt} />
          </p>
          <div className="space-y-2" role="group" aria-label={`Answer options for question ${qi + 1}`}>
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                aria-pressed={answers[q.id] === oi}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
                  answers[q.id] === oi
                    ? "border-success-text bg-success-bg font-medium"
                    : "border-border bg-background hover:border-success-border hover:bg-muted/40"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2",
                    answers[q.id] === oi ? "border-success-text bg-success-text" : "border-muted-foreground/40"
                  )}
                />
                <span className="text-foreground/90">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={!allAnswered}
        onClick={submit}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors",
          allAnswered ? "bg-success-text hover:bg-success-text" : "cursor-not-allowed bg-muted text-muted-foreground"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        Submit assessment ({Object.keys(answers).length}/{questions.length} answered)
      </button>
    </div>
  );
}
