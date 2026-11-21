/**
 * PART A · LESSON a-05 — "Visual Perception"
 *
 * What vision does before you "look": preattentive pop-out, the Gestalt
 * laws (proximity, similarity, closure, continuity), and the encoding
 * effectiveness ladder (position > length > angle > area > intensity >
 * hue) — demonstrated live with pie-vs-bar of the same data.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { COFFEE_PRODUCTS, COFFEE_Q1, COFFEE_Q2, COFFEE_Q3, COFFEE_Q4, IRIS_PETAL_LENGTH, IRIS_SEPAL_LENGTH, REVENUE_2024 } from "../datasets";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const coffeeAnnual = COFFEE_PRODUCTS.map(
  (_, i) => COFFEE_Q1[i] + COFFEE_Q2[i] + COFFEE_Q3[i] + COFFEE_Q4[i],
);

/* Illustrative production data (not published statistics): 28 routine
 * deviations plus one flagged sample, spatially embedded in the pack. */
const routineX = [3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40, 42, 44];
const routineY = [-7.2, 5.1, -3.8, 6.4, -5.9, 2.2, -1.5, 7.6, -6.7, 4.0, -2.9, 1.1, -4.6, 8.3, -7.9, 3.3, -0.8, 5.7, -6.1, 2.6, -3.2, 6.9, -5.4, 0.3, 7.1, -2.1, 4.8, -8.1];

