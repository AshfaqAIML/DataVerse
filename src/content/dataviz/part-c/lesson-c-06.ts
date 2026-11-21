/**
 * PART C · LESSON c-06 — "Heatmaps"
 *
 * sns.heatmap over a pivot_table (cities x months) and over a
 * correlation matrix with annot=True — plus the cmap decision:
 * sequential for magnitude, diverging around zero for signed data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  CITIES,
  IRIS_PETAL_LENGTH,
  IRIS_SEPAL_LENGTH,
  IRIS_SEPAL_WIDTH,
  TEMPS,
} from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
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
  return Math.round((num / Math.sqrt(dx * dy)) * 100) / 100;
}
const r2 = (v: number) => Math.round(v * 100) / 100;

const corrCols = [IRIS_SEPAL_LENGTH, IRIS_SEPAL_WIDTH, IRIS_PETAL_LENGTH];
const corrLabels = ["sepal length", "sepal width", "petal length"];
const corrMatrix = corrCols.map((a) => corrCols.map((b) => pearson(a, b)));

const osloTemps = TEMPS["Oslo"];
const osloRange = Math.max(...osloTemps) - Math.min(...osloTemps);
const singaporeTemps = TEMPS["Singapore"];
const singaporeRange = Math.max(...singaporeTemps) - Math.min(...singaporeTemps);
const cairoPeak = Math.max(...TEMPS["Cairo"]);

export const LESSON_V_C_06: DataVizLesson = {
  slug: "c-06",
  title: "Heatmaps",
  minutes: 22,
  summary:
    "A heatmap encodes one number per cell of a two-way grid as color intensity: pivot_table feeds it city-by-month temperatures, a correlation matrix feeds it column-to-column relationships. annot=True prints the number back into each cell, and the cmap choice — sequential or diverging — is an honesty decision.",
  tool: "seaborn",
  objectives: [
    "Feed a long DataFrame through pivot_table into a sns.heatmap with annot=True",
    "Build and heat-map a correlation matrix with a diverging cmap anchored at zero",
    "Choose cmap honestly: sequential for magnitude, diverging for signed data, qualitative for categories",
    "Read a heatmap: rows and columns as groups, cells as the crossing value",
  ],
  why: "Some data is naturally a grid: four cities by twelve months, five departments by four quarters. Drawing that as forty-eight separate bars is noise; drawing it as a table hides the pattern. The heatmap is the table with its numbers mapped to color intensity — the eye finds the hot rows and the cold columns that a table makes you hunt for cell by cell. The craft is in two decisions this lesson teaches: what goes in the cells (raw values from a pivot, or correlations between columns), and which colormap tells the truth for that cell type. Choose a rainbow or a sequential ramp where sign matters, and the picture actively lies.",
  blocks: [
    {
      kind: "text",
      text: "The temperatures dataset is already a grid wearing a long coat: 48 rows of (month, city, temp). The classic workflow is **reshape, then heat**: `pivot_table` widens the long form into a matrix — cities as rows, months as columns, temperatures in the cells — and `sns.heatmap` maps each cell's value to color intensity, optionally printing the number back into the cell with `annot=True`.",
    },
    {
      kind: "code",
      title: "pivot_table feeding a heatmap",
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

# Long -> wide: one row per city, one column per month
pivot = temps.pivot_table(index="city", columns="month", values="temp")

# pivot_table sorts labels ALPHABETICALLY (Apr, Aug, Dec...) --
# restore the calendar before anyone reads it:
pivot = pivot.reindex(columns=months)

sns.heatmap(pivot, annot=True, fmt=".0f", cmap="crest")`,
      note: "fmt=\".0f\" formats the annotation (any printf-style spec); the alphabetical-columns trap is real pandas behavior worth meeting once on purpose.",
      produces:
        "A 4x12 grid of colored cells with the temperature printed in each: Oslo's row opens at -3, Cairo's peaks at 33, Singapore's row is one flat warm band.",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "Monthly temperatures: city x month",
        matrix: {
          rowLabels: CITIES,
          colLabels: months,
          cells: CITIES.map((c) => TEMPS[c]),
        },
        palette: "warm",
      },
      why: "Rows are climates, columns are the year. Read by row: Singapore is a single warm band (27-28 all year), Oslo swings from -3 to 17, Cairo rides highest at 33 in July and August. The grid makes 48 numbers comparable at a glance — that comparison is the entire value of melting the table into color.",
    },
    {
      kind: "heading",
      text: "Correlation matrices",
    },
    {
      kind: "code",
      title: "Every column against every other, in one grid",
      language: "python",
      code: `import pandas as pd
import seaborn as sns

iris = pd.DataFrame({
    "sepal_length": [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                     5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                     6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4],
    "sepal_width":  [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
                     3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8,
                     3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.8, 3.4, 3.1],
    "petal_length": [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                     1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                     4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9],
})

corr = iris.corr(numeric_only=True)

sns.heatmap(corr, annot=True, fmt=".2f", cmap="vlag",
            vmin=-1, vmax=1, center=0)`,
      note: "corr() produces a symmetric matrix with 1.00 on the diagonal. vmin/vmax fix the scale to the full possible range and center=0 pins the midpoint — so color means the same thing in every heatmap you ship.",
      produces:
        "A 3x3 correlation grid in a diverging colormap: sepal_length x petal_length glows at 0.75, sepal_width x petal_length cools at -0.53, the diagonal is 1.00 by definition.",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "Iris measurement correlations",
        matrix: {
          rowLabels: corrLabels,
          colLabels: corrLabels,
          cells: corrMatrix,
        },
        palette: "cool",
      },
      why: `Our engine shades one hue from light to dark by value — here the darkest off-diagonal cell is sepal length x petal length at ${r2(corrMatrix[0][2])} and the lightest is sepal width x petal length at ${r2(corrMatrix[1][2])}. Seaborn's honest choice for this data is a DIVERGING map (vlag with center=0): blue for negative, red for positive, white for none — because sign, not just size, is information. The engine approximation ranks magnitude; seaborn's cmap choice preserves sign.`,
    },
    {
      kind: "text",
      text: "The colormap rule in one breath: **sequential** ramps (crests, blues, oranges) for magnitudes where bigger means more; **diverging** maps anchored at a meaningful midpoint (zero for correlations and profit/loss) where the SIGN is information; **qualitative** palettes for categories where order would be a lie. The rainbow 'jet' map is none of these — it introduces boundaries that do not exist in the data and is banned from serious work.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "annot=True earns its keep on small grids",
      text: "Printing the value into every cell doubles the information (color for pattern, digits for precision) — but a 30x30 annotated grid is a wall of digits nobody reads. Heatmaps are a small-grid instrument: past roughly ten rows or columns, drop the annotation, or aggregate first. If you need every number AND the pattern, ship a table next to the chart, not inside it.",
    },
    {
      kind: "interpretation",
      id: "c-06-i1",
      chart: {
        type: "heatmap",
        title: "Monthly temperatures: city x month",
        matrix: {
          rowLabels: CITIES,
          colLabels: months,
          cells: CITIES.map((c) => TEMPS[c]),
        },
        palette: "warm",
      },
      prompt: "Which statement about the four cities does this heatmap support exactly?",
      options: [
        {
          text: `Singapore has the flattest row — 27 to 28 all twelve months — while every other city swings at least 14 degrees (Oslo spans ${osloRange})`,
          correct: true,
          feedback: `Correct — Singapore's whole row sits in a ${singaporeRange}-degree band; Lisbon and Cairo each swing 14, Oslo ${osloRange}. Range, read off the grid.`,
        },
        {
          text: "Oslo is the warmest city in July",
          correct: false,
          feedback: `Oslo's July is 17 — the coolest July on the chart. Cairo's July hits ${cairoPeak}.`,
        },
        {
          text: "All four cities peak in August",
          correct: false,
          feedback: "Lisbon and Cairo tie July with August (25, 25 and 33, 33) — but Oslo peaks in July at 17, so 'all four' fails on Oslo.",
        },
        {
          text: "Cairo never exceeds 30 degrees",
          correct: false,
          feedback: `Cairo's July and August cells both read ${cairoPeak} — the warmest cells in the entire grid.`,
        },
      ],
      explanation:
        "Heatmap reading is row-wise and column-wise: describe a row to characterise a group (Singapore flat, Oslo wild), scan a column to compare groups at one x (January: -3 to 27). Both moves, and the numbers, came straight off the grid.",
    },
    {
      kind: "exercise",
      id: "c-06-e1",
      exerciseKind: "choose-chart",
      prompt:
        "You must heat-map a profit-and-loss matrix: regions as rows, quarters as columns, and cells holding profit that can be positive or negative. Which colormap setup tells the truth?",
      options: [
        {
          text: "A diverging map with center=0 — one hue for profit, the opposite hue for loss, neutral at break-even",
          correct: true,
          feedback: "Correct — sign is information here: the midpoint (zero) is meaningful, and a diverging map anchored there makes 'above water' and 'under water' visually opposite.",
        },
        {
          text: "A sequential ramp from light to dark — bigger profit, darker cell",
          correct: false,
          feedback: "A sequential ramp maps losses and small profits to nearly the same light color — it destroys exactly the distinction the matrix exists to show.",
        },
        {
          text: "The rainbow jet map — maximum visual variety",
          correct: false,
          feedback: "Jet invents boundaries that do not exist and reorders perceived values — the classic banned colormap, for good reason.",
        },
        {
          text: "A qualitative palette — one flat color per region",
          correct: false,
          feedback: "Qualitative palettes are for categories without order; profit has both order AND sign. Wrong tool twice over.",
        },
      ],
      explanation:
        "The cmap decision follows the cell type: magnitude -> sequential; signed magnitude -> diverging anchored at the meaningful zero; category -> qualitative. Profit-and-loss is the textbook diverging case.",
    },
    {
      kind: "exercise",
      id: "c-06-e2",
      exerciseKind: "concept-check",
      prompt:
        "You ran pivot_table(index=\"city\", columns=\"month\", values=\"temp\") and the heatmap's months came out as Apr, Aug, Dec, Feb... — alphabetically. Why, and what is the fix?",
      options: [
        {
          text: "pivot_table sorts row and column labels alphabetically by default; fix it by reindexing with the calendar order (or making month an ordered Categorical before pivoting)",
          correct: true,
          feedback: "Correct — pivot.reindex(columns=months) restores the year, and an ordered Categorical fixes it at the source so every later pivot inherits the order.",
        },
        {
          text: "The heatmap function shuffled the columns; pass sort=False to sns.heatmap",
          correct: false,
          feedback: "The shuffle happened upstream in pivot_table — seaborn received the columns already alphabetized.",
        },
        {
          text: "It is a bug in pandas; restart the kernel and pivot again",
          correct: false,
          feedback: "Not a bug — deterministic, documented behavior of pivot_table's label sorting.",
        },
        {
          text: "Nothing is wrong — alphabetical months are equally readable",
          correct: false,
          feedback: "Time axes carry meaning in their order; alphabetical months break the seasonal story the chart exists to show.",
        },
      ],
      explanation:
        "Long-to-wide reshaping sorts labels for you — convenient for names, wrong for ordered categories. reindex (or an ordered Categorical) is the two-line fix shown in this lesson's first code block.",
    },
  ],
  terms: [
    {
      term: "heatmap",
      definition:
        "A two-way grid with each cell's number encoded as color intensity. Rows and columns are categories; the cell is the crossing value.",
    },
    {
      term: "pivot_table",
      definition:
        "The pandas long-to-wide reshaper: specify index (rows), columns and values, and it spreads one row per observation into one cell per crossing.",
    },
    {
      term: "diverging colormap",
      definition:
        "A color ramp with two hues meeting at a meaningful midpoint — the standard for signed data like correlations, anchored at zero with center=0.",
    },
    {
      term: "annot",
      definition:
        "The heatmap parameter that prints each cell's value inside the cell (formatted with fmt=) — precision layered on pattern for small grids.",
    },
  ],
  takeaways: [
    "The workflow is reshape-then-heat: pivot_table widens long data into the grid, sns.heatmap colors the cells.",
    "pivot_table sorts labels alphabetically — reindex ordered axes (months, sizes) before anyone reads the chart.",
    "Correlation matrices are the other feedstock: corr() hands seaborn a symmetric grid; vmin=-1, vmax=1, center=0 keeps color meaning stable.",
    "cmap is an honesty decision: sequential for magnitude, diverging around zero when sign matters, qualitative for categories — never jet.",
  ],
  quiz: [
    {
      id: "c-06-q1",
      prompt: "Which colormap setup is honest for a correlation matrix?",
      options: [
        { text: "Diverging (e.g. vlag) with vmin=-1, vmax=1 and center=0 — sign and magnitude both visible", correct: true, feedback: "Correct — negative and positive correlations get opposite hues; white is 'no relationship'." },
        { text: "A sequential ramp — stronger correlations just darker", correct: false, feedback: "A sequential ramp renders -0.9 and +0.9 nearly the same cell — sign is information you cannot drop." },
        { text: "A qualitative palette — one color per column", correct: false, feedback: "Correlations are ordered numbers, not categories; qualitative color would fake unorderedness." },
        { text: "Greyscale only, because color is decoration", correct: false, feedback: "A diverging map is not decoration — it encodes the sign, which greyscale can only do at half the bandwidth." },
      ],
      explanation:
        "Correlations live on a signed scale whose midpoint (zero) is meaningful. Diverging maps exist precisely for such scales; pin them with center=0 so the anchor cannot drift between charts.",
    },
    {
      id: "c-06-q2",
      prompt: "What does annot=True buy, and what does it cost?",
      options: [
        { text: "Digits inside every cell — precision layered on the color pattern — at the cost of unreadability on large grids", correct: true, feedback: "Correct — annotation is a small-grid instrument; past ~10x10 it becomes noise." },
        { text: "It adds axis labels automatically", correct: false, feedback: "Labels come from the DataFrame's index and columns; annot prints the VALUES into the cells." },
        { text: "It sorts the rows by value", correct: false, feedback: "Ordering is yours to control (reindex); annot changes no arrangement, only ink." },
        { text: "It computes the correlations for you", correct: false, feedback: "corr() computed them; annot only displays what is already in the matrix." },
      ],
      explanation:
        "Color finds the pattern, digits confirm the value — the pairing works while the grid stays small. When annotation stops being readable, the answer is aggregation or an adjacent table, not smaller fonts.",
    },
    {
      id: "c-06-q3",
      prompt: "A cell in the iris correlation heatmap reads 0.75 (sepal length x petal length). What does that number say?",
      options: [
        { text: "Across the 30 flowers, longer sepals tend to travel with longer petals — a moderately strong positive LINEAR association", correct: true, feedback: "Correct — correlation summarizes co-movement on a -1..1 scale; and remember c-05: here much of it is the species gap." },
        { text: "Petals are 75% the length of sepals on average", correct: false, feedback: "That would be a ratio of means, not a correlation — different statistic entirely." },
        { text: "75% of flowers have long sepals", correct: false, feedback: "Correlation says nothing about marginal percentages — it is about co-movement of two columns." },
        { text: "Increasing sepal length will increase petal length by 75%", correct: false, feedback: "That is a causal regression claim — correlation carries neither causation nor slope." },
      ],
      explanation:
        "A correlation cell is one number for one pair of columns: strength and sign of linear association, no causation, no slope, no percentages. Reading it as tendency is right; reading it as mechanism is not.",
    },
  ],
};
