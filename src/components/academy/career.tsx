"use client";

/**
 * CareerView — the Career Centre: school I's subjects (portfolio, resume,
 * interviews, capstones) plus the career-bound roadmap, all from the
 * registry. No invented job statistics.
 */
import { ArrowRight, ArrowUpRight, Briefcase, GraduationCap, Map } from "lucide-react";
import { curriculum } from "@/lib/curriculum/data";
import { useStudentState } from "@/lib/academy/student";
import { DifficultyBadge, StatusBadge, subjectStatus } from "./shared";
import { Reveal } from "./motion";

export function CareerView({ navigate }: { navigate: (hash: string) => void }) {
  const state = useStudentState();
  const schoolI = curriculum.registry.schools.find((s) => s.code === "I")!;
  const subjects = curriculum.registry.subjects.filter((s) => s.school === "I");
  const roadmap = curriculum.registry.roadmaps.find((r) => r.slug === "data-scientist");

  return (
    <div className="min-w-0 space-y-9">
      <header className="max-w-2xl">
        <p className="eyebrow" style={{ color: schoolI.color }}>
          School I · {schoolI.name}
        </p>
        <h1 className="t-page mt-2 text-ink">
          The <span className="dv-gradient-text">Career Centre</span>
        </h1>
        <p className="t-body mt-3">
          Turn skills into offers: portfolio projects that prove you can do the work, GitHub presence, interview and
          resume preparation, and a graduation capstone. The sequence below is the registry&apos;s own — every gate
          real.
        </p>
      </header>

      {/* the school I subjects, in registry order */}
      <Reveal as="section" className="space-y-3">
        <h2 className="t-section text-ink">The career subjects</h2>
        {subjects.map((s) => {
          const status = subjectStatus(curriculum, state, s.slug);
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => navigate(`#/subject/${s.slug}`)}
              className="group flex w-full flex-col rounded-xl border border-border-subtle bg-surface p-4 text-left shadow-e1 dv-card-hover sm:flex-row sm:items-center sm:gap-4"
            >
              <span
                className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${schoolI.color} 12%, transparent)`, color: schoolI.color }}
              >
                {s.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink group-hover:text-primary">{s.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-ink-3">{s.blurb}</span>
                <span className="tabular mt-1 block text-[11.5px] text-ink-3">
                  {s.modules.length} modules · {curriculum.lessonCount(s.slug)} lessons ·{" "}
                  {s.projects.length} project{s.projects.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
                <DifficultyBadge difficulty={s.difficulty} />
                <StatusBadge status={status} />
                <ArrowUpRight className="h-4 w-4 text-ink-3 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </Reveal>

      {/* the career-bound roadmap */}
      {roadmap && (
        <Reveal as="section" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="t-section text-ink">{roadmap.title}</h2>
              <p className="t-caption mt-1">{roadmap.audience}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("#/roadmap")}
              className="link-dv flex items-center gap-1 text-sm"
            >
              Open the roadmap planner <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ol className="relative space-y-3 before:absolute before:bottom-5 before:left-[15px] before:top-5 before:w-px before:bg-border-subtle">
            {roadmap.stages.map((stage, i) => (
              <li key={stage.title} className="relative pl-11">
                <span
                  className="absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface font-mono text-[11px] font-bold text-ink shadow-e1"
                  style={{ color: schoolI.color }}
                >
                  {i + 1}
                </span>
                <p className="text-[14.5px] font-medium text-ink">{stage.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-3">{stage.focus}</p>
                <p className="tabular mt-1 font-mono text-[11px] text-ink-3">{stage.subjects.length} subjects</p>
              </li>
            ))}
          </ol>
        </Reveal>
      )}

      {/* the honest note */}
      <Reveal as="section" className="rounded-2xl border border-border-subtle bg-surface px-6 py-5 shadow-e1">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Briefcase className="h-4.5 w-4.5" style={{ color: schoolI.color }} />
          What the Career Centre does not promise
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
          No placement rates, no salary tables, no employer guarantees — this platform teaches and verifies skills;
          the market does the rest. What the registry does promise is that every portfolio piece you will build has a
          rubric, a reviewer checklist and a dependency-honest place in the sequence.
        </p>
        <button
          type="button"
          onClick={() => navigate("#/explore")}
          className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3.5 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:text-ink"
        >
          <GraduationCap className="h-4 w-4" /> Browse the full catalogue <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </Reveal>
    </div>
  );
}
