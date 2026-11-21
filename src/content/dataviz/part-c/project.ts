/**
 * PART_C_V_PROJECT — "The First-Look Report" (Part C's capstone).
 *
 * One dataset — the shared iris table — carrying the full Part C arc:
 * long-form construction, the pairs-grid first look, distribution
 * evidence, the pooled-vs-faceted regression confrontation, an honest
 * correlation heatmap, and a faceted composition on shared scales —
 * with every figure titled as a finding, because the report is an
 * argument and the code is its evidence.
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_C_V_PROJECT: MiniProject = {
  title: "The First-Look Report — 30 Flowers, One Honest Argument",
  brief:
    "You are handed a new table — the course's shared iris data: 30 flowers, three numeric measurements, two species — and asked for a one-page exploratory report a sceptic can check. The deliverable exercises the full Part C arc: build the long-form DataFrame; take the pairs-grid first look and name the panel that separates the species; put that separation on the record with two distribution instruments; fit the relationship twice (pooled, then per species) and confront the trap in the first fit; read the correlation matrix through an honest cmap; and close with a faceted composition on shared scales. Every chart must be titled as a finding, not a subject — the report is an argument, and every number in it is checkable against the lessons that taught it.",
  requirements: [
    "A long-form iris DataFrame typed as literals — 30 rows, one per flower: sepal_length, sepal_width, petal_length, species (20 setosa, 10 versicolor), using the course's shared numbers",
    "A pairs-grid first look: sns.pairplot with hue=\"species\", the mirrored half dropped (corner=True) and a KDE diagonal — plus one sentence naming the payoff panel with its numbers (the petal islands: setosa at 1.1–1.7 cm, versicolor at 4.0–4.9 cm, a 2.3 cm empty gap)",
    "Distribution evidence for petal_length shown twice — a histogram with kde=True, and an ECDF — with the 0.50 crossing read off the ECDF and the two-island shape stated with counts (20 flowers, then 10)",
    "The regression confrontation: one pooled regplot of sepal_length vs petal_length (slope about 1.42), then sns.lmplot with col=\"species\" (within-species slopes about 0.10 and 0.06) — and a two-sentence explanation of why the first number is a between-group artifact, not a within-species trend",
    "A correlation heatmap with a diverging cmap anchored at zero — vmin=-1, vmax=1, center=0, annot=True, fmt=\".2f\" — with the 0.75 (sepal length × petal length) and −0.53 (sepal width × petal length) cells named in the caption",
    "A faceted composition (displot or catplot with col=\"species\") left on the default shared y-axis, finished with set_axis_labels / set_titles — and every figure titled as a claim, not a subject",
  ],
  steps: [
    "Type the DataFrame from the datasets.ts literals; verify 30 rows and the species counts (20 setosa, 10 versicolor) before plotting anything.",
    "Take the first look: pairplot with hue=\"species\", corner=True, diag_kind=\"kde\"; scan for the panel that separates the colors best, and write the sentence that names it with numbers.",
    "Put the separation on the record: petal_length as a histogram with a KDE overlay, then as an ECDF — read the median crossing off the ECDF and state the empty gap with counts.",
    "Fit the relationship twice: the pooled regplot first (quote its slope), then lmplot(col=\"species\"); write the confrontation — which number is the artifact, and how the faceted fits prove it.",
    "Build the correlation matrix, heat it with the diverging setup, and caption the two off-diagonal cells that carry the news (0.75 and −0.53).",
    "Compose the faceted view on the shared default scale; finish the grid with set_axis_labels and set_titles.",
    "Read the report cold: every title a finding, every number checkable against the lessons — then cut anything a sceptic would ask to see and you cannot show.",
  ],
  starter: `import pandas as pd
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

# 1. The first look — the pairs grid (hue, no mirror, KDE diagonal)
# TODO: sns.pairplot(...)

# 2. The separation on the record — petal_length twice
# TODO: histogram + KDE
# TODO: ECDF (read the 0.50 crossing; state the gap with counts)

# 3. The regression confrontation
# TODO: pooled regplot (quote its slope)
# TODO: lmplot with col="species" (quote both within-species slopes)

# 4. The correlation matrix, heated honestly
# corr = iris.corr(numeric_only=True)
# TODO: diverging cmap, vmin/vmax/center, annot, fmt

# 5. The faceted composition on the shared scale
# TODO: displot/catplot with col="species", then set_axis_labels / set_titles

# 6. Read the report cold: every title a finding, not a subject.
`,
  concepts: [
    "pairplot",
    "regplot and lmplot",
    "heatmap and cmap honesty",
    "faceting and sharey",
    "titles as claims",
  ],
  extension:
    "Add the second relationship lens: relplot of sepal_length vs sepal_width with hue=\"species\" — then reconcile what you see with the near-zero pooled correlation (about −0.04): write the paragraph on when a correlation cell hides the same group structure the pooled slope did. The between/within trap, met twice.",
};
