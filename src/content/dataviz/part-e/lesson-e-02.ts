/**
 * PART E · LESSON e-02 — "Data Modelling"
 *
 * The star schema: a central fact table of events, dimension tables
 * around it, one-to-many relationships flowing dim → fact. Why flat
 * tables fail at scale (fan-out, unshared filters, price-change
 * history), how RELATED walks a relationship in DAX, and why filter
 * direction is single by default. The charts render the course's
 * quarterly coffee numbers as the model's answers.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4 } from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

export const LESSON_V_E_02: DataVizLesson = {
  slug: "e-02",
  title: "Data Modelling",
  minutes: 25,
  summary:
    "The model is the product; reports are its shadows. The star schema — one fact table, dimensions around it, one-to-many from dim to fact — and why the flat table everyone starts with fails the moment anything changes.",
  tool: "power-bi",
  objectives: [
    "Build a star schema: one fact table at the event grain, dimension tables describing the who/what/when",
    "Explain one-to-many relationships and the single-direction filter flow from dimension to fact",
    "Say precisely why flat tables fail at scale: fan-out duplication, price-change history, unshared filters",
    "Read a model diagram and trace how a filter placed on a dimension reaches every visual that reads the fact",
  ],
  why: "Every BI failure that is not a broken query is a broken model. The flat table — one wide sheet with product name, category, price, customer address, and the sales numbers repeated on every row — is where everyone starts, and it works for a demo. It fails in three documented ways: it bloats (the product's label stored on every sale), it lies about history (a price change edits the past unless you version it, and versioning it in a flat table multiplies rows), and it cannot share filters (a slicer on 'category' has no clean path to the sales rows when category lives in five merged columns). The star schema is the fifty-year-old answer: events in the middle, descriptions around the edge, one-to-many relationships between. This lesson builds one, traces its filter flow, and names the one trap (fan-out) that punishes shortcuts.",
  blocks: [
    {
      kind: "text",
      text: "Separate the two kinds of tables that analytics data naturally divides into. **Facts** are events: a sale, a ticket, a login — rows at a grain, carrying numbers (quantity, amount) and foreign keys. **Dimensions** are descriptions: the product, the customer, the calendar — rows carrying attributes (name, category, color, month). A **star schema** puts one fact table in the middle and its dimensions around it, joined one-to-many from each dimension into the fact. The shape is the whole idea: descriptions live once, events reference them, and any filter on a description flows through the reference to every event it describes.",
    },
    {
      kind: "definition",
      term: "Star schema",
      informal:
        "A central fact table (events, at a declared grain) surrounded by dimension tables (descriptions), each related one-to-many from dimension to fact — so slicing by any description is one join away from every event.",
      why: "The star is not an aesthetic preference: it is the shape that makes filters sharable, history honest (a price change edits the dimension, not the past), and storage proportional to events rather than events-times-labels.",
    },
    {
      kind: "table",
      title: "A star for the coffee data",
      headers: ["Table", "Kind", "Key columns", "Grain / role"],
      rows: [
        ["FactSales", "Fact", "DateKey, ProductKey, QuarterKey", "One row per product per quarter per store: the events, carrying Cups"],
        ["DimProduct", "Dimension", "ProductKey", "One row per product: Name, Category (Hot/Cold), ListPrice — stored once"],
        ["DimDate", "Dimension", "DateKey", "One row per day: Date, Month, Quarter, Year — the calendar every time filter reads"],
        ["DimStore", "Dimension", "StoreKey", "One row per store: City, Region, Manager"],
      ],
      caption:
        "The fact holds numbers and keys; the dimensions hold words. 'Cold Brew' is typed once in DimProduct — not 1,777 times on Q1's sales rows.",
    },
    {
      kind: "text",
      text: "Why does the flat table fail? Three mechanisms. **Duplication**: joining product labels onto every sale stores the label thousands of times — and one typo in one row makes the same product count twice. **History**: a flat row says 'this sale, at this price' only until someone corrects the price column — then the past silently rewrites; in a star, the price lives in DimProduct with its own validity dates, and the fact keeps the key it had. **Filters**: in a star, a slicer on DimProduct[Category] flows through the relationship to FactSales automatically — every visual on the page obeys it; in a flat table, 'category' is a column among forty, and every visual must be told separately what it means.",
    },
    {
      kind: "code",
      title: "A measure that walks the relationship",
      code: `-- The model in action: revenue without storing the price in the fact
Revenue :=
SUMX (
    FactSales,
    FactSales[Cups] * RELATED ( DimProduct[ListPrice] )
)

-- RELATED works row by row: for each FactSales row, it reaches across
-- the DimProduct relationship and fetches THAT row's price. The fact
-- stores keys; the dimension stores truth.`,
      language: "dax",
      note: "This is the payoff of the star: the price can live in the dimension (editable, versionable) and still multiply into the fact's rows at calculation time. No RELATED, no star — you would be back to storing prices on events.",
      produces:
        "A measure computing total revenue from cups x price, where the price is fetched through the relationship on every evaluation — the model carrying weight the report never sees.",
    },
    {
      kind: "chart",
      chart: {
        type: "grouped-bar",
        title: "The model answering: cups by product and quarter",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({
          name: p,
          values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
        })),
        yLabel: "cups",
      },
      why: "One filter, four series: a slicer on DimDate[Quarter] would scope this entire visual through the relationship — no merge, no copy of the data, no per-visual configuration. The chart is the fact table, summarized through its dimensions.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Slicing by an attribute the fact never stored",
        categories: ["Hot drinks", "Cold drinks"],
        series: [
          {
            name: "Q4 cups",
            values: [
              COFFEE_Q4[0] + COFFEE_Q4[1] + COFFEE_Q4[2], // Espresso + Latte + Filter
              COFFEE_Q4[3],                                // Cold Brew
            ],
          },
        ],
        xLabel: "DimProduct[Category]",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "Category lives in DimProduct — one word per product — yet it slices the fact's events (Q4: 1,394 hot vs 671 cold). This is the star's quiet superpower: attributes you never stored on the events still group them, because the relationship carries the filter.",
    },
    { kind: "heading", text: "Direction: the relationship contract" },
    {
      kind: "text",
      text: "Relationships have **direction**. In the star's default, filters flow one way: from the dimension into the fact (dim → fact). Click a category in DimProduct and the filter travels to FactSales; click a fact row and nothing travels back — the fact is many, the dimension is one, and 'many' cannot sensibly filter 'one'. Power BI therefore marks every star relationship **one-to-many, single direction**, and it is right to. Bidirectional filtering exists as an option, and it is occasionally the correct one — but it is also the classic source of ambiguous filter paths and slow models, so the discipline is: single direction by default, bidirectional only when you can write the sentence that justifies it.",
    },
    {
      kind: "table",
      title: "The relationship contract",
      headers: ["From", "To", "Cardinality", "Filter direction", "Meaning"],
      rows: [
        ["DimDate", "FactSales", "One-to-many (1:*)", "Single: DimDate → FactSales", "One day has many sales; picking a day scopes the sales"],
        ["DimProduct", "FactSales", "One-to-many (1:*)", "Single: DimProduct → FactSales", "One product has many sales; picking products scopes the sales"],
        ["DimStore", "FactSales", "One-to-many (1:*)", "Single: DimStore → FactSales", "One store has many sales; picking regions scopes the stores' sales"],
      ],
      caption:
        "Every line reads the same way: one description, many events, filters flowing description → events. A relationship running the other way (many-to-one into a fact from another fact) is the fan-out warning sign.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The fan-out trap",
      text: "Never join two fact tables directly. FactSales (one row per product-quarter-store) joined to FactInventory (one row per product-quarter-warehouse) multiplies rows — each sale pairs with every matching inventory snapshot, totals silently double or worse. The fix is the dimension between them: both facts relate many-to-one into DimProduct, and any comparison crosses through the shared dimension. A model diagram with a fact-to-fact edge is a defect waiting for a quarter-end to reveal it.",
    },
    {
      kind: "interpretation",
      id: "e-02-i1",
      chart: {
        type: "stacked-bar",
        title: "Quarterly cups, stacked by product — the fact, summarized",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({
          name: p,
          values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
        })),
        yLabel: "cups",
      },
      prompt:
        "This visual reads the fact table through two dimensions at once (quarter, product). What does it show about the year, and what would a slicer on DimProduct[Category] do to it?",
      options: [
        {
          text: "Totals rise every quarter (1,777 → 1,878 → 1,939 → 2,065) with the Cold Brew segment growing (476 → 671) while Filter shrinks (301 → 258); a category slicer would rescope the whole visual to the selected category's products through the relationship",
          correct: true,
          feedback:
            "Correct — the fact's trajectory and composition in one reading, and the slicer's power is precisely that it needs no re-merge: the filter flows DimProduct → FactSales and every segment recomputes.",
        },
        {
          text: "The totals are flat and nothing grew",
          correct: false,
          feedback: "The column tops rise every quarter — 1,777 to 2,065, +16% across the year. The stacking did not hide the totals; it exposed them.",
        },
        {
          text: "A category slicer would break the visual because Category is not on the chart",
          correct: false, 
          feedback: "The opposite: unshown dimensions slice cleanly BECAUSE they live in DimProduct and flow through the relationship — the chart needs no Category field to be filtered by it.",
        },
        {
          text: "A quarter slicer could not affect this visual because the chart already shows quarters",
          correct: false,
          feedback:
            "Showing a field never blocks filtering by it: the slicer scopes DimDate through the relationship, and every column — displayed or not — recomputes inside the selection.",
        },
      ],
      explanation:
        "A model-backed visual is a lens, not a snapshot: the same fact table, sliced by whichever dimensions the reader engages. The stacked bar's rising totals and shifting composition are the fact's story; the slicer is the star's.",
    },
    {
      kind: "exercise",
      id: "e-02-e1",
      exerciseKind: "concept-check",
      prompt:
        "You inherit a 40-column flat table: every order row carries product name, category, list price, customer name, customer city, customer tier, and the order's amounts. Redesign it as a star schema, and justify each split with the failure it prevents.",
      options: [
        {
          text: "FactOrders (keys + amounts at order grain), DimProduct (name, category, list price — labels stored once, history versionable), DimCustomer (name, city, tier — one row per customer, filters shared across every visual)",
          correct: true,
          feedback:
            "Correct — three of the four splits each prevent a named failure: duplication (product labels), history (price edits rewriting the past), and filter sharing (customer tiers slicing every visual through one relationship).",
        },
        {
          text: "Keep the flat table but hide the duplicate-smelling columns",
          correct: false,
          feedback: "Hiding columns changes the view, not the storage: the duplication, the history problem and the filter problem all survive intact.",
        },
        {
          text: "Split into FactOrders plus one giant DimEverything for all descriptions",
          correct: false,
          feedback: "One mega-dimension re-creates flatness on the edge of the star — customer tiers would slice through product attributes they have nothing to do with.",
        },
        {
          text: "Split by column type: numeric tables and text tables",
          correct: false,
          feedback: "The split is by GRAIN and ROLE — events versus descriptions — not by data type. Numeric-vs-text tables still repeat labels and break filters.",
        },
      ],
      explanation:
        "Model by grain: one fact at the event grain, one dimension per describing entity. Each split must earn itself by naming the flat-table failure it prevents — that is the discipline that scales.",
    },
  ],
  terms: [
    {
      term: "fact table",
      definition: "The events: one row per event at a declared grain (per product-quarter-store), carrying measures (Cups, Amount) and foreign keys to dimensions.",
    },
    {
      term: "dimension table",
      definition: "The descriptions: one row per entity (product, customer, day), carrying attributes. Stored once, joined many — the side that never duplicates.",
    },
    {
      term: "fan-out",
      definition: "The row-multiplication defect when two tables at different grains are joined: each row of one pairs with every matching row of the other, silently multiplying totals.",
    },
  ],
  takeaways: [
    "Facts are events at a grain; dimensions are descriptions. The star joins them one-to-many, dim → fact.",
    "Flat tables fail three ways: duplicated labels, rewritten history, and filters no visual shares automatically.",
    "RELATED walks a relationship row by row — the dimension's truth multiplied into the fact's events at calculation time.",
    "Single filter direction by default; bidirectional only with a sentence that justifies it. Never join fact to fact — put the dimension between.",
  ],
  quiz: [
    {
      id: "e-02-q1",
      prompt: "In a star schema, the fact table holds:",
      options: [
        {
          text: "The events at their grain: foreign keys and measured amounts — one row per product-quarter-store, not per label",
          correct: true,
          feedback: "Correct — descriptions live once in dimensions; the fact carries keys and numbers, and stays proportional to events.",
        },
        {
          text: "The descriptive attributes: names, categories, addresses",
          correct: false,
          feedback: "Those are dimension payloads — storing them per event is the flat-table defect the star exists to prevent.",
        },
        {
          text: "Only the primary keys, with all numbers in the dimensions",
          correct: false,
          feedback: "The reverse: numbers (measures) belong to facts, words to dimensions.",
        },
        {
          text: "Whatever the source system's table happened to contain",
          correct: false,
          feedback: "The model is designed, not inherited — grain and role are decisions, not accidents of the source.",
        },
      ],
      explanation: "Facts carry events and measures; dimensions carry descriptions. Every other star-schema rule follows from keeping the two apart.",
    },
    {
      id: "e-02-q2",
      prompt: "A relationship DimProduct → FactSales, one-to-many, single direction, means:",
      options: [
        {
          text: "One product has many sales, and a filter on DimProduct flows to FactSales — but nothing flows back from the fact",
          correct: true,
          feedback: "Correct — the one side describes, the many side is described, and filters travel description → events only.",
        },
        {
          text: "One sale has many products",
          correct: false,
          feedback: "Reversed: the many side is the sales — each sale is one product's event, one of that product's many.",
        },
        {
          text: "Filters can flow both ways between the tables",
          correct: false,
          feedback: "That is bidirectional filtering — an option, a risk, and explicitly not the single-direction default.",
        },
        {
          text: "The tables are merged into one wide table at refresh",
          correct: false,
          feedback: "Nothing merges: the relationship is a join path traversed at query time, which is the whole point.",
        },
      ],
      explanation: "One-to-many single-direction is the star's default contract: descriptions filter events, events never filter descriptions, and ambiguity never gets a foothold.",
    },
    {
      id: "e-02-q3",
      prompt: "The fan-out trap bites when:",
      options: [
        {
          text: "Two tables at different grains are joined directly — each row of one pairs with every matching row of the other, multiplying totals",
          correct: true,
          feedback: "Correct — sales joined to inventory snapshots: each sale meets every snapshot of the same product, and sums double or worse.",
        },
        {
          text: "A dimension has more than one million rows",
          correct: false,
          feedback: "Size is a capacity question; fan-out is a GRAIN question — it can bite at a thousand rows or a billion.",
        },
        {
          text: "Two dimension tables share a column name",
          correct: false,
          feedback: "A naming collision is confusing, not multiplicative — no rows are created by it.",
        },
        {
          text: "The fact table has no measures, only keys",
          correct: false,
          feedback: "A key-only fact is thin, not fan-out — multiplication comes from joining mismatched grains, not from missing columns.",
        },
      ],
      explanation: "Fan-out is a grain defect: join two many-sided tables and every match multiplies. The cure is the dimension between them, giving both facts a shared, one-sided path.",
    },
  ],
};
