/**
 * PART B · LESSON b-02 — "Line Plots"
 *
 * ax.plot and its styling arguments, multi-series legends, and zorder.
 * Each code block is real matplotlib on the course's shared numbers;
 * each is paired with a live engine chart of the SAME data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { REVENUE_2023, REVENUE_2024, TEMPS } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_B_02: DataVizLesson = {
  slug: "b-02",
  title: "Line Plots",
  minutes: 25,
  summary:
    "ax.plot and its styling arguments — color, linestyle, marker — plus legends for multi-series charts and zorder, the stacking order that decides what paints over what.",
  tool: "matplotlib",
  objectives: [
    "Draw a line with ax.plot and control its color, linestyle, marker and linewidth",
    "Put two series on one Axes with label= and ax.legend(), distinguishable beyond hue",
    "Use the packed format string (for example \"o--\") to set marker and linestyle in one token",
    "Control layer stacking with zorder and ax.set_axisbelow so reference ink sits behind data",
  ],
  why: "Lines are how time speaks: the eye reads slope directly, so a line chart hands your reader the rate of change before they read a single label. But two lines on one canvas is where the real craft starts — color, linestyle, marker and legend decide whether the reader can tell the years apart at a glance, and zorder decides whether reference lines sit behind the data or paint over it. This lesson is the syntax for all of that, on numbers you have already met in Part A.",
  blocks: [
    {
      kind: "text",
      text: "A line chart encodes each value as a **position** and each change as a **slope** — which is why time series read so naturally as lines. `ax.plot(x, y)` connects the points in the order you give them. Three arguments do most of the styling work: `color` (the hue), `linestyle` (how the points are joined) and `marker` (the shape stamped at each data point).",
    },
    {
      kind: "code",
      title: "One line, styled",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(months, revenue,
        color="#0d9488",    # the line's hue
        linestyle="-",      # "-", "--", "-." or ":"
        marker="o",         # a dot stamped on each month
        linewidth=2)
ax.set(title="Monthly revenue, 2024", ylabel="revenue (k$)")
plt.show()`,
      note: "Markers earn their ink on twelve points; at 500 points you would drop the marker and keep the line.",
      produces: "Renders the same single teal line with round markers shown below.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "revenue (k$)",
        showLegend: false,
      },
      why: "Position along a common scale, connected in time order: the slope carries the story — steady growth accelerating into the final quarter, exactly as in a-01.",
    },
    {
      kind: "text",
      text: "One line makes a statement; two lines make a **comparison**. Give each series a `label=` when you draw it and call `ax.legend()` once afterwards — the legend is an artist on the Axes, built from labels you already attached. Distinguish the series by more than hue alone: a different *marker* and *linestyle* keeps them apart in grayscale printouts and for color-blind readers.",
    },
    {
      kind: "code",
      title: "Two years, one canvas, one legend",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
rev_2023 = [102, 108, 112, 109, 117, 121, 126, 124, 129, 133, 141, 148]
rev_2024 = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(months, rev_2023, color="#0f766e", linestyle="--", marker="s",
        linewidth=2, label="2023")
ax.plot(months, rev_2024, color="#c2410c", linestyle="-", marker="o",
        linewidth=2, label="2024")
ax.set(title="Monthly revenue, 2023 vs 2024", ylabel="revenue (k$)")
ax.legend(loc="upper left")
plt.show()`,
      note: "Both lines share one y-scale — that is what makes the vertical gap between them meaningful.",
      produces: "Renders the same two-line comparison shown below — dashed squares for 2023, solid dots for 2024, legend in the upper left.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2023 vs 2024",
        categories: months,
        series: [
          { name: "2023", values: REVENUE_2023 },
          { name: "2024", values: REVENUE_2024 },
        ],
        yLabel: "revenue (k$)",
      },
      why: "Same scale, two encodings: 2024 is always the higher line, and the widening daylight between them is the chart's real message.",
    },
    {
      kind: "table",
      title: "The packed format string",
      headers: ["Piece", "Symbols", "Meaning"],
      rows: [
        ["color", "`\"b\"`, `\"k\"`, `\"#0d9488\"`, `\"teal\"`", "the hue"],
        ["marker", "`\"o\"`, `\"s\"`, `\"^\"`, `\"D\"`", "shape stamped at each point"],
        ["linestyle", "`\"-\"`, `\"--\"`, `\"-.\"`, `\":\"`", "how the points are joined"],
        ["packed", '`ax.plot(x, y, "o--")`', "marker o plus dashed line, color left to the cycle"],
      ],
      caption: "One string token can carry marker and linestyle together — handy, but explicit keyword arguments are easier to read six months later.",
    },
    { kind: "heading", text: "zorder — the stacking order of layers" },
    {
      kind: "text",
      text: "Artists paint in the order you add them — later calls draw on top of earlier ones. Every artist also carries a `zorder` number: **higher paints later**, so higher means closer to the eye. Gridlines and reference lines belong *behind* the data, which is exactly what `ax.set_axisbelow(True)` arranges; manual `zorder=` is for the exceptions.",
    },
    {
      kind: "code",
      title: "Reference lines behind the data",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
lisbon = [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12]
oslo = [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.set_axisbelow(True)                  # gridlines behind everything
ax.axhline(17.75, color="gray", linestyle=":", zorder=1)   # Lisbon mean
ax.axhline(6.3, color="gray", linestyle=":", zorder=1)     # Oslo mean
ax.plot(months, lisbon, color="#c2410c", marker="o", zorder=3, label="Lisbon")
ax.plot(months, oslo, color="#0d9488", marker="s", zorder=3, label="Oslo")
ax.set(title="Monthly temperature with annual means", ylabel="°C")
ax.legend(loc="upper left")
plt.show()`,
      note: "ax.axhline paints one horizontal reference line at a fixed y-value — the classic use is a mean, a target or a threshold. b-09 makes reference lines talk.",
      produces:
        "Renders the same two temperature lines shown below; the dotted mean lines at 17.75 and 6.3 °C are matplotlib ink our engine does not draw — zorder keeps them under the markers.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Lisbon vs Oslo, average monthly temperature",
        categories: months,
        series: [
          { name: "Lisbon", values: TEMPS.Lisbon },
          { name: "Oslo", values: TEMPS.Oslo },
        ],
        yLabel: "°C",
      },
      why: "The same shared-scale discipline: Lisbon never leaves 11–25 °C while Oslo swings −3 to 17 — two climates, one honest ruler. In the listing, both means (17.75 and 6.3) sit quietly behind the ink.",
    },
    {
      kind: "interpretation",
      id: "b-02-i1",
      chart: {
        type: "line",
        title: "Monthly revenue, 2023 vs 2024",
        categories: months,
        series: [
          { name: "2023", values: REVENUE_2023 },
          { name: "2024", values: REVENUE_2024 },
        ],
        yLabel: "revenue (k$)",
      },
      prompt: "Two lines, one canvas, one scale. What does the chart communicate about the gap between the years?",
      options: [
        {
          text: "2024 sits above 2023 in every month, and the gap widens from 22 k$ in January (124 vs 102) to 56 k$ in December (204 vs 148)",
          correct: true,
          feedback:
            "Correct — level, shape and gap: the ordering never flips, both years rise to a winter peak, and the daylight more than doubles (22 to 56).",
        },
        {
          text: "The two years converge by December",
          correct: false,
          feedback: "The gap does the opposite — it grows from 22 k$ in January to 56 k$ in December.",
        },
        {
          text: "2023 was the better year because its line is smoother",
          correct: false,
          feedback: "Smoothness is not value: 2023 peaks at 148 against 2024's 204.",
        },
        {
          text: "Both years peak in the summer months",
          correct: false,
          feedback: "Both peak in December (148 and 204); summer is a shoulder, not the summit.",
        },
      ],
      explanation:
        "Comparing lines is about level (who is higher), shape (how each moves) and gap (how the difference evolves). The honest reader names which one they are claiming — here all three agree, which is why the chart works.",
    },
    {
      kind: "exercise",
      id: "b-02-e1",
      exerciseKind: "concept-check",
      prompt:
        "Your gridlines and a gray reference line are painting over your data line, hiding the markers at the crossings. Which single call restores the natural stacking, and why does it work?",
      hint: "The fix is one Axes-level call that re-arranges the paint order — no redrawing needed.",
      options: [
        {
          text: "ax.set_axisbelow(True) — it moves the grid and other background artists below the data artists in one move",
          correct: true,
          feedback:
            "Correct — it is the one-call way to say 'reference layers under data layers'. Manual zorder is only for exceptions this call cannot express.",
        },
        {
          text: "Set the data line's zorder to -1",
          correct: false,
          feedback: "Negative zorder buries the data below the grid and the panel background — the opposite of the goal.",
        },
        {
          text: "Increase linewidth so the line wins by thickness",
          correct: false,
          feedback: "Overlap is a stacking problem, not a width problem; the gridlines still cross over the ink.",
        },
        {
          text: "Re-plot the line in a loop until it looks right",
          correct: false,
          feedback: "Draw order can fix stacking, but the loop is luck; zorder and set_axisbelow are the named, deliberate control.",
        },
      ],
      explanation:
        "zorder is a layer index on every artist; set_axisbelow is the common case packaged. Knowing which layer owns which ink is b-01's hierarchy applied to paint order.",
    },
  ],
  terms: [
    {
      term: "marker",
      definition: "The shape stamped at each data point — o, s, ^, D and friends. The marker= argument of ax.plot.",
    },
    {
      term: "linestyle",
      definition: "How consecutive points are joined: \"-\" solid, \"--\" dashed, \"-.\" dash-dot, \":\" dotted.",
    },
    {
      term: "zorder",
      definition: "Every artist's stacking number: higher zorder paints later, so it sits on top. Data typically gets zorder 3, reference lines 1.",
    },
  ],
  takeaways: [
    "ax.plot(x, y) joins positions with segments; the slope carries the change story.",
    "Give every series a `label=` and call `ax.legend()` once; distinguish series by marker and linestyle, not hue alone.",
    'The packed format string — `ax.plot(x, y, "o--")` — sets marker and linestyle in one token.',
    "zorder decides stacking; `ax.set_axisbelow(True)` keeps reference layers under the data where they belong.",
  ],
  quiz: [
    {
      id: "b-02-q1",
      prompt: "What does a line's slope encode that a bar's length does not?",
      options: [
        {
          text: "The rate of change between consecutive points",
          correct: true,
          feedback: "Correct — slope is change per step of x, which is why lines own time series.",
        },
        {
          text: "The exact numeric value of each point",
          correct: false,
          feedback: "Neither encoding is exact without labels; precision is the table's job, structure is the chart's.",
        },
        {
          text: "The category each point belongs to",
          correct: false,
          feedback: "Categories are the bar chart's home turf; lines assume a meaningful x-order.",
        },
        {
          text: "The total sum of the series",
          correct: false,
          feedback: "A total is one number; a line is twelve of them — no sum is drawn.",
        },
      ],
      explanation:
        "Position encodes value, slope encodes change. That double duty is why the eye reads a line's trend before its first label.",
    },
    {
      id: "b-02-q2",
      prompt: "Which argument puts a series into the legend?",
      options: [
        {
          text: "label=\"2024\", given per ax.plot call",
          correct: true,
          feedback: "Correct — ax.legend() builds itself from the label= values of the marks already on the Axes.",
        },
        {
          text: "legend=\"2024\", given to ax.legend",
          correct: false,
          feedback: "ax.legend takes placement arguments, not series names; the names come from label=.",
        },
        {
          text: "title=\"2024\", given to ax.set_title",
          correct: false,
          feedback: "That names the whole chart, not one series — one title, many labels.",
        },
        {
          text: "series=\"2024\", given to plt.subplots",
          correct: false,
          feedback: "No such argument; subplots is about layout, not identity.",
        },
      ],
      explanation:
        "The legend is a summary of work you did while drawing: label each series as you plot it, then one ax.legend() call renders the key.",
    },
    {
      id: "b-02-q3",
      prompt: "Two artists overlap in one Axes. Which paints on top?",
      options: [
        {
          text: "The one with the higher zorder; if zorder is equal, the one drawn later",
          correct: true,
          feedback: "Correct — zorder first, draw order as the tie-breaker. Both rules are deterministic, never luck.",
        },
        {
          text: "The one drawn later, always",
          correct: false,
          feedback: "Only when zorder ties; an explicit higher zorder beats a later draw.",
        },
        {
          text: "The one with the lower zorder",
          correct: false,
          feedback: "Lower zorder paints earlier, so it ends up underneath.",
        },
        {
          text: "Whichever has more ink area",
          correct: false,
          feedback: "Area has no vote; stacking is zorder plus call order, nothing else.",
        },
      ],
      explanation:
        "zorder is matplotlib's answer to 'which layer is which': set it once per artist class (references low, data high) and stop thinking about draw order.",
    },
  ],
};
