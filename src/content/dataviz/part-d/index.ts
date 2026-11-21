/**
 * PART D — PLOTLY (registry subjects: statistical-charts H2,
 * dashboard-design H3).
 *
 * Module 1 "Interactive Figures": the express grammar and the four
 * affordances (d-01), the tooltip as an edited channel (d-02), and the
 * window machinery — rangeslider, rangebreaks, the zoom-vs-filter call
 * (d-03) — closing with composition and delivery: make_subplots,
 * shared axes, and Dash's three-line doorway (d-04). Module 2 "Space
 * and Place": the 3D burden of proof on the helix standard and
 * go.Surface's contour view (d-05), and the geographic idioms with the
 * choropleth trap taught end to end (d-06). Every chart renders the
 * underlying data with the course engine; every code block is the real
 * plotly API that would produce it.
 */
import type { DataVizPart } from "@/lib/dataviz/types";
import { LESSON_V_D_01 } from "./lesson-d-01";
import { LESSON_V_D_02 } from "./lesson-d-02";
import { LESSON_V_D_03 } from "./lesson-d-03";
import { LESSON_V_D_04 } from "./lesson-d-04";
import { LESSON_V_D_05 } from "./lesson-d-05";
import { LESSON_V_D_06 } from "./lesson-d-06";
import { PART_D_V_EXERCISES } from "./exercises";
import { PART_D_V_ASSESSMENT } from "./assessment";
import { PART_D_V_PROJECT } from "./project";

export const PART_V_D: DataVizPart = {
  letter: "D",
  subjectSlugs: ["statistical-charts", "dashboard-design"],
  title: "Plotly",
  tagline:
    "Figures that answer back — from the first hover to the first map, interactivity as a design discipline rather than a checkbox",
  description:
    "Six lessons on the interactive layer of the craft. It starts with the bargain — detail on demand — and the plotly.express grammar that states data, mark and channels in one call, then designs what the defaults only promise: the tooltip as an edited three-layer channel (identity, value with unit, one comparison), the window as a reader-negotiable claim (rangesliders that never lose context, rangebreaks that cut only dead time, the zoom-versus-filter judgment), and composition as hierarchy — make_subplots with shared axes, Dash's three-line doorway to the web, and the one-screen-one-decision audit. The second module takes on space itself: 3D held to a burden of proof (a helix that survives in no projection earns its depth; an extruded bar chart pays the occlusion tax for nothing) and go.Surface read through its honest contour view; then geography — the two map idioms, the GeoJSON join, the projection question, and the classic choropleth trap where normalizing by the population at risk inverts the map's entire verdict. Throughout, the same engine that rendered Parts A-C renders the underlying data here, so every hover you are taught to design has a chart whose numbers you already know how to read.",
  modules: [
    {
      title: "Interactive Figures",
      summary:
        "The grammar you know, made answerable: hovers designed, windows negotiated, tiles composed and served.",
      chapters: [
        {
          title: "From Static to Interactive",
          focus: "The affordances, and the tooltip as an edited channel",
          lessons: [LESSON_V_D_01, LESSON_V_D_02],
        },
        {
          title: "Navigation and Composition",
          focus: "Rangesliders, rangebreaks, shared axes, and the Dash doorway",
          lessons: [LESSON_V_D_03, LESSON_V_D_04],
        },
      ],
    },
    {
      title: "Space and Place",
      summary:
        "Depth held to a burden of proof, and geography held to its oldest honest rule: normalize before you shade.",
      chapters: [
        {
          title: "The Third Axis",
          focus: "When 3D earns its depth — and when it only occludes",
          lessons: [LESSON_V_D_05],
        },
        {
          title: "Geography",
          focus: "Choropleths, scatter maps, projections, and the population trap",
          lessons: [LESSON_V_D_06],
        },
      ],
    },
  ],
  exercises: PART_D_V_EXERCISES,
  assessment: PART_D_V_ASSESSMENT,
  project: PART_D_V_PROJECT,
};
