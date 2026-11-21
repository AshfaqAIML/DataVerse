/**
 * Financial analytics projects — FIN-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const FINANCIAL_PROJECTS: DapProject[] = [
  /* ================================================================ FIN-01 */
  {
    id: "financial-1",
    categoryId: "financial",
    difficulty: "beginner",
    code: "FIN-01",
    title: "Monthly Budget vs Actual Review",
    subtitle: "Six months, six departments, one question: where did the plan break?",
    summary:
      "A first finance analysis: clean a general-ledger budget export, compute variances by department and account, find the drivers, and write the month-end review the CFO actually reads.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Variance analysis", "Financial data cleaning", "Materiality thinking", "Variance charts", "Month-end commentary"],

    businessBackground:
      "Harbor Digital, a 180-person software company, runs monthly budget-vs-actual reviews that everyone attends and nobody trusts. The CFO's analyst left, and the reviews have drifted into raw dumps: spreadsheet printouts with no variance logic, no materiality thresholds and no commentary. With H1 closing, the CFO wants the June review rebuilt properly: variances by department and account, split by size and direction, with drivers named and a one-page commentary.",
    problemStatement:
      "Produce the H1 budget-vs-actual review: clean the GL export, compute absolute and percentage variances by month, department and account, classify variances by materiality, identify the three drivers that matter, and deliver the CFO's one-page commentary for the June review.",
    businessObjectives: [
      "Compute budget, actual and variance (absolute, %, and share of total variance) by department, account and month",
      "Classify variances by materiality and direction (favourable/unfavourable)",
      "Identify the top drivers of the H1 variance and their trend across months",
      "Deliver a one-page commentary with the June storyline and recommended actions",
    ],
    datasetDescription:
      "Six months of GL expense lines (~190 rows): each row a month-department-account combination with budget and actual amounts. Budget values are partly formatted as strings with commas, some actuals are missing, a few are negative (rebates), departments have abbreviation variants ('Mktg' vs 'Marketing'), and duplicate lines exist. Small data, high stakes: every defect is visible in the totals the CFO will quote.",
    dataDictionary: [
      { column: "entry_id", kind: "id", description: "GL line identifier", example: "182" },
      { column: "month", kind: "categorical", description: "Month (YYYY-MM)", example: "2025-06" },
      { column: "department", kind: "categorical", description: "Department (abbreviation variants exist)", example: "Marketing" },
      { column: "cost_center", kind: "categorical", description: "Cost centre code", example: "CC-101" },
      { column: "account_code", kind: "categorical", description: "GL account code", example: "6300" },
      { column: "account_name", kind: "text", description: "GL account name", example: "Advertising" },
      { column: "budget", kind: "currency", description: "Budgeted amount (some '12,400' strings)", example: "42000" },
      { column: "actual", kind: "currency", description: "Actual spend (some missing; negatives are rebates)", example: "46200" },
      { column: "expense_type", kind: "categorical", description: "Fixed or variable", example: "Variable" },
    ],
    initialQuestions: [
      "What is the total H1 variance, and which departments drive it?",
      "Which accounts have the largest absolute and percentage variances?",
      "Are variances improving or worsening month-over-month?",
      "Which variances are material enough to discuss in the review?",
      "What is the June storyline: one-time events, run-rate drift, or planning errors?",
    ],
    dataset: {
      name: "Harbor Digital GL export",
      filename: "financial-01-budget-actuals.csv",
      description: "6 months of budget-vs-actual GL expense lines by department and account.",
      rows: 190,
    },

    dataQuality: [
      { issue: "Formatted budget strings", where: "budget — '42,000' with commas (~9%)", detection: "dtype object; str.contains(',')", treatment: "Strip commas, cast numeric; verify zero coercion losses." },
      { issue: "Missing actuals", where: "actual — ~3% of lines", detection: "isna().sum() by month", treatment: "Exclude from variance math (a missing actual is not a zero variance); report lines affected — finance reviews need the audit trail." },
      { issue: "Negative actuals (rebates)", where: "actual < 0", detection: "(df['actual'] < 0).sum()", treatment: "Legitimate accounting entries: keep them, flag them in the narrative (they create favourable variances that are credits, not savings)." },
      { issue: "Department abbreviations", where: "department — 'Mktg' vs 'Marketing'", detection: "value_counts()", treatment: "Map abbreviations to canonical names before any department rollup." },
      { issue: "Duplicate GL lines", where: "~12 duplicated rows", detection: "duplicated(['month','department','account_code']).sum()", treatment: "Investigate then drop — in finance data, duplicates may be real corrections; state the resolution rule." },
    ],
    cleaningPlan: [
      { action: "Numericise budget; canonicalise department; resolve duplicates at the month-dept-account grain", rationale: "Totals are the review's foundation; label variants and duplicates corrupt them." },
      { action: "Exclude missing-actual lines from variance math, tracked in a reconciliation note", rationale: "A missing actual must not masquerade as zero spend or zero variance." },
      { action: "Derive variance fields: absolute, percentage (guarding small denominators), and share of total", rationale: "Three variance lenses answer three review questions (how big, how bad, how much of the story)." },
      { action: "Flag negative actuals as rebate lines for narrative treatment", rationale: "Favourable-looking variances that are actually credits deserve explicit commentary." },
    ],
    edaPlan: [
      { question: "The headline variance", method: "total budget vs actual; variance by month", expectation: "H1 overspend ~6–8%, concentrated in H2 of the half." },
      { question: "Department rollup", method: "variance by department, sorted by absolute", expectation: "Engineering and Marketing drive most of it; Finance close to plan." },
      { question: "Account-level drivers", method: "top accounts by absolute variance with %", expectation: "Salaries (headcount overrun) and Cloud Infrastructure (usage) lead." },
      { question: "Trend by month", method: "variance % by month, department facet", expectation: "Advertising overspend improving; Cloud worsening each month." },
      { question: "Materiality distribution", method: "count of variances above thresholds (e.g., $5k or 10%)", expectation: "A short list of 8–12 material variances — the review agenda." },
      { question: "Favourable variances", method: "largest favourable lines and their nature", expectation: "Travel underspend and rebate credits — check they're real savings." },
    ],
    statisticsPlan: [
      { technique: "Variance decomposition (department → account contribution)", purpose: "Attribute the total variance to drivers", expectation: "Two accounts explain over half the total; the Pareto of pain." },
      { technique: "Run-rate analysis (annualised actual vs budget)", purpose: "Is the variance accelerating?", expectation: "Cloud Infrastructure run-rate ~130% of budget and rising." },
      { technique: "Simple trend test on monthly variance %", purpose: "Confirm direction statistically, not visually", expectation: "Cloud's negative trend significant; Advertising's improvement visible but noisier." },
    ],
    visualisationPlan: [
      { chart: "Waterfall — total variance by department", answers: "Who broke the plan?", reads: "Steps build from zero to total; each department labelled." },
      { chart: "Diverging bar — top account variances (favourable right, unfavourable left)", answers: "Which lines matter?", reads: "Length = absolute variance; colour = direction." },
      { chart: "Heatmap — month × department variance %", answers: "When and where consistently?", reads: "Colour intensity by cell; the persistent red block is the story." },
      { chart: "Line — monthly variance % for the top three drivers", answers: "Is it getting better or worse?", reads: "Slopes and the zero line; annotate inflection months." },
      { chart: "Scatter — budget vs actual by line (with y=x reference)", answers: "Where does planning fail systematically?", reads: "Points far off the diagonal, coloured by direction." },
    ],
    findings: [
      "H1 closes roughly 7% over budget, and two-thirds of the overrun comes from two places: Engineering salaries (hiring ran ahead of the plan) and Cloud Infrastructure (usage-driven, and rising every month).",
      "Cloud Infrastructure is not a one-time miss: its monthly variance worsens monotonically from April, and the annualised run-rate sits near 130% of budget — the June review's structural problem.",
      "Marketing's Advertising overspend improves steadily through the half (a genuine correction after Q1), while its remaining variance is concentrated in Q1 — history, not news.",
      "The largest favourable variances are Travel underspend and two rebate credits; the rebates are accounting credits, not savings, and should not be netted into the operating story without note.",
      "A materiality screen of $5k or 10% isolates 10–12 lines that carry the review; the other 1,200+ lines are noise for this meeting.",
    ],
    recommendations: [
      { what: "Re-forecast Cloud Infrastructure for H2 with usage-based budgeting and a monthly growth check", why: "The variance is structural and rising; the fix is a re-baseline, not a spending freeze.", impact: "Restores forecast credibility for the biggest driver", horizon: "immediate" },
      { what: "Align the Engineering headcount plan with actual hiring pace (or vice versa) before July hiring", why: "Salary overrun is a planning-vs-execution mismatch; it compounds monthly.", impact: "Stops the largest recurring variance source", horizon: "this quarter" },
      { what: "Adopt the materiality screen ($5k / 10%) as the review's standing agenda rule", why: "The review currently drowns in immaterial lines while the material ones lack depth.", impact: "Shorter, sharper reviews", horizon: "immediate" },
      { what: "Annotate rebate credits separately from operating variances in the commentary", why: "Netting credits into the story flatters the operating result and erodes trust when noticed.", impact: "Commentary integrity", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "H1 closes ~7% over budget, but the number that matters is its shape: two-thirds of the overrun is Engineering salaries and Cloud Infrastructure, and only the Cloud variance is still worsening — it runs at ~130% of budget annualised and grows every month, demanding an H2 re-forecast on usage-based assumptions rather than a spending squeeze. Advertising's Q1 overspend has already self-corrected; the remaining favourable variances are travel underspend and rebate credits, the latter being accounting entries rather than savings. The June commentary proposes a Cloud re-baseline, a headcount-plan alignment, a standing materiality rule for reviews, and separation of credits from operating variance. All totals are computed after de-duplicating 12 lines, standardising department labels and excluding 38 lines with missing actuals (fully reconciled in the appendix).",
      structure: [
        "1. Objective and variance definitions (materiality thresholds stated)",
        "2. Data and quality treatment (with reconciliation note)",
        "3. The H1 headline: total, direction, trend",
        "4. Department and account drivers (waterfall)",
        "5. The materiality shortlist — the review agenda",
        "6. June commentary and recommended actions",
        "7. Appendix: cleaning log, excluded lines, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the GL export",
        goal: "Load, profile, and fix the grain: month-department-account lines.",
        instructions: [
          "Profile shape, dtypes, nulls; note budget's object dtype and the department label variants.",
          "Confirm the grain: one row per month-department-account (duplicates at that key are the integrity question).",
          "Understand the accounting direction convention: expenses over budget = unfavourable; negative actuals = credits.",
        ],
        hints: [
          "Finance grain first: if (month, department, account_code) isn't unique, every rollup double-counts something.",
          "Variance direction is a convention, not an opinion: for expenses, actual > budget = unfavourable. State it once, apply it everywhere.",
          "The 38 missing actuals are a reconciliation item — in finance, unexplained exclusions are how analyses lose credibility.",
        ],
        checkpoint: "Grain verified, conventions written, defect census started.",
        code: {
          label: "Profile the GL",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("financial-01-budget-actuals.csv")
print(df.shape, df.dtypes)
print("dupes at grain:",
      df.duplicated(["month", "department", "account_code"]).sum())
print(df["department"].value_counts())
print(df.isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the finance export",
        goal: "Formats, missing actuals, credits, labels, duplicates — each counted and resolved.",
        instructions: [
          "Quantify each defect family; write the resolution rule per defect.",
          "Decide the rebate treatment (keep, flag) and the missing-actual treatment (exclude, reconcile).",
          "Check budget-vs-account consistency (Salaries lines should carry 'Fixed' expense type, etc.).",
        ],
        hints: [
          "Numbers-as-strings in finance exports are near-universal: strip commas, cast, assert zero NaN from coercion.",
          "Rebates are legitimate; the analysis crime is presenting a credit as a saving — flag, don't remove.",
          "Duplicate GL lines might be corrections (same key, different amounts) — inspect before dropping and state the rule you applied.",
        ],
        checkpoint: "The defect table with resolution rules and counts.",
      },
      {
        phase: "cleaning",
        title: "Clean and derive variance fields",
        goal: "A clean frame with the three variance lenses ready.",
        instructions: [
          "Apply all fixes; derive variance_abs, variance_pct (guarding tiny budgets) and share of total variance.",
          "Add materiality flags ($5k or 10%) and rebate flags.",
          "Reconcile: rows in, rows excluded, rows analysed — the three-number audit trail.",
        ],
        hints: [
          "Percentage variance explodes on small budgets: guard with np.where(budget > threshold, var/budget, np.nan) and report absolute alongside.",
          "Share of total variance = variance_abs / total_unfavourable (or total net — pick one, state it).",
          "The reconciliation note (in/excluded/analysed) is a two-line table that buys total trust in finance reviews.",
        ],
        checkpoint: "Clean frame with derived fields and a reconciliation note.",
        code: {
          label: "Variance fields",
          language: "python",
          source: `DEPT_MAP = {"Mktg": "Marketing", "Eng": "Engineering", "Ops": "Operations",
              "HR": "People", "Fin": "Finance"}
clean = df.drop_duplicates(["month", "department", "account_code"]).copy()
clean["department"] = clean["department"].replace(DEPT_MAP)
clean["budget"] = pd.to_numeric(
    clean["budget"].astype(str).str.replace(",", "", regex=False))
clean["rebate"] = clean["actual"] < 0

v = clean.dropna(subset=["actual"]).copy()
v["var_abs"] = v["actual"] - v["budget"]
v["var_pct"] = v["var_abs"] / v["budget"]
v["material"] = v["var_abs"].abs() > 5000
print(f"rows in={len(df)}, analysed={len(v)}, excluded={len(df)-len(v)}")`,
        },
      },
      {
        phase: "eda",
        title: "Find the story in the variances",
        goal: "Totals, rollups, trends and the materiality shortlist.",
        instructions: [
          "Total and monthly variance; department rollup sorted by absolute contribution.",
          "Top accounts by absolute variance with percentages; monthly trend for the top three.",
          "Build the materiality shortlist — the review agenda.",
        ],
        hints: [
          "Sort by abs(variance), not signed variance — favourable and unfavourable both belong on the agenda.",
          "Monthly trend by driver: pivot(index='month', columns='account_name', values='var_abs') then plot the top lines.",
          "The shortlist is a table: department, account, variance, %, direction, trend arrow — the CFO's meeting notes.",
        ],
        checkpoint: "Rollups and shortlist built; the two-driver story identified.",
        code: {
          label: "Rollups",
          language: "python",
          source: `dept = v.groupby("department").agg(
    budget=("budget", "sum"), actual=("actual", "sum"),
    var=("var_abs", "sum"))
dept["var_pct"] = dept["var"] / dept["budget"]
print(dept.sort_values("var", key=abs, ascending=False).round(3))

acct = v.nlargest(10, key=abs if False else "var_abs", keep="first") if False else \\
      v.reindex(v["var_abs"].abs().sort_values(ascending=False).index).head(10)
print(acct[["month", "department", "account_name", "var_abs", "var_pct"]])`,
        },
      },
      {
        phase: "statistics",
        title: "Separate trend from noise",
        goal: "Run-rate analysis and a simple trend confirmation.",
        instructions: [
          "Annualise each account's recent run-rate vs budget for the re-forecast candidates.",
          "Trend test (regression slope or rank test) on monthly variance % for the top drivers.",
          "State which variances are one-time vs structural — the review's core judgement.",
        ],
        hints: [
          "Run-rate = last 3 months actual × 4 (annualised); compare to annual budget — the Cloud re-baseline argument.",
          "A slope on 6 points is indicative, not definitive — say so, and let the monotone pattern speak too.",
          "One-time vs structural is the CFO's question in disguise: 'does June's number predict July?'",
        ],
        checkpoint: "Run-rate table for the structural suspects and the one-time/structural classification.",
      },
      {
        phase: "visualisation",
        title: "The review's five charts",
        goal: "Waterfall, diverging bars, heatmap, driver trends, budget-actual scatter.",
        instructions: [
          "Build the five; the waterfall and heatmap carry the meeting.",
          "Diverging bars: unfavourable left, favourable right, sorted by magnitude.",
          "Title charts with takeaways ('Two accounts carry two-thirds of the overrun').",
        ],
        hints: [
          "Waterfall: cumulative sum of department variances from zero; annotate each step's contribution.",
          "Heatmap of month × department variance % with a symmetric colour scale around zero.",
          "Scatter with y=x line: points below the line are underspend (for expenses, favourable) — label the outliers.",
        ],
        checkpoint: "Five charts, waterfall and heatmap presentation-ready.",
      },
      {
        phase: "interpretation",
        title: "Write the June storyline",
        goal: "Findings with drivers, trends and one-time/structural judgements.",
        instructions: [
          "Answer the five initial questions with figures attached.",
          "Classify each material variance: one-time event, run-rate drift, or planning error.",
          "Draft the commentary paragraph: what happened, why, what we do about it.",
        ],
        hints: [
          "The storyline skeleton: headline variance → structural drivers → self-correcting items → credits → actions.",
          "One-time vs structural is where analyst judgement earns its seat: usage-driven cloud costs are structural; a Q1 campaign overrun that already corrected is history.",
          "Every claim needs a table behind it — CFO reviews run on 'show me the line'.",
        ],
        checkpoint: "Five answered questions and the commentary paragraph drafted.",
      },
      {
        phase: "recommendations",
        title: "The review's action list",
        goal: "Specific finance actions with owners and horizons.",
        instructions: [
          "Write 3–4 recommendations tied to findings: the re-forecast, the alignment fix, the process rules.",
          "Name owners (CFO/department heads) and the next review's checkpoints.",
          "Include what would change each recommendation (monitoring triggers).",
        ],
        hints: [
          "Re-baseline vs freeze is the strategic choice: rising structural variance wants re-forecasting; discretionary overspend wants control.",
          "Process recommendations (materiality rule, credit separation) are cheap credibility wins.",
          "Checkpoints: what number, reviewed when, by whom — finance recommendations live and die by follow-through.",
        ],
        checkpoint: "The action list with owners and checkpoints.",
      },
      {
        phase: "report",
        title: "The one-page commentary",
        goal: "The CFO's June review document.",
        instructions: [
          "Structure: definitions → headline → drivers (waterfall) → shortlist table → actions → reconciliation appendix.",
          "One chart in the body (the waterfall); the shortlist as the body table.",
          "Keep the reconciliation note — it is what makes the numbers quotable.",
        ],
        hints: [
          "One page means decisions and drivers, not the full GL; the appendix carries the audit trail.",
          "The CFO will forward this — make every number self-contained (month, scope, threshold).",
          "Date-stamp and version the commentary; these documents become the comparison baseline next month.",
        ],
        checkpoint: "The commentary, every figure traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the acting finance analyst. Rebuild the H1 budget-vs-actual review the CFO can chair: variances by department and account, materiality-screened, with a June storyline and actions. Conventions (materiality thresholds, rebate treatment) are yours to set — documented.",
      deliverables: [
        "Defect table and reconciliation note (rows in/excluded/analysed)",
        "Variance analysis by month, department and account with materiality classification",
        "Top-driver trends with one-time vs structural judgement",
        "Four to five charts led by the variance waterfall",
        "One-page June commentary with actions, owners and checkpoints",
      ],
      guardrails: [
        "Missing actuals excluded from variance math and reconciled",
        "Percentage variances guarded against tiny denominators",
        "Rebate credits flagged, not netted into operating savings",
        "Every commentary number traceable to a table",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Budget numericised before totals; grain deduplicated",
        "Variance direction convention applied consistently (expenses: over = unfavourable)",
        "Run-rate arithmetic shown for structural suspects",
      ],
      "code-quality": [
        "Variance fields derived once, reused",
        "Reconciliation note maintained in code",
      ],
      reasoning: [
        "One-time vs structural distinction made explicitly",
        "Materiality thresholds justified, not just applied",
      ],
      visualization: [
        "Waterfall builds from zero to total variance",
        "Diverging bars distinguish direction with consistent colour semantics",
      ],
      interpretation: [
        "Credits vs savings distinction in the narrative",
        "Trend claims backed by run-rate or trend statistics",
      ],
      recommendations: [
        "Re-forecast vs control choice justified per driver",
        "Owners and checkpoints named",
      ],
    },
  },

  /* ================================================================ FIN-02 */
  {
    id: "financial-2",
    categoryId: "financial",
    difficulty: "intermediate",
    code: "FIN-02",
    title: "Working Capital & Cash Conversion Review",
    subtitle: "Eight thousand invoices: who is slow to pay, how slow, and what it costs.",
    summary:
      "Working-capital analysis: clean an AR/AP register, compute DSO/DPO by counterparty and month, analyse aging and payment behaviour, and recommend the cash the business can free.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["AR/AP analytics", "DSO/DPO metrics", "Aging analysis", "Working-capital arithmetic", "Treasurer's review"],

    businessBackground:
      "Brookline Components, a B2B electronics distributor, is profitable on paper but chronically tight on cash. The CFO suspects the cash conversion cycle has drifted: customers pay later than terms, and the company pays suppliers faster than it needs to. The board approved a working-capital review before the next credit facility negotiation. The invoice register — AR and AP, 8 months — is available; the CFO wants DSO and DPO measured properly, the worst counterparties named, and the cash-release opportunity quantified.",
    problemStatement:
      "Analyse the working-capital position from the invoice register: DSO and DPO by month and counterparty, aging distributions, terms-vs-actual payment behaviour, and the interest cost of the gap — then recommend the cash-release programme (collections focus, terms enforcement, payment-timing policy) with a quantified target.",
    businessObjectives: [
      "Compute DSO and DPO monthly with a stated method (and its caveats)",
      "Analyse aging buckets by counterparty and size; name the top offenders",
      "Quantify payment behaviour vs contractual terms (late-payment incidence and days)",
      "Estimate the cash freed by realistic DSO/DPO improvements (at the current interest rate)",
      "Deliver the working-capital review with a prioritised release programme",
    ],
    datasetDescription:
      "AR and AP invoice lines (~8,000 invoices): issue, due and paid dates, counterparty, amount, currency, department and status. Paid dates are missing on some closed invoices (a register defect), amounts mix currency-formatted strings, currencies are mixed (EUR/GBP rows need handling), a few due dates precede issue dates, statuses have casing variants, and duplicates exist. The analysis quality lives in the cleaning decisions: which invoices can support DSO math, and how the multi-currency tail is treated.",
    dataDictionary: [
      { column: "invoice_id", kind: "id", description: "Invoice identifier", example: "INV-2025-10842" },
      { column: "type", kind: "categorical", description: "AR (customer owes) or AP (we owe)", example: "AR" },
      { column: "issue_date", kind: "date", description: "Invoice issue date", example: "2025-03-14" },
      { column: "due_date", kind: "date", description: "Payment due date (a few precede issue)", example: "2025-04-13" },
      { column: "paid_date", kind: "date", description: "Payment date (blank if open; some closed missing)", example: "2025-05-02" },
      { column: "counterparty", kind: "text", description: "Customer (AR) or vendor (AP)", example: "Delta Foods GmbH" },
      { column: "amount", kind: "currency", description: "Invoice amount (format mix)", example: "$8,412.50" },
      { column: "currency", kind: "categorical", description: "USD majority; EUR/GBP minority", example: "EUR" },
      { column: "department", kind: "categorical", description: "Owning department (some missing)", example: "Operations" },
      { column: "status", kind: "categorical", description: "Paid / Open / Overdue / Partially paid (casing variants)", example: "Overdue" },
    ],
    initialQuestions: [
      "What are DSO and DPO by month, and in which direction are they moving?",
      "Which customers are the slowest payers, weighted by receivable value?",
      "What share of invoices is paid late, and by how many days on average?",
      "How does payment behaviour differ across AR terms and invoice sizes?",
      "How much cash would a 5-day DSO improvement and a 5-day DPO extension free, and at what carrying cost?",
    ],
    dataset: {
      name: "Brookline invoice register",
      filename: "financial-02-arap-register.csv",
      description: "8 months of AR and AP invoices with dates, counterparties and payment status.",
      rows: 8000,
    },

    dataQuality: [
      { issue: "Missing paid dates on closed invoices", where: "paid_date blank on Paid/Partially paid (~5% of closed)", detection: "closed = df[df.status.isin(['Paid','Partially paid'])]; closed.paid_date.isna()", treatment: "Exclude from DSO/DPO and payment-days math (counted); these are register defects, not open invoices — report to the AR team." },
      { issue: "Mixed currency", where: "currency — ~15% EUR/GBP", detection: "value_counts(currency)", treatment: "State the scope decision: analyse USD or convert at a documented fixed rate; never sum mixed currencies silently." },
      { issue: "Currency-formatted amounts", where: "amount — '$8,412.50' strings (~6%)", detection: "dtype object; contains('$')", treatment: "Strip and numericise (after currency scoping)." },
      { issue: "Impossible due dates", where: "due_date < issue_date", detection: "(df.due_date < df.issue_date).sum()", treatment: "Exclude from terms analysis (the terms are unreliable); likely entry errors — count and report." },
      { issue: "Status casing variants", where: "status — 'paid'/'Paid'/'PARTIALLY PAID'", detection: "value_counts()", treatment: "Canonicalise to four statuses; status drives open-vs-closed logic everywhere." },
      { issue: "Duplicate invoices", where: "~0.6% duplicated rows", detection: "duplicated('invoice_id').sum()", treatment: "Drop; duplicates double-count receivables and payables." },
    ],
    cleaningPlan: [
      { action: "Canonicalise status; deduplicate; resolve currency scope (USD core, documented rate for minority)", rationale: "Money math needs one currency and one status vocabulary." },
      { action: "Separate analysable invoices (closed with dates) from register defects and open items", rationale: "DSO/DPO are paid-invoice metrics; each exclusion counted." },
      { action: "Derive payment_days (paid − issue), lateness (paid − due), and aging buckets for open items", rationale: "The behaviour metrics the review turns on." },
      { action: "Build month × type analysis frames with value-weighted and count-based metrics side by side", rationale: "DSO by count and by value tell different stories; big invoices dominate cash." },
    ],
    edaPlan: [
      { question: "Monthly DSO/DPO trend", method: "value-weighted payment days by month and type", expectation: "DSO drifting up ~5 days over 8 months; DPO flat." },
      { question: "Aging of open AR", method: "open AR by days-overdue bucket", expectation: "A meaningful 90+ day tail — the collections target list." },
      { question: "Worst payers", method: "value-weighted average lateness by customer, top 10", expectation: "2–3 customers with 30+ day average lateness." },
      { question: "Late-payment incidence", method: "share of invoices paid late; average days late by size bucket", expectation: "~35% late overall; smaller invoices later (less escalation)." },
      { question: "Terms comparison", method: "payment days by due-term (30/45/60)", expectation: "60-day terms paid proportionally later — terms stretch, behaviour follows." },
      { question: "AP urgency profile", method: "AP payment days vs terms; early-payment share", expectation: "Paying suppliers ~6 days early on average — free DPO being left unused." },
    ],
    statisticsPlan: [
      { technique: "Value-weighted DSO/DPO (with count-weighted companion)", purpose: "Cash-relevant metrics that resist small-invoice noise", expectation: "Value-weighted DSO several days higher than count-weighted — big invoices are slower." },
      { technique: "Lateness distribution analysis (P50/P90 by segment)", purpose: "Understand tail behaviour, not just means", expectation: "Median lateness ~0 (most pay on time); P90 ~20 days — a tail problem, not a culture problem." },
      { technique: "Cash-release simulation at a stated interest rate", purpose: "Translate DSO/DPO days into cash and carrying cost", expectation: "5-day DSO improvement frees ~$600–800k; carrying value at 7% ≈ $45–55k/yr." },
      { technique: "Counterparty concentration risk (top-5 share of overdue AR)", purpose: "Prioritise collections by exposure", expectation: "Top 5 customers hold over half the overdue value — a short, high-value focus list." },
    ],
    visualisationPlan: [
      { chart: "Dual line — monthly DSO vs DPO with gap annotation", answers: "Is the cash cycle widening?", reads: "The widening gap between the lines is the story; annotate days." },
      { chart: "Stacked bar — open AR by aging bucket over months", answers: "Is the tail growing?", reads: "The 90+ segment's growth (or not) over time." },
      { chart: "Bar — top customers by value-weighted lateness (with exposure labels)", answers: "Who should collections call?", reads: "Sorted bars; exposure in dollars as bar labels." },
      { chart: "Histogram — days late distribution (P50/P90 marked)", answers: "Is lateness broad or a tail?", reads: "Mass at zero, tail right; the policy question is tail management." },
      { chart: "Scatter — invoice size vs payment days (AR, log x)", answers: "Do big invoices behave differently?", reads: "Pattern of size vs speed; the value-weighted story visible." },
    ],
    findings: [
      "The cash conversion gap is widening: DSO has drifted up roughly 5 days over eight months (value-weighted, now ~47 days) while DPO sits flat near 33 — the cycle lengthens from the customer side only.",
      "Lateness is a tail, not a culture: most invoices pay on time, but the 90th-percentile invoice is ~20 days late and the 90+ day aging bucket holds a growing share of open AR.",
      "Value-weighted DSO runs several days above count-weighted: large invoices are systematically slower, so the cash problem concentrates in a handful of large, slow accounts.",
      "The top five customers hold over half the overdue AR value, and two of them average 30+ days late — the collections programme is a short list, not a mail-merge.",
      "On the payable side, the company pays suppliers ~6 days earlier than terms require on average — unused DPO worth roughly $400k of standing cash.",
    ],
    recommendations: [
      { what: "Launch a focused collections programme on the top-5 overdue customers (weekly cadence, escalation triggers, credit hold policy)", why: "Half the overdue value sits with five names; a focused programme beats a blanket one.", impact: "Recover a large share of the 90+ bucket in 60–90 days", horizon: "immediate" },
      { what: "Adopt a payment-timing policy that pays suppliers at term (not before) unless an early-payment discount applies", why: "~6 days of unused DPO is free cash within existing supplier relationships.", impact: "~$400k standing cash released", horizon: "immediate" },
      { what: "Add late-payment terms (interest or early-pay discounts) to the two chronically late large accounts at next renewal", why: "Their behaviour is structural; contract terms are the durable lever.", impact: "Aligns the worst behaviour with cash economics", horizon: "this quarter" },
      { what: "Report value-weighted DSO monthly with the aging tail (90+ share) as the two KPIs", why: "Count-weighted metrics hid the problem; the tail metric makes regression visible early.", impact: "Early-warning discipline", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Brookline's cash squeeze is measurable and fixable. The cash conversion cycle is widening from the customer side: value-weighted DSO has drifted to ~47 days (+5 over eight months) while DPO is flat at 33 — and large invoices are the slow ones, so the problem concentrates in a short list of accounts. Half the overdue AR sits with five customers; a focused collections programme there, plus a pay-at-term policy that recaptures ~6 days of unused DPO (~$400k), addresses the majority of the gap without touching the business model. Contract-term changes at renewal handle the two structurally late accounts. Metrics move to value-weighted DSO and the 90+ aging share so the next drift is caught in weeks, not quarters.",
      structure: [
        "1. The board's question and scope (currency treatment stated)",
        "2. Register quality: defects, exclusions, reconciliation",
        "3. DSO/DPO trend and the widening cycle",
        "4. Aging and the overdue tail",
        "5. Counterparty analysis: the focus list",
        "6. Payment behaviour: terms, size, and the early-payment finding",
        "7. The cash-release programme with quantified targets",
        "8. Appendix: cleaning log, methodology notes, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Understand the register's semantics",
        goal: "AR vs AP, open vs closed, and which invoices can support which metric.",
        instructions: [
          "Map the register: type (AR/AP) × status (Paid/Open/Overdue/Partially paid) — counts and value by cell.",
          "Understand metric eligibility: DSO/DPO need closed invoices with dates; aging needs open items; register defects support neither.",
          "Note the currency mix and decide the scope treatment before any sum.",
        ],
        hints: [
          "The eligibility question IS the methodology: which rows can answer which question, and what's excluded — write it as a table.",
          "Open AR aging uses TODAY (or the register date) vs due date; paid-invoice DSO uses paid − issue. Different rows, different metrics.",
          "Currency: fixed-rate conversion with the rate documented beats silent summation; USD-core scoping is also defensible if stated.",
        ],
        checkpoint: "The eligibility map, currency decision, and the type × status value table.",
        code: {
          label: "Register map",
          language: "python",
          source: `df = pd.read_csv("financial-02-arap-register.csv", parse_dates=["issue_date", "due_date", "paid_date"])
df["status"] = df["status"].str.title()
print(df.pivot_table(index="type", columns="status", values="amount",
                     aggfunc="count", fill_value=0))
print(df["currency"].value_counts(normalize=True))`,
        },
      },
      {
        phase: "quality",
        title: "Audit the register",
        goal: "Every defect counted with its metric consequence.",
        instructions: [
          "Quantify: missing paid dates on closed, impossible due dates, format strings, duplicates, casing.",
          "For each defect, state which metric it corrupts and the treatment.",
          "Produce the exclusion ledger — finance audiences ask for it.",
        ],
        hints: [
          "Missing paid_date on a Paid invoice is a register defect (vs blank-on-open, which is correct) — different treatments, different counts.",
          "Impossible due dates corrupt lateness math: paid − due is meaningless when due < issue.",
          "The exclusion ledger format: defect, rows, affected metric, treatment. Ten rows, total credibility.",
        ],
        checkpoint: "The audit table with metric consequences and the exclusion ledger.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frames",
        goal: "Paid-invoice frame (behaviour metrics) and open-invoice frame (aging).",
        instructions: [
          "Apply treatments; build the paid frame with payment_days and lateness derived.",
          "Build the open frame with days_overdue and aging buckets at a stated as-of date.",
          "Value-weight everything alongside count-weighted versions.",
        ],
        hints: [
          "payment_days = (paid − issue).days; lateness = (paid − due).days; both need valid date pairs only.",
          "As-of date for aging: max(issue_date) in the register (documented) — using 'today' on an old register inflates aging.",
          "Value-weighting pattern: weighted_avg = (days × amount).sum() / amount.sum() — write it as a helper, use it everywhere.",
        ],
        checkpoint: "Both frames built with derived behaviour fields.",
        code: {
          label: "Behaviour frames",
          language: "python",
          source: `paid = df[df["paid_date"].notna() & (df["due_date"] >= df["issue_date"])].copy()
paid["payment_days"] = (paid["paid_date"] - paid["issue_date"]).dt.days
paid["lateness"] = (paid["paid_date"] - paid["due_date"]).dt.days

AS_OF = df["issue_date"].max()
open_ar = df[(df["type"] == "AR") & (df["status"].isin(["Open", "Overdue", "Partially Paid"]))].copy()
open_ar["days_overdue"] = (AS_OF - open_ar["due_date"]).dt.days
open_ar["aging_bucket"] = pd.cut(open_ar["days_overdue"], [-10**6, 0, 30, 60, 90, 10**6],
    labels=["Current", "1-30", "31-60", "61-90", "90+"])`,
        },
      },
      {
        phase: "eda",
        title: "The working-capital picture",
        goal: "DSO/DPO trends, aging, worst payers, lateness patterns.",
        instructions: [
          "Monthly value-weighted DSO and DPO; the widening-gap check.",
          "Aging distribution of open AR (value by bucket); top-10 customers by value-weighted lateness.",
          "Lateness distribution (P50/P90); late incidence by size bucket; AP early-payment profile.",
        ],
        hints: [
          "The DSO/DPO dual line with an annotated gap is the review's first exhibit — build it early.",
          "Worst-payer ranking must carry exposure dollars, not just days: 40 days late on $2M ≠ 40 days on $20k.",
          "The AP early-payment finding (paying before terms) is the free-money insight — quantify it in days and dollars.",
        ],
        checkpoint: "Trends, aging table, focus list, and the lateness distribution understood.",
        code: {
          label: "DSO/DPO trend",
          language: "python",
          source: `paid["month"] = paid["issue_date"].dt.to_period("M")
def wavg(g):
    return (g["payment_days"] * g["amount"]).sum() / g["amount"].sum()
trend = paid.groupby(["month", "type"]).apply(wavg, include_groups=False).unstack()
print(trend.round(1))

lat = paid[paid["type"] == "AR"].groupby("counterparty").agg(
    avg_late=("lateness", "mean"), exposure=("amount", "sum"))
print(lat.sort_values("exposure", ascending=False).head(10).round(1))`,
        },
      },
      {
        phase: "statistics",
        title: "Quantify the release",
        goal: "Cash-release simulation with stated assumptions.",
        instructions: [
          "Simulate: 5-day DSO improvement × daily revenue → cash freed; 5-day DPO extension × daily COGS → additional standing cash.",
          "Compute carrying value at a stated interest rate (assumption labelled).",
          "Concentration analysis: top-5 share of overdue value for the collections focus case.",
        ],
        hints: [
          "Cash freed by DSO days = (daily credit sales) × (DSO improvement); daily sales from the register's annualised AR value.",
          "Carrying cost = cash freed × annual rate — an assumption (7% is a defensible placeholder), labelled as such.",
          "Concentration: top5_overdue_value / total_overdue_value — if it's over half, the programme is a list, not a campaign.",
        ],
        checkpoint: "The release table with assumptions labelled and the concentration number.",
      },
      {
        phase: "visualisation",
        title: "The treasurer's exhibits",
        goal: "Five charts led by the DSO/DPO gap.",
        instructions: [
          "Dual line DSO/DPO; aging stacked bars over months; top-payer bars with exposure labels; lateness histogram with P50/P90; size-vs-days scatter.",
          "Annotate the cycle gap in days on the dual line.",
          "Colour the aging 90+ bucket distinctly — it's the visual anchor of the collections case.",
        ],
        hints: [
          "Two lines, one y-axis, gap annotated at first and last month — simple beats clever here.",
          "Exposure labels on the payer bars: '$1.2M · 38d avg' — days and dollars in one label.",
          "Histogram with zero-line marked; the mass-at-zero, tail-right shape is the policy argument.",
        ],
        checkpoint: "Five exhibits, dual-line chart presentation-ready.",
      },
      {
        phase: "interpretation",
        title: "Read the cycle honestly",
        goal: "Findings with weights, tails and assumptions disclosed.",
        instructions: [
          "Answer the five initial questions with value-weighted figures primary, count-weighted companion.",
          "Distinguish structural behaviour (chronic late payers) from drift (DSO trend) and one-offs.",
          "Disclose the simulation's assumptions (interest rate, daily-sales basis) inline.",
        ],
        hints: [
          "Every days figure should state its weighting — '47 days value-weighted' vs '41 by count' are different diagnoses.",
          "Structural vs drift: chronic late accounts are a contracts problem; DSO drift is a process problem. Different fixes.",
          "Assumption disclosure is what lets a treasurer reuse your arithmetic with their own rate.",
        ],
        checkpoint: "Five answered questions with weightings and assumptions inline.",
      },
      {
        phase: "recommendations",
        title: "The release programme",
        goal: "Prioritised actions with cash values and owners.",
        instructions: [
          "Rank the programme by cash freed per unit of relationship risk.",
          "Assign owners (AR team, procurement, sales-contracting) and 90-day targets.",
          "Include the KPI change (value-weighted DSO + 90+ share) as the monitoring commitment.",
        ],
        hints: [
          "Pay-at-term is the lowest-risk cash in the programme — it needs no customer conversation.",
          "Collections targets: bucket recovery % and DSO days, reviewed monthly.",
          "The KPI recommendation prevents metric regression — the count-weighted habit is how the drift hid.",
        ],
        checkpoint: "The programme table with cash values, owners and targets.",
      },
      {
        phase: "report",
        title: "The working-capital review",
        goal: "A board-creditable review with methodology transparency.",
        instructions: [
          "Follow the outline; open with the widening-cycle finding.",
          "Methodology notes (weighting, as-of date, currency treatment, exclusions) boxed in the body.",
          "The release programme is the closing section with the 90-day targets.",
        ],
        hints: [
          "Board-creditable means: every headline number has a method note and every assumption is labelled.",
          "The one-sentence version: 'Customers pay 5 days slower than eight months ago, we pay 6 days too early, and five names hold half the overdue money.'",
          "Reconciliation appendix: exclusions by category with counts — finance reviewers look there first.",
        ],
        checkpoint: "The complete review, reproducible from the register CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the working-capital analyst. The CFO needs DSO/DPO measured defensibly, the slowest payers named with exposure, and the cash-release programme quantified. Currency treatment, weighting method and as-of conventions are yours — documented and applied consistently.",
      deliverables: [
        "Register audit and exclusion ledger",
        "Monthly value-weighted DSO/DPO with count-weighted companions",
        "Aging analysis and the top-overdue focus list with exposure values",
        "Lateness distribution analysis (incidence, P50/P90, size effects)",
        "Cash-release programme with simulation assumptions and 90-day targets",
      ],
      guardrails: [
        "No mixed-currency summation without documented treatment",
        "Register defects (missing paid dates on closed) excluded and counted",
        "Value-weighted figures primary, weighting always stated",
        "Simulation assumptions labelled inline",
      ],
    },

    evaluationChecks: {
      correctness: [
        "DSO/DPO computed on eligible (closed, dated) invoices only",
        "Value-weighted averages use amount × days / amount arithmetic",
        "Aging as-of date stated and applied consistently",
      ],
      "code-quality": [
        "Weighted-average helper reused; frames separated by eligibility",
        "Exclusion ledger maintained",
      ],
      reasoning: [
        "Count vs value weighting distinction maintained in narrative",
        "Structural vs drift behaviour separated",
      ],
      visualization: [
        "DSO/DPO gap annotated with magnitudes",
        "Focus-list bars carry exposure values",
      ],
      interpretation: [
        "Tail-vs-culture finding articulated (P50/P90 evidence)",
        "Early-payment (unused DPO) finding quantified",
      ],
      recommendations: [
        "Cash values attached to each action",
        "KPI/monitoring change included",
      ],
    },
  },

  /* ================================================================ FIN-03 */
  {
    id: "financial-3",
    categoryId: "financial",
    difficulty: "advanced",
    code: "FIN-03",
    title: "Portfolio Risk & Return Study",
    subtitle: "Eight assets, two years of prices: measure the risk that was taken for the return that was earned.",
    summary:
      "Portfolio analytics: compute returns and risk from a long-format price panel, build the correlation structure, sketch the efficient frontier, diagnose drawdowns, and recommend an allocation with its assumptions laid bare.",
    hours: 15,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Return computation", "Volatility & correlation", "Portfolio optimisation (Markowitz)", "Drawdown analysis", "Risk communication"],

    businessBackground:
      "Meridian Family Office holds a eight-asset portfolio (five equities across sectors, a bond fund, a gold ETF and a money-market fund) and has just lived through two volatile years. The investment committee's standing question — 'how much risk did we actually take, and was it worth it?' — has never been answered with data. The custodian's price file is finally assembled, and the committee has commissioned a risk-and-return study before the annual allocation review: measure realised risk and return, the diversification that did and didn't happen, and what the data says an allocation should have been.",
    problemStatement:
      "Characterise portfolio risk and return from two years of daily prices: compute returns and volatility per asset, the correlation structure and its stability, portfolio-level performance including drawdowns, and a mean-variance efficient frontier — then recommend an allocation for the review with explicit assumptions, out-of-sample honesty and the study's limitations stated.",
    businessObjectives: [
      "Compute daily/monthly returns, volatilities, Sharpe ratios per asset from clean prices",
      "Analyse the correlation structure (including regime shifts and bond diversification failure)",
      "Measure realised portfolio performance: return, volatility, VaR, and maximum drawdown",
      "Sketch the efficient frontier with estimate-error honesty (resampling or shrinkage)",
      "Recommend an allocation with assumptions, sensitivity and limitations explicit",
    ],
    datasetDescription:
      "Long-format daily prices (~4,000 rows): eight assets × ~500 trading days with close, volume, dividends and metadata. Some closes are missing (must be handled without inventing returns), a handful of price spikes are data errors (10×), ticker casing varies on a few rows, duplicates exist, and volumes occasionally read zero. Wide-format pivoting, return computation and the treatment of the errors determine everything downstream — this is a dataset where cleaning IS methodology.",
    dataDictionary: [
      { column: "date", kind: "date", description: "Trading date", example: "2024-06-11" },
      { column: "ticker", kind: "categorical", description: "Asset ticker (casing variants)", example: "NOVA" },
      { column: "asset_class", kind: "categorical", description: "Equity / Fixed Income / Commodity / Cash", example: "Equity" },
      { column: "sector", kind: "categorical", description: "Sector or sub-type", example: "Technology" },
      { column: "close", kind: "currency", description: "Closing price (gaps and 10× errors exist)", example: "148.20" },
      { column: "volume", kind: "integer", description: "Daily volume (zero days exist)", example: "2310000" },
      { column: "dividends", kind: "currency", description: "Dividend paid that day", example: "0.000" },
    ],
    initialQuestions: [
      "What are the annualised return, volatility and Sharpe ratio of each asset over the window?",
      "How do correlations behave — stable, drifting, or regime-dependent — and did the bond sleeve diversify when equities fell?",
      "What was the realised portfolio's maximum drawdown, when, and how long the recovery?",
      "What allocation does mean-variance optimisation suggest, and how much does it move when inputs are perturbed?",
      "What allocation should the committee actually consider, given estimation error and the study's limits?",
    ],
    dataset: {
      name: "Meridian daily prices",
      filename: "financial-03-asset-prices.csv",
      description: "2 years of daily prices for 8 assets across classes, long format.",
      rows: 4000,
    },

    dataQuality: [
      { issue: "Missing closes (gaps)", where: "close blank on ~1% of asset-days", detection: "pivot wide; count NaN per ticker", treatment: "Two defensible choices: forward-fill prices then compute returns (returns on gap days become 0) or drop the asset-day. NEVER interpolate returns across gaps; document choice and its effect on volatility." },
      { issue: "10× price spikes (data errors)", where: "close ~10× the local level on isolated days", detection: "returns distribution; |daily return| > 50% flags", treatment: "These are custodial errors, not crashes: detect via |return| thresholds and local context, repair from neighbouring prices (or mark and exclude), and report — uncorrected they distort every statistic." },
      { issue: "Ticker casing variants", where: "ticker — 'aapl'-style on a few rows", detection: "nunique tickers > 8 after pivot", treatment: "Upper-case; the 8 canonical assets are the study's universe." },
      { issue: "Duplicate date-ticker rows", where: "~10 duplicated rows", detection: "duplicated(['date','ticker']).sum()", treatment: "Drop — a duplicate price day creates a false return series break." },
      { issue: "Zero-volume days", where: "volume == 0 (~0.6%)", detection: "(df['volume'] == 0).sum()", treatment: "Report; zero-volume with a valid price is a data-feed artifact — decide (keep price, note) rather than silently dropping." },
      { issue: "Dividend handling", where: "dividends nonzero on some days", detection: "sum(dividends) > 0", treatment: "Decide total-return vs price-return basis and state it; for a Sharpe study, total return is the defensible choice." },
    ],
    cleaningPlan: [
      { action: "Canonicalise tickers; deduplicate; build the wide price matrix with a DatetimeIndex", rationale: "Return computation needs a clean price panel — one row per date, one column per asset." },
      { action: "Detect and repair 10× spike errors from neighbouring prices (documented, counted)", rationale: "Fabricated crashes distort vol, drawdown and correlations — every downstream number." },
      { action: "Handle gaps with a stated policy (ffill prices, returns→0 on gaps)", rationale: "Method transparency beats method perfection; gaps must not create fake volatility." },
      { action: "Compute total-return series (price + dividends) and daily log or simple returns", rationale: "State the return basis once; Sharpe and frontier math depend on it." },
    ],
    edaPlan: [
      { question: "Price and return landscape", method: "normalised price series; return histograms per asset", expectation: "Tech equity (NOVA) highest return and vol; bond fund lowest; gold mid with fat tails." },
      { question: "Volatility clustering", method: "rolling 30-day volatility for equities", expectation: "Clear clustering — vol regimes exist; a variance study must acknowledge them." },
      { question: "Correlation structure", method: "correlation heatmap; rolling 60-day equity-bond correlation", expectation: "Equity-equity ~0.5–0.7; equity-bond correlation drifting toward zero/positive late in the window — diversification decay." },
      { question: "Drawdown anatomy", method: "drawdown series for an equal-weight portfolio", expectation: "One deep drawdown mid-window (~18–22%) with multi-month recovery." },
      { question: "Volume patterns", method: "volume by asset over time", expectation: "Spikes coincide with drawdown days — activity context for the risk narrative." },
      { question: "Risk-adjusted ranking", method: "annualised Sharpe per asset (rf = stated assumption)", expectation: "Gold and tech equity lead on Sharpe; the money-market fund anchors the low end." },
    ],
    statisticsPlan: [
      { technique: "Return/vol/Sharpe computation with annualisation", purpose: "The per-asset risk-return table", expectation: "Annualised vols from ~3% (cash) to ~35% (NOVA); Sharpes 0.4–1.2." },
      { technique: "Rolling correlation analysis (equity-bond)", purpose: "Test diversification stability across regimes", expectation: "Correlation instability documented — a key input assumption challenged." },
      { technique: "Portfolio metrics: return, vol, VaR (historical), max drawdown, recovery months", purpose: "The realised experience, not just annualised averages", expectation: "Equal-weight portfolio ~13–15% vol with a deep drawdown the averages hide." },
      { technique: "Mean-variance frontier with resampled optimisation (or shrinkage)", purpose: "Frontier positions with estimation-error honesty", expectation: "Naive max-Sharpe concentrates absurdly; resampled versions spread — the error message IS the finding." },
      { technique: "Out-of-sample sanity check (split the window)", purpose: "Would the first-year optimum have worked in year two?", expectation: "Degraded but directionally useful — humbling and reportable." },
    ],
    visualisationPlan: [
      { chart: "Normalised price series (all assets, log scale)", answers: "What did two years feel like?", reads: "Divergence of levels; the drawdown visible to the eye." },
      { chart: "Correlation heatmap with rolling equity-bond inset", answers: "Did diversification hold?", reads: "Block structure; the inset shows the decay." },
      { chart: "Risk-return scatter with Sharpe labels", answers: "What paid for its risk?", reads: "Dots on the vol-return plane; the efficient few above the cloud." },
      { chart: "Drawdown (underwater) chart for the equal-weight portfolio", answers: "How deep, how long?", reads: "Troughs annotated with depth and recovery duration." },
      { chart: "Efficient frontier with resampled variants (fan)", answers: "What should we hold — and how sure are we?", reads: "Naive frontier vs resampled fan; concentration warning visible." },
    ],
    findings: [
      "Risk was not evenly priced across the book: annualised volatility ranges from ~3% (money market) to ~35% (the tech equity), and realised Sharpe ratios cluster in a narrow 0.7–1.2 band — concentration in the tech name added vol without clearly adding risk-adjusted return.",
      "Diversification decayed: the equity-bond correlation drifted from firmly negative early in the window toward zero late — the bond sleeve protected the first equity drawdown far better than the second, a regime finding the committee should not extrapolate.",
      "The equal-weight portfolio's realised experience is dominated by one mid-window drawdown of roughly 20% with a multi-month recovery — annualised averages understate the lived risk materially.",
      "Naive mean-variance optimisation concentrates almost everything in two assets (an artefact of estimated inputs); resampling the optimisation across input perturbations produces a stable, diversified core the committee can actually discuss.",
      "Out-of-sample, the first year's optimal allocation would have underperformed a simple equal-weight risk-adjusted benchmark in year two — estimation error, not the theory, is the binding constraint at this data scale.",
    ],
    recommendations: [
      { what: "Anchor the review on a resampled-optimisation core (diversified equity sleeve, meaningful bond and gold ballast) rather than naive max-Sharpe weights", why: "Estimation error dominates at this window length; resampled weights are the honest answer.", impact: "Allocations the committee can adopt without betting on noise", horizon: "this quarter" },
      { what: "Cap single-asset equity exposure at a stated share of the book", why: "The tech name added volatility without superior risk-adjusted return; concentration is a choice that should be explicit.", impact: "Drawdown reduction at modest return cost", horizon: "immediate" },
      { what: "Re-underwrite the bond sleeve's diversification assumption annually with rolling correlation monitoring", why: "The equity-bond relationship is regime-dependent and decayed within the window.", impact: "Prevents extrapolating a diversification that may not persist", horizon: "longer term" },
      { what: "Adopt drawdown (depth and recovery) alongside volatility as standing committee metrics", why: "Volatility understated the lived experience; drawdown is the risk the committee actually discusses.", impact: "Better risk governance vocabulary", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "Two years of daily data answer the committee's question with texture. The book's risk was concentrated: one tech equity at ~35% volatility against a 0.7–1.2 Sharpe band across assets — concentration that added vol more than risk-adjusted return. Diversification decayed within the window (equity-bond correlation drifting to zero), so the bond sleeve protected the first drawdown better than the second. The lived portfolio experience — a ~20% drawdown and multi-month recovery — is the risk the committee actually remembers, and it argues for drawdown metrics alongside volatility. The optimisation results counsel humility: naive max-Sharpe weights are noise-concentrated artefacts, while resampled optimisation produces a diversified core worth discussing. The recommendation: a capped, resampled-core allocation with annual re-underwriting of the bond diversification assumption.",
      structure: [
        "1. The committee's question and study scope",
        "2. Price data construction: cleaning, gaps, error repair, return basis",
        "3. Per-asset risk and return (with Sharpe assumptions stated)",
        "4. Correlation structure and its stability",
        "5. Realised portfolio experience: return, vol, VaR, drawdown",
        "6. Efficient frontier with estimation-error treatment",
        "7. The allocation recommendation and monitoring plan",
        "8. Appendix: cleaning log, methodology choices, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Own the return basis before computing",
        goal: "Wide price matrix, return basis (total vs price), and the universe confirmed at 8 assets.",
        instructions: [
          "Pivot to wide (date × ticker); confirm exactly 8 tickers; check the date index continuity.",
          "Decide and document: total-return basis (prices + dividends reinvested — recommended for Sharpe work) and simple daily returns.",
          "Note the gap and spike patterns at the wide-matrix stage — they're the cleaning agenda.",
        ],
        hints: [
          "Long→wide is the analysis's enabling move: prices = df.pivot(index='date', columns='ticker', values='close').sort_index().",
          "Return basis matters: price-only returns understate the bond fund's contribution by its yield; state the basis once, apply it everywhere.",
          "df.isna().sum() on the wide matrix is the gap census; a returns-histogram preview exposes the 10× spikes immediately.",
        ],
        checkpoint: "A wide price matrix, 8 confirmed assets, basis decision documented.",
        code: {
          label: "Wide matrix",
          language: "python",
          source: `df = pd.read_csv("financial-03-asset-prices.csv", parse_dates=["date"])
df["ticker"] = df["ticker"].str.upper().str.strip()
df = df.drop_duplicates(["date", "ticker"])
px = df.pivot(index="date", columns="ticker", values="close").sort_index()
print(px.shape, px.isna().sum())
rets = px.pct_change()
print((rets.abs() > 0.5).sum())  # spike census`,
        },
      },
      {
        phase: "quality",
        title: "Detect the custodial errors",
        goal: "Spikes isolated, gaps counted, duplicates gone — each with a treatment.",
        instructions: [
          "Isolate |return| > 50% days; examine local context to confirm custodial error vs genuine crash.",
          "Gap census per asset; volume-zero report; dividends summary.",
          "Write the treatments: repair spikes from neighbours, ffill gaps (stated), keep zero-volume prices (noted).",
        ],
        hints: [
          "A genuine crash is market-wide; a custodial spike is single-asset with clean neighbours — the cross-sectional check is the discriminator.",
          "Repair rule: replace the spike price with the previous close (return 0 that day) and log the repair — the count goes in the report.",
          "Gap policy: ffill prices, then returns on the gap day are 0 — the alternative (dropping) creates phantom jumps.",
        ],
        checkpoint: "The error/gap census with treatments and repair counts.",
      },
      {
        phase: "cleaning",
        title: "Build the return series",
        goal: "Clean total-return series with documented methodology.",
        instructions: [
          "Apply repairs; build the adjusted price (with dividends) and compute daily returns.",
          "Verify: return distributions sane (no |r| > 50%), series lengths equal across assets.",
          "Compute annualised return and vol per asset — the study's first table.",
        ],
        hints: [
          "Total return approximation: add dividend/price to the simple return on ex-div days — sufficient for this study at these dividend levels.",
          "Annualisation: mean_daily × 252 and std_daily × √252 — state the convention; log vs simple returns change the tail numbers slightly.",
          "The verification step (no extreme returns left) is the checkpoint that the cleaning worked — run it as an assert.",
        ],
        checkpoint: "Clean return series and the per-asset annualised table.",
        code: {
          label: "Return series",
          language: "python",
          source: `spikes = rets.abs() > 0.5
for tick in px.columns:
    bad = spikes[tick] & spikes[tick].shift(-1, fill_value=False).map({True: False})  # single-day spikes
    px.loc[bad[tick].fillna(False).values, tick] = np.nan

px_clean = px.ffill()
rets_clean = px_clean.pct_change().dropna(how="all")
ann = pd.DataFrame({
    "return": rets_clean.mean() * 252,
    "vol": rets_clean.std() * np.sqrt(252)})
ann["sharpe"] = (ann["return"] - 0.03) / ann["vol"]  # rf = 3% stated assumption
print(ann.round(3))`,
        },
      },
      {
        phase: "eda",
        title: "Structure and experience",
        goal: "Correlation behaviour, vol clustering, and the drawdown anatomy.",
        instructions: [
          "Correlation heatmap; rolling 60-day equity-bond correlation series.",
          "Rolling 30-day volatility for the equity sleeve (clustering).",
          "Equal-weight portfolio: return series, drawdown series, max drawdown and recovery.",
        ],
        hints: [
          "The rolling equity-bond correlation is the study's sleeper finding — plot it as its own exhibit.",
          "Drawdown: cummax − value, as a negative series; recovery = months from trough back to prior peak.",
          "Equal-weight is the honest baseline: any recommended allocation must beat it out-of-sample to justify itself.",
        ],
        checkpoint: "Correlation behaviour characterised; drawdown depth and recovery quantified.",
        code: {
          label: "Drawdown anatomy",
          language: "python",
          source: `import numpy as np

w = np.ones(len(rets_clean.columns)) / len(rets_clean.columns)
port = rets_clean.fillna(0) @ w
cum = (1 + port).cumprod()
dd = cum / cum.cummax() - 1
print("max drawdown:", f"{dd.min():.1%}")
recovery = dd[dd.idxmin():][dd[dd.idxmin():] >= 0]
print("recovery months:", round(len(recovery) / 21, 1))

print(rets_clean.corr().round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "Frontier with honest error bars",
        goal: "Naive vs resampled optimisation; out-of-sample sanity check.",
        instructions: [
          "Compute the naive max-Sharpe weights on the full window (expected: absurd concentration).",
          "Resample: re-optimise over bootstrap or sub-window inputs; average weights; compare stability.",
          "Out-of-sample: optimise on year one, evaluate on year two vs equal-weight.",
        ],
        hints: [
          "Simple two-fund solver: for a grid of target returns, min variance w'Σw s.t. w'μ = target, Σw = 1 — scipy.optimize or the closed-form two-asset trick both work.",
          "Resampling at this scale: block-bootstrap the return matrix (keep autocorrelation), re-estimate inputs, re-optimise, average — 200 draws is plenty for the fan.",
          "The out-of-sample table is the committee's favourite exhibit: what year-one maths would have bought in year two.",
        ],
        checkpoint: "Naive weights, resampled weights, and the out-of-sample comparison table.",
        code: {
          label: "Naive vs resampled",
          language: "python",
          source: `mu, Sigma = rets_clean.mean() * 252, rets_clean.cov() * 252

def max_sharpe(mu, Sigma, rf=0.03):
    from scipy.optimize import minimize
    n = len(mu)
    neg = lambda w: -(mu @ w - rf) / np.sqrt(w @ Sigma @ w)
    cons = {"type": "eq", "fun": lambda w: w.sum() - 1}
    res = minimize(neg, np.ones(n)/n, constraints=cons,
                   bounds=[(0, 1)]*n)
    return res.x

w_naive = max_sharpe(mu.values, Sigma.values)
print("naive weights:", dict(zip(mu.index, w_naive.round(3))))

rng_draws = [max_sharpe(rets_clean.sample(frac=1, replace=True).mean().values*252,
                        rets_clean.sample(frac=1, replace=True).cov().values*252)
             for _ in range(100)]
w_resamp = np.mean(np.array([w for w in rng_draws if np.isfinite(w).all()]), axis=0)
print("resampled weights:", dict(zip(mu.index, w_resamp.round(3))))`,
        },
      },
      {
        phase: "visualisation",
        title: "The committee's exhibit set",
        goal: "Normalised prices, correlation heatmap with rolling inset, risk-return scatter, underwater chart, frontier fan.",
        instructions: [
          "Build the five; the underwater chart and frontier fan carry the risk narrative.",
          "Annotate the underwater chart's trough (depth, date, recovery months).",
          "Frontier fan: naive frontier line plus resampled frontier band.",
        ],
        hints: [
          "Normalised prices on a log scale so relative drawdowns compare fairly across levels.",
          "Underwater chart: fill_between to zero, trough annotated — the committee's memory made visible.",
          "Scatter with asset labels and a Sharpe-colour scale; the frontier fan shows where naive confidence exceeds resampled stability.",
        ],
        checkpoint: "Five exhibits, underwater and frontier fan polished.",
      },
      {
        phase: "interpretation",
        title: "Translate risk into committee language",
        goal: "Findings with risk language a non-quant committee can act on.",
        instructions: [
          "Answer the five questions with figures; keep annualisation and rf assumptions inline.",
          "Explain estimation error in one paragraph a committee member can repeat.",
          "State the study's limits: two years, one regime transition, eight assets, no liabilities modelled.",
        ],
        hints: [
          "Translation pattern: 'the tech equity ran at 3× the portfolio's average volatility for a Sharpe in the same band — extra risk without clearly extra reward.'",
          "Estimation error in committee language: 'the optimiser treats our two-year estimates as facts; perturb them slightly and the \"optimal\" weights move wildly — hence the resampled core.'",
          "Limits are not confessions; they're scope statements that make the recommendation usable.",
        ],
        checkpoint: "Five answered questions, the estimation-error paragraph, the limits statement.",
      },
      {
        phase: "recommendations",
        title: "The allocation recommendation",
        goal: "A resampled-core allocation with caps, monitoring and re-underwriting triggers.",
        instructions: [
          "Recommend the allocation shape (not ticker-level precision): equity core with single-asset caps, bond and gold ballast.",
          "Define monitoring: rolling correlation trigger for the bond assumption, drawdown reporting cadence.",
          "Set the review calendar: annual re-underwriting, quarterly risk report.",
        ],
        hints: [
          "Recommendation shape beats false precision: '30–40% diversified equity, capped at X% per name, 25–35% bonds, 10–15% gold, rest cash' is a discussable proposal.",
          "The correlation trigger (e.g., rolling 90-day equity-bond correlation > 0.3 for a quarter) makes the decay finding operational.",
          "Drawdown as a standing metric changes committee behaviour — put it in the pack's first table.",
        ],
        checkpoint: "The allocation recommendation with caps, triggers and calendar.",
      },
      {
        phase: "report",
        title: "The risk & return study",
        goal: "An investment-committee-grade study: methodology transparent, humility explicit.",
        instructions: [
          "Follow the outline; open with the concentration finding (risk was added without clear reward).",
          "Methodology box in the body: return basis, rf assumption, gap/spike treatment, resampling approach.",
          "Close with the allocation shape, triggers and the review calendar — the committee's decision artefacts.",
        ],
        hints: [
          "The study's one-liner: 'The book paid for concentration it didn't need, and the diversification it thought it had decayed — here is the honest allocation.'",
          "Committee packs live on methodology notes: every number reproducible, every assumption labelled, every limit stated.",
          "Reproducibility appendix: one script from raw prices to every exhibit, dated.",
        ],
        checkpoint: "The complete study, reproducible from the raw price file.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the family office's investment analyst. Answer the committee's standing question with two years of prices: measure realised risk and return, test the diversification assumptions, sketch an honest frontier, and recommend an allocation shape. Return basis, rf, cleaning policy and error treatment are yours — documented and applied consistently.",
      deliverables: [
        "Price-data construction with documented gap/spike/dividend treatment",
        "Per-asset return, volatility and Sharpe table (assumptions stated)",
        "Correlation structure analysis including rolling equity-bond behaviour",
        "Portfolio experience: return, vol, VaR, maximum drawdown and recovery",
        "Naive vs resampled frontier, out-of-sample check, and the allocation recommendation with triggers",
      ],
      guardrails: [
        "No uncorrected data errors in return series (verified by extreme-return check)",
        "Annualisation and risk-free conventions stated once and applied",
        "Naive optimisation labelled as estimation artefact, not recommendation",
        "Study limits (window, regimes, universe) stated in the body",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Returns computed on clean prices; spikes repaired and counted",
        "Annualisation consistent (252-day convention stated)",
        "Drawdown arithmetic correct (cummax-based), recovery measured",
      ],
      "code-quality": [
        "Wide-matrix construction vectorised; verification asserts present",
        "Optimisation code separated from analysis code",
      ],
      reasoning: [
        "Estimation-error treatment (resampling/shrinkage) attempted and interpreted",
        "Correlation stability assessed, not assumed",
      ],
      visualization: [
        "Underwater chart with trough annotated",
        "Frontier shown with resampled band, not just a line",
      ],
      interpretation: [
        "Concentration finding framed in risk-adjusted terms",
        "Diversification decay explained in committee language",
      ],
      recommendations: [
        "Allocation expressed as ranges with single-asset caps",
        "Monitoring triggers quantitative and calendarised",
      ],
    },
  },
];
