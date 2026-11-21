/**
 * PART_C_V_EXERCISES — the tiered practice battery for Part C
 * (Seaborn), 8 items: 2 beginner, 3 intermediate, 3 advanced, spanning
 * the eight lessons (c-01..c-08). Code is illustrative seaborn/pandas —
 * the same long-form grammar the lessons teach; every dataset is a
 * datasets.ts constant and every number in a solution is the computed
 * truth of that shared data. The battery keeps the course's spine:
 * most exercises pair the code task with the reading discipline — what
 * the finished chart argues, not just how it was made.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_C_V_EXERCISES: Exercise[] = [
  {
    id: "c-vb1",
    tier: "beginner",
    title: "One call, four totals",
    prompt:
      "Build the annual-cups bar chart the seaborn way from the course's shared coffee numbers: a long-form DataFrame of 16 rows (one per product-quarter — Espresso 412/438/451/489, Latte 588/612/596/647, Filter 301/286/274/258, Cold Brew 476/542/618/671), then a single sns.barplot call whose bars come out as the annual totals (1790, 2443, 1119, 2307). Which parameter makes the bars show totals instead of means? And in one sentence: what does the thin whisker seaborn draws on each bar encode?",
    hint: "estimator=\"sum\" hands the aggregation to the plot call; the whisker is a 95% bootstrap confidence interval for the plotted statistic.",
    starter: `import pandas as pd
import seaborn as sns

coffee = pd.DataFrame({
    "product": ["Espresso"]*4 + ["Latte"]*4 + ["Filter"]*4 + ["Cold Brew"]*4,
    "quarter": ["Q1", "Q2", "Q3", "Q4"] * 4,
    "cups":    [412, 438, 451, 489,   # Espresso, Q1..Q4
                588, 612, 596, 647,   # Latte
                301, 286, 274, 258,   # Filter
                476, 542, 618, 671],  # Cold Brew
})

# TODO: one call — bars as ANNUAL totals, not means
`,
    solution: `sns.barplot(data=coffee, x="product", y="cups", estimator="sum")

# estimator="sum" tells seaborn to collapse the four quarter rows per
# product into one total — the aggregation travels with the chart, so
# the numbers and the ink cannot drift apart (the matplotlib way would
# have you pre-compute 1790, 2443, 1119, 2307 yourself and trust your
# own arithmetic). The whisker on each bar is a 95% bootstrap
# confidence interval for that plotted statistic — seaborn resamples
# the rows behind the bar to show how much the total itself wobbles.
# Note the storey: barplot is axes-level (it draws onto any matplotlib
# axes you hand it); the figure-level route to the same view is
# sns.catplot(..., kind="bar").`,
    concepts: ["long-form data", "estimator", "confidence interval"],
  },
  {
    id: "c-vb2",
    tier: "beginner",
    title: "Five departments, five panels",
    prompt:
      "The employee survey lives as 60 long-form rows (department, satisfaction) — twelve responses each for Engineering, Sales, Support, Design and Ops. You want the satisfaction histogram split into one small panel per department, five panels side by side, in a single call. Write that call, name the parameter that makes the split possible, and explain in one sentence why sns.histplot could not do this job alone — then add what the pooled (unsplit) histogram hides that the five panels reveal.",
    hint: "col= faceting is the figure-level dispatchers' exclusive privilege — displot, not histplot.",
    starter: `import pandas as pd
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

# TODO: one call — the histogram, one panel per department
`,
    solution: `sns.displot(data=survey, x="satisfaction", bins=7, col="department")

# col= is the figure-level privilege: displot builds its own figure,
# returns a FacetGrid, and multiplies the one histogram into five
# panels — one per department value. histplot is axes-level and has no
# col= parameter; you would have to hand-manage five matplotlib axes
# to fake it. The pooled version (drop col=) peaks at a score of 6 (16
# of 60 responses) and hides every department difference — the split
# is what makes Design's 7-9 cluster and Support's 3-6 floor visible
# at all.`,
    concepts: ["figure-level functions", "faceting", "displot"],
  },
  {
    id: "c-vi1",
    tier: "intermediate",
    title: "The percentile that survives an audit",
    prompt:
      "An SLA auditor asks for the 90th percentile of sepal length across the course's 30 iris flowers, and will challenge any parameter choice you made. (1) Write the one seaborn call whose reading has no bins and no bandwidth to defend. (2) Read it honestly: state what fraction of flowers sit at or below 5.0 cm and at or below 6.0 cm, where the median crossing sits, and where the curve finishes climbing. (3) Name the number you would quote the auditor, and explain why this display survives scrutiny where a histogram would not.",
    hint: "ecdfplot: height = fraction of observations at or below x — steep where data piles up, flat where it is absent.",
    starter: `import pandas as pd
import seaborn as sns

iris = pd.DataFrame({
    "sepal_length": [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                     5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                     6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4],
    "species": ["setosa"] * 20 + ["versicolor"] * 10,
})

# TODO: the parameter-free distribution display, then read it
`,
    solution: `sns.ecdfplot(data=iris, x="sepal_length")

# Reading: the curve stands at 0.40 at x = 5.0 (12 of 30 flowers) and
# 0.80 at x = 6.0 (24 of 30); the median is the 0.50 crossing, about
# 5.25 cm; past the tallest flower (7.6 cm) the curve is flat at 1.0 —
# everyone accounted for. The 90th percentile is read across from
# 0.90 on the y-axis: about 6.4 cm. The auditor has nothing to
# challenge because the ECDF is the raw order statistics, drawn — no
# bins, no smoothing kernel, no knobs. Change a bin width and a
# histogram's reading moves; the ECDF has no bin width, which is
# exactly why it is the instrument for defensible percentiles.`,
    concepts: ["ECDF", "percentiles", "interpretation discipline"],
  },
  {
    id: "c-vi2",
    tier: "intermediate",
    title: "Twin means, different companies",
    prompt:
      "A dashboard reduces the survey to bars of department means, and the CEO reads Sales (5.92) and Ops (6.00) as 'basically the same, no action needed'. Using the shared survey data (Sales responses span 4 to 8; Ops sits at 5 to 7; twelve responses each), rebuild the comparison with the catplot kind that reveals what the bars hid — quartiles with the mean marked alongside — and then write the two sentences you would put under the new chart, stating exactly which claim the new encoding licenses and which the old one suppressed.",
    hint: 'kind="box" with showmeans=True — the box carries the middle half of responses, the marker carries the mean.',
    starter: `import pandas as pd
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
)

# TODO: the kind that shows shape, with the mean marked
`,
    solution: `sns.catplot(
    data=survey, x="department", y="satisfaction",
    kind="box", showmeans=True, height=5, aspect=1.5,
)

# Under the chart: "Sales and Ops share a mean (5.92 vs 6.00), but
# their distributions do not match — Sales responses run 4 to 8,
# containing both a 4 and an 8, while Ops never leaves 5 to 7."
# The licensed claim is about SHAPE, which the box carries and the bar
# suppressed; the suppressed claim was 'no action needed', a decision
# resting on one statistic. Note also that the mean marker sits below
# Sales' median line (6) — the single 4 tugs the average down, which
# is exactly the disagreement showmeans=True exists to expose.`,
    concepts: ["catplot kind ladder", "box plots", "bar's blind spot"],
  },
  {
    id: "c-vi3",
    tier: "intermediate",
    title: "The line that is no city",
    prompt:
      "The shared temperatures table is 48 long rows (month, city, temp). (1) Draw all four cities' monthly temperatures as lines in one panel, city as color. (2) Then drop the hue from the same call and draw the single aggregated line seaborn produces by default — and read it honestly: state January's value as arithmetic over the four cities (Lisbon 11, Oslo -3, Cairo 19, Singapore 27) and say what the shaded band around the line encodes and where it is widest. (3) One sentence: why is quoting that line as 'the typical temperature' a mistake, and what would you keep within reach instead?",
    hint: 'relplot(kind="line") aggregates repeated x values with the estimator (mean by default) and wraps the result in a bootstrap CI band.',
    starter: `import pandas as pd
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

# TODO: 1) four lines, one panel, city as color
# TODO: 2) the same call with hue dropped — the aggregated line
`,
    solution: `sns.relplot(data=temps, x="month", y="temp", hue="city", kind="line")
sns.relplot(data=temps, x="month", y="temp", kind="line")   # hue dropped

# Reading the aggregated line: January's point is (11 + -3 + 19 + 27)
# / 4 = 13.5 °C — arithmetic, not weather. No city experienced 13.5
# °C in January; the line is a summary with no members. The band is a
# 95% bootstrap confidence interval for each monthly mean over the
# four city values, and it is widest exactly where the members
# disagree most (Oslo at -3 against Singapore at 27). Quoting it as
# 'typical' fails because the middle of that range belongs to nobody —
# keep the four-line view (or at least the band) within reach before
# quoting the summary.`,
    concepts: ["relplot", "estimator", "aggregated lines"],
  },
  {
    id: "c-va1",
    tier: "advanced",
    title: "A slope you can defend",
    prompt:
      "The course's shared traffic table (28 days: visitors 1180-2520, signups 23-58) is in front of you and a stakeholder wants 'the conversion number'. (1) Draw the fitted view with the points at alpha 0.6 and the fitted line in crimson — the two pass-through dictionaries. (2) State the claim with its numbers: the rate, the tightness, and the two clumps visible on the x-axis. (3) The stakeholder then asks for predicted signups at 5000 visitors per day — give the honest answer: the number the line produces, the observed range it comes from, and what kind of statement a value outside that range is.",
    hint: "scatter_kws and line_kws forward to matplotlib; the model is honest only inside the 1180-2520 visitors you observed.",
    starter: `import pandas as pd
import seaborn as sns

traffic = pd.DataFrame({
    "visitors": [1180, 1240, 1310, 1290, 1350, 2100, 2260, 1220, 1280, 1330,
                 1300, 1380, 2190, 2340, 1290, 1360, 1410, 1390, 1440, 2280,
                 2410, 1350, 1420, 1470, 1510, 1460, 2340, 2520],
    "signups":  [23, 26, 29, 27, 30, 44, 49, 24, 27, 30, 28, 31, 47, 52, 26,
                 31, 33, 30, 34, 50, 55, 28, 33, 35, 38, 33, 52, 58],
})

# TODO: 1) the fit, points translucent, line crimson
# TODO: 2) the claim with its numbers
# TODO: 3) the honest answer at 5000 visitors
`,
    solution: `sns.regplot(
    data=traffic, x="visitors", y="signups",
    scatter_kws={"alpha": 0.6},
    line_kws={"color": "crimson"},
)

# (2) The claim: signups scale with visitors at roughly 0.023 per
# visitor — about one signup per 44 visitors — with correlation r =
# 0.98 across 28 days; the scatter's two clumps (weekdays around
# 1300, weekends around 2300) are visible structure the fit rides
# through, and the band around the line is a 95% CI for the LINE
# itself — narrowest mid-range, flaring at the edges where the model
# is least sure. (3) At 5000 visitors the line evaluates to about 113
# signups — but no observation supports that number: the data ends at
# 2520. Extrapolation is a business bet, not a measurement: give the
# number if asked, label the leap, and quote the measured range
# (1180-2520) so the stakeholder knows exactly where evidence stops.`,
    concepts: ["regplot", "confidence band", "extrapolation honesty"],
  },
  {
    id: "c-va2",
    tier: "advanced",
    title: "Reshape, reindex, then heat",
    prompt:
      "Two grid jobs, one lesson's discipline. (1) The 48-row temperatures table must become a city-by-month heatmap with the temperature printed in each cell — but pivot_table(index=\"city\", columns=\"month\", values=\"temp\") hands you the months alphabetized (Apr, Aug, Dec...). Write the reshape-fix-heat sequence: calendar restored, annotations formatted as integers, a sequential cmap. (2) Separately, a profit-and-loss matrix arrives (regions as rows, quarters as columns, cells holding signed profit). State the cmap setup that tells the truth for that matrix, and why the sequential choice is the trap. (3) One sentence on where annot=True stops earning its keep.",
    hint: "reindex(columns=months) restores the calendar; sign is information — diverging map anchored at the meaningful zero.",
    starter: `import pandas as pd
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

# TODO: 1) pivot -> fix the month order -> heatmap (annot, fmt, cmap)
# TODO: 2) the P&L matrix's cmap setup, and why sequential is the trap
# TODO: 3) where annot=True stops earning its keep
`,
    solution: `pivot = temps.pivot_table(index="city", columns="month", values="temp")
pivot = pivot.reindex(columns=months)   # undo pivot_table's alphabetical sort
sns.heatmap(pivot, annot=True, fmt=".0f", cmap="crest")

# (1) The reindex is not cosmetic: pivot_table sorts labels
# alphabetically, which destroys the seasonal order the chart exists
# to show. (2) The P&L matrix needs a DIVERGING map with center=0 —
# one hue for profit, the opposite hue for loss, neutral at
# break-even — because sign is information. A sequential ramp maps a
# large loss and a small profit to nearly the same light cell,
# destroying exactly the distinction the matrix exists to show (and
# the rainbow jet map is banned outright). (3) annot=True is a
# small-grid instrument: past roughly ten rows or columns the digits
# become a wall nobody reads — aggregate first, or ship the table
# beside the chart rather than inside it.`,
    concepts: ["pivot_table", "heatmap", "colormap honesty"],
  },
  {
    id: "c-va3",
    tier: "advanced",
    title: "Panels that pay rent",
    prompt:
      "Two panel jobs on the shared numbers. (1) First look at the iris table: a colleague wants 'every column against every other' — write the pairs call that stays readable (hue by species, the mirrored half dropped, a KDE diagonal), then read the grid and name the payoff panel with its numbers: where does the daylight between the two species sit? (2) Composition for the coffee data: build the product-by-quarter small-multiples grid — FacetGrid with a bar chart mapped onto every panel, quarters in calendar order, the shared y left on its default — and state the claim discipline: what the Filter panel alone licenses, and what borrowing the other panels adds.",
    hint: "pairplot(hue=..., corner=True, diag_kind=\"kde\") finds the separating panel; FacetGrid(coffee, col=\"product\") + map(sns.barplot, ..., order=[...]) builds the grid.",
    starter: `import pandas as pd
import seaborn as sns

# iris: 30 rows — sepal_length, sepal_width, petal_length, species
# (the datasets.ts literals from c-07)

coffee = pd.DataFrame({
    "product": ["Espresso"]*4 + ["Latte"]*4 + ["Filter"]*4 + ["Cold Brew"]*4,
    "quarter": ["Q1", "Q2", "Q3", "Q4"] * 4,
    "cups":    [412, 438, 451, 489, 588, 612, 596, 647,
                301, 286, 274, 258, 476, 542, 618, 671],
})

# TODO: 1) the readable pairs grid over iris — and the payoff panel
# TODO: 2) the FacetGrid of quarter bars, one panel per product
`,
    solution: `sns.pairplot(iris, hue="species", corner=True, diag_kind="kde")
# Pruned further when only some columns matter:
# sns.pairplot(iris, vars=["sepal_length", "petal_length"],
#              hue="species", corner=True, diag_kind="kde")

g = sns.FacetGrid(coffee, col="product", col_wrap=4)
g.map(sns.barplot, "quarter", "cups", order=["Q1", "Q2", "Q3", "Q4"])
g.set_axis_labels("quarter", "cups")

# (1) The payoff panel is sepal length vs petal length: setosa sits in
# its own band at petal 1.1-1.7 cm, versicolor at 4.0-4.9 cm, with a
# 2.3 cm empty gap between the islands — the diagonal explains it
# (petal length is two islands), and that panel is the one that
# classifies the species on sight. corner=True keeps each distinct
# pair exactly once; vars= prunes the grid to the columns carrying
# the news (the panel budget is n(n-1)/2 — past ~6 columns, select).
# (2) The Filter facet alone licenses the within-panel claim: a
# monotone slide from 301 to 258 cups, every quarter down, -14%
# across the year. 'The only product in decline' is a cross-panel
# claim that BORROWS the grid — and sharey=True (the default) is what
# makes that borrowing legal: same ink height, same value, every
# panel.`,
    concepts: ["pairplot", "FacetGrid", "sharey"],
  },
];
