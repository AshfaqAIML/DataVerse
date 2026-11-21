"use client";

/**
 * DAPHome — the Data Analyst Project Academy's front door: the pitch,
 * how the two modes work, the evaluation promise, and the full catalog
 * with search, category and difficulty filters.
 */
import { useMemo, useState } from "react";
import { ArrowRight, Clock, FlaskConical, GraduationCap, Search, Target } from "lucide-react";
import { DAP_REGISTRY, DAP_STATS } from "@/content/dap";
import { DIFFICULTIES, type Difficulty } from "@/lib/dap/types";
import { CategoryIcon, Chip, DifficultyBadge } from "./bits";
import { countStepsDone, useDapProgress } from "@/lib/dap/progress";
import { cn } from "@/lib/utils";

const DIFF_FILTERS: Array<{ id: Difficulty | "all"; label: string }> = [
  { id: "all", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export function DapHome({ navigate }: { navigate: (hash: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const { stepsDone, submissions, modes } = useDapProgress();

  const started = useMemo(() => {
    const ids = new Set<string>([
      ...Object.keys(modes),
      ...Object.keys(stepsDone).map((k) => k.split(":")[0]),
    ]);
    for (const list of Object.values(submissions)) {
      for (const sub of list) ids.add(sub.projectId);
    }
    return ids;
  }, [stepsDone, submissions, modes]);

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAP_REGISTRY.projects.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (q) {
        const hay = `${p.code} ${p.title} ${p.subtitle} ${p.summary} ${p.tools.join(" ")} ${p.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, category, difficulty]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      {/* ------------------------------------------------------------- hero */}
      <header className="mb-12">
        <p className="eyebrow">DataVerse Academy · The Project Academy</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          The Data Analyst Project Academy
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ink-2">
          Thirty-six full analytics engagements across twelve industries — from a grocery store&apos;s
          till data to portfolio risk, pay equity and growth accounting. Every project is a complete
          engagement: business background, problem statement, a realistic dataset with seeded quality
          defects, guided steps or independent work, and an instructor-grade evaluation on six
          dimensions. Build the portfolio; earn the feedback.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-ink-3">
          <span>{DAP_STATS.projects} projects · {DAP_STATS.categories} categories</span>
          <span>{DAP_STATS.beginner} beginner · {DAP_STATS.intermediate} intermediate · {DAP_STATS.advanced} advanced</span>
          <span>~{DAP_STATS.hours} hours of analysis · {DAP_STATS.guidedSteps} guided steps</span>
        </div>
      </header>

      {/* ------------------------------------------------------ how it works */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-card p-5">
          <GraduationCap className="h-5 w-5 text-viz-10" />
          <h2 className="mt-2 font-serif text-lg font-semibold text-ink">Guided mode</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            Step-by-step instructions through the full analysis — quality audit, cleaning, EDA,
            statistics, charts, findings, recommendations and report — with three-level
            progressive hints per step: a nudge, an approach, and a worked sketch.
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-5">
          <FlaskConical className="h-5 w-5 text-gold-600" />
          <h2 className="mt-2 font-serif text-lg font-semibold text-ink">Independent mode</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            The business problem and the dataset — nothing else. You make every methodological
            choice, deliver against a checklist, and hold yourself to the guardrails a real
            stakeholder would set. This is the portfolio piece.
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-5">
          <Target className="h-5 w-5 text-viz-4" />
          <h2 className="mt-2 font-serif text-lg font-semibold text-ink">Instructor evaluation</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            Submit a GitHub link or your project files. The six-dimension rubric — correctness,
            code quality, reasoning, visualization, interpretation, recommendations — meets an
            evidence-based review of your actual code: strengths, gaps, actions, and a next step.
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------- catalogue */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">The catalogue</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Choose your engagement</h2>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium text-ink-3">
          <span>{started.size > 0 ? `${started.size} project${started.size > 1 ? "s" : ""} started` : "No projects started yet"}</span>
        </div>
      </div>

      {/* filters */}
      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tools, skills…"
            aria-label="Search projects"
            className="h-10 w-full rounded-lg border border-border-subtle bg-card pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filter">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All categories
          </FilterChip>
          {DAP_REGISTRY.categories.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Difficulty filter">
          {DIFF_FILTERS.map((f) => (
            <FilterChip key={f.id} active={difficulty === f.id} onClick={() => setDifficulty(f.id)} subtle>
              {f.label}
            </FilterChip>
          ))}
          {DIFFICULTIES.filter((d) => difficulty === "all" || d === difficulty).length === 0 ? null : (
            <span className="ml-1 self-center text-[12px] text-ink-3">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {/* project cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const cat = DAP_REGISTRY.categories.find((c) => c.id === p.categoryId)!;
          const steps = countStepsDone(stepsDone, p.id);
          const subs = submissions[p.id]?.length ?? 0;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`#/dap/project/${p.id}`)}
              className="group dv-card-hover flex flex-col rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 hover:border-viz-10/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle", cat.accent)}>
                    <CategoryIcon name={cat.icon} className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] font-bold tracking-wide text-ink-3">{p.code} · {cat.name}</p>
                    <h3 className="font-serif text-[17px] font-semibold leading-snug text-ink group-hover:text-viz-10">
                      {p.title}
                    </h3>
                  </div>
                </div>
                <DifficultyBadge level={p.difficulty} />
              </div>
              <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">{p.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip><Clock className="mr-1 h-3 w-3" />~{p.hours}h</Chip>
                {p.tools.slice(0, 3).map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div className="mt-4 flex items-start justify-between gap-3 border-t border-border-subtle pt-3">
                <span className="min-w-0 text-[12px] font-medium text-ink-3">
                  {steps > 0 || subs > 0 ? (
                    <span className="text-viz-10">
                      {subs > 0 ? `${subs} submission${subs > 1 ? "s" : ""} reviewed` : `${steps}/${p.guidedSteps.length} steps done`}
                    </span>
                  ) : (
                    `${p.dataset.rows.toLocaleString()} rows · ${p.dataDictionary.length} columns`
                  )}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-viz-10">
                  Open project <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong p-10 text-center">
          <p className="text-sm font-medium text-ink-2">No projects match those filters.</p>
          <button
            onClick={() => { setQuery(""); setCategory("all"); setDifficulty("all"); }}
            className="mt-2 text-sm font-semibold text-viz-10 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
        active
          ? "border-viz-10 bg-viz-10 text-ink-inverse"
          : subtle
            ? "border-border-subtle bg-surface text-ink-2 hover:border-viz-10/60 hover:text-viz-10"
            : "border-border-subtle bg-surface text-ink-2 hover:border-viz-10/60 hover:text-viz-10"
      )}
    >
      {children}
    </button>
  );
}
