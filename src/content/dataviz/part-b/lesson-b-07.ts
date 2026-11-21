/**
 * PART B · LESSON b-07 — "Box Plots"
 *
 * b-04 drew the SHAPE of one distribution; b-07 compares many
 * distributions at a glance — five numbers per group, stacked side by
 * side. All quartiles in this lesson are numpy-linear-interpolation
 * values (the convention matplotlib's boxplot uses), computed from the
 * course's shared satisfaction and temperature datasets.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { CITIES, DEPARTMENTS, SATISFACTION_BY_DEPT, TEMPS, months } from "../datasets";

const satisfactionBoxes = DEPARTMENTS.map((d) => {
  const v = SATISFACTION_BY_DEPT[d];
  const sorted = [...v].sort((a, b) => a - b);
  const at = (p: number) => {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
  };
  return { label: d, min: sorted[0], q1: at(0.25), median: at(0.5), q3: at(0.75), max: sorted[sorted.length - 1] };
});

const cityBoxes = CITIES.map((c) => {
  const sorted = [...TEMPS[c]].sort((a, b) => a - b);
  const at = (p: number) => {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
  };
  return { label: c, min: sorted[0], q1: at(0.25), median: at(0.5), q3: at(0.75), max: sorted[sorted.length - 1] };
});

export const LESSON_V_B_07: DataVizLesson = {
  slug: "b-07",
  title: "Box Plots",
  minutes: 25,
  summary:
    "ax.boxplot compresses each group to five numbers — min, quartiles, median, max — so many distributions can be compared at a glance; whisker fences, outlier points, and what the box hides.",
  tool: "matplotlib",
  objectives: [
    "Draw side-by-side boxes with ax.boxplot and read every part: box, median band, whiskers, outlier points",
    "State the whisker fence rule (1.5 × IQR) and predict which points will be plotted as outliers",
    "Choose between a histogram, a box plot, and a strip of boxes by the question being asked",
    "Add mean markers and explain why the bar-chart-of-means habit loses the news in the spread",
  ],
  why: "The histogram in b-04 answered 'what shape is this ONE distribution?'. The question that actually arrives at your desk is usually 'how do these FIVE groups compare?' — five departments, four cities, twelve branches. Drawing five histograms stacks shape after shape and asks the reader to align them by eye; a box plot compresses each group to the five-number summary and lines the summaries up on one shared scale, so the eye compares medians, spreads and outliers in a single pass. It is the chart for comparing distributions, and this lesson makes you fluent in both directions: producing it with ax.boxplot, and reading it fast enough to catch the group whose story is in its spread, not its middle.",
  blocks: [
    {
      kind: "text",
      text: "A **box plot** (box-and-whisker plot) is a distribution reduced to five numbers, drawn as a picture: two edges mark the quartiles, a band marks the median, and whiskers stretch to the bulk of the rest. One box summarizes one group; a column of boxes summarizes a comparison. Matplotlib's `ax.boxplot` takes a list of samples and draws one box per sample — the survey data below becomes five boxes in a single call.",
    },
    {
      kind: "code",
      title: "Five departments, five boxes, one call",
      language: "python",
      code: `import matplotlib.pyplot as plt

departments = ["Engineering", "Sales", "Support", "Design", "Ops"]
responses = [
    [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],   # Engineering
    [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],   # Sales
    [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],   # Support
    [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],   # Design
    [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],   # Ops
]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.boxplot(responses, tick_labels=departments)
ax.set(title="Satisfaction by department", ylabel="score (1-10)")

plt.show()`,
      note: "The order of the arguments is the order of the boxes: one list of samples in, one box per sample out. tick_labels names them on the x-axis (matplotlib ≥ 3.9; older code spells it labels=).",
      produces:
        "Renders the five boxes shown below — real quartiles of the course's survey data, computed with the same linear-interpolation rule numpy uses.",
    },
    {
      kind: "chart",
      chart: {
        type: "box",
        title: "Satisfaction by department",
        boxes: satisfactionBoxes,
        xLabel: "department",
        yLabel: "score (1-10)",
      },
      why: "Five distributions on one shared 1-10 scale — the whole point of the chart. Design sits visibly higher than Support; the boxes carry the comparison a table of twelve rows per department never would.",
    },
    {
      kind: "definition",
      term: "Box plot",
      informal:
        "A five-number summary drawn as a picture: the box spans the interquartile range (Q1 to Q3 — the middle 50% of the data), a band marks the median, and whiskers reach to the most extreme points still inside the fence.",
      why: "It trades the histogram's shape detail for comparability — exactly the trade you want when the groups, not the shape, are the question.",
    },
    {
      kind: "definition",
      term: "Whisker fence (1.5 × IQR rule)",
      informal:
        "Whiskers stop at the last data point inside Q1 − 1.5 × IQR and Q3 + 1.5 × IQR; anything beyond is drawn as a lone point — an outlier marked, not deleted.",
      why: "The fence is a convention, not a law of nature — but it is THE convention matplotlib, seaborn, and every statistics textbook share, so your boxes read the same everywhere.",
    },
    { kind: "heading", text: "Reading a box, top to bottom" },
    {
      kind: "text",
      text: "Read each box in three glances. **The band** is the median — the department's middle response. **The box height** is the IQR — how much the middle half disagrees; a tall box is a department of many opinions, a flat box a department of one. **The whiskers** reach for the tails, and lone points beyond them are flagged outliers. The median's position *inside* its own box is a free skew reading: a band hugging the bottom of the box means most of the spread is piled high. None of these readings survives being averaged into a bar — which is why the bar chart is the wrong sibling for this job.",
    },
    {
      kind: "code",
      title: "The same call on the temperature data, means shown",
      language: "python",
      code: `import matplotlib.pyplot as plt

cities = ["Lisbon", "Oslo", "Cairo", "Singapore"]
temps = [
    [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12],
    [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2],
    [19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20],
    [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.boxplot(temps, tick_labels=cities, showmeans=True,
           meanprops={"marker": "D", "markerfacecolor": "white",
                      "markeredgecolor": "#0d9488"})
ax.set(title="Monthly temperature by city", ylabel="°C")

plt.show()`,
      note: "showmeans adds a diamond at each mean — useful when the mean and median disagree, which is itself a skew signal. patch_artist=True unlocks facecolor styling per box.",
      produces:
        "Four climate summaries: Lisbon's long box is a real four-season year, Oslo's whiskers dip below zero, Cairo runs hot, and Singapore collapses to a line — twelve months inside two degrees.",
    },
    {
      kind: "chart",
      chart: {
        type: "box",
        title: "Monthly temperature by city",
        boxes: cityBoxes,
        xLabel: "city",
        yLabel: "°C",
      },
      why: "Singapore is the teaching case: IQR of exactly 1 °C (Q1 = Q3 = 28) against Lisbon's 8.75. Same chart, same scale, radically different spreads — the story a mean of 27.7 vs 17.8 would half-tell.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The bar-of-means habit",
      text: "The most common wrong chart in business reporting is five bars of five means. Means hide the spread, and the spread is often the news: a department averaging 6 out of twelve 1s and twelve 10s is not the same department as one of twelve 6s — the bars are identical. When the question is 'how do groups compare on a measurement', reach for boxes before bars.",
    },
    {
      kind: "table",
      title: "One distribution or many?",
      headers: ["Question", "Chart", "Why"],
      rows: [
        ["What shape is this one distribution?", "Histogram (b-04)", "Shape is the answer: modes, skew, gaps"],
        ["How do these groups compare?", "Box plot (this lesson)", "Five-number summaries, side by side on a shared scale"],
        ["Where does each individual value fall?", "Scatter / strip plot (b-05)", "No summarizing at all — every point visible"],
        ["Many groups AND their shapes?", "Small multiples of histograms (b-08)", "Shapes compared panel to panel, one per group"],
      ],
      caption: "The chart follows the question — the discipline of a-03, now with distributions.",
    },
    {
      kind: "interpretation",
      id: "b-07-i1",
      chart: {
        type: "box",
        title: "Satisfaction by department",
        boxes: satisfactionBoxes,
        xLabel: "department",
        yLabel: "score (1-10)",
      },
      prompt: "Read the boxes precisely: which statement about Design and Support is exactly true?",
      options: [
        {
          text: "Design's lowest whisker end (7) is above Support's highest (6) — every Design response tops every Support response",
          correct: true,
          feedback:
            "Correct — a complete separation of the two distributions, which is the strongest comparison a box chart can make. Medians 8 vs 5 make the same point in the middle.",
        },
        {
          text: "Design and Support have the same median, so the departments are equally satisfied",
          correct: false,
          feedback: "The medians are 8 and 5 — three points apart on a 10-point scale. The boxes do not overlap at all.",
        },
        {
          text: "Support's tall box means it has more respondents than the others",
          correct: false,
          feedback: "Box height is spread (IQR), not sample size — every department here has exactly 12 responses. Width would carry n, and by default it does not.",
        },
        {
          text: "The dots beyond the whiskers mark data-entry errors",
          correct: false,
          feedback: "There are no outlier points in this data — and where they appear, they mark unusual values, not proven errors. Deleting them needs evidence beyond distance.",
        },
      ],
      explanation:
        "Full separation — one group's minimum above another's maximum — is a finding you can state without any further test. The boxes make it visible in one glance; the table of 60 raw responses makes you work for it.",
    },
    {
      kind: "exercise",
      id: "b-07-e1",
      exerciseKind: "choose-chart",
      prompt:
        "Your team measured page load times for five page templates, 8 measurements each (n = 8 per group), and the lead asks 'which templates are slow, and how consistent are they?'. A teammate proposes five bars of the five mean load times. Choose the better chart and name the condition under which the teammate's bars would nevertheless be acceptable.",
      hint: "Two things are being asked for: level AND consistency. Which chart carries both? And what does n = 8 do to the histogram alternative?",
      options: [
        {
          text: "Five box plots: medians answer 'which are slow', box heights and whiskers answer 'how consistent' — and at n = 8 per group, histograms per template are too sparse to read, so boxes win. Bars of means become acceptable only when the audience needs one number per group and the spreads are known to be tight",
          correct: true,
          feedback:
            "Correct — the question literally has two clauses, and the box is the chart that answers both at once. The bar answers only the first, and hides the second's news.",
        },
        {
          text: "The bar chart of means, because executives prefer bars",
          correct: false,
          feedback: "Audience format is a styling decision (b-10); it cannot upgrade a chart that drops half the question.",
        },
        {
          text: "One histogram of all 40 measurements pooled together",
          correct: false,
          feedback: "Pooling erases the group variable entirely — the comparison the lead asked for is no longer on the chart.",
        },
        {
          text: "A pie chart of the five means",
          correct: false,
          feedback: "Slices share a whole — five load times are not parts of one total, and b-06 already tightened the pie's honest range.",
        },
      ],
      explanation:
        "'Which are slow and how consistent' is a two-part question about groups: boxes by template. The bar of means stays acceptable exactly when the second half of the question is already answered (uniform variance) or out of scope.",
    },
  ],
  terms: [
    {
      term: "Five-number summary",
      definition: "Minimum, first quartile (Q1), median, third quartile (Q3), maximum — the skeleton a box plot draws. Robust to outliers in a way the mean and standard deviation are not.",
    },
    {
      term: "Interquartile range (IQR)",
      definition: "Q3 − Q1: the width of the box, covering the middle 50% of the data. Also the yardstick for the whisker fence at 1.5 × IQR beyond the quartiles.",
    },
    {
      term: "Whiskers",
      definition: "The lines stretching from each box edge to the most extreme data point still inside the 1.5 × IQR fence. Points beyond the fence are drawn individually as outliers.",
    },
  ],
  takeaways: [
    "A box plot is a five-number summary drawn as a picture; a column of boxes is many distributions compared on one shared scale.",
    "Box = middle 50% (IQR), band = median, whiskers = the bulk of the tails, lone points = beyond the 1.5 × IQR fence.",
    "Reach for boxes when the question compares groups on a measurement; reach for a histogram when the shape of one distribution is itself the question.",
    "Means hide the spread, and the spread is often the news — showmeans diamonds are a feature, bars of means are usually a habit.",
  ],
  quiz: [
    {
      id: "b-07-q1",
      prompt: "By matplotlib's convention, where does a whisker STOP?",
      options: [
        {
          text: "At the most extreme data point still within 1.5 × IQR of its box edge; anything further is drawn as a separate outlier point",
          correct: true,
          feedback: "Correct — the fence at Q1 − 1.5 × IQR and Q3 + 1.5 × IQR; the whisker snaps to the last real point inside it.",
        },
        {
          text: "Always at the minimum and maximum of the data",
          correct: false,
          feedback: "That is the whisker style some tools offer ('range'), but matplotlib's default fences at 1.5 × IQR and plots the rest as points.",
        },
        {
          text: "At one standard deviation from the mean",
          correct: false,
          feedback: "Boxes are built from quartiles, never from means or standard deviations — that robustness is the point of the chart.",
        },
        {
          text: "At the 5th and 95th percentiles",
          correct: false,
          feedback: "Percentile whiskers exist as an option (whis=(5, 95)), but the default fence is the 1.5 × IQR rule.",
        },
      ],
      explanation:
        "The 1.5 × IQR fence is the shared convention of matplotlib, seaborn and the textbooks — know it, and you can read any box plot's lone points as 'beyond the fence', not 'errors'.",
    },
    {
      id: "b-07-q2",
      prompt: "A box's band sits near the BOTTOM of its own box, with a long whisker above. The distribution is:",
      options: [
        {
          text: "Right-skewed: the middle value is low, and the upper half spreads much further",
          correct: true,
          feedback: "Correct — median near Q1 with a long upper tail is the signature of positive skew (salaries, page load times, city sizes).",
        },
        {
          text: "Left-skewed, because the band is low on the chart",
          correct: false,
          feedback: "Low on the chart means a low VALUE; skew is about position inside the spread. Band near the box bottom = the pile-up is low, the tail runs high.",
        },
        {
          text: "Symmetric, because the band is inside the box",
          correct: false,
          feedback: "The band is always inside the box — the reading is WHERE: centred means symmetric, pinned to an edge means skew.",
        },
        {
          text: "Impossible — the median is always at the box's midpoint",
          correct: false,
          feedback: "The median bisects the DATA, not the IQR: in skewed distributions the band rides one wall of its own box.",
        },
      ],
      explanation:
        "Median position inside the box is a free skew reading — one more thing the five-number summary carries that a mean bar silently drops.",
    },
    {
      id: "b-07-q3",
      prompt: "In ax.boxplot(responses, tick_labels=departments), what does the SECOND box from the left summarize?",
      options: [
        {
          text: "responses[1] — the second sample in the list, named by departments[1]",
          correct: true,
          feedback: "Correct — order in, order out: the i-th box is the i-th sample. The tick_labels list only names the axis; it never reorders data.",
        },
        {
          text: "The second-largest sample, because boxes are sorted by default",
          correct: false,
          feedback: "Nothing is sorted by default — the position is argument order. Sorting groups by median is your call (and often a good one).",
        },
        {
          text: "All samples pooled together",
          correct: false,
          feedback: "Pooling is what happens when you pass ONE flattened list; one box per sample is what the list-of-lists gives.",
        },
        {
          text: "Whichever sample has the largest IQR",
          correct: false,
          feedback: "IQR affects box HEIGHT, never box position — position is purely argument order.",
        },
      ],
      explanation:
        "The box plot is positional: sample order in, box order out. Sorting the samples by median before the call is how you add a reading order — the a-07 sorting discipline, applied to boxes.",
    },
  ],
};
