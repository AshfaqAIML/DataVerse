/**
 * PART_D_V_EXERCISES — the tiered practice battery for Part D (Plotly),
 * 6 items: 2 basic, 2 intermediate, 2 advanced, spanning the six lessons
 * (d-01..d-06). Code is illustrative plotly/Python — the same tidy-data
 * grammar the lessons teach; every dataset referenced is either a
 * datasets.ts constant or an illustrative toy framed as such.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_D_V_EXERCISES: Exercise[] = [
  {
    id: "d-vb1",
    tier: "beginner",
    title: "Your first interactive figure",
    prompt:
      "Build the course's first plotly figure from the 2024 revenue data: months on x, revenue (k$) on y, with the title 'Monthly revenue, 2024 (k$)'. Then answer in one sentence: when the reader hovers November, what three things should the tooltip's defaults already carry? Write the full px.line call — remember the tidy-DataFrame contract: data in, x= and y= assign the positional channels, title= sets the headline.",
    hint: "The DataFrame needs two columns of equal length; px.line(df, x=..., y=..., title=...) then fig.show().",
    starter: `import pandas as pd
import plotly.express as px

df = pd.DataFrame({
    "month":   ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "revenue": [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204],
})

# TODO: build the line figure and show it
`,
    solution: `fig = px.line(df, x="month", y="revenue", title="Monthly revenue, 2024 (k$)")
fig.show()

# The default hover on November carries: the x value ("Nov"), the y value
# (171, no unit — the title carries it), and the trace name if there is
# one. Identity, value, context — the defaults manage the first two and
# leave the unit to your title or a hovertemplate (d-02's job).`,
    concepts: ["plotly.express", "tidy data", "affordances"],
  },
  {
    id: "d-vb2",
    tier: "beginner",
    title: "The three-layer tooltip",
    prompt:
      "A bar chart of December cups (Espresso 489, Latte 647, Filter 258, Cold Brew 671) ships with hover_data on six extra columns and no hovertemplate. Rewrite the hover to the three-layer discipline from d-02: identity in bold, the value with its unit, and exactly one comparison — 'Cold Brew: 671 cups, +9% vs Q3' (671 vs 618 = +8.6%, round honestly). Use customdata to bind whatever the template needs, and remember <extra></extra> suppresses the default side box.",
    hint: "customdata binds per-point payload; %{x} is the category, %{y:,.0f} the formatted value, %{customdata[0]} your context column.",
    starter: `import pandas as pd
import plotly.express as px

coffee = pd.DataFrame({
    "product":  ["Espresso", "Latte", "Filter", "Cold Brew"],
    "cups":     [489, 647, 258, 671],
    "q3_cups":  [451, 596, 274, 618],   # for the comparison layer
})

# TODO: bind customdata, then author the hovertemplate
fig = px.bar(coffee, x="product", y="cups", customdata=["q3_cups"])
# fig.update_traces(hovertemplate=...)
fig.show()`,
    solution: `coffee["pct_vs_q3"] = 100 * (coffee["cups"] - coffee["q3_cups"]) / coffee["q3_cups"]

fig = px.bar(coffee, x="product", y="cups", customdata=["pct_vs_q3"])

fig.update_traces(
    hovertemplate=(
        "<b>%{x}</b><br>"
        "Cups sold: %{y:,.0f}<br>"
        "vs Q3: %{customdata[0]:+.1f}%"
        "<extra></extra>"
    )
)
fig.show()

# Three layers, no more: identity (bold product), value with unit
# (671 cups), one comparison (+8.6% vs Q3's 618 — '+9%' rounded and
# honest). The six-column hover_data goes: fields the reader did not
# ask for, paid for in reading time.`,
    concepts: ["hovertemplate", "customdata", "tooltip discipline"],
  },
  {
    id: "d-vi1",
    tier: "intermediate",
    title: "The margin dashboard, composed",
    prompt:
      "Compose the d-04 margin dashboard for real: two rows sharing the x-axis (2024 revenue on top, expenses below), with subplot_titles for each row and a layout title for the whole screen. Then extend it with a rangeslider on the shared x-axis (d-03) and answer: when the reader drags the slider to Q4, which linked interactions fire, and which comparison is now out of reach? Months and both series are given — the 12 revenue and expense values are the course's shared numbers.",
    hint: "make_subplots(rows=2, cols=1, shared_xaxes=True, subplot_titles=(...)); add each go.Scatter with row=/col=; then fig.update_xaxes(rangeslider_visible=True) — it applies to the shared axis.",
    starter: `from plotly.subplots import make_subplots
import plotly.graph_objects as go

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue  = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]

# TODO: make the 2x1 figure with shared x and titled subplots
# TODO: add both traces at their (row, col) addresses
# TODO: rangeslider on the shared axis
# TODO: fig.show()
`,
    solution: `from plotly.subplots import make_subplots
import plotly.graph_objects as go

fig = make_subplots(
    rows=2, cols=1,
    shared_xaxes=True,
    subplot_titles=("Revenue", "Expenses"),
)

fig.add_trace(go.Scatter(x=months, y=revenue, name="Revenue", mode="lines"), row=1, col=1)
fig.add_trace(go.Scatter(x=months, y=expenses, name="Expenses", mode="lines"), row=2, col=1)

fig.update_xaxes(rangeslider_visible=True)
fig.update_layout(height=520, title_text="The margin dashboard")
fig.show()

# Dragging to Q4: both rows re-window together (the linked interaction,
# made structural by shared_xaxes). Out of reach until the reader drags
# back: the January baseline — the gap that made Q4's gap (70 k$)
# meaningful. The rangeslider keeps the road home visible, which is
# exactly why it is not optional on composed time series.`,
    concepts: ["make_subplots", "shared axes", "rangeslider", "linked interactions"],
  },
  {
    id: "d-vi2",
    tier: "intermediate",
    title: "Helix or hype: the 3D burden of proof",
    prompt:
      "Two requests arrive. (1) A physicist's sensor data: x, y and z are genuinely three coordinates of a moving particle, and every 2D pair plot shows an unstructured blob. (2) A marketer's quarterly sales by product, and the stakeholder wants 'the 3D bar version'. For each, decide whether 3D earns its depth per d-05's standard, then write the px call for the case that deserves it — px.scatter_3d for the particle with color encoding time if a time column exists. State in one sentence which perceptual tax the rejected request would have paid.",
    hint: "The standard: does the structure survive in every 2D projection? A blob in all three pair plots means the structure is genuinely three-variate. Bars extruded into depth pay occlusion plus foreshortened lengths.",
    starter: `import plotly.express as px

# particle: DataFrame with x, y, z (and optional t) columns — a 3D random walk
# sales: DataFrame with quarter, product, cups — 4 x 4 tidy rows

# TODO: which request earns 3D? Write its px call.
`,
    solution: `# Request (1) earns the depth: every 2D projection (x-y, x-z, y-z) shows
# an unstructured blob — the particle's path is genuinely three-variate
# structure, exactly the helix standard from d-05.

fig = px.scatter_3d(
    particle,
    x="x", y="y", z="z",
    color="t",               # time as color if the column exists
)
fig.update_traces(marker=dict(size=4))
fig.show()

# Request (2) is refused: quarter x product is 2-variate structure that
# a grouped bar chart carries completely. The 3D bar version pays the
# occlusion tax (rear bars hidden behind front ones) AND the
# foreshortening tax (perspective shrinks the very lengths the chart
# encodes) — two perceptual costs for zero structural gain.`,
    concepts: ["px.scatter_3d", "burden of proof", "occlusion", "foreshortening"],
  },
  {
    id: "d-va1",
    tier: "advanced",
    title: "The choropleth audit",
    prompt:
      "You inherit a choropleth of the four support-desk countries shaded by TOTAL tickets (Germany 1,260, France 900, Netherlands 500, Sweden 220), with customers 42,000 / 30,000 / 4,000 / 2,000 and the headline 'The Netherlands and Sweden are our calmest desks'. (1) Compute tickets per 1,000 customers for all four countries. (2) Rewrite the choropleth call so color carries the rate, and say what the new headline must be. (3) Name where the totals still belong. Justify every choice with the numbers.",
    hint: "1250/42000-style divisions: Germany 30, France 30, Netherlands 125, Sweden 110 per 1k. The measure feeding color is the entire verdict; totals are context for the hover.",
    starter: `import pandas as pd
import plotly.express as px

tickets = pd.DataFrame({
    "country":   ["Germany", "France", "Netherlands", "Sweden"],
    "iso_alpha": ["DEU", "FRA", "NLD", "SWE"],
    "tickets":   [1260, 900, 500, 220],
    "customers": [42000, 30000, 4000, 2000],
})

# TODO: 1) add the per-1k column
# TODO: 2) the honest choropleth (color = the rate, scope="europe")
# TODO: 3) where do the totals go?
`,
    solution: `tickets["tickets_per_1k"] = 1000 * tickets["tickets"] / tickets["customers"]
# Germany 30.0, France 30.0, Netherlands 125.0, Sweden 110.0

fig = px.choropleth(
    tickets,
    locations="iso_alpha",
    color="tickets_per_1k",
    hover_name="country",
    hover_data=["tickets", "customers"],   # (3): totals live HERE — context
    scope="europe",
    title="Support tickets per 1,000 customers",
)
fig.show()

# (2) The honest headline: 'The Netherlands and Sweden run the hottest
# desks — 110-125 tickets per 1,000 customers, ~4x Germany's and
# France's 30.' The inherited headline was exactly backwards: the two
# smallest totals belonged to the two most stressed desks. (3) The
# totals stay in the hover (and any drill-through) as context — the
# reader weighing staffing wants intensity, but the reader sizing the
# team still needs volume. Shading carries the rate; hover carries both.`,
    concepts: ["choropleth trap", "normalization", "tooltip as context"],
  },
  {
    id: "d-va2",
    tier: "advanced",
    title: "From figure to served dashboard",
    prompt:
      "Ship the margin dashboard to the team. Compose the two-row shared-x figure (revenue, expenses — the course numbers), serve it with the three-line Dash pattern, and add one layout decision beyond the default: a KPI headline above the chart stating December's profit (204 - 134 = 70 k$) so the screen passes d-04's one-screen-one-decision audit. Write the complete runnable script and a two-sentence audit: what is the decision, and which tile answers it first?",
    hint: "from dash import Dash, dcc, html — layout is a list of components: html.H1 for the headline, dcc.Graph(figure=fig) for the figure. app.run(debug=True) serves it at 127.0.0.1:8050.",
    starter: `from plotly.subplots import make_subplots
import plotly.graph_objects as go
from dash import Dash, dcc, html

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue  = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]

# TODO: 1) the composed figure (rows=2, shared_xaxes, subplot titles)
# TODO: 2) the Dash app: H1 headline with December profit, dcc.Graph
# TODO: 3) app.run(debug=True)
`,
    solution: `fig = make_subplots(
    rows=2, cols=1, shared_xaxes=True,
    subplot_titles=("Revenue", "Expenses"),
)
fig.add_trace(go.Scatter(x=months, y=revenue, name="Revenue", mode="lines"), row=1, col=1)
fig.add_trace(go.Scatter(x=months, y=expenses, name="Expenses", mode="lines"), row=2, col=1)
fig.update_layout(height=520, title_text="The margin dashboard, 2024")

app = Dash(__name__)
app.layout = html.Div([
    html.H1("December profit: 70 k$ — margin widening all year"),
    dcc.Graph(figure=fig),
])
app.run(debug=True)

# Audit: the decision is 'is the margin surviving growth?' and the H1
# answers it first — December profit 70 k$ (204 - 134), roughly triple
# January's 26 k$. The composed figure is the evidence tile the reader
# consults next: both series share one window, so the widening gap can
# be checked against the headline in a single glance. One screen, one
# decision, hierarchy intact.`,
    concepts: ["Dash pattern", "dashboard hierarchy", "KPI headline"],
  },
];
