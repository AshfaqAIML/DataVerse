/**
 * Part J — Professional PostgreSQL.
 *
 * Read query plans with EXPLAIN ANALYZE, make work atomic with transactions, normalize schemas to 1NF/2NF/3NF, design a database from requirements, and level up with UPSERT, MERGE, JSON, arrays and set-operation mastery.
 * Every verified output comes from the compute/verify pipeline.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_J: Part = {
  letter: "J",
  title: "Professional PostgreSQL",
  tagline: "Optimization, transactions, normalization, database design and advanced SQL.",
  description:
    "Read query plans with EXPLAIN ANALYZE, make work atomic with transactions, normalize schemas to 1NF/2NF/3NF, design a database from requirements, and level up with UPSERT, MERGE, JSON, arrays and set-operation mastery.",
  lessons: [

  // j-01, j-02, j-03 — three complete Lesson objects

  {
    slug: "j-01",
    title: "Query optimization — reading the plan",
    minutes: 15,
    summary:
      "Every query becomes a plan — a recipe of scans, sorts and joins. Learn to read it with EXPLAIN and a pinned-down EXPLAIN ANALYZE: cost, rows, width, finding the expensive node, and the classic ways queries get slow.",
    kind: "coding",
    objectives: [
      "Explain what a query plan is and why the planner compiles one before a single row moves",
      "Read an EXPLAIN plan: nodes, cost (startup..total), estimated rows and width",
      "Run EXPLAIN ANALYZE with TIMING OFF, SUMMARY OFF and BUFFERS OFF — and say why each option is pinned off",
      "Spot the classic plan-killers: SELECT *, leading-wildcard LIKE, and functions wrapped around indexed columns",
    ],
    why: "You wrote a query and it works — on the laptop, on ten thousand rows, in under a second. Then production ships it against two million rows and the dashboard grinds. Nothing in the SQL is wrong; the way PostgreSQL executes it is. Every query gets compiled into a plan — a recipe of scans, sorts and joins — and reading that plan is the difference between guessing why something is slow and knowing. This lesson gives you the one skill every tuning conversation starts with: EXPLAIN, the numbers it prints, and the discipline of measuring before touching anything.",
    blocks: [
      {
        kind: "text",
        text: "Every query you have written in this course ended the same way: PostgreSQL thought for a moment, then returned rows. That *thinking* is the subject of this lesson. Before a single row moves, the **planner** compiles your SQL into a **query plan** — a recipe of steps, each step a *node*: scan this table, sort those rows, join these two. `EXPLAIN` shows you the recipe; `EXPLAIN ANALYZE` also cooks it and reports what really happened. To have something worth measuring, you first need data big enough to matter, so we build a 20,000-row transaction table from pure arithmetic — no dataset, no randomness, every run identical.",
      },
      {
        kind: "sql",
        title: "A 20,000-row playground from pure arithmetic",
        code: `CREATE TABLE big_transactions (
  txn_id      INT PRIMARY KEY,
  account_id  INT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  occurred_at TIMESTAMP NOT NULL
);
INSERT INTO big_transactions
SELECT g,
       1 + (g % 50),
       ((g % 900) + 1)::numeric + 0.99,
       'txn-' || lpad(g::text, 6, '0'),
       TIMESTAMP '2026-01-01' + (g % 360) * INTERVAL '1 day'
FROM generate_series(1, 20000) AS g;
ANALYZE big_transactions;
CREATE TABLE accounts_dim (
  account_id INT PRIMARY KEY,
  tier       TEXT NOT NULL,
  city       TEXT NOT NULL
);
INSERT INTO accounts_dim
SELECT g, CASE WHEN g = 50 THEN 'gold' ELSE 'basic' END, 'Springfield'
FROM generate_series(1, 50) AS g;
ANALYZE accounts_dim;`,
        result: { columns: [], rows: [], command: "ANALYZE" },
        explain: [
          "`generate_series(1, 20000)` fabricates the rows with arithmetic only: account_id cycles 1 through 50, amounts run a fixed pattern from 1.99 to 900.99, and descriptions are txn-000001 to txn-020000 — no randomness anywhere, so every run of this lesson builds identical data.",
          "occurred_at advances one day per row from `TIMESTAMP '2026-01-01'` — pinned dates, the same determinism doctrine this course uses everywhere.",
          "`ANALYZE` (the command, not EXPLAIN ANALYZE) samples the fresh table and updates the planner's statistics. Without it the planner would be guessing; with it, the estimates you are about to see are grounded in the real data.",
          "accounts_dim adds a small 50-row lookup table — the classic big-fact-table-plus-tiny-dimension shape — so the playground feels like a real schema.",
        ],
      },
      { kind: "heading", text: "EXPLAIN — the recipe, not the meal" },
      {
        kind: "sql",
        title: "The plan for SELECT *: one Seq Scan, three numbers",
        code: `EXPLAIN SELECT * FROM big_transactions WHERE account_id = 7;`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Seq Scan on big_transactions  (cost=0.00..417.00 rows=400 width=34)"],
        ["  Filter: (account_id = 7)"],
      ] },
        explain: [
          "One node: a **Seq Scan** — read every row of big_transactions top to bottom, keep the ones where account_id = 7. With no index on account_id there is no alternative, and PostgreSQL says so plainly.",
          "`cost=0.00..417.00` is startup cost .. total cost in the planner's internal units, where one sequential page read costs 1.0. It is a price tag for comparing strategies — not milliseconds, not seconds.",
          "`rows=400` is the planner's estimate of how many rows survive the filter, computed from the statistics ANALYZE just gathered; `width=34` is the estimated average bytes per row this node emits — five columns, all of them carried.",
          "The Filter line is your WHERE clause, applied row by row as the scan passes through. Nothing ran yet — EXPLAIN is the recipe, not the meal.",
        ],
      },
      {
        kind: "sql",
        title: "Same query, two columns: watch the width",
        code: `EXPLAIN SELECT txn_id, amount FROM big_transactions WHERE account_id = 7;`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Seq Scan on big_transactions  (cost=0.00..417.00 rows=400 width=11)"],
        ["  Filter: (account_id = 7)"],
      ] },
        explain: [
          "Same scan, same 400-row estimate — but width drops from 34 to 11. By naming only txn_id and amount, the node no longer carries description, occurred_at and account_id bytes for every row.",
          "That is the entire argument against `SELECT *`: width is not decoration. In plans with sorts and joins, cost grows with row width — bytes you never asked for get lugged through every stage.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "SELECT * is a width bomb",
        text: "Name your columns: SELECT * forces every node in the plan to carry bytes you never asked for — width 34 became 11 the moment we listed two columns, and in a plan with sorts and joins that width multiplies.",
      },
      {
        kind: "table",
        title: "The node zoo — the ones you will meet first",
        headers: ["Node", "What it does", "You will see it when…"],
        rows: [
          ["Seq Scan", "Reads every row of the table, in physical order, applying filters as it goes", "No index helps, or a large share of rows match"],
          ["Index Scan", "Seeks down a B-tree index to matching entries, then fetches those rows", "Few rows match and an index exists on the filtered column"],
          ["Sort", "Orders rows in memory (spilling to disk if large)", "ORDER BY or DISTINCT with no index that already provides the order"],
          ["Hash Join", "Builds a hash table from the smaller input, probes it with the other", "Equality joins on larger inputs"],
          ["Nested Loop", "For each row on one side, looks up matches on the other via an index", "Small outer side, indexed inner side"],
          ["Aggregate", "Collapses rows into totals — count, sum, averages", "count(*) or GROUP BY — usually sitting near the top of the plan"],
        ],
        caption: "Plans are printed parent-first but executed innermost-first — read the deepest indentation first.",
      },
      { kind: "heading", text: "EXPLAIN ANALYZE — measure, don't guess" },
      {
        kind: "text",
        text: "`EXPLAIN` only plans the query. Add `ANALYZE` and PostgreSQL *executes it for real*, printing the actual row counts next to every estimate — the difference between a forecast and a receipt. The catch: the full version also prints per-node timings and buffer counts, and those digits wobble from run to run on the same machine with the same data — machine load, cache warmth, weather (almost). This course runs every plan with the noise pinned off: `TIMING OFF, SUMMARY OFF, BUFFERS OFF`. It is the same doctrine that pins every date to `DATE '2026-11-14'`: determinism first, so what you see is what every learner sees.",
      },
      {
        kind: "table",
        title: "Why each option is pinned off",
        headers: ["Option", "What it hides", "Why we pin it off"],
        rows: [
          ["TIMING OFF", "Per-node milliseconds", "They jitter with machine load — same query, different digits every run"],
          ["SUMMARY OFF", "The planning-time / execution-time footer", "The footer's timings vary run to run and add nothing to the reading"],
          ["BUFFERS OFF", "Cache hit counts (shared hits vs reads)", "They depend on what happens to be in memory from earlier queries"],
        ],
        caption: "What survives — costs, row estimates, actual rows, loops — is deterministic.",
      },
      {
        kind: "sql",
        title: "The plan with actuals: estimate meets reality",
        code: `EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT count(*) FROM big_transactions WHERE account_id = 7;`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Aggregate  (cost=418.00..418.01 rows=1 width=8) (actual rows=1.00 loops=1)"],
        ["  ->  Seq Scan on big_transactions  (cost=0.00..417.00 rows=400 width=0) (actual rows=400.00 loops=1)"],
        ["        Filter: (account_id = 7)"],
        ["        Rows Removed by Filter: 19600"],
      ] },
        explain: [
          "EXPLAIN ANALYZE really ran the query. Two nodes now: the Seq Scan from before, feeding an **Aggregate** that does the count(*). Read plans innermost-first: scan, then aggregate.",
          "Next to each estimate sits the actual: `(actual rows=400.00 loops=1)` beside `rows=400`. The planner's forecast was exact, because ANALYZE gave it honest statistics.",
          "`Rows Removed by Filter: 19600` is the confession line: the scan read all 20,000 rows and discarded 19,600 — 98% of the work was thrown away. At this scale that is fine; at 20 million rows it is a query you can hear.",
          "Finding the expensive node is arithmetic, not intuition: the scan costs 417.00 of the root total 418.01, so the scan effectively *is* the query. When something is slow, compare every node's cost against the root's — the biggest share is your suspect.",
        ],
      },
      {
        kind: "sql",
        title: "The leading-wildcard LIKE: honest work, no shortcut",
        code: `EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT count(*) FROM big_transactions WHERE description LIKE '%0042%';`,
        result: { columns: ["QUERY PLAN"], rows: [
        ["Aggregate  (cost=417.50..417.51 rows=1 width=8) (actual rows=1.00 loops=1)"],
        ["  ->  Seq Scan on big_transactions  (cost=0.00..417.00 rows=202 width=0) (actual rows=112.00 loops=1)"],
        ["        Filter: (description ~~ '%0042%'::text)"],
        ["        Rows Removed by Filter: 19888"],
      ] },
        explain: [
          "Same shape — Aggregate over Seq Scan — but the filter is printed in PostgreSQL's internal spelling: `~~` is the operator behind LIKE.",
          "The planner estimated 202 rows; reality returned 112. Pattern matches have no useful statistics, so the planner falls back to a fixed guess — estimates are estimates, and the actuals are the truth. Trust, then verify.",
          "`Rows Removed by Filter: 19888` — every row in the table was read and pattern-checked, and no index could have prevented it.",
          "A B-tree index is sorted; `'%0042%'` can match a string at any position, so there is no range to narrow to — a sequential scan is the only honest plan. The lesson is not 'LIKE is bad'; it is that PostgreSQL told you exactly what it had to do, and why.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "An index only hears queries that speak its language",
        text: "Wrapping the column in a function — `WHERE upper(email) = 'A@EXAMPLE.COM'` — hides the indexed column from the planner: the index is sorted by raw values, and upper(email) is a different expression (fix: index the expression, `CREATE INDEX ON customers (upper(email))`). A leading-wildcard `LIKE '%0042%'` meets the same fate: a B-tree is sorted, and a pattern that can match anywhere defines no range to seek into. In both cases the plan tells you honestly — with a Seq Scan.",
      },
      {
        kind: "lab",
        title: "Predict, then measure",
        task: "Rebuild the playground at a quarter of the size, then measure a query with two filters. Before running, predict: how many rows survive account_id = 7 alone (5,000 rows, account cycling 1 to 50)? Then run, and compare the planner's rows estimate with the actual rows — and read the Rows Removed by Filter line. Finally change amount > 500 to amount > 900 and re-run: which filter is doing the work now, and did the estimate get closer or further from reality?",
        code: `DROP TABLE IF EXISTS practice_txns;
CREATE TABLE practice_txns AS
SELECT g AS txn_id,
       1 + (g % 50) AS account_id,
       ((g % 900) + 1)::numeric + 0.99 AS amount
FROM generate_series(1, 5000) AS g;
ANALYZE practice_txns;
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT count(*) FROM practice_txns
WHERE account_id = 7 AND amount > 500;`,
        hint: "Predict first, measure second — account_id = 7 keeps 1 row in 50, and the amount pattern cycles 1.99 to 900.99, so amount > 900 keeps almost nothing. The estimate drifts most when filters are rare: watch the actual rows tell on it.",
      },
    ],
    terms: [
      { term: "Query plan", definition: "The tree of steps the planner compiles your SQL into — scans, sorts, joins — printed parent-first, executed innermost-first." },
      { term: "Planner", definition: "The PostgreSQL component that compares execution strategies for a query and picks the cheapest; it works from table statistics, so ANALYZE keeps it honest." },
      { term: "Cost", definition: "The planner's score for a strategy, in units where one sequential page read is 1.0 — compare nodes and query variants with it; never read it as milliseconds." },
      { term: "EXPLAIN ANALYZE", definition: "EXPLAIN plus execution: the query really runs, and actual row counts and loops appear next to the estimates. TIMING/SUMMARY/BUFFERS OFF keep the output reproducible." },
      { term: "Rows Removed by Filter", definition: "Rows a scan read and threw away — the seq scan's confession of wasted work; big numbers here mean the scan is doing the filtering the hard way." },
    ],
    mistakes: [
      {
        mistake: "Reading cost as milliseconds",
        why: "Cost is in planner units where a sequential page read costs 1.0 — a 417.00 plan is not '417 ms'; the number exists to compare strategies, not to clock them.",
        fix: "Use cost to compare nodes and query variants against each other; when you need real seconds, run EXPLAIN ANALYZE with TIMING ON and read the actual times.",
      },
      {
        mistake: "Tuning from vibes — adding an index because a blog post said so",
        why: "The planner may ignore your index entirely: it compares costs and keeps the cheaper strategy, and you will never know without looking.",
        fix: "Run EXPLAIN ANALYZE before and after; if the plan and its costs did not move, the index is not helping.",
      },
      {
        mistake: "Writing WHERE upper(email) = '…' against a column with an index on email",
        why: "The index is sorted by the raw stored values; upper(email) is a different, unknown expression, so the planner cannot seek into it.",
        fix: "Index the expression itself — CREATE INDEX ON customers (upper(email)) — or compare against the column's stored form.",
      },
      {
        mistake: "Expecting LIKE '%pattern%' to speed up with a B-tree index",
        why: "B-trees answer range questions; a pattern that can match anywhere defines no range, so every row must be checked.",
        fix: "Anchor the pattern when you can ('prefix%'), or use a pg_trgm GIN index for true contains-search.",
      },
    ],
    takeaways: [
      "A plan is a recipe: nodes top-down, executed innermost-first — EXPLAIN shows the recipe, EXPLAIN ANALYZE also cooks it.",
      "Cost compares strategies, never seconds; rows and width are estimates until the actuals arrive.",
      "Find the expensive node before touching anything: compare each node's cost with the root total — 417.00 of 418.01 left no doubt.",
      "Pin TIMING, SUMMARY and BUFFERS off for reproducible plans — same doctrine as pinning dates: kill the noise, keep the signal.",
      "Measure, don't guess — and keep the planner's estimates honest with ANALYZE-refreshed statistics.",
    ],
    quiz: [
      {
        id: "j-01-q1",
        prompt: "In the plan line Seq Scan on big_transactions (cost=0.00..417.00 rows=400 width=34), what does the 400 tell you?",
        options: [
          { text: "The planner's estimate of how many rows the node will output, from table statistics", correct: true, feedback: "Correct — rows is the estimate; EXPLAIN ANALYZE adds (actual rows=…) beside it so you can check." },
          { text: "The number of milliseconds the scan will take", correct: false, feedback: "Neither rows nor cost are milliseconds — cost is planner units, rows counts rows." },
          { text: "The number of rows the filter removed", correct: false, feedback: "Removed rows are reported separately as Rows Removed by Filter — 19,600 in that plan." },
          { text: "The number of pages the table occupies", correct: false, feedback: "Page counts never appear in that bracket; you would read them from BUFFERS output, which we pinned off." },
        ],
        explanation: "rows is the estimate and width is the estimated average bytes per row; EXPLAIN ANALYZE puts the actuals next to them so the estimate can be checked against reality.",
      },
      {
        id: "j-01-q2",
        prompt: "Why can WHERE description LIKE '%0042%' not use an ordinary B-tree index on description?",
        options: [
          { text: "A B-tree is sorted, and a pattern that can start anywhere matches anywhere — there is no range to narrow to", correct: true, feedback: "Correct — B-trees answer range questions; '%0042%' defines no range, so every row must be checked." },
          { text: "LIKE never uses indexes of any kind", correct: false, feedback: "False — an anchored prefix like 'txn-0042%' is a range a B-tree can seek into." },
          { text: "Because TIMING OFF hides the index usage", correct: false, feedback: "EXPLAIN options change printing, never planning — the plan is chosen before any option applies." },
          { text: "Because description is TEXT, not VARCHAR", correct: false, feedback: "Both types are indexable the same way; the leading wildcard is the problem." },
        ],
        explanation: "B-trees answer range questions; '%0042%' is not a range. Prefix-anchored patterns — or a trigram (pg_trgm) index for contains-search — are the escapes.",
      },
    ],
  },

  {
    slug: "j-02",
    title: "Transactions — all or nothing",
    minutes: 14,
    summary:
      "A transfer is two UPDATEs — and a debit must never exist without its credit. BEGIN, COMMIT, ROLLBACK, the aborted-transaction ritual, ACID in plain words, and the autocommit default you are already living in.",
    kind: "coding",
    dataset: "banking",
    objectives: [
      "Wrap related statements in BEGIN … COMMIT / ROLLBACK and prove the outcome with a closing SELECT",
      "Explain what happens to writes when a statement inside a transaction fails — and how to recover",
      "State ACID in one plain sentence per letter, each anchored to something you just ran",
      "Predict what autocommit does to a bare statement — and why a later ROLLBACK cannot touch it",
    ],
    why: "Meridian Trust moves money between accounts all day, and every transfer is two UPDATE statements: take 500 from account A, add 500 to account B. Anything that interrupts between them — a crash, a power cut, a buggy import row — leaves a debit without its credit, and the books stop balancing. Banking-grade correctness cannot rest on luck or on application code hoping nothing fails. Transactions are the database's answer: wrap the pair in BEGIN, and PostgreSQL guarantees all-or-nothing — either both statements survive as one unit, or neither happened at all.",
    blocks: [
      {
        kind: "text",
        text: "Raymond Castillo banks at Meridian Trust's Downtown branch with two accounts: checking (account 1) and savings (account 2). He asks the teller to move 500 from checking to savings. In SQL that is two statements — `balance = balance - 500` on one account, `balance = balance + 500` on the other — and between those two statements live every bank's nightmares. If anything interrupts after the first UPDATE, 500 evaporates: a debit without its credit. A **transaction** makes the pair all-or-nothing: PostgreSQL buffers your writes until you say `COMMIT`, or throws them all away on `ROLLBACK`. First, the ground truth we are about to gamble with:",
      },
      {
        kind: "sql",
        title: "The balances before we touch anything",
        code: `SELECT account_id, balance
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10939.50"],
        ["2", "28900.00"],
      ] },
        explain: [
          "Raymond's checking (account 1) holds 10939.50 and his savings (account 2) holds 28900.00 — both belong to customer 1.",
          "These two numbers are our measuring stick: every experiment in this lesson ends by selecting them again, so you can see with your own eyes what was kept and what was undone.",
        ],
      },
      { kind: "heading", text: "BEGIN — the all-or-nothing envelope" },
      {
        kind: "sql",
        title: "ROLLBACK: the transaction that never happened",
        code: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;
ROLLBACK;
SELECT account_id, balance
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10939.50"],
        ["2", "28900.00"],
      ] },
        explain: [
          "`BEGIN` opens the transaction; both UPDATEs run inside it — checking gives up 500, savings gains 500. Nothing is permanent yet.",
          "`ROLLBACK` throws both writes away. The closing SELECT is the proof: 10939.50 and 28900.00, exactly the balances from the first block — the database has no memory of the transfer.",
          "This is the safety net: run risky multi-statement work, inspect it while it is in flight, and undo all of it with one word.",
        ],
      },
      {
        kind: "sql",
        title: "COMMIT: the same transfer, made real",
        code: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;
COMMIT;
SELECT account_id, balance
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10439.50"],
        ["2", "29400.00"],
      ] },
        explain: [
          "The same two UPDATEs — and this time `COMMIT`, which makes the writes permanent and visible to every session.",
          "The SELECT shows 10439.50 and 29400.00: exactly 500 moved from checking to savings. There is no committed state in between — no moment where the debit exists without the credit. That is the whole point.",
          "From here on, this lesson's schema remembers this transfer: later blocks inherit it, which is itself durability in action.",
        ],
      },
      {
        kind: "visual",
        title: "One envelope, one fate",
        ascii: `            BEGIN  -- the envelope opens
              |
     +--------+--------+
     |                 |
UPDATE acct 1     UPDATE acct 2
 balance - 500     balance + 500
     |                 |
     +--------+--------+
              |
      COMMIT  or  ROLLBACK
   (both persist)  (both vanish)`,
        caption: "All or nothing: the two legs share one fate — no committed state can ever hold just one of them.",
      },
      { kind: "heading", text: "Inside the envelope" },
      {
        kind: "sql",
        title: "Inside: your own writes are visible",
        code: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
SELECT account_id, balance FROM accounts WHERE account_id = 1;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10339.50"],
      ] },
        explain: [
          "`BEGIN` opens a new transaction; the UPDATE subtracts 100 from account 1 inside it — nothing is committed yet.",
          "The SELECT — still inside the transaction — reads 10339.50. You see your own writes immediately: in this session's view, the change is already real.",
          "No other session could read 10339.50: until COMMIT, your writes are private. That is the I in ACID — isolation — which the table below formalizes.",
        ],
      },
      {
        kind: "sql",
        title: "ROLLBACK closes it — no trace",
        code: `ROLLBACK;
SELECT account_id, balance FROM accounts WHERE account_id = 1;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10439.50"],
      ] },
        explain: [
          "ROLLBACK ends the open transaction and discards the -100; the SELECT confirms 10439.50 — the balance after the earlier COMMIT, untouched.",
          "The ritual is now complete: open with BEGIN, verify with SELECT while inside, then decide — COMMIT to keep, ROLLBACK to erase.",
        ],
      },
      { kind: "heading", text: "When the transaction fails" },
      {
        kind: "sql",
        title: "A bad statement aborts the whole transaction",
        code: `BEGIN;
UPDATE accounts SET balance = balance - 250 WHERE account_id = 1;
INSERT INTO transactions (txn_id, account_id, txn_type, amount, balance_after, occurred_at, channel, description)
VALUES (201, 1, 'withdrawal', -250.00, 10189.50, TIMESTAMP '2026-11-14 10:00:00', 'online', 'Buggy import');`,
        expectError: "new row for relation \"transactions\" violates check constraint \"transactions_amount_check\"",
        explain: [
          "The UPDATE ran fine inside the transaction — then the INSERT tried to log the withdrawal with amount = -250.00, and the transactions table enforces `CHECK (amount > 0)`.",
          "PostgreSQL rejects the row — and, crucially, aborts the *entire* transaction, not just the failing statement. The error names the constraint; the INSERT is dead, and everything since BEGIN is doomed with it.",
          "Real life looks exactly like this: a buggy import row arrives mid-batch and the batch's fate is sealed. The only question left is how it ends.",
        ],
      },
      {
        kind: "sql",
        title: "Nothing runs in an aborted transaction",
        code: `SELECT account_id, balance FROM accounts WHERE account_id = 1;`,
        expectError: "current transaction is aborted, commands ignored until end of transaction block",
        explain: [
          "The instinct is to keep going — check the balance, maybe salvage something. PostgreSQL refuses: the transaction is aborted, commands are ignored until it ends.",
          "In an aborted transaction nothing executes, not even a read. There is no 'carry on past the error'; the only exits are ROLLBACK (discard explicitly) or COMMIT (which will merely confirm the discard).",
          "The refusal is a feature: the database holds the batch's fate open for exactly one decision, and it will not let a half-broken transaction limp onward.",
        ],
      },
      {
        kind: "sql",
        title: "ROLLBACK: the clean exit",
        code: `ROLLBACK;
SELECT account_id, balance FROM accounts WHERE account_id = 1;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["1", "10439.50"],
      ] },
        explain: [
          "ROLLBACK ends the aborted transaction — and with it every statement since BEGIN: the failed INSERT and the successful UPDATE alike.",
          "The SELECT proves the account is whole: 10439.50, the exact balance after the COMMIT block. The -250 never happened — no trace, no partial state, no manual cleanup.",
          "That is atomicity in one block: all or nothing, and 'nothing' is always available as an exit.",
        ],
      },
      {
        kind: "table",
        title: "ACID, in plain words",
        headers: ["Letter", "In plain words", "Where you just saw it"],
        rows: [
          ["Atomicity", "All statements in the transaction happen, or none do — no middle, ever.", "The -250 UPDATE and the failed INSERT both vanished on ROLLBACK."],
          ["Consistency", "Constraints are never left violated: a statement that would break one is rejected — and it aborts the batch.", "CHECK (amount > 0) refused -250.00 and doomed the whole transaction."],
          ["Isolation", "Your uncommitted writes are invisible to everyone else until COMMIT.", "Inside the open transaction you read 10339.50; another session would still see 10439.50."],
          ["Durability", "Once COMMIT returns, the change survives crashes and power cuts.", "The 500 transfer stayed moved in every later block — that permanence is durability."],
        ],
        caption: "Four guarantees, one mechanism: the transaction envelope.",
      },
      {
        kind: "sql",
        title: "Autocommit: the default you live in",
        code: `UPDATE accounts SET balance = balance + 100 WHERE account_id = 31;
ROLLBACK;
SELECT account_id, balance FROM accounts WHERE account_id = 31;`,
        result: { columns: ["account_id", "balance"], rows: [
        ["31", "845.00"],
      ] },
        explain: [
          "No BEGIN anywhere: PostgreSQL runs in **autocommit** by default — every statement is its own transaction, committed the moment it succeeds.",
          "The UPDATE lifted account 31 from 745.00 to 845.00 and sealed itself instantly. The ROLLBACK that follows has nothing open to undo — at most a warning that no transaction is in progress.",
          "The SELECT confirms it: 845.00 stuck. Autocommit is convenient and unforgiving in equal measure — anything you run without BEGIN is a promise you cannot take back.",
        ],
      },
      {
        kind: "lab",
        title: "The full transfer ritual",
        task: "Run the full transaction ritual for Kwame Mensah: move 250 from his checking (account 6) to his savings (account 7) inside a transaction. The mid-transaction SELECT should show 642.40 and 5650.00; the final SELECT, after ROLLBACK, should show the original 892.40 and 5400.00 — the transfer that never happened. Then swap ROLLBACK for COMMIT and run it once; predict what a *second* run would show before you try it.",
        code: `BEGIN;
UPDATE accounts SET balance = balance - 250 WHERE account_id = 6;
UPDATE accounts SET balance = balance + 250 WHERE account_id = 7;
SELECT account_id, balance FROM accounts WHERE account_id IN (6, 7) ORDER BY account_id;
ROLLBACK;
SELECT account_id, balance FROM accounts WHERE account_id IN (6, 7) ORDER BY account_id;`,
        dataset: "banking",
        hint: "The editor shows the last statement's result. To linger on the in-flight balances, comment out the last two statements with -- and re-run, then restore them. After a COMMIT, the next run starts from the committed balances — predict, then look.",
      },
    ],
    terms: [
      { term: "Transaction", definition: "A batch of statements wrapped in BEGIN that succeeds or fails as one unit — the debit and its credit, or neither." },
      { term: "COMMIT", definition: "Ends the transaction and makes its writes permanent and visible to everyone; after COMMIT the only undo is another UPDATE." },
      { term: "ROLLBACK", definition: "Ends the transaction and discards every write it made, leaving the database exactly as it was before BEGIN." },
      { term: "Aborted transaction", definition: "The poisoned state after any statement fails inside a transaction: nothing further executes until you end it, and only rollback remains." },
      { term: "Autocommit", definition: "The default mode: without BEGIN, every statement is its own transaction, committed the instant it succeeds — there is nothing to roll back afterwards." },
    ],
    mistakes: [
      {
        mistake: "Running an UPDATE without BEGIN, then trying to ROLLBACK when you spot the mistake",
        why: "Autocommit committed the UPDATE the moment it succeeded; there is no open transaction for ROLLBACK to undo.",
        fix: "Open with BEGIN anything you might want to take back; commit only after a closing SELECT proves it is right.",
      },
      {
        mistake: "After an error inside BEGIN, continuing to type statements",
        why: "The transaction is aborted — every statement, even a plain SELECT, is rejected until the transaction ends.",
        fix: "End it with ROLLBACK, then start a fresh transaction with the bug fixed.",
      },
      {
        mistake: "Assuming other sessions can see your uncommitted writes",
        why: "Isolation: your in-flight changes are visible only inside your own transaction until COMMIT.",
        fix: "COMMIT first, then signal readers — the data they need becomes visible the instant the commit lands.",
      },
      {
        mistake: "Treating a 0-row UPDATE inside a transaction as a failure",
        why: "Matching no rows is not an error; the statement succeeds and the transaction stays healthy — a transfer can silently do half its work.",
        fix: "Verify the affected rows afterwards (a closing SELECT, or RETURNING) and decide whether a missing account should abort the batch.",
      },
    ],
    takeaways: [
      "BEGIN opens the envelope; COMMIT seals it; ROLLBACK burns it — and the closing SELECT is your proof either way.",
      "One failed statement aborts the whole transaction: nothing else runs until you ROLLBACK, and nothing commits.",
      "Inside the transaction you see your own writes; nobody else does until COMMIT — that is isolation.",
      "Without BEGIN you live in autocommit: every statement commits itself, and a later ROLLBACK is a no-op.",
    ],
    quiz: [
      {
        id: "j-02-q1",
        prompt: "Inside a BEGIN, your first UPDATE succeeds and your second statement raises an error. You now run COMMIT. What is committed?",
        options: [
          { text: "Nothing — the error aborted the transaction; COMMIT merely confirms the end, and every change is discarded", correct: true, feedback: "Correct — one failure dooms the batch; the 'successful' UPDATE is discarded with it." },
          { text: "Only the successful UPDATE", correct: false, feedback: "Partial commits are exactly what transactions exist to prevent; the batch shares one fate." },
          { text: "Both statements — COMMIT overrides the error", correct: false, feedback: "No override exists: an aborted transaction has exactly one future, and it is rollback." },
          { text: "COMMIT itself fails with an error", correct: false, feedback: "PostgreSQL accepts it and reports ROLLBACK — the outcome is quiet, not noisy." },
        ],
        explanation: "An error poisons the whole transaction: nothing commits, not even statements that had succeeded. ROLLBACK — or COMMIT-as-rollback — is the only exit.",
      },
      {
        id: "j-02-q2",
        prompt: "You run UPDATE accounts SET balance = balance + 100 WHERE account_id = 31; with no BEGIN before it, then run ROLLBACK. What does account 31 show?",
        options: [
          { text: "845.00 — the UPDATE committed itself the moment it succeeded (autocommit); ROLLBACK had nothing to undo", correct: true, feedback: "Correct — without an open transaction there is nothing to roll back." },
          { text: "745.00 — the ROLLBACK undid the UPDATE", correct: false, feedback: "Autocommit already sealed the change; ROLLBACK cannot reach a finished transaction." },
          { text: "An error — you cannot ROLLBACK outside a transaction", correct: false, feedback: "PostgreSQL only warns that no transaction is in progress; it is not an error, and the change stays." },
          { text: "845.00, but only until the session ends", correct: false, feedback: "Committed is committed — durability means it survives the session, the crash, the power cut." },
        ],
        explanation: "Autocommit makes every bare statement its own transaction. Anything you might want to undo needs an explicit BEGIN first.",
      },
    ],
  },

  {
    slug: "j-03",
    title: "Normalization — every fact once",
    minutes: 14,
    summary:
      "Lists in cells, repeated facts, one product with two names: the flat-table horror cured one normal form at a time — 1NF atomic values, 2NF whole-key facts, 3NF no facts about facts. Every fact stored once; keys link everything.",
    kind: "coding",
    objectives: [
      "Recognize the symptoms of a flat table: comma lists in cells, repeated facts, mixed levels of detail",
      "Apply 1NF: one atomic value per cell, one row per line item",
      "Apply 2NF: move facts that depend on part of a composite key into their own table — and cure the update anomaly",
      "Apply 3NF: give transitive dependencies (zip → city) their own table, with a foreign key to police them",
      "Say when denormalizing is a deliberate trade rather than an accident",
    ],
    why: "ShopSphere's order system began life as a spreadsheet, and when it was imported into PostgreSQL it arrived exactly as typed: one row per order, the products crammed into a comma-separated text cell, quantities and line totals following along in lists of their own. The data was all there — and almost none of it was queryable. 'Which product sold the most?' needed string surgery. 'Rename the SoundCore headphones' needed a hunt through every row. Normalization is the cure, and it is one idea wearing three name tags: store every fact exactly once, make each table describe one kind of thing, and let keys link everything back together.",
    blocks: [
      {
        kind: "text",
        text: "Every company's first database is a spreadsheet, and ShopSphere was no exception: one row per order, products crammed into a single cell, quantities and totals following along as comma lists. Imported into PostgreSQL as-is, it became `flat_orders` below — all the data present, almost none of it usable. Normalization is the discipline that fixes this, and despite the intimidating name it is a single idea: **every fact stored once, keys link everything.** The three normal forms are that idea applied three times, each pass catching what the previous one let slip.",
      },
      {
        kind: "sql",
        title: "flat_orders: the spreadsheet, imported as-is",
        code: `CREATE TABLE flat_orders (
  order_id      INT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city          TEXT NOT NULL,
  product_names TEXT NOT NULL,
  quantities    TEXT NOT NULL,
  line_totals   TEXT NOT NULL,
  order_total   NUMERIC(10,2) NOT NULL
);
INSERT INTO flat_orders VALUES
  (101, 'Amelia Watson', 'Portland', 'AeroBook 14 Laptop, ChargeHub 100W GaN', '1, 1', '1299.00, 59.00', 1358.00),
  (102, 'Marcus Chen',   'Seattle',  'SoundCore ANC Headphones, SoundCore Lite Earbuds', '1, 1', '249.00, 129.00', 378.00),
  (103, 'Priya Sharma',  'Austin',   'SoundCore ANC Headphones', '1', '249.00', 249.00),
  (104, 'Amelia Watson', 'Portland', 'TabSlate 11 Tablet, ProPad Elite Controller', '1, 1', '649.00, 69.00', 718.00);
SELECT * FROM flat_orders ORDER BY order_id;`,
        result: { columns: ["order_id", "customer_name", "city", "product_names", "quantities", "line_totals", "order_total"], rows: [
        ["101", "Amelia Watson", "Portland", "AeroBook 14 Laptop, ChargeHub 100W GaN", "1, 1", "1299.00, 59.00", "1358.00"],
        ["102", "Marcus Chen", "Seattle", "SoundCore ANC Headphones, SoundCore Lite Earbuds", "1, 1", "249.00, 129.00", "378.00"],
        ["103", "Priya Sharma", "Austin", "SoundCore ANC Headphones", "1", "249.00", "249.00"],
        ["104", "Amelia Watson", "Portland", "TabSlate 11 Tablet, ProPad Elite Controller", "1, 1", "649.00, 69.00", "718.00"],
      ] },
        explain: [
          "Four orders, and the disease is visible on sight: product_names, quantities and line_totals are comma-separated lists wearing TEXT costumes.",
          "The coupling is positional — the only reason '1, 1' means 'one of each product' is that both lists happen to be in the same order. Nothing in the schema enforces that; one mis-typed import row silently breaks the pairing.",
          "Ask SQL anything about products and it can only shrug: equality on product_names only finds orders that bought nothing else (order 102 is invisible to it), and sum(quantities) is impossible — the column is text, not numbers.",
          "Note also that Amelia's Portland is stored twice — a smaller symptom that will matter again in third normal form.",
        ],
      },
      {
        kind: "table",
        title: "The horror up close",
        headers: ["order_id", "customer_name", "city", "product_names", "quantities", "line_totals", "order_total"],
        rows: [
          ["101", "Amelia Watson", "Portland", "AeroBook 14 Laptop, ChargeHub 100W GaN", "1, 1", "1299.00, 59.00", "1358.00"],
          ["102", "Marcus Chen", "Seattle", "SoundCore ANC Headphones, SoundCore Lite Earbuds", "1, 1", "249.00, 129.00", "378.00"],
          ["103", "Priya Sharma", "Austin", "SoundCore ANC Headphones", "1", "249.00", "249.00"],
          ["104", "Amelia Watson", "Portland", "TabSlate 11 Tablet, ProPad Elite Controller", "1, 1", "649.00, 69.00", "718.00"],
        ],
        caption: "Three lists in text cells, one city stored twice — and not a single product you can filter, join or sum.",
      },
      { kind: "heading", text: "First normal form — one value per cell" },
      {
        kind: "sql",
        title: "1NF: one value per cell, one row per line item",
        code: `CREATE TABLE orders_1nf (
  order_id     INT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city         TEXT NOT NULL,
  order_total  NUMERIC(10,2) NOT NULL
);
CREATE TABLE items_1nf (
  order_id    INT NOT NULL,
  product_name TEXT NOT NULL,
  quantity    INT NOT NULL,
  line_total  NUMERIC(10,2) NOT NULL
);
INSERT INTO orders_1nf VALUES
  (101, 'Amelia Watson', 'Portland', 1358.00),
  (102, 'Marcus Chen',   'Seattle',  378.00),
  (103, 'Priya Sharma',  'Austin',   249.00),
  (104, 'Amelia Watson', 'Portland', 718.00);
INSERT INTO items_1nf VALUES
  (101, 'AeroBook 14 Laptop', 1, 1299.00),
  (101, 'ChargeHub 100W GaN', 1, 59.00),
  (102, 'SoundCore ANC Headphones', 1, 249.00),
  (102, 'SoundCore Lite Earbuds', 1, 129.00),
  (103, 'SoundCore ANC Headphones', 1, 249.00),
  (104, 'TabSlate 11 Tablet', 1, 649.00),
  (104, 'ProPad Elite Controller', 1, 69.00);
SELECT * FROM items_1nf ORDER BY order_id, product_name;`,
        result: { columns: ["order_id", "product_name", "quantity", "line_total"], rows: [
        ["101", "AeroBook 14 Laptop", "1", "1299.00"],
        ["101", "ChargeHub 100W GaN", "1", "59.00"],
        ["102", "SoundCore ANC Headphones", "1", "249.00"],
        ["102", "SoundCore Lite Earbuds", "1", "129.00"],
        ["103", "SoundCore ANC Headphones", "1", "249.00"],
        ["104", "ProPad Elite Controller", "1", "69.00"],
        ["104", "TabSlate 11 Tablet", "1", "649.00"],
      ] },
        explain: [
          "orders_1nf keeps the order-level facts — who, where, the total — one row per order. items_1nf keeps the line-level facts: one row per product per order, with quantity as a real INT.",
          "The comma lists are gone: order 101 is two rows in items_1nf (AeroBook and ChargeHub), order 103 is one. order_id links them — the same key that did all the work in Part A's drawings.",
          "Atomicity is the whole rule of 1NF: one value per cell. Every later normal form is the same idea applied to bigger structures.",
        ],
      },
      {
        kind: "sql",
        title: "The impossible question, answered",
        code: `SELECT product_name, sum(quantity) AS sold
FROM items_1nf
GROUP BY product_name
ORDER BY sold DESC, product_name;`,
        result: { columns: ["product_name", "sold"], rows: [
        ["SoundCore ANC Headphones", "2"],
        ["AeroBook 14 Laptop", "1"],
        ["ChargeHub 100W GaN", "1"],
        ["ProPad Elite Controller", "1"],
        ["SoundCore Lite Earbuds", "1"],
        ["TabSlate 11 Tablet", "1"],
      ] },
        explain: [
          "Against flat_orders this question needed string surgery — split the lists, keep the alignment, hope the data was typed consistently. Against items_1nf it is one GROUP BY.",
          "SoundCore ANC Headphones wins with 2 — sold in orders 102 and 103. No parsing, no hoping: the shape of the table does the work.",
          "That is the recurring lesson of normalization: shape first, queries second. When a question is hard, the table is usually the problem.",
        ],
      },
      { kind: "heading", text: "Second normal form — no facts about half the key" },
      {
        kind: "sql",
        title: "The update anomaly: one product, two names",
        code: `CREATE TABLE order_lines (
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  product_name TEXT NOT NULL,
  quantity     INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_lines VALUES
  (101, 1,  'AeroBook 14 Laptop', 1),
  (102, 6,  'SoundCore ANC Headphones', 1),
  (103, 6,  'SoundCore ANC Headphones', 1),
  (104, 20, 'TabSlate 11 Tablet', 1);
UPDATE order_lines SET product_name = 'SoundCore ANC Headphones (2026)'
WHERE order_id = 102 AND product_id = 6;
SELECT product_id, product_name FROM order_lines WHERE product_id = 6 ORDER BY order_id;`,
        result: { columns: ["product_id", "product_name"], rows: [
        ["6", "SoundCore ANC Headphones (2026)"],
        ["6", "SoundCore ANC Headphones"],
      ] },
        explain: [
          "order_lines is 1NF-clean: atomic cells, composite primary key (order_id, product_id). But product_name depends only on product_id — HALF the key — so the name is stored once per order that contains the product.",
          "The UPDATE renames the headphones for order 102 only. The SELECT shows the damage: order 102 says 'SoundCore ANC Headphones (2026)' while order 103 still says the old name. One product, two names — which one is true?",
          "That is the **update anomaly**: a duplicated fact drifting apart. It is not a bug in your UPDATE — the UPDATE did exactly what it was told. The table shape made the error inevitable.",
        ],
      },
      {
        kind: "sql",
        title: "2NF: product facts move out of the line items",
        code: `CREATE TABLE catalog_products (
  product_id INT PRIMARY KEY,
  name       TEXT NOT NULL
);
INSERT INTO catalog_products VALUES
  (1, 'AeroBook 14 Laptop'),
  (6, 'SoundCore ANC Headphones'),
  (20, 'TabSlate 11 Tablet');
CREATE TABLE order_items_norm (
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_items_norm VALUES
  (101, 1, 1), (102, 6, 1), (103, 6, 1), (104, 20, 1);
UPDATE catalog_products SET name = 'SoundCore ANC Headphones (2026)' WHERE product_id = 6;
SELECT oi.order_id, cp.name, oi.quantity
FROM order_items_norm oi
JOIN catalog_products cp ON cp.product_id = oi.product_id
ORDER BY oi.order_id;`,
        result: { columns: ["order_id", "name", "quantity"], rows: [
        ["101", "AeroBook 14 Laptop", "1"],
        ["102", "SoundCore ANC Headphones (2026)", "1"],
        ["103", "SoundCore ANC Headphones (2026)", "1"],
        ["104", "TabSlate 11 Tablet", "1"],
      ] },
        explain: [
          "Second normal form: in a table with a composite key, every non-key column must depend on the WHOLE key. product_name fails — it hangs off product_id alone — so it moves to catalog_products, keyed by product_id.",
          "order_items_norm shrinks to what truly depends on the pair: the quantity of that product in that order.",
          "The rename now touches exactly one row in catalog_products, and the join shows every order instantly agreeing — '(2026)' across the board. The anomaly is structurally impossible: there is no second copy to forget.",
        ],
      },
      { kind: "heading", text: "Third normal form — no facts about facts" },
      {
        kind: "sql",
        title: "3NF candidate: city depends on zip, not on the customer",
        code: `CREATE TABLE customers_denorm (
  customer_id INT PRIMARY KEY,
  name        TEXT NOT NULL,
  zip         TEXT NOT NULL,
  city        TEXT NOT NULL
);
INSERT INTO customers_denorm VALUES
  (1, 'Amelia Watson',   '97205', 'Portland'),
  (2, 'Marcus Chen',     '98101', 'Seattle'),
  (3, 'Priya Sharma',    '78701', 'Austin'),
  (4, 'Hannah Kowalski', '97205', 'Portland');
SELECT * FROM customers_denorm ORDER BY customer_id;`,
        result: { columns: ["customer_id", "name", "zip", "city"], rows: [
        ["1", "Amelia Watson", "97205", "Portland"],
        ["2", "Marcus Chen", "98101", "Seattle"],
        ["3", "Priya Sharma", "78701", "Austin"],
        ["4", "Hannah Kowalski", "97205", "Portland"],
      ] },
        explain: [
          "customers_denorm looks harmless — atomic cells, one row per customer. But look at what depends on what: customer_id → zip, and zip → city. City is a fact about a fact — a **transitive dependency**.",
          "The symptom is repetition: 97205 → Portland is stored for both Amelia and Hannah. Multiply by a million customers and 'Portland' lives a million times.",
          "The same anomaly waits here as in the line items: typo one Portland row and the table holds two truths about one zip.",
        ],
      },
      {
        kind: "sql",
        title: "3NF: zips own the zip-to-city fact",
        code: `CREATE TABLE zips (
  zip  TEXT PRIMARY KEY,
  city TEXT NOT NULL
);
INSERT INTO zips VALUES
  ('97205', 'Portland'),
  ('98101', 'Seattle'),
  ('78701', 'Austin');
CREATE TABLE customers_norm (
  customer_id INT PRIMARY KEY,
  name        TEXT NOT NULL,
  zip         TEXT NOT NULL REFERENCES zips(zip)
);
INSERT INTO customers_norm VALUES
  (1, 'Amelia Watson',   '97205'),
  (2, 'Marcus Chen',     '98101'),
  (3, 'Priya Sharma',    '78701'),
  (4, 'Hannah Kowalski', '97205');
SELECT c.customer_id, c.name, c.zip, z.city
FROM customers_norm c
JOIN zips z ON z.zip = c.zip
ORDER BY c.customer_id;`,
        result: { columns: ["customer_id", "name", "zip", "city"], rows: [
        ["1", "Amelia Watson", "97205", "Portland"],
        ["2", "Marcus Chen", "98101", "Seattle"],
        ["3", "Priya Sharma", "78701", "Austin"],
        ["4", "Hannah Kowalski", "97205", "Portland"],
      ] },
        explain: [
          "zips now owns the zip-to-city fact — stored exactly once. customers_norm keeps only what depends on its key: who the customer is and their zip.",
          "The `REFERENCES` clause makes PostgreSQL police the link: insert a customer whose zip is not in zips and the database refuses — the Part A shape, enforced instead of hoped for.",
          "The join reassembles the customer-plus-city view on demand — the same information as before, stored once, impossible to contradict.",
        ],
      },
      {
        kind: "visual",
        title: "Three cuts, one rule",
        ascii: `  flat_orders  (lists stuffed into TEXT cells)
      |
      |  1NF: one value per cell
      v
  orders_1nf -------------.
  (order-level facts)     |
      |                   v
      |              items_1nf
      |          (one row per line item)
      |
      |  2NF: no facts about half the key
      v
  order_items --------------------> products
  (order_id, product_id, qty)      (name stored once)

  customers_denorm
      |  3NF: no facts about facts
      v
  customers ---------------------> zips
  (customer_id, name, zip)        (zip -> city, once)`,
        caption: "Every fact stored once, keys link everything — the arrows are the keys.",
      },
      {
        kind: "callout",
        tone: "info",
        title: "When to denormalize — honestly",
        text: "Normalized tables are the correct default, but they are not a religion. A reporting table that stores city next to every customer row lets a dashboard skip a join; a counter column maintained by a trigger makes 'how many?' instant. Those are deliberate trades: a measured reason, a refresh story for the copied facts, and a source of truth that is still stored exactly once. Denormalizing by accident is a bug; denormalizing on purpose, with a reason you can write down, is engineering.",
      },
      {
        kind: "text",
        text: "Normalization is one idea, worn three ways: **every fact stored once, keys link everything** — the promise Part A made when it drew the first primary-key-to-foreign-key arrow. 1NF asks *is each cell atomic?* 2NF asks *does each column depend on the whole key?* 3NF asks *does it depend on nothing but the key?* Three passes of the same question — and the payoff is that the update anomaly, the impossible question and the million stored Portlands all become structurally impossible rather than carefully avoided.",
      },
      {
        kind: "lab",
        title: "note_orders: find the echoes",
        task: "note_orders is 1NF-shaped — every cell atomic — but two facts are still stored more than once. Find them (one belongs to Grace Kim, one to HomeEye). Then answer the impossible question from the top of the lesson with your own SQL: how many HomeEye Indoor Cameras were ordered in total? Stretch: create a products table so each product name lives exactly once, and rebuild the order list with a join.",
        code: `DROP TABLE IF EXISTS note_orders CASCADE;
CREATE TABLE note_orders (
  order_id   INT PRIMARY KEY,
  customer   TEXT NOT NULL,
  city       TEXT NOT NULL,
  product    TEXT NOT NULL,
  quantity   INT NOT NULL
);
INSERT INTO note_orders VALUES
  (201, 'Grace Kim', 'Seattle', 'HomeEye Indoor Camera', 1),
  (202, 'Grace Kim', 'Seattle', 'SmartPlug 4-Pack', 2),
  (203, 'Owen Davis', 'Portland', 'HomeEye Indoor Camera', 1);
SELECT customer, product, quantity FROM note_orders ORDER BY order_id;`,
        hint: "GROUP BY product with sum(quantity) is the 1NF payoff again. For the stretch, copy what catalog_products and order_items_norm did: one table for the product, one for the line, a key between them.",
      },
    ],
    terms: [
      { term: "First normal form (1NF)", definition: "Every cell holds a single atomic value — no comma lists; a list in a TEXT cell is positional coupling SQL cannot query." },
      { term: "Second normal form (2NF)", definition: "In a table with a composite key, every non-key column must depend on the whole key — facts about part of the key move to their own table." },
      { term: "Third normal form (3NF)", definition: "Non-key columns depend on the key, the whole key, and nothing but the key — facts about other facts (zip → city) get their own table." },
      { term: "Update anomaly", definition: "The denormalization smoking gun: one real-world fact stored in several rows, so an UPDATE changes some copies and leaves others stale." },
      { term: "Transitive dependency", definition: "A non-key column that depends on another non-key column (city depends on zip) rather than on the key itself — the target of 3NF." },
    ],
    mistakes: [
      {
        mistake: "Keeping comma lists in a TEXT column because the data 'looks fine' when you SELECT it",
        why: "SQL cannot filter, join or sum inside the list — quantities and totals are locked in positional coupling that nothing enforces.",
        fix: "1NF: one row per line item, one value per cell; link back to the order with its key.",
      },
      {
        mistake: "Fixing the lists and declaring victory (stopping at 1NF)",
        why: "order_lines still stores product_name once per order containing the product — it depends on half the composite key, so renames go stale.",
        fix: "2NF: move product facts to a products table keyed by product_id; keep only order_id, product_id and quantity in the lines.",
      },
      {
        mistake: "Splitting every repeating value into its own table by reflex",
        why: "A value repeating across rows is not automatically a violation — customers may legitimately share a city; the smell is a fact depending on the wrong thing.",
        fix: "Test each column with the one question: does it depend on the key, the whole key, and nothing but the key?",
      },
      {
        mistake: "Denormalizing 'for performance' before measuring",
        why: "Joins are cheap and well planned; guessing that a join is slow is the same sin as guessing a query is slow.",
        fix: "Normalize for correctness first; denormalize a specific, measured bottleneck — and keep the source of truth stored once.",
      },
    ],
    takeaways: [
      "A list in a cell is a costume, not a value — 1NF gives every fact its own row.",
      "Ask of every column: does it depend on the key, the whole key, and nothing but the key? — 1NF, 2NF and 3NF in one sentence.",
      "The update anomaly is the tell: one product, two names means a fact is stored twice.",
      "Facts about facts (zip → city) belong in their own table, policed by a foreign key.",
      "Normalize for correctness; denormalize only on purpose, for a measured reason, never by accident.",
    ],
    quiz: [
      {
        id: "j-03-q1",
        prompt: "Which rule does flat_orders break — the one first normal form polices?",
        options: [
          { text: "Atomic values: product_names, quantities and line_totals hold comma-separated lists inside single cells", correct: true, feedback: "Correct — more than one value per cell is exactly what 1NF forbids." },
          { text: "It has no foreign keys", correct: false, feedback: "Foreign keys are about linking tables — real and important, but not what 1NF is about." },
          { text: "order_total is NUMERIC while line_totals is TEXT", correct: false, feedback: "Type choice is style, not form — the disease is the list, not the spelling." },
          { text: "customer_name repeats across orders 101 and 104", correct: false, feedback: "Repeating a value across rows is fine — the same customer really did place both orders." },
        ],
        explanation: "1NF: one value per cell. Lists in text cells force positional coupling — which quantity belongs to which product? — that SQL cannot query.",
      },
      {
        id: "j-03-q2",
        prompt: "In order_lines (PRIMARY KEY (order_id, product_id)), product_name depends only on product_id. Renaming the headphones for order 102 but not 103 is an…",
        options: [
          { text: "update anomaly — the fact is stored once per order that contains the product, so copies drift apart", correct: true, feedback: "Correct — one real-world fact, several stored copies, and an UPDATE touches only some of them." },
          { text: "insert anomaly — new products cannot be added without an order", correct: false, feedback: "That is also a denormalization symptom, but the demo showed an existing fact going stale on UPDATE." },
          { text: "index anomaly — the composite primary key cannot enforce it", correct: false, feedback: "The key is doing its job; the problem is a non-key column depending on half of it." },
          { text: "isolation anomaly — another session would have blocked you", correct: false, feedback: "No concurrency involved: one session, one UPDATE, two disagreeing copies." },
        ],
        explanation: "2NF: non-key columns must depend on the WHOLE key. product_name depends on product_id alone, so it belongs in a products table keyed by product_id.",
      },
      {
        id: "j-03-q3",
        prompt: "customers_denorm stores zip and city per customer. To reach third normal form you…",
        options: [
          { text: "Move zip → city into a zips table keyed by zip, and keep only zip with the customer", correct: true, feedback: "Correct — one table per dependency, joined on the key; the fact is stored once." },
          { text: "Delete the city column entirely", correct: false, feedback: "Losing the fact is not normalization — it still belongs somewhere, exactly once." },
          { text: "Add city to the primary key", correct: false, feedback: "The key already identifies the customer; the problem is a non-key fact hanging off another non-key fact." },
          { text: "Store all cities for a zip in an array next to the customer", correct: false, feedback: "That smuggles the list back in — 1NF's rule applies to arrays-as-lists too." },
        ],
        explanation: "3NF removes transitive dependencies: customer_id → zip → city. The fix is a table per dependency, joined on the key — keys link everything.",
      },
    ],
  },

  {
    slug: "j-04",
    title: "Designing a database from scratch",
    minutes: 16,
    summary:
      "A blank page and a paragraph of wants: turn a conference brief into six tables — entities, keys, a junction table for the many-to-many, and constraints that enforce the prose — then prove the design with test inserts and one seat-pressure query.",
    kind: "coding",
    objectives: [
      "Turn a paragraph of requirements into entities, attributes and relationships",
      "Choose primary keys — including the composite key that guards a junction table",
      "Write CREATE TABLE statements whose NOT NULL, UNIQUE, CHECK and REFERENCES constraints enforce the brief",
      "Test a fresh schema by seeding awkward rows and trying to break it on purpose",
      "Answer a business question — seat pressure per talk — with one query over the design you built",
    ],
    why: "For nine parts you have queried databases other people designed. The real job usually starts differently: a paragraph of wants — track rooms, speakers, signups, and do not oversell the workshops — and a blank editor. This lesson walks that exact journey for a one-day conference: nouns become tables, verbs become foreign keys, the many-to-many becomes a junction table, and the promises in the prose become constraints the database enforces at 2 a.m. when nobody is watching. Design is the highest-leverage SQL skill there is: every query you ever write gets easier when the schema underneath it is right.",
    blocks: [
      {
        kind: "text",
        text: "Every database you have queried in this course was designed by someone else — the tables were waiting, keys chosen, relationships fixed. Today nobody has done that work. You are organizing **DevIsland**, a one-day developer conference, and the entire brief is one paragraph of wants: three studios with fixed capacities; two speakers; a few hundred attendees, each with a unique email and a standard or VIP ticket; talks in three formats — talk, workshop, panel — each with exactly one speaker; a schedule that puts a talk in a room at a time (some talks start life unscheduled); and signups, where any attendee can reserve a seat at any talk, because the organizers want to watch **seat pressure**. Your job: turn that paragraph into tables, keys and constraints, prove the design with test inserts — including one that must fail — and answer the seat-pressure question with a single query. No dataset today; everything you see, you build.",
      },
      {
        kind: "steps",
        title: "The design checklist",
        items: [
          "Read the requirements twice. Underline the nouns — room, speaker, attendee, talk — each is a candidate table. Underline the verbs — speaks, is scheduled in, attends — each is a candidate relationship.",
          "Give every table a primary key. Prefer a surrogate (room_id INT PRIMARY KEY) over real-world data; real-world identifiers get UNIQUE instead, so they can change without breaking references.",
          "Cardinality every relationship: one speaker speaks many talks (1:N, a foreign key on the many side); an attendee attends many talks and a talk hosts many attendees (M:N, a junction table whose primary key is the pair).",
          "Split optional facts into their own table when the optionality matters: schedule is separate from talks because not-scheduled-yet is a state worth representing, and UNIQUE (talk_id) makes it at most one slot per talk.",
          "Translate every promise from the prose into a constraint: NOT NULL for required, UNIQUE for one-of, CHECK for value rules, REFERENCES for must-exist.",
          "Write the CREATE TABLE statements parents-first — a foreign key can only reference a table that already exists.",
          "Seed test data that includes the awkward cases, then try to break the schema on purpose before trusting it.",
          "Answer one real requirement with one query. If the query reads naturally, the design is right.",
        ],
      },
      {
        kind: "visual",
        title: "The DevIsland design",
        ascii:
          "speakers -1:N- talks\n" +
          "              |-1:N- talk_attendees -N:1- attendees\n" +
          "              |-1:1- schedule -N:1- rooms",
        caption:
          "Six tables, five relationships, every arrow a foreign key. talk_attendees turns many-to-many into two one-to-manys meeting in the middle; schedule's UNIQUE (talk_id) lets a talk have at most one slot, so unscheduled is representable.",
      },
      {
        kind: "sql",
        title: "Six CREATE TABLEs, parents first",
        code: `CREATE TABLE rooms (
  room_id  INT PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL CHECK (capacity > 0)
);
CREATE TABLE speakers (
  speaker_id INT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);
CREATE TABLE attendees (
  attendee_id INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('standard','vip'))
);
CREATE TABLE talks (
  talk_id    INT PRIMARY KEY,
  title      TEXT NOT NULL,
  speaker_id INT NOT NULL REFERENCES speakers(speaker_id),
  format     TEXT NOT NULL CHECK (format IN ('talk','workshop','panel'))
);
CREATE TABLE schedule (
  talk_id   INT NOT NULL REFERENCES talks(talk_id) UNIQUE,
  room_id   INT NOT NULL REFERENCES rooms(room_id),
  starts_at TIMESTAMP NOT NULL
);
CREATE TABLE talk_attendees (
  attendee_id INT NOT NULL REFERENCES attendees(attendee_id),
  talk_id     INT NOT NULL REFERENCES talks(talk_id),
  PRIMARY KEY (attendee_id, talk_id)
);`,
        result: { columns: [], rows: [], command: "CREATE" },
        explain: [
          "Parents first: rooms, speakers and attendees reference nothing; talks references speakers; schedule references talks and rooms; talk_attendees references attendees and talks. The order is not cosmetic — it is the dependency chain, because a foreign key can only point at a table that already exists.",
          "Every table gets a surrogate primary key — an invented number that identifies the row and never changes. Real-world data like email earns UNIQUE instead: still enforced, but not asked to be immortal.",
          "The prose becomes constraints: CHECK (capacity > 0) means no negative rooms, CHECK (ticket_type IN ('standard','vip')) means no invented ticket tiers, and UNIQUE on schedule(talk_id) means a talk gets at most one slot — which is exactly why schedule lives in its own table rather than as three columns on talks.",
          "talk_attendees has no surrogate key at all: PRIMARY KEY (attendee_id, talk_id) — the pair itself — means Amara can sign up for many talks, a talk can hold many attendees, but the same person can never sign up for the same talk twice.",
        ],
      },
      {
        kind: "sql",
        title: "Seed data — with the awkward cases planted",
        code: `INSERT INTO rooms (room_id, name, capacity) VALUES
  (1, 'Main Hall', 400),
  (2, 'Studio A', 80),
  (3, 'Studio B', 80);
INSERT INTO speakers (speaker_id, first_name, last_name, email) VALUES
  (1, 'Rosa', 'Delgado', 'rosa@devisland.dev'),
  (2, 'Tomas', 'Lindqvist', 'tomas@devisland.dev');
INSERT INTO attendees (attendee_id, first_name, last_name, email, ticket_type) VALUES
  (1, 'Amara', 'Osei', 'amara@devmail.dev', 'vip'),
  (2, 'Diego', 'Fuentes', 'diego@devmail.dev', 'standard'),
  (3, 'Grace', 'Park', 'grace@devmail.dev', 'standard');
INSERT INTO talks (talk_id, title, speaker_id, format) VALUES
  (1, 'Reading query plans like a pro', 1, 'talk'),
  (2, 'Designing schemas that last', 2, 'workshop'),
  (3, 'JSONB and arrays in the wild', 1, 'talk'),
  (4, 'Closing panel: the state of SQL', 2, 'panel');
INSERT INTO schedule (talk_id, room_id, starts_at) VALUES
  (1, 1, TIMESTAMP '2027-03-04 10:00:00'),
  (2, 3, TIMESTAMP '2027-03-04 13:00:00'),
  (3, 2, TIMESTAMP '2027-03-04 15:00:00');
INSERT INTO talk_attendees (attendee_id, talk_id) VALUES
  (1, 1), (2, 1), (3, 2);`,
        result: { columns: [], rows: [], command: "INSERT" },
        explain: [
          "Three rooms, two speakers, three attendees, four talks, three schedule rows, three signups — a conference in miniature. The output is just the INSERT command tags: each statement reports how many rows it added.",
          "Talk 4, the closing panel, is deliberately left off the schedule. The requirements said some talks start life unscheduled, so the test data must contain one — otherwise the design promise is never exercised.",
          "Talk 3 is scheduled but has zero signups — the other awkward case. Both of these rows will earn their keep in the next three blocks.",
        ],
      },
      {
        kind: "sql",
        title: "Trying to book a ghost room",
        code: `INSERT INTO schedule (talk_id, room_id, starts_at)
VALUES (4, 999, TIMESTAMP '2027-03-04 16:00:00');`,
        expectError: "insert or update on table \"schedule\" violates foreign key constraint \"schedule_room_id_fkey\"",
        explain: [
          "Room 999 does not exist in rooms, and the foreign key on schedule(room_id) refuses the insert: PostgreSQL reports that the value has no matching row in the parent table.",
          "This is not the design failing — it is the design working. The brief promised no ghost rooms; the constraint enforces the promise at write time, and nobody had to remember to check.",
          "This block is the payoff of constraint-first design: the database polices the data when you are not watching, at 2 a.m., under load, forever.",
        ],
      },
      {
        kind: "sql",
        title: "The requirement, answered: seat pressure",
        code: `SELECT t.title,
       r.name AS room,
       r.capacity,
       count(sa.attendee_id) AS signups,
       r.capacity - count(sa.attendee_id) AS seats_left
FROM talks t
JOIN schedule s ON s.talk_id = t.talk_id
JOIN rooms r ON r.room_id = s.room_id
LEFT JOIN talk_attendees sa ON sa.talk_id = t.talk_id
GROUP BY t.talk_id, t.title, r.name, r.capacity
ORDER BY seats_left;`,
        result: { columns: ["title", "room", "capacity", "signups", "seats_left"], rows: [
        ["Designing schemas that last", "Studio B", "80", "1", "79"],
        ["JSONB and arrays in the wild", "Studio A", "80", "0", "80"],
        ["Reading query plans like a pro", "Main Hall", "400", "2", "398"],
      ] },
        explain: [
          "The brief asked to watch seat pressure, and this is the query that answers it: title, room, capacity, signups and seats left, one row per scheduled talk, most pressurized first.",
          "Designing schemas that last — the workshop in Studio B, capacity 80 — has 1 signup and 79 seats left, the tightest room in the building. JSONB and arrays in the wild sits in Studio A with 80 seats and zero signups: count(sa.attendee_id) counts the matches that exist, finds none, and reports an honest 0, so seats_left equals the full 80.",
          "Reading query plans like a pro fills the Main Hall's 400 seats with just 2 signups — 398 free, no pressure at all. ORDER BY seats_left puts the rooms that need attention at the top: exactly what an organizer wants on the morning of the event.",
          "The LEFT JOIN to talk_attendees is doing the quiet work — an inner join would have silently dropped the zero-signup talk, and the organizer would never know it existed.",
        ],
      },
      {
        kind: "sql",
        title: "The same schema, an inner-join lie",
        code: `SELECT t.title, count(sa.attendee_id) AS signups
FROM talks t
JOIN schedule s ON s.talk_id = t.talk_id
JOIN talk_attendees sa ON sa.talk_id = t.talk_id
GROUP BY t.talk_id, t.title
ORDER BY t.title;`,
        result: { columns: ["title", "signups"], rows: [
        ["Designing schemas that last", "1"],
        ["Reading query plans like a pro", "2"],
      ] },
        explain: [
          "Same schema, weaker query: both joins are INNER this time, and the output shrinks to two talks — the 2-signup and 1-signup ones.",
          "The inner join to schedule removed talk 4 (unscheduled, no row to match) and the inner join to talk_attendees removed talk 3 (zero signups). The query is legal, runs without a single warning, and lies: it reports a conference with two talks.",
          "This is why the seed data planted those awkward rows on purpose. A schema is proven by the queries it survives — and the difference between this output and the previous one is the entire argument for LEFT JOIN in reporting.",
        ],
      },
      {
        kind: "lab",
        title: "Find the talk with no room yet",
        task:
          "Rebuild DevIsland from a blank schema (the starter does it for you), then find the talks that are still unscheduled — the closing panel is homeless. Then give talk 4 a slot and prove the gap closes.",
        code: `DROP TABLE IF EXISTS talk_attendees, schedule, talks, attendees, speakers, rooms CASCADE;

CREATE TABLE rooms (
  room_id  INT PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL CHECK (capacity > 0)
);
CREATE TABLE speakers (
  speaker_id INT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);
CREATE TABLE attendees (
  attendee_id INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('standard','vip'))
);
CREATE TABLE talks (
  talk_id    INT PRIMARY KEY,
  title      TEXT NOT NULL,
  speaker_id INT NOT NULL REFERENCES speakers(speaker_id),
  format     TEXT NOT NULL CHECK (format IN ('talk','workshop','panel'))
);
CREATE TABLE schedule (
  talk_id   INT NOT NULL REFERENCES talks(talk_id) UNIQUE,
  room_id   INT NOT NULL REFERENCES rooms(room_id),
  starts_at TIMESTAMP NOT NULL
);
CREATE TABLE talk_attendees (
  attendee_id INT NOT NULL REFERENCES attendees(attendee_id),
  talk_id     INT NOT NULL REFERENCES talks(talk_id),
  PRIMARY KEY (attendee_id, talk_id)
);

INSERT INTO rooms (room_id, name, capacity) VALUES
  (1, 'Main Hall', 400),
  (2, 'Studio A', 80),
  (3, 'Studio B', 80);
INSERT INTO speakers (speaker_id, first_name, last_name, email) VALUES
  (1, 'Rosa', 'Delgado', 'rosa@devisland.dev'),
  (2, 'Tomas', 'Lindqvist', 'tomas@devisland.dev');
INSERT INTO attendees (attendee_id, first_name, last_name, email, ticket_type) VALUES
  (1, 'Amara', 'Osei', 'amara@devmail.dev', 'vip'),
  (2, 'Diego', 'Fuentes', 'diego@devmail.dev', 'standard'),
  (3, 'Grace', 'Park', 'grace@devmail.dev', 'standard');
INSERT INTO talks (talk_id, title, speaker_id, format) VALUES
  (1, 'Reading query plans like a pro', 1, 'talk'),
  (2, 'Designing schemas that last', 2, 'workshop'),
  (3, 'JSONB and arrays in the wild', 1, 'talk'),
  (4, 'Closing panel: the state of SQL', 2, 'panel');
INSERT INTO schedule (talk_id, room_id, starts_at) VALUES
  (1, 1, TIMESTAMP '2027-03-04 10:00:00'),
  (2, 3, TIMESTAMP '2027-03-04 13:00:00'),
  (3, 2, TIMESTAMP '2027-03-04 15:00:00');
INSERT INTO talk_attendees (attendee_id, talk_id) VALUES
  (1, 1), (2, 1), (3, 2);

SELECT t.talk_id,
       t.title
FROM talks t
LEFT JOIN schedule s ON s.talk_id = t.talk_id
WHERE s.talk_id IS NULL
ORDER BY t.talk_id;`,
        hint: "The LEFT JOIN keeps every talk; a NULL schedule side means unscheduled. Book the panel with INSERT INTO schedule (talk_id, room_id, starts_at) VALUES (4, 2, TIMESTAMP '2027-03-04 16:00:00'); — then re-run the SELECT and watch the gap list empty out.",
      },
    ],
    terms: [
      { term: "Entity", definition: "A noun the business needs to remember — a room, a speaker, a talk. Entities become tables; their attributes become columns." },
      { term: "Surrogate key", definition: "A column invented purely to identify a row (room_id INT PRIMARY KEY) instead of reusing real-world data like an email, which can change." },
      { term: "Junction table", definition: "A table whose only job is to resolve many-to-many: one row per pairing, with a composite primary key (attendee_id, talk_id) so the same pairing can never happen twice." },
      { term: "Foreign key constraint", definition: "REFERENCES table(column) — the database refuses values that do not exist in the parent, so ghost rooms and unknown speakers are impossible." },
      { term: "CHECK constraint", definition: "A rule a column's values must satisfy — CHECK (capacity > 0), CHECK (ticket_type IN ('standard','vip')) — enforced on every insert and update." },
    ],
    mistakes: [
      {
        mistake: "Modeling attendees-attend-many-talks with a talk_id column on attendees",
        why: "A foreign key column holds one value, so each attendee could attend exactly one talk — the second signup is forced to overwrite the first, and history is silently destroyed.",
        fix: "Create a junction table talk_attendees with foreign keys to both sides and PRIMARY KEY (attendee_id, talk_id) — one row per pairing.",
      },
      {
        mistake: "Writing CREATE TABLE talks before CREATE TABLE speakers",
        why: "talks.speaker_id REFERENCES speakers(speaker_id), and PostgreSQL refuses to create a foreign key against a table that does not exist yet — the statement errors immediately.",
        fix: "Order the CREATEs parents-first (rooms, speakers, attendees, then talks, schedule, talk_attendees), or add the constraint later with ALTER TABLE ... ADD FOREIGN KEY.",
      },
      {
        mistake: "Seeding only the happy path — every talk scheduled, every talk signed-up",
        why: "The inner-join seat count in this lesson returns two talks instead of three and looks perfectly plausible; without an unscheduled talk and a zero-signup talk in the data, the bug is invisible.",
        fix: "Plant the awkward rows on purpose — one talk with no slot, one talk with no signups — then re-run the report and check it still tells the truth.",
      },
    ],
    takeaways: [
      "Nouns become tables, verbs become foreign keys — read the requirements twice, write the DDL once.",
      "Many-to-many is always two one-to-manys meeting in a junction table whose primary key is the pair.",
      "Constraints are the requirements translated: the database enforces them at write time, every time.",
      "Seed the awkward cases on purpose — the unscheduled talk and the empty workshop are what make queries prove themselves.",
    ],
    quiz: [
      {
        id: "j-04-q1",
        prompt: "Attendees can sign up for many talks, and talks can be attended by many attendees. Which design implements that?",
        options: [
          { text: "A junction table talk_attendees with foreign keys to both sides and PRIMARY KEY (attendee_id, talk_id)", correct: true, feedback: "Exactly — one row per pairing, and the composite key makes a duplicate signup impossible." },
          { text: "A talk_id foreign key column on attendees", correct: false, feedback: "A column holds one value — each attendee could attend only one talk, and the second signup would overwrite the first." },
          { text: "An attendee_id foreign key column on talks", correct: false, feedback: "The mirror image of the same trap: a talk could then have only one attendee." },
          { text: "Storing attendee ids in a TEXT column on talks", correct: false, feedback: "It works until you need a foreign key, a count or a join — comma-separated ids are a file, not a relationship." },
        ],
        explanation: "Many-to-many always resolves the same way: a junction table whose composite primary key is the pair of foreign keys — duplicates impossible, both directions joinable.",
      },
      {
        id: "j-04-q2",
        prompt: "INSERT INTO schedule (talk_id, room_id, starts_at) VALUES (4, 999, TIMESTAMP '2027-03-04 16:00:00') fails. Why?",
        options: [
          { text: "Room 999 does not exist in rooms — the foreign key on schedule(room_id) refuses the insert", correct: true, feedback: "That is the constraint doing exactly what the requirements promised: no ghost rooms." },
          { text: "Talk 4 does not exist in talks", correct: false, feedback: "Talk 4 exists — it is the closing panel, seeded but deliberately unscheduled." },
          { text: "TIMESTAMP values need a time zone to be inserted", correct: false, feedback: "A plain timestamp is perfectly legal; time zones are a type choice, not an insert requirement." },
          { text: "schedule requires every room to be used exactly once", correct: false, feedback: "The UNIQUE constraint sits on talk_id — one slot per talk — not on room_id; rooms can host many talks." },
        ],
        explanation: "Foreign keys are checked at write time: the value must exist in the parent table or the whole statement is refused before any row lands.",
      },
      {
        id: "j-04-q3",
        prompt: "Why does the seat-pressure query LEFT JOIN talk_attendees instead of joining normally?",
        options: [
          { text: "So scheduled talks with zero signups still appear, with count(sa.attendee_id) reporting an honest 0", correct: true, feedback: "The LEFT JOIN keeps the talk row; counting a nullable column from the right side turns no-matches into a real zero." },
          { text: "Because an inner join would be a syntax error here", correct: false, feedback: "It is perfectly legal — it just silently drops zero-signup talks, which is worse than an error." },
          { text: "To make the query faster", correct: false, feedback: "Speed is not the issue; existence is. LEFT JOIN is about which rows survive, not how quickly." },
          { text: "Because talk_attendees has no primary key", correct: false, feedback: "It has one — the composite (attendee_id, talk_id) — and it plays no part in the join choice." },
        ],
        explanation: "In reporting, LEFT JOIN is how you say keep the left side no matter what — and counting a nullable column from the right turns absence into an honest zero.",
      },
    ],
  },
  {
    slug: "j-05",
    title: "Advanced SQL I — UPSERT and MERGE",
    minutes: 14,
    summary:
      "Feeds re-deliver the same rows every night: make INSERT idempotent with ON CONFLICT DO NOTHING and DO UPDATE ... EXCLUDED, collect receipts with RETURNING, and mirror a whole table with MERGE — deletes included.",
    kind: "coding",
    objectives: [
      "Explain why re-running a plain INSERT fails, and what idempotent means for a nightly feed",
      "Skip conflicting rows with ON CONFLICT DO NOTHING",
      "Overwrite them deliberately with ON CONFLICT (target) DO UPDATE ... EXCLUDED",
      "Get a per-row receipt from RETURNING — including the honest empty receipt from DO NOTHING",
      "Mirror a whole source table with MERGE, including WHEN NOT MATCHED BY SOURCE THEN DELETE",
    ],
    why: "Feeds are how data actually arrives: ShopSphere's suppliers send a price list every night, and they do not care that yesterday's list is still sitting in your table. A plain INSERT dies on the first duplicate primary key; a plain UPDATE ignores the new products. What you need is SQL that is idempotent — safe to run twice, safe to run at 3 a.m., safe to re-run after a crash. ON CONFLICT DO NOTHING, DO UPDATE with EXCLUDED, RETURNING receipts, and MERGE turn the feed ran again from an incident into a non-event.",
    blocks: [
      {
        kind: "text",
        text: "ShopSphere's suppliers send price lists every night. Not diffs — *whole lists* — and they neither know nor care that yesterday's list is already sitting in your `prices` table. A plain INSERT runs fine the first night and dies the second: `duplicate key value violates unique constraint \"prices_pkey\"`. A plain UPDATE is wrong in the other direction: it fixes the rows the feed mentions and never notices the brand-new products. What you need is SQL that is **idempotent** — the tenth run leaves the table in exactly the state the feed describes. That is the upsert family: `ON CONFLICT DO NOTHING`, `ON CONFLICT ... DO UPDATE` with `EXCLUDED`, `RETURNING` for receipts, and — when the feed is the whole truth — `MERGE`. No dataset today; you build the feed and the target table yourself.",
      },
      {
        kind: "sql",
        title: "The table the feed will hammer",
        code: `CREATE TABLE prices (
  product_id INT PRIMARY KEY,
  price      NUMERIC(10,2) NOT NULL CHECK (price > 0),
  updated    DATE NOT NULL
);
INSERT INTO prices (product_id, price, updated) VALUES
  (1, 1299.00, DATE '2026-01-10'),
  (2, 2199.00, DATE '2026-01-10'),
  (3,  899.00, DATE '2026-01-10');
SELECT product_id, price FROM prices ORDER BY product_id;`,
        result: { columns: ["product_id", "price"], rows: [
        ["1", "1299.00"],
        ["2", "2199.00"],
        ["3", "899.00"],
      ] },
        explain: [
          "The target table: three products with prices and a last-updated date, product_id as the primary key, and CHECK (price > 0) to keep the feed honest.",
          "This is ShopSphere's world in miniature — the catalog table that a supplier's nightly price feed will hammer, every night, forever.",
          "The output is the three-row table: the before picture that every following block will be measured against.",
        ],
      },
      {
        kind: "sql",
        title: "ON CONFLICT DO NOTHING: skip what exists",
        code: `INSERT INTO prices (product_id, price, updated)
VALUES (1, 1199.00, DATE '2026-11-14')
ON CONFLICT (product_id) DO NOTHING;
SELECT product_id, price FROM prices ORDER BY product_id;`,
        result: { columns: ["product_id", "price"], rows: [
        ["1", "1299.00"],
        ["2", "2199.00"],
        ["3", "899.00"],
      ] },
        explain: [
          "The feed says product 1 costs 1199.00 — but product 1 already exists, and a plain INSERT would have died right there on the primary key.",
          "ON CONFLICT (product_id) DO NOTHING catches the collision and skips the row instead of failing. The statement completes; nothing changed.",
          "The SELECT proves it: product 1 still costs 1299.00. This flavor is right when the feed means new products only — existing rows are left strictly alone.",
        ],
      },
      {
        kind: "sql",
        title: "ON CONFLICT DO UPDATE: overwrite with EXCLUDED",
        code: `INSERT INTO prices (product_id, price, updated)
VALUES (1, 1199.00, DATE '2026-11-14')
ON CONFLICT (product_id)
DO UPDATE SET price = EXCLUDED.price, updated = EXCLUDED.updated;
SELECT product_id, price, updated FROM prices ORDER BY product_id;`,
        result: { columns: ["product_id", "price", "updated"], rows: [
        ["1", "1199.00", "2026-11-14"],
        ["2", "2199.00", "2026-01-10"],
        ["3", "899.00", "2026-01-10"],
      ] },
        explain: [
          "Same statement, different ending: ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price, updated = EXCLUDED.updated.",
          "EXCLUDED is the row you tried to insert — the one that lost the conflict. EXCLUDED.price is 1199.00, this feed's value; an unqualified price would mean the row that won, the old 1299.00 still sitting in the table.",
          "The SELECT shows product 1 moved to 1199.00 with updated stamped 2026-11-14, while products 2 and 3 keep their January dates. Insert-or-update — the upsert.",
        ],
      },
      {
        kind: "sql",
        title: "RETURNING: a receipt for the update",
        code: `INSERT INTO prices (product_id, price, updated)
VALUES (2, 2099.00, DATE '2026-11-14')
ON CONFLICT (product_id)
DO UPDATE SET price = EXCLUDED.price, updated = EXCLUDED.updated
RETURNING product_id, price;`,
        result: { columns: ["product_id", "price"], rows: [
        ["2", "2099.00"],
      ] },
        explain: [
          "Add RETURNING product_id, price and the write becomes a query: the block's output is the affected row itself — product 2, now 2099.00.",
          "Without RETURNING you would need a second SELECT to learn what happened — and in a busy feed, a second statement can observe a different state of the world. RETURNING is atomic truth: this row, this statement, this moment.",
        ],
      },
      {
        kind: "sql",
        title: "RETURNING with DO NOTHING: the honest empty receipt",
        code: `INSERT INTO prices (product_id, price, updated)
VALUES (2, 2099.00, DATE '2026-11-14')
ON CONFLICT (product_id) DO NOTHING
RETURNING product_id, price;`,
        result: { columns: ["product_id", "price"], rows: [], command: "INSERT" },
        explain: [
          "Same feed row, same RETURNING — but the DO NOTHING branch took over, and the output is empty: zero rows.",
          "That empty result is not a bug; it is the receipt. RETURNING emits one row per row actually inserted or updated, and DO NOTHING did neither.",
          "An application reading this output can tell the difference between updated to 2099.00 and skipped, untouched — without querying the table again.",
        ],
      },
      {
        kind: "sql",
        title: "A conflict target with no arbiter",
        code: `CREATE TABLE stock_notes (note_id INT PRIMARY KEY, sku TEXT, qty INT);
INSERT INTO stock_notes VALUES (1, 'A-1', 10), (2, 'B-2', 20);
INSERT INTO stock_notes (note_id, sku, qty) VALUES (3, 'A-1', 30)
ON CONFLICT (sku) DO UPDATE SET qty = EXCLUDED.qty;`,
        expectError: "there is no unique or exclusion constraint matching the ON CONFLICT specification",
        explain: [
          "stock_notes has a primary key on note_id — but sku, the column named in ON CONFLICT (sku), has no UNIQUE constraint and no unique index. The seed even contains a genuine sku duplicate: A-1 sits in row 1 and in the row you are inserting, so the conflict is real.",
          "PostgreSQL refuses the statement: there is no unique or exclusion constraint matching the ON CONFLICT specification. The conflict target must be backed by an arbiter — a primary key, a UNIQUE constraint, or a unique index — because that index is the machinery that detects the collision at all.",
          "The fix is on the design side: add UNIQUE (sku) to stock_notes, after which ON CONFLICT (sku) works. Upserts are only ever as good as the constraints beneath them.",
        ],
      },
      {
        kind: "sql",
        title: "MERGE: match a source, update or insert",
        code: `CREATE TABLE price_updates (
  product_id INT PRIMARY KEY,
  price      NUMERIC(10,2) NOT NULL CHECK (price > 0)
);
INSERT INTO price_updates (product_id, price) VALUES
  (1, 1099.00),
  (3,  849.00),
  (4,  399.00);
MERGE INTO prices AS t
USING price_updates AS s
  ON t.product_id = s.product_id
WHEN MATCHED THEN
  UPDATE SET price = s.price, updated = DATE '2026-11-14'
WHEN NOT MATCHED THEN
  INSERT (product_id, price, updated)
  VALUES (s.product_id, s.price, DATE '2026-11-14');
SELECT product_id, price, updated FROM prices ORDER BY product_id;`,
        result: { columns: ["product_id", "price", "updated"], rows: [
        ["1", "1099.00", "2026-11-14"],
        ["2", "2099.00", "2026-11-14"],
        ["3", "849.00", "2026-11-14"],
        ["4", "399.00", "2026-11-14"],
      ] },
        explain: [
          "A bigger problem: the feed is now a table, price_updates, with three rows — an update for product 1, an update for 3, and a brand-new product 4. ON CONFLICT handles rows one at a time; MERGE matches the whole source against the whole target.",
          "WHEN MATCHED THEN UPDATE: products 1 and 3 exist, so their prices become 1099.00 and 849.00, updated stamped 2026-11-14. WHEN NOT MATCHED THEN INSERT: product 4 is new, so it is born at 399.00.",
          "The SELECT shows four rows — three touched by the feed plus product 2, untouched because the feed never mentioned it. Every row now carries the 2026-11-14 stamp except that product 2 got there in an earlier block.",
          "And that last fact is the crack in upsert's armor: product 2 was withdrawn from the feed, but no INSERT ... ON CONFLICT can ever delete it. For that, you need the next block.",
        ],
      },
      {
        kind: "sql",
        title: "MERGE, full sync: delete what the feed dropped",
        code: `MERGE INTO prices AS t
USING price_updates AS s
  ON t.product_id = s.product_id
WHEN MATCHED THEN
  UPDATE SET price = s.price
WHEN NOT MATCHED THEN
  INSERT (product_id, price, updated)
  VALUES (s.product_id, s.price, DATE '2026-11-14')
WHEN NOT MATCHED BY SOURCE THEN
  DELETE;
SELECT product_id, price FROM prices ORDER BY product_id;`,
        result: { columns: ["product_id", "price"], rows: [
        ["1", "1099.00"],
        ["3", "849.00"],
        ["4", "399.00"],
      ] },
        explain: [
          "MERGE grows a third branch: WHEN NOT MATCHED BY SOURCE THEN DELETE — target rows that the source no longer mentions are removed. Product 2 is in prices but not in price_updates, so it goes.",
          "The SELECT confirms it: products 1, 3 and 4 exactly — the table is now a mirror of the feed, not an archive of everything ever fed.",
          "That is the ETL moral, the whole lesson in one sentence: DO NOTHING and DO UPDATE keep everything ever seen; MERGE with BY SOURCE makes the target agree with the source. Never lose a price and the feed is the truth are both legitimate business rules — but they are different systems, and SQL lets you build either one on purpose.",
        ],
      },
    ],
    terms: [
      { term: "UPSERT", definition: "INSERT's conflict-aware form: insert if new, and if the row already exists do something chosen — nothing, or an update. Safe to re-run." },
      { term: "Conflict target", definition: "The column(s) in ON CONFLICT (...) that define what already exists means; it must be backed by a unique or exclusion constraint — the arbiter that detects the collision." },
      { term: "EXCLUDED", definition: "The pseudo-table holding the row you attempted to insert — the one that lost the conflict. EXCLUDED.price is this feed's value." },
      { term: "RETURNING", definition: "A clause that turns a write into a query: it emits the affected rows, so your application gets a receipt without a second SELECT." },
      { term: "MERGE", definition: "The full-sync statement: match a target table against a source, then UPDATE, INSERT or DELETE per branch — including rows that vanished from the source." },
    ],
    mistakes: [
      {
        mistake: "ON CONFLICT (sku) DO UPDATE on a column with no unique constraint",
        why: "The conflict target is the arbiter — PostgreSQL uses a unique or exclusion index to detect the conflict, and with none on sku there is nothing to detect with, so the statement fails.",
        fix: "Target a column with a primary key or UNIQUE constraint, or add one: ALTER TABLE ... ADD CONSTRAINT ... UNIQUE (sku).",
      },
      {
        mistake: "DO UPDATE SET price = 1199.00 — copying the feed's literal into the statement",
        why: "It works tonight and lies forever after: tomorrow's feed also sets 1199.00 no matter what it actually says, and the mismatch is invisible in the logs.",
        fix: "Reference EXCLUDED.price — the value this feed tried to insert — so the statement updates with whatever arrives, forever.",
      },
      {
        mistake: "Expecting INSERT ... ON CONFLICT to remove rows the feed stopped sending",
        why: "Upserts only touch rows the feed mentions; a withdrawn product simply never appears again, yet stays in the table with a healthy-looking old price.",
        fix: "When the feed is the full truth, use MERGE with WHEN NOT MATCHED BY SOURCE THEN DELETE — the only branch that can remove target rows.",
      },
    ],
    takeaways: [
      "ON CONFLICT turns INSERT from a once-only statement into a feed-safe one — idempotent by design.",
      "EXCLUDED is the row that lost the conflict; the unqualified column is the row that won — mix them up and you overwrite today with yesterday.",
      "RETURNING is your receipt: one row per insert-or-update, and an honest zero rows from DO NOTHING.",
      "When the feed is the whole truth, MERGE ... WHEN NOT MATCHED BY SOURCE THEN DELETE makes the table a mirror, not an archive.",
    ],
    quiz: [
      {
        id: "j-05-q1",
        prompt: "Inside ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price — what is EXCLUDED?",
        options: [
          { text: "The row this statement tried to insert — the one that lost the conflict", correct: true, feedback: "EXCLUDED.price is the feed's value; the unqualified price is the row that won, already in the table." },
          { text: "The row already stored in prices", correct: false, feedback: "That is the target row — you reach it with the plain column name, like SET price = prices.price for the old value." },
          { text: "Every row the statement skipped", correct: false, feedback: "There is no skipped-set here — EXCLUDED is exactly the conflicting candidate row." },
          { text: "A keyword for deleting the losing row", correct: false, feedback: "Nothing is deleted — EXCLUDED is just a name for the incoming row, waiting to be read." },
        ],
        explanation: "Think of it as winner and loser: the table row is addressed by bare column names, the rejected insert row by EXCLUDED.column — DO UPDATE is where the two finally meet.",
      },
      {
        id: "j-05-q2",
        prompt: "ON CONFLICT (sku) fails with there is no unique or exclusion constraint matching the ON CONFLICT specification. What is missing?",
        options: [
          { text: "A unique constraint or index on sku — the arbiter that detects the conflict", correct: true, feedback: "Without an index on the target, PostgreSQL has no way to notice two rows claiming the same sku." },
          { text: "The VALUES list needs more columns", correct: false, feedback: "The statement's shape is fine; the failure is about the schema, not the column list." },
          { text: "ON CONFLICT only works on primary keys, and sku is not one", correct: false, feedback: "Any primary key, UNIQUE constraint or exclusion constraint works — sku simply has none of them." },
          { text: "A WHERE clause before DO UPDATE", correct: false, feedback: "A WHERE on the update branch is optional refinement; the error would be identical with or without it." },
        ],
        explanation: "The conflict target must name a constraint that guarantees uniqueness — that index is the machinery that detects the collision in the first place.",
      },
      {
        id: "j-05-q3",
        prompt: "The feed is the complete truth and product 2 has been withdrawn from it. Your nightly job runs INSERT ... SELECT ... ON CONFLICT DO UPDATE. What happens to product 2?",
        options: [
          { text: "Nothing — upserts never delete; you need MERGE with WHEN NOT MATCHED BY SOURCE THEN DELETE", correct: true, feedback: "Rows the feed never mentions are simply never touched — removal is a separate, deliberate branch." },
          { text: "It is deleted automatically", correct: false, feedback: "No INSERT variant deletes rows; that is precisely the gap MERGE was standardized to fill." },
          { text: "The statement errors because a row is missing from the feed", correct: false, feedback: "Absent rows are not an error — they are just silence, which is exactly the problem." },
          { text: "Its price is set to NULL", correct: false, feedback: "Nothing writes to the row at all — it keeps its old price and old date, looking alive forever." },
        ],
        explanation: "The ETL moral: DO NOTHING and DO UPDATE keep everything ever seen; only MERGE's BY SOURCE branch can make the target agree with the source when the source shrinks.",
      },
    ],
  },
  {
    slug: "j-06",
    title: "Advanced SQL II — JSON, arrays and set mastery",
    minutes: 14,
    summary:
      "The finale: stack results with UNION, UNION ALL, INTERSECT and EXCEPT to find returners and the quietly-lapsed, then meet jsonb and text[] — ->, ->>, @> containment, jsonb_build_object, = ANY, array_agg and unnest — and close the course with where to go next.",
    kind: "coding",
    objectives: [
      "Stack and compare query results with UNION, UNION ALL, INTERSECT and EXCEPT",
      "Drill into jsonb with -> (stay jsonb) and ->> (get text) — and know why the difference bites in WHERE",
      "Filter documents with the @> containment operator and build new ones with jsonb_build_object",
      "Work with text[] arrays: test membership with = ANY, aggregate with array_agg, explode with unnest",
    ],
    why: "The last two superpowers, and both answer the same complaint: the data does not arrive shaped like your tables. Real questions often need answers stitched from two populations that never met — everyone who ordered or reviewed, the buyers who came back, the customers who quietly left — and that is set operations: UNION, UNION ALL, INTERSECT, EXCEPT. And real columns are no longer always neat scalars: product specs arrive as nested JSON, tags arrive as arrays, and PostgreSQL stores both natively — jsonb and text[] — with operators to drill in, filter and rebuild. This is modern SQL: relational where it fits, document-shaped where it must be.",
    blocks: [
      {
        kind: "text",
        text: "Two superpowers in one finale, and both answer the same complaint: *the data does not come shaped like my tables.* First, **set operations** — `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` — which stitch query results together when the answer lives across two populations: who came back, who left quietly. Then **jsonb and text[]** — PostgreSQL's native types for document-shaped and stack-shaped data — with operators to drill in (`->`, `->>`), to filter (`@>` containment, `= ANY`), and to build (`jsonb_build_object`, `array_agg`). ShopSphere supplies the customers; Trailhead Outdoors supplies the messy gear catalog. This lesson's blocks run on different databases — watch each block's label.",
      },
      {
        kind: "sql",
        title: "UNION vs UNION ALL: who, versus how many events",
        dataset: "ecommerce",
        code: `SELECT (SELECT count(*) FROM (
          SELECT customer_id FROM orders
          WHERE order_date >= DATE '2026-01-01'
          UNION
          SELECT customer_id FROM reviews
          WHERE created_at >= DATE '2026-01-01'
        ) AS u_dedupe) AS distinct_customers,
       (SELECT count(*) FROM (
          SELECT customer_id FROM orders
          WHERE order_date >= DATE '2026-01-01'
          UNION ALL
          SELECT customer_id FROM reviews
          WHERE created_at >= DATE '2026-01-01'
        ) AS u_all) AS all_rows;`,
        result: { columns: ["distinct_customers", "all_rows"], rows: [
        ["14", "18"],
      ] },
        explain: [
          "Two counts in one result: distinct_customers uses UNION, all_rows uses UNION ALL — the same two queries underneath, one operator apart.",
          "The top half is everyone who ordered in 2026 plus everyone who reviewed in 2026. UNION deduplicates the stack, so a customer who did both is counted once: the number of distinct humans.",
          "UNION ALL keeps every row, so all_rows is the bigger number — the same people, counted once per 2026 order and once per 2026 review. The gap between the two counts is exactly the repeats.",
          "Rule of thumb: UNION when the question is who; UNION ALL when the question is how many events — or when you know the sets are disjoint and want the cheaper plan.",
        ],
      },
      {
        kind: "sql",
        title: "INTERSECT: the customers who came back",
        dataset: "ecommerce",
        code: `SELECT customer_id FROM orders WHERE order_date < DATE '2025-01-01'
INTERSECT
SELECT customer_id FROM orders WHERE order_date >= DATE '2026-01-01'
ORDER BY customer_id;`,
        result: { columns: ["customer_id"], rows: [
        ["1"],
        ["2"],
        ["3"],
        ["5"],
        ["7"],
        ["11"],
        ["12"],
      ] },
        explain: [
          "Both halves come from the same table this time: customers who bought before 2025 above, customers who bought in 2026 below. INTERSECT keeps only the customer_ids in both — the returners, back after a year or more away.",
          "Like UNION, INTERSECT deduplicates: one row per customer, no matter how many orders sit on each side of the operator.",
          "The ORDER BY applies to the whole result — set operations output an unordered set, so the final ordering is yours to add.",
        ],
      },
      {
        kind: "sql",
        title: "EXCEPT: the customers who quietly left",
        dataset: "ecommerce",
        code: `SELECT c.first_name || ' ' || c.last_name AS customer
FROM (SELECT customer_id FROM orders
      WHERE order_date >= DATE '2025-01-01' AND order_date < DATE '2026-01-01'
      EXCEPT
      SELECT customer_id FROM orders WHERE order_date >= DATE '2026-01-01') AS s
JOIN customers c ON c.customer_id = s.customer_id
ORDER BY c.customer_id;`,
        result: { columns: ["customer"], rows: [
        ["Diego Alvarez"],
        ["Tom Fletcher"],
        ["Nina Patel"],
        ["Owen Davis"],
        ["Elena Petrova"],
        ["Noah Berger"],
      ] },
        explain: [
          "EXCEPT keeps what is in the first set but not in the second: bought during 2025, silent all of 2026 — the quietly lapsed, ShopSphere's at-risk list, with names attached.",
          "The set operation runs first inside the subquery; its result is then joined to customers for the names. Set operations compose like any subquery — they are not a special mode.",
          "Notice what the three operators give you together: new versus returning versus lapsed, one operator per population — no DISTINCT, no OR-chain, no window-function gymnastics.",
        ],
      },
      {
        kind: "sql",
        title: "A table with a jsonb column and a text[] column",
        code: `DROP TABLE IF EXISTS gear CASCADE;
CREATE TABLE gear (
  gear_id  INT PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT NOT NULL,
  specs    JSONB NOT NULL,
  tags     TEXT[] NOT NULL
);
INSERT INTO gear VALUES
 (1, 'TerraLight 30 Pack',  'packs',   '{"weight_g": 890, "color": "orange", "waterproof": true, "materials": {"body": "ripstop", "frame": "alloy"}}', ARRAY['ultralight','rain']),
 (2, 'NimbusShell Jacket',  'apparel', '{"weight_g": 320, "color": "blue", "waterproof": true, "materials": {"body": "nylon"}}', ARRAY['rain','packable']),
 (3, 'BaseCamp Stove',      'camp',    '{"weight_g": 1200, "color": "silver", "fuel": "gas", "materials": {"body": "steel"}}', ARRAY['car-camping']);
SELECT name,
       specs -> 'materials'  AS materials_jsonb,
       specs ->> 'materials' AS materials_text,
       specs -> 'color'      AS color_jsonb,
       specs ->> 'color'     AS color_text,
       tags
FROM gear
ORDER BY gear_id;`,
        result: { columns: ["name", "materials_jsonb", "materials_text", "color_jsonb", "color_text", "tags"], rows: [
        ["TerraLight 30 Pack", "{\"body\":\"ripstop\",\"frame\":\"alloy\"}", "{\"body\": \"ripstop\", \"frame\": \"alloy\"}", "orange", "orange", "[\"ultralight\",\"rain\"]"],
        ["NimbusShell Jacket", "{\"body\":\"nylon\"}", "{\"body\": \"nylon\"}", "blue", "blue", "[\"rain\",\"packable\"]"],
        ["BaseCamp Stove", "{\"body\":\"steel\"}", "{\"body\": \"steel\"}", "silver", "silver", "[\"car-camping\"]"],
      ] },
        explain: [
          "Trailhead Outdoors' catalog, redesigned: fixed columns (name, category) for what every product has, one jsonb column specs for what only some have, and a text[] column tags for labels that stack.",
          "jsonb — not json — is the type that matters: it stores the document parsed and normalized, whitespace gone, keys reordered, which is what makes operators, comparisons and indexes possible. Plain json keeps the original text and can do almost none of this.",
          "materials_jsonb and materials_text print identically — but -> returns jsonb, which chains (specs -> 'materials' ->> 'body' drills on to 'ripstop' as text), while ->> returns text and stops. The difference is the type, and you see it plainly on scalars:",
          "color_jsonb is \"orange\" — a jsonb string, quotes and all — while color_text is orange, plain text. That quote difference is why filtering on scalars needs ->>: specs ->> 'color' = 'orange' matches, while specs -> 'color' = 'orange' is not even a valid comparison of like with like.",
          "And tags renders as {ultralight,rain} — an array: one column, many values, no junction table required.",
        ],
      },
      {
        kind: "sql",
        title: "Containment (@>) and jsonb_build_object",
        code: `SELECT jsonb_build_object(
         'item', name,
         'weight_g', specs -> 'weight_g',
         'tags', to_jsonb(tags)
       ) AS listing
FROM gear
WHERE specs @> '{"waterproof": true}'::jsonb
ORDER BY gear_id;`,
        result: { columns: ["listing"], rows: [
        ["{\"item\":\"TerraLight 30 Pack\",\"tags\":[\"ultralight\",\"rain\"],\"weight_g\":890}"],
        ["{\"item\":\"NimbusShell Jacket\",\"tags\":[\"rain\",\"packable\"],\"weight_g\":320}"],
      ] },
        explain: [
          "The WHERE uses @>, containment: does specs contain the fragment {\"waterproof\": true}? The TerraLight and the NimbusShell do; the BaseCamp Stove has fuel but no waterproof key, so it is out. The two listings in the output are the answer to the containment question.",
          "Containment beats key-by-key equality: it checks a whole fragment in one operator, works at any nesting depth, and — unlike ->> comparisons — it is the operator a GIN index can accelerate.",
          "jsonb_build_object assembles a fresh document per row: item from the name column, weight_g drilled out of specs with -> (staying jsonb, so 890 remains a number), and tags converted from a text[] array to a jsonb array by to_jsonb.",
          "That is the full loop — SQL reading documents (->, ->>, @>) and SQL writing them (jsonb_build_object, to_jsonb): a relational database that speaks JSON when the data insists on it.",
        ],
      },
      {
        kind: "sql",
        title: "= ANY: membership in an array",
        code: `SELECT name, tags FROM gear WHERE 'rain' = ANY (tags) ORDER BY gear_id;`,
        result: { columns: ["name", "tags"], rows: [
        ["TerraLight 30 Pack", "[\"ultralight\",\"rain\"]"],
        ["NimbusShell Jacket", "[\"rain\",\"packable\"]"],
      ] },
        explain: [
          "'rain' = ANY (tags) asks: does the tags array contain 'rain'? ANY is the array-side of IN — the value on the left, the array on the right.",
          "Two rows match: the TerraLight 30 Pack (ultralight, rain) and the NimbusShell Jacket (rain, packable). The BaseCamp Stove, tagged only car-camping, stays out.",
          "The mistakes this replaces are worth naming: 'rain' IN tags errors because IN wants a list of scalars or a subquery, and tags = 'rain' compares a whole array to one text value. An array column needs = ANY — or the containment form tags @> ARRAY['rain'].",
        ],
      },
      {
        kind: "sql",
        title: "unnest and array_agg: the tag census",
        code: `SELECT tag,
       count(*) AS items,
       array_agg(name ORDER BY gear_id) AS gear_names
FROM (SELECT name, gear_id, unnest(tags) AS tag FROM gear) AS t
GROUP BY tag
ORDER BY tag;`,
        result: { columns: ["tag", "items", "gear_names"], rows: [
        ["car-camping", "1", "[\"BaseCamp Stove\"]"],
        ["packable", "1", "[\"NimbusShell Jacket\"]"],
        ["rain", "2", "[\"TerraLight 30 Pack\",\"NimbusShell Jacket\"]"],
        ["ultralight", "1", "[\"TerraLight 30 Pack\"]"],
      ] },
        explain: [
          "unnest explodes each tags array into one row per element — the subquery turns 3 gear rows into 4 tag rows — and from there it is plain GROUP BY: every tag, and how many items carry it.",
          "array_agg is unnest's mirror image: it collects values back into an array, one array per group. The rain group collects both the TerraLight and the NimbusShell; car-camping, packable and ultralight each collect a single name.",
          "This tag census is a real query pattern — labels in, counted and listed categories out — and it shows off the round trip: arrays exist so one column can hold many values, and unnest exists so GROUP BY can still see inside.",
        ],
      },
      {
        kind: "steps",
        title: "Closing the course: the path from a-01 to here",
        items: [
          "Look how far the road actually went. a-01 opened with what a database even is; since then you have learned to select and filter, to join tables honestly, to group and aggregate, to write functions over text and dates, to design a schema from a blank page, and — this part — to sync feeds and reshape documents. That is not a tutorial you finished. That is a working skill set.",
          "The case studies (#/sql/cases) are the next room: six businesses — ShopSphere's store, Meridian Trust's branch bank, the hospital, the university, the retailer, the HR desk — each with real questions and no bolded answers. Go be the analyst.",
          "The SQL lab (#/sql/lab) stays open: a live editor connected to every sample database. Keep your hands on the keys — a week without queries and the fluency starts to fade.",
          "Be honest about what is next, because this course was honest with you: correctness came first here, and it should have. Performance at scale is its own study — EXPLAIN ANALYZE to read what the planner chose, indexes beyond the primary key, and partitioning when tables grow past comfort.",
          "Master psql, the tool professionals actually live in: \\d to inspect schema, \\copy to move data, \\timing to measure. Fluency in the terminal is a quiet superpower.",
          "And then build one real thing of your own: a schema for something you care about, fed by something messy. The graduation that matters is the first query you write that nobody assigned.",
          "You earned this. Ten parts, six databases, and every error message along the way was a lesson too. Congratulations — go ask a database something worth asking.",
        ],
      },
    ],
    terms: [
      { term: "Set operation", definition: "An operator that combines two query results: UNION (all rows, deduplicated), UNION ALL (all rows, as-is), INTERSECT (in both), EXCEPT (in the first, not the second)." },
      { term: "jsonb", definition: "PostgreSQL's parsed, normalized binary JSON type — operators, comparisons and indexes all work. Plain json keeps the original text and little else." },
      { term: "Containment (@>)", definition: "The jsonb operator asking does the left document contain the right fragment — specs @> '{\"waterproof\": true}' matches any document carrying that exact pair." },
      { term: "ANY", definition: "The array membership comparison: 'rain' = ANY (tags) is true when tags contains 'rain' — the array-side form of IN." },
      { term: "unnest", definition: "The function that expands an array into rows — one row per element — so GROUP BY and joins can see inside it. array_agg is its mirror, collecting rows back into an array." },
    ],
    mistakes: [
      {
        mistake: "Writing UNION when the question is how many events",
        why: "UNION deduplicates the combined result, so a customer with three 2026 orders and a review collapses into one row — the count silently answers how many people instead.",
        fix: "Use UNION ALL for concatenation and event counts; reserve UNION for questions about the distinct members of a population.",
      },
      {
        mistake: "Filtering with specs -> 'color' = 'orange'",
        why: "-> returns jsonb — the value \"orange\" with its quotes — and PostgreSQL has no jsonb = text operator, so the comparison itself is invalid and the query fails.",
        fix: "Use ->> to unwrap scalars to text: specs ->> 'color' = 'orange'.",
      },
      {
        mistake: "'rain' IN tags on a text[] column",
        why: "IN compares a value against a list of scalar expressions or a subquery; an array column is a single array value, not a list, so PostgreSQL raises an operator error.",
        fix: "Use the array form: 'rain' = ANY (tags), or containment: tags @> ARRAY['rain'].",
      },
      {
        mistake: "Declaring the column JSON instead of JSONB",
        why: "json stores the document as its original text — key order and whitespace preserved, no containment operator, no indexing, almost no tooling.",
        fix: "Use jsonb: parsed, normalized, operator-rich and indexable. Keep json only for the rare case a document must round-trip byte-for-byte.",
      },
    ],
    takeaways: [
      "UNION deduplicates, UNION ALL concatenates — the counts differ by exactly the repeats, so pick per question.",
      "-> stays jsonb and chains; ->> unwraps to text and stops — scalars in WHERE belong to ->>.",
      "@> asks does this document contain that fragment — one operator, any depth, and the one an index can help with.",
      "Arrays round-trip: = ANY asks membership, array_agg collects, unnest explodes — and then it is just rows again.",
    ],
    quiz: [
      {
        id: "j-06-q1",
        prompt: "You count (SELECT customer_id FROM orders_2026 UNION SELECT customer_id FROM reviews_2026) and then the same two queries with UNION ALL. What is always true?",
        options: [
          { text: "The UNION ALL count is greater than or equal to the UNION count — the gap is every duplicated customer_id", correct: true, feedback: "UNION deduplicates the stack; UNION ALL keeps one row per underlying row, repeats included." },
          { text: "The UNION count is greater", correct: false, feedback: "Deduplication can only remove rows, never add them — UNION can never out-count UNION ALL." },
          { text: "They are always equal", correct: false, feedback: "Equal only when no customer appears in both sets or twice within one — a coincidence, not a law." },
          { text: "UNION ALL fails when the two queries return different column counts", correct: false, feedback: "Both operators require compatible columns — that rule is shared, not a difference between them." },
        ],
        explanation: "Pick by question: UNION for how many people, UNION ALL for how many events — the operators differ by exactly the deduplication step.",
      },
      {
        id: "j-06-q2",
        prompt: "SELECT name FROM gear WHERE specs -> 'color' = 'orange' — what happens?",
        options: [
          { text: "An error: -> returns jsonb and there is no jsonb = text operator — use ->> to unwrap the scalar", correct: true, feedback: "'orange' on the right is text; the jsonb on the left cannot be compared to it with =." },
          { text: "It returns the orange gear", correct: false, feedback: "It never gets that far — the comparison itself is invalid, and PostgreSQL refuses loudly." },
          { text: "It returns no rows, silently", correct: false, feedback: "A silent empty result would be worse — but PostgreSQL stops you before that, at the operator." },
          { text: "It works, because ->> and -> are interchangeable in WHERE", correct: false, feedback: "They are not: -> keeps jsonb, ->> unwraps to text — only ->> compares cleanly to a text literal." },
        ],
        explanation: "The two arrows differ by return type: -> gives jsonb (chainable), ->> gives text (terminal). The quoted jsonb string \"orange\" is not the text orange — and = will not pretend otherwise.",
      },
      {
        id: "j-06-q3",
        prompt: "tags is a text[] column. Which WHERE clause finds the gear tagged 'rain'?",
        options: [
          { text: "WHERE 'rain' = ANY (tags)", correct: true, feedback: "ANY compares the left value against every element of the right array — the array-side form of IN." },
          { text: "WHERE 'rain' IN tags", correct: false, feedback: "IN wants a list of scalar expressions or a subquery; an array column is neither, so PostgreSQL raises an operator error." },
          { text: "WHERE tags = 'rain'", correct: false, feedback: "That compares the whole array to one text value — an array equals an array, never a scalar." },
          { text: "WHERE tags LIKE '%rain%'", correct: false, feedback: "LIKE is a scalar text operator; against an array it is a type error — and even on text it would match 'training' too." },
        ],
        explanation: "Arrays have their own comparison forms: 'rain' = ANY (tags) for membership, tags @> ARRAY['rain'] for containment — both idiomatic, both indexable.",
      },
    ],
  }
  ],
  exercises: [

  {
    id: "j-b1",
    tier: "beginner",
    mode: "sql",
    title: "Move money safely",
    prompt:
      "A Meridian Trust customer asks you to move 250.00 from their checking account (account_id 1) to their savings account (account_id 2) — two UPDATEs that must land together or not at all. Wrap the pair in a transaction: BEGIN, subtract 250.00 from account 1's balance, add 250.00 to account 2's balance, then COMMIT. Finally confirm the result with account_id, account_type and balance for accounts 1 and 2, ordered by account_id. Expected columns: account_id, account_type, balance.",
    dataset: "banking",
    sampleTables: ["accounts"],
    hint: "BEGIN ... COMMIT fence the two UPDATEs; the confirming SELECT lives after the COMMIT, outside the transaction.",
    starter: `BEGIN;

-- TODO: subtract 250.00 from account 1's balance
-- TODO: add 250.00 to account 2's balance

COMMIT;

-- TODO: account_id, account_type, balance for accounts 1 and 2,
--       ordered by account_id
`,
    solution: `BEGIN;

UPDATE accounts SET balance = balance - 250.00 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 250.00 WHERE account_id = 2;

COMMIT;

SELECT account_id, account_type, balance
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id;`,
    ordered: true,
    expected: { columns: ["account_id", "account_type", "balance"], rows: [
        ["1", "checking", "10689.50"],
        ["2", "savings", "29150.00"],
      ] },
    explanation:
      "Step by step: BEGIN opens the transaction, the first UPDATE drops account 1's checking balance to 10689.50, the second lifts account 2's savings to 29150.00, and COMMIT makes both permanent at the same instant. Had anything failed in between, a ROLLBACK would have restored both balances — no half-completed transfer can ever be visible. The final SELECT is deliberately outside the transaction: it reads the committed state and shows the two updated rows in account_id order.",
    concepts: ["transactions", "BEGIN/COMMIT", "atomicity", "UPDATE"],
  },
  {
    id: "j-b2",
    tier: "beginner",
    mode: "sql",
    title: "Fix the repeated discount",
    prompt:
      "ShopSphere's merchandising sheet j_promo_flat stores one row per product, but the promo discount depends only on the category — the same category_discount repeats on every product in a category, so updating one row leaves its siblings stale (a classic update anomaly). Keep the starter's flat-table build in your submission — it must run on a fresh copy of the database — and add the normalization fix: create j_category_discounts (category TEXT PRIMARY KEY, category_discount NUMERIC(4,2) NOT NULL), load it from j_promo_flat with a SELECT DISTINCT splitting query, then return category and category_discount ordered by category. Expected columns: category, category_discount.",
    dataset: "ecommerce",
    sampleTables: ["products"],
    hint: "SELECT DISTINCT category, category_discount FROM j_promo_flat hands you exactly the lookup rows; the PRIMARY KEY on category enforces one row per category from now on.",
    starter: `DROP TABLE IF EXISTS j_promo_flat CASCADE;
-- drop the fix table too, so re-runs stay clean
-- DROP TABLE IF EXISTS j_category_discounts CASCADE;

CREATE TABLE j_promo_flat (
  product_id        INT PRIMARY KEY,
  product_name      TEXT NOT NULL,
  category          TEXT NOT NULL,
  category_discount NUMERIC(4,2) NOT NULL
);

INSERT INTO j_promo_flat (product_id, product_name, category, category_discount) VALUES
  (1,  'Aurora 14 Laptop',     'laptops',   0.05),
  (2,  'Aurora 16 Pro Laptop', 'laptops',   0.05),
  (6,  'PulseBuds Earbuds',    'audio',     0.10),
  (11, 'Halo Smartwatch',      'wearables', 0.12),
  (12, 'Halo Watch Strap',     'wearables', 0.12);

-- See the anomaly: the discount repeats for every product in a category
SELECT * FROM j_promo_flat ORDER BY product_id;

-- TODO: create j_category_discounts (category TEXT PRIMARY KEY,
--       category_discount NUMERIC(4,2) NOT NULL)
-- TODO: load it with SELECT DISTINCT ... FROM j_promo_flat
-- TODO: return category, category_discount ordered by category
`,
    solution: `DROP TABLE IF EXISTS j_promo_flat, j_category_discounts CASCADE;

CREATE TABLE j_promo_flat (
  product_id        INT PRIMARY KEY,
  product_name      TEXT NOT NULL,
  category          TEXT NOT NULL,
  category_discount NUMERIC(4,2) NOT NULL
);

INSERT INTO j_promo_flat (product_id, product_name, category, category_discount) VALUES
  (1,  'Aurora 14 Laptop',     'laptops',   0.05),
  (2,  'Aurora 16 Pro Laptop', 'laptops',   0.05),
  (6,  'PulseBuds Earbuds',    'audio',     0.10),
  (11, 'Halo Smartwatch',      'wearables', 0.12),
  (12, 'Halo Watch Strap',     'wearables', 0.12);

CREATE TABLE j_category_discounts (
  category          TEXT PRIMARY KEY,
  category_discount NUMERIC(4,2) NOT NULL
);

INSERT INTO j_category_discounts (category, category_discount)
SELECT DISTINCT category, category_discount
FROM j_promo_flat;

SELECT category, category_discount
FROM j_category_discounts
ORDER BY category;`,
    ordered: true,
    expected: { columns: ["category", "category_discount"], rows: [
        ["audio", "0.10"],
        ["laptops", "0.05"],
        ["wearables", "0.12"],
      ] },
    explanation:
      "The flat table violates 3NF: product_id determines category, and category determines category_discount, so the discount reaches the table only through a transitive dependency — which is why it repeats and goes stale. The fix gives that dependency its own home: j_category_discounts with category as PRIMARY KEY (one row per category, enforced), loaded by SELECT DISTINCT so each category/discount pair is extracted exactly once. The final SELECT shows the three surviving lookup rows; from now on a repricing touches one row, not five.",
    concepts: ["normalization", "3NF", "update anomaly", "lookup tables"],
  },
  {
    id: "j-b3",
    tier: "beginner",
    mode: "sql",
    title: "Sync the stock feed",
    prompt:
      "ShopSphere's warehouse sends a nightly stock feed that must land in the scratch table stock_sync: brand-new products get their first row, products already present get their stock overwritten — one statement, no pre-checking which is which. Build stock_sync (product_id INT PRIMARY KEY, stock INT NOT NULL), seed it from the first three products in products (their current stock), then apply the feed as a single INSERT of rows (1, 20) and (4, 5) with ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock, returning the receipt. Your submission must run on a fresh copy of the database, so include the build and seed statements. Expected columns: product_id, stock.",
    dataset: "ecommerce",
    sampleTables: ["products"],
    ordered: false,
    hint: "One INSERT ... VALUES ... ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock RETURNING product_id, stock — EXCLUDED is the row you just tried to insert.",
    starter: `DROP TABLE IF EXISTS stock_sync;

CREATE TABLE stock_sync (
  product_id INT PRIMARY KEY,
  stock      INT NOT NULL
);

-- Seed: current stock for the first three products
INSERT INTO stock_sync (product_id, stock)
SELECT product_id, stock
FROM products
WHERE product_id <= 3;

-- TODO: upsert the feed rows (1, 20) and (4, 5)
--       ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock
--       RETURNING product_id, stock
`,
    solution: `DROP TABLE IF EXISTS stock_sync;

CREATE TABLE stock_sync (
  product_id INT PRIMARY KEY,
  stock      INT NOT NULL
);

INSERT INTO stock_sync (product_id, stock)
SELECT product_id, stock
FROM products
WHERE product_id <= 3;

INSERT INTO stock_sync (product_id, stock)
VALUES (1, 20), (4, 5)
ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock
RETURNING product_id, stock;`,
    expected: { columns: ["product_id", "stock"], rows: [
        ["1", "20"],
        ["4", "5"],
      ] },
    explanation:
      "The PRIMARY KEY on product_id is what ON CONFLICT needs: when the feed row (1, 20) collides with the seeded product 1, the DO UPDATE branch fires and overwrites stock with EXCLUDED.stock — EXCLUDED being the row the INSERT proposed, not the one already stored. Product 4 has no row yet, so it takes the plain INSERT path. RETURNING prints one receipt row per affected product, both touched by the same single statement — that is the upsert flow nightly feeds are built on.",
    concepts: ["upsert", "ON CONFLICT", "EXCLUDED", "RETURNING"],
  },
  {
    id: "j-b4",
    tier: "beginner",
    mode: "sql",
    title: "The rollback drill",
    prompt:
      "A tired on-call analyst 'cleans up' the lab system by deleting every row from lab_results — then panics before anyone notices. Rebuild the incident to show why the panic is optional: open a transaction with BEGIN, DELETE all rows from lab_results, issue ROLLBACK instead of COMMIT, and then verify the table survived by counting its rows. Report the count in a single column named lab_results. Expected columns: lab_results.",
    dataset: "hospital",
    sampleTables: ["lab_results"],
    ordered: false,
    hint: "BEGIN ... ROLLBACK is the undo fence: the DELETE really executes (its row count is even reported), but ROLLBACK discards every change the transaction made, so the follow-up SELECT sees the table untouched.",
    starter: `BEGIN;

-- TODO: delete every row from lab_results

ROLLBACK;

-- TODO: count the surviving rows as lab_results
`,
    solution: `BEGIN;

DELETE FROM lab_results;

ROLLBACK;

SELECT count(*) AS lab_results FROM lab_results;`,
    expected: { columns: ["lab_results"], rows: [
        ["34"],
      ] },
    explanation:
      "The DELETE runs inside the transaction and PostgreSQL reports how many rows it removed — but none of it is permanent yet. ROLLBACK aborts the transaction, and the write-ahead log is replayed backward: every deleted row comes back exactly as it was, indexes and all. The final count proves it: lab_results still holds its full original row count, the same number you would have seen without the incident. Compare with j-b1, where COMMIT was the point — the same fencing, opposite exit.",
    concepts: ["transactions", "ROLLBACK", "atomicity", "undo"],
  },
  {
    id: "j-i1",
    tier: "intermediate",
    mode: "sql",
    title: "Products nobody ordered",
    prompt:
      "ShopSphere's catalog team is pruning the warehouse and needs the cleanup list: products that exist in the products table but have never appeared on a single order line in order_items. Build the set difference with EXCEPT — product ids in products EXCEPT product ids in order_items — then join the survivors back to products for the readable name. Return product_id and name ordered by product_id. Expected columns: product_id, name.",
    dataset: "ecommerce",
    sampleTables: ["products", "order_items"],
    hint: "EXCEPT keeps what the left side has that the right side lacks; one column is enough for the set operation, and you join products afterwards for the name.",
    starter: `SELECT product_id
FROM products
-- TODO: EXCEPT the product_ids that appear in order_items
-- TODO: join the survivor set back to products for the name
-- TODO: product_id, name ordered by product_id
`,
    solution: `SELECT p.product_id, p.name
FROM (SELECT product_id FROM products
      EXCEPT
      SELECT product_id FROM order_items) AS never_ordered
JOIN products p ON p.product_id = never_ordered.product_id
ORDER BY p.product_id;`,
    ordered: true,
    expected: { columns: ["product_id", "name"], rows: [
        ["5", "BudgetBook 11 Everyday"],
        ["19", "RacingWheel GT Set"],
      ] },
    explanation:
      "The inner subquery is pure set logic: every product_id from products, minus every product_id that order_items has ever referenced — what survives has never been purchased. EXCEPT also de-duplicates, so a product ordered a hundred times cancels out with a single match. Only then do we join the surviving ids back to products to fetch the name; doing the set operation first keeps the join small. The result is the pruning list, two slow movers that no order has ever touched, in product_id order.",
    concepts: ["EXCEPT", "set operations", "anti-patterns", "subqueries"],
  },
  {
    id: "j-i2",
    tier: "intermediate",
    mode: "sql",
    title: "Watch the planner change its mind",
    prompt:
      "Trailhead's fulfillment analytics team wants proof, not theory, that an index changes the plan. Build the scratch table j_scans with CREATE TABLE AS SELECT from generate_series(1, 20000): scan_id as g and lane as 'lane-' || ((g % 12) + 1). Run ANALYZE so the planner has statistics, then EXPLAIN (COSTS OFF) the lookup SELECT * FROM j_scans WHERE scan_id = 4242 to see the Seq Scan. Add a PRIMARY KEY on scan_id, and EXPLAIN the exact same lookup again — the final plan is your answer. Include every setup statement in your submission (it must run on a fresh database). Expected columns: QUERY PLAN — the plan of the LAST EXPLAIN.",
    dataset: "retail",
    sampleTables: ["products"],
    ordered: false,
    hint: "EXPLAIN (COSTS OFF) keeps the plan down to its node names and conditions; ALTER TABLE j_scans ADD PRIMARY KEY (scan_id) builds the unique b-tree index for you.",
    starter: `DROP TABLE IF EXISTS j_scans CASCADE;

CREATE TABLE j_scans AS
SELECT g AS scan_id,
       'lane-' || ((g % 12) + 1) AS lane
FROM generate_series(1, 20000) AS g;

ANALYZE j_scans;

-- Before the index: the only way in is to read every block
EXPLAIN (COSTS OFF) SELECT * FROM j_scans WHERE scan_id = 4242;

-- TODO: add a PRIMARY KEY on scan_id
-- TODO: EXPLAIN (COSTS OFF) the same lookup again -- that plan is the answer
`,
    solution: `DROP TABLE IF EXISTS j_scans CASCADE;

CREATE TABLE j_scans AS
SELECT g AS scan_id,
       'lane-' || ((g % 12) + 1) AS lane
FROM generate_series(1, 20000) AS g;

ANALYZE j_scans;

EXPLAIN (COSTS OFF) SELECT * FROM j_scans WHERE scan_id = 4242;

ALTER TABLE j_scans ADD PRIMARY KEY (scan_id);

EXPLAIN (COSTS OFF) SELECT * FROM j_scans WHERE scan_id = 4242;`,
    expected: { columns: ["QUERY PLAN"], rows: [
        ["Index Scan using j_scans_pkey on j_scans"],
        ["  Index Cond: (scan_id = 4242)"],
      ] },
    explanation:
      "Reading it step by step: the first EXPLAIN (whose output is discarded — only the last statement's plan counts) shows a Seq Scan, because without an index the planner's only path to scan_id 4242 is reading all 20000 rows. ALTER TABLE ... ADD PRIMARY KEY quietly builds a unique b-tree on scan_id. The final EXPLAIN shows the new plan: an Index Scan using j_scans_pkey with the Index Cond (scan_id = 4242) — the planner descends the tree to the one matching row instead of sweeping the table. Note EXPLAIN never runs the lookup; it only prices the possible routes.",
    concepts: ["EXPLAIN", "Seq Scan", "Index Scan", "primary key index"],
  },
  {
    id: "j-i3",
    tier: "intermediate",
    mode: "sql",
    title: "Apply the risk batch",
    prompt:
      "Meridian Trust's compliance team sends a nightly risk-rating batch that must be applied to EXISTING customers only — a feed id that matches nothing means the batch is wrong and must never invent a customer. Build the scratch feed table risk_updates (customer_id INT PRIMARY KEY, risk_rating TEXT NOT NULL), load rows (3, 'low'), (5, 'medium') and (14, 'medium'), then MERGE the feed INTO customers matching on customer_id: WHEN MATCHED, copy the new risk_rating. Finish with customer_id, first_name, last_name and risk_rating for those three customers, ordered by customer_id. Your submission must run on a fresh database — include the feed build. Expected columns: customer_id, first_name, last_name, risk_rating.",
    dataset: "banking",
    sampleTables: ["customers"],
    hint: "MERGE INTO customers t USING risk_updates s ON t.customer_id = s.customer_id WHEN MATCHED THEN UPDATE SET risk_rating = s.risk_rating — with no WHEN NOT MATCHED clause, unmatched feed rows simply do nothing.",
    starter: `DROP TABLE IF EXISTS risk_updates;

CREATE TABLE risk_updates (
  customer_id INT PRIMARY KEY,
  risk_rating TEXT NOT NULL
);

INSERT INTO risk_updates (customer_id, risk_rating) VALUES
  (3, 'low'),
  (5, 'medium'),
  (14, 'medium');

-- TODO: MERGE INTO customers, matching on customer_id,
--       WHEN MATCHED THEN UPDATE SET risk_rating = s.risk_rating

-- TODO: customer_id, first_name, last_name, risk_rating for the
--       three customers, ordered by customer_id
`,
    solution: `DROP TABLE IF EXISTS risk_updates;

CREATE TABLE risk_updates (
  customer_id INT PRIMARY KEY,
  risk_rating TEXT NOT NULL
);

INSERT INTO risk_updates (customer_id, risk_rating) VALUES
  (3, 'low'),
  (5, 'medium'),
  (14, 'medium');

MERGE INTO customers AS t
USING risk_updates AS s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN
  UPDATE SET risk_rating = s.risk_rating;

SELECT customer_id, first_name, last_name, risk_rating
FROM customers
WHERE customer_id IN (3, 5, 14)
ORDER BY customer_id;`,
    ordered: true,
    expected: { columns: ["customer_id", "first_name", "last_name", "risk_rating"], rows: [
        ["3", "Kwame", "Mensah", "low"],
        ["5", "Frank", "Delgado", "medium"],
        ["14", "Yasmin", "Farouk", "medium"],
      ] },
    explanation:
      "The feed table exists to be joined, not trusted: MERGE pairs every risk_updates row with customers ON customer_id, and only pairs that matched reach WHEN MATCHED THEN UPDATE, which copies s.risk_rating over the target's. Because the statement has no WHEN NOT MATCHED branch, a bogus feed id falls through silently instead of inserting a phantom customer — exactly the fail-safe compliance asked for. The closing SELECT reads back the three re-rated customers in id order to confirm the batch landed.",
    concepts: ["MERGE", "WHEN MATCHED", "batch updates", "feed tables"],
  },
  {
    id: "j-i4",
    tier: "intermediate",
    mode: "sql",
    title: "Read the spec sheet",
    prompt:
      "ShopSphere's engineering team stores product spec sheets as JSONB documents in the scratch table product_specs (product_id INT PRIMARY KEY REFERENCES products, specs JSONB NOT NULL). Build it with the four rows from the starter, then answer a compatibility question: which Linux products ship a usb-c port? Filter with the containment operator specs @> '{\"ports\": [\"usb-c\"]}'::jsonb AND specs ->> 'os' = 'Linux', join products for the name, and return product_id, name and os (via specs ->> 'os') ordered by product_id. Include the build statements in your submission — it must run on a fresh database. Expected columns: product_id, name, os.",
    dataset: "ecommerce",
    sampleTables: ["products"],
    hint: "@> asks 'does this document contain that structure?' — the whole {\"ports\": [\"usb-c\"]} shape must be inside specs; ->> pulls a key back as plain text so you can compare it with =.",
    starter: `DROP TABLE IF EXISTS product_specs;

CREATE TABLE product_specs (
  product_id INT PRIMARY KEY REFERENCES products(product_id),
  specs      JSONB NOT NULL
);

INSERT INTO product_specs (product_id, specs) VALUES
  (1,  '{"os": "Linux", "ports": ["usb-c", "hdmi"], "weight_g": 1120}'),
  (2,  '{"os": "Linux", "ports": ["usb-c", "sd"], "weight_g": 980}'),
  (6,  '{"bluetooth": true, "ports": ["usb-c"], "weight_g": 250}'),
  (20, '{"os": "Android", "ports": ["usb-c"], "weight_g": 460}');

-- TODO: which Linux products ship a usb-c port?
--       specs @> '{"ports": ["usb-c"]}'::jsonb  AND  specs ->> 'os' = 'Linux'
-- TODO: join products for the name; return product_id, name, os
`,
    solution: `DROP TABLE IF EXISTS product_specs;

CREATE TABLE product_specs (
  product_id INT PRIMARY KEY REFERENCES products(product_id),
  specs      JSONB NOT NULL
);

INSERT INTO product_specs (product_id, specs) VALUES
  (1,  '{"os": "Linux", "ports": ["usb-c", "hdmi"], "weight_g": 1120}'),
  (2,  '{"os": "Linux", "ports": ["usb-c", "sd"], "weight_g": 980}'),
  (6,  '{"bluetooth": true, "ports": ["usb-c"], "weight_g": 250}'),
  (20, '{"os": "Android", "ports": ["usb-c"], "weight_g": 460}');

SELECT p.product_id, p.name, ps.specs ->> 'os' AS os
FROM product_specs ps
JOIN products p ON p.product_id = ps.product_id
WHERE ps.specs @> '{"ports": ["usb-c"]}'::jsonb
  AND ps.specs ->> 'os' = 'Linux'
ORDER BY p.product_id;`,
    ordered: true,
    expected: { columns: ["product_id", "name", "os"], rows: [
        ["1", "AeroBook 14 Laptop", "Linux"],
        ["2", "AeroBook 16 Pro Laptop", "Linux"],
      ] },
    explanation:
      "Two jsonb operators do all the work. The containment test specs @> '{\"ports\": [\"usb-c\"]}'::jsonb asks whether the document contains that exact structure — a ports array holding the element \"usb-c\" — which is true whether the array has one port or three, so it passes the laptops AND the earbuds AND the Android tablet. The AND with specs ->> 'os' = 'Linux' is the filter that bites: the earbuds have no os key at all (->> 'os' returns NULL, and NULL = 'Linux' is never true), while the tablet runs Android. The same ->> 'os' reappears in the SELECT to unwrap the os value as text for display, so the output reads 'Linux', not '\"Linux\"'.",
    concepts: ["jsonb", "containment (@>)", "->> operator", "documents"],
  },
  {
    id: "j-a1",
    tier: "advanced",
    mode: "sql",
    title: "Transfer with a paper trail",
    prompt:
      "Meridian Trust's core-banking rule: a transfer is not just two balance changes — the ledger must record it, all four writes succeeding or none at all. In one transaction move 1000.00 from account 1 to account 2 (two UPDATEs), then insert the ledger rows: txn 101 on account 1, type 'transfer_out', amount 1000.00, balance_after 9939.50, occurred_at TIMESTAMP '2026-11-14 12:00:00', channel 'online', description 'Transfer to savings'; txn 102 on account 2, type 'transfer_in', amount 1000.00, balance_after 29900.00, same timestamp and channel, description 'From checking'. COMMIT, then return txn_id, account_id, txn_type, amount, balance_after for txns 101 and 102, ordered by txn_id. Expected columns: txn_id, account_id, txn_type, amount, balance_after.",
    dataset: "banking",
    sampleTables: ["accounts", "transactions"],
    hint: "All four statements — two UPDATEs, two INSERTs — share one BEGIN ... COMMIT. If any of them fails, the transaction aborts and no balance moves without its ledger row.",
    starter: `BEGIN;

-- TODO: 1000.00 out of account 1, 1000.00 into account 2

-- TODO: ledger row 101: account 1, 'transfer_out', 1000.00,
--       balance_after 9939.50, TIMESTAMP '2026-11-14 12:00:00',
--       channel 'online', description 'Transfer to savings'
-- TODO: ledger row 102: account 2, 'transfer_in', 1000.00,
--       balance_after 29900.00, same timestamp/channel, 'From checking'

COMMIT;

-- TODO: txn_id, account_id, txn_type, amount, balance_after
--       for txns 101 and 102, ordered by txn_id
`,
    solution: `BEGIN;

UPDATE accounts SET balance = balance - 1000.00 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 1000.00 WHERE account_id = 2;

INSERT INTO transactions (txn_id, account_id, txn_type, amount, balance_after, occurred_at, channel, description)
VALUES (101, 1, 'transfer_out', 1000.00, 9939.50, TIMESTAMP '2026-11-14 12:00:00', 'online', 'Transfer to savings');

INSERT INTO transactions (txn_id, account_id, txn_type, amount, balance_after, occurred_at, channel, description)
VALUES (102, 2, 'transfer_in', 1000.00, 29900.00, TIMESTAMP '2026-11-14 12:00:00', 'online', 'From checking');

COMMIT;

SELECT txn_id, account_id, txn_type, amount, balance_after
FROM transactions
WHERE txn_id IN (101, 102)
ORDER BY txn_id;`,
    ordered: true,
    expected: { columns: ["txn_id", "account_id", "txn_type", "amount", "balance_after"], rows: [
        ["101", "1", "transfer_out", "1000.00", "9939.50"],
        ["102", "2", "transfer_in", "1000.00", "29900.00"],
      ] },
    explanation:
      "Four writes, one decision point. The two UPDATEs move the money (account 1 down to 9939.50, account 2 up to 29900.00); the two INSERTs write the matching ledger rows with the balance_after each account shows after its leg of the transfer. Because all four sit between BEGIN and COMMIT, they are one atomic unit — a crash or an error after any statement rolls the whole set back, so the ledger can never disagree with the balances. The final SELECT reads back the two ledger rows in txn_id order: the paper trail a core-banking auditor expects.",
    concepts: ["transactions", "COMMIT", "ledger writes", "multi-statement SQL"],
  },
  {
    id: "j-a2",
    tier: "advanced",
    mode: "sql",
    title: "Each branch's two strongest accounts",
    prompt:
      "Meridian Trust's branch managers want their per-branch snapshot: the two strongest OPEN (is_active) accounts at each branch, strongest first — a classic top-N-per-group. Rank the active accounts within each branch with row_number() OVER (PARTITION BY the branch name ORDER BY balance DESC, account_id) — the account_id tie-breaker keeps the ranking deterministic — keep positions 1 and 2, and return branch, position, account_id, account_type and balance, ordered by branch then position. Expected columns: branch, position, account_id, account_type, balance.",
    dataset: "banking",
    sampleTables: ["accounts", "branches"],
    hint: "Compute row_number() inside a subquery (or CTE), then filter position <= 2 in the outer query — window results can't be referenced in the same query level's WHERE.",
    starter: `SELECT b.name AS branch,
       -- TODO: row_number() OVER (PARTITION BY b.name
       --       ORDER BY a.balance DESC, a.account_id) AS position,
       a.account_id, a.account_type, a.balance
FROM accounts a
JOIN branches b ON b.branch_id = a.branch_id
WHERE a.is_active
-- TODO: keep only positions 1 and 2 (needs a subquery)
-- TODO: order by branch, then position
`,
    solution: `SELECT branch, position, account_id, account_type, balance
FROM (
  SELECT b.name AS branch,
         row_number() OVER (PARTITION BY b.name
                            ORDER BY a.balance DESC, a.account_id) AS position,
         a.account_id, a.account_type, a.balance
  FROM accounts a
  JOIN branches b ON b.branch_id = a.branch_id
  WHERE a.is_active
) ranked
WHERE position <= 2
ORDER BY branch, position;`,
    ordered: true,
    expected: { columns: ["branch", "position", "account_id", "account_type", "balance"], rows: [
        ["Downtown", "1", "28", "savings", "92000.00"],
        ["Downtown", "2", "18", "savings", "63500.00"],
        ["Fairview", "1", "26", "checking", "940.60"],
        ["Fairview", "2", "19", "checking", "620.10"],
        ["Lakewood Plaza", "1", "12", "checking", "2945.80"],
        ["Lakewood Plaza", "2", "30", "checking", "1088.90"],
        ["Northgate Uni", "1", "3", "business", "15420.75"],
        ["Northgate Uni", "2", "24", "savings", "5100.00"],
        ["Riverside", "1", "5", "savings", "17500.00"],
        ["Riverside", "2", "21", "savings", "12800.00"],
      ] },
    explanation:
      "The window function is the engine: PARTITION BY b.name restarts the numbering at every branch, and ORDER BY balance DESC hands out position 1 to the largest balance first, with account_id as the deterministic tie-breaker. Because row_number() is computed during SELECT, it can't appear in a WHERE at the same level — so the ranking happens in the subquery and the position <= 2 cut happens outside it. Ten rows survive: five branches, two podium places each, sorted by branch name then position so every manager reads their snapshot the same way.",
    concepts: ["row_number", "top-N per group", "PARTITION BY", "window functions"],
  },
  {
    id: "j-a3",
    tier: "advanced",
    mode: "sql",
    title: "Ingest the customer feed",
    prompt:
      "A registry correction file arrives at Meridian Trust: some rows correct existing customers, others are brand-new — one statement must handle both. Build the scratch feed customer_feed (customer_id INT PRIMARY KEY, first_name, last_name, email, city, since DATE, risk_rating — all NOT NULL) and load two rows: (2, 'Diana', 'Whitmore', 'd.whitmore@meridian.example', 'Lakewood', DATE '2012-09-30', 'medium') and (30, 'Priya', 'Nair', 'p.nair@meridian.example', 'Springfield', DATE '2026-11-01', 'low'). MERGE the feed INTO customers ON customer_id: WHEN MATCHED, update only city and risk_rating; WHEN NOT MATCHED, insert the full feed row. Then return customer_id, first_name, last_name, city, risk_rating for customers 2 and 30, ordered by customer_id. Include the feed build in your submission. Expected columns: customer_id, first_name, last_name, city, risk_rating.",
    dataset: "banking",
    sampleTables: ["customers"],
    hint: "MERGE carries both branches: WHEN MATCHED THEN UPDATE SET only the corrected columns (city, risk_rating); WHEN NOT MATCHED THEN INSERT the feed's values, column list and all.",
    starter: `DROP TABLE IF EXISTS customer_feed;

CREATE TABLE customer_feed (
  customer_id INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  city        TEXT NOT NULL,
  since       DATE NOT NULL,
  risk_rating TEXT NOT NULL
);

INSERT INTO customer_feed (customer_id, first_name, last_name, email, city, since, risk_rating) VALUES
  (2,  'Diana', 'Whitmore', 'd.whitmore@meridian.example', 'Lakewood',    DATE '2012-09-30', 'medium'),
  (30, 'Priya', 'Nair',     'p.nair@meridian.example',      'Springfield', DATE '2026-11-01', 'low');

-- TODO: MERGE INTO customers on customer_id:
--       WHEN MATCHED  -> update city and risk_rating from the feed
--       WHEN NOT MATCHED -> insert the full feed row

-- TODO: customer_id, first_name, last_name, city, risk_rating
--       for customers 2 and 30, ordered by customer_id
`,
    solution: `DROP TABLE IF EXISTS customer_feed;

CREATE TABLE customer_feed (
  customer_id INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  city        TEXT NOT NULL,
  since       DATE NOT NULL,
  risk_rating TEXT NOT NULL
);

INSERT INTO customer_feed (customer_id, first_name, last_name, email, city, since, risk_rating) VALUES
  (2,  'Diana', 'Whitmore', 'd.whitmore@meridian.example', 'Lakewood',    DATE '2012-09-30', 'medium'),
  (30, 'Priya', 'Nair',     'p.nair@meridian.example',      'Springfield', DATE '2026-11-01', 'low');

MERGE INTO customers AS t
USING customer_feed AS s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN
  UPDATE SET city = s.city, risk_rating = s.risk_rating
WHEN NOT MATCHED THEN
  INSERT (customer_id, first_name, last_name, email, city, since, risk_rating)
  VALUES (s.customer_id, s.first_name, s.last_name, s.email, s.city, s.since, s.risk_rating);

SELECT customer_id, first_name, last_name, city, risk_rating
FROM customers
WHERE customer_id IN (2, 30)
ORDER BY customer_id;`,
    ordered: true,
    expected: { columns: ["customer_id", "first_name", "last_name", "city", "risk_rating"], rows: [
        ["2", "Diana", "Whitmore", "Lakewood", "medium"],
        ["30", "Priya", "Nair", "Springfield", "low"],
      ] },
    explanation:
      "MERGE walks the feed once and lets the ON clause route every row: Diana (customer 2) matches an existing customer, so WHEN MATCHED fires and overwrites only city and risk_rating — her name, email and since date stay untouched. Priya (customer 30) matches nobody, so WHEN NOT MATCHED inserts the complete feed row as a brand-new customer. One statement, both behaviors, no pre-check query. The read-back shows Diana's corrected profile and Priya's first appearance side by side, in customer_id order.",
    concepts: ["MERGE", "upsert", "WHEN NOT MATCHED", "data ingestion"],
  },
  {
    id: "j-a4",
    tier: "advanced",
    mode: "sql",
    title: "True first-term newcomers",
    prompt:
      "Northgate's registrar wants the TRUE first-term students of Fall 2026: students enrolled in term '2026F' who have NEVER enrolled in any other term — newcomers, not returning students. Build the newcomer set with EXCEPT — student ids enrolled in '2026F' EXCEPT student ids enrolled in any other term (term <> '2026F') — then join students for the readable names. Return student_id, first_name and last_name ordered by student_id. Expected columns: student_id, first_name, last_name.",
    dataset: "university",
    sampleTables: ["enrollments", "students"],
    hint: "The right side of the EXCEPT is 'every term that is not 2026F' — term <> '2026F'. Anyone who survives the subtraction has 2026F as their only enrollment ever.",
    starter: `SELECT student_id
FROM enrollments
WHERE term = '2026F'
-- TODO: EXCEPT the student_ids enrolled in any other term (term <> '2026F')
-- TODO: join the newcomer set to students for first_name, last_name
-- TODO: student_id, first_name, last_name ordered by student_id
`,
    solution: `SELECT s.student_id, s.first_name, s.last_name
FROM (SELECT student_id FROM enrollments WHERE term = '2026F'
      EXCEPT
      SELECT student_id FROM enrollments WHERE term <> '2026F') AS newcomers
JOIN students s ON s.student_id = newcomers.student_id
ORDER BY s.student_id;`,
    ordered: true,
    expected: { columns: ["student_id", "first_name", "last_name"], rows: [
        ["20", "Yuki", "Ono"],
        ["22", "Ravi", "Patel"],
      ] },
    explanation:
      "The left side of the EXCEPT is the Fall-2026 roster; the right side is everyone who has ever enrolled in any other term. Subtract, and what remains is exactly the students whose entire enrollment history is 2026F — the true newcomers. A returning student appears on both sides and cancels out no matter how many 2026F courses they take, because EXCEPT works on distinct values. The join to students only then fetches names for the short survivor list, ordered by student_id for the registrar's roster.",
    concepts: ["EXCEPT", "set difference", "new-vs-returning", "joins on sets"],
  },
  ],
  assessment: [

  {
    id: "j-as-1",
    prompt: "A query plan shows: Seq Scan on j_scans (cost=0.00..375.00 rows=20000 width=14). What is PostgreSQL telling you?",
    options: [
      {
        text: "It will read every row of j_scans because no cheaper path (such as a usable index) exists for this query",
        correct: true,
        feedback: "Correct — Seq Scan is the full-table read, chosen when the planner prices it below every alternative.",
      },
      {
        text: "It will scan only the 20000 rows the query returns",
        correct: false,
        feedback: "rows is the planner's estimate of what the scan emits, not a limit — a Seq Scan still visits the whole table.",
      },
      {
        text: "The query will cost 375.00 dollars to run",
        correct: false,
        feedback: "cost is a unit-less internal estimate (startup..total effort), never money.",
      },
      {
        text: "It is using an index but hiding it from you",
        correct: false,
        feedback: "Plans never hide nodes — an index would appear as Index Scan or Bitmap Heap Scan.",
      },
    ],
    explanation:
      "Reading a plan starts with the node type: Seq Scan means full-table, chosen when no index path is cheap enough. cost=0.00..375.00 is the planner's estimated effort (startup..total) and rows the estimated output — all estimates, all comparable between plans.",
  },
  {
    id: "j-as-2",
    prompt: "What is the difference between EXPLAIN and EXPLAIN ANALYZE?",
    options: [
      {
        text: "EXPLAIN ANALYZE actually executes the statement and reports real timings and row counts; EXPLAIN only predicts them",
        correct: true,
        feedback: "Correct — ANALYZE adds actual time, actual rows and loops next to every estimate.",
      },
      {
        text: "EXPLAIN ANALYZE shows the same estimates, just formatted differently",
        correct: false,
        feedback: "The extra numbers are measured, not reformatted — the statement really runs.",
      },
      {
        text: "EXPLAIN runs the query and caches the plan for later",
        correct: false,
        feedback: "EXPLAIN never executes anything — it stops at planning.",
      },
      {
        text: "EXPLAIN ANALYZE is always safe on an UPDATE because it rolls the change back",
        correct: false,
        feedback: "Dangerous assumption — ANALYZE executes the UPDATE for real and keeps its effects.",
      },
    ],
    explanation:
      "EXPLAIN shows the plan the planner intends; EXPLAIN ANALYZE runs the statement and shows what actually happened (timings, row counts, loops). That power cuts both ways: on INSERT/UPDATE/DELETE the writes really land.",
  },
  {
    id: "j-as-3",
    prompt: "Inside one transaction you have run two UPDATEs, one INSERT and one DELETE. What does a bare ROLLBACK undo?",
    options: [
      {
        text: "All four statements — everything since BEGIN vanishes as if it never ran",
        correct: true,
        feedback: "Correct — a bare ROLLBACK aborts the whole transaction, every statement in it.",
      },
      {
        text: "Only the most recent statement before the ROLLBACK",
        correct: false,
        feedback: "Undoing one statement needs ROLLBACK TO SAVEPOINT — a bare ROLLBACK is all-or-nothing.",
      },
      {
        text: "Only the INSERT and DELETE, because UPDATEs are not transactional",
        correct: false,
        feedback: "PostgreSQL is fully transactional — UPDATEs roll back like everything else (even most DDL does).",
      },
      {
        text: "Nothing yet — the changes only disappear when you also run COMMIT",
        correct: false,
        feedback: "ROLLBACK ends the transaction on the spot; there is nothing left to commit afterwards.",
      },
    ],
    explanation:
      "A transaction is one all-or-nothing unit: bare ROLLBACK discards every change made since BEGIN — two UPDATEs, an INSERT and a DELETE alike — restoring the database to the moment the transaction opened.",
  },
  {
    id: "j-as-4",
    prompt: "A transfer debits account 1 and credits account 2 inside one transaction. Which ACID guarantee ensures the bank can never end up with the debit applied and the credit missing?",
    options: [
      {
        text: "Atomicity — the transaction is all-or-nothing",
        correct: true,
        feedback: "Correct — atomicity makes the two writes one indivisible unit that lands completely or not at all.",
      },
      {
        text: "Consistency — the database must move between valid states only",
        correct: false,
        feedback: "Consistency keeps constraints true across the transaction, but the pairing of the two writes is atomicity's job.",
      },
      {
        text: "Isolation — concurrent transactions must not see half-done work",
        correct: false,
        feedback: "Isolation hides the half-done state from others; the guarantee that both writes land together is atomicity.",
      },
      {
        text: "Durability — committed work survives crashes",
        correct: false,
        feedback: "Durability protects work AFTER it commits; the debit-plus-credit pairing is settled by atomicity.",
      },
    ],
    explanation:
      "Atomicity is the all-or-nothing letter of ACID: the debit and the credit form one unit, so a failure anywhere in the transaction restores both accounts — the half-applied transfer is impossible by construction.",
  },
  {
    id: "j-as-5",
    prompt: "INSERT INTO stock_sync VALUES (4, 5) ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock — what does EXCLUDED refer to?",
    options: [
      {
        text: "The row this INSERT proposed — the new values that could not be inserted",
        correct: true,
        feedback: "Correct — EXCLUDED is the losing candidate row, exactly what you usually want to write into the update.",
      },
      {
        text: "The row already stored in stock_sync",
        correct: false,
        feedback: "That is the target row — you reach it through the table's own name, as in stock_sync.stock.",
      },
      {
        text: "The rows the conflict automatically deleted",
        correct: false,
        feedback: "Nothing is deleted — ON CONFLICT either updates the existing row or leaves it alone.",
      },
      {
        text: "A system catalog of rejected inserts",
        correct: false,
        feedback: "EXCLUDED is a virtual alias bound for this one statement, not a stored table anywhere.",
      },
    ],
    explanation:
      "EXCLUDED names the row the INSERT tried and failed to place; the conflict target's table name refers to the row that blocked it. DO UPDATE SET stock = EXCLUDED.stock is the classic 'the new value wins' sync pattern.",
  },
  {
    id: "j-as-6",
    prompt: "A nightly sync must insert new customers, update matched ones, AND delete matched customers who have left the company. Why does MERGE fit better than a single INSERT ... ON CONFLICT?",
    options: [
      {
        text: "MERGE supports WHEN MATCHED THEN DELETE (and several matched clauses with extra conditions); ON CONFLICT can only DO UPDATE or DO NOTHING",
        correct: true,
        feedback: "Correct — MERGE is the multi-action statement: update, delete and insert branches in one command.",
      },
      {
        text: "MERGE is always faster than ON CONFLICT",
        correct: false,
        feedback: "Neither is inherently faster — the difference is which actions each statement can express.",
      },
      {
        text: "ON CONFLICT cannot update existing rows at all",
        correct: false,
        feedback: "It can — DO UPDATE is the U in upsert; what it lacks is a delete branch.",
      },
      {
        text: "MERGE skips constraint checking, so bad feed rows slip in silently",
        correct: false,
        feedback: "MERGE enforces constraints exactly like any other write — skipping checks would be a bug, not a feature.",
      },
    ],
    explanation:
      "ON CONFLICT is the insert-or-update shortcut; MERGE is the SQL-standard Swiss army knife — WHEN MATCHED THEN UPDATE / DELETE (even several clauses with WHEN conditions) plus WHEN NOT MATCHED THEN INSERT. The moment a sync needs a delete branch, MERGE is the right tool.",
  },
  {
    id: "j-as-7",
    prompt: "specs -> 'ports' returns jsonb while specs ->> 'os' returns text. What is the practical difference?",
    options: [
      {
        text: "-> keeps the value as jsonb (quotes, nesting and further jsonb operators intact); ->> unwraps it to plain text with the JSON quotes stripped",
        correct: true,
        feedback: "Correct — the extra > of ->> flattens the value to text, which is why ->> 'os' = 'Linux' can compare at all.",
      },
      {
        text: "-> returns text and ->> returns jsonb",
        correct: false,
        feedback: "Exactly backwards — the double arrow ->> is the one that produces text.",
      },
      {
        text: "They are synonyms and the choice is cosmetic",
        correct: false,
        feedback: "Different return types, different rules: comparing -> 'os' = 'Linux' never matches because jsonb isn't text.",
      },
      {
        text: "->> only works on arrays, -> only on objects",
        correct: false,
        feedback: "Both arrows work on objects and arrays alike — the split is the return type, not the input kind.",
      },
    ],
    explanation:
      "Use -> when you want to keep navigating (chained arrows, containment, more jsonb); use ->> when you want a plain text value for display or comparison. Mixing them up is the classic silent-zero-rows bug.",
  },
  {
    id: "j-as-8",
    prompt: "You create a b-tree index on customers(email). Which of these WHERE clauses CANNOT use that index?",
    options: [
      {
        text: "WHERE lower(email) = 'diana@meridian.example'",
        correct: true,
        feedback: "Correct — the index is sorted by email, not by lower(email); the function hides the column from it.",
      },
      {
        text: "WHERE email = 'diana@meridian.example'",
        correct: false,
        feedback: "That is the textbook index hit: equality on the bare, indexed column.",
      },
      {
        text: "WHERE email LIKE 'd.%'",
        correct: false,
        feedback: "A left-anchored LIKE behaves like a range scan from 'd.' to 'd/', which the b-tree serves happily.",
      },
      {
        text: "WHERE email = 'a@x.example' OR email = 'b@y.example'",
        correct: false,
        feedback: "The planner can run both index probes and merge them with a BitmapOr — still index-driven.",
      },
    ],
    explanation:
      "An index can only serve expressions it was built on: wrapping the column in a function — lower(email), substring(email ...) — makes the index on email useless unless you create a matching expression index on that function.",
  },
  ],
  project: {

  title: "The Analytics Warehouse View Layer",
  brief:
    "Meridian Trust's analysts keep pasting the same five queries into dashboards, and every copy drifts a little from the last. Your job is to stop the drift: turn the recurring questions into a maintainable reporting layer of views — one view per question, each a named, reviewed, reusable SELECT. You will build the customer totals, the account leaderboard, each branch's flagship account, a per-branch podium and the monthly ledger pulse, then prove the layer composes by reading several views in one dashboard query. This is the capstone in miniature: joins, window functions, aggregation and date bucketing, all hidden behind clean names that outlive any single dashboard.",
  requirements: [
    "v_customer_totals — one row per customer, all 20 prospects included: customer_id, customer, accounts (count), total_balance (coalesce to 0.00 for customers with no accounts)",
    "v_account_leaderboard — the ten strongest accounts: position (row_number over balance DESC, account_id), customer, account_id, account_type, balance",
    "v_branch_flagships — each branch's single strongest OPEN (is_active) account: branch, city, account_id, balance",
    "v_branch_top3 — the per-branch podium, positions 1-3 of active accounts: branch, position, account_id, account_type, balance",
    "v_monthly_pulse — one row per month of the ledger: month (date_trunc('month', occurred_at)), txns, accounts_active (count distinct), total_amount",
    "Every view is deterministic: rankings and ORDER BYs break ties with a stable key (account_id or customer_id), and no view touches now() or current_date",
    "A final dashboard SELECT that reads at least three of the views in one query — proof that the layer composes like tables",
  ],
  steps: [
    "Survey the ground first: SELECT * FROM accounts LIMIT 5, then branches, customers and transactions — note accounts.branch_id, is_active and transactions.occurred_at.",
    "Create v_customer_totals with a LEFT JOIN from customers to accounts and a GROUP BY on the customer; check that a prospect still shows 0 accounts and $0.00.",
    "Create v_account_leaderboard: row_number() OVER (ORDER BY balance DESC, account_id) in a subquery, keep position <= 10, join customers for the name.",
    "Create v_branch_flagships with the same pattern plus PARTITION BY the branch (join branches for its name and city), keeping only position = 1.",
    "Generalize into v_branch_top3 by keeping position <= 3 — build it as its own view so both snapshots coexist.",
    "Create v_monthly_pulse: GROUP BY date_trunc('month', occurred_at) with count(*), count(DISTINCT account_id) and sum(amount).",
    "Re-read every CREATE VIEW: does each ranking have a tie-breaker? Any now() or current_date? Use CREATE OR REPLACE VIEW so re-running your script is safe.",
    "Finish with the dashboard: one SELECT that combines at least three views (flagships next to their podium counts, the leaderboard next to customer totals) — the layer should read like a report, not like plumbing.",
  ],
  starter: `-- The Analytics Warehouse View Layer (Part J mini project)
-- Database: banking (Meridian Trust)   "Today": DATE '2026-11-14'
-- Use CREATE OR REPLACE VIEW throughout so re-runs stay clean.

-- 1. One row per customer, prospects keep their zero row
CREATE OR REPLACE VIEW v_customer_totals AS
SELECT cu.customer_id,
       cu.first_name || ' ' || cu.last_name AS customer,
       -- TODO accounts: count of the customer's accounts
       -- TODO total_balance: coalesce(sum(balance), 0.00)
       NULL::bigint  AS accounts,
       NULL::numeric AS total_balance
FROM customers cu
LEFT JOIN accounts a ON a.customer_id = cu.customer_id
GROUP BY cu.customer_id, cu.first_name, cu.last_name;

-- 2. The ten strongest accounts (tie-break with account_id)
CREATE OR REPLACE VIEW v_account_leaderboard AS
-- TODO: row_number() OVER (ORDER BY balance DESC, account_id) AS position
--       in a subquery; keep position <= 10; join customers for the name
SELECT NULL::int AS position, NULL::int AS customer_id, NULL::text AS customer,
       NULL::int AS account_id, NULL::text AS account_type, NULL::numeric AS balance
WHERE false;

-- 3. Each branch's flagship: position 1 per branch, active accounts only
CREATE OR REPLACE VIEW v_branch_flagships AS
-- TODO: row_number() OVER (PARTITION BY b.name
--       ORDER BY a.balance DESC, a.account_id) AS position; keep position = 1
SELECT NULL::text AS branch, NULL::text AS city,
       NULL::int AS account_id, NULL::numeric AS balance
WHERE false;

-- 4. The podium per branch: positions 1-3
CREATE OR REPLACE VIEW v_branch_top3 AS
-- TODO: same ranking as the flagship view, but keep position <= 3
SELECT NULL::text AS branch, NULL::int AS position,
       NULL::int AS account_id, NULL::text AS account_type, NULL::numeric AS balance
WHERE false;

-- 5. The monthly ledger pulse
CREATE OR REPLACE VIEW v_monthly_pulse AS
-- TODO: GROUP BY date_trunc('month', occurred_at) AS month
--       with txns, accounts_active, total_amount
SELECT NULL::date   AS month,
       NULL::bigint AS txns,
       NULL::bigint AS accounts_active,
       NULL::numeric AS total_amount
WHERE false;

-- 6. The dashboard: prove the layer composes
-- TODO: one SELECT reading at least three of the views above
`,
  concepts: ["views", "window functions", "aggregation", "date bucketing"],
  extension:
    "Build a view OF views: v_pulse_change selects from v_monthly_pulse and adds month-over-month movement with lag() — txns_last_month, total_change — so the pulse explains itself. Then wrap one v_exec_summary that joins v_branch_flagships to v_customer_totals (each flagship holder's total relationship) and check that every column a dashboard would sort on is typed, never formatted text.",
  },
};
