/**
 * PART_D_V_PROJECT — "The Coffee Explorer" (Part D's project).
 *
 * An interactive Plotly dashboard over the course's shared coffee and
 * revenue datasets: one composed figure, designed hovers, a rangeslider,
 * a considered 3D or geographic extension, and the dashboard discipline
 * (one screen, one decision) as the audit standard.
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_D_V_PROJECT: MiniProject = {
  title: "The Coffee Explorer — an interactive Plotly dashboard",
  brief:
    "Build a small interactive explorer for the course's shared numbers: quarterly cups by product (Espresso, Latte, Filter, Cold Brew across Q1–Q4), 24 months of revenue (2023–2024), and the December detail the tables hide. The deliverable is one composed figure served by Dash — but the project's real object is the design discipline: hovers that follow the three-layer rule, a rangeslider that keeps the full window reachable, a 3D or map extension that passes the burden-of-proof audit, and a screen that answers one named decision at a glance. Every number is real course data, so every claim the dashboard makes is checkable against the lessons that taught it.",
  requirements: [
    "A tidy pandas DataFrame of the quarterly coffee data (product x quarter x cups) plus the 24-month revenue series, loaded from explicit literals",
    "A make_subplots composition of at least two tiles sharing the time axis, with subplot_titles and one layout-level title",
    "Every trace's hover authored with customdata + hovertemplate: identity in bold, the value with its unit, exactly one comparison",
    "A rangeslider on the shared x-axis, with a one-paragraph justification naming the comparison it keeps reachable",
    "One further view — a 3D scatter/line or a choropleth/scatter_geo — accompanied by an explicit burden-of-proof or normalization argument (or a documented refusal)",
    "The Dash app serving it all, with a headline (html.H1) that states the dashboard's finding, not its contents",
    "A closing audit note: the named decision the screen serves, and how each tile reports to it",
  ],
  steps: [
    "Type the data as literals (the datasets.ts numbers: COFFEE_Q1..Q4, REVENUE_2023, REVENUE_2024) into two tidy DataFrames; verify shapes before plotting anything.",
    "Build the time tile first: px.line over the 24 months, then place it into the make_subplots grid and add the product-mix tile beside or beneath it.",
    "Author the hovers: bind customdata for the comparison layer (e.g. QoQ change for coffee, YoY gap for revenue) and template all three layers per trace.",
    "Add fig.update_xaxes(rangeslider_visible=True) and drag-test it: confirm zooming one tile re-windows the others (shared_xaxes).",
    "Decide the extension honestly: does any 3-variate structure exist in this data? If not, either extend the dataset with a genuinely three-variate toy (framed as illustrative, the d-05 helix standard) or write the refusal as a design note.",
    "Wrap in Dash: html.H1 headline stating the finding (e.g. the Q4 acceleration), dcc.Graph(figure=fig), app.run(debug=True) — then read the screen cold and check the headline survives the 5-second test.",
    "Write the audit note (decision, tiles, what you would cut) and keep it next to the code — it is the deliverable a reviewer reads first.",
  ],
  starter: `import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from dash import Dash, dcc, html

coffee = pd.DataFrame({
    "product": ["Espresso", "Latte", "Filter", "Cold Brew"],
    "Q1": [412, 588, 301, 476],
    "Q2": [438, 612, 286, 542],
    "Q3": [451, 596, 274, 618],
    "Q4": [489, 647, 258, 671],
    # TODO: melt to tidy form (product, quarter, cups) — one row per cell
})

months_24 = [...]   # TODO: "Jan '23" .. "Dec '24"
revenue_24mo = [...]  # TODO: 2023 then 2024 monthly revenue (k$)

fig = make_subplots(
    rows=2, cols=1,
    shared_xaxes=True,
    subplot_titles=("TODO", "TODO"),
)
# TODO: add_trace(...) each tile at its (row, col) address
# TODO: customdata + hovertemplate on every trace (three layers)
# TODO: fig.update_xaxes(rangeslider_visible=True)

app = Dash(__name__)
app.layout = html.Div([
    html.H1("TODO: the finding, not the contents"),
    dcc.Graph(figure=fig),
])
app.run(debug=True)

# TODO: extension view (3D or geo) with its burden-of-proof argument,
# or the documented refusal. TODO: the audit note (decision -> tiles).
`,
  concepts: [
    "plotly.express",
    "make_subplots and shared axes",
    "hovertemplate and customdata",
    "rangeslider",
    "Dash pattern",
    "dashboard discipline",
  ],
  extension:
    "Add a Dash callback: two dropdowns (product, year) that re-filter the composed figure server-side, and observe what it costs — the linked zoom from the rangeslider now resets with every selection. Write a paragraph on when that trade is worth it, citing d-03's zoom-vs-filter rule.",
};
