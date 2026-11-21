/**
 * PART D · LESSON d-03 — "Zooming"
 *
 * The axis range is a claim — 'this window matters' — and zoom hands the
 * window back to the reader. The rangeslider (fig.update_xaxes(
 * rangeslider_visible=True)) makes the full window one drag away;
 * rangebreaks cut dead time out of the axis; and the judgment call is
 * when a zoom serves better than a filter. The 24-month revenue window
 * (2023 + 2024, the course's shared numbers) is the running example.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { REVENUE_2023, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const months24 = [
  ...months.map((m) => `${m} '23`),
  ...months.map((m) => `${m} '24`),
];
const revenue24mo = [...REVENUE_2023, ...REVENUE_2024];

export const LESSON_V_D_03: DataVizLesson = {
  slug: "d-03",
  title: "Zooming",
  minutes: 20,
  summary:
    "The rangeslider (update_xaxes(rangeslider_visible=True)) keeps the full window reachable from any zoom; rangebreaks cut weekends and other dead time; and the real skill is knowing when a zoom serves the reader better than a filter.",
  tool: "plotly",
  objectives: [
    "Add a rangeslider with fig.update_xaxes(rangeslider_visible=True) and say what it buys",
    "Cut empty spans out of an axis with rangebreaks (weekends, market closures)",
    "Decide when zooming replaces a filter — and when it must not",
    "Explain linked interactions: one zoom or selection driving every chart on a dashboard",
  ],
  why: "Choosing an axis range is the most consequential quiet decision in charting: the window IS the argument. Zoom in on one quarter and the year disappears; show two years and a month's wobble vanishes. Static charts freeze that choice; interactive figures let the reader renegotiate it — but only if you design the renegotiation. A bare zoom loses the reader's place; a rangeslider keeps the full window visible while the detail fills the frame. And on time axes with dead spans (weekends, overnight hours), zooming alone is not enough — the dead time must be broken out of the axis, or a quarter of your pixels display nothing. This lesson is the machinery of the window: rangeslider, rangebreaks, and the judgment of when zooming beats filtering.",
  blocks: [
    {
      kind: "text",
      text: "In d-01 you met zoom as an affordance; here it becomes a design surface. The problem with a bare zoom is **lost context**: drag into Q4 and the reader can no longer see where Q4 sits in the year — the window they are examining has erased the window that made it meaningful. The fix is to keep the whole series visible as a *miniature* under the main axes: the **rangeslider**.",
    },
    {
      kind: "heading",
      text: "The rangeslider",
    },
    {
      kind: "code",
      title: "Two years, one draggable window",
      code: `import pandas as pd
import plotly.express as px

df = pd.DataFrame({
    "month":   ["Jan '23", "Feb '23", "...", "Dec '23",
                "Jan '24", "Feb '24", "...", "Dec '24"],   # 24 rows
    "revenue": [102, 108, "...", 148, 124, 131, "...", 204],
})

fig = px.line(df, x="month", y="revenue", title="Monthly revenue, 2023–2024 (k$)")

fig.update_xaxes(rangeslider_visible=True)
fig.show()`,
      language: "python",
      note: "One line. The rangeslider renders the full series beneath the plot; dragging its handles sets the main window, and the rectangle between them IS the window you are reading.",
      produces:
        "A line chart with a miniature of all 24 months underneath: drag the slider to any span and the main chart rescales — context never leaves the screen.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2023–2024 (k$)",
        categories: months24,
        series: [{ name: "revenue", values: revenue24mo }],
        yLabel: "k$",
        showLegend: false,
        height: 300,
      },
      why: "The full window the rangeslider annotates: two years, each rising to a December peak, 2024 sitting visibly above 2023 throughout. This is the map; the zoom is the territory beneath it.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024 only (k$) — the zoomed window",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      why: "What the reader reaches by dragging the slider to 2024: the acceleration into Q4 (171 → 189 → 204) now fills the frame — a reading the 24-month view renders in miniature. The rangeslider keeps the road back: one drag restores the year-over-year view.",
    },
    {
      kind: "heading",
      text: "Dead time and rangebreaks",
    },
    {
      kind: "text",
      text: "Time axes often carry spans where *nothing can happen*: weekends on a business-day series, overnight hours on a market chart, lunch breaks on a production line. Zoomed out, these dead spans eat pixels in proportion to their calendar share — a five-day week shows two days of blank. Plotly's **rangebreaks** cut named spans out of the axis entirely: the live days draw side by side, with a visual seam where the dead time was removed.",
    },
    {
      kind: "code",
      title: "Hiding weekends on a weekday series",
      code: `# tickets_per_day: illustrative weekday series, Mon–Fri for four weeks
fig = px.line(tickets, x="date", y="opened", title="Support tickets opened per day")

fig.update_xaxes(
    rangebreaks=[
        dict(bounds=["sat", "mon"]),   # hide Saturday and Sunday
    ]
)
fig.show()`,
      language: "python",
      note: "bounds=[\"sat\", \"mon\"] removes everything from Saturday morning to Monday morning. Other real options: dict(values=[\"2024-12-25\"]) for holidays, dict(bounds=[17, 9], pattern=\"hour\") for hours outside 09:00–17:00. Use them only where the data genuinely cannot exist — breaking an axis is a claim about the world, not a tidiness preference.",
      produces:
        "A weekday line chart with no weekend gaps: Friday's last point meets Monday's first across a seam, and every pixel carries live data.",
    },
    {
      kind: "definition",
      term: "Range break",
      informal:
        "A span deliberately removed from a positional axis — weekends, overnight hours, holidays — where data cannot exist, so that the remaining, meaningful range uses the full width.",
      why: "It is the honest cousin of the truncated axis: no values are distorted, because nothing was plotted inside the break. The seam on the axis is the disclosure.",
    },
    {
      kind: "text",
      text: "When does a zoom *replace a filter*? The rule of thumb: zoom keeps the escape hatch. If the reader's question is **'look closer at this'** — a quarter, a spike, a cluster — a zoom answers it while leaving the full context one double-click away. If the question is **'work only with this subset'** — exclude weekends from an aggregation, hand a region's rows to a calculation — that is a filter, and no amount of zooming will do arithmetic. In dashboards the two meet as **linked interactions**: drag the rangeslider or select a region on one chart, and every chart on the screen re-windows together (d-04 builds exactly that with shared axes).",
    },
    {
      kind: "interpretation",
      id: "d-03-i1",
      chart: {
        type: "line",
        title: "Monthly revenue, 2023–2024 (k$)",
        categories: months24,
        series: [{ name: "revenue", values: revenue24mo }],
        yLabel: "k$",
        showLegend: false,
        height: 300,
      },
      prompt:
        "A stakeholder zooms to Q4 2024 and is thrilled by the 'record climb'. What does the full 24-month window show that the zoomed window cannot?",
      options: [
        {
          text: "The year-over-year step: every 2024 month sits above its 2023 counterpart (January's gap 124 vs 102 = 22 k$; December's 204 vs 148 = 56 k$) — growth is a level shift, not just a Q4 sprint",
          correct: true,
          feedback:
            "Correct — the full window is the only place the YoY comparison lives: gaps of 22 k$ in January growing to 56 k$ by December. The zoom shows the sprint; the window shows the race.",
        },
        {
          text: "Nothing — a zoomed view always contains strictly more information",
          correct: false,
          feedback:
            "The zoom has more pixels per point, but fewer points: 2023 is entirely gone, and with it the baseline that made 2024 look like growth rather than season.",
        },
        {
          text: "The exact December value, to the decimal",
          correct: false,
          feedback:
            "Hover reads the exact value in either window — precision is not what the full view adds; comparison is.",
        },
        {
          text: "That growth is smooth, with no dips in either year",
          correct: false,
          feedback:
            "Both years wobble — June to July 2024 dips 153 to 151, and 2023 has several one-month dips. Smoothness is exactly the kind of claim a zoomed window flatters.",
        },
      ],
      explanation:
        "This is the lesson of the rangeslider in one exercise: the zoomed window answers 'what happened here?' and the full window answers 'here compared to what?'. Windows that erase their own baseline flatter every sprint.",
    },
    {
      kind: "exercise",
      id: "d-03-e1",
      exerciseKind: "concept-check",
      prompt:
        "An ops lead asks for 'just the weekday ticket volumes' and proposes filtering the dataset to exclude weekends before charting. A colleague proposes keeping all days but zooming. Which serves the request, and why?",
      options: [
        {
          text: "The filter — 'weekday volumes' names the subset the analysis itself must use, and a zoom cannot remove rows from any calculation",
          correct: true,
          feedback:
            "Correct — when the question is 'work only with this subset', the subset must actually change: aggregates, averages and comparisons must exclude weekends for real. Zooming changes the view, never the arithmetic.",
        },
        {
          text: "The zoom — it is always more interactive and therefore better",
          correct: false,
          feedback:
            "Interactivity is a means, not a virtue. A zoomed chart still averages weekend rows into any statistic shown beside it.",
        },
        {
          text: "The zoom — because filtering data is never acceptable",
          correct: false,
          feedback:
            "Filters are legitimate and necessary when the question names the subset; the discipline is declaring them, not banning them.",
        },
        {
          text: "Either — zoom and filter produce identical numbers",
          correct: false,
          feedback:
            "They do not: a zoom re-windows the pixels, a filter re-scopes the data. Only one of those changes a mean.",
        },
      ],
      explanation:
        "Zoom answers 'look closer'; filter answers 'use only this'. 'Weekday volumes' is a scoping statement about the data, so the filter is the honest tool — declared, visible, and reflected in every number on the screen.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Zoomed windows exaggerate slopes",
      text: "A zoom is a truncated axis that the reader chose — which makes it *more* trusted and no less steep. The Part A axis-honesty rule still applies: a window of 170 → 204 k$ reads as a surge when its context floor is 100. With a rangeslider the context stays visible, which is exactly why d-01 called the affordance set a design surface and not a default.",
    },
  ],
  terms: [
    {
      term: "rangeslider",
      definition: "A miniature of the full series rendered beneath the x-axis; dragging its handles sets the main chart's window. Context never leaves the screen.",
    },
    {
      term: "rangebreak",
      definition: "A span cut out of a positional axis where data cannot exist (weekends, holidays, overnight hours) — bounds=[\"sat\", \"mon\"], holiday dates, or hour patterns.",
    },
    {
      term: "linked interaction",
      definition: "One gesture — a zoom, a selection, a legend click — driving every chart on a screen at once, so all views share one window onto the data.",
    },
  ],
  takeaways: [
    "The axis range is a claim; the rangeslider lets the reader renegotiate it without ever losing the full window.",
    "rangebreaks cut dead time (weekends, closures) out of an axis — a claim about when data can exist, disclosed by the seam.",
    "Zoom answers 'look closer'; a filter answers 'use only this'. Only filters change the arithmetic.",
    "A zoomed window is a reader-chosen truncated axis: keep the baseline reachable, or the sprint flatters itself.",
  ],
  quiz: [
    {
      id: "d-03-q1",
      prompt: "What does fig.update_xaxes(rangeslider_visible=True) add?",
      options: [
        {
          text: "A miniature of the full series under the axis; dragging its handles sets the main chart's window",
          correct: true,
          feedback: "Correct — full-window context, permanently visible, with the current window shown as the selected rectangle.",
        },
        {
          text: "A second y-axis on the right side of the chart",
          correct: false,
          feedback: "That is a secondary axis (yaxis2), a different and more dangerous feature.",
        },
        {
          text: "Automatic zooming to the newest data points",
          correct: false,
          feedback: "The slider adds a control, not a behavior — the default window is unchanged until dragged.",
        },
        {
          text: "A scrollbar for the legend entries",
          correct: false,
          feedback: "Legend management is unrelated; this is the x-axis window control.",
        },
      ],
      explanation:
        "The rangeslider is the context-preserving zoom: the miniature keeps the whole series on screen while the main frame honors the reader's window.",
    },
    {
      id: "d-03-q2",
      prompt: "rangebreaks=[dict(bounds=[\"sat\", \"mon\"])] does what?",
      options: [
        {
          text: "Removes the Saturday-to-Monday span from the x-axis, so weekday points draw side by side across a seam",
          correct: true,
          feedback: "Correct — dead weekend time is cut from the axis; Friday meets Monday with a seam disclosing the break.",
        },
        {
          text: "Aggregates weekend values into the Friday point",
          correct: false,
          feedback: "Nothing is merged — the span is hidden, not summarized; weekend rows would need a filter or aggregation first.",
        },
        {
          text: "Fills weekends by interpolation so the line stays continuous",
          correct: false,
          feedback: "Interpolation would invent data; the break is the honest opposite — remove the span, disclose the seam.",
        },
        {
          text: "Colors weekend bands grey in the background",
          correct: false,
          feedback: "That is shading (shapes or a weekend band), which keeps the span and its pixels; breaks remove it.",
        },
      ],
      explanation:
        "A rangebreak is an axis claim: data cannot exist here, so the span is removed and the seam discloses the removal.",
    },
    {
      id: "d-03-q3",
      prompt: "When does zooming replace a filter?",
      options: [
        {
          text: "When the question is 'look closer at this' and the full context must stay reachable in one gesture",
          correct: true,
          feedback: "Correct — zoom re-windows the view while the escape hatch remains; the data, and any arithmetic on it, is untouched.",
        },
        {
          text: "Whenever the reader finds a large dataset overwhelming",
          correct: false,
          feedback: "Overwhelm may argue for either tool; the deciding question is whether the subset must change the numbers.",
        },
        {
          text: "When the analysis must exclude a segment from all calculations",
          correct: false,
          feedback: "That is a filter's job: a zoom never removes a row from a mean.",
        },
        {
          text: "Never — the two are interchangeable in all cases",
          correct: false,
          feedback: "They change different things: the window versus the data. Interchangeable they are not.",
        },
      ],
      explanation:
        "'Look closer' is zoom; 'use only this' is filter. Conflating them is how dashboards show averages the reader believes exclude what the screen hides.",
    },
  ],
};
