/**
 * SCHOOL D — DATA ANALYSIS (D1–D9)
 * Data analytics fundamentals, data collection, data cleaning, data
 * transformation, exploratory data analysis, business analytics, Excel,
 * analytical thinking, and end-to-end case studies.
 *
 * The school teaches one craft: turning raw, messy reality into honest
 * answers — question → collect → clean → transform → explore → answer →
 * communicate.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolD: SubjectDef[] = [
  {
    slug: "data-analytics-fundamentals",
    school: "D",
    code: "D1",
    title: "Data Analytics Fundamentals",
    blurb: "What analysts actually do — turn a vague business question into an honest, decision-ready answer.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["python"],
    softPrerequisites: [],
    objectives: [
      "Explain what data analysts do and how the role differs from data science and business intelligence",
      "Turn a vague stakeholder request into a sharp, answerable question",
      "Evaluate metrics for validity, actionability, and honesty",
      "Match tools and deliverables to the audience and the decision at stake",
      "Apply honesty, privacy, and reproducibility habits from your very first analysis",
    ],
    outcomes: [
      "A learner can translate a vague stakeholder request into a specific, answerable analytical question",
      "A learner can critique a metric against good-metric criteria and propose a better alternative",
      "A learner can choose the right tool and deliverable format for a given analysis task",
      "A learner can spot common dishonest-analysis patterns and explain the fix",
    ],
    modules: [
      mod(
        "The Analyst's World",
        "What data analysts actually do all day — and how the role relates to data science and business intelligence.",
        ["Describe the analyst's job, workflow, and neighboring roles", "Turn a vague ask into a sharp question"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("What Analysts Actually Do", "The real work behind the job title", [
            L("A Day in the Life of an Analyst", 25, ["analysis workflow", "stakeholders", "ad hoc request"], "Follow one analyst through requests, meetings, and deliverables — the real shape of the job."),
            L("Analytics vs Data Science vs BI", 30, ["data analytics", "data science", "business intelligence"], "Draw the borders between three overlapping job titles — and why the borders keep moving."),
            L("The Question-Data-Analysis-Decision Loop", 30, ["analysis loop", "decision", "framing"], "Every real analysis runs this loop — learn to feel where you are inside it."),
          ]),
          ch("From Vague Ask to Sharp Question", "Interrogating requests until they become answerable", [
            L("Anatomy of an Analysis Request", 30, ["request", "scoping", "ambiguity"], "Dissect a real-world request to find the question hiding inside it.", "worked-example", 3),
            L("Sharpening: From Vague to Testable", 35, ["testable question", "operationalization", "metric"], "Watch a fuzzy question get sharpened into something data can actually answer.", "guided-practice", 3),
            L("When the Answer Is 'We Don't Have That Data'", 25, ["data feasibility", "honesty", "scoping"], "Saying no honestly — and offering the nearest answer the data can support.", "reading"),
          ]),
        ]
      ),
      mod(
        "Metric Thinking",
        "Numbers that mean something — how analysts measure the world without fooling themselves.",
        ["Judge whether a metric is valid and actionable", "Build a metric tree that decomposes a goal"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch("What Makes a Good Metric", "Validity, actionability, and the vanity trap", [
            L("Counts, Rates, and Ratios", 30, ["count", "rate", "ratio", "denominator"], "Why rates beat raw counts — and how to spot a missing denominator.", "worked-example"),
            L("Vanity Metrics and Their Telltale Signs", 30, ["vanity metric", "total registered users", "growth"], "Metrics that only go up — and what they hide by going up.", "worked-example", 3),
            L("Leading vs Lagging Indicators", 25, ["leading indicator", "lagging indicator", "forecast"], "Signals that predict versus signals that confirm — a good metric stack needs both."),
          ]),
          ch("From Goal to Metric Tree", "Decomposing a north star into measurable pieces", [
            L("North Star Metrics and Their Supporting Cast", 30, ["north star metric", "input metric", "supporting metric"], "One metric to steer by — and the tree of smaller metrics that feed it.", "worked-example"),
            L("Building a Metric Tree, Step by Step", 35, ["decomposition", "metric tree", "driver analysis"], "Break monthly revenue into traffic, conversion, and order value — then keep going.", "guided-practice", 3),
            L("Auditing a Metric Tree for Holes", 30, ["audit", "coverage", "ownability"], "Check every branch: measurable, owned by someone, and actually causing the goal.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The Analyst's Toolkit",
        "Spreadsheets, SQL, Python, and BI tools — what each is genuinely good at, and how to choose.",
        ["Map the analyst's tool landscape honestly", "Choose the right tool and deliverable for a task"],
        ["concept-check", "design-review", "case-analysis"],
        [
          ch("The Tool Landscape", "What each tool is actually for", [
            L("Spreadsheets, SQL, and Python: Who Does What", 30, ["spreadsheets", "SQL", "Python", "BI tools"], "The honest division of labor among the four workhorses of analysis."),
            L("Notebooks, Dashboards, and Reports", 30, ["notebook", "dashboard", "report"], "Where work happens versus where answers get delivered — and why they differ."),
            L("Choosing the Right Tool for the Job", 30, ["tool choice", "reproducibility", "scale"], "A decision guide: data size, repetition, audience, and stakes.", "guided-practice"),
          ]),
          ch("Deliverables and Audiences", "Answers shaped for the people who use them", [
            L("Know Your Audience: Exec, Manager, Peer", 25, ["audience", "detail level", "executive summary"], "The same finding, told three ways — and why the executive version is shortest."),
            L("The One-Page Analysis Memo", 35, ["memo", "structure", "recommendation first"], "Question, answer, evidence, caveats: the format that survives a busy inbox.", "worked-example", 3),
            L("Reviewing a Deliverable Like a Critic", 30, ["review", "clarity", "honesty check"], "A checklist review of a real memo — what earns trust and what loses it.", "review", 3),
          ]),
        ]
      ),
      mod(
        "Ethics and Honesty in Analysis",
        "The habits that keep analysts trusted — honesty, privacy, and reproducibility.",
        ["Recognize dishonest-analysis patterns and their fixes", "Protect the people behind the data"],
        ["case-analysis", "concept-check", "design-review"],
        [
          ch("Honest Analysis", "The many ways analysis lies — and the antidotes", [
            L("Why Analysis Lies", 30, ["bias", "incentive", "honesty"], "Pressure, ambiguity, and shortcuts: how good people publish bad numbers."),
            L("Cherry-Picking, Truncated Axes, and Other Sins", 35, ["cherry-picking", "truncated axis", "misleading chart"], "A tour of the classic deception patterns — accidental and otherwise.", "worked-example", 3),
            L("Stating Uncertainty Without Hedging", 30, ["uncertainty", "confidence", "communication"], "Say what you know, how sure you are, and what would change your mind."),
          ]),
          ch("Data About People", "Privacy, consent, and reproducibility as craft", [
            L("Working with Data About People", 30, ["personal data", "consent", "minimization"], "The analyst's privacy duties: minimize, mask, and respect why the data was collected.", "reading"),
            L("Reproducibility: Rerun by a Stranger", 30, ["reproducibility", "documentation", "re-run"], "Could a teammate rerun your analysis next quarter and get the same answer?"),
            L("Checkpoint: Write Your First Analysis Charter", 40, ["analysis charter", "question", "scope"], "Pull it all together: a charter for a real analysis, from question to audience.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Analytics Fundamentals Final", 45, 20),
    projects: [
      proj(
        "The Analysis Charter",
        "Pick a real question from your work or life and write a one-page analysis charter: the sharp question, the decision it informs, the metrics involved, the data you would need, and the deliverable you would ship.",
        3,
        "guided",
        ["A one-page charter naming question, decision, and audience", "A metric list with a good-metric critique of each", "A data-needs section marking what exists and what is missing"],
        ["Question is specific and answerable, not vague", "Every metric passes the good-metric checklist", "Deliverable format matches the named audience"],
        ["Google Docs", "pen and paper"]
      ),
      proj(
        "First Pass: From Question to Answer",
        "Take a small public dataset, sharpen three questions about it, and answer one end to end in a Python script or notebook: a first-pass check of the data, one supporting computation or chart, and a one-paragraph honest answer with its main caveat.",
        6,
        "independent",
        ["A script or notebook that runs top to bottom", "Three sharpened questions, one answered with evidence", "A one-paragraph answer with its main caveat stated"],
        ["Question quality: specific, answerable, decision-relevant", "The evidence actually supports the stated answer", "Caveats named honestly rather than hidden"],
        ["Python", "csv"]
      ),
    ],
    placementEligible: true,
    keywords: ["data analytics", "analyst", "metrics", "metric tree", "business intelligence", "analysis workflow"],
  },
  {
    slug: "data-collection",
    school: "D",
    code: "D2",
    title: "Data Collection",
    blurb: "Where data actually comes from — files, APIs, surveys, and third parties — and how to collect it responsibly.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["data-analytics-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Identify and evaluate data sources by structure, ownership, and trustworthiness",
      "Work with CSV, JSON, Excel, and parquet files and their quirks",
      "Collect data from public APIs politely, with rate limits and caching",
      "Judge when web scraping is ethical and legal — and when it is not",
      "Document provenance so others can trust and retrace your data",
    ],
    outcomes: [
      "A learner can choose the right file format for a dataset and justify the choice",
      "A learner can write a paginated, rate-limited collection script against a public API",
      "A learner can document a dataset in a data dictionary with provenance notes",
      "A learner can recognize personal data and explain the consent questions it raises",
    ],
    modules: [
      mod(
        "Where Data Comes From",
        "The source landscape: files, databases, APIs, logs, and the people who sell data.",
        ["Classify sources by structure and ownership", "Assess a source's fitness for a question"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch("The Source Landscape", "Files, databases, APIs, logs, and third parties", [
            L("Files, Databases, APIs, and Logs", 30, ["data source", "database", "API", "log data"], "The four places data is born — and the shape it arrives in from each."),
            L("First-Party, Second-Party, and Third-Party Data", 30, ["first-party data", "second-party data", "third-party data"], "Who collected it, why, and what that means for how much you should trust it."),
            L("The Hidden Cost of Free Data", 25, ["data licensing", "fitness for use", "data quality"], "Free datasets cut corners somewhere — the analyst's job is finding where.", "reading"),
          ]),
          ch("Shapes of Data", "Structured, unstructured, and everything in between", [
            L("Structured vs Unstructured vs Semi-Structured", 30, ["structured data", "unstructured data", "semi-structured"], "Rows and columns, free text, and the JSON-shaped middle ground."),
            L("Rows, Documents, and Streams", 30, ["tabular data", "document data", "streaming data"], "Three mental shapes for data — and the tools each shape expects."),
            L("Classifying Real Sources", 30, ["source audit", "classification", "fitness for purpose"], "Take five real datasets and classify what they are — and aren't — good for.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Formats and Their Quirks",
        "CSV, JSON, Excel, and parquet — what each format is good at, and where it bites.",
        ["Parse common formats with their quirks in mind", "Choose the right format for storage and exchange"],
        ["concept-check", "debug", "dataset-task"],
        [
          ch("Text Formats", "CSV and JSON: the lingua franca of data exchange", [
            L("CSV: Simple, Everywhere, Dangerous", 30, ["CSV", "delimiter", "quoting"], "The world's most popular format — and its quoting, encoding, and delimiter traps.", "code"),
            L("JSON: Nested Data for APIs", 30, ["JSON", "nested data", "parsing"], "Arrays, objects, and nesting — reading API responses without fear.", "code"),
            L("When CSV Parsing Breaks", 30, ["embedded commas", "escaped quotes", "csv module"], "Commas inside fields, quotes inside quotes: repair a real broken parse.", "worked-example", 3),
          ]),
          ch("Spreadsheets and Columnar Files", "Excel for humans, parquet for scale", [
            L("Excel Files: Sheets, Types, and Silent Corruption", 30, ["xlsx", "cell types", "import"], "What Excel does to your data when you are not looking — and how to survive import.", "concept"),
            L("Parquet: Columnar Storage for Analytical Data", 30, ["parquet", "columnar storage", "compression"], "Why big analytical data lives in columns: types, compression, and read speed."),
            L("Choosing a Format for the Job", 30, ["format choice", "exchange", "storage"], "A decision guide: human editing, API exchange, or heavy repeated analysis.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "Collecting Data Yourself",
        "APIs, web scraping, and surveys — getting the data no one handed you.",
        ["Collect from APIs responsibly and reproducibly", "Judge scraping and survey designs ethically"],
        ["write-code", "case-analysis", "concept-check", "design-review"],
        [
          ch("Collecting from APIs", "The polite, robust way to pull data", [
            L("How REST APIs Serve Data", 30, ["REST API", "endpoint", "HTTP methods"], "Endpoints, parameters, and responses — the grammar every API shares."),
            L("Your First API Collection Script", 35, ["requests", "JSON response", "API key"], "Pull a real public dataset with Python and save the raw responses to disk.", "code", 3),
            L("Rate Limits, Pagination, and Retries", 35, ["rate limit", "pagination", "backoff"], "Collect everything without hammering the server — loops, pages, and polite pauses.", "code", 3),
          ]),
          ch("Web Scraping, Gently", "When scraping is right — and when it is wrong", [
            L("When Scraping Is the Right Answer", 25, ["web scraping", "robots.txt", "terms of service"], "The checklist that decides whether scraping is ethical, legal, and worth the effort.", "reading"),
            L("Polite Scraping Habits", 30, ["throttling", "user agent", "caching"], "Identify yourself, slow down, cache — the etiquette of taking data from websites."),
          ]),
          ch("Asking Humans: Surveys", "Designing questions that collect truth", [
            L("Survey Design Basics", 30, ["survey", "sampling", "question order"], "Population, sample, and wording — the three decisions that shape every survey."),
            L("Writing Questions That Don't Lead", 30, ["leading question", "neutral wording", "response options"], "Fix the questions that quietly tell respondents what to answer.", "worked-example", 3),
            L("Who Actually Answers?", 25, ["response bias", "non-response", "coverage"], "Self-selection and silence: why your respondents are never 'everyone'."),
          ]),
        ]
      ),
      mod(
        "Provenance, Consent, and Documentation",
        "Writing down where data came from — and respecting the people inside it.",
        ["Document datasets other analysts can trust", "Handle personal data with consent in mind"],
        ["dataset-task", "case-analysis", "concept-check"],
        [
          ch("Provenance and Documentation", "The paper trail behind every trustworthy number", [
            L("Provenance: Where Did This Number Come From?", 30, ["provenance", "lineage", "audit trail"], "The questions that trace any figure back to its source in four hops."),
            L("The Data Dictionary", 30, ["data dictionary", "column documentation", "units"], "Every column, defined: meaning, units, allowed values, and known sins.", "worked-example"),
            L("Versioning Data Snapshots", 25, ["snapshot", "versioning", "immutability"], "Why 'final_v2_really_final.csv' is a bug — and what to do instead."),
          ]),
          ch("Consent and Privacy", "Data about people is a responsibility", [
            L("Personally Identifiable Information", 30, ["PII", "direct identifiers", "quasi-identifiers"], "Names, emails, and the sneaky combinations that re-identify 'anonymous' rows.", "concept", 3),
            L("Consent and Lawful Basis", 30, ["consent", "GDPR", "data minimization"], "What regulations like GDPR demand — and the habits that satisfy them anywhere."),
            L("Checkpoint: Document a Real Dataset", 40, ["data dictionary", "provenance", "privacy review"], "A full dossier on a real dataset: provenance, dictionary, and privacy flags.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Collection Final", 45, 18),
    projects: [
      proj(
        "Dataset Provenance Dossier",
        "Find a public dataset that interests you and produce a dossier a teammate could rely on: provenance notes, a complete data dictionary, the format quirks you found, and a fitness verdict for a stated analysis question.",
        4,
        "guided",
        ["A provenance section tracing the dataset to its origin", "A data dictionary covering every column", "A fitness-for-purpose verdict with reasons"],
        ["Provenance is specific — sources, dates, licenses — not vibes", "Dictionary covers meaning, units, and known issues per column", "Fitness verdict references the actual analysis question"],
        ["Python", "Jupyter"]
      ),
      proj(
        "API Collection Pipeline",
        "Build a small collection pipeline against a public API: paginate through at least 200 records, respect rate limits, cache raw responses to disk untouched, and finish with one tidy CSV plus a log of exactly what you collected and when.",
        6,
        "independent",
        ["A Python script that collects, caches, and converts to CSV", "Raw responses cached untouched on disk", "A collection log: endpoint, parameters, timestamps, record counts"],
        ["Pagination handled correctly — record counts reconcile with the API's own totals", "Rate limits respected with visible pauses or backoff", "Re-running the script reproduces the same tidy output from cache"],
        ["Python", "requests"]
      ),
    ],
    placementEligible: true,
    keywords: ["data collection", "data formats", "APIs", "provenance", "surveys", "web scraping", "parquet"],
  },
  {
    slug: "data-cleaning",
    school: "D",
    code: "D3",
    title: "Data Cleaning",
    blurb: "Real data arrives broken — learn to diagnose missing values, duplicates, and corrupted types, and to clean them without lying.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["data-collection", "pandas"],
    softPrerequisites: [],
    objectives: [
      "Diagnose missingness and choose between dropping and imputing deliberately",
      "Deduplicate, coerce, and canonicalize columns with pandas",
      "Repair datetimes and character encodings that arrived broken",
      "Triage outliers instead of deleting them reflexively",
      "Enforce validation rules and keep a cleaning log for every decision",
    ],
    outcomes: [
      "A learner can audit a raw dataset and produce a missingness and quality report",
      "A learner can write a reproducible cleaning script in which every decision is logged",
      "A learner can encode validation assertions that fail loudly on bad data",
      "A learner can defend each cleaning choice — drop, fix, or flag — to a skeptical reviewer",
    ],
    modules: [
      mod(
        "Missing Values",
        "NaN is not nothing — diagnose why data is missing before you touch it.",
        ["Classify missingness and choose a response", "Impute without inventing signal"],
        ["concept-check", "dataset-task", "interpret-results"],
        [
          ch("The Taxonomy of Missing", "Not every blank is the same kind of blank", [
            L("NaN, None, and NaT: A Field Guide", 30, ["NaN", "None", "NaT", "isna"], "The three pandas missing-value markers and how to detect each.", "code"),
            L("Missing, Unknown, or Not Applicable?", 30, ["missingness semantics", "sentinel value", "null"], "Cancelled orders have no delivery date — semantics your cleaning code must respect."),
            L("Mapping Missingness Patterns", 35, ["missingness pattern", "correlated missingness", "column audit"], "Which columns go missing together — and why that pattern matters more than the count.", "code", 3),
          ]),
          ch("Drop or Impute", "The two big decisions, made deliberately", [
            L("dropna: When Throwing Rows Away Is Right", 30, ["dropna", "subset", "survivorship risk"], "Drop honestly: by rule, by column, and always with a counted record.", "code", 3),
            L("fillna and Simple Imputation", 35, ["fillna", "imputation", "median imputation"], "Fill with mean, median, or a sentinel — and know what each choice assumes.", "code", 3),
            L("When the Mean Lies: Imputation Pitfalls", 30, ["imputation bias", "skew", "downstream impact"], "Imputing incomes with the mean drags everyone toward the middle — harm done politely.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Duplicates, Types, and Strings",
        "The routine repair work: dedupe, coerce, and canonicalize until the table means what it says.",
        ["Deduplicate with explicit keys and rules", "Coerce types and canonicalize strings"],
        ["dataset-task", "write-code", "debug"],
        [
          ch("Duplicates and Types", "Same row twice, wrong type everywhere", [
            L("Duplicates: Exact, Fuzzy, and Sneaky", 35, ["duplicated", "drop_duplicates", "subset"], "Find the doubles that share a key but disagree on the details.", "code", 3),
            L("astype and Type Coercion", 30, ["astype", "dtype", "coercion error"], "Convert the right way — and read the error when conversion refuses.", "code", 3),
            L("When '8' Is Not 8: Object Column Nightmares", 30, ["object dtype", "mixed types", "type audit"], "Numbers as strings, strings as numbers — auditing what a column really contains.", "worked-example"),
          ]),
          ch("Strings and Categories", "One spelling per thing, please", [
            L("The str Accessor Essentials", 30, ["str accessor", "strip", "lower", "replace"], "Trim, case-fold, and replace your way to comparable strings.", "code", 3),
            L("Canonicalization: One Spelling per Category", 35, ["canonicalization", "mapping dict", "category consolidation"], "Turn 'NY', 'New York', and 'new york ' into one honest value.", "code", 3),
            L("Taming Inconsistent Categories", 30, ["value_counts audit", "fuzzy match", "long tail"], "A 60-value country column walks into your notebook — consolidate it.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Datetimes, Encodings, and Outliers",
        "The three classic corruptors — broken dates, mojibake, and extreme values — and how to triage them.",
        ["Parse and repair dates and encodings", "Triage outliers with investigation, not deletion"],
        ["write-code", "interpret-results", "case-analysis"],
        [
          ch("Datetime Disasters", "Dates break in more ways than any other type", [
            L("Parsing Dates with to_datetime", 30, ["to_datetime", "format", "errors"], "Parse deliberately — pass the format, and decide what happens on failure.", "code", 3),
            L("Mixed Formats and Ambiguous Dates", 30, ["mixed formats", "dayfirst", "errors='coerce'"], "Is 03/04/2024 March 4th or April 3rd? Ambiguity is a data problem, not a flag.", "worked-example"),
            L("Timezones: The Silent Corruptor", 30, ["timezone", "UTC", "naive timestamp"], "Naive timestamps, tz-aware timestamps, and the hour that vanished.", "code"),
          ]),
          ch("Encoding Errors and Outlier Triage", "Mojibake in, garbage out — and values that look wrong but aren't", [
            L("Character Encodings and the Mojibake Zoo", 30, ["UTF-8", "Latin-1", "mojibake"], "Strings of accented gibberish were decoded with the wrong charset — diagnose and repair.", "code"),
            L("Outlier Triage: Investigate, Fix, or Flag", 30, ["outlier", "triage", "business context"], "A $1M order might be a typo or a bulk contract — the right response differs.", "worked-example", 3),
            L("The IQR Screen in pandas", 30, ["IQR rule", "quantile", "boolean mask"], "Flag extreme values mechanically, then judge them humanly.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Validation and the Cleaning Log",
        "Clean data stays clean only when assertions guard it and every decision is written down.",
        ["Encode validation rules that fail loudly", "Keep a cleaning log a stranger can replay"],
        ["write-code", "design-review", "dataset-task"],
        [
          ch("Validation Rules and Asserts", "Trust, but verify — automatically", [
            L("Writing Assertions That Guard Your Data", 30, ["assert", "sanity check", "fail fast"], "Row counts, ranges, uniqueness — assertions that catch corruption early.", "code", 3),
            L("Schema-Style Validation Checks", 35, ["schema check", "dtype check", "allowed values"], "Check every column's type, range, and allowed values after cleaning.", "code", 3),
            L("Expectation-Style Validation Thinking", 30, ["data expectations", "data contract", "monitoring"], "The industry pattern: name your expectations for the data and test against them."),
          ]),
          ch("The Cleaning Log Discipline", "Your cleaning decisions, written for a reviewer", [
            L("Why Every Decision Belongs in the Log", 25, ["cleaning log", "auditability", "reproducibility"], "The log is what makes cleaning science instead of vandalism.", "reading"),
            L("A Reproducible Cleaning Script", 40, ["cleaning script", "pipeline", "before-after counts"], "One script, raw to clean, with row counts logged at every step.", "code", 3),
            L("Checkpoint: Clean, Validate, Document", 45, ["full clean", "validation", "cleaning log"], "Take a genuinely messy table end to end: audit, clean, validate, log.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Cleaning Final", 50, 20),
    projects: [
      proj(
        "Clean a Real Messy Retail Dataset",
        "You receive a deliberately realistic retail export — broken dates, duplicated orders, inconsistent category spellings, sentinel values, and one genuine outlier. Clean it in a reproducible pandas script and ship the cleaning log alongside the tidy output.",
        8,
        "independent",
        ["A cleaning script that runs raw-to-clean without manual steps", "A tidy CSV or parquet output", "A cleaning log: every decision, row counts before and after", "Validation asserts that pass on the final output"],
        ["No silent drops — every removed row is counted and justified", "Missing values handled with a stated reason, not a reflex", "The log lets a reviewer replay every decision", "The final data passes the validation suite"],
        ["Python", "pandas", "Jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["data cleaning", "missing values", "pandas", "duplicates", "data quality", "validation", "data types"],
  },
  {
    slug: "data-transformation",
    school: "D",
    code: "D4",
    title: "Data Transformation",
    blurb: "Reshape, merge, aggregate, and derive — turn cleaned tables into the exact shape each analysis needs.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["data-cleaning"],
    softPrerequisites: [],
    objectives: [
      "Reshape data between long and wide forms without losing rows",
      "Merge tables with the right join type and validate the keys",
      "Aggregate with groupby and pivot like an analyst, not a spreadsheet jockey",
      "Derive honest features: ratios, datetime parts, and bins",
      "Chain transformations into readable, reproducible pipelines",
    ],
    outcomes: [
      "A learner can explain tidy data and reshape a real table into it",
      "A learner can predict and verify row counts before and after any merge",
      "A learner can build a groupby pipeline with named aggregations",
      "A learner can normalize or standardize a column and explain when each is right",
    ],
    modules: [
      mod(
        "Reshaping Data",
        "Long or wide, tidy or tangled — reshape tables so each analysis gets the shape it needs.",
        ["Recognize tidy data and why it matters", "Reshape between long and wide without losing rows"],
        ["concept-check", "predict-output", "dataset-task"],
        [
          ch("Tidy Data", "The shape analysis tools expect", [
            L("What Tidy Data Looks Like", 30, ["tidy data", "observation", "variable"], "One row per observation, one column per variable — the shape tools assume."),
            L("Three Ways Tables Go Untidy", 30, ["wide format", "values in column names", "merged cells"], "Diagnose the three classic untidy patterns on sight."),
            L("Spotting Untidy Tables in the Wild", 30, ["shape audit", "reshaping plan", "row-count check"], "Audit four real tables and prescribe the reshaping each needs.", "guided-practice", 3),
          ]),
          ch("melt, pivot, and the Rest", "The pandas reshaping verbs", [
            L("melt: Wide to Long", 35, ["melt", "id_vars", "value_vars"], "Collapse year columns into a tidy year-value layout.", "code", 3),
            L("pivot and pivot_table", 35, ["pivot", "pivot_table", "index and columns"], "Spread long data back into wide — with aggregation when rows collide.", "code", 3),
            L("When Reshaping Silently Loses Data", 30, ["duplicate index", "NaN drop", "reshape check"], "pivot's duplicate error, dropped NaNs, and the row-count habit that catches both.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Joins and Merges",
        "Combining tables is where analysis gets powerful — and where silent bugs are born.",
        ["Choose the right join and predict row counts", "Catch and prevent merge fan-out"],
        ["predict-output", "debug", "write-code"],
        [
          ch("merge Fundamentals", "pandas' answer to SQL joins", [
            L("merge: Inner, Left, Right, Outer", 35, ["merge", "how", "join keys"], "The four join types, what each keeps, and the NaNs each leaves behind.", "code", 3),
            L("Merge Keys: One-to-One, One-to-Many", 30, ["merge key", "cardinality", "row count"], "Keys decide row counts — predict the output before you run it."),
            L("Reading a Merge You Didn't Write", 30, ["indicator", "merge audit", "unmatched rows"], "indicator=True and before-after counts: auditing a join you inherited.", "code", 3),
          ]),
          ch("Merge Traps", "The bugs that quietly double your rows", [
            L("Merge Traps: When Joining Doubles Your Rows", 35, ["fan-out", "duplicate keys", "row count check"], "One duplicated key in the right table and your revenue just doubled — prevent it.", "worked-example", 3),
            L("validate=: Catching Bad Merges Before They Bite", 30, ["validate", "one_to_one", "merge guard"], "Make pandas refuse the merges your business rules forbid.", "code", 3),
            L("The NaNs a Left Join Leaves Behind", 30, ["left join", "unmatched", "null propagation"], "Unmatched rows become NaN — and NaN poisons every arithmetic it touches.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Aggregation and Pivots",
        "groupby, pivots, and crosstabs — collapsing thousands of rows into answers.",
        ["Aggregate with groupby and named aggregations", "Build pivot tables and crosstabs that answer real questions"],
        ["write-code", "interpret-results", "dataset-task"],
        [
          ch("groupby Mechanics", "Split-apply-combine, in practice", [
            L("Split-Apply-Combine, Explained", 30, ["groupby", "split-apply-combine", "aggregation"], "What groupby really does — the three-step picture behind the one-liner."),
            L("groupby and agg in Practice", 35, ["agg", "size", "mean by group"], "Per-segment averages, counts, and sums — the daily bread of analysis.", "code", 3),
            L("Named Aggregations for Readable Code", 30, ["named aggregation", "reset_index", "readability"], "Aggregations that name themselves and return a ready-to-use frame.", "code", 3),
          ]),
          ch("Pivot Tables and Crosstabs", "Two-dimensional answers in one call", [
            L("pivot_table: pandas' Pivot Table", 35, ["pivot_table", "aggfunc", "margins"], "Rows by region, columns by quarter, values by revenue — Excel-style, scripted.", "code", 3),
            L("crosstab for Counts and Proportions", 30, ["crosstab", "normalize", "proportions"], "Counts, then percentages — comparing groups fairly with the right denominator.", "code", 3),
            L("Reading a Pivot Without Fooling Yourself", 30, ["interpretation", "margins", "small cells"], "Small cells, misleading margins, and percentage pitfalls in pivot form.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Deriving and Scaling",
        "New columns from old — ratios, datetime parts, bins — and the scaling choices charts and models care about.",
        ["Derive honest features from existing columns", "Normalize or standardize deliberately"],
        ["write-code", "predict-output", "interpret-results"],
        [
          ch("Deriving Features", "The columns your analysis wishes it had", [
            L("Ratios and Flags from Existing Columns", 30, ["ratio", "indicator flag", "derived column"], "Revenue per visitor, is_holiday, discount depth — derived honestly, denominator first.", "code", 3),
            L("Datetime Features: Day, Weekday, Month", 30, ["dt accessor", "dayofweek", "period"], "Unpack timestamps into the parts your questions actually use.", "code", 3),
            L("Binning Continuous Data with cut", 30, ["cut", "qcut", "binning"], "Turn ages into age groups — equal-width versus equal-frequency bins.", "code", 3),
          ]),
          ch("Scaling and Chaining", "Comparable numbers and readable pipelines", [
            L("Normalization vs Standardization", 30, ["min-max scaling", "z-score", "scaling choice"], "Squash to [0, 1] or recenter to mean 0 — when each is the right tool."),
            L("Method Chaining with assign", 35, ["method chain", "assign", "readability"], "Build transformation pipelines that read like sentences.", "code", 3),
            L("Copy vs View: The SettingWithCopyWarning", 30, ["SettingWithCopyWarning", "copy", "chained indexing"], "Why chained assignment sometimes silently does nothing — and the .loc fix.", "code", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Transformation Final", 50, 20),
    projects: [
      proj(
        "Monthly Revenue Rollup",
        "From raw orders, customers, and products files, build a monthly revenue rollup: merge the tables safely, aggregate by month and segment, and finish with a tidy long table plus a quarter-by-segment pivot with margins.",
        5,
        "guided",
        ["A script that merges and checks row counts at each step", "A tidy monthly long table (month, segment, revenue)", "A quarter-by-segment pivot table with margins"],
        ["Every merge passes a validate= guard", "Rollup numbers reconcile with the raw totals", "Output tables are tidy and documented"],
        ["Python", "pandas", "Jupyter"]
      ),
      proj(
        "Feature Factory",
        "Starting from a cleaned orders or events dataset, derive and document six analysis-ready features — at least one ratio, one datetime feature, one bin, and one normalized column — and show with before-and-after summaries that each derivation behaved.",
        6,
        "independent",
        ["A documented feature-derivation script", "Six derived features with definitions in a data dictionary", "Before-and-after sanity summaries for each feature"],
        ["Ratios use correct denominators (aggregate, then divide)", "Datetime features verified against the calendar", "Scaling choice justified per column"],
        ["Python", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["data transformation", "pandas", "merge", "groupby", "pivot table", "tidy data", "feature derivation"],
  },
  {
    slug: "exploratory-data-analysis",
    school: "D",
    code: "D5",
    title: "Exploratory Data Analysis",
    blurb: "Disciplined curiosity — run a structured first pass, chart with intent, segment before you conclude, and know when to stop.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["data-transformation", "descriptive-statistics"],
    softPrerequisites: [],
    objectives: [
      "Run a structured first pass over any unfamiliar dataset",
      "Describe distributions and relationships with the right chart and the right words",
      "Segment analyses to answer the same question across groups",
      "Document findings so a teammate can verify them",
      "Recognize when exploration has answered the question — and stop",
    ],
    outcomes: [
      "A learner can produce a structured first-pass report (shape, types, missingness, summaries) with pandas",
      "A learner can choose the correct chart for a variable pair and justify the choice",
      "A learner can run a segmented analysis and report segment-level differences honestly",
      "A learner can write an EDA log that another analyst can pick up and continue",
    ],
    modules: [
      mod(
        "The EDA Mindset",
        "Exploratory data analysis is disciplined curiosity — look at data to find the questions worth answering.",
        ["Run a structured first pass on any dataset", "Work the question-chart-insight loop"],
        ["concept-check", "interpret-results", "case-analysis"],
        [
          ch("Exploration with Intent", "EDA is a method, not wandering", [
            L("EDA: Looking at Data to Find Questions", 30, ["EDA", "Tukey", "exploration"], "Why exploring before confirming is not optional — the case John Tukey made."),
            L("Hypothesis-Driven vs Fishing Expeditions", 30, ["hypothesis", "exploration discipline", "spurious pattern"], "Follow leads deliberately — or drown in a sea of random-looking patterns."),
            L("The First-Pass Ritual", 35, ["shape", "dtypes", "describe", "missingness"], "shape, dtypes, head, describe, missing counts — the five-move opening every dataset deserves.", "code", 3),
          ]),
          ch("The Question-Chart-Insight Loop", "Charts earn their place by answering something", [
            L("Ask the Chart a Question", 30, ["chart choice", "intent", "question"], "Every chart should answer a question you can state out loud."),
            L("From Chart to Insight Sentence", 30, ["insight", "observation vs interpretation", "evidence"], "Write what you see, then what it means — and keep the two apart.", "worked-example", 3),
            L("Follow-Up Questions That Matter", 30, ["iteration", "drill-down", "dead ends"], "Which follow-ups would change the decision — and which are just curiosity?", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "One Variable at a Time",
        "Distributions, shapes, and categories — know each column before you let them meet.",
        ["Describe a distribution's shape in words and charts", "Summarize categorical columns honestly"],
        ["dataset-task", "interpret-results", "write-code"],
        [
          ch("Numeric First Pass", "Histograms, skew, and the summary numbers", [
            L("Histograms and Binning Choices", 35, ["histogram", "bin width", "bin count"], "The same data, three bin widths, three different stories — choose deliberately.", "code", 3),
            L("Skew, Tails, and Modes", 30, ["skewness", "long tail", "bimodal"], "Name the shape: skewed, heavy-tailed, two-peaked — shape drives which statistics apply."),
            L("When the Mean and Median Disagree", 30, ["mean vs median", "skew", "outlier pull"], "The disagreement is a finding, not a nuisance — learn to read it.", "worked-example", 3),
          ]),
          ch("Categorical First Pass", "Value counts, the long tail, and cardinality", [
            L("value_counts and the Long Tail", 30, ["value_counts", "long tail", "rare categories"], "Top values, the tail, and the bucket of misfits you must not ignore.", "code", 3),
            L("Bar Charts That Tell Category Truth", 25, ["bar chart", "ordering", "frequency"], "Sorted bars, honest baselines, and when an 'Other' bucket is a duty.", "code"),
            L("Cardinality: How Many Categories Is Too Many?", 30, ["cardinality", "grouping", "display limits"], "Two hundred countries on one chart is not a chart — it's wallpaper.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Two Variables at a Time",
        "Relationships: numeric-numeric, numeric-categorical, categorical-categorical — and the segments that flip the story.",
        ["Chart the right plot for each variable pair", "Segment analyses and catch reversals"],
        ["write-code", "interpret-results", "case-analysis"],
        [
          ch("Numeric vs Numeric", "Scatter plots, correlation, and their limits", [
            L("Scatter Plots and Relationship Shapes", 35, ["scatter plot", "trend", "association"], "Linear, curved, funnel, and flat — read the shape before the number.", "code", 3),
            L("Correlation: What It Says and Doesn't", 30, ["correlation coefficient", "linear relationship", "correlation fallacy"], "One number that captures straight-line association — and nothing else.", "concept", 3),
            L("When Aggregates Lie: Simpson's Paradox", 35, ["Simpson's paradox", "aggregation", "confounding"], "The trend that reverses when you segment — EDA's most important warning.", "worked-example", 3),
          ]),
          ch("Mixed Types and Segmentation", "Grouped summaries, crosstabs, and same-question-different-slices", [
            L("Numeric by Category: Grouped Summaries and Box Plots", 35, ["groupby describe", "box plot", "group comparison"], "Compare distributions across groups without collapsing them to averages.", "code", 3),
            L("Two Categoricals: Crosstabs and Proportions", 30, ["crosstab", "row proportions", "association"], "Counts mislead across unequal groups — proportions compare fairly.", "code", 3),
            L("Segmented Analysis: Same Question, Different Slices", 35, ["segmentation", "slice consistency", "segment stability"], "Does the answer hold for new users and returning users? Mobile and desktop?", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Documenting and Finishing",
        "Findings that aren't written down didn't happen — and exploration must end before it becomes procrastination.",
        ["Keep an EDA log others can verify", "Decide when exploration is done"],
        ["design-review", "case-analysis", "concept-check"],
        [
          ch("Writing It Down", "The EDA log and the findings report", [
            L("The EDA Log: Findings as You Find Them", 30, ["EDA log", "reproducibility", "evidence trail"], "Question, chart, finding, next step — four lines that make exploration reviewable."),
            L("From Log to Report: Keep, Cut, Collapse", 30, ["report structure", "audience", "signal vs noise"], "Twenty exploratory charts become three exhibits and one message.", "worked-example"),
            L("Annotating Charts So They Explain Themselves", 30, ["annotation", "finding-based titles", "labeling"], "Titles that state the finding, not the variables — charts that argue.", "guided-practice", 3),
          ]),
          ch("Knowing When to Stop", "Converging on answers instead of charts", [
            L("When to Stop Exploring and Start Answering", 30, ["stopping rule", "diminishing insight", "decision focus"], "Stop when more charts stop changing the answer — a rule you can defend."),
            L("The EDA Checklist", 30, ["checklist", "coverage", "gaps"], "The exit interview for your analysis: what's covered, what's missing, what's next.", "review"),
            L("Checkpoint: Full EDA on an Unfamiliar Dataset", 45, ["full EDA", "first pass to findings", "delivery"], "A dataset you've never seen: first pass, two variables, one segment, findings memo.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Exploratory Data Analysis Final", 50, 22),
    projects: [
      proj(
        "First Contact: EDA Notebook",
        "Pick a public dataset you have never worked with and run a complete EDA: the first-pass ritual, a univariate tour, at least three bivariate investigations, one segmented analysis, and a findings section with one chart per finding.",
        6,
        "independent",
        ["A notebook that runs top to bottom after restart", "A documented first-pass section", "At least three findings, each with an insight sentence and one chart", "A 'what I would explore next' section"],
        ["Charts are chosen to answer stated questions, not to decorate", "Insight sentences separate observation from interpretation", "Segmentation is checked before findings are generalized"],
        ["Python", "pandas", "matplotlib", "Jupyter"]
      ),
      proj(
        "Segmented Deep-Dive",
        "Take one headline metric from a dataset — average order value, session duration, delivery time — and investigate whether it tells the same story across at least three segments; deliver a short memo on where the headline misleads.",
        4,
        "guided",
        ["A memo leading with the headline metric and its caveats", "Segment-level evidence with one chart", "A clear verdict: where the headline holds and where it breaks"],
        ["Segments are chosen for relevance, not convenience", "Segment comparisons use fair denominators", "The memo distinguishes observed difference from explanation"],
        ["Python", "pandas", "Jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["exploratory data analysis", "EDA", "distributions", "correlation", "segmentation", "insight", "Simpson's paradox"],
  },
  {
    slug: "business-analytics",
    school: "D",
    code: "D6",
    title: "Business Analytics",
    blurb: "KPIs, funnels, cohorts, and retention — the analyses businesses actually run, and the communication that gets them acted on.",
    difficulty: "intermediate",
    track: "specialization",
    prerequisites: ["exploratory-data-analysis"],
    softPrerequisites: ["excel"],
    objectives: [
      "Design KPIs and metric trees that drive the right behavior",
      "Analyze funnels, cohorts, and retention from raw event data",
      "Segment customers meaningfully and size the opportunities",
      "Read business experiments with a professional skeptic's eye",
      "Communicate findings to stakeholders in their language",
    ],
    outcomes: [
      "A learner can decompose a north-star metric into an actionable metric tree",
      "A learner can build a monthly cohort retention table and read the curve",
      "A learner can write a one-paragraph executive summary a decision-maker can act on",
      "A learner can define churn or activation defensibly for a given business",
    ],
    modules: [
      mod(
        "KPIs and Metric Trees",
        "Metrics that steer behavior — designing KPIs, north stars, and the trees that support them.",
        ["Design KPIs that drive the right behavior", "Decompose a north star into a metric tree"],
        ["case-analysis", "concept-check", "design-review"],
        [
          ch("Designing KPIs", "From business goal to measurable number", [
            L("KPIs That Drive Behavior", 30, ["KPI", "actionability", "benchmark"], "A KPI is a promise about what matters — design it like one."),
            L("North Star Metrics and Their Supporting Cast", 30, ["north star metric", "input metric", "guardrail"], "One metric that captures delivered value — and the inputs that move it.", "worked-example"),
            L("Goodhart's Law: When the Metric Becomes the Target", 30, ["Goodhart's law", "metric gaming", "proxy failure"], "Optimize the number hard enough and the number stops meaning anything.", "worked-example", 3),
          ]),
          ch("Building Metric Trees", "Decomposition as an analytical instrument", [
            L("Breaking a North Star into a Tree", 35, ["metric tree", "decomposition", "driver"], "Revenue = traffic × conversion × order value — trees that isolate the levers.", "worked-example", 3),
            L("Leading and Lagging Metrics in the Tree", 30, ["leading indicator", "lagging indicator", "intervention"], "Place leading metrics where action is possible, lagging where proof is needed."),
            L("Auditing a Real KPI Dashboard", 35, ["KPI audit", "coverage", "gaming risk"], "A real dashboard, audited: missing branches, gameable leaves, orphan metrics.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Funnels, Cohorts, and Retention",
        "The three workhorse analyses of growth: where users drop off, how groups compare, and who comes back.",
        ["Build funnels, cohort tables, and retention curves", "Define churn and activation defensibly"],
        ["dataset-task", "write-code", "interpret-results"],
        [
          ch("Funnel Analysis", "Counting the drop-offs honestly", [
            L("Funnels: Where Users Fall Out", 35, ["funnel", "step conversion", "drop-off"], "Define the steps, count the survivors, and find the leakiest stage.", "code", 3),
            L("Conversion Rates and Their Denominators", 30, ["conversion rate", "step vs overall", "denominator"], "Step conversion or start-to-finish? The denominator is the analysis.", "concept", 3),
            L("Comparing Funnels Across Time and Channels", 30, ["benchmark", "channel comparison", "trend"], "This month versus last quarter, and the channel that leaks differently.", "guided-practice"),
          ]),
          ch("Cohorts and Retention", "Grouping users by when they arrived", [
            L("Cohort Analysis: Grouping by Start Date", 35, ["cohort", "cohort table", "period"], "January's users versus June's — same product, different generations.", "code", 3),
            L("Retention Curves and the Plateau", 35, ["retention curve", "plateau", "decay"], "Week-by-week decay, the flattening that matters, and reading the slope.", "code", 3),
            L("Defining Churn and Activation Honestly", 30, ["churn definition", "activation", "contract vs usage"], "Churn for contracts, subscriptions, and coffee shops — three different definitions.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Segmentation and Experiment Thinking",
        "Averages hide the business — segment it, and read experiments with a professional skeptic's eye.",
        ["Segment customers into actionable groups", "Read business experiments and guardrails critically"],
        ["dataset-task", "interpret-results", "case-analysis"],
        [
          ch("Customer Segmentation", "Groups you can actually act on", [
            L("Why Averages Hide the Business", 30, ["average customer fallacy", "heterogeneity", "distribution"], "There is no average customer — and pretending otherwise misallocates budget."),
            L("RFM Segmentation, Hands On", 35, ["RFM", "recency", "frequency", "monetary"], "Score every customer on recency, frequency, and monetary value with pandas.", "code", 3),
            L("Choosing Segments That Matter", 30, ["segment design", "actionability", "segment size"], "Segments must be reachable, sized, and different — or they're decoration.", "guided-practice", 3),
          ]),
          ch("Experiment Thinking for Business", "A/B tests without needing a statistics degree to read them", [
            L("A/B Tests for Business Questions", 30, ["A/B test", "randomization", "control"], "Randomization, one change, and a question agreed in advance — the business core.", "concept", 3),
            L("Guardrail Metrics: What You Don't Want to Move", 30, ["guardrail metric", "unintended consequence", "monitoring"], "Ship the faster checkout — but watch refunds and support tickets.", "worked-example", 3),
            L("Reading Experiment Results Like an Analyst", 35, ["practical significance", "effect size", "confidence language"], "Big enough to matter? Consistent across segments? Words that claim only what the data supports.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Communicating with Stakeholders",
        "The best analysis that can't be understood can't be acted on — deliver like a consultant.",
        ["Structure answers so busy people can act", "Choose between dashboards and deep dives"],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("The Communication Craft", "Answers shaped for decision-makers", [
            L("Pyramid Answers: Conclusion First", 30, ["pyramid principle", "answer first", "so-what"], "Lead with the answer, then the three reasons — the structure executives scan.", "concept", 3),
            L("The One-Paragraph Executive Summary", 30, ["executive summary", "action language", "quantify"], "Situation, finding, recommendation — one paragraph, no jargon, real numbers.", "worked-example", 3),
            L("Handling 'That Can't Be Right' Pushback", 30, ["pushback", "data credibility", "re-checking"], "Five calm responses when your number contradicts someone's belief.", "worked-example", 3),
          ]),
          ch("Dashboards vs Deep Dives", "The right vehicle for the question", [
            L("What Dashboards Do Well — and What They Can't", 30, ["dashboard", "monitoring", "alert threshold"], "Dashboards monitor known questions; they don't answer new ones."),
            L("The Deep-Dive Memo Template", 30, ["deep dive", "memo", "structure"], "Question, method, findings, recommendation, appendix — the reusable skeleton.", "worked-example"),
            L("Checkpoint: Build a Mini KPI Pack", 45, ["KPI pack", "mock dashboard", "readout"], "One north star, a three-metric tree, one funnel, and a one-paragraph readout.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Business Analytics Final", 50, 22),
    projects: [
      proj(
        "Retention Cohort Study",
        "Starting from three months of raw order or event data, build monthly cohorts, a retention curve, and a churn definition memo: what you measured, what you excluded, and what the curve says about the business.",
        8,
        "independent",
        ["A cohort table computed from raw events", "A retention curve chart with the plateau called out", "A churn definition memo with exclusions justified", "A one-paragraph executive summary of the finding"],
        ["Cohort logic verified against a hand-computed example", "Churn definition fits the business model and is stated precisely", "The summary leads with the answer and quantifies the pattern"],
        ["Python", "pandas", "matplotlib", "Jupyter"]
      ),
      proj(
        "KPI Pack for a Fictional Startup",
        "Design a KPI pack for a fictional product — a food-delivery app or a language-learning app: one north star, a supporting metric tree, one guardrail per lever, and a mock dashboard sketch describing each panel's question and update cadence.",
        5,
        "guided",
        ["A north star metric with a written justification", "A metric tree diagram with at least two levels", "Guardrail metrics for each major lever", "A dashboard sketch: panels, questions, and refresh cadence"],
        ["Every metric passes the good-metric checklist", "The tree is complete enough to locate any movement in the north star", "Guardrails address the most gameable metrics"],
        ["Excalidraw", "paper"]
      ),
    ],
    placementEligible: true,
    keywords: ["business analytics", "KPI", "funnel analysis", "cohort", "retention", "churn", "segmentation", "A/B testing"],
  },
  {
    slug: "excel",
    school: "D",
    code: "D7",
    title: "Excel",
    blurb: "From first formula to pivot tables — the spreadsheet skills that clean, analyze, and summarize real business data.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Build formulas with relative and absolute references and predict how they fill",
      "Aggregate with SUMIFS and COUNTIFS and branch logic with IF and IFS",
      "Look up data with XLOOKUP and INDEX-MATCH, knowing VLOOKUP's traps",
      "Convert ranges to tables and analyze them with pivot tables and pivot charts",
      "Clean messy sheets and design workbooks others can inherit",
    ],
    outcomes: [
      "A learner can write a mixed-reference formula and predict its behavior when filled",
      "A learner can answer a business question with SUMIFS or a pivot table and justify the choice",
      "A learner can clean a messy sheet using Excel's built-in cleanup tools",
      "A learner can diagnose common error values and floating-point surprises",
    ],
    modules: [
      mod(
        "Spreadsheet Foundations",
        "Cells, ranges, formulas, and references — the mechanics every Excel skill builds on.",
        ["Write formulas that fill correctly", "Organize and format sheets for analysis"],
        ["concept-check", "predict-output", "debug"],
        [
          ch("Cells, Ranges, and Formulas", "The grid and the formulas that bring it to life", [
            L("The Grid: Cells, Ranges, and References", 25, ["cell", "range", "reference"], "A1, B2:D5 — the addressing scheme behind everything in Excel."),
            L("Your First Formulas", 30, ["formula", "operator", "order of operations"], "Arithmetic in cells, editing formulas, and the order of operations.", "code", 3),
            L("Relative vs Absolute References", 35, ["relative reference", "absolute reference", "$ anchor"], "Why $B$4 stays put when you fill — the single most important Excel idea.", "worked-example", 3),
          ]),
          ch("Organizing the Sheet", "Sorting, filtering, and formatting that mean something", [
            L("Sorting and Filtering Properly", 30, ["sort", "filter", "frozen panes"], "Sort whole tables, filter by value, and freeze headers like a pro.", "guided-practice", 3),
            L("Formatting That Means Something", 30, ["conditional formatting", "number formats", "visual hierarchy"], "Color that carries information — and color that just carries on.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "The Core Functions",
        "SUMIFS, COUNTIFS, IF, IFS, XLOOKUP, INDEX-MATCH, and the text and date functions analysts use daily.",
        ["Aggregate by condition and build branching logic", "Look up values with the right function"],
        ["predict-output", "debug", "dataset-task"],
        [
          ch("Conditional Aggregation", "SUMIFS, COUNTIFS, and their criteria quirks", [
            L("SUMIFS and COUNTIFS", 35, ["SUMIFS", "COUNTIFS", "criteria"], "Sum and count only the rows that match — the analyst's workhorse pair.", "code", 3),
            L("Criteria Gotchas: Dates, Wildcards, Text", 30, ["criteria syntax", "wildcard", "date criteria"], "Greater-than criteria, wildcard matches, and the date criteria that silently match nothing.", "worked-example", 3),
            L("AVERAGEIFS and Conditional Averages", 25, ["AVERAGEIFS", "average range", "blank handling"], "Conditional averages — and why blanks and zeros change the answer.", "code"),
          ]),
          ch("Lookups and Logic", "IF, IFS, XLOOKUP, and the old reliable INDEX-MATCH", [
            L("IF, IFS, and Nested Logic", 35, ["IF", "IFS", "nesting"], "Branch inside a cell — and know when nesting has gone too far.", "code", 3),
            L("XLOOKUP and the VLOOKUP Traps It Fixes", 35, ["XLOOKUP", "VLOOKUP", "exact match"], "Look left, default to exact match, return a range — meet the modern lookup.", "code", 3),
            L("INDEX and MATCH: The Old Reliable", 35, ["INDEX", "MATCH", "two-way lookup"], "The combo that worked before XLOOKUP — still everywhere in real files.", "code", 3),
          ]),
          ch("Text and Date Functions", "Cleaning and deriving with functions", [
            L("Text Functions: TRIM, LEFT, MID, TEXTJOIN", 30, ["TRIM", "LEFT", "MID", "TEXTJOIN"], "Split, clean, and rebuild strings without leaving the formula bar.", "code", 3),
            L("Dates Are Serial Numbers", 30, ["date serial", "TODAY", "date math"], "How Excel counts days since 1900 — and why date arithmetic just works.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Tables and Pivot Tables",
        "Structured tables and pivot tables — Excel's superpowers for analysis.",
        ["Turn ranges into structured tables", "Summarize thousands of rows with pivot tables"],
        ["dataset-task", "predict-output", "concept-check"],
        [
          ch("Excel Tables", "Ctrl+T and the structured references that follow", [
            L("Ctrl+T: Tables and Structured References", 30, ["Excel table", "structured reference", "banded rows"], "Tables that grow, filter, and name their columns — once and forever.", "code", 3),
            L("Calculated Columns in Tables", 30, ["calculated column", "fill down", "table formula"], "One formula, every row, automatically — and references that never break.", "code", 3),
          ]),
          ch("Pivot Tables", "Drag-and-drop analysis of any table", [
            L("Your First Pivot Table", 35, ["pivot table", "rows", "values"], "From 10,000 rows to a five-line summary in ninety seconds.", "guided-practice", 3),
            L("Rows, Columns, Values, and Filters", 30, ["pivot fields", "aggregation", "filtering"], "The four drop zones — and choosing sum, count, or average deliberately.", "concept", 3),
            L("Grouping, Slicers, and Pivot Charts", 35, ["grouping", "slicer", "pivot chart"], "Group dates into months, slice by segment, and chart the result.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Cleanup and Spreadsheet Hygiene",
        "The tools that fix imported messes — and the habits that keep workbooks trustworthy.",
        ["Clean imported data with built-in tools", "Diagnose errors and design inheritable workbooks"],
        ["debug", "concept-check", "design-review"],
        [
          ch("Data Cleanup Tools", "Fixing the messes other systems export", [
            L("Text to Columns and Flash Fill", 30, ["Text to Columns", "Flash Fill", "delimiter"], "Split 'Smith, Jane' and pattern-extract without a single formula.", "guided-practice", 3),
            L("Remove Duplicates and Its Fine Print", 30, ["Remove Duplicates", "unique rows", "silent data loss"], "Excel deletes rows silently — choose your key columns with care.", "worked-example", 3),
            L("Go To Special and the Blank Hunt", 25, ["Go To Special", "blanks", "selectors"], "Find blanks, constants, and formulas — the selector power users know.", "guided-practice"),
          ]),
          ch("Spreadsheet Hygiene", "Errors, floating point, and inheritable design", [
            L("Error Values: #N/A, #REF!, #DIV/0!", 30, ["#N/A", "#REF!", "#DIV/0!", "error checking"], "Read the error values like a diagnostic chart — then fix the cause.", "concept", 3),
            L("Floating Point Surprises", 30, ["floating point", "binary precision", "ROUND"], "Why a chain of decimal arithmetic can produce a tiny phantom remainder — and what to do about money math.", "concept", 3),
            L("Designing Workbooks Others Can Inherit", 35, ["workbook design", "input separation", "documentation"], "Inputs here, calculations there, notes everywhere — hygiene as courtesy.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Excel Final", 45, 18),
    projects: [
      proj(
        "Small Business KPI Workbook",
        "Build a workbook for a fictional coffee shop: a sales log stored as a proper table, a KPI sheet computing monthly revenue, average order value, and top products with SUMIFS and COUNTIFS, one pivot table with a pivot chart, and a notes sheet documenting every formula's intent.",
        6,
        "guided",
        ["A sales log stored as an Excel table with clean columns", "A KPI sheet with at least four computed metrics", "One pivot table and pivot chart answering a real question", "A notes sheet explaining each formula to a successor"],
        ["Formulas use correct references and survive filling and copying", "KPIs use the right denominators (averages, not sums of sums)", "The workbook separates inputs, calculations, and output"],
        ["Excel"]
      ),
    ],
    placementEligible: true,
    keywords: ["excel", "spreadsheets", "formulas", "pivot tables", "XLOOKUP", "data cleaning"],
  },
  {
    slug: "analytical-thinking",
    school: "D",
    code: "D8",
    title: "Analytical Thinking",
    blurb: "The thinking underneath every analysis — decompose problems, estimate honestly, and refuse to be fooled.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Decompose fuzzy problems into structured, answerable pieces",
      "Build hypothesis trees that are MECE and testable",
      "Estimate quantities from first principles with sanity checks",
      "Interrogate claims for base rates, denominators, and survivorship",
      "Frame every analysis around the decision it will inform",
    ],
    outcomes: [
      "A learner can turn an ambiguous request into a structured analytical plan",
      "A learner can produce a Fermi estimate with explicit assumptions and a plausibility range",
      "A learner can deconstruct a misleading statistic and explain what it hides",
      "A learner can choose a defensible proxy when the real metric cannot be measured",
    ],
    modules: [
      mod(
        "Decomposing Problems",
        "From vague worry to structured question — the first move of every analysis.",
        ["Turn vague requests into sharp questions", "Build MECE hypothesis trees"],
        ["concept-check", "case-analysis", "design-review"],
        [
          ch("From Problem to Question", "Framing before formulas", [
            L("Asking the Right Question", 30, ["question framing", "so-what", "audience"], "The question you answer determines everything downstream — choose it deliberately."),
            L("Decision Framing: What Choice Will This Inform?", 30, ["decision", "reversibility", "stakes"], "Analyses serve choices — find the choice before touching data.", "concept", 3),
            L("The Five Whys of a Vague Request", 30, ["five whys", "root request", "clarification"], "Drill through 'send me a report' to the question being dodged.", "worked-example", 3),
          ]),
          ch("Hypothesis Trees", "Decomposition as an instrument", [
            L("Decomposition: Breaking Problems into Pieces", 30, ["decomposition", "sub-problem", "structure"], "Big questions become answerable when split along clean seams."),
            L("Building a Hypothesis Tree", 35, ["hypothesis tree", "branch logic", "prioritization"], "Sales are down — enumerate the candidate causes, then rank them by testability.", "worked-example", 3),
            L("MECE: Mutually Exclusive, Collectively Exhaustive", 30, ["MECE", "overlapping branches", "coverage check"], "No overlaps, no gaps — the quality bar for every tree you build.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Estimation and Proxies",
        "Numbers from first principles — and honest stand-ins for the numbers you can't have.",
        ["Estimate with explicit assumptions and checks", "Choose proxies that don't drift from their purpose"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("Fermi Estimation", "Order-of-magnitude confidence", [
            L("Fermi Problems: Estimating with Confidence", 35, ["Fermi problem", "order of magnitude", "assumptions"], "How many coffees does this café sell daily? Estimate it from first principles.", "worked-example", 3),
            L("Sanity Checks and Magnitude Sense", 30, ["sanity check", "bounds", "plausibility"], "Is 10 million or 10 billion the right ballpark? Cheap tests before expensive precision."),
            L("Estimation in Business Settings", 30, ["market sizing", "capacity estimate", "ranges"], "Size a market, a queue, or a storage bill — with a range, not a point.", "guided-practice", 3),
          ]),
          ch("Proxy Metrics and Root Causes", "Measuring the unmeasurable, honestly", [
            L("When You Can't Measure the Thing", 30, ["proxy metric", "measurement gap", "substitute"], "You can't measure 'developer productivity' — so what do you measure instead?", "concept", 3),
            L("Proxy Traps: Drift and Gaming", 30, ["proxy drift", "Goodhart's law", "gaming"], "Count lines of code, get lines of code — proxies rot under pressure.", "worked-example", 3),
            L("Root-Cause Thinking: Drilling to the Why", 35, ["root cause", "causal chain", "evidence ladder"], "Symptom, pattern, mechanism — how far down the chain should you drill?", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Skeptical Habits",
        "The standing questions that keep analysts from being fooled — by others or by themselves.",
        ["Spot base-rate and denominator traps", "Interrogate sources and missing data"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("Numbers That Mislead", "Classic statistical deceptions, decoded", [
            L("Base Rates: The Denominator Problem", 35, ["base rate", "conditional reasoning", "prevalence"], "A 95%-accurate test can mean a 16% chance you're sick — base rates do that.", "worked-example", 3),
            L("Survivorship Bias: The Missing Data", 30, ["survivorship bias", "selection effect", "missing cases"], "The bombers that came back, the funds that survived, the startups that made it.", "worked-example", 3),
            L("Percentages, Points, and Other Confusions", 30, ["percentage vs percentage point", "relative vs absolute", "framing"], "A 100% increase on a base of two — the confusions that fit in a headline.", "concept", 3),
          ]),
          ch("The Skeptic's Toolkit", "Standing questions and a final workout", [
            L("Questioning the Source: Who Collected This and Why?", 30, ["source motive", "collection method", "conflict of interest"], "Every dataset has an author with a purpose — read the purpose before the data.", "reading", 3),
            L("The Analyst's Checklist of Skeptical Questions", 30, ["skeptic checklist", "missing data", "comparison base"], "Denominator? Base rate? Survivorship? Source? Comparison? Five questions, always.", "review", 3),
            L("Checkpoint: Deconstruct a Headline Claim", 40, ["claim autopsy", "evidence", "verdict memo"], "Take a real published claim apart and write the verdict memo.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Analytical Thinking Final", 40, 16),
    projects: [
      proj(
        "Fermi Estimation Brief",
        "Estimate something real about your city or workplace — daily bus riders, coffee cups sold, storage needs for a team of fifty — in a short brief that shows the decomposition, every assumption, a sanity check against a known number, and a final range you would defend.",
        3,
        "guided",
        ["A decomposition tree or step list for the estimate", "Every assumption stated with a reason", "At least one sanity check against external reality", "A final estimate range, not a single point"],
        ["Decomposition covers the whole quantity with no double-counting", "Assumptions are reasonable and would survive a friendly challenge", "The sanity check uses an independent reference number"],
        ["paper", "calculator"]
      ),
      proj(
        "Headline Autopsy",
        "Find a published business or tech statistic — from news, an ad, or a company blog — and write a one-page autopsy: what claim is being made, what data would support it, what the article actually shows, and which skeptical questions (base rate, denominator, survivorship, source) it fails.",
        4,
        "independent",
        ["The claim restated precisely, with its source", "A list of what evidence would actually support the claim", "The skeptical questions applied, with findings", "A verdict: supported, unsupported, or unverifiable"],
        ["The claim is stated precisely, not paraphrased loosely", "At least three skeptical questions applied with evidence", "The verdict is justified rather than reflexively cynical"],
        ["paper", "search engine"]
      ),
    ],
    placementEligible: true,
    keywords: ["analytical thinking", "problem decomposition", "Fermi estimation", "base rate", "survivorship bias", "critical thinking"],
  },
  {
    slug: "case-studies",
    school: "D",
    code: "D9",
    title: "Data Analysis Case Studies",
    blurb: "Five end-to-end investigations — marketing, churn, operations, product launch, pricing — each carried from question to recommendation.",
    difficulty: "intermediate",
    track: "specialization",
    prerequisites: ["business-analytics", "exploratory-data-analysis"],
    softPrerequisites: ["dashboard-design"],
    objectives: [
      "Carry a full analysis from question to recommendation, end to end",
      "Choose and justify methods for unfamiliar business problems",
      "Quantify campaign, churn, and pricing effects from messy data",
      "Deliver findings in decision-ready memos and readouts",
      "Handle ambiguity, missing data, and caveats like a professional",
    ],
    outcomes: [
      "A learner can scope an unfamiliar business question into an analysis plan",
      "A learner can carry an analysis from raw data to a defensible recommendation",
      "A learner can write a readout that leads with the answer and survives challenge",
      "A learner can name the caveats that matter and drop the ones that don't",
    ],
    modules: [
      mod(
        "Case Study: Did the Campaign Work?",
        "A marketing campaign analysis from spend logs to a recommendation — attribution caveats included.",
        ["Measure campaign performance with CPA and ROAS", "Deliver a readout that survives attribution questions"],
        ["case-analysis", "dataset-task", "interpret-results"],
        [
          ch("Frame and Prepare", "The brief, the data, the first pass", [
            L("The Brief: Did the Campaign Pay Off?", 30, ["campaign brief", "success criteria", "attribution window"], "Read a real campaign brief and pin down what 'paid off' must mean.", "reading", 3),
            L("Auditing the Campaign Data", 35, ["spend log", "conversion log", "join audit"], "Two exports, three channels, one messy customer key — audit before analysis.", "code", 3),
            L("First Pass: Spend, Conversions, Outliers", 30, ["first pass", "channel totals", "anomaly scan"], "Sanity totals by channel, and the one outlier day that needs explaining.", "guided-practice", 3),
          ]),
          ch("Analyze and Answer", "Channel performance and the readout", [
            L("Channel Performance: CPA and ROAS", 35, ["CPA", "ROAS", "channel comparison"], "Cost per acquisition by channel — and the denominator decisions inside it.", "code", 3),
            L("Segmented Lift: Who Actually Responded?", 35, ["response segmentation", "new vs returning", "incrementality caveat"], "Lift concentrated in one segment is a targeting insight — and an honesty test.", "code", 3),
            L("The Readout: Recommendation and Caveats", 35, ["readout memo", "attribution caveat", "recommendation"], "What we'd do again, what we'd cut, and what attribution can't tell us.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Case Study: Why Are Customers Leaving?",
        "A churn investigation — from 'churn is up' panic to a prioritized set of causes worth fixing.",
        ["Define churn and measure it honestly", "Separate correlates from causes in churn drivers"],
        ["dataset-task", "interpret-results", "case-analysis"],
        [
          ch("Frame and Prepare", "Defining churn before measuring it", [
            L("The Brief: Churn Is Up Three Points", 30, ["churn brief", "definition risk", "baseline"], "Up three points from what baseline, measured how? Pin down the panic.", "reading", 3),
            L("Defining Churn for This Business", 35, ["churn definition", "grace period", "contract end"], "Subscription, contract, or habitual purchase — the definition changes the answer.", "code", 3),
            L("First Pass: Who Left and When", 30, ["churn cohort", "timing pattern", "early vs late churn"], "A first look at the leavers: when they left, and how long they stayed.", "guided-practice", 3),
          ]),
          ch("Analyze and Answer", "Drilling into drivers and the memo", [
            L("Cohorts, Segments, and Churn Concentration", 35, ["churn concentration", "segment analysis", "Pareto"], "Is churn everywhere, or concentrated in one plan, price, or signup cohort?", "code", 3),
            L("Correlates vs Causes: Reading the Signals", 35, ["correlation vs causation", "support tickets", "timeline analysis"], "Churners filed more support tickets — did the tickets cause the churn, or warn of it?", "worked-example", 3),
            L("The Findings Memo: Causes, Confidence, Next Steps", 35, ["findings memo", "confidence levels", "next steps"], "What we believe, how confident we are, and the two experiments worth running.", "review", 3),
          ]),
        ]
      ),
      mod(
        "Case Study: Why Are Deliveries Late?",
        "An operational efficiency investigation — finding the bottleneck in a process everyone blames differently.",
        ["Turn process logs into analysis tables", "Find and size the bottleneck that matters"],
        ["dataset-task", "write-code", "interpret-results"],
        [
          ch("Frame and Prepare", "Process data into analysis shape", [
            L("The Brief: Late Deliveries, Angry Customers", 30, ["operations brief", "service level", "stakeholders"], "Three teams, three blame stories, one shared dataset — start neutral.", "reading", 3),
            L("From Event Log to Analysis Table", 35, ["event log", "stage durations", "join"], "Timestamps into stage durations — the transformation that makes analysis possible.", "code", 3),
            L("First Pass: Where Does the Time Go?", 30, ["stage totals", "distribution scan", "bottleneck hypothesis"], "Mean stage times point somewhere — but the tails tell the real story.", "guided-practice", 3),
          ]),
          ch("Analyze and Answer", "Bottlenecks, Pareto, and recommendations", [
            L("Stage-by-Stage Delay Analysis", 35, ["stage analysis", "delay distribution", "tail behavior"], "Average delays hide weekend pile-ups — distributions find what averages can't.", "code", 3),
            L("The Vital Few: Pareto Analysis", 30, ["Pareto", "80/20", "cause ranking"], "Rank the causes of delay minutes — the vital few versus the trivial many.", "code", 3),
            L("The Recommendations Memo", 35, ["recommendations", "expected impact", "effort sizing"], "Fix the warehouse stage first: expected minutes saved, confidence, and cost.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Case Study: Did the Launch Land?",
        "A product launch readout — adoption, activation, and early retention scored against pre-committed goals.",
        ["Score a launch against pre-committed goals", "Read early retention without over-claiming"],
        ["dataset-task", "interpret-results", "case-analysis"],
        [
          ch("Frame and Prepare", "Goals, events, and the adoption funnel", [
            L("The Brief: Launch Goals and the Scorecard", 30, ["launch goals", "scorecard", "pre-commitment"], "Goals written before the launch are the only fair judge of the launch.", "reading", 3),
            L("Wiring Up the Event Data", 35, ["event data", "funnel steps", "identity"], "Install-page views, signups, activations — one funnel assembled from raw events.", "code", 3),
            L("First Pass: The Adoption Funnel", 30, ["adoption funnel", "step conversion", "drop-off"], "Where the funnel leaked in week one — and the step that underperformed.", "guided-practice", 3),
          ]),
          ch("Analyze and Answer", "Activation, retention, and the readout deck", [
            L("Activation and Early Retention", 35, ["activation rate", "day-7 retention", "cohort read"], "Did activated users stick? Early cohorts, read carefully, claimed honestly.", "code", 3),
            L("Scoring Against the Goals", 30, ["goal comparison", "baseline", "honest scoring"], "Beat, met, or missed — scoring each pre-committed goal without spin.", "worked-example", 3),
            L("The Launch Readout: A Ten-Minute Story", 35, ["readout deck", "recommendation", "next steps"], "Ten slides, one message per slide, and the recommendation up front.", "review", 3),
          ]),
        ]
      ),
      mod(
        "Case Study: Should We Raise the Price?",
        "A pricing question answered with transaction data — elasticity, scenarios, and a recommendation with error bars.",
        ["Model pricing scenarios from real transactions", "Recommend with uncertainty stated honestly"],
        ["dataset-task", "interpret-results", "case-analysis"],
        [
          ch("Frame and Prepare", "The pricing question and its data", [
            L("The Brief: Raise Prices or Not?", 30, ["pricing brief", "decision framing", "revenue vs margin"], "What decision is actually on the table — revenue, margin, or positioning?", "reading", 3),
            L("Price and Volume from Transaction History", 35, ["transaction data", "price points", "volume by price"], "Natural price variation in past data — the raw material of elasticity.", "code", 3),
            L("First Pass: Revenue vs Volume, Roughly", 30, ["price-volume scatter", "directional read", "confounders"], "The rough relationship, and the three confounders that could fake it.", "guided-practice", 3),
          ]),
          ch("Analyze and Answer", "Scenarios and the recommendation", [
            L("Scenario Modeling: The What-If Table", 35, ["scenario table", "price change", "volume response"], "If volume falls 5% when price rises 10%, what happens to revenue? Build the table.", "code", 3),
            L("Break-Even and Sensitivity", 35, ["break-even volume loss", "sensitivity", "uncertainty range"], "How much volume can we lose before the price rise backfires? Find the line.", "worked-example", 3),
            L("The Pricing Recommendation", 35, ["recommendation", "confidence", "next steps"], "One recommendation, the scenario behind it, and the test that would settle it.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Analysis Case Studies Final", 60, 24),
    projects: [
      proj(
        "Your Own End-to-End Case Study",
        "Pick a public dataset and a real question you care about, then carry a complete case study end to end: brief, data audit, cleaning log, EDA, core analysis, and a findings memo with a recommendation — the full workflow from this subject applied to a problem of your choosing.",
        12,
        "capstone",
        ["A one-page brief with question and decision context", "A reproducible notebook: audit, cleaning, EDA, analysis", "A findings memo leading with the recommendation", "A limitations section naming what the data cannot answer"],
        ["The question stayed fixed from brief to memo", "Every analytical choice is visible and justified in the notebook", "The recommendation follows from the evidence, with uncertainty stated", "A reviewer could rerun the notebook and reach the same findings"],
        ["Python", "pandas", "matplotlib", "Jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["case studies", "end-to-end analysis", "campaign analysis", "churn analysis", "operational analysis", "pricing analysis", "recommendation"],
  },
];
