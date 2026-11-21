/**
 * Retail analytics projects — RET-01/02/03 (beginner / intermediate / advanced).
 * Column names in dataDictionary mirror the dataset builders exactly.
 */
import type { DapProject } from "@/lib/dap/types";

export const RETAIL_PROJECTS: DapProject[] = [
  /* ================================================================ RET-01 */
  {
    id: "retail-1",
    categoryId: "retail",
    difficulty: "beginner",
    code: "RET-01",
    title: "Store Sales Performance Review",
    subtitle: "One grocery store, twelve months, one question: where does the money actually come from?",
    summary:
      "A first full analysis: profile a year of point-of-sale transactions, find the quality defects hiding in them, and explain which categories, dayparts and customer types drive revenue.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Data profiling", "Data cleaning", "GroupBy aggregation", "Bar & line charts", "Executive summary writing"],

    businessBackground:
      "Maple & Vine Grocers is a single-outlet neighbourhood grocery in its fourth year of trading. The owner has just switched to a modern point-of-sale system and now has a full year of transaction-level data for the first time. Margins are healthy but growth has stalled, and the owner cannot say precisely which departments, dayparts or shopper types carry the store. Anecdotes ('mornings are our busiest time') are currently the basis of staffing and ordering decisions.",
    problemStatement:
      "Store leadership needs an evidence-based picture of transaction performance across the year: which categories generate revenue, when the store is busy, and who is shopping — so that staffing, ordering and promotion decisions stop relying on intuition.",
    businessObjectives: [
      "Quantify revenue and basket size by category, daypart, weekday and customer type",
      "Identify the store's peak and trough periods to inform staffing and inventory",
      "Assess how much revenue depends on loyalty members versus non-members",
      "Deliver a one-page findings memo the owner can act on without technical knowledge",
    ],
    datasetDescription:
      "One year of point-of-sale line items (about 1,800 rows) from the store's till system export. Each row is one product line on one receipt, with the quantity, unit price and computed line total, plus the daypart, weekday, payment method and membership status of the transaction. Like every real till export, it contains missing cells, duplicated rows and inconsistent labels.",
    dataDictionary: [
      { column: "transaction_id", kind: "id", description: "Unique till transaction identifier", example: "102481" },
      { column: "date", kind: "date", description: "Transaction date (YYYY-MM-DD)", example: "2025-06-14" },
      { column: "daypart", kind: "categorical", description: "Part of day: Morning / Afternoon / Evening", example: "Afternoon" },
      { column: "weekday", kind: "categorical", description: "Day of week of the transaction", example: "Sat" },
      { column: "category", kind: "categorical", description: "Product category (six values)", example: "Beverages" },
      { column: "subcategory", kind: "text", description: "Specific product purchased", example: "Sourdough Loaf" },
      { column: "quantity", kind: "integer", description: "Units purchased on the line", example: "2" },
      { column: "unit_price", kind: "currency", description: "Price per unit in dollars", example: "3.20" },
      { column: "total_amount", kind: "currency", description: "Line total (quantity × unit price)", example: "6.40" },
      { column: "payment_method", kind: "categorical", description: "Tender type", example: "Credit Card" },
      { column: "customer_type", kind: "categorical", description: "Loyalty member or non-member", example: "Member" },
    ],
    initialQuestions: [
      "Which categories and subcategories generate the most revenue, and how concentrated is it?",
      "How do transaction counts and revenue differ by daypart and weekday?",
      "Do loyalty members buy differently from non-members (basket size, categories)?",
      "Does the unit_price distribution look sane — are there impossible prices?",
      "Which findings would change staffing or ordering decisions tomorrow?",
    ],
    dataset: {
      name: "Maple & Vine till transactions",
      filename: "retail-01-store-sales.csv",
      description: "12 months of point-of-sale line items for a single grocery store.",
      rows: 1800,
    },

    dataQuality: [
      { issue: "Missing total_amount", where: "total_amount — ~2% of rows", detection: "df['total_amount'].isna().sum() and info()", treatment: "Recompute as quantity × unit_price rather than dropping rows — the inputs are present." },
      { issue: "Duplicated transactions", where: "Whole rows repeated (~1.2%)", detection: "df.duplicated().sum() and df['transaction_id'].duplicated().sum()", treatment: "Drop full duplicates on transaction_id + line details; keep one copy and log the count removed." },
      { issue: "Inconsistent category casing", where: "category — 'Beverages' vs 'beverages'", detection: "df['category'].value_counts() shows near-duplicate labels", treatment: "Strip and title-case into a canonical column before grouping, otherwise categories split." },
      { issue: "Negative quantities", where: "quantity < 0 (mis-keyed refunds)", detection: "(df['quantity'] < 0).sum()", treatment: "Inspect: with no refund flag, treat as data-entry errors and exclude from revenue, documented in the memo." },
      { issue: "Price outlier", where: "unit_price = 199.99 on ordinary items", detection: "df['unit_price'].describe() and a box plot", treatment: "Cap or investigate; a 199.99 milk price is clearly a keying error — exclude from averages." },
      { issue: "Mixed payment labels", where: "payment_method — 'cc' vs 'Credit Card'", detection: "value_counts() on payment_method", treatment: "Map 'cc' → 'Credit Card' with a documented replacement dict." },
      { issue: "Missing customer_type", where: "customer_type — ~1.5% of rows", detection: "isna().sum() on customer_type", treatment: "Keep rows but label 'Unknown'; exclude from member vs non-member comparisons." },
    ],
    cleaningPlan: [
      { action: "Standardise category and payment_method to canonical labels", rationale: "Grouping on raw labels silently splits revenue across duplicates of the same class." },
      { action: "Recompute total_amount where missing; flag rather than drop", rationale: "Preserves rows and keeps revenue totals consistent with quantity × price." },
      { action: "Drop exact duplicates on transaction level, count them", rationale: "Duplicates inflate revenue; removing them is only defensible if the count is reported." },
      { action: "Exclude negative quantities and the 199.99 price outlier from revenue metrics", rationale: "Impossible values distort means; exclusion must be transparent and counted." },
      { action: "Parse date and derive weekday/month for trend work", rationale: "Time features must be real datetimes, not strings, before resampling." },
    ],
    edaPlan: [
      { question: "What is the shape of revenue by category?", method: "groupby('category')['total_amount'].sum() sorted", expectation: "Dairy and Beverages lead; Household is high-price but low-frequency." },
      { question: "Which dayparts carry transactions?", method: "groupby('daypart') counts and revenue", expectation: "Afternoon is busiest; Evening basket sizes run slightly larger." },
      { question: "Weekday pattern?", method: "groupby('weekday') with ordered categories", expectation: "Sat and Fri peaks, Sun–Mon trough — staffing-relevant." },
      { question: "Members vs non-members", method: "groupby('customer_type') revenue and mean line total", expectation: "Members ~55–60% of revenue with larger baskets." },
      { question: "Monthly trajectory", method: "resample('MS') on date", expectation: "Gentle growth with a December bump." },
      { question: "Price structure", method: "unit_price histogram by category", expectation: "Right-skewed per category; Household has the widest spread." },
    ],
    statisticsPlan: [
      { technique: "Descriptive statistics (mean, median, quartiles)", purpose: "Characterise basket size and price distributions", expectation: "Line totals are right-skewed; median < mean — report both." },
      { technique: "Share-of-revenue (Pareto) analysis", purpose: "Quantify concentration across categories/subcategories", expectation: "Top 3 categories ≈ 55–65% of revenue." },
      { technique: "Two-proportion comparison (member vs non-member mean line total)", purpose: "Test whether the member basket difference is more than noise", expectation: "A simple t-test shows a clear, significant gap." },
    ],
    visualisationPlan: [
      { chart: "Sorted bar chart — revenue by category", answers: "Where does the money come from?", reads: "Length encodes revenue; sorted so rank is visible at a glance." },
      { chart: "Grouped bar — transactions by weekday and daypart", answers: "When is the store busy?", reads: "Compare bars within weekday clusters to find staffing peaks." },
      { chart: "Line chart — monthly revenue", answers: "Is the store growing?", reads: "Slope encodes trend; annotate the December bump." },
      { chart: "Histogram — unit_price by category", answers: "What is the price structure?", reads: "Position/spread shows cheap-vs-premium categories." },
      { chart: "Box plot — line total by customer type", answers: "Do members buy more?", reads: "Median and IQR compare baskets without mean distortion." },
    ],
    findings: [
      "Dairy, Beverages and Snacks together account for roughly 60% of revenue; the top-10 subcategories alone cover about a third — the store is concentrated but not dangerously so.",
      "Afternoon (12:00–17:00) generates the most transactions, but Evening baskets are ~15% larger per line; Saturday is the single busiest day and Sunday–Monday the quietest.",
      "Loyalty members, roughly half of transactions, deliver a disproportionate share of revenue (~58%) with visibly larger line totals.",
      "Cash usage is fading (~14% of transactions) and concentrated in Morning dayparts — queue design and cash-handling floats can follow the pattern.",
      "Revenue trends gently upward through the year with a clear December lift; no month materially below the prior-year run rate in this table.",
    ],
    recommendations: [
      { what: "Shift two staff hours from Sunday–Monday mornings to Saturday and Friday afternoons", why: "Peak transaction load sits at Fri/Sat afternoons; current staffing follows an outdated 'mornings' anecdote.", impact: "Shorter queues at peak; ~8–10% more coverage when it matters", horizon: "immediate" },
      { what: "Grow loyalty sign-up at the till with a first-purchase incentive", why: "Members buy larger baskets and already carry the majority of revenue.", impact: "Each converted shopper historically spends ~20% more per line", horizon: "this quarter" },
      { what: "Renegotiate Supplier terms on the top-10 subcategories", why: "A third of revenue sits in ten items — volume discounts are easiest to win where volume actually is.", impact: "Direct margin uplift on the highest-turn lines", horizon: "this quarter" },
      { what: "Run a Household-category promotion in Evening dayparts", why: "Household lines are high-value but low-frequency; evenings have the basket size to absorb them.", impact: "Category diversification away from perishables", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "A year of till data shows a stable, slowly growing store whose revenue is concentrated in three categories and whose busiest windows are Friday/Saturday afternoons — not mornings as assumed. Loyalty members carry ~58% of revenue with larger baskets. Staffing, supplier terms and loyalty growth are the three levers with the clearest immediate payoff. Data quality (duplicates, missing totals, inconsistent labels) was materially improved before any figures were computed, and every figure in this memo is reproducible from the cleaned dataset.",
      structure: [
        "1. Objective and scope (what the owner asked, what this covers)",
        "2. Data and quality treatment (rows in, defects found, rows analysed)",
        "3. Revenue by category and subcategory (Pareto view)",
        "4. Timing: daypart and weekday patterns",
        "5. Members vs non-members",
        "6. Three recommendations with expected impact",
        "7. Appendix: cleaning log and reproduction steps",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Orient yourself in the data",
        goal: "Load the CSV, understand its shape, and connect each column to the data dictionary.",
        instructions: [
          "Download the dataset from the Dataset tab and load it with pandas. Confirm the row and column counts match the dictionary.",
          "Use head(), info() and describe() to meet every column. Note which columns pandas read as numbers and which as objects — that difference is your first quality signal.",
          "Write one sentence in your notes: what does one row represent? Every later calculation depends on this grain.",
        ],
        hints: [
          "The grain question comes first: if two rows share a transaction_id, are they the same purchase or an error?",
          "pd.read_csv() then df.info() gives dtypes and non-null counts side by side — missing values and mistyped numbers show up immediately.",
          "df.head(10), df.info(), df.describe(include='all') — the object dtype on total_amount-adjacent columns is the tell for later cleaning.",
        ],
        checkpoint: "You can state the dataset's grain, row count, and which columns have missing values or odd types.",
        code: {
          label: "First contact",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("retail-01-store-sales.csv")
print(df.shape)
print(df.info())
print(df.describe(include="all"))`,
        },
      },
      {
        phase: "quality",
        title: "Audit data quality",
        goal: "Systematically find every defect: missing cells, duplicates, label inconsistencies, impossible values.",
        instructions: [
          "Produce a missing-value table (count and percent per column) and a duplicate-row count.",
          "For every categorical column, print value_counts() and read the labels carefully — look for casing variants and abbreviations.",
          "For every numeric column, check the min and max against common sense: negative quantities? A 199.99 milk?",
        ],
        hints: [
          "Three defect families cover almost everything: completeness (missing), uniqueness (duplicates), validity (impossible values). Plus consistency of labels.",
          "df.isna().sum(), df.duplicated().sum(), and (df['quantity'] < 0).sum() are the core trio; value_counts() exposes label chaos.",
          "A quick df['unit_price'].describe() plus a boxplot shows the 199.99 outlier; sorted value_counts() on category shows 'beverages' splitting from 'Beverages'.",
        ],
        checkpoint: "You have a written defect table: issue, columns affected, rows affected, and how you detected it.",
        code: {
          label: "The quality trio",
          language: "python",
          source: `miss = df.isna().sum()
print(miss[miss > 0])
print("duplicates:", df.duplicated().sum())

for col in ["category", "payment_method", "customer_type", "daypart"]:
    print(f"\\n{col}:\\n{df[col].value_counts(dropna=False)}")

print(df[["quantity", "unit_price", "total_amount"]].describe())`,
        },
      },
      {
        phase: "cleaning",
        title: "Clean, and document every decision",
        goal: "Fix the defects you found in a way you can defend in a footnote.",
        instructions: [
          "Standardise category and payment_method labels before any grouping.",
          "Recompute total_amount from quantity × unit_price where it is missing, rather than dropping rows.",
          "Drop exact duplicates, count what you removed, and exclude impossible values (negative quantity, 199.99 price) from revenue metrics while keeping a record of them.",
        ],
        hints: [
          "Order matters: standardise labels first, then dedupe, then handle invalid values — otherwise you clean a moving target.",
          "df['category'].str.strip().str.title() fixes casing; df.drop_duplicates() then len() before/after quantifies the removal.",
          "df['total_amount'] = df['total_amount'].fillna(df['quantity'] * df['unit_price']); a cleaning log DataFrame that records (issue, rows_affected, action) is what makes this professional.",
        ],
        checkpoint: "A cleaned dataframe plus a cleaning log listing each action and how many rows it touched.",
        code: {
          label: "Clean with a paper trail",
          language: "python",
          source: `clean = df.copy()
clean["category"] = clean["category"].str.strip().str.title()
clean["payment_method"] = clean["payment_method"].replace({"cc": "Credit Card"})
clean["total_amount"] = clean["total_amount"].fillna(
    clean["quantity"] * clean["unit_price"])

before = len(clean)
clean = clean.drop_duplicates()
print(f"removed {before - len(clean)} duplicate rows")

valid = clean[(clean["quantity"] > 0) & (clean["unit_price"] < 100)]`,
        },
      },
      {
        phase: "eda",
        title: "Explore: categories, timing and customers",
        goal: "Answer the structural questions with aggregates before any chart.",
        instructions: [
          "Compute revenue and transaction counts by category, then by weekday and daypart (use an ordered weekday list so bars come out in week order).",
          "Compare members vs non-members on revenue share and average line total.",
          "Resample by month to see the trend. Write down each headline number as you find it.",
        ],
        hints: [
          "Revenue is just total_amount summed inside each group; keep an eye on whether you weight by rows or by value.",
          "groupby('category')['total_amount'].agg(['sum','count','mean']) gives size and depth in one view; pd.Categorical fixes weekday ordering.",
          "valid.groupby('customer_type')['total_amount'].agg(['sum','mean']) and valid.set_index('date').resample('MS')['total_amount'].sum() cover the member split and the trend.",
        ],
        checkpoint: "You can quote: top-3 categories by revenue, busiest daypart, member revenue share, and the monthly direction.",
        code: {
          label: "The core aggregates",
          language: "python",
          source: `cat = valid.groupby("category")["total_amount"].agg(["sum", "count", "mean"])
print(cat.sort_values("sum", ascending=False))

order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
valid["weekday"] = pd.Categorical(valid["weekday"], categories=order, ordered=True)
print(valid.groupby("weekday", observed=True)["total_amount"].agg(["sum", "count"]))

print(valid.groupby("customer_type")["total_amount"].agg(["sum", "mean"]))
monthly = valid.set_index("date").resample("MS")["total_amount"].sum()`,
        },
      },
      {
        phase: "statistics",
        title: "Add the numbers that make claims safe",
        goal: "Back the headline comparisons with basic statistics.",
        instructions: [
          "Report median alongside mean line totals — is the distribution skewed enough to matter?",
          "Compute the Pareto share: what fraction of revenue comes from the top 3 categories, top 10 subcategories?",
          "Run a simple two-sample t-test on line totals for members vs non-members and state the result in plain language.",
        ],
        hints: [
          "A claim like 'members spend more' deserves a significance test, not just two means side by side.",
          "cat['sum'].sort_values(ascending=False).cumsum() / cat['sum'].sum() * 100 is the Pareto calculation.",
          "from scipy.stats import ttest_ind; ttest_ind(member_lines, nonmember_lines, equal_var=False) — then translate the p-value into one sentence.",
        ],
        checkpoint: "You can say: 'members' lines are on average $X larger, p < 0.05' and 'the top-3 categories cover Y% of revenue'.",
        code: {
          label: "Pareto and t-test",
          language: "python",
          source: `from scipy.stats import ttest_ind

share = cat["sum"].sort_values(ascending=False)
print("top-3 share:", (share.head(3).sum() / share.sum() * 100).round(1), "%")

mem = valid.loc[valid["customer_type"] == "Member", "total_amount"]
non = valid.loc[valid["customer_type"] == "Non-member", "total_amount"]
print(ttest_ind(mem, non, equal_var=False))`,
        },
      },
      {
        phase: "visualisation",
        title: "Build the visual argument",
        goal: "Five charts, each answering one business question, each fully labelled.",
        instructions: [
          "Sorted bar of revenue by category; grouped bar of transactions by weekday × daypart; line of monthly revenue; histogram of unit prices; box plot of line totals by customer type.",
          "Every chart gets a title that states the takeaway, axis labels with units, and no decorative junk.",
          "Check each chart against one question from your initial questions list — if it answers none, cut it.",
        ],
        hints: [
          "A chart that needs a paragraph of explanation is usually the wrong chart; swap it rather than caption it into submission.",
          "fig, ax = plt.subplots(figsize=(8, 4)) then plot on ax; ax.set_title / ax.set_xlabel / ax.set_ylabel every time.",
          "For the weekday × daypart matrix, valid.pivot_table(index='weekday', columns='daypart', values='total_amount', aggfunc='count') then .loc[order].plot(kind='bar', ax=ax).",
        ],
        checkpoint: "Five saved charts (PNG at 150 dpi), each with a takeaway title and labelled axes.",
        code: {
          label: "Chart pattern",
          language: "python",
          source: `import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4))
cat["sum"].sort_values().plot(kind="barh", ax=ax, color="#0f766e")
ax.set_title("Dairy, Beverages and Snacks carry ~60% of revenue")
ax.set_xlabel("Revenue ($)")
fig.tight_layout()
fig.savefig("revenue_by_category.png", dpi=150)`,
        },
      },
      {
        phase: "interpretation",
        title: "Answer the initial questions",
        goal: "Turn aggregates into findings — each one true, specific and sourced from a number.",
        instructions: [
          "Go back to the five initial questions and answer each in one or two sentences with the supporting figure quoted.",
          "Separate 'the data shows' from 'we recommend' — interpretation describes; the next step prescribes.",
          "Note any question the data could not answer and why (e.g., no margin data, so no profit claims).",
        ],
        hints: [
          "A finding without a number is an opinion; a number without a sentence is a spreadsheet.",
          "Structure each finding as: claim → magnitude → caveat. 'Saturday is the busiest day (18% of weekly revenue), though single-day peaks are partly weather-driven.'",
          "Re-read your aggregate tables and pick the five numbers with decision consequences; the rest is context.",
        ],
        checkpoint: "Five written findings, each with a quoted figure and an honest caveat where needed.",
      },
      {
        phase: "recommendations",
        title: "Recommendations the owner can act on",
        goal: "Convert findings into specific actions with owners, effort and expected effect.",
        instructions: [
          "Write 3–4 recommendations; each states the action, the finding it rests on, and the expected impact.",
          "Prioritise: what changes tomorrow, what changes this quarter, what is a strategic direction?",
          "Stay inside what the data supports — no profit claims without margin data.",
        ],
        hints: [
          "Recommendations fail when they could have been written before the analysis. Tie every one to a specific finding.",
          "Use the pattern: Because [finding with number], do [action], expecting [impact] — and mark it immediate / this quarter / longer term.",
          "If you cannot name who would own the action, it is a wish, not a recommendation.",
        ],
        checkpoint: "A recommendation table: action, evidence, expected impact, priority.",
      },
      {
        phase: "report",
        title: "The one-page findings memo",
        goal: "An executive summary a non-technical owner reads in two minutes.",
        instructions: [
          "Structure: objective → data & quality note → 3 headline findings → 3 recommendations → appendix pointer.",
          "Lead with what changes decisions, not with methodology. The cleaning log goes to the appendix.",
          "Include one chart in the memo body (revenue by category); reference the rest.",
        ],
        hints: [
          "Executives read the first paragraph and the recommendations; optimise those two, not the middle.",
          "Plain language test: would the store owner understand every sentence without asking you a question?",
          "Close the summary with the single most actionable sentence you own.",
        ],
        checkpoint: "A memo (Markdown or notebook markdown cell) that a store owner could act on unaided.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the analyst the owner hired for a week. Deliver a performance review the owner can act on: what drives revenue, when the store is busy, who shops here, and what to change. The till export is yours; the owner trusts your numbers only if your quality treatment is transparent.",
      deliverables: [
        "Data quality assessment table (issue, detection method, rows affected, treatment)",
        "Cleaning script or notebook section with a documented cleaning log",
        "Exploratory analysis with at least five aggregates tied to the initial questions",
        "A set of 4–6 labelled charts, each answering a stated question",
        "Findings memo (one page) with 3–5 evidence-backed recommendations",
      ],
      guardrails: [
        "Every figure in the memo must be reproducible from your notebook top-to-bottom",
        "Report cleaning decisions (rows removed, values fixed) — silent cleaning is a failure",
        "No claims the dataset cannot support (e.g., profitability without cost data)",
        "Recommendations must name the finding they rest on",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Revenue figures computed on cleaned data, after duplicates and impossible values removed",
        "total_amount recomputed where missing rather than rows silently dropped",
        "Category totals unaffected by casing variants (Beverages + beverages merged)",
      ],
      "code-quality": [
        "Cleaning steps ordered and documented (labels before dedupe before invalid values)",
        "No chained one-liners that hide assumptions; intermediate names that mean something",
      ],
      reasoning: [
        "Grain stated before any aggregation (row = line item, not receipt)",
        "Member vs non-member comparison controls for the missing-customer_type rows",
      ],
      visualization: [
        "Weekday bars in week order (not alphabetical)",
        "Sorted category bars; skewed price data shown with median or histogram, not just mean",
      ],
      interpretation: [
        "Concentration quantified (top-3 share), not just 'some categories are bigger'",
        "Skew acknowledged — median vs mean line totals discussed",
      ],
      recommendations: [
        "Staffing recommendation tied to the weekday × daypart pattern",
        "Each action names its supporting finding and an expected effect",
      ],
    },
  },

  /* ================================================================ RET-02 */
  {
    id: "retail-2",
    categoryId: "retail",
    difficulty: "intermediate",
    code: "RET-02",
    title: "Basket Structure & Promotion Effectiveness",
    subtitle: "Six stores, eight months, one question: do promotions actually make money?",
    summary:
      "Chain-level line-item analysis: build basket-level views, measure promotion uplift and margin dilution, and quantify how basket composition differs by store format and loyalty status.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Multi-store analysis", "Promotion uplift", "Margin arithmetic", "Grouped visualisation", "Cohort-free basket analysis"],

    businessBackground:
      "Fernbrook Grocery operates six stores across three formats — two Supercentres, two Supermarkets and two Convenience stores — with a loyalty programme covering roughly half of baskets. Trade has grown, but promotion spend has grown faster: every second week some category is discounted, and the commercial director cannot say whether promotions expand baskets or simply discount purchases that would have happened anyway. The chain's margins are too thin for 20%-off weeks to be a matter of faith.",
    problemStatement:
      "The commercial team needs to know whether promotions increase volume enough to protect (or grow) gross margin, how baskets differ across store formats and loyalty status, and which promotion patterns deserve to be repeated versus retired.",
    businessObjectives: [
      "Measure promotion penetration and its association with basket size, line value and margin",
      "Compare basket structure and margin across store formats",
      "Quantify loyalty members' differential behaviour on promoted versus non-promoted lines",
      "Produce a promotion playbook: repeat, redesign, retire",
    ],
    datasetDescription:
      "Eight months of line-item sales (~9,000 rows) across the six stores, including unit cost, promo flag and loyalty status, so gross margin per line is computable. Department labels arrive with trailing whitespace, promo flags use three different encodings, and cost is missing for a slice of lines — the kind of export a real ERP produces.",
    dataDictionary: [
      { column: "receipt_id", kind: "id", description: "Basket identifier (unique per checkout)", example: "551240" },
      { column: "store_id", kind: "categorical", description: "Store code S01–S06", example: "S03" },
      { column: "store_format", kind: "categorical", description: "Supercentre / Supermarket / Convenience", example: "Supermarket" },
      { column: "date", kind: "date", description: "Transaction date", example: "2025-07-02" },
      { column: "hour", kind: "integer", description: "Hour of day (8–20)", example: "17" },
      { column: "department", kind: "categorical", description: "Trading department (watch whitespace)", example: "Bakery" },
      { column: "item_name", kind: "text", description: "Product description", example: "Milk 2L" },
      { column: "price_band", kind: "categorical", description: "Value / Core / Premium", example: "Core" },
      { column: "unit_cost", kind: "currency", description: "Landed cost per unit", example: "1.75" },
      { column: "quantity", kind: "integer", description: "Units on the line", example: "3" },
      { column: "unit_price", kind: "currency", description: "Selling price per unit (promo-adjusted)", example: "3.40" },
      { column: "promo_flag", kind: "categorical", description: "Whether the line was promoted (mixed encodings)", example: "TRUE" },
      { column: "loyalty_member", kind: "categorical", description: "Basket scanned a loyalty card", example: "Yes" },
    ],
    initialQuestions: [
      "What share of lines and revenue is sold on promotion, and how does that vary by department and format?",
      "Do promoted lines move more units per basket, or just cheaper units?",
      "What is the margin rate on promoted versus regular lines, and does volume offset it?",
      "How do baskets differ across the three store formats?",
      "Do loyalty members respond differently to promotions than non-members?",
    ],
    dataset: {
      name: "Fernbrook chain line items",
      filename: "retail-02-basket-pricing.csv",
      description: "8 months of line-item sales with cost, promo and loyalty fields across 6 stores.",
      rows: 9000,
    },

    dataQuality: [
      { issue: "Trailing spaces in department labels", where: "department — ' Grocery ' vs 'Grocery'", detection: "df['department'].unique() (quotes reveal padding)", treatment: "str.strip() before any groupby; otherwise 'Grocery' splits into two groups." },
      { issue: "Mixed promo_flag encodings", where: "promo_flag — booleans, 'Y'/'N' and blanks mixed", detection: "value_counts(dropna=False)", treatment: "Map all variants to a single boolean; blanks are not 'not promoted' — decide and document (treat as unknown and exclude from uplift, or as FALSE with a stated assumption)." },
      { issue: "Missing unit_cost", where: "unit_cost — ~3% of lines", detection: "isna().sum()", treatment: "Impute the median cost per item_name (not global median — costs differ by product), report imputed share." },
      { issue: "Zero-quantity lines", where: "quantity == 0", detection: "(df['quantity'] == 0).sum()", treatment: "Zero-quantity lines carry no value; exclude from basket metrics but count them (often a scanner artifact)." },
      { issue: "Duplicate receipt lines", where: "~0.9% exact duplicates", detection: "duplicated().sum() and duplicated(subset=['receipt_id','item_name']).sum()", treatment: "Drop exact duplicates; keep the count in the cleaning log." },
      { issue: "Missing loyalty_member", where: "loyalty_member — ~2% of lines", detection: "value_counts(dropna=False)", treatment: "Label 'Unknown' and exclude from member analyses rather than defaulting to 'No'." },
    ],
    cleaningPlan: [
      { action: "Strip department, standardise promo_flag to boolean, loyalty to Yes/No/Unknown", rationale: "Three encodings of one fact make any groupby quietly wrong." },
      { action: "Impute unit_cost by per-item median; flag imputed rows", rationale: "Margin needs cost; global medians would distort item economics; the flag keeps honesty in downstream stats." },
      { action: "Exclude zero-quantity and duplicated lines from basket metrics", rationale: "Neither represents merchandise movement; both distort per-basket averages." },
      { action: "Derive line_value, line_cost, line_margin, basket rollups by receipt_id", rationale: "Analysis fields should be explicit columns, not re-derived inline five times." },
    ],
    edaPlan: [
      { question: "Promotion penetration by department and format?", method: "groupby(['department','store_format']) promo share of lines and revenue", expectation: "Grocery and Household promote hardest; Convenience least." },
      { question: "Units per basket: promoted vs regular", method: "groupby(['receipt_id']) sum of qty split by promo share of basket", expectation: "Baskets with promoted lines contain ~25–35% more units." },
      { question: "Margin rate: promoted vs regular lines", method: "sum(margin)/sum(value) per promo group, per department", expectation: "Promoted lines run ~7–10 points lower margin rate." },
      { question: "Basket structure by format", method: "lines, units, value per receipt by store_format", expectation: "Supercentre baskets are 2× Convenience; price bands skew premium in Supermarkets." },
      { question: "Member behaviour on promo", method: "groupby(['loyalty_member','promo_flag']) value and units", expectation: "Members buy more promoted lines but also more premium lines." },
      { question: "Hour-of-day and format interaction", method: "pivot hour × format on revenue", expectation: "Convenience peaks early/late; Supercentre peaks midday." },
    ],
    statisticsPlan: [
      { technique: "Difference of means with CI (bootstrap or t-based)", purpose: "Is the promoted-basket size gap within noise?", expectation: "Gap of 25%+ is far outside the CI — a real behavioural difference (association, not causation)." },
      { technique: "Margin bridge decomposition", purpose: "Split margin change into volume vs rate effects", expectation: "Promo weeks: volume +X%, rate −Ypts; net effect near zero to slightly positive." },
      { technique: "Correlation of promo share and basket value at day-format level", purpose: "Test the 'promotions build baskets' story where it must hold", expectation: "Positive but modest; Convenience shows almost none." },
      { technique: "Simpson's-paradigm check (stratify by department)", purpose: "Confirm the promo lift isn't just department mix", expectation: "Lift survives within Grocery but shrinks in Bakery." },
    ],
    visualisationPlan: [
      { chart: "Grouped bar — promo share of revenue by department × format", answers: "Where does promotion spend concentrate?", reads: "Compare bar pairs within each department." },
      { chart: "Slope/dumbbell — units per basket, promoted vs regular, by format", answers: "Do promotions move units?", reads: "Gap between paired dots is the behavioural lift." },
      { chart: "Diverging stacked bar — margin rate by department, promoted vs regular", answers: "What does promotion cost in margin?", reads: "Length of difference from the format baseline." },
      { chart: "Heatmap — hour × format revenue", answers: "When does each format earn?", reads: "Colour intensity maps to revenue share." },
      { chart: "Box plot — basket value distribution by loyalty status", answers: "Who spends more per trip?", reads: "Median lines and spread; note outliers." },
    ],
    findings: [
      "Promotions touch ~22% of lines but only ~18% of revenue: promoted baskets are larger, but promoted units sell at ~80% of regular price.",
      "Gross margin rate on promoted lines runs 7–10 percentage points below regular lines; volume per basket rises ~28% with promoted lines, leaving total margin per basket roughly flat to +4%.",
      "The promotion effect is format-dependent: Supercentre baskets with promotions clearly expand; Convenience baskets barely change, so discounting there mostly transfers margin.",
      "Loyalty members buy more promoted lines AND more premium lines — their larger baskets are not purely deal-seeking; non-member promoted baskets are the most price-elastic group.",
      "Grocery and Household account for over 60% of promoted revenue; premium-band items on promotion show the worst margin recovery in Convenience stores.",
    ],
    recommendations: [
      { what: "Retire blanket promotions in Convenience stores; replace with targeted bundle pricing", why: "Convenience promotion lifts volume ~5% but costs ~9 points of margin — a net loser.", impact: "Recovers 1–2 pts of chain margin with minimal volume risk", horizon: "this quarter" },
      { what: "Repeat and extend Supercentre multi-buy promotions in Grocery and Household", why: "These show the cleanest basket-expansion effect (+28% units) with margin-neutral outcomes.", impact: "Volume growth where it is provably earned", horizon: "immediate" },
      { what: "Aim premium-band promotions at loyalty members only (app coupons)", why: "Members respond to promotions without abandoning premium lines; non-member promo baskets cannibalise margin.", impact: "Protects premium margin while keeping the promotion halo", horizon: "this quarter" },
      { what: "Introduce a promotion post-mortem template (uplift, margin bridge) before each cycle", why: "The chain currently cannot compare promotions systematically; the bridge makes each cycle measurable.", impact: "Compounding improvement in promotion ROI", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Across six stores and eight months, promotions touch a fifth of revenue. They demonstrably build bigger baskets in Supercentres (+28% units) at roughly flat total margin, but in Convenience stores they primarily discount purchases that would have happened anyway, costing 7–10 margin points. Loyalty members respond to promotions without abandoning premium lines; non-members on promotion are the most price-elastic and least profitable combination. The playbook is therefore format-specific: expand multi-buys in Supercentres, retire blanket discounts in Convenience, and shift premium promotions to member-targeted coupons. A margin-bridge template is included so every future cycle is judged on volume AND margin, not volume alone.",
      structure: [
        "1. Commercial question and scope",
        "2. Data basis, quality treatment and margin definitions",
        "3. Promotion penetration by department and format",
        "4. Basket expansion: promoted vs regular baskets",
        "5. Margin bridge: volume effect vs rate effect",
        "6. Loyalty interaction and price-band effects",
        "7. Playbook: repeat / redesign / retire table",
        "8. Appendix: cleaning log, imputation note, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Orient and define the analysis grain",
        goal: "Load the line-item data, fix the grain in your head, and sketch the basket rollup you will need.",
        instructions: [
          "Confirm: one row = one line of one receipt; receipt_id identifies baskets. Six stores, three formats.",
          "Identify which columns let you compute money: unit_cost, unit_price, quantity. Margin per line is (unit_price − unit_cost) × quantity.",
          "Write down the two grains you will work at: line level (promo economics) and receipt level (basket structure).",
        ],
        hints: [
          "The trap in this dataset is grain confusion: promo penetration is a line-level question, basket size a receipt-level one.",
          "df.groupby('receipt_id') is your basket machine — everything basket-shaped flows through it.",
          "Sketch the target: lines → line_margin → basket_value, basket_units, promo_share per receipt_id, then analyse baskets.",
        ],
        checkpoint: "A written grain statement and a column plan for line_value, line_margin and basket rollups.",
      },
      {
        phase: "quality",
        title: "Audit the export like an ERP survivor",
        goal: "Find whitespace labels, promo encoding chaos, missing costs, zero quantities, duplicates.",
        instructions: [
          "Print unique department values wrapped in quotes — padding that value_counts hides becomes visible.",
          "value_counts(dropna=False) on promo_flag and loyalty_member: catalogue every encoding variant.",
          "Quantify missing unit_cost per department, zero quantities, and duplicates at (receipt_id, item_name) level.",
        ],
        hints: [
          "Quoting uniques is the oldest trick in the book because it works: print(f'[{v!r}]') shows ' Grocery ' vs 'Grocery'.",
          "promo_flag blanks are the judgement call of this project: unknown ≠ FALSE. Decide before you compute uplift, and write the assumption down.",
          "df.groupby('item_name')['unit_cost'].transform('median') is the imputation you'll want later — at audit time, just count how much is missing.",
        ],
        checkpoint: "A defect table with six named issues, their detection code, and affected-row counts.",
      },
      {
        phase: "cleaning",
        title: "Standardise, impute, derive",
        goal: "One clean frame with explicit money columns and a documented cleaning log.",
        instructions: [
          "Strip department labels; map promo_flag to a single boolean with a stated policy for blanks; loyalty to Yes/No/Unknown.",
          "Impute missing unit_cost with per-item medians and flag imputed rows in a new column.",
          "Drop exact duplicates and zero-quantity lines (counted); derive line_value, line_cost, line_margin.",
        ],
        hints: [
          "Per-item median imputation respects that milk and olive oil have different cost structures; a global median lies.",
          "The promo_flag policy decision changes your headline numbers by 1–2 points — that's exactly why it must be written down.",
          "clean['promo'] = clean['promo_flag'].map({'TRUE': True, True: True, 'Y': True, ...}) — build the full mapping dict, then assert the result is boolean.",
        ],
        checkpoint: "A clean frame with boolean promo, Yes/No/Unknown loyalty, numeric cost everywhere, and derived money columns.",
        code: {
          label: "Standardise and derive",
          language: "python",
          source: `clean = df.copy()
clean["department"] = clean["department"].str.strip()

PROMO_MAP = {"TRUE": True, True: True, "Y": True, "FALSE": False, False: False, "N": False, "": None}
clean["promo"] = clean["promo_flag"].map(PROMO_MAP)

clean["unit_cost"] = clean["unit_cost"].fillna(
    clean.groupby("item_name")["unit_cost"].transform("median"))
clean["cost_imputed"] = df["unit_cost"].isna()

clean["line_value"] = clean["unit_price"] * clean["quantity"]
clean["line_margin"] = (clean["unit_price"] - clean["unit_cost"]) * clean["quantity"]`,
        },
      },
      {
        phase: "eda",
        title: "Promotion penetration and basket structure",
        goal: "Compute the promo shares and basket metrics that anchor every later claim.",
        instructions: [
          "Promo share of lines and of revenue, by department and by store format.",
          "Roll up to baskets: units, value, margin, promo line share per receipt_id; then compare baskets containing promoted lines vs not.",
          "Basket metrics by format and by loyalty status. Note the top-line numbers as you go.",
        ],
        hints: [
          "Two different denominators matter: share of LINES promoted vs share of REVENUE promoted — they answer different questions.",
          "baskets = clean.groupby('receipt_id').agg(units=('quantity','sum'), value=('line_value','sum'), margin=('line_margin','sum'), promo_share=('promo','mean'))",
          "Then it's one groupby on promo_share > 0 vs == 0 — but remember this is association, not causation; promotions run in specific weeks and departments.",
        ],
        checkpoint: "Quote: promo revenue share overall, units-per-basket gap (promoted vs not), and basket value by format.",
        code: {
          label: "Basket rollup",
          language: "python",
          source: `baskets = clean.groupby("receipt_id").agg(
    store=("store_id", "first"),
    fmt=("store_format", "first"),
    member=("loyalty_member", "first"),
    units=("quantity", "sum"),
    value=("line_value", "sum"),
    margin=("line_margin", "sum"),
    promo_share=("promo", "mean"),
)
promo_baskets = baskets[baskets["promo_share"] > 0]
plain_baskets = baskets[baskets["promo_share"] == 0]
print(promo_baskets["units"].mean(), plain_baskets["units"].mean())`,
        },
      },
      {
        phase: "statistics",
        title: "Margin bridge and honest comparison",
        goal: "Decompose the promotion effect into volume and rate; test the gaps.",
        instructions: [
          "Compute margin rate (sum margin / sum value) for promoted vs regular lines, overall and by department.",
          "Build a simple margin bridge: for promo vs regular, contribution = units × margin per unit; split differences into volume and rate components.",
          "Bootstrap (or t-test) the units-per-basket gap. Then stratify by department to check the lift isn't pure mix (Simpson's check).",
        ],
        hints: [
          "A margin rate on promoted lines that's lower while margin PER BASKET is flat is the whole story of this project — the bridge makes both visible at once.",
          "Margin bridge arithmetic: Δmargin = Δunits × base_margin_per_unit + new_units × Δmargin_per_unit (+ interaction). Keep it simple and state the decomposition.",
          "Stratified check: clean.groupby(['department','promo'])['line_margin'].sum() / .groupby(['department','promo'])['line_value'].sum() — if the promo lift survives inside Grocery, it's behaviour, not mix.",
        ],
        checkpoint: "A margin bridge table and a stratified lift check with one-sentence interpretations.",
        code: {
          label: "Margin rate and bootstrap",
          language: "python",
          source: `rate = clean.groupby("promo").apply(
    lambda g: g["line_margin"].sum() / g["line_value"].sum())
print(rate)

import numpy as np
gap = promo_baskets["units"].values
base = plain_baskets["units"].values
boot = [np.random.choice(gap, len(gap), replace=True).mean()
        - np.random.choice(base, len(base), replace=True).mean()
        for _ in range(2000)]
print("95% CI:", np.percentile(boot, [2.5, 97.5]))`,
        },
      },
      {
        phase: "visualisation",
        title: "Charts that carry the playbook",
        goal: "Five visualisations that make the format-specific story obvious.",
        instructions: [
          "Promo revenue share by department × format (grouped bars); units-per-basket dumbbell by format; margin-rate comparison by department; hour × format heatmap; basket-value box plots by loyalty.",
          "The dumbbell chart is the persuasion centrepiece: one dot for regular, one for promoted, connected — per format.",
          "Title every chart with its takeaway ('Convenience baskets barely grow on promotion').",
        ],
        hints: [
          "For the dumbbell: aggregate units per basket by (format, promo presence), then plot hlines + two scatter series on a categorical y-axis.",
          "Heatmap: pivot_table(index='hour', columns='store_format', values='line_value', aggfunc='sum') into sns.heatmap(annot=True, fmt='.0f').",
          "Annotate the margin-rate chart with the chain average line so readers see which departments subsidise which.",
        ],
        checkpoint: "Five charts; the dumbbell and the margin-rate chart each tell the format story in under ten seconds.",
      },
      {
        phase: "interpretation",
        title: "Assemble the promotion story",
        goal: "Turn numbers into the repeat/redesign/retire narrative.",
        instructions: [
          "Answer each initial question with a number attached; flag association-vs-causation wherever promotion timing could confound.",
          "Draft the playbook rows: which promotion patterns repeat, which redesign, which retire — each with its evidence.",
          "State what this analysis cannot settle (no holdout stores, no pre/post weeks — promotion weeks are selected, not randomised).",
        ],
        hints: [
          "The honest limitation paragraph is what separates intermediate work from beginner work — name the confounder (promotions run in specific weeks/departments) before a reader does.",
          "Playbook rows follow the pattern: pattern → evidence → verdict → expected effect if changed.",
          "If a verdict would change a material amount of spend, say so; if it wouldn't, question whether it belongs in the playbook.",
        ],
        checkpoint: "Answers to all five initial questions plus a three-row playbook draft.",
      },
      {
        phase: "recommendations",
        title: "The playbook, costed",
        goal: "Recommendations with expected margin impact and an explicit confidence level.",
        instructions: [
          "Three to four actions, each tied to a finding, each with expected effect direction and a confidence statement.",
          "Separate: changes that are reversible pilots (member-only coupons in two stores) from structural ones (retiring Convenience promotions).",
          "Propose the measurement plan for each pilot — what would convince the commercial director it worked?",
        ],
        hints: [
          "Pair every recommendation with its falsifier: 'if basket units in pilot stores don't move +15% in four weeks, revert.'",
          "Reversibility is a business virtue: pilot → measure → scale beats big-bang changes you cannot unwind.",
          "Quantify with ranges from your bootstrap CIs, not point estimates alone.",
        ],
        checkpoint: "A recommendation table with evidence, expected effect, confidence, and the measurement plan.",
      },
      {
        phase: "report",
        title: "The commercial review pack",
        goal: "A report a commercial director reads, challenges and acts on.",
        instructions: [
          "Structure: question → data & margin definitions → penetration → basket expansion → margin bridge → playbook → pilots & measures → appendix.",
          "Put the dumbbell chart on page one; it carries the format story alone.",
          "Include the association/causation caveat box — pre-empting it builds trust rather than undermining it.",
        ],
        hints: [
          "Define margin terms once ('margin rate = gross margin ÷ revenue') and never redefine them mid-report.",
          "The director will ask 'why should I believe this?' — the audit trail (cleaning log, imputation share, stratified checks) is the answer; keep it one click away in the appendix.",
          "End with the pilot calendar: what happens in the next four weeks, who owns it, what gets measured.",
        ],
        checkpoint: "A complete review pack with the playbook table and pilot plan.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the commercial analytics lead for a week. The commercial director wants a promotion playbook — repeat, redesign, retire — grounded in line-item economics, with basket behaviour by format and loyalty status. Margin definitions and the treatment of unknown promo flags are yours to set, and must be documented.",
      deliverables: [
        "Data quality table and cleaning log (including the promo-flag policy decision)",
        "Basket-level rollup with documented aggregation choices",
        "Promotion economics: penetration, basket expansion, margin bridge by format",
        "Five labelled charts including the format dumbbell and margin-rate comparison",
        "Promotion playbook (repeat/redesign/retire) with pilot and measurement plan",
      ],
      guardrails: [
        "Association must not be reported as causation — name the confounders",
        "Margin claims must state the cost-imputation treatment",
        "Every playbook verdict cites its evidence table or chart",
        "Unknown loyalty/promo rows are excluded from, not defaulted into, comparisons",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Margin arithmetic uses per-line (price − cost) × qty, never price × qty − cost",
        "Promo shares computed on both lines and revenue, not conflated",
        "Basket metrics deduplicate receipts before averaging",
      ],
      "code-quality": [
        "Per-item median imputation, not global; imputed share reported",
        "Basket rollup written once and reused, not re-derived per chart",
      ],
      reasoning: [
        "Association vs causation addressed for the promotion-lift claim",
        "Simpson's-paradigm check by department before claiming lift",
      ],
      visualization: [
        "Dumbbell or equivalent makes the promoted-vs-regular gap visible per format",
        "Margin comparisons share a common scale (rates vs rates, not rate vs absolute)",
      ],
      interpretation: [
        "The flat-margin-per-basket-despite-lower-rate result is explained, not just tabulated",
        "Convenience vs Supercentre difference quantified, not gestured at",
      ],
      recommendations: [
        "Playbook verdicts each cite a specific metric from the analysis",
        "At least one reversible pilot with a success threshold and measure plan",
      ],
    },
  },

  /* ================================================================ RET-03 */
  {
    id: "retail-3",
    categoryId: "retail",
    difficulty: "advanced",
    code: "RET-03",
    title: "Store Network Performance Drivers",
    subtitle: "Twenty-four stores, two years of weeks: what actually separates the best stores from the rest?",
    summary:
      "A panel-data investigation of store performance: construct store-week metrics, model sales drivers (size, staffing, catchment income, competition, promotions), and build the evidence base for the next network decision.",
    hours: 18,
    tools: ["Python", "pandas", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Panel data", "Feature construction", "Regression modelling", "Model criticism", "Executive recommendation under uncertainty"],

    businessBackground:
      "Meridian Retail Group runs 24 stores and is drafting its next three-year network plan: refurbish, relocate, or open. The board debate keeps stalling on the same question — what makes a Meridian store perform? The property team swears by catchment income; operations blames understaffing; marketing claims promotion spend is the difference. Two years of store-week operating data plus catchment demographics are finally assembled, and the strategy director has commissioned one analysis to arbitrate.",
    problemStatement:
      "Identify and quantify the drivers of store sales performance across the network — separating store attributes (size, format, catchment) from operational levers (staffing, promotions, markdowns) — and translate the model into guidance for the network plan: which stores to invest in, which levers matter, and how confident the board can be.",
    businessObjectives: [
      "Build a store-week panel with derived performance metrics (sales per sqm, conversion, promo intensity)",
      "Quantify the association between sales and each candidate driver, with uncertainty",
      "Fit and criticise a multivariate model of log sales; interpret coefficients as elasticities",
      "Classify over- and under-performing stores relative to model expectations",
      "Deliver network-plan guidance with explicit confidence levels and data limitations",
    ],
    datasetDescription:
      "A store-week panel: every store contributes one row per trading week for two years (~2,500 store-weeks after cleaning), with static attributes (format, size, catchment income, competitor count) repeated per week and weekly operations (footfall, transactions, sales, promo spend, markdown rate). A system outage left gaps in footfall and sales; income is occasionally stale; one store's sales contain a decimal-shift error. Because attributes repeat weekly, naive row counts overstate the data's true independence — the panel structure is the analysis.",
    dataDictionary: [
      { column: "store_id", kind: "id", description: "Store identifier ST01–ST24", example: "ST07" },
      { column: "week", kind: "date", description: "Week start date (Monday)", example: "2024-09-09" },
      { column: "format", kind: "categorical", description: "Supercentre / Supermarket / Convenience", example: "Supermarket" },
      { column: "region", kind: "categorical", description: "Trading region (casing inconsistent)", example: "North" },
      { column: "sqm", kind: "integer", description: "Sales floor square metres", example: "2810" },
      { column: "staff_fte", kind: "decimal", description: "Average weekly full-time-equivalent staff", example: "29.4" },
      { column: "parking_bays", kind: "integer", description: "Parking spaces", example: "180" },
      { column: "median_income_zip", kind: "currency", description: "Catchment median household income ($)", example: "61240" },
      { column: "competitor_count_1km", kind: "integer", description: "Competitor grocers within 1 km (negative entries are errors)", example: "2" },
      { column: "footfall", kind: "integer", description: "Weekly store entries (sensor)", example: "7412" },
      { column: "transactions", kind: "integer", description: "Weekly till transactions", example: "2384" },
      { column: "sales", kind: "currency", description: "Weekly net sales ($; gaps from outage)", example: "33812.50" },
      { column: "promo_spend", kind: "currency", description: "Weekly local promotion spend ($)", example: "1204.90" },
      { column: "markdown_pct", kind: "percent", description: "Share of sales on markdown (%)", example: "3.84" },
    ],
    initialQuestions: [
      "How much of the variation in weekly sales is between stores vs within stores over time?",
      "Which store attributes correlate with sales per square metre — size, catchment income, format, competition?",
      "Do operational levers (staffing, promo spend, markdowns) associate with sales within the same store over time?",
      "Which stores persistently over- or under-perform what their attributes would predict?",
      "What would the model say about a candidate new-store profile — and why should the board only half-believe it?",
    ],
    dataset: {
      name: "Meridian store-week panel",
      filename: "retail-03-network-panel.csv",
      description: "24 stores × 104 weeks with attributes, operations and sales; panel-structured with planted defects.",
      rows: 2496,
    },

    dataQuality: [
      { issue: "Sales and footfall gaps (POS outage)", where: "sales, footfall — ~1% and ~0.8% of store-weeks", detection: "isna().sum(); group gaps by store to see if one store dominates", treatment: "Do not interpolate across weeks silently. Options: complete-case for sales models; for footfall, leave missing and use transactions-only conversion metrics for affected store-weeks. Report the exclusion." },
      { issue: "Decimal-shift sales error", where: "sales inflated ~10× on a handful of store-weeks", detection: "sales per transaction or per sqm z-score by store; errors sit 10 standard deviations out", treatment: "Divide by 10 only after confirming the pattern (consistent 10× on otherwise normal weeks); better: exclude and report." },
      { issue: "Negative competitor counts", where: "competitor_count_1km < 0", detection: "(df['competitor_count_1km'] < 0).sum()", treatment: "Impossible values: set to NaN, then per-store mode (competitor counts rarely change); document." },
      { issue: "Region casing variants", where: "region — 'NORTH' vs 'North'", detection: "unique() on region", treatment: "title-case to canonical region before any regional aggregation." },
      { issue: "Missing catchment income", where: "median_income_zip — ~2% of rows", detection: "isna() grouped by store_id", treatment: "Income is static per store: fill within store using ffill/bfill or per-store median; verify against last known value." },
      { issue: "Duplicate store-weeks", where: "~14 rows", detection: "duplicated(subset=['store_id','week']).sum()", treatment: "In panel data a duplicate KEY is fatal — every store-week must be unique; drop and log." },
    ],
    cleaningPlan: [
      { action: "Enforce the panel key: unique (store_id, week), sorted", rationale: "Every merge, lag and within-store transform assumes one row per key." },
      { action: "Canonicalise region; repair competitor counts and income within store", rationale: "Static attributes should be constant within store — within-store repair is both defensible and simple." },
      { action: "Exclude (not impute) the 10× sales errors and outage gaps for sales-dependent metrics", rationale: "Silent interpolation would fabricate the very signal the board is debating." },
      { action: "Derive panel metrics: sales_per_sqm, conversion (transactions/footfall), promo_intensity (promo_spend/sales), staff_per_100sqm", rationale: "Raw totals conflate store size with performance; derived ratios make stores comparable." },
      { action: "Set a proper MultiIndex (store_id, week) and create within-store lag/rolling features", rationale: "Lagging on a flat frame without sorting by key is the classic panel bug." },
    ],
    edaPlan: [
      { question: "Between vs within variance", method: "Variance decomposition of log sales: between-store mean vs within-store deviations", expectation: "~75–80% of variance is between stores — attributes matter more than weekly ops." },
      { question: "Sales per sqm by format", method: "groupby('format') mean and spread of sales_per_sqm", expectation: "Convenience highest per sqm, Supercentre lowest — but check totals too." },
      { question: "Attribute correlations", method: "Store-level (24 rows) correlation of mean sales vs sqm, income, competitors, parking", expectation: "sqm and income positive; competitors mildly negative; beware 24-point sample." },
      { question: "Operational levers within stores", method: "Within-store correlation (demeaned by store) of promo_spend/markdown with sales", expectation: "Promo intensity positively associated; markdown negatively (clearance weeks)." },
      { question: "Seasonality and holidays", method: "Mean sales by week-of-year; flag December", expectation: "Clear December peak; summer dip in Supermarkets." },
      { question: "Persistently outperforming stores", method: "Store mean sales vs store attributes scatter, annotated residuals", expectation: "2–3 stores sit visibly above the attribute-implied line — refurb candidates." },
    ],
    statisticsPlan: [
      { technique: "Variance decomposition (between/within)", purpose: "Frame where explanation lives before modelling", expectation: "Store attributes dominate — the model must respect this." },
      { technique: "Pooled OLS on log sales with attribute + operational covariates", purpose: "First multivariate read; coefficients ≈ elasticities", expectation: "log(sqm) ~ 0.7–0.85 (sublinear scale), income positive, promo positive." },
      { technique: "Store fixed-effects regression (within transformation)", purpose: "Purge time-invariant store traits; estimate operational levers cleanly", expectation: "Promo effect shrinks vs pooled; staffing stays mildly positive." },
      { technique: "Cluster-robust standard errors (by store)", purpose: "Honest uncertainty under serial correlation within stores", expectation: "CIs widen materially vs naive SEs — this is the point." },
      { technique: "Residual-based store ranking", purpose: "Identify over/under-performers net of attributes", expectation: "Stable top/bottom 3 across the second year — actionable shortlist." },
    ],
    visualisationPlan: [
      { chart: "Variance decomposition bar (between vs within)", answers: "Where does performance differences live?", reads: "Two bars showing ~4:1 between dominance." },
      { chart: "Scatter — mean sales vs sqm by store, sized by income, coloured by format", answers: "Do attributes line up?", reads: "Slope + residual outliers; annotate the three over-performers." },
      { chart: "Slope plot or ridgeline — weekly sales by format over the year", answers: "What is seasonal vs structural?", reads: "December lift common to all; baseline differences structural." },
      { chart: "Coefficient plot (pooled vs fixed-effects, with CIs)", answers: "Which levers survive controls?", reads: "Dot + CI per covariate; shrunk/promoted effects visible across models." },
      { chart: "Residual ranking bar (stores sorted by mean residual)", answers: "Which stores beat their profile?", reads: "Bars around zero; extremes are the shortlist." },
    ],
    findings: [
      "About three-quarters of sales variance is between stores, not within them: who a store IS (size, catchment, format) dominates what a store DOES week to week.",
      "Scale is sublinear: doubling floor area associates with only ~75–85% higher sales (log-sqm coefficient 0.75–0.85), so sales per sqm fall with size — big is not automatically efficient.",
      "Catchment income is the strongest environmental driver; each $10k of median income associates with roughly 12–16% higher sales for comparable stores, but on 24 stores the confidence interval is wide.",
      "Within stores, promotion spend associates with a modest same-week sales lift that shrinks by roughly half under store fixed effects — part of the raw association is store selection, not the promotion itself.",
      "Three stores persistently outperform their attribute profile (residuals in the top decile both years); two persistently underperform — the natural refurbish / review shortlist for the network plan.",
    ],
    recommendations: [
      { what: "Prioritise the three over-performing stores for reinvestment (refurb, range expansion) rather than spreading capex evenly", why: "They already beat their profile — incremental investment lands on proven demand.", impact: "Highest expected return per capex dollar in the network", horizon: "this quarter" },
      { what: "Commission a diagnostic review of the two persistent under-performers before any closure decision", why: "Under-performance net of attributes points to execution (range, service, local price image) rather than location.", impact: "Protects option value; closures are irreversible", horizon: "immediate" },
      { what: "Treat staffing as a floor, not a lever: hold current FTE ratios, don't chase marginal sales via staffing", why: "Within-store staffing elasticity is small and noise-dominated in this data.", impact: "Avoids spend with no measurable payoff", horizon: "this quarter" },
      { what: "Size new stores to the sublinear scale curve (lean toward Supermarket over Supercentre in mid-income catchments)", why: "Sales per sqm decline with size; the elasticity estimate directly prices the format choice.", impact: "Better unit economics per new opening", horizon: "longer term" },
      { what: "Present all driver estimates with cluster-robust CIs and a 24-store caveat to the board", why: "The policy debate deserves honesty about precision; over-claiming from 24 units is how networks get mis-built.", impact: "Decision quality", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "Two years of store-week data resolve the network debate mostly in favour of structure: about three-quarters of performance variation sits between stores, driven by size (with clearly diminishing returns), catchment income and format. Operational levers matter far less week to week — and the apparent promotion lift halves once store selection is controlled with fixed effects. Three stores beat their profile persistently and head the reinvestment shortlist; two laggards warrant diagnostic review before any irreversible decision. Every coefficient in this pack carries a cluster-robust interval, and the board should read the income effect as directionally solid but imprecisely sized: 24 stores is 24 stores.",
      structure: [
        "1. The board question and scope",
        "2. Data basis: panel construction, quality treatment, metric definitions",
        "3. Where variance lives: between vs within decomposition",
        "4. Attribute drivers: scale, income, competition (with coefficient plot)",
        "5. Operational levers under fixed effects",
        "6. Store residuals: the reinvestment and review shortlists",
        "7. Network-plan implications with confidence levels",
        "8. Limitations: 24 clusters, no randomisation, two years only",
        "9. Appendix: cleaning log, model tables, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Set up the panel correctly",
        goal: "Load, key, sort and validate the panel — the step every later model depends on.",
        instructions: [
          "Confirm one row per (store_id, week): duplicates at key level are fatal and must be resolved before anything else.",
          "Set a MultiIndex, sort, and verify each store has a contiguous run of weeks. Note the outage gaps rather than papering over them.",
          "Separate in your mind static attributes (sqm, income, format) from weekly operations (footfall, promo, sales) — they will play different roles in modelling.",
        ],
        hints: [
          "Panel data is not 'a big table' — it's N units × T periods; every method choice flows from that structure.",
          "df = df.set_index(['store_id','week']).sort_index(); then df.index.is_unique tells you if the key holds.",
          "df.groupby(level=0).size().describe() reveals stores with missing weeks — the outage's fingerprint.",
        ],
        checkpoint: "A validated, sorted panel with unique keys and a per-store week-count table.",
        code: {
          label: "Panel setup",
          language: "python",
          source: `df = pd.read_csv("retail-03-network-panel.csv", parse_dates=["week"])
df = df.drop_duplicates(subset=["store_id", "week"])
df = df.set_index(["store_id", "week"]).sort_index()
print("key unique:", df.index.is_unique)
print(df.groupby(level="store_id").size().describe())`,
        },
      },
      {
        phase: "quality",
        title: "Audit with panel-aware eyes",
        goal: "Find the defects the way a panellist would: within-store consistency checks.",
        instructions: [
          "Static attributes must be constant within store: check nunique() per store for sqm, format, income — violations reveal stale or shifted values.",
          "Sales sanity: compute sales per transaction per store-week; the decimal-shift errors announce themselves as extreme outliers.",
          "Audit missingness by store and week: is the outage concentrated? Count negative competitor counts and region casing variants.",
        ],
        hints: [
          "Within-store consistency is the panel's free error detector: a store's sqm should never vary.",
          "df.groupby(level='store_id')['sqm'].nunique() > 1 flags impossible variation; z-score the log of sales/transactions within store to catch the 10× rows.",
          "Missingness is information: if one store's sensor died for a month, footfall-based conversion needs a footnote, not an imputation.",
        ],
        checkpoint: "A defect table including which stores the outage touched and the exact rows you will exclude.",
      },
      {
        phase: "cleaning",
        title: "Clean without fabricating signal",
        goal: "Repair the repairable, exclude the poison, and derive comparable metrics.",
        instructions: [
          "Canonicalise region; repair competitor counts and income within store (they are static); drop key duplicates.",
          "Exclude (don't fix) the 10× sales rows and outage gaps for sales metrics; keep a row-count ledger of every exclusion.",
          "Derive sales_per_sqm, conversion, promo_intensity, staff_per_100sqm. Log-transform sales and sqm for the modelling to come.",
        ],
        hints: [
          "The discipline: impute static attributes within store, never impute the outcome variable (sales) — you'd be inventing the y you're about to explain.",
          "df.groupby(level='store_id')['median_income_zip'].transform(lambda s: s.fillna(s.median())) repairs static gaps safely.",
          "np.log on sales and sqm now saves interpretation pain later: log-log coefficients read as elasticities.",
        ],
        checkpoint: "A clean panel with derived metrics, an exclusion ledger, and log columns ready for regression.",
        code: {
          label: "Panel-safe repairs",
          language: "python",
          source: `clean = df.copy()
clean["region"] = clean["region"].str.title()
clean["median_income_zip"] = clean.groupby(level="store_id")["median_income_zip"] \\
    .transform(lambda s: s.fillna(s.median()))
clean.loc[clean["competitor_count_1km"] < 0, "competitor_count_1km"] = np.nan

# exclude 10x sales errors via within-store z-score of log(sales/transaction)
import numpy as np
clean["sales_per_txn"] = clean["sales"] / clean["transactions"]
z = clean.groupby(level="store_id")["sales_per_txn"].transform(
    lambda s: (np.log(s) - np.log(s).mean()) / np.log(s).std())
clean = clean[z.abs() < 5 | z.isna()]
clean["log_sales"] = np.log(clean["sales"])`,
        },
      },
      {
        phase: "eda",
        title: "Decompose before you model",
        goal: "Establish where variance lives and what the store-level correlations say.",
        instructions: [
          "Split log sales variance into between-store and within-store components. This single number frames the whole report.",
          "Store-level (N=24) correlations: mean sales vs sqm, income, competitors, parking. Plot them — 24 points deserve a scatter, not just an r.",
          "Within-store (demeaned) correlations of promo_spend and markdown with sales. Note how they differ from the raw correlations.",
        ],
        hints: [
          "Between/within decomposition: total variance of log sales = variance of store means + mean of within-store variances. Two numbers, one story.",
          "Demeaning: x_demeaned = x - store_mean(x) — the within-store view that fixed effects will formalise.",
          "Watch the store-level scatter for the format confound: Supercentres are big AND high-sales, so sqm's raw correlation overstates its causal read.",
        ],
        checkpoint: "You can state the between/within split and how within-store correlations differ from raw ones.",
        code: {
          label: "Variance decomposition",
          language: "python",
          source: `store_mean = clean.groupby(level="store_id")["log_sales"].mean()
within = clean["log_sales"] - clean.groupby(level="store_id")["log_sales"].transform("mean")
total = clean["log_sales"].var()
between = store_mean.var()
print(f"between: {between/total:.1%}, within: {within.var()/total:.1%}")

# within-store correlations for operational levers
demean = lambda s: s - s.groupby(level="store_id").transform("mean")
print(np.corrcoef(demean(clean["promo_spend"].fillna(0)),
                  demean(clean["log_sales"]))[0, 1])`,
        },
      },
      {
        phase: "statistics",
        title: "Model with the structure you found",
        goal: "Pooled OLS, then store fixed effects, with cluster-robust uncertainty throughout.",
        instructions: [
          "Fit pooled OLS of log_sales on log_sqm, income, competitors, format dummies, promo_spend, markdown, staff and week-of-year controls. Interpret log-log coefficients as elasticities.",
          "Fit the same model with store fixed effects (within transformation). Which coefficients move, and why?",
          "Use cluster-robust standard errors by store in both models. Compare the CIs to naive ones.",
          "Rank stores by mean fixed-effects residual across the second year — the over/under-performer shortlists.",
        ],
        hints: [
          "Pooled OLS trusts between-store comparisons; fixed effects throw them away and use only within-store variation. When they disagree, selection is afoot.",
          "statsmodels: smf.ols('log_sales ~ log_sqm + income + promo + ... + C(store_id)', data=...).fit(cov_type='cluster', cov_kwds={'groups': ...}) — the FE model is just store dummies.",
          "Mean residual per store after FE is 'performance the model cannot explain by attributes or levers' — that's exactly the shortlist the board wants.",
        ],
        checkpoint: "Two model tables with clustered CIs, a comparison narrative, and the residual-ranked store list.",
        code: {
          label: "Pooled vs fixed effects",
          language: "python",
          source: `import statsmodels.formula.api as smf

m = clean.reset_index()
pooled = smf.ols(
    "log_sales ~ log_sqm + median_income_zip + competitor_count_1km"
    " + promo_spend + markdown_pct + staff_fte + C(format)",
    data=m).fit(cov_type="cluster", cov_kwds={"groups": m["store_id"]})
print(pooled.summary().tables[1])

fe = smf.ols(
    "log_sales ~ promo_spend + markdown_pct + staff_fte + C(store_id)",
    data=m).fit(cov_type="cluster", cov_kwds={"groups": m["store_id"]})
m["fe_resid"] = fe.resid
print(m.groupby("store_id")["fe_resid"].mean().sort_values())`,
        },
      },
      {
        phase: "visualisation",
        title: "The board-ready visual set",
        goal: "Five figures that make a non-technical board see the structure, the levers and the shortlists.",
        instructions: [
          "Between/within variance bars; store scatter (sales vs sqm, size by income, colour by format) with over-performers annotated; seasonality lines by format; pooled-vs-FE coefficient plot with CIs; residual ranking bars.",
          "The coefficient plot is the credibility centrepiece: readers must see which effects shrink under controls.",
          "Annotate the three over-performing stores by ID — the board will ask for names.",
        ],
        hints: [
          "Coefficient plots: extract params and CI bounds from both models, plot side by side with plt.errorbar — one model colour per estimator.",
          "For the scatter, use income as point size and format as hue; add text labels only for the top/bottom residual stores to avoid clutter.",
          "If a chart would need a statistics degree, replace it: the board version is the model's story, not the model.",
        ],
        checkpoint: "Five figures, each carrying one numbered finding of the report.",
      },
      {
        phase: "interpretation",
        title: "Read the model honestly",
        goal: "Translate coefficients into board language with confidence levels attached.",
        instructions: [
          "State each driver's effect size in business units (a doubling of floor space → +X% sales) with its CI.",
          "Explain to a non-technical reader why the promotion effect shrank under fixed effects — selection vs causation in two sentences.",
          "Grade your confidence per finding (solid / directional / speculative) and connect each grade to sample size or model structure.",
        ],
        hints: [
          "Elasticity translation: a log-log coefficient of 0.8 means doubling the input multiplies sales by 2^0.8 ≈ 1.74 — practise this conversion until it's natural.",
          "The honest sentence pattern: 'We estimate X (CI: a to b), from N stores over T weeks; this is association net of controls, not an experiment.'",
          "Confidence grading forces you to decide what the board may lean on — that judgement is the analyst's real product.",
        ],
        checkpoint: "A findings table: claim, effect size, CI, confidence grade, and the model it came from.",
      },
      {
        phase: "recommendations",
        title: "Network-plan guidance",
        goal: "Recommendations that respect both the evidence and its limits.",
        instructions: [
          "Convert the shortlists and elasticities into network actions (reinvest, review, sizing guidance), each with a confidence grade.",
          "Flag irreversible decisions (closures) for additional evidence, and suggest what that evidence would be.",
          "Add the measurement plan: what data would make the next version of this model stronger (holdout promotions, competitor audits).",
        ],
        hints: [
          "Board decisions want options with prices, not commands: present the reinvestment shortlist as ranked candidates with expected-return logic.",
          "Recommend against actions the data can't support — that's also a recommendation, often the most valuable one.",
          "The strongest close: 'here is what we would measure next year so the 2027 version of this debate is shorter.'",
        ],
        checkpoint: "A recommendations table with confidence grades and the next-data plan.",
      },
      {
        phase: "report",
        title: "The network evidence pack",
        goal: "A strategy-director-grade report: clear structure, honest uncertainty, reproducible back end.",
        instructions: [
          "Structure per the finalReport outline; lead with the between/within finding because it reframes the whole debate.",
          "Include the model tables and cleaning log as appendices; keep the body under six pages of prose.",
          "State the headline limitations in the body, not the appendix: 24 clusters, no randomisation, two years.",
        ],
        hints: [
          "The report's spine is one sentence per section; write those nine sentences first, then expand.",
          "Executives quote what they can repeat — make the between/within line memorable and the elasticity translation clean.",
          "A reproducibility appendix (one script, one command) is what turns a report into an asset.",
        ],
        checkpoint: "The complete evidence pack, reproducible end to end from the raw CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the strategy team's analyst. The board wants the network debate settled with evidence: store performance drivers, honest uncertainty, and the reinvestment/review shortlists. You own every methodological choice — panel treatment, model structure, uncertainty reporting — and every choice must be defensible in the appendix.",
      deliverables: [
        "Panel construction and quality treatment log (including outage and 10×-error handling)",
        "Between/within variance decomposition",
        "Pooled and store-fixed-effects models with cluster-robust inference",
        "Coefficient plot and residual-based store rankings",
        "Network-plan recommendations with confidence grades and a next-data plan",
      ],
      guardrails: [
        "No causal language for attribute effects — association only",
        "Uncertainty reported as CIs, never bare point estimates",
        "Outcome-variable imputation must be justified or absent",
        "Every board-facing number traceable to a model table or cleaning-log entry",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Panel key (store × week) unique before any lag/rollup",
        "Fixed-effects model uses within-store variation only (store dummies or demeaning)",
        "Elasticity interpretations correct for log-log specifications",
      ],
      "code-quality": [
        "Panel operations (shift, rolling) respect sorted MultiIndex",
        "Exclusion ledger for the outage and 10× errors is explicit and counted",
      ],
      reasoning: [
        "Between/within decomposition drives the modelling narrative",
        "Pooled-vs-FE divergence explained as store selection, not waved away",
      ],
      visualization: [
        "Coefficient plot with CIs comparing models",
        "Store scatter distinguishes format and annotates the shortlists",
      ],
      interpretation: [
        "Confidence grades assigned per finding with reasons (sample size, structure)",
        "Elasticities translated into board language correctly",
      ],
      recommendations: [
        "Irreversible decisions flagged for further evidence",
        "Reinvestment shortlist tied to residual rankings, not raw sales",
      ],
    },
  },
];
