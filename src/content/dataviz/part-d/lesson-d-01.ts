/**
 * PART D · LESSON d-01 — "Interactive Charts"
 *
 * Plotly from first principles: why interactivity is a design dimension
 * (detail on demand), how plotly.express maps the grammar of graphics onto
 * a single call, and the four affordances every figure ships with. Code
 * blocks show the real plotly API; the chart blocks render the underlying
 * data with the course engine — the static snapshot of what fig.show()
 * opens in the browser.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { CITIES, REVENUE_2024, TEMPS } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_D_01: DataVizLesson = {
  slug: "d-01",
  title: "Interactive Charts",
  minutes: 25,
  summary:
    "What interactivity actually buys a chart — detail on demand — and how plotly.express turns the grammar of graphics you already know into one call that answers back: hover, zoom, pan, legend-toggle.",
  tool: "plotly",
  objectives: [
    "Explain what interactivity adds to a static chart: detail on demand without cluttering the overview",
    "Read a plotly.express call as the grammar of graphics: data, marks, and channels in one expression",
    "Build and show a figure: fig = px.line(df, x=, y=, title=) then fig.show()",
    "Name the four affordances — hover, zoom, pan, legend-toggle — and the question each one answers",
  ],
  why: "Every static chart you have built so far answers exactly one question well — the one you designed it for. But readers rarely stop at one question. They see the December peak and immediately ask: how much, exactly? What about last year? What if the other series were hidden? In a static medium each follow-up needs another chart, another slide, another email. Interactivity lets one figure hold its own follow-ups: the overview stays clean, and the detail waits behind a hover, a zoom, a legend click. Plotly is the Python world's main instrument for that, and its express API is precisely the grammar of graphics you already know — data mapped to marks and channels — wearing a new coat.",
  blocks: [
    {
      kind: "text",
      text: "A static chart is an argument frozen at one level of detail. It chooses the window, the categories, the series — and the reader takes it or leaves it. An **interactive chart** keeps that designed overview but lets the reader *pull*: rest a pointer on a mark and the exact values appear; drag a box and the window narrows; click a legend key and a series folds away. The design skill is not 'add interactivity' — it is deciding *which* follow-up questions deserve to be one gesture away.",
    },
    {
      kind: "definition",
      term: "Detail on demand",
      informal:
        "The core bargain of interactivity: the overview stays uncluttered, and specifics are fetched only when the reader asks for them — by hovering, zooming, or toggling.",
      why: "It resolves the eternal chart conflict between *simple enough to read at a glance* and *complete enough to trust*. A static chart must pick one side; an interactive chart can hold both, if the demand gestures are designed rather than accidental.",
    },
    {
      kind: "heading",
      text: "One call, one figure",
    },
    {
      kind: "text",
      text: "plotly.express (imported as `px`) is a *figure factory*: each function takes a tidy DataFrame plus column names and returns a complete `Figure` object — data, axes, legend, default hover text and all. The mapping is the grammar of graphics from Part A, stated as arguments: **data** (`df`), the **positional channels** (`x=`, `y=`), the mark type (the function you call — `px.line`, `px.bar`, `px.scatter`), plus optional channels like `color=` and `title=`. One expression, one chart spec — exactly like the ChartSpec objects this course's own engine renders.",
    },
    {
      kind: "code",
      title: "The first interactive figure",
      code: `import pandas as pd
import plotly.express as px

df = pd.DataFrame({
    "month":   ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "revenue": [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204],  # k$
})

fig = px.line(df, x="month", y="revenue", title="Monthly revenue, 2024 (k$)")
fig.show()`,
      language: "python",
      note: "px.line chooses the mark (a line), x= and y= assign the positional channels, and the column names become the axis labels for free. Nothing else is required.",
      produces:
        "An interactive figure in the browser: hover reads month and revenue off any point, scrolling or dragging zooms the window, double-click resets, and the mode bar offers pan and export.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      why: "The static snapshot of what that call renders: 2024 revenue climbing from 124 to 204 k$ with the steepest gains in the final quarter. In the interactive original, the same pixels also answer 'what exactly is November?' the moment the pointer lands on it.",
    },
    {
      kind: "heading",
      text: "The affordances",
    },
    {
      kind: "text",
      text: "Every plotly figure ships with a small set of **affordances** — gestures the reader can perform without being taught. They are free, but they are not free of design: each one answers a different follow-up question, and knowing the mapping is how you predict what your reader can pull.",
    },
    {
      kind: "table",
      title: "The four default affordances",
      headers: ["Affordance", "Gesture", "The question it answers"],
      rows: [
        ["Hover", "rest the pointer on a mark", "*What exactly is this?* — the mark's identity and values"],
        ["Zoom", "scroll, or drag a box", "*What is happening in this region?* — structure at a finer scale"],
        ["Pan", "drag the canvas", "*What is next to this?* — move the window without changing scale"],
        ["Legend toggle", "click a legend key", "*What if the others were gone?* — isolate one series for comparison"],
      ],
      caption:
        "Hover and zoom fetch detail; pan and legend-toggle reframe the comparison. Lesson d-02 designs the hover, d-03 designs the zoom.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Average monthly temperature, four cities",
        categories: months,
        series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
        yLabel: "°C",
      },
      why: "Four series is where the legend toggle starts earning its keep: click away three cities and Singapore's flat 27–28 °C line stands alone — a comparison the full four-line view makes you work for.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Defaults are not a design",
      text: "The affordances arrive automatically — but *what the hover says*, *where the zoom lands*, and *which series start visible* are all yours to decide. An affordance nobody designs is a follow-up question answered badly. The next two lessons are exactly that design work.",
    },
    {
      kind: "interpretation",
      id: "d-01-i1",
      chart: {
        type: "line",
        title: "Average monthly temperature: Oslo vs Cairo",
        categories: months,
        series: [
          { name: "Oslo", values: TEMPS.Oslo },
          { name: "Cairo", values: TEMPS.Cairo },
        ],
        yLabel: "°C",
      },
      prompt:
        "A reader uses the legend toggle to hide Lisbon and Singapore, leaving these two cities. What does the two-line view communicate about Oslo and Cairo?",
      options: [
        {
          text: "The two cities are far apart all year — 22 °C apart in January (−3 vs 19) and still 16 °C apart in July (17 vs 33) — and both peak in midsummer",
          correct: true,
          feedback:
            "Correct — level, gap and shape in one reading: the January gap is 22 °C (−3 against 19), the July gap 16 °C (17 against 33), and both lines crest in July.",
        },
        {
          text: "The cities converge in summer, when their climates become similar",
          correct: false,
          feedback:
            "16 °C apart in July (17 vs 33) is not convergence — the gap narrows slightly but never closes. 'Similar' is not a reading this chart supports.",
        },
        {
          text: "Oslo is warmer than Cairo in summer",
          correct: false,
          feedback: "Oslo's July high is 17 °C against Cairo's 33 °C — the reverse, visibly, in every month of the year.",
        },
        {
          text: "The two cities have nearly the same annual temperature range",
          correct: false,
          feedback:
            "Oslo swings from −3 to 17 (a 20-degree range); Cairo from 19 to 33 (a 14-degree range). Different ranges, visible as different line heights.",
        },
      ],
      explanation:
        "Reading a two-series view means naming level (Cairo always above), gap (22 °C in January, 16 °C in July) and shape (both crest in July). The legend toggle did not change the data — it removed everything that was not the comparison being asked for.",
    },
    {
      kind: "exercise",
      id: "d-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "Match each follow-up question to the affordance that answers it in one gesture: (1) 'What is this point's exact value?' (2) 'Is that rise in June real or noise?' (3) 'What does the chart look like without the outliers series?'",
      options: [
        {
          text: "(1) hover — (2) zoom — (3) legend toggle",
          correct: true,
          feedback:
            "Correct — hover fetches the exact value of the mark you touch, zoom narrows the window to inspect the June stretch, and the legend toggle isolates or removes a whole series.",
        },
        {
          text: "(1) zoom — (2) hover — (3) pan",
          correct: false,
            feedback: "Zoom changes the visible window, not a single point's readout; pan moves the window without answering either question.",
        },
        {
          text: "(1) legend toggle — (2) pan — (3) hover",
          correct: false,
          feedback:
            "The legend toggle hides whole series — it cannot read one point. Pan moves the view; it neither fetches values nor isolates a series.",
        },
        {
          text: "All three are answered by exporting the chart as a static image",
          correct: false,
          feedback:
            "A static export freezes one level of detail — the opposite of detail on demand. All three questions need the interactive affordances.",
        },
      ],
      explanation:
        "The affordances divide the labour: hover reads one mark, zoom reframes scale, pan reframes position, and the legend toggle reframes which series participate. Map the question to the gesture before deciding anything else about the figure.",
    },
  ],
  terms: [
    {
      term: "plotly.express",
      definition: "The high-level figure factory (imported as px): one call per chart — px.line, px.bar, px.scatter — taking a tidy DataFrame and column names, returning a complete interactive Figure.",
    },
    {
      term: "affordance",
      definition: "A gesture the reader can perform on a figure without instruction — hover, zoom, pan, legend toggle. Each affordance answers a different follow-up question.",
    },
    {
      term: "detail on demand",
      definition: "The interactivity bargain: keep the overview uncluttered, and let the reader pull specifics (values, finer windows, isolated series) only when asked for.",
    },
  ],
  takeaways: [
    "Interactivity is not decoration — it is permission for the reader's follow-up questions: detail on demand without cluttering the overview.",
    "A plotly.express call is a grammar-of-graphics statement: data in, positional channels as x= and y=, mark type as the function name.",
    "Every figure ships with hover, zoom, pan and legend toggle — and each affordance answers a different question. Know the mapping before you customize.",
    "The affordances are defaults, not a design: what the hover says and where the zoom lands are decisions you still own.",
  ],
  quiz: [
    {
      id: "d-01-q1",
      prompt: "In plotly.express, one call like fig = px.line(df, x=, y=, title=) produces:",
      options: [
        {
          text: "A complete Figure object — data, axes, legend and the interactive affordances — ready for fig.show()",
          correct: true,
          feedback: "Correct — one expression is a whole chart spec, interactive layer included; fig.show() just opens it.",
        },
        {
          text: "A static image file that must be embedded elsewhere",
          correct: false,
          feedback: "The Figure is an interactive object; static exports are an optional afterthought, not the product.",
        },
        {
          text: "An empty canvas that you then populate with graph_objects traces",
          correct: false,
          feedback: "That is the low-level go.Figure workflow; plotly.express does the populating for you in one call.",
        },
        {
          text: "A matplotlib figure wrapped for the browser",
          correct: false,
          feedback: "Plotly is an independent rendering stack — no matplotlib anywhere in the pipeline.",
        },
      ],
      explanation:
        "plotly.express is a figure factory, not a drawing kit: each function returns a finished interactive Figure built from your tidy data and column assignments.",
    },
    {
      id: "d-01-q2",
      prompt: "'Detail on demand' means:",
      options: [
        {
          text: "The overview stays clean while specifics wait behind hover and zoom — the reader pulls detail when they ask for it",
          correct: true,
          feedback: "Correct — it reconciles glanceability with completeness by letting the reader, not the designer, choose the level of detail.",
        },
        {
          text: "Every data value must be printed on the chart so nothing is hidden",
          correct: false,
          feedback: "That is the static compromise — labels everywhere — and it clutters the overview interactivity exists to protect.",
        },
        {
          text: "The chart should show more detail the longer the reader looks at it",
          correct: false,
          feedback: "Charts do not sense attention; the demand is a gesture — a hover, a zoom — not elapsed time.",
        },
        {
          text: "The underlying database must be attached to the figure",
          correct: false,
          feedback: "Drill-through to raw records is a heavier affordance than detail on demand, and a different tool's job.",
        },
      ],
      explanation:
        "Detail on demand is the core bargain of interactivity: uncluttered overview up front, fetched specifics on request. Everything else in Part D refines this bargain.",
    },
    {
      id: "d-01-q3",
      prompt: "A reader asks 'what exactly is this point?' Which affordance serves them?",
      options: [
        {
          text: "Hover — the tooltip reads off the mark under the pointer",
          correct: true,
          feedback: "Correct — hover is the identity affordance: one mark, its values, on request.",
        },
        {
          text: "Zoom — narrowing the window reveals the point's value",
          correct: false,
          feedback: "Zoom changes scale, not readout; a magnified point still needs a hover to speak.",
        },
        {
          text: "Pan — moving the canvas to centre the point",
          correct: false,
          feedback: "Centring a mark does not label it; pan repositions the window only.",
        },
        {
          text: "Legend toggle — isolating the point's series",
          correct: false,
          feedback: "The toggle answers 'what if the others were gone?' — a comparison question, not a value question.",
        },
      ],
      explanation:
        "Each affordance has a job description: hover reads one mark, zoom changes scale, pan changes position, legend toggle changes participation. The value question is hover's job.",
    },
  ],
};
