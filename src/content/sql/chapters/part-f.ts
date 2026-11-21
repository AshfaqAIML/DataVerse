/**
 * Part F — Joining Tables (compact but complete).
 *
 * Every join kind on real data: INNER mechanics, LEFT/RIGHT with the
 * anti-join pattern, FULL and CROSS, self joins, and multi-table chains.
 * Verified outputs via the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_F: Part = {
  letter: "F",
  title: "Joining Tables",
  tagline: "Combine tables with INNER, LEFT, RIGHT, FULL, CROSS and self joins.",
  description:
    "Part A promised that shared values connect tables; this part delivers the connection. You will learn how joins mechanically match rows, why LEFT JOIN plus IS NULL finds the never-ordered and never-enrolled, how a table joins to itself for org charts, and how to chain four tables to answer real business questions. Joins are the heart of SQL — after this part, the six sample databases become one connected world.",
  stub: false,
  lessons: [
    {
      slug: "f-01",
      title: "Why joins exist — and your first INNER JOIN",
      minutes: 13,
      summary: "One fact split across tables comes back together: the join key matches rows, and INNER keeps the matches.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Explain why one fact lives in several tables",
        "Write a two-table INNER JOIN with a correct ON condition",
        "Read a joined result and trace each output column to its table",
        "Use table aliases for readable joins",
      ],
      why: "The whole relational model — Part A's shared values — becomes real the moment you join. Orders know a customer by id only; the customer's name and city live in customers. Until you can stitch them back together, every question that spans tables ('who ordered what, and where do they live?') is unanswerable. The join is that stitch, and this lesson makes it mechanical and readable.",
      blocks: [
        {
          kind: "text",
          text: "An order row holds `customer_id 1` — a reference. The name 'Amelia Watson' and her city live in the customers row whose primary key is 1. A join follows the reference: match rows of one table to rows of another where the values agree, and return the combined columns:",
        },
        {
          kind: "sql",
          title: "Your first join",
          code: "SELECT o.order_id, o.total,\n       c.first_name, c.last_name, c.city\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'delivered'\nORDER BY o.order_id\nLIMIT 5;",
          result: { columns: ["order_id", "total", "first_name", "last_name", "city"], rows: [
        ["1", "1407.00", "Amelia", "Watson", "Portland"],
        ["2", "378.00", "Marcus", "Chen", "Seattle"],
        ["3", "249.00", "Priya", "Sharma", "Austin"],
        ["5", "129.00", "Amelia", "Watson", "Portland"],
        ["6", "948.00", "Hannah", "Kowalski", "Chicago"],
      ] },
          explain: [
            "FROM orders o — alias o; customers c — alias c. Aliases are how joins stay readable.",
            "ON c.customer_id = o.customer_id is the match rule: pair each order with the customer holding the same id.",
            "The SELECT list qualifies every column (o.order_id, c.city) — with two tables, qualification is how you (and the engine) know whose column you mean.",
          ],
        },
        {
          kind: "visual",
          title: "What ON actually does",
          ascii: `  orders                          customers
  order_id | customer_id           customer_id | name
  ---------+------------           ------------+--------
     501   |     1        ---->         1       | Amelia
     502   |     1        ---->         1       | Amelia
     503   |     2        ---->         2       | Marcus
     504   |    17        ---->        17       | (nobody: Lucia never ordered)

  ON matches equal values; INNER JOIN keeps ONLY the pairs`,
          caption: "The join key is the bridge: every order pairs with the customer whose key it carries.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "JOIN means INNER JOIN",
          text: "Bare JOIN is INNER JOIN — only matched pairs survive. Customers with no orders (like Lucia and Mina) simply do not appear. Keeping the unmatched is the next lesson's job.",
        },
        {
          kind: "lab",
          title: "Join enrollments to students",
          task: "On Northgate: every enrollment with the student's name — student's first_name and last_name, the course_id, term and grade, ordered by student_id, then course_id, first five rows. Expected columns: first_name, last_name, course_id, term, grade.",
          code: "SELECT s.first_name, s.last_name, e.course_id, e.term, e.grade\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nORDER BY s.student_id, e.course_id\nLIMIT 5;",
          dataset: "university",
          hint: "Alias both tables; ON matches the student key the enrollment carries.",
        },
      ],
      terms: [
        { term: "JOIN (INNER)", definition: "Pairs rows of two tables where the ON condition holds; unmatched rows vanish." },
        { term: "ON", definition: "The join's match rule — typically left.key = right.key." },
        { term: "Table alias", definition: "A short name (o, c) for a table in this query; mandatory equipment for joins." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the ON condition",
          why: "A join without ON pairs EVERY row with EVERY row — a cartesian explosion you will meet deliberately in f-04.",
          fix: "Every JOIN carries its ON; the moment you type JOIN, type ON in the same breath.",
        },
        {
          mistake: "Unqualified columns in a join",
          why: "Two tables both have customer_id (or id or name) — the engine refuses the ambiguous name.",
          fix: "Qualify every column in a join: o.total, c.city. Ambiguity errors vanish.",
        },
      ],
      takeaways: [
        "Joins follow references: the join key pairs rows across tables.",
        "ON is the match rule; aliases keep multi-table queries readable.",
        "INNER JOIN keeps matched pairs only — unmatched rows disappear.",
        "Qualify every column once two tables are in play.",
      ],
      quiz: [
        {
          id: "f-01-q1",
          prompt: "An INNER JOIN of orders to customers on the customer id: which orders appear?",
          options: [
            { text: "All orders, with NULL customer columns where no customer matches", correct: false, feedback: "That is LEFT JOIN behavior — INNER drops the unmatched." },
            { text: "Only orders whose customer_id matches a real customer row", correct: true, feedback: "Correct — inner keeps the pairs, nothing else." },
            { text: "All customers, whether or not they ordered", correct: false, feedback: "Also outer-join territory; inner has no side to protect." },
          ],
          explanation: "INNER JOIN is the strict matchmaker: pairs in, orphans out.",
        },
        {
          id: "f-01-q2",
          prompt: "Why do the lesson's columns carry prefixes like o.order_id and c.city?",
          options: [
            { text: "Both tables could hold identically named columns; qualification names the owner", correct: true, feedback: "Correct — joins make qualification mandatory equipment." },
            { text: "It makes the query run faster", correct: false, feedback: "It makes queries READABLE and unambiguous; speed is unaffected." },
            { text: "PostgreSQL requires prefixes always", correct: false, feedback: "Only when ambiguous — but joins usually are." },
          ],
          explanation: "With two tables in play, o.total and c.city say whose fact you mean; the engine enforces it on collisions.",
        },
      ],
    },

    {
      slug: "f-02",
      title: "Join mechanics — aliases, extra conditions, chains",
      minutes: 14,
      summary: "Conditions in ON versus WHERE, joining with names instead of ids, and chaining three and four tables.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Put join-specific conditions in ON and general filters in WHERE",
        "Chain three and four tables in one query",
        "Join on names or expressions when keys are unavailable",
        "Build a joined report one join at a time",
      ],
      why: "Real questions span three and four tables — 'customer names with product names and quantities for delivered orders' needs customers, orders, order_items and products in one query. The mechanics here (ON versus WHERE conditions, building chains one join at a time) are what make four-table queries tractable instead of terrifying.",
      blocks: [
        {
          kind: "text",
          text: "A three-table chain walks the references: customers to orders (who placed it), orders to order_items (what was in it), order_items to products (what it is). Each JOIN adds one table and one ON:",
        },
        {
          kind: "sql",
          title: "The four-table question",
          code: "SELECT c.first_name || ' ' || c.last_name AS customer,\n       p.name AS product,\n       oi.quantity,\n       oi.unit_price\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.status = 'delivered'\nORDER BY o.order_id, p.product_id\nLIMIT 6;",
          result: { columns: ["customer", "product", "quantity", "unit_price"], rows: [
        ["Amelia Watson", "AeroBook 14 Laptop", "1", "1299.00"],
        ["Amelia Watson", "ChargeHub 100W GaN", "1", "59.00"],
        ["Amelia Watson", "FlexStand Aluminum Dock", "1", "49.00"],
        ["Marcus Chen", "SoundCore ANC Headphones", "1", "249.00"],
        ["Marcus Chen", "SoundCore Lite Earbuds", "1", "129.00"],
        ["Priya Sharma", "SoundCore ANC Headphones", "1", "249.00"],
      ] },
          explain: [
            "Three JOINs walk the reference chain: c -> o -> oi -> p. Each ON names the bridge the schema declares.",
            "The WHERE is a general filter (delivered orders); the ONs are the matches.",
            "Read the output as a sentence: Amelia bought an AeroBook 14 and a ChargeHub in order 1.",
          ],
        },
        { kind: "heading", text: "ON conditions versus WHERE" },
        {
          kind: "sql",
          title: "Join conditions can carry more than the key",
          dataset: "hr",
          code: "SELECT d.name AS department,\n       e.first_name || ' ' || e.last_name AS employee,\n       e.salary\nFROM departments d\nJOIN employees e ON e.dept_id = d.dept_id\n              AND e.terminated IS NULL\nWHERE d.location = 'New York'\nORDER BY d.name, e.salary DESC\nLIMIT 6;",
          result: { columns: ["department", "employee", "salary"], rows: [
        ["Engineering", "Daniel Kramer", "245000.00"],
        ["Engineering", "Lena Hoffman", "198000.00"],
        ["Engineering", "Marcus Tran", "192000.00"],
        ["Engineering", "Elena Petrova", "168000.00"],
        ["Engineering", "James Okoro", "162000.00"],
        ["Engineering", "Grace Park", "158000.00"],
      ] },
          explain: [
            "The ON carries the key match PLUS a join-participation rule (current staff only) — a taste of outer-join semantics where placement matters enormously (next lesson).",
            "The WHERE narrows the RESULT (New York departments, six highest-paid staff shown). With INNER JOIN both placements behave identically — remember this when LEFT JOIN changes the story.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Build big joins one step at a time",
          text: "Start with two tables and a SELECT *; check the row count makes sense; add the next JOIN; check again. A four-table query built incrementally debugs itself — the same query built at once fails in four places at once.",
        },
        {
          kind: "lab",
          title: "The student-course-professor chain",
          task: "On Northgate: who teaches whom? Student full name, course code, professor full name — for graded enrollments (grade IS NOT NULL) in term 2021F or later, ordered by student last name, first 8 rows. Expected columns: student, code, professor.",
          code: "SELECT s.first_name || ' ' || s.last_name AS student,\n       c.code,\n       p.first_name || ' ' || p.last_name AS professor\nFROM enrollments e\nJOIN students s   ON s.student_id = e.student_id\nJOIN courses c    ON c.course_id = e.course_id\nJOIN professors p ON p.prof_id = c.prof_id\nWHERE e.grade IS NOT NULL\n  AND e.term >= '2021F'\nORDER BY s.last_name\nLIMIT 8;",
          dataset: "university",
          hint: "Three joins, one chain: enrollments carry both keys; courses carry the professor.",
        },
      ],
      terms: [
        { term: "Join chain", definition: "Several JOINs in sequence, walking references table to table." },
        { term: "ON condition", definition: "The match rule for one join — the key equality plus optional participation rules." },
        { term: "Hub table", definition: "The table whose foreign keys fan out to several others — admissions joins patients, doctors and departments." },
      ],
      mistakes: [
        {
          mistake: "Forgetting one link of the chain",
          why: "Skipping a table (customers straight to order_items) has no valid ON — the columns are not there.",
          fix: "Walk the references: each JOIN's ON names a bridge that actually exists between those two tables.",
        },
        {
          mistake: "Writing a whole four-table join at once",
          why: "Errors compound; wrong row counts are unexplainable.",
          fix: "One join at a time, checking the count at each step — the incremental habit from the tip.",
        },
      ],
      takeaways: [
        "Chains walk declared references: each ON is one bridge.",
        "ON carries the match (plus optional rules); WHERE filters the result.",
        "Qualify everything; alias every table.",
        "Build joins incrementally — each step verifiable.",
      ],
      quiz: [
        {
          id: "f-02-q1",
          prompt: "Why does the four-table query need order_items at all?",
          options: [
            { text: "The order's total lives there", correct: false, feedback: "The total lives on orders; order_items holds the per-product lines." },
            { text: "Orders reference customers, but products only connect to orders THROUGH order_items", correct: true, feedback: "Correct — items are the junction holding both keys." },
            { text: "For performance", correct: false, feedback: "It is structure, not speed — without the junction, no bridge exists." },
          ],
          explanation: "order_items is the junction between orders and products (Part A's M:N pattern) — the chain must pass through it.",
        },
        {
          id: "f-02-q2",
          prompt: "With INNER JOIN, a condition in ON versus the same condition in WHERE gives...",
          options: [
            { text: "Different rows", correct: false, feedback: "For INNER joins the placement is interchangeable in result." },
            { text: "The same rows (placement starts to matter with outer joins)", correct: true, feedback: "Correct — and next lesson's LEFT JOIN makes placement decisive." },
            { text: "An error", correct: false, feedback: "Both placements are legal in inner joins." },
          ],
          explanation: "INNER JOIN cannot tell ON from WHERE in results — but outer joins can, which is why the habit of deliberate placement matters now.",
        },
      ],
    },

    {
      slug: "f-03",
      title: "LEFT JOIN — keeping the unmatched",
      minutes: 14,
      summary: "Outer joins preserve one side entirely: NULL-padded matches, the anti-join pattern, and counting the never-buyers.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Keep all rows of one side with LEFT JOIN",
        "Find non-matching rows with LEFT JOIN ... IS NULL (the anti-join)",
        "Count with LEFT JOIN correctly (count the right side's key)",
        "Explain RIGHT JOIN as the mirror",
      ],
      why: "'Which customers never ordered?' is the question every business asks and WHERE alone cannot answer — the customers you seek are exactly those with NO rows in orders. LEFT JOIN keeps every left-side row, padding the missing matches with NULLs, and that padding is a signal you can filter on. This one pattern — outer join plus IS NULL — powers churn analysis, gap finding and every 'never X' question you will ever be asked.",
      blocks: [
        {
          kind: "text",
          text: "LEFT JOIN keeps EVERY row of the left table. Rows with matches join normally; rows without get NULLs on the right side. Nothing on the left is ever lost:",
        },
        {
          kind: "sql",
          title: "Everyone, matched or not",
          code: "SELECT c.first_name || ' ' || c.last_name AS customer,\n       c.city,\n       o.order_id,\n       o.total\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE c.city IN ('Portland', 'Austin')\nORDER BY c.customer_id, o.order_id;",
          result: { columns: ["customer", "city", "order_id", "total"], rows: [
        ["Amelia Watson", "Portland", "1", "1407.00"],
        ["Amelia Watson", "Portland", "5", "129.00"],
        ["Amelia Watson", "Portland", "19", "59.00"],
        ["Amelia Watson", "Portland", "41", "49.00"],
        ["Priya Sharma", "Austin", "3", "249.00"],
        ["Priya Sharma", "Austin", "13", "329.00"],
        ["Priya Sharma", "Austin", "39", "89.00"],
        ["Owen Davis", "Portland", "12", "549.00"],
        ["Owen Davis", "Portland", "29", "1798.00"],
        ["Ayesha Khan", "Austin", "22", "189.00"],
        ["Ayesha Khan", "Austin", "33", "128.00"],
        ["Ayesha Khan", "Austin", "50", "99.00"],
        ["Carl Jensen", "Portland", "32", "29.00"],
        ["Carl Jensen", "Portland", "46", "29.00"],
      ] },
          explain: [
            "Every Portland/Austin customer appears; those without orders show NULL order_id and NULL total.",
            "Priya (Austin) appears WITH her orders; Lucia... is Miami, so not in this filter — but the pattern shows in the NULLs where they occur.",
          ],
        },
        { kind: "heading", text: "The anti-join: LEFT JOIN ... IS NULL" },
        {
          kind: "sql",
          title: "The never-buyers, found",
          code: "SELECT c.customer_id, c.first_name, c.last_name, c.city\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL\nORDER BY c.customer_id;",
          result: { columns: ["customer_id", "first_name", "last_name", "city"], rows: [
        ["17", "Lucia", "Moreno", "Miami"],
        ["19", "Mina", "Tanaka", "Seattle"],
      ] },
          explain: [
            "The padding IS the signal: o.order_id IS NULL means the left row found no match — this customer never ordered.",
            "Lucia Moreno and Mina Tanaka surface: acquired, not converted. The growth team now knows exactly who to call.",
          ],
        },
        {
          kind: "sql",
          title: "Counting with a LEFT JOIN",
          code: "SELECT c.first_name || ' ' || c.last_name AS customer,\n       count(o.order_id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY orders DESC, c.customer_id\nLIMIT 6;",
          result: { columns: ["customer", "orders"], rows: [
        ["Amelia Watson", "4"],
        ["Marcus Chen", "4"],
        ["Priya Sharma", "3"],
        ["Diego Alvarez", "3"],
        ["Hannah Kowalski", "3"],
        ["Tom Fletcher", "3"],
      ] },
          explain: [
            "count(o.order_id) counts matches — 0 for never-buyers, since NULLs are skipped (Part D's rule doing join duty).",
            "count(*) would have counted 1 for never-buyers too — the padded row itself. Counting the RIGHT side's key is the correct 'how many matches' pattern.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "WHERE after a LEFT JOIN can undo it",
          text: "WHERE o.status = 'delivered' after a LEFT JOIN drops every NULL-padded row — silently turning your outer join back into an inner one. Match-specific conditions belong IN the ON; general filters in WHERE. RIGHT JOIN is simply LEFT with sides swapped: LEFT JOIN b ON ... and RIGHT JOIN a ON ... are mirror images.",
        },
        {
          kind: "lab",
          title: "Courses nobody takes",
          task: "Northgate's empty-classroom report: every course with its enrollment count, INCLUDING courses with zero enrollments — code, title and enrollments (count of matching enrollments), courses with zero first. Expected columns: code, title, enrollments.",
          code: "SELECT c.code, c.title, count(e.course_id) AS enrollments\nFROM courses c\nLEFT JOIN enrollments e ON e.course_id = c.course_id\nGROUP BY c.code, c.title\nORDER BY enrollments ASC, c.code\nLIMIT 5;",
          dataset: "university",
          hint: "CS 495's NULL padding counts as 0 — the count-the-key pattern at work.",
        },
      ],
      terms: [
        { term: "LEFT JOIN", definition: "Keeps every left-side row, padding missing matches with NULLs." },
        { term: "Anti-join", definition: "LEFT JOIN plus WHERE right IS NULL — the 'no match exists' pattern." },
        { term: "RIGHT JOIN", definition: "LEFT JOIN with sides swapped: keeps every right-side row." },
      ],
      mistakes: [
        {
          mistake: "WHERE on the right table after a LEFT JOIN",
          why: "The NULL-padded rows fail the condition — your outer join silently becomes inner.",
          fix: "Right-table match conditions go in ON; WHERE takes only left-side (or result-wide) filters.",
        },
        {
          mistake: "count(*) after a LEFT JOIN and reading padded rows as matches",
          why: "Never-buyers count 1 instead of 0 — every average and total lies.",
          fix: "Count the right side's key: count(o.order_id) — NULLs skip, zeros surface.",
        },
      ],
      takeaways: [
        "LEFT JOIN keeps the whole left side; NULL padding marks the unmatched.",
        "LEFT JOIN ... WHERE right IS NULL = the never-matched (anti-join).",
        "Count matches with count(right.key), never count(*), after outer joins.",
        "Right-table conditions in ON, general filters in WHERE.",
      ],
      quiz: [
        {
          id: "f-03-q1",
          prompt: "How does LEFT JOIN find customers who never ordered?",
          options: [
            { text: "It filters them out by default", correct: false, feedback: "It keeps them — with NULLs where the orders would be." },
            { text: "They survive with NULL order columns, so WHERE o.order_id IS NULL isolates them", correct: true, feedback: "Correct — the padding is the signal." },
            { text: "A special NEVER keyword is used", correct: false, feedback: "No such keyword — the IS NULL pattern IS the tool." },
          ],
          explanation: "The unmatched keep NULL on the right side; filtering on that NULL is the anti-join, SQL's never-matched detector.",
        },
        {
          id: "f-03-q2",
          prompt: "After LEFT JOIN orders, why count(o.order_id) instead of count(*)?",
          options: [
            { text: "count(*) counts the padded row itself — never-buyers would show 1, not 0", correct: true, feedback: "Correct — counting the right key skips NULLs and yields true match counts." },
            { text: "count(*) is slower", correct: false, feedback: "Speed is not the issue; honesty of the count is." },
            { text: "count(*) is invalid after joins", correct: false, feedback: "It is valid — just wrong for counting matches." },
          ],
          explanation: "count(*) counts rows (padded included); count(o.order_id) counts matches (NULLs skipped). The second answers 'how many orders'.",
        },
      ],
    },

    {
      slug: "f-04",
      title: "FULL, CROSS and self joins",
      minutes: 13,
      summary: "The specialists: FULL OUTER for orphans on both sides, CROSS for every combination, and the self join for org charts.",
      kind: "coding",
      dataset: "hr",
      objectives: [
        "Use FULL OUTER JOIN to catch orphans on both sides",
        "Produce deliberate combinations with CROSS JOIN",
        "Join a table to itself with aliases for the org chart",
        "Compare rows within one table via self join",
      ],
      why: "Three specialists complete the join family. FULL OUTER answers 'what is missing on EITHER side' — the reconciliation query of every data-migration project. CROSS builds every combination when combination is the point (sizes x colors). And the self join turns HeliosWorks' manager_id into a human-readable org chart — the pattern behind every 'compare rows of the same table' question, from duplicate detection to mentor pairing.",
      blocks: [
        { kind: "heading", text: "FULL OUTER — orphans on both sides" },
        {
          kind: "sql",
          title: "The reconciliation join",
          code: "CREATE TABLE expected_import (sku text PRIMARY KEY, qty int);\nCREATE TABLE actual_stock   (sku text PRIMARY KEY, qty int);\n\nINSERT INTO expected_import (sku, qty) VALUES ('A1', 10), ('B2', 5), ('C3', 7);\nINSERT INTO actual_stock (sku, qty) VALUES ('A1', 9), ('B2', 5), ('D4', 2);\n\nSELECT COALESCE(e.sku, a.sku) AS sku,\n       e.qty AS expected, a.qty AS actual\nFROM expected_import e\nFULL JOIN actual_stock a ON a.sku = e.sku\nORDER BY sku;",
          result: { columns: ["sku", "expected", "actual"], rows: [
        ["A1", "10", "9"],
        ["B2", "5", "5"],
        ["C3", "7", null],
        ["D4", null, "2"],
      ] },
          explain: [
            "C3 exists only in expected (NULL actual); D4 only in actual (NULL expected) — FULL keeps both orphans.",
            "COALESCE picks whichever sku exists — the standard label trick for full joins.",
            "This is the reconciliation report: expected vs actual, gaps on both sides visible.",
          ],
        },
        { kind: "heading", text: "CROSS — every combination" },
        {
          kind: "sql",
          title: "Building a size-color matrix",
          code: "CREATE TABLE sizes (size text);\nCREATE TABLE colors (color text);\nINSERT INTO sizes VALUES ('S'), ('M'), ('L');\nINSERT INTO colors VALUES ('Black'), ('Navy');\n\nSELECT s.size, c.color\nFROM sizes s\nCROSS JOIN colors c\nORDER BY s.size, c.color;",
          result: { columns: ["size", "color"], rows: [
        ["L", "Black"],
        ["L", "Navy"],
        ["M", "Black"],
        ["M", "Navy"],
        ["S", "Black"],
        ["S", "Navy"],
      ] },
          explain: [
            "3 sizes x 2 colors = 6 rows — every combination, exactly what a product-variant generator needs.",
            "CROSS JOIN has no ON: pairing everything IS its purpose. Accidental crosses (a forgotten ON) explode row counts — that is the danger.",
          ],
        },
        { kind: "heading", text: "The self join — one table, two roles" },
        {
          kind: "sql",
          title: "The org chart, readable",
          code: "SELECT e.first_name || ' ' || e.last_name AS employee,\n       e.job_title,\n       m.first_name || ' ' || m.last_name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.employee_id = e.manager_id\nWHERE e.terminated IS NULL\nORDER BY e.employee_id\nLIMIT 6;",
          result: { columns: ["employee", "job_title", "manager"], rows: [
        ["Amara Osei", "Chief Executive Officer", null],
        ["Daniel Kramer", "VP of Engineering", "Amara Osei"],
        ["Sofia Mancini", "VP of Sales", "Amara Osei"],
        ["Priya Nair", "VP of Product", "Amara Osei"],
        ["Gerald Weiss", "Head of People", "Amara Osei"],
        ["Lena Hoffman", "Engineering Manager", "Daniel Kramer"],
      ] },
          explain: [
            "One table, two aliases: e is the employee view, m is the same table read as managers.",
            "The LEFT JOIN keeps Amara, the CEO, whose manager is NULL — an INNER join would silently delete the top of the org chart.",
            "Every row answers 'who do you report to' — the seating chart for the whole company.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Self join patterns everywhere",
          text: "Find pairs within one table (doctors sharing departments, courses sharing professors), compare a row to its group (an employee vs their department's average — Part G's correlated subquery), detect near-duplicates: the self join is 'the table meets itself', and aliases make the two roles explicit.",
        },
        {
          kind: "lab",
          title: "Managers and their reports",
          task: "Flip the org chart: for every CURRENT manager (anyone who IS somebody's manager), their name and how many direct reports they have — manager name and reports (the count), busiest first. Expected columns: manager, reports. Hint: join employees to itself, GROUP BY the manager.",
          code: "SELECT m.first_name || ' ' || m.last_name AS manager,\n       count(*) AS reports\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.terminated IS NULL\nGROUP BY m.first_name, m.last_name\nORDER BY reports DESC, manager;",
          dataset: "hr",
          hint: "The INNER join drops non-managers automatically (no match as manager); the CEO still appears if they manage anyone — Amara manages four.",
        },
      ],
      terms: [
        { term: "FULL OUTER JOIN", definition: "Keeps every row of both sides, padding whichever side lacks a match." },
        { term: "CROSS JOIN", definition: "Every combination of both tables' rows — no ON, by design." },
        { term: "Self join", definition: "A table joined to itself under two aliases, relating rows within one table." },
      ],
      mistakes: [
        {
          mistake: "Using CROSS JOIN by accident (a forgotten ON)",
          why: "10,000 rows x 5,000 rows is fifty million pairs — queries that never finish.",
          fix: "Every JOIN gets its ON immediately; CROSS is a deliberate, small-table tool.",
        },
        {
          mistake: "INNER self join losing the CEO",
          why: "The CEO has no manager row to match — an inner join deletes the org chart's top.",
          fix: "LEFT JOIN for the self join when the unmatched side matters (any root: CEO, top category, oldest ancestor).",
        },
      ],
      takeaways: [
        "FULL OUTER keeps orphans on both sides — the reconciliation join.",
        "CROSS JOIN pairs everything deliberately; forgotten ONs do it accidentally.",
        "Self joins relate rows within one table; aliases name the two roles.",
        "LEFT in a self join preserves the root (the bossless boss).",
      ],
      quiz: [
        {
          id: "f-04-q1",
          prompt: "Which join finds skus present in expected but missing from actual AND vice versa?",
          options: [
            { text: "INNER JOIN", correct: false, feedback: "Inner keeps only matches — the gaps vanish." },
            { text: "FULL OUTER JOIN", correct: true, feedback: "Correct — orphans on both sides survive, NULLs marking each gap." },
            { text: "CROSS JOIN", correct: false, feedback: "That pairs everything with everything — reconciliation chaos." },
          ],
          explanation: "FULL OUTER is the both-sides keeper: missing-either-way rows appear with NULLs on the absent side.",
        },
        {
          id: "f-04-q2",
          prompt: "Why does the org-chart self join use LEFT, not INNER?",
          options: [
            { text: "To include the CEO, whose manager_id is NULL and would match nothing", correct: true, feedback: "Correct — the root must survive, and only an outer join keeps it." },
            { text: "LEFT is faster on self joins", correct: false, feedback: "Speed is not the reason; completeness is." },
            { text: "INNER JOIN cannot join a table to itself", correct: false, feedback: "It can — it would just lose the bossless boss." },
          ],
          explanation: "The CEO's NULL manager finds no match; LEFT JOIN keeps the row with a NULL manager column — the org chart's head survives.",
        },
      ],
    },

    {
      slug: "f-05",
      title: "Join practice: the business questions",
      minutes: 15,
      summary: "Five realistic multi-table questions across the sample databases — the full join toolbox under working conditions.",
      kind: "coding",
      dataset: "hospital",
      objectives: [
        "Translate multi-table business questions into join chains",
        "Choose inner versus outer deliberately per question",
        "Join plus aggregate in one query (the report shape)",
        "Verify join outputs by reading and counting",
      ],
      why: "Joins are learned in the fingers, not the eyes. This lesson runs the toolbox against five real questions — the ward list, the staff census, the stock-value report, the customer-product trail — each requiring you to choose the join kind, walk the chain, and verify the output counts. The case studies at the course's end are exactly this, harder; this is the rehearsal.",
      blocks: [
        {
          kind: "lab",
          title: "Q1 — The ward list (hospital)",
          task: "Currently admitted patients (discharged_at IS NULL) with doctor AND department names: admission_id, patient (full name), doctor (full name), department name, room — ordered by admission_id. Four joins in one query.",
          code: "SELECT a.admission_id,\n       p.first_name || ' ' || p.last_name AS patient,\n       d.first_name || ' ' || d.last_name AS doctor,\n       dep.name AS department,\n       a.room\nFROM admissions a\nJOIN patients p    ON p.patient_id = a.patient_id\nJOIN doctors d     ON d.doctor_id = a.doctor_id\nJOIN departments dep ON dep.dept_id = a.dept_id\nWHERE a.discharged_at IS NULL\nORDER BY a.admission_id;",
          dataset: "hospital",
          hint: "admissions carries all three foreign keys — the chain fans out from it.",
        },
        {
          kind: "lab",
          title: "Q2 — Doctor census (hospital)",
          task: "How many admissions has each doctor overseen, including doctors with none? doctor (full name), department name, admissions (the count) — doctors with zero first. The census keeps everyone.",
          code: "SELECT d.first_name || ' ' || d.last_name AS doctor,\n       dep.name AS department,\n       count(a.admission_id) AS admissions\nFROM doctors d\nJOIN departments dep ON dep.dept_id = d.dept_id\nLEFT JOIN admissions a ON a.doctor_id = d.doctor_id\nGROUP BY d.doctor_id, d.first_name, d.last_name, dep.name\nORDER BY admissions ASC, doctor\nLIMIT 6;",
          dataset: "hospital",
          hint: "LEFT JOIN admissions keeps the never-admitting doctor; count(a.admission_id) gives them an honest 0.",
        },
        {
          kind: "lab",
          title: "Q3 — Stock value with names (retail)",
          task: "Per store: total stock value at cost — store name and stock_value (sum of on_hand times cost, 2 decimals), highest first. Inventory joins products for cost, stores for names.",
          code: "SELECT s.name AS store,\n       round(sum(i.on_hand * p.cost), 2) AS stock_value\nFROM stores s\nJOIN inventory i ON i.store_id = s.store_id\nJOIN products p  ON p.product_id = i.product_id\nGROUP BY s.store_id, s.name\nORDER BY stock_value DESC;",
          dataset: "retail",
          hint: "Join for facts, aggregate per group — the joined-report shape from Part E, now with the join doing the assembling.",
        },
        {
          kind: "lab",
          title: "Q4 — The customer trail (ecommerce)",
          task: "For customer 1 (Amelia Watson): every product she ever bought — order_id, product name, quantity — ordered by order_id then product_id. The four-table chain from f-02, scoped to one customer.",
          code: "SELECT o.order_id, p.name AS product, oi.quantity\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nWHERE o.customer_id = 1\nORDER BY o.order_id, p.product_id;",
          dataset: "ecommerce",
          hint: "Three joins: orders (hers), items (what), products (names).",
        },
        {
          kind: "lab",
          title: "Q5 — Enrollment with grades (university)",
          task: "CS majors' graded CS-course enrollments: student full name, course code, term, grade — only courses from dept_id 1 AND students majoring in dept_id 1, graded only, ordered by student last name, course code. First 8 rows.",
          code: "SELECT s.first_name || ' ' || s.last_name AS student,\n       c.code, e.term, e.grade\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses c  ON c.course_id = e.course_id\nWHERE s.major_dept_id = 1\n  AND c.dept_id = 1\n  AND e.grade IS NOT NULL\nORDER BY s.last_name, c.code\nLIMIT 8;",
          dataset: "university",
          hint: "The join carries the references; WHERE does the scoping — filters you could not express without the joined columns.",
        },
      ],
      terms: [
        { term: "Joined report", definition: "A join chain feeding GROUP BY aggregates — the standard business-report shape." },
        { term: "Census query", definition: "An outer join plus count-the-key report that keeps zero-members too." },
        { term: "Row-count check", definition: "Counting rows after each JOIN to catch multiplying or dropping links early." },
      ],
      mistakes: [
        {
          mistake: "Choosing the join kind by habit",
          why: "Inner everywhere silently answers a different question whenever 'including those with none' was asked.",
          fix: "Ask per question: must unmatched rows survive? Inner if not, outer if so.",
        },
        {
          mistake: "Trusting a joined count without reading it",
          why: "A wrong ON duplicates or drops rows invisibly — counts look plausible while being wrong.",
          fix: "Join incrementally and count at each step; a sudden jump or drop names the broken link.",
        },
      ],
      takeaways: [
        "Joins assemble, WHERE scopes, GROUP BY summarizes — the report pipeline.",
        "Choose inner versus outer per question, not by habit.",
        "Census queries: LEFT JOIN plus count(right.key) keeps the zeros honest.",
        "Build and verify join chains step by step.",
      ],
      quiz: [
        {
          id: "f-05-q1",
          prompt: "'Each doctor's admissions, including doctors with none' needs which shape?",
          options: [
            { text: "INNER JOIN with count(*)", correct: false, feedback: "Inner drops the none-doctors; count(*) would also miscount." },
            { text: "LEFT JOIN admissions with count(a.admission_id)", correct: true, feedback: "Correct — everyone kept, zeros honest." },
            { text: "CROSS JOIN", correct: false, feedback: "Pairing every doctor with every admission is not a census." },
          ],
          explanation: "The census pattern: outer join to keep everyone, count the right side's key for honest zeros.",
        },
        {
          id: "f-05-q2",
          prompt: "A four-table report's row count doubles after adding the last join. Most likely cause?",
          options: [
            { text: "The last ON matches multiple rows on the far side — a one-to-many you did not account for", correct: true, feedback: "Correct — joins multiply by matches; a doubled count names the culprit link." },
            { text: "PostgreSQL duplicated rows randomly", correct: false, feedback: "Engines do not duplicate randomly; ONs multiply predictably." },
            { text: "The WHERE clause failed", correct: false, feedback: "A failed WHERE would shrink, not double." },
          ],
          explanation: "Row counts narrate join health: a jump means the new link matched more than one row per input — inspect that ON.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "f-b1",
      tier: "beginner",
      mode: "sql",
      title: "Orders with customer names",
      prompt: "Every delivered order with its customer's full name: order_id, customer (first and last concatenated with a space), order_date and total, ordered by order_id, first five rows only. Expected columns: order_id, customer, order_date, total.",
      dataset: "ecommerce",
      sampleTables: ["orders", "customers"],
      hint: "One INNER JOIN on the customer key; || builds the full name.",
      starter: "SELECT o.order_id,\n       -- customer, order_date, total\nFROM orders o\n",
      solution: `SELECT o.order_id,
       c.first_name || ' ' || c.last_name AS customer,
       o.order_date,
       o.total
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'delivered'
ORDER BY o.order_id
LIMIT 5;`,
      ordered: true,
      expected: { columns: ["order_id", "customer", "order_date", "total"], rows: [
        ["1", "Amelia Watson", "2024-03-01 10:15:00", "1407.00"],
        ["2", "Marcus Chen", "2024-03-04 16:40:00", "378.00"],
        ["3", "Priya Sharma", "2024-03-18 09:05:00", "249.00"],
        ["5", "Amelia Watson", "2024-04-20 14:25:00", "129.00"],
        ["6", "Hannah Kowalski", "2024-05-11 08:50:00", "948.00"],
      ] },
      explanation:
        "The reference walk: orders carry customer_id, the join follows it to the name. The WHERE scopes to delivered orders; the sort and limit keep the output readable. Every column qualified, every alias meaningful — the standard shape of the simplest useful join.",
      concepts: ["INNER JOIN", "concatenation", "qualification"],
    },
    {
      id: "f-b2",
      tier: "beginner",
      mode: "sql",
      title: "Products with category names",
      prompt: "Every product with its category's name: product name, category name and price, ordered by product_id, first eight rows. Expected columns: name, category, price. The join replaces the bare category_id with the readable label.",
      dataset: "ecommerce",
      sampleTables: ["products", "categories"],
      hint: "JOIN categories ON the category key.",
      starter: "SELECT p.name, -- category, price\nFROM products p\n",
      solution: `SELECT p.name, c.name AS category, p.price
FROM products p
JOIN categories c ON c.category_id = p.category_id
ORDER BY p.product_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["name", "category", "price"], rows: [
        ["AeroBook 14 Laptop", "Laptops", "1299.00"],
        ["AeroBook 16 Pro Laptop", "Laptops", "2199.00"],
        ["WorkMate 15 Business", "Laptops", "899.00"],
        ["StudioBook X Creator", "Laptops", "2499.00"],
        ["BudgetBook 11 Everyday", "Laptops", "399.00"],
        ["SoundCore ANC Headphones", "Audio", "249.00"],
        ["SoundCore Lite Earbuds", "Audio", "129.00"],
        ["BassStation Mini Speaker", "Audio", "89.00"],
      ] },
      explanation:
        "Same-table aliases resolve the name collision (both tables have a name column): p.name is the product, c.name its category. The join turns the foreign key into its human label — the most common join in reporting.",
      concepts: ["INNER JOIN", "name collisions", "aliases"],
    },
    {
      id: "f-b3",
      tier: "beginner",
      mode: "sql",
      title: "Employees and their departments",
      prompt: "The People Ops directory needs readable labels: current HeliosWorks employees (the two departed colleagues excluded) with their department names — employee full name (first and last concatenated with a space), department name and job title, ordered by employee_id, first six rows. Expected columns: employee, department, job_title.",
      dataset: "hr",
      sampleTables: ["employees", "departments"],
      hint: "JOIN departments; terminated IS NULL for current staff.",
      starter: "SELECT e.first_name || ' ' || e.last_name AS employee,\n       -- department, job_title\nFROM employees e\n",
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       d.name AS department,
       e.job_title
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 6;`,
      ordered: true,
      expected: { columns: ["employee", "department", "job_title"], rows: [
        ["Amara Osei", "Executive", "Chief Executive Officer"],
        ["Daniel Kramer", "Engineering", "VP of Engineering"],
        ["Sofia Mancini", "Sales", "VP of Sales"],
        ["Priya Nair", "Product", "VP of Product"],
        ["Gerald Weiss", "People Ops", "Head of People"],
        ["Lena Hoffman", "Engineering", "Engineering Manager"],
      ] },
      explanation:
        "The join decorates each employee with their department's name; the WHERE keeps current staff. Full names via ||, columns qualified — the readable-report habit in miniature.",
      concepts: ["INNER JOIN", "labels via joins", "current-staff filter"],
    },
    {
      id: "f-b4",
      tier: "beginner",
      mode: "sql",
      title: "The open admissions list",
      prompt: "Hospital patients currently admitted (discharged_at IS NULL) with their doctors: admission_id, patient full name, doctor full name and room, ordered by admission_id. Expected columns: admission_id, patient, doctor, room.",
      dataset: "hospital",
      sampleTables: ["admissions", "patients", "doctors"],
      hint: "admissions holds both foreign keys — two joins fan out from it.",
      starter: "SELECT a.admission_id,\n       -- patient, doctor, room\nFROM admissions a\n",
      solution: `SELECT a.admission_id,
       p.first_name || ' ' || p.last_name AS patient,
       d.first_name || ' ' || d.last_name AS doctor,
       a.room
FROM admissions a
JOIN patients p ON p.patient_id = a.patient_id
JOIN doctors d  ON d.doctor_id = a.doctor_id
WHERE a.discharged_at IS NULL
ORDER BY a.admission_id;`,
      ordered: true,
      expected: { columns: ["admission_id", "patient", "doctor", "room"], rows: [
        ["24", "Lucy Ramirez", "Daniel Park", "208"],
        ["27", "Simon Vasquez", "Gloria Hernandez", "111"],
        ["28", "Edith Barlow", "Robert Kowalczyk", "501"],
        ["29", "Iris Thornbury", "Isabelle Moreau", "206"],
      ] },
      explanation:
        "Two joins from one hub: admissions references patients and doctors, and the hub table fans out to both. The open-stay filter (IS NULL) is Part D's pattern doing clinical duty — four patients are on the wards right now.",
      concepts: ["multi-join hub", "IS NULL filter", "full names"],
    },
    {
      id: "f-i1",
      tier: "intermediate",
      mode: "sql",
      title: "Products never ordered",
      prompt: "Which products appear in NO order item — dead stock? Return product_id, name and price, ordered by product_id. Use the LEFT JOIN anti-join pattern (LEFT JOIN order_items ... WHERE the right key IS NULL). Expected columns: product_id, name, price — two rows.",
      dataset: "ecommerce",
      sampleTables: ["products", "order_items"],
      hint: "LEFT JOIN oi ON oi.product_id = p.product_id; WHERE oi.order_id IS NULL.",
      starter: "SELECT p.product_id, p.name, p.price\nFROM products p\n",
      solution: `SELECT p.product_id, p.name, p.price
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.order_id IS NULL
ORDER BY p.product_id;`,
      ordered: true,
      expected: { columns: ["product_id", "name", "price"], rows: [
        ["5", "BudgetBook 11 Everyday", "399.00"],
        ["19", "RacingWheel GT Set", "299.00"],
      ] },
      explanation:
        "The anti-join from f-03, now on stock: products whose order-item padding is NULL were never in any order. The BudgetBook and the RacingWheel surface — merchandising's conversation starters. (NOT EXISTS from Part G does the same job; today the outer-join spelling.)",
      concepts: ["anti-join", "LEFT JOIN", "dead stock"],
    },
    {
      id: "f-i2",
      tier: "intermediate",
      mode: "sql",
      title: "Revenue per customer, including never-buyers",
      prompt: "Every customer with their order count and total value — INCLUDING customers who never ordered (0 and 0, or count 0; for the total use COALESCE(sum(o.total), 0) so never-buyers show 0.00 instead of NULL). Return customer full name, orders (count of matches) and value (2 decimals), highest value first, top 6 rows. Expected columns: customer, orders, value.",
      dataset: "ecommerce",
      sampleTables: ["customers", "orders"],
      hint: "LEFT JOIN orders; count(o.order_id); COALESCE the sum for the zero-order customers.",
      starter: "SELECT c.first_name || ' ' || c.last_name AS customer,\n       -- orders, value\nFROM customers c\n",
      solution: `SELECT c.first_name || ' ' || c.last_name AS customer,
       count(o.order_id) AS orders,
       round(COALESCE(sum(o.total), 0), 2) AS value
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY value DESC, c.customer_id
LIMIT 6;`,
      ordered: true,
      expected: { columns: ["customer", "orders", "value"], rows: [
        ["Grace Kim", "3", "3396.00"],
        ["Victor Nguyen", "2", "2817.00"],
        ["Tom Fletcher", "3", "2535.00"],
        ["Owen Davis", "2", "2347.00"],
        ["Sofia Rossi", "3", "2297.00"],
        ["Marcus Chen", "4", "2125.00"],
      ] },
      explanation:
        "Three patterns cooperate: the LEFT JOIN keeps everyone, count(o.order_id) counts matches honestly, and COALESCE turns the empty sum into a real 0.00. Grace Kim leads at $3,396; the never-buyers trail with zeros — visible, not vanished.",
      concepts: ["census query", "COALESCE with aggregates", "LEFT JOIN"],
    },
    {
      id: "f-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Manager of everyone",
      prompt: "The full org chart for current staff: employee full name, job_title and manager full name (NULL for the CEO), ordered by employee_id. Expected columns: employee, job_title, manager — 28 rows... which exceeds the 15-row readability cap, so LIMIT 10. Expected columns: employee, job_title, manager — first 10 current employees by employee_id.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Self join with LEFT (the CEO's NULL manager must survive), terminated IS NULL on the employee side only.",
      starter: "SELECT e.first_name || ' ' || e.last_name AS employee,\n       -- job_title, manager\nFROM employees e\n",
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       m.first_name || ' ' || m.last_name AS manager
FROM employees e
LEFT JOIN employees m ON m.employee_id = e.manager_id
WHERE e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 10;`,
      ordered: true,
      expected: { columns: ["employee", "job_title", "manager"], rows: [
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
      ] },
      explanation:
        "One table, two roles: e reads employees as staff, m as their managers; the LEFT JOIN keeps Amara, whose NULL manager is the org chart's crown. The terminated filter applies to e only — a departed manager still names whom they managed.",
      concepts: ["self join", "LEFT JOIN preserves the root", "org charts"],
    },
    {
      id: "f-i4",
      tier: "intermediate",
      mode: "sql",
      title: "The complete order detail",
      prompt: "Order 29 in full: customer full name, order status, each product name with quantity and unit price — columns customer, status, product, quantity, unit_price, ordered by product_id. The four-table chain scoped to one order. Expected columns: customer, status, product, quantity, unit_price.",
      dataset: "ecommerce",
      sampleTables: ["orders", "order_items", "products", "customers"],
      hint: "customers -> orders -> order_items -> products, then WHERE o.order_id = 29.",
      starter: "SELECT c.first_name || ' ' || c.last_name AS customer,\n       -- status, product, quantity, unit_price\nFROM orders o\n",
      solution: `SELECT c.first_name || ' ' || c.last_name AS customer,
       o.status,
       p.name AS product,
       oi.quantity,
       oi.unit_price
FROM orders o
JOIN customers c    ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p     ON p.product_id = oi.product_id
WHERE o.order_id = 29
ORDER BY p.product_id;`,
      ordered: true,
      expected: { columns: ["customer", "status", "product", "quantity", "unit_price"], rows: [
        ["Owen Davis", "delivered", "Zenith X20 Mirrorless", "1", "1499.00"],
        ["Owen Davis", "delivered", "Optiq 50mm Prime Lens", "1", "299.00"],
      ] },
      explanation:
        "Owen Davis's order: a delivered Zenith X20 camera and its 50mm lens. Four tables, four ONs, one WHERE — and the output reads like an invoice. This is the query behind every order-detail page you have ever used.",
      concepts: ["four-table chain", "order detail", "qualification"],
    },
    {
      id: "f-a1",
      tier: "advanced",
      mode: "sql",
      title: "Category revenue leaderboard",
      prompt: "Total revenue per product category (delivered orders only): category name, revenue (sum of quantity times unit_price over the order items, 2 decimals) — a LEFT JOIN from categories through products to items so categories with no sales still appear, but keep it simpler: JOIN categories -> products -> order_items -> orders (status delivered), GROUP BY the category, top revenue first, top 6. Expected columns: category, revenue.",
      dataset: "ecommerce",
      sampleTables: ["categories", "products", "order_items", "orders"],
      hint: "The chain: c -> p -> oi -> o (for the status filter). sum(oi.quantity * oi.unit_price) is the line-item value.",
      starter: "SELECT c.name AS category,\n       -- revenue\nFROM categories c\n",
      solution: `SELECT c.name AS category,
       round(sum(oi.quantity * oi.unit_price), 2) AS revenue
FROM categories c
JOIN products p     ON p.category_id = c.category_id
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o       ON o.order_id = oi.order_id
WHERE o.status = 'delivered'
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 6;`,
      ordered: true,
      expected: { columns: ["category", "revenue"], rows: [
        ["Laptops", "7495.00"],
        ["Photography", "6673.00"],
        ["Audio", "1908.00"],
        ["Tablets", "1676.00"],
        ["Gaming", "1305.00"],
        ["Wearables", "856.00"],
      ] },
      explanation:
        "Four tables deep, the revenue is computed from the line items (quantity x price), not the order totals — the honest way, since each item belongs to exactly one category. Photography leads on Zenith camera sales; the join chain did the attributing.",
      concepts: ["multi-table chains", "line-item revenue", "aggregate after join"],
    },
    {
      id: "f-a2",
      tier: "advanced",
      mode: "sql",
      title: "Doctors and their patient counts, zero included",
      prompt: "The clinical census: every doctor with their department name and the number of admissions they have overseen — doctors with zero admissions included (Dr. Al-Rashid, the recent hire). Columns doctor, department, admissions; order by admissions ascending then doctor, and LIMIT 5 so the zero-and-low doctors lead the output. Expected columns: doctor, department, admissions.",
      dataset: "hospital",
      sampleTables: ["doctors", "admissions", "departments"],
      hint: "LEFT JOIN admissions; count(a.admission_id) for honest zeros.",
      starter: "SELECT d.first_name || ' ' || d.last_name AS doctor,\n       -- department, admissions\nFROM doctors d\n",
      solution: `SELECT d.first_name || ' ' || d.last_name AS doctor,
       dep.name AS department,
       count(a.admission_id) AS admissions
FROM doctors d
JOIN departments dep ON dep.dept_id = d.dept_id
LEFT JOIN admissions a ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name, dep.name
ORDER BY admissions ASC, doctor
LIMIT 5;`,
      ordered: true,
      expected: { columns: ["doctor", "department", "admissions"], rows: [
        ["Fatima Al-Rashid", "General Surgery", "0"],
        ["Clara Nyberg", "Neurology", "2"],
        ["Gloria Hernandez", "Orthopedics", "2"],
        ["Isabelle Moreau", "Pediatrics", "2"],
        ["Mei-Lin Chen", "Emergency", "2"],
      ] },
      explanation:
        "The census shape from f-05's Q2, now yours to write: an inner join for the label (every doctor has a department), a LEFT join for the activity (not every doctor has admissions), and count-the-key for zeros. Fatima Al-Rashid's 0 leads the list — hired a month before the data cut, as the explanation goes.",
      concepts: ["census", "mixed join kinds", "count the key"],
    },
    {
      id: "f-a3",
      tier: "advanced",
      mode: "sql",
      title: "Students who took no CS course",
      prompt: "CS majors (major_dept_id = 1) who have NO enrollment in any CS-department course (courses.dept_id = 1) — the paradox club. Use the anti-join shape: LEFT JOIN enrollments-and-courses (join enrollments to courses first as a derived pairing via a LEFT JOIN chain, or simpler: NOT EXISTS-style is Part G — use LEFT JOIN (SELECT DISTINCT e.student_id FROM enrollments e JOIN courses c ON c.course_id = e.course_id WHERE c.dept_id = 1) cs ON cs.student_id = s.student_id WHERE cs.student_id IS NULL). Return student_id, first_name, last_name ordered by student_id. Expected columns: student_id, first_name, last_name — possibly zero rows, which is itself the finding.",
      dataset: "university",
      sampleTables: ["students", "enrollments", "courses"],
      hint: "The derived table (SELECT DISTINCT student ids with a CS enrollment) is joined LEFT; NULL padding = no CS course ever.",
      starter: "SELECT s.student_id, s.first_name, s.last_name\nFROM students s\n",
      solution: `SELECT s.student_id, s.first_name, s.last_name
FROM students s
LEFT JOIN (
    SELECT DISTINCT e.student_id
    FROM enrollments e
    JOIN courses c ON c.course_id = e.course_id
    WHERE c.dept_id = 1
) cs ON cs.student_id = s.student_id
WHERE s.major_dept_id = 1
  AND cs.student_id IS NULL
ORDER BY s.student_id;`,
      ordered: true,
      expected: { columns: ["student_id", "first_name", "last_name"], rows: [] },
      explanation:
        "The derived table (a subquery in the FROM position — Part G's next subject, used here as a tool) precomputes 'students with any CS enrollment'; the LEFT join anti-pattern then finds CS majors absent from that set. The result is empty — every CS major has taken at least CS 101 — and an empty answer from a verified query is a finding, not a failure.",
      concepts: ["anti-join", "derived tables", "empty results as findings"],
    },
    {
      id: "f-a4",
      tier: "advanced",
      mode: "sql",
      title: "The transaction trail with names",
      prompt: "For account 1 only: every transaction with its account type and holder name — txn_id, occurred_at, txn_type, amount, account_type and holder (the customer's full name), ordered by occurred_at then txn_id, first 8 rows. The chain: transactions -> accounts -> customers. Expected columns: txn_id, occurred_at, txn_type, amount, account_type, holder.",
      dataset: "banking",
      sampleTables: ["transactions", "accounts", "customers"],
      hint: "Two joins after the WHERE scoping — or scope in the ON; ordering by occurred_at then txn_id is fully deterministic.",
      starter: "SELECT t.txn_id, t.occurred_at, t.txn_type, t.amount,\n       -- account_type, holder\nFROM transactions t\n",
      solution: `SELECT t.txn_id, t.occurred_at, t.txn_type, t.amount,
       a.account_type,
       c.first_name || ' ' || c.last_name AS holder
FROM transactions t
JOIN accounts a  ON a.account_id = t.account_id
JOIN customers c ON c.customer_id = a.customer_id
WHERE t.account_id = 1
ORDER BY t.occurred_at, t.txn_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["txn_id", "occurred_at", "txn_type", "amount", "account_type", "holder"], rows: [
        ["1", "2026-01-05 09:15:00", "deposit", "2500.00", "checking", "Raymond Castillo"],
        ["2", "2026-01-08 14:30:00", "withdrawal", "820.00", "checking", "Raymond Castillo"],
        ["3", "2026-01-20 09:16:00", "deposit", "2500.00", "checking", "Raymond Castillo"],
        ["4", "2026-01-31 23:59:00", "fee", "5.00", "checking", "Raymond Castillo"],
        ["5", "2026-02-04 18:20:00", "withdrawal", "640.50", "checking", "Raymond Castillo"],
        ["6", "2026-02-20 09:14:00", "deposit", "2500.00", "checking", "Raymond Castillo"],
        ["7", "2026-03-02 10:40:00", "withdrawal", "985.00", "checking", "Raymond Castillo"],
        ["8", "2026-03-15 11:00:00", "transfer_out", "1500.00", "checking", "Raymond Castillo"],
      ] },
      explanation:
        "Raymond Castillo's ledger opens with his payroll deposit and its running balance story. The chain (transactions -> accounts -> customers) walks two references; the timestamp-plus-id sort makes the trail deterministic — the same double-key habit from Part C, applied to a ledger.",
      concepts: ["ledger trails", "two-hop joins", "deterministic ordering"],
    },
  ],

  assessment: [
    {
      id: "f-as-1",
      prompt: "What does INNER JOIN do with rows that have no match on the other side?",
      options: [
        { text: "Keeps them with NULLs", correct: false, feedback: "That is the outer join's behavior." },
        { text: "Drops them from the result", correct: true, feedback: "Correct — inner keeps pairs only." },
        { text: "Raises an error", correct: false, feedback: "Unmatched rows are normal, not errors — they just vanish." },
      ],
      explanation: "INNER JOIN is the strict matchmaker: no pair, no row.",
    },
    {
      id: "f-as-2",
      prompt: "LEFT JOIN customers to orders: which customers appear?",
      options: [
        { text: "All customers — matched ones joined, unmatched NULL-padded", correct: true, feedback: "Correct — the left side is preserved entire." },
        { text: "Only customers with orders", correct: false, feedback: "That is INNER JOIN." },
        { text: "Only customers without orders", correct: false, feedback: "That requires the IS NULL filter on top of the LEFT JOIN." },
      ],
      explanation: "LEFT JOIN keeps every left row; the padding marks the unmatched.",
    },
    {
      id: "f-as-3",
      prompt: "The anti-join pattern 'customers who never ordered' is...",
      options: [
        { text: "LEFT JOIN orders + WHERE o.order_id IS NULL", correct: true, feedback: "Correct — the NULL padding IS the detector." },
        { text: "INNER JOIN + WHERE total = 0", correct: false, feedback: "Never-buyers have no order rows at all — no total to filter." },
        { text: "CROSS JOIN + DISTINCT", correct: false, feedback: "A cross join pairs everything — the opposite of detection." },
      ],
      explanation: "Outer join, then filter on the right side's NULL: the never-matched surface.",
    },
    {
      id: "f-as-4",
      prompt: "After LEFT JOIN orders, counting customers' orders should use...",
      options: [
        { text: "count(*)", correct: false, feedback: "Padded rows count 1 — never-buyers would show one phantom order." },
        { text: "count(o.order_id)", correct: true, feedback: "Correct — NULLs skip, zeros surface." },
        { text: "count(DISTINCT o.order_id)", correct: false, feedback: "Also honest per customer, but unnecessary here — and both sides of the debate should know why." },
      ],
      explanation: "Count the right side's key: matches counted, padding skipped.",
    },
    {
      id: "f-as-5",
      prompt: "A self join exists to...",
      options: [
        { text: "Relate rows WITHIN one table (managers, duplicates, pairs)", correct: true, feedback: "Correct — the table meets itself under two aliases." },
        { text: "Join a table twice for performance", correct: false, feedback: "It is about expressing within-table relationships, not speed." },
        { text: "Duplicate a table's rows", correct: false, feedback: "CROSS JOIN does that; self joins match." },
      ],
      explanation: "Self joins answer within-table questions: who manages whom, who shares what, which rows resemble each other.",
    },
    {
      id: "f-as-6",
      prompt: "Which join pairs every row of one table with every row of another?",
      options: [
        { text: "FULL OUTER JOIN", correct: false, feedback: "Full keeps unmatched rows on both sides — it does not multiply." },
        { text: "CROSS JOIN", correct: true, feedback: "Correct — the deliberate every-combination join, no ON." },
        { text: "LEFT JOIN", correct: false, feedback: "Left preserves one side; it does not pair everything." },
      ],
      explanation: "CROSS JOIN is the cartesian product — powerful for variant matrices, catastrophic when accidental.",
    },
    {
      id: "f-as-7",
      prompt: "Why does the org-chart self join use LEFT rather than INNER?",
      options: [
        { text: "The CEO's NULL manager matches nothing — INNER would delete the org chart's root", correct: true, feedback: "Correct — outer joins protect the bossless boss." },
        { text: "INNER joins cannot use the same table twice", correct: false, feedback: "They can — they just drop the root." },
        { text: "LEFT sorts the output", correct: false, feedback: "Sorting is ORDER BY's job, always." },
      ],
      explanation: "Roots (NULL parents) survive only in outer joins — the org chart keeps its head.",
    },
    {
      id: "f-as-8",
      prompt: "A three-table join's row count suddenly multiplies. The most likely cause?",
      options: [
        { text: "An ON matching several rows per input — a one-to-many link doubling rows", correct: true, feedback: "Correct — joins multiply by their matches; counts narrate the story." },
        { text: "PostgreSQL added rows", correct: false, feedback: "Engines multiply predictably by the ONs you wrote." },
        { text: "The aliases collided", correct: false, feedback: "Collisions error out; they never invent rows." },
      ],
      explanation: "Read row counts as join health reports: a jump names the ON that matches too much.",
    },
  ],

  project: {
    title: "The Connected Report",
    brief:
      "Pick any two tables in any sample database that share a foreign-key relationship, and write THE report a manager would want from that pair — then extend it: a third table, an outer join keeping the zero-rows, a count and a sum beside names, an anti-join finding the never-referenced. Your deliverable is one runnable script of six queries over your chosen chain, each preceded by its business question, every output verified in the Lab. The discipline: choose join kinds per question, count at every step, and let names (not bare ids) reach the reader.",
    requirements: [
      "A chain of at least three related tables from one sample database",
      "At least one INNER JOIN report with concatenated full names as labels",
      "One census report: an outer join keeping zero-count members with honest 0s",
      "One anti-join: rows of one table never referenced by another",
      "One joined aggregate: totals or averages per group after a join chain",
      "Every query verified by reading its output, with row counts checked against expectations at each step",
    ],
    steps: [
      "Choose your database and trace the reference chain in the schema explorer (the link icons are the bridges you will join).",
      "Write the five business questions first, as comments — no SQL until the questions exist.",
      "Build each query one join at a time, counting rows after every JOIN.",
      "Choose inner versus outer deliberately per question — say why in a comment.",
      "Aggregate where the question asks for totals, and label everything with names.",
      "Finish with the anti-join and read its result carefully: what does each unmatched row mean in business language?",
    ],
    starter: `-- The Connected Report (Part F mini project)
-- Database and chain: ??? -> ??? -> ???

-- Q1 (inner join, full-name labels): ???
-- Q2 (census: outer join, zeros kept): ???
-- Q3 (anti-join: never-referenced rows): ???
-- Q4 (joined aggregate: totals per group): ???
-- Q5 (your hardest question, any shape): ???
-- Q6 (one more of your choosing): ???`,
    concepts: ["join chains", "outer joins", "anti-joins", "joined aggregates", "verification"],
    extension:
      "Rewrite your anti-join using NOT EXISTS (peek at Part G's lesson if you dare), and confirm both shapes return identical rows. Two tools, one question — professionals collect these equivalences deliberately.",
  },
};
