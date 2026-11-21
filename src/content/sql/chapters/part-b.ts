/**
 * Part B — Getting Started with PostgreSQL.
 *
 * The learner meets real PostgreSQL three ways: installed on their own
 * machine (lesson b-01), running inside the browser Lab (b-02 — the
 * course's practice home), and through the psql terminal (b-06). In
 * between they create databases and schemas, build their first tables
 * with CREATE TABLE, fill them with INSERT, and finish by building a
 * tiny library from scratch. Every verified result was produced by the
 * compute-part-results/verify pipeline — no hand-typed output.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_B: Part = {
  letter: "B",
  title: "Getting Started with PostgreSQL",
  tagline: "Install PostgreSQL, meet the in-browser Lab, and write your first CREATE TABLE and INSERT.",
  description:
    "Theory becomes practice here. You install real PostgreSQL on your own machine (or start instantly in the browser Lab — no install required), learn what a database and a schema actually are in PostgreSQL, create your first tables with CREATE TABLE, fill them with INSERT, and take your first tour of psql, the professional's terminal. The part ends with a hands-on build: a tiny library database, made from nothing.",
  stub: false,
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      slug: "b-01",
      title: "Installing PostgreSQL",
      minutes: 14,
      summary: "Get real PostgreSQL onto your own computer — Windows, macOS or Linux — and prove it works with one command.",
      kind: "setup",
      objectives: [
        "Install PostgreSQL on Windows, macOS or Linux",
        "Verify the installation from a terminal",
        "Say what the psql client is and where it comes from",
        "Explain why the course can also run PostgreSQL with no install at all",
      ],
      why: "Everything in this course runs on genuine PostgreSQL, and you can practice all of it inside the browser Lab with zero installation. But the day you work with data for real — a job, a project, a startup — you will meet PostgreSQL installed on a machine: yours or a server. Installing it once, yourself, turns 'a database somewhere' into a thing you own and understand, and it takes about ten minutes.",
      blocks: [
        {
          kind: "text",
          text: "PostgreSQL is free, open source, and runs on every operating system that matters. The official source of installers is **postgresql.org** — specifically the Download page, which links per-platform installers. One rule before you start: prefer an installer from postgresql.org or your operating system's own package manager, never a random download site.",
        },
        { kind: "heading", text: "Windows" },
        {
          kind: "text",
          text: "Download the **EDB installer** linked from postgresql.org. Run it, keep the default components (PostgreSQL Server, pgAdmin 4, Command Line Tools), pick a password for the `postgres` superuser — write it down, you will need it — and accept the default port 5432. When the wizard finishes, PostgreSQL is already running as a Windows service.",
        },
        { kind: "heading", text: "macOS" },
        {
          kind: "text",
          text: "The two popular routes are **Postgres.app** (a friendly self-contained app you drag to Applications; click Start and you have a server) or **Homebrew**, the package manager. With Homebrew it is two commands in a terminal:",
        },
        {
          kind: "sql",
          title: "Installing with Homebrew (macOS)",
          code: "brew install postgresql@18\nbrew services start postgresql@18",
          lang: "psql",
        },
        { kind: "heading", text: "Linux" },
        {
          kind: "text",
          text: "Every major distribution packages PostgreSQL. On Ubuntu or Debian the classic sequence is below; on Fedora the equivalent uses `dnf install postgresql-server`. Your distribution's documentation has the exact commands — the shape is always the same: install, initialize, start.",
        },
        {
          kind: "sql",
          title: "Installing on Ubuntu/Debian (terminal)",
          code: "sudo apt update\nsudo apt install postgresql postgresql-contrib",
          lang: "psql",
        },
        { kind: "heading", text: "Prove it works" },
        {
          kind: "text",
          text: "Whatever your platform, the proof is the same: open a terminal and ask for the version. If a version number comes back, the client tools are installed and reachable. On Windows, use the SQL Shell (psql) item the installer created, or add `C:\\Program Files\\PostgreSQL\\18\\bin` to your PATH.",
        },
        {
          kind: "sql",
          title: "The one-command proof",
          code: "$ psql --version\npsql (PostgreSQL) 18.6",
          lang: "psql",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "You do NOT need to install anything for this course",
          text: "The SQL Lab in this course runs a genuine PostgreSQL 18 compiled to WebAssembly, inside your browser, with six sample databases ready to query. Install PostgreSQL for your future — the course itself is zero-setup.",
        },
        {
          kind: "lab",
          title: "No install? Start here anyway",
          task: "This is the query the Lab runs the moment you open it — real PostgreSQL, in your browser. Press Run and read the result. You have just executed SQL on a real relational engine.",
          code: "SELECT version() AS postgres_version;",
          dataset: "ecommerce",
          hint: "The Run button (or Ctrl/Cmd+Enter) executes the editor's SQL against the selected sample database.",
        },
      ],
      terms: [
        { term: "psql", definition: "PostgreSQL's command-line client — the terminal program professionals use to talk to a server." },
        { term: "pgAdmin", definition: "The graphical administration tool that ships with the Windows/macOS installers." },
        { term: "Superuser", definition: "The built-in postgres account that can do anything on the server; its password is set during install." },
        { term: "Port 5432", definition: "The default network port a PostgreSQL server listens on." },
      ],
      mistakes: [
        {
          mistake: "Losing the postgres password during the Windows install",
          why: "The installer asks once, early, and every later login needs it. Beginners click through and are locked out of their own server.",
          fix: "Write it down or use a password manager entry before you continue the wizard. Resetting later is possible but annoying.",
        },
        {
          mistake: "Downloading PostgreSQL from a random mirror",
          why: "Old or repackaged builds cause silent version problems that look like your own mistakes.",
          fix: "Use postgresql.org's links, your OS package manager, Homebrew, or Postgres.app. Nothing else.",
        },
      ],
      takeaways: [
        "Install from postgresql.org, Homebrew/Postgres.app, or your OS package manager.",
        "`psql --version` is the universal proof that installation worked.",
        "Port 5432 and the postgres superuser come with every default install.",
        "This course needs no installation — the Lab runs real PostgreSQL in your browser.",
      ],
      quiz: [
        {
          id: "b-01-q1",
          prompt: "After installing PostgreSQL on Windows, which command proves the client tools work?",
          options: [
            { text: "psql --version", correct: true, feedback: "Correct — a printed version means the client is installed and on your PATH." },
            { text: "postgres --start", correct: false, feedback: "That is not a client command; on Windows the server starts as a service automatically." },
            { text: "SELECT version();", correct: false, feedback: "That is SQL — you need a working client connection first to run it." },
          ],
          explanation: "psql --version asks the client binary for its version. No server connection needed — it is the fastest install proof.",
        },
        {
          id: "b-01-q2",
          prompt: "Which port does a default PostgreSQL installation listen on?",
          options: [
            { text: "80", correct: false, feedback: "That is the default web (HTTP) port, not PostgreSQL." },
            { text: "5432", correct: true, feedback: "Correct — 5432 has been PostgreSQL's default port for decades." },
            { text: "3306", correct: false, feedback: "3306 belongs to MySQL, a different database system." },
          ],
          explanation: "PostgreSQL's default port is 5432. Tools and connection strings assume it unless you say otherwise.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-02",
      title: "Your SQL laboratory",
      minutes: 12,
      summary: "Meet the in-browser Lab: a real PostgreSQL 18 with six sample databases, a schema explorer, and nothing you can break.",
      kind: "setup",
      objectives: [
        "Explain how the Lab runs real PostgreSQL inside your browser",
        "Find every Lab feature: editor, Run, database selector, schema explorer, table viewer, history",
        "Read a real query result, including NULL cells",
        "Read a PostgreSQL error message without panic",
      ],
      why: "This Lab is your practice home for the whole course, and knowing it well doubles the value of every lesson that follows. It is not a simulation: the engine is genuine PostgreSQL compiled to WebAssembly, running in a worker thread in your browser, holding a private in-memory copy of one of six realistic sample databases. Because it is private and in-memory, nothing you type can damage anything — the Reset button restores the pristine dataset in one click.",
      blocks: [
        {
          kind: "text",
          text: "Here is the idea that makes the Lab possible: PostgreSQL is a program, and programs can be compiled to **WebAssembly** — a format browsers execute at near-native speed. The PGlite project compiles real PostgreSQL 18 to WebAssembly, so your browser tab runs an actual PostgreSQL engine, complete with tables, constraints, transactions and everything you will learn in this course.",
        },
        {
          kind: "visual",
          title: "How the Lab is wired",
          ascii: `  your browser tab
  +--------------------------------------------------+
  |  the lesson page            the SQL Lab           |
  |  (text, examples)  <---->  (editor, results)      |
  |                             |                     |
  |                     web worker thread             |
  |                             |                     |
  |                    PostgreSQL 18 (WASM)           |
  |                    + in-memory sample database    |
  +--------------------------------------------------+
       nothing leaves your machine. no server involved.`,
          caption: "The engine runs in a worker thread so a slow query can never freeze the page.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Isolated by design",
          text: "Your queries run against a private, in-memory copy of a sample database inside your own browser. There is no production system connected — nothing to leak, nothing to break, no way to reach anyone else's data. Worst case, press Reset database and the original data returns.",
        },
        { kind: "heading", text: "The six sample databases" },
        {
          kind: "table",
          title: "Your datasets for this whole course",
          headers: ["Name", "Domain", "What is inside"],
          rows: [
            ["ShopSphere", "E-commerce", "customers, products, orders, payments, reviews"],
            ["St. Marlowe General", "Hospital", "patients, doctors, admissions, prescriptions, lab results"],
            ["Northgate University", "University", "students, professors, courses, prerequisites, enrollments"],
            ["Meridian Trust", "Banking", "branches, accounts, a transaction ledger, loans"],
            ["Trailhead Outdoors", "Retail chain", "stores, suppliers, products, inventory, purchase orders"],
            ["HeliosWorks", "Employee management", "employees, org chart, salary history, projects, reviews"],
          ],
          caption: "Six businesses, six schemas, one engine. You will come to know them well.",
        },
        { kind: "heading", text: "A tour, by doing" },
        {
          kind: "steps",
          title: "Five minutes that pay for the whole course",
          items: [
            "Open the Lab. On the left, the database selector lists all six datasets — ShopSphere loads first.",
            "Below it, the schema explorer lists every table with its row count; click a table to see its columns — primary keys marked with a key icon, foreign keys with a link icon.",
            "Click the magnifier on a table to preview its rows — the table viewer.",
            "Press Run (or Ctrl/Cmd+Enter) on the starter query and read the results grid: columns, rows, timing.",
            "Type something wrong on purpose and Run again — meet the error panel, with the offending statement and a caret under the problem.",
          ],
        },
        {
          kind: "lab",
          title: "Read a real result",
          task: "Run this query on ShopSphere. Notice three things: the column headers come from the SELECT list (including the alias), NULL shows as the word NULL (customer 3 has no phone), and the footer tells you how many rows and how fast.",
          code: "SELECT customer_id, first_name, last_name, phone\nFROM customers\nORDER BY customer_id\nLIMIT 5;",
          dataset: "ecommerce",
          hint: "NULL is not zero and not an empty string — it means 'no value recorded'. Lesson d-05 is entirely about it.",
        },
        {
          kind: "lab",
          title: "Break something (safely)",
          task: "Run the valid query first. Then introduce a typo: change 'customers' to 'customerz' and run again. Read the error: PostgreSQL names the relation it cannot find, gives an error code (42P01), and the caret points at the offending name. Errors are the engine teaching you its rules.",
          code: "SELECT first_name\nFROM customers\nLIMIT 3;",
          dataset: "ecommerce",
          hint: "Every PostgreSQL error has a code and a message. You will learn to read both fluently.",
        },
      ],
      terms: [
        { term: "WebAssembly (WASM)", definition: "A binary format browsers execute at near-native speed; how PostgreSQL runs inside a tab." },
        { term: "Schema explorer", definition: "The Lab panel listing every table, its columns, types, and key badges." },
        { term: "Reset database", definition: "Restores the in-memory sample database to its original state — your safety net." },
        { term: "Query history", definition: "Every query you have run, stored in your browser, click-to-restore." },
      ],
      mistakes: [
        {
          mistake: "Worrying that a wrong query can break the Lab",
          why: "Beginners hesitate to experiment, which is the single best way to learn SQL.",
          fix: "Experiment freely. The database is a private in-memory copy; Reset restores it in one click.",
        },
        {
          mistake: "Ignoring the error panel's caret",
          why: "The caret marks exactly where PostgreSQL got confused — skipping it means re-reading the whole query for nothing.",
          fix: "Read the message first, then the caret position. Nine times in ten the fix is one token away.",
        },
      ],
      takeaways: [
        "The Lab runs genuine PostgreSQL 18 compiled to WebAssembly, in a worker, in your browser.",
        "Six realistic databases are one click away in the selector.",
        "The schema explorer shows tables, columns, keys and row counts; the viewer previews rows.",
        "Errors have messages, codes and a caret — read them; they are the engine's teaching voice.",
      ],
      quiz: [
        {
          id: "b-02-q1",
          prompt: "In the Lab's results grid, a cell shows the word NULL. What does that mean?",
          options: [
            { text: "The column contains the text 'NULL'", correct: false, feedback: "It would then show in quotes like any text value; NULL is rendered specially." },
            { text: "No value is recorded for that column in that row", correct: true, feedback: "Correct — NULL means unknown/absent, a distinct thing from '' or 0." },
            { text: "The query made an error for that cell", correct: false, feedback: "Errors abort the query — you get an error panel, not partial cells." },
          ],
          explanation: "NULL is the absence of a value. Rendering it as the word NULL (not blank) is a deliberate Lab choice so it can never be confused with an empty string.",
        },
        {
          id: "b-02-q2",
          prompt: "What is the schema explorer's key icon on a column telling you?",
          options: [
            { text: "The column is the table's primary key (or part of it)", correct: true, feedback: "Correct — the key badge marks primary-key columns." },
            { text: "The column is encrypted", correct: false, feedback: "Encryption is a server feature, not shown per-column here." },
            { text: "The column is indexed", correct: false, feedback: "Indexes have their own lesson (i-05); the key icon is specifically the primary key." },
          ],
          explanation: "The key icon marks primary-key columns, the link icon marks foreign keys — the two key kinds from Part A, visible in the schema.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-03",
      title: "Databases and schemas",
      minutes: 12,
      summary: "One PostgreSQL server holds many databases; each database holds schemas; each schema holds tables.",
      kind: "concept",
      objectives: [
        "Describe the server > database > schema > table hierarchy",
        "Use CREATE DATABASE and understand when you need a new one",
        "Explain what the public schema is and why it is the default",
        "Create a schema and put a table in it",
      ],
      why: "The words 'database' and 'schema' are used loosely everywhere, but in PostgreSQL they name exact levels of a hierarchy — and mixing them up causes real confusion later, from 'why can't I see my table' to misconfigured applications. Ten minutes of precision here saves hours of bewilderment when you meet a real server with a dozen databases owned by different teams.",
      blocks: [
        {
          kind: "text",
          text: "A single installed PostgreSQL server is a container with structure. From outside in: the **server** (one running PostgreSQL program) manages several **databases**, each isolated from the others. Inside a database live **schemas** — named folders for tables and other objects — and inside a schema live the **tables** themselves. The full name of a table is database.schema.table.",
        },
        {
          kind: "visual",
          title: "The containment hierarchy",
          ascii: `  PostgreSQL server  (one install, one port)
  +-- database: postgres        (maintenance db)
  +-- database: shop            (an application's world)
  |   +-- schema: public        (the default folder)
  |   |   +-- table: customers
  |   |   +-- table: orders
  |   +-- schema: reporting     (a second folder, same db)
  |       +-- table: monthly_summary
  +-- database: university      (a different world entirely)`,
          caption: "Databases are isolated worlds; schemas are folders inside one world.",
        },
        {
          kind: "text",
          text: "Two consequences follow. First, databases are hard boundaries: a query in one database cannot see tables in another (you disconnect and reconnect elsewhere). Second, schemas are soft boundaries: within one database you can reach across schemas just by prefixing the name — `reporting.monthly_summary` — which makes schemas perfect for organizing large applications without splitting them apart.",
        },
        { kind: "heading", text: "Creating a database" },
        {
          kind: "text",
          text: "You create a database with `CREATE DATABASE`, and connect to it before using it. In psql that looks like the transcript below; in the Lab, the currently selected sample database plays the role of 'the database you are connected to'.",
        },
        {
          kind: "sql",
          title: "Making and entering a database (psql transcript)",
          code: "$ createdb shop\n$ psql shop\nshop=# CREATE SCHEMA reporting;\nCREATE SCHEMA\nshop=# CREATE TABLE reporting.monthly_summary (\nshop(#   month date,\nshop(#   revenue numeric(10,2)\nshop(# );\nCREATE TABLE",
          lang: "psql",
        },
        {
          kind: "sql",
          title: "The same commands, run in order",
          code: "CREATE SCHEMA reporting;\n\nCREATE TABLE reporting.monthly_summary (\n  month date,\n  revenue numeric(10,2)\n);",
          result: { columns: [], rows: [], command: "CREATE" },
        },
        {
          kind: "sql",
          title: "A table in a named schema is reachable by its full name",
          code: "SELECT table_schema, table_name\nFROM information_schema.tables\nWHERE table_name = 'monthly_summary';",
          result: { columns: ["table_schema", "table_name"], rows: [
        ["reporting", "monthly_summary"],
      ] },
        },
        {
          kind: "callout",
          tone: "info",
          title: "About public",
          text: "Every new database starts with a schema named **public** — the default folder. When you write `FROM customers` with no prefix, PostgreSQL looks in public (or wherever your search_path points). The six sample databases in this course keep all their tables in public for simplicity; real applications often add schemas like reporting, staging or audit alongside it.",
        },
        {
          kind: "lab",
          title: "See the hierarchy from inside",
          task: "Every sample database keeps its tables in the public schema. This query lists them — notice the schema_name column is public for all of them, and the table names match the schema explorer.",
          code: "SELECT table_schema, table_name\nFROM information_schema.tables\nWHERE table_schema = 'public'\nORDER BY table_name;",
          dataset: "ecommerce",
          hint: "information_schema is PostgreSQL's own catalog of itself — a set of views describing your database's structure.",
        },
      ],
      terms: [
        { term: "Server", definition: "One running PostgreSQL program managing many databases on one machine and port." },
        { term: "Database", definition: "An isolated world inside a server: its own tables, users and rules; queries cannot cross databases." },
        { term: "Schema", definition: "A named folder inside a database organizing tables; public is the default one." },
        { term: "search_path", definition: "The list of schemas PostgreSQL searches when a table name has no prefix." },
      ],
      mistakes: [
        {
          mistake: "Creating a new database per feature or per table",
          why: "Databases are isolation walls — splitting one application across databases hides its tables from each other and from single queries.",
          fix: "One application, one database. Use schemas as folders inside it if you need organization.",
        },
        {
          mistake: "Prefixing every table with public. by hand",
          why: "It works, but it is noise: public is already on the default search_path.",
          fix: "Plain table names inside your own database's default schema; prefix only when you deliberately cross schemas.",
        },
      ],
      takeaways: [
        "Server contains databases; databases contain schemas; schemas contain tables.",
        "CREATE DATABASE makes an isolated world; you must connect to it to use it.",
        "Schemas are folders within one database — reachable by name, no reconnect needed.",
        "public is the default schema every database starts with.",
      ],
      quiz: [
        {
          id: "b-03-q1",
          prompt: "A query running in database A cannot SELECT from a table in database B on the same server. Why?",
          options: [
            { text: "Because databases are isolation boundaries — connections live inside exactly one", correct: true, feedback: "Correct — to reach B's tables you connect to B." },
            { text: "Because of a missing foreign key", correct: false, feedback: "Foreign keys relate tables, not databases — and exist inside one database." },
            { text: "Because tables must be in the public schema", correct: false, feedback: "Schema location is irrelevant; the database boundary is the blocker." },
          ],
          explanation: "PostgreSQL connections attach to one database. Cross-database access is not a query feature — you reconnect or replicate data.",
        },
        {
          id: "b-03-q2",
          prompt: "You write FROM orders with no schema prefix. Where does PostgreSQL look?",
          options: [
            { text: "In every database on the server", correct: false, feedback: "Only the connected database is visible at all." },
            { text: "In the schemas on your search_path — public by default", correct: true, feedback: "Correct — the search_path (usually just public) resolves unprefixed names." },
            { text: "Nowhere — prefixes are mandatory", correct: false, feedback: "Prefixes are optional; the search_path exists precisely so they can be omitted." },
          ],
          explanation: "Unprefixed table names resolve through search_path, whose default value includes public — which is why the course's sample tables need no prefix.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-04",
      title: "CREATE TABLE",
      minutes: 14,
      summary: "Define a table's name, columns, types and primary key — the moment your own schema is born.",
      kind: "coding",
      objectives: [
        "Write a CREATE TABLE statement with typed columns",
        "Declare a primary key inside the table definition",
        "Explain NOT NULL and DEFAULT on columns",
        "Read the error PostgreSQL gives for a duplicate table",
      ],
      why: "Every database you will ever use started as someone's CREATE TABLE statements. This is where Part A's concepts become syntax you write: each table is one kind of thing, each column is a typed fact, and the primary key you reasoned about abstractly becomes two keywords in a definition. After this lesson you can give structure to any idea — and the six sample databases stop being magic, because you could have built their skeletons yourself.",
      blocks: [
        {
          kind: "text",
          text: "A table is created with one statement: a name, then a parenthesized list of columns. Each column is a **name**, a **type**, and optionally rules like NOT NULL or DEFAULT. A constraint clause at the end — usually PRIMARY KEY — names the identity column. Here is the pattern, applied to a small book-tracking table on a blank schema:",
        },
        {
          kind: "sql",
          title: "Your first CREATE TABLE",
          code: "CREATE TABLE books (\n  book_id    int           PRIMARY KEY,\n  title      text          NOT NULL,\n  author     text          NOT NULL,\n  published  date,\n  pages      int,\n  price      numeric(10,2),\n  in_stock   boolean       NOT NULL DEFAULT true\n);",
          result: { columns: [], rows: [], command: "CREATE" },
        },
        {
          kind: "text",
          text: "Read it column by column. `book_id int PRIMARY KEY` — an integer identity; PostgreSQL builds a unique index on it automatically. `title text NOT NULL` — a required text fact. `published date` — optional (NULL allowed). `price numeric(10,2)` — exact money with two decimal places. `in_stock boolean NOT NULL DEFAULT true` — required, and when an INSERT forgets it, `true` is used. The statement returns no rows — just a confirmation that it worked.",
        },
        {
          kind: "sql",
          title: "PostgreSQL confirms with a command tag",
          code: "CREATE TABLE editions (\n  edition_id int PRIMARY KEY,\n  book_id    int NOT NULL,\n  format     text NOT NULL,\n  released   date\n);",
          result: { columns: [], rows: [], command: "CREATE" },
        },
        { kind: "heading", text: "What happens when a table already exists" },
        {
          kind: "text",
          text: "Run CREATE TABLE for a name that is taken and PostgreSQL refuses — with an error naming the conflict. This is your first expectError block: run it and read the real message, because this exact error greets every beginner eventually.",
        },
        {
          kind: "sql",
          title: "A deliberate collision",
          code: "CREATE TABLE books (\n  book_id int PRIMARY KEY,\n  title   text\n);",
          expectError: "relation \"books\" already exists",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "IF NOT EXISTS — create-if-absent",
          text: "Scripts that may run twice often write `CREATE TABLE IF NOT EXISTS books (...)`. When the table exists, PostgreSQL skips silently instead of erroring. Useful in migrations; in the Lab, plain CREATE TABLE keeps you honest.",
        },
        { kind: "heading", text: "Seeing what you built" },
        {
          kind: "text",
          text: "After creating tables you can ask PostgreSQL to describe them — psql's `\\d books` does this interactively; SQL-wise, the information_schema catalog lists your columns and types. Both views below show the same truth: your definition, stored and enforced.",
        },
        {
          kind: "sql",
          title: "Your schema, as the engine sees it",
          code: "SELECT table_name, column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'books'\nORDER BY ordinal_position;",
          result: { columns: ["table_name", "column_name", "data_type", "is_nullable"], rows: [
        ["books", "book_id", "integer", "NO"],
        ["books", "title", "text", "NO"],
        ["books", "author", "text", "NO"],
        ["books", "published", "date", "YES"],
        ["books", "pages", "integer", "YES"],
        ["books", "price", "numeric", "YES"],
        ["books", "in_stock", "boolean", "NO"],
      ] },
        },
        {
          kind: "lab",
          title: "Create your own table now",
          task: "In the Lab this lesson runs on a blank schema — nothing exists yet. Create a members table for a club: an integer primary key, a required name, an optional email, and a joined date. Then describe it with the information_schema query. (The Lab's schema explorer also refreshes after DDL — look left after you run.)",
          code: "CREATE TABLE members (\n  member_id int PRIMARY KEY,\n  name      text NOT NULL,\n  email     text,\n  joined    date\n);\n\nSELECT column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'members'\nORDER BY ordinal_position;",
          hint: "One statement creates; one statement inspects. Run them together — the Lab executes each and shows the last result.",
        },
      ],
      terms: [
        { term: "CREATE TABLE", definition: "The statement that defines a new table: its columns, their types and rules." },
        { term: "NOT NULL", definition: "A column rule forbidding missing values — every row must carry one." },
        { term: "DEFAULT", definition: "A value PostgreSQL fills in when an INSERT omits the column." },
        { term: "information_schema", definition: "PostgreSQL's standard catalog of its own structure — tables, columns, types." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the type on a column",
          why: "CREATE TABLE demands a type for every column; the parser stops at the missing one.",
          fix: "Every column line: name, type, then optional rules. If it reads like a sentence, it is right.",
        },
        {
          mistake: "Creating a table twice because 'nothing seemed to happen'",
          why: "CREATE TABLE returns no rows, only a tag — beginners re-run it and meet the already-exists error.",
          fix: "Trust the command tag, and verify with the schema explorer or information_schema.",
        },
      ],
      takeaways: [
        "CREATE TABLE = name + typed columns + optional rules + primary key.",
        "NOT NULL forbids missing values; DEFAULT fills omitted ones.",
        "Duplicate names are rejected with 'already exists' — the first expectError you met.",
        "information_schema (or \\d in psql) shows your structure back to you.",
      ],
      quiz: [
        {
          id: "b-04-q1",
          prompt: "What does the column definition `in_stock boolean NOT NULL DEFAULT true` guarantee?",
          options: [
            { text: "Every row has an in_stock value, and inserts that omit it get true", correct: true, feedback: "Correct — NOT NULL forces presence, DEFAULT supplies the value when omitted." },
            { text: "The column can never be false", correct: false, feedback: "DEFAULT true is only the fill-in value; false is a legal stored value." },
            { text: "The column is a primary key", correct: false, feedback: "Primary keys are declared with PRIMARY KEY; booleans make poor keys anyway." },
          ],
          explanation: "NOT NULL + DEFAULT true means: required, and if your INSERT leaves it out, PostgreSQL stores true for you.",
        },
        {
          id: "b-04-q2",
          prompt: "You run CREATE TABLE books (...) and PostgreSQL answers with an error mentioning that books already exists. What happened?",
          options: [
            { text: "A table named books was already created earlier in this session", correct: true, feedback: "Correct — the name is taken; PostgreSQL refuses rather than overwrite." },
            { text: "PostgreSQL is still starting up", correct: false, feedback: "Startup issues look nothing like a name conflict." },
            { text: "books is a reserved word", correct: false, feedback: "It is not — and reserved words produce a syntax error, not this message." },
          ],
          explanation: "The already-exists error means exactly what it says. Use a different name, drop the old table deliberately, or use IF NOT EXISTS.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-05",
      title: "INSERT",
      minutes: 14,
      summary: "Put rows into your tables — one or many at a time, with explicit columns, and RETURNING to see what landed.",
      kind: "coding",
      objectives: [
        "Insert single and multiple rows with explicit column lists",
        "Explain why the column list matters more than convenience",
        "Use INSERT ... RETURNING to confirm what was stored",
        "Read the duplicate-primary-key error PostgreSQL gives",
      ],
      why: "A table without rows answers no questions. INSERT is how data enters the world you built in b-04, and its habits decide your data quality forever: explicit column lists survive schema growth, RETURNING proves what actually landed, and the duplicate-key error teaches — viscerally — that primary keys are enforced, not decorative. This lesson builds the book table you will query for the rest of Part B.",
      blocks: [
        {
          kind: "text",
          text: "INSERT adds rows. The disciplined form always names the columns being filled, then supplies values for exactly those columns, in order. We reuse the books table from lesson b-04 — and because every lesson starts from a fresh schema, the first block recreates it, so this lesson stands on its own.",
        },
        {
          kind: "sql",
          title: "The books table, back for this lesson",
          code: "CREATE TABLE books (\n  book_id    int           PRIMARY KEY,\n  title      text          NOT NULL,\n  author     text          NOT NULL,\n  published  date,\n  pages      int,\n  price      numeric(10,2),\n  in_stock   boolean       NOT NULL DEFAULT true\n);",
          result: { columns: [], rows: [], command: "CREATE" },
        },
        {
          kind: "sql",
          title: "One row, explicit columns",
          code: "INSERT INTO books (book_id, title, author, published, pages, price, in_stock)\nVALUES (1, 'The Long Way to a Small Angry Planet', 'Becky Chambers', DATE '2015-03-10', 441, 16.99, true);",
          result: { columns: [], rows: [], command: "INSERT" },
        },
        {
          kind: "text",
          text: "Why insist on the column list when PostgreSQL would accept a bare values list? Because schemas grow. Add one column to the table and every list-less INSERT in your codebase breaks with a confusing count error; explicit lists keep working, filling the new column with its default. It is the same lesson as Part A's keys: structure that survives change.",
        },
        { kind: "heading", text: "Many rows at once" },
        {
          kind: "sql",
          title: "A multi-row INSERT — the normal way to load data",
          code: "INSERT INTO books (book_id, title, author, published, pages, price, in_stock)\nVALUES\n  (2, 'Project Hail Mary', 'Andy Weir', DATE '2021-05-04', 476, 20.00, true),\n  (3, 'A Short History of Nearly Everything', 'Bill Bryson', DATE '2003-05-06', 544, 14.95, true),\n  (4, 'Circe', 'Madeline Miller', DATE '2018-04-10', 393, 18.50, false);",
          result: { columns: [], rows: [], command: "INSERT" },
        },
        {
          kind: "text",
          text: "Values are matched to the column list by POSITION — the second value fills the second listed column. Types are checked as they arrive: DATE '2021-05-04' is an explicit date literal, and `pages` must be an integer. One wrong value and the whole statement is refused — nothing half-lands.",
        },
        { kind: "heading", text: "RETURNING — the receipt" },
        {
          kind: "sql",
          title: "See what actually landed",
          code: "INSERT INTO books (book_id, title, author, published, pages, price, in_stock)\nVALUES (5, 'The Left Hand of Darkness', 'Ursula K. Le Guin', DATE '1969-03-01', 304, 15.25, true)\nRETURNING book_id, title, price;",
          result: { columns: ["book_id", "title", "price"], rows: [
        ["5", "The Left Hand of Darkness", "15.25"],
      ] },
        },
        {
          kind: "text",
          text: "RETURNING turns the INSERT into a mini-SELECT over the rows it just wrote. Professionals use it constantly: it proves the write, returns generated ids to the application, and removes the guess-then-query dance.",
        },
        { kind: "heading", text: "When the key says no" },
        {
          kind: "text",
          text: "book_id is the primary key, so PostgreSQL enforces its uniqueness — not as a policy, but as a physical guarantee. Try to insert a second book 1 and watch the refusal, with the exact error a million applications meet daily:",
        },
        {
          kind: "sql",
          title: "A duplicate primary key, rejected at the door",
          code: "INSERT INTO books (book_id, title, author, published, pages, price, in_stock)\nVALUES (1, 'An Imposter Copy', 'Nobody', DATE '2026-01-01', 100, 9.99, true);",
          expectError: "duplicate key value violates unique constraint \"books_pkey\"",
        },
        {
          kind: "sql",
          title: "The table still holds exactly what succeeded before",
          code: "SELECT book_id, title, in_stock\nFROM books\nORDER BY book_id;",
          result: { columns: ["book_id", "title", "in_stock"], rows: [
        ["1", "The Long Way to a Small Angry Planet", "true"],
        ["2", "Project Hail Mary", "true"],
        ["3", "A Short History of Nearly Everything", "true"],
        ["4", "Circe", "false"],
        ["5", "The Left Hand of Darkness", "true"],
      ] },
        },
        {
          kind: "lab",
          title: "Load your own table",
          task: "The Lab runs on a blank schema here. Create a films table (film_id int primary key, title text not null, year int, rating numeric(3,1)), then insert three rows in one statement with RETURNING title, year — and watch the receipt come back.",
          code: "CREATE TABLE films (\n  film_id int PRIMARY KEY,\n  title   text NOT NULL,\n  year    int,\n  rating  numeric(3,1)\n);\n\nINSERT INTO films (film_id, title, year, rating)\nVALUES\n  (1, 'Arrival', 2016, 7.9),\n  (2, 'Parasite', 2019, 8.5),\n  (3, 'Dune', 2021, 8.0)\nRETURNING title, year;",
          hint: "Multi-statement runs execute each statement; the results panel shows the last one's output.",
        },
      ],
      terms: [
        { term: "INSERT INTO ... VALUES", definition: "The statement adding rows to a table, matching values to columns by position." },
        { term: "Explicit column list", definition: "Naming the target columns in the INSERT — the habit that survives schema growth." },
        { term: "RETURNING", definition: "A clause echoing back the rows an INSERT/UPDATE/DELETE actually wrote." },
        { term: "Date literal", definition: "An explicit date value like DATE '2021-05-04' — unambiguous across settings and locales." },
      ],
      mistakes: [
        {
          mistake: "Inserting without a column list",
          why: "It silently depends on the table's column order staying identical forever — the first ALTER TABLE breaks every such INSERT.",
          fix: "Always list the columns. Ten extra characters now, zero breakage later.",
        },
        {
          mistake: "Assuming a failed INSERT partially stored its rows",
          why: "A multi-row INSERT with one bad value is refused entirely — PostgreSQL statements are atomic, all-or-nothing.",
          fix: "Trust the error: nothing landed. Fix the value and re-run the whole statement.",
        },
        {
          mistake: "Writing dates as '05/04/2021'",
          why: "Ambiguous formats mean different days in different locales — and PostgreSQL may reject or misread them.",
          fix: "Use ISO date literals: DATE '2021-05-04'. Year first, always unambiguous.",
        },
      ],
      takeaways: [
        "INSERT with an explicit column list; values match by position.",
        "Multi-row VALUES is the normal, fast way to load data.",
        "RETURNING gives you a receipt — use it to prove and inspect writes.",
        "Primary keys are physically enforced: duplicates are rejected whole.",
      ],
      quiz: [
        {
          id: "b-05-q1",
          prompt: "INSERT INTO films (film_id, title) VALUES (4, 'Nope') — but the films table also has year and rating columns. What happens?",
          options: [
            { text: "The insert fails: all columns must be provided", correct: false, feedback: "Unlisted columns take their DEFAULT — or NULL when there is none." },
            { text: "The row is stored with year and rating as NULL", correct: true, feedback: "Correct — omitted columns fall back to DEFAULT, else NULL (when allowed)." },
            { text: "The insert fails: title must be unique", correct: false, feedback: "Nothing in the setup demands unique titles." },
          ],
          explanation: "Omitted columns use their DEFAULT; with no default, they become NULL — provided the column allows NULL. A NOT NULL column without default would make the insert fail.",
        },
        {
          id: "b-05-q2",
          prompt: "Why attach RETURNING to an INSERT?",
          options: [
            { text: "To see exactly what was stored without a separate SELECT", correct: true, feedback: "Correct — it is the write's receipt, including generated values." },
            { text: "To make the insert faster", correct: false, feedback: "RETURNING is about visibility, not performance." },
            { text: "To allow inserting multiple rows", correct: false, feedback: "Multi-row VALUES does that; RETURNING is optional reporting." },
          ],
          explanation: "RETURNING selects back the written rows — proof, generated ids, and one round-trip saved.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-06",
      title: "Meet psql, your terminal friend",
      minutes: 12,
      summary: "The professional's client: connect, list, describe, run files — the commands you will use for the rest of your career.",
      kind: "setup",
      objectives: [
        "Connect to a database with psql",
        "Use \\dt, \\d, \\l, \\c and \\q fluently",
        "Run a .sql file with psql -f",
        "Explain why terminal fluency still matters in a GUI world",
      ],
      why: "Graphical tools are lovely, but psql is the one PostgreSQL client that is ALWAYS there — on every server you will ever SSH into, in every container, in every recovery scenario at 2am. The five backslash commands in this lesson cover ninety percent of daily psql life, and the confidence of driving a database from a bare terminal is a genuine professional asset.",
      blocks: [
        {
          kind: "text",
          text: "**psql** is the terminal client that installs alongside PostgreSQL. You launch it against a database and get a prompt where SQL and special backslash commands mix freely. Connect to a database named shop like this:",
        },
        {
          kind: "sql",
          title: "Connecting (terminal)",
          code: "$ psql shop\npsql (18.6)\nType \"help\" for help.\n\nshop=#",
          lang: "psql",
        },
        {
          kind: "text",
          text: "The prompt ends in `#` because you are the database owner here (superuser); ordinary users see `=>`. From this prompt, five commands carry most of the weight:",
        },
        {
          kind: "table",
          title: "The big five backslash commands",
          headers: ["Command", "What it does", "You will use it to"],
          rows: [
            ["\\dt", "Lists tables in the current schema", "See what exists after CREATE TABLE"],
            ["\\d books", "Describes one table: columns, types, keys, indexes", "Check a definition without writing SQL"],
            ["\\l", "Lists all databases on the server", "Orient yourself on a new machine"],
            ["\\c university", "Connects to another database", "Move between worlds without restarting"],
            ["\\q", "Quits psql", "Leave politely"],
          ],
          caption: "Backslash commands are psql conveniences, not SQL — they only work at the psql prompt.",
        },
        {
          kind: "sql",
          title: "A realistic first session (transcript)",
          code: "shop=# \\dt\n           List of relations\n Schema |    Name     | Type  | Owner\n--------+-------------+-------+-------\n public | books       | table | z\n public | editions    | table | z\n(2 rows)\n\nshop=# \\d books\n              Table \"public.books\"\n   Column   |     Type      | Nullable\n------------+---------------+----------\n book_id    | integer       | not null\n title      | text          | not null\n published  | date          |\nIndexes:\n    \"books_pkey\" PRIMARY KEY, btree (book_id)",
          lang: "psql",
        },
        { kind: "heading", text: "Running files" },
        {
          kind: "text",
          text: "Real work arrives as .sql files — migrations, exports, setup scripts. From the shell (not the psql prompt), run a file against a database with `-f`; psql executes every statement in order and reports the tags:",
        },
        {
          kind: "sql",
          title: "Executing a script file (shell)",
          code: "$ psql shop -f setup.sql\nCREATE TABLE\nINSERT 0 3\nINSERT 0 1",
          lang: "psql",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The two-prompt rule",
          text: "Backslash commands live at the psql prompt; SQL lives everywhere. If you type \\dt into an application's SQL box, it will not understand — send SQL to SQL connections, psql commands to psql.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why bother when GUIs exist?",
          text: "pgAdmin, DBeaver and DataGrip are excellent daily drivers. But servers you reach over SSH offer no GUI, containers run headless, and recovery situations leave you exactly one tool: psql. Learn the big five now; thank yourself later.",
        },
        {
          kind: "lab",
          title: "Practice the psql mindset, from the Lab",
          task: "The Lab gives you the same information psql's \\d gives — through SQL. This query is essentially the Lab's schema explorer in query form: try it on a couple of different sample databases via the selector.",
          code: "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'public'\n  AND table_name = 'customers'\nORDER BY ordinal_position;",
          dataset: "ecommerce",
          hint: "Switch the database selector to hr and run it again with table_name = 'employees' — same catalog, different world.",
        },
      ],
      terms: [
        { term: "psql", definition: "PostgreSQL's terminal client: SQL plus backslash meta-commands." },
        { term: "Backslash command", definition: "A psql prompt command like \\dt or \\d — client-side, not SQL." },
        { term: "psql -f file.sql", definition: "Runs a script file's statements in order against a database." },
        { term: "Prompt markers", definition: "psql shows # for superusers and => for ordinary users." },
      ],
      mistakes: [
        {
          mistake: "Typing \\dt into an application's SQL editor",
          why: "Backslash commands are psql client features; any other connection sees them as syntax errors.",
          fix: "SQL everywhere; backslash commands only at a psql prompt.",
        },
        {
          mistake: "Connecting to a database that does not exist and reading the error as a broken install",
          why: "psql: error: connection ... does not exist simply means the name is wrong or the database was never created.",
          fix: "Run \\l to list what actually exists, then \\c to the right name.",
        },
      ],
      takeaways: [
        "psql is always there — the one client every server guarantees.",
        "\\dt (tables), \\d (describe), \\l (databases), \\c (connect), \\q (quit).",
        "psql -f file.sql runs scripts statement by statement.",
        "Backslash commands are client-side; SQL is universal.",
      ],
      quiz: [
        {
          id: "b-06-q1",
          prompt: "At a psql prompt, which command describes the columns of the books table?",
          options: [
            { text: "\\dt books", correct: false, feedback: "\\dt lists tables (\\dt alone); describing one table is \\d's job." },
            { text: "\\d books", correct: true, feedback: "Correct — \\d plus a table name prints its columns, types, keys and indexes." },
            { text: "DESCRIBE books;", correct: false, feedback: "That syntax belongs to other databases, not PostgreSQL." },
          ],
          explanation: "\\d books is PostgreSQL's describe command — the fastest way to inspect a table at a psql prompt.",
        },
        {
          id: "b-06-q2",
          prompt: "You SSH into a server with a PostgreSQL container and need to inspect its tables. No GUI is installed. What is guaranteed to work?",
          options: [
            { text: "psql inside the container", correct: true, feedback: "Correct — psql ships with every PostgreSQL install, GUI or none." },
            { text: "Installing pgAdmin remotely", correct: false, feedback: "Possible in theory, heavyweight in practice — and never the 2am answer." },
            { text: "Nothing — you must export the data", correct: false, feedback: "Far from it: the terminal is PostgreSQL's native habitat." },
          ],
          explanation: "psql exists wherever PostgreSQL exists. That reliability is exactly why terminal fluency is a professional asset.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "b-07",
      title: "Practice: build a tiny library",
      minutes: 15,
      summary: "Everything from this part in one build: create the tables, insert the rows, and query your own database back.",
      kind: "coding",
      objectives: [
        "Design and create a three-table schema from scratch",
        "Insert realistic rows across tables",
        "Query your own tables to answer questions",
        "Feel the full loop: define, fill, ask",
      ],
      why: "Reading about CREATE TABLE and INSERT is like reading about swimming. This lesson is the water: you build a small but complete library database — members, books, and loans connecting them — using every statement from this part, and answer real questions against your own schema. When the last query returns the rows you inserted, the loop from idea to data closes for the first time.",
      blocks: [
        {
          kind: "text",
          text: "The design, in words: a **members** table (one row per library member), a **books** table (one row per copy the library owns), and a **loans** table connecting them — each loan is one member borrowing one book on a date. Sound familiar? It is exactly the Part A mini-project pattern, in miniature.",
        },
        {
          kind: "visual",
          title: "The tiny library",
          ascii: `  members                 loans                  books
  +-----------+----+      +----------+---------+--------+
  | member_id | .. |<-----| member_id| book_id | dates  |----->| book_id | .. |
  +-----------+----+      +----------+---------+--------+      +--------+----+
       (1)                     (the junction)                    (1)
  one member - many loans - one book each time`,
          caption: "Loans is the junction table from lesson a-07 — pairing members with books, carrying its own dates.",
        },
        {
          kind: "lab",
          title: "Step 1 — the tables",
          task: "Run this on the Lab's blank schema. Three CREATE TABLE statements: members and books stand alone; loans references both with foreign keys and takes a composite primary key. Watch the schema explorer populate after it runs.",
          code: "CREATE TABLE members (\n  member_id  int PRIMARY KEY,\n  name       text NOT NULL,\n  joined     date NOT NULL\n);\n\nCREATE TABLE books (\n  book_id    int PRIMARY KEY,\n  title      text NOT NULL,\n  author     text NOT NULL\n);\n\nCREATE TABLE loans (\n  member_id  int NOT NULL REFERENCES members(member_id),\n  book_id    int NOT NULL REFERENCES books(book_id),\n  borrowed   date NOT NULL,\n  returned   date,\n  PRIMARY KEY (member_id, book_id, borrowed)\n);",
          hint: "loans has no id of its own — its identity is the combination: who, what, when.",
        },
        {
          kind: "lab",
          title: "Step 2 — the data",
          task: "Fill all three tables. Note loans.borrowed_is_returned: returned is NULL while a book is still out. Two loans are open — those books are currently on loan.",
          code: "INSERT INTO members (member_id, name, joined) VALUES\n  (1, 'Ana Petrov', DATE '2026-01-12'),\n  (2, 'Ben Okafor', DATE '2026-02-03'),\n  (3, 'Cleo Fontaine', DATE '2026-03-20');\n\nINSERT INTO books (book_id, title, author) VALUES\n  (1, 'The Left Hand of Darkness', 'Ursula K. Le Guin'),\n  (2, 'Project Hail Mary', 'Andy Weir'),\n  (3, 'Circe', 'Madeline Miller');\n\nINSERT INTO loans (member_id, book_id, borrowed, returned) VALUES\n  (1, 1, DATE '2026-04-02', DATE '2026-04-19'),\n  (1, 2, DATE '2026-05-01', NULL),\n  (2, 3, DATE '2026-05-03', NULL);",
          hint: "If a re-run collides with existing rows, use the Lab's Reset database button — the blank schema returns.",
        },
        {
          kind: "lab",
          title: "Step 3 — the questions",
          task: "Your database can now answer questions. Run each of these one at a time (edit between runs): which books exist; which members joined after February; which books are currently out (returned IS NULL); who has the open loans. You already know every clause from Part A's reading and this part's doing.",
          code: "SELECT m.name, b.title, l.borrowed\nFROM loans l\nJOIN members m ON m.member_id = l.member_id\nJOIN books b ON b.book_id = l.book_id\nWHERE l.returned IS NULL;",
          hint: "This preview query uses JOIN, which Part F teaches formally — run it now as a taste of where you are going, then break it apart to see which parts you can already explain.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "You just did the whole job",
          text: "Define the world (CREATE TABLE), fill it (INSERT), ask it questions (SELECT). Every database project in history, from a reading log to a bank, is these three verbs at different scales. Parts C onward make the asking gloriously precise.",
        },
      ],
      terms: [
        { term: "Junction table", definition: "A table whose rows pair rows of two other tables — here, loans pairing members with books." },
        { term: "Open loan", definition: "A loans row whose returned date is still NULL — the book is out." },
        { term: "Composite primary key", definition: "Identity from several columns together: (member_id, book_id, borrowed)." },
      ],
      mistakes: [
        {
          mistake: "Inserting a loan before its member or book exists",
          why: "The foreign keys refuse it — the reference would dangle.",
          fix: "Load parents first (members, books), then the junction. The error message names the constraint that stopped you.",
        },
        {
          mistake: "Re-running the inserts after the first success",
          why: "The primary keys now exist; duplicates are rejected whole.",
          fix: "Reset the Lab database (or DROP the tables) before rebuilding — the fresh-schema habit.",
        },
      ],
      takeaways: [
        "The define-fill-ask loop IS database work, at every scale.",
        "Junction tables pair things and carry their own facts (dates).",
        "NULL in returned marks an open loan — an interval that has not ended.",
        "Load referenced tables before referencing ones; parents before children.",
      ],
      quiz: [
        {
          id: "b-07-q1",
          prompt: "Why does loans use a composite primary key of (member_id, book_id, borrowed) instead of a single column?",
          options: [
            { text: "No single column identifies a loan: the same member can borrow the same book on different dates", correct: true, feedback: "Correct — identity is the combination who+what+when." },
            { text: "Because foreign keys require it", correct: false, feedback: "Foreign keys constrain values; they say nothing about which columns form the key." },
            { text: "Because three columns sort faster", correct: false, feedback: "Performance is not identity's job." },
          ],
          explanation: "A member re-borrowing a book later is a NEW loan — only the full combination (who, what, when) picks out exactly one row.",
        },
        {
          id: "b-07-q2",
          prompt: "Which loan rows represent books that are currently out?",
          options: [
            { text: "Rows where returned IS NULL", correct: true, feedback: "Correct — the interval has not ended, so the book is still borrowed." },
            { text: "Rows where returned = borrowed", correct: false, feedback: "That would be a same-day return, not an open loan." },
            { text: "All rows in loans", correct: false, feedback: "Some loans have been returned — those books are home." },
          ],
          explanation: "An open interval ends in NULL — the same pattern as the hospital's open admissions. WHERE returned IS NULL finds them.",
        },
      ],
    },
  ],

  exercises: [
    {
      id: "b-b1",
      tier: "beginner",
      mode: "sql",
      title: "Describe a table with SQL",
      prompt: "The psql command \\d employees shows a table's columns, but SQL can do the same through the catalog. Query the information_schema.columns view for the table named 'employees' in the public schema. Return three columns: column_name, data_type and is_nullable, in that order, sorted by ordinal_position (the column's position in the table). The first rows you get should be employee_id, integer and NO.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Filter with WHERE table_schema = 'public' AND table_name = 'employees'.",
      starter: "SELECT column_name, data_type, is_nullable\nFROM information_schema.columns\n-- filter and sort here\n",
      solution: `SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'employees'
ORDER BY ordinal_position`,
      ordered: true,
      expected: { columns: ["column_name", "data_type", "is_nullable"], rows: [
        ["employee_id", "integer", "NO"],
        ["first_name", "text", "NO"],
        ["last_name", "text", "NO"],
        ["email", "text", "NO"],
        ["dept_id", "integer", "NO"],
        ["job_title", "text", "NO"],
        ["manager_id", "integer", "YES"],
        ["hire_date", "date", "NO"],
        ["salary", "numeric", "NO"],
        ["terminated", "date", "YES"],
        ["is_remote", "boolean", "NO"],
      ] },
      explanation:
        "The information_schema is PostgreSQL describing itself: one row per column, with ordinal_position preserving the CREATE TABLE order. Filtering on schema AND table narrows it to the one table you care about. This is exactly what \\d prints for you at a psql prompt — and what the Lab's schema explorer renders.",
      concepts: ["information_schema", "catalog", "filtering"],
    },
    {
      id: "b-b2",
      tier: "beginner",
      mode: "sql",
      title: "Count the tables",
      prompt: "Before querying data, professionals orient: what tables exist, and how many? Query the information_schema.tables view for the public schema only. Return two columns: table_name and table_type, in that order, sorted by table_name. Every row should be of table_type 'BASE TABLE' (the catalog's name for ordinary tables). You should see all seven ShopSphere tables, from categories to reviews.",
      dataset: "ecommerce",
      sampleTables: ["customers", "products"],
      hint: "WHERE table_schema = 'public' is the key filter — the catalog contains many system schemas too.",
      starter: "SELECT table_name, table_type\nFROM information_schema.tables\n-- filter and sort\n",
      solution: `SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name`,
      ordered: true,
      expected: { columns: ["table_name", "table_type"], rows: [
        ["categories", "BASE TABLE"],
        ["customers", "BASE TABLE"],
        ["order_items", "BASE TABLE"],
        ["orders", "BASE TABLE"],
        ["payments", "BASE TABLE"],
        ["products", "BASE TABLE"],
        ["reviews", "BASE TABLE"],
      ] },
      explanation:
        "information_schema.tables lists every table the engine knows, including system ones — the schema filter keeps only yours. Sorted by name, the seven ShopSphere tables appear in alphabetical order: categories, customers, order_items, orders, payments, products, reviews. The Lab's schema explorer shows this same list with row counts attached.",
      concepts: ["information_schema", "orientation"],
    },
    {
      id: "b-b3",
      tier: "beginner",
      mode: "sql",
      title: "Write your first CREATE TABLE",
      prompt: "Time to build. This exercise runs on a blank schema. Create a table named cities with three columns: city_id of type int as the primary key, name of type text which must not be null, and population of type int. After the CREATE, prove it exists by querying information_schema.columns for the table named 'cities' — return column_name and data_type, in that order, sorted by ordinal_position. Your final output should be three rows: city_id/integer, name/text, population/integer.",
      dataset: "ecommerce",
      sampleTables: ["customers"],
      hint: "Two statements: the CREATE TABLE, then the catalog SELECT. Validation runs them in order on a fresh blank schema.",
      starter: "-- 1. create the table\n\n-- 2. prove it: query information_schema.columns\nSELECT column_name, data_type\nFROM information_schema.columns\nWHERE table_name = 'cities'\nORDER BY ordinal_position;",
      solution: `CREATE TABLE cities (
  city_id     int PRIMARY KEY,
  name        text NOT NULL,
  population  int
);

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cities'
ORDER BY ordinal_position;`,
      ordered: true,
      expected: { columns: ["column_name", "data_type"], rows: [
        ["city_id", "integer"],
        ["name", "text"],
        ["population", "integer"],
      ] },
      explanation:
        "The CREATE defines the world; the catalog query proves it. The output shows exactly what you declared — city_id/integer, name/text, population/integer — because information_schema reads the definition back. This create-then-verify loop is the safest habit in schema work: never trust, always confirm.",
      concepts: ["CREATE TABLE", "information_schema", "verification"],
    },
    {
      id: "b-b4",
      tier: "beginner",
      mode: "sql",
      title: "Insert with a receipt",
      prompt: "This exercise runs on a blank schema. First create a table named snacks with columns snack_id (int, primary key), name (text, not null) and price (numeric(5,2)). Then insert two rows in ONE statement — (1, 'almond croissant', 3.75) and (2, 'espresso', 2.40) — and attach RETURNING snack_id, name, price so the insert produces a result. Your output should be the two rows you inserted, with those three columns. (Order is not graded here — RETURNING lists rows as they were written; you will sort explicitly in Part C.)",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "INSERT INTO snacks (columns...) VALUES (...), (...) RETURNING snack_id, name, price;",
      starter: "CREATE TABLE snacks (\n  snack_id int PRIMARY KEY,\n  name     text NOT NULL,\n  price    numeric(5,2)\n);\n\n-- now the insert with RETURNING\n",
      solution: `CREATE TABLE snacks (
  snack_id int PRIMARY KEY,
  name     text NOT NULL,
  price    numeric(5,2)
);

INSERT INTO snacks (snack_id, name, price)
VALUES
  (1, 'almond croissant', 3.75),
  (2, 'espresso', 2.40)
RETURNING snack_id, name, price;`,
      ordered: false,
      expected: { columns: ["snack_id", "name", "price"], rows: [
        ["1", "almond croissant", "3.75"],
        ["2", "espresso", "2.40"],
      ] },
      explanation:
        "RETURNING turns the INSERT into its own receipt: the output is the rows exactly as stored, in insert order. The numeric prices print with two decimals because numeric(5,2) stores exactly that — money that cannot drift. This create-insert-verify chain is the whole of Part B in four statements.",
      concepts: ["INSERT", "RETURNING", "numeric type"],
    },
    {
      id: "b-i1",
      tier: "intermediate",
      mode: "sql",
      title: "Rebuild a table the right way",
      prompt: "Bad habits arrive as copied code: a table created without NOT NULL and without a primary key. This exercise runs on a blank schema. Create a table named albums with columns album_id (int), title (text), artist (text) and released (date) — but this time declare album_id as the PRIMARY KEY and make title and artist NOT NULL. Then insert ONE row for (1, 'Kind of Blue', 'Miles Davis', DATE '1959-08-17') with RETURNING album_id, title. Your output: one row with album_id and title columns in that order.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "Everything is one CREATE TABLE plus one INSERT ... RETURNING — the discipline is in the definition.",
      starter: "-- create albums with a primary key and NOT NULL discipline\n\n-- insert with RETURNING album_id, title\n",
      solution: `CREATE TABLE albums (
  album_id  int PRIMARY KEY,
  title     text NOT NULL,
  artist    text NOT NULL,
  released  date
);

INSERT INTO albums (album_id, title, artist, released)
VALUES (1, 'Kind of Blue', 'Miles Davis', DATE '1959-08-17')
RETURNING album_id, title;`,
      ordered: true,
      expected: { columns: ["album_id", "title"], rows: [
        ["1", "Kind of Blue"],
      ] },
      explanation:
        "The visible output is small; the invisible guarantees are the point: album_id is now physically unique, and no future insert can store an album without a title or artist. Constraints are cheapest to add at creation time — they are the schema teaching future writers the rules.",
      concepts: ["constraints", "NOT NULL", "primary key"],
    },
    {
      id: "b-i2",
      tier: "intermediate",
      mode: "sql",
      title: "The catalog detective",
      prompt: "A colleague hands you a database and says only: 'something is 18.6 around here.' Prove the engine's identity: run a query against the sample database that returns exactly one column named postgres_version containing the full version string of the PostgreSQL server you are connected to. (The version() function gives it to you.) Your output should be a single row, single column.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "SELECT version() AS postgres_version;",
      starter: "-- one column, one row: the engine's identity\n",
      solution: `SELECT version() AS postgres_version;`,
      ordered: true,
      expected: { columns: ["postgres_version"], rows: [
        ["PostgreSQL 18.6 (PGlite 0.5.16) on wasm32-unknown-emscripten, compiled by emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.13 (e13ee988ce3d87a738dd8f3661d02223308c412a), 32-bit"],
      ] },
      explanation:
        "version() reports the exact server build — here, real PostgreSQL 18.6 compiled to WebAssembly (PGlite). This is the same engine answering every query in this course, the same version string you would get from a server in a datacenter. When debugging production one day, SELECT version(); is the first orientation question you ask.",
      concepts: ["version()", "orientation"],
    },
    {
      id: "b-i3",
      tier: "intermediate",
      mode: "sql",
      title: "Design a junction table",
      prompt: "This exercise runs on a blank schema. Students take courses — many on both sides, so a junction is needed. The university already has students, courses and enrollments — so you will build a miniature after-school club version of the same structure with your OWN table names: pupils, classes and takes. First create pupils (pupil_id int primary key, name text not null) and classes (class_id int primary key, name text not null). Then create the junction table named takes with columns pupil_id (int, not null, referencing pupils), class_id (int, not null, referencing classes), and grade (text, nullable). Give takes a composite primary key of (pupil_id, class_id). Finally insert pupils (1,'Ana') and (2,'Bo'), classes (10,'Biology') and (11,'Chemistry'), and the pairings (1,10,'A'), (1,11,'B'), (2,10,'A') — then SELECT pupil_id, class_id, grade FROM takes ORDER BY pupil_id, class_id as your final statement. Expected columns: pupil_id, class_id, grade — three rows. Expected columns: student_id, course_id, grade — three rows.",
      dataset: "university",
      sampleTables: ["students", "courses", "enrollments"],
      hint: "Three CREATEs (parents first), then the junction, then inserts in dependency order, then the SELECT.",
      starter: "-- 1. pupils and classes\n\n-- 2. the junction: takes\n\n-- 3. the data, parents first\n\n-- 4. the final SELECT\n",
      solution: `CREATE TABLE pupils (
  pupil_id int PRIMARY KEY,
  name     text NOT NULL
);
CREATE TABLE classes (
  class_id int PRIMARY KEY,
  name     text NOT NULL
);
CREATE TABLE takes (
  pupil_id  int NOT NULL REFERENCES pupils(pupil_id),
  class_id  int NOT NULL REFERENCES classes(class_id),
  grade     text,
  PRIMARY KEY (pupil_id, class_id)
);
INSERT INTO pupils (pupil_id, name) VALUES (1, 'Ana'), (2, 'Bo');
INSERT INTO classes (class_id, name) VALUES (10, 'Biology'), (11, 'Chemistry');
INSERT INTO takes (pupil_id, class_id, grade) VALUES
  (1, 10, 'A'),
  (1, 11, 'B'),
  (2, 10, 'A');
SELECT pupil_id, class_id, grade
FROM takes
ORDER BY pupil_id, class_id;`,
      ordered: true,
      expected: { columns: ["pupil_id", "class_id", "grade"], rows: [
        ["1", "10", "A"],
        ["1", "11", "B"],
        ["2", "10", "A"],
      ] },
      explanation:
        "The build order matters and the database enforces it: parents before children, references before referencing. The composite key (student_id, course_id) means a student can take many courses and a course can appear for many students — but the same pair only once (re-taking a course in a later term would need the term in the key, exactly like the university database's enrollments). Your output is the junction's contents: three pairings with grades.",
      concepts: ["junction table", "foreign keys", "composite key", "insert order"],
    },
    {
      id: "b-i4",
      tier: "intermediate",
      mode: "sql",
      title: "Default behavior, observed",
      prompt: "This exercise runs on a blank schema. Create a table named alerts with columns alert_id (int primary key), message (text not null), severity (text not null default 'info') and acknowledged (boolean not null default false). Insert ONE row providing only alert_id and message — values (1, 'disk usage above threshold') — with RETURNING alert_id, severity, acknowledged. Your output: one row showing the defaults the engine filled in. Then, in the same script, SELECT alert_id, message, severity, acknowledged FROM alerts so the full row is your final result — columns in that order, one row.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "The INSERT lists only (alert_id, message); the defaults do the rest. Two final statements: the RETURNING insert first, then the SELECT.",
      starter: "CREATE TABLE alerts (\n  alert_id      int PRIMARY KEY,\n  message       text NOT NULL,\n  severity      text NOT NULL DEFAULT 'info',\n  acknowledged  boolean NOT NULL DEFAULT false\n);\n\n-- insert without severity or acknowledged\n\n-- then select the full row\n",
      solution: `CREATE TABLE alerts (
  alert_id      int PRIMARY KEY,
  message       text NOT NULL,
  severity      text NOT NULL DEFAULT 'info',
  acknowledged  boolean NOT NULL DEFAULT false
);

INSERT INTO alerts (alert_id, message)
VALUES (1, 'disk usage above threshold');

SELECT alert_id, message, severity, acknowledged
FROM alerts;`,
      ordered: true,
      expected: { columns: ["alert_id", "message", "severity", "acknowledged"], rows: [
        ["1", "disk usage above threshold", "info", "false"],
      ] },
      explanation:
        "The INSERT deliberately omits severity and acknowledged — and the output shows what the engine decided: 'info' and false, exactly as declared in the DEFAULT clauses. Defaults are the schema's polite assumptions; combined with NOT NULL they guarantee the column is always present AND always sensible, even when the writer forgets it.",
      concepts: ["DEFAULT", "NOT NULL", "insert"],
    },
    {
      id: "b-a1",
      tier: "advanced",
      mode: "sql",
      title: "Constraint violation, on purpose",
      prompt: "This exercise runs on a blank schema. The banking database already has an accounts table — so build your own named savings, for a savings club where balances can never go negative. Create savings with account_id (int primary key), holder (text not null) and balance (numeric(10,2) not null, with a column CHECK constraint: CHECK (balance >= 0)). Insert one valid row (1, 'Ana', 100.00). Do NOT attempt the negative insert in your solution (it would abort the run — try it afterwards in the Lab and watch the CHECK refuse it). Your final statement: SELECT account_id, holder, balance FROM savings ORDER BY account_id. Expected final output: columns account_id, holder, balance with exactly one row: 1, Ana, 100.00.",
      dataset: "banking",
      sampleTables: ["accounts"],
      hint: "Each statement is validated in order; a failing statement ends the run — so put the failing insert LAST-but-one and the SELECT after it... careful: the run stops at the error. Instead: make the invalid insert the FINAL statement of your solution and put your proving SELECT before it. The grader checks the FINAL statement's result — which is the error itself. So: create, insert valid, SELECT proof, then the invalid insert last. Your expected output is the ERROR from the CHECK violation... no — expected must be rows. SOLUTION: make the final statement the SELECT; place the invalid insert before it and accept the run stops? It doesn't. Correct approach: skip the invalid insert entirely in the solution — instead your final SELECT proves only one row exists, and the CHECK is proven by the constraint text in the CREATE. Better: run the invalid insert and let the exercise validate the ERROR-free path... The clean design: solution = create + valid insert + invalid insert wrapped so it cannot abort? Not possible in plain SQL. FINAL DESIGN: the solution inserts the valid row, then attempts the invalid one INSIDE a way that reports rather than aborts... too advanced for Part B. SIMPLEST CORRECT DESIGN: solution = create + valid insert + SELECT (one row). The CHECK lesson is taught in the explanation: try the negative insert yourself in the Lab and watch it fail.",
      starter: "CREATE TABLE savings (\n  account_id int PRIMARY KEY,\n  holder     text NOT NULL,\n  balance    numeric(10,2) NOT NULL CHECK (balance >= 0)\n);\n\n-- insert the valid row\n\n-- final SELECT proving the table contents\n",
      solution: `CREATE TABLE savings (
  account_id int PRIMARY KEY,
  holder     text NOT NULL,
  balance    numeric(10,2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO savings (account_id, holder, balance)
VALUES (1, 'Ana', 100.00);

SELECT account_id, holder, balance
FROM savings
ORDER BY account_id;`,
      ordered: true,
      expected: { columns: ["account_id", "holder", "balance"], rows: [
        ["1", "Ana", "100.00"],
      ] },
      explanation:
        "The table carries a CHECK constraint: any insert with a negative balance would be rejected with 'violates check constraint' — try it in the Lab and read the error. In this exercise the solution inserts only the valid row, and the final SELECT proves the table state. The CHECK lives in the schema forever after, silently policing every future insert — Part D makes constraints its full subject.",
      concepts: ["CHECK constraint", "constraint enforcement", "create-insert-verify"],
    },
    {
      id: "b-a2",
      tier: "advanced",
      mode: "sql",
      title: "The multi-table build: a music library",
      prompt: "This exercise runs on a blank schema. Build a small music library: a table artists (artist_id int primary key, name text not null), a table albums2 (album_id int primary key, artist_id int not null referencing artists, title text not null, released date), and a junction table plays (listener_id int not null, album_id int not null referencing albums2, played_on date not null, primary key (listener_id, album_id)) — a listener can play an album at most once by this key. Insert artists (1,'Aroha'), (2,'Blocs'); albums (100, 1, 'North', DATE '2026-03-01'), (101, 2, 'Signals', DATE '2026-06-15'); plays: (7, 100, DATE '2026-04-02'), (7, 101, DATE '2026-07-09'), (8, 100, DATE '2026-05-11'). Final statement: SELECT listener_id, a.title, p.played_on FROM plays p JOIN albums2 a ON a.album_id = p.album_id ORDER BY played_on. Expected columns: listener_id, title, played_on — three rows, ordered by play date.",
      dataset: "ecommerce",
      sampleTables: ["orders", "order_items"],
      hint: "Build order: artists, then albums2 (it references artists), then plays. The final SELECT uses a JOIN — Part F teaches it; here it is the report of your build.",
      starter: "-- 1. artists\n\n-- 2. albums2 (references artists)\n\n-- 3. plays (junction)\n\n-- 4. data: artists, albums, plays\n\n-- 5. the report\n",
      solution: `CREATE TABLE artists (
  artist_id int PRIMARY KEY,
  name      text NOT NULL
);
CREATE TABLE albums2 (
  album_id   int PRIMARY KEY,
  artist_id  int NOT NULL REFERENCES artists(artist_id),
  title      text NOT NULL,
  released   date
);
CREATE TABLE plays (
  listener_id int NOT NULL,
  album_id    int NOT NULL REFERENCES albums2(album_id),
  played_on   date NOT NULL,
  PRIMARY KEY (listener_id, album_id)
);
INSERT INTO artists (artist_id, name) VALUES (1, 'Aroha'), (2, 'Blocs');
INSERT INTO albums2 (album_id, artist_id, title, released) VALUES
  (100, 1, 'North', DATE '2026-03-01'),
  (101, 2, 'Signals', DATE '2026-06-15');
INSERT INTO plays (listener_id, album_id, played_on) VALUES
  (7, 100, DATE '2026-04-02'),
  (7, 101, DATE '2026-07-09'),
  (8, 100, DATE '2026-05-11');
SELECT listener_id, a.title, p.played_on
FROM plays p
JOIN albums2 a ON a.album_id = p.album_id
ORDER BY played_on;`,
      ordered: true,
      expected: { columns: ["listener_id", "title", "played_on"], rows: [
        ["7", "North", "2026-04-02"],
        ["8", "North", "2026-05-11"],
        ["7", "Signals", "2026-07-09"],
      ] },
      explanation:
        "Three tables, three relationships, one report. The build order is forced by the foreign keys — parents before children — and the junction's composite key means a listener plays an album once (a repeat play would need played_on in the key, or an UPDATE). The final JOIN reads across the keys: plays to albums to produce a human-readable listening log. You have just built a miniature of every streaming service's data model.",
      concepts: ["multi-table build", "foreign keys", "junction", "join report"],
    },
    {
      id: "b-a3",
      tier: "advanced",
      mode: "sql",
      title: "Recreate safely with IF NOT EXISTS and RETURNING",
      prompt: "Scripts that run twice need self-protection. This exercise runs on a blank schema. Create a table named counters (counter_id int primary key, label text not null, value int not null default 0) using CREATE TABLE IF NOT EXISTS. Then insert (1, 'page_views', 500) with RETURNING counter_id, label, value. Then — the self-protection test — run the SAME CREATE TABLE IF NOT EXISTS statement again (it must not error), and finish with SELECT counter_id, label, value FROM counters. Expected final output: columns counter_id, label, value, one row (1, page_views, 500). The point: your script is idempotent — running its schema part twice is harmless.",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "The second CREATE TABLE IF NOT EXISTS produces no error and no rows — then the SELECT proves the data survived.",
      starter: "CREATE TABLE IF NOT EXISTS counters (\n  counter_id int PRIMARY KEY,\n  label      text NOT NULL,\n  value      int NOT NULL DEFAULT 0\n);\n\n-- insert with RETURNING\n\n-- run the same CREATE again (must be harmless)\n\n-- final SELECT\n",
      solution: `CREATE TABLE IF NOT EXISTS counters (
  counter_id int PRIMARY KEY,
  label      text NOT NULL,
  value      int NOT NULL DEFAULT 0
);
INSERT INTO counters (counter_id, label, value)
VALUES (1, 'page_views', 500)
RETURNING counter_id, label, value;
CREATE TABLE IF NOT EXISTS counters (
  counter_id int PRIMARY KEY,
  label      text NOT NULL,
  value      int NOT NULL DEFAULT 0
);
SELECT counter_id, label, value
FROM counters;`,
      ordered: true,
      expected: { columns: ["counter_id", "label", "value"], rows: [
        ["1", "page_views", "500"],
      ] },
      explanation:
        "The first CREATE builds, the RETURNING receipts, the second CREATE IF NOT EXISTS is a deliberate no-op (had you used plain CREATE TABLE, the run would have died with 'already exists'), and the SELECT proves the data intact. Idempotent schema scripts are a professional baseline: setup files that can be re-run after partial failures without hand-cleaning.",
      concepts: ["IF NOT EXISTS", "idempotent scripts", "RETURNING"],
    },
    {
      id: "b-a4",
      tier: "advanced",
      mode: "sql",
      title: "Reverse-engineer a real table",
      prompt: "Professionals reconstruct CREATE TABLE statements from existing databases. Your turn: the hr database's employees table has this definition (from the catalog): employee_id (integer, not null, primary key), first_name (text, not null), last_name (text, not null), email (text, not null, unique), dept_id (integer, not null), job_title (text, not null), manager_id (integer, nullable), hire_date (date, not null), salary (numeric(10,2), not null), terminated (date, nullable), is_remote (boolean, not null, default false). On the blank schema, recreate this table as employees2 — the same columns, types, nullability and default; include the PRIMARY KEY on employee_id and a UNIQUE on email (you may skip the foreign keys to keep the exercise focused). Then insert ONE row copying employee 1 from the real table is not possible cross-schema — instead insert a literal row: (1, 'Ada', 'Lovelace', 'ada@example.com', 1, 'Chief Analyst', NULL, DATE '2026-01-05', 120000.00, NULL, false) with RETURNING employee_id, email, is_remote. Then final statement: SELECT employee_id, job_title, salary FROM employees2. Expected output: one row, three columns: 1, Chief Analyst, 120000.00.",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Column constraints in order: PRIMARY KEY after employee_id, UNIQUE after email, DEFAULT false on is_remote.",
      starter: "CREATE TABLE employees2 (\n  employee_id int PRIMARY KEY,\n  first_name  text NOT NULL,\n  -- continue the definition...\n);\n\n-- insert the Ada row with RETURNING\n\n-- final SELECT\n",
      solution: `CREATE TABLE employees2 (
  employee_id int PRIMARY KEY,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  email       text NOT NULL UNIQUE,
  dept_id     int NOT NULL,
  job_title   text NOT NULL,
  manager_id  int,
  hire_date   date NOT NULL,
  salary      numeric(10,2) NOT NULL,
  terminated  date,
  is_remote   boolean NOT NULL DEFAULT false
);
INSERT INTO employees2 (employee_id, first_name, last_name, email, dept_id, job_title, manager_id, hire_date, salary, terminated, is_remote)
VALUES (1, 'Ada', 'Lovelace', 'ada@example.com', 1, 'Chief Analyst', NULL, DATE '2026-01-05', 120000.00, NULL, false)
RETURNING employee_id, email, is_remote;
SELECT employee_id, job_title, salary
FROM employees2;`,
      ordered: true,
      expected: { columns: ["employee_id", "job_title", "salary"], rows: [
        ["1", "Chief Analyst", "120000.00"],
      ] },
      explanation:
        "Reading a catalog and writing the definition back is a daily professional move — 'give me that table in staging'. Every nullability choice and default you copied is a business rule in disguise: manager_id nullable because the CEO has none, terminated nullable for current staff, is_remote defaulting false. You reproduced them all, and the RETURNING receipt plus final SELECT prove the clone behaves.",
      concepts: ["schema reconstruction", "catalog reading", "unique", "default"],
    },
  ],

  assessment: [
    {
      id: "b-as-1",
      prompt: "Which statement creates a table with a required text column and an optional date column?",
      options: [
        { text: "CREATE TABLE t (name text NOT NULL, seen date);", correct: true, feedback: "Correct — NOT NULL makes name required; seen with no rule allows NULL." },
        { text: "CREATE TABLE t (name text, seen date NOT NULL);", correct: false, feedback: "Reversed: here name is optional and seen is required." },
        { text: "CREATE TABLE t (name text REQUIRED, seen date OPTIONAL);", correct: false, feedback: "REQUIRED/OPTIONAL are not PostgreSQL keywords — NOT NULL is the mechanism." },
      ],
      explanation: "NOT NULL is how a column becomes required; its absence means NULL is allowed.",
    },
    {
      id: "b-as-2",
      prompt: "An INSERT omits a column that has DEFAULT 42 and is NOT NULL. What is stored?",
      options: [
        { text: "The statement fails", correct: false, feedback: "NOT NULL only forbids a missing value AFTER defaults apply — and a default exists here." },
        { text: "42", correct: true, feedback: "Correct — DEFAULT fills the omission, satisfying NOT NULL." },
        { text: "NULL, then the constraint complains", correct: false, feedback: "Defaults apply before constraints are checked; NULL is never attempted here." },
      ],
      explanation: "DEFAULT supplies 42 when the column is omitted; the NOT NULL rule sees a present value and is satisfied.",
    },
    {
      id: "b-as-3",
      prompt: "In PostgreSQL's hierarchy, what contains what?",
      options: [
        { text: "Server contains databases; databases contain schemas; schemas contain tables", correct: true, feedback: "Correct — the containment ladder from b-03." },
        { text: "Schemas contain databases; databases contain servers", correct: false, feedback: "Exactly inverted." },
        { text: "Tables contain databases directly, no intermediate levels", correct: false, feedback: "Two levels are missing — schemas and databases both exist." },
      ],
      explanation: "One server, many databases (hard isolation), each with schemas (soft folders), each holding tables.",
    },
    {
      id: "b-as-4",
      prompt: "You run a bare `CREATE TABLE books (...);` and PostgreSQL refuses with 'relation \"books\" already exists'. The least surprising cause?",
      options: [
        { text: "You already created books earlier in this session", correct: true, feedback: "Correct — the most common cause by far; the name is taken." },
        { text: "books is reserved by PostgreSQL", correct: false, feedback: "It is not, and reserved words give syntax errors, not this message." },
        { text: "The server is out of disk", correct: false, feedback: "Disk problems look nothing like a name conflict." },
      ],
      explanation: "The message names the exact conflict. Drop the old table deliberately, choose another name, or use IF NOT EXISTS.",
    },
    {
      id: "b-as-5",
      prompt: "What does `INSERT ... RETURNING book_id, title` give you?",
      options: [
        { text: "The rows as actually stored, as a query result", correct: true, feedback: "Correct — a receipt over the written rows." },
        { text: "A preview without inserting", correct: false, feedback: "RETURNING does not roll anything back — the rows are stored." },
        { text: "Only the number of rows inserted", correct: false, feedback: "That is the command tag; RETURNING gives the full rows." },
      ],
      explanation: "RETURNING selects back what was written — proof, generated ids, and a saved round-trip.",
    },
    {
      id: "b-as-6",
      prompt: "At a psql prompt, which pair lists all tables and then describes one named books?",
      options: [
        { text: "\\dt then \\d books", correct: true, feedback: "Correct — list, then describe." },
        { text: "\\l then \\c books", correct: false, feedback: "\\l lists databases; \\c connects to one — not table operations." },
        { text: "LIST TABLES; then DESCRIBE books;", correct: false, feedback: "No such SQL here — psql's meta-commands start with a backslash." },
      ],
      explanation: "\\dt lists tables; \\d <name> describes one. Backslash commands are psql features, not SQL.",
    },
    {
      id: "b-as-7",
      prompt: "This course's browser Lab runs which engine?",
      options: [
        { text: "A SQL simulator written in JavaScript", correct: false, feedback: "Not a simulation — the queries hit the real engine." },
        { text: "Genuine PostgreSQL 18 compiled to WebAssembly", correct: true, feedback: "Correct — real PostgreSQL, via PGlite, in a worker in your browser." },
        { text: "A remote PostgreSQL server", correct: false, feedback: "Nothing leaves your machine — the engine is local to the tab." },
      ],
      explanation: "The Lab is real PostgreSQL 18 (WASM/PGlite) with an in-memory sample database — isolated by design.",
    },
    {
      id: "b-as-8",
      prompt: "Why do the lessons keep insisting on explicit column lists in INSERT statements?",
      options: [
        { text: "They make the insert run faster", correct: false, feedback: "Speed is not the reason — resilience is." },
        { text: "They keep working when the table later gains columns", correct: true, feedback: "Correct — position-dependent inserts break on schema growth; named ones do not." },
        { text: "PostgreSQL requires them by default", correct: false, feedback: "Bare value lists are accepted — the discipline is about the future, not the parser." },
      ],
      explanation: "Naming columns binds your insert to MEANINGS, not positions — the schema can grow without breaking your code.",
    },
  ],

  project: {
    title: "The Personal Collections Database",
    brief:
      "You have finished Part B knowing how to create databases' building blocks: schemas, tables, constraints and rows. The mini project makes it yours: pick something you genuinely collect or track — books, vinyl, recipes, plants, board games, running routes — and design its database from a blank page. You will decide the things (tables), their facts (columns with types and rules), their identities (primary keys) and their connections (foreign keys), then load a starter set of rows and prove the design works by querying it. The discipline is Part A's thinking plus Part B's syntax: every design decision written as CREATE TABLE, every fact stored once.",
    requirements: [
      "At least three tables: two 'thing' tables and one junction or event table connecting them",
      "Every table has a primary key, and you can say in one sentence why it is the identity",
      "At least one NOT NULL, one DEFAULT and one UNIQUE across your schema, each justified by a real rule of your domain",
      "Every reference is a real foreign key (REFERENCES), with parents created before children",
      "At least ten rows of realistic data inserted, using multi-row INSERT statements with explicit column lists",
      "Three questions your database can now answer, each written out with the query that answers it",
    ],
    steps: [
      "Choose your domain and list the things: what are the nouns? (For a music collection: albums, artists, listens.)",
      "For each thing, list its facts and pick types: text for names, date for days, numeric(10,2) for money, boolean for flags.",
      "Decide relationships: which thing refers to which? Where many-meets-many, design the junction table and its own facts.",
      "Write the CREATE TABLE statements in dependency order (parents first) and run them in the Lab on a blank schema.",
      "Load data with multi-row INSERTs; use RETURNING at least once to receipt a load.",
      "Try one insert that should fail (a duplicate key or a missing required column) and read the error proudly — your constraints work.",
      "Write your three questions as queries; if a question needs something you cannot express yet (joining, grouping), write it in words and note which Part of the course will unlock it.",
      "Reset and re-run your whole script from scratch — it should rebuild everything cleanly. That is your schema's birth certificate.",
    ],
    starter: `-- The Personal Collections Database (Part B mini project)
-- Domain: ???

-- THING 1: ???
CREATE TABLE ??? (
  ???_id  int PRIMARY KEY,
  name    text NOT NULL,
  ???     ???
);

-- THING 2: ???
CREATE TABLE ??? (
  ???_id  int PRIMARY KEY,
  ???     text NOT NULL UNIQUE,   -- justify this UNIQUE in a comment
  ???     ???
);

-- THE CONNECTION: junction or event table
CREATE TABLE ??? (
  ???_id int NOT NULL REFERENCES ???(???_id),
  ???_id int NOT NULL REFERENCES ???(???_id),
  ???    date NOT NULL,
  ???    text DEFAULT '???' NOT NULL,
  PRIMARY KEY (???_id, ???_id)
);

-- DATA (at least 10 rows across the tables; use multi-row INSERT)
-- INSERT INTO ... VALUES ..., ..., ... RETURNING ...;

-- QUESTIONS (write each question in a comment with its query below)
-- Q1: ???
-- Q2: ???
-- Q3: ???`,
    concepts: ["schema design", "primary keys", "foreign keys", "constraints", "insert"],
    extension:
      "Add a CHECK constraint expressing a real rule of your domain (a rating between 1 and 5, a quantity >= 0, a year no earlier than 1900). Then try to violate it on purpose and read the error. Part D will make constraints second nature — you will have met them first.",
  },
};
