/**
 * PART A · LESSON a-04 — "Data Types and Chart Selection"
 *
 * Measurement levels (nominal / ordinal / interval / ratio) as a pre-flight
 * checklist for encodings: nominal→hue, ordinal→ordered lightness,
 * ratio→length/position. Bar-for-counts vs histogram-for-continuous;
 * discrete vs continuous time. Uses the survey and temperature datasets.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { CITIES, DEPARTMENTS, SATISFACTION_BY_DEPT, TEMPS } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Median satisfaction per department (an ordinal-safe statistic). */
const medians = DEPARTMENTS.map((d) => {
  const s = [...SATISFACTION_BY_DEPT[d]].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return (s[mid - 1] + s[mid]) / 2;
});
const allScores = DEPARTMENTS.flatMap((d) => SATISFACTION_BY_DEPT[d]);

export const LESSON_V_A_04: DataVizLesson = {
  slug: "a-04",
  title: "Data Types and Chart Selection",
  minutes: 20,
  summary:
    "Nominal, ordinal, interval, ratio — the four measurement levels decide which encodings are honest before any aesthetics begin. Hue for names, ordered lightness for ranks, length and position for true magnitudes.",
  tool: null,
  objectives: [
    "Classify a column as nominal, ordinal, interval or ratio — and say what claims that level permits",
    "Match data type to encoding channel: nominal→hue, ordinal→ordered lightness, ratio→length/position",
    "Distinguish bar-for-counts (separate categories, gaps) from histogram-for-continuous (contiguous bins, no gaps)",
    "Recognize discrete vs continuous time and what connecting the dots honestly means",
  ],
  why: "Before you choose a chart, the data has already constrained you. A column of city names cannot be averaged and has no order to imply; a column of temperatures has no true zero, so 'twice as hot' is meaningless; a column of cups sold has both. Encodings that ignore these facts produce charts that quietly promise arithmetic the data cannot deliver — rainbow hues ranking months, bars implying that 20 °C is double 10 °C. This lesson gives you the four levels of measurement as a pre-flight checklist: type first, chart second.",
  blocks: [
    {
      kind: "text",
      text: "Two columns arrive on your desk: **city** (`Lisbon`, `Oslo`, `Cairo`…) and **cups sold** (`489`, `258`…). Both fit in a table, both can be 'charted' — but they are different *kinds* of thing. City is a name: unordered, unaveragable, arithmetic-free. Cups is a magnitude: zero means none, and 671 really is 2.6 × 258. The chart that treats cups like names, or names like magnitudes, will lie without intending to. The classic vocabulary for this is the four **levels of measurement**.",
    },
    {
      kind: "table",
      title: "The four levels of measurement",
      headers: ["Level", "What it is", "Examples from our datasets", "Claims it permits"],
      rows: [
        ["Nominal", "Names with no order", "city, product, department, species", "Equality only — 'same or different'"],
        ["Ordinal", "Ordered categories, uneven steps", "satisfaction score 1–10, satisfaction bands", "Ranking — 'more or less', never 'how many times more'"],
        ["Interval", "Even steps, arbitrary zero", "temperature in °C", "Differences — '8 °C warmer'; ratios are meaningless"],
        ["Ratio", "Even steps, true zero", "cups sold, revenue (k$), visitors", "Everything — including 'twice as much'"],
      ],
      caption:
        "Each level inherits everything above it and adds one permission. The level decides which statistics and which visual claims are legitimate.",
    },
    {
      kind: "definition",
      term: "Level of measurement",
      informal:
        "The kind of thing a column holds: names (nominal), ranks (ordinal), differences with an arbitrary zero (interval), or full magnitudes with a true zero (ratio). The level sets which encodings and which arithmetic are honest.",
      why: "It is the first question to ask of any column — before averages, before charts — because every later choice inherits its constraints.",
    },
    { kind: "heading", text: "From columns to charts" },
    {
      kind: "text",
      text: "A spreadsheet calls both columns 'text' or 'number', but storage type is not measurement type. The survey's **satisfaction score** is stored as a number, yet it is really *ordinal*: an ordered scale whose steps are not calibrated (nobody can promise the distance from 5 to 6 equals the distance from 8 to 9). Treat it as full arithmetic and 'Design is 1.6× happier than Support' starts sounding like a fact. The safe statistics for ordinal data are counts, medians and quartiles — and the safe chart for its shape is a histogram of counts, not a bar of fake precision.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Median satisfaction by department, annual survey",
        categories: DEPARTMENTS,
        series: [{ name: "median score", values: medians }],
        xLabel: "department",
        yLabel: "median score (1–10)",
        showValues: true,
        sortDesc: true,
        showLegend: false,
      },
      why: "Departments are nominal categories, so they sit on the x-axis as names (sorted by value — a courtesy for unordered categories, not a distortion). The measure is a median — the ordinal-safe centre — encoded as length on a 1–10 scale: Design leads at 8, Support trails at 5.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "All 60 satisfaction scores, binned",
        values: allScores,
        bins: 7,
        xLabel: "score (1–10)",
      },
      why: "The same survey as a distribution: one peak at 6 (16 of 60 employees), a thin low tail (one 3), and a secondary bump at the high end (16 scores of 8 or 9). Bins are contiguous because the scale is continuous — this is a histogram, not a bar chart of separate things.",
    },
    {
      kind: "text",
      text: "**Bars for counts, histograms for continuous.** A bar chart of categorical counts (four products, five departments) draws *separate things* — gaps between bars are honest, because Espresso and Latte are not adjacent. A histogram draws *slices of one continuous scale* — bars touch, because bin [5, 6) runs straight into [6, 7). The same logic sorts out time: monthly revenue is a **discrete sample** of a **continuous process** — the shop earned something every day; we measured it monthly. Connect the dots (a line chart) because the process is continuous, but never read precision between the measured months that the data does not carry.",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "Average monthly temperature by city (°C)",
        palette: "oranges",
        matrix: {
          rowLabels: CITIES,
          colLabels: months,
          cells: CITIES.map((c) => TEMPS[c]),
        },
      },
      why: "Temperature is an interval magnitude: ordered, with meaningful differences. Ordered lightness carries it — every Singapore cell (27–28 °C) is darker than every Oslo cell, whose July peak of 17 °C never reaches Singapore's floor. Magnitude gets an ordered ramp, not a set of unrelated hues.",
    },
    {
      kind: "text",
      text: "Now the encoding rules fall out of the types. **Nominal → hue**: cities and products are unordered names, so give them unrelated, equally-bright colours — hue is a labelling channel, not a measuring one. **Ordinal → ordered lightness**: ranks and ordered bins get a single hue stepped from light to dark, so the eye reads 'more' without reading any number. **Ratio → length or position**: true magnitudes earn bars, line heights and dot positions — the channels the eye measures precisely. One prohibition follows immediately: never encode a magnitude with hue alone (a-06 makes that lesson vivid).",
    },
    {
      kind: "interpretation",
      id: "a-04-i1",
      chart: {
        type: "bar",
        title: "Median satisfaction by department, annual survey",
        categories: DEPARTMENTS,
        series: [{ name: "median score", values: medians }],
        xLabel: "department",
        yLabel: "median score (1–10)",
        showValues: true,
        sortDesc: true,
        showLegend: false,
      },
      prompt: "What does this chart support — and what does it leave unchecked?",
      options: [
        {
          text: "Design leads with a median of 8 and Support trails at 5 — a 3-point gap; but medians say nothing about spread or overlap, which needs the histogram (Support's scores span 3–6, Design's span 7–9: no overlap at all)",
          correct: true,
          feedback:
            "Correct — centre, spread, overlap: a complete reading names all three. The bar carries centre only; the histogram of the same survey carries the rest.",
        },
        {
          text: "Design's people are all happier than Support's people in every individual case",
          correct: false,
          feedback: "Medians rank departments, not people — individual-vs-individual claims need the raw scores, not the middle value.",
        },
        {
          text: "The gap proves Design is managed better than Support",
          correct: false,
          feedback: "A 3-point median gap is a fact about scores, not a cause — management, tenure and workload are all off-chart.",
        },
        {
          text: "The departments are statistically identical",
          correct: false,
          feedback: "8 versus 5 on a 1–10 scale is a real difference — and the histogram shows the two departments' ranges never even touch.",
        },
      ],
      explanation:
        "This is the type lesson wearing a chart: satisfaction is ordinal, so the safe centre is the median (8 vs 5) — and the safe summary is incomplete until the distribution behind it (3–6 vs 7–9, no overlap) has also been read.",
    },
    {
      kind: "exercise",
      id: "a-04-e1",
      exerciseKind: "concept-check",
      prompt:
        "Five columns from the shared datasets: (1) city name; (2) satisfaction score 1–10; (3) month; (4) temperature in °C; (5) cups sold. Which classification and encoding assignment is correct?",
      options: [
        {
          text: "city — nominal → hue; satisfaction — ordinal → ordered lightness (or a median's length); month — ordinal, cyclic → position on a time axis; °C — interval → length/position or a sequential ramp; cups — ratio → length/position",
          correct: true,
          feedback:
            "Correct — each column's level selects its channel, and the two magnitude columns get the channels the eye actually measures.",
        },
        {
          text: "All five are just categorical, because charts draw categories",
          correct: false,
          feedback: "Storage type is not measurement type: cups is a ratio magnitude (0 = none sold) and °C is interval — both carry far more than category membership.",
        },
        {
          text: "city — ordinal (alphabetical order counts); satisfaction — ratio; month — nominal; °C — ratio; cups — interval",
          correct: false,
          feedback: "Alphabetical order is a storage convention, not meaning; satisfaction steps are uncalibrated (ordinal, not ratio); and °C has an arbitrary zero — '20 °C is twice 10 °C' is meaningless.",
        },
        {
          text: "city — nominal; satisfaction — interval; month — interval; °C — ratio; cups — ratio",
          correct: false,
          feedback: "Close on the names, wrong on the scales: satisfaction is ordinal and months are ordered categories, while °C is the textbook INTERVAL variable — its zero is a convention, not an absence.",
        },
      ],
      hint: "Ask of each column: does it have order? even steps? a true zero?",
      explanation:
        "Nominal→hue, ordinal→ordered lightness, interval/ratio→length, position or a sequential ramp. Every mismatch on that list is a chart that promises arithmetic its data cannot perform.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "20 °C is not twice as hot as 10 °C",
      text: "Celsius (and Fahrenheit) zeros are conventions — 'zero degrees' is not 'no temperature'. So ratios are illegitimate on interval data: 20 °C is 10 degrees warmer than 10 °C, and that is all it is. Doubling language ('twice as much', 'half as many') needs a **ratio** scale — cups sold (0 = none), revenue, visitors. Bars invite ratio reading, which is exactly why interval data in bars deserves cautious titles.",
    },
  ],
  terms: [
    {
      term: "nominal",
      definition: "A categorical level of measurement: names with no order (city, product). Supports equality only; encodes honestly as hue or position among categories.",
    },
    {
      term: "ordinal",
      definition: "Ordered categories with uneven or uncalibrated steps (satisfaction 1–10). Supports ranking but not arithmetic — medians and quartiles, never means-and-twice claims.",
    },
    {
      term: "interval",
      definition: "A numeric scale with even steps and an arbitrary zero (°C). Differences are meaningful; ratios are not — '8 °C warmer' is a claim, 'twice as hot' is not.",
    },
    {
      term: "ratio",
      definition: "A numeric scale with a true zero (cups, revenue, visitors). The only level where 'twice as much' is a legitimate claim — and length/position encodings earn their precision.",
    },
    {
      term: "bin",
      definition: "One contiguous slice of a continuous scale in a histogram ([5, 6), [6, 7)…). Bins touch because the underlying scale is continuous — the giveaway that separates histograms from bar charts.",
    },
  ],
  takeaways: [
    "Type first, chart second: the measurement level decides which encodings are honest before any aesthetics begin.",
    "Nominal→hue, ordinal→ordered lightness, ratio→length/position; a magnitude encoded in hue alone is already a misdesign.",
    "Bars for counts of separate categories (gaps honest); histograms for slices of a continuous scale (bins touch).",
    "Interval data forbids ratio language — 20 °C is 10 degrees warmer than 10 °C, never 'twice as hot'.",
    "Monthly figures are discrete samples of continuous processes: connect the dots, but don't read unmeasured precision between them.",
  ],
  quiz: [
    {
      id: "a-04-q1",
      prompt: "Which column is a RATIO variable, and why?",
      options: [
        { text: "Cups sold — zero means none, and 671 is legitimately 2.6 × 258", correct: true, feedback: "A true zero plus even steps is exactly the license for ratio claims — and bar-length comparisons honour it." },
        { text: "Temperature in °C — zero is on the scale, so ratios work", correct: false, feedback: "°C's zero is a convention (water's freezing point), not an absence — 'twice as warm' is meaningless on interval data." },
        { text: "Satisfaction score — 8 is twice 4", correct: false, feedback: "Satisfaction is ordinal: steps are uncalibrated, so 'twice as satisfied' is a category error even when the arithmetic works." },
        { text: "City name — Lisbon has more letters than Oslo", correct: false, feedback: "Letter counts are facts about the label, not the city — nominal data carries no magnitude at all." },
      ],
      explanation: "Ratio needs a true zero. Cups has one; °C and satisfaction do not; city names never had magnitude to begin with.",
    },
    {
      id: "a-04-q2",
      prompt: "An ordered set of categories — bronze, silver, gold finishes — is best encoded with:",
      options: [
        { text: "Ordered lightness steps within one hue", correct: true, feedback: "Ordinal data wants an ORDERED channel: light → dark reads as low → high without implying calibrated steps." },
        { text: "Three unrelated bright hues", correct: false, feedback: "Unrelated hues imply unrelated names — the order bronze < silver < gold is exactly what the encoding fails to show." },
        { text: "Position on three separate, unconnected axes", correct: false, feedback: "Separate axes break the shared scale — comparison is the whole point of ordering the categories." },
        { text: "A random shuffle of any colours, since order is in the labels", correct: false, feedback: "The labels carry the order, but the visual should REINFORCE it, not contradict it — encoding and message should point the same way." },
      ],
      explanation: "Hue names, lightness ranks: ordinal data's order deserves an ordered channel so the eye reads 'more' for free.",
    },
    {
      id: "a-04-q3",
      prompt: "Bar chart of category counts vs histogram of a continuous variable — the giveaway difference is:",
      options: [
        { text: "Bars have gaps (separate things); histogram bins touch (contiguous slices of one scale)", correct: true, feedback: "The gaps are not styling — they encode whether the categories are genuinely separate or slices of a continuum." },
        { text: "Histograms must always be taller", correct: false, feedback: "Height follows the data (counts or values); the touch-vs-gap rule is about the x-axis's meaning." },
        { text: "Bar charts need legends and histograms do not", correct: false, feedback: "Legends track series, not chart family — a single-series bar needs none either." },
        { text: "There is no real difference — the terms are interchangeable", correct: false, feedback: "They answer different questions: category totals vs the SHAPE of a distribution. Confusing them is a classic beginner chart error." },
      ],
      explanation: "Separate things get separate bars with gaps; continuous scales get touching bins. The spacing encodes the type.",
    },
  ],
};
