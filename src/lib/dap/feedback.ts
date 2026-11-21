/**
 * The instructor feedback engine — deterministic, evidence-based review.
 *
 * Two stages:
 *   1. analyzeFiles(files) — static analysis of submitted code/notebooks
 *      (from uploads or GitHub fetch): pandas idioms, quality checks,
 *      cleaning ops, statistical tests, chart calls, structure signals.
 *   2. buildReview(input) — combines the code evidence, the learner's
 *      self-assessment on the six-dimension rubric, guided-mode progress
 *      and the project's own evaluation checks into an instructor-grade
 *      review: weighted score, band, per-dimension comments with
 *      evidence, strengths, development actions and one next step.
 *
 * Everything is deterministic (seeded by project + score) so the same
 * submission always yields the same review — an auditable instructor,
 * not a slot machine.
 */
import type { DapProject, RubricDimension } from "./types";
import { RUBRIC_META } from "./types";
import { seedFromString, makeRng } from "./rng";

/* ------------------------------------------------------------- file signals */

export interface SubmissionFile {
  name: string;
  ext: string;
  content: string;
}

export interface CodeSignals {
  filesAnalyzed: number;
  linesOfCode: number;
  hasNotebook: boolean;
  markdownHeaders: number;
  loadData: boolean;
  inspected: string[];
  qualityChecks: string[];
  cleaningOps: string[];
  transforms: string[];
  statTests: string[];
  chartCalls: number;
  chartKinds: string[];
  labelledCharts: number;
  legends: number;
  commentLines: number;
  functionDefs: number;
  todos: number;
  languages: string[];
}

const PY_INSPECT = ["head(", "info(", "describe(", "shape", "dtypes", "columns", "value_counts", "unique(", "sample("];
const PY_QUALITY = ["isna", "isnull", "duplicated", "drop_duplicates", "df.dtypes", "nunique", "value_counts", "filter", "between("];
/** Genuine regex patterns (matched as-is, not escaped). */
const PY_QUALITY_RE = [/\[.*<.*\]/m, /\[.*>.*\]/m];
const PY_CLEAN = ["dropna", "fillna", "replace(", "str.strip", "str.title", "str.lower", "str.upper", "drop_duplicates", "rename(", "astype(", "to_datetime", "to_numeric", "pd.cut", "qcut", "clip("];
const PY_TRANSFORM = ["groupby", "agg(", "pivot_table", "merge", "join(", "concat", "apply(", "transform(", "resample", "crosstab", "sort_values", "rank("];
const PY_STATS = ["corr(", "ttest", "chi2", "mannwhitney", "proportion_confint", "proportions_ztest", "ols(", "logit(", "glm(", "smf.", "statsmodels", "scipy.stats", "bootstrap", "np.percentile", "quantile", "std()", "median()", "mean()"];
const CHART_KINDS = ["plot(", "bar(", "barh", "hist(", "scatter(", "boxplot", "pie(", "heatmap", "violin", "lineplot", "countplot", "errorbar", "imshow"];

