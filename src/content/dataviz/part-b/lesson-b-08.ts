/**
 * PART B · LESSON b-08 — "Subplots"
 *
 * The comparison chapter: one Figure, many Axes. plt.subplots(nrows,
 * ncols) builds the grid, sharex/sharey decide whether panels compare
 * honestly, axes.flat turns the grid into a loop, and per-tile
 * ax.set_title replaces pyplot's current-Axes guessing. The Chart
 * Playground's COMPARE mode (Part A's link) is this lesson made
 * interactive.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { EXPENSES_2024, REVENUE_2023, REVENUE_2024, months } from "../datasets";

const MARGIN_2024 = REVENUE_2024.map((r, i) => r - EXPENSES_2024[i]);

export const LESSON_V_B_08: DataVizLesson = {
  slug: "b-08",
  title: "Subplots",
  minutes: 25,
  summary:
    "One Figure, many Axes: plt.subplots(nrows, ncols) builds the grid, sharex/sharey make the panels comparable, suptitle names the whole, and ax.set_title labels each tile — the machinery of small multiples.",
  tool: "matplotlib",
  objectives: [
    "Build a grid with plt.subplots(nrows, ncols) and index it correctly — axes[0, 1] is the top-right tile",
    "Use sharex/sharey so compared panels share a scale, and say when NOT to share",
    "Title the whole figure with suptitle and each tile with ax.set_title, in the right sizes",
    "Loop a grid with axes.flat / axes.ravel() and manage layout with constrained_layout",
  ],
  why: "The strongest comparisons happen when the reader can move their eye from panel to panel without re-learning anything. Two charts stacked in a report make the reader hold scales in memory; two panels of ONE figure, sharing a y-axis, make the comparison a single glance. That is what plt.subplots delivers — and it is also the fix for a bug you have already met in b-01: with several plot areas in play, pyplot's implicit 'current Axes' stops being trustworthy, and the explicit fig, axes spelling becomes mandatory, not stylistic. Small multiples — same chart, one panel per group — are the highest-expression use of this machinery, and they are how dashboards (Part E) think.",
  blocks: [
    {
      kind: "text",
      text: "b-01 drew one Axes on one Figure. The step up is a **grid**: `fig, axes = plt.subplots(2, 2)` gives you a Figure holding four Axes, addressed like a matrix — `axes[0, 0]` top-left, `axes[0, 1]` top-right, `axes[1, 0]` bottom-left. Each tile is a full Axes with its own marks, scales and title; the Figure now has a second job beyond holding a canvas — it holds a *layout*, and a whole-figure headline via `fig.suptitle`.",
    },
    {
      kind: "code",
      title: "A 1×2 comparison: 2023 beside 2024, on one y-scale",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
rev_2023 = [102, 108, 112, 109, 117, 121, 126, 124, 129, 133, 141, 148]
rev_2024 = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

fig, axes = plt.subplots(1, 2, figsize=(11, 4.2), sharey=True)
axes[0].plot(months, rev_2023, color="#94a3b8")
axes[0].set_title("2023")
axes[1].plot(months, rev_2024, color="#0d9488")
axes[1].set_title("2024")

fig.suptitle("Monthly revenue: 2024 accelerated past 2023's pace")
fig.savefig("revenue_panels.png", dpi=150)
plt.show()`,
      note: "With one row, axes is a flat array — axes[0], axes[1]. sharey=True gives both tiles one y-scale, which is the entire comparison.",
      produces:
        "Two line panels side by side under one suptitle — the two tiles the engine renders separately below, exactly as matplotlib composes them into one Figure.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "2023",
        categories: months,
        series: [{ name: "revenue 2023", values: REVENUE_2023, color: "#94a3b8" }],
        yLabel: "revenue (k$)",
        showLegend: false,
      },
      why: "The left tile. On the shared scale, 2023's whole year lives between 102 and 148 — the eye should not need to read ticks to feel that.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "2024",
        categories: months,
        series: [{ name: "revenue 2024", values: REVENUE_2024, color: "#0d9488" }],
        showLegend: false,
      },
      why: "The right tile, same 0-220 scale. The comparison lands without a single number being read: 2024's line starts higher AND climbs steeper — that is what sharey buys.",
    },
    {
      kind: "text",
      text: "**sharey is the honesty rule of panels.** Two panels with private scales are two separate charts wearing a costume — the reader has no idea the left one's 148 and the right one's 204 live on different rulers. Share the axis whenever the panels compare the same measure; break it only deliberately, when the measures differ (revenue beside temperature), and then say so loudly with per-tile axis labels. The same logic gives you **sharex** for stacked time series — Part D's linked-axes dashboards are this idea, industrialized.",
    },
    {
      kind: "code",
      title: "The 2×2 grid: matrix indexing and the whole-figure title",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
rev_2023 = [102, 108, 112, 109, 117, 121, 126, 124, 129, 133, 141, 148]
rev_2024 = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]
margin = [r - e for r, e in zip(rev_2024, expenses)]   # 26 … 70

fig, axes = plt.subplots(2, 2, figsize=(11, 7), constrained_layout=True)

axes[0, 0].plot(months, rev_2023, color="#94a3b8")   # top-left
axes[0, 0].set_title("Revenue 2023")
axes[0, 1].plot(months, rev_2024, color="#0d9488")   # top-right
axes[0, 1].set_title("Revenue 2024")
axes[1, 0].plot(months, expenses, color="#c2410c")   # bottom-left
axes[1, 0].set_title("Expenses 2024")
axes[1, 1].bar(months, margin, color="#0d9488")      # bottom-right
axes[1, 1].set_title("Margin 2024 (revenue - expenses)")

fig.suptitle("The 2024 P&L, four ways")
plt.show()`,
      note: "With more than one row AND column, axes is a 2-D array — axes[1, 1] is the bottom-right tile. constrained_layout=True is the modern one-argument answer to overlapping titles and cut-off labels.",
      produces:
        "A four-tile P&L: both revenue years on top, expenses and monthly margin below. The margin tile — the figure's actual finding — is the bottom-right chart rendered under this lesson's interpretation.",
    },
    {
      kind: "heading",
      text: "Looping over the grid: small multiples",
    },
    {
      kind: "code",
      title: "One chart, one panel per group",
      language: "python",
      code: `cities = ["Lisbon", "Oslo", "Cairo", "Singapore"]
temps = {
    "Lisbon":    [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12],
    "Oslo":      [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2],
    "Cairo":     [19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20],
    "Singapore": [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
}

fig, axes = plt.subplots(1, 4, figsize=(13, 3.4), sharey=True)
for ax, city in zip(axes.flat, cities):        # .flat walks row by row
    ax.plot(months, temps[city], color="#0d9488")
    ax.set_title(city, fontsize=10)
    ax.tick_params(axis="x", labelrotation=45, labelsize=7)

fig.suptitle("Four climates, one scale", y=1.04)
plt.show()`,
      note: "axes.flat (or axes.ravel()) yields the tiles in reading order, so zip pairs each tile with its group — the loop body never mentions an index. This is the small-multiples pattern: same mark, same scale, one panel per group.",
      produces:
        "Four small line charts under one headline — the shape of Part C's FacetGrid (c-08) and the backbone of every dashboard in Part E.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The b-01 bug, now explained in full",
      text: "`plt.title(\"Margin\")` inside a subplot loop labels whichever Axes pyplot currently holds — the LAST one drawn, usually, but that is an implementation detail, not a promise. This is why b-01 insisted on the explicit interface: `axes[1, 1].set_title(\"Margin\")` names its target. In a grid there is no 'current Axes' worth trusting; every call carries its own address.",
    },
    {
      kind: "table",
      title: "Grid indexing cheat sheet",
      headers: ["Call", "axes is…", "First tile"],
      rows: [
        ["`plt.subplots()`", "a single Axes", "`ax` directly — no index"],
        ["`plt.subplots(1, 2)`", "1-D array (row)", "`axes[0]`"],
        ["`plt.subplots(2, 1)`", "1-D array (column)", "`axes[0]`"],
        ["`plt.subplots(2, 2)`", "2-D array", "`axes[0, 0]`"],
        ["any of the above", "…but `axes.flat` always walks it", "`next(axes.flat)`"],
      ],
      caption: "The one-row/one-column cases hand you a flat array; two dimensions hand you a matrix. axes.flat is the shape-proof way to loop.",
    },
    {
      kind: "interpretation",
      id: "b-08-i1",
      chart: {
        type: "bar",
        title: "Margin 2024 (revenue − expenses)",
        categories: months,
        series: [{ name: "margin", values: MARGIN_2024 }],
        xLabel: "month",
        yLabel: "margin (k$)",
        showValues: false,
        showLegend: false,
      },
      prompt: "This is the bottom-right tile of the P&L figure. Which reading is exactly right?",
      options: [
        {
          text: "Margin roughly doubles across the year: about 26-30 k$ per month early, 50-70 k$ late, with December's 70 the largest",
          correct: true,
          feedback:
            "Correct — 26 in January growing to 70 in December, and the late-year months (62, 70) are the standouts. 'Roughly doubles' is a fair summary of 26→28→…→62→70.",
        },
        {
          text: "Margin falls in the second half because expenses rise",
          correct: false,
          feedback: "Expenses do rise (98 → 134), but revenue rises faster (124 → 204) — the margin bars climb, they do not fall.",
        },
        {
          text: "Every month improved on the one before",
          correct: false,
          feedback: "March (28) is under February (30), and July (39) is under June (42) — the trend climbs, the steps do not.",
        },
        {
          text: "The chart is dishonest because it omits the revenue and expenses tiles",
          correct: false,
          feedback: "Omission is a framing choice, and the title says exactly what is shown: revenue minus expenses per month. Nothing here misstates the data it claims to show.",
        },
      ],
      explanation:
        "Reading a derived measure is reading two things at once: the level (26 → 70) and its provenance (revenue outpacing expenses). The margin tile is the figure's finding — which is why it belongs in the grid at all.",
    },
    {
      kind: "exercise",
      id: "b-08-e1",
      exerciseKind: "concept-check",
      prompt:
        "You are building a 2×2 figure comparing four cities' monthly temperatures (the c-08-style small multiple). A teammate sets figsize=(4, 3) — four tiles in 4×3 inches — and skips sharey. Name the two consequences for the reader, and the two-line fix.",
      hint: "What does a 1-inch-wide tile do to twelve month labels? And what do four private y-scales do to 'which city is warmer'?",
      options: [
        {
          text: "Tiny tiles starve the labels (twelve monthly ticks in about an inch per tile — unreadable or overlapping), and four private scales make the panels visually comparable while numerically incomparable. Fix: figsize wide enough per tile (e.g. (12, 6) for four columns) and sharey=True so one scale rules all panels",
          correct: true,
          feedback:
            "Correct — the grid's contract is 'same chart, different group', and the contract is written in shared scales and tiles big enough to carry their own ink.",
        },
        {
          text: "Nothing is wrong: matplotlib auto-fits labels and scales to any figure size",
          correct: false,
          feedback: "Layout engines prevent overlap, not illegibility — a constrained 1-inch tile with 12 rotated ticks is 'technically fitting' and practically unreadable.",
        },
        {
          text: "The only fix is to abandon subplots and draw one line chart with four lines",
          correct: false,
          feedback: "Overlaying four lines is a legitimate alternative (b-02), but it is a different chart with different occlusion costs — the small-multiple problems here have small-multiple fixes.",
        },
        {
          text: "sharey=True is only for grids with one row",
          correct: false,
          feedback: "sharey works in any shape — it shares the y-scale across all tiles; column count is irrelevant to it.",
        },
      ],
      explanation:
        "Grid design has two knobs most beginners never touch: tile size (figsize ÷ grid shape) and shared scales (sharex/sharey). Both exist to serve the same reader: the one comparing panels.",
    },
  ],
  terms: [
    {
      term: "Subplot grid",
      definition: "A Figure holding nrows × ncols Axes, built by plt.subplots(nrows, ncols). Tiles are indexed like a matrix (2-D grids) or a list (single row/column).",
    },
    {
      term: "Small multiples",
      definition: "The same chart repeated once per group, on shared scales — Tufte's term. matplotlib's loop over axes.flat with one mark type; seaborn's FacetGrid (c-08) automates it.",
    },
    {
      term: "constrained_layout",
      definition: "The layout engine that fits titles, labels and ticks inside the Figure without overlap. figsize-constrained layouts replace the older tight_layout() call.",
    },
  ],
  takeaways: [
    "One Figure, many Axes: plt.subplots(nrows, ncols) builds the grid; index it like a matrix, loop it with axes.flat.",
    "sharex/sharey is the honesty rule of panels — compared tiles share a scale, and broken sharing is announced loudly, never slipped in.",
    "suptitle names the whole figure; ax.set_title names each tile. In a grid, every call carries its own address — the b-01 explicit-interface habit, now mandatory.",
    "Small multiples — same mark, same scale, one panel per group — are the pattern behind FacetGrid and every dashboard you will build in Part E.",
  ],
  quiz: [
    {
      id: "b-08-q1",
      prompt: "After fig, axes = plt.subplots(2, 2), which expression is the top-RIGHT tile?",
      options: [
        {
          text: "axes[0, 1] — row 0 (top), column 1 (right)",
          correct: true,
          feedback: "Correct — matrix order: [row, col], zero-indexed from the top-left.",
        },
        {
          text: "axes[1, 0]",
          correct: false,
          feedback: "That is the bottom-LEFT tile — the transpose.",
        },
        {
          text: "axes[2]",
          correct: false,
          feedback: "A 2×2 grid yields a 2-D array; flat indexing needs axes.flat[1] — and axes[2] would not compile.",
        },
        {
          text: "axes.topright()",
          correct: false,
          feedback: "No such method exists — the indexing is positional, always.",
        },
      ],
      explanation:
        "Grid indexing is matrix indexing: [row, col], zero-based, origin top-left. Say 'row, column' out loud once and it never trips you again.",
    },
    {
      id: "b-08-q2",
      prompt: "Why does sharey=True matter in the 2023/2024 revenue panels?",
      options: [
        {
          text: "Both tiles draw on one y-scale, so line heights are directly comparable across the panel boundary",
          correct: true,
          feedback: "Correct — one ruler for both panels is what turns two charts into one comparison.",
        },
        {
          text: "It shares the y-axis label text, saving space",
          correct: false,
          feedback: "A shared label is a cosmetic side-effect; the substance is the shared SCALE.",
        },
        {
          text: "It forces both series into the same DataFrame column",
          correct: false,
          feedback: "Data organization is untouched — sharey is a rendering decision about scales.",
        },
        {
          text: "It merges both lines into one Axes",
          correct: false,
          feedback: "Merging is the overlaid alternative (b-02), not what sharey does — the tiles stay separate.",
        },
      ],
      explanation:
        "Panels with private scales invite a false comparison; sharey makes the geometry itself honest. The same rule powers shared_xaxes in Part D's linked dashboards.",
    },
    {
      id: "b-08-q3",
      prompt: "for ax, city in zip(axes.flat, cities) — what does axes.flat yield for a (1, 4) grid?",
      options: [
        {
          text: "The four tiles in reading order: left to right",
          correct: true,
          feedback: "Correct — .flat is a row-major iterator over any grid shape, which is exactly the order zip wants.",
        },
        {
          text: "The four city names",
          correct: false,
          feedback: "axes.flat yields Axes objects; the names come from the cities side of the zip.",
        },
        {
          text: "A 2-D array of tick labels",
          correct: false,
          feedback: "Nothing label-shaped — flat yields the Axes tiles themselves, one per iteration.",
        },
        {
          text: "Only the first tile, four times",
          correct: false,
          feedback: "Each tile is yielded exactly once; repetition would break the zip pairing that makes the pattern work.",
        },
      ],
      explanation:
        "axes.flat / axes.ravel() is the shape-proof iterator: whatever the grid's dimensions, tiles come out in reading order — which is why the loop body never needs an index.",
    },
  ],
};
