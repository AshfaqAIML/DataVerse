/**
 * Public-dataset analytics projects — PUB-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const PUBLIC_PROJECTS: DapProject[] = [
  /* ================================================================ PUB-01 */
  {
    id: "public-1",
    categoryId: "public",
    difficulty: "beginner",
    code: "PUB-01",
    title: "City Budget Open-Spending Explainer",
    subtitle: "Three years of municipal spending: what the city spends, on what, and how it changed.",
    summary:
      "Open-data analysis: clean a city budget ledger, profile spending by department and category, compare budget to actual, and write the explainer a journalist would publish.",
    hours: 4,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Open-data cleaning", "Public-spending analysis", "Variance basics", "Explanatory charts", "Plain-language writing"],

    businessBackground:
      "The Rivermouth Gazette's new data desk wants to move from FOIA requests to the city's open-spending portal — but the raw ledger is intimidating: thousands of lines, inconsistent labels, formatted numbers, and no context. The editor wants a repeatable annual explainer: what the city spends by department and category, how actual spending compares to budget, what changed year over year, and which stories hide in the variance — written so a general reader understands it.",
    problemStatement:
      "Produce the city spending explainer from the open ledger: spending by department, category and programme; budget-vs-actual variances; year-over-year changes; and per-capita context — with every number reproducible from the published data and the writing aimed at a general reader.",
    businessObjectives: [
      "Profile three fiscal years of spending by department and category",
      "Compute budget-vs-actual variances and identify the biggest deviations",
      "Analyse year-over-year changes: what grew, what shrank, what's structural",
      "Add per-capita context using the city's published population",
      "Deliver the explainer with reproducible methods and clear charts",
    ],
    datasetDescription:
      "~3,000 ledger lines across three fiscal years: each row a spending line with department, division, programme, category, amount, budget amount and a capital flag. Fiscal-year labels come in two formats (2024 vs FY2024), amounts are partly comma-formatted strings, budget has gaps, department names have casing variants, and duplicates exist. The open-data texture: nothing is fatal, everything needs documenting.",
    dataDictionary: [
      { column: "line_id", kind: "id", description: "Ledger line identifier", example: "50482" },
      { column: "fiscal_year", kind: "categorical", description: "Fiscal year (two label formats)", example: "FY2024" },
      { column: "department", kind: "categorical", description: "City department (casing variants)", example: "Parks & Recreation" },
      { column: "division", kind: "text", description: "Division within department", example: "Parks Division 3" },
      { column: "program", kind: "categorical", description: "Programme label", example: "Capital Programme" },
      { column: "spend_category", kind: "categorical", description: "Spending category (casing variants)", example: "Personnel" },
      { column: "amount", kind: "currency", description: "Actual spend (format mix)", example: "185,320.50" },
      { column: "budget_amount", kind: "currency", description: "Budgeted amount (some missing)", example: "200,000.00" },
      { column: "vendor_count", kind: "integer", description: "Distinct vendors paid on the line", example: "7" },
      { column: "is_capital", kind: "boolean", description: "Capital expenditure flag", example: "0" },
    ],
    initialQuestions: [
      "How does total spending break down by department and category, and how concentrated is it?",
      "Which departments ran over or under budget, by how much, in which years?",
      "What changed year over year — which programmes grew or shrank most?",
      "How does capital vs operating spending split, and is it shifting?",
      "What is the per-capita picture, and which two or three stories does the data support?",
    ],
    dataset: {
      name: "Rivermouth open spending ledger",
      filename: "public-01-city-spending.csv",
      description: "3 fiscal years of city spending lines from the open-data portal.",
      rows: 3000,
    },

    dataQuality: [
      { issue: "Fiscal-year label formats", where: "fiscal_year — '2024' vs 'FY2024'", detection: "value_counts()", treatment: "Normalise to integer years; document the portal's convention." },
      { issue: "Formatted amounts", where: "amount — comma strings (~10%)", detection: "dtype object; contains(',')", treatment: "Strip and numericise with zero-loss verification." },
      { issue: "Missing budget amounts", where: "budget_amount — ~4%", detection: "isna().sum() by year", treatment: "Exclude those lines from variance analysis (keep in spending totals); report the coverage by department." },
      { issue: "Department and category casing", where: "labels vary in case", detection: "value_counts()", treatment: "Canonicalise — label variants split groupings." },
      { issue: "Duplicate lines", where: "~0.8% duplicated rows", detection: "duplicated('line_id').sum()", treatment: "Drop; duplicates double-count public money, which is the one thing an explainer cannot do." },
      { issue: "Negative amounts", where: "amount < 0 (corrections/rebates)", detection: "(df['amount'] < 0).sum()", treatment: "Keep and flag: they net against spending legitimately but deserve a footnote." },
    ],
    cleaningPlan: [
      { action: "Normalise years; canonicalise labels; numericise amounts with verification", rationale: "Every published figure rests on these three conversions." },
      { action: "Separate variance-eligible lines (with budget) from total-spend lines", rationale: "Two analyses, two populations, both documented." },
      { action: "Derive per-capita metrics with a stated population source", rationale: "Context numbers need their denominator published too." },
      { action: "Flag negative and capital lines for narrative treatment", rationale: "Corrections and capital shifts are story material, not defects." },
    ],
    edaPlan: [
      { question: "Spending by department", method: "total by department, sorted, share of total", expectation: "Police, Fire and Transport dominate; the classic municipal pyramid." },
      { question: "Category mix", method: "spend by category; capital vs operating", expectation: "Personnel ~60% of operating; capital share stable or rising." },
      { question: "Variance table", method: "budget vs actual by department-year", expectation: "A few departments with recurring overruns — the story candidates." },
      { question: "Year-over-year change", method: "spend change by department and programme", expectation: "One or two visible programmes driving most of the growth." },
      { question: "Vendor concentration", method: "lines by vendor_count; departments with single-vendor patterns", expectation: "A few high-value, low-vendor lines — procurement questions." },
    ],
    statisticsPlan: [
      { technique: "Concentration analysis (top-N shares, HHI optional)", purpose: "How concentrated is the budget?", expectation: "Top 3 departments ≈ half of spending." },
      { technique: "Variance with materiality screening", purpose: "Find the real deviations, not the noise", expectation: "5–8 department-years beyond ±10% — the story list." },
      { technique: "Growth decomposition", purpose: "Attribute YoY change to programmes", expectation: "One programme explaining the majority of a department's growth." },
    ],
    visualisationPlan: [
      { chart: "Treemap or sorted bar — spending by department", answers: "Where does the money go?", reads: "Share sizes at a glance; top three labelled with percentages." },
      { chart: "Diverging bar — budget variance by department (latest year)", answers: "Who is off plan?", reads: "Over/under in opposite directions, material ones labelled." },
      { chart: "Slope/line — department spending across three years", answers: "What is structural vs one-off?", reads: "Parallel slopes = structural; kinks = events." },
      { chart: "Stacked bar — operating vs capital by year", answers: "Is the mix shifting?", reads: "Band widths by year with the capital share labelled." },
      { chart: "Bar — per-capita spending by department", answers: "What does each resident pay for what?", reads: "Dollars per resident, sorted, with the city total annotated." },
    ],
    findings: [
      "Three departments — Police, Fire and Transport — account for roughly half of all spending, and the ordering has been stable across all three years.",
      "A small set of department-years carries the variance story: two departments show recurring overruns (10–18% above budget) while several others run consistently under, usually unfilled positions.",
      "Year-over-year growth concentrates in specific programmes rather than across-the-board inflation: one transport programme explains the majority of the total increase in the latest year.",
      "Capital spending's share is rising modestly, driven by a handful of large lines with few vendors — the procurement-questions section of the explainer.",
      "Per capita, the city spends roughly $2,800 per resident across all functions, with public safety alone near $1,100 — the explainer's anchor numbers.",
    ],
    recommendations: [
      { what: "Publish the explainer with the methods box and per-capita anchors", why: "The annual piece needs its reproducibility stated for credibility with both readers and the city.", impact: "The data desk's recurring franchise piece", horizon: "immediate" },
      { what: "FOIA or request detail on the two recurring-overrun departments", why: "Recurring double-digit variances are a follow-up story the ledger itself cannot finish.", impact: "Investigative follow-up with a running start", horizon: "this quarter" },
      { what: "Track the large single-vendor capital lines annually", why: "Concentrated procurement on big lines is the open-questions section that writes itself each year.", impact: "Standing accountability feature", horizon: "longer term" },
      { what: "Request budget-fill (position-level) data to explain the under-spending", why: "Under-budget departments are usually vacancies, not savings — the explainer shouldn't imply efficiency without evidence.", impact: "Narrative accuracy", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Rivermouth spends about $2,800 per resident each year, half of it through three departments, and the story of the latest year is concentration: a single transport programme drives most of the growth, two departments carry recurring double-digit overruns, and capital spending is drifting upward on a handful of large, low-vendor lines. Under-budget departments run consistently below plan — a pattern the data desk should frame as vacancies rather than efficiency until position-level data says otherwise. Every figure here is reproducible from the portal's own ledger (parsing rules in the methods box), which is what makes this an explainer rather than an opinion.",
      structure: [
        "1. What this explainer covers and where the data comes from",
        "2. Methods box: parsing, exclusions, per-capita basis",
        "3. Where the money goes: departments and categories",
        "4. Off-plan: budget variances that matter",
        "5. What changed: year-over-year decomposition",
        "6. Capital vs operating, and the vendor questions",
        "7. Per-capita anchors and the three stories worth following",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the open ledger",
        goal: "Load, profile, and catalogue the portal's quirks.",
        instructions: [
          "Profile; note the two fiscal-year formats and the formatted-amount share.",
          "Confirm the grain: one row = one ledger line (line_id unique after dedup).",
          "Note the explainer's audience: general readers — every metric needs plain-language translation.",
        ],
        hints: [
          "Open data's texture: nothing is broken, everything is inconsistent — the methods box documents each normalisation.",
          "The two fiscal-year formats will silently split a year's data in two if not normalised first — value_counts() catches it in one line.",
          "Plain-language discipline starts now: 'spend per resident', not 'aggregate expenditure normalised by population'.",
        ],
        checkpoint: "Quirks catalogued, grain confirmed, audience framing written.",
        code: {
          label: "Profile the ledger",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("public-01-city-spending.csv")
print(df.shape)
print(df["fiscal_year"].value_counts())
print("formatted amounts:", df["amount"].astype(str).str.contains(",").sum())
print("missing budget:", df["budget_amount"].isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the portal export",
        goal: "Six defect families with public-accountability treatments.",
        instructions: [
          "Quantify each defect; decide treatment per defect.",
          "Pay special attention to negatives (corrections) and missing budgets (variance coverage).",
          "Write the methods-box draft as you go.",
        ],
        hints: [
          "In public-spending data, exclusions are editorial decisions: a dropped line is invisible money — count everything, disclose everything.",
          "Negative amounts: netting is legitimate, but a footnote keeps the explainer honest when a reader sums the raw file.",
          "Budget coverage by department: an 80%-covered department's variance is an estimate — the methods box says so.",
        ],
        checkpoint: "The audit table and the methods-box draft.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Canonical frame with numeric money, normalised years, derived context.",
        instructions: [
          "Apply treatments; normalise years; derive the variance frame (budget present).",
          "Compute per-capita metrics with the stated population (a published constant, sourced).",
          "Verify: totals per year; no parse losses.",
        ],
        hints: [
          "The population denominator is an editorial constant: cite the census figure and the year in the methods box.",
          "Variance frame coverage: report spend covered by budget by department — the honesty metric for the variance story.",
          "Year totals sanity-check the parse: three years of plausible municipal totals, not one 10× outlier year.",
        ],
        checkpoint: "Clean frame, variance frame, per-capita basis documented.",
        code: {
          label: "Canonical frame",
          language: "python",
          source: `clean = df.drop_duplicates("line_id").copy()
clean["year"] = clean["fiscal_year"].astype(str).str.extract(r"(\\d{4})").astype(int)
clean["amount"] = pd.to_numeric(clean["amount"].astype(str).str.replace(",", "", regex=False))
clean["department"] = clean["department"].str.title()
clean["spend_category"] = clean["spend_category"].str.title()

var = clean.dropna(subset=["budget_amount"]).copy()
var["variance"] = var["amount"] - var["budget_amount"]
print(clean.groupby("year")["amount"].sum().round(0))
print("variance coverage:",
      var["amount"].sum() / clean["amount"].sum())`,
        },
      },
      {
        phase: "eda",
        title: "The spending picture",
        goal: "Department totals, variances, YoY changes, capital mix.",
        instructions: [
          "Department totals with shares; category mix; capital vs operating by year.",
          "Variance by department-year with a materiality screen (±10%).",
          "YoY decomposition: which programmes drive the biggest changes.",
        ],
        hints: [
          "The materiality screen turns hundreds of lines into a 6-row story table.",
          "YoY decomposition: department×programme totals, diff between years, sort — the top few programmes ARE the growth story.",
          "Per-capita translations belong beside every big number — the anchor habit of good explainers.",
        ],
        checkpoint: "The department table, the variance shortlist, the growth decomposition.",
      },
      {
        phase: "statistics",
        title: "Concentration and materiality",
        goal: "Top-N shares, screened variances, growth attribution.",
        instructions: [
          "Compute the top-3 department share and its stability.",
          "Screen variances: beyond ±10% AND above a dollar floor — the story list.",
          "Attribute YoY growth to programmes; quantify the top programme's share of the total change.",
        ],
        hints: [
          "The dollar floor matters: a 40% variance on a $50k line is not a story; a 12% variance on $40m is.",
          "Growth attribution: total_change = Σ programme changes — report the top programme's share of the sum.",
          "Stability of concentration across years is itself a finding (structural, not episodic).",
        ],
        checkpoint: "Concentration shares, screened variance table, growth attribution.",
      },
      {
        phase: "visualisation",
        title: "The explainer's charts",
        goal: "Five charts a general reader absorbs without effort.",
        instructions: [
          "Department bars (or treemap), variance diverging bars, YoY slopes, operating/capital stacks, per-capita bars.",
          "Every chart: plain title, per-capita or share translation, no jargon axes.",
          "Annotate the story candidates (the recurring-overrun departments).",
        ],
        hints: [
          "Reader-facing titles state findings: 'Half of city spending goes to three departments'.",
          "Diverging variance bars with the ±10% screen marked — readers see materiality, not noise.",
          "Per-capita bars with the city total as the reference line — the anchor chart.",
        ],
        checkpoint: "Five reader-ready charts.",
      },
      {
        phase: "interpretation",
        title: "Write the stories",
        goal: "Findings in plain language, each with its follow-up.",
        instructions: [
          "Answer the five questions in reader language; translate every metric.",
          "Separate what the ledger shows from what it implies (vacancies vs efficiency, procurement vs favouritism).",
          "Draft the three-story list: the recurring overruns, the growth programme, the vendor questions.",
        ],
        hints: [
          "The imply-vs-show discipline is journalistic ethics in data form: under-budget suggests vacancies; it does not prove efficiency.",
          "Every story ends with 'the data desk has asked…' — the explainer launches follow-ups, it doesn't close them.",
          "Plain-language test: read each finding aloud; if it needs a footnote to survive, rewrite it.",
        ],
        checkpoint: "Five answered questions and the three-story list.",
      },
      {
        phase: "recommendations",
        title: "The explainer's follow-up plan",
        goal: "Publication, FOIA follow-ups and the annual franchise.",
        instructions: [
          "Recommend the publication package, the records requests, and the annual tracking features.",
          "Each with its evidence and its editorial owner.",
          "Keep the methods box as the franchise's credibility anchor.",
        ],
        hints: [
          "The records-request recommendations are the explainer's value-add beyond description — name the documents.",
          "Annual franchise features (variance tracker, vendor tracker) compound in value; set them up in year one.",
          "The methods box text is reusable annually — version it with the data.",
        ],
        checkpoint: "The follow-up plan with owners and the methods box finalised.",
      },
      {
        phase: "report",
        title: "The annual explainer",
        goal: "A publication-ready explainer with reproducibility as a feature.",
        instructions: [
          "Structure: intro & sources → methods box → the five findings → the three stories → follow-ups.",
          "Charts embedded with plain titles; the per-capita anchor early.",
          "Appendix: the full parsing script, cited population source.",
        ],
        hints: [
          "Explainers live or die on the first chart — lead with the department picture and its per-capita anchor.",
          "The methods box is short, visible and unapologetic — readers trust named methods more than unnamed authority.",
          "Date-stamp everything: open-data files change silently; the explainer must say which vintage it analysed.",
        ],
        checkpoint: "The explainer, every number reproducible from the portal file.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the data desk's analyst. Produce the annual city-spending explainer: the breakdown, the variances that matter, the year-over-year story and the per-capita anchors — with reproducible methods and reader-ready language. Parsing rules and materiality screens are yours, documented in the methods box.",
      deliverables: [
        "Ledger audit and methods box",
        "Spending by department and category with concentration analysis",
        "Materiality-screened budget variance table",
        "Year-over-year growth decomposition by programme",
        "The explainer: per-capita anchors, five reader-ready charts, three-story follow-up list",
      ],
      guardrails: [
        "Every exclusion disclosed; totals reconcile to the raw file",
        "Under-budget framed as vacancies-pending-evidence, not efficiency",
        "Per-capita basis cited with source and year",
        "Plain-language discipline in all published text",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Fiscal years normalised before any year-level analysis",
        "Amounts numericised lossless; totals reconciled",
        "Variance analysis on budget-covered lines only, coverage reported",
      ],
      "code-quality": [
        "Parsing documented in the methods box",
        "Materiality screens parameterised",
      ],
      reasoning: [
        "Show vs imply distinction maintained (vacancies, procurement)",
        "Growth attributed to programmes, not just departments",
      ],
      visualization: [
        "Reader-facing titles with translations (share, per-capita)",
        "Variance chart shows materiality threshold",
      ],
      interpretation: [
        "Concentration and its stability quantified",
        "Story candidates separated from confirmed findings",
      ],
      recommendations: [
        "Records requests named and specific",
        "Annual franchise features proposed",
      ],
    },
  },

  /* ================================================================ PUB-02 */
  {
    id: "public-2",
    categoryId: "public",
    difficulty: "intermediate",
    code: "PUB-02",
    title: "Air Quality & Weather Investigation",
    subtitle: "Two years of station readings: the seasonal smog pattern, the weather connection, and the events worth knowing.",
    summary:
      "Environmental open-data analysis: clean a station-day air-quality panel, quantify seasonal and pollution-event patterns, model the weather relationship, and identify which stations and neighbourhoods carry the burden.",
    hours: 9,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Environmental panel analysis", "Time-series patterns", "Weather-confounder modelling", "Event analysis", "Public-interest reporting"],

    businessBackground:
      "Rivermouth's environmental council has published two years of hourly-to-daily air-quality data from twelve monitoring stations, and the local environmental journal wants to know what it actually shows: is the city's air improving, when is it worst, which stations and neighbourhoods carry the highest pollution, and how much of the pattern is weather rather than local sources. The dataset joins AQI, particulates and gases with daily weather — the analysis needs to separate the meteorology from the emissions.",
    problemStatement:
      "Characterise the city's air quality from two years of station-day readings: seasonal and weekly patterns; the weather relationship (wind, rain, temperature) after which the local signal remains; pollution-event identification and characterisation; and the station/neighbourhood burden ranking — delivered as a public-interest analysis with its meteorological honesty intact.",
    businessObjectives: [
      "Build a clean station-day panel with sentinel handling and station canonicalisation",
      "Quantify seasonal, weekday/weekend and station-type patterns in AQI and PM2.5",
      "Model the weather relationship; identify the residual local pattern",
      "Identify and characterise pollution events (episodes above WHO thresholds)",
      "Rank stations/neighbourhoods by burden and deliver the public-interest findings",
    ],
    datasetDescription:
      "A station-day panel (~8,700 rows): twelve stations × ~730 days with AQI, PM2.5, PM10, NO2, temperature, wind, humidity, rain and holiday flags. Sensor outages leave AQI gaps (~2%), a −999 PM2.5 sentinel corrupts scattered days, station IDs have casing variants, humidity includes impossible values, wind includes negatives, and duplicates exist. Environmental panels punish sloppy cleaning: a −999 averaged in turns a clean day into the worst on record.",
    dataDictionary: [
      { column: "date", kind: "date", description: "Reading date", example: "2024-07-22" },
      { column: "station_id", kind: "id", description: "Station identifier (casing variants)", example: "AQ04" },
      { column: "city", kind: "categorical", description: "District/city zone", example: "Northfield" },
      { column: "station_type", kind: "categorical", description: "Urban traffic / background / industrial / rural", example: "Industrial" },
      { column: "aqi", kind: "integer", description: "Air Quality Index (sensor gaps)", example: "72" },
      { column: "pm25", kind: "decimal", description: "PM2.5 µg/m³ (−999 sentinel exists)", example: "28.4" },
      { column: "pm10", kind: "decimal", description: "PM10 µg/m³", example: "44.1" },
      { column: "no2", kind: "decimal", description: "NO2 ppb", example: "18.7" },
      { column: "temp_c", kind: "decimal", description: "Mean temperature °C", example: "19.3" },
      { column: "wind_kph", kind: "decimal", description: "Mean wind speed (negatives exist)", example: "16.2" },
      { column: "humidity_pct", kind: "integer", description: "Mean humidity % (values >100 exist)", example: "62" },
      { column: "is_rain", kind: "boolean", description: "Rain that day", example: "0" },
      { column: "is_holiday", kind: "boolean", description: "Public holiday", example: "0" },
    ],
    initialQuestions: [
      "What are the seasonal and weekday/weekend patterns in AQI and PM2.5, by station type?",
      "How much of the pollution pattern does weather explain — wind, rain, temperature — and what remains?",
      "Which stations and neighbourhoods carry the highest burden, consistently vs episodically?",
      "How frequent and severe are pollution events (days above WHO PM2.5 guidelines), and what characterises them?",
      "Is the city's air improving over the two years, net of weather?",
    ],
    dataset: {
      name: "Rivermouth air-quality panel",
      filename: "public-02-air-quality.csv",
      description: "2 years of daily station readings across 12 monitoring stations with weather.",
      rows: 8700,
    },

    dataQuality: [
      { issue: "PM2.5 −999 sentinel", where: "pm25 — not-recorded encoded as −999", detection: "value_counts(); min() check", treatment: "Map to NaN with a recorded flag — the sentinel averaged in fabricates catastrophic pollution days." },
      { issue: "AQI sensor gaps", where: "aqi missing ~2% (clustered outages)", detection: "missingness by station and week", treatment: "Leave missing (no interpolation); station-day analyses use available readings; report the outage pattern." },
      { issue: "Station ID casing", where: "station_id — 'aq04' variants", detection: "nunique after strip/upper", treatment: "Canonicalise; verify twelve stations." },
      { issue: "Impossible humidity", where: "humidity_pct > 100", detection: "range check", treatment: "Set to NaN (counted); impossible physics excludes the value, not the day." },
      { issue: "Negative wind", where: "wind_kph < 0", detection: "range check", treatment: "Set NaN or abs() after inspection (sign errors vs magnitude) — document the choice." },
      { issue: "Duplicate station-days", where: "~12 duplicated rows", detection: "duplicated(['date','station_id']).sum()", treatment: "Drop — the panel key must be unique for any lag/rolling work." },
    ],
    cleaningPlan: [
      { action: "Enforce the (date, station) panel key; canonicalise station IDs", rationale: "Panel integrity for every pattern and model." },
      { action: "Sentinel and impossible-value handling (NaN + flags, never interpolation of pollution)", rationale: "Environmental data's cardinal rule: fabricating a reading is worse than missing one." },
      { action: "Derive event flags: WHO-guideline exceedance days per station-day", rationale: "Turns the continuous data into the public-interest metric (days above guideline)." },
      { action: "Build the weather frame (station-day with weather complete) for the model", rationale: "The weather relationship needs complete meteorology, stated coverage." },
    ],
    edaPlan: [
      { question: "Seasonal pattern", method: "monthly mean AQI/PM2.5 across stations", expectation: "Winter peak (inversions, heating), summer trough; classic smog seasonality." },
      { question: "Weekday vs weekend", method: "traffic-station vs background patterns by day type", expectation: "Traffic stations show weekday excess; background nearly flat — the local-source fingerprint." },
      { question: "Station burden", method: "mean PM2.5 and exceedance-day counts by station", expectation: "Industrial and traffic stations lead; rural trails by a wide margin." },
      { question: "Weather relationships", method: "PM2.5 vs wind (scatter/binned); rain effect; temperature", expectation: "Strong negative wind relationship; rain scavenging visible; cold-air inversions in winter highs." },
      { question: "Event landscape", method: "count and duration of multi-station exceedance episodes", expectation: "A handful of city-wide winter episodes lasting 3–7 days." },
      { question: "Two-year trend", method: "year-over-year same-month comparison", expectation: "Modest improvement or flat — weather-dominated variance makes trend claims fragile." },
    ],
    statisticsPlan: [
      { technique: "Station-type comparison with uncertainty (bootstrap CIs)", purpose: "Burden ranking that respects panel dependence", expectation: "Traffic/industrial stations significantly above background/rural." },
      { technique: "Weather adjustment regression (PM2.5 ~ weather + station FE + month FE)", purpose: "Separate meteorology from local signal", expectation: "Wind dominates; after adjustment, the station ranking holds — it's emissions, not just exposure to weather." },
      { technique: "Episode characterisation (frequency, duration, meteorological profile)", purpose: "The public-interest event story", expectation: "Episodes cluster in low-wind winter conditions — inversion events." },
      { technique: "Trend test net of weather (residual trend after adjustment)", purpose: "Is air improving, honestly?", expectation: "Small negative trend, not statistically clear — the honest answer." },
    ],
    visualisationPlan: [
      { chart: "Heatmap — monthly mean PM2.5 by station type (or station)", answers: "When and where is air worst?", reads: "Winter columns dark; station rows ordered by burden." },
      { chart: "Scatter with fit — PM2.5 vs wind speed, coloured by season", answers: "How much is weather?", reads: "The negative slope with winter points at low-wind/high-PM." },
      { chart: "Bar — exceedance days per year by station", answers: "Who bears the guideline breaches?", reads: "Sorted bars; the WHO context stated." },
      { chart: "Time series — city mean PM2.5 with episodes shaded", answers: "What do events look like?", reads: "Shaded multi-day episodes; the two worst labelled with dates." },
      { chart: "Slope chart — station PM2.5 before/after weather adjustment", answers: "Is it emissions or exposure?", reads: "Stations holding rank after adjustment = real emission differences." },
    ],
    findings: [
      "The city's pollution is strongly seasonal and weather-shaped: winter PM2.5 runs roughly 40–60% above summer, and low-wind days carry the worst readings — the inversion signature.",
      "Station types tell the source story: urban-traffic and industrial stations average 30–50% higher PM2.5 than the rural site, and only traffic stations show weekday excess — the commuting fingerprint.",
      "After weather adjustment, the station burden ranking essentially holds: the differences are emissions, not meteorological exposure — the analysis's central credibility finding.",
      "Exceedance days are common and unequally shared: the WHO daily guideline is exceeded on roughly a quarter of days city-wide, concentrated at traffic and industrial stations and in winter.",
      "The two-year trend is small and statistically fragile after weather adjustment — the honest answer to 'is air improving' is 'not yet clearly', and the analysis says why that's hard to know at this window length.",
    ],
    recommendations: [
      { what: "Publish the station burden ranking with the weather-adjusted view alongside the raw", why: "Raw rankings invite the 'it's just the weather' dismissal; the adjusted view pre-empts it with evidence.", impact: "Public credibility of the findings", horizon: "immediate" },
      { what: "Investigate the traffic-corridor stations' weekday excess with the city's transport department", why: "A commuting-fingerprint pattern is actionable in ways general air quality isn't.", impact: "Points policy at a specific source", horizon: "this quarter" },
      { what: "Set up an episode-alert feature: multi-station exceedance days flagged in near-real-time", why: "Episodes are the public-health moments; the data infrastructure to detect them now exists.", impact: "Timely public information", horizon: "this quarter" },
      { what: "Continue the panel and re-assess trend at five years with the weather-adjusted method", why: "Two years cannot separate trend from weather variance; the method is now in place to answer it properly later.", impact: "Honest long-run monitoring", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Rivermouth's air quality story is seasonal, unequally shared, and mostly emissions. Winter PM2.5 runs 40–60% above summer and low-wind days carry the worst episodes — but after weather adjustment the station ranking barely moves: traffic and industrial stations genuinely emit more, and only traffic stations show the weekday excess of commuting. The WHO daily guideline is exceeded on roughly a quarter of days city-wide, concentrated where people live with the sources. The two-year trend is small and statistically fragile once weather is netted out; the honest claim is 'not yet clearly improving', with the method now in place to answer properly at five years.",
      structure: [
        "1. The question and the panel (stations, coverage, methods)",
        "2. Data quality: sentinels, outages and what we did about them",
        "3. Seasonal and weekly patterns",
        "4. The weather relationship and what remains",
        "5. Station burden: raw and adjusted",
        "6. Exceedance days and episodes",
        "7. The trend question, honestly",
        "8. Appendix: cleaning log, model tables, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Respect the environmental panel",
        goal: "Panel key, sentinel census, and the station-type taxonomy.",
        instructions: [
          "Verify the (date, station) key; canonicalise station IDs; confirm the twelve stations and their types.",
          "Census the sentinels and impossible values (−999, humidity >100, negative wind).",
          "Map the analysis: patterns (seasonal, weekly), weather adjustment, events, burden — in that order.",
        ],
        hints: [
          "Environmental data's first rule: a −999 is a missing value wearing a catastrophic costume — find them before any mean does.",
          "Station type (traffic/background/industrial/rural) is the source-attribution axis — keep it central from the first table.",
          "The panel is station-day; city-level analyses aggregate it later, never before.",
        ],
        checkpoint: "Panel key verified, sentinel census complete, analysis map written.",
        code: {
          label: "Panel setup",
          language: "python",
          source: `df = pd.read_csv("public-02-air-quality.csv", parse_dates=["date"])
df["station_id"] = df["station_id"].str.upper().str.strip()
print("dupes:", df.duplicated(["date", "station_id"]).sum())
print("stations:", df["station_id"].nunique())
print("sentinels:", (df["pm25"] == -999).sum(),
      "humidity>100:", (df["humidity_pct"] > 100).sum(),
      "wind<0:", (df["wind_kph"] < 0).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Clean without fabricating readings",
        goal: "Sentinels, gaps and impossibles handled with environmental discipline.",
        instructions: [
          "Map −999 to NaN with flags; NaN the impossible humidity/wind values.",
          "Profile the AQI outage pattern (which stations, which weeks).",
          "Write the cleaning log with the no-interpolation rule stated.",
        ],
        hints: [
          "The no-interpolation rule is methodological, not convenience: an interpolated pollution value could fabricate or mask an exceedance day.",
          "Outage profiling: if one station missed a month, its annual mean is not comparable — coverage-aware comparisons.",
          "Every NaN'd value is counted by station — the appendix table that makes the analysis auditable.",
        ],
        checkpoint: "The cleaning log with sentinel and outage tables.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis panel",
        goal: "Clean station-day frame with event flags and weather completeness.",
        instructions: [
          "Apply treatments; derive the WHO-exceedance flag (daily PM2.5 > 15 µg/m³ guideline).",
          "Build the weather-complete frame for modelling (coverage stated).",
          "Derive month and day-type features for the pattern analyses.",
        ],
        hints: [
          "WHO 2021 daily PM2.5 guideline: 15 µg/m³ — cite it; the exceedance metric is the public-interest unit.",
          "Weather-complete frame: rows with wind/temp/humidity all present — the model's population, coverage disclosed.",
          "Month and weekday features come from the date index — one derivation, reused everywhere.",
        ],
        checkpoint: "The analysis panel with exceedance flags and the model frame.",
        code: {
          label: "Analysis panel",
          language: "python",
          source: `clean = df.drop_duplicates(["date", "station_id"]).copy()
clean.loc[clean["pm25"] == -999, "pm25"] = np.nan
clean.loc[clean["humidity_pct"] > 100, "humidity_pct"] = np.nan
clean.loc[clean["wind_kph"] < 0, "wind_kph"] = np.nan
clean["exceeds_who"] = clean["pm25"] > 15.0
clean["month"] = clean["date"].dt.month
clean["daytype"] = np.where(clean["date"].dt.dayofweek >= 5, "Weekend", "Weekday")
print(clean.groupby("station_type")["exceeds_who"].mean().round(2))`,
        },
      },
      {
        phase: "eda",
        title: "Patterns, burden and weather",
        goal: "Seasonality, weekday effects, station ranking, weather relationships.",
        instructions: [
          "Monthly means by station type; weekday/weekend by station type.",
          "Station burden: mean PM2.5 and exceedance share, ranked.",
          "Weather: PM2.5 by wind decile; rain vs no-rain; the winter-inversion view.",
        ],
        hints: [
          "The weekday/weekend × station-type table is the source-attribution exhibit: only traffic stations should show weekday excess.",
          "Wind deciles: pd.qcut(wind, 10) then mean PM2.5 per bin — the relationship in one table.",
          "Winter inversion view: filter winter months, scatter wind vs PM2.5 — the low-wind/high-PM corner is the episode factory.",
        ],
        checkpoint: "Patterns mapped, burden ranked, weather relationships quantified.",
      },
      {
        phase: "statistics",
        title: "Adjust for weather, then claim",
        goal: "Weather-adjusted burden ranking, episode characterisation, honest trend.",
        instructions: [
          "Regression: pm25 ~ wind + temp + rain + month FE + station FE (clustered by station).",
          "Compare station effects before/after adjustment — the emissions-vs-exposure test.",
          "Episode analysis: identify multi-day multi-station exceedance windows; profile their weather.",
          "Trend: year effect in the adjusted model, with its honest uncertainty.",
        ],
        hints: [
          "The station FE before/after comparison IS the credibility exhibit — a slope chart of station means, raw vs adjusted.",
          "Episodes: city-day exceedance share above a threshold (e.g., >50% of stations) for 2+ consecutive days — a simple, defensible definition.",
          "The trend claim discipline: report the year coefficient with CI and say what window length would settle it.",
        ],
        checkpoint: "Adjusted ranking, episode table, trend statement with uncertainty.",
        code: {
          label: "Weather adjustment",
          language: "python",
          source: `import statsmodels.formula.api as smf

m = clean.dropna(subset=["pm25", "wind_kph", "temp_c"]).copy()
model = smf.ols(
    "pm25 ~ wind_kph + temp_c + is_rain + C(month) + C(station_id)",
    data=m).fit(cov_type="cluster", cov_kwds={"groups": m["station_id"]})
stn = [c for c in model.params.index if "station_id" in c]
print(pd.DataFrame({"effect": model.params[stn].round(2),
                    "lo": model.conf_int().loc[stn, 0].round(2),
                    "hi": model.conf_int().loc[stn, 1].round(2)}))`,
        },
      },
      {
        phase: "visualisation",
        title: "The public-interest exhibits",
        goal: "Five charts: seasonality heatmap, wind relationship, exceedance bars, episode timeline, adjustment slopes.",
        instructions: [
          "Build the five; the adjustment slope chart is the credibility exhibit.",
          "Shade episodes on the timeline with dates labelled.",
          "State the WHO guideline on every exceedance chart.",
        ],
        hints: [
          "The heatmap (station × month) shows when and where in one exhibit — order stations by burden.",
          "The wind scatter with fitted line and seasonal colours makes the meteorology argument visible.",
          "Slope chart: left raw station means, right adjusted — stations keeping their rank is the point.",
        ],
        checkpoint: "Five exhibits, adjustment and episode charts polished.",
      },
      {
        phase: "interpretation",
        title: "Emissions, weather and honesty",
        goal: "Findings with the meteorological confounder addressed head-on.",
        instructions: [
          "Answer the five questions; lead with the seasonal/weather shape, then the adjustment result.",
          "Translate exceedance days into public-health language with the WHO citation.",
          "State the trend honestly: what two years can and cannot show.",
        ],
        hints: [
          "The structure that survives scrutiny: 'Weather shapes when; emissions shape where; the ranking survives adjustment.'",
          "Public-health translation: 'a quarter of days above the WHO daily guideline' — the number readers remember.",
          "Trend honesty earns trust: 'we cannot yet distinguish trend from weather variance at two years' is a finding, not a failure.",
        ],
        checkpoint: "Five answered questions with translations and the honest trend statement.",
      },
      {
        phase: "recommendations",
        title: "The public-interest actions",
        goal: "Publication, corridor investigation, episode alerts, long-run monitoring.",
        instructions: [
          "Recommend the four actions with their evidence chains.",
          "Name the stakeholders (transport department, environmental council, the journal's readers).",
          "Define what each action would produce and when.",
        ],
        hints: [
          "The traffic-corridor investigation is the most actionable: a specific pattern, a specific department, a specific ask.",
          "Episode alerts are infrastructure the analysis justifies — a spec, not just an idea.",
          "The five-year re-assessment commitment converts the trend limitation into a plan.",
        ],
        checkpoint: "The action list with stakeholders and outputs.",
      },
      {
        phase: "report",
        title: "The air-quality investigation",
        goal: "A public-interest report that survives expert scrutiny.",
        instructions: [
          "Follow the outline; open with the when/where framing (weather shapes when, emissions shape where).",
          "Methods and data-quality sections in the body — environmental claims get fact-checked by scientists.",
          "Close with the actions and the five-year commitment.",
        ],
        hints: [
          "The one-liner: 'The city's worst air is winter air on still days — but which neighbourhood breathes it is decided by emissions.'",
          "Cite WHO guidelines and the panel's coverage; precision is the report's authority.",
          "Reproducibility appendix: the script, the sentinel log, the model — scrutiny welcomed, not feared.",
        ],
        checkpoint: "The complete investigation, reproducible from the panel CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the environmental journal's analyst. Characterise the city's air quality: patterns, weather-adjusted burden, episodes and the honest trend. Sentinel policy, exceedance thresholds and model specs are yours — documented for expert scrutiny.",
      deliverables: [
        "Panel audit with sentinel and outage treatment",
        "Seasonal, weekly and station-type patterns",
        "Weather-adjusted burden ranking (the emissions-vs-exposure test)",
        "Exceedance-day counts and episode characterisation",
        "Public-interest report with honest trend statement and actions",
      ],
      guardrails: [
        "No interpolation of pollution readings",
        "WHO guideline cited for exceedance metrics",
        "Weather confounder addressed before burden claims",
        "Trend claims bounded by window length",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Sentinel handled before any aggregation; impossible values NaN'd",
        "Panel key unique; exceedance flag threshold correct and cited",
        "Weather adjustment includes month and station structure",
      ],
      "code-quality": [
        "No-interpolation rule applied consistently",
        "Coverage stated for model populations",
      ],
      reasoning: [
        "Emissions vs exposure distinction made with the adjustment evidence",
        "Weekday excess interpreted as source fingerprint, bounded",
      ],
      visualization: [
        "Station×month heatmap ordered by burden",
        "Adjustment slope chart shows ranking stability",
      ],
      interpretation: [
        "Episode definition stated and applied consistently",
        "Trend uncertainty communicated honestly",
      ],
      recommendations: [
        "Actions tied to specific patterns and stakeholders",
        "Long-run monitoring commitment included",
      ],
    },
  },

  /* ================================================================ PUB-03 */
  {
    id: "public-3",
    categoryId: "public",
    difficulty: "advanced",
    code: "PUB-03",
    title: "Cross-Country Development Indicators",
    subtitle: "Twenty countries, twelve years: build the indicator, find the clusters, and tell the development story carefully.",
    summary:
      "Development economics with open data: construct a clean country-year panel, build a composite indicator, analyse trajectories and convergence, cluster countries into profiles, and report with the composite's assumptions exposed.",
    hours: 15,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "sklearn", "Matplotlib", "Seaborn"],
    skills: ["Panel construction", "Composite indicators", "Convergence analysis", "Clustering", "Assumption-transparent reporting"],

    businessBackground:
      "A development think-tank's annual report needs more than GDP-per-capita league tables: the director wants a multi-dimensional view of how twenty focus countries have moved over twelve years across income, health, education, connectivity and sustainability. The open data is assembled (World-Development-Indicator-style), and the analyst's job is the hard part: building a defensible composite indicator, analysing trajectories and convergence honestly, and clustering countries into profiles the policy team can use — with every subjective choice (weights, imputations, normalisation) exposed rather than buried.",
    problemStatement:
      "Construct a country-year panel of development indicators; build a composite index with documented methodology; analyse trajectories, divergence/convergence and indicator co-movement; cluster countries into development profiles; and deliver the annual-report analysis with sensitivity testing on the composite's subjective choices.",
    businessObjectives: [
      "Build a clean country-year panel (2013–2024) with canonical labels and honest missingness treatment",
      "Construct a composite development index with documented normalisation and weights (and alternatives)",
      "Analyse trajectories: who climbed, who stalled, who diverged; β- and σ-convergence tests",
      "Cluster countries into profiles via indicator patterns (not income alone)",
      "Deliver the analysis with sensitivity results and assumption transparency",
    ],
    datasetDescription:
      "A country-year panel (~230 rows): twenty countries × twelve years with population, GDP per capita, life expectancy, literacy, internet users, CO2, health spending and HDI. Country codes have casing variants, GDP values are partly comma-formatted, HDI has gaps, year gaps break panel continuity, literacy includes impossible values above 100, and duplicates exist. The composite index inherits every choice — normalisation, imputation and weighting are methodology, not cleanup.",
    dataDictionary: [
      { column: "country_code", kind: "id", description: "ISO-3 country code (casing variants)", example: "NGA" },
      { column: "country", kind: "text", description: "Country name", example: "Nigeria" },
      { column: "year", kind: "integer", description: "Indicator year (gaps exist)", example: "2021" },
      { column: "region", kind: "categorical", description: "Region (short-form variants)", example: "Sub-Saharan Africa" },
      { column: "income_group", kind: "categorical", description: "World Bank income group", example: "Lower middle income" },
      { column: "population", kind: "integer", description: "Population", example: "213000000" },
      { column: "gdp_per_capita", kind: "currency", description: "GDP per capita (format mix)", example: "2,184" },
      { column: "life_expectancy", kind: "decimal", description: "Life expectancy at birth (years)", example: "62.4" },
      { column: "literacy_rate_pct", kind: "percent", description: "Adult literacy % (values >100 exist; missing blocks)", example: "62.8" },
      { column: "internet_users_pct", kind: "percent", description: "Internet users % of population", example: "39.6" },
      { column: "co2_per_capita_t", kind: "decimal", description: "CO2 emissions tonnes per capita", example: "0.62" },
      { column: "health_spend_pct_gdp", kind: "decimal", description: "Health spending % of GDP", example: "3.4" },
      { column: "hdi", kind: "decimal", description: "Human Development Index (missing blocks)", example: "0.548" },
    ],
    initialQuestions: [
      "How have the twenty countries moved across the indicator set — climbers, stalled, diverging?",
      "Do the indicators converge (are poor countries catching up), and is β-convergence matched by σ-convergence?",
      "What does a defensible composite index say, and how much do weights and normalisation move the ranking?",
      "What country profiles emerge from clustering on indicators (beyond income groups)?",
      "Which relationships are structural (GDP-health, internet-literacy) and which are regional?",
    ],
    dataset: {
      name: "Focus-country development panel",
      filename: "public-03-development-indicators.csv",
      description: "20 countries × 12 years of development indicators (WDI-style).",
      rows: 240,
    },

    dataQuality: [
      { issue: "Country code casing", where: "country_code — 'nga' variants", detection: "nunique vs 20", treatment: "Upper-case canonicalisation; the panel key's first half." },
      { issue: "Formatted GDP values", where: "gdp_per_capita — '2,184' strings (~7%)", detection: "dtype object", treatment: "Strip and numericise; verify against the unformatted majority." },
      { issue: "Year gaps", where: "missing country-years (~3%)", detection: "reindex the full grid and count", treatment: "Panel continuity decision: leave gaps explicit (no interpolation of outcomes) or reindex with NaN — stated and applied consistently." },
      { issue: "Impossible literacy", where: "literacy_rate_pct > 100", detection: "range check", treatment: "Set NaN (counted); impossible values excluded, never capped." },
      { issue: "Missing HDI blocks", where: "hdi — ~9% missing", detection: "isna() by country and year", treatment: "The composite uses YOUR constructed index (documented), with HDI as a validation benchmark where present — missingness disclosed." },
      { issue: "Duplicate country-years", where: "~10 duplicated rows", detection: "duplicated(['country_code','year']).sum()", treatment: "Drop — the panel key's uniqueness is non-negotiable." },
    ],
    cleaningPlan: [
      { action: "Canonicalise codes and regions; deduplicate the (country, year) key", rationale: "Panel integrity." },
      { action: "Numericise GDP; exclude impossible literacy; reindex with explicit gaps", rationale: "Honest missingness over fabricated continuity." },
      { action: "Document the imputation stance: no outcome interpolation; composite handles missingness per-year", rationale: "The composite's credibility is the missingness policy." },
      { action: "Build the indicator matrix (min-max normalised per year, per documented direction)", rationale: "Normalisation choices are methodology — versions and alternatives kept." },
    ],
    edaPlan: [
      { question: "Indicator landscapes", method: "distributions and ranges per indicator; missingness map", expectation: "GDP spans 40×; internet growth everywhere; literacy noisy." },
      { question: "Trajectories", method: "indexed (2013=100) paths for key indicators by country", expectation: "Asia climbing fast; commodity-driven dips mid-decade." },
      { question: "Co-movement", method: "correlation matrix across indicators (country-level means)", expectation: "GDP-internet-health strongly positive; CO2-GDP positive (the sustainability tension)." },
      { question: "Income-group view", method: "indicator means by income group over time", expectation: "Groups ordered as expected on most; internet converging fastest." },
      { question: "Outliers and stories", method: "countries off the GDP-HDI line; largest movers", expectation: "One resource-rich country off the line; two rapid climbers." },
    ],
    statisticsPlan: [
      { technique: "Composite construction (min-max per year, documented weights; equal-weight primary)", purpose: "The multi-dimensional index, methodology exposed", expectation: "A stable top (Nordic-style) and a climbing middle; ranking mostly robust." },
      { technique: "Sensitivity: alternative weights and normalisation (rank correlation across versions)", purpose: "How much is the ranking a choice?", expectation: "Spearman ρ > 0.9 across versions for most countries; a few weight-sensitive ranks flagged." },
      { technique: "β- and σ-convergence (GDP and composite)", purpose: "Catch-up vs dispersion", expectation: "β-convergence present (poor grow faster) but σ-convergence weak — catching up while spreading apart." },
      { technique: "Clustering (k-means on standardised indicator means, k chosen with silhouette)", purpose: "Profiles beyond income groups", expectation: "3–4 profiles: established-high, rapid-climbing, commodity-dependent, struggling-low." },
      { technique: "HDI validation (composite vs HDI where present)", purpose: "External benchmark for the constructed index", expectation: "High rank correlation — the composite adds dimensions without contradicting the standard." },
    ],
    visualisationPlan: [
      { chart: "Slope chart — composite index 2013 vs 2024 by country, coloured by profile", answers: "Who climbed, who stalled?", reads: "Slopes ordered; the profiles coloured; big movers labelled." },
      { chart: "Divererging bar — composite vs GDP rank (the multi-dimension view)", answers: "Where does income mislead?", reads: "Countries far off the diagonal — richer-than-developed or developed-poorer-than-income." },
      { chart: "Convergence panel — β scatter (initial vs growth) and σ trend (dispersion over time)", answers: "Is the gap closing?", reads: "Negative slope = catch-up; flat/rising σ line = spreading." },
      { chart: "Heatmap — indicator z-scores by cluster profile", answers: "What defines each profile?", reads: "The profile fingerprints: which indicators mark each cluster." },
      { chart: "Sensitivity strip — country ranks across index versions", answers: "How sturdy is the ranking?", reads: "Ranks with ranges; the few weight-sensitive countries flagged." },
    ],
    findings: [
      "The twenty countries split into four robust profiles: an established high-income cluster, two rapid climbers (driven by internet adoption and health gains ahead of income), a commodity-dependent middle with volatile paths, and a struggling low-income cluster — profiles that income groups alone blur.",
      "Convergence is asymmetric: β-convergence is real (lower-2013 countries grew faster on the composite) but σ-convergence is weak — the pack is catching up while the spread between best and worst barely narrows.",
      "The composite and GDP rankings disagree materially for a few countries: two are more developed than their income suggests (health and education ahead) and one resource-rich country is substantially less — the multi-dimensional view's whole point.",
      "The composite is mostly robust: across equal weights, PCA-based weights and alternative normalisations, most countries' ranks hold within a few places — with two weight-sensitive countries flagged in the report.",
      "Internet adoption is the fastest-converging indicator in the panel (the 2013 laggards have nearly closed the connectivity gap), while health-spending dispersion persists — the dimensions move at different speeds.",
    ],
    recommendations: [
      { what: "Publish the composite with full methodology (weights, normalisation, sensitivity) and the HDI benchmark alongside", why: "Assumption transparency is what makes a composite defensible to the critics who will rebuild it.", impact: "Report credibility", horizon: "immediate" },
      { what: "Feature the profile analysis (beyond income groups) as the report's organising structure", why: "The profiles are the policy-relevant taxonomy the income groups blur.", impact: "A more useful report", horizon: "immediate" },
      { what: "Commission deep-dives on the two rapid climbers (what drove non-income gains?)", why: "The climbers carry transferable lessons the aggregate story hides.", impact: "The report's most actionable content", horizon: "this quarter" },
      { what: "Track σ-convergence explicitly in future editions (the dispersion the β-story hides)", why: "Catch-up-plus-spreading is a different policy problem than uniform catch-up.", impact: "Honest long-run framing", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Twenty countries, twelve years, and a multi-dimensional view that income alone cannot give. The panel splits into four robust profiles — established-high, rapid-climbing, commodity-dependent, struggling-low — with two climbers making health and connectivity gains far ahead of income. Convergence is asymmetric: laggards grow faster (β-convergence) while the best-worst spread barely narrows (weak σ-convergence) — catching up and spreading apart simultaneously. The composite index, built with documented weights and validated against HDI, ranks most countries robustly across methodological choices; two weight-sensitive cases are flagged rather than hidden. Internet is the fastest-converging dimension; health-spending dispersion persists. The report organises around profiles, exposes its methodology, and commissions deep-dives on the climbers.",
      structure: [
        "1. The question and the composite methodology (weights, normalisation, missingness)",
        "2. Panel construction and data quality",
        "3. Indicator landscapes and trajectories",
        "4. The composite index and its sensitivity",
        "5. Convergence: β and σ, honestly",
        "6. Country profiles from clustering",
        "7. Where income misleads: composite vs GDP",
        "8. Policy implications and the climbers",
        "9. Appendix: methodology tables, model details, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Design the composite before touching data",
        goal: "Indicator selection, direction, normalisation and weights — written down first.",
        instructions: [
          "Write the methodology doc: indicators included, their direction (higher-better except CO2), min-max normalisation per year, equal weights primary + alternatives for sensitivity.",
          "Decide the missingness policy (no outcome interpolation; composite computed on available indicators per year, disclosed).",
          "Note the validation plan: the composite must correlate with HDI where HDI exists.",
        ],
        hints: [
          "Composite indices are 20% statistics and 80% documentation — the methodology doc IS the deliverable's spine.",
          "Normalising per year (not over the whole panel) keeps the index comparable across time — a choice to state and defend.",
          "The HDI benchmark saves you from reinventing a worse wheel: high rank correlation validates, divergence is a finding.",
        ],
        checkpoint: "The methodology document with all choices stated.",
        code: {
          label: "Methodology setup",
          language: "python",
          source: `INDICATORS = {
    "gdp_per_capita": +1, "life_expectancy": +1, "literacy_rate_pct": +1,
    "internet_users_pct": +1, "health_spend_pct_gdp": +1, "co2_per_capita_t": -1,
}
df = pd.read_csv("public-03-development-indicators.csv")
print(df["country_code"].nunique(), "countries;", df["year"].min(), "-", df["year"].max())
print("dupes:", df.duplicated(["country_code", "year"]).sum())
print(df.isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the panel",
        goal: "Codes, formats, gaps, impossibles — with the panel-continuity decision.",
        instructions: [
          "Canonicalise codes and regions; verify twenty countries.",
          "Numericise GDP; NaN the impossible literacy; find the year gaps by country.",
          "Decide the panel-continuity treatment (reindex with NaN, stated).",
        ],
        hints: [
          "The reindex decision: a full 20×12 grid with NaNs makes the panel explicit; dropping gaps silently makes trajectories lie by omission.",
          "Impossible literacy: exclude, don't cap — a 105% literacy rate is a data error, not enthusiasm.",
          "Region short-form variants: canonicalise with a documented map (the report groups by region).",
        ],
        checkpoint: "The audit table with the continuity decision made.",
      },
      {
        phase: "cleaning",
        title: "Build the indicator matrix",
        goal: "Panel with normalised indicators and the composite per country-year.",
        instructions: [
          "Reindex to the full grid; apply treatments; min-max normalise per year with direction applied.",
          "Compute the equal-weight composite on available indicators (coverage per row disclosed).",
          "Verify: composite in [0,1]; benchmark correlation with HDI.",
        ],
        hints: [
          "Direction: for CO2, use (max − x)/(max − min) — higher is better after transformation.",
          "Coverage disclosure: composite_n = count of available indicators per row; rows under a threshold (e.g., 4 of 6) flagged.",
          "The HDI rank correlation is the first credibility number — compute it before believing your index.",
        ],
        checkpoint: "The indicator matrix with composite and validation benchmark.",
        code: {
          label: "Composite build",
          language: "python",
          source: `p = df.drop_duplicates(["country_code", "year"]).copy()
p["country_code"] = p["country_code"].str.upper()
p["gdp_per_capita"] = pd.to_numeric(
    p["gdp_per_capita"].astype(str).str.replace(",", "", regex=False))
p.loc[p["literacy_rate_pct"] > 100, "literacy_rate_pct"] = np.nan

full = pd.MultiIndex.from_product(
    [p["country_code"].unique(), range(2013, 2025)], names=["country_code", "year"])
p = p.set_index(["country_code", "year"]).reindex(full).reset_index()

def norm(s, direction):
    lo, hi = s.min(), s.max()
    return (s - lo) / (hi - lo) * direction if direction > 0 else (hi - s) / (hi - lo)

norm_cols = []
for col, d in INDICATORS.items():
    p[f"n_{col}"] = p.groupby("year")[col].transform(lambda s: norm(s, d))
    norm_cols.append(f"n_{col}")
p["composite"] = p[norm_cols].mean(axis=1)
p["composite_n"] = p[norm_cols].notna().sum(axis=1)
print(p.dropna(subset=["hdi"])[["composite", "hdi"]].corr().round(3))`,
        },
      },
      {
        phase: "eda",
        title: "Landscapes and trajectories",
        goal: "Indicator paths, co-movement, movers and outliers.",
        instructions: [
          "Indexed (2013=100) trajectories for GDP, internet and composite by country.",
          "Correlation matrix on country-level means; the GDP-CO2 tension visible.",
          "Largest composite movers; countries off the GDP-composite line.",
        ],
        hints: [
          "Indexing to 2013 makes 20-country trajectories comparable on one chart — the movers pop.",
          "The GDP-CO2 correlation is the sustainability tension — it belongs in the report's framing.",
          "Off-line countries (developed-beyond-income, income-beyond-development) are the report's characters.",
        ],
        checkpoint: "Trajectories mapped, co-movement quantified, movers and outliers named.",
      },
      {
        phase: "statistics",
        title: "Convergence, clustering, sensitivity",
        goal: "β/σ tests, k-means profiles, weight-sensitivity of the ranking.",
        instructions: [
          "β-convergence: growth (2013–24) vs initial level, composite and GDP; σ-convergence: dispersion trend.",
          "k-means on standardised indicator means (choose k by silhouette); profile fingerprints.",
          "Sensitivity: PCA-based weights and GDP-tilted weights; rank correlations across versions; flag movers.",
        ],
        hints: [
          "β without σ is the classic development-economics trap — report both and interpret the mismatch.",
          "k-means on 20 countries: keep k small (3–4), standardise features, and validate that clusters aren't just income groups.",
          "Sensitivity as rank ranges: each country gets (min rank, max rank) across versions — the two wide-range countries are the honest flags.",
        ],
        checkpoint: "Convergence verdict, profile clusters, sensitivity table.",
        code: {
          label: "Convergence tests",
          language: "python",
          source: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

base = p[p["year"] == 2013].set_index("country_code")["composite"]
last = p[p["year"] == 2024].set_index("country_code")["composite"]
growth = (last - base) / base * 100
import numpy as np
print("beta corr (initial vs growth):",
      np.corrcoef(base, growth)[0, 1].round(3))

disp = p.groupby("year")["composite"].std()
print("sigma trend:", disp.round(3).to_dict())

feats = p.groupby("country_code")[list(INDICATORS)].mean()
X = StandardScaler().fit_transform(feats)
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X)
feats["profile"] = km.labels_
print(feats["profile"].sort_values())`,
        },
      },
      {
        phase: "visualisation",
        title: "The report's exhibits",
        goal: "Five charts: slopes, composite-vs-GDP, convergence panel, profile heatmap, sensitivity strip.",
        instructions: [
          "Build the five; the slope chart and sensitivity strip carry the credibility.",
          "Colour slopes by cluster profile; label the big movers.",
          "The convergence panel shows β scatter and σ line side by side.",
        ],
        hints: [
          "Slope chart with profile colours doubles as the profile introduction — one chart, two findings.",
          "Composite-vs-GDP rank scatter with the diagonal: off-line countries labelled with their direction.",
          "Sensitivity strip: rank ranges as vertical lines with the median marked; wide-range countries annotated.",
        ],
        checkpoint: "Five exhibits, slope and sensitivity charts polished.",
      },
      {
        phase: "interpretation",
        title: "Report the development story carefully",
        goal: "Findings with composite choices exposed and convergence honestly split.",
        instructions: [
          "Answer the five questions; keep the composite's constructed nature visible throughout.",
          "Interpret β/σ together: catch-up with spreading is a specific, honest finding.",
          "Translate profiles into policy language without over-claiming causality.",
        ],
        hints: [
          "Composite honesty: 'on our constructed index, with choices documented' — once per finding, not once per report.",
          "The β/σ story is the report's intellectual signature; most annual reports only run β.",
          "Profiles are descriptive, not causal: 'countries with this pattern', never 'this policy path'.",
        ],
        checkpoint: "Five answered questions with careful composite and convergence language.",
      },
      {
        phase: "recommendations",
        title: "The report's agenda",
        goal: "Methodology publication, profile structure, climber deep-dives, σ-tracking.",
        instructions: [
          "Recommend the four actions with their evidence.",
          "The climbers' deep-dives scoped: which questions, which data.",
          "Future editions: σ-convergence as a standing feature.",
        ],
        hints: [
          "Methodology publication (weights, normalisation, sensitivity) is the composite's licence to exist.",
          "Climber deep-dives: what drove health/connectivity gains ahead of income — the transferable-lessons framing.",
          "The σ-tracker turns this year's finding into a permanent lens.",
        ],
        checkpoint: "The agenda with evidence and scopes.",
      },
      {
        phase: "report",
        title: "The annual analysis",
        goal: "A think-tank-grade analysis: methodology-exposed, benchmark-validated, honestly converged.",
        instructions: [
          "Follow the outline; open with the profiles framing (beyond income groups).",
          "Methodology section in the body — it is the report's armour.",
          "Close with the climbers and the future-edition commitments.",
        ],
        hints: [
          "The one-liner: 'The laggards are catching up while the spread holds — and four profiles, not income groups, describe who is moving.'",
          "Think-tank audiences rebuild your index; the sensitivity section is how you survive that.",
          "Reproducibility: one script from raw panel to every exhibit, with the methodology tables generated by code, not typed.",
        ],
        checkpoint: "The complete analysis, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the think-tank's analyst. Build the multi-dimensional development view: composite index (methodology exposed), trajectories, convergence (both β and σ), profiles, and the honest sensitivity story. Indicator selection, weights and missingness policy are yours — documented to survive reconstruction.",
      deliverables: [
        "Panel construction with continuity and missingness decisions",
        "Composite index with documented normalisation and weights",
        "Sensitivity analysis across weighting/normalisation versions",
        "β- and σ-convergence analysis on composite and GDP",
        "Cluster profiles and the annual-report analysis with HDI benchmark",
      ],
      guardrails: [
        "No outcome interpolation; composite coverage disclosed per row",
        "Both convergence tests reported together",
        "Composite's constructed nature kept visible in findings",
        "Weight-sensitive countries flagged, not smoothed",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Panel key unique and reindexed; impossible values excluded",
        "Normalisation direction applied correctly (CO2 inverted)",
        "β and σ convergence computed and interpreted as a pair",
      ],
      "code-quality": [
        "Methodology parameterised (indicator dict, weight versions)",
        "Coverage fields maintained",
      ],
      reasoning: [
        "Composite choices exposed with sensitivity evidence",
        "HDI benchmark used as validation",
      ],
      visualization: [
        "Slope chart coloured by profile with movers labelled",
        "Sensitivity shown as rank ranges",
      ],
      interpretation: [
        "β/σ mismatch explained in policy language",
        "Profiles described without causal over-claim",
      ],
      recommendations: [
        "Methodology publication committed",
        "Climber deep-dives scoped with questions and data",
      ],
    },
  },
];
