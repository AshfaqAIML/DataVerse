/**
 * PART_E_V_ASSESSMENT — the Part E checkpoint (12 questions spanning
 * all six lessons: the Power BI pipeline, the star schema, DAX's
 * filter context, Tableau's pill grammar, dashboard design, and
 * business storytelling).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_E_V_ASSESSMENT: QuizQuestion[] = [
  {
    id: "e-vas-1",
    prompt: "A report number looks wrong on the canvas. The pipeline discipline says to:",
    options: [
      { text: "Audit backwards through the views: canvas → Data → Model → Power Query → source, because the defect is almost never on the canvas", correct: true, feedback: "Correct — the report is the shadow of the pipeline; the cheapest place to catch a wrong number is one view to the left." },
      { text: "Fix it in the visual's Format pane", correct: false, feedback: "The Format pane changes appearance, not lineage — a wrong number stays wrong in nicer clothes." },
      { text: "Re-import the data immediately", correct: false, feedback: "Reconnecting before diagnosing rebuilds the same defect with newer timestamps — and loses the audit trail." },
      { text: "Delete the visual and rebuild it", correct: false, feedback: "The visual asked the question; the pipeline answered it wrongly. Rebuilding the question changes nothing." },
    ],
    explanation: "Build forwards (Get Data → Power Query → Model → Report), audit backwards. The direction is the whole discipline.",
  },
  {
    id: "e-vas-2",
    prompt: "Import mode is the honest default for analytical workloads because:",
    options: [
      { text: "Its speed and full DAX support suit hour-scale freshness — the trade being that data is only as current as the last scheduled refresh", correct: true, feedback: "Correct — import copies data into a fast columnar store; you pay in staleness, which most analysis tolerates and refresh schedules cover." },
      { text: "It guarantees real-time data at query time", correct: false, feedback: "That is DirectQuery's promise, not import's — import is stale by construction between refreshes." },
      { text: "It removes the need for a data model", correct: false, feedback: "Storage mode and model design are orthogonal: import stores whatever schema you built, star or mess." },
      { text: "It is the only mode that supports slicers", correct: false, feedback: "Both storage modes support every interactive element; the modes trade speed against freshness, not features like slicing." },
    ],
    explanation: "The storage trade: import buys milliseconds and complete features with staleness; DirectQuery buys freshness with round-trips and constraints. Freshness requirements, not habit, pick the mode.",
  },
  {
    id: "e-vas-3",
    prompt: "In a star schema, the fact table's rows are:",
    options: [
      { text: "Events at a declared grain, carrying measures and foreign keys — sales, tickets, logins", correct: true, feedback: "Correct — the fact is the events; its grain (one row per order line, per response) is the model's contract." },
      { text: "Descriptions stored once — products, customers, calendars", correct: false, feedback: "Those are dimensions: the words live around the edge, referenced by key, edited without rewriting history." },
      { text: "Pre-computed totals, one row per visual", correct: false, feedback: "Pre-aggregation is a performance technique, not the star; the star stores events and aggregates at query time under filter context." },
      { text: "Whatever table the report reads most often", correct: false, feedback: "Frequency of use does not define role — grain and content do. A dashboard can read dimensions more often than facts." },
    ],
    explanation: "Facts are events with numbers; dimensions are descriptions with words. Every other property of the star flows from that split.",
  },
  {
    id: "e-vas-4",
    prompt: "Star relationships default to one-to-many, single-direction (dimension → fact) because:",
    options: [
      { text: "Filters flow meaningfully from the one side to the many side — letting 'many' filter 'one' creates ambiguous paths and double-counting", correct: true, feedback: "Correct — a category filters its sales; a sale row has no sensible opinion about which category filters next. Single direction keeps every filter path unique." },
      { text: "Bidirectional filtering is technically impossible in Power BI", correct: false, feedback: "It is possible and occasionally right — but it is the classic source of ambiguity and slowness, so the default is single and the burden of proof is on the exception." },
      { text: "Many-to-many relationships corrupt the data on refresh", correct: false, feedback: "Refresh integrity and filter direction are separate concerns; the default is about query semantics, not storage corruption." },
      { text: "It makes the model diagram easier to draw", correct: false, feedback: "Aesthetics never decided a default — deterministic filter flow did." },
    ],
    explanation: "Direction is semantics: one description filters many events cleanly; the reverse multiplies paths, and multiplied paths disagree with each other.",
  },
  {
    id: "e-vas-5",
    prompt: "The reliable test for 'measure or calculated column' is:",
    options: [
      { text: "Does the value depend on which visual cell asks? If yes, it is a measure; if it belongs to the row itself, it is a column", correct: true, feedback: "Correct — measures evaluate at query time inside each cell's filter context; columns evaluate once per row at refresh and never change after." },
      { text: "Measures use := and columns use =", correct: false, feedback: "Syntax hints at intent, but the separator is cosmetic in modern editors — the evaluation contract is the real difference." },
      { text: "Anything numeric is a measure", correct: false, feedback: "A row's line total is numeric and still a column — it belongs to the row, not to the asking cell." },
      { text: "Measures are faster, so prefer them always", correct: false, feedback: "Speed is a consequence, not a test; row-level attributes genuinely belong in columns even when measures are faster." },
    ],
    explanation: "The measure/column split is a contract about WHEN and WHERE a formula evaluates — filter context at query time, or row context at refresh.",
  },
  {
    id: "e-vas-6",
    prompt: "Cold Drink Sales := CALCULATE([Total Sales], DimProduct[Category] = \"Cold Drink\") placed in a March, North-region cell of a matrix evaluates:",
    options: [
      { text: "Cold Drink sales for March in the North region — CALCULATE replaced the category portion of the context while the month and region filters survived", correct: true, feedback: "Correct — the context rewriter swaps the category filter and leaves the rest intact: 'this window, rewritten'." },
      { text: "Cold Drink sales for all months and regions — CALCULATE clears every filter", correct: false, feedback: "Clearing everything is CALCULATE with ALL; a plain filter argument replaces its own slice of the context and preserves the others." },
      { text: "Total sales for March in the North — the category filter is ignored in a matrix", correct: false, feedback: "The filter argument is part of the formula: the category rewrite applies wherever the measure lands." },
      { text: "An error — measures cannot reference other measures", correct: false, feedback: "Measures referencing measures is the norm and the power: [Total Sales] evaluates inside the context CALCULATE built." },
    ],
    explanation: "CALCULATE rebuilds filter context argument by argument: the named slice is replaced, everything else survives — which is why one measure answers per cell, correctly.",
  },
  {
    id: "e-vas-7",
    prompt: "In Tableau, dragging a measure onto the Rows shelf always:",
    options: [
      { text: "Wraps it in an aggregation (SUM by default) evaluated within whatever dimensions the view carries — a green pill", correct: true, feedback: "Correct — no naked numbers on shelves: measures aggregate inside the view's slices." },
      { text: "Creates one mark per raw row of the data", correct: false, feedback: "Row-level marks appear only with dimensions at that granularity — the default is aggregation within the view's level of detail." },
      { text: "Colors the marks blue", correct: false, feedback: "Blue is the dimension pill color; measures are green." },
      { text: "Filters the view to that field's values", correct: false, feedback: "Filters live on the Filters shelf; Rows carries position. Encodings and exclusions are different shelves." },
    ],
    explanation: "Dimensions slice (blue), measures aggregate (green) — every shelf placement is a query: GROUP BY the dimensions, aggregate the measures.",
  },
  {
    id: "e-vas-8",
    prompt: "Show Me, Tableau's chart-type suggester, is best characterized as:",
    options: [
      { text: "A dictionary from your current pill selection to viable chart types — fast, useful, and blind to your actual question", correct: true, feedback: "Correct — it optimizes type compatibility, not communication; the question-first discipline (a-03) stays yours." },
      { text: "An automatic analyst that knows which chart best argues your case", correct: false, feedback: "It knows your fields' types, not your point — it will offer a pie because types fit, never asking whether composition is the story." },
      { text: "A shortcut that professionals outgrow and disable", correct: false, feedback: "Even experts keep it as a fast lookup; what matures is knowing when to overrule it." },
      { text: "The only way to build combined-axis charts in Tableau", correct: false, feedback: "Everything Show Me suggests can be composed by hand on the shelves; it suggests, it does not gate." },
    ],
    explanation: "Show Me translates pills into chart types; the decision about what the reader needs was never its to make. Use it for speed, overrule it for meaning.",
  },
  {
    id: "e-vas-9",
    prompt: "Which headline number has earned the word 'KPI'?",
    options: [
      { text: "Conversion 2.2%, target 3.0%, trending flat over 12 weeks, owner: Growth", correct: true, feedback: "Correct — measure, target, window and owner: the four parts that make a number a claim a reader can act on." },
      { text: "Lifetime signups: 1,003,000", correct: false, feedback: "A cumulative count that cannot fail — a vanity metric wearing the costume. No target, no owner, no verdict possible." },
      { text: "This page was viewed 4.8 million times last month", correct: false, feedback: "Volume without a target or an owner: big, and says nothing about whether to act." },
      { text: "Average session length: 6.4 minutes", correct: false, feedback: "An honest average, but an average over a skewed distribution can also average away the story — and without a target it still cannot turn red." },
    ],
    explanation: "A KPI is a claim: measure, target, window, owner. If it cannot fail against its target, it cannot inform a decision — it decorates one.",
  },
  {
    id: "e-vas-10",
    prompt: "The default filter state of a dashboard matters because:",
    options: [
      { text: "Most readers never touch a slicer — the opening state IS the question the screen answers by default, an argument made without being asked", correct: true, feedback: "Correct — 'this week vs last' and 'all time' are different opening claims; choosing the default is choosing the argument." },
      { text: "Defaults cannot be changed after publishing", correct: false, feedback: "They can — which is precisely why designing them deliberately matters: the default is what most readers will actually see." },
      { text: "It determines the report's color palette", correct: false, feedback: "Filter state and styling are independent layers; the default is about the claim, not the paint." },
      { text: "Only DirectQuery reports have default states", correct: false, feedback: "Every interactive report opens somewhere; storage mode has nothing to do with it." },
    ],
    explanation: "The default state is the dashboard's claim title in disguise: design it for the standup the screen lives in, and let history be one deliberate click away.",
  },
  {
    id: "e-vas-11",
    prompt: "In the SCQA story spine, the situation beat's job is to:",
    options: [
      { text: "Confirm the reader's stable picture of the world — earning the right to say 'but' when the complication arrives", correct: true, feedback: "Correct — the situation is deliberately not news; it builds the shared ground the complication is about to break." },
      { text: "Deliver the recommendation as early as possible", correct: false, feedback: "That is the answer beat's job — and in the deck's spine it comes last; answer-first ordering belongs to the live meeting, not the storyboard." },
      { text: "Present every analysis performed, for completeness", correct: false, feedback: "The analysis dump is the anti-story: acts narrow, they do not accumulate. Completeness lives in the appendix." },
      { text: "Create tension by hinting that something is wrong", correct: false, feedback: "That is the complication's job. A situation that foreshadows steals its own 'but'." },
    ],
    explanation: "Situation: the stable world. Complication: what changed. Question: what the change forces. Answer: what to do. Each beat earns the next — and the situation earns the 'but'.",
  },
  {
    id: "e-vas-12",
    prompt: "A deck fails the title test when its slide titles, read aloud in order:",
    options: [
      { text: "Form a table of contents — 'Revenue', 'Products', 'Recommendation' — instead of stating the story's claims", correct: true, feedback: "Correct — topic titles name subjects; claim titles state findings. Only the second lets a skimming reader leave informed." },
      { text: "Contain more than ten words each", correct: false, feedback: "Length is not the test; a twelve-word claim title that states the finding passes, and a two-word topic title fails." },
      { text: "Repeat the same finding on every slide", correct: false, feedback: "Repetition is a different defect (and a real one) — but the title test specifically asks whether the sequence carries the argument." },
      { text: "Mention numbers", correct: false, feedback: "Numbers often make claim titles stronger ('Cold Brew overtook Latte in Q3'); precision is not the failure mode — missing claims are." },
    ],
    explanation: "Read the titles alone: if they state the argument (situation, complication, question, answer), the deck tells itself; if they name topics, the deck is a filing system.",
  },
];
