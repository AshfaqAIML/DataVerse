/**
 * PART_E_V_PROJECT — the Part E capstone. Learners take one business
 * from raw workbook to boardroom: model it, measure it, design the
 * one-screen dashboard for its weekly decision, storyboard the board
 * story, and script the answer-first delivery. The starter is a
 * structured working brief with TODO markers (design exercise, not
 * runnable code).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_E_V_PROJECT: MiniProject = {
  title: "From CSV to Boardroom: One Decision, End to End",
  brief:
    "You are handed a coffee company's workbook — 24 months of revenue, four products across four quarters, five departments of satisfaction scores, 28 days of traffic and signups — and one mandate: the Monday leadership meeting must decide, in five seconds of screen and thirty seconds of story, what to act on this week. The full Part E arc in one artifact: shape and model the data into a star schema, write the KPI measures that survive every tile, design the one-screen dashboard (claim title, headline band, trend row, detail layer, default state), storyboard the SCQA story for the quarterly board, and script the answer-first opening with two anticipated attacks. The deliverable is not charts — it is a decision environment with a story attached, and every layer of it defensible.",
  requirements: [
    "A star schema: fact tables with declared grains, dimensions with keys, relationships marked one-to-many single-direction — and one paragraph naming what the flat-table version would get wrong",
    "Two DAX measures (a ratio KPI like Margin % or a rate per thousand, plus a time-aware total), each with one sentence on why it must be a measure and not a column",
    "The dashboard design on one page: claim title, four KPI verdicts with targets and owners, the trend row, the detail layer, the default filter state — and the list of tiles you refused",
    "The SCQA storyboard: four claim titles, each act's chart and scope, the so-what ladder climbed to a recommendation that stops where the data stops",
    "The delivery script: the thirty-second answer-first opening, and drill answers to two named attacks (one on the evidence, one on the projection)",
    "An honesty audit of every exhibit: axis, window, denominator, ratio — a-08's five-second audit, signed off per chart",
  ],
  steps: [
    "Declare the decision first: write the sentence 'The Monday meeting decides ___' — every later choice earns its place against this sentence.",
    "Classify the workbook's tables into facts and dimensions; draw the star with grains and cardinalities; name the flat-table failure modes for YOUR data (fan-out, history, filters).",
    "Write the measures: the ratio KPI with DIVIDE, the time-aware total — and check each against the measure/column test (does it depend on the asking cell?).",
    "Design the screen: claim title, headline band, trend row, detail layer, default state; then delete — every tile that neither answers nor evidences the decision goes.",
    "Storyboard the board story: situation, complication, question, answer — one claim title per act; run the title test aloud.",
    "Script the room: the answer-first opening, the two attacks, the drill evidence in the order you would raise it.",
    "Audit every exhibit with a-08's four questions; fix anything that fails; write the one-paragraph defence of anything you deliberately left ambiguous.",
  ],
  starter: `# FROM CSV TO BOARDROOM — working brief (fill every TODO)

## 0. The decision
The Monday meeting decides: TODO

## 1. The model
- Facts and grains:
  - TODO (table, grain in one sentence)
- Dimensions and keys:
  - TODO
- Relationships (from → to, cardinality, direction): TODO
- The flat table would fail here because: TODO

## 2. The measures
KPI measure (DAX):
TODO
Why a measure, not a column: TODO

Time-aware measure (DAX):
TODO

## 3. The dashboard
- Claim title: TODO
- Headline band (KPI, target, owner): 1. TODO  2. TODO  3. TODO  4. TODO
- Trend row: TODO
- Detail layer: TODO
- Default filter state: TODO — because the standup asks: TODO
- Tiles refused (and why): TODO

## 4. The board story (SCQA)
- Situation (claim title + chart + scope): TODO
- Complication (claim title + chart + scope): TODO
- Question (one sentence): TODO
- Answer (recommendation, labelled where it projects): TODO
- So-what ladder: observation → TODO; so what → TODO; therefore → TODO

## 5. The delivery
- Thirty-second opening (answer + three supports): TODO
- Attack 1 (on the evidence) and the drill answer: TODO
- Attack 2 (on the projection) and the drill answer: TODO

## 6. Honesty audit (per exhibit: axis, window, denominator, ratio)
| Exhibit | Axis | Window | Denominator | Honest ratio? |
|---------|------|--------|-------------|---------------|
| TODO    | TODO | TODO   | TODO        | TODO          |

## 7. What I deliberately left ambiguous, and why
TODO`,
  concepts: ["star schema", "DAX measures", "dashboard design", "SCQA storytelling", "answer-first delivery", "honesty audit"],
  extension:
    "Translate the dashboard into the OTHER studio: spec the same screen in Tableau terms — pill states for each tile, filter actions for the slicers, dashboard actions for the drill paths — and write one paragraph on which tool made which layer easier, and why.",
};
