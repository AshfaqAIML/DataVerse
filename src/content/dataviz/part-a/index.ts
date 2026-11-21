/**
 * PART A — Visualization Foundations (registry subject H1:
 * visualization-principles).
 *
 * Module 1 "Why and What" builds the case: what a chart IS (a mapping),
 * why it beats serial table-reading (Anscombe's quartet), and how the
 * question selects the chart (the choice ladder, the data-type rules).
 * Module 2 "The Craft of Honesty" builds the craft: perception, colour,
 * labels, and the honesty rules — closing with the misleading-device
 * catalogue demonstrated live and repaired (a-08).
 */
import type { DataVizPart } from "@/lib/dataviz/types";
import { LESSON_V_A_01 } from "./lesson-a-01";
import { LESSON_V_A_02 } from "./lesson-a-02";
import { LESSON_V_A_03 } from "./lesson-a-03";
import { LESSON_V_A_04 } from "./lesson-a-04";
import { LESSON_V_A_05 } from "./lesson-a-05";
import { LESSON_V_A_06 } from "./lesson-a-06";
import { LESSON_V_A_07 } from "./lesson-a-07";
import { LESSON_V_A_08 } from "./lesson-a-08";
import { PART_A_V_EXERCISES } from "./exercises";
import { PART_A_V_ASSESSMENT } from "./assessment";
import { PART_A_V_PROJECT } from "./project";

export const PART_V_A: DataVizPart = {
  letter: "A",
  subjectSlugs: ["visualization-principles"],
  title: "Visualization Foundations",
  tagline:
    "What a chart is, why the eye wins, and how to choose and defend every mark you place — the principles before the tools.",
  description:
    "The part that everything else stands on: a chart is a mapping from data to visual properties, and this part makes that mapping deliberate. You will see the same numbers told three ways and learn which question each encoding answers; you will run the perception experiments on your own eye (pop-out, the angle illusion, the effectiveness ladder); you will choose colour scales by what the data MEANS, not by what looks festive; you will write titles that state findings; and you will catch every classic misleading device — truncated axes, cherry-picked windows, area inflation — because Part A demonstrates each one live before teaching its repair. Every chart in every lesson is rendered from real data by the same engine the Chart Playground uses.",
  modules: [
    {
      title: "Why and What",
      summary: "The case for charts, and the discipline of choosing them from the question.",
      chapters: [
        {
          title: "The Case for Charts",
          focus: "Mapping, perception, and Anscombe's argument",
          lessons: [LESSON_V_A_01, LESSON_V_A_02],
        },
        {
          title: "Choosing the Chart",
          focus: "Question → relationship → encoding, and the data-type rules",
          lessons: [LESSON_V_A_03, LESSON_V_A_04],
        },
      ],
    },
    {
      title: "The Craft of Honesty",
      summary: "Perception, colour, and text — the craft layers, and the devices that abuse them.",
      chapters: [
        {
          title: "Perception and Colour",
          focus: "Preattentive attributes, Gestalt, the encoding ladder, and safe colour",
          lessons: [LESSON_V_A_05, LESSON_V_A_06],
        },
        {
          title: "Text, Labels, and Misleading Charts",
          focus: "Titles as claims, direct labelling, and the honesty rules",
          lessons: [LESSON_V_A_07, LESSON_V_A_08],
        },
      ],
    },
  ],
  exercises: PART_A_V_EXERCISES,
  assessment: PART_A_V_ASSESSMENT,
  project: PART_A_V_PROJECT,
};
