/**
 * PART B · LESSON b-10 — "Styling"
 *
 * Style sheets: plt.style.use and the shipped looks (ggplot, seaborn-
 * v0_8, bmh, grayscale, dark_background), what a style actually is (a
 * bundle of rcParams), and the line styling must never cross — a style
 * changes the dress, never the encoding, the baseline or the data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { CITIES, COFFEE_PRODUCTS, COFFEE_Q4, TEMPS, months } from "../datasets";

export const LESSON_V_B_10: DataVizLesson = {
  slug: "b-10",
  title: "Styling",
  minutes: 20,
  summary:
    "Style sheets — plt.style.use(\"ggplot\") and friends — are bundles of rcParams that change a chart's dress in one call: grid, fonts, colors, spines. What a style changes, what it must never change, and choosing a look for the venue.",
  tool: "matplotlib",
  objectives: [
    "Apply a shipped style with plt.style.use and list what is available with plt.style.available",
    "Scope a style to one figure with plt.style.context, and restore defaults deliberately",
    "Say what a style sheet actually is — a bundle of rcParams — and preview one with plt.style.library",
    "Choose a style by venue (screen, deck, print, dark room) without letting it touch the encoding",
  ],
  why: "You will spend real career hours making charts look like they belong where they are going: the house style of a report, the projector-safe contrast of a talk, the greyscale of a printed appendix. Style sheets are matplotlib's one-call answer — and understanding them has a second payoff: a style sheet is nothing but a named bundle of rcParams, so learning styles is learning the customization system (b-11) at one level up. But styling has a law that Part A established and this part enforces: the style may change the dress — grid, fonts, colors — and may never change the argument: encodings, baselines, units and honest scales are meaning, not styling. A 'style' that truncates an axis is not a style, it is an edit.",
  blocks: [
    {
      kind: "text",
      text: "`plt.style.use(\"ggplot\")` changes the whole look of every chart your script makes from that line on: grey panel background, white gridlines, a different font stack, a new color cycle. One call before your existing code, and the same `ax.plot` calls produce a different dress. `plt.style.available` lists the shipped looks; `plt.style.use(\"default\")` is the road home.",
    },
    {
      kind: "code",
      title: "The one-call wardrobe change",
      language: "python",
      code: `import matplotlib.pyplot as plt

plt.style.use("ggplot")          # from here on: the ggplot look
# plt.style.available            # every shipped style name
# plt.style.library["ggplot"]    # the actual rcParams bundle

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
cups = [489, 647, 258, 671]

fig, ax = plt.subplots(figsize=(7, 4.2))
ax.bar(products, cups)
ax.set_title("Cups sold in December")
plt.show()

plt.style.use("default")         # restore — styles persist until changed`,
      note: "The style call goes BEFORE figure creation — it sets defaults, it does not restyle existing artists. ggplot's grey panel and white gridlines arrive with the next subplots().",
      produces:
        "The same four December bars you know from b-01, now on a grey panel with white gridlines — the ink identical, the dress changed.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold in December — default dress",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "The default look: white ground, dark ink, no panel fill. Your eye should log the elements a style will re-dress — grid, spine weight, font, bar colors — because the data is about to stay exactly still while they change.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold in December — a different dress",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
        palette: "set2",
      },
      why: "Same marks, same scale, same values — different palette and (in matplotlib) a grey panel with white grid. This is the boundary of styling: everything that changed is dress; everything that means something did not move.",
    },
    { kind: "heading", text: "Style sheets: looks you can name" },
    {
      kind: "definition",
      term: "Style sheet",
      informal:
        "A named bundle of rcParams — matplotlib's global defaults. It sets colors, line weights, fonts, grid, spines and figure aesthetics; it never touches data, scales or limits.",
      why: "Understanding styles as rcParams bundles collapses the mystery: b-11's per-call customizations and b-10's styles are the same system at two granularities.",
    },
    {
      kind: "table",
      title: "The shipped looks worth knowing first",
      headers: ["Style", "The look", "Reach for it when"],
      rows: [
        ["`default`", "white ground, dark ink, no grid fill", "the neutral baseline — where every comparison starts"],
        ["`ggplot`", "grey panel, white gridlines, bolder type", "the familiar analytics look; screen-first reports"],
        ["`seaborn-v0_8`", "soft grid, muted palette, light spines", "statistical work — Part C's native habitat"],
        ["`bmh`", "tinted panel, warm palette", "blog-style energy; attention-grabbing decks"],
        ["`grayscale`", "no color at all — grey levels only", "print in black and white; the photocopy test"],
        ["`dark_background`", "black ground, bright ink", "dark rooms and demos — with a-06's contrast caveats"],
      ],
      caption: "plt.style.available lists ~30 names; these six cover most venues. Since matplotlib 3.6 the seaborn styles are spelled seaborn-v0_8-name.",
    },
    {
      kind: "text",
      text: "Two scoped ways to wear a look. `with plt.style.context(\"ggplot\"):` dresses only the figures created inside the block — one styled figure in an otherwise default script. And styles can be **stacked**: `plt.style.use([\"dark_background\", \"grayscale\"])` applies them in order, later entries winning conflicts — a dark ground with grey-level ink, the demo-screen look.",
    },
    {
      kind: "code",
      title: "One figure, one style — the context manager",
      language: "python",
      code: `import matplotlib.pyplot as plt

cities = ["Lisbon", "Oslo", "Cairo", "Singapore"]
temps = {
    "Lisbon":    [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12],
    "Oslo":      [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2],
    "Cairo":     [19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20],
    "Singapore": [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
}

with plt.style.context("seaborn-v0_8-whitegrid"):
    fig, ax = plt.subplots(figsize=(8, 4.2))
    for city in cities:
        ax.plot(months, temps[city], label=city)
    ax.set_title("Monthly temperature by city")
    ax.legend()
    fig.savefig("cities_styled.png", dpi=150)

# back to the ambient style here — nothing else is affected`,
      note: "The context manager keeps style state local, the way a with-open file keeps file state local. Inside the block, seaborn's soft grid dresses the figure; outside, the ambient style resumes untouched.",
      produces:
        "The four-city line chart in the seaborn look — light grid, muted palette — while any figure created after the block keeps your script's ambient style.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Monthly temperature by city",
        categories: months,
        series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
        xLabel: "month",
        yLabel: "°C",
        palette: "set2",
      },
      why: "The chart the listing produces, in its dressed form: four lines, one per city, the grid carrying the reading. Singapore's flat 27-28 line against Oslo's -3 to 17 swing is the same finding whatever the style — as it must be.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The line a style may never cross",
      text: "Styling changes DRESS: grid, fonts, colors, spines, line weights. It may never change MEANING: encodings (position before color), baselines (bars from zero — a-08), units on axes, the y-scale a comparison depends on. If switching a style makes your chart *say something different*, one of two things is wrong: the style is editing meaning (unacceptable), or your chart was so fragile that dress carried the argument (a design bug to fix, not a style to ban).",
    },
    {
      kind: "interpretation",
      id: "b-10-i1",
      chart: {
        type: "line",
        title: "Monthly temperature by city",
        categories: months,
        series: CITIES.map((c) => ({ name: c, values: TEMPS[c] })),
        yLabel: "°C",
        palette: "warm",
      },
      prompt: "Same four cities, same ink, a warm palette instead of the muted one above. What has changed about the chart's meaning?",
      options: [
        {
          text: "Nothing — the readings, comparisons and findings are identical; only the dress (series colors) moved, which is exactly what styling is allowed to do",
          correct: true,
          feedback:
            "Correct — Cairo still runs 19-33, Oslo still crosses zero in three months, and no reader's conclusion changes. The dress is new; the argument is untouched.",
        },
        {
          text: "The warm palette makes the cities look hotter, so the temperature readings shifted up",
          correct: false,
          feedback: "Palette temperature is a naming convention, not a measurement — the values are pixel-identical. Conflating palette warmth with data warmth is exactly the color-as-meaning trap a-06 warned about.",
        },
        {
          text: "The chart is now dishonest because the colors changed",
          correct: false,
          feedback: "Color changes are not automatically dishonest — dishonesty is about what the chart CLAIMS (scales, baselines, encodings), not which named palette dressed it.",
        },
        {
          text: "The comparison is invalid now because series colors are no longer colorblind-safe",
          correct: false,
          feedback: "Accessibility is a real concern (a-06's Okabe-Ito) and a fair reason to reject a palette — but 'less accessible' is a different finding from 'meaning changed'. The question asked about meaning.",
        },
      ],
      explanation:
        "The style-stability test in one glance: re-dress the chart and interrogate the meaning. If every reading survives, the style is doing its job — decorating without editing.",
    },
    {
      kind: "exercise",
      id: "b-10-e1",
      exerciseKind: "concept-check",
      prompt:
        "Three venues, one bar chart of December cups: (1) the printed annual report, photocopied in black and white by half the recipients; (2) the keynote in a bright room; (3) the company dashboard on a dark-themed wall screen. Name a style for each and the one thing you must check before shipping the print version.",
      hint: "Greyscale is not just a palette choice — it has to survive a photocopier. And a bright room punishes thin grey lines.",
      options: [
        {
          text: "Print: grayscale — and check that every bar is still distinguishable with no color at all (one hue per bar is meaningless in grey; rely on labels, not color, to identify them). Keynote: default or bmh with heavier line weights and larger fonts for distance. Wall screen: dark_background, with the contrast checked against a-06's rules",
          correct: true,
          feedback:
            "Correct — and the print check is the deepest one: greyscale exposes any chart whose identity system was 'memorize the colors'. Labels are the copier-proof identification.",
        },
        {
          text: "Use dark_background everywhere for brand consistency",
          correct: false,
          feedback: "One style for three venues optimizes the designer's convenience, not the reader's condition — the print copy would be an ink-black rectangle.",
        },
        {
          text: "Use ggplot everywhere because it is the most popular",
          correct: false,
          feedback: "Popularity does not select a venue. ggplot's grey panel in a photocopied report muddies every bar.",
        },
        {
          text: "Style does not matter if the data is right",
          correct: false,
          feedback: "The data being right is the entry fee; the reader still has to decode the chart under their conditions. Venue-fit styling is part of honesty.",
        },
      ],
      explanation:
        "Style is venue negotiation: ink budget and copiers (print), distance and glare (talks), ambient dark (screens). The discipline: choose dress per venue, then re-run the style-stability check — every finding must survive every dress.",
    },
  ],
  terms: [
    {
      term: "plt.style.use",
      definition: "Sets the ambient style sheet for every figure created afterwards — a bundle of rcParams covering colors, grid, fonts and spines. Restored with plt.style.use(\"default\").",
    },
    {
      term: "plt.style.context",
      definition: "The context manager that scopes a style to figures created inside its block — one styled figure without touching the script's ambient look.",
    },
    {
      term: "rcParams",
      definition: "Matplotlib's global parameter dictionary — the defaults every call falls back on. A style sheet is a named assignment to a subset of it; b-11 edits entries directly.",
    },
  ],
  takeaways: [
    "A style sheet is a named bundle of rcParams: one call re-dresses grid, fonts, colors and spines for every figure that follows.",
    "Scope styles deliberately: plt.style.use for the script, plt.style.context for one figure, stacking for combinations — and 'default' is the road home.",
    "Styling changes dress, never meaning: encodings, baselines, units and scales are immune. A style that alters what the chart says is an edit, not a style.",
    "Match the style to the venue — grayscale for print, heavy weights for rooms, dark_background for screens — then verify every finding survives the dress.",
  ],
  quiz: [
    {
      id: "b-10-q1",
      prompt: "When does plt.style.use(\"ggplot\") take effect?",
      options: [
        {
          text: "For figures created after the call — it sets the defaults new figures inherit; existing figures keep their dress",
          correct: true,
          feedback: "Correct — styles are defaults at figure-creation time, which is why the style call goes first in a script.",
        },
        {
          text: "Retroactively, restyling every figure already drawn",
          correct: false,
          feedback: "Artists already created keep their properties; there is no retroactive restyle.",
        },
        {
          text: "Only for the very next plt.subplots() call",
          correct: false,
          feedback: "That is the behavior of a context manager exit, not use() — use() persists until changed back.",
        },
        {
          text: "Only after restarting the Python kernel",
          correct: false,
          feedback: "No restart involved: the very next figure creation already sees the new defaults.",
        },
      ],
      explanation:
        "Style calls write defaults, and defaults are read at creation time — order of operations is the whole game: style first, then figure.",
    },
    {
      id: "b-10-q2",
      prompt: "Under a style switch, which change would cross the line from dress into meaning?",
      options: [
        {
          text: "Bars that previously started at zero now start at 140 'because the style includes tight y-limits'",
          correct: true,
          feedback: "Correct — the baseline is meaning (a-08's whole subject). No legitimate style sheet ships axis limits; if your look requires truncation, the look is an edit.",
        },
        {
          text: "Gridlines changing from solid to dashed",
          correct: false,
          feedback: "Pure furniture — no reading of the data changes.",
        },
        {
          text: "The font changing from sans to serif",
          correct: false,
          feedback: "Typography is dress; the values, scales and encodings are untouched.",
        },
        {
          text: "Series colors changing from one palette to another",
          correct: false,
          feedback: "Palette is dress — with the standing a-06 caveats about accessibility and color-as-meaning, but it is styling, not meaning.",
        },
      ],
      explanation:
        "The boundary test: dress is what you could change without touching the chart's claims. Baselines, scales and encodings ARE the claims.",
    },
    {
      id: "b-10-q3",
      prompt: "Your report must survive black-and-white photocopying. Which check matters most before shipping?",
      options: [
        {
          text: "That every series remains identifiable with zero color information — labels, direct annotation or position carry identity, not hue",
          correct: true,
          feedback: "Correct — the photocopier deletes hue entirely; a chart whose identity system is 'memorize the colors' arrives anonymous.",
        },
        {
          text: "That the figure is at least 300 dpi",
          correct: false,
          feedback: "Resolution matters for sharpness (b-12), but a crisp anonymous chart is still anonymous.",
        },
        {
          text: "That the style name is 'grayscale' specifically",
          correct: false,
          feedback: "The named style is a means; the test is copier-survival. A custom look can pass it, and a naive grey palette can still fail if identity depended on subtle grey steps.",
        },
        {
          text: "That the title uses the largest font on the page",
          correct: false,
          feedback: "Good hierarchy (a-07), but no title rescues four indistinguishable series.",
        },
      ],
      explanation:
        "Print forces the deepest style question: does identity survive the loss of color? Design so it does — direct labels over legend-matching — and every other venue inherits the robustness.",
    },
  ],
};
