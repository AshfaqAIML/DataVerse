/**
 * PART E · LESSON e-06 — "Business Storytelling"
 *
 * Charts in sequence make an argument: the SCQA spine (situation,
 * complication, question, answer), claim titles that let a deck read
 * in titles alone, the so-what ladder from observation to action,
 * and answer-first delivery — with a-08's honesty rules holding the
 * whole story up.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  COFFEE_PRODUCTS,
  COFFEE_Q1,
  COFFEE_Q2,
  COFFEE_Q3,
  COFFEE_Q4,
  REVENUE_2023,
  REVENUE_2024,
  TRAFFIC_SIGNUPS,
  TRAFFIC_VISITORS,
  months,
} from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const perQuarter = COFFEE_PRODUCTS.map((_, i) => [COFFEE_Q1[i], COFFEE_Q2[i], COFFEE_Q3[i], COFFEE_Q4[i]]);

export const LESSON_V_E_06: DataVizLesson = {
  slug: "e-06",
  title: "Business Storytelling",
  minutes: 20,
  summary:
    "A story is an argument with a spine: SCQA — situation, complication, question, answer — told in claim titles, sequenced so the deck reads in titles alone, delivered answer-first, and held to every honesty rule from Part A.",
  tool: null,
  objectives: [
    "Structure a data story with the SCQA spine — and know why the complication, not the data, is the engine",
    "Apply the title test: read a deck's titles aloud; if they do not form the story, the deck is not finished",
    "Climb the so-what ladder from observation to implication to action — and stop exactly where the data stops",
    "Deliver answer-first to executives (the pyramid), keep the evidence in the appendix, and defend the story's honesty",
  ],
  why: "No decision committee has ever been moved by a chart. They are moved by an argument that charts happen to prove — and the difference between the two is structure. A analysis dump says 'here is everything I found'; a story says 'here is what changed, here is why it matters, here is what I recommend, and here is the proof in order'. The craft is not theatrics: it is sequencing claims so each one earns the next, writing titles that carry the claims without the reader opening the body, and answering the executive's only real question — 'what do you want me to decide?' — in the first thirty seconds. This closing lesson assembles the whole course into that skill: the a-07 claim title, the a-08 honesty rules, the e-05 KPI claims and drill paths — all in service of the oldest business artifact there is: a story with evidence.",
  blocks: [
    {
      kind: "text",
      text: "A single chart answers a single question. A business decision needs several answers in a row — *what is the state, what changed, why does it matter, what should we do* — and the sequence itself is a design object. That is all 'storytelling with data' means: an ordered set of claims, each backed by ink, arranged so the reader arrives at the decision instead of merely touring the evidence. The story is not decoration on the analysis; it is the analysis's delivery system, and like every delivery system it can be well engineered or badly.",
    },
    { kind: "heading", text: "The spine: SCQA" },
    {
      kind: "text",
      text: "The sturdiest spine in business writing is four beats. **Situation** — the stable world the reader already believes ('revenue has grown steadily for two years'). **Complication** — what changed or threatens to ('the product mix underneath that growth is turning over: Cold Brew passed Latte in Q3 while Filter slid all year'). **Question** — the one question the complication forces ('where does next year's growth come from — and what do we do about Filter?'). **Answer** — your recommendation, stated plainly. The engine is the complication: a story that never leaves the situation is a status report, and a story that skips straight to the answer is a pitch. Every beat gets exactly one chart — the situation chart proves stability, the complication chart proves change — and one claim title per chart (a-07) does the speaking.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Situation: two years of steady growth — December closed 38% up year over year",
        categories: months,
        series: [
          { name: "2023", values: REVENUE_2023 },
          { name: "2024", values: REVENUE_2024 },
        ],
        yLabel: "revenue (k$)",
      },
      why: "Beat one, proven: the reader's assumed world, confirmed in ink — 1,470 k$ in 2023, 1,866 k$ in 2024, up 27% with December 204 against 148. Nothing here is news; that is the point. The situation beat earns the right to say 'but'.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Complication: Cold Brew overtook Latte in Q3 while Filter slid all year",
        categories: quarters,
        series: COFFEE_PRODUCTS.map((p, i) => ({ name: p, values: perQuarter[i] })),
        yLabel: "cups",
      },
      why: "Beat two, the news: under the calm total, the mix is rotating — Cold Brew 476 to 671, past Latte's 596 in Q3; Filter down every quarter, 301 to 258. One chart, one change, one claim title. The question beat writes itself on the reader's lips now.",
    },
    {
      kind: "text",
      text: "The **question** beat is one sentence on a slide of its own — no chart, because it is not evidence, it is a pivot: *'Where does next year's growth come from, and what do we do about Filter?'* The **answer** beat states the recommendation and then climbs the **so-what ladder** on the reader's behalf. Rung one, observation: *Cold Brew is the new bestseller-in-waiting and Filter is a four-quarter decline.* Rung two, so what: *the menu's centre of gravity is shifting — marketing and inventory planned for a Latte-first world are aimed at the wrong target.* Rung three, therefore: *move the spring launch budget into Cold Brew's season and bring Filter a keep, fix or kill decision this quarter.* Each rung must be defensible from the data — the ladder is where honest analysts live or fall, and a-08's rules apply all the way up: a story that needs a truncated axis or a cherry-picked window to climb is not a story, it is a pitch.",
    },
    { kind: "heading", text: "The storyboard discipline" },
    {
      kind: "text",
      text: "Storyboard before you build. The discipline that keeps a story honest and fast is the **title test**: read the deck's titles aloud, in order, with nothing else. If the four titles say 'Revenue' / 'Products' / 'Question?' / 'Recommendation' — you have a table of contents, not a story. If they say 'Two years of steady growth' / 'Cold Brew overtook Latte while Filter slid' / 'Where does next year's growth come from?' / 'Back Cold Brew's season; decide Filter now' — the deck tells itself, and a reader who stops after the titles still leaves informed (a-07's skimming-reader standard, promoted to the deck). Two supporting rules: **encodings are consistent across acts** (the same product wears the same colour on every slide; a-05's palettes, e-05's cross-tile consistency — the reader learns the grammar once), and **each act is narrower than the last** — situation wide, complication focused on the change, answer down to the decision. Stories that widen at the end are analyses that lost their nerve.",
    },
    {
      kind: "table",
      title: "The four-act storyboard, on one page",
      headers: ["Act", "The claim it makes", "The ink that carries it", "What it deliberately leaves out"],
      rows: [
        ["Situation", "'Two years of steady growth'", "Line, 2023 vs 2024, 24 months", "Product mix — stability is the point, detail would blur it"],
        ["Complication", "'Cold Brew overtook Latte; Filter slid all year'", "Per-product lines across four quarters", "Total revenue — already established in the previous act"],
        ["Question", "'Where does next year's growth come from?'", "No chart — one sentence, the pivot", "Everything; it is a sentence, not evidence"],
        ["Answer", "'Back Cold Brew's season; decide Filter now'", "The recommendation, with the forecast honestly marked as one", "Certainty — projections are claims about the future, labelled as such"],
      ],
      caption:
        "Storyboarding is argument design: one claim per act, one chart per claim, and a 'leaves out' column that is as deliberate as the rest. If two acts make the same claim, one of them is a slide too many.",
    },
    { kind: "heading", text: "Telling it live: the meeting, the deck, the memo" },
    {
      kind: "text",
      text: "The same spine, three deliveries. **In the meeting**, answer first: the **pyramid principle** — recommendation, then the three claims that support it, then evidence on demand. Executives give you thirty seconds before they start deciding whether you have earned the next thirty; spend the first ones on the answer, not the methodology. The live drill path you designed in e-05 is your performance script: when the CFO doubts the Filter decline, you are one click from the four-quarter evidence, performed in the order the story needs. **In the deck**, the titles carry the story (the title test above) and the appendix holds every chart a questioner could ask for — the body is the argument, the appendix is the proof. **In the memo**, the story compresses to a paragraph: situation, complication, question, answer in four sentences, one exhibit attached. The medium changes; the spine does not.",
    },
    {
      kind: "interpretation",
      id: "e-06-i1",
      chart: {
        type: "scatter",
        title: "Marketing spend drives signups",
        points: TRAFFIC_VISITORS.map((v, i) => ({ x: v, y: TRAFFIC_SIGNUPS[i] })),
        xLabel: "daily visitors",
        yLabel: "daily signups",
      },
      prompt:
        "This is e-05's conversion tile, back from the deck with a new title. The presenter says: 'As you can see, our marketing spend drives signups.' What does the chart actually license?",
      options: [
        {
          text: "A stable rate, not a cause: signups track visits at roughly one per 45 visitors (2.2%) across four weeks — a real and useful relationship, but nothing here measured marketing spend, so the causal sentence is imported from outside the ink",
          correct: true,
          feedback:
            "Correct — the story overreach is in the verb: 'drives' is causation, the chart shows covariation. The honest title is the one the tile wore in e-05: 'Signups track visits at ~2.2%'.",
        },
        {
          text: "The chart proves the marketing is working — signups rise with visitors",
          correct: false,
          feedback: "Rise with, yes; because of, no. Covariation licenses forecasting ('more visitors, more signups'), never attribution — the a-08 discipline, now wearing a narrative costume.",
        },
        {
          text: "The chart is worthless because correlation is not causation",
          correct: false,
          feedback: "Too far the other way: a stable 2.2% conversion is genuinely useful for planning and forecasting. The repair is the claim, not the bin.",
        },
        {
          text: "The causation is fine in reverse — signups drive visitors",
          correct: false,
          feedback: "Swapping the arrow does not create evidence for it; neither direction was measured. The story must stay at the edge of its ink.",
        },
      ],
      explanation:
        "Stories pull claims together; honesty keeps them apart. At every rung of the so-what ladder, ask what the ink measured — and write the claim the measurement licenses, not the one the narrative wants.",
    },
    {
      kind: "exercise",
      id: "e-06-e1",
      exerciseKind: "concept-check",
      prompt:
        "Storyboard the coffee shop's year for the board: write the four claim titles (one per SCQA beat) and name each chart's scope. Then justify, in one sentence each, what the situation act leaves out and why the answer act is allowed to contain a projection.",
      options: [
        {
          text: "Situation: 'Latte led the first half — a stable menu for two years' (product lines, H1 focus). Complication: 'Cold Brew overtook Latte in Q3; Filter declined all year' (product lines, four quarters). Question: 'Where does next year's growth come from?' (no chart). Answer: 'Shift the spring launch to Cold Brew's season; bring Filter to a decision' (projection, explicitly labelled). The situation omits total revenue — it wants stability of MIX, and totals would echo the complication's stakes early; the answer may project because a decision is a claim about the future, and labelling it forecast keeps the claim honest",
          correct: true,
          feedback:
            "Correct — four titles that pass the read-aloud test, scopes that narrow act by act, an omission that serves the argument, and a projection wearing its label. That is a storyboard.",
        },
        {
          text: "Open with the answer: 'Back Cold Brew' on slide one, then show all product charts",
          correct: false,
          feedback: "Answer-first is for the live meeting (the pyramid); the DECK still needs the spine — an answer without its complication is a pitch, and 'all charts' is the analysis dump the storyboard exists to prevent.",
        },
        {
          text: "Use topic titles ('Menu performance') so the charts stay neutral and the board draws its own conclusions",
          correct: false,
          feedback: "Topic titles fail the title test: the deck no longer tells a story, and the board's conclusions are no longer yours to answer for. Neutrality here is abdication, not objectivity.",
        },
        {
          text: "End on the complication slide for dramatic effect — leave the recommendation for the discussion",
          correct: false,
          feedback: "A board that writes its own ending will not write yours. The story that stops at the complication is a status report with better lighting; the answer beat is the reason the spine exists.",
        },
      ],
      hint: "Read your four titles aloud in order. Do they form an argument a reader could repeat from memory? What does each act deliberately not show?",
      explanation:
        "The storyboard is the argument: situation earns the 'but', the complication earns the question, the question earns the answer — and the titles alone must carry the whole sequence.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "A story that needs a rigged chart is a pitch",
      text: "Storytelling amplifies whatever it carries — truth or its absence. Before the deck ships, run a-08's five-second audit on every exhibit: axis, window, denominator, ratio. The honest storyteller's test is simple: would you be comfortable if the audience audited your strongest slide first? If one chart cannot survive that, the story is not ready — the data has not yet earned the ending you want to give it.",
    },
  ],
  terms: [
    {
      term: "SCQA",
      definition:
        "The four-beat story spine: Situation (the stable world), Complication (what changed), Question (what the change forces), Answer (the recommendation). The complication is the engine — without it, status report; without the situation, pitch.",
    },
    {
      term: "title test",
      definition:
        "Read a deck's titles aloud, in order, with nothing else. If they do not state the story, the deck is a table of contents. Claim titles (a-07) are what make the test passable.",
    },
    {
      term: "so-what ladder",
      definition:
        "Observation → implication → action: 'Cold Brew passed Latte' → 'the menu's centre of gravity is shifting' → 'move the launch budget'. Each rung must be defensible from the data; the story stops where the ink stops.",
    },
    {
      term: "pyramid principle",
      definition:
        "Answer-first delivery for executives: recommendation, then the supporting claims, then evidence on demand. The live counterpart of a deck's appendix — the drill path (e-05) is the performance script.",
    },
  ],
  takeaways: [
    "A story is an ordered argument with evidence — SCQA gives it a spine: situation earns the 'but', the complication earns the question, the question earns the answer.",
    "Claim titles make the deck tell itself: apply the title test — read the titles aloud, and the story must survive without its body.",
    "Climb the so-what ladder only as far as the ink reaches: observation, implication, action — and the projection in the answer act wears its 'forecast' label.",
    "Deliver to the medium: answer-first in the meeting (the pyramid), titles-plus-appendix in the deck, four sentences and one exhibit in the memo.",
    "Storytelling amplifies what it carries: run a-08's audit on every exhibit, because a story that needs a rigged chart is a pitch.",
  ],
  quiz: [
    {
      id: "e-06-q1",
      prompt: "In the SCQA spine, why is the complication — not the data — the engine of the story?",
      options: [
        {
          text: "Because it is the change that makes the reader's stable picture of the world insufficient — it creates the tension the question and answer exist to resolve",
          correct: true,
          feedback:
            "Correct — no complication, no story: just a status report about a world that keeps matching expectations. The data proves the complication; the complication makes the data matter.",
        },
        {
          text: "Because complications always involve declining numbers, and declines are easier to chart",
          correct: false,
          feedback: "Complications can be surges, crossovers, shifts — any change that breaks the situation. Neither direction is easier to draw.",
        },
        {
          text: "Because audiences remember negative news better than positive news",
          correct: false,
          feedback: "Memory effects are real but incidental; the structural role is tension-resolution, not mood.",
        },
        {
          text: "Because the complication is where the analyst's opinion goes",
          correct: false,
          feedback: "The complication is evidence-backed fact — the crossing, the decline, the shift. Opinion enters at the answer, where it is labelled as a recommendation.",
        },
      ],
      explanation:
        "Situation and complication are both proven claims; the difference is that one confirms the reader's world and the other breaks it — and only the second makes a question necessary.",
    },
    {
      id: "e-06-q2",
      prompt: "A deck passes the title test when:",
      options: [
        {
          text: "Reading only the titles, in order, states the full argument — a reader who skips every body still leaves knowing the story",
          correct: true,
          feedback:
            "Correct — titles are the deck's spine: skimming readers (most of them) get the argument, careful readers get the proof beneath each claim.",
        },
        {
          text: "Every slide's title names its chart type and data source",
          correct: false,
          feedback: "That is documentation, not narration — 'Line chart of quarterly cups (POS export)' tells the reader nothing to believe.",
        },
        {
          text: "The title font matches the company brand guidelines",
          correct: false,
          feedback: "Branding is real and irrelevant here: the test is whether the words carry the argument.",
        },
        {
          text: "Titles are kept to one word each, for punch",
          correct: false,
          feedback: "One-word titles are topic titles in miniature — punch without a claim. 'Turnover' is a headline; 'Cold Brew overtook Latte in Q3' is news.",
        },
      ],
      explanation:
        "The title test operationalizes a-07 at deck scale: claim titles, read in sequence, must carry the story on their own.",
    },
    {
      id: "e-06-q3",
      prompt: "Why do executives get the answer first, when the deck tells the story chronologically?",
      options: [
        {
          text: "Because decision-makers allocate attention in seconds: stating the recommendation up front lets them spend the rest deciding whether to believe it, with the claims and evidence ready beneath — and the meeting's drill path covers the doubts live",
          correct: true,
          feedback:
            "Correct — the pyramid in one breath: answer, supports, evidence on demand. Chronology is for building trust; executives borrow trust against a clear recommendation.",
        },
        {
          text: "Because executives dislike charts and prefer text",
          correct: false,
          feedback: "The answer-first order changes the sequence, not the medium — the claims still arrive as charts, just beneath the recommendation they support.",
        },
        {
          text: "Because it prevents interruptions",
          correct: false,
          feedback: "It invites better ones: an executive who has the recommendation spends the meeting testing it — which is exactly the conversation a story should earn.",
        },
        {
          text: "Because the chronological version is only for analysts",
          correct: false,
          feedback: "Analysts need the chronology to audit the reasoning; executives need the answer to act. Same spine, different entry point — not a hierarchy of audiences.",
        },
      ],
      explanation:
        "The pyramid principle respects attention: recommendation first, three supporting claims next, evidence one drill away — the deck's spine rearranged for the room.",
    },
  ],
};
