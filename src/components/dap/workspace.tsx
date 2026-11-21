"use client";

/**
 * DAPWorkspace — a single project's workspace: header, mode tabs and
 * the six views (brief, dataset, guided, independent, evaluation,
 * instructor reference).
 */
import { useMemo, useState } from "react";
import { ArrowLeft, ClipboardCheck, Database, FileText, GraduationCap, FlaskConical } from "lucide-react";
import type { DapProject } from "@/lib/dap/types";
import { DAP_REGISTRY } from "@/content/dap";
import { CategoryIcon, Chip, DifficultyBadge } from "./bits";
import { DapBrief } from "./brief";
import { DatasetPanel } from "./dataset-panel";
import { GuidedView } from "./guided";
import { IndependentView } from "./independent";
import { EvaluationView } from "./evaluation";
import { SolutionView } from "./solution";
import { useDapProgress } from "@/lib/dap/progress";
import { cn } from "@/lib/utils";

type TabId = "brief" | "dataset" | "guided" | "independent" | "evaluation" | "reference";

const TABS: Array<{ id: TabId; label: string; icon: typeof FileText }> = [
  { id: "brief", label: "Project brief", icon: FileText },
  { id: "dataset", label: "Dataset", icon: Database },
  { id: "guided", label: "Guided mode", icon: GraduationCap },
  { id: "independent", label: "Independent mode", icon: FlaskConical },
  { id: "evaluation", label: "Evaluation", icon: ClipboardCheck },
  { id: "reference", label: "Instructor reference", icon: FileText },
];

export function DapWorkspace({ projectId, navigate }: { projectId: string; navigate: (hash: string) => void }) {
  const [tab, setTab] = useState<TabId>("brief");
  const project = useMemo(() => DAP_REGISTRY.projects.find((p) => p.id === projectId), [projectId]);
  const { modes, setMode } = useDapProgress();

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-foreground">Project not found: {projectId}</p>
        <button onClick={() => navigate("#/dap")} className="mt-3 text-sm font-semibold text-viz-10 hover:underline">
          ← Back to the Project Academy
        </button>
      </div>
    );
  }

  const cat = DAP_REGISTRY.categories.find((c) => c.id === project.categoryId)!;
  const mode = modes[project.id] ?? "guided";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* ------------------------------------------------------------ header */}
      <button
        onClick={() => navigate("#/dap")}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-3 transition-colors hover:text-viz-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Project Academy
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={cn("mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-subtle", cat.accent)}>
            <CategoryIcon name={cat.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-bold tracking-wide text-ink-3">
              {project.code} · {cat.name}
            </p>
            <h1 className="mt-0.5 font-serif text-3xl font-semibold leading-tight text-ink">
              {project.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">{project.subtitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge level={project.difficulty} />
              <Chip>~{project.hours} hours</Chip>
              {project.tools.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- mode picker */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === "guided"}
          onClick={() => { setMode(project.id, "guided"); setTab("guided"); }}
          title="Guided mode"
          desc={`${project.guidedSteps.length} steps · three-level progressive hints · reference snippets`}
        />
        <ModeCard
          active={mode === "independent"}
          onClick={() => { setMode(project.id, "independent"); setTab("independent"); }}
          title="Independent mode"
          desc="The brief and the dataset — you make every methodological choice"
        />
      </div>

      {/* --------------------------------------------------------------- tabs */}
      <div role="tablist" aria-label="Project views" className="mt-8 flex flex-wrap gap-1 border-b border-border-subtle">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
                tab === t.id
                  ? "text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-viz-10"
                  : "text-ink-3 hover:bg-accent hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div key={tab} className="dv-fade-up mt-6" role="tabpanel">
        {tab === "brief" && <DapBrief project={project} />}
        {tab === "dataset" && <DatasetPanel project={project} />}
        {tab === "guided" && <GuidedView project={project} />}
        {tab === "independent" && <IndependentView project={project} onEvaluate={() => setTab("evaluation")} />}
        {tab === "evaluation" && <EvaluationView project={project} />}
        {tab === "reference" && <SolutionView project={project} />}
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl border p-4 text-left dv-lift",
        active
          ? "border-viz-10 bg-viz-10/10 shadow-e1"
          : "border-border-subtle bg-card hover:border-viz-10/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("font-serif text-[15px] font-semibold", active ? "text-viz-10" : "text-ink")}>{title}</span>
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border",
            active ? "border-viz-10 bg-viz-10" : "border-border-strong bg-surface"
          )}
          aria-hidden="true"
        >
          {active ? <span className="h-1.5 w-1.5 rounded-full bg-ink-inverse" /> : null}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{desc}</p>
    </button>
  );
}
