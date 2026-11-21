/**
 * PART A · LESSON a-08 — "Avoiding Misleading Visualizations"
 *
 * The device catalogue, demonstrated live: the truncated axis, the
 * cherry-picked window, the denominator swap, area inflation, the
 * aspect-ratio flattening — each rigged chart is rendered from real
 * data, then repaired, because you cannot catch a device you have
 * never seen working.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { REVENUE_2024, TRAFFIC_DAYS, TRAFFIC_VISITORS } from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
/** Quarterly revenue derived from the shared monthly series (k$). */
const revenueByQuarter = [0, 1, 2, 3].map((q) =>
  REVENUE_2024.slice(q * 3, q * 3 + 3).reduce((a, v) => a + v, 0),
); // 383, 444, 475, 564

/** A six-day window into the shared 28-day traffic dataset. */
const trafficWindow = TRAFFIC_VISITORS.slice(4, 10);
const windowLabels = TRAFFIC_DAYS.slice(4, 10);

export const LESSON_V_A_08: DataVizLesson = {
  slug: "a-08",
  title: "Avoiding Misleading Visualizations",
  minutes: 25,
  summary:
    "The device catalogue — truncated axes, cherry-picked windows, denominator swaps, area inflation — each rendered live from real data, then repaired, plus the diagnostics that catch a rigged chart in five seconds.",
  tool: null,
  objectives: [
    "Name the four classic misleading devices and the distortion each one exploits",
    "Explain why a truncated axis lies for bars but only zooms for lines — and state the repair for each",
    "Catch cherry-picked windows and denominator games with two diagnostic questions: what surrounds this window, and per what?",
    "Audit any chart by re-deriving its claim from the data before trusting the ink",
  ],
  why: "Misleading charts almost never lie about their data — the numbers are usually perfectly true. They lie about their PROPORTIONS, their WINDOWS and their DENOMINATORS: a bar that towers because the axis starts at 380, a 'collapse' that is a weekly rhythm seen through a six-day window, a safety ranking that crowns the wrong branch because it counted incidents without counting rides. You cannot catch these devices with honesty alone; you catch them by having seen them work. So this lesson does something most chart guides do in cartoons: it renders each device live, from real data, with the same engine that drew every honest chart in this course — and then repairs it, so your eye holds both versions at once. The skill you leave with is a five-second audit habit that works on any chart anyone ever hands you.",
  blocks: [
    {
      kind: "text",
      text: "A chart is an argument, and arguments can be rigged without a single false number. Every classic misleading device works the same way: it keeps the **data** true while corrupting the **relationship** the reader perceives — how big, compared to what, over which window, relative to which base. That is why 'the numbers are right' is never a defence of a chart, and why the honest analyst audits the FRAME as hard as the figures. Four devices cover most of what you will meet in the wild; each gets the same treatment here — rigged version, diagnosis, repair.",
    },
    { kind: "heading", text: "Device 1 — the truncated axis" },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Revenue is up 47% and accelerating — a breakout year",
        categories: quarters,
        series: [{ name: "revenue", values: revenueByQuarter }],
        yLabel: "revenue (k$)",
        showValues: true,
        showLegend: false,
        yFromZero: false,
      },
      why: "Every number on this chart is true: 383, 444, 475 and 564 k$ are the real 2024 quarters, and 47% is the real growth. The lie is in the bars: the y-axis starts near the data's floor, so Q4's bar is dozens of times LONGER than Q1's — a 1.5× difference drawn as an avalanche.",
    },
    {
      kind: "text",
      text: "The diagnosis is one question: **where does the value axis start, and is the encoding length or position?** Bars encode value by *length* from a baseline — cut the baseline and you have broken the ruler, because the reader's eye compares the visible stubs, not the hidden distances. The repair follows directly: for bars, restart the axis at zero and let the honest ratio show (a 1.5× year is a good year, not a miracle). If the story really lives in the small moves, switch to a **line chart** — its values are read as *positions* against a gridded axis, and a zoomed axis is then a legitimate magnifier, provided the reader can see it is a zoom. Truncation is a lie for length and a zoom for position; know which world your mark lives in.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Quarterly revenue grew 47% in 2024 — steady, not explosive",
        categories: quarters,
        series: [{ name: "revenue", values: revenueByQuarter }],
        yLabel: "revenue (k$)",
        showValues: true,
        showLegend: false,
      },
      why: "The repair: same data, same ink, axis at zero. Q4's bar is now honestly 1.47× Q1's — visible growth, honestly proportioned. The claim title still carries the finding; it just stops shouting. Notice how much drama the repair removed — that drama was never in the data.",
    },
    { kind: "heading", text: "Device 2 — the cherry-picked window" },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Traffic collapsed 46% overnight",
        categories: windowLabels,
        series: [{ name: "visitors", values: trafficWindow }],
        yLabel: "visitors",
        showLegend: false,
      },
      why: "Also true: Day 7 logged 2,260 visitors and Day 8 logged 1,220 — a 46% fall. But the window is the argument: six days, chosen so the fall sits at its centre. The chart's frame implies an event; the data's rhythm says otherwise.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "The weekly rhythm: weekends double, Mondays reset",
        categories: TRAFFIC_DAYS,
        series: [{ name: "visitors", values: TRAFFIC_VISITORS }],
        yLabel: "visitors",
        showLegend: false,
      },
      why: "The repair: widen the window to all 28 days and the 'collapse' happens four times — every Monday, after every weekend. Nothing collapsed; the site simply has a weekly pulse (weekdays near 1,200–1,500, weekends above 2,100). The window a chart shows is itself a claim about what matters.",
    },
    { kind: "heading", text: "Device 3 — the denominator swap" },
    {
      kind: "text",
      text: "The quietest device changes neither the ink nor the axis — only the question the numbers answer. A transit operator's report shows **Downtown logged 200 passenger incidents to the Airport branch's 150**, and concludes Downtown is the trouble spot. Counts are the wrong denominator for a risk claim: Downtown moves 50,000 rides a week, the Airport 20,000. Per thousand rides, Downtown runs at **4.0** and the Airport at **7.5** — per-ride trouble concentrates at the Airport, and the count chart crowns the wrong branch. The diagnostic is two words: *per what?* Volume questions (where do most incidents happen — staff the desk accordingly) are honestly answered by counts; risk questions (where is a single ride most likely to go wrong — fix that branch) demand a rate. Swapping one for the other is how true numbers end up arguing the wrong side.",
    },
    {
      kind: "text",
      text: "**Device 4 — the inflated mark (and its cousins).** Humans judge area the way they judge length — badly scaled. Double a picture's height AND width and you have quadrupled its area, but the eye reads 'about twice as big'. That is the engine behind the pictogram that makes this year's factory four times the ink of last year's for a 2× output gain, and behind comparing circles by diameter. The repair is to leave the ranking to a channel that respects it: bars from a zero baseline, with the values labelled so the numbers finish the argument. Two quieter cousins complete the family: the **exploded or offset slice** that borrows emphasis a pie cannot honestly give, and the **aspect-ratio flattening** — stretch a chart wide and every slope lies down; squeeze it tall and every ripple looks like a crisis. Slope encodes rate of change only when the aspect ratio is chosen for it, not for the slide's empty corner.",
    },
    {
      kind: "interpretation",
      id: "a-08-i1",
      chart: {
        type: "bar",
        title: "Passenger incidents by branch, this week",
        categories: ["Downtown", "Airport"],
        series: [{ name: "incidents", values: [200, 150] }],
        yLabel: "incidents",
        showValues: true,
        showLegend: false,
      },
      prompt:
        "This is the report chart exactly as published — true numbers, zero-based bars, clean labels. Which claim survives contact with the denominators (Downtown: 200 incidents on 50,000 rides; Airport: 150 on 20,000)?",
      options: [
        {
          text: "Downtown carries a third more raw incidents, but the Airport's per-ride rate is nearly twice as high (7.5 vs 4.0 per thousand) — so this chart answers the staffing question while silently implying the opposite of the safety answer",
          correct: true,
          feedback:
            "Correct — the chart itself is honest; the trap is the question it gets used for. Counts rank volume, rates rank risk, and the report swapped them without saying so.",
        },
        {
          text: "Downtown is clearly the more dangerous branch — 200 beats 150",
          correct: false,
          feedback: "200 incidents among 50,000 rides is 4.0 per thousand; 150 among 20,000 is 7.5. On risk — the question 'dangerous' asks — the ranking inverts.",
        },
        {
          text: "The Airport is safer because fewer things go wrong there",
          correct: false,
          feedback: "Fewer in total, more per ride. 'Safer' is a rate claim, and the Airport's rate is the higher one.",
        },
        {
          text: "The chart is misleading and must be withdrawn",
          correct: false,
          feedback: "The chart is fine for 'where do incidents land' — a staffing question. What misleads is quoting it as a safety ranking; the repair is the denominator, not the withdrawal.",
        },
      ],
      explanation:
        "The denominator is part of the claim. Before accepting any ranking, ask per what? — and notice that this lesson's most dangerous chart was also its most technically correct one.",
    },
    {
      kind: "exercise",
      id: "a-08-e1",
      exerciseKind: "critique",
      chart: {
        type: "bar",
        title: "The website channel is pulling away!",
        categories: ["App", "Website"],
        series: [{ name: "signups", values: [102, 118] }],
        yLabel: "signups",
        yFromZero: false,
        showLegend: false,
      },
      prompt:
        "This chart came from a growth review. Audit it: name every device at work, state what the data actually supports, and write the repaired claim title.",
      options: [
        {
          text: "Truncated axis on a length encoding: the bars start near 100, so a 16-signup gap (102 vs 118, about 15%) is drawn as roughly a nine-fold difference. The data supports only 'the Website leads signups by 15%'; a repaired title reads exactly that — on a zero-based axis",
          correct: true,
          feedback:
            "Correct — device identified (truncated length), the honest ratio recovered from the values (102 and 118 are printed nowhere, so re-derive them), and the repair names both the axis fix and the calmer claim.",
        },
        {
          text: "The chart is honest — the Website bar is taller, and it IS the leader",
          correct: false,
          feedback: "The ranking is real; the MAGNITUDE is fabricated by the frame. 'Taller' on a cut axis is not evidence of 'pulling away'.",
        },
        {
          text: "The main problem is the missing legend",
          correct: false,
          feedback: "A single series needs no legend (a-07). The axis is the defect — reaching for cosmetic fixes lets the structural one through.",
        },
        {
          text: "The repair is to switch to a pie chart of the two channels",
          correct: false,
          feedback: "A pie of two slices dodges the truncation but buys angle-and-area comparison — the weakest channels (a-05). The zero-based bar is the repair.",
        },
      ],
      hint: "Where does the axis start? What would the bars look like from zero? What does the title claim beyond the data?",
      explanation:
        "The audit habit in one pass: check the axis against the encoding, re-derive the ratio from the data, then rewrite the claim at the size the data actually supports.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The five-second audit",
      text: "Four questions catch nearly every rigged chart: Where does the axis start — and is the mark a length or a position? What surrounds this window — what do the five periods before and after show? Per what — is the number a count or a rate, and does the claim match? And what is the honest ratio — recompute it from the values, never from the ink. A chart is an argument: check its evidence, not its conclusion.",
    },
  ],
  terms: [
    {
      term: "truncated axis",
      definition:
        "A value axis that starts above the meaningful baseline (usually zero). It breaks length encodings (bars exaggerate differences) while merely zooming position encodings (lines) — the axis must declare which world it is in.",
    },
    {
      term: "cherry-picked window",
      definition:
        "A time span chosen so a fluctuation reads as an event. The diagnostic: widen the window — if the 'event' recurs every period, it is rhythm, not news.",
    },
    {
      term: "denominator swap",
      definition:
        "Answering a rate question with a count (or vice versa). 'Per what?' is the diagnostic; volume questions take counts, risk questions take rates.",
    },
    {
      term: "area inflation",
      definition:
        "Scaling a picture or mark in two dimensions so perceived size outruns the value: doubling height and width quadruples area but reads as 'twice'. Bars from zero respect the ratio; pictures do not.",
    },
  ],
  takeaways: [
    "Misleading charts keep the data true and corrupt the relationship: how big, over which window, per what — audit the frame, not just the figures.",
    "Truncation lies for length (bars) and only zooms for position (lines); the repair is a zero-based axis or an honest change of mark.",
    "A window is a claim: before believing any 'collapse' or 'spike', widen the window and check whether it is a rhythm wearing an event's clothes.",
    "Counts answer volume questions, rates answer risk questions — 'per what?' catches the denominator swap that inverts rankings.",
    "Re-derive every ratio from the values, never from the ink: the eye is the easiest witness to mislead and the hardest to cross-examine.",
  ],
  quiz: [
    {
      id: "a-08-q1",
      prompt:
        "Why does a truncated value axis distort a bar chart more than a line chart of the same data?",
      options: [
        {
          text: "Bars encode value as length from a baseline, so cutting the baseline changes the lengths the eye compares — while lines encode value as position against a gridded axis, where a zoomed range is still readable as a zoom",
          correct: true,
          feedback:
            "Correct — the damage depends on the channel: length needs its zero, position only needs its grid and a labelled range.",
        },
        {
          text: "Line charts are statistically more accurate than bar charts",
          correct: false,
          feedback: "No chart type is inherently more accurate — the encoding's fit to the question and the frame's honesty decide that.",
        },
        {
          text: "Bars are always drawn too small to survive truncation",
          correct: false,
          feedback: "Size is not the issue; the broken ruler is. A large truncated bar chart misleads exactly as effectively.",
        },
        {
          text: "Truncation affects both marks equally, which is why axes must always start at zero",
          correct: false,
          feedback: "For bars, yes — zero or bust. For position encodings a zoomed, clearly labelled range is legitimate; demanding zero of every axis would outlaw the magnifier along with the lie.",
        },
      ],
      explanation:
        "Match the rule to the channel: length encodings demand their zero baseline, position encodings survive a declared zoom.",
    },
    {
      id: "a-08-q2",
      prompt:
        "A report ranks two delivery hubs by package losses and crowns Hub A (900 lost of 300,000 delivered) over Hub B (600 lost of 150,000). What does the honest reading require?",
      options: [
        {
          text: "The per-delivery rates: Hub A loses 3.0 per thousand, Hub B 4.0 — so Hub B is the riskier hub even though Hub A lost more packages in total",
          correct: true,
          feedback:
            "Correct — 900/300k = 3.0‰ and 600/150k = 4.0‰. The count ranking and the rate ranking point at different hubs, and 'riskier' is a rate claim.",
        },
        {
          text: "Hub A is the worse hub — 900 is 50% more losses than 600",
          correct: false,
          feedback: "That is the volume reading. As a risk ranking it inverts the moment the denominators arrive.",
        },
        {
          text: "The two hubs are equally bad because both lose packages",
          correct: false,
          feedback: "Equal in kind, unequal in rate: 3.0 vs 4.0 per thousand is a real difference the claim should carry.",
        },
        {
          text: "The report needs no repair — the loss counts are true",
          correct: false,
          feedback: "The numbers are true and the ranking is still wrong for the question it is being used to answer. 'Per what?' is not optional.",
        },
      ],
      explanation:
        "Counts rank volume; rates rank risk. Compute both before trusting either ranking.",
    },
    {
      id: "a-08-q3",
      prompt:
        "This year's annual report draws the company's output as a factory icon twice as tall and twice as wide as last year's, for a 2× output gain. What has the picture done?",
      options: [
        {
          text: "Inflated the impression by area: doubling both dimensions quadruples the ink, so a 2× gain reads as roughly 4× to the eye",
          correct: true,
          feedback:
            "Correct — area inflation in its classic form. The picture grew with the square of the claim; a zero-based bar labelled 2× would have told the truth.",
        },
        {
          text: "Nothing — the icon is exactly twice as big, matching the gain",
          correct: false,
          feedback: "Twice as TALL and twice as WIDE is four times the area. The eye reads area, not height alone.",
        },
        {
          text: "It is a truncated axis in disguise",
          correct: false,
          feedback: "Different device, same family: truncation breaks a ruler, inflation scales the mark in two dimensions. Both outrun the data; the mechanics differ.",
        },
        {
          text: "It is acceptable because readers only compare the heights of icons",
          correct: false,
          feedback: "Readers compare the SALIENCE — and salience tracks area. That is precisely why the device is chosen.",
        },
      ],
      explanation:
        "Pictures scale in two dimensions; numbers scale in one. When the mark's growth outruns the value's, the ink is exaggerating.",
    },
  ],
};
