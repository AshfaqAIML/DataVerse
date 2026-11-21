/**
 * Business intelligence projects — BIQ-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const BI_PROJECTS: DapProject[] = [
  /* ================================================================ BIQ-01 */
  {
    id: "bi-1",
    categoryId: "bi",
    difficulty: "beginner",
    code: "BIQ-01",
    title: "Executive KPI Report Build",
    subtitle: "Three years of monthly numbers: define the KPIs, build the trends, brief the executive team.",
    summary:
      "A first BI deliverable: clean a regional monthly KPI table, define five executive metrics with stated formulas, build trend and target views, and write the one-page brief leadership actually reads.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["KPI definition", "Trend analysis", "Growth & churn metrics", "Target tracking", "Executive brief writing"],

    businessBackground:
      "Meridian Consumer Brands has grown from one region to six, and its leadership meetings run on whatever spreadsheet the finance analyst last emailed — a different one each month, with different definitions of 'growth'. The CEO wants a standing KPI report: five metrics defined once, trended over three years, compared across regions and against targets, delivered as a one-page brief with the numbers behind it. The regional monthly table is finally assembled; the definitions are the analyst's to make.",
    problemStatement:
      "Build the executive KPI report: define five metrics with stated formulas (revenue, net customer growth, churn rate, CAC proxy, NPS); trend them over three years; compare regions; track against reasonable targets; and deliver the one-page brief with a reproducible appendix.",
    businessObjectives: [
      "Define the five KPIs with formulas and data-lineage documented",
      "Compute monthly and quarterly trends per region and company-wide",
      "Compare region performance on the KPI set",
      "Establish target comparisons and flag breaches and milestones",
      "Deliver the one-page brief plus the reproducible number set",
    ],
    datasetDescription:
      "A regional monthly table (216 rows): 36 months × 6 regions with revenue, new and churned customers, marketing spend, support tickets, NPS and headcount. Month labels mix two formats, NPS has gaps, a few churn values exceed new customers (impossible net growth), region labels vary in case, and duplicates exist. Small data, big consequence: every defect is visible in a chart the CEO will study.",
    dataDictionary: [
      { column: "month", kind: "categorical", description: "Month label (two formats mixed)", example: "2025/03" },
      { column: "region", kind: "categorical", description: "Region (casing variants)", example: "midwest" },
      { column: "revenue", kind: "currency", description: "Monthly revenue", example: "48210.50" },
      { column: "new_customers", kind: "integer", description: "New customers added", example: "168" },
      { column: "churned_customers", kind: "integer", description: "Customers lost (values > new are errors)", example: "42" },
      { column: "marketing_spend", kind: "currency", description: "Marketing spend", example: "9840.00" },
      { column: "support_tickets", kind: "integer", description: "Support tickets raised", example: "204" },
      { column: "nps", kind: "integer", description: "Net Promoter Score (some missing)", example: "38" },
      { column: "headcount", kind: "integer", description: "Regional headcount", example: "52" },
    ],
    initialQuestions: [
      "What are the company-wide trends for the five KPIs over three years?",
      "Which regions lead and lag on growth, churn and efficiency?",
      "When did the company's growth inflect, and what moved with it?",
      "What is a reasonable target line for each KPI, and where are the breaches?",
      "What should the one-page brief's headline be?",
    ],
    dataset: {
      name: "Meridian regional KPIs",
      filename: "bi-01-regional-kpis.csv",
      description: "36 months × regions of revenue, customers, spend, tickets, NPS and headcount.",
      rows: 216,
    },

    dataQuality: [
      { issue: "Mixed month formats", where: "month — '2025-03' and '2025/03'", detection: "value_counts() pattern check", treatment: "Parse to period with format='mixed'; verify 36 unique months." },
      { issue: "Impossible churn", where: "churned_customers > new_customers", detection: "compare columns", treatment: "Impossible net-negative growth as recorded: investigate, correct or exclude with the story stated (a data error, not a business event)." },
      { issue: "Missing NPS", where: "nps — ~5% of rows", detection: "isna().sum()", treatment: "Keep rows, exclude from NPS trends; NPS reporting needs the coverage stated." },
      { issue: "Region casing", where: "region — 'midwest' variants", detection: "value_counts()", treatment: "Title-case to canonical regions." },
      { issue: "Duplicate region-months", where: "~8 duplicated rows", detection: "duplicated(['month','region']).sum()", treatment: "Drop — the KPI table's grain must be unique." },
    ],
    cleaningPlan: [
      { action: "Parse months to periods; canonicalise regions; deduplicate the grain", rationale: "The KPI table's integrity is the report's foundation." },
      { action: "Resolve impossible churn rows (investigate, then correct or exclude with disclosure)", rationale: "A net-growth chart with impossible cells misleads the CEO directly." },
      { action: "Derive the KPI set: net growth, churn rate, CAC proxy, tickets per customer", rationale: "The five metrics, each with its formula written once." },
      { action: "Build company-level aggregation with region shares preserved", rationale: "Executive views roll up; the region detail stays one join away." },
    ],
    edaPlan: [
      { question: "Company KPI trends", method: "monthly (and 3-month rolling) revenue, net adds, churn rate", expectation: "Revenue doubling over the period with visible seasonal dips." },
      { question: "Region comparison", method: "latest-year KPI set by region, sorted by revenue", expectation: "West and Northeast lead; Canada smallest but fastest-growing." },
      { question: "Growth inflection", method: "net adds over time with spend overlay", expectation: "A visible inflection when marketing spend stepped up mid-2024." },
      { question: "Churn dynamics", method: "churn rate trend by region", expectation: "Churn improving company-wide; one region persistently worse." },
      { question: "NPS story", method: "NPS trend where present, by region", expectation: "Noisy but flat-to-improving; the missing months disclosed." },
    ],
    statisticsPlan: [
      { technique: "KPI computation with documented formulas", purpose: "The five metrics, defined once", expectation: "Growth ~7%/quarter, churn ~24% annualised, CAC proxy drifting down." },
      { technique: "Trend decomposition (12-month rolling + YoY)", purpose: "Separate trend from seasonality without formal decomposition", expectation: "Q4 dips visible in both years — seasonal, not structural." },
      { technique: "Simple target-setting (historical percentile + trajectory)", purpose: "Defensible target lines for the brief", expectation: "Targets set at top-quartile historical performance with the method stated." },
    ],
    visualisationPlan: [
      { chart: "Line — company revenue with 3-month rolling and YoY annotation", answers: "Are we growing?", reads: "Trend line with seasonality visible; the YoY % labelled at year ends." },
      { chart: "Grouped bar — latest-year KPI set by region (revenue and net growth)", answers: "Who carries the business?", reads: "Sorted bars; leaders and laggards named." },
      { chart: "Line — churn rate by region over time", answers: "Is retention healthy everywhere?", reads: "Falling lines good; the persistently-worse region flagged." },
      { chart: "Line — CAC proxy trend with target line", answers: "Is acquisition efficient?", reads: "Drifting toward target; breaches marked." },
      { chart: "Small multiples — the five KPIs' 36-month paths", answers: "The one-glance executive view", reads: "Five panels, consistent scaling, target lines where set." },
    ],
    findings: [
      "Company revenue has roughly doubled over three years (~6–7% quarterly growth) with a consistent Q4 seasonal dip — the trend is structural growth, not a spike.",
      "Net customer growth inflected upward in mid-2024 when marketing spend stepped up, and the CAC proxy actually improved — more growth per dollar, not just more dollars.",
      "Churn improved company-wide (annualised churn down several points), but one region runs persistently worse — the retention story's one open question.",
      "Region leadership is stable (West and Northeast carry ~45% of revenue), while Canada is the fastest-growing despite being smallest — the expansion question's data point.",
      "NPS is noisy and flat-to-slightly-improving with five months of coverage gaps; the brief reports it with its coverage honestly stated rather than smoothing over the holes.",
    ],
    recommendations: [
      { what: "Adopt the five-KPI definitions as the standing report standard (formulas in the appendix)", why: "The 'different spreadsheet each month' problem was a definitions problem; definitions fixed once fix it permanently.", impact: "Reporting consistency", horizon: "immediate" },
      { what: "Commission the retention deep-dive on the persistently-worse churn region", why: "Company-wide improvement hides one open problem; the brief flags it, the next analysis solves it.", impact: "Targets the one weak KPI", horizon: "this quarter" },
      { what: "Evaluate Canada's expansion economics for the next budget cycle", why: "Fastest growth on the smallest base is the classic expansion candidate — and the KPI trends now exist to evaluate it.", impact: "Growth strategy input", horizon: "this quarter" },
      { what: "Set NPS survey coverage to a fixed monthly cadence with a completeness SLA", why: "Five months of gaps make the trend nearly unreportable; the fix is operational, not analytical.", impact: "Restores a KPI's credibility", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "Meridian's standing KPI report, on definitions fixed once: revenue has doubled over three years (~6–7% quarterly) with a consistent Q4 seasonal dip; net growth inflected upward with the mid-2024 marketing step-up while acquisition efficiency improved; churn is better everywhere except one persistently-lagging region; Canada is the fastest-growing region on the smallest base and the natural expansion question. NPS trends flat-to-improving but carries five months of coverage gaps that the operations team should close. The one-page brief carries the five-KPI small-multiples view; every number traces to the appendix definitions and script.",
      structure: [
        "1. The report's purpose and the five KPI definitions",
        "2. Data and quality treatment (including the churn corrections)",
        "3. Company trends: the five KPIs over 36 months",
        "4. Region comparison and the churn outlier",
        "5. The inflection story (spend, growth, efficiency)",
        "6. Targets, breaches and the one-page brief",
        "7. Appendix: formulas, cleaning log, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Define before you compute",
        goal: "The five KPIs with formulas — the report's constitution.",
        instructions: [
          "Write the definitions cell: revenue (sum), net adds (new − churned), churn rate (churned / prior customer base — note the approximation), CAC proxy (spend / new), NPS (mean, coverage stated).",
          "Profile the table; note month formats and the impossible-churn rows.",
          "Confirm the grain: region-month, unique after dedup.",
        ],
        hints: [
          "The definitions box is the deliverable's core artifact — every chart in the report inherits it.",
          "Churn rate needs a denominator (prior base) this table doesn't carry: state the approximation (churned/new as a proxy ratio) or derive base from cumulative adds — document either.",
          "Month-format mixing is a one-line fix that silently doubles month counts if missed: parse to period, assert 36 unique months.",
        ],
        checkpoint: "Definitions written, grain confirmed, formats noted.",
        code: {
          label: "Definitions and profile",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("bi-01-regional-kpis.csv")
df["month_p"] = pd.to_datetime(df["month"], format="mixed").dt.to_period("M")
print("unique months:", df["month_p"].nunique())
print("dupes:", df.duplicated(["month_p", "region"]).sum())
print("impossible churn:", (df["churned_customers"] > df["new_customers"]).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the KPI table",
        goal: "Five defect families with the churn-impossibility investigated.",
        instructions: [
          "Quantify each defect; investigate the impossible-churn rows specifically (which regions, which months).",
          "Decide treatments; note NPS coverage by region.",
          "Write the audit table.",
        ],
        hints: [
          "Impossible churn rows: if concentrated in one region-month, it's a data error to correct or exclude; if scattered, it's a systematic capture problem worth its own finding.",
          "NPS coverage by region and month — the completeness map that determines how the brief reports it.",
          "Duplicates at the region-month grain double-count revenue in the company rollup — the defect with the most visible consequence.",
        ],
        checkpoint: "The audit table with the churn investigation documented.",
      },
      {
        phase: "cleaning",
        title: "Build the KPI frame",
        goal: "Clean frame with derived KPIs and company rollup.",
        instructions: [
          "Apply treatments; derive the KPI columns per region-month; roll up to company-month.",
          "Verify: revenue rollup equals region sum; net adds arithmetic consistent.",
          "Compute the 36-month company series for all five KPIs.",
        ],
        hints: [
          "Rollup checks (company = Σ regions) are cheap asserts that catch grain mistakes.",
          "CAC proxy = marketing_spend / new_customers — guard division by zero on small months.",
          "3-month rolling views smooth the monthly noise for executive eyes — raw monthly stays in the appendix.",
        ],
        checkpoint: "The KPI frame and company series verified.",
        code: {
          label: "KPI frame",
          language: "python",
          source: `clean = df.drop_duplicates(["month_p", "region"]).copy()
clean["region"] = clean["region"].str.title()
clean = clean[clean["churned_customers"] <= clean["new_customers"]].copy()

clean["net_adds"] = clean["new_customers"] - clean["churned_customers"]
clean["churn_ratio"] = clean["churned_customers"] / clean["new_customers"]
clean["cac_proxy"] = clean["marketing_spend"] / clean["new_customers"]

company = clean.groupby("month_p").agg(
    revenue=("revenue", "sum"), net_adds=("net_adds", "sum"),
    new=("new_customers", "sum"), spend=("marketing_spend", "sum"),
    nps=("nps", "mean"), tickets=("support_tickets", "sum")).reset_index()
company["cac"] = company["spend"] / company["new"]
print(company.tail())`,
        },
      },
      {
        phase: "eda",
        title: "Trends, regions and inflections",
        goal: "The five KPI trends, region comparison, the growth story.",
        instructions: [
          "Company trends for all five KPIs (monthly + rolling); the Q4 seasonality check.",
          "Latest-year region KPI sets, sorted; the churn outlier region.",
          "The spend-growth overlay for the inflection story.",
        ],
        hints: [
          "The overlay (spend and net adds on one indexed chart) tells the inflection story in one exhibit.",
          "Region comparison on the FULL KPI set, not just revenue — efficiency and retention differ by region.",
          "Seasonality: compare same-month-across-years before calling anything seasonal.",
        ],
        checkpoint: "Trends built, regions compared, the inflection documented.",
      },
      {
        phase: "statistics",
        title: "Targets and honest trend claims",
        goal: "Target lines with methods; trend claims with simple support.",
        instructions: [
          "Set targets from historical top-quartile performance (method stated) for the KPIs that warrant them.",
          "Compute YoY growth properly (same-month prior year); quantify the churn improvement.",
          "Flag breaches and milestones against the targets.",
        ],
        hints: [
          "Target method transparency: 'top-quartile historical regional performance' is defensible; 'aspiration' is not.",
          "YoY on matched months avoids the seasonality trap that quarterly comparisons set.",
          "The breach list is the brief's action section: what needs attention, by how much.",
        ],
        checkpoint: "Targets set with methods, breaches flagged, trend claims quantified.",
      },
      {
        phase: "visualisation",
        title: "The executive exhibits",
        goal: "Five charts led by the five-KPI small multiples.",
        instructions: [
          "Small multiples of the five KPIs (the brief's body chart); revenue trend with YoY; region bars; churn lines; CAC with target.",
          "Consistent scaling and target lines across the multiples.",
          "Annotate the inflection and the churn outlier.",
        ],
        hints: [
          "Small multiples with shared styling read as ONE chart — that's the one-pager's chart.",
          "The churn outlier region gets its own colour and label on the churn lines.",
          "Mark target breaches with a consistent symbol across all charts — the visual grammar of 'needs attention'.",
        ],
        checkpoint: "Five exhibits, small-multiples chart polished.",
      },
      {
        phase: "interpretation",
        title: "Write the brief's story",
        goal: "Findings in executive language with the inflection and outlier named.",
        instructions: [
          "Answer the five questions; each KPI gets one sentence of trend and one of consequence.",
          "Keep the churn outlier and NPS coverage gaps visible — executive briefs that hide problems lose trust.",
          "Draft the headline sentence.",
        ],
        hints: [
          "The one-pager's structure: headline → five KPI sentences → two flags (churn region, NPS coverage) → the ask.",
          "Trend + consequence pattern: 'Churn improved 3 points to 21% annualised — retention spend is paying off except in [region].'",
          "The headline should be the inflection story: growth accelerating while efficiency improves.",
        ],
        checkpoint: "The brief's story drafted with flags visible.",
      },
      {
        phase: "recommendations",
        title: "The report's asks",
        goal: "Standards adoption, the churn deep-dive, expansion evaluation, NPS fix.",
        instructions: [
          "Recommend the four actions with their evidence.",
          "Each with an owner-type and a decision horizon.",
          "Frame the asks as the report's standing agenda (this is a recurring deliverable).",
        ],
        hints: [
          "The definitions adoption is the zero-cost ask that makes all future asks cleaner.",
          "The churn deep-dive scopes naturally from the outlier finding — name the region and the gap.",
          "NPS coverage is an operational ask (survey cadence SLA), not an analytical one — say so.",
        ],
        checkpoint: "The asks with evidence, owners and horizons.",
      },
      {
        phase: "report",
        title: "The one-page brief",
        goal: "The brief plus the reproducible appendix.",
        instructions: [
          "One page: headline, five-KPI chart, five sentences, two flags, asks.",
          "Appendix: definitions, cleaning log, the full series, the script.",
          "Date-stamp and version — this is a standing report now.",
        ],
        hints: [
          "One page means ONE page — if it doesn't fit, the story isn't tight enough yet.",
          "The appendix is what makes the brief defensible in the meeting: 'the formula is in the appendix' ends most debates.",
          "Version the definitions separately from the data — definitions change rarer and matter more.",
        ],
        checkpoint: "The brief and appendix, every number traceable.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the CEO's analyst. Build the standing KPI report: five metrics defined once, trended over three years, compared across regions, tracked against defensible targets. Definitions, approximations and target methods are yours — documented.",
      deliverables: [
        "The five-KPI definition set with formulas and approximations stated",
        "Clean KPI frame with company rollup (verified)",
        "36-month trends with seasonality identified and the inflection documented",
        "Region comparison including the churn outlier",
        "The one-page brief with target breaches, flags and asks",
      ],
      guardrails: [
        "Every KPI formula documented before computing",
        "Churn approximation stated; impossible rows resolved transparently",
        "NPS coverage disclosed with the trend",
        "Targets set from stated methods, not aspirations",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Month formats normalised; grain unique before rollup",
        "Net adds and churn arithmetic consistent with definitions",
        "Company rollup equals region sum (verified)",
      ],
      "code-quality": [
        "Definitions encoded once as derived columns",
        "Rollup checks as asserts",
      ],
      reasoning: [
        "Seasonality distinguished from structural trend",
        "The inflection attributed with spend-growth evidence",
      ],
      visualization: [
        "Small multiples with consistent scaling and target lines",
        "Breaches marked with consistent visual grammar",
      ],
      interpretation: [
        "The churn outlier and NPS gaps kept visible",
        "Each KPI read with trend and consequence",
      ],
      recommendations: [
        "Definitions adoption as the standing standard",
        "Operational (NPS) vs analytical asks distinguished",
      ],
    },
  },

  /* ================================================================ BIQ-02 */
  {
    id: "bi-2",
    categoryId: "bi",
    difficulty: "intermediate",
    code: "BIQ-02",
    title: "Metrics Layer & Dashboard Design",
    subtitle: "Nine thousand orders and a targets table: design the metric tree, build the semantics, specify the dashboard.",
    summary:
      "BI architecture work: deduplicate the fact-dimension mess, design a metrics layer (star-schema thinking, measure definitions), compute the metric set, and produce a dashboard specification with measures, filters, layout and DAX-measure drafts.",
    hours: 11,
    tools: ["Python", "pandas", "Matplotlib", "SQL (concepts)", "DAX (concepts)"],
    skills: ["Star-schema thinking", "Metric-tree design", "Semantic-layer definition", "Dashboard specification", "Measure authorship"],

    businessBackground:
      "Meridian Consumer Brands' analytics team is drowning in conflicting numbers: every region reports 'sales' differently, finance's margin math differs from operations', and the executive dashboard has three versions of the truth. The company is standardising on a BI platform, and the analytics lead has been asked to design the metrics layer before the dashboards get rebuilt: a clean order fact table, a targets dimension deduplicated from repeated columns, a documented measure catalogue, and a dashboard spec that a BI developer can implement directly.",
    problemStatement:
      "Design and prototype the metrics layer: construct the fact and dimension tables from the messy order export; define the measure catalogue (revenue, margin, units, AOV, target attainment) with formulas and grain; compute the metric set for validation; and deliver the dashboard specification — pages, visuals, filters, and DAX-style measure definitions.",
    businessObjectives: [
      "Construct the order fact table and the region-month target dimension (deduplicated)",
      "Define the measure catalogue: name, formula, grain, filter context for each measure",
      "Compute and validate the metric set against the raw data",
      "Design the metric tree (north-star → driver → component)",
      "Deliver the dashboard spec: pages, visuals, filters and measure definitions",
    ],
    datasetDescription:
      "~9,000 order rows: order id, date, region, channel, category, units, price, discount (mixed encodings), cost (gaps), marketing source, new-customer flag and a region-month target repeated on every row (the classic denormalised export). Discounts mix decimals and percentages, costs are missing on some rows, new-customer flags mix encodings, duplicates exist — and the repeated targets must be deduplicated into a dimension before any attainment math is honest.",
    dataDictionary: [
      { column: "order_id", kind: "id", description: "Order identifier", example: "772481" },
      { column: "order_date", kind: "date", description: "Order date", example: "2025-06-18" },
      { column: "month", kind: "categorical", description: "Order month (for target join)", example: "2025-06" },
      { column: "region", kind: "categorical", description: "Region (casing variants)", example: "Northeast" },
      { column: "channel", kind: "categorical", description: "Web / Mobile App / Partner / Retail", example: "Web" },
      { column: "category", kind: "categorical", description: "Product category", example: "Home Office" },
      { column: "units", kind: "integer", description: "Units ordered", example: "3" },
      { column: "unit_price", kind: "currency", description: "Unit price before discount", example: "42.50" },
      { column: "discount", kind: "percent", description: "Discount (decimal/percent mixed)", example: "0.15" },
      { column: "cost", kind: "currency", description: "Unit cost (some missing)", example: "21.40" },
      { column: "marketing_source", kind: "categorical", description: "Attributed source", example: "Organic" },
      { column: "is_new_customer", kind: "boolean", description: "New-customer flag (mixed encodings)", example: "TRUE" },
      { column: "region_month_target", kind: "currency", description: "Region-month revenue target (repeated per order)", example: "204000" },
    ],
    initialQuestions: [
      "What do the fact table and target dimension look like after proper separation?",
      "How should each measure be defined (revenue net of discount? margin including imputed cost?) — and what are the formula decisions?",
      "What does the metric tree look like: north-star, drivers, components?",
      "What does the metric set show once computed correctly (region attainment, channel mix, margin trends)?",
      "What is the dashboard specification a BI developer could implement tomorrow?",
    ],
    dataset: {
      name: "Meridian orders (denormalised)",
      filename: "bi-02-orders-targets.csv",
      description: "12 months of orders with repeated region-month targets — the denormalised export.",
      rows: 9000,
    },

    dataQuality: [
      { issue: "Mixed discount encodings", where: "discount — 0.15 and 15 (percent)", detection: "distribution check (bimodal 0–1 vs 0–100)", treatment: "Normalise to decimal fraction; revenue math depends on it — verify the bimodality disappears." },
      { issue: "Missing cost", where: "cost — ~5% of rows", detection: "isna().sum()", treatment: "Margin measure needs a policy: impute per-category median cost (flagged) or exclude from margin (stated) — the measure catalogue documents the choice." },
      { issue: "Mixed new-customer encodings", where: "is_new_customer — 'TRUE'/1 variants", detection: "value_counts()", treatment: "Map to boolean; the new-customer measure needs one encoding." },
      { issue: "Duplicated orders", where: "~0.7% duplicated rows", detection: "duplicated('order_id').sum()", treatment: "Drop; the fact table's grain is order." },
      { issue: "Repeated targets with gaps", where: "region_month_target — repeated per order, some missing", detection: "groupby(month, region) target nunique/NaN check", treatment: "Deduplicate to a target dimension; validate one target per region-month; missing targets disclosed (attainment unmeasurable there)." },
      { issue: "Region casing", where: "region — lower-case variants", detection: "value_counts()", treatment: "Canonicalise — the target join depends on matching keys." },
    ],
    cleaningPlan: [
      { action: "Separate fact (orders) from dimension (region-month targets) with a validated join key", rationale: "The core schema fix: repeated attributes become a dimension, joined at region-month grain." },
      { action: "Normalise discounts to decimals; map flags; deduplicate orders", rationale: "The measures' arithmetic depends on consistent encodings." },
      { action: "Resolve the cost policy with the measure catalogue documenting it", rationale: "Margin is a defined measure, not a fact — its definition includes the cost treatment." },
      { action: "Derive fact measures: revenue_net, margin, units; validate against raw totals", rationale: "The metrics layer's outputs must reconcile to the source." },
    ],
    edaPlan: [
      { question: "Fact table profile", method: "orders by month, region, channel; AOV and margin rate", expectation: "Stable monthly volumes; Web and Mobile dominant; margin ~45–55%." },
      { question: "Target dimension", method: "targets by region over months; coverage", expectation: "Rising targets; a few missing region-months." },
      { question: "Attainment picture", method: "revenue vs target by region-month (post-join)", expectation: "Attainment spread 85–120%; late-year misses in one region." },
      { question: "Channel and category economics", method: "revenue, margin, AOV by channel and category", expectation: "Partner channel high-AOV; Retail thinnest margin." },
      { question: "New-customer mix", method: "new-customer share of revenue by channel", expectation: "Paid Search skews new; Partner skews existing." },
    ],
    statisticsPlan: [
      { technique: "Measure validation (reconciliation to raw totals)", purpose: "The metrics layer's credibility test", expectation: "Net revenue reconciles within rounding; margin reconciles under the documented policy." },
      { technique: "Attainment analysis with coverage disclosure", purpose: "The headline metric, honestly", expectation: "Company attainment ~102% with regional spread and disclosed gaps." },
      { technique: "Metric decomposition (AOV = revenue/units; margin bridge)", purpose: "Driver analysis the dashboard will visualise", expectation: "AOV stable; margin variation mostly channel mix." },
    ],
    visualisationPlan: [
      { chart: "Metric tree diagram (the spec's exhibit)", answers: "What drives what?", reads: "North-star (net revenue) → drivers (orders, AOV) → components (units, price, discount, channel mix)." },
      { chart: "Line — revenue vs target by region (attainment)", answers: "Who is on track?", reads: "Actual vs target lines per region; misses visible." },
      { chart: "Bar — margin rate by channel", answers: "Where is profit made?", reads: "Sorted bars with the company rate as reference." },
      { chart: "Stacked bar — revenue by channel × new/existing", answers: "What is the growth mix?", reads: "New-customer share by channel visible." },
      { chart: "Dashboard wireframe sketch (annotated layout)", answers: "What will the BI developer build?", reads: "Page zones: KPI cards, trend, map of attainment, filter bar." },
    ],
    findings: [
      "The metrics layer separates cleanly: an order-grain fact table (~9,000 rows after dedup) and a region-month target dimension (60 rows), joining on canonicalised region + month — the export's denormalisation was the root of the three-versions problem.",
      "The measure catalogue's three contested definitions resolve with documented decisions: revenue is net of discount; margin imputes missing costs at category medians (5% of rows, flagged); attainment is measured only where targets exist (2 region-months missing, disclosed).",
      "Company attainment lands near 102% with a wide regional spread — one region misses late-year targets for three consecutive months, the dashboard's key alert.",
      "Channel economics differ structurally: Partner carries the highest AOV and margin while Retail runs the thinnest margin — the margin story is channel mix, not price changes.",
      "The metric tree holds: net revenue's drivers (order count, AOV) are stable, so attainment variance traces to order volume — the dashboard leads with volume, not price.",
    ],
    recommendations: [
      { what: "Implement the metrics layer as specified (fact + target dimension + measure catalogue) in the BI platform", why: "The conflicting-numbers problem is architectural; the layer is the fix.", impact: "One version of the truth", horizon: "this quarter" },
      { what: "Build the dashboard to the spec: attainment page for executives, channel-margin page for operations", why: "The spec encodes the audience separation that made previous dashboards unusable.", impact: "Decision-ready views per audience", horizon: "this quarter" },
      { what: "Adopt the measure catalogue as governance (change control on definitions)", why: "Definitions drift is the recurring failure mode; the catalogue makes drift visible.", impact: "Long-term reporting integrity", horizon: "immediate" },
      { what: "Fix the source-data contracts (discount encoding, cost completeness, target capture)", why: "The layer should not need to repair the export forever; contracts move fixes upstream.", impact: "Compounding data quality", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Meridian's three-versions-of-the-truth problem was architectural, and the fix is specified. The denormalised export separates into a clean order fact table and a region-month target dimension; the contested measures are defined once in a governed catalogue (revenue net of discount, margin with a documented cost-imputation policy, attainment with disclosed target coverage). On the cleaned layer, company attainment runs ~102% with one region missing late-year targets three months running — the dashboard's standing alert. Channel economics are structural (Partner leads AOV and margin; Retail thinnest), and the metric tree shows attainment variance is a volume story. The deliverable: the metrics layer, the measure catalogue and a dashboard specification a BI developer can implement directly.",
      structure: [
        "1. The problem: three versions of the truth",
        "2. The schema: fact table and target dimension (with join validation)",
        "3. The measure catalogue: definitions, decisions, policies",
        "4. Metric validation and reconciliation",
        "5. The metric tree and driver analysis",
        "6. Findings on the cleaned layer (attainment, channels)",
        "7. The dashboard specification (pages, visuals, filters, measures)",
        "8. Appendix: cleaning log, DAX-style measure drafts, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Think in schemas",
        goal: "Separate fact from dimension; see the denormalisation problem.",
        instructions: [
          "Profile the export; identify the repeated attribute (region-month target) and the fact grain (order).",
          "Write the schema plan: fact_orders (order grain) + dim_region_month_target (region-month grain), joined on canonical keys.",
          "Note the measure controversies (revenue net or gross? margin with imputed cost?) as decisions to make and document.",
        ],
        hints: [
          "The repeated column is a dimension in disguise: groupby(month, region) with first/unique validation extracts it.",
          "Join validation: nunique(target) per region-month must be ≤ 1 (after NaN handling) — otherwise the dimension is corrupt.",
          "Measure decisions are governance, not style: whoever owns the definition owns the number.",
        ],
        checkpoint: "The schema plan and the measure-decision list.",
        code: {
          label: "Schema separation",
          language: "python",
          source: `df = pd.read_csv("bi-02-orders-targets.csv", parse_dates=["order_date"])
print("dupes:", df.duplicated("order_id").sum())
tgt_check = df.groupby(["month", "region"])["region_month_target"].nunique(dropna=True)
print("regions-months with >1 target:", (tgt_check > 1).sum())

dim = (df.dropna(subset=["region_month_target"])
       .groupby(["month", "region"])["region_month_target"].first().reset_index())
print(dim.head()); print(len(dim), "target rows")`,
        },
      },
      {
        phase: "quality",
        title: "Audit the export",
        goal: "Encodings, gaps, duplicates — with the measure-policy decisions surfaced.",
        instructions: [
          "Quantify the discount-encoding mix, cost gaps, flag encodings, duplicates.",
          "Make the cost policy decision (impute per-category median, flagged) and the target-coverage decision.",
          "Write the audit table plus the policy register.",
        ],
        hints: [
          "Discount bimodality check: describe() plus a histogram — 0–1 and 0–35 values are two encodings of one fact.",
          "The cost policy affects every margin number downstream: imputation share (5%) and method belong in the measure catalogue, not a footnote.",
          "Target coverage: 2 missing region-months means attainment is unmeasurable there — disclose, don't zero-fill.",
        ],
        checkpoint: "The audit table and the policy register.",
      },
      {
        phase: "cleaning",
        title: "Build the layer",
        goal: "Fact table, target dimension, derived measures, validated join.",
        instructions: [
          "Build both tables; normalise discounts; map flags; deduplicate orders.",
          "Derive fact measures (revenue_net, cost_total with policy, margin); join targets.",
          "Validate: revenue reconciliation, margin under policy, attainment only where targets exist.",
        ],
        hints: [
          "revenue_net = units × unit_price × (1 − discount) — the discount normalisation makes or breaks this.",
          "cost_total = units × (cost if present else category-median cost) with an imputed flag per row.",
          "Validation asserts: fact revenue sum equals raw (post-dedup) recomputation; dimension join adds no rows.",
        ],
        checkpoint: "The metrics layer built and validated.",
        code: {
          label: "Layer build",
          language: "python",
          source: `fact = df.drop_duplicates("order_id").copy()
fact["region"] = fact["region"].str.title()
disc = pd.to_numeric(fact["discount"], errors="coerce")
fact["discount_frac"] = np.where(disc > 1, disc / 100, disc)
fact["revenue_net"] = fact["units"] * fact["unit_price"] * (1 - fact["discount_frac"])

cat_cost = fact.groupby("category")["cost"].transform("median")
fact["cost_eff"] = fact["cost"].fillna(cat_cost)
fact["cost_imputed"] = fact["cost"].isna()
fact["margin"] = fact["revenue_net"] - fact["units"] * fact["cost_eff"]

layer = fact.merge(dim, on=["month", "region"], how="left")
print("revenue:", round(fact["revenue_net"].sum()))
print("imputed cost rows:", fact["cost_imputed"].sum())`,
        },
      },
      {
        phase: "eda",
        title: "The metric set on the clean layer",
        goal: "Attainment, channel economics, the metric-tree drivers.",
        instructions: [
          "Region-month attainment (where targets exist); company attainment trend.",
          "Channel and category: revenue, margin rate, AOV, new-customer share.",
          "Driver decomposition: orders vs AOV contributions to revenue variance.",
        ],
        hints: [
          "Attainment = revenue_net / target, grouped to region-month, then aggregated — never order-level target division.",
          "Margin rate at group level: margin.sum() / revenue.sum() — the rate of sums, not the mean of rates.",
          "Driver decomposition: revenue = orders × AOV; compare contributions of each to YoY change.",
        ],
        checkpoint: "Attainment picture, channel economics, driver decomposition.",
      },
      {
        phase: "statistics",
        title: "Validate the layer",
        goal: "Reconciliation, attainment with coverage, the metric tree's stability.",
        instructions: [
          "Reconcile the layer's measures to raw recomputation (the credibility test).",
          "Attainment analysis with coverage disclosure and the alert region identified.",
          "Confirm the metric tree: which driver explains attainment variance?",
        ],
        hints: [
          "Reconciliation is arithmetic, not statistics — but it's the step that makes the layer trustworthy.",
          "The alert definition: N consecutive region-months below 95% attainment — a rule the dashboard can implement.",
          "If AOV is stable and volume varies, the dashboard leads with order volume — the tree shapes the page design.",
        ],
        checkpoint: "Reconciliation passed, attainment honest, driver identified.",
      },
      {
        phase: "visualisation",
        title: "Spec exhibits and the wireframe",
        goal: "Metric tree, attainment lines, channel bars, mix stacks, dashboard wireframe.",
        instructions: [
          "Build the five exhibits; the metric tree and wireframe are specification artefacts (diagrams, not data charts).",
          "Wireframe: page zones for KPI cards, trend, attainment detail, filters — annotated.",
          "Data charts double as the dashboard's target visuals.",
        ],
        hints: [
          "The metric tree as a simple boxes-and-arrows diagram: revenue → orders × AOV → components.",
          "Wireframe with zone labels and the exact visual per zone ('card: attainment % vs target', 'line: revenue vs target by region').",
          "Filter bar spec: region, channel, month — and which measures respect which filters (filter context!).",
        ],
        checkpoint: "Five exhibits including the tree and wireframe.",
      },
      {
        phase: "interpretation",
        title: "From layer to decisions",
        goal: "What the metrics layer shows and why the definitions matter.",
        instructions: [
          "Answer the five questions; connect each definition decision to a number it changes.",
          "Frame the attainment alert region as the dashboard's first test.",
          "Note the governance point: the catalogue is now the source of truth for 'what revenue means'.",
        ],
        hints: [
          "Definition-to-number connections make governance concrete: 'net-of-discount vs gross changes the attainment figure by X points.'",
          "The alert region is the dashboard's proof of value — a number the old spreadsheets argued about, now unambiguous.",
          "Governance framing: definitions change rarely and deliberately; the catalogue makes that possible.",
        ],
        checkpoint: "Five answered questions with definition impacts named.",
      },
      {
        phase: "recommendations",
        title: "The implementation package",
        goal: "Layer, dashboard, governance, source contracts.",
        instructions: [
          "Recommend the four-part package with owners and sequencing.",
          "Include the DAX-style measure drafts for the BI developer.",
          "Define the acceptance tests (reconciliation, alert rule, filter behaviour).",
        ],
        hints: [
          "DAX drafts in the appendix: Net Revenue = SUMX(fact, units × price × (1 − discount)) — the catalogue translated.",
          "Acceptance tests make the handoff verifiable: reconciliation within rounding, alerts firing on the known region.",
          "Sequencing: layer → dashboard → governance → contracts; each unlocks the next.",
        ],
        checkpoint: "The package with measures, tests and sequencing.",
      },
      {
        phase: "report",
        title: "The metrics-layer report",
        goal: "A specification-grade report the BI team can implement from.",
        instructions: [
          "Follow the outline; the measure catalogue and wireframe are the body's centre.",
          "Every measure: name, formula, grain, filter behaviour, policy notes.",
          "Appendix: DAX drafts, cleaning log, validation results.",
        ],
        hints: [
          "The report's one-liner: 'One fact table, one target dimension, one catalogue of definitions — and the three-versions problem is over.'",
          "Spec-grade means implementable without asking questions: every visual named, every measure formulable, every filter defined.",
          "Reproducibility: the validation script IS the acceptance test.",
        ],
        checkpoint: "The complete report, implementable and reproducible.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the analytics lead. Design the metrics layer: the schema separation, the measure catalogue with its contested decisions, the validated metric set, and the dashboard specification. Definition decisions, cost policy and alert rules are yours — documented as governance.",
      deliverables: [
        "Fact and dimension construction with join validation",
        "Measure catalogue: formulas, grain, filter context, policies",
        "Validated metric set with reconciliation results",
        "Metric tree and driver analysis",
        "Dashboard specification with wireframe, filters and DAX-style measure drafts",
      ],
      guardrails: [
        "Discount encoding normalised and verified before revenue math",
        "Cost-imputation policy in the catalogue, share disclosed",
        "Attainment computed at region-month grain with coverage disclosure",
        "Every measure reconciles to raw recomputation",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Target dimension deduplicated; join validated (no fan-out)",
        "Discount normalisation verified (bimodality resolved)",
        "Attainment at region-month grain, not order level",
      ],
      "code-quality": [
        "Fact/dimension separation explicit",
        "Measure derivations written once, named clearly",
      ],
      reasoning: [
        "Definition decisions connected to their numeric impacts",
        "Driver decomposition identifies volume vs price story",
      ],
      visualization: [
        "Metric tree diagram present and coherent",
        "Wireframe annotates zones, visuals and filters",
      ],
      interpretation: [
        "The alert region identified as the dashboard's first test",
        "Governance framing for the catalogue",
      ],
      recommendations: [
        "DAX-style drafts included for handoff",
        "Acceptance tests defined (reconciliation, alerts, filters)",
      ],
    },
  },

  /* ================================================================ BIQ-03 */
  {
    id: "bi-3",
    categoryId: "bi",
    difficulty: "advanced",
    code: "BIQ-03",
    title: "Growth Accounting & Unit Economics",
    subtitle: "Twenty cohorts, five channels: decompose the growth, price the payback, and stress the model.",
    summary:
      "Unit-economics modelling: build the cohort-channel panel, run growth accounting (new/expanding/churned), model LTV:CAC and payback by channel-cohort, and deliver the growth-efficiency brief with its assumptions stress-tested.",
    hours: 16,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Growth accounting", "Cohort panel construction", "LTV:CAC modelling", "Payback analysis", "Sensitivity-stress-tested recommendations"],

    businessBackground:
      "Meridian's board is asking the growth-efficiency question: the company doubled revenue while marketing spend tripled, and nobody can say whether growth is efficient or rented. The CFO wants the growth accounting (how much growth is new customers vs expansion vs retention) and the unit economics (LTV:CAC and payback by channel and cohort) before the next budget round. The data exists — cohort-level monthly panels with channel attribution and spend — but the analysis is genuinely hard: growth must be decomposed, LTV modelled with explicit assumptions, and every number the board will challenge needs its sensitivity attached.",
    problemStatement:
      "Decompose growth and price its efficiency: build the cohort-channel-month panel; run growth accounting (new, expansion, returning, churned revenue); model contribution and LTV:CAC by channel-cohort with payback periods; stress the assumptions; and deliver the growth-efficiency brief with budget implications and their sensitivities.",
    businessObjectives: [
      "Construct the cohort × channel × month panel from the messy cohort export (deduplicating repeated CAC)",
      "Run growth accounting: decompose period revenue change into new/expansion/returning/churned components",
      "Model unit economics: contribution per cohort, CAC, LTV:CAC and payback by channel",
      "Stress-test the LTV assumptions (retention decay, margin) and present sensitivity ranges",
      "Deliver the growth-efficiency brief with budget reallocation implications",
    ],
    datasetDescription:
      "A cohort-month-channel panel (~770 rows): for each acquisition cohort and calendar month, active customers, orders, revenue, marketing spend (acquisition-month only, repeated across channels — the deduplication trap), CAC (repeated likewise), and gross margin. The panel carries real modelling challenges: cohort labels occasionally exceed the calendar month (impossible), revenue has zero-blocks, CAC is missing for early cohorts, margins include impossible values, and duplicates exist. Growth accounting and unit economics inherit every decision — this is the BI capstone.",
    dataDictionary: [
      { column: "month", kind: "categorical", description: "Calendar month", example: "2025-04" },
      { column: "cohort_month", kind: "categorical", description: "Acquisition cohort month (can exceed calendar month in error)", example: "2024-11" },
      { column: "channel", kind: "categorical", description: "Acquisition channel (5 values)", example: "Paid Search" },
      { column: "customers_active", kind: "integer", description: "Active customers (cohort-channel-month)", example: "184" },
      { column: "orders", kind: "integer", description: "Orders in period", example: "212" },
      { column: "revenue", kind: "currency", description: "Revenue in period (zero blocks exist)", example: "3984.20" },
      { column: "marketing_spend", kind: "currency", description: "Acquisition spend (only in acquisition month; repeated across channels)", example: "26000" },
      { column: "cac_usd", kind: "currency", description: "CAC (repeated per cohort-channel; some missing)", example: "96.40" },
      { column: "gross_margin_pct", kind: "percent", description: "Gross margin (impossible values exist)", example: "0.54" },
    ],
    initialQuestions: [
      "How does revenue growth decompose — new-cohort, expansion, returning, churned?",
      "What are the retention curves by channel, and how do they differ?",
      "What are LTV, CAC and payback by channel-cohort, under explicit assumptions?",
      "How sensitive are the LTV:CAC conclusions to retention and margin assumptions?",
      "What budget reallocation does the evidence support, and what would falsify it?",
    ],
    dataset: {
      name: "Meridian cohort-channel panel",
      filename: "bi-03-growth-cohorts.csv",
      description: "20 cohorts × months × channels with spend, CAC and margin — the unit-economics panel.",
      rows: 770,
    },

    dataQuality: [
      { issue: "Impossible cohort labels", where: "cohort_month > month", detection: "compare month columns", treatment: "Logical violations: exclude (counted) — a cohort cannot generate revenue before it exists." },
      { issue: "Repeated spend/CAC across rows", where: "marketing_spend and cac_usd repeated per cohort-channel", detection: "groupby(cohort, channel) nunique on spend", treatment: "Deduplicate to a cohort-channel cost table; the panel keeps behaviour, the cost table keeps money — the LTV:CAC join depends on this separation." },
      { issue: "Missing CAC (early cohorts)", where: "cac_usd — missing on parts of the first 3 cohorts", detection: "isna() by cohort", treatment: "Impute from the channel's early-cohort median (documented) or exclude those cohorts from CAC analysis — state the choice and its coverage." },
      { issue: "Impossible margins", where: "gross_margin_pct > 1 (or < 0)", detection: "range check", treatment: "Exclude from margin analysis (counted); likely decimal-shift errors." },
      { issue: "Revenue zero-blocks", where: "age-0 revenue = 0 on scattered cohort-channels", detection: "zero patterns by cohort-channel", treatment: "Investigate: a genuine zero at acquisition month breaks CAC math — exclude these cohort-channels from unit economics (counted, disclosed)." },
      { issue: "Duplicate panel rows", where: "~14 duplicated rows", detection: "duplicated(['month','cohort_month','channel']).sum()", treatment: "Drop — the panel key's uniqueness is the analysis's foundation." },
    ],
    cleaningPlan: [
      { action: "Enforce the (month, cohort, channel) panel key; exclude impossible cohort labels", rationale: "Panel integrity and logical validity." },
      { action: "Separate the behaviour panel from the cohort-channel cost table (deduplicated spend/CAC)", rationale: "The unit-economics join needs cost at its own grain — repeated money columns are the trap." },
      { action: "Resolve the CAC-coverage and margin-impossible policies", rationale: "Documented choices with coverage disclosure." },
      { action: "Derive age (month − cohort) and the retention/contribution series per cohort-channel", rationale: "The analysis frame for curves, LTV and payback." },
    ],
    edaPlan: [
      { question: "Retention by channel", method: "active customers by cohort age, per channel", expectation: "Classic decay; Referral and Email flatter; Social steepest." },
      { question: "Revenue per customer by age", method: "revenue / active by age, per channel", expectation: "Rising slightly with age (maturing customers buy more).",
      },
      { question: "Growth accounting preview", method: "period revenue vs prior by component", expectation: "Growth increasingly expansion-driven as the base grows." },
      { question: "CAC by cohort and channel", method: "cost table: CAC over cohorts by channel", expectation: "Paid Search CAC rising across cohorts — the efficiency question in one line." },
      { question: "Margin stability", method: "margin distribution by channel over time", expectation: "Stable within channel after excluding impossibles." },
    ],
    statisticsPlan: [
      { technique: "Growth accounting (new/expansion/returning/churned decomposition)", purpose: "Decompose the growth story honestly", expectation: "~45% of recent growth from new cohorts, ~35% expansion, churn drag material." },
      { technique: "Retention-curve fitting and 12-month LTV projection (with explicit decay assumptions)", purpose: "LTV per channel-cohort under stated assumptions", expectation: "Referral LTV ~2× Social; all channels' LTV dominated by months 1–6." },
      { technique: "LTV:CAC and payback by channel-cohort", purpose: "The efficiency metric with its recovery time", expectation: "Referral/Email above 3:1 with sub-12-month payback; Paid Search ~1.5–2:1 with 16–20-month payback." },
      { technique: "Sensitivity analysis (retention ±20%, margin ±5pts)", purpose: "Stress the conclusions before the board does", expectation: "Rankings stable; absolute LTV:CAC moves materially — ranges, not points, are the deliverable." },
      { technique: "Budget reallocation scenario", purpose: "Translate unit economics into budget math", expectation: "Shifting 15% of Paid Search to Referral/Email improves blended LTV:CAC ~20%." },
    ],
    visualisationPlan: [
      { chart: "Stacked bar/waterfall — growth accounting by quarter (new/expansion/returning/churned)", answers: "Where does growth come from?", reads: "Component stacks with net growth line; churn drag visible." },
      { chart: "Line — retention curves by channel (cohort age vs active %)", answers: "Who sticks?", reads: "Curve separation at ages 3–6; the channel ranking." },
      { chart: "Bar — LTV:CAC by channel with the 3:1 reference and sensitivity whiskers", answers: "Is growth efficient?", reads: "Bars vs the reference; whiskers show the assumption stress." },
      { chart: "Line — cumulative contribution vs CAC by channel (payback crossing)", answers: "When does a channel pay back?", reads: "The CAC line crossed by contribution curves; payback months marked." },
      { chart: "Heatmap — LTV:CAC by cohort × channel", answers: "Is efficiency improving or decaying?", reads: "Cohort rows darkening or lightening = the efficiency trend." },
    ],
    findings: [
      "Growth is real but its composition is shifting: new-cohort revenue contributes ~45% of recent growth (down from ~60% a year ago) while expansion in existing cohorts contributes ~35% — the business is maturing from acquisition-led to base-led.",
      "Retention separates the channels: Referral and Email cohorts retain at roughly twice Social's rate by month 6, and revenue per surviving customer rises with age — retention quality compounds through both survival and spend.",
      "Unit economics split the portfolio: Referral and Email clear 3:1 LTV:CAC with sub-12-month payback; Paid Search — the largest budget line — runs ~1.7:1 with payback near 18 months, effectively renting growth at the current CAC trajectory.",
      "CAC is rising within Paid Search across cohorts (the auction-pressure signature), meaning its LTV:CAC is not merely mediocre but deteriorating — the budget question is about trajectory, not just level.",
      "Sensitivity keeps the rankings but not the comfort: under retention and margin stress, Paid Search's LTV:CAC approaches 1:1 while Referral stays above 2.5:1 — the reallocation conclusion is robust, its margin of safety is not unlimited.",
    ],
    recommendations: [
      { what: "Reallocate ~15% of Paid Search budget to Referral and Email capacity (programme and lifecycle investment) under a measured ramp", why: "The efficiency gap is wide, robust to sensitivity, and Paid Search's CAC trajectory makes standing still the expensive option.", impact: "Blended LTV:CAC improves ~20% at similar growth", horizon: "this quarter" },
      { what: "Cap Paid Search spend at an efficiency floor (e.g., pause scale-up if cohort CAC exceeds a threshold) with monthly review", why: "A CAC ceiling converts a deteriorating auction into a bounded bet.", impact: "Stops the quiet erosion", horizon: "immediate" },
      { what: "Invest in expansion motions (the base-led growth the accounting reveals): cross-sell and lifecycle programmes", why: "35% of growth is already expansion; the accounting says that share is rising.", impact: "Growth efficiency compounding", horizon: "longer term" },
      { what: "Stand up quarterly growth accounting and LTV:CAC reporting with the sensitivity bands as the standing format", why: "The board asked the efficiency question once; the standing report keeps it answered.", impact: "Governance of growth efficiency", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Meridian's growth is real and increasingly rented. Growth accounting shows the mix shifting from acquisition-led (~60% new a year ago) toward base-led (~35% expansion now), while unit economics split the channel portfolio: Referral and Email clear 3:1 LTV:CAC with sub-year payback, and Paid Search — the largest line — runs ~1.7:1 with 18-month payback and a rising CAC trajectory. Sensitivity testing keeps the ranking stable under retention and margin stress but narrows Paid Search's margin of safety toward 1:1. The recommendation: move ~15% of search spend to Referral and Email capacity under a measured ramp, cap search spend at an efficiency floor, invest in the expansion motions the accounting reveals, and stand up quarterly growth-efficiency reporting with sensitivity bands. The growth question the board asked once becomes a standing answer.",
      structure: [
        "1. The board's question and the analysis architecture",
        "2. Panel and cost-table construction (the deduplication story)",
        "3. Growth accounting: new, expansion, returning, churned",
        "4. Retention and revenue-per-customer by channel",
        "5. Unit economics: LTV, CAC, LTV:CAC, payback",
        "6. Sensitivity: what the assumptions do to the conclusions",
        "7. The budget reallocation and its falsifiers",
        "8. Appendix: model assumptions, cleaning log, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Architect the analysis",
        goal: "Behaviour panel + cost table + the two analyses they feed.",
        instructions: [
          "Map the grains: (month, cohort, channel) behaviour panel; (cohort, channel) cost table — spend and CAC live there, deduplicated.",
          "Identify the logical constraint: cohort_month ≤ month, always.",
          "Frame the two analyses: growth accounting (panel-wide, period over period) and unit economics (per cohort-channel).",
        ],
        hints: [
          "The repeated-money trap: spend appears on the acquisition month's rows for a cohort-channel — summing it across months or channels double-counts. The cost table exists to prevent exactly this.",
          "Age = months since cohort start — the retention and payback x-axis, derived once.",
          "Growth accounting definitions: new = first-month cohort revenue; expansion = existing-cohort growth; churned = the revenue lost from previously-active cohorts.",
        ],
        checkpoint: "The architecture map with grains and the logical constraint.",
        code: {
          label: "Grain architecture",
          language: "python",
          source: `df = pd.read_csv("bi-03-growth-cohorts.csv")
print("dupes:", df.duplicated(["month", "cohort_month", "channel"]).sum())
impossible = df[df["cohort_month"] > df["month"]]
print("impossible cohort labels:", len(impossible))

cost = (df[df["marketing_spend"] > 0]
        .groupby(["cohort_month", "channel"])
        .agg(spend=("marketing_spend", "first"), cac=("cac_usd", "first"))
        .reset_index())
print(len(cost), "cohort-channel cost rows")`,
        },
      },
      {
        phase: "quality",
        title: "Audit the panel",
        goal: "Six defect families, with the deduplication and CAC-coverage decisions prominent.",
        instructions: [
          "Quantify everything; separate the cost-table defects (repeated money, missing CAC) from panel defects (impossible labels, zero blocks, margin impossibles).",
          "Decide the CAC-coverage policy and the zero-block exclusion.",
          "Write the audit and the policy register.",
        ],
        hints: [
          "Zero revenue at age-0 breaks CAC math (division by nothing): those cohort-channels exit unit economics, counted and disclosed.",
          "Impossible margins: likely decimal shifts (54 vs 0.54) — check before excluding; a repair rule is defensible if the pattern is clean.",
          "The audit's headline number: how much of the panel is valid for unit economics after all policies — the coverage statement.",
        ],
        checkpoint: "The audit table with policies and coverage.",
      },
      {
        phase: "cleaning",
        title: "Build the panel and cost table",
        goal: "Valid behaviour panel, deduplicated cost table, derived age and contribution.",
        instructions: [
          "Apply policies; build both tables; derive age and contribution (revenue × margin).",
          "Validate: no impossible labels; cost table unique on (cohort, channel); coverage stated.",
          "Join the cost table for the unit-economics frame.",
        ],
        hints: [
          "contribution = revenue × gross_margin_pct (valid margins only) — the LTV building block.",
          "The join is cohort-channel → panel; validate it adds columns, not rows.",
          "Age in months from period arithmetic (year×12+month), not date subtraction.",
        ],
        checkpoint: "The validated panel and cost tables joined.",
        code: {
          label: "Panel and cost table",
          language: "python",
          source: `panel = df.drop_duplicates(["month", "cohort_month", "channel"]).copy()
panel = panel[panel["cohort_month"] <= panel["month"]]
panel = panel[(panel["gross_margin_pct"] > 0) & (panel["gross_margin_pct"] < 1)]

to_m = lambda s: s.str[:4].astype(int) * 12 + s.str[5:7].astype(int)
panel["age"] = to_m(panel["month"]) - to_m(panel["cohort_month"])
panel["contribution"] = panel["revenue"] * panel["gross_margin_pct"]
print(panel.groupby("age")["customers_active"].sum())`,
        },
      },
      {
        phase: "eda",
        title: "Retention and growth composition",
        goal: "Retention curves by channel; the growth-accounting preview.",
        instructions: [
          "Retention: active customers by age, normalised to age-0, per channel.",
          "Revenue per active customer by age and channel.",
          "Growth accounting preview: quarterly revenue change split into new-cohort vs existing-cohort components.",
        ],
        hints: [
          "Retention normalisation: divide each cohort-channel's age-series by its age-0 actives — then average curves by channel.",
          "Revenue per customer rising with age is the quiet LTV driver — surface it early.",
          "Growth accounting needs period totals: new = first-appearance cohort revenue; expansion/contraction = existing cohorts' period-over-period change.",
        ],
        checkpoint: "Retention curves, revenue-per-customer, growth composition preview.",
      },
      {
        phase: "statistics",
        title: "Growth accounting and unit economics",
        goal: "Full decomposition; LTV:CAC and payback; sensitivity.",
        instructions: [
          "Formal growth accounting: new + expansion + returning − churned = Δrevenue, reconciled.",
          "LTV: cumulative contribution projected to 12 months (retention-curve extrapolation, assumptions stated); LTV:CAC and payback per channel.",
          "Sensitivity: retention ±20%, margin ±5pts; report ranges per channel.",
        ],
        hints: [
          "Reconciliation is the accounting's credibility: the components must sum to the total change — assert it.",
          "Payback: the age at which cumulative contribution ≥ CAC (interpolated); a channel without crossing in 24 months is a structural problem.",
          "Sensitivity as ranges on the SAME chart (whiskers) — the board sees the conclusion and its stability in one look.",
        ],
        checkpoint: "Reconciled accounting, unit-economics table, sensitivity ranges.",
        code: {
          label: "Unit economics",
          language: "python",
          source: `ue = panel.merge(cost, on=["cohort_month", "channel"], how="inner")
ue = ue[ue["cac"].notna()]

cum = ue.groupby(["cohort_month", "channel", "age"])["contribution"].sum() \\
        .groupby(["cohort_month", "channel"]).cumsum().reset_index()
curves = cum.groupby(["channel", "age"])["contribution"].mean().reset_index()
base = curves.groupby("channel")["contribution"].first()
ltv12 = curves[curves["age"] <= 12].groupby("channel")["contribution"].max()
cac_by_ch = ue.groupby("channel")["cac"].mean()
out = pd.DataFrame({"ltv12": ltv12, "cac": cac_by_ch})
out["ltv_cac"] = out["ltv12"] / out["cac"]
print(out.round(2))`,
        },
      },
      {
        phase: "visualisation",
        title: "The growth-efficiency exhibits",
        goal: "Five charts: accounting waterfall, retention curves, LTV:CAC bars with whiskers, payback crossings, cohort heatmap.",
        instructions: [
          "Build the five; the waterfall and LTV:CAC chart carry the board argument.",
          "Sensitivity whiskers on the LTV:CAC chart; the 3:1 reference line.",
          "Payback crossings: cumulative contribution vs CAC by channel with crossing months marked.",
        ],
        hints: [
          "Waterfall by quarter: new (up), expansion (up), churned (down), landing on net growth — the one-glance growth story.",
          "The heatmap (cohort × channel LTV:CAC) shows the deterioration trend that the averages hide.",
          "Payback chart: horizontal CAC line with cumulative contribution curves crossing it — the recovery-time argument made visual.",
        ],
        checkpoint: "Five exhibits, waterfall and LTV:CAC charts polished.",
      },
      {
        phase: "interpretation",
        title: "Answer the board precisely",
        goal: "Efficient or rented — with decomposition, ranges and trajectory.",
        instructions: [
          "Answer the five questions with the decomposition and the ranges attached.",
          "Distinguish level conclusions (LTV:CAC today) from trajectory conclusions (CAC rising, efficiency decaying).",
          "State the falsifiers: what future data would change the reallocation recommendation.",
        ],
        hints: [
          "The board's question deserves a one-word verdict with numbers: 'Both — efficient in Referral/Email, rented in Paid Search, and the rented share is the biggest budget line.'",
          "Trajectory language: 'not merely below bar, but deteriorating' — the CAC trend is what converts a level finding into a budget action.",
          "Falsifiers make the recommendation scientific: 'if search CAC stabilises and retention improves next quarter, the realisation case weakens.'",
        ],
        checkpoint: "Five answered questions with verdict, ranges, trajectory and falsifiers.",
      },
      {
        phase: "recommendations",
        title: "The growth-efficiency brief",
        goal: "Reallocation with ramp, caps, expansion investment and standing reporting.",
        instructions: [
          "Recommend the four-part package with expected effects and their sensitivity bands.",
          "The ramp design: measured reallocation with review gates, not a cliff.",
          "Define the standing report format (quarterly accounting + LTV:CAC with bands).",
        ],
        hints: [
          "Ramp design: 15% over two quarters with a mid-point review — reversibility is the governance feature.",
          "The efficiency floor (CAC cap) needs its threshold from the data: the CAC level at which LTV:CAC hits ~1.5.",
          "The standing report is the brief's institutional legacy — specify it like the dashboard spec in BIQ-02.",
        ],
        checkpoint: "The brief with ramp, caps, expansions and standing format.",
      },
      {
        phase: "report",
        title: "The growth-efficiency report",
        goal: "A board-grade report: decomposed growth, priced efficiency, stress-tested conclusions.",
        instructions: [
          "Follow the outline; open with the verdict (efficient where, rented where, trajectory).",
          "Assumptions table in the body; the sensitivity chart beside the conclusions it supports.",
          "Appendix: model arithmetic, cleaning log, the full policy register.",
        ],
        hints: [
          "The one-liner: 'Growth is real, half of it is rented, and the rent is rising — here is the measured exit.'",
          "Boards trust reports that stress their own conclusions: lead the sensitivity section with what WOULD change the recommendation.",
          "Reproducibility: one script from raw panel to every exhibit and the reallocation arithmetic.",
        ],
        checkpoint: "The complete report, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the CFO's growth analyst. Decompose the growth and price its efficiency: growth accounting, channel unit economics, LTV:CAC with payback, and sensitivity-stressed budget recommendations. Retention-decay assumptions, cost-table policies and sensitivity design are yours — documented for board scrutiny.",
      deliverables: [
        "Panel and cost-table construction (deduplication validated)",
        "Growth accounting reconciled (new/expansion/returning/churned)",
        "Retention and revenue-per-customer curves by channel",
        "Unit economics: LTV (12-month, assumptions stated), CAC, LTV:CAC, payback",
        "Growth-efficiency brief: reallocation with ramp, caps, falsifiers and standing report format",
      ],
      guardrails: [
        "Cost table deduplicated at (cohort, channel) grain before any CAC math",
        "Growth accounting reconciles to total revenue change",
        "LTV assumptions tabulated; sensitivity bands on every headline conclusion",
        "Zero-block and impossible-label exclusions counted and disclosed",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Cost table deduplicated; CAC computed at cohort-channel grain",
        "Growth accounting components sum to total revenue change (reconciled)",
        "Payback measured against cumulative contribution, not revenue",
      ],
      "code-quality": [
        "Panel and cost tables separated at their grains",
        "Age arithmetic consistent; policy register maintained",
      ],
      reasoning: [
        "Level vs trajectory conclusions distinguished (CAC trend)",
        "Sensitivity results integrated into the recommendation language",
      ],
      visualization: [
        "Waterfall reconciles visually to net growth",
        "LTV:CAC chart shows sensitivity whiskers and the reference line",
      ],
      interpretation: [
        "Growth composition shift (acquisition → expansion led) articulated",
        "The rented-growth verdict supported by payback and trajectory",
      ],
      recommendations: [
        "Reallocation ramped with review gates",
        "Falsifiers and standing report format defined",
      ],
    },
  },
];
