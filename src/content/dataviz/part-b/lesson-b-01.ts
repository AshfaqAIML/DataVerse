/**
 * PART B · LESSON b-01 — "Figure and Axes"
 *
 * The first matplotlib lesson: every script is the same four moves —
 * make a Figure, get an Axes, draw marks on the Axes, label and show.
 * Every code block is real matplotlib syntax; each is paired with a
 * live chart of the SAME data rendered by the course's shared engine,
 * so the API and the result teach together.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q4, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LESSON_V_B_01: DataVizLesson = {
  slug: "b-01",
  title: "Figure and Axes",
  minutes: 20,
  summary:
    "The object model behind every matplotlib script: a Figure (the canvas) holds Axes (the plot areas), the Axes hold marks, ticks and labels — and the same four moves build any chart you will ever make.",
  tool: "matplotlib",
  objectives: [
    "Create the fig, ax pair with plt.subplots() and say what each object owns",
    "Draw marks on an Axes with ax.plot and ax.bar, then frame them with ax.set",
    "Walk the artist hierarchy: Figure contains Axes, Axes contains Axis and marks",
    "Save a figure with fig.savefig and show it with plt.show, in the right order",
  ],
  why: "Every matplotlib question you will ever search — 'why did my axis label not appear', 'why is my saved image blank', 'why did the second plot overwrite the first' — is really a question about the object model. Matplotlib draws into a tree of artists: a Figure (the canvas) contains Axes (the plot areas), and each Axes contains the marks, ticks and labels you actually see. Once you can name those layers, the API stops being a pile of function names and becomes a small map you never get lost in again.",
  blocks: [
    {
      kind: "text",
      text: "A matplotlib figure is built like a picture in a frame. The **Figure** is the whole canvas — the window, its size, its background, the file it will eventually be saved to. The **Axes** is one plot area living on that canvas — the box with x and y scales where your data's ink goes. Almost every script you will write in this part is the same four moves: create the pair, draw marks *on the Axes*, label the frame, then show it or save it.",
    },
    {
      kind: "code",
      title: "The four moves of every matplotlib script",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

fig, ax = plt.subplots(figsize=(8, 4.5))       # the canvas, and one plot area
ax.plot(months, revenue, color="#0d9488", marker="o")   # draw ON the Axes
ax.set(title="Monthly revenue, 2024", xlabel="month", ylabel="revenue (k$)")

plt.show()   # hand the finished figure to the screen`,
      note: "The unpacking fig, ax = plt.subplots() is the idiomatic spelling — one line, two objects. Everything after it talks to ax.",
      produces:
        "Renders the same line chart shown below — one teal line through twelve monthly points, with title and axis labels set through ax.set.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        xLabel: "month",
        yLabel: "revenue (k$)",
        showLegend: false,
      },
      why: "This is exactly what the listing above draws: twelve points joined by segments, title and y-label applied at the Axes level. Our engine renders it live from the same revenue list — in matplotlib those numbers pass through ax.plot.",
    },
    {
      kind: "definition",
      term: "Figure",
      informal:
        "The top-level canvas: a window-sized artist that owns the figure size, the dpi, the background and every Axes placed on it. fig.savefig(...) writes this whole object to a file.",
      why: "You rarely draw on the Figure directly — you configure it (size, export) and let the Axes do the painting.",
    },
    {
      kind: "definition",
      term: "Axes",
      informal:
        "One plot area: the x and y scales, the marks (lines, bars, points), the ticks, the tick labels, the axis labels, the legend and the title. ax.plot, ax.bar and ax.set_title all talk to this object.",
      why: "The name trips everyone once: it is *Axes* (one whole plot), not *Axis* (one number line). One Figure can hold many Axes — that is b-08's subplots.",
    },
    { kind: "heading", text: "The artist hierarchy" },
    {
      kind: "text",
      text: "Matplotlib is a scene graph of **artists**. The Figure contains Axes; each Axes contains two **Axis** objects (the x and y number lines), and each Axis spawns the tick marks and tick labels. Your data marks — the `Line2D` that `ax.plot` returns, the `Rectangle`s that `ax.bar` stacks up — are artists too, pinned onto their Axes in the order you draw them. When you wonder *which object owns this pixel*, walk down the tree: canvas → plot area → number line or mark.",
    },
    {
      kind: "code",
      title: "A second mark, and the file leaves the building",
      language: "python",
      code: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
cups = [489, 647, 258, 671]

fig, ax = plt.subplots(figsize=(7, 4.5))
ax.bar(products, cups, color="#0d9488", edgecolor="white")
ax.set_title("Cups sold in December")
ax.set_ylabel("cups")

fig.savefig("cups_december.png", dpi=150)   # write the file first...
plt.show()                                  # ...then paint the screen`,
      note: "Swap ax.plot for ax.bar and nothing else changes: the same Figure/Axes plumbing carries any mark. Saving before show is a habit worth forming — show hands the figure to the GUI, and the file should already exist by then.",
      produces:
        "Renders the same four bars shown below, and writes cups_december.png to disk at 150 dpi.",
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
      why: "Same canvas, same framing calls, different mark: lengths from a shared zero baseline replace point positions. The listing above and this chart are the same data drawn by two engines.",
    },
    {
      kind: "table",
      title: "Which object owns what",
      headers: ["Call", "You are talking to", "What it controls"],
      rows: [
        ["`fig, ax = plt.subplots()`", "Figure + Axes", "the canvas, and one plot area on it"],
        ["`ax.plot(...)` / `ax.bar(...)`", "Axes", "the marks: lines, bars, points"],
        ["`ax.set_title(...)` / `ax.set_ylabel(...)`", "Axes", "the labels around the marks"],
        ["`ax.legend()`", "Axes", "the key mapping color to series"],
        ["`fig.savefig(\"chart.png\")`", "Figure", "the file the whole canvas is written to"],
        ["`plt.show()`", "pyplot", "the interactive window"],
      ],
      caption: "Every call in this part routes to exactly one row of this table. Naming the row is the whole skill.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Two interfaces, one object model",
      text: "`plt.plot(x, y)` and `ax.plot(x, y)` both work — pyplot keeps a *current figure / current Axes* behind the curtain and routes the call there. That is convenient for one quick chart and quietly wrong once several Axes exist: whose title did you just set? The explicit `fig, ax = plt.subplots()` spelling names its target, which is why every lesson in this part uses it.",
    },
    {
      kind: "interpretation",
      id: "b-01-i1",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "revenue (k$)",
        showLegend: false,
      },
      prompt: "Read the ink precisely: which statement about this line chart is exactly true?",
      options: [
        {
          text: "The steepest single-month climb is October to November: 171 to 189, a jump of 18 k$, and December adds 15 more to close at 204",
          correct: true,
          feedback:
            "Correct — 18 is the year's biggest step, and naming the months and the size of the jump is what reading precisely means.",
        },
        {
          text: "Revenue doubled between January and December",
          correct: false,
          feedback: "It grew from 124 to 204, about +65%; doubled would mean 248. Slopes are read with numbers, not adjectives.",
        },
        {
          text: "Revenue rose every single month of the year",
          correct: false,
          feedback: "March dips from 131 to 128 and July from 153 to 151; the trend is up, but 'every month' is false twice.",
        },
        {
          text: "December is highest because December has 31 days",
          correct: false,
          feedback: "204 is the measured value; the day count is an invented cause. The chart carries measurements, not calendar explanations.",
        },
      ],
      explanation:
        "Reading discipline from Part A, now applied to your own figures: name the measure (revenue, k$), the period (2024), and the size of the change (171 to 189 to 204). Precise readings survive questions; vibes do not.",
    },
    {
      kind: "exercise",
      id: "b-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "A teammate insists `plt.title(\"Sales\")` and `ax.set_title(\"Sales\")` are interchangeable, so the unpacking ritual is pointless. In one sentence each: what does the Figure own, what does the Axes own — and when does your teammate's version break?",
      hint: "Think about what happens the moment a figure contains more than one plot area.",
      options: [
        {
          text: "The Figure owns the canvas and the export (size, dpi, savefig); the Axes owns the marks, scales, ticks, labels and legend. The two title calls are equivalent only while exactly one Axes exists — with several, plt.title labels whichever Axes pyplot currently holds, not necessarily the one you meant",
          correct: true,
          feedback:
            "Correct — the difference is targeting, not capability. Explicit ax. calls say which plot area you mean, and that stops mattering exactly when you stop having one plot area.",
        },
        {
          text: "The Figure owns the data and the Axes owns the file output",
          correct: false,
          feedback: "Backwards: data marks live on the Axes, and savefig belongs to the Figure.",
        },
        {
          text: "They never break — pyplot always routes to the newest Axes and that is always the one you want",
          correct: false,
          feedback: "Newest is not always intended: with a 2x2 grid you routinely label a panel you drew three calls ago.",
        },
        {
          text: "plt.title is deprecated and raises an error in modern matplotlib",
          correct: false,
          feedback: "Both calls are live API. The lesson is about implicit versus explicit targets, not old versus new.",
        },
      ],
      explanation:
        "The state-machine interface is not wrong, it is implicit. Explicit ax. calls survive every refactoring — especially b-08's subplot grids, where pyplot's current-Axes pointer becomes a liability.",
    },
  ],
  terms: [
    {
      term: "Figure",
      definition: "The top-level canvas artist: owns figure size, dpi, background and all Axes placed on it. fig.savefig writes the whole Figure to a file.",
    },
    {
      term: "Axes",
      definition: "One plot area with its own x/y scales, marks, ticks, labels, legend and title. The target of ax.plot, ax.bar, ax.set_title and friends.",
    },
    {
      term: "Artist",
      definition: "Any node in matplotlib's scene graph — Figure, Axes, Axis, Line2D, Rectangle, text. Everything you see is an artist with properties you can set.",
    },
  ],
  takeaways: [
    "Every matplotlib script is four moves: make the Figure, get the Axes, draw marks on the Axes, then label and show or save.",
    "The Figure owns the canvas and the export; the Axes owns the marks, scales, ticks and labels. Name the layer and the API becomes a map.",
    "Prefer the explicit `fig, ax = plt.subplots()` spelling over pyplot's implicit current-Axes — it stops mattering exactly when you have more than one plot area.",
    "Call `fig.savefig` **before** `plt.show`: the file should exist before the screen takes over.",
  ],
  quiz: [
    {
      id: "b-01-q1",
      prompt: "What exactly does `fig, ax = plt.subplots()` hand you?",
      options: [
        {
          text: "A new Figure (the canvas) and one Axes (a plot area on it), as a pair",
          correct: true,
          feedback: "Correct — one line, two objects: the container and the plot area you will draw on.",
        },
        {
          text: "A file handle and a plotting function",
          correct: false,
          feedback: "Neither object is a handle; both are artists in a scene graph you configure and query.",
        },
        {
          text: "Two views of the same object",
          correct: false,
          feedback: "They are distinct artists with distinct jobs — one owns the canvas, the other the ink.",
        },
        {
          text: "A Figure with two Axes side by side",
          correct: false,
          feedback: "Two Axes is plt.subplots(1, 2); the bare call makes exactly one plot area.",
        },
      ],
      explanation:
        "The unpacking is the entry point to the whole object model: Figure for canvas concerns, Axes for everything the reader sees as 'the chart'.",
    },
    {
      id: "b-01-q2",
      prompt: "Where does the `Line2D` returned by `ax.plot(...)` live in the object tree?",
      options: [
        {
          text: "Inside the Axes, as one of its data artists",
          correct: true,
          feedback: "Correct — the Axes owns the mark, which is why ax.clear() removes it and ax.lines lists it.",
        },
        {
          text: "Directly on the Figure, beside the Axes",
          correct: false,
          feedback: "Marks never attach to the Figure; a Figure without Axes draws nothing of the data.",
        },
        {
          text: "Inside the Axis, next to the ticks",
          correct: false,
          feedback: "The Axis is a number line — ticks and labels only, no data ink.",
        },
        {
          text: "Outside the tree, referenced only by pyplot",
          correct: false,
          feedback: "pyplot holds no artists; it only forwards calls to the objects that do.",
        },
      ],
      explanation:
        "Data marks are children of the Axes. That single fact explains ax.legend() (it reads the Axes' own lines) and zorder (b-02), which compares artists within one Axes.",
    },
    {
      id: "b-01-q3",
      prompt: "Which call writes the whole canvas — marks, labels, margins — to a file?",
      options: [
        {
          text: "fig.savefig(\"chart.png\")",
          correct: true,
          feedback: "Correct — savefig is the Figure's export method; dpi and format are its arguments (b-12).",
        },
        {
          text: "ax.save(\"chart.png\")",
          correct: false,
          feedback: "No such method — the Axes has no file responsibilities; export belongs to the Figure.",
        },
        {
          text: "plt.export(\"chart.png\")",
          correct: false,
          feedback: "Not part of the API; you may be thinking of savefig, which exists on the Figure (and as a pyplot wrapper).",
        },
        {
          text: "plt.show(\"chart.png\")",
          correct: false,
          feedback: "show paints the screen and takes no filename; it writes no files.",
        },
      ],
      explanation:
        "Export is a Figure-level concern because the file must contain every Axes and margin — which is why the call hangs off fig, not ax.",
    },
  ],
};
