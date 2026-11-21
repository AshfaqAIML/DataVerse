/**
 * PART B · LESSON b-03 — "Bar Charts"
 *
 * ax.bar, ax.barh, grouped bars via x offsets, and ax.bar_label.
 * Code blocks are real matplotlib on the shared coffee and survey
 * numbers; each is paired with a live engine chart of the SAME data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { quantile } from "@/lib/dataviz/aggregate";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4 } from "../datasets";

const medianScore = (values: number[]): number => quantile([...values].sort((a, b) => a - b), 0.5);

const survey = {
  Engineering: [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
  Sales: [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
  Support: [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
  Design: [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
  Ops: [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
};
const byMedian = Object.entries(survey).sort((a, b) => medianScore(b[1]) - medianScore(a[1]));
const deptNames = byMedian.map(([d]) => d);
const deptMedians = byMedian.map(([, v]) => medianScore(v));

export const LESSON_V_B_03: DataVizLesson = {
  slug: "b-03",
  title: "Bar Charts",
  minutes: 25,
  summary:
    "ax.bar for category comparison, ax.barh when names are long, grouped bars through numeric x offsets, and ax.bar_label for values written on the ink.",
  tool: "matplotlib",
  objectives: [
    "Draw vertical bars with ax.bar and label their values with ax.bar_label",
    "Choose horizontal bars (ax.barh) when category names are long or numerous",
    "Build grouped bars by combining np.arange slots with x offsets of a bar width",
    "Read a grouped bar chart both within groups and across groups",
  ],
  why: "Bars are the workhorse of business comparison, but the API hides three separate decisions inside one call: vertical or horizontal, one series or grouped, labels or no labels. Get them wrong and your reader pays — a fifteen-category vertical chart with rotated names is unreadable when barh would have been effortless, and grouped bars demand numeric x offsets that surprise every newcomer. This lesson walks the three decisions in order, on the coffee numbers you already know.",
  blocks: [
    {
      kind: "text",
      text: "A bar encodes a value as a **length** growing from a shared baseline — the encoding Part A ranked just under position, and the reason category comparison is a bar chart's home turf. `ax.bar(categories, values)` draws one bar per category with its length proportional to the value. Unlike a line, the x-axis carries *discrete names*, not a continuous scale.",
    },
    {
      kind: "code",
      title: "Vertical bars with value labels",
      language: "python",
      code: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
cups = [489, 647, 258, 671]

fig, ax = plt.subplots(figsize=(7, 4.5))
bars = ax.bar(products, cups, color="#0d9488", edgecolor="white")
ax.bar_label(bars, padding=3)     # value labels, one call (matplotlib >= 3.4)
ax.set(title="Cups sold in December", ylabel="cups")
plt.show()`,
      note: "ax.bar returns a BarContainer — hand it straight to ax.bar_label and every bar gets its number.",
      produces: "Renders the same four bars with their values written on top, as shown below.",
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
      },
      why: "Length on a shared zero baseline: the ranking (671, 647, 489, 258) lands before the axis is read — the same honest encoding Part A introduced, now drawn by your own code.",
    },
    {
      kind: "text",
      text: "Vertical bars put names **under** the axis, where they compete for width. When category names are long — department names, channel names, sentence-long survey answers — or when there are many of them, flip to horizontal: `ax.barh(categories, values)` turns the baseline vertical, so names read left-to-right at full size. Sorting the categories by value first is the cheapest readability upgrade in the craft.",
    },
    {
      kind: "code",
      title: "Horizontal bars for long names",
      language: "python",
      code: `import matplotlib.pyplot as plt

departments = ["Design", "Engineering", "Sales", "Ops", "Support"]
median_score = [8.0, 7.5, 6.0, 6.0, 5.0]   # medians of the 12 scores each

fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(departments, median_score, color="#0d9488")
ax.set(title="Median satisfaction by department", xlabel="score (1-10)")
ax.invert_yaxis()    # largest bar on top, reading top-down
plt.show()`,
      note: "The list is already sorted by value, so invert_yaxis puts the leader first — for unordered categories, sorting is a courtesy (a-07's labelling lesson).",
      produces:
        "Renders the same five medians — our engine draws vertical bars only, so compare the reading ease: names beside bars beat names crushed under an axis.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Median satisfaction by department (engine view: vertical)",
        categories: deptNames,
        series: [{ name: "median", values: deptMedians }],
        xLabel: "department",
        yLabel: "median score (1-10)",
        showValues: true,
        showLegend: false,
      },
      why: "The same five medians forced vertical: watch 'Engineering' get truncated by the crowded x-axis — exactly the crowding that ax.barh exists to solve. (Medians computed with the course's shared quantile function: 8, 7.5, 6, 6, 5.)",
    },
    { kind: "heading", text: "Grouped bars: comparing within categories" },
    {
      kind: "text",
      text: "To place several series side by side inside each category, you need arithmetic on the x positions: `x = np.arange(n)` creates one numeric slot per category, and each series draws its bars at `x` shifted by a fraction of the bar width `w`. Matplotlib will not do the offsets for you — grouped bars are the first place the numeric machinery under a categorical-looking axis becomes visible.",
    },
    {
      kind: "code",
      title: "Four quarters, four products, one grid",
      language: "python",
      code: `import matplotlib.pyplot as plt
import numpy as np

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
quarters = {
    "Q1": [412, 588, 301, 476],
    "Q2": [438, 612, 286, 542],
    "Q3": [451, 596, 274, 618],
    "Q4": [489, 647, 258, 671],
}

x = np.arange(len(products))   # slots 0, 1, 2, 3
w = 0.2                        # one bar's width

fig, ax = plt.subplots(figsize=(8.5, 4.5))
for i, (q, vals) in enumerate(quarters.items()):
    ax.bar(x + (i - 1.5) * w, vals, w, label=q)
ax.set_xticks(x, products)    # name the slots
ax.set(title="Cups by product and quarter", ylabel="cups")
ax.legend()
plt.show()`,
      note: "The offset (i - 1.5) * w slides four bars of width w around each slot so they sit flush, centered: -1.5w, -0.5w, +0.5w, +1.5w.",
      produces: "Renders the same grouped comparison shown below — four products, four bars each, legend naming the quarters.",
    },
    {
      kind: "chart",
      chart: {
        type: "grouped-bar",
        title: "Cups by product and quarter",
        categories: COFFEE_PRODUCTS,
        series: [
          { name: "Q1", values: COFFEE_Q1 },
          { name: "Q2", values: COFFEE_Q2 },
          { name: "Q3", values: COFFEE_Q3 },
          { name: "Q4", values: COFFEE_Q4 },
        ],
        yLabel: "cups",
      },
      why: "Grouping answers two questions at once: within each product (how do the quarters compare?) and within each quarter (how do the products compare?). The offset arithmetic in the listing is what buys the layout.",
    },
    {
      kind: "interpretation",
      id: "b-03-i1",
      chart: {
        type: "grouped-bar",
        title: "Cups by product and quarter",
        categories: COFFEE_PRODUCTS,
        series: [
          { name: "Q1", values: COFFEE_Q1 },
          { name: "Q2", values: COFFEE_Q2 },
          { name: "Q3", values: COFFEE_Q3 },
          { name: "Q4", values: COFFEE_Q4 },
        ],
        yLabel: "cups",
      },
      prompt: "Four products, four quarters, one grid. Which reading is exact?",
      options: [
        {
          text: "Filter is the only product whose bars step down every quarter — 301, 286, 274, 258 — while Cold Brew climbs from 476 to 671",
          correct: true,
          feedback:
            "Correct — across-group reading (follow one product's four bars) meets the numbers: Filter falls about 14% while Cold Brew gains about 41%.",
        },
        {
          text: "Every product grew every quarter",
          correct: false,
          feedback: "Three of four did; Filter fell in all four quarters, from 301 to 258.",
        },
        {
          text: "Q4 is the weakest quarter overall",
          correct: false,
          feedback: "Q4 is the strongest: the quarterly totals climb 1777, 1878, 1939, 2065.",
        },
        {
          text: "Latte collapsed in Q3",
          correct: false,
          feedback: "Latte dips from 612 to 596 then recovers to 647 — a 16-cup wiggle, not a collapse.",
        },
      ],
      explanation:
        "Grouped bars reward two disciplined readings: within-column (compare the four bars of one product) and across-columns (compare one quarter across products). The exact answer does both and quotes the numbers.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "bar_label, and the restraint it demands",
      text: "`ax.bar_label(bars, padding=3)` writes each bar's value just above it — ideal for a handful of bars. In a dense grouped chart the labels collide with each other and with the legend; there, let the y-axis and gridlines carry the numbers, and reserve bar_label for the simple single-series case.",
    },
    {
      kind: "exercise",
      id: "b-03-e1",
      exerciseKind: "choose-chart",
      prompt:
        "A product manager hands you eighteen marketing channel names — 'Paid search — brand campaigns' is the shortest of them — with one value each, and asks for a chart for a slide. Which construction do you ship?",
      hint: "Eighteen long names under a vertical axis is the failure mode this lesson exists for.",
      options: [
        {
          text: "ax.barh with the channels sorted by value — long labels read horizontally at full size, and eighteen rows scan top to bottom",
          correct: true,
          feedback:
            "Correct — horizontal bars plus a value sort: the leader is the top row and every full name is legible. Two of this lesson's decisions, both right.",
        },
        {
          text: "ax.bar with rotation=90 on the x tick labels",
          correct: false,
          feedback: "Eighteen rotated names make the reader tilt their head per bar — legibility sacrificed to convention.",
        },
        {
          text: "ax.pie with eighteen slices",
          correct: false,
          feedback: "Eighteen slices is a wheel of cheese, not a comparison; angle reading fails well before that count (b-06).",
        },
        {
          text: "A grouped bar chart, channel by month",
          correct: false,
          feedback: "Grouping multiplies 18 categories by 12 months into 216 bars — but the question was one value per channel.",
        },
      ],
      explanation:
        "The vertical-versus-horizontal decision is about label space; the sort decision is about ranking. When names are long and categories many, barh plus a value sort is almost always the answer.",
    },
  ],
  terms: [
    {
      term: "baseline",
      definition: "The shared reference (usually zero) from which bar lengths grow. A bar chart without an intact baseline is shapes, not data — Part A's first honesty rule.",
    },
    {
      term: "grouped bars",
      definition: "Several series drawn side by side within each category, positioned by offsetting numeric x slots by fractions of the bar width.",
    },
    {
      term: "BarContainer",
      definition: "What ax.bar returns: the collection of bar artists, handable to ax.bar_label for automatic value labels.",
    },
  ],
  takeaways: [
    "`ax.bar(categories, values)` draws one length per category from a shared zero baseline; `ax.bar_label(bars)` writes the numbers on the ink.",
    "When names are long or categories many, flip to `ax.barh` — horizontal labels at full size beat rotated labels every time.",
    "Grouped bars are offset arithmetic: `x = np.arange(n)` slots, each series at `x ± k·w`.",
    "Sort unordered categories by value — the cheapest readability upgrade in the whole craft.",
  ],
  quiz: [
    {
      id: "b-03-q1",
      prompt: "Which call draws bars whose baseline is vertical, so long category names read horizontally?",
      options: [
        {
          text: "ax.barh(categories, values)",
          correct: true,
          feedback: "Correct — barh mirrors the layout: names on the y-axis, lengths growing sideways.",
        },
        {
          text: "ax.bar(categories, values, horizontal=True)",
          correct: false,
          feedback: "There is no horizontal argument on ax.bar; the horizontal chart is its own method.",
        },
        {
          text: "ax.bar(categories, values, rotation=90)",
          correct: false,
          feedback: "That rotates tick labels on a still-vertical chart — the names suffer, the layout does not change.",
        },
        {
          text: "ax.plot(categories, values, bar=True)",
          correct: false,
          feedback: "No bar argument exists on plot; lines and bars are different methods for different encodings.",
        },
      ],
      explanation:
        "barh is not a style of bar — it is the same encoding with the axes exchanged, and it exists precisely for the long-label case.",
    },
    {
      id: "b-03-q2",
      prompt: "Why does the grouped-bar recipe start with `x = np.arange(len(categories))` instead of passing the category strings straight to ax.bar?",
      options: [
        {
          text: "Because offsets like x - 1.5 * w need numeric slot positions; you cannot subtract a width from a string",
          correct: true,
          feedback: "Correct — strings position bars but cannot be shifted; numbers can. set_xticks(x, names) restores the labels afterwards.",
        },
        {
          text: "Because matplotlib refuses string categories entirely",
          correct: false,
          feedback: "It accepts them happily for single-series bars; the limit appears only when you need arithmetic on positions.",
        },
        {
          text: "Because np.arange sorts the categories by value",
          correct: false,
          feedback: "arange only makes 0, 1, 2, ...; any sorting is your job, by design.",
        },
        {
          text: "Because the legend requires numeric x",
          correct: false,
          feedback: "The legend reads label= arguments; x positions are not involved.",
        },
      ],
      explanation:
        "Under every categorical-looking axis sits a numeric one. Grouped bars are the first chart where you have to touch that machinery yourself.",
    },
    {
      id: "b-03-q3",
      prompt: "What does `ax.bar_label(bars, padding=3)` do?",
      options: [
        {
          text: "Writes each bar's value just outside its end, nudged 3 points away",
          correct: true,
          feedback: "Correct — one call labels every bar in the container; padding controls the gap.",
        },
        {
          text: "Renames the bars using a list of strings",
          correct: false,
          feedback: "Renaming is tick labels' job (set_xticks / set_xticklabels); bar_label writes values.",
        },
        {
          text: "Draws a box around each bar",
          correct: false,
          feedback: "That is edgecolor on the bars themselves; bar_label adds text, not ink borders.",
        },
        {
          text: "Adds a caption under the whole chart",
          correct: false,
          feedback: "Figure-level captions are not bar_label's job; it is strictly per-bar value text.",
        },
      ],
      explanation:
        "bar_label (matplotlib 3.4+) removes the last excuse for hand-placing text at bar tips — but reserve it for simple charts where labels cannot collide.",
    },
  ],
};
