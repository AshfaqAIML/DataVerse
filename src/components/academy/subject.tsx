"use client";

/**
 * Subject view — the complete curriculum of one subject: objectives,
 * prerequisite state, the personalized path to it, the full module ->
 * chapter -> lesson tree with study tracking, assessments and projects.
 */
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FlaskConical,
  GraduationCap,
  Layers,
  Lock,
  Route,
  Sparkles,
  Target,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { curriculum, PLACEMENT_BANKS } from "@/lib/curriculum/data";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import { useStudentState, AUTHORED_COURSES } from "@/lib/academy/student";
import { useAcademy } from "@/lib/academy/state";
import { useCourseProgress } from "@/lib/course/progress";
import { PYTHON_COURSE } from "@/content/python";
import { countLessons } from "@/lib/course/types";
import { StatusBadge, subjectStatus, formatHours, DifficultyBadge } from "./shared";
import { Reveal } from "./motion";

export function SubjectView({ slug, navigate }: { slug: string; navigate: (hash: string) => void }) {
  const state = useStudentState();
  const academy = useAcademy();
  const courseLessonsDone = useCourseProgress((s) => s.lessonsDone);
  const subject = curriculum.getSubject(slug);

  if (!subject) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="font-semibold">Unknown subject &quot;{slug}&quot;</p>
        <button onClick={() => navigate("#/")} className="mt-2 text-sm text-success-text hover:underline">
          Back to the academy home
        </button>
      </div>
    );
  }

  const school = curriculum.registry.schools.find((s) => s.code === subject.school)!;
  const status = subjectStatus(curriculum, state, slug);
  const unmet = curriculum.unmetPrerequisites(state, slug);
  const authored = AUTHORED_COURSES[slug];
  const bank = PLACEMENT_BANKS[slug];
  const progressEntry = state.progress[slug];
  const dependents = curriculum.dependentClosure(slug);
  const plan =
    status === "locked" && !curriculum.isMastered(state, slug) ? curriculum.planPathTo(state, slug) : null;

  const pythonDone =
    slug === "python" ? countLessons(PYTHON_COURSE) && Object.keys(courseLessonsDone).length : 0;

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------ header */}
      <section className="space-y-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <button
            onClick={() => navigate(`#/school/${school.slug}`)}
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowRight className="h-3 w-3 rotate-180" /> School {school.code} · {school.name}
          </button>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="font-mono text-xs"
              style={{ borderColor: school.color, color: school.color }}
            >
              {subject.code}
            </Badge>
            <DifficultyBadge difficulty={subject.difficulty} />
            <Badge variant="outline" className="capitalize">
              {subject.track} track
            </Badge>
            <StatusBadge status={status} />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{subject.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">{subject.blurb}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {curriculum.lessonCount(slug)} lessons · {subject.modules.length} modules · {formatHours(curriculum.hours(slug))} ·{" "}
            {subject.projects.length} project{subject.projects.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2">
          {authored ? (
            <Button onClick={() => navigate(authored.href)}>
              <GraduationCap className="mr-1.5 h-4 w-4" />
              {status === "in-progress" ? "Continue the interactive course" : "Start the interactive course"}
            </Button>
          ) : (
            status !== "mastered" &&
            status !== "waived" &&
            status !== "locked" && (
              <Button
                onClick={() => {
                  academy.touch(slug);
                  const el = document.getElementById("curriculum");
                  if (el) scrollIntoViewSafe(el);
                }}
              >
                {(status === "in-progress" ? "Continue studying" : "Start studying") + " — mark lessons as you go"}
              </Button>
            )
          )}
          {bank && status !== "mastered" && status !== "waived" && (
            <Button variant="outline" onClick={() => navigate(`#/placement/${slug}`)}>
              <FlaskConical className="mr-1.5 h-4 w-4" /> Placement test ({bank.length} questions)
            </Button>
          )}
          <Button
            variant={status === "waived" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => academy.toggleWaived(slug)}
          >
            {status === "waived" ? (
              <>
                <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo waive
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> I already know this
              </>
            )}
          </Button>
        </div>

        {/* progress */}
        {progressEntry && (
          <Card className="py-4">
            <CardContent className="space-y-2 px-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {progressEntry.lessonsCompleted} of {progressEntry.lessonsTotal} lessons studied
                  {progressEntry.completedAt ? " — complete" : ""}
                </span>
                <span className="text-muted-foreground">
                  {Math.round((progressEntry.lessonsCompleted / progressEntry.lessonsTotal) * 100)}%
                </span>
              </div>
              <Progress value={(progressEntry.lessonsCompleted / progressEntry.lessonsTotal) * 100} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* python interactive-course banner */}
        {authored && slug === "python" && (
          <Card className="border-success-border bg-success-bg/50 py-4">
            <CardContent className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-semibold">
                  This subject has a fully-authored interactive course: {authored.lessons} lessons with runnable,
                  machine-verified code and an in-browser Python playground.
                </p>
                {pythonDone > 0 && (
                  <p className="mt-0.5 text-muted-foreground">
                    You have completed {pythonDone} of {authored.lessons} course lessons.
                  </p>
                )}
              </div>
              <Button size="sm" onClick={() => navigate(authored.href)} className="shrink-0">
                Open the course
              </Button>
            </CardContent>
          </Card>
        )}

        {/* locked */}
        {status === "locked" && (
          <Card className="border-danger-border bg-danger-bg/50 py-4">
            <CardContent className="space-y-2 px-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-danger-text">
                <Lock className="h-4 w-4" /> Locked — {unmet.length} prerequisite{unmet.length > 1 ? "s" : ""} not yet
                mastered
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {unmet.map((p) => {
                  const prereq = curriculum.subject(p);
                  return (
                    <li key={p}>
                      <button
                        onClick={() => navigate(`#/subject/${p}`)}
                        className="font-medium text-danger-text underline-offset-2 hover:underline"
                      >
                        {prereq.code} · {prereq.title}
                      </button>
                      {PLACEMENT_BANKS[p] && (
                        <button
                          onClick={() => navigate(`#/placement/${p}`)}
                          className="ml-2 text-xs text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                        >
                          or test out of it
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => navigate(`#/placement?goal=${slug}`)}
              >
                <Route className="mr-1.5 h-3.5 w-3.5" /> See the placement plan for this goal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* mastered: what it unlocks */}
        {(status === "mastered" || status === "waived") && (
          <Card className="border-success-border bg-success-bg/50 py-4">
            <CardContent className="space-y-1.5 px-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-success-text">
                <Sparkles className="h-4 w-4" />
                {status === "waived" ? "Waived — everything downstream unlocks" : "Mastered — everything downstream unlocks"}
              </p>
              <p className="text-muted-foreground">
                {dependents.length === 0
                  ? "No other subject depends on this one."
                  : `Unlocks ${dependents.length} dependent subject${dependents.length > 1 ? "s" : ""}: ${dependents
                      .slice(0, 5)
                      .map((d) => curriculum.subject(d).title)
                      .join(", ")}${dependents.length > 5 ? `, and ${dependents.length - 5} more` : ""}.`}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ----------------------------------------------- path to this subject */}
      {plan && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Route className="h-4 w-4 text-muted-foreground" /> Your path to this subject
          </h2>
          <Card className="py-5">
            <CardContent className="space-y-3 px-4">
              <p className="text-sm text-muted-foreground">
                {plan.steps.length} step{plan.steps.length > 1 ? "s" : ""} · {formatHours(plan.totalHours)} of study
                remaining. Placement tests can waive any step you already know — passing a test subsumes everything
                below it.
              </p>
              <ol className="space-y-2">
                {plan.steps.map((step, i) => (
                  <li key={step.slug} className="flex items-center gap-2 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                      {i + 1}
                    </span>
                    <button
                      onClick={() => navigate(`#/subject/${step.slug}`)}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {step.title}
                    </button>
                    <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
                      {step.code}
                    </Badge>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatHours(step.hours)}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      )}

      {/* --------------------------------------------------- objectives/outcomes */}
      <Reveal as="section" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="py-5">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-success-text" /> Learning objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="ml-4 list-disc space-y-1.5 text-sm">
              {subject.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="py-5">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-success-text" /> Learning outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="ml-4 list-disc space-y-1.5 text-sm">
              {subject.outcomes.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Reveal>

      {/* -------------------------------------------------------- curriculum */}
      <section id="curriculum" className="scroll-mt-24 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Layers className="h-4 w-4 text-muted-foreground" /> Curriculum
          </h2>
          <p className="text-xs text-muted-foreground">
            {slug === "python"
              ? "Course lessons are tracked by the interactive course"
              : "Mark lessons as you study them — progress feeds the roadmap"}
          </p>
        </div>
        <Accordion type="multiple" defaultValue={["m1"]} className="space-y-3">
          {subject.modules.map((m, mi) => (
            <AccordionItem key={mi} value={`m${mi + 1}`} className="rounded-xl border bg-card px-4 data-[state=open]:bg-muted/20">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    Module {mi + 1} · {m.title}
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">{m.summary}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">Checkpoint: {m.checkpoint.questions} questions</Badge>
                  {m.exerciseKinds.slice(0, 4).map((k, ki) => (
                    <Badge key={ki} variant="outline" className="capitalize">
                      {k.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
                {m.chapters.map((c, ci) => (
                  <div key={ci} className="rounded-lg border bg-background/60 p-3">
                    <p className="text-sm font-medium">
                      Chapter {mi + 1}.{ci + 1} · {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.focus}</p>
                    <ul className="mt-2 space-y-1.5">
                      {c.lessons.map((l, li) => {
                        const key = `m${mi + 1}c${ci + 1}l${li + 1}`;
                        const done = !!academy.lessonDone[slug]?.[key];
                        return (
                          <li key={li} className="flex items-start gap-2 rounded px-1 py-0.5 text-sm">
                            {slug === "python" ? (
                              <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            ) : (
                              <button
                                aria-label={done ? "Mark lesson as not studied" : "Mark lesson as studied"}
                                onClick={() => academy.toggleLesson(slug, key, !done)}
                                className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {done ? (
                                  <CheckCircle2 className="h-4 w-4 text-success-text" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <div className="min-w-0">
                              <span className={`leading-snug ${done ? "text-muted-foreground line-through" : ""}`}>
                                {l.title}
                              </span>
                              <span className="ml-2 shrink-0 text-xs text-muted-foreground">{l.minutes} min</span>
                              <p className="text-xs text-muted-foreground">{l.summary}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* --------------------------------------------- assessments + projects */}
      <Reveal as="section" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="py-5">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-success-text" /> Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 px-4 text-sm">
            {subject.modules.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">Module {i + 1} checkpoint</span>
                <span className="text-xs">
                  {m.checkpoint.questions} questions · {m.checkpoint.minutes} min · pass {m.checkpoint.passingScore}%
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">{subject.finalExam.title}</span>
              <span className="text-xs">
                {subject.finalExam.questions} questions · {subject.finalExam.minutes} min · pass{" "}
                {subject.finalExam.passingScore}%
              </span>
            </div>
            {bank && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Placement test</span>
                  <span className="text-xs">
                    {bank.length} questions · pass at 90% to waive (75%+ starts at module 2)
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-success-text" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            {subject.projects.map((p, i) => (
              <div key={i} className="rounded-lg border bg-background/60 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <Badge variant="secondary" className="capitalize">
                    {p.tier}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">≈ {p.hours} h</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.brief}</p>
                <p className="mt-2 text-xs">
                  <span className="font-medium">Deliverables:</span> {p.deliverables.join(" · ")}
                </p>
                <p className="mt-1 flex flex-wrap gap-1">
                  {p.tools.map((t, ti) => (
                    <Badge key={ti} variant="outline" className="text-[11px]">
                      {t}
                    </Badge>
                  ))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      <p className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
        {subject.keywords.map((k, i) => (
          <Badge key={i} variant="outline">
            {k}
          </Badge>
        ))}
      </p>
    </div>
  );
}
