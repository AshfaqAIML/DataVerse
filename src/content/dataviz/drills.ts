/**
 * INTERPRETATION_DRILLS — the Playground's "Interpret" mode bank.
 *
 * Every drill renders a REAL chart from the course's shared datasets and
 * asks what the chart COMMUNICATES — the reading skill, not the building
 * skill. Numbers referenced in explanations are computed from the same
 * data the chart renders (annual coffee totals, revenue deltas, etc.).
 */
import type { ChartSpec, QuizOption } from "@/lib/dataviz/types";
import {
  COFFEE_PRODUCTS,
  COFFEE_Q1,
  COFFEE_Q2,
  COFFEE_Q3,
  COFFEE_Q4,
  CITIES,
  DEPARTMENTS,
  EXPENSES_2024,
  IRIS_PETAL_LENGTH,
  IRIS_SEPAL_LENGTH,
  IRIS_SPECIES,
  REVENUE_2023,
  REVENUE_2024,
  SATISFACTION_BY_DEPT,
  TEMPS,
} from "./datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const coffeeAnnual = COFFEE_PRODUCTS.map(
  (_, i) => COFFEE_Q1[i] + COFFEE_Q2[i] + COFFEE_Q3[i] + COFFEE_Q4[i],
);
const latteShare = Math.round((coffeeAnnual[1] / coffeeAnnual.reduce((a, v) => a + v, 0)) * 100);
const revGrowth = Math.round(((REVENUE_2024[11] - REVENUE_2024[0]) / REVENUE_2024[0]) * 100);
const coldBrewGrowth = Math.round(((COFFEE_Q4[3] - COFFEE_Q1[3]) / COFFEE_Q1[3]) * 100);
const filterGrowth = Math.round(((COFFEE_Q4[2] - COFFEE_Q1[2]) / COFFEE_Q1[2]) * 100);

export interface InterpretationDrill {
  chart: ChartSpec;
  prompt: string;
  options: QuizOption[];
  explanation: string;
}

