"use client";

/**
 * Placement flow — "test your existing knowledge".
 *
 * Hub:   rules, a goal picker, and the placement plan for that goal —
 *        which tests to take (most-advanced first, with subsume effects)
 *        versus which subjects to simply study.
 * Test:  a real question bank per subject; grading maps to the engine:
 *        >= 90 waives the subject (dependents unlock), 75-89 grants
 *        advanced standing (start at module 2), below 75 = study.
 */
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FlaskConical, Info, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { curriculum, PLACEMENT_BANKS } from "@/lib/curriculum/data";
import { prefersReducedMotion } from "@/lib/focus-trap";
import { useStudentState } from "@/lib/academy/student";
import { useAcademy } from "@/lib/academy/state";
import { PLACEMENT_ACCELERATED_SCORE, PLACEMENT_MASTERY_SCORE, type PlacementQuestion } from "@/lib/curriculum/types";
import { formatHours } from "./shared";
import { Reveal } from "./motion";

// ---------------------------------------------------------------------- hub

export function PlacementHub({ navigate, initialGoal }: { navigate: (hash: string) => void; initialGoal?: string }) {
  const state = useStudentState();
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState<string | null>(
    initialGoal && curriculum.getSubject(initialGoal) ? initialGoal : null
  );

  const plan = useMemo(() => (goal ? curriculum.planPlacement(state, goal, PLACEMENT_BANKS) : null), [state, goal]);
  const taken = Object.entries(state.placement);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FlaskConical className="h-6 w-6 text-violet-600" /> Placement
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Test out of subjects you already know. Pick a goal subject and the academy builds your placement plan:
            the tests to take, most-advanced first — passing one at {PLACEMENT_MASTERY_SCORE}%+ waives it and subsumes
            its whole prerequisite chain.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              score: `${PLACEMENT_MASTERY_SCORE}%+`,
              title: "Waived",
              text: "The subject is marked mastered; everything that depends on it unlocks.",
              tone: "border-success-border bg-success-bg/50",
            },
            {
              score: `${PLACEMENT_ACCELERATED_SCORE}–${PLACEMENT_MASTERY_SCORE - 1}%`,
              title: "Advanced standing",
              text: "Skip module 1 — start the subject at module 2.",
              tone: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
            },
            {
              score: `< ${PLACEMENT_ACCELERATED_SCORE}%`,
              title: "Study it",
              text: "No skip — start the subject from lesson one. Nothing is lost.",
              tone: "border-warning-border bg-warning-bg/50",
            },
          ].map((r) => (
            <Card key={r.title} className={`py-4 ${r.tone}`}>
              <CardContent className="px-4">
                <p className="text-sm font-bold">{r.score}</p>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* goal picker */}
      <Reveal as="section" className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Choose a goal subject</h2>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — e.g. 'machine learning', 'pandas', 'dashboard'…"
        />
        <div className="grid max-h-64 gap-1.5 overflow-y-auto rounded-xl border bg-card p-2">
          {curriculum
            .searchSubjects({ q: query, pageSize: 12 })
            .items.filter((s) => !curriculum.isMastered(state, s.slug))
            .map((s) => (
              <button
                key={s.slug}
                onClick={() => setGoal(s.slug)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  goal === s.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Badge variant="outline" className={`shrink-0 font-mono text-xs ${goal === s.slug ? "border-primary-foreground/40" : ""}`}>
                  {s.code}
                </Badge>
                <span className="truncate font-medium">{s.title}</span>
                {state.placement[s.slug] !== undefined && (
                  <span className="ml-auto shrink-0 text-xs opacity-70">best {state.placement[s.slug]}%</span>
                )}
              </button>
            ))}
        </div>
      </Reveal>

      {/* plan */}
      {plan && goal && (
        <Reveal as="section" className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Placement plan for {curriculum.subject(goal).title}
          </h2>
          <Card className="py-5">
            <CardContent className="space-y-4 px-4">
              <p className="text-sm text-muted-foreground">
                {plan.tests.length > 0
                  ? `${plan.tests.length} test${plan.tests.length > 1 ? "s" : ""} cover the prerequisite chain · ${formatHours(plan.totalHoursIfStudied)} of study you could skip by passing them all`
                  : "Every prerequisite is already mastered — nothing to test out of. Start the goal directly."}
              </p>
              {plan.tests.map((t) => (
                <div key={t.slug} className="flex flex-col gap-2 rounded-lg border bg-background/60 p-3 sm:flex-row sm:items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                    {t.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {t.code} · {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.questions} questions · ~{t.minutes} min
                      {t.supersedeOnPass.length > 0 &&
                        ` · passing also waives: ${t.supersedeOnPass.map((d) => curriculum.subject(d).code).join(", ")}`}
                    </p>
                  </div>
                  {t.status === "waived" ? (
                    <Badge variant="secondary" className="shrink-0">
                      Already waived
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate(`#/placement/${t.slug}`)}>
                      Take test
                    </Button>
                  )}
                </div>
              ))}
              {plan.study.length > 0 && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Study normally (no placement bank): {plan.study.map((d) => curriculum.subject(d).title).join(", ")}
                </p>
              )}
              <Button onClick={() => navigate(`#/subject/${goal}`)} className="w-full sm:w-auto">
                Go to the goal subject <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* record */}
      {taken.length > 0 && (
        <Reveal as="section" className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Your placement record</h2>
          <div className="divide-y rounded-xl border bg-card">
            {taken
              .sort((a, b) => b[1] - a[1])
              .map(([slug, score]) => {
                const s = curriculum.getSubject(slug);
                if (!s) return null;
                const outcome = curriculum.placementOutcome(state, slug);
                return (
                  <button
                    key={slug}
                    onClick={() => navigate(`#/subject/${slug}`)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50"
                  >
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {s.code}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.title}</span>
                    <Badge
                      variant="secondary"
                      className={
                        outcome === "mastered"
                          ? "border-transparent bg-success-bg text-success-text"
                          : outcome === "accelerated"
                            ? "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : ""
                      }
                    >
                      {score}% · {outcome === "mastered" ? "waived" : outcome === "accelerated" ? "module 2" : "study"}
                    </Badge>
                  </button>
                );
              })}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------- test

export function PlacementTest({ slug, navigate }: { slug: string; navigate: (hash: string) => void }) {
  const academy = useAcademy();
  const state = useStudentState();
  const subject = curriculum.getSubject(slug);
  const bank: PlacementQuestion[] = subject ? (PLACEMENT_BANKS[slug] ?? []) : [];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!subject || bank.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="font-semibold">No placement test for &quot;{slug}&quot;</p>
        <button onClick={() => navigate("#/placement")} className="mt-2 text-sm text-success-text hover:underline">
          Back to the placement hub
        </button>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const correct = bank.filter((q) => answers[q.id] === q.answer).length;
  const score = Math.round((correct / bank.length) * 100);
  const outcome = score >= PLACEMENT_MASTERY_SCORE ? "mastered" : score >= PLACEMENT_ACCELERATED_SCORE ? "accelerated" : "standard";
  const dependents = curriculum.dependentClosure(slug);

  const submit = () => {
    academy.recordPlacement(slug, score);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <button
          onClick={() => navigate("#/placement")}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-3 w-3 rotate-180" /> Placement hub
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          Placement test · {subject.code} {subject.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {bank.length} questions · {score >= 0 && submitted ? `You scored ${score}%` : `${PLACEMENT_MASTERY_SCORE}%+ waives · ${PLACEMENT_ACCELERATED_SCORE}–${PLACEMENT_MASTERY_SCORE - 1}% starts at module 2`}
        </p>
      </section>

      {submitted && (
        <Card
          className={`dv-toast py-5 ${
            outcome === "mastered"
              ? "border-success-border bg-success-bg/50"
              : outcome === "accelerated"
                ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                : "border-warning-border bg-warning-bg/50"
          }`}
        >
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              {outcome === "mastered" ? <Sparkles className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              {score}% —{" "}
              {outcome === "mastered"
                ? "waived"
                : outcome === "accelerated"
                  ? "advanced standing — start at module 2"
                  : "study this subject from the beginning"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 text-sm">
            <p className="text-muted-foreground">
              {correct} of {bank.length} correct.{" "}
              {outcome === "mastered"
                ? dependents.length > 0
                  ? `Unlocked ${dependents.length} dependent subject${dependents.length > 1 ? "s" : ""}: ${dependents.slice(0, 4).map((d) => curriculum.subject(d).title).join(", ")}${dependents.length > 4 ? "…" : ""}.`
                  : "No other subject depends on this one — but it counts toward your roadmap."
                : outcome === "accelerated"
                  ? "Module 1 is skipped — jump straight in."
                  : "No skip granted. Take the course from the top; your best score is kept."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => navigate(`#/subject/${slug}`)}>
                Go to the subject
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}>
                Retake the test
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("#/placement")}>
                Placement hub
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        {bank.map((q, qi) => {
          const chosen = answers[q.id];
          return (
            <Card key={q.id} className="py-5">
              <CardContent className="space-y-3 px-4">
                <p className="text-sm font-medium leading-relaxed">
                  <span className="mr-2 font-mono text-xs text-muted-foreground">Q{qi + 1}</span>
                  {q.prompt}
                </p>
                <RadioGroup
                  value={chosen !== undefined ? String(chosen) : ""}
                  onValueChange={(v) => !submitted && setAnswers((a) => ({ ...a, [q.id]: Number(v) }))}
                  className="gap-2"
                >
                  {q.options.map((opt, oi) => {
                    const isCorrect = submitted && oi === q.answer;
                    const isWrongPick = submitted && chosen === oi && oi !== q.answer;
                    return (
                      <div
                        key={oi}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          isCorrect
                            ? "border-success-text bg-success-bg"
                            : isWrongPick
                              ? "border-danger-text bg-danger-bg"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value={String(oi)} id={`${q.id}-${oi}`} disabled={submitted} />
                        <Label htmlFor={`${q.id}-${oi}`} className="flex-1 cursor-pointer font-normal">
                          {opt}
                        </Label>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-success-text" />}
                        {isWrongPick && <XCircle className="h-4 w-4 shrink-0 text-danger-text" />}
                      </div>
                    );
                  })}
                </RadioGroup>
                {submitted && <p className="text-xs text-muted-foreground">{q.explanation}</p>}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {!submitted && (
        <div className="sticky bottom-4 rounded-xl border bg-card/95 p-3 shadow-e3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {answered} of {bank.length} answered
            </p>
            <Button disabled={answered < bank.length} onClick={submit}>
              Submit and grade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
