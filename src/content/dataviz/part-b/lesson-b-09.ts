/**
 * PART B · LESSON b-09 — "Annotations"
 *
 * a-07 wrote the claim title; b-09 points at the evidence. ax.annotate
 * (xy + xytext + arrowprops), reference lines (axhline/axvline),
 * shaded spans (axvspan), and the annotation budget — a chart's
 * attention is a spendable resource, and every arrow is a purchase.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q4, REVENUE_2024, months } from "../datasets";

const visitors = [
  1180, 1240, 1310, 1290, 1350, 2100, 2260, 1220, 1280, 1330, 1300, 1380,
  2190, 2340, 1290, 1360, 1410, 1390, 1440, 2280, 2410, 1350, 1420, 1470,
  1510, 1460, 2340, 2520,
];
const dayLabels = Array.from({ length: 28 }, (_, i) => `${i + 1}`);

export const LESSON_V_B_09: DataVizLesson = {
  slug: "b-09",
  title: "Annotations",
  minutes: 20,
  summary:
    "ax.annotate with xy, xytext and arrowprops; reference lines with axhline and axvline; shaded spans with axvspan — plus the annotation budget that keeps the pointing honest.",
  tool: "matplotlib",
  objectives: [
    "Point an arrow at a data coordinate with ax.annotate — xy is the tip, xytext is the text",
    "Add reference lines (axhline, axvline) and shaded spans (axvspan) that give readings a yardstick",
    "Place free text with ax.text in data coordinates and control its size and color",
    "Apply the annotation budget: every arrow spends reader attention, so each one must buy a finding",
  ],
  why: "A claim title (a-07) says what the chart shows; an annotation shows WHERE. 'The steepest climb is October to November' is a sentence a reader then has to verify by hunting the line — the same sentence with an arrow already touching the segment is verified at a glance. Annotations are how a chart talks about itself: reference lines give readings a yardstick ('above/below average'), shaded spans mark events ('the campaign ran these two weeks'), and arrows pin prose to ink. But the mechanism has a cost — every arrow, line and box competes for the same attention your data needs — so this lesson teaches the mechanics AND the budget that keeps them serving the argument instead of becoming it.",
  blocks: [
    {
      kind: "text",
      text: "The workhorse is `ax.annotate`. It takes two coordinates: **xy** — the data point the arrow should touch — and **xytext** — where the text itself sits (by default in the same data coordinates). The `arrowprops` dict wires the two together. One call, and the prose lands on the evidence.",
    },
    {
      kind: "code",
      title: "An arrow that touches the evidence",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(months, revenue, color="#0d9488", marker="o")

ax.annotate("steepest climb: +18 k$",
            xy=(10, 171), xytext=(6.0, 180),          # tip, then text
            arrowprops=dict(arrowstyle="->", color="#334155"))

ax.set(title="Monthly revenue, 2024 — the year accelerated late",
       ylabel="revenue (k$)")
plt.show()`,
      note: "xy=(10, 171) touches the October point (category index 10, value 171) — the label names the +18 k$ climb from it into November. xytext=(6.0, 180) floats the text up-left of the tip, in the chart's empty space.",
      produces:
        "The line chart below with one arrow: the tip touches the October point at 171, the text states the +18 k$ November jump it is arguing for.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly revenue, 2024 — the year accelerated late",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "revenue (k$)",
        caption: "In matplotlib, an arrow runs from the label to the October point (171) — the engine renders the data; the annotation is the listing's contribution.",
        showLegend: false,
      },
      why: "The chart alone would make a careful reader find the steep segment themselves; the annotation hands them the finding and the location in one glyph. That is the entire value proposition: verification without hunting.",
    },
    { kind: "heading", text: "Reference lines and shaded spans" },
    {
      kind: "text",
      text: "Some annotations do not point — they **measure**. `ax.axhline(y)` draws a horizontal line across the whole axis (the average, the target, the break-even), turning every reading into above-or-below. `ax.axvline(x)` marks a moment in time (a launch, a policy change). `ax.axvspan(x0, x1)` shades a window — a campaign, a holiday week — and unlike a line it can carry a light color that reads as background, not data. These three calls turn a chart from 'what happened' into 'what happened against what was expected'.",
    },
    {
      kind: "code",
      title: "The traffic chart with its yardsticks",
      language: "python",
      code: `import matplotlib.pyplot as plt

visitors = [1180, 1240, 1310, 1290, 1350, 2100, 2260,
            1220, 1280, 1330, 1300, 1380, 2190, 2340,
            1290, 1360, 1410, 1390, 1440, 2280, 2410,
            1350, 1420, 1470, 1510, 1460, 2340, 2520]
mean_v = sum(visitors) / len(visitors)            # 1622

fig, ax = plt.subplots(figsize=(9, 4.2))
ax.plot(visitors, color="#0d9488")
ax.axhline(mean_v, color="#94a3b8", linestyle="--", linewidth=1)
ax.axvspan(4.5, 6.5, color="#fde68a", alpha=0.35)  # first weekend
ax.annotate("weekend spike", xy=(6, 2260), xytext=(9.5, 2350),
            arrowprops=dict(arrowstyle="->", color="#334155"))
ax.set(title="Daily visitors — the week has two shapes",
       xlabel="day", ylabel="visitors")
plt.show()`,
      note: "axhline's dashed grey reads as furniture, not data — solid, saturated colors are reserved for the measurements themselves. The axvspan runs from 4.5 to 6.5, shading day indexes 5 and 6 (days 6-7, the first weekend) in the background.",
      produces:
        "The 28-day traffic line with a dashed mean line at 1622, a pale yellow span over the first weekend, and one arrow on the Sunday peak.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Daily visitors — the week has two shapes",
        categories: dayLabels,
        series: [{ name: "visitors", values: visitors }],
        xLabel: "day",
        yLabel: "visitors",
        showLegend: false,
      },
      why: "The rhythm is the finding: five weekdays near 1200-1500, then a weekend tower over 2000, four times over. The dashed mean at 1622 (the matplotlib overlay) is crossed by every weekend and missed by every weekday — a yardstick makes that visible as 'above/below', not numbers.",
    },
    {
      kind: "text",
      text: "`ax.text(x, y, \"…\")` is annotate without the arrow — free-floating prose at data coordinates, useful for direct labels on bars (b-03's `bar_label` automates the common case) and for small notes in chart corners. The annotation family shares one grammar: **coordinates are data coordinates** by default, which is what keeps the text glued to the evidence when the figure is resized. If you need an axis-fraction position instead (a caption in the top-right corner whatever the data does), pass `transform=ax.transAxes` and use 0-1 fractions.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The annotation budget",
      text: "Attention is a budget. An arrow pointing at the steepest climb BUYS a finding; a second arrow on the second-steepest climb buys less; the fifth arrow is spending the reader's patience on decoration. Before shipping, list your annotations and justify each one against the claim title: does this arrow, line or span shorten the path from the title's claim to its evidence? If not, cut it — annotations that argue with each other for attention are how charts drown.",
    },
    {
      kind: "chart",
      chart: {
        type: "grouped-bar",
        title: "Cold Brew grew +41% while Filter fell −14% — Q1 vs Q4 cups",
        categories: COFFEE_PRODUCTS,
        series: [
          { name: "Q1", values: COFFEE_Q1, color: "#94a3b8" },
          { name: "Q4", values: COFFEE_Q4, color: "#0d9488" },
        ],
        xLabel: "product",
        yLabel: "cups",
      },
      why: "The two findings worth annotating, and only two: Cold Brew's bar pair growing apart (+195 cups, +41.0%), Filter's crossing the wrong way (−43 cups, −14.3%). In matplotlib the arrows would sit on those two pairs; every other pair stays unannotated because the title already carries the claim.",
    },
    {
      kind: "interpretation",
      id: "b-09-i1",
      chart: {
        type: "grouped-bar",
        title: "Cold Brew grew +41% while Filter fell −14% — Q1 vs Q4 cups",
        categories: COFFEE_PRODUCTS,
        series: [
          { name: "Q1", values: COFFEE_Q1, color: "#94a3b8" },
          { name: "Q4", values: COFFEE_Q4, color: "#0d9488" },
        ],
        xLabel: "product",
        yLabel: "cups",
      },
      prompt: "You may attach exactly ONE annotation arrow to this chart, in service of its claim title. Where does it earn its keep?",
      options: [
        {
          text: "On the Cold Brew pair — the +195-cup gap is the chart's largest single change and the title's lead actor; the arrow that pins it buys the most finding per unit of attention",
          correct: true,
          feedback:
            "Correct — biggest change, named in the title, one arrow. Filter's −43 is the runner-up and the title's second clause already names it; a second arrow is affordable only after the first is this good.",
        },
        {
          text: "On Latte, because it is the tallest bar overall",
          correct: false,
          feedback: "Tallest is not the claim — the title argues about CHANGE (growth and decline), and Latte's +59 is the third-largest change. Height is a level; the arrow should pin the argument.",
        },
        {
          text: "One arrow per product — even coverage is fair to every bar",
          correct: false,
          feedback: "Even coverage is even noise: four arrows dilute attention until nothing pops. Fairness is the table's job; the chart's job is the finding.",
        },
        {
          text: "No annotation — the claim title alone is always enough",
          correct: false,
          feedback: "A good title states the claim, but the arrow eliminates the verification hunt. The budget limits annotations, it does not zero them.",
        },
      ],
      explanation:
        "The annotation budget in action: rank the candidate targets by how much they serve the claim, then spend on the top of the list and stop when the marginal arrow stops buying findings.",
    },
    {
      kind: "exercise",
      id: "b-09-e1",
      exerciseKind: "critique",
      prompt:
        "A teammate's chart carries: a claim title, four arrows (one per bar pair), a dashed mean line, a shaded weekend span, a data-source note in ax.text at the top-left, and a second ax.text explaining the color scheme — also top-left, overlapping the first. Audit it against the annotation budget: name what stays, what merges, and what goes.",
      hint: "Count the attention spenders. Which of them serve the claim in the title? Where does the source note conventionally live?",
      options: [
        {
          text: "Stay: the claim title and the mean line (if the title argues above/below average). Merge: the two top-left ax.text notes into one, smaller, bottom-right or in the caption. Go: three of the four arrows — keep only the one pinning the title's lead finding",
          correct: true,
          feedback:
            "Correct — and note the overlaps were the loudest symptom: text colliding with text is the budget crying uncle.",
        },
        {
          text: "Keep everything but fix the overlap by moving one note to the top-right",
          correct: false,
          feedback: "Relocating solves the collision, not the spend — four arrows plus two notes still compete with the data for the same attention.",
        },
        {
          text: "Remove all annotations and let the title carry everything",
          correct: false,
          feedback: "Over-correction: the mean line and one well-placed arrow genuinely shorten the claim-to-evidence path. The budget limits spending; it does not forbid it.",
        },
        {
          text: "Keep all four arrows and delete the claim title instead",
          correct: false,
          feedback: "Backwards — the title is the cheapest communicator on the chart (a-07); arrows are the expensive per-finding instruments.",
        },
      ],
      explanation:
        "The audit order is always the same: title first (cheapest), yardsticks second, one arrow for the lead finding third, everything else negotiable. Overlap is disqualifying wherever it appears.",
    },
  ],
  terms: [
    {
      term: "ax.annotate",
      definition: "The pointing API: xy is the data coordinate the arrow touches, xytext where the text sits, arrowprops styles the connector. The workhorse of evidence-pinning.",
    },
    {
      term: "Reference line",
      definition: "axhline (horizontal, across the axis) or axvline (vertical): a yardstick drawn over the data — the average, the target, the event date. Styled quietly (dashed, grey) so it reads as furniture, not measurement.",
    },
    {
      term: "axvspan",
      definition: "A shaded vertical window — a campaign, an outage, a holiday week. With low alpha it becomes background context; the same color at full strength would masquerade as data.",
    },
  ],
  takeaways: [
    "ax.annotate(xy, xytext, arrowprops) pins prose to evidence: the title claims, the arrow verifies.",
    "axhline/axvline give readings a yardstick; axvspan shades a window — all styled quieter than data so they read as furniture.",
    "Annotation coordinates are data coordinates by default; use transform=ax.transAxes when a note must live at a corner regardless of the data.",
    "Attention is a budget: every arrow must buy a finding, and overlap between annotations is the budget's loudest alarm.",
  ],
  quiz: [
    {
      id: "b-09-q1",
      prompt: "In ax.annotate(\"note\", xy=(10, 171), xytext=(6, 180)), what is xy=(10, 171)?",
      options: [
        {
          text: "The data coordinate the arrow tip touches — x position 10 (the 11th category), y value 171",
          correct: true,
          feedback: "Correct — xy is the tip, in the same coordinates as the data; xytext is where the label floats.",
        },
        {
          text: "The pixel position of the text box",
          correct: false,
          feedback: "Nothing in annotate is pixels by default — both coordinates are data coordinates (x=10, y=171 on the axes).",
        },
        {
          text: "The figure-fraction position of the arrow",
          correct: false,
          feedback: "Figure fractions would need transform=fig.transFigure; the default is data space.",
        },
        {
          text: "The font size and rotation of the label",
          correct: false,
          feedback: "Typography lives in annotate's fontsize/rotation arguments — xy is purely a location.",
        },
      ],
      explanation:
        "xy = the evidence; xytext = the prose. Both in data coordinates by default, which is what keeps the annotation glued to its point when the figure changes size.",
    },
    {
      id: "b-09-q2",
      prompt: "Why style a mean reference line dashed and grey rather than solid and teal?",
      options: [
        {
          text: "Visual rank: reference furniture must sit below the data in salience, or the yardstick competes with what it measures",
          correct: true,
          feedback: "Correct — the a-05 hierarchy applied to annotations: context (dashed grey) beneath measurements (solid, saturated).",
        },
        {
          text: "Dashed lines render faster",
          correct: false,
          feedback: "Performance has nothing to do with it — the choice is about visual precedence.",
        },
        {
          text: "Solid lines are not allowed on axes",
          correct: false,
          feedback: "They are allowed and common — for the data itself. The convention is about relative loudness, not legality.",
        },
        {
          text: "Grey is colorblind-safe and teal is not",
          correct: false,
          feedback: "The palette matters (a-06), but the dashed-grey convention is about hierarchy — a dashed teal line would still outrank its data.",
        },
      ],
      explanation:
        "Everything on a chart has a visual rank. Annotations are context; data is content. Context styled louder than content inverts the chart's argument.",
    },
    {
      id: "b-09-q3",
      prompt: "Which annotation spends reader attention most honestly?",
      options: [
        {
          text: "One arrow pinning the single change the claim title leads with",
          correct: true,
          feedback: "Correct — maximum finding per arrow: the title names it, the arrow locates it, the reader verifies at a glance.",
        },
        {
          text: "Arrows on every bar so no category feels left out",
          correct: false,
          feedback: "Even coverage is noise coverage — four arrows dilute the one finding worth pointing at.",
        },
        {
          text: "A red flashing annotation on the smallest value",
          correct: false,
          feedback: "Salience spent on the least important value is attention misallocated — loudness should track finding size.",
        },
        {
          text: "A methodology paragraph in ax.text across the plot area",
          correct: false,
          feedback: "Methodology belongs in the caption or a footnote below the figure; across the plot it occludes the very ink it explains.",
        },
      ],
      explanation:
        "The honest annotation answers the reader's next question ('where exactly?') about the chart's lead claim — and stops there.",
    },
  ],
};
