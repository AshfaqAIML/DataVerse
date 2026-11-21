"use client";

/**
 * ProjectsView — every project in the registry, grouped by school, with
 * tiers, deliverables and rubric counts straight from the data.
 */
import { useMemo, useState } from "react";
import { ArrowUpRight, FolderGit2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { curriculum } from "@/lib/curriculum/data";
import type { ProjectDef, SubjectDef } from "@/lib/curriculum/types";
import { Reveal } from "./motion";

const TIER_STYLE: Record<string, string> = {
  guided: "bg-success-bg text-success-text border-success-border",
  independent: "bg-warning-bg text-warning-text border-warning-border",
  capstone: "bg-gold-100 text-gold-700 border-gold-300 dark:bg-gold-100/10 dark:text-gold-300 dark:border-gold-700",
};

const TIERS = ["all", "guided", "independent", "capstone"] as const;

export function ProjectsView({ navigate }: { navigate: (hash: string) => void }) {
  const [tier, setTier] = useState<(typeof TIERS)[number]>("all");

  const projects = useMemo(() => {
    const out: Array<{ project: ProjectDef; subject: SubjectDef }> = [];
    for (const subject of curriculum.registry.subjects) {
      for (const project of subject.projects) out.push({ project, subject });
    }
    return out
      .filter(({ project }) => tier === "all" || project.tier === tier)
      .sort((a, b) => a.subject.code.localeCompare(b.subject.code));
  }, [tier]);

  return (
    <div className="min-w-0 space-y-7">
      <header className="max-w-2xl">
        <p className="eyebrow">Learn by building</p>
        <h1 className="t-page mt-2 text-ink">
          The <span className="dv-gradient-text">project record</span>
        </h1>
        <p className="t-body mt-3">
          {curriculum.registry.manifest.projects} projects across the academy&apos;s subjects — briefs, tiers,
          deliverables and rubric criteria exactly as the registry defines them. One project closes every subject.
        </p>
      </header>

      <button
        type="button"
        onClick={() => navigate("#/dap")}
        className="group flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-viz-10/60 bg-viz-10/10 p-5 text-left dv-lift hover:border-viz-10 hover:bg-viz-10/15"
      >
        <span className="min-w-0">
          <span className="eyebrow text-viz-10">New · full engagements</span>
          <span className="mt-1 block font-serif text-lg font-semibold text-ink">
            The Data Analyst Project Academy
          </span>
          <span className="mt-1 block max-w-2xl text-[13px] leading-relaxed text-ink-2">
            36 end-to-end analytics projects across 12 industries — realistic datasets with seeded quality
            defects, guided or independent modes, GitHub/file submissions and instructor-grade evaluation on
            six dimensions.
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-viz-10 px-4 py-2 text-[13px] font-semibold text-ink-inverse shadow-e1 transition-transform group-hover:-translate-y-0.5">
          Open the academy <ArrowUpRight className="h-4 w-4" />
        </span>
      </button>

      <div className="flex flex-wrap gap-1.5">
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-medium capitalize transition-colors",
              tier === t ? "border-transparent bg-ink text-canvas" : "border-border-subtle bg-surface text-ink-2 hover:border-border-strong"
            )}
          >
            {t === "all" ? "all tiers" : t}
          </button>
        ))}
      </div>

      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map(({ project, subject }) => {
          const school = curriculum.registry.schools.find((s) => s.code === subject.school)!;
          return (
            <div
              key={`${subject.slug}-${project.title}`}
              className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 shadow-e1 dv-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", TIER_STYLE[project.tier])}>
                  {project.tier}
                </span>
                <span className="tabular text-[11.5px] text-ink-3">{project.hours} h · {subject.code}</span>
              </div>
              <p className="t-item mt-3.5 text-ink">{project.title}</p>
              <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink-3">{project.brief}</p>
              <p className="mt-3 truncate font-mono text-[11px] text-ink-3">{project.tools.join(" · ")}</p>
              <div className="mt-3.5 flex items-center justify-between border-t border-border-subtle pt-3">
                <span className="tabular flex items-center gap-1.5 text-[11.5px] text-ink-3">
                  <Wrench className="h-3.5 w-3.5" />
                  {project.deliverables.length} deliverables · {project.rubric.length} rubric criteria
                </span>
                <button
                  type="button"
                  onClick={() => navigate(subject.school === "J" ? "#/school/classical-ai" : `#/subject/${subject.slug}`)}
                  className="flex items-center gap-1 text-[12px] font-medium text-primary transition-colors hover:underline"
                >
                  <span style={{ color: school.color }}>{subject.code}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </Reveal>

      {projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle/50 p-8 text-center">
          <FolderGit2 className="mx-auto h-6 w-6 text-ink-3" />
          <p className="mt-2 text-[14px] font-medium text-ink">No projects in this tier yet</p>
        </div>
      )}
    </div>
  );
}
