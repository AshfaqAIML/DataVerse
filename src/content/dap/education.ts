/**
 * Education analytics projects — EDU-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const EDUCATION_PROJECTS: DapProject[] = [
  /* ================================================================ EDU-01 */
  {
    id: "education-1",
    categoryId: "education",
    difficulty: "beginner",
    code: "EDU-01",
    title: "Course Engagement & Completion",
    subtitle: "Fourteen hundred learners, one online course: who finishes, and what predicts finishing?",
    summary:
      "A first learning-analytics project: clean an LMS cohort export, measure engagement and completion by cohort and learner background, and find the engagement markers that predict completion.",
    hours: 4,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Education metrics", "Categorical cleaning", "Completion analysis", "Bar charts", "Course-improvement recommendations"],

    businessBackground:
      "The Open Skills Institute runs a 12-module data-literacy course in three cohorts this year. Completion is the metric that matters — funders pay on completions, and learners who finish report real job impact — but only some fraction of starters finish, and the course team can't say which learners drop or whether early behaviour predicts it. The LMS export is finally in hand, and the course lead wants the engagement-completion picture before redesigning the next cohort.",
    problemStatement:
      "Measure engagement and completion across three cohorts: completion rates by cohort, country and education background; the engagement profile of completers vs non-completers; and which early markers (modules started, quiz scores, video watching) predict finishing — so the next cohort's interventions aim where they work.",
    businessObjectives: [
      "Compute completion rates by cohort, country and education level",
      "Compare engagement metrics (modules, videos, forum posts, quiz scores) between completers and non-completers",
      "Identify early markers (first 3 modules) that predict completion",
      "Quantify where learners stall (module-level drop points)",
      "Deliver course-improvement recommendations for the next cohort",
    ],
    datasetDescription:
      "~1,400 learner records across three cohorts: each row a learner with cohort, enrollment date, country, education level, module progress, quiz average, video-watch percentage, forum activity, completion status and weeks active. Quiz averages contain impossible values above 100, completion labels mix encodings, some countries are missing, duplicates exist, and a few learners show more active weeks than the course allows — the LMS export's honest texture.",
    dataDictionary: [
      { column: "learner_id", kind: "id", description: "Learner identifier", example: "8482" },
      { column: "cohort", kind: "categorical", description: "Cohort start month", example: "2025-04" },
      { column: "enrollment_date", kind: "date", description: "Enrollment date", example: "2025-04-07" },
      { column: "country", kind: "categorical", description: "Learner country (some missing)", example: "Brazil" },
      { column: "education_level", kind: "categorical", description: "Highest education", example: "Bachelor" },
      { column: "modules_started", kind: "integer", description: "Modules started (of 12)", example: "9" },
      { column: "modules_completed", kind: "integer", description: "Modules completed", example: "6" },
      { column: "quiz_avg", kind: "percent", description: "Average quiz score (values >100 exist)", example: "84" },
      { column: "videos_watched_pct", kind: "percent", description: "Share of videos watched (0–100)", example: "72" },
      { column: "forum_posts", kind: "integer", description: "Forum posts", example: "3" },
      { column: "completed_course", kind: "categorical", description: "Completion flag (mixed encodings)", example: "Yes" },
      { column: "weeks_active", kind: "integer", description: "Weeks with activity (values >16 are errors)", example: "9" },
    ],
    initialQuestions: [
      "What is the overall completion rate, and how does it differ by cohort, country and education level?",
      "How do completers and non-completers differ on engagement (modules, videos, quizzes, forum)?",
      "Which first-3-module markers best predict eventual completion?",
      "Where in the course do learners stall — which modules lose the most people?",
      "What should the course team change for the next cohort, and how would they know it worked?",
    ],
    dataset: {
      name: "Open Skills Institute LMS export",
      filename: "education-01-lms-learners.csv",
      description: "3 cohorts of learners with module progress, engagement and completion.",
      rows: 1400,
    },

    dataQuality: [
      { issue: "Impossible quiz averages", where: "quiz_avg > 100", detection: "(df['quiz_avg'] > 100).sum()", treatment: "Investigate (bonus points? export bug); exclude or cap with justification — never average in impossible scores." },
      { issue: "Mixed completion encodings", where: "completed_course — 'Yes'/'TRUE' variants", detection: "value_counts()", treatment: "Map to boolean; assert complete mapping." },
      { issue: "Weeks-active beyond course length", where: "weeks_active > 16", detection: "(df['weeks_active'] > 16).sum()", treatment: "Data errors: exclude from duration analysis (counted); the course runs 12 weeks plus grace." },
      { issue: "Missing country", where: "country — ~4%", detection: "isna().sum()", treatment: "Label 'Unknown'; keep in all analyses except country splits." },
      { issue: "Duplicate learners", where: "~1% duplicated rows", detection: "duplicated('learner_id').sum()", treatment: "Drop; completion rates need unique learners in the denominator." },
    ],
    cleaningPlan: [
      { action: "Map completion to boolean; deduplicate; label unknown countries", rationale: "The outcome and denominator must be clean before any rate." },
      { action: "Exclude impossible quiz scores and impossible active weeks (counted)", rationale: "Impossible values poison averages and duration comparisons." },
      { action: "Derive completion-consistency check: modules_completed == 12 should imply completed_course", rationale: "Cross-field validation catches LMS export drift." },
      { action: "Derive engagement tiers (early markers: modules_started ≥ 3, quiz_avg band, videos band)", rationale: "The predictive markers the course team can act on at week 3." },
    ],
    edaPlan: [
      { question: "Completion by cohort", method: "groupby(cohort) completion rate with counts", expectation: "~30–34% overall; small cohort differences." },
      { question: "Background patterns", method: "completion by education level and country (top 6)", expectation: "Bachelor/Master slightly higher; country spread wide with small-N caveats." },
      { question: "Engagement split", method: "completers vs non: modules, videos, quiz, forum", expectation: "Large gaps in modules completed and video share; forum very skewed." },
      { question: "Early markers", method: "completion rate by first-3-module engagement tier", expectation: "learners with ≥3 modules started by week 3 complete at 2× the rate." },
      { question: "Drop points", method: "distribution of modules_completed for non-completers", expectation: "Spikes at modules 3 and 7 — the stall points." },
    ],
    statisticsPlan: [
      { technique: "Completion rates with Wilson CIs", purpose: "Honest cohort and segment comparisons", expectation: "Cohort gaps mostly within noise; education gaps modest but consistent." },
      { technique: "Two-group engagement comparison (Mann-Whitney)", purpose: "Confirm the engagement gaps statistically", expectation: "Highly significant for modules and videos — the expected hierarchy." },
      { technique: "Early-marker lift analysis", purpose: "Quantify the predictive value of week-3 signals", expectation: "≥3 modules started by week 3 → ~2× completion (lift quantified with CI)." },
    ],
    visualisationPlan: [
      { chart: "Bar — completion by cohort with CIs", answers: "Is the course improving?", reads: "Bars with intervals; overlapping CIs mean 'no clear trend yet'." },
      { chart: "Grouped bar — engagement metrics, completers vs non", answers: "How do finishers behave?", reads: "Paired bars; the modules and videos gaps dominate." },
      { chart: "Bar — completion rate by early-marker tier", answers: "What predicts finishing?", reads: "Rising bars by week-3 engagement — the intervention signal." },
      { chart: "Histogram — modules completed for non-completers", answers: "Where do people stall?", reads: "Spikes at modules 3 and 7 annotated as stall points." },
      { chart: "Scatter — quiz average vs modules completed (colour = completion)", answers: "Do scores track progress?", reads: "Positive slope; the low-score-low-progress quadrant is the risk group." },
    ],
    findings: [
      "Roughly one in three learners completes (≈32%), stable across cohorts — the course's issue is structural, not a bad intake.",
      "Completers differ most on volume-of-behaviour markers: modules completed and video share separate the groups far more than quiz scores, which overlap substantially.",
      "Week-3 behaviour predicts the end: learners starting ≥3 modules in the first three weeks complete at about twice the rate of slower starters — an actionable early-warning marker.",
      "Non-completers stall at two visible points, modules 3 (first assessed module) and 7 (the mid-course project) — the course's difficulty walls.",
      "Education background associates modestly with completion; country-level differences are large but mostly small-N and interval-wide.",
    ],
    recommendations: [
      { what: "Add a week-3 check-in workflow targeting learners with <3 modules started (nudge email + study-plan prompt)", why: "Week-3 pace predicts completion at 2×; it's the earliest reliable intervention point.", impact: "Highest-leverage retention action available", horizon: "immediate" },
      { what: "Redesign module 3's assessment scaffolding (worked example, practice quiz) and add a project clinic for module 7", why: "The two stall points hold the majority of drop-outs; targeted support beats course-wide changes.", impact: "Removes the known walls", horizon: "this quarter" },
      { what: "Track and report week-3 pace as the course's leading indicator, with completion as the lagging one", why: "Completion-only reporting shows problems months late; pace shows them in week 3.", impact: "Earlier course management", horizon: "immediate" },
      { what: "Fix the LMS export defects (quiz>100, impossible weeks, mixed completion labels)", why: "Every future analysis inherits these; the defect list is the LMS team's backlog.", impact: "Data quality compounding", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "One in three learners completes the course, stable across cohorts and mostly independent of background — the problem is the course's structure, not its intake. Completion is predicted by behaviour, not ability: modules completed and video share separate finishers from quitters far more than quiz scores, and week-3 pace alone doubles the prediction. Learners stall at two difficulty walls — the module-3 assessment and the module-7 project — which concentrate the drop-outs. The next cohort gets a week-3 pace check-in aimed at slow starters, scaffolding at the two walls, and week-3 pace as the course's new leading indicator; the export-defect list goes to the LMS team.",
      structure: [
        "1. Objective and completion definition",
        "2. Data and quality treatment",
        "3. Completion by cohort and background",
        "4. The engagement split: completers vs non-completers",
        "5. Early markers and predictive lift",
        "6. Stall-point analysis",
        "7. Recommendations for the next cohort",
        "8. Appendix: cleaning log, encoding map, exclusions",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the LMS export",
        goal: "Load, profile, and get the completion column airtight.",
        instructions: [
          "Profile; list every completion encoding; count duplicates on learner_id.",
          "Understand the module counters: started vs completed (of 12), and their relationship to the completion flag.",
          "Note engagement columns (videos, forum, quiz) as behaviour measures and background columns as context.",
        ],
        hints: [
          "Completion is the outcome: map every label variant explicitly and assert the mapping is complete.",
          "modules_completed == 12 should agree with completed_course — where they disagree, the export has drift worth counting.",
          "One row = one learner, so all rates use learners as denominator.",
        ],
        checkpoint: "Encoding census, cross-field check counts, grain confirmed.",
        code: {
          label: "Profile the LMS export",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("education-01-lms-learners.csv")
print(df.shape)
print(df["completed_course"].value_counts(dropna=False))
print("dupes:", df.duplicated("learner_id").sum())
print("quiz > 100:", (df["quiz_avg"] > 100).sum())
print("weeks > 16:", (df["weeks_active"] > 16).sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the export",
        goal: "Five defect families counted with treatments.",
        instructions: [
          "Quantify impossible quizzes, impossible weeks, missing countries, duplicates, encodings.",
          "Decide the treatment per defect with the completion-consistency check as a sixth audit row.",
          "Assemble the audit table for the appendix.",
        ],
        hints: [
          "Impossible values in education data are usually export bugs, not learner behaviour — investigate a few rows before choosing treatment.",
          "The cross-field check (modules vs flag) is the audit's credibility row: count agreements and disagreements.",
          "Unknown countries stay in overall rates and drop only from country splits — different questions, different denominators.",
        ],
        checkpoint: "The six-row audit table with decided treatments.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Canonical frame with boolean completion, valid ranges, derived tiers.",
        instructions: [
          "Apply fixes; derive the early-marker tier and engagement flags.",
          "Verify: completion rate computed once; module counts within 0–12.",
          "Keep exclusions counted (quiz>100, weeks>16).",
        ],
        hints: [
          "Early-marker tier: use modules_started (the week-3 signal the course team can observe) banded 0-1 / 2 / 3+.",
          "assert clean['modules_completed'].between(0, 12).all() — the cheap check that catches silent disasters.",
          "One completion rate, computed once, quoted consistently.",
        ],
        checkpoint: "Clean frame with tiers, verified ranges, overall rate.",
        code: {
          label: "Canonical frame",
          language: "python",
          source: `DONE = {"Yes": True, "TRUE": True, "No": False, "FALSE": False}
clean = df.drop_duplicates("learner_id").copy()
clean["completed"] = clean["completed_course"].map(DONE)
assert clean["completed"].notna().all()
clean["country"] = clean["country"].fillna("Unknown")

v = clean[clean["quiz_avg"] <= 100].copy()
v["early_pace"] = pd.cut(v["modules_started"], [0, 1, 2, 12], labels=["0-1", "2", "3+"])
print(f"completion: {v['completed'].mean():.1%}")`,
        },
      },
      {
        phase: "eda",
        title: "Completion and engagement landscape",
        goal: "Segment rates, the engagement split, early-marker lift, stall points.",
        instructions: [
          "Completion by cohort, education, country (with counts).",
          "Engagement comparison: completers vs non across all four behaviour metrics.",
          "Completion by early-pace tier; the module-count histogram for non-completers.",
        ],
        hints: [
          "groupby with .agg(['mean','count']) keeps rates honest next to sizes.",
          "The engagement split table is the course team's mirror: which behaviours distinguish finishers.",
          "Stall points: v.loc[~v.completed, 'modules_completed'].value_counts().sort_index() — the spikes are the walls.",
        ],
        checkpoint: "Rates, engagement gaps, lift by pace tier, stall points identified.",
        code: {
          label: "The engagement split",
          language: "python",
          source: `print(v.groupby("cohort")["completed"].agg(["mean", "count"]).round(3))

print(v.groupby("completed")[
    ["modules_completed", "videos_watched_pct", "quiz_avg", "forum_posts"]
].mean().round(1))

print(v.groupby("early_pace", observed=True)["completed"].agg(["mean", "count"]).round(3))
print(v.loc[~v["completed"], "modules_completed"].value_counts().sort_index())`,
        },
      },
      {
        phase: "statistics",
        title: "Lift with intervals",
        goal: "Wilson CIs, the engagement test, the early-marker lift.",
        instructions: [
          "Wilson CIs for cohort and education-level completion.",
          "Mann-Whitney on modules and videos by completion.",
          "Lift analysis: completion rate for 3+ starters vs slower, with CI on the difference.",
        ],
        hints: [
          "Lift = rate(fast)/rate(slow) — report with the CI on the difference too; ratios alone can overstate small bases.",
          "Engagement tests confirm what the table shows; the report needs the effect size, not just p-values.",
          "Small-N country cells: report the widest CIs prominently — the course team will over-read them otherwise.",
        ],
        checkpoint: "Intervalled rates, test results, the lift estimate with CI.",
      },
      {
        phase: "visualisation",
        title: "The course-team exhibits",
        goal: "Five charts led by the engagement split.",
        instructions: [
          "Cohort bars with CIs; engagement pairs; early-pace bars; stall histogram; quiz-progress scatter.",
          "Annotate the stall points on the histogram.",
          "Takeaway titles throughout.",
        ],
        hints: [
          "The engagement paired bars normalise each metric (z-score or % of completers' mean) so one chart shows all four gaps.",
          "Early-pace bars with n= labels — the intervention's target sizes.",
          "The histogram's spikes at 3 and 7 want arrows and labels: 'the walls'.",
        ],
        checkpoint: "Five exhibits with the engagement split and stall chart polished.",
      },
      {
        phase: "interpretation",
        title: "Read the course honestly",
        goal: "Findings with the correlational caveat front of mind.",
        instructions: [
          "Answer the five questions with figures; caveat that early pace PREDICTS but doesn't CAUSE completion (interventions must test that).",
          "Separate what the course controls (walls, pacing) from what it doesn't (background).",
          "Draft the next-cohort paragraph.",
        ],
        hints: [
          "The prediction-causation caveat is the difference between a nudge programme and a superstition — say it explicitly.",
          "Background patterns are context, not targets: the course doesn't choose its learners, it chooses its walls.",
          "The paragraph the course lead repeats: 'Week-3 pace doubles the prediction; the walls are modules 3 and 7.'",
        ],
        checkpoint: "Five answered questions with the causal caveat attached.",
      },
      {
        phase: "recommendations",
        title: "The next-cohort plan",
        goal: "Interventions with target sizes and success metrics.",
        instructions: [
          "Recommend the week-3 check-in, the wall redesigns, the leading-indicator reporting.",
          "Size each intervention's target group from the data.",
          "Define success metrics and the comparison design (vs current cohort).",
        ],
        hints: [
          "Target sizes: how many learners fall in the slow-pace tier — the check-in's workload.",
          "Success metric for the check-in: completion lift vs this cohort's rate, with the caveat that cohort effects confound — a clean comparison needs at least a within-cohort contrast.",
          "Wall redesign success: stall-point spike height in the next cohort's histogram.",
        ],
        checkpoint: "The plan with target sizes, metrics and comparison design.",
      },
      {
        phase: "report",
        title: "The course review",
        goal: "A course-team-ready review: one page of story, exhibits behind.",
        instructions: [
          "Structure: definition → headline → engagement split → early markers → walls → plan.",
          "Engagement-split chart in the body; the rest as supporting exhibits.",
          "Include the LMS defect list for the platform team.",
        ],
        hints: [
          "Lead with the stable one-in-three and the behavioural predictor — that reframes 'why do people quit' into 'what do finishers do differently'.",
          "Course teams act on stall points — put the histogram in the body, not the appendix.",
          "Date-stamp the review against the cohort window.",
        ],
        checkpoint: "The review, every number traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the course team's analyst. Map engagement and completion across three cohorts, find the early predictors and the stall points, and recommend the next cohort's interventions. Completion definition and marker thresholds are yours — documented.",
      deliverables: [
        "LMS export audit and cleaning log",
        "Completion rates by cohort and background (with counts/CIs)",
        "Engagement comparison of completers vs non-completers",
        "Early-marker lift analysis with intervals",
        "Next-cohort intervention plan with target sizes and success metrics",
      ],
      guardrails: [
        "Completion encodings mapped with assertions",
        "Impossible values excluded and counted",
        "Predictive language associative, not causal",
        "Small-N segments caveated with intervals",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Completion mapped to boolean before rates; unique learners in denominators",
        "Impossible quiz/week values excluded from affected metrics",
        "Lift computed with both rate ratio and difference CI",
      ],
      "code-quality": [
        "Segment-rate helper reused",
        "Cross-field consistency check performed",
      ],
      reasoning: [
        "Early pace framed as predictor with causal caveat",
        "Stall points identified from the module distribution",
      ],
      visualization: [
        "Engagement gaps comparable across metrics (normalised)",
        "Stall histogram annotated",
      ],
      interpretation: [
        "Behavioural vs background drivers separated",
        "Cohort stability (or lack) stated with intervals",
      ],
      recommendations: [
        "Interventions sized with target groups",
        "Success metrics and comparison design defined",
      ],
    },
  },

  /* ================================================================ EDU-02 */
  {
    id: "education-2",
    categoryId: "education",
    difficulty: "intermediate",
    code: "EDU-02",
    title: "At-Risk Student Early Signals",
    subtitle: "Five thousand student-term records: build the risk picture the advising centre can act on.",
    summary:
      "Learning analytics with stakes: clean a student-term dataset, identify the behavioural and academic signals that precede poor outcomes, build a transparent risk framework, and hand advising an intervention list — with privacy and equity considerations built in.",
    hours: 9,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Student-risk analytics", "Signal analysis", "Transparent scoring", "Equity-aware interpretation", "Advising-centre deliverables"],

    businessBackground:
      "Rivermont University's advising centre intervenes too late: academic-standing letters go out after final grades post, when a semester is already lost. The university's data office has assembled student-term records — grades, attendance, LMS logins, assignment timeliness — across two terms, and the advising director wants an early-signal framework: which measurable behaviours in week 5–7 precede failing or withdrawing, how to combine them into a transparent risk tier, and which students the framework would have flagged last term. Privacy and equity are explicit constraints: the framework must be explainable, auditable, and checked for disparate flagging.",
    problemStatement:
      "Identify early academic-risk signals from student-term records: which week-5–7 behaviours (attendance, LMS engagement, assignment timeliness, mid-term scores) predict end-of-term failure or withdrawal; combine them into a transparent, explainable risk tier; validate it against last term's outcomes; audit it for equity in flagging rates; and deliver advising an intervention list and workflow.",
    businessObjectives: [
      "Quantify the association of each early signal with final outcomes (pass/fail/withdraw)",
      "Build a transparent risk tier (rule-based or simple score) using week-5–7 data only",
      "Validate the tier against outcomes: capture and precision by tier",
      "Audit flag rates by student group for disparate impact",
      "Deliver the advising workflow: tier definitions, intervention mapping, review cadence",
    ],
    datasetDescription:
      "~5,000 student-term records across two terms: each row a student-term with program, year, GPA (with impossible values), attendance, LMS logins, assignment timeliness, mid-term score, final outcome, and flags for first-generation and Pell status. Outcome labels mix casings, GPAs exceed 4.0 in places, attendance has gaps, logins include impossible negatives, and duplicates exist. The equity columns are protected context, not predictors — how they're used is part of the assignment.",
    dataDictionary: [
      { column: "student_id", kind: "id", description: "Student identifier", example: "31204" },
      { column: "term", kind: "categorical", description: "Term label", example: "2025 Fall" },
      { column: "program", kind: "categorical", description: "Degree program (casing variants)", example: "BSc Data Science" },
      { column: "year_of_study", kind: "integer", description: "Year 1–4", example: "2" },
      { column: "gpa", kind: "decimal", description: "Current GPA (values >4.0 exist)", example: "2.84" },
      { column: "attendance_pct", kind: "percent", description: "Attendance to week 7 (some missing)", example: "78" },
      { column: "lms_logins_week", kind: "decimal", description: "LMS logins per week (negatives exist)", example: "8.4" },
      { column: "assignments_on_time", kind: "integer", description: "On-time assignments of 8 by week 7", example: "5" },
      { column: "mid_term_score", kind: "percent", description: "Mid-term score (0–100)", example: "62" },
      { column: "final_outcome", kind: "categorical", description: "Pass / Fail / Withdraw (casing variants)", example: "Withdraw" },
      { column: "first_generation", kind: "boolean", description: "First-generation student flag", example: "1" },
      { column: "pell_eligible", kind: "boolean", description: "Pell grant eligibility flag", example: "0" },
    ],
    initialQuestions: [
      "How do pass/fail/withdraw rates differ by program, year and student group?",
      "Which week-5–7 signals (attendance, logins, assignments, mid-term) associate most strongly with poor outcomes?",
      "What combination of signals into a tier system would have caught last term's failures and withdrawals — at what precision?",
      "Does the tier system flag students from different groups at materially different rates for the same eventual outcomes?",
      "What workflow should advising run, and how should its effects be measured?",
    ],
    dataset: {
      name: "Rivermont student-terms",
      filename: "education-02-student-terms.csv",
      description: "2 terms of student-records with week-7 signals and final outcomes.",
      rows: 5000,
    },

    dataQuality: [
      { issue: "GPA above 4.0", where: "gpa > 4", detection: "(df['gpa'] > 4).sum()", treatment: "Exclude from GPA-based analysis (counted); impossible values suggest export errors — never cap without investigation." },
      { issue: "Mixed outcome casings", where: "final_outcome — 'pass'/'Pass'", detection: "value_counts()", treatment: "Title-case to three canonical outcomes." },
      { issue: "Missing attendance", where: "attendance_pct — ~4%", detection: "isna().sum()", treatment: "Leave missing; the tier system must handle missing signals gracefully (absence of data is not absence of risk — default to no-flag on that dimension and note it)." },
      { issue: "Negative LMS logins", where: "lms_logins_week < 0", detection: "(df['lms_logins_week'] < 0).sum()", treatment: "Impossible: exclude from login-based analysis, counted." },
      { issue: "Duplicate student-terms", where: "~0.8% duplicated rows", detection: "duplicated(['student_id','term']).sum()", treatment: "Drop — the key (student, term) must be unique." },
      { issue: "Program label variants", where: "program — upper-case variants", detection: "value_counts()", treatment: "Canonicalise before program-level analysis." },
    ],
    cleaningPlan: [
      { action: "Canonicalise outcomes and programs; deduplicate the (student, term) key", rationale: "Outcomes and segments must be single-encoding before any rate." },
      { action: "Exclude impossible GPA and negative logins (counted)", rationale: "Impossible values poison the signal analysis." },
      { action: "Derive the negative outcome flag (fail OR withdraw)", rationale: "Advising intervenes on both; the outcome is 'not passing'." },
      { action: "Build the early-signal frame with missing-aware handling", rationale: "A deployable tier must behave sensibly with missing data, not crash or default everyone to risky." },
    ],
    edaPlan: [
      { question: "Outcome base rates", method: "pass/fail/withdraw by term; by program; by year", expectation: "~74% pass, 14% fail, 12% withdraw; first-year withdraw highest." },
      { question: "Signal distributions by outcome", method: "attendance/logins/assignments/mid-term by outcome", expectation: "Strong separations: failing students' attendance ~20 points lower; withdrawals show the mid-tier pattern (present but disengaging)." },
      { question: "Withdrawal vs failure signatures", method: "compare signal profiles of Fail vs Withdraw", expectation: "Fail = low scores throughout; Withdraw = mid scores with falling attendance — different problems, different interventions." },
      { question: "Group context", method: "outcome rates by first-generation and Pell status", expectation: "Modest gaps — context for the equity audit, not predictors." },
      { question: "Signal correlations", method: "correlation among the four signals", expectation: "Attendance and assignments moderately correlated; mid-term distinct — a tier can use complementary signals." },
    ],
    statisticsPlan: [
      { technique: "Signal-outcome association (rank tests, effect sizes)", purpose: "Rank the signals by strength", expectation: "Mid-term and attendance strongest; assignments close behind." },
      { technique: "Transparent tier construction (rule-based on 2–3 signals, calibrated on term 1)", purpose: "An explainable framework advising can defend", expectation: "A 3-tier rule captures a majority of failures at workable precision." },
      { technique: "Tier validation on term 2 (capture, precision, lift)", purpose: "Out-of-sample honesty", expectation: "Tier 1 captures ~55–65% of failures at ~50–60% precision." },
      { technique: "Equity audit of flag rates (same-outcome flag rate by group)", purpose: "Detect disparate flagging", expectation: "Small differences; any material gap documented and addressed via threshold adjustment or review process." },
    ],
    visualisationPlan: [
      { chart: "Box/violin — each signal by final outcome (small multiples)", answers: "Which signals separate?", reads: "The four-panel signal-outcome view; mid-tier withdrawal pattern visible." },
      { chart: "Bar — capture and precision by tier (term-2 validation)", answers: "Does the tier work?", reads: "Two bars per tier; the operating point chosen on this chart." },
      { chart: "Bar — flag rate by group at equal outcome", answers: "Is it fair?", reads: "Paired bars; material gaps annotated for the review process." },
      { chart: "Scatter — attendance vs mid-term, colour = outcome, tier boundaries drawn", answers: "What does the rule look like?", reads: "The tier regions visible as the intervention map advising will use." },
      { chart: "Line — outcome rate by attendance decile", answers: "Where is the cliff?", reads: "The attendance threshold where outcomes deteriorate — the rule's anchor." },
    ],
    findings: [
      "Early signals carry real information: mid-term score and week-7 attendance separate outcomes strongly, with failing students ~20 attendance points below passing and withdrawing students showing the distinctive mid-scores-falling-attendance pattern.",
      "Failure and withdrawal are different problems: failure looks like persistent low performance; withdrawal looks like disengagement from a middling start — the tier system and the interventions must distinguish them.",
      "A two-signal transparent rule (attendance below ~70% OR mid-term below ~55, escalated when both) validated on the second term captures roughly 60% of negative outcomes in its top tier at ~55% precision — defensible for human-in-the-loop advising.",
      "The equity audit shows small flag-rate differences by group at equal outcomes; none material after threshold review, but the audit becomes a standing quarterly check in the recommendation.",
      "First-year students carry the highest withdrawal concentration, making year-one courses the natural first deployment for the workflow.",
    ],
    recommendations: [
      { what: "Deploy the two-signal tier as an advising watchlist for first-year courses next term, human-reviewed weekly", why: "Validated capture at workable precision, explainable to students and staff — the right starting scope.", impact: "Earlier contact for the majority of at-risk students", horizon: "this quarter" },
      { what: "Route tier-1 students to differentiated outreach: study-skills coaching for the failure profile, belonging/advising conversations for the withdrawal profile", why: "The two risk signatures need different interventions; one message fits neither.", impact: "Better-matched support where signals say it matters", horizon: "this quarter" },
      { what: "Stand up the quarterly equity audit of flag rates as a governance requirement", why: "Transparent systems stay fair by checking, not by assumption.", impact: "Trust and compliance", horizon: "immediate" },
      { what: "Instrument the intervention itself (contact logs, outcomes) so next year's model learns what works", why: "The current framework predicts risk; the next one should evaluate help.", impact: "Compounding programme improvement", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Academic trouble at Rivermont is visible by week seven. Two signals — attendance below ~70% and mid-term below ~55 — separate students headed to failure or withdrawal from their passing peers, and withdrawal shows its own signature (mid scores plus falling attendance) that warrants different outreach than failure's persistent-low profile. A transparent two-signal tier, calibrated on one term and validated on the next, captures about 60% of negative outcomes in its top tier at ~55% precision — good enough for a human-reviewed advising watchlist, not for automation. The equity audit finds no material disparate flagging but becomes a standing quarterly check. Deployment starts with first-year courses, where withdrawal concentrates, with differentiated outreach by risk profile.",
      structure: [
        "1. The advising question, scope and privacy stance",
        "2. Data and quality treatment",
        "3. Outcome landscape by program, year and group",
        "4. Signal analysis: the four early markers",
        "5. The withdrawal-vs-failure distinction",
        "6. Tier construction and out-of-term validation",
        "7. Equity audit",
        "8. The advising workflow and measurement plan",
        "9. Appendix: cleaning log, rule definitions, validation tables",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Frame the deployment context first",
        goal: "The prediction task, the intervention moment (week 7), and the privacy stance.",
        instructions: [
          "Write the task: using week-5–7 signals, predict end-of-term negative outcome (fail or withdraw) for advising contact.",
          "Note the deployment constraints: explainable, auditable, human-reviewed — this rules out black-box models by design.",
          "Mark the protected columns (first-generation, Pell) as audit context, not predictors — decide and document that boundary.",
        ],
        hints: [
          "The week-7 constraint is the design's spine: only signals available at intervention time are usable, by construction.",
          "Explainability is a requirement from the advising director, not a preference — a rule-based tier is the deliverable, with a model as background check at most.",
          "Protected-column discipline: context for fairness auditing, excluded from prediction — say so in the report's first page.",
        ],
        checkpoint: "The task contract, signal whitelist, and privacy stance written.",
        code: {
          label: "Task setup",
          language: "python",
          source: `df = pd.read_csv("education-02-student-terms.csv")
df["term"] = df["term"].str.title()
print(df.duplicated(["student_id", "term"]).sum(), "duplicate keys")
print(df["final_outcome"].value_counts(dropna=False))
print((df["gpa"] > 4).sum(), "impossible GPAs;",
      (df["lms_logins_week"] < 0).sum(), "negative logins")`,
        },
      },
      {
        phase: "quality",
        title: "Audit the records",
        goal: "Six defect families counted; missing-attendance policy decided.",
        instructions: [
          "Quantify all defects; decide the missing-signal policy (the tier must degrade gracefully).",
          "Cross-check: withdrawal students should have enrolment through mid-term — mid-term score present.",
          "Write the audit table.",
        ],
        hints: [
          "The missing-attendance policy is a design decision: a student with unknown attendance shouldn't be auto-flagged on that dimension — the rule treats missing as 'no signal', not 'bad signal'.",
          "GPA >4 rows: exclude from GPA analysis but keep for signal analysis (the other fields are valid).",
          "Duplicate (student, term) keys are fatal for rate denominators — resolve before anything.",
        ],
        checkpoint: "The audit table with the missing-signal policy.",
      },
      {
        phase: "cleaning",
        title: "Build the signal frame",
        goal: "Canonical outcomes, negative-outcome flag, validated signal columns.",
        instructions: [
          "Apply fixes; derive the negative outcome (fail or withdraw).",
          "Validate signal ranges (attendance 0–100, assignments 0–8, mid-term 0–100).",
          "Split calibration (term 1) and validation (term 2) frames — the honesty architecture.",
        ],
        hints: [
          "negative = final_outcome.isin(['Fail', 'Withdraw']) — the single outcome advising acts on.",
          "Range asserts on signals catch export surprises early.",
          "Calibration/validation split BY TERM mimics deployment: rules built on the past, judged on the future.",
        ],
        checkpoint: "Signal frame with negative flag and term split.",
        code: {
          label: "Signal frame",
          language: "python",
          source: `clean = df.drop_duplicates(["student_id", "term"]).copy()
clean["final_outcome"] = clean["final_outcome"].str.title()
clean["negative"] = clean["final_outcome"].isin(["Fail", "Withdraw"])
clean["program"] = clean["program"].str.title()

sig = clean[(clean["gpa"] <= 4) & (clean["lms_logins_week"] >= 0)].copy()
for col, lo, hi in [("attendance_pct", 0, 100), ("mid_term_score", 0, 100), ("assignments_on_time", 0, 8)]:
    assert sig[col].dropna().between(lo, hi).all(), col
cal, val = sig[sig["term"] == "2025 Spring"], sig[sig["term"] == "2025 Fall"]`,
        },
      },
      {
        phase: "eda",
        title: "Signals and signatures",
        goal: "Signal-outcome separations and the withdrawal-vs-failure distinction.",
        instructions: [
          "Outcome base rates by program, year, group (context).",
          "Signal distributions by outcome — all four signals, split by fail vs withdraw vs pass.",
          "The attendance-decile cliff: negative-outcome rate by attendance decile.",
        ],
        hints: [
          "Splitting Fail and Withdraw in the signal box plots is where the two-signature insight lives — don't merge them too early.",
          "The decile cliff locates the threshold candidate for the rule — data-driven, not guessed.",
          "Group outcome gaps are context for the equity audit later, not predictors now.",
        ],
        checkpoint: "Signal separations mapped; withdrawal signature documented; cliff located.",
        code: {
          label: "Signal separation",
          language: "python",
          source: `print(sig.groupby("final_outcome")[
    ["attendance_pct", "lms_logins_week", "assignments_on_time", "mid_term_score"]
].mean().round(1))

sig["att_dec"] = pd.qcut(sig["attendance_pct"], 10, duplicates="drop")
print(sig.groupby("att_dec", observed=True)["negative"].agg(["mean", "count"]).round(3))`,
        },
      },
      {
        phase: "statistics",
        title: "Build and validate the tier",
        goal: "Rule-based tier calibrated on term 1, validated on term 2, equity-audited.",
        instructions: [
          "Calibrate thresholds on term 1 (attendance and mid-term cut points from the decile analysis).",
          "Validate on term 2: capture (share of negatives in tier 1) and precision (share of tier 1 that is negative).",
          "Equity audit: flag rates by group among students with the SAME outcome — are groups flagged differently for equal risk?",
        ],
        hints: [
          "Rule shape: tier1 = (attendance < A) OR (midterm < M); tier2 = the other signal below a softer line. Simple enough to explain to a student.",
          "Capture and precision move opposite as thresholds tighten — choose the operating point for advising capacity (how many students can they contact weekly?).",
          "The equity audit compares flag rates among negatives (and among non-negatives) by group — that's the disparate-impact question, cleanly posed.",
        ],
        checkpoint: "The tier rule, validation table, and equity audit results.",
        code: {
          label: "Tier validation",
          language: "python",
          source: `A, M = 70, 55
val = val.copy()
val["tier1"] = (val["attendance_pct"] < A) | (val["mid_term_score"] < M)
neg = val["negative"]
cap = val.loc[val["tier1"], "negative"].sum() / neg.sum()
prec = val.loc[val["tier1"], "negative"].mean()
print(f"capture {cap:.1%}, precision {prec:.1%}")

for g in ["first_generation", "pell_eligible"]:
    rates = val[val["negative"]].groupby(g)["tier1"].mean()
    print(g, rates.round(3).to_dict())`,
        },
      },
      {
        phase: "visualisation",
        title: "The advising exhibits",
        goal: "Five charts: signal panels, validation bars, equity bars, the rule map, the cliff.",
        instructions: [
          "Build the five; the rule map (attendance vs mid-term scatter with tier regions) is advising's artefact.",
          "Validation bars annotated with the chosen operating point and capacity note.",
          "Equity bars with material-gap annotations (or 'no material gap').",
        ],
        hints: [
          "The rule map: scatter coloured by outcome with vertical/horizontal threshold lines and shaded tier regions — one chart that IS the framework.",
          "Validation bars: capture and precision side by side per tier — the capacity conversation happens on this chart.",
          "Equity bars are deliberately boring; that's the point — annotate 'differences within noise' if they are.",
        ],
        checkpoint: "Five exhibits with the rule map polished.",
      },
      {
        phase: "interpretation",
        title: "Read the framework honestly",
        goal: "What the tier does and doesn't support, in deployment language.",
        instructions: [
          "Answer the five questions; translate capture/precision into advising language ('of the ~N students flagged weekly, about half will truly be at risk; the framework finds ~60% of at-risk students').",
          "State the privacy stance and why the tier is explainable (students can be told why they were contacted).",
          "Name the failure modes: missing signals, late-enrolling students, students who recover unaided.",
        ],
        hints: [
          "Deployment translation: precision is 'how many awkward conversations per useful one' — advising capacity planning runs on that number.",
          "The explainability sentence: 'A flagged student can be told: your attendance was below 70% at week 7 — and that's a conversation, not a verdict.'",
          "Recovery-without-contact students are false positives by design — the framework initiates contact, it doesn't judge outcomes.",
        ],
        checkpoint: "Five answered questions in deployment language with failure modes listed.",
      },
      {
        phase: "recommendations",
        title: "The advising workflow",
        goal: "Deployment scope, differentiated outreach, governance and measurement.",
        instructions: [
          "Recommend the first-year pilot scope, weekly cadence, and differentiated outreach by risk profile.",
          "Include the equity audit as standing governance.",
          "Define the measurement plan: contact rates, outcome deltas, and the comparison design.",
        ],
        hints: [
          "Pilot scoping (first-year courses) matches the withdrawal concentration — deploy where the signal is strongest.",
          "Differentiated outreach is the report's quiet innovation: failure-profile students get study support; withdrawal-profile students get belonging conversations.",
          "Measurement design: tier-1 contacted vs tier-1 not-contacted (capacity-constrained natural experiment) with outcomes compared at term end.",
        ],
        checkpoint: "The workflow with scope, cadence, outreach map and measurement design.",
      },
      {
        phase: "report",
        title: "The advising framework review",
        goal: "A review the advising director can take to the provost.",
        instructions: [
          "Follow the outline; open with the week-7 finding and the explainability commitment.",
          "Validation and equity audit in the body — they are the credibility spine.",
          "Close with the pilot scope and measurement plan.",
        ],
        hints: [
          "The provost version: 'We can see academic trouble by week seven, explainably and fairly-checked; here is the pilot.'",
          "Privacy stance on page one: what is predicted, what is excluded, what students are told.",
          "Reproducibility appendix: rules, thresholds, validation tables — governance will ask.",
        ],
        checkpoint: "The complete review, reproducible from the student-term CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the data office's analyst. The advising director wants an early-risk framework: week-7 signals, transparent tiers, validated out-of-term, equity-audited, and deployable as a human-reviewed workflow. Thresholds, rule shape and the missing-signal policy are yours — documented and defensible.",
      deliverables: [
        "Record audit with the missing-signal policy",
        "Signal-outcome analysis including the withdrawal-vs-failure distinction",
        "Transparent tier rule calibrated on term 1",
        "Term-2 validation (capture, precision) and the equity audit",
        "Advising workflow: scope, differentiated outreach, governance, measurement plan",
      ],
      guardrails: [
        "Signals restricted to week-5–7 availability",
        "Protected columns excluded from prediction, used only in audit",
        "Validation on the later term, not a random split",
        "Explainability maintained (rule-based, student-tellable)",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Tier validated on the later term (temporal split)",
        "Capture and precision computed correctly from the confusion structure",
        "Equity audit compares flag rates at equal outcomes",
      ],
      "code-quality": [
        "Rule encoded once, applied to both frames",
        "Missing-signal handling explicit and graceful",
      ],
      reasoning: [
        "Withdrawal vs failure distinction carried into outreach design",
        "Operating point tied to advising capacity",
      ],
      visualization: [
        "Rule map makes thresholds and regions visible",
        "Validation bars show capture and precision together",
      ],
      interpretation: [
        "Deployment-language translation of metrics",
        "Failure modes enumerated",
      ],
      recommendations: [
        "Differentiated outreach by risk profile",
        "Governance (equity audit cadence) and measurement design included",
      ],
    },
  },

  /* ================================================================ EDU-03 */
  {
    id: "education-3",
    categoryId: "education",
    difficulty: "advanced",
    code: "EDU-03",
    title: "Programme Equity & Outcomes Study",
    subtitle: "Five cohorts, four thousand students: measure the gaps, decompose them, and tell the truth about them.",
    summary:
      "Institutional-research analytics: build a multi-cohort outcomes panel, quantify attainment and persistence gaps across demographic groups, decompose them with appropriate statistics, and deliver an equity report that survives methodological and political scrutiny.",
    hours: 15,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Multi-cohort panel construction", "Gap quantification", "Decomposition methods", "Regression with controls", "Equity reporting under scrutiny"],

    businessBackground:
      "Rivermont University's board has committed publicly to closing attainment gaps by 2030, but the institution cannot yet state the gaps precisely: the last equity report was a slide of raw graduation rates by demographic group, contested immediately for ignoring entry preparation, program mix and cohort timing. The institutional research office has assembled five cohorts of student records with demographics, entry scores, year-one performance and outcomes — and the provost wants an equity study that quantifies gaps honestly: raw gaps, adjusted gaps, trend, and what the decomposition does and does not explain.",
    problemStatement:
      "Quantify and decompose attainment gaps across five cohorts: raw gaps in retention, graduation and time-to-degree by demographic group; adjusted gaps after entry preparation, program and cohort controls; gap trajectories over time; and the share of each gap the observables explain — delivered as an equity report whose methods, assumptions and unexplained residuals are stated plainly enough to survive a methodological review.",
    businessObjectives: [
      "Construct a clean multi-cohort outcomes panel with canonical demographic coding",
      "Quantify raw gaps in retention, graduation and time-to-degree by group and cohort",
      "Estimate adjusted gaps (regression with entry and program controls) with uncertainty",
      "Decompose gaps: how much do entry preparation, program mix and cohort explain?",
      "Deliver the equity report with trend analysis, unexplained residuals and programme implications",
    ],
    datasetDescription:
      "~9,000 student records across five cohorts: demographic fields (gender, ethnicity with coding variants, Pell, first-generation), entry preparation (SAT with zero sentinels, first-year GPA with gaps), credit progress and outcomes (year-2 retention, graduation, time-to-degree). Ethnicity coding is inconsistent, graduation flags have gaps, credits earned occasionally exceed attempted, duplicates exist, and the coding variants require a documented canonicalisation before any group rate is computed.",
    dataDictionary: [
      { column: "student_id", kind: "id", description: "Student identifier", example: "100482" },
      { column: "cohort_year", kind: "integer", description: "Entry cohort year (2018–2022)", example: "2021" },
      { column: "program", kind: "categorical", description: "Degree program", example: "BS Computer Science" },
      { column: "gender", kind: "categorical", description: "Gender (some lower-case variants)", example: "Female" },
      { column: "ethnicity", kind: "categorical", description: "Ethnicity group (coding variants)", example: "Hispanic or Latino" },
      { column: "pell_status", kind: "categorical", description: "Pell / Non-Pell", example: "Pell" },
      { column: "first_generation", kind: "boolean", description: "First-generation flag", example: "1" },
      { column: "entry_sat", kind: "integer", description: "Entry SAT (0 = not submitted)", example: "1180" },
      { column: "gpa_year1", kind: "decimal", description: "First-year GPA (some missing)", example: "2.91" },
      { column: "gpa_final", kind: "decimal", description: "Final GPA (some missing)", example: "3.12" },
      { column: "credits_attempted", kind: "integer", description: "Credits attempted year 1", example: "30" },
      { column: "credits_earned", kind: "integer", description: "Credits earned year 1 (can exceed attempted in error)", example: "27" },
      { column: "retention_year2", kind: "boolean", description: "Retained into year 2", example: "1" },
      { column: "graduated", kind: "boolean", description: "Graduated within 150% time (some missing)", example: "1" },
      { column: "time_to_degree_terms", kind: "integer", description: "Terms to degree (blank if not graduated)", example: "12" },
    ],
    initialQuestions: [
      "What are the raw retention and graduation gaps by ethnicity, Pell and first-generation status, by cohort?",
      "How much of each gap survives adjustment for entry preparation, program mix and cohort year?",
      "Are gaps closing, stable or widening across the five cohorts?",
      "What share of each gap do the observables explain, and what remains unexplained?",
      "What programme actions does the evidence support, and what should the institution measure next?",
    ],
    dataset: {
      name: "Rivermont cohorts 2018–2022",
      filename: "education-03-cohorts.csv",
      description: "5 entry cohorts with demographics, preparation, progress and outcomes.",
      rows: 9000,
    },

    dataQuality: [
      { issue: "Ethnicity coding variants", where: "ethnicity — upper/lower-case and short forms", detection: "value_counts()", treatment: "Canonical map to a small standard set; every mapping documented — this is a demographic variable and the mapping is politically load-bearing." },
      { issue: "SAT zero sentinels", where: "entry_sat == 0 (not submitted)", detection: "value_counts(); zero impossible as a score", treatment: "0 → NaN + submitted flag; a zero treated as a score destroys the preparation control." },
      { issue: "Missing graduation flags", where: "graduated — ~2% missing", detection: "isna().sum() by cohort (right-censoring check)", treatment: "Critical: later cohorts (2021-22) may be censored rather than missing — graduation must be computed only for cohorts old enough to have had 150% time; state the eligibility rule." },
      { issue: "Credits earned exceeding attempted", where: "credits_earned > credits_attempted", detection: "compare columns", treatment: "Impossible: exclude from credit-progress analysis (counted) — likely an overload-credit accounting artifact." },
      { issue: "Missing gpa_final / gpa_year1", where: "gaps ~6%", detection: "isna() by outcome", treatment: "Separate the mechanisms: non-graduates lack gpa_final legitimately (no final GPA); year-1 gaps are attrition-related — handle each analysis accordingly." },
      { issue: "Duplicate students", where: "~0.5% duplicated rows", detection: "duplicated('student_id').sum()", treatment: "Drop; demographic rates need unique students." },
    ],
    cleaningPlan: [
      { action: "Canonicalise demographic coding with a documented mapping; deduplicate", rationale: "Group labels are the study's spine; variant codes split groups silently." },
      { action: "Resolve SAT sentinels and impossible credits; handle GPA gaps by mechanism", rationale: "Preparation controls and progress metrics must be honest." },
      { action: "Define graduation eligibility by cohort age (censoring rule) and compute on eligible cohorts only", rationale: "Censored cohorts would fabricate 'low graduation' for students who simply haven't had time." },
      { action: "Build the analysis panel: demographics, preparation, program, cohort, outcomes", rationale: "One frame, documented fields, ready for raw and adjusted analyses." },
    ],
    edaPlan: [
      { question: "Cohort landscape", method: "cohort sizes by group; program mix by group", expectation: "Program mix differs by group — the first decomposition candidate." },
      { question: "Raw gaps", method: "retention and graduation rates by group (eligible cohorts), with CIs", expectation: "5–8pt retention gaps; 8–12pt graduation gaps by Pell/first-gen; ethnicity gaps similar." },
      { question: "Preparation context", method: "SAT submission and score distributions by group; year-1 GPA by group", expectation: "Modest score differences, larger GPA differences — GPA is already an outcome, note the leakage direction." },
      { question: "Gap trends", method: "gap by cohort year (eligible pairs)", expectation: "Retention gaps narrowing slightly; graduation gaps flat — different stories." },
      { question: "Program-level gaps", method: "graduation by group within program (top programs)", expectation: "Some programs gap-free, others gap-heavy — programme targeting insight." },
    ],
    statisticsPlan: [
      { technique: "Gap estimation with Wilson CIs by group and cohort", purpose: "The raw-gap table with honest uncertainty", expectation: "Most gaps significant; cohort-level cells noisier." },
      { technique: "Adjusted gaps: logistic regression (retained/graduated ~ group + SAT + program + cohort)", purpose: "Gaps net of observables", expectation: "Gaps shrink by roughly a third to a half; Pell and first-gen gaps remain material." },
      { technique: "Decomposition (group-mean contrasts of covariates × coefficients — a Blinder-Oaxaca-style term set)", purpose: "How much does each covariate family explain?", expectation: "Program mix and entry preparation each explain a slice; a substantial residual remains." },
      { technique: "Sensitivity: results with and without year-1 GPA as control (the leakage check)", purpose: "Show how control choice moves the gap", expectation: "Gaps shrink further with GPA controlled — because GPA is itself an outcome; report both, argue for the without-GPA model as primary." },
    ],
    visualisationPlan: [
      { chart: "Dot plot with CIs — raw graduation gap by group", answers: "What are the gaps?", reads: "Dots vs the institutional mean line; intervals keep small groups honest." },
      { chart: "Paired bars — raw vs adjusted gaps by group", answers: "What survives adjustment?", reads: "The shrinkage visible; the remaining bar is the unexplained core." },
      { chart: "Decomposition stacked bar — explained share by covariate family", answers: "Where does the gap come from?", reads: "Stacked explained components vs unexplained remainder." },
      { chart: "Line — gap by cohort year (trend)", answers: "Closing or not?", reads: "Slope with CI band; retention vs graduation as two lines." },
      { chart: "Heatmap — graduation gap by program × group", answers: "Where to target programmes?", reads: "Cells with big gaps and enough n — the action map." },
    ],
    findings: [
      "Raw gaps are material: graduation rates run 8–12 points lower for Pell and first-generation students, with similar ethnicity gaps; retention gaps are smaller (5–7 points) but appear earlier in the timeline.",
      "Adjustment shrinks but does not close: after entry preparation, program mix and cohort controls, roughly half to two-thirds of each gap persists — the observables explain part, not all.",
      "The decomposition tells the institution where the explained share lives: program mix and entry preparation each account for a visible slice, with program mix the larger — where students study associates with whether they finish.",
      "Trends split by stage: retention gaps have narrowed slightly across cohorts (early interventions showing?), while graduation gaps are flat — the later-stage pipeline has not moved.",
      "The sensitivity analysis shows why control choice matters: adding year-1 GPA shrinks gaps further, but GPA is itself an outcome — the report's primary model excludes it and says why.",
    ],
    recommendations: [
      { what: "Target structured-support programmes at the high-gap programs identified in the heatmap, not institution-wide", why: "Gaps concentrate by program; support aimed where gaps live outperforms blanket programmes.", impact: "Most gap reduction per programme dollar", horizon: "this quarter" },
      { what: "Commission a study of the unexplained residual (qualitative + advising data)", why: "Half the adjusted gap has no measurable correlate — that is where institutional explanation must be built, not assumed.", impact: "Builds the next wave of intervention evidence", horizon: "longer term" },
      { what: "Report gap metrics annually with the raw/adjusted/decomposed structure as the standing format", why: "Raw-only reporting invited the last political fight; the structured format pre-empts it.", impact: "Reporting credibility", horizon: "immediate" },
      { what: "Prioritise the graduation pipeline (advising, degree-progress tracking) where gaps are flat", why: "Retention is moving; graduation isn't — the flat trend marks the unfinished agenda.", impact: "Attacks the stalled stage", horizon: "this quarter" },
    ],
    finalReport: {
      executiveSummary:
        "Rivermont's attainment gaps are real, partially explained, and unequally distributed across the student lifecycle. Raw graduation gaps of 8–12 points for Pell, first-generation and under-represented students persist at roughly half their size after adjustment for preparation, program and cohort — with program mix the largest explained component, pointing support at specific programs. Retention gaps have narrowed slightly in recent cohorts while graduation gaps are flat, marking the later pipeline as the stalled stage. Methodologically, the report separates raw, adjusted and decomposed views, treats year-1 GPA as an outcome rather than a control, and restricts graduation metrics to cohorts old enough to graduate — the choices a methodological review will probe, stated plainly.",
      structure: [
        "1. The provost's question and the study's methodological stance",
        "2. Panel construction: coding canonicalisation and eligibility rules",
        "3. Raw gaps by group and cohort (with intervals)",
        "4. Adjusted gaps: regression results",
        "5. Decomposition: the explained share and its sources",
        "6. Trends across cohorts",
        "7. Sensitivity: the GPA-control question",
        "8. Programme implications and the measurement agenda",
        "9. Appendix: mapping tables, model tables, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Write the methodological stance",
        goal: "Eligibility rules, control philosophy, and the leakage question settled first.",
        instructions: [
          "Define graduation eligibility by cohort age (2021+ cohorts cannot be judged on 150%-time graduation) — the censoring rule.",
          "Settle the control philosophy: entry preparation and program mix are legitimate controls; year-1 GPA is an outcome and excluded from the primary model.",
          "Note the demographic-coding canonicalisation as a documented, reviewable mapping.",
        ],
        hints: [
          "Cohort censoring is the study's silent trap: computing graduation for 2022 entrants measures time, not attainment.",
          "The GPA question is the methodological heart: controlling for an outcome 'explains' gaps by explaining them away — primary model excludes it, sensitivity includes it.",
          "Demographic mappings get an appendix table — reviewers and communities will ask exactly how labels were combined.",
        ],
        checkpoint: "The stance document: eligibility, controls, coding policy.",
        code: {
          label: "Eligibility setup",
          language: "python",
          source: `df = pd.read_csv("education-03-cohorts.csv")
print(df.groupby("cohort_year")["student_id"].count())
print(df["graduated"].isna().groupby(df["cohort_year"]).mean().round(3))
# eligibility: graduation judged only for cohorts with full 150% time
ELIGIBLE_YEARS = [2018, 2019, 2020]`,
        },
      },
      {
        phase: "quality",
        title: "Canonicalise with political care",
        goal: "Demographic mapping, sentinels, impossible credits, censoring.",
        instructions: [
          "Build the ethnicity/gender canonical map; document every merge decision.",
          "Resolve SAT zeros (NaN + flag); exclude impossible credit rows; count everything.",
          "Verify graduation-flag missingness aligns with censoring (not random).",
        ],
        hints: [
          "The canonical map is a deliverable: every raw label → canonical group, with counts — transparency here is the study's political armour.",
          "SAT zero → NaN: the submitted flag itself is informative (test-optional populations) — keep it as a control.",
          "Censoring check: missingness concentrated in young cohorts = censoring; scattered = a data defect. Treat differently.",
        ],
        checkpoint: "Canonical demographics, resolved sentinels, censoring verified.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis panel",
        goal: "One frame: demographics, preparation, program, cohort, outcomes, eligibility flags.",
        instructions: [
          "Assemble the panel with the eligibility flag and the submitted-SAT flag.",
          "Derive credit-progress ratio (earned/attempted, valid rows only).",
          "Snapshot group × cohort sizes — the denominators table.",
        ],
        hints: [
          "The panel is deliberately conservative: eligibility flags instead of deletions, so every analysis states its own population.",
          "Credit progress: earned/attempted on valid rows — a clean early-performance measure that respects the impossible-value exclusions.",
          "Denominators table first: every rate you report later divides by something in it.",
        ],
        checkpoint: "The analysis panel with eligibility and denominator snapshots.",
        code: {
          label: "Panel assembly",
          language: "python",
          source: `ETH = {"ASIAN": "Asian", "Asian": "Asian", "BLACK OR AFRICAN AMERICAN": "Black or African American",
      "Black or African American": "Black or African American", "HISPANIC OR LATINO": "Hispanic or Latino",
      "Hispanic or Latino": "Hispanic or Latino", "WHITE": "White", "White": "White",
      "TWO OR MORE": "Two or More", "Two or More": "Two or More",
      "RACE/ETHNICITY UNKNOWN": "Race/ethnicity unknown", "Race/ethnicity unknown": "Race/ethnicity unknown"}
panel = df.drop_duplicates("student_id").copy()
panel["eth"] = panel["ethnicity"].map(ETH)
assert panel["eth"].notna().all()
panel["sat_submitted"] = panel["entry_sat"] > 0
panel.loc[~panel["sat_submitted"], "entry_sat"] = np.nan
panel["grad_eligible"] = panel["cohort_year"].isin(ELIGIBLE_YEARS)`,
        },
      },
      {
        phase: "eda",
        title: "Raw gaps and their context",
        goal: "Gap tables with CIs, preparation context, program mix, trends.",
        instructions: [
          "Retention and graduation gaps by group (eligible cohorts), with Wilson CIs.",
          "Preparation context: SAT distributions by group (submitted scores); program mix by group.",
          "Gap trend by cohort year (retention only for young cohorts; graduation for eligible).",
        ],
        hints: [
          "Eligibility discipline in code: grad rates computed on grad_eligible rows only — every table states its population.",
          "Program mix by group is the decomposition's preview: if groups sit in different programs, part of the gap lives there.",
          "Trend lines with CIs: two cohorts' cells are noisy; the pattern needs the interval discipline.",
        ],
        checkpoint: "Raw-gap tables, context distributions, trend snapshot.",
        code: {
          label: "Raw gaps",
          language: "python",
          source: `el = panel[panel["grad_eligible"]]
for g in ["eth", "pell_status", "first_generation"]:
    tab = el.groupby(g)["graduated"].agg(["mean", "count"])
    tab.columns = ["grad_rate", "n"]
    print(f"\\n{g}:\\n{tab.round(3)}")

print(panel.groupby("eth")["program"].value_counts(normalize=True).unstack().round(2).iloc[:, :4])`,
        },
      },
      {
        phase: "statistics",
        title: "Adjust and decompose",
        goal: "Logistic adjusted gaps, decomposition terms, sensitivity.",
        instructions: [
          "Logistic: graduated ~ group + sat + program + cohort (eligible cohorts); report adjusted gaps (predictive margins or group coefficients).",
          "Decompose: how much of the raw gap does each covariate family absorb (add-covariates-in-blocks approach).",
          "Sensitivity: add year-1 GPA; report both models and argue the primary.",
        ],
        hints: [
          "Blocks-in blocks-out: raw → +SAT → +program → +cohort — the coefficient on the group term at each step IS the decomposition narrative.",
          "Adjusted gap from logistic: average predicted probability contrast (a mini predictive-margins computation) — more honest than exponentiated coefficients alone.",
          "The GPA-sensitivity argument: controlling an outcome absorbs the gap's mechanism — the without-GPA model measures the institution's responsibility, the with-GPA model measures post-arrival performance differences.",
        ],
        checkpoint: "Adjusted-gap table, block decomposition, sensitivity results.",
        code: {
          label: "Blocks decomposition",
          language: "python",
          source: `import statsmodels.formula.api as smf

el = el.dropna(subset=["graduated"]).copy()
el["pell"] = (el["pell_status"] == "Pell").astype(int)
for spec in ["pell", "pell + entry_sat", "pell + entry_sat + C(program)", "pell + entry_sat + C(program) + C(cohort_year)"]:
    m = smf.glm(f"graduated ~ {spec}", data=el, family=sm.families.Binomial()).fit()
    print(f"\\n{spec}: pell coef {m.params.get('pell', float('nan')):.3f}")`,
        },
      },
      {
        phase: "visualisation",
        title: "The equity exhibits",
        goal: "Five charts: gap dots, raw-vs-adjusted pairs, decomposition stack, trends, program heatmap.",
        instructions: [
          "Build the five; the raw-vs-adjusted pair chart is the report's centrepiece.",
          "Decomposition stack shows explained-by-source vs unexplained.",
          "Program heatmap with n= masks for small cells.",
        ],
        hints: [
          "Dot-with-CI plots (like forest plots) give every group an honest interval against the institutional mean line.",
          "Raw vs adjusted paired bars: the shrinkage is the story; label the remaining gap explicitly.",
          "Heatmap: mask cells with n < 30 — a gap on 12 students is a rumour, not a finding.",
        ],
        checkpoint: "Five exhibits, centrepiece chart polished.",
      },
      {
        phase: "interpretation",
        title: "Tell the truth about the gaps",
        goal: "Raw, adjusted, explained, unexplained — each stated with its meaning.",
        instructions: [
          "Answer the five questions; keep the language precise (gaps 'shrink after adjustment', not 'disappear').",
          "Explain what the unexplained residual does and does not mean (not proof of discrimination, not absolution either — unmeasured factors).",
          "State the trend story: retention improving, graduation flat.",
        ],
        hints: [
          "Residual language discipline: 'unexplained by measured covariates' — the qualifier is the whole point.",
          "Avoid both political failure modes: raw-only reporting (overstates institutional fault) and full-adjustment reporting (absorbs mechanism and understates it).",
          "The trend split is actionable: the institution is moving retention but not completion — say which programmes own which stage.",
        ],
        checkpoint: "Five answered questions with precise gap language.",
      },
      {
        phase: "recommendations",
        title: "The equity programme",
        goal: "Targeted actions, the residual-research agenda, and the standing report format.",
        instructions: [
          "Recommend program-targeted support, the unexplained-residual study, the structured annual report, and the graduation-pipeline priority.",
          "Attach owners and dates; equity programmes need institutional accountability.",
          "Define next-year's measurement agenda (what data would shrink the residual).",
        ],
        hints: [
          "Program targeting uses the heatmap: name the programs, name the gaps, size the eligible populations.",
          "The residual study is a research recommendation — qualitative + advising data — and saying so explicitly is a strength, not a deflection.",
          "The standing report format (raw/adjusted/decomposed) is the study's institutional legacy beyond this year's numbers.",
        ],
        checkpoint: "The programme with owners, dates and the measurement agenda.",
      },
      {
        phase: "report",
        title: "The equity study",
        goal: "A provost-grade study that survives methodological and political review.",
        instructions: [
          "Follow the outline; open with the methodological stance (it frames every number that follows).",
          "Body: raw gaps → adjusted → decomposition → trends → sensitivity → programme.",
          "Appendix: the full coding map, model tables, eligibility rules, reproduction script.",
        ],
        hints: [
          "The study's one-liner: 'Gaps are real, half-explained by measurable differences, and concentrated in the graduation pipeline — here is the targeted response.'",
          "Methodological transparency is the political armour: every contested choice (coding, controls, eligibility) stated in the body, documented in the appendix.",
          "Reproducibility: one script from raw CSV to every exhibit — institutional reports get re-run by sceptics.",
        ],
        checkpoint: "The complete equity study, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the institutional research analyst. The provost wants an equity study that survives scrutiny: raw gaps, adjusted gaps, decomposition, trends — with every methodological choice stated. Coding maps, eligibility rules and control philosophy are yours, documented in the appendix for review.",
      deliverables: [
        "Panel construction with documented demographic canonicalisation and censoring rules",
        "Raw gap tables (retention, graduation, time-to-degree) with intervals",
        "Adjusted gaps from regression with preparation, program and cohort controls",
        "Block decomposition and the GPA-control sensitivity analysis",
        "Equity report: trends, programme targeting, residual-research agenda, standing report format",
      ],
      guardrails: [
        "Graduation metrics only for cohorts past the eligibility horizon",
        "Year-1 GPA treated as outcome, not control, in the primary model",
        "Unexplained residuals described with precise qualifiers",
        "Small-N cells masked, not reported as findings",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Censoring respected in graduation metrics (eligibility rule applied)",
        "SAT sentinel resolved before use as a control",
        "Adjusted gaps from predictive margins or clearly-stated coefficient contrasts",
      ],
      "code-quality": [
        "Demographic mapping table explicit and asserted",
        "Blocks decomposition staged clearly",
      ],
      reasoning: [
        "Outcome-as-control leakage addressed in the sensitivity design",
        "Explained vs unexplained shares interpreted with qualifiers",
      ],
      visualization: [
        "Raw vs adjusted comparison visible in one exhibit",
        "Small cells masked in program-level views",
      ],
      interpretation: [
        "Trend split (retention vs graduation) articulated",
        "Residual meaning bounded in both directions",
      ],
      recommendations: [
        "Programme targeting tied to the heatmap evidence",
        "Residual-research agenda and standing report format included",
      ],
    },
  },
];
