/**
 * Classical AI course content model — the contract for "Classical
 * Artificial Intelligence: The Complete Course" (School J).
 *
 * Builds on the proven course content model (src/lib/course/types.ts) and
 * extends it with the specialized components a classical-AI textbook
 * needs. Sixteen of them, one per classical-AI idea:
 *
 *   1.  algorithm      — the algorithm explanation card (idea, strategy,
 *                        guarantees, when to use)
 *   2.  pseudocode     — annotated, indented pseudocode
 *   3.  pythonImpl     — an IDE-style implementation with verified output
 *   4.  complexity     — time & space complexity comparison tables
 *   5.  searchTree     — rendered search trees (frontier, expanded, goal)
 *   6.  stateSpace     — state-space diagrams (states, operators, costs)
 *   7.  propositions   — logical propositions with readings
 *   8.  truthTable     — truth tables with row highlighting and verdicts
 *   9.  predicateLogic — quantified formulas + unification worked pairs
 *   10. knowledgeGraph — typed entity-relation graphs
 *   11. constraintGraph— CSP networks: variables, domains, constraints
 *   12. decisionTree   — attribute-test trees with class leaves
 *   13. gameTree       — minimax trees with alpha-beta cuts
 *   14. inferenceChain — forward/backward rule-chaining diagrams
 *   15. bayesNet       — Bayesian networks with CPTs
 *   16. planningGraph  — Graphplan-style alternating levels with mutex
 *
 * Plus three textbook devices:
 *
 *   definition        — formal definitions (informal + formal statement)
 *   math              — display equations, derivations, probability
 *                        expressions and matrices, authored in a small
 *                        LaTeX-like mini-language parsed by
 *                        src/lib/classicalai/mathexpr.ts
 *   example           — worked examples (problem → steps → result)
 *   exercise          — embedded, interactive exercises
 *
 * Everything else (text, code, tryIt, visual, table, callout, steps) is
 * reused from the base model, so lessons keep the same teaching rhythm
 * as the rest of the academy.
 */
import type {
  Block,
  Course,
  Exercise,
  Lesson,
  LessonKind,
  MiniProject,
  MistakeEntry,
  Part,
  QuizOption,
  QuizQuestion,
  TermEntry,
} from "@/lib/course/types";

export type {
  Block,
  Course,
  Exercise,
  Lesson,
  LessonKind,
  MiniProject,
  MistakeEntry,
  Part,
  QuizOption,
  QuizQuestion,
  TermEntry,
};

// ---------------------------------------------------------------------------
// Shared geometry for graph-shaped diagrams
// ---------------------------------------------------------------------------

/**
 * A positioned node in a graph diagram. Coordinates are author-supplied
 * on a 0–100 grid (x right, y down); the renderer maps them onto the
 * viewBox. Authors choose coordinates that make the TOPOLOGY readable.
 */
export interface GraphNode {
  id: string;
  /** Short label rendered inside the node. */
  label: string;
  /** Optional secondary line (e.g. a domain or a CPT size). */
  sub?: string;
  x: number;
  y: number;
  /** Optional color role — the diagram families give this meaning. */
  tone?: "default" | "start" | "goal" | "highlight" | "muted" | "danger";
}

export interface GraphEdge {
  from: string;
  to: string;
  /** Edge label (an operator, a relation name, a cost). */
  label?: string;
  /** Drawn dashed — recommendations, soft edges, ignored branches. */
  dashed?: boolean;
  /** Rendered with the accent color — the path or propagation being shown. */
  highlighted?: boolean;
  /** Directed (default true for most families). */
  directed?: boolean;
}

/** A small directed/undirected labeled graph — the backbone of six of the
 *  sixteen specialized components. */
