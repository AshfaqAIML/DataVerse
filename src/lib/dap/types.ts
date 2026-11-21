/**
 * Data Analyst Project Academy — type system (School of Applied Analytics).
 *
 * The pedagogical spine: every project is a complete, realistic analytics
 * engagement. The brief always exposes the six framing sections (business
 * background, problem statement, objectives, dataset description, data
 * dictionary, initial questions); the analyst's work covers the remaining
 * nine (data quality → final report) in either Guided mode (step-by-step
 * instructions with progressive hints) or Independent mode (brief + dataset
 * only). Evaluation runs on the six-dimension instructor rubric and the
 * deterministic feedback engine (src/lib/dap/feedback.ts).
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

export interface DapCategory {
  id: string;
  /** Short code used in project codes, e.g. "RET". */
  code: string;
  name: string;
  blurb: string;
  /** lucide-react icon name (resolved in the UI registry). */
  icon: string;
  /** Tailwind text colour class for the category accent. */
  accent: string;
}

/* -------------------------------------------------------------- data model */

export type ColumnKind =
  | "id"
  | "text"
  | "categorical"
  | "integer"
  | "decimal"
  | "currency"
  | "percent"
  | "date"
  | "datetime"
  | "boolean";

export interface DataDictionaryEntry {
  column: string;
  kind: ColumnKind;
  description: string;
  example: string;
}

/** A seeded data-quality defect the generator injects (and the analyst must find). */
export interface QualityIssue {
  /** What is wrong. */
  issue: string;
  /** Which columns / how many rows are affected. */
  where: string;
  /** How a careful analyst detects it (the pandas idiom). */
  detection: string;
  /** The recommended treatment and why. */
  treatment: string;
}

export interface CleaningAction {
  action: string;
  rationale: string;
}

export interface EdaMove {
  question: string;
  method: string;
  expectation: string;
}

export interface StatMove {
  technique: string;
  purpose: string;
  expectation: string;
}

export interface VizMove {
  chart: string;
  answers: string;
  reads: string;
}

export interface Recommendation {
  what: string;
  why: string;
  impact: string;
  horizon: "immediate" | "this quarter" | "longer term";
}

/* ------------------------------------------------------------ guided mode */

export type GuidedPhase =
  | "understand"
  | "quality"
  | "cleaning"
  | "eda"
  | "statistics"
  | "visualisation"
  | "interpretation"
  | "recommendations"
  | "report";

export const PHASE_LABELS: Record<GuidedPhase, string> = {
  understand: "Understand",
  quality: "Data quality",
  cleaning: "Cleaning",
  eda: "Exploration",
  statistics: "Statistics",
  visualisation: "Visualisation",
  interpretation: "Interpretation",
  recommendations: "Recommendations",
  report: "Report",
};

export interface GuidedStep {
  phase: GuidedPhase;
  title: string;
  goal: string;
  /** 1–3 short paragraphs of instruction. */
  instructions: string[];
  /**
   * Progressive hints, revealed one at a time:
   * [0] a nudge (conceptual direction), [1] the approach (specific method),
   * [2] a worked sketch (near-solution outline).
   */
  hints: [string, string, string];
  /** What should be true when the step is done. */
  checkpoint: string;
  /** Optional reference snippet (pandas / SQL / DAX …). */
  code?: { label: string; language: string; source: string };
}

/* -------------------------------------------------------------- evaluation */

export type RubricDimension =
  | "correctness"
  | "code-quality"
  | "reasoning"
  | "visualization"
  | "interpretation"
  | "recommendations";

export const RUBRIC_DIMENSIONS: RubricDimension[] = [
  "correctness",
  "code-quality",
  "reasoning",
  "visualization",
  "interpretation",
  "recommendations",
];

export const RUBRIC_META: Record<
  RubricDimension,
  { label: string; weight: number; blurb: string }
> = {
  correctness: { label: "Correctness", weight: 0.22, blurb: "Numbers, joins and calculations are right and reproducible." },
  "code-quality": { label: "Code quality", weight: 0.12, blurb: "Clean, readable, documented, idiomatically structured work." },
  reasoning: { label: "Analytical reasoning", weight: 0.18, blurb: "Method choices are justified; the path from question to answer is sound." },
  visualization: { label: "Visualization quality", weight: 0.16, blurb: "The right chart for the question, labelled, titled and honest." },
  interpretation: { label: "Interpretation", weight: 0.18, blurb: "Findings are read correctly, with uncertainty acknowledged." },
  recommendations: { label: "Business recommendations", weight: 0.14, blurb: "Actions follow from evidence and name owners, costs and impact." },
};

/** Project-specific checks the evaluator looks for, per rubric dimension. */
export type EvaluationChecks = Partial<Record<RubricDimension, string[]>>;

/* ------------------------------------------------------------- the project */

export interface DatasetMeta {
  name: string;
  filename: string;
  description: string;
  rows: number;
}

export interface IndependentBrief {
  scenario: string;
  deliverables: string[];
  guardrails: string[];
}

export interface DapProject {
  id: string;
  categoryId: string;
  difficulty: Difficulty;
  /** Human project code, e.g. "RET-01". */
  code: string;
  title: string;
  subtitle: string;
  summary: string;
  hours: number;
  tools: string[];
  skills: string[];

  /* --- the six framing sections (always learner-visible) --- */
  businessBackground: string;
  problemStatement: string;
  businessObjectives: string[];
  datasetDescription: string;
  dataDictionary: DataDictionaryEntry[];
  initialQuestions: string[];

  dataset: DatasetMeta;

  /* --- the instructor reference (the model answer) --- */
  dataQuality: QualityIssue[];
  cleaningPlan: CleaningAction[];
  edaPlan: EdaMove[];
  statisticsPlan: StatMove[];
  visualisationPlan: VizMove[];
  findings: string[];
  recommendations: Recommendation[];
  finalReport: { executiveSummary: string; structure: string[] };

  /* --- modes --- */
  guidedSteps: GuidedStep[];
  independentBrief: IndependentBrief;

  /* --- evaluation --- */
  evaluationChecks: EvaluationChecks;
}

/* --------------------------------------------------------------- registry */

export interface DapRegistry {
  categories: DapCategory[];
  projects: DapProject[];
}

export function projectsByCategory(registry: DapRegistry, categoryId: string): DapProject[] {
  return registry.projects.filter((p) => p.categoryId === categoryId);
}

export function findProject(registry: DapRegistry, id: string): DapProject | undefined {
  return registry.projects.find((p) => p.id === id);
}
