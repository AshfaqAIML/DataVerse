/**
 * PART A · LESSON a-01 — "What Is Data Visualization?"
 *
 * The exemplar lesson of the Data Visualization course: every block kind
 * is demonstrated here in its authored form, and every chart is rendered
 * LIVE from data by the shared engine. Authors of other lessons follow
 * this file's conventions exactly.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q4, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_A_01: DataVizLesson = {
  slug: "a-01",
  title: "What Is Data Visualization?",
  minutes: 20,
  summary:
    "A chart is an argument made of ink: data mapped to visual properties so the eye can find the structure the table hides. What that mapping is, and why it works.",
  tool: null,
  objectives: [
    "Define data visualization as a mapping from data to visual encodings",
    "Explain why a chart can reveal what a table of numbers conceals",
    "Name the three questions every chart implicitly answers",
    "Read a simple chart and state what it claims — precisely",
  ],
  why: "You have checked a spreadsheet cell-by-cell looking for a pattern you could not name. A chart of the same numbers hands you the pattern in a glance — not because charts are pretty, but because vision is the highest-bandwidth sense you own. This lesson is about what actually happens when that works.",
  blocks: [
    {
      kind: "text",
      text: "A **table** and a **chart** can hold exactly the same numbers and tell completely different stories. The table shows each value faithfully and independently — every number equally visible, none comparable at a glance. The chart *maps* those numbers to lengths, positions and colours, and in doing so makes **relationships** visible: bigger, smaller, rising, falling, clustered, alone. Data visualization is that mapping, done deliberately.",
    },
    {
      kind: "definition",
      term: "Data visualization",
      informal:
        "The mapping of data values to visual properties — position, length, angle, colour, area — so that relationships in the data become relationships the eye can perceive.",
      why: "The word *mapping* matters: a chart is a function from data to ink, and every design decision is a choice about that function.",
    },
    {
      kind: "heading",
      text: "The same data, twice",
    },
    {
      kind: "text",
      text: "Here is one month of the coffee dataset as prose: Espresso sold **489** cups, Latte **647**, Filter **258**, Cold Brew **671**. Read it again and answer without scrolling: which product sold second-most? Most readers hesitate. Now the chart:",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold in December",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        sortDesc: true,
      },
      why: "Length on a shared baseline is the encoding ladder's top rung: the ranking — Cold Brew, Latte, Espresso, Filter — lands before you can even read the axis. The table required four lookups and a comparison; the bar chart requires one glance.",
    },
    {
      kind: "interpretation",
      id: "a-01-i1",
      chart: {
        type: "bar",
        title: "Cups sold in December",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        yLabel: "cups",
        showLegend: false,
      },
      prompt: "State precisely what this chart claims — and what it does NOT claim.",
      options: [
        {
          text: "Cold Brew sold more cups than every other product in December; the chart says nothing about any other month",
          correct: true,
          feedback:
            "Correct — a precise reading names the measure (cups), the period (December), the comparison (ranking) and, crucially, the limits of the claim. Growth, trends and causes are all outside this chart.",
        },
        {
          text: "Cold Brew is the best product and the business should invest in it",
          correct: false,
          feedback: "The chart shows volume, not value: a latte's margin may exceed cold brew's. 'Best' needs a definition the chart does not carry.",
        },
        {
          text: "Filter is failing and should be discontinued",
          correct: false,
          feedback: "Filter sold the fewest cups — that is all. Whether 258 is failing depends on costs, capacity and strategy, none of which are on the chart.",
        },
        {
          text: "The products sell roughly equal amounts",
          correct: false,
          feedback: "671 against 258 is a 2.6-to-1 difference — visible instantly as a bar-length ratio.",
        },
      ],
      explanation:
        "Interpretation discipline has two halves: what the chart supports (a ranking by cups in one month) and what it cannot support (value judgments, trends, causes). Claim only the first half, and say so.",
    },
    {
      kind: "heading",
      text: "Why the eye wins",
    },
    {
      kind: "text",
      text: "Vision processes a scene **in parallel** — every bar's length arrives at once — while reading a table is **serial**: one cell at a time, comparisons held in memory. That is not a metaphor; it is the difference between a sense built for instant spatial comparison and a symbol system built for exact storage. Charts trade some precision (you will not read '671' off a bar without a label) for immediate *structure*. The craft of the next lessons is choosing what structure you want to surface.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      why: "Position along a common scale again — but now the relationship surfaced is *change over time*: steady growth accelerating into the final quarter. The same numbers in a table invite none of that reading.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The three questions every chart answers",
      text: "Before drawing anything, a chart answers: **What is shown?** (the measure and its units) · **Compared to what?** (the baseline, the categories, the time window) · **So that what is visible?** (the relationship the encoding is built to expose). If you cannot answer the third question, you do not have a chart design yet — you have a decoration.",
    },
    {
      kind: "exercise",
      id: "a-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague shows you a spreadsheet with 5,000 rows of sales and says 'I can see everything I need right here.' What is the strongest honest argument for visualizing it anyway?",
      options: [
        {
          text: "Charts are more persuasive in presentations",
          correct: false,
          feedback: "Often true, but persuasion is not the purpose — perception is. This argument invites decoration.",
        },
        {
          text: "A mapping to visual properties makes relationships — outliers, clusters, trends — perceivable in parallel, which serial cell-reading cannot do at 5,000 rows",
          correct: true,
          feedback: "Correct — the table and the chart are complements, not rivals: the chart finds the structure, the table verifies it.",
        },
        {
          text: "Spreadsheets cannot hold 5,000 rows accurately",
          correct: false,
          feedback: "They hold them perfectly; the limit is in the reading, not the storing.",
        },
        {
          text: "Charts remove the need to understand the data",
          correct: false,
          feedback: "The reverse: a chart you cannot interpret is a chart you did not design.",
        },
      ],
      explanation:
        "Storage and perception are different jobs. The table is the honest record; the chart is the perceptual instrument. The 5,000-row case is exactly where the eye's parallel processing pays rent.",
    },
  ],
  terms: [
    {
      term: "encoding",
      definition: "The visual property a data value is mapped to — position, length, angle, area, colour hue, colour intensity. The encoding choice is the chart's core design decision.",
    },
    {
      term: "mark",
      definition: "The basic graphical object that carries the encodings — a bar, a point, a line segment, a pie slice.",
    },
    {
      term: "baseline",
      definition: "The shared reference (usually zero, on a common axis) against which encoded values are judged. Bars without a baseline are shapes, not data.",
    },
  ],
  takeaways: [
    "A chart is a mapping from data to visual properties — a function you design, not a picture you decorate.",
    "Vision perceives relationships in parallel; tables reveal them only through serial reading. Use each for its strength.",
    "Every chart answers three questions: what is shown, compared to what, so that what is visible.",
    "Reading a chart precisely means claiming only what the encoding supports — measure, period, comparison — and no more.",
  ],
  quiz: [
    {
      id: "a-01-q1",
      prompt: "Data visualization is best defined as:",
      options: [
        { text: "Making data attractive so people will look at it", correct: false, feedback: "Attractiveness is a side effect at best; the definition is about mapping data to perceivable properties." },
        { text: "A mapping from data values to visual properties so relationships become perceivable", correct: true, feedback: "Correct — mapping, perception, relationships: the three words that separate visualization from decoration." },
        { text: "Any graphic that appears next to numbers", correct: false, feedback: "Placement is not mapping — a decorative icon next to a figure encodes nothing." },
        { text: "The automatic output of charting software", correct: false, feedback: "Software executes a mapping somebody chose — and default choices are still choices." },
      ],
      explanation: "Definition discipline pays off immediately: if a chart is a mapping, then chart quality is mapping quality, and every later lesson is about choosing mappings honestly.",
    },
    {
      id: "a-01-q2",
      prompt: "What does the eye gain over table-reading?",
      options: [
        { text: "Greater numeric precision", correct: false, feedback: "The opposite — tables hold exact values; bars hold comparable ones. Charts trade precision for structure." },
        { text: "Parallel perception of relationships — comparisons arrive at once instead of serially", correct: true, feedback: "Correct — the highest-bandwidth channel you own, applied to comparisons the table makes you build in memory." },
        { text: "Immunity to misinterpretation", correct: false, feedback: "Charts can mislead at least as well as tables — Part A's closing subject." },
        { text: "Smaller file sizes", correct: false, feedback: "An engineering side effect, not a perceptual claim." },
      ],
      explanation: "Structure-first, precision-second: that trade is the reason both tables and charts exist.",
    },
    {
      id: "a-01-q3",
      prompt: "The December bar chart supports which claim exactly?",
      options: [
        { text: "Cold Brew is the most popular product", correct: false, feedback: "'Popular' is a claim about people; the chart measures cups — a proxy at best." },
        { text: "Cold Brew sold the most cups in December", correct: true, feedback: "Correct — measure, period, ranking: the claim the encoding (length on a shared zero baseline) supports exactly." },
        { text: "Cold Brew sales are growing fastest", correct: false, feedback: "One month has no slope — growth needs a time axis." },
        { text: "Cold Brew generates the most revenue", correct: false, feedback: "Cups are not cash; margins differ per product." },
      ],
      explanation: "The interpretation discipline from this lesson's exercise, one more time: say the measure, say the period, claim nothing outside the encoding.",
    },
  ],
};
