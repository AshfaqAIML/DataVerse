/**
 * Part I — Window Functions, Views & Indexes.
 *
 * ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD and running totals over partitions; views as saved queries; and how B-tree indexes change query plans, seen live with EXPLAIN.
 * Every verified output comes from the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_I: Part = {
  letter: "I",
  title: "Window Functions, Views & Indexes",
  tagline: "Rankings, running totals and analytics — plus views and indexes for speed.",
  description:
    "ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD and running totals over partitions; views as saved queries; and how B-tree indexes change query plans, seen live with EXPLAIN.",
  lessons: [

  {
    slug: "i-01",
    title: "Window functions I — ranking rows",
    minutes: 14,
    summary:
      "What a window function is — an aggregate that keeps every row — plus the salary ladder with row_number(), rank vs dense_rank when ratings tie, the company average beside each salary instead of GROUP BY's one-row collapse, and the WHERE trap with its subquery fix.",
    kind: "coding",
    dataset: "hr",
    objectives: [
      "Say what a window function is: an aggregate with a view of its neighbors that leaves every row in place",
      "Build row ladders with row_number() OVER (ORDER BY ...) — who is first, second, third",
      "Choose between rank() and dense_rank() when values tie — and predict both answers",
      "Put a group-level number (avg, sum) beside every row instead of collapsing rows with GROUP BY",
      "Filter on a rank the legal way: compute it in a subquery, filter from outside",
    ],
    why:
      "HeliosWorks' leadership does not ask 'what is the average salary?' — they ask who sits where: which three employees top the pay ladder, who shares a rating tier with whom, who earns above the company average. Plain aggregates answer the first kind of question by destroying the second: AVG hands you one number and folds 28 people into it, and GROUP BY cannot hand the number back to the rows it just deleted. Window functions are the fix — an aggregate that keeps every row and lets each one know where it stands among its neighbors. They are the backbone of rankings, leaderboards, top-N lists and every 'this row beside its group's average' report you will ever be asked to build.",
    blocks: [
      {
        kind: "text",
        text: "Every aggregate you have met so far has amnesia. Hand `avg(salary)` 28 employees and it hands back one number — having forgotten every single person who produced it. That is its job. But half the questions the People team at HeliosWorks asks need the opposite: *each employee, plus a number computed from the employees around them*. Where does Amara rank on the salary ladder? Is 232000 close to the top? Who earns above the company average? Those are questions about **rows in relation to their neighbors**, and SQL's answer is the **window function**: an aggregate that keeps every row and lets each one look around.",
      },
      {
        kind: "visual",
        title: "A spotlight that slides row by row",
        ascii: `   an aggregate with a spotlight over its neighbors

      A   385000
      B   245000     the spotlight sits on C:
      C   232000 <== C's answer is computed from
      D   228000     A, B, C - the rows in the light

   slide the spotlight down one row:

      A   385000
      B   245000     now it sits on D:
      C   232000     D's answer is computed from
      D   228000 <== A, B, C, D - the light grew`,
        caption:
          "With `OVER ()` the light covers every row in the result at once — the default window. Walls that split the beam per department come in the next lesson; a trailing edge that makes totals *run* comes in the one after.",
      },
      {
        kind: "sql",
        title: "The salary ladder: row_number()",
        code: `SELECT employee_id,
       first_name || ' ' || last_name AS employee,
       salary,
       row_number() OVER (ORDER BY salary DESC) AS rn
FROM employees
WHERE terminated IS NULL
ORDER BY rn
LIMIT 6;`,
        result: { columns: ["employee_id", "employee", "salary", "rn"], rows: [
        ["1", "Amara Osei", "385000.00", "1"],
        ["2", "Daniel Kramer", "245000.00", "2"],
        ["3", "Sofia Mancini", "232000.00", "3"],
        ["4", "Priya Nair", "228000.00", "4"],
        ["6", "Lena Hoffman", "198000.00", "5"],
        ["7", "Marcus Tran", "192000.00", "6"],
      ] },
        explain: [
          "row_number() numbers the surviving rows 1, 2, 3, ... in the order the OVER clause dictates — here salary DESC, so the CEO, Amara Osei, is row 1 at 385000.00 and her VP of Engineering, Daniel Kramer, row 2.",
          "The parentheses after OVER hold the window's instructions. This window has only an ORDER BY: all 28 current employees (WHERE already removed Peter Novak and Lucia Moreno, the two who left), walked highest salary first.",
          "Nothing collapsed. Every row kept its columns and gained one more, rn — the ladder position. That is the whole personality difference from GROUP BY.",
          "The final ORDER BY rn sorts the report so you read it ladder-first. The window function itself never sorts the output — hold that thought for the next lesson.",
        ],
      },
      { kind: "heading", text: "When rows tie: rank() vs dense_rank()" },
      {
        kind: "sql",
        title: "Tied ratings: row_number, rank, dense_rank",
        code: `SELECT employee_id, rating,
       row_number() OVER (ORDER BY rating DESC) AS rn,
       rank()       OVER (ORDER BY rating DESC) AS rnk,
       dense_rank() OVER (ORDER BY rating DESC) AS drnk
FROM performance_reviews
WHERE review_cycle = '2025-H2'
ORDER BY rn
LIMIT 15;`,
        result: { columns: ["employee_id", "rating", "rn", "rnk", "drnk"], rows: [
        ["12", "5.0", "1", "1", "1"],
        ["6", "4.5", "2", "2", "2"],
        ["18", "4.5", "3", "2", "2"],
        ["21", "4.5", "4", "2", "2"],
        ["8", "4.5", "5", "2", "2"],
        ["15", "4.0", "6", "6", "3"],
        ["19", "4.0", "7", "6", "3"],
        ["22", "4.0", "8", "6", "3"],
        ["7", "4.0", "9", "6", "3"],
        ["9", "4.0", "10", "6", "3"],
        ["10", "4.0", "11", "6", "3"],
        ["13", "4.0", "12", "6", "3"],
        ["14", "4.0", "13", "6", "3"],
        ["26", "4.0", "14", "6", "3"],
        ["16", "3.5", "15", "15", "4"],
      ] },
        explain: [
          "Seventeen reviews came in for the 2025-H2 cycle; the top fifteen tell the whole story. Employee 12 (Grace Park) is alone at 5.0, so all three functions agree: position 1.",
          "Four people share 4.5 — employees 6, 18, 21 and 8. row_number() is a referee forced to pick: it hands out 2, 3, 4, 5 in an order the data does not justify. rank() and dense_rank() both call all four of them 2 — tied for second.",
          "The split comes at the first 4.0, employee 15: rank() says 6 — five people rated strictly higher (one 5.0 plus four 4.5s), so sixth place — while dense_rank() says 3: 5.0, 4.5, 4.0 is only the third distinct value. rank() counts people; dense_rank() counts values.",
          "Row 15 repeats the split at the 3.5s: employee 16 is rank 15 (fourteen people ahead) but dense_rank 4 (fourth tier).",
          "Reach for row_number() when you need 'the first N rows', rank() when you report placings ('tied 2nd; the cut was 6th'), dense_rank() when you report tiers.",
        ],
      },
      { kind: "heading", text: "Rows survive: the GROUP BY difference" },
      {
        kind: "sql",
        title: "The average beside every salary",
        code: `SELECT first_name || ' ' || e.last_name AS employee,
       e.salary,
       round(avg(e.salary) OVER (), 2) AS company_avg
FROM employees e
WHERE e.terminated IS NULL
ORDER BY e.salary DESC
LIMIT 5;`,
        result: { columns: ["employee", "salary", "company_avg"], rows: [
        ["Amara Osei", "385000.00", "158928.57"],
        ["Daniel Kramer", "245000.00", "158928.57"],
        ["Sofia Mancini", "232000.00", "158928.57"],
        ["Priya Nair", "228000.00", "158928.57"],
        ["Lena Hoffman", "198000.00", "158928.57"],
      ] },
        explain: [
          "avg() — an aggregate straight out of Part E — with one addition: OVER (). The moment an aggregate grows an OVER, it stops collapsing and starts annotating.",
          "The company average, 158928.57, is computed once and stamped beside every one of the 28 current salaries (the top five are printed).",
          "Every row is intact: name, salary, and the yardstick right next to it. 'Who is above the average?' is now a column you can read off — Amara, Daniel, Sofia, Priya and Lena all clear it in this excerpt.",
        ],
      },
      {
        kind: "sql",
        title: "The same average, GROUP BY's way",
        code: `SELECT round(avg(salary), 2) AS company_avg
FROM employees
WHERE terminated IS NULL;`,
        result: { columns: ["company_avg"], rows: [
        ["158928.57"],
      ] },
        explain: [
          "The same 158928.57, computed the way you already knew: a plain aggregate, one row out.",
          "28 employees went in; one number came out. Nothing wrong with that when the question is only 'what is the average?' — Part E territory.",
          "But the moment the question becomes 'who is above it?', this shape has nothing left to answer with: the employees were folded away before you could compare. That is the job the window version does.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Hear the question, pick the tool",
        text: "'What is the average salary at HeliosWorks?' — a plain aggregate or `GROUP BY`: one number, and nobody needs the rows. 'Who earns above the average?' — `avg(salary) OVER ()`: the same number riding beside every employee. The tell is always whether the answer still has to *show you rows* — if it does, the aggregate needs an `OVER`.",
      },
      { kind: "heading", text: "Filtering on a rank: the classic trap" },
      {
        kind: "sql",
        title: "The top three, the tempting way — refused",
        code: `SELECT first_name || ' ' || last_name AS employee,
       salary
FROM employees
WHERE row_number() OVER (ORDER BY salary DESC) <= 3;`,
        expectError: "window functions are not allowed in WHERE",
        explain: [
          "PostgreSQL refuses before running anything: `window functions are not allowed in WHERE`.",
          "The refusal is about order of operations. WHERE decides which rows exist; window functions are then computed over exactly those surviving rows. Filtering by 'rank 3 or better' needs the rank before the rows are chosen — a circle the engine will not quietly paper over. HAVING and GROUP BY enforce the same rule.",
          "The error is a favor: it stops a query that would have numbered all 28 employees, thrown 25 away, and re-numbered the survivors.",
        ],
      },
      {
        kind: "sql",
        title: "The fix: rank in a subquery, filter outside",
        code: `SELECT employee
FROM (SELECT first_name || ' ' || last_name AS employee,
             row_number() OVER (ORDER BY salary DESC) AS rn
      FROM employees
      WHERE terminated IS NULL) ranked
WHERE rn <= 3
ORDER BY rn;`,
        result: { columns: ["employee"], rows: [
        ["Amara Osei"],
        ["Daniel Kramer"],
        ["Sofia Mancini"],
      ] },
        explain: [
          "Two steps, in the only order that works. The inner query — the subquery-in-FROM move from Part G — numbers all 28 current employees.",
          "The outer query treats those numbered rows as a table called ranked and applies WHERE rn <= 3, perfectly legal because the window already happened.",
          "The answer: Amara Osei, Daniel Kramer and Sofia Mancini — chosen by rank, not by eyeballing a sorted list. Every 'top N' query you will ever write is this pattern.",
        ],
      },
      {
        kind: "lab",
        title: "The service-anniversary list",
        task:
          "People Ops is preparing service awards and needs the five longest-serving current HeliosWorks employees (terminated IS NULL): employee, hire_date and seniority — row_number() over hire dates, earliest first. Order by seniority and show five rows. Expected columns: employee, hire_date, seniority.",
        code: `SELECT first_name || ' ' || last_name AS employee,
       hire_date,
       row_number() OVER (ORDER BY hire_date) AS seniority
FROM employees
WHERE terminated IS NULL
ORDER BY seniority
LIMIT 5;`,
        hint:
          "Flip the ladder: change the OVER's ORDER BY to hire_date DESC and you have the five NEWEST employees instead. Then think about what rank() would print differently if two people ever shared a hire date.",
      },
    ],
    terms: [
      { term: "Window function", definition: "A function evaluated once per row over a window of related rows defined by OVER — every input row survives, each carrying its own answer." },
      { term: "OVER clause", definition: "Defines the window: optional PARTITION BY, ORDER BY and frame. OVER () means 'all rows of the result, in no particular order'." },
      { term: "Ranking functions", definition: "row_number() (strict positions, ties broken arbitrarily), rank() (ties share a position, the next one skips) and dense_rank() (ties share, the next one continues)." },
      { term: "Windowed aggregate", definition: "sum, avg, count, min or max with an OVER clause — computed across the window and stamped beside every row instead of collapsing them into one." },
    ],
    mistakes: [
      {
        mistake: "Filtering on a window function in WHERE: WHERE row_number() OVER (...) <= 3",
        why: "WHERE runs before window functions are computed — the filter would need a rank that does not exist yet, and PostgreSQL rejects it with 'window functions are not allowed in WHERE'.",
        fix: "Compute the rank in a subquery (or CTE), then filter on it from the outside: SELECT ... FROM (SELECT ..., row_number() OVER (...) AS rn FROM ...) ranked WHERE rn <= 3.",
      },
      {
        mistake: "Expecting row_number() to break ties in a stable, meaningful order",
        why: "When the OVER's ORDER BY has equal values, the tied rows all satisfy the order — which of them gets 2 and which gets 3 is arbitrary, and can change if the plan changes.",
        fix: "Add a tiebreaker to the window's ORDER BY (... ORDER BY salary DESC, employee_id), or use rank()/dense_rank() when tied rows should share a position.",
      },
      {
        mistake: "Using GROUP BY to attach the company average to each employee's row",
        why: "GROUP BY collapses the result to one row per group — the moment you add the average, the employees you wanted to keep are folded away.",
        fix: "Keep the aggregate but add OVER (): avg(salary) OVER () rides beside every row, and nothing collapses.",
      },
    ],
    takeaways: [
      "A window function adds a column to every row — it never removes, sorts or collapses rows.",
      "OVER () means the window is the whole result; the ORDER BY inside it is the ladder's order.",
      "row_number() breaks ties arbitrarily, rank() shares and skips, dense_rank() shares and continues.",
      "GROUP BY answers 'what is the average?'; a window answers 'who is above it?'.",
      "Window functions are not allowed in WHERE — number the rows in a subquery, filter outside it.",
    ],
    quiz: [
      {
        id: "i-01-q1",
        prompt: "Four employees tie for 2nd place with a 4.5 rating, and the next rating group is 4.0. What do rank() and dense_rank() give the first 4.0 employee?",
        options: [
          { text: "rank 6, dense_rank 3", correct: true, feedback: "Correct — rank counts people (one 5.0 plus four 4.5s are ahead, so 6th place); dense_rank counts values (5.0, 4.5, 4.0 is the third one)." },
          { text: "rank 3, dense_rank 3", correct: false, feedback: "dense_rank is 3, but rank counts everyone ahead: one 5.0 plus four 4.5s makes this 6th place." },
          { text: "rank 3, dense_rank 6", correct: false, feedback: "The two are swapped — rank() skips ahead to 6, dense_rank() stays compact at 3." },
          { text: "rank 6, dense_rank 6", correct: false, feedback: "rank is 6, but dense_rank never skips: 5.0, 4.5 and 4.0 are only the third distinct value." },
        ],
        explanation: "When k people tie at rank r, the next distinct group gets rank r + k, while dense_rank moves on by only one: rank counts people, dense_rank counts values.",
      },
      {
        id: "i-01-q2",
        prompt: "The report needs every employee's salary AND the company average on the same row. Which one query does it?",
        options: [
          { text: "SELECT salary, avg(salary) OVER () FROM employees", correct: true, feedback: "Correct — OVER () turns the average into a per-row column while every salary stays." },
          { text: "SELECT salary, avg(salary) FROM employees GROUP BY salary", correct: false, feedback: "Legal, but it folds same-salaried employees into one row each and leaves no employee identity to report." },
          { text: "SELECT salary FROM employees WHERE salary > avg(salary)", correct: false, feedback: "Aggregates are not allowed in WHERE either — and this hides the below-average rows the report may still need." },
          { text: "SELECT salary, avg(salary) OVER (salary) FROM employees", correct: false, feedback: "OVER's contents must start with PARTITION BY, ORDER BY or a frame — a bare column is a syntax error." },
        ],
        explanation: "An aggregate with OVER () is computed across the whole result and attached to every row — the average rides beside each salary, and no row is lost.",
      },
    ],
  },
  {
    slug: "i-02",
    title: "Window functions II — partitions",
    minutes: 14,
    summary:
      "PARTITION BY gives every department its own private ladder and its own totals, the window's ORDER BY turns out to be a different knob from the report's ORDER BY, sum() over a partition rides beside every row, and the GROUP BY-vs-window choice becomes easy to make.",
    kind: "coding",
    dataset: "hr",
    objectives: [
      "Reset rankings per group with PARTITION BY — a private ladder per department",
      "Keep the window's ORDER BY and the output's ORDER BY straight — and use both in one query",
      "Compute group totals with sum() and avg() OVER (PARTITION BY ...) beside every row",
      "Choose deliberately between GROUP BY (collapse to one row per group) and a window (keep every row)",
    ],
    why:
      "When someone asks 'who is the best-paid engineer?', a whole-company salary ladder is the wrong instrument: it says Daniel Kramer is second of 28 and nothing about where he stands among the twelve people in Engineering. Real reports are full of per-group questions — rank within department, each salary against its own department's payroll, every product against its category's average. PARTITION BY answers them by drawing a wall around each group inside the window: every group gets its own private ladder and its own totals, while every single employee row stays in the report. It is the difference between one company-wide org chart and eight department org charts — written in a single clause.",
    blocks: [
      {
        kind: "text",
        text: "One company-wide ladder is almost never the report anyone wants. Nobody at HeliosWorks asks 'where do you rank among all 28 of us?' — the CEO will always be 1 and the newest hire will always be 28. The questions are **per group**: who is the best-paid engineer, whose salary is unusual *for their department*, what does each person make relative to their own team. `PARTITION BY` draws a wall around each group inside the window, and every group gets its own private ladder — while every single row stays in the report.",
      },
      {
        kind: "sql",
        title: "A private ladder per department",
        code: `SELECT d.name AS department,
       e.first_name || ' ' || e.last_name AS employee,
       e.salary,
       rank() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS dept_rank
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
ORDER BY d.name, dept_rank
LIMIT 12;`,
        result: { columns: ["department", "employee", "salary", "dept_rank"], rows: [
        ["Customer Success", "Beatrice Laurent", "124000.00", "1"],
        ["Customer Success", "Sam Whitfield", "76000.00", "2"],
        ["Data", "Tara Singh", "141000.00", "1"],
        ["Engineering", "Daniel Kramer", "245000.00", "1"],
        ["Engineering", "Lena Hoffman", "198000.00", "2"],
        ["Engineering", "Marcus Tran", "192000.00", "3"],
        ["Engineering", "Elena Petrova", "168000.00", "4"],
        ["Engineering", "James Okoro", "162000.00", "5"],
        ["Engineering", "Grace Park", "158000.00", "6"],
        ["Engineering", "Ingrid Sorensen", "149000.00", "7"],
        ["Engineering", "Aisha Rahman", "134000.00", "8"],
        ["Engineering", "Tom Lindqvist", "128000.00", "9"],
      ] },
        explain: [
          "The window grew one word: PARTITION BY e.dept_id. The 28 current employees are sliced into 8 departments, and rank() runs fresh inside each slice.",
          "Customer Success prints first (alphabetically): Beatrice Laurent rank 1 at 124000.00, Sam Whitfield rank 2 — then the wall. Tara Singh restarts at rank 1 in Data, and Daniel Kramer restarts at rank 1 in Engineering.",
          "Engineering's ladder counts down 1 through 9 before the LIMIT clips the report (twelve engineers in all).",
          "Not a single row was lost — partitioning organizes rows into windows; it never filters them.",
          "No two current colleagues share a salary within a department in this data, so rank() and row_number() would agree here. rank() is still the better habit: the day two salaries tie, it shares the position instead of inventing an arbitrary one.",
        ],
      },
      {
        kind: "visual",
        title: "One ladder vs a wall of ladders",
        ascii: `   OVER () - one ladder for the whole company:

     1    2    3    4    5    6    7   ...

   PARTITION BY dept - a wall between departments:

     Engineering   |  1    2    3    4    5   ...
     Sales         |  1    2    3    4
     Data          |  1

   same rank() call, but every department gets
   its own ladder and the count restarts at 1`,
        caption:
          "The window is still there — it just got walls. Everything from i-01 (rank, ties, row_number, aggregates with OVER) works unchanged inside each partition.",
      },
      { kind: "heading", text: "The window's order vs the report's order" },
      {
        kind: "sql",
        title: "Two ORDER BYs, two jobs",
        code: `SELECT first_name || ' ' || last_name AS employee,
       salary,
       hire_date,
       row_number() OVER (ORDER BY hire_date) AS tenure_rank
FROM employees
WHERE terminated IS NULL
ORDER BY salary DESC
LIMIT 6;`,
        result: { columns: ["employee", "salary", "hire_date", "tenure_rank"], rows: [
        ["Amara Osei", "385000.00", "2017-01-09", "1"],
        ["Daniel Kramer", "245000.00", "2018-03-12", "2"],
        ["Sofia Mancini", "232000.00", "2019-06-17", "5"],
        ["Priya Nair", "228000.00", "2020-02-24", "8"],
        ["Lena Hoffman", "198000.00", "2019-04-15", "4"],
        ["Marcus Tran", "192000.00", "2020-07-20", "10"],
      ] },
        explain: [
          "The report prints the six highest salaries — but tenure_rank did not count salaries. Amara Osei is tenure 1 (hired 2017-01-09, the company's very first employee) and Daniel Kramer tenure 2; the window numbered hire dates.",
          "Lena Hoffman is the tell: fifth by salary in this excerpt, but tenure 4 — she joined in April 2019, before four of the people paid above her. Priya Nair, hired in 2020, is tenure 8; Marcus Tran is 10.",
          "Two ORDER BYs, two jobs: the one inside OVER is the order the function walks its window in; the final one is the order you read. Neither obeys the other.",
          "Drop the final ORDER BY and PostgreSQL still computes the same tenure numbers — printed in whatever order suits the engine. Correct, and unreadable.",
        ],
      },
      { kind: "heading", text: "Aggregates over partitions" },
      {
        kind: "sql",
        title: "The department payroll beside every salary",
        code: `SELECT d.name AS department,
       e.first_name || ' ' || e.last_name AS employee,
       e.salary,
       sum(e.salary) OVER (PARTITION BY e.dept_id) AS dept_payroll
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
ORDER BY d.name, e.salary DESC
LIMIT 10;`,
        result: { columns: ["department", "employee", "salary", "dept_payroll"], rows: [
        ["Customer Success", "Beatrice Laurent", "124000.00", "200000.00"],
        ["Customer Success", "Sam Whitfield", "76000.00", "200000.00"],
        ["Data", "Tara Singh", "141000.00", "141000.00"],
        ["Engineering", "Daniel Kramer", "245000.00", "1862000.00"],
        ["Engineering", "Lena Hoffman", "198000.00", "1862000.00"],
        ["Engineering", "Marcus Tran", "192000.00", "1862000.00"],
        ["Engineering", "Elena Petrova", "168000.00", "1862000.00"],
        ["Engineering", "James Okoro", "162000.00", "1862000.00"],
        ["Engineering", "Grace Park", "158000.00", "1862000.00"],
        ["Engineering", "Ingrid Sorensen", "149000.00", "1862000.00"],
      ] },
        explain: [
          "sum() — the same aggregate from Part E — now carries PARTITION BY e.dept_id: it computes each department's payroll and stamps it on every member's row.",
          "Both Customer Success rows read 200000.00 (124000 + 76000). Every engineer's row reads 1862000.00 — the twelve-engineer payroll, computed once per partition and reused, not re-added 28 times.",
          "Tara Singh's window contains exactly one row — she IS the Data department — so her department payroll is simply her own salary, 141000.00.",
          "This is the report shape the intro promised: each salary with its own department's total right beside it, nobody collapsed.",
        ],
      },
      {
        kind: "sql",
        title: "Each salary as a share of its payroll",
        code: `SELECT d.name AS department,
       e.first_name || ' ' || e.last_name AS employee,
       e.salary,
       round(100 * e.salary / sum(e.salary) OVER (PARTITION BY e.dept_id), 1) AS pct_of_payroll
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
ORDER BY d.name, pct_of_payroll DESC
LIMIT 10;`,
        result: { columns: ["department", "employee", "salary", "pct_of_payroll"], rows: [
        ["Customer Success", "Beatrice Laurent", "124000.00", "62.0"],
        ["Customer Success", "Sam Whitfield", "76000.00", "38.0"],
        ["Data", "Tara Singh", "141000.00", "100.0"],
        ["Engineering", "Daniel Kramer", "245000.00", "13.2"],
        ["Engineering", "Lena Hoffman", "198000.00", "10.6"],
        ["Engineering", "Marcus Tran", "192000.00", "10.3"],
        ["Engineering", "Elena Petrova", "168000.00", "9.0"],
        ["Engineering", "James Okoro", "162000.00", "8.7"],
        ["Engineering", "Grace Park", "158000.00", "8.5"],
        ["Engineering", "Ingrid Sorensen", "149000.00", "8.0"],
      ] },
        explain: [
          "A row divided by an aggregate over its own group — the classic window pattern, no JOIN to a summary table needed: 100 * e.salary / sum(e.salary) OVER (PARTITION BY e.dept_id).",
          "Beatrice Laurent is 62.0 percent of Customer Success's payroll and Sam Whitfield 38.0 — two people, 100 percent between them.",
          "Tara Singh is 100.0: alone in the Data department, she is the entire payroll.",
          "Engineering is the flattest: Daniel Kramer, the best-paid engineer, is only 13.2 percent of his payroll, because the denominator is twelve salaries deep.",
        ],
      },
      { kind: "heading", text: "Collapse vs keep: the same question, two shapes" },
      {
        kind: "sql",
        title: "The GROUP BY version: 28 rows become 8",
        code: `SELECT d.name AS department,
       count(*) AS headcount,
       sum(e.salary) AS dept_payroll
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
GROUP BY d.name
ORDER BY dept_payroll DESC;`,
        result: { columns: ["department", "headcount", "dept_payroll"], rows: [
        ["Engineering", "12", "1862000.00"],
        ["Product", "5", "849000.00"],
        ["Sales", "4", "574000.00"],
        ["Executive", "1", "385000.00"],
        ["Marketing", "2", "264000.00"],
        ["Customer Success", "2", "200000.00"],
        ["People Ops", "1", "175000.00"],
        ["Data", "1", "141000.00"],
      ] },
        explain: [
          "The same payroll question, answered the Part E way: GROUP BY d.name folds the 28 current employees into 8 rows, one per department.",
          "The totals agree with the window version exactly — Engineering 1862000.00, Customer Success 200000.00 — both tools compute the same sums.",
          "What differs is what survives. Here the employees are gone; in the window version every employee kept its row and carried the total along.",
          "count(*) rides along for free — headcount per department: twelve engineers, five in Product, and the three one-person departments, Executive, People Ops and Data.",
        ],
      },
      {
        kind: "table",
        title: "GROUP BY vs a windowed aggregate",
        headers: ["", "GROUP BY", "Aggregate OVER (PARTITION BY ...)"],
        rows: [
          ["Rows out", "one per group", "every input row"],
          ["What it computes", "one summary per group", "the group summary, stamped beside each row"],
          ["Made for", "'payroll per department'", "'each salary beside its department payroll'"],
        ],
        caption:
          "Same sums, different shape. Pick by what the reader needs to see afterwards: a summary, or the rows themselves.",
      },
      {
        kind: "callout",
        tone: "analogy",
        title: "Walls vs the compactor",
        text: "`PARTITION BY` builds walls; `GROUP BY` runs a compactor. The wall keeps every runner on the track but gives each lane its own scoreboard — rank 1 in Engineering's lane and rank 1 in Data's lane are different achievements, and both runners are still standing. The compactor melts each lane down to one number and hands you the medal table. Both are honest tools; they just answer differently shaped questions.",
      },
      {
        kind: "lab",
        title: "Top earner in every department",
        task:
          "Leadership wants one row per department: its top-paid current employee (terminated IS NULL). The starter ranks everyone inside their department with rank() OVER (PARTITION BY ...), then keeps only dept_rank = 1 — the i-01 subquery pattern doing per-group work. Order by department. Expected columns: department, employee, salary.",
        code: `SELECT department, employee, salary
FROM (SELECT d.name AS department,
             e.first_name || ' ' || e.last_name AS employee,
             e.salary,
             rank() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS dept_rank
      FROM employees e
      JOIN departments d ON d.dept_id = e.dept_id
      WHERE e.terminated IS NULL) ranked
WHERE dept_rank = 1
ORDER BY department;`,
        hint:
          "Two variations worth running: change dept_rank = 1 to dept_rank <= 2 for a top-two-per-department report, and swap rank() for row_number() — the day two people tie for a department's top salary, only one of them gets the crown.",
      },
    ],
    terms: [
      { term: "Partition", definition: "The slice of rows a window function sees after PARTITION BY divides the result — each partition computes its rankings and aggregates independently, restarting from scratch." },
      { term: "Window order", definition: "The ORDER BY inside OVER — the order in which the function walks its window. It is a different knob from the query's output ORDER BY." },
      { term: "Peers", definition: "Rows tied in the window's ORDER BY — they share a rank() position, like the four 4.5-rated employees in i-01." },
      { term: "Top-N per group", definition: "The pattern of filtering on a rank inside a partition: window in a subquery, WHERE rank <= N outside — how 'top earner per department' is actually written." },
    ],
    mistakes: [
      {
        mistake: "Calling rank() OVER () with no ORDER BY inside the parentheses",
        why: "Ranking needs an order to rank by; with none, every row is a peer of every other and they all silently tie for rank 1.",
        fix: "Always give a ranking function an ORDER BY inside the OVER clause: rank() OVER (ORDER BY salary DESC).",
      },
      {
        mistake: "Hoping PARTITION BY will filter the rows down to one department",
        why: "PARTITION BY organizes rows into windows — it never removes any. Every employee still appears, ranked within their own department.",
        fix: "Filter with WHERE before the window runs, or wrap the windowed query in a subquery and filter on the rank outside.",
      },
      {
        mistake: "Expecting the output to come out sorted by the OVER clause's ORDER BY",
        why: "The ORDER BY inside OVER defines the order the function walks its window in — it promises nothing about the order rows are returned in.",
        fix: "Add an explicit ORDER BY at the end of the query for the report's order, and let the window's ORDER BY be whatever the function needs.",
      },
    ],
    takeaways: [
      "PARTITION BY draws walls, not filters — every row keeps its place and gets its own group's answer.",
      "The ORDER BY inside OVER is the window's walking order; the final ORDER BY sorts the report.",
      "sum(...) OVER (PARTITION BY ...) is the group total stamped beside every row — same sums as GROUP BY, different shape.",
      "GROUP BY collapses to one row per group; a window keeps them all. Pick by what the reader needs to see.",
    ],
    quiz: [
      {
        id: "i-02-q1",
        prompt: "rank() OVER (PARTITION BY dept_id ORDER BY salary DESC): the highest-paid engineer is rank 1. What rank does the highest-paid salesperson get?",
        options: [
          { text: "1 — every partition restarts its own ladder", correct: true, feedback: "Correct — the wall resets the count: rank 1 in Sales is computed inside Sales alone." },
          { text: "13 — engineering's twelve people all rank ahead", correct: false, feedback: "Only without PARTITION BY — the walls keep the departments' ladders completely separate." },
          { text: "NULL — the partition boundary breaks the ordering", correct: false, feedback: "Nothing breaks: each partition is simply a fresh, complete little result set for the function." },
          { text: "2 — the window keeps counting across the company", correct: false, feedback: "Counting would continue only with plain OVER () — PARTITION BY exists precisely to restart it." },
        ],
        explanation: "PARTITION BY gives every group its own private window: numbering, sums and averages all restart from scratch at each wall.",
      },
      {
        id: "i-02-q2",
        prompt: "A query prints rows ORDER BY salary DESC but computes row_number() OVER (ORDER BY hire_date). The first row on screen shows tenure number 5. What happened?",
        options: [
          { text: "Nothing is wrong — the window numbered hire dates while the report sorts by salary", correct: true, feedback: "Correct — two ORDER BYs, two jobs: the OVER's order feeds the function; the final ORDER BY feeds the reader." },
          { text: "The window function is broken and ignored its ORDER BY", correct: false, feedback: "It obeyed the only order it was given — hire_date. It never promised to sort the output." },
          { text: "PostgreSQL sorted by hire_date because the window ran last", correct: false, feedback: "Windows run before the final ORDER BY — but the final ORDER BY is what actually sorts the rows you see." },
          { text: "That row is the fifth-highest salary", correct: false, feedback: "The first printed row IS the top salary — its 5 counts hire dates, not salaries." },
        ],
        explanation: "The ORDER BY inside OVER and the ORDER BY at the end are independent knobs: the first defines the window's walk, the second defines the page.",
      },
      {
        id: "i-02-q3",
        prompt: "Leadership wants to email every current employee their salary next to their OWN department's average. Which query?",
        options: [
          { text: "SELECT e.salary, avg(e.salary) OVER (PARTITION BY e.dept_id) FROM employees e", correct: true, feedback: "Correct — the department average stamped beside every employee row, nobody collapsed." },
          { text: "SELECT avg(salary) FROM employees GROUP BY dept_id", correct: false, feedback: "One row per department holding the average — the employees you needed to email are gone." },
          { text: "SELECT salary, avg(salary) OVER () FROM employees", correct: false, feedback: "Close — but OVER () is the company-wide average, not each department's." },
          { text: "SELECT salary, avg(salary) FROM employees HAVING salary IS NOT NULL", correct: false, feedback: "HAVING filters groups, and salary is not grouped — this errors rather than averages anything." },
        ],
        explanation: "PARTITION BY is the word that turns a company-wide window into a per-department one — the average resets at each wall.",
      },
    ],
  },
  {
    slug: "i-03",
    title: "Window functions III — time travel in rows",
    minutes: 14,
    summary:
      "lag and lead read the neighboring row (salary raises, balance steps between consecutive transactions), first_value and last_value grab a partition's edges, ntile cuts the payroll into quartile bands, and an ORDER BY inside OVER grows the frame into a running total that rebuilds a bank balance from transactions alone.",
    kind: "coding",
    dataset: "hr",
    objectives: [
      "Reach to the neighboring row with lag() and lead() — raises from salary history, balance steps from a ledger",
      "Grab a partition's edges with first_value() and last_value() — and widen the frame last_value() needs",
      "Slice an ordered column into equal bands with ntile() — pay quartiles",
      "Build running totals with ORDER BY inside OVER — and audit a bank ledger against its own balance_after column",
    ],
    why:
      "HeliosWorks keeps every salary each employee has ever had, and Meridian Trust keeps every cent that moved through an account — but neither table says the interesting part out loud: how big was each raise, how far did the balance drop, what was the balance after this exact transaction? Those answers live in the gaps BETWEEN rows, and no GROUP BY can read them. This lesson's functions can: lag and lead lean one row back and one row forward, first_value and last_value grab a partition's edges, ntile slices a whole column into pay bands, and an ORDER BY inside OVER turns sum into a running total that rebuilds a bank balance from transactions alone — checked here against the very column the bank recorded itself.",
    blocks: [
      {
        kind: "text",
        text: "Ranking asks *where does this row stand?* — the questions in this lesson ask something stranger: *what happened between this row and the one before it?* HeliosWorks stores every salary an employee has ever had, but not the size of each raise, because that lives between two rows. Meridian Trust stores every cent that moved through an account, but the step from one balance to the next also lives between rows. The functions here — `lag`, `lead`, `first_value`, `last_value`, `ntile` and running totals — are how SQL reads those gaps.",
      },
      {
        kind: "sql",
        title: "Raises: lag() and lead() on salary history",
        code: `SELECT employee_id, effective, amount,
       lag(amount)  OVER w AS prev_salary,
       amount - lag(amount) OVER w AS raise,
       lead(amount) OVER w AS next_salary
FROM salaries
WHERE employee_id IN (1, 2, 3)
WINDOW w AS (PARTITION BY employee_id ORDER BY effective)
ORDER BY employee_id, effective;`,
        result: { columns: ["employee_id", "effective", "amount", "prev_salary", "raise", "next_salary"], rows: [
        ["1", "2017-01-09", "290000.00", null, null, "340000.00"],
        ["1", "2020-01-01", "340000.00", "290000.00", "50000.00", "385000.00"],
        ["1", "2024-01-01", "385000.00", "340000.00", "45000.00", null],
        ["2", "2018-03-12", "205000.00", null, null, "228000.00"],
        ["2", "2021-01-01", "228000.00", "205000.00", "23000.00", "245000.00"],
        ["2", "2024-07-01", "245000.00", "228000.00", "17000.00", null],
        ["3", "2019-06-17", "198000.00", null, null, "215000.00"],
        ["3", "2022-01-01", "215000.00", "198000.00", "17000.00", "232000.00"],
        ["3", "2025-01-01", "232000.00", "215000.00", "17000.00", null],
      ] },
        explain: [
          "Each employee's salary history is its own partition, walked by effective date from first salary to latest. The WINDOW clause at the bottom names that window w so three OVER clauses can share one definition — the same economy as a column alias.",
          "lag(amount) reads the previous row's salary: NULL on each employee's first row (the 2017 hiring salary had no predecessor), 290000.00 on employee 1's 2020 row.",
          "raise is amount minus that lag — arithmetic between neighbors: employee 1 went 290000.00 to 340000.00 (+50000.00) to 385000.00 (+45000.00). NULL minus anything stays NULL, so first rows honestly report no raise.",
          "lead(amount) looks the other way: employee 1's 2020 row can see the 385000.00 coming; the latest row of every partition sees NULL, because there is no next salary yet.",
          "Employee 3's last two rows both show 17000.00 raises: 198000.00 to 215000.00 to 232000.00. The pattern was never stored anywhere — lag made it visible.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "NULL at the edges is information",
        text: "`lag()` returns NULL on each partition's first row and `lead()` on each last row — there is genuinely no neighbor there. Resist `coalesce(lag(amount), 0)`: it would turn Amara's first salary into a 'raise' of 290000.00. Filter the NULLs out (`WHERE prev_salary IS NOT NULL`) or label them 'first' for display.",
      },
      { kind: "heading", text: "Bank balances, one step at a time" },
      {
        kind: "sql",
        title: "Balance steps: lag() on a ledger",
        dataset: "banking",
        code: `SELECT txn_id, occurred_at, txn_type, amount, balance_after,
       balance_after - lag(balance_after) OVER (ORDER BY occurred_at) AS delta
FROM transactions
WHERE account_id = 22
ORDER BY occurred_at;`,
        result: { columns: ["txn_id", "occurred_at", "txn_type", "amount", "balance_after", "delta"], rows: [
        ["83", "2026-03-01 09:00:00", "deposit", "2000.00", "2000.00", null],
        ["84", "2026-03-20 18:30:00", "withdrawal", "1450.00", "550.00", "-1450.00"],
        ["85", "2026-04-05 09:15:00", "deposit", "1100.00", "1650.00", "1100.00"],
        ["86", "2026-04-21 20:40:00", "withdrawal", "1820.00", "-170.00", "-1820.00"],
        ["87", "2026-04-22", "fee", "35.00", "-205.00", "-35.00"],
        ["88", "2026-05-08 14:00:00", "deposit", "310.00", "105.00", "310.00"],
        ["89", "2026-05-30 19:15:00", "withdrawal", "240.00", "-135.00", "-240.00"],
        ["90", "2026-05-31", "fee", "35.00", "-170.00", "-35.00"],
        ["91", "2026-06-14 11:30:00", "deposit", "160.00", "-10.00", "160.00"],
        ["92", "2026-06-28 16:50:00", "withdrawal", "38.20", "-48.20", "-38.20"],
      ] },
        explain: [
          "Account 22 is Trevor Bishop's checking account at Meridian Trust; the window walks its ten transactions from March to June 2026.",
          "delta is this row's balance_after minus the previous row's — the step the account took. The opening deposit has no previous row, so NULL.",
          "Read the story the column tells: a +2000.00 opening deposit, a 1450.00 car repair (delta -1450.00) leaves 550.00, an 1100.00 check deposit brings 1650.00 — then rent of 1820.00 pushes the balance to -170.00. Overdraft.",
          "The bank's answer follows immediately: a 35.00 overdraft fee (delta -35.00, balance -205.00). Fee rows post at midnight, which is why their timestamps print as a bare date.",
          "The account never gets back above water — the final step is -38.20 for streaming subscriptions, ending at -48.20. Every step was derivable from two adjacent rows; lag just did the subtraction.",
        ],
      },
      { kind: "heading", text: "The edges: first_value() and last_value()" },
      {
        kind: "sql",
        title: "Edges and the frame trap",
        code: `SELECT effective, amount,
       last_value(amount) OVER (ORDER BY effective) AS last_default,
       first_value(amount) OVER w AS first_salary,
       last_value(amount)  OVER w AS last_salary
FROM salaries
WHERE employee_id = 1
WINDOW w AS (ORDER BY effective
             ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING);`,
        result: { columns: ["effective", "amount", "last_default", "first_salary", "last_salary"], rows: [
        ["2017-01-09", "290000.00", "290000.00", "290000.00", "385000.00"],
        ["2020-01-01", "340000.00", "340000.00", "290000.00", "385000.00"],
        ["2024-01-01", "385000.00", "385000.00", "290000.00", "385000.00"],
      ] },
        explain: [
          "Employee 1's salary history again, now asking for the edges: first_salary is 290000.00 on every row (the 2017 start), last_salary is 385000.00 on every row (the 2024 salary) — with one catch you need to see coming.",
          "The catch is last_default: last_value(amount) with a plain ORDER BY and no frame. It prints each row's own amount — 290000.00, 340000.00, 385000.00 — as if every row were the last.",
          "That is the default frame at work. With ORDER BY inside OVER, the frame runs from the partition's start to the CURRENT ROW — each row can only see backwards, so the last value it can see is itself.",
          "The named window w widens the frame explicitly: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING stretches it across the whole partition, and last_value finds the true end, 385000.00.",
          "first_value never needs the fix — its default frame already starts at the partition's first row. Rule of thumb: last_value without an explicit full frame is almost always a bug.",
        ],
      },
      { kind: "heading", text: "Pay bands: ntile()" },
      {
        kind: "sql",
        title: "Quartiles of the payroll",
        code: `SELECT first_name || ' ' || last_name AS employee,
       salary,
       ntile(4) OVER (ORDER BY salary) AS pay_band
FROM employees
WHERE terminated IS NULL
ORDER BY pay_band, salary DESC
LIMIT 12;`,
        result: { columns: ["employee", "salary", "pay_band"], rows: [
        ["Beatrice Laurent", "124000.00", "1"],
        ["Nadia Cheung", "118000.00", "1"],
        ["Omar Haddad", "108000.00", "1"],
        ["Diego Fuentes", "104000.00", "1"],
        ["Yuki Tanaka", "98000.00", "1"],
        ["Victor Adeyemi", "82000.00", "1"],
        ["Sam Whitfield", "76000.00", "1"],
        ["Hassan Al-Farsi", "145000.00", "2"],
        ["Kevin O'Brien", "142000.00", "2"],
        ["Tara Singh", "141000.00", "2"],
        ["Maria Gonzalez", "138000.00", "2"],
        ["Aisha Rahman", "134000.00", "2"],
      ] },
        explain: [
          "ntile(4) does not rank — it cuts. The 28 current salaries, walked from lowest to highest, are split into 4 bands as evenly as possible: 7 people each.",
          "Band 1 is the bottom quarter of pay at HeliosWorks: 76000.00 (Sam Whitfield) up to 124000.00 (Beatrice Laurent), printed highest-first inside the band.",
          "Band 2's first five rows run 145000.00 down to 134000.00; its last two (128000.00 and 126000.00) and bands 3 and 4 fall below the LIMIT.",
          "28 divides evenly by 4 here; when it does not, the earlier bands get the extra rows — ntile(4) over 29 salaries would make band 1 eight people.",
          "This is the quartile report compensation teams ask for — 'which quarter of our pay range are you in?' — with no CASE ladder and no self-join.",
        ],
      },
      { kind: "heading", text: "Running totals: ORDER BY grows the frame" },
      {
        kind: "visual",
        title: "What ORDER BY inside OVER does to the window",
        ascii: `   sum(x) OVER (PARTITION BY p) - the whole partition:

     row 1  [* * * *]   sees all 4 rows
     row 2  [* * * *]   sees all 4 rows   (grand total
     row 3  [* * * *]   sees all 4 rows    everywhere)

   sum(x) OVER (PARTITION BY p ORDER BY t):

     row 1  [* . . .]   sees row 1        (running total:
     row 2  [* * . .]   sees rows 1-2      the frame
     row 3  [* * * .]   sees rows 1-3      grows row
     row 4  [* * * *]   catches up          by row)`,
        caption:
          "The dots are rows the window cannot see yet. Adding ORDER BY inside OVER is the switch between a grand total and a running one.",
      },
      {
        kind: "sql",
        title: "Rebuilding the balance from transactions alone",
        dataset: "banking",
        code: `SELECT txn_id, occurred_at,
       round(sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
                      THEN amount ELSE -amount END)
             OVER (ORDER BY occurred_at), 2) AS computed_balance,
       balance_after
FROM transactions
WHERE account_id = 22
ORDER BY occurred_at;`,
        result: { columns: ["txn_id", "occurred_at", "computed_balance", "balance_after"], rows: [
        ["83", "2026-03-01 09:00:00", "2000.00", "2000.00"],
        ["84", "2026-03-20 18:30:00", "550.00", "550.00"],
        ["85", "2026-04-05 09:15:00", "1650.00", "1650.00"],
        ["86", "2026-04-21 20:40:00", "-170.00", "-170.00"],
        ["87", "2026-04-22", "-205.00", "-205.00"],
        ["88", "2026-05-08 14:00:00", "105.00", "105.00"],
        ["89", "2026-05-30 19:15:00", "-135.00", "-135.00"],
        ["90", "2026-05-31", "-170.00", "-170.00"],
        ["91", "2026-06-14 11:30:00", "-10.00", "-10.00"],
        ["92", "2026-06-28 16:50:00", "-48.20", "-48.20"],
      ] },
        explain: [
          "The CASE — a Part G move — signs each amount: deposits and incoming transfers positive; withdrawals, outgoing transfers and fees negative.",
          "sum(...) OVER (ORDER BY occurred_at): the ORDER BY turns on the growing frame, so each row's sum runs from the account's first transaction through the current one. A running total.",
          "Walk it: 2000.00 after the opening deposit, 550.00 after the car repair, 1650.00 after the check, -170.00 after rent, -205.00 after the overdraft fee, all the way to -48.20.",
          "Now the payoff: computed_balance equals balance_after on every single row. Meridian Trust stored that column precisely so the ledger can be audited this way — ten transactions, ten exact matches, one expression.",
          "Without window functions the alternative is a self-join of transactions to transactions ('sum every earlier transaction for each row') — the kind of query that gets slower the longer the account lives.",
        ],
      },
      {
        kind: "table",
        title: "The row-time-travel toolkit",
        headers: ["Function", "It answers", "Watch out for"],
        rows: [
          ["lag(x)", "what did the previous row have?", "NULL on each partition's first row"],
          ["lead(x)", "what does the next row have?", "NULL on each partition's last row"],
          ["first_value(x)", "the partition's first x", "safe under the default frame"],
          ["last_value(x)", "the partition's last x", "needs an explicit full frame"],
          ["ntile(n)", "which of n equal bands is this row in?", "bands differ by one row when n does not divide evenly"],
          ["sum(x) OVER (ORDER BY ...)", "the running total through this row", "no ORDER BY means the grand total instead"],
        ],
        caption: "All six need an OVER clause; all six keep every row.",
      },
      {
        kind: "lab",
        title: "Account 6: the ledger that starts mid-story",
        dataset: "banking",
        task:
          "Meridian Trust's stored history for account 6 (Kwame Mensah's checking) begins after the account already existed — its first recorded transaction is a 180.00 withdrawal that ends at 820.00, not at -180.00. The starter rebuilds the running balance from transactions alone, then measures the gap: opening_offset = balance_after - computed_balance. Run it, read the constant, then switch to account_id = 22 — an account that truly started from zero — and watch the offset become 0.00. Expected columns: txn_id, txn_type, amount, balance_after, computed_balance, opening_offset.",
        code: `SELECT txn_id, txn_type, amount, balance_after,
       computed_balance,
       balance_after - computed_balance AS opening_offset
FROM (SELECT txn_id, txn_type, amount, balance_after,
             round(sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
                            THEN amount ELSE -amount END)
                   OVER (ORDER BY occurred_at), 2) AS computed_balance
      FROM transactions
      WHERE account_id = 6) ledger
ORDER BY txn_id;`,
        hint:
          "Why is the gap constant? Both columns walk the same twelve transactions in the same order, so they can only differ by whatever the balance was before txn 50. That constant — 1000.00 — is account 6's opening balance, money that predates its recorded history.",
      },
    ],
    terms: [
      { term: "Frame", definition: "The stretch of rows inside the window relative to the current row — UNBOUNDED PRECEDING through CURRENT ROW to UNBOUNDED FOLLOWING. With ORDER BY inside OVER, aggregates default to 'partition start through the current row'." },
      { term: "Offset functions", definition: "lag(x, n) and lead(x, n): read a column's value n rows behind or ahead in the window's order (n defaults to 1). No neighbor means NULL." },
      { term: "first_value / last_value", definition: "The values at the window's edges. last_value needs an explicit full frame, or it only sees up to the current row." },
      { term: "ntile(n)", definition: "Splits the partition's ordered rows into n bands as equal in size as possible — ntile(4) is quartiles." },
      { term: "Running total", definition: "sum with ORDER BY inside OVER: the frame grows row by row, so each row's total spans the partition's start through that row." },
    ],
    mistakes: [
      {
        mistake: "Using last_value() without widening the frame",
        why: "With ORDER BY inside OVER, the default frame runs from the partition's start to the CURRENT ROW — so the last value the function can see is the row itself.",
        fix: "Name the full frame: last_value(x) OVER (ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).",
      },
      {
        mistake: "Treating lag()'s NULL on the first row as a bug and patching it with 0",
        why: "The first row of every partition genuinely has no previous row — and coalescing to 0 invents history: a first salary would report itself as one giant raise.",
        fix: "Keep the NULL and let it mean 'no previous row', filter with WHERE prev IS NOT NULL, or coalesce only for display labels.",
      },
      {
        mistake: "Writing sum(x) OVER (PARTITION BY p) and expecting a running total",
        why: "Without ORDER BY inside the OVER, the frame is the whole partition at once — every row gets the grand total of its group.",
        fix: "Add the ORDER BY that gives the frame direction: sum(x) OVER (PARTITION BY p ORDER BY t).",
      },
    ],
    takeaways: [
      "lag() and lead() read the neighboring row — NULL on a partition's first (respectively last) row, because there is no neighbor.",
      "last_value() sees only up to the current row by default — widen the frame to UNBOUNDED FOLLOWING to find the true end.",
      "ntile(n) cuts the ordered rows into n equal bands — quartiles, deciles, percentiles without a single CASE.",
      "ORDER BY inside OVER turns an aggregate into a running one: the frame grows row by row.",
      "The running total rebuilt account 22's balance exactly — window functions are how ledgers get audited.",
    ],
    quiz: [
      {
        id: "i-03-q1",
        prompt: "The FIRST transaction in an account's ledger: what does lag(balance_after) OVER (ORDER BY occurred_at) return on that row?",
        options: [
          { text: "NULL — there is no previous row to read", correct: true, feedback: "Correct — lag reads a neighbor, and the first row has none. NULL, not 0." },
          { text: "0 — the balance before the account existed", correct: false, feedback: "lag never invents values: no neighbor means NULL, and 0 would be a fake balance." },
          { text: "The account's opening balance", correct: false, feedback: "It cannot know that — lag only reads rows inside the window, and none came before." },
          { text: "An error: lag() needs a preceding row", correct: false, feedback: "No error — a first-row NULL is normal, expected lag() behavior." },
        ],
        explanation: "Expect NULL at partition edges: lag's first row and lead's last row have no neighbor to reach.",
      },
      {
        id: "i-03-q2",
        prompt: "Why does last_value(amount) OVER (ORDER BY effective) echo each row's own amount instead of the final salary?",
        options: [
          { text: "The default frame ends at the current row, so each row is its own last", correct: true, feedback: "Correct — ORDER BY turns on the growing frame: partition start through CURRENT ROW, so the 'last' visible value is the row itself." },
          { text: "last_value always returns the current row's value", correct: false, feedback: "Only under the default frame — give it the full frame and it returns the partition's final value." },
          { text: "The window forgot the ORDER BY and is unordered", correct: false, feedback: "The order is fine — it is the frame's right edge that stops at the current row." },
          { text: "amount must be sorted DESC for last_value to work", correct: false, feedback: "Sort direction changes which value is last, not whether the function can see it." },
        ],
        explanation: "Fix: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING stretches the frame across the whole partition, and last_value finds the true end.",
      },
      {
        id: "i-03-q3",
        prompt: "sum(amount) OVER (ORDER BY occurred_at) versus sum(amount) OVER () — what is the difference?",
        options: [
          { text: "The first is a running total that grows row by row; the second stamps the grand total on every row", correct: true, feedback: "Correct — ORDER BY slides the frame's right edge along; without it, the window is the whole set at once." },
          { text: "They are the same thing spelled differently", correct: false, feedback: "Run them side by side: one column accumulates, the other repeats a single number." },
          { text: "The first sorts the output; the second leaves it unsorted", correct: false, feedback: "Neither touches the output order — only a final ORDER BY does that." },
          { text: "The first is per account; the second is per customer", correct: false, feedback: "Grouping comes from PARTITION BY — this pair differs by frame growth, not by grouping." },
        ],
        explanation: "ORDER BY inside OVER is the running-total switch: the frame starts at the partition's first row and grows to include the current one.",
      },
    ],
  },

  {
    slug: "i-04",
    title: "Views — saved queries",
    minutes: 13,
    summary:
      "CREATE VIEW saves a query under a name you query like a table — over joins too; CREATE OR REPLACE swaps the definition in place, base-table updates show through instantly, DROP VIEW cleans up, and none of it makes anything faster.",
    kind: "coding",
    dataset: "hr",
    objectives: [
      "Save a query under a name with CREATE VIEW — and query the view like any table",
      "Wrap a JOIN in a view so consumers see one simple table with the plumbing hidden",
      "Change a view the safe way: plain CREATE refuses, CREATE OR REPLACE swaps the query in place",
      "Prove a view is live: UPDATE the base table and watch the view reflect it immediately",
      "Clean up with DROP VIEW and list what exists in information_schema.views",
    ],
    why:
      "People Ops at HeliosWorks asks about 'current staff' constantly — headcount, payroll, anniversaries — and at HeliosWorks 'current' means exactly one thing: terminated IS NULL. Without a view, that condition is copy-pasted into every report, and copy-pasted business rules drift: one dashboard forgets the filter, another adds an extra one, and the day the definition changes (contractors excluded, say) nobody can find all the copies to fix. CREATE VIEW names the query once, and every report queries the name instead — one definition, always in agreement. The same move hides a two-table JOIN behind a plain 'table' for the new analyst, and hands the reporting tool exactly the columns it should see and not one more. Views will not make anything faster — they make queries simpler, consistent and safer, which is usually what the question was actually suffering from.",
    blocks: [
      {
        kind: "text",
        text: "People Ops at HeliosWorks asks questions about *current staff* — and 'current' is doing quiet work in that phrase. Peter Novak and Lucia Moreno have left the company, but their rows stay in `employees` (carrying a `terminated` date) so history keeps making sense. So every current-staff report opens the same way — `WHERE terminated IS NULL` — the headcount, the payroll by department, the anniversary list you ranked in i-01. Copy-pasted conditions like that drift: one report forgets the filter, another adds an extra one, and when the rule changes nobody can find all the copies. A **view** is the fix: `CREATE VIEW` saves a query under a name, and the name then behaves like a table. Three things improve at once — queries get *simpler* (the boilerplate lives in the view), reports get *consistent* (one definition of current staff), and access gets *safer* (expose exactly the columns a consumer should see). You will watch all three happen in this lesson.",
      },
      {
        kind: "sql",
        title: "CREATE VIEW — a query with a name",
        code: `CREATE VIEW current_employees AS
SELECT employee_id, first_name, last_name, dept_id,
       job_title, hire_date, salary
FROM employees
WHERE terminated IS NULL;`,
        result: { columns: [], rows: [], command: "CREATE" },
        explain: [
          "Two halves, one statement: a name — current_employees — and, after AS, the query to save. The query is the exact one you have been copy-pasting all course long; CREATE VIEW adds no magic to it, it just stores it under the name.",
          "Nothing came back, because nothing was read. The result is a bare CREATE command tag: the database filed the query text in its catalog and did no other work.",
          "From this moment, current_employees sits in the schema beside employees and departments. It was never declared with columns or types — its columns ARE the saved query's output columns.",
          "And the view's WHERE is now part of the furniture: anyone querying current_employees gets current staff without ever seeing the filter.",
        ],
      },
      {
        kind: "sql",
        title: "The view answers, with zero boilerplate",
        code: `SELECT count(*) AS current_staff
FROM current_employees;`,
        result: { columns: ["current_staff"], rows: [
        ["28"],
      ] },
        explain: [
          "It reads like a query against a table, because it is one: FROM names the view, and there is no WHERE clause because the view already owns that job.",
          "The answer is 28 — 30 people have rows in employees, and the view's saved filter removed Peter Novak and Lucia Moreno, the only two with a terminated date, before counting.",
          "Everything you know about SELECT works through a view: WHERE, ORDER BY, LIMIT, aggregates, even joining the view to other tables. Several of those appear before this lesson ends.",
        ],
      },
      { kind: "heading", text: "A view over a JOIN" },
      {
        kind: "sql",
        title: "Hide the join inside a view",
        code: `CREATE VIEW employee_directory AS
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS employee,
       e.job_title,
       d.name AS department,
       d.location,
       e.salary
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL;`,
        result: { columns: [], rows: [], command: "CREATE" },
        explain: [
          "The saved query is a full Part-D join — employees to departments — plus the same current-staff filter and a label built with ||. Nothing in it is new; what is new is where it lives.",
          "Consumers of this view never see the plumbing. FROM employee_directory reads like one flat table: id, employee, job title, department name, location, salary — no join, no aliases, no ON clause.",
          "The view also chose its columns deliberately: email, manager_id and terminated stayed behind in employees. Keep that in mind for the security note below.",
          "Same shape as the first block: the only output is the CREATE command tag, because the work was filing the query, not running it.",
        ],
      },
      {
        kind: "sql",
        title: "The directory answers questions like a table",
        code: `SELECT department, count(*) AS headcount
FROM employee_directory
GROUP BY department
ORDER BY headcount DESC, department;`,
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
          "A GROUP BY over a view — the planner unfolds the saved join and aggregates over its rows, exactly as if you had written the join yourself. To this query, employee_directory IS a table.",
          "Engineering leads with 12 current staff, Product has 5, Sales 4 — the numbers the raw join would have produced, from a query with one FROM clause instead of two tables and a join condition.",
          "The two-person teams (Customer Success, Marketing) and the three one-person shops (Data, Executive, People Ops) fill out the list: eight departments, one query.",
          "And because this report and every future report read the same view, they cannot disagree about what a department is. That consistency is half of what views are for.",
        ],
      },
      {
        kind: "callout",
        tone: "info",
        title: "Views as a security wall",
        text: "The third reason views exist is security. A database user needs SELECT on the *view*, never on the tables beneath it — so a reporting tool given `employee_directory` can read the directory but is physically unable to SELECT `email` or `terminated` from `employees`. Hiding columns comes free with choosing the view's column list; PostgreSQL's GRANT system enforces the rest. At HeliosWorks scale it is a convenience — at a bank, it is policy.",
      },
      { kind: "heading", text: "Changing a view without breaking it" },
      {
        kind: "sql",
        title: "The reflex — create it again — refused",
        code: `CREATE VIEW current_employees AS
SELECT employee_id, is_remote
FROM employees;`,
        expectError: "relation \"current_employees\" already exists",
        explain: [
          "The plan was to rebuild current_employees with is_remote added — but PostgreSQL stops before touching anything: relation \"current_employees\" already exists.",
          "The refusal is protection. If plain CREATE could silently overwrite, any script or teammate could replace a view that dozens of reports depend on, without a word.",
          "Views and tables share one namespace of names — current_employees is just as taken as if it were a table, and a table of that name would be blocked just the same.",
          "Two legal paths exist: DROP the view and create it fresh, or — better — replace it in place, which is the very next block.",
        ],
      },
      {
        kind: "sql",
        title: "CREATE OR REPLACE: swap the query in place",
        code: `CREATE OR REPLACE VIEW current_employees AS
SELECT employee_id, first_name, last_name, dept_id,
       job_title, hire_date, salary,
       is_remote
FROM employees
WHERE terminated IS NULL;

SELECT employee_id, first_name || ' ' || last_name AS employee,
       job_title, salary, is_remote
FROM current_employees
ORDER BY employee_id
LIMIT 5;`,
        result: { columns: ["employee_id", "employee", "job_title", "salary", "is_remote"], rows: [
        ["1", "Amara Osei", "Chief Executive Officer", "385000.00", "false"],
        ["2", "Daniel Kramer", "VP of Engineering", "245000.00", "false"],
        ["3", "Sofia Mancini", "VP of Sales", "232000.00", "false"],
        ["4", "Priya Nair", "VP of Product", "228000.00", "true"],
        ["5", "Gerald Weiss", "Head of People", "175000.00", "false"],
      ] },
        explain: [
          "OR REPLACE changes the deal: if no view exists, create one; if one exists, swap its saved query for this one — same name, new definition, in place.",
          "The definition is the original with a single change: is_remote, appended after the original seven columns. That order is a rule, not a style preference — CREATE OR REPLACE may add columns at the end, but never drop, rename or reorder existing ones, because queries that depend on the view must keep finding their columns.",
          "The query underneath reads through the refreshed view: five leaders, with Priya Nair now flagged true for remote — the new column arrived without ceremony.",
          "The command tag still reads CREATE — both spellings of the statement report the same tag.",
        ],
      },
      {
        kind: "sql",
        title: "Update the table, watch the view",
        code: `UPDATE employees SET salary = 78000 WHERE employee_id = 27;

SELECT employee_id, first_name || ' ' || last_name AS employee,
       job_title, salary
FROM current_employees
WHERE employee_id = 27;`,
        result: { columns: ["employee_id", "employee", "job_title", "salary"], rows: [
        ["27", "Sam Whitfield", "Support Specialist", "78000.00"],
      ] },
        explain: [
          "The UPDATE touches employees — the base table — not the view: Sam Whitfield, the Support Specialist, rises from 76000.00 to 78000.00. The block's visible result belongs to the SELECT that follows it.",
          "The view was never told. No refresh, no schedule, no sync job — yet the very next statement reads 78000.00 straight through it.",
          "Nothing needed refreshing, because nothing is stored. The view IS its query; running it reads employees as the table is right now.",
          "This is what 'always fresh' means for a view — and it is also the proof that a view is not a copy. A copy would have gone stale right here.",
        ],
      },
      {
        kind: "visual",
        title: "What the database stores for a view",
        ascii: `   TABLE: employees            VIEW: current_employees
   30 real rows on disk        a name + a saved query

   SELECT ... FROM current_employees
        |
        |  runs the saved query
        |  against employees, now
        v
   fresh rows - never a copy,
   nothing to go stale`,
        caption:
          "The left drawer holds data; the right drawer holds a question. One drawer can go stale; the other cannot, because it never held rows in the first place.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "A view is not a cache",
        text: "Because a view stores the query and not the rows, it never makes anything faster: every use re-runs the saved SELECT against the base tables — the same work you would have done by hand, just better organized and impossible to get inconsistent. If a query through a view feels slow, the fix is not a different view. It is an index — the subject of the very next lesson.",
      },
      {
        kind: "sql",
        title: "DROP VIEW — and what survived",
        code: `DROP VIEW employee_directory;

SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;`,
        result: { columns: ["table_name"], rows: [
        ["current_employees"],
      ] },
        explain: [
          "DROP VIEW removes the name and its stored query — the command tag reads DROP. The listing that follows is information_schema.views, PostgreSQL's catalog of the views living in the public schema.",
          "One name survived: current_employees. employee_directory is gone from the catalog as if it never existed.",
          "The base tables never noticed: dropping a view touches no data. The reverse direction is protected, though — PostgreSQL refuses to drop a table that a view depends on (it is in the mistakes list for a reason).",
          "DROP VIEW IF EXISTS is the tolerant spelling — it skips names that are not there, which is exactly what lets the lab below run twice in a row.",
        ],
      },
      {
        kind: "lab",
        title: "The premium catalog, saved once",
        task:
          "ShopSphere's merchandising team keeps re-typing the same filter: premium products are those priced at 300 or more. Save it as a view. The starter drops any old premium_products (a guard, so the lab re-runs), creates the view over products (product_id, name, brand, price — only the rows with price >= 300), then lists the six most expensive. Expected columns: name, price.",
        code: `DROP VIEW IF EXISTS premium_products;
CREATE VIEW premium_products AS
SELECT product_id, name, brand, price
FROM products
WHERE price >= 300;

SELECT name, price
FROM premium_products
ORDER BY price DESC, product_id
LIMIT 6;`,
        dataset: "ecommerce",
        hint:
          "Run the whole lab twice — the DROP VIEW IF EXISTS guard is what makes the second run clean. Then change the definition without dropping anything: CREATE OR REPLACE VIEW premium_products with price >= 1000, and re-run the final SELECT — the view narrows, and the products table never changes.",
      },
    ],
    terms: [
      { term: "View", definition: "A named, saved query that behaves like a table when selected from. Stores the query text — never rows." },
      { term: "Base table", definition: "A real table with rows on disk that a view reads from — employees underneath current_employees." },
      { term: "CREATE OR REPLACE VIEW", definition: "Swaps a view's saved query in place under the same name. May append columns at the end; may never drop, rename or reorder existing ones." },
      { term: "DROP VIEW", definition: "Removes a view's name and query from the catalog. The base tables and their data are untouched." },
      { term: "information_schema", definition: "PostgreSQL's catalog of itself, written as views — information_schema.views lists the views your schema holds." },
    ],
    mistakes: [
      {
        mistake: "Expecting a view to make a query faster",
        why: "The view stores the query, not results — every use re-runs it against the base tables, doing the same work you would have done by hand.",
        fix: "Reach for an index on the base table's filter columns (next lesson); views organize queries, indexes speed them up.",
      },
      {
        mistake: "Running CREATE VIEW to change an existing view",
        why: "Plain CREATE refuses with 'relation already exists' — the refusal protects every query and report that depends on the current definition.",
        fix: "CREATE OR REPLACE VIEW swaps the definition in place (appending new columns at the end), or DROP VIEW first when the change is radical.",
      },
      {
        mistake: "Expecting CREATE OR REPLACE to drop or rename columns",
        why: "Replacement may only append columns at the end — dropping or renaming would break every query that selects the view's existing columns.",
        fix: "Keep the original column list intact and add to it; if a column truly must go, DROP VIEW and create the view fresh, then fix the dependents.",
      },
      {
        mistake: "Dropping a base table that a view depends on",
        why: "The view is a stored query that names the table — PostgreSQL blocks the drop rather than leave the view broken.",
        fix: "Drop the view first (views are cheap to re-create), or let the error name the dependents so you can plan the cleanup.",
      },
    ],
    takeaways: [
      "A view is a saved query with a table's name — query it with everything SELECT already knows.",
      "The view stores the question, never the rows: base-table updates show through instantly, and there is nothing to refresh.",
      "CREATE VIEW never overwrites; CREATE OR REPLACE swaps the definition in place, appending columns only at the end.",
      "Views earn their keep three ways — simpler queries, one shared definition, and a wall that hides columns.",
      "DROP VIEW removes the name and the query; the base tables and their data never notice.",
    ],
    quiz: [
      {
        id: "i-04-q1",
        prompt: "What does PostgreSQL actually store when you run CREATE VIEW current_employees AS SELECT ... FROM employees WHERE terminated IS NULL?",
        options: [
          { text: "The view's name and the query text — no rows are copied; every use re-runs the query", correct: true, feedback: "Correct — a view is a saved question, and its answers are computed fresh each time." },
          { text: "A snapshot of the matching rows, refreshed on a schedule", correct: false, feedback: "Nothing is copied and no schedule exists — the view reads the live table every time." },
          { text: "The query text plus an automatic index on employees", correct: false, feedback: "No index is created; making queries faster is the next lesson's job, not the view's." },
          { text: "A second table PostgreSQL keeps synchronized with employees", correct: false, feedback: "It is not a table and nothing is synchronized — one name, one stored query." },
        ],
        explanation: "A view is a name plus a query. The rows it 'contains' are read from the base tables at query time — which is why base-table changes show through instantly and why the view itself is never a cache.",
      },
      {
        id: "i-04-q2",
        prompt: "employees is updated: Sam Whitfield's salary becomes 78000. What does SELECT salary FROM current_employees WHERE employee_id = 27 show?",
        options: [
          { text: "78000.00 — the view re-runs its saved query and reads the row as it is now", correct: true, feedback: "Correct — the view is its query; running it reads the current employees table." },
          { text: "76000.00 — the view kept the value from when it was created", correct: false, feedback: "Views keep nothing: there is no stored copy that could grow stale." },
          { text: "NULL — the row was invalidated by the update", correct: false, feedback: "Nothing is invalidated, because the view holds no cached rows to invalidate." },
          { text: "An error: the base table changed under the view", correct: false, feedback: "Changing data under a view is completely legal — it is the view's whole design." },
        ],
        explanation: "Views are live by construction: they store the question, not the answer, so the answer is always computed from the base table's current state.",
      },
      {
        id: "i-04-q3",
        prompt: "current_employees already exists. What happens when you run CREATE VIEW current_employees AS SELECT employee_id FROM employees;?",
        options: [
          { text: "It fails: relation \"current_employees\" already exists — CREATE never overwrites", correct: true, feedback: "Correct — and the refusal protects every query and report that depends on the existing view." },
          { text: "It replaces the view with the new, shorter definition", correct: false, feedback: "Replacing is CREATE OR REPLACE's job; plain CREATE is deliberately deaf to existing names." },
          { text: "It creates a second view alongside the first", correct: false, feedback: "One namespace, one name: PostgreSQL will not hold two relations called current_employees." },
          { text: "It renames the old view and creates the new one", correct: false, feedback: "PostgreSQL never renames on your behalf — it stops and lets you decide." },
        ],
        explanation: "Plain CREATE VIEW refuses when the name is taken; CREATE OR REPLACE VIEW is the statement built for changing a view in place, and it can only append columns at the end.",
      },
    ],
  },
  {
    slug: "i-05",
    title: "Indexes — how PostgreSQL finds rows fast",
    minutes: 15,
    summary:
      "A sequential scan reads the whole table to find one row; a B-tree index turns that sweep into a few hops — CREATE INDEX flips the plan before your eyes — but functions on the column and leading wildcards strand you back in the scan, every index taxes writes, and primary keys come indexed automatically.",
    kind: "coding",
    objectives: [
      "Read an EXPLAIN plan — strategy, cost, rows, width — and describe what a Seq Scan does",
      "Speed up a filtered lookup with CREATE INDEX and verify it in the plan: Index Scan, Index Cond, lower cost",
      "Predict when a B-tree cannot help — a function wrapped around the column, a leading wildcard in LIKE",
      "Explain the write-cost tradeoff of every index, and why primary keys are indexed automatically",
    ],
    why:
      "HeliosWorks' 28-row employees table makes finding rows look free — and at that size, it is. Production tables are cities: an order log runs to millions of rows, a bank's transaction ledger to millions more, and 'find this customer's order' asked a thousand times a day means a thousand whole-table reads without an index. This lesson builds a 10,000-row scratch table, asks PostgreSQL how it plans to find one row, and then changes the answer with a single CREATE INDEX. Just as important is when the index stays silent: a function wrapped around the column, a wildcard at the start of a pattern, a write-heavy table where every index charges rent. EXPLAIN — the planner's own plan, read out loud — is the tool that keeps every claim honest, and it is free.",
    blocks: [
      {
        kind: "text",
        text: "Every table you have queried so far was a village — 28 employees, a few dozen accounts. Finding rows in a village is free: read everything, you are done in microseconds. But the tables you will meet in production are cities: ShopSphere's order log runs to millions of rows and Meridian Trust's transaction ledger to millions more. When a support agent pulls up one customer's order, the database has exactly two ways to find it — **read the whole table** (a *sequential scan*), or **consult an index** and jump almost directly to the row. This lesson builds a 10,000-row table in an empty scratch schema (no sample database this time — the table is ours alone), asks PostgreSQL how it plans to find one row, and then changes the answer with one `CREATE INDEX`. The tool that keeps it all honest is `EXPLAIN`: it does not run the query — it makes the planner show its work.",
      },
      {
        kind: "sql",
        title: "A 10,000-row scratch table, built in one statement",
        code: `DROP TABLE IF EXISTS demo_orders CASCADE;
CREATE TABLE demo_orders (
  order_id       INT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  status         TEXT NOT NULL,
  order_total    NUMERIC(10,2) NOT NULL
);
INSERT INTO demo_orders (order_id, customer_email, status, order_total)
SELECT g,
       'buyer' || g || '@shop.example',
       CASE WHEN g % 3 = 0 THEN 'shipped'
            WHEN g % 3 = 1 THEN 'processing'
            ELSE 'pending' END,
       (g % 500) * 1.5
FROM generate_series(1, 10000) AS g;
ANALYZE demo_orders;

SELECT count(*) AS orders FROM demo_orders;`,
        result: { columns: ["orders"], rows: [
        ["10000"],
      ] },
        explain: [
          "The first line is a guard, not a mistake: DROP TABLE IF EXISTS ... CASCADE makes the block re-runnable, and on the fresh scratch schema it simply finds nothing to drop.",
          "The table is deliberately small but honest: order_id INT PRIMARY KEY (that detail matters at the end of this lesson), customer_email — the column you will search by — plus status and order_total for realism.",
          "The INSERT ... SELECT from generate_series(1, 10000) is the row factory: one row per number g, the email glued together from it, status rotating in thirds, the total cycling 0.00 to 748.50.",
          "ANALYZE samples the table and records statistics — row count, widths, how values spread — so the planner's estimates in a moment are honest rather than defaults.",
          "The count confirms the payload: 10,000 orders, every email unique. No sample database was touched: this lesson owns an empty schema, and every later block builds on this one table.",
        ],
      },
      {
        kind: "sql",
        title: "Before the index: read the plan",
        code: `EXPLAIN SELECT * FROM demo_orders
WHERE customer_email = 'buyer4242@shop.example';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Seq Scan on demo_orders  (cost=0.00..216.00 rows=1 width=40)"],
        ["  Filter: (customer_email = 'buyer4242@shop.example'::text)"],
      ] },
        explain: [
          "The answer comes back as a plan: one column, QUERY PLAN, one line per step. Line 1 names the strategy — Seq Scan on demo_orders — read the table front to back, in storage order.",
          "The numbers in parentheses are the planner's price tag: 0.00 to start, 216.00 total, in its internal cost units (disk pages plus CPU work — never seconds). rows=1 is its estimate of matching rows; width=40 the estimated average row size in bytes.",
          "Line 2 is the Filter: the condition tested against every row as it passes. buyer4242 passes the test when the scan reaches the 4,242nd row; the other 9,999 are read and discarded on the way.",
          "A sequential scan is not an insult — for a small table, or a filter that matches a large share of it, one clean sweep is genuinely the cheapest route. The planner is cost-based, not fashion-based.",
          "But the shape is the story: one row wanted, ten thousand read. Scale the same query to Meridian Trust's millions of transactions and the strategy stays identical — read everything, every single time.",
        ],
      },
      { kind: "heading", text: "The back-of-the-book trick" },
      {
        kind: "visual",
        title: "Inside a B-tree index",
        ascii: `  a B-tree index keeps the indexed
  values SORTED, with signposts on top:

           [ buyer5000 ]
          /            \\
  [ buyer2500 ]     [ buyer7500 ]
    /       \\          /       \\
   leaves: buyer0001 buyer0002 ...
   (the sorted values, each with a
    pointer to its row in the table)

  buyer4242?  start at the top:
  below 5000, above 2500 - a few
  hops land you on the leaf`,
        caption:
          "Each level of the tree halves what is left to search — 10,000 rows, and any single value is a handful of hops away. The table itself stays in arrival order; the sorted copy lives in the index.",
      },
      {
        kind: "callout",
        tone: "analogy",
        title: "The index at the back of the book",
        text: "A book's index is sorted alphabetically, so 'Jackson' is findable in seconds without reading a page: jump near the middle, see you overshot, halve, repeat — two or three jumps and you are at the entry, which hands you a page number. A database B-tree is that idea with signposts every few steps; the table itself stays in arrival order, like the book's chapters. PostgreSQL builds the whole structure for you with one statement.",
      },
      {
        kind: "sql",
        title: "CREATE INDEX — then ask the planner again",
        code: `CREATE INDEX demo_orders_email_idx ON demo_orders (customer_email);

EXPLAIN SELECT * FROM demo_orders
WHERE customer_email = 'buyer4242@shop.example';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Index Scan using demo_orders_email_idx on demo_orders  (cost=0.29..8.30 rows=1 width=40)"],
        ["  Index Cond: (customer_email = 'buyer4242@shop.example'::text)"],
      ] },
        explain: [
          "The first statement is the whole fix: CREATE INDEX, a name you choose, the table, the column to keep sorted. Omit the name and PostgreSQL invents one — demo_orders_customer_email_idx: table, column, idx.",
          "The second statement is the identical EXPLAIN — nothing about the query changed, the schema changed. And the strategy on line 1 changed with it: Index Scan using demo_orders_email_idx.",
          "Where the old plan said Filter, this one says Index Cond — the condition was answered by walking the sorted index to buyer4242, a few hops down from the top, instead of being tested against all 10,000 rows.",
          "The price tag agrees: 8.30 total versus 216.00 before — roughly twenty-six times less work on this table, bought with one statement of setup.",
          "rows=1 and width=40 are unchanged: same row, same estimate — only the route to it changed.",
        ],
      },
      { kind: "heading", text: "When the index can't help" },
      {
        kind: "sql",
        title: "A function on the column strands you",
        code: `EXPLAIN SELECT * FROM demo_orders
WHERE upper(customer_email) = 'BUYER4242@SHOP.EXAMPLE';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Seq Scan on demo_orders  (cost=0.00..241.00 rows=50 width=40)"],
        ["  Filter: (upper(customer_email) = 'BUYER4242@SHOP.EXAMPLE'::text)"],
      ] },
        explain: [
          "The index is on customer_email — but this query asks about upper(customer_email), a value computed from the column at query time. The index contains the stored values; upper(...) appears in no index, so answering the condition means computing it for every row anyway.",
          "The plan agrees: Seq Scan again, and the Filter shows the function applied row by row.",
          "Two details are worth reading. The cost rose to 241.00 — the function adds work on top of the sweep (compare 216.00 two blocks ago). And rows=50: without statistics for the expression, the planner falls back to a default guess — half a percent of the table — where the bare-equality plans said rows=1.",
          "The practical rule: when the business question allows it, compare the bare column — WHERE customer_email = '...' uses the index. There is a fix for the times it doesn't (indexing the expression itself), but that is a later lesson.",
        ],
      },
      {
        kind: "sql",
        title: "A leading wildcard has no landing zone",
        code: `EXPLAIN SELECT * FROM demo_orders
WHERE customer_email LIKE '%4242@shop.example';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Seq Scan on demo_orders  (cost=0.00..216.00 rows=1 width=40)"],
        ["  Filter: (customer_email ~~ '%4242@shop.example'::text)"],
      ] },
        explain: [
          "Exactly one row matches — buyer4242@shop.example ends in 4242@shop.example — and the planner knows it (rows=1). Yet the plan is a Seq Scan, and the email index is nowhere in sight.",
          "The Filter line prints ~~ — PostgreSQL's internal name for the LIKE operator — applied to every email's ending, row after row.",
          "The reason is the shape of the pattern. A B-tree is sorted by the START of each string: 'buyer4242...' would begin somewhere specific, but '%4242@...' could begin with anything — there is no place in the sorted order to land and start looking.",
          "In book-index terms: 'terms beginning with Q' is one jump; 'terms ending in -tion' is the whole book. The query is not wrong and not an error — it is simply a whole-table question, and the planner priced it honestly.",
        ],
      },
      {
        kind: "sql",
        title: "Anchor the pattern and the index returns",
        code: `EXPLAIN SELECT * FROM demo_orders
WHERE customer_email LIKE 'buyer4242%';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Index Scan using demo_orders_email_idx on demo_orders  (cost=0.29..8.31 rows=1 width=40)"],
        ["  Index Cond: ((customer_email >= 'buyer4242'::text) AND (customer_email < 'buyer4243'::text))"],
        ["  Filter: (customer_email ~~ 'buyer4242%'::text)"],
      ] },
        explain: [
          "Same column, same operator — the only change is the wildcard moving to the far end of the pattern. The plan flips back to Index Scan using demo_orders_email_idx.",
          "The Index Cond is the giveaway: the planner translated the anchored pattern into a range — customer_email >= 'buyer4242' AND customer_email < 'buyer4243' — exactly the kind of condition a sorted structure can walk.",
          "The Filter still applies the LIKE itself, but only to the rows the range delivered — a handful, not 10,000.",
          "So LIKE is not banned from indexes; unanchored patterns are. Where the pattern starts decides whether the index has a landing zone.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Every index is a tax on writes",
        text: "An index is a data structure the database must maintain. Every INSERT must also be written into each index; every UPDATE of an indexed column must update its entry; every DELETE must remove it. A table with ten indexes pays that tax ten times per write — which is why 'index everything just in case' is not a strategy. Index the columns your queries actually filter and join on, and let the rest stay unindexed. (The planner is not index-happy either: when a filter matches a large share of the table, it compares costs and often keeps the seq scan — thousands of index hops can genuinely cost more than one sweep.)",
      },
      { kind: "heading", text: "Primary keys come pre-indexed" },
      {
        kind: "sql",
        title: "Who created demo_orders_pkey?",
        code: `SELECT indexname FROM pg_indexes
WHERE tablename = 'demo_orders'
ORDER BY indexname;`,
        result: { columns: ["indexname"], rows: [
        ["demo_orders_email_idx"],
        ["demo_orders_pkey"],
      ] },
        explain: [
          "pg_indexes is the catalog's list of indexes; filtered to this table, it shows exactly two.",
          "demo_orders_email_idx is yours from a few blocks ago. The other, demo_orders_pkey, nobody created in this lesson — PRIMARY KEY made it the moment the table was built, back in the very first block.",
          "The naming convention <table>_pkey is automatic, the same way default index names are.",
          "UNIQUE constraints get the same treatment: a unique column is enforced through an index, so it comes with one attached.",
        ],
      },
      {
        kind: "sql",
        title: "The pkey index at work",
        code: `EXPLAIN SELECT * FROM demo_orders
WHERE order_id = 4242;`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Index Scan using demo_orders_pkey on demo_orders  (cost=0.29..8.30 rows=1 width=40)"],
        ["  Index Cond: (order_id = 4242)"],
      ] },
        explain: [
          "Index Scan using demo_orders_pkey — the same shape as the email lookup, over an index nobody had to remember to build.",
          "This is why looking a row up by its primary key is always the cheap path, on any table, in any database you will meet: the index came with the key.",
          "Index Cond: (order_id = 4242) — answered by the index, no Filter needed; and being an integer comparison, it carries none of the ::text casts the email plans showed.",
          "Fast by-id lookups are not an accident of good schema design — they are part of what PRIMARY KEY promises.",
        ],
      },
      {
        kind: "lab",
        title: "Flip one plan yourself",
        task:
          "Meridian Trust's website logs every search a visitor runs — 20,000 of them in this simulation. The starter builds search_log in the scratch schema (log ids, query codes like q-19842, a user reference) and ends with the EXPLAIN for pulling one query by its code: a sequential scan, because no index serves query yet. Add one CREATE INDEX line above the final EXPLAIN and re-run — your job is to make the plan say Index Scan.",
        code: `DROP TABLE IF EXISTS search_log CASCADE;
CREATE TABLE search_log (
  log_id    INT PRIMARY KEY,
  query     TEXT NOT NULL,
  user_ref  TEXT NOT NULL
);
INSERT INTO search_log (log_id, query, user_ref)
SELECT g,
       'q-' || lpad(g::text, 5, '0'),
       'user-' || (g % 500)
FROM generate_series(1, 20000) AS g;
ANALYZE search_log;

EXPLAIN SELECT * FROM search_log WHERE query = 'q-19842';`,
        hint:
          "CREATE INDEX search_log_query_idx ON search_log (query); — then read the new plan the way this lesson taught you: strategy on line 1, Index Cond underneath, total cost collapsed from 378.00 to 8.30. The DROP TABLE IF EXISTS CASCADE guard at the top is why you can re-run the whole lab after adding the line.",
      },
    ],
    terms: [
      { term: "Sequential scan", definition: "Read the whole table in storage order, testing the filter on every row — the no-index strategy, and genuinely cheapest for small tables or broad filters." },
      { term: "Index scan", definition: "Walk a B-tree to the matching entries, then fetch just those rows — plans read Index Scan using <index>, with an Index Cond instead of a Filter." },
      { term: "B-tree index", definition: "PostgreSQL's default index: values kept sorted in a tree of signposts, so any lookup is a few hops. Built with CREATE INDEX on a chosen column." },
      { term: "EXPLAIN", definition: "Ask the planner how it would run a query, without running it. The plan names the strategy and estimates cost (internal units, never seconds), rows and width." },
      { term: "Planner", definition: "The component that picks each query's strategy by comparing estimated costs — it is cost-based, not index-happy, and ANALYZE feeds it statistics." },
    ],
    mistakes: [
      {
        mistake: "Indexing every column 'just in case'",
        why: "Every index taxes every INSERT, UPDATE and DELETE — and an index the planner never uses is pure tax with no benefit.",
        fix: "Index the columns your queries actually filter and join on, and verify each one earns its keep with EXPLAIN.",
      },
      {
        mistake: "Writing WHERE upper(email) = '...' against an index on email",
        why: "The index holds the stored email values; upper(email) is computed at query time and appears in no index, so every row must be read and computed anyway.",
        fix: "Compare the bare column when the question allows it; when it doesn't, the expression itself can be indexed (a later lesson).",
      },
      {
        mistake: "Expecting LIKE '%thing' to use the B-tree index",
        why: "A B-tree is sorted by the start of each string — a pattern with no starting point has no landing zone in that order.",
        fix: "Anchor patterns at the start when the business question allows ('thing%' can use the index); otherwise accept that it is a whole-table question.",
      },
      {
        mistake: "Adding an index and assuming the query got faster",
        why: "You have not checked what the planner actually does — on small tables or broad filters it may rightly keep the sequential scan.",
        fix: "EXPLAIN before and after; the plan is the only honest evidence that the index changed anything.",
      },
    ],
    takeaways: [
      "Without an index, a filtered lookup is a sequential scan: every row read, most of them discarded.",
      "A B-tree keeps the indexed column sorted so a lookup is a few hops — CREATE INDEX buys that in one statement.",
      "EXPLAIN is free and honest: strategy, cost, rows, width — read it before and after every index you add.",
      "The index only speaks its own language: bare-column comparisons and start-anchored patterns — functions and leading wildcards strand you in a scan.",
      "Every index taxes writes; primary keys (and UNIQUE constraints) get theirs automatically.",
    ],
    quiz: [
      {
        id: "i-05-q1",
        prompt: "EXPLAIN shows: Seq Scan on demo_orders (cost=0.00..216.00 rows=1 width=40) with a Filter on customer_email = '...'. What is the database doing?",
        options: [
          { text: "Reading every row in the table, keeping the ones that pass the Filter", correct: true, feedback: "Correct — a sequential scan is a full sweep: every row read, most of them discarded." },
          { text: "Jumping through a sorted structure straight to the matching row", correct: false, feedback: "That is an index scan — the strategy only flips to it after CREATE INDEX." },
          { text: "Reading rows until the first match, then stopping", correct: false, feedback: "It cannot stop early: further matching rows could sit anywhere in the table." },
          { text: "Sampling a few rows to estimate the answer", correct: false, feedback: "Sampling is ANALYZE's job, feeding the planner — it is not how queries get answered." },
        ],
        explanation: "A sequential scan is the no-index strategy: read the whole table in storage order and test the Filter on every row. Cheap for a village, ruinous for a city.",
      },
      {
        id: "i-05-q2",
        prompt: "An index exists on demo_orders (customer_email). Which lookup can it NOT serve — the plan stays a Seq Scan?",
        options: [
          { text: "WHERE customer_email = 'buyer4242@shop.example'", correct: false, feedback: "Served: a bare-column equality is exactly what a B-tree answers — the plan flips to Index Scan." },
          { text: "WHERE upper(customer_email) = 'BUYER4242@SHOP.EXAMPLE'", correct: true, feedback: "Correct — upper(customer_email) is computed per row and appears in no index; the sweep returns." },
          { text: "WHERE customer_email LIKE 'buyer4242%'", correct: false, feedback: "Served: the anchored pattern becomes a range the sorted index can walk." },
          { text: "WHERE customer_email = 'buyer99@shop.example'", correct: false, feedback: "Served the same as any bare-column equality — the value differs, the route does not." },
        ],
        explanation: "The index contains the stored values of customer_email, sorted. Anything computed at query time — a function around the column, a pattern with no starting point — exists nowhere in the index.",
      },
      {
        id: "i-05-q3",
        prompt: "demo_orders carries PRIMARY KEY (order_id) plus the index you built on customer_email. A job inserts 1,000 new orders. What do the indexes cost?",
        options: [
          { text: "Every insert must also be written into both indexes — reads got faster, writes got slower", correct: true, feedback: "Correct — that is the trade: each index is one more structure to maintain on every write." },
          { text: "Nothing: indexes only affect SELECT statements", correct: false, feedback: "INSERTs must add entries to every index; UPDATEs and DELETEs maintain them too." },
          { text: "Only the primary key index is maintained; the email index fills in later", correct: false, feedback: "No index catches up on its own — all of them are updated as part of the write itself." },
          { text: "The inserts fail until the indexes are dropped", correct: false, feedback: "They run fine — slower, not broken. Indexes charge rent; they do not close the door." },
        ],
        explanation: "Fast lookups are bought with slower writes. Primary keys pay the cost automatically (their index comes with the key); every index you add by hand is a cost you chose — make sure a query is paying you back.",
      },
    ],
  }
  ],
  exercises: [

  {
    id: "i-b1",
    tier: "beginner",
    mode: "sql",
    title: "The top of the pay ladder",
    prompt: "HeliosWorks' leadership review opens with the top of the pay ladder. List the five highest-paid CURRENT employees (terminated IS NULL), highest salary first: employee (first name and last name joined with a single space), job_title and salary. Build it the way i-01 taught: number the current staff with row_number() OVER (ORDER BY salary DESC) inside a subquery, then keep rn <= 5 from the outside — filtering on a window column in the same query level's WHERE is the trap. Order the final result by that number. Expected columns: employee, job_title, salary.",
    dataset: "hr",
    sampleTables: ["employees"],
    hint: "Compute the number in the inner query, filter rn <= 5 in the outer WHERE — WHERE runs before window functions, so it cannot see the number you are filtering on.",
    starter: `SELECT employee, job_title, salary
FROM (SELECT first_name || ' ' || last_name AS employee,
             job_title,
             salary,
             -- rn: row_number() OVER (ORDER BY salary DESC)
      FROM employees
      WHERE terminated IS NULL) ranked
-- WHERE rn <= 5
ORDER BY rn;
`,
    solution: `SELECT employee, job_title, salary
FROM (SELECT first_name || ' ' || last_name AS employee,
             job_title,
             salary,
             row_number() OVER (ORDER BY salary DESC) AS rn
      FROM employees
      WHERE terminated IS NULL) ranked
WHERE rn <= 5
ORDER BY rn;`,
    ordered: true,
    expected: { columns: ["employee", "job_title", "salary"], rows: [
        ["Amara Osei", "Chief Executive Officer", "385000.00"],
        ["Daniel Kramer", "VP of Engineering", "245000.00"],
        ["Sofia Mancini", "VP of Sales", "232000.00"],
        ["Priya Nair", "VP of Product", "228000.00"],
        ["Lena Hoffman", "Engineering Manager", "198000.00"],
      ] },
    explanation:
      "The inner query does three jobs: it builds the name label, filters to current staff (Peter Novak and Lucia Moreno drop out of the picture), and numbers everyone by salary descending. The outer query keeps rn <= 5 — legal only because the window column already exists by then — and orders by it. The ladder reads Amara Osei ($385,000, the CEO), Daniel Kramer ($245,000), Sofia Mancini ($232,000), Priya Nair ($228,000) and Lena Hoffman ($198,000). Writing WHERE row_number() ... <= 5 in one level would fail with 'window functions are not allowed in WHERE' — the subquery is the fix, and it is the same shape every top-N query will wear for the rest of the course.",
    concepts: ["row_number", "top-N", "subquery filtering"],
  },
  {
    id: "i-b2",
    tier: "beginner",
    mode: "sql",
    title: "Three ways to rank the catalog",
    prompt: "ShopSphere's merchandising team wants to see the three ranking functions disagree, side by side. For the twelve cheapest products, return name, price, rn (row_number, ordered by price then product_id, so ties still get distinct numbers), rnk (rank, ordered by price alone) and drnk (dense_rank, ordered by price alone). Two products share 79.00 and two share 129.00 — watch where row_number splits the tie, rank repeats the number and skips, and dense_rank repeats without skipping. Order the result by rn. Expected columns: name, price, rn, rnk, drnk.",
    dataset: "ecommerce",
    sampleTables: ["products"],
    hint: "Only row_number needs the product_id tiebreaker inside its OVER — rank and dense_rank want the bare price, so the tie stays visible to them.",
    starter: `SELECT name,
       price,
       -- rn:   row_number() OVER (ORDER BY price, product_id)
       -- rnk:  rank()       OVER (ORDER BY price)
       -- drnk: dense_rank() OVER (ORDER BY price)
FROM products
-- ORDER BY rn
LIMIT 12;
`,
    solution: `SELECT name, price,
       row_number() OVER (ORDER BY price, product_id) AS rn,
       rank()       OVER (ORDER BY price) AS rnk,
       dense_rank() OVER (ORDER BY price) AS drnk
FROM products
ORDER BY rn
LIMIT 12;`,
    ordered: true,
    expected: { columns: ["name", "price", "rn", "rnk", "drnk"], rows: [
        ["MoodLight Strip 5m", "29.00", "1", "1", "1"],
        ["SmartPlug 4-Pack", "39.00", "2", "2", "2"],
        ["FlexStand Aluminum Dock", "49.00", "3", "3", "3"],
        ["ChargeHub 100W GaN", "59.00", "4", "4", "4"],
        ["ProPad Elite Controller", "69.00", "5", "5", "5"],
        ["TravelPod Tripod Kit", "79.00", "6", "6", "6"],
        ["TrailBack 25L Backpack", "79.00", "7", "6", "6"],
        ["BassStation Mini Speaker", "89.00", "8", "8", "7"],
        ["HomeEye Indoor Camera", "89.00", "9", "8", "7"],
        ["PulseFit SE Tracker", "99.00", "10", "10", "8"],
        ["SoundCore Lite Earbuds", "129.00", "11", "11", "9"],
        ["WaveRider Waterproof Buds", "129.00", "12", "11", "9"],
      ] },
    explanation:
      "All three functions walk the same twelve cheapest products, but each answers the tie question differently at 79.00: row_number must pick an order — TravelPod Tripod Kit is product 16, TrailBack 25L Backpack is 23, so they get 6 and 7, and the product_id tiebreaker makes that deterministic. rank() declares the two equal: both 6, and the next price (89.00) lands on 8, one row's worth of positions skipped. dense_rank() also ties them at 6 but lets 89.00 be 7 — no skipping. The 129.00 pair repeats the story: 11 and 12 for row_number, 11 and 11 for rank, 9 and 9 for dense_rank. Pick the function whose tie policy matches the report.",
    concepts: ["row_number", "rank", "dense_rank", "ties"],
  },
  {
    id: "i-b3",
    tier: "beginner",
    mode: "sql",
    title: "Numbering the ledger",
    prompt: "Meridian Trust's statement printer numbers every ledger entry 1, 2, 3 — but the raw table's txn_id is a global counter across all accounts, useless as a statement line number. For account 1 only, return txn_id, occurred_at, txn_type, amount and entry_no: a fresh 1..N numbering of that account's transactions in chronological order, built with row_number() OVER (ORDER BY occurred_at, txn_id) — txn_id is there as the tiebreaker, in case two transactions share a timestamp. Order by entry_no and take the first eight rows. Expected columns: txn_id, occurred_at, txn_type, amount, entry_no.",
    dataset: "banking",
    sampleTables: ["transactions"],
    hint: "No PARTITION BY needed here — the WHERE account_id = 1 has already narrowed the world to one account; just put the ordering inside the OVER.",
    starter: `SELECT txn_id,
       occurred_at,
       txn_type,
       amount,
       -- entry_no: row_number() OVER (ORDER BY occurred_at, txn_id)
FROM transactions
WHERE account_id = 1
-- ORDER BY entry_no
LIMIT 8;
`,
    solution: `SELECT txn_id, occurred_at, txn_type, amount,
       row_number() OVER (ORDER BY occurred_at, txn_id) AS entry_no
FROM transactions
WHERE account_id = 1
ORDER BY entry_no
LIMIT 8;`,
    ordered: true,
    expected: { columns: ["txn_id", "occurred_at", "txn_type", "amount", "entry_no"], rows: [
        ["1", "2026-01-05 09:15:00", "deposit", "2500.00", "1"],
        ["2", "2026-01-08 14:30:00", "withdrawal", "820.00", "2"],
        ["3", "2026-01-20 09:16:00", "deposit", "2500.00", "3"],
        ["4", "2026-01-31 23:59:00", "fee", "5.00", "4"],
        ["5", "2026-02-04 18:20:00", "withdrawal", "640.50", "5"],
        ["6", "2026-02-20 09:14:00", "deposit", "2500.00", "6"],
        ["7", "2026-03-02 10:40:00", "withdrawal", "985.00", "7"],
        ["8", "2026-03-15 11:00:00", "transfer_out", "1500.00", "8"],
      ] },
    explanation:
      "The WHERE clause runs before the window function ever sees a row, so by the time row_number() starts counting, only account 1's 28 transactions remain — no PARTITION BY needed, the filter has already done the dividing. Inside the OVER, occurred_at orders the entries chronologically and txn_id is the tiebreaker. The first eight entries tell January through mid-March: payroll deposits of $2,500.00 alternating with the ATM withdrawal, the insurance premium and the transfer to savings. entry_no is pure computation — the statement's 1, 2, 3 exists only in this query, never in the table.",
    concepts: ["row_number", "ORDER BY inside OVER"],
  },
  {
    id: "i-b4",
    tier: "beginner",
    mode: "sql",
    title: "The class-size leaderboard",
    prompt: "Northgate University's registrar is planning room assignments and wants every course ranked by capacity, largest first. Return code, title, capacity and size_rank: rank() OVER (ORDER BY capacity DESC), so courses that tie share a rank and the next rank skips — HIST 110 and MATH 201 both seat 100. Order by size_rank, then by code alphabetically to break the ties, and take the first twelve rows. Expected columns: code, title, capacity, size_rank.",
    dataset: "university",
    sampleTables: ["courses"],
    hint: "rank(), not row_number() — the point of this board is that equal capacities earn equal ranks; capacity DESC inside the OVER, size_rank then code outside it.",
    starter: `SELECT code,
       title,
       capacity,
       -- size_rank: rank() OVER (ORDER BY capacity DESC)
FROM courses
-- ORDER BY size_rank, code
LIMIT 12;
`,
    solution: `SELECT code, title, capacity,
       rank() OVER (ORDER BY capacity DESC) AS size_rank
FROM courses
ORDER BY size_rank, code
LIMIT 12;`,
    ordered: true,
    expected: { columns: ["code", "title", "capacity", "size_rank"], rows: [
        ["MATH 101", "Calculus I", "150", "1"],
        ["ECON 101", "Principles of Microeconomics", "140", "2"],
        ["CS 101", "Introduction to Programming", "120", "3"],
        ["PHYS 101", "Classical Mechanics", "110", "4"],
        ["HIST 110", "World History to 1500", "100", "5"],
        ["MATH 201", "Linear Algebra", "100", "5"],
        ["BIO 120", "Cell Biology", "95", "7"],
        ["CS 201", "Data Structures", "90", "8"],
        ["ECON 210", "Statistics for Economists", "85", "9"],
        ["CS 220", "Computer Systems", "80", "10"],
        ["MATH 310", "Probability and Statistics", "80", "10"],
        ["CS 301", "Databases", "70", "12"],
      ] },
    explanation:
      "rank() OVER (ORDER BY capacity DESC) walks the catalog biggest-first and hands equal capacities equal numbers. MATH 101 (150) stands alone at 1, and the tie arrives at 100: HIST 110 and MATH 201 share rank 5, so BIO 120 (95) lands on 7, not 6 — rank counts rows, and two rows stand ahead of it. The same happens at 80, where CS 220 and MATH 310 share rank 10 and CS 301 (70) takes 12. row_number() would have split both ties arbitrarily; dense_rank() would have closed the gaps (5, 6, 7 ...). For room planning, sharing is the honest answer — two courses of identical size are the same size.",
    concepts: ["rank", "ties", "gaps"],
  },
  {
    id: "i-i1",
    tier: "intermediate",
    mode: "sql",
    title: "Two leaders per department",
    prompt: "HeliosWorks' compensation review wants the two highest-paid CURRENT employees (terminated IS NULL) of every department — each department's leadership pair. Number the current staff per department with row_number() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) inside a subquery over employees JOINed to departments (for the department name), then keep rn <= 2 from outside. Return department, employee (first and last name joined with one space), job_title and salary, ordered by department alphabetically with the top earner first inside each. Data, Executive and People Ops have a single current member — they contribute one row each. Expected columns: department, employee, job_title, salary.",
    dataset: "hr",
    sampleTables: ["employees", "departments"],
    hint: "PARTITION BY e.dept_id restarts the numbering in every department; the rn <= 2 filter lives in the outer query, exactly like the top-5 in i-b1.",
    starter: `SELECT department, employee, job_title, salary
FROM (SELECT d.name AS department,
             e.first_name || ' ' || e.last_name AS employee,
             e.job_title,
             e.salary,
             -- rn: row_number() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC)
      FROM employees e
      JOIN departments d ON d.dept_id = e.dept_id
      WHERE e.terminated IS NULL) ranked
-- WHERE rn <= 2
ORDER BY department, rn;
`,
    solution: `SELECT department, employee, job_title, salary
FROM (SELECT d.name AS department,
             e.first_name || ' ' || e.last_name AS employee,
             e.job_title,
             e.salary,
             row_number() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rn
      FROM employees e
      JOIN departments d ON d.dept_id = e.dept_id
      WHERE e.terminated IS NULL) ranked
WHERE rn <= 2
ORDER BY department, rn;`,
    ordered: true,
    expected: { columns: ["department", "employee", "job_title", "salary"], rows: [
        ["Customer Success", "Beatrice Laurent", "Customer Success Manager", "124000.00"],
        ["Customer Success", "Sam Whitfield", "Support Specialist", "76000.00"],
        ["Data", "Tara Singh", "Analytics Engineer", "141000.00"],
        ["Engineering", "Daniel Kramer", "VP of Engineering", "245000.00"],
        ["Engineering", "Lena Hoffman", "Engineering Manager", "198000.00"],
        ["Executive", "Amara Osei", "Chief Executive Officer", "385000.00"],
        ["Marketing", "Freya Johansson", "Marketing Manager", "156000.00"],
        ["Marketing", "Omar Haddad", "Content Strategist", "108000.00"],
        ["People Ops", "Gerald Weiss", "Head of People", "175000.00"],
        ["Product", "Priya Nair", "VP of Product", "228000.00"],
        ["Product", "Robert McAllister", "Principal Product Manager", "186000.00"],
        ["Sales", "Sofia Mancini", "VP of Sales", "232000.00"],
        ["Sales", "Kevin O'Brien", "Enterprise Account Exec", "142000.00"],
      ] },
    explanation:
      "PARTITION BY e.dept_id cuts the 28 current employees into eight windows, and row_number() builds a private ladder inside each: Engineering's 12 people get 1..12, Sales' four get 1..4. The outer rn <= 2 keeps each department's top two — Engineering sends VP Daniel Kramer ($245,000.00) and Engineering Manager Lena Hoffman ($198,000.00); Sales sends Sofia Mancini and Kevin O'Brien. The single-member departments (Data's Tara Singh, Executive's Amara Osei, People Ops' Gerald Weiss) keep their only row, because rn 1 survives any cutoff. Thirteen rows, every department represented — the top-N-per-group shape that a plain LIMIT can never produce.",
    concepts: ["PARTITION BY", "top-N per group", "row_number"],
  },
  {
    id: "i-i2",
    tier: "intermediate",
    mode: "sql",
    title: "The running balance, audited",
    prompt: "Meridian Trust's auditors want proof that account 25's stored balance_after column really is a running total. Recompute it yourself: for account 25 only, return occurred_at, txn_type, amount, running_balance and balance_after, where running_balance is a window sum over the signed amount — deposits and transfer_in count positive, withdrawals, transfer_out and fees count negative (a CASE inside sum(), then sum(...) OVER (ORDER BY occurred_at, txn_id)) — rounded to 2 decimals. Order chronologically. If the audit passes, the two balance columns agree on every row. Expected columns: occurred_at, txn_type, amount, running_balance, balance_after.",
    dataset: "banking",
    sampleTables: ["transactions"],
    hint: "sum() OVER (ORDER BY ...) grows row by row — each row sees every earlier row plus itself; the CASE picks the sign before the sum ever sees the amount.",
    starter: `SELECT occurred_at,
       txn_type,
       amount,
       -- running_balance: round(sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
       --                                THEN amount ELSE -amount END)
       --                       OVER (ORDER BY occurred_at, txn_id), 2)
       balance_after
FROM transactions
WHERE account_id = 25
ORDER BY occurred_at, txn_id;
`,
    solution: `SELECT occurred_at, txn_type, amount,
       round(sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
                      THEN amount ELSE -amount END)
             OVER (ORDER BY occurred_at, txn_id), 2) AS running_balance,
       balance_after
FROM transactions
WHERE account_id = 25
ORDER BY occurred_at, txn_id;`,
    ordered: true,
    expected: { columns: ["occurred_at", "txn_type", "amount", "running_balance", "balance_after"], rows: [
        ["2026-01-10 09:00:00", "deposit", "3200.00", "3200.00", "3200.00"],
        ["2026-02-01 08:55:00", "withdrawal", "1560.00", "1640.00", "1640.00"],
        ["2026-02-10 09:00:00", "deposit", "3200.00", "4840.00", "4840.00"],
        ["2026-02-28 17:25:00", "withdrawal", "890.00", "3950.00", "3950.00"],
        ["2026-03-10 09:01:00", "deposit", "3200.00", "7150.00", "7150.00"],
        ["2026-03-25 14:40:00", "withdrawal", "3451.75", "3698.25", "3698.25"],
      ] },
    explanation:
      "The CASE signs each amount before the window ever sees it: deposits and incoming transfers stay positive, withdrawals, outgoing transfers and fees flip negative — so the window sum accumulates money the way a balance moves. With ORDER BY occurred_at, txn_id inside the OVER, the frame grows row by row: 3200.00 after the first payroll deposit, 1640.00 after February's rent, then 4840.00, 3950.00, 7150.00 and finally 3698.25 after the tax payment. Every step matches the stored balance_after — account 25 opened at zero, so the audit passes on all six rows. That is exactly how a bank proves such a column honest: recompute it, compare, repeat.",
    concepts: ["running totals", "sum OVER", "CASE signs"],
  },
  {
    id: "i-i3",
    tier: "intermediate",
    mode: "sql",
    title: "Raises of twenty thousand and up",
    prompt: "HeliosWorks' finance team is reviewing the big salary moves. The salaries table keeps effective-dated history (an employee can appear several times), and a raise is each amount minus that employee's previous amount — lag(s.amount) OVER (PARTITION BY employee_id ORDER BY effective). In a CTE over salaries JOINed to employees (for the name), build employee (first and last name joined with one space), effective, previous_amount and raise, giving the window a name with WINDOW w AS (...) so both lag references share it. Then, from outside the CTE, keep only the rows where raise >= 20000, ordered by raise descending and employee alphabetically for ties. Expected columns: employee, effective, previous_amount, raise.",
    dataset: "hr",
    sampleTables: ["salaries", "employees"],
    hint: "lag() returns NULL on each employee's first salary row, and NULL >= 20000 is NULL — the outer WHERE quietly does the cleanup for you.",
    starter: `WITH raises AS (
  SELECT e.first_name || ' ' || e.last_name AS employee,
         s.effective,
         -- previous_amount: lag(s.amount) OVER w
         -- raise: s.amount - lag(s.amount) OVER w
  FROM salaries s
  JOIN employees e ON e.employee_id = s.employee_id
  -- WINDOW w AS (PARTITION BY s.employee_id ORDER BY s.effective)
)
SELECT employee, effective, previous_amount, raise
FROM raises
-- WHERE raise >= 20000
ORDER BY raise DESC, employee;
`,
    solution: `WITH raises AS (
  SELECT e.first_name || ' ' || e.last_name AS employee,
         s.effective,
         lag(s.amount) OVER w AS previous_amount,
         s.amount - lag(s.amount) OVER w AS raise
  FROM salaries s
  JOIN employees e ON e.employee_id = s.employee_id
  WINDOW w AS (PARTITION BY s.employee_id ORDER BY s.effective)
)
SELECT employee, effective, previous_amount, raise
FROM raises
WHERE raise >= 20000
ORDER BY raise DESC, employee;`,
    ordered: true,
    expected: { columns: ["employee", "effective", "previous_amount", "raise"], rows: [
        ["Amara Osei", "2020-01-01", "290000.00", "50000.00"],
        ["Amara Osei", "2024-01-01", "340000.00", "45000.00"],
        ["James Okoro", "2024-01-01", "135000.00", "27000.00"],
        ["Marcus Tran", "2023-07-01", "168000.00", "24000.00"],
        ["Daniel Kramer", "2021-01-01", "205000.00", "23000.00"],
        ["Gerald Weiss", "2023-01-01", "152000.00", "23000.00"],
        ["Freya Johansson", "2024-01-01", "134000.00", "22000.00"],
        ["Ingrid Sorensen", "2024-01-01", "128000.00", "21000.00"],
        ["Chloe Dubois", "2024-01-01", "132000.00", "20000.00"],
        ["Kevin O'Brien", "2024-07-01", "122000.00", "20000.00"],
      ] },
    explanation:
      "The CTE walks each employee's salary history with lag(s.amount) OVER w — partitioned per employee so histories never bleed into each other, ordered by effective so 'previous' always means 'earlier'. The WINDOW clause names that definition once and both lag references share it. Every employee's first salary row has nothing behind it, so previous_amount and raise are NULL there — and NULL >= 20000 is NULL, which the outer WHERE treats as not-true: the first-salary rows drop out without a special filter. Ten raises clear the bar. Amara Osei owns the top two — $50,000.00 in 2020 (from $290,000.00 to $340,000.00) and $45,000.00 in 2024 — and the list closes with Chloe Dubois and Kevin O'Brien landing exactly on $20,000.00.",
    concepts: ["lag", "WINDOW clause", "CTE"],
  },
  {
    id: "i-i4",
    tier: "intermediate",
    mode: "sql",
    title: "CS majors against the major average",
    prompt: "Northgate's advising office wants each Computer Science major (major_dept_id = 1) compared with the CS average GPA. Return student (first and last name joined with one space), gpa, major_avg and above_major_avg, where major_avg is avg(gpa) OVER (PARTITION BY major_dept_id) rounded to 2 decimals — no ORDER BY inside the OVER, so the frame spans the whole partition — and above_major_avg is gpa > that same window average (a boolean). avg() skips NULL GPAs. Order by gpa descending with NULLS LAST, then student_id. Talia Mizrahi is a freshman with a NULL gpa; she stays in the list with NULL flags. Expected columns: student, gpa, major_avg, above_major_avg.",
    dataset: "university",
    sampleTables: ["students"],
    hint: "No ORDER BY inside this OVER — with one, the average would turn into a running average. And NULLS LAST is what keeps the freshman at the bottom of a DESC sort.",
    starter: `SELECT s.first_name || ' ' || s.last_name AS student,
       s.gpa,
       -- major_avg: round(avg(s.gpa) OVER (PARTITION BY s.major_dept_id), 2)
       -- above_major_avg: s.gpa > avg(s.gpa) OVER (PARTITION BY s.major_dept_id)
FROM students s
WHERE s.major_dept_id = 1
-- ORDER BY s.gpa DESC NULLS LAST, s.student_id
`,
    solution: `SELECT s.first_name || ' ' || s.last_name AS student,
       s.gpa,
       round(avg(s.gpa) OVER (PARTITION BY s.major_dept_id), 2) AS major_avg,
       s.gpa > avg(s.gpa) OVER (PARTITION BY s.major_dept_id) AS above_major_avg
FROM students s
WHERE s.major_dept_id = 1
ORDER BY s.gpa DESC NULLS LAST, s.student_id;`,
    ordered: true,
    expected: { columns: ["student", "gpa", "major_avg", "above_major_avg"], rows: [
        ["Alice Bennett", "3.82", "3.44", "true"],
        ["Jonah Reyes", "3.65", "3.44", "true"],
        ["Dev Malhotra", "3.41", "3.44", "false"],
        ["Adrian Costa", "3.20", "3.44", "false"],
        ["Omar Haddadi", "3.12", "3.44", "false"],
        ["Talia Mizrahi", null, "3.44", null],
      ] },
    explanation:
      "avg(gpa) OVER (PARTITION BY major_dept_id) is GROUP BY's number without GROUP BY's collapse: one average per major, repeated beside every row. The CS average is 3.44, computed over the five majors who have grades — avg() skips Talia Mizrahi's NULL exactly as it would under GROUP BY. Alice Bennett (3.82) and Jonah Reyes (3.65) carry true; Dev Malhotra (3.41), Adrian Costa (3.20) and Omar Haddadi (3.12) carry false. Talia's row is the subtlety: NULL > 3.44 is NULL, not false, so above_major_avg reads NULL — and NULLS LAST parks her beneath the descending GPAs instead of PostgreSQL's default NULLS FIRST. This is the report GROUP BY could never write: the group's number and the member's row in one result.",
    concepts: ["window aggregates", "avg OVER", "NULL comparisons"],
  },
  {
    id: "i-a1",
    tier: "advanced",
    mode: "sql",
    title: "The three biggest raises ever",
    prompt: "HeliosWorks' board deck cites the three largest salary increases in company history. Start from salaries JOINed to employees (for the name) and compute each row's raise as s.amount - lag(s.amount) OVER w, with WINDOW w AS (PARTITION BY s.employee_id ORDER BY s.effective) — inside a subquery. From outside it, drop the first-salary rows with WHERE raise IS NOT NULL, order by raise descending (employee alphabetically for ties) and take the top three. Return employee, effective, previous_amount and raise. Expected columns: employee, effective, previous_amount, raise.",
    dataset: "hr",
    sampleTables: ["salaries", "employees"],
    hint: "The podium twist on i-i3: same lag window, but WHERE raise IS NOT NULL, ORDER BY raise DESC, LIMIT 3 — all in the outer query.",
    starter: `SELECT employee, effective, previous_amount, raise
FROM (SELECT e.first_name || ' ' || e.last_name AS employee,
             s.effective,
             -- previous_amount: lag(s.amount) OVER w
             -- raise: s.amount - lag(s.amount) OVER w
      FROM salaries s
      JOIN employees e ON e.employee_id = s.employee_id
      -- WINDOW w AS (PARTITION BY s.employee_id ORDER BY s.effective)
     ) raises
-- WHERE raise IS NOT NULL
ORDER BY raise DESC, employee
LIMIT 3;
`,
    solution: `SELECT employee, effective, previous_amount, raise
FROM (SELECT e.first_name || ' ' || e.last_name AS employee,
             s.effective,
             lag(s.amount) OVER w AS previous_amount,
             s.amount - lag(s.amount) OVER w AS raise
      FROM salaries s
      JOIN employees e ON e.employee_id = s.employee_id
      WINDOW w AS (PARTITION BY s.employee_id ORDER BY s.effective)) raises
WHERE raise IS NOT NULL
ORDER BY raise DESC, employee
LIMIT 3;`,
    ordered: true,
    expected: { columns: ["employee", "effective", "previous_amount", "raise"], rows: [
        ["Amara Osei", "2020-01-01", "290000.00", "50000.00"],
        ["Amara Osei", "2024-01-01", "340000.00", "45000.00"],
        ["James Okoro", "2024-01-01", "135000.00", "27000.00"],
      ] },
    explanation:
      "Same lag machinery as the threshold version, now aimed at a podium. The subquery walks every salary history (the WINDOW clause names the frame once, both lag references share it), so every real raise exists as a row; WHERE raise IS NOT NULL — outside, as always — drops each employee's first salary, where lag finds no predecessor. ORDER BY raise DESC sorts the raises themselves and LIMIT 3 takes the podium: Amara Osei's $50,000.00 CEO raise (effective 2020-01-01, from $290,000.00 to $340,000.00), her own $45,000.00 follow-up four years later, and James Okoro's $27,000.00 promotion to $162,000.00. Two of the three belong to the same employee — a 'best raise per employee' GROUP BY would have hidden one of them; the window keeps every event.",
    concepts: ["lag", "top-N", "WINDOW clause"],
  },
  {
    id: "i-a2",
    tier: "advanced",
    mode: "sql",
    title: "Every account's worst moment",
    prompt: "Meridian Trust's risk team wants each account's single largest balance drop. Build it in two CTE stages. First deltas: every transaction with txn_id, account_id, occurred_at, description and delta = balance_after - lag(balance_after) OVER (PARTITION BY account_id ORDER BY occurred_at, txn_id). Then ranked: the rows whose delta IS NOT NULL (accounts with a single transaction drop out), numbered with row_number() OVER (PARTITION BY account_id ORDER BY delta) — so rn = 1 is each account's most negative step. Join accounts for account_type, keep rn = 1, and order by delta ascending (biggest drop first), account_id for ties. Expected columns: account_id, account_type, occurred_at, description, delta.",
    dataset: "banking",
    sampleTables: ["transactions", "accounts"],
    hint: "Two windows in two CTEs: lag() makes the deltas, row_number() per account finds each account's most negative one; the final JOIN only fetches account_type.",
    starter: `WITH deltas AS (
  SELECT txn_id, account_id, occurred_at, description,
         -- delta: balance_after - lag(balance_after)
         --        OVER (PARTITION BY account_id ORDER BY occurred_at, txn_id)
  FROM transactions
),
ranked AS (
  SELECT account_id, occurred_at, description, delta,
         -- rn: row_number() OVER (PARTITION BY account_id ORDER BY delta)
  FROM deltas
  WHERE delta IS NOT NULL
)
SELECT a.account_id, a.account_type, r.occurred_at, r.description, r.delta
FROM ranked r
JOIN accounts a ON a.account_id = r.account_id
WHERE r.rn = 1
ORDER BY r.delta, a.account_id;
`,
    solution: `WITH deltas AS (
  SELECT txn_id, account_id, occurred_at, description,
         balance_after - lag(balance_after) OVER (PARTITION BY account_id ORDER BY occurred_at, txn_id) AS delta
  FROM transactions
),
ranked AS (
  SELECT account_id, occurred_at, description, delta,
         row_number() OVER (PARTITION BY account_id ORDER BY delta) AS rn
  FROM deltas
  WHERE delta IS NOT NULL
)
SELECT a.account_id, a.account_type, r.occurred_at, r.description, r.delta
FROM ranked r
JOIN accounts a ON a.account_id = r.account_id
WHERE r.rn = 1
ORDER BY r.delta, a.account_id;`,
    ordered: true,
    expected: { columns: ["account_id", "account_type", "occurred_at", "description", "delta"], rows: [
        ["17", "checking", "2026-08-20 09:50:00", "Charitable donation", "-3900.00"],
        ["25", "checking", "2026-03-25 14:40:00", "Tax payment", "-3451.75"],
        ["4", "checking", "2026-09-13 18:40:00", "Appliance purchase", "-3400.00"],
        ["1", "checking", "2026-08-05 19:30:00", "Tuition payment", "-2500.00"],
        ["22", "checking", "2026-04-21 20:40:00", "Rent (overdraft)", "-1820.00"],
        ["6", "checking", "2026-05-20 16:30:00", "Phone purchase", "-950.00"],
        ["20", "checking", "2026-04-02 12:30:00", "Phone bill", "-155.00"],
      ] },
    explanation:
      "Two windows, two CTEs, one row per account. Stage one walks each account's ledger in order (occurred_at, with txn_id as tiebreaker) and subtracts the previous balance_after — the first transaction of every account has nothing behind it, so its delta is NULL. Stage two numbers the surviving deltas per account, smallest first: row_number() OVER (PARTITION BY account_id ORDER BY delta) pins rn = 1 onto each account's most negative step. Nine accounts have transactions; the two savings accounts (2 and 28) hold a single transfer each, so their NULL deltas drop out and seven checking accounts survive. The drops run from account 17's $3,900.00 charitable donation through account 22's overdraft-driving $1,820.00 rent down to account 20's $155.00 phone bill — the JOIN at the end only fetches account_type.",
    concepts: ["lag", "row_number", "CTE pipeline"],
  },
  {
    id: "i-a3",
    tier: "advanced",
    mode: "sql",
    title: "Every customer's second order",
    prompt: "ShopSphere's marketing team wants to thank repeat customers: for every customer who has placed at least two orders, list their SECOND order. Number each customer's orders with row_number() OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) — order_id breaks same-timestamp ties — inside a subquery over orders JOINed to customers (for the name). Keep rn = 2 from outside, order by order_date then order_id, and take the first eight rows. Orders of any status count: a pending or cancelled order is still an order in the sequence. Return customer (first and last name joined with one space), order_id, order_date and total. Expected columns: customer, order_id, order_date, total.",
    dataset: "ecommerce",
    sampleTables: ["orders", "customers"],
    hint: "PARTITION BY o.customer_id restarts the numbering at every customer; ORDER BY o.order_date, o.order_id makes 'second' mean 'second in time'.",
    starter: `SELECT customer, order_id, order_date, total
FROM (SELECT cu.first_name || ' ' || cu.last_name AS customer,
             o.order_id,
             o.order_date,
             o.total,
             -- rn: row_number() OVER (PARTITION BY o.customer_id
             --                        ORDER BY o.order_date, o.order_id)
      FROM orders o
      JOIN customers cu ON cu.customer_id = o.customer_id) numbered
-- WHERE rn = 2
ORDER BY order_date, order_id
LIMIT 8;
`,
    solution: `SELECT customer, order_id, order_date, total
FROM (SELECT cu.first_name || ' ' || cu.last_name AS customer,
             o.order_id, o.order_date, o.total,
             row_number() OVER (PARTITION BY o.customer_id ORDER BY o.order_date, o.order_id) AS rn
      FROM orders o
      JOIN customers cu ON cu.customer_id = o.customer_id) numbered
WHERE rn = 2
ORDER BY order_date, order_id
LIMIT 8;`,
    ordered: true,
    expected: { columns: ["customer", "order_id", "order_date", "total"], rows: [
        ["Amelia Watson", "5", "2024-04-20 14:25:00", "129.00"],
        ["Marcus Chen", "10", "2024-07-22 11:20:00", "1499.00"],
        ["Priya Sharma", "13", "2024-09-12 13:50:00", "329.00"],
        ["Diego Alvarez", "15", "2024-10-14 18:15:00", "79.00"],
        ["Hannah Kowalski", "17", "2024-11-20 16:55:00", "99.00"],
        ["Tom Fletcher", "21", "2025-02-02 09:25:00", "2348.00"],
        ["Nina Patel", "23", "2025-03-05 10:45:00", "129.00"],
        ["Sofia Rossi", "25", "2025-04-26 19:40:00", "1499.00"],
      ] },
    explanation:
      "The window partitions by customer, so every shopper owns a private 1, 2, 3 over their orders in time (order_id breaking same-timestamp ties). rn = 2 — filtered outside, as the i-01 rule demands — keeps exactly one row per repeat customer: sixteen of them, of which the LIMIT shows the eight earliest. Amelia Watson's second order is order 5 ($129.00, April 2024), not the table's second row — the partition restarts the count at every customer. Customers 17 and 19 never ordered at all, and one-order customers never reach rn 2. Note the shape: partition, number, filter — the same three moves that built the department leaders in i-i1, one level deeper.",
    concepts: ["row_number", "PARTITION BY", "per-group picks"],
  },
  {
    id: "i-a4",
    tier: "advanced",
    mode: "sql",
    title: "The retakes report",
    prompt: "Northgate's registrar needs the grade-improvement report: every student who retook a course in a later term, with the grade earned the second time and the grade it replaced. In a CTE over enrollments JOINed to students and courses, compute previous_grade = lag(e.grade) OVER w, where the WINDOW clause partitions by the PAIR (e.student_id, e.course_id) ordered by e.term — each retake sequence is its own little history. From outside the CTE, keep only the rows where previous_grade IS NOT NULL (first attempts have nothing behind them). Return student (first and last name joined with one space), course (the course code), term, new_grade (this row's grade) and previous_grade, ordered by student. Expected columns: student, course, term, new_grade, previous_grade.",
    dataset: "university",
    sampleTables: ["enrollments", "students", "courses"],
    hint: "PARTITION BY e.student_id, e.course_id — two keys, one window: the lag restarts only when the student OR the course changes.",
    starter: `WITH history AS (
  SELECT s.first_name || ' ' || s.last_name AS student,
         c.code AS course,
         e.term,
         e.grade,
         -- previous_grade: lag(e.grade) OVER w
  FROM enrollments e
  JOIN students s ON s.student_id = e.student_id
  JOIN courses c ON c.course_id = e.course_id
  -- WINDOW w AS (PARTITION BY e.student_id, e.course_id ORDER BY e.term)
)
SELECT student, course, term, grade AS new_grade, previous_grade
FROM history
-- WHERE previous_grade IS NOT NULL
ORDER BY student;
`,
    solution: `WITH history AS (
  SELECT s.first_name || ' ' || s.last_name AS student,
         c.code AS course,
         e.term,
         e.grade,
         lag(e.grade) OVER w AS previous_grade
  FROM enrollments e
  JOIN students s ON s.student_id = e.student_id
  JOIN courses c ON c.course_id = e.course_id
  WINDOW w AS (PARTITION BY e.student_id, e.course_id ORDER BY e.term)
)
SELECT student, course, term, grade AS new_grade, previous_grade
FROM history
WHERE previous_grade IS NOT NULL
ORDER BY student;`,
    ordered: true,
    expected: { columns: ["student", "course", "term", "new_grade", "previous_grade"], rows: [
        ["Bianca Rossi", "BIO 120", "2023F", "A", "B"],
        ["Dev Malhotra", "CS 340", "2025S", "A", "B"],
        ["Omar Haddadi", "CS 201", "2025S", "B", "C"],
        ["Tobias Fischer", "PHYS 101", "2025S", "B", "C"],
      ] },
    explanation:
      "The window partitions by the pair (student_id, course_id), so each retake sequence is its own tiny history ordered by term; lag(grade) reads the previous attempt of the same course by the same student. First attempts have nothing behind them and drop out through the outer IS NOT NULL — including Jonah Reyes' 2025S 'A' in CS 410, which looks like a retake until the partition reveals it is his first shot at the course. Four genuine retakes survive, and every one improved: Dev Malhotra's B to A in CS 340, Omar Haddadi's C to B in CS 201, Tobias Fischer's C to B in PHYS 101, and Bianca Rossi's B to A in BIO 120 — the oldest retake on file, from 2023F.",
    concepts: ["lag", "multi-column partitions", "change detection"],
  },
  ],
  assessment: [

  {
    id: "i-as-1",
    prompt: "Three salaries sit at 100000, 100000 and 90000, highest first. What pair of numbers does the third row (90000) get from rank() and dense_rank(), both OVER (ORDER BY salary DESC)?",
    options: [
      { text: "rank() 3, dense_rank() 2", correct: true, feedback: "Correct — rank counts the two tied rows above it (1, 1, 3); dense_rank counts distinct values (1, 1, 2). That one skipped number is the whole difference." },
      { text: "rank() 3, dense_rank() 3", correct: false, feedback: "dense_rank never skips — after a tie it advances by exactly one, which is its entire reason to exist." },
      { text: "rank() 2, dense_rank() 2", correct: false, feedback: "Both functions repeat the tied number on the tied rows themselves — but this row is the one AFTER the tie." },
      { text: "rank() 2, dense_rank() 1", correct: false, feedback: "1 belongs to the tied leaders, and the row after a pair of ties can never land on 2 with rank()." },
    ],
    explanation: "rank() counts rows — two tied rows above means the next row is 3. dense_rank() counts distinct values — one value above means the next is 2. row_number() would ignore the tie entirely and hand out 1, 2, 3; choosing the function IS choosing the tie policy.",
  },
  {
    id: "i-as-2",
    prompt: "row_number() OVER (PARTITION BY dept_id ORDER BY salary DESC) — what does the PARTITION BY dept_id change, compared with a plain OVER (ORDER BY salary DESC)?",
    options: [
      { text: "The numbering restarts at 1 inside every department — each department gets its own salary ladder", correct: true, feedback: "Correct — one window per department, one ladder per window. This is the enabler of every top-N-per-group query." },
      { text: "The result comes back sorted by dept_id instead of salary", correct: false, feedback: "PARTITION BY never sorts your output — display order is the final ORDER BY's job, and the partitions may even be processed in any order." },
      { text: "Only the largest department gets numbered; the others return NULL", correct: false, feedback: "Every partition is numbered from 1 — nobody is left out. PARTITION BY divides, it never discards." },
      { text: "The rows collapse to one row per department, like GROUP BY", correct: false, feedback: "That is GROUP BY's behavior — the classic confusion. A window function keeps every row it looks at." },
    ],
    explanation: "PARTITION BY slices the rows into independent windows, and the ORDER BY then ranks inside each slice. No rows are merged and none are lost: the same employees come out, each numbered within their own department.",
  },
  {
    id: "i-as-3",
    prompt: "Product 6's reviews, oldest first, score 5, 4 and 5 stars. A query returns stars and lag(stars) OVER (ORDER BY created_at). What does the lag column show on the row whose stars is 4?",
    options: [
      { text: "5 — the previous review's stars", correct: true, feedback: "Correct — lag() reaches one row back in the window's order and borrows that row's value." },
      { text: "4 — the current row's own stars", correct: false, feedback: "The row already owns its stars; lag() fetches the neighbor's — nothing needs copying." },
      { text: "NULL — lag returns NULL in the middle of a partition", correct: false, feedback: "NULL appears only where no previous row exists: the partition's first row." },
      { text: "1 — the difference between this row and the previous one", correct: false, feedback: "lag() fetches, it never subtracts; the arithmetic (stars - lag(stars)) is yours to write, as the review-delta queries did." },
    ],
    explanation: "lag(x) reads the previous row's x in the window's order — 5 on the 4-star row. lead(x) is the mirror image, reading one row ahead. Both return NULL at the partition's edge, where the neighbor does not exist.",
  },
  {
    id: "i-as-4",
    prompt: "sum(amount) OVER (ORDER BY occurred_at) — what does each row of the result carry?",
    options: [
      { text: "The running total: the current row's amount plus every earlier one, in occurred_at order", correct: true, feedback: "Correct — the ORDER BY inside OVER turns on the growing frame, and the total accumulates row by row." },
      { text: "The same grand total on every row", correct: false, feedback: "That is sum(amount) OVER () with no ORDER BY — the whole partition in one number, repeated everywhere." },
      { text: "Only the current row's amount", correct: false, feedback: "Then no aggregate would be involved at all — plain amount. The window always spans at least the current row plus what precedes it." },
      { text: "The total of all rows after the current one", correct: false, feedback: "That would take an explicit FOLLOWING frame; the default frame only ever looks backwards." },
    ],
    explanation: "ORDER BY inside OVER is the switch between a grand total and a running one: without it every row sees the whole partition, with it the frame grows from the partition's first row through the current one — a bank balance rebuilt from transactions in a single expression.",
  },
  {
    id: "i-as-5",
    prompt: "People Ops wants every employee's own salary in the same row as their department's average salary. Which query does that in one shot?",
    options: [
      { text: "SELECT employee, salary, avg(salary) OVER (PARTITION BY dept_id) FROM employees", correct: true, feedback: "Correct — the window average computes one number per department and repeats it beside every member, rows intact." },
      { text: "SELECT employee, salary, avg(salary) FROM employees GROUP BY dept_id", correct: false, feedback: "GROUP BY collapses each department to one row — and selecting employee beside it is an error. The individual salaries are gone." },
      { text: "SELECT employee, salary, avg(salary) OVER () FROM employees", correct: false, feedback: "No PARTITION BY: the company-wide average lands beside everyone — interesting, but it is not their department's number." },
      { text: "SELECT avg(salary) FROM employees", correct: false, feedback: "One row, one number — the average of everyone, with no employee beside it. The opposite of the request." },
    ],
    explanation: "The window version adds the group's number without the group's collapse — exactly what GROUP BY cannot do. GROUP BY answers 'what is the average per department?'; the window answers 'who stands above their department's average?'",
  },
  {
    id: "i-as-6",
    prompt: "What does CREATE VIEW current_employees AS SELECT ... FROM employees WHERE terminated IS NULL actually store?",
    options: [
      { text: "The query's definition only — every SELECT from the view runs it fresh against employees, so base-table updates show through instantly", correct: true, feedback: "Correct — a view is a saved query, not saved rows; that is why the mid-lesson UPDATE appeared in the view on the very next SELECT." },
      { text: "A frozen copy of the result rows from the moment of CREATE VIEW", correct: false, feedback: "Views never freeze. The cousin that does is the materialized view — a different object you must REFRESH by hand." },
      { text: "The definition plus a cached result set, refreshed on a schedule", correct: false, feedback: "There is no cache and no schedule — the stored query runs at SELECT time, every time." },
      { text: "A new table that PostgreSQL keeps in sync with employees automatically", correct: false, feedback: "A view is not a table and owns no storage — information_schema.views lists a definition, not data." },
    ],
    explanation: "A view stores its query text; the rows are computed on demand. That freshness is the property you proved in i-04: UPDATE the base table, and the view answers with the new value immediately — no refresh, no rebuild.",
  },
  {
    id: "i-as-7",
    prompt: "current_employees is an existing view exposing seven named columns. Which CREATE OR REPLACE VIEW attempt will PostgreSQL refuse?",
    options: [
      { text: "One whose SELECT drops the employee_id column the old view exposes", correct: true, feedback: "Correct — 'cannot drop columns from view'. OR REPLACE may add columns at the end; it may never remove or reorder what already exists." },
      { text: "One that appends an is_remote column after the existing seven", correct: false, feedback: "Adding columns at the end is precisely what OR REPLACE allows — the old column list survives intact as a prefix." },
      { text: "One that only tightens the WHERE clause", correct: false, feedback: "Swapping the definition — filters, joins, expressions — is the entire point of OR REPLACE; only the shape must survive." },
      { text: "One that rebuilds the same seven columns over a JOIN instead of the single base table", correct: false, feedback: "PostgreSQL cares about the column list — names, types, order — not the plumbing underneath that produces it." },
    ],
    explanation: "OR REPLACE keeps the view's name alive while swapping its query, on one condition: every existing column must still be there, in order, at compatible types. New columns may join at the end; anything else means DROP VIEW and a fresh CREATE.",
  },
  {
    id: "i-as-8",
    prompt: "Meridian Trust runs CREATE INDEX ON accounts (branch_id). Which statement is TRUE?",
    options: [
      { text: "WHERE branch_id = 3 can now seek the index instead of scanning every account row", correct: true, feedback: "Correct — equality on the indexed column is the index's home turf: one seek down the B-tree, a handful of rows out." },
      { text: "WHERE upper(city) = 'SPRINGFIELD' also speeds up, because indexes store every casing", correct: false, feedback: "The index holds branch_id values, not expressions over other columns — upper(city) needs its own expression index over upper(city)." },
      { text: "Lookups by account_id still scan the whole table, because PRIMARY KEYs create no index", correct: false, feedback: "The opposite: a PRIMARY KEY comes with its unique index automatically — the one index every table ships with, free." },
      { text: "INSERT into accounts runs exactly as fast as before — indexes never affect writes", correct: false, feedback: "Every INSERT, UPDATE and DELETE must now also maintain the new index — the write cost you trade for the read speed." },
    ],
    explanation: "An index is a lookup structure over the exact values (or expression) you indexed: equality and prefix matches ride it (LIKE 'Spring%'), leading wildcards (LIKE '%field') and functions over other columns defeat it, the PRIMARY KEY's index comes automatically, and every write pays a small maintenance tax per index. That is the whole trade.",
  },
  ],
  project: {

  title: "The Operations Review",
  brief:
    "Quarter-end at Meridian Trust used to mean a morning of hand-built queries for the operations desk; this quarter you replace the pile of one-offs with a reporting layer. The review needs four things: which accounts hold the most money within each account type, which single account is the flagship of each branch, whether the stored ledger balances reconcile against the running totals you can recompute from the transactions themselves, and how 2026's activity spreads across the months — then the two headline queries wrapped in CREATE VIEW, so next quarter's review is two SELECTs away. Every tool is Part I: rank() and row_number() for the leaderboards, a signed CASE inside a window sum for the audit, date_trunc bucketing from Part H for the pulse, and views to ship it.",
  requirements: [
    "account_leaderboard: one row per ACTIVE account (is_active) with account_id, account_type, branch (the branch name, via a JOIN), balance and type_rank — rank() OVER (PARTITION BY account_type ORDER BY balance DESC), so checking, savings, business and CD each crown their own number 1 (Reginald Ashton's $92,000.00 savings among them)",
    "branch_flagships: exactly one row per branch — its biggest active account (row_number() in a CTE, keep rn = 1) — with branch, city, account_id, account_type and balance, ordered by balance DESC (Downtown's $92,000.00 savings leads; Fairview's flagship is a $940.60 checking account)",
    "ledger_audit: every transaction where the recomputed running net (deposits and transfer_in signed positive, everything else negative, summed per account in occurred_at then txn_id order) disagrees with the stored balance_after — expect exactly 16 rows across accounts 2, 6, 20 and 28, whose histories open mid-life with a balance the ledger never recorded",
    "monthly_pulse: one row per month of 2026 that has transactions — txn_month (to_char over date_trunc('month', occurred_at), 'YYYY-MM'), transactions (the count) and net_flow (the same signed sum, rounded to 2) — all eleven months appear, and November is the only negative one",
    "The audit and the pulse reuse ONE signed CASE expression — deposits and transfer_in positive, withdrawals, transfer_out and fees negative — written identically in both queries",
    "Save the two headline queries as views: CREATE VIEW account_leaderboard AS ... and CREATE VIEW branch_flagships AS ..., then run a plain SELECT over each to prove the layer works",
    "No window column is filtered in the query level that computes it — rn = 1 and the audit's mismatch filter belong in an outer query or CTE, per the i-01 rule",
  ],
  steps: [
    "Start with the leaderboard core: active accounts JOINed to branches for the name — account_id, account_type, branch, balance — and read the rows before ranking anything.",
    "Add type_rank with rank() OVER (PARTITION BY account_type ORDER BY balance DESC) and check the crowns: savings' number 1 is Reginald Ashton's $92,000.00 account, checking's is Bridget Callahan's $29,425.00.",
    "Build branch_flagships as a CTE over the same rows with row_number() OVER (PARTITION BY branch_id ORDER BY balance DESC) AS rn, then keep rn = 1 from outside the CTE — the top-N-per-group pattern from i-i1, one row per branch.",
    "Write the signed CASE once and test the running net on account 25 first — it should agree with balance_after on all six rows. Then wrap it in sum() OVER (PARTITION BY account_id ORDER BY occurred_at, txn_id), round to 2, and filter the mismatches into the audit report (a CTE again — WHERE cannot see the window column).",
    "Build the monthly pulse with GROUP BY date_trunc('month', occurred_at): count(*) for transactions, round(sum(<the same signed CASE>), 2) for net_flow, and to_char(..., 'YYYY-MM') for the label — GROUP BY is the right tool here, not a window.",
    "Wrap the leaderboard and flagship queries in CREATE VIEW account_leaderboard and CREATE VIEW branch_flagships, then SELECT from both — the whole review is now two statements.",
    "Stress-test the layer: re-run the flagship SELECT, UPDATE one account's balance, and re-run it again — the view answers with the fresh number, because a view stores the query, not the rows. Roll the balance back afterwards.",
  ],
  starter: `-- The Operations Review (Part I mini project)
-- Database: banking (Meridian Trust) — every query runs on a fresh copy.

-- 1) The account leaderboard: every ACTIVE account, ranked inside its type.
SELECT a.account_id,
       a.account_type,
       b.name AS branch,
       a.balance
       -- TODO type_rank: rank() OVER (PARTITION BY a.account_type
       --                              ORDER BY a.balance DESC)
FROM accounts a
JOIN branches b ON b.branch_id = a.branch_id
WHERE a.is_active
ORDER BY a.account_type, a.balance DESC;

-- 2) The branch flagships: the biggest active account of each branch.
WITH ranked AS (
  SELECT a.account_id,
         a.account_type,
         a.balance,
         b.name AS branch,
         b.city
         -- TODO rn: row_number() OVER (PARTITION BY a.branch_id
         --                              ORDER BY a.balance DESC)
  FROM accounts a
  JOIN branches b ON b.branch_id = a.branch_id
  WHERE a.is_active
)
-- TODO SELECT branch, city, account_id, account_type, balance
--      FROM ranked WHERE rn = 1 ORDER BY balance DESC
SELECT * FROM ranked;

-- 3) The ledger audit: recompute each account's running net and keep
--    only the rows that disagree with the stored balance.
-- TODO WITH ledger AS (
--   SELECT txn_id, account_id, occurred_at, balance_after,
--          round(sum(CASE WHEN txn_type IN ('deposit', 'transfer_in')
--                         THEN amount ELSE -amount END)
--                OVER (PARTITION BY account_id
--                      ORDER BY occurred_at, txn_id), 2) AS running_net
--   FROM transactions
-- )
-- SELECT txn_id, account_id, occurred_at, running_net, balance_after
-- FROM ledger
-- WHERE running_net <> balance_after
-- ORDER BY account_id, txn_id;

-- 4) The monthly pulse: GROUP BY does the collapsing here.
-- TODO to_char(date_trunc('month', t.occurred_at), 'YYYY-MM') AS txn_month,
--      count(*) AS transactions,
--      round(sum(CASE WHEN ... END), 2) AS net_flow
-- FROM transactions t
-- GROUP BY date_trunc('month', t.occurred_at)
-- ORDER BY date_trunc('month', t.occurred_at);

-- 5) Ship it as a reporting layer.
-- TODO CREATE VIEW account_leaderboard AS (query 1, with type_rank);
-- TODO CREATE VIEW branch_flagships     AS (query 2, the flagship rows);
-- TODO SELECT * FROM account_leaderboard ORDER BY account_type, type_rank;
-- TODO SELECT * FROM branch_flagships;
`,
  concepts: ["window functions", "PARTITION BY", "running totals", "date_trunc", "views"],
  extension:
    "Add a third view, monthly_activity, wrapping the pulse — then teach it quarters too, with date_trunc('quarter', occurred_at) bucketed beside the months. Rank the five branches by their 2026 net flow (a JOIN, the same signed CASE, a GROUP BY, then dense_rank() over the totals), and crown each branch's busiest month with the row_number-per-group trick over a branch-by-month rollup.",
  },
};
