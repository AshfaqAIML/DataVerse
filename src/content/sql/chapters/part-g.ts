/**
 * Part G — Subqueries, CTEs & CASE.
 *
 * Queries inside queries: subqueries in WHERE, SELECT and FROM, correlated
 * subqueries with EXISTS, Common Table Expressions as named pipelines,
 * CASE for logic inside a query, and bounded recursive CTEs for trees.
 * Every verified output comes from the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_G: Part = {
  letter: "G",
  title: "Subqueries, CTEs & CASE",
  tagline: "Queries within queries, named pipelines with WITH, logic with CASE, and loops with recursive CTEs.",
  description:
    "Some questions are too shaped for one flat query: compare rows against sets the database computes, aggregate each one-to-many side before it multiplies the other, walk prerequisite chains and org charts of unknown depth. Part G hands you the four tools that make such questions tractable: subqueries in WHERE, SELECT and FROM; correlated subqueries with EXISTS — the cleanest 'never' in SQL; Common Table Expressions that turn long queries into named, step-by-step pipelines; CASE for labels, priorities and per-category counts; and recursive CTEs, SQL's loop, always bounded.",
  stub: false,
  lessons: [
    {
      slug: "g-01",
      title: "Subqueries in WHERE",
      minutes: 14,
      summary: "IN (subquery) compares against sets the database computes, NOT IN hides a NULL trap, ANY/ALL compare against whole sets, and scalar subqueries act as single values.",
      kind: "coding",
      dataset: "hr",
      objectives: [
        "Filter with IN (subquery) against a set the database computes",
        "Recognize and defuse the NOT IN NULL trap",
        "Compare one value against a whole set with ANY and ALL",
        "Use a scalar subquery as a single value in a comparison",
      ],
      why: "'Which customers hold a savings account?' needs two facts glued together: the account list and the customer list. Until now you either joined the tables or typed the ids by hand — but the values live in the database, and SQL can fetch them mid-query. A subquery is a query inside a query: the inner SELECT builds the set, the outer one uses it. This lesson puts subqueries to work in WHERE — and shows the one trap (NOT IN with NULLs) that every SQL learner hits exactly once.",
      blocks: [
        {
          kind: "text",
          text: "Every WHERE condition you have written so far compared a column to a value you knew: `salary > 150000`, `city = 'Austin'`. Most real questions compare against a set you do NOT know in advance — the departments that are remote, the ids of customers with savings accounts. A **subquery** computes that set inside the statement:",
        },
        {
          kind: "sql",
          title: "Who works in a remote department?",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       d.name AS department
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.dept_id IN (SELECT dept_id
                    FROM departments
                    WHERE location = 'Remote')
  AND e.terminated IS NULL
ORDER BY e.employee_id;`,
          result: { columns: ["employee", "job_title", "department"], rows: [
        ["Freya Johansson", "Marketing Manager", "Marketing"],
        ["Omar Haddad", "Content Strategist", "Marketing"],
        ["Tara Singh", "Analytics Engineer", "Data"],
      ] },
          explain: [
            "The inner SELECT (SELECT dept_id FROM departments WHERE location = 'Remote') runs first and builds the set {5, 8} — Marketing and Data.",
            "The outer query keeps employees whose dept_id is IN that set; the join decorates each with the department name.",
            "You never typed a 5 or an 8 — the day Marketing opens a third remote department, this same query is still correct.",
          ],
        },
        { kind: "heading", text: "NOT IN — and the trap" },
        {
          kind: "sql",
          title: "Employees who are nobody's manager",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee
FROM employees e
WHERE e.employee_id NOT IN (SELECT manager_id FROM employees);`,
          result: { columns: ["employee"], rows: [], command: "SELECT" },
          explain: [
            "The question: employees whose id appears nowhere in the manager_id column — HeliosWorks has eighteen such people. The output: zero rows.",
            "The CEO's manager_id is NULL, and that NULL rides along in the subquery's result. For every outer row, `id NOT IN (..., NULL)` evaluates to unknown — and unknown fails the filter. One NULL poisons the whole set.",
          ],
        },
        {
          kind: "sql",
          title: "The fix: guard the NULLs inside",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title
FROM employees e
WHERE e.employee_id NOT IN (SELECT manager_id
                            FROM employees
                            WHERE manager_id IS NOT NULL)
  AND e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 6;`,
          result: { columns: ["employee", "job_title"], rows: [
        ["Gerald Weiss", "Head of People"],
        ["Elena Petrova", "Senior Backend Engineer"],
        ["James Okoro", "Senior Backend Engineer"],
        ["Aisha Rahman", "Backend Engineer"],
        ["Tom Lindqvist", "Backend Engineer"],
        ["Grace Park", "Senior Frontend Engineer"],
      ] },
          explain: [
            "WHERE manager_id IS NOT NULL inside the subquery strips the NULL before the set is built — NOT IN now behaves.",
            "Eighteen current employees manage nobody; the first six by employee_id are shown. Gerald Weiss leads the People Ops department but nobody reports to him directly.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "NOT IN is the one form NULLs can break",
          text: "If the subquery's column can be NULL, filter the NULLs out inside — or switch to NOT EXISTS (lesson g-03), which is immune to this trap entirely. IN never has the problem: `x IN (..., NULL)` still finds the matches that exist.",
        },
        { kind: "heading", text: "ANY and ALL — comparing against a set" },
        {
          kind: "sql",
          title: "Out-earning an entire department",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       e.salary
FROM employees e
WHERE e.salary > ALL (SELECT e2.salary
                      FROM employees e2
                      WHERE e2.dept_id = 4)
  AND e.terminated IS NULL
ORDER BY e.salary DESC;`,
          result: { columns: ["employee", "job_title", "salary"], rows: [
        ["Amara Osei", "Chief Executive Officer", "385000.00"],
        ["Daniel Kramer", "VP of Engineering", "245000.00"],
      ] },
          explain: [
            "salary > ALL (the sales salaries) asks: is this salary greater than EVERY value in the set? That is exactly salary > max(set) — out-earn even the VP of Sales at $232,000.",
            "Only two people clear that bar: the CEO and the VP of Engineering.",
            "The twin operator ANY flips the bar: salary > ANY (set) means greater than at least one value — salary > min(set), here Victor Adeyemi's $82,000. Try it in the lab below: a whole different question from the same subquery.",
          ],
        },
        { kind: "heading", text: "Scalar subqueries — one value, computed" },
        {
          kind: "sql",
          title: "Above the company average",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       e.salary
FROM employees e
WHERE e.salary > (SELECT avg(e2.salary)
                  FROM employees e2
                  WHERE e2.terminated IS NULL)
  AND e.terminated IS NULL
ORDER BY e.salary DESC;`,
          result: { columns: ["employee", "job_title", "salary"], rows: [
        ["Amara Osei", "Chief Executive Officer", "385000.00"],
        ["Daniel Kramer", "VP of Engineering", "245000.00"],
        ["Sofia Mancini", "VP of Sales", "232000.00"],
        ["Priya Nair", "VP of Product", "228000.00"],
        ["Lena Hoffman", "Engineering Manager", "198000.00"],
        ["Marcus Tran", "Engineering Manager", "192000.00"],
        ["Robert McAllister", "Principal Product Manager", "186000.00"],
        ["Gerald Weiss", "Head of People", "175000.00"],
        ["Elena Petrova", "Senior Backend Engineer", "168000.00"],
        ["James Okoro", "Senior Backend Engineer", "162000.00"],
      ] },
          explain: [
            "The subquery returns a single number — the average current salary, $158,928.57 — so it slots into the comparison like a literal you never had to type.",
            "Ten current employees earn above it; the subquery's own WHERE excludes the two departed colleagues from the average too.",
          ],
        },
        {
          kind: "sql",
          title: "A scalar position demands one row",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.salary
FROM employees e
WHERE e.salary > (SELECT e2.salary
                  FROM employees e2
                  WHERE e2.dept_id = 4);`,
          expectError: "more than one row returned by a subquery used as an expression",
          explain: [
            "The subquery returns four salaries, not one — a scalar position accepts exactly one row and one column.",
            "Two fixes: aggregate it — (SELECT max(salary) FROM ...) — or switch to > ALL, which is built for whole sets.",
          ],
        },
        {
          kind: "lab",
          title: "Accounts outside headquarters",
          task: "On Meridian Trust: accounts held at branches OUTSIDE Springfield — account_id, account_type and balance, using IN with a subquery over branches, ordered by account_id, first six rows. Expected columns: account_id, account_type, balance.",
          code: `SELECT a.account_id, a.account_type, a.balance
FROM accounts a
WHERE a.branch_id IN (SELECT branch_id
                      FROM branches
                      WHERE city <> 'Springfield')
ORDER BY a.account_id
LIMIT 6;`,
          dataset: "banking",
          hint: "The subquery builds the set of non-Springfield branch ids; IN keeps the accounts sitting at them.",
        },
      ],
      terms: [
        { term: "Subquery", definition: "A SELECT inside another statement — the inner query's result feeds the outer one." },
        { term: "IN (subquery)", definition: "Keeps rows whose value appears in the set the subquery computes." },
        { term: "Scalar subquery", definition: "A subquery used as a single value — it must return at most one row and one column." },
        { term: "ANY / ALL", definition: "Compare one value against a whole set: ANY = at least one member, ALL = every member." },
      ],
      mistakes: [
        {
          mistake: "NOT IN over a nullable column",
          why: "A single NULL in the subquery's result makes every comparison unknown — the query returns zero rows, silently.",
          fix: "Filter the NULLs out inside the subquery (WHERE col IS NOT NULL) or use NOT EXISTS, which never compares values.",
        },
        {
          mistake: "A set-sized subquery in a scalar position",
          why: "PostgreSQL stops with 'more than one row returned by a subquery used as an expression' — the engine refuses to guess which row you meant.",
          fix: "Collapse the set to one value with an aggregate (max, avg, sum), or compare against the whole set with ANY/ALL.",
        },
        {
          mistake: "Hand-typing id lists instead of a subquery",
          why: "It works today and rots tomorrow — the data changes under you, and nobody re-types the list when it does.",
          fix: "Let the subquery read the live set: the query stays correct as the data moves.",
        },
      ],
      takeaways: [
        "A subquery computes the comparison set inside the statement — no hand-typed ids, no staleness.",
        "NOT IN + NULL = an empty result; guard the subquery or use NOT EXISTS.",
        "> ALL means greater than the maximum; > ANY means greater than the minimum — decode before you write.",
        "A scalar subquery must return one value; aggregate it or reach for ANY/ALL.",
      ],
      quiz: [
        {
          id: "g-01-q1",
          prompt: "employee_id NOT IN (SELECT manager_id FROM employees) returns zero rows. Why?",
          options: [
            { text: "The CEO's NULL manager_id rides along, and x NOT IN (..., NULL) is unknown for every row", correct: true, feedback: "Correct — one NULL poisons the whole set." },
            { text: "Every employee is somebody's manager at HeliosWorks", correct: false, feedback: "Eighteen current employees manage nobody — the empty result is a bug, not a fact." },
            { text: "NOT IN requires DISTINCT to work", correct: false, feedback: "Duplicates are harmless here; NULLs are the poison." },
          ],
          explanation: "NOT IN compares values, and comparisons with NULL are unknown — unknown fails the filter for every single row.",
        },
        {
          id: "g-01-q2",
          prompt: "salary > ANY (the sales salaries) is true when salary is greater than...",
          options: [
            { text: "At least one salary in the set — equivalently, greater than the minimum", correct: true, feedback: "Correct — ANY lowers the bar to the smallest member." },
            { text: "Every salary in the set — the maximum", correct: false, feedback: "That is > ALL; ANY is the easier bar." },
            { text: "The average salary in the set", correct: false, feedback: "Averages have nothing to do with ANY — that would be a scalar avg() subquery." },
          ],
          explanation: "ANY asks 'does at least one member satisfy the comparison?' — so > ANY is > min. ALL asks it for every member, so > ALL is > max.",
        },
      ],
    },

    {
      slug: "g-02",
      title: "Subqueries in SELECT and FROM",
      minutes: 13,
      summary: "Scalar subqueries compute a column per row, derived tables build tables to join, and aggregate-then-join keeps multi-fact sums honest.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Compute a per-row column with a scalar subquery in SELECT",
        "Build a derived table in FROM and join it like any table",
        "Explain why sums through a fan-out lie",
        "Apply the aggregate-then-join pattern to reconcile two one-to-many facts",
      ],
      why: "Filtering is only half of what subqueries do — the other half is COMPUTE. A scalar subquery in the SELECT list puts a computed number beside every row: a per-department headcount without a GROUP BY in sight. A derived table in FROM runs a whole aggregate query first and hands you its result as a table you can join. And when one query must aggregate two DIFFERENT one-to-many facts, aggregating before joining is the difference between numbers that reconcile and numbers that quietly lie.",
      blocks: [
        {
          kind: "text",
          text: "Subqueries so far filtered rows. Two more positions unlock computation: in the **SELECT list** (a value computed per row) and in the **FROM clause** (a whole table built by a query — a *derived table*):",
        },
        {
          kind: "sql",
          title: "A headcount column, no GROUP BY",
          dataset: "hr",
          code: `SELECT d.name AS department,
       (SELECT count(*)
        FROM employees e
        WHERE e.dept_id = d.dept_id
          AND e.terminated IS NULL) AS headcount
FROM departments d
ORDER BY headcount DESC, d.name;`,
          result: { columns: ["department", "headcount"], rows: [
        ["Engineering", "12"],
        ["Product", "5"],
        ["Sales", "4"],
        ["Customer Success", "2"],
        ["Marketing", "2"],
        ["Data", "1"],
        ["Executive", "1"],
        ["People Ops", "1"],
      ] },
          explain: [
            "For EACH department row, the scalar subquery counts that department's current employees — the inner query reads d.dept_id from the outer row (a correlated reference; g-03 makes them official).",
            "Eight departments, eight counts, no GROUP BY and no join: each row simply carries its own answer.",
            "Note the trade-off: it reads like English, but the engine may run the inner count once per department — fine at eight rows, worth a thought at eight million.",
          ],
        },
        {
          kind: "sql",
          title: "A derived table: summarize, then join",
          code: `SELECT p.name,
       r.n_reviews,
       round(r.avg_stars, 2) AS avg_stars
FROM (SELECT product_id,
             count(*) AS n_reviews,
             avg(stars) AS avg_stars
      FROM reviews
      GROUP BY product_id) AS r
JOIN products p ON p.product_id = r.product_id
ORDER BY r.n_reviews DESC, p.product_id
LIMIT 6;`,
          result: { columns: ["name", "n_reviews", "avg_stars"], rows: [
        ["SoundCore ANC Headphones", "6", "4.67"],
        ["WorkMate 15 Business", "2", "2.50"],
        ["PulseFit 5 Smartwatch", "2", "3.50"],
        ["PulseFit SE Tracker", "2", "4.50"],
        ["Altitude GPS Watch", "2", "4.50"],
        ["Optiq 50mm Prime Lens", "2", "4.50"],
      ] },
          explain: [
            "The subquery in FROM builds a temporary result — one row per reviewed product with its count and average — and the AS names it r.",
            "The outer query joins r to products exactly like a table. The alias is not optional: PostgreSQL demands one for every derived table.",
            "Products with zero reviews (the StudioBook X, for one) drop out — an inner join to a summary keeps only summarized rows. When the zeros matter, LEFT JOIN from products instead.",
          ],
        },
        { kind: "heading", text: "The fan-out lie" },
        {
          kind: "sql",
          title: "Two one-to-many facts, joined naively",
          code: `SELECT o.order_id,
       round(sum(oi.quantity * oi.unit_price), 2) AS items_value,
       round(sum(p.amount), 2) AS payments_summed
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN payments p    ON p.order_id = o.order_id
GROUP BY o.order_id
ORDER BY o.order_id
LIMIT 4;`,
          result: { columns: ["order_id", "items_value", "payments_summed"], rows: [
        ["1", "1407.00", "4221.00"],
        ["2", "378.00", "756.00"],
        ["3", "249.00", "249.00"],
        ["5", "129.00", "129.00"],
      ] },
          explain: [
            "The question: each order's item value beside what was actually paid. Order 1's items are worth $1,407.00 — but payments_summed says $4,221.00, exactly three times the real payment.",
            "The cause: orders fans out into order_items (3 rows for order 1) AND payments (1 row). The single payment row repeats once per item, and sum() happily adds all three copies.",
            "Orders 3 and 5 have a single item, so their numbers look right — fan-out bugs hide in plain sight, on exactly the rows that happen to be simple.",
          ],
        },
        {
          kind: "sql",
          title: "Aggregate first, then join",
          code: `SELECT o.order_id,
       items.items_value,
       pay.amount_paid
FROM (SELECT order_id,
             sum(quantity * unit_price) AS items_value
      FROM order_items
      GROUP BY order_id) AS items
JOIN (SELECT order_id,
             sum(amount) AS amount_paid
      FROM payments
      GROUP BY order_id) AS pay
  ON pay.order_id = items.order_id
JOIN orders o ON o.order_id = items.order_id
ORDER BY o.order_id
LIMIT 4;`,
          result: { columns: ["order_id", "items_value", "amount_paid"], rows: [
        ["1", "1407.00", "1407.00"],
        ["2", "378.00", "378.00"],
        ["3", "249.00", "249.00"],
        ["5", "129.00", "129.00"],
      ] },
          explain: [
            "Each one-to-many side is collapsed to one row per order FIRST — items_value in one derived table, amount_paid in another — and then the two summaries join as equals.",
            "Order 1 now reconciles: $1,407.00 in items, $1,407.00 paid. This is the aggregate-then-join pattern, and it is how honest multi-fact reports are built.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The aggregate-then-join rule",
          text: "Whenever a query aggregates two DIFFERENT one-to-many facts about the same rows (items per order, payments per order), aggregate each side in its own derived table or CTE first, then join the summaries. Joining first multiplies; aggregating first reconciles.",
        },
        {
          kind: "lab",
          title: "Category revenue from the line items",
          task: "On ShopSphere: revenue per category computed from the line items — round(sum(quantity * unit_price), 2) per category inside a derived table over order_items JOIN products, then joined to categories for the names, highest revenue first. Expected columns: category, revenue.",
          code: `SELECT c.name AS category,
       rev.revenue
FROM (SELECT p.category_id,
             round(sum(oi.quantity * oi.unit_price), 2) AS revenue
      FROM order_items oi
      JOIN products p ON p.product_id = oi.product_id
      GROUP BY p.category_id) AS rev
JOIN categories c ON c.category_id = rev.category_id
ORDER BY rev.revenue DESC;`,
          hint: "The derived table does the aggregating (and its own joining); the outer query only attaches the category names.",
        },
      ],
      terms: [
        { term: "Scalar subquery (in SELECT)", definition: "A one-value subquery in the SELECT list, computed for each row of the outer query." },
        { term: "Derived table", definition: "A subquery in the FROM clause with an alias — a temporary table built by a query, joinable like any table." },
        { term: "Fan-out", definition: "Row multiplication when one join meets two one-to-many relationships — repeated rows make sums lie." },
        { term: "Aggregate-then-join", definition: "Collapse each one-to-many side to one row per key before joining; never sum through a fan-out." },
      ],
      mistakes: [
        {
          mistake: "Summing through a fan-out",
          why: "Each far-side row repeats the other side's values, so sums count copies: $1,407 becomes $4,221 without a single wrong input row.",
          fix: "Aggregate each one-to-many side in its own derived table or CTE, then join the one-row-per-key summaries.",
        },
        {
          mistake: "Forgetting the derived table's alias",
          why: "PostgreSQL rejects it outright: 'subquery in FROM must have an alias'.",
          fix: "Always close the parentheses with AS alias — the outer query needs a name to reference.",
        },
        {
          mistake: "A SELECT-list subquery that returns several rows",
          why: "Same refusal as a scalar comparison: one value per row is the contract, and the engine enforces it.",
          fix: "Wrap the subquery in an aggregate (count, max, sum) so it yields exactly one value per outer row.",
        },
      ],
      takeaways: [
        "SELECT-list subqueries compute a value per row; FROM-clause subqueries (derived tables) build tables to join.",
        "Derived tables need an alias and then behave exactly like tables.",
        "Aggregate each one-to-many side before joining — sums through fan-outs lie.",
        "Inner-joined summaries lose the zero groups — outer-join from the kept side when zeros matter.",
      ],
      quiz: [
        {
          id: "g-02-q1",
          prompt: "Why did payments_summed report $4,221.00 for order 1?",
          options: [
            { text: "The one payment row repeats once per line item, and sum() adds every copy", correct: true, feedback: "Correct — 1,407 x 3 items = 4,221, the fan-out in action." },
            { text: "The payment included tax and shipping", correct: false, feedback: "The payments table stores the plain amount — the multiplication is the whole story." },
            { text: "round() doubled the value somewhere", correct: false, feedback: "round only formats; it never multiplies." },
          ],
          explanation: "A join repeats rows on the many side; sum() then counts the copies. Aggregate each side first, and the copies never meet.",
        },
        {
          id: "g-02-q2",
          prompt: "What is a derived table?",
          options: [
            { text: "A subquery in FROM with an alias, usable in the outer query like a table", correct: true, feedback: "Correct — a query-shaped temporary table for this one statement." },
            { text: "A permanent table created by a SELECT statement", correct: false, feedback: "SELECT never creates tables — the derived table lives for one statement only." },
            { text: "A view stored in the schema", correct: false, feedback: "Views are named schema objects; derived tables are anonymous and statement-local." },
          ],
          explanation: "Derived table = subquery in FROM + mandatory alias. The outer query joins, filters and sorts it exactly like a base table.",
        },
      ],
    },

    {
      slug: "g-03",
      title: "Correlated subqueries and EXISTS",
      minutes: 14,
      summary: "The inner query reads the outer row: correlated comparisons per row, and EXISTS / NOT EXISTS — the cleanest 'never' in SQL.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Write a correlated subquery that references the outer row",
        "Answer 'does a related row exist?' with EXISTS",
        "Find never-referenced rows with NOT EXISTS (the clean anti-join)",
        "Say when EXISTS beats IN and when NOT IN breaks",
      ],
      why: "Uncorrelated subqueries run once, blind to the outer query. Correlated subqueries read the outer row: the inner query is evaluated once per row, asking a question ABOUT that row — 'does THIS customer have a delivered order?', 'is THIS salary above ITS department's average?'. That per-row question is exactly what EXISTS expresses, and NOT EXISTS is the cleanest 'no match exists anywhere' tool in SQL: immune to the NULL trap that poisons NOT IN, clearer than LEFT JOIN ... IS NULL, and the engine can stop scanning at the first matching row.",
      blocks: [
        {
          kind: "text",
          text: "A correlated subquery mentions the outer query's table inside itself — `e2.dept_id = e.dept_id` below. For every outer row, the inner query re-runs with that row's values in hand:",
        },
        {
          kind: "sql",
          title: "Above THEIR department's average",
          dataset: "hr",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       e.salary,
       (SELECT round(avg(e2.salary), 2)
        FROM employees e2
        WHERE e2.dept_id = e.dept_id
          AND e2.terminated IS NULL) AS dept_avg
FROM employees e
WHERE e.salary > (SELECT avg(e2.salary)
                  FROM employees e2
                  WHERE e2.dept_id = e.dept_id
                    AND e2.terminated IS NULL)
  AND e.terminated IS NULL
ORDER BY e.salary DESC
LIMIT 8;`,
          result: { columns: ["employee", "job_title", "salary", "dept_avg"], rows: [
        ["Daniel Kramer", "VP of Engineering", "245000.00", "155166.67"],
        ["Sofia Mancini", "VP of Sales", "232000.00", "143500.00"],
        ["Priya Nair", "VP of Product", "228000.00", "169800.00"],
        ["Lena Hoffman", "Engineering Manager", "198000.00", "155166.67"],
        ["Marcus Tran", "Engineering Manager", "192000.00", "155166.67"],
        ["Robert McAllister", "Principal Product Manager", "186000.00", "169800.00"],
        ["Elena Petrova", "Senior Backend Engineer", "168000.00", "155166.67"],
        ["James Okoro", "Senior Backend Engineer", "162000.00", "155166.67"],
      ] },
          explain: [
            "The inner average depends on the OUTER row: $155,166.67 for engineers, $143,500.00 for salespeople — a different bar for every department, computed row by row.",
            "Daniel Kramer clears Engineering's bar; Sofia Mancini clears Sales'. One question — 'above your own department's average?' — answered per row, without a single GROUP BY.",
            "The same correlation powers the dept_avg column: the displayed number and the comparison use the same inner query.",
          ],
        },
        { kind: "heading", text: "EXISTS — the yes/no question" },
        {
          kind: "sql",
          title: "Customers with at least one delivered order",
          code: `SELECT c.customer_id,
       c.first_name || ' ' || c.last_name AS customer
FROM customers c
WHERE EXISTS (SELECT 1
              FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered')
ORDER BY c.customer_id
LIMIT 6;`,
          result: { columns: ["customer_id", "customer"], rows: [
        ["1", "Amelia Watson"],
        ["2", "Marcus Chen"],
        ["3", "Priya Sharma"],
        ["4", "Diego Alvarez"],
        ["5", "Hannah Kowalski"],
        ["6", "Tom Fletcher"],
      ] },
          explain: [
            "EXISTS asks one thing per customer: are there ANY rows in orders with this id and status 'delivered'? Seventeen customers qualify; six shown.",
            "SELECT 1 inside — the columns are irrelevant, EXISTS cares about existence, not values. SELECT * is equally correct; the 1 simply signals intent to human readers.",
            "The engine can stop at the FIRST matching row: for 'has any', finding one is enough. That early exit is why EXISTS is often the cheapest way to ask 'does a related row exist?'.",
          ],
        },
        {
          kind: "sql",
          title: "NOT EXISTS — the cleanest anti-join",
          code: `SELECT p.product_id, p.name, p.price
FROM products p
WHERE NOT EXISTS (SELECT 1
                  FROM order_items oi
                  WHERE oi.product_id = p.product_id)
ORDER BY p.product_id;`,
          result: { columns: ["product_id", "name", "price"], rows: [
        ["5", "BudgetBook 11 Everyday", "399.00"],
        ["19", "RacingWheel GT Set", "299.00"],
      ] },
          explain: [
            "NOT EXISTS flips the question: 'is there NO row?'. Two products have never appeared in any order item — the BudgetBook 11 and the RacingWheel GT Set.",
            "Part F answered this same question with LEFT JOIN ... WHERE oi.order_id IS NULL. NOT EXISTS states it directly: no padding to interpret, no join to picture.",
            "Both shapes are correct — professionals know both and pick the one that reads best in context.",
          ],
        },
        {
          kind: "sql",
          title: "Nobody's manager — revisited, without the poison",
          dataset: "hr",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title
FROM employees e
WHERE NOT EXISTS (SELECT 1
                  FROM employees e2
                  WHERE e2.manager_id = e.employee_id)
  AND e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 6;`,
          result: { columns: ["employee", "job_title"], rows: [
        ["Gerald Weiss", "Head of People"],
        ["Elena Petrova", "Senior Backend Engineer"],
        ["James Okoro", "Senior Backend Engineer"],
        ["Aisha Rahman", "Backend Engineer"],
        ["Tom Lindqvist", "Backend Engineer"],
        ["Grace Park", "Senior Frontend Engineer"],
      ] },
          explain: [
            "g-01's poisoned query — employee_id NOT IN (SELECT manager_id ...) — returned zero rows because of the CEO's NULL manager_id.",
            "NOT EXISTS never compares values: it only asks whether any employee's manager_id equals this id. NULLs have nothing to poison, and the eighteen non-managers surface (six shown).",
            "Rule of thumb: when the inner column can be NULL, NOT EXISTS is the safe spelling of 'never'.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "When EXISTS beats IN",
          text: "Three tells: (1) the inner column is nullable — IN dies on NULLs, EXISTS does not care; (2) the inner set is huge or duplicated — EXISTS stops at the first match instead of building the whole set; (3) the question is naturally 'does a related row exist?' — a correlated EXISTS reads exactly like the question, while IN hides a set you never look inside.",
        },
        {
          kind: "lab",
          title: "The course nobody takes",
          task: "On Northgate: courses with ZERO enrollments, with the professor who teaches them — code, title and professor (full name), using NOT EXISTS over enrollments, ordered by code. The brand-new quantum computing course is the expected find. Expected columns: code, title, professor.",
          code: `SELECT c.code,
       c.title,
       p.first_name || ' ' || p.last_name AS professor
FROM courses c
JOIN professors p ON p.prof_id = c.prof_id
WHERE NOT EXISTS (SELECT 1
                  FROM enrollments e
                  WHERE e.course_id = c.course_id)
ORDER BY c.code;`,
          dataset: "university",
          hint: "NOT EXISTS (any enrollment with this course_id) — one row is the answer, and one row is a finding, not a failure.",
        },
      ],
      terms: [
        { term: "Correlated subquery", definition: "A subquery that references the outer query's row — evaluated once per outer row." },
        { term: "EXISTS", definition: "True when the subquery returns at least one row — a pure existence check." },
        { term: "NOT EXISTS", definition: "True when no related row exists — the cleanest anti-join." },
        { term: "Anti-join", definition: "'Rows with no match in the other table' — spelled LEFT JOIN ... IS NULL or NOT EXISTS." },
      ],
      mistakes: [
        {
          mistake: "Unqualified columns inside a correlated subquery",
          why: "The engine resolves names innermost-first: a bare dept_id binds to the INNER table, silently comparing a column with itself (always true) instead of correlating.",
          fix: "Alias both sides (e vs e2) and qualify every column — e2.dept_id = e.dept_id says exactly which row each side comes from.",
        },
        {
          mistake: "Reaching for NOT IN on a nullable key",
          why: "The g-01 trap: one NULL in the inner column empties the entire result.",
          fix: "NOT EXISTS — it asks about existence, never compares values, and NULLs cannot touch it.",
        },
        {
          mistake: "Selecting real columns inside EXISTS to 'return the data'",
          why: "EXISTS ignores the inner columns entirely — the outer SELECT is the only thing that reaches the result.",
          fix: "SELECT 1 inside EXISTS; put the data you want to show in the outer query's SELECT list.",
        },
      ],
      takeaways: [
        "Correlated subqueries ask a per-row question; uncorrelated ones compute one set.",
        "EXISTS means 'at least one related row exists' — and the engine can stop at the first.",
        "NOT EXISTS is the cleanest anti-join: immune to NULLs, no padding to interpret.",
        "Nullable inner column? Never NOT IN — NOT EXISTS instead.",
      ],
      quiz: [
        {
          id: "g-03-q1",
          prompt: "What makes a subquery correlated?",
          options: [
            { text: "It references a column from the outer query's current row", correct: true, feedback: "Correct — the inner query re-runs per outer row, reading that row." },
            { text: "It contains a JOIN inside", correct: false, feedback: "Joins inside a subquery are common — and say nothing about correlation." },
            { text: "It is nested at least two levels deep", correct: false, feedback: "Depth is not the test — the outer-row reference is." },
          ],
          explanation: "Correlation is a reference: e2.dept_id = e.dept_id ties the inner query to the outer row, so it is evaluated once per row.",
        },
        {
          id: "g-03-q2",
          prompt: "Why is NOT EXISTS safe where g-01's NOT IN returned zero rows?",
          options: [
            { text: "It only asks whether rows exist — it never compares values, so NULLs cannot poison it", correct: true, feedback: "Correct — existence has no NULL problem." },
            { text: "It converts NULLs to zeros before comparing", correct: false, feedback: "No conversion happens — no comparison happens either." },
            { text: "It sorts the inner set and skips the NULLs", correct: false, feedback: "There is no sorting and no skipping — just 'are there any rows?'." },
          ],
          explanation: "NOT IN compares values (NULL comparisons are unknown); NOT EXISTS counts rows (empty or not). The trap simply has no surface to stick to.",
        },
        {
          id: "g-03-q3",
          prompt: "Why write SELECT 1 inside EXISTS?",
          options: [
            { text: "EXISTS ignores the inner columns, so 1 signals 'existence only' to readers", correct: true, feedback: "Correct — it is a style convention that says exactly what the query means." },
            { text: "SELECT * is an error inside EXISTS", correct: false, feedback: "SELECT * works fine — the 1 is for humans, not the engine." },
            { text: "1 executes faster than other values", correct: false, feedback: "The engine skips the columns either way; readability is the whole point." },
          ],
          explanation: "The inner list never reaches the output — SELECT 1 documents that only existence matters.",
        },
      ],
    },

    {
      slug: "g-04",
      title: "CTEs — readable pipelines",
      minutes: 13,
      summary: "WITH names each step of a query at the top: one CTE, pipelines of several, and the debugging ritual that keeps them honest.",
      kind: "coding",
      dataset: "banking",
      objectives: [
        "Write a query as one named CTE with WITH",
        "Chain multiple CTEs into a pipeline where later steps read earlier ones",
        "Explain how CTEs and derived tables relate",
        "Debug a pipeline step by step by running each CTE alone",
      ],
      why: "The fees report takes three steps: find the fee transactions, total them per account, attach customer names. As a nested derived table that reads inside-out — the totals hide two parentheses deep, and a fourth step makes the query unreviewable. Common Table Expressions flip the direction: WITH names each step at the top, the final SELECT reads them like tables, and any step can be run and read alone while you build. This is how professionals write the hundred-line queries that stay readable — pipelines with names.",
      blocks: [
        {
          kind: "text",
          text: "A **common table expression** (CTE) is a named subquery that exists for one statement: `WITH name AS (SELECT ...) SELECT ... FROM name`. The same fees story, told top-down:",
        },
        {
          kind: "sql",
          title: "One CTE: the fees report",
          code: `WITH fee_totals AS (
    SELECT account_id,
           count(*) AS n_fees,
           sum(amount) AS fees_paid
    FROM transactions
    WHERE txn_type = 'fee'
    GROUP BY account_id
)
SELECT cu.first_name || ' ' || cu.last_name AS customer,
       f.n_fees,
       f.fees_paid
FROM fee_totals f
JOIN accounts a  ON a.account_id = f.account_id
JOIN customers cu ON cu.customer_id = a.customer_id
ORDER BY f.fees_paid DESC, customer;`,
          result: { columns: ["customer", "n_fees", "fees_paid"], rows: [
        ["Trevor Bishop", "2", "70.00"],
        ["Kwame Mensah", "1", "35.00"],
        ["Raymond Castillo", "3", "15.00"],
        ["Diana Whitmore", "1", "5.00"],
      ] },
          explain: [
            "fee_totals is built first: one row per account that ever paid a fee, with its count and total.",
            "The final SELECT reads fee_totals exactly like a table — joining to accounts and customers for the names.",
            "Four customers paid fees; Trevor Bishop's $70.00 in overdraft fees leads the sad parade. (His account ends the dataset at -$48.20 — the fees are working.)",
          ],
        },
        { kind: "heading", text: "Multiple CTEs — a pipeline" },
        {
          kind: "sql",
          title: "Step 1, step 2, then the final SELECT",
          code: `WITH account_activity AS (
    SELECT account_id,
           count(*) AS txns,
           max(amount) AS biggest
    FROM transactions
    GROUP BY account_id
),
busy_accounts AS (
    SELECT account_id, txns
    FROM account_activity
    WHERE txns >= 10
)
SELECT a.account_id,
       a.account_type,
       b.txns
FROM busy_accounts b
JOIN accounts a ON a.account_id = b.account_id
ORDER BY b.txns DESC, a.account_id;`,
          result: { columns: ["account_id", "account_type", "txns"], rows: [
        ["1", "checking", "28"],
        ["4", "checking", "20"],
        ["17", "checking", "20"],
        ["6", "checking", "12"],
        ["22", "checking", "10"],
      ] },
          explain: [
            "Each CTE sees the ones defined before it: busy_accounts reads account_activity like a table.",
            "Step 1 counts transactions per account. Step 2 keeps the busy ones (ten or more). Step 3 — the final SELECT — joins the account type. Every step is small enough to verify alone.",
            "Five accounts cross the ten-transaction line; Raymond Castillo's checking account alone saw 28 movements in 2026.",
          ],
        },
        {
          kind: "sql",
          title: "The same query, derived-table spelling",
          code: `SELECT cu.first_name || ' ' || cu.last_name AS customer,
       f.n_fees,
       f.fees_paid
FROM (SELECT account_id,
             count(*) AS n_fees,
             sum(amount) AS fees_paid
      FROM transactions
      WHERE txn_type = 'fee'
      GROUP BY account_id) AS f
JOIN accounts a   ON a.account_id = f.account_id
JOIN customers cu ON cu.customer_id = a.customer_id
ORDER BY f.fees_paid DESC, customer;`,
          result: { columns: ["customer", "n_fees", "fees_paid"], rows: [
        ["Trevor Bishop", "2", "70.00"],
        ["Kwame Mensah", "1", "35.00"],
        ["Raymond Castillo", "3", "15.00"],
        ["Diana Whitmore", "1", "5.00"],
      ] },
          explain: [
            "Identical output to the CTE version — WITH is not new machinery; it is a derived table hoisted to the top and given a name.",
            "Compare the reading direction: the derived spelling buries the fees query inside FROM; the CTE spelling names it before using it.",
            "Same result, same engine work — the difference is entirely who can read it six months later.",
          ],
        },
        {
          kind: "table",
          title: "CTE versus derived table",
          headers: ["", "Derived table", "CTE (WITH)"],
          rows: [
            ["Reading direction", "Inside-out, deepest first", "Top-down, in order"],
            ["Naming", "One inline alias", "A name per step, up front"],
            ["Debugging", "Unwrap the nesting to test a piece", "SELECT * FROM any step, alone"],
            ["Many steps", "Nesting deepens each time", "The chain stays flat"],
          ],
        },
        {
          kind: "steps",
          title: "The step-by-step debugging ritual",
          items: [
            "Write the first CTE alone: WITH step1 AS (...) SELECT * FROM step1; — run it and read the rows.",
            "Add the second CTE that reads step1; run SELECT * FROM step2 the same way.",
            "Only when every step's output looks right, write the final SELECT — the joins, labels and ORDER BY.",
            "Keep the working query as a pipeline: the next reader (you, in six months) can re-verify any step alone.",
          ],
        },
        {
          kind: "lab",
          title: "Branch stats with a CTE",
          task: "On Meridian Trust: with a CTE branch_stats that counts active accounts per branch and totals their deposits (2 decimals), list each branch name with its accounts and total_deposits — biggest deposits first. Expected columns: name, accounts, total_deposits.",
          code: `WITH branch_stats AS (
    SELECT branch_id,
           count(*) AS accounts,
           round(sum(balance), 2) AS total_deposits
    FROM accounts
    WHERE is_active
    GROUP BY branch_id
)
SELECT b.name,
       bs.accounts,
       bs.total_deposits
FROM branches b
JOIN branch_stats bs ON bs.branch_id = b.branch_id
ORDER BY bs.total_deposits DESC;`,
          hint: "The CTE aggregates; the final SELECT only attaches branch names — one job per step.",
        },
      ],
      terms: [
        { term: "CTE", definition: "A named subquery introduced by WITH, alive for exactly one statement." },
        { term: "WITH", definition: "The keyword that opens the CTE list: WITH a AS (...), b AS (...) SELECT ..." },
        { term: "Pipeline", definition: "A query built as named steps, each reading the ones defined before it." },
      ],
      mistakes: [
        {
          mistake: "Starting the second CTE with WITH again",
          why: "WITH opens the list once; a second WITH inside the list is a syntax error.",
          fix: "Chain with commas: WITH a AS (...), b AS (...) SELECT ... — the list reads like the pipeline it is.",
        },
        {
          mistake: "Referencing a CTE before it is defined",
          why: "CTEs only see earlier definitions in the same WITH list — step2 cannot feed step1.",
          fix: "Order the pipeline so each step reads the ones above it; move shared logic earlier.",
        },
        {
          mistake: "Expecting a CTE to persist for the next query",
          why: "A CTE vanishes when its statement ends — the next query in the editor cannot see it.",
          fix: "Re-run the WITH with the next statement, or create a VIEW when logic is genuinely shared.",
        },
      ],
      takeaways: [
        "WITH names each step; the final SELECT reads the names like tables.",
        "Later CTEs can read earlier ones — that is the pipeline.",
        "CTEs and derived tables are the same machinery; CTEs read top-down and debug stepwise.",
        "Run SELECT * FROM any step alone while building — the ritual that keeps pipelines honest.",
      ],
      quiz: [
        {
          id: "g-04-q1",
          prompt: "How is a second CTE added to the same statement?",
          options: [
            { text: "With a comma: WITH a AS (...), b AS (...) SELECT ...", correct: true, feedback: "Correct — one WITH, comma-separated steps." },
            { text: "With a second WITH: WITH a AS (...) WITH b AS (...)", correct: false, feedback: "WITH opens the list exactly once — the mistake from this lesson's list." },
            { text: "With a semicolon between the CTEs", correct: false, feedback: "A semicolon ends the statement; the CTEs belong to one statement." },
          ],
          explanation: "The WITH list is comma-separated: each entry names one step, and the final SELECT closes the statement.",
        },
        {
          id: "g-04-q2",
          prompt: "What can a CTE in the WITH list reference?",
          options: [
            { text: "The CTEs defined before it in the same list", correct: true, feedback: "Correct — pipelines flow downward through the list." },
            { text: "The CTEs defined after it", correct: false, feedback: "Later definitions are not visible yet — order the steps top-down." },
            { text: "CTEs from the previous statement", correct: false, feedback: "CTEs live for one statement only; the next query starts fresh." },
          ],
          explanation: "Definition order is dependency order: each step reads the ones above it, exactly like a pipeline.",
        },
      ],
    },

    {
      slug: "g-05",
      title: "CASE — logic inside a query",
      minutes: 14,
      summary: "Searched and simple CASE for labels, CASE in ORDER BY for business priorities, and conditional aggregation — SUM(CASE) beside FILTER.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Label rows with searched CASE (conditions) and simple CASE (exact matches)",
        "Sort by a priority no column stores with CASE in ORDER BY",
        "Count per category inside one grouped query with sum(CASE)",
        "Explain the missing-ELSE NULL bug before it bites",
      ],
      why: "Databases store raw values — status codes, letter grades, prices — but reports speak human: 'premium', 'honors', 'overdrawn'. CASE is the if/then/else of SQL: it maps values to labels inside the query, sorts by business priorities no column stores ('pending orders first'), and — combined with aggregation — counts categories that do not exist as columns at all: how many of each customer's orders were delivered versus cancelled, from one grouped query. It is the last missing piece between the data you have and the report the business asked for.",
      blocks: [
        {
          kind: "text",
          text: "CASE picks a value per row, based on conditions — a tiny if/else evaluated anywhere an expression fits: the SELECT list, ORDER BY, even inside aggregates:",
        },
        {
          kind: "sql",
          title: "Searched CASE: label by condition",
          code: `SELECT p.name,
       p.price,
       CASE
           WHEN p.price >= 1000 THEN 'premium'
           WHEN p.price >= 200  THEN 'mid-range'
           ELSE 'budget'
       END AS price_band
FROM products p
ORDER BY p.price DESC
LIMIT 8;`,
          result: { columns: ["name", "price", "price_band"], rows: [
        ["StudioBook X Creator", "2499.00", "premium"],
        ["AeroBook 16 Pro Laptop", "2199.00", "premium"],
        ["Zenith X20 Mirrorless", "1499.00", "premium"],
        ["AeroBook 14 Laptop", "1299.00", "premium"],
        ["WorkMate 15 Business", "899.00", "mid-range"],
        ["TabSlate 11 Tablet", "649.00", "mid-range"],
        ["GameStation 5 Console", "549.00", "mid-range"],
        ["Altitude GPS Watch", "449.00", "mid-range"],
      ] },
          explain: [
            "Each WHEN is tested top to bottom, and the FIRST true branch wins — the rest are skipped. The $2,499 StudioBook satisfies both the first and second conditions, but answers premium and stops there.",
            "ELSE catches everything no WHEN caught; without it, unmatched rows would get NULL.",
            "price_band lands in the output as a real column — a label computed on the fly, never stored.",
          ],
        },
        {
          kind: "sql",
          title: "Simple CASE: match one expression",
          dataset: "university",
          code: `SELECT s.first_name,
       c.code,
       e.grade,
       CASE e.grade
           WHEN 'A' THEN 4.0
           WHEN 'B' THEN 3.0
           WHEN 'C' THEN 2.0
           WHEN 'D' THEN 1.0
           ELSE 0.0
       END AS grade_points
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c  ON c.course_id = e.course_id
WHERE e.grade IS NOT NULL
ORDER BY e.student_id, c.code
LIMIT 6;`,
          result: { columns: ["first_name", "code", "grade", "grade_points"], rows: [
        ["Jonah", "CS 101", "A", "4.0"],
        ["Jonah", "CS 201", "A", "4.0"],
        ["Jonah", "CS 301", "B", "3.0"],
        ["Jonah", "CS 340", "B", "3.0"],
        ["Jonah", "CS 410", "A", "4.0"],
        ["Alice", "CS 101", "A", "4.0"],
      ] },
          explain: [
            "Simple CASE compares ONE expression against a list of values: CASE grade WHEN 'A' THEN 4.0 — the equality-only twin of searched CASE.",
            "ELSE 0.0 catches F (and anything unexpected). Without it, an F row would produce NULL grade points — silent, and wrong in a GPA.",
            "The choice: searched CASE for conditions (ranges, IS NULL, inequalities); simple CASE for exact matches against one expression.",
          ],
        },
        { kind: "heading", text: "CASE in ORDER BY — the business priority" },
        {
          kind: "sql",
          title: "The operations worklist",
          code: `SELECT o.order_id,
       o.status,
       o.total
FROM orders o
WHERE o.order_date >= TIMESTAMP '2025-09-01'
ORDER BY CASE o.status
             WHEN 'pending'   THEN 1
             WHEN 'paid'      THEN 2
             WHEN 'shipped'   THEN 3
             WHEN 'delivered' THEN 4
             ELSE 5
         END,
         o.order_id
LIMIT 8;`,
          result: { columns: ["order_id", "status", "total"], rows: [
        ["49", "pending", "189.00"],
        ["50", "pending", "99.00"],
        ["38", "paid", "649.00"],
        ["48", "paid", "2499.00"],
        ["36", "shipped", "129.00"],
        ["37", "shipped", "98.00"],
        ["47", "shipped", "549.00"],
        ["34", "delivered", "179.00"],
      ] },
          explain: [
            "No column stores 'pending comes first' — the CASE builds the sort key on the fly: pending 1, paid 2, shipped 3, delivered 4, everything else 5.",
            "Within one status, order_id keeps the order deterministic — the tie-breaking habit from Part C, applied to a computed key.",
            "Operations reads the output as a worklist: the two pending orders first (act on them), then paid, then in transit — priority encoded in the query, not in a spreadsheet.",
          ],
        },
        { kind: "heading", text: "Conditional aggregation — counting categories" },
        {
          kind: "sql",
          title: "sum(CASE) beside FILTER",
          code: `SELECT cu.first_name || ' ' || cu.last_name AS customer,
       count(*) AS orders,
       sum(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       count(*) FILTER (WHERE o.status = 'delivered') AS delivered_too,
       sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM customers cu
JOIN orders o ON o.customer_id = cu.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name
ORDER BY orders DESC, cu.customer_id
LIMIT 6;`,
          result: { columns: ["customer", "orders", "delivered", "delivered_too", "cancelled"], rows: [
        ["Amelia Watson", "4", "4", "4", "0"],
        ["Marcus Chen", "4", "3", "3", "0"],
        ["Priya Sharma", "3", "3", "3", "0"],
        ["Diego Alvarez", "3", "1", "1", "1"],
        ["Hannah Kowalski", "3", "3", "3", "0"],
        ["Tom Fletcher", "3", "2", "2", "0"],
      ] },
          explain: [
            "sum(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) counts delivered orders per customer: each matching row adds 1, every other row adds 0.",
            "The ELSE 0 matters: without it, a customer with zero delivered orders would sum a group of NULLs into NULL, not 0.",
            "count(*) FILTER (WHERE status = 'delivered') — Part E's tool — does the same job in one clause: delivered and delivered_too agree on every row, two spellings, one answer.",
            "One grouped query now answers 'how many delivered, how many cancelled?' per customer — no extra column, no second pass.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The missing ELSE is a silent bug",
          text: "A row no WHEN catches produces NULL: in a label column it shows as blank; inside a sum it can turn a whole total NULL. Write the ELSE you mean, every time — even when it is just ELSE 0 — and the missing cases announce themselves instead of hiding.",
        },
        {
          kind: "lab",
          title: "Account health labels",
          task: "On Meridian Trust: label every account by balance with a searched CASE — 'overdrawn' below 0, 'low' below 1000, else 'healthy' — account_id, account_type, balance and health, smallest balances first, first six rows. Expected columns: account_id, account_type, balance, health.",
          code: `SELECT a.account_id,
       a.account_type,
       a.balance,
       CASE
           WHEN a.balance < 0    THEN 'overdrawn'
           WHEN a.balance < 1000 THEN 'low'
           ELSE 'healthy'
       END AS health
FROM accounts a
ORDER BY a.balance
LIMIT 6;`,
          dataset: "banking",
          hint: "Test the strictest condition first: a negative balance is also below 1000, and CASE stops at the first true WHEN.",
        },
      ],
      terms: [
        { term: "Searched CASE", definition: "CASE WHEN condition THEN value ... — branches on arbitrary conditions, first true WHEN wins." },
        { term: "Simple CASE", definition: "CASE expr WHEN value THEN ... — equality matches against one expression." },
        { term: "Conditional aggregation", definition: "sum(CASE ...) or count(*) FILTER (WHERE ...) — per-category counts inside one grouped query." },
      ],
      mistakes: [
        {
          mistake: "Relying on a missing ELSE",
          why: "Unmatched rows silently become NULL — blank labels, and sums that can collapse to NULL.",
          fix: "Write the ELSE explicitly, even when it only spells out the fallback you assume.",
        },
        {
          mistake: "Testing ranges in the wrong order",
          why: "CASE stops at the first true WHEN — put price >= 200 first and the $2,499 laptop is labeled mid-range forever.",
          fix: "Order conditions strictest-first, so each row lands in the most specific branch.",
        },
        {
          mistake: "Expecting simple CASE to handle ranges",
          why: "CASE price WHEN 200 THEN ... only matches equality — a 499 price matches nothing.",
          fix: "Ranges, comparisons and IS NULL need the searched form: CASE WHEN price >= 200 THEN ...",
        },
      ],
      takeaways: [
        "Searched CASE branches on conditions; simple CASE matches exact values; the first true WHEN wins.",
        "CASE builds labels, sort keys and per-category counts — logic inside the query.",
        "sum(CASE WHEN ... THEN 1 ELSE 0 END) equals count(*) FILTER (WHERE ...) — two spellings of one answer.",
        "Write the ELSE you mean; a missing one silently means NULL.",
      ],
      quiz: [
        {
          id: "g-05-q1",
          prompt: "With WHEN price >= 200 first and WHEN price >= 1000 second, where does a $2,499 product land?",
          options: [
            { text: "In the >= 200 branch — WHENs run in order and the first true one wins", correct: true, feedback: "Correct — order is meaning: test strictest first." },
            { text: "In the >= 1000 branch — PostgreSQL picks the best match", correct: false, feedback: "There is no best-match search — just first-match wins." },
            { text: "In neither — overlapping conditions are an error", correct: false, feedback: "Overlaps are legal; the order quietly decides the winner." },
          ],
          explanation: "CASE reads like a chain of ifs: the first true WHEN takes the row and the rest are never tested.",
        },
        {
          id: "g-05-q2",
          prompt: "A customer has zero delivered orders. What do the two delivered counts give?",
          options: [
            { text: "sum(CASE ... ELSE 0 END) gives 0; without the ELSE 0 it would give NULL — FILTER gives 0", correct: true, feedback: "Correct — ELSE 0 and FILTER both produce honest zeros." },
            { text: "Both give NULL", correct: false, feedback: "FILTER over an empty group counts 0 — only the missing-ELSE CASE turns into NULL." },
            { text: "Both give 0", correct: false, feedback: "Almost — the CASE only gives 0 because of the ELSE 0; without it, NULL." },
          ],
          explanation: "The ELSE 0 converts 'no matching rows' into an honest 0; a missing ELSE leaves NULL to poison the column.",
        },
        {
          id: "g-05-q3",
          prompt: "Which CASE form turns a letter grade into grade points?",
          options: [
            { text: "Simple CASE — one expression matched for equality against WHEN values", correct: true, feedback: "Correct — grade WHEN 'A' THEN 4.0 is exactly its shape." },
            { text: "Searched CASE is required", correct: false, feedback: "Searched CASE also works, but it is the heavier tool for an equality job." },
            { text: "Neither — grades need a join to a lookup table", correct: false, feedback: "A lookup table works too, but CASE answers it inline — no join needed." },
          ],
          explanation: "Exact matches against one value are simple CASE's whole purpose; conditions and ranges call for the searched form.",
        },
      ],
    },

    {
      slug: "g-06",
      title: "Recursive CTEs",
      minutes: 14,
      summary: "Seed plus recursive branch equals SQL's loop: counting, prerequisite chains and org-chart depth — always bounded.",
      kind: "coding",
      dataset: "university",
      objectives: [
        "Name the three parts of every recursive CTE: seed, recursive branch, bound",
        "Count and walk graphs with a recursive CTE",
        "Collect a course's transitive prerequisites",
        "Measure an org chart's depth from its root",
      ],
      why: "Org charts, prerequisite chains, bill-of-materials, comment threads: data that points at rows of its own table forms TREES — and no fixed number of joins can walk a tree whose depth you do not know. The recursive CTE is SQL's loop: a seed row, plus a rule for producing the next rows from the ones you already have, repeated until nothing new appears. Walk down from the CEO or up from a new hire, collect every course a degree requires — one query, any depth. The power comes with one discipline: always bound the recursion, or a stray cycle will hang your query forever.",
      blocks: [
        {
          kind: "text",
          text: "A recursive CTE has exactly two parts joined by UNION ALL: the **seed** (a normal SELECT that starts the loop) and the **recursive branch** (a SELECT that reads the CTE itself to produce the next round). A WHERE inside the branch is the **bound** — the brake pedal:",
        },
        {
          kind: "visual",
          title: "The anatomy of a recursive CTE",
          ascii: `  WITH RECURSIVE counting AS (
      SELECT 1 AS n            <- seed: the first row(s)
      UNION ALL
      SELECT n + 1             <- recursive branch: reads
      FROM counting            <-   the CTE itself
      WHERE n < 10             <- the BOUND: the brake
  )
  SELECT n FROM counting ORDER BY n;

  round 1:  1     (the seed)
  round 2:  2     (1 + 1)
  round 3:  3     (2 + 1)
     ...
  round 10: 10    (9 + 1)
  round 11: none  (10 fails the WHERE -> loop ends)`,
          caption: "Seed starts the loop; the branch feeds on its own previous rounds; the WHERE decides when to stop.",
        },
        {
          kind: "sql",
          title: "Counting to ten",
          code: `WITH RECURSIVE counting AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM counting
    WHERE n < 10
)
SELECT n
FROM counting
ORDER BY n;`,
          result: { columns: ["n"], rows: [
        ["1"],
        ["2"],
        ["3"],
        ["4"],
        ["5"],
        ["6"],
        ["7"],
        ["8"],
        ["9"],
        ["10"],
      ] },
          explain: [
            "The seed emits 1. Round two adds 1 to every existing row; round three feeds on round two's output — the CTE accumulates 1, 2, 3, ...",
            "WHERE n < 10 is the bound: once n reaches 10, the branch produces nothing new and the loop stops. Without it, this query never ends — you would close the tab.",
            "UNION ALL keeps every round's rows; the final SELECT reads the whole accumulated result.",
          ],
        },
        { kind: "heading", text: "The prerequisite chain of CS 410" },
        {
          kind: "sql",
          title: "Everything Machine Learning requires",
          code: `WITH RECURSIVE prereq_chain AS (
    SELECT cp.prereq_id,
           c.code,
           1 AS depth
    FROM course_prerequisites cp
    JOIN courses c ON c.course_id = cp.prereq_id
    WHERE cp.course_id = 6
    UNION ALL
    SELECT cp.prereq_id,
           c.code,
           pc.depth + 1
    FROM prereq_chain pc
    JOIN course_prerequisites cp ON cp.course_id = pc.prereq_id
    JOIN courses c ON c.course_id = cp.prereq_id
    WHERE pc.depth < 4
)
SELECT code, depth
FROM prereq_chain
ORDER BY depth, code;`,
          result: { columns: ["code", "depth"], rows: [
        ["CS 340", "1"],
        ["MATH 201", "1"],
        ["CS 201", "2"],
        ["MATH 101", "2"],
        ["CS 101", "3"],
      ] },
          explain: [
            "The seed: the courses CS 410 (Machine Learning) directly requires — CS 340 and MATH 201, at depth 1.",
            "The branch: for each course already in the chain, add ITS prerequisites at depth + 1 — CS 340 pulls in CS 201, MATH 201 pulls in MATH 101, CS 201 pulls in CS 101.",
            "depth < 4 bounds the walk. The output reads as a study plan: two direct prerequisites, five courses in total, up to three levels deep.",
            "Syllabus planning, dependency resolution, unlock trees — one shape covers them all.",
          ],
        },
        {
          kind: "sql",
          title: "How deep is the org chart?",
          dataset: "hr",
          code: `WITH RECURSIVE org_chart AS (
    SELECT employee_id,
           1 AS depth
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.employee_id,
           oc.depth + 1
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.employee_id
    WHERE oc.depth < 6
)
SELECT depth,
       count(*) AS employees
FROM org_chart
GROUP BY depth
ORDER BY depth;`,
          result: { columns: ["depth", "employees"], rows: [
        ["1", "1"],
        ["2", "6"],
        ["3", "11"],
        ["4", "12"],
      ] },
          explain: [
            "The seed is the CEO (manager_id IS NULL) at depth 1; the branch attaches everyone reporting to anyone already in the tree.",
            "Four levels: 1 CEO, 6 direct reports, 11 at level 3, 12 at level 4 — the whole 30-person company, walked from a single row.",
            "The depth < 6 bound never fires here — the tree is only 4 deep. It is a safety net: it costs nothing on healthy data and saves the query on data that might someday loop.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Always bound your recursion",
          text: "A recursive CTE must be able to STOP: a WHERE on the depth (or a UNION that deduplicates) has to end the loop. On cyclic data an unbounded UNION ALL runs forever and hangs the engine. Bounds that never fire on healthy data still save you on dirty data — write one every single time, and keep it comfortably above the real depth.",
        },
        {
          kind: "lab",
          title: "The org chart, listed with depth",
          task: "On HeliosWorks: walk the whole org chart top-down with a recursive CTE — employee (full name), job_title and depth (CEO = 1, each report one deeper), bounded with depth < 6, ordered by depth then employee_id, first six rows. Expected columns: employee, job_title, depth.",
          code: `WITH RECURSIVE org_chart AS (
    SELECT employee_id,
           first_name || ' ' || last_name AS employee,
           job_title,
           1 AS depth
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.employee_id,
           e.first_name || ' ' || e.last_name,
           e.job_title,
           oc.depth + 1
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.employee_id
    WHERE oc.depth < 6
)
SELECT employee, job_title, depth
FROM org_chart
ORDER BY depth, employee_id
LIMIT 6;`,
          dataset: "hr",
          hint: "Seed on manager_id IS NULL (the root of the tree); the branch joins employees to everyone already collected.",
        },
      ],
      terms: [
        { term: "Recursive CTE", definition: "A CTE whose recursive branch reads itself, seeded by a starter row — SQL's loop." },
        { term: "Seed", definition: "The non-recursive first half of the UNION — the rows the loop starts from." },
        { term: "Bound", definition: "The WHERE that stops the recursion (a depth or value limit) — mandatory equipment." },
        { term: "Depth", definition: "A counter column incremented each round, measuring distance from the seed." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the bound",
          why: "On cycles or ever-growing data the loop never produces an empty round — the query runs forever and hangs the engine.",
          fix: "Always write a WHERE in the branch that can stop it: depth < n, comfortably above the real depth.",
        },
        {
          mistake: "UNION where you meant UNION ALL",
          why: "UNION silently drops duplicate rows — on graphs where paths converge it can end the walk early or mask the fan-in you meant to see.",
          fix: "UNION ALL plus an explicit bound by default; reach for UNION only when deduplication is exactly the goal.",
        },
        {
          mistake: "Referencing the recursive CTE twice in the branch",
          why: "PostgreSQL allows the branch to read the CTE exactly once — a second reference is a parse error.",
          fix: "Keep the branch to one read of the CTE; extra joins to other tables belong there, self-joins to the CTE do not.",
        },
      ],
      takeaways: [
        "Seed + UNION ALL + recursive branch = SQL's loop.",
        "The bound is not optional — write depth < n every single time.",
        "Trees are everywhere: org charts, prerequisites, threads, categories.",
        "A depth counter turns structure into data: levels, distances, hops.",
      ],
      quiz: [
        {
          id: "g-06-q1",
          prompt: "What stops a recursive CTE from running forever?",
          options: [
            { text: "A bound in the recursive branch that eventually produces an empty round", correct: true, feedback: "Correct — when a round adds no rows, the loop ends." },
            { text: "PostgreSQL's built-in 1000-row limit", correct: false, feedback: "There is no default row limit — the bound is your job." },
            { text: "The final SELECT's LIMIT clause", correct: false, feedback: "LIMIT trims the output, not the loop — the CTE still computes every round." },
          ],
          explanation: "Recursion ends when a round returns no new rows; the bound's WHERE is what guarantees that round arrives.",
        },
        {
          id: "g-06-q2",
          prompt: "In the CS 410 chain, what does the recursive branch do each round?",
          options: [
            { text: "For each course already collected, adds the courses it requires, one level deeper", correct: true, feedback: "Correct — each round walks one more edge of the graph." },
            { text: "Re-runs the seed and appends the direct prerequisites again", correct: false, feedback: "The seed runs once; the branch feeds on the accumulated rows." },
            { text: "Joins the chain to students to check who has passed what", correct: false, feedback: "Nothing in this query touches enrollments — it walks courses only." },
          ],
          explanation: "The branch reads the CTE itself: every course collected so far contributes its own prerequisites at depth + 1.",
        },
        {
          id: "g-06-q3",
          prompt: "Why does the org-chart query keep depth < 6 when the tree is only four levels deep?",
          options: [
            { text: "As a safety net — it costs nothing on healthy data and stops runaway loops on dirty data", correct: true, feedback: "Correct — bounds are insurance you write before you need them." },
            { text: "Because depth 5 and 6 exist but must stay hidden", correct: false, feedback: "No level 5 exists — the census shows exactly four levels." },
            { text: "Because PostgreSQL requires a WHERE in every recursive branch", correct: false, feedback: "It is not required — which is exactly why the warning exists." },
          ],
          explanation: "The bound is protection against cycles and dirty data, not a description of this tree's shape.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "g-b1",
      tier: "beginner",
      mode: "sql",
      title: "Savings account holders",
      prompt: "Meridian Trust wants to invite every customer who holds a savings account to a financial-planning session. Find them with a subquery: customer_id, first_name and last_name for every customer whose id appears IN the set of savings-account holders (SELECT customer_id FROM accounts WHERE account_type = 'savings'). Order by customer_id. Expected columns: customer_id, first_name, last_name.",
      dataset: "banking",
      sampleTables: ["customers", "accounts"],
      hint: "The subquery builds the set of savings-holder ids; IN keeps the matching customers.",
      starter: `SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
-- WHERE c.customer_id IN (SELECT ... FROM accounts ...)
`,
      solution: `SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE c.customer_id IN (SELECT a.customer_id
                        FROM accounts a
                        WHERE a.account_type = 'savings')
ORDER BY c.customer_id;`,
      ordered: true,
      expected: { columns: ["customer_id", "first_name", "last_name"], rows: [
        ["1", "Raymond", "Castillo"],
        ["2", "Diana", "Whitmore"],
        ["3", "Kwame", "Mensah"],
        ["6", "Aisha", "Bello"],
        ["9", "Vincent", "Cho"],
        ["10", "Bridget", "Callahan"],
        ["12", "Sandra", "Vance"],
        ["14", "Yasmin", "Farouk"],
        ["17", "Reginald", "Ashton"],
      ] },
      explanation:
        "The inner SELECT computes the set of customer ids holding savings accounts; the outer query keeps exactly those customers. Nine holders surface, from Raymond Castillo (three accounts, one of them savings) to Reginald Ashton — and the query stays correct the day account 32 opens as a savings account, because the set is computed, never typed.",
      concepts: ["IN subquery", "membership filtering"],
    },
    {
      id: "g-b2",
      tier: "beginner",
      mode: "sql",
      title: "The unreviewed shelf",
      prompt: "ShopSphere's merchandising team wants to chase reviews for products nobody has rated yet. Find the unreviewed catalog with NOT IN: product_id, name and price for every product whose product_id does NOT appear in (SELECT product_id FROM reviews) — the inner column is NOT NULL here, so the g-01 trap cannot fire. Order by product_id. Expected columns: product_id, name, price.",
      dataset: "ecommerce",
      sampleTables: ["products", "reviews"],
      hint: "reviews.product_id is NOT NULL, so NOT IN is safe on this column — still worth checking every time.",
      starter: `SELECT p.product_id, p.name, p.price
FROM products p
-- WHERE p.product_id NOT IN (SELECT ... FROM reviews ...)
`,
      solution: `SELECT p.product_id, p.name, p.price
FROM products p
WHERE p.product_id NOT IN (SELECT r.product_id
                           FROM reviews r)
ORDER BY p.product_id;`,
      ordered: true,
      expected: { columns: ["product_id", "name", "price"], rows: [
        ["4", "StudioBook X Creator", "2499.00"],
        ["5", "BudgetBook 11 Everyday", "399.00"],
        ["10", "WaveRider Waterproof Buds", "129.00"],
        ["16", "TravelPod Tripod Kit", "79.00"],
        ["19", "RacingWheel GT Set", "299.00"],
        ["24", "FlexStand Aluminum Dock", "49.00"],
      ] },
      explanation:
        "The subquery builds the set of reviewed product ids; NOT IN keeps everything else. Six products have never been reviewed — including the flagship StudioBook X Creator (too new) and the RacingWheel GT Set. Before writing NOT IN, you checked the inner column: reviews.product_id is NOT NULL, so no NULL can poison the set. (NOT EXISTS would work equally well here.)",
      concepts: ["NOT IN", "anti-join", "NULL safety"],
    },
    {
      id: "g-b3",
      tier: "beginner",
      mode: "sql",
      title: "Above the student average",
      prompt: "The registrar wants to celebrate students performing above the student body's average. Compare each GPA against a scalar subquery: student_id, first_name, last_name and gpa for students whose gpa is greater than (SELECT avg(gpa) FROM students). The five freshmen with NULL gpa drop out of the comparison automatically — NULL > anything is unknown. Order by gpa descending, then student_id. Expected columns: student_id, first_name, last_name, gpa.",
      dataset: "university",
      sampleTables: ["students"],
      hint: "avg(gpa) skips the NULLs on its own — the average covers the 17 graded students.",
      starter: `SELECT s.student_id, s.first_name, s.last_name, s.gpa
FROM students s
-- WHERE s.gpa > (SELECT ... FROM students ...)
`,
      solution: `SELECT s.student_id, s.first_name, s.last_name, s.gpa
FROM students s
WHERE s.gpa > (SELECT avg(s2.gpa) FROM students s2)
ORDER BY s.gpa DESC, s.student_id;`,
      ordered: true,
      expected: { columns: ["student_id", "first_name", "last_name", "gpa"], rows: [
        ["4", "Sophie", "Laurent", "3.90"],
        ["2", "Alice", "Bennett", "3.82"],
        ["8", "Mila", "Novak", "3.75"],
        ["12", "Nadia", "Rahman", "3.68"],
        ["1", "Jonah", "Reyes", "3.65"],
        ["21", "Clara", "Duarte", "3.61"],
        ["6", "Grace", "Sullivan", "3.58"],
        ["19", "Marcus", "Diallo", "3.52"],
        ["10", "Leah", "Brennan", "3.47"],
      ] },
      explanation:
        "The scalar subquery computes one value — the average GPA of the 17 graded students (about 3.44) — and slots into the comparison like a number. Nine students clear it, Sophie Laurent's 3.90 first. The five NULL-gpa freshmen never appear: NULL > 3.44 is unknown, and unknown fails the filter — exactly the NULL-skipping behavior you want here, stated out loud.",
      concepts: ["scalar subquery", "NULL comparisons", "avg"],
    },
    {
      id: "g-b4",
      tier: "beginner",
      mode: "sql",
      title: "The satellite offices",
      prompt: "HeliosWorks is planning office space outside headquarters. List current staff (terminated IS NULL) who sit in a department that is NOT located in 'New York' — find those departments with a subquery: employee (first and last name concatenated with a space), job_title and department name, joining employees to departments for the label, ordered by employee_id, first eight rows. Expected columns: employee, job_title, department.",
      dataset: "hr",
      sampleTables: ["employees", "departments"],
      hint: "IN with location <> 'New York' inside the subquery; the join only decorates with names.",
      starter: `SELECT e.first_name || ' ' || e.last_name AS employee,
       -- job_title, department
FROM employees e
`,
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       d.name AS department
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
  AND e.dept_id IN (SELECT dept_id
                    FROM departments
                    WHERE location <> 'New York')
ORDER BY e.employee_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["employee", "job_title", "department"], rows: [
        ["Sofia Mancini", "VP of Sales", "Sales"],
        ["Kevin O'Brien", "Enterprise Account Exec", "Sales"],
        ["Nadia Cheung", "Account Executive", "Sales"],
        ["Victor Adeyemi", "Sales Development Rep", "Sales"],
        ["Freya Johansson", "Marketing Manager", "Marketing"],
        ["Omar Haddad", "Content Strategist", "Marketing"],
        ["Beatrice Laurent", "Customer Success Manager", "Customer Success"],
        ["Sam Whitfield", "Support Specialist", "Customer Success"],
      ] },
      explanation:
        "The subquery computes the satellite department ids (Sales in Chicago, Marketing and Data remote, Customer Success in Austin); IN filters employees to them; the join attaches the names. Eight of the nine current satellite staff are shown, ordered by employee_id — Tara Singh, the remote Data department's only hire, just misses the cut. The filter and the label are separate jobs, done by separate clauses, each easy to verify alone.",
      concepts: ["IN subquery", "joins for labels", "current-staff filter"],
    },
    {
      id: "g-i1",
      tier: "intermediate",
      mode: "sql",
      title: "Nobody's manager",
      prompt: "The People Ops team is mapping management coverage: which current employees (terminated IS NULL) are NOT anybody's manager? Use NOT EXISTS: employee_id, employee and job_title, with the inner subquery checking for any employee whose manager_id equals the outer employee's id. Eighteen people qualify — show the first ten by employee_id. (A plain NOT IN over manager_id returns nothing here — the NULL trap from g-01.) Expected columns: employee_id, employee, job_title.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "NOT EXISTS (SELECT 1 FROM employees e2 WHERE e2.manager_id = e.employee_id) — existence, never value comparison.",
      starter: `SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS employee,
       e.job_title
FROM employees e
-- WHERE NOT EXISTS (SELECT 1 FROM employees e2 WHERE ...)
`,
      solution: `SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS employee,
       e.job_title
FROM employees e
WHERE NOT EXISTS (SELECT 1
                  FROM employees e2
                  WHERE e2.manager_id = e.employee_id)
  AND e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 10;`,
      ordered: true,
      expected: { columns: ["employee_id", "employee", "job_title"], rows: [
        ["5", "Gerald Weiss", "Head of People"],
        ["8", "Elena Petrova", "Senior Backend Engineer"],
        ["9", "James Okoro", "Senior Backend Engineer"],
        ["10", "Aisha Rahman", "Backend Engineer"],
        ["11", "Tom Lindqvist", "Backend Engineer"],
        ["12", "Grace Park", "Senior Frontend Engineer"],
        ["13", "Noah Feldman", "Frontend Engineer"],
        ["14", "Ingrid Sorensen", "DevOps Engineer"],
        ["15", "Diego Fuentes", "QA Engineer"],
        ["16", "Yuki Tanaka", "QA Engineer"],
      ] },
      explanation:
        "For each employee, the correlated subquery asks: does anyone report to them? NOT EXISTS keeps the noes. Eighteen current employees manage nobody — Gerald Weiss (a department head with no direct reports) opens the list. The g-01 trap cannot fire here: NOT EXISTS asks about rows, never compares values, so the CEO's NULL manager_id is irrelevant.",
      concepts: ["NOT EXISTS", "correlated subquery", "anti-join"],
    },
    {
      id: "g-i2",
      tier: "intermediate",
      mode: "sql",
      title: "Order values from the line items",
      prompt: "ShopSphere's finance team reconciles order totals against the line items. Summarize first, then join: order_id, status, n_products (count of line items) and order_value (round(sum(quantity * unit_price), 2)) computed in a derived table over order_items, then joined to orders for the status. Top five orders by order_value, ties broken by order_id. Expected columns: order_id, status, n_products, order_value.",
      dataset: "ecommerce",
      sampleTables: ["orders", "order_items"],
      hint: "The derived table (SELECT order_id, count(*), sum(...) FROM order_items GROUP BY order_id) AS items does the aggregating.",
      starter: `SELECT o.order_id,
       o.status,
       -- n_products, order_value (from a derived table over order_items)
FROM (SELECT order_id, ...
      FROM order_items
      GROUP BY order_id) AS items
JOIN orders o ON o.order_id = items.order_id
`,
      solution: `SELECT o.order_id,
       o.status,
       items.n_products,
       items.order_value
FROM (SELECT order_id,
             count(*) AS n_products,
             round(sum(quantity * unit_price), 2) AS order_value
      FROM order_items
      GROUP BY order_id) AS items
JOIN orders o ON o.order_id = items.order_id
ORDER BY items.order_value DESC, o.order_id
LIMIT 5;`,
      ordered: true,
      expected: { columns: ["order_id", "status", "n_products", "order_value"], rows: [
        ["48", "paid", "1", "2499.00"],
        ["21", "delivered", "2", "2348.00"],
        ["40", "delivered", "1", "2199.00"],
        ["29", "delivered", "2", "1798.00"],
        ["43", "delivered", "2", "1798.00"],
      ] },
      explanation:
        "The derived table collapses order_items to one row per order — its count and its value — and the outer query joins orders only to attach the status. The biggest basket is order 48 (the $2,499 StudioBook X, paid), followed by order 21 at $2,348 from two products. Aggregating before joining keeps each side one row per order: no fan-out, no lies.",
      concepts: ["derived tables", "aggregate-then-join", "reconciliation"],
    },
    {
      id: "g-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Busier than average",
      prompt: "Meridian Trust's ops team wants the accounts that see the most action. Using a CTE per_account that counts transactions per account_id, list the accounts whose count is greater than the average per-account count (compare against a scalar subquery over the CTE itself): account_id, account_type and txns, ordered by txns descending, then account_id. Expected columns: account_id, account_type, txns.",
      dataset: "banking",
      sampleTables: ["transactions", "accounts"],
      hint: "WITH per_account AS (SELECT account_id, count(*) AS txns FROM transactions GROUP BY account_id) — then WHERE txns > (SELECT avg(txns) FROM per_account).",
      starter: `WITH per_account AS (
    -- count transactions per account
)
SELECT a.account_id, a.account_type, p.txns
FROM accounts a
-- JOIN per_account p ...
-- WHERE p.txns > (SELECT avg(txns) FROM per_account)
`,
      solution: `WITH per_account AS (
    SELECT account_id,
           count(*) AS txns
    FROM transactions
    GROUP BY account_id
)
SELECT a.account_id,
       a.account_type,
       p.txns
FROM accounts a
JOIN per_account p ON p.account_id = a.account_id
WHERE p.txns > (SELECT avg(txns) FROM per_account)
ORDER BY p.txns DESC, a.account_id;`,
      ordered: true,
      expected: { columns: ["account_id", "account_type", "txns"], rows: [
        ["1", "checking", "28"],
        ["4", "checking", "20"],
        ["17", "checking", "20"],
        ["6", "checking", "12"],
      ] },
      explanation:
        "Step 1 (the CTE) counts the 100 transactions across the nine accounts that saw any — about 11.1 on average. Step 2 keeps the accounts above that bar: Raymond Castillo's checking account (28 movements), then Diana Whitmore's and Bridget Callahan's (20 each), then Aisha Bello's (12). A scalar subquery over the CTE reads like a scalar subquery over a table — because a CTE is one.",
      concepts: ["CTE", "scalar subquery over a CTE", "average comparisons"],
    },
    {
      id: "g-i4",
      tier: "intermediate",
      mode: "sql",
      title: "Big rooms in small departments",
      prompt: "Northgate's classroom planners want the crowded rooms: courses whose capacity beats their OWN department's average. Use a correlated subquery over courses (matching c2.dept_id = c.dept_id) twice — once as the comparison, once as a displayed column: code, title, capacity and dept_avg_capacity (round(avg(...), 1)), for courses where capacity is greater than that average, ordered by capacity descending, then code. Expected columns: code, title, capacity, dept_avg_capacity.",
      dataset: "university",
      sampleTables: ["courses"],
      hint: "The same correlated subquery appears in WHERE (for the filter) and in SELECT (for the shown number).",
      starter: `SELECT c.code, c.title, c.capacity,
       -- dept_avg_capacity: a correlated subquery over courses
FROM courses c
-- WHERE c.capacity > (SELECT avg(...) FROM courses c2 WHERE c2.dept_id = c.dept_id)
`,
      solution: `SELECT c.code,
       c.title,
       c.capacity,
       (SELECT round(avg(c2.capacity), 1)
        FROM courses c2
        WHERE c2.dept_id = c.dept_id) AS dept_avg_capacity
FROM courses c
WHERE c.capacity > (SELECT avg(c2.capacity)
                    FROM courses c2
                    WHERE c2.dept_id = c.dept_id)
ORDER BY c.capacity DESC, c.code;`,
      ordered: true,
      expected: { columns: ["code", "title", "capacity", "dept_avg_capacity"], rows: [
        ["MATH 101", "Calculus I", "150", "110.0"],
        ["ECON 101", "Principles of Microeconomics", "140", "112.5"],
        ["CS 101", "Introduction to Programming", "120", "72.1"],
        ["PHYS 101", "Classical Mechanics", "110", "90.0"],
        ["HIST 110", "World History to 1500", "100", "58.3"],
        ["BIO 120", "Cell Biology", "95", "77.5"],
        ["CS 201", "Data Structures", "90", "72.1"],
        ["CS 220", "Computer Systems", "80", "72.1"],
      ] },
      explanation:
        "Each course is compared against its own department's average — 150-seat MATH 101 dwarfs the math average of 110.0, while CS 101 (120 seats) towers over CS's 72.1. Eight courses outgrow their home departments; the displayed dept_avg_capacity column makes every comparison visible, which is what turns a filter into a report.",
      concepts: ["correlated subquery", "per-row comparison", "self-reference"],
    },
    {
      id: "g-a1",
      tier: "advanced",
      mode: "sql",
      title: "The cancellation report",
      prompt: "ShopSphere's retention team studies cancellations. For every customer with at least one cancelled order, report: customer (full name), orders (total order count), delivered and cancelled — the two conditional counts via sum(CASE WHEN o.status = ... THEN 1 ELSE 0 END), one grouped query over customers joined to orders, filtered with HAVING on the cancelled count. Order by cancelled descending, then customer. Expected columns: customer, orders, delivered, cancelled.",
      dataset: "ecommerce",
      sampleTables: ["customers", "orders"],
      hint: "Group by the customer, count conditionally with sum(CASE ... ELSE 0 END), and put the cancelled >= 1 condition in HAVING — it is a fact about the group.",
      starter: `SELECT cu.first_name || ' ' || cu.last_name AS customer,
       count(*) AS orders,
       -- delivered, cancelled (sum of CASE WHEN o.status = ...)
FROM customers cu
JOIN orders o ON o.customer_id = cu.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name
-- HAVING ... on the cancelled count
`,
      solution: `SELECT cu.first_name || ' ' || cu.last_name AS customer,
       count(*) AS orders,
       sum(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM customers cu
JOIN orders o ON o.customer_id = cu.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name
HAVING sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) >= 1
ORDER BY cancelled DESC, customer;`,
      ordered: true,
      expected: { columns: ["customer", "orders", "delivered", "cancelled"], rows: [
        ["Diego Alvarez", "3", "1", "1"],
        ["Ethan Brooks", "2", "1", "1"],
        ["Noah Berger", "1", "0", "1"],
      ] },
      explanation:
        "One grouped query answers three questions per customer: how many orders, how many delivered, how many cancelled. The two sum(CASE) counts classify each row on the fly, and the HAVING reuses the cancelled count as a group-level filter — a condition about the group, so HAVING's territory (Part E). Three customers have cancelled orders; Noah Berger's only order ever was cancelled, which the delivered 0 makes visible.",
      concepts: ["conditional aggregation", "SUM(CASE)", "HAVING on aggregates"],
    },
    {
      id: "g-a2",
      tier: "advanced",
      mode: "sql",
      title: "What CS 101 unlocks",
      prompt: "Northgate's advisors want the reach of intro programming: every course CS 101 directly or transitively unlocks. Walk course_prerequisites upward with a recursive CTE: seed on prereq_id = 1 (CS 101), and let the branch join unlocked courses to the prerequisites they satisfy, bounded with depth < 4. Return code and depth, ordered by depth then code. CS 301 legitimately appears twice — two paths lead to it (through CS 201 and through CS 220), and UNION ALL keeps both. Expected columns: code, depth.",
      dataset: "university",
      sampleTables: ["courses", "course_prerequisites"],
      hint: "The seed selects courses that DIRECTLY require CS 101 (cp.prereq_id = 1); the branch follows courses whose prerequisites are already unlocked.",
      starter: `WITH RECURSIVE unlocked AS (
    -- seed: courses that directly require CS 101 (prereq_id = 1)
    UNION ALL
    -- branch: courses requiring anything already unlocked, one level deeper
)
SELECT code, depth
FROM unlocked
ORDER BY depth, code;
`,
      solution: `WITH RECURSIVE unlocked AS (
    SELECT cp.course_id,
           c.code,
           1 AS depth
    FROM course_prerequisites cp
    JOIN courses c ON c.course_id = cp.course_id
    WHERE cp.prereq_id = 1
    UNION ALL
    SELECT cp.course_id,
           c.code,
           u.depth + 1
    FROM unlocked u
    JOIN course_prerequisites cp ON cp.prereq_id = u.course_id
    JOIN courses c ON c.course_id = cp.course_id
    WHERE u.depth < 4
)
SELECT code, depth
FROM unlocked
ORDER BY depth, code;`,
      ordered: true,
      expected: { columns: ["code", "depth"], rows: [
        ["CS 201", "1"],
        ["CS 220", "1"],
        ["CS 301", "2"],
        ["CS 301", "2"],
        ["CS 340", "2"],
        ["CS 410", "3"],
      ] },
      explanation:
        "The seed finds the courses CS 101 directly unlocks (CS 201, CS 220); each round unlocks the courses whose prerequisites are now in hand. The duplicate CS 301 row is the fan-in made visible: CS 301 requires BOTH CS 201 and CS 220, so it is reachable by two paths at depth 2, and UNION ALL preserves both. Want each course once? Swap the final SELECT to SELECT DISTINCT code, depth — or let UNION deduplicate the walk itself.",
      concepts: ["recursive CTE", "graph traversal", "fan-in", "bounds"],
    },
    {
      id: "g-a3",
      tier: "advanced",
      mode: "sql",
      title: "Tara Singh's reporting chain",
      prompt: "HeliosWorks's newest hire, Analytics Engineer Tara Singh (employee_id 28), asks who signs off on her work. Walk UP the org chart with a recursive CTE: seed on employee_id 28, then join employees to the chain on manager_id to climb one level per step, bounded with depth < 4. Return employee (full name), job_title and depth (1 = Tara herself, each +1 = one level up), ordered by depth. Expected columns: employee, job_title, depth.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Climbing up: JOIN employees e ON e.employee_id = chain.manager_id — each round reads the previous round's manager.",
      starter: `WITH RECURSIVE chain AS (
    -- seed: employee 28
    UNION ALL
    -- climb: join employees to the chain on manager_id, depth + 1
)
SELECT employee, job_title, depth
FROM chain
ORDER BY depth;
`,
      solution: `WITH RECURSIVE chain AS (
    SELECT employee_id,
           first_name || ' ' || last_name AS employee,
           job_title,
           manager_id,
           1 AS depth
    FROM employees
    WHERE employee_id = 28
    UNION ALL
    SELECT e.employee_id,
           e.first_name || ' ' || e.last_name,
           e.job_title,
           e.manager_id,
           chain.depth + 1
    FROM employees e
    JOIN chain ON e.employee_id = chain.manager_id
    WHERE chain.depth < 4
)
SELECT employee, job_title, depth
FROM chain
ORDER BY depth;`,
      ordered: true,
      expected: { columns: ["employee", "job_title", "depth"], rows: [
        ["Tara Singh", "Analytics Engineer", "1"],
        ["Daniel Kramer", "VP of Engineering", "2"],
        ["Amara Osei", "Chief Executive Officer", "3"],
      ] },
      explanation:
        "The seed is Tara herself at depth 1; the branch reads her manager_id and pulls in Daniel Kramer (depth 2), whose manager_id pulls in the CEO (depth 3). The walk ends there naturally — the CEO's manager_id is NULL matches nothing — and the depth < 4 bound guarantees it even on data that someday loops. Same machinery as the top-down census, pointed the other way: the join condition chooses the direction.",
      concepts: ["recursive CTE", "climbing up", "org charts", "bounds"],
    },
    {
      id: "g-a4",
      tier: "advanced",
      mode: "sql",
      title: "Money in, money out",
      prompt: "Meridian Trust's analysts want a money-flow picture per customer. With a CTE per_account that computes inflow (sum of amount where txn_type IN ('deposit','transfer_in')) and outflow (where txn_type IN ('withdrawal','transfer_out')) per account using sum(CASE WHEN ... THEN amount ELSE 0 END), roll up per customer: customer (full name), total_in, total_out and net (total_in - total_out), all 2 decimals, joining per_account through accounts to customers. Order by net ascending, then customer, first five rows. Expected columns: customer, total_in, total_out, net.",
      dataset: "banking",
      sampleTables: ["transactions", "accounts", "customers"],
      hint: "The CTE classifies each transaction with CASE inside sum(); the outer query only aggregates the per-account rows up to customers.",
      starter: `WITH per_account AS (
    -- inflow and outflow per account with sum(CASE WHEN txn_type IN (...) THEN amount ELSE 0 END)
)
SELECT cu.first_name || ' ' || cu.last_name AS customer,
       -- total_in, total_out, net
FROM per_account p
JOIN accounts a ON a.account_id = p.account_id
JOIN customers cu ON cu.customer_id = a.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name
`,
      solution: `WITH per_account AS (
    SELECT account_id,
           sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
                    THEN amount ELSE 0 END) AS inflow,
           sum(CASE WHEN txn_type IN ('withdrawal', 'transfer_out')
                    THEN amount ELSE 0 END) AS outflow
    FROM transactions
    GROUP BY account_id
)
SELECT cu.first_name || ' ' || cu.last_name AS customer,
       round(sum(p.inflow), 2) AS total_in,
       round(sum(p.outflow), 2) AS total_out,
       round(sum(p.inflow) - sum(p.outflow), 2) AS net
FROM per_account p
JOIN accounts a  ON a.account_id = p.account_id
JOIN customers cu ON cu.customer_id = a.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name
ORDER BY net, cu.customer_id
LIMIT 5;`,
      ordered: true,
      expected: { columns: ["customer", "total_in", "total_out", "net"], rows: [
        ["Kwame Mensah", "2792.40", "2865.00", "-72.60"],
        ["Trevor Bishop", "3570.00", "3548.20", "21.80"],
        ["Sandra Vance", "900.00", "155.00", "745.00"],
        ["Reginald Ashton", "2000.00", "0.00", "2000.00"],
        ["Colin Doyle", "9600.00", "5901.75", "3698.25"],
      ] },
      explanation:
        "Step 1 classifies every transaction into inflow or outflow with CASE inside sum() — one row per account, both money directions as columns. Step 2 rolls the per-account rows up to customers (transfer pairs like Raymond's checking-to-savings stay inside one customer's net). Kwame Mensah leads the out-spenders at -$72.60 net; his overdraft fee story from g-04 is visible in the margin between his flows. Aggregate-then-join keeps each side honest: fees stay out of both columns, by design.",
      concepts: ["CTE", "conditional aggregation", "pivot", "multi-hop joins"],
    },
  ],

  assessment: [
    {
      id: "g-as-1",
      prompt: "What does a subquery in WHERE give you that a hand-typed IN list does not?",
      options: [
        { text: "The comparison set is computed from live data, so it stays correct as the data changes", correct: true, feedback: "Correct — the query adapts; hand-typed lists rot." },
        { text: "Queries with subqueries always run faster", correct: false, feedback: "Speed is not the point — correctness over time is." },
        { text: "Access to the subquery's columns in your output", correct: false, feedback: "WHERE IN only filters — showing the other table's columns takes a join or a SELECT-list subquery." },
      ],
      explanation: "A subquery reads the live set: the day the data changes, the same query is still right.",
    },
    {
      id: "g-as-2",
      prompt: "NOT IN (SELECT col FROM t) returns zero rows. The most likely cause?",
      options: [
        { text: "col contains a NULL — and x NOT IN (..., NULL) is unknown for every row", correct: true, feedback: "Correct — the g-01 trap: one NULL empties the result." },
        { text: "t is empty", correct: false, feedback: "An empty set makes NOT IN true for everything — the opposite symptom." },
        { text: "NOT IN requires DISTINCT to work", correct: false, feedback: "Duplicates are harmless to IN and NOT IN; NULLs are the poison." },
      ],
      explanation: "NOT IN compares values; a NULL in the set makes every comparison unknown, and unknown fails the filter.",
    },
    {
      id: "g-as-3",
      prompt: "salary > ALL (SELECT salary FROM sales) is true when salary is greater than...",
      options: [
        { text: "Every sales salary — equivalently, greater than the maximum", correct: true, feedback: "Correct — ALL raises the bar to the top of the set." },
        { text: "At least one sales salary", correct: false, feedback: "That is > ANY — the bar sits at the minimum instead." },
        { text: "The average sales salary", correct: false, feedback: "Averages live in scalar subqueries with avg(); ALL is about every value." },
      ],
      explanation: "ALL demands the comparison hold for every member — so > ALL means greater than the max. ANY needs only one member, so > ANY means greater than the min.",
    },
    {
      id: "g-as-4",
      prompt: "A scalar subquery used in a comparison must return...",
      options: [
        { text: "At most one row and one column", correct: true, feedback: "Correct — one value, or the engine refuses to guess." },
        { text: "Exactly one column, any number of rows", correct: false, feedback: "Several rows trigger 'more than one row returned by a subquery used as an expression'." },
        { text: "At least one row and one column", correct: false, feedback: "Zero rows is legal — it yields NULL and the comparison becomes unknown, not an error." },
      ],
      explanation: "A scalar position holds one value: aggregate multi-row subqueries (max, avg) or compare against the whole set with ANY/ALL.",
    },
    {
      id: "g-as-5",
      prompt: "EXISTS (subquery) is true when...",
      options: [
        { text: "The subquery returns at least one row", correct: true, feedback: "Correct — existence is the whole question." },
        { text: "The subquery returns exactly one row", correct: false, feedback: "One row suffices, but any non-empty result wins — and the engine can stop at the first." },
        { text: "The subquery returns a TRUE value in its first column", correct: false, feedback: "Subqueries return rows, not booleans — EXISTS reads emptiness, not values." },
      ],
      explanation: "EXISTS asks only 'are there any rows?' — which is why NULLs in the inner columns cannot poison it.",
    },
    {
      id: "g-as-6",
      prompt: "The main advantage of a CTE over the same subquery nested in FROM is...",
      options: [
        { text: "Each step gets a name, reads top-down, and can be run and debugged alone", correct: true, feedback: "Correct — pipelines you can verify step by step." },
        { text: "CTEs are computed once and cached between queries", correct: false, feedback: "A CTE lives for exactly one statement — there is no caching across queries." },
        { text: "CTEs can be indexed like tables", correct: false, feedback: "A CTE is a named subquery, not a table you can index." },
      ],
      explanation: "WITH is the same machinery as a derived table, hoisted to the top and named — the gain is readability and stepwise debugging.",
    },
    {
      id: "g-as-7",
      prompt: "A CASE expression with no ELSE, on a row no WHEN matches, returns...",
      options: [
        { text: "NULL", correct: true, feedback: "Correct — legal, silent, and the reason to write the ELSE you mean." },
        { text: "The value of the first WHEN branch", correct: false, feedback: "Unmatched WHENs are skipped entirely — nothing carries over." },
        { text: "An error", correct: false, feedback: "Missing ELSE is perfectly legal — which is exactly what makes it dangerous." },
      ],
      explanation: "The missing ELSE means NULL: blank labels in output, and sums that can collapse to NULL inside aggregates.",
    },
    {
      id: "g-as-8",
      prompt: "Why must every recursive CTE be bounded?",
      options: [
        { text: "Without a stopping condition, cyclic or ever-growing data makes the loop run forever", correct: true, feedback: "Correct — the bound is the brake pedal, written every time." },
        { text: "PostgreSQL rejects unbounded recursion at parse time", correct: false, feedback: "The parser accepts it — the hang happens later, at runtime." },
        { text: "Bounds make the output order deterministic", correct: false, feedback: "ORDER BY does that; bounds exist so the loop can end." },
      ],
      explanation: "Recursion ends only when a round adds no rows — the bound's WHERE guarantees that round arrives, even on dirty data.",
    },
  ],

  project: {
    title: "The Analytics Pipeline",
    brief:
      "Pick any sample database and build ONE deliverable: a named, step-by-step analytics pipeline that answers a real business question. A CTE per step, at least one subquery doing work a flat join cannot express cleanly, an EXISTS answering a 'has ever / never' question, a CASE that labels or prioritizes, a conditional aggregation beside a plain total, and a final SELECT a manager could read without help. The discipline of this part — compute in named steps, verify each one, reconcile the numbers — is what separates a query that works today from a query your team can maintain.",
    requirements: [
      "One business question stated as a comment at the top, answerable only by combining at least three tables",
      "At least one CTE that pre-aggregates a one-to-many side before it is joined (the aggregate-then-join pattern)",
      "At least one subquery in WHERE or SELECT — IN, ANY/ALL, or a scalar comparison",
      "At least one EXISTS or NOT EXISTS answering a 'has ever / never' question",
      "At least one CASE — a label in SELECT or a priority in ORDER BY",
      "At least one conditional aggregation (sum(CASE) or count(*) FILTER) alongside a plain total",
      "A deterministic ORDER BY and at most 15 rows of final output",
    ],
    steps: [
      "Choose the database and write the business question first — as a comment, before any SQL exists.",
      "Sketch the pipeline as CTE names in comments: what each step computes, what it hands the next.",
      "Build step 1 and run it alone (SELECT * FROM it); read its rows before writing step 2.",
      "Chain the remaining steps the same way — run each new CTE before building on it.",
      "Write the final SELECT: the subquery comparison, the EXISTS question, the CASE labels, the conditional aggregates, the ORDER BY.",
      "Reconcile one number by hand against a simpler query — prove the pipeline agrees with a naive spelling.",
      "Add a one-line comment per step saying what it contributes to the answer — the report a teammate reads first.",
    ],
    starter: `-- The Analytics Pipeline (Part G mini project)
-- Database: ???    Business question: ???

-- WITH step1 AS (  -- pre-aggregate a one-to-many side: ???
-- ),
-- step2 AS (       -- reads step1: ???
-- )
-- SELECT ...       -- the EXISTS question, the CASE label,
--                  -- the conditional aggregate, the ORDER BY
-- HINT: verify each step alone before building on it`,
    concepts: ["CTE pipelines", "subqueries", "EXISTS", "CASE", "conditional aggregation"],
    extension:
      "Add a second pipeline: a bounded recursive CTE that walks a tree in your chosen data (an org chart, a prerequisite chain, a category hierarchy) and feeds its result into your first pipeline — pipelines of pipelines. Then rewrite the whole thing as nested derived tables and reflect on which version you would rather debug at 2 a.m.",
  },
};
