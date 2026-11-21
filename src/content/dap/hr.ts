/**
 * HR analytics projects — HR-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const HR_PROJECTS: DapProject[] = [
  /* ================================================================ HR-01 */
  {
    id: "hr-1",
    categoryId: "hr",
    difficulty: "beginner",
    code: "HR-01",
    title: "Attrition Snapshot & Signals",
    subtitle: "Fifteen hundred employees: who left this year, and what did they have in common?",
    summary:
      "A first people-analytics project: clean an employee snapshot, measure attrition by department, level and tenure, profile the leavers, and recommend retention actions that respect the data's limits.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["People metrics", "Attrition analysis", "Segment rates", "Bar charts", "Privacy-aware recommendations"],

    businessBackground:
      "Northwind Logistics lost 18% of its workforce last year and the HR director can't say precisely who or why: exit interviews are anecdotal, department heads each blame something different, and the board wants a retention plan at the next meeting. A snapshot of the employee base with attrition flags, tenure, pay, commute and role attributes is available. The HR director wants the attrition pattern mapped — who leaves, from where, at what tenure — with the privacy line respected: aggregate patterns, never individual callouts.",
    problemStatement:
      "Quantify attrition from the employee snapshot: overall and segment-level attrition rates (department, level, tenure, pay band, overtime, commute); the profile of leavers versus stayers; and the segments where retention effort would matter most — delivered as a board-ready attrition review with privacy guardrails stated.",
    businessObjectives: [
      "Compute attrition rates by department, job level, tenure band and demographic-safe attributes",
      "Profile leavers vs stayers on pay, overtime, commute and stock level",
      "Identify the highest-risk segments (rate × headcount × replaceability)",
      "Size the attrition problem in headcount and approximate replacement cost",
      "Deliver a retention recommendation set with privacy guardrails and measurement plan",
    ],
    datasetDescription:
      "~1,500 employee records: each row an employee with department, level, tenure, age band, gender, commute, monthly income (partly currency-formatted), overtime, stock level, attrition flag and performance rating. The attrition column mixes encodings, some tenures are impossible (longer than careers), incomes mix formats, gender codes are inconsistent, and duplicates exist — plus a 0-rating sentinel worth treating with care.",
    dataDictionary: [
      { column: "employee_id", kind: "id", description: "Employee identifier", example: "148" },
      { column: "department", kind: "categorical", description: "Department (casing variants)", example: "Engineering" },
      { column: "job_level", kind: "categorical", description: "Level L1–L5", example: "L3" },
      { column: "tenure_years", kind: "decimal", description: "Years of service (impossible values exist)", example: "4.2" },
      { column: "age_band", kind: "categorical", description: "Age band", example: "26-35" },
      { column: "gender", kind: "categorical", description: "Gender (single-letter codes mixed in)", example: "Female" },
      { column: "commute_km", kind: "decimal", description: "One-way commute distance (some missing)", example: "12.4" },
      { column: "monthly_income", kind: "currency", description: "Monthly income (format mix)", example: "$6,240" },
      { column: "overtime_last_quarter", kind: "boolean", description: "Worked overtime last quarter", example: "1" },
      { column: "stock_level", kind: "integer", description: "Equity grant tier 0–3", example: "1" },
      { column: "attrition", kind: "categorical", description: "Left the company (mixed encodings)", example: "Yes" },
      { column: "performance_rating", kind: "integer", description: "Last rating 1–5 (0 = unrated)", example: "3" },
    ],
    initialQuestions: [
      "What is the overall attrition rate, and which departments and levels run hottest?",
      "How does attrition vary by tenure band — where in the employee lifecycle do people leave?",
      "Do pay, overtime and commute differ between leavers and stayers?",
      "Which segments combine high attrition with high headcount (the retention priority list)?",
      "What retention actions does the evidence support, and what should HR measure next?",
    ],
    dataset: {
      name: "Northwind employee snapshot",
      filename: "hr-01-attrition-snapshot.csv",
      description: "Employee-level snapshot with attrition flags and role attributes.",
      rows: 1500,
    },

    dataQuality: [
      { issue: "Mixed attrition encodings", where: "attrition — 'Yes'/'1'/'No'/'0'", detection: "value_counts(dropna=False)", treatment: "Map to boolean with a full dict; assert complete — the outcome column must be airtight." },
      { issue: "Impossible tenures", where: "tenure_years > 45", detection: "describe(); box plot", treatment: "Exclude from tenure analysis (counted); likely data-entry errors (decimal shifts).",
      },
      { issue: "Currency-formatted incomes", where: "monthly_income — '$6,240' strings", detection: "dtype object; contains('$')", treatment: "Strip and numericise; verify zero coercion losses." },
      { issue: "Gender code variants", where: "gender — 'F'/'M' mixed with full labels", detection: "value_counts()", treatment: "Canonical map; document the mapping." },
      { issue: "Zero performance ratings", where: "performance_rating == 0", detection: "value_counts()", treatment: "0 is a 'not yet rated' sentinel, not a score: map to NaN + rated flag." },
      { issue: "Duplicate employees", where: "~0.9% duplicated rows", detection: "duplicated('employee_id').sum()", treatment: "Drop; headcount denominators must be unique." },
      { issue: "Missing commute", where: "commute_km — ~5%", detection: "isna().sum()", treatment: "Keep rows, exclude from commute analysis; note it." },
    ],
    cleaningPlan: [
      { action: "Map attrition to boolean; canonicalise gender and department; deduplicate", rationale: "Outcome, segments and denominators single-encoded before any rate." },
      { action: "Numericise income; resolve the rating sentinel; exclude impossible tenures (counted)", rationale: "Each defect poisons a specific metric; treat each deliberately." },
      { action: "Derive tenure bands (0-1, 1-3, 3-5, 5-10, 10+) and pay quartiles", rationale: "The lifecycle and pay stories read in bands, not raw decimals." },
      { action: "Keep aggregate-only discipline: no output that identifies an individual", rationale: "Privacy is a design constraint in people analytics, not an afterthought." },
    ],
    edaPlan: [
      { question: "Overall and department rates", method: "attrition mean overall; groupby(department) with counts", expectation: "~18% overall; Support and Sales hottest." },
      { question: "Level pattern", method: "groupby(job_level)", expectation: "L1 attrites at ~2× L4/L5 — early-career churn." },
      { question: "Tenure lifecycle", method: "attrition by tenure band", expectation: "First-year peak (25%+), declining with tenure — the classic curve." },
      { question: "Leaver profile", method: "leavers vs stayers: income, overtime, commute, stock", expectation: "Leavers: lower income, more overtime, less stock — the squeeze pattern." },
      { question: "Rating context", method: "attrition by rating (rated only)", expectation: "Attrition concentrated in mid ratings (3s), not lows — regrettable attrition hint." },
    ],
    statisticsPlan: [
      { technique: "Segment rates with Wilson CIs", purpose: "Honest comparisons across unequal segments", expectation: "Support's lead survives its interval; some small departments' don't." },
      { technique: "Leaver-stayer comparison (t-test / Mann-Whitney on income and commute)", purpose: "Confirm the profile differences", expectation: "Income gap significant; commute gap modest." },
      { technique: "Priority matrix (rate × headcount × replacement cost proxy)", purpose: "Rank retention targets by business impact", expectation: "Support L1-L2 and Sales L2 top the priority list." },
    ],
    visualisationPlan: [
      { chart: "Bar — attrition by department with counts", answers: "Where is the leak?", reads: "Sorted bars with n= labels; the top department named." },
      { chart: "Line/bar — attrition by tenure band (the lifecycle curve)", answers: "When do people leave?", reads: "First-year peak declining right — the onboarding window." },
      { chart: "Grouped bar — leavers vs stayers on income quartile and overtime", answers: "Who is leaving?", reads: "The squeeze pattern: lower pay, more overtime among leavers." },
      { chart: "Box plot — income by attrition within level", answers: "Is it pay-for-level drift?", reads: "Within-level income gaps between leavers and stayers." },
      { chart: "Priority matrix scatter — attrition rate vs headcount by segment", answers: "Where should retention aim?", reads: "Upper-right bubbles = the priority list." },
    ],
    findings: [
      "Overall attrition runs ~18% with a steep structural gradient: Support and Sales departments and the L1–L2 levels run 1.5–2× the company average.",
      "The lifecycle is the story: first-year attrition exceeds 25%, falling sharply with tenure — the retention battle is won or lost in year one.",
      "Leavers are systematically different from stayers: lower income within their levels, more overtime, and lower stock tiers — the squeeze pattern of early-career, under-equity roles.",
      "Attrition concentrates in mid-rated employees, not low performers: much of the loss is plausibly regrettable (good people leaving), though exit data can't prove intent.",
      "The priority matrix puts Support L1–L2 and Sales L2 at the top: high rates, material headcount, and customer-facing replaceability costs.",
    ],
    recommendations: [
      { what: "Build a 90-day onboarding programme with role clarity and a first-project milestone for L1–L2 roles", why: "First-year attrition is the peak; the window where intervention changes trajectories.", impact: "Targets the largest attrition pool", horizon: "this quarter" },
      { what: "Audit pay-position-within-level for Support and Sales L1–L2 (market benchmark the bottom quartile)", why: "Leavers earn less within their levels — pay-position drift is the measurable mechanism.", impact: "Addresses the squeeze pattern directly", horizon: "this quarter" },
      { what: "Cap sustained overtime in the hot segments and monitor it quarterly", why: "Overtime marks the leaver profile; sustained overload is a leading indicator.", impact: "Early-warning plus workload relief", horizon: "immediate" },
      { what: "Stand up exit-interview coding analysis and a quarterly attrition dashboard (segments, tenure curve, regrettable share)", why: "This snapshot shows who leaves; the dashboard keeps the question answered continuously.", impact: "Retention management as a process", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Northwind's 18% attrition is concentrated, not random. It peaks in the first year (25%+), concentrates in Support and Sales at L1–L2, and carries a consistent profile — lower income within level, more overtime, less equity — the signature of early-career squeeze rather than low-performance exits (mid-rated employees dominate the leavers). The retention plan follows the concentration: a 90-day onboarding programme for early-career roles, a pay-position audit for the hot segments, overtime caps with quarterly monitoring, and a standing attrition dashboard to keep the picture current. All figures are aggregate-only, computed on a deduplicated, format-cleaned snapshot; the privacy guardrails are stated in the methods box.",
      structure: [
        "1. Objective, definitions and privacy guardrails",
        "2. Data and quality treatment",
        "3. Attrition by department, level and tenure",
        "4. The leaver profile (pay, overtime, equity)",
        "5. The priority matrix",
        "6. Retention recommendations and measurement plan",
        "7. Appendix: cleaning log, encoding map, exclusions",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the snapshot — and the privacy line",
        goal: "Profile the data and set the aggregate-only discipline.",
        instructions: [
          "Profile; list attrition encodings; check dtypes on income.",
          "Write the privacy guardrail: outputs are aggregate patterns (minimum group sizes), never individual identification — it shapes every table you build.",
          "Note the analysis grain: one row = one employee; rates use headcount denominators.",
        ],
        hints: [
          "People analytics rule zero: the dataset is people. Aggregate-only from the first line of code — min cell sizes (e.g., n ≥ 5) in every published table.",
          "The attrition column has the same four-encoding disease as every HR export: map explicitly, assert complete.",
          "Ask what a rate means here: employees who left during the window over all employees — the denominator is the full snapshot, not just leavers.",
        ],
        checkpoint: "Encoding census, privacy guardrail written, grain confirmed.",
        code: {
          label: "Profile the snapshot",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("hr-01-attrition-snapshot.csv")
print(df.shape)
print(df["attrition"].value_counts(dropna=False))
print("dupes:", df.duplicated("employee_id").sum())
print("impossible tenure:", (df["tenure_years"] > 45).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the HR export",
        goal: "Seven defect families counted with treatments.",
        instructions: [
          "Quantify each defect: encodings, impossible tenures, income formats, gender codes, rating sentinel, duplicates, missing commute.",
          "Decide the rating-sentinel treatment (0 → unrated, not a score).",
          "Assemble the audit table for the appendix.",
        ],
        hints: [
          "The rating sentinel is subtle: a 0 average looks like terrible performance when it means 'not rated' — map to NaN and keep a rated flag.",
          "Impossible tenures: exclude from the lifecycle analysis but keep in headcount rates — different metrics, different subsets.",
          "Income format: strip-cast-verify; the pay story depends on it.",
        ],
        checkpoint: "The seven-row audit table with decided treatments.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Canonical frame with boolean attrition, bands and quartiles.",
        instructions: [
          "Apply all fixes; derive tenure bands and pay quartiles.",
          "Verify the overall attrition rate on the clean frame — the report's first number.",
          "Keep the min-cell-size rule in mind for every table to come.",
        ],
        hints: [
          "Tenure bands: [0, 1, 3, 5, 10, 99] — the lifecycle curve reads best with a first-year cell.",
          "Pay quartiles computed within level (an L1 in the bottom company quartile is normal; within-level position is the signal).",
          "Overall rate computed once, quoted everywhere consistently.",
        ],
        checkpoint: "Clean frame with bands and within-level pay position.",
        code: {
          label: "Canonical frame",
          language: "python",
          source: `ATT = {"Yes": True, "1": True, "No": False, "0": False}
clean = df.drop_duplicates("employee_id").copy()
clean["left"] = clean["attrition"].map(ATT)
assert clean["left"].notna().all()
clean["department"] = clean["department"].str.title()
clean["income"] = pd.to_numeric(
    clean["monthly_income"].astype(str).str.replace(r"[$,]", "", regex=True))
clean["rating_rated"] = clean["performance_rating"] > 0
clean.loc[~clean["rating_rated"], "performance_rating"] = np.nan

clean["tenure_band"] = pd.cut(clean["tenure_years"], [0, 1, 3, 5, 10, 99],
    labels=["0-1y", "1-3y", "3-5y", "5-10y", "10y+"], right=False)
print(f"overall attrition: {clean['left'].mean():.1%}")`,
        },
      },
      {
        phase: "eda",
        title: "Map the attrition pattern",
        goal: "Segment rates, lifecycle curve, leaver profile.",
        instructions: [
          "Rates by department, level, tenure band — with counts, min cell sizes respected.",
          "Leaver-stayer comparison: income (within level), overtime, commute, stock.",
          "Rating context: attrition by rating among rated employees.",
        ],
        hints: [
          "The lifecycle curve is the report's spine: attrition by tenure band usually tells the whole story.",
          "Within-level income comparison: leavers vs stayers at the SAME level — that's the pay-position signal.",
          "The rating view needs the rated-only filter (the sentinel would fake a low-performer cluster).",
        ],
        checkpoint: "Segment rates, lifecycle curve, leaver profile established.",
        code: {
          label: "Lifecycle curve",
          language: "python",
          source: `def rate(frame, col):
    t = frame.groupby(col, observed=True)["left"].agg(["mean", "count"])
    return t[t["count"] >= 5]  # min cell size

for c in ["department", "job_level", "tenure_band"]:
    print(f"\\n{c}:\\n{rate(clean, c).round(3)}")

print(clean.groupby("left")[["income", "overtime_last_quarter", "stock_level"]].mean().round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "Intervals and the priority matrix",
        goal: "Wilson CIs, profile tests, and the business-impact ranking.",
        instructions: [
          "Wilson CIs on department and level rates; note which gaps are noise.",
          "Mann-Whitney (or t-test) on within-level income by attrition.",
          "Priority matrix: segment attrition rate × headcount, with replacement-cost context (customer-facing weight).",
        ],
        hints: [
          "proportion_confint beside every published rate — the board will probe the small departments.",
          "Within-level income test: run per level or with level as a stratification; the pooled test mixes L1 and L5 economics.",
          "Priority matrix: rate alone misleads (a 30% rate on 8 people is noise); rate × headcount ranks where the volume is.",
        ],
        checkpoint: "Intervalled rates, the income test, and the priority ranking.",
      },
      {
        phase: "visualisation",
        title: "The board exhibits",
        goal: "Five charts led by the lifecycle curve.",
        instructions: [
          "Department bars (n≥5 labelled); lifecycle curve; leaver-stayer profile pairs; within-level income boxes; priority scatter.",
          "Title charts with takeaways ('One in four first-year employees leaves').",
          "Respect min cell sizes visually — no chart of an n=3 department.",
        ],
        hints: [
          "The lifecycle curve is one bar series — resist decorating it.",
          "Profile pairs normalise each metric to the stayer baseline (ratio or % difference) so one chart shows the whole squeeze pattern.",
          "Priority scatter: x = attrition rate, y = headcount, bubble size = replacement-cost proxy, labelled segments only.",
        ],
        checkpoint: "Five exhibits with the lifecycle curve polished.",
      },
      {
        phase: "interpretation",
        title: "Read the pattern honestly",
        goal: "Findings with rates, intervals and the regrettable-attrition caveat.",
        instructions: [
          "Answer the five questions; caveat the snapshot limits (no time-to-leave, no exit reasons in this data).",
          "Frame the mid-rating finding carefully: suggestive of regrettable attrition, not proof of intent.",
          "Draft the board's one-paragraph story.",
        ],
        hints: [
          "Snapshot honesty: we see WHO left, not WHY — the exit-interview analysis is the recommended next data asset.",
          "The regrettable-attrition claim needs its qualifier: mid-rated leavers are consistent with good-people-leaving, and also with rating inflation.",
          "The repeatable paragraph: 'Attrition peaks in year one, concentrates in Support and Sales early-career roles, and follows a lower-pay-higher-overtime profile.'",
        ],
        checkpoint: "Five answered questions with caveats and the story paragraph.",
      },
      {
        phase: "recommendations",
        title: "The retention plan",
        goal: "Actions tied to segments with success metrics.",
        instructions: [
          "Recommend the onboarding programme, pay-position audit, overtime caps, and the dashboard.",
          "Each action: target segment, mechanism, success metric, owner-type.",
          "Include the measurement agenda (exit-interview coding, regrettable-attrition tracking).",
        ],
        hints: [
          "Onboarding metric: first-year attrition in target segments vs current baseline, reviewed at two quarters.",
          "Pay audit is an audit, not an automatic raise: benchmark bottom-of-band positions within level and decide deliberately.",
          "The dashboard recommendation outlives the plan — retention becomes a managed metric, not an annual surprise.",
        ],
        checkpoint: "The plan with segments, metrics and owners.",
      },
      {
        phase: "report",
        title: "The board attrition review",
        goal: "A board-ready review with the privacy box on page one.",
        instructions: [
          "Structure: definitions & privacy → headline → lifecycle → segments → profile → priority → plan.",
          "Lifecycle curve as the body chart; audit table in the appendix.",
          "Keep every table aggregate with min cell sizes stated in the methods box.",
        ],
        hints: [
          "Boards quote one number — give them the first-year attrition rate as the headline.",
          "The methods box (privacy, definitions, exclusions) is what lets this survive an HR-policy review.",
          "Date-stamp and version: attrition snapshots become the baseline for next year's comparison.",
        ],
        checkpoint: "The review, every figure traceable and privacy-clean.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the HR director's analyst. Map the attrition pattern for the board: segment rates, the lifecycle curve, the leaver profile, and a retention plan — with aggregate-only privacy discipline throughout. Band definitions and the priority-matrix method are yours, documented.",
      deliverables: [
        "Snapshot audit and cleaning log (including sentinel treatment)",
        "Attrition rates by department, level and tenure band (min cell sizes, intervals)",
        "Leaver-stayer profile including within-level income position",
        "Priority matrix ranking retention targets",
        "Retention plan with target segments, success metrics and the measurement agenda",
      ],
      guardrails: [
        "Aggregate-only outputs with minimum cell sizes",
        "Attrition encodings mapped with assertions",
        "Rating sentinel resolved before any rating analysis",
        "Snapshot limits (no why, no when) stated",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Attrition mapped to boolean before rates; unique headcount denominators",
        "Within-level pay comparisons control for level",
        "Priority ranking combines rate with headcount",
      ],
      "code-quality": [
        "Rate helper with min cell size enforced",
        "Sentinel and encoding handling explicit",
      ],
      reasoning: [
        "Lifecycle interpretation (first-year peak) as the structural story",
        "Regrettable-attrition claim properly qualified",
      ],
      visualization: [
        "Lifecycle curve as the lead exhibit",
        "Profile comparison normalised across metrics",
      ],
      interpretation: [
        "Squeeze pattern (pay, overtime, equity) articulated",
        "Snapshot limits stated up front",
      ],
      recommendations: [
        "Actions tied to named segments with metrics",
        "Measurement agenda (exit coding, dashboard) included",
      ],
    },
  },

  /* ================================================================ HR-02 */
  {
    id: "hr-2",
    categoryId: "hr",
    difficulty: "intermediate",
    code: "HR-02",
    title: "Hiring Funnel & Time-to-Hire",
    subtitle: "Nine thousand applications: where the funnel leaks, how long it runs, and which sources deliver.",
    summary:
      "Recruitment analytics: rebuild the hiring funnel from application stage dates, measure conversion and time-to-hire by job family and source, diagnose the bottlenecks, and recommend the process changes recruiters can feel.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Funnel reconstruction", "Duration analysis", "Source quality", "Process diagnostics", "Recruiting recommendations"],

    businessBackground:
      "Lumen Systems is hiring aggressively but painfully: time-to-hire has drifted from 30 to 50+ days, hiring managers complain candidates vanish for weeks between stages, and recruiting's defence is 'the market is hard'. The talent-ops lead suspects the process, not the market, and has pulled the full application-level export with stage dates for the last year. The mandate: rebuild the funnel honestly, find where time goes and where candidates drop, and recommend the two or three process changes that would actually move time-to-hire.",
    problemStatement:
      "Reconstruct the hiring funnel from stage dates: stage-by-stage conversion by job family, level and source; time-to-hire decomposed into stage durations (where do the weeks go?); source quality (speed vs pass-through); and the bottleneck diagnosis — delivered as a recruiting review with process recommendations and their expected time savings.",
    businessObjectives: [
      "Reconstruct the funnel (applied → screen → onsite → offer → hire) from stage dates",
      "Compute stage conversion and drop-off by family, level and source",
      "Decompose time-to-hire into stage durations; identify the biggest time sinks",
      "Compare source quality: conversion, speed and volume trade-offs",
      "Deliver process recommendations with expected time-to-hire impact",
    ],
    datasetDescription:
      "~9,000 applications across ~35 requisitions: each row an application with req and job family, level, source, applied date and the dates each stage was reached, plus offer/hire dates, withdrawal and rejection fields. Stage dates are messy reality: some onsites predate applications (entry errors), withdrawn labels mix encodings, sources have gaps, duplicates exist, and some rejected candidates show later-stage dates (process data debt).",
    dataDictionary: [
      { column: "application_id", kind: "id", description: "Application identifier", example: "300482" },
      { column: "req_id", kind: "id", description: "Requisition identifier", example: "REQ-214" },
      { column: "job_family", kind: "categorical", description: "Job family", example: "Software Engineering" },
      { column: "level", kind: "categorical", description: "Junior / Mid / Senior / Lead", example: "Senior" },
      { column: "source", kind: "categorical", description: "Acquisition source (some missing)", example: "Referral" },
      { column: "applied_date", kind: "date", description: "Application date", example: "2025-03-14" },
      { column: "phone_screen_date", kind: "date", description: "Phone screen date (blank = not reached)", example: "2025-03-21" },
      { column: "onsite_date", kind: "date", description: "Onsite date (a few precede application)", example: "2025-04-08" },
      { column: "offer_date", kind: "date", description: "Offer date", example: "2025-04-25" },
      { column: "hire_date", kind: "date", description: "Hire date", example: "2025-05-12" },
      { column: "stage_reached", kind: "categorical", description: "Furthest stage (derived; verify)", example: "Onsite" },
      { column: "withdrawn", kind: "categorical", description: "Candidate withdrew (mixed encodings)", example: "Yes" },
      { column: "rejected_reason", kind: "categorical", description: "Reason code (some blank)", example: "Failed stage" },
      { column: "recruiter", kind: "categorical", description: "Recruiter", example: "Priya N." },
      { column: "rehire", kind: "boolean", description: "Internal rehire flag", example: "0" },
    ],
    initialQuestions: [
      "What are stage-by-stage conversion rates, and where does the funnel leak most?",
      "How does the funnel differ by job family, level and source?",
      "How does time-to-hire decompose into stage durations — which stage eats the weeks?",
      "What is the withdrawal pattern (stage, timing) and how much time does it waste?",
      "Which two or three process changes would most reduce time-to-hire?",
    ],
    dataset: {
      name: "Lumen applications export",
      filename: "hr-02-hiring-funnel.csv",
      description: "1 year of applications with stage dates, sources and outcomes.",
      rows: 9000,
    },

    dataQuality: [
      { issue: "Onsite before application", where: "onsite_date < applied_date", detection: "compare dates", treatment: "Impossible chronology: exclude from duration analysis (counted); a data-entry defect worth reporting — never 'fix' by swapping." },
      { issue: "Mixed withdrawn encodings", where: "withdrawn — 'TRUE'/'Yes' variants", detection: "value_counts()", treatment: "Map to boolean; withdrawal is an outcome, keep it clean." },
      { issue: "Stage dates after rejection", where: "later-stage dates on rejected applications", detection: "cross-check stage_reached vs date presence", treatment: "Process data debt: use the EARLIEST consistent stage interpretation; document the rule and count affected rows." },
      { issue: "Missing source", where: "source — ~6%", detection: "isna().sum()", treatment: "Label 'Unknown'; exclude from source analysis only." },
      { issue: "Duplicate applications", where: "~0.7% duplicated rows", detection: "duplicated('application_id').sum()", treatment: "Drop; funnel math counts applications once." },
      { issue: "stage_reached vs dates consistency", where: "derived column vs actual dates", detection: "recompute stage from dates; compare", treatment: "Rebuild stage from dates (single source of truth); report disagreement count." },
    ],
    cleaningPlan: [
      { action: "Deduplicate; map withdrawal; rebuild stage_reached from date presence", rationale: "The funnel is computed from stages — one canonical derivation, disagreements disclosed." },
      { action: "Exclude impossible chronology from duration analysis (counted)", rationale: "Durations on impossible dates are nonsense; exclusions visible." },
      { action: "Derive stage durations: applied→screen, screen→onsite, onsite→offer, offer→hire", rationale: "Time-to-hire decomposes into these four legs — the diagnostic frame." },
      { action: "Derive time-in-stage for non-hires (where the process stalls for the fallen)", rationale: "Drop-off timing is part of the leak story." },
    ],
    edaPlan: [
      { question: "Funnel shape", method: "stage counts and conversion rates overall", expectation: "Applied→screen ~58%, screen→onsite ~32%, onsite→offer ~28%, offer→hire ~74%." },
      { question: "Family and level splits", method: "conversion by job family and level", expectation: "Data & Analytics converts best; Senior converts worse at screen (higher bar) but better at offer." },
      { question: "Time decomposition", method: "median duration per stage leg, overall and by family", expectation: "Screen→onsite is the whale: ~2+ weeks median, long tail." },
      { question: "Withdrawal pattern", method: "withdrawal rate by stage and timing", expectation: "Withdrawals cluster after onsite (candidate patience runs out) and in long gaps." },
      { question: "Source economics", method: "source × (volume, conversion, median time-to-hire)", expectation: "Referral: low volume, high conversion; Agencies: fast but expensive-quality; Job boards: volume, weak screen pass." },
      { question: "Recruiter load", method: "applications and hires per recruiter", expectation: "Load imbalance visible — context for process fixes." },
    ],
    statisticsPlan: [
      { technique: "Funnel conversion with Wilson CIs by segment", purpose: "Honest stage comparisons", expectation: "Screen pass differences by family significant; some level cells noisier." },
      { technique: "Duration decomposition (medians and P90s per leg)", purpose: "Locate the time sinks with tail awareness", expectation: "Screen→onsite median ~15 days with P90 ~30 — the target." },
      { technique: "Gap-withdrawal association", purpose: "withdrawal rate by gap-length bucket between stages", expectation: "Withdrawal risk rises with inter-stage gaps — the patience decay curve." },
      { technique: "Counterfactual time savings", purpose: "Size the recommendation's impact", expectation: "Cutting screen→onsite to 10 days saves ~5–7 days median time-to-hire." },
    ],
    visualisationPlan: [
      { chart: "Funnel bar — applications reaching each stage, with conversion labels", answers: "Where does the funnel thin?", reads: "Stage bars with step-conversion annotated." },
      { chart: "Horizontal bar — median + P90 duration per stage leg", answers: "Where do the weeks go?", reads: "The screen→onsite leg dominating; whiskers show the tail." },
      { chart: "Grouped bar — conversion by source at key stages", answers: "Which sources deliver?", reads: "Source comparison at screen and onsite pass." },
      { chart: "Line — withdrawal rate by inter-stage gap length", answers: "When do candidates give up?", reads: "Rising curve with the patience threshold annotated." },
      { chart: "Box plot — time-to-hire by job family", answers: "Which roles hire slowest?", reads: "Family spread; the slowest family named." },
    ],
    findings: [
      "The funnel's tightest constraint is early: only ~58% of applications reach a screen, and screen-to-onsite conversion (~32%) is the stage where family and source differences concentrate.",
      "Time-to-hire's weeks live in one leg: screen→onsite runs a ~15-day median against 4–6 days for the other legs — scheduling and interviewer availability, not offer negotiation, are the bottleneck.",
      "Candidate patience decays measurably: withdrawal rates rise steadily with inter-stage gaps, roughly doubling once a gap passes two weeks — the process is actively converting its best applicants into withdrawals.",
      "Source economics differ sharply: referrals convert best and hire fastest at low volume; agencies buy speed with weaker screen pass-through; job boards supply volume that mostly fails screens.",
      "The derived stage column disagrees with the dates on a visible share of records — the export's own stage field is unreliable, and every downstream report built on it (including the old dashboard) inherits the error.",
    ],
    recommendations: [
      { what: "Attack the screen→onsite leg: interviewer-pool scheduling with calendar holds, and a 5-business-day scheduling SLA", why: "The leg holds ~60% of total elapsed time; scheduling, not selection, is the mechanism.", impact: "~5–7 days off median time-to-hire", horizon: "immediate" },
      { what: "Set a 10-business-day stage-gap alert on every open application, with recruiter ownership", why: "Withdrawal risk doubles past two-week gaps; alerts catch the patience decay before candidates do.", impact: "Directly reduces post-onsite withdrawals", horizon: "immediate" },
      { what: "Rebalance sourcing: grow the referral programme and tighten job-board screening criteria", why: "Referrals convert best; job-board volume mostly fails screens and burns screening capacity.", impact: "Better funnel yield per recruiter hour", horizon: "this quarter" },
      { what: "Rebuild the ATS stage field from dates and fix the audit's chronology defects", why: "The dashboard underestimates time-to-hire today because stages and dates disagree.", impact: "Restores reporting integrity", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Lumen's slow hiring is a process artefact, not a market fact. Time-to-hire concentrates in a single leg — phone screen to onsite, ~15 median days against 4–6 for every other stage — driven by scheduling rather than selection. The cost compounds: withdrawal risk roughly doubles once inter-stage gaps pass two weeks, so the bottleneck actively converts strong applicants into withdrawals. Sourcing economics reinforce the story: referrals convert best and move fastest while job-board volume mostly fails screens. The plan: a scheduling SLA with calendar holds on the screen→onsite leg, a 10-day gap alert per application, sourcing rebalanced toward referrals, and the ATS stage field rebuilt from dates — the current dashboard's foundation is the export's least reliable column.",
      structure: [
        "1. The talent-ops question and scope",
        "2. Data reconstruction: stage derivation and quality treatment",
        "3. Funnel shape and conversion by family, level, source",
        "4. Time decomposition: the weeks and where they live",
        "5. The patience decay: gaps and withdrawals",
        "6. Source economics",
        "7. Process recommendations with expected time savings",
        "8. Appendix: cleaning log, stage-derivation rule, ATS defect list",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Rebuild the funnel's truth",
        goal: "Derive stages from dates; distrust the supplied stage column.",
        instructions: [
          "Profile; count impossible chronology; check the derived stage column against date-presence truth.",
          "Write the stage-derivation rule: stage = furthest date present, with the chronology constraints.",
          "Note the two durations that matter: legs between stages (hires) and stalls before drop-off (non-hires).",
        ],
        hints: [
          "Rebuilding the derived column from raw dates is this project's first principle — the disagreement count becomes an ATS-defect finding.",
          "Stage presence = date not null; furthest present = stage reached. Chronology violations get excluded and counted, not patched.",
          "Two time stories: how long hires take (legs), and how long the fallen waited before falling (stalls).",
        ],
        checkpoint: "Stage-derivation rule, disagreement count, chronology census.",
        code: {
          label: "Stage derivation",
          language: "python",
          source: `df = pd.read_csv("hr-02-hiring-funnel.csv", parse_dates=["applied_date", "phone_screen_date", "onsite_date", "offer_date", "hire_date"])
print("onsite before applied:", (df["onsite_date"] < df["applied_date"]).sum())
print("dupes:", df.duplicated("application_id").sum())

def stage(row):
    if pd.notna(row["hire_date"]): return "Hired"
    if pd.notna(row["offer_date"]): return "Offer"
    if pd.notna(row["onsite_date"]): return "Onsite"
    if pd.notna(row["phone_screen_date"]): return "Screen"
    return "Applied"
df["stage_true"] = df.apply(stage, axis=1)
print("disagreements:", (df["stage_true"] != df["stage_reached"].str.title()).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the application data",
        goal: "Chronology, encodings, late-stage dates, duplicates — each with a funnel consequence.",
        instructions: [
          "Quantify each defect family and its affected metric.",
          "Decide the rejected-but-later-dates rule (earliest consistent stage).",
          "Write the ATS defect list — it's a deliverable for the systems team.",
        ],
        hints: [
          "Rejected applications showing offer dates are process debt: the rule 'earliest consistent stage' is defensible and documented.",
          "Missing sources: 'Unknown' label, excluded only from source tables.",
          "The defect list format from previous projects applies: defect, rows, affected metric, treatment.",
        ],
        checkpoint: "The audit table with the ATS defect list.",
      },
      {
        phase: "cleaning",
        title: "Build the funnel and duration frames",
        goal: "Clean applications with derived stages and stage-leg durations.",
        instructions: [
          "Apply treatments; build the funnel frame (all applications) and the duration frame (chronology-valid).",
          "Derive the four legs for hires and the stall durations for non-hires.",
          "Verify: no negative durations in the analysis frame (assert).",
        ],
        hints: [
          "Legs: (screen − applied), (onsite − screen), (offer − onsite), (hire − offer) in days — hires only for the time-to-hire story.",
          "Stalls for non-hires: days from last completed stage to the data cutoff (or the stage where they fell) — the drop-off timing.",
          "The assert on non-negative durations is your chronology firewall.",
        ],
        checkpoint: "Both frames built with verified durations.",
        code: {
          label: "Duration frame",
          language: "python",
          source: `WD = {"Yes": True, "TRUE": True, "No": False, "FALSE": False}
clean = df.drop_duplicates("application_id").copy()
clean["withdrawn_b"] = clean["withdrawn"].map(WD)
valid = clean[~((clean["onsite_date"] < clean["applied_date"]) |
                (clean["phone_screen_date"] < clean["applied_date"]))].copy()

hires = valid[valid["stage_true"] == "Hired"].copy()
hires["leg_screen"] = (hires["phone_screen_date"] - hires["applied_date"]).dt.days
hires["leg_onsite"] = (hires["onsite_date"] - hires["phone_screen_date"]).dt.days
hires["leg_offer"] = (hires["offer_date"] - hires["onsite_date"]).dt.days
hires["leg_hire"] = (hires["hire_date"] - hires["offer_date"]).dt.days
legs = ["leg_screen", "leg_onsite", "leg_offer", "leg_hire"]
assert (hires[legs] >= 0).all().all()`,
        },
      },
      {
        phase: "eda",
        title: "Funnel, time and patience",
        goal: "Conversion by segment, the time decomposition, the withdrawal curve.",
        instructions: [
          "Funnel conversion overall and by family/level/source (counts beside rates).",
          "Median and P90 per leg; total time-to-hire by family.",
          "Withdrawal rate by stage and by inter-stage gap length — the patience decay.",
        ],
        hints: [
          "Conversion at stage n = reached(n+1) / reached(n) — write the helper once, apply to every segment.",
          "Legs table: median AND P90 — process people plan for the median and get destroyed by the tail.",
          "Gap analysis: for each completed stage, days to next event (or cutoff); bucket and take withdrawal rates — the decay curve is the persuasion exhibit.",
        ],
        checkpoint: "Conversion tables, legs decomposition, the patience curve.",
        code: {
          label: "Legs decomposition",
          language: "python",
          source: `print(hires[legs].agg(["median", lambda s: s.quantile(0.9)]).round(1))

conv = clean.groupby("job_family")["stage_true"].value_counts().unstack()
STAGES = ["Applied", "Screen", "Onsite", "Offer", "Hired"]
conv = conv.reindex(columns=STAGES, fill_value=0)
print((conv.pct_change(axis=1) * -100 + 100).round(1))  # rough stage survival
print(clean.groupby(clean["withdrawn_b"])["stage_true"].value_counts(normalize=True).round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "Diagnose and size the fix",
        goal: "Conversion tests, gap-withdrawal association, counterfactual savings.",
        instructions: [
          "Wilson CIs on key conversion comparisons (family at screen pass; source at onsite pass).",
          "Gap-withdrawal association: bucket gaps, test the trend.",
          "Counterfactual: if screen→onsite median fell to 10 days, what happens to total time-to-hire? Show the arithmetic.",
        ],
        hints: [
          "The counterfactual is simple subtraction on medians — and it's the number the talent-ops lead takes upstairs.",
          "Gap buckets: 0-5, 6-10, 11-15, 16-20, 20+ business days; withdrawal rate per bucket with counts.",
          "Keep the counterfactual honest: 'expected ~5–7 day median reduction, assuming candidates don't withdraw faster than the patience curve predicts' — the assumption is stated.",
        ],
        checkpoint: "Intervalled conversions, the decay test, the savings arithmetic.",
      },
      {
        phase: "visualisation",
        title: "The recruiting exhibits",
        goal: "Five charts led by the time decomposition.",
        instructions: [
          "Funnel bars with conversion labels; the legs bar (median + P90); source conversion pairs; the patience curve; family time-to-hire boxes.",
          "Annotate the screen→onsite leg as the target.",
          "Annotate the patience curve's two-week threshold.",
        ],
        hints: [
          "The legs bar with median and P90 whiskers IS the argument — one leg visibly dominates.",
          "Funnel chart: horizontal bars with step conversion annotated between them.",
          "Patience curve: withdrawal rate vs gap bucket, rising, with the inflection annotated.",
        ],
        checkpoint: "Five exhibits with the legs bar polished.",
      },
      {
        phase: "interpretation",
        title: "Name the bottleneck precisely",
        goal: "Findings with mechanism language (scheduling vs selection vs market).",
        instructions: [
          "Answer the five questions; separate process facts from market claims.",
          "Attribute the screen→onsite time to its mechanism (scheduling, interviewer load) as far as the data allows — and say where it stops allowing.",
          "Draft the one-paragraph process story.",
        ],
        hints: [
          "The data shows WHERE time goes, not WHY — scheduling is the inference from the leg's shape (long tail, not shifted median), and it's labelled an inference.",
          "The market-defence counter: if the market were the constraint, all legs would stretch; only one does.",
          "The repeatable paragraph: 'The weeks hide in one leg; the withdrawals follow the gaps; fix the scheduling and both improve.'",
        ],
        checkpoint: "Five answered questions with mechanisms named and bounded.",
      },
      {
        phase: "recommendations",
        title: "The process package",
        goal: "Two or three changes with expected savings and owners.",
        instructions: [
          "Recommend the scheduling SLA, the gap alert, and the sourcing rebalance — each with expected impact.",
          "Include the ATS data fix as the systems recommendation.",
          "Define the measurement plan: weekly legs report, gap-alert tracking, source yield dashboard.",
        ],
        hints: [
          "Each recommendation cites its exhibit: the SLA to the legs bar, the alert to the patience curve, the rebalance to the source table.",
          "Expected savings in ranges from the counterfactual; review at 60 days.",
          "The weekly legs report is the new dashboard — one chart that would have caught this years earlier.",
        ],
        checkpoint: "The package with savings ranges, owners and the new dashboard.",
      },
      {
        phase: "report",
        title: "The recruiting review",
        goal: "A talent-ops review that converts process blame into process arithmetic.",
        instructions: [
          "Follow the outline; open with the one-leg finding.",
          "Methods box: stage-derivation rule, exclusions, the ATS-defect disclosure.",
          "Close with the 60-day measurement plan.",
        ],
        hints: [
          "The one-liner: 'Time-to-hire is a scheduling problem wearing a market costume.'",
          "Recruiters will recognise their own experience in the patience curve — that recognition is the report's political asset.",
          "Reproducibility appendix: derivation rule in code, defect counts, one-command run.",
        ],
        checkpoint: "The complete review, reproducible from the applications export.",
      },
    ],

    independentBrief: {
      scenario:
        "You are talent-ops' analyst. Diagnose the time-to-hire drift: the funnel, the time decomposition, the withdrawal pattern, source economics — and the two or three process changes that move the number. Stage-derivation rules and duration conventions are yours, documented.",
      deliverables: [
        "Data reconstruction with the stage-derivation rule and disagreement count",
        "Funnel conversion by family, level and source (with intervals)",
        "Time-to-hire decomposition into stage legs (median and P90)",
        "The gap-withdrawal patience analysis",
        "Process package with counterfactual savings, owners and the weekly legs report",
      ],
      guardrails: [
        "Impossible chronology excluded from durations, never repaired",
        "Stage column rebuilt from dates, disagreements disclosed",
        "Mechanism claims (scheduling) labelled as inference from data shape",
        "Counterfactual assumptions stated",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Stage derivation from dates, with disagreement count reported",
        "Leg durations computed on chronology-valid hires only",
        "Conversion denominators are stage-reached counts",
      ],
      "code-quality": [
        "Conversion and duration helpers written once",
        "Duration asserts present",
      ],
      reasoning: [
        "Bottleneck attributed with mechanism language bounded by evidence",
        "Patience decay linked to the gap-alert recommendation",
      ],
      visualization: [
        "Legs bar shows median and P90",
        "Patience curve annotated with the threshold",
      ],
      interpretation: [
        "One-leg finding articulated with the market-counter argument",
        "Source trade-offs (volume/speed/quality) stated together",
      ],
      recommendations: [
        "Expected savings from counterfactual arithmetic",
        "Measurement plan (weekly legs, alert tracking) included",
      ],
    },
  },

  /* ================================================================ HR-03 */
  {
    id: "hr-3",
    categoryId: "hr",
    difficulty: "advanced",
    code: "HR-03",
    title: "Compensation Equity Review",
    subtitle: "Twenty-six hundred salaries: measure the gaps, decompose them, and hand the comp committee defensible numbers.",
    summary:
      "Pay-equity analytics with governance stakes: clean a compensation dataset, measure raw and adjusted pay gaps with regression, audit band adherence, and deliver a committee-grade equity report with remediation options and their costs.",
    hours: 16,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Pay-equity statistics", "Regression adjustment", "Band architecture analysis", "Sensitivity & governance reporting", "Remediation costing"],

    businessBackground:
      "Meridian Systems' compensation committee has commissioned a pay-equity review ahead of its annual cycle. Two pressures: an external pay-transparency regulation lands next year, and an internal analysis (a spreadsheet of group medians) suggested gender and ethnicity gaps that leadership cannot evaluate — raw medians ignore level, tenure and role mix. The CHRO needs the defensible version: raw gaps, gaps adjusted for legitimate pay factors, band-architecture problems, and a remediation cost range — with methodology transparent enough to survive both a regulator and an employee FAQ.",
    problemStatement:
      "Quantify pay equity from the compensation dataset: raw pay gaps by gender and ethnicity; adjusted gaps from a documented pay-determinants model; band adherence and below-band populations; location and level interactions; sensitivity of the adjusted gaps to model choices — delivered as a committee-grade report with remediation options and costs.",
    businessObjectives: [
      "Measure raw gaps in base salary by gender, ethnicity, level and location",
      "Estimate adjusted gaps with a documented, defensible pay-determinants model",
      "Audit band adherence: below-min and above-max populations by segment",
      "Test interactions (gender × level, gender × location) and the model's sensitivity",
      "Deliver remediation options with cost ranges and a governance process",
    ],
    datasetDescription:
      "~2,600 employee compensation records: base salary (partly comma-formatted), bonus percentage, level, job family, tenure, performance rating, gender (with single-letter variants), ethnicity (coding variants), location and hire date, plus the pay band min/max (with gaps). Bonus values include impossibles above 100%, bands are missing on some rows, and duplicates exist. In pay equity, every cleaning and modelling choice is auditable by design — the dataset demands it.",
    dataDictionary: [
      { column: "employee_id", kind: "id", description: "Employee identifier", example: "7482" },
      { column: "department", kind: "categorical", description: "Department", example: "Engineering" },
      { column: "job_level", kind: "categorical", description: "Level (IC1–IC4, M1–M2)", example: "IC3" },
      { column: "job_family", kind: "categorical", description: "Job family within department", example: "Engineering" },
      { column: "tenure_years", kind: "decimal", description: "Years at company", example: "4.8" },
      { column: "performance_rating", kind: "integer", description: "Rating 1–5", example: "4" },
      { column: "base_salary", kind: "currency", description: "Annual base salary (format mix)", example: "118,500" },
      { column: "bonus_pct", kind: "percent", description: "Target bonus % (values >100 exist)", example: "12" },
      { column: "gender", kind: "categorical", description: "Gender (single-letter variants)", example: "Female" },
      { column: "ethnicity", kind: "categorical", description: "Ethnicity group (coding variants)", example: "Black" },
      { column: "location", kind: "categorical", description: "Work location", example: "London" },
      { column: "hire_date", kind: "date", description: "Hire date", example: "2021-06-14" },
      { column: "pay_band_min", kind: "currency", description: "Band minimum (some missing)", example: "104000" },
      { column: "pay_band_max", kind: "currency", description: "Band maximum (some missing)", example: "137000" },
    ],
    initialQuestions: [
      "What are the raw base-salary gaps by gender and ethnicity, overall and within level?",
      "How much of each gap survives adjustment for level, job family, location, tenure and performance?",
      "What is the band-adherence picture: who sits below band minimum, and which segments?",
      "Do gaps vary by level or location (interactions), and how sensitive are adjusted gaps to model choices?",
      "What remediation approach does the evidence support, and what would it cost?",
    ],
    dataset: {
      name: "Meridian compensation records",
      filename: "hr-03-compensation.csv",
      description: "Employee-level compensation with levels, bands, demographics and location.",
      rows: 2600,
    },

    dataQuality: [
      { issue: "Comma-formatted salaries", where: "base_salary — '118,500' strings (~9%)", detection: "dtype object; contains(',')", treatment: "Strip and numericise with zero-loss verification — the outcome variable must be perfect." },
      { issue: "Impossible bonus percentages", where: "bonus_pct > 100", detection: "(df['bonus_pct'] > 100).sum()", treatment: "Exclude from bonus analysis (counted); likely decimal-shift errors (e.g., 150 for 1.50)." },
      { issue: "Gender code variants", where: "gender — 'F'/'M' with full labels", detection: "value_counts()", treatment: "Canonical map, documented; keep the category set as-reported (analysis must not erase identities)." },
      { issue: "Ethnicity coding variants", where: "ethnicity — casing and short forms", detection: "value_counts()", treatment: "Canonical map with an appendix table — demographic mappings are reviewable artefacts in equity work." },
      { issue: "Missing pay bands", where: "pay_band_min/max — ~5%", detection: "isna().sum()", treatment: "Impute band edges from level × location medians of banded peers (documented), or exclude from adherence analysis; state the choice." },
      { issue: "Duplicate employees", where: "~0.5% duplicated rows", detection: "duplicated('employee_id').sum()", treatment: "Drop; headcount and gap denominators must be unique." },
      { issue: "Rating validity", where: "ratings outside 1–5", detection: "range check", treatment: "Assert-clean in this export; the check stays in the script as insurance." },
    ],
    cleaningPlan: [
      { action: "Numericise salary with verification; canonicalise demographics with documented maps", rationale: "The outcome and the equity dimensions must be single-encoding and auditable." },
      { action: "Resolve band gaps with a stated imputation (level × location peer medians) or exclusion", rationale: "Adherence analysis needs bands; the choice is documented either way." },
      { action: "Exclude impossible bonus values (counted)", rationale: "Bonus analysis separate and honest." },
      { action: "Build the analysis frame with log-salary as the modelling target", rationale: "Log-linear pay models are the standard, interpretable form (coefficients ≈ % effects)." },
    ],
    edaPlan: [
      { question: "Pay landscape", method: "salary distribution by level and location; headcounts by segment", expectation: "Clean level ladder; location effects visible (US premium)." },
      { question: "Raw gaps", method: "median and mean salary by gender and ethnicity, overall and within level", expectation: "Overall gaps ~12–18%; within-level much smaller — the mix warning." },
      { question: "Composition context", method: "gender/ethnicity mix by level, family and location", expectation: "Under-representation at senior levels and in premium locations — the Simpson's setup." },
      { question: "Band adherence", method: "below-min and above-max counts and salary shortfall by segment", expectation: "Below-min concentrated in specific families/locations; small but actionable populations." },
      { question: "Tenure and rating balance", method: "tenure and rating distributions by group", expectation: "Ratings balanced (good); tenure slightly lower for one group — a legitimate control." },
    ],
    statisticsPlan: [
      { technique: "Raw gap estimation (medians and means, by segment, with bootstrap CIs)", purpose: "The headline numbers with uncertainty", expectation: "Overall gaps material; within-level gaps roughly a third the size." },
      { technique: "Adjusted gaps: log-salary regression on level, family, location, tenure, rating + demographics", purpose: "The defensible gap estimate", expectation: "Gender gap shrinks to ~2–4% adjusted; ethnicity gaps similar or smaller, with wider CIs." },
      { technique: "Interaction checks (demographic × level, × location)", purpose: "Does the gap vary structurally?", expectation: "A modest location interaction (gap wider in one location) worth flagging." },
      { technique: "Sensitivity: model with/without tenure and rating (the 'legitimate factors' debate)", purpose: "Show how control choices move the estimate", expectation: "Adjusted gap moves 1–2 points across specifications — the governance table." },
      { technique: "Below-band remediation costing", purpose: "Price the floor fix", expectation: "Bringing below-min employees to band floor costs a stated, small % of payroll." },
    ],
    visualisationPlan: [
      { chart: "Dot plot with CIs — raw and adjusted gaps by group", answers: "What are the gaps, really?", reads: "The shrinkage from raw to adjusted visible; intervals attached." },
      { chart: "Composition bars — group mix by level", answers: "Why is the raw gap bigger?", reads: "Under-representation at senior levels — the mix mechanism." },
      { chart: "Scatter — salary vs tenure by group within one level (the transparency chart)", answers: "Are trajectories parallel?", reads: "Parallel trajectories with a gap = level-entry difference; diverging = growth difference." },
      { chart: "Bar — below-band counts and shortfall by segment", answers: "Who is under the floor?", reads: "Segment bars with dollar shortfall labelled." },
      { chart: "Sensitivity plot — adjusted gap across model specifications", answers: "How sturdy is the number?", reads: "Point estimates across specs with the primary model marked." },
    ],
    findings: [
      "Raw pay gaps are material (~12–18% by gender and ethnicity overall) but composition explains most of them: women and under-represented groups are under-represented at senior levels and in premium locations — a representation problem wearing a pay-gap costume.",
      "Adjusted gaps survive but small: after level, family, location, tenure and rating controls, the gender gap is ~2–4% and ethnicity gaps are similar with wider intervals — still real, still requiring action, but an order different from the raw numbers.",
      "Band architecture has a measurable floor problem: a below-minimum population concentrated in specific families and locations, with a total shortfall that is small relative to payroll but corrosive to trust and (soon) to compliance.",
      "The sensitivity analysis shows the adjusted gender gap moving only 1–2 points across defensible model specifications — the estimate is sturdy, which is exactly what the committee needs to know.",
      "A location interaction exists (the adjusted gap is wider in one location) — small but worth a targeted look rather than a global remedy.",
    ],
    recommendations: [
      { what: "Fix the band floor first: bring all below-minimum employees to band minimum in the next cycle", why: "The floor problem is unambiguous, cheap relative to payroll, and the first thing a regulator or employee will check.", impact: "Immediate, visible equity progress", horizon: "immediate" },
      { what: "Address the adjusted gap with a targeted equity fund for the affected populations, allocated by case review", why: "The adjusted gap is small but real; a fund with governance beats blanket increases that overshoot.", impact: "Closes the residual gap deliberately", horizon: "this quarter" },
      { what: "Treat the representation problem as its own workstream (level-entry and promotion pipelines), not as a pay fix", why: "Most of the raw gap is composition; paying around under-representation hides it.", impact: "Attacks the larger, slower problem", horizon: "longer term" },
      { what: "Adopt the methodology as the standing annual review (specs, CIs, sensitivity table) with published documentation", why: "The regulation arrives next year; the audited process is the compliance asset.", impact: "Governance readiness", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Meridian's raw pay gaps are large, mostly compositional, and partly real. Most of the 12–18% raw gaps reflect under-representation at senior levels and premium locations rather than unequal pay for equal work; the adjusted gaps — the regulator's number — are ~2–4% for gender and comparable-but-noisier for ethnicity, sturdy across model specifications. Separately, the band architecture has a floor problem: a below-minimum population concentrated in specific families and locations, remediable for a small share of payroll. The recommendation package sequences deliberately: fix the floor now, close the adjusted gap with a governed equity fund, run representation as its own workstream, and adopt this methodology as the standing annual review before the transparency regulation lands.",
      structure: [
        "1. The committee's question and the methodology stance",
        "2. Data and quality treatment (documented demographic maps)",
        "3. The pay landscape and composition context",
        "4. Raw gaps by segment",
        "5. Adjusted gaps: model, estimates, interactions",
        "6. Sensitivity across specifications",
        "7. Band adherence and remediation costing",
        "8. The recommendation package and governance process",
        "9. Appendix: model tables, mapping tables, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Write the methodology stance first",
        goal: "The pay-determinants model and the 'legitimate factors' debate settled before estimation.",
        instructions: [
          "Write the model plan: log(base_salary) ~ level + family + location + tenure + rating + demographics — the standard, defensible form.",
          "Decide the legitimate-factors stance: tenure and rating are included in the primary model, with a sensitivity spec excluding rating (ratings can carry bias).",
          "Note the audit posture: every mapping, exclusion and specification documented for committee and regulator review.",
        ],
        hints: [
          "Pay equity's methodological fight is always 'which controls are legitimate' — answer it explicitly, and show the estimate under both choices.",
          "Log-salary models give coefficients interpretable as approximate % effects — the committee language.",
          "The audit posture is a feature: transparency regulations reward the documented process.",
        ],
        checkpoint: "The stance document: model, controls, sensitivity plan.",
        code: {
          label: "Stance setup",
          language: "python",
          source: `df = pd.read_csv("hr-03-compensation.csv")
print(df.dtypes)
print(df["gender"].value_counts(dropna=False))
print(df["ethnicity"].value_counts(dropna=False))
print("salary strings:", df["base_salary"].astype(str).str.contains(",").sum())
print("bonus > 100:", (df["bonus_pct"] > 100).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit with the regulator's eyes",
        goal: "Outcome integrity, demographic maps, band gaps — each documented.",
        instructions: [
          "Numericise salary with zero-loss verification; build the demographic canonical maps.",
          "Decide the band-gap treatment (peer-median imputation vs exclusion) and document.",
          "Exclude impossible bonuses; count everything into the audit table.",
        ],
        hints: [
          "The salary column is the outcome: any coercion loss is a redline stop — verify count-in equals count-out.",
          "Demographic maps belong in the appendix as first-class deliverables; communities and regulators read them.",
          "Band imputation from level × location peer medians is defensible; the imputed share is reported.",
        ],
        checkpoint: "The audit table with maps and the band-gap decision.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Clean compensation frame with log salary and derived band position.",
        instructions: [
          "Assemble the frame; derive log_salary and band_position ((salary − min)/(max − min)).",
          "Verify the level ladder (medians monotone by level).",
          "Snapshot segment headcounts — the denominators table.",
        ],
        hints: [
          "band_position turns adherence into a continuous metric: <0 is below floor, >1 is above ceiling.",
          "The monotonicity check on level medians catches coding errors in levels — cheap insurance.",
          "Denominators first: every gap figure divides by a headcount you should be able to quote.",
        ],
        checkpoint: "Analysis frame with log salary and band position, verified ladder.",
        code: {
          label: "Analysis frame",
          language: "python",
          source: `G = {"F": "Female", "Female": "Female", "M": "Male", "Male": "Male",
    "Non-binary": "Non-binary"}
clean = df.drop_duplicates("employee_id").copy()
clean["gender_c"] = clean["gender"].map(G)
clean["salary"] = pd.to_numeric(
    clean["base_salary"].astype(str).str.replace(",", "", regex=False))
assert clean["salary"].notna().all()
clean["log_salary"] = np.log(clean["salary"])
clean["band_pos"] = (clean["salary"] - clean["pay_band_min"]) / (
    clean["pay_band_max"] - clean["pay_band_min"])`,
        },
      },
      {
        phase: "eda",
        title: "Landscape, composition and raw gaps",
        goal: "Pay by level/location; the mix that drives raw gaps; within-level gaps.",
        instructions: [
          "Salary medians by level and location; headcounts by segment.",
          "Raw gaps: overall and within-level medians by gender and ethnicity.",
          "Composition: group mix by level and location — the Simpson's mechanism made visible.",
        ],
        hints: [
          "Overall vs within-level gaps side by side IS the composition finding — show both tables before any model.",
          "The mix-by-level bar chart becomes the report's explanation exhibit.",
          "Location matters: premium locations pay more and skew demographically — control or confuse.",
        ],
        checkpoint: "Landscape mapped, raw gaps quoted overall and within-level.",
        code: {
          label: "Raw gaps",
          language: "python",
          source: `print(clean.groupby("job_level")["salary"].agg(["median", "count"]).round(0))
print(clean.groupby("gender_c")["salary"].agg(["median", "count"]).round(0))
print(clean.groupby(["job_level", "gender_c"])["salary"].agg(["median", "count"]).round(0).unstack())

mix = clean.groupby("job_level")["gender_c"].value_counts(normalize=True).unstack()
print(mix.round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "The adjusted model and its stress test",
        goal: "Log-linear adjusted gaps, interactions, sensitivity, remediation costing.",
        instructions: [
          "Fit the primary model; extract demographic coefficients with CIs (≈ % gaps).",
          "Test interactions (gender × level, gender × location); refit if material.",
          "Sensitivity: specs with/without rating and tenure; the table the committee will interrogate.",
          "Cost the below-band floor fix.",
        ],
        hints: [
          "The adjusted gap from a log model is exp(coefficient) − 1 — translate once, apply everywhere.",
          "Interactions: add one at a time; a material location interaction becomes its own finding with a targeted recommendation.",
          "The sensitivity table's job is to show robustness honestly: 1–2 points of movement across specs is a strong result; 5 points is a methodology conversation.",
        ],
        checkpoint: "Adjusted-gap table with CIs, interaction verdicts, sensitivity table, floor cost.",
        code: {
          label: "Adjusted gap",
          language: "python",
          source: `import statsmodels.formula.api as smf

m = smf.ols(
    "log_salary ~ C(gender_c) + C(ethnicity) + C(job_level) + C(job_family)"
    " + C(location) + tenure_years + performance_rating",
    data=clean).fit(cov_type="HC3")
g = np.exp(m.params["C(gender_c)[T.Male]"]) - 1
lo = np.exp(m.conf_int().loc["C(gender_c)[T.Male]", 0]) - 1
hi = np.exp(m.conf_int().loc["C(gender_c)[T.Male]", 1]) - 1
print(f"adjusted male-female gap: {g:.1%}  CI [{lo:.1%}, {hi:.1%}]")

below = clean[clean["band_pos"] < 0]
print("below-band employees:", len(below),
      "shortfall: $", round((below["pay_band_min"] - below["salary"]).sum()))`,
        },
      },
      {
        phase: "visualisation",
        title: "The committee exhibits",
        goal: "Five charts: gap dots, composition bars, trajectories, below-band, sensitivity.",
        instructions: [
          "Raw-vs-adjusted dot plot with CIs; mix-by-level bars; tenure-trajectory scatter; below-band bars with dollars; the sensitivity strip.",
          "Every demographic chart respects min cell sizes.",
          "The sensitivity exhibit marks the primary specification.",
        ],
        hints: [
          "The raw-to-adjusted shrinkage in one chart is the report's thesis statement.",
          "Trajectory scatter: one representative level, salary vs tenure by group, with fitted lines — parallelism is the visual question.",
          "Sensitivity as a strip plot: one row per spec, dot + CI, primary spec highlighted.",
        ],
        checkpoint: "Five exhibits with the gap-dot chart polished.",
      },
      {
        phase: "interpretation",
        title: "The two-problem truth",
        goal: "Pay gap vs representation gap — stated separately, sized separately.",
        instructions: [
          "Answer the five questions with the two-problem frame: unequal pay for equal work (small, adjusted) vs unequal representation (large, compositional).",
          "Present the sensitivity result as robustness evidence.",
          "Bound the interaction finding (location) without over-claiming.",
        ],
        hints: [
          "Conflating the two problems is the standard equity-report failure — this report's value is keeping them separate with numbers attached to each.",
          "Robustness language: 'the adjusted gap moves within X points across defensible specifications — the finding is not an artefact of model choice.'",
          "The representation finding gets its own recommendation and its own timeline — it cannot be fixed in a comp cycle.",
        ],
        checkpoint: "The two-problem statement with sizes, robustness and interaction notes.",
      },
      {
        phase: "recommendations",
        title: "The remediation package",
        goal: "Sequenced actions: floor fix, equity fund, representation workstream, standing review.",
        instructions: [
          "Sequence the four recommendations with costs and owners.",
          "The floor fix priced; the equity fund sized from the adjusted gap × affected population.",
          "The standing review process defined (specs, cadence, publication).",
        ],
        hints: [
          "Sequencing logic: unambiguous fixes first (floor), governed fixes second (fund), structural third (representation), process always (review).",
          "The equity fund sizing: adjusted gap % × affected headcount × average salary — an order-of-magnitude range, clearly labelled as such.",
          "The standing review is the compliance play: methodology documented, run annually, ready for the regulator's questions.",
        ],
        checkpoint: "The sequenced package with costs, owners and the process definition.",
      },
      {
        phase: "report",
        title: "The equity review",
        goal: "A committee-grade review built to survive a regulator and an employee FAQ.",
        instructions: [
          "Follow the outline; open with the two-problem framing.",
          "Methodology stance and sensitivity table in the body — they are the credibility spine.",
          "Appendix: full model tables, demographic maps, remediation arithmetic.",
        ],
        hints: [
          "The one-liner: 'Most of the raw gap is representation, not pay; the pay part is small, real and fixable this cycle.'",
          "Write the employee-FAQ paragraph in plain language — if the review can't be explained to staff, it will be explained badly by others.",
          "Reproducibility: one script, every map and model documented — this document gets audited.",
        ],
        checkpoint: "The complete equity review, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the compensation committee's analyst. Deliver the defensible equity review: raw gaps, adjusted gaps with a documented model, band adherence, sensitivity, and a sequenced remediation package with costs. Model specifications, control stance and mapping tables are yours — auditable by design.",
      deliverables: [
        "Data audit with documented demographic canonicalisation and band-gap treatment",
        "Raw gaps overall and within level, with the composition analysis",
        "Adjusted gaps from the log-salary model with CIs and interactions",
        "Sensitivity table across defensible specifications",
        "Remediation package: floor fix priced, equity fund sized, representation workstream, standing review process",
      ],
      guardrails: [
        "Every demographic mapping documented and reviewable",
        "Control-choice debate addressed with sensitivity specs",
        "Min cell sizes in all published segment views",
        "Remediation costs labelled as estimates with stated bases",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Salary numericised with zero-loss verification",
        "Adjusted gaps from log model translated correctly (exp(coef)−1)",
        "Band position arithmetic correct; below-min shortfall summed",
      ],
      "code-quality": [
        "Model specifications parameterised for the sensitivity runs",
        "Mapping tables explicit and asserted",
      ],
      reasoning: [
        "Raw vs adjusted vs composition kept distinct throughout",
        "Legitimate-controls debate addressed with sensitivity evidence",
      ],
      visualization: [
        "Raw-to-adjusted shrinkage visible in one exhibit",
        "Sensitivity strip marks the primary specification",
      ],
      interpretation: [
        "Two-problem framing (pay vs representation) explicit",
        "Interaction findings bounded without over-claim",
      ],
      recommendations: [
        "Sequenced package with costs and owners",
        "Standing review process defined for governance",
      ],
    },
  },
];
