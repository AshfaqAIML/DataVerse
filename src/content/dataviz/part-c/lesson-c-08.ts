/**
 * PART C · LESSON c-08 — "FacetGrid"
 *
 * sns.FacetGrid + map (and the figure-level col=/row= shortcuts):
 * small multiples as the honest multiplexer — one relationship per
 * panel, one shared y-axis, sharey as the trust decision.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  CITIES,
  COFFEE_PRODUCTS,
  COFFEE_Q1,
  COFFEE_Q2,
  COFFEE_Q3,
  COFFEE_Q4,
  TEMPS,
} from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const osloTemps = TEMPS["Oslo"];
const osloMin = Math.min(...osloTemps);
const osloMax = Math.max(...osloTemps);
const osloRange = osloMax - osloMin;

const filterQuarters = [COFFEE_Q1[2], COFFEE_Q2[2], COFFEE_Q3[2], COFFEE_Q4[2]];
const filterDropPct = Math.round(
  ((COFFEE_Q4[2] - COFFEE_Q1[2]) / COFFEE_Q1[2]) * 100,
);

export const LESSON_V_C_08: DataVizLesson = {
  slug: "c-08",
  title: "FacetGrid",
  minutes: 22,
  summary:
    "Small multiples: one panel per group, every panel on the same axes — FacetGrid plus map, or col=/row= on any figure-level function. The honest multiplexer when an overlay drowns, and sharey the decision that keeps panels comparable.",
  tool: "seaborn",
  objectives: [
    "Build a grid of small panels with sns.FacetGrid plus map, and know the col=/row= shortcuts",
    "Explain small multiples vs overlay: when splitting beats stacking",
    "Say what sharey=True buys — cross-panel comparison on one scale — and when sharey=False is defensible",
    "Label a grid: set_axis_labels and set_titles",
  ],
  why: "An overlay chart multiplexes groups with color: four cities, four lines, one panel — fine. Fourteen departments, fourteen lines: spaghetti. The alternative is the oldest trick in honest graphics: small multiples — the SAME chart repeated once per group, all panels sharing one y-axis, so your eye compares levels across panels without re-reading a single axis. Seaborn's FacetGrid is the machinery: hand it a grouping column and a plotting function, it builds the panels; sharey keeps them honest; set_axis_labels and set_titles finish the job. This lesson builds two grids — city temperatures and product sales — and shows exactly where the overlay stops working and the grid takes over.",
  blocks: [
    {
      kind: "text",
      text: "The temperatures dataset again, with a new question: *what does each city's year look like on its own?* An overlay (c-04) answered 'how do cities compare month by month'; the grid answers 'what is each city's shape, with room to breathe'. The machinery is two lines: construct a `FacetGrid` naming the grouping column, then `map` a plotting function onto every panel.",
    },
    {
      kind: "code",
      title: "FacetGrid + map — the explicit machinery",
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

g = sns.FacetGrid(temps, col="city", col_wrap=2)
g.map(sns.lineplot, "month", "temp")
g.set_axis_labels("month", "temp (°C)")`,
      note: "col_wrap=2 wraps the panels onto two columns (four cities = a 2x2 grid). The shortcut form — sns.relplot(data=temps, x=\"month\", y=\"temp\", kind=\"line\", col=\"city\", col_wrap=2) — produces the same figure in one call.",
      produces:
        "A 2x2 grid of small line panels — one city per panel, each titled with its city name, all sharing the same y-axis.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Without the grid: everything in one panel",
        categories: months,
        series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
        xLabel: "month",
        yLabel: "°C",
      },
      why: "This is what the grid UNMULTIPLEXES: four lines are still readable here, but the comparison logic is all in color lookups — which line is Oslo? At fourteen cities this panel becomes spaghetti; the grid stays legible at fourteen because each panel holds exactly one story.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "One panel of that grid: Oslo",
        categories: months,
        series: [{ name: "Oslo", values: osloTemps }],
        xLabel: "month",
        yLabel: "°C",
        showLegend: false,
        palette: "cool",
      },
      why: `The Oslo panel alone: a dip to ${osloMin} in January and February, a peak of ${osloMax} in July — a ${osloRange}-degree seasonal swing that reads larger here than it did as one line among four, because the whole panel belongs to it. Same data, same shared y-axis, different breathing room.`,
    },
    {
      kind: "heading",
      text: "A second grid: bars by product",
    },
    {
      kind: "code",
      title: "FacetGrid with a bar chart — and the sharey default",
      language: "python",
      code: `coffee = pd.DataFrame({
    "product": ["Espresso"] * 4 + ["Latte"] * 4 + ["Filter"] * 4 + ["Cold Brew"] * 4,
    "quarter": ["Q1", "Q2", "Q3", "Q4"] * 4,
    "cups": [412, 438, 451, 489,    # Espresso, Q1..Q4
             588, 612, 596, 647,    # Latte
             301, 286, 274, 258,    # Filter
             476, 542, 618, 671],   # Cold Brew
})

g = sns.FacetGrid(coffee, col="product", col_wrap=4, sharey=True)
g.map(sns.barplot, "quarter", "cups", order=["Q1", "Q2", "Q3", "Q4"])
g.set_axis_labels("quarter", "cups")`,
      note: "sharey=True is written out here for the teaching moment — facets share the y-axis by default, and that default is the trust that makes cross-panel comparison legal. order= fixes the quarter ordering inside every panel.",
      produces:
        "Four small bar panels — one per product, quarters within — every panel drawn against the same 0-to-700-cup scale.",
    },
    {
      kind: "chart",
      chart: {
        type: "grouped-bar",
        title: "Without the grid: all products in one panel",
        categories: ["Q1", "Q2", "Q3", "Q4"],
        series: COFFEE_PRODUCTS.map((p, i) => ({
          name: p,
          values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
        })),
        xLabel: "quarter",
        yLabel: "cups",
      },
      why: "The multiplexed view: within-quarter comparison is easy (four bars side by side), but each product's own trajectory competes with three neighbors. The grid trades that for one clean line of bars per product — you choose which comparison the reader makes first.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "One panel of that grid: Filter",
        categories: ["Q1", "Q2", "Q3", "Q4"],
        series: [{ name: "cups", values: filterQuarters }],
        xLabel: "quarter",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        palette: "oranges",
      },
      why: `The Filter panel: a clean slide from ${COFFEE_Q1[2]} to ${COFFEE_Q4[2]} cups with no neighboring series competing for the eye — every quarter down, ${filterDropPct}% across the year. On the shared 0-700 scale this reads as what it is: a real but moderate decline, not a collapse.`,
    },
    {
      kind: "heading",
      text: "sharey: the decision that keeps panels honest",
    },
    {
      kind: "text",
      text: "**sharey=True (the default) puts every panel on one y-scale** — a bar that reaches mid-panel in one facet means exactly the same value in every other facet. That is what makes 'compare across panels' legal. sharey=False frees each panel to zoom to its own data: defensible when the question is about SHAPE ('when does each city peak?') and labelled loudly — but in the hands of a dashboard it manufactures drama. Filter's 301-to-258 decline, plotted alone on a 250-to-310 axis, looks like a cliff; on the shared scale it is a slide. Same numbers, different axis, different story — the truncated-axis lesson from Part A, reborn as a grid parameter.",
    },
    {
      kind: "interpretation",
      id: "c-08-i1",
      chart: {
        type: "bar",
        title: "One panel of that grid: Filter",
        categories: ["Q1", "Q2", "Q3", "Q4"],
        series: [{ name: "cups", values: filterQuarters }],
        xLabel: "quarter",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        palette: "oranges",
      },
      prompt: "What does this single facet support claiming about Filter — and what does it need the rest of the grid for?",
      options: [
        {
          text: `It supports: Filter declined every quarter, ${COFFEE_Q1[2]} to ${COFFEE_Q4[2]} cups (${filterDropPct}% across the year). Whether that decline is unusual needs the other panels`,
          correct: true,
          feedback: `Correct — the panel's own claim is complete and numbered; the comparative claim ('only product to decline') borrows the grid. Discipline: state which one you are making.`,
        },
        {
          text: "Filter is the worst product and should be cut",
          correct: false,
          feedback: "This panel contains only Filter — 'worst' is a cross-product comparison, and 'should be cut' is a strategy call. Both live outside this facet.",
        },
        {
          text: "Filter sales fluctuated randomly with no direction",
          correct: false,
          feedback: "Four bars, four declines: 301, 286, 274, 258 — monotone down is the opposite of random.",
        },
        {
          text: "Filter will hit zero by Q3 of next year",
          correct: false,
          feedback: "A linear extrapolation of a -14% year lands far from zero — and c-05's rule applies: outside the observed quarters, you are betting, not measuring.",
        },
      ],
      explanation:
        "Every facet licenses two kinds of claims: within-panel (Filter fell 14%, step by step) and cross-panel (is that normal?). The first is complete here; the second is exactly why the panels share a scale and live side by side.",
    },
    {
      kind: "exercise",
      id: "c-08-e1",
      exerciseKind: "critique",
      prompt:
        "A dashboard facets satisfaction by department with sharey=False 'so each department fills its panel'. Support's panel now towers as tall as Design's, and the CEO concludes the departments look equally satisfied. What went wrong?",
      options: [
        {
          text: "With sharey=False each panel zooms to its own range — Support's 3-to-6 bars stretch to fill space that Design's 7-to-9 bars also fill, so equal-looking panels encode unequal values",
          correct: true,
          feedback: "Correct — unshared axes re-scale the ink independently: 'tall in its own panel' stops meaning 'tall against the others'. Equal-looking, unequal-valued: the definition of the trap.",
        },
        {
          text: "Nothing went wrong — each panel is individually accurate",
          correct: false,
          feedback: "Every panel IS accurate alone. The grid's promise is cross-panel comparison, and that promise is exactly what sharey=False quietly withdraws.",
        },
        {
          text: "The mistake was faceting by department at all",
          correct: false, feedback: "Faceting is right for five groups — the error is the unshared scale, not the grid.",
        },
        {
          text: "The panels need bigger titles instead",
          correct: false,
          feedback: "Labels cannot repair a broken scale — ink height is the encoding, and it is the encoding that now lies.",
        },
      ],
      explanation:
        "Small multiples earn comparison on the back of one shared scale. Unshare it and each panel tells only its own story — fine for shapes, fatal for levels, and always worth a loud label when deliberate.",
    },
  ],
  terms: [
    {
      term: "small multiples",
      definition:
        "The same chart repeated once per group, panels side by side on shared axes — the design that scales comparison to many groups without multiplexing ink.",
    },
    {
      term: "FacetGrid",
      definition:
        "Seaborn's grid machinery: construct with a grouping column (col=/row=, wrapped by col_wrap=), then map a plotting function onto every panel.",
    },
    {
      term: "sharey",
      definition:
        "Whether facets share one y-scale. True (default) makes cross-panel height comparison legal; False zooms each panel to its own data — honest for shapes, treacherous for levels.",
    },
    {
      term: "col_wrap",
      definition:
        "Wraps a one-dimensional panel sequence onto rows of a given width — col_wrap=2 turns four cities into a 2x2 grid.",
    },
  ],
  takeaways: [
    "FacetGrid + map is the explicit form; col=/row= on any figure-level function (relplot, displot, catplot, lmplot) is the shortcut to the same figure.",
    "Overlays multiplex groups into color; grids give each group its own panel — the overlay drowns first as groups multiply.",
    "sharey=True is the grid's contract: same ink height, same value, every panel. Break it only for shape questions, and say so.",
    "Label the grid properly: set_axis_labels for the shared axes, set_titles for the per-panel names.",
  ],
  quiz: [
    {
      id: "c-08-q1",
      prompt: "What is the relationship between sns.FacetGrid(...).map(...) and sns.relplot(..., col=...)?",
      options: [
        { text: "The figure-level col=/row= parameters build a FacetGrid internally — relplot IS the shortcut for the same machinery", correct: true, feedback: "Correct — every figure-level dispatcher constructs a FacetGrid for you; the explicit form just shows the gears." },
        { text: "They are unrelated libraries", correct: false, feedback: "Both are seaborn — one is the machinery, the other the convenience wrapper around it." },
        { text: "FacetGrid is deprecated in favor of relplot", correct: false, feedback: "Both are current: FacetGrid for mapping arbitrary functions, relplot for the common one-call case." },
        { text: "relplot only works without col=", correct: false, feedback: "col= is precisely the faceting keyword relplot exists to expose." },
      ],
      explanation:
        "Knowing they are the same machinery means you can drop from the shortcut to the explicit form the moment you need a function the dispatcher does not wrap.",
    },
    {
      id: "c-08-q2",
      prompt: "What does sharey=True (the FacetGrid default) guarantee?",
      options: [
        { text: "Every panel's y-axis shows the same scale, so equal bar heights in different panels mean equal values", correct: true, feedback: "Correct — one scale, one meaning for ink height, across all panels." },
        { text: "Every panel gets the same title", correct: false, feedback: "Titles come from set_titles and the grouping values — sharey is about scales, not text." },
        { text: "The y-axis is hidden on interior panels", correct: false, feedback: "That is a common styling choice, not what sharey does." },
        { text: "All panels must show the same data", correct: false, feedback: "Different subsets per group — the SHARED thing is the scale, not the values." },
      ],
      explanation:
        "Small multiples compare across panels; sharing the scale is what makes that comparison meaningful. The Filter panel's 300-cup bar means the same as the same bar in the Cold Brew panel.",
    },
    {
      id: "c-08-q3",
      prompt: "When is sharey=False defensible?",
      options: [
        { text: "When the question is about each group's SHAPE (peaks, timing, direction) rather than its level, and the unshared scales are labelled loudly", correct: true, feedback: "Correct — shapes survive rescaling; levels do not. Label the choice and the reader can trust the shape reading." },
        { text: "Whenever it makes the dashboard look better", correct: false, feedback: "Aesthetics that re-scale ink manufacture comparisons the data does not support." },
        { text: "Never — it should be removed from the library", correct: false, feedback: "It is a legitimate tool for shape questions; the dishonesty is silent rescaling, not the parameter." },
        { text: "Only when there is one panel", correct: false, feedback: "With one panel the question does not arise — sharey bites exactly when panels multiply." },
      ],
      explanation:
        "Rescaling preserves shape and destroys level comparison. Ask which of the two your reader needs; if it is shape, sharey=False plus loud labels is honest engineering.",
    },
  ],
};
