/**
 * PART C · LESSON c-07 — "Pairplots"
 *
 * sns.pairplot with hue= — the first-look instrument for a new
 * table — tamed by vars= and corner=. When a pairs grid is
 * exploration gold and when it is a wall of noise.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { IRIS_PETAL_LENGTH, IRIS_SEPAL_LENGTH, IRIS_SPECIES } from "../datasets";

const setosaPetals = IRIS_PETAL_LENGTH.filter((_, i) => IRIS_SPECIES[i] === "setosa");
const versicolorPetals = IRIS_PETAL_LENGTH.filter((_, i) => IRIS_SPECIES[i] === "versicolor");
const setosaMax = Math.max(...setosaPetals);
const versicolorMin = Math.min(...versicolorPetals);
const petalGap = Math.round((versicolorMin - setosaMax) * 10) / 10;

export const LESSON_V_C_07: DataVizLesson = {
  slug: "c-07",
  title: "Pairplots",
  minutes: 22,
  summary:
    "pairplot draws every numeric column against every other — scatters off the diagonal, distributions on it, hue splitting every panel. Exploration gold for a handful of columns, a wall of noise beyond — tamed by vars= and corner=.",
  tool: "seaborn",
  objectives: [
    "Draw a full pairs grid with sns.pairplot and split every panel by category with hue=",
    "Explain what the diagonal and the off-diagonal panels each show",
    "Cut the grid down with vars= (column selection) and corner=True (lower triangle only)",
    "Judge when a pairs plot is gold and when it is noise: the n(n-1)/2 panel budget",
  ],
  why: "You open a new dataset. It has a handful of numeric columns and maybe one categorical one. Before any hypothesis exists, you want to see EVERYTHING at once: which pair separates the groups, which columns travel together, where the oddballs sit. That is exactly what a pairs grid gives — every column against every other, one panel per pair, all split by hue if you have a grouping. The catch is combinatorial: panels grow as n(n-1)/2, so a 15-column table produces 105 panels, most of them redundant or empty of insight. Knowing when to pair-plot and when to cut it down (vars=, corner=) is the difference between an exploration instrument and a screensaver.",
  blocks: [
    {
      kind: "text",
      text: "The iris table has three numeric measurements and a species column. `sns.pairplot(iris, hue=\"species\")` is the whole instrument: **every numeric pair as a scatter, every column against itself as a distribution on the diagonal, every panel split by species color**. No questions asked, no parameters chosen — which is both the power (you see everything) and the danger (most of it will not matter).",
    },
    {
      kind: "code",
      title: "pairplot — the first look",
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
    "species": ["setosa"] * 20 + ["versicolor"] * 10,
})

sns.pairplot(iris, hue="species")`,
      note: "hue= is optional but transformative: every panel — scatter AND diagonal — is split by species. diag_kind=\"kde\" swaps the diagonal histograms for smooth densities.",
      produces:
        "A 3x3 grid: each off-diagonal panel is a sepal/petal scatter split by species color; the diagonal holds each column's distribution, also split by species.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "The payoff cell: sepal length vs petal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: "In a pairs grid you scan for the panel that separates the colors best — and here it is this one: setosa (teal) occupies its own horizontal band at petal length 1.1-1.7, versicolor (rust) sits at 4.0-4.9, with daylight between them. The pairs plot's value is FINDING this panel without having to draw each combination by hand.",
    },
    {
      kind: "chart",
      chart: {
        type: "histogram",
        title: "The diagonal's data: petal length, all 30 flowers",
        values: IRIS_PETAL_LENGTH,
        bins: 8,
        xLabel: "petal length (cm)",
        yLabel: "count",
        caption:
          "Our engine draws the pooled histogram; seaborn's pairplot diagonal splits it by hue — one histogram per species stacked in the same panel.",
      },
      why: `The diagonal explains the off-diagonal: petal length is TWO islands — ${setosaPetals.length} setosa flowers below ${setosaMax} cm, then a ${petalGap} cm empty gap, then ${versicolorPetals.length} versicolor flowers from ${versicolorMin} cm up. Any scatter involving petal length inherits that separation, which is why the payoff cell pays off.`,
    },
    { kind: "heading", text: "Taming the grid: corner and vars" },
    {
      kind: "text",
      text: "The grid is symmetric: the (sepal length, petal length) panel and the (petal length, sepal length) panel show the same relationship with axes swapped. Half the grid is a mirror — which is what `corner=True` removes: it draws only the lower triangle, keeping every distinct pair exactly once. And when only some columns matter, `vars=` selects them: `vars=[\"sepal_length\", \"petal_length\"]` turns a 3x3 grid into the 2x2 that carries the news.",
    },
    {
      kind: "code",
      title: "Taming the grid: vars and corner",
      language: "python",
      code: `sns.pairplot(
    iris,
    vars=["sepal_length", "petal_length"],
    hue="species",
    corner=True,
    diag_kind="kde",
)`,
      note: "corner=True drops the mirrored upper triangle; vars= picks the columns worth pairing; diag_kind=\"kde\" smooths the diagonal. Three small parameters, a grid you can actually read.",
      produces:
        "A 2x2 lower-triangle grid — one species-colored scatter, one KDE density per species on the diagonal — half the ink of the square version, same information.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The panel budget: n(n-1)/2",
      text: "Panels grow quadratically: 3 numeric columns = 3 unique pairs; 6 columns = 15; 15 columns = 105, most of them redundant or empty. Past roughly six numeric columns a full pairs plot stops being an instrument and becomes decoration. Select with `vars=`, or graduate the column-to-column job to the correlation heatmap (c-06) and keep pairplots for the columns that survived.",
    },
    {
      kind: "interpretation",
      id: "c-07-i1",
      chart: {
        type: "histogram",
        title: "The diagonal's data: petal length, all 30 flowers",
        values: IRIS_PETAL_LENGTH,
        bins: 8,
        xLabel: "petal length (cm)",
        yLabel: "count",
      },
      prompt: "What does the petal-length diagonal say about the two species?",
      options: [
        {
          text: `Complete separation: every setosa is at or below ${setosaMax} cm, every versicolor at or above ${versicolorMin} cm — a ${petalGap} cm gap with no flower inside it`,
          correct: true,
          feedback: `Correct — ${setosaPetals.length} flowers on the left island, ${versicolorPetals.length} on the right, and the middle bins are empty. One column alone classifies the species.`,
        },
        {
          text: "The species overlap heavily on petal length",
          correct: false,
          feedback: "Overlap would show as a shared mound between 2 and 4 cm — those bins are empty. The islands never touch.",
        },
        {
          text: "The typical petal length is about 3 cm",
          correct: false,
          feedback: "About 3 cm is where NOBODY lives — the gap. The mean of the pooled column is meaningless when the column is two islands.",
        },
        {
          text: "Petal length is uniformly distributed",
          correct: false,
          feedback: "Uniform would be flat bars across 1-5 cm; instead the counts pile into two separated islands with emptiness between.",
        },
      ],
      explanation:
        "A bimodal diagonal is a finding: the column splits the groups on its own. That insight — petal length classifies species — is exactly what the pairs grid exists to surface in five seconds.",
    },
    {
      kind: "exercise",
      id: "c-07-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague runs sns.pairplot on a 15-numeric-column table, prints the 105-panel grid across four slides, and calls it 'complete exploratory analysis'. What is the honest critique?",
      options: [
        {
          text: "The grid is mostly redundancy: 105 panels of mirrored pairs and noise — select the columns that matter with vars= (or a correlation heatmap) and pair-plot only the survivors",
          correct: true,
          feedback: "Correct — completeness is not coverage. The instrument works at a handful of columns; past that it needs pruning, not printing.",
        },
        {
          text: "No critique — showing every pair IS complete analysis",
          correct: false,
          feedback: "Analysis is finding what matters, not displaying everything. A chart nobody can read supports no finding.",
        },
        {
          text: "The mistake is using hue; pairplot should never take hue",
          correct: false,
          feedback: "hue= is often the most informative parameter — it colors every panel by group. The problem here is panel count, not color.",
        },
        {
          text: "The grid is too small; print it across eight slides instead",
          correct: false,
          feedback: "More slides of noise is still noise — the fix is fewer, chosen panels.",
        },
      ],
      explanation:
        "The panel budget rule: n(n-1)/2 unique pairs. At 15 columns the honest move is selection — vars= for the columns the question touches, or a correlation heatmap to triage which pairs deserve a scatter.",
    },
  ],
  terms: [
    {
      term: "pairs grid",
      definition:
        "Every numeric column plotted against every other: scatters off the diagonal, per-column distributions on it. The first-look instrument for a new table.",
    },
    {
      term: "hue (pairplot)",
      definition:
        "The grouping column that splits every panel — scatters by point color, diagonals by overlapping distributions — turning a shape survey into a separation survey.",
    },
    {
      term: "corner",
      definition:
        "The pairplot parameter that draws only the lower triangle, dropping the mirrored upper half — same information, half the ink.",
    },
    {
      term: "vars",
      definition:
        "The column selector: restrict the grid to the numeric columns the question actually touches instead of every pair the table permits.",
    },
  ],
  takeaways: [
    "pairplot is the zero-parameter first look: every numeric pair as a scatter, every column's distribution on the diagonal, all split by hue=.",
    "Scan the grid for the panel that separates the colors best — the iris payoff cell (sepal vs petal length) separates the species completely.",
    "corner=True halves the mirrored grid; vars= prunes it to the columns that matter.",
    "The panel budget is n(n-1)/2: past ~6 numeric columns, select or graduate to a correlation heatmap.",
  ],
  quiz: [
    {
      id: "c-07-q1",
      prompt: "In sns.pairplot(iris, hue=\"species\"), what does the diagonal of the grid show?",
      options: [
        { text: "Each column's distribution — histogram by default, KDE with diag_kind=\"kde\" — split by species", correct: true, feedback: "Correct — a column against itself is its distribution, and hue splits it per group." },
        { text: "A flat line of zeros, since x equals y there", correct: false, feedback: "That would be a scatter of a column against ITSELF — the diagonal replaces those useless panels with distributions." },
        { text: "The species names in alphabetical order", correct: false, feedback: "The diagonal holds charts, not labels — the legend carries the names." },
        { text: "Correlation coefficients for each column pair", correct: false, feedback: "Coefficients live in the corr() heatmap; the pairplot diagonal is distributional." },
      ],
      explanation:
        "The grid's design: off-diagonal = relationship between two different columns; diagonal = the shape of one column. Both halves split by hue when you pass it.",
    },
    {
      id: "c-07-q2",
      prompt: "What does corner=True do to a pairs grid?",
      options: [
        { text: "Draws only the lower triangle — the upper half mirrors it, so nothing is lost but ink", correct: true, feedback: "Correct — (A,B) and (B,A) are the same relationship with axes swapped; keeping one copy is the honest economy." },
        { text: "Crops the grid to the four most important panels", correct: false, feedback: "Panel selection is vars=; corner only removes the mirror." },
        { text: "Rounds the panel corners for a softer look", correct: false, feedback: "Nothing cosmetic — it is a structural halving of the grid." },
        { text: "Moves the diagonal distributions to a separate figure", correct: false, feedback: "The diagonal stays exactly where it was; only the mirrored off-diagonal panels go." },
      ],
      explanation:
        "Symmetry is redundancy: corner=True keeps every distinct pair once. Combined with vars= it is how a 15-column monster becomes a readable instrument.",
    },
    {
      id: "c-07-q3",
      prompt: "A table has 8 numeric columns. Roughly how many unique scatter panels will a full pairplot draw, and what is the honest response?",
      options: [
        { text: "8 x 7 / 2 = 28 unique pairs — borderline; select with vars= or triage with a correlation heatmap first", correct: true, feedback: "Correct — the quadratic budget is biting; pruning beats printing." },
        { text: "8 panels, one per column", correct: false, feedback: "One per column would be distributions only; pairs are column COUNTS taken two at a time." },
        { text: "64 panels, every combination including self-pairs", correct: false, feedback: "Self-pairs become the diagonal and order does not matter — 64 overcounts by both." },
        { text: "3 panels, because seaborn caps the grid", correct: false, feedback: "There is no cap — seaborn will happily render every pair you feed it, which is exactly the trap." },
      ],
      explanation:
        "Count before you plot: n(n-1)/2 unique pairs. 8 columns = 28 panels; 15 = 105. The response that scales is selection, not pagination.",
    },
  ],
};
