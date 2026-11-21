/**
 * DATA_VIZ_COURSE — the Data Visualization Academy (School H's course).
 *
 * Five parts: A Foundations · B Matplotlib · C Seaborn · D Plotly ·
 * E Business Intelligence — each part advancing the School H registry
 * subjects (A→H1, B/C→H2, D→H2+H3, E→H5/H6 + the H3/H4 caps).
 *
 * Every lesson chart renders live through the shared SVG engine, the
 * same engine behind the Chart Playground (#/viz/playground).
 */
import type { DataVizCourse } from "@/lib/dataviz/types";
import { PART_V_A } from "./part-a";
import { PART_V_B } from "./part-b";
import { PART_V_C } from "./part-c";
import { PART_V_D } from "./part-d";
import { PART_V_E } from "./part-e";

export const DATA_VIZ_COURSE: DataVizCourse = {
  slug: "data-visualization",
  title: "The Data Visualization Academy",
  tagline: "Foundations, tools, and honesty — from first mark to business story.",
  description:
    "A five-part course that teaches charts as arguments: the foundations of perception, encoding and honesty first; then the tools the industry actually uses — Matplotlib from figures to saved files, Seaborn's statistical charts, Plotly's interactive and geographic visualizations — and finally the BI studios where visualization becomes decisions: Power BI, Tableau, dashboard design and business storytelling. Learners do not only produce charts; every part trains the reading skill too, with live-rendered interpretation exercises and a Chart Playground where every encoding decision is one click away.",
  parts: [PART_V_A, PART_V_B, PART_V_C, PART_V_D, PART_V_E],
};

export { SAMPLE_DATASETS, parseCsv } from "./datasets";
export { INTERPRETATION_DRILLS } from "./drills";
