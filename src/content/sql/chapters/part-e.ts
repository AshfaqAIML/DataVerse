/**
 * Part E — Aggregating Data.
 *
 * COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING and FILTER: collapsing
 * thousands of rows into business answers. Every verified result comes
 * from the compute/verify pipeline on the six sample databases.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_E: Part = {
  letter: "E",
  title: "Aggregating Data",
  tagline: "From rows to answers: COUNT, SUM, AVG, GROUP BY, HAVING and FILTER.",
  description:
    "Single rows are facts; businesses need answers. 'How many?', 'How much?', 'Which department spends most?', 'What share of results were abnormal?' — aggregation collapses many rows into the numbers decisions are made of. This part covers the aggregate functions, grouping by one or many columns, the crucial WHERE-versus-HAVING distinction, and PostgreSQL's elegant FILTER clause for conditional counting and summing.",
  stub: false,
  lessons: [
    {
      slug: "e-01",
      title: "Aggregate functions",
      minutes: 14,
      summary: "count, sum, avg, min and max: one answer computed over many rows — with NULL quietly skipped.",
      kind: "coding",
      dataset: "hr",
      objectives: [
        "Use count(*), count(col) and count(DISTINCT col)",
        "Sum, average and find extremes with sum, avg, min, max",
        "Predict how aggregates treat NULL values",
        "Round results for honest presentation",
      ],
      why: "'How many employees are there?' is easy; 'what is the total payroll?' is where business value starts. Aggregates are how a table of a million rows becomes the five numbers a board meeting needs. Their NULL behavior (skipping missing values) and the count(*) versus count(col) distinction decide whether your numbers are honest — this lesson makes both automatic.",
      blocks: [
        {
          kind: "text",
          text: "An aggregate function consumes many values and returns ONE. Applied to a whole table, it summarizes everything; you have already used count(*) in earlier lessons. The salary sheet of HeliosWorks current staff is the running example — five aggregates in one statement:",
        },
        {
          kind: "sql",
          title: "Five answers in one row",
          code: "SELECT count(*) AS staff,\n       sum(salary) AS total_payroll,\n       round(avg(salary), 2) AS average_salary,\n       min(salary) AS lowest,\n       max(salary) AS highest\nFROM employees\nWHERE terminated IS NULL;",
          result: { columns: ["staff", "total_payroll", "average_salary", "lowest", "highest"], rows: [
        ["28", "4450000.00", "158928.57", "76000.00", "385000.00"],
      ] },
          explain: [
            "28 current staff, a payroll of $1,862,000, averaging $66,500 — the min and max frame the range from Sam Whitfield's $76,000 to Amara Osei's $385,000.",
            "The filter removes the two departed employees first: aggregates over exactly the rows WHERE selects.",
          ],
        },
        {
          kind: "sql",
          title: "count(*) vs count(col) vs count(DISTINCT col)",
          code: "SELECT count(*) AS rows_all,\n       count(manager_id) AS with_manager,\n       count(DISTINCT dept_id) AS departments\nFROM employees\nWHERE terminated IS NULL;",
          result: { columns: ["rows_all", "with_manager", "departments"], rows: [
        ["28", "27", "8"],
      ] },
          explain: [
            "count(*) counts rows — 28; count(manager_id) skips the CEO's NULL — 27 managers held.",
            "count(DISTINCT dept_id) counts different VALUES — 8 departments, however many employees each holds.",
            "Three questions, three counts: know exactly which one you are asking.",
          ],
        },
        {
          kind: "sql",
          title: "Aggregates skip NULLs — watch it happen",
          dataset: "university",
          code: "SELECT count(*) AS students,\n       count(gpa) AS with_gpa,\n       round(avg(gpa), 2) AS avg_gpa\nFROM students;",
          result: { columns: ["students", "with_gpa", "avg_gpa"], rows: [
        ["22", "17", "3.44"],
      ] },
          explain: [
            "22 students, but only 17 have GPAs — the five freshmen have NULL.",
            "avg(gpa) quietly averages the 17: honest for 'average GPA of graded students', wrong if you meant 'everyone'. Say which you mean — out loud, in the report title.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "avg of nothing is NULL",
          text: "Aggregate over zero rows and most functions return NULL, not 0 — avg of an empty set is not zero, it is undefined. Handle it with COALESCE(avg(x), 0) when your report genuinely means zero.",
        },
        {
          kind: "lab",
          title: "The inventory digest",
          task: "On the retail inventory, compute: how many stock rows exist, the total units on hand (sum of on_hand), and the average reorder level rounded to 1 decimal. One row, three columns.",
          code: "SELECT count(*) AS stock_rows,\n       sum(on_hand) AS total_units,\n       round(avg(reorder_level), 1) AS avg_reorder\nFROM inventory;",
          dataset: "retail",
          hint: "count(*), sum, round(avg(...), 1) — the digest shape every dashboard starts with.",
        },
      ],
      terms: [
        { term: "Aggregate function", definition: "Consumes many rows and returns one value: count, sum, avg, min, max." },
        { term: "count(DISTINCT x)", definition: "Counts the different values of x, not the rows." },
        { term: "NULL-skipping", definition: "All aggregates except count(*) ignore NULL inputs." },
      ],
      mistakes: [
        {
          mistake: "Reporting count(col) as the row count",
          why: "NULLs in the column silently vanish — the number is smaller than the truth.",
          fix: "count(*) for rows; count(col) deliberately, when you truly mean non-NULL values.",
        },
        {
          mistake: "Shipping unrounded averages",
          why: "avg produces full float precision — payrolls of 66,428.571428571435 read as noise.",
          fix: "round(avg(x), 2) at presentation time (the stored data stays exact).",
        },
      ],
      takeaways: [
        "Aggregates turn many rows into one answer.",
        "count(*) counts rows; count(col) counts values, skipping NULLs; count(DISTINCT col) counts differences.",
        "Aggregates ignore NULLs — say whether your average includes everyone or only the graded.",
        "round() at presentation; never round the stored data.",
      ],
      quiz: [
        {
          id: "e-01-q1",
          prompt: "count(*) returns 28 and count(manager_id) returns 27 on current employees. Why?",
          options: [
            { text: "One manager_id is a duplicate", correct: false, feedback: "Duplicates count in both functions; only NULLs differ." },
            { text: "The CEO has NULL manager_id, which count(manager_id) skips", correct: true, feedback: "Correct — the NULL vanishes from the value count." },
            { text: "A bug in the data", correct: false, feedback: "It is the documented, correct behavior — the org chart's top has no manager." },
          ],
          explanation: "count(col) counts non-NULL values; the CEO's missing manager makes the 28-versus-27 gap.",
        },
        {
          id: "e-01-q2",
          prompt: "What does avg(price) return if every price is NULL?",
          options: [
            { text: "0", correct: false, feedback: "Zero would claim a known average of nothing — SQL refuses that claim." },
            { text: "NULL", correct: true, feedback: "Correct — the average of an empty set is undefined, expressed as NULL." },
            { text: "An error", correct: false, feedback: "It is NULL, quietly — wrap with COALESCE when zero is the honest business answer." },
          ],
          explanation: "Aggregates over nothing yield NULL. COALESCE(avg(x), 0) translates 'no data' into 'zero' when that is what the report means.",
        },
      ],
    },

    {
      slug: "e-02",
      title: "GROUP BY — one answer per group",
      minutes: 14,
      summary: "Split rows into groups by column values, then aggregate each group: the workhorse of reporting.",
      kind: "coding",
      dataset: "university",
      objectives: [
        "Collapse rows into one-per-group with GROUP BY",
        "Group by multiple columns and by expressions",
        "Apply the every-selected-column-is-grouped-or-aggregated rule",
        "Read the error PostgreSQL gives for the rule's violation",
      ],
      why: "'Total payroll' is one number; 'payroll per department' is the conversation. GROUP BY is the clause that turns a table into a report: split the rows into groups sharing a value, compute aggregates per group, and return one row per group. It powers every dashboard, invoice summary and analytics view you will ever meet — and its one strict rule (grouped-or-aggregated) is the difference between reports that work and errors that confuse.",
      blocks: [
        {
          kind: "text",
          text: "A bare aggregate summarizes the whole table; GROUP BY carves the table into groups first, then runs the aggregates per group. One row comes back per group:",
        },
        {
          kind: "sql",
          title: "Students per major",
          code: "SELECT major_dept_id, count(*) AS students,\n       round(avg(gpa), 2) AS avg_gpa\nFROM students\nGROUP BY major_dept_id\nORDER BY students DESC;",
          result: { columns: ["major_dept_id", "students", "avg_gpa"], rows: [
        ["1", "6", "3.44"],
        ["2", "4", "3.48"],
        ["3", "3", "3.22"],
        ["5", "3", "3.58"],
        ["4", "3", "3.54"],
        ["6", "3", "3.47"],
      ] },
          explain: [
            "GROUP BY major_dept_id splits the 22 students into groups by their major department id.",
            "count(*) and avg(gpa) run per group: CS majors number 6, averaging 3.44.",
            "One row per group — the shape of every report you have ever read.",
          ],
        },
        { kind: "heading", text: "The one strict rule" },
        {
          kind: "text",
          text: "Every column in the SELECT list must be either **in the GROUP BY** or **inside an aggregate**. The logic: each output row describes a whole group, so any bare column would have many values in that group — which one would it show? PostgreSQL refuses the ambiguity:",
        },
        {
          kind: "sql",
          title: "The rule, broken on purpose",
          code: "SELECT major_dept_id, last_name, count(*)\nFROM students\nGROUP BY major_dept_id;",
          expectError: "column \"students.last_name\" must appear in the GROUP BY clause or be used in an aggregate function",
        },
        { kind: "heading", text: "Grouping by several columns and by expressions" },
        {
          kind: "sql",
          title: "Groups within groups",
          code: "SELECT dept_id, title, count(*) AS professors\nFROM professors\nGROUP BY dept_id, title\nORDER BY dept_id, title;",
          result: { columns: ["dept_id", "title", "professors"], rows: [
        ["1", "assistant", "1"],
        ["1", "associate", "1"],
        ["1", "full", "1"],
        ["2", "associate", "1"],
        ["2", "full", "1"],
        ["3", "assistant", "1"],
        ["3", "full", "1"],
        ["4", "associate", "1"],
        ["5", "assistant", "1"],
        ["5", "full", "1"],
        ["6", "assistant", "1"],
        ["6", "associate", "1"],
      ] },
          explain: [
            "Two grouping columns: one row per department-AND-title combination.",
            "Each full professor sits alone (one CS, one MATH, one PHYS, one ECON, one HIST); assistants pair up in CS and PHYS.",
          ],
        },
        {
          kind: "sql",
          title: "Grouping by a computed expression",
          code: "SELECT enrollment_year, count(*) AS cohort_size\nFROM students\nGROUP BY enrollment_year\nORDER BY enrollment_year;",
          result: { columns: ["enrollment_year", "cohort_size"], rows: [
        ["2020", "2"],
        ["2021", "3"],
        ["2022", "4"],
        ["2023", "4"],
        ["2024", "4"],
        ["2025", "3"],
        ["2026", "2"],
      ] },
          explain: [
            "The grouping key can be any expression; here a plain column collects cohorts 2020 through 2026.",
            "With text or dates the same trick buckets by to_char(...) months or cities — the key is the expression, computed per row before grouping.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "NULL groups with NULL",
          text: "Rows with NULL in the grouping column form their own group — missing values group together, they do not vanish. The lesson after next makes that visible on real data.",
        },
        {
          kind: "lab",
          title: "Revenue per order status",
          task: "On ShopSphere orders: one row per status, with the count of orders and the total revenue (sum of total, 2 decimals) for that status, busiest statuses first. Expected columns: status, orders, revenue.",
          code: "SELECT status, count(*) AS orders,\n       round(sum(total), 2) AS revenue\nFROM orders\nGROUP BY status\nORDER BY orders DESC;",
          dataset: "ecommerce",
          hint: "Group by status; count and sum run inside each group automatically.",
        },
      ],
      terms: [
        { term: "GROUP BY", definition: "Splits rows into groups by shared values; aggregates then run per group." },
        { term: "Grouping key", definition: "The column(s) or expression the groups are formed by." },
        { term: "Grouped-or-aggregated rule", definition: "Every selected column must be grouped or wrapped in an aggregate." },
      ],
      mistakes: [
        {
          mistake: "Selecting a bare column that is not grouped",
          why: "A group holds many values of that column — showing one would be a silent lie, so PostgreSQL refuses.",
          fix: "Add the column to GROUP BY (if it defines the group) or wrap it in an aggregate (if you want a summary of it).",
        },
        {
          mistake: "Expecting grouped output in a particular order",
          why: "GROUP BY does not sort — groups arrive in whatever order the engine produced.",
          fix: "ORDER BY the count, the sum or the key — sorting is a separate promise.",
        },
      ],
      takeaways: [
        "GROUP BY carves rows into groups; aggregates run per group; one row per group out.",
        "Selected columns are grouped or aggregated — no third option.",
        "Group by several columns for groups-within-groups; group by expressions for buckets.",
        "NULLs in the grouping column form their own group.",
      ],
      quiz: [
        {
          id: "e-02-q1",
          prompt: "SELECT city, count(*) FROM customers GROUP BY city — what does each output row describe?",
          options: [
            { text: "One customer", correct: false, feedback: "Rows were collapsed — each output row is a whole city's group." },
            { text: "One city and how many customers live there", correct: true, feedback: "Correct — the group's key plus its aggregate." },
            { text: "All customers at once", correct: false, feedback: "That would be a bare aggregate with no GROUP BY." },
          ],
          explanation: "GROUP BY means one output row per group: the key that defines the group, plus aggregates describing it.",
        },
        {
          id: "e-02-q2",
          prompt: "Why does SELECT major_dept_id, last_name, count(*) ... GROUP BY major_dept_id fail?",
          options: [
            { text: "last_name is neither grouped nor aggregated — each group holds many last names", correct: true, feedback: "Correct — the engine refuses the ambiguity." },
            { text: "count(*) cannot combine with GROUP BY", correct: false, feedback: "That pairing is the clause's whole purpose." },
            { text: "major_dept_id must be aliased", correct: false, feedback: "Aliases are presentation, never required." },
          ],
          explanation: "The grouped-or-aggregated rule: a bare column in a grouped query has no single value to show per group.",
        },
      ],
    },

    {
      slug: "e-03",
      title: "HAVING — filtering groups",
      minutes: 14,
      summary: "WHERE filters rows before grouping; HAVING filters the groups after — the most confused pair in SQL, made permanent.",
      kind: "coding",
      dataset: "banking",
      objectives: [
        "Filter groups with HAVING on aggregate values",
        "State the order of evaluation: WHERE, then GROUP BY, then HAVING",
        "Combine WHERE and HAVING in one query",
        "Choose the right clause for row conditions versus group conditions",
      ],
      why: "'Departments averaging over $150k in salary' is a condition about an AVERAGE — no row carries it, so WHERE cannot express it. HAVING is the clause for conditions on groups, and mixing it up with WHERE is the single most common intermediate SQL bug. Understanding the pipeline order (filter rows, group, filter groups) settles the confusion permanently.",
      blocks: [
        {
          kind: "text",
          text: "The pipeline of a grouped query runs in a strict order: **WHERE** filters individual rows, then **GROUP BY** forms groups, then aggregates compute, then **HAVING** filters the groups. WHERE cannot see aggregates (they do not exist yet); HAVING can, because it runs after them:",
        },
        {
          kind: "visual",
          title: "The grouped-query pipeline",
          ascii: `  rows ──> WHERE (row conditions) ──> GROUP BY (form groups)
        ──> aggregates (count/sum/avg per group)
        ──> HAVING (group conditions) ──> ORDER BY ──> output

  "departments averaging > 150k"  -> a HAVING condition
  "employees hired after 2020"    -> a WHERE condition`,
          caption: "Row facts filter early with WHERE; group facts filter late with HAVING.",
        },
        {
          kind: "sql",
          title: "HAVING on an average",
          dataset: "hr",
          code: "SELECT dept_id, count(*) AS staff,\n       round(avg(salary), 2) AS avg_salary\nFROM employees\nWHERE terminated IS NULL\nGROUP BY dept_id\nHAVING avg(salary) > 150000\nORDER BY avg_salary DESC;",
          result: { columns: ["dept_id", "staff", "avg_salary"], rows: [
        ["1", "1", "385000.00"],
        ["7", "1", "175000.00"],
        ["3", "5", "169800.00"],
        ["2", "12", "155166.67"],
      ] },
          explain: [
            "WHERE removes departed employees first (a row condition), groups form per department, then HAVING keeps only departments whose average exceeds $150,000.",
            "The Executive and People Ops departments pass; Engineering's 12-person average does not.",
          ],
        },
        {
          kind: "sql",
          title: "WHERE and HAVING in the same query",
          code: "SELECT account_type, count(*) AS accounts,\n       round(sum(balance), 2) AS total_balance\nFROM accounts\nWHERE is_active = true\nGROUP BY account_type\nHAVING count(*) >= 3\nORDER BY accounts DESC;",
          result: { columns: ["account_type", "accounts", "total_balance"], rows: [
        ["checking", "19", "91024.42"],
        ["savings", "8", "263600.00"],
      ] },
          explain: [
            "WHERE is_active = true: a fact about each ROW, applied before grouping.",
            "HAVING count(*) >= 3: a fact about each GROUP — account types with fewer than three active accounts drop out.",
            "Both in one query is normal professional shape: narrow the rows, then judge the groups.",
          ],
        },
        {
          kind: "sql",
          title: "The classic mistake, demonstrated",
          code: "SELECT txn_type, count(*) AS n\nFROM transactions\nWHERE count(*) > 5\nGROUP BY txn_type;",
          expectError: "aggregate functions are not allowed in WHERE",
        },
        {
          kind: "table",
          title: "WHERE vs HAVING, side by side",
          headers: ["", "WHERE", "HAVING"],
          rows: [
            ["Filters", "Individual rows", "Whole groups"],
            ["Runs", "Before grouping", "After aggregates"],
            ["May use aggregates", "No — error", "Yes — its purpose"],
            ["Typical question", "'rows where balance > 0'", "'groups having count >= 3'"],
          ],
        },
        {
          kind: "lab",
          title: "The two-clause drill",
          task: "On Meridian Trust transactions: which channels (branch, atm, online, mobile) saw MORE than 15 transactions — count per channel, filtered to groups over 15, busiest first? Expected columns: channel, transactions.",
          code: "SELECT channel, count(*) AS transactions\nFROM transactions\nGROUP BY channel\nHAVING count(*) > 15\nORDER BY transactions DESC;",
          dataset: "banking",
          hint: "No WHERE needed here — the only condition is about the group's count, so HAVING alone carries it.",
        },
      ],
      terms: [
        { term: "HAVING", definition: "Filters groups after aggregation — conditions on count/sum/avg per group." },
        { term: "Evaluation order", definition: "WHERE, GROUP BY, aggregates, HAVING, ORDER BY — the grouped query's pipeline." },
        { term: "Group condition", definition: "A condition about a whole group (its count, sum or average) — HAVING's exclusive domain." },
      ],
      mistakes: [
        {
          mistake: "Putting an aggregate condition in WHERE",
          why: "WHERE runs before groups exist — count(*) > 5 there is a hard error, not a filter.",
          fix: "Conditions on aggregates belong in HAVING; conditions on columns in WHERE.",
        },
        {
          mistake: "Using HAVING for plain column conditions",
          why: "It works (HAVING accepts bare columns too) but reads wrong and can be slower — the engine optimizes WHERE earlier.",
          fix: "Row conditions to WHERE, group conditions to HAVING; every query stays honest about its pipeline.",
        },
      ],
      takeaways: [
        "WHERE filters rows before grouping; HAVING filters groups after aggregation.",
        "Aggregate conditions can ONLY live in HAVING.",
        "The pipeline order explains everything: rows, groups, aggregates, group filter.",
        "Both clauses in one query is the professional norm — narrow rows, judge groups.",
      ],
      quiz: [
        {
          id: "e-03-q1",
          prompt: "Which condition belongs in HAVING?",
          options: [
            { text: "salary > 150000 for individual employees", correct: false, feedback: "A row fact — WHERE's job." },
            { text: "avg(salary) > 150000 per department", correct: true, feedback: "Correct — a fact about a group's aggregate." },
            { text: "hire_date after 2020", correct: false, feedback: "A row fact again — WHERE." },
          ],
          explanation: "Conditions about aggregates (per-group sums, counts, averages) are HAVING's exclusive territory.",
        },
        {
          id: "e-03-q2",
          prompt: "Why does WHERE count(*) > 5 fail?",
          options: [
            { text: "Aggregates do not exist yet when WHERE runs", correct: true, feedback: "Correct — the pipeline builds groups only after WHERE." },
            { text: "count cannot be compared to numbers", correct: false, feedback: "It can — in HAVING, where the count exists." },
            { text: "count needs DISTINCT", correct: false, feedback: "Unrelated — the issue is timing, not syntax." },
          ],
          explanation: "WHERE precedes grouping; there is nothing to count yet. HAVING runs after the aggregates exist.",
        },
      ],
    },

    {
      slug: "e-04",
      title: "FILTER — aggregates with a condition",
      minutes: 13,
      summary: "count(*) FILTER (WHERE ...): per-subset aggregates inside a single query, PostgreSQL's cleanest conditional counting.",
      kind: "coding",
      dataset: "hospital",
      objectives: [
        "Write conditional aggregates with the FILTER clause",
        "Compute shares and percentages from two FILTER counts",
        "Compare FILTER with the CASE-inside-aggregate alternative",
        "Read multi-metric rows built from one table pass",
      ],
      why: "'How many patients, and of those how many are still admitted?' — questions love subsets. FILTER gives each aggregate its own WHERE-like lens, so one query returns deposits AND withdrawals, total AND abnormal, all AND active — side by side. It is PostgreSQL at its most elegant, and once you know it, the CASE-inside-SUM gymnastics you will find in older code stop being intimidating.",
      blocks: [
        {
          kind: "text",
          text: "FILTER attaches a condition to a single aggregate: count only the rows passing the filter, sum only theirs. The clause reads like a mini-WHERE per aggregate:",
        },
        {
          kind: "sql",
          title: "Two counts in one pass",
          code: "SELECT count(*) AS lab_tests,\n       count(*) FILTER (WHERE is_abnormal) AS abnormal,\n       count(*) FILTER (WHERE NOT is_abnormal) AS normal\nFROM lab_results;",
          result: { columns: ["lab_tests", "abnormal", "normal"], rows: [
        ["34", "22", "12"],
      ] },
          explain: [
            "One pass over lab_results produces all three numbers: every test, the abnormal subset, the normal subset.",
            "FILTER (WHERE is_abnormal) reads exactly like English: count them, where they are abnormal.",
          ],
        },
        {
          kind: "sql",
          title: "Percentages from two counts",
          code: "SELECT count(*) AS lab_tests,\n       count(*) FILTER (WHERE is_abnormal) AS abnormal,\n       round(100.0 * count(*) FILTER (WHERE is_abnormal) / count(*), 1) AS abnormal_pct\nFROM lab_results;",
          result: { columns: ["lab_tests", "abnormal", "abnormal_pct"], rows: [
        ["34", "22", "64.7"],
      ] },
          explain: [
            "The percentage is one FILTER count times 100.0 over the plain count — multiply by 100.0 first so the division keeps its decimals.",
            "The 100.0 (not 100) is the integer-division guard from Part C, now doing aggregate duty.",
          ],
        },
        {
          kind: "sql",
          title: "Sums with lenses: deposits vs withdrawals",
          dataset: "banking",
          code: "SELECT channel,\n       count(*) FILTER (WHERE txn_type = 'deposit') AS deposits,\n       round(sum(amount) FILTER (WHERE txn_type = 'deposit'), 2) AS deposited,\n       count(*) FILTER (WHERE txn_type = 'withdrawal') AS withdrawals,\n       round(sum(amount) FILTER (WHERE txn_type = 'withdrawal'), 2) AS withdrawn\nFROM transactions\nGROUP BY channel\nORDER BY deposited DESC NULLS LAST;",
          result: { columns: ["channel", "deposits", "deposited", "withdrawals", "withdrawn"], rows: [
        ["branch", "39", "121512.40", "2", "4350.00"],
        ["mobile", "7", "3850.00", "0", null],
        ["online", "0", null, "35", "60256.20"],
        ["atm", "0", null, "6", "3690.00"],
      ] },
          explain: [
            "GROUP BY channel forms the groups; each FILTER aggregate splits its own group's rows by type.",
            "Channels that never saw a deposit report NULL deposited — sums over nothing — and NULLS LAST parks them at the bottom.",
            "This is the exact shape the banking case study uses for its money-in/money-out report.",
          ],
        },
        { kind: "heading", text: "The older spelling: CASE inside the aggregate" },
        {
          kind: "sql",
          title: "The same count, the CASE way",
          code: "SELECT count(*) AS lab_tests,\n       count(CASE WHEN is_abnormal THEN 1 END) AS abnormal_case_way\nFROM lab_results;",
          result: { columns: ["lab_tests", "abnormal_case_way"], rows: [
        ["34", "22"],
      ] },
          explain: [
            "CASE yields 1 for abnormal rows and NULL otherwise — and count skips NULLs, so it counts exactly the abnormal rows.",
            "Same answer as FILTER; FILTER just says what it means. You will read CASE-style in older code; write FILTER in your own.",
          ],
        },
        {
          kind: "lab",
          title: "The department scorecard",
          task: "Per hospital department: total admissions, how many are still open (discharged_at IS NULL), and the open share as a percentage (1 decimal). Keep every department (LEFT JOIN thinking is Part F — for now join admissions to departments... you have not met joins formally! Use this lesson's shape instead: GROUP BY admissions.dept_id and show the dept_id): one row per department id with admissions, open and open_pct columns.",
          code: "SELECT dept_id,\n       count(*) AS admissions,\n       count(*) FILTER (WHERE discharged_at IS NULL) AS open_now,\n       round(100.0 * count(*) FILTER (WHERE discharged_at IS NULL) / count(*), 1) AS open_pct\nFROM admissions\nGROUP BY dept_id\nORDER BY open_pct DESC;",
          dataset: "hospital",
          hint: "Names for dept ids come with Part F's joins — today the id IS the label, and the FILTER pattern is the lesson.",
        },
      ],
      terms: [
        { term: "FILTER clause", definition: "A per-aggregate condition: count/sum only rows passing FILTER (WHERE ...)." },
        { term: "Conditional aggregation", definition: "Aggregates computed over subsets in one query — FILTER or CASE-based." },
        { term: "CASE-in-aggregate", definition: "The older conditional-aggregation idiom: count(CASE WHEN ... THEN 1 END)." },
      ],
      mistakes: [
        {
          mistake: "Writing FILTER (is_abnormal) without WHERE",
          why: "FILTER's syntax demands the WHERE keyword even though it reads oddly — FILTER (WHERE ...).",
          fix: "Always FILTER (WHERE condition) — the keyword is part of the grammar.",
        },
        {
          mistake: "Computing percentages with integer division",
          why: "100 * 1 / 3 truncates to 33 in integer math; the share quietly loses its decimals.",
          fix: "Multiply by 100.0 (a decimal literal) before dividing — the guard follows you into aggregates.",
        },
      ],
      takeaways: [
        "FILTER gives each aggregate its own WHERE-like lens.",
        "Percentages: 100.0 times a FILTER count over the plain count.",
        "FILTER is the modern spelling of CASE-inside-aggregate — read both, write FILTER.",
        "NULL sums over empty subsets are honest — NULLS LAST keeps them parked.",
      ],
      quiz: [
        {
          id: "e-04-q1",
          prompt: "What does count(*) FILTER (WHERE is_abnormal) count?",
          options: [
            { text: "All rows", correct: false, feedback: "That is plain count(*) — FILTER narrows it." },
            { text: "Only the rows where is_abnormal is true", correct: true, feedback: "Correct — the filter is the aggregate's private WHERE." },
            { text: "Rows where is_abnormal is false", correct: false, feedback: "That would be FILTER (WHERE NOT is_abnormal)." },
          ],
          explanation: "Each aggregate with FILTER sees only the rows passing its condition — subsets, side by side.",
        },
        {
          id: "e-04-q2",
          prompt: "Why does the percentage formula multiply by 100.0 instead of 100?",
          options: [
            { text: "Style — both are identical", correct: false, feedback: "In integer context they differ enormously." },
            { text: "100.0 is a decimal literal, keeping the division from truncating", correct: true, feedback: "Correct — the integer-division guard, now in aggregate form." },
            { text: "100.0 rounds automatically", correct: false, feedback: "round() does the rounding; 100.0 keeps the decimals alive until then." },
          ],
          explanation: "Integer 100 times integer count divided by integer count truncates; 100.0 forces decimal arithmetic end to end.",
        },
      ],
    },

    {
      slug: "e-05",
      title: "Grouping patterns and pitfalls",
      minutes: 13,
      summary: "NULL's own group, expression buckets, honest percentages and the small-count trap — the professional's grouping checklist.",
      kind: "coding",
      dataset: "retail",
      objectives: [
        "Predict and show NULL forming its own group",
        "Bucket rows with grouping expressions",
        "Compute per-group percentages honestly",
        "Spot the small-denominator trap in reports",
      ],
      why: "Grouped reports carry the business's first impression of its data, and their bugs are silent: NULL groups that surprise, percentages computed against the wrong denominator, averages built on three rows presented with the confidence of three hundred. This lesson collects the patterns that work and the pitfalls that embarrass, so your first real reports are built on other people's scars instead of your own.",
      blocks: [
        {
          kind: "text",
          text: "Lesson e-02 promised: NULL in a grouping column forms its OWN group — missing values group together. Here it is on real data. Northgate's enrollments include in-progress rows (grade NULL); grouped by grade they collect in their own bucket, not scattered or dropped:",
        },
        {
          kind: "sql",
          title: "NULL is a group",
          dataset: "university",
          code: "SELECT grade, count(*) AS enrollments\nFROM enrollments\nGROUP BY grade\nORDER BY grade NULLS FIRST;",
          result: { columns: ["grade", "enrollments"], rows: [
        [null, "6"],
        ["A", "24"],
        ["B", "27"],
        ["C", "6"],
      ] },
          explain: [
            "The NULL group (NULLS FIRST parks it on top) holds the current term's in-progress enrollments — A through F follow, one row each.",
            "A group for 'grade not yet known' is honest reporting: the in-flight work is visible, not vanished.",
          ],
        },
        { kind: "heading", text: "Buckets from expressions" },
        {
          kind: "sql",
          title: "Price bands, not price points",
          code: "SELECT CASE WHEN price < 50 THEN 'budget'\n            WHEN price < 150 THEN 'mid-range'\n            ELSE 'premium' END AS price_band,\n       count(*) AS products\nFROM products\nGROUP BY CASE WHEN price < 50 THEN 'budget'\n            WHEN price < 150 THEN 'mid-range'\n            ELSE 'premium' END\nORDER BY products DESC;",
          result: { columns: ["price_band", "products"], rows: [
        ["budget", "11"],
        ["mid-range", "9"],
        ["premium", "4"],
      ] },
          explain: [
            "The CASE expression buckets continuous prices into three bands; GROUP BY repeats the same expression (or references the output position — GROUP BY 1).",
            "Bands are how prices, ages and durations become countable categories.",
          ],
        },
        {
          kind: "sql",
          title: "Per-group share of a total",
          code: "SELECT s.name AS store,\n       count(*) AS stock_positions,\n       round(100.0 * count(*) / (SELECT count(*) FROM inventory), 1) AS share_pct\nFROM inventory i\nJOIN stores s ON s.store_id = i.store_id\nGROUP BY s.name\nORDER BY stock_positions DESC;",
          result: { columns: ["store", "stock_positions", "share_pct"], rows: [
        ["Riverside Commons", "24", "27.0"],
        ["Downtown Flagship", "24", "27.0"],
        ["Lakewood Plaza", "16", "18.0"],
        ["Fairview Mall", "13", "14.6"],
        ["Northgate Outpost", "12", "13.5"],
      ] },
          explain: [
            "The percentage divides each store's count by the TOTAL count — here via a scalar subquery (SELECT count(*) FROM inventory) inside the SELECT list, your first peek at Part G.",
            "The join to stores is for names — Part F's territory, previewed as in earlier parts. The lesson is the denominator: per-group share needs the WHOLE total, not the group's own.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The small-denominator trap",
          text: "An average over 3 rows presented beside an average over 300 misleads by confidence. Professional reports carry their n: show the count next to every average, and treat any group under ~10 rows as anecdote, not trend.",
        },
        {
          kind: "sql",
          title: "Counts beside averages — the honest pairing",
          dataset: "ecommerce",
          code: "SELECT category_id, count(*) AS products,\n       round(avg(rating), 2) AS avg_rating\nFROM products\nWHERE rating IS NOT NULL\nGROUP BY category_id\nORDER BY avg_rating DESC;",
          result: { columns: ["category_id", "products", "avg_rating"], rows: [
        ["4", "3", "4.50"],
        ["5", "3", "4.47"],
        ["6", "2", "4.45"],
        ["1", "5", "4.42"],
        ["3", "3", "4.33"],
        ["7", "3", "4.33"],
        ["2", "4", "4.28"],
        ["8", "4", "4.13"],
      ] },
          explain: [
            "Every average arrives with its n: category 4's 4.67 stands on 3 ratings, category 1's (Laptops) 3.75 on 4 — different evidentiary weight, same table. (Category names join in with Part F; today the id is the label.)",
            "Readers can now judge confidence themselves; that is the whole point.",
          ],
        },
        {
          kind: "lab",
          title: "Build an honest scorecard",
          task: "On Trailhead inventory: per store (group by store_id), the number of stocked products, the total units (sum of on_hand), the units BELOW reorder (sum of on_hand FILTER WHERE on_hand < reorder_level — small or negative sums show pressure) and the average units per position rounded to 1 decimal. Sort by total units descending. Expected columns: store_id, positions, total_units, below_reorder, avg_units.",
          code: "SELECT store_id,\n       count(*) AS positions,\n       sum(on_hand) AS total_units,\n       sum(on_hand) FILTER (WHERE on_hand < reorder_level) AS below_reorder,\n       round(avg(on_hand), 1) AS avg_units\nFROM inventory\nGROUP BY store_id\nORDER BY total_units DESC;",
          dataset: "retail",
          hint: "All four aggregates share one group; the FILTER one sums only the pressured positions.",
        },
      ],
      terms: [
        { term: "NULL group", definition: "Rows with NULL in the grouping column collect into their own group." },
        { term: "Bucketing", definition: "Turning continuous values into countable bands with a CASE expression." },
        { term: "Small-denominator trap", definition: "Averages over few rows presented with the confidence of many." },
      ],
      mistakes: [
        {
          mistake: "Assuming NULL rows disappear from grouped reports",
          why: "They group together — a NULL bucket appears that surprises unprepared readers.",
          fix: "Expect it, name it in the report ('in progress'), or filter it deliberately with WHERE col IS NOT NULL.",
        },
        {
          mistake: "Percentages against the wrong denominator",
          why: "Dividing by the group's own count always yields 100 percent; shares need the grand total.",
          fix: "Divide by the whole-table total (scalar subquery or a separate total), then sanity-check one row by hand.",
        },
      ],
      takeaways: [
        "NULL forms its own group — visible, not vanished.",
        "CASE expressions turn continuous values into countable buckets.",
        "Shares divide by the grand total; group counts divide by themselves only when you mean 100 percent.",
        "Ship counts beside averages — readers deserve the evidence's weight.",
      ],
      quiz: [
        {
          id: "e-05-q1",
          prompt: "Grouping enrollments by grade, what happens to the rows where grade is NULL?",
          options: [
            { text: "They are dropped from the report", correct: false, feedback: "Nothing is dropped — they collect in their own group." },
            { text: "They form their own NULL group", correct: true, feedback: "Correct — visible as one bucket, usually the in-progress work." },
            { text: "They are divided among the other groups", correct: false, feedback: "Groups form from EQUAL values; NULL equals nothing, so it stands alone." },
          ],
          explanation: "NULL groups with NULL — a bucket for the unknown, which for enrollments is exactly the current term.",
        },
        {
          id: "e-05-q2",
          prompt: "A report shows 'avg rating 4.67' for one category and '3.75' for another. What does the honest version add?",
          options: [
            { text: "Nothing — averages speak for themselves", correct: false, feedback: "Averages speak with very different confidence at different counts." },
            { text: "The count behind each average, so readers can weigh the evidence", correct: true, feedback: "Correct — 4.67 over 3 ratings is anecdote; 3.75 over 300 is a fact." },
            { text: "The minimum and maximum", correct: false, feedback: "Useful, but the n is the load-bearing number for confidence." },
          ],
          explanation: "Counts beside averages — the small-denominator defense — is the professional's default pairing.",
        },
      ],
    },

    {
      slug: "e-06",
      title: "Practice: the reporting desk",
      minutes: 14,
      summary: "Real reporting questions across four databases — grouping, HAVING, FILTER and honest percentages, end to end.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Translate reporting requests into grouped queries",
        "Choose WHERE vs HAVING correctly under time pressure",
        "Build side-by-side subset metrics with FILTER",
        "Self-check denominators and counts before shipping",
      ],
      why: "The reporting desk is where aggregation becomes a job skill: a stakeholder asks, you deliver a precise table in minutes. This lesson drills the full translation — request to query to verified output — across four databases, with the judgment calls (which clause, which denominator, what the NULL group means) that separate a report from a row dump.",
      blocks: [
        {
          kind: "text",
          text: "Five requests, five labs. Same discipline as c-07: try each query yourself before studying the provided one, and read every output like the person who will act on it.",
        },
        {
          kind: "lab",
          title: "Request 1 — The order-status digest (ecommerce)",
          task: "'How are orders doing?' — one row per status: count and total value, biggest revenue first. Then say in a comment which statuses the business should worry about.",
          code: "SELECT status, count(*) AS orders,\n       round(sum(total), 2) AS value\nFROM orders\nGROUP BY status\nORDER BY value DESC;",
          dataset: "ecommerce",
          hint: "The two pending orders and three cancelled ones are the digest's real story — revenue is not the only column worth reading.",
        },
        {
          kind: "lab",
          title: "Request 2 — The heavy departments (hr)",
          task: "'Which departments carry more than 5 current employees?' — dept_id, headcount, total payroll (2 decimals), only the heavy ones, heaviest first. WHERE vs HAVING is the whole exercise.",
          code: "SELECT dept_id, count(*) AS headcount,\n       round(sum(salary), 2) AS payroll\nFROM employees\nWHERE terminated IS NULL\nGROUP BY dept_id\nHAVING count(*) > 5\nORDER BY headcount DESC;",
          dataset: "hr",
          hint: "'Current' is a row condition (WHERE); 'more than 5' is a group condition (HAVING).",
        },
        {
          kind: "lab",
          title: "Request 3 — The conversion funnel (ecommerce)",
          task: "'Of all customers, how many ever ordered — and what share is that?' One row: customers (count of all), buyers (count of customers appearing in orders — use count(DISTINCT customer_id) over the orders join, the shape from Part C's previews is not needed: compute buyers separately), buyers_pct (1 decimal). Two queries in one statement are impossible — so: one SELECT with a scalar subquery for the total: SELECT (SELECT count(*) FROM customers) AS customers, count(DISTINCT customer_id) AS buyers, round(100.0 * count(DISTINCT customer_id) / (SELECT count(*) FROM customers), 1) AS buyers_pct FROM orders;",
          code: "SELECT (SELECT count(*) FROM customers) AS customers,\n       count(DISTINCT customer_id) AS buyers,\n       round(100.0 * count(DISTINCT customer_id) / (SELECT count(*) FROM customers), 1) AS buyers_pct\nFROM orders;",
          dataset: "ecommerce",
          hint: "The scalar subquery in the SELECT list is Part G's preview — here it supplies the denominator. 18 of 20 customers converted: 90 percent.",
        },
        {
          kind: "lab",
          title: "Request 4 — The abnormal-lab scorecard (hospital)",
          task: "'Lab quality by department, with counts' — one row per department (group by the admissions' dept_id): lab_tests, abnormal, abnormal_pct (1 decimal), worst first. Every FILTER lesson, in one report.",
          code: "SELECT a.dept_id,\n       count(*) AS lab_tests,\n       count(*) FILTER (WHERE lr.is_abnormal) AS abnormal,\n       round(100.0 * count(*) FILTER (WHERE lr.is_abnormal) / count(*), 1) AS abnormal_pct\nFROM lab_results lr\nJOIN admissions a ON a.admission_id = lr.admission_id\nGROUP BY a.dept_id\nORDER BY abnormal_pct DESC;",
          dataset: "hospital",
          hint: "The join reaches lab results to their departments — Part F teaches it, you have used its shape three times now. The percentage is the FILTER pattern with the 100.0 guard.",
        },
        {
          kind: "lab",
          title: "Request 5 — The supplier spend table (retail)",
          task: "'Spend per supplier, cancelled orders excluded, only suppliers we have actually spent with' — one row per supplier with orders and spend (2 decimals), biggest spenders first. This is the case study's supplier-concentration report in miniature.",
          code: "SELECT supplier_id, count(*) AS orders,\n       round(sum(total_cost) FILTER (WHERE status <> 'cancelled'), 2) AS spend\nFROM purchase_orders\nGROUP BY supplier_id\nHAVING count(*) FILTER (WHERE status <> 'cancelled') > 0\nORDER BY spend DESC;",
          dataset: "retail",
          hint: "FILTER inside both the SELECT and the HAVING — the same lens, applied to summing and to group-keeping.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The desk's three questions",
          text: "Before shipping any grouped report: are the denominators right? Do the counts travel with the averages? And what does each NULL group mean in business language? Answer all three and your tables earn trust.",
        },
      ],
      terms: [
        { term: "Reporting desk", definition: "The translation workflow: stakeholder request, precise query, verified output." },
        { term: "Conversion share", definition: "A subset count over the total count — the FILTER-plus-denominator pattern." },
        { term: "Hand-check", definition: "Verifying one output row by hand (arithmetic, denominator) before shipping a report." },
      ],
      mistakes: [
        {
          mistake: "Delivering a table nobody can act on",
          why: "Raw groups without percentages, counts or labels answer a query, not the question.",
          fix: "Every report ships with its n, its shares and its obvious next decision.",
        },
        {
          mistake: "Skipping the self-check on denominators",
          why: "One wrong total and every percentage in the table lies consistently.",
          fix: "Hand-verify one row's arithmetic before sending anything.",
        },
      ],
      takeaways: [
        "Requests become reports: group, aggregate, filter groups, share the totals.",
        "WHERE for rows, HAVING for groups — under pressure, say the pipeline aloud.",
        "FILTER builds subset metrics; scalar subqueries supply grand totals.",
        "Counts, shares and labeled NULL groups are what make a table trustworthy.",
      ],
      quiz: [
        {
          id: "e-06-q1",
          prompt: "'Current employees, only departments over 5 people' — where does each condition go?",
          options: [
            { text: "Both in WHERE", correct: false, feedback: "'Over 5 people' is about the group's count — WHERE cannot see it." },
            { text: "terminated IS NULL in WHERE; count(*) > 5 in HAVING", correct: true, feedback: "Correct — row fact early, group fact late." },
            { text: "Both in HAVING", correct: false, feedback: "HAVING would work but reads wrong and optimizes worse — WHERE is for rows." },
          ],
          explanation: "The pipeline decides: rows first (WHERE), groups after (HAVING). Say it aloud on every report.",
        },
        {
          id: "e-06-q2",
          prompt: "Your funnel report shows 20 customers and 20 buyers, but you know two never ordered. Most likely cause?",
          options: [
            { text: "count(*) counted the wrong thing — buyers counted rows of customers, not distinct buyers", correct: true, feedback: "Correct — distinct buyers need count(DISTINCT customer_id) over the orders." },
            { text: "PostgreSQL lost two rows", correct: false, feedback: "Engines do not lose rows; queries miscount them." },
            { text: "The two customers are hidden", correct: false, feedback: "The bug is in the buyers count, not visibility." },
          ],
          explanation: "Counting customer-id occurrences in orders counts ORDERS, not customers — DISTINCT collapses them to people. Denominator and numerator both deserve a hand-check.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "e-b1",
      tier: "beginner",
      mode: "sql",
      title: "How many products per category",
      prompt: "Merchandising wants the product count per category: return category_id and products (the count), one row per category, sorted by products descending then category_id. Expected columns: category_id, products — eight rows, one per category.",
      dataset: "ecommerce",
      sampleTables: ["products", "categories"],
      hint: "GROUP BY category_id with count(*).",
      starter: "SELECT category_id, count(*) AS products\nFROM products\n",
      solution: `SELECT category_id, count(*) AS products
FROM products
GROUP BY category_id
ORDER BY products DESC, category_id;`,
      ordered: true,
      expected: { columns: ["category_id", "products"], rows: [
        ["1", "5"],
        ["2", "5"],
        ["8", "4"],
        ["3", "3"],
        ["4", "3"],
        ["5", "3"],
        ["7", "3"],
        ["6", "2"],
      ] },
      explanation:
        "The groups are the categories; count(*) collapses each group's products. Laptops and Accessories lead; the tiebreaker makes the order stable. Category names join in with Part F — today the id is the label.",
      concepts: ["GROUP BY", "count"],
    },
    {
      id: "e-b2",
      tier: "beginner",
      mode: "sql",
      title: "The payroll digest",
      prompt: "One row summarizing HeliosWorks' CURRENT staff (terminated IS NULL): staff (count of rows), total_payroll (sum of salary, 2 decimals) and average_salary (avg of salary, 2 decimals). Expected columns: staff, total_payroll, average_salary — one row.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "A bare aggregate over the whole filtered table — no GROUP BY needed.",
      starter: "SELECT count(*) AS staff,\n       -- total and average here\nFROM employees\nWHERE terminated IS NULL;\n",
      solution: `SELECT count(*) AS staff,
       round(sum(salary), 2) AS total_payroll,
       round(avg(salary), 2) AS average_salary
FROM employees
WHERE terminated IS NULL;`,
      ordered: false,
      expected: { columns: ["staff", "total_payroll", "average_salary"], rows: [
        ["28", "4450000.00", "158928.57"],
      ] },
      explanation:
        "Without GROUP BY, the aggregates see the whole filtered table: 28 current staff, $1,862,000 of payroll, $66,500 average. The WHERE runs first — the two departed employees never reach the aggregates.",
      concepts: ["aggregates", "round", "WHERE before aggregation"],
    },
    {
      id: "e-b3",
      tier: "beginner",
      mode: "sql",
      title: "Students per enrollment year",
      prompt: "The registrar wants cohort sizes for the curriculum committee: one row per enrollment_year with students (the count of students who enrolled that year), earliest year first. The committee reads it as the intake trend — from the two-student pioneer cohort of 2020 to this year's fresh arrivals. Expected columns: enrollment_year, students — seven rows, 2020 through 2026.",
      dataset: "university",
      sampleTables: ["students"],
      hint: "GROUP BY enrollment_year, ORDER BY enrollment_year.",
      starter: "SELECT enrollment_year, count(*) AS students\nFROM students\n",
      solution: `SELECT enrollment_year, count(*) AS students
FROM students
GROUP BY enrollment_year
ORDER BY enrollment_year;`,
      ordered: true,
      expected: { columns: ["enrollment_year", "students"], rows: [
        ["2020", "2"],
        ["2021", "3"],
        ["2022", "4"],
        ["2023", "4"],
        ["2024", "4"],
        ["2025", "3"],
        ["2026", "2"],
      ] },
      explanation:
        "Cohorts 2020 through 2026 emerge one row each — the tiny 2020 cohort (2) and the fresh 2026 one (2) bookend the pattern. Grouping by a numeric column works exactly like grouping by text: equal values collect.",
      concepts: ["GROUP BY", "cohort analysis"],
    },
    {
      id: "e-b4",
      tier: "beginner",
      mode: "sql",
      title: "NULL group, observed",
      prompt: "Group ALL enrollments (no filtering) by grade, returning grade and enrollments (the count), with the NULL group FIRST (ORDER BY grade NULLS FIRST). Expected columns: grade, enrollments — the NULL group (in-progress) plus one row per letter grade A, B, C.",
      dataset: "university",
      sampleTables: ["enrollments"],
      hint: "NULLS FIRST in the ORDER BY; the NULL group needs no WHERE — in-progress rows stay.",
      starter: "SELECT grade, count(*) AS enrollments\nFROM enrollments\n",
      solution: `SELECT grade, count(*) AS enrollments
FROM enrollments
GROUP BY grade
ORDER BY grade NULLS FIRST;`,
      ordered: true,
      expected: { columns: ["grade", "enrollments"], rows: [
        [null, "6"],
        ["A", "24"],
        ["B", "27"],
        ["C", "6"],
      ] },
      explanation:
        "The NULL group leads: the current 2026F term's in-progress enrollments, collected in one honest bucket. Letter grades follow. Reports that filter NULLs silently hide work in flight; reports that show it earn trust.",
      concepts: ["NULL group", "NULLS FIRST", "GROUP BY"],
    },
    {
      id: "e-i1",
      tier: "intermediate",
      mode: "sql",
      title: "Departments over three people",
      prompt: "Which departments have MORE than 3 current employees? Return dept_id, headcount (count) and payroll (sum of salary, 2 decimals), only departments with more than 3 current staff, largest headcount first. Expected columns: dept_id, headcount, payroll.",
      dataset: "hr",
      sampleTables: ["employees", "departments"],
      hint: "WHERE terminated IS NULL (row), HAVING count(*) > 3 (group).",
      starter: "SELECT dept_id, count(*) AS headcount,\n       -- payroll\nFROM employees\n",
      solution: `SELECT dept_id, count(*) AS headcount,
       round(sum(salary), 2) AS payroll
FROM employees
WHERE terminated IS NULL
GROUP BY dept_id
HAVING count(*) > 3
ORDER BY headcount DESC;`,
      ordered: true,
      expected: { columns: ["dept_id", "headcount", "payroll"], rows: [
        ["2", "12", "1862000.00"],
        ["3", "5", "849000.00"],
        ["4", "4", "574000.00"],
      ] },
      explanation:
        "The two-clause drill: WHERE prunes departed employees (rows), HAVING keeps departments over three (groups). Engineering's twelve and Product's five survive; everyone else drops out after the count.",
      concepts: ["HAVING", "WHERE vs HAVING", "group filtering"],
    },
    {
      id: "e-i2",
      tier: "intermediate",
      mode: "sql",
      title: "The abnormal share",
      prompt: "Hospital quality: one row with lab_tests (count of all lab results), abnormal (count where is_abnormal), and abnormal_pct (the share as a percentage, 1 decimal, using the 100.0 guard). Expected columns: lab_tests, abnormal, abnormal_pct — one row.",
      dataset: "hospital",
      sampleTables: ["lab_results"],
      hint: "Two counts (one FILTERed) plus the percentage — lesson e-04's first pattern.",
      starter: "SELECT count(*) AS lab_tests,\n       -- abnormal and pct\nFROM lab_results;\n",
      solution: `SELECT count(*) AS lab_tests,
       count(*) FILTER (WHERE is_abnormal) AS abnormal,
       round(100.0 * count(*) FILTER (WHERE is_abnormal) / count(*), 1) AS abnormal_pct
FROM lab_results;`,
      ordered: false,
      expected: { columns: ["lab_tests", "abnormal", "abnormal_pct"], rows: [
        ["34", "22", "64.7"],
      ] },
      explanation:
        "One pass, three numbers: every test, the abnormal subset, their share. The 100.0 keeps the division honest — the same guard from Part C, now doing aggregate duty. The board sees a rate, not raw counts it must divide itself.",
      concepts: ["FILTER", "percentage", "conditional counting"],
    },
    {
      id: "e-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Active versus inactive accounts",
      prompt: "Per account_type: accounts (count of all), active (count where is_active), inactive (count where NOT is_active) — one row per type, most accounts first, tie by account_type. Expected columns: account_type, accounts, active, inactive.",
      dataset: "banking",
      sampleTables: ["accounts"],
      hint: "Two FILTER counts beside the plain count, all in one GROUP BY.",
      starter: "SELECT account_type, count(*) AS accounts,\n       -- active and inactive\nFROM accounts\n",
      solution: `SELECT account_type, count(*) AS accounts,
       count(*) FILTER (WHERE is_active) AS active,
       count(*) FILTER (WHERE NOT is_active) AS inactive
FROM accounts
GROUP BY account_type
ORDER BY accounts DESC, account_type;`,
      ordered: true,
      expected: { columns: ["account_type", "accounts", "active", "inactive"], rows: [
        ["checking", "19", "19", "0"],
        ["savings", "9", "8", "1"],
        ["business", "2", "2", "0"],
        ["cd", "1", "1", "0"],
      ] },
      explanation:
        "Each aggregate gets its own lens: the closed savings account shows as the one inactive row among savings. Side-by-side subsets in one pass is FILTER's signature move — the CASE-inside-count spelling gives the same numbers with more noise.",
      concepts: ["FILTER", "subsets", "GROUP BY"],
    },
    {
      id: "e-i4",
      tier: "intermediate",
      mode: "sql",
      title: "Order value by status",
      prompt: "For the order statuses that have at least 3 orders: status, orders (count) and value (sum of total, 2 decimals), highest value first. Statuses with fewer than 3 orders are excluded. Expected columns: status, orders, value.",
      dataset: "ecommerce",
      sampleTables: ["orders"],
      hint: "HAVING count(*) >= 3 does the group filtering.",
      starter: "SELECT status, count(*) AS orders,\n       -- value\nFROM orders\n",
      solution: `SELECT status, count(*) AS orders,
       round(sum(total), 2) AS value
FROM orders
GROUP BY status
HAVING count(*) >= 3
ORDER BY value DESC;`,
      ordered: true,
      expected: { columns: ["status", "orders", "value"], rows: [
        ["delivered", "36", "20612.00"],
        ["cancelled", "3", "1447.00"],
        ["shipped", "3", "776.00"],
      ] },
      explanation:
        "Delivered dominates at 36 orders and the largest value; paid and shipped pass the 3-order bar; pending (2) and cancelled (3)... cancelled has exactly 3 and stays. The HAVING threshold is a business choice — say it in the report's title so nobody wonders where pending went.",
      concepts: ["HAVING", "sum", "report scoping"],
    },
    {
      id: "e-a1",
      tier: "advanced",
      mode: "sql",
      title: "The money-in money-out report",
      prompt: "The full channel report from lesson e-04, but on YOUR query: per channel, deposits (count of deposit transactions), deposited (sum, 2 decimals), withdrawals (count) and withdrawn (sum, 2 decimals), sorted by deposited descending with NULLs last. Channels with no deposits show NULL deposited. Expected columns: channel, deposits, deposited, withdrawals, withdrawn.",
      dataset: "banking",
      sampleTables: ["transactions"],
      hint: "Four FILTER aggregates over one GROUP BY channel; NULLS LAST for the deposit-less channels.",
      starter: "SELECT channel,\n       -- deposits, deposited, withdrawals, withdrawn\nFROM transactions\n",
      solution: `SELECT channel,
       count(*) FILTER (WHERE txn_type = 'deposit') AS deposits,
       round(sum(amount) FILTER (WHERE txn_type = 'deposit'), 2) AS deposited,
       count(*) FILTER (WHERE txn_type = 'withdrawal') AS withdrawals,
       round(sum(amount) FILTER (WHERE txn_type = 'withdrawal'), 2) AS withdrawn
FROM transactions
GROUP BY channel
ORDER BY deposited DESC NULLS LAST;`,
      ordered: true,
      expected: { columns: ["channel", "deposits", "deposited", "withdrawals", "withdrawn"], rows: [
        ["branch", "39", "121512.40", "2", "4350.00"],
        ["mobile", "7", "3850.00", "0", null],
        ["online", "0", null, "35", "60256.20"],
        ["atm", "0", null, "6", "3690.00"],
      ] },
      explanation:
        "Money arrives at branches and on mobile; it leaves online and at ATMs — the whole story in five rows. NULL deposited for online and ATM is correct arithmetic (sum of nothing), and NULLS LAST parks them honestly. This exact report is the banking case study's third question.",
      concepts: ["FILTER", "NULLS LAST", "channel analysis"],
    },
    {
      id: "e-a2",
      tier: "advanced",
      mode: "sql",
      title: "The conversion share, precisely",
      prompt: "One row, three numbers: customers (the total count of customers), buyers (count of DISTINCT customers appearing in orders), and buyers_pct (the share, 1 decimal, 100.0 guard). Use a scalar subquery for the total customers, as the lesson's funnel did. Expected columns: customers, buyers, buyers_pct — one row: 20, 18, 90.0.",
      dataset: "ecommerce",
      sampleTables: ["customers", "orders"],
      hint: "FROM orders with count(DISTINCT customer_id); the denominator is (SELECT count(*) FROM customers).",
      starter: "SELECT (SELECT count(*) FROM customers) AS customers,\n       -- buyers and pct\nFROM orders;\n",
      solution: `SELECT (SELECT count(*) FROM customers) AS customers,
       count(DISTINCT customer_id) AS buyers,
       round(100.0 * count(DISTINCT customer_id) / (SELECT count(*) FROM customers), 1) AS buyers_pct
FROM orders;`,
      ordered: false,
      expected: { columns: ["customers", "buyers", "buyers_pct"], rows: [
        ["20", "18", "90.0"],
      ] },
      explanation:
        "18 of 20 customers converted — 90 percent. The two never-buyers (Lucia Moreno, Mina Tanaka) are the funnel's residual, and the next report would ask who they are. Numerator (distinct buyers over orders), denominator (all customers), guard (100.0): the conversion pattern complete.",
      concepts: ["count DISTINCT", "scalar subquery", "conversion share"],
    },
    {
      id: "e-a3",
      tier: "advanced",
      mode: "sql",
      title: "Price bands with shares",
      prompt: "Bucket ShopSphere products into price bands with a CASE — 'budget' under 50, 'mid-range' 50 up to (but not including) 150, 'premium' 150 and above — then return price_band, products (count), avg_price (average price in the band, 2 decimals) and share_pct (the band's share of ALL products, 1 decimal, via a scalar subquery total). Sort by products descending. Expected columns: price_band, products, avg_price, share_pct.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "The CASE appears identically in SELECT and GROUP BY (or GROUP BY 1); the share denominator is (SELECT count(*) FROM products).",
      starter: "SELECT CASE WHEN price < 50 THEN 'budget'\n            WHEN price < 150 THEN 'mid-range'\n            ELSE 'premium' END AS price_band,\n       -- counts, average, share\nFROM products\n",
      solution: `SELECT CASE WHEN price < 50 THEN 'budget'
            WHEN price < 150 THEN 'mid-range'
            ELSE 'premium' END AS price_band,
       count(*) AS products,
       round(avg(price), 2) AS avg_price,
       round(100.0 * count(*) / (SELECT count(*) FROM products), 1) AS share_pct
FROM products
GROUP BY 1
ORDER BY products DESC;`,
      ordered: true,
      expected: { columns: ["price_band", "products", "avg_price", "share_pct"], rows: [
        ["premium", "15", "799.00", "53.6"],
        ["mid-range", "10", "97.00", "35.7"],
        ["budget", "3", "39.00", "10.7"],
      ] },
      explanation:
        "Bucketing (the CASE), grouping (GROUP BY 1 — the first output column), aggregation per band, and a share against the grand total via scalar subquery: four Part E ideas in one report. GROUP BY 1 references the output position, sparing you from repeating the CASE text.",
      concepts: ["bucketing", "GROUP BY 1", "shares", "scalar subquery"],
    },
    {
      id: "e-a4",
      tier: "advanced",
      mode: "sql",
      title: "The trustworthy average",
      prompt: "Professors' average salaries carry different evidence: build a per-rank report with its weights. For each title (assistant, associate, full): professors (count), avg_salary (2 decimals) and share_pct of ALL professors (1 decimal, scalar-subquery denominator). Then keep ONLY ranks averaging over $110,000 (HAVING on the average). Sort by avg_salary descending. Expected columns: title, professors, avg_salary, share_pct.",
      dataset: "university",
      sampleTables: ["professors"],
      hint: "GROUP BY title; HAVING avg(salary) > 110000; the denominator is (SELECT count(*) FROM professors).",
      starter: "SELECT title, count(*) AS professors,\n       -- avg, share\nFROM professors\n",
      solution: `SELECT title, count(*) AS professors,
       round(avg(salary), 2) AS avg_salary,
       round(100.0 * count(*) / (SELECT count(*) FROM professors), 1) AS share_pct
FROM professors
GROUP BY title
HAVING avg(salary) > 110000
ORDER BY avg_salary DESC;`,
      ordered: true,
      expected: { columns: ["title", "professors", "avg_salary", "share_pct"], rows: [
        ["full", "4", "151000.00", "33.3"],
        ["associate", "4", "126000.00", "33.3"],
      ] },
      explanation:
        "Full professors average $151,800 over 5 people (41.7 percent of faculty), associates $125,750 over 4 (33.3 percent) — assistants average $99,750 and drop out at the HAVING gate. Every average ships with its n and its share: the e-05 trust rules, applied to a salary table where confidence matters.",
      concepts: ["HAVING on averages", "counts with averages", "shares"],
    },
  ],

  assessment: [
    {
      id: "e-as-1",
      prompt: "count(phone) on 20 rows with 3 NULL phones returns...",
      options: [
        { text: "20", correct: false, feedback: "That is count(*) — rows, regardless of values." },
        { text: "17 — NULLs are skipped", correct: true, feedback: "Correct — value counts skip the unknowns." },
        { text: "3", correct: false, feedback: "That would need a WHERE phone IS NULL count." },
      ],
      explanation: "Aggregates skip NULLs: count(phone) counts the 17 known phones.",
    },
    {
      id: "e-as-2",
      prompt: "The grouped-or-aggregated rule says...",
      options: [
        { text: "Every SELECT-list column must be grouped or inside an aggregate", correct: true, feedback: "Correct — bare ungrouped columns are refused." },
        { text: "Every aggregate must appear in GROUP BY", correct: false, feedback: "Inverted — aggregates never group; they summarize groups." },
        { text: "GROUP BY requires ORDER BY", correct: false, feedback: "Sorting is separate and optional." },
      ],
      explanation: "The rule kills ambiguity: a group holds many values of any ungrouped column, so PostgreSQL refuses to pick one.",
    },
    {
      id: "e-as-3",
      prompt: "Which condition needs HAVING?",
      options: [
        { text: "price > 100 per row", correct: false, feedback: "Row condition — WHERE." },
        { text: "sum(total) > 10000 per customer group", correct: true, feedback: "Correct — a group's aggregate, HAVING's job." },
        { text: "status = 'pending'", correct: false, feedback: "Row condition again — WHERE." },
      ],
      explanation: "Aggregate conditions exist only after grouping — HAVING territory.",
    },
    {
      id: "e-as-4",
      prompt: "In a grouped query, WHERE runs...",
      options: [
        { text: "After HAVING", correct: false, feedback: "Rows filter first — HAVING comes later." },
        { text: "Before GROUP BY, on individual rows", correct: true, feedback: "Correct — the pipeline: WHERE, GROUP BY, aggregates, HAVING." },
        { text: "Interleaved with the aggregates", correct: false, feedback: "The pipeline is strictly ordered." },
      ],
      explanation: "WHERE sees rows only; groups and aggregates do not exist yet when it runs.",
    },
    {
      id: "e-as-5",
      prompt: "count(*) FILTER (WHERE city = 'Austin') counts...",
      options: [
        { text: "All rows", correct: false, feedback: "The filter narrows to its subset." },
        { text: "Only the rows whose city is Austin", correct: true, feedback: "Correct — a private WHERE for this one aggregate." },
        { text: "Rows that are NOT in Austin", correct: false, feedback: "That would need WHERE city <> 'Austin' or NOT (...)." },
      ],
      explanation: "FILTER gives one aggregate its own lens — subsets side by side in a single query.",
    },
    {
      id: "e-as-6",
      prompt: "Why multiply by 100.0 instead of 100 in percentage formulas?",
      options: [
        { text: "100.0 is a decimal literal, preventing integer truncation in the division", correct: true, feedback: "Correct — the integer-division guard." },
        { text: "It rounds automatically", correct: false, feedback: "round() rounds; 100.0 only keeps decimals alive." },
        { text: "It is required syntax", correct: false, feedback: "Both compile — only one keeps your decimals." },
      ],
      explanation: "Integer 100 times integers divides as integer math; 100.0 forces decimal arithmetic end to end.",
    },
    {
      id: "e-as-7",
      prompt: "Grouping by grade, the rows with NULL grade...",
      options: [
        { text: "Vanish from the output", correct: false, feedback: "Nothing vanishes — they collect." },
        { text: "Form their own NULL group", correct: true, feedback: "Correct — the in-progress bucket, visible and honest." },
        { text: "Are split among letter groups", correct: false, feedback: "NULL equals nothing, so it groups alone." },
      ],
      explanation: "NULL groups with NULL: one bucket for the unknown — name it in your report.",
    },
    {
      id: "e-as-8",
      prompt: "The honest way to present an average over 3 rows next to one over 300 is...",
      options: [
        { text: "Round both to 2 decimals", correct: false, feedback: "Rounding hides nothing about evidence weight." },
        { text: "Show the count beside every average", correct: true, feedback: "Correct — the n travels with the mean." },
        { text: "Drop small groups", correct: false, feedback: "Sometimes right — but readers deserve to see them with their counts first." },
      ],
      explanation: "Counts beside averages let readers weigh evidence — the small-denominator defense.",
    },
  ],

  project: {
    title: "The Stakeholder Report Pack",
    brief:
      "You have just joined a company (your pick of the six sample databases) as its first analyst. Your manager asks for a 'report pack' — a set of grouped queries answering the business's standing questions, each one-shippable. You will deliver eight queries: cohort counts, per-group totals, a HAVING-filtered exception list, a FILTER-based subset scorecard, a percentage report with its scalar-subquery denominator, an honest averages-with-counts table, a NULL-group report with its business meaning written out, and one query of your own invention that answers a question nobody asked yet. Every output verified in the Lab, every denominator hand-checked.",
    requirements: [
      "Eight queries over ONE chosen database, each preceded by a comment stating the business question",
      "At least four use GROUP BY (one with multiple grouping columns or a CASE bucket)",
      "At least one uses HAVING to surface exceptions (state the threshold and why)",
      "At least two use FILTER for subset metrics (e.g. active/inactive, abnormal/normal, in/out)",
      "At least one percentage report with the total in a scalar subquery — hand-check one row's arithmetic",
      "Every average ships beside its count (the trust rule)",
      "The one query you invented, with a comment on what decision it informs",
    ],
    steps: [
      "Pick your database and list its tables' columns in the Lab's schema explorer — know your facts before questioning.",
      "Draft the eight business questions in plain words FIRST (comments), before any SQL.",
      "Translate each with the pipeline mantra: rows (WHERE), groups (GROUP BY), aggregates, group filter (HAVING), order, limit.",
      "Run and read every output; fix the query or the question until they agree.",
      "Hand-check the percentage row: calculator, denominator, share.",
      "Order the pack from most fundamental (how many) to most original (your invention) — it becomes your first deliverable.",
    ],
    starter: `-- The Stakeholder Report Pack (Part E mini project)
-- Database chosen: ???

-- R1 (how many): ???
-- R2 (per-group totals): ???
-- R3 (multiple grouping columns or CASE buckets): ???
-- R4 (HAVING exceptions, threshold stated): ???
-- R5 (FILTER subset scorecard): ???
-- R6 (FILTER subset scorecard, second): ???
-- R7 (percentage with scalar-subquery total, hand-checked): ???
-- R8 (averages WITH counts — the trust rule): ???
-- R9 (your invention — the question nobody asked): ???
--   Decision it informs: ???`,
    concepts: ["GROUP BY", "HAVING", "FILTER", "percentages", "trust rules", "reporting"],
    extension:
      "Add a tenth query answering the SAME question as R7 but with a WHERE filter applied first (e.g. last-year rows only) — and explain in a comment why the percentage changed. Denominator awareness under filtering is what separates analysts from query-writers.",
  },
};
