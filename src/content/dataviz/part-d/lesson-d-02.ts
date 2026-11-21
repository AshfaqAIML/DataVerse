/**
 * PART D · LESSON d-02 — "Hover Information"
 *
 * The tooltip is the chart's footnote channel. hover_data appends columns
 * to the default tooltip; customdata + hovertemplate take full control of
 * what it says (%{x}, %{y}, %{customdata[0]}). The design question — what
 * belongs in a tooltip: units and context, not everything — runs through
 * both code blocks and both charts.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q4, IRIS_PETAL_LENGTH, IRIS_SEPAL_LENGTH, IRIS_SPECIES, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_D_02: DataVizLesson = {
  slug: "d-02",
  title: "Hover Information",
  minutes: 25,
  summary:
    "The tooltip is a channel with a bandwidth budget: hover_data adds columns, customdata + hovertemplate take full control (%{y}, %{customdata[0]}), and the craft is deciding what belongs — identity, the value with its unit, one piece of context — and nothing else.",
  tool: "plotly",
  objectives: [
    "Append extra columns to the default tooltip with hover_data",
    "Take full control of tooltip content with customdata plus a hovertemplate using %{x}, %{y} and %{customdata[i]}",
    "Apply the three-layer tooltip discipline: identity, value with unit, at most one piece of context",
    "Recognize tooltip stuffing and redesign it",
  ],
  why: "Hover is the affordance readers actually use — and the one designers forget to design. Plotly's default tooltip dumps whatever it can derive: x, y, the trace name, any column you flagged, in machine order, often without units. The reader pays for every field in reading time: a tooltip is read while held over a moving pointer, under a cursor, at a moment's notice. Designing the hover is therefore not polish — it is the difference between the most-used affordance answering the reader's question and burying it. This lesson is the two API moves that give you control (hover_data, then hovertemplate) and, more importantly, the editorial rule for what earns a place in the box.",
  blocks: [
    {
      kind: "text",
      text: "Hover a mark in a default plotly figure and a small box appears: the **x** value, the **y** value, and the trace name. That auto-generated tooltip is a *draft* — accurate, but tone-deaf. It has no units unless the column name happens to carry them, no context, and no idea which field the reader actually came for. The first API move, `hover_data`, appends columns to that draft; the second, `customdata` + `hovertemplate`, throws the draft away and writes the box yourself.",
    },
    {
      kind: "code",
      title: "Appending to the default tooltip: hover_data",
      code: `import plotly.express as px

fig = px.scatter(
    iris,
    x="sepal_length",
    y="petal_length",
    color="species",
    hover_data=["sepal_width"],   # one extra column, appended to the tooltip
)
fig.show()`,
      language: "python",
      note: "hover_data takes a list of column names (or a dict to control number formatting) and appends them to the auto-generated tooltip. Cheap, honest, and still a draft — the fields appear in Plotly's order, not the reader's.",
      produces:
        "A scatter plot whose tooltip now carries sepal width alongside x, y and species — the identity of the hovered flower, one gesture away.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Iris: petal length vs sepal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: "The underlying view: the two species separate almost completely (setosa's petals sit at 1.1–1.7 cm against versicolor's 4.0–4.9). In the interactive original, the hover is what tells you WHICH flower you are touching — the identity layer doing its one job.",
    },
    {
      kind: "heading",
      text: "Taking control: customdata and hovertemplate",
    },
    {
      kind: "text",
      text: "When the default box is not good enough, you bind extra data to each mark with `customdata` and then *template* the tooltip with `hovertemplate`. The template is an HTML-ish string with per-point variables: `%{x}` and `%{y}` are the coordinates, `%{customdata[0]}` is the first extra column you bound, `%{y:,.0f}` formats the number, and `<extra></extra>` suppresses the side box Plotly appends by default. You control order, units, emphasis and wording — the tooltip becomes yours to edit, like a caption.",
    },
    {
      kind: "code",
      title: "Writing the tooltip yourself",
      code: `fig = px.bar(coffee, x="product", y="cups", customdata=["price"])

fig.update_traces(
    hovertemplate=(
        "<b>%{x}</b><br>"
        "Cups sold: %{y:,.0f}<br>"
        "Menu price: $%{customdata[0]:.2f}"
        "<extra></extra>"          # suppress the default side box
    )
)
fig.show()`,
      language: "python",
      note: "customdata binds the price column to every bar; %{customdata[0]} reads the first bound column for the hovered point. %{y:,.0f} formats with thousands separators. <extra></extra> removes the trace-name box that would otherwise trail your text.",
      produces:
        "A bar chart whose hover reads like a sentence — product in bold, cups with separators, price with a dollar sign and two decimals — instead of a key-value dump.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold in December",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "With four bars, the honest alternative to a tooltip is on the chart itself: value labels make the identity layer permanent. The hover rule and the label rule are the same rule — the value, with its unit, where the eye already is. At forty bars you would hand the job back to hover.",
    },
    {
      kind: "table",
      title: "What belongs in a tooltip",
      headers: ["Layer", "Example", "Why it earns the space"],
      rows: [
        ["Identity", "product name · country · date", "which mark am I touching? — the question hover exists for"],
        ["The value, with its unit", "671 cups · 204 k$ · 28 °C", "the number the reader came for, anchored so it cannot be misread"],
        ["At most one piece of context", "+41% vs Q1 · rank #1 of 4", "the comparison that makes the number mean something"],
        ["Not: everything", "row IDs, seven more columns", "tooltips compete for attention like any channel — and are read in motion"],
      ],
      caption:
        "Three layers, one sentence. Every field beyond them is read-time the reader did not agree to spend.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Tooltip stuffing",
      text: "Because hover_data is one line of code, the failure mode is appending every column 'just in case'. A tooltip the reader cannot parse in about three seconds is a table wearing a tooltip costume — and tables are read sitting down. If the field is not identity, value, or the one comparison, it belongs in the drill-through, not the hover.",
    },
    {
      kind: "interpretation",
      id: "d-02-i1",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      prompt:
        "What does this chart communicate, and what should its hover add on top of the defaults?",
      options: [
        {
          text: "Revenue climbed all year from 124 to 204 k$ (+65%); the hover should add the exact value with its unit and the month-over-month change — e.g. 'Dec: 204 k$, +15 vs Nov'",
          correct: true,
          feedback:
            "Correct — identity (Dec), value with unit (204 k$), one piece of context (+15 vs Nov): the three layers, in that order. The trend is the message, so the comparison layer serves it.",
        },
        {
          text: "The hover should list all twelve monthly values at once",
          correct: false,
          feedback:
            "The chart already encodes all twelve points; hover exists for the ONE mark being touched. Listing everything is the table-in-a-costume failure.",
        },
        {
          text: "Revenue doubled during the year, so the hover should carry the growth rate",
          correct: false,
          feedback:
            "It grew about 65% (124 to 204) — not doubled. The wrong number in a tooltip is worse than no tooltip: hovers are trusted precisely because they feel mechanical.",
        },
        {
          text: "The hover should expose the transaction records behind each month",
          correct: false,
          feedback:
            "Drill-through to raw records is a different affordance in a different tool; the tooltip serves the mark, not the database beneath it.",
        },
      ],
      explanation:
        "The tooltip's job is to deepen the reading of the mark you touched: identity, value with unit, one comparison. The chart carries the trend; the hover carries the decimals.",
    },
    {
      kind: "exercise",
      id: "d-02-e1",
      exerciseKind: "critique",
      prompt:
        "A teammate ships a px.bar of monthly sales with hover_data=[\"order_id\", \"batch\", \"barista\", \"register\", \"price\", \"cost\", \"cups\"] — seven fields appended to the default tooltip. Redesign the hover per this lesson's discipline.",
      options: [
        {
          text: "Identity (the month), the value with its unit (cups sold), and at most one comparison (e.g. price or change vs last month) — three layers, templated with hovertemplate so order and units are yours",
          correct: true,
          feedback:
            "Correct — the three-layer rule: identity, value with unit, one context. The other five fields live in the source data, where analysts can query them sitting down.",
        },
        {
          text: "Keep all seven fields — more data is always more insight",
          correct: false,
          feedback:
            "Seven fields in a box read in motion is a reading-time tax; the reader came for one number and its meaning.",
        },
        {
          text: "Remove hover entirely and print all seven columns as text on each bar",
          correct: false,
          feedback:
            "That relocates the clutter from a hidden box to the visible chart — worse. The fix is editing, not relocation.",
        },
        {
          text: "Keep all seven but reorder them alphabetically",
          correct: false,
          feedback: "Ordering a stuffed tooltip is still a stuffed tooltip; the problem is field count, not field sequence.",
        },
      ],
      explanation:
        "Hover design is editing: identity, the value with its unit, at most one comparison. Every field you cut is reading time you return to the reader.",
    },
  ],
  terms: [
    {
      term: "hover_data",
      definition: "The plotly.express argument that appends extra DataFrame columns to the auto-generated tooltip — the quick, half-controlled move.",
    },
    {
      term: "hovertemplate",
      definition: "The per-trace string that authors the tooltip outright: %{x}, %{y} and %{customdata[i]} variables, number formatting, HTML markup, and <extra></extra> to suppress the default side box.",
    },
    {
      term: "customdata",
      definition: "Per-point extra data bound to a trace — the payload that hovertemplate's %{customdata[i]} variables read from.",
    },
  ],
  takeaways: [
    "The default tooltip is a draft: accurate, but without units, context, or the reader's priority order.",
    "hover_data appends columns; customdata + hovertemplate give you the whole box — order, units, emphasis, wording.",
    "Three layers earn tooltip space: identity, the value with its unit, and at most one comparison.",
    "Tooltip stuffing is the one-line-of-code failure: fields the reader did not ask for, paid for in reading time.",
  ],
  quiz: [
    {
      id: "d-02-q1",
      prompt: "What does hover_data=[\"sepal_width\"] do in a px.scatter call?",
      options: [
        {
          text: "Appends the sepal_width column's value for the hovered point to the default tooltip",
          correct: true,
          feedback: "Correct — an extra field in the auto-generated box, in Plotly's order, with Plotly's formatting.",
        },
        {
          text: "Renders sepal width as an extra visual channel on the marks",
          correct: false,
          feedback: "Visual channels are color, size, symbol arguments; hover_data only touches the tooltip.",
        },
        {
          text: "Filters the DataFrame down to rows with a sepal width",
          correct: false,
          feedback: "It reads data, it does not remove it — no filtering happens.",
        },
        {
          text: "Replaces the tooltip with a fixed text about sepal width",
          correct: false,
          feedback: "Replacement is hovertemplate's job; hover_data appends to what Plotly already shows.",
        },
      ],
      explanation:
        "hover_data is the quick move: one more field in the default tooltip. Full control — order, units, wording — needs customdata plus hovertemplate.",
    },
    {
      id: "d-02-q2",
      prompt: "In a hovertemplate, what does %{customdata[0]} render?",
      options: [
        {
          text: "The first column bound to customdata for the hovered point",
          correct: true,
          feedback: "Correct — customdata carries per-point payload; index [0] reads its first column.",
        },
        {
          text: "The trace's name",
          correct: false,
          feedback: "The trace name is %{fullData.name} territory — or the side box you usually suppress with <extra></extra>.",
        },
        {
          text: "The x value of the hovered point",
          correct: false,
          feedback: "The x value is %{x}; customdata is your own bound payload, not the coordinates.",
        },
        {
          text: "The number zero, formatted",
          correct: false,
          feedback: "It is an index into your customdata binding, not a constant — [0] means first column.",
        },
      ],
      explanation:
        "customdata is the payload channel and hovertemplate the template that reads it: %{customdata[0]}, %{customdata[1]}, and so on, per hovered point.",
    },
    {
      id: "d-02-q3",
      prompt: "Which tooltip contents follow the three-layer discipline?",
      options: [
        {
          text: "Identity ('Latte'), the value with its unit ('647 cups'), and one comparison ('+10% vs Q3')",
          correct: true,
          feedback: "Correct — the three layers in order: who, how much, compared to what. Nothing else.",
        },
        {
          text: "Identity plus every other column in the table",
          correct: false,
          feedback: "Identity plus everything is tooltip stuffing — the reading-time tax this lesson exists to prevent.",
        },
        {
          text: "Only the raw row ID from the source database",
          correct: false,
          feedback: "A row ID identifies a record for a machine, not for a reader — the human needs name and value.",
        },
        {
          text: "A paragraph explaining the chart's methodology",
          correct: false,
          feedback: "Methodology belongs in the caption or a footnote under the chart, not in a box read in motion.",
        },
      ],
      explanation:
        "Identity, value with unit, at most one comparison: three layers that make the hovered mark legible in about three seconds of pointer time.",
    },
  ],
};
