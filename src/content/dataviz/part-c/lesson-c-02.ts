/**
 * PART C · LESSON c-02 — "Distribution Plots"
 *
 * histplot with kde=True, kdeplot, ecdfplot — and what an ECDF says
 * that a histogram hides. The bin-count decision returns, now as an
 * honest parameter you own.
 */
import type { BoxStat, DataVizLesson } from "@/lib/dataviz/types";
import { IRIS_SEPAL_LENGTH, IRIS_SPECIES } from "../datasets";

const species = [...new Set(IRIS_SPECIES)]; // ["setosa", "versicolor"]

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

const sepalBySpecies = species.map((sp) =>
  boxOf(sp, IRIS_SEPAL_LENGTH.filter((_, i) => IRIS_SPECIES[i] === sp)),
);

const sortedSepal = [...IRIS_SEPAL_LENGTH].sort((a, b) => a - b);
const ecdfPoints = sortedSepal.map((v, i) => ({ x: v, y: (i + 1) / sortedSepal.length }));
const pctAt5 = Math.round((sortedSepal.filter((v) => v <= 5.0).length / sortedSepal.length) * 100);
const pctAt6 = Math.round((sortedSepal.filter((v) => v <= 6.0).length / sortedSepal.length) * 100);
const medianSepal = quantile(sortedSepal, 0.5);