/** Escape a plain code snippet for literal regex matching. */
function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function analyzeFiles(files: SubmissionFile[]): CodeSignals {
  const signals: CodeSignals = {
    filesAnalyzed: 0,
    linesOfCode: 0,
    hasNotebook: false,
    markdownHeaders: 0,
    loadData: false,
    inspected: [],
    qualityChecks: [],
    cleaningOps: [],
    transforms: [],
    statTests: [],
    chartCalls: 0,
    chartKinds: [],
    labelledCharts: 0,
    legends: 0,
    commentLines: 0,
    functionDefs: 0,
    todos: 0,
    languages: [],
  };
  for (const f of files) {
    if (!f.content) continue;
    signals.filesAnalyzed++;
    signals.linesOfCode += f.content.split("\n").length;
    const isNb = f.ext === "ipynb";
    const isPy = f.ext === "py" || isNb;
    const isR = f.ext === "r";
    const isSql = f.ext === "sql";
    const isMd = f.ext === "md";
    signals.languages.push(isNb ? "jupyter" : isPy ? "python" : isR ? "r" : isSql ? "sql" : isMd ? "markdown" : f.ext);
    if (isNb) signals.hasNotebook = true;
    if (isPy) signals.loadData = signals.loadData || /read_csv|read_excel|read_sql|load\(/.test(f.content);
    if (isMd || isNb) signals.markdownHeaders += (f.content.match(/^#+\s/gm) ?? []).length;
    signals.commentLines += (f.content.match(/^\s*#\s/gm) ?? []).length;
    signals.functionDefs += (f.content.match(/^\s*def\s+\w+/gm) ?? []).length;
    signals.todos += (f.content.match(/\b(TODO|FIXME|XXX|pass\s*$)\b/gm) ?? []).length;
    if (isPy || isR || isSql) {
      const grab = (patterns: string[], bucket: string[]) => {
        for (const p of patterns) {
          const re = new RegExp(esc(p), "m");
          if (re.test(f.content) && !bucket.includes(p)) bucket.push(p);
        }
      };
      grab(PY_INSPECT, signals.inspected);
      grab(PY_QUALITY, signals.qualityChecks);
      for (const re of PY_QUALITY_RE) {
        const key = re.source;
        if (re.test(f.content) && !signals.qualityChecks.includes(key)) signals.qualityChecks.push(key);
      }
      grab(PY_CLEAN, signals.cleaningOps);
      grab(PY_TRANSFORM, signals.transforms);
      grab(PY_STATS, signals.statTests);
      for (const k of CHART_KINDS) {
        const re = new RegExp(esc(k), "gm");
        const matches = f.content.match(re);
        if (matches) {
          signals.chartCalls += matches.length;
          if (!signals.chartKinds.includes(k)) signals.chartKinds.push(k);
        }
      }
      signals.labelledCharts += (f.content.match(/set_title|set_xlabel|set_ylabel|\.title\(/g) ?? []).length;
      signals.legends += (f.content.match(/legend\(/g) ?? []).length;
    }
  }
  return signals;
}

/* ------------------------------------------------------------ review engine */

export interface ReviewInput {
  project: DapProject;
  githubUrl?: string;
  files: SubmissionFile[];
  notes: string;
  deliverablesDone: string[];
  selfScores: Record<RubricDimension, number>;
  guidedStepsDone: number;
  guidedStepsTotal: number;
  mode: "guided" | "independent";
}

export interface ReviewOutput {
  score: number;
  band: "distinction" | "merit" | "pass" | "developing";
  bandLabel: string;
  headline: string;
  summary: string[];
  dimensionComments: { dimension: RubricDimension; label: string; score: number; adjScore: number; comment: string; evidence: string[] }[];
  strengths: string[];
  developments: { area: string; action: string }[];
  nextStep: string;
  evidenceChips: string[];
  signals: CodeSignals;
}

const BAND_LABELS: Record<ReviewOutput["band"], string> = {
  distinction: "Distinction",
  merit: "Merit",
  pass: "Pass",
  developing: "Developing — resubmit with the actions below",
};

function bandFor(score: number): ReviewOutput["band"] {
  if (score >= 85) return "distinction";
  if (score >= 70) return "merit";
  if (score >= 55) return "pass";
  return "developing";
}

/** Adjust a self-score with file evidence (bounded ±0.5). */
function adjustScore(dim: RubricDimension, self: number, s: CodeSignals, hasFiles: boolean): number {
  let adj = self;
  if (!hasFiles) return adj;
  if (dim === "visualization") {
    if (s.chartCalls === 0) adj = Math.min(adj, 2);
    else if (s.chartCalls >= 4 && s.labelledCharts >= 3) adj = Math.max(adj, 4);
    else if (s.labelledCharts === 0) adj = Math.min(adj, 3);
  }
  if (dim === "correctness") {
    if (!s.loadData) adj = Math.min(adj, 3);
    if (s.qualityChecks.length >= 3 && s.cleaningOps.length >= 3) adj = Math.max(adj, 4);
  }
  if (dim === "reasoning") {
    if (s.statTests.length >= 2 && s.transforms.length >= 4) adj = Math.max(adj, 4);
  }
  if (dim === "code-quality") {
    if (s.commentLines >= 5 && s.functionDefs >= 1) adj = Math.max(adj, 4);
    if (s.todos >= 3) adj = Math.min(adj, 3);
  }
  return Math.max(1, Math.min(5, adj));
}

function evidenceFor(dim: RubricDimension, s: CodeSignals): string[] {
  const ev: string[] = [];
  if (s.filesAnalyzed) ev.push(`${s.filesAnalyzed} file(s) analysed · ${s.linesOfCode.toLocaleString()} lines`);
  if (dim === "correctness") {
    if (s.loadData) ev.push("data loaded in code");
    if (s.qualityChecks.length) ev.push(`quality checks: ${s.qualityChecks.slice(0, 4).join(", ")}`);
    if (s.cleaningOps.length) ev.push(`cleaning ops: ${s.cleaningOps.slice(0, 4).join(", ")}`);
  }
  if (dim === "reasoning") {
    if (s.transforms.length) ev.push(`transformations: ${s.transforms.slice(0, 4).join(", ")}`);
    if (s.statTests.length) ev.push(`statistics: ${s.statTests.slice(0, 4).join(", ")}`);
  }
  if (dim === "visualization") {
    if (s.chartCalls) ev.push(`${s.chartCalls} chart call(s) across ${s.chartKinds.length} chart types`);
    if (s.labelledCharts) ev.push(`${s.labelledCharts} title/axis label(s) set`);
    if (!s.chartCalls) ev.push("no chart calls detected in submitted files");
  }
  if (dim === "code-quality") {
    if (s.hasNotebook) ev.push("notebook structure present");
    if (s.markdownHeaders) ev.push(`${s.markdownHeaders} markdown heading(s)`);
    if (s.commentLines) ev.push(`${s.commentLines} comment line(s)`);
    if (s.functionDefs) ev.push(`${s.functionDefs} function definition(s)`);
  }
  return ev;
}

function dimensionComment(
  dim: RubricDimension,
  adj: number,
  project: DapProject,
  s: CodeSignals,
  hasFiles: boolean,
  hasNotes: boolean,
  pick: <T>(arr: T[]) => T
): string {
  const label = RUBRIC_META[dim].label;
  const checks = project.evaluationChecks[dim] ?? [];
  const check = checks.length ? pick(checks) : null;
  const strong = adj >= 4;
  const weak = adj <= 2;

  const openers: Record<RubricDimension, [string, string, string]> = {
    correctness: [
      "The numbers hang together well",
      "The arithmetic is broadly sound but worth tightening",
      "Correctness needs attention before this would pass review",
    ],
    "code-quality": [
      "The code reads like a colleague wrote it",
      "The code is serviceable but could be easier to follow",
      "The code needs a tidying pass before it's maintainable",
    ],
    reasoning: [
      "The analytical path is well chosen",
      "The reasoning is sound but under-argued in places",
      "The method choices need more justification",
    ],
    visualization: [
      "The visuals do real argumentative work",
      "The charts are competent but not yet carrying the story",
      "The visual set needs rebuilding around the questions",
    ],
    interpretation: [
      "The findings are read carefully and honestly",
      "The interpretation is reasonable but could go deeper",
      "The findings need stronger connection to the numbers",
    ],
    recommendations: [
      "The recommendations follow convincingly from the evidence",
      "The recommendations are sensible but under-evidenced",
      "The recommendations need to trace back to specific findings",
    ],
  };

  let comment = `${openers[dim][strong ? 0 : weak ? 2 : 1]}. `;
  if (check) {
    comment += strong
      ? `A reviewer would check: ${check.toLowerCase()} — make sure that's visible in the work.`
      : `The specific thing I'd probe: ${check.toLowerCase()}.`;
  }
  if (dim === "visualization" && hasFiles && s.chartCalls > 0 && s.labelledCharts === 0) {
    comment += " I found chart calls but no set_title/set_xlabel/set_ylabel — unlabelled charts are the most common review fail.";
  }
  if (dim === "correctness" && hasFiles && !s.loadData) {
    comment += " I couldn't find a read_csv/load step in the submitted files — attach the data-loading cell so the pipeline is verifiable end to end.";
  }
  if (dim === "reasoning" && hasFiles && s.statTests.length === 0 && project.statisticsPlan.length > 0) {
    comment += ` This project expects statistical work (${project.statisticsPlan[0].technique.toLowerCase()}); none detected in the files.`;
  }
  if (dim === "interpretation" && !hasNotes && !s.hasNotebook) {
    comment += " Add your written interpretation (notes or notebook markdown) — interpretation can't be reviewed from code alone.";
  }
  if (dim === "recommendations" && strong) {
    comment += " Keep tying every action to a named finding — that habit is what makes analysts trusted.";
  }
  return comment;
}

export function buildReview(input: ReviewInput): ReviewOutput {
  const { project, selfScores, files, notes } = input;
  const s = analyzeFiles(files);
  const hasFiles = s.filesAnalyzed > 0;
  const hasNotes = notes.trim().length > 40;
  const hasGithub = Boolean(input.githubUrl && input.githubUrl.length > 10);

  // Weighted score with evidence adjustment
  const dims = (Object.keys(RUBRIC_META) as RubricDimension[]).map((dim) => {
    const self = selfScores[dim] ?? 3;
    const adj = adjustScore(dim, self, s, hasFiles);
    return { dim, self, adj };
  });
  const weighted = dims.reduce((acc, d) => acc + adj0(d.adj) * RUBRIC_META[d.dim].weight, 0);
  const score = Math.round(weighted * 20 * 10) / 10; // to 100-scale
  const band = bandFor(score);

  // Deterministic variation seeded by project + score
  const rng = makeRng(seedFromString(`${project.id}:${score}:${input.mode}`));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng.next() * arr.length)];

  // Headline + summary
  const completion = input.guidedStepsTotal
    ? input.guidedStepsDone / input.guidedStepsTotal
    : 0;
  const modeNote =
    input.mode === "guided"
      ? `Guided mode, ${input.guidedStepsDone}/${input.guidedStepsTotal} steps completed`
      : "Independent mode — the full analysis was self-directed";
  const headlineVariants = [
    `${bandFor(score) === "distinction" ? "Excellent" : bandFor(score) === "merit" ? "Solid" : "Promising"} submission on ${project.code} — ${score.toFixed(1)}/100 (${BAND_LABELS[band]}).`,
    `${project.code} review: ${score.toFixed(1)}/100, ${BAND_LABELS[band].toLowerCase()}. ${modeNote}.`,
    `Instructor review of your ${project.title.toLowerCase()} work: ${score.toFixed(1)}/100 — ${BAND_LABELS[band].toLowerCase()}.`,
  ];
  const headline = pick(headlineVariants);

  const summary: string[] = [];
  summary.push(
    `${modeNote}${hasFiles ? `; ${s.filesAnalyzed} file${s.filesAnalyzed > 1 ? "s" : ""} analysed (${s.linesOfCode.toLocaleString()} lines)${hasGithub ? "; GitHub repository attached" : ""}${hasNotes ? "; written notes provided" : ""}.` : hasGithub ? "; GitHub link attached — I could not read the files from here, so attach uploads or paste key code for a deeper review." : "; no files or notes attached — the review rests on your self-assessment and guided progress."}`
  );
  if (hasFiles) {
    const good: string[] = [];
    if (s.qualityChecks.length >= 3) good.push("a genuine data-quality pass");
    if (s.cleaningOps.length >= 3) good.push("documented cleaning operations");
    if (s.chartCalls >= 4) good.push("a real chart set");
    if (s.statTests.length >= 2) good.push("statistical testing beyond descriptives");
    if (good.length) {
      summary.push(`What stands out from the code: ${good.join(", ")}. That is the ${project.difficulty === "beginner" ? "core of a good beginner submission" : "shape of professional work"}.`);
    } else {
      summary.push(`The code I can see is mostly loading and inspection — for this project I'd expect the quality pass, cleaning, aggregates and charts to be visible in the files themselves.`);
    }
  }
  if (input.mode === "guided" && completion > 0 && completion < 1) {
    summary.push(`You completed ${Math.round(completion * 100)}% of the guided steps — the later phases (interpretation, recommendations, report) are where the grades separate, so push through to the final report next time.`);
  }
  if (input.mode === "independent") {
    summary.push(`Independent mode is the harder path and the closer analogue of real work — hold yourself to the deliverables checklist when you self-review.`);
  }
  const bandSummary: Record<ReviewOutput["band"], string> = {
    distinction: "This is distinction-level work. The development actions below are about the last 10% — polish, not repair.",
    merit: "Merit-level work with clear strengths and specific gaps. The actions below are the difference between merit and distinction.",
    pass: "A pass: the core is there, but several dimensions need visible work before this would survive a stakeholder review.",
    developing: "Not yet passing — but the gaps are identifiable and fixable. Work through the actions below and resubmit; resubmission is expected and free.",
  };
  summary.push(bandSummary[band]);

  // Dimension comments
  const dimensionComments = dims.map(({ dim, adj }) => ({
    dimension: dim,
    label: RUBRIC_META[dim].label,
    score: selfScores[dim] ?? 3,
    adjScore: adj,
    comment: dimensionComment(dim, adj, project, s, hasFiles, hasNotes, pick),
    evidence: evidenceFor(dim, s),
  }));

  // Strengths: top adjusted dimensions
  const strengths = [...dimensionComments]
    .sort((a, b) => b.adjScore - a.adjScore)
    .slice(0, 2)
    .map((d) => `${d.label} (${d.adjScore}/5): ${d.comment.split(".")[0].toLowerCase()}.`);

  // Developments: bottom dimensions with project-specific actions
  const developments = [...dimensionComments]
    .sort((a, b) => a.adjScore - b.adjScore)
    .slice(0, 3)
    .map((d) => {
      const checks = project.evaluationChecks[d.dimension] ?? [];
      const action = checks.length
        ? `Review this in your submission: ${checks[0]}`
        : `Revisit the ${d.label.toLowerCase()} section of the project's guided steps and apply it to your submission.`;
      return { area: d.label, action };
    });

  // Evidence chips
  const evidenceChips: string[] = [];
  if (hasGithub) evidenceChips.push("GitHub link");
  if (s.filesAnalyzed) evidenceChips.push(`${s.filesAnalyzed} file${s.filesAnalyzed > 1 ? "s" : ""}`);
  if (s.hasNotebook) evidenceChips.push("notebook");
  if (s.chartCalls) evidenceChips.push(`${s.chartCalls} charts`);
  if (s.statTests.length) evidenceChips.push(`${s.statTests.length} stat methods`);
  if (s.qualityChecks.length) evidenceChips.push("quality checks");
  if (hasNotes) evidenceChips.push("written notes");

  // Next step
  const nextStepPool = [
    `Before resubmitting, fix the top development action (${developments[0]?.area}) and re-run your analysis end to end to confirm nothing broke.`,
    `Your single next move: ${developments[0]?.action}. Then attach the updated files and request a fresh review.`,
    `Pick the weakest dimension (${developments[0]?.area}), spend one focused hour on it, and resubmit — the review is free and the delta is usually large.`,
  ];

  return {
    score,
    band,
    bandLabel: BAND_LABELS[band],
    headline,
    summary,
    dimensionComments,
    strengths,
    developments,
    nextStep: pick(nextStepPool),
    evidenceChips,
    signals: s,
  };
}

function adj0(x: number): number {
  return Math.max(1, Math.min(5, x));
}
