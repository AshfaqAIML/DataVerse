/**
 * PART_A_V_ASSESSMENT — the Part A checkpoint (12 questions spanning all
 * eight lessons: definition and case for charts, chart choice, data
 * types, perception, colour, labels, and the honesty rules).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_A_V_ASSESSMENT: QuizQuestion[] = [
  {
    id: "a-vas-1",
    prompt: "The most precise definition of data visualization is:",
    options: [
      { text: "A mapping from data values to visual properties so relationships become perceivable", correct: true, feedback: "Correct — mapping, perception, relationships. Everything else in the craft follows from this definition." },
      { text: "The graphical display of information", correct: false, feedback: "Too broad — a stock ticker is graphical, but without a designed mapping it encodes nothing comparable." },
      { text: "Software-generated charts from spreadsheets", correct: false, feedback: "That describes one production method, not the discipline — defaults are somebody's mapping choices." },
      { text: "Data art that makes numbers beautiful", correct: false, feedback: "Beauty may result, but decoration without a perceivable mapping is not visualization's definition." },
    ],
    explanation: "Definition discipline: if a chart is a mapping, chart quality is mapping quality — the standard every later lesson applies.",
  },
  {
    id: "a-vas-2",
    prompt: "Anscombe's quartet is the canonical argument for visualization because:",
    options: [
      { text: "It shows four datasets with nearly identical summary statistics but radically different shapes — statistics alone can hide the structure that matters", correct: true, feedback: "Correct — same mean, same variance, same correlation ≈ 0.816, same regression line; four different stories. The chart reveals what the table of statistics conceals." },
      { text: "It proves charts are always more accurate than tables", correct: false, feedback: "It proves no such thing — tables hold exact values; the quartet shows summaries can mask structure." },
      { text: "It demonstrates that scatter plots are the best chart type", correct: false, feedback: "It demonstrates the NEED to see data; the specific chart follows the question." },
      { text: "It shows that small datasets do not need visualization", correct: false, feedback: "The reverse — eleven points were enough to hide four different stories behind identical statistics." },
    ],
    explanation: "Anscombe 1973: the statistics agreed with each other; the data did not. Only the plot told the truth.",
  },
  {
    id: "a-vas-3",
    prompt: "Your question is 'how did monthly revenue move across the year?' The encoding that answers it directly is:",
    options: [
      { text: "Position along a time-ordered x-axis, one point per month, connected — a line chart", correct: true, feedback: "Correct — change over time is encoded in slope, and time order carries the narrative." },
      { text: "Twelve bars sorted by value, tallest first", correct: false, feedback: "Sorting by value answers 'which month was biggest' — it deliberately destroys the time order the question asks about." },
      { text: "A pie of each month's share of annual revenue", correct: false, feedback: "Shares, not trajectory — a pie has no time axis and no slope." },
      { text: "A table with month-over-month deltas", correct: false, feedback: "It contains the answer, but serially — the reader assembles the trend in memory instead of seeing it." },
    ],
    explanation: "Question → relationship → encoding: 'moved across' names change-over-time, and slope on a time axis is its native encoding.",
  },
  {
    id: "a-vas-4",
    prompt: "A column holds satisfaction ratings 1–5 with labelled poles (very unhappy … very happy). Its data type, and the colour treatment it deserves:",
    options: [
      { text: "Ordinal — an ordered lightness ramp within one hue, never a multi-hue categorical palette", correct: true, feedback: "Correct — order is meaningful but intervals are not guaranteed equal; lightness preserves the order the data owns." },
      { text: "Nominal — any distinct hues, because the values are labels", correct: false, feedback: "The values ARE ordered — rainbow hues would imply difference where order suffices." },
      { text: "Interval — a continuous colour scale, because the numbers are numeric", correct: false, feedback: "Interval requires equal-sized differences; a 1→2 jump need not equal a 4→5 jump in any measured sense." },
      { text: "Ratio — a zero-based colour ramp anchored at black", correct: false, feedback: "There is no true zero on a satisfaction scale — 0 is an unlabelled pole, not an absence." },
    ],
    explanation: "Type drives treatment: nominal gets hue, ordinal gets ordered lightness, interval/ratio get magnitude scales on axes.",
  },
  {
    id: "a-vas-5",
    prompt: "On the encoding-effectiveness ladder, which ordering is correct (most to least accurately decoded)?",
    options: [
      { text: "Position on a common scale > length > angle > area > colour intensity > hue", correct: true, feedback: "Correct — the classic experimental ordering. Position is read with the least error, hue (as a magnitude) with the most." },
      { text: "Hue > area > angle, because colour attracts attention first", correct: false, feedback: "Salience is not accuracy — colour pops out preattentively but is ranked poorly for judging HOW MUCH bigger." },
      { text: "Area > length, because bigger marks are easier to compare", correct: false, feedback: "Humans systematically misjudge areas — a 2× area looks about 1.4×; length on a shared baseline beats it decisively." },
      { text: "Angle > length, which is why pies beat bars", correct: false, feedback: "The reverse — pie slices are angles, and angle comparison is precisely why pies lose to bars." },
    ],
    explanation: "The ladder is the engine behind chart choice: prefer encodings at the top, and treat anything below angle with suspicion.",
  },
  {
    id: "a-vas-6",
    prompt: "Preattentive attributes matter to chart design because they:",
    options: [
      { text: "Are processed in parallel, before conscious attention — so a well-designed chart's key difference can pop out in under 250 ms", correct: true, feedback: "Correct — orientation, length, hue presence are detected preattentively; the design question is spending that free attention on the signal." },
      { text: "Guarantee the reader understands the data", correct: false, feedback: "Detection is not comprehension — pop-out finds the difference; interpretation still must be designed." },
      { text: "Only work with bright colours", correct: false, feedback: "Preattentive processing covers orientation, size, motion and more — brightness is one channel of several." },
      { text: "Are a myth from the 1980s", correct: false, feedback: "The phenomenon is one of the most replicated results in vision science." },
    ],
    explanation: "You get one free, fast comparison per chart. Choose WHICH difference pops out — that is the design decision.",
  },
  {
    id: "a-vas-7",
    prompt: "A diverging colour scale (one hue for below average, another for above) is the right choice when:",
    options: [
      { text: "The data has a meaningful midpoint — deviations in both directions matter (temperature anomaly vs a baseline, profit vs loss)", correct: true, feedback: "Correct — divergence needs a natural zero point; the two hues encode the two meanings of 'away from it'." },
      { text: "You want the chart to look more colourful", correct: false, feedback: "Aesthetics never select the scale — a misused diverging scale invents a midpoint the data does not own." },
      { text: "The variable is categorical", correct: false, feedback: "Categories need distinct, unordered hues; divergence implies a numeric axis with a centre." },
      { text: "You are showing ranks from 1 to 20", correct: false, feedback: "Ranks are ordinal — an ordered lightness ramp; there is no meaningful 'middle rank' deserving its own hue." },
    ],
    explanation: "Scale follows meaning: sequential for magnitude, diverging for signed deviation, categorical for unordered kinds.",
  },
  {
    id: "a-vas-8",
    prompt: "Roughly what share of male readers have some form of colour-vision deficiency — the reason the Okabe-Ito palette exists?",
    options: [
      { text: "About 8% — deuteranomaly being the most common form", correct: true, feedback: "Correct — roughly 1 in 12 men; red–green confusions dominate. Okabe-Ito's eight colours stay distinguishable across CVD types." },
      { text: "About 0.1% — vanishingly rare, so palettes need not consider it", correct: false, feedback: "Off by two orders of magnitude — in a 1,000-reader report, ~70 people may misread a red/green encoding." },
      { text: "About 8% of women", correct: false, feedback: "Women are closer to 0.5% — the genetics differ; the 8% figure belongs to men." },
      { text: "About 50% — everyone sees colour differently", correct: false, feedback: "Individual variation is real, but CVD prevalence is specifically ~8% of men." },
    ],
    explanation: "Design for the audience you actually have: redundant encoding (labels, lightness, shape) plus CVD-safe palettes covers everyone.",
  },
  {
    id: "a-vas-9",
    prompt: "The best chart title is:",
    options: [
      { text: "\"Cold Brew overtook Latte in December\" — the finding itself, with the chart as evidence", correct: true, feedback: "Correct — a title-as-claim lets the reader test the picture against an assertion; a subject-title leaves the interpretation work undone." },
      { text: "\"Cups\" — short and clean", correct: false, feedback: "Short, yes — but it names the unit, not the message; the reader does the analysis the title should carry." },
      { text: "\"Product sales by product for products, December 2024, cups\"", correct: false, feedback: "Metadata belongs in axis labels and captions; the title should state what the data SAYS." },
      { text: "\"Chart 7\"", correct: false, feedback: "A filing label, not a title — no reader can use it." },
    ],
    explanation: "Titles carry claims; axes carry units; captions carry method. Each piece of text has exactly one job.",
  },
  {
    id: "a-vas-10",
    prompt: "Direct labelling (writing 'Oslo' at the end of Oslo's line) beats a side legend because:",
    options: [
      { text: "It removes the look-up: name and mark are one object, and the eye never shuttles between chart and legend", correct: true, feedback: "Correct — legends force a two-step decode (match colour → match name) on every single read; direct labels make it zero-step." },
      { text: "It uses less ink overall", correct: false, feedback: "Often MORE ink — the win is perceptual, not economical." },
      { text: "Legends cannot display more than two series", correct: false, feedback: "Legends scale fine; they are just slower to read." },
      { text: "It works even when lines cross", correct: false, feedback: "Crossings challenge both; labels help most when series end at separated values." },
    ],
    explanation: "Every pixel of separation between a mark and its meaning is a tax on the reader. Direct labels pay it off once.",
  },
  {
    id: "a-vas-11",
    prompt: "A bar chart's y-axis starts at 46 instead of 0. Why is this a specific problem for BARS, not just any chart?",
    options: [
      { text: "Bar value is encoded as LENGTH from the baseline — cutting the axis cuts the length's meaning, so differences are exaggerated in the very property being read", correct: true, feedback: "Correct — the reader decodes bar magnitude as length; truncation inflates that length ratio (a 5% difference can look like 100%)." },
      { text: "It is equally wrong for every chart type, no distinction", correct: false, feedback: "For position encodings (lines, dots) truncation is a defensible zoom — the value is read against gridlines, not from a baseline." },
      { text: "Because software renders truncated bars incorrectly", correct: false, feedback: "The renderer is fine; the perception is broken." },
      { text: "It is only a problem when the values are percentages", correct: false, feedback: "It is a problem for any length-encoded magnitude — counts, currency, rates." },
    ],
    explanation: "Length encodings own a contract with zero. Break it and the property the reader decodes (length ratio) lies about the data's ratio.",
  },
  {
    id: "a-vas-12",
    prompt: "The final honesty check before publishing any chart is:",
    options: [
      { text: "Re-derive the claim from the DATA, then confirm the ink shows the data's actual magnitude — no zoom, cherry-pick or scale trick doing the arguing", correct: true, feedback: "Correct — the chart is an argument; the audit asks whether the argument's visual force matches the numbers' actual force." },
      { text: "Ask a colleague if it looks professional", correct: false, feedback: "Polish is not honesty — a beautiful truncation is still a truncation." },
      { text: "Check that the software produced it without errors", correct: false, feedback: "The renderer faithfully executes whatever mapping it was given — including a misleading one." },
      { text: "Make sure the colours match the brand palette", correct: false, feedback: "Branding is a constraint on style, not a check on truth." },
    ],
    explanation: "The Part A closing discipline: read your own chart as a sceptic would — from the data up, not the ink down.",
  },
];