export const LESSON_V_C_02: DataVizLesson = {
  slug: "c-02",
  title: "Distribution Plots",
  minutes: 25,
  summary:
    "The three tools seaborn gives one numeric column: histplot (counts with a KDE overlay), kdeplot (the smooth reading), ecdfplot (every percentile, no bins). Bin width returns as a decision you own — and the ECDF shows what histograms hide.",
  tool: "seaborn",
  objectives: [
    "Draw a histogram with sns.histplot and overlay a KDE curve with kde=True",
    "Predict how bin count changes the story a histogram tells",
    "Read a KDE honestly: a smoothed estimate, not more data",
    "Read an ECDF directly: 'what fraction of rows fall at or below x'",
  ],
  why: "Before you compare groups or fit lines, you need to know what one column looks like: where it piles up, whether it has one peak or two, where the thin tails run. Averages hide all of that — a distribution shows it. But the standard histogram answers those questions through a lens YOU chose (the bins), and different lenses tell different stories. Seaborn gives you three progressively more honest instruments: the histogram (with its bins), the KDE (a smooth reading of the same shape), and the ECDF, which hides nothing at all — every data point is visible as a step, and percentiles can be read straight off the curve.",
  blocks: [
    {
      kind: "text",
      text: "Here is the running example for this lesson: **sepal length** for 30 iris flowers. Not the average sepal length, not the maximum — all 30 values, because the first question worth asking of a numeric column is *what shape is it?* One mound or two? Tight or spread out? Thin tails or fat ones? Seaborn's distribution family exists to answer exactly that, three ways.",
    },
    {
      kind: "code",
      title: "histplot — counts, with the smooth overlay",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

iris = pd.DataFrame({
    "sepal_length": [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                     5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                     6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4],
    "species": ["setosa"] * 20 + ["versicolor"] * 10,
})

sns.histplot(data=iris, x="sepal_length", kde=True)`,
      note: "kde=True lays a kernel density estimate over the bars — the same data, read smoothly. The bins are seaborn's default choice here.",
      produces:
        "A histogram of the 30 sepal lengths with a KDE curve on top: a tall mound of flowers around 4.3-5.1 cm and a thin tail running out to 7.6 cm.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Sepal length, 30 iris flowers",
        values: IRIS_SEPAL_LENGTH,
        bins: 8,
        xLabel: "sepal length (cm)",
        yLabel: "count",
      },
      why: "Look at the shape before any name for it: 10 of 30 flowers sit in the 4.7-5.1 bar alone, and only two flowers push past 7.0 (7.1 and 7.6). That is not one symmetric bell — there is a main mound and a stretched upper tail, which is a hint worth chasing (two species, as it turns out).",
    },
    {
      kind: "code",
      title: "bins again — the same data, coarser",
      language: "python",
      code: `# The bin count is a decision, not a fact about the data
sns.histplot(data=iris, x="sepal_length", bins=4, kde=True)`,
      note: "Four wide bins instead of eight narrow ones — watch what happens to the story.",
      produces:
        "The same 30 flowers in four wide bars: the upper tail is absorbed into the shoulder of one big skewed pile, and 'two mounds' quietly becomes 'one lopsided mound'.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "Same data, bins=4",
        values: IRIS_SEPAL_LENGTH,
        bins: 4,
        xLabel: "sepal length (cm)",
        yLabel: "count",
      },
      why: "Same 30 numbers, different lens: the first bar now holds 15 of 30 flowers, and the tallest-bar-to-thin-tail contrast replaces the two-mound reading. Neither chart lies — but they emphasise different truths, and you own which one the reader sees.",
    },
    {
      kind: "heading",
      text: "The KDE: a smooth reading of the shape",
    },
    {
      kind: "code",
      title: "kdeplot — split by species, the bimodality explained",
      language: "python",
      code: `# The pooled shape above was two species wearing one coat
sns.kdeplot(data=iris, x="sepal_length", hue="species", fill=True)`,
      note: "hue= splits the density by category: two filled curves instead of one. bw_adjust= widens or tightens the smoothing if you need to.",
      produces:
        "Two filled density curves: setosa's hump centred near 5 cm, versicolor's hump near 6-6.5 cm — the bimodal hint from the first histogram, now explained.",
    },
    {
      kind: "chart",
      chart: {
        type: "box",
        title: "Sepal length by species (the same split, as quartiles)",
        boxes: sepalBySpecies,
        xLabel: "species",
        yLabel: "sepal length (cm)",
      },
      why: "Our engine cannot draw smooth densities, so here is the same species split as box plots: setosa low and tight (median 5.0), versicolor higher (median 6.3) — the KDE's two humps, restated as two boxes. Notice versicolor's dots: with only 10 flowers, 4.9 and 7.6 fall outside the whiskers and are flagged as outliers.",
    },
    {
      kind: "heading",
      text: "The ECDF: every percentile, no bins",
    },
    {
      kind: "code",
      title: "ecdfplot — the honest instrument",
      language: "python",
      code: `sns.ecdfplot(data=iris, x="sepal_length")`,
      note: "No bins, no smoothing, no choices: at each x, the curve height is the fraction of flowers at or below x.",
      produces:
        "A stepped curve rising from 0 to 1 — steep where flowers pile up (around 5 cm), flat where none exist (the 5.5-6.5 stretch is sparse), reaching 1.0 at 7.6 cm.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "The ECDF, one dot per flower",
        points: ecdfPoints,
        xLabel: "sepal length (cm)",
        yLabel: "fraction of flowers <= x",
        caption:
          "Our engine has no stepped line, so each dot is one flower at (its sepal length, the fraction of flowers at or below that length). seaborn's ecdfplot connects these dots with steps.",
      },
      why: "Read up-and-across: at x = 5.0 the curve has climbed to 0.40 — 40% of flowers have sepals of 5.0 cm or shorter. The median is where the curve crosses 0.50: about 5.25 cm. And the flat stretch between 5.5 and 6.0 is honest emptiness — almost no flowers there.",
    },
    {
      kind: "interpretation",
      id: "c-02-i1",
      chart: {
        type: "scatter",
        title: "The ECDF, one dot per flower",
        points: ecdfPoints,
        xLabel: "sepal length (cm)",
        yLabel: "fraction of flowers <= x",
      },
      prompt: "Which statement about sepal length does this ECDF support exactly?",
      options: [
        {
          text: `About ${pctAt5}% of flowers have sepals of 5.0 cm or shorter, and the curve reaches 1.0 at 7.6 cm`,
          correct: true,
          feedback: `Correct — read up from 5.0: the curve stands at 0.40 (12 of 30 flowers). Past the tallest flower, 7.6 cm, it is flat at 1.0: everyone is accounted for.`,
        },
        {
          text: `Half of the flowers have sepals longer than 6.0 cm`,
          correct: false,
          feedback: `At 6.0 cm the curve already stands at 0.80 (${pctAt6}%) — only 20% of flowers are longer than 6.0 cm, not half.`,
        },
        {
          text: "7.6 cm is the most common sepal length",
          correct: false,
          feedback: "7.6 cm is the MAXIMUM — the point where the curve finishes climbing. The steep climb near 5.0 cm is where the crowd is.",
        },
        {
          text: "The ECDF bins the flowers into five groups",
          correct: false,
          feedback: "No bins — that is the ECDF's whole character. Each dot is one flower; the curve is pure counting order.",
        },
      ],
      explanation:
        "ECDF reading is two moves: pick an x, read the height (fraction at or below); or pick a fraction, read the x (a percentile). The median is the 0.50 crossing — here about 5.25 cm — and gaps in the data show as flat stretches.",
    },
    {
      kind: "exercise",
      id: "c-02-e1",
      exerciseKind: "choose-chart",
      prompt:
        "You must report the exact 90th percentile of website load times to an SLA auditor, and defend the number without any parameter choices. Histogram, KDE, or ECDF — and why?",
      options: [
        {
          text: "The ECDF — read across from 0.90 on the y-axis; no bins, no bandwidth, nothing to argue about",
          correct: true,
          feedback: "Correct — the ECDF is parameter-free: the 90th percentile is a point on the curve, not an artifact of a bin choice an auditor could challenge.",
        },
        {
          text: "The histogram — count the bars until you reach 90%",
          correct: false,
          feedback: "The count depends on your bin width: change the bins, change the percentile reading. Auditors love finding that.",
        },
        {
          text: "The KDE — the smooth curve makes percentiles obvious",
          correct: false,
          feedback: "The KDE adds a bandwidth parameter you would have to defend — smoothness is a choice, and percentiles do not need one.",
        },
        {
          text: "Any of them — they all show the same information",
          correct: false,
          feedback: "All three show the same DATA, but with different mediation: bins, bandwidth, or none. For defensible percentiles, choose the unmediated one.",
        },
      ],
      explanation:
        "When the number must survive scrutiny, prefer the display with no tuning knobs. The ECDF is the raw order statistics, drawn — nothing to argue with.",
    },
  ],
  terms: [
    {
      term: "KDE (kernel density estimate)",
      definition:
        "A smooth curve built by dropping a small bump (a kernel) on every data point and summing them. It estimates the shape of a distribution — with a bandwidth you can widen or tighten.",
    },
    {
      term: "ECDF (empirical cumulative distribution function)",
      definition:
        "At each value x, the fraction of observations at or below x. Steep where data is dense, flat where data is absent, parameter-free by construction.",
    },
    {
      term: "binwidth",
      definition:
        "The width of a histogram's bars — the lens you choose before any shape is visible. Too wide merges structure; too narrow turns structure into noise.",
    },
    {
      term: "percentile",
      definition:
        "The value below which a given fraction of the data falls. The median is the 50th percentile; on an ECDF it is where the curve crosses 0.50.",
    },
  ],
  takeaways: [
    "One numeric column gets three instruments: histplot (counts), kdeplot (smooth shape), ecdfplot (raw percentiles).",
    "Bins are a lens you own: eight bins said 'mound plus tail', four bins said 'one skewed pile' — same 30 flowers.",
    "The KDE is a smooth READING of the data, not extra data — it adds a bandwidth choice, and it cannot add information.",
    "The ECDF hides nothing: no bins, no smoothing, every observation visible as a step — the honest instrument for percentiles.",
  ],
  quiz: [
    {
      id: "c-02-q1",
      prompt: "What does kde=True add to sns.histplot?",
      options: [
        { text: "A kernel density estimate curve laid over the bars — a smooth reading of the same shape", correct: true, feedback: "Correct — same data, two renderings: counts in bars, density as a curve." },
        { text: "It converts the histogram into a KDE, removing the bars", correct: false, feedback: "That is sns.kdeplot alone; kde=True keeps the bars AND adds the curve." },
        { text: "It adds kernel-smoothed error bars to each bar", correct: false, feedback: "Error bars come from bootstrap options elsewhere — kde is about the density curve." },
        { text: "It automatically picks the best bin count", correct: false, feedback: "Bin choice stays yours (bins= or binwidth=); kde=True is silent about bins." },
      ],
      explanation:
        "kde=True overlays the density estimate: useful to read the shape, but remember the curve carries a bandwidth — it is an interpretation, not more evidence.",
    },
    {
      id: "c-02-q2",
      prompt: "You re-bin the sepal-length histogram from 8 bins to 4. What changes?",
      options: [
        { text: "The story the chart tells — wider bins merged the thin upper tail into the main pile, changing 'mound plus tail' into 'one skewed mound'", correct: true, feedback: "Correct — bins are emphasis: the data did not move, the lens did." },
        { text: "The data itself — flowers were reassigned to new measurements", correct: false, feedback: "Same 30 values; only the grouping of the bars changed." },
        { text: "Nothing — histograms show the same shape at any bin count", correct: false, feedback: "Shape is bin-dependent; that sensitivity is exactly why binwidth is a decision." },
        { text: "Only the axis labels", correct: false, feedback: "Labels follow the bins, but the substance — which story the bars tell — changes too." },
      ],
      explanation:
        "The sepal example in this lesson showed it concretely: 8 bins exposed a mound and a tail; 4 bins folded the tail into the shoulder. Own your binwidth.",
    },
    {
      id: "c-02-q3",
      prompt: "On an ECDF of sepal lengths, the curve's height at x = 5.0 cm is 0.40. What does that say?",
      options: [
        { text: "40% of flowers have sepals of 5.0 cm or shorter", correct: true, feedback: "Correct — the ECDF is cumulative: height = fraction at or below that x." },
        { text: "40% of flowers have sepals of exactly 5.0 cm", correct: false, feedback: "Exactly-one-value readings come from a bar chart of counts, not the cumulative curve." },
        { text: "The average sepal length is 5.0 cm", correct: false, feedback: "The mean does not appear on an ECDF — the curve is about order and fractions, not averages." },
        { text: "40 is the number of flowers measured", correct: false, feedback: "30 flowers were measured; 0.40 is a fraction of them (12 of 30)." },
      ],
      explanation:
        "The ECDF answers 'what fraction is at or below x?' — which is why percentiles are read directly off it, and why it has no parameters to defend.",
    },
  ],
};
