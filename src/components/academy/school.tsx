"use client";

/**
 * School view — one of the nine schools with its full subject catalog.
 */
import { ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { curriculum } from "@/lib/curriculum/data";
import { useStudentState } from "@/lib/academy/student";
import { SchoolIcon, StatusBadge, subjectStatus, formatHours, DifficultyBadge } from "./shared";
import { Reveal } from "./motion";

export function SchoolView({ slug, navigate }: { slug: string; navigate: (hash: string) => void }) {
  const state = useStudentState();
  const school = curriculum.registry.schools.find((s) => s.slug === slug);
  if (!school) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="font-semibold">Unknown school &quot;{slug}&quot;</p>
        <button onClick={() => navigate("#/")} className="mt-2 text-sm text-success-text hover:underline">
          Back to the academy home
        </button>
      </div>
    );
  }

  const subjects = curriculum.registry.subjects.filter((s) => s.school === school.code);
  const stats = curriculum.stats().bySchool[school.code];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <button
          onClick={() => navigate("#/")}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-3 w-3 rotate-180" /> All schools
        </button>
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: school.color }}
          >
            <SchoolIcon name={school.icon} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              School {school.code} · {school.name}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">{school.tagline}</p>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">{school.description}</p>
        <p className="text-sm">
          {stats.subjects} subjects · {stats.lessons} lessons · {formatHours(stats.hours)} estimated
        </p>
      </section>

      <Reveal as="section" className="space-y-3">
        {subjects.map((s) => {
          const status = subjectStatus(curriculum, state, s.slug);
          const unmet = curriculum.unmetPrerequisites(state, s.slug);
          const masteredHere = curriculum.isMastered(state, s.slug);
          return (
            <Card key={s.slug} className="overflow-hidden py-0 dv-card-hover hover:bg-muted/30">
              <button onClick={() => navigate(`#/subject/${s.slug}`)} className="block w-full text-left">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {s.code}
                    </Badge>
                    <DifficultyBadge difficulty={s.difficulty} />
                    <StatusBadge status={status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {curriculum.lessonCount(s.slug)} lessons · {formatHours(curriculum.hours(s.slug))}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-snug">{s.title}</p>
                  <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-muted-foreground">{s.blurb}</p>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>
                      {s.prerequisites.length === 0
                        ? "No prerequisites — start anytime"
                        : `Requires: ${s.prerequisites.map((p) => curriculum.subject(p).code).join(", ")}`}
                    </span>
                    {!masteredHere && unmet.length > 0 && (
                      <span className="flex items-center gap-1 text-danger-text">
                        <Lock className="h-3 w-3" />
                        {unmet.length} unmet
                      </span>
                    )}
                    {masteredHere && <span className="ml-auto font-medium text-success-text">Mastered — unlocks dependents</span>}
                  </div>
                </CardContent>
              </button>
            </Card>
          );
        })}
      </Reveal>
    </div>
  );
}
