/**
 * E-commerce analytics projects — ECM-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const ECOMMERCE_PROJECTS: DapProject[] = [
  /* ================================================================ ECM-01 */
  {
    id: "ecommerce-1",
    categoryId: "ecommerce",
    difficulty: "beginner",
    code: "ECM-01",
    title: "Funnel Drop-off Analysis",
    subtitle: "Nine thousand sessions, one question: where exactly do shoppers give up?",
    summary:
      "Your first funnel: clean a session log, build the visit → product → cart → checkout → purchase funnel, and find the stages and segments that leak the most.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Funnel analysis", "Categorical cleaning", "Conversion metrics", "Bar charts", "Insight writing"],

    businessBackground:
      "Lumen Home Goods sells candles, textiles and ceramics through a single online store. Traffic is healthy — marketing brings sessions — but only a small fraction check out, and the founder cannot tell whether the leak is between product and cart or between cart and checkout. Ad spend is being evaluated on the wrong denominator (sessions instead of purchases), and the team needs to know which funnel stage and which device/source combos to fix first.",
    problemStatement:
      "Quantify the store's conversion funnel: how many sessions reach each stage, where the biggest drop-offs occur, and how drop-off differs by device, traffic source and landing page — so the team fixes the stage that leaks most, not the one that complains loudest.",
    businessObjectives: [
      "Compute stage-by-stage conversion and drop-off rates for the full funnel",
      "Compare funnel performance by device type, traffic source and landing page",
      "Identify the single biggest conversion opportunity and size it in orders",
      "Deliver a short, visual findings brief for a non-technical founder",
    ],
    datasetDescription:
      "Four months of session-level web analytics (~9,000 sessions). Each row is one session with the furthest funnel stage reached, duration, pages viewed, and the acquisition attributes (device, source, landing page). Real-export quirks included: mixed-case stage labels, missing device values, negative durations from a tracking glitch, duplicated rows and inconsistent bounce encodings.",
    dataDictionary: [
      { column: "session_id", kind: "id", description: "Unique session identifier", example: "7004821" },
      { column: "visit_date", kind: "date", description: "Session date", example: "2025-06-21" },
      { column: "device_type", kind: "categorical", description: "Mobile / Desktop / Tablet (some missing)", example: "Mobile" },
      { column: "traffic_source", kind: "categorical", description: "Acquisition channel ('googleads' is a variant of Paid Search)", example: "Organic Search" },
      { column: "landing_page", kind: "text", description: "First page of the session", example: "/product/best-seller" },
      { column: "stage_reached", kind: "categorical", description: "Furthest stage: visit / product / cart / checkout / purchase (mixed casing)", example: "cart" },
      { column: "session_duration_sec", kind: "integer", description: "Session length in seconds (negatives are glitches)", example: "412" },
      { column: "pages_viewed", kind: "integer", description: "Pages viewed in session", example: "7" },
      { column: "is_returning", kind: "boolean", description: "Returning visitor flag (0/1)", example: "0" },
      { column: "bounce", kind: "categorical", description: "Single-page session (mixed TRUE/FALSE labels)", example: "TRUE" },
    ],
    initialQuestions: [
      "What share of sessions reaches each funnel stage, and where is the largest single drop-off?",
      "How does the funnel differ on mobile versus desktop?",
      "Which traffic source delivers the best purchase conversion, and which the worst?",
      "Do sessions landing on /sale convert differently from /home?",
      "Roughly how many additional orders would a 2-point cart→checkout improvement generate?",
    ],
    dataset: {
      name: "Lumen session log",
      filename: "ecommerce-01-funnel-sessions.csv",
      description: "4 months of session-level analytics with furthest-stage-reached.",
      rows: 9000,
    },

    dataQuality: [
      { issue: "Mixed-case stage labels", where: "stage_reached — 'Cart' vs 'cart'", detection: "value_counts() shows duplicated stages", treatment: "str.lower() into a canonical column BEFORE building the funnel — otherwise 'Cart' and 'cart' count as different stages." },
      { issue: "Traffic source variant", where: "traffic_source — 'googleads' vs 'Paid Search'", detection: "value_counts() and channel documentation", treatment: "Map 'googleads' → 'Paid Search'; document the mapping." },
      { issue: "Missing device_type", where: "~3% of sessions", detection: "isna().sum()", treatment: "Label 'Unknown'; keep in totals, exclude from device comparisons." },
      { issue: "Negative durations", where: "session_duration_sec < 0 (tracker glitch)", detection: "(df['session_duration_sec'] < 0).sum()", treatment: "Set to NaN for duration metrics; count them — they are a tracking bug worth reporting, not a shopper behaviour." },
      { issue: "Duplicate sessions", where: "~0.8% exact duplicates", detection: "duplicated('session_id').sum()", treatment: "Drop duplicates on session_id; the funnel is a per-session count so duplicates inflate every stage." },
      { issue: "Inconsistent bounce labels", where: "bounce — 'TRUE' plus blanks", detection: "value_counts(dropna=False)", treatment: "Normalise to boolean; blanks stay missing — bounce is derivable (pages_viewed == 1) if needed." },
    ],
    cleaningPlan: [
      { action: "Canonicalise stage_reached and traffic_source", rationale: "The funnel's stages are its spine — label variants split every count." },
      { action: "Deduplicate on session_id", rationale: "Funnel math counts sessions; duplicates double-count." },
      { action: "Normalise bounce, quarantine negative durations", rationale: "Mixed encodings and glitches distort engagement metrics." },
      { action: "Order the funnel as a categorical with stage order visit<product<cart<checkout<purchase", rationale: "A categorical with order makes counts, shares and filtering one line each." },
    ],
    edaPlan: [
      { question: "Stage volumes and shares", method: "value_counts on ordered stage, plus cumulative reach", expectation: "Roughly half of sessions stop at visit/product; cart→checkout is the steepest percentage drop." },
      { question: "Funnel by device", method: "crosstab(device, stage) normalised per device", expectation: "Desktop converts ~2× mobile; mobile loses most at cart." },
      { question: "Funnel by source", method: "crosstab(source, stage) purchase share", expectation: "Email best (warm audience), Social worst." },
      { question: "Landing page effect", method: "purchase rate by landing_page", expectation: "/sale and /product/best-seller out-convert /home." },
      { question: "Returning visitors", method: "purchase rate by is_returning", expectation: "Returning convert at roughly 2× new." },
    ],
    statisticsPlan: [
      { technique: "Descriptive funnel metrics", purpose: "Stage conversion and step drop-off rates", expectation: "Overall visit→purchase ≈ 10%; biggest step drop at cart→checkout." },
      { technique: "Two-proportion z-tests (mobile vs desktop purchase)", purpose: "Confirm the device gap is not noise", expectation: "Mobile's gap is significant at any conventional level." },
      { technique: "Opportunity sizing", purpose: "Translate a stage improvement into orders", expectation: "+2pts cart→checkout ≈ 100–130 orders over the period." },
    ],
    visualisationPlan: [
      { chart: "Horizontal funnel bar — sessions reaching each stage", answers: "Where does the funnel thin?", reads: "Length = sessions at stage; annotate drop-off % between bars." },
      { chart: "Grouped bar — stage share by device", answers: "Where does mobile leak?", reads: "Compare device bars within each stage." },
      { chart: "Bar — purchase rate by traffic source, sorted", answers: "Which channels deserve budget?", reads: "Sorted bars make rank obvious; label values." },
      { chart: "Bar — purchase rate by landing page", answers: "Where should campaigns land?", reads: "Compare against /home baseline." },
      { chart: "Box plot — duration by stage reached", answers: "Do deeper sessions take longer?", reads: "Median line rising with stage; note outliers." },
    ],
    findings: [
      "About 90% of sessions reach the product stage or beyond, but only ~10% purchase: the funnel's damage is concentrated in the cart→checkout step, where roughly half of remaining shoppers abandon.",
      "Mobile delivers ~62% of sessions but converts at roughly half the desktop rate; most of the mobile deficit occurs at cart and checkout.",
      "Email and Organic Search purchase at the best rates; Social traffic arrives plentifully but converts worst — good for awareness arithmetic, poor for last-click credit.",
      "Sessions landing on /sale convert at nearly twice the rate of /home, and returning visitors convert at roughly 2× new visitors.",
      "A two-point improvement at cart→checkout alone would have added roughly 100–130 orders in the period — larger than the whole Social channel's order count.",
    ],
    recommendations: [
      { what: "Comission a checkout UX review focused on mobile cart→checkout (payment options, address entry, load speed)", why: "Half the surviving shoppers abandon there, and mobile is the majority of traffic.", impact: "The single largest recoverable order pool (~100+ orders/period)", horizon: "immediate" },
      { what: "Route paid social campaigns to /sale and product pages instead of /home", why: "Landing pages convert differentially; /home is the weakest entry.", impact: "Conversion uplift with zero spend change", horizon: "immediate" },
      { what: "Start a cart-recovery email/SMS flow for cart abandoners", why: "Cart abandonment is the funnel's biggest absolute leak; automated nudges are standard recovery.", impact: "Typical 5–10% of abandoned carts recovered", horizon: "this quarter" },
      { what: "Report conversion by device monthly so regressions surface early", why: "The mobile gap existed silently for months because reporting was device-blind.", impact: "Early warning; prevents silent regression", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "The store converts ~10% of sessions to orders, and the damage is concentrated: cart→checkout abandons half of remaining shoppers, with mobile — two-thirds of traffic — hit hardest. Email and organic bring the best-converting visitors; social brings the worst, and campaigns currently land many clicks on the weakest page (/home). Fixing the mobile checkout step is worth roughly a hundred orders per period, more than any channel reallocation on the table. Figures in this brief are computed after removing duplicate sessions and standardising stage labels; the cleaning log is appended.",
      structure: [
        "1. Objective and funnel definition",
        "2. Data and quality treatment",
        "3. Funnel stages: volumes and drop-offs",
        "4. Device, source and landing-page breakdowns",
        "5. The opportunity, sized in orders",
        "6. Recommendations (ranked)",
        "7. Appendix: cleaning log and metric definitions",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the session log",
        goal: "Load, profile and internalise: one row = one session, stage_reached is the furthest point.",
        instructions: [
          "Load the CSV; check shape, dtypes and nulls. Confirm the five stage values — in every casing variant they actually appear in.",
          "Read the dictionary: stage_reached is 'furthest stage', so a purchaser passed through every earlier stage implicitly. The funnel is therefore just a count over an ordered category.",
          "Write the funnel order down and note which columns describe acquisition vs behaviour.",
        ],
        hints: [
          "'Furthest stage reached' is a gift: no event sequencing needed — the funnel collapses to value_counts.",
          "df['stage_reached'].value_counts() will show the casing problem immediately; that's your first cleaning entry.",
          "Ask now: is bounce (pages_viewed == 1) consistent with stage_reached == 'visit'? It should be, mostly — mismatches are another quality signal.",
        ],
        checkpoint: "You can list the five stages in order, the label variants found, and what one row represents.",
        code: {
          label: "First look",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("ecommerce-01-funnel-sessions.csv")
print(df.shape)
print(df["stage_reached"].value_counts(dropna=False))
print(df["traffic_source"].value_counts(dropna=False))`,
        },
      },
      {
        phase: "quality",
        title: "Hunt the label chaos",
        goal: "Catalogue every defect: casing, source variants, duplicates, negatives, missing devices.",
        instructions: [
          "value_counts(dropna=False) on every categorical column — read each label list slowly; the defects here are all label-shaped plus duplicates and negatives.",
          "Count duplicated session_ids and negative durations. Check the bounce column's encodings.",
          "Assemble the defect table with counts before touching anything.",
        ],
        hints: [
          "This dataset's theme: consistency. Same fact, several spellings — the analysis crime is grouping before standardising.",
          "pd.unique() on traffic_source reveals 'googleads' sitting apart from 'Paid Search' — check channel docs before merging.",
          "df['session_id'].duplicated().sum() and (df['session_duration_sec'] < 0).sum() close out the non-label defects.",
        ],
        checkpoint: "A written defect table: six issues, detection method, rows affected.",
      },
      {
        phase: "cleaning",
        title: "Standardise into a canonical funnel frame",
        goal: "One clean frame with an ordered stage category and documented mappings.",
        instructions: [
          "Lower-case stage_reached; map 'googleads' → 'Paid Search'; normalise bounce to boolean.",
          "Drop session_id duplicates; set negative durations to NaN; label missing devices 'Unknown'.",
          "Make stage an ordered Categorical [visit, product, cart, checkout, purchase] and record each cleaning action with its count.",
        ],
        hints: [
          "Ordered categoricals pay off twice: value_counts comes out in funnel order and comparisons like 'at least cart' become a single comparison.",
          "Clean['stage'] = pd.Categorical(clean['stage_reached'].str.lower(), categories=STAGES, ordered=True).",
          "Keep a log list of (action, rows_affected) tuples as you go — you'll paste it into the report appendix.",
        ],
        checkpoint: "A funnel frame with 5 canonical stages, unique sessions, and a cleaning log.",
        code: {
          label: "Canonical funnel frame",
          language: "python",
          source: `STAGES = ["visit", "product", "cart", "checkout", "purchase"]
clean = df.drop_duplicates("session_id").copy()
clean["stage"] = pd.Categorical(
    clean["stage_reached"].str.lower().str.strip(), categories=STAGES, ordered=True)
clean["traffic_source"] = clean["traffic_source"].replace({"googleads": "Paid Search"})
clean["device_type"] = clean["device_type"].fillna("Unknown")
clean.loc[clean["session_duration_sec"] < 0, "session_duration_sec"] = pd.NA
print(clean["stage"].value_counts().reindex(STAGES))`,
        },
      },
      {
        phase: "eda",
        title: "Build and split the funnel",
        goal: "Stage counts, step conversion, and the device/source/landing cuts.",
        instructions: [
          "Compute sessions and share at each stage; then step conversion (share of stage n reaching n+1). Identify the worst step.",
          "Cross-tab the funnel by device_type (column percentages) — where does mobile fall behind?",
          "Purchase rate by traffic_source and by landing_page, sorted. Note the spread between best and worst.",
        ],
        hints: [
          "Two number families: cumulative reach (share of ALL sessions at each stage) and step conversion (share of the previous stage). Report both; they answer different questions.",
          "pd.crosstab(clean['device_type'], clean['stage'], normalize='index') gives per-device stage shares in one line.",
          "Sorted purchase rates: clean.groupby('traffic_source')['stage'].apply(lambda s: (s == 'purchase').mean()).sort_values(ascending=False).",
        ],
        checkpoint: "You can quote: worst step overall, mobile vs desktop purchase rate, best and worst source.",
        code: {
          label: "Funnel metrics",
          language: "python",
          source: `counts = clean["stage"].value_counts().reindex(STAGES)
reach = counts / counts.iloc[0]
step = counts / counts.shift(1)
print(pd.DataFrame({"sessions": counts, "reach": reach, "step_conv": step}))

device = pd.crosstab(clean["device_type"], clean["stage"], normalize="index")
print((device * 100).round(1))`,
        },
      },
      {
        phase: "statistics",
        title: "Confirm and size the opportunity",
        goal: "Test the device gap; translate a step improvement into orders.",
        instructions: [
          "Two-proportion z-test on purchase rate, mobile vs desktop. State the result plainly.",
          "Opportunity arithmetic: if cart→checkout improved by 2 percentage points, how many extra orders follow? Show the chain of multiplication.",
          "Sanity-check the funnel: cumulative reach must be non-increasing; investigate if not.",
        ],
        hints: [
          "The z-test for proportions uses counts, not just rates: successes and trials per group.",
          "Opportunity chain: sessions at cart × +2pts conversion × downstream conversion to purchase = extra orders. Each factor is a number you already have.",
          "If reach ever increases between stages, you have a data problem (or a mis-ordered category) — funnels are monotone by construction.",
        ],
        checkpoint: "A significance statement for the device gap and an orders-sized opportunity estimate.",
        code: {
          label: "z-test and sizing",
          language: "python",
          source: `from statsmodels.stats.proportion import proportions_ztest

mob = clean[clean["device_type"] == "Mobile"]["stage"].eq("purchase")
dsk = clean[clean["device_type"] == "Desktop"]["stage"].eq("purchase")
stat, p = proportions_ztest([mob.sum(), dsk.sum()], [len(mob), len(dsk)])
print(f"z={stat:.2f}, p={p:.4f}")

cart_sessions = counts["cart"]
uplift = 0.02 * cart_sessions * (counts["purchase"] / counts["cart"])
print(f"+2pts at cart→checkout ≈ {uplift:.0f} extra orders")`,
        },
      },
      {
        phase: "visualisation",
        title: "The funnel, visualised",
        goal: "Five charts, funnel-first, every one labelled with its takeaway.",
        instructions: [
          "Horizontal funnel bars (sessions per stage, drop-off annotated); grouped stage-share bars by device; sorted purchase rate by source; landing page comparison; duration box plot by stage.",
          "Annotate the funnel chart with the step conversion percentages between bars.",
          "Title each chart with the finding ('Half of shoppers abandon at cart→checkout').",
        ],
        hints: [
          "Funnel bars: barh with stage order preserved top-to-bottom; add text labels of counts and step %.",
          "For device comparison, per-device stage shares (normalize) rather than raw counts — device group sizes differ.",
          "A box plot of duration by ordered stage should show rising medians; if it doesn't, that's a finding too.",
        ],
        checkpoint: "Five saved charts; the funnel chart readable in five seconds.",
        code: {
          label: "Funnel chart",
          language: "python",
          source: `import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.barh(STAGES[::-1], counts.values, color="#0f766e")
for i, (stage, n) in enumerate(zip(STAGES[::-1], counts.values[::-1])):
    ax.text(n, i, f"  {n:,}", va="center")
ax.set_title("Only ~10% of sessions purchase; cart→checkout is the cliff")
ax.set_xlabel("Sessions")
fig.tight_layout(); fig.savefig("funnel.png", dpi=150)`,
        },
      },
      {
        phase: "interpretation",
        title: "Answer the founder's questions",
        goal: "Findings with numbers attached, in the founder's language.",
        instructions: [
          "Answer all five initial questions, each with its figure and a one-line 'so what'.",
          "Separate what the data proves from what it hints (landing page effects are correlational — campaign targeting differs).",
          "Draft the opportunity paragraph: the biggest leak, its size in orders, and why it beats channel reshuffling.",
        ],
        hints: [
          "Founders remember one number from a brief — decide which one it should be and repeat it.",
          "Correlational honesty: /sale landing pages convert better, but campaigns sending traffic there differ from those sending traffic to /home.",
          "So-what discipline: every finding gets a 'which means…' clause, or it belongs in the appendix.",
        ],
        checkpoint: "Five answered questions, each with number and so-what.",
      },
      {
        phase: "recommendations",
        title: "Rank the fixes",
        goal: "Three to four actions, ranked by expected orders recovered per unit of effort.",
        instructions: [
          "Write recommendations in ranked order; each cites its finding and states expected impact.",
          "Mix quick wins (landing page routing) with structural ones (checkout UX) and mark the horizon.",
          "Include the measurement plan: how will the team know the checkout fix worked?",
        ],
        hints: [
          "Ranking forces trade-offs — that's the point. If everything is priority one, nothing is.",
          "Pair each fix with its metric and a success threshold ('cart→checkout from 48% to 55% within six weeks').",
          "Cheap-and-reversible first is a good default order when expected values are similar.",
        ],
        checkpoint: "A ranked recommendation table with metrics and thresholds.",
      },
      {
        phase: "report",
        title: "The founder's funnel brief",
        goal: "A two-minute read with one chart that decides the next sprint.",
        instructions: [
          "Structure: objective → funnel definition → the leak (with funnel chart) → device/source evidence → sized opportunity → ranked fixes.",
          "Keep the cleaning log to two appendix sentences; the founder cares that numbers are trustworthy, not how you earned it.",
          "Close with the single most urgent action.",
        ],
        hints: [
          "Lead with the leak, not the method: 'Half of the shoppers who reach cart never check out.'",
          "One chart in the body beats five — pick the funnel chart and link the rest.",
          "Write the last sentence first: what should the founder do tomorrow morning?",
        ],
        checkpoint: "The brief, with the funnel chart embedded and every number traceable.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the first analyst at a D2C store. The founder wants to know where the funnel leaks and what to fix first. The session export is yours; define the funnel metrics, audit the data, and return a brief the founder can act on this week.",
      deliverables: [
        "Defect table for the session export (issue, detection, rows affected, treatment)",
        "Funnel metrics: cumulative reach and step conversion",
        "Funnel splits by device, source and landing page",
        "4–5 labelled charts including the annotated funnel",
        "Ranked recommendations with an orders-sized opportunity estimate",
      ],
      guardrails: [
        "Stage labels standardised before any funnel count",
        "Duplicate sessions removed before conversion arithmetic",
        "Correlational segments (landing page, source) not claimed as causal",
        "Every headline number reproducible from the notebook",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Funnel counts computed on canonical (lower-cased) stages",
        "Step conversion uses the previous stage as denominator, not all sessions",
        "Opportunity arithmetic chain shown explicitly",
      ],
      "code-quality": [
        "Funnel order defined once (ordered categorical or explicit list) and reused",
        "Cleaning log maintained alongside the code",
      ],
      reasoning: [
        "Cumulative vs step conversion distinguished",
        "Device comparison excludes 'Unknown' devices",
      ],
      visualization: [
        "Funnel bars in stage order with drop-offs annotated",
        "Device comparison uses shares, not raw counts",
      ],
      interpretation: [
        "The cart→checkout finding quantified with its share and order impact",
        "Mobile vs desktop gap tested, not just eyeballed",
      ],
      recommendations: [
        "Ranked by expected impact with success metrics/thresholds",
        "At least one recommendation sized in orders",
      ],
    },
  },

  /* ================================================================ ECM-02 */
  {
    id: "ecommerce-2",
    categoryId: "ecommerce",
    difficulty: "intermediate",
    code: "ECM-02",
    title: "Journey & Conversion Attribution",
    subtitle: "Follow 15,000 events from first view to purchase and give every channel honest credit.",
    summary:
      "Event-level journey analysis: rebuild sessions and users from a raw event stream, measure path-to-purchase by device and source, compare first-touch and last-touch attribution, and quantify the real cost of the attribution default.",
    hours: 11,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Event data modelling", "Sessionisation", "Attribution modelling", "Path analysis", "Channel economics"],

    businessBackground:
      "Verdant Supply, a B2B office-products store, suspects its channel reporting is lying to it. Paid Search gets the credit for most conversions because it wins the last click, but the CMO believes email nurtures and social introduce customers who later buy through search. Budget is split by that last-click report, and the CMO cannot defend a reallocation without evidence. The raw event stream — views, carts, checkouts, purchases with session and user ids — is finally available.",
    problemStatement:
      "Reconstruct the customer journey from raw events, measure conversion paths by device and traffic source, compare attribution models (first-touch vs last-touch) on real journeys, and recommend a budget reallocation the CMO can defend — with each channel's role (introducer, nurturer, closer) made explicit.",
    businessObjectives: [
      "Rebuild the event → session → user hierarchy and verify event integrity",
      "Quantify conversion rates and journey length by device, source and category",
      "Compare first-touch, last-touch and linear attribution for converting journeys",
      "Estimate the budget distortion created by the last-click default",
      "Deliver a channel-role map and reallocation recommendation",
    ],
    datasetDescription:
      "Five months of raw events (~12,000 rows): each row is one event (view, cart, checkout, purchase) with timestamp, session, user, device, source, category, and value fields for cart/purchase events. Users are sometimes null (guest browsing). The stream contains a classic typo variant of 'view', currency-formatted cart values, duplicate event ids and gaps in order values — the honest texture of a first-party event pipeline.",
    dataDictionary: [
      { column: "event_id", kind: "id", description: "Unique event identifier", example: "9042317" },
      { column: "timestamp", kind: "datetime", description: "Event timestamp (YYYY-MM-DD HH:MM)", example: "2025-06-11 14:32" },
      { column: "session_id", kind: "id", description: "Session the event belongs to", example: "7034821" },
      { column: "user_id", kind: "id", description: "User (blank = guest)", example: "42318" },
      { column: "event_type", kind: "categorical", description: "view / cart / checkout / purchase (typos exist)", example: "cart" },
      { column: "device", kind: "categorical", description: "Mobile / Desktop / Tablet", example: "Mobile" },
      { column: "traffic_source", kind: "categorical", description: "Channel of the session", example: "Paid Search" },
      { column: "product_category", kind: "categorical", description: "Merchandise category", example: "Home Office" },
      { column: "cart_value", kind: "currency", description: "Basket value on cart events (format mix)", example: "$92.40" },
      { column: "order_value", kind: "currency", description: "Order value on purchase events (some missing)", example: "118.90" },
      { column: "discount_code", kind: "text", description: "Discount code used at purchase", example: "WELCOME10" },
    ],
    initialQuestions: [
      "How many sessions and users does the event stream actually contain, and how many journeys are multi-session?",
      "What does the typical path to purchase look like — how many touchpoints, which sources appear early vs late?",
      "How much credit moves between channels under first-touch vs last-touch attribution?",
      "Which sources introduce journeys that convert, and which merely close them?",
      "What budget shift would the evidence support, and what should the CMO measure next?",
    ],
    dataset: {
      name: "Verdant event stream",
      filename: "ecommerce-02-journey-events.csv",
      description: "5 months of view/cart/checkout/purchase events with session and user linkage.",
      rows: 12000,
    },

    dataQuality: [
      { issue: "Event-type typo", where: "event_type — 'veiw' instead of 'view'", detection: "value_counts() on event_type", treatment: "Map to 'view'; count affected rows — silent typo = silently lost funnel stage." },
      { issue: "Currency-formatted cart values", where: "cart_value — '$92.40' strings mixed with numbers", detection: "dtype is object; str.contains(r'\\$') check", treatment: "Strip $ and commas, cast to float; the mixed dtype must become numeric before any revenue math." },
      { issue: "Missing order_value on purchases", where: "order_value — ~3% of purchase events", detection: "purchases = df[df.event_type=='purchase']; purchases['order_value'].isna().mean()", treatment: "Impute from the user's cart events where possible (last cart before purchase), else median order value by category — with the imputation share reported." },
      { issue: "Duplicate event_ids", where: "~0.7% duplicated rows", detection: "duplicated('event_id').sum()", treatment: "Drop; event-level counts feed every funnel ratio so duplicates leak into conversion rates." },
      { issue: "Null user_id (guests)", where: "user_id — ~4% of events", detection: "isna().sum()", treatment: "Guest sessions cannot join journeys; analyse them separately for funnel work, exclude from multi-session journey analysis (and say so)." },
      { issue: "Timestamps in string form", where: "timestamp column", detection: "dtype check", treatment: "pd.to_datetime before any sessionisation or time-delta logic." },
    ],
    cleaningPlan: [
      { action: "Fix 'veiw' typo, numericise cart/order values, deduplicate on event_id", rationale: "Funnel and revenue metrics both break on any of these silently." },
      { action: "Parse timestamps; sort events by (session_id, timestamp)", rationale: "Path order is the analysis object; unsorted events produce nonsense paths." },
      { action: "Handle missing order_value by cart-backfill then category median, flagged", rationale: "Revenue attribution needs complete order values; the flag keeps imputed money distinguishable." },
      { action: "Build journey table: per user, the ordered sequence of distinct-session sources up to purchase", rationale: "Attribution is computed on journeys, not raw events — the table is the deliverable." },
    ],
    edaPlan: [
      { question: "Funnel integrity from events", method: "counts per event_type per session; verify purchase events all have a prior cart/checkout", expectation: "A few orphan purchases — mostly data-gathering lag; document and keep." },
      { question: "Sessions and users", method: "nunique on session_id, user_id; sessions per user distribution", expectation: "Majority single-session; ~25–30% of identified users multi-session." },
      { question: "Journey length", method: "touchpoints per converting journey (distinct sessions before purchase)", expectation: "Median ~2; upper tail to 5–6 touchpoints." },
      { question: "Early vs late sources", method: "source of first touch vs last touch in converting journeys", expectation: "Social and Organic introduce; Paid Search closes; Email mid-path." },
      { question: "Device economics", method: "purchase rate and order value by device", expectation: "Desktop converts better AND larger orders." },
      { question: "Discount code usage", method: "share of purchases with codes; order value with vs without", expectation: "~30% use codes; code orders slightly smaller after discount." },
    ],
    statisticsPlan: [
      { technique: "First/last/linear attribution comparison", purpose: "Quantify credit movement across models", expectation: "Paid Search loses ~8–12pts of credit under first-touch; Social gains most." },
      { technique: "Transition analysis (source at touch t vs t+1)", purpose: "Reveal the introducer→closer pipeline", expectation: "Social → Paid Search and Organic → Paid Search transitions dominate." },
      { technique: "Conversion lift for multi-touch journeys (t-test or bootstrap)", purpose: "Do multi-session journeys convert larger orders?", expectation: "Modest but real uplift in order value for 3+ touch journeys." },
      { technique: "Sensitivity of budget reallocation to model choice", purpose: "Size the decision risk of switching models", expectation: "A ±3pt budget shift for Paid Search vs Social; Email stable." },
    ],
    visualisationPlan: [
      { chart: "Alluvial/stacked bar — first-touch vs last-touch credit by channel", answers: "How does credit move?", reads: "Channel bars shrink/grow between the two model panels." },
      { chart: "Sankey-lite transition matrix heatmap (touch t → t+1 sources)", answers: "Who introduces, who closes?", reads: "Row = current source, column = next; diagonal = repeats." },
      { chart: "Histogram — touchpoints per converting journey", answers: "How long are real journeys?", reads: "Median marker; long right tail." },
      { chart: "Scatter — conversion rate vs average order value by channel (bubble = sessions)", answers: "Which channels are volume vs value?", reads: "Quadrants separate cheap-introducers from premium-closers." },
      { chart: "Bar — order value with vs without discount codes", answers: "What do codes do to basket size?", reads: "Paired bars with significance note." },
    ],
    findings: [
      "Journeys are genuinely multi-touch: converting users average roughly two sessions and 3+ events before purchase; ~28% of identified converters touch more than one channel.",
      "Last-touch attribution overpays Paid Search by roughly 10 percentage points of credit: Social and Organic introduce journeys that Paid Search later closes.",
      "Email is a mid-path nurturer — it rarely introduces (5% of first touches) but appears in a quarter of multi-touch converting journeys before the final session.",
      "Desktop converts at ~1.7× mobile and with ~15% larger orders; mobile traffic however dominates top-of-funnel views.",
      "Discount-code orders run slightly smaller than non-code orders after discounts are applied — codes convert but don't grow baskets in this period.",
    ],
    recommendations: [
      { what: "Shift 5–8% of the Paid Search budget toward Social and Organic content under a measured pilot", why: "They introduce journeys that convert; last-click starves them of credit and budget.", impact: "Cheaper qualified top-of-funnel without reducing closers", horizon: "this quarter" },
      { what: "Keep Email funded as a nurture channel and report it on mid-path presence, not last-click conversions", why: "Its role is mid-journey; last-click metrics structurally undervalue it.", impact: "Prevents a defunding mistake the attribution model invites", horizon: "immediate" },
      { what: "Run a geo or audience holdout on Social for six weeks to test the introduction effect causally", why: "Path evidence is correlational; a holdout converts the story into an experiment.", impact: "Turns the budget debate into a measurement", horizon: "this quarter" },
      { what: "Adopt dual reporting (first + last touch) for all channel decisions this year", why: "Single-model reporting created the distortion; dual reporting keeps it visible.", impact: "Decision hygiene at zero cost", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "Rebuilt from raw events, the store's journeys are multi-touch: about a quarter of converters meet more than one channel before purchasing. The current last-click report overpays Paid Search by roughly ten points of conversion credit — it closes journeys that Social and Organic introduced — while Email's real role, mid-path nurturing, is invisible in the default report. The evidence supports shifting a measured 5–8% of search budget toward introduction channels, running a holdout to test the effect causally, and reporting dual attribution until a real model is justified. All path statistics are computed after event deduplication, typo repair and value imputation, detailed in the appendix.",
      structure: [
        "1. The attribution question and scope",
        "2. Event data reconstruction and quality treatment",
        "3. Journey shape: sessions, touchpoints, paths",
        "4. Attribution comparison: first vs last touch",
        "5. Channel roles: introducer / nurturer / closer map",
        "6. Budget implications and the holdout proposal",
        "7. Appendix: cleaning log, imputation share, sessionisation rules",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Reconstruct the hierarchy",
        goal: "Events → sessions → users: build the grain map before any metric.",
        instructions: [
          "Confirm the three levels: event_id (unique), session_id (many events), user_id (many sessions, sometimes null).",
          "Parse timestamps, sort by (session_id, timestamp), and verify each session's events are time-coherent.",
          "Count: events, sessions, identified users, guest sessions. These four numbers anchor everything.",
        ],
        hints: [
          "Event data is a hierarchy; every question lives at one level — ask 'which level?' before computing.",
          "df['timestamp'] = pd.to_datetime(df['timestamp']); df = df.sort_values(['session_id','timestamp']) — path work depends on this sort.",
          "Guest sessions (null user_id) can't join a journey across sessions; measure their share now to size the blind spot.",
        ],
        checkpoint: "The four counts (events, sessions, users, guest sessions) and a sorted event frame.",
        code: {
          label: "Hierarchy counts",
          language: "python",
          source: `df = pd.read_csv("ecommerce-02-journey-events.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])
df = df.sort_values(["session_id", "timestamp"]).reset_index(drop=True)

print("events:", len(df))
print("sessions:", df["session_id"].nunique())
print("identified users:", df["user_id"].nunique())
print("guest events:", df["user_id"].isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the pipeline",
        goal: "Find the typo, the currency strings, the duplicates and the missing order values.",
        instructions: [
          "value_counts() on event_type; check dtypes on cart_value and order_value — object dtype on money columns is the tell.",
          "Quantify duplicates on event_id and the missing order_value share among purchases specifically.",
          "Verify purchase events have sane order values (positive, not absurd); check for orphan purchases sessions with no prior cart.",
        ],
        hints: [
          "Filter BEFORE you audit: missing order_value is a purchase-level question — measure it among purchases, not all events.",
          "pd.to_numeric(df['cart_value'].astype(str).str.replace(r'[$,]', '', regex=True), errors='coerce') reveals how many values fail numeric parsing.",
          "Orphan purchases (no cart in same session) are usually cross-session journeys — check prior sessions of the user before calling them defects.",
        ],
        checkpoint: "A defect table with the five issues, detection code and counts, plus the orphan-purchase verdict.",
      },
      {
        phase: "cleaning",
        title: "Repair the stream",
        goal: "Canonical events with numeric money, ready for journey construction.",
        instructions: [
          "Fix 'veiw'; numericise cart/order values; drop duplicate event_ids; impute missing order values (cart backfill then category median) with a flag.",
          "Re-verify the funnel after cleaning: view → cart → checkout → purchase counts should now be monotone and typo-free.",
          "Record every action in the cleaning log with counts.",
        ],
        hints: [
          "Imputation ladder for order_value: same user's last cart before purchase > category median > global median — each rung documented.",
          "merge_asof or a sorted groupby-last gets you the user's last cart value efficiently.",
          "After cleaning, re-run the event counts and confirm nothing moved except the intended fixes — cleaning that changes unrelated counts is a bug.",
        ],
        checkpoint: "A clean event frame with numeric money, boolean imputed flag, and stable funnel counts.",
        code: {
          label: "Repair pass",
          language: "python",
          source: `clean = df.drop_duplicates("event_id").copy()
clean["event_type"] = clean["event_type"].replace({"veiw": "view"})
for col in ["cart_value", "order_value"]:
    clean[col] = pd.to_numeric(
        clean[col].astype(str).str.replace(r"[$,]", "", regex=True),
        errors="coerce")

purch = clean["event_type"] == "purchase"
clean["order_imputed"] = purch & clean["order_value"].isna()
med = clean.loc[purch].groupby("product_category")["order_value"].transform("median")
clean.loc[purch, "order_value"] = clean.loc[purch, "order_value"].fillna(med)`,
        },
      },
      {
        phase: "eda",
        title: "Shape of the journey",
        goal: "Touchpoint counts, session structure, and the early-vs-late source pattern.",
        instructions: [
          "Per converting user: distinct sessions before purchase, and the source sequence across those sessions (first touch, last touch).",
          "Journey length distribution; sessions per user overall; device split of views vs purchases.",
          "Cross-tab first-touch source vs last-touch source for converters — the off-diagonal mass is the attribution story.",
        ],
        hints: [
          "A journey = for each identified user, all events up to and including their first purchase, reduced to (session, source) pairs.",
          "session_sources = clean.drop_duplicates(['session_id'])[['user_id','session_id','traffic_source','timestamp']].sort_values('timestamp') — then groupby user and collect the sequence.",
          "The first-vs-last crosstab's diagonal = channels that introduce AND close; off-diagonal = credit movement between models.",
        ],
        checkpoint: "You can state: median touchpoints per converter, and the two biggest first→last source shifts.",
        code: {
          label: "Journey table",
          language: "python",
          source: `sessions = clean.drop_duplicates("session_id")[
    ["user_id", "session_id", "traffic_source", "timestamp"]
].sort_values("timestamp")

buyers = clean.loc[clean["event_type"] == "purchase", "user_id"].dropna().unique()
journeys = sessions[sessions["user_id"].isin(buyers)]

path = journeys.groupby("user_id")["traffic_source"].agg(["first", "last", "count"])
print(path["count"].describe())
print(pd.crosstab(path["first"], path["last"], normalize="index").round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "Attribution arithmetic",
        goal: "Compute first/last/linear credit and test the journey-value claim.",
        instructions: [
          "Attribute each purchase's order value three ways: first touch, last touch, linear across touch sources. Compare channel shares.",
          "Build the transition matrix between consecutive touch sources; identify introducer→closer flows.",
          "Bootstrap the order-value difference between 1-touch and 3+-touch journeys.",
        ],
        hints: [
          "Linear attribution: split each order's value evenly across distinct sources in the journey — mind duplicates (a source touched twice still gets one share under distinct-source linear).",
          "pd.crosstab(path['source_t'], path['source_t+1']) — build consecutive pairs with groupby('user_id')['traffic_source'].shift(-1).",
          "Report model differences in percentage points of revenue credit, not raw dollars — that's how the CMO reads it.",
        ],
        checkpoint: "A three-model channel-share table and the top-3 transition flows.",
        code: {
          label: "Three models",
          language: "python",
          source: `# join order values to journeys, then:
first_touch = path.groupby("first")["order_value"].sum()
last_touch = path.groupby("last")["order_value"].sum()
shares = pd.DataFrame({
    "first": first_touch / first_touch.sum(),
    "last": last_touch / last_touch.sum(),
})
print((shares * 100).round(1))
print("Paid Search credit shift (pts):",
      round((shares.loc['Paid Search', 'first'] - shares.loc['Paid Search', 'last']) * 100, 1))`,
        },
      },
      {
        phase: "visualisation",
        title: "Make credit movement visible",
        goal: "Five charts that carry the introducer/nurturer/closer story.",
        instructions: [
          "Paired bars (first vs last credit by channel); transition heatmap; touchpoint histogram; conversion-vs-AOV bubble chart; discount-code comparison.",
          "The paired credit bars are the headline: order channels consistently and label the point shifts.",
          "Annotate the heatmap's dominant cells with a plain-language caption.",
        ],
        hints: [
          "Two-panel or dodged bars for the credit comparison; add point-shift labels (+10.2 pts) on the biggest movers.",
          "Heatmap with a sequential colormap; mask the diagonal if it dwarfs transitions.",
          "Bubble chart: x = conversion rate, y = AOV, size = sessions — quadrant annotations do the argument.",
        ],
        checkpoint: "Five charts with the credit-shift chart legible from across a room.",
      },
      {
        phase: "interpretation",
        title: "Name each channel's role",
        goal: "The channel-role map, with correlation caveats attached.",
        instructions: [
          "Assign roles (introducer / nurturer / closer) from the transition and attribution evidence; state the evidence for each.",
          "Address the correlation problem head-on: journey paths are observed, not randomised — what would a holdout add?",
          "Quantify the budget implication: which channel's share moves by how many points under fairer attribution?",
        ],
        hints: [
          "A role map is a table: channel × role × evidence × confidence. Keep it to five channels.",
          "The honest caveat writes itself: 'Journeys show Social introduces converters; they do not show conversions would fail without Social.'",
          "Convert credit points into budget ranges (±3pts conservative) so the recommendation is actionable but not overconfident.",
        ],
        checkpoint: "A channel-role table and a budget-shift range with its evidence trail.",
      },
      {
        phase: "recommendations",
        title: "The defensible reallocation",
        goal: "A pilot-sized reallocation plus the measurement plan that de-risks it.",
        instructions: [
          "Recommend the shift range, the guardrails (brand terms protected, cap on spend), and the pilot design.",
          "Propose the holdout design: geography or audience split, duration, primary metric.",
          "Define what would falsify the introduction story — and commit to reporting it.",
        ],
        hints: [
          "Pilot framing beats big-bang: 'move 5–8% for six weeks with a holdout' is a proposal a CMO can accept without a leap of faith.",
          "Primary metric for a holdout: incremental conversions per exposed audience, not last-click revenue.",
          "Pre-committing the falsifier ('if holdout regions show no conversion lift, revert and re-model') is what makes the pilot credible.",
        ],
        checkpoint: "A reallocation recommendation with pilot design and falsification criteria.",
      },
      {
        phase: "report",
        title: "The attribution review",
        goal: "A CMO-ready review that changes how the company reads its funnel.",
        instructions: [
          "Structure per the outline; open with the credit-shift finding because it reframes the budget debate.",
          "Include the role map as the body's central table; keep model math in the appendix.",
          "End with the dual-reporting proposal as the immediate no-cost action.",
        ],
        hints: [
          "The one-line version: 'The last-click report pays the closer and starves the introducers; here is the fairer split and the test that proves it.'",
          "Executives will ask 'why should I trust your journey table?' — the sessionisation rules and cleaning log are the answer; keep them one appendix page.",
          "Name the next measurement milestone explicitly (holdout read-out date).",
        ],
        checkpoint: "The complete review, reproducible from the raw event CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the growth team's analyst. The CMO needs to know whether last-click attribution is misallocating budget, and what a fairer split looks like. You own sessionisation and attribution methodology — document both, defend both.",
      deliverables: [
        "Event audit and cleaning log (typo, formats, duplicates, imputation)",
        "Sessionisation rules and journey table for identified users",
        "First/last/linear attribution comparison with channel shares",
        "Transition analysis naming introducer/closer flows",
        "Channel-role map, reallocation range, and holdout pilot design",
      ],
      guardrails: [
        "Guest sessions handled explicitly (excluded from journeys, reported separately)",
        "Attribution models computed on journeys, not raw sessions",
        "Correlational nature of path evidence stated",
        "Imputed order values flagged and their share reported",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Event dedup and typo repair before any funnel or attribution math",
        "Attribution denominators consistent (same set of journeys across models)",
        "Linear model splits order value across DISTINCT journey sources",
      ],
      "code-quality": [
        "Journey table built once, reused across models",
        "Money columns numeric; imputation flagged, not silent",
      ],
      reasoning: [
        "Guest blind spot quantified and its impact on conclusions discussed",
        "Off-diagonal crosstab mass correctly interpreted as credit movement",
      ],
      visualization: [
        "Credit comparison shows point shifts, not just two bar sets",
        "Transition heatmap readable with masked/annotated dominant cells",
      ],
      interpretation: [
        "Introducer/nurturer/closer roles assigned with evidence",
        "Correlation caveat and holdout rationale explicit",
      ],
      recommendations: [
        "Reallocation expressed as a range with guardrails",
        "Holdout design names primary metric and duration",
      ],
    },
  },

  /* ================================================================ ECM-03 */
  {
    id: "ecommerce-3",
    categoryId: "ecommerce",
    difficulty: "advanced",
    code: "ECM-03",
    title: "Retention, Cohorts & Customer Lifetime Value",
    subtitle: "Eighteen months of orders: who comes back, when they fade, and what a customer is worth.",
    summary:
      "Full retention economics: build monthly acquisition cohorts, measure repeat curves by channel, model CLV with survival-style thinking, and tell the board which acquisition bets pay back.",
    hours: 16,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Cohort analysis", "Retention curves", "CLV modelling", "Survival intuition", "Unit economics"],

    businessBackground:
      "Harbor & Oak, a D2C home-goods brand, has grown revenue 60% year on year while blended repeat-purchase rate has drifted down. The CFO suspects the business is renting customers: pouring paid acquisition into one-time buyers whose lifetime value doesn't cover their acquisition cost. The board wants to know whether retention is actually declining, whether it differs by acquisition channel, and what a customer is truly worth — before approving next year's acquisition budget.",
    problemStatement:
      "Establish the truth about retention: build acquisition cohorts from 18 months of orders, measure repeat rates and order frequency by cohort and channel, model customer lifetime value under explicit assumptions, and recommend which acquisition channels clear the payback bar — with the assumptions and their weaknesses stated.",
    businessObjectives: [
      "Construct monthly acquisition cohorts and retention matrices (order-based and customer-based)",
      "Quantify repeat behaviour by acquisition channel, device and region",
      "Model CLV (probabilistic revenue approach with explicit assumptions) and LTV:CAC by channel",
      "Diagnose the perceived retention decline: mix shift vs true behaviour change",
      "Deliver acquisition budget guidance with sensitivity analysis on CLV assumptions",
    ],
    datasetDescription:
      "Eighteen months of order-level data (~15,000 orders, ~6,200 customers): each row an order with customer id, dates, channel, device, region, GMV, discount and item count. first_order_date is included but partly missing and partly wrong — rebuilding it is part of the exercise. Refund orders appear as negative GMV; some region labels are lower-cased; duplicates exist. This is the real shape of commerce data before an analyst earns trust with it.",
    dataDictionary: [
      { column: "order_id", kind: "id", description: "Unique order identifier", example: "304812" },
      { column: "customer_id", kind: "id", description: "Customer identifier", example: "24318" },
      { column: "order_date", kind: "date", description: "Order date", example: "2025-02-11" },
      { column: "first_order_date", kind: "date", description: "Customer's first order date (partly missing/wrong — rebuild it)", example: "2024-11-03" },
      { column: "channel", kind: "categorical", description: "Acquisition channel of the order", example: "Paid Search" },
      { column: "device", kind: "categorical", description: "Mobile / Desktop", example: "Mobile" },
      { column: "category_mix", kind: "categorical", description: "Dominant merchandise mix of the order", example: "Mixed" },
      { column: "gmv", kind: "currency", description: "Gross merchandise value (negatives are refunds)", example: "94.20" },
      { column: "discount", kind: "currency", description: "Discount applied to the order", example: "18.80" },
      { column: "items", kind: "integer", description: "Units in the order", example: "3" },
      { column: "region", kind: "categorical", description: "Shipping region (casing inconsistent)", example: "midwest" },
    ],
    initialQuestions: [
      "What is the actual first-order acquisition trend by month, and which channels acquire which share?",
      "What share of each cohort orders again within 30/90/180 days, and is retention truly declining or is it channel mix?",
      "How do repeat curves differ by acquisition channel — do Referral and Email customers stick better than Paid Search customers?",
      "What is the modeled 12-month CLV by channel, and which channels clear a 3:1 LTV:CAC bar at plausible CAC levels?",
      "Which assumptions in the CLV model would the board challenge first, and how sensitive are the rankings to them?",
    ],
    dataset: {
      name: "Harbor & Oak orders",
      filename: "ecommerce-03-retention-orders.csv",
      description: "18 months of order-level data for ~6,200 customers with channels and values.",
      rows: 15000,
    },

    dataQuality: [
      { issue: "Missing/incorrect first_order_date", where: "~2.5% missing; some values later than the order's own date", detection: "compare first_order_date to groupby(customer_id).order_date.min()", treatment: "Rebuild it entirely from the order data: cohort = min(order_date) per customer. Never trust a derived column you can recompute." },
      { issue: "Refund orders mixed in", where: "gmv < 0 (~0.4% of orders)", detection: "(df['gmv'] < 0).sum()", treatment: "Two defensible choices: net them into customer revenue (refund-adjusted) or exclude from cohort tables. For retention timing, decide whether a refund is an 'order event' — recommended: exclude from counts, net from revenue." },
      { issue: "Region casing variants", where: "region — 'midwest' vs 'Midwest'", detection: "value_counts()", treatment: "title-case to canonical regions." },
      { issue: "Duplicate orders", where: "~0.6% duplicated rows", detection: "duplicated('order_id').sum()", treatment: "Drop; duplicates would inflate both order counts and revenue." },
      { issue: "Channel recorded per order, not per customer", where: "channel changes across a customer's orders", detection: "nunique(channel) per customer > 1 for a visible share", treatment: "A modelling decision, not a defect: define acquisition channel = channel of the FIRST order (document it; test sensitivity vs 'any channel')." },
      { issue: "Right-censoring", where: "Recent cohorts have not had time to repeat", detection: "cohort month vs observation window end", treatment: "Report retention only up to the age each cohort has actually lived (triangle the matrix); never compare a 2-month cohort's 90-day retention." },
    ],
    cleaningPlan: [
      { action: "Deduplicate orders; canonicalise regions; parse dates", rationale: "Basics before structures." },
      { action: "Separate refunds from purchase events; net revenue, exclude from order timing", rationale: "Retention timing and revenue netting answer different questions; conflating them corrupts both." },
      { action: "Rebuild first_order_date and cohort month per customer from order history", rationale: "The included column is unreliable; the cohort is the analysis's foundation." },
      { action: "Define acquisition channel as first-order channel; flag multi-channel customers", rationale: "Cohort comparisons need one channel per customer; the flag quantifies the simplification." },
      { action: "Construct the cohort-age grid: for each cohort month and age bucket, customers active", rationale: "The retention matrix is the project's central artefact." },
    ],
    edaPlan: [
      { question: "Acquisition trend and mix", method: "new customers per month by first-order channel", expectation: "Growing acquisition with Paid Search's share rising — the mix-shift suspect." },
      { question: "Repeat rates by cohort", method: "share of each cohort ordering again by age 1/3/6 months", expectation: "Older organic-heavy cohorts ~30% repeat at 90 days; newer paid-heavy cohorts ~24% — part mix, part behaviour." },
      { question: "Channel repeat curves", method: "retention curve per acquisition channel (first-order cohorts)", expectation: "Referral and Email retain best; Paid Search and Social worst." },
      { question: "Order frequency and value", method: "orders per repeat customer, AOV by cohort and channel", expectation: "AOV stable; frequency slightly declining in recent cohorts." },
      { question: "Revenue concentration", method: "share of revenue from top decile customers", expectation: "Top 10% of customers ≈ 35–40% of revenue." },
      { question: "Device and region effects", method: "repeat rate by device and region", expectation: "Desktop buyers repeat modestly better; regions flat." },
    ],
    statisticsPlan: [
      { technique: "Cohort retention matrices (triangled)", purpose: "The core measurement: repeat behaviour by acquisition vintage", expectation: "Classic decay curves; recent right-edge cohorts censored." },
      { technique: "Mix-adjusted retention (direct standardisation)", purpose: "Separate mix shift from true behaviour change", expectation: "Roughly half the apparent decline disappears after mix adjustment." },
      { technique: "Hazard-rate intuition (repeat probability by customer age)", purpose: "Understand WHEN customers churn", expectation: "Hazard highest in months 1–3 then declining — the window for interventions." },
      { technique: "CLV model: expected orders × AOV with retention decay, discounted", purpose: "12-month CLV by channel with explicit assumptions", expectation: "Referral ~2× Paid Search CLV; most channels' 12-month CLV between $140–260." },
      { technique: "Sensitivity analysis on CLV assumptions", purpose: "Stress the channel ranking", expectation: "Rankings stable to AOV and decay assumptions; sensitive to assuming future channel mix stability." },
    ],
    visualisationPlan: [
      { chart: "Cohort retention heatmap (cohort month × age)", answers: "Is retention declining?", reads: "Read left-to-right decay; compare columns at the same age only (censoring respected)." },
      { chart: "Retention curves by acquisition channel", answers: "Which channels stick?", reads: "Curve separation at 90 and 180 days." },
      { chart: "Waterfall — apparent decline split into mix vs behaviour", answers: "How much decline is real?", reads: "Two stacked components bridging old to new cohort retention." },
      { chart: "CLV vs CAC scatter by channel (bubble = new customers)", answers: "Which acquisition bets pay back?", reads: "Channels above the 3:1 line clear the bar." },
      { chart: "Hazard curve — repeat probability by customer age", answers: "When do we lose them?", reads: "Front-loaded risk in months 1–3." },
    ],
    findings: [
      "True repeat behaviour has softened modestly (about −3 points at 90 days year-on-year after mix adjustment), but the scary headline decline is mostly acquisition mix: Paid Search's share of new customers rose sharply and those customers repeat less.",
      "Referral and Email-acquired customers repeat at roughly 1.5–1.8× the rate of Paid Search customers at 90 days; the channel gap persists at every cohort age.",
      "Churn hazard is front-loaded: roughly half of eventual repeat customers have reordered within 90 days; months 1–3 are the decisive window for lifecycle messaging.",
      "Modelled 12-month CLV ranges from ~$150 for Social to ~$260 for Referral; at plausible CACs only Referral, Email and Organic clearly clear a 3:1 LTV:CAC bar — Paid Search hovers near 1.5–2:1.",
      "Revenue is concentrated: the top decile of customers carries ~38% of net revenue, so retention economics compound through a small loyal core.",
    ],
    recommendations: [
      { what: "Rebalance acquisition toward Referral (programme with incentives) and Email capture before pushing more Paid Search budget", why: "Channel-level retention and CLV clearly favour them; the marginal paid dollar is buying the least loyal cohort.", impact: "Structurally better blended retention and LTV:CAC", horizon: "this quarter" },
      { what: "Launch a 90-day lifecycle programme targeted at the first-reorder window", why: "Hazard is front-loaded; the months 1–3 window decides most of the repeat outcome.", impact: "Even +3pts repeat rate ≈ material revenue on the whole acquisition base", horizon: "this quarter" },
      { what: "Report retention mix-adjusted every quarter so channel mix can't impersonate a behaviour change again", why: "The headline metric alarmed the board partly by conflating mix with behaviour.", impact: "Decision quality; avoids false alarms", horizon: "immediate" },
      { what: "Set channel-level CAC ceilings from the CLV model before next year's budget", why: "A 3:1 (or explicit 2:1 growth-stage) bar converts the CLV analysis into a spend rule.", impact: "Budget discipline anchored to unit economics", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "The retention scare is two-thirds story, one-third substance. Cohort analysis shows the headline decline in repeat rate is mostly acquisition mix — Paid Search now supplies far more of the less-loyal customers — while true behaviour softened about three points. Channel economics are decisive: Referral and Email customers retain at 1.5–1.8× Paid Search customers and only they clearly clear the 3:1 LTV:CAC bar at current CACs. Churn risk is front-loaded into the first 90 days, which makes a lifecycle programme the highest-leverage retention action available. This pack includes the mix-adjustment, the CLV assumptions with sensitivities, and a channel CAC-ceiling proposal the board can adopt directly.",
      structure: [
        "1. The board's question and scope",
        "2. Order data, quality treatment and cohort construction",
        "3. Acquisition trend and channel mix shift",
        "4. Retention matrices and the mix-vs-behaviour decomposition",
        "5. Channel retention curves and hazard profile",
        "6. CLV model: assumptions, results, sensitivities",
        "7. LTV:CAC by channel and budget guidance",
        "8. Appendix: cleaning log, model assumptions, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Trust nothing derived",
        goal: "Load the orders, and re-derive the one column the analysis stands on.",
        instructions: [
          "Load and profile; note negative GMV rows (refunds) and duplicated order_ids.",
          "Rebuild first_order_date from the order history (min order_date per customer); compare against the supplied column and quantify the disagreement.",
          "Define the analysis date (max order_date) — every retention figure is 'as of' this date, and censoring starts here.",
        ],
        hints: [
          "When a dataset ships a derived column you can recompute, recompute it: trust is earned per column.",
          "df.groupby('customer_id')['order_date'].transform('min') then compare to the shipped column — count mismatches and visualize the worst.",
          "Censoring is the advanced-project trap: a cohort acquired last month cannot have a 90-day repeat rate. Every matrix you build must be triangled.",
        ],
        checkpoint: "A rebuilt cohort column, a mismatch count, and a written analysis-as-of date.",
        code: {
          label: "Rebuild cohorts",
          language: "python",
          source: `df = pd.read_csv("ecommerce-03-retention-orders.csv", parse_dates=["order_date"])
true_first = df.groupby("customer_id")["order_date"].transform("min")
shipped = pd.to_datetime(df["first_order_date"], errors="coerce")
print("mismatched/missing:", (shipped != true_first).sum(), "of", len(df))

df["cohort"] = true_first.dt.to_period("M")
df["acq_channel"] = df.sort_values("order_date").groupby("customer_id")["channel"].transform("first")
AS_OF = df["order_date"].max()`,
        },
      },
      {
        phase: "quality",
        title: "Audit with commerce semantics",
        goal: "Handle refunds, duplicates, casing and the multi-channel customer question.",
        instructions: [
          "Quantify refund orders and decide (document) how they enter revenue vs order timing.",
          "Deduplicate; canonicalise regions; verify channel values.",
          "Measure multi-channel customers: share whose orders span >1 channel — this decides how much the 'first-order channel' definition matters.",
        ],
        hints: [
          "Refunds: netting revenue is standard; counting a refund as an 'order event' in retention timing is not — separate the two treatments explicitly.",
          "Multi-channel share above ~15% means first-order-channel cohorts deserve a sensitivity check later.",
          "Region casing is routine; the audit's real product is the refund and channel-semantics documentation.",
        ],
        checkpoint: "A written semantics doc: what counts as an order, as revenue, as acquisition channel.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "One frame per customer with cohort, channel, censoring age, and net revenue.",
        instructions: [
          "Apply your semantics: dedupe, region casing, refund split; create a purchase-events frame (timing) and a revenue frame (net).",
          "Build the customer frame: cohort month, acquisition channel, first/last order, orders count, net revenue, months observed.",
          "Build the cohort-age long table: (cohort, age_months, customers_ordering) — the matrix-ready form.",
        ],
        hints: [
          "Age in months: (order_date.year*12 + order_date.month) − (cohort.start year*12 + month) — avoids day-count artifacts.",
          "customers = df.groupby(['customer_id']) once, then join aggregates; resist doing cohort math on the raw orders repeatedly.",
          "The long cohort-age table is better than a wide matrix for plotting AND for censoring logic.",
        ],
        checkpoint: "A customer frame and a cohort-age table, both inspectable in one head() call.",
        code: {
          label: "Customer frame",
          language: "python",
          source: `purch = df[df["gmv"] > 0].drop_duplicates("order_id")
cust = purch.groupby("customer_id").agg(
    cohort=("cohort", "first"),
    acq_channel=("acq_channel", "first"),
    first_order=("order_date", "min"),
    last_order=("order_date", "max"),
    orders=("order_id", "count"),
    net_revenue=("gmv", "sum"),
)
cust["months_observed"] = (AS_OF.dt.year*12 + AS_OF.dt.month) - (cust["first_order"].dt.year*12 + cust["first_order"].dt.month)
cust["age_mo"] = (cust["last_order"].dt.year*12 + cust["last_order"].dt.month) - (cust["first_order"].dt.year*12 + cust["first_order"].dt.month)`,
        },
      },
      {
        phase: "eda",
        title: "Matrices and curves",
        goal: "The retention matrix, channel curves, and the acquisition mix shift.",
        instructions: [
          "Compute the triangled retention matrix: share of each cohort ordering in each age bucket (≤ months observed).",
          "Plot retention curves by acquisition channel at fixed ages (30/90/180 days equivalents).",
          "Acquisition trend: new customers per month stacked by channel — the mix-shift exhibit.",
        ],
        hints: [
          "Retention at age k = customers with an order in month k / cohort size, computed only for cohorts old enough to have lived age k.",
          "Pivot the long table: matrix = long.pivot(index='cohort', columns='age_mo', values='retention') then mask ages > cohort's observed age.",
          "Compare curves only at ages all plotted channels' cohorts have reached — otherwise you're comparing apples to censored fruit.",
        ],
        checkpoint: "A triangled matrix and channel curves; you can quote 90-day retention for old vs recent cohorts.",
        code: {
          label: "Retention matrix",
          language: "python",
          source: `purch["age_mo"] = (purch["order_date"].dt.year*12 + purch["order_date"].dt.month) \\
    - (purch["cohort"].dt.year*12 + purch["cohort"].dt.month)
active = purch.groupby(["cohort", "age_mo"])["customer_id"].nunique().rename("active")
size = purch.groupby("cohort")["customer_id"].nunique().rename("size")
matrix = (active / size).unstack("age_mo")
print(matrix.round(2))  # recent cohorts' right edge is censored — don't read it`,
        },
      },
      {
        phase: "statistics",
        title: "Decompose the decline and model CLV",
        goal: "Mix adjustment, hazard profile, and a sensitivity-tested CLV.",
        instructions: [
          "Direct standardisation: compute recent-cohort retention using OLD cohort channel weights — how much decline survives?",
          "Hazard: P(order in month k | active through k−1) by customer age; identify the front-loaded window.",
          "CLV by channel: expected orders in 12 months (from survival curve) × net AOV, with a discount rate; compute LTV:CAC at stated CACs. Stress the two assumptions you'd defend least.",
        ],
        hints: [
          "Mix adjustment one-liner: recent_retention_adjusted = Σ_channel (old_mix_c × recent_retention_c) — compare to the raw recent figure.",
          "Hazard in month k = orders_in_k / customers_alive_at_k−1; front-loaded hazard means early interventions dominate.",
          "CLV discipline: every number in the model traces to a table or an ASSUMPTION list; the board will attack the assumptions — pre-empt with sensitivities.",
        ],
        checkpoint: "A mix-adjusted decline figure, a hazard curve, and a CLV table with two stress tests.",
        code: {
          label: "Mix adjustment and CLV",
          language: "python",
          source: `# channel mix, old vs recent cohorts
old = cust[cust["cohort"] < "2024-10"]
new = cust[cust["cohort"] >= "2025-04"]
old_mix = old["acq_channel"].value_counts(normalize=True)
new_mix = new["acq_channel"].value_counts(normalize=True)
ret_by_ch = new.groupby("acq_channel")["orders"].apply(lambda s: (s > 1).mean())
adj = (old_mix * ret_by_ch.reindex(old_mix.index)).sum()
raw = (new["orders"] > 1).mean()
print(f"raw repeat {raw:.3f} vs mix-adjusted {adj:.3f}")`,
        },
      },
      {
        phase: "visualisation",
        title: "The retention exhibit set",
        goal: "Five figures a board absorbs in minutes: matrix, curves, waterfall, CLV:CAC, hazard.",
        instructions: [
          "Triangled cohort heatmap (mask censored cells); channel retention curves; mix-vs-behaviour waterfall; CLV vs CAC bubble chart; hazard curve.",
          "Mask censored matrix cells visually (grey) — showing them as low retention is the classic cohort-chart lie.",
          "The waterfall and the CLV:CAC chart carry the budget argument; give them the most polish.",
        ],
        hints: [
          "sns.heatmap(matrix, mask=censored_mask, annot=True, fmt='.0%') — the mask IS the honesty.",
          "Waterfall: start at old-cohort retention, subtract mix component, subtract behaviour component, land at new-cohort retention.",
          "Bubble chart with the 3:1 reference line makes the pass/fail visible without a table.",
        ],
        checkpoint: "Five exhibits, censored cells masked, reference lines drawn.",
      },
      {
        phase: "interpretation",
        title: "The honest retention story",
        goal: "Quantify mix vs behaviour; assign confidence; name the model's weak points.",
        instructions: [
          "State the decomposition result precisely: X points of decline, of which mix explains Y.",
          "Rank channels by 12-month CLV with uncertainty language; flag which ranking survives sensitivity and which doesn't.",
          "List the three assumptions a sceptical CFO would attack first and your answers.",
        ],
        hints: [
          "The board question was 'is retention declining?' — answer it in one sentence with the decomposition numbers, then elaborate.",
          "Confidence language: 'stable under all tested assumptions' vs 'directionally supported but sensitive to X'.",
          "Anticipating the CFO's attack (channel stability, discount effects on net revenue, 18-month window) is what makes the pack survive the meeting.",
        ],
        checkpoint: "A one-sentence answer to the board's question plus the assumption defence list.",
      },
      {
        phase: "recommendations",
        title: "Budget guidance with guardrails",
        goal: "Channel actions, CAC ceilings, and the lifecycle programme.",
        instructions: [
          "Recommend the acquisition rebalance, the CAC-ceiling rule, and the 90-day lifecycle programme — each with expected effect and evidence.",
          "Include the monitoring plan: mix-adjusted retention quarterly, channel CLV semi-annually.",
          "Mark which recommendations are reversible pilots vs structural.",
        ],
        hints: [
          "CAC ceilings translate CLV into a spend rule the budget process can execute without re-litigating the model each time.",
          "The lifecycle programme's metric is first-90-day repeat rate; set a target delta and a review date.",
          "Guardrail idea: cap any single channel at a stated share of new customers to keep mix (and the board's metrics) stable.",
        ],
        checkpoint: "A budget-relevant recommendation set with ceilings, targets and review dates.",
      },
      {
        phase: "report",
        title: "The board pack",
        goal: "A retention-and-CLV pack that answers the board's question and equips the budget debate.",
        instructions: [
          "Follow the outline; open with the one-sentence answer, then the decomposition.",
          "Include the CLV assumption table in the body (the board must see what it's voting on) and the math in the appendix.",
          "Close with the CAC-ceiling proposal as the concrete, adoptable decision.",
        ],
        hints: [
          "Board packs are pre-reads: every figure self-contained, every claim numbered, every assumption visible.",
          "The decomposition waterfall is your lead exhibit — it kills the misleading headline and earns attention for the rest.",
          "Reproducibility appendix: one script, one command, dated outputs.",
        ],
        checkpoint: "The complete board pack, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the company's first retention analyst. The board wants the truth about retention decline, channel-level CLV, and an acquisition budget rule. You own cohort definitions, CLV assumptions and censoring treatment — document all three and defend them in the appendix.",
      deliverables: [
        "Order audit and semantics doc (refunds, acquisition channel, censoring)",
        "Triangled cohort retention matrix and channel retention curves",
        "Mix-vs-behaviour decomposition of the retention change",
        "CLV model by channel with sensitivity analysis and LTV:CAC view",
        "Board pack: answer, exhibits, CAC ceilings, monitoring plan",
      ],
      guardrails: [
        "No censored cohort cell reported as retention",
        "CLV assumptions tabulated and stress-tested",
        "first_order_date rebuilt from order history, not trusted",
        "Acquisition-channel definition documented with sensitivity note",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Cohort month rebuilt from min(order_date), not the shipped column",
        "Retention denominators respect censoring (triangled matrix)",
        "Refunds excluded from order timing; revenue netted where used",
      ],
      "code-quality": [
        "Customer frame built once; cohort logic vectorised, not looped",
        "Censoring mask computed from cohort age, not hardcoded",
      ],
      reasoning: [
        "Mix vs behaviour decomposition attempted and interpreted",
        "CLV assumptions separated from measurements in the narrative",
      ],
      visualization: [
        "Censored matrix cells masked, not displayed as low retention",
        "Channel curves compared only at common, uncensored ages",
      ],
      interpretation: [
        "Hazard front-loading linked to the lifecycle recommendation",
        "Channel CLV ranking qualified by sensitivity results",
      ],
      recommendations: [
        "CAC ceilings derived from the CLV model at a stated ratio",
        "Monitoring plan names metrics, cadence and owner",
      ],
    },
  },
];
