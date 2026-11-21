/**
 * PART_D_V_ASSESSMENT — the Part D checkpoint (10 questions), spanning
 * all six Plotly lessons: affordances and the express grammar (d-01),
 * tooltip design (d-02), rangesliders and rangebreaks (d-03),
 * composition and Dash (d-04), the 3D burden of proof (d-05), and the
 * geographic trap (d-06).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_D_V_ASSESSMENT: QuizQuestion[] = [
  {
    id: "d-vas-1",
    prompt: "The core bargain of interactivity — 'detail on demand' — means:",
    options: [
      { text: "The overview stays clean while specifics wait behind hover, zoom and legend toggle — the reader pulls detail when they ask for it", correct: true, feedback: "Correct — glanceability and completeness reconciled by letting the reader, not the designer, choose the level of detail." },
      { text: "All detail must be visible on the chart at all times", correct: false, feedback: "That is the static compromise — labels everywhere — and it buries the overview interactivity exists to protect." },
      { text: "Charts should animate their data over time", correct: false, feedback: "Animation is a different mechanism with different costs; demand here means a reader gesture, not a frame loop." },
      { text: "The reader can edit the underlying data", correct: false, feedback: "Editable data is a spreadsheet's affordance; the figure's bargain is read-depth, not write-access." },
    ],
    explanation: "Detail on demand is the foundational trade of interactive charting: one designed overview, many pullable follow-ups. Every plotly affordance is one pull.",
  },
  {
    id: "d-vas-2",
    prompt: "Read the call fig = px.line(df, x=\"month\", y=\"revenue\", title=\"...\"). Which pairing is correct?",
    options: [
      { text: "The function name fixes the mark (a line); x= and y= assign the positional channels; df is the tidy data", correct: true, feedback: "Correct — data, mark, channels: the grammar of graphics stated as function-call arguments." },
      { text: "x= fixes the mark and the function name assigns the y channel", correct: false, feedback: "The mark is the function you call; arguments assign channels — not the other way round." },
      { text: "title= is required for the figure to render", correct: false, feedback: "The title is optional; the figure renders fine without one (though d-06 and e-06 have opinions about untitled charts)." },
      { text: "df must be wide-format, one row per series", correct: false, feedback: "plotly.express wants tidy data: one row per observation, columns as variables." },
    ],
    explanation: "plotly.express is a figure factory whose arguments map exactly onto the grammar of graphics: tidy data in, mark by function name, channels by keyword.",
  },
  {
    id: "d-vas-3",
    prompt: "In a hovertemplate, %{customdata[0]} renders:",
    options: [
      { text: "The first column bound to customdata for the hovered point", correct: true, feedback: "Correct — customdata is your per-point payload; [0] indexes into it." },
      { text: "The hovered point's x value", correct: false, feedback: "That is %{x}; customdata is extra payload you bound yourself." },
      { text: "The trace's legend name", correct: false, feedback: "Trace metadata comes from fullData; the side box showing it is usually suppressed with <extra></extra>." },
      { text: "The first row of the DataFrame", correct: false, feedback: "It is per-point — the value follows the hovered mark, never a fixed row." },
    ],
    explanation: "customdata + hovertemplate is the full-control move: bind payload columns, then template them per point with %{customdata[i]} variables.",
  },
  {
    id: "d-vas-4",
    prompt: "Which tooltip passes the three-layer audit?",
    options: [
      { text: "'Latte — 647 cups, +10% vs Q3': identity, value with unit, one comparison", correct: true, feedback: "Correct — who, how much, compared to what: readable in about three seconds of pointer time." },
      { text: "Order ID, batch, barista, register, price, cost, cups — all seven fields", correct: false, feedback: "Tooltip stuffing: a table wearing a tooltip costume, paid for in reading time." },
      { text: "A methodology paragraph explaining the survey design", correct: false, feedback: "Methodology belongs in captions and footnotes, not a box read in motion." },
      { text: "The twelve monthly values listed together on every hover", correct: false, feedback: "Hover serves the ONE mark touched; the chart already encodes all twelve." },
    ],
    explanation: "The three-layer discipline — identity, value with unit, at most one comparison — is an editing rule: every field beyond them is a reading-time tax.",
  },
  {
    id: "d-vas-5",
    prompt: "fig.update_xaxes(rangeslider_visible=True) addresses which problem?",
    options: [
      { text: "The lost-context problem: a bare zoom erases the window that made the zoomed span meaningful, and the slider keeps it visible", correct: true, feedback: "Correct — the miniature under the axis is the map; the main chart is the territory; both stay on screen." },
      { text: "The dead-time problem: weekends and holidays eating axis width", correct: false, feedback: "That is rangebreaks' job — cutting spans where data cannot exist." },
      { text: "The tooltip problem: default hover text lacking units", correct: false, feedback: "That is hover_data and hovertemplate's job, from d-02." },
      { text: "The legend problem: too many series to toggle", correct: false, feedback: "Legend management is unrelated to the axis window." },
    ],
    explanation: "The rangeslider is the context-preserving zoom: full series beneath, chosen window above, one drag apart — the reader never loses their place.",
  },
  {
    id: "d-vas-6",
    prompt: "rangebreaks=[dict(bounds=[\"sat\", \"mon\"])] is legitimate when:",
    options: [
      { text: "The data genuinely cannot exist on weekends — a business-day series — so the span is removed and the seam discloses it", correct: true, feedback: "Correct — a rangebreak is a claim about the world: nothing can happen here." },
      { text: "Weekend values are inconveniently low and flatten the chart", correct: false, feedback: "Hiding inconvenient values is suppression, not axis hygiene — the seam cannot launder it." },
      { text: "The reader prefers denser charts regardless of the data", correct: false, feedback: "Reader taste does not license deleting data-bearing spans — only data-free spans qualify." },
      { text: "The axis has more than 24 tick labels", correct: false, feedback: "Tick crowding is a labeling problem with labeling solutions; breaking the axis is a different, heavier claim." },
    ],
    explanation: "Rangebreaks remove spans where nothing can happen — and the visible seam is the disclosure. Applied to spans where things DO happen, they become honest-chart violations.",
  },
  {
    id: "d-vas-7",
    prompt: "In make_subplots(rows=2, cols=1, shared_xaxes=True), the shared axis guarantees:",
    options: [
      { text: "One time window across both tiles: zoom or drag in either row and the other follows", correct: true, feedback: "Correct — alignment as a structural linked interaction; the reader never mentally aligns the tiles." },
      { text: "Both tiles use the same y scale", correct: false, feedback: "Only x is shared here; y scales stay per-tile (sharing y is a separate choice with separate costs)." },
      { text: "The two subplot titles merge into one", correct: false, feedback: "Titles stay per-tile — each keeps its own question." },
      { text: "The figure exports as one image instead of two", correct: false, feedback: "Composition already made it one figure; sharing concerns windows, not export." },
    ],
    explanation: "Aligned position is a comparison you get for free; shared_xaxes is how composition makes the alignment structural rather than hoped for.",
  },
  {
    id: "d-vas-8",
    prompt: "The three-line Dash pattern's central idea is:",
    options: [
      { text: "Reuse: dcc.Graph(figure=fig) mounts the exact Figure object you already built, affordances intact — the web layer wraps, it does not rebuild", correct: true, feedback: "Correct — one grammar from notebook to server; callbacks and URLs are additions, not replacements." },
      { text: "Rewriting your figures in JavaScript for the browser", correct: false, feedback: "Nothing is rewritten — the Figure serializes as-is; that is the pattern's whole point." },
      { text: "Replacing plotly.express with a web-only charting library", correct: false, feedback: "Dash is plotly's own framework; the express and graph_objects layers carry straight through." },
      { text: "Server-side rendering of static chart images for speed", correct: false, feedback: "The served figure is fully interactive; static export is an option, not the mechanism." },
    ],
    explanation: "Dash is a doorway, not a new grammar: layout of components, dcc.Graph mounting your figure unchanged, app.run() to serve — everything from Parts A-D transfers.",
  },
  {
    id: "d-vas-9",
    prompt: "A 3D view earns its depth when:",
    options: [
      { text: "The structure is genuinely three-variate — visible in no 2D projection, like a helix whose shadows are a circle and two waves", correct: true, feedback: "Correct — the burden of proof is structural: projections that hide the structure justify the occlusion and foreshortening taxes." },
      { text: "The chart has three or more series to display", correct: false, feedback: "Multiple series are what legends, facets and small multiples carry — depth is not a series counter." },
      { text: "The audience is executive and deserves spectacle", correct: false, feedback: "Spectacle that costs accuracy is decoration; foreshortened bars persuade precisely where they mislead." },
      { text: "The tool renders 3D attractively by default", correct: false, feedback: "Renderer defaults can extrude a bar chart as easily as a helix — defaulting is not a justification." },
    ],
    explanation: "The d-05 standard: depth must be paid for with structure no projection can carry. Bars extruded into 3D pay full tax — occlusion plus foreshortened lengths — for nothing.",
  },
  {
    id: "d-vas-10",
    prompt: "A choropleth shades countries by total support tickets; the headline names the top country as 'the problem market'. The flaw is:",
    options: [
      { text: "Shading by a total conflates market size with intensity — normalize by customers (or population) before any verdict", correct: true, feedback: "Correct — the map's area is already the visual weight; totals double-count size and the small, stressed regions vanish." },
      { text: "The color scale should have been sequential rather than diverging", correct: false, feedback: "Palette choice matters, but no palette fixes a measure that answers the wrong question." },
      { text: "Choropleths cannot display totals accurately under any circumstances", correct: false, feedback: "They can — the trap is interpretation, not rendering; totals belong in the hover as context." },
      { text: "The headline should name the bottom country instead", correct: false, feedback: "Swapping the verdict without fixing the measure inherits the same flaw — the ranking itself is unnormalized." },
    ],
    explanation: "The classic choropleth trap: totals measure size, maps weight area, and the two compound. The honest shading is the rate — the totals move to the hover as context.",
  },
];
