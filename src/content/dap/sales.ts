/**
 * Sales analytics projects — SAL-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const SALES_PROJECTS: DapProject[] = [
  /* ================================================================ SAL-01 */
  {
    id: "sales-1",
    categoryId: "sales",
    difficulty: "beginner",
    code: "SAL-01",
    title: "Pipeline Health Check",
    subtitle: "Six hundred CRM deals, five reps' quarter, one honest scoreboard.",
    summary:
      "A first CRM analysis: clean deal records, measure win rates and pipeline value by rep, segment and source, and give the sales lead a true picture of what's working and what's stuck.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["CRM data cleaning", "Win-rate analysis", "Pipeline metrics", "Categorical exploration", "Findings memo"],

    businessBackground:
      "Brightpath Software sells a mid-market analytics platform. The sales director runs Monday pipeline reviews from the CRM's default dashboard, but nobody trusts it: deals linger in 'Open' for months, amounts are formatted inconsistently, and win rates swing wildly by whatever filter is applied. With the quarter closing, the director wants one honest scoreboard: win rate by rep, segment, product line and source; pipeline value and age; and where deals die.",
    problemStatement:
      "Produce a trustworthy pipeline review from raw CRM data: win rates and average deal size by rep, segment, product line and lead source; how long won vs lost deals take; and which pockets of the pipeline look healthy versus stalled — so the Monday review runs on facts instead of anecdotes.",
    businessObjectives: [
      "Compute win rate, average deal size and total pipeline value by rep, segment, product and source",
      "Measure sales-cycle length for won vs lost deals and identify stalled segments",
      "Quantify how much value sits in deals that have been open abnormally long",
      "Deliver a one-page scoreboard the sales director can use on Monday",
    ],
    datasetDescription:
      "About 700 CRM deal records spanning eleven months. Each row is a deal with created and close dates, status (Won/Lost/Open, in several casings), rep, region, segment, product line, amount (sometimes currency-formatted), source and activity count. Closed deals occasionally lack close dates — the export, like the CRM it came from, needs an analyst's care before it tells the truth.",
    dataDictionary: [
      { column: "deal_id", kind: "id", description: "Unique deal identifier", example: "41388" },
      { column: "created_date", kind: "date", description: "Deal creation date", example: "2025-03-14" },
      { column: "close_date", kind: "date", description: "Close date (blank while open; some closed deals missing it)", example: "2025-05-02" },
      { column: "status", kind: "categorical", description: "Won / Lost / Open (mixed casing)", example: "Won" },
      { column: "rep", kind: "categorical", description: "Sales representative", example: "S. Devi" },
      { column: "region", kind: "categorical", description: "AMER / EMEA / APAC", example: "EMEA" },
      { column: "segment", kind: "categorical", description: "SMB / Mid-Market / Enterprise", example: "Mid-Market" },
      { column: "product_line", kind: "categorical", description: "Product sold", example: "Analytics Suite" },
      { column: "amount", kind: "currency", description: "Deal value in USD (some '$1,234' strings)", example: "48200" },
      { column: "source", kind: "categorical", description: "Lead source (some missing)", example: "Outbound" },
      { column: "activities_count", kind: "integer", description: "Logged activities on the deal", example: "18" },
    ],
    initialQuestions: [
      "What is the overall win rate, and how does it vary by rep, segment, region and product line?",
      "Which lead sources produce the most deals, and which produce the most WON deals?",
      "How long do won deals take versus lost ones, and where is the pipeline aging badly?",
      "How much open pipeline value is real (fresh) versus stale (aging beyond a normal cycle)?",
      "Which rep or segment should the sales director look at first on Monday?",
    ],
    dataset: {
      name: "Brightpath CRM deals",
      filename: "sales-01-pipeline-deals.csv",
      description: "~700 CRM deals with status, rep, segment, amounts and dates.",
      rows: 700,
    },

    dataQuality: [
      { issue: "Mixed status casing", where: "status — 'won'/'Won'/'WON' variants", detection: "value_counts()", treatment: "str.title() to canonical Won/Lost/Open before computing any win rate." },
      { issue: "Currency-formatted amounts", where: "amount — '$48,200' strings (~7%)", detection: "dtype object; str.contains(r'\\$')", treatment: "Strip $ and commas, cast to float; amounts drive every value metric." },
      { issue: "Missing close dates on closed deals", where: "close_date blank on ~2% of Won/Lost", detection: "closed = df[df.status != 'Open']; closed['close_date'].isna().sum()", treatment: "Exclude from cycle-time metrics (keep in win-rate metrics); report the exclusion — never impute a close date." },
      { issue: "Duplicate deals", where: "~1% duplicated rows", detection: "duplicated('deal_id').sum()", treatment: "Drop; duplicates double-count pipeline value." },
      { issue: "Missing source", where: "source — ~2% of deals", detection: "isna().sum()", treatment: "Label 'Unknown'; include in totals but flag for CRM hygiene." },
      { issue: "Open deals with close dates", where: "logical inconsistency", detection: "(df.status=='Open') & df.close_date.notna()", treatment: "Investigate; treat as data-entry errors — either the status or the date is wrong; document your resolution." },
    ],
    cleaningPlan: [
      { action: "Canonicalise status; numericise amount; deduplicate on deal_id", rationale: "The three defects that silently corrupt every ratio and total." },
      { action: "Separate closed deals (Won/Lost) from open pipeline", rationale: "Win rate is a closed-deal metric; pipeline value is an open-deal metric — mixing them creates nonsense." },
      { action: "Derive cycle_days from created→close for closed deals with both dates", rationale: "Cycle metrics need complete date pairs; exclusions reported." },
      { action: "Derive pipeline age for open deals vs a defined staleness threshold", rationale: "Makes 'stale pipeline' a measurable definition instead of an opinion." },
    ],
    edaPlan: [
      { question: "Win rate by rep", method: "closed deals: groupby(rep) status == Won share, with deal counts", expectation: "Reps spread 22–36% win rate; watch small-N traps." },
      { question: "Win rate by segment and product", method: "groupby(segment) and groupby(product_line)", expectation: "Enterprise lower win rate but larger deals; Platform wins most often." },
      { question: "Source economics", method: "deal count, won count, win rate by source", expectation: "Inbound and Referral win best; Outbound generates volume." },
      { question: "Cycle times", method: "cycle_days describe by status; by segment", expectation: "Won deals cycle longer than lost (~+20 days); Enterprise longest." },
      { question: "Open pipeline age", method: "open deals: days since created vs threshold (e.g., 120d)", expectation: "~30% of open value is beyond the threshold — the stale pile." },
      { question: "Activity levels", method: "activities_count by status", expectation: "Won deals show higher median activity." },
    ],
    statisticsPlan: [
      { technique: "Descriptive win-rate table with confidence intervals (Wilson)", purpose: "Win rates on small N are noisy — CIs keep the Monday review honest", expectation: "Rep gaps shrink for several reps once CIs are shown." },
      { technique: "Deal-size comparison (won vs lost)", purpose: "Do bigger deals win less often?", expectation: "Won deals slightly larger on average in Mid-Market; no strong pattern overall." },
      { technique: "Staleness threshold sensitivity", purpose: "Test how much 'stale' depends on the chosen cut", expectation: "Stale share moves 25–38% for thresholds 90–150 days; pick 120 and justify." },
    ],
    visualisationPlan: [
      { chart: "Dot plot with CIs — win rate by rep", answers: "Who's actually winning?", reads: "Dots with interval bars; overlapping CIs mean 'too close to call'." },
      { chart: "Stacked bar — deals by source split Won/Lost/Open", answers: "Where do deals come from and die?", reads: "Bar height = volume; dark segment = won share." },
      { chart: "Histogram — cycle days by status (overlaid)", answers: "How long do deals take?", reads: "Won shifted right vs lost; annotate medians." },
      { chart: "Bar — open pipeline value by age bucket", answers: "How much pipeline is stale?", reads: "Value beyond the threshold line is the actionable pile." },
      { chart: "Heatmap — win rate by segment × product", answers: "Which pockets work?", reads: "Colour = win rate; annotate counts so small cells aren't over-read." },
    ],
    findings: [
      "Blended win rate is ~31% on closed deals; reps span 22–36%, but the Wilson intervals for half the reps overlap — the ranking is less settled than the dashboard suggests.",
      "Inbound and Referral deals win at ~38–40% against Outbound's ~26%; Outbound still sources the most volume, so pipeline quantity and quality currently pull in opposite directions.",
      "Won deals take ~20 days longer than lost ones — losses resolve early (often qualification-stage) while wins accumulate approvals; Enterprise cycles run longest.",
      "Roughly a third of open pipeline value (by a 120-day threshold) sits in deals older than any segment's median cycle — the stale pile is bigger than any single rep's open book.",
      "Won deals show ~40% more logged activity than lost deals, consistent with (not proof of) the coaching line that persistent multi-threading pays.",
    ],
    recommendations: [
      { what: "Run a pipeline-hygiene sweep: review every open deal older than 120 days this week — advance, discount, or close-lost", why: "A third of open value is stale by any reasonable threshold; stale deals distort forecasts.", impact: "Cleaner forecast; frees rep time from zombie deals", horizon: "immediate" },
      { what: "Shift Monday reviews to segment-level win rates and CIs, not raw rep rankings", why: "Rep differences are mostly within noise; segment and source differences are not.", impact: "Better coaching focus; fewer false alarms", horizon: "immediate" },
      { what: "Double down on Inbound and Referral generation; set an Outbound qualification bar", why: "They win at 1.5× Outbound's rate; Outbound volume is masking weaker qualification.", impact: "Structurally higher win rate at similar cost", horizon: "this quarter" },
      { what: "Require a close-reason field and close-date validation in the CRM", why: "Missing close dates and inconsistent statuses cost this analysis real records; the defect list is a CRM to-do list.", impact: "Better data, cheaper future analyses", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "The pipeline is healthier than the dashboard suggests but stale where it hurts. Blended win rate is ~31%; rep rankings are noisier than they look (half the gaps sit inside confidence intervals), while source and segment differences are real — Inbound and Referral win at ~1.5× Outbound's rate. Won deals take longer than lost ones, and roughly a third of open pipeline value is older than any median cycle. The Monday move: a hygiene sweep of aged deals, a review format built on segment win rates with intervals, and a qualification bar for Outbound volume. All figures computed after status, amount and duplicate cleanup — 11 records excluded from cycle metrics for missing close dates, as logged in the appendix.",
      structure: [
        "1. Objective and definitions (win rate, staleness threshold)",
        "2. Data and quality treatment",
        "3. Win rates: reps, segments, products, sources",
        "4. Cycle times and the stale pipeline pile",
        "5. The Monday scoreboard",
        "6. Recommendations (ranked)",
        "7. Appendix: cleaning log, exclusions, CRM hygiene to-dos",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the CRM export",
        goal: "Load, profile, and separate closed from open deals mentally.",
        instructions: [
          "Load the file; check shape, dtypes, nulls. Note the amount column's dtype — object dtype on money is the cleaning headline.",
          "Split closed (Won/Lost) from Open. Win rate, cycle time and pipeline value are three different metrics on different subsets — say which is which.",
          "Skim value_counts() on status, rep, segment, source, product_line to learn the vocabulary of this CRM.",
        ],
        hints: [
          "Every CRM analysis starts by splitting closed from open; confusing them produces the dashboard nobody trusts.",
          "df['status'].str.title() then value_counts() — the casing variants show up immediately.",
          "Ask: what does one row represent? (A deal, in whatever state it's in — not a stage transition.)",
        ],
        checkpoint: "Closed vs open counts, the dtype quirks found, and the categorical vocabulary listed.",
        code: {
          label: "Profile the pipeline",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("sales-01-pipeline-deals.csv", parse_dates=["created_date", "close_date"])
print(df.shape, "\\n", df.dtypes)
df["status"] = df["status"].str.title()
print(df["status"].value_counts())
closed = df[df["status"].isin(["Won", "Lost"])]
open_ = df[df["status"] == "Open"]`,
        },
      },
      {
        phase: "quality",
        title: "Audit deal records",
        goal: "Find every defect that corrupts ratios: casing, currency strings, duplicates, missing dates.",
        instructions: [
          "Check amount: how many rows are '$48,200'-style strings? Cast-test them.",
          "Count duplicates on deal_id; count closed deals missing close_date; check open deals that have close dates (logic violations).",
          "Assemble the defect table with counts and detection code.",
        ],
        hints: [
          "amount.str.contains(r'^\\$', na=False).sum() quantifies the formatted share in one line.",
          "A closed deal without a close date can't contribute to cycle-time analysis — but it can still count in win rate. Different metrics, different exclusions.",
          "Logic violations (Open + close_date) deserve investigation before deletion — which field do you believe and why?",
        ],
        checkpoint: "A defect table: six issues with counts, and your resolution policy for each.",
      },
      {
        phase: "cleaning",
        title: "Clean and derive",
        goal: "A canonical deal frame with numeric amounts and derived metrics.",
        instructions: [
          "Fix status casing; strip and numericise amount; drop duplicates; label missing sources 'Unknown'.",
          "Derive cycle_days (closed with both dates) and open_age_days (open deals, as of the data date).",
          "Log every action with its row count; keep excluded records in a quarantine frame, not /dev/null.",
        ],
        hints: [
          "pd.to_numeric(amount.astype(str).str.replace(r'[$,]', '', regex=True), errors='raise') — raise, not coerce: you want to KNOW if a format escapes you.",
          "open age needs an as-of date: use the max created_date or a stated export date; write it down.",
          "cycle_days = (close_date - created_date).dt.days; negative cycles are another logic check worth running.",
        ],
        checkpoint: "A clean frame with derived columns and a quarantine frame with a row-count ledger.",
        code: {
          label: "Canonical deals",
          language: "python",
          source: `clean = df.drop_duplicates("deal_id").copy()
clean["status"] = clean["status"].str.title()
clean["amount"] = pd.to_numeric(
    clean["amount"].astype(str).str.replace(r"[$,]", "", regex=True))
clean["source"] = clean["source"].fillna("Unknown")

closed = clean[clean["status"].isin(["Won", "Lost"])].copy()
closed["cycle_days"] = (closed["close_date"] - closed["created_date"]).dt.days
open_ = clean[clean["status"] == "Open"].copy()
AS_OF = clean["created_date"].max()
open_["age_days"] = (AS_OF - open_["created_date"]).dt.days`,
        },
      },
      {
        phase: "eda",
        title: "Compute the scoreboard",
        goal: "Win rates, cycle times, source economics, and the stale pile.",
        instructions: [
          "Win rate and average deal size by rep, segment, product line and source (closed deals only; keep counts beside rates).",
          "Cycle-time distribution by status and segment; open-deal age distribution against your staleness threshold.",
          "Write down the headline number from each table as you compute it.",
        ],
        hints: [
          "groupby + agg(['count','mean','sum']) with a win flag column keeps counts and rates together — rates without counts lie.",
          "win = (closed['status'] == 'Won').astype(int) as a column makes every later groupby trivial.",
          "The stale pile: open_[open_['age_days'] > 120]['amount'].sum() — but run 90/120/150 to see how much the threshold drives the story.",
        ],
        checkpoint: "You can quote: blended win rate, best/worst source, won-vs-lost cycle gap, stale pipeline value.",
        code: {
          label: "Scoreboard tables",
          language: "python",
          source: `closed["won"] = (closed["status"] == "Won").astype(int)
score = closed.groupby("rep").agg(
    deals=("deal_id", "count"), win_rate=("won", "mean"),
    avg_amount=("amount", "mean"))
print(score.sort_values("win_rate", ascending=False))

by_source = closed.groupby("source").agg(
    deals=("deal_id", "count"), win_rate=("won", "mean"))
print(by_source.sort_values("win_rate", ascending=False))

stale = open_[open_["age_days"] > 120]["amount"].sum()
print(f"stale open value: \${stale:,.0f} of \${open_['amount'].sum():,.0f}")`,
        },
      },
      {
        phase: "statistics",
        title: "Add intervals and sanity",
        goal: "Confidence intervals on win rates; sensitivity on the staleness threshold.",
        instructions: [
          "Compute Wilson intervals for each rep's win rate; note which rep gaps overlap.",
          "Compare won vs lost deal sizes (means and medians).",
          "Test staleness thresholds 90/120/150 days — how much does the stale share move?",
        ],
        hints: [
          "Wilson interval keeps small-N rates honest where the normal approximation misbehaves.",
          "statsmodels.stats.proportion.proportion_confint(wins, n, method='wilson') does it in one call.",
          "Threshold sensitivity is one groupby in a loop — the deliverable is the sentence 'the stale share is X–Y% across reasonable thresholds.'",
        ],
        checkpoint: "A rep table with intervals and a threshold-sensitivity sentence.",
        code: {
          label: "Wilson intervals",
          language: "python",
          source: `from statsmodels.stats.proportion import proportion_confint

for rep, g in closed.groupby("rep"):
    lo, hi = proportion_confint(g["won"].sum(), len(g), method="wilson")
    print(f"{rep}: {g['won'].mean():.1%}  CI [{lo:.1%}, {hi:.1%}]  n={len(g)}")`,
        },
      },
      {
        phase: "visualisation",
        title: "The Monday visuals",
        goal: "Five charts that make the review run itself.",
        instructions: [
          "Rep win-rate dot plot with CIs; source stacked bars; cycle histogram by status; open-value-by-age bars; segment × product heatmap.",
          "Sort every bar chart; annotate the stale threshold on the age chart.",
          "Title charts with takeaways ('Half the reps are within noise of each other').",
        ],
        hints: [
          "Dot plot with CI bars: plt.errorbar with xerr from your Wilson table; reps sorted by rate.",
          "Stacked bars by source: crosstab(source, status) with status columns Won/Lost on closed deals (or include Open separately and clearly).",
          "Heatmap cells annotated with 'rate (n)' so small cells can't masquerade as patterns.",
        ],
        checkpoint: "Five saved charts, each titled with its takeaway.",
        code: {
          label: "Dot plot with intervals",
          language: "python",
          source: `import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4))
rows = []
for rep, g in closed.groupby("rep"):
    lo, hi = proportion_confint(g["won"].sum(), len(g), method="wilson")
    rows.append((rep, g["won"].mean(), lo, hi, len(g)))
rows.sort(key=lambda r: r[1])
ax.errorbar([r[1] for r in rows], range(len(rows)),
            xerr=[[r[1]-r[2] for r in rows], [r[3]-r[1] for r in rows]],
            fmt="o", color="#0f766e", capsize=4)
ax.set_yticks(range(len(rows)), [f"{r[0]} (n={r[4]})" for r in rows])
ax.set_xlabel("Win rate (95% CI)")
fig.tight_layout(); fig.savefig("win_rates.png", dpi=150)`,
        },
      },
      {
        phase: "interpretation",
        title: "Read the scoreboard honestly",
        goal: "Findings with numbers, caveats and so-whats.",
        instructions: [
          "Answer all five initial questions with figures; attach a 'so what' to each.",
          "Flag what the data cannot show (deal quality, discounting, why deals die — no stage history here).",
          "Draft the Monday headline: the one paragraph the director repeats to the VP.",
        ],
        hints: [
          "Small-N honesty: 'Rep A leads Rep B 36% to 33% — both intervals span 8 points' is a finding, not a hedge.",
          "Correlation caveat on activity counts: more activity on won deals is consistent with good behaviour AND with winners simply lasting longer.",
          "The so-what test: if a finding changes nothing in Monday's meeting, it belongs in the appendix.",
        ],
        checkpoint: "Five answered questions, each with a number and a so-what.",
      },
      {
        phase: "recommendations",
        title: "Monday's action list",
        goal: "Ranked, specific, evidence-cited actions.",
        instructions: [
          "Write 3–4 recommendations ranked by expected impact; each cites its finding.",
          "Include the CRM hygiene item — the defect table is the requirement list.",
          "State the metric each action should move and by how much to count as success.",
        ],
        hints: [
          "Hygiene sweep, review-format change, source investment, CRM fixes — in that order of immediacy.",
          "Success metrics: stale value below a stated share; Outbound win rate up X points after a qualification bar.",
          "If the director can't delegate an action to a named role, it isn't ready.",
        ],
        checkpoint: "A ranked action table with evidence, owner-type, and success metric.",
      },
      {
        phase: "report",
        title: "The one-page scoreboard",
        goal: "A memo the director reads before Monday's review.",
        instructions: [
          "Structure: definitions → scoreboard tables (compact) → the stale pile → recommendations → hygiene appendix.",
          "State definitions up front (win rate = closed deals; stale = age > 120 days) — reviewers fight about definitions, not findings, when definitions are hidden.",
          "Include the rep dot plot as the body chart.",
        ],
        hints: [
          "One chart in the body, tables compact, appendix carries the cleaning log.",
          "Lead the scoreboard with segment/source, not reps — that's where the signal is.",
          "Write the definitions box BEFORE the findings so the numbers land on agreed ground.",
        ],
        checkpoint: "The scoreboard memo, every number traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the sales operations analyst. The sales director wants a trustworthy pipeline scoreboard for Monday: win rates that respect sample size, the true stale-pipeline value, and where to focus. The CRM export is yours; definitions and thresholds are yours to set and defend.",
      deliverables: [
        "Defect table and cleaning log for the CRM export",
        "Win-rate tables by rep, segment, product and source (with counts)",
        "Cycle-time comparison and stale-pipeline quantification with threshold sensitivity",
        "4–5 labelled charts including the rep dot plot with CIs",
        "One-page scoreboard memo with ranked, evidence-cited recommendations",
      ],
      guardrails: [
        "Win rates computed on closed deals only",
        "Rates reported with counts or intervals, never bare",
        "Exclusions (missing close dates) counted and disclosed",
        "Staleness threshold defined and sensitivity-tested",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Amounts numericised before any value metric",
        "Win rate denominator = closed deals, not all deals",
        "Cycle metrics exclude deals missing close dates, with the exclusion counted",
      ],
      "code-quality": [
        "Closed/open split written once and reused",
        "Cleaning log maintained inline",
      ],
      reasoning: [
        "Small-N win rates treated with intervals or counts",
        "Staleness threshold justified rather than assumed",
      ],
      visualization: [
        "Rep comparison shows uncertainty, not just point estimates",
        "Bar charts sorted; heatmap cells annotated with counts",
      ],
      interpretation: [
        "Won-vs-lost cycle gap explained (early losses vs accumulating approvals)",
        "Activity-count finding stated as association, not causation",
      ],
      recommendations: [
        "Hygiene sweep sized in dollars of stale pipeline",
        "Each action tied to a finding with a success metric",
      ],
    },
  },

  /* ================================================================ SAL-02 */
  {
    id: "sales-2",
    categoryId: "sales",
    difficulty: "intermediate",
    code: "SAL-02",
    title: "Win/Loss Driver Analysis",
    subtitle: "Two thousand deals: what separates the wins from the losses, and how much of it is controllable?",
    summary:
      "Driver analysis on closed deals: build win/loss features (discount, cycle, engagement, firmographics), test them singly and jointly, and quantify which factors the sales VP can actually influence.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Feature construction", "Bivariate driver analysis", "Logistic regression", "Effect interpretation", "Sales operations"],

    businessBackground:
      "Northgate Systems sells an integration platform into mid-market and enterprise accounts. Win rate has drifted from 34% to 29% over six quarters, and the newly arrived VP of Sales refuses to accept the folklore explanation ('the market got harder'). The VP wants the win/loss record interrogated properly: which factors — deal size, discount depth, sales-cycle length, engagement patterns, competitor presence, firmographics — associate with winning, and which of those are levers the team controls versus facts about the account.",
    problemStatement:
      "Identify and quantify the drivers of deal outcomes across ~2,200 closed deals: test each candidate driver individually, then jointly in a logistic model; separate controllable levers (discount, engagement, cycle) from account facts (size, industry, competitor); and recommend the two or three changes most likely to move win rate.",
    businessObjectives: [
      "Build an analysis-ready win/loss dataset with clean features and documented exclusions",
      "Quantify bivariate associations between each driver and win outcome",
      "Fit a logistic regression; interpret odds ratios with uncertainty",
      "Classify drivers: controllable levers vs account facts; identify interaction effects (e.g., discount × competitor)",
      "Deliver a prioritised intervention list with expected win-rate movement",
    ],
    datasetDescription:
      "~2,200 closed deals with outcome, timing, discounting, engagement markers, firmographics and competitor recorded per deal. Discount arrives in two encodings (fraction and percent-string), industry has gaps, cycle days contain extreme outliers, and duplicate rows exist. Each defect matters here because the headline output — which levers move win rate — must survive scrutiny from a sceptical VP.",
    dataDictionary: [
      { column: "deal_id", kind: "id", description: "Unique deal identifier", example: "52418" },
      { column: "created_quarter", kind: "categorical", description: "Quarter of creation (Q1–Q4 2024–25)", example: "Q2 2024" },
      { column: "close_date", kind: "date", description: "Close date", example: "2025-01-22" },
      { column: "status", kind: "categorical", description: "Won or Lost", example: "Won" },
      { column: "segment", kind: "categorical", description: "SMB / Mid-Market / Enterprise", example: "Mid-Market" },
      { column: "industry", kind: "categorical", description: "Buyer industry (some missing)", example: "Financial Services" },
      { column: "employees", kind: "integer", description: "Account employee count", example: "1800" },
      { column: "arr_band", kind: "categorical", description: "Deal size band (casing variants)", example: "50k-150k" },
      { column: "amount", kind: "currency", description: "Deal value in USD", example: "96500" },
      { column: "discount_pct", kind: "percent", description: "Discount granted (mixed fraction/percent encodings)", example: "18%" },
      { column: "cycle_days", kind: "integer", description: "Days from creation to close (outliers exist)", example: "64" },
      { column: "meetings", kind: "integer", description: "Meetings held on the deal", example: "9" },
      { column: "demo_given", kind: "boolean", description: "Whether a demo occurred", example: "1" },
      { column: "champion_change", kind: "boolean", description: "Economic buyer changed mid-cycle", example: "0" },
      { column: "competitor", kind: "categorical", description: "Primary competitive situation", example: "BestOfBreed Inc" },
      { column: "region", kind: "categorical", description: "AMER / EMEA / APAC", example: "EMEA" },
    ],
    initialQuestions: [
      "How do win rates differ across segment, industry, size band and competitor — the account facts?",
      "Do discount depth, cycle length, meeting count and demo presence associate with winning — the potential levers?",
      "Which associations survive when modelled jointly (logistic regression)?",
      "Does champion change disproportionately hurt long cycles? (Interaction check.)",
      "Which two or three levers should the VP pull first, and what win-rate movement is plausible?",
    ],
    dataset: {
      name: "Northgate win/loss records",
      filename: "sales-02-winloss-deals.csv",
      description: "~2,200 closed deals with drivers, firmographics and outcomes.",
      rows: 2200,
    },

    dataQuality: [
      { issue: "Mixed discount encodings", where: "discount_pct — 0.18 and '18%'", detection: "dtype object; value distribution bimodal near 0–1 vs 0–30", treatment: "Detect strings containing '%', strip and divide by 100; verify unimodal 0–0.4 range after normalisation." },
      { issue: "Missing industry", where: "industry — ~6% of deals", detection: "isna().sum()", treatment: "Category 'Unknown' for descriptive tables; for the logistic model either drop or impute with an explicit missing indicator." },
      { issue: "Cycle-day outliers", where: "cycle_days ~ 700+ on a few deals", detection: "describe() and box plot; compare against the CRM's plausible range", treatment: "Investigate: if true (procurement hell) keep but winsorise for the model; if entry error (negative, absurd) exclude with log." },
      { issue: "Duplicate deals", where: "~0.8% duplicated rows", detection: "duplicated('deal_id').sum()", treatment: "Drop; duplicates would double-weight their patterns in the model." },
      { issue: "ARR band casing", where: "arr_band — '50k-150k' vs '50K-150K'", detection: "value_counts()", treatment: "Canonical casing; bands should map cleanly to amount for a consistency check." },
      { issue: "Band vs amount consistency", where: "amount contradicting its arr_band", detection: "cross-check amount against band boundaries", treatment: "Rebuild band from amount (single source of truth) and report disagreement count." },
    ],
    cleaningPlan: [
      { action: "Normalise discount to a 0–1 fraction; rebuild arr_band from amount", rationale: "One encoding per fact; the model can't see mixed units as one variable." },
      { action: "Winsorise cycle_days at a documented percentile (e.g., 99th) after investigating extremes", rationale: "A handful of extreme cycles would otherwise dominate the coefficient." },
      { action: "Handle missing industry with 'Unknown' + explicit modelling choice", rationale: "Missingness is informative in CRM data — buyers who don't disclose industry behave differently; keep that visible." },
      { action: "Derive engagement features: meetings_per_cycle_week, demo flag, champion flag", rationale: "Raw counts conflate deal length with engagement intensity." },
      { action: "Deduplicate and log exclusions", rationale: "Model credibility starts with a defensible N." },
    ],
    edaPlan: [
      { question: "Outcome base rates", method: "win rate overall, by quarter, by region", expectation: "~31% overall; slight drift down over quarters — the VP's premise." },
      { question: "Account facts vs outcome", method: "win rate by segment, industry, employees quintile, competitor", expectation: "Enterprise and BestOfBreed-competitive deals win less; in-house builds win more." },
      { question: "Levers vs outcome", method: "win rate by discount quartile, cycle quartile, meetings quartile, demo given", expectation: "Discount shows inverted-U (some discount helps, deep discount smells desperation); meetings and demo strongly positive; long cycles negative." },
      { question: "Engagement intensity", method: "meetings per cycle week by outcome", expectation: "Won deals sustain higher meeting density, not just more meetings." },
      { question: "Champion change", method: "win rate with/without champion change, split by cycle length", expectation: "Champion change hurts everywhere, worst in long cycles." },
      { question: "Correlation among drivers", method: "correlation matrix on numeric features", expectation: "Amount and employees correlated; cycle and meetings mildly — multicollinearity check for the model." },
    ],
    statisticsPlan: [
      { technique: "Bivariate win-rate tables with chi-square / rank tests", purpose: "Establish each driver's raw association", expectation: "Six-plus significant raw associations; some will not survive the model." },
      { technique: "Logistic regression (won ~ levers + account facts)", purpose: "Joint estimation with controls", expectation: "Meetings density, demo, discount-quadratic and competitor presence significant; segment absorbs size effects." },
      { technique: "Odds-ratio interpretation with CIs", purpose: "Translate coefficients into sales-VP language", expectation: "e.g., demo given ≈ 2× odds; each extra meeting/week ≈ +15–20% odds." },
      { technique: "Interaction test (champion × cycle)", purpose: "Confirm the compound failure mode", expectation: "Significant negative interaction — champion change in long cycles is near-fatal." },
      { technique: "Model criticism: ROC/AUC, calibration, influential points", purpose: "Know what the model can and cannot support", expectation: "AUC ~0.72 — useful for diagnosis, not for deal-level prophecy." },
    ],
    visualisationPlan: [
      { chart: "Win rate by discount decile (line with band)", answers: "What does discount depth do?", reads: "Inverted-U: moderate discount best, deep discount worst." },
      { chart: "Win rate by meetings-per-week quartile, split by demo", answers: "Does engagement intensity win?", reads: "Rising bars within each demo group." },
      { chart: "Odds-ratio forest plot (logistic model)", answers: "What survives joint estimation?", reads: "Dots and CIs; variables crossing 1.0 are not significant." },
      { chart: "Interaction plot — win rate by champion change × cycle length", answers: "Where does champion change kill deals?", reads: "Diverging lines: long-cycle + champion-change is the disaster cell." },
      { chart: "Win-rate trend by quarter with deal-mix annotation", answers: "Is the decline real or mix?", reads: "Trend line with segment-mix shading." },
    ],
    findings: [
      "Engagement intensity is the strongest controllable driver: deals with a demo win ~2× as often, and each additional meeting per cycle week associates with ~15–20% higher odds after controls.",
      "Discount has an inverted-U relationship with winning: moderate discount (5–15%) outperforms both no discount and deep discount (>25%); deep-discount deals win barely more often than full-price losses.",
      "Champion change is the single deadliest event: win rate halves, and in deals that also run long cycles it approaches zero — a significant interaction, not two independent effects.",
      "Account facts matter but are not levers: Enterprise and BestOfBreed-competitive deals structurally win less; the VP should forecast them differently, not coach them identically.",
      "Part of the six-quarter win-rate drift is mix (more Enterprise and competitive deals in recent quarters); mix-adjusted, the drift shrinks by roughly half — real, but smaller than the folklore claims.",
    ],
    recommendations: [
      { what: "Enforce a demo-first qualification standard: no deal advances past stage 2 without a demo", why: "Demo presence doubles win odds; it's cheap, controllable and evenly applicable.", impact: "Largest single lever; plausibly +3–5pts win rate over two quarters", horizon: "immediate" },
      { what: "Introduce discount governance: approval gates above 15%, mandatory deal-desk review above 25%", why: "Deep discount associates with worse outcomes — it is a symptom of weak deals and a cause of weak economics.", impact: "Protects margin; may slightly raise win rate by killing doomed discounts", horizon: "this quarter" },
      { what: "Create a champion-change playbook: within 5 days, re-qualify budget/timeline or close-lost", why: "Champion change halves win odds and is near-fatal in long cycles; fast re-qualification cuts zombie time.", impact: "Shortens cycles; reallocates effort to winnable deals", horizon: "immediate" },
      { what: "Report win rate mix-adjusted by segment and competitor each quarter", why: "Half the perceived decline was mix; the dashboard hid it.", impact: "Forecast and coaching honesty", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Winning at Northgate is driven more by how deals are run than by what the deals are worth. Demo presence doubles the odds of winning; sustained meeting intensity adds 15–20% odds per meeting per cycle week; discount depth has an inverted-U relationship with success, with deep discounts performing no better than full-price losses. The deadliest event is a champion change in a long cycle — win odds collapse toward zero. Account facts (Enterprise segment, BestOfBreed competition) lower win rates but are forecasting inputs, not coaching targets. The six-quarter win-rate drift is half mix, half real; the intervention list — demo-first qualification, discount governance, and a champion-change playbook — targets the controllable half.",
      structure: [
        "1. The VP's question and scope",
        "2. Data, quality treatment and feature definitions",
        "3. Account facts vs outcome (descriptive)",
        "4. Levers vs outcome (bivariate)",
        "5. Joint model: logistic regression with odds ratios",
        "6. Interactions and the champion-change failure mode",
        "7. Mix adjustment of the win-rate trend",
        "8. Intervention list with expected movement",
        "9. Appendix: cleaning log, model table, diagnostics",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Frame the driver question",
        goal: "Load, audit dtypes, and organise drivers into account facts vs controllable levers.",
        instructions: [
          "Profile the data; note the discount_pct dtype problem immediately.",
          "Write the two-column driver map: account facts (segment, industry, employees, competitor, size) vs levers (discount, cycle, meetings, demo, champion change).",
          "State the modelling goal: joint association, not causal proof — randomisation is absent.",
        ],
        hints: [
          "The facts-vs-levers split IS the VP's decision framework: facts change forecasts, levers change behaviour.",
          "describe() on discount_pct shows the bimodal 0–1 vs 0–30 signature of mixed encodings.",
          "A win/loss model without this framing produces a ranked list the VP can't act on.",
        ],
        checkpoint: "A driver map table and the modelling-goal sentence.",
      },
      {
        phase: "quality",
        title: "Audit for modelling readiness",
        goal: "Every defect that would bias the model: encodings, outliers, missingness, duplicates.",
        instructions: [
          "Quantify the discount encoding mix; inspect cycle-day extremes; count missing industry and duplicates.",
          "Cross-check arr_band against amount — which will you trust and why?",
          "Decide treatment per defect and record it; models inherit your cleaning choices.",
        ],
        hints: [
          "Mixed encodings are a model-validity issue, not a cosmetic one: 18 and 0.18 are a 100× difference.",
          "Cycle outliers: check a few against created/close dates if available — the treatment differs for true-but-rare vs impossible.",
          "arr_band rebuilt from amount is defensible; the reverse bakes in someone else's errors.",
        ],
        checkpoint: "A defect table with treatments decided (not just found).",
      },
      {
        phase: "cleaning",
        title: "Build the modelling frame",
        goal: "Clean features, derived engagement metrics, documented exclusions.",
        instructions: [
          "Normalise discount to fraction; rebuild band; winsorise cycle at the 99th percentile (logged).",
          "Derive meetings_per_week = meetings / (cycle_days/7), demo flag, champion flag.",
          "Create the win outcome as 0/1; finalise exclusions and report the modelling N.",
        ],
        hints: [
          "Engagement intensity beats raw counts: 6 meetings in 30 days is intensity; 6 meetings in 150 days is neglect.",
          "df['discount_frac'] = np.where(str-like, parse/100, value) — then assert the range; assertions are your future self's thank-you note.",
          "Log the modelling N and keep a one-line demographic of what was excluded (deals, not people).",
        ],
        checkpoint: "A modelling frame with derived features and an exclusions ledger.",
        code: {
          label: "Feature build",
          language: "python",
          source: `clean = df.drop_duplicates("deal_id").copy()
raw = clean["discount_pct"]
is_str = raw.astype(str).str.contains("%", na=False)
clean["discount_frac"] = pd.to_numeric(
    raw.astype(str).str.replace("%", ""), errors="coerce") / 100
clean.loc[~is_str, "discount_frac"] = pd.to_numeric(raw)
assert clean["discount_frac"].between(0, 0.6).all()

clean["cycle_days_w"] = clean["cycle_days"].clip(
    upper=clean["cycle_days"].quantile(0.99))
clean["meetings_per_week"] = clean["meetings"] / (clean["cycle_days_w"] / 7).clip(lower=1)
clean["won"] = (clean["status"] == "Won").astype(int)`,
        },
      },
      {
        phase: "eda",
        title: "Bivariate scan",
        goal: "Every driver vs outcome, one at a time, with significance flags.",
        instructions: [
          "Win-rate tables for categorical drivers; quartile-bin tables for numeric drivers (discount, cycle, meetings intensity).",
          "Chi-square for categoricals, trend tests for binned numerics.",
          "Correlation matrix among drivers — note multicollinearity candidates before modelling.",
        ],
        hints: [
          "Quartile-binning numerics for EDA shows shape (e.g., the discount inverted-U) that a single correlation hides.",
          "pd.qcut(clean['discount_frac'], 4) then groupby win-rate reveals non-monotone patterns.",
          "Watch meetings vs cycle correlation — if strong, the joint model is where their separate stories get sorted.",
        ],
        checkpoint: "A bivariate table set with a significance column and the non-monotone patterns flagged.",
        code: {
          label: "Bivariate scan",
          language: "python",
          source: `clean["disc_q"] = pd.qcut(clean["discount_frac"], 4)
print(clean.groupby("disc_q", observed=True)["won"].agg(["mean", "count"]))

for col in ["segment", "industry", "competitor"]:
    print(f"\\n{col}:")
    print(clean.groupby(col)["won"].agg(["mean", "count"]).sort_values("mean"))

print(clean.groupby("demo_given")["won"].mean())`,
        },
      },
      {
        phase: "statistics",
        title: "The joint model",
        goal: "Logistic regression with controls, interactions and honest diagnostics.",
        instructions: [
          "Fit won ~ levers + account facts; use statsmodels Logit with robust errors.",
          "Interpret as odds ratios with CIs; test the champion × cycle interaction explicitly.",
          "Diagnose: AUC, calibration by decile, influential observations. Write the model's limits in one paragraph.",
        ],
        hints: [
          "Standardise continuous predictors (or report odds ratios per unit you choose) so effect sizes are comparable.",
          "Formula: smf.logit('won ~ meetings_per_week + demo_given + discount_frac + I(discount_frac**2) + champion_change + C(competitor) + C(segment) + employees_log', ...) — the quadratic captures the inverted-U.",
          "AUC 0.7–0.75 is diagnostic-grade, not predictive-grade — say so before the VP starts scoring live deals with it.",
        ],
        checkpoint: "A model table with odds ratios, the interaction result, and a diagnostics paragraph.",
        code: {
          label: "Logistic model",
          language: "python",
          source: `import statsmodels.formula.api as smf
import numpy as np

m = clean.copy()
m["employees_log"] = np.log1p(m["employees"])
model = smf.logit(
    "won ~ meetings_per_week + demo_given + discount_frac"
    " + I(discount_frac ** 2) + champion_change"
    " + C(competitor) + C(segment) + employees_log + cycle_days_w",
    data=m).fit()
params = pd.DataFrame({
    "odds_ratio": np.exp(model.params),
    "lo": np.exp(model.conf_int()[0]),
    "hi": np.exp(model.conf_int()[1]),
    "p": model.pvalues})
print(params.round(3))
print("AUC:"), print(model.pred_table())`,
        },
      },
      {
        phase: "visualisation",
        title: "The evidence visuals",
        goal: "Five charts: discount curve, engagement bars, forest plot, interaction, trend.",
        instructions: [
          "Discount inverted-U line with CI band; engagement quartile bars split by demo; odds-ratio forest plot; champion × cycle interaction lines; quarterly win-rate trend with mix annotation.",
          "Forest plot is the model's public face: log scale, reference line at 1.0.",
          "Annotate the disaster cell on the interaction chart with its win rate.",
        ],
        hints: [
          "np.exp(model.conf_int()) gives OR intervals directly; errorbar horizontal with xscale log.",
          "Interaction plot: two lines (champion change yes/no) over cycle-length bins, y = win rate.",
          "The discount curve should bin to ~10 points with CIs — enough to show the U without noise.",
        ],
        checkpoint: "Five charts with the forest plot ready for the VP's desk.",
      },
      {
        phase: "interpretation",
        title: "Levers, facts and limits",
        goal: "Translate the model into the VP's framework with honest confidence.",
        instructions: [
          "Split findings into levers (act on) and facts (forecast on); attach odds ratios and CIs.",
          "Quantify the mix component of the win-rate drift (re-weight recent quarters by old segment mix).",
          "State the model's limits: observational data, unmeasured confounders (deal quality!), no stage history.",
        ],
        hints: [
          "The confounder sentence matters most: sickly deals may CAUSE deep discounts, not the reverse — one-direction causal claims are not supported.",
          "Mix adjustment: recent win rate re-weighted by old-quarter segment shares — the delta is the 'real' drift.",
          "Levers table columns: lever, odds ratio, CI, controllable-by, expected direction.",
        ],
        checkpoint: "The levers/facts table, the mix-adjusted drift number, and the limitations paragraph.",
      },
      {
        phase: "recommendations",
        title: "The intervention list",
        goal: "Three to four interventions with expected movement and falsifiers.",
        instructions: [
          "Rank interventions by expected win-rate movement; each cites its model evidence.",
          "Include governance changes (discount gates) alongside behavioural ones (demo-first).",
          "Attach a measurement design: what proves each intervention worked or failed?",
        ],
        hints: [
          "Expected movement should be conservative and derived from the model (e.g., moving non-demo deals to demo parity at half strength).",
          "Discount governance is both a margin play and a signal play — present both effects.",
          "The falsifier discipline: 'if demo-first doesn't lift stage-3 conversion in one quarter, the lever hypothesis is wrong.'",
        ],
        checkpoint: "A ranked intervention table with expected movement and measurement design.",
      },
      {
        phase: "report",
        title: "The win/loss review",
        goal: "A VP-ready review: evidence-first, model-backed, honest about causation.",
        instructions: [
          "Follow the outline; open with the levers-vs-facts reframe.",
          "Body carries the forest plot and discount curve; full model table in the appendix.",
          "Close with the intervention list as the decision document.",
        ],
        hints: [
          "One sentence the VP should remember: 'How we run deals beats what the deals are worth.'",
          "The confounder paragraph builds credibility with a sceptical audience — don't bury it.",
          "Appendix: cleaning log, model diagnostics, mix-adjustment arithmetic.",
        ],
        checkpoint: "The complete win/loss review, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are sales operations. A sceptical new VP wants the win/loss record interrogated: which factors matter, which are controllable, and what to change. You own feature definitions, model structure and the honesty of every odds ratio.",
      deliverables: [
        "Defect table and feature build (including discount normalisation and cycle treatment)",
        "Bivariate driver scan with significance flags",
        "Logistic regression with odds-ratio forest plot and the champion×cycle interaction",
        "Mix adjustment of the win-rate drift",
        "Intervention list ranked with expected movement and measurement designs",
      ],
      guardrails: [
        "Observational nature of the data stated; no one-way causal claims",
        "Discount encoding conflict resolved and verified",
        "Outlier treatment documented and sensitivity-checked",
        "Model diagnostics reported (AUC, calibration)",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Discount unified to one scale before modelling (verified by range assertion)",
        "Odds ratios interpreted as odds, not probabilities",
        "Quadratic term used for the discount effect (or equivalent non-linearity handled)",
      ],
      "code-quality": [
        "Derived features built once, named clearly, reusable",
        "Model formula readable; exclusions ledger maintained",
      ],
      reasoning: [
        "Levers vs account facts distinction maintained throughout",
        "Confounding discussed for discount and engagement effects",
      ],
      visualization: [
        "Forest plot with log-scale reference line at OR=1",
        "Discount curve shows the inverted-U, not just endpoints",
      ],
      interpretation: [
        "Interaction explained in business language (champion change × long cycles)",
        "Mix-adjusted drift separated from behavioural drift",
      ],
      recommendations: [
        "Each intervention cites model evidence and an expected direction",
        "At least one governance recommendation with a threshold",
      ],
    },
  },

  /* ================================================================ SAL-03 */
  {
    id: "sales-3",
    categoryId: "sales",
    difficulty: "advanced",
    code: "SAL-03",
    title: "Territory Design & Quota Attainment Study",
    subtitle: "Three years of bookings, sixteen reps, five territories: is the deck stacked, and how would you restack it?",
    summary:
      "Rep-level productivity analytics: build the rep-year quota table, decompose attainment into territory mix vs rep skill, model booking drivers, and design a fairer territory and quota framework the CRO can adopt.",
    hours: 17,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Deduplicated dimension building", "Productivity metrics", "Attainment decomposition", "Regression with panel structure", "Organisation design recommendations"],

    businessBackground:
      "Kestrel Data Systems has 16 quota-carrying reps across five territories. Annual quota planning is political: attainment ranges from under 40% to over 130%, and the perennial argument is whether star reps have easy territories or easy territories make star reps. Three years of bookings, rep tenure data and territory assignments are now assembled. The CRO wants a quota plan built on evidence — productivity net of territory potential, fair attainment distributions, and a design that stops the annual blame game.",
    problemStatement:
      "Analyse three years of sales productivity: construct the rep-year attainment table correctly from bookings; separate territory opportunity (segment mix, region economics) from rep effectiveness (tenure, ramping); identify systematically over- and under-quota'd territories; and propose a territory and quota framework grounded in measured potential — with its assumptions and transition costs made explicit.",
    businessObjectives: [
      "Build a clean rep-year dimension with quotas, bookings and attainment",
      "Decompose attainment differences into territory mix vs rep factors",
      "Model booking drivers at the rep-year level with panel-aware uncertainty",
      "Diagnose the quota-setting process: which territories are systematically miscalibrated",
      "Design a revised territory/quota framework with transition implications",
    ],
    datasetDescription:
      "Three years of booking-level data (~12,000 bookings) with rep attributes (tenure, ramp status) and territory repeated on every row, plus a rep-year quota column that must be deduplicated to serve as a dimension. Amounts are inconsistently formatted, some quotas are missing, tenure contains impossible negatives, and duplicates exist — the mess a finance-and-CRM merge produces in the wild.",
    dataDictionary: [
      { column: "booking_id", kind: "id", description: "Unique booking identifier", example: "63412" },
      { column: "order_date", kind: "date", description: "Order date", example: "2024-03-18" },
      { column: "close_date", kind: "date", description: "Close date", example: "2024-03-21" },
      { column: "rep_id", kind: "id", description: "Sales rep identifier", example: "806" },
      { column: "rep_name", kind: "text", description: "Rep name", example: "S. Devi" },
      { column: "tenure_months", kind: "integer", description: "Rep tenure at booking (negatives are errors)", example: "38" },
      { column: "ramp_status", kind: "categorical", description: "Ramping or Full productivity", example: "Full" },
      { column: "territory", kind: "categorical", description: "Territory code (e.g., AMER-East)", example: "EMEA-North" },
      { column: "region", kind: "categorical", description: "Region derived from territory", example: "EMEA" },
      { column: "segment", kind: "categorical", description: "SMB / Mid-Market / Enterprise", example: "Enterprise" },
      { column: "product", kind: "categorical", description: "Product line", example: "Platform" },
      { column: "amount", kind: "currency", description: "Booking amount in USD (some formatted strings)", example: "64,500" },
      { column: "quota_year", kind: "integer", description: "Rep-year quota (repeated per booking; deduplicate to use)", example: "680000" },
      { column: "quota", kind: "currency", description: "Duplicate of quota_year (same deduplication caveat)", example: "680000" },
    ],
    initialQuestions: [
      "What is the true attainment distribution by rep-year, and how wide is it really once data errors are fixed?",
      "How much of attainment variation is territory (segment mix, region) versus rep (tenure, ramping)?",
      "Which territories are systematically over- or under-quota'd across all three years?",
      "What booking rate does a fully-ramped rep achieve per territory-segment, and does it differ by territory?",
      "What quota framework would equalise difficulty, and what transition cost does it imply?",
    ],
    dataset: {
      name: "Kestrel bookings & quotas",
      filename: "sales-03-territory-bookings.csv",
      description: "3 years of bookings with rep attributes and repeated rep-year quotas.",
      rows: 12000,
    },

    dataQuality: [
      { issue: "Quota repeated on every booking", where: "quota_year / quota — repeated per row, some missing", detection: "groupby(rep_id, year) quota nunique > 1 or NaN", treatment: "Deduplicate to a rep-year quota table; the 3% missing quotas need interpolation from the rep's other years (with growth assumption stated) or exclusion — decide and document." },
      { issue: "Formatted amount strings", where: "amount — '64,500' strings (~6%)", detection: "dtype object; contains(',')", treatment: "Strip commas, cast numeric; verify no losses (errors='raise')." },
      { issue: "Negative tenure", where: "tenure_months < 0", detection: "(df['tenure_months'] < 0).sum()", treatment: "Impossible: derive tenure from hire dates if available, else set NaN and exclude from tenure analyses; log." },
      { issue: "Duplicate bookings", where: "~0.5% duplicated rows", detection: "duplicated('booking_id').sum()", treatment: "Drop; bookings feed quota attainment, so duplicates become phantom revenue." },
      { issue: "Quota vs ramp inconsistency", where: "Ramping reps with full quotas", detection: "cross-tab ramp_status × quota level by year", treatment: "Business-logic check: ramping reps should carry prorated quotas; document discrepancies rather than silently 'fixing'." },
      { issue: "Territory changes mid-year", where: "A rep appearing in two territories in one year", detection: "groupby(rep_id, year) territory nunique", treatment: "Real-world mess: assign bookings to the territory active at booking; flag split-year rep-years for special handling." },
    ],
    cleaningPlan: [
      { action: "Deduplicate bookings; numericise amounts", rationale: "Phantom revenue and string money are the two fundamentals." },
      { action: "Build the rep-year quota dimension (dedupe; interpolate missing with stated assumptions)", rationale: "Attainment = bookings / quota needs a trustworthy denominator table, not repeated columns." },
      { action: "Repair/exclude negative tenure; flag ramping-quota inconsistencies", rationale: "Tenure drives the ramp story; inconsistencies must be visible, not smoothed." },
      { action: "Construct rep-year facts: bookings, booking count, weighted segment mix, unique products", rationale: "The analysis grain is rep-year; facts should live at that grain." },
      { action: "Handle split-year reps explicitly (partial-year or dual-territory rows)", rationale: "Silent averaging would misattribute productivity across territories." },
    ],
    edaPlan: [
      { question: "Attainment distribution", method: "rep-year bookings/quota histogram; stats by year", expectation: "Median ~95%, spread 40–130%; wider than quota plans assume." },
      { question: "Territory productivity", method: "median bookings per fully-ramped rep by territory", expectation: "EMEA-North and AMER-West outproduce; APAC trails structurally." },
      { question: "Segment mix by territory", method: "segment share of bookings by territory", expectation: "High-attainment territories carry more Enterprise mix — the loaded-deck suspect." },
      { question: "Ramp curves", method: "bookings by tenure bucket, normalized", expectation: "Productivity rises steeply to month ~9, plateaus after ~18." },
      { question: "Quota fairness over time", method: "attainment by territory across three years (consistency)", expectation: "Two territories sit persistently under 80% median — systematically over-quota'd." },
      { question: "Product mix effects", method: "product share and revenue per product by territory", expectation: "Platform-heavy books outperform Automation-heavy in bookings per rep." },
    ],
    statisticsPlan: [
      { technique: "Attainment decomposition (territory mix standardisation)", purpose: "How much attainment gap is segment mix vs rep?", expectation: "Territory mix explains ~a third of the attainment spread." },
      { technique: "Rep-year regression: log(bookings) ~ tenure, ramp, segment mix, territory FE", purpose: "Estimate productivity net of territory with controls", expectation: "Territory effects shrink but persist; tenure elasticity strongest in year 1." },
      { technique: "Cluster-robust errors by rep", purpose: "Three years of one rep are not independent", expectation: "CIs widen — some territory effects lose significance, honestly." },
      { technique: "Potential-based quota modelling (territory capacity model)", purpose: "Set quotas from measured potential, not history", expectation: "Proposed quotas shift ±10–18% vs current for the two miscalibrated territories." },
      { technique: "Transition simulation", purpose: "Cost of moving to fairer quotas (attainment volatility)", expectation: "One-time attainment swing for 4–5 reps; smoothing mitigates." },
    ],
    visualisationPlan: [
      { chart: "Attainment distribution by year (ridgeline or violin)", answers: "How wide is attainment really?", reads: "Spread and medians by year; flag the sub-60% tail." },
      { chart: "Scatter — bookings per rep vs Enterprise share, by territory (colour)", answers: "Is the deck stacked?", reads: "Territory clusters; APAC low-low, EMEA-North high-high." },
      { chart: "Ramp curve — bookings by tenure month (smoothed)", answers: "How long to productivity?", reads: "Steep rise to month ~9; plateau after 18 — the ramp quota shape." },
      { chart: "Coefficient/territory-effect plot with clustered CIs", answers: "Which territory effects survive?", reads: "Dots ± CI; the honest significance picture." },
      { chart: "Paired bars — current vs proposed quota by territory", answers: "What changes under the framework?", reads: "Paired bars with % shift labels; the two miscalibrated territories move most." },
    ],
    findings: [
      "True attainment spread is wide (roughly 40–135%) and persists across years; the quota process is not self-correcting.",
      "About a third of the attainment spread is territory segment mix: Enterprise-heavy territories (EMEA-North, AMER-West) outproduce on equal rep quality — the deck is genuinely stacked.",
      "Ramp economics are steep: median bookings per rep roughly double from month 3 to month 12 and plateau after ~18 months; current quotas under-weight the ramp year and over-weight the plateau.",
      "APAC is structurally under-potential relative to its quota — three consecutive years of sub-80% median attainment with no segment-mix excuse — while AMER-East is over-quota'd despite mid-tier mix.",
      "A potential-based quota model (segment mix, measured productivity, ramp shape) shifts quotas by −15% to +12% across territories and would compress the attainment spread materially; the transition costs 4–5 reps a one-time attainment swing.",
    ],
    recommendations: [
      { what: "Adopt potential-based quotas with a 3-year glide path (cap annual quota movement at ±8%)", why: "Fairness without whiplash; the evidence says current quotas embed a structural advantage and the fix needs transition management.", impact: "Compressed attainment spread; depoliticised planning", horizon: "longer term" },
      { what: "Rebalance territory segment mix: rotate a share of Enterprise accounts from EMEA-North and AMER-West toward APAC and AMER-East", why: "Mix, not talent, drives a third of the spread; account rotation is the direct lever.", impact: "Structurally fairer territories; the biggest single lever", horizon: "this quarter" },
      { what: "Re-shape ramp quotas to the measured ramp curve (lower months 1–9, higher plateau)", why: "The curve says productivity doubles through year one; current ramp quotas are flat and punish new hires.", impact: "Faster ramp retention; honest early attainment", horizon: "this quarter" },
      { what: "Publish the potential model and its inputs annually before quota setting", why: "The blame game persists because the process is opaque; transparency converts argument to arithmetic.", impact: "Process credibility; better input quality over time", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "Three years of bookings settle a third of the argument: territory mix — not rep talent — explains roughly a third of the attainment spread, with Enterprise-heavy territories structurally outproducing. Ramp economics are steep and mispriced in current quotas. Two territories are systematically miscalibrated (APAC over-quota'd on under-potential, AMER-East over-quota'd despite mid mix), and the spread persists because nothing in the current process corrects it. The proposed framework sets quotas from measured potential with a capped glide path, rotates Enterprise mix toward under-weighted territories, and re-shapes ramp quotas to the measured curve. Transition costs are one-time and concentrated in 4–5 reps; the alternative is another year of arguing with the deck still stacked.",
      structure: [
        "1. The CRO's question and scope",
        "2. Data construction: booking facts and the rep-year quota dimension",
        "3. The attainment distribution, honestly measured",
        "4. Decomposition: territory mix vs rep factors",
        "5. Ramp economics and the tenure curve",
        "6. Territory effects under cluster-robust modelling",
        "7. The potential-based quota framework and transition plan",
        "8. Appendix: cleaning log, model tables, glide-path arithmetic",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Design the analysis grain",
        goal: "Bookings are facts; rep-year is the dimension; territory-year is the policy unit.",
        instructions: [
          "Map the grain hierarchy: bookings → rep-year → territory-year. Every table you build lives at one of these levels; decide before you merge anything.",
          "Identify the trap: quota lives on every booking row but is a rep-year attribute — dedupe or distort.",
          "Note territory semantics: assignments can change mid-year; check before treating territory as static per rep.",
        ],
        hints: [
          "A repeated attribute on a fact table is a dimension waiting to be deduplicated — groupby(rep_id, year) with first/unique validation.",
          "The policy question ('fair quotas') needs territory-year tables; the productivity question needs rep-year; keep both frames.",
          "df.groupby(['rep_id','year'])['territory'].nunique() > 1 finds the split-year reps now, before they corrupt averages.",
        ],
        checkpoint: "A grain map and the split-year rep list.",
        code: {
          label: "Grain checks",
          language: "python",
          source: `df = pd.read_csv("sales-03-territory-bookings.csv", parse_dates=["order_date"])
df["year"] = df["order_date"].dt.year
splits = df.groupby(["rep_id", "year"])["territory"].nunique()
print("split-year rep-years:", (splits > 1).sum())
quota_check = df.groupby(["rep_id", "year"])["quota"].nunique(dropna=False)
print("inconsistent quotas:", (quota_check > 1).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the fact-dimension mess",
        goal: "Quantify every merge artifact before building dimensions.",
        instructions: [
          "Amount format check; duplicates; negative tenure; missing quotas per rep-year.",
          "Ramping-quota consistency: are ramping reps carrying full quotas?",
          "Write the audit as if the CRO's chief of staff will read it — every number counts.",
        ],
        hints: [
          "Formatted amounts: amount.astype(str).str.contains(',').sum() then strip-cast-verify.",
          "Missing quota interpolation policy: prefer the rep's adjacent-year quota grown by the company rate — stated, not hidden.",
          "Ramping with full quota is a governance finding, not a data defect — report it separately.",
        ],
        checkpoint: "An audit table separating data defects from governance findings.",
      },
      {
        phase: "cleaning",
        title: "Build dimensions and facts",
        goal: "Clean booking facts + a rep-year quota dimension + a rep-year fact table.",
        instructions: [
          "Deduplicate bookings; numericise amounts; resolve tenure; assign split-year handling.",
          "Build quota_dim (rep_id, year, quota, ramp_status) and validate uniqueness.",
          "Build rep-year facts: total bookings, booking count, Enterprise share, products sold; join quota; compute attainment.",
        ],
        hints: [
          "Dimension validation: quota_dim.set_index(['rep_id','year']).index.is_unique must be True before any join.",
          "rep_facts = df.groupby(['rep_id','year']).agg(...) then quota_dim.merge(rep_facts, ...) — facts and dimensions join at their grain, never by row count.",
          "attainment = bookings / quota where quota present; keep NaN attainments visible (missing-quota rep-years) rather than zero-filling.",
        ],
        checkpoint: "A validated quota dimension and rep-year fact table with attainment.",
        code: {
          label: "Dimensions and facts",
          language: "python",
          source: `clean = df.drop_duplicates("booking_id").copy()
clean["amount"] = pd.to_numeric(
    clean["amount"].astype(str).str.replace(",", ""), errors="raise")

quota_dim = (clean.dropna(subset=["quota"])
    .groupby(["rep_id", "year"])
    .agg(quota=("quota", "first"), ramp=("ramp_status", "first"))
    .reset_index())
assert not quota_dim.duplicated(["rep_id", "year"]).any()

facts = clean.groupby(["rep_id", "year"]).agg(
    bookings=("amount", "sum"), deals=("booking_id", "count"),
    ent_share=("segment", lambda s: (s == "Enterprise").mean()),
    territory=("territory", "first")).reset_index()
rep_year = quota_dim.merge(facts, on=["rep_id", "year"], how="left")
rep_year["attainment"] = rep_year["bookings"] / rep_year["quota"]`,
        },
      },
      {
        phase: "eda",
        title: "The attainment picture",
        goal: "Distribution, territory patterns, ramp curve, and the stacked-deck first look.",
        instructions: [
          "Attainment distribution by year; median and spread per territory per year.",
          "Bookings per fully-ramped rep by territory; segment mix by territory.",
          "Ramp curve: bookings by tenure bucket for early-tenure reps.",
        ],
        hints: [
          "Attainment histograms per year reveal whether the spread is stable or drifting.",
          "The stacked-deck first look is a scatter: x = Enterprise share, y = bookings per rep, colour = territory.",
          "Ramp curve needs a tenure axis at booking level (not rep-year) — use the clean bookings frame with tenure_months.",
        ],
        checkpoint: "Attainment stats by territory, the mix-productivity scatter, and a ramp curve.",
        code: {
          label: "Territory attainment",
          language: "python",
          source: `full = rep_year[rep_year["ramp"] == "Full"]
terr = full.groupby(["territory", "year"])["attainment"].agg(
    ["median", "count", "mean"]).round(2)
print(terr)

ramp = clean[clean["tenure_months"].between(0, 30)]
ramp_curve = ramp.groupby(pd.cut(ramp["tenure_months"], [0, 3, 6, 9, 12, 18, 24, 30]))["amount"].sum() \\
    / ramp.groupby(pd.cut(ramp["tenure_months"], [0, 3, 6, 9, 12, 18, 24, 30]))["rep_id"].nunique()
print(ramp_curve)`,
        },
      },
      {
        phase: "statistics",
        title: "Decompose and model",
        goal: "Mix standardisation, rep-year regression with territory effects, cluster-robust.",
        instructions: [
          "Standardise: re-weight each territory's attainment to the company-wide segment mix — how much spread survives?",
          "Regress log(bookings) on tenure, ramp, ent_share with territory dummies; cluster by rep.",
          "Which territory effects survive clustering? Rank territories by effect with CIs.",
        ],
        hints: [
          "Standardisation: for each territory, Σ_segment (company_segment_share × territory_segment_productivity) — compare to raw.",
          "The regression gives you territory effects 'net of' ramp and mix — exactly the policy quantity.",
          "cov_type='cluster', cov_kwds={'groups': rep_id} — three years of one rep violate independence; pretending otherwise fabricates precision.",
        ],
        checkpoint: "A mix-adjusted spread number and a territory-effect ranking with CIs.",
        code: {
          label: "Territory effects model",
          language: "python",
          source: `import statsmodels.formula.api as smf
import numpy as np

m = rep_year.dropna(subset=["bookings"]).copy()
m["log_bookings"] = np.log(m["bookings"])
model = smf.ols(
    "log_bookings ~ tenure_months_c + C(ramp) + ent_share + C(territory)",
    data=m.assign(tenure_months_c=m["tenure_months"] - m["tenure_months"].mean())
).fit(cov_type="cluster", cov_kwds={"groups": m["rep_id"]})
effects = model.params.filter(like="C(territory)")
ci = model.conf_int().filter(like="C(territory)")
print(pd.DataFrame({"effect": effects, "lo": ci[0], "hi": ci[1]}))`,
        },
      },
      {
        phase: "visualisation",
        title: "The CRO exhibit set",
        goal: "Five figures: attainment spread, stacked-deck scatter, ramp curve, territory effects, quota proposal.",
        instructions: [
          "Violin/ridgeline of attainment by year; mix-productivity scatter; ramp curve; territory-effect forest; current-vs-proposed quota bars.",
          "The scatter and the forest plot are the credibility pair — polish them most.",
          "Annotate the two miscalibrated territories wherever they appear.",
        ],
        hints: [
          "sns.violinplot(x='year', y='attainment', data=rep_year) shows spread evolution in one figure.",
          "Forest plot on territory effects with 0-line; label significant vs not.",
          "Paired quota bars with % labels make the transition plan discussable in one glance.",
        ],
        checkpoint: "Five exhibits, each tied to a numbered finding.",
      },
      {
        phase: "interpretation",
        title: "Settle the argument in numbers",
        goal: "How much is the deck, how much is the dealer — and what follows.",
        instructions: [
          "State the decomposition: X pts of spread from mix, Y from rep factors, with uncertainty.",
          "Translate territory effects into quota implications (potential-based quotas).",
          "Name the transition costs and who bears them — this is an organisation-design report, not just analytics.",
        ],
        hints: [
          "The CRO's question is causal ('do stars have easy territories?') — answer with 'we can bound it': mix explains a third; residual rep effects carry the rest with wide CIs.",
          "Potential-based quota: territory productivity × segment mix × ramp-adjusted headcount — show the arithmetic for one territory fully, then summarise.",
          "Transition fairness: cap movement, glide path, and re-baseline targets in the change year.",
        ],
        checkpoint: "The decomposition statement, the quota arithmetic for one territory, and the transition-cost list.",
      },
      {
        phase: "recommendations",
        title: "The framework proposal",
        goal: "A quota and territory framework the CRO can take to the board.",
        instructions: [
          "Propose the framework (potential-based, capped glide path, ramp-shaped quotas) with its evidence chain.",
          "Include the account-rotation plan and its expected effect on the spread.",
          "Define annual process: model published before planning; inputs owned by sales ops.",
        ],
        hints: [
          "Frame as 'fairness with a glide path' — pure re-quota'ing invites revolt; capped transitions invite negotiation.",
          "The rotation plan should name territories, account counts, and a phased schedule — concrete beats conceptual.",
          "Process recommendation: the model becomes an annual artefact with named owners and published inputs.",
        ],
        checkpoint: "The framework proposal with glide path, rotation plan, and process ownership.",
      },
      {
        phase: "report",
        title: "The quota & territory evidence pack",
        goal: "A CRO-ready pack that ends the annual blame game with arithmetic.",
        instructions: [
          "Follow the outline; open with the decomposition because it reframes the argument.",
          "Body: attainment distribution, decomposition, ramp economics, framework; appendix: models, cleaning log, glide-path arithmetic.",
          "Write the one-sentence version first: 'A third of the attainment spread is territory mix, not talent — here is the framework that fixes both.'",
        ],
        hints: [
          "This audience will stress-test every number — traceability (fact tables in appendix) is the pack's armour.",
          "The glide path table (current → year3 quotas per territory) is the single most-discussed exhibit; make it exact.",
          "Close with the process change: models published annually, inputs owned, argument retired.",
        ],
        checkpoint: "The complete evidence pack, reproducible from the bookings CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the CRO's analyst. Settle the territory argument with evidence: how much attainment spread is territory mix vs rep effectiveness, which territories are miscalibrated, and what quota framework the company should adopt. You own the dimension design, the decomposition method and the transition plan.",
      deliverables: [
        "Booking fact table and rep-year quota dimension (validated, with interpolation policy)",
        "Attainment distribution and territory consistency analysis across three years",
        "Mix standardisation and rep-year regression with cluster-robust territory effects",
        "Ramp curve measurement and its quota implications",
        "Potential-based quota framework with glide path, rotation plan and process ownership",
      ],
      guardrails: [
        "Quotas deduplicated to a dimension before any attainment math",
        "Split-year reps handled explicitly, not averaged away",
        "Cluster-robust uncertainty on all rep-level inference",
        "Transition costs quantified and attributed",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Quota dimension deduplicated and validated unique on (rep, year)",
        "Attainment computed on matched-grain facts and dimensions",
        "Split-year rep-years excluded or handled, not silently averaged",
      ],
      "code-quality": [
        "Fact and dimension tables separated at their grains",
        "Interpolation of missing quotas documented with growth assumption",
      ],
      reasoning: [
        "Mix vs rep decomposition attempted with standardisation",
        "Cluster dependence (rep across years) respected in inference",
      ],
      visualization: [
        "Attainment spread shown with distributions, not just means",
        "Territory effects displayed with CIs and a zero reference",
      ],
      interpretation: [
        "Causal humility: mix explains part of spread; residual claims bounded",
        "Ramp curve translated into quota shape explicitly",
      ],
      recommendations: [
        "Framework includes transition management (caps, glide path)",
        "Rotation plan names territories and account counts",
      ],
    },
  },
];
