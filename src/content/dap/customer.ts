/**
 * Customer analytics projects — CUS-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const CUSTOMER_PROJECTS: DapProject[] = [
  /* ================================================================ CUS-01 */
  {
    id: "customer-1",
    categoryId: "customer",
    difficulty: "beginner",
    code: "CUS-01",
    title: "Churn Signals Snapshot",
    subtitle: "Six thousand subscriptions: who churns, when, and what they were paying.",
    summary:
      "A first churn analysis: clean a subscription snapshot, measure churn rate by plan, tenure and payment profile, and identify the segments the retention team should call first.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Subscription metrics", "Churn rates by segment", "Survival intuition (basic)", "Bar charts", "Retention brief"],

    businessBackground:
      "CloudLedger sells bookkeeping software by monthly subscription across four plans. The customer success team feels churn creeping up but has only anecdotes: 'small businesses leave after three months', 'annual contracts never churn'. Leadership wants a snapshot of truth: churn rate by plan, tenure, payment method and support history, and a ranked list of segments for the next retention campaign.",
    problemStatement:
      "Quantify churn from a customer snapshot: overall and segment-level churn rates (plan, tenure, payment method, support tickets, auto-renew), the tenure windows where churn concentrates, and which segments combine high churn with high fees — so the retention team's next campaign targets evidence, not anecdotes.",
    businessObjectives: [
      "Compute overall churn rate and churn by plan, tenure band and payment method",
      "Identify the tenure months where churn concentrates",
      "Quantify the interaction of support tickets with churn",
      "Rank segments by revenue at risk (churn rate × monthly fees)",
      "Deliver a two-page retention brief with a target list",
    ],
    datasetDescription:
      "A subscription snapshot (~6,000 customers): each row a customer with signup date, plan, monthly fee, contract length, payment method, support tickets, tenure, usage, auto-renew flag and a churn flag. The churn column arrives in four encodings ('Yes'/'TRUE'/'yes'...), some tenures are negative, some usage hours are missing, and duplicate customers exist — the snapshot needs standardising before any rate is trustworthy.",
    dataDictionary: [
      { column: "customer_id", kind: "id", description: "Unique customer identifier", example: "1482" },
      { column: "signup_date", kind: "date", description: "Subscription start date", example: "2023-08-14" },
      { column: "plan", kind: "categorical", description: "Basic / Standard / Pro / Enterprise (casing variants)", example: "Standard" },
      { column: "monthly_fee", kind: "currency", description: "Current monthly fee in USD", example: "79.00" },
      { column: "contract_months", kind: "integer", description: "Contract length (1, 12 or 24 months)", example: "12" },
      { column: "payment_method", kind: "categorical", description: "Card / Direct Debit / Invoice / PayPal", example: "Card" },
      { column: "support_tickets", kind: "integer", description: "Support tickets in the last 6 months", example: "3" },
      { column: "tenure_months", kind: "integer", description: "Months since signup (negatives are errors)", example: "17" },
      { column: "usage_hours_month", kind: "decimal", description: "Average monthly platform usage in hours (some missing)", example: "24.6" },
      { column: "auto_renew", kind: "boolean", description: "Auto-renew enabled (0/1)", example: "1" },
      { column: "churned", kind: "categorical", description: "Churn flag (four encodings mixed)", example: "TRUE" },
    ],
    initialQuestions: [
      "What is the overall churn rate, and how does it differ by plan and contract length?",
      "At which tenure bands does churn concentrate?",
      "Do payment method, auto-renew and support tickets relate to churn?",
      "Does low usage precede churn — what's the usage gap between churners and stayers?",
      "Which segments hold the most monthly recurring revenue at risk?",
    ],
    dataset: {
      name: "CloudLedger subscriptions",
      filename: "customer-01-churn-snapshot.csv",
      description: "Snapshot of ~6,000 subscription customers with churn flags and behavioural fields.",
      rows: 6000,
    },

    dataQuality: [
      { issue: "Four churn encodings", where: "churned — 'Yes'/'TRUE'/'True'/'yes'/'1'…", detection: "value_counts(dropna=False)", treatment: "Map all variants to a single boolean; this column IS the analysis — any unmapped value must be counted, not coerced silently." },
      { issue: "Plan casing variants", where: "plan — 'STANDARD' vs 'Standard'", detection: "value_counts()", treatment: "title-case to canonical plans before segmenting." },
      { issue: "Negative tenure", where: "tenure_months < 0", detection: "(df['tenure_months'] < 0).sum()", treatment: "Impossible: exclude from tenure analyses with count reported; cross-check signup_date vs snapshot date if available." },
      { issue: "Missing usage hours", where: "usage_hours_month — ~3%", detection: "isna().sum()", treatment: "Keep rows, exclude from usage comparisons; usage-missing may itself be informative (inactive accounts) — note it." },
      { issue: "Duplicate customers", where: "~1% duplicated rows", detection: "duplicated('customer_id').sum()", treatment: "Drop; duplicates double-count both customers and churners, biasing the rate." },
      { issue: "Fee/plan consistency", where: "monthly_fee off for the plan", detection: "groupby(plan) fee value_counts", treatment: "Fees should be constant per plan; investigate mismatches (grandfathered pricing?) and document." },
    ],
    cleaningPlan: [
      { action: "Canonicalise churned to boolean and plan to title-case", rationale: "The outcome and the primary segment must each have one encoding before any rate." },
      { action: "Deduplicate on customer_id", rationale: "Customer counts are the denominator of every churn rate." },
      { action: "Exclude negative tenures from tenure-band analysis (counted)", rationale: "Impossible values would corrupt the tenure windows that drive targeting." },
      { action: "Derive tenure bands and MRR (monthly_fee as proxy)", rationale: "Bands make the churn-curve readable; MRR ranks segments by money, not headcount." },
    ],
    edaPlan: [
      { question: "Churn by plan", method: "groupby(plan) churned mean, with counts and mean fees", expectation: "Basic churns ~22%, Enterprise ~6% — plan tier protects." },
      { question: "Churn by contract length", method: "groupby(contract_months)", expectation: "Monthly contracts churn ~2.5× annual; 24-month lowest." },
      { question: "Tenure windows", method: "churn rate by tenure band (0-3, 4-6, 7-12, 13-24, 25+)", expectation: "Concentration in 1–6 months; long tenure strongly protective." },
      { question: "Payment and renewal", method: "churn by payment_method and auto_renew", expectation: "Card-only and auto-renew-off churn more." },
      { question: "Support interaction", method: "churn rate by ticket-count bucket", expectation: "U-shape: 1–2 tickets fine, 5+ churns heavily." },
      { question: "Usage gap", method: "usage distribution churners vs stayers", expectation: "Churners' usage roughly half of stayers'." },
    ],
    statisticsPlan: [
      { technique: "Churn rates with Wilson CIs by segment", purpose: "Small segments deserve intervals", expectation: "Enterprise's 6% on small N has a wide CI — the brief should say so." },
      { technique: "Two-group usage comparison (t-test / Mann-Whitney)", purpose: "Confirm the usage gap is real", expectation: "Large, significant gap — usage is the strongest single signal." },
      { technique: "Revenue-at-risk ranking (churn rate × MRR per segment)", purpose: "Prioritise by money, not count", expectation: "Standard monthly-contract customers top the list." },
    ],
    visualisationPlan: [
      { chart: "Bar — churn rate by plan (with counts)", answers: "Which plans leak?", reads: "Bar height = churn; n= labels prevent over-reading small plans." },
      { chart: "Bar — churn rate by tenure band", answers: "When do they leave?", reads: "Falling bars left to right; the 0–6 month spike is the target." },
      { chart: "Grouped bar — churn by contract length × auto-renew", answers: "What protects?", reads: "Compare within pairs; auto-renew-off bars tower." },
      { chart: "Histogram — usage hours, churners vs stayers", answers: "What does a churner look like?", reads: "Two overlaid distributions; churners left-shifted." },
      { chart: "Scatter — churn rate vs MRR per segment (bubble = customers)", answers: "Where is the money at risk?", reads: "Upper-right bubbles = the campaign list." },
    ],
    findings: [
      "Overall churn is ~19%: Basic monthly customers churn at ~22% while Enterprise sits near 6% — but Enterprise's rate carries a wide interval on small N.",
      "Churn concentrates brutally early: the 0–6 month window holds a churn rate roughly three times the 13+ month rate — onboarding is the battleground.",
      "Auto-renew-off customers churn at about twice the rate of auto-renew-on; monthly contracts churn ~2.5× annual contracts.",
      "Usage separates the sides: churners average roughly half the monthly usage hours of stayers, the widest single gap in the dataset.",
      "Revenue at risk concentrates in Standard-plan, monthly-contract, auto-renew-off customers — the retention campaign's first list.",
    ],
    recommendations: [
      { what: "Build a 90-day onboarding programme with usage checkpoints at days 14/45/90", why: "Churn triples in the first six months and low usage precedes it — early usage is the leading indicator.", impact: "Biggest lever: front-loaded churn meets early intervention", horizon: "this quarter" },
      { what: "Run a card-update and auto-renew-on campaign (incentivised) for monthly customers", why: "Auto-renew-off doubles churn and is cheap to flip; failed cards compound it.", impact: "Mechanical churn reduction at near-zero cost", horizon: "immediate" },
      { what: "Route 5+ ticket accounts to proactive senior support before renewal", why: "The high-ticket churn cliff is visible in advance; reactive support is too late.", impact: "Protects the angriest revenue", horizon: "this quarter" },
      { what: "Track usage-based health scores monthly with a churn-risk threshold", why: "Usage is the strongest single signal and it is monitorable.", impact: "Turns churn from autopsy to early warning", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Churn at CloudLedger is ~19% and heavily patterned. It triples in the first six months of tenure, halves under annual contracts and auto-renew, and tracks a usage gap that is the single widest signal in the data (churners use the product about half as much). Revenue at risk concentrates in Standard-plan monthly customers with auto-renew off — a segment addressable this month with a card-update campaign, while a 90-day onboarding programme attacks the front-loaded churn window. Rates below are computed after standardising four churn encodings, deduplicating customers and excluding 30 impossible negative-tenure rows (logged in the appendix).",
      structure: [
        "1. Objective and churn definition",
        "2. Data and quality treatment",
        "3. Churn by plan, contract and tenure",
        "4. Payment, auto-renew and support patterns",
        "5. The usage gap",
        "6. Revenue at risk and the campaign list",
        "7. Recommendations (ranked)",
        "8. Appendix: cleaning log, encodings mapped, exclusions",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the snapshot",
        goal: "Load, profile, and understand what a snapshot can and cannot say about churn.",
        instructions: [
          "Profile shape, dtypes, nulls. Read the churned column's encodings carefully — write them all down.",
          "Understand snapshot semantics: this is one moment in time; tenure tells you when churners left, but you have no month-by-month activity history.",
          "Note what MRR means here (monthly_fee as proxy) and that contract/plan are the company's levers of the past, not the analyst's.",
        ],
        hints: [
          "Snapshot vs panel: you can measure WHO churned and their attributes, but not hazard rates over calendar time — tenure bands are your time axis.",
          "value_counts(dropna=False) on churned is the first line you run — four encodings is this dataset's signature.",
          "Ask what one row is: a customer, current at snapshot or churned — so churned=TRUE means 'left before the snapshot'.",
        ],
        checkpoint: "All churn encodings listed, snapshot semantics written, MRR definition noted.",
        code: {
          label: "Profile the snapshot",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("customer-01-churn-snapshot.csv", parse_dates=["signup_date"])
print(df.shape)
print(df["churned"].value_counts(dropna=False))
print(df["plan"].value_counts(dropna=False))
print(df.isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Standardise the outcome",
        goal: "One boolean for churn; canonical plans; clean tenure; unique customers.",
        instructions: [
          "Build the churn encoding map (list every variant you found); assert the mapped column has no nulls.",
          "Canonicalise plan casing; count duplicates on customer_id; find negative tenures.",
          "Check fee/plan consistency — are fees constant within plan? Note exceptions.",
        ],
        hints: [
          "Mapping with a dict + assert is safer than str-mapping: anything unmapped surfaces loudly instead of becoming NaN.",
          "pd.crosstab(df['plan'], df['monthly_fee']) exposes grandfathered or mis-entered fees in one view.",
          "Negative tenure rows: count them, exclude them from tenure analyses, keep them for plan-level rates — different metrics, different subsets.",
        ],
        checkpoint: "A churn-mapping table with counts, and a defect list with treatments.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Canonical frame with boolean churn, tenure bands and MRR.",
        instructions: [
          "Apply mappings; deduplicate; derive tenure_band and revenue_at_risk fields.",
          "Keep a usage-missing flag; exclusions recorded with counts.",
          "Verify: overall churn rate on the clean frame — this number goes in the brief's first line.",
        ],
        hints: [
          "pd.cut for bands: [0, 3, 6, 12, 24, 999] with clear labels; 'band' becomes the targeting axis.",
          "revenue_at_risk at segment level = churn_rate × sum(monthly_fee) — compute after segments are defined.",
          "The overall churn rate is your first headline; compute it once and reuse it everywhere (no three slightly-different rates in one brief).",
        ],
        checkpoint: "Clean frame, overall churn rate computed, tenure bands defined.",
        code: {
          label: "Canonical frame",
          language: "python",
          source: `CHURN_MAP = {"Yes": True, "TRUE": True, "True": True, "yes": True, "1": True,
                "No": False, "FALSE": False, "False": False, "no": False, "0": False}
clean = df.drop_duplicates("customer_id").copy()
clean["churn"] = clean["churned"].map(CHURN_MAP)
assert clean["churn"].notna().all()
clean["plan"] = clean["plan"].str.title()

bands = [0, 3, 6, 12, 24, 999]
labels = ["0-3 mo", "4-6 mo", "7-12 mo", "13-24 mo", "25+ mo"]
ten = clean[clean["tenure_months"] >= 0].copy()
ten["tenure_band"] = pd.cut(ten["tenure_months"], bins=bands, labels=labels)
print(f"overall churn: {clean['churn'].mean():.1%}")`,
        },
      },
      {
        phase: "eda",
        title: "Churn everywhere it hides",
        goal: "Segment rates, tenure windows, the usage gap.",
        instructions: [
          "Churn by plan, contract, payment method, auto-renew — always with counts.",
          "Churn by tenure band (non-negative tenure only).",
          "Usage distributions for churners vs stayers; support-ticket buckets.",
        ],
        hints: [
          "A helper function churn_table(col) keeps you from copy-pasting groupby blocks.",
          "The tenure-band chart is the brief's centrepiece: front-loaded churn is the story.",
          "For usage, plot overlaid histograms (density=True) — means alone hide the shape.",
        ],
        checkpoint: "Rates for all segments quoted; tenure window and usage gap identified.",
        code: {
          label: "Segment rates",
          language: "python",
          source: `def churn_table(frame, col):
    return frame.groupby(col, observed=True)["churn"].agg(["mean", "count"])

for col in ["plan", "contract_months", "payment_method", "auto_renew"]:
    print(f"\\n{col}:\\n{churn_table(clean, col).round(3)}")
print(churn_table(ten, "tenure_band").round(3))`,
        },
      },
      {
        phase: "statistics",
        title: "Intervals and the usage test",
        goal: "Wilson CIs on segment rates; test the usage gap; rank revenue at risk.",
        instructions: [
          "Wilson intervals for plan-level churn (especially Enterprise's small N).",
          "Mann-Whitney (or t-test) on usage hours, churners vs stayers.",
          "Revenue at risk by segment (plan × contract × auto_renew): churn rate × MRR sum.",
        ],
        hints: [
          "proportion_confint(churners, n, method='wilson') — put the interval next to every rate you'll publish.",
          "Usage is skewed — Mann-Whitney is the safer test, but report medians too.",
          "Revenue-at-risk ranking is what turns analysis into a campaign list; sort descending and take the top five segments.",
        ],
        checkpoint: "A rates-with-CIs table, a usage-gap test result, and the top-5 at-risk segments.",
        code: {
          label: "Usage test",
          language: "python",
          source: `from scipy.stats import mannwhitneyu

used = clean[clean["usage_hours_month"].notna()]
churners = used.loc[used["churn"], "usage_hours_month"]
stayers = used.loc[~used["churn"], "usage_hours_month"]
print("medians:", churners.median(), stayers.median())
print(mannwhitneyu(churners, stayers))

seg = clean.groupby(["plan", "contract_months", "auto_renew"], observed=True).agg(
    churn_rate=("churn", "mean"), mrr=("monthly_fee", "sum"))
seg["rev_at_risk"] = seg["churn_rate"] * seg["mrr"]
print(seg.sort_values("rev_at_risk", ascending=False).head())`,
        },
      },
      {
        phase: "visualisation",
        title: "The retention brief's charts",
        goal: "Five charts: plan bars, tenure bars, contract×renew pairs, usage histograms, risk scatter.",
        instructions: [
          "Build the five; annotate n= on bar charts; overlay usage histograms with density scaling.",
          "Title each with its takeaway ('Churn triples in the first six months').",
          "The tenure chart and the risk scatter lead the brief.",
        ],
        hints: [
          "ax.bar with labels f'{rate:.0%}\\n(n={n})' packs rate and count into one label.",
          "Overlayed histograms: alpha=0.5, density=True, shared bins — add median lines for both groups.",
          "Risk scatter: x=churn rate, y=MRR at risk, size=customers — label the top-right bubbles.",
        ],
        checkpoint: "Five saved charts with takeaway titles.",
      },
      {
        phase: "interpretation",
        title: "Read the churn patterns",
        goal: "Findings with rates, windows and honest caveats.",
        instructions: [
          "Answer the five initial questions with figures; attach caveats (snapshot limits, association-not-causation on usage).",
          "Note the correlation structure: low usage may cause churn OR churners may have disengaged — the data can't arbitrate.",
          "Draft the campaign list paragraph: segments, sizes, dollars.",
        ],
        hints: [
          "The honest caveat sentence: 'Usage predicts churn; we cannot show from a snapshot whether usage decline precedes or follows the decision to leave.'",
          "Enterprise's wide CI deserves a sentence — small-N churn rates mislead dashboards constantly.",
          "Campaign list format: segment, customers, MRR at risk, suggested treatment.",
        ],
        checkpoint: "Five answered questions and the campaign-list paragraph.",
      },
      {
        phase: "recommendations",
        title: "The retention programme",
        goal: "Ranked actions tied to segments and expected effects.",
        instructions: [
          "Rank by money-at-risk addressed per unit of effort; each recommendation cites its finding.",
          "Mix mechanical wins (auto-renew campaign) with programme builds (onboarding).",
          "Define success metrics and review dates for each.",
        ],
        hints: [
          "Mechanical-first is a defensible default: card-update campaigns are cheap, fast and reversible.",
          "Onboarding's metric: 90-day usage checkpoint pass rate → churn delta vs control.",
          "Every recommendation should name its segment from the campaign list — no segment-free advice.",
        ],
        checkpoint: "A ranked recommendation table with segments, metrics and dates.",
      },
      {
        phase: "report",
        title: "The two-page retention brief",
        goal: "A brief leadership reads and acts on this week.",
        instructions: [
          "Structure: churn definition → headline rates → tenure window → usage gap → campaign list → recommendations.",
          "Body chart: tenure bands. Everything else in the appendix.",
          "State snapshot limitations in one honest sentence in the body.",
        ],
        hints: [
          "Lead with the number and the window: '19% churn, three-quarters of it concentrated in the first six months.'",
          "The campaign list is the deliverable the team will actually use — format it like a work order, not a table of p-values.",
          "Two pages means two pages: if it doesn't change an action, it goes to the appendix.",
        ],
        checkpoint: "The brief, every number traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the customer success team's analyst. Leadership wants the truth about churn and a ranked target list for the next retention campaign. The snapshot export is yours; churn definitions, tenure bands and the risk-ranking method are yours to set and document.",
      deliverables: [
        "Encoding standardisation and cleaning log for the churn snapshot",
        "Churn rates by plan, contract, tenure band, payment and auto-renew (with counts/CIs)",
        "Usage gap analysis between churners and stayers",
        "Revenue-at-risk ranking by segment",
        "Two-page retention brief with a ranked, evidence-cited campaign list",
      ],
      guardrails: [
        "Churn column mapped explicitly; no silent coercion",
        "Rates published with counts or intervals",
        "Snapshot limitations stated (no time-series claims)",
        "Association language only — no causal claims from a snapshot",
      ],
    },

    evaluationChecks: {
      correctness: [
        "All churn encodings mapped; unmapped values counted, not coerced",
        "Tenure-band rates exclude negative tenures (exclusion counted)",
        "Revenue-at-risk arithmetic shown (rate × MRR)",
      ],
      "code-quality": [
        "Churn mapping table visible in code; assertions used",
        "Segment-rate helper reused, not copy-pasted",
      ],
      reasoning: [
        "Snapshot vs longitudinal distinction maintained",
        "Usage-churn directionality caveat present",
      ],
      visualization: [
        "Bar charts carry n= annotations",
        "Usage comparison uses distributions, not just means",
      ],
      interpretation: [
        "Front-loaded churn quantified by tenure band",
        "Enterprise (or small-N) rates caveated with intervals",
      ],
      recommendations: [
        "Campaign list names segments, sizes and dollars at risk",
        "Each action ties to a finding with a success metric",
      ],
    },
  },

  /* ================================================================ CUS-02 */
  {
    id: "customer-2",
    categoryId: "customer",
    difficulty: "intermediate",
    code: "CUS-02",
    title: "RFM Segmentation & Customer Value Tiers",
    subtitle: "Fourteen months of transactions: score every customer, profile the segments, and brief the CRM team.",
    summary:
      "Classic RFM done properly: build recency/frequency/monetary scores from a messy transaction log, cluster customers into actionable segments, profile each segment's behaviour, and translate tiers into CRM programmes.",
    hours: 9,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["RFM scoring", "Segmentation", "Customer profiling", "Cohort-free value analysis", "CRM programme design"],

    businessBackground:
      "Bracken & Co, an omnichannel homeware retailer, runs one generic email programme for a customer base that everyone knows is heterogeneous. Marketing budget is tight and the head of CRM wants to segment by behaviour — who lapsed, who's loyal, who deserves VIP treatment, who only buys on discount — before the holiday season. Fourteen months of transaction history is available at customer level; the head of CRM wants 'RFM, but done properly', with segments a campaign manager can act on.",
    problemStatement:
      "Build a behaviour-based customer segmentation from transaction history: compute RFM (recency, frequency, monetary) scores with documented choices, derive actionable segments with named treatments, profile each segment (size, value, channel, category, discount reliance), and hand the CRM team a segmentation spec ready for the holiday campaign.",
    businessObjectives: [
      "Compute R, F, M metrics per customer with documented as-of date and handling of returns",
      "Score and segment customers (RFM quintiles plus derived segments like 'at-risk VIP')",
      "Profile segments: size, revenue share, AOV, discount reliance, channel mix",
      "Quantify segment migration risk (champions slipping to at-risk)",
      "Deliver a segmentation spec: segments, definitions, treatments, priority",
    ],
    datasetDescription:
      "~11,000 transactions for ~3,800 customers over fourteen months: each row a transaction with customer id, date, amount, category, channel, discount flag and return status. Dates arrive in two formats, some amounts are extreme outliers, return labels are inconsistent, channels have gaps and duplicates exist — the segmentation inherits every cleaning decision, so each one is documented.",
    dataDictionary: [
      { column: "transaction_id", kind: "id", description: "Unique transaction identifier", example: "882401" },
      { column: "customer_id", kind: "id", description: "Customer identifier", example: "51240" },
      { column: "transaction_date", kind: "date", description: "Transaction date (two formats mixed)", example: "2025/03/02" },
      { column: "amount", kind: "currency", description: "Transaction value (extreme outliers exist)", example: "74.10" },
      { column: "product_category", kind: "categorical", description: "Merchandise category", example: "Home" },
      { column: "channel", kind: "categorical", description: "Web / Mobile App / In-Store / Phone (some missing)", example: "In-Store" },
      { column: "discount_used", kind: "boolean", description: "Discount applied to the transaction", example: "1" },
      { column: "returned", kind: "categorical", description: "Return status (inconsistent labels)", example: "Yes" },
    ],
    initialQuestions: [
      "What are the RFM distributions, and where are the natural tier boundaries?",
      "Which segments matter most by revenue share and size — champions, loyal, big spenders who lapsed?",
      "How do segments differ on discount reliance and channel preference?",
      "Which customers are at-risk high-value (recent VIPs going quiet) and worth a win-back?",
      "What treatments does each segment warrant for the holiday campaign?",
    ],
    dataset: {
      name: "Bracken transactions",
      filename: "customer-02-rfm-transactions.csv",
      description: "14 months of transactions for ~3,800 customers with channel, discount and returns.",
      rows: 11000,
    },

    dataQuality: [
      { issue: "Mixed date formats", where: "transaction_date — 'YYYY-MM-DD' and 'YYYY/MM/DD'", detection: "pd.to_datetime with format inference; nulls after parse", treatment: "Parse with explicit format list or dayfirst=False with errors='coerce'; count parse failures — they must be zero after a correct approach." },
      { issue: "Extreme amount outliers", where: "amount — a few 10–12× the typical value", detection: "describe(); box plot; z-score by customer", treatment: "Investigate: wholesale-like orders vs keying errors. Cap or exclude only with justification; RFM monetary is sensitive to them." },
      { issue: "Inconsistent return labels", where: "returned — 'Yes'/'Y'/'No'/'N'", detection: "value_counts()", treatment: "Map to boolean; returns should REDUCE monetary contribution (net revenue) and arguably not count as frequency — decide and document." },
      { issue: "Missing channel", where: "channel — ~3%", detection: "isna().sum()", treatment: "Label 'Unknown' for profiling; keep transactions in all financial metrics." },
      { issue: "Duplicate transactions", where: "~0.9% duplicated rows", detection: "duplicated('transaction_id').sum()", treatment: "Drop; duplicates inflate frequency (RFM's F) directly." },
      { issue: "As-of date ambiguity", where: "Recency needs a reference date", detection: "max(transaction_date) vs today", treatment: "Use max(transaction_date) as the as-of date (analysis-time snapshot), documented — never 'today' on an old export." },
    ],
    cleaningPlan: [
      { action: "Parse dates robustly (both formats); verify zero parse failures", rationale: "Recency is days-from-as-of; one unparsed date breaks a customer's entire recency." },
      { action: "Deduplicate; normalise return labels to boolean", rationale: "Frequency integrity and return handling." },
      { action: "Treat amount outliers with a documented policy", rationale: "Monetary quintiles are outlier-sensitive; state the cut and its revenue impact." },
      { action: "Split net transactions (returns netted/excluded) for RFM vs profiling tables", rationale: "M should reflect realised value; frequency should reflect purchases, not refunds." },
      { action: "Define as-of date and compute recency in days from it", rationale: "Recency is only meaningful relative to a stated snapshot date." },
    ],
    edaPlan: [
      { question: "RFM distributions", method: "histograms of recency, frequency, monetary", expectation: "Recency right-skewed; frequency heavily concentrated 1–3; monetary log-normal." },
      { question: "Quintile boundaries", method: "qcut into 5 bins per dimension; inspect edges", expectation: "Frequency quintiles collapse at low values (many 1s) — ties need handling." },
      { question: "Revenue concentration", method: "share of net revenue by RFM score decile", expectation: "Top RFM decile ≈ 35–45% of revenue." },
      { question: "Discount reliance", method: "discount_used rate by segment", expectation: "Discount-driven and at-risk segments 2× the champions' rate." },
      { question: "Channel preference", method: "channel mix by segment", expectation: "Champions skew Mobile App; lapsed skew Web." },
      { question: "Category profiles", method: "category mix by segment", expectation: "Loyal skews Home; discount-driven skews Apparel." },
    ],
    statisticsPlan: [
      { technique: "RFM scoring (quintiles with tie handling)", purpose: "The core segmentation construct", expectation: "Scores 1–5 per dimension; 555 champions ≈ 8–12% of customers." },
      { technique: "Derived segment rules (at-risk VIP, new high-value, etc.)", purpose: "Make segments actionable beyond the 125-cell matrix", expectation: "6–8 named segments covering >90% of customers." },
      { technique: "Segment value decomposition", purpose: "Revenue share, AOV, frequency, margin-proxy per segment", expectation: "Champions ≈ 40% of revenue from ≈ 10% of customers." },
      { technique: "Lift analysis for proposed treatments", purpose: "Size the prize per segment action", expectation: "At-risk VIP win-back: ~5–8% of a $X segment pool recoverable by benchmark." },
    ],
    visualisationPlan: [
      { chart: "RFM histograms (small multiples)", answers: "What do the dimensions look like?", reads: "Shape and skew; frequency's long tail of 1s." },
      { chart: "Treemap or stacked bar — revenue share by segment", answers: "Where does the money sit?", reads: "Area/length = revenue; champions dominate." },
      { chart: "Scatter — recency vs monetary, coloured by segment", answers: "Who are the at-risk VIPs?", reads: "Top-left (recent, high spend) vs top-right (lapsed, high spend) contrast." },
      { chart: "Bar — discount reliance by segment", answers: "Who only buys on deal?", reads: "Sorted bars; the discount-driven segment towers." },
      { chart: "Segment migration snake (RFM score vs revenue per customer)", answers: "How steep is the value curve?", reads: "Concentration justifies differentiated treatment." },
    ],
    findings: [
      "Customer value is steeply concentrated: the top RFM decile holds roughly 40% of net revenue; champions (score ≥ 4 on all dimensions) are ~10% of customers but nearly 40% of revenue.",
      "A material at-risk VIP segment exists: high monetary, low recent recency — roughly 6% of customers and 12–15% of revenue have gone quiet.",
      "Discount reliance splits the base: a ~15% 'discount-driven' segment transacts at 2× the champion discount rate and only appears in promo periods.",
      "Channel and category profiles differ by segment (champions skew Mobile App and Home; lapsed skew Web), which the holiday campaign can exploit for routing.",
      "Frequency's distribution (most customers 1–2 purchases) means the second purchase — not the tenth — is the behavioural battleground for growth.",
    ],
    recommendations: [
      { what: "Launch an at-risk VIP win-back (early access + personal outreach) before the holiday season", why: "12–15% of revenue is going quiet; these customers have proven value and need a nudge, not a discount.", impact: "Highest expected revenue per campaign dollar", horizon: "immediate" },
      { what: "Build a champions programme (early access, free shipping) with no discounts", why: "Champions buy at low discount rates; give them status, not margin.", impact: "Protects 40% of revenue; raises retention of the core", horizon: "this quarter" },
      { what: "Target second-purchase journeys for 1-transaction customers", why: "Frequency's mass sits at one purchase; converting even 10% doubles their cohort value.", impact: "Grows the future champion pool", horizon: "this quarter" },
      { what: "Suppress blanket discounts for the discount-driven segment; use category hooks instead", why: "They respond to promotions but buy nothing at full price — margin math fails.", impact: "Margin protection with volume risk managed by targeting", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Bracken's base splits cleanly into behaviour segments the CRM team can act on. Champions — one customer in ten — carry ~40% of revenue; a further 6% are at-risk VIPs (proven spenders going quiet) holding another 12–15%. A discount-driven eighth of the base only appears on promotion, while half the base has a single purchase, making the second purchase the structural battleground. The holiday plan writes itself from the segmentation: win-back the at-risk VIPs with access not discounts, reward champions with status, engineer second-purchase journeys, and stop blanketing the discount-seekers. All scores are computed from a deduplicated, return-normalised transaction set against a documented as-of date; the segmentation spec follows.",
      structure: [
        "1. Objective and segmentation approach",
        "2. Data, quality treatment, RFM definitions (as-of, returns, outliers)",
        "3. RFM distributions and score construction",
        "4. Named segments: definitions and sizes",
        "5. Segment profiles: value, discount, channel, category",
        "6. The holiday campaign spec per segment",
        "7. Appendix: cleaning log, score rules, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Frame the RFM question",
        goal: "Understand the transaction grain, the as-of convention, and the returns policy choice.",
        instructions: [
          "Profile the data; note the two date formats and the outlier scale immediately.",
          "Decide and write down: as-of date = max(transaction_date); returns netted from monetary and excluded from frequency.",
          "Confirm the customer base size and transactions-per-customer distribution — RFM's viability depends on it.",
        ],
        hints: [
          "RFM decisions ARE the methodology: as-of date, returns handling, outlier policy, tie handling. Write the four decisions down before computing.",
          "transactions per customer: df.groupby('customer_id').size().describe() — if the median is 1, frequency scoring needs care (ties).",
          "The as-of convention matters more than it looks: 'today' on a stale export inflates everyone's recency.",
        ],
        checkpoint: "The four methodology decisions written, customer/transaction counts known.",
        code: {
          label: "Methodology setup",
          language: "python",
          source: `df = pd.read_csv("customer-02-rfm-transactions.csv")
print(df["transaction_id"].nunique(), "transactions")
print(df["customer_id"].nunique(), "customers")
print(df.groupby("customer_id").size().describe())
print(df["amount"].describe())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the transaction log",
        goal: "Dates, duplicates, returns, outliers, channels — counted and catalogued.",
        instructions: [
          "Parse dates with both formats; count failures (target: zero).",
          "Quantify duplicates, return-label variants, missing channels.",
          "Examine amount outliers: customer history context (wholesale pattern vs keying error).",
        ],
        hints: [
          "pd.to_datetime(df['transaction_date'], format='mixed', errors='coerce') then count NaNs — mixed format parsing is exactly what 'mixed' exists for.",
          "For outliers: does the SAME customer have a pattern of big orders (real) or one 10× spike among small ones (error)?",
          "Return labels: build the mapping dict from value_counts — every variant must appear in it.",
        ],
        checkpoint: "An audit table with counts, plus a verdict (keep/cap/exclude) on outliers with reasoning.",
      },
      {
        phase: "cleaning",
        title: "Build the RFM base",
        goal: "Net transactions, unique customers, computed R/F/M metrics.",
        instructions: [
          "Apply decisions: dedupe, returns boolean, outlier policy, channel 'Unknown'.",
          "Build the RFM frame: recency_days, frequency (net orders), monetary (net value) per customer.",
          "Sanity-check: recency ≥ 0; frequency ≥ 1; monetary distribution reasonable.",
        ],
        hints: [
          "Separate frames: purchases (for F) and net value (for M) — returns reduce M but shouldn't count as an F event.",
          "recency = (AS_OF - last_purchase_date).days; frequency = purchase count; monetary = sum of net amounts.",
          "Sanity checks as asserts: (rfm['recency_days'] >= 0).all() and (rfm['frequency'] >= 1).all().",
        ],
        checkpoint: "An RFM frame, one row per customer, three metrics, sanity-checked.",
        code: {
          label: "RFM frame",
          language: "python",
          source: `clean = df.drop_duplicates("transaction_id").copy()
clean["date"] = pd.to_datetime(clean["transaction_date"], format="mixed")
clean["returned"] = clean["returned"].map({"Yes": True, "Y": True, "No": False, "N": False})
AS_OF = clean["date"].max()

purch = clean[~clean["returned"]]
rfm = purch.groupby("customer_id").agg(
    last_date=("date", "max"), frequency=("transaction_id", "count"),
    monetary=("amount", "sum")).reset_index()
rfm["recency_days"] = (AS_OF - rfm["last_date"]).dt.days
assert (rfm["recency_days"] >= 0).all() and (rfm["frequency"] >= 1).all()`,
        },
      },
      {
        phase: "eda",
        title: "Distributions and quintile reality",
        goal: "See the three distributions and handle frequency's tie problem.",
        instructions: [
          "Histograms of all three metrics (log scale for monetary).",
          "Attempt quintile cuts; inspect edges — frequency will collapse; use rank-based scoring (method='first'/'dense') for ties.",
          "Revenue concentration: net revenue share by combined RFM score.",
        ],
        hints: [
          "pd.qcut with duplicates='drop' silently merges tied bins — sometimes right, sometimes dishonest; for RFM, rank-based scoring handles ties explicitly.",
          "rfm['F_score'] = rfm['frequency'].rank(method='first', pct=True) then bin — every customer lands in a quintile by rank.",
          "Concentration: sort by combined score, cumulative revenue share — the top-decile number goes in your brief.",
        ],
        checkpoint: "Three distributions charted, quintiles built with documented tie policy, concentration quoted.",
        code: {
          label: "Scoring",
          language: "python",
          source: `for col, name in [("recency_days", "R"), ("frequency", "F"), ("monetary", "M")]:
    rfm[name + "_score"] = pd.qcut(
        rfm[col].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm.loc[:, "R_score"] = 6 - rfm["R_score"]  # invert recency: 5 = most recent

rfm["rfm_combined"] = rfm[["R_score", "F_score", "M_score"]].sum(axis=1)
rev = rfm.sort_values("rfm_combined", ascending=False)
print("top decile revenue share:",
      rev.head(len(rev)//10)["monetary"].sum() / rev["monetary"].sum())`,
        },
      },
      {
        phase: "statistics",
        title: "Segments and their economics",
        goal: "Named segments from scores; profile each; size the treatment opportunities.",
        instructions: [
          "Define segment rules (champions, loyal, at-risk VIP, hibernating, discount-driven, new) covering >90% of customers.",
          "Profile: size, revenue share, AOV, frequency, discount rate, channel mix per segment.",
          "Size the at-risk VIP win-back and the second-purchase pool with benchmark recovery rates.",
        ],
        hints: [
          "At-risk VIP = high M, low R (e.g., M≥4, R≤2): proven spenders going quiet — the highest-value recoverable pool.",
          "Discount-driven needs transaction-level history rejoined to segments: discount rate by segment from the purchases frame.",
          "Benchmark win-back rates of 5–8% are industry-plausible; present them as assumptions, not findings.",
        ],
        checkpoint: "A segment table with definitions, sizes, economics; the win-back pool sized in dollars.",
        code: {
          label: "Segment rules",
          language: "python",
          source: `def segment(r):
    if r.R_score >= 4 and r.F_score >= 4 and r.M_score >= 4:
        return "Champions"
    if r.M_score >= 4 and r.R_score <= 2:
        return "At-risk VIP"
    if r.R_score >= 4 and r.F_score <= 2:
        return "New / promising"
    if r.R_score <= 2 and r.F_score <= 2 and r.M_score <= 2:
        return "Hibernating"
    if r.R_score >= 3 and r.F_score >= 3:
        return "Loyal"
    return "Middle"

rfm["segment"] = rfm.apply(segment, axis=1)
prof = rfm.groupby("segment").agg(
    customers=("customer_id", "count"), revenue=("monetary", "sum"),
    aov=("monetary", "mean"), freq=("frequency", "mean"))
prof["rev_share"] = prof["revenue"] / prof["revenue"].sum()
print(prof.sort_values("revenue", ascending=False).round(2))`,
        },
      },
      {
        phase: "visualisation",
        title: "The segmentation exhibit set",
        goal: "Five charts: distributions, revenue share, recency-monetary map, discount reliance, value curve.",
        instructions: [
          "Small-multiple histograms; revenue-share treemap/bars; the recency-monetary scatter (coloured by segment) is the map the CRM team will keep.",
          "Discount reliance by segment sorted; value concentration curve.",
          "Label the at-risk VIP quadrant on the scatter explicitly.",
        ],
        hints: [
          "The scatter IS the segmentation story: x=recency, y=monetary, colour=segment; annotate 'at-risk VIP' region.",
          "Treemaps need squarify; stacked/summary bars are the no-dependency alternative.",
          "Discount bars should show segment sample sizes — small-segment bars lie easily.",
        ],
        checkpoint: "Five exhibits with the recency-monetary map polished.",
      },
      {
        phase: "interpretation",
        title: "Read the segments",
        goal: "Findings per segment with economics and migration risks.",
        instructions: [
          "Describe each segment in two sentences: what they are and what they're worth.",
          "Discuss migration: champions slipping (R declining) and the second-purchase wall.",
          "Flag assumption-laden numbers (benchmark recovery rates) as assumptions.",
        ],
        hints: [
          "Segment descriptions should read like customer personas, not score definitions.",
          "The migration insight (who's slipping) requires recency trends a snapshot can't fully give — state what a second extract would show.",
          "Assumption hygiene: 'benchmark 5–8% win-back' is external knowledge, labelled as such.",
        ],
        checkpoint: "Segment persona table and the migration/second-purchase findings.",
      },
      {
        phase: "recommendations",
        title: "The campaign spec",
        goal: "Treatments per segment, prioritised, with success metrics.",
        instructions: [
          "One treatment per segment, prioritised by expected value; champions get status, at-risk VIPs get access, discount-driven gets category hooks.",
          "Include suppression rules (who NOT to blanket-discount).",
          "Define success metrics per campaign and the measurement window.",
        ],
        hints: [
          "Suppression rules are half the value of segmentation: the discipline to NOT discount champions.",
          "Each treatment: segment, offer, channel, metric, window — five columns, campaign-ready.",
          "Prioritise by (segment revenue × expected effect) and say so.",
        ],
        checkpoint: "A campaign spec table the CRM team can execute unaided.",
      },
      {
        phase: "report",
        title: "The segmentation pack",
        goal: "A pack with the spec front and centre and the methodology defended.",
        instructions: [
          "Structure per the outline; the spec table is the body's climax, not an afterthought.",
          "Methodology decisions (as-of, returns, ties, outliers) get a boxed half-page — they're what a reviewer probes.",
          "Reproducibility appendix: script + as-of date stamped on every figure.",
        ],
        hints: [
          "Stamp the as-of date on every table header — segmentations rot; dates keep them honest.",
          "The persona table makes the segmentation memorable to non-analysts; invest a sentence per segment.",
          "End with the refresh plan: RFM re-scored monthly, segment definitions version-controlled.",
        ],
        checkpoint: "The complete segmentation pack with campaign spec and methodology box.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the CRM analytics lead for one week. Build a behaviour segmentation the campaign team can execute for the holiday season: RFM done properly, named segments, per-segment treatments. Methodology decisions (as-of, returns, outliers, ties) are yours and must be documented.",
      deliverables: [
        "Transaction audit and the four documented RFM methodology decisions",
        "RFM frame with scores and tie handling",
        "Named segment rules with sizes, revenue shares and profiles",
        "Segment exhibits including the recency-monetary map",
        "Campaign spec: treatments, suppression rules, success metrics",
      ],
      guardrails: [
        "As-of date stated and used consistently",
        "Returns netted from monetary, excluded from frequency (or equivalent documented policy)",
        "Tie handling in quintiles explicit",
        "External benchmarks labelled as assumptions",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Recency computed from a stated as-of date",
        "Returns treated per the documented policy in both F and M",
        "Revenue shares computed on net revenue",
      ],
      "code-quality": [
        "RFM frame built once; scoring vectorised",
        "Methodology decisions documented in code comments or markdown",
      ],
      reasoning: [
        "Frequency tie problem recognised and solved explicitly",
        "Segment boundaries justified, not arbitrary",
      ],
      visualization: [
        "Recency-monetary map distinguishes segments clearly",
        "Distribution charts honest about skew (log scale where needed)",
      ],
      interpretation: [
        "At-risk VIP concept correctly derived (high M, low R)",
        "Value concentration quantified by decile",
      ],
      recommendations: [
        "Treatment per segment with suppression rules",
        "Success metrics and measurement windows defined",
      ],
    },
  },

  /* ================================================================ CUS-03 */
  {
    id: "customer-3",
    categoryId: "customer",
    difficulty: "advanced",
    code: "CUS-03",
    title: "Churn Drivers & Health-Score Design",
    subtitle: "Twenty-six weeks of product telemetry: find the leading indicators and build the health score the CS team will actually use.",
    summary:
      "Model-grade churn analysis: engineer behavioural features from a customer-week usage panel, distinguish leading from lagging signals, fit a regularised churn model, and design a deployable health score with intervention thresholds.",
    hours: 16,
    tools: ["Python", "pandas", "NumPy", "scikit-learn", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Time-window feature engineering", "Leakage avoidance", "Classification modelling", "Feature importance", "Operational score design"],

    businessBackground:
      "FlowMetric, a B2B SaaS collaboration tool, runs customer success with gut feel and renewal-calendar alerts — and it shows: churn lands as a surprise in quarter 11 of every 12. Product telemetry (weekly usage per customer), support signals and payment events are all captured but never combined. The VP Customer Success has budget for exactly one intervention programme and wants it targeted by a health score with proven leading indicators, not lagging ones that fire when the customer has already left in spirit.",
    problemStatement:
      "Identify leading indicators of next-month churn from a customer-week usage panel; build and validate a churn model with strict leakage discipline; and convert it into an operational health score with tiers, thresholds and intervention playbooks — including the score's honest limits (what it can and cannot see).",
    businessObjectives: [
      "Engineer per-customer behavioural features with correct time windows (features through week t predicting churn in t+1)",
      "Distinguish leading vs lagging indicators (which signals move before churn is decided?)",
      "Fit and cross-validate a regularised classifier; report honest out-of-fold metrics",
      "Design the health score: components, weights, tiers, thresholds, intervention per tier",
      "Deliver an operations-ready spec with monitoring and drift plan",
    ],
    datasetDescription:
      "A customer-week panel (~14,000 rows): 2,400 customers tracked over 26 weeks with weekly usage (active days, sessions, minutes), feature adoption events, support tickets, NPS and payment failures, plus a churned-next-month flag. Real telemetry is present: missing blocks from tracking outages, −999 NPS sentinels, duplicate customer-weeks, zero-seat errors and missing churn labels. The panel structure and the t→t+1 prediction task impose the discipline; every defect is documented because leakage and silent repairs are the two ways this analysis lies.",
    dataDictionary: [
      { column: "week", kind: "date", description: "Week start date", example: "2025-03-10" },
      { column: "customer_id", kind: "id", description: "Customer identifier", example: "31204" },
      { column: "plan", kind: "categorical", description: "Starter / Growth / Scale", example: "Growth" },
      { column: "seats", kind: "integer", description: "Licensed seats (0s are errors)", example: "24" },
      { column: "active_days", kind: "integer", description: "Days with activity in the week", example: "5" },
      { column: "sessions", kind: "integer", description: "Total sessions in the week", example: "88" },
      { column: "minutes_used", kind: "integer", description: "Total minutes used (missing blocks)", example: "1520" },
      { column: "feature_a_events", kind: "integer", description: "Core-feature events in the week", example: "120" },
      { column: "feature_b_events", kind: "integer", description: "Advanced-feature events (some missing)", example: "40" },
      { column: "support_tickets", kind: "integer", description: "Tickets opened that week", example: "1" },
      { column: "nps", kind: "integer", description: "Rolling NPS (−999 = not surveyed)", example: "8" },
      { column: "payment_failures", kind: "integer", description: "Payment failures that week", example: "0" },
      { column: "churned_next_month", kind: "boolean", description: "Churned in the following month (some missing)", example: "0" },
    ],
    initialQuestions: [
      "Which usage metrics decline weeks BEFORE churn — and which only move after the decision is effectively made?",
      "How do support tickets, NPS and payment failures interact with usage decline as churn predictors?",
      "What is the honest out-of-fold performance of a model using only pre-churn-week features?",
      "Which customers would a 3-tier health score have flagged, and how early?",
      "What would the score miss (failure modes), and how should ops compensate?",
    ],
    dataset: {
      name: "FlowMetric usage panel",
      filename: "customer-03-usage-panel.csv",
      description: "26 weeks of customer-level usage telemetry with churn-next-month labels.",
      rows: 14000,
    },

    dataQuality: [
      { issue: "Missing churn labels", where: "churned_next_month — ~2% of rows", detection: "isna().sum() on the label", treatment: "Label missing = cannot train or evaluate on that row: exclude from model, count and report. NEVER impute the target." },
      { issue: "NPS −999 sentinel", where: "nps — not-yet-surveyed encoded as −999", detection: "value_counts(); min() check", treatment: "Replace with NaN and add nps_surveyed flag; treating −999 as a number poisons every average it touches." },
      { issue: "Missing usage blocks", where: "minutes_used / feature_b_events — tracking outages (~2-3%)", detection: "missingness by customer/week patterns", treatment: "If outage-driven (block missing for many customers in a week): mark outage weeks, exclude from feature windows. If isolated: leave NaN and let features use available weeks — never zero-fill usage (zero is a real and ominous value here)." },
      { issue: "Duplicate customer-weeks", where: "~0.4% duplicated keys", detection: "duplicated(['customer_id','week']).sum()", treatment: "Fatal for panel integrity: aggregate duplicates (mean) or drop after inspection; verify unique key." },
      { issue: "Zero-seat errors", where: "seats == 0", detection: "(df['seats'] == 0).sum()", treatment: "Repair within customer (mode/ffill); per-seat metrics need valid denominators." },
      { issue: "Label leakage risk (structural)", where: "Feature window overlapping the label month", detection: "By design review, not by counting", treatment: "The rule: features from weeks ≤ t only; label = churn in the month after t. Document the window arithmetic and audit it once in code." },
    ],
    cleaningPlan: [
      { action: "Enforce panel key uniqueness; repair seats within customer", rationale: "Panel integrity and valid per-seat denominators." },
      { action: "Sentinel handling: NPS −999 → NaN + surveyed flag", rationale: "Sentinels-as-numbers are the classic silent poison." },
      { action: "Outage marking and window-safe missingness (no zero-filling of usage)", rationale: "Zero usage is a churn signal; confusing 'no data' with 'no usage' corrupts both." },
      { action: "Drop rows with missing labels (counted)", rationale: "The target is sacred: no imputation, no invention." },
      { action: "Build the supervised frame: for each customer-week t, features from the trailing 4 weeks ≤ t, label from month t+1", rationale: "This is the leakage firewall; build it once, test it with a hand-checked example." },
    ],
    edaPlan: [
      { question: "Churn base rate and stability", method: "label rate by month; by plan", expectation: "~4–6% monthly churn; Scale plan lowest." },
      { question: "Usage trajectories around churn", method: "aligned-by-event curves: weekly usage for churners, weeks −8..0 before churn vs matched stayers", expectation: "Churners' usage declines from ~6–8 weeks out — the leading window." },
      { question: "Which metrics lead", method: "per-metric divergence week (when churners' and stayers' curves separate)", expectation: "sessions and active_days lead by 5–6 weeks; tickets spike late (lagging); NPS moves early but sparse." },
      { question: "Support and payment signals", method: "ticket rate and payment-failure rate in churn month vs prior", expectation: "Ticket spike in final 2–3 weeks (lagging); payment failures weakly predictive." },
      { question: "Feature adoption effects", method: "feature_b adoption rate churners vs stayers", expectation: "Adopters churn less — stickiness story." },
      { question: "Seat utilisation", method: "sessions per seat distribution by outcome", expectation: "Low utilisation precedes churn (unused licences are pre-cancelled licences)." },
    ],
    statisticsPlan: [
      { technique: "Event-aligned trajectory analysis", purpose: "Establish lead time per metric empirically", expectation: "A 4–6 week leading window for usage metrics — this justifies the score's cadence." },
      { technique: "Regularised logistic regression (L1/L2) with class weighting", purpose: "Interpretable model on engineered features", expectation: "AUC ~0.78–0.84 out-of-fold; usage slope and utilisation dominate." },
      { technique: "Time-aware cross-validation (train on early months, validate on later)", purpose: "Honest performance under temporal drift", expectation: "Slightly worse than random CV — the honest number." },
      { technique: "Feature importance with stability check across folds", purpose: "Which components earn a place in the score", expectation: "Usage slope, sessions/seats, feature_b adoption, ticket spike stable; NPS unstable (sparse)." },
      { technique: "Threshold analysis (precision/recall at operating points)", purpose: "Pick score tiers that ops can action", expectation: "Top-decile risk captures 40–50% of churners at ~25–35% precision." },
    ],
    visualisationPlan: [
      { chart: "Event-aligned usage curves (churners vs stayers)", answers: "How early does decline show?", reads: "Divergence point = the leading window; annotate it." },
      { chart: "Lead-time chart — divergence week per metric", answers: "Which signals lead, which lag?", reads: "Bars of divergence week; tickets lag, usage leads." },
      { chart: "ROC/PR curve with the chosen operating point marked", answers: "How good is the score, honestly?", reads: "PR curve matters at 5% prevalence; mark the tier threshold." },
      { chart: "Calibration plot by risk decile", answers: "Can we trust the probabilities?", reads: "Predicted vs actual churn rate per decile." },
      { chart: "Feature importance with fold-stability whiskers", answers: "What's in the score and why?", reads: "Bars with min-max across folds; unstable features flagged." },
    ],
    findings: [
      "Usage decline leads churn by four to six weeks: churners' sessions and active days fall ~35–45% below matched stayers well before the churn month — the intervention window exists and is knowable.",
      "Support tickets lag (spiking in the final two weeks: frustration, not foresight) while payment failures are weakly predictive — the score's backbone must be behavioural, not billing.",
      "Seat utilisation (sessions per seat) is the single most informative feature: unused seats are pre-cancelled seats.",
      "The honest model (features ≤ week t predicting month t+1, time-aware validation) reaches AUC ~0.80; the top-risk decile captures 40–50% of next-month churners at 25–35% precision — good enough to aim, not to automate.",
      "NPS, though intuitive, is too sparse and unstable across folds to carry weight; the score should use it as a tiebreaker signal, not a component.",
    ],
    recommendations: [
      { what: "Deploy a 3-tier health score (usage slope, utilisation, feature adoption) with weekly refresh and CSM alerts on tier-2 escalation", why: "The leading window is 4–6 weeks; weekly cadence matches it with margin.", impact: "Interventions before the decision is made, not after", horizon: "this quarter" },
      { what: "Aim tier-1 (highest risk) at CSM outreach with a success-offer playbook; tier-2 at automated engagement nudges", why: "25–35% precision means human-in-the-loop for the top tier; automation suits the broader tier.", impact: "Sized intervention programme within CS capacity", horizon: "this quarter" },
      { what: "Add seat-utilisation reporting to the QBR pack for Scale-plan accounts", why: "Unused seats are the strongest churn precursor and the easiest for account teams to act on.", impact: "Early account conversations triggered by licences, not feelings", horizon: "immediate" },
      { what: "Monitor score drift monthly (calibration + feature distributions) with a retrain trigger", why: "Telemetry changes; a silent score rots into noise.", impact: "Keeps the programme honest past quarter one", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "FlowMetric churn is visible before it happens: usage declines four to six weeks ahead of the churn month, and seat utilisation is its strongest single precursor. An honest model — features strictly from before the churn month, validated forward in time — reaches AUC ~0.80 and lets a three-tier health score flag 40–50% of next-month churners in its top decile. Support tickets lag (they spike when it's already too late), and NPS is too sparse to carry weight. The recommended programme: a weekly-refresh score aimed at the leading window, human outreach for the top tier, automated nudges for the middle, and monthly drift monitoring so the score stays a score and not a superstition.",
      structure: [
        "1. The VP's question and the prediction task definition",
        "2. Panel construction, quality treatment and the leakage firewall",
        "3. Event-aligned trajectories: the leading window",
        "4. Feature engineering and importance (with stability)",
        "5. Model, time-aware validation, honest metrics",
        "6. The health score: components, tiers, thresholds, playbooks",
        "7. Failure modes and drift monitoring",
        "8. Appendix: cleaning log, feature definitions, model cards",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Define the prediction task before touching data",
        goal: "Write the supervised-learning contract: features ≤ t, label = churn in t+1.",
        instructions: [
          "State the task in one sentence: 'Using weeks 1..t of customer behaviour, predict churn in the month following week t.'",
          "Understand the panel: one row per customer-week; label on each row refers to the NEXT month.",
          "Write down the leakage rule and the validation rule (train early, test late) before building anything.",
        ],
        hints: [
          "The prediction task definition is the analysis's constitution — every later decision is judged against it.",
          "Panel key check now: duplicated(['customer_id','week']) — resolve before any window math.",
          "Ask what the CS team would DO with a prediction: intervention capacity defines the operating point, so the task framing must include actionability.",
        ],
        checkpoint: "A written task contract, panel key verified unique, leakage rule stated.",
        code: {
          label: "Panel validation",
          language: "python",
          source: `df = pd.read_csv("customer-03-usage-panel.csv", parse_dates=["week"])
dupes = df.duplicated(["customer_id", "week"]).sum()
print("duplicate keys:", dupes)
print(df.groupby("customer_id")["week"].nunique().describe())
print("label rate:", df["churned_next_month"].mean())`,
        },
      },
      {
        phase: "quality",
        title: "Audit with telemetry-specific eyes",
        goal: "Sentinels, outages, zero-seats, missing labels — each handled by type, not uniformly.",
        instructions: [
          "Find the NPS sentinel; quantify missing labels; locate outage blocks (missingness clustered by week across customers).",
          "Zero-seat errors; repair policy within customer.",
          "Classify every missingness as outage vs isolated vs structural (label) — treatments differ.",
        ],
        hints: [
          "Outage signature: one week with many customers' minutes missing simultaneously — df[df.minutes_used.isna()].groupby('week').size() reveals it.",
          "Zero-fill is forbidden for usage: 0 minutes is a REAL alarm signal, not 'no data'. NaN and 0 mean opposite things here.",
          "Missing labels are unusable rows for supervised learning — count, exclude, report. No exceptions.",
        ],
        checkpoint: "A missingness-typology table with per-type treatment.",
      },
      {
        phase: "cleaning",
        title: "Build the supervised frame with the leakage firewall",
        goal: "Customer-week features from trailing windows; labels from the following month.",
        instructions: [
          "Apply repairs: seats within customer, NPS sentinel to NaN+flag, outage weeks marked, duplicates resolved.",
          "Build features at week t: trailing-4-week means, slopes (linear trend), max ticket spike, utilisation ratio.",
          "Join label from row t; verify the window arithmetic on one hand-checked customer.",
        ],
        hints: [
          "Slope features: fit per-customer linear trend over the trailing window (polyfit deg 1) — the decline signal.",
          "groupby('customer_id') with rolling(4) on a sorted panel; always shift() the label alignment explicitly and test one customer by hand.",
          "The hand-check IS the firewall: pick a churner, print their raw weeks, verify features contain nothing from the churn month.",
        ],
        checkpoint: "A supervised frame plus one hand-verified example row.",
        code: {
          label: "Feature build with firewall",
          language: "python",
          source: `df = df.sort_values(["customer_id", "week"])
g = df.groupby("customer_id")

feats = pd.DataFrame({
    "cust": df["customer_id"], "week": df["week"],
    "sessions_4w": g["sessions"].transform(lambda s: s.rolling(4, min_periods=2).mean()),
    "active_4w": g["active_days"].transform(lambda s: s.rolling(4, min_periods=2).mean()),
    "util": df["sessions"] / df["seats"].replace(0, np.nan),
    "featb_4w": g["feature_b_events"].transform(lambda s: s.rolling(4, min_periods=2).mean()),
})
feats["sessions_slope"] = g["sessions"].transform(
    lambda s: s.rolling(4, min_periods=3).apply(
        lambda w: np.polyfit(range(len(w)), w, 1)[0] if len(w) >= 3 else np.nan))
feats["label"] = df["churned_next_month"]
sup = feats.dropna(subset=["label"])`,
        },
      },
      {
        phase: "eda",
        title: "Trajectories and lead times",
        goal: "Event-aligned curves: when do churners diverge from stayers?",
        instructions: [
          "For each churner, find their final week; align usage metrics on weeks −8..0 relative to it.",
          "Build matched stayer curves (same plan/size); find the divergence week per metric.",
          "Tabulate lead vs lag: which metrics separate early (usable) vs late (confirmation only)?",
        ],
        hints: [
          "Event alignment: merge_asof or a rank-within-customer on week to final week; then groupby(relative_week).",
          "Matched stayers make the comparison fair — otherwise plan mix differences fake divergence.",
          "The divergence table IS the feature-selection evidence: metrics that only move in the last 2 weeks can't support a 4-week-early score.",
        ],
        checkpoint: "Divergence week per metric, charted and tabulated.",
        code: {
          label: "Event alignment",
          language: "python",
          source: `last_weeks = df.groupby("customer_id")["week"].max().rename("last_week")
aligned = df.merge(last_weeks, on="customer_id")
aligned["weeks_to_end"] = ((aligned["last_week"] - aligned["week"])
                           .dt.days / 7).round().astype(int)
curves = aligned[aligned["weeks_to_end"].between(-8, 0)].groupby(
    ["weeks_to_end", "churned_next_month"])["sessions"].mean().unstack()
print(curves.round(0))`,
        },
      },
      {
        phase: "statistics",
        title: "Model with time-aware honesty",
        goal: "Regularised classifier, forward-chained validation, calibration and thresholds.",
        instructions: [
          "Split by TIME (train on early months, validate later) — never shuffle-split this data.",
          "Fit class-weighted logistic (L2) and a tree model; compare AUC and PR-AUC out-of-fold.",
          "Threshold analysis: precision/recall by risk decile; choose the tier-1 operating point for CS capacity.",
          "Feature importance stability across folds — which components survive?",
        ],
        hints: [
          "TimeGroup split or manual: fit on months 1–4, validate 5, refit 1–5, validate 6 — forward chaining mimics deployment.",
          "At ~5% prevalence, PR-AUC and precision@k tell the truth better than ROC-AUC; report both.",
          "Calibration by decile: predicted rate vs actual rate — CS capacity planning needs trustworthy probabilities.",
        ],
        checkpoint: "Out-of-fold metrics, calibration table, chosen operating point, stable feature list.",
        code: {
          label: "Time-aware model",
          language: "python",
          source: `from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

FEATURES = ["sessions_4w", "active_4w", "util", "featb_4w", "sessions_slope"]
X, y = sup[FEATURES], sup["label"].astype(int)

# forward-chained validation by week halves
cut = sup["week"].quantile(0.7)
tr, te = sup["week"] <= cut, sup["week"] > cut
clf = make_pipeline(SimpleImputer(), StandardScaler(),
                    LogisticRegression(C=1.0, class_weight="balanced"))
clf.fit(X[tr], y[tr])
p = clf.predict_proba(X[te])[:, 1]
print("AUC:", roc_auc_score(y[te], p).round(3),
      "PR-AUC:", average_precision_score(y[te], p).round(3))`,
        },
      },
      {
        phase: "visualisation",
        title: "The model's evidence set",
        goal: "Trajectories, lead-time bars, PR curve with operating point, calibration, importances.",
        instructions: [
          "Five exhibits; the trajectory chart and PR curve carry the argument.",
          "Mark the chosen operating point and its precision/recall ON the curve.",
          "Annotate divergence week on the trajectory chart — it justifies the intervention window.",
        ],
        hints: [
          "Trajectory chart: two lines with CI bands, divergence week annotated with a vertical line.",
          "Precision@k curve (k = risk decile) is the CS-capacity chart: 'flag the top decile, expect ~30% precision'.",
          "Importance whiskers (min–max across folds) make stability visible — unstable bars argue against score components.",
        ],
        checkpoint: "Five exhibits, each tied to a finding.",
      },
      {
        phase: "interpretation",
        title: "From model to operating doctrine",
        goal: "What the score means, when it's wrong, and what it cannot see.",
        instructions: [
          "Translate performance into operational terms: 'flagging the top decile catches ~45% of churners; 30% of alerts are real'.",
          "Enumerate failure modes: new customers (no history), outage-damaged windows, win-back customers.",
          "State the invisible: pricing/competitive reasons for churn don't appear in telemetry — the score sees behaviour, not motivation.",
        ],
        hints: [
          "Operational translation is the VP's language: capacity, catch rate, false-alarm burden — not AUC.",
          "Failure modes deserve a table: mode, symptom, mitigation. It's what separates a deployable spec from a notebook.",
          "The invisible-reasons paragraph is intellectual honesty that buys trust — competitors poaching accounts leaves no telemetry trace.",
        ],
        checkpoint: "An operational translation, a failure-mode table, and the invisible-reasons paragraph.",
      },
      {
        phase: "recommendations",
        title: "The health-score spec",
        goal: "A deployable spec: components, tiers, thresholds, playbooks, monitoring.",
        instructions: [
          "Specify the score (components, weights from the model, weekly refresh) and three tiers with entry/exit rules.",
          "Map interventions per tier (CSM outreach / automated nudges / monitoring) sized to capacity.",
          "Include the drift-and-retrain plan with named metrics and thresholds.",
        ],
        hints: [
          "Score components should be few (3–5), interpretable and monitorable — a 40-feature score is a research artefact, not an ops tool.",
          "Tier entry/exit rules prevent alert fatigue: hysteresis (2 consecutive weeks in tier) beats single-week flips.",
          "The retrain trigger should be quantitative: calibration error > X points or AUC drop > Y on rolling evaluation.",
        ],
        checkpoint: "The complete spec with tier rules, playbooks and monitoring triggers.",
      },
      {
        phase: "report",
        title: "The churn programme pack",
        goal: "A VP-ready pack: evidence, honest metrics, deployable spec.",
        instructions: [
          "Follow the outline; open with the leading-window finding (it reframes churn from surprise to watchlist).",
          "The spec table is the climax; failure modes and monitoring belong in the body, not the appendix.",
          "Model cards and feature definitions in the appendix for the technically curious.",
        ],
        hints: [
          "One-sentence version: 'Churn telegraphs itself four to six weeks early through usage; here is the score that watches for it.'",
          "Honest-metrics framing: every number is out-of-fold and forward-in-time — say it once, prominently.",
          "Close with the deployment checklist (data feeds, tier rules, playbooks, monitoring) — the pack should end in action, not caveats.",
        ],
        checkpoint: "The complete programme pack, reproducible from the raw panel.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the CS analytics lead. The VP wants churn interventions that fire BEFORE customers leave. You own the task definition, the leakage discipline, the model and the deployable score spec. Every methodological choice documented; every metric honest (out-of-fold, forward in time).",
      deliverables: [
        "Panel audit and the supervised-frame construction (leakage firewall documented)",
        "Event-aligned trajectory analysis establishing lead times",
        "Time-aware model validation with honest metrics and calibration",
        "Health-score spec: components, tiers, thresholds, playbooks",
        "Failure-mode analysis and drift/retrain monitoring plan",
      ],
      guardrails: [
        "Features strictly pre-label-window; hand-verified example included",
        "No target imputation; missing labels excluded and counted",
        "Outage missingness never zero-filled",
        "Validation forward in time, never shuffled",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Feature windows cannot include the label month (verified by example)",
        "Validation split by time, not random",
        "Sentinel −999 excluded from numeric treatment",
      ],
      "code-quality": [
        "Rolling/shift operations on sorted panel with min_periods set",
        "Feature build vectorised and reusable",
      ],
      reasoning: [
        "Leading vs lagging distinction established empirically",
        "Precision@k interpreted for CS capacity, not just AUC",
      ],
      visualization: [
        "Trajectory chart shows divergence week explicitly",
        "Operating point marked on the PR/precision curve",
      ],
      interpretation: [
        "Score limitations and failure modes enumerated",
        "Probabilities calibrated and discussed before thresholds set",
      ],
      recommendations: [
        "Tier rules include entry/exit hysteresis",
        "Monitoring plan has quantitative retrain triggers",
      ],
    },
  },
];
