/**
 * PART E · LESSON e-03 — "DAX Foundations"
 *
 * The formula language of the model, and the one idea that carries it:
 * filter context. Measures evaluate at query time under whatever filters
 * are active; calculated columns evaluate at refresh row by row.
 * CALCULATE is the only function that rewrites the context
 * (CALCULATE(SUM(...), ...)); TOTALYTD is time intelligence built on
 * the same principle. The charts show a measure's two answers (total
 * vs filtered) and the YTD running total of the shared revenue data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_Q4, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ytd: number[] = [];
for (let i = 0; i < REVENUE_2024.length; i++) {
  ytd.push((ytd[i - 1] ?? 0) + REVENUE_2024[i]);
}
const q4Total = COFFEE_Q4.reduce((a, v) => a + v, 0);

export const LESSON_V_E_03: DataVizLesson = {
  slug: "e-03",
  title: "DAX Foundations",
  minutes: 25,
  summary:
    "DAX's one load-bearing idea: measures evaluate under filter context at query time, calculated columns evaluate row by row at refresh. Total Sales := SUM(Sales[Amount]) is one formula with many answers; CALCULATE rewrites the context; TOTALYTD builds time intelligence on it.",
  tool: "power-bi",
  objectives: [
    "Distinguish measures (query-time, filter-context, unstored) from calculated columns (refresh-time, row context, stored)",
    "Write Total Sales := SUM(Sales[Amount]) and read it as 'the sum under whatever filters are active'",
    "Explain filter context: the set of filters a visual, slicer or row has placed on the model before evaluation",
    "Rewrite filter context with CALCULATE and accumulate over time with TOTALYTD",
  ],
  why: "Every dashboard eventually needs a number the source data does not carry: revenue net of refunds, sales for the cold category only, the running year-to-date total. DAX is how the model computes those — and it looks deceptively like Excel, which is exactly why it trips people. The difference is one idea: a DAX measure never sees 'all the rows'. It sees the rows its context allows — the month of the visual cell, the region of the slicer, the category of the legend — and evaluates inside that window. Master filter context and DAX is a small language with predictable behavior; skip it and DAX is a lottery where the same formula returns different numbers in different tiles for reasons nobody on the team can explain. This lesson builds the idea from the measure/column split through CALCULATE to TOTALYTD, on the course's shared numbers.",
  blocks: [
    {
      kind: "text",
      text: "DAX (Data Analysis Expressions) is the model's formula language — syntactically a cousin of Excel, semantically something else entirely. Where a spreadsheet formula reads the cells you point at, a DAX formula reads **the model under whatever filters are active**. That single difference explains every surprise DAX has to offer, and it starts with the split between the two kinds of formulas you can write.",
    },
    {
      kind: "definition",
      term: "Filter context",
      informal:
        "The set of filters — from the visual's axis, the slicers, the legend, the row — in force when a measure evaluates. A measure's answer is its formula applied INSIDE that window; change the window and the same formula returns a different, correct number.",
      why: "Filter context is the load-bearing idea of DAX: it is why one measure can power a twelve-month chart, a KPI card and a table row simultaneously, each cell its own window.",
    },
    {
      kind: "heading",
      text: "Measures vs calculated columns",
    },
    {
      kind: "table",
      title: "The two formula kinds",
      headers: ["", "Measure", "Calculated column"],
      rows: [
        ["Evaluates", "At query time, once per visual cell, inside its filter context", "At refresh time, once per row, inside that row's row context"],
        ["Storage", "Nothing stored — a definition, computed on demand", "Values stored in the model, one per row, always"],
        ["Typical use", "Aggregations that must respect filters: totals, ratios, YTD", "Row-level attributes: line amount, price band, a flag"],
        ["The tell", "Its value depends on WHERE it lands (which cell asks)", "Its value is fixed the moment refresh ends"],
      ],
      caption:
        "The test: 'does this number depend on which visual cell is asking?' If yes, it is a measure. If it belongs to the row itself, it is a column.",
    },
    {
      kind: "code",
      title: "One of each",
      code: `-- A measure: the sum under whatever filters are active
Total Sales := SUM(Sales[Amount])

-- A calculated column: this row's amount, computed at refresh
Line Total = Sales[Quantity] * Sales[Unit Price]`,
      language: "dax",
      note: "The := separator is the classic measure-definition marker (modern editors show =; both mean 'define a measure'). The measure stores a definition — SUM under context; the column stores 10 million values if the table has 10 million rows. Same file, opposite contracts.",
      produces:
        "Total Sales answering differently in every cell that references it — January's cell, the Cold category's cell, the grand total cell — and Line Total holding one fixed value per row.",
    },
    {
      kind: "text",
      text: "Read the measure slowly: **Total Sales := SUM(Sales[Amount])** does not say 'the sum of the Amount column'. It says: *whatever filters are in force, sum the Amount values that survive them*. Dropped in a December cell it sums December's rows. Dropped beside a Cold Brew legend entry it sums Cold Brew's rows. Dropped in the grand total cell it sums everything. One definition, a different correct answer per window — this is the behavior that either delights or mystifies, depending on whether filter context has been learned.",
    },
    {
      kind: "heading",
      text: "CALCULATE, the context rewriter",
    },
    {
      kind: "text",
      text: "Sometimes the question is not 'this window' but 'this window, rewritten': the cold-drink share of each month; profit for one region against all regions. `CALCULATE` is the only function in DAX that changes filter context: it takes an expression and a set of filter arguments, applies them over the current context, and evaluates inside the result.",
    },
    {
      kind: "code",
      title: "Rewriting the window",
      code: `Cold Drink Sales :=
CALCULATE (
    [Total Sales],
    DimProduct[Category] = "Cold Drink"
)

-- Whatever the outer context says, the Cold Drink filter replaces the
-- Category portion of it; everything else (month, region) survives.`,
      language: "dax",
      note: "CALCULATE's filter arguments can add filters, replace them, or remove them (ALL) — but the mechanism is always the same: rebuild the context, then evaluate. Every 'why did my number change?' mystery in DAX is a context question wearing a costume.",
      produces:
        "A measure that, in any cell, ignores whatever category the cell implied and reports the Cold Drink total for the cell's remaining filters (its month, its region).",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "One measure, two contexts: Q4 cups",
        categories: ["All products", "Cold Brew only"],
        series: [{ name: "cups", values: [q4Total, COFFEE_Q4[3]] }],
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "The CALCULATE effect as numbers: the same underlying measure, evaluated once in the unfiltered context (2,065 cups) and once inside the rewritten context (671). Two bars, one formula, two windows — filter context made visible.",
    },
    {
      kind: "code",
      title: "Time intelligence, one line",
      code: `YTD Sales :=
TOTALYTD ( [Total Sales], 'Date'[Date] )`,
      language: "dax",
      note: "In a March cell this evaluates [Total Sales] over January 1 through March 31 (the year-so-far window); in a December cell, the full year. The date table is passed by its date column, in single quotes because Date is a table name. Time intelligence — the family no spreadsheet formula carries: year-to-date, same-period-last-year, moving averages — has one real prerequisite here: a proper date dimension (a table marked as a date table, with contiguous dates), because 'year to date' is a claim about a calendar the engine must be able to walk.",
      produces:
        "The running year-to-date revenue: 124 in January, 255 after February, 1,866 after December — one measure, every month's cell its own year-so-far window.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue and YTD revenue, 2024 (k$)",
        categories: months,
        series: [
          { name: "monthly", values: REVENUE_2024 },
          { name: "YTD (TOTALYTD)", values: ytd },
        ],
        yLabel: "k$",
      },
      why: "Both lines are the same measure family: monthly is [Total Sales] in each month's own context; YTD is the same measure inside TOTALYTD's widened window. The cumulative line's December terminus — 1,866 — is the year's headline number.",
    },
    {
      kind: "interpretation",
      id: "e-03-i1",
      chart: {
        type: "line",
        title: "YTD revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "YTD", values: ytd }],
        yLabel: "k$",
        showLegend: false,
      },
      prompt:
        "What does the YTD line communicate that the monthly line cannot, and what is the honest caveat about its shape?",
      options: [
        {
          text: "The year compounded to 1,866 k$, with Q4 alone contributing 564 (about 30% of the year); the caveat: a cumulative line only ever rises within a year, so its slope — not its level — carries the monthly news",
          correct: true,
          feedback:
            "Correct — 1,866 by December, Q4's 564 is 30% of it, and the steepening slope (never the level, which cannot fall) is where each month's contribution shows.",
        },
        {
          text: "It shows December was the best month, at 1,866 k$ of monthly revenue",
          correct: false,
          feedback: "1,866 is the YEAR's cumulative total; December's monthly figure was 204. Reading a cumulative line as monthly values is the classic YTD misread.",
        },
        {
          text: "Nothing — it is the same data as the monthly line and adds no information",
          correct: false,
          feedback: "It is derived from the same numbers but answers a different question (how much has the year produced so far) — the executive question the monthly line cannot answer directly.",
        },
        {
          text: "It proves growth accelerated every single month of the year",
          correct: false,
          feedback: "June to July, monthly revenue dipped (153 → 151) — the cumulative slope flattened there. Total accumulation hides no month; it summarizes them, which is different.",
        },
      ],
      explanation:
        "YTD is the executive register of the revenue story: compounding to 1,866 k$, Q4 contributing 564 of it. Read its slope for the months, its level for the year — and never confuse the two.",
    },
    {
      kind: "exercise",
      id: "e-03-e1",
      exerciseKind: "concept-check",
      prompt:
        "Classify each requirement as a measure or a calculated column, with the reason: (1) 'Margin % per region, responsive to every slicer on the page' (2) 'A Line Total value stamped on every sales row at refresh' (3) 'Running year-to-date revenue' (4) 'A customer tier label derived from the customer's annual spend band'.",
      options: [
        {
          text: "(1) measure — depends on which cell asks; (2) calculated column — a row attribute, fixed at refresh; (3) measure — TOTALYTD is a context-dependent accumulation; (4) calculated column — a label belonging to the row (though the band itself may be maintained in the dimension)",
          correct: true,
          feedback:
            "Correct — the test applied four times: does the number depend on the asking cell (measure) or belong to the row (column)? Tier labels and line totals belong to rows; ratios and YTD depend on windows.",
        },
        {
          text: "All four are measures — DAX formulas are measures",
          correct: false,
          feedback: "Two of the four (line total, tier label) are row attributes: storing them per visual cell would be both impossible and pointless.",
        },
        {
          text: "All four are calculated columns — columns are faster",
          correct: false,
          feedback: "Columns are precomputed, not magically faster under every filter: a Margin % column would freeze one context's answer and ignore every slicer.",
        },
        {
          text: "(1) column, (2) measure, (3) column, (4) measure",
          correct: false,
          feedback: "Reversed: the slicer-responsive ratio (1) is the measure par excellence; the row-stamped line total (2) is the column par excellence.",
        },
      ],
      explanation:
        "One test, applied without exception: does the value depend on which visual cell is asking? If yes — measure. If it belongs to the row itself — calculated column. Everything else in DAX builds on this split.",
    },
  ],
  terms: [
    {
      term: "measure",
      definition: "A query-time formula evaluated inside the current filter context — stored as a definition, computed per visual cell. The measure is DAX's native unit.",
    },
    {
      term: "calculated column",
      definition: "A refresh-time formula evaluated once per row and stored — for values that belong to the row (line totals, bands, flags), not to the asking cell.",
    },
    {
      term: "CALCULATE",
      definition: "DAX's only context rewriter: an expression plus filter arguments, evaluated inside a rebuilt filter context. Every 'same formula, different number' story routes through it.",
    },
  ],
  takeaways: [
    "Filter context is the one idea: a measure evaluates inside whatever window the visual cell, slicer and legend have built — one formula, many correct answers.",
    "Measures live at query time; calculated columns live at refresh time. 'Does this number depend on the asking cell?' is the test.",
    "CALCULATE rebuilds the context before evaluating — the mechanism behind every filtered comparison worth making.",
    "TOTALYTD and the time-intelligence family need a real date dimension; they reward it with running windows no spreadsheet formula carries.",
  ],
  quiz: [
    {
      id: "e-03-q1",
      prompt: "A measure differs from a calculated column chiefly because it:",
      options: [
        {
          text: "Evaluates at query time inside the current filter context, storing nothing — its value depends on which visual cell asks",
          correct: true,
          feedback: "Correct — the definition is a formula evaluated per window; every cell gets its own correct answer.",
        },
        {
          text: "Is stored in the model and computed once at refresh",
          correct: false,
          feedback: "That is the calculated column's contract — fixed the moment refresh ends.",
        },
        {
          text: "Can only be written in the DAX editor, never the UI",
          correct: false,
          feedback: "Both kinds are formulas; the editing surface has nothing to do with the evaluation contract.",
        },
        {
          text: "Cannot reference other tables through relationships",
          correct: false,
          feedback: "Measures traverse relationships freely (RELATED, RELATEDTABLE) — context does not confine them to one table.",
        },
      ],
      explanation: "The measure/column split is about WHEN and WHERE a formula evaluates: query time in a window, versus refresh time on a row.",
    },
    {
      id: "e-03-q2",
      prompt: "What makes CALCULATE special in DAX?",
      options: [
        {
          text: "It is the only function that rewrites filter context — evaluating its expression inside filters the caller specifies",
          correct: true,
          feedback: "Correct — add, replace or remove filters, then evaluate: the mechanism behind every comparison measure.",
        },
        {
          text: "It is the only function that can sum a column",
          correct: false,
          feedback: "SUM does that; CALCULATE's job is the context around whatever expression you hand it.",
        },
        {
          text: "It converts measures into calculated columns",
          correct: false,
          feedback: "The two kinds stay distinct; no function transmutes one into the other.",
        },
        {
          text: "It caches results so visuals render faster",
          correct: false,
          feedback: "Caching is an engine concern; CALCULATE's semantics are about context, not storage.",
        },
      ],
      explanation: "CALCULATE is the context rewriter: whatever window the cell built, CALCULATE rebuilds it per its filter arguments before evaluating. That is its whole and enormous job.",
    },
    {
      id: "e-03-q3",
      prompt: "TOTALYTD([Total Sales], 'Date'[Date]) requires, above all:",
      options: [
        {
          text: "A proper date dimension — contiguous dates, marked as the model's date table — because 'year to date' is a walk the engine makes across a calendar",
          correct: true,
          feedback: "Correct — time intelligence is calendar arithmetic; a broken or auto-generated date column produces quietly wrong windows.",
        },
        {
          text: "That the measure contain CALCULATE",
          correct: false,
          feedback: "TOTALYTD rewrites context internally; the measure it wraps can be as simple as SUM.",
        },
        {
          text: "Import mode rather than DirectQuery",
          correct: false,
          feedback: "Time intelligence works in both modes (performance differs); the date dimension is the prerequisite that is not optional.",
        },
        {
          text: "A calculated column storing the year",
          correct: false,
          feedback: "The date dimension carries Year as a matter of course — an extra column adds nothing to the walk.",
        },
      ],
      explanation: "Time intelligence is built on a real calendar: a marked date table with contiguous dates. Get that right and TOTALYTD, same-period-last-year and friends simply work.",
    },
  ],
};
