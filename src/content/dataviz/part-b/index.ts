/**
 * PART B — MATPLOTLIB (registry subject H2: statistical-charts).
 *
 * Module 1 "The Canvas and the Marks" builds the object model first
 * (b-01: Figure, Axes, the artist tree — and why every matplotlib
 * bug is a question about which object owns which ink), then walks
 * the core marks: lines (b-02), bars (b-03), histograms (b-04),
 * scatter (b-05) and pies inside their honest range (b-06). Module 2
 * "Composition, Polish, and Delivery" covers what turns marks into a
 * deliverable: box plots for comparing distributions (b-07), subplot
 * grids and small multiples (b-08), annotations on a budget (b-09),
 * style sheets that change dress never meaning (b-10), frames fitted
 * to the question — limits, ticks, log scales (b-11) — and the
 * export contract, from dpi arithmetic to savefig-before-show (b-12).
 */
import type { DataVizPart } from "@/lib/dataviz/types";
import { LESSON_V_B_01 } from "./lesson-b-01";
import { LESSON_V_B_02 } from "./lesson-b-02";
import { LESSON_V_B_03 } from "./lesson-b-03";
import { LESSON_V_B_04 } from "./lesson-b-04";
import { LESSON_V_B_05 } from "./lesson-b-05";
import { LESSON_V_B_06 } from "./lesson-b-06";
import { LESSON_V_B_07 } from "./lesson-b-07";
import { LESSON_V_B_08 } from "./lesson-b-08";
import { LESSON_V_B_09 } from "./lesson-b-09";
import { LESSON_V_B_10 } from "./lesson-b-10";
import { LESSON_V_B_11 } from "./lesson-b-11";
import { LESSON_V_B_12 } from "./lesson-b-12";
import { PART_B_V_EXERCISES } from "./exercises";
import { PART_B_V_ASSESSMENT } from "./assessment";
import { PART_B_V_PROJECT } from "./project";

export const PART_V_B: DataVizPart = {
  letter: "B",
  subjectSlugs: ["statistical-charts"],
  title: "Matplotlib",
  tagline:
    "From fig, ax = plt.subplots() to the file that survives its destination — the object model, every core mark, and the craft that makes static figures ship.",
  description:
    "Twelve lessons on the tool that draws the static world. The part opens with the object model — Figure, Axes, the artist tree — because every matplotlib question you will ever debug ('why is my saved image blank?', 'whose title did I just set?') is a question about which object owns which ink. Then it walks the marks one by one — lines, bars, histograms, scatter, pies, boxes — each with the reading discipline it owes your reader: bins swept before their shape is trusted, alpha spent on density, pies kept inside their narrow honest range. The second half turns marks into deliverables: subplot grids whose shared scales ARE the comparison, annotations held to a budget, style sheets that change the dress and never the meaning, frames fitted to the question (lines may zoom; bars may never leave zero), and the export arithmetic — figsize × dpi, vector versus raster, savefig before show. Every code block is the real API on numbers you already know from Part A, and every chart renders the same data live.",
  modules: [
    {
      title: "The Canvas and the Marks",
      summary:
        "The object model first — then every core mark, each taught with the reading discipline it owes the reader.",
      chapters: [
        {
          title: "Figure, Axes, and the First Marks",
          focus: "The artist tree, lines for time, bars for categories",
          lessons: [LESSON_V_B_01, LESSON_V_B_02, LESSON_V_B_03],
        },
        {
          title: "Distributions, Relationships, and Wholes",
          focus: "Histograms and their bins, scatter and its spare channels, pies inside their honest range",
          lessons: [LESSON_V_B_04, LESSON_V_B_05, LESSON_V_B_06],
        },
      ],
    },
    {
      title: "Composition, Polish, and Delivery",
      summary:
        "Boxes for comparison, grids of tiles, arrows on a budget — then the dress, the lens, and the file the chart must become.",
      chapters: [
        {
          title: "Comparing and Composing",
          focus: "Box plots across groups, subplot grids with shared scales, annotations that pin claims",
          lessons: [LESSON_V_B_07, LESSON_V_B_08, LESSON_V_B_09],
        },
        {
          title: "The Last Mile",
          focus: "Style sheets, fitted frames and log scales, exports that survive their destinations",
          lessons: [LESSON_V_B_10, LESSON_V_B_11, LESSON_V_B_12],
        },
      ],
    },
  ],
  exercises: PART_B_V_EXERCISES,
  assessment: PART_B_V_ASSESSMENT,
  project: PART_B_V_PROJECT,
};
