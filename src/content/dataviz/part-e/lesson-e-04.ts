/**
 * PART E · LESSON e-04 — "Tableau Fundamentals"
 *
 * Tableau's visual grammar: dimensions slice (blue pills), measures
 * aggregate (green pills); the shelves — Columns, Rows, the Marks card
 * — are the encoding assignment surface; Show Me suggests chart types
 * from the selected pills. The calculated field listing is real
 * Tableau syntax; the charts render what the pill states build.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4, IRIS_PETAL_LENGTH, IRIS_SEPAL_LENGTH, IRIS_SPECIES } from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

export const LESSON_V_E_04: DataVizLesson = {
  slug: "e-04",
  title: "Tableau Fundamentals",
  minutes: 25,
  summary:
    "Dimensions slice, measures aggregate, and the pill system — Columns, Rows, Marks — is where encodings get assigned. Show Me suggests chart types from your pills; the difference from Power BI's field wells is the difference between a grammar and a gallery.",
  tool: "tableau",
  objectives: [
    "Distinguish dimensions (they slice: categories, dates — blue pills) from measures (they aggregate: SUM, AVG — green pills)",
    "Read the pill system: fields on Rows and Columns take positional channels; the Marks card carries Color, Size, Shape, Detail and Tooltip",
    "Use Show Me as a chart-type suggester — and know when to overrule it",
    "Name the difference between Tableau's shelves and Power BI's field wells",
  ],
  why: "Power BI asks you to pick a visual first and feed it fields; Tableau asks you to place fields first and watches what grows. That inversion is the whole product. Drag a dimension onto Columns and a measure onto Rows and a bar chart appears — not because you chose bars, but because dimension-sliced-by-measure IS a bar chart in Tableau's grammar, and the tool derives it. Work with that grammar and you compose charts the way you compose sentences; fight it and you spend your day wrestling a tool that keeps trying to finish your thoughts. This lesson covers the grammar's three parts — dimensions versus measures, the pill shelves, Show Me — and closes the loop back to e-01: field wells and pill shelves are two interfaces to the same grammar of graphics, and knowing both makes you bilingual in the BI market's two dominant tools.",
  blocks: [
    {
      kind: "text",
      text: "Tableau's world divides every field into two kinds. **Dimensions** are the slicers: product, region, month — the fields whose values you group BY. **Measures** are the aggregates: cups, revenue, temperature — the fields whose values you sum, average or count WITHIN each slice. Tableau colors the pills to keep the contract visible: dimensions blue, measures green. Drag Product (blue) onto Columns and SUM(Cups) (green) onto Rows, and the bar chart is simply what that sentence means.",
    },
    {
      kind: "definition",
      term: "Dimension vs measure",
      informal:
        "Dimensions slice the data into groups (blue pills — usually text and dates); measures aggregate inside those groups (green pills — numbers wrapped in an aggregation like SUM or AVG).",
      why: "The distinction is not a type system for its own sake: it is the GROUP BY of the visual grammar. Every pill placement is a query whose GROUP BY is the dimensions present and whose SELECT list is the measures.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "SUM(Cups) on Rows, Product on Columns",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "Product (dimension: Columns)",
        yLabel: "SUM(Cups) (measure: Rows)",
        showValues: true,
        showLegend: false,
      },
      why: "The pill state made visible: one blue pill on Columns, one green pill on Rows, and the default mark (bar) renders the sentence 'cups by product'. Cold Brew 671, Latte 647, Espresso 489, Filter 258 — the same numbers e-01's field wells produced, derived instead of chosen.",
    },
    {
      kind: "code",
      title: "A calculated field — measures all the way down",
      code: `// Profit Ratio (a calculated field on the data pane)
SUM([Profit]) / SUM([Sales])`,
      language: "text",
      note: "Tableau calculated fields read like DAX's cousins: aggregate measures, not row arithmetic. This one is safe to place on any shelf because both halves aggregate — SUM(Profit) within the slice, SUM(Sales) within the slice, then divide. Write [Profit] / [Sales] instead and you get a row-level ratio averaged, not a ratio of totals — a classic silent error.",
      produces:
        "A new green pill, Profit Ratio, usable on any shelf — aggregating correctly at every level of detail the view happens to have.",
    },
    {
      kind: "heading",
      text: "The shelves",
    },
    {
      kind: "text",
      text: "Where a field lands decides what it does. **Columns** and **Rows** are the positional channels — x and y. The **Marks card** carries every other encoding: *Color*, *Size*, *Shape*, *Detail* (which subdivides marks without changing their appearance), *Tooltip*. The state of the shelves IS the chart's spec — literally: two analysts who place the same pills in the same slots get the same view, which is why a Tableau screenshot can be reverse-engineered into its pill state by anyone who reads the grammar. This is the exact same contract as this course's ChartSpec: type, channels, series — expressed as drag-and-drop.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Sepal length on Columns, petal length on Rows, Species on Color",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: "Three pills, three encodings: a measure on Columns (x position), a measure on Rows (y position), a dimension on Color (hue). The two species separate almost completely — setosa's petals 1.1–1.7 cm against versicolor's 4.0–4.9 — with no legend needed beyond the colors themselves.",
    },
    {
      kind: "heading",
      text: "Show Me",
    },
    {
      kind: "text",
      text: "**Show Me** is the panel that suggests chart types from your current pill selection: select Product and Cups and it offers bars, pie, tables; add a date and it offers lines. Used well, it is a fast dictionary from question to chart type. Used lazily, it is the Part A discipline outsourced to a heuristic that knows your fields' types but not your question — it will happily offer a pie chart because the types fit, having no idea whether composition is what the reader needs. The rule from this course's a-03 chart-choice ladder stands: decide the question first, then let Show Me translate the decision into pills — never the reverse.",
    },
    {
      kind: "table",
      title: "Tableau shelves vs Power BI field wells",
      headers: ["", "Tableau", "Power BI"],
      rows: [
        ["Order of decisions", "Fields first — the chart type is derived from the pill state", "Visual first — the gallery choice precedes field placement"],
        ["Encoding surface", "Shelves: Columns, Rows, Marks card", "Field wells: Axis, Values, Legend, per visual"],
        ["Chart suggestion", "Show Me, from selected pills", "The visual gallery, browsed manually"],
        ["The grammar", "One grammar for all marks — shelves re-used across chart types", "Each visual declares its own wells"],
        ["Where you feel it", "Composing feels like writing a sentence", "Composing feels like filling a form"],
      ],
      caption:
        "Same underlying grammar of graphics, two interaction philosophies. Bilingual practitioners report the shelf grammar transfers better to novel chart types; the well grammar protects beginners from invalid combinations.",
    },
    {
      kind: "text",
      text: "One more Tableau behavior completes the grammar: the **level of detail** is nothing more than the set of pills on the shelves. Add Region to Detail and every mark splits by region; remove Product and the view collapses to whatever remains. There is no separate 'group by' control to forget — the pills ARE the grouping, which is why reading a stranger's workbook starts with reading the shelves.",
    },
    {
      kind: "interpretation",
      id: "e-04-i1",
      chart: {
        type: "grouped-bar",
        title: "Quarter on Columns, Product on Color: cups by product and quarter",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({
          name: p,
          values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
        })),
        yLabel: "SUM(Cups)",
      },
      prompt:
        "This view is Quarter (blue) on Columns and Product (blue) on Color, with SUM(Cups) on Rows. What is the strongest reading of the year's structure?",
      options: [
        {
          text: "Cold Brew overtakes Latte between Q2 and Q3 — 542 vs 612 in Q2, then 618 vs 596 in Q3 — and finishes at 671 vs 647, while Filter declines all year (301 → 258)",
          correct: true,
          feedback:
            "Correct — the crossover is the story the pill state was built to expose: two blue pills (quarter, product) and one green pill (SUM(Cups)) yield exactly this within-quarter comparison.",
        },
        {
          text: "Every product grew every quarter",
          correct: false,
          feedback: "Filter falls all four quarters (301, 286, 274, 258) — one declining series among three growers, which is precisely why per-product comparison beats the total.",
        },
        {
          text: "Cold Brew was always the top product",
          correct: false,
          feedback: "Latte led Q1 and Q2 (588 and 612 against 476 and 542); the lead changed hands in Q3. 'Always' is exactly what the grouped bars refute.",
        },
        {
          text: "The chart shows revenue, so Q4's winner earned the most money",
          correct: false,
          feedback: "The Rows pill is SUM(Cups) — volume, not value. Revenue needs a price measure, and margin needs more still (the honest reading discipline from a-01, unchanged by tools).",
        },
      ],
      explanation:
        "The pill state builds the comparison: quarter-slices × product-colors = within-quarter ranking, where the Cold Brew/Latte crossover (Q2 to Q3) lives. Volume it measures; value it does not.",
    },
    {
      kind: "exercise",
      id: "e-04-e1",
      exerciseKind: "choose-chart",
      prompt:
        "You need a line chart of monthly revenue for 2024 with a smooth line per region. Specify the shelf state: which fields go on Columns, which on Rows, and which on the Marks card — including the pill colors (dimension/measure) and any continuous-vs-discrete decisions.",
      options: [
        {
          text: "The date field on Columns (continuous, green when extracted as a continuous measure-style axis) so months flow as a true axis; SUM(Revenue) on Rows; Region on Color — one line per region, colored by the dimension",
          correct: true,
          feedback:
            "Correct — continuous Month on Columns makes time an axis rather than a category list; SUM(Revenue) on Rows sets the y; Region on Color splits the marks into one line per region. The standard time-series shelf state.",
        },
        {
          text: "Region on Columns and Month on Rows",
          correct: false,
          feedback: "That swaps the channels: time would run vertically and regions across — readable, but fighting every convention a line chart leans on.",
        },
        {
          text: "SUM(Revenue) on Columns and the date on Rows",
          correct: false,
          feedback: "Axes swapped: value across, time vertical. Occasionally deliberate, never the default for a trend.",
        },
        {
          text: "Region on Detail instead of Color, so the lines share one color",
          correct: false,
          feedback: "Detail splits the marks but colors them alike — per-region lines you cannot tell apart. Color is the encoding that comparison needs.",
        },
      ],
      explanation:
        "The time-series sentence in Tableau grammar: continuous date on Columns, measure on Rows, the splitting dimension on Color. Every component is a pill decision — the grammar composes.",
    },
  ],
  terms: [
    {
      term: "dimension",
      definition: "A slicing field (blue pill): product, region, date — the GROUP BY of the visual grammar. Placed on a shelf, it divides the view.",
    },
    {
      term: "measure",
      definition: "An aggregating field (green pill): cups, revenue — always wrapped in an aggregation (SUM, AVG) evaluated within the view's dimensions.",
    },
    {
      term: "Marks card",
      definition: "The shelf for every non-positional encoding: Color, Size, Shape, Detail, Tooltip. Position lives on Rows and Columns; everything else lives here.",
    },
  ],
  takeaways: [
    "Dimensions slice (blue), measures aggregate (green) — every shelf placement is a query: GROUP BY the dimensions, aggregate the measures.",
    "The pill state IS the chart spec: Columns and Rows take position, the Marks card takes Color, Size, Shape, Detail and Tooltip.",
    "Show Me translates your pills into chart types — a dictionary, not a brain. The question still comes first (a-03's ladder, unchanged).",
    "Versus Power BI: fields-first versus visual-first — two interfaces to the same grammar of graphics; bilingual is the market's demand.",
  ],
  quiz: [
    {
      id: "e-04-q1",
      prompt: "In Tableau, a measure placed on a shelf always:",
      options: [
        {
          text: "Arrives wrapped in an aggregation (SUM by default) evaluated within whatever dimensions the view carries",
          correct: true,
          feedback: "Correct — green pills aggregate inside the slices; there is no naked number on a shelf.",
        },
        {
          text: "Displays every raw row as its own mark",
          correct: false,
          feedback: "Raw rows appear only through Detail-level granularity with no dimensions — not the default, and never what a bare measure does.",
        },
        {
          text: "Colors the marks blue",
          correct: false,
          feedback: "Blue is the dimension pill color; measures are green.",
        },
        {
          text: "Must be converted to a dimension before use",
          correct: false,
          feedback: "Dimensions and measures are different roles, not a hierarchy — each does its own job on the shelves.",
        },
      ],
      explanation: "The blue/green contract: dimensions group, measures aggregate within the groups. Every Tableau view is this one query rendered.",
    },
    {
      id: "e-04-q2",
      prompt: "A field dragged onto the Marks card's Color shelf becomes:",
      options: [
        {
          text: "The color encoding of every mark — a legend key per value if it is a dimension, a color scale if it is a measure",
          correct: true,
          feedback: "Correct — Color is a channel like any other: categorical hue for blue pills, sequential intensity for green.",
        },
        {
          text: "A filter limiting the view to that field's values",
          correct: false,
          feedback: "Filters live on the Filters shelf — Color encodes; it does not exclude.",
        },
        {
          text: "The chart's title text",
          correct: false,
          feedback: "Titles are captions; the Marks card is encodings only.",
        },
        {
          text: "A sort order for the axis",
          correct: false,
          feedback: "Sorting is its own control; Color carries no order information in the grammar.",
        },
      ],
      explanation: "The Marks card is the encoding surface for everything except position: Color, Size, Shape, Detail, Tooltip — the grammar's channels, one drop each.",
    },
    {
      id: "e-04-q3",
      prompt: "The most honest characterization of Show Me is:",
      options: [
        {
          text: "A translator from selected pills to viable chart types — fast, useful, and blind to your actual question",
          correct: true,
          feedback: "Correct — it knows the types of your fields, not the point of your chart; the question stays yours.",
        },
        {
          text: "An automatic analyst that chooses the best chart for the data",
          correct: false,
          feedback: "'Best' requires the question; Show Me optimizes compatibility, not communication.",
        },
        {
          text: "A legacy feature superseded by the Marks card",
          correct: false,
          feedback: "Show Me and the shelves coexist: one suggests, the other composes.",
        },
        {
          text: "A training tool that should be disabled after the first week",
          correct: false,
          feedback: "Even experts use it as a dictionary; what matures is knowing when to overrule it.",
        },
      ],
      explanation:
        "Show Me is a lookup table between pill combinations and chart types. Use it for speed; overrule it for meaning — the a-03 discipline, restated for a new interface.",
    },
  ],
};