export interface GraphSpec {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Optional legend entries: [swatch class, label]. */
  legend?: Array<[string, string]>;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 1 · algorithm — the algorithm explanation card
// ---------------------------------------------------------------------------

export interface AlgorithmBlock {
  kind: "algorithm";
  /** The algorithm's canonical name, e.g. "A* Search". */
  name: string;
  /** Family it belongs to, e.g. "Informed search". */
  family: string;
  /** The problem it solves, one sentence. */
  problem: string;
  /** The core idea, one or two sentences, prose. */
  idea: string;
  /** The strategy as an ordered list of short moves (3–6). */
  strategy: string[];
  /** What is guaranteed (completeness, optimality...) and under what conditions. */
  guarantees: string[];
  /** When to reach for it — and when not to. */
  useWhen: string[];
  /** Named pitfalls, optional. */
  pitfalls?: string[];
}

// ---------------------------------------------------------------------------
// 2 · pseudocode — annotated, indented pseudocode
// ---------------------------------------------------------------------------

export interface PseudocodeLine {
  /** The pseudocode text; indent via `indent` (0-based), never spaces. */
  text: string;
  /** Indentation level, 0-based. */
  indent?: number;
  /** Optional margin annotation explaining THIS line. */
  note?: string;
  /** Tone used to emphasize the line (e.g. the pruning rule). */
  tone?: "default" | "key" | "muted";
}

export interface PseudocodeBlock {
  kind: "pseudocode";
  title: string;
  lines: PseudocodeLine[];
  /** One-line summary of the invariant or cost, shown as a footnote. */
  note?: string;
}

// ---------------------------------------------------------------------------
// 3 · pythonImpl — an IDE-style implementation with verified output
// ---------------------------------------------------------------------------

export interface PythonImplBlock {
  kind: "pythonImpl";
  /** Short label, e.g. "A* with a priority frontier". */
  title: string;
  /** What this implementation demonstrates, one sentence. */
  intent: string;
  /** The code. Must run standalone (imports included). */
  code: string;
  /** REAL output of running the code — machine-verified, never invented. */
  output?: string;
  /** If the example deliberately crashes: the exact final error line. */
  expectError?: string;
  /** Line-by-line (or idea-by-idea) walkthrough shown under the code. */
  walkthrough: string[];
  /** Where this shows up in the platform projects, optional. */
  project?: string;
}

// ---------------------------------------------------------------------------
// 4 · complexity — time & space comparison tables
// ---------------------------------------------------------------------------

export interface ComplexityRow {
  /** Algorithm name (table rows are algorithms). */
  algorithm: string;
  /** Big-O time by case. */
  best: string;
  average: string;
  worst: string;
  /** Big-O space. */
  space: string;
  /** One short note: the condition or the caveat that matters. */
  note?: string;
  /** Highlight this row (the algorithm the lesson is about). */
  highlight?: boolean;
}

export interface ComplexityBlock {
  kind: "complexity";
  title: string;
  rows: ComplexityRow[];
  /** The reading of the table: what to notice, 1–3 sentences. */
  reading?: string;
}

// ---------------------------------------------------------------------------
// 5 · searchTree — rendered search trees
// ---------------------------------------------------------------------------

export type TreeNodeStatus = "root" | "frontier" | "expanded" | "goal" | "pruned" | "muted";

export interface SearchTreeNode {
  id: string;
  /** State label, e.g. "Sibiu" or "B". */
  label: string;
  /** Path cost g so far, shown when the lesson tracks costs. */
  cost?: number;
  /** Heuristic value h, shown when the lesson tracks one. */
  heuristic?: number;
  status?: TreeNodeStatus;
  /** The edge label from the parent (an operator or a step cost). */
  edge?: string;
  children?: SearchTreeNode[];
}

export interface SearchTreeBlock {
  kind: "searchTree";
  title: string;
  /** The tree. The renderer lays it out by depth. */
  root: SearchTreeNode;
  /** What g / f / h mean here, one line, shown under the title. */
  legend?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 6 · stateSpace — state-space diagrams
// ---------------------------------------------------------------------------

export interface StateSpaceBlock {
  kind: "stateSpace";
  title: string;
  graph: GraphSpec;
  /** What counts as a solution in THIS space, one sentence. */
  solutionNote?: string;
}

// ---------------------------------------------------------------------------
// 7 · propositions — logical propositions with readings
// ---------------------------------------------------------------------------

export interface PropositionEntry {
  /** The formula, math mini-language (see mathexpr.ts). */
  formula: string;
  /** Its canonical name, e.g. "Modus ponens". */
  name?: string;
  /** Plain-English reading. */
  reading: string;
  /** Optional tone — laws and fallacies get highlighted. */
  tone?: "default" | "law" | "fallacy" | "definition";
}

export interface PropositionsBlock {
  kind: "propositions";
  title: string;
  entries: PropositionEntry[];
  caption?: string;
}

// ---------------------------------------------------------------------------
// 8 · truthTable — truth tables with highlighting and verdicts
// ---------------------------------------------------------------------------

export interface TruthTableBlock {
  kind: "truthTable";
  title: string;
  /** Column headers — each is a formula in the math mini-language. */
  columns: string[];
  /**
   * Rows of truth values, aligned with `columns`. Each cell is `true`,
   * `false`, or a marked value. The LAST column is conventionally the
   * compound proposition under study.
   */
  rows: Array<Array<boolean | { v: boolean; highlight?: boolean }>>;
  /** Verdict over the last column, when the lesson draws one. */
  verdict?: "tautology" | "contradiction" | "contingent" | "equivalent" | "satisfiable";
  /** What the verdict means, one sentence. */
  verdictNote?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 9 · predicateLogic — quantified formulas + unification
// ---------------------------------------------------------------------------

export interface UnificationPair {
  /** The two atoms, math mini-language. */
  lhs: string;
  rhs: string;
  /** The most general unifier, or "no unifier" (with the failing step). */
  result: string;
  /** Step-by-step derivation, one short line each. */
  steps?: string[];
}

export interface PredicateLogicBlock {
  kind: "predicateLogic";
  title: string;
  /** Quantified formulas with readings. */
  entries: PropositionEntry[];
  /** Optional unification walkthroughs. */
  unification?: UnificationPair[];
  caption?: string;
}

// ---------------------------------------------------------------------------
// 10 · knowledgeGraph — typed entity-relation graphs
// ---------------------------------------------------------------------------

export interface KnowledgeGraphBlock {
  kind: "knowledgeGraph";
  title: string;
  graph: GraphSpec;
  /** Example queries this graph answers, shown as a list. */
  queries?: string[];
  /** What the schema enforces — and what it does not. */
  schemaNote?: string;
}

// ---------------------------------------------------------------------------
// 11 · constraintGraph — CSP networks
// ---------------------------------------------------------------------------

export interface CspVariable {
  id: string;
  label: string;
  /** Remaining domain values at the moment being shown. */
  domain: string[];
  x: number;
  y: number;
  /** Node status — assignment state, wiped-out, current. */
  tone?: "default" | "assigned" | "current" | "wiped" | "highlight";
}

export interface ConstraintGraphBlock {
  kind: "constraintGraph";
  title: string;
  variables: CspVariable[];
  /** Binary constraints as edges between variable ids. */
  constraints: Array<{ a: string; b: string; label: string }>;
  /** n-ary constraints (all-different over a set of variables). */
  groups?: Array<{ label: string; vars: string[] }>;
  /** The propagation or assignment step this frame captures. */
  frameNote?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 12 · decisionTree — attribute-test trees with class leaves
// ---------------------------------------------------------------------------

export interface DecisionNode {
  /** Internal: the attribute test, e.g. "h(n) < 3?" or "windy?". */
  test?: string;
  /** Leaf: the predicted class / decided value. */
  class?: string;
  /** Optional per-node note (support, value). */
  note?: string;
  /** Children with their edge labels (test outcomes). */
  children?: Array<{ label: string; child: DecisionNode }>;
  /** Highlight the path being traced. */
  highlight?: boolean;
}

export interface DecisionTreeBlock {
  kind: "decisionTree";
  title: string;
  root: DecisionNode;
  /** The path being traced, as a sentence, optional. */
  trace?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 13 · gameTree — minimax trees with alpha-beta cuts
// ---------------------------------------------------------------------------

export type GameNodeKind = "max" | "min" | "leaf" | "chance";

export interface GameNode {
  id?: string;
  label?: string;
  kind: GameNodeKind;
  /** Backed-up or terminal value. */
  value?: number;
  /** Alpha/beta window annotations at this node. */
  alpha?: number;
  beta?: number;
  /** This subtree was pruned — rendered collapsed. */
  pruned?: boolean;
  /** This node produced a cut — emphasized. */
  cut?: boolean;
  children?: Array<{ edgeLabel?: string; child: GameNode }>;
}

export interface GameTreeBlock {
  kind: "gameTree";
  title: string;
  root: GameNode;
  /** Whether to draw the alpha/beta windows. */
  showWindows?: boolean;
  /** The move the trace recommends. */
  conclusion?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 14 · inferenceChain — forward/backward rule-chaining diagrams
// ---------------------------------------------------------------------------

export interface ChainRule {
  id: string;
  /** Rule number as shown to readers, e.g. "R2". */
  label: string;
  /** Conditions (facts or previously derived). */
  if: string[];
  /** The derived conclusion. */
  then: string;
}

export interface InferenceChainBlock {
  kind: "inferenceChain";
  title: string;
  direction: "forward" | "backward";
  /** Starting facts. */
  facts: string[];
  /** The rules, in firing order (forward) or goal order (backward). */
  rules: ChainRule[];
  /** Conclusions reached, in order. */
  derived: string[];
  /** The goal of a backward chain, if any. */
  goal?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// 15 · bayesNet — Bayesian networks with CPTs
// ---------------------------------------------------------------------------

export interface BayesNode {
  id: string;
  label: string;
  /** Parent ids — also defines the edges. */
  parents: string[];
  /** The states this variable takes, e.g. ["true", "false"]. */
  states: string[];
  x: number;
  y: number;
  /** Show the CPT for this node next to the graph. */
  showCpt?: boolean;
}

export interface BayesCptRow {
  /** The parent assignment, e.g. "B=t, E=f" — empty for roots. */
  given: string;
  /** Probabilities aligned with the node's `states`. */
  probs: number[];
}

export interface BayesNetBlock {
  kind: "bayesNet";
  title: string;
  nodes: BayesNode[];
  /** CPT rows per node id (only nodes with showCpt need rows). */
  cpts?: Record<string, BayesCptRow[]>;
  /** The query being posed, in words or math. */
  query?: string;
  /** The answer with its arithmetic, optional (worked queries). */
  answer?: string;
  /** Independence statements this DAG asserts. */
  independences?: string[];
  caption?: string;
}

// ---------------------------------------------------------------------------
// 16 · planningGraph — Graphplan-style levels with mutex
// ---------------------------------------------------------------------------

export interface PlanAction {
  name: string;
  /** Preconditions available at the previous proposition level. */
  pre: string[];
  /** Propositions added at the next proposition level. */
  add: string[];
  /** Marked mutex with another action by name, at this level. */
  mutexWith?: string[];
}

export interface PlanLevel {
  /** Propositions present at this level. */
  propositions: string[];
  actions: PlanAction[];
}

export interface PlanningGraphBlock {
  kind: "planningGraph";
  title: string;
  /** Levels: rendered as alternating proposition/action bands. */
  levels: PlanLevel[];
  /** Mutex proposition pairs per proposition level. */
  mutexProps?: Array<{ level: number; a: string; b: string; reason?: string }>;
  /** Whether the graph has leveled off at the last level. */
  leveledOff?: boolean;
  /** What the mutexes or level-off mean here. */
  reading?: string;
  caption?: string;
}

// ---------------------------------------------------------------------------
// Textbook devices: definition, math, example, exercise
// ---------------------------------------------------------------------------

export interface DefinitionBlock {
  kind: "definition";
  /** The term being defined. */
  term: string;
  /** The informal, intuitive statement. */
  informal: string;
  /** The formal statement — math mini-language. */
  formal: string;
  /** Where the formality matters, one sentence, optional. */
  why?: string;
}

export interface MathDisplay {
  /** The equation, math mini-language. */
  expr: string;
  /** Left-hand label, e.g. "(1)" or "Bayes' rule". */
  label?: string;
}

export interface MathDerivation {
  title: string;
  steps: Array<{ expr: string; reason?: string }>;
}

export interface MathBlock {
  kind: "math";
  title?: string;
  /** Display equations rendered as a centered stack. */
  displays?: MathDisplay[];
  /** A labeled derivation: each step with the reason it is licensed. */
  derivation?: MathDerivation;
  caption?: string;
}

export interface ExampleBlock {
  kind: "example";
  title: string;
  /** The problem statement. */
  problem: string;
  /** Worked steps: what was done and why. */
  steps: Array<{ text: string; detail?: string }>;
  /** The result, one line. */
  result: string;
}

export type ExerciseBlockKind =
  | "concept-check"
  | "predict-output"
  | "trace"
  | "write-code";

export interface ExerciseBlock {
  kind: "exercise";
  /** Unique within the lesson, e.g. "a-01-e1". */
  id: string;
  exerciseKind: ExerciseBlockKind;
  prompt: string;
  /** concept-check: 3–4 options, exactly one correct. */
  options?: QuizOption[];
  /** predict-output: the expected stdout (auto-graded in-browser). */
  expectedOutput?: string;
  /** write-code: starter placed in the editor. */
  starter?: string;
  /** The worked solution — revealed after an attempt. */
  solution: string;
  /** Why the answer is what it is. */
  explanation: string;
  /** Concepts practiced, shown as badges. */
  concepts: string[];
}

// ---------------------------------------------------------------------------
// The block union + course shapes
// ---------------------------------------------------------------------------

export type ClassicalBlock =
  | Block
  | AlgorithmBlock
  | PseudocodeBlock
  | PythonImplBlock
  | ComplexityBlock
  | SearchTreeBlock
  | StateSpaceBlock
  | PropositionsBlock
  | TruthTableBlock
  | PredicateLogicBlock
  | KnowledgeGraphBlock
  | ConstraintGraphBlock
  | DecisionTreeBlock
  | GameTreeBlock
  | InferenceChainBlock
  | BayesNetBlock
  | PlanningGraphBlock
  | DefinitionBlock
  | MathBlock
  | ExampleBlock
  | ExerciseBlock;

export interface ClassicalLesson extends Omit<Lesson, "blocks"> {
  blocks: ClassicalBlock[];
}

export interface ClassicalChapter {
  title: string;
  focus: string;
  lessons: ClassicalLesson[];
}

export interface ClassicalModule {
  title: string;
  summary: string;
  chapters: ClassicalChapter[];
}

export interface ClassicalPart extends Omit<Part, "lessons" | "project"> {
  /** The registry subject this part stands in for, e.g. "search-problem-solving". */
  subjectSlug: string;
  /** Modules mirror the registry subject's modules 1:1. */
  modules: ClassicalModule[];
  /** Tiered practice battery for the whole part. */
  exercises: Exercise[];
  /** The part checkpoint (module checkpoints + final material). */
  assessment: QuizQuestion[];
  project: MiniProject;
}

export interface ClassicalCourse extends Omit<Course, "parts"> {
  parts: ClassicalPart[];
}

// ---------------------------------------------------------------------------
// Location helpers — the reader's navigation backbone
// ---------------------------------------------------------------------------

/** Where a lesson sits in the course's four-level hierarchy. */
export interface ClassicalLessonRef {
  part: ClassicalPart;
  module: ClassicalModule;
  chapter: ClassicalChapter;
  lesson: ClassicalLesson;
  index: number;
}

export function allClassicalLessons(course: ClassicalCourse): ClassicalLessonRef[] {
  const out: ClassicalLessonRef[] = [];
  for (const part of course.parts) {
    for (const mod of part.modules) {
      for (const ch of mod.chapters) {
        for (const lesson of ch.lessons) {
          out.push({ part, module: mod, chapter: ch, lesson, index: out.length });
        }
      }
    }
  }
  return out;
}

export function findClassicalLesson(course: ClassicalCourse, slug: string): ClassicalLessonRef | null {
  for (const part of course.parts) {
    for (const mod of part.modules) {
      for (const ch of mod.chapters) {
        const lesson = ch.lessons.find((l) => l.slug === slug);
        if (lesson) {
          return {
            part,
            module: mod,
            chapter: ch,
            lesson,
            index: allClassicalLessons(course).findIndex((r) => r.lesson.slug === slug),
          };
        }
      }
    }
  }
  return null;
}

export function neighborClassicalLesson(
  course: ClassicalCourse,
  slug: string,
  dir: 1 | -1
): ClassicalLessonRef | null {
  const flat = allClassicalLessons(course);
  const at = flat.findIndex((l) => l.lesson.slug === slug);
  if (at === -1) return null;
  return flat[at + dir] ?? null;
}

export function totalClassicalMinutes(course: ClassicalCourse): number {
  return allClassicalLessons(course).reduce((sum, l) => sum + l.lesson.minutes, 0);
}

export function countClassicalLessons(course: ClassicalCourse): number {
  return allClassicalLessons(course).length;
}

export function countClassicalExercises(course: ClassicalCourse): number {
  return course.parts.reduce((sum, p) => sum + p.exercises.length, 0);
}

export function countClassicalQuizQuestions(course: ClassicalCourse): number {
  const inLesson = allClassicalLessons(course).reduce((n, l) => n + l.lesson.quiz.length, 0);
  const inParts = course.parts.reduce((n, p) => n + p.assessment.length, 0);
  return inLesson + inParts;
}

const BASE_KINDS = new Set(["text", "heading", "code", "tryIt", "visual", "table", "callout", "steps"]);

/** Count of specialized classical-AI components in the course, by kind. */
export function countClassicalComponents(course: ClassicalCourse): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ref of allClassicalLessons(course)) {
    for (const block of ref.lesson.blocks) {
      if (BASE_KINDS.has(block.kind)) continue;
      counts[block.kind] = (counts[block.kind] ?? 0) + 1;
    }
  }
  return counts;
}
