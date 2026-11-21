/**
 * PART_A_V_EXERCISES — the Part A practice battery (8 exercises, tiered).
 * Part A is the foundations part: its exercises are design-and-read
 * exercises — choose the chart, audit the encoding, interpret the
 * rendered result — solved in prose with worked model answers.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_A_V_EXERCISES: Exercise[] = [
  {
    id: "a-vb1",
    tier: "beginner",
    title: "Match the question to the chart",
    prompt:
      "Five analysis questions, five chart types — draw the line between them. (1) How did signups move across the quarter? (2) Which of our nine regions sold least? (3) How are delivery times distributed — where is the bulk, where is the tail? (4) Do customers who visit more pages buy more? (5) What share of revenue comes from each product line? State your mapping and, for each, one sentence on why the encoding fits the question.",
    hint: "Trend asks for a time axis; ranking asks for a shared baseline; distribution asks for a whole-variable view; relationship asks for two variables as coordinates; composition asks for parts of a whole.",
    solution: `1 → line (change over time is encoded in slope). 2 → bar, sorted ascending so the laggard is the first bar the eye meets. 3 → histogram (shape, centre, spread, tail in one view). 4 → scatter (two variables as x·y coordinates; clusters and correlation become geometry). 5 → stacked bar or pie — stacked bar when the total also matters, pie when only shares do (and never more than ~5 slices).
The pattern behind every line: the question names the RELATIONSHIP, and the relationship names the encoding. a-03's ladder, applied.`,
    concepts: ["chart selection", "encoding", "question-first design"],
  },
  {
    id: "a-vb2",
    tier: "beginner",
    title: "Name the data type, pick the encoding",
    prompt:
      "For each column, name its type (nominal / ordinal / interval / ratio) and the safest visual encoding for it: (a) customer segment: 'retail' | 'wholesale' | 'online'; (b) satisfaction on a 1–5 scale with labelled poles; (c) temperature in °C; (d) revenue in dollars; (e) calendar month. Justify each in one line.",
    hint: "Ask: is order meaningful? is a zero point meaningful? are differences equal-sized?",
    solution: `(a) Nominal — unordered categories: encode with HUE (distinct, unordered colours), never with a light-to-dark ramp (the ramp implies an order that isn't there). (b) Ordinal — ordered categories: encode with ordered lightness (one hue, light→dark), never a rainbow. (c) Interval — differences meaningful, zero arbitrary: position on an axis (a line chart of monthly temperature is legitimate; 'twice as hot' is not). (d) Ratio — true zero: length/position on a zero-based axis; 'twice the revenue' is a meaningful claim, so bars must start at 0. (e) Interval/time — position along the x-axis in calendar order; never sort months alphabetically.`,
    concepts: ["data types", "colour scales", "encodings"],
  },
  {
    id: "a-vb3",
    tier: "beginner",
    title: "Read the ranking honestly",
    prompt:
      "A December bar chart shows Cold Brew 671, Latte 647, Espresso 489, Filter 258 cups. Write the two or three sentences you would put in a report about it — and then list every claim you deliberately did NOT make (and why not).",
    hint: "Measure, period, comparison. What is NOT on the chart: other months, margins, causes, people.",
    solution: `"In December, Cold Brew was our top seller at 671 cups, edging out Latte (647) by 24 cups — about 3.7% — with Espresso at 489 and Filter trailing at 258."
Claims NOT made: no trend (one month has no slope — 'Cold Brew is growing' needs a time series); no value judgment (cups ≠ revenue ≠ profit — margins differ); no cause ('because of the weather' is not on the chart); no people-claim ('most popular' implies customers, but a cup count is a proxy at best). The honest reading states the measure, the period and the ranking — and stops at the encoding's edge.`,
    concepts: ["interpretation discipline", "claims", "limitations"],
  },
  {
    id: "a-vi1",
    tier: "intermediate",
    title: "Audit a chart against the three questions",
    prompt:
      "You are handed a chart titled 'Sales' — bars for twelve months, y-axis starting at 480 with no unit, categories in alphabetical month order, and a legend for a single series. Audit it against the three questions every chart must answer (what is shown? compared to what? so that what is visible?) and produce a defect list with fixes.",
    hint: "The title is not a claim; the axis hides its unit and its truncation; alphabetical months destroy the time order; a legend for one series is ink with no work.",
    solution: `Defects and fixes —
1. Title states a subject, not a finding → 'Sales' → "Monthly sales held near-flat in 2024 H1, then climbed 33% Oct–Dec" — the title should carry the chart's claim.
2. No unit on the y-axis → add 'k$' (or units) — without it the numbers are decoration.
3. y-axis truncated at 480 → bars exaggerate differences; either restart at 0 or switch to a line chart where slope, not length, is the encoding — and if truncation must stay, mark it.
4. Months alphabetized (Apr, Aug, Dec…) → restore calendar order; time series with a shuffled axis destroy every trend the data owns.
5. Legend for a single series → remove; the title already names it.
6. Bonus: no reference context → if the question is 'vs last year', add the 2023 line instead of letting the reader guess.`,
    concepts: ["chart audit", "titles as claims", "axis honesty"],
  },
  {
    id: "a-vi2",
    tier: "intermediate",
    title: "The truncated-axis repair",
    prompt:
      "A stakeholder's bar chart of quarterly revenue (Q1 412 → Q4 671, in k$) starts its y-axis at 400, so Q1's bar is a stub and Q4's towers. Without losing the stakeholder's point that revenue GREW, redesign the encoding twice: once keeping bars, once changing chart type. State for each redesign what it honestly shows and what it gives up.",
    hint: "Bars encode value by length — truncation breaks length. Lines encode value by position along y — truncation only zooms.",
    solution: `Redesign 1 — keep bars, zero-based: y from 0 to 700. What it honestly shows: growth from 412 to 671 — real but moderate (63% taller). What it gives up: the drama; small quarter-to-quarter moves become hard to see.
Redesign 2 — switch to a line chart, keep the zoom: y from 400 to 700 is now defensible, because a line's value is read as POSITION against the grid, not as length from a baseline — the slope steepens honestly relative to a labelled axis. What it gives up: part-to-whole readings (none here) and some immediate comparability of individual quarters.
The general law the exercise teaches: truncation is a lie for length encodings (bars) and a zoom for position encodings (lines) — and the axis must always say which world you are in.`,
    concepts: ["truncated axes", "length vs position", "honest redesign"],
  },
  {
    id: "a-vi3",
    tier: "intermediate",
    title: "Design a colour-blind-safe encoding",
    prompt:
      "A line chart of four cities' monthly temperatures currently uses red, green, blue and yellow — indistinguishable to a notable share of male readers (~8% with colour-vision deficiency) and hostile in grayscale print. Redesign the encoding so every reader can keep the four lines apart, and state the fallback hierarchy you relied on.",
    hint: "Hue is only one channel. What else can separate four lines: direct labels, dash patterns, marker shapes — and the Okabe-Ito palette was designed for exactly this.",
    solution: `Redesign: (1) Re-colour with the Okabe-Ito palette (orange #E69F00, sky #56B4E9, blue #0072B2, vermillion #D55E00) — chosen so CVD types and grayscale keep the pairs apart. (2) Directly label each line at its right end (Lisbon 12°, Oslo −2°, Cairo 20°, Singapore 27°) — the strongest fix, since it removes the legend lookup entirely. (3) Differentiate further with dash patterns (solid, dashed, dotted, dash-dot) for the two closest hues.
Fallback hierarchy: position/label → luminance contrast → dash/marker → hue last. The rule: hue is an ENHANCEMENT, never the ONLY carrier of meaning — if the chart works in grayscale, it works for everyone.`,
    concepts: ["colour-blind safety", "Okabe-Ito", "redundant encoding"],
  },
  {
    id: "a-va1",
    tier: "advanced",
    title: "The misleading-chart post-mortem",
    prompt:
      "A viral infographic shows a state's crime rate 'doubling' in one year. You obtain the data: the rate went from 2.1 to 2.3 per 1,000 residents. List every possible way the graphic could have manufactured the 'doubling' impression from that data, and for each, the diagnostic question an analyst should ask before believing the picture.",
    hint: "Truncated axis, area-scaling (doubling a side quadruples the area), cherry-picked window, changing the denominator, missing per-capita normalization.",
    solution: `Manufacturing 'doubling' from 2.1 → 2.3 — the playbook and the diagnostics:
1. Truncated y-axis (start at 2.0, so 2.3 towers over 2.1) → ask: does the value axis start at zero, and if not, is the encoding length or position?
2. Area inflation (a person icon 10% taller LOOKS ~40% bigger) → ask: is the visual property scaled linearly with the number?
3. Cherry-picked window (the two years flanking a long, flat decline) → ask: what do the surrounding five years show?
4. Denominator games (counts, not rates, during a population boom) → ask: per-what? was the base normalized?
5. Unit elision (2.1 vs 2.3 per 1,000, with 'per 1,000' omitted) → ask: what exactly is the unit, and is the change within normal fluctuation?
The meta-diagnostic for every chart: re-derive the claim from the DATA, not the ink — then check whether the ink agrees with the data's actual magnitude.`,
    concepts: ["misleading charts", "axis truncation", "area scaling", "normalization"],
  },
  {
    id: "a-va2",
    tier: "advanced",
    title: "One dataset, five questions, five charts",
    prompt:
      "Take the coffee dataset (four products × four quarters, cups sold). Design five charts, one per question: (1) Which product leads in Q4? (2) How did each product move across the year? (3) Where did total volume go each quarter? (4) What is each product's share of the year? (5) Did any product's trajectory cross another's? For each: chart type, the one encoding decision that matters most, and what that chart deliberately hides.",
    hint: "Q3 vs Q4 is the interesting tension: totals+composition (stacked) versus within-quarter ranking (grouped). Shares: pie or 100%-stacked. Crossings: you need lines per product.",
    solution: `(1) Q4 ranking → bar, sorted descending, zero-based; key decision: SORT — the ranking becomes preattentive; hides: everything about Q1–Q3.
(2) Per-product movement → line per product (four lines, months as x); key decision: DIRECT LABELS over a legend; hides: the quarterly totals — each line is self-relative.
(3) Total per quarter → stacked bar; key decision: stack order stable across quarters (largest at base) so segments are comparable; hides: within-segment precision (middle segments are hard to rank).
(4) Share of the year → pie (four slices) or 100%-stacked single bar; key decision: order slices clockwise from 12 o'clock by size; hides: absolute volumes — shares only.
(5) Crossings → line chart again but the CLAIM is in the intersection: Cold Brew (476→671) crosses Latte (588→647) between Q3 and Q4 — key decision: annotate the crossing point; hides: nothing, at the cost of being the busiest chart of the five.
The exercise's real lesson: no chart serves two masters. Five honest questions, five encodings — and each one's "hides" list is as important as its "shows" list.`,
    concepts: ["chart selection", "encodings trade-offs", "composition vs comparison"],
  },
];
