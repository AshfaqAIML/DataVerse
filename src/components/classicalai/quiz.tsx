"use client";

/**
 * The Classical AI textbook's knowledge checks — lesson quizzes and part
 * checkpoints. Answers persist in the classical progress store; each
 * option carries feedback shown after answering.
 */
import { useState } from "react";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/course/types";
import { InlineText } from "@/components/course/blocks";
import { useClassicalProgress } from "@/lib/classicalai/progress";

export function ClassicalQuiz({
  questions,
  storagePrefix,
  title = "Knowledge check",
  compact,
}: {
  questions: QuizQuestion[];
  storagePrefix: string;
  title?: string;
  compact?: boolean;
}) {
  const record = useClassicalProgress((s) => s.recordQuizAnswer);
  const answers = useClassicalProgress((s) => s.quizAnswers);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const correctCount = questions.filter((q) => {
    const a = answers[`${storagePrefix}-${q.id}`] ?? answers[q.id];
    return a?.correct;
  }).length;
  const answeredCount = questions.filter((q) => confirmed[q.id]).length;

  return (
    <section className={cn("dv-quiz rounded-2xl border border-border-subtle bg-surface shadow-e1", compact ? "px-4 py-4" : "px-5 py-5")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
          <ListChecks className="h-4.5 w-4.5 text-viz-3" />
          {title}
        </p>
        {answeredCount > 0 && (
          <span className="tabular rounded-full border border-border-subtle bg-surface-subtle/60 px-2.5 py-0.5 font-mono text-[11px] text-ink-2">
            {correctCount}/{questions.length} correct
          </span>
        )}
      </div>

      <div className="mt-4 space-y-5">
        {questions.map((q, qi) => {
          const key = `${storagePrefix}-${q.id}`;
          const chosen = answers[key];
          const done = confirmed[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-border-subtle bg-surface-subtle/30 px-4 py-3.5">
              <p className="text-[14px] font-medium leading-relaxed text-ink">
                <span className="mr-2 font-mono text-[12px] text-ink-3">Q{qi + 1}</span>
                <InlineText text={q.prompt} />
              </p>
              <div className="mt-3 space-y-1.5">
                {q.options.map((o, i) => {
                  const isChosen = chosen?.chosen === i;
                  const showState = done && (isChosen || o.correct);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={done}
                      onClick={() => {
                        record(key, { chosen: i, correct: o.correct });
                        setConfirmed((c) => ({ ...c, [q.id]: true }));
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all duration-150",
                        !done && "border-border-subtle bg-surface hover:border-viz-3/50",
                        done && o.correct && "border-success-border bg-success-bg/40",
                        done && isChosen && !o.correct && "border-danger-border bg-danger-bg/30",
                        done && !isChosen && !o.correct && "border-transparent bg-surface opacity-55"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold",
                          done && o.correct ? "border-success-text text-success-text" : done && isChosen ? "border-danger-text text-danger-text" : "border-border-strong text-ink-3"
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] leading-relaxed text-ink">{o.text}</span>
                        {showState && done && (
                          <span className={cn("mt-1 block text-[12px] leading-relaxed", o.correct ? "text-success-text" : "text-ink-3")}>
                            {o.feedback}
                          </span>
                        )}
                      </span>
                      {done && o.correct && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />}
                      {done && isChosen && !o.correct && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />}
                    </button>
                  );
                })}
              </div>
              {done && (
                <p className="mt-3 border-t border-border-subtle pt-2.5 text-[13px] leading-relaxed text-ink-2">
                  <span className="font-semibold">Takeaway: </span>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
