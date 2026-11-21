/**
 * PART E · LESSON e-01 — "Power BI Fundamentals"
 *
 * The workflow, the views, the panes, and the storage trade. Get Data →
 * Power Query → Model → Report is the pipeline; Report/Data/Model are
 * its three views; visual/field/format are the panes that assign
 * encodings; import vs DirectQuery is the first architectural decision.
 * The Power Query M listing is real; the report visual renders the
 * course's shared coffee numbers.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q4, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_E_01: DataVizLesson = {
  slug: "e-01",
  title: "Power BI Fundamentals",
  minutes: 25,
  summary:
    "The pipeline before the pictures: Get Data → Power Query → Model → Report; the three views (Report, Data, Model); the panes that turn fields into encodings; and import vs DirectQuery — the first decision that shapes everything downstream.",
  tool: "power-bi",
  objectives: [
    "Walk the four-stage workflow: Get Data → Power Query → Model → Report",
    "Name the three views — Report, Data, Model — and what each is for",
    "Read the panes: the visual gallery, the field wells, and the format options as encoding assignment",
    "Choose between import mode and DirectQuery and state the trade",
  ],
  why: "Everything you have built so far lived in a script: you wrote the chart, you ran the chart, the chart existed once. Business intelligence inverts that. Many people read the same data on a schedule, ask repeated questions of it, and need the answers governed — refreshable, consistent, correct next month without you. Power BI is the industry's workhorse for that inversion, and its power is also its trap: because the tool hides the pipeline behind a friendly interface, practitioners who skip the pipeline's second and third stages (shaping and modelling) build reports that are slow, wrong, and unmaintainable by the time anyone notices. This lesson walks the whole workflow once, names every surface you will touch, and makes the first architectural decision — import or DirectQuery — explicit rather than accidental.",
  blocks: [
    {
      kind: "text",
      text: "A Power BI project is a **pipeline**, not a picture. Data arrives from somewhere (Get Data), is shaped into analysis-ready tables (Power Query), is related into a model (Model view), and only then is charted (Report view). Each stage feeds the next, and the cardinal sin of BI work is skipping ahead: charting raw, unshaped, unmodelled data produces visuals that work in the demo and fail in the second month. The four stages, in order, with what goes wrong when each is skipped:",
    },
    {
      kind: "table",
      title: "The workflow, stage by stage",
      headers: ["Stage", "What happens", "What skipping it costs"],
      rows: [
        ["Get Data", "Connect: CSV, database, web, folder — the sources are declared, not pasted", "Numbers nobody can trace; every refresh a manual re-paste"],
        ["Power Query", "Shape: type columns, filter rows, pivot/unpivot, append — every step recorded and replayed at refresh", "Dirty data re-cleaned by hand forever; silently wrong joins"],
        ["Model", "Relate tables: fact to dimensions, one-to-many (e-02's whole subject)", "Flat-table chaos; measures that double-count; filters that ignore each other"],
        ["Report", "Compose: drag fields onto visuals — encodings, finally", "A gallery of charts with no decision, the e-05 subject"],
      ],
      caption:
        "The stages are also an accountability chain: every number on a report page can be traced back through model, query, and connection to a source system.",
    },
    {
      kind: "definition",
      term: "Power Query",
      informal:
        "The ETL layer of Power BI: every transformation you apply — change type, filter, merge, append — is recorded as a step in the M language and replayed automatically at each refresh.",
      why: "This is what makes a BI report *governed*: the cleaning is not a one-time act but a replayable program. 'I fixed it in Excel' has no equivalent here — the fix IS the query.",
    },
    {
      kind: "code",
      title: "One Power Query step chain, in M",
      code: `let
    Source = Csv.Document(
        File.Contents("C:\\data\\sales-2024.csv"),
        [Delimiter = ",", Encoding = 65001]
    ),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Typed = Table.TransformColumnTypes(
        Promoted,
        {{"OrderDate", type date}, {"Amount", type number}, {"Product", type text}}
    ),
    Clean = Table.SelectRows(Typed, each [Amount] > 0)
in
    Clean`,
      language: "text",
      note: "You rarely type M by hand — the query editor writes it as you click. But the language is always visible (Advanced Editor), and reading it is the difference between operating the tool and understanding it. Each let-step names a table; the in-clause returns the last one.",
      produces:
        "A typed, cleaned sales table that re-applies itself on every refresh: headers promoted, three columns typed, non-positive amounts filtered out.",
    },
    {
      kind: "heading",
      text: "The three views",
    },
    {
      kind: "text",
      text: "Power BI Desktop shows the same file through three views, left to right in the ribbon: **Report** (the canvas where visuals are composed — where readers live), **Data** (a grid of the loaded tables — where you verify the query did what you think), and **Model** (a diagram of tables and their relationships — where e-02 will spend its whole lesson). The discipline of good BI work is moving backwards through them: when a report number looks wrong, the defect is almost never on the canvas — it is in the model or the query, one view to the left.",
    },
    {
      kind: "text",
      text: "On the Report canvas, three panes do the work. The **Visualizations pane** offers the visual gallery (choose the mark family) and, once a visual is selected, its **field wells** — Axis, Values, Legend: the exact encoding slots a chart type supports, the grammar of graphics again but with drag-and-drop in place of `x=`, `y=`. The **Format pane** (the paintbrush) controls everything cosmetic: titles, colors, labels. The mapping back to Part A is exact: gallery = mark type, wells = channels, format = annotation and styling. What Power BI adds is the **Fields pane** — the model itself, browsable: every table, every column, every measure you have defined, draggable onto any well.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "The report visual that drag-and-drop builds",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product (Axis well)",
        yLabel: "cups (Values well)",
        showValues: true,
        showLegend: false,
      },
      why: "What the wells produce: Product dragged onto Axis, Cups onto Values, a bar visual selected from the gallery — and SUM(Cups) per product is what the engine renders. Cold Brew leads at 671; Filter trails at 258. Note what the Values well quietly did: it AGGREGATED (summed) — the default behavior that e-04's dimensions-versus-measures lesson will make explicit.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Same wells, new gallery choice: Date on Axis, Revenue on Values",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        xLabel: "month (Axis well)",
        yLabel: "revenue (k$) (Values well)",
        showLegend: false,
      },
      why: "The gallery half of the grammar: keep the fields where they were (month on Axis, a measure on Values) and swap the visual from bar to line — the wells accept both, and the mark family changes while the query stays the same. One workflow, two charts from one field assignment: 124 climbing to 204 k$ as a trend instead of twelve verdicts.",
    },
    {
      kind: "heading",
      text: "Import vs DirectQuery",
    },
    {
      kind: "text",
      text: "The first architectural decision, usually made in the first five minutes and rarely revisited: **where does the data live while the report reads it?** Import mode copies the data into Power BI's own engine (fast, fully featured, stale until refreshed). DirectQuery leaves the data in the source and translates every visual interaction into a live query (fresh, slow, constrained). Neither is wrong; each is a commitment.",
    },
    {
      kind: "table",
      title: "The storage trade",
      headers: ["", "Import", "DirectQuery"],
      rows: [
        ["Data location", "Copied into the report's own columnar store", "Stays in the source; queries sent live"],
        ["Speed on canvas", "Milliseconds — aggregations precomputed", "Network round-trips; heavy visuals lag"],
        ["Freshness", "As stale as the last refresh schedule", "Current at query time"],
        ["DAX + feature support", "Complete (time intelligence, calculations on anything)", "Constrained — some functions push down poorly or not at all"],
        ["Choose when", "Data fits in memory; freshness measured in hours", "Near-real-time needs, or data too large to copy"],
      ],
      caption:
        "The honest default for analytical workloads is import + scheduled refresh; DirectQuery is a targeted tool for freshness and volume, paid for in speed and features.",
    },
    {
      kind: "interpretation",
      id: "e-01-i1",
      chart: {
        type: "line",
        title: "A report visual: monthly revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      prompt:
        "This line visual sits on a report page whose slicers filter by region. What does the visual itself communicate, and what will the reader check the model for?",
      options: [
        {
          text: "Revenue climbed all year from 124 to 204 k$ (+65%), with the steepest gains in Q4 (171 → 189 → 204); the reader trusts the trend only if the model's filter direction and slicer behavior mean the same months are being counted under any region selection",
          correct: true,
          feedback:
            "Correct — the visual makes the claim (+65%, Q4 acceleration); the model determines whether the claim survives filtering. Canvas, then one view to the left: the pipeline discipline.",
        },
        {
          text: "Revenue doubled, and the slicer cannot affect a line chart",
          correct: false,
          feedback: "It grew about 65% (124 to 204), and slicers filter every visual on the page — that is their job, and the model's job is to filter them correctly.",
        },
        {
          text: "Nothing — report visuals are decorative until published",
          correct: false,
          feedback: "The visual is the claim; the deployment layer only distributes it. The reading (+65%, Q4 acceleration) is already complete on the canvas.",
        },
        {
          text: "The trend proves the pipeline stages were completed in order",
          correct: false,
          feedback: "A nice-looking line proves nothing about the pipeline — that is exactly why the backwards-audit discipline (report → model → query) exists.",
        },
      ],
      explanation:
        "The canvas makes claims; the pipeline makes them true. Reading a BI visual is two acts: what does it say (+65%, Q4 acceleration), and would it still say that under every filter the model permits?",
    },
    {
      kind: "exercise",
      id: "e-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "An operations team wants a dashboard over their ticketing database with minute-level freshness, running complex calculations on 40 million rows. A colleague proposes import mode with a refresh every 15 minutes. Audit the proposal.",
      options: [
        {
          text: "Reject the freshness half: minute-level needs DirectQuery (or a hybrid), because import is only as fresh as its last refresh — but check the calculation half too, since 40M rows with heavy DAX may push down badly over DirectQuery; the honest answer is likely DirectQuery for the operational tiles and import for the analytical ones",
          correct: true,
          feedback:
            "Correct — the requirement splits the solution: freshness pushes toward DirectQuery, heavy calculation pushes back. Composite models exist precisely for this tension, and naming both pressures is the audit.",
        },
        {
          text: "Accept: import mode is always faster, so it must always be right",
          correct: false,
          feedback: "Import IS faster on canvas — but it is stale by design, and 'minute-level' is a freshness requirement the refresh schedule cannot meet at any interval you would enjoy paying for.",
        },
        {
          text: "Reject entirely: DirectQuery is the only professional choice",
          correct: false, 
          feedback: "DirectQuery pays in speed and feature constraints; a blanket choice ignores what the requirement actually needs — the audit is per-requirement, not ideological.",
        },
        {
          text: "Accept, and refresh every minute to be safe",
          correct: false,
          feedback: "A one-minute import refresh of 40M rows taxes the source, the gateway, and the refresh queue — freshness by brute force is an anti-pattern.",
        },
      ],
      explanation:
        "The import/DirectQuery decision is per-workload, not per-person: freshness argues one way, calculation weight the other, and composite models are the honest resolution when requirements pull apart.",
    },
  ],
  terms: [
    {
      term: "Power Query",
      definition: "The ETL layer: transformations recorded as M steps and replayed at every refresh — the cleaning is a program, not an act.",
    },
    {
      term: "field well",
      definition: "A visual's encoding slot — Axis, Values, Legend — to which fields are dragged. Gallery = mark type, wells = channels, format = styling.",
    },
    {
      term: "DirectQuery",
      definition: "The storage mode where data stays in the source and every visual interaction becomes a live query — freshness at the price of speed and feature constraints.",
    },
  ],
  takeaways: [
    "Power BI is a pipeline — Get Data, Power Query, Model, Report — and skipping stages produces reports that fail in month two.",
    "Three views, one audit direction: when a number looks wrong, move left from Report through Data to Model.",
    "Field wells are the grammar of graphics with drag-and-drop: the Values well's quiet SUM is the default that e-04 will make explicit.",
    "Import buys speed and features with staleness; DirectQuery buys freshness with speed and constraints. Decide per requirement, not by habit.",
  ],
  quiz: [
    {
      id: "e-01-q1",
      prompt: "The Power BI workflow, in order, is:",
      options: [
        {
          text: "Get Data → Power Query → Model → Report",
          correct: true,
          feedback: "Correct — connect, shape, relate, then compose. Each stage feeds the next.",
        },
        {
          text: "Report → Model → Power Query → Get Data",
          correct: false,
          feedback: "That is the audit direction (tracing a suspicious number backwards), not the build direction.",
        },
        {
          text: "Get Data → Report → Model → Power Query",
          correct: false,
          feedback: "Charting before shaping and modelling is the cardinal sin — the demo that fails in month two.",
        },
        {
          text: "Power Query → Get Data → Report → Model",
          correct: false,
          feedback: "The query editor cannot run before a connection exists — Get Data is always first.",
        },
      ],
      explanation: "Build forwards (connect, shape, relate, compose), audit backwards (canvas → model → query). Both directions are the same pipeline read differently.",
    },
    {
      id: "e-01-q2",
      prompt: "The Data view's specific job is:",
      options: [
        {
          text: "Verifying the loaded tables in a grid — checking that the query's steps produced the data you think they did",
          correct: true,
          feedback: "Correct — it is the pipeline's checkpoint between shaping and modelling, where wrong types and lost rows reveal themselves.",
        },
        {
          text: "Drawing the relationships between tables",
          correct: false,
          feedback: "That is the Model view's diagram — Data is the grid of loaded rows.",
        },
        {
          text: "Composing visuals on the canvas",
          correct: false,
          feedback: "That is the Report view; Data is where you check the rows beneath the visuals.",
        },
        {
          text: "Writing M step chains by hand",
          correct: false,
          feedback: "M lives in the Power Query editor; the Data view displays its RESULTS.",
        },
      ],
      explanation: "Three views, three jobs: Report composes, Model relates, Data verifies. The middle view is the cheapest place to catch a shaping mistake.",
    },
    {
      id: "e-01-q3",
      prompt: "Import mode's defining trade is:",
      options: [
        {
          text: "Speed and full feature support, paid for with staleness between scheduled refreshes",
          correct: true,
          feedback: "Correct — a private columnar copy: milliseconds on canvas, complete DAX, current only as of the last refresh.",
        },
        {
          text: "Freshness at query time, paid for with slower visuals",
          correct: false,
          feedback: "That is DirectQuery's trade — the two modes mirror each other.",
        },
        {
          text: "No limit on data volume",
          correct: false,
          feedback: "Import copies the data, so volume is precisely its constraint; DirectQuery exists partly because of that limit.",
        },
        {
          text: "Automatic removal of the need to model relationships",
          correct: false,
          feedback: "Storage mode and the model are orthogonal — import does not relate your tables for you.",
        },
      ],
      explanation: "Import = copy it in: fast and capable, stale by construction. Every architectural choice in Power BI starts by pricing this trade against the freshness requirement.",
    },
  ],
};
