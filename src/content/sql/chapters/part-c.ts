/**
 * Part C — Querying Data with SELECT.
 *
 * The heart of SQL: choosing columns, computing expressions, filtering
 * rows, sorting, paging, deduplicating and combining result sets. Every
 * lesson runs real queries on the sample databases with machine-verified
 * outputs (compute-part-results + verify-sql-outputs pipeline).
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_C: Part = {
  letter: "C",
  title: "Querying Data with SELECT",
  tagline: "Ask a database questions: SELECT, WHERE, ORDER BY, LIMIT, DISTINCT and set operations.",
  description:
    "Part A taught you what a database is; Part B built one. Now you interrogate it. This part covers the entire single-table questioning toolkit: choosing and computing columns, filtering rows with every operator worth knowing, sorting, paging through results, removing duplicates, and combining query results with UNION, INTERSECT and EXCEPT. By the end you can answer most one-table business questions — precisely and confidently.",
  stub: false,
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      slug: "c-01",
      title: "SELECT — asking for data",
      minutes: 14,
      summary: "Choose columns, compute expressions in flight, and name results with aliases — the question shape of all SQL.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Write SELECT statements with explicit column lists",
        "Compute expressions (arithmetic, concatenation) in the SELECT clause",
        "Name output columns with AS aliases",
        "Explain when SELECT * is acceptable and when it is not",
      ],
      why: "SELECT is the verb you will type more than any other in your data life. Almost every question to a database starts as 'which columns, from which table, computed how?' Getting fluent here — choosing exactly the facts you need, computing new ones on the fly, naming outputs so people can read them — makes every later feature (filtering, sorting, joining) easier to learn, because they all bolt onto this one statement.",
      blocks: [
        {
          kind: "text",
          text: "The simplest question is a list: which columns, from which table. Name the columns explicitly, and you get exactly those facts, in that order, for every row of the table:",
        },
        {
          kind: "sql",
          title: "Choose your facts",
          code: "SELECT customer_id, first_name, last_name, city\nFROM customers\nORDER BY customer_id\nLIMIT 5;",
          result: { columns: ["customer_id", "first_name", "last_name", "city"], rows: [
        ["1", "Amelia", "Watson", "Portland"],
        ["2", "Marcus", "Chen", "Seattle"],
        ["3", "Priya", "Sharma", "Austin"],
        ["4", "Diego", "Alvarez", "Miami"],
        ["5", "Hannah", "Kowalski", "Chicago"],
      ] },
          explain: [
            "The SELECT list names the columns in the exact order you want them back.",
            "FROM names the table being asked.",
            "ORDER BY customer_id and LIMIT 5 keep the output small and stable for reading — you will meet them properly in the next two lessons.",
          ],
        },
        { kind: "heading", text: "Compute while you ask" },
        {
          kind: "text",
          text: "The SELECT list is not limited to stored columns — it accepts **expressions**. Arithmetic works on numbers, `||` glues text together, and functions (many lessons away, in Part H) transform values as they fly past. The database computes the expression per row, and the result appears as a column like any other:",
        },
        {
          kind: "sql",
          title: "Expressions in flight",
          code: "SELECT name,\n       price,\n       stock,\n       price * stock AS stock_value\nFROM products\nWHERE category_id = 1\nORDER BY stock_value DESC\nLIMIT 5;",
          result: { columns: ["name", "price", "stock", "stock_value"], rows: [
        ["BudgetBook 11 Everyday", "399.00", "55", "21945.00"],
        ["WorkMate 15 Business", "899.00", "22", "19778.00"],
        ["AeroBook 14 Laptop", "1299.00", "14", "18186.00"],
        ["AeroBook 16 Pro Laptop", "2199.00", "6", "13194.00"],
        ["StudioBook X Creator", "2499.00", "3", "7497.00"],
      ] },
          explain: [
            "price * stock computes what each laptop line is worth on the shelf — per row, from that row's values.",
            "AS stock_value names the computed column; without an alias, PostgreSQL would title it ?column?, which nobody wants in a report.",
            "The sorting happens on the computed value, exactly as if it were a stored column.",
          ],
        },
        {
          kind: "sql",
          title: "Building readable names with ||",
          code: "SELECT first_name || ' ' || last_name AS full_name,\n       city || ', ' || state AS location\nFROM customers\nORDER BY customer_id\nLIMIT 4;",
          result: { columns: ["full_name", "location"], rows: [
        ["Amelia Watson", "Portland, OR"],
        ["Marcus Chen", "Seattle, WA"],
        ["Priya Sharma", "Austin, TX"],
        ["Diego Alvarez", "Miami, FL"],
      ] },
          explain: [
            "|| concatenates text: first name, a space, then last name — one readable label per customer.",
            "The second expression composes a location label from two columns.",
            "Both outputs are computed per row; neither is stored anywhere — the table itself is unchanged.",
          ],
        },
        { kind: "heading", text: "SELECT * — the honest rules" },
        {
          kind: "text",
          text: "`SELECT *` returns every column. It is fine for exploration — a quick look in the Lab, a schema you are learning. It is a poor habit for real work: it fetches data you do not need, it breaks silently in code when the table's columns change, and reports built on it become unreadable. Professional default: name your columns; reach for * only while exploring.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Read errors as spelling lessons",
          text: "Misspell a column name and PostgreSQL answers `column \"custmer_id\" does not exist` — with the caret under your mistake. The engine checks every name in your SELECT list against the table's real columns before running anything.",
        },
        {
          kind: "lab",
          title: "Compute a reading list",
          task: "On the products table, compute a sale price at 20 percent off: select name, price and the expression price * 0.80 AS sale_price for the five cheapest products (ORDER BY price, LIMIT 5). Watch the numeric column come out exact to two decimals.",
          code: "SELECT name, price, price * 0.80 AS sale_price\nFROM products\nORDER BY price\nLIMIT 5;",
          dataset: "ecommerce",
          hint: "numeric times 0.80 stays exact — money arithmetic in PostgreSQL never drifts like floating point.",
        },
      ],
      terms: [
        { term: "SELECT list", definition: "The columns (and expressions) you ask for, in the order you want them back." },
        { term: "Expression", definition: "A computed value in the SELECT list: arithmetic, concatenation, or a function call, evaluated per row." },
        { term: "Alias (AS)", definition: "The output name you give a column or expression; the label on the result." },
        { term: "SELECT *", definition: "Every column of the table — fine for exploration, a liability in real code." },
      ],
      mistakes: [
        {
          mistake: "Writing SELECT * in application code",
          why: "It fetches unneeded data and quietly changes shape when the table gains or loses columns.",
          fix: "Name the columns you mean. Save * for the Lab and the first five minutes of exploration.",
        },
        {
          mistake: "Forgetting AS and shipping reports titled ?column?",
          why: "Computed expressions have no natural name; the engine's placeholder confuses readers.",
          fix: "Alias every expression: `price * stock AS stock_value`.",
        },
      ],
      takeaways: [
        "SELECT names the facts; FROM names the thing holding them.",
        "Expressions compute per row — arithmetic, ||, functions — without changing stored data.",
        "AS names your outputs; unaliased expressions print as ?column?.",
        "Name columns in real code; keep SELECT * for exploration.",
      ],
      quiz: [
        {
          id: "c-01-q1",
          prompt: "What does `SELECT price * stock AS stock_value FROM products` produce?",
          options: [
            { text: "A new stored column in the products table", correct: false, feedback: "Nothing is stored — SELECT never writes; the value is computed per row at read time." },
            { text: "One computed value per row, labeled stock_value", correct: true, feedback: "Correct — an expression evaluated for every row, aliased for readability." },
            { text: "One total: the sum of price times stock", correct: false, feedback: "That would need an aggregate (Part E); the expression here is per row." },
          ],
          explanation: "SELECT-list expressions are computed row by row at query time. Aggregation — collapsing rows — is a different clause you will meet in Part E.",
        },
        {
          id: "c-01-q2",
          prompt: "Why do professionals avoid SELECT * in application code?",
          options: [
            { text: "It is slower to type", correct: false, feedback: "Convenience is the trap, not the cost." },
            { text: "It fetches unneeded data and changes shape when the table changes", correct: true, feedback: "Correct — both a performance and a maintenance hazard." },
            { text: "PostgreSQL forbids it in some databases", correct: false, feedback: "It is always allowed; the problem is what it quietly does." },
          ],
          explanation: "Named columns fetch only what you need and stay stable when the schema grows. SELECT * does neither.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-02",
      title: "WHERE — filtering rows",
      minutes: 14,
      summary: "Keep only the rows your question is about: comparisons, AND/OR/NOT, IN, BETWEEN and LIKE.",
      kind: "coding",
      dataset: "university",
      objectives: [
        "Filter rows with comparison operators",
        "Combine conditions with AND, OR and NOT",
        "Use IN, BETWEEN and LIKE for common patterns",
        "Explain why parentheses matter in mixed AND/OR conditions",
      ],
      why: "Tables hold everything; questions are almost always about SOMETHING — one city, one month, one kind of customer, students above a bar. WHERE is how a question gets specific. Without it, SQL is a firehose; with it, SQL becomes an interrogation. This lesson gives you every filter you will use daily and the logic to combine them safely.",
      blocks: [
        {
          kind: "text",
          text: "WHERE keeps the rows for which its condition is TRUE and discards the rest. The simplest conditions are comparisons — `=`, `<>` (not equal), `<`, `<=`, `>`, `>=` — between a column and a value:",
        },
        {
          kind: "sql",
          title: "One comparison",
          code: "SELECT first_name, last_name, enrollment_year, gpa\nFROM students\nWHERE enrollment_year = 2021\nORDER BY last_name;",
          result: { columns: ["first_name", "last_name", "enrollment_year", "gpa"], rows: [
        ["Alice", "Bennett", "2021", "3.82"],
        ["Sophie", "Laurent", "2021", "3.90"],
        ["Felix", "Steiner", "2021", "3.11"],
      ] },
          explain: [
            "Only students who enrolled in 2021 survive the filter — four of them.",
            "Text compares with quotes ('2021' would be text; 2021 is a number), dates with DATE literals.",
            "The row order here is by last name for reading; WHERE itself never orders anything.",
          ],
        },
        { kind: "heading", text: "Combining conditions" },
        {
          kind: "text",
          text: "Conditions combine with **AND** (both must hold) and **OR** (at least one must hold), and flip with **NOT**. The rule that saves you from a thousand bugs: **AND binds tighter than OR** — exactly like multiplication before addition. When you mix them, write the parentheses you mean:",
        },
        {
          kind: "sql",
          title: "AND — both conditions, or the row is gone",
          code: "SELECT first_name, last_name, gpa\nFROM students\nWHERE enrollment_year = 2022\n  AND gpa >= 3.4\nORDER BY gpa DESC;",
          result: { columns: ["first_name", "last_name", "gpa"], rows: [
        ["Grace", "Sullivan", "3.58"],
        ["Leah", "Brennan", "3.47"],
        ["Dev", "Malhotra", "3.41"],
      ] },
          explain: [
            "Two tests, one row must pass both: enrolled in 2022 AND at least a 3.4 GPA.",
            "The comparison against gpa quietly skips NULL GPAs — a NULL is neither >= nor < anything. Lesson d-05 makes this precise.",
          ],
        },
        {
          kind: "sql",
          title: "Parentheses make OR safe",
          code: "SELECT first_name, last_name, city, gpa\nFROM students\nWHERE city = 'Northgate'\n   OR (city = 'Riverside' AND gpa >= 3.4)\nORDER BY student_id;",
          result: { columns: ["first_name", "last_name", "city", "gpa"], rows: [
        ["Jonah", "Reyes", "Northgate", "3.65"],
        ["Alice", "Bennett", "Riverside", "3.82"],
        ["Dev", "Malhotra", "Northgate", "3.41"],
        ["Grace", "Sullivan", "Northgate", "3.58"],
        ["Tobias", "Fischer", "Northgate", "2.98"],
        ["Leah", "Brennan", "Riverside", "3.47"],
        ["Adrian", "Costa", "Northgate", "3.20"],
        ["Bianca", "Rossi", "Northgate", "3.33"],
        ["Talia", "Mizrahi", "Northgate", null],
        ["Marcus", "Diallo", "Northgate", "3.52"],
        ["Yuki", "Ono", "Northgate", null],
        ["Clara", "Duarte", "Riverside", "3.61"],
      ] },
          explain: [
            "Read it as: everyone from Northgate, PLUS Riverside students with GPA at least 3.4.",
            "Without the parentheses, AND would bind first and the query would mean something different — (city='Northgate' OR city='Riverside') AND gpa >= 3.4 — excluding Northgate's lower GPAs.",
          ],
        },
        { kind: "heading", text: "The friendly filters" },
        {
          kind: "sql",
          title: "IN, BETWEEN and LIKE",
          code: "SELECT first_name, last_name, enrollment_year, gpa\nFROM students\nWHERE enrollment_year IN (2020, 2021)\n  AND last_name LIKE 'S%'\nORDER BY enrollment_year, last_name;",
          result: { columns: ["first_name", "last_name", "enrollment_year", "gpa"], rows: [
        ["Felix", "Steiner", "2021", "3.11"],
      ] },
          explain: [
            "IN (2020, 2021) is a tidy OR over a list — enrolled in either year.",
            "LIKE 'S%' matches text: S followed by anything (% is any run of characters, _ is exactly one).",
            "BETWEEN works on ranges and is INCLUSIVE on both ends: gpa BETWEEN 3.0 AND 3.5 includes 3.0 and 3.5.",
          ],
        },
        {
          kind: "table",
          title: "The comparison toolbox",
          headers: ["Operator", "Meaning", "Example"],
          rows: [
            ["= / <>", "equal / not equal", "city = 'Austin'"],
            ["< <= > >=", "orderings", "price <= 100"],
            ["AND / OR / NOT", "logic (AND binds tighter)", "NOT (city = 'Austin' OR gpa < 3)"],
            ["IN (...)", "any of a list", "state IN ('OR', 'WA')"],
            ["BETWEEN a AND b", "inclusive range", "gpa BETWEEN 3.0 AND 3.5"],
            ["LIKE", "text pattern (% any run, _ one char)", "email LIKE '%@northgate.edu'"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "NULL never equals anything — not even NULL",
          text: "`WHERE phone = NULL` matches nothing, ever — not even rows whose phone IS NULL. Unknown compared to unknown is still unknown. The test for missing data is `IS NULL` (and `IS NOT NULL`), which is lesson d-05's whole subject.",
        },
        {
          kind: "lab",
          title: "Build a filter sandwich",
          task: "On the products table: find products in categories 1 or 2 (Laptops, Audio) costing between 100 and 1000 dollars, still in stock. Select name, category_id, price and stock, sorted by price.",
          code: "SELECT name, category_id, price, stock\nFROM products\nWHERE category_id IN (1, 2)\n  AND price BETWEEN 100 AND 1000\n  AND stock > 0\nORDER BY price;",
          dataset: "ecommerce",
          hint: "Three conditions AND-ed together; BETWEEN is inclusive on both ends.",
        },
      ],
      terms: [
        { term: "WHERE", definition: "The clause that keeps only rows for which its condition is TRUE." },
        { term: "Predicate", definition: "A condition that is true, false or unknown for each row — what WHERE evaluates." },
        { term: "IN", definition: "True when the value equals any member of a list." },
        { term: "LIKE", definition: "Text pattern match: % matches any run of characters, _ exactly one." },
      ],
      mistakes: [
        {
          mistake: "Mixing AND and OR without parentheses",
          why: "AND binds tighter, so 'a OR b AND c' means 'a OR (b AND c)' — often not what was meant, and silently wrong.",
          fix: "Parenthesize whenever OR appears with AND. Make the query say what you mean.",
        },
        {
          mistake: "WHERE phone = NULL",
          why: "Comparison with NULL yields unknown, which WHERE treats as false — zero rows, no error, total confusion.",
          fix: "IS NULL / IS NOT NULL are the only missing-data tests.",
        },
        {
          mistake: "Quotes around numbers",
          why: "enrollment_year = '2021' compares a number to text; PostgreSQL often errors, and where it coerces, it misleads.",
          fix: "Numbers bare, text quoted, dates as DATE '2026-01-01'.",
        },
      ],
      takeaways: [
        "WHERE keeps rows whose condition is TRUE; everything else is discarded.",
        "AND binds tighter than OR — parentheses when you mix them.",
        "IN for lists, BETWEEN for inclusive ranges, LIKE for text patterns.",
        "Never compare to NULL with =; IS NULL is the only honest test.",
      ],
      quiz: [
        {
          id: "c-02-q1",
          prompt: "Which students match `WHERE city = 'Northgate' OR city = 'Riverside' AND gpa >= 3.4`?",
          options: [
            { text: "Northgate students of any GPA, plus Riverside students with GPA >= 3.4", correct: true, feedback: "Correct — AND bound first: (Riverside AND gpa) is one arm of the OR." },
            { text: "Students in either city with GPA >= 3.4", correct: false, feedback: "That would need parentheses around the cities: (city = A OR city = B) AND gpa >= 3.4." },
            { text: "Nobody — the query is invalid SQL", correct: false, feedback: "It is valid; the precedence just surprises people." },
          ],
          explanation: "AND binds tighter than OR, so the condition is Northgate OR (Riverside AND good GPA). Parentheses in your queries make intent explicit.",
        },
        {
          id: "c-02-q2",
          prompt: "gpa BETWEEN 3.0 AND 3.5 — which GPAs match?",
          options: [
            { text: "Strictly between: 3.1 to 3.4 only", correct: false, feedback: "BETWEEN is inclusive — the boundary values count." },
            { text: "3.0 to 3.5 inclusive", correct: true, feedback: "Correct — both endpoints are included, a classic interview question." },
            { text: "Only exactly 3.0 and 3.5", correct: false, feedback: "It is the whole range, not just the endpoints." },
          ],
          explanation: "BETWEEN a AND b includes a and b. Write x >= a AND x <= b in your head to remember.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-03",
      title: "ORDER BY — sorting",
      minutes: 13,
      summary: "Sort by one column or many, ascending or descending, on stored or computed values — the only source of guaranteed order.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Sort by one or more columns, ascending or descending",
        "Sort by aliases and expressions",
        "Control where NULLs land with NULLS FIRST/LAST",
        "State the golden rule: without ORDER BY, order is not guaranteed",
      ],
      why: "Top sellers, worst students, latest transactions, cheapest first — the interesting rows are almost always at one END of a sort. ORDER BY is also the only mechanism in SQL that PROMISES an order; every other apparent order is coincidence the engine owes you nothing about. Understanding that promise (and how to sort by computed values and break ties) is what turns 'some rows' into an answer.",
      blocks: [
        {
          kind: "text",
          text: "ORDER BY takes the rows your query produced and returns them in the order you declare. The default is ascending; `DESC` flips it; and you can list several keys — the second breaks ties in the first:",
        },
        {
          kind: "sql",
          title: "Two keys, one deterministic order",
          code: "SELECT first_name, last_name, city, state\nFROM customers\nWHERE state IN ('OR', 'WA')\nORDER BY state, last_name;",
          result: { columns: ["first_name", "last_name", "city", "state"], rows: [
        ["Owen", "Davis", "Portland", "OR"],
        ["Carl", "Jensen", "Portland", "OR"],
        ["Amelia", "Watson", "Portland", "OR"],
        ["Marcus", "Chen", "Seattle", "WA"],
        ["Grace", "Kim", "Seattle", "WA"],
        ["Mina", "Tanaka", "Seattle", "WA"],
      ] },
          explain: [
            "Primary key: state (ascending, alphabetically OR before WA).",
            "Secondary key: last_name — inside each state, names sort alphabetically.",
            "With both keys listed, the output is fully determined: swap the keys and you get a different, equally obeyed order.",
          ],
        },
        { kind: "heading", text: "Sorting the computed and the aliased" },
        {
          kind: "sql",
          title: "DESC on a computed column",
          code: "SELECT name, price, stock,\n       price * stock AS stock_value\nFROM products\nORDER BY stock_value DESC\nLIMIT 5;",
          result: { columns: ["name", "price", "stock", "stock_value"], rows: [
        ["BudgetBook 11 Everyday", "399.00", "55", "21945.00"],
        ["WorkMate 15 Business", "899.00", "22", "19778.00"],
        ["AeroBook 14 Laptop", "1299.00", "14", "18186.00"],
        ["Zenith X20 Mirrorless", "1499.00", "9", "13491.00"],
        ["AeroBook 16 Pro Laptop", "2199.00", "6", "13194.00"],
      ] },
          explain: [
            "The alias stock_value names the computed expression — and ORDER BY happily sorts by it, DESC for biggest first.",
            "Ties would fall to whatever the engine prefers next; adding a second key (say, name) removes even that freedom.",
          ],
        },
        {
          kind: "sql",
          title: "Sorting expressions directly",
          code: "SELECT name, rating, stock\nFROM products\nWHERE rating IS NOT NULL\nORDER BY rating DESC, stock DESC\nLIMIT 6;",
          result: { columns: ["name", "rating", "stock"], rows: [
        ["GameStation 5 Console", "4.9", "15"],
        ["StudioBook X Creator", "4.9", "3"],
        ["Zenith X20 Mirrorless", "4.8", "9"],
        ["AeroBook 16 Pro Laptop", "4.8", "6"],
        ["Altitude GPS Watch", "4.7", "12"],
        ["ChargeHub 100W GaN", "4.6", "90"],
      ] },
          explain: [
            "Two descending keys: best-rated first, and among equal ratings, better-stocked first.",
            "The WHERE clause removes unrated products first — NULL ratings would otherwise clutter the top (see below).",
          ],
        },
        { kind: "heading", text: "Where do NULLs go?" },
        {
          kind: "text",
          text: "When the sort column contains NULL, PostgreSQL puts NULLs LAST in ascending sorts and FIRST in descending ones (they count as the largest value). If you want the opposite, say so explicitly with `NULLS FIRST` or `NULLS LAST` — a PostgreSQL nicety worth knowing:",
        },
        {
          kind: "sql",
          title: "Forcing NULLs to the bottom of a DESC sort",
          code: "SELECT name, rating\nFROM products\nORDER BY rating DESC NULLS LAST\nLIMIT 6;",
          result: { columns: ["name", "rating"], rows: [
        ["GameStation 5 Console", "4.9"],
        ["StudioBook X Creator", "4.9"],
        ["Zenith X20 Mirrorless", "4.8"],
        ["AeroBook 16 Pro Laptop", "4.8"],
        ["Altitude GPS Watch", "4.7"],
        ["AeroBook 14 Laptop", "4.6"],
      ] },
          explain: [
            "Without NULLS LAST, the descending sort would place the unrated WaveRider buds at the very top — NULLs sort as largest.",
            "With NULLS LAST, the best real ratings lead and the missing ones trail.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The golden rule of order",
          text: "Without an ORDER BY, PostgreSQL returns rows in whatever order it happens to produce them — and that order can change between runs, plans and versions. If any part of your code, report or expectation depends on row order, ORDER BY is not optional decoration; it is the contract.",
        },
        {
          kind: "lab",
          title: "Sort a leaderboard",
          task: "Build the students honor roll: students with a GPA, sorted best first; break GPA ties alphabetically by last name. Show first_name, last_name and gpa for the top 6.",
          code: "SELECT first_name, last_name, gpa\nFROM students\nWHERE gpa IS NOT NULL\nORDER BY gpa DESC, last_name\nLIMIT 6;",
          dataset: "university",
          hint: "The second key (last_name) is what makes ties behave identically on every run.",
        },
      ],
      terms: [
        { term: "ORDER BY", definition: "The clause that guarantees the return order of rows." },
        { term: "ASC / DESC", definition: "Ascending (default) or descending sort direction." },
        { term: "Sort key", definition: "A column or expression the sort uses; later keys break ties in earlier ones." },
        { term: "NULLS FIRST/LAST", definition: "Explicit placement of NULLs in a sort (default: last ascending, first descending)." },
      ],
      mistakes: [
        {
          mistake: "Relying on 'natural' row order without ORDER BY",
          why: "Insertion order, id order, whatever order yesterday looked like — none of it is promised. Today's plan may differ.",
          fix: "Any consumer of order gets an explicit ORDER BY. Every time, no exceptions.",
        },
        {
          mistake: "Forgetting DESC and reading the list upside down",
          why: "Ascending is the default, so 'top 5' queries silently return the bottom 5.",
          fix: "Say DESC out loud when you mean biggest-first.",
        },
        {
          mistake: "One sort key where ties matter",
          why: "Equal values leave the tie order to the engine — nondeterministic across runs.",
          fix: "Add a tiebreaker (a name, an id) as the second key.",
        },
      ],
      takeaways: [
        "ORDER BY is the ONLY guaranteed order in SQL.",
        "Multiple keys: first key sorts, later keys break ties.",
        "Sort by aliases and expressions, not just stored columns.",
        "NULLs sort as largest — NULLS FIRST/LAST makes their placement explicit.",
      ],
      quiz: [
        {
          id: "c-03-q1",
          prompt: "ORDER BY rating DESC — where do NULL ratings appear by default?",
          options: [
            { text: "At the top — NULLs sort as the largest value", correct: true, feedback: "Correct — which is why NULLS LAST exists for exactly this case." },
            { text: "At the bottom, always", correct: false, feedback: "That is the ASCENDING default; DESC flips it." },
            { text: "NULL rows are excluded by sorting", correct: false, feedback: "Sorting never removes rows — it only orders them." },
          ],
          explanation: "NULLs count as largest: last in ASC, first in DESC. Add NULLS LAST to keep missing ratings off the top of a descending leaderboard.",
        },
        {
          id: "c-03-q2",
          prompt: "Your report shows rows 'in id order' today. What guarantees that tomorrow?",
          options: [
            { text: "Nothing, unless the query has ORDER BY", correct: true, feedback: "Correct — observed order is not a contract; only ORDER BY is." },
            { text: "PostgreSQL remembers the last query's order", correct: false, feedback: "The engine keeps no such memory between plans." },
            { text: "Primary keys imply result order", correct: false, feedback: "Keys identify rows; they do not order results." },
          ],
          explanation: "Without ORDER BY the engine returns rows in whatever order its plan produces — stable-looking today, changeable tomorrow.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-04",
      title: "LIMIT and OFFSET",
      minutes: 12,
      summary: "Take the top N rows, or page through results — always hand in hand with ORDER BY.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Take the top N rows with LIMIT",
        "Page through results with LIMIT and OFFSET",
        "Explain why LIMIT without ORDER BY is unreliable",
        "Describe why deep OFFSET paging gets slow on huge tables",
      ],
      why: "The first question about any ranked list is 'who's on top?' and the follow-up is 'show me the next ten'. LIMIT answers both, and together with ORDER BY it powers leaderboards, price-ascending catalogs, 'load more' buttons and every infinite scroll you have ever used. Knowing its pairing rule (never LIMIT without ORDER) and its scaling limit (OFFSET re-reads everything it skips) makes you sound — and code — like a professional.",
      blocks: [
        {
          kind: "text",
          text: "You met LIMIT already — every lesson keeps its output small with it. Formally: LIMIT n returns at most n rows, taken after sorting, filtering and computing are done. With ORDER BY it becomes a top-N machine:",
        },
        {
          kind: "sql",
          title: "The top-3 machine",
          code: "SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 3;",
          result: { columns: ["name", "price"], rows: [
        ["StudioBook X Creator", "2499.00"],
        ["AeroBook 16 Pro Laptop", "2199.00"],
        ["Zenith X20 Mirrorless", "1499.00"],
      ] },
          explain: [
            "Sort all rows by price, biggest first — then keep the first three.",
            "The order of clauses is fixed: WHERE filters, ORDER BY sorts, LIMIT cuts. SQL is a pipeline, not a sequence of steps you choose.",
          ],
        },
        { kind: "heading", text: "Paging: LIMIT plus OFFSET" },
        {
          kind: "text",
          text: "**OFFSET** n skips the first n rows of the sorted result before applying LIMIT. LIMIT 10 OFFSET 0 is page one, OFFSET 10 page two, OFFSET 20 page three — the arithmetic behind every 'next page' button:",
        },
        {
          kind: "sql",
          title: "Page two of the cheap list",
          code: "SELECT name, price\nFROM products\nORDER BY price, product_id\nLIMIT 5 OFFSET 5;",
          result: { columns: ["name", "price"], rows: [
        ["TravelPod Tripod Kit", "79.00"],
        ["TrailBack 25L Backpack", "79.00"],
        ["BassStation Mini Speaker", "89.00"],
        ["HomeEye Indoor Camera", "89.00"],
        ["PulseFit SE Tracker", "99.00"],
      ] },
          explain: [
            "The first five cheapest products are skipped (page one), the next five returned (page two).",
            "The tiebreaker product_id in the ORDER BY matters enormously here: without it, two products priced 129.00 could swap pages between clicks.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "LIMIT without ORDER BY is a dice roll",
          text: "'Give me 5 products' with no ORDER BY takes whatever five the engine hands you — possibly different five on the next run. If any specific rows are wanted (top, first, random-ish), there must be an ORDER BY expressing which.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "The scaling footnote",
          text: "OFFSET 100000 makes the engine produce and discard a hundred thousand rows before your page — fine for hundreds of rows, ruinous for millions. Real systems page by key ('later than id X') instead. You will not need that trick in this course's data; you should know it exists.",
        },
        {
          kind: "lab",
          title: "Build the podium and page four",
          task: "Two runs: (1) the top 3 best-reviewed products that HAVE a rating (rating IS NOT NULL, ORDER BY rating DESC, name as tiebreaker); (2) then change to LIMIT 3 OFFSET 9 to jump deep into the alphabetical customer list — ORDER BY city, customer_id to keep pages stable.",
          code: "SELECT name, rating\nFROM products\nWHERE rating IS NOT NULL\nORDER BY rating DESC, name\nLIMIT 3;",
          dataset: "ecommerce",
          hint: "For the second run, swap table and sort: customers, ORDER BY city, customer_id LIMIT 3 OFFSET 9.",
        },
      ],
      terms: [
        { term: "LIMIT", definition: "Return at most n rows — applied after filtering and sorting." },
        { term: "OFFSET", definition: "Skip the first n sorted rows before applying LIMIT — the paging arithmetic." },
        { term: "Top-N query", definition: "ORDER BY + LIMIT: rank everything, keep the best n." },
      ],
      mistakes: [
        {
          mistake: "LIMIT without ORDER BY for 'top' anything",
          why: "The five rows you get are whichever five the plan produced — not the top of anything.",
          fix: "ORDER BY defines which rows ARE the top; LIMIT then keeps them.",
        },
        {
          mistake: "Paging without a full deterministic sort",
          why: "Ties left unresolved can wander between pages — a row appears twice or vanishes as users click.",
          fix: "End every paging sort with a unique tiebreaker (usually the primary key).",
        },
        {
          mistake: "Computing page offsets by hand each time",
          why: "OFFSET = (page - 1) * size is simple math, but hand-typed numbers drift.",
          fix: "Let the application compute it: page and size in, OFFSET out.",
        },
      ],
      takeaways: [
        "LIMIT cuts after the pipeline finishes: WHERE, then ORDER BY, then LIMIT.",
        "OFFSET pages: LIMIT size OFFSET (page-1)*size.",
        "Never LIMIT for 'top N' without the ORDER BY that defines 'top'.",
        "Deep OFFSET is O(skipped rows) — big systems page by key instead.",
      ],
      quiz: [
        {
          id: "c-04-q1",
          prompt: "LIMIT 5 OFFSET 10 on a sorted list — which rows do you get?",
          options: [
            { text: "Rows 11 through 15 of the sorted order", correct: true, feedback: "Correct — ten skipped, five kept: page three of five-per-page." },
            { text: "The first five rows, then ten more", correct: false, feedback: "OFFSET comes before LIMIT in effect: skip, then take." },
            { text: "Rows 5 through 10", correct: false, feedback: "That would be LIMIT 5 OFFSET 4 (1-based thinking is the trap)." },
          ],
          explanation: "OFFSET skips 10 rows, LIMIT then keeps the next 5 — the 11th through 15th of the sort order.",
        },
        {
          id: "c-04-q2",
          prompt: "Why must a paged query end with a unique tiebreaker in its ORDER BY?",
          options: [
            { text: "To make pages faster", correct: false, feedback: "Speed is unaffected; determinism is the point." },
            { text: "So ties cannot wander between pages across clicks", correct: true, feedback: "Correct — without it, equal-keyed rows may reorder, duplicating or losing rows across pages." },
            { text: "PostgreSQL requires unique ORDER BY keys", correct: false, feedback: "It does not — the requirement is yours, for stability." },
          ],
          explanation: "A unique final key pins every row's position; pages then partition the list identically on every click.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-05",
      title: "DISTINCT — unique values",
      minutes: 12,
      summary: "Collapse duplicates in your results: unique cities, unique pairs, and the difference between distinct values and distinct rows.",
      kind: "coding",
      dataset: "hr",
      objectives: [
        "Return the unique values of one column with DISTINCT",
        "Explain that DISTINCT on multiple columns deduplicates whole ROWS",
        "Count distinct values with count(DISTINCT ...)",
        "Pair DISTINCT with ORDER BY for readable unique lists",
      ],
      why: "Real data repeats: many customers share a city, many orders share a status, many employees share a job title. 'Which cities do we ship to?', 'what statuses exist?', 'how many distinct products were actually ordered?' — these inventory questions are DISTINCT's job. Understanding that DISTINCT sees whole ROWS (not single columns) is the difference between an exact answer and a subtly wrong one.",
      blocks: [
        {
          kind: "text",
          text: "SELECT DISTINCT collapses duplicate rows into one. On a single column it reads naturally: the unique values. The query below answers 'which job titles exist in HeliosWorks engineering?' in one line:",
        },
        {
          kind: "sql",
          title: "The unique list",
          code: "SELECT DISTINCT job_title\nFROM employees\nWHERE dept_id = 2\nORDER BY job_title;",
          result: { columns: ["job_title"], rows: [
        ["Backend Engineer"],
        ["DevOps Engineer"],
        ["Engineering Manager"],
        ["Frontend Engineer"],
        ["QA Engineer"],
        ["Senior Backend Engineer"],
        ["Senior Frontend Engineer"],
        ["VP of Engineering"],
      ] },
          explain: [
            "The engineering department's staff collapse into its handful of distinct titles.",
            "DISTINCT applies to the whole SELECT list — with one column, that is the unique values of that column.",
          ],
        },
        { kind: "heading", text: "DISTINCT sees whole rows" },
        {
          kind: "text",
          text: "Add more columns and DISTINCT does not get smarter about each one — it deduplicates the **combination**. This trips everyone once: `SELECT DISTINCT city, state` keeps every unique city-state PAIR, even if many cities repeat across states:",
        },
        {
          kind: "sql",
          title: "Unique combinations, not unique columns",
          code: "SELECT DISTINCT city, state\nFROM (SELECT 'Springfield' AS city, 'OR' AS state, 1 AS x\n      UNION ALL SELECT 'Springfield', 'OR', 2\n      UNION ALL SELECT 'Springfield', 'MA', 3) AS places;",
          result: { columns: ["city", "state"], rows: [
        ["Springfield", "MA"],
        ["Springfield", "OR"],
      ] },
          explain: [
            "Three input rows: two identical Springfields-OR and one Springfield-MA.",
            "DISTINCT keeps two rows: (Springfield, OR) and (Springfield, MA) — the PAIR is the unit, so the two OR rows collapsed but the MA row survived.",
            "The third column x is not in the SELECT list, so it never mattered.",
          ],
        },
        { kind: "heading", text: "Counting the uniques" },
        {
          kind: "sql",
          title: "How many distinct things?",
          code: "SELECT count(DISTINCT dept_id) AS departments_with_staff,\n       count(DISTINCT job_title) AS distinct_titles\nFROM employees\nWHERE terminated IS NULL;",
          result: { columns: ["departments_with_staff", "distinct_titles"], rows: [
        ["8", "23"],
      ] },
          explain: [
            "count(DISTINCT x) collapses first, then counts — the number of different values, not the number of rows.",
            "The filter keeps current staff only, so the counts describe the company as it stands.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "A peek ahead",
          text: "count(DISTINCT ...) is an aggregate — your first taste of Part E, where counting, summing and averaging per group become the main event.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "DISTINCT is a smell (sometimes)",
          text: "When a query 'returns duplicates' and someone bolts DISTINCT on top, the real cause is usually a join multiplying rows (Part F) or a missing condition. DISTINCT hides symptoms; understand your duplicates before vanishing them.",
        },
        {
          kind: "lab",
          title: "Inventory the domains",
          task: "Answer three HeliosWorks inventory questions in turn: (1) which departments appear in the salaries history — distinct dept via the employees join is ahead of you, so use the departments table directly: select distinct name from departments; (2) how many distinct job titles exist among CURRENT employees; (3) the distinct manager_ids employees report to (NULL will show as one of the values — the CEO's missing manager).",
          code: "SELECT DISTINCT manager_id\nFROM employees\nWHERE terminated IS NULL\nORDER BY manager_id;",
          dataset: "hr",
          hint: "For (2): count(DISTINCT job_title). The NULL row in (3) sorts first ascending — it is the CEO.",
        },
      ],
      terms: [
        { term: "SELECT DISTINCT", definition: "Collapses duplicate rows in the result — the whole SELECT list is the unit." },
        { term: "count(DISTINCT x)", definition: "Aggregate counting the number of different values, not rows." },
        { term: "Deduplication", definition: "Removing duplicates; DISTINCT is SQL's built-in form." },
      ],
      mistakes: [
        {
          mistake: "Expecting DISTINCT per column",
          why: "SELECT DISTINCT city, state does not give unique cities AND unique states separately — it gives unique pairs.",
          fix: "Think rows: which whole-row combinations exist? One column per query for simple unique lists.",
        },
        {
          mistake: "Using DISTINCT to silence unexpected duplicates",
          why: "Duplicates usually mean a join multiplied rows or a condition is missing; DISTINCT masks the bug while corrupting counts.",
          fix: "Explain the duplication first (run the query without DISTINCT and look), then decide.",
        },
      ],
      takeaways: [
        "DISTINCT deduplicates whole rows; with one column, it is the unique values.",
        "count(DISTINCT x) counts different values — an aggregate in disguise.",
        "Pair DISTINCT with ORDER BY for a readable unique list.",
        "Unexplained duplicates are a symptom — diagnose before DISTINCT-ing them away.",
      ],
      quiz: [
        {
          id: "c-05-q1",
          prompt: "SELECT DISTINCT city, state FROM customers — what is deduplicated?",
          options: [
            { text: "Each column separately: unique cities and, independently, unique states", correct: false, feedback: "There is no per-column mode — the row is the unit." },
            { text: "Whole rows: unique city-and-state combinations", correct: true, feedback: "Correct — the pair must match entirely to collapse." },
            { text: "Nothing; DISTINCT needs exactly one column", correct: false, feedback: "It accepts any list; the list together is the unit." },
          ],
          explanation: "DISTINCT compares complete result rows. Two rows collapse only when every selected column matches.",
        },
        {
          id: "c-05-q2",
          prompt: "count(DISTINCT city) on 20 customers from 12 cities returns...",
          options: [
            { text: "20", correct: false, feedback: "That is count(*): the rows, repeats included." },
            { text: "12", correct: true, feedback: "Correct — distinct first, then count: the number of different cities." },
            { text: "An error; DISTINCT cannot nest in count", correct: false, feedback: "count(DISTINCT x) is standard SQL, and you just used it." },
          ],
          explanation: "The DISTINCT inside collapses repeats before counting — 12 different cities, however many customers share them.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-06",
      title: "Combining results: UNION, INTERSECT and EXCEPT",
      minutes: 14,
      summary: "Stack, cross and subtract whole result sets — with column matching rules and the UNION ALL distinction.",
      kind: "coding",
      dataset: "university",
      objectives: [
        "Stack results with UNION and UNION ALL",
        "Find common rows with INTERSECT and differences with EXCEPT",
        "Match column counts and types across the combined sets",
        "Sort a combined result once, at the end",
      ],
      why: "Some questions are about two queries at once: 'customers from Portland AND customers who spent over $500' as one list; 'courses nobody enrolled in'; 'products ordered this month but not last'. Set operations combine whole result sets vertically — stacking, intersecting, subtracting — and they make possible the questions a single SELECT cannot ask. They also power the classic 'new versus returning' analyses you will build in the case studies.",
      blocks: [
        {
          kind: "text",
          text: "Set operations work on whole result sets, stacked vertically. The rule first: **both sides must return the same number of columns, with compatible types**, matched by position. Then UNION glues, INTERSECT keeps rows present in both, EXCEPT keeps rows of the left side missing from the right.",
        },
        { kind: "heading", text: "UNION — the vertical glue" },
        {
          kind: "sql",
          title: "One list from two questions",
          code: "SELECT first_name, last_name, 'student' AS role\nFROM students\nWHERE enrollment_year = 2026\nUNION\nSELECT first_name, last_name, 'professor' AS role\nFROM professors\nWHERE title = 'assistant'\nORDER BY role, last_name;",
          result: { columns: ["first_name", "last_name", "role"], rows: [
        ["Gordon", "Blackwood", "professor"],
        ["Rosa", "Delgado", "professor"],
        ["Cheng", "Liu", "professor"],
        ["Jennifer", "Okafor", "professor"],
        ["Yuki", "Ono", "student"],
        ["Ravi", "Patel", "student"],
      ] },
          explain: [
            "Two queries over two different tables — students and professors — each contributing the same three columns.",
            "The literal 'student' / 'professor' tags each row with where it came from (a constant expression in the SELECT list).",
            "ORDER BY comes ONCE, after the union, sorting the combined whole.",
          ],
        },
        {
          kind: "text",
          text: "UNION quietly **deduplicates** — a row appearing on both sides survives once. When you WANT repeats (a true stack, like two exports glued together), say **UNION ALL** — it is also faster, because no duplicate check runs:",
        },
        {
          kind: "sql",
          title: "UNION ALL keeps everything",
          code: "SELECT 'departments' AS thing, count(*)::text AS n FROM departments\nUNION ALL\nSELECT 'courses', count(*)::text FROM courses\nUNION ALL\nSELECT 'students', count(*)::text FROM students\nORDER BY n DESC;",
          result: { columns: ["thing", "n"], rows: [
        ["departments", "6"],
        ["students", "22"],
        ["courses", "19"],
      ] },
          explain: [
            "Three counts stacked as rows — UNION ALL because each count is already distinct; dedup work would be wasted.",
            "The counts are cast to text (::text) so all columns share a type — the matching rule in action.",
          ],
        },
        { kind: "heading", text: "INTERSECT and EXCEPT — set logic" },
        {
          kind: "sql",
          title: "EXCEPT: the anti-question",
          code: "SELECT course_id, code\nFROM courses\nEXCEPT\nSELECT e.course_id, c.code\nFROM enrollments e\nJOIN courses c ON c.course_id = e.course_id\nORDER BY course_id;",
          result: { columns: ["course_id", "code"], rows: [
        ["19", "CS 495"],
      ] },
          explain: [
            "Left side: every course. Right side: every course that has at least one enrollment (a join — Part F makes you fluent).",
            "EXCEPT keeps left-side rows with no right-side twin: courses nobody ever took — exactly one, CS 495.",
            "The join in the right arm is a preview; read it as 'courses with enrollments'.",
          ],
        },
        {
          kind: "table",
          title: "The three operations",
          headers: ["Operation", "Keeps", "Deduplicates?"],
          rows: [
            ["UNION", "All rows from both sides", "Yes — identical rows collapse"],
            ["UNION ALL", "All rows from both sides", "No — a true stack, faster"],
            ["INTERSECT", "Rows present in BOTH sides", "Yes"],
            ["EXCEPT", "Left-side rows ABSENT from the right", "Yes"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "EXCEPT is the cleanest 'never' operator",
          text: "'Customers who never ordered', 'products never reviewed', 'students who took no course' — anti-questions read beautifully as EXCEPT (or NOT EXISTS in Part G). Choose the shape that says what you mean.",
        },
        {
          kind: "lab",
          title: "Stack your own report",
          task: "Build a single-column loyalty list: the last names of students (from students) UNION the last names of professors — deduplicated and sorted, so shared surnames appear once. Add ORDER BY last_name.",
          code: "SELECT last_name FROM students\nUNION\nSELECT last_name FROM professors\nORDER BY last_name;",
          dataset: "university",
          hint: "One column each side, same type — the matching rule satisfied trivially.",
        },
      ],
      terms: [
        { term: "UNION", definition: "Stacks two result sets, deduplicating identical rows." },
        { term: "UNION ALL", definition: "Stacks without deduplication — faster, keeps repeats." },
        { term: "INTERSECT", definition: "Rows present in both result sets." },
        { term: "EXCEPT", definition: "Rows of the left result set absent from the right — the anti-question operator." },
      ],
      mistakes: [
        {
          mistake: "Mismatched column counts or types across the sides",
          why: "Set operations match columns by position; 2 columns left and 3 right is an error, text-vs-number often coerces confusingly.",
          fix: "Same count, compatible types, matched order — the first column names the output.",
        },
        {
          mistake: "Using UNION where UNION ALL is meant",
          why: "UNION's silent dedup hides legitimate repeats and burns time checking for them.",
          fix: "Want repeats or know there are none? UNION ALL. Want the mathematical set? UNION.",
        },
        {
          mistake: "ORDER BY inside each side instead of once at the end",
          why: "Only one final order exists; per-side ORDER BY is meaningless (and an error without parentheses).",
          fix: "One ORDER BY after the last set operation sorts the combined result.",
        },
      ],
      takeaways: [
        "Set operations stack result sets vertically, matching columns by position.",
        "UNION deduplicates; UNION ALL stacks raw and fast.",
        "INTERSECT keeps both-sides rows; EXCEPT keeps left-only rows — the anti-question.",
        "Sort once, at the end, over the combined whole.",
      ],
      quiz: [
        {
          id: "c-06-q1",
          prompt: "Why does UNION ALL exist when UNION already stacks?",
          options: [
            { text: "UNION ALL keeps duplicates and skips the dedup work — faster when repeats are wanted or impossible", correct: true, feedback: "Correct — it is the honest stack." },
            { text: "UNION ALL sorts the result", correct: false, feedback: "Neither operation sorts; ORDER BY does that, once, at the end." },
            { text: "UNION ALL allows mismatched columns", correct: false, feedback: "The matching rule applies to every set operation." },
          ],
          explanation: "UNION pays a dedup tax; UNION ALL refuses it. Same stacking, different truth about duplicates.",
        },
        {
          id: "c-06-q2",
          prompt: "'Courses that no student has ever taken' is expressed most directly as...",
          options: [
            { text: "All courses UNION all enrolled courses", correct: false, feedback: "UNION merges — you would get everything, once each." },
            { text: "All courses EXCEPT enrolled courses", correct: true, feedback: "Correct — subtract the enrolled ones; what remains was never taken." },
            { text: "All courses INTERSECT enrolled courses", correct: false, feedback: "INTERSECT keeps the overlap — the opposite of the question." },
          ],
          explanation: "EXCEPT is the anti-question operator: left side minus right side leaves exactly the never-enrolled.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "c-07",
      title: "Putting it together",
      minutes: 16,
      summary: "The single-table toolkit in action: realistic business questions, answered precisely, across four databases.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Translate a business question into a precise query",
        "Combine column choice, expressions, filtering, sorting and paging",
        "Choose the right deduplication or set operation for a question",
        "Self-check results by reading them critically",
      ],
      why: "Knowing the clauses is necessary and not sufficient: the real skill is translation — hearing 'who are our best students in Northgate?' and producing the exact query. This lesson is pure practice on real data: seven business questions across four databases, each solved with nothing but this part's toolkit. Doing them in the Lab, reading the outputs, and pausing on anything surprising is where the clauses become instinct.",
      blocks: [
        {
          kind: "text",
          text: "How to read this lesson: each lab is a question a stakeholder might actually ask. Try writing the query yourself FIRST — in the Lab, from a blank line — before studying the provided one. The struggle is the learning; the sample is the check.",
        },
        {
          kind: "lab",
          title: "Q1 — The premium catalog (ecommerce)",
          task: "Merchandising asks: 'Products over $500, still in stock — name and price, most expensive first.' Write it, run it, then compare. Watch the exact comparison operators you choose.",
          code: "SELECT name, price\nFROM products\nWHERE price > 500\n  AND stock > 0\nORDER BY price DESC;",
          dataset: "ecommerce",
          hint: "Over 500 — strictly? Or 500 and up? Pick deliberately; both are defensible, only one matches the ask.",
        },
        {
          kind: "lab",
          title: "Q2 — The honor roll (university)",
          task: "The dean asks: 'Students with a GPA of 3.5 or better — full name and GPA, best first, ties alphabetical.' Freshmen without GPAs must not appear as zeros.",
          code: "SELECT first_name || ' ' || last_name AS student, gpa\nFROM students\nWHERE gpa >= 3.5\nORDER BY gpa DESC, last_name;",
          dataset: "university",
          hint: "NULL GPAs fail every comparison — here that is exactly the behavior you want; say why in a comment.",
        },
        {
          kind: "lab",
          title: "Q3 — The busy states (ecommerce)",
          task: "Logistics asks: 'Which states do our customers actually live in — and how many different cities per state?' Deliver a list of distinct state values with a count of distinct cities for each. (The per-state grouping needs GROUP BY — Part E. For now: produce the distinct state list, then the distinct city list, and note which question needs the future tool.)",
          code: "SELECT DISTINCT state\nFROM customers\nORDER BY state;",
          dataset: "ecommerce",
          hint: "count(DISTINCT city) per state is one query after Part E. Two flat lists answer a surprising amount in the meantime.",
        },
        {
          kind: "lab",
          title: "Q4 — The expensive aisle (retail)",
          task: "The stock controller asks: 'Our five most expensive products by retail price, with cost and the markup in dollars — labeled clearly.' The markup is price minus cost.",
          code: "SELECT name, cost, price,\n       price - cost AS markup\nFROM products\nORDER BY price DESC\nLIMIT 5;",
          dataset: "retail",
          hint: "Three toolkit pieces in one query: expression, sort, limit.",
        },
        {
          kind: "lab",
          title: "Q5 — The never-bought (ecommerce)",
          task: "The buyer asks: 'Which products have never appeared in any order?' You know one shape already (EXCEPT). Run it, read the result, and note the count.",
          code: "SELECT product_id, name\nFROM products\nEXCEPT\nSELECT oi.product_id, p.name\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nORDER BY product_id;",
          dataset: "ecommerce",
          hint: "The right arm joins order_items to products for names — Part F teaches joins; for now, read it as 'products that were ordered'.",
        },
        {
          kind: "lab",
          title: "Q6 — The tenure list (hr)",
          task: "People Ops asks: 'Current engineering staff, earliest hires first — name, title and hire date. Engineering is dept_id 2.' One filter, one sort, one honest column list.",
          code: "SELECT first_name || ' ' || last_name AS employee,\n       job_title, hire_date\nFROM employees\nWHERE dept_id = 2\n  AND terminated IS NULL\nORDER BY hire_date;",
          dataset: "hr",
          hint: "Two filters AND-ed: the department and the current-staff test.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The translation habit",
          text: "For every question, say the shape out loud before typing: WHICH columns, FROM what, filtered HOW, sorted HOW, cut to HOW MANY. The clauses of this part are that checklist, in order.",
        },
      ],
      terms: [
        { term: "Query translation", definition: "Turning a business question into clauses: columns, table, filter, sort, limit." },
        { term: "Self-check", definition: "Reading your own result critically — counts, order, missing rows — before shipping it." },
        { term: "Deterministic query", definition: "A query whose output cannot vary between runs — always sorts with full tiebreakers." },
      ],
      mistakes: [
        {
          mistake: "Typing a query before deciding what 'top' or 'over' means exactly",
          why: "Vague predicates produce confident wrong answers — strictly greater versus at least, inclusive versus exclusive ends.",
          fix: "Pin the wording first ('over 500' — is 500.00 in or out?), then write the operator you meant.",
        },
        {
          mistake: "Shipping the first result that looks plausible",
          why: "Plausible outputs hide off-by-one limits, forgotten filters and NULL surprises.",
          fix: "Read the result like a skeptic: do the counts, the order and the boundary rows match the question?",
        },
      ],
      takeaways: [
        "Translation is the skill: question, then clauses — columns, table, filter, sort, limit.",
        "The single-table toolkit already answers a remarkable share of real questions.",
        "Read your own results skeptically before anyone else does.",
        "When a question needs more (per-group counts, joins), name the missing tool — Parts E and F deliver them.",
      ],
      quiz: [
        {
          id: "c-07-q1",
          prompt: "A stakeholder says 'our best customers'. What must you pin down before writing the query?",
          options: [
            { text: "Nothing — 'best' obviously means biggest spenders", correct: false, feedback: "It could mean most orders, most recent, highest average order... assumption is where wrong answers are born." },
            { text: "The exact measure (total spend? order count?) and the timeframe", correct: true, feedback: "Correct — define 'best' and 'when' before a single clause is typed." },
            { text: "Only the table name", correct: false, feedback: "The table follows from the question's meaning; the meaning comes first." },
          ],
          explanation: "'Best' is a business definition, not a SQL keyword. Pin the metric and window, then write the query that computes it.",
        },
        {
          id: "c-07-q2",
          prompt: "Your top-5 query returns four rows. What is the most likely explanation?",
          options: [
            { text: "LIMIT 5 is broken", correct: false, feedback: "LIMIT caps; it never invents rows. Fewer rows means fewer passed the filters." },
            { text: "Only four rows satisfied the filters — check the WHERE conditions and the data", correct: true, feedback: "Correct — read the unfiltered version and see which rows your predicates removed." },
            { text: "The table only has four rows", correct: false, feedback: "Possible, but check before assuming — remove LIMIT and look." },
          ],
          explanation: "LIMIT is a ceiling. Fewer rows means the pipeline upstream (filtering, dedup) left fewer — inspect without the LIMIT and with looser filters.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "c-b1",
      tier: "beginner",
      mode: "sql",
      title: "Name and price of the audio gear",
      prompt: "The ShopSphere categories table maps category_id 2 to Audio. Return the name and price of every Audio product, sorted by price ascending (cheapest first). Expected columns: name, then price — one row per Audio product. Ties in price are acceptable in any order.",
      dataset: "ecommerce",
      sampleTables: ["products", "categories"],
      hint: "One WHERE on category_id, one ORDER BY.",
      starter: "SELECT name, price\nFROM products\n-- filter and sort here\n",
      solution: `SELECT name, price
FROM products
WHERE category_id = 2
ORDER BY price;`,
      ordered: false,
      expected: { columns: ["name", "price"], rows: [
        ["BassStation Mini Speaker", "89.00"],
        ["SoundCore Lite Earbuds", "129.00"],
        ["WaveRider Waterproof Buds", "129.00"],
        ["StudioMic Pro USB", "179.00"],
        ["SoundCore ANC Headphones", "249.00"],
      ] },
      explanation:
        "The filter keeps the five Audio products; the sort puts the Boomwerk buds (89.00) first and the ANC headphones (249.00) last. Note the tie: two products cost exactly 129.00, which is why the exercise does not grade order strictly between equal prices.",
      concepts: ["WHERE", "ORDER BY"],
    },
    {
      id: "c-b2",
      tier: "beginner",
      mode: "sql",
      title: "Cheap and in stock",
      prompt: "Return the name, price and stock of products costing less than 60 dollars that still have stock on hand (stock greater than 0). Sort by price ascending, then by name ascending so ties behave identically on every run. Expected columns: name, price, stock — in that order.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "Two comparisons AND-ed together, two sort keys.",
      starter: "SELECT name, price, stock\nFROM products\n",
      solution: `SELECT name, price, stock
FROM products
WHERE price < 60
  AND stock > 0
ORDER BY price, name;`,
      ordered: true,
      expected: { columns: ["name", "price", "stock"], rows: [
        ["MoodLight Strip 5m", "29.00", "75"],
        ["SmartPlug 4-Pack", "39.00", "120"],
        ["FlexStand Aluminum Dock", "49.00", "36"],
        ["ChargeHub 100W GaN", "59.00", "90"],
      ] },
      explanation:
        "Both conditions must hold — the AND discards cheap-but-sold-out and stocked-but-pricey alike. The second sort key (name) pins the order of equal prices, making the output deterministic; that habit earns its keep the day your report pages.",
      concepts: ["WHERE", "AND", "ORDER BY", "tie-breaking"],
    },
    {
      id: "c-b3",
      tier: "beginner",
      mode: "sql",
      title: "The honor roll, top five",
      prompt: "The dean wants the top five students by GPA — full name as one column labeled student, then gpa — best first, ties broken alphabetically by last name. Students with no GPA yet (NULL) must not appear. Expected columns: student, gpa; five rows, best first.",
      dataset: "university",
      sampleTables: ["students"],
      hint: "gpa IS NOT NULL in the WHERE; ORDER BY gpa DESC, last_name; LIMIT 5.",
      starter: "SELECT first_name || ' ' || last_name AS student, gpa\nFROM students\n",
      solution: `SELECT first_name || ' ' || last_name AS student, gpa
FROM students
WHERE gpa IS NOT NULL
ORDER BY gpa DESC, last_name
LIMIT 5;`,
      ordered: true,
      expected: { columns: ["student", "gpa"], rows: [
        ["Sophie Laurent", "3.90"],
        ["Alice Bennett", "3.82"],
        ["Mila Novak", "3.75"],
        ["Nadia Rahman", "3.68"],
        ["Jonah Reyes", "3.65"],
      ] },
      explanation:
        "Three clauses cooperate: the filter removes the GPA-less freshmen (their NULL would neither beat nor lose the >= test — it just silently drops out), the sort ranks best-first with an alphabetical tiebreaker, and LIMIT crowns the top five. Concatenation with || builds the readable student label.",
      concepts: ["IS NOT NULL", "ORDER BY", "LIMIT", "concatenation"],
    },
    {
      id: "c-b4",
      tier: "beginner",
      mode: "sql",
      title: "Where do we ship?",
      prompt: "Logistics needs the distinct list of states customers live in, alphabetically. Return a single column named state with one row per distinct value. Expected output: the sorted set of states, no duplicates.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "SELECT DISTINCT ... ORDER BY.",
      starter: "SELECT DISTINCT state\nFROM customers\n",
      solution: `SELECT DISTINCT state
FROM customers
ORDER BY state;`,
      ordered: true,
      expected: { columns: ["state"], rows: [
        ["CA"],
        ["CO"],
        ["FL"],
        ["GA"],
        ["IL"],
        ["MA"],
        ["NJ"],
        ["OR"],
        ["TX"],
        ["WA"],
      ] },
      explanation:
        "DISTINCT collapses the twenty customers into the states they span; ORDER BY makes the list readable and stable. This one-column unique list is the most common DISTINCT shape — the inventory question every dashboard starts with.",
      concepts: ["DISTINCT", "ORDER BY"],
    },
    {
      id: "c-i1",
      tier: "intermediate",
      mode: "sql",
      title: "The mid-range search",
      prompt: "A shopper wants laptops (category_id 1) priced between 800 and 1500 dollars, both ends inclusive. Return name, price and stock for each, sorted by price descending. Expected columns: name, price, stock — with the laptops inside the range only, most expensive first.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "BETWEEN is inclusive on both ends — or write the two comparisons yourself.",
      starter: "SELECT name, price, stock\nFROM products\n",
      solution: `SELECT name, price, stock
FROM products
WHERE category_id = 1
  AND price BETWEEN 800 AND 1500
ORDER BY price DESC;`,
      ordered: true,
      expected: { columns: ["name", "price", "stock"], rows: [
        ["AeroBook 14 Laptop", "1299.00", "14"],
        ["WorkMate 15 Business", "899.00", "22"],
      ] },
      explanation:
        "BETWEEN 800 AND 1500 keeps the WorkMate (899), AeroBook 14 (1299) and nothing else — the AeroBook 16 (2199) and BudgetBook (399) fall outside. Remember both endpoints count; the equivalent longhand is price >= 800 AND price <= 1500.",
      concepts: ["BETWEEN", "AND", "ORDER BY DESC"],
    },
    {
      id: "c-i2",
      tier: "intermediate",
      mode: "sql",
      title: "Names and emails, filtered by domain",
      prompt: "The university IT office wants professors with a northgate.edu email whose last name starts with a letter between A and L (inclusive) — for a directory page. Return first_name, last_name and email, sorted by last_name. Use LIKE with a character class for the name range. Expected columns: first_name, last_name, email.",
      dataset: "university",
      sampleTables: ["professors"],
      hint: "LIKE '[A-L]%' is SQL Server syntax — PostgreSQL character classes are written like '^[A-L]' with regular expressions, OR simpler: last_name < 'M' does it with pure comparison. Pick the comparison route.",
      starter: "SELECT first_name, last_name, email\nFROM professors\n",
      solution: `SELECT first_name, last_name, email
FROM professors
WHERE email LIKE '%@northgate.edu'
  AND last_name < 'M'
ORDER BY last_name;`,
      ordered: true,
      expected: { columns: ["first_name", "last_name", "email"], rows: [
        ["Gordon", "Blackwood", "g.blackwood@northgate.edu"],
        ["Stefan", "Brandt", "s.brandt@northgate.edu"],
        ["Rosa", "Delgado", "r.delgado@northgate.edu"],
        ["Marcus", "Feld", "m.feld@northgate.edu"],
        ["Isabel", "Ferreira", "i.ferreira@northgate.edu"],
        ["Fatima", "Haddad", "f.haddad@northgate.edu"],
        ["Tomas", "Lindqvist", "t.lindqvist@northgate.edu"],
        ["Cheng", "Liu", "c.liu@northgate.edu"],
      ] },
      explanation:
        "Text compares alphabetically: last_name < 'M' is exactly 'A through L'. LIKE '%@northgate.edu' anchors the domain check. Every professor has that domain here, so the name comparison does the real filtering — but the email condition documents intent and would matter the day an external address appears.",
      concepts: ["LIKE", "text comparison", "AND"],
    },
    {
      id: "c-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Stock value leaderboard",
      prompt: "For each product in the retail chain, compute what its total stock is worth at cost: on_hand summed across stores times the product's cost. You cannot sum across stores yet (that is Part E's GROUP BY) — so restrict the question: for the DOWNTOWN FLAGSHIP store only (store_id 1), return product name, cost, on_hand and the computed stock_value (cost times on_hand), for every stocked product, sorted by stock_value descending, top 6 rows only. Expected columns: name, cost, on_hand, stock_value.",
      dataset: "retail",
      sampleTables: ["inventory", "products", "stores"],
      hint: "inventory holds on_hand per (store, product); products holds cost. Filter inventory to store_id 1 first — the join to products comes in Part F; for now pick products whose ids appear... careful: without a join you cannot get names. ALTERNATIVE allowed in the solution preview: use the JOIN shape you saw in lesson c-07's Q4-style examples.",
      starter: "-- join inventory (store 1) to products for names, compute, sort, limit\n",
      solution: `SELECT p.name, p.cost, i.on_hand,
       p.cost * i.on_hand AS stock_value
FROM inventory i
JOIN products p ON p.product_id = i.product_id
WHERE i.store_id = 1
ORDER BY stock_value DESC
LIMIT 6;`,
      ordered: true,
      expected: { columns: ["name", "cost", "on_hand", "stock_value"], rows: [
        ["StormShell Rain Jacket", "79.00", "20", "1580.00"],
        ["Alpine 45L Backpack", "84.00", "18", "1512.00"],
        ["Skyline 2P Tent", "138.00", "9", "1242.00"],
        ["RidgeDay 22L Daypack", "28.00", "44", "1232.00"],
        ["SummitDown 20F Sleeping Bag", "96.00", "12", "1152.00"],
        ["Horizon Polarized Sunglasses", "34.00", "29", "986.00"],
      ] },
      explanation:
        "The JOIN (Part F's subject, previewed here as in the lessons) matches each inventory row to its product for the name; the expression multiplies cost by units on hand; the sort and limit crown the flagship store's most capital-heavy stock. The pattern — join for names, compute on the way out, sort on the computed value — repeats across every report you will ever write.",
      concepts: ["join preview", "expressions", "ORDER BY", "LIMIT"],
    },
    {
      id: "c-i4",
      tier: "intermediate",
      mode: "sql",
      title: "Page three of the roster",
      prompt: "People Ops wants page three of the current-employee roster, five per page, ordered by hire_date ascending (earliest hires first) with employee_id as the tiebreaker. Return employee_id, first_name, last_name and hire_date. Expected columns in that order; exactly five rows — employees 11 through 15 of the sorted list.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Page three at five per page: LIMIT 5 OFFSET 10. Filter to current staff (terminated IS NULL) and sort deterministically first.",
      starter: "SELECT employee_id, first_name, last_name, hire_date\nFROM employees\n",
      solution: `SELECT employee_id, first_name, last_name, hire_date
FROM employees
WHERE terminated IS NULL
ORDER BY hire_date, employee_id
LIMIT 5 OFFSET 10;`,
      ordered: true,
      expected: { columns: ["employee_id", "first_name", "last_name", "hire_date"], rows: [
        ["12", "Grace", "Park", "2020-09-07"],
        ["20", "Maria", "Gonzalez", "2020-10-19"],
        ["9", "James", "Okoro", "2021-01-18"],
        ["18", "Chloe", "Dubois", "2021-03-01"],
        ["14", "Ingrid", "Sorensen", "2021-06-14"],
      ] },
      explanation:
        "OFFSET 10 skips pages one and two; LIMIT 5 keeps page three. The tiebreaker employee_id guarantees the same employees land on page three every time the query runs — without it, two hires sharing a date could swap pages between clicks.",
      concepts: ["LIMIT", "OFFSET", "paging", "tie-breaking"],
    },
    {
      id: "c-a1",
      tier: "advanced",
      mode: "sql",
      title: "The combined directory",
      prompt: "Build one directory of the Northgate community's newest members: the 2026-enrolled students UNION the professors hired after 2015 — with each row labeled by origin. Return three columns: full_name (first and last concatenated with a space, labeled full_name), role (the literal 'student' for student rows, 'professor' for professor rows) and origin_value (for students: the enrollment_year as text; for professors: the title). Sort by full_name ascending. Expected columns: full_name, role, origin_value.",
      dataset: "university",
      sampleTables: ["students", "professors"],
      hint: "Cast the year to text (::text) so both sides' third columns share a type; ORDER BY once, at the end.",
      starter: "SELECT first_name || ' ' || last_name AS full_name,\n       'student' AS role,\n       enrollment_year::text AS origin_value\nFROM students\n-- WHERE ... UNION the professors half ... ORDER BY\n",
      solution: `SELECT first_name || ' ' || last_name AS full_name,
       'student' AS role,
       enrollment_year::text AS origin_value
FROM students
WHERE enrollment_year = 2026
UNION
SELECT first_name || ' ' || last_name,
       'professor',
       title
FROM professors
WHERE hire_date > DATE '2015-12-31'
ORDER BY full_name;`,
      ordered: true,
      expected: { columns: ["full_name", "role", "origin_value"], rows: [
        ["Anika Rao", "professor", "associate"],
        ["Cheng Liu", "professor", "assistant"],
        ["Gordon Blackwood", "professor", "assistant"],
        ["Isabel Ferreira", "professor", "associate"],
        ["Jennifer Okafor", "professor", "assistant"],
        ["Ravi Patel", "student", "2026"],
        ["Rosa Delgado", "professor", "assistant"],
        ["Yuki Ono", "student", "2026"],
      ] },
      explanation:
        "Two different tables feed one directory: constant literals tag each row's origin, ::text unifies the third column's type, and the UNION (deduplicating, though no name collides here) stacks them. One ORDER BY at the end sorts the combined whole — per-side sorting is meaningless in a set operation.",
      concepts: ["UNION", "literals", "casting", "concatenation"],
    },
    {
      id: "c-a2",
      tier: "advanced",
      mode: "sql",
      title: "The waiting-money report",
      prompt: "Build a two-row-per-state report of where ShopSphere's money is waiting: one row for every distinct state customers live in, labeled source 'customers', UNION ALL one row for every distinct state containing a customer with a PENDING order (status 'pending', via the orders join, previewed in the lessons), labeled source 'pending' — then sort by state ascending, source ascending. States appearing under 'pending' are exactly where orders are waiting to be paid. Expected columns: state, source.",
      dataset: "ecommerce",
      sampleTables: ["customers", "orders"],
      hint: "Two SELECT DISTINCT arms, each two columns; the pending arm filters o.status = 'pending' inside the join. UNION ALL, not UNION — the labels differ.",
      starter: "SELECT DISTINCT state, 'customers' AS source\nFROM customers\nUNION ALL\n-- buyers: distinct states via the orders join, labeled 'buyers'\n",
      solution: `SELECT DISTINCT state, 'customers' AS source
FROM customers
UNION ALL
SELECT DISTINCT c.state, 'pending'
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'pending'
ORDER BY state, source;`,
      ordered: true,
      expected: { columns: ["state", "source"], rows: [
        ["CA", "customers"],
        ["CO", "customers"],
        ["FL", "customers"],
        ["GA", "customers"],
        ["IL", "customers"],
        ["MA", "customers"],
        ["NJ", "customers"],
        ["OR", "customers"],
        ["TX", "customers"],
        ["TX", "pending"],
        ["WA", "customers"],
        ["WA", "pending"],
      ] },
      explanation:
        "Same-shaped lists from two different questions stack under UNION ALL: the whole customer map versus the states holding unpaid orders (status 'pending', via the orders join). Two states surface under 'pending' — Texas and Washington — pinpointing exactly where the money is waiting on checkout. The labels ride along as literal columns, and the two-key sort makes the report stable.",
      concepts: ["UNION ALL", "DISTINCT", "join preview", "labels"],
    },
    {
            id: "c-a3",
      tier: "advanced",
      mode: "sql",
      title: "The exclusive club, three ways",
      prompt: "Students who majored in Computer Science (dept_id 1) but have NEVER been enrolled in a CS course (dept_id 1 courses) — an exclusive club indeed. Return student_id, first_name, last_name for each such student, sorted by student_id. Use the EXCEPT shape: left side, the CS-major students' three columns; right side, the same three columns for CS majors WITH a CS-course enrollment (via the enrollments join to courses). Expected columns: student_id, first_name, last_name.",
      dataset: "university",
      sampleTables: ["students", "enrollments", "courses"],
      hint: "Right side: students joined to enrollments joined to courses, filtered to the CS department on both tables.",
      starter: "SELECT student_id, first_name, last_name\nFROM students\nWHERE major_dept_id = 1\nEXCEPT\n-- CS majors with at least one CS-course enrollment\n",
      solution: `SELECT student_id, first_name, last_name
FROM students
WHERE major_dept_id = 1
EXCEPT
SELECT s.student_id, s.first_name, s.last_name
FROM students s
JOIN enrollments e ON e.student_id = s.student_id
JOIN courses c ON c.course_id = e.course_id
WHERE s.major_dept_id = 1
  AND c.dept_id = 1
ORDER BY student_id;`,
      ordered: true,
      expected: { columns: ["student_id", "first_name", "last_name"], rows: [] },
      explanation:
        "The left side is every CS major; the right side subtracts every CS major with even one CS enrollment (the double join walks students through enrollments to courses, keeping only CS-department courses). What survives EXCEPT is the paradox club: declared CS majors who never took a single CS course. Part G will show NOT EXISTS doing the same job — operators you can pick by taste.",
      concepts: ["EXCEPT", "join preview", "anti-questions"],
    },
    {
      id: "c-a4",
      tier: "advanced",
      mode: "sql",
      title: "The comparative price report",
      prompt: "The retail chain prices against the market: build a three-column report of every product (name, cost, price) where the markup percentage is at least 60 percent — that is, price is at least cost times 1.60 — top 10 only, sorted by the markup percentage descending (compute it as round(100.0 * (price - cost) / cost, 1) AS markup_pct and sort by that computed value; ties broken by name). Expected columns: name, cost, price, markup_pct — ten rows.",
      dataset: "retail",
      sampleTables: ["products"],
      hint: "The filter can use the expression directly: price >= cost * 1.60. Multiply by 100.0 (not 100) before dividing to keep decimals.",
      starter: "SELECT name, cost, price,\n       round(100.0 * (price - cost) / cost, 1) AS markup_pct\nFROM products\n",
      solution: `SELECT name, cost, price,
       round(100.0 * (price - cost) / cost, 1) AS markup_pct
FROM products
WHERE price >= cost * 1.60
ORDER BY markup_pct DESC, name
LIMIT 10;`,
      ordered: true,
      expected: { columns: ["name", "cost", "price", "markup_pct"], rows: [
        ["RapidDry Towel Large", "11.00", "29.00", "163.6"],
        ["Solstice Sun Hat", "9.50", "25.00", "163.2"],
        ["Horizon Polarized Sunglasses", "34.00", "79.00", "132.4"],
        ["PeakBrew Camp Coffee Kit", "28.00", "65.00", "132.1"],
        ["AuroraHeadlamp 900lm", "36.00", "79.00", "119.4"],
        ["Trailhead Merino Hiking Socks", "6.50", "14.00", "115.4"],
        ["TrailRun Grip Gloves", "12.00", "25.00", "108.3"],
        ["GraniteHeadlamp 400lm", "17.00", "34.00", "100.0"],
        ["ThermalBase Layer Top", "23.00", "45.00", "95.7"],
        ["CanyonStove Portable Burner", "31.00", "59.00", "90.3"],
      ] },
      explanation:
        "The computed markup_pct column and the WHERE's threshold are the same logic written twice — once for display (rounded, labeled), once for filtering (exact, unrounded). The 100.0 multiplication is the integer-division guard: 100 * 1 / 3 is 33 in integer math but 33.33... with the decimal point. Ties in markup break by name so the order is fully determined.",
      concepts: ["expressions", "percentage math", "integer division guard", "ORDER BY computed"],
    },
  ],

  assessment: [
    {
      id: "c-as-1",
      prompt: "Which SELECT list computes a per-row value rather than reading a stored column?",
      options: [
        { text: "SELECT name, price FROM products", correct: false, feedback: "Both are stored columns, read as-is." },
        { text: "SELECT name, price * stock AS stock_value FROM products", correct: true, feedback: "Correct — an expression evaluated per row at query time." },
        { text: "SELECT * FROM products", correct: false, feedback: "The star reads every stored column; it computes nothing." },
      ],
      explanation: "Expressions in the SELECT list are computed on the fly, per row, and can be aliased and sorted like stored columns.",
    },
    {
      id: "c-as-2",
      prompt: "Which filter keeps orders that are NOT cancelled and NOT pending?",
      options: [
        { text: "WHERE status <> 'cancelled' AND status <> 'pending'", correct: true, feedback: "Correct — both conditions must hold." },
        { text: "WHERE status <> 'cancelled' OR status <> 'pending'", correct: false, feedback: "OR here is always true — a status is always different from at least one of them. A classic trap." },
        { text: "WHERE NOT status = 'cancelled', 'pending'", correct: false, feedback: "Not valid SQL — lists compare with IN or NOT IN." },
      ],
      explanation: "AND joins the two exclusions. The OR version matches every row — the single most common logic bug in WHERE clauses.",
    },
    {
      id: "c-as-3",
      prompt: "ORDER BY price DESC, name — what does the second key do?",
      options: [
        { text: "Breaks ties: among equal prices, sorts by name", correct: true, feedback: "Correct — later keys order only the rows the earlier keys left tied." },
        { text: "Sorts by name instead, ignoring price", correct: false, feedback: "The first key leads; the second only refines." },
        { text: "Nothing — only one sort key is honored", correct: false, feedback: "PostgreSQL honors any number of keys, in order." },
      ],
      explanation: "Sort keys apply left to right: price first, name as tiebreaker — the recipe for deterministic ordering.",
    },
    {
      id: "c-as-4",
      prompt: "LIMIT 10 OFFSET 30 on a sorted list returns which rows?",
      options: [
        { text: "Rows 31 through 40", correct: true, feedback: "Correct — thirty skipped, ten kept: page four of ten-per-page." },
        { text: "Rows 30 through 39", correct: false, feedback: "Off by one: OFFSET 30 discards rows 1-30, so the first kept row is the 31st." },
        { text: "The first ten rows, then skips thirty", correct: false, feedback: "OFFSET applies before LIMIT, not after." },
      ],
      explanation: "The pipeline is filter, sort, skip (OFFSET), take (LIMIT) — page arithmetic: OFFSET = (page - 1) * size.",
    },
    {
      id: "c-as-5",
      prompt: "SELECT DISTINCT city, state FROM customers deduplicates...",
      options: [
        { text: "Each column independently", correct: false, feedback: "There is no per-column distinct — the whole row is the unit." },
        { text: "Whole rows: unique city-and-state pairs", correct: true, feedback: "Correct — a row collapses only when every selected column matches." },
        { text: "Only exact duplicate customers", correct: false, feedback: "It sees the SELECT list, nothing else — the customers' identities are not in it." },
      ],
      explanation: "DISTINCT compares complete result rows; with two columns, the pair is what must match to collapse.",
    },
    {
      id: "c-as-6",
      prompt: "Which statement about UNION vs UNION ALL is TRUE?",
      options: [
        { text: "UNION deduplicates; UNION ALL keeps every row and is faster", correct: true, feedback: "Correct — ALL skips the duplicate-check tax." },
        { text: "UNION sorts the result; UNION ALL does not", correct: false, feedback: "Neither sorts — ORDER BY does that, once, at the end." },
        { text: "UNION ALL allows mismatched column counts", correct: false, feedback: "The position-matching rule applies to every set operation." },
      ],
      explanation: "UNION returns the mathematical set; UNION ALL is the raw stack. Choose by whether repeats are meaningful.",
    },
    {
      id: "c-as-7",
      prompt: "'Products that were never ordered' is most directly...",
      options: [
        { text: "All products UNION ordered products", correct: false, feedback: "UNION merges — you get everything once." },
        { text: "All products EXCEPT ordered products", correct: true, feedback: "Correct — subtraction leaves exactly the never-ordered." },
        { text: "All products INTERSECT ordered products", correct: false, feedback: "That is the ordered ones — the opposite." },
      ],
      explanation: "EXCEPT is the anti-question operator: left minus right leaves the products with no order.",
    },
    {
      id: "c-as-8",
      prompt: "Why does 100 * 1 / 4 give 25 but 100 * (1/4) give 0 in PostgreSQL?",
      options: [
        { text: "Integer division: 1/4 is 0 before the multiplication runs", correct: true, feedback: "Correct — parentheses bound the integer division first, truncating to zero." },
        { text: "PostgreSQL rounds down aggressively", correct: false, feedback: "It truncates integer division, yes — but the grouping is the whole story here." },
        { text: "The second expression is invalid SQL", correct: false, feedback: "It is valid — and quietly zero, which is why the trap matters." },
      ],
      explanation: "Integer operands produce integer math: 1/4 is 0. Multiply by a decimal literal (100.0) to keep fractions alive.",
    },
  ],

  project: {
    title: "The One-Table Interrogation",
    brief:
      "Pick one sample database table — customers, products, students, employees, transactions or inventory — and interrogate it like an analyst who just joined the company. Your deliverable is a query file of ten questions about that one table, each written as a comment followed by the query that answers it, using ONLY this part's toolkit: column choice, expressions, aliases, WHERE (comparisons, AND/OR/NOT, IN, BETWEEN, LIKE), ORDER BY, LIMIT/OFFSET, DISTINCT and one set operation. The discipline is precision: every question must be answerable from one table alone, with outputs you have actually run and read.",
    requirements: [
      "Ten questions, each a business question in plain words (a comment) plus its query",
      "At least three queries with expressions or concatenation in the SELECT list, aliased",
      "At least four different WHERE operators used across the set (comparisons, IN, BETWEEN, LIKE, AND/OR/NOT)",
      "At least two top-N queries with deterministic ORDER BY (tiebreakers included)",
      "One paged query (LIMIT + OFFSET) with a stable sort",
      "One DISTINCT question and one set operation (UNION, UNION ALL, INTERSECT or EXCEPT) — a same-table set operation is fine (e.g. two filters of one table UNIONed with origin labels)",
      "Every query run in the Lab, with outputs you have read and believed",
    ],
    steps: [
      "Choose your table and read it whole once in the Lab (SELECT * LIMIT 20) plus the schema explorer entry — know your columns before questioning.",
      "Write the ten questions as comments first — no SQL yet. Make them questions a manager would actually ask.",
      "For each question, say the shape out loud (columns? filter? sort? limit?) and then write the query.",
      "Run each query, read each output like a skeptic, and adjust the question or the query until they agree.",
      "Order your file from simplest to hardest — it becomes a tutorial for the next analyst.",
      "Add a final comment: which questions wanted MORE than one table (joins, per-group counts), and name the Part of this course that will unlock each.",
    ],
    starter: `-- The One-Table Interrogation (Part C mini project)
-- Table chosen: ???

-- Q1: ???
-- (query)

-- Q2: ???
-- (query)

-- Q3 (expression + alias): ???
-- (query)

-- Q4 (IN or BETWEEN): ???
-- (query)

-- Q5 (LIKE): ???
-- (query)

-- Q6 (top-N, deterministic): ???
-- (query)

-- Q7 (paged, LIMIT + OFFSET): ???
-- (query)

-- Q8 (DISTINCT): ???
-- (query)

-- Q9 (set operation): ???
-- (query)

-- Q10 (hardest — combine freely): ???
-- (query)

-- QUESTIONS THAT NEED MORE THAN ONE TABLE:
-- - ??? (needs Part E: ???)
-- - ??? (needs Part F: ???)`,
    concepts: ["SELECT", "WHERE", "ORDER BY", "LIMIT", "DISTINCT", "set operations", "translation"],
    extension:
      "Rewrite your hardest question three ways: once with BETWEEN, once with two comparisons AND-ed, once with NOT and a reversed condition. Confirm all three return identical rows in the Lab — then explain in a comment WHY they are equivalent. Equivalence-checking is how professionals trust their rewrites.",
  },
};
