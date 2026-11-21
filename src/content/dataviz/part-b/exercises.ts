/**
 * PART_B_V_EXERCISES — the tiered practice battery for Part B
 * (Matplotlib), 8 items: 2 beginner, 3 intermediate, 3 advanced,
 * spanning all twelve lessons (b-01..b-12) — the object model, every
 * core mark, subplots, annotation, styling/customization and the
 * savefig trade-offs. Code is the real matplotlib API as taught; the
 * numbers are the course's shared datasets wherever numbers matter,
 * and every solution pairs the code with the reading it argues for.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_B_V_EXERCISES: Exercise[] = [
  {
    id: "b-vb1",
    tier: "beginner",
    title: "The four moves, and who owns what",
    prompt:
      "Write the complete four-move script for 2024 monthly revenue: create the fig, ax pair at figsize (8, 4.5); draw the twelve months as a teal line with round markers; frame it with ax.set (title 'Monthly revenue, 2024', ylabel 'revenue (k$)'); then write revenue_2024.png at 150 dpi BEFORE the chart reaches the screen. Finish with one sentence each: which object owns the saved file, and which object owns the y-axis label?",
    hint: "fig, ax = plt.subplots(figsize=(8, 4.5)) — everything after it talks to ax; savefig hangs off fig, and it goes before plt.show.",
    starter: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

# TODO: 1) create the Figure and Axes (figsize 8 x 4.5)
# TODO: 2) draw the line on the Axes: teal #0d9488, round markers
# TODO: 3) frame it: ax.set(title=..., ylabel=...)
# TODO: 4) save to revenue_2024.png at 150 dpi, THEN show
`,
    solution: `fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(months, revenue, color="#0d9488", marker="o")
ax.set(title="Monthly revenue, 2024", ylabel="revenue (k$)")

fig.savefig("revenue_2024.png", dpi=150)   # the Figure owns the export
plt.show()                                 # the screen comes last

# Ownership: the FILE belongs to the Figure — savefig, dpi and canvas
# size are Figure-level concerns. The y-label belongs to the Axes,
# which owns every mark, scale, tick and label the reader sees as
# 'the chart'. And the order is not stylistic: plt.show() blocks, and
# some backends finalize and clear figure state on close, so a
# savefig placed after it can write a real file containing a blank
# white rectangle — the bug b-12 names, prevented by the habit b-01
# installs.`,
    concepts: ["object model", "ax.plot", "export order"],
  },
  {
    id: "b-vb2",
    tier: "beginner",
    title: "Bars in the right direction",
    prompt:
      "Two bar charts, two decisions. (1) December cups by product (Espresso 489, Latte 647, Filter 258, Cold Brew 671): vertical bars with each value written just above its bar — one call does the labeling. (2) Median satisfaction for five departments (Design 8.0, Engineering 7.5, Sales 6.0, Ops 6.0, Support 5.0): the names are long, so choose the orientation that keeps every name legible at full size, and name the extra call that puts the leader at the top of the reading order. State the rule that decides orientation.",
    hint: "ax.bar + ax.bar_label(bars, padding=3) for four short names; ax.barh when names are long — and ax.invert_yaxis() flips the reading order.",
    starter: `import matplotlib.pyplot as plt

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
cups = [489, 647, 258, 671]

departments = ["Design", "Engineering", "Sales", "Ops", "Support"]  # sorted by median
medians = [8.0, 7.5, 6.0, 6.0, 5.0]

# TODO: 1) vertical bars + one-call value labels
# TODO: 2) horizontal bars for the long names, leader on top
`,
    solution: `# (1) Short names, one series: vertical bars, values on the ink.
fig, ax = plt.subplots(figsize=(7, 4.5))
bars = ax.bar(products, cups, color="#0d9488", edgecolor="white")
ax.bar_label(bars, padding=3)          # one call labels every bar
ax.set(title="Cups sold in December", ylabel="cups")

# (2) Long names: flip so names read left-to-right at full size.
fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(departments, medians, color="#0d9488")
ax.invert_yaxis()                      # Design, the leader, reads first
ax.set(title="Median satisfaction by department", xlabel="score (1-10)")
plt.show()

# The rule is label space, not taste: vertical bars put names UNDER a
# shared axis where they compete for width — fine for 'Latte', fatal
# for 'Engineering'. When names are long or categories many, barh
# plus a value sort is the construction that ships; bar_label stays
# in reserve for the simple single-series case where labels cannot
# collide.`,
    concepts: ["ax.bar", "ax.barh", "bar_label"],
  },
  {
    id: "b-vi1",
    tier: "intermediate",
    title: "The shape that survives the sweep",
    prompt:
      "A report claims the 30 iris petal lengths form 'a single tight cluster'. Put the claim on trial: draw ax.hist of the values at 4, 10 and 30 bins (edgecolor=\"white\"), and state for each bin count exactly what the reader sees. Then say which claims survive all three views and which were artifacts of the bin count. Finally: what would density=True change about the axis, and when is that scale the honest choice?",
    hint: "At 4 bins the two clusters can weld into one bridging bar; at 10 they separate with five empty bins between (20 flowers, then 10); at 30 the right side shreds into singles.",
    starter: `import matplotlib.pyplot as plt

petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

# TODO: the sweep — one histogram each at 4, 10 and 30 bins
# TODO: read each: what does the reader see, and what survives?
# TODO: what does density=True change, and when do you want it?
`,
    solution: `for nbins in (4, 10, 30):
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(petal_length, bins=nbins, edgecolor="white")
    ax.set_title(f"{nbins} bins")
    plt.show()

# Reading the sweep —
# 4 bins: the two real clusters weld together; the bridging bar is
#   the 'single tight cluster' the report fell for.
# 10 bins: 20 flowers from 1.1-1.86 cm, five empty bins, then 10
#   flowers from 3.86-4.9 cm — bimodal, and the empty lane between
#   the masses is the finding.
# 30 bins: the left mode keeps its peak; the right side shreds into
#   scattered singles — more resolution flattering noise, not truth.
# What SURVIVES all three: bimodality (two masses, one gap). What
# does not: any within-cluster shape claim, and the report's 'single
# cluster' — that existed at one bin count and died at another, so
# it was never a claim about the data. Bin count is a free parameter
# the data did not choose.
# density=True rescales y so each bar's AREA is its fraction of the
# data (areas sum to 1) — the honest choice when comparing histograms
# of different sample sizes or bin widths; the shape is unchanged,
# only the axis's meaning moves.`,
    concepts: ["ax.hist", "bin sweep", "density scale"],
  },
  {
    id: "b-vi2",
    tier: "intermediate",
    title: "Four climates, one scale",
    prompt:
      "Build the small-multiple of the four cities' monthly temperatures: a 1x4 grid with sharey=True, one line per city drawn in a loop over axes.flat, a compact per-city set_title, small rotated month ticks, and a suptitle for the whole figure ('Four climates, one scale'). Then read the grid: state Singapore's and Oslo's ranges, say what the shared scale does to Singapore's line — and explain why a reader comparing cities is betrayed the moment each tile gets a private y-axis.",
    hint: "zip(axes.flat, cities) pairs tiles with groups in reading order; sharey=True is the honesty rule of panels; Singapore never leaves 27-28 °C while Oslo crosses zero.",
    starter: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
cities = ["Lisbon", "Oslo", "Cairo", "Singapore"]
temps = {
    "Lisbon":    [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12],
    "Oslo":      [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2],
    "Cairo":     [19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20],
    "Singapore": [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
}

# TODO: 1x4 grid, sharey=True, wide figsize
# TODO: loop over axes.flat — one line per city, compact titles,
#       rotated small month ticks
# TODO: suptitle for the whole figure
`,
    solution: `fig, axes = plt.subplots(1, 4, figsize=(13, 3.4), sharey=True)
for ax, city in zip(axes.flat, cities):     # .flat walks reading order
    ax.plot(months, temps[city], color="#0d9488")
    ax.set_title(city, fontsize=10)
    ax.tick_params(axis="x", labelrotation=45, labelsize=7)

fig.suptitle("Four climates, one scale", y=1.04)
plt.show()

# Reading: Singapore lives its entire year inside 27-28 °C — on the
# shared -5..35 ruler its line collapses to a flat band, while Oslo
# swings -3 to 17 (below zero three months of the year), Lisbon
# spans 11-25 and Cairo 19-33. The flatness IS the finding: the
# shared scale turns 'how different are these climates' into
# geometry you see before reading a tick. Give each tile a private
# axis and Singapore's auto-zoomed 27-28 wiggle starts to look like
# a climate of genuine swings — panels that look comparable while
# being numerically incomparable are the dishonest chart nobody
# catches, which is why sharey is the rule, not an option. The same
# discipline, industrialized, is Part D's linked-axes dashboards.`,
    concepts: ["small multiples", "sharey", "axes.flat"],
  },
  {
    id: "b-vi3",
    tier: "intermediate",
    title: "Every flower, three channels, and the twins",
    prompt:
      "(1) Draw the 30 iris flowers with ax.scatter: sepal length on x, sepal width on y, and petal length spent on a viridis ramp — c=petal_length, cmap=\"viridis\" — plus a labeled colorbar so the encoding is documented. (2) Read the gradient: what does the color split say about the two species, and which single measurement separates them? (3) On the sepal-length-by-petal-length plane, two pairs of flowers share exact coordinates — (5.1, 1.4) and (5.0, 1.5). Name the one argument that makes stacked marks count themselves, and say how you would scale it for 5,000 delivery records.",
    hint: "fig.colorbar(sc, ax=ax, label=\"petal length (cm)\") documents the ramp; alpha stacks translucent ink so darkness encodes density.",
    starter: `import matplotlib.pyplot as plt

sepal_length = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
                5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
                6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4]
sepal_width = [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
               3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8,
               3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.8, 3.4, 3.1]
petal_length = [1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
                1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
                4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9]

# TODO: 1) the scatter: position x2 + color, with a colorbar
# TODO: 2) read the gradient — what separates the species?
# TODO: 3) the argument that reveals twins, and its 5,000-point scale
`,
    solution: `fig, ax = plt.subplots(figsize=(7, 5))
sc = ax.scatter(sepal_length, sepal_width, c=petal_length,
                cmap="viridis", s=70, edgecolor="white")
fig.colorbar(sc, ax=ax, label="petal length (cm)")
ax.set(title="Three measurements in one plot",
       xlabel="sepal length (cm)", ylabel="sepal width (cm)")
plt.show()

# (2) The ramp splits the cloud into a dark mass and a bright one:
# petals 1.1-1.7 cm (the 20 setosa) sit at one end of the ramp,
# petals 4.0-4.9 cm (the 10 versicolor) at the other. The color
# split says the two species separate almost completely on PETAL
# LENGTH alone — the iris insight, now visible in hue instead of
# position. The colorbar is what makes the encoding readable rather
# than pretty: it documents the mapping.
# (3) alpha: translucent marks accumulate ink, so two flowers at
# (5.1, 1.4) paint twice as dark as one — the stack becomes
# countable. At 5,000 delivery records, alpha of roughly 0.1-0.3
# with a small s turns a solid blot into a density map: where the
# records stack, the ink deepens, and the delay concentrations
# become the darkest regions on the chart.`,
    concepts: ["ax.scatter", "cmap and colorbar", "alpha"],
  },
  {
    id: "b-va1",
    tier: "advanced",
    title: "The stakeholder slide, redesigned twice",
    prompt:
      "A slide lands on your desk with two charts. (a) A pie of nine marketing channels' annual spend — three slices under 4%, two slices exploded. (b) Five bars of the five departments' MEAN satisfaction: Engineering 7.3, Sales 5.9, Support 4.8, Design 8.1, Ops 6.0. Redesign both: name each failure precisely (perceptual, not aesthetic), write the matplotlib construction you would ship, and justify with numbers — for the departments, use the course's 12 survey scores per department and say what your chart reveals that the mean-bars hid.",
    hint: "Nine slices break angle comparison and sub-4% slices are slivers; explode adds area without encoding. Means hide spread — Design's boxes sit wholly above Support's, and Sales and Ops share a median with different disagreement.",
    starter: `import matplotlib.pyplot as plt

# (a) the slide's nine channels, annual spend (k\$) — three slices under 4%
channels = ["Paid search - brand", "Paid search - generic", "Social organic",
            "Social paid", "Email", "Affiliate", "Events", "Podcasts", "Print"]
spend = [184, 96, 210, 88, 74, 22, 40, 12, 8]

# (b) the course's survey scores — 12 per department
responses = {
    "Engineering": [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
    "Sales":       [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
    "Support":     [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
    "Design":      [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
    "Ops":         [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
}

# TODO: redesign (a) — which chart, which construction, and why?
# TODO: redesign (b) — which chart, and what does it reveal?
`,
    solution: `# (a) Failures: nine slices exceed angle perception (ranking 14%
# against 17% by eye fails well before nine); the three smallest
# slices (Affiliate 3%, Podcasts 2%, Print 1% of 734 k\$) are
# unreadable slivers; explode moves area without encoding anything.
# Redesign: sorted horizontal bars — length beats angle, every name
# legible at full size, the ranking preattentive.
pairs = sorted(zip(channels, spend), key=lambda p: p[1])
fig, ax = plt.subplots(figsize=(8, 4.5))
ax.barh([c for c, _ in pairs], [s for _, s in pairs], color="#0d9488")
ax.set(title="Annual marketing spend by channel", xlabel="spend (k\$)")
plt.show()

# (b) Failure: bars of means hide the spread, and the spread is the
# news. Redesign: box plots — medians, IQRs and whiskers per
# department on one shared 1-10 scale.
fig, ax = plt.subplots(figsize=(8, 4.5))
ax.boxplot(list(responses.values()), tick_labels=list(responses.keys()))
ax.set(title="Satisfaction by department", ylabel="score (1-10)")
plt.show()

# What the boxes reveal that the bars hid: complete separation —
# Design's LOWEST response (7) sits above Support's HIGHEST (6),
# medians 8 vs 5; and Sales vs Ops share a median of 6 while their
# boxes differ — one department largely of one mind, the other
# spread across the scale. The mean-bars (8.1 vs 4.8, 5.9 vs 6.0)
# hinted at level and said nothing about either. Same data, honest
# comparison — the means were one number per group pretending to be
# the whole story.`,
    concepts: ["pie range", "ax.boxplot", "redesign"],
  },
  {
    id: "b-va2",
    tier: "advanced",
    title: "Pin the claim, then guard the frame",
    prompt:
      "Build the Q1-vs-Q4 coffee chart as grouped bars (Q1 grey #94a3b8, Q4 teal #0d9488) from np.arange slots and width-0.2 offsets. (1) Add exactly ONE ax.annotate — an arrow pinning the Cold Brew pair with the text '+195 cups (+41%)' — giving xy (the tip) and xytext (the prose), and justify the budget: why Cold Brew and not Latte, and why not one arrow per product? (2) A colleague proposes set_ylim(250, 700) 'to use the space better'. Refuse it with arithmetic: on a 250-base, what does Filter's 301-to-258 become, and what does Cold Brew's real +41% look like? (3) Name the honest alternative when the Q1-to-Q4 deltas are the story.",
    hint: "xy is the arrow tip in data coordinates — the Cold Brew Q4 bar at x = 3 + w/2, height 671; bars argue by length-from-zero, so a 250-base collapses Filter's visible ink 51-to-8 while Cold Brew's gain draws ~1.9x tall.",
    starter: `import matplotlib.pyplot as plt
import numpy as np

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
q1 = [412, 588, 301, 476]
q4 = [489, 647, 258, 671]

x = np.arange(len(products))
w = 0.2

# TODO: 1) grouped bars: Q1 at x - w/2, Q4 at x + w/2, both width w
# TODO: 2) set_xticks(x, products) + legend
# TODO: 3) ONE annotate on the Cold Brew pair: "+195 cups (+41%)"
# TODO: 4) refuse set_ylim(250, 700) — with arithmetic
`,
    solution: `fig, ax = plt.subplots(figsize=(8.5, 4.5))
ax.bar(x - w/2, q1, w, color="#94a3b8", label="Q1")
ax.bar(x + w/2, q4, w, color="#0d9488", label="Q4")
ax.set_xticks(x, products)
ax.set(title="Cold Brew grew +41% while Filter fell -14%", ylabel="cups")
ax.legend()

ax.annotate("+195 cups (+41%)",
            xy=(3 + w/2, 671), xytext=(1.6, 700),
            arrowprops=dict(arrowstyle="->", color="#334155"))
plt.show()

# (1) The budget: Cold Brew's +195 is the chart's largest change and
# the title's lead actor — the arrow buys the most finding per unit
# of attention. Latte's +59 is only the third-largest change
# (Espresso +77, Filter -43), so a Latte arrow would pin a level,
# not the claim. One arrow per product is even coverage — and even
# coverage is even noise: four arrows dilute attention until
# nothing pops.
# (2) The refusal, by arithmetic: on a 250-700 axis every bar is
# severed from zero, so length stops encoding ratio. Filter's
# 301-to-258 — a real 14% decline — draws as 51-to-8 units of ink,
# an 84% collapse. Cold Brew's 476-to-671 — a real 1.41x gain —
# draws as 226-to-421 and LOOKS 1.9x tall. That is the a-08
# truncated-axis device built by hand: disclosing the limits cannot
# restore the baseline a bar's geometry requires.
# (3) The honest alternative: change the mark, not the base — a bar
# chart of the four deltas (+77, +59, -43, +195) from a zero
# baseline, or a dot/slope view of Q1-to-Q4 per product. The deltas
# deserve their own encoding, not a smuggled axis.`,
    concepts: ["ax.annotate", "annotation budget", "axis honesty"],
  },
  {
    id: "b-va3",
    tier: "advanced",
    title: "Three venues, three contracts",
    prompt:
      "One figure — the 10x5.5-inch two-panel revenue-over-expenses chart — must ship to three destinations: (1) the company website's light-grey content cards; (2) the quarterly review deck, whose slide template is dark; (3) a printed appendix in greyscale, placed 6 inches wide. For each destination specify the format, the dpi (with the pixel arithmetic), and the ground treatment; name which export requires its own styling pass and why; and state where fig.savefig sits relative to plt.show, with the failure mode that ordering prevents.",
    hint: "pixels = figsize x dpi; transparent=True lets the host ground show through; a dark slide is a re-dress, not a re-export; savefig before show or risk the blank rectangle.",
    starter: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue  = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]

fig, axes = plt.subplots(2, 1, figsize=(10, 5.5), sharex=True)
axes[0].plot(months, revenue, color="#0d9488")
axes[0].set_title("Revenue")
axes[1].plot(months, expenses, color="#c2410c")
axes[1].set_title("Expenses")
fig.suptitle("2024: revenue outran expenses all year")

# TODO: three exports — format, dpi, ground treatment for each
# TODO: which one needs its own styling pass, and why?
# TODO: where does savefig sit relative to plt.show?
`,
    solution: `# (1) Website (light-grey cards): SVG — vector stays sharp at every
# pixel density — or a 2x PNG. transparent=True so the card's grey
# shows through, after re-checking the ink's contrast on grey.
fig.savefig("pnl.svg", transparent=True, bbox_inches="tight")

# (2) Deck (dark template): PNG at ~200 dpi -> 10 x 200 = 2,000 px
# wide, which covers a 1920-px slide with room. THIS is the export
# that needs its own styling pass: transparent light-ground ink is
# invisible on a dark slide, so the figure is re-dressed — light
# text, light grid, bright series — a styling change, never just an
# export parameter.
# fig.savefig("pnl_deck.png", dpi=200, facecolor="#0f172a")

# (3) Print appendix (greyscale, 6 inches wide): PDF (or PNG) at
# 300 dpi -> 10 x 300 = 3,000 px wide; placed at 6 inches that is
# 3000/6 = 500 effective dpi — the 300 print bar exceeded with
# room. The palette must survive the photocopier: identity carried
# by labels and position, never hue alone.
# fig.savefig("pnl_print.pdf", dpi=300, bbox_inches="tight")

plt.show()   # last — always after every savefig

# The order is bug prevention: plt.show() blocks, and some backends
# finalize and clear figure state on close, so a savefig placed
# after it can write a real file containing a blank white rectangle
# — bytes exist, chart gone. Save first, show second, and every
# destination's file already exists before the screen takes over.`,
    concepts: ["savefig contracts", "dpi arithmetic", "venue styling"],
  },
];
