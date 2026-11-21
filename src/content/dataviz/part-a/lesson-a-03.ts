/**
 * PART A · LESSON a-03 — "Choosing the Right Chart"
 *
 * The question→chart ladder: comparison→bar, trend→line, distribution→
 * histogram, relationship→scatter, composition→stacked/pie. Demonstrated
 * by rendering the SAME coffee data three ways and reading what each
 * surfaces and what each hides.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4 } from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const perQuarter = COFFEE_PRODUCTS.map((_, i) => [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]]);
const coffeeAnnual = perQuarter.map((q) => q.reduce((a, v) => a + v, 0));

export const LESSON_V_A_03: DataVizLesson = {
  slug: "a-03",
  title: "Choosing the Right Chart",
  minutes: 20,
  summary:
    "Every chart family is built to expose one kind of relationship and is blind to the others. The question→chart ladder — comparison→bar, trend→line, distribution→histogram, relationship→scatter, composition→stacked/pie — and what happens when you render the same data all three ways.",
  tool: null,
  objectives: [
    "Translate a stakeholder's question into one of the five chart families before touching any tool",
    "Render the same dataset as bar, line and pie and articulate what each version surfaces and hides",
    "Explain why no chart is neutral: every encoding is a bet on which question matters",
    "Spot the classic mismatch — a composition chart asked to answer a trend question, and vice versa",
  ],
  why: "Most bad charts are not dishonest — they are answers to the wrong question. A pie chart cannot show that Cold Brew overtook Latte, and a line chart cannot show each product's share of the year: not because the tools fail, but because each encoding is built to expose one kind of relationship and is blind to the others. The professional move is to start from the question the reader actually asks — which is bigger, how does it move, what is it made of — and let the question pick the chart. This lesson installs that ladder as a reflex.",
  blocks: [
    {
      kind: "text",
      text: "A chart family is not a style, it is an **answering machine**. Bars answer *which is bigger*. Lines answer *how does it move*. Histograms answer *how spread out is it*. Scatters answer *do these travel together*. Pies and stacked bars answer *what is it made of*. Ask a chart family a question outside its design brief and it will still render — beautifully, confidently, and uselessly. So the first move in visualization is not choosing a chart; it is **naming the question**.",
    },
    {
      kind: "table",
      title: "The question→chart ladder",
      headers: ["The question you are asked", "Chart family", "Why that encoding fits"],
      rows: [
        ["Which is bigger? (comparison)", "Bar", "Length on a shared zero baseline is compared with near-numeric precision"],
        ["How does it change? (trend)", "Line", "Slope along a time axis makes rise, fall and crossing visible at a glance"],
        ["What is the spread? (distribution)", "Histogram", "Counts per bin expose centre, spread, skew and outliers of one measure"],
        ["Do they move together? (relationship)", "Scatter", "Position on two shared scales shows correlation, clusters and gaps"],
        ["What is it made of? (composition)", "Stacked bar / pie", "Part-to-whole: shares of a total, in one frame or across categories"],
      ],
      caption:
        "Five questions, five families. Most chart-choice mistakes are a mismatch on this table — a trend question sent to a composition chart, a comparison sent to a pie.",
    },
    { kind: "heading", text: "One dataset, three questions" },
    {
      kind: "text",
      text: "To feel the trade, one dataset is enough. The coffee shop sold the same four products across the same four quarters of 2024. Three different owners ask three different questions of the very same numbers — and each deserves a different chart.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold, Q4 2024",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "The comparison question — 'which sold most last quarter?' — goes straight to length on a shared baseline: Cold Brew 671 leads Latte 647 by 24, and Filter trails at 258, a 2.6× spread from the top.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Cups per product per quarter, 2024",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({ name: p, values: perQuarter[i] })),
        yLabel: "cups",
      },
      why: "The trend question — 'are cold drinks taking over?' — needs a time axis. Four connected lines show what the Q4 bar never could: Cold Brew climbing 476→671 while Filter slides 301→258, and the moment Cold Brew passes Latte.",
    },
    {
      kind: "chart",
      chart: {
        type: "pie",
        title: "Share of 2024 cups by product",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "2024 cups", values: coffeeAnnual }],
        showLegend: false,
      },
      why: "The composition question — 'where did the year's cups come from?' — is part-to-whole: Latte's 2443 of 7659 total cups is 32%, Cold Brew 30%, Espresso 23%, Filter 15%. Clockwise from 12 o'clock: Espresso, Latte, Filter, Cold Brew.",
    },
    {
      kind: "text",
      text: "Notice the trade each chart made. The **bar** surfaced the Q4 ranking and buried every other quarter. The **line** surfaced trajectories and the Q3 rank reversal — and buried the part-to-whole structure (its four series never total themselves). The **pie** surfaced shares and froze time completely: it cannot show that Cold Brew passed Latte, only that Latte ends the year with the largest share. None of the three is 'the right chart' — each is right *for one question* and dishonest by omission for the others. **No chart is neutral.**",
    },
    {
      kind: "interpretation",
      id: "a-03-i1",
      chart: {
        type: "line",
        title: "Cups per product per quarter, 2024",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({ name: p, values: perQuarter[i] })),
        yLabel: "cups",
      },
      prompt:
        "What does this line chart show that neither the Q4 bar chart nor the annual pie chart of the same data could?",
      options: [
        {
          text: "A rank reversal: Cold Brew starts 112 cups behind Latte (476 vs 588 in Q1), passes it in Q3 (618 vs 596), and finishes 24 ahead (671 vs 647)",
          correct: true,
          feedback:
            "Correct — crossings are the line chart's cargo. The Q4 bar shows only the final ranking; the pie shows only annual shares; only the connected time axis reveals the overtake itself.",
        },
        {
          text: "Filter is the smallest product",
          correct: false,
          feedback: "True in every quarter (301 down to 258) — but the bar chart already ranked Filter last. The line's unique contribution is the crossing, not the ranking.",
        },
        {
          text: "Cold Brew holds the largest annual share",
          correct: false,
          feedback: "False — and annual share is the pie's job anyway: Latte leads the year with 2443 cups (32%) against Cold Brew's 2307 (30%). Scope changes the winner.",
        },
        {
          text: "Espresso is shrinking",
          correct: false,
          feedback: "The opposite: Espresso climbs every quarter, 412 → 438 → 451 → 489. Only Filter declines across the year (301 → 258).",
        },
      ],
      explanation:
        "Lines encode change: climbs, slides and crossings arrive as slope. The bar froze one quarter and the pie froze the whole year — only the connected view carries the moment the shop's story changed: Q3, when Cold Brew (618) passed Latte (596).",
    },
    {
      kind: "exercise",
      id: "a-03-e1",
      exerciseKind: "choose-chart",
      prompt:
        "The owner asks five questions. (1) Which drink sold the most cups last quarter? (2) Are cold drinks taking over the menu? (3) How are staff satisfaction scores distributed? (4) Do shops with more staff sell more espresso? (5) Where does the year's revenue come from? Which mapping of question → chart family is correct?",
      options: [
        {
          text: "1 bar (compare categories) · 2 line over time · 3 histogram (one measure's spread) · 4 scatter (two measures, position) · 5 pie or stacked bar (part-to-whole)",
          correct: true,
          feedback:
            "Correct — one family per question type: comparison, trend, distribution, relationship, composition. The ladder is a translation table.",
        },
        {
          text: "1 pie · 2 line · 3 bar · 4 histogram · 5 scatter",
          correct: false,
          feedback: "Pies compare shares of a whole poorly and single categories worse — 'which sold most' wants bar lengths; satisfaction spread wants a histogram, not category bars.",
        },
        {
          text: "1 line · 2 bar · 3 scatter · 4 histogram · 5 stacked bar",
          correct: false,
          feedback: "Trend questions need a time axis (line), not a frozen bar; and a scatter needs TWO measures to relate — satisfaction spread is a job for the histogram.",
        },
        {
          text: "1 bar · 2 line · 3 scatter · 4 histogram · 5 pie",
          correct: false,
          feedback: "Close — but distribution (one measure, question 3) is the histogram, and relationship (two measures, question 4) is the scatter. The swap matters.",
        },
      ],
      hint: "Say each question out loud with its type appended: '…compared?', '…over time?', '…spread out?', '…together?', '…out of what total?'",
      explanation:
        "The ladder is the front door of chart choice: comparison→bar, trend→line, distribution→histogram, relationship→scatter, composition→pie/stacked. Question first, chart second — always in that order.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Composition vs change: the classic mix-up",
      text: "Pies answer **what fraction**, lines answer **how did it move**. A pie of 2024 shares cannot show Cold Brew overtaking Latte in Q3 — it has no time axis. A line of four products cannot show each product's share of the year — its series never sum themselves. Before choosing, decide which axis your question lives on: the calendar or the whole.",
    },
  ],
  terms: [
    {
      term: "question→chart ladder",
      definition: "The mapping from question type to chart family: comparison→bar, trend→line, distribution→histogram, relationship→scatter, composition→stacked/pie. The first move of chart design.",
    },
    {
      term: "part-to-whole",
      definition: "A relationship where each value is a share of a total (32% of the year's cups). The domain of pies, stacked bars and 100%-stacked bars — and invisible to plain line charts.",
    },
    {
      term: "rank reversal (crossing)",
      definition: "The moment one series passes another — Cold Brew passing Latte in Q3. Visible only when time is an axis: lines and grouped bars, never pies or single-period bars.",
    },
  ],
  takeaways: [
    "Every chart family answers exactly one question type well; render the same data three ways and each version buries what the others surface.",
    "Comparison→bar, trend→line, distribution→histogram, relationship→scatter, composition→stacked/pie — the ladder is a translation table, and the question always comes first.",
    "No chart is neutral: choosing an encoding is choosing which relationship your reader sees and which one they must take on trust.",
    "Composition and change are different axes: a pie has no calendar and a line has no total — pick by where your question lives.",
  ],
  quiz: [
    {
      id: "a-03-q1",
      prompt: "Which question does a pie chart answer honestly?",
      options: [
        { text: "What fraction of the whole does each part hold?", correct: true, feedback: "Part-to-whole is the pie's design brief — 32% of the year's cups, 30%, 23%, 15%." },
        { text: "How did each part change over time?", correct: false, feedback: "A pie has no time axis — it is a year with the calendar ripped out." },
        { text: "Which of two close values is larger?", correct: false, feedback: "Angle comparison is three rungs below length on the effectiveness ladder — close slices are exactly where pies fail." },
        { text: "How spread out are the raw values?", correct: false, feedback: "Distribution is the histogram's job; a pie of shares says nothing about spread." },
      ],
      explanation: "Pies freeze a total into shares. Hand them a trend or a fine ranking and they will underperform every alternative.",
    },
    {
      id: "a-03-q2",
      prompt: "The four-product line chart revealed something the Q4 bar could not. What?",
      options: [
        { text: "The Q3 rank reversal — Cold Brew (618) passing Latte (596) mid-year", correct: true, feedback: "Crossings need a time axis; one quarter's bars show only the final ranking." },
        { text: "That Filter sold the fewest cups in Q4", correct: false, feedback: "True — and already the bar chart's finding. The line's unique cargo is the overtake." },
        { text: "That Cold Brew has the largest annual share", correct: false, feedback: "False — Latte leads the year (2443 vs 2307); annual shares belong to the pie." },
        { text: "That quarterly totals grew every quarter", correct: false, feedback: "They did (1777 → 1878 → 1939 → 2065), but the line's series never total themselves — that reading belongs to the stacked bar." },
      ],
      explanation: "The line chart's design brief is change over time: climbs, slides, and above all the crossing in Q3 when Cold Brew passed Latte.",
    },
    {
      id: "a-03-q3",
      prompt: "Your question is: 'How are satisfaction scores spread across the team?' The ladder prescribes:",
      options: [
        { text: "A histogram — the question is about the distribution of one measure", correct: true, feedback: "Centre, spread, skew, outliers: a histogram of binned counts exposes all four." },
        { text: "A bar chart of each employee's score", correct: false, feedback: "That is a list, not a shape — spread becomes invisible when every value gets its own bar." },
        { text: "A pie of high/medium/low shares", correct: false, feedback: "Binning into three slices answers 'what share', not 'how spread' — the tails vanish." },
        { text: "A scatter of score against employee ID", correct: false, feedback: "ID is not a measure — the x-axis would be meaningless position, and spread needs bins, not dots." },
      ],
      explanation: "Distribution questions go to histograms: one measure, binned, counted — the only family whose shape IS the answer.",
    },
  ],
};
