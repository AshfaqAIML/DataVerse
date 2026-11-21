/**
 * PART D · LESSON d-04 — "Dashboards"
 *
 * Composition and delivery. make_subplots(rows=, cols=, subplot_titles=)
 * assembles several views into one figure with shared axes; the Dash
 * framework serves that figure on the web with a three-line pattern
 * (dcc.Graph(figure=fig)); and the dashboard-design discipline — one
 * screen, one decision — is the audit standard for both. Registry
 * subject dashboard-design material, taught here from the code side.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4, EXPENSES_2024, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const quarterlyTotals = [COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4].map((q) =>
  q.reduce((a, v) => a + v, 0),
);

export const LESSON_V_D_04: DataVizLesson = {
  slug: "d-04",
  title: "Dashboards",
  minutes: 25,
  summary:
    "From one figure to one screen: make_subplots composes tiles with shared axes, Dash serves the result in three lines (dcc.Graph(figure=fig)), and the discipline holding it together is dashboard design — one screen, one decision.",
  tool: "plotly",
  objectives: [
    "Compose a multi-view figure with make_subplots(rows=, cols=, subplot_titles=) and add_trace(row=, col=)",
    "Use shared_xaxes so every row honors one window — the built-in linked interaction",
    "Serve a figure on the web with the three-line Dash pattern: layout, dcc.Graph(figure=fig), app.run()",
    "Audit a dashboard by its question — one screen, one decision — before admiring its charts",
  ],
  why: "One chart answers one question. A decision needs several — is revenue growing, is the margin surviving that growth, and what is selling — and the reader needs them answered together, aligned, on one screen. That composition is a dashboard, and its failure modes are as famous as its successes: the twelve-tile grid where nothing hierarchizes, the tiles answering one question's halves with inconsistent encodings, the wall of charts with no headline. This lesson covers the plotly machinery of composition (make_subplots, shared axes) and the delivery mechanism (a three-line Dash app), but the machinery serves one discipline from the dashboard-design subject: name the decision first, and make every tile report to it.",
  blocks: [
    {
      kind: "text",
      text: "A **dashboard** is not a collection of charts that happen to share a screen. It is a composition with a job: arrange several views so that one named decision can be made at a glance — *are we on track, and where do I look if not?* Every design question that follows (how many tiles, what order, whose axis) is answered by reference to that decision, and a tile that does not serve it is a gallery piece.",
    },
    {
      kind: "definition",
      term: "Dashboard",
      informal:
        "One screen, one decision: a composition of charts (and a few numbers) arranged so the reader can make a specific, named decision — the headline first, the detail on demand.",
      why: "The definition is an audit tool: if you cannot name the decision the screen serves, no amount of chart quality will save it. e-05 turns this into a full design method; here it is the standard your composition must meet.",
    },
    {
      kind: "heading",
      text: "Composition: make_subplots",
    },
    {
      kind: "code",
      title: "Two tiles, one window",
      code: `from plotly.subplots import make_subplots
import plotly.graph_objects as go

fig = make_subplots(
    rows=2, cols=1,
    shared_xaxes=True,                 # one window, both rows
    subplot_titles=("Revenue", "Expenses"),
)

fig.add_trace(
    go.Scatter(x=months, y=revenue, name="Revenue", mode="lines"),
    row=1, col=1,
)
fig.add_trace(
    go.Scatter(x=months, y=expenses, name="Expenses", mode="lines"),
    row=2, col=1,
)

fig.update_layout(height=520, title_text="The margin dashboard")
fig.show()`,
      language: "python",
      note: "Each tile is a (row, col) address; add_trace places a graph_objects trace into one. shared_xaxes=True welds the rows' x windows together: zoom in the top row and the bottom row follows — the linked interaction from d-03, now structural.",
      produces:
        "A two-row figure: revenue over expenses across the same twelve months, one title bar, one window — drag a box in either row and both rescale.",
    },
    {
      kind: "chart",
      chart: {
        type: "area",
        title: "The two tiles' shared data: 2024 revenue vs expenses",
        categories: months,
        series: [
          { name: "revenue", values: REVENUE_2024 },
          { name: "expenses", values: EXPENSES_2024 },
        ],
        yLabel: "k$",
      },
      why: "The underlying numbers of the composed figure. Stacked as two aligned rows, the eye compares shape to shape; drawn as overlapping areas, the same comparison becomes the gap between the regions — profit, visibly widening from 26 k$ in January to 70 k$ in December.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Detail tile: cups by product, Q4",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "The second kind of tile: detail. Where the top of the screen says 'is the margin growing?', the bottom answers 'and what exactly is selling?' — Cold Brew leads at 671 cups, Filter trails at 258. One screen, hierarchy, not democracy.",
    },
    {
      kind: "text",
      text: "Shared axes are the cheapest form of the linked interaction: because both rows read the same x window, the reader never has to mentally align 'October here' with 'October there'. The rule generalizes across the whole dashboard craft: **aligned position is a comparison you get for free; misaligned position is a comparison you charged the reader for.** When tiles share a time base, they share its axis.",
    },
    {
      kind: "heading",
      text: "Serving it: Dash in three lines",
    },
    {
      kind: "code",
      title: "From figure to web page",
      code: `from dash import Dash, dcc, html

app = Dash(__name__)

app.layout = html.Div([
    html.H1("The margin dashboard"),
    dcc.Graph(figure=fig),        # the same Figure object you already built
])

app.run(debug=True)              # app.run_server() on older Dash versions`,
      language: "python",
      note: "The pattern's whole idea: a Dash app is a layout of components, and dcc.Graph mounts any plotly Figure into it unchanged. Everything you learned about figures transfers; the web layer adds callbacks, URLs and sharing — the doorway, not a new grammar.",
      produces:
        "A local web server at http://127.0.0.1:8050 rendering your composed figure with every affordance — hover, zoom, rangeslider — intact.",
    },
    {
      kind: "table",
      title: "The layout hierarchy — what earns which spot",
      headers: ["Zone", "Question it answers", "What belongs there"],
      rows: [
        ["Top band", "*Are we okay?*", "The headline: one to three KPI numbers with their comparison (vs target, vs last period)"],
        ["Middle band", "*Which direction, since when?*", "The trend: one or two aligned time series carrying the headline's evidence"],
        ["Lower band", "*Why? Where exactly?*", "Detail: the breakdown tiles the reader consults after the trend raises a question"],
      ],
      caption:
        "Reading order is top-left first (the F-pattern — e-05 develops it fully). Hierarchy means the headline is the biggest thing on the screen, not the favourite chart.",
    },
    {
      kind: "interpretation",
      id: "d-04-i1",
      chart: {
        type: "bar",
        title: "Headline tile: total cups per quarter",
        categories: quarters,
        series: [{ name: "cups", values: quarterlyTotals }],
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      prompt:
        "This is the dashboard's headline tile, answering 'is the coffee business growing?'. What does it communicate — and what does it leave to the tiles below?",
      options: [
        {
          text: "Volume rises every quarter — 1,777 to 2,065 cups, +16% across the year — steady growth; the mix (which products) is deliberately left to the detail tiles below",
          correct: true,
          feedback:
            "Correct — 1,777 → 1,878 → 1,939 → 2,065, about +16% Q1 to Q4 with no down quarter. The headline carries the verdict; the breakdown is one glance lower.",
        },
        {
          text: "Cold Brew is the best product",
          correct: false,
          feedback: "True in the detail tile, invisible in this one — totals per quarter cannot rank products. Headline and detail answer different questions.",
        },
        {
          text: "Growth is explosive and deserves an all-hands",
          correct: false,
          feedback: "+16% across four quarters is steady, not explosive — the headline tile's scale (1,700–2,100) keeps the honest reading.",
        },
        {
          text: "Q4's dip below expectations is the story",
          correct: false,
          feedback: "There is no dip: Q4 is the highest quarter at 2,065. Reading the tile requires reading its actual bars.",
        },
      ],
      explanation:
        "A headline tile makes one claim with one comparison: totals up every quarter, +16% on the year. Anything finer — product mix, margins, causes — belongs lower in the hierarchy, where the reader goes only if the headline gives them a reason.",
    },
    {
      kind: "exercise",
      id: "d-04-e1",
      exerciseKind: "critique",
      prompt:
        "A team proposes a 'sales dashboard': twelve equally sized tiles in a 4×3 grid — every chart type they could think of, no numbers larger than any others, each tile with its own color scheme, every filter imaginable on the right rail. Audit it against this lesson's discipline.",
      options: [
        {
          text: "Fail on all three counts: no hierarchy (nothing answers 'are we okay?' first), inconsistent encodings (a color means different things per tile), and filter sprawl (the reader works before they read) — rebuild top band → trend → detail around one named decision",
          correct: true,
          feedback:
            "Correct — the three standard audit questions: where is the decision, are encodings consistent, how much must the reader operate before reading? A 4×3 equal grid answers none of them.",
        },
        {
          text: "It passes: twelve tiles is more information, and information is the point",
          correct: false,
          feedback: "A dashboard is a decision instrument, not an archive — volume without hierarchy buries the verdict the reader came for.",
        },
        {
          text: "It fails only because 4×3 is the wrong grid shape; 6×2 would fix it",
          correct: false,
          feedback: "The grid's shape is not the failure — the absence of a headline and a named decision is. Rearranging gallery pieces is still a gallery.",
        },
        {
          text: "It passes as long as every individual chart is well designed",
          correct: false,
          feedback: "Twelve excellent charts with no hierarchy, no shared encodings and no decision is still a wall — composition quality is not the sum of tile quality.",
        },
      ],
      explanation:
        "Audit in order: name the decision, find the headline, check encoding consistency, then price the filters. The 4×3 equal grid fails at step one — and every later failure compounds it.",
    },
  ],
  terms: [
    {
      term: "make_subplots",
      definition: "The plotly composition function: a grid of (row, col) tiles, each addressed by add_trace(..., row=, col=), with optional subplot_titles and shared axes.",
    },
    {
      term: "shared axis",
      definition: "Two or more tiles honoring one positional window — zoom or drag in one and the others follow. Alignment as a free, structural linked interaction.",
    },
    {
      term: "Dash",
      definition: "Plotly's framework for serving figures on the web: a layout of components (dcc.Graph mounts a Figure unchanged) plus optional callbacks for reactivity.",
    },
  ],
  takeaways: [
    "A dashboard is one screen arranged around one named decision — every tile reports to it or leaves.",
    "make_subplots assembles tiles at (row, col) addresses; shared_xaxes welds their windows into one linked interaction.",
    "Dash's three-line pattern (layout, dcc.Graph(figure=fig), app.run()) is a doorway, not a new grammar — figures transfer unchanged.",
    "Hierarchy, not democracy: headline numbers on top, trend in the middle, detail at the bottom, where the eye arrives last.",
  ],
  quiz: [
    {
      id: "d-04-q1",
      prompt: "In make_subplots(rows=2, cols=1, shared_xaxes=True), what does shared_xaxes=True buy?",
      options: [
        {
          text: "One aligned time window across both rows — zooming or dragging in either rescales both",
          correct: true,
          feedback: "Correct — the linked interaction made structural: the reader never mentally aligns 'October here' with 'October there'.",
        },
        {
          text: "Both rows are merged into a single plot area",
          correct: false,
          feedback: "The tiles stay separate; only their windows are welded — separate y-scales, one shared x.",
        },
        {
          text: "The two subplot titles are combined into one",
          correct: false,
          feedback: "subplot_titles remain per-tile; sharing concerns axes, not labels.",
        },
        {
          text: "The figure gains a legend shared across traces",
          correct: false,
          feedback: "Legend behavior is a layout property, independent of axis sharing.",
        },
      ],
      explanation:
        "Shared axes are the cheapest linked interaction in plotting: alignment the reader would otherwise have to perform mentally is done by the machinery instead.",
    },
    {
      id: "d-04-q2",
      prompt: "In the three-line Dash pattern, what is dcc.Graph(figure=fig)?",
      options: [
        {
          text: "The component that mounts your existing plotly Figure into the web layout, affordances intact",
          correct: true,
          feedback: "Correct — hover, zoom, rangeslider all survive; the web layer wraps the figure, it does not rebuild it.",
        },
        {
          text: "A server that recomputes your data on every request",
          correct: false,
          feedback: "The figure ships to the browser as-is; recomputation would need callbacks and a data layer.",
        },
        {
          text: "A second rendering of the figure for export purposes",
          correct: false,
          feedback: "There is one rendering — the interactive one; export is a mode-bar feature on top of it.",
        },
        {
          text: "The callback that links two charts' selections",
          correct: false,
          feedback: "Callbacks are the extra machinery Dash offers beyond mounting; dcc.Graph itself is the mount.",
        },
      ],
      explanation:
        "Dash's design bet is reuse: the Figure object you authored with plotly.express or graph_objects is the same object the browser renders.",
    },
    {
      id: "d-04-q3",
      prompt: "'A dashboard is one screen, one decision' is best read as:",
      options: [
        {
          text: "Every tile must serve one nameable decision; a tile you cannot justify against it is decoration",
          correct: true,
          feedback: "Correct — the decision names the standard. Screens earn tiles the way arguments earn sentences.",
        },
        {
          text: "Dashboards must never contain more than one chart",
          correct: false,
          feedback: "One decision usually needs several views — headline, trend, detail. The cap is on decisions, not charts.",
        },
        {
          text: "Only one person should be allowed to use the dashboard",
          correct: false,
          feedback: "A audience question, and a different one — the principle is about focus, not access control.",
        },
        {
          text: "The dashboard should let the reader decide everything, including its layout",
          correct: false,
          feedback: "Customization is a cost pushed onto the reader; the designer owns the default that most sessions will never leave.",
        },
      ],
      explanation:
        "The discipline predates every tool in this part: name the decision, then compose. Tiles are arguments for that decision — not exhibits in a gallery.",
    },
  ],
};