export const INTERPRETATION_DRILLS: InterpretationDrill[] = [
  {
    chart: {
      type: "bar",
      title: "Cups sold, Q4",
      categories: COFFEE_PRODUCTS,
      series: [{ name: "cups", values: COFFEE_Q4 }],
      showValues: true,
      showLegend: false,
      xLabel: "product",
    },
    prompt: "Which single reading is supported by this chart?",
    options: [
      { text: "Latte sold the most cups in Q4", correct: false, feedback: `Close — Latte sold ${COFFEE_Q4[1]} cups, but look again at Cold Brew: ${COFFEE_Q4[3]}.` },
      { text: "Cold Brew outsold every other product in Q4", correct: true, feedback: `Correct — ${COFFEE_Q4[3]} cups against Latte's ${COFFEE_Q4[1]}.` },
      { text: "Filter is the fastest-growing product", correct: false, feedback: "This chart shows one quarter only — growth needs a time axis. Filter actually declined across the year." },
      { text: "The products sold roughly equal amounts", correct: false, feedback: "The values span 258 to 671 — a 2.6× difference, not 'roughly equal'." },
    ],
    explanation:
      "A single-series bar chart answers ranking questions directly: the tallest bar is the leader. Growth claims need a time dimension this chart does not have — that is the a-03 chart-choice discipline.",
  },
  {
    chart: {
      type: "line",
      title: "Monthly revenue, 2024",
      categories: months,
      series: [{ name: "revenue (k$)", values: REVENUE_2024 }],
      showLegend: false,
      yLabel: "revenue (k$)",
    },
    prompt: "What does the line chart communicate about 2024 revenue?",
    options: [
      { text: "Revenue is flat all year", correct: false, feedback: "The line climbs from 124 to 204 — anything but flat." },
      { text: "Revenue grew steadily all year, with the strongest gains in the final quarter", correct: true, feedback: `Correct — every month is at or above the previous one, and Oct–Dec adds the steepest climbs; the full-year rise is about ${revGrowth}%.` },
      { text: "Revenue fell in the summer", correct: false, feedback: "Jun–Aug holds steady (153 → 151 → 158) — a one-month dip of 2k is noise, not a decline." },
      { text: "December revenue doubled since January", correct: false, feedback: `It grew ~${revGrowth}% — from 124 to 204. 'Doubled' would be 248. Precision matters when reading slopes.` },
    ],
    explanation:
      "Line charts encode change in slope. Reading them means describing trend (up), shape (steady, then accelerating) and magnitude (~65%) — all three, honestly.",
  },
  {
    chart: {
      type: "line",
      title: "Average monthly temperature, four cities",
      categories: months,
      series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
      yLabel: "°C",
    },
    prompt: "Which statement about the four cities is best supported?",
    options: [
      { text: "Singapore has the smallest annual temperature range — its line is nearly flat", correct: true, feedback: "Correct — 27–28 °C all year, a 1-degree band against Oslo's 20-degree swing." },
      { text: "Cairo is the coldest city in winter", correct: false, feedback: "Oslo is — negative months. Cairo never drops below 19." },
      { text: "All four cities peak in July", correct: false, feedback: "Cairo and Singapore are essentially flat in summer; 'peaking' describes the seasonal cities." },
      { text: "Oslo's temperature crosses Cairo's in summer", correct: false, feedback: "Oslo's July high is 17 against Cairo's 33 — the lines never come close." },
    ],
    explanation:
      "Comparing lines is about level, range and shape. Singapore's flatness is range; Oslo's dip below zero is level; the answer that names the right dimension (range) is the one the chart supports.",
  },
  {
    chart: {
      type: "pie",
      title: "Share of annual cups by product",
      categories: COFFEE_PRODUCTS,
      series: [{ name: "annual cups", values: coffeeAnnual }],
      showLegend: false,
    },
    prompt: "What does the pie chart show — and what does it hide?",
    options: [
      { text: `Latte has the largest share (~${latteShare}%), but the chart hides how total sales moved across the year`, correct: true, feedback: `Correct — composition, not change. The pie cannot show that the total grew; only a time series can.` },
      { text: "Latte sales are growing", correct: false, feedback: "A pie of annual totals contains no time axis — growth is invisible here." },
      { text: "Espresso is the smallest slice, so it is shrinking", correct: false, feedback: "Smallest share ≠ shrinking. Filter is the smallest — and it IS shrinking — but the pie alone cannot tell you either." },
      { text: "The four products each hold about a quarter", correct: false, feedback: `The shares run from ~17% to ~${latteShare}% — not quarters.` },
    ],
    explanation:
      "Part-to-whole charts answer 'what fraction?' and nothing else. Confusing share with trend is one of the classic misreadings — the composition-vs-change distinction is a-04's chart-selection spine.",
  },
  {
    chart: {
      type: "histogram",
      title: "Employee satisfaction scores (all departments)",
      values: DEPARTMENTS.flatMap((d) => SATISFACTION_BY_DEPT[d]),
      bins: 9,
      xLabel: "satisfaction (1–10)",
    },
    prompt: "Describe the shape of this distribution.",
    options: [
      { text: "Roughly unimodal and slightly left-skewed, centred near 6", correct: true, feedback: "Correct — one clear peak around 5–6, a longer tail of high scores (7–9) than low ones." },
      { text: "Bimodal — two separate peaks", correct: false, feedback: "The bars rise and fall around a single peak; the 8–9 bar is elevated but connected to the mass around 6." },
      { text: "Uniform — all scores equally common", correct: false, feedback: "The middle bars clearly outweigh the extremes." },
      { text: "Right-skewed with a long low tail", correct: false, feedback: "The tail stretches toward the HIGH scores — that is left skew in the data's values (a-02's histogram lesson untangles this naming)." },
    ],
    explanation:
      "Shape vocabulary — unimodal, skewed, uniform, outlier — is what histograms are FOR. Centre, spread, skew: name all three and the histogram has done its job.",
  },
  {
    chart: {
      type: "bar",
      title: "Filter sales — SAME data, two axes",
      categories: ["Q1", "Q2", "Q3", "Q4"],
      series: [{ name: "cups", values: [COFFEE_Q1[2], COFFEE_Q2[2], COFFEE_Q3[2], COFFEE_Q4[2]] }],
      yFromZero: false,
      showValues: true,
      showLegend: false,
      yLabel: "cups",
    },
    prompt: "This bar chart starts its y-axis at ~250 instead of zero. What is the effect?",
    options: [
      { text: "It makes a modest decline look like a collapse — the visual slope exaggerates the change", correct: true, feedback: `Correct — the drop is ${COFFEE_Q1[2]} → ${COFFEE_Q4[2]} cups (−${Math.abs(filterGrowth)}%), but the truncated axis makes the last bar look a fraction of the first.` },
      { text: "Nothing — the value labels keep the chart honest", correct: false, feedback: "Labels help the careful reader, but the visual impression lands first; the bars' AREAS still lie." },
      { text: "It is fine, because line charts truncate axes all the time", correct: false, feedback: "Truncation is more defensible for lines (rate of change is the message) than bars (length IS the encoding). This is the a-08 honesty rule." },
      { text: "It makes the chart more precise", correct: false, feedback: "Precision comes from the data, not from zooming in. The axis choice changed the impression, not the numbers." },
    ],
    explanation:
      "Bar length is the encoded value — cutting the axis cuts the length's meaning. The same decline honestly drawn (axis from zero) reads as what it is: a real but moderate slide.",
  },
  {
    chart: {
      type: "scatter",
      title: "Iris: petal length vs sepal length",
      points: IRIS_SEPAL_LENGTH.map((x, i) => ({
        x,
        y: IRIS_PETAL_LENGTH[i],
        label: IRIS_SPECIES[i],
      })),
      xLabel: "sepal length (cm)",
      yLabel: "petal length (cm)",
    },
    prompt: "What does the scatter plot reveal?",
    options: [
      { text: "Two distinct clusters — the species separate almost completely on these two measurements", correct: true, feedback: "Correct — setosa sits alone at petal length 1.1–1.7 cm; the versicolor band rises with sepal length. One chart, two species, no legend needed." },
      { text: "A single strong straight-line relationship", correct: false, feedback: "Within each cluster yes, but the gap between clusters means one line would be an honest summary of neither." },
      { text: "No relationship between the two measurements", correct: false, feedback: "Look again: taller sepals travel with taller petals inside each group — a positive within-group relationship." },
      { text: "Measurement error — the isolated group is an artifact", correct: false, feedback: "The setosa cluster is biology, not noise: 20 flowers agreeing is a pattern." },
    ],
    explanation:
      "Scatter plots expose structure that summaries hide: clusters, gaps, correlations within groups. The two-cluster reading IS the famous iris insight.",
  },
  {
    chart: {
      type: "area",
      title: "2024: revenue vs expenses",
      categories: months,
      series: [
        { name: "revenue", values: REVENUE_2024 },
        { name: "expenses", values: EXPENSES_2024 },
      ],
      yLabel: "k$",
    },
    prompt: "In an area chart of revenue over expenses, what does the gap between the two regions represent?",
    options: [
      { text: "Profit — and the gap widens across the year", correct: true, feedback: `Correct — revenue pulls away from expenses every quarter; the December gap (~${REVENUE_2024[11] - EXPENSES_2024[11]}k$) is roughly triple January's.` },
      { text: "Costs — the lower area is what the business spends", correct: false, feedback: "The lower area is expenses, yes, but the QUESTION is about the gap between them — which is revenue minus expenses." },
      { text: "Growth rate", correct: false, feedback: "A gap is a difference in levels, not a rate; the growth rate is encoded in the slopes." },
      { text: "Nothing reliable — area charts cannot compare two series", correct: false, feedback: "Overlapping areas compare reasonably when one contains the other, as here." },
    ],
    explanation:
      "Reading an area chart is reading between regions: the vertical gap is the difference of the two quantities at each x. Here that difference is profit — visibly compounding.",
  },
  {
    chart: {
      type: "grouped-bar",
      title: "Cups by product and quarter",
      categories: ["Q1", "Q2", "Q3", "Q4"],
      series: COFFEE_PRODUCTS.map((p, i) => ({
        name: p,
        values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
      })),
      yLabel: "cups",
    },
    prompt: "Which comparison does the grouped bar make easiest?",
    options: [
      { text: "Tracking each product's quarter-by-quarter trajectory side by side", correct: true, feedback: `Correct — Cold Brew climbs every quarter (+${coldBrewGrowth}% Q1→Q4) while Filter slides, and the pairing makes both visible at once.` },
      { text: "Seeing each quarter's total sales", correct: false, feedback: "Totals are what the STACKED variant shows; grouping trades totals for within-quarter comparison." },
      { text: "Each product's share of the year", correct: false, feedback: "Shares are part-to-whole — a pie or 100% stacked bar's job." },
      { text: "The exact numeric value of every bar", correct: false, feedback: "Bars compare through length; exact values need labels or a table. Charts are for shape first." },
    ],
    explanation:
      "Grouped bars compare a few series across shared categories; stacked bars compare totals and composition; pies show shares. Choosing the variant IS choosing the question — a-03's lesson.",
  },
  {
    chart: {
      type: "line",
      title: "Monthly revenue, 2023 vs 2024",
      categories: months,
      series: [
        { name: "2023", values: REVENUE_2023 },
        { name: "2024", values: REVENUE_2024 },
      ],
      yLabel: "k$",
    },
    prompt: "What is the most precise reading of the two years?",
    options: [
      { text: "2024 is above 2023 in every single month, with the gap widening toward year-end", correct: true, feedback: "Correct — check Jan (124 vs 102) and Dec (204 vs 148): the gap grows from ~22k to ~56k." },
      { text: "The two years are essentially identical", correct: false, feedback: "2024 leads by 20%+ in most months — that is a different year, not the same one." },
      { text: "2023 grew faster than 2024", correct: false, feedback: "Both years grow, but 2024's absolute climb (124→204) outpaces 2023's (102→148)." },
      { text: "Both years peak in summer", correct: false, feedback: "Both peak in December — the seasonal shape is a winter peak, not summer." },
    ],
    explanation:
      "Two lines invite three readings: level (2024 always higher), shape (both rise to a December peak) and gap (widening). The honest reader names which one they are claiming.",
  },
  {
    chart: {
      type: "stacked-bar",
      title: "Quarterly cups, stacked by product",
      categories: ["Q1", "Q2", "Q3", "Q4"],
      series: COFFEE_PRODUCTS.map((p, i) => ({
        name: p,
        values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
      })),
      yLabel: "cups",
    },
    prompt: "What does the stacked bar reveal that the grouped bar of the same data does not?",
    options: [
      { text: "Total sales per quarter — and that the total grows each quarter", correct: true, feedback: "Correct — the column tops rise Q1→Q4; the grouped bar hid the totals entirely." },
      { text: "Which product is largest in each quarter", correct: false, feedback: "That comparison got HARDER — middles of stacks are notoriously hard to rank. Grouped bars do this better." },
      { text: "Each product's share of annual sales", correct: false, feedback: "You would need a 100%-stacked variant for shares; this one keeps absolute values." },
      { text: "Nothing — stacked and grouped bars are interchangeable", correct: false, feedback: "They answer different questions: totals+composition vs within-category comparison. Choosing is the skill." },
    ],
    explanation:
      "Every encoding is a trade: stacking buys totals and composition at the price of segment comparison. The a-03 chart-choice ladder in one picture.",
  },
  {
    chart: {
      type: "bar",
      title: "Satisfaction by department — sorted vs unsorted",
      categories: DEPARTMENTS,
      series: [
        {
          name: "median satisfaction",
          values: DEPARTMENTS.map((d) => {
            const s = [...SATISFACTION_BY_DEPT[d]].sort((a, b) => a - b);
            const mid = Math.floor(s.length / 2);
            return (s[mid - 1] + s[mid]) / 2;
          }),
        },
      ],
      showValues: true,
      sortDesc: true,
      showLegend: false,
      yLabel: "median (1–10)",
    },
    prompt: "The bars are sorted by value. What does sorting buy the reader?",
    options: [
      { text: "Ranking at a glance — the leader and the laggard are the first and last bars", correct: true, feedback: "Correct — Design leads at 8, Support trails at 5, and no scanning of category labels is needed." },
      { text: "It changes the data — sorted bars show higher values", correct: false, feedback: "Same numbers, same scale; only the ORDER of categories changed." },
      { text: "It shows the time trend of satisfaction", correct: false, feedback: "These are departments, not months — sorting cannot create time that is not there." },
      { text: "Nothing — categorical axes should always stay in their original order", correct: false, feedback: "For categories with no natural order, sorting by value is a courtesy; only natural orders (months, sizes) deserve their sequence." },
    ],
    explanation:
      "For unordered categories, sort by value unless the order itself carries meaning. It is the cheapest readability upgrade in the whole craft — a-07's labelling lesson in one move.",
  },
];
