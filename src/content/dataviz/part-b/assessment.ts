/**
 * PART_B_V_ASSESSMENT — the Part B checkpoint (12 questions, roughly
 * one per lesson), spanning: the object model (b-01), line styling
 * and zorder (b-02), bar orientation and grouped offsets (b-03), the
 * bin sweep (b-04), scatter channels and alpha (b-05), the pie's
 * honest range (b-06), boxes vs bars of means (b-07), shared scales
 * in panels (b-08), annotate coordinates and the budget (b-09),
 * dress vs meaning (b-10), zoom rules and log scales (b-11), and the
 * dpi arithmetic of export (b-12).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_B_V_ASSESSMENT: QuizQuestion[] = [
  {
    id: "b-vas-1",
    prompt: "A script builds two Axes side by side; a later plt.ylabel(\"cups\") lands on the wrong panel. The most precise diagnosis is:",
    options: [
      { text: "pyplot's state-machine interface routed the call to its implicit current Axes — not the one you meant — and with more than one Axes in play, the fix is naming the target: ax.set_ylabel on the specific Axes", correct: true, feedback: "Correct — the two interfaces drive the same object model; the implicit one stops being trustworthy the moment a second plot area exists." },
      { text: "Axis labels cannot be set after data is drawn", correct: false, feedback: "Labels can be set any time before the render; ordering is not the issue here — targeting is." },
      { text: "The Figure owns all labels, so the call should have applied figure-wide", correct: false, feedback: "The Figure owns the canvas and the export; labels belong to each Axes — which is exactly why the call hit only one panel." },
      { text: "A matplotlib version bug — upgrading will fix it", correct: false, feedback: "No bug: routing to the current Axes is the documented state-machine contract, which is why the explicit interface is taught from b-01." },
    ],
    explanation: "Every pyplot call forwards to a current Axes. The explicit fig, ax spelling names its target — the habit that becomes mandatory the moment subplot grids arrive (b-08).",
  },
  {
    id: "b-vas-2",
    prompt: "Two monthly lines — 2023 and 2024 revenue — must stay distinguishable in a grayscale printout. Which construction does the work?",
    options: [
      { text: "label= on each ax.plot plus one ax.legend() call, with the series separated by marker AND linestyle as well as hue", correct: true, feedback: "Correct — redundant encoding: hue for color readers, marker shape and dash pattern for the photocopier and colour-blind readers." },
      { text: "Rely on the two default hues — two different colors read fine in grey", correct: false, feedback: "Two distinct hues often collapse to near-identical greys; hue alone is the fragile plan that fails exactly when the print comes out." },
      { text: "Make one line much thicker so the two never get confused", correct: false, feedback: "Width separates ink, not identity — a thick line is still ambiguous in grey wherever the lines cross." },
      { text: "Omit the legend and explain the colors in the report's body text", correct: false, feedback: "Moving identity into prose taxes every read with a lookup — the chart should carry its own key." },
    ],
    explanation: "Part A's redundant-encoding rule in b-02's syntax: label each series as you draw it, then let marker and linestyle carry identity when hue cannot.",
  },
  {
    id: "b-vas-3",
    prompt: "The grouped-bar recipe starts with x = np.arange(len(products)) instead of passing the product names straight to ax.bar. Why?",
    options: [
      { text: "The offsets — x − w, x + w — need numeric slot positions: you cannot subtract a bar width from a string, and set_xticks(x, products) restores the names afterwards", correct: true, feedback: "Correct — under every categorical-looking axis sits a numeric one, and grouped bars are the first chart where you touch that machinery yourself." },
      { text: "Because ax.bar refuses string categories entirely", correct: false, feedback: "It accepts them happily for single-series charts; the need for position arithmetic is what forces numbers here." },
      { text: "Because np.arange sorts the categories by value for you", correct: false, feedback: "arange only counts 0, 1, 2, ...; any sorting is your job before the call — by design." },
      { text: "Because the legend requires numeric x positions", correct: false, feedback: "The legend reads the label= arguments; x positions are not involved in building it." },
    ],
    explanation: "Grouped bars are offset arithmetic on numeric slots: strings position bars but cannot be shifted, so the recipe counts slots, shifts by widths, then names the ticks.",
  },
  {
    id: "b-vas-4",
    prompt: "Before claiming a shape from a histogram, the honest workflow taught in b-04 is:",
    options: [
      { text: "Re-draw the same data at several bin counts and report what survives the sweep — a claim that exists at one bin count and dies at another was never a claim about the data", correct: true, feedback: "Correct — binwidth is a free parameter the data did not choose; the sweep is the defense against structure you invented." },
      { text: "Always use the default 10 bins — matplotlib's default is a verdict", correct: false, feedback: "The default is a starting point, not a verdict: the petal data changes its story between 4 and 10 bins." },
      { text: "Choose the bin count that produces the cleanest-looking chart", correct: false, feedback: "Cleanest is exactly how a too-coarse bin count welds two real clusters into one tidy, wrong shape." },
      { text: "Report the mean instead — one number cannot mislead", correct: false, feedback: "The mean of a bimodal sample lands in the empty middle and describes neither cluster." },
    ],
    explanation: "Too few bins weld modes together, too many shred them into sampling noise; structure that survives several bin counts is structure the data owns.",
  },
  {
    id: "b-vas-5",
    prompt: "ax.scatter on 5,000 delivery records at default settings produces a solid blot. The honest repair is:",
    options: [
      { text: "alpha of roughly 0.1–0.3 with a small marker size, so overlapping translucent marks accumulate ink and darkness maps to local density", correct: true, feedback: "Correct — alpha converts overplotting from a bug into a density encoding: where the records stack, the ink deepens." },
      { text: "Plot a random sample of 30 records so the chart is clean", correct: false, feedback: "Clean and dishonest — the question was where 5,000 records concentrate, and ~99% of them were deleted." },
      { text: "Enlarge the markers so each point is clearly visible", correct: false, feedback: "Bigger markers overplot harder — the blot gets blottier. At scale, less ink per point is the answer." },
      { text: "Give every point a unique color so none is hidden", correct: false, feedback: "Five thousand hues are indistinguishable and do nothing about geometry — color cannot fix stacking." },
    ],
    explanation: "Overplotting is the scatter plot's failure mode at scale; translucent marks turn the stack into shading proportional to density — or, past that, bin into a heatmap (Part C's ground).",
  },
  {
    id: "b-vas-6",
    prompt: "Which request falls OUTSIDE the pie chart's honest range?",
    options: [
      { text: "'Show this year's market shares beside last year's' — angles are compared within one circle, never across two; twin pies ask the reader for a comparison the encoding cannot carry", correct: true, feedback: "Correct — the twin-pie comparison is the classic abuse; the honest form is grouped or sorted bars on a shared axis." },
      { text: "'Show how the four-part budget splits 45 / 25 / 20 / 10'", correct: false, feedback: "Few parts, clearly different shares, fractions as the story — squarely inside the range." },
      { text: "'Show what fraction of annual cups each of our four products sold'", correct: false, feedback: "Four parts of one meaningful whole — the pie's home turf, exactly b-06's worked example." },
      { text: "'Show the two largest channels' share of total spend'", correct: false, feedback: "Two slices is the simplest case a pie handles well — few parts, big visible differences." },
    ],
    explanation: "The pie owns exactly one question — what fraction of this whole — with few parts and visible differences; cross-circle comparison, many slices and sliver slices all belong to bars.",
  },
  {
    id: "b-vas-7",
    prompt: "The satisfaction survey arrives as five bars of five department means. What would the box plots you draw instead show that the bars hid?",
    options: [
      { text: "Spread and overlap: Design's lowest response (7) is above Support's highest (6) — complete separation — while Sales and Ops share a median of 6 with visibly different disagreement inside", correct: true, feedback: "Correct — medians, IQRs and whiskers carry the comparison of distributions; one number per group never could." },
      { text: "The exact number of respondents per department", correct: false, feedback: "Neither bars nor boxes carry n by default — box WIDTH would, and does not; every department here has 12 responses either way." },
      { text: "The same means, but drawn horizontally instead", correct: false, feedback: "Rotating the same summary changes nothing — the dropped information is the spread, not the orientation." },
      { text: "Which department responded fastest to the survey", correct: false, feedback: "Response time is not a variable on this chart; boxes summarize the scores and nothing else." },
    ],
    explanation: "Means hide the spread, and the spread is often the news — the bar-of-means habit is b-07's named wrong chart, and the box plot is its honest replacement.",
  },
  {
    id: "b-vas-8",
    prompt: "Two panels show 2023 and 2024 revenue, each with its own auto-scaled y-axis. What has the designer accidentally built?",
    options: [
      { text: "Two separate charts wearing a costume: the panels look comparable while line heights cannot be compared across the boundary — sharey=True is the repair", correct: true, feedback: "Correct — one ruler for both panels is what turns two plots into one comparison; private scales invite a false reading that no tick label can repair." },
      { text: "A small-multiples figure, correctly built", correct: false, feedback: "Small multiples share one scale — same chart, same ruler, one panel per group; private axes break the pattern's single rule." },
      { text: "A more honest chart, since each year gets its best resolution", correct: false, feedback: "Resolution that breaks cross-panel comparison is not honesty: 2023's 148 and 2024's 204 must live on one ruler to be compared." },
      { text: "An error state — matplotlib refuses private axes inside one figure", correct: false, feedback: "It happily draws them; the failure is perceptual, not mechanical." },
    ],
    explanation: "sharex/sharey is the honesty rule of panels: compared tiles share a scale, and any deliberate break in sharing is announced loudly, never slipped in.",
  },
  {
    id: "b-vas-9",
    prompt: "In ax.annotate(\"steepest climb: +18 k$\", xy=(10, 171), xytext=(6, 180)), what is xy=(10, 171)?",
    options: [
      { text: "The data coordinate the arrow tip touches — x position 10 (October, the eleventh month) at y value 171", correct: true, feedback: "Correct — xy is the evidence, xytext is where the prose floats, and both are data coordinates by default." },
      { text: "The pixel position of the text box on the screen", correct: false, feedback: "Nothing in annotate is pixels by default — the default coordinate system is the data's own." },
      { text: "A figure-fraction position, 10% in from the left", correct: false, feedback: "Figure fractions would need an explicit transform (fig.transFigure); the default is data space." },
      { text: "The font size and rotation of the label", correct: false, feedback: "Typography lives in annotate's fontsize and rotation arguments — xy is purely a location." },
    ],
    explanation: "xy names the point, xytext names the prose, arrowprops wires them; data coordinates keep the annotation glued to its evidence when the figure is resized.",
  },
  {
    id: "b-vas-10",
    prompt: "Switching a style sheet changes four things about a bar chart. Which change crossed the line from dress into meaning?",
    options: [
      { text: "The bars, previously drawn from zero, now start at 140 because the new look 'includes tight y-limits'", correct: true, feedback: "Correct — the baseline is the argument, not the outfit; no legitimate style ships axis limits, and a look that requires truncation is an edit." },
      { text: "The gridlines switched from solid to dashed", correct: false, feedback: "Pure furniture — no reading of the data changes with the grid's dash pattern." },
      { text: "The typeface switched from sans-serif to serif", correct: false, feedback: "Typography is dress; values, scales and encodings are untouched." },
      { text: "The color cycle moved from muted tones to a warmer palette", correct: false, feedback: "Palette is dress — with the standing a-06 caveats about accessibility, but meaning has not moved." },
    ],
    explanation: "The boundary test: dress is what you could change without touching the chart's claims. Baselines, scales and encodings ARE the claims — a style that edits them is not a style.",
  },
  {
    id: "b-vas-11",
    prompt: "Which dataset EARNS ax.set_yscale(\"log\")?",
    options: [
      { text: "API response times clustered at 30–60 ms with spikes to 3,000 ms and one 12,000 ms outage — three orders of magnitude under one roof", correct: true, feedback: "Correct — log makes each doubling equally tall, so the daily texture and the spikes are both readable, with the cost (absolute distances get harder) disclosed by the tick labels." },
      { text: "Monthly revenue moving from 124 to 204 k$ across a year", correct: false, feedback: "A 1.6x range inside one order of magnitude — linear is the honest geometry, and log would turn plain growth into a ratio puzzle." },
      { text: "Satisfaction scores on a 1–10 scale", correct: false, feedback: "A bounded ordinal scale — log means nothing on it." },
      { text: "Four cities' temperatures from −3 to 33 °C", correct: false, feedback: "Besides spanning zero, which log cannot handle, a 36-degree range is exactly what linear rulers were built for." },
    ],
    explanation: "The trigger is orders of magnitude: when the giants flatten everyone else into the floor line, log restores the small values' texture — at the known, disclosed cost of absolute-difference readings.",
  },
  {
    id: "b-vas-12",
    prompt: "A 12×6.75-inch slide figure is saved with dpi=200. How many pixels wide is the file, and why?",
    options: [
      { text: "2,400 px — 12 inches × 200 dots per inch; a saved figure's pixel size is always figsize × dpi", correct: true, feedback: "Correct — and 6.75 × 200 = 1,350 px tall. The multiplication is the entire content of 'dpi'." },
      { text: "200 px — dpi sets the width directly", correct: false, feedback: "dpi is a density (dots PER inch), not a pixel count; the width comes from multiplying by the inches." },
      { text: "12 px — the figure is 12 wide", correct: false, feedback: "12 is INCHES; pixels require the density factor." },
      { text: "3,600 px — the 300-dpi print standard applies to every export", correct: false, feedback: "That would be dpi=300 on a 12-inch figure; this export asked for 200. Same figure, two-thirds the density, two-thirds the pixels." },
    ],
    explanation: "Export literacy is doing the arithmetic before the meeting: pixels ÷ placed inches = effective dpi, and every export decision — retina checks, print bars, slide widths — reduces to it.",
  },
];
