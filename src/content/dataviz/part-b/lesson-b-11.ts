/**
 * PART B · LESSON b-11 — "Customization"
 *
 * The frame fitted to the question: limits (set_xlim/ylim — and the
 * line-vs-bar honesty rule for zooming), ticks (set_xticks and
 * set_xticklabels), scales (log), spines, tick_params, and rcParams
 * as the global layer beneath b-10's styles.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q4, REVENUE_2024, months } from "../datasets";

const singaporeTemps = [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27];

export const LESSON_V_B_11: DataVizLesson = {
  slug: "b-11",
  title: "Customization",
  minutes: 25,
  summary:
    "Fitting the frame to the question: set_xlim and set_ylim (with the line-vs-bar zoom rule), set_xticks and set_xticklabels, log scales, tick_params, spine removal, and rcParams for defaults you actually mean.",
  tool: "matplotlib",
  objectives: [
    "Set axis limits deliberately with set_xlim/set_ylim, and apply the honesty rule: lines may zoom, bars may not leave zero",
    "Place ticks where the question wants them with set_xticks, rename them with set_xticklabels, and rotate with tick_params",
    "Switch to a logarithmic scale with set_yscale('log') and name the data that earns it",
    "Set global defaults via rcParams — and know why a style sheet (b-10) is the better home for them",
  ],
  why: "A chart's frame — its limits, tick marks, scales and spines — is not neutral furniture; it is the lens the question focuses with. 'How bad was the dip' wants limits tightened to the series; 'how does Singapore compare' wants the full shared scale even though Singapore flattens into a line; 'are these ratios moving together' may want a log scale. Every one of those choices can also lie: a zoomed bar chart manufactures drama from a flat baseline, which is the a-08 truncated-axis device made by hand. This lesson gives you the four calls that fit the frame — limits, ticks, scales, spines — and the rules for using them on the side of the reader.",
  blocks: [
    {
      kind: "text",
      text: "The frame has four layers, each with its own call: **limits** (`ax.set_xlim`, `ax.set_ylim`) choose how much of the data's world is visible; **ticks** (`ax.set_xticks` and friends) choose where the ruler's marks fall and what they say; **scales** (`ax.set_yscale(\"log\")`) choose the ruler's geometry; **spines** (`ax.spines`) choose how much box frames the plot. Defaults are sensible for exploration and almost never final for communication — fitting them is the last mile of every figure.",
    },
    { kind: "heading", text: "Limits: the zoom and its honesty rule" },
    {
      kind: "code",
      title: "Zooming a line — legal, with disclosure",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
singapore = [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27]

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(months, singapore, color="#0d9488", marker="o")
ax.set_ylim(26, 29)                      # the zoom, stated in code
ax.set(title="Singapore's year inside two degrees",
       ylabel="temperature (°C)")
plt.show()`,
      note: "set_ylim(26, 29) magnifies the 27-28 band. Position encodes value in a LINE chart, so the zoom reveals real structure — legal, as long as the reader sees the axis and its labels (they do: the ticks say 26-29).",
      produces:
        "A line that looked flat on the 0-35 city scale now shows its real texture: 27s early, 28s for eight months, 27s late — a one-degree year, honestly magnified.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Singapore's year inside two degrees (zoomed 26-29 °C)",
        categories: months,
        series: [{ name: "Singapore", values: singaporeTemps }],
        yLabel: "temperature (°C)",
        showLegend: false,
      },
      why: "The zoomed view. Compare it with b-08's shared-scale version, where Singapore collapsed to a flat line — both are honest, because they answer different questions: 'what is Singapore's year like' (this chart) versus 'how do the four cities compare' (that one).",
    },
    {
      kind: "text",
      text: "Now the rule, and it is a-08's in miniature: **a zoomed line is legal, a zoomed bar is a device.** Lines encode value by position — cut the axis and positions still land on visible gridlines, so the reader CAN recalibrate from the ticks. Bars encode value by LENGTH from the baseline — cut the baseline away and every length on screen is a lie about ratio. `ax.set_ylim(140, 210)` under December's coffee bars would make 489 and 671 look like a 5× gap instead of a 1.4× one. Bars start at zero; if the story genuinely lives in a narrow band, the honest move is a different mark (points or lines), not a cut bar.",
    },
    { kind: "heading", text: "Ticks: where the ruler marks fall" },
    {
      kind: "code",
      title: "Choosing the marks and their names",
      language: "python",
      code: `fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(["Espresso", "Latte", "Filter", "Cold Brew"],
       [489, 647, 258, 671], color="#0d9488")

ax.set_yticks([0, 200, 400, 600])         # the marks…
ax.set_yticklabels(["0", "200", "400", "600 cups"])   # …their names
ax.tick_params(axis="x", rotation=15)     # per-axis styling

ax.set_title("Cups sold in December")
plt.show()`,
      note: "set_yticks and set_yticklabels must be given in matching order — names land on marks positionally. Rotation buys legibility for long category names; 30-45° is the conventional ceiling before relabeling beats rotating.",
      produces:
        "The December bars with ticks only at 0/200/400/600 — fewer marks, quieter ruler; the last one carries the unit so the y-label can stay short.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Cups sold in December",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "cups", values: COFFEE_Q4 }],
        xLabel: "product",
        yLabel: "cups",
        showValues: true,
        showLegend: false,
      },
      why: "The target chart: value labels on the ink (b-03's bar_label) already let the reader skip the ruler — so sparse ticks are a styling choice that costs nothing. Customization follows the reading, never the reverse.",
    },
    { kind: "heading", text: "Scales and spines" },
    {
      kind: "text",
      text: "**Logarithmic scale.** `ax.set_yscale(\"log\")` makes equal DISTANCES mean equal RATIOS — a step from 10 to 100 is as tall as 100 to 1000. It earns its place on data spanning orders of magnitude: response times clustered at 40 ms with a tail at 12 s, city populations, file sizes. The check is simple: if a linear chart flattens everything but the giant into the floor line, log is the honest geometry. Do NOT reach for it to rescue a truncated-looking chart — it changes what the distances mean, and the reader must be told (the tick labels 10⁰ 10¹ 10² do that job). **Spines.** `ax.spines[\"top\"].set_visible(False)` and `\"right\"` likewise — the four-sided box shrinks to an L, and the data gets the air. Seaborn (Part C) makes the L its default; matplotlib lets you choose, and the choice is two lines of code.",
    },
    {
      kind: "table",
      title: "rcParams worth knowing by name",
      headers: ["Parameter", "What it defaults", "Example set"],
      rows: [
        ["`figure.dpi`", "render resolution of the screen figure", "`plt.rcParams[\"figure.dpi\"] = 110`"],
        ["`axes.grid`", "gridlines on/off everywhere", "`plt.rcParams[\"axes.grid\"] = True`"],
        ["`axes.spines.top`", "the top spine's existence", "`plt.rcParams[\"axes.spines.top\"] = False`"],
        ["`font.size`", "the base type size everything scales from", "`plt.rcParams[\"font.size\"] = 11`"],
        ["`axes.prop_cycle`", "the color cycle series draw from", "set by every style sheet (b-10)"],
      ],
      caption: "rcParams is a plain dict: read it (plt.rcParams[\"font.size\"]), write it, and every figure created afterwards inherits. A pile of rcParams assignments at the top of a script is a hand-rolled style sheet.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "rcParams vs style sheets",
      text: "If you find yourself setting the same five rcParams in every script, you have authored a style without naming it — move them into a .mplstyle file (`myhouse.mplstyle`) and `plt.style.use(\"myhouse\")`. Styles (b-10) are rcParams with provenance: versioned, shareable, and one call from your whole team's charts matching.",
    },
    {
      kind: "interpretation",
      id: "b-11-i1",
      chart: {
        type: "grouped-bar",
        title: "Q1 vs Q4 cups — read the gap honestly",
        categories: COFFEE_PRODUCTS,
        series: [
          { name: "Q1", values: COFFEE_Q1, color: "#94a3b8" },
          { name: "Q4", values: COFFEE_Q4, color: "#0d9488" },
        ],
        xLabel: "product",
        yLabel: "cups (axis from zero)",
      },
      prompt: "A colleague proposes set_ylim(250, 700) on this bar chart 'to use the space better'. What exactly does the change do to each bar's honest message?",
      options: [
        {
          text: "It severs every bar from the zero baseline, so LENGTH no longer encodes ratio: Filter's real 14% decline (301→258) would erase five-sixths of its visible bar (301→258 becomes 51→8 on a 250-base), and Cold Brew's +41% would look like a near-doubling — the a-08 truncated-axis device, built by hand",
          correct: true,
          feedback:
            "Correct — and the arithmetic proves it: on a 250-700 axis, Filter's 43-cup drop is 84% of its visible ink while Cold Brew's 195-cup gain looks 1.9× tall instead of 1.4×. Bars argue by length-from-zero; remove zero and the argument is counterfeit.",
        },
        {
          text: "Nothing — the values are unchanged, so the chart stays honest",
          correct: false,
          feedback: "The VALUES are unchanged; the ENCODING is destroyed. A bar chart's channel is length from a visible baseline — that channel is what the edit amputates.",
        },
        {
          text: "It is fine because the axis labels disclose the new limits",
          correct: false,
          feedback: "Disclosure makes a zoomed LINE chart legal (position survives), but labelled limits do not restore the zero a bar's geometry requires. Honesty is about the channel, not the signage.",
        },
        {
          text: "It improves the chart because small differences become visible",
          correct: false,
          feedback: "Visible and inflated are different achievements. If the Q1→Q4 deltas are the story, a slope/pct chart or a dot plot shows them honestly at any magnification.",
        },
      ],
      explanation:
        "The customization rule that outranks all others: limits may magnify position encodings (points, lines) with disclosure; they may never amputate a bar's baseline. Want the narrow band? Change the mark, not the base.",
    },
    {
      kind: "exercise",
      id: "b-11-e1",
      exerciseKind: "choose-chart",
      prompt:
        "A dashboard tile must show 30 days of API response times: mostly 30-60 ms, with occasional spikes to 3,000 ms and one 12,000 ms outage. The linear draft shows a flat floor with two uninformative towers. Choose the customization that makes the tile honest AND readable, and name the cost it carries.",
      hint: "What does 'equal distances mean equal ratios' do to 30 ms vs 12,000 ms? And what does the reader lose the moment the axis goes log?",
      options: [
        {
          text: "set_yscale(\"log\"): the 30-60 ms daily texture and the 3,000-12,000 ms spikes all become readable, because each doubling of latency takes the same vertical distance. The cost: ratios are now effortless but ABSOLUTE distances are not — 'twice as slow' is instant, 'how many ms' needs the tick labels, so keep them explicit",
          correct: true,
          feedback:
            "Correct — log is the geometry for data spanning orders of magnitude, and its known cost (absolute-difference readings get harder) is paid knowingly and disclosed by the log tick labels.",
        },
        {
          text: "set_ylim(0, 100) to focus on the normal band and drop the outage day",
          correct: false,
          feedback: "That is data deletion dressed as a limit — the 12,000 ms point still exists and the axis now lies about the world it claims to show.",
        },
        {
          text: "Keep the linear scale — honesty requires linear",
          correct: false,
          feedback: "Linear is not synonymous with honest; a scale that flattens 29 days into the floor line hides real structure. Log is a geometry choice with disclosure, not a distortion.",
        },
        {
          text: "Set a ylim of 0 to 12,500 and let the towers speak for themselves",
          correct: false,
          feedback: "That is the original draft's problem restated: the towers eat the axis and the daily texture stays invisible. The reader gets 'there was an outage' and nothing else.",
        },
      ],
      explanation:
        "Scale choice is a claim about which comparisons matter: log says 'ratios are the story', linear says 'absolute distances are'. Latency across three orders of magnitude is ratio country — go log, and keep the ticks loud.",
    },
  ],
  terms: [
    {
      term: "Axis limits",
      definition: "The visible window of the data's world: ax.set_xlim / ax.set_ylim. Lines and points may be magnified inside a stated window; bars must keep their zero baseline (a-08).",
    },
    {
      term: "Tick locators and formatters",
      definition: "The machinery choosing where ruler marks fall (set_xticks, MaxNLocator) and how they print (set_xticklabels, PercentFormatter). Positional pairing: names land on marks by order.",
    },
    {
      term: "Logarithmic scale",
      definition: "A ruler where equal distances mean equal ratios: 10→100 is as tall as 100→1000. set_yscale(\"log\") earns it on data spanning orders of magnitude, disclosed by its distinctive tick labels.",
    },
  ],
  takeaways: [
    "The frame is a lens, not furniture: limits, ticks, scales and spines are fitted to the question, and defaults are for exploration only.",
    "The zoom rule: position encodings (lines, points) may magnify with disclosure; bars may never leave zero — the narrow band wants a different mark, not a cut base.",
    "Log scale trades absolute-distance readings for ratio readings — the right trade when data spans orders of magnitude, disclosed by its tick labels.",
    "rcParams are the defaults layer; five repeated rcParams assignments are an unnamed style sheet — name it (b-10) and share it.",
  ],
  quiz: [
    {
      id: "b-11-q1",
      prompt: "ax.set_xticks([0, 2, 4]) followed by ax.set_xticklabels([\"a\", \"b\", \"c\"]) places the labels where?",
      options: [
        {
          text: "\"a\" at x=0, \"b\" at x=2, \"c\" at x=4 — names pair with marks positionally, in order",
          correct: true,
          feedback: "Correct — the lists zip: the i-th label lands on the i-th tick mark. Mismatched lengths raise an error, mismatched ORDER is a silent bug.",
        },
        {
          text: "The labels replace the first three data points",
          correct: false,
          feedback: "Ticks are ruler furniture — data marks are untouched by tick calls.",
        },
        {
          text: "Alphabetically across the current data range",
          correct: false,
          feedback: "Nothing sorts or auto-spreads; the positions are exactly the ones set_xticks declared.",
        },
        {
          text: "Rotated 45 degrees automatically",
          correct: false,
          feedback: "Rotation is a separate call (tick_params or rotation=), never a side-effect of naming ticks.",
        },
      ],
      explanation:
        "Locator then formatter, marks then names, positionally zipped. The classic silent failure is a label list in the wrong order — always re-read ticks after renaming them.",
    },
    {
      id: "b-11-q2",
      prompt: "Which dataset EARNS a logarithmic y-scale?",
      options: [
        {
          text: "File sizes clustering at 2-8 KB with a tail at 3 MB — three orders of magnitude under one roof",
          correct: true,
          feedback: "Correct — log makes each doubling equally tall, so the KB texture and the MB tail are both readable.",
        },
        {
          text: "Monthly revenue moving 124 → 204 k$ across a year",
          correct: false,
          feedback: "A 1.6× range in one order of magnitude — log would waste the geometry and make the linear-looking growth curve like a ratio puzzle.",
        },
        {
          text: "Satisfaction scores from 1 to 10",
          correct: false,
          feedback: "A bounded ordinal scale; log means nothing on it.",
        },
        {
          text: "Four cities' temperatures from -3 to 33 °C",
          correct: false,
          feedback: "Besides spanning zero (log needs strictly positive data), a 36-degree range is exactly what linear rulers were built for.",
        },
      ],
      explanation:
        "The trigger is orders of magnitude: when the giants flatten everyone else into the floor line, log restores the small values' texture at a known, disclosed cost.",
    },
    {
      id: "b-11-q3",
      prompt: "What does removing the top and right spines actually accomplish?",
      options: [
        {
          text: "Less frame competing with the data — the L-shaped enclosure carries the axis information and the ink gets the visual air",
          correct: true,
          feedback: "Correct — the left and bottom spines ARE the axes (they anchor the scales); top and right are repetition, and dropping them is pure signal-to-frame gain.",
        },
        {
          text: "It enlarges the plot area, fitting more data points",
          correct: false,
          feedback: "The data area grows by a hair at most — the win is perceptual, not capacity.",
        },
        {
          text: "It is required for log scales to work",
          correct: false,
          feedback: "Independent choices: seaborn ships the L by default, matplotlib the box by default, and either pairs with either scale.",
        },
        {
          text: "It removes the tick labels from those sides",
          correct: false,
          feedback: "Ticks on top/right were already off by default; spine removal takes the LINE away, not labels that were not there.",
        },
      ],
      explanation:
        "Spines are the frame's frame: left and bottom anchor the scales and stay; top and right only echo them and go. One of the cheapest signal-per-pixel trades in matplotlib.",
    },
  ],
};
