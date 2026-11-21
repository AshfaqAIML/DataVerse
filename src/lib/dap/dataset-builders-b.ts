/**
 * Dataset builders — part B (healthcare, education, HR, sports, public
 * datasets, business intelligence). Same contract as part A.
 */
import type { Rng } from "./rng";
import { messyCurrency } from "./rng";
import type { DatasetBuilder, DatasetRow } from "./dataset-builders-a";

/* ============================================================= 7 HEALTHCARE */

/** HLT-01 — clinic appointments with no-show outcomes. */
export const hlt1: DatasetBuilder = (r, rows) => {
  const clinics = ["Riverside Family Practice", "Northgate Clinic", "Harborview Specialty", "Eastside Community Clinic"];
  const specialties = ["General Practice", "Cardiology", "Dermatology", "Orthopaedics", "Paediatrics"];
  const insurances = ["Private", "Public", "Self-pay", "Employer Scheme"];
  const start = new Date("2025-02-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const lead = r.pickWeighted([0, 1, 3, 7, 14, 30, 60], [8, 12, 20, 22, 18, 12, 8]);
    const appt = new Date(start.getTime() + r.int(0, 150) * 86400000);
    const risk = 0.04 + lead * 0.0022;
    const noShow = r.chance(risk);
    out.push({
      appointment_id: 200000 + i,
      patient_id: 60000 + r.int(0, 4200),
      clinic: r.pick(clinics),
      specialty: r.chance(0.05) ? r.pick(specialties).toLowerCase() : r.pick(specialties), // planted casing
      appointment_date: appt.toISOString().slice(0, 10),
      booking_lead_days: r.chance(0.004) ? -lead : lead, // planted negative
      appointment_day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][appt.getUTCDay()],
      appointment_hour: r.pickWeighted([8, 9, 10, 11, 13, 14, 15, 16, 17], [6, 9, 10, 9, 11, 10, 9, 8, 6]),
      insurance_type: r.pick(insurances),
      prior_no_shows: r.int(0, 6),
      sms_reminder: r.chance(0.03) ? "" : r.pick([0, 1]), // planted missing
      no_show: noShow
        ? r.chance(0.5) ? "Yes" : "1"
        : r.chance(0.5) ? "No" : "0", // planted mixed encodings
    });
  }
  for (let i = 0; i < Math.round(rows * 0.009); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** HLT-02 — inpatient stays with readmission flags. */
export const hlt2: DatasetBuilder = (r, rows) => {
  const diagnoses = ["I10 Hypertension", "E11 Diabetes Type 2", "J18 Pneumonia", "K80 Gallstones", "N39 UTI", "I50 Heart Failure"];
  const departments = ["Internal Medicine", "General Surgery", "Cardiology", "Orthopaedics"];
  const admissions = ["Elective", "Emergency", "Transfer"];
  const dispositions = ["Home", "Home with Care", "Skilled Nursing", "Rehab Facility", ""];
  const ages = ["18-34", "35-49", "50-64", "65-79", "80+"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const adm = new Date("2025-01-01T00:00:00Z").getTime() + r.int(0, 270) * 86400000;
    const los = Math.max(1, Math.round(r.posNorm(4.2, 3.4)));
    let disc = adm + los * 86400000;
    if (r.chance(0.004)) disc = adm - 2 * 86400000; // planted impossible discharge
    const readmit = r.chance(0.11);
    out.push({
      encounter_id: 90000 + i,
      patient_id: 40000 + r.int(0, 5200),
      age_band: r.pickWeighted(ages, [14, 20, 26, 24, 16]),
      admission_date: new Date(adm).toISOString().slice(0, 10),
      discharge_date: new Date(disc).toISOString().slice(0, 10),
      primary_diagnosis: r.chance(0.06) ? r.pick(diagnoses).toLowerCase() : r.pick(diagnoses), // planted casing
      department: r.pick(departments),
      admission_type: r.pickWeighted(admissions, [38, 52, 10]),
      los_days: r.chance(0.004) ? -los : los,
      readmitted_30d: readmit ? (r.chance(0.4) ? "TRUE" : "Yes") : r.chance(0.4) ? "FALSE" : "No", // planted mixed labels
      discharged_to: r.chance(0.05) ? "" : r.pick(dispositions.slice(0, 4)), // planted missing
      comorbidity_count: r.chance(0.01) ? -1 : r.int(0, 7), // planted sentinel
    });
  }
  for (let i = 0; i < Math.round(rows * 0.006); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** HLT-03 — hourly ED arrival and staffing panel. */
export const hlt3: DatasetBuilder = (r, rows) => {
  const out: DatasetRow[] = [];
  const start = new Date("2025-01-01T00:00:00Z");
  const hours = Math.ceil(rows);
  for (let i = 0; i < hours; i++) {
    const ts = new Date(start.getTime() + i * 3600000);
    const hour = ts.getUTCHours();
    const dow = ts.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    // classic double-hump arrival curve
    const shape = [1.2, 0.9, 0.7, 0.6, 0.6, 0.8, 1.2, 1.7, 2.3, 2.8, 3.1, 3.3, 3.2, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.3, 2.1, 1.9, 1.6, 1.4][hour];
    const arrivals = Math.max(0, Math.round(shape * r.posNorm(3.4, 1.1) * (weekend ? 1.18 : 1)));
    const doctors = Math.round(shape * 0.62 + 1.2);
    const nurses = doctors * 2 + r.int(0, 2);
    const beds = 34;
    const occupied = Math.min(beds + 3, Math.round(18 + shape * 3.4 + r.posNorm(0, 2.5)));
    const wait = Math.max(0, r.posNorm(48 + (occupied / beds) ** 3 * 90, 26));
    out.push({
      hour_ts: `${ts.toISOString().slice(0, 10)} ${String(hour).padStart(2, "0")}:00`,
      iso_week: `W${String(Math.floor(i / 7) + 1).padStart(2, "0")}`,
      day_of_week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow],
      hour_of_day: hour,
      arrivals,
      ambulance_share: r.round(r.float(0.12, 0.3), 3),
      avg_wait_min: r.chance(0.03) ? "" : r.round(wait, 1), // planted sensor gap
      breaches_4h: r.chance(0.004) ? -Math.round(wait / 22) : Math.round(Math.max(0, (wait - 210) / 9 + arrivals * 0.04)), // planted negative
      doctors_on_shift: r.chance(0.005) ? 0 : doctors, // planted roster error
      nurses_on_shift: nurses,
      beds_occupied: occupied,
      ed_beds: beds,
      is_holiday: [0, 1, 150, 151, 185].includes(Math.floor(i / 24)) ? 1 : 0,
    });
  }
  for (let i = 0; i < 8; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ============================================================== 8 EDUCATION */

/** EDU-01 — LMS course engagement. */
export const edu1: DatasetBuilder = (r, rows) => {
  const cohorts = ["2025-01", "2025-04", "2025-07"];
  const countries = ["India", "Nigeria", "Brazil", "United States", "Germany", "Indonesia", "Egypt", "Philippines"];
  const levels = ["High School", "Bachelor", "Master", "Career Changer"];
  const modules = 12;
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const engagement = r.posNorm(0.62, 0.24); // latent engagement
    const started = Math.min(modules, Math.max(1, Math.round(modules * engagement * r.float(0.7, 1.05))));
    const completed = Math.min(started, Math.max(0, started - r.int(0, 5)));
    const quiz = Math.min(100, Math.round(52 + engagement * 44 + r.norm(0, 7)));
    out.push({
      learner_id: 8000 + i,
      cohort: r.pick(cohorts),
      enrollment_date: r.date(new Date("2025-01-06T00:00:00Z"), 200),
      country: r.chance(0.04) ? "" : r.pick(countries), // planted missing
      education_level: r.pickWeighted(levels, [12, 38, 27, 23]),
      modules_started: started,
      modules_completed: completed,
      quiz_avg: r.chance(0.006) ? quiz + 40 : quiz, // planted impossible scores
      videos_watched_pct: Math.min(100, Math.round(engagement * 118)),
      forum_posts: r.int(0, 24),
      completed_course: completed >= modules ? (r.chance(0.3) ? "TRUE" : "Yes") : r.chance(0.3) ? "FALSE" : "No",
      weeks_active: r.chance(0.004) ? 26 : r.int(1, 16),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.01); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** EDU-02 — student-term risk signals. */
export const edu2: DatasetBuilder = (r, rows) => {
  const programs = ["BSc Computer Science", "BSc Data Science", "BA Economics", "BSc Nursing", "BEng Mechanical"];
  const outcomes = ["Pass", "Fail", "Withdraw"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const latent = r.posNorm(0.6, 0.22);
    const gpa = Math.min(4, Math.max(0, r.round(latent * 4 + r.norm(0, 0.35), 2)));
    const att = Math.min(100, Math.round(55 + latent * 48 + r.norm(0, 8)));
    const outcome = r.pickWeighted(outcomes, [74 - (1 - latent) * 30, 14 + (1 - latent) * 18, 12 + (1 - latent) * 20]);
    out.push({
      student_id: 30000 + r.int(0, 2100),
      term: r.pick(["2025 Spring", "2025 Fall"]),
      program: r.chance(0.05) ? r.pick(programs).toUpperCase() : r.pick(programs), // planted casing
      year_of_study: r.int(1, 4),
      gpa: r.chance(0.005) ? r.round(gpa + 1.4, 2) : gpa, // planted >4.0
      attendance_pct: r.chance(0.04) ? "" : att, // planted missing
      lms_logins_week: Math.max(0, r.chance(0.003) ? -r.int(1, 5) : Math.round(latent * 14 + r.norm(0, 2.5))), // planted negative
      assignments_on_time: r.int(0, 8),
      mid_term_score: Math.min(100, Math.round(35 + latent * 58 + r.norm(0, 7))),
      final_outcome: r.chance(0.06) ? outcome.toLowerCase() : outcome, // planted casing
      first_generation: r.pick([0, 1]),
      pell_eligible: r.pick([0, 1]),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.008); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** EDU-03 — multi-cohort equity and outcomes. */
export const edu3: DatasetBuilder = (r, rows) => {
  const programs = ["BS Computer Science", "BS Business", "BA Psychology", "BS Biology", "BA English"];
  const genders = ["Female", "Male", "Non-binary", "Prefer not to say"];
  const ethnicities = ["Asian", "Black or African American", "Hispanic or Latino", "White", "Two or More", "Race/ethnicity unknown"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const year = r.pick([2018, 2019, 2020, 2021, 2022]);
    const prepared = r.posNorm(0.62, 0.2);
    const sat = r.chance(0.05) ? 0 : Math.round(880 + prepared * 520 + r.norm(0, 55)); // planted zero sentinel
    const gpa1 = Math.min(4, Math.max(0, r.round(prepared * 3.9 + r.norm(0, 0.3), 2)));
    const attempted = r.int(24, 40);
    const earned = r.chance(0.004) ? attempted + r.int(4, 12) : Math.round(attempted * r.float(0.62, 1.0)); // planted impossible
    const grad = r.chance(0.3 + prepared * 0.5);
    const eth = r.pick(ethnicities);
    out.push({
      student_id: 100000 + i,
      cohort_year: year,
      program: r.pick(programs),
      gender: r.chance(0.03) ? r.pick(genders).toLowerCase() : r.pick(genders),
      ethnicity: r.chance(0.07) ? eth.toUpperCase() : eth, // planted coding variants
      pell_status: r.pick(["Pell", "Non-Pell"]),
      first_generation: r.pick([0, 1]),
      entry_sat: sat,
      gpa_year1: gpa1,
      gpa_final: r.chance(0.06) ? "" : Math.min(4, r.round(gpa1 * r.float(0.85, 1.12), 2)), // planted missing
      credits_attempted: attempted,
      credits_earned: earned,
      retention_year2: r.chance(0.84) ? 1 : 0,
      graduated: r.chance(0.02) ? "" : grad ? 1 : 0, // planted missing
      time_to_degree_terms: grad ? r.int(9, 16) : "",
    });
  }
  for (let i = 0; i < Math.round(rows * 0.005); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ==================================================================== 9 HR */

/** HR-01 — attrition snapshot. */
export const hr1: DatasetBuilder = (r, rows) => {
  const departments = ["Sales", "Engineering", "Marketing", "Support", "Finance", "People", "Operations"];
  const levels = ["L1", "L2", "L3", "L4", "L5"];
  const genders = ["Female", "Male", "Non-binary"];
  const ages = ["18-25", "26-35", "36-45", "46-55", "56-65"];
  const stocks = [0, 0, 1, 1, 2, 3];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const dept = r.pickWeighted(departments, [22, 26, 12, 18, 7, 5, 10]);
    const level = r.pickWeighted(levels, [28, 32, 22, 13, 5]);
    const income = Math.round(3200 + parseInt(level.slice(1), 10) * 1500 + (dept === "Engineering" ? 1400 : 0) + r.posNorm(900, 400));
    const attrite =
      r.chance(dept === "Support" ? 0.28 : dept === "Sales" ? 0.24 : 0.12) &&
      r.chance(level === "L1" ? 1.25 : 0.8);
    const tenure = r.round(r.posNorm(4.6, 3.4), 1);
    out.push({
      employee_id: 100 + i,
      department: r.chance(0.03) ? dept.toUpperCase() : dept, // planted casing
      job_level: level,
      tenure_years: r.chance(0.004) ? tenure + 42 : tenure, // planted impossible
      age_band: r.pickWeighted(ages, [16, 34, 26, 15, 9]),
      gender: r.chance(0.02) ? r.pick(genders).slice(0, 1) : r.pick(genders), // planted "F"/"M" codes
      commute_km: r.chance(0.05) ? "" : r.round(r.posNorm(14, 8), 1), // planted missing
      monthly_income: r.chance(0.08) ? messyCurrency(income) : income, // planted format
      overtime_last_quarter: r.chance(0.34) ? 1 : 0,
      stock_level: r.pick(stocks),
      attrition: attrite ? (r.chance(0.5) ? "Yes" : "1") : r.chance(0.5) ? "No" : "0", // planted mixed encodings
      performance_rating: r.chance(0.008) ? 0 : r.int(1, 5), // planted sentinel
    });
  }
  for (let i = 0; i < Math.round(rows * 0.009); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** HR-02 — hiring funnel with stage dates. */
export const hr2: DatasetBuilder = (r, rows) => {
  const families = ["Software Engineering", "Data & Analytics", "Product", "Design", "Sales", "Marketing"];
  const levels = ["Junior", "Mid", "Senior", "Lead"];
  const sources = ["Referral", "LinkedIn", "Job Board", "Careers Page", "Agency", ""];
  const reasons = ["Accepted other offer", "Salary expectations", "Withdrew", "Failed stage", "No response", ""];
  const recruiters = ["Priya N.", "Tom W.", "Sofia R.", "Daniel K."];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const applied = new Date("2025-01-02T00:00:00Z").getTime() + r.int(0, 260) * 86400000;
    const d = (n: number) => new Date(applied + n * 86400000).toISOString().slice(0, 10);
    const roll = r.next();
    // funnel: applied → screen → onsite → offer → hire
    const reachedScreen = roll > 0.42;
    const reachedOnsite = reachedScreen && roll > 0.62;
    const reachedOffer = reachedOnsite && roll > 0.82;
    const hired = reachedOffer && roll > 0.9;
    let onsiteDate = reachedOnsite ? d(r.int(7, 26)) : "";
    if (r.chance(0.004)) onsiteDate = d(-5); // planted date before application
    out.push({
      application_id: 300000 + i,
      req_id: `REQ-${200 + r.int(0, 34)}`,
      job_family: r.pick(families),
      level: r.chance(0.04) ? r.pick(levels).toLowerCase() : r.pick(levels),
      source: r.chance(0.06) ? "" : r.pick(sources.slice(0, 5)),
      applied_date: new Date(applied).toISOString().slice(0, 10),
      phone_screen_date: reachedScreen ? d(r.int(2, 9)) : "",
      onsite_date: onsiteDate,
      offer_date: reachedOffer ? d(r.int(20, 40)) : "",
      hire_date: hired ? d(r.int(28, 55)) : "",
      stage_reached: hired ? "Hired" : reachedOffer ? "Offer" : reachedOnsite ? "Onsite" : reachedScreen ? "Screen" : "Applied",
      withdrawn: !hired && r.chance(0.16) ? (r.chance(0.3) ? "TRUE" : "Yes") : r.chance(0.3) ? "FALSE" : "No",
      rejected_reason: r.pick(reasons),
      recruiter: r.pick(recruiters),
      rehire: r.chance(0.05) ? 1 : 0,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.007); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** HR-03 — compensation equity table. */
export const hr3: DatasetBuilder = (r, rows) => {
  const families = ["Engineering", "Data", "Product", "Design", "Sales", "Support", "G&A"];
  const levels = ["IC1", "IC2", "IC3", "IC4", "M1", "M2"];
  const genders = ["Female", "Male", "Non-binary"];
  const ethnicities = ["Asian", "Black", "Hispanic", "White", "Two or more", "Declined"];
  const locations = ["London", "Berlin", "Austin", "Remote-EU", "Remote-US", "Singapore"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const family = r.pickWeighted(families, [30, 14, 12, 8, 16, 12, 8]);
    const level = r.pickWeighted(levels, [18, 30, 26, 14, 9, 3]);
    const levelNum = parseInt(level.replace(/\D/g, ""), 10) + (level.startsWith("M") ? 2 : 0);
    const loc = r.pickWeighted(locations, [22, 18, 20, 16, 16, 8]);
    const locMult = loc === "Singapore" ? 1.05 : loc === "Austin" || loc === "Remote-US" ? 1.25 : 1.0;
    const base = Math.round((62000 + levelNum * 26000) * locMult * r.posNorm(1, 0.07));
    const bandMin = Math.round((62000 + levelNum * 26000) * locMult * 0.88);
    const bandMax = Math.round((62000 + levelNum * 26000) * locMult * 1.16);
    const gender = r.chance(0.025) ? r.pick(genders)[0] : r.pick(genders); // planted single-letter codes
    const bonus = Math.round(r.float(4, 22) * (family === "Sales" ? 1.8 : 1));
    out.push({
      employee_id: 7000 + i,
      department: family,
      job_level: level,
      job_family: family === "G&A" ? r.pick(["Finance", "People", "Legal"]) : family,
      tenure_years: r.round(r.posNorm(3.8, 2.8), 1),
      performance_rating: r.int(1, 5),
      base_salary: r.chance(0.09) ? base.toLocaleString("en-US") : base, // planted formatted numbers
      bonus_pct: r.chance(0.004) ? bonus + 100 : bonus, // planted impossible
      gender,
      ethnicity: r.chance(0.04) ? r.pick(ethnicities).toUpperCase() : r.pick(ethnicities),
      location: loc,
      hire_date: r.date(new Date("2016-01-01T00:00:00Z"), 3500),
      pay_band_min: r.chance(0.05) ? "" : bandMin, // planted missing bands
      pay_band_max: r.chance(0.05) ? "" : bandMax,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.005); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ================================================================= 10 SPORTS */

/** SPT-01 — one season of league fixtures. */
export const spt1: DatasetBuilder = (r, rows) => {
  const leagues = {
    "Premier Division": ["Ashford United", "Borough FC", "Cranford Town", "Dover Rovers", "Eastgate City", "Fairvale Athletic", "Greystone FC", "Hartwell Wanderers", "Ivybridge Town", "Junction Rangers", "Kingsmere Park", "Longford Olympic"],
    "Championship North": ["Milnthorpe FC", "Northgate Albion", "Oakhill Town", "Pembury City", "Quayside Rovers", "Ravenshall FC", "Stonebridge Athletic", "Thornbury Town", "Ulverwick Wanderers", "Valeford City", "Westbrook FC", "Yeadon Old Boys"],
    "Championship South": ["Abbottsfield FC", "Beckingham Town", "Colne Rovers", "Dunmoor City", "Elmsworth FC", "Farleigh Town", "Gorse Hill Athletic", "Hallows Wanderers", "Ingleby FC", "Jarrow Celtic", "Kenwith Park FC", "Loweswater Town"],
  };
  const refs = ["M. Ellison", "P. Whitfield", "S. Osei", "L. Bergström", "T. Marchetti", "R. Canales"];
  const out: DatasetRow[] = [];
  let id = 1;
  for (const [league, teams] of Object.entries(leagues)) {
    for (let round = 0; round < 22; round++) { // full double round-robin
      const shuffled = r.sample(teams, teams.length);
      for (let t = 0; t < teams.length; t += 2) {
        const home = shuffled[t];
        const away = shuffled[t + 1];
        const hg = r.int(0, 4) + (r.chance(0.44) ? 1 : 0); // home edge
        const ag = r.int(0, 3);
        const cap = 18000 + r.int(0, 20) * 1200;
        const att = r.chance(0.003) ? cap + r.int(2, 9) * 1000 : Math.round(cap * r.float(0.55, 0.99));
        out.push({
          match_id: id++,
          league,
          match_date: r.date(new Date("2025-08-08T00:00:00Z"), 260),
          home_team: r.chance(0.06) ? home.replace(" FC", "") : home, // planted name variants
          away_team: away,
          home_goals: r.chance(0.015) ? "" : hg, // planted missing
          away_goals: ag,
          attendance: att,
          stadium_capacity: cap,
          referee: r.chance(0.05) ? r.pick(refs).toLowerCase() : r.pick(refs),
        });
      }
    }
  }
  for (let i = 0; i < 14; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** SPT-02 — basketball player-match boxscores. */
export const spt2: DatasetBuilder = (r, rows) => {
  const teams = ["Aurora Falcons", "Bluefield Barons", "Cobalt Kings", "Dunedin Dolphins", "Ember Eagles", "Fusion Foxes", "Granite Giants", "Harbour Hawks"];
  const positions = ["PG", "SG", "SF", "PF", "C"];
  const first = ["Jordan", "Casey", "Riley", "Alex", "Sam", "Mika", "Noel", "Rio", "Kai", "Theo", "Luca", "Amir"];
  const last = ["Okafor", "Varga", "Silva", "Novak", "Duarte", "Baptiste", "Kimura", "Rossi", "Haddad", "Lindgren", "Mensah", "Farrell"];
  const players = Array.from({ length: 120 }, (_, i) => ({
    id: 100 + i,
    name: `${r.pick(first)} ${r.pick(last)}`,
    team: teams[i % teams.length],
    pos: r.pick(positions),
    usage: r.posNorm(0.5, 0.18), // latent usage/quality
  }));
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const p = r.pick(players);
    const starter = p.usage > 0.52;
    const minutes = Math.min(
      48,
      Math.max(6, Math.round(12 + p.usage * 26 + r.norm(0, 4))),
    );
    const shots = Math.max(0, Math.round(minutes * p.usage * 0.42 * r.float(0.6, 1.4)));
    const made = Math.round(shots * r.float(0.32, 0.62));
    const minsCell = r.chance(0.004) ? minutes + 12 : minutes; // planted impossible minutes
    out.push({
      match_id: 4000 + r.int(0, 320),
      player_id: p.id,
      player: p.name,
      position: r.chance(0.03) ? p.pos.toLowerCase() : p.pos,
      team: p.team,
      opponent: r.pick(teams.filter((t) => t !== p.team)),
      minutes: minsCell,
      points: r.chance(0.012) ? "" : made * 2 + r.int(0, 4), // planted missing
      shots,
      shots_on_target: Math.min(shots, made + r.int(0, 2)),
      assists: Math.max(0, Math.round(minutes * p.usage * r.float(0.04, 0.18))),
      turnovers: r.int(0, 6),
      fouls: r.int(0, 5),
      is_starter: starter ? 1 : 0,
      rest_days: r.chance(0.003) ? -r.int(1, 3) : r.int(0, 4), // planted negative
    });
  }
  for (let i = 0; i < Math.round(rows * 0.008); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** SPT-03 — football player-season metrics with valuations. */
export const spt3: DatasetBuilder = (r, rows) => {
  const clubs = ["Ashford United", "Borough FC", "Cranford Town", "Dover Rovers", "Eastgate City", "Fairvale Athletic", "Greystone FC", "Hartwell Wanderers", "Ivybridge Town", "Junction Rangers", "Kingsmere Park", "Longford Olympic", "Milnthorpe FC", "Northgate Albion", "Oakhill Town", "Pembury City"];
  const positions = ["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"];
  const first = ["Luca", "Mateo", "Jonas", "Emre", "Tomas", "Nico", "Rafa", "Bruno", "Ivan", "Andre", "Yuki", "Kwame", "Diego", "Milan", "Oscar", "Felix"];
  const last = ["Bianchi", "Ferreira", "Lindqvist", "Yilmaz", "Novotny", "Petrov", "Duarte", "Marchetti", "Kovac", "Silva", "Tanaka", "Mensah", "Rojas", "Horvat", "Baptiste", "Varga"];
  const players = Array.from({ length: 520 }, (_, i) => ({
    id: 2000 + i,
    name: `${r.pick(first)} ${r.pick(last)}`,
    pos: r.pickWeighted(positions, [10, 12, 8, 8, 10, 14, 10, 9, 9, 10]),
    quality: r.posNorm(0.55, 0.2),
  }));
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const p = r.pick(players);
    const season = r.pick([2023, 2024, 2025]);
    const age = r.int(18, 35);
    const ageCurve = age <= 21 ? 0.6 + (age - 18) * 0.15 : age <= 27 ? 1 : Math.max(0.3, 1 - (age - 27) * 0.09);
    const apps = r.chance(0.04) ? "" : Math.round(38 * p.quality * ageCurve * r.float(0.5, 1.05)); // planted missing
    const minutes = apps === "" ? "" : Math.round((apps as number) * r.float(48, 84));
    const goals = apps === "" ? 0 : Math.round((apps as number) * p.quality * (p.pos === "ST" ? 0.48 : p.pos === "AM" || p.pos === "LW" || p.pos === "RW" ? 0.22 : p.pos === "GK" ? 0 : 0.06) * r.float(0.3, 1.7));
    const xg = Math.round((goals + r.norm(0, 2)) * 10) / 10;
    const value = Math.max(0.3, 45 * p.quality * ageCurve * r.posNorm(1, 0.25));
    const fee = r.chance(0.3) ? 0 : r.round(value * r.float(0.4, 1.8), 1); // 0 = no transfer (legitimate)
    out.push({
      player_id: p.id,
      player: p.name,
      season,
      age,
      club: r.pick(clubs),
      league: "Premier Division",
      position: r.chance(0.03) ? p.pos.toLowerCase() : p.pos,
      apps: apps,
      minutes: minutes,
      goals,
      assists: r.int(0, 14),
      xg: Math.max(0, xg),
      xa: r.round(r.posNorm(3, 2.5), 1),
      market_value_m: r.chance(0.08) ? `€${value.toFixed(1)}M` : r.round(value, 1), // planted formatted values
      transfer_fee_m: fee,
      contract_years_left: r.chance(0.004) ? -r.int(1, 2) : r.int(0, 5), // planted negative
      injury_days: r.chance(0.35) ? r.int(7, 180) : 0,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.005); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ================================================================= 11 PUBLIC */

/** PUB-01 — city open spending ledger. */
export const pub1: DatasetBuilder = (r, rows) => {
  const departments = ["Parks & Recreation", "Public Works", "Fire", "Police", "Libraries", "Transport", "Health", "Housing"];
  const categories = ["Personnel", "Contractual Services", "Supplies", "Capital Outlay", "Utilities", "Grants"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const year = r.pick([2022, 2023, 2024]);
    const fyLabel = r.chance(0.08) ? `FY${year}` : year; // planted fiscal-year variants
    const dept = r.pick(departments);
    const spend = r.round(r.posNorm(185000, 140000), 2);
    out.push({
      line_id: 50000 + i,
      fiscal_year: fyLabel,
      department: r.chance(0.05) ? dept.toUpperCase() : dept, // planted casing
      division: `${dept.split(" ")[0]} Division ${r.int(1, 6)}`,
      program: r.pick(["Operations", "Maintenance", "Capital Programme", "Community Grants", "Administration"]),
      spend_category: r.chance(0.04) ? r.pick(categories).toLowerCase() : r.pick(categories),
      amount: r.chance(0.1) ? spend.toLocaleString("en-US", { minimumFractionDigits: 2 }) : spend, // planted format
      budget_amount: r.chance(0.04) ? "" : r.round(spend * r.float(0.82, 1.3), 2), // planted missing
      vendor_count: r.int(0, 40),
      is_capital: r.chance(0.3) ? 1 : 0,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.008); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** PUB-02 — air quality station daily readings. */
export const pub2: DatasetBuilder = (r, rows) => {
  const stations = [
    ["AQ01", "Central", "Urban Traffic"], ["AQ02", "Central", "Urban Background"],
    ["AQ03", "Northfield", "Suburban"], ["AQ04", "Northfield", "Industrial"],
    ["AQ05", "Riverport", "Port"], ["AQ06", "Riverport", "Suburban"],
    ["AQ07", "Greenbelt", "Rural"], ["AQ08", "Greenbelt", "Suburban"],
    ["AQ09", "Hillcrest", "Rural"], ["AQ10", "Hillcrest", "Urban Background"],
    ["AQ11", "Eastvale", "Industrial"], ["AQ12", "Eastvale", "Urban Traffic"],
  ] as const;
  const days = Math.ceil(rows / stations.length);
  const out: DatasetRow[] = [];
  const start = new Date("2024-01-01T00:00:00Z");
  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const month = date.getUTCMonth();
    const winter = month <= 1 || month === 11;
    const dow = date.getUTCDay();
    for (const [id, city, type] of stations) {
      const base = type === "Urban Traffic" ? 88 : type === "Industrial" ? 79 : type === "Rural" ? 38 : 55;
      const aqi = Math.max(8, Math.round(base * (winter ? 1.28 : 1) * (dow === 0 || dow === 6 ? 0.86 : 1) * r.posNorm(1, 0.22)));
      const pm25 = r.chance(0.012) ? -999 : r.round(aqi * r.float(0.42, 0.61), 1); // planted sentinel
      out.push({
        date: date.toISOString().slice(0, 10),
        station_id: r.chance(0.004) ? id.toLowerCase() : id, // planted casing
        city,
        station_type: type,
        aqi: r.chance(0.02) ? "" : aqi, // planted sensor outage
        pm25,
        pm10: r.round(aqi * r.float(0.7, 1.0), 1),
        no2: r.round(aqi * r.float(0.3, 0.5), 1),
        temp_c: r.round(14 + (winter ? -8 : 6) + r.norm(0, 3.4), 1),
        wind_kph: r.chance(0.003) ? -r.round(r.posNorm(16, 7), 1) : r.round(r.posNorm(16, 7), 1), // planted negative
        humidity_pct: r.chance(0.004) ? r.int(101, 118) : r.int(35, 98), // planted impossible
        is_rain: r.chance(0.3) ? 1 : 0,
        is_holiday: [0, 1].includes(month) && d < 3 ? 1 : 0,
      });
    }
  }
  for (let i = 0; i < 12; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** PUB-03 — country-year development panel. */
export const pub3: DatasetBuilder = (r, rows) => {
  const countries: Array<[string, string, string, number]> = [
    ["NOR", "Norway", "Europe & Central Asia", 0.9],
    ["USA", "United States", "North America", 0.85],
    ["DEU", "Germany", "Europe & Central Asia", 0.84],
    ["CHN", "China", "East Asia & Pacific", 0.6],
    ["BRA", "Brazil", "Latin America & Caribbean", 0.55],
    ["IND", "India", "South Asia", 0.42],
    ["NGA", "Nigeria", "Sub-Saharan Africa", 0.3],
    ["BGD", "Bangladesh", "South Asia", 0.35],
    ["IDN", "Indonesia", "East Asia & Pacific", 0.5],
    ["MEX", "Mexico", "Latin America & Caribbean", 0.58],
    ["EGY", "Egypt, Arab Rep.", "Middle East & North Africa", 0.45],
    ["ZAF", "South Africa", "Sub-Saharan Africa", 0.45],
    ["VNM", "Viet Nam", "East Asia & Pacific", 0.48],
    ["PHL", "Philippines", "East Asia & Pacific", 0.45],
    ["ETH", "Ethiopia", "Sub-Saharan Africa", 0.22],
    ["KEN", "Kenya", "Sub-Saharan Africa", 0.3],
    ["POL", "Poland", "Europe & Central Asia", 0.7],
    ["TUR", "Turkiye", "Europe & Central Asia", 0.6],
    ["ARG", "Argentina", "Latin America & Caribbean", 0.55],
    ["COL", "Colombia", "Latin America & Caribbean", 0.52],
  ];
  const out: DatasetRow[] = [];
  for (const [code, name, region, level] of countries) {
    for (let y = 2013; y <= 2024; y++) {
      if (r.chance(0.03)) continue; // planted year gaps
      const trend = (y - 2013) * 0.006;
      const gdp = Math.round(1400 + level ** 2 * 52000 * (1 + trend) * r.posNorm(1, 0.05));
      const le = r.round(58 + level * 20 + trend * 2 + r.norm(0, 1.1), 1);
      const lit = Math.min(100, r.chance(0.03) ? r.round(100 + r.int(1, 9), 1) : r.round(52 + level * 46 + r.norm(0, 5), 1)); // planted impossible
      out.push({
        country_code: r.chance(0.015) ? code.toLowerCase() : code, // planted casing
        country: name,
        year: y,
        region: r.chance(0.04) ? region.split(" &")[0] : region, // planted short forms
        income_group:
          level > 0.75 ? "High income" : level > 0.5 ? "Upper middle income" : level > 0.32 ? "Lower middle income" : "Low income",
        population: Math.round(r.posNorm(48_000_000, 120_000_000) / 10) * 10,
        gdp_per_capita: r.chance(0.07) ? gdp.toLocaleString("en-US") : gdp, // planted format
        life_expectancy: le,
        literacy_rate_pct: r.chance(0.06) ? "" : lit, // planted missing
        internet_users_pct: r.round(Math.min(99, 14 + level * 68 + (y - 2013) * 1.8 + r.norm(0, 6)), 1),
        co2_per_capita_t: r.round(r.posNorm(1.2 + level * 11, 1.4), 2),
        health_spend_pct_gdp: r.round(3 + level * 8 + r.norm(0, 0.7), 1),
        hdi: r.chance(0.09) ? "" : r.round(Math.min(0.97, 0.42 + level * 0.5 + trend * 0.4 + r.norm(0, 0.02)), 3), // planted missing
      });
    }
  }
  for (let i = 0; i < 10; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ====================================================== 12 BUSINESS INTELLIGENCE */

/** BIQ-01 — regional monthly KPI table. */
export const biq1: DatasetBuilder = (r, rows) => {
  const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Canada"];
  const months = 36;
  const out: DatasetRow[] = [];
  for (let m = 0; m < months; m++) {
    const date = new Date(2023, m, 1);
    const label = r.chance(0.05)
      ? `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}` // planted format variant
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    for (const region of regions) {
      const scale = 1 + m * 0.012;
      const newC = Math.round(160 * scale * r.posNorm(1, 0.14));
      let churnC = Math.round(newC * r.float(0.18, 0.34));
      if (r.chance(0.004)) churnC = newC + r.int(20, 90); // planted impossible
      out.push({
        month: label,
        region: r.chance(0.03) ? region.toLowerCase() : region, // planted casing
        revenue: r.round(newC * r.posNorm(134, 18), 2),
        new_customers: newC,
        churned_customers: churnC,
        marketing_spend: r.round(newC * r.posNorm(64, 9), 2),
        support_tickets: Math.round(newC * r.float(0.9, 1.6)),
        nps: r.chance(0.05) ? "" : r.int(8, 62), // planted missing
        headcount: 40 + Math.round(m * 0.8) + r.int(0, 12),
      });
    }
  }
  for (let i = 0; i < 8; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** BIQ-02 — order fact table with repeated monthly targets. */
export const biq2: DatasetBuilder = (r, rows) => {
  const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];
  const channels = ["Web", "Mobile App", "Partner", "Retail"];
  const categories = ["Stationery", "Tech Accessories", "Home Office", "Apparel"];
  const sources = ["Organic", "Paid Search", "Social", "Email"];
  const start = new Date("2025-01-01T00:00:00Z");
  const targets = new Map<string, number>();
  for (let m = 0; m < 12; m++) {
    const label = `2025-${String(m + 1).padStart(2, "0")}`;
    for (const region of regions) {
      targets.set(`${label}|${region}`, Math.round(180000 + m * 9000 + r.int(0, 20000)));
    }
  }
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const day = new Date(start.getTime() + r.int(0, 334) * 86400000);
    const label = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}`;
    const region = r.pick(regions);
    const price = r.round(r.posNorm(42, 26), 2);
    const discRaw = r.round(r.float(0, 0.35), 3);
    out.push({
      order_id: 770000 + i,
      order_date: day.toISOString().slice(0, 10),
      month: label,
      region,
      channel: r.chance(0.04) ? r.pick(channels).toLowerCase() : r.pick(channels),
      category: r.pick(categories),
      units: r.int(1, 14),
      unit_price: price,
      discount: r.chance(0.08) ? discRaw * 100 : discRaw, // planted decimal/percent mix
      cost: r.chance(0.05) ? "" : r.round(price * r.float(0.42, 0.68), 2), // planted missing
      marketing_source: r.pick(sources),
      is_new_customer: r.chance(0.45) ? (r.chance(0.2) ? "TRUE" : 1) : r.chance(0.2) ? "FALSE" : 0, // planted mixed encodings
      region_month_target: r.chance(0.02) ? "" : targets.get(`${label}|${region}`) ?? "", // repeated target (dedup to build target table)
    });
  }
  for (let i = 0; i < Math.round(rows * 0.007); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** BIQ-03 — cohort × month growth panel with channel CAC. */
export const biq3: DatasetBuilder = (r, rows) => {
  const channels = ["Paid Search", "Organic Search", "Social", "Referral"];
  const cohorts = 20; // 2024-01 .. 2025-08
  const months = 20;
  const spend: number[][] = [];
  const cac: number[][] = [];
  for (let c = 0; c < cohorts; c++) {
    spend[c] = [];
    cac[c] = [];
    for (let k = 0; k < channels.length; k++) {
      spend[c].push(r.round(r.posNorm(26000, 8000), 0));
    }
  }
  for (let c = 0; c < cohorts; c++) {
    for (let k = 0; k < channels.length; k++) {
      const newCust = Math.round(spend[c][k] / r.posNorm(96, 22));
      cac[c][k] = r.round(spend[c][k] / Math.max(1, newCust), 2);
    }
  }
  const cohortLabel = (c: number) => {
    const y = 2024 + Math.floor(c / 12);
    const m = (c % 12) + 1;
    return `${y}-${String(m).padStart(2, "0")}`;
  };
  const out: DatasetRow[] = [];
  for (let c = 0; c < cohorts; c++) {
    for (let m = c; m < Math.min(months, c + 14); m++) {
      for (let k = 0; k < channels.length; k++) {
        const age = m - c;
        const newCust = Math.round(spend[c][k] / Math.max(1, cac[c][k]));
        const retention = 1 / (1 + age * 0.85);
        const active = Math.round(newCust * retention * r.posNorm(1, 0.07));
        const revenue = r.round(active * r.posNorm(21, 5) * (1 + age * 0.04), 2);
        const margin = r.round(r.float(0.42, 0.68), 4);
        out.push({
          month: cohortLabel(m),
          cohort_month: r.chance(0.004) ? cohortLabel(m + 2) : cohortLabel(c), // planted impossible (cohort after month)
          channel: channels[k],
          customers_active: active,
          orders: Math.round(active * r.float(0.5, 1.1)),
          revenue: age === 0 && r.chance(0.02) ? 0 : revenue, // planted zero blocks
          marketing_spend: age === 0 ? spend[c][k] : 0, // spend only in acquisition month (repeated across channels — dedup)
          cac_usd: c < 3 && r.chance(0.3) ? "" : r.round(cac[c][k], 2), // planted missing early cohorts
          gross_margin_pct: r.chance(0.003) ? margin * 1000 : margin, // planted impossible
        });
      }
    }
  }
  for (let i = 0; i < 14; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};
