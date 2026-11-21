/* Temporary precompute helper for parts D and E authoring. Delete after use. */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const dbs = new Map<string, PGlite>();
async function db(ds: string | null): Promise<PGlite> {
  const key = ds ?? "__scratch__";
  if (!dbs.has(key)) {
    const d = new PGlite();
    await d.exec("SELECT 1");
    if (ds) await d.exec(readFileSync(`public/sql-lab/datasets/${ds}.sql`, "utf8"));
    dbs.set(key, d);
  }
  return dbs.get(key)!;
}

function cell(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof Date) return v.toISOString().replace("T", " ").replace("Z", "");
  return String(v);
}

async function q(ds: string | null, label: string, sql: string) {
  const d = await db(ds);
  try {
    const res = await d.query(sql);
    const cols = res.fields.map((f: any) => f.name);
    console.log(`\n### ${label} [${ds ?? "scratch"}] cmd=${res.command ?? "?"}`);
    console.log(cols.join(" | "));
    for (const r of res.rows) console.log(cols.map((c: string) => cell((r as any)[c])).join(" | "));
  } catch (e: any) {
    console.log(`\n### ${label} [${ds ?? "scratch"}] ERROR: ${String(e?.message ?? e)}`);
  }
}

async function main() {
  /* ---------------- E-01 ecommerce aggregates ---------------- */
  await q("ecommerce", "e01-orders-agg", `SELECT count(*) AS orders, sum(total) AS revenue, min(total) AS smallest, max(total) AS largest, avg(total) AS average_order FROM orders`);
  await q("ecommerce", "e01-avg-rounded", `SELECT round(avg(total), 2) AS average_order FROM orders`);
  await q("ecommerce", "e01-distinct", `SELECT count(DISTINCT city) AS cities, count(DISTINCT state) AS states, count(*) AS customers FROM customers`);
  await q("ecommerce", "e01-empty-agg", `SELECT count(*) AS n, sum(total) AS revenue FROM orders WHERE status = 'nope'`);
  await q("ecommerce", "e01-rating-counts", `SELECT count(*) AS products, count(rating) AS with_rating, round(avg(rating), 2) AS avg_rating FROM products`);

  /* ---------------- E-02 group by ---------------- */
  await q("ecommerce", "e02-status", `SELECT status, count(*) AS orders FROM orders GROUP BY status ORDER BY status`);
  await q("ecommerce", "e02-city-state", `SELECT city, state, count(*) AS customers FROM customers GROUP BY city, state ORDER BY state, city`);
  await q("ecommerce", "e02-status-customers", `SELECT status, count(DISTINCT customer_id) AS customers FROM orders GROUP BY status ORDER BY status`);
  await q("ecommerce", "e02-months", `SELECT to_char(order_date, 'YYYY-MM') AS month, count(*) AS orders FROM orders WHERE order_date >= DATE '2026-01-01' AND order_date < DATE '2027-01-01' GROUP BY to_char(order_date, 'YYYY-MM') ORDER BY month`);

  /* ---------------- E-03 having (hr) ---------------- */
  await q("hr", "e03-dept-all", `SELECT dept_id, count(*) AS headcount FROM employees GROUP BY dept_id ORDER BY dept_id`);
  await q("hr", "e03-dept-having", `SELECT dept_id, count(*) AS headcount FROM employees GROUP BY dept_id HAVING count(*) >= 3 ORDER BY dept_id`);
  await q("hr", "e03-dept-avgsal", `SELECT dept_id, round(avg(salary), 2) AS avg_salary FROM employees GROUP BY dept_id HAVING count(*) >= 2 ORDER BY dept_id`);
  await q("hr", "e03-dept-current", `SELECT dept_id, count(*) AS current_headcount FROM employees WHERE terminated IS NULL GROUP BY dept_id HAVING count(*) >= 2 ORDER BY dept_id`);
  await q("hr", "e03-where-agg-error", `SELECT dept_id, count(*) FROM employees WHERE count(*) >= 3 GROUP BY dept_id`);

  /* ---------------- E-04 filter (banking) ---------------- */
  await q("banking", "e04-acct-counts", `SELECT account_id, count(*) AS txns, count(*) FILTER (WHERE txn_type = 'deposit') AS deposits, count(*) FILTER (WHERE txn_type = 'withdrawal') AS withdrawals, count(*) FILTER (WHERE txn_type = 'fee') AS fees FROM transactions GROUP BY account_id ORDER BY account_id`);
  await q("banking", "e04-acct-sums", `SELECT account_id, sum(amount) FILTER (WHERE txn_type = 'deposit') AS deposited, sum(amount) FILTER (WHERE txn_type = 'withdrawal') AS withdrawn FROM transactions GROUP BY account_id ORDER BY account_id`);
  await q("banking", "e04-case-version", `SELECT account_id, sum(CASE WHEN txn_type = 'deposit' THEN amount ELSE 0 END) AS deposited_case FROM transactions GROUP BY account_id ORDER BY account_id`);
  await q("banking", "e04-mobile-pct", `SELECT count(*) FILTER (WHERE channel = 'mobile') AS mobile_txns, count(*) AS all_txns, round(100.0 * count(*) FILTER (WHERE channel = 'mobile') / count(*), 1) AS mobile_pct FROM transactions`);

  /* ---------------- E-05 patterns ---------------- */
  await q("university", "e05-grades", `SELECT grade, count(*) AS enrollments FROM enrollments GROUP BY grade ORDER BY grade`);
  await q("university", "e05-majors", `SELECT major_dept_id, count(*) AS students FROM students GROUP BY major_dept_id ORDER BY major_dept_id`);
  await q("university", "e05-years", `SELECT enrollment_year, count(*) AS students FROM students GROUP BY enrollment_year ORDER BY enrollment_year`);
  await q("university", "e05-gpa-counts", `SELECT count(*) AS students, count(gpa) AS with_gpa FROM students`);
  await q("university", "e05-avg-gpa", `SELECT round(avg(gpa), 3) AS avg_gpa, count(gpa) AS gpas_used FROM students`);
  await q("hospital", "e05-trap", `SELECT test_name, count(*) AS total, count(*) FILTER (WHERE is_abnormal) AS abnormal, 100 * count(*) FILTER (WHERE is_abnormal) / count(*) AS pct_int, round(100.0 * count(*) FILTER (WHERE is_abnormal) / count(*), 1) AS pct_numeric FROM lab_results GROUP BY test_name HAVING count(*) >= 3 ORDER BY test_name`);

  /* ---------------- E exercises ---------------- */
  await q("ecommerce", "ex-eb1", `SELECT count(*) AS payments, sum(amount) AS total_collected FROM payments WHERE method = 'card'`);
  await q("retail", "ex-eb2", `SELECT min(cost) AS cheapest_cost, max(price) AS priciest, round(avg(price), 2) AS avg_price FROM products`);
  await q("retail", "ex-eb4", `SELECT category, count(*) AS products FROM products GROUP BY category ORDER BY category`);
  await q("banking", "ex-ei1", `SELECT account_id, count(*) AS txns FROM transactions GROUP BY account_id HAVING count(*) >= 10 ORDER BY account_id`);
  await q("ecommerce", "ex-ei2", `SELECT status, count(DISTINCT customer_id) AS customers FROM orders GROUP BY status ORDER BY status`);
  await q("hr", "ex-ei3", `SELECT dept_id, count(*) AS headcount, round(avg(salary), 2) AS avg_salary FROM employees WHERE terminated IS NULL GROUP BY dept_id HAVING count(*) >= 2 ORDER BY dept_id`);
  await q("banking", "ex-ei4", `SELECT channel, count(*) AS txns, sum(amount) FILTER (WHERE txn_type = 'deposit') AS deposited FROM transactions GROUP BY channel ORDER BY channel`);
  await q("hospital", "ex-ea1", `SELECT test_name, count(*) AS total, count(*) FILTER (WHERE is_abnormal) AS abnormal, round(100.0 * count(*) FILTER (WHERE is_abnormal) / count(*), 1) AS pct_abnormal FROM lab_results GROUP BY test_name HAVING count(*) >= 3 ORDER BY test_name`);
  await q("retail", "ex-ea2", `SELECT supplier_id, count(*) AS purchase_orders, sum(total_cost) AS spent FROM purchase_orders WHERE status = 'received' GROUP BY supplier_id HAVING sum(total_cost) >= 3000 ORDER BY supplier_id`);
  await q("ecommerce", "ex-ea3", `SELECT to_char(order_date, 'YYYY-MM') AS month, count(*) AS orders, sum(total) AS revenue FROM orders WHERE order_date >= DATE '2026-01-01' AND order_date < DATE '2027-01-01' GROUP BY to_char(order_date, 'YYYY-MM') ORDER BY month`);
  await q("university", "ex-ea4", `SELECT grade, count(*) AS enrollments, count(DISTINCT student_id) AS students FROM enrollments GROUP BY grade ORDER BY grade`);

  /* ---------------- D exercises ---------------- */
  await q("hospital", "ex-db1", `UPDATE doctors SET on_call = true WHERE dept_id = 5 AND on_call = false RETURNING doctor_id, last_name, on_call`);
  await q("retail", "ex-db2", `UPDATE purchase_orders SET status = 'cancelled' WHERE expected_on IS NULL RETURNING po_id, store_id, status`);
  await q("ecommerce", "ex-db3", `DELETE FROM reviews WHERE stars = 1 RETURNING review_id, customer_id, product_id, stars`);
  await q("banking", "ex-db4", `CREATE TABLE guestbook_entries (entry_id int PRIMARY KEY, guest text NOT NULL, message text NOT NULL, mood text NOT NULL DEFAULT 'happy', posted date NOT NULL);
INSERT INTO guestbook_entries (entry_id, guest, message, posted) VALUES (1, 'Ana Petrov', 'First!', DATE '2026-11-01'), (2, 'Ben Okafor', 'Hello world', DATE '2026-11-02');
SELECT entry_id, guest, mood FROM guestbook_entries ORDER BY entry_id`);
  await q("retail", "ex-di1", `UPDATE products SET price = round(price * 1.10, 2) WHERE category = 'Hiking' RETURNING product_id, name, price`);
  await q("hospital", "ex-di2", `DELETE FROM prescriptions WHERE end_date IS NULL RETURNING prescription_id, medication, start_date`);
  await q("hr", "ex-di3", `UPDATE employees SET salary = salary * 1.04 WHERE dept_id = 6 RETURNING employee_id, first_name, salary`);
  await q("university", "ex-di4", `CREATE TABLE support_tickets (ticket_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, summary text NOT NULL, opened date NOT NULL);
INSERT INTO support_tickets (summary, opened) VALUES ('login broken', DATE '2026-11-02'), ('billing question', DATE '2026-11-04'), ('refund request', DATE '2026-11-09') RETURNING ticket_id, summary;
SELECT ticket_id, summary, opened FROM support_tickets ORDER BY ticket_id`);
  await q("ecommerce", "ex-da1", `CREATE TABLE mixtapes (mixtape_id int PRIMARY KEY, title text NOT NULL);
CREATE TABLE mixtape_songs (song_id int PRIMARY KEY, mixtape_id int NOT NULL REFERENCES mixtapes(mixtape_id) ON DELETE CASCADE, title text NOT NULL);
INSERT INTO mixtapes (mixtape_id, title) VALUES (1, 'Morning Run'), (2, 'Late Night');
INSERT INTO mixtape_songs (song_id, mixtape_id, title) VALUES (1, 1, 'Fast Start'), (2, 1, 'Hill Sprint'), (3, 2, 'Slow Jam'), (4, 2, 'Wind Down');
DELETE FROM mixtapes WHERE mixtape_id = 1;
SELECT song_id, mixtape_id, title FROM mixtape_songs ORDER BY song_id`);
  await q("banking", "ex-da2", `DELETE FROM loan_payments WHERE loan_id = 8 AND paid_on > DATE '2026-08-31' RETURNING payment_id, loan_id, paid_on, amount`);
  await q("retail", "ex-da3", `CREATE TABLE import_prices (product_id int PRIMARY KEY, price numeric(10,2) NOT NULL);
INSERT INTO import_prices (product_id, price) VALUES (1, 199.00), (2, -49.00), (3, 89.00), (4, -9.99), (5, 59.00);
DELETE FROM import_prices WHERE price < 0 RETURNING product_id, price;
ALTER TABLE import_prices ADD CONSTRAINT prices_nonnegative CHECK (price >= 0);
SELECT product_id, price FROM import_prices ORDER BY product_id`);
  await q("ecommerce", "ex-da4", `UPDATE products SET price = round(price * 0.95, 2) WHERE category = 'Gaming' RETURNING product_id, name, price;
UPDATE products SET price = price + 2.00 WHERE product_id = 24 RETURNING product_id, name, price;
SELECT product_id, name, price FROM products WHERE product_id IN (17, 18, 19, 24) ORDER BY product_id`);

  /* ---------------- D-04 type demos ---------------- */
  await q(null, "d04-float-sum", `SELECT 0.1::numeric(10,2) + 0.2::numeric(10,2) AS exact_sum, 0.1::real + 0.2::real AS float_sum`);
  await q(null, "d04-drift-100", `SELECT sum(0.1::numeric(10,2)) AS exact_ledger, sum(0.1::real) AS float_ledger FROM generate_series(1, 100) AS n`);
  await q(null, "d04-division", `SELECT 1 / 2 AS int_half, 1.0 / 2 AS exact_half`);
  await q(null, "d04-dates", `SELECT DATE '2026-11-14' AS fixed_today, TIMESTAMP '2026-11-14 09:30:00' AS alarm, DATE '2026-12-25' - DATE '2026-11-14' AS days_until_holidays`);
  await q(null, "d04-boolean", `SELECT true AND false AS and_result, true OR false AS or_result, NOT true AS not_result`);
  await q(null, "d04-int-overflow-create", `CREATE TABLE big_values (val int NOT NULL)`);
  await q(null, "d04-int-overflow-insert", `INSERT INTO big_values (val) VALUES (3000000000)`);
  await q(null, "d04-varchar-create", `CREATE TABLE notes (subject varchar(10) NOT NULL, body text NOT NULL)`);
  await q(null, "d04-varchar-ok", `INSERT INTO notes (subject, body) VALUES ('week 3', 'The toast landed butter-side down twice, the bike got a flat, and the database class was cancelled.')`);
  await q(null, "d04-varchar-long", `INSERT INTO notes (subject, body) VALUES ('week three notes', 'x')`);

  /* ---------------- D-03 constraint errors (scratch) ---------------- */
  const s = await db(null);
  await s.exec(`CREATE TABLE clubs (
  club_id int PRIMARY KEY,
  name    text NOT NULL UNIQUE,
  email   text NOT NULL UNIQUE,
  dues    numeric(6,2) NOT NULL CHECK (dues >= 0)
)`);
  await s.exec(`CREATE TABLE club_members (
  member_id int PRIMARY KEY,
  club_id   int NOT NULL REFERENCES clubs(club_id),
  member_name text NOT NULL,
  joined     date NOT NULL
)`);
  await s.exec(`INSERT INTO clubs (club_id, name, email, dues) VALUES
  (1, 'Trail Runners', 'run@example.com', 15.00),
  (2, 'Photo Walks', 'photo@example.com', 0.00),
  (3, 'Chess Circle', 'chess@example.com', 5.00)`);
  await s.exec(`INSERT INTO club_members (member_id, club_id, member_name, joined) VALUES
  (1, 1, 'Ana Petrov', DATE '2026-02-01'),
  (2, 1, 'Ben Okafor', DATE '2026-02-10'),
  (3, 2, 'Cleo Fontaine', DATE '2026-03-05'),
  (4, 3, 'Dmitri Volkov', DATE '2026-03-18')`);
  await q(null, "d03-notnull-err", `INSERT INTO clubs (club_id, name, email, dues) VALUES (4, NULL, 'new@example.com', 10.00)`);
  await q(null, "d03-unique-err", `INSERT INTO clubs (club_id, name, email, dues) VALUES (4, 'New Club', 'run@example.com', 10.00)`);
  await q(null, "d03-check-err", `INSERT INTO clubs (club_id, name, email, dues) VALUES (4, 'New Club', 'new@example.com', -10.00)`);
  await q(null, "d03-pk-err", `INSERT INTO clubs (club_id, name, email, dues) VALUES (1, 'Clone Club', 'clone@example.com', 10.00)`);
  await q(null, "d03-fk-err", `INSERT INTO club_members (member_id, club_id, member_name, joined) VALUES (5, 99, 'Elena Vik', DATE '2026-04-01')`);
  await q(null, "d03-fk-delete-err", `DELETE FROM clubs WHERE club_id = 1`);

  /* ---------------- D-06 identity errors (scratch) ---------------- */
  const s2 = await db(null);
  await s2.exec(`CREATE TABLE hand_numbered (id int PRIMARY KEY, label text NOT NULL)`);
  await q(null, "d06-hand-ok", `INSERT INTO hand_numbered (id, label) VALUES (1, 'first clerk row')`);
  await q(null, "d06-hand-dup", `INSERT INTO hand_numbered (id, label) VALUES (1, 'second clerk row')`);
  await s2.exec(`CREATE TABLE signups (
  signup_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person    text NOT NULL,
  logged    date NOT NULL
)`);
  await q(null, "d06-identity-explicit", `INSERT INTO signups (signup_id, person, logged) VALUES (99, 'Explicit Id', DATE '2026-11-03')`);
  await q(null, "d06-override", `INSERT INTO signups (signup_id, person, logged) OVERRIDING SYSTEM VALUE VALUES (99, 'Backfill Row', DATE '2026-11-03')`);

  /* ---------------- D lesson lab starters ---------------- */
  await q(null, "lab-d01", `CREATE TABLE team_tasks (
  task_id   int PRIMARY KEY,
  task      text NOT NULL,
  owner     text,
  status    text NOT NULL DEFAULT 'open',
  hours     int NOT NULL DEFAULT 0
);
INSERT INTO team_tasks (task_id, task, owner, status, hours) VALUES
  (1, 'Write the launch email', 'Priya', 'open', 3),
  (2, 'Fix the checkout bug', 'Marcus', 'open', 8),
  (3, 'Call the supplier', NULL, 'open', 1),
  (4, 'Update the roadmap', 'Sofia', 'done', 2);
UPDATE team_tasks SET status = 'done', hours = 6 WHERE task_id = 2 RETURNING task_id, task, status, hours;
SELECT task_id, task, owner, status, hours FROM team_tasks ORDER BY task_id`);
  await q(null, "lab-d02", `CREATE TABLE temp_signups (
  signup_id int PRIMARY KEY,
  email     text NOT NULL,
  confirmed boolean NOT NULL DEFAULT false,
  created   date NOT NULL
);
INSERT INTO temp_signups (signup_id, email, confirmed, created) VALUES
  (1, 'a@example.com', true,  DATE '2026-11-01'),
  (2, 'b@example.com', false, DATE '2026-11-02'),
  (3, 'c@example.com', false, DATE '2026-11-05'),
  (4, 'd@example.com', true,  DATE '2026-11-06');
SELECT * FROM temp_signups WHERE confirmed = false ORDER BY signup_id;
DELETE FROM temp_signups WHERE confirmed = false RETURNING signup_id, email;
SELECT count(*) AS remaining FROM temp_signups`);
  await q("ecommerce", "lab-d05", `SELECT product_id, name, rating
FROM products
WHERE rating IS NULL
ORDER BY product_id`);
  await q("ecommerce", "lab-d05b", `SELECT product_id, name, rating
FROM products
WHERE rating = NULL
ORDER BY product_id`);
  await q(null, "lab-d06", `CREATE TABLE waitlist (
  position_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person      text NOT NULL,
  added       date NOT NULL
);
INSERT INTO waitlist (person, added) VALUES ('Ana Petrov', DATE '2026-11-01') RETURNING position_id, person;
INSERT INTO waitlist (person, added) VALUES ('Ben Okafor', DATE '2026-11-02') RETURNING position_id, person;
DELETE FROM waitlist WHERE person = 'Ana Petrov';
INSERT INTO waitlist (person, added) VALUES ('Cleo Fontaine', DATE '2026-11-03') RETURNING position_id, person;
SELECT position_id, person FROM waitlist ORDER BY position_id`);

  /* d-07 rescue labs */
  const s3 = await db(null);
  await s3.exec(`DROP TABLE IF EXISTS legacy_contacts CASCADE;
CREATE TABLE legacy_contacts (
  contact_id     int PRIMARY KEY,
  full_name      text,
  email          text,
  status         text,
  lifetime_value numeric(10,2)
)`);
  await s3.exec(`INSERT INTO legacy_contacts (contact_id, full_name, email, status, lifetime_value) VALUES
  (1, 'Ana Petrov',    'ana@example.com',    'active',   120.00),
  (2, 'Ben Okafor',    'ben@example.com',    'ACTIVE',    45.50),
  (3, NULL,            'ghost@example.com',  'active',     0.00),
  (4, 'Ana Petrov',    'ana@example.com',    'active',   120.00),
  (5, 'Cleo Fontaine', 'cleo@example.com',   'inactive', -30.00),
  (6, 'Dmitri Volkov', 'dmitri@example.com', 'active',    75.00)`);
  await q(null, "lab-d07-dupes", `SELECT * FROM legacy_contacts ORDER BY email`);
  await q(null, "lab-d07-fix-status", `UPDATE legacy_contacts SET status = 'active' WHERE status = 'ACTIVE' RETURNING contact_id, status`);
  await q(null, "lab-d07-fix-value", `UPDATE legacy_contacts SET lifetime_value = 0.00 WHERE lifetime_value < 0 RETURNING contact_id, lifetime_value`);
  await q(null, "lab-d07-delete", `DELETE FROM legacy_contacts WHERE full_name IS NULL OR contact_id = 4 RETURNING contact_id, full_name`);
  await q(null, "lab-d07-alter", `ALTER TABLE legacy_contacts ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE legacy_contacts ADD CONSTRAINT legacy_email_unique UNIQUE (email);
ALTER TABLE legacy_contacts ADD CONSTRAINT legacy_value_nonneg CHECK (lifetime_value >= 0);
SELECT contact_id, full_name, email, status, lifetime_value FROM legacy_contacts ORDER BY contact_id`);

  /* e-06 reporting lab starters */
  await q("hr", "lab-e06-hr", `SELECT dept_id, count(*) AS headcount, round(avg(salary), 2) AS avg_salary
FROM employees
WHERE terminated IS NULL
GROUP BY dept_id
ORDER BY dept_id`);
  await q("banking", "lab-e06-monthly", `SELECT to_char(occurred_at, 'YYYY-MM') AS month, count(*) AS txns,
       sum(amount) FILTER (WHERE txn_type = 'deposit') AS deposited,
       sum(amount) FILTER (WHERE txn_type = 'withdrawal') AS withdrawn
FROM transactions
GROUP BY to_char(occurred_at, 'YYYY-MM')
ORDER BY month`);
  await q("retail", "lab-e06-inventory", `SELECT store_id, count(*) AS products_stocked, sum(on_hand) AS units_on_hand,
       count(*) FILTER (WHERE on_hand < reorder_level) AS below_reorder
FROM inventory
GROUP BY store_id
ORDER BY store_id`);
  await q("hospital", "lab-e06-abnormal", `SELECT test_name, count(*) AS total, count(*) FILTER (WHERE is_abnormal) AS abnormal,
       round(100.0 * count(*) FILTER (WHERE is_abnormal) / count(*), 1) AS pct_abnormal
FROM lab_results
GROUP BY test_name
HAVING count(*) >= 3
ORDER BY pct_abnormal DESC`);
  await q("ecommerce", "lab-e06-revenue", `SELECT status, count(*) AS orders, sum(total) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC`);
  await q("banking", "lab-e01-banking", `SELECT count(*) AS txns, min(amount) AS smallest, max(amount) AS largest, sum(amount) AS total_moved
FROM transactions`);
  await q("banking", "lab-e03-banking", `SELECT account_id, count(*) AS txns
FROM transactions
GROUP BY account_id
HAVING count(*) >= 10
ORDER BY account_id`);
  await q("banking", "lab-e02-channel", `SELECT channel, count(*) AS txns
FROM transactions
GROUP BY channel
ORDER BY channel`);
  await q("retail", "lab-e05-retail", `SELECT store_id, count(*) AS products_stocked, sum(on_hand) AS units_on_hand, round(avg(on_hand), 1) AS avg_units
FROM inventory
GROUP BY store_id
ORDER BY store_id`);
  await q("hospital", "lab-e04-hospital", `SELECT test_name, count(*) AS total, count(*) FILTER (WHERE is_abnormal) AS abnormal
FROM lab_results
GROUP BY test_name
HAVING count(*) >= 2
ORDER BY test_name`);
}

main();