export const LESSON_V_A_05: DataVizLesson = {
  slug: "a-05",
  title: "Visual Perception",
  minutes: 25,
  summary:
    "Charts are not read, they are perceived: preattentive pop-out finds the odd mark in a fifth of a second, Gestalt laws build groups before you decide to see them, and the encoding ladder (position > length > angle > area > intensity > hue) sets what the eye can measure.",
  tool: null,
  objectives: [
    "Define preattentive processing and name the attributes that pop out (colour, intensity, orientation, size, position)",
    "Apply the four Gestalt laws — proximity, similarity, closure, continuity — to explain why charts group and fuse the way they do",
    "State the encoding effectiveness ladder and demonstrate the angle-vs-length gap with pie and bar of the same data",
    "Choose encodings that spend the perceptual budget where the question needs precision",
  ],
  why: "Charts are not read, they are perceived. Before a single conscious thought, your visual system has already grouped the marks, found the odd one out, and ranked the lengths. Designing a chart means programming that pre-conscious pipeline — and the pipeline has known performance characteristics: some encodings (position, length) it measures precisely, others (angle, area) it only estimates, others (hue) it merely names. This lesson is the spec sheet for the machinery every one of your charts will run on.",
  blocks: [
    {
      kind: "text",
      text: "Look at a scatter of thirty points and you know — instantly — whether one is the wrong colour, whether they form two clusters, whether the cloud rises. You did not 'read' that; you *perceived* it, in roughly the first **200 milliseconds**, before deliberate attention switched on. That speed is not a curiosity, it is the resource charts spend. A design that forces serial reading (a 200-row table) spends consciousness, which is slow and scarce; a design that leans on early vision spends perception, which is fast and free. The craft is knowing what early vision can and cannot do.",
    },
    {
      kind: "definition",
      term: "Preattentive attribute",
      informal:
        "A visual property the eye processes before conscious attention: colour hue, colour intensity, orientation, size, position. A single differing attribute 'pops out' in under ~200 ms, regardless of how many other marks surround it.",
      why: "Pop-out is the fastest channel a chart has. Dashboards that mark 'the failing server' with one flipped hue are spending it; dashboards that rely on a sorted table are not.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Deviation from target, 29 samples (illustrative)",
        points: [
          { x: 23, y: 0.6, label: "the flagged sample" },
          ...routineX.map((x, i) => ({ x, y: routineY[i], label: "routine" })),
        ],
        xLabel: "sample",
        yLabel: "deviation",
      },
      why: "Find the flagged sample. You did not scan 29 points — the single colour difference (one teal mark among the orange) handed it over before you read an axis. That is preattentive pop-out: the flagged point's position and value are perfectly ordinary; only its colour tells you where to look.",
    },
    {
      kind: "text",
      text: "Early vision does not just detect; it **organizes**. The *Gestalt* principles are its filing rules, and four of them run almost every chart you will draw. **Proximity**: marks near each other become one group. **Similarity**: marks that look alike become one group. **Closure**: a shape with gaps is completed into a whole. **Continuity**: marks that line up are fused into a path. A chart is not a set of independent marks — it is whatever these rules assemble from them.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Iris measurements: petal length vs sepal length",
        points: IRIS_SEPAL_LENGTH.map((x, i) => ({ x, y: IRIS_PETAL_LENGTH[i] })),
        xLabel: "sepal length (cm)",
        yLabel: "petal length (cm)",
      },
      why: "No colour, no legend, no grouping drawn — and yet you see two groups. Proximity alone did it: one cluster's petals run 1.1–1.7 cm, the other's 4.0–4.9 cm, and the vertical gap between them is perceived as a boundary before any label is read. (Fisher's iris data — the clustering is the flowers', not the chart's.)",
    },
    {
      kind: "chart",
      chart: {
        type: "area",
        title: "Monthly revenue, 2024 (k$)",
        categories: months,
        series: [{ name: "revenue", values: REVENUE_2024 }],
        yLabel: "k$",
        showLegend: false,
      },
      why: "Twelve discrete measurements — but you see one continuous rise (continuity fuses the points into a trajectory) and one filled region whose height you compare across months (closure completes the shape). The eye invents the line and closes the area; the chart merely invites it to.",
    },
    { kind: "heading", text: "The encoding effectiveness ladder" },
    {
      kind: "table",
      title: "What the eye measures, ranked",
      headers: ["Rank", "Encoding", "How precisely the eye judges it", "Everyday use"],
      rows: [
        ["1", "Position along a common scale", "Excellent — marks judged against a shared axis", "scatter dots, line heights, dot plots"],
        ["2", "Length", "Good — bars on a shared baseline compare almost as well", "bar charts"],
        ["3", "Angle", "Poorer — small angle differences are systematically misjudged", "pie slices"],
        ["4", "Area", "Poorer still — areas are consistently underestimated", "bubbles, packed areas"],
        ["5", "Colour intensity (lightness)", "Rough ordering only — 'more vs less', never 'how much more'", "heatmaps, choropleths"],
        ["6", "Hue", "No order at all — a naming channel, not a measuring one", "series and category colours"],
      ],
      caption:
        "Cleveland & McGill's effectiveness ranking, simplified. When a chart could encode the same value two ways, choose the higher rung — the reader's precision is decided by the rung, not by effort.",
    },
    {
      kind: "text",
      text: "The ladder's most famous contest is **angle vs length**, and the pie chart loses it. Below, the same four annual totals rendered both ways. The pie encodes each share as a slice angle; the bar encodes it as a length from zero. Same data, same question ('which is biggest?') — perceptually, two different sports.",
    },
    {
      kind: "chart",
      chart: {
        type: "pie",
        title: "Share of 2024 cups by product (angle)",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "2024 cups", values: coffeeAnnual }],
        showLegend: false,
      },
      why: "Angle encoding, rung 3. The two leaders — Latte 32% (a 115° slice) and Cold Brew 30% (a 108° slice) — differ by about 6 degrees of arc: inside the margin of visual error. Clockwise from 12: Espresso, Latte, Filter, Cold Brew.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "2024 cups by product (length)",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "2024 cups", values: coffeeAnnual }],
        yLabel: "cups",
        sortDesc: true,
        showValues: true,
        showLegend: false,
      },
      why: "Length encoding, rung 2, on a shared zero baseline. Latte (2443) and Cold Brew (2307) are still a near-tie — but the ranking is no longer in doubt, because length differences are judged far more precisely than angle differences.",
    },
    {
      kind: "interpretation",
      id: "a-05-i1",
      chart: {
        type: "pie",
        title: "Share of 2024 cups by product (angle)",
        categories: COFFEE_PRODUCTS,
        series: [{ name: "2024 cups", values: coffeeAnnual }],
        showLegend: false,
      },
      prompt:
        "Compared with a bar chart of the same four totals, which reading is this pie genuinely worse at?",
      options: [
        {
          text: "Ranking the two largest: Latte (32%, a 115° slice) against Cold Brew (30%, a 108° slice) — a 6° difference no eye reliably detects, while the bar's lengths (2443 vs 2307 cups) order them at a glance",
          correct: true,
          feedback:
            "Correct — the 136-cup gap becomes about 6 degrees of arc: inside the margin of visual error. On the bar, the same gap is a visible length difference, because length sits two rungs above angle.",
        },
        {
          text: "Seeing each product's share of the total",
          correct: false,
          feedback: "That IS the pie's home turf — 32% against Filter's 15% is coarse but honest part-to-whole, which is precisely why pies survive.",
        },
        {
          text: "Counting the four products",
          correct: false,
          feedback: "Four slices are countable in either chart; angle's cost appears in fine comparisons, not enumeration.",
        },
        {
          text: "Nothing — pie and bar are interchangeable for the same data",
          correct: false,
          feedback: "They encode identical values through different channels, and the channels differ in precision — that difference is the entire ladder lesson.",
        },
      ],
      explanation:
        "Angle vs length is the classic ladder demonstration: the same 136-cup, 6.5% gap that a bar renders as a detectable length difference hides inside two near-indistinguishable arcs. Both charts are honest; only one is precise.",
    },
    {
      kind: "exercise",
      id: "a-05-e1",
      exerciseKind: "concept-check",
      prompt:
        "A monitoring dashboard shows 200 server tiles and must make 'the one failing server' findable in under a second, day or night. Which design spends preattentive processing, and why is a sorted table of 200 rows the wrong instrument?",
      options: [
        {
          text: "Flip the failing tile's hue or intensity — colour pop-out is preattentive (~200 ms) and its speed is independent of how many tiles surround it; a table forces serial scanning of 200 rows, one lookup at a time",
          correct: true,
          feedback:
            "Correct — pop-out does not get slower with clutter, which is exactly the property an at-a-glance alarm needs. Serial search does get slower, linearly.",
        },
        {
          text: "Sort the table by status so the failing server appears in the first row",
          correct: false,
          feedback: "Helpful, but still serial: the reader must trust the sort and read rows. Pop-out needs no reading order at all.",
        },
        {
          text: "Make the failing tile larger than the others",
          correct: false,
          feedback: "Size can pop out too — but a resized tile breaks the grid and whispers 'more data here' rather than 'look here'. Hue is the cleaner alarm.",
        },
        {
          text: "Put a red border around the whole dashboard",
          correct: false,
          feedback: "A global alarm says 'look somewhere'; a preattentive design says exactly WHERE. The channel must carry the location, not just the urgency.",
        },
      ],
      hint: "Which instrument finds one odd item without searching — and does not slow down as the number of items grows?",
      explanation:
        "Preattentive attributes are searched in parallel: the odd hue is found at the same speed among 200 tiles as among 20. Tables are searched serially, one row at a time — the wrong instrument for an alarm.",
    },
  ],
  terms: [
    {
      term: "preattentive attribute",
      definition: "A visual property processed before conscious attention — hue, intensity, orientation, size, position. A single differing attribute pops out in under ~200 ms regardless of distractor count.",
    },
    {
      term: "Gestalt principles",
      definition: "The visual system's organizing rules: proximity groups near marks, similarity groups alike marks, closure completes shapes with gaps, continuity fuses aligned marks into paths.",
    },
    {
      term: "encoding effectiveness ladder",
      definition: "The ranking of encodings by judged precision: position > length > angle > area > colour intensity > hue (Cleveland & McGill). When two encodings are available, choose the higher rung.",
    },
    {
      term: "pop-out effect",
      definition: "The instantaneous detection of a mark differing in a preattentive attribute — one teal dot among 29 orange ones is found without searching. The perceptual basis for dashboards and alarms.",
    },
  ],
  takeaways: [
    "Charts are perceived before they are read: preattentive attributes (hue, intensity, size, position) deliver information in ~200 ms without serial search.",
    "The four Gestalt laws — proximity, similarity, closure, continuity — assemble marks into groups and paths before any legend is consulted; design with them, not against them.",
    "The effectiveness ladder is a precision budget: position and length are measured, angle and area estimated, intensity roughly ordered, hue merely named.",
    "Pie vs bar of the same data is the ladder in action: a 6° arc difference (Latte 115° vs Cold Brew 108°) hides a ranking that bar lengths make obvious.",
  ],
  quiz: [
    {
      id: "a-05-q1",
      prompt: "What makes an attribute 'preattentive'?",
      options: [
        { text: "It is processed in the first ~200 ms, before conscious attention — and detection speed does not grow with the number of distracting marks", correct: true, feedback: "Parallel processing: one odd hue is found among 200 as fast as among 20. That independence from clutter is the whole value." },
        { text: "It is the attribute readers find most beautiful", correct: false, feedback: "Aesthetics are a matter of taste; preattentive processing is a measured property of early vision, before opinion forms." },
        { text: "It only works on charts with fewer than ten marks", correct: false, feedback: "The opposite — pop-out's signature is that it does NOT slow down as marks multiply." },
        { text: "It requires training in statistics to perceive", correct: false, feedback: "Training-free is the point: the effect operates before deliberate reading begins." },
      ],
      explanation: "Preattentive attributes are processed in parallel by early vision — fast, effortless, and independent of clutter, which makes them the alarm channel of choice.",
    },
    {
      id: "a-05-q2",
      prompt: "The uncoloured, unlegended iris scatter showed two obvious groups. Which Gestalt law did the work?",
      options: [
        { text: "Proximity — the marks fell into two spatial clusters with a gap between them", correct: true, feedback: "Petals of 1.1–1.7 cm versus 4.0–4.9 cm leave a vertical gap, and near-marks-group is proximity doing its filing work." },
        { text: "Similarity — the dots had matching colours", correct: false, feedback: "There was only one colour in that panel — grouping had to come from somewhere else." },
        { text: "Closure — the eye completed two circles", correct: false, feedback: "Closure completes outlines around shapes; nothing was outlined here." },
        { text: "Continuity — the dots lined up along two lines", correct: false, feedback: "Each cluster has internal rise-and-fall, but the perceived boundary between the groups is spatial — proximity's signature." },
      ],
      explanation: "With no colour, legend or outline, proximity alone grouped the marks — the strongest reminder that grouping happens before labels.",
    },
    {
      id: "a-05-q3",
      prompt: "Which ordering matches the encoding effectiveness ladder, most precise first?",
      options: [
        { text: "Position > length > angle > area > colour intensity > hue", correct: true, feedback: "Cleveland & McGill's ranking: measured, measured, estimated, underestimated, roughly ordered, merely named." },
        { text: "Hue > area > angle > length > position", correct: false, feedback: "Exactly reversed — hue is a naming channel with no order at all, not a precision instrument." },
        { text: "Angle > length > position > area", correct: false, feedback: "Angle outranks only area and below — pies sit mid-ladder at best, which is the pie-vs-bar lesson." },
        { text: "All encodings are equally precise with good design", correct: false, feedback: "Good design chooses the best rung available; it cannot promote angle to length's precision. The ladder is about the eye, not the effort." },
      ],
      explanation: "The ladder is empirical: position and length are judged precisely, angle and area poorly, intensity roughly, hue not at all. Encoding choice = precision choice.",
    },
  ],
};
