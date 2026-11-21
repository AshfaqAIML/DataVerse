/**
 * PART_E_V_EXERCISES — the Part E practice battery (8 exercises,
 * tiered). Part E spans tools and decision craft: the batteries pair
 * tool mechanics (pipeline, model, DAX, pills) with the design and
 * story disciplines above them, and every solution is a worked
 * model answer in prose plus real syntax where syntax is the point.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_E_V_EXERCISES: Exercise[] = [
  {
    id: "e-vb1",
    tier: "beginner",
    title: "The month-two failure, traced backwards",
    prompt:
      "A regional sales report worked perfectly at demo and broke in month two: the numbers are 'slightly off', nobody can say which source they came from, and a product renamed in the source system now appears twice. Using the four-stage pipeline (Get Data → Power Query → Model → Report) and the three views, name the stage each symptom came from and write the audit order you would walk.",
    hint: "Audit backwards: canvas → model → query → connection. Which stage owns 'the same product counts twice', and which owns 'nobody can trace the numbers'?",
    solution: `Symptom by symptom, backwards from the canvas:
1. 'The same product counts twice' is a MODEL defect: the label was joined onto the fact rows (flat-table thinking), so a rename or a typo in one row forks the product. In a star, the name lives once in DimProduct and the fact keeps a key — the audit lands in Model view.
2. 'Slightly off numbers' is a QUERY defect: a filter step (e.g. Amount > 0) applied to the demo file but not to the refreshed one, or a type coercion silently dropping rows — the Data view is where loaded rows are verified against what the query claims to do.
3. 'Nobody can trace the numbers' is a CONNECTION defect: data pasted rather than declared, so there is no source to audit — Get Data exists precisely to make the source a first-class, inspectable object.
The audit order is the discipline: Report → Data → Model → Power Query → source. A number on the canvas is only ever the shadow of the pipeline behind it.`,
    concepts: ["BI pipeline", "backwards audit", "governed reporting"],
  },
  {
    id: "e-vb2",
    tier: "beginner",
    title: "Classify the tables, draw the star",
    prompt:
      "An order-tracking workbook holds: Orders (one row per order: date, customer id, product id, quantity, unit price), Products (id, name, category, list price), Customers (id, name, city, segment), and a Calendar (date, month, quarter). Classify each table as fact or dimension, name the fact's grain in one sentence, and list the relationships with their cardinality and filter direction.",
    hint: "Facts are events with numbers at a grain; dimensions are descriptions. Filters flow from the one side to the many side.",
    solution: `Orders is the FACT — its grain: one row per order line (date × customer × product), carrying the measures quantity and unit price. Products, Customers and Calendar are DIMENSIONS — descriptions stored once and referenced by key.
Relationships, all one-to-many, single-direction (dimension → fact):
- Products[id] *—— Orders[product id]
- Customers[id] *—— Orders[customer id]
- Calendar[date] *—— Orders[date]
Filter direction follows the cardinality: a slicer on Products[category] flows into Orders and scopes every visual reading the fact; nothing flows back up to the dimension. The payoff: renaming a product edits one row in Products; the past stays honest; and any attribute you never stored on the event (city, segment, quarter) still slices the orders through its dimension.`,
    concepts: ["star schema", "fact and dimension", "filter direction"],
  },
  {
    id: "e-vi1",
    tier: "intermediate",
    title: "Write the KPI measure — and catch the row-level trap",
    prompt:
      "You need 'Margin %' on the executive page: a headline card, a by-region matrix and a monthly trend, all correct at their own grain. Write the DAX. Then explain why the calculated-column version (Margin % = Sales[Profit] / Sales[Revenue] on each row, averaged in visuals) is quietly wrong, and why DIVIDE matters more than '/' here.",
    hint: "Ratios of totals are not the average of row-level ratios — Simpson's gap. And the KPI will meet a region with zero revenue one day.",
    solution: `The measure:
Margin % :=
DIVIDE (
    [Total Profit],
    [Total Revenue]
)

Why not a calculated column: a row-level Profit/Revenue fixes a ratio per row at refresh time; when a visual averages those ratios it computes the MEAN OF RATIOS, not the RATIO OF TOTALS — a region of one huge high-margin order and many tiny low-margin ones reports the wrong margin. The measure divides SUM by SUM inside whatever filter context asks, so the card, the matrix cell and the monthly point are each their own correct ratio of totals.
Why DIVIDE: '/' raises a divide-by-zero error — one region with zero revenue blanks the tile or the whole visual. DIVIDE returns blank (or an alternate you set), which formats as an honest 'nothing here' rather than an error card. One measure, every grain, no error tiles: the e-05 headline band depends on exactly this pattern.`,
    concepts: ["DAX measures", "filter context", "ratio of totals vs mean of ratios"],
  },
  {
    id: "e-vi2",
    tier: "intermediate",
    title: "One chart, two grammars",
    prompt:
      "Build 'quarterly cups by product' (the course's coffee data) in BOTH tools. Specify: (a) the Power BI path — visual from the gallery, fields into wells (name each well), implicit aggregation; (b) the Tableau path — the pill state (which shelf, which pill colour). Then name the philosophical difference between the two interfaces and one thing each philosophy protects you from.",
    hint: "Wells belong to a chosen visual; shelves are shared across all marks. One asks 'which chart?', the other asks 'which fields?'",
    solution: `(a) Power BI: pick the clustered column chart from the Visualizations gallery → drag Quarter onto the Axis well, Product onto the Legend well, Cups onto the Values well — the well's implicit aggregation renders SUM(Cups) per quarter per product. The chart type was chosen FIRST; the wells are that visual's own slots.
(b) Tableau: drag Quarter (a dimension, blue) onto Columns, SUM(Cups) (a measure, green) onto Rows, Product (a dimension, blue) onto the Marks card's Color — the bar chart is DERIVED from the pill state; Show Me would have suggested it.
The difference: Power BI is visual-first (pick the container, then fill its form), Tableau is fields-first (place the fields, watch the chart derive). Power BI's gallery protects beginners from invalid combinations — a visual's wells only accept what it can encode. Tableau's shelf grammar transfers to novel chart types — one grammar, composable, instead of one form per visual. Bilingual is the market's demand; the grammar of graphics beneath is identical (a-03, unchanged).`,
    concepts: ["field wells", "pill shelves", "grammar of graphics"],
  },
  {
    id: "e-vi3",
    tier: "intermediate",
    title: "Redesign the twelve-tile monster",
    prompt:
      "You inherit an ops dashboard: twelve equal tiles (four line charts, five tables, two gauges, a logo), no page title, three different greens meaning three different things, slicers defaulting to 'all time'. The audience is a weekly standup deciding what to act on this week. Redesign it: page claim title, the three layers and what goes where, the encoding fixes, and the default filter state.",
    hint: "One screen, one decision. Five-second read: verdicts on top, trends in the middle, evidence below. Same measure, same green.",
    solution: `The redesign, layer by layer:
1. Claim title: 'This week: growth on plan, support queue clearing, incident rate concentrated at one branch' — the page states its finding (a-07 promoted to screens).
2. Headline band (top): four KPI verdicts with targets — growth vs plan, queue age vs target, incident RATE per thousand rides (a-08's denominator rule), satisfaction with its segment flag.
3. Trend row (middle): each KPI's last 12 weeks — one line each, direct labels, no side legends.
4. Detail layer (bottom): the branch table, the queue-by-segment breakdown, the drill evidence. Tables live here, not top-left — precision is not priority.
5. Encoding fixes: one green = one meaning (all 'vs target' states share the scale); same measure, same colour everywhere; gauges replaced (a gauge is a bar with one number's worth of information and four charts' worth of ink).
6. Default state: current week vs prior week — the standup's question — with history one click away, never 'all time' by accident.
The refused tiles (the logo, the redundant gauges, two of the five tables) move to the drill layer or out: every tile must answer or evidence the decision, or it does not earn pixels.`,
    concepts: ["dashboard layout", "one screen one decision", "encoding consistency"],
  },
  {
    id: "e-va1",
    tier: "advanced",
    title: "The board story, storyboarded",
    prompt:
      "The board meets to decide next year's product investment. Your evidence: revenue grew steadily for two years (2024 finished 27% above 2023); under the totals, Cold Brew overtook Latte in Q3 (618 vs 596) while Filter declined all four quarters (301 → 258). Write the four SCQA claim titles (one sentence each), name each act's chart and its scope, and climb the so-what ladder from observation to recommendation — stopping exactly where the data stops.",
    hint: "Situation earns the 'but'. The answer act may project, but the projection wears its label. Read your four titles aloud: do they form an argument?",
    solution: `Situation — 'Two years of steady growth: December closed 38% up year over year.' Chart: 2023 vs 2024 monthly lines. Scope: totals only — the mix stays hidden on purpose; stability is the point.
Complication — 'The mix under the growth is turning over: Cold Brew passed Latte in Q3 while Filter slid all year.' Chart: per-product quarterly lines. Scope: products, four quarters — totals already established, not repeated.
Question — 'Where does next year's growth come from — and what do we do about Filter?' No chart: one sentence, the pivot.
Answer — 'Back Cold Brew's season with the spring launch; bring Filter a keep-fix-or-kill decision this quarter.' Chart: the plan, explicitly labelled a projection.
The so-what ladder: observation — Cold Brew is the new volume leader-in-waiting and Filter is a four-quarter decline; so what — a menu, marketing calendar and inventory planned for a Latte-first world are aimed at the wrong target; therefore — shift the launch budget to Cold Brew's season and decide Filter's future now. Where the data stops: nothing here measures MARGIN or CAUSES — the recommendation is a plan for the board to weigh, not a fact for the deck to assert, and the projection slide says 'projected' in its title.`,
    concepts: ["SCQA", "title test", "so-what ladder"],
  },
  {
    id: "e-va2",
    tier: "advanced",
    title: "Model the survey — where every field lives",
    prompt:
      "The company runs monthly employee-satisfaction surveys (60 respondents across five departments, scores 1–10) and logs support incidents (branch, date, ride count). The exec page must show satisfaction trend by department and incident RATE per thousand rides by branch. Design the star: fact tables with grains, dimensions, where each needed field lives, the two measures in DAX, and why the flat-table version fails both KPIs.",
    hint: "Two events, two facts, shared dimensions. A rate is a ratio of two measures evaluated together — never a stored column. An average over a bimodal population needs its segment breakout available.",
    solution: `The star: two facts, shared dimensions.
- FactSurvey: one row per response (DateKey, EmployeeDeptKey, Score). Grain: response.
- FactIncident: one row per incident (DateKey, BranchKey, severity). Grain: incident. Ride counts arrive as FactRides (BranchKey, DateKey, Rides) — the denominator is a fact too, at its own grain.
- Dimensions: DimDate (shared by everything — the trend axis), DimDepartment, DimBranch.
The measures:
Satisfaction Avg := AVERAGE(FactSurvey[Score]) — correct per department, per month, because filter context does the grouping.
Incident Rate := DIVIDE([Total Incidents], [Total Rides]) — a ratio of totals, safe at any grain; a rate stored as a column would be frozen at refresh and wrong at every aggregation.
Why flat fails: one wide sheet merges survey responses with incidents and rides — the grains conflict (a response is not a ride), the join fans out and every measure double-counts; and satisfaction averaged across departments reports a calm 6.4 that no department actually experiences (the bimodal trap: Design and Engineering at 7–9, Support at 3–6) — which is exactly why the model must keep DimDepartment close, so the page can break the headline by segment when the split is the story.`,
    concepts: ["star schema", "grain", "ratio measures", "bimodal average"],
  },
  {
    id: "e-va3",
    tier: "advanced",
    title: "The hostile room: thirty seconds, two attacks",
    prompt:
      "You are presenting the coffee-mix story (e-va1's board story) answer-first to a CFO who gives you thirty seconds before deciding you are wasting them, and who will attack at the two weakest points: the Filter decline ('four quarters is a trend?') and the recommendation ('you are projecting a trend you just met'). Write your opening thirty seconds (the pyramid: answer, three supports), then script your drill answer to each attack — the evidence page you bring up, in the order you bring it up.",
    hint: "Answer first, then supports, then evidence on demand. A four-quarter decline is defended by its consistency and its per-quarter arithmetic; a projection is defended by labelling it a decision for the board, not a fact from the data.",
    solution: `The opening (thirty seconds): 'Our recommendation: move the spring launch into Cold Brew's season and bring Filter to a keep-fix-or-kill decision this quarter. Three supports: two years of steady growth total; a mix turnover underneath it — Cold Brew passed Latte in Q3; and a four-quarter Filter decline that compounds the stakes. The appendix has every chart; I will bring up whichever support you want to test.'
Attack 1 — 'Four quarters is a trend?': drill to the Filter line: 301, 286, 274, 258 — a decline with no recovering quarter, about −14% across the year, while every other product grew. The honest caveat offered before it is asked: four points is short; that is why the recommendation is a DECISION THIS QUARTER (watch one more quarter with named thresholds), not a five-year plan. The CFO attacks certainty; you defend process.
Attack 2 — 'You are projecting a trend you just met': agree, on the record: the projection slide is labelled a projection, and the ask is not 'believe this forecast' but 'choose where the launch budget sits while we learn' — an options decision with the evidence one click below. The pyramid holds because the answer was always a recommendation, never a fact wearing a suit: that is the difference between a story and a pitch (e-06's closing rule).`,
    concepts: ["pyramid principle", "drill path", "defending forecasts honestly"],
  },
];
