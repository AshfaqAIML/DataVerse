/**
 * Part D — Changing Data & Data Integrity.
 *
 * UPDATE and DELETE, the constraint family, data types, the truth about
 * NULL, and identity columns. DDL lessons build on the scratch schema;
 * every verified result comes from the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_D: Part = {
  letter: "D",
  title: "Changing Data & Data Integrity",
  tagline: "UPDATE, DELETE, constraints, data types and the truth about NULL.",
  description:
    "Data is not static and it is not trustworthy by default. This part teaches the write side of SQL — UPDATE and DELETE, with their safety rituals — and the schema features that make bad data impossible: NOT NULL, UNIQUE, CHECK, DEFAULT, primary and foreign keys. You will choose types like a professional, master NULL's three-valued logic, and let PostgreSQL number your rows with IDENTITY.",
  stub: false,
  lessons: [
    {
      slug: "d-01",
      title: "UPDATE — changing what is already stored",
      minutes: 13,
      summary: "SET columns on the rows a WHERE clause picks — and see what changed with RETURNING.",
      kind: "coding",
      objectives: [
        "Update one or several columns with SET",
        "Choose rows precisely with WHERE",
        "Prove the change with RETURNING",
        "Explain the danger of UPDATE without WHERE",
      ],
      why: "Prices change, statuses advance, customers move. UPDATE is how stored facts change, and its one verb — SET — hides the two most important habits in data work: choose rows precisely, and prove what you changed. Practicing on tables you build yourself makes the habits stick before you ever run an UPDATE on data anyone else cares about.",
      blocks: [
        {
          kind: "text",
          text: "This lesson builds a small product table on a blank schema and then changes it. First the setup — a price list for a corner bookshop:",
        },
        {
          kind: "sql",
          title: "The table we will change",
          code: "DROP TABLE IF EXISTS price_list CASCADE;\n\nCREATE TABLE price_list (\n  item_id   int PRIMARY KEY,\n  title     text NOT NULL,\n  price     numeric(10,2) NOT NULL,\n  status    text NOT NULL DEFAULT 'active'\n);\n\nINSERT INTO price_list (item_id, title, price) VALUES\n  (1, 'Field Guide to Browsers', 24.00),\n  (2, 'SQL for Cats', 15.50),\n  (3, 'Database Noir', 32.00);",
          result: { columns: [], rows: [], command: "INSERT" },
        },
        {
          kind: "sql",
          title: "One row, one column",
          code: "UPDATE price_list\nSET price = 26.00\nWHERE item_id = 1\nRETURNING item_id, title, price;",
          result: { columns: ["item_id", "title", "price"], rows: [
        ["1", "Field Guide to Browsers", "26.00"],
      ] },
          explain: [
            "WHERE picks the row(s); SET names the new value. Without WHERE, EVERY row would change — the most feared sentence in SQL.",
            "RETURNING is the receipt: the updated row, exactly as stored now.",
          ],
        },
        {
          kind: "sql",
          title: "Several columns and several rows at once",
          code: "UPDATE price_list\nSET price = price * 0.90,\n    status = 'sale'\nWHERE price > 20\nRETURNING item_id, title, price, status;",
          result: { columns: ["item_id", "title", "price", "status"], rows: [
        ["3", "Database Noir", "28.80", "sale"],
        ["1", "Field Guide to Browsers", "23.40", "sale"],
      ] },
          explain: [
            "SET accepts several columns, comma-separated.",
            "The new price reads the OLD price — `price * 0.90` is computed per row from the value before the update.",
            "Both rows above 20 dollars got the discount and the 'sale' tag; SQL for Cats (15.50) was untouched by the WHERE.",
          ],
        },
        {
          kind: "sql",
          title: "The state after the changes",
          code: "SELECT item_id, title, price, status\nFROM price_list\nORDER BY item_id;",
          result: { columns: ["item_id", "title", "price", "status"], rows: [
        ["1", "Field Guide to Browsers", "23.40", "sale"],
        ["2", "SQL for Cats", "15.50", "active"],
        ["3", "Database Noir", "28.80", "sale"],
      ] },
          explain: [
            "Reading the whole table back is the second half of the safety ritual: change, then look.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The WHERE-less UPDATE",
          text: "UPDATE without WHERE updates every row of the table. The professional ritual: write the WHERE first, run a SELECT with the same WHERE to see the victims, then swap SELECT for UPDATE. In Part J, transactions give you an undo button too.",
        },
        {
          kind: "lab",
          title: "Change some prices yourself",
          task: "Blank schema in the Lab. Re-create the price_list (code below is the same setup), then: raise every 'sale' item back to active at its old price is impossible (old values are gone!) — instead give item 2 a new price of 16.00 with RETURNING, then list the whole table.",
          code: "DROP TABLE IF EXISTS price_list CASCADE;\n\nCREATE TABLE price_list (\n  item_id   int PRIMARY KEY,\n  title     text NOT NULL,\n  price     numeric(10,2) NOT NULL,\n  status    text NOT NULL DEFAULT 'active'\n);\n\nINSERT INTO price_list (item_id, title, price) VALUES\n  (1, 'Field Guide to Browsers', 24.00),\n  (2, 'SQL for Cats', 15.50),\n  (3, 'Database Noir', 32.00);\n\nUPDATE price_list SET price = 16.00 WHERE item_id = 2\nRETURNING item_id, title, price;\n\nSELECT * FROM price_list ORDER BY item_id;",
          hint: "The lesson's blocks are not there in your Lab run — the starter above rebuilds the same table so your UPDATE has something to change.",
        },
      ],
      terms: [
        { term: "UPDATE ... SET", definition: "Changes columns on the rows WHERE selects; SET names column = value pairs." },
        { term: "RETURNING", definition: "Echoes the rows an UPDATE (or INSERT/DELETE) actually changed." },
        { term: "Victim check", definition: "Running a SELECT with the same WHERE before an UPDATE, to see which rows will change." },
      ],
      mistakes: [
        {
          mistake: "UPDATE without WHERE",
          why: "Every row changes — instantly and silently. Whole tables have been repriced by one missing clause.",
          fix: "Write WHERE first; SELECT the victims; then UPDATE. Add RETURNING so the receipt proves the blast radius.",
        },
        {
          mistake: "Expecting to read the old value after the update",
          why: "UPDATE overwrites immediately — the previous value is gone unless you kept it somewhere (transactions in Part J are the real safety net).",
          fix: "RETURNING shows the new state; if you need old and new, store a history table or run inside a transaction you verify before COMMIT.",
        },
      ],
      takeaways: [
        "WHERE chooses the rows; SET names the new values.",
        "New values can be computed from old ones (price * 0.90), per row.",
        "RETURNING is the professional's receipt on every write.",
        "SELECT the victims before you UPDATE them — always.",
      ],
      quiz: [
        {
          id: "d-01-q1",
          prompt: "What does `UPDATE price_list SET status = 'sale'` (no WHERE) do?",
          options: [
            { text: "Fails: WHERE is required", correct: false, feedback: "It is legal — and that is exactly the danger." },
            { text: "Sets status on every row of the table", correct: true, feedback: "Correct — no WHERE means all rows are chosen." },
            { text: "Updates only the first row", correct: false, feedback: "There is no 'first row' without ORDER BY, and no such limit exists." },
          ],
          explanation: "A WHERE-less UPDATE rewrites the whole table — the reason the SELECT-the-victims ritual exists.",
        },
        {
          id: "d-01-q2",
          prompt: "Why attach RETURNING to an UPDATE?",
          options: [
            { text: "To see the rows exactly as changed, without a separate SELECT", correct: true, feedback: "Correct — the write's own receipt." },
            { text: "To undo the update", correct: false, feedback: "Undo is transactions' job (Part J); RETURNING only reports." },
            { text: "To make the update conditional", correct: false, feedback: "Conditions live in WHERE." },
          ],
          explanation: "RETURNING selects back the changed rows — proof and inspection in one statement.",
        },
      ],
    },

    {
      slug: "d-02",
      title: "DELETE — removing rows, safely",
      minutes: 13,
      summary: "Remove the rows a WHERE picks, prove the removal with RETURNING, and know TRUNCATE's difference.",
      kind: "coding",
      objectives: [
        "Delete rows selected by WHERE",
        "Prove deletions with RETURNING",
        "Explain DELETE vs TRUNCATE",
        "Run the SELECT-first safety ritual on deletions",
      ],
      why: "Deleting data is the one SQL act you cannot over-undo. GDPR erasure requests, test-data cleanup, duplicate merges — deletions are routine professional work, and disasters almost always trace to a WHERE clause written too quickly. This lesson builds the habits on scratch data: select the victims, delete with a receipt, and read the table back.",
      blocks: [
        {
          kind: "text",
          text: "A signup sheet with some abandoned entries — the running example for this lesson:",
        },
        {
          kind: "sql",
          title: "Setup: signups with some junk",
          code: "DROP TABLE IF EXISTS signups CASCADE;\n\nCREATE TABLE signups (\n  signup_id int PRIMARY KEY,\n  email     text NOT NULL UNIQUE,\n  source    text NOT NULL,\n  verified  boolean NOT NULL DEFAULT false\n);\n\nINSERT INTO signups (signup_id, email, source, verified) VALUES\n  (1, 'ana@example.com', 'homepage', true),\n  (2, 'bo@example.com', 'homepage', true),\n  (3, 'test@test.test', 'qa', false),\n  (4, 'bot@spam.io', 'paid-ad', false),\n  (5, 'cleo@example.com', 'referral', true);",
          result: { columns: [], rows: [], command: "INSERT" },
        },
        {
          kind: "sql",
          title: "First, look at the victims",
          code: "SELECT signup_id, email, source\nFROM signups\nWHERE verified = false;",
          result: { columns: ["signup_id", "email", "source"], rows: [
        ["3", "test@test.test", "qa"],
        ["4", "bot@spam.io", "paid-ad"],
      ] },
          explain: [
            "The ritual's first half: this SELECT shows exactly what the DELETE will remove — two unverified rows, one QA artifact and one bot.",
          ],
        },
        {
          kind: "sql",
          title: "Then delete, with a receipt",
          code: "DELETE FROM signups\nWHERE verified = false\nRETURNING signup_id, email;",
          result: { columns: ["signup_id", "email"], rows: [
        ["3", "test@test.test"],
        ["4", "bot@spam.io"],
      ] },
          explain: [
            "Same WHERE as the SELECT — the two rows are gone, and RETURNING shows their final farewell.",
            "DELETE removes whole rows; there is no column list, because everything goes.",
          ],
        },
        {
          kind: "sql",
          title: "Read the table back",
          code: "SELECT signup_id, email, source, verified\nFROM signups\nORDER BY signup_id;",
          result: { columns: ["signup_id", "email", "source", "verified"], rows: [
        ["1", "ana@example.com", "homepage", "true"],
        ["2", "bo@example.com", "homepage", "true"],
        ["5", "cleo@example.com", "referral", "true"],
      ] },
          explain: [
            "Three verified humans remain. The ritual is complete: looked, deleted, receipt, re-read.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "DELETE without WHERE empties the table",
          text: "Like UPDATE, DELETE without a WHERE applies to every row. The table's structure survives — all rows are gone. TRUNCATE does the same job faster but cannot take a WHERE at all: it is all-or-nothing by design, and it resets identity counters.",
        },
        {
          kind: "table",
          title: "DELETE vs TRUNCATE",
          headers: ["", "DELETE", "TRUNCATE"],
          rows: [
            ["Scope", "Rows a WHERE selects", "Always the whole table"],
            ["WHERE allowed", "Yes", "No — syntax error"],
            ["RETURNING", "Yes — the receipt", "No"],
            ["Rollback (Part J)", "Row by row", "Statement-level"],
            ["Typical use", "Precise removals", "Wiping staging/test tables"],
          ],
        },
        {
          kind: "lab",
          title: "Delete with the ritual",
          task: "Blank schema: rebuild the signups table from the starter, then delete ONLY the QA artifact (source 'qa') with RETURNING, then re-read the table. Three statements, in that order — the whole ritual.",
          code: "DROP TABLE IF EXISTS signups CASCADE;\n\nCREATE TABLE signups (\n  signup_id int PRIMARY KEY,\n  email     text NOT NULL UNIQUE,\n  source    text NOT NULL,\n  verified  boolean NOT NULL DEFAULT false\n);\n\nINSERT INTO signups (signup_id, email, source, verified) VALUES\n  (1, 'ana@example.com', 'homepage', true),\n  (2, 'bo@example.com', 'homepage', true),\n  (3, 'test@test.test', 'qa', false),\n  (4, 'bot@spam.io', 'paid-ad', false),\n  (5, 'cleo@example.com', 'referral', true);\n\n-- 1. SELECT the victims\nSELECT signup_id, email FROM signups WHERE source = 'qa';\n\n-- 2. DELETE with RETURNING\nDELETE FROM signups WHERE source = 'qa' RETURNING signup_id, email;\n\n-- 3. Read back\nSELECT signup_id, email, source FROM signups ORDER BY signup_id;",
          hint: "Run the whole starter; the Lab executes each statement and shows the last result — scroll the history panel to see each.",
        },
      ],
      terms: [
        { term: "DELETE FROM", definition: "Removes whole rows selected by WHERE." },
        { term: "TRUNCATE", definition: "Removes every row of a table at once — faster, no WHERE, resets identity." },
        { term: "Safety ritual", definition: "SELECT victims, DELETE with RETURNING, re-read the table." },
      ],
      mistakes: [
        {
          mistake: "DELETE without WHERE, 'just to test'",
          why: "The table empties instantly — and on a shared database, that is someone's afternoon gone.",
          fix: "Always write the WHERE first. For practice tables, TRUNCATE is at least honest about being all-or-nothing.",
        },
        {
          mistake: "Deleting without checking children rows",
          why: "Foreign keys may refuse the delete (referenced rows exist) — or worse, you deleted parents a report needed.",
          fix: "Know the relationships (schema explorer shows the links) before removing anything referenced.",
        },
      ],
      takeaways: [
        "DELETE removes whole rows WHERE selects; RETURNING receipts them.",
        "SELECT the victims before deleting — the same ritual as UPDATE.",
        "TRUNCATE wipes whole tables fast: no WHERE, no RETURNING, identity reset.",
        "Deletion is the least forgiving verb: slow down, always.",
      ],
      quiz: [
        {
          id: "d-02-q1",
          prompt: "Which statement removes ONLY unverified signups?",
          options: [
            { text: "DELETE FROM signups WHERE verified = false;", correct: true, feedback: "Correct — WHERE selects the victims precisely." },
            { text: "TRUNCATE signups WHERE verified = false;", correct: false, feedback: "TRUNCATE takes no WHERE — that is a syntax error." },
            { text: "DELETE verified FROM signups;", correct: false, feedback: "DELETE removes rows, not columns; the condition belongs in WHERE." },
          ],
          explanation: "DELETE + WHERE is the precise tool; TRUNCATE is deliberately all-or-nothing.",
        },
        {
          id: "d-02-q2",
          prompt: "What is the practical difference between TRUNCATE and WHERE-less DELETE?",
          options: [
            { text: "None at all", correct: false, feedback: "Both empty the table, but speed, RETURNING and identity reset differ." },
            { text: "TRUNCATE is faster, cannot show the removed rows, and resets identity counters", correct: true, feedback: "Correct — a bulk operation by design." },
            { text: "TRUNCATE keeps the WHERE option open", correct: false, feedback: "The opposite: TRUNCATE refuses any condition." },
          ],
          explanation: "TRUNCATE is the sledgehammer: faster, dumber, identity-resetting. Precise removals belong to DELETE + WHERE.",
        },
      ],
    },

    {
      slug: "d-03",
      title: "Constraints — the database that protects itself",
      minutes: 15,
      summary: "NOT NULL, UNIQUE, CHECK, DEFAULT, primary and foreign keys: rules the engine enforces on every write, forever.",
      kind: "coding",
      objectives: [
        "Declare NOT NULL, UNIQUE, CHECK and DEFAULT on columns",
        "Declare PRIMARY KEY and FOREIGN KEY in CREATE TABLE",
        "Read the errors rejected writes produce",
        "Explain ON DELETE CASCADE with a working demo",
      ],
      why: "Every constraint is a business rule turned into physics. 'Prices are never negative', 'emails identify a person', 'an order belongs to a real customer' — you can hope application code enforces these, or you can make the database refuse violations on every INSERT and UPDATE for the life of the system. This lesson makes each rule real: a working write, then a rejected write, with the exact error the engine returns.",
      blocks: [
        {
          kind: "text",
          text: "The scene: a concert ticket table with rules a promoter would insist on — tickets are identified, seats are unique per show, prices are never negative, and every booking belongs to a real guest. The setup (scratch schema, state accumulates through the lesson):",
        },
        {
          kind: "sql",
          title: "Rules written into the table",
          code: "DROP TABLE IF EXISTS ticket_notes CASCADE;\nDROP TABLE IF EXISTS tickets CASCADE;\nDROP TABLE IF EXISTS guests CASCADE;\n\nCREATE TABLE guests (\n  guest_id  int PRIMARY KEY,\n  name      text NOT NULL,\n  email     text NOT NULL UNIQUE\n);\n\nCREATE TABLE tickets (\n  ticket_id  int PRIMARY KEY,\n  guest_id   int NOT NULL REFERENCES guests(guest_id),\n  seat       text NOT NULL UNIQUE,\n  price      numeric(10,2) NOT NULL CHECK (price >= 0),\n  status     text NOT NULL DEFAULT 'open'\n);\n\nINSERT INTO guests (guest_id, name, email) VALUES\n  (1, 'Nina Novak', 'nina@example.com'),\n  (2, 'Omar Haddad', 'omar@example.com');\n\nINSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES\n  (1, 1, 'A1', 85.00),\n  (2, 2, 'B7', 85.00);",
          result: { columns: [], rows: [], command: "INSERT" },
          explain: [
            "Six constraints in one definition: two primary keys, guest emails unique, seats unique, prices checked >= 0, status defaulted.",
            "The inserts obey every rule, so they succeed — and status filled itself with 'open'.",
          ],
        },
        {
          kind: "sql",
          title: "Now try to break each rule",
          code: "INSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (3, 1, 'A1', 70.00);",
          expectError: "duplicate key value violates unique constraint \"tickets_seat_key\"",
        },
        {
          kind: "sql",
          title: "A negative price, refused",
          code: "INSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (3, 1, 'C3', -10.00);",
          expectError: "new row for relation \"tickets\" violates check constraint \"tickets_price_check\"",
        },
        {
          kind: "sql",
          title: "A booking for a ghost guest, refused",
          code: "INSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (3, 99, 'C3', 70.00);",
          expectError: "insert or update on table \"tickets\" violates foreign key constraint \"tickets_guest_id_fkey\"",
        },
        {
          kind: "sql",
          title: "The table is unchanged — exactly as designed",
          code: "SELECT ticket_id, guest_id, seat, price, status\nFROM tickets\nORDER BY ticket_id;",
          result: { columns: ["ticket_id", "guest_id", "seat", "price", "status"], rows: [
        ["1", "1", "A1", "85.00", "open"],
        ["2", "2", "B7", "85.00", "open"],
      ] },
          explain: [
            "Three violations attempted, zero rows written: the seat duplicate, the negative price and the ghost guest all bounced at the door.",
            "Statements are atomic — a rejected INSERT leaves nothing behind.",
          ],
        },
        { kind: "heading", text: "Cascades: what happens to children" },
        {
          kind: "sql",
          title: "ON DELETE CASCADE, demonstrated",
          code: "CREATE TABLE ticket_notes (\n  note_id   int PRIMARY KEY,\n  ticket_id int NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,\n  note      text NOT NULL\n);\n\nINSERT INTO ticket_notes (note_id, ticket_id, note) VALUES\n  (1, 1, 'wheelchair access requested'),\n  (2, 2, 'bought as a gift');\n\nDELETE FROM tickets WHERE ticket_id = 1\nRETURNING ticket_id, seat;\n\nSELECT note_id, ticket_id, note FROM ticket_notes ORDER BY note_id;",
          result: { columns: ["note_id", "ticket_id", "note"], rows: [
        ["2", "2", "bought as a gift"],
      ] },
          explain: [
            "Deleting ticket 1 cascades: its note went with it, because the foreign key declares ON DELETE CASCADE.",
            "Without CASCADE, the DELETE would have been refused — the note would dangle. Both are declared choices, never accidents.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Where Part A's promises became syntax",
          text: "Primary keys (a-05) and foreign keys (a-06) were concepts then; here they are clauses — PRIMARY KEY and REFERENCES — with the engine enforcing uniqueness, presence and referential integrity on every write you will ever make.",
        },
        {
          kind: "lab",
          title: "Feel a constraint refuse you",
          task: "Blank schema: rebuild the two tables from the starter below, then attempt to insert a ticket with a DUPLICATE seat (A1) and watch the engine refuse it with the exact error this lesson showed. Then insert a legal ticket to confirm the table still works.",
          code: "DROP TABLE IF EXISTS tickets CASCADE;\nDROP TABLE IF EXISTS guests CASCADE;\n\nCREATE TABLE guests (\n  guest_id  int PRIMARY KEY,\n  name      text NOT NULL,\n  email     text NOT NULL UNIQUE\n);\nCREATE TABLE tickets (\n  ticket_id  int PRIMARY KEY,\n  guest_id   int NOT NULL REFERENCES guests(guest_id),\n  seat       text NOT NULL UNIQUE,\n  price      numeric(10,2) NOT NULL CHECK (price >= 0),\n  status     text NOT NULL DEFAULT 'open'\n);\nINSERT INTO guests (guest_id, name, email) VALUES (1, 'Nina Novak', 'nina@example.com');\nINSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (1, 1, 'A1', 85.00);\n\n-- YOUR MOVE (uncomment, run, read the refusal):\n-- INSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (2, 1, 'A1', 70.00);\n\n-- then add the LEGAL ticket (seat 'C3', 70.00):\nINSERT INTO tickets (ticket_id, guest_id, seat, price) VALUES (2, 1, 'C3', 70.00);",
          hint: "The Lab's error panel names the constraint — the engine telling you which rule you met.",
        },
      ],
      terms: [
        { term: "NOT NULL", definition: "Column rule: every row must carry a value." },
        { term: "UNIQUE", definition: "Column rule: no two rows share the value." },
        { term: "CHECK", definition: "Column rule: a boolean condition every written value must satisfy." },
        { term: "ON DELETE CASCADE", definition: "Foreign-key behavior: deleting the referenced row also deletes rows referencing it." },
      ],
      mistakes: [
        {
          mistake: "Enforcing business rules only in application code",
          why: "Every new script, import and 2am fix bypasses hope-only rules. The database is the one gate nothing slips past.",
          fix: "Rules that must never break become constraints; code handles the friendly errors they produce.",
        },
        {
          mistake: "Adding constraints after the data is dirty",
          why: "Existing violations block the ALTER from succeeding — cleanup first, constraint second.",
          fix: "Design constraints in (this lesson), or clean data before retrofitting them.",
        },
      ],
      takeaways: [
        "Constraints are business rules enforced by the engine on every write.",
        "NOT NULL, UNIQUE, CHECK, DEFAULT, PRIMARY KEY, REFERENCES — the family.",
        "Violations are rejected atomically, with named, readable errors.",
        "ON DELETE CASCADE / RESTRICT is a declared choice about children rows.",
      ],
      quiz: [
        {
          id: "d-03-q1",
          prompt: "INSERT a row with price -10 into a table declaring CHECK (price >= 0). What happens?",
          options: [
            { text: "The row is stored with a warning", correct: false, feedback: "There is no warning tier — the write is refused." },
            { text: "The INSERT fails with a check-constraint violation; nothing is stored", correct: true, feedback: "Correct — refused at the door, atomically." },
            { text: "The price is silently changed to 0", correct: false, feedback: "The engine refuses; it never invents values for you." },
          ],
          explanation: "CHECK conditions are enforced on every write; violations abort the statement whole.",
        },
        {
          id: "d-03-q2",
          prompt: "A foreign key declares ON DELETE CASCADE. Deleting the parent row will...",
          options: [
            { text: "Also delete the rows referencing it", correct: true, feedback: "Correct — the cascade sweeps the children along." },
            { text: "Be refused if any row references it", correct: false, feedback: "That is the default (RESTRICT-like) behavior — CASCADE is the declared alternative." },
            { text: "Set the referencing column to NULL", correct: false, feedback: "That is ON DELETE SET NULL — a third declared choice." },
          ],
          explanation: "CASCADE, RESTRICT and SET NULL are the designer's menu; the demo showed CASCADE sweeping ticket 1's note away.",
        },
      ],
    },

    {
      slug: "d-04",
      title: "Choosing data types",
      minutes: 14,
      summary: "int, numeric, text, date, timestamp, boolean, uuid, jsonb — the right home for every kind of fact.",
      kind: "coding",
      objectives: [
        "Match each kind of fact to its natural type",
        "Explain why money uses numeric, never floating point",
        "Choose between date, timestamp and timestamptz",
        "Recognize when jsonb and uuid earn their place",
      ],
      why: "Types are the schema's first line of defense (lesson b-04 promised this deep dive). Choose wrong and the database happily stores nonsense: dates that never existed, money that drifts by fractions of a cent, timestamps that mean different things in different countries. Choose right and the engine rejects garbage for free, your comparisons mean what they say, and your aggregates come out exact. This lesson is the field guide.",
      blocks: [
        {
          kind: "table",
          title: "The type field guide",
          headers: ["Type", "Holds", "Use it for"],
          rows: [
            ["int / bigint", "Whole numbers (32/64-bit)", "Counts, quantities, ids"],
            ["numeric(p,s)", "Exact decimals", "MONEY — always"],
            ["text / varchar(n)", "Text of any/bounded length", "Names, emails, descriptions"],
            ["date / timestamp / timestamptz", "Day / moment / moment+zone", "Calendar days, events, global systems"],
            ["boolean", "true / false", "Flags: is_active, verified"],
            ["uuid", "Globally unique id", "Distributed systems, non-guessable ids"],
            ["jsonb", "Structured documents", "Flexible attributes you still want to query"],
          ],
        },
        { kind: "heading", text: "The money rule" },
        {
          kind: "text",
          text: "Floating-point types (real, double precision) trade exactness for speed: 0.1 cannot be stored exactly in binary, and penny-perfect arithmetic on approximations drifts. numeric is exact — every value is stored as decimal digits, so 0.10 + 0.20 is exactly 0.30. The rule professionals never break: **money is numeric, always**.",
        },
        {
          kind: "table",
          title: "What float drift looks like (illustrative)",
          headers: ["Arithmetic", "Exact (numeric)", "Approximate (float)"],
          rows: [
            ["0.10 + 0.20", "0.30", "0.30000000000000004"],
            ["1.10 * 3", "3.30", "3.3000000000000003"],
            ["sum of 10,000 x 0.19", "1900.00", "1899.9999999999998"],
          ],
          caption: "A tenth of a cent here, a tenth there — until reconciliation fails at scale.",
        },
        { kind: "heading", text: "Times and zones" },
        {
          kind: "text",
          text: "date is a calendar day (a birthday is a day, not a moment). timestamp is a moment without a zone — fine for single-timezone systems. timestamptz records the moment WITH its zone reference: the professional default for anything global, because '10:00' means different instants in Portland and Berlin. The course's datasets use date and plain timestamp to keep outputs stable; in production you reach for timestamptz.",
        },
        {
          kind: "sql",
          title: "Types in action: a small, honest table",
          code: "DROP TABLE IF EXISTS readings CASCADE;\n\nCREATE TABLE readings (\n  reading_id   int PRIMARY KEY,\n  taken_on     date NOT NULL,\n  taken_at     timestamp NOT NULL,\n  temp_c       numeric(5,2) NOT NULL CHECK (temp_c BETWEEN -80 AND 60),\n  is_valid     boolean NOT NULL DEFAULT true,\n  metadata     jsonb\n);\n\nINSERT INTO readings (reading_id, taken_on, taken_at, temp_c, metadata)\nVALUES (1, DATE '2026-11-14', TIMESTAMP '2026-11-14 09:30:00', 21.40,\n        '{\"sensor\": \"north-wall\", \"battery\": 88}');\n\nSELECT reading_id, taken_on, taken_at, temp_c, is_valid,\n       metadata ->> 'sensor' AS sensor\nFROM readings;",
          result: { columns: ["reading_id", "taken_on", "taken_at", "temp_c", "is_valid", "sensor"], rows: [
        ["1", "2026-11-14", "2026-11-14 09:30:00", "21.40", "true", "north-wall"],
      ] },
          explain: [
            "Each column's type matches its fact: a day, a moment, an exact decimal with a sanity CHECK, a flag, a document.",
            "metadata ->> 'sensor' pulls a value OUT of the jsonb as text — a preview of Part J's json lesson.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Types reject nonsense for free",
          text: "Insert '2026-02-30' into a date column and PostgreSQL refuses. That is not an error to be annoyed by — it is a type doing the job you gave it. Every rejected impossible value is a bug that never reached production.",
        },
        {
          kind: "lab",
          title: "Watch a type refuse garbage",
          task: "The starter drops, rebuilds and loads one legal reading. Your move: uncomment the impossible date (February 30th) and run — the type refuses. Comment it back out, run the rest, and see the legal reading selected back.",
          code: "DROP TABLE IF EXISTS readings CASCADE;\n\nCREATE TABLE readings (\n  reading_id   int PRIMARY KEY,\n  taken_on     date NOT NULL,\n  taken_at     timestamp NOT NULL,\n  temp_c       numeric(5,2) NOT NULL CHECK (temp_c BETWEEN -80 AND 60),\n  is_valid     boolean NOT NULL DEFAULT true,\n  metadata     jsonb\n);\n\n-- YOUR MOVE (uncomment and run to see the refusal):\n-- INSERT INTO readings (reading_id, taken_on, taken_at, temp_c)\n-- VALUES (1, DATE '2026-02-30', TIMESTAMP '2026-02-28 09:30:00', 21.40);\n\nINSERT INTO readings (reading_id, taken_on, taken_at, temp_c)\nVALUES (1, DATE '2026-11-14', TIMESTAMP '2026-11-14 09:30:00', 21.40);\n\nSELECT reading_id, taken_on, temp_c FROM readings;",
          hint: "The error will say the date/time field value is out of range — the type's honest refusal.",
        },
      ],
      terms: [
        { term: "numeric(p,s)", definition: "Exact decimal with precision and scale — the only correct home for money." },
        { term: "timestamptz", definition: "A moment recorded with its time-zone reference — the production default." },
        { term: "jsonb", definition: "Binary JSON documents, queryable field by field inside a column." },
        { term: "uuid", definition: "A 128-bit globally unique identifier — ids that never collide across systems." },
      ],
      mistakes: [
        {
          mistake: "Storing money as float/double",
          why: "Binary cannot represent 0.1 exactly; sums drift by fractions of cents and reconciliation eventually fails.",
          fix: "numeric(10,2) (or a fitting precision) for every money column. No exceptions.",
        },
        {
          mistake: "Storing dates as text",
          why: "'2026-11-14' as text sorts luckily, but '11/14/2026' does not, comparisons misbehave, and impossible dates sail through.",
          fix: "Real date columns: comparisons, ranges and calendar arithmetic come free — and garbage is refused.",
        },
      ],
      takeaways: [
        "Every kind of fact has a natural type; choose it deliberately.",
        "Money is numeric — floats drift; decimals do not.",
        "date for days, timestamp for moments, timestamptz for global moments.",
        "Types reject impossible values for free: errors at the door beat bugs in production.",
      ],
      quiz: [
        {
          id: "d-04-q1",
          prompt: "Why is numeric the rule for money columns?",
          options: [
            { text: "It is faster than float", correct: false, feedback: "It is not — exactness is the reason, not speed." },
            { text: "It stores exact decimal digits, so cents never drift", correct: true, feedback: "Correct — 0.10 + 0.20 is exactly 0.30, forever." },
            { text: "It supports currency symbols", correct: false, feedback: "Formatting is presentation; numeric stores the number exactly." },
          ],
          explanation: "Floats approximate binary fractions and drift; numeric is exact — the property money requires.",
        },
        {
          id: "d-04-q2",
          prompt: "A customer's birth date belongs in which type?",
          options: [
            { text: "date — a birthday is a calendar day, not a moment", correct: true, feedback: "Correct — no time, no zone; just the day." },
            { text: "timestamptz — maximum information", correct: false, feedback: "A birth day has no meaningful time-of-day; the extra precision is noise." },
            { text: "text — flexible for future formats", correct: false, feedback: "Text dates mis-sort, mis-compare and accept impossibilities like February 30th." },
          ],
          explanation: "Match the type to the fact: a day is a date. Moments get timestamps; documents get jsonb.",
        },
      ],
    },

    {
      slug: "d-05",
      title: "The truth about NULL",
      minutes: 14,
      summary: "NULL means unknown — not zero, not empty — and it plays by three-valued logic that surprises everyone once.",
      kind: "coding",
      dataset: "ecommerce",
      objectives: [
        "Test for NULL with IS NULL and IS NOT NULL",
        "Explain why = NULL never matches",
        "Replace missing values with COALESCE, compare with NULLIF",
        "Predict how aggregates treat NULL (count(*) vs count(col))",
      ],
      why: "NULL is the most misunderstood value in SQL — it is not zero, not an empty string, not false. It is 'unknown', and unknown propagates through comparisons in three-valued logic that catches every professional once (usually on a NOT IN that silently returns nothing). Mastering NULL means your missing data behaves predictably, your reports do not silently drop rows, and the hospital's open admissions and the shop's unrated products stop surprising you.",
      blocks: [
        {
          kind: "text",
          text: "The ShopSphere customers table carries NULLs on purpose: customers who never gave a phone number. NULL is the honest record of that fact — 'no value known' — and it is NOT the same as an empty string or zero:",
        },
        {
          kind: "sql",
          title: "Finding the missing",
          code: "SELECT customer_id, first_name, last_name, phone\nFROM customers\nWHERE phone IS NULL\nORDER BY customer_id;",
          result: { columns: ["customer_id", "first_name", "last_name", "phone"], rows: [
        ["3", "Priya", "Sharma", null],
        ["7", "Sofia", "Rossi", null],
        ["12", "Victor", "Nguyen", null],
        ["17", "Lucia", "Moreno", null],
      ] },
          explain: [
            "IS NULL is the only honest test for missing values — three customers have no phone on file.",
            "IS NOT NULL finds the rest. These two operators are your entire toolkit for detecting absence.",
          ],
        },
        { kind: "heading", text: "The trap: = NULL" },
        {
          kind: "sql",
          title: "A comparison that matches nobody",
          code: "SELECT count(*) AS matched\nFROM customers\nWHERE phone = NULL;",
          result: { columns: ["matched"], rows: [
        ["0"],
      ] },
          explain: [
            "Zero rows — forever. Comparing anything to unknown yields unknown, and WHERE keeps only TRUE.",
            "Even NULL = NULL is unknown — two unknowns are not thereby equal. This is three-valued logic: TRUE, FALSE, UNKNOWN.",
          ],
        },
        {
          kind: "visual",
          title: "Three-valued logic in one picture",
          ascii: `  comparison outcomes:   TRUE   -> row kept
                          FALSE  -> row dropped
                          UNKNOWN-> row dropped (silently!)

  phone = NULL          -> UNKNOWN  (even when phone IS null!)
  phone IS NULL         -> TRUE/FALSE  (the honest test)

  NULL AND FALSE        -> FALSE
  NULL AND TRUE         -> UNKNOWN
  NOT NULL              -> UNKNOWN`,
          caption: "Unknown poisons logic: any comparison touching NULL yields unknown, which WHERE treats as false.",
        },
        { kind: "heading", text: "Working with missing values" },
        {
          kind: "sql",
          title: "COALESCE — a polite stand-in",
          code: "SELECT first_name || ' ' || last_name AS customer,\n       COALESCE(phone, 'no phone on file') AS contact\nFROM customers\nWHERE city = 'Austin'\nORDER BY customer_id;",
          result: { columns: ["customer", "contact"], rows: [
        ["Priya Sharma", "no phone on file"],
        ["Ayesha Khan", "+1-512-555-0148"],
      ] },
          explain: [
            "COALESCE returns its first non-NULL argument: the phone when present, the stand-in text when missing.",
            "It never changes stored data — it dresses the output for humans.",
          ],
        },
        {
          kind: "sql",
          title: "NULLIF — a guarded comparison",
          code: "SELECT 10 / NULLIF(0, 0) AS guarded_division;",
          result: { columns: ["guarded_division"], rows: [
        [null],
      ] },
          explain: [
            "NULLIF(a, b) returns NULL when a equals b — here, dividing by zero becomes dividing by NULL,",
            "which yields NULL instead of an error. A tiny guard used in real reporting code everywhere.",
          ],
        },
        {
          kind: "sql",
          title: "Aggregates quietly skip NULLs",
          code: "SELECT count(*) AS all_rows,\n       count(phone) AS with_phone,\n       count(DISTINCT city) AS distinct_cities\nFROM customers;",
          result: { columns: ["all_rows", "with_phone", "distinct_cities"], rows: [
        ["20", "16", "11"],
      ] },
          explain: [
            "count(*) counts rows; count(phone) counts the non-NULL phones — twenty and seventeen here.",
            "Every aggregate except count(*) ignores NULLs. State that out loud whenever you average or count columns.",
          ],
        },
        {
          kind: "lab",
          title: "The NOT IN trap, observed",
          task: "Run the query: customers whose city is NOT IN a list containing NULL (SELECT DISTINCT NULL). Then fix it by removing the NULL from the subquery shape and re-run. Watch the first return zero rows — unknown poisoning an entire NOT IN list.",
          code: "SELECT customer_id, first_name\nFROM customers\nWHERE city NOT IN (SELECT 'Boston' UNION ALL SELECT NULL)\nORDER BY customer_id\nLIMIT 5;",
          dataset: "ecommerce",
          hint: "The fix: NOT IN (SELECT 'Boston') alone. The lesson: if a NOT IN list can contain NULL, use NOT EXISTS instead (Part G).",
        },
      ],
      terms: [
        { term: "NULL", definition: "The absence of a value — unknown, distinct from zero, empty string and false." },
        { term: "Three-valued logic", definition: "Comparisons yield TRUE, FALSE or UNKNOWN; WHERE keeps only TRUE." },
        { term: "COALESCE", definition: "Returns its first non-NULL argument — a display-time stand-in for missing values." },
        { term: "NULLIF", definition: "Returns NULL when its two arguments are equal — a guard for division-by-zero and more." },
      ],
      mistakes: [
        {
          mistake: "WHERE phone = NULL",
          why: "The comparison is UNKNOWN for every row — the query returns nothing, with no error to explain why.",
          fix: "IS NULL / IS NOT NULL are the only missing-value tests.",
        },
        {
          mistake: "NOT IN against a list that might contain NULL",
          why: "One NULL in the list makes every NOT IN comparison UNKNOWN — the whole result silently empties.",
          fix: "Guarantee no NULLs, or use NOT EXISTS (the Part G pattern professionals prefer).",
        },
        {
          mistake: "Treating count(col) as 'number of rows'",
          why: "It counts non-NULL values of col — a different number whenever col carries NULLs.",
          fix: "count(*) for rows, count(col) deliberately, and say which you mean in code review.",
        },
      ],
      takeaways: [
        "NULL means unknown — not zero, not '', not false.",
        "= NULL never matches; IS NULL is the honest test.",
        "Unknown poisons logic: AND/OR/NOT with NULL yield unknown, which WHERE drops.",
        "COALESCE dresses missing values for display; aggregates skip NULLs (except count(*)).",
      ],
      quiz: [
        {
          id: "d-05-q1",
          prompt: "How many rows match WHERE phone = NULL on a table with 3 NULL phones?",
          options: [
            { text: "3 — the NULL phones match", correct: false, feedback: "NULL = NULL is UNKNOWN, not TRUE — the match never happens." },
            { text: "0 — the comparison is UNKNOWN for every row", correct: true, feedback: "Correct — and silently so, which is the trap." },
            { text: "An error is raised", correct: false, feedback: "It is legal SQL — it just quietly returns nothing." },
          ],
          explanation: "Comparisons with NULL yield UNKNOWN, and WHERE keeps only TRUE. IS NULL exists precisely for this.",
        },
        {
          id: "d-05-q2",
          prompt: "count(*) returns 20 and count(phone) returns 17 on the customers table. Why?",
          options: [
            { text: "Three rows are duplicates", correct: false, feedback: "count(*) counts rows regardless of duplication." },
            { text: "Three phones are NULL, and count(phone) skips NULLs", correct: true, feedback: "Correct — aggregates ignore NULL values; count(*) counts rows." },
            { text: "A bug in PostgreSQL", correct: false, feedback: "It is the documented, deliberate behavior of every SQL engine." },
          ],
          explanation: "count(col) counts non-NULL values; count(*) counts rows. The 3-row gap is your NULL census.",
        },
      ],
    },

    {
      slug: "d-06",
      title: "IDENTITY — letting PostgreSQL number your rows",
      minutes: 11,
      summary: "GENERATED ALWAYS AS IDENTITY hands out ids so two writers never collide — the modern auto-numbering.",
      kind: "coding",
      objectives: [
        "Declare an identity column",
        "Insert without supplying the id",
        "Explain why hand-numbering ids fails",
        "Recognize the older SERIAL pattern",
      ],
      why: "Primary keys need values, and humans are terrible at supplying them: two clerks number the next customer 101 simultaneously, and the second write bounces. Identity columns move the job into the engine — each insert receives the next number, atomically, no matter how many writers are running. Every serious table you will ever build uses this, and recognizing the older SERIAL in existing schemas is a professional survival skill.",
      blocks: [
        {
          kind: "text",
          text: "The declaration is one phrase; the effect is that the id column fills itself. Watch the INSERT statements below deliberately omit the id — and the rows arrive numbered anyway:",
        },
        {
          kind: "sql",
          title: "The self-numbering table",
          code: "DROP TABLE IF EXISTS visits CASCADE;\n\nCREATE TABLE visits (\n  visit_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  visitor    text NOT NULL,\n  came_on   date NOT NULL\n);\n\nINSERT INTO visits (visitor, came_on) VALUES\n  ('Ana Petrov', DATE '2026-11-10'),\n  ('Bo Okafor', DATE '2026-11-11'),\n  ('Cleo Fontaine', DATE '2026-11-13');\n\nSELECT visit_id, visitor, came_on FROM visits ORDER BY visit_id;",
          result: { columns: ["visit_id", "visitor", "came_on"], rows: [
        ["1", "Ana Petrov", "2026-11-10"],
        ["2", "Bo Okafor", "2026-11-11"],
        ["3", "Cleo Fontaine", "2026-11-13"],
      ] },
          explain: [
            "The INSERT lists only visitor and came_on; visit_id took 1, 2, 3 from the identity generator.",
            "GENERATED ALWAYS means exactly that — supplying an id yourself is refused (try it in the Lab!).",
          ],
        },
        {
          kind: "sql",
          title: "RETURNING receives the generated id",
          code: "INSERT INTO visits (visitor, came_on)\nVALUES ('Dana Whitmore', DATE '2026-11-14')\nRETURNING visit_id, visitor;",
          result: { columns: ["visit_id", "visitor"], rows: [
        ["4", "Dana Whitmore"],
      ] },
          explain: [
            "The application never guesses the id — RETURNING hands it back after the engine assigns it.",
            "This pairing (identity + RETURNING) is how every web application saves a row and learns its own id.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The ancestor: SERIAL",
          text: "Older schemas (you will read plenty) declare `visit_id serial PRIMARY KEY`. It achieves the same self-numbering through a default wired to a sequence. Read it confidently, write GENERATED ALWAYS AS IDENTITY in new tables — it is the SQL-standard, less footgun-y form.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Gaps are normal",
          text: "Identity numbers have gaps — a rolled-back transaction consumes its number, deletes leave holes. Identities exist to be unique, not gapless or ordered: never read meaning into their values (Part A's a-08 order ids made the same point).",
        },
        {
          kind: "lab",
          title: "Two clerks, no collision",
          task: "Blank schema: create the visits table, insert two visitors WITHOUT ids (one statement), then a third with RETURNING to catch its id. Then attempt an insert that supplies its own visit_id — read the refusal, then check the table shows exactly your three legal rows.",
          code: "DROP TABLE IF EXISTS visits CASCADE;\n\nCREATE TABLE visits (\n  visit_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  visitor    text NOT NULL,\n  came_on   date NOT NULL\n);\n\nINSERT INTO visits (visitor, came_on) VALUES\n  ('Ana Petrov', DATE '2026-11-10'),\n  ('Bo Okafor', DATE '2026-11-11');\n\nINSERT INTO visits (visitor, came_on)\nVALUES ('Cleo Fontaine', DATE '2026-11-13')\nRETURNING visit_id, visitor;\n\n-- YOUR MOVE (uncomment and run to see the refusal):\n-- INSERT INTO visits (visit_id, visitor, came_on) VALUES (99, 'Imposter', DATE '2026-11-14');\n\nSELECT visit_id, visitor FROM visits ORDER BY visit_id;",
          hint: "GENERATED ALWAYS refuses manual ids — the error is the feature.",
        },
      ],
      terms: [
        { term: "IDENTITY", definition: "A column the engine numbers automatically on insert — GENERATED ALWAYS AS IDENTITY." },
        { term: "Sequence", definition: "The server-side counter behind identity and serial columns." },
        { term: "SERIAL", definition: "The older auto-numbering idiom, built on a default from a sequence." },
      ],
      mistakes: [
        {
          mistake: "Hand-assigning ids in application code",
          why: "Concurrent writers pick the same 'next' number and collide; gaps and retries make it worse.",
          fix: "Identity columns assign atomically in the engine; applications receive ids via RETURNING.",
        },
        {
          mistake: "Assuming ids are gapless or chronological",
          why: "Rollbacks and deletes leave gaps; ids only promise uniqueness.",
          fix: "Order by a real timestamp or date column when time matters; ids are names, not clocks.",
        },
      ],
      takeaways: [
        "GENERATED ALWAYS AS IDENTITY numbers rows atomically — no writer collisions.",
        "Insert without the id; get it back with RETURNING.",
        "SERIAL is the legacy form — read it, do not write it.",
        "Ids promise uniqueness only — never gaps, never order.",
      ],
      quiz: [
        {
          id: "d-06-q1",
          prompt: "An INSERT omits the identity column. What happens?",
          options: [
            { text: "The insert fails: the column is NOT NULL", correct: false, feedback: "The generator supplies the value — the NOT NULL is satisfied automatically." },
            { text: "The engine assigns the next number and stores the row", correct: true, feedback: "Correct — that is the entire job of identity." },
            { text: "The column becomes NULL", correct: false, feedback: "A NULL identity would violate its primary key — the generator prevents that." },
          ],
          explanation: "Identity fills the column from its sequence; your INSERT simply does not mention it.",
        },
        {
          id: "d-06-q2",
          prompt: "visit_id values run 1, 2, 4. What is the honest conclusion?",
          options: [
            { text: "A row was deleted or a number was consumed without committing", correct: true, feedback: "Correct — gaps are normal and carry no scandal." },
            { text: "The sequence is broken", correct: false, feedback: "Sequences skip numbers by design under concurrency and rollbacks." },
            { text: "Row 3 was corrupted", correct: false, feedback: "Gaps say nothing about corruption — uniqueness is the only promise." },
          ],
          explanation: "Identity gaps come from deletes, rollbacks and concurrent grabs. Uniqueness is the contract; contiguity never was.",
        },
      ],
    },

    {
      slug: "d-07",
      title: "Practice: rescue the messy table",
      minutes: 15,
      summary: "A table full of realistic problems — duplicates, wrong formats, missing values — diagnosed and repaired with this part's toolkit.",
      kind: "coding",
      objectives: [
        "Diagnose data problems with SELECT before repairing with UPDATE",
        "Add constraints to lock a cleaned table",
        "Delete safely with receipts",
        "Work the diagnose-fix-verify loop",
      ],
      why: "Real jobs hand you messy data: a customer table pasted from three spreadsheets, with duplicate emails in different cases, phones in five formats, and prices that are sometimes text. This lesson is that day, on a small scale. You will diagnose each problem with a SELECT, repair it with UPDATE or DELETE, then bolt constraints on so the mess cannot return — the full write-side toolkit in one honest workflow.",
      blocks: [
        {
          kind: "text",
          text: "Meet the imported customer list — three sources merged badly. Every lab below works on this same table (the Lab re-seeds a blank schema per lesson, so run the setup first each time, or work in one continuous session):",
        },
        {
          kind: "lab",
          title: "The patient: build and inspect the mess",
          task: "Create the messy table and look at it whole. Read every row like a skeptic: what is wrong here? Make a written list before the next lab — diagnosing IS the skill.",
          code: "CREATE TABLE imported_customers (\n  customer_id int PRIMARY KEY,\n  name        text,\n  email       text,\n  price_tier  text,\n  active      text\n);\n\nINSERT INTO imported_customers (customer_id, name, email, price_tier, active) VALUES\n  (1, 'ana silva', 'ANA@Example.COM', 'gold', 'yes'),\n  (2, 'Ana Silva', 'ana@example.com', 'GOLD', '1'),\n  (3, 'bo trent', 'BO@Example.com', 'silver', 'no'),\n  (4, 'cleo ray', NULL, 'bronze', 'yes'),\n  (5, 'dana watt', 'dana@ ', 'gold', 'TRUE'),\n  (6, 'eli ford', 'eli@example.com', 'platinum', 'maybe');\n\nSELECT customer_id, name, email, price_tier, active\nFROM imported_customers\nORDER BY customer_id;",
          hint: "My list: same person twice with different case; an email that is just whitespace; a NULL email; tiers in mixed case plus an invalid 'platinum'; active as a three-way text mess.",
        },
        {
          kind: "lab",
          title: "Diagnosis 1 — the duplicate, found by evidence",
          task: "Before deleting anything, FIND the duplicate: same email in different cases. Fold the case away with lower(email) and count per folded email, keeping only counts above one. (The per-email count needs GROUP BY — Part E. For now, the starter's self-join shape does the same job: two rows whose folded emails match but whose ids differ.)",
          code: "SELECT a.customer_id AS id_a, b.customer_id AS id_b,\n       lower(a.email) AS shared_email\nFROM imported_customers a\nJOIN imported_customers b\n  ON lower(a.email) = lower(b.email)\n AND a.customer_id < b.customer_id;",
          hint: "The join compares the table to itself (aliases a and b) — the self-join from Part F's preview. id pair (1,2) is your duplicate.",
        },
        {
          kind: "lab",
          title: "Repair 1 — delete the duplicate, keep the better row",
          task: "Row 2 is the later duplicate import — delete exactly customer_id 2 with RETURNING, then re-read the table to confirm one Ana remains.",
          code: "DELETE FROM imported_customers\nWHERE customer_id = 2\nRETURNING customer_id, name;\n\nSELECT customer_id, name, email FROM imported_customers ORDER BY customer_id;",
          hint: "One WHERE equality on the primary key — the safest delete there is.",
        },
        {
          kind: "lab",
          title: "Repair 2 — normalize the text fields",
          task: "Two UPDATEs: (1) name and email in tidy case — initcap(name), lower(email); (2) the price_tier mess — map 'platinum' (an invalid tier from a bad import) to 'bronze', and lowercase everything, using a CASE inside the SET. Then re-read the table.",
          code: "UPDATE imported_customers\nSET name  = initcap(name),\n    email = lower(email);\n\nUPDATE imported_customers\nSET price_tier = CASE lower(price_tier)\n                    WHEN 'platinum' THEN 'bronze'\n                    ELSE lower(price_tier)\n                 END;\n\nSELECT customer_id, name, email, price_tier, active\nFROM imported_customers\nORDER BY customer_id;",
          hint: "UPDATE without WHERE is safe HERE because every row needs the fix — you chose that deliberately, after looking. CASE appears again in Part G; here it is a tidy value-mapping machine.",
        },
        {
          kind: "lab",
          title: "Repair 3 — the active flag, and the final guard rails",
          task: "Map the active mess ('yes'/'1'/'TRUE'/'no'/'maybe') to real text values: 'yes' and '1' and 'TRUE' become 'active', everything else 'inactive'. Then add the constraints that make the mess impossible to re-import: a CHECK on price_tier membership, and NOT NULL on name. Finish by reading the whole, rescued table.",
          code: "UPDATE imported_customers\nSET active = CASE WHEN active IN ('yes', '1', 'TRUE') THEN 'active'\n                 ELSE 'inactive' END;\n\nALTER TABLE imported_customers\n  ADD CONSTRAINT tier_check CHECK (price_tier IN ('bronze', 'silver', 'gold'));\n\nALTER TABLE imported_customers\n  ALTER COLUMN name SET NOT NULL;\n\nSELECT customer_id, name, email, price_tier, active\nFROM imported_customers\nORDER BY customer_id;",
          hint: "ALTER TABLE ... ADD CONSTRAINT retrofits rules to a table that already exists — the same constraints from d-03, added later. From now on, a 'platinum' import bounces at the door.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Data janitor, data doctor",
          text: "Cleaning data is 80% diagnosis. The SELECT-first habit is the stethoscope: look, list the problems, then prescribe one UPDATE or DELETE per ailment — and vaccinate the table with constraints when you are done.",
        },
      ],
      terms: [
        { term: "Data cleaning", definition: "Diagnosing and repairing broken data: duplicates, case chaos, invalid categories, missing values." },
        { term: "Normalization (of text)", definition: "Folding values into one canonical form — lower(email), initcap(name)." },
        { term: "Retrofit constraint", definition: "A rule added to an existing table with ALTER TABLE ... ADD CONSTRAINT." },
      ],
      mistakes: [
        {
          mistake: "Repairing before diagnosing",
          why: "UPDATEs written from impressions hit the wrong rows and miss the real ones.",
          fix: "Every repair begins as a SELECT that shows the exact problem rows.",
        },
        {
          mistake: "Cleaning once and walking away",
          why: "The next import re-delivers the same mess.",
          fix: "End every cleanup with constraints — the vaccination that keeps the table healthy.",
        },
      ],
      takeaways: [
        "Diagnose with SELECT, repair with UPDATE/DELETE, verify by re-reading.",
        "lower()/initcap() fold text chaos into canonical forms.",
        "CASE inside SET maps messy values to clean ones.",
        "ALTER TABLE retrofits constraints — the cleanup's last, lasting step.",
      ],
      quiz: [
        {
          id: "d-07-q1",
          prompt: "Why did the duplicate hunt fold emails with lower() before comparing?",
          options: [
            { text: "lower() is faster than comparing raw text", correct: false, feedback: "Speed is irrelevant here — case is the enemy." },
            { text: "'ANA@Example.COM' and 'ana@example.com' are the same person despite case", correct: true, feedback: "Correct — case-insensitive identity is the point of the fold." },
            { text: "Because emails must always be lowercase by law", correct: false, feedback: "Convention, not law — the fold is for matching, storage came after." },
          ],
          explanation: "Folding with lower() makes case-variant duplicates comparable — then you keep one and delete the other, with a receipt.",
        },
        {
          id: "d-07-q2",
          prompt: "What does ALTER TABLE ... ADD CONSTRAINT CHECK (price_tier IN ('bronze','silver','gold')) accomplish after the cleanup?",
          options: [
            { text: "It cleans the existing rows again", correct: false, feedback: "It enforces the future — existing rows were already repaired." },
            { text: "Future writes with any other tier are rejected", correct: true, feedback: "Correct — the mess cannot be re-imported." },
            { text: "It renames the price_tier column", correct: false, feedback: "Renaming is RENAME — this adds a rule." },
          ],
          explanation: "Constraints police every future INSERT and UPDATE — the cleanup's vaccine.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "d-b1",
      tier: "beginner",
      mode: "sql",
      title: "Update one product's stock",
      prompt: "ShopSphere restocks: product 1 (the AeroBook 14) receives 6 more units — its stock rises from 14 to 20. Write an UPDATE on the products table that adds 6 to the stock of product 1 (compute it as stock + 6, not a hard-coded 20), and make your final statement a SELECT of product_id, name and stock for product 1 so the grader sees the result. Expected columns: product_id, name, stock — one row, stock 20.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "UPDATE products SET stock = stock + 6 WHERE product_id = 1; then the SELECT. The grader re-seeds fresh data, so the starting stock is always 14.",
      starter: "-- update, then prove with a SELECT\n",
      solution: `UPDATE products
SET stock = stock + 6
WHERE product_id = 1;

SELECT product_id, name, stock
FROM products
WHERE product_id = 1;`,
      ordered: false,
      expected: { columns: ["product_id", "name", "stock"], rows: [
        ["1", "AeroBook 14 Laptop", "20"],
      ] },
      explanation:
        "The arithmetic form (stock + 6) matters: it works no matter what the starting stock is, while a hard-coded 20 breaks the day the shelf starts at 15. UPDATE with a primary-key WHERE touches exactly one row; the SELECT proves the change landed.",
      concepts: ["UPDATE", "arithmetic in SET", "safety ritual"],
    },
    {
      id: "d-b2",
      tier: "beginner",
      mode: "sql",
      title: "Delete the QA artifact",
      prompt: "This exercise runs on a blank schema. Create a table named bookings2 (booking_id int primary key, guest text not null, source text not null) and insert three rows: (1, 'Ana', 'homepage'), (2, 'Bo', 'referral'), (3, 'QA Test', 'qa'). The QA row is an artifact. Delete exactly the row with source 'qa' using RETURNING booking_id, guest as your final statement. Expected columns: booking_id, guest — one row: 3, QA Test.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "CREATE + INSERT (setup), then DELETE ... WHERE source = 'qa' RETURNING ...",
      starter: "-- build the table, insert three rows, then delete the qa row with RETURNING\n",
      solution: `CREATE TABLE bookings2 (
  booking_id int PRIMARY KEY,
  guest      text NOT NULL,
  source     text NOT NULL
);
INSERT INTO bookings2 (booking_id, guest, source) VALUES
  (1, 'Ana', 'homepage'),
  (2, 'Bo', 'referral'),
  (3, 'QA Test', 'qa');

DELETE FROM bookings2
WHERE source = 'qa'
RETURNING booking_id, guest;`,
      ordered: false,
      expected: { columns: ["booking_id", "guest"], rows: [
        ["3", "QA Test"],
      ] },
      explanation:
        "The RETURNING clause makes the deletion provable: the receipt shows exactly which row left. In real cleanup scripts this is the difference between 'I think it worked' and 'here is what I removed'.",
      concepts: ["DELETE", "RETURNING", "cleanup"],
    },
    {
      id: "d-b3",
      tier: "beginner",
      mode: "sql",
      title: "Find the missing phones",
      prompt: "List the customers who have no phone number on file: return customer_id, first_name and last_name for every customer whose phone is NULL, sorted by customer_id. Expected columns: customer_id, first_name, last_name — the three phone-less customers in id order.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "IS NULL — never = NULL.",
      starter: "SELECT customer_id, first_name, last_name\nFROM customers\n",
      solution: `SELECT customer_id, first_name, last_name
FROM customers
WHERE phone IS NULL
ORDER BY customer_id;`,
      ordered: true,
      expected: { columns: ["customer_id", "first_name", "last_name"], rows: [
        ["3", "Priya", "Sharma"],
        ["7", "Sofia", "Rossi"],
        ["12", "Victor", "Nguyen"],
        ["17", "Lucia", "Moreno"],
      ] },
      explanation:
        "IS NULL is the only honest test for absence — = NULL would return nothing, silently. Three customers (Priya, Sofia, Victor) never gave a phone; knowing exactly who they are is the first step of any contactability report.",
      concepts: ["IS NULL", "missing data"],
    },
    {
      id: "d-b4",
      tier: "beginner",
      mode: "sql",
      title: "Count rows vs count values",
      prompt: "On the customers table, show the difference between counting rows and counting values: return three columns in one row — all_customers (count of all rows), with_phone (count of non-NULL phone values) and missing_phone (the difference: rows minus non-NULL phones). Expected columns: all_customers, with_phone, missing_phone — one row.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "count(*) and count(phone) in one SELECT; subtract them for the third column.",
      starter: "SELECT count(*) AS all_customers,\n       -- with_phone and missing_phone here\nFROM customers;\n",
      solution: `SELECT count(*) AS all_customers,
       count(phone) AS with_phone,
       count(*) - count(phone) AS missing_phone
FROM customers;`,
      ordered: false,
      expected: { columns: ["all_customers", "with_phone", "missing_phone"], rows: [
        ["20", "16", "4"],
      ] },
      explanation:
        "count(*) counts rows; count(phone) skips NULLs — 20 versus 17, so exactly 3 phones are missing. That difference is your NULL census, computed with arithmetic instead of a WHERE IS NULL count.",
      concepts: ["count(*) vs count(col)", "NULL census"],
    },
    {
      id: "d-i1",
      tier: "intermediate",
      mode: "sql",
      title: "The sale campaign",
      prompt: "ShopSphere runs a flash sale: every product in category 5 (Gaming) gets 10 percent off — update price to price * 0.90 for those products only. Then prove it: your final statement selects product_id, name and price for the Gaming products after the discount, sorted by product_id. Expected columns: product_id, name, price — the discounted prices to two decimals.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "UPDATE with WHERE category_id = 5, then the SELECT. The grader re-seeds, so original prices always start fresh.",
      starter: "-- update the gaming prices, then select the proof\n",
      solution: `UPDATE products
SET price = round(price * 0.90, 2)
WHERE category_id = 5;

SELECT product_id, name, price
FROM products
WHERE category_id = 5
ORDER BY product_id;`,
      ordered: true,
      expected: { columns: ["product_id", "name", "price"], rows: [
        ["17", "GameStation 5 Console", "494.10"],
        ["18", "ProPad Elite Controller", "62.10"],
        ["19", "RacingWheel GT Set", "269.10"],
      ] },
      explanation:
        "round(price * 0.90, 2) keeps money exact — a numeric times a decimal stays numeric, and rounding to cents matches how prices display. The WHERE scopes the campaign precisely; the SELECT proves the new prices to anyone who asks.",
      concepts: ["UPDATE", "money math", "round"],
    },
    {
      id: "d-i2",
      tier: "intermediate",
      mode: "sql",
      title: "COALESCE the contact report",
      prompt: "A contact report must never show blank cells: for every customer, return customer_id, first_name, last_name and a contact column built as COALESCE(phone, 'no phone') — the phone when present, the stand-in text otherwise — for customers in Chicago, sorted by customer_id. Expected columns: customer_id, first_name, last_name, contact.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "COALESCE(phone, 'no phone') — display dressing, storage untouched.",
      starter: "SELECT customer_id, first_name, last_name,\n       -- contact here\nFROM customers\n",
      solution: `SELECT customer_id, first_name, last_name,
       COALESCE(phone, 'no phone') AS contact
FROM customers
WHERE city = 'Chicago'
ORDER BY customer_id;`,
      ordered: true,
      expected: { columns: ["customer_id", "first_name", "last_name", "contact"], rows: [
        ["5", "Hannah", "Kowalski", "+1-312-555-0110"],
        ["13", "Elena", "Petrova", "+1-312-555-0171"],
      ] },
      explanation:
        "COALESCE substitutes at display time only — the table still holds NULL. Chicago's two customers split exactly one apiece: Elena shows her phone, Hannah shows the stand-in. Reports built this way never render empty cells.",
      concepts: ["COALESCE", "display-time substitution"],
    },
    {
      id: "d-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Constraint violations, one of each",
      prompt: "This exercise runs on a blank schema. Create a table named clubs (club_id int primary key, name text not null unique, max_members int not null check (max_members between 4 and 40), founded date not null). Insert one legal club: (1, 'Hiking Club', 20, DATE '2019-04-01'). Then attempt a SECOND insert that violates the CHECK constraint: (2, 'Chess Club', 99, DATE '2020-01-01') — but because a failing statement ends the run, your SOLUTION must not include it. Instead: your final statement is a SELECT of club_id, name, max_members FROM clubs (proving only the legal club exists), and the ATTEMPT of the bad insert is for you to try afterwards in the Lab. Expected final output: columns club_id, name, max_members with exactly one row: 1, Hiking Club, 20.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "The bad insert is your private experiment; the solution builds, inserts legally, and proves the state with a SELECT.",
      starter: "CREATE TABLE clubs (\n  club_id     int PRIMARY KEY,\n  name        text NOT NULL UNIQUE,\n  max_members int NOT NULL CHECK (max_members BETWEEN 4 AND 40),\n  founded     date NOT NULL\n);\n\n-- legal insert, then the proving SELECT\n",
      solution: `CREATE TABLE clubs (
  club_id     int PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  max_members int NOT NULL CHECK (max_members BETWEEN 4 AND 40),
  founded     date NOT NULL
);
INSERT INTO clubs (club_id, name, max_members, founded)
VALUES (1, 'Hiking Club', 20, DATE '2019-04-01');

SELECT club_id, name, max_members
FROM clubs;`,
      ordered: false,
      expected: { columns: ["club_id", "name", "max_members"], rows: [
        ["1", "Hiking Club", "20"],
      ] },
      explanation:
        "The table enforces a real club rule: sizes between 4 and 40 members. An insert of 99 would be refused with a check-constraint violation — try it in the Lab and read the error. The solution proves the surviving state: exactly the one legal club.",
      concepts: ["CHECK", "constraint enforcement", "prove with SELECT"],
    },
    {
      id: "d-i4",
      tier: "intermediate",
      mode: "sql",
      title: "Cancel the pending orders",
      prompt: "Two ShopSphere orders are stuck pending payment. Management cancels them: UPDATE the status of every order whose status is 'pending' to 'cancelled', using UPDATE ... RETURNING order_id, status AS new_status as the receipt (that RETURNING statement can be your final statement). Expected columns: order_id, new_status — two rows, both cancelled.",
      dataset: "ecommerce",
      sampleTables: ["orders"],
      hint: "UPDATE orders SET status = 'cancelled' WHERE status = 'pending' RETURNING order_id, status AS new_status;",
      starter: "-- one UPDATE with RETURNING does everything\n",
      solution: `UPDATE orders
SET status = 'cancelled'
WHERE status = 'pending'
RETURNING order_id, status AS new_status;`,
      ordered: false,
      expected: { columns: ["order_id", "new_status"], rows: [
        ["49", "cancelled"],
        ["50", "cancelled"],
      ] },
      explanation:
        "One statement selects the victims (WHERE status = 'pending'), changes them, and receipts the result — orders 49 and 50, now cancelled. This is the professional shape of every status-transition write: condition, change, proof.",
      concepts: ["UPDATE", "RETURNING", "status transitions"],
    },
    {
      id: "d-a1",
      tier: "advanced",
      mode: "sql",
      title: "Identity and RETURNING, end to end",
      prompt: "This exercise runs on a blank schema. Create a table named arrivals (arrival_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ship text not null, arrived date not null). Insert three ships WITHOUT supplying ids in one multi-row statement: ('Atlas', DATE '2026-11-01'), ('Boreas', DATE '2026-11-05'), ('Calypso', DATE '2026-11-09') — then a fourth ('Diana', DATE '2026-11-12') with RETURNING arrival_id, ship. Finally SELECT arrival_id, ship, arrived FROM arrivals ORDER BY arrival_id as your last statement. Expected columns: arrival_id, ship, arrived — four rows, ids 1 to 4.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "The INSERT lists only (ship, arrived); the identity column numbers itself.",
      starter: "CREATE TABLE arrivals (\n  arrival_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  ship       text NOT NULL,\n  arrived    date NOT NULL\n);\n\n-- three ships in one statement, the fourth with RETURNING, then the SELECT\n",
      solution: `CREATE TABLE arrivals (
  arrival_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ship       text NOT NULL,
  arrived    date NOT NULL
);
INSERT INTO arrivals (ship, arrived) VALUES
  ('Atlas', DATE '2026-11-01'),
  ('Boreas', DATE '2026-11-05'),
  ('Calypso', DATE '2026-11-09');
INSERT INTO arrivals (ship, arrived)
VALUES ('Diana', DATE '2026-11-12')
RETURNING arrival_id, ship;
SELECT arrival_id, ship, arrived
FROM arrivals
ORDER BY arrival_id;`,
      ordered: true,
      expected: { columns: ["arrival_id", "ship", "arrived"], rows: [
        ["1", "Atlas", "2026-11-01"],
        ["2", "Boreas", "2026-11-05"],
        ["3", "Calypso", "2026-11-09"],
        ["4", "Diana", "2026-11-12"],
      ] },
      explanation:
        "The identity column numbered all four arrivals by itself; RETURNING handed back Diana's id (4) the moment the engine assigned it. This create-insert-return-select chain is the exact shape applications use to save rows and learn their primary keys.",
      concepts: ["IDENTITY", "RETURNING", "insert patterns"],
    },
    {
      id: "d-a2",
      tier: "advanced",
      mode: "sql",
      title: "The cascade, observed",
      prompt: "This exercise runs on a blank schema. Build the parent-child pair: playlists (playlist_id int primary key, name text not null) and tracks2 (track_id int primary key, playlist_id int not null references playlists(playlist_id) on delete cascade, title text not null). Insert playlists (1, 'Road Trip'), (2, 'Focus'); tracks (10, 1, 'Highway Song'), (11, 1, 'Dust Devil'), (12, 2, 'Deep Work'). Then DELETE playlist 1 — the cascade — and make your final statement SELECT track_id, playlist_id, title FROM tracks2 ORDER BY track_id (the surviving tracks). Expected columns: track_id, playlist_id, title — exactly one row: track 12 on playlist 2. The deleted playlist's two tracks vanish with it.",
      dataset: "ecommerce",
      sampleTables: ["orders", "order_items"],
      hint: "The children table's foreign key carries ON DELETE CASCADE — that clause does the vanishing.",
      starter: "-- parents, children (with ON DELETE CASCADE), data, the cascade delete, the proof\n",
      solution: `CREATE TABLE playlists (
  playlist_id int PRIMARY KEY,
  name        text NOT NULL
);
CREATE TABLE tracks2 (
  track_id    int PRIMARY KEY,
  playlist_id int NOT NULL REFERENCES playlists(playlist_id) ON DELETE CASCADE,
  title       text NOT NULL
);
INSERT INTO playlists (playlist_id, name) VALUES (1, 'Road Trip'), (2, 'Focus');
INSERT INTO tracks2 (track_id, playlist_id, title) VALUES
  (10, 1, 'Highway Song'),
  (11, 1, 'Dust Devil'),
  (12, 2, 'Deep Work');
DELETE FROM playlists WHERE playlist_id = 1;
SELECT track_id, playlist_id, title
FROM tracks2
ORDER BY track_id;`,
      ordered: true,
      expected: { columns: ["track_id", "playlist_id", "title"], rows: [
        ["12", "2", "Deep Work"],
      ] },
      explanation:
        "The single DELETE on playlists touched one parent row — and the cascade removed both of its tracks automatically, exactly as the foreign key declared. Track 12, belonging to the surviving playlist, is untouched. The same mechanism powers ShopSphere's order_items (deleting an order takes its line items).",
      concepts: ["ON DELETE CASCADE", "foreign keys", "referential integrity"],
    },
    {
      id: "d-a3",
      tier: "advanced",
      mode: "sql",
      title: "The three-valued logic exam",
      prompt: "NULL behaves by rules, not vibes — prove them with data. This exercise runs on a blank schema. Create a table named truth_tests (test_id int primary key, a_text text, b_text text) and insert exactly: (1, 'left', 'right'), (2, NULL, 'right'), (3, 'left', NULL). Now the exam, as ONE final SELECT with five columns in one row: both_present (count of rows where a_text IS NOT NULL AND b_text IS NOT NULL), either_missing (count where a_text IS NULL OR b_text IS NULL), eq_null_rows (count where a_text = NULL), notnull_or_count (count where NOT (a_text IS NULL) OR b_text = 'right'), coalesced_count (count where COALESCE(a_text, b_text) = 'right'). Expected columns: both_present, either_missing, eq_null_rows, notnull_or_count, coalesced_count — one row.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "Think each count through BEFORE running: row 1 has both; rows 2 and 3 miss one each; a_text = NULL matches nothing anywhere; NOT(a IS NULL) is TRUE only for row 1 and 3 — OR b_text='right' adds row 2; COALESCE(a,b) is 'right' for rows 2 and 3.",
      starter: "CREATE TABLE truth_tests (\n  test_id int PRIMARY KEY,\n  a_text  text,\n  b_text  text\n);\n\nINSERT INTO truth_tests (test_id, a_text, b_text) VALUES\n  (1, 'left', 'right'),\n  (2, NULL, 'right'),\n  (3, 'left', NULL);\n\n-- the five counts in one SELECT\n",
      solution: `CREATE TABLE truth_tests (
  test_id int PRIMARY KEY,
  a_text  text,
  b_text  text
);
INSERT INTO truth_tests (test_id, a_text, b_text) VALUES
  (1, 'left', 'right'),
  (2, NULL, 'right'),
  (3, 'left', NULL);
SELECT count(*) FILTER (WHERE a_text IS NOT NULL AND b_text IS NOT NULL) AS both_present,
       count(*) FILTER (WHERE a_text IS NULL OR b_text IS NULL) AS either_missing,
       count(*) FILTER (WHERE a_text = NULL) AS eq_null_rows,
       count(*) FILTER (WHERE NOT (a_text IS NULL) OR b_text = 'right') AS notnull_or_count,
       count(*) FILTER (WHERE COALESCE(a_text, b_text) = 'right') AS coalesced_count
FROM truth_tests;`,
      ordered: false,
      expected: { columns: ["both_present", "either_missing", "eq_null_rows", "notnull_or_count", "coalesced_count"], rows: [
        ["1", "2", "0", "3", "1"],
      ] },
      explanation:
        "The answers: both_present 1 (row 1), either_missing 2 (rows 2 and 3), eq_null_rows 0 (comparisons with NULL are UNKNOWN — matched by nothing), notnull_or_count 3 (rows 1 and 3 pass the NOT test; row 2 passes via b_text='right'), coalesced_count 2 (COALESCE returns 'right' for rows 2 and 3). If any of these surprised you, re-read lesson d-05's logic table — this exercise IS that lesson, made permanent.",
      concepts: ["three-valued logic", "IS NULL", "COALESCE", "FILTER"],
    },
    {
      id: "d-a4",
      tier: "advanced",
      mode: "sql",
      title: "Clean and vaccinate a real mess",
      prompt: "This exercise runs on a blank schema. Create table messy_scores (student_id int primary key, name text not null, score text) and insert: (1, 'Ana', '90'), (2, 'Bo', 'seventy'), (3, 'Cleo', '85'), (4, 'Dana', ''), (5, 'Eli', '75'). Clean it: (1) an UPDATE that maps the score text to a new column is impossible without ALTER — instead UPDATE score itself: set score = 'unknown' where score = '' and set score = 'unknown' where score = 'seventy' (two updates or one with OR). Then (2) ALTER the table to add a CHECK constraint requiring score to be either a two-digit number string or 'unknown' is too fancy — simpler: add a NOT NULL on name (already there) and a CHECK that score IN ('unknown') OR (score ~ '^[0-9]+$') using a regular expression. Finally SELECT student_id, name, score FROM messy_scores ORDER BY student_id. Expected columns: student_id, name, score — five rows with the two bad scores replaced by 'unknown'.",
      dataset: "university",
      sampleTables: ["students"],
      hint: "One UPDATE with OR handles both bad values; the regex CHECK (~ '^[0-9]+$') allows digit strings or the word unknown.",
      starter: "CREATE TABLE messy_scores (\n  student_id int PRIMARY KEY,\n  name       text NOT NULL,\n  score      text\n);\n\nINSERT INTO messy_scores (student_id, name, score) VALUES\n  (1, 'Ana', '90'),\n  (2, 'Bo', 'seventy'),\n  (3, 'Cleo', '85'),\n  (4, 'Dana', ''),\n  (5, 'Eli', '75');\n\n-- fix, vaccinate, prove\n",
      solution: `CREATE TABLE messy_scores (
  student_id int PRIMARY KEY,
  name       text NOT NULL,
  score      text
);
INSERT INTO messy_scores (student_id, name, score) VALUES
  (1, 'Ana', '90'),
  (2, 'Bo', 'seventy'),
  (3, 'Cleo', '85'),
  (4, 'Dana', ''),
  (5, 'Eli', '75');
UPDATE messy_scores
SET score = 'unknown'
WHERE score IN ('', 'seventy');
ALTER TABLE messy_scores
  ADD CONSTRAINT score_shape CHECK (score = 'unknown' OR score ~ '^[0-9]+$');
SELECT student_id, name, score
FROM messy_scores
ORDER BY student_id;`,
      ordered: true,
      expected: { columns: ["student_id", "name", "score"], rows: [
        ["1", "Ana", "90"],
        ["2", "Bo", "unknown"],
        ["3", "Cleo", "85"],
        ["4", "Dana", "unknown"],
        ["5", "Eli", "75"],
      ] },
      explanation:
        "The UPDATE replaces the two bad values in one WHERE; the ALTER vaccinates the table — any future 'seventy' import now bounces off the regex CHECK (digit strings or the word unknown only). The final SELECT shows the rescued roster. This diagnose-repair-vaccinate loop is the d-07 workflow compressed into an exercise.",
      concepts: ["UPDATE", "ALTER TABLE", "CHECK with regex", "data cleaning"],
    },
  ],

  assessment: [
    {
      id: "d-as-1",
      prompt: "What does UPDATE without a WHERE clause do?",
      options: [
        { text: "Fails with a syntax error", correct: false, feedback: "It is legal — that is the danger." },
        { text: "Updates every row in the table", correct: true, feedback: "Correct — the whole table takes the SET." },
        { text: "Updates only the first row", correct: false, feedback: "No such rule exists; no WHERE means all rows." },
      ],
      explanation: "WHERE-less UPDATE rewrites every row — hence the SELECT-the-victims ritual.",
    },
    {
      id: "d-as-2",
      prompt: "Which statement removes only rows WHERE verified = false, with a receipt?",
      options: [
        { text: "DELETE FROM t WHERE verified = false RETURNING *;", correct: true, feedback: "Correct — precise WHERE plus the RETURNING receipt." },
        { text: "TRUNCATE t WHERE verified = false;", correct: false, feedback: "TRUNCATE accepts no WHERE at all." },
        { text: "DELETE verified = false FROM t;", correct: false, feedback: "Inverted syntax; conditions live in WHERE." },
      ],
      explanation: "DELETE + WHERE + RETURNING is the professional deletion shape.",
    },
    {
      id: "d-as-3",
      prompt: "An INSERT violates a CHECK constraint. What is stored?",
      options: [
        { text: "The row with the offending value changed", correct: false, feedback: "The engine refuses; it never invents replacements." },
        { text: "Nothing — the whole statement is rejected atomically", correct: true, feedback: "Correct — refused at the door, nothing half-landed." },
        { text: "The row, flagged for review", correct: false, feedback: "There is no flagging tier; constraints are hard refusals." },
      ],
      explanation: "Statements are atomic: a constraint violation aborts the entire INSERT.",
    },
    {
      id: "d-as-4",
      prompt: "Which type must money always use?",
      options: [
        { text: "numeric — exact decimals, cents never drift", correct: true, feedback: "Correct — the one unbreakable money rule." },
        { text: "double precision — fastest math", correct: false, feedback: "Binary floats cannot represent 0.1 exactly; sums drift." },
        { text: "text — maximum flexibility", correct: false, feedback: "Text money cannot be summed safely or validated at all." },
      ],
      explanation: "numeric stores exact decimal digits; floats approximate and drift — reconciliation eventually fails.",
    },
    {
      id: "d-as-5",
      prompt: "WHERE phone = NULL returns zero rows even when phones are missing. Why?",
      options: [
        { text: "NULL cannot be compared, so the result is UNKNOWN — and WHERE keeps only TRUE", correct: true, feedback: "Correct — three-valued logic in action." },
        { text: "The column is indexed incorrectly", correct: false, feedback: "Indexes are irrelevant; the logic itself yields unknown." },
        { text: "NULL rows are always hidden", correct: false, feedback: "IS NULL finds them happily — only the = comparison is doomed." },
      ],
      explanation: "Any comparison touching NULL yields UNKNOWN, which WHERE treats as false. IS NULL is the honest test.",
    },
    {
      id: "d-as-6",
      prompt: "COALESCE(phone, 'no phone') does what?",
      options: [
        { text: "Replaces NULL phones with the stand-in text, at display time only", correct: true, feedback: "Correct — output dressing; storage untouched." },
        { text: "Updates the stored phone values", correct: false, feedback: "COALESCE never writes — it is a SELECT-list function." },
        { text: "Deletes rows without phones", correct: false, feedback: "It keeps rows and dresses their missing cells." },
      ],
      explanation: "COALESCE returns its first non-NULL argument — a display-time stand-in, leaving the table exactly as it was.",
    },
    {
      id: "d-as-7",
      prompt: "A column declared GENERATED ALWAYS AS IDENTITY means...",
      options: [
        { text: "The engine numbers it on insert; supplying your own value is refused", correct: true, feedback: "Correct — always generated, never hand-written." },
        { text: "The column recomputes from other columns automatically", correct: false, feedback: "That is a generated COLUMN — a different feature." },
        { text: "The values restart at 1 every day", correct: false, feedback: "Sequences only grow; they never reset on a schedule." },
      ],
      explanation: "IDENTITY hands out the next number atomically; 'ALWAYS' means manual values bounce with an error.",
    },
    {
      id: "d-as-8",
      prompt: "tickets references guests with ON DELETE CASCADE. Deleting a guest with tickets will...",
      options: [
        { text: "Delete their tickets too", correct: true, feedback: "Correct — the cascade sweeps the children along." },
        { text: "Be refused until the tickets go first", correct: false, feedback: "That is the default RESTRICT behavior; CASCADE is the declared alternative." },
        { text: "Set the tickets' guest_id to NULL", correct: false, feedback: "That is ON DELETE SET NULL — a different declaration." },
      ],
      explanation: "CASCADE, refuse, or set NULL — the designer chooses, the engine remembers, the demo in d-03 proved it.",
    },
  ],

  project: {
    title: "The Data Repair Kit",
    brief:
      "You are handed a deliberately damaged table and a mandate: 'make it clean, and make it stay clean.' Working on the blank Lab schema, you will create and load a realistic damaged dataset — duplicate customers, inconsistent casing, mixed-format phone numbers, an impossible date or two, and a status column speaking three dialects — then run the full Part D workflow: diagnose every problem with SELECT, repair each with a targeted UPDATE or a safe DELETE, and finish by bolting on the constraints (CHECK, NOT NULL, UNIQUE) that make re-importing the mess impossible. The deliverable is one runnable SQL script: setup, diagnosis comments, repairs, vaccinations, and a final clean readout.",
    requirements: [
      "A setup section creating and loading a table with at least eight rows exhibiting at least four DIFFERENT kinds of data problems (documented in comments)",
      "At least one diagnosis SELECT per problem, committed as a comment plus query",
      "At least three UPDATE repairs, including one arithmetic (stock + n, price * x) and one CASE-based value mapping",
      "At least one DELETE with a WHERE precise enough to spare innocent rows, plus its RETURNING receipt",
      "At least two constraints added at the end (a CHECK and a NOT NULL or UNIQUE) with a comment on the mess each prevents",
      "A final SELECT proving the table is clean, plus one deliberate constraint-violation attempt (in a comment, marked 'run me separately')",
    ],
    steps: [
      "Design the damage: list the four-plus problems before writing a single row — the mess should be realistic (think: three merged spreadsheets).",
      "Write the setup: CREATE TABLE with sensible types (money as numeric, dates as date) — damage lives in the VALUES, not the types.",
      "Diagnose one problem at a time: a SELECT that shows exactly the offending rows. If you cannot isolate them, you cannot fix them.",
      "Repair with the smallest UPDATE/DELETE that does the job — WHERE first, receipt attached.",
      "Re-read the table after each repair; never stack changes on unverified assumptions.",
      "Vaccinate: add the constraints, each with a one-line comment naming the disease it prevents.",
      "Run the whole script from a fresh schema once, top to bottom — a repair kit must work cold.",
    ],
    starter: `-- The Data Repair Kit (Part D mini project)
-- SETUP: the damaged table
-- CREATE TABLE ??? (...);
-- INSERT ... (8+ rows, 4+ kinds of damage, documented below)
-- DAMAGE MANIFEST:
--   1. ??? (e.g. duplicate customer, case-variant)
--   2. ???
--   3. ???
--   4. ???

-- DIAGNOSIS: one SELECT per problem
-- D1: ???
-- REPAIR: UPDATE/DELETE + RETURNING
-- R1: ???

-- (repeat per problem)

-- VACCINATIONS
-- V1: ALTER TABLE ??? ADD CONSTRAINT ??? CHECK (...)  -- prevents: ???
-- V2: ???

-- PROOF
-- SELECT ... FROM ??? ORDER BY ???;

-- RUN ME SEPARATELY (should bounce off the constraint):
-- INSERT/UPDATE that violates V1 or V2`,
    concepts: ["UPDATE", "DELETE", "constraints", "data cleaning", "safety rituals"],
    extension:
      "Add a CHECK with a regular expression (like d-a4's digit-string rule) that enforces a format rule of your choice — phone digits only, emails containing one @, or codes matching a pattern. Regex CHECKs are the tightest vaccination PostgreSQL offers.",
  },
};
