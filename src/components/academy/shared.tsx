"use client";

/**
 * Shared academy UI helpers — icons, status computation and badges.
 */
import { BarChart3, Boxes, Brain, Briefcase, ChartLine, Code2, Lock, Network, Sigma, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CurriculumEngine } from "@/lib/curriculum/engine";
import type { StudentState } from "@/lib/curriculum/types";

export function SchoolIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "sigma":
      return <Sigma className={className} />;
    case "bar-chart":
      return <BarChart3 className={className} />;
    case "table":
      return <Table2 className={className} />;
    case "boxes":
      return <Boxes className={className} />;
    case "brain":
      return <Brain className={className} />;
    case "network":
      return <Network className={className} />;
    case "chart-line":
      return <ChartLine className={className} />;
    case "briefcase":
      return <Briefcase className={className} />;
    case "code":
    default:
      return <Code2 className={className} />;
  }
}

export type SubjectStatus = "mastered" | "waived" | "in-progress" | "ready" | "locked";

/** Single source of subject-status truth for every academy view. */
export function subjectStatus(engine: CurriculumEngine, state: StudentState, slug: string): SubjectStatus {
  if (engine.isWaived(state, slug)) return "waived";
  if (engine.isMastered(state, slug)) return "mastered";
  if (engine.isStarted(state, slug)) return "in-progress";
  if (engine.isReadyToStart(state, slug)) return "ready";
  return "locked";
}

const STATUS_STYLE: Record<SubjectStatus, string> = {
  mastered: "bg-success-bg text-success-text",
  waived: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  ready: "bg-warning-bg text-warning-text",
  locked: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<SubjectStatus, string> = {
  mastered: "Mastered",
  waived: "Waived",
  "in-progress": "In progress",
  ready: "Ready to start",
  locked: "Locked",
};

export function StatusBadge({ status }: { status: SubjectStatus }) {
  return (
    <Badge variant="secondary" className={`gap-1 border-transparent ${STATUS_STYLE[status]}`}>
      {status === "locked" && <Lock className="h-3 w-3" />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/** 4.5 -> "4.5 h", 40 -> "40 h" */
export function formatHours(h: number): string {
  const rounded = Math.round(h * 2) / 2;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} h`;
}

export const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: "bg-success-bg text-success-text",
  intermediate: "bg-warning-bg text-warning-text",
  advanced: "bg-danger-bg text-danger-text",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge variant="secondary" className={`border-transparent capitalize ${DIFFICULTY_STYLE[difficulty] ?? ""}`}>
      {difficulty}
    </Badge>
  );
}
