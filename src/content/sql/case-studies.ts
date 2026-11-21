/**
 * Real-world SQL case studies — one per sample database.
 *
 * Each case: who you are, what the business needs, the data quirks worth
 * knowing, and 3-5 progressive questions. Every reference solution was
 * executed on real PostgreSQL (PGlite) and its expected output below is
 * the actual result — machine-verified by scripts/verify-sql-outputs.ts.
 */
import type { CaseStudy } from "@/lib/sqlcourse/types";

export const SQL_CASE_STUDIES: CaseStudy[] = [
  /* ================================================================== */
  {
    id: "ecommerce",
    title: "The retention question",
    domain: "E-commerce analytics",
    scenario:
      "You are the first data hire at ShopSphere, an online gear store. The founding team is proud of the catalog and the reviews, but the board asks one uncomfortable question: 'We spent money acquiring 20 customers — are they actually buying, and who is carrying the business?' You have the orders, payments and reviews tables. Your job is to turn them into answers the board can act on: who never converted, who the whales are, and whether the love in the reviews matches the money.",
    context: [
      "Two customers signed up but have never placed an order — finding them is the whole point of the first question.",
      "Cancelled orders still live in the orders table; revenue questions must exclude them.",
      "Every order's total equals the sum of its line items — the data is internally consistent.",
      "Reviews are not tied to purchases: a customer can review a product they never bought here.",
      "order ids are not contiguous (cancelled carts skip numbers) — never assume otherwise.",
    ],
    takeaways: [
      "'Customers who never bought' is the canonical LEFT JOIN ... IS NULL question — it appears in every real e-commerce analytics stack.",
      "Lifetime value means joining orders to customers and aggregating per customer, not per order.",
      "Reviews measure sentiment, not revenue: the two must be joined deliberately to be compared.",
      "Business questions arrive vague ('are they buying?'); your job is to make them precise before writing SQL.",
    ],
    questions: [
      {
        id: "ecommerce-q1",
        title: "Who never converted?",
        problem:
          "The board wants the list of customers who signed up but never placed a single order. Return customer_id, first_name and last_name, sorted by customer_id. (Hint: this is the classic 'rows in A with no match in B' — a LEFT JOIN with an IS NULL check on the right table, or NOT EXISTS.)",
        hint: "LEFT JOIN orders ON the customer id; the customers you want are exactly those whose order columns come back NULL.",
        starter: "SELECT c.customer_id, c.first_name, c.last_name\nFROM customers c\n-- join orders and keep only the customers with no match\n",
        solution: `SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id`,
        ordered: true,
        expected: {
          columns: ["customer_id", "first_name", "last_name"],
          rows: [["17", "Lucia", "Moreno"], ["19", "Mina", "Tanaka"]],
        },
        explanation:
          "The LEFT JOIN keeps every customer and attaches their orders where they exist; customers with no orders keep NULLs on the orders side, which the IS NULL filter isolates. Two customers — Lucia Moreno and Mina Tanaka — signed up but never converted. A professional would immediately ask what channel they came from and whether the acquisition cost was wasted; a NOT EXISTS formulation gives the same rows and often reads more intent-revealing.",
      },
      {
        id: "ecommerce-q2",
        title: "Who carries the business?",
        problem:
          "Rank the top 5 customers by total lifetime spend. Return first_name, last_name, city, orders (the count of their orders) and total_spent (sum of order totals), highest spender first; break ties by customer_id. This is who the board should actually be thinking about when they say 'our customers'.",
        hint: "JOIN customers to orders, GROUP BY the customer, then ORDER BY the aggregated total descending with LIMIT 5.",
        starter:
          "SELECT c.first_name, c.last_name, c.city,\n       count(o.order_id) AS orders,\n       sum(o.total) AS total_spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\n-- group, sort and limit here\n",
        solution: `SELECT c.first_name,
       c.last_name,
       c.city,
       count(o.order_id) AS orders,
       sum(o.total) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.city
ORDER BY total_spent DESC, c.customer_id
LIMIT 5`,
        ordered: true,
        expected: {
          columns: ["first_name", "last_name", "city", "orders", "total_spent"],
          rows: [
            ["Grace", "Kim", "Seattle", "3", "3396.00"],
            ["Victor", "Nguyen", "Houston", "2", "2817.00"],
            ["Tom", "Fletcher", "Denver", "3", "2535.00"],
            ["Owen", "Davis", "Portland", "2", "2347.00"],
            ["Sofia", "Rossi", "Boston", "3", "2297.00"],
          ],
        },
        explanation:
          "One row per customer requires collapsing the joined orders: GROUP BY the customer (including customer_id, which is safe and makes the grouping explicit), then aggregate with count and sum. Ordering by the alias total_spent descending puts the biggest spender — Grace Kim of Seattle, three orders, $3,396 — at the top. In a real shop you would exclude cancelled orders first; here Grace's orders are all delivered, so she survives that stricter filter too.",
      },
      {
        id: "ecommerce-q3",
        title: "Dead stock",
        problem:
          "Merchandising wants to know which products have never been ordered by anyone — dead stock tying up cash. Return product_id, name, brand and price, sorted by product_id.",
        hint: "'Never ordered' means no row in order_items references the product: NOT EXISTS over order_items.",
        starter: "SELECT p.product_id, p.name, p.brand, p.price\nFROM products p\n-- which products have no row in order_items?\n",
        solution: `SELECT p.product_id, p.name, p.brand, p.price
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.product_id = p.product_id
)
ORDER BY p.product_id`,
        ordered: true,
        expected: {
          columns: ["product_id", "name", "brand", "price"],
          rows: [
            ["5", "BudgetBook 11 Everyday", "ClearLane", "399.00"],
            ["19", "RacingWheel GT Set", "PlayWorks", "299.00"],
          ],
        },
        explanation:
          "NOT EXISTS asks, row by row over products: is there even one order_item pointing at this product? Where the answer is no, the product stays. Two products have never sold: the BudgetBook 11 laptop (a crowded price segment) and the RacingWheel GT Set (a niche accessory). The merchandise team now has a concrete conversation: reprice, bundle, or write them off.",
      },
      {
        id: "ecommerce-q4",
        title: "Does sentiment match the money?",
        problem:
          "The board believes the Audio category is the heart of the store. Check it: for every category, return category (its name), reviews (the number of reviews on products in that category) and avg_stars (average stars rounded to 2 decimals). Sort by review count descending, then category name. Use LEFT joins so categories with products but no reviews still appear.",
        hint: "Three tables this time: categories -> products -> reviews. count(r.review_id) counts reviews, not rows, so NULLs from missing reviews are handled correctly.",
        starter:
          "SELECT cat.name AS category,\n       count(r.review_id) AS reviews,\n       round(avg(r.stars), 2) AS avg_stars\nFROM categories cat\n-- join products, then LEFT JOIN reviews\n",
        solution: `SELECT cat.name AS category,
       count(r.review_id) AS reviews,
       round(avg(r.stars), 2) AS avg_stars
FROM categories cat
JOIN products p ON p.category_id = cat.category_id
LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY cat.name
ORDER BY reviews DESC, cat.name`,
        ordered: true,
        expected: {
          columns: ["category", "reviews", "avg_stars"],
          rows: [
            ["Audio", "9", "4.44"],
            ["Wearables", "6", "4.17"],
            ["Smart Home", "5", "3.40"],
            ["Laptops", "4", "3.75"],
            ["Gaming", "3", "4.00"],
            ["Photography", "3", "4.67"],
            ["Tablets", "3", "4.67"],
            ["Accessories", "2", "4.50"],
          ],
        },
        explanation:
          "Chaining categories to products to reviews collapses into one row per category via GROUP BY. The board's hunch is confirmed and quantified: Audio leads with 9 reviews at 4.44 stars. The interesting counter-story is Smart Home — 5 reviews averaging only 3.40 stars, dragged down by the Guardian Hub's one-star 'dead on arrival' review. Sentiment and sales are different signals; this query puts them side by side.",
      },
      {
        id: "ecommerce-q5",
        title: "The 2026 revenue line",
        problem:
          "Close the case with the monthly 2026 revenue picture: one row per month with month (formatted 'YYYY-MM'), orders (count, excluding cancelled orders) and revenue (sum of totals). Sort by month ascending. This is the line the board will project forward.",
        hint: "date_trunc('month', order_date) groups rows into months; to_char(..., 'YYYY-MM') formats the label. Filter to 2026 and to non-cancelled orders before grouping.",
        starter:
          "SELECT to_char(date_trunc('month', o.order_date), 'YYYY-MM') AS month,\n       count(*) AS orders,\n       sum(o.total) AS revenue\nFROM orders o\n-- filter, then group\n",
        solution: `SELECT to_char(date_trunc('month', o.order_date), 'YYYY-MM') AS month,
       count(*) AS orders,
       sum(o.total) AS revenue
FROM orders o
WHERE o.status <> 'cancelled'
  AND o.order_date >= DATE '2026-01-01'
GROUP BY 1
ORDER BY 1`,
        ordered: true,
        expected: {
          columns: ["month", "orders", "revenue"],
          rows: [
            ["2026-01", "1", "89.00"],
            ["2026-02", "1", "2199.00"],
            ["2026-03", "1", "49.00"],
            ["2026-05", "1", "1798.00"],
            ["2026-07", "1", "129.00"],
            ["2026-08", "1", "29.00"],
            ["2026-09", "1", "549.00"],
            ["2026-10", "1", "2499.00"],
            ["2026-11", "2", "288.00"],
          ],
        },
        explanation:
          "Grouping by date_trunc('month', ...) (referenced as GROUP BY 1, the first output column) collapses each month's orders into one row; to_char renders the 'YYYY-MM' label. The WHERE clause excludes cancelled orders and pins the window to 2026. The picture is lumpy — months with a single $29 order sit next to October's $2,499 StudioBook sale — which is the honest story of a small store: individual whales move the line, exactly what question 2 predicted.",
      },
    ],
  },

  /* ================================================================== */
  {
    id: "hospital",
    title: "The quality review",
    domain: "Hospital operations",
    scenario:
      "You are the data analyst supporting the quality officer at St. Marlowe General. Tomorrow she meets the clinical board with three claims to verify: that the hospital knows exactly who is on its wards right now, that billing is consistent by department, and — the sensitive one — that no patient bounces back through the doors suspiciously soon after being sent home. You get one evening with the admissions, lab results, prescriptions and staff tables to arm her with facts.",
    context: [
      "An admission with discharged_at NULL means the patient is still in the hospital — and bill_total is NULL until discharge, so averages ignore them automatically.",
      "The same patient appears in admissions more than once: repeat visits are normal, but a visit starting within 30 days of the previous discharge is the readmission the board cares about.",
      "One doctor (a recent hire) has never overseen an admission — she should be on the roster, just not as the culprit for anything.",
      "Lab results carry an is_abnormal flag; percentages of abnormal results per department are a standing board metric.",
    ],
    takeaways: [
      "'Currently admitted' is an IS NULL question — open intervals end in NULL, a pattern that appears in every scheduling or event dataset.",
      "Averaging a nullable column (bill_total) quietly skips the NULLs — sometimes that is exactly what you want, and you should say so out loud.",
      "Readmission-within-N-days is a self-join on patient with an interval condition — a classic time-gap pattern.",
      "Aggregates with FILTER give clean per-subset counts (abnormal vs total) in a single pass over the data.",
    ],
    questions: [
      {
        id: "hospital-q1",
        title: "Who is on the wards right now?",
        problem:
          "Give the quality officer tonight's ward list: every admission that is still open (discharged_at is NULL), with admission_id, patient (first and last name as one column), doctor (first and last name as one column), department (its name), room and admitted_at. Sort by admission_id. Names must be joined from three other tables.",
        hint: "Join patients, doctors and departments; concatenate names with ||; filter discharged_at IS NULL.",
        starter:
          "SELECT a.admission_id,\n       p.first_name || ' ' || p.last_name AS patient,\n       -- doctor, department, room, admitted_at\nFROM admissions a\n",
        solution: `SELECT a.admission_id,
       p.first_name || ' ' || p.last_name AS patient,
       d.first_name || ' ' || d.last_name AS doctor,
       dep.name AS department,
       a.room,
       a.admitted_at
FROM admissions a
JOIN patients p ON p.patient_id = a.patient_id
JOIN doctors d ON d.doctor_id = a.doctor_id
JOIN departments dep ON dep.dept_id = a.dept_id
WHERE a.discharged_at IS NULL
ORDER BY a.admission_id`,
        ordered: true,
        expected: {
          columns: ["admission_id", "patient", "doctor", "department", "room", "admitted_at"],
          rows: [
            ["24", "Lucy Ramirez", "Daniel Park", "Pediatrics", "208", "2026-03-30 15:55:00"],
            ["27", "Simon Vasquez", "Gloria Hernandez", "Orthopedics", "111", "2026-09-19 10:35:00"],
            ["28", "Edith Barlow", "Robert Kowalczyk", "General Surgery", "501", "2026-10-08 07:45:00"],
            ["29", "Iris Thornbury", "Isabelle Moreau", "Pediatrics", "206", "2026-11-02 14:15:00"],
          ],
        },
        explanation:
          "Four admissions are open: two in Pediatrics, one in Orthopedics, one in General Surgery. Each name column is stitched together with || from its own joined table, and the IS NULL filter is what makes this 'the ward list' instead of 'the history'. Note the timestamps: Iris Thornbury was admitted on 2026-11-02 — thirteen days ago at the time of writing — which is exactly the kind of length-of-stay fact the board will ask about next.",
      },
      {
        id: "hospital-q2",
        title: "Does billing differ by department?",
        problem:
          "Produce the department-level billing picture: for every department, department (name), admissions (count of admissions ever, including open ones) and avg_bill (average bill_total over discharged admissions only, rounded to 2 decimals). LEFT JOIN so every department appears even with zero admissions. Sort by admissions descending, then department name.",
        hint: "count(a.admission_id) counts admissions even when the LEFT JOIN produces NULLs; avg ignores NULL bill_totals automatically — state that assumption.",
        starter:
          "SELECT dep.name AS department,\n       count(a.admission_id) AS admissions,\n       round(avg(a.bill_total), 2) AS avg_bill\nFROM departments dep\n-- LEFT JOIN admissions\n",
        solution: `SELECT dep.name AS department,
       count(a.admission_id) AS admissions,
       round(avg(a.bill_total), 2) AS avg_bill
FROM departments dep
LEFT JOIN admissions a ON a.dept_id = dep.dept_id
GROUP BY dep.name
ORDER BY admissions DESC, dep.name`,
        ordered: true,
        expected: {
          columns: ["department", "admissions", "avg_bill"],
          rows: [
            ["Cardiology", "8", "13987.50"],
            ["Emergency", "6", "2273.33"],
            ["Pediatrics", "5", "5216.67"],
            ["Neurology", "4", "18050.00"],
            ["Orthopedics", "4", "15316.67"],
            ["General Surgery", "3", "15575.00"],
          ],
        },
        explanation:
          "Cardiology sees the most admissions (8) but Neurology carries the highest average bill ($18,050 — strokes are long, expensive stays), while Emergency's rapid turnaround shows in its $2,273 average. Two honest caveats a professional would state: the average ignores currently-admitted patients (their bills are NULL and AVG skips them), and small counts make averages jumpy — one long stay moves Neurology's number by thousands.",
      },
      {
        id: "hospital-q3",
        title: "The readmission within 30 days",
        problem:
          "The sensitive one. Find every admission that started within 30 days after the same patient's previous discharge. Return admission_id, patient_id, admitted_at and previous_discharge (the earlier stay's discharged_at). Sort by admission_id. (Self-join admissions to itself on patient_id, with the interval condition in the join.)",
        hint:
          "JOIN admissions a1 ON a1.patient_id = a0.patient_id AND a1.admitted_at BETWEEN a0.discharged_at AND a0.discharged_at + INTERVAL '30 days'. Both rows must be real stays, so NULL discharges drop out naturally.",
        starter:
          "FROM admissions a0\nJOIN admissions a1\n  ON a1.patient_id = a0.patient_id\n AND -- the 30-day window condition\n",
        solution: `SELECT a1.admission_id,
       a1.patient_id,
       a1.admitted_at,
       a0.discharged_at AS previous_discharge
FROM admissions a0
JOIN admissions a1
  ON a1.patient_id = a0.patient_id
 AND a1.admitted_at > a0.discharged_at
 AND a1.admitted_at < a0.discharged_at + INTERVAL '30 days'
ORDER BY a1.admission_id`,
        ordered: false,
        expected: {
          columns: ["admission_id", "patient_id", "admitted_at", "previous_discharge"],
          rows: [["30", "1", "2025-03-28 09:00:00", "2025-03-23 10:05:00"]],
        },
        explanation:
          "The self-join pairs every two stays of the same patient and keeps only pairs where the second began inside 30 days of the first ending. Exactly one case exists: admission 30, patient 1 (Margaret Boyle), readmitted on March 28 five days after her March 23 discharge — labeled post-op monitoring. One readmission in a year of data is defensible; the board can now discuss it with the actual dates on the screen, and the query becomes a standing monthly report.",
      },
      {
        id: "hospital-q4",
        title: "Abnormal labs by department",
        problem:
          "The standing quality metric: per department, department (name), lab_tests (count of results), abnormal (count flagged abnormal) and abnormal_pct (percentage, one decimal, computed as 100.0 * abnormal / total). Only departments with lab results should appear. Sort by abnormal_pct descending.",
        hint: "count(*) FILTER (WHERE lr.is_abnormal) counts the abnormal subset in one pass; multiply by 100.0 (not 100) to avoid integer division.",
        starter:
          "SELECT dep.name AS department,\n       count(lr.result_id) AS lab_tests,\n       count(*) FILTER (WHERE lr.is_abnormal) AS abnormal,\n       -- percentage here\nFROM departments dep\n",
        solution: `SELECT dep.name AS department,
       count(lr.result_id) AS lab_tests,
       count(*) FILTER (WHERE lr.is_abnormal) AS abnormal,
       round(100.0 * count(*) FILTER (WHERE lr.is_abnormal) / count(lr.result_id), 1) AS abnormal_pct
FROM departments dep
JOIN admissions a ON a.dept_id = dep.dept_id
JOIN lab_results lr ON lr.admission_id = a.admission_id
GROUP BY dep.name
ORDER BY abnormal_pct DESC`,
        ordered: true,
        expected: {
          columns: ["department", "lab_tests", "abnormal", "abnormal_pct"],
          rows: [
            ["General Surgery", "3", "3", "100.0"],
            ["Pediatrics", "6", "5", "83.3"],
            ["Orthopedics", "4", "3", "75.0"],
            ["Cardiology", "10", "6", "60.0"],
            ["Neurology", "5", "3", "60.0"],
            ["Emergency", "6", "2", "33.3"],
          ],
        },
        explanation:
          "FILTER condenses what would otherwise be a CASE-per-column exercise into readable aggregates. The ranking runs from General Surgery's 100% (3 of 3 — small numbers, all flagged) down to Emergency's 33%. A professional reads this with the denominators attached: Cardiology's 60% rests on 10 tests, Emergency's 33% on 6 — percentages without counts are how quality meetings go wrong.",
      },
      {
        id: "hospital-q5",
        title: "The doctor with no admissions",
        problem:
          "A roster check before the meeting: which doctors have never overseen an admission in this data? Return doctor_id, doctor (first and last name as one column) and department (name). Sort by doctor_id. (This is also a sanity check that the readmission analysis didn't miss anyone.)",
        hint: "NOT EXISTS over admissions keyed on the doctor — the same anti-join pattern as the e-commerce 'never ordered' question.",
        starter:
          "SELECT d.doctor_id,\n       d.first_name || ' ' || d.last_name AS doctor,\n       -- department name\nFROM doctors d\n",
        solution: `SELECT d.doctor_id,
       d.first_name || ' ' || d.last_name AS doctor,
       dep.name AS department
FROM doctors d
JOIN departments dep ON dep.dept_id = d.dept_id
WHERE NOT EXISTS (
    SELECT 1 FROM admissions a WHERE a.doctor_id = d.doctor_id
)
ORDER BY d.doctor_id`,
        ordered: true,
        expected: {
          columns: ["doctor_id", "doctor", "department"],
          rows: [["12", "Fatima Al-Rashid", "General Surgery"]],
        },
        explanation:
          "Exactly one doctor has no admissions: Fatima Al-Rashid — hired 2026-09-01, a month before this data was cut. The anti-join pattern (NOT EXISTS) is identical to finding never-ordered products; only the tables change. Reporting her as 'no admissions' without the hire date would be misleading, which is why a professional always pulls the hire date alongside an anti-join result before drawing conclusions.",
      },
    ],
  },

  /* ================================================================== */
  {
    id: "university",
    title: "The registrar's audit",
    domain: "University operations",
    scenario:
      "It is registration week at Northgate University and the registrar needs ammunition for the curriculum committee. A brand-new course has suspiciously empty seats; the dean wants to know which majors are actually thriving; and a faculty member swears some professors are teaching outside their home department. You have the students, courses, enrollments, prerequisites and professors tables — and one evening to answer all three, precisely.",
    context: [
      "CS 495 (Special Topics: Quantum Computing) was just added for 2026F — nobody has enrolled in it yet.",
      "Freshmen have gpa NULL until they earn grades; AVG(gpa) ignores them, which is the honest way to compute a major's average.",
      "The current term is 2026F: enrollments in it have grade NULL while courses are in progress.",
      "course_prerequisites is a directed graph: a row (A, B) means B must come before A. Chains matter: CS 410 needs CS 340, which needs CS 201, which needs CS 101.",
    ],
    takeaways: [
      "Zero-enrollment checks (NOT EXISTS) catch both data problems and genuine empty seats — always look before reporting.",
      "AVG over a nullable column silently drops NULLs; make that explicit in your headline.",
      "Prerequisite chains are graphs, and recursive CTEs are how SQL walks a graph.",
      "'In progress' is a NULL-grade question — the same open-interval pattern as the hospital's open admissions.",
    ],
    questions: [
      {
        id: "university-q1",
        title: "The empty classroom",
        problem:
          "Which courses have zero enrollments of any kind? Return course_id, code, title and credits, sorted by course_id. The committee will decide whether to cancel, market, or postpone whatever you find.",
        hint: "NOT EXISTS over enrollments on the course id.",
        starter: "SELECT c.course_id, c.code, c.title, c.credits\nFROM courses c\n-- which courses have no enrollments?\n",
        solution: `SELECT c.course_id, c.code, c.title, c.credits
FROM courses c
WHERE NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.course_id = c.course_id
)
ORDER BY c.course_id`,
        ordered: true,
        expected: {
          columns: ["course_id", "code", "title", "credits"],
          rows: [["19", "CS 495", "Special Topics: Quantum Computing", "3"]],
        },
        explanation:
          "Exactly one course has never had a student: CS 495, the just-announced Quantum Computing special topics seminar. That is not a scandal — it is a brand-new course — but the query proves it is the ONLY empty one, which is the fact the committee actually needs. The same NOT EXISTS pattern has now found you empty carts, dead stock and empty classrooms: the shape never changes, only the tables.",
      },
      {
        id: "university-q2",
        title: "Which majors are thriving?",
        problem:
          "Per major department: major (the department code), students (how many students major in it) and avg_gpa (average GPA rounded to 2 decimals — note that freshmen with NULL gpa are excluded from the average by design). Sort by students descending, then major.",
        hint: "JOIN students to departments on major_dept_id, GROUP BY the department code.",
        starter:
          "SELECT d.code AS major,\n       count(s.student_id) AS students,\n       round(avg(s.gpa), 2) AS avg_gpa\nFROM departments d\n",
        solution: `SELECT d.code AS major,
       count(s.student_id) AS students,
       round(avg(s.gpa), 2) AS avg_gpa
FROM departments d
JOIN students s ON s.major_dept_id = d.dept_id
GROUP BY d.code
ORDER BY students DESC, d.code`,
        ordered: true,
        expected: {
          columns: ["major", "students", "avg_gpa"],
          rows: [
            ["CS", "6", "3.44"],
            ["MATH", "4", "3.48"],
            ["BIO", "3", "3.54"],
            ["ECON", "3", "3.58"],
            ["HIST", "3", "3.47"],
            ["PHYS", "3", "3.22"],
          ],
        },
        explanation:
          "CS is the largest major with 6 students — but the smallest is only 3, so this is a small department away from any cliff. ECON tops the averages at 3.58 while PHYS trails at 3.22. The headline caveat: the five freshmen with NULL GPAs are excluded from the averages (AVG skips NULLs), so each department's average covers only students with grades on file — the number to state out loud in the meeting.",
      },
      {
        id: "university-q3",
        title: "Who is mid-course right now?",
        problem:
          "Registration week needs the in-progress list: every enrollment in term 2026F whose grade is still NULL. Return first_name, last_name, code (the course code) and term, sorted by last name. These students cannot drop or graduate until the grades land.",
        hint: "JOIN students and courses for the names; filter term = '2026F' AND grade IS NULL.",
        starter:
          "FROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses c ON c.course_id = e.course_id\n-- filter here\n",
        solution: `SELECT s.first_name, s.last_name, c.code, e.term
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c ON c.course_id = e.course_id
WHERE e.term = '2026F'
  AND e.grade IS NULL
ORDER BY s.last_name`,
        ordered: true,
        expected: {
          columns: ["first_name", "last_name", "code", "term"],
          rows: [
            ["Clara", "Duarte", "HIST 320", "2026F"],
            ["Yuki", "Ono", "MATH 101", "2026F"],
            ["Ravi", "Patel", "ECON 101", "2026F"],
            ["Ingrid", "Sorensen", "HIST 320", "2026F"],
          ],
        },
        explanation:
          "Four students are mid-course: two in the Historical Research Methods seminar, one in Calculus I, one in Microeconomics. The IS NULL grade is the open-interval pattern again — same as the hospital's open admissions, same as any process table with a start but no finish yet. Note that ordering by last name makes the list readable for humans, which is why the exercise asks for it.",
      },
      {
        id: "university-q4",
        title: "What does it take to reach Machine Learning?",
        problem:
          "The crown of the audit: walk the prerequisite graph. Which courses must a student have passed, directly or transitively, before taking CS 410 (Machine Learning)? Return code and title for each course in the chain (CS 410 included), sorted by code. This needs a recursive CTE.",
        hint:
          "Seed the recursion with the CS 410 row, then UNION the prerequisites of everything you have found so far, joining course_prerequisites cp ON cp.course_id = unlock.course_id. Join back to courses for names.",
        starter:
          "WITH RECURSIVE unlock AS (\n    SELECT course_id FROM courses WHERE code = 'CS 410'\n    UNION\n    -- prerequisites of everything found so far\n)\n",
        solution: `WITH RECURSIVE unlock AS (
    SELECT course_id FROM courses WHERE code = 'CS 410'
    UNION
    SELECT cp.prereq_id
    FROM course_prerequisites cp
    JOIN unlock u ON cp.course_id = u.course_id
)
SELECT DISTINCT c.code, c.title
FROM unlock
JOIN courses c ON c.course_id = unlock.course_id
ORDER BY c.code`,
        ordered: false,
        expected: {
          columns: ["code", "title"],
          rows: [
            ["CS 101", "Introduction to Programming"],
            ["CS 201", "Data Structures"],
            ["CS 340", "Algorithms"],
            ["CS 410", "Machine Learning"],
            ["MATH 101", "Calculus I"],
            ["MATH 201", "Linear Algebra"],
          ],
        },
        explanation:
          "The recursive CTE starts at CS 410 and repeatedly asks 'what does the latest batch require?' until nothing new appears. Six courses emerge: the whole CS spine (101 -> 201 -> 340 -> 410) plus the mathematics ladder (MATH 101 -> 201), because CS 410 demands both CS 340 and Linear Algebra. A first-year adviser can now show a student the exact six-course road — computed from the graph, not from a hand-drawn diagram that went stale years ago.",
      },
      {
        id: "university-q5",
        title: "The unassigned professor",
        problem:
          "Finally, the faculty claim: verify whether any professor is listed with no courses to teach at all. Return prof_id, professor (first and last name as one column), title and department (code). Sort by prof_id. (The claim was about teaching OUTSIDE their department — this roster check is the right first move before chasing the juicier version.)",
        hint: "NOT EXISTS over courses keyed on prof_id — the roster pattern, one more time.",
        starter:
          "SELECT p.prof_id,\n       p.first_name || ' ' || p.last_name AS professor,\n       p.title,\n       d.code AS department\nFROM professors p\n",
        solution: `SELECT p.prof_id,
       p.first_name || ' ' || p.last_name AS professor,
       p.title,
       d.code AS department
FROM professors p
JOIN departments d ON d.dept_id = p.dept_id
WHERE NOT EXISTS (
    SELECT 1 FROM courses c WHERE c.prof_id = p.prof_id
)
ORDER BY p.prof_id`,
        ordered: true,
        expected: {
          columns: ["prof_id", "professor", "title", "department"],
          rows: [["7", "Rosa Delgado", "assistant", "PHYS"]],
        },
        explanation:
          "One professor teaches nothing this catalog: Rosa Delgado, an assistant professor of Physics. As for the original claim about teaching outside one's home department — checking it is a one-line variant (join courses and compare department ids), and in this catalog every course is taught in-department, so the rumor dies quietly. Order of operations matter: verify the roster before chasing the gossip.",
      },
    ],
  },

  /* ================================================================== */
  {
    id: "banking",
    title: "The audit trail",
    domain: "Banking compliance",
    scenario:
      "You are the operations analyst at Meridian Trust, a regional bank. An external auditor arrives Monday with four asks: a branch-by-branch exposure summary, a hunt for payments that arrived after loans were already paid off (a genuine data-quality bug), the deposit-vs-withdrawal picture by channel, and a list of customers who have ever been charged a fee. You have branches, accounts, the transaction ledger with running balances, loans and loan payments. Everything must be defensible before the weekend.",
    context: [
      "Every transaction stores balance_after — the running balance of its account — so ledger arithmetic can be independently verified.",
      "Loan 8 was paid off by a large closing payment on 2026-08-12... and then a small payment arrived on 2026-09-12. That is the bug the auditor suspects.",
      "Transactions carry a channel (branch, atm, online, mobile) and a type (deposit, withdrawal, transfer_in, transfer_out, fee) — deposits and transfers_in are money in; withdrawals, transfers_out and fees are money out.",
      "Fees hit accounts as transactions of type 'fee' — fee-paying customers are the bank's unhappy customers.",
    ],
    takeaways: [
      "Exposure summaries are GROUP BY over LEFT JOINs — every branch appears even where activity is thin.",
      "'Payments after payoff' is a data-quality hunt: define the payoff event (the largest payment), then look for activity after it.",
      "FILTER aggregates split deposits from withdrawals in a single pass, per dimension.",
      "Chasing fee-payers means joining customers through accounts to transactions — two hops of keys.",
    ],
    questions: [
      {
        id: "banking-q1",
        title: "Branch exposure",
        problem:
          "The opening exhibit: per branch, branch (name), city, accounts (count) and total_balance (sum of current account balances, 2 decimals). Every branch must appear even if it held no accounts. Sort by total_balance descending.",
        hint: "LEFT JOIN accounts to branches; sum the balance; NULL sums would only appear for zero-account branches.",
        starter:
          "SELECT b.name AS branch,\n       b.city,\n       count(a.account_id) AS accounts,\n       round(sum(a.balance), 2) AS total_balance\nFROM branches b\n",
        solution: `SELECT b.name AS branch,
       b.city,
       count(a.account_id) AS accounts,
       round(sum(a.balance), 2) AS total_balance
FROM branches b
LEFT JOIN accounts a ON a.branch_id = b.branch_id
GROUP BY b.name, b.city
ORDER BY total_balance DESC`,
        ordered: true,
        expected: {
          columns: ["branch", "city", "accounts", "total_balance"],
          rows: [
            ["Downtown", "Springfield", "11", "339891.95"],
            ["Riverside", "Riverton", "7", "56823.20"],
            ["Northgate Uni", "Northgate", "5", "26575.75"],
            ["Lakewood Plaza", "Lakewood", "5", "10278.90"],
            ["Fairview", "Fairview", "3", "1715.37"],
          ],
        },
        explanation:
          "Downtown dominates with 11 accounts and $339,891.95 on deposit — driven by a few large balances (the savings and CD accounts of long-standing customers). The concentration is the exhibit's real message: one branch holds over two-thirds of the bank's deposit total. Every branch appears because the LEFT JOIN preserves branch rows even without accounts — the Fairview branch's three modest accounts still make the table.",
      },
      {
        id: "banking-q2",
        title: "The payment after payoff",
        problem:
          "The auditor's bug hunt. For each loan with status 'paid_off', define the payoff as that loan's largest payment; then find any payment made strictly AFTER the payoff date. Return loan_id, customer (first and last name), paid_on and amount. Sort by loan_id, then paid_on. A CTE that computes each paid-off loan's payoff date, then a join back to payments, keeps this readable.",
        hint:
          "WITH payoff AS (loan_id, max(paid_on) for the largest-amount payment of each paid_off loan) — then join payments where paid_on > payoff_date.",
        starter:
          "WITH payoff AS (\n    SELECT l.loan_id, max(lp.paid_on) AS payoff_date\n    FROM loans l\n    JOIN loan_payments lp ON lp.loan_id = l.loan_id\n    WHERE l.status = 'paid_off'\n      AND lp.amount = (SELECT max(x.amount) FROM loan_payments x WHERE x.loan_id = l.loan_id)\n    GROUP BY l.loan_id\n)\n-- join back to payments and find the stragglers\n",
        solution: `WITH payoff AS (
    SELECT l.loan_id, max(lp.paid_on) AS payoff_date
    FROM loans l
    JOIN loan_payments lp ON lp.loan_id = l.loan_id
    WHERE l.status = 'paid_off'
      AND lp.amount = (
          SELECT max(x.amount) FROM loan_payments x WHERE x.loan_id = l.loan_id
      )
    GROUP BY l.loan_id
)
SELECT l.loan_id,
       c.first_name || ' ' || c.last_name AS customer,
       lp.paid_on,
       lp.amount
FROM payoff
JOIN loans l ON l.loan_id = payoff.loan_id
JOIN customers c ON c.customer_id = l.customer_id
JOIN loan_payments lp ON lp.loan_id = payoff.loan_id
WHERE lp.paid_on > payoff.payoff_date
ORDER BY l.loan_id, lp.paid_on`,
        ordered: true,
        expected: {
          columns: ["loan_id", "customer", "paid_on", "amount"],
          rows: [["8", "Trevor Bishop", "2026-09-12", "285.90"]],
        },
        explanation:
          "Exactly one straggler: loan 8, Trevor Bishop's $6,000 loan, was cleared by a $11,225.50 closing payment on 2026-08-12 — and then a $285.90 payment posted a month later. The auditor will want the reversal or the explanation (usually an autopay that nobody switched off). The CTE makes the definition of 'payoff' explicit and debatable — a good habit when the business rule itself is a judgment call.",
      },
      {
        id: "banking-q3",
        title: "Money in, money out, by channel",
        problem:
          "The channel picture: per channel, deposits (count of deposit transactions), deposited (total deposited, 2 decimals), withdrawals (count of withdrawal transactions) and withdrawn (total withdrawn, 2 decimals). Transfers and fees are out of scope here. Sort by deposited descending. NULL where a channel has none of a kind is expected and correct.",
        hint: "Two count(*) FILTER (...) and two sum(amount) FILTER (...) aggregates, one GROUP BY channel.",
        starter:
          "SELECT channel,\n       count(*) FILTER (WHERE txn_type = 'deposit') AS deposits,\n       -- sums and withdrawals...\nFROM transactions\n",
        solution: `SELECT channel,
       count(*) FILTER (WHERE txn_type = 'deposit') AS deposits,
       round(sum(amount) FILTER (WHERE txn_type = 'deposit'), 2) AS deposited,
       count(*) FILTER (WHERE txn_type = 'withdrawal') AS withdrawals,
       round(sum(amount) FILTER (WHERE txn_type = 'withdrawal'), 2) AS withdrawn
FROM transactions
GROUP BY channel
ORDER BY deposited DESC`,
        ordered: true,
        expected: {
          columns: ["channel", "deposits", "deposited", "withdrawals", "withdrawn"],
          rows: [
            ["online", "0", null, "35", "60256.20"],
            ["atm", "0", null, "6", "3690.00"],
            ["branch", "39", "121512.40", "2", "4350.00"],
            ["mobile", "7", "3850.00", "0", null],
          ],
        },
        explanation:
          "The story splits cleanly: money arrives at the branch and on mobile (payroll deposits, check deposits), and leaves online (bills, rent, transfers) and at ATMs. Branches lead deposits with $121,512.40 while online dominates withdrawals with $60,256.20 across 35 transactions. The NULLs are correct arithmetic — no deposits have ever been made online or at an ATM in this window, so the sum over an empty set is NULL, not zero. Stating that distinction is exactly the kind of precision auditors reward.",
      },
      {
        id: "banking-q4",
        title: "The busiest accounts",
        problem:
          "Activity concentration: the five accounts with the most transactions. Return account_id, transactions (count), first_txn (earliest occurred_at) and last_txn (latest occurred_at). Sort by transactions descending, then account_id. The auditor will ask who these five are.",
        hint: "GROUP BY account_id with count, min and max over occurred_at; ORDER BY the count; LIMIT 5.",
        starter:
          "SELECT t.account_id,\n       count(*) AS transactions,\n       min(t.occurred_at) AS first_txn,\n       max(t.occurred_at) AS last_txn\nFROM transactions t\n",
        solution: `SELECT t.account_id,
       count(*) AS transactions,
       min(t.occurred_at) AS first_txn,
       max(t.occurred_at) AS last_txn
FROM transactions t
GROUP BY t.account_id
ORDER BY transactions DESC, t.account_id
LIMIT 5`,
        ordered: true,
        expected: {
          columns: ["account_id", "transactions", "first_txn", "last_txn"],
          rows: [
            ["1", "28", "2026-01-05 09:15:00", "2026-11-10 23:59:00"],
            ["4", "20", "2026-02-01 10:00:00", "2026-11-12 09:30:00"],
            ["17", "20", "2026-01-15 10:30:00", "2026-11-02 10:45:00"],
            ["6", "12", "2026-03-15 14:20:00", "2026-11-09 09:00:00"],
            ["22", "10", "2026-03-01 09:00:00", "2026-06-28 16:50:00"],
          ],
        },
        explanation:
          "Account 1 (Raymond Castillo's checking) is the busiest with 28 transactions spanning the whole year — payroll in, bills out, the occasional fee. The tie at 20 between accounts 4 and 17 is broken by account_id, which is why the sort specifies both keys. Account 22 makes the list with only 10 transactions — but look at the dates: activity stops on 2026-06-28 after the overdraft spiral, which is the quiet kind of customer exit the bank should notice early.",
      },
      {
        id: "banking-q5",
        title: "The fee-payers",
        problem:
          "Finally, the relationship-risk list: customers who have ever been charged a fee (any transaction of type 'fee' on any of their accounts). Return customer_id, customer (first and last name) and risk_rating, one row per customer, sorted by customer_id.",
        hint: "JOIN customers -> accounts -> transactions, filter txn_type = 'fee', and DISTINCT the result (customers can be charged many times).",
        starter:
          "SELECT DISTINCT c.customer_id,\n       c.first_name || ' ' || c.last_name AS customer,\n       c.risk_rating\nFROM customers c\n-- two hops: accounts, then transactions\n",
        solution: `SELECT DISTINCT c.customer_id,
       c.first_name || ' ' || c.last_name AS customer,
       c.risk_rating
FROM customers c
JOIN accounts a ON a.customer_id = c.customer_id
JOIN transactions t ON t.account_id = a.account_id
WHERE t.txn_type = 'fee'
ORDER BY c.customer_id`,
        ordered: true,
        expected: {
          columns: ["customer_id", "customer", "risk_rating"],
          rows: [
            ["1", "Raymond Castillo", "low"],
            ["2", "Diana Whitmore", "low"],
            ["3", "Kwame Mensah", "medium"],
            ["13", "Trevor Bishop", "high"],
          ],
        },
        explanation:
          "Four customers have paid fees. Trevor Bishop is the telling one: rated high risk, the protagonist of the phantom loan payment, and the owner of account 22 — the one that went into overdraft, ate two $35 fees, and then went silent. The pattern (overdraft -> fees -> inactivity) is exactly what early-warning systems look for, and it took three joins to assemble: customers through accounts through transactions.",
      },
    ],
  },

  /* ================================================================== */
  {
    id: "retail",
    title: "The stock controller",
    domain: "Retail chain operations",
    scenario:
      "Trailhead Outdoors runs five stores and a warehouse relationship with eight suppliers, and the new operations lead wants a Monday-morning stock meeting that runs on numbers, not vibes. Four questions define the meeting: what is at or below its reorder level right now, what is each store's stock worth at cost, which products are actually losing money on every sale, and which purchase orders are overdue. You have stores, suppliers, products, per-store inventory, purchase orders and their line items.",
    context: [
      "inventory is per (store, product): the composite key means the same product can be fine in one store and sold out in another.",
      "A product at or below its reorder_level is the trigger to reorder — the rule this company uses is 'at or below', not 'strictly below'.",
      "Product 19, the Everest Water Bottle, is a deliberate loss-leader: its price (3.99) is below its cost (4.80).",
      "One supplier (BlueRiver Footwear) has never received a purchase order — worth knowing before the meeting praises 'all our suppliers'.",
      "'Overdue' here means: status pending or partial AND expected_on before 2026-11-14 (today, for this case).",
    ],
    takeaways: [
      "Reorder reports read inventory against a threshold — a WHERE comparison, joined to names for humans to read.",
      "Stock valuation multiplies quantity by cost inside an aggregate: sum(on_hand * cost).",
      "Margin analysis is a computed column (price - cost); loss-leaders fall out with a simple comparison.",
      "Supplier spend needs a FILTER to ignore cancelled orders — gross spend would flatter a supplier whose orders never arrived.",
    ],
    questions: [
      {
        id: "retail-q1",
        title: "What needs reordering today?",
        problem:
          "The reorder list: every inventory row where on_hand is at or below its reorder_level. Return store (name), product (name), on_hand and reorder_level, sorted by store then product. These are the rows the buyers act on this morning.",
        hint: "A two-table join for names plus WHERE i.on_hand <= i.reorder_level.",
        starter:
          "SELECT s.name AS store, p.name AS product, i.on_hand, i.reorder_level\nFROM inventory i\n-- join stores and products, then filter\n",
        solution: `SELECT s.name AS store,
       p.name AS product,
       i.on_hand,
       i.reorder_level
FROM inventory i
JOIN stores s ON s.store_id = i.store_id
JOIN products p ON p.product_id = i.product_id
WHERE i.on_hand <= i.reorder_level
ORDER BY s.name, p.name`,
        ordered: true,
        expected: {
          columns: ["store", "product", "on_hand", "reorder_level"],
          rows: [
            ["Lakewood Plaza", "Skyline 2P Tent", "3", "3"],
            ["Lakewood Plaza", "SummitDown 20F Sleeping Bag", "4", "4"],
            ["Northgate Outpost", "BaseCamp Pad Regular", "3", "3"],
            ["Riverside Commons", "CastIron Camp Dutch Oven", "6", "6"],
            ["Riverside Commons", "Cirrus 4P Family Tent", "3", "3"],
            ["Riverside Commons", "Skyline 2P Tent", "4", "4"],
          ],
        },
        explanation:
          "Six inventory positions have hit their trigger, and the composite-key insight pays off immediately: the Skyline 2P Tent is on the list for TWO different stores (Lakewood at 3, Riverside at 4). Tents dominate the list — big, seasonal, and easy to be caught short on. The buyers' action is per store, which is exactly why inventory is keyed by (store, product) rather than by product alone.",
      },
      {
        id: "retail-q2",
        title: "What is each store worth on the shelf?",
        problem:
          "The valuation exhibit: per store, store (name) and stock_value (sum of on_hand times the product's cost, 2 decimals), highest first. This is the money sitting on shelves at cost, not at retail.",
        hint: "Three tables again (stores, inventory, products) — the multiplication happens inside sum().",
        starter:
          "SELECT s.name AS store,\n       round(sum(i.on_hand * p.cost), 2) AS stock_value\nFROM stores s\n",
        solution: `SELECT s.name AS store,
       round(sum(i.on_hand * p.cost), 2) AS stock_value
FROM stores s
JOIN inventory i ON i.store_id = s.store_id
JOIN products p ON p.product_id = i.product_id
GROUP BY s.name
ORDER BY stock_value DESC`,
        ordered: true,
        expected: {
          columns: ["store", "stock_value"],
          rows: [
            ["Downtown Flagship", "18588.40"],
            ["Riverside Commons", "10018.70"],
            ["Lakewood Plaza", "5063.30"],
            ["Fairview Mall", "2305.60"],
            ["Northgate Outpost", "1396.70"],
          ],
        },
        explanation:
          "Downtown Flagship holds $18,588.40 of stock at cost — more than the two smallest stores combined, several times over. The gradient from flagship (22,000 sqft) to the Northgate Outpost (8,000 sqft, $1,396.70) mirrors store size deliberately. Because the valuation uses cost, not price, it answers 'what did we pay for what is on the shelf?' — the number finance actually wants for the balance conversation.",
      },
      {
        id: "retail-q3",
        title: "Which products lose money on every sale?",
        problem:
          "The margin check: products whose price is below their cost. Return product_id, name, cost, price and margin (price minus cost, 2 decimals). Sort by product_id. The meeting needs to know which items are priced to lose.",
        hint: "The margin is just price - cost computed in the SELECT; filter where it is negative.",
        starter:
          "SELECT p.product_id, p.name, p.cost, p.price,\n       round(p.price - p.cost, 2) AS margin\nFROM products p\n",
        solution: `SELECT p.product_id,
       p.name,
       p.cost,
       p.price,
       round(p.price - p.cost, 2) AS margin
FROM products p
WHERE p.price < p.cost
ORDER BY p.product_id`,
        ordered: false,
        expected: {
          columns: ["product_id", "name", "cost", "price", "margin"],
          rows: [["19", "Everest Water Bottle 1L", "4.80", "3.99", "-0.81"]],
        },
        explanation:
          "One product loses money on every unit: the Everest Water Bottle, bought at $4.80, sold at $3.99 — negative 81 cents a bottle. That is the textbook loss-leader, priced below cost to pull traffic (a thirsty hiker buys batteries and socks too). The query's job is not to condemn it but to make it visible: loss-leaders are legitimate retail strategy as long as everyone knows they exist — and this one is now on the record.",
      },
      {
        id: "retail-q4",
        title: "The overdue purchase orders",
        problem:
          "The awkward follow-ups: purchase orders that are pending or partial AND whose expected_on date has already passed (before 2026-11-14). Return po_id, store (name), supplier (name), ordered_on, expected_on, status and total_cost, sorted by expected_on ascending — the most overdue first.",
        hint: "JOIN stores and suppliers for names; WHERE po.status IN ('pending','partial') AND po.expected_on < DATE '2026-11-14'.",
        starter:
          "SELECT po.po_id, s.name AS store, sup.name AS supplier,\n       po.ordered_on, po.expected_on, po.status, po.total_cost\nFROM purchase_orders po\n",
        solution: `SELECT po.po_id,
       s.name AS store,
       sup.name AS supplier,
       po.ordered_on,
       po.expected_on,
       po.status,
       po.total_cost
FROM purchase_orders po
JOIN stores s ON s.store_id = po.store_id
JOIN suppliers sup ON sup.supplier_id = po.supplier_id
WHERE po.status IN ('pending', 'partial')
  AND po.expected_on < DATE '2026-11-14'
ORDER BY po.expected_on`,
        ordered: true,
        expected: {
          columns: ["po_id", "store", "supplier", "ordered_on", "expected_on", "status", "total_cost"],
          rows: [
            ["7", "Downtown Flagship", "RidgePole Tents", "2026-10-03", "2026-10-20", "partial", "8596.00"],
            ["10", "Lakewood Plaza", "GraniteGear Works", "2026-10-22", "2026-11-10", "partial", "960.00"],
          ],
        },
        explanation:
          "Two orders need chasing. PO 7 is the painful one: an $8,596 tent order from RidgePole, promised October 20, still only partially delivered — and it overlaps with the reorder list, where two stores are out of Skyline tents. PO 10 is smaller but four days past its promise. Note the fixed reference date in the filter: 'overdue' is always relative to a chosen moment, and a professional states which moment was used.",
      },
      {
        id: "retail-q5",
        title: "Supplier concentration",
        problem:
          "The supply-chain view: per supplier, supplier (name), orders (count of purchase orders) and spend (sum of total_cost over non-cancelled orders, 2 decimals — cancelled orders don't count as spend). Every supplier appears, even with zero orders; NULL spend is correct for them. Sort by spend descending, with true NULLs last, then name.",
        hint: "LEFT JOIN purchase_orders; sum with FILTER (WHERE status <> 'cancelled'); ORDER BY spend DESC NULLS LAST.",
        starter:
          "SELECT sup.name AS supplier,\n       count(po.po_id) AS orders,\n       round(sum(po.total_cost) FILTER (WHERE po.status <> 'cancelled'), 2) AS spend\nFROM suppliers sup\n",
        solution: `SELECT sup.name AS supplier,
       count(po.po_id) AS orders,
       round(sum(po.total_cost) FILTER (WHERE po.status <> 'cancelled'), 2) AS spend
FROM suppliers sup
LEFT JOIN purchase_orders po ON po.supplier_id = sup.supplier_id
GROUP BY sup.name
ORDER BY spend DESC NULLS LAST, sup.name`,
        ordered: true,
        expected: {
          columns: ["supplier", "orders", "spend"],
          rows: [
            ["RidgePole Tents", "3", "19282.00"],
            ["Nordic Sleep Systems", "2", "7520.00"],
            ["SummitTextile Co.", "4", "6562.00"],
            ["GraniteGear Works", "3", "4164.00"],
            ["CanyonCook Ltd.", "2", "3312.00"],
            ["AuroraOptics", "1", "2336.00"],
            ["WildWaters Paddles", "1", "1790.00"],
            ["BlueRiver Footwear", "0", null],
          ],
        },
        explanation:
          "RidgePole Tents carries the relationship: $19,282 across three orders — including the overdue $8,596 flagship order — making the concentration risk and the delivery risk the same conversation. SummitTextile has the most orders (4) but half RidgePole's spend: many small, reliable deliveries. And BlueRiver Footwear appears with zero orders and NULL spend, which is precisely the point of the LEFT JOIN: the supplier exists in the system but has never won an order, a fact a plain JOIN would have silently hidden.",
      },
    ],
  },

  /* ================================================================== */
  {
    id: "hr",
    title: "The compensation review",
    domain: "People analytics",
    scenario:
      "HeliosWorks, a 30-person company, is heading into its annual compensation review, and the Head of People needs the numbers that keep the meeting honest: headcount and payroll by department, the org chart with names attached, who received the biggest raises (from the salary history), whether anyone is quietly over-allocated across projects, and how performance ratings landed by department last half. You have employees with the org chart built in, effective-dated salary history, projects and staffing, and the review cycle data.",
    context: [
      "The org chart lives in employees.manager_id: a self-reference. The CEO's manager_id is NULL.",
      "Two employees have terminated dates but remain in the table — headcount questions must filter terminated IS NULL.",
      "Salary history is effective-dated: a raise is a NEW row in salaries, so comparing each row to the previous one (LAG) recovers every raise.",
      "employee_projects carries allocation_pct per pairing — an employee can be assigned beyond 100% across projects, which is the burnout flag.",
      "Performance reviews come in half-year cycles; this analysis uses 2025-H2.",
    ],
    takeaways: [
      "Headcount is not row count: filter for current employees (terminated IS NULL) before counting anything.",
      "The self-join turns manager_id into human-readable reporting lines — one of the most useful queries in any HR system.",
      "LAG over effective-dated history converts 'a list of salaries' into 'a list of raises'.",
      "HAVING with a summed allocation finds over-commitment — the aggregate version of 'who is doing too much'.",
    ],
    questions: [
      {
        id: "hr-q1",
        title: "Headcount and payroll by department",
        problem:
          "The opening numbers: per department, department (name), headcount (current employees only — terminated IS NULL) and payroll (sum of current salaries, 2 decimals). Every department appears even with zero current staff. Sort by headcount descending, then department name.",
        hint: "LEFT JOIN employees with the terminated filter inside the JOIN condition, so departments with no staff survive.",
        starter:
          "SELECT d.name AS department,\n       count(e.employee_id) AS headcount,\n       round(sum(e.salary), 2) AS payroll\nFROM departments d\n",
        solution: `SELECT d.name AS department,
       count(e.employee_id) AS headcount,
       round(sum(e.salary), 2) AS payroll
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.dept_id AND e.terminated IS NULL
GROUP BY d.name
ORDER BY headcount DESC, d.name`,
        ordered: true,
        expected: {
          columns: ["department", "headcount", "payroll"],
          rows: [
            ["Engineering", "12", "1862000.00"],
            ["Product", "5", "849000.00"],
            ["Sales", "4", "574000.00"],
            ["Customer Success", "2", "200000.00"],
            ["Marketing", "2", "264000.00"],
            ["Data", "1", "141000.00"],
            ["Executive", "1", "385000.00"],
            ["People Ops", "1", "175000.00"],
          ],
        },
        explanation:
          "Engineering dominates: 12 people, $1.86M of payroll — 40% of the company and half its spend. The subtle move is the terminated filter living INSIDE the LEFT JOIN's ON clause: putting it in WHERE would have erased the departments of the two departed employees entirely, while this form keeps every department and simply excludes leavers from the counts. That distinction — ON-filter versus WHERE-filter on an outer join — is one of the most consequential joins details in SQL.",
      },
      {
        id: "hr-q2",
        title: "The org chart, with names",
        problem:
          "Every current employee with their manager's name: employee (first and last name), job_title and manager (the manager's first and last name, NULL for the CEO). Current employees only. Sort by employee_id. This is the seating chart for the review meeting.",
        hint: "Self-join: employees e LEFT JOIN employees m ON m.employee_id = e.manager_id.",
        starter:
          "SELECT e.first_name || ' ' || e.last_name AS employee,\n       e.job_title,\n       m.first_name || ' ' || m.last_name AS manager\nFROM employees e\n",
        solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       m.first_name || ' ' || m.last_name AS manager
FROM employees e
LEFT JOIN employees m ON m.employee_id = e.manager_id
WHERE e.terminated IS NULL
ORDER BY e.employee_id`,
        ordered: true,
        expected: {
          columns: ["employee", "job_title", "manager"],
          rows: [
            ["Amara Osei", "Chief Executive Officer", null],
            ["Daniel Kramer", "VP of Engineering", "Amara Osei"],
            ["Sofia Mancini", "VP of Sales", "Amara Osei"],
            ["Priya Nair", "VP of Product", "Amara Osei"],
            ["Gerald Weiss", "Head of People", "Amara Osei"],
            ["Lena Hoffman", "Engineering Manager", "Daniel Kramer"],
            ["Marcus Tran", "Engineering Manager", "Daniel Kramer"],
            ["Elena Petrova", "Senior Backend Engineer", "Lena Hoffman"],
            ["James Okoro", "Senior Backend Engineer", "Lena Hoffman"],
            ["Aisha Rahman", "Backend Engineer", "Lena Hoffman"],
            ["Tom Lindqvist", "Backend Engineer", "Lena Hoffman"],
            ["Grace Park", "Senior Frontend Engineer", "Marcus Tran"],
            ["Noah Feldman", "Frontend Engineer", "Marcus Tran"],
            ["Ingrid Sorensen", "DevOps Engineer", "Marcus Tran"],
            ["Diego Fuentes", "QA Engineer", "Marcus Tran"],
            ["Yuki Tanaka", "QA Engineer", "Marcus Tran"],
            ["Robert McAllister", "Principal Product Manager", "Priya Nair"],
            ["Chloe Dubois", "Product Manager", "Priya Nair"],
            ["Hassan Al-Farsi", "Product Manager", "Priya Nair"],
            ["Maria Gonzalez", "Product Designer", "Robert McAllister"],
            ["Kevin O'Brien", "Enterprise Account Exec", "Sofia Mancini"],
            ["Nadia Cheung", "Account Executive", "Sofia Mancini"],
            ["Victor Adeyemi", "Sales Development Rep", "Nadia Cheung"],
            ["Freya Johansson", "Marketing Manager", "Amara Osei"],
            ["Omar Haddad", "Content Strategist", "Freya Johansson"],
            ["Beatrice Laurent", "Customer Success Manager", "Amara Osei"],
            ["Sam Whitfield", "Support Specialist", "Beatrice Laurent"],
            ["Tara Singh", "Analytics Engineer", "Daniel Kramer"],
          ],
        },
        explanation:
          "One table joined to itself turns manager_id into a readable reporting line: four leaders report to Amara (the CEO, whose manager is correctly NULL), and the tree descends four levels to Victor Adeyemi, a Sales Development Rep reporting to an Account Executive. The LEFT JOIN matters: an INNER JOIN would have silently deleted the CEO from the org chart — the one person the meeting is actually about. 28 current employees, every one with their boss's name attached.",
      },
      {
        id: "hr-q3",
        title: "The biggest raises",
        problem:
          "Compensation history, quantified: for each row in the salary history, compute the raise relative to that employee's previous salary (LAG over effective date, ordered). Return the top 3 raises with employee (name), raise_date (the effective date), new_salary and raise (the difference, 2 decimals). Sort by raise descending; NULL raises (first salaries) go last.",
        hint: "lag(s.amount) OVER (PARTITION BY s.employee_id ORDER BY s.effective) gives the previous salary; subtract, order, limit.",
        starter:
          "SELECT e.first_name || ' ' || e.last_name AS employee,\n       s.effective AS raise_date,\n       s.amount AS new_salary,\n       round(s.amount - lag(s.amount) OVER (PARTITION BY s.employee_id ORDER BY s.effective), 2) AS raise\nFROM salaries s\n",
        solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       s.effective AS raise_date,
       s.amount AS new_salary,
       round(s.amount - lag(s.amount) OVER (PARTITION BY s.employee_id ORDER BY s.effective), 2) AS raise
FROM salaries s
JOIN employees e ON e.employee_id = s.employee_id
ORDER BY raise DESC NULLS LAST
LIMIT 3`,
        ordered: true,
        expected: {
          columns: ["employee", "raise_date", "new_salary", "raise"],
          rows: [
            ["Amara Osei", "2020-01-01", "340000.00", "50000.00"],
            ["Amara Osei", "2024-01-01", "385000.00", "45000.00"],
            ["James Okoro", "2024-01-01", "162000.00", "27000.00"],
        ],
        },
        explanation:
          "The window function LAG looks backwards within each employee's salary sequence (PARTITION BY employee, ORDER BY effective date), turning history into deltas. The CEO takes the two largest raises — $50,000 in 2020 and $45,000 in 2024 — and the next biggest is James Okoro's $27,000, which his 2025 review ('strong delivery; growing mentorship') supports. Presented this way, the review meeting starts with facts, not anecdotes.",
      },
      {
        id: "hr-q4",
        title: "Who is over-allocated?",
        problem:
          "The burnout flag: employees whose project allocations sum to more than 100%. Return employee_id, employee (name), total_allocation (the sum) and projects (how many). Sort by total_allocation descending. Use HAVING on the sum.",
        hint: "GROUP BY employee, then HAVING sum(allocation_pct) > 100 — the aggregate filter.",
        starter:
          "SELECT ep.employee_id,\n       e.first_name || ' ' || e.last_name AS employee,\n       sum(ep.allocation_pct) AS total_allocation,\n       count(*) AS projects\nFROM employee_projects ep\n",
        solution: `SELECT ep.employee_id,
       e.first_name || ' ' || e.last_name AS employee,
       sum(ep.allocation_pct) AS total_allocation,
       count(*) AS projects
FROM employee_projects ep
JOIN employees e ON e.employee_id = ep.employee_id
GROUP BY ep.employee_id, e.first_name, e.last_name
HAVING sum(ep.allocation_pct) > 100
ORDER BY total_allocation DESC`,
        ordered: false,
        expected: {
          columns: ["employee_id", "employee", "total_allocation", "projects"],
          rows: [
            ["9", "James Okoro", "150", "3"],
            ["8", "Elena Petrova", "140", "2"],
          ],
        },
        explanation:
          "Two engineers are assigned beyond a single person's week: James Okoro at 150% across three projects and Elena Petrova at 140% across two. HAVING is the essential ingredient — WHERE cannot filter on a sum, because the sum only exists after grouping. These two are exactly the people whose performance reviews mention 'strong delivery', which is usually how over-allocation hides until someone quits; this query makes it visible first.",
      },
      {
        id: "hr-q5",
        title: "Ratings by department, last half",
        problem:
          "The review-cycle summary for 2025-H2: per department, department (name), reviews (count of reviews in that cycle) and avg_rating (2 decimals). Only departments that had reviews in 2025-H2 should appear. Sort by avg_rating descending.",
        hint: "Three joins (departments -> employees -> performance_reviews), a WHERE on the cycle, GROUP BY department.",
        starter:
          "SELECT d.name AS department,\n       count(pr.review_id) AS reviews,\n       round(avg(pr.rating), 2) AS avg_rating\nFROM departments d\n",
        solution: `SELECT d.name AS department,
       count(pr.review_id) AS reviews,
       round(avg(pr.rating), 2) AS avg_rating
FROM departments d
JOIN employees e ON e.dept_id = d.dept_id
JOIN performance_reviews pr ON pr.employee_id = e.employee_id
WHERE pr.review_cycle = '2025-H2'
GROUP BY d.name
ORDER BY avg_rating DESC`,
        ordered: true,
        expected: {
          columns: ["department", "reviews", "avg_rating"],
          rows: [
            ["Product", "2", "4.25"],
            ["Engineering", "11", "4.09"],
            ["Customer Success", "1", "4.00"],
            ["Sales", "3", "4.00"],
          ],
        },
        explanation:
          "Product leads the half at 4.25, Engineering's eleven reviews average a strong 4.09, and Sales and Customer Success sit at 4.00. Four departments appear because only they had reviews in 2025-H2 — Executive, Marketing, People Ops and the one-person Data team had none, and an INNER JOIN expresses that exclusion naturally. For the compensation meeting, the honest reading pairs this table with the raises table from the previous question: are the biggest raises landing where the ratings actually are?",
      },
    ],
  },
];
