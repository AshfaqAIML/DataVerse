/**
 * PART_C_V_ASSESSMENT — the Part C checkpoint (12 questions spanning
 * all eight lessons: the seaborn contract and the two storeys (c-01),
 * the distribution instruments and their knobs (c-02), the catplot
 * kind ladder and what each whisker encodes (c-03), relplot's channels
 * and the estimator (c-04), regression bands and the pooled-fit trap
 * (c-05), heatmaps and cmap honesty (c-06), the pairs grid (c-07),
 * and FacetGrid's sharey contract (c-08)).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_C_V_ASSESSMENT: QuizQuestion[] = [
  {
    id: "c-vas-1",
    prompt: "You need the satisfaction histogram split into five panels, one per department. Which call does the job, and why?",
    options: [
      { text: "sns.displot(data=survey, x=\"satisfaction\", col=\"department\") — col= faceting is the figure-level dispatchers' privilege, and displot builds the grid for you", correct: true, feedback: "Correct — one extra keyword turns the single histogram into five panels; that is the figure-level superpower." },
      { text: "sns.histplot(data=survey, x=\"satisfaction\", col=\"department\")", correct: false, feedback: "histplot is axes-level and has no col= parameter — you would have to hand-manage five matplotlib axes." },
      { text: "sns.catplot(data=survey, x=\"satisfaction\", y=\"department\")", correct: false, feedback: "Wrong family and wrong question: catplot compares a numeric column across categories; the shape of one column per panel is displot's department." },
      { text: "sns.relplot(data=survey, x=\"satisfaction\", y=\"department\", col=\"department\")", correct: false, feedback: "relplot is for relationships between two numeric variables (or a value over time) — not the distribution of one column." },
    ],
    explanation: "Panel-splitting (col=/row=) belongs to the figure-level dispatchers. Choose the family by the question — rel, dis or cat — then let col= multiply it.",
  },
  {
    id: "c-vas-2",
    prompt: "sns.barplot(data=coffee, x=\"product\", y=\"cups\", estimator=\"sum\") receives 16 rows — one per product-quarter. What do the four bars show?",
    options: [
      { text: "The annual total per product, computed by seaborn from the raw rows — 1790, 2443, 1119, 2307 cups", correct: true, feedback: "Correct — long-form rows in, the estimator collapses the four quarters per product into the bar's height." },
      { text: "The mean of each product's four quarters", correct: false, feedback: "That would be the default estimator=\"mean\" — you explicitly asked for the sum." },
      { text: "Sixteen bars, one per row of the DataFrame", correct: false, feedback: "The estimator aggregates the rows per x category — one bar per product remains; sixteen bars would need quarter on the x-axis." },
      { text: "Whatever annual totals you precomputed in an earlier step", correct: false, feedback: "No precomputation exists — the whole point of estimator= is that the aggregation happens inside the plot call, so numbers and ink cannot drift apart." },
    ],
    explanation: "The seaborn contract in one call: raw observations in, statistic computed, chart drawn — one statement, so the numbers and the picture cannot disagree.",
  },
  {
    id: "c-vas-3",
    prompt: "You re-bin the sepal-length histogram from 8 bins to 4. What changes?",
    options: [
      { text: "The story the chart tells — wider bins merged the thin upper tail into the main pile, changing 'mound plus tail' into 'one skewed mound'", correct: true, feedback: "Correct — the data did not move; the lens did, and the lens decides which structure the reader sees." },
      { text: "The data itself — flowers were reassigned to new measurements", correct: false, feedback: "Same 30 values in both charts; only the grouping of the bars changed." },
      { text: "Nothing — histograms show the same shape at any bin count", correct: false, feedback: "Shape is bin-dependent, which is exactly why binwidth is a decision you own rather than a fact about the data." },
      { text: "Only the axis labels — the bars carry the same reading either way", correct: false, feedback: "The substance changes too: in the 8-bin view 10 of 30 flowers sit in one bar with a visible tail; in the 4-bin view the tail folds into the shoulder." },
    ],
    explanation: "Bins are emphasis: too wide merges structure, too narrow turns structure into noise. Own the binwidth because the reader reads your choice as the data's shape.",
  },
  {
    id: "c-vas-4",
    prompt: "On the sepal-length ECDF, the curve stands at 0.80 where x = 6.0 cm. What does that say?",
    options: [
      { text: "80% of the flowers — 24 of 30 — have sepals of 6.0 cm or shorter", correct: true, feedback: "Correct — the ECDF is cumulative: height at x is the fraction of observations at or below x." },
      { text: "80% of flowers have sepals of exactly 6.0 cm", correct: false, feedback: "Exactly-one-value readings come from a bar chart of counts, not from the cumulative curve." },
      { text: "The mean sepal length is 6.0 cm", correct: false, feedback: "The mean does not appear on an ECDF — the curve encodes order and fractions, not averages." },
      { text: "80 flowers were measured", correct: false, feedback: "30 flowers were measured; 0.80 is a fraction of them, not a count." },
    ],
    explanation: "ECDF reading is two moves: pick an x and read the height (fraction at or below), or pick a fraction and read the x (a percentile) — with no bins or bandwidth to defend.",
  },
  {
    id: "c-vas-5",
    prompt: "In a seaborn box plot of satisfaction by department, what does the box itself encode?",
    options: [
      { text: "The middle half of the responses — the interquartile range, with the median as the line inside it (and showmeans=True adds the mean as a marker)", correct: true, feedback: "Correct — the box is the IQR; whiskers reach toward the extremes within 1.5 IQR, and points beyond are drawn as outlier dots." },
      { text: "The full range from each department's minimum to its maximum", correct: false, feedback: "Whiskers reach only to the most extreme values within 1.5 IQR of the box; anything beyond is flagged as an outlier dot, not hidden in the whisker." },
      { text: "A 95% confidence interval for the department's median", correct: false, feedback: "The CI whisker belongs to kind=\"bar\" (and it is for the mean); the box is the spread of responses, not an uncertainty range." },
      { text: "The standard deviation of the responses", correct: false, feedback: "sd is a single-number summary available on bars via errorbar=\"sd\"; the box draws quartiles, which is richer than any one statistic." },
    ],
    explanation: "The box IS the five-number summary's middle: compare departments by box overlap — complete separation (Design vs Support) licenses strong claims; partial overlap does not.",
  },
  {
    id: "c-vas-6",
    prompt: "What does the thin whisker on each bar of sns.catplot(kind=\"bar\") encode?",
    options: [
      { text: "A 95% bootstrap confidence interval for that group's mean — resampled uncertainty of the average itself", correct: true, feedback: "Correct — the default whisker answers 'how sure are we about this mean?' by resampling the observed responses many times." },
      { text: "The minimum and maximum response in the group", correct: false, feedback: "That is the whisker's job in a BOX plot; the bar's whisker is about the stability of the mean, not the spread of individuals." },
      { text: "The standard deviation of the responses", correct: false, feedback: "sd is available (errorbar=\"sd\") but it is not the default — the default is the bootstrap CI for the mean." },
      { text: "The number of responses behind the bar", correct: false, feedback: "Sample size is not drawn — though a wide CI usually hints at a small one." },
    ],
    explanation: "The bar's whisker expresses uncertainty about the AVERAGE, not the spread of responses — the box's department. Confusing the two is how dashboards misread their own error bars.",
  },
  {
    id: "c-vas-7",
    prompt: "The four-city temperatures are drawn as one line with no hue split, and January's point reads 13.5 °C. The honest reading is:",
    options: [
      { text: "A summary of four very different cities — Lisbon 11, Oslo -3, Cairo 19, Singapore 27 — arithmetic, not weather: no city experienced 13.5 °C in January", correct: true, feedback: "Correct — the estimator collapsed four rows into one point; the line describes the group and belongs to none of its members." },
      { text: "The typical January temperature in these cities", correct: false, feedback: "'Typical' is exactly what a mean is NOT when the members sit at -3 and 27 — the middle of that range belongs to nobody." },
      { text: "Evidence that all four cities have similar climates", correct: false, feedback: "The mean line hides the spread it summarizes; the four separate lines are what show how dissimilar the climates are." },
      { text: "Lisbon's January temperature, approximately", correct: false, feedback: "Lisbon's January is 11 °C; the point is the mean over all four cities, which is a different (and here, unclaimed) quantity." },
    ],
    explanation: "Aggregated lines are summaries with no members: name what the line summarizes, and keep the band — or the un-aggregated view — within reach before quoting it as a typical case.",
  },
  {
    id: "c-vas-8",
    prompt: "What does the shaded band around the fitted line in regplot (and lmplot) represent?",
    options: [
      { text: "A 95% confidence interval for the fitted line itself — where the true average y at each x plausibly sits; narrow mid-range, flaring at the edges", correct: true, feedback: "Correct — it is the line's uncertainty: tightest where data is dense, and its flaring ends are the model confessing where it is least sure." },
      { text: "The range containing 95% of the individual data points", correct: false, feedback: "That would be a prediction interval — wider than the CI band; individual points routinely sit outside the band seaborn draws." },
      { text: "The area where extrapolation is safe", correct: false, feedback: "The opposite signal: the band widens at the edges, flagging exactly where trust should thin — and beyond the observed x there is no band at all." },
      { text: "The rendering margin of the plotting library", correct: false, feedback: "The band is statistics, not rendering tolerance — it comes from the bootstrap over your data." },
    ],
    explanation: "CI-for-the-line versus prediction-range-for-points is the distinction to keep: 'the average is around here' and 'a new point will land around here' are different claims, and seaborn draws the first.",
  },
  {
    id: "c-vas-9",
    prompt: "A colleague fits ONE regression line through all 30 iris flowers (both species together) and reports: 'petal length grows about 1.4 cm for every extra cm of sepal length, within a species.' What is wrong with that sentence?",
    options: [
      { text: "The 1.42 slope is a between-species number — within setosa the slope is about 0.10 and within versicolor about 0.06; the pooled fit describes the gap between the clusters, not a within-group trend", correct: true, feedback: "Correct — the pooled line slices through the empty space between species. lmplot(col=\"species\") fits each group honestly and the slopes collapse to nearly flat." },
      { text: "Nothing — regression always finds the true relationship", correct: false, feedback: "Regression faithfully describes the rows you give it. Feed it two species and it describes the gap you accidentally asked about." },
      { text: "The mistake is using centimeters instead of inches", correct: false, feedback: "Units rescale the slope's numeric value; the between/within confusion survives any unit." },
      { text: "Thirty flowers is too few for any regression to be meaningful", correct: false, feedback: "Thirty points is plenty to see a nearly flat within-species fit — the issue is which rows fed the line, not how many." },
    ],
    explanation: "An aggregate relationship can be manufactured entirely by group structure. The remedy is cheap and visible: facet the fit with lmplot(col=) and let each group speak with its own line.",
  },
  {
    id: "c-vas-10",
    prompt: "A 30-by-30 correlation matrix arrives, and a colleague proposes sns.heatmap(corr, annot=True, cmap=\"crest\"). What is the honest critique?",
    options: [
      { text: "Two defects: a sequential cmap destroys the sign (−0.9 and +0.9 shade nearly alike), and 900 annotated cells are a wall of digits — use a diverging map anchored at zero (vmin=-1, vmax=1, center=0) and drop the annotation (or aggregate first)", correct: true, feedback: "Correct — both craft rules from the heatmap lesson in one call: color follows the cell type, and annotation is a small-grid instrument." },
      { text: "The only problem is the colormap; annot=True is always an improvement", correct: false, feedback: "Annotation layers precision on pattern — but only while the grid stays small. At 900 cells it is noise nobody reads." },
      { text: "Correlation matrices should never be heatmapped at all", correct: false, feedback: "A correlation grid is the classic heatmap feedstock — the setup, not the tool, is what's wrong here." },
      { text: "annot=True will sort the rows by correlation, so nothing is wrong", correct: false, feedback: "annot prints values into cells; it changes no arrangement. Ordering is yours to control with reindex." },
    ],
    explanation: "cmap follows the cell type — signed values get a diverging map pinned at the meaningful zero — and annot=True earns its keep only on grids of roughly ten rows or columns per side.",
  },
  {
    id: "c-vas-11",
    prompt: "In sns.pairplot(iris, hue=\"species\"), the petal-length panel on the diagonal shows two completely separated islands. What does that license you to claim?",
    options: [
      { text: "Complete separation on one column: every setosa is at or below 1.7 cm, every versicolor at or above 4.0 cm — a 2.3 cm gap with no flower inside it, so petal length alone classifies the species", correct: true, feedback: "Correct — a bimodal diagonal is a finding: the column splits the groups on its own, with counts and a gap you can quote." },
      { text: "That petal length causes the species difference", correct: false, feedback: "The diagonal carries association, not mechanism — a classification claim is not a causal claim." },
      { text: "That every off-diagonal panel separates the species equally well", correct: false, feedback: "The grid's value is finding WHICH panel separates best — the sepal-only panels overlap noticeably; petal length is the payoff column." },
      { text: "That the table has too many columns for a pairs grid", correct: false, feedback: "Three numeric columns is three unique pairs — comfortably inside the n(n-1)/2 panel budget; the instrument is right-sized here." },
    ],
    explanation: "Scan a pairs grid for the panel that separates the colors best — that is the column set worth keeping. A completely separated island, stated with numbers, is the strongest reading the grid offers.",
  },
  {
    id: "c-vas-12",
    prompt: "A dashboard facets satisfaction by department with sharey=False 'so each department fills its panel'. Support's bars now tower as tall as Design's. What went wrong?",
    options: [
      { text: "With sharey=False each panel zooms to its own range — Support's 3-to-6 bars stretch to fill the space Design's 7-to-9 bars also fill, so equal-looking panels now encode unequal values", correct: true, feedback: "Correct — unshared scales re-scale the ink independently: 'tall in its own panel' stops meaning 'tall against the others'. Equal-looking, unequal-valued." },
      { text: "Nothing — each panel is individually accurate", correct: false, feedback: "Every panel IS accurate alone. The grid's promise is cross-panel comparison, and that promise is exactly what sharey=False quietly withdraws." },
      { text: "The mistake was faceting by department at all", correct: false, feedback: "Faceting is right for five groups — the error is the unshared scale, not the grid." },
      { text: "The panels just need bigger, louder titles", correct: false, feedback: "Labels cannot repair a broken scale — ink height is the encoding, and it is the encoding that now lies." },
    ],
    explanation: "sharey=True is the grid's contract: same ink height, same value, every panel. Break it only for shape questions (peaks, timing, direction) — and label the choice loudly.",
  },
];
