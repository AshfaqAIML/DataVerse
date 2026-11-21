/**
 * Data Visualization course — type system (School H).
 *
 * The pedagogical spine: every chart a learner meets is a real ChartSpec
 * rendered live by the shared SVG engine (src/components/dataviz/
 * charts.tsx) — the same engine the Chart Playground configures. Lessons
 * pair rendered charts with the tool syntax that would produce them
 * (code blocks are illustrative; charts are real), and interpretation
 * exercises ask what a chart COMMUNICATES, not just how it was made.
 */

/* ------------------------------------------------------------------ charts */

export type ChartType =
  | "bar"
  | "grouped-bar"
  | "stacked-bar"
  | "line"
  | "area"
  | "scatter"
  | "histogram"
  | "pie"
  | "box"
  | "heatmap";

export type PaletteName =
  | "categorical"
  | "okabe-ito"
  | "set2"
  | "warm"
  | "cool"
  | "greens"
  | "oranges"
  | "traffic"
  | "earth";

export interface ChartSeries {
  name: string;
  values: number[];
  /** Optional explicit color; otherwise palette by series index. */
  color?: string;
}

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

export interface BoxStat {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

export interface HeatMatrix {
  rowLabels: string[];
  colLabels: string[];
  cells: number[][];
}

export interface ChartSpec {
  type: ChartType;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Prose beneath the chart — what to notice. */
  caption?: string;
  /** Category labels for bar / line / area / pie / box families. */
  categories?: string[];
  /** Series (bar families, line, area). One series = single set. */
  series?: ChartSeries[];
  /** Scatter points (with optional per-point labels). */
  points?: ScatterPoint[];
  /** Raw sample for histogram. */
  values?: number[];
  /** Histogram bin count (default 10). */
  bins?: number;
  /** Pre-computed box statistics. */
  boxes?: BoxStat[];
  /** Heatmap matrix. */
  matrix?: HeatMatrix;
  palette?: PaletteName;
  showLegend?: boolean;
  /** Bar value labels. */
  showValues?: boolean;
  /**
   * y-axis starts at zero (default true). Setting false renders the
   * truncated axis — used honestly to demo the misleading-axis failure.
   */
  yFromZero?: boolean;
  /** Sort categories by value, descending (bar family). */
  sortDesc?: boolean;
  /** Fixed pixel height hint for the renderer. */
  height?: number;
}

/* ------------------------------------------------------------------ blocks */

export interface QuizOption {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface QuizItem {
  id: string;
  prompt: string;
  options: QuizOption[];
  explanation: string;
}

export type DataVizBlock =
  | { kind: "text"; text: string }
  | { kind: "heading"; text: string }
  | {
      kind: "chart";
      chart: ChartSpec;
      /** Why this design decision — the encoding rationale. */
      why?: string;
    }
  | {
      kind: "code";
      title: string;
      /** Tool syntax (matplotlib / seaborn / plotly / DAX …). */
      code: string;
      language?: "python" | "dax" | "text";
      /** What the reader should notice in the listing. */
      note?: string;
      /** What the code produces, in one honest sentence. */
      produces?: string;
    }
  | {
      kind: "definition";
      term: string;
      informal: string;
      why?: string;
    }
  | {
      kind: "callout";
      tone: "info" | "warning" | "success";
      title: string;
      text: string;
    }
  | {
      kind: "table";
      title: string;
      headers: string[];
      rows: string[][];
      caption?: string;
    }
  | {
      /** THE interpretation exercise: a real rendered chart + what does it say. */
      kind: "interpretation";
      id: string;
      chart: ChartSpec;
      prompt: string;
      options: QuizOption[];
      explanation: string;
    }
  | {
      kind: "exercise";
      id: string;
      exerciseKind: "concept-check" | "choose-chart" | "critique";
      prompt: string;
      /** Optional chart the exercise is about (critique items). */
      chart?: ChartSpec;
      options: QuizOption[];
      hint?: string;
      explanation: string;
    };

/* ----------------------------------------------------------------- lessons */

export interface DataVizLesson {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  /** The tool this lesson teaches, if any. */
  tool?: "matplotlib" | "seaborn" | "plotly" | "power-bi" | "tableau" | null;
  objectives: string[];
  why: string;
  blocks: DataVizBlock[];
  terms?: { term: string; definition: string }[];
  takeaways: string[];
  quiz: QuizItem[];
}

export interface DataVizChapter {
  title: string;
  focus: string;
  lessons: DataVizLesson[];
}

export interface DataVizModule {
  title: string;
  summary: string;
  chapters: DataVizChapter[];
}

/* ------------------------------------------------------------------- parts */

export interface DataVizPart {
  letter: string;
  /** Registry subjects this part advances (School H slugs). */
  subjectSlugs: string[];
  title: string;
  tagline: string;
  description: string;
  modules: DataVizModule[];
  exercises: import("../course/types").Exercise[];
  assessment: import("../course/types").QuizQuestion[];
  project: import("../course/types").MiniProject;
}

export interface DataVizCourse {
  slug: "data-visualization";
  title: string;
  tagline: string;
  description: string;
  parts: DataVizPart[];
}

/* ----------------------------------------------------------- course helpers */

export interface DataVizLessonRef {
  partLetter: string;
  partTitle: string;
  moduleTitle: string;
  chapterTitle: string;
  lesson: DataVizLesson;
}

export function allDataVizLessons(course: DataVizCourse): DataVizLessonRef[] {
  const out: DataVizLessonRef[] = [];
  for (const part of course.parts) {
    for (const mod of part.modules) {
      for (const ch of mod.chapters) {
        for (const lesson of ch.lessons) {
          out.push({
            partLetter: part.letter,
            partTitle: part.title,
            moduleTitle: mod.title,
            chapterTitle: ch.title,
            lesson,
          });
        }
      }
    }
  }
  return out;
}

export function neighborDataVizLesson(
  course: DataVizCourse,
  slug: string,
): { prev?: DataVizLessonRef; next?: DataVizLessonRef } {
  const all = allDataVizLessons(course);
  const i = all.findIndex((r) => r.lesson.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}
