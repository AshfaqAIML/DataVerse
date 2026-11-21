/**
 * PART E — BUSINESS INTELLIGENCE (registry subjects: power-bi H5,
 * tableau H6, plus the dashboard-design H3 and data-storytelling H4
 * caps).
 *
 * Module 1 "The BI Studios" works the two tools: the Power BI
 * pipeline, model and formula language (e-01..e-03), then Tableau's
 * inverted grammar (e-04). Module 2 "The Decision Layer" is
 * tool-agnostic: the dashboard as one screen for one decision (e-05,
 * with d-04's Plotly-Dash layer beneath it), and the story that
 * carries the decision to a room (e-06).
 */
import type { DataVizPart } from "@/lib/dataviz/types";
import { LESSON_V_E_01 } from "./lesson-e-01";
import { LESSON_V_E_02 } from "./lesson-e-02";
import { LESSON_V_E_03 } from "./lesson-e-03";
import { LESSON_V_E_04 } from "./lesson-e-04";
import { LESSON_V_E_05 } from "./lesson-e-05";
import { LESSON_V_E_06 } from "./lesson-e-06";
import { PART_E_V_EXERCISES } from "./exercises";
import { PART_E_V_ASSESSMENT } from "./assessment";
import { PART_E_V_PROJECT } from "./project";

export const PART_V_E: DataVizPart = {
  letter: "E",
  subjectSlugs: ["power-bi", "tableau", "dashboard-design", "data-storytelling"],
  title: "Business Intelligence",
  tagline:
    "Where visualization becomes decisions — the two studios the industry pays for, the dashboard discipline that keeps them honest, and the story that carries the answer to a room.",
  description:
    "The closing part moves from making charts to running decisions. It starts inside Power BI — the four-stage pipeline that keeps a report governable, the star schema that makes filters sharable and history honest, and DAX's one load-bearing idea, filter context, that lets a single measure answer correctly in every tile. Then Tableau, taught as the inverted grammar it is: place the pills first and watch the chart derive itself, dimensions slicing blue and measures aggregating green. The second module is tool-agnostic and harder: dashboard design as the discipline of one screen serving one decision — KPIs as claims with targets and owners, the five-second layout, the default filter state as the screen's opening argument — and finally business storytelling: the SCQA spine, claim titles that let a deck read in titles alone, the so-what ladder from observation to action, and answer-first delivery for rooms that give you thirty seconds. Throughout, Part A's honesty rules ride along: a stale timestamp, an averaged-away bimodal split, and a causal verb on a correlational chart are all treated as the misleading devices they are.",
  modules: [
    {
      title: "The BI Studios",
      summary:
        "Power BI's pipeline, model and formula language; then Tableau's inverted grammar — two studios, one underlying grammar of graphics.",
      chapters: [
        {
          title: "Power BI",
          focus: "The pipeline, the star schema, and DAX's filter context",
          lessons: [LESSON_V_E_01, LESSON_V_E_02, LESSON_V_E_03],
        },
        {
          title: "Tableau",
          focus: "Dimensions slice, measures aggregate — the pill grammar and Show Me",
          lessons: [LESSON_V_E_04],
        },
      ],
    },
    {
      title: "The Decision Layer",
      summary:
        "Above the studios: the dashboard as one screen for one decision, and the story that carries the decision to a room.",
      chapters: [
        {
          title: "Dashboard Design",
          focus: "KPIs as claims, the five-second layout, and the reader's path",
          lessons: [LESSON_V_E_05],
        },
        {
          title: "Business Storytelling",
          focus: "SCQA, the title test, the so-what ladder, and answer-first delivery",
          lessons: [LESSON_V_E_06],
        },
      ],
    },
  ],
  exercises: PART_E_V_EXERCISES,
  assessment: PART_E_V_ASSESSMENT,
  project: PART_E_V_PROJECT,
};
