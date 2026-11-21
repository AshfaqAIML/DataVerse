/**
 * PART B · LESSON b-04 — "Histograms"
 *
 * ax.hist, the bins parameter (same data at 5 / 10 / 30 bins), range,
 * and density versus count. The 30 iris petal lengths are the star:
 * bimodal at every honest bin count, a single blob at a lazy one.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { IRIS_PETAL_LENGTH } from "../datasets";

export const LESSON_V_B_04: DataVizLesson = {
  slug: "b-04",
  title: "Histograms",
  minutes: 25,
  summary:
    "ax.hist turns a column of numbers into a shape — and the bins parameter quietly decides which shape. The same data at 5, 10 and 30 bins, plus range and the density scale.",
  tool: "matplotlib",
  objectives: [
    "Draw a histogram with ax.hist and describe its shape in shape vocabulary (modes, gaps, skew)",
    "Show the same data at several bin counts and say what changes and what survives",
    "Use range= to fix the binning window and density=True to switch to the density scale",
    "Explain why a bin count you did not check is a conclusion you did not test",
  ],
  why: "A histogram is the only chart in this part whose central parameter — the number of bins — is a judgment call you make before anything is drawn, and it silently decides what the reader sees: the same 30 flowers can look like one cluster at a lazy bin count and two species at a careful one. This lesson makes that choice visible on real numbers, and teaches the two honest defenses: try several bin counts and watch what survives, and know when the density scale serves better than raw counts.",
  blocks: [
    {
      kind: "text",
      text: "A histogram answers *how are the values distributed?* `ax.hist(values)` sorts the values into equal-width intervals — **bins** — and draws one bar per bin whose height is the count. Two things separate it from the bar chart of b-03: the x-axis is a **continuous numeric scale**, not a list of categories, and the bars touch, because the bins touch — there is no gap between 1.4 cm and 1.5 cm.",
    },
    {
      kind: "code",
      title: "The first look",
      language: "python",
      code: `import matplotlib.pyplot as plt

petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

fig, ax = plt.subplots(figsize=(7, 4.5))
ax.hist(petal_length, bins=10, edgecolor="white")
ax.set(title="Iris petal lengths", xlabel="petal length (cm)", ylabel="count")
plt.show()`,
      note: "edgecolor=white separates the bars visually while keeping them physically adjacent — pure cosmetics, no data meaning.",
      produces: "Renders the same histogram shown below — 30 flowers, 10 bins, counts on the y-axis.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Iris petal lengths, 10 bins",
        values: IRIS_PETAL_LENGTH,
        bins: 10,
        xLabel: "petal length (cm)",
      },
      why: "Read the shape: 20 flowers between 1.1 and 1.86 cm, five empty bins in the middle, 10 flowers between 3.86 and 4.9 cm. That empty lane is the finding — petal length alone separates the two species almost completely.",
    },
    {
      kind: "interpretation",
      id: "b-04-i1",
      chart: {
        type: "histogram",
        title: "Iris petal lengths, 10 bins",
        values: IRIS_PETAL_LENGTH,
        bins: 10,
        xLabel: "petal length (cm)",
      },
      prompt: "Describe this distribution precisely enough that someone who has not seen it could redraw it.",
      options: [
        {
          text: "Strongly bimodal: a 20-flower mass from 1.1 to 1.86 cm, then five empty bins, then a 10-flower mass from 3.86 to 4.9 cm",
          correct: true,
          feedback:
            "Correct — modes, location and the gap, all quantified. That empty middle (1.86 to 3.86 cm) is why the two species separate on this one measurement.",
        },
        {
          text: "Uniform across the 1 to 5 cm range",
          correct: false,
          feedback: "Half the range holds zero flowers — the five middle bins are empty, which is the opposite of uniform.",
        },
        {
          text: "Unimodal with a single peak near 1.5 cm",
          correct: false,
          feedback: "The left mass is the taller (20 flowers), but the right mass's 10 flowers are a second mode, not a tail.",
        },
        {
          text: "Symmetric around 3 cm",
          correct: false,
          feedback: "There is no ink at all near 3 cm; the center of the range is a gap, not a center.",
        },
      ],
      explanation:
        "Shape vocabulary — modes, gaps, skew — is what histograms are for. Here bimodality is the discovery: two species, two clusters, one measurement.",
    },
    { kind: "heading", text: "Bins are a choice the data did not make" },
    {
      kind: "text",
      text: "The bin count is a **free parameter**: nothing in the data picks it, and matplotlib's default (10) is a starting point, not a verdict. Too few bins and neighboring modes weld into one blob; too many and real structure shreds into sampling noise. The honest workflow is to try several counts and report what survives the sweep.",
    },
    {
      kind: "code",
      title: "The bin sweep",
      language: "python",
      code: `import matplotlib.pyplot as plt

petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

for nbins in (5, 10, 30):
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(petal_length, bins=nbins, edgecolor="white")
    ax.set_title(f"{nbins} bins")
    plt.show()`,
      note: "The loop is the discipline: a bin count you did not check is a conclusion you did not test.",
      produces:
        "Three figures in turn: at 5 bins the left cluster collapses into one bar of 20 and the counts read 20, 0, 0, 1, 9; at 10 the two clusters separate; at 30 the right cluster shreds into isolated singles.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Same 30 flowers, 5 bins",
        values: IRIS_PETAL_LENGTH,
        bins: 5,
        xLabel: "petal length (cm)",
        showValues: true,
        caption: "Counts: 20, 0, 0, 1, 9 — the gap survives, but the left cluster is now a single bar and its internal shape is gone.",
      },
      why: "At 5 bins the left cluster becomes one undifferentiated bar of 20 — still bimodal, but the shape within each mode has been thrown away.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Same 30 flowers, 30 bins",
        values: IRIS_PETAL_LENGTH,
        bins: 30,
        xLabel: "petal length (cm)",
        caption: "Counts per bin: 2, 1, 7, 8, 2, then fifteen empty bins, then 1, 0, 0, 0, 0, 4, 1, 2, 2 — the left mode keeps its peak; the right side reads as scattered singles.",
      },
      why: "At 30 bins the bars approach the raw data — each spike is nearly an individual value. More resolution is not more truth: with 30 values, 30 bins flatter the noise.",
    },
    {
      kind: "text",
      text: "Two more arguments control the frame. `range=(1, 5)` fixes where the binning starts and ends — useful when one stray value would otherwise stretch the axis and squeeze every real observation into two bins. And `density=True` rescales the y-axis: instead of counts, each bar's **area** becomes the fraction of the data in that bin, so the areas sum to 1. The shape is unchanged; only the axis's meaning moves.",
    },
    {
      kind: "code",
      title: "Fixing the window, changing the scale",
      language: "python",
      code: `import matplotlib.pyplot as plt

petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

fig, ax = plt.subplots(figsize=(7, 4.5))
ax.hist(petal_length, bins=10, range=(1, 5), density=True, edgecolor="white")
ax.set(title="Iris petal lengths, density scale",
       xlabel="petal length (cm)", ylabel="fraction per cm")
plt.show()`,
      note: "On the density scale, a bar's height is fraction-per-cm, so a wider bin naturally sits lower — area, not height, is comparable across histograms.",
      produces:
        "The same shape as the 10-bin count histogram above; the y-axis now reports density (each bar's area is that bin's fraction of the 30 flowers, and the areas sum to 1). Our engine renders the count version.",
    },
    {
      kind: "exercise",
      id: "b-04-e1",
      exerciseKind: "critique",
      prompt:
        "A report claims 'petal lengths form a single tight cluster around 2 cm' and shows a 4-bin histogram as evidence. Using this lesson's bins discipline, what is wrong with the claim and what would you check before believing it?",
      hint: "Re-draw the same numbers at more bin counts and see whether the single-cluster story survives.",
      options: [
        {
          text: "At 4 bins the two real clusters (20 flowers near 1.4 cm, 10 near 4.5 cm) can weld into one bridging bar; re-draw at 10 bins — if the bimodal split reappears, the single-cluster story was an artifact of the bin count",
          correct: true,
          feedback:
            "Correct — the sensitivity check is the whole defense. A claim about shape should survive more than one arbitrary choice of bin.",
        },
        {
          text: "Nothing is wrong — the claim matches the chart shown",
          correct: false,
          feedback: "A claim that exists at one bin count and dies at another was never a claim about the data.",
        },
        {
          text: "Histograms always lie about shape, so no check helps",
          correct: false,
          feedback: "The chart is honest at every bin count; the unexamined parameter is what misleads.",
        },
        {
          text: "Just report the mean instead — it summarizes shape safely",
          correct: false,
          feedback: "The mean of a bimodal sample lands in the empty middle and describes neither cluster.",
        },
      ],
      explanation:
        "Binwidth is a free parameter that can manufacture or erase apparent structure. The fix is never confidence — it is the sweep, and the humility to report what changes across it.",
    },
  ],
  terms: [
    {
      term: "bin",
      definition: "One equal-width interval of the x-axis; the histogram's bar counts the values falling inside it. Bin count is a free parameter you must choose and check.",
    },
    {
      term: "bimodal",
      definition: "Having two separated masses — two modes with a valley between. Often the signature of two populations mixed in one column (two iris species here).",
    },
    {
      term: "density scale",
      definition: "The density=True rescaling: bar areas become fractions of the data, summing to 1, so histograms of different sizes or bin widths become comparable.",
    },
  ],
  takeaways: [
    "`ax.hist` bins a numeric column into touching intervals and counts — the x-axis is continuous, unlike a bar chart's categories.",
    "The bin count is a free parameter: too few welds modes together, too many shreds them into noise.",
    "Try several bin counts before claiming a shape — a conclusion that survives the sweep is a conclusion about the data.",
    "`range=` fixes the binning window; `density=True` makes bar areas sum to 1 (fractions instead of counts).",
  ],
  quiz: [
    {
      id: "b-04-q1",
      prompt: "What separates a histogram from a bar chart?",
      options: [
        {
          text: "A histogram bins one continuous numeric variable into touching intervals; a bar chart shows one length per discrete category",
          correct: true,
          feedback: "Correct — continuous scale and touching bars versus category axis and spaced bars.",
        },
        {
          text: "Histograms use color; bar charts use length",
          correct: false,
          feedback: "Both encode with length; color is decoration in both.",
        },
        {
          text: "Nothing — they are two names for one chart",
          correct: false,
          feedback: "They answer different questions: distribution shape versus category comparison.",
        },
        {
          text: "Histograms must be vertical; bar charts can be horizontal",
          correct: false,
          feedback: "Orientation is available to both (orientation='horizontal' on hist); it is not the distinction.",
        },
      ],
      explanation:
        "The distinction is the x-variable's type: continuous (binned, touching bars) versus categorical (one bar per name). Confusing them is how 'average of a category' nonsense gets drawn.",
    },
    {
      id: "b-04-q2",
      prompt: "Your 30-value histogram looks like one clean cluster at 5 bins. What is the risk?",
      options: [
        {
          text: "Too few bins can weld two neighboring modes into one blob, hiding real structure",
          correct: true,
          feedback: "Coarse bins erase within-cluster shape first and the clusters themselves next — at 5 bins the petal gap barely survives as two empty middle bars, and one step coarser it disappears entirely.",
        },
        {
          text: "Too few bins always create fake modes",
          correct: false,
          feedback: "The opposite failure: coarse bins erase modes; fake modes come from too MANY bins.",
        },
        {
          text: "The bars will be too tall for the axis",
          correct: false,
          feedback: "Axis scaling handles any count; the risk is in what the reader believes about shape.",
        },
        {
          text: "Nothing — 5 is the matplotlib default and therefore correct",
          correct: false,
          feedback: "The default is 10, and no default is a verdict — the sweep is the defense.",
        },
      ],
      explanation:
        "Coarse bins smooth away structure. If a shape claim matters, it must survive several bin counts — that is the lesson's one discipline.",
    },
    {
      id: "b-04-q3",
      prompt: "What does `density=True` change about a histogram?",
      options: [
        {
          text: "The y-axis reports fraction-per-unit so that bar areas, not heights, sum to 1",
          correct: true,
          feedback: "Correct — same shape, new axis meaning: areas are now fractions and comparable across histograms.",
        },
        {
          text: "It switches the x-axis to density units",
          correct: false,
          feedback: "The x-axis keeps the data's units; only the y-axis is rescaled.",
        },
        {
          text: "It makes the bars translucent",
          correct: false,
          feedback: "That is alpha=, a styling argument with no statistical meaning.",
        },
        {
          text: "It converts counts to percentages per bin",
          correct: false,
          feedback: "Close but wrong: percent-per-bin normalizes heights (counts/n), while density normalizes AREAS — the difference matters when bin widths differ.",
        },
      ],
      explanation:
        "Density scale is about comparability: two histograms with different sample sizes or bin widths have the same total area (1) and can be laid honestly on one axis.",
    },
  ],
};
