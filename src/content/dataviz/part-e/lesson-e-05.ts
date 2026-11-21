/**
 * PART E · LESSON e-05 — "Dashboard Design"
 *
 * The BI studio discipline: a dashboard is one screen answering one
 * decision, not a wall of charts. KPIs as claims (measure, target,
 * window, owner), the five-second layout, the reader's path through
 * slicers and drill — d-04's one-screen-one-decision audit, now at
 * BI scale. The DAX listing is the real KPI-measure pattern.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import {
  DEPARTMENTS,
  SATISFACTION_BY_DEPT,
  TRAFFIC_SIGNUPS,
  TRAFFIC_VISITORS,
  months,
  REVENUE_2023,
  REVENUE_2024,
} from "../datasets";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const quarterSum = (year: number[]) =>
  [0, 1, 2, 3].map((q) => year.slice(q * 3, q * 3 + 3).reduce((a, v) => a + v, 0));

/** All 60 survey scores, flattened — the histogram behind the KPI average. */
const satisfactionAll = DEPARTMENTS.flatMap((d) => SATISFACTION_BY_DEPT[d]);

export const LESSON_V_E_05: DataVizLesson = {
  slug: "e-05",
  title: "Dashboard Design",
  minutes: 25,
  summary:
    "One screen, one decision: KPIs as claims with a target and a window, the five-second layout (headline band, trend, detail), the reader's path through slicers and drill — and the default filter state as the dashboard's opening argument.",
  tool: null,
  objectives: [
    "Specify a KPI as a claim — measure, target, window, owner — and recognize the vanity metrics that wear KPI costumes",
    "Lay out a dashboard for the five-second read: headline KPI band on top, trends in the middle, detail at the bottom",
    "Design the reader's path: slicers, cross-filtering, drill-through, and the default filter state as the opening claim",
    "Audit any dashboard with d-04's one-screen-one-decision test, now applied at BI scale",
  ],
  why: "A chart makes one argument; a dashboard is a room where dozens of arguments compete for one decision — and most dashboards fail precisely because nobody decided which decision. The failure has a look: twelve tiles of equal size, no title worth reading, three greens that mean three different things, a slicer that opens on 'all years' for a monthly standup. The repair is not more charts; it is the opposite — the discipline of deciding what the screen is FOR, then letting every tile earn its pixels against that purpose. This lesson takes d-04's one-screen-one-decision audit into the BI studios you now know: the KPI card and slicer in Power BI, the dashboard object and actions in Tableau. The tools differ; the design questions are identical, and they are the ones this lesson drills until they are reflexes.",
  blocks: [
    {
      kind: "text",
      text: "A **dashboard** is a single screen, arranged so that a specific reader can answer a specific decision question in seconds — and then drill into the evidence when the answer needs defending. Everything in that sentence is load-bearing: *single screen* (scrolling is where attention goes to die), *specific reader* (a CFO's dashboard and an ops analyst's share nothing but the logo), *decision question* (if you cannot name the decision, you have a chart gallery, not a dashboard), *drill* (the detail exists — it just waits one click below the headline). The dashboards you admired in the BI studios of e-01 to e-04 all passed this definition; the ones you have suffered through did not.",
    },
    { kind: "heading", text: "KPIs: the claims a dashboard makes" },
    {
      kind: "text",
      text: "A number becomes a **KPI** only when it is a claim with parts: a **measure** (what is counted), a **target** (what good looks like), a **window** (over what period) and an **owner** (who acts when it misses). 'Revenue' is a number; 'Revenue vs plan, this quarter, at 112% — owned by Sales' is a KPI, because it tells the reader whether to relax or act. The targets deserve particular suspicion: a KPI without one is decoration that can never be red. And beware the **vanity metric** — a measure chosen to always look good (total signups ever, cumulative downloads, page views) rather than to expose a state of the business (active rate, conversion, churn). The test: could this KPI ever tell me something I must act on today? If not, it is wallpaper.",
    },
    {
      kind: "chart",
      chart: {
        type: "grouped-bar",
        title: "Every quarter of 2024 beat 2023 — Q4 by 34%",
        categories: quarters,
        series: [
          { name: "2023 (baseline)", values: quarterSum(REVENUE_2023) },
          { name: "2024 (actual)", values: quarterSum(REVENUE_2024) },
        ],
        yLabel: "revenue (k$)",
      },
      why: "A KPI chart, not a data chart: the year-ago quarter is the target line, so every pair of bars reads as a verdict (+19%, +28%, +25%, +34%). This is the kind of tile that earns the top band — it answers 'are we winning?' before the reader has finished their coffee.",
    },
    {
      kind: "table",
      title: "From question to KPI — and the vanity twin",
      headers: ["The decision question", "An honest KPI", "Its vanity twin"],
      rows: [
        ["Are we growing at plan?", "Revenue vs plan %, this quarter, with owner", "Total revenue since launch (only ever goes up)"],
        ["Is the product keeping users?", "28-day active rate vs prior period", "Cumulative registrations"],
        ["Is marketing paying?", "Signups per marketing dollar, by campaign", "Impressions served"],
        ["Are customers happy?", "Satisfaction by segment, with response rate", "App-store rating (self-selected raters)"],
      ],
      caption:
        "Every honest KPI can fail; every vanity twin cannot. If a metric is structurally incapable of turning red, it is not informing the decision — it is decorating it.",
    },
    { kind: "heading", text: "Layout: the five-second walk" },
    {
      kind: "text",
      text: "Readers scan screens the way they read pages: top-left first, across the top, then down the left edge — the Z-pattern. So the layout writes itself: the **headline band** across the top carries the three or four KPIs (big number, target state, spark of trend); the **trend row** beneath it shows each headline's movement over time; the **detail layer** at the bottom holds the breakdowns, tables and drill targets. A reader who stops after one second has the verdicts; after five, the directions; the detail waits for those who need it. Two rules keep the walk honest: **the page has a claim title** like any chart (a-07) — 'Growth steady, satisfaction split, incidents concentrated', never 'Ops dashboard' — and **encodings are consistent across tiles**: the same measure wears the same colour everywhere, the same time window means the same dates, and one red means one kind of trouble. A dashboard where every tile invents its own grammar forces the reader to re-learn the screen tile by tile.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "Signups track visits at ~2.2% — steady across four weeks",
        points: TRAFFIC_VISITORS.map((v, i) => ({ x: v, y: TRAFFIC_SIGNUPS[i] })),
        xLabel: "daily visitors",
        yLabel: "daily signups",
      },
      why: "The conversion tile that belongs in the detail layer: a tight, stable relationship (about one signup per 45 visitors) with no drift across the four weeks. The headline band carries the number; this chart is the evidence one click down — the reader who doubts the 2.2% finds its whole story here.",
    },
    { kind: "heading", text: "The reader's path: slicers, drill, and the default state" },
    {
      kind: "text",
      text: "Interactivity is an argument you design. **Slicers and filters** (Power BI) and **filter actions** (Tableau) let the reader re-ask the page's question — but the **default state is itself a claim**: the dashboard that opens on 'all years' answers a different question than one that opens on 'this month vs last'. Choose the default that matches the standup the screen lives in, and let history be one click away rather than one confusion away. **Cross-filtering** — click a bar, the rest of the page narrows to it — turns separate tiles into one connected argument; use it, but let the click be undoable and obvious. **Drill-through** (Power BI) and **drill actions / dashboard actions** (Tableau) carry the reader from an interesting mark to the evidence page for exactly that mark — the five-second layer above, the proof below. And remember the consumption contexts: the phone tile in an exec's pocket shows only the headline band; the wall-mounted TV in the ops room shows trend and anomaly, not detail; the emailed snapshot shows one frozen state — so the frozen state must be self-explanatory, timestamp and all. Stale data is a misleading device too (a-08): a dashboard without a visible 'data as of' stamp is a chart with an unlabelled axis.",
    },
    {
      kind: "code",
      title: "The KPI measure — one DAX pattern, every tile",
      language: "dax",
      code: `-- Revenue vs Plan %: the KPI behind the headline band
Revenue vs Plan % =
VAR Actual = [Total Revenue]              -- sums within the tile's filter context
VAR Plan   = [Revenue Plan]               -- from the Targets table, keyed by month
RETURN
    DIVIDE ( Actual - Plan, Plan )        -- blank-safe: no divide-by-zero tiles`,
      note: "The pattern e-03 promised: one measure, correct in every tile. Because [Total Revenue] respects filter context, the same KPI reads 112% in the company card, per region in the matrix, per month in the trend — and DIVIDE returns blank (not an error tile) where a region has a plan but no actuals yet. The owner and the window live in the card's subtitle and the page's slicer default, not in the formula — the measure carries the arithmetic, the design carries the claim.",
      produces:
        "A single measure that renders as the headline band's big number, the matrix's by-region column, and the trend line's zero-line verdict — one definition of 'vs plan', everywhere.",
    },
    {
      kind: "interpretation",
      id: "e-05-i1",
      chart: {
        type: "histogram",
        title: "Satisfaction averages 6.4/10 — tile shown on the exec page",
        values: satisfactionAll,
        bins: 7,
        xLabel: "satisfaction score",
        yLabel: "employees",
      },
      prompt:
        "The exec dashboard's KPI card reads 'Satisfaction 6.4/10, target 7'. This is the full survey behind that number. What must the dashboard do about it?",
      options: [
        {
          text: "Surface the split: the average hides two populations — Design and Engineering sit mostly at 7–9 while Support runs 3–6 — so the KPI needs a segment breakout tile, or the page will report calm where there is a department on fire",
          correct: true,
          feedback:
            "Correct — 27 of 60 respondents scored 7 or above, and the low scores concentrate in one department. A dashboard's job is to make that concentration impossible to average away; the fix is a 'by segment' tile beside the headline number.",
        },
        {
          text: "Nothing — 6.4 is the honest mean of 60 honest answers, and the KPI card is technically correct",
          correct: false,
          feedback: "Technically correct and practically misleading (a-08's denominator lesson, restated for averages): a mean over a bimodal population answers a question nobody asked. The dashboard must carry the structure, not just the statistic.",
        },
        {
          text: "Round to 6 — a single digit reads faster on the phone tile",
          correct: false,
          feedback: "Legibility is real, but rounding moves the number, not the problem: the two populations are still averaged away, now with less precision.",
        },
        {
          text: "Replace the survey KPI with the app-store rating — customers matter more",
          correct: false,
          feedback: "Different population, same trap: app-store ratings come from self-selected responders (the vanity twin from the KPI table). Swapping one biased measure for another is not a repair.",
        },
      ],
      explanation:
        "A headline number summarizes; a dashboard explains. When the distribution behind the KPI has structure the decision needs, the drill layer — or a breakout tile — is where it must appear.",
    },
    {
      kind: "exercise",
      id: "e-05-e1",
      exerciseKind: "critique",
      prompt:
        "Your CEO asks for 'one screen for the Monday standup — revenue, products, satisfaction, incidents, all of it'. You have twelve candidate tiles. Design the screen: the page's claim title, what sits in the headline band, what sits in the trend row, what sits in the detail layer — and the default filter state. Then name the one thing you would refuse to include.",
      options: [
        {
          text: "Claim title 'Growth on plan, satisfaction split by department, incidents concentrated at one branch'; headline band = the four KPI verdicts (revenue vs plan, satisfaction with segment flag, incident rate per thousand rides, top-product growth); trend row = each KPI's last 12 weeks; detail = product mix, branch table, survey histogram; default = current week vs prior week. Refused: the raw incident log — it is evidence for the drill layer, not a tile",
          correct: true,
          feedback:
            "Correct — every layer earns its place against one decision (what do we act on this week?), the defaults match the standup's cadence, and the log waits one click below the incident KPI where it belongs.",
        },
        {
          text: "Twelve equal tiles in a grid, no page title — let each chart speak for itself",
          correct: false,
          feedback: "The default failure mode: no hierarchy, no claim, twelve arguments of equal volume. The CEO's five seconds are spent deciding where to look, not what to do.",
        },
        {
          text: "Put the incidents table top-left — tables are the most precise encoding",
          correct: false,
          feedback: "Precision is not priority. Top-left is the first read of the whole screen; it belongs to the KPI verdict, with the precise evidence one click down.",
        },
        {
          text: "Default the slicer to 'all time' so no one accuses the dashboard of hiding anything",
          correct: false,
          feedback: "The default state is the dashboard's opening claim (this lesson's rule): 'all time' answers an annual question nobody asked at a weekly standup, and buries this week's verdict in the noise.",
        },
      ],
      hint: "One screen, one decision. Which single decision does a Monday standup make — and what does each layer contribute to it in five seconds, five minutes, or one click?",
      explanation:
        "The audit in reverse: start from the decision, write the claim title, let the headline band carry the verdicts and the drill carry the proof — and refuse every tile that neither answers nor evidences the question.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The one-screen-one-decision test",
      text: "Cover the dashboard and ask: what decision does this screen serve? If the answer is 'several', you need several screens (pages, tabs, or audiences) — not one busier screen. Power BI's report pages and Tableau's dashboard tabs are the honest answer to scope creep: a dashboard per decision, linked by drill paths, beats a super-dashboard that answers everything and therefore nothing.",
    },
  ],
  terms: [
    {
      term: "KPI",
      definition:
        "A claim, not a number: measure + target + window + owner. 'Revenue vs plan, this quarter, 112%, owned by Sales' — if it cannot turn red, it cannot inform a decision.",
    },
    {
      term: "five-second read",
      definition:
        "The layout contract: headline KPI band on top (one-second verdicts), trends in the middle (five-second directions), detail at the bottom (evidence on demand). Structured around the reader's Z-pattern scan.",
    },
    {
      term: "default filter state",
      definition:
        "The filter/slicer configuration a dashboard opens with — itself a claim about the question the screen answers. 'This month vs last' and 'all years' are different opening arguments.",
    },
    {
      term: "drill-through",
      definition:
        "The designed path from an interesting mark to its evidence page (Power BI drill-through, Tableau actions): the five-second layer above, the proof one click below.",
    },
  ],
  takeaways: [
    "A dashboard is one screen serving one decision for one reader — everything else is a chart gallery with a logo.",
    "A number becomes a KPI when it carries a target, a window and an owner; a metric that cannot turn red is wallpaper.",
    "Layout for the five-second walk: claim title on the page, KPI verdicts on top, trends in the middle, detail below — with consistent encodings across every tile.",
    "Interactivity is designed argument: the default filter state is the opening claim, cross-filtering connects the tiles, drill-through carries the proof.",
    "Stale or untimestamped data is a misleading device (a-08) — a dashboard without an 'as of' stamp is a chart with an unlabelled axis.",
  ],
  quiz: [
    {
      id: "e-05-q1",
      prompt: "Which of these is a genuine KPI rather than a number wearing a costume?",
      options: [
        {
          text: "28-day active rate: 34%, down 2 points vs prior period, target 40%, owner: Product",
          correct: true,
          feedback: "Correct — measure, movement, target and owner: the four parts of a KPI claim, so the reader knows both the state and the standard.",
        },
        {
          text: "Total registered users: 1.2 million",
          correct: false,
          feedback: "A cumulative count that can only rise — the vanity twin. It cannot turn red, so it cannot inform a decision.",
        },
        {
          text: "Page views last month: 4.8 million",
          correct: false,
          feedback: "Volume without a target or owner. Big, maybe good, possibly bots — no claim, no verdict.",
        },
        {
          text: "App-store rating: 4.6 stars",
          correct: false,
          feedback: "Self-selected responders make it a biased sample, and there is no target or window — decoration for the marketing page, not a KPI.",
        },
      ],
      explanation:
        "The KPI test is not 'is it a big number' but 'can it fail, against what, for whom, over what window' — the parts that make a number a claim.",
    },
    {
      id: "e-05-q2",
      prompt:
        "Where does the strongest KPI verdict belong, and why?",
      options: [
        {
          text: "The top band, read first in the Z-pattern — the one-second layer that tells the reader whether to relax or act before they scan anything else",
          correct: true,
          feedback: "Correct — position encodes priority on a dashboard exactly the way length encodes magnitude on a bar: top band, biggest state.",
        },
        {
          text: "The bottom-right corner — the eye lands there last, so the news stays with the reader",
          correct: false,
          feedback: "A layout gamble on a reading pattern that does not exist; the Z-pattern spends its attention top-left first, and the KPI band rides it.",
        },
        {
          text: "In the middle of the trend row, surrounded by its own evidence",
          correct: false,
          feedback: "Evidence around a verdict buries the verdict — the trend supports the KPI band from below, not beside it.",
        },
        {
          text: "In the page title only — one sentence is the most honest summary",
          correct: false,
          feedback: "The claim title and the KPI band are partners: the title states the finding, the band carries the verdicts. Neither does the other's job alone.",
        },
      ],
      explanation:
        "Screen position is an encoding: the headline band is the dashboard's loudest channel, and it belongs to the decision, not the decoration.",
    },
    {
      id: "e-05-q3",
      prompt:
        "Why is a dashboard's default filter state a design decision rather than a technicality?",
      options: [
        {
          text: "Because the opening state is the question the dashboard answers by default — 'this month vs last' makes a different opening argument than 'all years', and most readers never touch a slicer",
          correct: true,
          feedback: "Correct — the default IS the claim most readers receive. Choosing it is choosing the argument; leaving it accidental is delegating your message to a config dialog.",
        },
        {
          text: "Because filters cannot be changed after publication",
          correct: false,
          feedback: "They can, and are — which is exactly why the default matters: it is the state the majority will actually see.",
        },
        {
          text: "Because slicers slow down report performance",
          correct: false,
          feedback: "A performance concern, and a real one — but orthogonal. The default state is about the argument, not the milliseconds.",
        },
        {
          text: "It is not — readers should simply filter for what they need",
          correct: false,
          feedback: "'Should' is not a design. Readers arrive with five seconds, not a research plan; the dashboard that opens on the right question has already done their filtering for them.",
        },
      ],
      explanation:
        "Every default is an argument the dashboard makes without being asked. Design it like a claim title — deliberately, for the standup it lives in.",
    },
  ],
};
