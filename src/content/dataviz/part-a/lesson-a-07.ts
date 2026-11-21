/**
 * PART A · LESSON a-07 — "Labels and Legends"
 *
 * The chart is the argument; the labels are its sentences. The title as
 * claim ('Cold Brew overtook Latte in Q3' beats 'Product sales'), axis
 * labels with units, sorting bars by value, direct labelling vs side
 * legends, and annotation that points at the interesting part.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4 } from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const perQuarter = COFFEE_PRODUCTS.map((_, i) => [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]]);
const coffeeAnnual = perQuarter.map((q) => q.reduce((a, v) => a + v, 0));

/** The same line chart, twice — once with a topic title, once with a claim title. */
const productsByQuarter = (title: string) => ({
  type: "line" as const,
  title,
  categories: quarters,
  series: COFFEE_PRODUCTS.map((p, i) => ({ name: p, values: perQuarter[i] })),
  yLabel: "cups",
});

export const LESSON_V_A_07: DataVizLesson = {
  slug: "a-07",
  title: "Labels and Legends",
  minutes: 20,
  summary:
    "The title as claim — 'Cold Brew overtook Latte in Q3' beats 'Product sales' — plus axis labels with units, sorting bars by value, direct labelling versus side legends, and annotation that points at the interesting part.",
  tool: null,
  objectives: [
    "Write a claim title: a sentence stating the finding with its measure, window and comparison",
    "Label axes with units and decide when sorting categories by value helps or distorts",
    "Choose between direct labelling and side legends, and know each option's cost",
    "Annotate the interesting part: value labels, captions and pointers that save the reader the search",
  ],
  why: "A chart without labels is a Rorschach test. The ink shows shapes; the labels tell the reader what the shapes are, in what units, over what window, and — most importantly — what to conclude. The strongest chart labelling does not describe the chart ('Product sales by quarter') but states its finding ('Cold Brew overtook Latte in Q3'), turning every skimming reader into an informed one. And the discipline cuts both ways: if you cannot write the claim your chart makes, the chart is not finished — you have decoration, not communication.",
  blocks: [
    {
      kind: "text",
      text: "Every chart speaks in two registers at once. The **ink** — bars, lines, points — makes the argument to the eye. The **labels** — title, axes, values, caption — make the same argument in words. Readers who skip the ink get nothing; readers who skim only the title and labels still walk away informed. That is the standard to design for: the *skimming* reader. Two identical charts follow, differing only in their title.",
    },
    { kind: "heading", text: "The title is the claim" },
    {
      kind: "chart",
      chart: productsByQuarter("Product sales by quarter"),
      why: "A topic title: accurate, inoffensive, and inert. It names the subject and leaves every conclusion as an exercise — the busy reader learns exactly nothing from it.",
    },
    {
      kind: "chart",
      chart: productsByQuarter("Cold Brew overtook Latte in Q3"),
      why: "A claim title: same ink, new sentence. It states the finding — and the chart becomes the evidence. Check it against the lines: Cold Brew's 618 passes Latte's 596 in Q3 after trailing 542 to 612 in Q2. A reader skimming titles alone now carries the headline away.",
    },
    {
      kind: "text",
      text: "The claim title also works as a **design instrument** on you: if you cannot finish the sentence, the chart is not ready to ship — either the data does not actually say anything yet, or you have not looked. One caution: a claim title is a *promise*. 'Cold Brew overtook Latte in Q3' must be checkable against the ink, and it must carry its own scope. 'Overtake' claims need a time window ('in Q3'), comparisons need a baseline, and every measure needs its units — which is the axis labels' job.",
    },
    { kind: "heading", text: "Axes, units, sorting, and pointing" },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold per product, Q4 2024",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups sold",
        showValues: true,
        showLegend: false,
      },
      why: "Axis labels carry units ('cups sold', not a bare number line); value labels on the bars spare the reader axis-squinting (671, 647, 489, 258). The categories sit in dataset order — honest, but the ranking takes a beat to see. Sorting is the next cheapest upgrade in chart craft.",
    },
    {
      kind: "text",
      text: "**Sort by value when the categories have no natural order** — products and departments are names, so ordering them by the measure (tallest first) is a courtesy that makes ranking instant. **Keep the natural order when one exists** — months, quarters and sizes have an intrinsic sequence that value-sorting would destroy (sorting months by revenue breaks the calendar the reader came to see). **Direct labelling beats side legends** when series are few: write the series name at the line's end and the eye never leaves the data. Our engine draws side legends for multi-series charts — a fair trade at four series, a redesign signal at fourteen — and its pies print percentages but not slice names, which is why pie captions must name the slices. **Annotation** is pointing: `showValues` marks what matters, captions say what to notice, and a good chart block's *why* is annotation in prose.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The best legend is no legend",
      text: "A side legend sends the reader's eyes on a round trip: data → legend → data, once per colour. Direct labelling at each line's end makes the same trip zero times. With two or three series, label directly; with more, consider small multiples (one mini-chart per series) — a legend that never had to exist.",
    },
    {
      kind: "interpretation",
      id: "a-07-i1",
      chart: {
        type: "bar",
        title: "2024 cups by product, sorted — annual window",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "2024 cups", values: coffeeAnnual }],
        yLabel: "cups sold",
        sortDesc: true,
        showValues: true,
        showLegend: false,
      },
      prompt:
        "The Q4 chart crowned Cold Brew (671 vs Latte's 647). This chart — the same shop, the whole year — crowns Latte (2443 vs Cold Brew's 2307). What does the pairing teach about titles and windows?",
      options: [
        {
          text: "The window is part of the claim: 'who leads' depends on the period, so an honest title names its scope — 'in Q4' versus 'across 2024' — and both charts can be true at once",
          correct: true,
          feedback:
            "Correct — sorting and value labels make each chart's inner ranking precise (Cold Brew +24 in Q4; Latte +136 across the year); the title's scope tells the reader which claim is on the table.",
        },
        {
          text: "One of the two charts must be lying",
          correct: false,
          feedback: "Neither lies: 671 > 647 in Q4 and 2443 > 2307 across the year are both arithmetic facts. The potential lie is omitting the window from the title.",
        },
        {
          text: "Annual charts are simply better than quarterly ones",
          correct: false,
          feedback: "Better for annual questions, worse for recent ones — the Q4 chart caught the regime change (Cold Brew's rise) that the annual chart smooths over.",
        },
        {
          text: "Bar charts cannot be trusted for rankings",
          correct: false,
          feedback: "Bars rank reliably on a zero baseline — that is their strength. What differs between these two charts is scope, not encoding.",
        },
      ],
      explanation:
        "Sorting, value labels, and a claim title that names its window: with all three, each chart states exactly what it supports — and the reader can hold both truths (Q4 leader, annual leader) at once.",
    },
    {
      kind: "exercise",
      id: "a-07-e1",
      exerciseKind: "critique",
      chart: {
        type: "line",
        title: "Revenue",
        categories: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"],
        series: [{ name: "v", values: [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204] }],
        yLabel: "v",
        showLegend: false,
      },
      prompt:
        "The slide says the values are monthly revenue in thousands of dollars. Rewrite the labelling: a claim title, axis labels with units, category labels, and the one annotation that matters most. Justify each move.",
      options: [
        {
          text: "Title: 'Revenue grew 65% in 2024, accelerating into Q4'; y-axis 'revenue (k$)'; x-axis real months; annotate the December peak (204 k$) and note the two flat months",
          correct: true,
          feedback:
            "Correct — the title now carries the finding (124 → 204), the units leave nothing ambiguous, real months replace machine labels, and the annotation points at the interesting part instead of making the reader hunt for it.",
        },
        {
          text: "Keep 'Revenue' — brevity beats specificity",
          correct: false,
          feedback: "'Revenue' names the topic, not the finding: a skimming reader leaves with nothing. The four extra words of a claim title are the cheapest information on the slide.",
        },
        {
          text: "Label the y-axis 'revenue' and leave units to a footnote",
          correct: false,
          feedback: "Units belong on the axis, where the eye needs them: is 124 cups, thousands, or euros? The claim's size depends entirely on the unit.",
        },
        {
          text: "Remove all labels — the line's shape speaks for itself",
          correct: false,
          feedback: "The line speaks geometry, not claims: without units, window and title, every reader invents their own story — and they will not all invent yours.",
        },
      ],
      hint: "Three jobs: state the finding, state the units, point at the evidence.",
      explanation:
        "Labelling is the chart's voice: a claim title states the finding, labelled axes with units make it checkable, and one annotation points the reader at the part that proves it.",
    },
  ],
  terms: [
    {
      term: "claim title",
      definition: "A title that states the chart's finding — measure, window and comparison — rather than naming its topic. 'Cold Brew overtook Latte in Q3' instead of 'Product sales'.",
    },
    {
      term: "direct labelling",
      definition: "Labelling each series at its own mark (typically the line's end) instead of a side legend — the reader's eyes never leave the data.",
    },
    {
      term: "sorting by value",
      definition: "Ordering unordered categories by their measure (tallest bar first) so ranking is instant. Reserved for categories with no natural order — never for time or magnitude-ordered axes.",
    },
    {
      term: "annotation",
      definition: "Any mark that points at the interesting part — value labels, callouts, captions. Its job is to save the reader the search; if the reader must hunt for the point, the annotation failed.",
    },
  ],
  takeaways: [
    "The title is the claim: state the finding with measure, window and comparison — a title you cannot finish writing is a chart you cannot ship.",
    "Axes carry units; value labels spare the reader the axis-squint; both are labelling, and labelling is the chart's voice.",
    "Sort unordered categories by value; keep the natural order for time and magnitude — sorting is a courtesy, never a distortion.",
    "Direct labelling beats side legends for few series; pies that cannot label their own slices depend on captions to speak.",
    "Annotation points at the interesting part — showValues, captions and pointers convert 'find the story' into 'here it is'.",
  ],
  quiz: [
    {
      id: "a-07-q1",
      prompt: "Which title does its job?",
      options: [
        { text: "'Cold Brew overtook Latte in Q3' — finding, window and comparison, all checkable against the ink", correct: true, feedback: "A claim title: the skimming reader leaves informed, and the careful reader can verify it on the chart itself (618 vs 596)." },
        { text: "'Product sales by quarter' — neutral and professional", correct: false, feedback: "Accurate and inert: it names the topic and delegates every conclusion to the reader's spare time." },
        { text: "'Chart 4b' — clean, minimal, humble", correct: false, feedback: "A filename, not a title: it locates the chart in a deck and says nothing about the data." },
        { text: "'Sales data 2024 (k cups, quarterly, 4 products, unsorted)' — maximally complete", correct: false, feedback: "Metadata, not a message: units and window belong in the axis labels — the title should still say what it all means." },
      ],
      explanation: "Titles earn their line by carrying the claim; scope and units support the claim from the axis labels.",
    },
    {
      id: "a-07-q2",
      prompt: "When should categories stay in their natural order rather than be sorted by value?",
      options: [
        { text: "When the categories carry an intrinsic order — months, quarters, sizes — that the reader came to see", correct: true, feedback: "Sorting months by revenue shatters the calendar: trends along the natural order ARE the story, and value-sorting would hide it." },
        { text: "Never — sorting by value is always the readability upgrade", correct: false, feedback: "For unordered names, yes; for time and magnitude axes, sorting destroys exactly the structure the reader needs." },
        { text: "Only when there are more than ten categories", correct: false, feedback: "Count is irrelevant — a two-category time axis still belongs in calendar order." },
        { text: "When the chart is in grayscale", correct: false, feedback: "Colour and sorting are independent labelling decisions; greyscale changes palette choice, not axis order." },
      ],
      explanation: "Value-sorting is a courtesy for names; natural order is a promise for time and magnitude. Sorting a time axis trades the story for a ranking.",
    },
    {
      id: "a-07-q3",
      prompt: "Direct labelling beats a side legend because:",
      options: [
        { text: "The reader's eyes never leave the data — no round trip from mark to legend and back for every colour", correct: true, feedback: "One glance carries both the line and its name; legends pay a small tax per lookup, per colour, per reader." },
        { text: "Legends are technically unsupported in most tools", correct: false, feedback: "Every tool draws legends happily — the question is perceptual cost, not capability." },
        { text: "Direct labels let you use more series", correct: false, feedback: "The opposite: direct labels crowd at the edges with many series, which is exactly when side legends or small multiples take over." },
        { text: "Side legends cannot show colours accurately", correct: false, feedback: "Legends show colours perfectly — the cost is the eye's travel, not the swatch's fidelity." },
      ],
      explanation: "Labelling is about the reader's eyes: labels at the mark make the name and the data one object; legends split them across the frame.",
    },
  ],
};
