/**
 * SCHOOL H — DATA VISUALIZATION & BI (H1–H6)
 * Visualization principles, statistical charts, dashboard design,
 * data storytelling, Power BI, and Tableau.
 *
 * This school teaches charts, dashboards and stories that tell the
 * truth: perception before statistics, encodings chosen for the
 * question, honesty rules enforced alongside craft, and the two BI
 * tools the industry pays for — taught as they exist today.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolH: SubjectDef[] = [
  {
    slug: "visualization-principles",
    school: "H",
    code: "H1",
    title: "Visualization Principles",
    blurb: "Why charts work, how vision reads them, and the encoding and honesty rules that separate insight from ink.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Explain why perception runs before statistics in data analysis",
      "Choose marks, channels, and chart types from the question being asked",
      "Apply color, text, and annotation that serve meaning and accessibility",
      "Detect and redesign charts that mislead — including your own",
      "Critique any chart with reasoning a designer would accept",
    ],
    outcomes: [
      "A learner can map a question to a chart type and justify the encoding choice",
      "A learner can redesign a misleading chart so it tells the truth",
      "A learner can build colorblind-safe palettes using sequential and diverging scales correctly",
      "A learner can name the perception principle behind any design decision they make",
    ],
    modules: [
      mod(
        "Why Visualize at All",
        "Perception finds patterns that statistics hide — and it works in milliseconds.",
        [
          "Explain why looking at data catches what summaries miss",
          "Read charts as visual systems built for human attention",
        ],
        ["concept-check", "interpret-results", "design-review"],
        [
          ch("The Case for Charts", "Why a picture is analysis, not decoration", [
            L(
              "Same Stats, Different Shapes",
              20,
              ["Anscombe's quartet", "summary statistics", "scatterplot"],
              "Four datasets with identical statistics plot as four different stories — the case for looking.",
              "worked-example"
            ),
            L(
              "Perception Before Statistics",
              20,
              ["perception", "pattern recognition", "visual reasoning"],
              "See how the visual system extracts structure before any number is computed."
            ),
            L(
              "Sketch Before You Plot",
              25,
              ["thumbnail sketch", "paper prototype", "iteration"],
              "Draft chart ideas on paper first and kill the weak ones before touching a tool.",
              "guided-practice"
            ),
          ]),
          ch("How Vision Reads a Chart", "The mechanics of attention every chart exploits or insults", [
            L(
              "Preattentive Attributes and Pop-Out",
              20,
              ["preattentive attributes", "pop-out", "salience"],
              "Learn which visual features the brain processes instantly — and how to spend them."
            ),
            L(
              "Gestalt Principles on the Page",
              25,
              ["gestalt", "proximity", "similarity", "closure"],
              "Group marks with proximity, similarity, and enclosure — no boxes required."
            ),
          ]),
        ]
      ),
      mod(
        "The Encoding Decision",
        "Every chart is an argument about which visual property should carry which data.",
        [
          "Map data fields to marks and channels deliberately",
          "Choose a chart type from the question, never from the tool",
        ],
        ["concept-check", "interpret-results", "case-analysis"],
        [
          ch("Marks and Channels", "The vocabulary for describing any chart's grammar", [
            L(
              "Marks and Channels Defined",
              20,
              ["mark", "channel", "data type"],
              "Separate what represents a data item from what encodes its value."
            ),
            L(
              "Position Beats Color: The Encoding Ladder",
              25,
              ["encoding effectiveness", "position", "color intensity"],
              "Rank visual channels by decoding accuracy and design from the top down."
            ),
            L(
              "Match Channels to Data Types",
              25,
              ["categorical", "ordered", "quantitative"],
              "Pair nominal, ordinal, and quantitative data with channels that respect them."
            ),
          ]),
          ch("From Question to Chart", "A repeatable path from the question to the right chart", [
            L(
              "Let the Question Choose the Chart",
              25,
              ["comparison", "distribution", "relationship", "trend"],
              "Classify the question — compare, distribute, relate, or evolve — and the chart follows."
            ),
            L(
              "When a Table Beats a Chart",
              20,
              ["lookup task", "precision", "small data"],
              "Know the cases — exact lookup, tiny data, parallel reading — where a table wins outright.",
              "review"
            ),
          ]),
        ]
      ),
      mod(
        "Color, Text, and Accessibility",
        "Palettes, words, and access rules that make a chart legible to every reader.",
        [
          "Choose palettes that carry meaning instead of decoration",
          "Write titles and annotations that do real work",
          "Design charts that survive impaired color vision",
        ],
        ["design-review", "concept-check", "multiple-choice"],
        [
          ch("Color With a Job", "Palettes chosen for data, not for fashion", [
            L(
              "Palettes With Jobs",
              20,
              ["categorical palette", "accent color", "restraint"],
              "Use one accent strategically and mute everything that is not the point."
            ),
            L(
              "Sequential, Diverging, Categorical",
              25,
              ["sequential palette", "diverging palette", "midpoint"],
              "Pick the palette class that matches your data's logic — order, split, or category."
            ),
            L(
              "Colorblind-Safe by Default",
              25,
              ["color vision deficiency", "redundant encoding", "simulation"],
              "Design red and green out of your defaults and verify every chart in a simulator.",
              "guided-practice"
            ),
          ]),
          ch("Text, Annotation, and Accessibility", "The words on a chart are part of the chart", [
            L(
              "Titles That State the Finding",
              25,
              ["insight headline", "takeaway title", "topic title"],
              "Upgrade titles from topic labels to one-sentence findings the reader cannot miss."
            ),
            L(
              "Annotation as Guided Reading",
              25,
              ["annotation", "callout", "reference line"],
              "Point at the thing that matters — annotation is the chart's narration layer."
            ),
            L(
              "Accessible by Design",
              25,
              ["contrast", "minimum size", "redundant encoding"],
              "Meet contrast and size minimums, and never let color be the only signal.",
              "review"
            ),
          ]),
        ]
      ),
      mod(
        "Honesty Rules and the Redesign Habit",
        "The classic ways charts lie — and the critique loop that keeps yours honest.",
        [
          "Name the classic honesty violations on sight",
          "Run a structured critique-and-redesign on any chart",
        ],
        ["design-review", "case-analysis", "concept-check"],
        [
          ch("The Honesty Rules", "Truncated axes, dual axes, and other crimes against readers", [
            L(
              "Truncated Axes: The Baseline Contract",
              25,
              ["baseline", "truncated axis", "bar length"],
              "Bars encode length and length starts at zero — truncation is borrowing trouble."
            ),
            L(
              "Dual Axes and 3D Pies",
              25,
              ["dual axis", "3D distortion", "angle decoding"],
              "Learn the two classics of manufactured correlation and inflated share."
            ),
            L(
              "Cherry-Picking, Windows, and Frames",
              25,
              ["cherry-picking", "time window", "framing"],
              "Spot data windows and frames chosen to flatter rather than inform.",
              "worked-example"
            ),
          ]),
          ch("Critique and Redesign", "Critique as a repeatable engineering practice", [
            L(
              "The Chart Critique Protocol",
              30,
              ["critique", "checklist", "redesign"],
              "Run a repeatable critique: question, encoding, color, text, honesty.",
              "guided-practice"
            ),
            L(
              "Redesign One Chart, Defend Every Choice",
              35,
              ["before and after", "justification", "iteration"],
              "Take a flawed chart from raw to honest and defend each change in writing.",
              "guided-practice",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Visualization Principles Final", 45, 20),
    projects: [
      proj(
        "The Misleading Chart Makeover",
        "Find a published chart that breaks at least two honesty rules — a truncated bar baseline, a dual axis, or a 3D pie — redesign it honestly, and write a defense of every change.",
        4,
        "guided",
        [
          "Before and after versions presented side by side",
          "A short defense naming each change and the principle behind it",
          "A note on what the original implied versus what the data actually says",
        ],
        [
          "The redesign removes the distortion without introducing new ones",
          "Every change is justified by a principle, not by taste",
          "The final chart clearly answers a stated question",
        ],
        ["pen and paper", "any charting tool"]
      ),
      proj(
        "One Dataset, Five Questions",
        "Take one small dataset and sketch five different charts for five different questions about it, then argue in writing which encodings served each question best.",
        3,
        "independent",
        [
          "Five distinct chart sketches, each tied to a stated question",
          "A one-paragraph encoding argument per chart",
          "One final pick: the best chart for the most important question",
        ],
        [
          "Each chart actually answers its stated question",
          "Encoding choices reference the effectiveness ladder",
          "The write-up is honest about tradeoffs",
        ],
        ["pen and paper", "any charting tool"]
      ),
    ],
    placementEligible: true,
    keywords: ["data visualization", "visual perception", "encoding", "color palettes", "chart honesty", "annotation"],
  },
  {
    slug: "statistical-charts",
    school: "H",
    code: "H2",
    title: "Statistical Charts",
    blurb: "Distributions, comparisons, relationships, and time — the statistical charts that show what data really looks like.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["visualization-principles", "descriptive-statistics"],
    softPrerequisites: [],
    objectives: [
      "Choose distribution charts that match the data and the question",
      "Compare groups without baseline, binning, or aggregation traps",
      "Display relationships from a hundred points to a million",
      "Represent uncertainty on charts without fear or distortion",
      "Build time series and small multiples that support honest comparison",
    ],
    outcomes: [
      "A learner can pick a histogram binwidth and explain how it changes the message",
      "A learner can add error bars and label them correctly as SD, SE, or confidence intervals",
      "A learner can build small multiples with shared scales for clean comparison",
      "A learner can annotate a time series to separate signal from seasonal noise",
    ],
    modules: [
      mod(
        "Showing Distributions",
        "The shape of a variable — center, spread, tails, modes — and the charts that reveal it.",
        [
          "Reveal the shape of a variable with the right distribution chart",
          "Diagnose when a distribution chart is lying to its reader",
        ],
        ["concept-check", "interpret-results", "dataset-task"],
        [
          ch("Histograms and Density", "Binwidth and bandwidth are decisions, not defaults", [
            L(
              "Histograms and the Binwidth Question",
              30,
              ["binwidth", "bin count", "sensitivity"],
              "Every histogram has a free parameter — treat binwidth as a decision, not a default."
            ),
            L(
              "Density Plots and Smoothing",
              30,
              ["kernel density", "bandwidth", "smoothing"],
              "See how bandwidth trades detail for shape, exactly as binwidth does."
            ),
            L(
              "When Histograms Mislead",
              25,
              ["binning artifact", "skew", "outliers"],
              "Watch identical data tell opposite stories under different bin choices.",
              "worked-example"
            ),
          ]),
          ch("Box Plots, Violins, and Q-Q", "Summaries of spread — and their blind spots", [
            L(
              "Box Plots, Quartiles, and Outliers",
              30,
              ["quartiles", "IQR", "outlier fence"],
              "Read the five-number summary drawn as a box — and what it folds away."
            ),
            L(
              "Violin Plots and Multimodal Shapes",
              25,
              ["violin plot", "mirrored density", "multimodal"],
              "See the modes a box plot hides inside its box."
            ),
            L(
              "Q-Q Plots: A First Look at Normality",
              30,
              ["quantile-quantile plot", "normality", "tail behavior"],
              "Compare your data's quantiles to the normal's and read the curvature.",
              "worked-example"
            ),
          ]),
        ]
      ),
      mod(
        "Comparing Groups Honestly",
        "Group comparisons where every axis, bin, and error bar is chosen with intent.",
        [
          "Compare group values without exaggerating differences",
          "Add uncertainty to charts that readers interpret correctly",
        ],
        ["interpret-results", "concept-check", "case-analysis"],
        [
          ch("Bars and Baselines", "Length encodings and the traps they invite", [
            L(
              "Bar Charts Need Zero",
              25,
              ["baseline rule", "length encoding", "truncation"],
              "Bars are length encodings — cutting the baseline manufactures drama."
            ),
            L(
              "Dot Plots for Many Groups",
              30,
              ["dot plot", "sorted categories", "clutter"],
              "Swap bars for dots when categories multiply or space is tight."
            ),
            L(
              "Aggregates Hide the Story",
              25,
              ["aggregation trap", "Simpson's pattern", "spread"],
              "See how group averages can erase the variation that matters."
            ),
          ]),
          ch("Error Bars and Uncertainty", "What those whiskers mean — and what they never mean", [
            L(
              "What Error Bars Actually Show",
              30,
              ["standard deviation", "standard error", "confidence interval"],
              "SD, SE, and CI bars answer different questions — label which one you drew."
            ),
            L(
              "Reading Overlapping Intervals",
              30,
              ["overlap", "difference interval", "eye estimation"],
              "Overlapping intervals do not decide comparisons — the difference's own interval does."
            ),
            L(
              "Uncertainty Without the Fear",
              25,
              ["uncertainty band", "fan chart", "communication"],
              "Show intervals as part of the story, not as an apology."
            ),
          ]),
        ]
      ),
      mod(
        "Relationships Between Variables",
        "Scatterplots, density bins, and panels — relationships at any data scale.",
        [
          "Show x–y relationships at any data scale",
          "Use panels instead of overplotting",
        ],
        ["dataset-task", "interpret-results", "concept-check"],
        [
          ch("Scatterplots at Any Size", "From a hundred points to an ink blot", [
            L(
              "Scatterplots and Overplotting",
              30,
              ["scatterplot", "overplotting", "transparency"],
              "Start with the workhorse of relationships — and meet its ink-blot failure mode."
            ),
            L(
              "Hexbin for Big Data",
              30,
              ["hexbin", "2D binning", "density encoding"],
              "Count points per cell and let color carry density when dots become mud."
            ),
            L(
              "Trend Lines and What They Claim",
              25,
              ["trend line", "extrapolation", "residuals"],
              "Add fit lines deliberately — and refuse to extend them past the data."
            ),
          ]),
          ch("Small Multiples", "One series per panel beats twelve lines per chart", [
            L(
              "Small Multiples Over One Busy Chart",
              30,
              ["small multiples", "facets", "one series per panel"],
              "Give each series its own panel instead of braiding twelve lines together."
            ),
            L(
              "Designing Consistent Panels",
              25,
              ["shared scale", "panel order", "axis range"],
              "Same axes, same colors, deliberate ordering — the rules that make facets comparable."
            ),
          ]),
        ]
      ),
      mod(
        "Time Series and Honest Aggregates",
        "Change over time — without inventing trend, season, or a fake average.",
        [
          "Show change over time without inventing trend or seasonality",
          "Choose aggregation levels that keep the truth intact",
        ],
        ["dataset-task", "interpret-results", "design-review"],
        [
          ch("Time on the x-Axis", "Windows, events, and seasons that shape what looks like signal", [
            L(
              "Line Charts and Windowing",
              30,
              ["moving average", "window size", "smoothing"],
              "Smooth deliberately — every window is a claim about what counts as signal."
            ),
            L(
              "Annotating Events on Time Series",
              25,
              ["event annotation", "reference line", "context"],
              "Mark launches, outages, and holidays so readers stop inventing causes."
            ),
            L(
              "Seasonality and Year-over-Year",
              30,
              ["seasonality", "year-over-year", "indexing"],
              "Compare like with like before declaring growth or decline."
            ),
          ]),
          ch("Honest Aggregation", "What averages erase and percentiles restore", [
            L(
              "Averages Erase People",
              25,
              ["mean vs distribution", "tail metrics", "percentiles"],
              "When the average improves and the tail worsens, only the distribution tells the truth."
            ),
            L(
              "The Statistical Chart Checklist",
              25,
              ["chart selection", "honesty checklist", "review"],
              "A pre-publication review: encoding, baseline, binning, uncertainty, labels.",
              "review"
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Statistical Charts Final", 50, 22),
    projects: [
      proj(
        "One Variable, Four Ways",
        "Choose a quantitative variable from a real dataset and chart its distribution four ways — histogram, density, box plot, and violin — then write when each one misleads.",
        4,
        "guided",
        [
          "Four charts of the same variable, each correctly labeled",
          "A written note per chart on its failure mode",
          "A recommendation of which chart to publish and why",
        ],
        [
          "Binwidth and bandwidth choices are justified",
          "Each chart is honest — baselines, axes, and labels correct",
          "The recommendation references the audience's question",
        ],
        ["any charting tool or library", "a real dataset of your choice"]
      ),
      proj(
        "The Honest Group Comparison",
        "Compare a key metric across at least six groups using dot plots with properly labeled error bars, and document every trap you avoided along the way.",
        6,
        "independent",
        [
          "A dot-plot comparison of at least six groups with labeled error bars",
          "A short methods note stating exactly what the error bars represent",
          "A list of traps checked: baselines, overlap, aggregation",
        ],
        [
          "Error bars are correctly defined and labeled",
          "Group ordering aids comparison rather than obscuring it",
          "The write-up distinguishes what the chart shows from what it implies",
        ],
        ["any charting tool or library", "a real dataset of your choice"]
      ),
    ],
    placementEligible: true,
    keywords: ["distributions", "histogram", "box plot", "error bars", "scatterplot", "small multiples", "time series"],
  },
  {
    slug: "dashboard-design",
    school: "H",
    code: "H3",
    title: "Dashboard Design",
    blurb: "Dashboards are decision tools, not art galleries — design for the glance, the audience, and the decision.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["visualization-principles"],
    softPrerequisites: [],
    objectives: [
      "Analyze audience, decisions, and cadence before building anything",
      "Design layouts whose visual hierarchy survives a five-second glance",
      "Choose interactions whose value outweighs their cost",
      "Apply a design system so consistent color means consistent meaning",
      "Diagnose anti-patterns and lead a structured redesign",
    ],
    outcomes: [
      "A learner can write a dashboard brief that names audience, decisions, metrics, and cadence",
      "A learner can wireframe a summary-to-detail layout with KPI tiles that carry context",
      "A learner can redesign a cluttered dashboard and defend every change with principles",
      "A learner can set filter defaults and refresh cadence honestly",
    ],
    modules: [
      mod(
        "Dashboards Are Decision Tools",
        "Audience, decisions, and cadence come first — charts come last.",
        [
          "Define the audience, the decisions, and the cadence first",
          "Separate decision metrics from vanity metrics",
        ],
        ["case-analysis", "concept-check", "design-review"],
        [
          ch("Audience and Question First", "A dashboard exists to support decisions — so find them", [
            L(
              "Who Decides What, and When?",
              25,
              ["audience analysis", "decision cadence", "consumer"],
              "A dashboard exists to support decisions — so start by finding them."
            ),
            L(
              "Questions Before Charts",
              25,
              ["question inventory", "metric definition", "scope"],
              "Turn stakeholder wishes into a written list of questions the dashboard must answer."
            ),
            L(
              "Vanity Metrics vs Decision Metrics",
              25,
              ["vanity metric", "actionable metric", "metric tree"],
              "Cut the numbers that flatter and keep the numbers that would change a decision."
            ),
          ]),
          ch("The Dashboard Brief", "One page of agreement before a single visual is built", [
            L(
              "Writing the Dashboard Brief",
              25,
              ["brief", "success criteria", "scope"],
              "One page: audience, decisions, questions, metrics, cadence, freshness — agreed before building."
            ),
            L(
              "The Five-Minute Read",
              25,
              ["glance time", "attention budget", "scanning"],
              "Design for how long the reader actually spends — usually minutes, not sessions."
            ),
          ]),
        ]
      ),
      mod(
        "Layout and Visual Hierarchy",
        "Spend the reader's attention where it pays: importance first, detail below.",
        [
          "Arrange a page so importance matches attention",
          "Give every KPI tile the context a decision needs",
        ],
        ["design-review", "concept-check", "interpret-results"],
        [
          ch("Structure the Glance", "Attention enters top-left and falls off fast", [
            L(
              "F-Pattern and Reading Gravity",
              25,
              ["F-pattern", "scan path", "top-left bias"],
              "Screen reading follows an F-shaped scan from the top-left — spend it on purpose."
            ),
            L(
              "KPI Tiles That Mean Something",
              30,
              ["KPI tile", "sparkline", "comparison context"],
              "A number alone is trivia; against target and trend it becomes a signal."
            ),
            L(
              "Summary Above, Detail Below",
              25,
              ["progressive disclosure", "hierarchy", "drill levels"],
              "Layer information from the answer down to the evidence."
            ),
          ]),
          ch("Grids, Alignment, and Space", "The invisible structure that makes a page feel calm", [
            L(
              "Grid Systems and Whitespace",
              25,
              ["grid", "alignment", "whitespace"],
              "Alignment is invisible when right and jarring when wrong — build on a grid."
            ),
            L(
              "Sizing Charts for Their Job",
              25,
              ["aspect ratio", "chart sizing", "density"],
              "Match size to role: glanceable KPI, context trend, or exploratory detail."
            ),
          ]),
        ]
      ),
      mod(
        "Interactions and Design Systems",
        "Every filter earns its place; every color keeps its meaning.",
        [
          "Justify every filter and interaction by value minus cost",
          "Keep meaning stable across every page of the product",
        ],
        ["design-review", "case-analysis", "concept-check"],
        [
          ch("Filters and Their Costs", "Interactivity is not free — count the clicks", [
            L(
              "Few, Obvious, Defaulted Filters",
              30,
              ["filter design", "default state", "filter logic"],
              "Every filter must earn its place and land users on a meaningful view."
            ),
            L(
              "The Cost of Every Click",
              25,
              ["interaction cost", "clicks to insight", "adoption"],
              "Count the clicks to the first insight — then remove two."
            ),
            L(
              "Drill-Down Paths That Lead Somewhere",
              30,
              ["drill-down", "breadcrumbs", "hierarchy"],
              "Detail should be one deliberate trip: from summary to evidence and back."
            ),
          ]),
          ch("One System, Every Page", "Design systems for dashboards: semantics, components, freshness", [
            L(
              "Consistent Color, Consistent Meaning",
              25,
              ["semantic color", "design tokens", "consistency"],
              "If red means bad on page one, red means bad forever."
            ),
            L(
              "Typography and Component Rules",
              25,
              ["type scale", "components", "states"],
              "Set the font sizes, tile shapes, and states once — then reuse them everywhere."
            ),
            L(
              "Data Freshness and Refresh Cadence",
              25,
              ["refresh schedule", "data as of", "staleness"],
              "Match refresh to decision cadence and stamp the data's age where it is read."
            ),
          ]),
        ]
      ),
      mod(
        "Anti-Patterns, Critique, and Redesign",
        "The failure modes every dashboard falls into — and the method that fixes them.",
        [
          "Name the classic dashboard anti-patterns on sight",
          "Run a critique-and-redesign cycle with a defensible result",
        ],
        ["design-review", "case-analysis", "concept-check"],
        [
          ch("Anti-Patterns", "The chart junk wall and its relatives", [
            L(
              "The Chart Junk Wall",
              25,
              ["chart junk", "decoration", "data ink"],
              "Gauges, gradients, and clip art spend pixels without saying anything."
            ),
            L(
              "Twelve Charts, Zero Answers",
              25,
              ["metric soup", "unfocused layout", "comprehensiveness trap"],
              "Comprehensiveness is not a design — a wall of equals hides the answer."
            ),
            L(
              "When a Report Beats a Dashboard",
              25,
              ["report vs dashboard", "narrative", "self-service"],
              "Some needs are a story, not a screen — forcing a dashboard fails both."
            ),
          ]),
          ch("Critique as Method", "Redesign as a repeatable, reviewable practice", [
            L(
              "The Dashboard Critique Protocol",
              30,
              ["critique protocol", "heuristics", "stakeholder view"],
              "Run a structured critique: audience, hierarchy, encodings, interaction, honesty.",
              "guided-practice"
            ),
            L(
              "Redesign a Bad Dashboard",
              35,
              ["before and after", "redesign defense", "iteration"],
              "Take a genuinely bad dashboard and rebuild it as a decision tool, defending every change.",
              "guided-practice",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Dashboard Design Final", 50, 20),
    projects: [
      proj(
        "Dashboard Brief and Wireframe",
        "Pick a real stakeholder — or a role-played one from the case pack — write the one-page dashboard brief naming audience, decisions, questions, metrics, and cadence, and wireframe the layout before any tooling.",
        3,
        "guided",
        [
          "A one-page brief naming audience, decisions, metrics, and refresh cadence",
          "A wireframe showing hierarchy from KPI summary to detail",
          "A stated list of filters with default values and a justification for each",
        ],
        [
          "Every element traces back to a decision or a question",
          "Hierarchy matches attention: most important top-left",
          "The brief passes a stranger test — no unstated context needed",
        ],
        ["pen and paper", "any wireframing tool"]
      ),
      proj(
        "Redesign a Bad Dashboard and Defend Every Change",
        "Take a genuinely bad dashboard — chart junk walls, vanity KPIs, no hierarchy, filters without defaults — and redesign it into a decision tool, then defend every single change you make.",
        8,
        "independent",
        [
          "Before and after dashboards presented side by side",
          "A change log: every modification and the principle behind it",
          "A short walkthrough narrating how a user reads the new layout",
          "Evidence the redesign serves the brief: audience, decision, cadence",
        ],
        [
          "The redesign keeps the honest numbers and removes only the noise",
          "Every change maps to a named principle, not to taste",
          "The narrative walkthrough matches the actual layout flow",
          "Vanity metrics were identified and demoted or replaced",
        ],
        ["any BI tool"]
      ),
    ],
    placementEligible: true,
    keywords: ["dashboards", "KPI tiles", "visual hierarchy", "filters", "design system", "drill-down", "anti-patterns"],
  },
  {
    slug: "data-storytelling",
    school: "H",
    code: "H4",
    title: "Data Storytelling",
    blurb: "Turn analysis into narrative — structures, headlines, and honest framing that make data change minds.",
    difficulty: "beginner",
    track: "core",
    prerequisites: ["visualization-principles"],
    softPrerequisites: [],
    objectives: [
      "Transform raw findings into a story with a clear so-what",
      "Structure stories with situation-complication-resolution and the Minto pyramid",
      "Write headlines and annotations that carry the argument",
      "Adapt one story for executive and technical audiences",
      "Frame every claim honestly — including what the data does not say",
    ],
    outcomes: [
      "A learner can convert an analysis into an insight-first story where each chart carries one claim",
      "A learner can write a headline that states the chart's takeaway in a sentence",
      "A learner can adapt the same story for an executive and a technical audience",
      "A learner can list what the data does not support and say so out loud",
    ],
    modules: [
      mod(
        "From Analysis to Narrative",
        "The pipeline from raw output to an argument — with structure doing the carrying.",
        [
          "Separate findings from insights from stories",
          "Structure a story that survives the one-chart test",
        ],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch("The Insight-to-Story Pipeline", "Findings, insights, and the so-what that earns attention", [
            L(
              "Findings, Insights, and So-Whats",
              25,
              ["finding", "insight", "so-what test"],
              "A finding is a fact; an insight says what it means; a story says what to do."
            ),
            L(
              "The Insight-to-Story Pipeline",
              30,
              ["pipeline", "narrative transformation", "editing"],
              "Walk one analysis through the pipeline: raw output to distilled argument.",
              "worked-example"
            ),
            L(
              "The One-Chart Test",
              25,
              ["one chart per claim", "redundancy", "focus"],
              "If this chart were the only one, would it carry the claim? If not, fix it or cut it."
            ),
          ]),
          ch("Structures That Carry a Story", "SCR and the Minto pyramid — shapes that hold attention", [
            L(
              "Situation, Complication, Resolution",
              30,
              ["SCR structure", "narrative arc", "tension"],
              "Ground the audience, break the ground, then resolve — the shape that holds attention."
            ),
            L(
              "The Minto Pyramid",
              30,
              ["Minto pyramid", "governing thought", "grouped arguments"],
              "Answer first, then the arguments, then the evidence — readers stop when convinced."
            ),
            L(
              "Storyboards Before Slides",
              25,
              ["storyboard", "sequencing", "rough draft"],
              "Sequence the argument as a storyboard before producing a single polished chart.",
              "guided-practice"
            ),
          ]),
        ]
      ),
      mod(
        "Writing the Story on the Chart",
        "Titles, annotations, and framing that do narrative work — and stay honest.",
        [
          "Make titles, annotation, and captions do narrative work",
          "Keep emphasis honest when the stakes are high",
        ],
        ["design-review", "case-analysis", "concept-check"],
        [
          ch("Headlines and Annotation", "The words on a chart are the chart", [
            L(
              "Headlines That State the Insight",
              25,
              ["insight headline", "action title", "topic title"],
              "Titles should report conclusions — the reader should learn from the title alone."
            ),
            L(
              "Annotation as Narration",
              25,
              ["annotation", "emphasis", "reading path"],
              "Mark the turning points so the reader's eye follows your argument."
            ),
            L(
              "Captions, Sources, and Context",
              25,
              ["caption", "source line", "scope note"],
              "Say where the data came from and what it covers — context is credibility."
            ),
          ]),
          ch("Honest Framing", "Telling the truth includes telling what you cannot claim", [
            L(
              "What the Data Does Not Say",
              25,
              ["claim scope", "unsupported claims", "limitations"],
              "Write the list of things your data cannot support — then publish it with the story."
            ),
            L(
              "Emphasis Without Deception",
              25,
              ["emphasis", "restraint", "contrast"],
              "Direct attention with hierarchy, not with distortion — the line between them is the job."
            ),
          ]),
        ]
      ),
      mod(
        "Audience and Delivery",
        "The same truth, told differently for executives, analysts, and mixed rooms.",
        [
          "Adapt one analysis to different audiences without changing the truth",
          "Present charts live and survive the questions",
        ],
        ["case-analysis", "concept-check", "design-review"],
        [
          ch("Adapt the Story", "Executives buy decisions; analysts audit reasoning", [
            L(
              "Executives: Answer First",
              25,
              ["BLUF", "executive summary", "decision framing"],
              "Executives buy decisions — lead with the recommendation and its stakes."
            ),
            L(
              "Technical Audiences: Show the Work",
              25,
              ["methodology", "reproducibility", "appendix"],
              "Analysts audit reasoning — keep the method one click behind the claim."
            ),
            L(
              "Mixed Rooms and Layered Documents",
              25,
              ["layering", "progressive detail", "backup slides"],
              "One story, several depths: headline for all, detail for those who stay."
            ),
          ]),
          ch("Live With Charts", "Presenting a story with live charts and live humans", [
            L(
              "Presenting Charts Live",
              25,
              ["presentation flow", "chart walkthrough", "pointing"],
              "Walk one chart at a time: setup, reveal, takeaway — never read axis labels aloud.",
              "guided-practice"
            ),
            L(
              "Slides Are Not Documents",
              25,
              ["slide discipline", "handout", "density"],
              "Slides carry the talk; documents carry the detail — design each for its job."
            ),
            L(
              "Handling Questions and Pushback",
              25,
              ["anticipated objections", "backup evidence", "listening"],
              "Prepare answers for the three questions you hope nobody asks — they will be asked."
            ),
          ]),
        ]
      ),
      mod(
        "Stories Under Scrutiny",
        "Worked stories, honesty audits, and peer review as the last mile.",
        [
          "Audit a finished story for honesty before it ships",
          "Give and use critique as a storytelling discipline",
        ],
        ["design-review", "concept-check", "case-analysis"],
        [
          ch("Worked Stories", "Deconstruct the best, then build one end to end", [
            L(
              "Anatomy of a Great Data Story",
              30,
              ["case study", "deconstruction", "craft"],
              "Take apart a published story and find the structure doing the work.",
              "reading"
            ),
            L(
              "Build a Story From Scratch",
              35,
              ["end-to-end story", "synthesis", "drafting"],
              "From raw analysis to final story: run the full pipeline on a small dataset.",
              "worked-example",
              3
            ),
          ]),
          ch("The Honesty Review", "The pre-flight check every story must pass", [
            L(
              "The Pre-Flight Honesty Check",
              25,
              ["claim audit", "evidence chain", "caveats"],
              "Before publishing: every claim has evidence, every cause is checked, every scope stated.",
              "review"
            ),
            L(
              "Your Story, Peer-Reviewed",
              30,
              ["peer feedback", "critique", "revision"],
              "Trade stories with a peer and review each against the honesty checklist.",
              "guided-practice"
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data Storytelling Final", 45, 18),
    projects: [
      proj(
        "Turn an Analysis Into a Story",
        "Take an exploratory analysis — yours or the provided one — and turn it into a story: SCR or pyramid structure, an insight headline on every chart, and one chart per claim.",
        4,
        "guided",
        [
          "A story document with SCR or pyramid structure clearly visible",
          "Every chart titled with its takeaway, not its topic",
          "A stated so-what: the decision the story supports",
        ],
        [
          "Each chart passes the one-chart test for its claim",
          "The structure leads with the answer",
          "Every claim is traceable to a chart or a table",
        ],
        ["any charting tool", "pen and paper"]
      ),
      proj(
        "The Executive Briefing",
        "Deliver a five-slide executive briefing plus a one-page memo arguing one recommendation, with an appendix that honestly lists what the data does not say.",
        5,
        "independent",
        [
          "Five slides, each with an insight headline and at most one chart",
          "A one-page memo leading with the recommendation",
          "An appendix: claims, evidence, and explicit limitations",
        ],
        [
          "The recommendation is stated first and is unambiguous",
          "Every number on a slide appears in the appendix with its source",
          "The limitations section names real constraints, not token caveats",
        ],
        ["any charting tool", "any slide tool"]
      ),
    ],
    placementEligible: true,
    keywords: ["data storytelling", "narrative structure", "Minto pyramid", "annotation", "audience adaptation", "honest framing"],
  },
  {
    slug: "power-bi",
    school: "H",
    code: "H5",
    title: "Power BI",
    blurb: "The industry's BI workhorse end to end: model star schemas, write DAX that respects filter context, and publish secured, refreshing reports.",
    difficulty: "intermediate",
    track: "specialization",
    prerequisites: ["dashboard-design"],
    softPrerequisites: [],
    objectives: [
      "Import and shape data with Power Query into a star-schema model",
      "Control filter flow with relationship direction and cardinality",
      "Write DAX measures with CALCULATE and time intelligence",
      "Assemble formatted, interactive reports with slicers, bookmarks, and drillthrough",
      "Publish with scheduled refresh and understand row-level security",
      "Diagnose report performance with a repeatable hygiene routine",
    ],
    outcomes: [
      "A learner can build a star-schema model with correct single-direction relationships",
      "A learner can write DAX measures that respond correctly to filter context",
      "A learner can build a report page with cross-filtering, bookmarks, and drillthrough",
      "A learner can publish a dataset with scheduled refresh and describe its RLS setup",
    ],
    modules: [
      mod(
        "Get Data and Model It Right",
        "Power Query shaping and the star schema — the model determines everything downstream.",
        [
          "Shape data repeatably with Power Query applied steps",
          "Build a star-schema model that filters predictably",
        ],
        ["concept-check", "dataset-task", "interpret-results"],
        [
          ch("Get Data and Power Query", "Connections, applied steps, and where transformations belong", [
            L(
              "Get Data and Power Query Basics",
              30,
              ["Power Query", "data source", "applied steps"],
              "Connect to data and understand applied steps as a recorded, replayable recipe.",
              "guided-practice"
            ),
            L(
              "Where Transformations Belong",
              30,
              ["Power Query vs model", "applied steps", "repeatability"],
              "Fix data problems upstream in Power Query, not downstream in visuals and measures."
            ),
          ]),
          ch("The Model View", "Facts, dimensions, and the plumbing of filters", [
            L(
              "Star Schema Thinking",
              30,
              ["fact table", "dimension table", "star schema"],
              "Facts are events; dimensions are who-what-where-when — the shape that keeps DAX sane."
            ),
            L(
              "Relationships and Filter Direction",
              30,
              ["cardinality", "single direction", "filter flow"],
              "Watch filters travel from dimensions into facts — the model's invisible plumbing."
            ),
            L(
              "The Cost of Bidirectional Filters",
              25,
              ["bidirectional", "ambiguity", "model hygiene"],
              "See why filters flowing both ways everywhere breeds ambiguity and slow queries.",
              "worked-example"
            ),
          ]),
        ]
      ),
      mod(
        "DAX Essentials",
        "Measures, filter context, CALCULATE, and time intelligence — the language that powers the numbers.",
        [
          "Distinguish measures from calculated columns and choose correctly",
          "Write measures that respect and rewrite filter context",
        ],
        ["write-code", "dataset-task", "concept-check"],
        [
          ch("Measures First", "Aggregations that come alive under filters", [
            L(
              "Measures vs Calculated Columns",
              30,
              ["measure", "calculated column", "evaluation context"],
              "Measures evaluate at query time; columns freeze at refresh — choose with intent."
            ),
            L(
              "Your First Measures",
              30,
              ["SUM", "COUNTROWS", "aggregation"],
              "Write the essential aggregation measures and reuse them everywhere.",
              "guided-practice"
            ),
            L(
              "Filter Context, Explained",
              30,
              ["filter context", "row context", "context transition"],
              "Understand the invisible WHERE clause every visual applies to your measures."
            ),
          ]),
          ch("CALCULATE and Time", "The context engine and the calendar that makes it work", [
            L(
              "CALCULATE: Rewriting Filter Context",
              35,
              ["CALCULATE", "filter modification", "context"],
              "The one function that changes filters before evaluating an expression.",
              "code",
              3
            ),
            L(
              "The Date Table Contract",
              25,
              ["date table", "marked as date table", "contiguous dates"],
              "Build and mark a proper date table — the precondition for time intelligence."
            ),
            L(
              "Time Intelligence Basics",
              30,
              ["year-over-year", "SAMEPERIODLASTYEAR", "year-to-date"],
              "Write year-over-year and YTD measures and know exactly what dates they compare.",
              "code",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Reports That Work",
        "Visuals, formatting restraint, and the interactions that make a page feel guided.",
        [
          "Choose and format visuals with restraint",
          "Design slicers, bookmarks, and drillthrough deliberately",
        ],
        ["dataset-task", "design-review", "concept-check"],
        [
          ch("Core Visuals and Formatting", "Fewer, better-formatted visuals", [
            L(
              "Choosing Core Visuals",
              30,
              ["visual selection", "bar and line", "cards and tables"],
              "Map each question to a visual — then stop adding visuals."
            ),
            L(
              "Formatting With Restraint",
              25,
              ["formatting pane", "theme", "data ink"],
              "Apply the visualization and dashboard design rules inside the formatting pane."
            ),
            L(
              "Slicers and Cross-Filtering",
              30,
              ["slicer", "cross-filtering", "edit interactions"],
              "Make every visual pair's interaction deliberate with Edit interactions.",
              "guided-practice"
            ),
          ]),
          ch("Guided Experiences", "Bookmarks, drillthrough, and tooltips at intro level", [
            L(
              "Bookmarks for Simple Experiences",
              30,
              ["bookmark", "selection pane", "toggle"],
              "Capture view states to build simple navigation and reveal interactions."
            ),
            L(
              "Drillthrough to a Detail Page",
              30,
              ["drillthrough", "detail page", "back button"],
              "Right-click a number, land on its evidence, and return with one click."
            ),
            L(
              "Tooltips and Small Multiples",
              25,
              ["report page tooltip", "small multiples", "micro charts"],
              "Add context where the cursor already is — without cluttering the page."
            ),
          ]),
        ]
      ),
      mod(
        "Publish, Secure, and Perform",
        "The service, scheduled refresh, row-level security, and the performance hygiene routine.",
        [
          "Publish and keep data fresh with scheduled refresh",
          "Apply the performance hygiene routine before shipping",
        ],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("The Power BI Service", "Workspaces, refresh, and roles", [
            L(
              "Publishing to the Service",
              30,
              ["workspace", "report vs dashboard", "app"],
              "Move from Desktop to the service and understand workspaces, reports, and apps."
            ),
            L(
              "Scheduled Refresh and Gateways",
              30,
              ["scheduled refresh", "on-premises gateway", "credentials"],
              "Keep datasets fresh — and learn why on-premises sources need a gateway."
            ),
            L(
              "Row-Level Security in Concept",
              25,
              ["RLS", "roles", "member access"],
              "One report, many filtered views: define roles and test as them."
            ),
          ]),
          ch("Performance Hygiene", "Fast reports are designed, then measured", [
            L(
              "Why Is This Report Slow?",
              30,
              ["Performance Analyzer", "visual count", "DAX cost"],
              "Use Performance Analyzer to find the slow part before guessing at fixes.",
              "worked-example"
            ),
            L(
              "Model Habits That Keep Reports Fast",
              30,
              ["star schema payoff", "measure reuse", "hygiene checklist"],
              "Fewer visuals, a lean model, reused measures — the checklist that ships.",
              "review"
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Power BI Final", 50, 20),
    projects: [
      proj(
        "The Sales Model and KPI Page",
        "Import the provided sales data, build a star-schema model with correct single-direction relationships, write five measures including a year-over-year comparison, and assemble a one-page KPI report.",
        6,
        "guided",
        [
          "A model view screenshot showing the star schema",
          "Five working measures, including one year-over-year comparison",
          "A one-page report with KPI tiles, slicers, and formatted visuals",
        ],
        [
          "Relationships are single-direction with justified cardinality",
          "The year-over-year measure matches hand-computed expected values",
          "The report page follows the dashboard-design hierarchy rules",
        ],
        ["Power BI Desktop"]
      ),
      proj(
        "Publish a Secured, Refreshing Report",
        "Take the KPI page to production: publish to a workspace, configure scheduled refresh, define and test one row-level security role, and document a performance self-check.",
        8,
        "independent",
        [
          "The published report with a visible data-freshness stamp",
          "A scheduled refresh configured and its failure path noted",
          "One row-level security role defined, with a test-as-role screenshot",
          "A short performance notes file with before and after timings",
        ],
        [
          "Refresh cadence matches the decision cadence stated in the brief",
          "RLS blocks out-of-role data — verified, not assumed",
          "Performance notes name the slowest visual and the fix applied",
        ],
        ["Power BI Desktop", "Power BI service"]
      ),
    ],
    placementEligible: true,
    keywords: ["power bi", "dax", "power query", "star schema", "data model", "row-level security", "scheduled refresh"],
  },
  {
    slug: "tableau",
    school: "H",
    code: "H6",
    title: "Tableau",
    blurb: "Tableau's visual grammar end to end: dimensions and measures, calculations and LODs, dashboards, stories, and publishing.",
    difficulty: "intermediate",
    track: "specialization",
    prerequisites: ["dashboard-design"],
    softPrerequisites: [],
    objectives: [
      "Work the Tableau paradigm: pills, shelves, and the marks card",
      "Connect to data and choose live versus extract deliberately",
      "Write calculated fields, table calculations, and introductory LOD expressions",
      "Build the core charts and interactive dashboards with actions",
      "Tell sequential stories with story points and the Pages shelf",
      "Publish to Tableau Public or Server with performance in mind",
    ],
    outcomes: [
      "A learner can build the core chart types from pills without Show Me",
      "A learner can explain when a FIXED LOD expression is needed and what it computes",
      "A learner can assemble a dashboard with filter and highlight actions",
      "A learner can publish a story and keep a workbook performant with extracts",
    ],
    modules: [
      mod(
        "The Tableau Paradigm",
        "Dimensions, measures, pills, and shelves — the drag-and-drop grammar behind every view.",
        [
          "Build views by placing pills deliberately",
          "Choose the right connection type for freshness and speed",
        ],
        ["concept-check", "dataset-task", "interpret-results"],
        [
          ch("Dimensions, Measures, and Pills", "The mental model that makes Tableau click", [
            L(
              "The Tableau Mental Model",
              25,
              ["drag and drop grammar", "shelves", "view building"],
              "Understand Tableau as a grammar: fields placed on shelves compose views."
            ),
            L(
              "Dimensions vs Measures",
              30,
              ["dimension", "measure", "aggregation"],
              "Dimensions slice; measures aggregate — misclassified fields misbehave everywhere."
            ),
            L(
              "Pills, Shelves, and the Marks Card",
              30,
              ["blue vs green", "discrete vs continuous", "marks card"],
              "Read pill colors and the marks card fluently — the language of every view.",
              "guided-practice"
            ),
          ]),
          ch("Connecting to Data", "Live connections, extracts, and clean sources", [
            L(
              "Live Connections vs Extracts",
              30,
              ["live connection", "extract", "freshness tradeoff"],
              "Choose between live freshness and extract speed with open eyes."
            ),
            L(
              "Joins and Relationships, Intro Level",
              30,
              ["join", "relationship", "blending"],
              "Understand how Tableau combines tables — and when blending is the fallback."
            ),
            L(
              "Data Source Cleanup and Types",
              25,
              ["data type", "data interpreter", "cleanup"],
              "Fix types and messy sources at the connection, before any sheet inherits the damage."
            ),
          ]),
        ]
      ),
      mod(
        "Calculations in Tableau",
        "Calculated fields, table calculations, and LOD expressions — the three levels of computation.",
        [
          "Write calculated fields with the right default aggregation",
          "Distinguish table calculations from LOD expressions",
        ],
        ["write-code", "concept-check", "dataset-task"],
        [
          ch("Calculated Fields", "New fields, default aggregations, and table calculations", [
            L(
              "Calculated Field Basics",
              30,
              ["calculated field", "operators", "functions"],
              "Write fields that do not exist in the source — profit ratios, bins, flags.",
              "code",
              3
            ),
            L(
              "Aggregation Defaults You Must Notice",
              30,
              ["default aggregation", "ATTR", "disaggregation"],
              "SUM, AVG, ATTR — the aggregation Tableau picks changes the question being answered."
            ),
            L(
              "Table Calculation Basics",
              35,
              ["table calculation", "compute using", "running total"],
              "Running totals, percent-of-total, and rank — and the addressing that steers them.",
              "code",
              3
            ),
          ]),
          ch("LOD Expressions at Intro Level", "FIXED, INCLUDE, and EXCLUDE — granularity control", [
            L(
              "The LOD Idea: FIXED, INCLUDE, EXCLUDE",
              30,
              ["LOD expression", "FIXED", "granularity"],
              "Compute at a stated granularity regardless of the view's level of detail."
            ),
            L(
              "When a Level of Detail Beats a Table Calc",
              30,
              ["LOD vs table calc", "granularity control", "reusability"],
              "Two tools, different jobs — choose by where the calculation must live.",
              "worked-example"
            ),
          ]),
        ]
      ),
      mod(
        "Building Charts and Interactions",
        "The core five chart types, workbook formatting, filters, and dashboard actions.",
        [
          "Build the core five chart types by hand",
          "Control filter precedence and wire dashboard actions",
        ],
        ["dataset-task", "design-review", "concept-check"],
        [
          ch("Core Chart Building", "From pills to published-quality views", [
            L(
              "The Core Five, Built by Hand",
              35,
              ["bar", "line", "scatter", "highlight table"],
              "Build bar, line, scatter, and highlight tables from pills — no Show Me shortcuts.",
              "guided-practice",
              3
            ),
            L(
              "Formatting and Design Defaults",
              30,
              ["formatting", "workbook defaults", "clean design"],
              "Set fonts, grids, and colors once at the workbook level, not per sheet."
            ),
            L(
              "Dual Axis and Combination Charts, Carefully",
              25,
              ["dual axis", "synchronized axis", "combination chart"],
              "Two axes on one pane — the format that most needs the honesty rules."
            ),
          ]),
          ch("Filters and Actions", "Precedence, context filters, and interactivity", [
            L(
              "Filters and the Order of Operations",
              30,
              ["filter order", "extract filter", "context filter"],
              "Filters run in a fixed order — know it or watch top-N sets misbehave."
            ),
            L(
              "Context Filters for Top-N",
              25,
              ["context filter", "top N", "precedence"],
              "Promote a filter to context when rankings depend on it."
            ),
            L(
              "Dashboard Actions: Filter and Highlight",
              30,
              ["filter action", "highlight action", "interactivity"],
              "Click, filter, highlight — wire views into a conversation with the data.",
              "guided-practice"
            ),
          ]),
        ]
      ),
      mod(
        "Dashboards, Stories, and Publishing",
        "Containers, story points, and the publish-and-perform finish line.",
        [
          "Assemble dashboards with containers and consistent formatting",
          "Publish narratives and keep them performant",
        ],
        ["dataset-task", "case-analysis", "concept-check"],
        [
          ch("Dashboards and Storytelling", "Layouts, sequential narrative, and consistency", [
            L(
              "Dashboard Layouts and Containers",
              30,
              ["dashboard object", "container", "tiled vs floating"],
              "Build dashboards that resize gracefully with tiled and floating containers."
            ),
            L(
              "Story Points and the Pages Shelf",
              30,
              ["story points", "Pages shelf", "sequential narrative"],
              "Guide an audience through an argument — one captioned view at a time."
            ),
            L(
              "Formatting for a Consistent Workbook",
              25,
              ["workbook theme", "consistent formatting", "title standards"],
              "Make sheet twenty look like sheet one — themes, titles, and tooltips."
            ),
          ]),
          ch("Publish and Perform", "Sharing the work and keeping it fast", [
            L(
              "Publishing to Tableau Public and Server",
              30,
              ["Tableau Public", "Tableau Server", "sharing"],
              "Share the work: what publishing to Public versus Server means for data and audience."
            ),
            L(
              "Performance Basics: Extracts and Mark Counts",
              30,
              ["extract strategy", "mark count", "performance recording"],
              "Fewer marks, tuned extracts, measured changes — the workbook stays fast.",
              "worked-example"
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Tableau Final", 50, 20),
    projects: [
      proj(
        "Superstore KPI Explorer",
        "Connect to the sample Superstore data, build the core five chart types by hand, and assemble a one-page explorer dashboard with working filter and highlight actions.",
        5,
        "guided",
        [
          "A workbook with five hand-built core charts",
          "One dashboard combining them with working actions",
          "A short write-up of which pill went where and why",
        ],
        [
          "Charts are built from pills, not via Show Me",
          "Actions do what the write-up claims they do",
          "Formatting follows the design defaults taught in the subject",
        ],
        ["Tableau Desktop", "Tableau Public"]
      ),
      proj(
        "A Tableau Story for a Decision",
        "Build a story-points sequence that argues one clear recommendation from the Superstore data — each story point captioned with its insight — and publish it to Tableau Public.",
        7,
        "independent",
        [
          "A published Tableau Public story of five to seven points",
          "Each point captioned with the insight it shows",
          "A closing point stating the recommendation and its caveats",
        ],
        [
          "The sequence follows a narrative arc, not a chart dump",
          "Each caption states a finding, not a topic",
          "The recommendation is supported by the points shown in order",
        ],
        ["Tableau Desktop", "Tableau Public"]
      ),
    ],
    placementEligible: true,
    keywords: ["tableau", "dimensions and measures", "calculated fields", "LOD expressions", "story points", "extracts", "dashboard actions"],
  },
];
