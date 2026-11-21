/**
 * PART C · LESSON c-04 — "Relationship Plots"
 *
 * relplot: scatter and line via kind=, the hue/size/style encoding
 * channels, and the estimator — how a line aggregates repeated x
 * values (four cities collapsing into one monthly mean).
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  CITIES,
  IRIS_PETAL_LENGTH,
  IRIS_SEPAL_LENGTH,
  IRIS_SEPAL_WIDTH,
  IRIS_SPECIES,
  TEMPS,
} from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const monthlyMean = months.map((_, i) =>
  Math.round(mean(CITIES.map((c) => TEMPS[c][i])) * 100) / 100,
);
const janMean = monthlyMean[0];

export const LESSON_V_C_04: DataVizLesson = {
  slug: "c-04",
  title: "Relationship Plots",
  minutes: 25,
  summary:
    "relplot dispatches scatter and line over two numeric columns; hue, size and style add third variables as color, dot area and marker shape; and the estimator aggregates repeated x values — four cities collapsing into one honest monthly mean.",
  tool: "seaborn",
  objectives: [
    "Draw a scatter of two numeric columns with sns.relplot and split it by category with hue=",
    "Add a third numeric variable as dot area with size= and a categorical one as marker shape with style=",
    "Explain what kind=\"line\" plus estimator does when several rows share an x value",
    "Read an aggregated line honestly: a summary with no members",
  ],
  why: "Distributions (c-02) described one column; the next question is how two columns travel together — do longer sepals come with wider ones? Does traffic predict signups? The scatter plot is the instrument, and seaborn's relplot is its dispatcher: kind=\"scatter\" for the raw relationship, kind=\"line\" for change or aggregation. The quiet superpower is the estimator: when four cities each have a January temperature, a line with estimator=\"mean\" collapses them into one point — with a band admitting the collapse. That band, and what the aggregated line honestly is (a summary, not a member), is where most dashboards go wrong.",
  blocks: [
    {
      kind: "text",
      text: "The iris flowers carry three numeric measurements. **Question: do longer sepals travel with wider ones?** The scatter plot answers by position: each flower becomes a dot at (sepal length, sepal width). Add `hue=\"species\"` and a third column — which flower is which — becomes color, and the plot starts explaining itself.",
    },
    {
      kind: "code",
      title: "relplot — the scatter, with a category as color",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

iris = pd.DataFrame({
    "sepal_length": [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                     5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                     6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4],
    "sepal_width": [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
                    3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8,
                    3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.8, 3.4, 3.1],
    "species": ["setosa"] * 20 + ["versicolor"] * 10,
})

sns.relplot(data=iris, x="sepal_length", y="sepal_width", hue="species")`,
      note: "The long-form DataFrame again: one row per flower, and hue turns a categorical column into color — no manual grouping.",
      produces:
        "Thirty dots in two colored clusters: setosa (teal) short but wide — 2.9-4.4 cm across — while versicolor runs longer and narrower, 2.5-3.4 cm.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Sepal length vs sepal width, by species",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_SEPAL_WIDTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "sepal width (cm)",
      },
      why: "Two clusters in opposite corners: setosa (teal) piles up at short-and-wide, versicolor (rust) at long-and-narrow. The pooled relationship is negative — longer sepals go with narrower ones across the whole table — but that is mostly the species gap, a subtlety c-05 will chase properly.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Three more channels besides position",
      text: "`hue=` maps a column to **color** (categorical or numeric). `size=` maps a numeric column to **dot area** — e.g. `sns.relplot(data=iris, x=\"sepal_length\", y=\"petal_length\", hue=\"species\", size=\"sepal_width\", sizes=(15, 150))` puts a third measurement in the marker itself. `style=` maps a categorical column to **marker shape**. Position is the strongest channel; these three are how you spend the rest of the ink budget.",
    },
    {
      kind: "heading",
      text: "Lines that aggregate",
    },
    {
      kind: "code",
      title: "kind=\"line\" — four cities, one panel",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
temps = pd.DataFrame({
    "month": months * 4,
    "city": ["Lisbon"] * 12 + ["Oslo"] * 12 + ["Cairo"] * 12 + ["Singapore"] * 12,
    "temp": [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12,
             -3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2,
             19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20,
             27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
})

sns.relplot(data=temps, x="month", y="temp", hue="city", kind="line")`,
      note: "hue= now splits the LINES: one per city, all sharing the y-axis. Month strings are categorical, so seaborn draws them in first-seen order — the calendar.",
      produces:
        "Four seasonal lines in one panel: Oslo dips to -3 in January, Singapore holds a flat 27-28 all year, Cairo peaks at 33.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly temperature, four cities",
        categories: months,
        series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
        xLabel: "month",
        yLabel: "°C",
      },
      why: "Four lines, one shared scale: comparisons come free — Oslo's January dip below zero, Singapore's one-degree band, the northern-hemisphere summer peak shared by three cities. This overlay works because there are four series; at fourteen it would drown, which is where c-08's small multiples take over.",
    },
    {
      kind: "text",
      text: "Now drop `hue=` from that same call and something important happens: each month has **four rows** (one per city), and a line needs one point per x. Seaborn resolves this with the **estimator** — by default the mean — and surrounds the result with a shaded band: a bootstrap confidence interval for that monthly mean. The line is no longer any city; it is a summary OF the cities.",
    },
    {
      kind: "code",
      title: "The estimator — four cities collapse into one mean line",
      language: "python",
      code: `sns.relplot(data=temps, x="month", y="temp", kind="line", estimator="mean")`,
      note: "estimator=\"mean\" is the default (\"median\", \"sum\" or any callable works too). The band around the line is the 95% CI of each monthly mean over the four city values.",
      produces:
        "One line of monthly means across the cities — January 13.5 °C, July 25.75 °C, December 14.25 °C — wrapped in a band that is widest exactly where the four cities disagree most.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Mean monthly temperature across the four cities",
        categories: months,
        series: [{ name: "mean temp", values: monthlyMean }],
        xLabel: "month",
        yLabel: "°C",
        showLegend: false,
      },
      why: `This is the estimator's output, computed honestly: January's point is the mean of 11, -3, 19 and 27 — ${janMean} °C. Seaborn would shade a CI band around it; the four city values it summarizes are the previous chart's four January points. A summary, not a member.`,
    },
    {
      kind: "interpretation",
      id: "c-04-i1",
      chart: {
        type: "line",
        title: "Mean monthly temperature across the four cities",
        categories: months,
        series: [{ name: "mean temp", values: monthlyMean }],
        xLabel: "month",
        yLabel: "°C",
        showLegend: false,
      },
      prompt:
        "The mean line says 13.5 °C for January. Which statement about that number is the honest reading?",
      options: [
        {
          text: "It is a summary of four very different cities — Lisbon 11, Oslo -3, Cairo 19, Singapore 27 — and no city actually experienced 13.5 °C in January",
          correct: true,
          feedback: `Correct — ${janMean} °C is arithmetic, not weather. The line describes the group; only the band (which seaborn adds) admits how far apart the members stand.`,
        },
        {
          text: "13.5 °C is the typical January temperature in these cities",
          correct: false,
          feedback: "'Typical' is exactly what a mean is NOT when the members sit at -3 and 27 — the middle of that range belongs to nobody.",
        },
        {
          text: "The mean line proves all four cities have similar climates",
          correct: false,
          feedback: "The mean line hides the spread it summarizes; the previous chart's four separate lines are what show how UNsimilar the climates are.",
        },
        {
          text: "The band around the line is the weather forecast",
          correct: false,
          feedback: "The band is a bootstrap CI of the mean — statistical uncertainty of the summary, not meteorological prediction.",
        },
      ],
      explanation:
        "Aggregated lines are summaries with no members: read them as 'the average of these groups', and reach for the band (or the un-aggregated view) whenever the members differ as much as Oslo and Singapore.",
    },
    {
      kind: "exercise",
      id: "c-04-e1",
      exerciseKind: "choose-chart",
      prompt:
        "A scatter of visitors vs signups already works. You now want a THIRD numeric variable — minutes on page — visible in the same panel. Which relplot parameter do you add?",
      options: [
        {
          text: "size=\"minutes_on_page\" — map the third numeric to dot area (with sizes= to control the range)",
          correct: true,
          feedback: "Correct — size is the numeric third-variable channel: bigger dot, more minutes, no axes added.",
        },
        {
          text: "hue=\"minutes_on_page\" — and let the color scale carry it",
          correct: false,
          feedback: "hue CAN carry a numeric column as a color gradient, but area (size) reads more precisely for quantity — keep hue for categories when you can.",
        },
        {
          text: "style=\"minutes_on_page\" — different marker shapes",
          correct: false,
          feedback: "style is categorical (a handful of shapes); a continuous minutes column would sprout dozens of indistinguishable markers.",
        },
        {
          text: "col=\"minutes_on_page\" — one panel per value",
          correct: false,
          feedback: "Faceting a continuous variable creates a panel per distinct value — a wall of near-identical panels, not a reading.",
        },
      ],
      explanation:
        "Position, then color, then area: size= is the honest home for a third numeric variable in a scatter. Save style= for categories, and faceting for groups you can count on one hand.",
    },
  ],
  terms: [
    {
      term: "hue",
      definition:
        "The color encoding channel: maps a categorical column to distinct colors (or a numeric column to a gradient). The cheapest way to add a third dimension.",
    },
    {
      term: "estimator",
      definition:
        "When several rows share an x value, the statistic that collapses them into one point on a line — mean by default, with a bootstrap CI band around the result.",
    },
    {
      term: "style",
      definition:
        "The marker-shape channel for categorical columns — useful when color is unavailable (print, colorblind audiences) or already spent.",
    },
  ],
  takeaways: [
    "relplot(kind=\"scatter\") is the raw relationship; kind=\"line\" adds aggregation and change-reading.",
    "hue, size and style are encoding channels: categories as color and shape, a third numeric as dot area.",
    "When several rows share an x, the estimator collapses them — default mean, with a CI band admitting the uncertainty.",
    "An aggregated line is a summary with no members: January's 13.5 °C is no city's weather — keep the un-aggregated view within reach.",
  ],
  quiz: [
    {
      id: "c-04-q1",
      prompt: "What is the difference between hue and size in relplot?",
      options: [
        { text: "hue maps a column to color; size maps a numeric column to dot area", correct: true, feedback: "Correct — two channels, two jobs; both can coexist with position." },
        { text: "hue is only for numeric columns, size only for categorical ones", correct: false, feedback: "The reverse is closer to the truth: size wants a numeric column, hue happily takes either." },
        { text: "They are aliases for the same parameter", correct: false, feedback: "Distinct channels with distinct perceptual strengths — color for categories, area for quantity." },
        { text: "size changes the figure size, not the markers", correct: false, feedback: "Figure size is height=/aspect= (or figsize in matplotlib); size= is a data channel." },
      ],
      explanation:
        "Color and area are different visual properties with different accuracies: color separates categories at a glance; area supports rough magnitude comparisons. Assign your columns accordingly.",
    },
    {
      id: "c-04-q2",
      prompt: "In the temperatures call, what does estimator=\"mean\" do?",
      options: [
        { text: "Collapses the four city values for each month into one mean point, with a CI band around the line", correct: true, feedback: "Correct — aggregation with an honesty band: the mean, plus admission of how much the members disagree." },
        { text: "Replaces each month with the average month", correct: false, feedback: "The x values stay; it is the four y values per month that collapse." },
        { text: "Removes the confidence band from the plot", correct: false, feedback: "Removing the band is errorbar=None; the estimator is what creates the band's reason to exist." },
        { text: "Sorts the months alphabetically", correct: false, feedback: "Categorical months plot in first-seen order; the estimator has nothing to do with ordering." },
      ],
      explanation:
        "Repeated x values force a choice: aggregate (estimator=, default mean) or dodge (hue= splitting). Seaborn aggregates AND shades the uncertainty — read the band as the members' disagreement.",
    },
    {
      id: "c-04-q3",
      prompt: "Why is the mean-temperature line potentially misleading on its own?",
      options: [
        { text: "Because a mean of wildly different members describes none of them — January's 13.5 °C is not any city's weather", correct: true, feedback: "Correct — summaries have no members; the band and the un-aggregated view are the antidotes." },
        { text: "Because line charts cannot show temperature", correct: false, feedback: "Lines are the natural encoding for a value over an ordered month axis — the issue is aggregation, not the line." },
        { text: "Because the mean was computed incorrectly", correct: false, feedback: "The arithmetic is right (11 + -3 + 19 + 27 over 4); the danger is interpretation, not calculation." },
        { text: "Because temperatures should always be in Fahrenheit", correct: false, feedback: "Units are a labelling matter — honesty is about what the line represents." },
      ],
      explanation:
        "This is the reading discipline for every aggregated chart: name what the line summarizes, and check the members (or at least the band) before quoting the summary as if it were a typical case.",
    },
  ],
};
