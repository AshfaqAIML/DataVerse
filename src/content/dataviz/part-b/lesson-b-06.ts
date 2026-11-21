/**
 * PART B · LESSON b-06 — "Pie Charts"
 *
 * ax.pie with autopct and startangle — and the honest range of the
 * pie: when it works, when it fails, and the bar chart you owe the
 * reader once it fails. Annual coffee totals are the shared data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4 } from "../datasets";

/** Annual cups per product: the four quarters summed. */
const annualCups = COFFEE_PRODUCTS.map(
  (_, i) => COFFEE_Q1[i] + COFFEE_Q2[i] + COFFEE_Q3[i] + COFFEE_Q4[i],
);

export const LESSON_V_B_06: DataVizLesson = {
  slug: "b-06",
  title: "Pie Charts",
  minutes: 20,
  summary:
    "ax.pie with autopct and startangle — and the honest range of the pie chart, plus the bar chart you owe your reader the moment the range is left.",
  tool: "matplotlib",
  objectives: [
    "Draw a pie with ax.pie and label its slices with autopct percentages",
    "Orient the chart with startangle and counterclock",
    "State the pie chart's legitimate range — and recognize the three classic abuses",
    "Redesign an out-of-range pie as a sorted bar chart of the same data",
  ],
  why: "The pie chart is the most requested and most abused chart in business decks: readers love circles, and precisely because the slices look so tidy, angle perception's weaknesses get waived through. Used inside its narrow legitimate range — a handful of parts, clearly different shares, no cross-chart comparison — ax.pie is honest and fast. This lesson teaches the syntax (autopct, startangle), the range, and the redesign you owe your reader the moment a pie leaves it.",
  blocks: [
    {
      kind: "text",
      text: "A pie encodes each part's share of a total as an **angle** — the slices are fractions of 360 degrees and must sum to a whole. `ax.pie(values, labels=names)` draws one slice per value. That is the entire grammar, and also the boundary of the chart: it can answer *what fraction?* and nothing else — not how big the total is, not how the shares moved, not which slice changed.",
    },
    {
      kind: "code",
      title: "The annual shares",
      language: "python",
      code: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
annual_cups = [1790, 2443, 1119, 2307]   # the four quarters, summed

fig, ax = plt.subplots(figsize=(6, 6))
ax.pie(annual_cups, labels=products,
       autopct="%1.0f%%",      # write the rounded share on each slice
       startangle=90,          # first slice starts at 12 o'clock
       counterclock=False)     # ...and runs clockwise
ax.set_title("Share of annual cups by product")
plt.show()`,
      note: "autopct is a format string applied to each share: %1.0f%% rounds to whole percent, %1.1f%% keeps one decimal.",
      produces:
        "Renders the same four slices shown below — Latte 32%, Cold Brew 30%, Espresso 23%, Filter 15%, drawn clockwise from 12 o'clock.",
    },
    {
      kind: "chart",
      chart: {
        type: "pie",
        title: "Share of annual cups by product",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "annual cups", values: annualCups }],
        showLegend: false,
        caption: "Clockwise from 12 o'clock: Espresso (23%), Latte (32%), Filter (15%), Cold Brew (30%).",
      },
      why: "Four parts, clearly different shares, one meaningful whole — inside the pie's legitimate range. The percentages render inside the slices exactly as autopct writes them.",
    },
    {
      kind: "text",
      text: "Two cosmetic arguments finish the syntax. `startangle=90` rotates where the first slice begins (cosmetic, but a pie that starts its largest slice at 12 o'clock reads better); `counterclock=False` makes the slices run clockwise, which is how most business readers expect a clock-like chart to turn. Neither touches the data — they are orientation, not information.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "When NOT to reach for the pie",
      text: "Three failures are classics. **Too many parts**: past about five slices, angle comparison collapses — readers cannot rank 14% against 17% by eye. **Sliver slices**: shares under roughly 5% become unreadable threads. **Side-by-side pies**: humans compare angles *within* one circle, not across two — 'this year vs last year' as twin pies is a comparison the reader cannot actually perform. In all three cases the fix is the same: a bar chart.",
    },
    { kind: "heading", text: "The honest alternative" },
    {
      kind: "code",
      title: "Same data, lengths instead of angles",
      language: "python",
      code: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
annual_cups = [1790, 2443, 1119, 2307]

fig, ax = plt.subplots(figsize=(7, 4.5))
bars = ax.bar(products, annual_cups, color="#0d9488", edgecolor="white")
ax.bar_label(bars, padding=3)
ax.set(title="Annual cups by product", ylabel="cups")
plt.show()`,
      note: "Length on a shared baseline is a stronger encoding than angle — Part A's ladder, now a redesign decision you make on purpose.",
      produces: "Renders the same four annual totals as bars with value labels, shown below — sorted by the engine so the ranking is the first thing you read.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Annual cups by product",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "annual cups", values: annualCups }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        sortDesc: true,
      },
      why: "The same 7,659 cups as the pie, re-encoded: now the differences (2,443 against 1,119 — better than 2 to 1) are lengths, which the eye ranks far more precisely than angles.",
    },
    {
      kind: "interpretation",
      id: "b-06-i1",
      chart: {
        type: "pie",
        title: "Share of annual cups by product",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "annual cups", values: annualCups }],
        showLegend: false,
        caption: "Clockwise from 12 o'clock: Espresso (23%), Latte (32%), Filter (15%), Cold Brew (30%).",
      },
      prompt: "Clockwise from 12 o'clock the slices run Espresso, Latte, Filter, Cold Brew. Which claim does this pie support exactly?",
      options: [
        {
          text: "Latte holds the largest share of the year's cups (32%), Cold Brew is close behind (30%), and Filter is the smallest (15%)",
          correct: true,
          feedback:
            "Correct — measure (share of annual cups), ranking (32 > 30 > 23 > 15), and nothing more. That is the whole honest claim.",
        },
        {
          text: "Latte sales are growing",
          correct: false,
          feedback: "Annual totals carry no time axis — share is not trend. (Latte in fact grew from 588 to 647 cups per quarter-end, but no pie can say so.)",
        },
        {
          text: "Latte sold about twice as many cups as Espresso",
          correct: false,
          feedback: "2,443 against 1,790 is 1.4 to 1; the shares are 32% versus 23% — 'twice' overstates by half.",
        },
        {
          text: "The four products each hold roughly a quarter of sales",
          correct: false,
          feedback: "The shares run from 15% to 32% — a range of more than 2 to 1, not four equal quarters.",
        },
      ],
      explanation:
        "The pie's honest vocabulary is fractions of one whole. Claim shares, rankings of shares — and stop. Trends, totals and causes all live outside this chart's grammar.",
    },
    {
      kind: "table",
      title: "Pie or bar? Ask the question first",
      headers: ["The reader's question", "The chart that answers it"],
      rows: [
        ["What fraction of the whole is each part?", "Pie (few parts, clear differences)"],
        ["Which part is bigger, and by how much?", "Bar — length beats angle for differences"],
        ["How did the shares move over time?", "Neither — stacked bars across periods"],
        ["Is the total itself growing?", "Never a pie — a line or bar of the totals"],
      ],
      caption: "Part A's chart-choice ladder, specialized: the pie owns exactly one row of this table.",
    },
    {
      kind: "exercise",
      id: "b-06-e1",
      exerciseKind: "critique",
      prompt:
        "A slide shows a pie with nine slices: three are under 4%, two slices are pulled out with explode, and a second pie beside it shows last year 'for comparison'. Name the three distinct problems and the redesign you would ship instead.",
      hint: "Count the slices, question the explosion, and try to actually compare the two circles.",
      options: [
        {
          text: "Nine slices exceed angle perception's limit; exploded slices distort by moving area without encoding anything; two pies cannot be compared because angles are read within one circle — replace both with one sorted bar chart per year, or grouped bars",
          correct: true,
          feedback:
            "Correct — three failures, one fix family. Sorted bars restore length encoding and let the years be compared on a shared axis.",
        },
        {
          text: "Only the explode is a problem — pull the slices back in and the pie is fine",
          correct: false,
          feedback: "Un-exploding fixes one distortion; nine slices and the twin-pie comparison remain broken.",
        },
        {
          text: "The pies are fine because percentages are printed on the slices",
          correct: false,
          feedback: "Printed numbers rescue precision, not perception — the visual impression still misleads, and nobody reads nine labels.",
        },
        {
          text: "Replace it with a table of nine rows and two columns",
          correct: false,
          feedback: "A table is precise but loses the visual ranking entirely; the sorted bar keeps both.",
        },
      ],
      explanation:
        "This critique is the pie lesson in one exercise: count the parts, distrust decoration, and never ask angles to do comparison work across circles.",
    },
    {
      kind: "callout",
      tone: "success",
      title: "The pie's two legitimate moments",
      text: "Use a pie when the shares **are** the story (budget fractions, market split), the parts are few (two to five), the shares are visibly different, and the total itself is either obvious or unimportant. A donut — the same chart with a hole — additionally leaves room for the total in the center.",
    },
  ],
  terms: [
    {
      term: "part-to-whole",
      definition: "The one relationship a pie encodes: each slice's angle is its share of a total that is itself meaningful.",
    },
    {
      term: "autopct",
      definition: "ax.pie's format-string argument that writes each slice's percentage inside it, e.g. autopct=\"%1.0f%%\" for whole percents.",
    },
    {
      term: "startangle",
      definition: "The degree at which the first slice begins, measured from the positive x-axis. startangle=90 puts it at 12 o'clock.",
    },
  ],
  takeaways: [
    "`ax.pie(values, labels=..., autopct=\"%1.0f%%\")` draws shares of a whole; `startangle` and `counterclock` orient it.",
    "The pie answers *what fraction?* — never how much in total, never how shares moved.",
    "Past about five slices, or under about 5% each, or in side-by-side comparison: redesign as a sorted bar chart.",
    "Angle perception is weaker than length perception — the bar is the pie's honest default replacement.",
  ],
  quiz: [
    {
      id: "b-06-q1",
      prompt: "What does `autopct=\"%1.0f%%\"` do in an ax.pie call?",
      options: [
        {
          text: "Writes each slice's share as a rounded whole percentage inside the slice",
          correct: true,
          feedback: "Correct — 2443/7659 becomes 32%, stamped on the slice itself.",
        },
        {
          text: "Rounds the data values before drawing the slices",
          correct: false,
          feedback: "The slices use the exact values; only the printed percentage is rounded.",
        },
        {
          text: "Sets the pie's starting angle to 0 degrees",
          correct: false,
          feedback: "That is startangle's job; autopct is purely about the printed labels.",
        },
        {
          text: "Sorts the slices from largest to smallest",
          correct: false,
          feedback: "Slice order follows your data's order; sorting, if wanted, is your job before the call.",
        },
      ],
      explanation:
        "autopct is a printf-style format string applied to each share — the same % syntax Python's string formatting uses.",
    },
    {
      id: "b-06-q2",
      prompt: "Which task is squarely inside the pie chart's legitimate range?",
      options: [
        {
          text: "Showing that a budget of four visible parts splits 45 / 25 / 20 / 10",
          correct: true,
          feedback: "Correct — few parts, clearly different shares, and the fractions ARE the story.",
        },
        {
          text: "Comparing this year's shares against last year's",
          correct: false,
          feedback: "Angles are compared within one circle, never across two — twin pies are a classic failure.",
        },
        {
          text: "Ranking eleven product lines by revenue",
          correct: false,
          feedback: "Eleven slices break angle perception; a sorted bar is the honest tool.",
        },
        {
          text: "Showing how the total grew across four quarters",
          correct: false,
          feedback: "A pie of one period's shares hides the total entirely; growth needs a time axis.",
        },
      ],
      explanation:
        "The pie's range is narrow on purpose: fractions of one whole, few parts, clear differences. Everything else belongs to bars or lines.",
    },
    {
      id: "b-06-q3",
      prompt: "What do `startangle=90` and `counterclock=False` accomplish together?",
      options: [
        {
          text: "The first slice begins at 12 o'clock and the slices proceed clockwise",
          correct: true,
          feedback: "Correct — orientation only; the shares themselves are untouched.",
        },
        {
          text: "The largest slice is automatically moved to the top",
          correct: false,
          feedback: "Order follows your data — sorting is your job before ax.pie sees the values.",
        },
        {
          text: "The percentages are drawn outside the slices",
          correct: false,
          feedback: "Label placement is autopct and labeldistance; these two arguments aim the geometry.",
        },
        {
          text: "The slices are drawn counter-clockwise from 3 o'clock",
          correct: false,
          feedback: "That is the default with neither argument; these two together do the opposite.",
        },
      ],
      explanation:
        "Orientation arguments are styling: they change where the eye enters the chart, which matters for reading — but encode nothing.",
    },
  ],
};
