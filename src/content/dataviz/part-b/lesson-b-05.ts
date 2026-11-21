/**
 * PART B · LESSON b-05 — "Scatter Plots"
 *
 * ax.scatter: position plus size and color as spare encodings, alpha
 * as the overplotting cure, and the iris clusters as the payoff.
 * Code blocks are real matplotlib; each pairs with a live engine
 * chart of the SAME points.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  IRIS_PETAL_LENGTH,
  IRIS_SEPAL_LENGTH,
  IRIS_SEPAL_WIDTH,
  IRIS_SPECIES,
} from "../datasets";

export const LESSON_V_B_05: DataVizLesson = {
  slug: "b-05",
  title: "Scatter Plots",
  minutes: 25,
  summary:
    "ax.scatter plots every observation as a point, with size and color as spare channels, alpha as the overplotting cure, and the iris clusters as the payoff.",
  tool: "matplotlib",
  objectives: [
    "Draw a scatter plot with ax.scatter and say what each point represents",
    "Add a third variable as a color ramp (c= plus cmap=) with a colorbar",
    "Use alpha and marker size so that stacked points reveal density instead of hiding",
    "Read cluster structure — and name what it does and does not prove",
  ],
  why: "A scatter plot is the only standard chart that shows every observation individually — no mean, no bin, no aggregation between you and the raw rows. That is why it is where discoveries happen: the iris dataset's species separation, the outlier that breaks a regression, the cluster nobody predicted. matplotlib's ax.scatter also carries two encodings beyond position — marker size and color — and this lesson teaches when to spend them, and how alpha rescues the plot when the points stack into ink.",
  blocks: [
    {
      kind: "text",
      text: "`ax.scatter(x, y)` places one mark per observation, its position carrying two measured values. Thirty rows become thirty points — nothing averaged, nothing hidden. That rawness is the scatter plot's superpower and its burden: with more than a few hundred points, the marks start stacking, and the chart needs help (that is `alpha`, below).",
    },
    {
      kind: "code",
      title: "Two measurements, thirty flowers",
      language: "python",
      code: `import matplotlib.pyplot as plt

sepal_length = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4]
petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]
species = ["setosa"] * 20 + ["versicolor"] * 10

colors = ["#0d9488" if s == "setosa" else "#c2410c" for s in species]

fig, ax = plt.subplots(figsize=(7, 5))
ax.scatter(sepal_length, petal_length, c=colors, s=60,
           alpha=0.8, edgecolor="white")
ax.set(title="Iris: petal length vs sepal length",
       xlabel="sepal length (cm)", ylabel="petal length (cm)")
plt.show()`,
      note: "c= takes a color per point (here built from the species name); s= is marker area in points squared.",
      produces:
        "Renders the same thirty points shown below — teal for setosa, orange for versicolor, slight transparency where marks would stack.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Iris: petal length vs sepal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: "Color groups the points by species (hover any dot to confirm its species): setosa sits alone at petal 1.1–1.7 cm, versicolor occupies the 4.0–4.9 band. The vertical gap between the groups is the chart's message.",
    },
    {
      kind: "text",
      text: "Read the structure before touching the styling. The 20 setosa flowers have petals between **1.1 and 1.7 cm**; the 10 versicolor flowers sit between **4.0 and 4.9 cm**. No flower falls in between. On this one measurement the two species separate almost completely — a fact no table of 30 rows announces and no average survives.",
    },
    {
      kind: "interpretation",
      id: "b-05-i1",
      chart: {
        type: "scatter",
        title: "Iris: petal length vs sepal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      prompt: "What structure does this scatter reveal that a table of 30 rows hides?",
      options: [
        {
          text: "Two clusters with an empty lane between them: setosa petals run 1.1 to 1.7 cm while versicolor run 4.0 to 4.9, so petal length alone almost separates the species",
          correct: true,
          feedback:
            "Correct — and within the versicolor band, longer sepals travel with longer petals, a positive within-group relationship the pooled table never shows.",
        },
        {
          text: "A single straight-line relationship across all 30 flowers",
          correct: false,
          feedback: "Inside each cluster yes; across the gap no — one line through both would fit neither group honestly.",
        },
        {
          text: "No relationship between the two measurements",
          correct: false,
          feedback: "Look inside each cluster: sepal 4.4 pairs with petal 1.4, sepal 7.1 with petal 4.9 — a clear positive climb.",
        },
        {
          text: "One species is a data-entry error",
          correct: false,
          feedback: "20 setosa flowers agreeing on 1.1–1.7 cm petals is biology, not typos — clusters this tight are patterns.",
        },
      ],
      explanation:
        "Scatter plots expose structure that summaries hide: clusters, gaps, and correlations within groups. The two-cluster reading IS the famous iris insight — and it is visible before any model is fit.",
    },
    { kind: "heading", text: "Two more channels: size and color" },
    {
      kind: "text",
      text: "Position carries two variables; `s=` (marker **area**) and `c=` with a `cmap=` ramp can carry a third. The rules of restraint come from Part A: area is judged poorly, so use size only for quantities whose rough magnitude matters; and spend a **sequential, perceptually uniform** colormap (like `viridis`) on magnitude ramps — never a rainbow. Three variables is the honest maximum for one scatter plot.",
    },
    {
      kind: "code",
      title: "Three measurements in one plot",
      language: "python",
      code: `import matplotlib.pyplot as plt

sepal_length = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4]
sepal_width = [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
               3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8,
               3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.8, 3.4, 3.1]
petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

fig, ax = plt.subplots(figsize=(7, 5))
sc = ax.scatter(sepal_length, sepal_width, c=petal_length,
                cmap="viridis", s=70, edgecolor="white")
fig.colorbar(sc, ax=ax, label="petal length (cm)")
ax.set(title="Three measurements in one plot",
       xlabel="sepal length (cm)", ylabel="sepal width (cm)")
plt.show()`,
      note: "c=petal_length hands a numeric variable to the ramp; fig.colorbar(sc, ax=ax) documents the mapping. The colorbar is the legend of a magnitude encoding.",
      produces:
        "Renders the same sepal length vs sepal width plane shown below; the petal-length color ramp and its colorbar are matplotlib ink our engine does not paint — our chart groups by species instead.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Iris: sepal width vs sepal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_SEPAL_WIDTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "sepal width (cm)",
      },
      why: "A different pair of axes, a different story: setosa (teal) is short but wide (up to 4.4 cm), versicolor (orange) long but narrow — the two species split diagonally, which is exactly the structure the color ramp in the listing makes visible as a hue gradient.",
    },
    {
      kind: "text",
      text: "Now the stacking problem. Even at 30 points, two pairs of flowers share identical coordinates here — `(5.1, 1.4)` twice and `(5.0, 1.5)` twice — and the second dot paints invisibly over the first. At 5,000 points the chart becomes a solid blot. The cure is `alpha=`: translucent marks accumulate ink where data accumulates, so **density becomes darkness** and the blot turns back into a map.",
    },
    {
      kind: "code",
      title: "Letting the stack show through",
      language: "python",
      code: `import matplotlib.pyplot as plt

# same 30 flowers, deliberately oversized to force stacking
sepal_length = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4]
petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

fig, ax = plt.subplots(figsize=(7, 5))
ax.scatter(sepal_length, petal_length, s=260, alpha=0.30,
           color="#0d9488", edgecolor="none")
ax.set(title="Alpha makes the stack visible",
       xlabel="sepal length (cm)", ylabel="petal length (cm)")
plt.show()`,
      note: "With alpha=0.3, where two flowers overlap the ink doubles — hover the chart below near (5.1, 1.4) and (5.0, 1.5): each hides a twin.",
      produces:
        "Renders the same thirty flowers as the first chart of this lesson — in matplotlib the oversized translucent markers would darken where the twin pairs stack; our engine draws fixed-opacity dots, so treat the blending as the matplotlib effect it is.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "The same 30 flowers — where do twins hide?",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({
          x,
          y: IRIS_PETAL_LENGTH[i],
          label: IRIS_SPECIES[i],
        })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
        caption: "Two pairs of flowers share exact coordinates — (5.1, 1.4) and (5.0, 1.5) — each dot you see there is really two.",
      },
      why: "The stacking lesson made concrete: even 30 points contain hidden twins. Multiply by 200 and only alpha — or binning the chart into a heatmap — keeps the chart honest.",
    },
    {
      kind: "exercise",
      id: "b-05-e1",
      exerciseKind: "choose-chart",
      prompt:
        "You must chart 5,000 delivery records — trip distance versus delivery time — to find where delays concentrate. A colleague suggests ax.scatter at default settings. What single argument change saves the plot, and why?",
      hint: "The failure mode is ink, not information.",
      options: [
        {
          text: "alpha of roughly 0.1 to 0.3 (with a small s) — overlapping translucent marks darken with local density, turning a solid blot into a readable density map",
          correct: true,
          feedback:
            "Correct — alpha spends transparency where the data spends mass. Where the dots stack, the ink deepens, and the delay concentrations become the darkest regions.",
        },
        {
          text: "s=1000 so every point is clearly visible",
          correct: false,
          feedback: "Bigger markers overplot harder — the blot gets blottier. At 5,000 points, less ink per point is the answer.",
        },
        {
          text: "A unique color per point",
          correct: false,
          feedback: "Five thousand hues are indistinguishable and do nothing about stacking — color cannot fix geometry.",
        },
        {
          text: "Plot only the first 30 rows so the chart is clean",
          correct: false,
          feedback: "Clean and dishonest: the question was where 5,000 trips concentrate, and 29 of every 30 records were just deleted.",
        },
      ],
      explanation:
        "Overplotting is the scatter plot's failure mode at scale; alpha (or a switch to a binned heatmap — Part C's subject) is the honest response. Subsetting the data to look tidy is not.",
    },
  ],
  terms: [
    {
      term: "overplotting",
      definition: "Marks painting over marks until the chart becomes a solid blot and density information is lost. The standard cure is alpha; at larger scale, binning.",
    },
    {
      term: "alpha",
      definition: "Mark transparency, 0 (invisible) to 1 (opaque). Stacked translucent marks accumulate ink, so darkness encodes density.",
    },
    {
      term: "colormap (cmap)",
      definition: "The mapping from a numeric variable to color. Sequential perceptually-uniform ramps (viridis) for magnitude; qualitative ramps for categories.",
    },
  ],
  takeaways: [
    "`ax.scatter(x, y)` shows every observation: position carries two variables, raw and unaveraged.",
    "`c=` with `cmap=` (plus a colorbar) adds a third variable; `s=` adds area — spend both sparingly.",
    "At scale, `alpha=` is not decoration: stacked translucent marks turn overplotting into a density map.",
    "Clusters and gaps are the scatter plot's discoveries — the iris species split on petal length is the classic case.",
  ],
  quiz: [
    {
      id: "b-05-q1",
      prompt: "In `ax.scatter(sepal_length, petal_length)`, what does each point represent?",
      options: [
        {
          text: "One flower: its sepal length as x and its petal length as y",
          correct: true,
          feedback: "Correct — one mark per observation, two measured values carried by position.",
        },
        {
          text: "One species, averaged over its flowers",
          correct: false,
          feedback: "Nothing is averaged in a scatter plot — that rawness is its whole point.",
        },
        {
          text: "The relationship's correlation coefficient, drawn",
          correct: false,
          feedback: "A single number would be one point; thirty points show far more than any correlation summarizes.",
        },
        {
          text: "One month of measurements",
          correct: false,
          feedback: "There is no time axis here — rows are flowers, not periods.",
        },
      ],
      explanation:
        "The mark-to-row correspondence is what makes scatter plots exploratory gold: every observation stays individually visible.",
    },
    {
      id: "b-05-q2",
      prompt: "What does `c=petal_length, cmap=\"viridis\"` add to a scatter plot?",
      options: [
        {
          text: "A third numeric variable, encoded as position along a perceptually uniform color ramp",
          correct: true,
          feedback: "Correct — the colorbar documents the mapping, and viridis keeps equal data steps looking equal.",
        },
        {
          text: "Random decorative colors from the viridis palette",
          correct: false,
          feedback: "The colors are a function of petal length — an encoding, not decoration.",
        },
        {
          text: "Marker size scaled to petal length",
          correct: false,
          feedback: "Size is s=; c= and cmap= control color, a different (and better-judged) channel.",
        },
        {
          text: "A best-fit line colored viridis",
          correct: false,
          feedback: "No line is drawn — the call encodes a third variable into the existing marks.",
        },
      ],
      explanation:
        "c= plus cmap= is the canonical way to spend the color channel on magnitude — and the colorbar is what makes the encoding readable rather than pretty.",
    },
    {
      id: "b-05-q3",
      prompt: "Why does `alpha=0.25` rescue a 5,000-point scatter plot?",
      options: [
        {
          text: "Overlapping translucent marks accumulate ink, so dark regions reveal where points concentrate",
          correct: true,
          feedback: "Correct — alpha converts overplotting from a bug into a density encoding.",
        },
        {
          text: "It randomly thins the points to a manageable count",
          correct: false,
          feedback: "Every point still draws; transparency blends them, it deletes nothing.",
        },
        {
          text: "It draws the points faster",
          correct: false,
          feedback: "A performance detail at best — the reason is perceptual, not computational.",
        },
        {
          text: "It makes outliers more colorful",
          correct: false,
          feedback: "Outliers keep their hue; what changes is that crowded regions stop hiding as one solid blob.",
        },
      ],
      explanation:
        "With opaque marks, 5,000 points yield a blot; with alpha, the blot becomes shading whose darkness is proportional to local density — structure returns.",
    },
  ],
};
