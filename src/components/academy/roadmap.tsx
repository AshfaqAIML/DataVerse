"use client";

/**
 * Roadmap view — staged plans over the registry, personalized by the
 * student's state, with a study-pace control.
 */
import { useState } from "react";
import { Clock, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { curriculum } from "@/lib/curriculum/data";
import { useStudentState } from "@/lib/academy/student";
import { StatusBadge, subjectStatus, formatHours } from "./shared";
import { Reveal } from "./motion";

const PACES = [4, 6, 8, 10, 12, 16, 20];

export function RoadmapView({ navigate, initialRoadmap }: { navigate: (hash: string) => void; initialRoadmap?: string }) {
  const state = useStudentState();
  const [roadmapSlug, setRoadmapSlug] = useState(initialRoadmap ?? curriculum.registry.roadmaps[0].slug);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);

  const plan = curriculum.planRoadmap(roadmapSlug, { state, hoursPerWeek });
  const totalSubjects = plan.stages.reduce((n, s) => n + s.subjects.length, 0);
  const masteredCount = plan.stages.reduce((n, s) => n + s.subjects.filter((x) => x.status === "mastered").length, 0);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{plan.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">{plan.audience}</p>
        </div>

        {/* roadmap picker */}
        <div className="flex flex-wrap gap-2">
          {curriculum.registry.roadmaps.map((rm) => (
            <Button
              key={rm.slug}
              size="sm"
              variant={rm.slug === roadmapSlug ? "default" : "outline"}
              onClick={() => setRoadmapSlug(rm.slug)}
            >
              {rm.title}
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                {rm.stages.length} stages
              </Badge>
            </Button>
          ))}
        </div>

        {/* summary + pace */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-lg font-bold leading-tight">{masteredCount}/{totalSubjects}</p>
              <p className="text-xs text-muted-foreground">subjects mastered</p>
              <Progress value={(masteredCount / Math.max(1, totalSubjects)) * 100} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-lg font-bold leading-tight">{formatHours(plan.totalHours)}</p>
              <p className="text-xs text-muted-foreground">study time remaining</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-center justify-between px-4">
              <div>
                <p className="text-lg font-bold leading-tight">{plan.totalWeeks}</p>
                <p className="text-xs text-muted-foreground">weeks at your pace</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Slower pace"
                  onClick={() => setHoursPerWeek(PACES[Math.max(0, PACES.indexOf(hoursPerWeek) - 1)] ?? hoursPerWeek)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="flex w-14 items-center justify-center gap-1 text-sm font-semibold">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {hoursPerWeek}h
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Faster pace"
                  onClick={() =>
                    setHoursPerWeek(PACES[Math.min(PACES.length - 1, PACES.indexOf(hoursPerWeek) + 1)] ?? hoursPerWeek)
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* stages */}
      <Reveal as="section" className="space-y-4">
        {plan.stages.map((stage) => {
          const stageMastered = stage.subjects.every((s) => s.status === "mastered");
          return (
            <Card key={stage.index} className={`overflow-hidden py-0 ${stageMastered ? "opacity-70" : ""}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-solid text-xs font-bold text-white">
                    {stage.index}
                  </span>
                  <p className="font-semibold">{stage.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {stage.hours > 0 ? `${formatHours(stage.hours)} · ${stage.weeks} wk` : "done"}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    week {stage.weeksFromStart - stage.weeks + 1}
                    {stage.weeks > 1 ? `–${stage.weeksFromStart}` : ""} at {hoursPerWeek} h/wk
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{stage.focus}</p>
                <div className="mt-3 space-y-1">
                  {stage.subjects.map((s) => {
                    const subject = curriculum.subject(s.slug);
                    return (
                      <button
                        key={s.slug}
                        onClick={() => navigate(`#/subject/${s.slug}`)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60"
                      >
                        <StatusBadge status={subjectStatus(curriculum, state, s.slug)} />
                        <span className="font-mono text-xs text-muted-foreground">{s.code}</span>
                        <span className={`min-w-0 flex-1 truncate ${s.status === "mastered" ? "text-muted-foreground line-through" : "font-medium"}`}>
                          {subject.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatHours(s.hours)}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </Reveal>

      <Reveal as="section" className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">What this roadmap gives you</h2>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          {plan.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
