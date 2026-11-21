"use client";

/**
 * NumPy course quiz and assessment UI.
 *
 * Mirrors the course quiz components, but records progress in the NumPy
 * course store (separate localStorage key).
 */
import { useMemo, useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/focus-trap";
import type { QuizQuestion } from "@/lib/course/types";
import { useNumpyProgress, type AssessmentState } from "@/lib/numpycourse/progress";
import { InlineText } from "@/components/course/blocks";

export function NumpyQuizCard({ questions, storagePrefix }: { questions: QuizQuestion[]; storagePrefix: string }) {
  const recordAnswer = useNumpyProgress((s) => s.recordQuizAnswer);
  const saved = useNumpyProgress((s) => s.quizAnswers);
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
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
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
                      "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
                      !answered && "hover:border-cyan-400 hover:bg-muted/40",
                      answered && isCorrect && "border-cyan-400 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/40",
                      answered && isChosen && !isCorrect && "border-danger-border bg-danger-bg",
                      answered && !isChosen && !isCorrect && "border-border opacity-60",
                      !answered && "border-border bg-background"
                    )}
                  >
                    {answered && isCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />}
                    {answered && !isCorrect && isChosen && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />}
                    <span className="text-foreground/90">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-3 space-y-2 border-t pt-3">
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

export function NumpyAssessmentPanel({
  partLetter,
  questions,
}: {
  partLetter: string;
  questions: QuizQuestion[];
}) {
  const recordAssessment = useNumpyProgress((s) => s.recordAssessment);
  const saved = useNumpyProgress((s) => s.assessments[partLetter]);
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
          className={cn(
            "rounded-xl border p-6 text-center",
            passed
              ? "border-cyan-300 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950/40"
              : "border-warning-border bg-warning-bg"
          )}
        >
          <Award className={cn("mx-auto mb-3 h-10 w-10", passed ? "text-cyan-700" : "text-warning-text")} />
          <p className="text-3xl font-bold text-foreground">
            {score}/{questions.length}
          </p>
          <p className={cn("mt-1 text-sm font-semibold", passed ? "text-cyan-700 dark:text-cyan-400" : "text-warning-text")}>
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
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
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
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              {qi + 1}
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
                  "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
                  answers[q.id] === oi
                    ? "border-cyan-500 bg-cyan-50 font-medium dark:border-cyan-700 dark:bg-cyan-950/40"
                    : "border-border bg-background hover:border-cyan-300 hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2",
                    answers[q.id] === oi ? "border-cyan-600 bg-cyan-600" : "border-muted-foreground/40"
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
          allAnswered ? "bg-cyan-600 hover:bg-cyan-800" : "cursor-not-allowed bg-muted text-muted-foreground"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        Submit assessment ({Object.keys(answers).length}/{questions.length} answered)
      </button>
    </div>
  );
}
