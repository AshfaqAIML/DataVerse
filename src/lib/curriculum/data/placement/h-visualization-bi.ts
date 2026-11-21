/**
 * SCHOOL H — PLACEMENT BANKS
 * Ten questions per subject (6 subjects, 60 questions), keyed by slug,
 * ids "<slug>-p1" ... "<slug>-p10".
 *
 * Bank design per subject: 3 recall / 4 applied / 3 judgment, spanning
 * every module. A working BI/viz professional should score 9–10; a
 * newcomer should land 0–3. Distractors are the classic chart traps
 * (truncated axes, dual axes, overlap misread, vanity metrics) —
 * exactly one option is correct, no "all of the above".
 */
import type { PlacementBank } from "../../types";

export const schoolHPlacement: PlacementBank = {
  "visualization-principles": [
    {
      id: "visualization-principles-p1",
      prompt: "Anscombe's quartet is famous among analysts because its four datasets demonstrate which point?",
      options: [
        "Scatter plots are always preferable to bar charts",
        "Datasets above 1,000 rows cannot be summarized",
        "Identical summary statistics can hide dramatically different distributions",
        "Regression lines make any two datasets identical",
      ],
      answer: 2,
      explanation:
        "All four datasets share the same means, variances, correlation, and regression line — yet they plot as four very different shapes. Looking at the data, not just its summary, is the entire lesson of the quartet.",
    },
    {
      id: "visualization-principles-p2",
      prompt: "According to research on visual encoding effectiveness, which channel do people decode most accurately for quantitative values?",
      options: [
        "Position along a common scale",
        "Area of a circle",
        "Color hue",
        "Line width",
      ],
      answer: 0,
      explanation:
        "Position on a shared, aligned scale is the most accurately decoded channel; area is markedly worse, and color hue barely reads as quantity at all. The encoding ladder ranks position above length, then area, then color intensity and hue.",
    },
    {
      id: "visualization-principles-p3",
      prompt: "A map colors each region by percentage change versus sales target, where negative and positive values both matter. Which palette class fits?",
      options: [
        "A sequential palette running light to dark",
        "A diverging palette with a meaningful midpoint at zero",
        "A categorical palette of distinct hues",
        "A rainbow palette for maximum range",
      ],
      answer: 1,
      explanation:
        "Diverging palettes exist for ordered data with a critical midpoint — zero, a target, or an average. Sequential fits ordered data with one endpoint; categorical would erase the order; rainbow adds a fake ordering nobody can decode.",
    },
    {
      id: "visualization-principles-p4",
      prompt: "In a grouped bar chart, readers effortlessly treat bars that sit closer together as belonging to the same group. Which Gestalt principle is at work?",
      options: [
        "Proximity",
        "Closure",
        "Symmetry",
        "Figure-ground reversal",
      ],
      answer: 0,
      explanation:
        "Gestalt proximity: elements placed near each other are perceived as a group. Good layouts exploit it deliberately — and cramped layouts trigger it accidentally, grouping the wrong bars together.",
    },
    {
      id: "visualization-principles-p5",
      prompt: "Your question is: what is the shape of the distribution of order values — skewed, bimodal, or roughly normal? Which chart answers it directly?",
      options: [
        "A bar chart of average order value by month",
        "A pie chart of orders by product category",
        "A line chart of total daily orders",
        "A histogram of order values",
      ],
      answer: 3,
      explanation:
        "Distribution questions need a chart of the variable's own spread — a histogram or a density plot. Monthly averages, category shares, and daily totals answer different questions entirely.",
    },
    {
      id: "visualization-principles-p6",
      prompt: "A KPI table marks below-target cells red and above-target cells green, with no other signal. What is the standard accessibility fix?",
      options: [
        "Switch the entire company style guide to grayscale",
        "Keep the red-green semantics but add a redundant signal — lightness, sign, or an icon — so colorblind readers are not locked out",
        "Remove the color and ask readers to compare every number",
        "Increase the saturation of the red and green",
      ],
      answer: 1,
      explanation:
        "Roughly 8% of men have red-green color vision deficiency, so color alone cannot carry the meaning. Redundant encoding — lightness differences, plus or minus signs, symbols — keeps the semantics and makes the table readable for everyone.",
    },
    {
      id: "visualization-principles-p7",
      prompt: "A bar chart of monthly revenue uses a y-axis starting at $4.7M instead of $0, making a 2% dip look like a collapse. What is the correct diagnosis?",
      options: [
        "Bars encode values as length, so a nonzero baseline inflates differences — use zero, or switch to a chart type where truncation is honest",
        "Nothing is wrong, since every chart may choose its own axis range",
        "The problem is the color palette, not the axis",
        "Bar charts must always display a 0 to 100 percent axis",
      ],
      answer: 0,
      explanation:
        "Length is the channel a bar encodes, and length starts at the baseline — truncating it manufactures drama. Lines and dot plots encode position and may use non-zero baselines when clearly labeled; bars do not get that license.",
    },
    {
      id: "visualization-principles-p8",
      prompt: "A marketing deck shows market share as a 3D pie with the largest slice exploded toward the viewer. What is the strongest honest-design objection?",
      options: [
        "3D pies are only wrong when more than five slices are shown",
        "The objection is purely aesthetic and not worth raising in a review",
        "Perspective distortion inflates near slices and angle comparison is a weak channel anyway — a sorted bar chart is honest and readable",
        "Pies must be 2D, but exploding one slice is fine",
      ],
      answer: 2,
      explanation:
        "3D perspective makes front slices look larger than they are, and humans compare angles poorly even in 2D. Sorted bars on a common baseline tell the true story — which is exactly why the 3D version appears when the story needs inflating.",
    },
    {
      id: "visualization-principles-p9",
      prompt: "A purchasing team must read exact unit prices to two decimals while taking supplier calls. Which representation serves them best?",
      options: [
        "A table — precise repeated lookup of individual values is the table's home turf",
        "A line chart of prices over time",
        "A pie chart of price composition",
        "A scatterplot of price versus quantity",
      ],
      answer: 0,
      explanation:
        "Charts excel at revealing patterns and comparisons at a glance; looking up exact values quickly and repeatedly is a job for text in a table. Knowing when a table beats a chart is part of visualization literacy.",
    },
    {
      id: "visualization-principles-p10",
      prompt: "A chart overlays revenue on the left axis and marketing spend on the right axis, scaled so the two lines track each other. What should an honest reviewer flag first?",
      options: [
        "Dual axes are forbidden in all professional reporting",
        "Two independent scales can manufacture a visual relationship that is an artifact of axis choices — the apparent link may not exist",
        "The only problem is missing gridlines",
        "Nothing — clearly labeled dual axes are always honest",
      ],
      answer: 1,
      explanation:
        "With two free scales, the author can make the lines meet, cross, or track by resizing either axis — the relationship on screen is chosen, not observed. If the correlation is the claim, plot the two series against each other instead.",
    },
  ],
  "statistical-charts": [
    {
      id: "statistical-charts-p1",
      prompt: "In a standard box plot, what does the box itself represent?",
      options: [
        "The middle 50% of the data, from the first quartile to the third",
        "The mean plus and minus one standard deviation",
        "The full range from minimum to maximum",
        "The middle 95% of all observations",
      ],
      answer: 0,
      explanation:
        "The box spans the interquartile range — Q1 to Q3 — with the median marked inside. Whiskers extend to the most extreme values within 1.5 × IQR; points beyond that are plotted as outlier candidates.",
    },
    {
      id: "statistical-charts-p2",
      prompt: "A scatterplot of 200,000 delivery records renders as one solid ink blot. What is the standard fix?",
      options: [
        "Enlarge every marker until individual points are visible",
        "Color every point a different hue",
        "Bin the plane — hexbin or 2D binning — so color encodes how many points land in each cell",
        "Show a 3D rotating version of the plot",
      ],
      answer: 2,
      explanation:
        "At large n, dots overwrite each other: overplotting. Hexbin tiling counts the points in each cell and encodes those counts with color, revealing the true density structure that the ink blot hides.",
    },
    {
      id: "statistical-charts-p3",
      prompt: "Error bars on a group's mean represent a 95% confidence interval. What do those bars estimate?",
      options: [
        "The spread that contains 95% of the individual data points",
        "The range of values for the true mean that is consistent with the observed data at the stated confidence level",
        "The probability that the null hypothesis is true",
        "The margin by which this group beat the others",
      ],
      answer: 1,
      explanation:
        "A confidence interval is about the precision of the mean's estimate, not the scatter of the data — that is what standard deviation bars show. It is not a hypothesis-test probability either; mixing these up misleads readers daily.",
    },
    {
      id: "statistical-charts-p4",
      prompt: "Your histogram tells a clean story at 50-unit bins and a messy one at 5-unit bins. What does a careful analyst do next?",
      options: [
        "Try several binwidths and report how the conclusion changes across them",
        "Keep whichever binwidth produces the most persuasive chart",
        "Always use the software's default binwidth",
        "Set one bin per observation for total fidelity",
      ],
      answer: 0,
      explanation:
        "Binwidth is a free parameter that can manufacture or erase structure. Honest practice is a sensitivity check: a claim about the data's shape should survive more than one arbitrary choice of bin.",
    },
    {
      id: "statistical-charts-p5",
      prompt: "Two regions are compared with a bar chart whose y-axis runs from 90 to 100 on a percentage metric that bottoms out at 0. What rule is violated?",
      options: [
        "Bar charts may never display percentages",
        "The axis must be logarithmic for regional data",
        "Nothing is violated, provided the axis is labeled",
        "Bars encode length, so they must start at zero — the truncated axis exaggerates the gap between regions",
      ],
      answer: 3,
      explanation:
        "The truncated baseline inflates visual difference — a two-point gap can look like a chasm. Honest options: zero-baseline bars, or a dot plot on a clearly labeled non-zero scale.",
    },
    {
      id: "statistical-charts-p6",
      prompt: "Three years of monthly revenue show a dip every December and a spike every January. Before declaring that growth is accelerating, you should first...",
      options: [
        "Fit a straight trend line to the raw series and report its slope",
        "Compare like with like — year-over-year figures or a seasonal baseline",
        "Delete the December and January values as outliers",
        "Average all months into a single number per year",
      ],
      answer: 1,
      explanation:
        "Seasonality can masquerade as trend in a raw series. Year-over-year comparison — this January against last January — or seasonal decomposition separates calendar effects from real growth before you claim anything.",
    },
    {
      id: "statistical-charts-p7",
      prompt: "A line chart braids twelve overlapping series for twelve product lines into unreadable spaghetti. What is the strongest standard restructure?",
      options: [
        "Color every line a different hue and increase line width",
        "Combine the twelve series into one average line",
        "Small multiples: one consistent panel per series, sharing the same scales",
        "Rotate the chart 90 degrees for more vertical room",
      ],
      answer: 2,
      explanation:
        "Small multiples keep every series legible while making cross-series comparison easy: same axes, same encodings, one series per panel. A dozen overplotted hues rarely survives the glance test.",
    },
    {
      id: "statistical-charts-p8",
      prompt: "On a Q-Q plot comparing your sample against the normal distribution, the points curl upward away from the reference line at both extremes. What does that indicate?",
      options: [
        "Heavier tails than the normal — extreme values occur more often than normality predicts",
        "The data is perfectly normal",
        "The sample is bimodal",
        "The sample size was too small to plot",
      ],
      answer: 0,
      explanation:
        "Observed quantiles climbing faster than normal quantiles at the extremes is the signature of heavier-than-normal tails. Points sitting on the line mean near-normality; systematic curvature is the diagnostic.",
    },
    {
      id: "statistical-charts-p9",
      prompt: "Group A: mean 100, 95% CI [92, 108]. Group B: mean 105, 95% CI [98, 112]. The intervals overlap. What can you honestly conclude?",
      options: [
        "The groups are definitely not different, because the intervals overlap",
        "The groups are definitely different, because the means differ",
        "Statistics cannot compare two groups",
        "Overlapping intervals alone do not settle it — you need the comparison itself, such as an interval on the difference",
      ],
      answer: 3,
      explanation:
        "Two overlapping 95% intervals do not imply no difference: the interval on the difference is narrower than the two separate intervals, so a real effect can hide behind overlap. Judge the difference directly.",
    },
    {
      id: "statistical-charts-p10",
      prompt: "A quarterly review reports average delivery time fell 10%, but the 95th-percentile delivery time rose 20%. What is the honest reading?",
      options: [
        "The average is the only honest summary, so the report stands as written",
        "The typical order improved while the worst experiences got worse — the average alone hides a tail problem",
        "The p95 figure is noise and should be removed from the report",
        "The two numbers contradict each other, so the data must be corrupt",
      ],
      answer: 1,
      explanation:
        "Averages summarize the center and are blind to the tail. When the tail moves against the center, the honest chart shows both over time — median beside p95, or percentiles side by side.",
    },
  ],
  "dashboard-design": [
    {
      id: "dashboard-design-p1",
      prompt: "Where should the single most important KPI tile on a dashboard go, and why?",
      options: [
        "Top-left — screen reading follows an F-shaped scan that lands and travels from there",
        "Bottom-right, so the eye ends on the key number",
        "Dead center, because symmetry reads as importance",
        "Anywhere, as long as the tile is colored red",
      ],
      answer: 0,
      explanation:
        "Eye-tracking of screen reading consistently shows an F-shaped scan starting top-left. Layout is attention budgeting: spend the first glance on the number that matters most, then let detail fall away beneath it.",
    },
    {
      id: "dashboard-design-p2",
      prompt: "Which of these is most likely a vanity metric — impressive-looking but decision-useless?",
      options: [
        "Weekly active users",
        "Net revenue retention",
        "Cumulative registered users since launch",
        "Shopping-cart abandonment rate",
      ],
      answer: 2,
      explanation:
        "Cumulative totals only ever rise, flatter everyone, and change no decisions. Decision metrics move with the business and would alter what the team does next week; vanity metrics count for counting's sake.",
    },
    {
      id: "dashboard-design-p3",
      prompt: "On page one of a dashboard, red means below target. On page two, red is reused as a neutral brand accent. What design-system rule is broken?",
      options: [
        "Dashboards may use at most three colors total",
        "Consistent color means consistent meaning — one color, one semantic, on every page",
        "Brand colors are banned from dashboards entirely",
        "Red may only appear in KPI tiles, never in charts",
      ],
      answer: 1,
      explanation:
        "In a dashboard design system, colors are semantics: if red means bad on one page, red must mean bad everywhere. Reusing it as decoration re-teaches readers to stop trusting the signal.",
    },
    {
      id: "dashboard-design-p4",
      prompt: "A stakeholder requests a dashboard on sales. What is the strongest first move?",
      options: [
        "Pin down the audience, the decisions they make, and how often — before opening any tool",
        "Open Power BI or Tableau and start dragging fields onto a canvas",
        "Copy a competitor's dashboard layout found online",
        "Send them a link to the raw database",
      ],
      answer: 0,
      explanation:
        "A request like 'a dashboard on sales' is not a spec. Audience, decision cadence, and the questions it must answer determine every later choice — layout, metrics, refresh rate, and interactivity. Tooling comes last.",
    },
    {
      id: "dashboard-design-p5",
      prompt: "A KPI tile reads Revenue: $1.2M, with no other information. What does it need before it can support a decision?",
      options: [
        "A larger font for the number",
        "The company logo",
        "More decimal places for precision",
        "Comparison context — versus target, versus the prior period, or a trend",
      ],
      answer: 3,
      explanation:
        "A number without a reference is trivia: is $1.2M good? Tiles earn their place by answering 'against what' — a target, the prior period, a sparkline, or a benchmark.",
    },
    {
      id: "dashboard-design-p6",
      prompt: "A dashboard ships with eleven filters, none pre-set, and shows nothing meaningful until the user configures four of them. What is the standard fix?",
      options: [
        "Add tooltips explaining each filter's meaning",
        "Cut to the few filters that matter and give every one a sensible default state",
        "Add a twelfth filter that resets the others",
        "Remove the underlying data until users request access",
      ],
      answer: 1,
      explanation:
        "Filters carry interaction costs: reading, choosing, clicking. Each must earn its place, and defaults should land users on a meaningful view instantly — a blank or broken first view becomes an abandoned dashboard.",
    },
    {
      id: "dashboard-design-p7",
      prompt: "You inherit a 24-tile dashboard: every chart the team could build, all the same size, no visual hierarchy. What is the correct critique?",
      options: [
        "It is a chart junk wall — comprehensiveness without hierarchy is a bug; rebuild around the decisions it must support",
        "It is comprehensive, and comprehensiveness is the point of a dashboard",
        "It needs only a darker theme to be usable",
        "The fix is to make all 24 charts bigger",
      ],
      answer: 0,
      explanation:
        "Dashboards are decision tools, not archives. Reader attention is finite, and a wall of equals forces a hunt for meaning: rank by decision value, lead with KPIs, and demote detail to drill-through or a second page.",
    },
    {
      id: "dashboard-design-p8",
      prompt: "An analyst proposes showing critical safety alerts only on hover for a dashboard used on tablets on a factory floor. What is your judgment?",
      options: [
        "Accept it — hover keeps the design clean and minimal",
        "Accept it, but add a second hidden layer for emergencies",
        "Reject it — hover is unreliable on touch devices, and critical signals must be persistently visible or redundantly encoded",
        "Reject tablets entirely and require desktop monitors",
      ],
      answer: 2,
      explanation:
        "Interaction design must match the device and the stakes. Fingers do not hover, and any safety-critical signal should never depend on an interaction at all — persistent visibility beats cleverness every time.",
    },
    {
      id: "dashboard-design-p9",
      prompt: "The board wants, each month, one clear recommendation with supporting evidence. What artifact serves them best?",
      options: [
        "A short narrative report or story with a handful of purpose-built charts",
        "A self-service dashboard with fifteen filters for the board to explore",
        "A raw data export the board can sort for themselves",
        "A dashboard of forty charts so nothing is left out",
      ],
      answer: 0,
      explanation:
        "Not every information need is a dashboard. When the deliverable is a recommendation, a narrative document with a few decisive charts wins; self-service exploration serves analysts, not a monthly decision meeting.",
    },
    {
      id: "dashboard-design-p10",
      prompt: "An operations dashboard's underlying data last refreshed six days ago; there is no visible timestamp, and the team still acts on it daily. What is the honest fix?",
      options: [
        "Hide the refresh date so users do not lose trust in the tool",
        "Surface a clear data-as-of timestamp and align refresh cadence with how often the decisions are made",
        "Move the refresh schedule to a settings page nobody opens",
        "Run a training session telling users to memorize the schedule",
      ],
      answer: 1,
      explanation:
        "Freshness is part of the data contract. If decisions happen daily, refresh must keep pace — and the as-of stamp must be visible where the numbers are read, not buried in documentation.",
    },
  ],
  "data-storytelling": [
    {
      id: "data-storytelling-p1",
      prompt: "In the Minto pyramid, where does the governing thought — the answer — belong?",
      options: [
        "Last, after all the analysis has been shown",
        "In the appendix, for interested readers",
        "First, at the top, supported underneath by grouped arguments and evidence",
        "In the chart footnotes, to keep slides clean",
      ],
      answer: 2,
      explanation:
        "The Minto pyramid leads with the answer: one governing thought on top, supporting arguments beneath it, evidence beneath those. Readers can stop at any depth and still leave with the conclusion.",
    },
    {
      id: "data-storytelling-p2",
      prompt: "In the situation–complication–resolution structure, the complication is...",
      options: [
        "What changed — the tension that makes the current situation no longer tenable",
        "The methodology and the list of data sources",
        "The catalog of every chart used in the story",
        "The executive sponsor's introduction",
      ],
      answer: 0,
      explanation:
        "SCR works because stories need tension: the situation establishes shared ground, the complication introduces the change or threat that demands attention, and the resolution is your answer to that tension.",
    },
    {
      id: "data-storytelling-p3",
      prompt: "Which chart title does the most work for the reader?",
      options: [
        "Returns over time",
        "Chart 4: Analysis of return metrics",
        "Q1–Q4 return data by category",
        "Returns fell 12% after the packaging change, recovering $2.1M",
      ],
      answer: 3,
      explanation:
        "A title that states the finding teaches the reader even if they look at nothing else. Topic titles like 'Returns over time' hand the analytical work back to the reader — work the author has already done.",
    },
    {
      id: "data-storytelling-p4",
      prompt: "A study finds that training hours correlate with employee retention. Which sentence crosses from evidence into overclaim?",
      options: [
        "Training hours and retention are correlated in this study",
        "Increasing training hours will cause retention to rise",
        "Teams with more training hours showed higher retention in all four regions",
        "The correlation held after controlling for tenure",
      ],
      answer: 1,
      explanation:
        "Correlation is not causation: the causal phrasing leaps past what the study design supports. The other three statements stay inside what the data actually shows.",
    },
    {
      id: "data-storytelling-p5",
      prompt: "You must present the same analysis to executives and to the engineering team. What is the standard adaptation?",
      options: [
        "Lead with the answer and recommendation for executives; keep the methodology and detail available to technical listeners in an appendix or backup slides",
        "Give both audiences the identical forty-slide technical deck",
        "Present only methodology to both and let them draw their own conclusions",
        "Skip the presentation and send the raw data instead",
      ],
      answer: 0,
      explanation:
        "Executives buy decisions; technical audiences audit reasoning. One layered story serves both: the answer first, the evidence one click away.",
    },
    {
      id: "data-storytelling-p6",
      prompt: "A slide carries six charts, all supposedly supporting the same point. What does the one-chart test tell you to do?",
      options: [
        "Keep all six — more evidence is more persuasive",
        "Keep the chart with the most data points",
        "Keep the single chart that carries the claim; move the rest to backup or cut them",
        "Merge all six into one composite chart",
      ],
      answer: 2,
      explanation:
        "The one-chart test asks: if this were the only chart, would it carry the claim? Charts that merely re-support an already-made point belong in the appendix — redundancy dilutes rather than reinforces.",
    },
    {
      id: "data-storytelling-p7",
      prompt: "Readers keep asking 'what am I looking at?' after seeing your trend chart. What is the strongest fix?",
      options: [
        "Rewrite the title to state the finding and annotate the key turning point directly on the chart",
        "Make the chart twenty percent larger",
        "Add three more series for context",
        "Switch to a 3D view so it stands out",
      ],
      answer: 0,
      explanation:
        "Annotation is narration: an insight title plus one or two direct annotations guide the eye along the argument. Size and decoration cannot rescue a chart that never says what it means.",
    },
    {
      id: "data-storytelling-p8",
      prompt: "You are presenting to a mixed room: two executives and a dozen analysts. What is the professional approach?",
      options: [
        "Present only technical detail — the executives can catch up later",
        "Ask the executives to leave the room",
        "Refuse mixed audiences and reschedule as two separate meetings",
        "Present the headline answer and story first, hold a deep-dive appendix, and invite the analysts into the detail during Q&A",
      ],
      answer: 3,
      explanation:
        "A layered structure serves mixed rooms: everyone gets the conclusion, technical listeners probe in Q&A, and nobody sits through methodology they will never use.",
    },
    {
      id: "data-storytelling-p9",
      prompt: "A weekly report states: 'Conversion was 3.2% this week.' Which rewrite turns a finding into an insight?",
      options: [
        "Conversion is an important metric for the business",
        "Conversion fell to 3.2% after the checkout redesign — reverting would recover roughly $40k per week",
        "Conversion data is presented in Table 2",
        "Conversion was 3.2%, up from 3.1% last week",
      ],
      answer: 1,
      explanation:
        "An insight states the finding, its cause or context, and its so-what in terms of a decision. A number with a delta is still a finding; an insight tells the reader what to do about it.",
    },
    {
      id: "data-storytelling-p10",
      prompt: "Before publishing a story claiming a new pricing page boosted revenue 20%, what must the honesty check confirm?",
      options: [
        "That nothing else changed in the window — seasonality, campaigns, mix shifts — and that the claim's scope matches the data",
        "That the chart colors follow the brand palette",
        "That at least thirty people reviewed the draft",
        "That the CEO personally approves the number",
      ],
      answer: 0,
      explanation:
        "Honest framing means the claimed cause is the only plausible driver and the number's scope — which markets, which period — is explicit. Confounds and undefined scope are the two classic story-killers.",
    },
  ],
  "power-bi": [
    {
      id: "power-bi-p1",
      prompt: "In a star-schema model, what does the fact table hold?",
      options: [
        "Numeric measurements of events — sales amounts, counts — plus foreign keys linking to dimension tables",
        "Descriptive attributes such as customer names and product categories",
        "Report page layouts and formatting rules",
        "Only dates and calendar tables",
      ],
      answer: 0,
      explanation:
        "Facts are the events you measure: rows of transactions with numeric columns. Their meaning comes from the dimensions — who, what, where, when — they reference; descriptive attributes live in dimensions, not facts.",
    },
    {
      id: "power-bi-p2",
      prompt: "What is the key difference between a measure and a calculated column in DAX?",
      options: [
        "A measure is stored inside the fact table; a calculated column is stored inside a dimension",
        "A measure is evaluated at query time under the current filter context; a calculated column is computed row by row when data refreshes",
        "A calculated column can use SUM, while a measure cannot",
        "There is no practical difference — both are computed identically",
      ],
      answer: 1,
      explanation:
        "Measures respond to slicers, filters, and visual context because they evaluate at query time; calculated columns freeze their values at refresh, one row at a time. Choosing wrong bloats the model or silently breaks the analysis.",
    },
    {
      id: "power-bi-p3",
      prompt: "What does the CALCULATE function do?",
      options: [
        "Creates relationships between tables",
        "Converts a column's data type",
        "Evaluates an expression inside a filter context that you modify with its filter arguments",
        "Schedules dataset refreshes",
      ],
      answer: 2,
      explanation:
        "CALCULATE is the core DAX context engine: it takes an expression plus filter arguments, changes the filter context, then evaluates the expression under those changed filters — the foundation of comparisons like sales versus last year.",
    },
    {
      id: "power-bi-p4",
      prompt: "A modeler sets every relationship to bidirectional cross-filtering just in case. What is the most likely consequence?",
      options: [
        "Ambiguous filter paths and slower queries, for flexibility the model almost never needs",
        "Reports automatically refresh more often",
        "Row-level security becomes unnecessary",
        "Nothing — bidirectional is the recommended default for every relationship",
      ],
      answer: 0,
      explanation:
        "Single-direction filtering from dimensions into facts gives predictable filter flow. Bidirectional filtering multiplies ambiguity and cost; it is a deliberate tool for specific patterns, never a default.",
    },
    {
      id: "power-bi-p5",
      prompt: "Your year-over-year revenue measure returns blank or clearly wrong values. What is the most common root cause in real models?",
      options: [
        "The report page has too many visuals",
        "The color theme file is missing",
        "The measure name contains a space",
        "There is no proper date table marked as such for time intelligence to work against",
      ],
      answer: 3,
      explanation:
        "Time intelligence functions assume a contiguous date table, marked as a date table. Pointing them at a text month column or an unmarked calendar is the classic reason YTD and year-over-year measures break.",
    },
    {
      id: "power-bi-p6",
      prompt: "A slicer filters every visual on the page except one chart. Where do you fix this in Power BI?",
      options: [
        "Format > Edit interactions, then set how the slicer affects that specific visual",
        "Delete the visual and rebuild the page",
        "Change the dataset's refresh schedule",
        "Re-publish the report to a new workspace",
      ],
      answer: 0,
      explanation:
        "Every pair of visuals has an editable interaction: a slicer can filter, highlight, or ignore each target visual. Edit interactions makes cross-filtering deliberate instead of accidental.",
    },
    {
      id: "power-bi-p7",
      prompt: "Scheduled refresh works for cloud sources but fails to reach an on-premises database. What is missing?",
      options: [
        "A larger capacity license",
        "An on-premises data gateway brokering between the service and the local network",
        "A second workspace",
        "A row-level security role",
      ],
      answer: 1,
      explanation:
        "The Power BI service runs in the cloud and cannot see private networks by default. The on-premises data gateway is the supported bridge for scheduled refresh to local data; stored credentials alone do not tunnel the connection.",
    },
    {
      id: "power-bi-p8",
      prompt: "An analyst hand-corrects null values in a report every week after refresh. What is the right fix?",
      options: [
        "Keep patching it manually — it only takes five minutes",
        "Ask viewers to mentally ignore those rows",
        "Fix it upstream in Power Query so the correction is an applied step that survives every refresh",
        "Hide the null values behind a bookmark",
      ],
      answer: 2,
      explanation:
        "Manual report-time fixes are invisible, unreproducible, and lost on the next refresh. Power Query applied steps make the correction part of the data pipeline, where everyone can see and audit it.",
    },
    {
      id: "power-bi-p9",
      prompt: "A stakeholder insists on thirty visuals on one report page for a one-stop shop. As the report author, what is the professional move?",
      options: [
        "Propose a focused page with the decision-critical visuals plus drill-through to detail, then demonstrate both options and let usage decide",
        "Comply silently — the stakeholder signs the checks",
        "Split the content across thirty separate report pages",
        "Add all thirty visuals but shrink them until they fit one screen",
      ],
      answer: 0,
      explanation:
        "Thirty visuals on one page guarantees slow rendering and zero scanning hierarchy. The evidence-based move is a small decision-focused page with drill-through, demonstrated side by side with the wall of charts.",
    },
    {
      id: "power-bi-p10",
      prompt: "Regional managers must each see only their own region in a shared sales report. What is the concept-level solution?",
      options: [
        "Publish one separate report per region",
        "Ask users politely to filter honestly",
        "Hide the region column and rely on grand totals",
        "Row-level security: define roles that filter the fact table by region and assign users to those roles",
      ],
      answer: 3,
      explanation:
        "RLS moves data filtering into the model with role definitions, so one published report serves each manager a filtered view automatically. Per-user copies and honor-system filtering leak data and do not scale.",
    },
  ],
  "tableau": [
    {
      id: "tableau-p1",
      prompt: "Dragging a field onto Columns produces discrete headers — a blue pill — rather than a continuous axis. What does the blue pill tell you?",
      options: [
        "The field is discrete — typically a dimension — creating labeled headers rather than an axis",
        "The field is a continuous measure creating an axis",
        "The field is broken and must be replaced",
        "The field has been silently converted into a filter",
      ],
      answer: 0,
      explanation:
        "In Tableau's paradigm, blue means discrete: headers and categorical panes. Green means continuous: axes. Dimensions are usually discrete and measures usually continuous, but any field can be switched — the pill color tells you which.",
    },
    {
      id: "tableau-p2",
      prompt: "When is a Tableau extract the right choice over a live connection?",
      options: [
        "When dashboards must reflect data up to the second",
        "When your data source is a small spreadsheet",
        "When you need fast, portable performance and can accept the freshness lag of the extract's refresh schedule",
        "Extracts are required for all data sources",
      ],
      answer: 2,
      explanation:
        "An extract is a snapshot optimized for analysis speed and offline work; a live connection trades performance for freshness. Choosing between them is a freshness-versus-speed decision, made per data source.",
    },
    {
      id: "tableau-p3",
      prompt: "What does a FIXED level-of-detail expression compute?",
      options: [
        "A running total across the entire table",
        "The aggregation at the granularity you specify, independent of whatever dimensions are in the view",
        "The field's default aggregation",
        "A filter that hides null values",
      ],
      answer: 1,
      explanation:
        "FIXED locks the calculation to the dimensions you name, regardless of the view's level of detail — the standard way to answer questions like average customer order value while browsing per-transaction rows.",
    },
    {
      id: "tableau-p4",
      prompt: "In a crosstab with Segment on rows and Month on columns, your RUNNING_SUM table calculation restarts when you wanted it to continue down the table. What controls this?",
      options: [
        "The calculation's addressing and partitioning — its compute-using settings",
        "The colors assigned to the pills",
        "The extract's sort order",
        "The dashboard's device layout",
      ],
      answer: 0,
      explanation:
        "Table calculations follow compute-using: the fields that address the calculation and the fields that partition it. A restart down the table means some field is partitioning the calc; re-addressing it fixes the restart.",
    },
    {
      id: "tableau-p5",
      prompt: "You connect to a CSV and the order-date column arrives as text, so time-based charts refuse to build properly. What is the correct fix?",
      options: [
        "Chart against the text field and accept string sorting",
        "Hide the column from every worksheet",
        "Write a string calculation that mimics dates",
        "Change the field's data type to date in the data source pane so every downstream view gets a real date",
      ],
      answer: 3,
      explanation:
        "Data types are fixed at the source: a real date field unlocks continuous axes, date parts, and proper sorting everywhere. Workarounds with strings fight the tool on every sheet forever.",
    },
    {
      id: "tableau-p6",
      prompt: "A Top 10 Customers by Sales filter keeps returning customers outside the true top 10. What explains it?",
      options: [
        "Tableau cannot compute top-N filters on extracts",
        "Top-N filters are incompatible with color legends",
        "Tableau's filter order of operations — dimension filters applied before the top-N logic distort the ranking; a context filter restores the precedence",
        "The source CSV must be sorted manually before connecting",
      ],
      answer: 2,
      explanation:
        "Filters execute in a fixed order, and dimension filters can shrink the data before the top-N set is computed, changing who makes the cut. Promoting the controlling filter to context fixes the precedence.",
    },
    {
      id: "tableau-p7",
      prompt: "A manager wants clicking a region on the map to dim every other mark on the dashboard so that region's numbers stand out. Which Tableau feature does this?",
      options: [
        "A highlight action on the dashboard",
        "A URL action to an external search engine",
        "The Pages shelf with animation",
        "A fixed axis range",
      ],
      answer: 0,
      explanation:
        "Highlight actions gray out all marks except those sharing the selected dimension, across every sheet that contains it — the built-in answer for 'show me this one thing, muted everywhere else.'",
    },
    {
      id: "tableau-p8",
      prompt: "Tableau classifies the numeric Customer ID field as a measure, so views show SUM(Customer ID). What is the correct fix?",
      options: [
        "Set its aggregation to AVERAGE and move on",
        "Convert the field to a dimension — IDs are labels, not quantities to aggregate",
        "Hide the field in every worksheet",
        "Rename the field so Tableau re-detects it",
      ],
      answer: 1,
      explanation:
        "Aggregating an identifier is meaningless. Tableau guesses roles by data type, but meaning is the author's call: moving an ID to dimensions makes every view treat it as the categorical label it is.",
    },
    {
      id: "tableau-p9",
      prompt: "A board narrative needs a guided, sequential argument built in Tableau. Which construct fits best?",
      options: [
        "One dashboard with twenty charts and global filters for exploration",
        "A raw crosstab exported as a PDF",
        "Story points: a captioned sequence of views that walks the audience through the argument",
        "An auto-rotating animation with no captions",
      ],
      answer: 2,
      explanation:
        "Story points are Tableau's native narrative device: ordered, captioned views that control the audience's path through an argument. Exploratory dashboards serve analysts; stories serve decisions.",
    },
    {
      id: "tableau-p10",
      prompt: "A workbook on a 300-million-row live connection takes 45 seconds to render its first dashboard. What is the standard first move?",
      options: [
        "Move the data source to an extract, then reduce mark counts and filter complexity — and measure with a performance recording",
        "Add more colors so charts parse faster visually",
        "Increase every chart's font size",
        "Export the dashboard to a static image",
      ],
      answer: 0,
      explanation:
        "Extracts exist for scale: they optimize exactly the queries dashboards run. Then cut mark counts, simplify filters, and use performance recording to find what actually costs the time — before anyone buys hardware.",
    },
  ],
};
