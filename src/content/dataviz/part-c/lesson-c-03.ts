/**
 * PART C · LESSON c-03 — "Categorical Plots"
 *
 * The catplot kind ladder — box, violin, strip, swarm, bar with error
 * bars, showmeans — demonstrated on the survey-by-department
 * comparison: five departments, twelve responses each.
 */
import type { BoxStat, DataVizLesson } from "@/lib/dataviz/types";
import { DEPARTMENTS, SATISFACTION_BY_DEPT } from "../datasets";

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function boxOf(label: string, values: number[]): BoxStat {
  const s = [...values].sort((a, b) => a - b);
  const q1 = quantile(s, 0.25);
  const med = quantile(s, 0.5);
  const q3 = quantile(s, 0.75);
  const iqr = q3 - q1;
  const inliers = s.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
  const outliers = s.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
  return {
    label,
    min: Math.min(...inliers),
    q1,
    median: med,
    q3,
    max: Math.max(...inliers),
    outliers,
  };
}

const deptBoxes = DEPARTMENTS.map((d) => boxOf(d, SATISFACTION_BY_DEPT[d]));
const deptMeans = DEPARTMENTS.map((d) => {
  const a = SATISFACTION_BY_DEPT[d];
  return Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 100) / 100;
});
const design = SATISFACTION_BY_DEPT["Design"];
const support = SATISFACTION_BY_DEPT["Support"];

