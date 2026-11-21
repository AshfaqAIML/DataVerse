/**
 * PART A · LESSON a-06 — "Colour Theory"
 *
 * Hue vs lightness vs intensity; the three families of colour scale
 * (sequential, diverging, categorical) and when each; colour-vision
 * deficiency (~8% of men) and the Okabe-Ito palette; the rainbow-hue
 * prohibition for magnitude. The same chart demonstrated in several of
 * the engine's palettes (categorical, okabe-ito, warm, cool).
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { CITIES, COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4, REVENUE_2024, TEMPS } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const tempMatrix = { rowLabels: CITIES, colLabels: months, cells: CITIES.map((c) => TEMPS[c]) };

/** The same grouped bar, rendered twice with different palettes. */
const coffeeByQuarter = (palette: "categorical" | "okabe-ito") => ({
  type: "grouped-bar" as const,
  title: `Cups by product and quarter — palette "${palette}"`,
  categories: quarters,
  series: COFFEE_PRODUCTS.map((p, i) => ({
    name: p,
    values: [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]],
  })),
  yLabel: "cups",
  palette,
});

export const LESSON_V_A_06: DataVizLesson = {
  slug: "a-06",
  title: "Colour Theory",
  minutes: 25,
  summary:
    "Colour is three channels in disguise — hue names, lightness ranks, intensity flags. Sequential, diverging and categorical scales and when each applies; the Okabe-Ito palette for the ~8% of men with colour-vision deficiency; and why rainbow hue must never encode magnitude.",
  tool: null,
  objectives: [
    "Distinguish hue from lightness and intensity, and assign each channel its job: naming, ranking, flagging",
    "Choose sequential vs diverging vs categorical scales from the data's type and whether a midpoint matters",
    "Design for colour-vision deficiency: Okabe-Ito (the engine's `okabe-ito` palette) and redundant encoding",
    "Explain and refuse the rainbow lie — magnitude encoded in unordered hue",
  ],
  why: "Colour is the loudest channel in a chart and the most misused. The same hue that beautifully names four unordered products will lie about magnitude if asked to rank twelve ordered months; the red-green pairing that looks crisp to you collapses to a single olive for one man in twelve. Colour done right is invisible — readers decode it without noticing. Colour done wrong is a chart only its author can read. This lesson gives you the three families of colour scale, the rule for choosing between them, and the accessibility facts that make the choice non-optional.",
  blocks: [
    {
      kind: "text",
      text: "Ask a colleague what colour the chart uses and you get a hue — *teal*, *orange*. But 'colour' is at least three channels wearing one word. **Hue** is *which* colour: teal, orange, violet — a naming channel with no order. **Lightness** is *how dark* it is — an ordering channel. **Intensity** (saturation) is *how vivid* it is — an attention channel. Nearly every colour mistake in visualization is a channel mix-up: asking hue to rank (rainbow scales), asking lightness to name (a ramp on unordered categories), or asking intensity to whisper when it can only shout.",
    },
    {
      kind: "definition",
      term: "Hue vs lightness vs intensity",
      informal:
        "Hue is which colour (teal, orange); lightness is how dark it is; intensity is how vivid it is. Only lightness and intensity are ordered channels — hue is a set of names.",
      why: "The channel decides the job: hue names categories, lightness ranks magnitudes, intensity flags urgency. A scale that crosses the wires sends a message the data never made.",
    },
    { kind: "heading", text: "Three families of colour scale" },
    {
      kind: "table",
      title: "Choosing a scale by what the data is",
      headers: ["Scale family", "What it is", "Use when", "Typical home"],
      rows: [
        ["Categorical", "Unrelated, roughly equally-bright hues", "Values are unordered names (products, cities, species)", "grouped bars, multi-series lines"],
        ["Sequential", "One hue (or hue family) stepping in lightness", "Values are ordered magnitudes (temperature, revenue, counts)", "heatmaps, choropleths, intensity encodings"],
        ["Diverging", "Two hues stepping in lightness toward a shared neutral midpoint", "Values have a meaningful centre: above/below average, gain/loss", "deviation heatmaps, diverging bars"],
      ],
      caption:
        "The family follows the DATA'S type (a-04), not the brand guidelines: unordered names → categorical; ordered magnitude → sequential; deviation from a midpoint → diverging.",
    },
    {
      kind: "chart",
      chart: coffeeByQuarter("categorical"),
      why: "Categorical logic: four products are unordered names, so four unrelated, equally-bright hues — teal, orange, violet, green — none of them implying rank or size. Colour here is a legend key and nothing more.",
    },
    {
      kind: "chart",
      chart: coffeeByQuarter("okabe-ito"),
      why: "The same mapping in the Okabe-Ito palette — hues deliberately chosen so no pair collapses for colour-blind readers. The chart reads identically to the categorical version above; the insurance is invisible until somebody needs it.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "One man in twelve",
      text: "Roughly **8% of men** (about 1 in 12) and 0.5% of women live with a colour-vision deficiency, most commonly red–green. To them, a red series beside a green one is two shades of the same olive. Two habits make charts safe: pick a palette designed for it — **Okabe-Ito**, which our engine ships as `okabe-ito` — and never let colour be the *only* channel carrying the information (position, length or direct labels hold the message; hue merely decorates it).",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "Average monthly temperature (°C) — sequential ramp",
        palette: "warm",
        matrix: tempMatrix,
      },
      why: "Sequential logic: temperature is an ordered magnitude, so a single hue family stepping in lightness — darker means warmer. Every Singapore cell (27–28 °C) is darker than every Oslo cell; the ramp answers 'which is warmer' with no numbers read.",
    },
    {
      kind: "text",
      text: "**Diverging** is the two-hue story. When the data has a meaningful midpoint — profit versus loss, above versus below average — colour the two directions with two hues (conventionally cool below, warm above), each stepping in lightness toward a neutral grey at the centre. The midpoint is the message: a diverging temperature map of 'deviation from the 1991–2020 normal' is about *anomaly*, not warmth. Honest note: our engine ships single-hue ramps (its heatmaps run one base colour at a time), so we demonstrate the ingredients — the warm ramp above, the cool ramp below — and you will meet full blue–grey–red diverging scales in the Python tooling of later parts.",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "Average monthly temperature (°C) — the cool half of the story",
        palette: "cool",
        matrix: tempMatrix,
      },
      why: "The same numbers through a cool ramp: hue carries connotation — Singapore's row now reads as 'tropical' and Oslo's as 'northern' while the arithmetic (27–28 vs −3 to 17) never changed. Join this ramp to the warm one at a neutral midpoint and you have built a diverging scale: cool for below average, warm for above.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Never encode magnitude with rainbow hue",
      text: "A rainbow scale asks readers 'is purple bigger than green?' — a question with **no visual answer**, because hue has no perceived order. Rainbow colours a magnitude in a channel that can only name. Ordered magnitudes need ordered lightness, or better, length or position — reserving hue for what it can actually do: label categories.",
    },
    {
      kind: "interpretation",
      id: "a-06-i1",
      chart: {
        type: "heatmap",
        title: "Average monthly temperature (°C) — sequential ramp",
        palette: "warm",
        matrix: tempMatrix,
      },
      prompt:
        "Using the lightness ramp alone — before reading any printed number — which claim can you verify at a glance?",
      options: [
        {
          text: "Singapore's coldest month is warmer than Oslo's warmest — every Singapore cell (27–28 °C) is darker than every Oslo cell, whose July peak is 17 °C",
          correct: true,
          feedback:
            "Correct — and that is the ramp's entire job: MORE-vs-LESS questions answered instantly, cell against cell, no numbers read. The specific gap (10 °C between Singapore's floor and Oslo's ceiling) is what the printed values add.",
        },
        {
          text: "Cairo is exactly 8 °C warmer than Lisbon in July",
          correct: false,
          feedback: "The ramp says 'warmer', never 'how much' — exact differences need the printed values (Cairo 33, Lisbon 25). Lightness orders; it does not measure.",
        },
        {
          text: "Oslo is below zero in exactly five months",
          correct: false,
          feedback: "Counting needs the numbers — and Oslo dips below zero in three months (Jan −3, Feb −3, Dec −2), not five. The ramp's pale winter cluster shows the season, not the count.",
        },
        {
          text: "Lisbon and Cairo have nearly identical climates",
          correct: false,
          feedback: "Their summer cells sit eight degrees apart (25 vs 33 °C) — a shade gap the ramp makes visible even before the numbers confirm it.",
        },
      ],
      explanation:
        "Lightness ramps answer order questions instantly and magnitude questions not at all — which is why this engine prints the value inside every cell and why legends for sequential scales carry numbers, not names.",
    },
    {
      kind: "exercise",
      id: "a-06-e1",
      exerciseKind: "critique",
      chart: {
        type: "bar",
        title: "Monthly revenue, first half of 2024 — one hue per month",
        categories: ["H1 2024"],
        series: months.slice(0, 6).map((m, i) => ({ name: m, values: [REVENUE_2024[i]] })),
        palette: "earth",
        yLabel: "k$",
      },
      prompt:
        "This chart colours each month's revenue bar with a different unrelated hue (palette `earth`). Revenue is a ratio magnitude and the months are ordered. Name the colour failures and prescribe the honest encoding.",
      options: [
        {
          text: "Hue has no order, so the palette implies nothing about time or size; months are ordered and revenue is a magnitude — one hue for all bars (or an ordered lightness ramp), with length carrying the value and the month names on the axis",
          correct: true,
          feedback:
            "Correct — and note the chart needed a six-entry legend just to say which bar is which month: six lookups replacing the one glance a time axis gives for free.",
        },
        {
          text: "It is fine — varied colours are more engaging, and engagement is the goal",
          correct: false,
          feedback: "Engagement without decoding is decoration. The reader must consult the legend to learn what any colour means, and none of the hues says 'later' or 'bigger'.",
        },
        {
          text: "The failure is the bar chart itself — a pie would fix it",
          correct: false,
          feedback: "A pie would stack angle (rung 3) on top of unordered hue — two weak encodings where one strong one (length on a time axis) would do.",
        },
        {
          text: "The fix is to give every bar its own y-axis too, so each month gets a tailored scale",
          correct: false,
          feedback: "One axis per bar destroys the shared baseline — the one property bar comparison exists for. That is the a-08 dual-axis failure in miniature.",
        },
      ],
      hint: "What question is this chart asking, and which channel (hue or lightness) can even carry an ordered answer?",
      explanation:
        "Months are ordinal and revenue is ratio: the honest encoding is a single hue (or an ordered ramp) with length as value and time on the axis. Unrelated hues on ordered data is the rainbow lie in six bars.",
    },
  ],
  terms: [
    {
      term: "hue",
      definition: "The which-colour channel: teal, orange, violet. A naming channel with no perceived order — ideal for labelling unordered categories, structurally incapable of ranking magnitudes.",
    },
    {
      term: "lightness",
      definition: "The how-dark channel — one of only two ordered colour channels. Sequential scales use it to encode magnitude; ordinal categories use it to show rank.",
    },
    {
      term: "sequential scale",
      definition: "One hue (or hue family) stepping in lightness to encode an ordered magnitude — darker means more. The scale for heatmaps and choropleths of counts, temperatures and amounts.",
    },
    {
      term: "diverging scale",
      definition: "Two hues stepping in lightness toward a shared neutral midpoint — cool below the centre, warm above. The scale for data whose deviation from a midpoint (average, zero, baseline) is the message.",
    },
    {
      term: "colour-vision deficiency",
      definition: "Reduced ability to distinguish certain hues — most commonly red–green — affecting about 8% of men and 0.5% of women. The design answer: safe palettes (Okabe-Ito) plus redundant, non-colour encoding.",
    },
  ],
  takeaways: [
    "Colour is three channels — hue names, lightness ranks, intensity flags — and most colour bugs are channel mix-ups.",
    "Categorical for unordered names, sequential for ordered magnitudes, diverging when a midpoint is the message; the data's type picks the family.",
    "About one man in twelve sees red and green converge — use Okabe-Ito (`okabe-ito` in our engine) and never let colour be the only carrier of information.",
    "Rainbow hue on magnitude is a category error: hue has no order, so the reader cannot tell whether purple outranks green. Ordered lightness or length does that job.",
    "Sequential ramps answer 'more or less' instantly and 'how much more' not at all — which is why they travel with printed values.",
  ],
  quiz: [
    {
      id: "a-06-q1",
      prompt: "Each city's monthly revenue shown as deviation from its own annual average, where above/below matters. Which colour scale?",
      options: [
        { text: "Diverging — cool hues below the average, warm above, neutral grey at zero deviation", correct: true, feedback: "The midpoint is the message; diverging scales exist precisely to make 'which side of centre' readable at a glance." },
        { text: "Categorical — one hue per city", correct: false, feedback: "City is categorical, sure — but the VALUES being coloured are signed deviations, and unordered hues cannot show sign." },
        { text: "Sequential — a single-hue lightness ramp", correct: false, feedback: "A one-way ramp cannot show two directions: −5 and +5 would both be 'extreme' ends with no way to signal opposite signs." },
        { text: "Rainbow — maximum hue variety for maximum contrast", correct: false, feedback: "Hue variety is not magnitude order; the reader cannot tell which side of average any colour is on." },
      ],
      explanation: "When the sign of a value is the story, colour the two sides differently and fade both toward neutral at the midpoint — that is a diverging scale.",
    },
    {
      id: "a-06-q2",
      prompt: "Roughly 8% of men have a colour-vision deficiency. The professional response is to:",
      options: [
        { text: "Use colour-blind-safe palettes such as Okabe-Ito, and never let colour be the only channel carrying the information", correct: true, feedback: "Safe hues plus redundant encoding (position, length, labels) keeps the chart readable for everyone, at zero cost to everyone else." },
        { text: "Use brighter reds and greens so the difference is more extreme", correct: false, feedback: "Brightness is intensity, not hue separation — the classic red–green confusion persists no matter how loud the colours." },
        { text: "Ignore it — the audience is probably fine", correct: false, feedback: "One man in twelve is not an edge case; in a room of 24 stakeholders, expect two. Design is for the audience you have." },
        { text: "Add a footnote warning colour-blind readers", correct: false, feedback: "A footnote informs; a safe palette INCLUDES. Accessibility you can design should not be delegated to an apology." },
      ],
      explanation: "Colour-vision deficiency is common and predictable — so the fix is design, not disclaimers: Okabe-Ito hues and information that survives greyscale printing.",
    },
    {
      id: "a-06-q3",
      prompt: "Why must magnitude never be encoded with rainbow hue?",
      options: [
        { text: "Hue has no perceived order — 'is purple bigger than green?' has no visual answer", correct: true, feedback: "Exactly the category error: ranking needs an ordered channel (lightness, length, position), and hue is a set of names." },
        { text: "Rainbow palettes are technically hard to render", correct: false, feedback: "Rendering is trivial — the failure is perceptual, not technical. Every tool will happily draw the lie." },
        { text: "Rainbows use too many colours and exceed chart limits", correct: false, feedback: "The count is not the issue — a two-hue red/blue scale on magnitude fails the same way, because neither hue outranks the other." },
        { text: "Rainbow is fine as long as a legend maps colours to numbers", correct: false, feedback: "A legend lets readers DECODE, one lookup at a time — the perception still carries no order. Encoding should do the work before reading starts." },
      ],
      explanation: "The eye reads lightness and length as order; it reads hue as identity. Rainbow-on-magnitude spends a naming channel on a ranking job and loses the ranking.",
    },
  ],
};
