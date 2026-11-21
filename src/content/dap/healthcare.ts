/**
 * Healthcare analytics projects — HLT-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const HEALTHCARE_PROJECTS: DapProject[] = [
  /* ================================================================ HLT-01 */
  {
    id: "healthcare-1",
    categoryId: "healthcare",
    difficulty: "beginner",
    code: "HLT-01",
    title: "Clinic No-Show Analysis",
    subtitle: "Eight thousand appointments: who misses, when, and what it costs the schedule.",
    summary:
      "A first healthcare analysis: clean an appointment register, measure no-show rates by lead time, day and clinic, and recommend scheduling changes that recover the lost capacity.",
    hours: 5,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Operational metrics", "Categorical cleaning", "Rate analysis", "Bar charts", "Operational recommendations"],

    businessBackground:
      "Riverside Health runs four clinics whose schedules leak capacity to no-shows: patients who book and don't arrive, leaving slots that can rarely be resold. The operations manager estimates the clinics run 'about 15%' no-shows but can't say which clinics, which lead times or which patient groups drive it — so every fix so far (reminder calls, overbooking experiments) has been aimed in the dark. The appointment register is now exportable, and the ops manager wants the no-show pattern mapped properly.",
    problemStatement:
      "Quantify no-shows from five months of appointments: overall and segment-level no-show rates (clinic, specialty, lead time, day, hour, insurance, prior history), the lead-time relationship, and the capacity and dollars the pattern wastes — then recommend scheduling changes ranked by recoverable slots.",
    businessObjectives: [
      "Compute no-show rates by clinic, specialty, weekday, hour and insurance type",
      "Quantify the lead-time relationship (booking window vs no-show probability)",
      "Assess whether prior no-show history predicts future no-shows",
      "Estimate recoverable capacity (slots) and visit volume at stake",
      "Deliver a scheduling recommendation set the ops manager can implement",
    ],
    datasetDescription:
      "~8,000 appointment records across four clinics: each row an appointment with scheduled and actual booking dates, lead time, timing, clinic, specialty, insurance, reminder flag, patient history and the no-show outcome. The outcome column mixes four encodings, lead times include impossible negatives, reminder flags have gaps, specialty casing varies, and duplicates exist — the register needs standardising before any rate is quotable.",
    dataDictionary: [
      { column: "appointment_id", kind: "id", description: "Unique appointment identifier", example: "203881" },
      { column: "patient_id", kind: "id", description: "Patient identifier", example: "61204" },
      { column: "clinic", kind: "categorical", description: "Clinic name (4 values)", example: "Northgate Clinic" },
      { column: "specialty", kind: "categorical", description: "Specialty (casing variants)", example: "Cardiology" },
      { column: "appointment_date", kind: "date", description: "Appointment date", example: "2025-04-22" },
      { column: "booking_lead_days", kind: "integer", description: "Days between booking and appointment (negatives are errors)", example: "12" },
      { column: "appointment_day", kind: "categorical", description: "Day of week", example: "Tue" },
      { column: "appointment_hour", kind: "integer", description: "Hour of appointment (8–17)", example: "14" },
      { column: "insurance_type", kind: "categorical", description: "Private / Public / Self-pay / Employer", example: "Public" },
      { column: "prior_no_shows", kind: "integer", description: "Patient's prior no-shows in the system", example: "2" },
      { column: "sms_reminder", kind: "boolean", description: "SMS reminder sent (some missing)", example: "1" },
      { column: "no_show", kind: "categorical", description: "Outcome (four mixed encodings)", example: "Yes" },
    ],
    initialQuestions: [
      "What is the overall no-show rate, and how does it vary by clinic and specialty?",
      "How does no-show probability change with booking lead time?",
      "Do SMS reminders associate with lower no-shows, and for whom?",
      "Does prior no-show history predict missing again?",
      "How many slots per week could realistic scheduling changes recover?",
    ],
    dataset: {
      name: "Riverside appointment register",
      filename: "healthcare-01-appointments.csv",
      description: "5 months of appointments across 4 clinics with no-show outcomes.",
      rows: 8000,
    },

    dataQuality: [
      { issue: "Four no-show encodings", where: "no_show — 'Yes'/'1'/'No'/'0' mixed", detection: "value_counts(dropna=False)", treatment: "Map all variants to boolean explicitly; assert no unmapped values — the outcome column must be airtight." },
      { issue: "Negative lead times", where: "booking_lead_days < 0", detection: "(df['booking_lead_days'] < 0).sum()", treatment: "Impossible (booked after appointment): exclude from lead-time analysis, count, report as a registration-desk process defect." },
      { issue: "Missing SMS reminder flags", where: "sms_reminder — ~3%", detection: "isna().sum()", treatment: "Label 'Unknown' and exclude from reminder analysis; reminder effectiveness must not rest on unknown sends." },
      { issue: "Specialty casing", where: "specialty — 'cardiology' variants", detection: "value_counts()", treatment: "Title-case before segmenting." },
      { issue: "Duplicate appointments", where: "~0.9% duplicated rows", detection: "duplicated('appointment_id').sum()", treatment: "Drop; duplicates double-count both slots and no-shows." },
    ],
    cleaningPlan: [
      { action: "Map no_show and sms_reminder to canonical booleans with assertions", rationale: "The outcome and the key exposure must each be one encoding before rates." },
      { action: "Deduplicate; canonicalise specialty; exclude negative lead times (counted)", rationale: "Clean denominators and honest lead-time math." },
      { action: "Derive lead-time bands (same-week, 1-2 wk, 2-4 wk, 1-2 mo, 2+ mo)", rationale: "Bands make the lead-time relationship visible and actionable for scheduling policy." },
      { action: "Derive a patient-risk flag (prior_no_shows ≥ 2) for the history analysis", rationale: "Turns the history column into the scheduling heuristic the clinic can act on." },
    ],
    edaPlan: [
      { question: "Overall and clinic rates", method: "no_show mean overall; groupby(clinic) with counts", expectation: "~14% overall; Riverside Family Practice highest (~17%)." },
      { question: "Specialty pattern", method: "groupby(specialty)", expectation: "Dermatology and Orthopaedics worst; General Practice best (relationship continuity)." },
      { question: "Lead-time curve", method: "no-show rate by lead-time band", expectation: "Monotone rise: same-week ~7% to 2+ months ~25%." },
      { question: "Reminder effect", method: "rate by sms_reminder (known flags only)", expectation: "Reminded appointments no-show ~4–5 points less; confounded by clinic mix — note it." },
      { question: "History predictor", method: "rate by prior_no_shows bucket", expectation: "Strong gradient: 0 prior ≈ 11%, 3+ prior ≈ 35%." },
      { question: "Day and hour", method: "rate by weekday and appointment hour", expectation: "Monday worst, mid-morning worst (8–9am snoozes).",
      },
    ],
    statisticsPlan: [
      { technique: "Rate comparison with Wilson CIs", purpose: "Segment rates with honest intervals", expectation: "Clinic gaps mostly survive their intervals; specialty small-N gaps get caveats." },
      { technique: "Two-proportion test (reminder vs not, within-clinic)", purpose: "Reminder effect with the confounder addressed", expectation: "Within-clinic comparison shrinks the reminder effect but keeps it positive." },
      { technique: "Recoverable-capacity arithmetic", purpose: "Translate rates into slots and visits", expectation: "Reducing over-30-day-lead no-shows to the 2-week rate recovers ~15–20 slots/week network-wide." },
    ],
    visualisationPlan: [
      { chart: "Bar — no-show rate by clinic (with counts)", answers: "Where is the leak?", reads: "Bar height with n= labels; the worst clinic named." },
      { chart: "Line — no-show rate by lead-time band", answers: "What does waiting cost?", reads: "Rising line from same-week to 2+ months — the scheduling lever." },
      { chart: "Grouped bar — rate by reminder, within clinic", answers: "Do reminders work where they're used?", reads: "Paired bars per clinic controlling the mix confounder." },
      { chart: "Bar — rate by prior-no-show bucket", answers: "Who needs the intervention?", reads: "Gradient bars; the 3+ bucket is the watchlist." },
      { chart: "Heatmap — weekday × hour rates", answers: "When are slots wasted?", reads: "Monday 8–9am cell hottest; schedule design visible." },
    ],
    findings: [
      "Network no-shows run ~14%, but the load is uneven: Riverside Family Practice (~17%) and Dermatology appointments carry rates 4–5 points above the network average.",
      "Lead time is the strongest structural driver: same-week bookings no-show around 7% while bookings made 2+ months ahead no-show near 25% — every extra week of waiting adds roughly a point.",
      "SMS reminders associate with ~4–5 points lower no-shows; within-clinic comparison shrinks but preserves the association (confounded by clinic mix, so treat as promising, not proven).",
      "History predicts the future: patients with 3+ prior no-shows miss roughly a third of subsequent appointments — a watchlist heuristic the scheduling system could enforce tomorrow.",
      "Monday and early-morning slots waste disproportionately; combined with the long-lead pattern, roughly 15–20 slots a week network-wide are recoverable by policy alone.",
    ],
    recommendations: [
      { what: "Introduce a confirmation-required step for bookings 4+ weeks out (SMS confirm at 2 weeks or auto-release)", why: "Long-lead bookings no-show at 3× the same-week rate; reconfirmation catches the decay early.", impact: "Largest single recovery: the long-lead slot pool", horizon: "this quarter" },
      { what: "Apply a risk-based overbooking factor for patients with 3+ prior no-shows (with an equity review)", why: "The history gradient is steep and known in advance; modest overbooking is the standard capacity answer.", impact: "Recovers watchlist slots without new demand", horizon: "this quarter" },
      { what: "A/B pilot the SMS reminder at the two worst clinics with a randomised rollout", why: "The association is promising but confounded; a pilot converts it into evidence before network-wide spend.", impact: "Evidence-based reminder policy", horizon: "this quarter" },
      { what: "Hold short-notice slots open for same-week booking at high-risk clinics", why: "Same-week bookings no-show least; protecting a small same-week pool improves both access and yield.", impact: "Better slot yield where no-shows concentrate", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Riverside leaks ~14% of scheduled capacity to no-shows, and the pattern is structural rather than random. Lead time drives it — same-week bookings miss ~7% of the time, two-month-out bookings ~25% — and patient history sharpens it (3+ prior no-shows ≈ one in three missed). Clinics and slots differ: Riverside Family Practice, Dermatology, Monday mornings all run hot. The reminder programme shows promise but needs a randomised pilot to separate its effect from clinic mix. The recommended package — long-lead reconfirmation, risk-based overbooking with an equity review, a reminder pilot and a protected same-week pool — targets 15–20 recovered slots weekly at current volumes.",
      structure: [
        "1. Objective and no-show definition",
        "2. Data and quality treatment",
        "3. Rates by clinic, specialty, day and hour",
        "4. The lead-time relationship",
        "5. Reminders (association + pilot rationale) and patient history",
        "6. Recoverable capacity arithmetic",
        "7. Recommendations (ranked with the equity note)",
        "8. Appendix: cleaning log, encoding map, exclusions",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the register",
        goal: "Load, profile, and get the outcome column airtight.",
        instructions: [
          "Profile shape, dtypes, nulls; list every no_show encoding variant you find.",
          "Confirm the grain: one row = one appointment; duplicates on appointment_id are the integrity question.",
          "Note the columns that describe booking behaviour (lead time, reminder) vs appointment context (clinic, specialty, timing).",
        ],
        hints: [
          "The outcome column is the analysis: four encodings mapped explicitly, asserted, zero unmapped — anything else undermines every rate you'll publish.",
          "value_counts(dropna=False) on no_show and sms_reminder gives you the encoding census in two lines.",
          "Ask what one row is: an appointment slot with an outcome — so the denominator of every rate is appointments, not patients.",
        ],
        checkpoint: "Encoding census, grain verified, column roles noted.",
        code: {
          label: "Profile the register",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("healthcare-01-appointments.csv", parse_dates=["appointment_date"])
print(df.shape)
print(df["no_show"].value_counts(dropna=False))
print("dupes:", df.duplicated("appointment_id").sum())
print(df.isna().sum())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the register",
        goal: "All five defect families counted with treatments decided.",
        instructions: [
          "Build the no_show mapping (every variant listed); same for sms_reminder.",
          "Count negative lead times, specialty variants, duplicates.",
          "Write the audit table — the ops manager will ask how the numbers were derived.",
        ],
        hints: [
          "Mapping dict + assert notna().all() — the assert is your guarantee that no variant escaped.",
          "Negative lead times are a registration-desk process defect worth reporting separately from the analysis exclusion.",
          "Specialty casing: str.title() once, verify the count drops to exactly 5 specialties.",
        ],
        checkpoint: "The audit table with five rows and decided treatments.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Canonical frame with booleans, bands and the risk flag.",
        instructions: [
          "Apply all mappings and fixes; derive lead-time bands and the prior-history flag.",
          "Keep reminder-unknown rows out of reminder analysis (in everything else they stay).",
          "Compute the overall no-show rate — the report's first number.",
        ],
        hints: [
          "Bands: [0,7,14,30,60,999] as same-week / 1-2wk / 2-4wk / 1-2mo / 2+mo — the scheduling policy lives at these boundaries.",
          "Risk flag: prior_no_shows >= 2 — choose the threshold from the data gradient, not habit.",
          "One overall rate, computed once, quoted everywhere consistently.",
        ],
        checkpoint: "Clean frame, banded lead times, risk flag, overall rate.",
        code: {
          label: "Canonical frame",
          language: "python",
          source: `NS = {"Yes": True, "1": True, "No": False, "0": False}
clean = df.drop_duplicates("appointment_id").copy()
clean["no_show_b"] = clean["no_show"].map(NS)
assert clean["no_show_b"].notna().all()
clean["specialty"] = clean["specialty"].str.title()

valid = clean[clean["booking_lead_days"] >= 0].copy()
bands = [0, 7, 14, 30, 60, 999]
labels = ["Same week", "1-2 wks", "2-4 wks", "1-2 mo", "2+ mo"]
valid["lead_band"] = pd.cut(valid["booking_lead_days"], bins=bands, labels=labels, right=False)
print(f"overall no-show: {clean['no_show_b'].mean():.1%}")`,
        },
      },
      {
        phase: "eda",
        title: "Map the no-show pattern",
        goal: "Segment rates, the lead-time curve, reminder and history gradients.",
        instructions: [
          "Rates by clinic, specialty, weekday, hour, insurance — always with counts.",
          "The lead-time curve (band rates) — the report's central exhibit.",
          "Reminder effect and prior-history gradient.",
        ],
        hints: [
          "A rate helper with count columns keeps every table honest.",
          "The lead-time curve usually tells the whole story — if it doesn't rise monotonically, investigate before proceeding.",
          "Reminder comparison: run it overall AND within-clinic; the difference between the two is the confounder's fingerprint.",
        ],
        checkpoint: "All segment rates quoted; lead-time curve and history gradient established.",
        code: {
          label: "Segment rates",
          language: "python",
          source: `def rate(frame, col):
    return frame.groupby(col, observed=True)["no_show_b"].agg(["mean", "count"])

for c in ["clinic", "specialty", "appointment_day"]:
    print(f"\\n{c}:\\n{rate(clean, c).round(3)}")
print(rate(valid, "lead_band").round(3))
print(rate(clean, clean["prior_no_shows"].clip(upper=3).map({0:"0",1:"1",2:"2",3:"3+"})).round(3))`,
        },
      },
      {
        phase: "statistics",
        title: "Intervals, confounder check and capacity math",
        goal: "Wilson CIs, within-clinic reminder test, recoverable-slot arithmetic.",
        instructions: [
          "Wilson intervals for clinic and specialty rates; note which gaps are noise.",
          "Within-clinic two-proportion test for the reminder effect.",
          "Capacity arithmetic: if long-lead no-shows fell to the 2-week rate, how many slots/week recover?",
        ],
        hints: [
          "proportion_confint(k, n, method='wilson') beside every published rate.",
          "Within-clinic reminder test: compute the effect separately per clinic, then pool — shrinkage from the overall effect is the mix story.",
          "Capacity chain: (long-lead appointments/week) × (observed − target rate) = recoverable slots — show the chain.",
        ],
        checkpoint: "Intervalled rates, within-clinic reminder finding, slot-recovery arithmetic.",
      },
      {
        phase: "visualisation",
        title: "The ops exhibits",
        goal: "Five charts led by the lead-time curve.",
        instructions: [
          "Clinic bars with n=; lead-time curve; within-clinic reminder pairs; history gradient; weekday×hour heatmap.",
          "Annotate the lead-time curve's endpoints ('7% same-week → 25% at 2+ months').",
          "Title each chart with its takeaway.",
        ],
        hints: [
          "The lead-time line chart wants markers and band labels — it will be quoted in the ops meeting.",
          "Reminder pairs: grouped bars by clinic, two bars each (reminded/not), consistent colours.",
          "Heatmap with the hottest cell annotated ('Monday 8am wastes nearly a quarter of slots').",
        ],
        checkpoint: "Five exhibits with the lead-time curve polished.",
      },
      {
        phase: "interpretation",
        title: "Read the pattern honestly",
        goal: "Findings with rates, confounder notes and the equity consideration.",
        instructions: [
          "Answer the five initial questions with figures; flag the reminder association as confounded pending the pilot.",
          "Note the equity dimension of risk-based overbooking — flag it as a required review, not an afterthought.",
          "Draft the recoverable-capacity paragraph.",
        ],
        hints: [
          "The reminder finding's honest phrasing: 'associated with lower no-shows; clinic mix confounds the estimate; the pilot resolves it.'",
          "Risk-based policies in healthcare need an equity check (does the watchlist skew by insurance or demography?) — raise it before the policy is adopted, not after.",
          "Capacity paragraph: slots/week × average visit value if available, else slots alone — never invent a dollar figure.",
        ],
        checkpoint: "Five answered questions, confounder and equity notes attached.",
      },
      {
        phase: "recommendations",
        title: "The scheduling package",
        goal: "Ranked interventions with recoverable-slot estimates.",
        instructions: [
          "Rank by recoverable capacity per unit of implementation effort; cite the finding for each.",
          "Include the pilot design for the reminder programme (clinics, randomisation, duration, metric).",
          "Attach the equity review to the overbooking recommendation.",
        ],
        hints: [
          "Reconfirmation is policy-cheap and targets the biggest pool — a natural first recommendation.",
          "Pilot specifics: two clinics, 8 weeks, randomise at patient level, primary metric no-show rate difference.",
          "Equity review: check watchlist composition by insurance type before adoption; state it as a gate, not a veto.",
        ],
        checkpoint: "The ranked package with pilot design and equity gate.",
      },
      {
        phase: "report",
        title: "The operations brief",
        goal: "A brief the ops manager takes to the clinic directors.",
        instructions: [
          "Structure: definition → headline → the lead-time story → segments → reminders/history → capacity → package.",
          "Lead-time curve as the body chart; audit table in the appendix.",
          "Keep the equity note in the body — it protects the programme's credibility.",
        ],
        hints: [
          "Lead with the shape, not the average: 'No-shows triple as booking lead time grows from days to months.'",
          "Clinic directors will defend their own numbers — the intervals and counts are your polite answer.",
          "One page of brief, one page of exhibits, appendix behind — operational audiences read forward, reference backward.",
        ],
        checkpoint: "The brief, every figure traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the clinics' first data analyst. The operations manager wants the no-show pattern mapped: rates by segment, the lead-time relationship, reminder promise and history gradient — and a scheduling package ranked by recoverable slots. Encoding maps, band boundaries and the risk threshold are yours to set and document.",
      deliverables: [
        "Encoding standardisation and cleaning log for the register",
        "No-show rates by clinic, specialty, day, hour and insurance (with counts/CIs)",
        "Lead-time band analysis (the central exhibit)",
        "Reminder association with within-clinic confounder check; prior-history gradient",
        "Scheduling recommendation package with recoverable-slot estimates, pilot design and equity note",
      ],
      guardrails: [
        "Outcome column mapped with assertions; no silent coercion",
        "Reminder analysis excludes unknown-send rows",
        "Reminder effect labelled associational pending the pilot",
        "Equity review attached to any risk-based policy",
      ],
    },

    evaluationChecks: {
      correctness: [
        "No-show encodings fully mapped (asserted)",
        "Rates use appointments as denominator, consistently",
        "Capacity arithmetic chain shown explicitly",
      ],
      "code-quality": [
        "Rate helper reused across segments",
        "Band and flag derivations explicit",
      ],
      reasoning: [
        "Lead-time relationship interpreted as the structural driver",
        "Reminder confounding addressed with within-clinic comparison",
      ],
      visualization: [
        "Lead-time curve annotated with endpoint rates",
        "Heatmap or equivalent exposes the day-hour pattern",
      ],
      interpretation: [
        "History gradient translated into the watchlist heuristic",
        "Association vs causation maintained for reminders",
      ],
      recommendations: [
        "Ranking tied to recoverable slots",
        "Pilot design and equity gate attached",
      ],
    },
  },

  /* ================================================================ HLT-02 */
  {
    id: "healthcare-2",
    categoryId: "healthcare",
    difficulty: "intermediate",
    code: "HLT-02",
    title: "Length-of-Stay & Readmission Patterns",
    subtitle: "Six thousand inpatient stays: what drives long stays, and who comes back.",
    summary:
      "Hospital-flow analytics: clean an inpatient encounter dataset, analyse length-of-stay distributions and drivers, measure 30-day readmission patterns, and recommend flow improvements with their clinical caveats.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Clinical ops metrics", "Distribution analysis", "Stratified comparison", "Readmission analysis", "Clinically-humble recommendations"],

    businessBackground:
      "St. Aldhelm's Hospital is under capacity pressure: beds are scarce, elective surgery waits grow, and the medical director suspects length-of-stay (LOS) varies more than case-mix explains while 30-day readmissions quietly consume beds a second time. The hospital's improvement programme needs evidence: which departments, diagnoses and admission types drive long stays; whether readmissions cluster; and where flow interventions would free the most bed-days — all while respecting that clinical judgement, not spreadsheets, discharges patients.",
    problemStatement:
      "Analyse inpatient flow from ~6,500 encounters: LOS distributions by department, diagnosis, admission type and age; the drivers of long stays; 30-day readmission rates and their patterns; the bed-days consumed by outliers and readmissions — and recommend flow interventions with explicit clinical caveats and a stakeholder-engagement plan.",
    businessObjectives: [
      "Compute LOS by department, diagnosis, admission type and age band (median and tail)",
      "Identify the drivers of outlier stays (long-stay tail) and their bed-day cost",
      "Measure 30-day readmission rates by clinical group; test for clustering",
      "Quantify the bed-day pool that realistic flow improvements could release",
      "Deliver a flow-improvement recommendation set with clinical caveats",
    ],
    datasetDescription:
      "~6,500 inpatient encounters over nine months: each row a stay with patient and encounter ids, age band, admission and discharge dates, diagnosis, department, admission type, LOS, readmission flag, discharge disposition and comorbidity count. Some discharges precede admissions (entry errors), LOS carries negatives, readmission labels mix encodings, dispositions have gaps, diagnosis casing varies, and a −1 comorbidity sentinel exists. Cleaning choices here are clinical-safety choices: every exclusion must be visible.",
    dataDictionary: [
      { column: "encounter_id", kind: "id", description: "Unique encounter identifier", example: "91240" },
      { column: "patient_id", kind: "id", description: "Patient identifier", example: "44880" },
      { column: "age_band", kind: "categorical", description: "Age band (5 levels)", example: "65-79" },
      { column: "admission_date", kind: "date", description: "Admission date", example: "2025-03-08" },
      { column: "discharge_date", kind: "date", description: "Discharge date (a few precede admission)", example: "2025-03-12" },
      { column: "primary_diagnosis", kind: "categorical", description: "Diagnosis code+name (casing variants)", example: "E11 Diabetes Type 2" },
      { column: "department", kind: "categorical", description: "Treating department", example: "Internal Medicine" },
      { column: "admission_type", kind: "categorical", description: "Elective / Emergency / Transfer", example: "Emergency" },
      { column: "los_days", kind: "integer", description: "Length of stay in days (negatives are errors)", example: "4" },
      { column: "readmitted_30d", kind: "categorical", description: "30-day readmission flag (mixed encodings)", example: "TRUE" },
      { column: "discharged_to", kind: "categorical", description: "Discharge disposition (some missing)", example: "Home with Care" },
      { column: "comorbidity_count", kind: "integer", description: "Comorbidities (−1 = unknown sentinel)", example: "2" },
    ],
    initialQuestions: [
      "What is the LOS distribution overall and by department — where does the tail live?",
      "Which admission types, diagnoses and age bands carry long stays?",
      "What are 30-day readmission rates by clinical group, and do readmissions cluster by patient?",
      "How many bed-days do outlier stays (beyond department norms) consume?",
      "What flow improvements could realistically release bed-days, with what clinical caveats?",
    ],
    dataset: {
      name: "St. Aldhelm's inpatient encounters",
      filename: "healthcare-02-inpatient-stays.csv",
      description: "9 months of inpatient stays with LOS, readmission flags and clinical attributes.",
      rows: 6500,
    },

    dataQuality: [
      { issue: "Discharge before admission", where: "discharge_date < admission_date", detection: "(df.discharge_date < df.admission_date).sum()", treatment: "Impossible chronology: exclude from LOS analysis entirely (counted) — and flag as a coding-department defect; never 'fix' by swapping dates." },
      { issue: "Negative LOS", where: "los_days < 0", detection: "(df['los_days'] < 0).sum()", treatment: "Same family as above: exclude; verify consistency with the date-pair check (they should agree)." },
      { issue: "Mixed readmission encodings", where: "readmitted_30d — 'TRUE'/'Yes'/'FALSE'/'No'", detection: "value_counts()", treatment: "Map to boolean with a full dict; assert complete mapping." },
      { issue: "LOS vs date-pair consistency", where: "los_days ≠ (discharge − admission).days", detection: "compare computed vs supplied LOS", treatment: "Prefer computed LOS from dates (single source of truth); count disagreements — a data-integrity finding for the coding team." },
      { issue: "Missing discharge disposition", where: "discharged_to — ~5%", detection: "isna().sum()", treatment: "Label 'Unknown' for descriptive use; exclude from disposition-specific analysis (disposition drives flow conclusions)." },
      { issue: "Comorbidity sentinel", where: "comorbidity_count == −1", detection: "value_counts()", treatment: "Map to NaN + unknown flag; −1 as a number would poison severity adjustment." },
      { issue: "Diagnosis casing variants", where: "primary_diagnosis — lower-case variants", detection: "value_counts()", treatment: "Canonicalise; diagnosis is a primary stratifier." },
    ],
    cleaningPlan: [
      { action: "Exclude impossible chronology (both negative LOS and date-pair violations, reconciled)", rationale: "LOS analysis on impossible stays is meaningless; exclusions visible and counted." },
      { action: "Map readmission labels; resolve comorbidity sentinel; canonicalise diagnoses", rationale: "The stratification variables must be single-encoding and honest about unknowns." },
      { action: "Recompute LOS from dates as the canonical value; report disagreement count", rationale: "One source of truth, with the discrepancy disclosed to the coding team." },
      { action: "Derive department-specific LOS norms (median and outlier threshold) and a readmission panel", rationale: "Outliers are relative to department norms; readmission analysis needs the patient-encounter ordering." },
    ],
    edaPlan: [
      { question: "LOS distribution", method: "overall histogram + department medians/P90s", expectation: "Right-skewed: median ~3, P90 ~9; General Surgery shorter, Cardiology longer." },
      { question: "Admission-type profile", method: "LOS by admission type", expectation: "Elective shortest (planned), Emergency mid, Transfer longest (complexity)." },
      { question: "Diagnosis and age patterns", method: "LOS by diagnosis; by age band", expectation: "Heart Failure longest; 80+ band stays ~2× the 18-34 band." },
      { question: "Readmission rates", method: "30-day readmission by diagnosis, age, disposition", expectation: "Heart Failure ~16–18% (the classic); discharge-to-SNF elevated." },
      { question: "Readmission clustering", method: "encounters per patient; repeat-readmission share", expectation: "A small patient group with 2+ readmissions — the complex-cohort story." },
      { question: "Outlier bed-days", method: "bed-days beyond department P90 by department", expectation: "10% of stays hold ~30% of bed-days — the flow target." },
    ],
    statisticsPlan: [
      { technique: "Stratified LOS comparison (median-based, by department × admission type)", purpose: "Compare like with like in skewed data", expectation: "Emergency Cardiology stays run ~1.5× elective General Surgery." },
      { technique: "Readmission rate comparison with CIs (Wilson) by clinical group", purpose: "Honest small-group comparisons", expectation: "HF's rate separates from the hospital mean; several small groups' don't." },
      { technique: "Comorbidity-adjusted comparison (stratification or simple regression)", purpose: "Separate case-mix from process effects", expectation: "Age/comorbidity explain part of the long-stay tail; a process residual remains." },
      { technique: "Bed-day pool arithmetic", purpose: "Size the improvement opportunity", expectation: "Reducing P90-outlier stays to department norms releases ~4–6% of bed-days." },
    ],
    visualisationPlan: [
      { chart: "LOS distribution by department (box or violin, log-ish scale)", answers: "Where does the tail live?", reads: "Medians for comparison; whiskers/outliers for the tail story." },
      { chart: "Bar — readmission rate by diagnosis with CIs", answers: "Who comes back?", reads: "Bars with intervals; HF leads, small groups caveated." },
      { chart: "Bar — bed-days by LOS decile (the concentration exhibit)", answers: "What does the tail cost?", reads: "The top decile's disproportionate share of bed-days." },
      { chart: "Heatmap — median LOS by department × admission type", answers: "Where do long stays concentrate?", reads: "Cells annotate medians with counts; hot cells are flow targets." },
      { chart: "Scatter — LOS vs comorbidity count by readmission outcome", answers: "How do complexity and bounce-back relate?", reads: "Slopes and colour separation; the complex-returning cohort visible." },
    ],
    findings: [
      "LOS is right-skewed everywhere (median ~3 days) and the tail carries the flow problem: the longest 10% of stays hold roughly 30% of all bed-days.",
      "Emergency Cardiology and elderly (80+) encounters run the longest stays — partly case-mix (comorbidity), partly process; after comorbidity adjustment a meaningful residual gap remains in discharge-to-post-acute pathways.",
      "30-day readmissions run ~11% overall with the expected clinical gradient (heart failure highest at ~17%); discharges to skilled nursing carry elevated readmission rates, marking the post-acute transition as a system issue.",
      "A small repeat-visitor cohort (patients with 2+ readmissions in the window) accounts for a disproportionate share of readmission bed-days — the complex-chronic story the medical director suspected.",
      "Roughly 4–6% of total bed-days sit in stays beyond department norms that plausible process improvements (discharge planning, post-acute pathway smoothing) could target — worth a ward-equivalent of capacity.",
    ],
    recommendations: [
      { what: "Stand up a daily discharge-planning huddle for stays crossing the department's P75 mark, led by the flow team", why: "The tail holds the bed-days; planning late is planning less.", impact: "Targets the outlier pool where bed-days concentrate", horizon: "this quarter" },
      { what: "Audit the hospital-to-skilled-nursing transition pathway (medication reconciliation, follow-up scheduling)", why: "SNF discharges readmit at elevated rates — a transition-quality signal, not a blame signal.", impact: "Readmission reduction in the elevated group", horizon: "this quarter" },
      { what: "Create a complex-chronic care-management cohort for repeat readmitters", why: "A small cohort holds outsized readmission bed-days; care management is the standard answer.", impact: "Breaks the readmission loop for the highest-utilisers", horizon: "longer term" },
      { what: "Review the coding-department defects surfaced by the audit (impossible chronology, LOS disagreements)", why: "Flow decisions built on bad encounter data misdirect effort; the defect list is the coding team's backlog.", impact: "Data quality compounding into every future analysis", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "St. Aldhelm's flow problem is concentrated, not diffuse. The longest 10% of stays hold ~30% of bed-days, driven by emergency Cardiology and elderly encounters where comorbidity explains part — but not all — of the length; the residual points at discharge-to-post-acute pathways. Readmissions run ~11% with a clinical gradient (heart failure ~17%) and an elevated signal at the skilled-nursing transition; a small repeat-visitor cohort holds a disproportionate share of return bed-days. A realistic package — earlier discharge planning at the P75 mark, a post-acute transition audit, a complex-chronic care cohort, and the coding-defect backlog — targets 4–6% of bed-days, roughly a ward-equivalent, with clinical judgement explicitly in the loop on every change.",
      structure: [
        "1. The medical director's question and scope",
        "2. Encounter data, quality treatment and the exclusion ledger",
        "3. LOS distributions: where the tail lives",
        "3. Drivers: department, admission type, age, comorbidity (adjusted)",
        "5. Readmissions: rates, gradients, clustering",
        "6. The bed-day pool arithmetic",
        "7. Flow recommendations with clinical caveats",
        "8. Appendix: cleaning log, LOS recomputation note, coding-defect list",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the encounter data",
        goal: "Grain, clinical fields, and the two analysis objects (LOS and readmissions).",
        instructions: [
          "Profile; confirm the grain: one row = one inpatient encounter; patients repeat across encounters.",
          "Identify the two analyses this frame serves: LOS (a stay property) and readmission (a patient-sequence property) — different logic.",
          "Note that clinical fields (diagnosis, comorbidity) are stratifiers, not defects — treat them with respect.",
        ],
        hints: [
          "Patient-level sequencing matters for readmissions: sort by (patient_id, admission_date) when you get there.",
          "LOS = discharge − admission in days; the supplied los_days column is a checkable claim, not a truth.",
          "Clinical caveat discipline: analysts recommend process changes, clinicians decide care — write it in the report's first page.",
        ],
        checkpoint: "Grain confirmed, two-analysis map written, clinical-humility note drafted.",
        code: {
          label: "Encounter profile",
          language: "python",
          source: `df = pd.read_csv("healthcare-02-inpatient-stays.csv", parse_dates=["admission_date", "discharge_date"])
print(df.shape)
print("patients:", df["patient_id"].nunique())
bad = (df["discharge_date"] < df["admission_date"]).sum()
print("impossible chronology:", bad)
print(df["readmitted_30d"].value_counts(dropna=False))`,
        },
      },
      {
        phase: "quality",
        title: "Audit with clinical-safety eyes",
        goal: "Chronology, encodings, sentinel, consistency — each with a defensible treatment.",
        instructions: [
          "Quantify impossible chronology (dates AND negative LOS — reconcile them); mixed readmission encodings; the −1 sentinel; diagnosis casing.",
          "Recompute LOS from dates; count disagreements with the supplied column.",
          "Assemble the exclusion ledger — in hospital data, exclusions are safety information.",
        ],
        hints: [
          "The LOS-vs-dates disagreement count is a gift to the coding team — a concrete defect list, not a vague data-quality complaint.",
          "Never swap dates to 'fix' chronology: an impossible stay is a coding error; the analyst's job is to count and exclude, not repair clinical records.",
          "Sentinel handling: comorbidity −1 → NaN + unknown flag; severity analysis must know what it doesn't know.",
        ],
        checkpoint: "The audit table with the exclusion ledger and coding-defect list.",
      },
      {
        phase: "cleaning",
        title: "Build the analysis frame",
        goal: "Clean encounters with canonical LOS, mapped labels, honest unknowns.",
        instructions: [
          "Apply treatments; recompute LOS; build the stratified frame.",
          "Derive department norms (median, P90) and outlier flags per department.",
          "Build the readmission panel: per patient, ordered encounters with return intervals.",
        ],
        hints: [
          "Outliers are department-relative: a 9-day stay is normal for Cardiology, extreme for day-surgery-adjacent General Surgery.",
          "Readmission intervals: (next admission − this discharge).days — a return within 30 days is the flag; the panel makes clustering countable.",
          "Keep 'Unknown' disposition and comorbidity visible in tables — unknowns are findings, not noise.",
        ],
        checkpoint: "Clean frame, department norms, readmission panel.",
        code: {
          label: "Norms and panel",
          language: "python",
          source: `clean = df[(df["discharge_date"] >= df["admission_date"])].copy()
clean["los"] = (clean["discharge_date"] - clean["admission_date"]).dt.days
clean["readmit"] = clean["readmitted_30d"].map({"TRUE": True, "Yes": True, "FALSE": False, "No": False})
clean.loc[clean["comorbidity_count"] == -1, "comorbidity_count"] = np.nan

norms = clean.groupby("department")["los"].agg(["median", lambda s: s.quantile(0.9)])
norms.columns = ["median_los", "p90_los"]
clean = clean.merge(norms, on="department")
clean["outlier_stay"] = clean["los"] > clean["p90_los"]`,
        },
      },
      {
        phase: "eda",
        title: "LOS landscape and readmission patterns",
        goal: "Distributions, drivers, readmission rates and clustering.",
        instructions: [
          "LOS distribution overall and by department (medians and P90s); by admission type and age band.",
          "Readmission rates by diagnosis, age, disposition (with counts).",
          "Clustering: encounters per patient; the repeat-visitor cohort's share of bed-days.",
        ],
        hints: [
          "Median-first discipline: LOS means are tail-poisoned; medians and P90s tell the flow story.",
          "The bed-day concentration exhibit (bed-days by LOS decile) is the money chart for the medical director.",
          "Clustering math: groupby(patient_id) encounter counts, then readmission bed-days share for the 2+ cohort.",
        ],
        checkpoint: "LOS story quantified, readmission gradients mapped, clustering measured.",
      },
      {
        phase: "statistics",
        title: "Adjust for case-mix honestly",
        goal: "Comorbidity-adjusted comparisons; readmission CIs; bed-day pool.",
        instructions: [
          "Stratify or regress LOS on age band + comorbidity within department; how much of the gap survives?",
          "Wilson CIs on readmission rates by clinical group.",
          "Bed-day pool arithmetic: outlier stays' bed-days beyond department norms.",
        ],
        hints: [
          "Adjustment humility: 'after comorbidity stratification, a residual X-day gap remains' — that residual is the process hypothesis, stated as a hypothesis.",
          "Readmission CIs keep small groups honest: a 20% rate on 30 encounters is an interval, not a finding.",
          "Pool arithmetic: Σ(max(0, los − median_los)) for outlier-flagged stays — the realistic-release candidate.",
        ],
        checkpoint: "Adjusted comparisons, intervalled readmission table, pool arithmetic.",
      },
      {
        phase: "visualisation",
        title: "The flow exhibits",
        goal: "Five charts led by the bed-day concentration exhibit.",
        instructions: [
          "Department LOS boxes; readmission bars with CIs; bed-days by decile; department×admission heatmap; complexity-readmission scatter.",
          "Annotate the decile chart's top-decile share.",
          "Caveat the readmission chart's small groups visually (n= labels).",
        ],
        hints: [
          "Box plots with a log-ish x or capped whiskers keep the tail readable.",
          "The decile bar chart is simple and devastating — resist decorating it.",
          "Heatmap cells: 'median LOS (n encounters)' — flow committees need both numbers.",
        ],
        checkpoint: "Five exhibits, decile chart polished.",
      },
      {
        phase: "interpretation",
        title: "Interpret like a guest in a hospital",
        goal: "Findings with clinical humility and process-vs-case-mix honesty.",
        instructions: [
          "Answer the five questions; separate case-mix facts from process hypotheses in the wording.",
          "Convert the SNF-transition signal into a question for clinical stakeholders, not an accusation.",
          "Size the bed-day pool with its assumptions stated.",
        ],
        hints: [
          "Wording discipline: 'stays longer than norms concentrate in X' (fact) vs 'discharge planning could compress them' (hypothesis for the clinical group to test).",
          "The SNF finding is an invitation: 'the elevated readmission rate at this transition deserves a clinical audit' — analysts frame, clinicians conclude.",
          "Every bed-day number should state its threshold basis (department P90, medians) so the pool is auditable.",
        ],
        checkpoint: "Five answered questions with facts/hypotheses separated and the pool sized.",
      },
      {
        phase: "recommendations",
        title: "The flow package",
        goal: "Process recommendations with clinical gates and a defect backlog.",
        instructions: [
          "Recommend the huddle, the transition audit, the complex-chronic cohort — each with evidence and clinical-gate language.",
          "Include the coding-defect backlog as the data-quality recommendation.",
          "Define the measurement plan (bed-days, readmission rate, outlier share) and review cadence.",
        ],
        hints: [
          "Every recommendation gets a clinical owner and an explicit 'clinicians decide care' clause — that's what gets analytics adopted in hospitals.",
          "The huddle threshold (P75) should come from the data (where the tail begins to accelerate), and be revisited quarterly.",
          "Measurement: outlier-share and median LOS by department, monthly, with the readmission rate trended quarterly.",
        ],
        checkpoint: "The package with clinical gates, defect backlog and measurement plan.",
      },
      {
        phase: "report",
        title: "The flow review",
        goal: "A medical-director-grade review that clinicians will actually read.",
        instructions: [
          "Follow the outline; open with the concentration finding (the tail holds the bed-days).",
          "Methodology and exclusions boxed in the body — hospital audiences ask first.",
          "Close with the package and the review calendar.",
        ],
        hints: [
          "The review's one-liner: '10% of stays hold 30% of bed-days, and the tail starts at a predictable point we can plan around.'",
          "Lead the exclusions paragraph: N in, N excluded and why — in clinical settings, trust in the denominator is everything.",
          "Reproducibility appendix with the coding-defect list attached — the gift that keeps the analysis credible.",
        ],
        checkpoint: "The complete flow review, reproducible from the encounter CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the hospital's flow analyst. The medical director needs the LOS tail mapped, readmission patterns understood and a flow package sized in bed-days — with clinical humility throughout. Exclusion policy, outlier thresholds and adjustment method are yours, documented.",
      deliverables: [
        "Encounter audit with exclusion ledger and coding-defect list",
        "LOS distributions by department, admission type and age (median/P90 based)",
        "Comorbidity-adjusted driver analysis separating case-mix from process",
        "Readmission rates with CIs, clustering analysis and the transition signal",
        "Flow recommendation package with bed-day pool arithmetic, clinical gates and measurement plan",
      ],
      guardrails: [
        "Impossible chronology excluded, never repaired; LOS recomputed from dates",
        "Sentinels and unknowns flagged, not imputed as values",
        "Process vs case-mix language kept distinct",
        "Every recommendation carries a clinical-gate clause",
      ],
    },

    evaluationChecks: {
      correctness: [
        "LOS recomputed from dates; disagreements counted",
        "Readmission panel respects patient-level encounter ordering",
        "Bed-day pool arithmetic threshold-based and shown",
      ],
      "code-quality": [
        "Department norms computed once and joined",
        "Exclusion ledger maintained",
      ],
      reasoning: [
        "Case-mix adjustment attempted (stratification or regression)",
        "Process hypotheses labelled as hypotheses",
      ],
      visualization: [
        "LOS shown with distributions, not just means",
        "Readmission chart carries counts or CIs",
      ],
      interpretation: [
        "Tail concentration quantified (bed-days by decile)",
        "Transition signal framed as clinical question",
      ],
      recommendations: [
        "Clinical gates and owners named",
        "Measurement plan with metrics and cadence",
      ],
    },
  },

  /* ================================================================ HLT-03 */
  {
    id: "healthcare-3",
    categoryId: "healthcare",
    difficulty: "advanced",
    code: "HLT-03",
    title: "ED Capacity & Staffing Model Inputs",
    subtitle: "A year of hourly arrivals: quantify the pressure curve, forecast demand, and design the staffing scenarios.",
    summary:
      "Emergency-department analytics at panel scale: clean an hourly arrivals/staffing panel, quantify demand and pressure metrics (wait times, 4-hour breaches), model arrival patterns with forecasting, and build staffing scenarios with their assumptions and limits.",
    hours: 16,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Time-series panel analysis", "Operational metrics", "Demand forecasting", "Scenario modelling", "Capacity planning"],

    businessBackground:
      "St. Aldhelm's Emergency Department breaches the four-hour wait target increasingly often, and the debate over why is stuck between two stories: 'demand is exploding' and 'we're staffed for the hospital we were'. The ED clinical director has commissioned an analysis of the department's own hourly data — arrivals, waits, breaches, staffing and occupancy over a year — to settle it: what does the demand curve actually look like, how sensitive are breaches to occupancy and staffing, what should next quarter's roster look like, and what would the demand forecast say about the next 12 months?",
    problemStatement:
      "Characterise ED demand and pressure from a year of hourly data: the arrival profile by hour/day/season; wait-time and breach relationships to occupancy and staffing; a defensible demand forecast; and staffing scenarios that translate the analysis into roster options — with assumptions, sensitivity and the model's operational limits made explicit for the clinical director.",
    businessObjectives: [
      "Build a clean hourly panel of arrivals, staffing, occupancy, waits and breaches",
      "Quantify the demand profile (hour-of-day, day-of-week, seasonality) and its trend",
      "Model the pressure relationship: breaches vs occupancy, arrivals and staffing",
      "Produce a demand forecast with prediction intervals for planning",
      "Deliver staffing scenarios with bed-day/coverage implications and explicit assumptions",
    ],
    datasetDescription:
      "An hourly panel (~8,700 hours): arrivals, ambulance share, average wait, 4-hour breaches, doctors and nurses on shift, bed occupancy and holiday flags. Real operational texture included: wait-sensor gaps (~3%), negative breach values, zero-doctor roster errors (~0.5%), duplicates, and the structural autocorrelation that any time-series work must respect. The panel's shape — hour-of-day double-hump, weekend lift, occupancy nonlinearity — is the analysis; the defects are what make earning it non-trivial.",
    dataDictionary: [
      { column: "hour_ts", kind: "datetime", description: "Hour timestamp (YYYY-MM-DD HH:MM)", example: "2025-06-14 19:00" },
      { column: "iso_week", kind: "categorical", description: "ISO week label", example: "W24" },
      { column: "day_of_week", kind: "categorical", description: "Day of week", example: "Sat" },
      { column: "hour_of_day", kind: "integer", description: "Hour 0–23", example: "19" },
      { column: "arrivals", kind: "integer", description: "Patient arrivals in the hour", example: "11" },
      { column: "ambulance_share", kind: "percent", description: "Share arriving by ambulance (0–1)", example: "0.22" },
      { column: "avg_wait_min", kind: "decimal", description: "Mean wait in minutes (sensor gaps)", example: "112.4" },
      { column: "breaches_4h", kind: "integer", description: "Patients waiting >4h (negatives are errors)", example: "3" },
      { column: "doctors_on_shift", kind: "integer", description: "Doctors on shift (0s are roster errors)", example: "4" },
      { column: "nurses_on_shift", kind: "integer", description: "Nurses on shift", example: "11" },
      { column: "beds_occupied", kind: "integer", description: "ED beds occupied (can exceed capacity)", example: "35" },
      { column: "ed_beds", kind: "integer", description: "ED bed capacity", example: "34" },
      { column: "is_holiday", kind: "boolean", description: "Public holiday flag", example: "0" },
    ],
    initialQuestions: [
      "What does the arrival profile look like — hour-of-day shape, weekday vs weekend, seasonality — and is demand trending up?",
      "How do waits and breaches relate to occupancy, arrivals and staffing (including the occupancy nonlinearity)?",
      "When and where do the worst pressure episodes concentrate (hours, occupancy bands, staffing levels)?",
      "What does a defensible 12-week arrival forecast (with intervals) say for roster planning?",
      "What staffing scenario best trades coverage against breaches, and what are its assumptions?",
    ],
    dataset: {
      name: "St. Aldhelm's ED hourly panel",
      filename: "healthcare-03-ed-hourly.csv",
      description: "1 year of hourly ED arrivals, waits, breaches, staffing and occupancy.",
      rows: 8700,
    },

    dataQuality: [
      { issue: "Wait-sensor gaps", where: "avg_wait_min missing ~3% of hours (clustered)", detection: "isna pattern by week", treatment: "Panel integrity preserved: leave missing, exclude from wait/breach relationship analysis; never interpolate waits (the missing hours would then fabricate the pressure signal)." },
      { issue: "Negative breaches", where: "breaches_4h < 0", detection: "(df['breaches_4h'] < 0).sum()", treatment: "Impossible: set NaN, count; a data-entry sign error worth reporting to the ED dashboard owner." },
      { issue: "Zero-doctor hours", where: "doctors_on_shift == 0 (~0.5%)", detection: "(df['doctors_on_shift'] == 0).sum()", treatment: "Roster error (an ED never runs doctor-less): repair from neighbouring same-hour-of-day values or exclude from staffing analysis; report — these are the hours the roster system itself flags." },
      { issue: "Duplicate hours", where: "~8 duplicated rows", detection: "duplicated('hour_ts').sum()", treatment: "Drop; the panel must be exactly one row per hour before any lag/rolling operation." },
      { issue: "Occupancy beyond capacity", where: "beds_occupied > ed_beds", detection: "compare columns", treatment: "REAL and important (corridor beds) — keep and flag; this is the pressure signal, not a defect." },
      { issue: "Autocorrelation structure", where: "Adjacent hours are dependent", detection: "lag-1 autocorrelation of arrivals", treatment: "Not a defect but a modelling constraint: forecasting and inference must respect it (no shuffled CV, lag features allowed)." },
    ],
    cleaningPlan: [
      { action: "Enforce one-row-per-hour panel integrity; parse timestamps; sort", rationale: "Every lag, rolling and seasonal operation depends on a complete hourly index." },
      { action: "Repair zero-doctor hours from hour-of-day neighbours; NaN the negative breaches", rationale: "Repairs documented; impossible values must not enter the pressure model." },
      { action: "Leave wait gaps missing, exclude from relationship analysis (stated)", rationale: "Fabricated waits would fabricate the central relationship." },
      { action: "Derive pressure features: occupancy_ratio, arrivals_per_doctor, rolling 4h arrivals", rationale: "Breach risk is a function of load vs capacity, not raw counts." },
      { action: "Build seasonal decomposition artefacts (hour-of-day and day-of-week profiles)", rationale: "The demand curve is the roster design's raw material." },
    ],
    edaPlan: [
      { question: "Arrival profile", method: "mean arrivals by hour-of-day (weekday vs weekend); by month", expectation: "Double-hump (10-11am, 6-8pm), weekend +15–18%, winter lift." },
      { question: "Trend", method: "weekly arrivals with trend line; YoY if available", expectation: "Gentle upward trend ~3–5% annualised — 'exploding demand' is mostly myth." },
      { question: "Occupancy nonlinearity", method: "breach rate by occupancy_ratio band", expectation: "Benign below ~85%, accelerating sharply above ~95% — the cliff." },
      { question: "Staffing association", method: "waits by arrivals-per-doctor bucket", expectation: "Rising waits as arrivals/doctor grows past ~3.5–4." },
      { question: "Pressure episodes", method: "worst breach days; their profiles (occupancy, arrivals, staffing, weekday)", expectation: "Winter Mondays+ eveninngs with corridor occupancy — a recognisable signature." },
      { question: "Holiday effect", method: "arrivals on holidays vs matched days", expectation: "GP-closure effect: holiday arrivals up, weekdays especially." },
    ],
    statisticsPlan: [
      { technique: "Seasonal profiling with uncertainty (hour × day matrix)", purpose: "The demand curve the roster is built on", expectation: "Stable shape; narrow intervals — the profile is reliable." },
      { technique: "Breach model (Poisson/logistic on occupancy, arrivals, staffing features)", purpose: "Quantify the pressure relationship", expectation: "Occupancy ratio dominates with a nonlinear term; arrivals-per-doctor secondary but real." },
      { technique: "Time-series forecast (seasonal naive / ETS / harmonic regression with intervals)", purpose: "12-week demand outlook", expectation: "Trend + weekly seasonality captures most signal; intervals honest about volatility." },
      { technique: "Scenario simulation (shift roster variants × forecast demand)", purpose: "Translate analysis into options", expectation: "Adding evening coverage Mon–Fri cuts forecast breach-hours materially; uniform adds waste coverage." },
      { technique: "Sensitivity analysis on scenario assumptions", purpose: "Robustness of the roster recommendation", expectation: "Breast-even assumptions stated; recommendation stable across plausible demand paths." },
    ],
    visualisationPlan: [
      { chart: "Heatmap — mean arrivals by hour × day", answers: "What does demand look like?", reads: "The weekly shape in one glance; the two humps and weekend lift." },
      { chart: "Line — breach rate vs occupancy ratio band (the cliff chart)", answers: "Where does pressure break?", reads: "The acceleration point annotated — the capacity target hiding in the data." },
      { chart: "Time series — weekly arrivals with trend and forecast fan", answers: "Is demand exploding, and what's next?", reads: "Trend line modest; forecast intervals honest." },
      { chart: "Scatter — arrivals per doctor vs avg wait (with occupancy colour)", answers: "How does staffing interact with load?", reads: "The load-per-clinician threshold visible." },
      { chart: "Paired bars — breach-hours under staffing scenarios", answers: "What should the roster do?", reads: "Baseline vs options; the recommended scenario named." },
    ],
    findings: [
      "Demand is not exploding — it is drifting up ~3–5% annualised — but its shape is unforgiving: the weekday evening hump (6–8pm) and winter Mondays are where arrivals and occupancy collide.",
      "The pressure relationship is nonlinear and dominated by occupancy: breach rates are benign below ~85% occupancy and accelerate sharply past ~95% — the department spends its worst hours on the cliff's far side.",
      "Staffing matters at the margin: waits rise visibly once arrivals per doctor exceed roughly 3.5–4 in an hour, a threshold the current roster breaches primarily during the evening hump.",
      "Worst-episode analysis shows a consistent signature — winter, Monday–Tuesday, corridor occupancy, evening — meaning the roster fix is targeted coverage, not uniform expansion.",
      "Scenario simulation: adding two evening-shift hours Mon–Fri (with matching nursing) reduces forecast breach-hours by the largest share per added shift-hour; a uniform one-shift-per-day add wastes coverage in low-demand morning troughs.",
    ],
    recommendations: [
      { what: "Reshape the roster toward the evening hump (additional 16:00–22:00 coverage Mon–Fri) ahead of winter", why: "The cliff is occupancy-driven and evenings are where load and occupancy collide; targeted coverage beats uniform adds.", impact: "Largest breach-hour reduction per added shift-hour", horizon: "this quarter" },
      { what: "Adopt an occupancy escalation protocol at the ~90% threshold (streaming, discharge lounge, admit-boarding rules)", why: "Breaches accelerate nonlinearly past 95%; intervening at 90% acts before the cliff.", impact: "Attacks the dominant driver without new staff", horizon: "immediate" },
      { what: "Use the 12-week forecast (with intervals) as the standing roster-planning input, refreshed monthly", why: "Demand is seasonal and modestly trending; planning to the average guarantees misalignment.", impact: "Roster-demand alignment as a process", horizon: "this quarter" },
      { what: "Fix the data defects the audit surfaced (breach sign errors, zero-doctor roster hours, wait-sensor gaps)", why: "The ED dashboard currently misstates pressure on its worst days; decisions downstream of a broken dashboard compound.", impact: "Measurement integrity", horizon: "immediate" },
    ],
    finalReport: {
      executiveSummary:
        "The ED's breach problem is a collision of shape and cliff, not exploding demand. Arrivals drift up ~3–5% a year but concentrate mercilessly: weekday evenings and winter Mondays. Pressure is nonlinear in occupancy — benign below ~85%, accelerating past ~95% — and the department's worst hours sit on the cliff's far side with arrivals per doctor above the ~3.5–4 threshold. The scenario work points to targeted evening coverage (the largest breach-hour reduction per added shift-hour) plus an occupancy escalation protocol at 90% that attacks the dominant driver without new staff. A monthly-refreshed 12-week forecast becomes the roster's standing input. The audit's defect list — breach sign errors, doctor-less roster hours, wait-sensor gaps — is appended for the dashboard owners.",
      structure: [
        "1. The clinical director's question and scope",
        "2. Panel construction, quality treatment and the defect list",
        "3. The demand profile: shape, seasonality, trend",
        "4. The pressure model: occupancy cliff and staffing threshold",
        "5. Worst-episode signature analysis",
        "6. The 12-week forecast with intervals",
        "7. Staffing scenarios with assumptions and sensitivity",
        "8. Appendix: cleaning log, model tables, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Respect the panel's structure",
        goal: "Hourly index integrity, the derived features that matter, and the analysis objects.",
        instructions: [
          "Verify one row per hour across the full year; build the DatetimeIndex; note gaps if any.",
          "Identify the two model families ahead: demand (arrivals — forecasting) and pressure (breaches — regression).",
          "Derive occupancy_ratio, arrivals_per_doctor and rolling-4h arrivals before anything else — they're the physics of the problem.",
        ],
        hints: [
          "A complete hourly index is the panel's contract: reindex to full range and see if rows are missing (vs merely having NaN cells).",
          "Occupancy ratio (beds_occupied / ed_beds) > 1 means corridor beds — that's the pressure signal, keep it.",
          "Rolling arrivals capture queue build-up: an hour's breaches depend on the previous 3 hours' load, not just this hour's.",
        ],
        checkpoint: "Panel integrity verified; derived features built; model families mapped.",
        code: {
          label: "Panel setup",
          language: "python",
          source: `df = pd.read_csv("healthcare-03-ed-hourly.csv", parse_dates=["hour_ts"])
df = df.drop_duplicates("hour_ts").set_index("hour_ts").sort_index()
full = pd.date_range(df.index.min(), df.index.max(), freq="h")
print("missing hours:", len(full) - len(df))

df["occupancy_ratio"] = df["beds_occupied"] / df["ed_beds"]
df["arrivals_per_doc"] = df["arrivals"] / df["doctors_on_shift"].replace(0, np.nan)
df["arrivals_4h"] = df["arrivals"].rolling(4).sum()`,
        },
      },
      {
        phase: "quality",
        title: "Audit with operational realism",
        goal: "Sensor gaps, impossible values, roster errors, duplicates — typed treatments.",
        instructions: [
          "Quantify each defect family; classify: repair (zero-doctor hours), NaN (negative breaches), exclude (wait gaps in relationship analysis).",
          "Distinguish real signals from defects: occupancy > capacity is REAL; breaches < 0 is not.",
          "Write the defect list for the dashboard owners — it's a deliverable, not a chore.",
        ],
        hints: [
          "Zero-doctor repair: take the median doctors for that hour-of-day within ±2 weeks — respects the roster's shape.",
          "The wait-gap exclusion is scoped: those hours still count for arrivals and demand; only pressure-relationship analysis drops them.",
          "Autocorrelation isn't a defect: lag-1 of arrivals will be modest but the 4h rolling makes it structural — plan validation accordingly.",
        ],
        checkpoint: "Typed defect treatments applied; the dashboard defect list written.",
      },
      {
        phase: "cleaning",
        title: "Build demand and pressure frames",
        goal: "Demand frame (all hours) and pressure frame (complete-metric hours), features ready.",
        instructions: [
          "Apply treatments; build the two frames with their different completeness rules.",
          "Verify derived features: occupancy ratio distribution, arrivals-per-doctor tails.",
          "Snapshot the seasonal profiles: hour × day arrival matrix.",
        ],
        hints: [
          "Two frames, one panel: demand uses everything; pressure uses rows with waits/breaches present — state each frame's N.",
          "The hour × day matrix (groupby hour_of_day, day_of_week arrivals mean) IS the demand curve exhibit.",
          "Feature verification: arrivals_per_doc above ~8 should be rare (sanity), and occupancy > 1.3 hours are your worst-episode candidates.",
        ],
        checkpoint: "Both frames built; seasonal profile snapshot saved.",
        code: {
          label: "Seasonal profile",
          language: "python",
          source: `profile = df.pivot_table(index="hour_of_day", columns="day_of_week",
                      values="arrivals", aggfunc="mean")
order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
profile = profile[order]
print(profile.round(1).iloc[[8, 10, 14, 18, 20]])  # key hours snapshot

weekly = df["arrivals"].resample("W").sum()
print("weekly trend slope:",
      np.polyfit(range(len(weekly)), weekly, 1)[0].round(2), "arrivals/week/week")`,
        },
      },
      {
        phase: "eda",
        title: "Shape, cliff and threshold",
        goal: "Demand curve, occupancy nonlinearity, staffing threshold, episode signature.",
        instructions: [
          "Hour × day heatmap; weekend/holiday effects; weekly trend.",
          "Breach rate by occupancy band (the cliff); waits by arrivals-per-doctor bucket (the threshold).",
          "Worst-episode analysis: top breach days and their common profile.",
        ],
        hints: [
          "Band the occupancy ratio in 5-point bins; breach RATE (not count) per band shows the nonlinearity cleanly.",
          "The staffing threshold: bucket arrivals_per_doc and take mean wait — the bend in the curve is the roster design number.",
          "Episode signature: worst 20 days by breach-hours → their hour-of-day, occupancy and staffing profile — the pattern the scenario must attack.",
        ],
        checkpoint: "Cliff located, staffing threshold found, episode signature documented.",
        code: {
          label: "The cliff",
          language: "python",
          source: `p = df.dropna(subset=["breaches_4h", "avg_wait_min"]).copy()
p["occ_band"] = pd.cut(p["occupancy_ratio"], [0, .8, .9, .95, 1.0, 1.1, 3])
cliff = p.groupby("occ_band", observed=True).agg(
    breach_rate=("breaches_4h", lambda s: (s > 0).mean()),
    mean_wait=("avg_wait_min", "mean"))
print(cliff.round(3))

p["apd"] = pd.cut(p["arrivals_per_doc"], [0, 2, 3, 4, 5, 20])
print(p.groupby("apd", observed=True)["avg_wait_min"].mean().round(1))`,
        },
      },
      {
        phase: "statistics",
        title: "Model pressure and forecast demand",
        goal: "Breach regression, seasonal forecast with intervals, scenario simulation.",
        instructions: [
          "Model breaches (or breach indicator) on occupancy (with nonlinear term), 4h arrivals, staffing features; cluster or use HAC errors for autocorrelation.",
          "Forecast 12 weeks of arrivals: harmonic regression or ETS with weekly seasonality; produce prediction intervals.",
          "Simulate scenarios: apply roster variants to the forecast horizon; estimate breach-hours per scenario from the pressure model.",
        ],
        hints: [
          "Nonlinear occupancy: include occupancy_ratio and its square (or a spline/binned terms) — the cliff demands it.",
          "Forecast honesty: fit on the first ~10 months, hold out the last ~2, report interval coverage — then refit for the real horizon.",
          "Scenario translation: for each forecast hour, predicted breaches = f(occupancy under scenario, arrivals, staffing) — occupancy under scenario needs an assumption (state it!).",
        ],
        checkpoint: "Pressure model validated, forecast with intervals, scenario table computed.",
        code: {
          label: "Forecast with intervals",
          language: "python",
          source: `import statsmodels.api as sm

w = df["arrivals"].resample("W").sum()
trend = np.arange(len(w))
D = np.column_stack([np.sin(2*np.pi*np.arange(len(w))/52.18),
                     np.cos(2*np.pi*np.arange(len(w))/52.18)])
X = sm.add_constant(np.column_stack([trend, D]))
m = sm.OLS(w.values, X).fit()
fc = m.get_prediction(X[-12:])
print("12-week fan:", fc.conf_int(alpha=0.05)[-4:].round(0))`,
        },
      },
      {
        phase: "visualisation",
        title: "The capacity exhibits",
        goal: "Five charts: demand heatmap, cliff, forecast fan, staffing threshold, scenario bars.",
        instructions: [
          "Build the five; the cliff chart and forecast fan carry the argument.",
          "Annotate the cliff's acceleration point and the staffing threshold's bend.",
          "Scenario bars labelled with added shift-hours (the cost axis).",
        ],
        hints: [
          "Cliff chart: breach rate by occupancy band with the 90–95% region shaded — one glance tells the escalation story.",
          "Forecast fan: history line, forecast line, shaded interval — resist over-explaining.",
          "Scenario bars ordered by breach-hour reduction, with a second axis or label for cost (added shift-hours).",
        ],
        checkpoint: "Five exhibits, cliff and fan polished.",
      },
      {
        phase: "interpretation",
        title: "Settle the two stories",
        goal: "Answer the exploding-demand vs under-staffing debate with numbers.",
        instructions: [
          "Answer the five initial questions; quantify the demand drift vs the pressure cliff — which story the data supports.",
          "State the scenario assumptions (especially occupancy under roster changes) and their sensitivity.",
          "Name the model's operational limits (no admission-decision modelling, no community-demand spillover).",
        ],
        hints: [
          "The debate's answer is usually 'both, but weighted': ~4% demand drift vs a cliff at 95% occupancy — the cliff wins the explanation contest.",
          "Occupancy under scenarios is the shakiest assumption (staffing affects throughput only partially); present scenario results as ranges under two occupancy assumptions.",
          "Limits are scope: ED demand depends on primary care availability — your forecast conditions on it, say so.",
        ],
        checkpoint: "The debate answered with weights, assumptions ranged, limits stated.",
      },
      {
        phase: "recommendations",
        title: "The capacity package",
        goal: "Roster reshaping, escalation protocol, forecast process and defect fixes.",
        instructions: [
          "Recommend the evening-hump coverage, the 90% escalation protocol, the monthly forecast cadence and the defect backlog.",
          "Attach owners (roster lead, ED matron, informatics) and the winter timeline.",
          "Define success metrics: breach-hours, evening waits, forecast coverage.",
        ],
        hints: [
          "Winter deadline: the recommendation's value compounds if the roster lands before the seasonal peak — date it.",
          "The escalation protocol needs clinical sign-off — frame it as a proposal to the ED governance group, with the cliff chart as its evidence.",
          "Success metrics pre-agreed (breach-hours down X% at Y added shift-hours) make the next analysis an evaluation instead of an argument.",
        ],
        checkpoint: "The package with owners, timeline and success metrics.",
      },
      {
        phase: "report",
        title: "The capacity review",
        goal: "A clinical-director-grade review that ends the folklore debate.",
        instructions: [
          "Follow the outline; open with the two-stories verdict (shape and cliff, not explosion).",
          "Methodology and defect list boxed in the body; models in the appendix.",
          "Close with the winter timeline and the standing forecast process.",
        ],
        hints: [
          "The one-liner: 'Demand drifts; the cliff is where it hurts — target the evening hump and escalate at 90%.'",
          "Clinical audiences trust analysts who show exclusions and assumptions first — lead with them.",
          "Reproducibility: one script, panel → exhibits; date-stamped for the governance pack.",
        ],
        checkpoint: "The complete capacity review, reproducible from the hourly panel.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the ED's analyst. Settle the demand-vs-staffing debate with a year of hourly data: the demand curve, the pressure model, a defensible forecast, and staffing scenarios with assumptions exposed. Cleaning policy, model structure and scenario assumptions are yours — documented and defended in the appendix.",
      deliverables: [
        "Hourly panel audit with typed defect treatments and the dashboard defect list",
        "Demand profile (hour × day seasonality, trend) and pressure model (occupancy cliff, staffing threshold)",
        "Worst-episode signature analysis",
        "12-week demand forecast with prediction intervals (validated on a holdout)",
        "Staffing scenario package with assumptions, sensitivity, owners and winter timeline",
      ],
      guardrails: [
        "Panel integrity verified before any lag/rolling operation",
        "Wait gaps never interpolated for relationship analysis",
        "Autocorrelation respected in validation and inference",
        "Scenario occupancy assumptions stated and sensitivity-tested",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Panel one-row-per-hour verified; derived features correct",
        "Nonlinear occupancy term in the pressure model (or equivalent binning)",
        "Forecast validated on a time-based holdout with intervals",
      ],
      "code-quality": [
        "Demand and pressure frames separated with stated completeness rules",
        "Seasonal artefacts computed once, reused",
      ],
      reasoning: [
        "Occupancy nonlinearity modelled, not assumed linear",
        "Autocorrelation respected in validation design",
      ],
      visualization: [
        "The cliff chart annotated with the escalation threshold",
        "Forecast shown as a fan with intervals, not a bare line",
      ],
      interpretation: [
        "Demand-drift vs pressure-cliff debate answered with weights",
        "Scenario assumptions stated and sensitivity-tested",
      ],
      recommendations: [
        "Roster reshaping tied to the demand profile evidence",
        "Winter timeline, owners and success metrics attached",
      ],
    },
  },
];

