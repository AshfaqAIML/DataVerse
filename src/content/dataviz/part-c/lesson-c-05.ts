/**
 * PART C · LESSON c-05 — "Regression Plots"
 *
 * regplot with its CI band, lmplot with col= faceting, what the band
 * actually means, and extrapolation honesty — plus the classic trap:
 * one line fitted through two species.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  IRIS_PETAL_LENGTH,
  IRIS_SEPAL_LENGTH,
  IRIS_SPECIES,
  SAMPLE_DATASETS,
} from "../datasets";

const trafficDs = SAMPLE_DATASETS.find((d) => d.id === "traffic")!;
const colNum = (name: string) =>
  trafficDs.columns.find((c) => c.name === name)!.values.map(Number);
const visitors = colNum("visitors");
const signups = colNum("signups");

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
function ols(x: number[], y: number[]) {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let den = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  const slope = num / den;
  return { slope, intercept: my - slope * mx };
}
function pearson(x: number[], y: number[]) {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

const fit = ols(visitors, signups);
const rTraffic = pearson(visitors, signups);
const visitorsPerSignup = Math.round(1 / fit.slope);
const minVisitors = Math.min(...visitors);
const maxVisitors = Math.max(...visitors);
const slopeRounded = Math.round(fit.slope * 1000) / 1000;

function speciesSlope(sp: string) {
  const idx = IRIS_SPECIES.map((s, i) => [s, i] as const)
    .filter(([s]) => s === sp)
    .map(([, i]) => i);
  return ols(idx.map((i) => IRIS_SEPAL_LENGTH[i]), idx.map((i) => IRIS_PETAL_LENGTH[i]));
}
const globalSlope = Math.round(ols(IRIS_SEPAL_LENGTH, IRIS_PETAL_LENGTH).slope * 100) / 100;
const setosaSlope = Math.round(speciesSlope("setosa").slope * 100) / 100;
const versicolorSlope = Math.round(speciesSlope("versicolor").slope * 100) / 100;

export const LESSON_V_C_05: DataVizLesson = {
  slug: "c-05",
  title: "Regression Plots",
  minutes: 25,
  summary:
    "regplot adds a fitted line and a 95% confidence band to a scatter; lmplot does the same per facet with col=. What the band means, why it widens at the edges, when extrapolating past your data stops being measurement — and the two-species trap.",
  tool: "seaborn",
  objectives: [
    "Draw a fitted line over a scatter with sns.regplot and style it through scatter_kws / line_kws",
    "Explain the shaded band: a 95% confidence interval for the fitted line, not a prediction range for new points",
    "Fit one model per group with sns.lmplot(col=) and say why the pooled fit can lie",
    "State the extrapolation rule: the model is honest only inside the range of the observed x",
  ],
  why: "A scatter shows the relationship; a regression line summarizes it with two numbers — slope and intercept — and suddenly you can talk: 'roughly one signup per forty-four visitors'. Seaborn draws the line and, crucially, the uncertainty band around it, in one call. But a fitted line is a MODEL, an opinion fitted to data, and models mislead in two predictable ways this lesson teaches: extrapolated past the range of the data (5000 visitors nobody ever observed), and fitted across hidden groups (two iris species whose pooled 'relationship' is mostly the gap between them). Both failures are visible in the chart — if you know what to look at.",
  blocks: [
    {
      kind: "text",
      text: "The running data: **28 days of website traffic** — visitors and signups per day. The business question: *how does traffic convert?* A scatter says 'strongly, directionally'; a regression line says 'at a rate of about 0.02 signups per visitor'. That rate is a claim with a slope, and claims with slopes can be checked — which is the whole point of drawing the model instead of just saying it.",
    },
    {
      kind: "code",
      title: "regplot — the fit, with its band",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

traffic = pd.DataFrame({
    "day": range(1, 29),
    "visitors": [1180, 1240, 1310, 1290, 1350, 2100, 2260, 1220, 1280, 1330,
                 1300, 1380, 2190, 2340, 1290, 1360, 1410, 1390, 1440, 2280,
                 2410, 1350, 1420, 1470, 1510, 1460, 2340, 2520],
    "signups": [23, 26, 29, 27, 30, 44, 49, 24, 27, 30, 28, 31, 47, 52, 26,
                31, 33, 30, 34, 50, 55, 28, 33, 35, 38, 33, 52, 58],
})

sns.regplot(data=traffic, x="visitors", y="signups")`,
      note: "One call, three layers: the points, the fitted line, and a shaded 95% confidence band for the line itself.",
      produces:
        "The 28 days as points hugging a straight line (slope about 0.02 signups per visitor) with a narrow grey band that pinches in the middle and widens at both ends.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Daily visitors vs signups, 28 days",
        points: visitors.map((v, i) => ({ x: v, y: signups[i] })),
        xLabel: "visitors",
        yLabel: "signups",
      },
      why: `The data behind the fit: points run from ${minVisitors} to ${maxVisitors} visitors and cling to a line — the computed slope is ${slopeRounded} signups per visitor (about one signup per ${visitorsPerSignup} visitors), with correlation r = ${Math.round(rTraffic * 100) / 100}. The two clumps on the x-axis are weekdays (left, around 1300) and weekends (right, around 2300).`,
    },
    {
      kind: "text",
      text: "What is that shaded band? **A 95% confidence interval for the fitted line itself** — the range where the true average signup count at each visitor level plausibly sits, given how noisy the data is. It is not a prediction range for individual days (those scatter wider), and it is not a guarantee. Notice its shape: narrowest mid-range where the data is dense, flaring at the edges where the line is held up by few points. Wide ends are the plot telling you *the model is least sure exactly where you are most tempted to extend it*.",
    },
    {
      kind: "code",
      title: "Styling the fit — dictionaries pass through to matplotlib",
      language: "python",
      code: `sns.regplot(
    data=traffic, x="visitors", y="signups",
    scatter_kws={"alpha": 0.6},
    line_kws={"color": "crimson"},
)`,
      note: "scatter_kws and line_kws forward keyword arguments to the underlying matplotlib collections — softening points so the fit leads.",
      produces:
        "The same regression with translucent points and a crimson fitted line — identical statistics, different emphasis.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Extrapolation honesty",
      text: `The data spans ${minVisitors} to ${maxVisitors} visitors per day. The fitted line will happily evaluate anywhere you ask — at 5000 visitors it promises about ${Math.round((fit.slope * 5000 + fit.intercept) * 10) / 10} signups — but no observation supports that number, and the confidence band (which narrows misleadingly as lines extend) was computed only where data lives. Extrapolation is a business bet, not a measurement. Quote the range you measured.`,
    },
    {
      kind: "heading",
      text: "One model or many? lmplot with col=",
    },
    {
      kind: "code",
      title: "lmplot — a fit per species, side by side",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

iris = pd.DataFrame({
    "sepal_length": [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                     5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                     6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4],
    "petal_length": [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                     1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                     4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9],
    "species": ["setosa"] * 20 + ["versicolor"] * 10,
})

sns.lmplot(data=iris, x="sepal_length", y="petal_length", col="species")`,
      note: "lmplot is regplot plus faceting: col= (or row=, or hue=) gives each group its OWN fit instead of one pooled fit.",
      produces:
        "Two panels, each with its own scatter and its own fitted line: setosa's line is nearly flat (slope about 0.10), and so is versicolor's (about 0.06).",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Sepal length vs petal length — the pooled-fit problem",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: `Here is why the two panels matter. One line fitted through BOTH clusters would report a slope of about ${globalSlope} cm of petal per cm of sepal — a relationship that lives almost entirely in the GAP between species (setosa at the bottom, versicolor at the top). Within setosa the true slope is about ${setosaSlope}; within versicolor, about ${versicolorSlope}. Pooled slope: a between-group artifact. Faceted slopes: the honest story.`,
    },
    {
      kind: "text",
      text: "This is the regression version of a lesson that recurs through data work: **an aggregate relationship can be created entirely by group structure**. The fix is not fancier math — it is showing the groups, which is exactly what `lmplot(col=)` exists for. Whenever a fitted line crosses empty space between clusters, ask what the clusters are.",
    },
    {
      kind: "interpretation",
      id: "c-05-i1",
      chart: {
        type: "scatter",
        title: "Daily visitors vs signups, 28 days",
        points: visitors.map((v, i) => ({ x: v, y: signups[i] })),
        xLabel: "visitors",
        yLabel: "signups",
      },
      prompt: "Which statement about the visitors-signups relationship does this chart support?",
      options: [
        {
          text: `Signups scale with visitors at roughly ${slopeRounded} per visitor — about one signup per ${visitorsPerSignup} — and the relationship is very tight (r = ${Math.round(rTraffic * 100) / 100})`,
          correct: true,
          feedback: `Correct — the rate, the tightness, and the two clumps (weekdays near 1300, weekends near 2300) are all visible structure. A slope stated with its data is a checkable claim.`,
        },
        {
          text: "More visitors CAUSE more signups — the chart proves it",
          correct: false,
          feedback: "The chart shows association, tightly. Causation needs more than tightness — the design of the study, not the slope of the line.",
        },
        {
          text: "Every 50 visitors yields exactly one signup, always",
          correct: false,
          feedback: `The rate is an average, not a law: at ~1300 visitors days produce 27-33 signups, and weekends sit slightly above the weekday trend. Bands and scatter exist because reality wobbles.`,
        },
        {
          text: "The relationship is weak and could be coincidence",
          correct: false,
          feedback: `r = ${Math.round(rTraffic * 100) / 100} across 28 days is about as tight as field data gets — 'coincidence' is not on the table; mechanism, however, still is.`,
        },
      ],
      explanation:
        "Reading a regression honestly means separating three things: the rate (slope, 0.02), the tightness (r = 0.98), and the cause (not shown). Claim the first two; negotiate the third.",
    },
    {
      kind: "exercise",
      id: "c-05-e1",
      exerciseKind: "critique",
      prompt:
        "A colleague fits ONE regression line through all 30 iris flowers (both species together) and reports: 'Within a species, petal length grows about 1.4 cm for every extra cm of sepal length.' What is wrong with that sentence?",
      options: [
        {
          text: `The 1.4 slope is a BETWEEN-species number: within setosa the slope is about ${setosaSlope} and within versicolor about ${versicolorSlope} — the colleague quoted the gap between the clusters as if it were a within-group trend`,
          correct: true,
          feedback: `Correct — the pooled fit slices through the empty space between species. lmplot(col="species") fits each group honestly and the slopes collapse to nearly flat.`,
        },
        {
          text: "Nothing — regression always finds the true relationship",
          correct: false,
          feedback: "Regression finds the best line FOR THE ROWS YOU GAVE IT. Feed it two species and it will faithfully describe the gap you accidentally asked about.",
        },
        {
          text: "The mistake is using centimeters instead of inches",
          correct: false,
          feedback: "Units change the slope's numeric value, not the structure of the error — the between/within confusion survives any unit.",
        },
        {
          text: "The problem is that 30 flowers is too few for any regression",
          correct: false,
          feedback: "Thirty points is plenty to see a nearly flat within-species fit — the issue is which rows the line was fed, not how many.",
        },
      ],
      explanation:
        "Aggregate relationships can be manufactured by group structure. The remedy is cheap and visible: facet the fit (lmplot with col=) and let each group speak with its own line.",
    },
  ],
  terms: [
    {
      term: "regplot",
      definition:
        "The axes-level regression plot: scatter + fitted line + 95% CI band for the line, in one call onto any axes.",
    },
    {
      term: "lmplot",
      definition:
        "The figure-level regression plot: regplot plus faceting — col=, row= or hue= fit a separate line per group.",
    },
    {
      term: "confidence band",
      definition:
        "The shaded region around a fitted line: where the true average y at each x plausibly sits. Narrow where data is dense, wide at the edges — not a prediction range for individual points.",
    },
    {
      term: "extrapolation",
      definition:
        "Evaluating a model outside the range of the observed x. The line extends for free; the evidence does not follow it.",
    },
  ],
  takeaways: [
    "regplot = points + fitted line + 95% CI band; the band is for the line, not for individual predictions.",
    "The band widens at the edges — read wide ends as the model's confession that it is least sure where data is thinnest.",
    "Extrapolate past your observed range and you are betting, not measuring: the traffic data ends at 2520 visitors.",
    "A pooled fit across hidden groups can manufacture a relationship: iris's global slope 1.42 is the species gap; within each species it is about 0.1.",
  ],
  quiz: [
    {
      id: "c-05-q1",
      prompt: "What does the shaded band around a regplot line represent?",
      options: [
        { text: "A 95% confidence interval for the fitted line — where the true average y at each x plausibly sits", correct: true, feedback: "Correct — it is the line's uncertainty, narrowest where the data is densest." },
        { text: "The range containing 95% of the individual data points", correct: false, feedback: "That would be a prediction interval — wider than the CI band; individual points routinely sit outside the band." },
        { text: "The margin of error of the plotting library", correct: false, feedback: "The band is statistics, not rendering tolerance — it comes from the bootstrap over your data." },
        { text: "The area where extrapolation is safe", correct: false, feedback: "The opposite signal: the band widens at the edges, flagging exactly where trust should thin." },
      ],
      explanation:
        "CI band for the line versus prediction range for points is the distinction to keep: one says 'the average is around here', the other 'a new point will land around here' — and seaborn draws the first.",
    },
    {
      id: "c-05-q2",
      prompt: "regplot and lmplot both fit lines. What does lmplot add?",
      options: [
        { text: "Faceting: col=, row= and hue= fit a separate regression per group", correct: true, feedback: "Correct — lmplot is the figure-level sibling: one honest fit per group instead of one pooled opinion." },
        { text: "It fits curves instead of straight lines", correct: false, feedback: "Curves come from order= (e.g. order=2) in either function — that is not the difference." },
        { text: "It computes the confidence interval; regplot does not", correct: false, feedback: "Both draw the CI band by default — the band is not the distinction." },
        { text: "It is the older, deprecated name for regplot", correct: false, feedback: "Both are current: axes-level regplot for composing, figure-level lmplot for faceting." },
      ],
      explanation:
        "Same statistics, different plumbing: when a scatter contains groups, lmplot's col= is how you avoid the pooled-fit trap this lesson demonstrated on the two iris species.",
    },
    {
      id: "c-05-q3",
      prompt: "Your traffic data covers 1180-2520 daily visitors. A stakeholder asks for predicted signups at 5000 visitors. The honest answer is:",
      options: [
        { text: "Give the number but state it is an extrapolation beyond any observed day — a bet, not a measurement", correct: true, feedback: "Correct — the line evaluates anywhere; your credibility only extends where the data lives. Label the leap." },
        { text: "Refuse: regression mathematically cannot evaluate at 5000", correct: false, feedback: "It can — plugging 5000 into the line is trivial. The limit is evidential, not computational." },
        { text: "Give the number with the same confidence interval as mid-range", correct: false, feedback: "The band was estimated where data lives; carrying it unchanged into empty range manufactures false certainty." },
        { text: "Round the prediction to the nearest thousand so it sounds cautious", correct: false, feedback: "Rounding is cosmetics — the honesty problem (no data up there) survives however you format the digits." },
      ],
      explanation:
        "Extrapolation honesty is a labelling discipline: quote the measured range (1180-2520), give the number if asked, and say plainly that beyond the range you are extrapolating a model, not reporting an observation.",
    },
  ],
};