export const LESSON_V_C_03: DataVizLesson = {
  slug: "c-03",
  title: "Categorical Plots",
  minutes: 25,
  summary:
    "One numeric column split by one categorical column — seaborn's catplot dispatches box, violin, strip, swarm and bar views over the same long DataFrame. The survey-by-department comparison runs through the whole lesson.",
  tool: "seaborn",
  objectives: [
    "Draw a box-per-group comparison with sns.catplot(kind=\"box\") and mark the means with showmeans=True",
    "Read a box plot's five-number summary and compare groups by box overlap",
    "Explain what a seaborn bar's whisker encodes: a 95% bootstrap confidence interval of the mean",
    "Choose among strip, swarm, box, violin and bar for a given comparison question",
  ],
  why: "The most common question in applied data work is a comparison: do these groups differ? 'Support seems less happy than Design' is a hypothesis; a categorical plot is how you look at the evidence before claiming it. Seaborn's catplot family gives you five lenses over the SAME long DataFrame — every response as a dot, quartiles as boxes, densities as violins, means as bars — and each lens answers a slightly different question. Choosing the lens consciously is the skill: a bar of means can make two very different departments look identical; a box cannot.",
  blocks: [
    {
      kind: "text",
      text: "The running data: **60 employee survey responses** — twelve per department, scored 1-10. The question is a comparison: *which departments sit where, and how tightly?* The DataFrame is long-form (one row per response, the shape c-01 taught), and `sns.catplot` is the dispatcher: same call, different `kind=`, different lens.",
    },
    {
      kind: "code",
      title: "The box comparison, with means marked",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

scores = {
    "Engineering": [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
    "Sales":       [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
    "Support":     [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
    "Design":      [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
    "Ops":         [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
}
survey = pd.DataFrame(
    [(dept, s) for dept, ss in scores.items() for s in ss],
    columns=["department", "satisfaction"],
)   # 60 rows

sns.catplot(
    data=survey,
    x="department", y="satisfaction",
    kind="box", showmeans=True,
    height=5, aspect=1.5,
)`,
      note: "showmeans=True adds a marker for each group's mean — box for the quartiles, dot for the mean, and you can see when they disagree.",
      produces:
        "Five box-and-whisker summaries side by side, each with a mean marker: Design's box sits highest (median 8), Support's lowest (median 5), and the two do not overlap at all.",
    },
    {
      kind: "chart",
      chart: {
        type: "box",
        title: "Satisfaction by department",
        boxes: deptBoxes,
        xLabel: "department",
        yLabel: "satisfaction (1-10)",
      },
      why: "Compare by overlap: Design's whole box (7.75 to 9) floats above every other department's, while Support's (4 to 5.25) sits below everyone's. The box shows the middle half of responses; whiskers reach the rest; no outliers here because no response sits beyond 1.5 IQR.",
    },
    { kind: "heading", text: "The kind= ladder: five lenses on one question" },
    {
      kind: "text",
      text: "The `kind=` parameter is the whole family. **strip** and **swarm** draw every response as a dot (swarm packs them without overlap — readable up to roughly a hundred rows per group). **box** draws the five-number summary. **violin** draws a density estimate per group — the shape of the responses, not just their quartiles. **bar** draws the mean with a whisker. One dispatcher, five lenses, one long DataFrame.",
    },
    {
      kind: "code",
      title: "Every response, visible",
      language: "python",
      code: `# The 60 dots behind the boxes above
sns.catplot(data=survey, x="department", y="satisfaction", kind="swarm")`,
      note: "With twelve responses per group the swarm is clean; past a few hundred dots per group, graduate to box or violin. The box chart above carries the same 60 rows as quartiles.",
      produces:
        "Every one of the 60 responses as a dot, packed tightly within its department — Design's cluster rides high (7-9), Support's hugs the floor (3-6).",
    },
    {
      kind: "table",
      title: "The kind ladder",
      headers: ["kind=", "What it draws", "The question it answers"],
      rows: [
        ["\"strip\"", "one dot per row, jittered", "where does each individual response fall?"],
        ["\"swarm\"", "dots packed without overlapping", "the same, readable to ~100 rows per group"],
        ["\"box\"", "quartiles, whiskers, outlier dots", "where are the median and the middle half?"],
        ["\"violin\"", "a mirrored density per group", "what is the SHAPE of each group?"],
        ["\"bar\"", "mean + 95% CI whisker", "how do the AVERAGES compare, and how certain are they?"],
      ],
      caption:
        "All five consume the same long DataFrame; choosing kind= is choosing the question. countplot (a sixth sibling) tallies rows per category when there is no numeric column at all.",
    },
    {
      kind: "code",
      title: "The bar of means — with the whisker explained",
      language: "python",
      code: `sns.catplot(data=survey, x="department", y="satisfaction", kind="bar")`,
      note: "Each whisker is a 95% bootstrap confidence interval for that department's MEAN — resampling the twelve responses many times to see how much the average itself wobbles.",
      produces:
        "Five bars of department means (Design 8.08 highest, Support 4.83 lowest), each crowned with a thin CI whisker expressing the uncertainty of that mean.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Mean satisfaction by department",
        categories: DEPARTMENTS,
        series: [{ name: "mean satisfaction", values: deptMeans }],
        xLabel: "department",
        yLabel: "mean satisfaction (1-10)",
        showValues: true,
        showLegend: false,
        palette: "oranges",
      },
      why: "Our engine draws the means (7.33, 5.92, 4.83, 8.08, 6.00) without seaborn's whiskers — imagine a thin interval over each bar. The ordering matches the box medians here, but notice what the bar CANNOT show: Engineering's mean 7.33 hides that its responses run 5-9, Sales' 5.92 hides a 4-8 spread. Shape is the box's job.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The bar's blind spot",
      text: "A bar of means compresses each group to one number plus an interval. Sales (mean 5.92) and Ops (6.00) would draw nearly twin bars — yet Sales responses span 4 to 8 while Ops spans 5 to 7. Same average, different company. When the SHAPE of each group could matter, the box or the violin says what the bar cannot.",
    },
    {
      kind: "interpretation",
      id: "c-03-i1",
      chart: {
        type: "box",
        title: "Satisfaction by department",
        boxes: deptBoxes,
        xLabel: "department",
        yLabel: "satisfaction (1-10)",
      },
      prompt: "Which claim about departments does this box comparison support exactly?",
      options: [
        {
          text: "Design and Support are completely separated: every Design response (lowest 7) is at or above every Support response (highest 6), with medians 8 vs 5",
          correct: true,
          feedback: `Correct — the strongest reading the encoding supports: ${Math.min(...design)} is Design's floor, ${Math.max(...support)} is Support's ceiling, and the boxes never touch. Complete separation, stated with numbers.`,
        },
        {
          text: "Design employees are naturally happier people",
          correct: false,
          feedback: "The chart measures satisfaction scores in one survey — 'naturally happier people' is a causal personality claim the encoding cannot carry.",
        },
        {
          text: "Engineering and Design are identical departments",
          correct: false,
          feedback: "Their boxes overlap (both reach 9), but Engineering's median is 7.5 against Design's 8, and Engineering's whisker dips to 5 — overlapping is not identical.",
        },
        {
          text: "The mean of each department equals its median",
          correct: false,
          feedback: "Not even Engineering: mean 7.33 against median 7.5 — the low 5 pulls the mean below the middle. That is exactly why showmeans=True is worth typing.",
        },
      ],
      explanation:
        "Box comparisons are read by overlap: complete separation (Design vs Support) is a strong claim; partial overlap (Engineering vs Design) is a weaker one. And means vs medians are different statistics — the showmeans marker exists to keep them honest.",
    },
    {
      kind: "exercise",
      id: "c-03-e1",
      exerciseKind: "choose-chart",
      prompt:
        "A manager wants to see all twelve satisfaction responses per department at once — no summarising, every voice visible — in a single chart that stays readable. Which kind= do you reach for?",
      options: [
        {
          text: "kind=\"swarm\" — one dot per response, packed without overlap",
          correct: true,
          feedback: "Correct — at twelve rows per group the swarm is exactly in its sweet spot: every response visible, no overplotting.",
        },
        {
          text: "kind=\"bar\" — the mean per department",
          correct: false,
          feedback: "The bar summarises the twelve responses into one mean — the manager asked for every voice, not the average voice.",
        },
        {
          text: "kind=\"box\" — quartiles per department",
          correct: false,
          feedback: "Boxes summarise too: five numbers per group. Close, but 'no summarising' points one rung up the ladder.",
        },
        {
          text: "A pie chart of department counts",
          correct: false,
          feedback: "There is nothing part-to-whole here — the question is a numeric column split by category.",
        },
      ],
      explanation:
        "The kind ladder is a summarising ladder: swarm/strip (every row) at the bottom, box/violin (distributions) in the middle, bar (one statistic) at the top. Match the rung to how much detail the question needs.",
    },
    {
      kind: "exercise",
      id: "c-03-e2",
      exerciseKind: "critique",
      prompt:
        "A dashboard shows satisfaction ONLY as bars of department means. The CEO glances at Sales (5.92) and Ops (6.00), declares them 'basically the same, no action needed', and moves on. What has the bar chart hidden from the CEO?",
      options: [
        {
          text: "The shape: Sales responses span 4 to 8 (the widest spread of any department), while Ops sits tightly at 5 to 7 — same mean, very different reality",
          correct: true,
          feedback: "Correct — Sales contains both a 4 and an 8; Ops never leaves 5-7. Twin bars, untwin distributions. The mean is the same; the story is not.",
        },
        {
          text: "Nothing — the bars are accurate and the conclusion is sound",
          correct: false,
          feedback: "The bars ARE accurate — means 5.92 and 6.00 are the means. But 'accurate' and 'complete' are different standards, and the shapes differ.",
        },
        {
          text: "The chart hid the department sizes",
          correct: false,
          feedback: "Every department has twelve responses here — sizes are equal. The hidden information is the spread, not the count.",
        },
        {
          text: "The CEO should have looked at the whiskers instead",
          correct: false,
          feedback: "The whiskers express uncertainty in the MEAN, not the spread of responses — they cannot rescue a shape question either.",
        },
      ],
      explanation:
        "Means compress; boxes reveal. When two groups match on the mean, the next question is whether they match on shape — and that question needs a different lens (box, violin, or swarm), not a longer stare at the bar.",
    },
  ],
  terms: [
    {
      term: "box plot",
      definition:
        "A five-number summary per group: median (the line), interquartile range (the box), whiskers to the most extreme values within 1.5 IQR, and outlier dots beyond.",
    },
    {
      term: "showmeans",
      definition:
        "A box-plot option that marks each group's mean alongside the median — revealing skew when the two markers disagree.",
    },
    {
      term: "bootstrap confidence interval",
      definition:
        "An uncertainty range built by resampling the observed data with replacement many times. Seaborn's default bar whisker is a 95% CI for the mean.",
    },
    {
      term: "swarm plot",
      definition:
        "Every observation as a dot, algorithmically packed so no dots overlap — the un-summarised sibling of the box plot, readable to roughly a hundred rows per group.",
    },
  ],
  takeaways: [
    "catplot is one interface over five lenses: strip/swarm (rows), box (quartiles), violin (shape), bar (mean + CI).",
    "Compare groups by box overlap: complete separation (Design vs Support, 7 vs 6 at the boundary) licenses strong claims; partial overlap does not.",
    "A seaborn bar carries a 95% bootstrap CI whisker for the mean — uncertainty about the average, not the spread of responses.",
    "Means alone can make different-shaped groups look identical: Sales (4-8) and Ops (5-7) are near-twins as bars, nothing alike as boxes.",
  ],
  quiz: [
    {
      id: "c-03-q1",
      prompt: "Which catplot kind shows the five-number summary of each group?",
      options: [
        { text: "kind=\"box\" — median, quartiles, whiskers and outlier dots", correct: true, feedback: "Correct — the box IS the five-number summary, drawn." },
        { text: "kind=\"bar\" — mean with a confidence whisker", correct: false, feedback: "The bar compresses further: one statistic plus an interval, no quartiles." },
        { text: "kind=\"swarm\" — every response as a dot", correct: false, feedback: "The swarm shows the raw rows; the summary is yours to eyeball." },
        { text: "kind=\"violin\" — a density estimate per group", correct: false, feedback: "The violin shows shape smoothly; the five numbers are not marked." },
      ],
      explanation:
        "Each kind sits at a different summarising level. When the question names medians or quartiles, kind=\"box\" is the direct answer.",
    },
    {
      id: "c-03-q2",
      prompt: "In sns.catplot(kind=\"bar\"), what does the thin whisker on top of each bar encode?",
      options: [
        { text: "A 95% bootstrap confidence interval for that group's mean", correct: true, feedback: "Correct — resampled uncertainty of the average itself." },
        { text: "The minimum and maximum response in the group", correct: false, feedback: "That is the whisker's job in a BOX plot; the bar's whisker is about the mean's stability." },
        { text: "The standard deviation of the responses", correct: false, feedback: "sd is available (errorbar=\"sd\") but it is not the default — the default is a CI for the mean." },
        { text: "The number of responses behind the bar", correct: false, feedback: "Sample size is not drawn — though a shaky-looking CI usually hints at a small one." },
      ],
      explanation:
        "The default whisker answers 'how sure are we about this mean?' — a bootstrap CI. It says nothing about the spread of individual responses, which is the box's department.",
    },
    {
      id: "c-03-q3",
      prompt: "What does showmeans=True add to a box plot of satisfaction by department?",
      options: [
        { text: "A marker for each group's mean, so mean and median can be compared directly", correct: true, feedback: "Correct — when the mean marker drifts from the median line, the distribution is skewed." },
        { text: "It replaces the median line with the mean", correct: false, feedback: "The median line stays; the mean is ADDED as a separate marker." },
        { text: "It annotates each box with its sample size", correct: false, feedback: "Counts are not what showmeans draws — it is a position marker for the average." },
        { text: "It sorts the boxes by their means", correct: false, feedback: "Ordering is the order= parameter's job; showmeans draws, it does not sort." },
      ],
      explanation:
        "Engineering showed it in this lesson: mean 7.33 against median 7.5, because a single 5 tugs the average down. Two markers make that disagreement visible without any arithmetic.",
    },
  ],
};
