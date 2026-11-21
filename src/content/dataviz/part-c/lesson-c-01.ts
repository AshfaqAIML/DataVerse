/**
 * PART C · LESSON c-01 — "Statistical Visualization"
 *
 * The seaborn preamble: what the library adds over raw matplotlib
 * (DataFrames in, statistics computed) and the figure-level vs
 * axes-level distinction that organises everything else in this part.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  COFFEE_PRODUCTS,
  COFFEE_Q1,
  COFFEE_Q2,
  COFFEE_Q3,
  COFFEE_Q4,
  DEPARTMENTS,
  SATISFACTION_BY_DEPT,
} from "../datasets";

const annualCups = COFFEE_PRODUCTS.map(
  (_, i) => COFFEE_Q1[i] + COFFEE_Q2[i] + COFFEE_Q3[i] + COFFEE_Q4[i],
);
const allScores = DEPARTMENTS.flatMap((d) => SATISFACTION_BY_DEPT[d]);
const nAt6 = allScores.filter((v) => v === 6).length;
const nHigh = allScores.filter((v) => v >= 8).length;
const nLow = allScores.filter((v) => v <= 4).length;
const nSevenUp = allScores.filter((v) => v >= 7).length;

export const LESSON_V_C_01: DataVizLesson = {
  slug: "c-01",
  title: "Statistical Visualization",
  minutes: 20,
  summary:
    "What seaborn actually adds over matplotlib: hand it a DataFrame of raw rows and it computes the statistic before it draws. Plus the one distinction that organises the whole library — figure-level dispatchers vs axes-level plotters.",
  tool: "seaborn",
  objectives: [
    "Explain the division of labour: matplotlib draws marks, seaborn computes statistics from raw rows",
    "Distinguish figure-level functions (relplot, displot, catplot) from their axes-level members",
    "Build a long-form DataFrame and let sns.barplot aggregate it with estimator=",
    "Choose the right family for a job: faceting with col= versus composing into an existing figure",
  ],
  why: "You already know how to draw a bar chart. What you have been doing manually — counting scores into bins, summing quarters into annual totals, averaging responses per group — is exactly the work seaborn takes over. Every matplotlib chart you have written started with 'first compute the numbers, then hand them over'; seaborn's contract is 'hand over the raw rows and say which statistic you want'. That shift is small in code and enormous in practice: the aggregation travels with the chart, so the numbers and the picture can no longer drift apart.",
  blocks: [
    {
      kind: "text",
      text: "A **matplotlib** bar chart wants finished numbers. `plt.bar(products, annual)` draws four rectangles whose heights you computed yourself, somewhere, earlier — and nothing checks that those heights still match the data. **Seaborn**'s contract is different: you hand it a DataFrame of *raw observations*, name the columns, and it computes the statistic *inside the plot call*. `sns.barplot(data=coffee, x=\"product\", y=\"cups\", estimator=\"sum\")` receives 16 product-quarter rows and produces annual totals nobody had to pre-compute. The chart and the computation become one statement.",
    },
    {
      kind: "code",
      title: "The matplotlib way — you are the statistician",
      language: "python",
      code: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
quarters = [
    [412, 588, 301, 476],   # Q1
    [438, 612, 286, 542],   # Q2
    [451, 596, 274, 618],   # Q3
    [489, 647, 258, 671],   # Q4
]

# Step 1: YOU aggregate quarters into annual totals
annual = [q1 + q2 + q3 + q4 for q1, q2, q3, q4 in zip(*quarters)]

# Step 2: matplotlib draws exactly the four numbers it is given
plt.bar(products, annual)
plt.ylabel("cups (2024)")
plt.show()`,
      note: "Nothing is wrong with this code — but the aggregation lives in your head (and your script), not in the chart.",
      produces:
        "A bar chart of 2024 annual cups — after you computed the four totals (1790, 2443, 1119, 2307) yourself in step 1.",
    },
    {
      kind: "code",
      title: "The seaborn way — the DataFrame is the input",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

# Long form: one row per OBSERVATION (product x quarter) = 16 rows
coffee = pd.DataFrame({
    "product": ["Espresso"] * 4 + ["Latte"] * 4 + ["Filter"] * 4 + ["Cold Brew"] * 4,
    "quarter": ["Q1", "Q2", "Q3", "Q4"] * 4,
    "cups": [412, 438, 451, 489,    # Espresso, Q1..Q4
             588, 612, 596, 647,    # Latte
             301, 286, 274, 258,    # Filter
             476, 542, 618, 671],   # Cold Brew
})

# One statement: statistic + chart
sns.barplot(data=coffee, x="product", y="cups", estimator="sum")`,
      note: "The 16 rows are the same numbers as above — but seaborn did the summing, and each bar also carries a bootstrap confidence whisker for its total.",
      produces:
        "The same four bars, computed by seaborn from the 16 raw rows — plus a 95% bootstrap CI whisker on each bar that matplotlib never offered you.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Annual cups by product, 2024",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: annualCups }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        sortDesc: true,
      },
      why: "Identical ink either way — Latte leads at 2443 cups, Filter trails at 1119. The difference is entirely in *who computed the statistic*: you in the matplotlib version, the plotting library in the seaborn version. That is the whole pitch.",
    },
    {
      kind: "heading",
      text: "Figure-level vs axes-level",
    },
    {
      kind: "text",
      text: "Seaborn's plotting functions come in two storeys. The **figure-level dispatchers** — `sns.relplot`, `sns.displot`, `sns.catplot` — create their own figure, return a `FacetGrid`, and accept `col=` / `row=` to split into small panels. The **axes-level members** — `sns.scatterplot`, `sns.lineplot`, `sns.histplot`, `sns.kdeplot`, `sns.boxplot`, `sns.barplot`, and the rest — draw onto whatever matplotlib axes you point them at (or the current one). Rule of thumb: if you plan to *facet*, start figure-level; if you plan to *compose* several charts into one custom matplotlib figure, use the axes-level members with `ax=`.",
    },
    {
      kind: "table",
      title: "The three families and their two storeys",
      headers: ["Family", "Figure-level entry", "Axes-level members", "The superpower"],
      rows: [
        ["Relationships", "sns.relplot", "sns.scatterplot, sns.lineplot", "col=/row= faceting built in"],
        ["Distributions", "sns.displot", "sns.histplot, sns.kdeplot, sns.ecdfplot", "swap kind= without learning new syntax"],
        ["Categorical", "sns.catplot", "sns.boxplot, sns.violinplot, sns.stripplot, sns.swarmplot, sns.barplot", "one interface, many kinds"],
      ],
      caption:
        "The dispatcher builds its own figure and returns a FacetGrid; the members plot onto any axes. Everything in Part C is one of these two shapes.",
    },
    {
      kind: "code",
      title: "A figure-level distribution call",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

scores = {
    "Engineering": [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
    "Sales":       [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
    "Support":     [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
    "Design":      [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
    "Ops":         [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
}
survey = pd.DataFrame(
    [(dept, s) for dept, ss in scores.items() for s in ss],
    columns=["department", "satisfaction"],
)   # 60 rows: one per employee response

sns.displot(data=survey, x="satisfaction", bins=7, kde=True)`,
      note: "Sixty raw scores in, histogram + KDE out — the binning and the smoothing are seaborn's work. Add col=\"department\" and the same call becomes five panels.",
      produces:
        "A histogram of all 60 satisfaction scores in seven unit-wide bins, with a KDE curve laid over it — no counting loop, no precomputed frequencies.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Employee satisfaction, all 60 responses",
        values: allScores,
        bins: 7,
        xLabel: "satisfaction (1-10)",
        yLabel: "count",
      },
      why: "The same 60 rows the DataFrame holds: the peak sits at 6 (16 responses), a single 3 at the bottom edge, and a solid shelf of 16 responses at 8-9. You asked for a distribution of a column; the counting happened inside the call.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Which storey do I reach for?",
      text: "Need `col=` or `row=` (the same chart split across groups)? **Figure-level** — that is their exclusive privilege. Need to place a chart inside your own matplotlib composition (`fig, ax = plt.subplots(...)` then `sns.histplot(..., ax=ax)`)? **Axes-level**. When in doubt, start figure-level and drop down when you need control.",
    },
    {
      kind: "interpretation",
      id: "c-01-i1",
      chart: {
        type: "histogram",
        title: "Employee satisfaction, all 60 responses",
        values: allScores,
        bins: 7,
        xLabel: "satisfaction (1-10)",
        yLabel: "count",
      },
      prompt: "Read this histogram of the 60 survey responses. Which statement does it support exactly?",
      options: [
        {
          text: "The typical response is a 6 (16 of 60), scores span 3-9 with a single 3, and high scores (8-9: 16 responses) far outnumber the low tail (3-4: 5 responses)",
          correct: true,
          feedback: `Correct — centre (6), spread (3-9), and skew (16 responses at 8-9 against ${nLow} at 3-4): the full distribution reading, with counts.`,
        },
        {
          text: "Most employees are dissatisfied with their job",
          correct: false,
          feedback: `Only ${nLow} of 60 responses sit at 3-4, while ${nSevenUp} are 7 or above — the data points the other way, and 'dissatisfied' is a label the 1-10 scale does not carry by itself.`,
        },
        {
          text: "Every department scored roughly the same",
          correct: false,
          feedback: "This histogram pools all 60 responses — department differences are invisible until you split by hue or facet (c-03 does exactly that).",
        },
        {
          text: "The distribution is uniform — all scores equally common",
          correct: false,
          feedback: `The bars run 1, 4, 12, 16, 11, 10, 6 from score 3 to 9 — a clear peak at 6, nothing like a flat profile.`,
        },
      ],
      explanation:
        "A distribution claim names centre, spread and shape. Here: centre 6, spread 3-9, one peak with a healthy high shelf — and 27 of 60 responses at 7 or above, which no average alone would have told you.",
    },
    {
      kind: "exercise",
      id: "c-01-e1",
      exerciseKind: "choose-chart",
      prompt:
        "You want the satisfaction histogram again, but split into one small panel per department — five panels side by side. Which function do you call, and why?",
      options: [
        {
          text: "sns.displot(data=survey, x=\"satisfaction\", col=\"department\") — figure-level, because col= faceting is the dispatchers' job",
          correct: true,
          feedback: "Correct — one extra keyword turns the single histogram into five. That is the figure-level superpower in action.",
        },
        {
          text: "sns.histplot(data=survey, x=\"satisfaction\", col=\"department\")",
          correct: false,
          feedback: "histplot is axes-level — it has no col= parameter. You would have to loop over departments and manage five axes yourself.",
        },
        {
          text: "sns.catplot(data=survey, x=\"satisfaction\", col=\"department\")",
          correct: false,
          feedback: "catplot needs a y (or a count scenario); satisfaction is a single numeric column you want the *distribution* of — that is displot's family.",
        },
        {
          text: "sns.relplot(data=survey, x=\"satisfaction\", y=\"department\")",
          correct: false,
          feedback: "relplot is for relationships between two numeric variables (or a numeric over time) — not the shape of one column.",
        },
      ],
      explanation:
        "Panel-splitting (col=/row=) belongs to the figure-level dispatchers: relplot, displot, catplot. Choose the family by the question, then let col= multiply it.",
    },
  ],
  terms: [
    {
      term: "long-form data",
      definition:
        "One row per observation (a product-quarter, an employee response) rather than one row per group with precomputed values. Seaborn's native diet.",
    },
    {
      term: "figure-level function",
      definition:
        "relplot, displot, catplot: create their own figure, return a FacetGrid, and accept col=/row= for small-multiples grids.",
    },
    {
      term: "axes-level function",
      definition:
        "scatterplot, histplot, boxplot and siblings: draw onto an existing matplotlib axes, composable with anything matplotlib can do.",
    },
    {
      term: "estimator",
      definition:
        "The statistic seaborn computes per group before drawing — \"mean\" by default for bars and aggregated lines, \"sum\", \"median\" or any callable on request.",
    },
  ],
  takeaways: [
    "Matplotlib draws the numbers you computed; seaborn computes the statistic from raw rows inside the plot call.",
    "Three families organise the library: relplot (relationships), displot (distributions), catplot (categorical comparisons).",
    "Figure-level dispatchers facet with col=/row=; axes-level members compose into your own matplotlib figures.",
    "Long form — one row per observation — is the shape every seaborn function expects.",
  ],
  quiz: [
    {
      id: "c-01-q1",
      prompt: "In one sentence: what does seaborn do that plt.bar does not?",
      options: [
        { text: "It accepts a DataFrame of raw observations and computes the plotted statistic itself", correct: true, feedback: "Correct — estimator= is the whole pitch: the aggregation travels with the chart." },
        { text: "It renders bars at a higher resolution", correct: false, feedback: "Both draw rectangles in the same vector graphics — resolution is identical." },
        { text: "It removes the need to understand your data before plotting", correct: false, feedback: "The reverse: it makes the statistic explicit, so you must know which one you asked for." },
        { text: "It exports charts to more file formats", correct: false, feedback: "Export goes through matplotlib either way — file formats are not the difference." },
      ],
      explanation:
        "plt.bar wants finished heights; sns.barplot wants raw rows plus an estimator. The numbers and the picture can no longer drift apart, because there is only one statement.",
    },
    {
      id: "c-01-q2",
      prompt: "Which statement about the two storeys of seaborn functions is correct?",
      options: [
        { text: "relplot, displot and catplot are figure-level: they build their own figure and accept col=/row=; scatterplot, histplot and boxplot draw onto existing axes", correct: true, feedback: "Correct — dispatcher vs member: faceting privilege vs composability." },
        { text: "Figure-level functions are faster to execute", correct: false, feedback: "Performance is not the distinction — organisation of the API is." },
        { text: "Axes-level functions cannot style their colors", correct: false, feedback: "Both storeys take palette and color arguments — styling is orthogonal to the split." },
        { text: "Figure-level functions are deprecated in favor of axes-level ones", correct: false, feedback: "Both are current and recommended — for different jobs." },
      ],
      explanation:
        "The split is about control: figure-level buys you faceting for free; axes-level buys placement inside any matplotlib composition. Know which job you have.",
    },
    {
      id: "c-01-q3",
      prompt: 'Each row of the coffee DataFrame handed to sns.barplot(data=coffee, x="product", y="cups", estimator="sum") is…',
      options: [
        { text: "One product-quarter observation — 16 rows, and seaborn sums the four quarters per product", correct: true, feedback: "Correct — long form: the rows are raw; the sum is the estimator's job." },
        { text: "One product per row, already holding its annual total", correct: false, feedback: "Then estimator=\"sum\" would be pointless — the whole point is raw rows in." },
        { text: "One pixel of the finished chart", correct: false, feedback: "Rows are data, not ink — rendering happens after aggregation." },
        { text: "One quarter per row, holding all four products' cups", correct: false, feedback: "Either orientation can be long form; here each row is one product in one quarter." },
      ],
      explanation:
        "Long form means one observation per row: a product, a quarter, a cup count. The estimator collapses rows per product into the bar height.",
    },
  ],
};
