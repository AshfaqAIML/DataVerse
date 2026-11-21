/**
 * Marketing analytics projects — MKT-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const MARKETING_PROJECTS: DapProject[] = [
  /* ================================================================ MKT-01 */
  {
    id: "marketing-1",
    categoryId: "marketing",
    difficulty: "beginner",
    code: "MKT-01",
    title: "Campaign Performance Report",
    subtitle: "Eight campaigns, one quarter: which ones actually earned their spend?",
    summary:
      "A first marketing ROI report: clean a campaign-day log, compute CTR, CVR, CPA and ROAS per campaign and channel, rank honestly, and recommend where next quarter's budget goes.",
    hours: 4,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Marketing metrics", "Ratio arithmetic", "Ranking analysis", "Labelled charts", "Budget memo"],

    businessBackground:
      "Willow & Fern, a D2C plant-delivery brand, ran eight campaigns last quarter across Paid Search, Social, Display and Email. The marketing lead reports results campaign-by-campaign in a weekly slide, but the numbers keep changing and nobody can say which campaigns earned their spend. With next quarter's budget meeting in a week, the founder wants one defensible ranking: cost per result and return per dollar, by campaign and channel.",
    problemStatement:
      "Produce the quarter's campaign scoreboard: spend, impressions, clicks, conversions and revenue per campaign and channel; CTR, CVR, CPA and ROAS computed correctly; campaigns ranked with an honest view of scale vs efficiency; and a budget recommendation for next quarter.",
    businessObjectives: [
      "Compute the standard marketing funnel metrics per campaign-day and aggregated to campaign level",
      "Rank campaigns on CPA and ROAS; separate big-spend from efficient campaigns",
      "Identify channel-level patterns (which channels deliver cheap clicks vs cheap conversions)",
      "Recommend a next-quarter budget split with expected results",
    ],
    datasetDescription:
      "Daily campaign performance (~1,200 campaign-day rows): spend, impressions, clicks, conversions and revenue per campaign per day, for eight campaign-channel pairs over one quarter. Spend arrives partly as currency-formatted strings, some click cells are missing, a few revenue values are negative (refund days), duplicates exist, and channel labels have casing variants — the small-dataset trap where a few defects move rankings.",
    dataDictionary: [
      { column: "date", kind: "date", description: "Performance date", example: "2025-04-18" },
      { column: "campaign", kind: "categorical", description: "Campaign name", example: "Summer Sale" },
      { column: "channel", kind: "categorical", description: "Channel (casing variants exist)", example: "Paid Search" },
      { column: "spend", kind: "currency", description: "Daily spend (some '$1,234.56' strings)", example: "1420.50" },
      { column: "impressions", kind: "integer", description: "Impressions served", example: "412000" },
      { column: "clicks", kind: "integer", description: "Clicks (some missing)", example: "8240" },
      { column: "conversions", kind: "integer", description: "Conversions attributed", example: "412" },
      { column: "revenue", kind: "currency", description: "Attributed revenue (negatives are refund days)", example: "49840.00" },
    ],
    initialQuestions: [
      "What did each campaign spend, and what did it get for it (clicks, conversions, revenue)?",
      "Which campaigns have the best CPA and ROAS — and which look good only because they're small?",
      "How do the four channels differ on CTR, CVR and CPA?",
      "Are there days or patterns (weekends, month-end) that move performance?",
      "What budget split should next quarter take, and what result is reasonable to expect?",
    ],
    dataset: {
      name: "Willow & Fern campaign log",
      filename: "marketing-01-campaign-daily.csv",
      description: "One quarter of daily campaign performance across 8 campaigns and 4 channels.",
      rows: 1200,
    },

    dataQuality: [
      { issue: "Currency-formatted spend", where: "spend — '$1,234.56' strings (~8%)", detection: "dtype object; str.contains(r'\\$')", treatment: "Strip and numericise; verify zero parse failures." },
      { issue: "Missing clicks", where: "clicks — ~2% of days", detection: "isna().sum()", treatment: "Exclude affected rows from CTR/CVR (not from spend totals); count and report — never zero-fill (0 clicks is a real, alarming value)." },
      { issue: "Negative revenue days", where: "revenue < 0 (~0.6%)", detection: "(df['revenue'] < 0).sum()", treatment: "Investigate: refund-heavy days. Keep in net revenue totals but flag; they pull ROAS down honestly." },
      { issue: "Duplicate campaign-days", where: "~16 duplicated rows", detection: "duplicated(['date','campaign','channel']).sum()", treatment: "Drop — duplicate days double-count spend in every summary." },
      { issue: "Channel casing", where: "channel — 'paid search' variants", detection: "value_counts()", treatment: "Title-case to canonical channels before grouping." },
    ],
    cleaningPlan: [
      { action: "Numericise spend; canonicalise channel; deduplicate campaign-days", rationale: "The three defects that silently corrupt every total and ratio." },
      { action: "Separate rows missing clicks from ratio metrics while keeping spend totals complete", rationale: "Spend happened even when clicks weren't recorded; ratios need both sides." },
      { action: "Keep negative revenue in net totals, flagged", rationale: "Refunds are real economics; hiding them inflates ROAS." },
      { action: "Derive the metric family: CTR, CVR, CPA, ROAS at campaign and channel level", rationale: "Define each once, with its denominator, in a metrics cell." },
    ],
    edaPlan: [
      { question: "Campaign scoreboard", method: "groupby(campaign) sums then derived metrics", expectation: "Spring Launch Social: high spend, mid ROAS; Retargeting Email: low spend, best ROAS." },
      { question: "Scale vs efficiency", method: "scatter spend vs CPA (or ROAS)", expectation: "Small email campaigns cluster efficient; display spends big at high CPA." },
      { question: "Channel patterns", method: "channel-level CTR/CVR/CPA", expectation: "Social wins CTR, loses CVR; Paid Search balanced; Display worst CPA." },
      { question: "Time patterns", method: "day-of-week performance; revenue anomalies", expectation: "Weekend volume dips; refund days visible as negative spikes." },
      { question: "Impression efficiency", method: "CPM by campaign", expectation: "Display cheapest impressions but worst conversion — cheap ≠ good." },
    ],
    statisticsPlan: [
      { technique: "Ratio metrics with correct denominators (per-row vs aggregate)", purpose: "CTR etc. must be computed from SUMS, not averaged ratios", expectation: "Aggregate-first metrics differ from row-average metrics by several points — a classic reporting bug, worth demonstrating." },
      { technique: "Efficiency ranking with scale annotation", purpose: "Rank campaigns honestly", expectation: "Top ROAS campaigns are small; annotate both axes." },
      { technique: "Simple budget scenario arithmetic", purpose: "Translate findings into next-quarter expectations", expectation: "Shifting 20% of display budget to search/email: CPA improves ~10–15% at flat spend." },
    ],
    visualisationPlan: [
      { chart: "Scatter — spend vs ROAS, bubble = conversions", answers: "Who earns their budget?", reads: "Upper-left = efficient small; upper-right = stars; lower-right = problems." },
      { chart: "Bar — CPA by campaign, sorted, with spend annotation", answers: "What does a conversion cost?", reads: "Sorted bars; labels distinguish scale from efficiency." },
      { chart: "Grouped bar — CTR and CVR by channel", answers: "What does each channel deliver?", reads: "Paired bars expose the CTR-high/CVR-low pattern." },
      { chart: "Line — daily spend vs revenue (with refund spikes flagged)", answers: "When did we make/lose money?", reads: "Divergences and negative-revenue annotations." },
      { chart: "Stacked bar — conversions by channel over weeks", answers: "Is the mix stable?", reads: "Width consistency of channel bands." },
    ],
    findings: [
      "Retargeting Email delivers the quarter's best ROAS (~6×) on the smallest spend — efficient but not scalable at current audience size.",
      "Always-On Brand Display spends the most and returns the worst CPA (roughly 3× the email retargeting CPA); its cheap impressions don't survive the funnel.",
      "Paid Search campaigns are the workhorses: mid-table efficiency at meaningful scale, with Summer Sale search the strongest big spender.",
      "Social shows the classic high-CTR/low-CVR signature: plenty of clicks that don't convert — its CPA sits between display and search.",
      "Aggregate-first metrics matter: row-averaged CTR overstates campaign CTR by 2–3 points versus sum-based computation on this data — one of the two numbers is wrong in every prior weekly slide.",
    ],
    recommendations: [
      { what: "Cap Always-On Brand Display at 50% of current spend and shift the difference to Paid Search and Retargeting Email", why: "Display CPA is ~3× the alternatives at the largest budget line.", impact: "~10–15% blended CPA improvement at flat spend", horizon: "immediate" },
      { what: "Grow Retargeting Email within its audience ceiling; measure where CPA degrades", why: "Best ROAS in the quarter but audience-limited; find the ceiling empirically.", impact: "Efficient incremental volume", horizon: "this quarter" },
      { what: "Adopt sum-based metric definitions in the weekly reporting template", why: "The row-average bug overstated CTR all quarter; definitions are free wins.", impact: "Reporting integrity", horizon: "immediate" },
      { what: "Restructure Social campaigns toward conversion-optimised objectives and re-evaluate in 60 days", why: "High CTR / low CVR suggests creative attracts clicks that don't buy; conversion bidding may fix the mismatch.", impact: "Testable Social turnaround or a clean exit case", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "The quarter's eight campaigns split into workhorses, a star and a problem. Retargeting Email is the star — best ROAS (~6×) on the smallest budget, though audience-limited. Always-On Brand Display is the problem: the largest budget at roughly triple the alternative CPAs, buying cheap impressions that don't convert. Paid Search carries the middle creditably at scale. The recommendation shifts half of Display's budget to Search and Email retargeting for a projected 10–15% blended CPA improvement at flat spend, fixes a metric-definition bug that overstated CTR in every weekly slide this quarter, and puts Social on a conversion-optimised test with a 60-day verdict. All figures computed on a deduplicated, format-cleaned dataset with refund days retained and flagged.",
      structure: [
        "1. Objective and metric definitions (denominators stated)",
        "2. Data and quality treatment",
        "3. The campaign scoreboard",
        "4. Scale vs efficiency: the scatter that decides the meeting",
        "5. Channel patterns",
        "6. Next-quarter budget recommendation with expectations",
        "7. Appendix: cleaning log, metric definitions, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Load and define the metrics",
        goal: "Profile the data and write the metric definitions with denominators.",
        instructions: [
          "Profile shape, dtypes, nulls; note spend's object dtype immediately.",
          "Write the definitions cell: CTR = clicks/impressions, CVR = conversions/clicks, CPA = spend/conversions, ROAS = revenue/spend — all from SUMS at group level.",
          "Check the grain: one row = one campaign-channel-day; duplicates at that key are the integrity question.",
        ],
        hints: [
          "Metric definitions with denominators, written before computing, prevent the ratio-averaging bug.",
          "duplicated(['date','campaign','channel']).sum() is the integrity check for this grain.",
          "Ask: are the eight campaign-channel pairs consistent (same channel every day per campaign)? crosstab verifies.",
        ],
        checkpoint: "Definitions written, grain verified, dtype quirks catalogued.",
        code: {
          label: "Profile and define",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("marketing-01-campaign-daily.csv", parse_dates=["date"])
print(df.shape, df.dtypes)
print("dupes:", df.duplicated(["date", "campaign", "channel"]).sum())
print(df.groupby("campaign")["channel"].nunique())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the small-dataset traps",
        goal: "Spend formats, missing clicks, refund days, duplicates, casing — each counted.",
        instructions: [
          "Quantify each of the five defects with detection code.",
          "Decide the treatment per defect — especially: what happens to days missing clicks in totals vs ratios?",
          "Record the audit; small datasets make defects visible in rankings, so every exclusion is listed.",
        ],
        hints: [
          "Spend strings: astype(str).str.contains(r'\\$').sum() quantifies; strip-cast-verify after.",
          "Missing clicks: spend still counts (it happened); ratios must skip those rows. Two views of the same rows — that's normal.",
          "Refund days: revenue < 0 — look at the dates; if clustered, it's a returns wave, not an error.",
        ],
        checkpoint: "The defect table with counts and treatments, ready for the appendix.",
      },
      {
        phase: "cleaning",
        title: "Clean and aggregate",
        goal: "A clean frame and the campaign/channel aggregates with derived metrics.",
        instructions: [
          "Apply all fixes; build campaign-level and channel-level summary tables with SUMS first, then metrics.",
          "Demonstrate the ratio-averaging bug: compare mean(CTR_row) vs sum-based CTR on one campaign.",
          "Keep net revenue (refunds in) as the headline; gross as a footnote.",
        ],
        hints: [
          "agg dict: {'spend':'sum','impressions':'sum','clicks':'sum','conversions':'sum','revenue':'sum'} then derive metrics as columns — never mean of row ratios.",
          "The bug demo is a finding, not a footnote: two numbers, one wrong, one in every old slide.",
          "Guard division by zero: campaigns with 0 conversions get NaN CPA, not infinity — control the display.",
        ],
        checkpoint: "Campaign and channel scoreboards with sum-based metrics; the bug demonstrated.",
        code: {
          label: "Scoreboards",
          language: "python",
          source: `clean = df.drop_duplicates(["date", "campaign", "channel"]).copy()
clean["spend"] = pd.to_numeric(clean["spend"].astype(str).str.replace(r"[$,]", "", regex=True))
clean["channel"] = clean["channel"].str.title()

camp = clean.groupby("campaign").agg(
    spend=("spend", "sum"), impressions=("impressions", "sum"),
    clicks=("clicks", "sum"), conversions=("conversions", "sum"),
    revenue=("revenue", "sum"))
camp["CTR"] = camp["clicks"] / camp["impressions"]
camp["CVR"] = camp["conversions"] / camp["clicks"]
camp["CPA"] = camp["spend"] / camp["conversions"]
camp["ROAS"] = camp["revenue"] / camp["spend"]
print(camp.round(3).sort_values("ROAS", ascending=False))`,
        },
      },
      {
        phase: "eda",
        title: "Read the scoreboard",
        goal: "Rankings, scale-vs-efficiency, channel patterns, time patterns.",
        instructions: [
          "Rank on CPA and ROAS; annotate spend so scale and efficiency don't blur.",
          "Channel-level CTR/CVR/CPA table; day-of-week performance check.",
          "Note anomalies: refund days, missing-click clusters.",
        ],
        hints: [
          "sort_values on two keys tells two stories: efficiency (ROAS) and importance (spend) — show both orders.",
          "The scale-efficiency scatter (spend vs ROAS) is the meeting's decisive exhibit; build it early.",
          "Day-of-week: groupby(date.dt.dayofweek) on spend/CPA — a light check that can catch serving anomalies.",
        ],
        checkpoint: "Rankings on both metrics, channel table, and any temporal anomalies noted.",
      },
      {
        phase: "statistics",
        title: "Honest ranking and scenario arithmetic",
        goal: "Rank with appropriate caveats; build the budget scenario.",
        instructions: [
          "For small campaigns, compute rough uncertainty on CPA (spend/conversions is noisy at low counts).",
          "Build the reallocation scenario: move X% of display budget to search/email; expected conversions at each channel's CPA.",
          "State assumptions: CPAs hold at margin, no saturation effects within the shifted range.",
        ],
        hints: [
          "CPA uncertainty: conversions are counts — a ±2 conversion swing moves a small campaign's CPA visibly; show the sensitivity.",
          "Scenario math: new_conversions = display_budget_shifted / target_CPA vs old conversions at display CPA — the delta is the recommendation's value.",
          "Assumption discipline: 'CPAs hold' is an assumption, label it; the measurement plan in the recommendation covers it.",
        ],
        checkpoint: "A scenario table with expected conversions and labelled assumptions.",
      },
      {
        phase: "visualisation",
        title: "The budget-meeting exhibits",
        goal: "Five charts, led by the spend-ROAS scatter.",
        instructions: [
          "Build the five; annotate the scatter's quadrants ('stars', 'problems', 'efficient small').",
          "Sorted CPA bars with spend labels; channel CTR/CVR pairs; daily spend-revenue line with refund flags; weekly channel mix.",
          "Takeaway titles throughout.",
        ],
        hints: [
          "Quadrant annotations on the scatter do the persuading; add bubble size = conversions.",
          "Dual-axis (spend line + revenue line) needs careful labelling — or use indexed lines from 100.",
          "Refund spikes: annotate the worst day with its date and value.",
        ],
        checkpoint: "Five exhibits, scatter polished, every chart titled with its takeaway.",
      },
      {
        phase: "interpretation",
        title: "Write the scoreboard story",
        goal: "Findings with metrics, caveats and the definition bug.",
        instructions: [
          "Answer the five initial questions with figures; include the row-average vs sum-based CTR finding.",
          "Caveat the small campaigns' rankings (noisy CPA) and the refund-day effects.",
          "Draft the one-paragraph version the founder will repeat.",
        ],
        hints: [
          "The definition bug is a headline finding: it changed every prior slide, and fixing it is free.",
          "Small-campaign honesty: 'best ROAS on the smallest budget' deserves its scale caveat in the same sentence.",
          "The repeatable paragraph: 'Email retargeting wins, Display wastes a third of budget, Search scales — shift accordingly.'",
        ],
        checkpoint: "Five answered questions, caveats attached, the repeatable paragraph drafted.",
      },
      {
        phase: "recommendations",
        title: "The budget recommendation",
        goal: "A specific split with expected results and measurement conditions.",
        instructions: [
          "Recommend the reallocation with numbers (percent shift, expected CPA change).",
          "Include the definition fix and the Social test as process recommendations.",
          "State what would change the recommendation (measurement triggers).",
        ],
        hints: [
          "Specificity wins budget meetings: 'cap Display at 50%, move 60/40 to Search and Email' beats 'rebalance'.",
          "Expected results in ranges, tied to the scenario arithmetic.",
          "Reversal conditions: 'if Display CPA doesn't beat Search's within 60 days, complete the shift' — pre-committed exits build trust.",
        ],
        checkpoint: "The recommendation table with expected results and reversal conditions.",
      },
      {
        phase: "report",
        title: "The campaign report",
        goal: "A one-page-plus-appendix report the founder takes to the budget meeting.",
        instructions: [
          "Structure: definitions → scoreboard → the scatter → channels → budget recommendation.",
          "Definitions box up front (with the bug called out); cleaning log in the appendix.",
          "The scatter is the body chart; everything else supports it.",
        ],
        hints: [
          "The definitions box pre-empts the 'whose CTR is right' argument — put it on page one.",
          "One page of story, then tables; executives quote pages, analysts quote appendices — serve both.",
          "Date-stamp the report and the data window; campaign reports travel without context.",
        ],
        checkpoint: "The report, every figure traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the marketing analyst for a D2C brand. The founder needs one defensible campaign ranking and a budget recommendation for next quarter. Metric definitions and their denominators are yours to set — correctly — and the dataset's small, so every exclusion is visible in the rankings.",
      deliverables: [
        "Defect table and cleaning log",
        "Campaign and channel scoreboards with sum-based metrics",
        "Scale-vs-efficiency analysis (the scatter with annotations)",
        "The row-average vs sum-based metric comparison",
        "Budget recommendation with scenario arithmetic and reversal conditions",
      ],
      guardrails: [
        "All ratios computed from sums, never row-ratio averages",
        "Missing-click rows handled distinctly in totals vs ratios",
        "Refund days retained in net revenue and flagged",
        "Small-campaign rankings caveated for CPA noise",
      ],
    },

    evaluationChecks: {
      correctness: [
        "CTR/CVR/CPA/ROAS from group-level sums",
        "Spend numericised before totals; duplicates removed at grain",
        "Missing clicks excluded from ratios without dropping spend totals",
      ],
      "code-quality": [
        "Metric derivations written once and reused",
        "Aggregations explicit with named columns",
      ],
      reasoning: [
        "Scale vs efficiency separated in the ranking narrative",
        "Scenario assumptions labelled",
      ],
      visualization: [
        "Scatter encodes three variables (spend, ROAS, size)",
        "Sorted bars with spend annotations",
      ],
      interpretation: [
        "The ratio-averaging bug identified and demonstrated",
        "Refund days explained, not hidden",
      ],
      recommendations: [
        "Reallocation quantified with expected CPA movement",
        "Reversal/measurement conditions attached",
      ],
    },
  },

  /* ================================================================ MKT-02 */
  {
    id: "marketing-2",
    categoryId: "marketing",
    difficulty: "intermediate",
    code: "MKT-02",
    title: "Channel Mix & Attribution Comparison",
    subtitle: "Sixteen thousand touchpoints: compare attribution models and defend a reallocation.",
    summary:
      "Attribution comparison at channel level: clean a touchpoint log, compute first/last/linear credit and effective CPA per channel, quantify model disagreement, and recommend a reallocation with its measurement plan.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Touchpoint data modelling", "Multi-model attribution", "Channel economics", "Sensitivity thinking", "Marketing measurement"],

    businessBackground:
      "Kindred Outdoor sells hiking gear online and spends across six channels. The default reporting tool uses last-touch attribution, and the head of Growth suspects it systematically overpays the bottom of the funnel (branded search, retargeting) while starving the top (social, display, content). The board approved a measurement review before the holiday budget lock: build first, last and linear attribution from the touchpoint log, quantify where the models disagree, and propose a reallocation that survives the disagreement.",
    problemStatement:
      "Compute and compare attribution models at channel level from a touchpoint log: first-touch, last-touch and linear credit for conversions and revenue; effective CPA per channel under each model; the size and direction of model disagreement; and a reallocation recommendation robust to model choice — with a measurement plan to test it.",
    businessObjectives: [
      "Reconstruct journeys (session-touchpoint sequences) with documented sessionisation",
      "Compute three attribution models and their per-channel conversion/revenue credit",
      "Quantify model disagreement (percentage-point shifts per channel) and its budget implications",
      "Compute effective CPA per channel per model; identify robust vs fragile efficiency rankings",
      "Deliver a reallocation proposal with holdout-based measurement design",
    ],
    datasetDescription:
      "~16,000 touchpoints: each row a marketing touch (channel, campaign, position in session sequence, cost) with a converted flag and conversion value when the session converted. Some costs are missing, converted flags have gaps, position labels contain a variant ('middle'), and duplicates exist. Attribution on this data is a grouping-and-crediting exercise — the craft is in the journey reconstruction and the honest comparison of models.",
    dataDictionary: [
      { column: "touch_id", kind: "id", description: "Unique touchpoint identifier", example: "100482" },
      { column: "session_id", kind: "id", description: "Session the touch belongs to", example: "512240" },
      { column: "customer_id", kind: "id", description: "Customer identifier", example: "71240" },
      { column: "touch_date", kind: "date", description: "Touch date", example: "2025-06-12" },
      { column: "channel", kind: "categorical", description: "Marketing channel (6 values)", example: "Social" },
      { column: "campaign", kind: "text", description: "Campaign name", example: "Spring Launch" },
      { column: "position", kind: "categorical", description: "first / mid / last (variant 'middle' exists)", example: "mid" },
      { column: "cost_per_touch", kind: "currency", description: "Touch cost (some missing)", example: "2.40" },
      { column: "converted", kind: "boolean", description: "Whether the session converted (some missing)", example: "1" },
      { column: "conversion_value", kind: "currency", description: "Value if this is the converting touch", example: "128.50" },
      { column: "device", kind: "categorical", description: "Mobile / Desktop", example: "Mobile" },
    ],
    initialQuestions: [
      "How many sessions and journeys does the touchpoint log contain, and how long are converting journeys?",
      "How does channel credit shift between first-touch, last-touch and linear models?",
      "What is each channel's effective CPA under each model — and which channels' efficiency is model-robust?",
      "Where is model disagreement largest, and what does that mean for budget decisions?",
      "What reallocation is defensible, and how should it be tested (holdout design)?",
    ],
    dataset: {
      name: "Kindred touchpoint log",
      filename: "marketing-02-attribution-touches.csv",
      description: "~16,000 marketing touchpoints with journey position and conversion flags.",
      rows: 16000,
    },

    dataQuality: [
      { issue: "Position label variant", where: "position — 'middle' vs 'mid'", detection: "value_counts()", treatment: "Map 'middle' → 'mid'; position drives sequence logic so unmapped values corrupt journey order." },
      { issue: "Missing converted flags", where: "converted — ~1% of touches", detection: "isna().sum()", treatment: "Session-level truth: if any touch in a session has converted=1, the session converted; propagate within session. Truly unknown sessions excluded (counted)." },
      { issue: "Missing cost per touch", where: "cost_per_touch — ~3%", detection: "isna().sum()", treatment: "Impute per-channel median (documented); CPA economics need complete costs and medians are defensible at channel level." },
      { issue: "Duplicate touches", where: "~0.6% duplicated rows", detection: "duplicated('touch_id').sum()", treatment: "Drop; duplicates overweight their channels in every model." },
      { issue: "Conversion value on non-converting touches", where: "value > 0 with converted = 0", detection: "cross-check value vs converted by session", treatment: "Session-level repair: value belongs to the converting session; verify and correct placement (should sit on the last touch)." },
    ],
    cleaningPlan: [
      { action: "Deduplicate; normalise position; sessionise with documented rules", rationale: "Attribution is journey arithmetic — sequence integrity first." },
      { action: "Propagate converted flag and value at session level (source of truth)", rationale: "Touches inherit session truth; the value sits on the converting touch." },
      { action: "Impute missing cost with per-channel medians (flagged)", rationale: "CPA completeness without inventing channel differences." },
      { action: "Build the journey table: per session, ordered channel sequence, conversion flag, value, costs", rationale: "All three models compute from this one artefact — consistency by construction." },
    ],
    edaPlan: [
      { question: "Journey landscape", method: "touches per session; channel mix overall and by position", expectation: "2.4 touches/session average; social/organic dominate 'first', search dominates 'last'." },
      { question: "Conversion patterns", method: "conversion rate by journey length; by first-touch channel", expectation: "Longer journeys convert better (engaged audiences); referral first-touches convert best." },
      { question: "Channel cost structure", method: "total cost and cost per touch by channel", expectation: "Display cheap per touch, search expensive per touch." },
      { question: "Position asymmetry", method: "channel share of first vs last touches in converting journeys", expectation: "The core exhibit: social 30% of firsts but 8% of lasts; search the reverse." },
      { question: "Value differences", method: "conversion value by converting channel", expectation: "Email and referral convert higher-value orders." },
    ],
    statisticsPlan: [
      { technique: "Three attribution models from the journey table", purpose: "First, last, linear credit per channel", expectation: "Search loses ~8–12pts under first-touch; social gains most; email stable." },
      { technique: "Effective CPA per channel per model", purpose: "Efficiency under each lens", expectation: "Some channels flip rank across models — the fragility finding." },
      { technique: "Model-disagreement quantification (max point-shift per channel)", purpose: "Separate robust from fragile conclusions", expectation: "Search and Social disagree most; referral/affiliate stable." },
      { technique: "Reallocation scenario with guardrails", purpose: "A proposal that survives model choice", expectation: "Modest shifts (±3–5%) defensible; large shifts model-dependent." },
    ],
    visualisationPlan: [
      { chart: "Dumbbell — channel credit, first vs last touch (with linear marker)", answers: "How does credit move?", reads: "Dumbbell span = disagreement; the linear dot sits between." },
      { chart: "Heatmap — channel × model credit shares", answers: "The full comparison", reads: "Rows sum to 100%; colour intensity locates disagreement." },
      { chart: "Slope/line — CPA by channel across models", answers: "Whose efficiency is robust?", reads: "Crossing lines = rank flips; parallel lines = robust." },
      { chart: "Bar — touches per session distribution", answers: "How long are journeys?", reads: "Median and tail; the basis for linear model legitimacy." },
      { chart: "Scatter — cost share vs credit share (per channel, per model)", answers: "Who's over/under-funded relative to credit?", reads: "Points off the diagonal are the reallocation candidates." },
    ],
    findings: [
      "Last-touch and first-touch disagree materially for two channels: Paid Search holds ~10 points more credit under last-touch, Social ~8 points more under first-touch — the top-vs-bottom-of-funnel tension the head of Growth suspected.",
      "Linear attribution splits the difference and reveals Email/Referral as consistent mid-journey contributors whose credit is stable across models.",
      "Effective CPA rankings are robust for three channels (Referral, Affiliate, Display expensive) but flip between models for Search vs Social — large reallocations between those two are model-choice bets, not evidence.",
      "Converting journeys average ~2.4 touches and longer journeys convert at higher rates — multi-touch reality is the rule, not the exception, in this data.",
      "A cost-vs-credit comparison under linear attribution shows Social and Organic under-funded relative to credit, Branded Search over-funded relative to its incremental argument.",
    ],
    recommendations: [
      { what: "Adopt dual-model reporting (first + last) immediately and linear for internal decisions", why: "Single-model reporting created the distortion; dual visibility prevents relapse at zero cost.", impact: "Decision hygiene", horizon: "immediate" },
      { what: "Shift 3–5% of Branded Search budget toward Social prospecting under a strict holdout, not more", why: "The credit evidence supports direction; the model disagreement caps the defensible size of the bet.", impact: "Modest, testable top-of-funnel investment", horizon: "this quarter" },
      { what: "Run geo-split holdout on Social prospecting for 6 weeks before any larger shift", why: "Path-based evidence is correlational; a holdout tests the introduction effect causally.", impact: "Converts attribution debate into measurement", horizon: "this quarter" },
      { what: "Fund Email and Referral to their credit share under linear (content and programme budget)", why: "Their contribution is model-robust; they are structurally under-funded in the last-touch world.", impact: "Stable-efficiency channel growth", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "The measurement review confirms the suspicion with numbers: last-touch attribution overpays the bottom of the funnel by roughly ten points of credit to Paid Search and underpays Social's introduction role by a similar margin. Linear attribution — the honest middle on this journey data — shows Email and Referral as stable, under-funded mid-journey contributors. But model disagreement also disciplines the recommendation: only a modest 3–5% shift from Branded Search to Social prospecting is defensible on attribution alone, and it should run under a geo holdout that measures incrementality directly. The durable fix is dual-model reporting and channel funding tied to credit share under linear, not another single-model orthodoxy.",
      structure: [
        "1. The measurement question and scope",
        "2. Touchpoint data, sessionisation and quality treatment",
        "3. Journey landscape (length, conversion patterns)",
        "4. Three models compared: credit by channel",
        "5. Effective CPA and robustness (which rankings survive)",
        "6. The reallocation proposal and holdout design",
        "7. Appendix: sessionisation rules, imputation log, model arithmetic",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Sessionise before you attribute",
        goal: "Build the session-journey structure the models depend on.",
        instructions: [
          "Confirm the grain: touches belong to sessions; sessions have customers. Journey = the ordered touch sequence of a session.",
          "Sort touches by (session_id, touch_date); check the position column against the actual order.",
          "Count sessions, average touches per session, and the channel mix at first vs last position — the story's first sketch.",
        ],
        hints: [
          "Attribution is computed on sessions (or cross-session journeys); the touch log is raw material, not the analysis frame.",
          "The position column is a helper, not a truth: verify it against sorted order and fix the 'middle' variant.",
          "first vs last channel mix is your first exhibit — compute it before any model.",
        ],
        checkpoint: "A sorted, sessionised frame with position verified and the first/last mix table.",
        code: {
          label: "Sessionisation",
          language: "python",
          source: `df = pd.read_csv("marketing-02-attribution-touches.csv", parse_dates=["touch_date"])
clean = df.drop_duplicates("touch_id").copy()
clean["position"] = clean["position"].replace({"middle": "mid"})
clean = clean.sort_values(["session_id", "touch_date"])

sess = clean.groupby("session_id").agg(
    touches=("touch_id", "count"),
    first_ch=("channel", "first"), last_ch=("channel", "last"),
    converted=("converted", "max"), value=("conversion_value", "max"))
print(sess["touches"].describe())
print("first mix:", sess["first_ch"].value_counts(normalize=True).round(3).to_dict())
print("last mix:", sess["last_ch"].value_counts(normalize=True).round(3).to_dict())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the touch log",
        goal: "Position variants, missing flags/costs, duplicates, value placement.",
        instructions: [
          "Quantify all five defect families; write the session-level propagation policy for converted/value.",
          "Imputation policy for cost (per-channel median) with share reported.",
          "Verify no session has contradictory converted flags after propagation.",
        ],
        hints: [
          "Session-level truth: groupby('session_id')['converted'].max() is the session's verdict; touches inherit it.",
          "Value placement: conversion_value should live on the converting session's last touch — check and repair.",
          "Cost imputation by channel median is defensible; by global median invents cross-channel equality.",
        ],
        checkpoint: "An audit table with policies, plus the propagated session frame.",
      },
      {
        phase: "cleaning",
        title: "Build the journey table",
        goal: "One artefact: sessions with ordered channel lists, flags, values and costs.",
        instructions: [
          "Apply all repairs; build the journey table with list-aggregated channels and summed costs.",
          "Add journey-level fields: touch count, distinct channels, first/last channel, converted, value.",
          "Validate: every converting session has positive value; non-converting have zero.",
        ],
        hints: [
          "List aggregation: .agg(channels=('channel', list)) gives the sequence linear attribution needs.",
          "Validation asserts catch repair mistakes: assert (jour['converted'] == (jour['value'] > 0)).all() approx.",
          "The journey table is THE model input — build it once, audit it, then compute all three models from it.",
        ],
        checkpoint: "A validated journey table ready for attribution.",
        code: {
          label: "Journey table",
          language: "python",
          source: `clean["cost_per_touch"] = clean["cost_per_touch"].fillna(
    clean.groupby("channel")["cost_per_touch"].transform("median"))
clean["session_conv"] = clean.groupby("session_id")["converted"].transform("max")

jour = clean.groupby("session_id").agg(
    channels=("channel", list), touches=("touch_id", "count"),
    cost=("cost_per_touch", "sum"), converted=("session_conv", "first"),
    value=("conversion_value", "max")).reset_index()
jour["value"] = jour["value"].fillna(0)
print(jour.head())`,
        },
      },
      {
        phase: "eda",
        title: "The journey landscape",
        goal: "Journey length, position asymmetry, conversion patterns.",
        instructions: [
          "Touches-per-session distribution; conversion rate by journey length.",
          "Channel share of first vs last touches among converting sessions.",
          "Cost structure per channel (total and per touch).",
        ],
        hints: [
          "The first-vs-last share comparison IS the attribution story's preview — make it a clean table.",
          "Conversion by journey length: longer journeys convert better; note the selection caveat (engaged users have more touches).",
          "Cost per touch by channel contextualises CPA differences later.",
        ],
        checkpoint: "Journey-length stats, the first/last asymmetry table, channel cost structure.",
      },
      {
        phase: "statistics",
        title: "Three models, honestly compared",
        goal: "First/last/linear credit, per-channel CPA, disagreement quantified.",
        instructions: [
          "Compute all three models' conversion credit AND revenue credit by channel from the journey table.",
          "Effective CPA per channel per model (channel spend / credited conversions).",
          "Quantify disagreement: max point-shift per channel across models; identify robust vs fragile rankings.",
        ],
        hints: [
          "Linear: value/conversions split evenly across DISTINCT channels in the journey — duplicates share one slice.",
          "CPA per model: spend is fixed (it happened); credit moves — so CPA moves inversely to credit. That's the mechanism to explain.",
          "Robustness = ranking stability across models; fragility = rank flips. Both are findings, and the budget recommendation depends on knowing which is which.",
        ],
        checkpoint: "The model comparison tables with disagreement quantified.",
        code: {
          label: "Three models",
          language: "python",
          source: `conv = jour[jour["converted"] == 1].copy()
rows = []
for _, j in conv.iterrows():
    chs = list(dict.fromkeys(j["channels"]))  # distinct, ordered
    for ch in chs:
        rows.append({"channel": ch, "first": 0, "last": 0, "linear": 1/len(chs)})
    rows[-len(chs)]["first"] = 1      # first distinct channel
    # last touch may repeat; credit the actual last channel
for model in ["first", "last", "linear"]:
    credit = pd.DataFrame(rows).groupby("channel")[model].sum()
    print(model, (credit / credit.sum() * 100).round(1).to_dict())`,
        },
      },
      {
        phase: "visualisation",
        title: "The comparison exhibits",
        goal: "Dumbbell, heatmap, CPA slopes, journey bars, cost-vs-credit scatter.",
        instructions: [
          "Build the five exhibits; the dumbbell and CPA-slope charts carry the robustness argument.",
          "Annotate the largest disagreements with point values.",
          "The cost-vs-credit scatter under linear is the reallocation map.",
        ],
        hints: [
          "Dumbbell: x = credit share, two dots per channel (first/last), linear as a vertical tick between.",
          "CPA slope chart: one line per channel across three models; crossings are the fragile story.",
          "Cost-vs-credit scatter: diagonal reference line; label off-diagonal channels.",
        ],
        checkpoint: "Five exhibits with the dumbbell and slope chart presentation-ready.",
      },
      {
        phase: "interpretation",
        title: "Robust vs fragile",
        goal: "Sort findings by how much model choice drives them.",
        instructions: [
          "Classify each channel's efficiency conclusion as robust or model-dependent, with the point-shift numbers.",
          "State what the attribution CANNOT show (incrementality) and why a holdout is the honest next step.",
          "Draft the reallocation paragraph: direction, size cap, and the reasoning for the cap.",
        ],
        hints: [
          "The size cap follows the disagreement: where models disagree by 10 points, a 20-point budget move is a bet on one model.",
          "Incrementality language: attribution redistributes observed credit; it cannot create causation — only a holdout can.",
          "The paragraph the head of Growth repeats: 'The direction is clear, the size is uncertain, so we shift a little and measure a lot.'",
        ],
        checkpoint: "A robustness classification, the incrementality caveat, and the capped reallocation paragraph.",
      },
      {
        phase: "recommendations",
        title: "The reallocation and its test",
        goal: "A defensible shift, a holdout design, and reporting changes.",
        instructions: [
          "Specify the shift (channels, percent, timing) and its guardrails.",
          "Design the holdout: unit (geo/audience), duration, primary metric, decision rule.",
          "Recommend the reporting change (dual-model + linear for internal).",
        ],
        hints: [
          "Holdout design specifics: matched geos, 6 weeks minimum for funnel lag, primary metric = incremental conversions per exposed audience.",
          "Decision rule pre-committed: lift threshold and the revert-or-scale branch.",
          "Reporting change is the zero-cost recommendation that outlives the budget cycle.",
        ],
        checkpoint: "The reallocation spec, holdout design, and reporting recommendation.",
      },
      {
        phase: "report",
        title: "The measurement review",
        goal: "A board-ready review: models compared, uncertainty quantified, action capped to evidence.",
        instructions: [
          "Follow the outline; open with the ten-point Search/Social disagreement.",
          "The dumbbell and slope charts in the body; model arithmetic in the appendix.",
          "Close with the holdout calendar and decision date.",
        ],
        hints: [
          "The board version: 'Last-touch overpays the closer by ten points; we'll shift a little and measure a lot before shifting more.'",
          "Sessionisation rules and imputation shares belong in the appendix — reviewers check them when numbers are contested.",
          "Date-stamp every table with the data window.",
        ],
        checkpoint: "The complete measurement review, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the growth measurement analyst. The head of Growth needs an attribution comparison that survives scrutiny: three models, quantified disagreement, and a reallocation capped to what the evidence supports. Sessionisation and imputation policies are yours to set and document.",
      deliverables: [
        "Touchpoint audit and sessionisation rules (documented)",
        "Journey table construction and validation",
        "First/last/linear credit comparison with point-shift quantification",
        "Per-channel CPA under each model with robustness classification",
        "Reallocation proposal with holdout design and reporting change",
      ],
      guardrails: [
        "Session-level truth propagation for converted/value documented",
        "Linear model credits distinct channels correctly",
        "Model-dependent conclusions labelled fragile, not averaged away",
        "Holdout specified with unit, duration, metric, decision rule",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Models computed from one shared journey table",
        "Linear credit splits across distinct channels per journey",
        "CPA uses fixed channel spend against model-varying credit",
      ],
      "code-quality": [
        "Sessionisation and propagation policies in code comments",
        "Cost imputation flagged and share reported",
      ],
      reasoning: [
        "Model disagreement quantified in points, not adjectives",
        "Robust vs fragile efficiency rankings distinguished",
      ],
      visualization: [
        "Dumbbell or equivalent shows credit movement with magnitudes",
        "CPA slope chart exposes rank flips across models",
      ],
      interpretation: [
        "Incrementality limitation of attribution stated",
        "Reallocation size justified by (and capped to) the disagreement",
      ],
      recommendations: [
        "Holdout design concrete: unit, duration, metric, decision rule",
        "Reporting change included as the durable fix",
      ],
    },
  },

  /* ================================================================ MKT-03 */
  {
    id: "marketing-3",
    categoryId: "marketing",
    difficulty: "advanced",
    code: "MKT-03",
    title: "Experiment Read-out & Incrementality",
    subtitle: "An A/B/n test with pre-period data: did the new checkout actually work, for whom, and how sure are we?",
    summary:
      "A rigorous experiment read-out: validate randomisation with pre-period covariates, estimate effects with uncertainty, probe segment heterogeneity and Simpson's risks, and deliver a ship/kill/iterate verdict with guardrails.",
    hours: 14,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "scipy", "Matplotlib", "Seaborn"],
    skills: ["Experiment analysis", "Randomisation checks", "CUPED variance reduction", "Heterogeneity analysis", "Decision-grade statistics"],

    businessBackground:
      "Cartwheel, a marketplace app, ran a three-arm experiment on its checkout flow for six weeks: control (current flow), Treatment A (one-page checkout), Treatment B (accelerated guest checkout). Product leadership wants to ship 'the winner' next week, but the experiment carries real stakes: checkout changes touch every order, engineering rework is expensive, and a previous 'winning' redesign later proved to be a segment illusion. The experimentation lead wants a read-out that would survive a methodological review: randomisation validated, effects estimated with appropriate uncertainty, heterogeneity explored, and a decision framed with guardrails.",
    problemStatement:
      "Analyse the three-arm checkout experiment rigorously: validate assignment and pre-period balance; estimate each treatment's effect on sessions, purchase rate and revenue with confidence intervals (including CUPED adjustment using pre-period data); test for segment heterogeneity (platform, region) with multiplicity discipline; and deliver a ship/kill/iterate recommendation with monitoring guardrails for post-launch.",
    businessObjectives: [
      "Validate experiment integrity: assignment consistency, sample ratios, pre-period balance",
      "Estimate treatment effects on purchase rate and revenue with CIs (naive and CUPED-adjusted)",
      "Probe heterogeneity by platform and region with multiplicity control",
      "Quantify practical significance: order volumes, revenue per user, and what a further iteration should test",
      "Deliver the decision memo: ship/kill/iterate with guardrails and monitoring plan",
    ],
    datasetDescription:
      "User-level experiment data (~12,000 users): variant assignment, platform, region, signup week, pre-experiment sessions and revenue, post-experiment sessions, purchases and revenue, plus support contacts. Variant labels have casing inconsistencies, some post-period metrics are missing, a few pre-period values are corrupted outliers, duplicates exist, and region coding varies. The pre-period columns are the methodological gift — they enable both balance checks and variance reduction, and they catch the corrupted outliers a naive analysis would average in.",
    dataDictionary: [
      { column: "user_id", kind: "id", description: "Experiment user identifier", example: "500482" },
      { column: "variant", kind: "categorical", description: "Control / Treatment A / Treatment B (casing variants)", example: "Treatment A" },
      { column: "platform", kind: "categorical", description: "iOS / Android / Web", example: "Android" },
      { column: "region", kind: "categorical", description: "Region (casing variants)", example: "Europe" },
      { column: "signup_week", kind: "date", description: "User signup week", example: "2025-06-09" },
      { column: "pre_period_sessions", kind: "integer", description: "Sessions in the 28 days before exposure (outliers exist)", example: "14" },
      { column: "pre_period_revenue", kind: "currency", description: "Revenue in pre-period", example: "9.40" },
      { column: "post_period_sessions", kind: "integer", description: "Sessions in 28-day post window (some missing)", example: "15" },
      { column: "post_period_revenue", kind: "currency", description: "Revenue in post window", example: "0.00" },
      { column: "post_purchases", kind: "integer", description: "Purchases in post window (0/1+)", example: "1" },
      { column: "support_contacts", kind: "integer", description: "Support contacts during experiment", example: "0" },
    ],
    initialQuestions: [
      "Did randomisation hold — are variants balanced on pre-period sessions, revenue, platform and region?",
      "What is each treatment's effect on purchase rate and revenue per user, with what confidence (naive and CUPED)?",
      "Does the effect differ by platform or region — and is any heterogeneity real or multiplicity noise?",
      "What is the interaction between treatment and pre-period engagement (do heavy users respond differently)?",
      "Ship, kill or iterate — and if ship, with what monitoring guardrails?",
    ],
    dataset: {
      name: "Cartwheel checkout experiment",
      filename: "marketing-03-experiment-users.csv",
      description: "User-level A/B/n checkout experiment with pre-period covariates.",
      rows: 12000,
    },

    dataQuality: [
      { issue: "Variant casing variants", where: "variant — 'control'/'Control'", detection: "value_counts()", treatment: "Canonicalise to exactly three arms; any other values are assignment corruption to investigate, not map." },
      { issue: "Missing post metrics", where: "post_period_sessions — ~2%", detection: "isna().sum() by variant", treatment: "Check missingness by variant — if differential, it's an integrity finding. Otherwise exclude (counted); never impute outcomes." },
      { issue: "Pre-period outlier corruption", where: "pre_period_sessions — extreme values (~40× typical)", detection: "describe by variant; box plots", treatment: "Critical: cap or exclude for CUPED (a 500-session outlier destroys the regression adjustment) but report — and verify balance both with and without outliers." },
      { issue: "Duplicate users", where: "~0.4% duplicated user_ids", detection: "duplicated('user_id').sum()", treatment: "A user in two arms is fatal for an experiment — investigate, keep first assignment, document." },
      { issue: "Region casing", where: "region — 'EUROPE' variants", detection: "value_counts()", treatment: "Canonicalise for stratified checks." },
      { issue: "Sample ratio mismatch", where: "Arm sizes off the expected split", detection: "chi-square goodness-of-fit on arm counts", treatment: "If significant, flag in the read-out: SRM invalidates naive inference until explained (bot filtering, logging loss).",
      },
    ],
    cleaningPlan: [
      { action: "Canonicalise variants and regions; resolve duplicates (first assignment wins)", rationale: "Three arms, one row per user — the experiment's constitution." },
      { action: "SRM check before any effect estimate", rationale: "A broken split poisons everything downstream; check it first, report it prominently." },
      { action: "Exclude missing outcomes (counted, by arm); cap pre-period outliers for covariate use", rationale: "Outcomes never imputed; covariates capped because CUPED's regression is outlier-sensitive." },
      { action: "Build analysis frames: intent-to-treat (all assigned), completer (observed outcomes)", rationale: "ITT is the headline; completer is the sanity check. Both defined, both reported." },
    ],
    edaPlan: [
      { question: "Arm sizes and SRM", method: "counts per arm; chi-square vs expected split", expectation: "Roughly equal thirds; SRM non-significant after duplicate repair." },
      { question: "Pre-period balance", method: "mean/median pre-sessions and revenue by arm; standardised differences", expectation: "Balance within noise — randomisation held." },
      { question: "Outcome base rates", method: "purchase rate and revenue per user by arm (raw)", expectation: "Treatment A visibly ahead on purchase rate; B mixed." },
      { question: "Platform and region mix", method: "crosstabs by arm", expectation: "Balanced; platform shares similar across arms." },
      { question: "Support contacts", method: "rate by arm", expectation: "Treatment B slightly elevated — a guardrail metric to watch." },
      { question: "Pre-period vs outcome relationship", method: "correlation of pre-sessions with purchases", expectation: "Positive — which is why CUPED will help." },
    ],
    statisticsPlan: [
      { technique: "Randomisation checks (balance, SRM)", purpose: "Establish experiment validity", expectation: "Pass; document as the first table of the read-out." },
      { technique: "Effect estimation with CIs (proportions and means by arm)", purpose: "The headline effects", expectation: "Treatment A: +0.8 to +1.2pt purchase rate, significant; B: near zero, CI includes no-effect." },
      { technique: "CUPED adjustment using pre-period covariates", purpose: "Tighter CIs on the same effects", expectation: "~25–35% variance reduction; A's CI narrows materially." },
      { technique: "Heterogeneity with multiplicity control (platform, region, pre-engagement)", purpose: "Find real segments, resist noise", expectation: "One modest platform interaction (A stronger on mobile); region null after correction." },
      { technique: "Simpson's check (pooled vs within-stratum effects)", purpose: "Ensure the headline isn't a mix artifact", expectation: "Effect direction stable within platforms." },
    ],
    visualisationPlan: [
      { chart: "Balance dot plot — pre-period metrics by arm with CIs", answers: "Did randomisation hold?", reads: "Overlapping intervals = balance; the read-out's first exhibit." },
      { chart: "Forest plot — treatment effects (naive vs CUPED) on purchase rate and revenue", answers: "What did each arm do?", reads: "Dots and CIs vs the zero line; CUPED intervals visibly tighter." },
      { chart: "Bar — purchase rate by arm × platform (the heterogeneity exhibit)", answers: "For whom does it work?", reads: "Interaction visible as non-parallel profiles." },
      { chart: "Histogram — revenue per user by arm (log-ish scale or clipped)", answers: "What does the outcome distribution look like?", reads: "Zero-inflated with a right tail; why means need care." },
      { chart: "Line — weekly purchase rate by arm over the experiment", answers: "Is the effect stable or novelty?", reads: "A's lift steady across weeks (not just week 1)." },
    ],
    findings: [
      "Randomisation held: arms balance on pre-period sessions, revenue, platform and region, and the sample-ratio check passes after duplicate repair — the foundation for everything else.",
      "Treatment A (one-page checkout) lifts purchase rate by roughly one percentage point (≈10–11% relative) with a confidence interval comfortably excluding zero; Treatment B shows no reliable effect (CI spans no-effect).",
      "CUPED adjustment using pre-period sessions cuts interval width by about a third — the same conclusion with materially more precision, which matters for the ship decision's confidence.",
      "Heterogeneity is modest and survives correction: A's lift is stronger on mobile platforms (its natural habitat); region effects vanish under multiplicity control — the previous redesign's 'regional win' pattern does not recur.",
      "Treatment B shows a slightly elevated support-contact rate — a guardrail signal that reinforces the kill recommendation rather than an iterate one.",
    ],
    recommendations: [
      { what: "Ship Treatment A to 100% with a staged rollout (10% → 50% → 100% over two weeks) and automated rollback thresholds", why: "A reliable ~1pt purchase-rate lift with balanced guardrails earns the ship; staging protects against unseen interactions.", impact: "≈10% relative purchase-rate uplift on the whole base", horizon: "immediate" },
      { what: "Kill Treatment B (guest checkout) and archive its support-contact signal for the next checkout iteration", why: "No reliable effect plus a negative guardrail trend — the clearest kill in the read-out.", impact: "Stops spend on a non-winner; preserves learnings", horizon: "immediate" },
      { what: "Monitor the shipped experience on purchase rate, revenue per user and support contacts for four weeks with pre-registered thresholds", why: "Experiment-to-production gaps (bugs, slower rollout cohorts) are common; monitoring closes them.", impact: "Protection of the measured lift", horizon: "this quarter" },
      { what: "Pre-register the next checkout iteration (A-plus) with mobile-first hypotheses and CUPED from day one", why: "A's mobile-skewed lift points to where the next improvement lives; CUPED's precision gain should be designed in, not retrofitted.", impact: "Faster, better-powered next experiments", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "The checkout experiment clears the methodological bar and gives a clean verdict. Randomisation validated (balance on pre-period behaviour, sample ratios clean after duplicate repair), Treatment A lifts purchase rate by about one point — roughly a 10% relative improvement, robust to CUPED adjustment and stable across weeks — while Treatment B shows no reliable effect and a mildly negative support signal. Heterogeneity is modest: A works harder on mobile, regional patterns dissolve under multiplicity control. Recommendation: ship A with staged rollout and pre-registered monitoring thresholds, kill B, and pre-register a mobile-first successor with CUPED built in. Full effect tables, checks and decision thresholds are in the read-out.",
      structure: [
        "1. The decision at stake and experiment design",
        "2. Data integrity: assignment, SRM, duplicates, exclusions",
        "3. Randomisation validation (the first table)",
        "4. Treatment effects: naive and CUPED, with CIs",
        "5. Heterogeneity with multiplicity discipline",
        "6. Guardrails: support contacts, revenue distribution",
        "7. The decision memo: ship/kill/iterate with thresholds",
        "8. Appendix: pre-registration, cleaning log, full model tables",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Write the analysis plan first",
        goal: "Design document before data: arms, metrics, covariates, analysis frames.",
        instructions: [
          "Write the plan: primary metric (purchase rate), secondary (revenue per user), covariates (pre-period sessions/revenue), guardrail (support contacts), frames (ITT, completer).",
          "Understand the data's promise: pre-period columns enable BOTH balance checks and CUPED.",
          "Set the decision rule skeleton now (significance + practical thresholds) so the analysis serves a decision, not a tour.",
        ],
        hints: [
          "A pre-stated analysis plan is what makes an experiment read-out trustworthy — deviations become visible deviations.",
          "ITT vs completer: users missing post-metrics are part of the assigned population; excluding them is a choice that must be shown to be non-differential.",
          "Practical significance matters as much as statistical: a 0.1pt lift on a 9% base is noise-adjacent even if significant at N=12,000.",
        ],
        checkpoint: "A written analysis plan with metrics, frames and decision skeleton.",
        code: {
          label: "Arm structure check",
          language: "python",
          source: `df = pd.read_csv("marketing-03-experiment-users.csv")
df["variant"] = df["variant"].str.title()
print(df["variant"].value_counts())
print("duplicate users:", df["user_id"].duplicated().sum())
print(df.isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Integrity audit",
        goal: "Assignment, SRM, duplicates, missingness by arm, outliers.",
        instructions: [
          "Resolve duplicates (first assignment); verify exactly three arms.",
          "Chi-square SRM test on arm counts; missing-outcome rates BY ARM; pre-period outlier census.",
          "Every integrity result goes in the read-out's second section — pass or fail.",
        ],
        hints: [
          "SRM: chisquare(observed_counts, expected_proportions) — a p < 0.001 SRM invalidates the whole read-out until explained.",
          "Missingness by arm: if one arm loses 4% of outcomes and others 1%, differential attrition is biasing the comparison — report, don't repair.",
          "Pre-period outliers: keep raw for balance reporting, cap for CUPED — two views, both shown.",
        ],
        checkpoint: "The integrity table: SRM result, duplicates resolved, missingness by arm, outlier policy.",
        code: {
          label: "SRM test",
          language: "python",
          source: `from scipy.stats import chisquare

df = df.drop_duplicates("user_id", keep="first")
counts = df["variant"].value_counts()
expected = [len(df) / 3] * 3
stat, p = chisquare(counts.values, expected)
print(f"arm counts: {counts.to_dict()}")
print(f"SRM chi-square p={p:.4f}")
print(df.groupby("variant")["post_period_sessions"].apply(lambda s: s.isna().mean()))`,
        },
      },
      {
        phase: "cleaning",
        title: "Build the analysis frames",
        goal: "ITT and completer frames with capped covariates and canonical labels.",
        instructions: [
          "Canonicalise variant/region; cap pre-period outliers at a documented percentile; exclude missing outcomes into the completer frame.",
          "Derive the purchase indicator and revenue outcomes; verify no NaNs in analysis columns.",
          "Keep the frame audit trail: N per arm per frame — it goes on every table.",
        ],
        hints: [
          "Capping rule: pre-sessions > p99 → set to p99 (winsorise) for covariate use; document the count touched.",
          "purchase = (post_purchases > 0).astype(int) — the primary metric is binary per user.",
          "Frame accounting: ITT N per arm, completer N per arm, excluded N per arm — three numbers, always together.",
        ],
        checkpoint: "Both frames built with full N accounting.",
        code: {
          label: "Frames",
          language: "python",
          source: `itt = df.drop_duplicates("user_id", keep="first").copy()
itt["region"] = itt["region"].str.title()
cap = itt["pre_period_sessions"].quantile(0.99)
itt["pre_sessions_c"] = itt["pre_period_sessions"].clip(upper=cap)
itt["purchase"] = (itt["post_purchases"].fillna(0) > 0).astype(int)

comp = itt.dropna(subset=["post_period_sessions"]).copy()
print(itt.groupby("variant").size(), "\\n", comp.groupby("variant").size())`,
        },
      },
      {
        phase: "eda",
        title: "Balance and base rates",
        goal: "Randomisation validation and the raw outcome picture.",
        instructions: [
          "Balance table: pre-sessions/revenue means by arm with CIs or standardised differences; platform/region crosstabs.",
          "Raw outcomes: purchase rate and revenue per user by arm with simple CIs.",
          "Weekly purchase rate by arm — the novelty-effect check.",
        ],
        hints: [
          "Standardised differences (mean diff / pooled SD) under 0.1 is the conventional balance bar.",
          "Raw outcome table is the read-out's honest starting point — CUPED refines it, never replaces it.",
          "Weekly curves: a week-1-only lift is a novelty suspect; a steady lift is durable.",
        ],
        checkpoint: "Balance table passed, raw effects computed, weekly stability checked.",
        code: {
          label: "Balance and raw effects",
          language: "python",
          source: `bal = comp.groupby("variant").agg(
    n=("user_id", "count"),
    pre_sess=("pre_sessions_c", "mean"), pre_rev=("pre_period_revenue", "mean"),
    buy_rate=("purchase", "mean"), rev_user=("post_period_revenue", "mean"))
print(bal.round(4))

import numpy as np
for v in ["Treatment A", "Treatment B"]:
    g = comp[comp["variant"] == v]["purchase"]
    c = comp[comp["variant"] == "Control"]["purchase"]
    d = g.mean() - c.mean()
    se = np.sqrt(g.var()/len(g) + c.var()/len(c))
    print(f"{v}: +{d:.4f}  CI [{d-1.96*se:.4f}, {d+1.96*se:.4f}]")`,
        },
      },
      {
        phase: "statistics",
        title: "Effects with full machinery",
        goal: "Naive vs CUPED effects; heterogeneity with correction; Simpson's check.",
        instructions: [
          "CUPED: adjusted outcome = post metric − θ·(pre covariate − arm-mean pre); recompute effects and CIs.",
          "Heterogeneity: effects within platform and region; apply a multiple-comparison correction (e.g., Holm) to the interaction tests.",
          "Simpson's check: pooled effect vs within-platform effects — direction stable?",
        ],
        hints: [
          "θ = cov(post, pre) / var(pre) — the OLS slope; the adjustment is one line once θ is computed.",
          "CUPED headline: same point estimate (randomisation guarantees that in expectation), tighter CI — show the width reduction number.",
          "Holm correction on the interaction p-values keeps the heterogeneity honest; report corrected and raw.",
        ],
        checkpoint: "CUPED table with width reduction, corrected heterogeneity results, Simpson's verdict.",
        code: {
          label: "CUPED",
          language: "python",
          source: `import statsmodels.formula.api as smf

# theta from pooled pre/post relationship
theta = np.cov(comp["post_period_revenue"], comp["pre_sessions_c"])[0, 1] / \\
        comp["pre_sessions_c"].var()
comp["rev_cuped"] = comp["post_period_revenue"] - theta * (
    comp["pre_sessions_c"] - comp.groupby("variant")["pre_sessions_c"].transform("mean"))

m = smf.ols("rev_cuped ~ C(variant)", data=comp).fit()
print(m.summary().tables[1])

m2 = smf.ols("purchase ~ C(variant) * C(platform)", data=comp).fit()
print(m2.summary().tables[1])`,
        },
      },
      {
        phase: "visualisation",
        title: "The read-out exhibits",
        goal: "Balance plot, forest plot (naive/CUPED), platform interaction, distributions, weekly curves.",
        instructions: [
          "Five exhibits; the forest plot is the decision's face.",
          "Mark zero on the forest plot; label effects in both absolute and relative terms.",
          "Weekly curves annotated with the novelty-check verdict.",
        ],
        hints: [
          "Forest: two panels (purchase rate, revenue), each with naive and CUPED rows per treatment.",
          "Interaction bars: purchase rate by arm × platform — non-parallel profiles ARE the story.",
          "Revenue histogram: clip at p95 or use log1p for display; the zero mass is the honest feature.",
        ],
        checkpoint: "Five exhibits, forest plot presentation-ready.",
      },
      {
        phase: "interpretation",
        title: "The verdict, carefully worded",
        goal: "Effects, precision, heterogeneity and guardrails synthesised into ship/kill/iterate.",
        instructions: [
          "State each arm's verdict with its evidence chain (effect, CI, heterogeneity, guardrails).",
          "Quantify practical significance: orders gained per week at the base's scale.",
          "Name what the experiment could NOT see (novelty beyond 6 weeks, slow-feature interactions).",
        ],
        hints: [
          "Verdict format per arm: effect (points and relative), precision, who it works for, guardrail status → decision.",
          "Practical translation: 1pt on a 9.4% base = ~10% more orders — the number the room will quote.",
          "The unseen list is the monitoring plan's justification — every invisible risk becomes a monitored metric.",
        ],
        checkpoint: "A three-verdict table with evidence chains and the practical-translation sentence.",
      },
      {
        phase: "recommendations",
        title: "The decision memo",
        goal: "Ship/kill/iterate with rollout stages, thresholds and dates.",
        instructions: [
          "Write the decision memo: ship A (staged, thresholds), kill B, iterate plan pre-registered.",
          "Define rollback thresholds quantitatively (e.g., purchase rate −0.5pt for 3 days).",
          "Include the four-week monitoring plan with named metrics and owners.",
        ],
        hints: [
          "Staged rollout percentages with dwell times and gate criteria — dates and numbers, not 'gradually'.",
          "Rollback thresholds must be pre-agreed to survive the momentum of a shipped feature.",
          "The memo should be forwardable without the analyst present: every term defined, every number sourced.",
        ],
        checkpoint: "The decision memo with stages, thresholds, dates and owners.",
      },
      {
        phase: "report",
        title: "The experiment read-out",
        goal: "A methodologically bulletproof read-out that ends in a decision.",
        instructions: [
          "Follow the outline; integrity and validation sections come before any effect estimate.",
          "Forest plot and decision memo in the body; full model tables and the analysis-plan deviations (if any) in the appendix.",
          "Write for a sceptical reviewer: every methodological choice visible.",
        ],
        hints: [
          "The read-out's spine: integrity → validation → effects → heterogeneity → guardrails → decision. Never reorder it.",
          "Pre-registration comparisons (planned vs delivered analysis) in the appendix are the mark of a mature experimentation practice.",
          "End with dates: rollout start, gate reviews, monitoring end — a read-out without a calendar is a essay.",
        ],
        checkpoint: "The complete read-out, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the experimentation lead. Leadership wants a verdict on the checkout test that survives methodological review: integrity validated, effects estimated with CUPED precision, heterogeneity honestly corrected, and a decision memo with quantitative guardrails. The analysis plan is yours to write — before touching the data — and to follow.",
      deliverables: [
        "Pre-stated analysis plan (metrics, frames, covariates, decision skeleton)",
        "Integrity audit: SRM, duplicates, missingness by arm, outlier policy",
        "Randomisation validation table (balance with standardised differences)",
        "Effect estimates naive and CUPED with CIs; corrected heterogeneity analysis",
        "Decision memo: ship/kill/iterate with staged rollout and rollback thresholds",
      ],
      guardrails: [
        "No effect estimated before SRM and balance are reported",
        "Outcomes never imputed; exclusions by arm disclosed",
        "Multiplicity correction applied to heterogeneity tests",
        "Decision thresholds pre-registered and quantitative",
      ],
    },

    evaluationChecks: {
      correctness: [
        "SRM tested before effects; result reported",
        "CUPED theta computed correctly; adjustment per-arm-mean centred",
        "Heterogeneity tests corrected for multiplicity",
      ],
      "code-quality": [
        "Frames (ITT/completer) built once with N accounting",
        "Analysis plan documented; deviations noted",
      ],
      reasoning: [
        "Balance checks precede and justify effect estimation",
        "Practical significance quantified alongside statistical",
      ],
      visualization: [
        "Forest plot shows naive and CUPED intervals together",
        "Balance plot with reference thresholds (e.g., 0.1 SMD)",
      ],
      interpretation: [
        "Verdicts per arm with evidence chains",
        "Experiment limitations (novelty, window) stated",
      ],
      recommendations: [
        "Rollout stages and rollback thresholds quantitative",
        "Monitoring plan with metrics, windows and owners",
      ],
    },
  },
];
