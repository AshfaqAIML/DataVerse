/**
 * PART C — SEABORN (registry subject: statistical-charts H2).
 *
 * Module 1 "The Statistical Grammar": the seaborn contract — raw
 * long-form rows in, the statistic computed inside the plot call — and
 * the two-storey API (figure-level dispatchers vs axes-level members)
 * that organises the library (c-01); the distribution instruments —
 * histplot with its owned bins, kdeplot, and the parameter-free ECDF
 * (c-02); the catplot kind ladder over the survey-by-department
 * comparison, where a bar of means hides what a box reveals (c-03);
 * and relplot's hue/size/style channels plus the estimator, whose
 * aggregated line is a summary with no members (c-04). Module 2
 * "Models and Multiples": regplot's confidence band read honestly and
 * lmplot's per-group fits against the pooled-slope trap (c-05); the
 * reshape-then-heat workflow and the cmap honesty decision (c-06); the
 * pairs grid as the first-look instrument, tamed by vars= and corner=
 * (c-07); and FacetGrid small multiples, where sharey is the trust
 * decision (c-08). Every chart renders the shared course datasets with
 * the course engine; every code block is the real seaborn API that
 * would produce it.
 */
import type { DataVizPart } from "@/lib/dataviz/types";
import { LESSON_V_C_01 } from "./lesson-c-01";
import { LESSON_V_C_02 } from "./lesson-c-02";
import { LESSON_V_C_03 } from "./lesson-c-03";
import { LESSON_V_C_04 } from "./lesson-c-04";
import { LESSON_V_C_05 } from "./lesson-c-05";
import { LESSON_V_C_06 } from "./lesson-c-06";
import { LESSON_V_C_07 } from "./lesson-c-07";
import { LESSON_V_C_08 } from "./lesson-c-08";
import { PART_C_V_EXERCISES } from "./exercises";
import { PART_C_V_ASSESSMENT } from "./assessment";
import { PART_C_V_PROJECT } from "./project";

export const PART_V_C: DataVizPart = {
  letter: "C",
  subjectSlugs: ["statistical-charts"],
  title: "Seaborn",
  tagline:
    "Hand it raw rows and it computes the statistic before it draws — the statistical layer of the craft, from the first histogram to the last facet.",
  description:
    "Eight lessons on the layer between raw rows and finished ink. The contract comes first: seaborn takes a long-form DataFrame of observations and computes the statistic inside the plot call, and its two-storey API — figure-level dispatchers that facet with col=, axes-level members that compose into any matplotlib figure — decides the shape of every call you make after that. Then the three families earn their keep: distributions through histplot, kdeplot and the parameter-free ECDF, where bins are a lens you own; categorical comparisons through catplot's kind ladder, where a bar of means can hide what a box reveals; relationships through relplot's hue/size/style channels and the estimator, whose aggregated line is a summary with no members. The second module fits models — regplot's confidence band read honestly, lmplot's per-group fits unmasking the pooled-slope trap — melts grids into color with pivot_table and an honest cmap, opens new tables with the pairs grid, and closes with small multiples, where sharey is the trust decision.",
  modules: [
    {
      title: "The Statistical Grammar",
      summary:
        "The seaborn contract and the three plot families: distributions, categorical comparisons, and relationships.",
      chapters: [
        {
          title: "The Seaborn Contract",
          focus: "Figure-level dispatchers vs axes-level members, and the distribution instruments",
          lessons: [LESSON_V_C_01, LESSON_V_C_02],
        },
        {
          title: "Comparisons and Relationships",
          focus: "The catplot kind ladder; relplot's channels and the estimator",
          lessons: [LESSON_V_C_03, LESSON_V_C_04],
        },
      ],
    },
    {
      title: "Models and Multiples",
      summary:
        "Fitted lines read honestly, grids of color, and panels that earn comparison on a shared scale.",
      chapters: [
        {
          title: "Fits and Matrices",
          focus: "regplot's band, lmplot's per-group fits, and the cmap decision",
          lessons: [LESSON_V_C_05, LESSON_V_C_06],
        },
        {
          title: "Panels and Small Multiples",
          focus: "The pairs grid, FacetGrid, and the sharey contract",
          lessons: [LESSON_V_C_07, LESSON_V_C_08],
        },
      ],
    },
  ],
  exercises: PART_C_V_EXERCISES,
  assessment: PART_C_V_ASSESSMENT,
  project: PART_C_V_PROJECT,
};
