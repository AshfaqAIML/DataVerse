/**
 * Part H — Functions for Text, Numbers & Dates.
 *
 * The built-in function toolkit: clean and build text (case, trim, concat,
 * slicing, split_part, LIKE patterns), the date/time type system (date,
 * timestamp, timestamptz, interval, extract, age), date arithmetic with
 * intervals and date_trunc buckets, and formatting/casting with to_char,
 * to_date, CAST and :: — always sorting on typed values.
 * Every verified output comes from the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_H: Part = {
  letter: "H",
  title: "Functions for Text, Numbers & Dates",
  tagline: "Clean, slice, match, format and compute with built-in functions.",
  description:
    "Columns rarely arrive shaped the way the report needs them: names shout in capitals, emails hide a username and a domain inside one string, dates arrive as text, and the database answers 10939.50 where a human wants '$10,939.50'. Part H is the built-in function toolkit: clean and build text with upper, initcap, trim, concat_ws, split_part, replace, lpad and LIKE patterns; master the date/time type system — date, timestamp, timestamptz, interval — with extract and age; do arithmetic with intervals, day counts and date_trunc buckets; and format anything for humans with to_char, while casting safely and never letting a formatted string anywhere near your ORDER BY.",
  stub: false,
  lessons: [
    {
      slug: "h-01",
      title: "Working with text I",
      minutes: 13,
      summary: "upper, lower and initcap for casing, length to measure, the trim family to strip the ends, and — the heart of it — gluing columns into labels with ||, concat and concat_ws when NULL is watching.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Change letter case with upper, lower and initcap — and know when each is safe",
        "Measure text with length and strip stray whitespace with trim, ltrim, rtrim and btrim",
        "Glue strings together with ||, concat and concat_ws — and predict what NULL does to each",
        "Build readable labels (order banners, shipping lines) from raw columns",
      ],
      why: "Databases store text the way it was typed: product names in CamelCase from one supplier, brand codes in lowercase from another, form fields padded with stray spaces. Reports need the opposite — clean, consistent, human-readable text. This lesson is your text cleaning kit: change case, measure with length, strip the ends with trim, and — most important — glue columns into labels with ||, concat and concat_ws, where a single NULL decides which of the three spellings survives. Master that one rule and your labels stop vanishing overnight.",
      blocks: [
        {
          kind: "text",
          text: "Text functions take text in and give text back — no tables touched, no rows harmed. The workhorses come in three families: **casing** (`upper`, `lower`, `initcap`), **measuring and cleaning** (`length`, `trim` and friends), and **gluing** (`||`, `concat`, `concat_ws`). ShopSphere's catalog shows all three problems at once:",
        },
        {
          kind: "sql",
          title: "Casing: upper, lower, initcap",
          code: `SELECT p.name,
       initcap(p.name) AS title_case,
       upper(p.name) AS shouting,
       lower(p.brand) AS brand_lower
FROM products p
ORDER BY p.product_id
LIMIT 5;`,
          result: { columns: ["name", "title_case", "shouting", "brand_lower"], rows: [
        ["AeroBook 14 Laptop", "Aerobook 14 Laptop", "AEROBOOK 14 LAPTOP", "aeronix"],
        ["AeroBook 16 Pro Laptop", "Aerobook 16 Pro Laptop", "AEROBOOK 16 PRO LAPTOP", "aeronix"],
        ["WorkMate 15 Business", "Workmate 15 Business", "WORKMATE 15 BUSINESS", "clearlane"],
        ["StudioBook X Creator", "Studiobook X Creator", "STUDIOBOOK X CREATOR", "vantura"],
        ["BudgetBook 11 Everyday", "Budgetbook 11 Everyday", "BUDGETBOOK 11 EVERYDAY", "clearlane"],
      ] },
          explain: [
            "initcap uppercases the first letter of every word and LOWERCASES everything else — watch AeroBook become Aerobook. The internal capital B is gone: initcap is for messy text, and destructive on names that already carry meaning in their capitals.",
            "upper and lower move the whole string in one direction and never invent new structure.",
            "brand_lower shows the other direction: normalizing data so that 'Aeronix' and 'aeronix' can be compared as equals.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Comparisons are case-sensitive",
          text: "In PostgreSQL, `'Amelia' = 'amelia'` is false — text comparison happens character by character, capitals and all. To match regardless of case, compare both sides through the same function: `lower(email) = lower('Amelia@Example.com')`, or use ILIKE (next lesson). Case functions are for matching and display; never re-case the stored data just to make a comparison work.",
        },
        { kind: "heading", text: "How long is that text?" },
        {
          kind: "sql",
          title: "length counts characters — and NULLs stay NULL",
          code: `SELECT r.review_id,
       r.title,
       r.body,
       length(r.title) AS title_chars,
       length(r.body) AS body_chars
FROM reviews r
WHERE r.review_id IN (1, 15, 24, 32)
ORDER BY r.review_id;`,
          result: { columns: ["review_id", "title", "body", "title_chars", "body_chars"], rows: [
        ["1", "Fantastic daily driver", "Six months in and the battery still lasts a full work day.", "22", "58"],
        ["15", "Great value tracker", "Battery lasts 10 days easily.", "19", "29"],
        ["24", "Cozy glow", null, "9", null],
        ["32", "Loyal customer", null, "14", null],
      ] },
          explain: [
            "Review 1's title is 22 characters long and its body 58 — length is how you find the lazy reviewers, the overly long addresses, the suspiciously short notes.",
            "Reviews 24 and 32 have no body at all (the column is NULL), and length(NULL) is NULL — not 0. This is your first sighting of the NULL-in, NULL-out rule: most functions refuse to guess what a missing value means, so they hand the NULL straight back.",
          ],
        },
        { kind: "heading", text: "Trimming the noise from the ends" },
        {
          kind: "sql",
          title: "trim, ltrim, rtrim, btrim — with brackets to see the spaces",
          code: `SELECT '[' || '  Trailhead Outdoors  ' || ']' AS raw,
       '[' || trim('  Trailhead Outdoors  ') || ']' AS trimmed,
       '[' || ltrim('  Trailhead Outdoors  ') || ']' AS left_trimmed,
       '[' || rtrim('  Trailhead Outdoors  ') || ']' AS right_trimmed,
       btrim('xxSKU-0042xx', 'x') AS btrim_custom;`,
          result: { columns: ["raw", "trimmed", "left_trimmed", "right_trimmed", "btrim_custom"], rows: [
        ["[  Trailhead Outdoors  ]", "[Trailhead Outdoors]", "[Trailhead Outdoors  ]", "[  Trailhead Outdoors]", "SKU-0042"],
      ] },
          explain: [
            "The brackets make whitespace visible: raw carries two spaces on each side, trimmed has none. Comparing '  Trailhead Outdoors  ' = 'Trailhead Outdoors' would fail — the spaces are real characters.",
            "ltrim and rtrim clean one end each; trim does both at once. All three strip spaces by default.",
            "btrim is the customizable version: btrim('xxSKU-0042xx', 'x') strips every leading and trailing x, leaving SKU-0042. Give it any set of characters and it cuts those from both ends — and only the ends, never the middle.",
          ],
        },
        { kind: "heading", text: "Gluing strings together" },
        {
          kind: "text",
          text: "Three ways to build a label from pieces: the `||` **operator** (`'Hello ' || name`), the `concat()` **function**, and `concat_ws()` — *concat with separator* — whose first argument is the glue and whose remaining arguments are the pieces. They agree on everything except NULL:",
        },
        {
          kind: "sql",
          title: "One NULL, three different fates",
          code: `SELECT c.customer_id,
       c.first_name || ' ' || c.last_name AS customer,
       c.phone,
       c.first_name || ' ' || c.last_name || ' — ' || c.phone AS with_operator,
       concat(c.first_name, ' ', c.last_name, ' — ', c.phone) AS with_function,
       concat_ws(' ', c.first_name, c.last_name, c.phone) AS with_ws
FROM customers c
ORDER BY c.customer_id
LIMIT 6;`,
          result: { columns: ["customer_id", "customer", "phone", "with_operator", "with_function", "with_ws"], rows: [
        ["1", "Amelia Watson", "+1-503-555-0142", "Amelia Watson — +1-503-555-0142", "Amelia Watson — +1-503-555-0142", "Amelia Watson +1-503-555-0142"],
        ["2", "Marcus Chen", "+1-206-555-0198", "Marcus Chen — +1-206-555-0198", "Marcus Chen — +1-206-555-0198", "Marcus Chen +1-206-555-0198"],
        ["3", "Priya Sharma", null, null, "Priya Sharma — ", "Priya Sharma"],
        ["4", "Diego Alvarez", "+1-305-555-0177", "Diego Alvarez — +1-305-555-0177", "Diego Alvarez — +1-305-555-0177", "Diego Alvarez +1-305-555-0177"],
        ["5", "Hannah Kowalski", "+1-312-555-0110", "Hannah Kowalski — +1-312-555-0110", "Hannah Kowalski — +1-312-555-0110", "Hannah Kowalski +1-312-555-0110"],
        ["6", "Tom Fletcher", "+1-720-555-0166", "Tom Fletcher — +1-720-555-0166", "Tom Fletcher — +1-720-555-0166", "Tom Fletcher +1-720-555-0166"],
      ] },
          explain: [
            "The first two customers have phones, so all three spellings agree: 'Amelia Watson — +1-503-555-0142'.",
            "Priya Sharma (customer 3) opted out of giving a phone — the column is NULL. With ||, the ENTIRE label becomes NULL: one missing piece erases the whole string. That is with_operator going blank on her row.",
            "concat() treats NULL as an empty string: with_function keeps the name but leaves a dangling ' — ' separator at the end. Half a fix.",
            "concat_ws() skips NULLs entirely and only places its separator between pieces that exist: Priya's with_ws is simply 'Priya Sharma'. This is why concat_ws is the label builder you reach for first.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One NULL poisons a whole || chain",
          text: "`a || b || c` returns NULL if ANY of a, b, c is NULL — not the parts that survived. For labels built from nullable columns, use concat_ws (it skips the NULLs), or replace the missing pieces deliberately with `coalesce(phone, 'no phone')` so the label always exists.",
        },
        {
          kind: "sql",
          title: "Building a label that ships",
          code: `SELECT o.order_id,
       'Order #' || o.order_id || ' — ' || upper(o.status) AS label,
       o.status
FROM orders o
WHERE o.status IN ('pending', 'paid', 'shipped')
ORDER BY o.order_id
LIMIT 6;`,
          result: { columns: ["order_id", "label", "status"], rows: [
        ["36", "Order #36 — SHIPPED", "shipped"],
        ["37", "Order #37 — SHIPPED", "shipped"],
        ["38", "Order #38 — PAID", "paid"],
        ["47", "Order #47 — SHIPPED", "shipped"],
        ["48", "Order #48 — PAID", "paid"],
        ["49", "Order #49 — PENDING", "pending"],
      ] },
          explain: [
            "The label is built entirely in SQL: a literal prefix, the order number, a separator, and the status shouted in capitals — 'Order #36 — SHIPPED' is ready for a warehouse screen with no application code involved.",
            "Notice `'Order #' || o.order_id`: || politely converts the number to text for you. (Some databases refuse; PostgreSQL does not.)",
            "The pieces being glued are all NOT NULL here — order_id, the literals, and a status filtered to three known values — so || is safe. The moment a nullable piece joins in, switch to concat_ws.",
          ],
        },
        {
          kind: "lab",
          title: "Office badges for HeliosWorks",
          task: "On HeliosWorks: print badge lines for current staff (terminated IS NULL) — employee (first and last name joined with one space), badge_role (job title in capitals) and badge_dept (department name in title case, plus the word Department, as in 'Engineering Department'). Order by employee_id, first six rows. Expected columns: employee, badge_role, badge_dept.",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       upper(e.job_title) AS badge_role,
       initcap(d.name) || ' Department' AS badge_dept
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
WHERE e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 6;`,
          dataset: "hr",
          hint: "Two casing functions and one concatenation — then try breaking it on purpose: what happens to badge_dept if you use concat_ws(', ', d.name, 'Department') instead?",
        },
      ],
      terms: [
        { term: "Case functions", definition: "upper, lower and initcap — rewrite a string's letter casing; initcap lowercases everything that is not a word's first letter." },
        { term: "trim family", definition: "trim, ltrim, rtrim strip whitespace from both ends / the left / the right; btrim strips a chosen set of characters from both ends." },
        { term: "NULL propagation", definition: "Most functions hand NULL straight through: NULL in, NULL out — length(NULL) is NULL, and NULL || anything is NULL." },
        { term: "concat_ws", definition: "Concatenate with a separator, skipping NULL arguments and only placing the separator between pieces that exist." },
      ],
      mistakes: [
        {
          mistake: "Building labels with || when any piece can be NULL",
          why: "A single NULL operand makes the entire || expression NULL — the whole label vanishes from the report, silently.",
          fix: "Use concat_ws(sep, piece1, piece2) which skips NULLs, or wrap nullable pieces in coalesce(piece, 'fallback').",
        },
        {
          mistake: "Running initcap over names that already carry capitals",
          why: "initcap lowercases every letter that is not word-initial: AeroBook becomes Aerobook, McDonnell becomes Mcdonnell.",
          fix: "Apply initcap only to known-lowercase or chaotically-cased data; leave carefully mixed-case names alone.",
        },
        {
          mistake: "Comparing 'AMELIA' = 'amelia' and calling it a data bug",
          why: "Text comparison is exact and case-sensitive — the two strings differ, so they are simply not equal.",
          fix: "Normalize both sides with lower() (or upper()) before comparing, or match case-insensitively with ILIKE.",
        },
      ],
      takeaways: [
        "Case functions shape text for display and for case-insensitive matching — never re-case stored data to fix a comparison.",
        "length(NULL) is NULL, and trim only ever cuts the ends — the middle is untouchable.",
        "|| is destroyed by one NULL; concat() blanks it; concat_ws() skips it — pick your behavior on purpose.",
        "Numbers politely convert to text inside ||, but say it with ::text when the cast should be visible.",
      ],
      quiz: [
        {
          id: "h-01-q1",
          prompt: "c.first_name || ' ' || c.phone returns what when c.phone is NULL?",
          options: [
            { text: "NULL — one NULL operand makes the whole || expression NULL", correct: true, feedback: "Correct — || propagates NULL across the entire chain." },
            { text: "The first name followed by a space", correct: false, feedback: "That is closer to concat() behavior; || loses everything." },
            { text: "The first name with no trailing space", correct: false, feedback: "|| never trims or drops pieces — it returns NULL, full stop." },
            { text: "An error: NULL is not allowed in ||", correct: false, feedback: "It is allowed, and legal — it just poisons the result." },
          ],
          explanation: "|| is all-or-nothing: any NULL operand yields NULL. concat() substitutes an empty string; concat_ws() skips the NULL entirely.",
        },
        {
          id: "h-01-q2",
          prompt: "You want 'first middle last' with a possibly-NULL middle name, and no double spaces when it is missing. Which call?",
          options: [
            { text: "concat_ws(' ', first, middle, last)", correct: true, feedback: "Correct — the separator only appears between pieces that exist." },
            { text: "first || ' ' || middle || ' ' || last", correct: false, feedback: "A NULL middle erases the entire name — the h-01 trap." },
            { text: "concat(first, ' ', middle, ' ', last)", correct: false, feedback: "concat blanks the NULL but keeps both separators — 'First  Last' with two spaces." },
            { text: "initcap(first || middle || last)", correct: false, feedback: "Same NULL trap, plus initcap rewriting every capital you cared about." },
          ],
          explanation: "concat_ws places its separator only between non-NULL arguments — the label reads naturally in every case.",
        },
      ],
    },

    {
      slug: "h-02",
      title: "Working with text II",
      minutes: 14,
      summary: "Slice with left, right and substring, split structured text with split_part, find and replace with position, strpos and replace, pad with lpad and rpad — then match patterns with LIKE and ILIKE.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Slice strings with left, right and substring (positions count from 1)",
        "Split structured text with split_part — emails, course codes, phone extensions",
        "Find and replace with position, strpos and replace",
        "Pad values to a fixed width with lpad and rpad",
        "Match patterns with LIKE and ILIKE using % and _",
      ],
      why: "Slicing is the other half of text work. Real columns pack structure into strings: 'priya.nair@heliosworks.example' hides a username and a domain, 'CS 301' hides a subject and a number, 'ext. 3010' hides a department extension — and the questions arrive as 'give me the part after the @' or 'find every product with Book in the name'. This lesson hands you the slicers (left, right, substring, split_part), the finders and replacers (position, strpos, replace), the padders (lpad, rpad) and the pattern matcher itself: LIKE, the search box of SQL.",
      blocks: [
        {
          kind: "text",
          text: "The slicing functions all share one mental model: a string is a row of characters with **numbered positions, starting at 1**. Point at a position (or a range), and take what is there:",
        },
        {
          kind: "visual",
          title: "Strings are addressed from 1",
          ascii: ` 'SoundCore ANC Headphones'
  | | | | |
  1 2 3 4 5   <- positions start at 1

  left(name, 5)            'Sound'
  right(name, 5)           'ones'
  substring(name FROM 10)  'ANC Headphones'`,
          caption: "Point at positions from the left (left, substring) or count back from the right (right).",
        },
        {
          kind: "sql",
          title: "left, right and substring on the catalog",
          code: `SELECT p.name,
       left(p.name, 8) AS first_8,
       right(p.name, 7) AS last_7,
       substring(p.name FROM 1 FOR 8) AS via_substring,
       substring(p.name FROM 10) AS from_10th
FROM products p
ORDER BY p.product_id
LIMIT 5;`,
          result: { columns: ["name", "first_8", "last_7", "via_substring", "from_10th"], rows: [
        ["AeroBook 14 Laptop", "AeroBook", " Laptop", "AeroBook", "14 Laptop"],
        ["AeroBook 16 Pro Laptop", "AeroBook", " Laptop", "AeroBook", "16 Pro Laptop"],
        ["WorkMate 15 Business", "WorkMate", "usiness", "WorkMate", "15 Business"],
        ["StudioBook X Creator", "StudioBo", "Creator", "StudioBo", "k X Creator"],
        ["BudgetBook 11 Everyday", "BudgetBo", "veryday", "BudgetBo", "k 11 Everyday"],
      ] },
          explain: [
            "left(name, 8) takes the first 8 characters: 'AeroBook'. right(name, 7) takes the last 7 — note it starts with the space before 'Laptop': right counts characters, it does not know about words.",
            "substring(name FROM 1 FOR 8) is the general form: start at position 1, take 8 — identical to left(name, 8) here, but it can start anywhere.",
            "substring(name FROM 10) has no FOR, so it runs to the end of the string: position 10 of 'AeroBook 14 Laptop' is the '1' of 14 — the output is '14 Laptop'.",
            "Older code often spells the same call as substr(name, 1, 8) — the classic comma-argument shorthand for substring FROM 1 FOR 8, with the same 1-based counting. This course writes substring out in full; you will recognize both on sight.",
          ],
        },
        {
          kind: "sql",
          title: "split_part: cutting on a delimiter",
          dataset: "hr",
          code: `SELECT e.first_name,
       e.last_name,
       e.email,
       split_part(e.email, '@', 1) AS username,
       split_part(e.email, '@', 2) AS domain
FROM employees e
ORDER BY e.employee_id
LIMIT 5;`,
          result: { columns: ["first_name", "last_name", "email", "username", "domain"], rows: [
        ["Amara", "Osei", "amara.osei@heliosworks.example", "amara.osei", "heliosworks.example"],
        ["Daniel", "Kramer", "daniel.kramer@heliosworks.example", "daniel.kramer", "heliosworks.example"],
        ["Sofia", "Mancini", "sofia.mancini@heliosworks.example", "sofia.mancini", "heliosworks.example"],
        ["Priya", "Nair", "priya.nair@heliosworks.example", "priya.nair", "heliosworks.example"],
        ["Gerald", "Weiss", "gerald.weiss@heliosworks.example", "gerald.weiss", "heliosworks.example"],
      ] },
          explain: [
            "split_part(text, delimiter, field) cuts the text apart at every delimiter and hands you one field — counting from 1. Field 1 is everything before the first '@', field 2 everything after it.",
            "amara.osei@heliosworks.example splits into amara.osei and heliosworks.example — the email-to-username move every migration script needs.",
            "Asking for a field that does not exist (a third '@'-field here) returns an empty string, not an error — quiet, so test with strpos or length when it matters.",
          ],
        },
        { kind: "heading", text: "Find it, replace it" },
        {
          kind: "sql",
          title: "position, strpos and replace on hospital phones",
          dataset: "hospital",
          code: `SELECT d.name,
       d.floor,
       d.phone,
       replace(d.phone, 'ext. ', '') AS extension,
       position('ext' IN d.phone) AS ext_at,
       strpos(d.phone, '3010') AS digits_at
FROM departments d
ORDER BY d.dept_id;`,
          result: { columns: ["name", "floor", "phone", "extension", "ext_at", "digits_at"], rows: [
        ["Cardiology", "3", "ext. 3010", "3010", "1", "6"],
        ["Neurology", "4", "ext. 4010", "4010", "1", "0"],
        ["Pediatrics", "2", "ext. 2010", "2010", "1", "0"],
        ["Orthopedics", "1", "ext. 1010", "1010", "1", "0"],
        ["Emergency", "0", null, null, null, null],
        ["General Surgery", "5", "ext. 5010", "5010", "1", "0"],
      ] },
          explain: [
            "replace(phone, 'ext. ', '') swaps every occurrence of the label (and its trailing space) for nothing — leaving the bare extension '3010' ready to store or dial.",
            "position('ext' IN phone) and strpos(phone, '3010') are twins: both return the 1-based position where the search text starts. Cardiology's 'ext. 3010' has 'ext' at 1 and the digits '3010' at 6.",
            "Neurology's phone does not contain '3010', so strpos returns 0 — zero means not found. It is a number, not a NULL.",
            "The Emergency department has a NULL phone, and every function handed a NULL returns NULL — the NULL-in, NULL-out rule again, visible across a whole row.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The NULL-in, NULL-out rule",
          text: "Hand a text function a NULL and it gives the NULL back: replace(NULL, 'a', 'b') is NULL, split_part(NULL, '@', 1) is NULL. The one exception in this family is strpos: on non-NULL input it returns 0 when the search text is not found — because 'not found' is an answer, not an unknown.",
        },
        {
          kind: "sql",
          title: "lpad and rpad: fixed-width columns",
          dataset: "banking",
          code: `SELECT a.account_id,
       lpad(a.account_id::text, 6, '0') AS acct_code,
       a.account_type,
       rpad(a.account_type, 10, '.') AS type_dots
FROM accounts a
ORDER BY a.account_id
LIMIT 5;`,
          result: { columns: ["account_id", "acct_code", "account_type", "type_dots"], rows: [
        ["1", "000001", "checking", "checking.."],
        ["2", "000002", "savings", "savings..."],
        ["3", "000003", "business", "business.."],
        ["4", "000004", "checking", "checking.."],
        ["5", "000005", "savings", "savings..."],
      ] },
          explain: [
            "lpad(text, width, fill) left-pads to the exact width: account 1 becomes '000001' — the zero-padded codes legacy systems and bank files demand. Note the ::text cast: lpad takes text, so the number is converted first.",
            "rpad pads on the right — 'checking' padded to 10 with dots reads 'checking..', a menu-style column that lines up in any font.",
            "Both functions measure the width INCLUDING your text: 'savings' (7 characters) needs 3 dots to reach 10. And if the text is already longer than the width, both cut it down to the width — padding functions never widen past their target.",
          ],
        },
        { kind: "heading", text: "LIKE and ILIKE — patterns instead of exact matches" },
        {
          kind: "text",
          text: "`=` demands the whole string, exactly. **LIKE** accepts a *pattern*: `%` stands for any run of characters (including none), `_` stands for exactly one character, and everything else must match itself. **ILIKE** is LIKE with the case sensitivity switched off.",
        },
        {
          kind: "sql",
          title: "Find every product with Book in the name",
          code: `SELECT p.product_id,
       p.name,
       p.brand
FROM products p
WHERE p.name LIKE '%Book%'
ORDER BY p.product_id;`,
          result: { columns: ["product_id", "name", "brand"], rows: [
        ["1", "AeroBook 14 Laptop", "Aeronix"],
        ["2", "AeroBook 16 Pro Laptop", "Aeronix"],
        ["4", "StudioBook X Creator", "Vantura"],
        ["5", "BudgetBook 11 Everyday", "ClearLane"],
      ] },
          explain: [
            "The pattern '%Book%' means: anything, then Book, then anything — the four laptops whose names contain Book, from the AeroBooks to the BudgetBook.",
            "% can match a run of any length, including zero characters — which is why '%Book%' also catches a name that STARTS with Book.",
            "LIKE is case-sensitive: '%book%' would have found nothing here, because the catalog capitalizes Book.",
          ],
        },
        {
          kind: "sql",
          title: "LIKE as an expression — and ILIKE",
          code: `SELECT p.name,
       p.brand,
       p.name LIKE '_ound%' AS starts_ound,
       p.brand ILIKE '%AUX%' AS brand_aux
FROM products p
WHERE p.product_id IN (6, 8, 9)
ORDER BY p.product_id;`,
          result: { columns: ["name", "brand", "starts_ound", "brand_aux"], rows: [
        ["SoundCore ANC Headphones", "Auralux", "true", "false"],
        ["BassStation Mini Speaker", "Boomwerk", "false", "false"],
        ["StudioMic Pro USB", "Auralux", "false", "false"],
      ] },
          explain: [
            "LIKE normally lives in WHERE, but it is an expression that returns true or false — usable right in the SELECT list. starts_ound asks: one character, then 'ound', then anything? SoundCore says true; BassStation and StudioMic say false.",
            "ILIKE runs the same patterns with case ignored: brand_aux checks whether the brand contains 'aux' in any casing — Auralux matches '%AUX%', Boomwerk does not.",
            "A boolean column like this is a quick way to eyeball a pattern before you trust it in a WHERE clause.",
          ],
        },
        {
          kind: "table",
          title: "The pattern toolbox",
          headers: ["Pattern", "Matches strings that"],
          rows: [
            ["'Book%'", "start with Book"],
            ["'%Book'", "end with Book"],
            ["'%Book%'", "contain Book anywhere"],
            ["'_o%'", "have o as their second character"],
            ["'S__d%'", "start with S, anything, anything, then d"],
            ["ILIKE (any of the above)", "the same, ignoring capitalization"],
          ],
          caption: "Two wildcards, one rule: % is any run (even empty), _ is exactly one character.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "A LIKE pattern is a form to fill in",
          text: "Picture a form where every letter of your pattern is a pre-printed box and two special blanks: % is a box that accepts 'anything you like, even nothing', and _ is a box that accepts 'exactly one character, any character'. The row matches when the data fills the form exactly — no more, no less.",
        },
        {
          kind: "lab",
          title: "Find the surgeons",
          task: "On St. Marlowe's: the OR scheduling team wants every doctor whose specialization mentions surgery, in any casing. Return doctor (first and last name joined with one space) and specialization, using ILIKE with a pattern, ordered by doctor_id. Expected columns: doctor, specialization.",
          code: `SELECT d.first_name || ' ' || d.last_name AS doctor,
       d.specialization
FROM doctors d
WHERE d.specialization ILIKE '%surgery%'
ORDER BY d.doctor_id;`,
          dataset: "hospital",
          hint: "One pattern with % on both sides and ILIKE for the casing — then try the same with LIKE and see who disappears (Spine surgery keeps a lowercase s).",
        },
      ],
      terms: [
        { term: "substring / left / right", definition: "Slicers: substring(text FROM start FOR n) is the general form — substr(text, start, n) is its classic shorthand; left and right take the first / last n characters." },
        { term: "split_part", definition: "Cut text on a delimiter and return one numbered field, counting from 1; a missing field is an empty string." },
        { term: "position / strpos", definition: "Return the 1-based position where a search string starts — 0 when it is not found, NULL when the input is NULL." },
        { term: "lpad / rpad", definition: "Pad text to an exact width with a fill character, on the left or the right; text longer than the width is cut to it." },
        { term: "LIKE / ILIKE", definition: "Pattern matching with % (any run of characters) and _ (exactly one); ILIKE ignores case." },
      ],
      mistakes: [
        {
          mistake: "Counting string positions from 0",
          why: "SQL strings are 1-based: substring('SoundCore' FROM 1 FOR 5) is 'Sound', while FROM 0 quietly returns one character less ('Soun') — no error, just wrong.",
          fix: "Treat position 1 as the first character, always; test slicers on a string whose length you know.",
        },
        {
          mistake: "Expecting split_part to error on a missing field",
          why: "Requesting a field past the last one returns an empty string — the query keeps running with invisible blanks.",
          fix: "Check the delimiter exists first (strpos(text, delim) > 0) or measure the length of the split_part result when the field must be there.",
        },
        {
          mistake: "Using = where a pattern is needed",
          why: "name = 'Book%' compares against the literal six characters B, o, o, k, % — the percent sign is just a character to =.",
          fix: "Use LIKE or ILIKE for patterns; keep = for exact equality.",
        },
        {
          mistake: "Assuming strpos returns NULL when nothing matches",
          why: "Not-found is an answer, so strpos returns 0; NULL only appears when the input itself is NULL.",
          fix: "Test for not-found with strpos(text, seek) = 0, and reserve IS NULL for genuinely missing input.",
        },
      ],
      takeaways: [
        "Positions start at 1 — substring FROM 1 FOR n is left(n), FROM n without FOR runs to the end.",
        "split_part cuts on a delimiter and counts fields from 1; a missing field is '', never an error.",
        "replace swaps every occurrence; position and strpos find where something starts (0 = not found).",
        "lpad and rpad hit an exact width — great for codes, and they truncate anything longer.",
        "LIKE with % and _ is the search box of SQL; ILIKE is the same box with case ignored.",
      ],
      quiz: [
        {
          id: "h-02-q1",
          prompt: "split_part('marcus.chen@example.com', '@', 2) returns",
          options: [
            { text: "'example.com' — fields count from 1, so field 2 is after the first @", correct: true, feedback: "Correct — the delimiter is removed and the second field handed back." },
            { text: "'marcus.chen'", correct: false, feedback: "That is field 1 — counting starts at 1 on the left." },
            { text: "An error, because there is only one @", correct: false, feedback: "No error — a missing field would be '', but field 2 exists here." },
            { text: "NULL, because @ appears only once", correct: false, feedback: "NULL needs NULL input; one delimiter splits the text into two valid fields." },
          ],
          explanation: "split_part numbers fields from 1: field 1 is before the first delimiter, field 2 after it — 'example.com'.",
        },
        {
          id: "h-02-q2",
          prompt: "Which pattern matches names whose SECOND character is 'o'?",
          options: [
            { text: "'_o%'", correct: true, feedback: "Correct — one character (the _), then o, then anything." },
            { text: "'%o%'", correct: false, feedback: "That matches an o anywhere in the name, not specifically second." },
            { text: "'o%'", correct: false, feedback: "That demands o as the FIRST character." },
            { text: "'_o_'", correct: false, feedback: "Close — but the trailing _ pins the name to exactly three characters." },
          ],
          explanation: "Read the pattern left to right: _ consumes exactly one character, o must be next, % swallows the rest.",
        },
      ],
    },

    {
      slug: "h-03",
      title: "Dates and times I — the type system",
      minutes: 13,
      summary: "The four temporal types — date, timestamp, timestamptz, interval — what each stores, pulling pieces out with extract and date_part, and measuring the distance between dates with age.",
      kind: "coding",
      dataset: "hospital",
      objectives: [
        "Name the four temporal types — date, timestamp, timestamptz, interval — and what each one stores",
        "Pull pieces out of a date or timestamp with extract and date_part",
        "Measure the distance between two dates with age",
        "Explain why this course pins DATE '2026-11-14' instead of CURRENT_DATE",
      ],
      why: "Until now you have treated '2026-11-14 09:42:00' as a blob of text that happens to sort correctly. It is not text: PostgreSQL stores dates and times as typed values with their own arithmetic, their own functions and their own traps. Get the type system right and 'which admissions arrived at night', 'how old is this patient', 'group by month' all become one-liners; get it wrong and you are back to string surgery on substrings. This lesson covers the four types, the extract/date_part pair, age() for human-readable distances — and why every 'today' in this course is a pinned literal.",
      blocks: [
        {
          kind: "text",
          text: "Four types cover everything temporal. **date** is a calendar day with no clock. **timestamp** is a moment on a specific day at a specific time. **timestamptz** is a moment that knows which time zone it happened in. And **interval** is not a point at all — it is a *length* of time, like '30 days' or '2 hours'.",
        },
        {
          kind: "visual",
          title: "Four types, four jobs",
          ascii: ` DATE          TIMESTAMP          TIMESTAMPTZ
 ------------  -----------------  ----------------
 2026-11-14    2026-11-14        2026-11-14
               09:30:00          09:30:00+00

 a whole day   a moment,         a moment,
               no zone           zone-aware

 INTERVAL '30 days'  a length of time, no start
 age(a, b)           the interval from b to a`,
          caption: "Pick the type by the question: which day, which moment, which moment-in-which-zone, or how long.",
        },
        {
          kind: "sql",
          title: "Meeting the four types",
          code: `SELECT DATE '2026-11-14' AS plain_date,
       TIMESTAMP '2026-11-14 09:30:00' AS stamp,
       TIMESTAMPTZ '2026-11-14 09:30:00+00' AS stamp_tz,
       INTERVAL '30 days' AS duration;`,
          result: { columns: ["plain_date", "stamp", "stamp_tz", "duration"], rows: [
        ["2026-11-14", "2026-11-14 09:30:00", "2026-11-14 09:30:00", "30 days"],
      ] },
          explain: [
            "The typed literals spell the type out loud: DATE '2026-11-14', TIMESTAMP with a clock, TIMESTAMPTZ with a zone offset, INTERVAL with a length.",
            "plain_date prints as just the day; stamp prints day plus clock; duration prints '30 days'. The types choose their own display — no formatting needed yet (to_char comes in h-05).",
            "stamp_tz shows '2026-11-14 09:30:00' — the same clock reading, because this session displays in UTC. The +00 is not lost: timestamptz stores the instant and renders it in the viewer's time zone.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "timestamptz stores an instant, displays a clock",
          text: "A timestamptz is internally a single absolute moment (kept as UTC); what you SEE is that moment expressed in the session's time zone. Two users in New York and Berlin read the same row and see different clock times — and they are both right. Use timestamptz for anything that really happened (orders, logins, admissions) and plain timestamp only when the clock reading itself is the fact.",
        },
        { kind: "heading", text: "Pulling pieces out: extract and date_part" },
        {
          kind: "sql",
          title: "Which year, month, day, hour?",
          code: `SELECT a.admission_id,
       a.room,
       a.admitted_at,
       extract(YEAR FROM a.admitted_at) AS yr,
       extract(MONTH FROM a.admitted_at) AS mon,
       extract(DOW FROM a.admitted_at) AS dow,
       extract(HOUR FROM a.admitted_at) AS hr,
       date_part('hour', a.admitted_at) AS hr_too
FROM admissions a
ORDER BY a.admission_id
LIMIT 6;`,
          result: { columns: ["admission_id", "room", "admitted_at", "yr", "mon", "dow", "hr", "hr_too"], rows: [
        ["1", "301", "2024-05-02 08:40:00", "2024", "5", "4", "8", "8"],
        ["2", "E-4", "2024-05-10 22:05:00", "2024", "5", "5", "22", "22"],
        ["3", "208", "2024-06-18 16:20:00", "2024", "6", "2", "16", "16"],
        ["4", "401", "2024-07-01 09:10:00", "2024", "7", "1", "9", "9"],
        ["5", "305", "2024-08-12 07:55:00", "2024", "8", "1", "7", "7"],
        ["6", "112", "2024-09-05 13:35:00", "2024", "9", "4", "13", "13"],
      ] },
          explain: [
            "extract(YEAR FROM admitted_at) pulls one field out as a number: admission 1 arrived in 2024, month 5, at hour 8. Every part is available: YEAR, MONTH, DAY, HOUR, MINUTE, and more.",
            "DOW is day-of-week with a twist: Sunday is 0, Saturday is 6. Admission 1 (May 2, 2024) was a Thursday, so 4; admission 2 (May 10) a Friday, so 5.",
            "date_part('hour', x) is the same call spelled with a string — hr and hr_too agree on every row. extract reads better; date_part computes its argument, which matters inside dynamic SQL. Pick one and be consistent.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why this course writes DATE '2026-11-14' instead of CURRENT_DATE",
          text: "CURRENT_DATE answers with the real today — which means every result containing it changes every day, and no claimed output could stay verified. So this course pins 'today' to the literal DATE '2026-11-14' and says so in prose whenever it matters. In your own work, do the opposite: CURRENT_DATE and now() are exactly what you want, because they are always right.",
        },
        { kind: "heading", text: "How far apart: age()" },
        {
          kind: "sql",
          title: "How old are the patients?",
          code: `SELECT p.first_name,
       p.last_name,
       p.dob,
       age(DATE '2026-11-14', p.dob) AS age_asof,
       extract(YEAR FROM age(DATE '2026-11-14', p.dob)) AS age_years
FROM patients p
ORDER BY p.dob
LIMIT 6;`,
          result: { columns: ["first_name", "last_name", "dob", "age_asof", "age_years"], rows: [
        ["Rose", "Abernathy", "1939-09-25", "87 years 1 mon 19 days", "87"],
        ["Edith", "Barlow", "1941-12-29", "84 years 10 mons 16 days", "84"],
        ["Walter", "Osei", "1944-06-02", "82 years 5 mons 12 days", "82"],
        ["Oscar", "Hartley", "1946-09-07", "80 years 2 mons 7 days", "80"],
        ["Margaret", "Boyle", "1948-02-11", "78 years 9 mons 3 days", "78"],
        ["Iris", "Thornbury", "1952-07-09", "74 years 4 mons 5 days", "74"],
      ] },
          explain: [
            "age(later, earlier) returns the interval between the two dates, expressed the way people speak: Rose Abernathy, born 1939-09-25, is '87 years 1 mon 19 days' as of the pinned date.",
            "Ordering by dob puts the oldest patients first — Edith Barlow (1941) and Walter Osei (1944) follow Rose.",
            "Wrapping that interval in extract(YEAR FROM it) takes the year PART — 87, not 88. It does not round: someone 87 years and 11 months is still 87, which is exactly how birthdays work.",
          ],
        },
        {
          kind: "lab",
          title: "How old is each branch?",
          task: "On Meridian Trust: the branch-vintage report. For each branch return name, opened, branch_age (age(DATE '2026-11-14', opened)) and age_years (the year part of that interval). Order by opened ascending — the oldest branch first. Expected columns: name, opened, branch_age, age_years.",
          code: `SELECT b.name,
       b.opened,
       age(DATE '2026-11-14', b.opened) AS branch_age,
       extract(YEAR FROM age(DATE '2026-11-14', b.opened)) AS age_years
FROM branches b
ORDER BY b.opened;`,
          dataset: "banking",
          hint: "One age() call and one extract around it — then compare: which branch has been open the longest, and by how many years?",
        },
      ],
      terms: [
        { term: "date", definition: "A calendar day — no clock, no zone. DATE '2026-11-14' is a typed literal, not a string." },
        { term: "timestamp / timestamptz", definition: "A moment with a clock; the tz variant stores an absolute instant (UTC) and displays it in the session's time zone." },
        { term: "interval", definition: "A length of time — '30 days', '2 hours' — with no starting point." },
        { term: "extract / date_part", definition: "Pull one field (year, month, day, hour) out of a date or timestamp as a number." },
        { term: "age", definition: "age(later, earlier) returns the interval between two dates in years, months and days." },
      ],
      mistakes: [
        {
          mistake: "Keeping dates in TEXT columns",
          why: "Strings sort by accident ('9/30/2026' sorts before '2026-06-01'), cannot take arithmetic, and silently accept nonsense like '2026-02-31'.",
          fix: "Use real DATE and TIMESTAMP columns; store user input through to_date once, at the edge (h-05).",
        },
        {
          mistake: "Expecting age() to return a number",
          why: "age returns an interval — '87 years 1 mon 19 days' — a length of time, not a count.",
          fix: "Wrap it: extract(YEAR FROM age(end, start)) for whole years, or subtract the dates for raw days (next lesson).",
        },
        {
          mistake: "Mixing up extract and date_part syntax",
          why: "extract takes a keyword and FROM: extract(YEAR FROM x). date_part takes a string: date_part('year', x). Swapping the spellings is a syntax error.",
          fix: "Pick one spelling per codebase; extract is the more readable default for queries.",
        },
      ],
      takeaways: [
        "date is a day, timestamp is a moment, timestamptz is a moment that knows its zone, interval is a length of time.",
        "extract(YEAR FROM x) and date_part('year', x) are the same call; DOW counts Sunday as 0.",
        "age(later, earlier) speaks human: '87 years 1 mon 19 days'; wrapping it in extract(YEAR FROM) gives whole years without rounding.",
        "This course pins DATE '2026-11-14' so outputs stay verifiable — your own reports should use CURRENT_DATE.",
      ],
      quiz: [
        {
          id: "h-03-q1",
          prompt: "Which type stores a LENGTH of time, with no start or end?",
          options: [
            { text: "interval — '30 days' is a duration, not a point on the calendar", correct: true, feedback: "Correct — intervals are rope, not addresses." },
            { text: "date — a day is a unit of time", correct: false, feedback: "A date is a specific day on the calendar, a point rather than a length." },
            { text: "timestamp", correct: false, feedback: "A timestamp is a specific moment — it has a start, and it ends immediately." },
            { text: "timestamptz", correct: false, feedback: "Same as timestamp, plus zone awareness — still a moment, not a length." },
          ],
          explanation: "Intervals measure duration. You will add them to dates in the next lesson — the two types work as a pair.",
        },
        {
          id: "h-03-q2",
          prompt: "A patient was born 1939-09-25. extract(YEAR FROM age(DATE '2026-11-14', dob)) returns",
          options: [
            { text: "87 — the year part of '87 years 1 mon 19 days', no rounding", correct: true, feedback: "Correct — extract takes the part that is there; it never rounds up." },
            { text: "88, because the birthday is close enough to round", correct: false, feedback: "Rounding is not extract's job — 87 years and 11 months is still 87." },
            { text: "87.1, the age as a decimal", correct: false, feedback: "extract returns whole field values — decimals come from day-count arithmetic, not age()." },
            { text: "An error, because age() cannot be nested in extract()", correct: false, feedback: "Nesting works fine — extract reads the interval that age() hands it." },
          ],
          explanation: "age() produces '87 years 1 mon 19 days'; extract(YEAR FROM that interval) takes the 87 and leaves the months and days behind.",
        },
      ],
    },

    {
      slug: "h-04",
      title: "Dates and times II — arithmetic",
      minutes: 14,
      summary: "Shift dates with INTERVAL '30 days', count days with date - date, round down to boundaries with date_trunc, and bucket rows by day, week, month or year — St. Marlowe's stays, HeliosWorks tenure, month-by-month rollups.",
      kind: "coding",
      dataset: "hospital",
      objectives: [
        "Shift dates and timestamps with INTERVAL '30 days' and date + interval",
        "Count whole days between dates with date - date (it returns an integer)",
        "Round timestamps down to a boundary with date_trunc — day, week, month, year",
        "Bucket rows by time period and aggregate inside each bucket",
      ],
      why: "'Come back in two weeks.' 'How long was the stay?' 'How many admissions per month?' — the moment dates enter a report, the questions turn arithmetic. PostgreSQL answers them with two moves: shift a date by an interval, or subtract two dates to count the days between them. Then date_trunc rounds every timestamp down to a boundary — day, week, month, year — which is what makes 'per month' bucketing possible at all. This lesson runs the whole toolkit on St. Marlowe's admissions and HeliosWorks tenure, and closes with the month-bucketing pattern you will reuse in every report you ever write.",
      blocks: [
        {
          kind: "text",
          text: "Date arithmetic has exactly two shapes: **shift** a moment by a length (`date + interval`), or **measure** the gap between two moments (`date - date`). A prescription start date plus a two-week follow-up is a shift; a discharge minus an admission is a measurement:",
        },
        {
          kind: "sql",
          title: "Shift a date with an interval",
          code: `SELECT pr.prescription_id,
       pr.medication,
       pr.start_date,
       pr.start_date + INTERVAL '14 days' AS checkup_ts,
       (pr.start_date + INTERVAL '14 days')::date AS checkup_date,
       pr.start_date + 14 AS plus_14_days
FROM prescriptions pr
WHERE pr.end_date IS NULL
ORDER BY pr.prescription_id;`,
          result: { columns: ["prescription_id", "medication", "start_date", "checkup_ts", "checkup_date", "plus_14_days"], rows: [
        ["5", "Salbutamol", "2024-06-18", "2024-07-02", "2024-07-02", "2024-07-02"],
        ["8", "Lisinopril", "2024-08-12", "2024-08-26", "2024-08-26", "2024-08-26"],
        ["11", "Aspirin", "2024-11-30", "2024-12-14", "2024-12-14", "2024-12-14"],
        ["12", "Atorvastatin", "2024-11-30", "2024-12-14", "2024-12-14", "2024-12-14"],
        ["19", "Levetiracetam", "2025-07-23", "2025-08-06", "2025-08-06", "2025-08-06"],
        ["28", "Salbutamol", "2026-03-30", "2026-04-13", "2026-04-13", "2026-04-13"],
        ["31", "Ibuprofen", "2026-09-19", "2026-10-03", "2026-10-03", "2026-10-03"],
        ["32", "Ceftriaxone", "2026-10-08", "2026-10-22", "2026-10-22", "2026-10-22"],
        ["33", "Amoxicillin", "2026-11-02", "2026-11-16", "2026-11-16", "2026-11-16"],
      ] },
          explain: [
            "These are the nine still-ongoing prescriptions (end_date IS NULL). start_date + INTERVAL '14 days' computes each follow-up moment: Salbutamol started 2024-06-18, so the checkup lands on 2024-07-02.",
            "date + interval returns a TIMESTAMP — midnight of the follow-up day, which is why checkup_ts prints like a bare date here (midnight has no visible clock).",
            "The ::date cast trims the timestamp back to a plain day, and the shorthand start_date + 14 (date plus a plain integer) counts days too — handy for quick math, though INTERVAL spells out the units.",
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Addresses and rope",
          text: "A date is an address on the calendar; an interval is a length of rope. You can lay rope down starting anywhere (`date + interval`) and you can measure the rope needed to get from one address to another (`date - date`) — but adding two addresses together is meaningless, and PostgreSQL says so (next block).",
        },
        {
          kind: "sql",
          title: "Two addresses cannot be added",
          code: `SELECT DATE '2026-11-14' + DATE '2026-11-14';`,
          expectError: "operator does not exist: date + date",
          explain: [
            "There is no date + date operator, and that is a design decision, not an oversight: 'November 14th plus November 14th' has no answer a human would recognize.",
            "The error is your friend. When you see 'operator does not exist', ask which of the two shapes you meant — a shift (add an INTERVAL) or a measurement (subtract, don't add).",
          ],
        },
        {
          kind: "table",
          title: "The arithmetic cheat sheet",
          headers: ["Expression", "Result type", "Example"],
          rows: [
            ["date + interval", "timestamp", "DATE '2026-11-14' + INTERVAL '30 days'"],
            ["date + integer", "date", "DATE '2026-11-14' + 30"],
            ["date - date", "integer (days)", "DATE '2026-11-14' - DATE '2026-10-01'"],
            ["timestamp - timestamp", "interval", "09:30:00 - 07:45:00 = 01:45:00"],
            ["date - timestamp", "interval", "midnight minus a moment"],
          ],
          caption: "Two shapes only: shift with an interval, measure with a subtraction. The result types are not all dates — plan for them.",
        },
        { kind: "heading", text: "How many days between?" },
        {
          kind: "sql",
          title: "Tenure at HeliosWorks",
          dataset: "hr",
          code: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.hire_date,
       DATE '2026-11-14' - e.hire_date AS days_employed,
       round((DATE '2026-11-14' - e.hire_date) / 365.25, 1) AS years_employed
FROM employees e
WHERE e.terminated IS NULL
ORDER BY days_employed DESC
LIMIT 6;`,
          result: { columns: ["employee", "hire_date", "days_employed", "years_employed"], rows: [
        ["Amara Osei", "2017-01-09", "3596", "9.8"],
        ["Daniel Kramer", "2018-03-12", "3169", "8.7"],
        ["Gerald Weiss", "2018-09-03", "2994", "8.2"],
        ["Lena Hoffman", "2019-04-15", "2770", "7.6"],
        ["Sofia Mancini", "2019-06-17", "2707", "7.4"],
        ["Robert McAllister", "2019-08-26", "2637", "7.2"],
      ] },
          explain: [
            "date - date is an INTEGER — a count of days. Amara Osei, hired 2017-01-09, has 3,596 days of service as of the pinned date.",
            "Dividing by 365.25 (a quarter day per year for leap years) and rounding to one decimal gives 9.8 years — the kind of number a tenure report wants.",
            "The ORDER BY days_employed DESC surfaces the veterans first; every one of these six crossed the five-year mark in 2026 or earlier.",
          ],
        },
        {
          kind: "sql",
          title: "Length of stay at St. Marlowe's",
          code: `SELECT a.admission_id,
       p.first_name || ' ' || p.last_name AS patient,
       a.admitted_at::date AS admitted,
       a.discharged_at::date AS discharged,
       a.discharged_at::date - a.admitted_at::date AS stay_nights
FROM admissions a
JOIN patients p ON p.patient_id = a.patient_id
WHERE a.discharged_at IS NOT NULL
ORDER BY a.admission_id
LIMIT 8;`,
          result: { columns: ["admission_id", "patient", "admitted", "discharged", "stay_nights"], rows: [
        ["1", "Margaret Boyle", "2024-05-02", "2024-05-06", "4"],
        ["2", "Harold Webb", "2024-05-10", "2024-05-11", "1"],
        ["3", "Lucy Ramirez", "2024-06-18", "2024-06-20", "2"],
        ["4", "Arthur Pennington", "2024-07-01", "2024-07-08", "7"],
        ["5", "Rose Abernathy", "2024-08-12", "2024-08-19", "7"],
        ["6", "Douglas Kimura", "2024-09-05", "2024-09-09", "4"],
        ["7", "Beatrice Lavigne", "2024-10-21", "2024-10-24", "3"],
        ["8", "Walter Osei", "2024-11-30", "2024-12-07", "7"],
      ] },
          explain: [
            "The timestamps are cast to ::date first so the subtraction counts whole days: Margaret Boyle was admitted 2024-05-02 and discharged 2024-05-06 — four nights.",
            "Nights, not days-in-building: admitted 08:40 and discharged 14:15 spans five calendar days but the day-level subtraction answers 4. If you need hours, subtract the timestamps and get an interval instead.",
            "The WHERE drops the four still-open admissions (discharged_at IS NULL) — without it, every open stay would show NULL, because NULL minus anything is NULL.",
          ],
        },
        { kind: "heading", text: "date_trunc: roll everything up to a boundary" },
        {
          kind: "sql",
          title: "Four cuts of one moment",
          code: `SELECT date_trunc('day', TIMESTAMP '2026-11-14 09:42:17') AS to_day,
       date_trunc('week', TIMESTAMP '2026-11-14 09:42:17') AS to_week,
       date_trunc('month', TIMESTAMP '2026-11-14 09:42:17') AS to_month,
       date_trunc('year', TIMESTAMP '2026-11-14 09:42:17') AS to_year;`,
          result: { columns: ["to_day", "to_week", "to_month", "to_year"], rows: [
        ["2026-11-14", "2026-11-09", "2026-11-01", "2026-01-01"],
      ] },
          explain: [
            "date_trunc('day', x) zeroes the clock: 09:42:17 becomes 00:00:00 of the same day. The 'day' answer prints as a bare date because midnight has no visible time.",
            "Weeks start on Monday in PostgreSQL: November 14, 2026 is a Saturday, so truncating to week lands on Monday the 9th.",
            "Month cuts to the first of the month; year cuts to January 1. Truncating only ever rounds DOWN — toward the past.",
          ],
        },
        {
          kind: "visual",
          title: "Everything past the cut becomes zero",
          ascii: ` one timeline:  2026-11-14 09:42:17  (a Saturday)

 date_trunc('day')    ->  2026-11-14 00:00:00
 date_trunc('week')   ->  2026-11-09 00:00:00  (Monday)
 date_trunc('month')  ->  2026-11-01 00:00:00
 date_trunc('year')   ->  2026-01-01 00:00:00`,
          caption: "The cut point survives, everything after it becomes zero — always rounding down, never up.",
        },
        {
          kind: "sql",
          title: "Bucketing admissions by year",
          code: `SELECT date_trunc('year', a.admitted_at)::date AS admitted_year,
       count(*) AS admissions,
       count(*) FILTER (WHERE a.discharged_at IS NOT NULL) AS closed,
       round(avg(a.discharged_at::date - a.admitted_at::date), 1) AS avg_stay_nights
FROM admissions a
GROUP BY date_trunc('year', a.admitted_at)::date
ORDER BY admitted_year;`,
          result: { columns: ["admitted_year", "admissions", "closed", "avg_stay_nights"], rows: [
        ["2024-01-01", "8", "8", "4.4"],
        ["2025-01-01", "14", "14", "2.8"],
        ["2026-01-01", "8", "4", "3.8"],
      ] },
          explain: [
            "GROUP BY the truncated year puts every admission in its year bucket — the ::date cast keeps the bucket readable (2024-01-01 rather than 2024-01-01 00:00:00).",
            "2024 saw 8 admissions and 2025 fourteen; 2026 has 8 so far, of which only 4 are closed — the still-open stays are counted in admissions but excluded from closed.",
            "avg_stay_nights is the average of the day-level differences; the four open 2026 stays contribute NULL differences, which avg() skips. Nights got shorter over the years — 4.4 in 2024, 2.8 in 2025.",
          ],
        },
        {
          kind: "lab",
          title: "Restock spend by month",
          task: "On Trailhead Outdoors: the purchasing team wants month-by-month restock spend. For each month of purchase orders, return ordered_month (date_trunc('month', ordered_on)::date), orders (count) and restock_spend (round(sum(total_cost), 2)). Group by the truncated month, order by it. Expected columns: ordered_month, orders, restock_spend.",
          code: `SELECT date_trunc('month', po.ordered_on)::date AS ordered_month,
       count(*) AS orders,
       round(sum(po.total_cost), 2) AS restock_spend
FROM purchase_orders po
GROUP BY date_trunc('month', po.ordered_on)
ORDER BY ordered_month;`,
          dataset: "retail",
          hint: "Same pattern as the year buckets, one level finer — swap 'year' for 'month' and let the ::date cast keep the display clean.",
        },
      ],
      terms: [
        { term: "Interval arithmetic", definition: "date + interval shifts a moment (result: timestamp); date + integer counts days (result: date)." },
        { term: "date - date", definition: "Subtracting two dates yields an INTEGER — the count of days between them." },
        { term: "timestamp - timestamp", definition: "Subtracting two timestamps yields an INTERVAL — the exact gap, hours and all." },
        { term: "date_trunc", definition: "Round a timestamp DOWN to a boundary (microsecond to millennium; day, week, month, year are the everyday cuts); weeks start Monday." },
        { term: "Time bucketing", definition: "GROUP BY date_trunc(unit, ts) — one row per period, the backbone of every time-series report." },
      ],
      mistakes: [
        {
          mistake: "Writing INTERVAL '30' and expecting thirty days",
          why: "A bare number in an interval is SECONDS: INTERVAL '30' is '00:00:30'. The query runs without a single error and is quietly wrong by a factor of 86,400.",
          fix: "Always write the units: INTERVAL '30 days', INTERVAL '6 months', INTERVAL '2 hours'.",
        },
        {
          mistake: "Subtracting two timestamps and expecting a day count",
          why: "timestamp - timestamp returns an interval like '01:45:00', not the number 1.75 — comparing it with = 1 or < 2 will not do what you mean.",
          fix: "Cast both sides to ::date first when whole days are enough, or extract(EPOCH FROM gap) / 86400 for fractional days.",
        },
        {
          mistake: "Grouping by a to_char string instead of date_trunc",
          why: "A formatted string like '2026-11' groups and sorts, but it is display text: you cannot compute 'the next month' from it, compare it to a date range, or truncate it further.",
          fix: "Group by date_trunc('month', ts); format with to_char in the SELECT list when humans will read it.",
        },
      ],
      takeaways: [
        "Two shapes: shift with an interval, measure with a subtraction — and date + date simply does not exist.",
        "date - date is an integer count of days; timestamp - timestamp is an interval down to the second.",
        "date_trunc rounds DOWN to a boundary and returns a timestamp; weeks start on Monday.",
        "GROUP BY date_trunc(unit, ts) is the bucketing pattern behind every per-day, per-week, per-month report.",
        "NULL dates poison arithmetic: an open admission (discharged_at NULL) yields a NULL length of stay — filter or FILTER.",
      ],
      quiz: [
        {
          id: "h-04-q1",
          prompt: "DATE '2026-11-14' - DATE '2026-10-01' evaluates to",
          options: [
            { text: "The integer 44 — a count of days between the two dates", correct: true, feedback: "Correct — date minus date is whole days, as a number." },
            { text: "The interval '44 days'", correct: false, feedback: "Intervals come from timestamp minus timestamp; dates give a plain integer." },
            { text: "The date 2026-10-01", correct: false, feedback: "Subtraction does not return the earlier operand — it returns the distance." },
            { text: "An error, dates cannot be subtracted", correct: false, feedback: "They can — it is the most useful date operation there is." },
          ],
          explanation: "October has 31 days: Oct 1 to Nov 1 is 31, plus 13 more to Nov 14 — the integer 44.",
        },
        {
          id: "h-04-q2",
          prompt: "date_trunc('week', TIMESTAMP '2026-11-14 09:42:17') returns",
          options: [
            { text: "2026-11-09 00:00:00 — the Monday of that week", correct: true, feedback: "Correct — PostgreSQL weeks start Monday, and truncation rounds down." },
            { text: "2026-11-14 00:00:00 — the same day, clock zeroed", correct: false, feedback: "That is the day cut — the week cut goes further back." },
            { text: "2026-11-15 00:00:00 — the Sunday of that week", correct: false, feedback: "Never forward: truncation only rounds down, and weeks start Monday anyway." },
            { text: "2026-11-01 00:00:00", correct: false, feedback: "That is the month cut — the week cut lands on a Monday." },
          ],
          explanation: "November 14, 2026 is a Saturday; the week bucket opens on Monday the 9th, at midnight.",
        },
      ],
    },

    {
      slug: "h-05",
      title: "Formatting and casting",
      minutes: 14,
      summary: "to_char for dates and money, to_date and to_timestamp for parsing (and their failure modes), CAST and the :: shorthand, regex-guarded safe casts — and the closing rule: format for display, sort on the typed value.",
      kind: "coding",
      dataset: "banking",
      objectives: [
        "Format dates and timestamps for humans with to_char",
        "Format numbers as money with to_char patterns (FM, G, D, 9, 0)",
        "Parse text into dates with to_date and to_timestamp — and respect their failure modes",
        "Convert between types with CAST and the :: shorthand, guarded when the data is dirty",
        "Sort on typed columns and format only for display",
      ],
      why: "The last mile of every report is formatting. The database answers 10939.50, and a human reads '$10,939.50'; a date column answers 2010-04-15, and a statement header wants 'April 2010'. This lesson is the translation layer: to_char shapes dates and numbers into any pattern you can describe; to_date and to_timestamp read messy text back into real dates — with failure modes you must respect; CAST and the :: shorthand convert between types; and the closing rule keeps you honest: format for display, but sort on the typed value, because '$1,299.00' sorts before '$149.00' and no amount of formatting will ever fix string ordering.",
      blocks: [
        {
          kind: "text",
          text: "Typed values carry truth; formatted strings carry presentation. **to_char(value, pattern)** turns the first into the second — a date into 'Apr 2010', a price into '$1,299.00' — by reading a pattern string you write once and read forever:",
        },
        {
          kind: "sql",
          title: "to_char on dates: from machine to human",
          code: `SELECT a.account_id,
       a.opened,
       to_char(a.opened, 'YYYY-MM') AS year_month,
       to_char(a.opened, 'Mon YYYY') AS pretty,
       to_char(a.opened, 'FMDay, DD Mon YYYY') AS very_pretty
FROM accounts a
ORDER BY a.account_id
LIMIT 5;`,
          result: { columns: ["account_id", "opened", "year_month", "pretty", "very_pretty"], rows: [
        ["1", "2010-04-15", "2010-04", "Apr 2010", "Thursday, 15 Apr 2010"],
        ["2", "2012-06-01", "2012-06", "Jun 2012", "Friday, 01 Jun 2012"],
        ["3", "2019-03-10", "2019-03", "Mar 2019", "Sunday, 10 Mar 2019"],
        ["4", "2012-10-02", "2012-10", "Oct 2012", "Tuesday, 02 Oct 2012"],
        ["5", "2013-01-20", "2013-01", "Jan 2013", "Sunday, 20 Jan 2013"],
      ] },
          explain: [
            "The pattern is a mold: every uppercase code pulls a piece of the date. YYYY gives the four-digit year, MM the two-digit month, Mon the short month name, Day the full weekday.",
            "'YYYY-MM' keeps a machine-sortable key; 'Mon YYYY' reads like a newsletter header — account 1 opened 'Apr 2010'.",
            "FM is 'fill mode': it suppresses the blank padding PostgreSQL adds by default. Without it, Day pads weekday names to nine characters ('Thursday '); with FMDay you get 'Thursday, 15 Apr 2010' with no stray spaces.",
          ],
        },
        {
          kind: "table",
          title: "to_char date patterns you will actually use",
          headers: ["Pattern", "Produces", "Example"],
          rows: [
            ["YYYY / MM / DD", "year, month, day numbers", "2026-11-14"],
            ["Mon / Month", "short / full month name", "Nov / November"],
            ["Dy / Day", "short / full weekday name", "Sat / Saturday"],
            ["HH24 / MI", "24-hour clock, minutes", "09:42"],
            ["FM (prefix)", "strip the default padding", "Saturday, not 'Saturday '"],
          ],
          caption: "Everything else in the pattern — commas, spaces, literal text — appears exactly as written.",
        },
        {
          kind: "sql",
          title: "to_char on numbers: money that reads like money",
          dataset: "ecommerce",
          code: `SELECT p.name,
       p.price,
       to_char(p.price, 'FM$999G999.00') AS price_tag,
       to_char(p.price, '999G999D99') AS padded
FROM products p
ORDER BY p.product_id
LIMIT 6;`,
          result: { columns: ["name", "price", "price_tag", "padded"], rows: [
        ["AeroBook 14 Laptop", "1299.00", "$1,299.00", "   1,299.00"],
        ["AeroBook 16 Pro Laptop", "2199.00", "$2,199.00", "   2,199.00"],
        ["WorkMate 15 Business", "899.00", "$899.00", "     899.00"],
        ["StudioBook X Creator", "2499.00", "$2,499.00", "   2,499.00"],
        ["BudgetBook 11 Everyday", "399.00", "$399.00", "     399.00"],
        ["SoundCore ANC Headphones", "249.00", "$249.00", "     249.00"],
      ] },
          explain: [
            "For numbers the pattern describes DIGIT SLOTS: 9 is a slot used only when needed, 0 is a slot that always prints. G marks the group (thousands) separator and D the decimal separator — the currency symbol is just a literal in the pattern.",
            "price_tag uses FM plus $999G999.00: $1,299.00, $899.00, $399.00 — the leading $ and the forced two decimals make it a price tag.",
            "padded drops the FM on purpose: to_char right-aligns numbers in a field of spaces by default, so '   1,299.00' and '     899.00' line up in a monospace column. FM trades that alignment for tightness.",
          ],
        },
        { kind: "heading", text: "From text back to dates" },
        {
          kind: "sql",
          title: "to_date and to_timestamp: parsing with a mold",
          code: `SELECT to_date('2026-11-14', 'YYYY-MM-DD') AS parsed_date,
       to_date('14 Nov 2026', 'DD Mon YYYY') AS parsed_human,
       to_timestamp('2026-11-14 09:30', 'YYYY-MM-DD HH24:MI') AS parsed_stamp;`,
          result: { columns: ["parsed_date", "parsed_human", "parsed_stamp"], rows: [
        ["2026-11-14", "2026-11-14", "2026-11-14 09:30:00"],
      ] },
          explain: [
            "to_date(text, pattern) reads the text through the same pattern codes to_char uses to write them — but in reverse. '14 Nov 2026' with 'DD Mon YYYY' becomes the real DATE 2026-11-14, not a string that looks like one.",
            "to_timestamp does the same for moments, clock included: '2026-11-14 09:30' becomes the TIMESTAMP 2026-11-14 09:30:00.",
            "The result is typed: you can immediately do date arithmetic on it, subtract it from DATE '2026-11-14', or bucket it with date_trunc — none of which a text column allows.",
          ],
        },
        {
          kind: "sql",
          title: "The failure mode: a date that cannot exist",
          code: `SELECT to_date('14/31/2026', 'YYYY-MM-DD');`,
          expectError: "date/time field value out of range: \"14/31/2026\"",
          explain: [
            "The text says day 31 of month 14 — impossible, and PostgreSQL refuses to guess. The whole query dies at runtime with 'date/time field value out of range', not just the bad row.",
            "This is the danger of parsing user or spreadsheet input in the middle of a report: one malformed cell takes the entire statement down. The fix is not to avoid to_date — it is to parse at the edge, where you can validate, retry or quarantine bad rows.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One bad cell kills the whole query",
          text: "to_date, to_timestamp and numeric casts all fail hard at runtime. When the input is not fully trusted, guard it first — the regex-guarded CASE two blocks down shows the pattern — or parse in a staging step where bad rows are caught and reported, not in the query a manager reads.",
        },
        { kind: "heading", text: "Casting between types" },
        {
          kind: "sql",
          title: "CAST and the :: shorthand",
          code: `SELECT CAST('2026-11-14' AS date) AS via_cast,
       '2026-11-14'::date AS via_shorthand,
       a.account_id,
       a.account_id::text || '-' || upper(a.account_type) AS account_code,
       a.balance::int AS whole_dollars
FROM accounts a
ORDER BY a.account_id
LIMIT 4;`,
          result: { columns: ["via_cast", "via_shorthand", "account_id", "account_code", "whole_dollars"], rows: [
        ["2026-11-14", "2026-11-14", "1", "1-CHECKING", "10940"],
        ["2026-11-14", "2026-11-14", "2", "2-SAVINGS", "28900"],
        ["2026-11-14", "2026-11-14", "3", "3-BUSINESS", "15421"],
        ["2026-11-14", "2026-11-14", "4", "4-CHECKING", "8789"],
      ] },
          explain: [
            "CAST(x AS type) and x::type are the same operation — the double colon is PostgreSQL's beloved shorthand. '2026-11-14'::date turns a text literal into a real date.",
            "account_code glues the id into a label: ::text makes the conversion explicit (|| would do it implicitly, but spelled-out casts document intent).",
            "Careful with whole_dollars: casting a NUMERIC to int ROUNDS to the nearest integer — account 1's 10939.50 became 10940, not 10939. If you mean 'chop it off', use trunc(balance)::int.",
          ],
        },
        {
          kind: "sql",
          title: "The cast failure mode",
          code: `SELECT 'ext. 4'::int;`,
          expectError: "invalid input syntax for type integer: \"ext. 4\"",
          explain: [
            "Casting text to an integer parses the text as a number — and 'ext. 4' is not one. The query dies with 'invalid input syntax for type integer'.",
            "Same family as the to_date failure: one dirty value, whole query down. The difference is that int casts are easy to guard, which is exactly what the next block does.",
          ],
        },
        {
          kind: "sql",
          title: "The safe cast: regex guard, then convert",
          code: `SELECT v.txt,
       CASE WHEN v.txt ~ '^[0-9]+$' THEN v.txt::int ELSE NULL END AS safe_int
FROM (VALUES ('3010'), ('ext. 4'), ('555'), ('N/A')) AS v(txt);`,
          result: { columns: ["txt", "safe_int"], rows: [
        ["3010", "3010"],
        ["ext. 4", null],
        ["555", "555"],
        ["N/A", null],
      ] },
          explain: [
            "The ~ operator tests text against a regular expression; '^[0-9]+$' means: from start to finish, digits only. '3010' and '555' pass; 'ext. 4' and 'N/A' fail.",
            "The CASE only performs the cast when the guard passes — so clean values convert to 3010 and 555, and dirty ones come back as NULL instead of killing the query.",
            "NULL is the right answer for dirty data: it is visible, it aggregates honestly, and coalesce(safe_int, 0) can give it a default later. This guard-then-cast pattern is how production pipelines survive real input.",
          ],
        },
        { kind: "heading", text: "Format for display, sort on the value" },
        {
          kind: "sql",
          title: "Sorted the right way: on the typed column",
          dataset: "ecommerce",
          code: `SELECT p.name,
       p.price,
       to_char(p.price, 'FM$999G999.00') AS price_tag
FROM products p
ORDER BY p.price DESC
LIMIT 5;`,
          result: { columns: ["name", "price", "price_tag"], rows: [
        ["StudioBook X Creator", "2499.00", "$2,499.00"],
        ["AeroBook 16 Pro Laptop", "2199.00", "$2,199.00"],
        ["Zenith X20 Mirrorless", "1499.00", "$1,499.00"],
        ["AeroBook 14 Laptop", "1299.00", "$1,299.00"],
        ["WorkMate 15 Business", "899.00", "$899.00"],
      ] },
          explain: [
            "The ORDER BY uses p.price — the typed numeric column — so the ranking is numeric truth: $2,499.00, $2,199.00, $1,499.00, down to $899.00.",
            "The formatted price_tag is in the SELECT list purely for humans. It exists for the ride; it does no work.",
          ],
        },
        {
          kind: "sql",
          title: "Sorted the wrong way: on the formatted string",
          dataset: "ecommerce",
          code: `SELECT p.name,
       to_char(p.price, 'FM$999G999.00') AS price_tag
FROM products p
ORDER BY price_tag
LIMIT 5;`,
          result: { columns: ["name", "price_tag"], rows: [
        ["AeroBook 14 Laptop", "$1,299.00"],
        ["Zenith X20 Mirrorless", "$1,499.00"],
        ["WaveRider Waterproof Buds", "$129.00"],
        ["SoundCore Lite Earbuds", "$129.00"],
        ["Guardian Hub v2", "$149.00"],
      ] },
          explain: [
            "Same products, same formatting — but the ORDER BY reads the formatted TEXT. The 'cheapest five' now opens with $1,299.00 and $1,499.00, and the $129.00 earbuds are nowhere in sight.",
            "Text compares character by character: '$1,299.00' versus '$149.00' is decided at the third character, comma versus '4' — and the comma wins, so the $1,299 laptop 'sorts before' the $149 hub.",
            "The column you ORDER BY is the column you trust. If humans need shapes, show them shapes — but sort on the typed value underneath.",
          ],
        },
        {
          kind: "steps",
          title: "The formatting ritual",
          items: [
            "Keep the typed column in the query, even if you do not display it: price, not just the price tag.",
            "Format in the SELECT list only — to_char is the last thing that happens to a value before a human sees it.",
            "Sort, filter and compare on the typed column; never on the formatted text.",
            "When parsing text into types, guard first (regex CASE) or parse in a staging step — one bad cell must not kill the report.",
            "Name display columns for what they are (price_tag, since_line) so the typed original stays obviously separate.",
          ],
        },
        {
          kind: "lab",
          title: "Customer statement headers",
          task: "On Meridian Trust: build statement header lines — customer (full name), since, since_line ('Customer since ' + to_char(since, 'Mon YYYY')) and years_with_bank (the year part of age(DATE '2026-11-14', since)). Order by since ascending, first six rows. Expected columns: customer, since, since_line, years_with_bank.",
          code: `SELECT cu.first_name || ' ' || cu.last_name AS customer,
       cu.since,
       'Customer since ' || to_char(cu.since, 'Mon YYYY') AS since_line,
       extract(YEAR FROM age(DATE '2026-11-14', cu.since)) AS years_with_bank
FROM customers cu
ORDER BY cu.since
LIMIT 6;`,
          hint: "A to_char for the display line, an age() plus extract for the number — the typed years column is doing the ordering work here, since since is already a date.",
        },
      ],
      terms: [
        { term: "to_char", definition: "Format a date/timestamp or number into text following a pattern — 'Mon YYYY', 'FM$999G999.00'." },
        { term: "to_date / to_timestamp", definition: "Parse text into a date or timestamp using the same pattern codes; fail hard on impossible input." },
        { term: "CAST / ::", definition: "Convert a value from one type to another; x::type is the PostgreSQL shorthand." },
        { term: "Fill mode (FM)", definition: "Pattern prefix that strips to_char's default padding spaces — tight output instead of aligned columns." },
        { term: "Safe cast", definition: "Guard the value (typically a regex CASE) so only clean input reaches the cast; dirty input yields NULL." },
      ],
      mistakes: [
        {
          mistake: "Sorting by the formatted column",
          why: "A to_char result is text, and text compares character by character: '$1,299.00' sorts before '$149.00' because the comma precedes the digit four.",
          fix: "Keep the typed column in the query and put it in the ORDER BY; format only what the reader sees.",
        },
        {
          mistake: "Expecting ::int to truncate",
          why: "Casting NUMERIC to integer rounds to nearest — 10939.50 became 10940. If you expected 10939, the rounding is a silent off-by-one in your money math.",
          fix: "trunc(value)::int when you mean 'chop the cents off'; keep the numeric when cents matter at all.",
        },
        {
          mistake: "Parsing messy text straight inside the report query",
          why: "to_date and casts fail the WHOLE statement at runtime — one '14/31/2026' cell and the manager's query returns nothing but an error.",
          fix: "Guard with a regex CASE before casting, or parse in a staging step where bad rows are quarantined, not fatal.",
        },
      ],
      takeaways: [
        "to_char is the display layer: patterns mold typed values into human text, FM strips the padding.",
        "to_date and to_timestamp are the same mold read in reverse — and they fail hard on impossible input.",
        "CAST(x AS t) and x::t are one operation; numeric to int ROUNDS, it does not truncate.",
        "Guard-then-cast (regex CASE) turns dirty input into visible NULLs instead of dead queries.",
        "Sort, filter and compare on typed columns — formatted strings lie to ORDER BY.",
      ],
      quiz: [
        {
          id: "h-05-q1",
          prompt: "What does the FM prefix do in to_char(price, 'FM$999G999.00')?",
          options: [
            { text: "Strips the default padding spaces, giving '$899.00' instead of '   899.00'", correct: true, feedback: "Correct — FM is fill mode: tight output, no alignment blanks." },
            { text: "Forces the currency to US dollars", correct: false, feedback: "The $ is a literal in the pattern; FM never touches currency." },
            { text: "Rounds the number to whole dollars", correct: false, feedback: "Formatting never changes the value — 0.00 versus 9 slots decide the decimals." },
            { text: "Sorts the output by the formatted value", correct: false, feedback: "to_char has no ordering effect at all — that would be the mistake this lesson closes with." },
          ],
          explanation: "By default to_char pads numbers with leading spaces for alignment; FM removes that padding. The value itself never changes.",
        },
        {
          id: "h-05-q2",
          prompt: "SELECT 'ext. 4'::int inside a 10,000-row report query. What happens?",
          options: [
            { text: "The whole query fails at runtime with 'invalid input syntax for type integer'", correct: true, feedback: "Correct — casts fail hard, and one bad row takes the statement down." },
            { text: "That row returns NULL, the rest run fine", correct: false, feedback: "That is the guarded CASE behavior — a bare cast does not skip, it dies." },
            { text: "The cast rounds to 4", correct: false, feedback: "Rounding applies to numbers like 4.5, not to non-numeric text." },
            { text: "PostgreSQL strips the letters and casts 4", correct: false, feedback: "Casting is strict — it never guesses what you meant the text to say." },
          ],
          explanation: "A bare cast on dirty text is a runtime bomb. Guard with a regex CASE so only clean values reach the cast.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "h-b1",
      tier: "beginner",
      mode: "sql",
      title: "Shipping labels",
      prompt: "ShopSphere's label printer wants city names in title case and state codes in capitals. Produce the first eight shipping labels: customer (first name and last name joined with a single space) and ship_to, built as initcap(city) || ', ' || upper(state) — so Austin, TX becomes 'Austin, TX' and Dublin, CA stays readable. Order by customer_id and take the first eight rows. Expected columns: customer, ship_to.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "Two casing functions and one concatenation — the cities are stored in mixed case already, so initcap mostly polishes them.",
      starter: `SELECT c.first_name || ' ' || c.last_name AS customer,
       -- ship_to: initcap(city), comma, upper(state)
FROM customers c
ORDER BY c.customer_id
LIMIT 8;
`,
      solution: `SELECT c.first_name || ' ' || c.last_name AS customer,
       initcap(c.city) || ', ' || upper(c.state) AS ship_to
FROM customers c
ORDER BY c.customer_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["customer", "ship_to"], rows: [
        ["Amelia Watson", "Portland, OR"],
        ["Marcus Chen", "Seattle, WA"],
        ["Priya Sharma", "Austin, TX"],
        ["Diego Alvarez", "Miami, FL"],
        ["Hannah Kowalski", "Chicago, IL"],
        ["Tom Fletcher", "Denver, CO"],
        ["Sofia Rossi", "Boston, MA"],
        ["Liam O'Brien", "Dublin, CA"],
      ] },
      explanation:
        "The customer label is the same || join you built in h-01 (first name, one space, last name). ship_to stacks two casing functions: initcap capitalizes each word of the city, upper shouts the two-letter state code, and the comma with its space is a literal between them. Eight labels from Amelia Watson in 'Portland, OR' to Liam O'Brien in 'Dublin, CA' — every piece of the label is computed, none of it stored.",
      concepts: ["initcap", "upper", "concatenation", "labels"],
    },
    {
      id: "h-b2",
      tier: "beginner",
      mode: "sql",
      title: "Split the emails",
      prompt: "HeliosWorks is migrating email providers and needs a username-and-domain inventory. For every CURRENT employee (terminated IS NULL), return employee (first name and last name joined with one space), username (the part of the email before the @) and domain (the part after it), using split_part twice on the email column. Order by employee_id and take the first eight rows. Expected columns: employee, username, domain.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "split_part(email, '@', 1) is the username, split_part(email, '@', 2) is the domain — fields count from 1.",
      starter: `SELECT e.first_name || ' ' || e.last_name AS employee,
       -- username: split_part(email, '@', 1)
       -- domain: split_part(email, '@', 2)
FROM employees e
WHERE e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 8;
`,
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       split_part(e.email, '@', 1) AS username,
       split_part(e.email, '@', 2) AS domain
FROM employees e
WHERE e.terminated IS NULL
ORDER BY e.employee_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["employee", "username", "domain"], rows: [
        ["Amara Osei", "amara.osei", "heliosworks.example"],
        ["Daniel Kramer", "daniel.kramer", "heliosworks.example"],
        ["Sofia Mancini", "sofia.mancini", "heliosworks.example"],
        ["Priya Nair", "priya.nair", "heliosworks.example"],
        ["Gerald Weiss", "gerald.weiss", "heliosworks.example"],
        ["Lena Hoffman", "lena.hoffman", "heliosworks.example"],
        ["Marcus Tran", "marcus.tran", "heliosworks.example"],
        ["Elena Petrova", "elena.petrova", "heliosworks.example"],
      ] },
      explanation:
        "One delimiter, two fields: split_part cuts the email at the @ and hands you whichever side you ask for — field 1 is amara.osei, field 2 is heliosworks.example. The name label is the h-01 concatenation, and the current-staff filter (terminated IS NULL) keeps the two departed colleagues out of the migration list. The same two calls will parse any delimited column you ever meet.",
      concepts: ["split_part", "delimiters", "current-staff filter"],
    },
    {
      id: "h-b3",
      tier: "beginner",
      mode: "sql",
      title: "Anatomy of a course code",
      prompt: "The registrar stores course codes like 'CS 301' as one text column, but the new scheduling system wants the subject and the number separately. For each course, return code, title, subject (the text before the first space) and course_number (the text after it), using split_part on the code. Order by code alphabetically and take the first eight rows. Expected columns: code, title, subject, course_number.",
      dataset: "university",
      sampleTables: ["courses"],
      hint: "The delimiter here is a space, not an @ — same function, different cutter.",
      starter: `SELECT c.code,
       c.title,
       -- subject: split_part(code, ' ', 1)
       -- course_number: split_part(code, ' ', 2)
FROM courses c
ORDER BY c.code
LIMIT 8;
`,
      solution: `SELECT c.code,
       c.title,
       split_part(c.code, ' ', 1) AS subject,
       split_part(c.code, ' ', 2) AS course_number
FROM courses c
ORDER BY c.code
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["code", "title", "subject", "course_number"], rows: [
        ["BIO 120", "Cell Biology", "BIO", "120"],
        ["BIO 310", "Genetics", "BIO", "310"],
        ["CS 101", "Introduction to Programming", "CS", "101"],
        ["CS 201", "Data Structures", "CS", "201"],
        ["CS 220", "Computer Systems", "CS", "220"],
        ["CS 301", "Databases", "CS", "301"],
        ["CS 340", "Algorithms", "CS", "340"],
        ["CS 410", "Machine Learning", "CS", "410"],
      ] },
      explanation:
        "split_part does not care what the delimiter is — a space cuts 'BIO 120' into BIO and 120 exactly as @ cut the emails. The first eight codes alphabetically start with the BIO pair and run through the CS sequence, each row carrying its subject and its number as separate fields. Note the cut is on the FIRST space: codes in this catalog have exactly one, so field 2 is always the clean number.",
      concepts: ["split_part", "text to fields", "ORDER BY text"],
    },
    {
      id: "h-b4",
      tier: "beginner",
      mode: "sql",
      title: "SKU builder",
      prompt: "Trailhead Outdoors is standardizing shelf labels: every product gets a SKU built from its category and id — the first three letters of the category in capitals, then a dash, then the product id left-padded with zeros to three characters (product 1 becomes BAC-001, product 8 becomes APP-008). Return sku, name and category for the first eight products ordered by product_id. Expected columns: sku, name, category.",
      dataset: "retail",
      sampleTables: ["products"],
      hint: "Three functions in a row: left(category, 3) for the prefix, upper for the capitals, lpad(product_id::text, 3, '0') for the zero-padded number.",
      starter: `SELECT -- upper(left(category, 3)) || '-' || lpad(product_id::text, 3, '0') AS sku,
       p.name,
       p.category
FROM products p
ORDER BY p.product_id
LIMIT 8;
`,
      solution: `SELECT upper(left(p.category, 3)) || '-' || lpad(p.product_id::text, 3, '0') AS sku,
       p.name,
       p.category
FROM products p
ORDER BY p.product_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["sku", "name", "category"], rows: [
        ["BAC-001", "Alpine 45L Backpack", "Backpacking"],
        ["HIK-002", "RidgeDay 22L Daypack", "Hiking"],
        ["CAM-003", "SummitDown 20F Sleeping Bag", "Camping"],
        ["CAM-004", "BaseCamp Pad Regular", "Camping"],
        ["HIK-005", "Granite Trekking Poles (pair)", "Hiking"],
        ["CAM-006", "Skyline 2P Tent", "Camping"],
        ["CAM-007", "Cirrus 4P Family Tent", "Camping"],
        ["APP-008", "Trailhead Merino Hiking Socks", "Apparel"],
      ] },
      explanation:
        "The SKU assembles in three moves: left(category, 3) takes 'Backpacking' down to 'Bac', upper makes it 'BAC', and lpad zero-pads the id to three characters — '1' becomes '001'. The dash is a literal glued in with ||. Product 1 becomes BAC-001, product 8 (Apparel) becomes APP-008, and every code is exactly seven characters, which is precisely why lpad exists.",
      concepts: ["left", "upper", "lpad", "code generation"],
    },
    {
      id: "h-i1",
      tier: "intermediate",
      mode: "sql",
      title: "Admissions pulse by month",
      prompt: "St. Marlowe's ops team wants a 2026 admissions pulse. For every month that has admissions from 2026-01-01 onward, return admit_month (the month bucket as text, built with to_char(date_trunc('month', admitted_at), 'YYYY-MM')), admissions (count of admissions that month) and avg_stay_nights (the average of discharged_at::date - admitted_at::date, rounded to 1 decimal — months with no discharges yet show NULL, because avg() skips the NULL differences of still-open stays). Group and order by the month bucket ascending. Expected columns: admit_month, admissions, avg_stay_nights.",
      dataset: "hospital",
      sampleTables: ["admissions"],
      hint: "Group by date_trunc('month', admitted_at) — the typed bucket — and format it with to_char in the SELECT list; the day-level subtraction is the same ::date minus ::date from h-04.",
      starter: `SELECT to_char(date_trunc('month', a.admitted_at), 'YYYY-MM') AS admit_month,
       count(*) AS admissions,
       -- avg_stay_nights: round(avg(discharged_at::date - admitted_at::date), 1)
FROM admissions a
WHERE a.admitted_at >= TIMESTAMP '2026-01-01'
GROUP BY date_trunc('month', a.admitted_at)
ORDER BY date_trunc('month', a.admitted_at);
`,
      solution: `SELECT to_char(date_trunc('month', a.admitted_at), 'YYYY-MM') AS admit_month,
       count(*) AS admissions,
       round(avg(a.discharged_at::date - a.admitted_at::date), 1) AS avg_stay_nights
FROM admissions a
WHERE a.admitted_at >= TIMESTAMP '2026-01-01'
GROUP BY date_trunc('month', a.admitted_at)
ORDER BY date_trunc('month', a.admitted_at);`,
      ordered: true,
      expected: { columns: ["admit_month", "admissions", "avg_stay_nights"], rows: [
        ["2026-01", "1", "8.0"],
        ["2026-02", "1", "2.0"],
        ["2026-03", "1", null],
        ["2026-06", "1", "1.0"],
        ["2026-08", "1", "4.0"],
        ["2026-09", "1", null],
        ["2026-10", "1", null],
        ["2026-11", "1", null],
      ] },
      explanation:
        "The WHERE keeps 2026 admissions (eight of them, January through November — no admissions landed in April, May, July or December). date_trunc('month', admitted_at) builds the typed bucket, GROUP BY collapses each month to one row, and to_char renders it as '2026-01'-style text. Inside avg(), the ::date subtraction counts nights per closed stay; the open admissions contribute NULL differences which avg() skips — so March, September, October and November honestly show NULL rather than a pretend zero.",
      concepts: ["date_trunc", "to_char", "bucketing", "NULL-skipping aggregates"],
    },
    {
      id: "h-i2",
      tier: "intermediate",
      mode: "sql",
      title: "Masked emails",
      prompt: "ShopSphere must not display full email addresses in its public demo export. Mask each one: keep the first two characters, then five asterisks, then everything from the @ onward — 'amelia.watson@example.com' becomes 'am*****@example.com'. Build the mask with left(email, 2), the literal '*****', and substring(email FROM position('@' IN email)) — the substring starting at the @ position. Return customer_id and masked_email for the first eight customers ordered by customer_id. Expected columns: customer_id, masked_email.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "position('@' IN email) finds the @; substring(email FROM n) runs from that position to the end of the string — the @ itself is included.",
      starter: `SELECT c.customer_id,
       -- left(c.email, 2) || '*****' || substring(c.email FROM position('@' IN c.email))
FROM customers c
ORDER BY c.customer_id
LIMIT 8;
`,
      solution: `SELECT c.customer_id,
       left(c.email, 2) || '*****' || substring(c.email FROM position('@' IN c.email)) AS masked_email
FROM customers c
ORDER BY c.customer_id
LIMIT 8;`,
      ordered: true,
      expected: { columns: ["customer_id", "masked_email"], rows: [
        ["1", "am*****@example.com"],
        ["2", "ma*****@example.com"],
        ["3", "pr*****@example.com"],
        ["4", "di*****@example.com"],
        ["5", "ha*****@example.com"],
        ["6", "to*****@example.com"],
        ["7", "so*****@example.com"],
        ["8", "li*****@example.com"],
      ] },
      explanation:
        "Three pieces glue together: left(email, 2) keeps 'am' from amelia.watson, the literal '*****' hides the middle, and substring(email FROM position('@' IN email)) starts exactly at the @ and runs to the end, giving '@example.com'. Because position() finds the delimiter dynamically, the mask works for any local-part length — Marcus Chen's 'ma*****@example.com' and Liam O'Brien's 'li*****@example.com' line up perfectly without knowing where the @ sits.",
      concepts: ["left", "substring", "position", "masking"],
    },
    {
      id: "h-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Branch assets, formatted",
      prompt: "Meridian Trust's annual report needs the branch table in human shape. For every branch return name, assets_formatted — to_char(assets, 'FM$999G999G999D00'), so 412000000.00 prints as '$412,000,000.00' — and assets_millions, the assets divided by 1000000 and rounded to 1 decimal (412.0). Order by assets descending, biggest bank first. Expected columns: name, assets_formatted, assets_millions.",
      dataset: "banking",
      sampleTables: ["branches"],
      hint: "G marks the thousands separators, D the decimal point, and 0 forces the cents digits to always print; the millions column is plain arithmetic — the division happens on the typed value.",
      starter: `SELECT b.name,
       -- to_char(b.assets, 'FM$999G999G999D00') AS assets_formatted
       -- round(b.assets / 1000000, 1) AS assets_millions
FROM branches b
ORDER BY b.assets DESC;
`,
      solution: `SELECT b.name,
       to_char(b.assets, 'FM$999G999G999D00') AS assets_formatted,
       round(b.assets / 1000000, 1) AS assets_millions
FROM branches b
ORDER BY b.assets DESC;`,
      ordered: true,
      expected: { columns: ["name", "assets_formatted", "assets_millions"], rows: [
        ["Downtown", "$412,000,000.00", "412.0"],
        ["Riverside", "$268,000,000.00", "268.0"],
        ["Lakewood Plaza", "$187,000,000.00", "187.0"],
        ["Fairview", "$142,000,000.00", "142.0"],
        ["Northgate Uni", "$96,000,000.00", "96.0"],
      ] },
      explanation:
        "The formatted column is pure display: G slots place the commas, D places the decimal, the two 0s force cents to print, and FM strips the padding — '$412,000,000.00'. The millions column is the same money as a number: assets / 1000000 rounded to one decimal, computed on the TYPED value. And the ORDER BY uses b.assets itself — the typed column — which is why Downtown's $412M leads and Northgate Uni's $96M closes, in honest numeric order.",
      concepts: ["to_char numbers", "FM fill mode", "sorting on typed values"],
    },
    {
      id: "h-i4",
      tier: "intermediate",
      mode: "sql",
      title: "The five-year club",
      prompt: "HeliosWorks wants to honor everyone who has been with the company more than five years. As of the course's pinned 'today' DATE '2026-11-14': for every CURRENT employee (terminated IS NULL) whose days employed (DATE '2026-11-14' - hire_date) exceeds 5 * 365.25, return employee (first and last name joined with one space), hire_date, days_employed (the integer day count) and years_employed (that count divided by 365.25, rounded to 1 decimal). Order by days_employed descending and take the first ten rows. Expected columns: employee, hire_date, days_employed, years_employed.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "One subtraction for the days, one division by 365.25 for the years — and the WHERE can reuse the same subtraction rather than trusting the rounded column.",
      starter: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.hire_date,
       -- DATE '2026-11-14' - e.hire_date AS days_employed
       -- round((DATE '2026-11-14' - e.hire_date) / 365.25, 1) AS years_employed
FROM employees e
WHERE e.terminated IS NULL
  -- AND (DATE '2026-11-14' - e.hire_date) > 5 * 365.25
ORDER BY days_employed DESC
LIMIT 10;
`,
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.hire_date,
       DATE '2026-11-14' - e.hire_date AS days_employed,
       round((DATE '2026-11-14' - e.hire_date) / 365.25, 1) AS years_employed
FROM employees e
WHERE e.terminated IS NULL
  AND (DATE '2026-11-14' - e.hire_date) > 5 * 365.25
ORDER BY days_employed DESC
LIMIT 10;`,
      ordered: true,
      expected: { columns: ["employee", "hire_date", "days_employed", "years_employed"], rows: [
        ["Amara Osei", "2017-01-09", "3596", "9.8"],
        ["Daniel Kramer", "2018-03-12", "3169", "8.7"],
        ["Gerald Weiss", "2018-09-03", "2994", "8.2"],
        ["Lena Hoffman", "2019-04-15", "2770", "7.6"],
        ["Sofia Mancini", "2019-06-17", "2707", "7.4"],
        ["Robert McAllister", "2019-08-26", "2637", "7.2"],
        ["Elena Petrova", "2019-11-04", "2567", "7.0"],
        ["Priya Nair", "2020-02-24", "2455", "6.7"],
        ["Freya Johansson", "2020-05-25", "2364", "6.5"],
        ["Marcus Tran", "2020-07-20", "2308", "6.3"],
      ] },
      explanation:
        "date - date gives the integer day count, so Amara Osei (hired 2017-01-09) stands at 3,596 days — and 3,596 / 365.25 is 9.8 years. The threshold uses the raw day count against 5 * 365.25 (five years, leap days included), which keeps the cutoff honest instead of comparing against the rounded years column. Ten current employees have crossed the line, from Amara's 9.8 years down to Marcus Tran's 6.3 — the whole list fits in one LIMIT.",
      concepts: ["date - date", "day-count arithmetic", "pinned today"],
    },
    {
      id: "h-a1",
      tier: "advanced",
      mode: "sql",
      title: "Readmission radar",
      prompt: "St. Marlowe's quality team tracks 30-day readmissions: a patient discharged, then admitted again within 30 days. Self-join admissions to itself on patient_id: for each pair where the second admission came after the first one's discharge (a2.admitted_at > a1.discharged_at) and the gap a2.admitted_at::date - a1.discharged_at::date is at most 30 days, return patient (the patient's full name), first_stay (the earlier admission_id), readmission (the later admission_id) and days_between (the gap in whole days). Order by days_between ascending. Expected columns: patient, first_stay, readmission, days_between.",
      dataset: "hospital",
      sampleTables: ["admissions", "patients"],
      hint: "JOIN admissions a2 ON a2.patient_id = a1.patient_id AND a2.admitted_at > a1.discharged_at — the join condition itself picks the later stay; then filter the gap and join patients for the name.",
      starter: `SELECT p.first_name || ' ' || p.last_name AS patient,
       -- a1.admission_id AS first_stay,
       -- a2.admission_id AS readmission,
       -- a2.admitted_at::date - a1.discharged_at::date AS days_between
FROM admissions a1
-- JOIN admissions a2 ON a2.patient_id = a1.patient_id AND a2.admitted_at > a1.discharged_at
JOIN patients p ON p.patient_id = a1.patient_id
-- WHERE the gap is at most 30 days
ORDER BY days_between;
`,
      solution: `SELECT p.first_name || ' ' || p.last_name AS patient,
       a1.admission_id AS first_stay,
       a2.admission_id AS readmission,
       a2.admitted_at::date - a1.discharged_at::date AS days_between
FROM admissions a1
JOIN admissions a2 ON a2.patient_id = a1.patient_id
                AND a2.admitted_at > a1.discharged_at
JOIN patients p ON p.patient_id = a1.patient_id
WHERE a2.admitted_at::date - a1.discharged_at::date <= 30
ORDER BY days_between;`,
      ordered: true,
      expected: { columns: ["patient", "first_stay", "readmission", "days_between"], rows: [
        ["Margaret Boyle", "11", "30", "5"],
      ] },
      explanation:
        "The self-join pairs every admission with every LATER admission of the same patient — the join condition a2.admitted_at > a1.discharged_at does the pairing, no OR-cases needed. Most repeat patients (Harold Webb, Lucy Ramirez, Walter Osei, Beatrice Lavigne) have gaps of months or years and fall away. What survives the 30-day filter is exactly one case: Margaret Boyle, discharged from admission 11 on 2025-03-23 and readmitted as admission 30 on 2025-03-28 — five days between. The ::date casts keep the subtraction in whole days.",
      concepts: ["self-join", "date arithmetic", "gap analysis", "date - date"],
    },
    {
      id: "h-a2",
      tier: "advanced",
      mode: "sql",
      title: "The 2026 revenue line",
      prompt: "ShopSphere's finance deck needs monthly 2026 numbers. For every month that has orders from 2026-01-01 onward, excluding cancelled orders, return order_month (the month bucket as text, built with to_char(date_trunc('month', order_date), 'YYYY-MM')), orders (the count) and revenue (round(sum(total), 2)). Group and order by the month bucket ascending. Expected columns: order_month, orders, revenue.",
      dataset: "ecommerce",
      sampleTables: ["orders"],
      hint: "Two filters in the WHERE (year boundary and status), one date_trunc for the bucket, to_char for the label, and sum over total for the money.",
      starter: `SELECT to_char(date_trunc('month', o.order_date), 'YYYY-MM') AS order_month,
       count(*) AS orders,
       -- round(sum(o.total), 2) AS revenue
FROM orders o
WHERE o.status <> 'cancelled'
  AND o.order_date >= TIMESTAMP '2026-01-01'
GROUP BY date_trunc('month', o.order_date)
ORDER BY date_trunc('month', o.order_date);
`,
      solution: `SELECT to_char(date_trunc('month', o.order_date), 'YYYY-MM') AS order_month,
       count(*) AS orders,
       round(sum(o.total), 2) AS revenue
FROM orders o
WHERE o.status <> 'cancelled'
  AND o.order_date >= TIMESTAMP '2026-01-01'
GROUP BY date_trunc('month', o.order_date)
ORDER BY date_trunc('month', o.order_date);`,
      ordered: true,
      expected: { columns: ["order_month", "orders", "revenue"], rows: [
        ["2026-01", "1", "89.00"],
        ["2026-02", "1", "2199.00"],
        ["2026-03", "1", "49.00"],
        ["2026-05", "1", "1798.00"],
        ["2026-07", "1", "129.00"],
        ["2026-08", "1", "29.00"],
        ["2026-09", "1", "549.00"],
        ["2026-10", "1", "2499.00"],
        ["2026-11", "2", "288.00"],
      ] },
      explanation:
        "The WHERE does two jobs at once: the timestamp lower bound starts the year at January 2026, and status <> 'cancelled' throws out April's cancelled $449 order (which is why 2026-04 is missing from the line). date_trunc builds each month bucket, count and sum aggregate inside it, and to_char renders '2026-01' through '2026-11'. October is the big month — the $2,499 StudioBook order — and November already has two orders for $288.00 with the month not over (on the pinned date).",
      concepts: ["date_trunc", "to_char", "conditional filtering", "monthly rollup"],
    },
    {
      id: "h-a3",
      tier: "advanced",
      mode: "sql",
      title: "Anniversary watch",
      prompt: "HeliosWorks celebrates work anniversaries. Using the pinned 'today' DATE '2026-11-14', compute each CURRENT employee's (terminated IS NULL) NEXT anniversary: build this year's anniversary with make_date(2026, extract(MONTH FROM hire_date)::int, extract(DAY FROM hire_date)::int); if it has not passed yet (>= DATE '2026-11-14') that is the next one, otherwise roll it to 2027 with make_date(2027, month, day) using the same month and day. Keep only employees whose next anniversary is at most 90 days away. Return employee (full name), hire_date, next_anniversary and days_away (next_anniversary - DATE '2026-11-14'). Order by days_away ascending. Expected columns: employee, hire_date, next_anniversary, days_away.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "The CASE appears twice — once in SELECT, once in WHERE — because WHERE cannot see output aliases; extract returns a numeric, so ::int feeds make_date.",
      starter: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.hire_date,
       -- CASE WHEN make_date(2026, m, d) >= DATE '2026-11-14'
       --      THEN make_date(2026, m, d) ELSE make_date(2027, m, d) END AS next_anniversary
FROM employees e
WHERE e.terminated IS NULL
  -- AND (the same CASE) - DATE '2026-11-14' <= 90
ORDER BY days_away;
`,
      solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       e.hire_date,
       CASE
         WHEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) >= DATE '2026-11-14'
         THEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int)
         ELSE make_date(2027, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int)
       END AS next_anniversary,
       CASE
         WHEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) >= DATE '2026-11-14'
         THEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) - DATE '2026-11-14'
         ELSE make_date(2027, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) - DATE '2026-11-14'
       END AS days_away
FROM employees e
WHERE e.terminated IS NULL
  AND CASE
        WHEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) >= DATE '2026-11-14'
        THEN make_date(2026, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) - DATE '2026-11-14'
        ELSE make_date(2027, extract(MONTH FROM e.hire_date)::int, extract(DAY FROM e.hire_date)::int) - DATE '2026-11-14'
      END <= 90
ORDER BY days_away;`,
      ordered: true,
      expected: { columns: ["employee", "hire_date", "next_anniversary", "days_away"], rows: [
        ["Hassan Al-Farsi", "2022-11-14", "2026-11-14", "0"],
        ["Yuki Tanaka", "2024-01-08", "2027-01-08", "55"],
        ["Amara Osei", "2017-01-09", "2027-01-09", "56"],
        ["James Okoro", "2021-01-18", "2027-01-18", "65"],
        ["Omar Haddad", "2023-01-30", "2027-01-30", "77"],
      ] },
      explanation:
        "make_date(2026, month, day) rebuilds each hire date's anniversary in the current year — extract pulls the month and day as numbers (with ::int, since make_date wants integers and extract returns numeric). The CASE checks whether this year's date has already passed the pinned today: Hassan Al-Farsi was hired ON November 14, so his 2026 anniversary is exactly today, zero days away, and he makes the cut. Everyone else rolled to 2027: Yuki Tanaka's January 8 is 55 days out, Amara Osei's January 9 is 56. The WHERE repeats the CASE because it cannot reference the SELECT alias days_away — a CTE or a nested subquery would deduplicate it if the repetition bothers you.",
      concepts: ["make_date", "extract", "CASE", "date - date", "pinned today"],
    },
    {
      id: "h-a4",
      tier: "advanced",
      mode: "sql",
      title: "Restock urgency board",
      prompt: "Trailhead's inventory clerk needs a restock board for open purchase orders. As of the pinned 'today' DATE '2026-11-14': for every purchase order with status 'pending' or 'partial', return po_id, store (the store's name via a join to stores), ordered_on, expected_on, days_since_ordered (DATE '2026-11-14' - ordered_on) and days_until_expected (expected_on - DATE '2026-11-14' — negative numbers mean the delivery is already overdue; a NULL expected_on gives NULL). Order by days_since_ordered descending — the most patient orders first. Expected columns: po_id, store, ordered_on, expected_on, days_since_ordered, days_until_expected.",
      dataset: "retail",
      sampleTables: ["purchase_orders", "stores"],
      hint: "Two subtractions with the pinned date on opposite sides: today - ordered counts backwards, expected - today counts forwards; the join only fetches the store name.",
      starter: `SELECT po.po_id,
       -- s.name AS store, po.ordered_on, po.expected_on
       -- DATE '2026-11-14' - po.ordered_on AS days_since_ordered
       -- po.expected_on - DATE '2026-11-14' AS days_until_expected
FROM purchase_orders po
JOIN stores s ON s.store_id = po.store_id
WHERE po.status IN ('pending', 'partial')
-- ORDER BY days_since_ordered DESC;
`,
      solution: `SELECT po.po_id,
       s.name AS store,
       po.ordered_on,
       po.expected_on,
       DATE '2026-11-14' - po.ordered_on AS days_since_ordered,
       po.expected_on - DATE '2026-11-14' AS days_until_expected
FROM purchase_orders po
JOIN stores s ON s.store_id = po.store_id
WHERE po.status IN ('pending', 'partial')
ORDER BY days_since_ordered DESC;`,
      ordered: true,
      expected: { columns: ["po_id", "store", "ordered_on", "expected_on", "days_since_ordered", "days_until_expected"], rows: [
        ["7", "Downtown Flagship", "2026-10-03", "2026-10-20", "42", "-25"],
        ["8", "Fairview Mall", "2026-10-10", "2026-11-14", "35", "0"],
        ["10", "Lakewood Plaza", "2026-10-22", "2026-11-10", "23", "-4"],
        ["11", "Riverside Commons", "2026-10-29", null, "16", null],
        ["12", "Downtown Flagship", "2026-11-02", "2026-11-20", "12", "6"],
        ["13", "Northgate Outpost", "2026-11-05", "2026-11-24", "9", "10"],
        ["15", "Lakewood Plaza", "2026-11-08", "2026-11-25", "6", "11"],
        ["16", "Riverside Commons", "2026-11-09", "2026-12-08", "5", "24"],
      ] },
      explanation:
        "The two day counts point in opposite directions from the pinned today: today minus ordered_on measures how long the store has waited (PO 7, the partial tent delivery, has waited 42 days), while expected_on minus today measures what is left — and it goes negative when the date has already passed. Three deliveries are overdue (POs 7, 8 and 10 — the -25, 0 and -4 rows), PO 11 has no expected date at all so its countdown is honestly NULL, and PO 16's fresh December 8 delivery still has 24 days of runway. One query, the whole board.",
      concepts: ["date - date", "pinned today", "overdue flags", "joins for labels"],
    },
  ],

  assessment: [
    {
      id: "h-as-1",
      prompt: "What does 'Hello ' || NULL return in PostgreSQL?",
      options: [
        { text: "NULL — a single NULL operand makes the entire || expression NULL", correct: true, feedback: "Correct — || is all-or-nothing: one missing piece erases the whole string." },
        { text: "The text 'Hello '", correct: false, feedback: "That is concat() behavior — it blanks the NULL and keeps the rest." },
        { text: "An empty string", correct: false, feedback: "Neither half survives as '' — the expression has no value at all." },
        { text: "An error, NULL is not allowed with ||", correct: false, feedback: "It is perfectly legal — which is exactly why it slips into reports unnoticed." },
      ],
      explanation: "|| propagates NULL across the whole chain. concat() substitutes an empty string; concat_ws() skips the NULL entirely — choose the behavior on purpose.",
    },
    {
      id: "h-as-2",
      prompt: "You need 'FIRST MIDDLE LAST' with a possibly-NULL middle name, and no stray double spaces when it is missing. Which call?",
      options: [
        { text: "concat_ws(' ', first, middle, last)", correct: true, feedback: "Correct — the separator appears only between pieces that actually exist." },
        { text: "first || ' ' || middle || ' ' || last", correct: false, feedback: "A NULL middle wipes out the entire name — the || trap." },
        { text: "concat(first, ' ', middle, ' ', last)", correct: false, feedback: "concat blanks the NULL but keeps both separators: 'First  Last' with two spaces." },
        { text: "upper(first || middle || last)", correct: false, feedback: "Same NULL trap as ||, plus it destroys the casing and the spaces you wanted." },
      ],
      explanation: "concat_ws places its separator only between non-NULL arguments, so the label reads naturally whether the middle name is there or not.",
    },
    {
      id: "h-as-3",
      prompt: "split_part('marcus.chen@example.com', '@', 2) returns",
      options: [
        { text: "'example.com' — fields count from 1, and field 2 is after the first @", correct: true, feedback: "Correct — the delimiter is consumed and the second field handed back." },
        { text: "'marcus.chen'", correct: false, feedback: "That is field 1 — counting starts at 1 on the left of the delimiter." },
        { text: "An error, because the delimiter appears only once", correct: false, feedback: "One delimiter makes exactly two fields — no error, no NULL." },
        { text: "NULL", correct: false, feedback: "NULL only comes from NULL input; a missing field would be the empty string ''." },
      ],
      explanation: "split_part numbers fields from 1: everything before the delimiter is field 1, everything after is field 2 — the email-splitting move.",
    },
    {
      id: "h-as-4",
      prompt: "Which LIKE pattern matches names whose SECOND character is 'o'?",
      options: [
        { text: "'_o%'", correct: true, feedback: "Correct — _ consumes exactly one character, o must be next, % swallows the rest." },
        { text: "'%o%'", correct: false, feedback: "That matches an o anywhere in the string, not specifically in second place." },
        { text: "'o%'", correct: false, feedback: "That demands o as the FIRST character of the name." },
        { text: "'_o'", correct: false, feedback: "Almost — but with no %, this matches only two-character names." },
      ],
      explanation: "Read patterns left to right: _ is exactly one character, % is any run (including none). To pin a letter in second place, spend one _ before it.",
    },
    {
      id: "h-as-5",
      prompt: "DATE '2026-11-14' - DATE '2026-10-01' evaluates to",
      options: [
        { text: "The integer 44 — a count of days between the two dates", correct: true, feedback: "Correct — date minus date is whole days, as a plain number." },
        { text: "The interval '44 days'", correct: false, feedback: "Intervals come from timestamp minus timestamp; dates return an integer." },
        { text: "A date — the result of the subtraction", correct: false, feedback: "The result is not a point on the calendar; it is the distance between two points." },
        { text: "An error — dates cannot be subtracted", correct: false, feedback: "They can, and it is the workhorse of date reporting; date + date is the one that errors." },
      ],
      explanation: "Subtracting two dates gives an integer day count — 31 days through October plus 13 into November. Feed it straight into arithmetic: / 365.25 for years.",
    },
    {
      id: "h-as-6",
      prompt: "date_trunc('month', TIMESTAMP '2026-11-14 09:42:17') returns",
      options: [
        { text: "TIMESTAMP '2026-11-01 00:00:00' — the first of the month, clock zeroed", correct: true, feedback: "Correct — truncation rounds down to the boundary and zeroes the clock." },
        { text: "The text '2026-11'", correct: false, feedback: "That is to_char applied to the truncated date — formatting, a different job." },
        { text: "The date 2026-11-30 — the month's last day", correct: false, feedback: "Truncation never rounds up or forward; the bucket opens on the 1st." },
        { text: "The same timestamp unchanged, because the month is already November", correct: false, feedback: "The cut is finer than the month: the day and clock are zeroed too." },
      ],
      explanation: "date_trunc keeps the boundary and zeroes everything after it — which is exactly what makes it the GROUP BY key for per-month reports.",
    },
    {
      id: "h-as-7",
      prompt: "Why does ORDER BY to_char(price, 'FM$999G999.00') put '$1,299.00' before '$149.00'?",
      options: [
        { text: "The formatted values are text, and text compares character by character — the comma in '1,299' sorts before the '4' in '149'", correct: true, feedback: "Correct — '$1,' beats '$14' at the third character, and the ranking is nonsense." },
        { text: "to_char rounds the numbers before sorting them", correct: false, feedback: "Formatting never touches the value — it only changes how it is spelled." },
        { text: "The FM prefix reverses the sort direction", correct: false, feedback: "FM only strips padding spaces; it has no effect on ordering." },
        { text: "PostgreSQL sorts money formatted with $ from largest to smallest by default", correct: false, feedback: "There is no money-specific ordering — once it is text, it sorts as text." },
      ],
      explanation: "Sorting happens on the column's TYPE. Keep the typed price in the query and ORDER BY it; format a separate column purely for the reader.",
    },
    {
      id: "h-as-8",
      prompt: "A report casts a phone-extension column with ::int. One row out of 10,000 contains 'ext. 4'. What happens?",
      options: [
        { text: "The whole query fails at runtime: invalid input syntax for type integer", correct: true, feedback: "Correct — a bare cast on dirty text is a runtime bomb, and one row is enough." },
        { text: "That row returns NULL and the other 9,999 run fine", correct: false, feedback: "That is the guarded CASE behavior; a bare cast never skips — it dies." },
        { text: "The cast strips the letters and returns 4", correct: false, feedback: "Casting is strict: it parses the text as a number or fails, never guesses." },
        { text: "PostgreSQL logs a warning and treats the value as 0", correct: false, feedback: "There is no silent fallback — the error is loud, and total." },
      ],
      explanation: "Guard before you cast: CASE WHEN col ~ '^[0-9]+$' THEN col::int END turns dirty input into a visible NULL instead of a dead query.",
    },
  ],

  project: {
    title: "The Year-End Customer Statement",
    brief:
      "Meridian Trust's relationship managers want a year-end statement header for every customer: a readable name, a privacy-safe email, how long the customer has banked with Meridian in whole years (as of the course's pinned 'today' DATE '2026-11-14'), their total account balance as formatted money, and a 'Customer since' line — with the whole result sorted by a TYPED column, never by the formatted text. The build combines Part H's entire toolkit: text functions to build and mask labels, date arithmetic for tenure, to_char for money and dates, and casts to glue numbers into strings. When you are done you will have the one-page pattern every customer-facing report reuses.",
    requirements: [
      "One row per customer — all 20 customers appear, including the prospects with no accounts (LEFT JOIN)",
      "customer: first and last name joined with a single space",
      "masked_email: the first two characters, five asterisks, then everything from the @ onward (left, a literal, substring from position)",
      "years_with_bank: whole years between since and DATE '2026-11-14' (extract the year from age(), or divide the day count by 365.25 and round)",
      "total_balance: the sum of the customer's account balances, displayed through to_char as money like '$41,250.00' (customers with no accounts show '$0.00' — think coalesce)",
      "since_line: the literal 'Customer since ' followed by the since month and year via to_char(since, 'Mon YYYY')",
      "ORDER BY on a typed column (years_with_bank or the unformatted balance) — never on the formatted money text",
    ],
    steps: [
      "Start from customers alone: customer and since, ordered by since — run it and read the rows before adding anything.",
      "Add masked_email with left(email, 2), the '*****' literal, and substring(email FROM position('@' IN email)).",
      "Add years_with_bank with age(DATE '2026-11-14', since) wrapped in extract(YEAR FROM it) — sanity-check Reginald Ashton, a customer since 2007.",
      "LEFT JOIN accounts and GROUP BY the customer to sum balances — the fan-out discipline from Part G still applies at the customer grain.",
      "Wrap the sum in coalesce(total, 0) so the no-account prospects keep a '$0.00' line, then format it with to_char and build since_line.",
      "Sort by the typed years (or the raw balance) descending and read the top of the list as a relationship manager would.",
      "Re-read every column: is anything formatted that should stay typed? Is anything typed that a statement reader would want shaped?",
    ],
    starter: `-- The Year-End Customer Statement (Part H mini project)
-- Database: banking (Meridian Trust)   "Today": DATE '2026-11-14'

SELECT cu.first_name || ' ' || cu.last_name AS customer,
       -- TODO masked_email: left(email, 2) + '*****' + substring from the @
       -- TODO years_with_bank: whole years from age(DATE '2026-11-14', since)
       -- TODO total_balance: sum of the customer's account balances as to_char
       --      money (coalesce to 0 so prospects keep their '$0.00' line)
       -- TODO since_line: 'Customer since ' + to_char(since, 'Mon YYYY')
       cu.since
FROM customers cu
-- LEFT JOIN accounts a ON a.customer_id = cu.customer_id (prospects stay)
-- GROUP BY the customer (one row per customer despite the account fan-out)
-- ORDER BY <a TYPED column, not the formatted money>
`,
    concepts: ["text functions", "masking", "date arithmetic", "to_char", "typed sorting"],
    extension:
      "Add an activity line to the statement: the customer's transactions per month of 2026, bucketed with date_trunc and labeled with to_char(transacted, 'Mon YYYY'), with a count and a sum per month — then a CASE flag marking each customer's busiest month. Finish by masking the account numbers exactly the way you masked the emails, and check that no ORDER BY anywhere touches formatted text.",
  },
};
