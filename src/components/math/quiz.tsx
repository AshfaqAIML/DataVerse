"use client";

/**
 * Math quiz UI — lesson knowledge checks and part assessments.
 *
 * Both record per-question answers into the math progress store; wrong
 * answers are what the revision radar feeds on.
 */
import { useMemo, useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/focus-trap";
import type { MathLesson, MathQuizQuestion } from "@/lib/mathcourse/types";
import { useMathProgress, type MathAssessmentState } from "@/lib/mathcourse/progress";
import { InlineText } from "@/components/course/blocks";

function OptionButton({
  option, index, state, onPick, disabled,
}: {
  option: string; index: number;
  state: "idle" | "chosen" | "correct" | "wrong" | "dimmed";
  onPick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
        state === "idle" && "border-border bg-background hover:border-violet-400 hover:bg-muted/40",
        state === "chosen" && "border-violet-500 bg-violet-50 font-medium dark:border-violet-600 dark:bg-violet-950/40",
        state === "correct" && "border-success-text bg-success-bg",
        state === "wrong" && "border-danger-border bg-danger-bg",
        state === "dimmed" && "border-border opacity-60"
      )}
    >
      <span className={cn(
        "mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2",
        state === "chosen" ? "border-violet-600 bg-violet-600" : "border-muted-foreground/40"
      )} />
      <span className="text-foreground/90">{option}</span>
    </button>
  );
}

export function MathQuizCard({ lesson }: { lesson: MathLesson }) {
  const recordAnswer = useMathProgress((s) => s.recordQuizAnswer);
  const saved = useMathProgress((s) => s.quizAnswers);
  const [chosen, setChosen] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const q of lesson.quiz) {
      const a = saved[q.id];
      if (a) out[q.id] = a.chosen;
    }
    return out;
  });

  const answered = lesson.quiz.filter((q) => chosen[q.id] !== undefined).length;
  const correct = lesson.quiz.filter((q) => chosen[q.id] !== undefined && chosen[q.id] === q.correctIndex).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{answered}/{lesson.quiz.length} answered</p>
        {answered === lesson.quiz.length && (
          <p className={cn("text-sm font-semibold", correct === lesson.quiz.length ? "text-success-text" : "text-warning-text")}>
            {correct}/{lesson.quiz.length}
            {correct < lesson.quiz.length ? " — the misses below tell the revision radar where to send you" : " — clean sweep"}
          </p>
        )}
      </div>
      {lesson.quiz.map((q, qi) => {
        const pick = chosen[q.id];
        const isAnswered = pick !== undefined;
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="mb-4 text-[15px] font-semibold leading-relaxed text-foreground">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                {qi + 1}
              </span>
              <InlineText text={q.prompt} />
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <OptionButton
                  key={oi}
                  option={opt}
                  index={oi}
                  disabled={isAnswered}
                  state={
                    !isAnswered ? "idle"
                      : oi === q.correctIndex ? "correct"
                        : oi === pick ? "wrong"
                          : "dimmed"
                  }
                  onPick={() => {
                    setChosen((c) => ({ ...c, [q.id]: oi }));
                    recordAnswer(q.id, { chosen: oi, correct: oi === q.correctIndex });
                  }}
                />
              ))}
            </div>
            {isAnswered && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  <span className="font-semibold">{pick === q.correctIndex ? "Correct. " : "Not quite. "}</span>
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

export function MathAssessmentPanel({ partLetter, questions }: { partLetter: string; questions: MathQuizQuestion[] }) {
  const recordAssessment = useMathProgress((s) => s.recordAssessment);
  const saved = useMathProgress((s) => s.assessments[partLetter]);
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    saved?.answers ? Object.fromEntries(Object.entries(saved.answers).map(([k, v]) => [k, v.chosen])) : {}
  );
  const [submitted, setSubmitted] = useState<boolean>(() => !!saved);

  const passThreshold = Math.ceil(questions.length * 0.8);
  const score = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined && answers[q.id] === q.correctIndex).length,
    [answers, questions]
  );
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const submit = () => {
    setSubmitted(true);
    const state: MathAssessmentState = {
      answers: Object.fromEntries(
        questions.filter((q) => answers[q.id] !== undefined).map((q) => [
          q.id,
          { chosen: answers[q.id], correct: answers[q.id] === q.correctIndex },
        ])
      ),
      score: questions.filter((q) => answers[q.id] !== undefined && answers[q.id] === q.correctIndex).length,
      total: questions.length,
      completedAt: new Date().toISOString(),
    };
    recordAssessment(partLetter, state);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  if (submitted) {
    const passed = score >= passThreshold;
    return (
      <div className="space-y-6">
        <div className={cn(
          "rounded-xl border p-6 text-center",
          passed ? "border-success-border bg-success-bg" : "border-warning-border bg-warning-bg"
        )}>
          <Award className={cn("mx-auto mb-3 h-10 w-10", passed ? "text-success-text" : "text-warning-text")} />
          <p className="text-3xl font-bold text-foreground">{score}/{questions.length}</p>
          <p className={cn("mt-1 text-sm font-semibold", passed ? "text-success-text" : "text-warning-text")}>
            {passed ? "Passed — 80% or better." : "Not yet — 80% is the goal, and the revision radar knows the way."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {passed
              ? "Part checkpoint cleared. On to the workshop, or revisit any question you missed."
              : "Each question below shows its explanation and the lesson that teaches it — the revision radar sends you there in order."}
          </p>
          <button
            type="button"
            onClick={() => { setAnswers({}); setSubmitted(false); }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" /> Retake assessment
          </button>
        </div>
        {questions.map((q, qi) => {
          const pick = answers[q.id];
          const correct = pick !== undefined && pick === q.correctIndex;
          return (
            <div key={q.id} className="rounded-xl border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-start gap-2.5">
                {correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-text" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-text" />}
                <p className="text-[15px] font-semibold leading-relaxed text-foreground">
                  {qi + 1}. <InlineText text={q.prompt} />
                </p>
              </div>
              <div className="ml-7.5 space-y-1.5 text-sm">
                <p className="text-foreground/90">
                  <span className="text-muted-foreground">Your answer: </span>
                  {pick !== undefined ? q.options[pick] : "(no answer)"}
                  {!correct && (
                    <>
                      <br />
                      <span className="text-muted-foreground">Correct answer: </span>
                      {q.options[q.correctIndex]}
                    </>
                  )}
                </p>
                <p className="text-muted-foreground"><InlineText text={q.explanation} /></p>
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
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              {qi + 1}
            </span>
            <InlineText text={q.prompt} />
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <OptionButton
                key={oi}
                option={opt}
                index={oi}
                state={answers[q.id] === oi ? "chosen" : "idle"}
                onPick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
              />
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
          allAnswered ? "bg-violet-600 hover:bg-violet-700" : "cursor-not-allowed bg-muted text-muted-foreground"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        Submit assessment ({Object.keys(answers).length}/{questions.length} answered)
      </button>
    </div>
  );
}
