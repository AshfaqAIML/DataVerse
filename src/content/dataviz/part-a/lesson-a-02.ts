/**
 * PART A · LESSON a-02 — "Why Visualization Matters"
 *
 * The Anscombe lesson. Four datasets, one statistical fingerprint, four
 * unrelated shapes — the strongest argument ever published for looking at
 * raw points before quoting a summary. All four datasets below are the
 * REAL published data from Anscombe, F. J. (1973), "Graphs in Statistical
 * Analysis", The American Statistician 27(1), pp. 17–21.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";

/* ---- Anscombe (1973), Table 1 — the real published numbers --------------- */
const ANS_X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
const ANS_Y_I = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68];
const ANS_Y_II = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74];
const ANS_Y_III = [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73];
/* Dataset IV: one far point at (19, 12.50) plus ten points that all share x = 8. */
const ANS_X_IV = [19, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
const ANS_Y_IV = [12.5, 6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 5.56, 7.91, 6.89];

/* Dataset III rendered with its outlier pulled out as its own colour group. */
const iiiOutlier = { x: ANS_X[2], y: ANS_Y_III[2], label: "the outlier" };
const iiiRest = ANS_X.map((x, i) => (i === 2 ? null : { x, y: ANS_Y_III[i], label: "the other ten" })).filter(
  (p): p is { x: number; y: number; label: string } => p !== null,
);

export const LESSON_V_A_02: DataVizLesson = {
  slug: "a-02",
  title: "Why Visualization Matters",
  minutes: 20,
  summary:
    "Anscombe's quartet: four datasets with the same means, variances, correlation and regression line — and four completely different shapes. The strongest published argument for plotting before summarizing.",
  tool: null,
  objectives: [
    "State what all four quartet datasets share — means 7.50 and 9.0, variance of x 11, r ≈ 0.816, the line y ≈ 3.00 + 0.500x — and why that should terrify a summary-only analyst",
    "Recognize the four shapes the summaries hide: a noisy line, a curve, a clean line plus one outlier, a vertical column with one leveraged point",
    "Explain how a single point can create a correlation that the other ten cannot (leverage)",
    "Adopt the plot-first discipline: look at the raw points before quoting any summary statistic",
  ],
  why: "Every dashboard your team ships reduces thousands of rows to means, correlations and trend arrows — and every one of those numbers is a compression that throws away shape. In 1973 the statistician Francis Anscombe made the cost unforgettable with four tiny datasets: identical means, variances, correlations, even an identical fitted line — and four utterly different realities. If your pipeline summarizes before it plots, this lesson is the reason to change the order.",
  blocks: [
    {
      kind: "text",
      text: "A **summary statistic** is a promise: 'the data looks like this number.' Means, variances, correlations and regression lines all make it, and most of the time the promise holds well enough. The danger is that infinitely many different datasets can keep the same promise. In *Graphs in Statistical Analysis* (1973), Francis Anscombe built four such datasets by hand: eleven points each, chosen so that every statistic a regression report prints is — to two decimal places — **identical** across all four.",
    },
    {
      kind: "table",
      title: "Anscombe's quartet: one fingerprint, four datasets",
      headers: ["Statistic", "Dataset I", "Dataset II", "Dataset III", "Dataset IV"],
      rows: [
        ["Mean of x", "9.0", "9.0", "9.0", "9.0"],
        ["Variance of x", "11.0", "11.0", "11.0", "11.0"],
        ["Mean of y", "7.50", "7.50", "7.50", "7.50"],
        ["Variance of y", "4.13", "4.13", "4.12", "4.12"],
        ["Correlation r", "0.816", "0.816", "0.816", "0.816"],
        ["Fitted line", "y ≈ 3.00 + 0.500x", "y ≈ 3.00 + 0.500x", "y ≈ 3.00 + 0.500x", "y ≈ 3.00 + 0.500x"],
        ["R²", "0.67", "0.67", "0.67", "0.67"],
      ],
      caption:
        "Source: Anscombe, F. J. (1973), *Graphs in Statistical Analysis*, The American Statistician 27(1), 17–21. Any automated report would stamp all four datasets 'moderate positive linear relationship' and move on.",
    },
    {
      kind: "text",
      text: "Read the table as a challenge. Pick a dataset, any dataset — the table cannot tell you which you picked, and cannot tell them apart at all. Now watch what eleven plotted points do to that confident fingerprint.",
    },
    { kind: "heading", text: "Four shapes, one fingerprint" },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Anscombe's quartet, dataset I",
        points: ANS_X.map((x, i) => ({ x, y: ANS_Y_I[i], label: "dataset I" })),
        xLabel: "x",
        yLabel: "y",
        caption: "The honest one: a cloud of points rising left to right, the noisy straight-line relationship the summary promised. r = 0.816 lives here honestly.",
      },
      why: "Position on two shared scales — the top rung of the encoding ladder — lets the eye audit the linear claim the table made: the points do climb, roughly, with scatter.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Anscombe's quartet, dataset II",
        points: ANS_X.map((x, i) => ({ x, y: ANS_Y_II[i], label: "dataset II" })),
        xLabel: "x",
        yLabel: "y",
        caption: "No straight line lives here. y rises with x up to a peak near x = 11 (y = 9.26) then falls away to 3.10 at x = 4 — a curve. Same correlation, 0.816. Same fitted line, y ≈ 3.00 + 0.500x.",
      },
      why: "A linear summary of a curved relationship is not 'approximately right' — it is a claim about shape that the plotted points refute on sight. Only the scatter shows the curvature.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Anscombe's quartet, dataset III",
        points: [iiiOutlier, ...iiiRest],
        xLabel: "x",
        yLabel: "y",
        caption:
          "Ten points (one colour) climb in a tight line from (4, 5.39) to (14, 8.84); a single highlighted point at (13, 12.74) floats about four units above them and drags the fitted line up with it.",
      },
      why: "Splitting the outlier into its own colour group makes the lesson visible: the 'linear-ish' summary is really 'a nearly perfect line, corrupted by one point.' The ten-point fit is y ≈ 4.0 + 0.34x — a different slope and intercept than the table's 3.00 + 0.500x.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Anscombe's quartet, dataset IV",
        points: ANS_X_IV.map((x, i) => ({
          x,
          y: ANS_Y_IV[i],
          label: x === 19 ? "the outlier" : "ten points at x = 8",
        })),
        xLabel: "x",
        yLabel: "y",
        caption:
          "A vertical line of ten points at x = 8 (y from 5.25 to 8.84) and one lonely point at (19, 12.50). There is no 'relationship' here at all — yet the table reports r = 0.816 and a slope of 0.500.",
      },
      why: "With ten of eleven x-values identical, all the slope in the fitted line comes from the single far point. This is leverage made visible — the reason a regression on unexamined data can be a two-point story wearing eleven observations as a costume.",
    },
    {
      kind: "interpretation",
      id: "a-02-i1",
      chart: {
        type: "scatter",
        title: "Anscombe's quartet, dataset IV",
        points: ANS_X_IV.map((x, i) => ({
          x,
          y: ANS_Y_IV[i],
          label: x === 19 ? "the outlier" : "ten points at x = 8",
        })),
        xLabel: "x",
        yLabel: "y",
      },
      prompt:
        "The fitted line for this dataset is y ≈ 3.00 + 0.500x, identical to its three siblings. What is that line actually describing?",
      options: [
        {
          text: "A two-anchor relationship: the ten points at x = 8 pin the line's height (their mean y is 7.00 — exactly the line's value at x = 8), and the single point at (19, 12.50), which sits exactly on the fitted line, supplies all of the slope",
          correct: true,
          feedback:
            "Correct — a relationship needs x to vary, and here only one point varies. The slope 0.500 is the tilt that the one far point buys; remove it and there is no slope to estimate at all.",
        },
        {
          text: "A moderate positive linear relationship spread evenly across all eleven points",
          correct: false,
          feedback:
            "Look again: ten of the eleven points share x = 8. 'Spread across' is what the summary implies and what the plot refutes — the slope is carried by exactly one observation.",
        },
        {
          text: "A weak correlation that the outlier has damaged",
          correct: false,
          feedback:
            "The reverse. Remove the point (19, 12.50) and the correlation vanishes entirely — x never varies among the rest. The outlier CREATES the 0.816; it does not damage it.",
        },
        {
          text: "A computational error — the statistics must be wrong",
          correct: false,
          feedback:
            "The arithmetic is flawless: mean of x 9.0, mean of y 7.50, r 0.816 all check out. What fails is not the math but the summary's silence about shape.",
        },
      ],
      explanation:
        "This is leverage: a point far from the pack in x exerts outsized pull on any fitted line. Dataset IV's regression is, functionally, a line through two anchors — the column's centre (8, 7.00) and the outlier (19, 12.50) — dressed as eleven observations.",
    },
    {
      kind: "text",
      text: "This is the **outlier-detection** dividend of plotting. In dataset III, deleting the single point at (13, 12.74) leaves ten points on almost a perfect line (y ≈ 4.0 + 0.34x) — one data-entry error was quietly rewriting the fitted slope from 0.34 to 0.50. In dataset IV, one point IS the relationship. Neither fact is visible in any mean, variance or correlation: **one point changes the story, and only the plot shows which point**. That is why 'look at your data' is not a slogan but a step in the method.",
    },
    {
      kind: "exercise",
      id: "a-02-e1",
      exerciseKind: "concept-check",
      prompt:
        "Your team's nightly reporting pipeline reduces 200 business metrics to means, variances and correlations in one large table. Given what the quartet just demonstrated, what is the strongest upgrade to the pipeline?",
      options: [
        {
          text: "Render a small scatter or distribution panel for each metric alongside the summaries — four datasets this different can share one fingerprint, and only a plot distinguishes them",
          correct: true,
          feedback:
            "Correct — the table stays as the record; the panels restore the shape information the compression discarded. Plot first, then trust the summaries.",
        },
        {
          text: "Print the summary statistics with more decimal places",
          correct: false,
          feedback: "Precision sharpens the fingerprint, not the picture — the quartet already agrees to two decimals.",
        },
        {
          text: "Add medians and interquartile ranges to the table",
          correct: false,
          feedback:
            "More robust, still compressions: dataset II's curve and dataset IV's leverage survive a median and an IQR completely untouched.",
        },
        {
          text: "Nothing — the table is the objective record and charts are decoration",
          correct: false,
          feedback:
            "The table IS the record, yes — and the quartet is the proof that records can agree while realities differ. Decoration is exactly what a shape-checking panel is not.",
        },
      ],
      hint: "Which artifact in this lesson would have caught all four datasets' differences at a glance?",
      explanation:
        "Numbers summarize by discarding shape; four shapes — line, curve, outlier, leveraged column — all compress to the same fingerprint. A plot per metric is the cheapest audit that cannot be fooled by an agreeable mean.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Plot first",
      text: "Anscombe's point was never that statistics lie — it is that they are **silent about shape**. The professional reflex: before quoting a mean, a correlation or a fitted line, look at the raw points. If four datasets this different can share one fingerprint, a nightly table of 200 metrics can hide anything.",
    },
  ],
  terms: [
    {
      term: "Anscombe's quartet",
      definition: "Four datasets (Anscombe, 1973) with nearly identical summary statistics — means, variances, correlation 0.816, the same fitted line — but radically different shapes: the canonical demonstration that summaries cannot substitute for plots.",
    },
    {
      term: "summary statistic",
      definition: "A single number compressing a dataset — mean, variance, correlation, slope. A compression of shape into magnitude: useful, and silent about everything it discarded.",
    },
    {
      term: "outlier",
      definition: "An observation far from the mass of the data. In a plot, obvious; in a summary, invisible — while still pulling means, slopes and correlations toward itself.",
    },
    {
      term: "leverage",
      definition: "The outsized influence a point far from the pack (usually in x) exerts on a fitted line. Dataset IV's slope of 0.500 exists because one point at (19, 12.50) lets the line tilt.",
    },
  ],
  takeaways: [
    "Identical summary statistics can hide completely different shapes — a line, a curve, an outlier, a leveraged column. Summaries are compressions, and compression discards shape.",
    "One point can create a correlation: in dataset IV the fitted slope hangs entirely on the single point at (19, 12.50); ten identical x-values contribute only a height.",
    "Outlier detection is a plotting dividend: dataset III minus its outlier is a near-perfect line with a different slope and intercept than the full-data fit.",
    "Plot first, then quote the summary — the quartet is the permanent counterexample to 'the numbers look fine, no need to look.'",
  ],
  quiz: [
    {
      id: "a-02-q1",
      prompt: "Anscombe's quartet matters because it proves that:",
      options: [
        { text: "Summary statistics can be identical for datasets with completely different shapes", correct: true, feedback: "The whole lesson in one line: means, variances, correlation and even the fitted line agree — the shapes do not." },
        { text: "Correlation should never be computed", correct: false, feedback: "Correlation is fine — as long as a plot has confirmed the relationship it summarizes is actually there and roughly linear." },
        { text: "Small datasets are unreliable", correct: false, feedback: "Eleven points was enough for Anscombe's point — the issue is summarizing without looking, not sample size." },
        { text: "Regression lines are always wrong",        correct: false, feedback: "The lines are arithmetically correct; they are misleading summaries of shapes they were never shown." },
      ],
      explanation: "The quartet is a compression paradox: the summary is a many-to-one mapping, so identical summaries cannot certify identical realities.",
    },
    {
      id: "a-02-q2",
      prompt: "In dataset III, remove the single outlier at (13, 12.74). The remaining ten points are:",
      options: [
        { text: "Almost exactly on a straight line (y ≈ 4.0 + 0.34x) — a different relationship than the full-data fit suggests", correct: true, feedback: "The ten points run tightly from (4, 5.39) to (14, 8.84); one point was silently rewriting slope and intercept." },
        { text: "Scattered randomly with no pattern", correct: false, feedback: "Look at the plotted panel: the ten same-coloured points climb in a tight, near-perfect line." },
        { text: "Still best described by y ≈ 3.00 + 0.500x", correct: false, feedback: "That line fits all ELEVEN points; the ten-point fit is y ≈ 4.0 + 0.34x — a visibly shallower, higher line." },
        { text: "Curved, like dataset II", correct: false, feedback: "Curvature is dataset II's signature; dataset III minus its outlier is the most linear object in the whole quartet." },
      ],
      explanation: "This is the outlier's real cost: not the point itself, but the silent rewrite of every summary computed on top of it.",
    },
    {
      id: "a-02-q3",
      prompt: "Dataset IV's fitted slope of 0.500 exists because:",
      options: [
        { text: "Ten points share x = 8, so only the single point at (19, 12.50) can let the line tilt — it supplies the entire slope", correct: true, feedback: "Leverage in its purest form: the slope is a two-point story (the column's centre and the far point) wearing eleven observations." },
        { text: "All eleven points rise steadily with x", correct: false, feedback: "Ten points cannot rise with x — they all have the same x. Only one point varies at all." },
        { text: "The y-values are unusually large", correct: false, feedback: "The y-values (5.25–12.50) are unremarkable; it is the x-geometry that hands one point all the influence." },
        { text: "The correlation would survive removing any single point", correct: false, feedback: "Remove (19, 12.50) and r is undefined — with every x equal to 8 there is no co-variation left to measure." },
      ],
      explanation: "Slope needs variation in x. When ten of eleven x-values are identical, the fitted slope measures one point's pull, not a trend.",
    },
  ],
};
