/**
 * Part A — Databases before SQL (the golden-standard part).
 *
 * The user requirement: "Teach databases before teaching SQL syntax."
 * These eight lessons cover what data is, what a database is, the
 * relational model, tables/rows/columns, primary keys, foreign keys and
 * relationships — with pictures, real sample tables and concept
 * exercises. The only SQL a learner sees is a single pre-written
 * "witness" query at the very end of a-08, clearly framed as a preview
 * of Part B. Everything here is concept work; the writing starts in
 * Part B.
 */
import type { Part } from "@/lib/sqlcourse/types";

export const SQL_PART_A: Part = {
  letter: "A",
  title: "Databases before SQL",
  tagline: "What data, databases, tables, keys and relationships actually are — before you write a single line of SQL.",
  description:
    "Most SQL courses hand you syntax on day one and hope the concepts follow. This part does the opposite. You will learn what data is, what a database really does, how the relational model organizes the world into tables, and how keys and relationships keep that world consistent. You will read real sample tables from six realistic databases and design your first schema on paper. When you finally meet SQL in Part B, you will know exactly what it is for.",
  stub: false,
  lessons: [
    /* ---------------------------------------------------------------- */
    {
      slug: "a-01",
      title: "What is data?",
      minutes: 12,
      summary: "Data is recorded facts about things that matter to us — and structure is what turns piles of facts into answers.",
      kind: "concept",
      objectives: [
        "Explain what data is in your own words, with three examples",
        "Tell data apart from information using a concrete case",
        "Recognize structured, semi-structured and unstructured data",
        "Explain why structure makes data useful",
      ],
      why: "Every report, app, bank transfer and hospital visit in your life produces data, and almost every job today involves either producing it or making decisions with it. Before you can store, query or protect data you need to be able to say what it IS — otherwise 'database' is just a buzzword. This lesson gives you a working definition you will use in every lesson that follows.",
      blocks: [
        {
          kind: "text",
          text: "Look around you. The room you are in has a temperature. The phone in your pocket has a battery level, a list of calls, a history of every app you opened. This morning a coffee shop recorded a sale; a bus recorded a swipe; your bank recorded a heartbeat of your account. **All of these are data**: recorded facts about things that exist or events that happened.",
        },
        {
          kind: "text",
          text: "The word to hold onto is *recorded*. The temperature of the room exists whether or not anyone writes it down. It becomes data the moment a sensor captures it at 09:00 and stores `21.4` next to a timestamp. Data is facts that have been captured in a form that can be kept, moved and read again later — by a person or a program.",
        },
        {
          kind: "table",
          title: "Data is everywhere",
          headers: ["Domain", "Thing or event", "Data captured"],
          rows: [
            ["Coffee shop", "A latte is sold at 09:04", "product: 'latte', size: 'large', price: 4.50, time: 09:04"],
            ["Hospital", "A patient's blood test", "patient: #1042, test: 'hemoglobin', value: 13.1, unit: 'g/dL'"],
            ["Phone", "You open an app", "app: 'calendar', opened_at: 08:12, session_seconds: 94"],
            ["Bank", "A card payment", "account: #8841, amount: 24.99, merchant: 'Book Nook', at: 12:37"],
          ],
          caption: "Each row: something in the real world, and the facts recorded about it.",
        },
        { kind: "heading", text: "Data versus information" },
        {
          kind: "text",
          text: "People use the words loosely, but the difference matters. **Data** is the raw record. **Information** is data arranged to answer a question. `13.1` is data. *Patient #1042's hemoglobin is 13.1 g/dL, within the normal range* is information — it answers a question a doctor actually has. A database's entire job is to store data so faithfully, and organize it so well, that turning it into information becomes cheap.",
        },
        {
          kind: "visual",
          title: "From facts to answers",
          ascii: `  world event          data (recorded)           information (answer)
  ------------         -----------------          ---------------------
  a latte sold    -->  'latte', 4.50, 09:04  -->  "Mondays sell 38% more
                                                    large lattes before
                                                    10:00 than Tuesdays"`,
          caption: "Many facts, recorded as data, combine into information a person can act on.",
        },
        { kind: "heading", text: "Structured, semi-structured, unstructured" },
        {
          kind: "text",
          text: "Data comes in three rough shapes. *Structured data* fits a fixed pattern — every sale has a product, a price, a time. *Semi-structured data* has some organization but no rigid shape — a JSON file, an email with headers. *Unstructured data* is free-form — a photo, a voice memo, the text of a contract. This course is about **structured data**, because that is what relational databases — the subject of this course — are built for.",
        },
        {
          kind: "table",
          title: "The three shapes of data",
          headers: ["Shape", "Example", "Fits a relational database?"],
          rows: [
            ["Structured", "A bank transaction: account, amount, timestamp", "Yes — perfectly"],
            ["Semi-structured", "An email: sender, subject, free-form body", "Partly (headers yes, body no)"],
            ["Unstructured", "A photo of your dog", "Not directly (only its metadata)"],
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Data is ingredients, information is the meal",
          text: "A refrigerator full of ingredients is not dinner. Data alone does not feed anyone a decision. You need a process — chopping, heating, combining — to turn ingredients into a meal. In this course, that process is the database plus SQL.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "The six sample databases you will live in",
          text: "This course runs every idea against six realistic databases: an online store (**ShopSphere**), a hospital (**St. Marlowe General**), a university (**Northgate**), a bank (**Meridian Trust**), a retail chain (**Trailhead Outdoors**) and a company's employee system (**HeliosWorks**). When you meet concepts like keys and relationships in the next lessons, you will see them working in all six.",
        },
      ],
      terms: [
        { term: "Data", definition: "Recorded facts about things or events, captured in a form that can be stored and read again." },
        { term: "Information", definition: "Data arranged and combined to answer a specific question." },
        { term: "Structured data", definition: "Data that follows a fixed pattern of attributes, ideal for relational databases." },
        { term: "Semi-structured data", definition: "Data with some organization (like keys in a JSON file) but no rigid, enforced shape." },
      ],
      mistakes: [
        {
          mistake: "Treating data and information as synonyms",
          why: "If everything is 'information', it is unclear what work remains to be done: the raw facts exist, but nobody has answered the question yet.",
          fix: "Say data for the raw record and information for the answer. A database stores data; queries produce information.",
        },
        {
          mistake: "Assuming data must be numbers",
          why: "Beginners often picture spreadsheets of numbers and are surprised that names, dates, true/false flags and even short codes are equally data.",
          fix: "Ask 'is it a recorded fact about something?' If yes — text, date, boolean, whatever — it is data.",
        },
      ],
      takeaways: [
        "Data is recorded facts about things or events.",
        "Information is data arranged to answer a question; databases make that arrangement cheap.",
        "Structured data fits fixed patterns — it is what relational databases are built for.",
        "From this lesson on, the question is not 'what is data?' but 'how do we keep it so it stays useful?'",
      ],
      quiz: [
        {
          id: "a-01-q1",
          prompt: "A doctor writes down 'patient #1042, hemoglobin 13.1 g/dL, 09:40'. What is this, in the vocabulary of this lesson?",
          options: [
            { text: "Data — a recorded fact", correct: true, feedback: "Correct. It is a captured fact with a value, a subject and a time." },
            { text: "Information, because a doctor reads it", correct: false, feedback: "Who reads it does not decide the vocabulary — the shape does. On its own it is a raw recorded fact." },
            { text: "Neither — it becomes data only when typed into software", correct: false, feedback: "Paper is a recording medium too. Being on paper rather than in software does not stop it being data." },
          ],
          explanation: "A single recorded fact (value + subject + time) is data. It becomes information when combined to answer a question, such as 'is this patient anemic?'.",
        },
        {
          id: "a-01-q2",
          prompt: "Which of these is closest to STRUCTURED data?",
          options: [
            { text: "A photo of a damaged car for an insurance claim", correct: false, feedback: "A photo is unstructured — pixels, not attributes." },
            { text: "A repair ticket: car plate, repair cost, date, garage id", correct: true, feedback: "Correct. Every record has the same fixed attributes — exactly what relational databases want." },
            { text: "A mechanic's free-text notes about the repair", correct: false, feedback: "Free text has no enforced shape — it is unstructured (or at best semi-structured)." },
          ],
          explanation: "Structured data fits a fixed pattern of attributes. Tickets with the same fields in every row are structured; photos and free text are not.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-02",
      title: "What is a database?",
      minutes: 12,
      summary: "A database is an organized, long-lived collection of data that many people and programs can trust and share — and a DBMS is the software that guards it.",
      kind: "concept",
      objectives: [
        "Define 'database' and 'DBMS' precisely",
        "List the four jobs a DBMS does that plain files cannot",
        "Explain why spreadsheets break down as teams and data grow",
      ],
      why: "You already know folders full of files and Excel-style spreadsheets. So why did the world spend fifty years building database software? Because the moment data is shared, long-lived or valuable, plain files fail in painful, expensive ways. This lesson shows exactly how they fail — duplicated facts, no protection against wrong values, two people overwriting each other — so the rest of the course has a reason to exist.",
      blocks: [
        {
          kind: "text",
          text: "A **database** is an organized collection of data, stored so it can live for a long time, be found quickly, and be shared safely. A **DBMS** — *database management system* — is the software that runs the database: PostgreSQL, MySQL, SQL Server, Oracle, SQLite. People say 'the database' and mean both; keeping the terms straight is worth thirty seconds now.",
        },
        { kind: "heading", text: "Why not just use files?" },
        {
          kind: "text",
          text: "Suppose a small clinic keeps patients in a text file, one line per patient. On Monday a receptionist edits line 14. On Tuesday a nurse opens the same file, still has Monday-morning's copy in her editor, fixes line 3, and saves — silently erasing the receptionist's change. Nobody notices for a week. This is the *lost update* problem, and files have no answer to it.",
        },
        {
          kind: "visual",
          title: "The lost update, in one picture",
          ascii: `  receptionist                     nurse
  -------------                    -------------
  opens patients.txt (v1)
  edits line 14 ....... saves v2
                                   opens patients.txt  (still v1!)
                                   edits line 3 ........ saves v3
                                                        v2 is GONE`,
          caption: "Two writers, no coordination: the last save wins and the other's work silently disappears.",
        },
        {
          kind: "text",
          text: "Now suppose nobody erases anything, but someone types a birth date as `1980-13-45`. Or a patient is stored twice with two different spellings, and the clinic's reports count her twice. Or the clinic's list grows to 300,000 patients and every search reads the whole file top to bottom. Or the power dies mid-save and half a line is written. Files fail at all of these. A DBMS exists to make each failure impossible:",
        },
        {
          kind: "table",
          title: "The four jobs of a DBMS",
          headers: ["Job", "What it means", "The file-world failure it prevents"],
          rows: [
            ["Concurrency", "Many readers and writers at once, without clobbering each other", "The lost update above"],
            ["Integrity", "Declared rules reject wrong data at the door (dates that exist, ages that are numbers)", "'1980-13-45' stored without complaint"],
            ["Durability", "Once saved, data survives crashes and power loss", "Half-written lines after a power cut"],
            ["Fast access", "Indexes find the few rows you need without scanning everything", "Reading 300,000 lines to find one patient"],
          ],
          caption: "PostgreSQL is a DBMS: it does all four jobs, and more.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "A library, not a filing cabinet",
          text: "A pile of files is a filing cabinet: fine for one person, hopeless for a crowd. A database is a library — with a catalog (fast access), a librarian who refuses to shelve a book upside down (integrity), one queue so two people never grab the same manuscript (concurrency), and a fireproof vault (durability).",
        },
        { kind: "heading", text: "Where spreadsheets stop" },
        {
          kind: "text",
          text: "Spreadsheets deserve respect: they are the world's most successful data tool and the right choice for small, personal, one-sheet calculations. They stop being the right tool when any of these become true: several people edit the same data; the data must enforce rules (a payment without a valid order must be impossible); it grows beyond tens of thousands of rows; or it must outlive the person who built the file. Each of those is a database's home ground.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Rule of thumb",
          text: "If the answer to 'what happens when two people change this at the same time?' is anything other than 'the system handles it', you have outgrown files and spreadsheets.",
        },
      ],
      terms: [
        { term: "Database", definition: "An organized, long-lived collection of data that can be found quickly and shared safely." },
        { term: "DBMS", definition: "Database management system — the software that stores, guards and serves the database (PostgreSQL is one)." },
        { term: "Concurrency", definition: "Many simultaneous readers and writers, coordinated so no change is silently lost." },
        { term: "Integrity", definition: "Guarantees that stored data obeys declared rules and matches reality." },
        { term: "Durability", definition: "The promise that once a change is saved it survives crashes and power loss." },
      ],
      mistakes: [
        {
          mistake: "Calling the database software a 'database'",
          why: "It confuses the container with the guard. Saying 'PostgreSQL is a database' is like calling a bank vault 'the money'.",
          fix: "PostgreSQL is a DBMS; the database is the organized data it manages. Colloquially people mix them — just know which is which.",
        },
        {
          mistake: "Believing a shared spreadsheet folder is 'basically a database'",
          why: "It has no concurrency control, no enforced rules and no indexes — the exact three things the team probably needs.",
          fix: "Ask the four-jobs question from this lesson. If two or more jobs are needed, use a DBMS.",
        },
      ],
      takeaways: [
        "A database is organized, long-lived, shareable data; a DBMS is the software that runs it.",
        "A DBMS delivers concurrency, integrity, durability and fast access — the four things files cannot promise.",
        "Spreadsheets are for small personal calculations; databases are for shared, rule-governed, growing data.",
        "PostgreSQL — this course's DBMS — is one of the most trusted database systems in the world.",
      ],
      quiz: [
        {
          id: "a-02-q1",
          prompt: "Two clerks edit the same customer file and one save silently destroys the other's work. Which DBMS job addresses this?",
          options: [
            { text: "Durability", correct: false, feedback: "Durability is about surviving crashes, not coordinating writers." },
            { text: "Concurrency", correct: true, feedback: "Correct. Concurrency control coordinates simultaneous writers so updates cannot be lost." },
            { text: "Fast access", correct: false, feedback: "Indexes make reads fast; they do nothing to coordinate two writers." },
          ],
          explanation: "Lost updates are a concurrency failure. A DBMS serializes or coordinates changes so every saved change survives.",
        },
        {
          id: "a-02-q2",
          prompt: "A clinic's patient list rejects the birth date '1980-13-45' the moment someone tries to save it. Which DBMS job is this?",
          options: [
            { text: "Integrity", correct: true, feedback: "Correct. Declared rules reject impossible values at the door." },
            { text: "Durability", correct: false, feedback: "Durability protects saved data from crashes; it does not judge values." },
            { text: "Concurrency", correct: false, feedback: "Concurrency coordinates simultaneous access; this is about the value itself." },
          ],
          explanation: "Rejecting invalid values before they are stored is integrity — the DBMS enforcing rules you declared.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-03",
      title: "Relational databases",
      minutes: 14,
      summary: "The relational model organizes data as tables connected by shared values — the idea SQL was invented to query.",
      kind: "concept",
      objectives: [
        "Describe the relational model in one sentence",
        "Explain what makes a database 'relational'",
        "Name the parts of a relational database you will meet in this course",
      ],
      why: "In 1970 a mathematician named Edgar Codd proposed storing data in simple tables connected by values instead of tangled pointers, and the industry never looked back: banks, hospitals, governments and nearly every app you use run on relational databases today. Understanding the model — not just the syntax layered on top of it — is what separates people who can write queries from people who can answer business questions with data.",
      blocks: [
        {
          kind: "text",
          text: "A **relational database** stores data in **tables** (officially, *relations*) and connects the tables through **shared values** rather than physical links. A customer's row in one table and that customer's orders in another table are connected because both carry the same customer number. That single idea — connection by shared value — is the whole trick, and it is why the model is called *relational*.",
        },
        {
          kind: "text",
          text: "Codd's insight was that if data lives in tables, a small, precise query language can fetch and combine facts without anyone writing custom programs to chase pointers around memory. That language became **SQL** — *Structured Query Language* — which you will start writing in Part B. First, though, you need the model it queries.",
        },
        { kind: "heading", text: "What a relational database is made of" },
        {
          kind: "table",
          title: "The vocabulary you will meet everywhere",
          headers: ["Term", "Meaning", "Example from this course"],
          rows: [
            ["Table (relation)", "One kind of thing, stored as rows", "customers, patients, accounts"],
            ["Row (record/tuple)", "One single thing or event", "One customer: Amelia Watson of Portland"],
            ["Column (attribute)", "One property every row has", "city — every customer has one"],
            ["Primary key", "The column (or columns) that identify each row uniquely", "customer_id",],
            ["Foreign key", "A column holding another table's primary key, linking them", "orders.customer_id"],
            ["Schema", "The structure: tables, columns, types, rules", "All 7 tables of ShopSphere"],
          ],
          caption: "Terms 4 and 5 get their own lessons next; for now, meet the family.",
        },
        {
          kind: "visual",
          title: "Connection by shared value",
          ascii: `  customers                          orders
  +--------------+---------+        +----------+-------------+--------+
  | customer_id  | name    |        | order_id | customer_id | total  |
  +--------------+---------+        +----------+-------------+--------+
  |      1       | Amelia  |<------>|    501   |      1      | 142.00 |
  |      2       | Marcus  |        |    502   |      1      |  29.90 |
  +--------------+---------+        |    503   |      2      | 89.00  |
                                     +----------+-------------+--------+
       No pointer, no link object: the value 1 in orders.customer_id
       MEANS "the customer whose customer_id is 1" — Amelia.`,
          caption: "Both tables carry customer_id; matching values connect them. This is the heart of the relational model.",
        },
        { kind: "heading", text: "Why this idea won" },
        {
          kind: "text",
          text: "Three reasons the relational model took over. **One: independence of shape and use.** You design tables once; every new question is a new query, not a new database. **Two: mathematical backing.** Tables are sets, and set operations (choose rows, choose columns, combine sets) are exactly what queries do — the theory guarantees sane, predictable behavior. **Three: integrity by declaration.** You say 'every order belongs to a real customer' once, and the DBMS enforces it forever, as you will see with foreign keys.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "PostgreSQL: the DBMS you will learn on",
          text: "PostgreSQL (usually said 'post-gres-cue-ell', or just Postgres) is a free, open-source relational DBMS that has run everything from tiny apps to planet-scale systems since the 1990s. It is famous for correctness, for honoring the SQL standard, and for a friendly extension culture. Every query you run in this course executes on a genuine PostgreSQL 18, compiled to run inside your browser.",
        },
        {
          kind: "text",
          text: "Relational databases are not the only kind — document stores, key-value stores and graph databases exist, and each shines somewhere. But the relational model remains the default language of data, and SQL the most-asked-for data skill in job postings. Learn it first; the others become far easier afterwards.",
        },
      ],
      terms: [
        { term: "Relational database", definition: "A database storing data in tables connected through shared column values." },
        { term: "SQL", definition: "Structured Query Language — the standard language for asking relational databases questions." },
        { term: "Schema", definition: "The declared structure of a database: its tables, columns, types and rules." },
        { term: "PostgreSQL", definition: "A free, open-source relational DBMS known for standards compliance and reliability." },
      ],
      mistakes: [
        {
          mistake: "Thinking tables in a relational database are physically linked",
          why: "Beginners picture lines drawn between files. If connections were physical, changing storage would break the data.",
          fix: "Connections are logical: matching values. Nothing is drawn anywhere; the value 1 in two different columns is the connection.",
        },
        {
          mistake: "Believing you must pick 'the right' database type before learning anything",
          why: "It paralyzes beginners into comparing products instead of learning fundamentals.",
          fix: "Learn the relational model and SQL first — they transfer to almost every other system you will ever touch.",
        },
      ],
      takeaways: [
        "The relational model stores data in tables connected by shared values.",
        "SQL exists to query relational tables — model first, language second.",
        "The schema is the declared structure: tables, columns, types, rules.",
        "PostgreSQL is one of the world's most trusted DBMSs — and this course runs the real thing in your browser.",
      ],
      quiz: [
        {
          id: "a-03-q1",
          prompt: "What makes a database relational?",
          options: [
            { text: "Rows are physically linked to each other with pointers", correct: false, feedback: "The opposite — the model deliberately avoids physical links." },
            { text: "Tables connect through shared column values", correct: true, feedback: "Correct. A matching value, like customer_id 1 in two tables, is the connection." },
            { text: "It stores relationships between people", correct: false, feedback: "A fun guess, but 'relational' refers to relations (tables), not human relationships." },
          ],
          explanation: "'Relational' comes from Codd's term 'relation' for a table. Tables connect by holding the same values in matching columns.",
        },
        {
          id: "a-03-q2",
          prompt: "Who proposed the relational model, and roughly when?",
          options: [
            { text: "Edgar Codd, 1970", correct: true, feedback: "Correct — his paper 'A Relational Model of Data for Large Shared Data Banks' started it all." },
            { text: "Bill Gates, 1985", correct: false, feedback: "No — the model predates Microsoft Windows and comes from IBM Research, not product groups." },
            { text: "Linus Torvalds, 1991", correct: false, feedback: "1991 is Linux, an operating system kernel — not the relational model." },
          ],
          explanation: "Edgar F. Codd, an IBM researcher, published the relational model in 1970. SQL followed a few years later, and PostgreSQL traces its lineage to that work.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-04",
      title: "Tables, rows and columns",
      minutes: 14,
      summary: "A table is one kind of thing; each row is one of those things; each column is one fact every row carries.",
      kind: "concept",
      dataset: "ecommerce",
      objectives: [
        "Read any table and say what one row represents",
        "Identify the columns and their likely types",
        "Distinguish the schema of a table from its data",
        "Explain why every row of a table should have the same shape",
      ],
      why: "Tables are the single data structure of the relational world, and nearly every SQL mistake traces back to misreading one: expecting rows in an order that was never promised, treating a column as two different things, or adding rows that are not really the same kind of thing. This lesson makes you fluent in table anatomy using real data from the course's six databases, so every later lesson builds on solid ground.",
      blocks: [
        {
          kind: "text",
          text: "A **table** stores one kind of thing: customers, products, hospital admissions, bank transactions. Each **row** is one of those things — one customer, one product, one admission. Each **column** is one fact that every row of the table carries: every customer has a first name, a city, a signup date. That is the entire grammar, and it is strict: a table never mixes kinds of things, and every row has the same columns.",
        },
        {
          kind: "table",
          title: "Five real customers from ShopSphere",
          headers: ["customer_id", "first_name", "last_name", "city", "state", "signup_date"],
          rows: [
            ["1", "Amelia", "Watson", "Portland", "OR", "2024-01-12"],
            ["2", "Marcus", "Chen", "Seattle", "WA", "2024-02-03"],
            ["3", "Priya", "Sharma", "Austin", "TX", "2024-02-17"],
            ["4", "Diego", "Alvarez", "Miami", "FL", "2024-03-05"],
            ["5", "Hannah", "Kowalski", "Chicago", "IL", "2024-03-22"],
          ],
          caption: "One row = one customer. Reading tip: cover a row with your hand and ask 'what does this describe?' — a person, not an order.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The row question",
          text: "Whenever you meet a new table, ask: *what does ONE ROW represent?* 'A customer.' 'An admission to hospital.' 'One bank transaction.' If you cannot answer it in a short sentence, you do not understand the table yet — and every query you write against it will be guesswork.",
        },
        { kind: "heading", text: "Columns have types" },
        {
          kind: "text",
          text: "Every column has a **type** — the kind of value it may hold. `customer_id` is an integer; `signup_date` is a date; `price` is an exact decimal number of money. Types are not decoration: they decide what comparisons make sense (you can ask which signup is later, because dates know about order) and they are the database's first line of integrity defense. Part D gives types a full lesson; today you only need to know they exist.",
        },
        {
          kind: "table",
          title: "Columns and their types, ShopSphere products",
          headers: ["product_id", "name", "category_id", "price", "stock"],
          rows: [
            ["1", "AeroBook 14 Laptop", "1", "1299.00", "14"],
            ["2", "AeroBook 16 Pro Laptop", "1", "2199.00", "6"],
            ["3", "WorkMate 15 Business", "1", "899.00", "22"],
            ["4", "StudioBook X Creator", "1", "2499.00", "3"],
            ["5", "BudgetBook 11 Everyday", "1", "399.00", "55"],
          ],
          caption: "price is a numeric type for exact money; stock an integer count; category_id an integer linking to the categories table.",
        },
        { kind: "heading", text: "Schema versus data" },
        {
          kind: "text",
          text: "The **schema** is the table's shape: its name, its columns, their types, its rules. The **data** is the rows currently stored. The schema changes rarely and deliberately; the data changes constantly. Saying 'the customers table has a phone column' is a schema statement; saying 'customer 3 has no phone on file' is a data statement. SQL keeps the two worlds separate — one set of statements defines and changes schema, another works with data — and mixing them up is a classic beginner confusion.",
        },
        {
          kind: "visual",
          title: "Anatomy of a table",
          ascii: `                customers  (the table)
  .....................................................
  .  customer_id | first_name | last_name | city | ... .  <-- schema (columns)
  .--------------+------------+-----------+------+-----.
  .      1       | Amelia     | Watson    | Port | ... .  <-- row: ONE customer
  .      2       | Marcus     | Chen      | Seat | ... .
  .      3       | Priya      | Sharma    | Aust | ... .
  .     ...      | ...        | ...       | ...  | ... .
  .....................................................
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 data (the rows currently stored)`,
          caption: "Columns describe the kind of fact; rows are the facts themselves.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One table, one kind of thing",
          text: "The fastest way to corrupt a database is to let a table hold two kinds of rows — customers AND suppliers in one table, 'because they're both people'. The columns stop having one meaning, and every query must guess. Different kind of thing: different table. You will practice exactly this judgment in this part's exercises and mini project.",
        },
      ],
      terms: [
        { term: "Table", definition: "The relational storage unit: rows of one kind of thing, sharing the same columns." },
        { term: "Row", definition: "One single thing or event inside a table — one customer, one order." },
        { term: "Column", definition: "One property every row of a table carries, with one declared type." },
        { term: "Type", definition: "The kind of value a column may hold: integer, text, date, boolean, numeric." },
        { term: "Schema", definition: "The declared shape of the database — tables, columns, types and rules — as distinct from the data in it." },
      ],
      mistakes: [
        {
          mistake: "Reading a table and assuming its rows are in a particular order",
          why: "Tables are sets of facts, not numbered lists; without an explicit sort, the database is free to return rows in any order.",
          fix: "Never rely on row order unless a query asks for it. (Sorting is ORDER BY, coming in Part C.)",
        },
        {
          mistake: "Treating two columns as interchangeable because they look similar",
          why: "unit_price on an order item and price on a product look alike but mean different things: 'what was paid this once' versus 'the catalog price today'.",
          fix: "Ask what one value of the column means, independent of any row. If two columns give different answers, they are different facts.",
        },
        {
          mistake: "Designing tables around reports instead of things",
          why: "A table shaped like the Monday sales report works until someone needs Tuesday's report a different way.",
          fix: "Model things and events (customers, orders, transactions), not output shapes. Reports are queries; they can change freely.",
        },
      ],
      takeaways: [
        "A table holds one kind of thing; a row is one of those things; a column is one fact every row carries.",
        "Ask 'what does one row represent?' before working with any table.",
        "Every column has a type — the first line of integrity defense.",
        "Schema is shape, data is contents; keep the words separate.",
      ],
      quiz: [
        {
          id: "a-04-q1",
          prompt: "In the enrollments table of the university database, each row stores a student id, a course id, a term and a grade. What does ONE row represent?",
          options: [
            { text: "One student", correct: false, feedback: "A student is one row of the students table; here the student id is just a value on the row." },
            { text: "One student taking one course in one term", correct: true, feedback: "Correct — the row is the event of enrollment, not the student or the course alone." },
            { text: "One course", correct: false, feedback: "A course is one row of the courses table; the course id is a value here." },
          ],
          explanation: "Enrollment is a relationship between a student and a course in a term — the row represents the event that links them. Tables of relationships get a full lesson soon.",
        },
        {
          id: "a-04-q2",
          prompt: "'The patients table has a blood_type column that only accepts values like A+, O-, AB-.' Schema or data?",
          options: [
            { text: "Schema — it describes the shape and rules of the table", correct: true, feedback: "Correct. What columns exist and what they may contain is schema." },
            { text: "Data — it is about the values stored", correct: false, feedback: "The values themselves (this patient is A+) are data; the column's existence and its allowed values are schema." },
            { text: "Neither — it is a design decision, so it lives outside the database", correct: false, feedback: "Design decisions recorded in the database's structure are exactly what schema means." },
          ],
          explanation: "Schema covers names, types and rules of columns. The facts in rows — including a specific patient's blood type — are data.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-05",
      title: "Primary keys",
      minutes: 14,
      summary: "A primary key is the column (or columns) whose value identifies each row — no row without it, no duplicate values allowed.",
      kind: "concept",
      dataset: "ecommerce",
      objectives: [
        "Explain why every table needs a way to identify its rows",
        "Say what a primary key guarantees and forbids",
        "Recognize good and bad primary key choices",
        "Explain natural keys, surrogate keys and composite keys",
      ],
      why: "Without row identity, everything breaks: you cannot point at 'order 501' from another table, cannot correct the right patient record when two share a name, cannot even guarantee a row exists only once. Primary keys are the smallest idea in this course with the biggest consequences — they anchor every relationship in every database you will ever build, and getting them wrong is the number one cause of duplicate-data chaos in the wild.",
      blocks: [
        {
          kind: "text",
          text: "Say the hospital needs to update a patient's phone number, and two patients in the table are named *Maria Gonzalez*. 'Update Maria Gonzalez's phone' is suddenly a dangerous sentence. Every table needs a fact that picks out exactly one row — an identifier. That identifier is the **primary key** (PK): the column, or combination of columns, whose value is unique for every row and never missing.",
        },
        {
          kind: "table",
          title: "Two Marias, one identifier",
          headers: ["patient_id", "first_name", "last_name", "city", "phone"],
          rows: [
            ["17", "Celia", "Fontaine", "Lakewood", "555-0117"],
            ["18", "Oscar", "Hartley", "Fairview", "555-0118"],
            ["1", "Margaret", "Boyle", "Springfield", "555-0101"],
            ["20", "Felix", "Mendoza", "Springfield", "555-0120"],
          ],
          caption: "patient_id 1 and 20 are safe handles even if names, phones and cities collide. In St. Marlowe General, patient_id is the primary key.",
        },
        {
          kind: "text",
          text: "A primary key gives you three guarantees. **Unique**: no two rows ever share the key value — the database itself rejects a duplicate. **Present**: a row without a key value cannot exist; the key column may not be missing. **Stable in practice**: a good key never changes — patient 20 remains patient 20 for life. These are not social conventions; they are rules the DBMS enforces on your behalf.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Try to break it, and the database refuses",
          text: "If a program tries to insert a second product with product_id 1 into ShopSphere, PostgreSQL rejects the insert with an error — before any data is touched. The key is not a hope; it is a contract, enforced at the door. You will watch this happen with your own eyes in Part D.",
        },
        { kind: "heading", text: "Choosing a primary key" },
        {
          kind: "text",
          text: "Some tables come with a natural identifier: each country has its ISO code, each book an ISBN. Keys taken from the world like this are **natural keys**. They sound perfect but bite in practice: ISBNs change format, people get new passport numbers, emails get recycled. So most tables use a **surrogate key** — a value with no meaning except identity, usually a plain number the database hands out in sequence: customer 1, customer 2, customer 3. Every table in this course's six databases uses surrogate integer keys, exactly as you will meet in real systems.",
        },
        {
          kind: "table",
          title: "Natural vs surrogate keys",
          headers: ["", "Natural key", "Surrogate key"],
          rows: [
            ["Example", "ISBN, country code, email", "customer_id = 42"],
            ["Meaning", "Means something outside the table", "Means nothing but 'row 42'"],
            ["Failure mode", "The world changes it (email recycled)", "None — it is ours alone"],
            ["Typical use", "Small reference tables", "Almost everything (the default choice)"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The candidate test",
          text: "Before making a column a primary key, ask: could two rows ever share this value? Could a row ever lack it? Could it ever need to change? Any 'yes' disqualifies the column. Emails fail twice (shared addresses, changes); names fail constantly; auto-numbered ids pass all three.",
        },
        { kind: "heading", text: "Composite keys: identity by combination" },
        {
          kind: "text",
          text: "Sometimes no single column identifies a row, but a combination does. In ShopSphere, the table **order_items** stores which products appear in which orders. Order 1 alone is not unique — it has three items; product 1 alone is not unique — it appears in many orders. But the *pair* (order_id, product_id) identifies exactly one line: order 1's row for product 1. A key made of several columns is a **composite key**, and together the pair is the primary key of order_items.",
        },
        {
          kind: "table",
          title: "order_items — identity lives in the pair",
          headers: ["order_id", "product_id", "quantity", "unit_price"],
          rows: [
            ["1", "1", "1", "1299.00"],
            ["1", "22", "1", "59.00"],
            ["1", "24", "1", "49.00"],
            ["2", "6", "1", "249.00"],
            ["2", "7", "1", "129.00"],
          ],
          caption: "No single column is unique — but (1, 1), (1, 22), (1, 24), (2, 6), (2, 7) each appear exactly once.",
        },
        {
          kind: "visual",
          title: "Composite key, visually",
          ascii: `  order_items
  (order_id, product_id)  <- THE primary key (both together)
  +----------+------------+----------+
  | order_id | product_id | quantity |
  +----------+------------+----------+
  |    1     |     1      |    1     |   (1, 1) once
  |    1     |    22      |    1     |   (1, 22) once
  |    2     |     6      |    1     |   (2, 6) once
  +----------+------------+----------+
      each PAIR unique - either column alone repeats`,
          caption: "Composite keys are common in tables that connect two other tables — you will meet them again in the relationships lesson.",
        },
      ],
      terms: [
        { term: "Primary key", definition: "The column or columns whose values uniquely identify every row of a table; unique, never missing." },
        { term: "Natural key", definition: "A primary key taken from the real world, like an ISBN or country code — meaningful but fragile." },
        { term: "Surrogate key", definition: "A meaningless identifier (usually a sequence number) generated for the sole purpose of identifying rows." },
        { term: "Composite key", definition: "A primary key made of two or more columns whose combination is unique." },
      ],
      mistakes: [
        {
          mistake: "Using a name or email as the primary key",
          why: "Names repeat and change; emails get recycled or shared. The day two rows collide, the database starts rejecting legitimate rows — or worse, the design quietly degrades.",
          fix: "Use a surrogate id for identity. You can still keep emails unique with a separate uniqueness rule, which Part D covers.",
        },
        {
          mistake: "Thinking the primary key must be the first column",
          why: "It is a logical role, not a position. Plenty of tables put ids elsewhere; composite keys span columns.",
          fix: "Find the column or pair whose values identify rows — that is the key, wherever it sits.",
        },
        {
          mistake: "Assuming a row's position in the table can identify it",
          why: "'The fifth row' is not a fact stored in the table; row order is not guaranteed, and deleting a row shifts everything after it.",
          fix: "Identity must be a value in the row, not a position in a listing.",
        },
      ],
      takeaways: [
        "Every table needs a primary key: the value that identifies each row.",
        "A PK is unique, present, and (in practice) unchanging — enforced by the database.",
        "Prefer surrogate ids over real-world facts; reserve natural keys for stable reference data.",
        "When no single column works, a composite key (like order_id + product_id) can.",
      ],
      quiz: [
        {
          id: "a-05-q1",
          prompt: "Which column is the LEAST safe primary key for a customers table?",
          options: [
            { text: "customer_id, a number assigned in sequence", correct: false, feedback: "This is the standard safe choice — meaningless, unique, never changes." },
            { text: "phone, because everyone has one", correct: true, feedback: "Correct — phones change, are shared within families, and can be missing. It fails all three PK tests." },
            { text: "a UUID generated when the row is created", correct: false, feedback: "UUIDs are excellent keys: unique by construction and meaningless by design." },
          ],
          explanation: "A phone number can change, can be missing, and can be shared — it fails the uniqueness, presence and stability tests that keys must pass.",
        },
        {
          id: "a-05-q2",
          prompt: "In order_items, why is (order_id, product_id) the primary key rather than order_id alone?",
          options: [
            { text: "Because order_id alone repeats across the rows of one order's items", correct: true, feedback: "Correct — one order has several items, so order_id cannot identify a single line; the pair does." },
            { text: "Because product_id is too large a number", correct: false, feedback: "Size has nothing to do with key choice." },
            { text: "Because two keys are always safer than one", correct: false, feedback: "Keys are not redundant backups; they are identity. Add columns only when identity needs them." },
          ],
          explanation: "Identity is whatever picks out exactly one row. In order_items that is the pair: (order_id, product_id) appears at most once.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-06",
      title: "Foreign keys",
      minutes: 14,
      summary: "A foreign key is a column that holds another table's primary key — the database-checked promise that the connection points somewhere real.",
      kind: "concept",
      dataset: "ecommerce",
      objectives: [
        "Explain what a foreign key is and what it promises",
        "Read a foreign key relationship between two tables",
        "Describe what referential integrity prevents, with examples",
        "Recognize the orphan-row problem a foreign key makes impossible",
      ],
      why: "Databases do not just store facts; they store facts that reference each other — every order points at a customer, every prescription at an admission, every transaction at an account. If those pointers can point at nothing, the data quietly rots: orders for customers who do not exist, payments for deleted accounts. Foreign keys are how a relational database turns 'these tables are connected' from a comment in a document into a guarantee enforced on every write. This is the integrity superpower you saw promised in lesson a-02, and it is why serious systems never ship without them.",
      blocks: [
        {
          kind: "text",
          text: "A **foreign key** (FK) is a column in one table whose values must match the primary key values of another table. In ShopSphere, the orders table has a customer_id column; every value in it must be the customer_id of a row that actually exists in customers. The FK is the connective tissue of the relational model — and unlike the connections in a spreadsheet, the database *checks* it.",
        },
        {
          kind: "visual",
          title: "The foreign key, in one picture",
          ascii: `   customers                              orders
   (primary key: customer_id)            (foreign key: customer_id)
   +-------------+----------+            +----------+-------------+
   | customer_id | name     |            | order_id | customer_id |
   +-------------+----------+            +----------+-------------+
   |      1      | Amelia   |<----.      |    501   |      1      | valid:
   |      2      | Marcus   |<--.  \\     |    502   |      2      |  1 and 2
   +-------------+----------+    \\  '---|    503   |      1      |  exist
                                    \\
                                     '---|    504   |     99      | REJECTED:
                                         +----------+-------------+ 99 matches
                                                                           nobody`,
          caption: "orders.customer_id may only hold values that exist as customers.customer_id. An order for customer 99 is refused at the door.",
        },
        {
          kind: "text",
          text: "That guarantee has a name: **referential integrity** — every reference points at a real row. It works in both directions. You cannot *create* a dangling reference (an order for non-existent customer 99 is rejected). And in many setups — including this course's datasets — you cannot *delete* the target of a reference either: deleting customer 1 while orders 501 and 503 still point at her is refused, because it would leave those orders orphaned.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Checked baggage",
          text: "A foreign key is like a luggage tag that the airline verifies at check-in: every tag must correspond to a real passenger on the flight list. No passenger, no tag. You cannot print a tag for a ghost, and you cannot remove a passenger from the list while their bag is still checked. The tag (FK) always resolves to a real person (PK row).",
        },
        { kind: "heading", text: "Reading a foreign key" },
        {
          kind: "text",
          text: "Foreign keys read the same way everywhere. Find the FK column, find the table whose PK it matches, and say the sentence: '*each row of this table refers to exactly one row of that table.*' Each **order** refers to exactly one **customer** (orders.customer_id → customers.customer_id). Each **admission** refers to exactly one **patient** (admissions.patient_id → patients.patient_id). Each **transaction** refers to exactly one **account** (transactions.account_id → accounts.account_id). One sentence, any database.",
        },
        {
          kind: "table",
          title: "Foreign keys across the six course databases",
          headers: ["Table with FK", "FK column", "Points at", "The sentence"],
          rows: [
            ["orders", "customer_id", "customers", "Each order refers to one customer"],
            ["admissions", "patient_id", "patients", "Each admission refers to one patient"],
            ["enrollments", "student_id", "students", "Each enrollment refers to one student"],
            ["transactions", "account_id", "accounts", "Each transaction refers to one account"],
            ["inventory", "product_id", "products", "Each stock row refers to one product"],
            ["employee_projects", "project_id", "projects", "Each staffing row refers to one project"],
          ],
          caption: "Six databases, same pattern: an FK column names the target table's primary key.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Foreign keys are declared, not implied",
          text: "In PostgreSQL you *declare* the foreign key when you create the table (you will write your first one in Part B, and manage one deliberately in Part D). Once declared, every insert and delete is checked forever — no program, script or sleepy human can bypass it.",
        },
        {
          kind: "text",
          text: "One more nuance you will meet in Part D: what *should* happen when someone tries to delete a row that other rows still reference? PostgreSQL lets the designer choose: refuse the delete (the default, and the choice in this course's datasets), or cascade the deletion through the referencing rows — delete an order and its line items go with it. Both are legitimate; the point is that the behavior is *chosen and declared*, never accidental.",
        },
      ],
      terms: [
        { term: "Foreign key", definition: "A column whose values must match the primary key of another table, linking the two." },
        { term: "Referential integrity", definition: "The guarantee that every reference points at a real row — no dangling pointers, no orphans." },
        { term: "Orphan row", definition: "A row whose foreign key points at a row that does not exist — impossible when the FK is declared." },
        { term: "Cascading delete", definition: "A declared behavior where deleting a referenced row also deletes the rows referencing it." },
      ],
      mistakes: [
        {
          mistake: "Adding an orders row with customer_id 999 'to fix it later'",
          why: "If the foreign key is declared, the database rejects the insert outright; if it is not, the row becomes an invisible orphan that silently disappears from joined reports.",
          fix: "Fix the data, not the key: either use a real customer_id or finish creating the customer first.",
        },
        {
          mistake: "Deleting a customer to 'clean up' and wondering why the database refuses",
          why: "Their orders still reference them; deleting would orphan every one of those orders.",
          fix: "This refusal is referential integrity protecting you. Archive the customer instead (Part D shows how), or deliberately choose what happens to dependent rows.",
        },
        {
          mistake: "Confusing the foreign key column with the primary key of its own table",
          why: "orders.customer_id is not the orders table's identity — order_id is. The FK is a *reference*, not a name.",
          fix: "Say it precisely: 'customer_id is the foreign key of orders and the primary key of customers.' Same value, two different roles.",
        },
      ],
      takeaways: [
        "A foreign key column holds another table's primary key values.",
        "Declared FKs give referential integrity: no dangling references, ever, in either direction.",
        "Read any FK with one sentence: 'each row here refers to exactly one row there.'",
        "What happens on delete is chosen and declared — refuse by default, cascade when designed.",
      ],
      quiz: [
        {
          id: "a-06-q1",
          prompt: "Someone runs a script that inserts a transaction for account_id 999, but no account 999 exists. What does a declared foreign key on transactions.account_id do?",
          options: [
            { text: "Inserts it, but flags the row with a warning", correct: false, feedback: "There is no warning tier — referential integrity is enforced, not advisory." },
            { text: "Rejects the insert with an error", correct: true, feedback: "Correct. The value fails the FK check, so nothing is written." },
            { text: "Creates an empty account 999 automatically", correct: false, feedback: "The database never invents rows on your behalf — it rejects instead." },
          ],
          explanation: "A declared foreign key is checked at write time. A value with no matching target simply cannot be stored.",
        },
        {
          id: "a-06-q2",
          prompt: "What is an orphan row?",
          options: [
            { text: "A row with no primary key", correct: false, feedback: "A row without a PK value cannot be stored at all — the PK rule forbids it." },
            { text: "A row whose foreign key points at a row that does not exist", correct: true, feedback: "Correct — a dangling reference, made impossible by declared foreign keys." },
            { text: "A row nobody has read in over a year", correct: false, feedback: "Freshness has nothing to do with integrity." },
          ],
          explanation: "Orphans are dangling references. With FKs declared, PostgreSQL refuses both halves of the problem: creating the dangling row, and deleting the row it points at.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-07",
      title: "Database relationships",
      minutes: 15,
      summary: "One-to-one, one-to-many and many-to-many — the three ways tables relate, and how junction tables make the third one work.",
      kind: "concept",
      dataset: "university",
      objectives: [
        "Classify a relationship between two tables as 1:1, 1:N or M:N",
        "Explain where the foreign key lives in each kind",
        "Describe what a junction table is and why many-to-many needs one",
        "Read a real schema and state its relationships out loud",
      ],
      why: "Relationships are where databases stop being filing cabinets and start modeling the world: patients have admissions, students have courses, employees have managers. Almost every real question — 'which customers bought nothing this quarter?', 'which doctors share the most patients?' — is a question about relationships, not about single tables. Misreading the kind of relationship is also the most common design error beginners make, so this lesson drills the skill until it is reflex.",
      blocks: [
        {
          kind: "text",
          text: "Two tables can relate in exactly three shapes. **One-to-one (1:1)**: each row of A matches at most one row of B, and vice versa. **One-to-many (1:N)**: each row of A can match many rows of B, but each B row matches only one A. **Many-to-many (M:N)**: rows on both sides can match many rows on the other. Every relationship you will ever meet is one of these three — the whole skill is learning to see which.",
        },
        { kind: "heading", text: "One-to-many: the workhorse" },
        {
          kind: "text",
          text: "One-to-many is by far the most common shape. One **customer** places many **orders**; each order belongs to exactly one customer. One **patient** has many **admissions**; each admission is one patient's stay. One **account** has many **transactions**. The pattern gives you the rule instantly: *the foreign key lives on the 'many' side.* Orders carry customer_id; admissions carry patient_id; transactions carry account_id.",
        },
        {
          kind: "visual",
          title: "1:N — one customer, many orders",
          ascii: `   customers (one side)              orders (many side, holds the FK)
   +-------------+---------+         +----------+-------------+
   | customer_id | name    |         | order_id | customer_id |
   +-------------+---------+         +----------+-------------+
   |      1      | Amelia  |-------->|    501   |      1      |
   |             |         |-------->|    502   |      1      |
   |      2      | Marcus  |--.      +----------+-------------+
   +-------------+---------+   \\
                                '---->|    503   |      2      |
                                     +----------+-------------+
     Amelia: 2 orders.  Marcus: 1 order.  Each order: exactly 1 customer.`,
          caption: "The FK (customer_id) sits on the many side. A customer with zero orders is fine — that is still one-to-many.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Zero is allowed on the many side",
          text: "A customer with no orders, a patient with no admissions, an account with no transactions yet — all perfectly legal in 1:N. 'Many' in database-speak includes zero. You will use exactly this fact to find 'customers who never ordered' in the joins part of this course.",
        },
        { kind: "heading", text: "One-to-one: the specialist" },
        {
          kind: "text",
          text: "In one-to-one, each row of A matches at most one row of B, and vice versa. In ShopSphere, each **paid order** has exactly one **payment** row — the payments table even declares its order_id column *unique* to enforce the 'at most one' side. 1:1 appears when one thing naturally splits across two tables: a customer and their loyalty profile, an employee and their confidential background check. The FK can sit on either side; put it where the row is optional.",
        },
        {
          kind: "table",
          title: "1:1 in the wild: one order, one payment",
          headers: ["payment_id", "order_id", "method", "amount"],
          rows: [
            ["1", "1", "card", "1407.00"],
            ["2", "2", "paypal", "378.00"],
          ],
          caption: "order_id in payments is unique: each order appears at most once. Pending orders appear not at all.",
        },
        { kind: "heading", text: "Many-to-many and the junction table" },
        {
          kind: "text",
          text: "Now the interesting one. A **student** takes many **courses**; a **course** has many **students**. Many on both sides. You cannot put course_id on students (one column holds one value, and she takes five courses), nor student_id on courses. The solution is a third table in the middle — a **junction table** — whose rows each represent ONE pairing: student 1 takes course 2 in term 2021S and earned an A. Northgate's enrollments table is exactly this, with a composite primary key of (student_id, course_id, term).",
        },
        {
          kind: "table",
          title: "enrollments: the junction between students and courses",
          headers: ["student_id", "course_id", "term", "grade"],
          rows: [
            ["1", "1", "2020F", "A"],
            ["1", "2", "2021S", "A"],
            ["1", "4", "2022F", "B"],
            ["1", "5", "2023S", "B"],
            ["2", "1", "2021F", "A"],
          ],
          caption: "Student 1 appears in many rows (many courses); course 1 appears in many rows (many students). Each row is one enrollment event.",
        },
        {
          kind: "visual",
          title: "M:N via a junction table",
          ascii: `    students                 enrollments                courses
    +------------+           (the junction)            +------------+
    | student_id |           +------------+----+       | course_id  |
    +------------+           | student_id |course_id   +------------+
    |     1      |---------->|     1      |    1  <-----|>    1      |
    |     2      |---------->|     1      |    2  <-------------|    2      |
    +------------+           |     2      |    1  <-----|>    ...
                             +------------+----+
     student 1 --many courses            many students-- course 1
     The junction row (1, 2, ...) IS the relationship,
     and can carry its own facts: term and grade.`,
          caption: "The junction table turns one impossible many-to-many into two easy one-to-many relationships.",
        },
        {
          kind: "text",
          text: "Notice something powerful: junction rows can carry *their own facts*. An enrollment is not a bare pairing — it has a term and a grade. A staffing row in HeliosWorks (employee_projects) carries a role and an allocation percentage. The relationship itself has data, and the junction table is exactly where it lives. Spotting when a 'link' needs its own columns is one of the hallmarks of good database design — you will practice it in this part's mini project.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "How to classify any relationship",
          text: "Pick one row of A and ask: how many rows of B can relate to it — at most one, or many? Then reverse: one row of B, how many A? one+one = 1:1, many+one = 1:N, many+many = M:N (junction table). Two questions, always the answer.",
        },
        {
          kind: "table",
          title: "The relationships you have already met",
          headers: ["Relationship", "Kind", "Where the connection lives"],
          rows: [
            ["customers -> orders", "1:N", "orders.customer_id"],
            ["orders -> payments", "1:1", "payments.order_id (unique)"],
            ["students <-> courses", "M:N", "enrollments (junction, with term + grade)"],
            ["employees <-> projects", "M:N", "employee_projects (junction, with role + allocation)"],
            ["employees -> employees (manager)", "1:N (self)", "employees.manager_id points back at employees"],
          ],
          caption: "The last row is the org chart: one manager has many reports; each employee has one manager — a one-to-many relationship from a table to itself. More on that in the self-join lesson.",
        },
      ],
      terms: [
        { term: "One-to-many (1:N)", definition: "Each row of one table may relate to many rows of another; each of those relates back to exactly one. The FK lives on the many side." },
        { term: "One-to-one (1:1)", definition: "Each row relates to at most one row on the other side, and vice versa." },
        { term: "Many-to-many (M:N)", definition: "Rows on both sides may relate to many rows on the other; implemented with a junction table." },
        { term: "Junction table", definition: "A table whose rows represent pairings between two other tables, often carrying facts about the pairing itself." },
      ],
      mistakes: [
        {
          mistake: "Putting a FK on the 'one' side of a one-to-many",
          why: "Adding orders_id to customers implies each customer has at most one order — the model now forbids repeat customers, which is nonsense for a store.",
          fix: "Ask 'how many?' on each side, then put the FK where 'many' is: orders.customer_id.",
        },
        {
          mistake: "Trying to express many-to-many with a single column",
          why: "A courses column on students holding 'CS 101, MATH 201' cannot be queried, indexed or integrity-checked — it is a spreadsheet habit smuggled into a database.",
          fix: "Make a junction table. Two 1:N relationships are always easier than one M:N column.",
        },
        {
          mistake: "Forgetting that relationship rows can need their own data",
          why: "A bare (student, course) pairing loses the term and the grade — the most interesting facts of the relationship.",
          fix: "Design the junction row as a thing in its own right: what happened, when, with what attributes?",
        },
      ],
      takeaways: [
        "There are exactly three relationship shapes: 1:1, 1:N and M:N.",
        "In 1:N the foreign key lives on the many side — always.",
        "Many-to-many is built from a junction table: two 1:N relationships back to back.",
        "Junction rows can carry their own facts (term, grade, role, allocation).",
      ],
      quiz: [
        {
          id: "a-07-q1",
          prompt: "Doctors and patients in the hospital database: one doctor treats many patients, and one patient can be treated by many doctors over time. What shape is this, and how is it stored?",
          options: [
            { text: "1:N — patient_id on doctors", correct: false, feedback: "That would mean each doctor relates to exactly one patient row — it cannot express a doctor's many patients, let alone shared ones." },
            { text: "M:N — through a junction such as admissions, which carries its own facts", correct: true, feedback: "Correct — admissions (or a treatments table) connects doctors and patients, carrying dates and diagnoses." },
            { text: "1:1 — one doctor per patient for life", correct: false, feedback: "Real hospitals do not work that way, and neither does the data." },
          ],
          explanation: "Many patients per doctor and many doctors per patient is many-to-many, implemented through a junction — in this database, the admissions table, which also stores the department, dates and diagnosis.",
        },
        {
          id: "a-07-q2",
          prompt: "Where does the foreign key live for 'one branch has many accounts'?",
          options: [
            { text: "On branches: branches.account_id", correct: false, feedback: "One column on branches could name only ONE account per branch — but branches hold many." },
            { text: "On accounts: accounts.branch_id", correct: true, feedback: "Correct — each account row names its one branch; many accounts can name the same branch." },
            { text: "In a separate junction table", correct: false, feedback: "Junctions are for many-to-many; this is a plain one-to-many." },
          ],
          explanation: "The FK goes on the 'many' side. Each account belongs to exactly one branch, so accounts.branch_id references branches.branch_id.",
        },
        {
          id: "a-07-q3",
          prompt: "Why does enrollments have a composite primary key of (student_id, course_id, term)?",
          options: [
            { text: "Because no single column identifies an enrollment", correct: true, feedback: "Correct — student 1 appears many times, course 2 appears many times; only the combination picks out one enrollment event. Term is included because a student can retake a course in a later term." },
            { text: "Because three columns are more secure than one", correct: false, feedback: "Security is unrelated; keys are about identity." },
            { text: "Because grades must be unique", correct: false, feedback: "Grades repeat all the time — many students earn A's." },
          ],
          explanation: "Identity comes from the combination: who, what, and when. One student can take one course twice across terms, so all three columns are needed to identify a single enrollment.",
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      slug: "a-08",
      title: "From spreadsheets to databases",
      minutes: 13,
      summary: "Why teams trade the freedom of a spreadsheet for the guarantees of a database — and a first glimpse of SQL as the payoff.",
      kind: "concept",
      dataset: "ecommerce",
      objectives: [
        "Decide when a spreadsheet is the right tool and when a database is",
        "Explain redundancy and update anomalies in plain words",
        "Recognize how this part's ideas — tables, keys, relationships — fit together",
        "Run your first pre-written query in the Lab, as a preview of Part B",
      ],
      why: "You now know what data is, what a database does, and how tables, primary keys, foreign keys and relationships model a business. This closing lesson assembles those ideas into the working judgment you will use forever: when to reach for a spreadsheet, and what exactly you gain by reaching for a database instead. It ends with a controlled preview — you will run one real SQL query, written for you, purely to see the destination. Part B then takes you there properly.",
      blocks: [
        {
          kind: "text",
          text: "First, fairness: spreadsheets are magnificent. For one person, one sheet, one afternoon — a party list, a quick budget, a one-off analysis — they are faster than any database and nobody should feel bad using them. The question is only ever: what happens when the sheet grows, or the team grows, or time passes?",
        },
        { kind: "heading", text: "The story every team lives through" },
        {
          kind: "text",
          text: "A shop starts with one spreadsheet: a row per order, with the customer's name, city and email typed onto every order row. For a month, it is perfect. Then a customer moves from Portland to Seattle — and now 12 rows disagree about where she lives. Someone 'fixes' 9 of them. Reports now say she bought from two cities. This is **redundancy** breeding an **update anomaly**: the same fact stored many times, each copy free to drift.",
        },
        {
          kind: "visual",
          title: "Update anomaly, one spreadsheet",
          ascii: `  order sheet (flat)
  +---------+-------------+-----------+----------+----------------+
  | order_id| customer    | city      | total    | email          |
  +---------+-------------+-----------+----------+----------------+
  |   501   | Amelia W.   | Portland  | 142.00   | amelia@ex.com  | <- she moves
  |   502   | Amelia W.   | Portland  |  29.90   | amelia@ex.com  | <- to Seattle
  |   503   | Amelia W.   | Seattle   |  89.00   | amelia@ex.com  | <- fixed!
  |   504   | Amelia W.   | Portland  |  45.00   | amelia@ex.com  | <- missed...
  |   505   | Amelia W.   | Portland  |  12.50   | a.watson@ex.co | <- typo'd!
  +---------+-------------+-----------+----------+----------------+
  Same customer, five stories about her. Which one is true?`,
          caption: "When the same fact lives in many rows, every change must find every copy — and it never does.",
        },
        {
          kind: "text",
          text: "The database answer is everything this part taught you. Store the customer ONCE in a customers table with a primary key. Let each order carry only the customer's id as a foreign key. The city now lives in exactly one row; changing it once changes it everywhere, because everywhere else just points at that row. Redundancy and its anomalies are designed away, not policed by diligence. This is also precisely how the real ShopSphere database you have been reading is built.",
        },
        {
          kind: "table",
          title: "The trade, honestly stated",
          headers: ["", "Spreadsheet", "Database"],
          rows: [
            ["Start-up effort", "Seconds", "Minutes to hours (design + setup)"],
            ["Repeated facts", "Stored again on every row", "Stored once, referenced by key"],
            ["Wrong values", "Accepted silently", "Rejected by declared rules"],
            ["Two editors at once", "Last save wins", "Coordinated safely"],
            ["At 500,000 rows", "Painful", "Composed and indexed"],
            ["New kinds of questions", "Retype, re-sort, re-filter by hand", "One more query"],
          ],
          caption: "You are trading freedom of form for guarantees of correctness. For shared, lasting, valuable data, that trade is a bargain.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The move from notes to accounting",
          text: "A shoebox of receipts and a proper ledger both 'record money'. The ledger's rules — every entry dated, every account named, totals that must reconcile — feel like bureaucracy until tax season, when they become the only reason you can trust anything. Database rules are the same bureaucracy, bought voluntarily, paying off the day the data matters.",
        },
        { kind: "heading", text: "What you now carry into Part B" },
        {
          kind: "steps",
          title: "The Part A checklist",
          items: [
            "Data is recorded facts; information is data arranged to answer a question.",
            "A database (run by a DBMS like PostgreSQL) provides concurrency, integrity, durability and fast access.",
            "The relational model stores one kind of thing per table: rows are things, columns are typed facts.",
            "Primary keys identify rows; foreign keys connect tables with database-checked references.",
            "Relationships come in exactly three shapes: 1:1, 1:N and M:N — the last via a junction table.",
            "Good design removes redundancy: store each fact once, reference it by key.",
          ],
        },
        {
          kind: "text",
          text: "Here is your reward for the theory: one real query, already written, on the real ShopSphere database — customers and how much they have ordered, computed live by real PostgreSQL. You do not need to understand a word of the syntax yet; that is exactly what Part B is for. Click **Run** and watch the spreadsheet story end: the totals are computed from the order rows, not typed by anyone, so they cannot be wrong.",
        },
        {
          kind: "lab",
          title: "Witness your first query (no writing required)",
          task: "Just press Run. This query is Part B's destination: 'for each customer, the number of orders and total spent, biggest spenders first, top 5'. Everything in it — the tables, the keys, the relationships — is something you can now name.",
          code: "SELECT c.first_name,\n       c.last_name,\n       c.city,\n       count(o.order_id) AS orders,\n       sum(o.total) AS total_spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.first_name, c.last_name, c.city\nORDER BY total_spent DESC\nLIMIT 5;",
          dataset: "ecommerce",
          hint: "If you are curious already: FROM says which tables, JOIN says how they connect via customer_id, GROUP BY collapses orders per customer, ORDER BY sorts by the computed total, LIMIT keeps the top 5.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where you are headed",
          text: "Part B gets PostgreSQL running for you — first in the browser Lab (no installation needed), then on your own machine with a proper local install and the psql command line. You will create databases and tables, insert real rows, and start reading the six sample databases with your own queries. The vocabulary of Part A becomes muscle memory fast.",
        },
      ],
      terms: [
        { term: "Redundancy", definition: "Storing the same fact in more than one place — the root cause of drifting, contradictory data." },
        { term: "Update anomaly", definition: "The inconsistency that appears when a redundant fact is changed in some copies but not others." },
        { term: "Flat table", definition: "A single wide table (spreadsheet-style) holding every fact of every kind — workable small, corrosive as it grows." },
      ],
      mistakes: [
        {
          mistake: "Concluding 'spreadsheets are bad'",
          why: "Blanket dismissal leads to building databases for birthday lists — wasted effort that breeds resistance to using databases where they matter.",
          fix: "Use the trade table: personal, small, throwaway work belongs in a sheet; shared, rule-governed, growing data belongs in a database.",
        },
        {
          mistake: "Trying to fix redundancy by being careful",
          why: "Discipline does not scale: the day the team is busy, tired or new, a copy gets missed and the anomaly is back. Rules enforced by the database do not have bad days.",
          fix: "Remove redundancy structurally — one row per fact, referenced by keys — instead of policing it procedurally.",
        },
      ],
      takeaways: [
        "Spreadsheets suit personal, small, short-lived data; databases suit shared, lasting, valuable data.",
        "Redundancy causes update anomalies; keys and references remove redundancy structurally.",
        "Everything in Part A — tables, keys, relationships — exists to make facts stored once provably correct.",
        "You have now run real SQL on real PostgreSQL. Part B teaches you to write it.",
      ],
      quiz: [
        {
          id: "a-08-q1",
          prompt: "The order sheet stores the customer's city on every order row. She moves; eleven rows get updated, two are missed. What is this called?",
          options: [
            { text: "A concurrency problem", correct: false, feedback: "Nobody else was editing at the same time — this is about one fact living in many places." },
            { text: "An update anomaly caused by redundancy", correct: true, feedback: "Correct — the same fact stored repeatedly, updated inconsistently." },
            { text: "A lost update", correct: false, feedback: "Lost updates happen when two writers clobber each other; here a single editor simply could not find every copy." },
          ],
          explanation: "Redundancy stores one fact many times; an update anomaly is the drift that follows when the copies disagree. The cure is structural: store the fact once, reference it by key.",
        },
        {
          id: "a-08-q2",
          prompt: "Which change most directly removes the city-drift problem from the shop's data?",
          options: [
            { text: "A team rule that everyone must update all rows carefully", correct: false, feedback: "Procedures do not scale and have bad days — the anomaly returns." },
            { text: "Storing each customer once, with orders referencing the customer by key", correct: true, feedback: "Correct — the city then lives in exactly one row and cannot disagree with itself." },
            { text: "Adding a 'verified' checkbox column to each row", correct: false, feedback: "A second column of manual marks does not remove the first column's copies." },
          ],
          explanation: "One row per fact, referenced by foreign key, makes contradictory copies structurally impossible — the whole point of Part A.",
        },
      ],
    },
  ],

  /* ------------------------------------------------------------------ */
  /* Exercises — concept mode: inspect real tables, answer, get graded. */
  /* ------------------------------------------------------------------ */
  exercises: [
    {
      id: "a-b1",
      tier: "beginner",
      mode: "concept",
      title: "What is one row?",
      prompt: "Open the university database's students table (use the sample tables below or the Lab's schema explorer). Each row has a student_id, a first name, a last name, an email, a major department id, an enrollment year, a GPA and a city. Look at any single row and answer: what does ONE ROW of this table represent? Choose the sentence that describes it best.",
      dataset: "university",
      sampleTables: ["students"],
      hint: "Cover a row with your hand and ask: what single thing in the world does it describe?",
      concepts: ["tables", "rows"],
      explanation: "One row of students represents exactly one student — one person enrolled at the university, described by their id, name, contact details, major, year, GPA and city. Not a department, not a class, not a year: a single student. Every question you will ever ask of this table starts by knowing what its rows are.",
      choices: [
        { text: "One student enrolled at the university", correct: true, feedback: "Correct — the row is one person; every column describes that person." },
        { text: "One department, because rows list a major_dept_id", correct: false, feedback: "The department is a value on the row — the row itself is a student who HAS a major." },
        { text: "One academic year, because rows list an enrollment_year", correct: false, feedback: "Many rows share a year; the year is one fact about a student, not the thing itself." },
      ],
    },
    {
      id: "a-b2",
      tier: "beginner",
      mode: "concept",
      title: "Spot the primary key",
      prompt: "Look at the products table in the e-commerce database. Its columns are product_id, name, brand, price, stock, rating and launched. Two products could share a brand; many share a launch date; prices can tie; names are unique only until a store stocks two similar items. Which column is the primary key — the one that identifies each row uniquely and is never missing?",
      dataset: "ecommerce",
      sampleTables: ["products"],
      hint: "Ask of each column: could two rows ever share this value? Could a row lack it?",
      concepts: ["primary keys", "identity"],
      explanation: "product_id is the primary key: every product gets exactly one, no two products share it, and no product can be stored without one. Name is *currently* unique in this data but is one re-branding away from colliding; brand, launch date, price and stock all repeat by nature. Identity must be guaranteed, not merely convenient.",
      choices: [
        { text: "product_id", correct: true, feedback: "Correct — unique, always present, meaningless enough to never need to change." },
        { text: "name", correct: false, feedback: "Tempting, but names are real-world facts: they get re-used, re-branded and localized. Never bet identity on them." },
        { text: "brand", correct: false, feedback: "Many products share a brand — it cannot identify a single row." },
        { text: "launched", correct: false, feedback: "Many products launch on the same date; launch date is a fact, not an identity." },
      ],
    },
    {
      id: "a-b3",
      tier: "beginner",
      mode: "concept",
      title: "Data or information?",
      prompt: "A nurse reads a list of every lab result taken in the cardiology department this month: patient ids, test names, values, flags. Then she reads a report that says: 'Dr. Mehta's patients show an abnormal-lab-result rate of 34%, the highest in the hospital.' Using this lesson's vocabulary, what is the second thing she read?",
      dataset: "hospital",
      sampleTables: ["lab_results"],
      concepts: ["data", "information"],
      explanation: "The first reading is data: raw recorded facts, one per lab result. The second is information: data selected, grouped (per doctor), computed (a rate) and arranged to answer a specific question — 'whose patients have the most abnormal results?'. Databases store the first; queries — which you start writing in Part B — produce the second.",
      choices: [
        { text: "Also data, just shorter data", correct: false, feedback: "The difference is not size but purpose: this text exists to answer a question." },
        { text: "Information — data arranged to answer a question", correct: true, feedback: "Correct — selected, grouped and computed into an answer someone can act on." },
        { text: "A schema, because it describes structure", correct: false, feedback: "Schemas describe tables and columns; this is a conclusion drawn from stored facts." },
      ],
    },
    {
      id: "a-b4",
      tier: "beginner",
      mode: "concept",
      title: "Which type fits?",
      prompt: "You are designing a patients table for a hospital. One column will hold each patient's date of birth. Of the options below, which is the right type for that column — the type that lets the database store it exactly, reject nonsense, and answer questions like 'who is over 65'?",
      dataset: "hospital",
      sampleTables: ["patients"],
      hint: "Types are the database's first line of integrity defense. Which option can the database actually check?",
      concepts: ["types", "integrity"],
      explanation: "A date type stores day-precision values that the database understands: it rejects '1980-13-45' outright, knows that 1961-02-29 does not exist, and can compare dates to answer age questions. Text would accept anything, including impossible dates; a number loses the calendar entirely; a boolean cannot even represent the concept. Choosing the type IS choosing which nonsense the database will refuse.",
      choices: [
        { text: "text, so any format the clerk types is accepted", correct: false, feedback: "Accepting anything means accepting '1980-13-45' and 'last Tuesday' — integrity lost at the door." },
        { text: "date, the calendar-aware type", correct: true, feedback: "Correct — exact storage, automatic rejection of impossible dates, and real date comparisons." },
        { text: "integer, storing the year of birth only", correct: false, feedback: "You would lose the month and day — and ages computed from years alone are wrong half the time." },
        { text: "boolean, true if the patient is over 65", correct: false, feedback: "That stores a derived answer, not the fact — and it silently goes wrong every birthday." },
      ],
    },

    /* ------------------------- intermediate ------------------------- */
    {
      id: "a-i1",
      tier: "intermediate",
      mode: "concept",
      title: "Read the foreign key",
      prompt: "In the banking database, the accounts table has a column branch_id whose values match branch_id in the branches table. Each branch appears in many account rows; each account row names exactly one branch. Which sentence correctly describes accounts.branch_id, and what does the database enforce about it?",
      dataset: "banking",
      sampleTables: ["accounts", "branches"],
      hint: "Two halves: what does the column mean, and what does a declared foreign key guarantee?",
      concepts: ["foreign keys", "referential integrity"],
      explanation: "accounts.branch_id is a foreign key referencing branches.branch_id: each account belongs to exactly one branch, while one branch holds many accounts (one-to-many, FK on the many side). Because it is declared, PostgreSQL guarantees referential integrity — an account cannot be stored with a branch_id that matches no branch, and (with this course's default rules) a branch still referenced by accounts cannot be deleted. Both halves — the meaning and the guarantee — are what make it a foreign key rather than just a number.",
      choices: [
        { text: "It is a foreign key: each account refers to one branch, and the database rejects branch values that match no branch", correct: true, feedback: "Correct — the reference has meaning AND an enforced guarantee." },
        { text: "It is a second primary key on accounts, identifying branches", correct: false, feedback: "A table has one primary key; branch_id repeats across account rows, so it cannot identify them anyway." },
        { text: "It is just a number; keeping it valid is the programmers' job", correct: false, feedback: "That is the file-world philosophy — with a declared FK the database itself does the checking on every write." },
      ],
    },
    {
      id: "a-i2",
      tier: "intermediate",
      mode: "concept",
      title: "Classify the relationship",
      prompt: "In the banking database: one customer may hold several accounts (checking, savings, a CD); each account belongs to exactly one customer. Some customers hold none. What shape is this relationship, where does the foreign key live, and why?",
      dataset: "banking",
      sampleTables: ["customers", "accounts"],
      hint: "One row of customers — how many accounts? One row of accounts — how many customers?",
      concepts: ["relationships", "one-to-many"],
      explanation: "This is one-to-many (1:N): many accounts per customer, one customer per account. The foreign key lives on the many side — accounts.customer_id — because a single column on an account row can name its one customer, while no single column on a customer row could ever name all her accounts. Customers with zero accounts fit fine: 'many' includes zero. Putting the FK on the customers side (as beginners often first try) would silently forbid anyone from holding more than one account.",
      choices: [
        { text: "1:N; accounts.customer_id is the foreign key", correct: true, feedback: "Correct — FK on the many side, where one column can hold the one reference." },
        { text: "1:1; customers.account_id names each customer's account", correct: false, feedback: "That design makes multi-account customers impossible — a severe misreading of banking." },
        { text: "M:N; a junction table is required", correct: false, feedback: "Junctions are for many-on-BOTH sides; here each account has exactly one customer." },
      ],
    },
    {
      id: "a-i3",
      tier: "intermediate",
      mode: "concept",
      title: "Why a junction table?",
      prompt: "The university wants to record which students take which courses. A student takes many courses; a course has many students; each pairing happens in a term and can earn a grade. A teammate suggests adding a courses column to students, holding a comma-separated list like 'CS 101, MATH 201'. Why is the enrollments junction table the right design instead?",
      dataset: "university",
      sampleTables: ["students", "courses", "enrollments"],
      hint: "Where would the term and the grade live? Could the database check that 'CS 101' is a real course?",
      concepts: ["many-to-many", "junction tables"],
      explanation: "A comma-separated column cannot be integrity-checked (is 'CS 101' a real course? is it offered this term?), cannot be indexed for fast lookup, cannot prevent duplicates — and has nowhere to put the term and the grade, which are facts about the pairing, not about the student or the course. The enrollments junction table fixes all four: each row is one pairing with its own columns (term, grade), its student_id and course_id are real foreign keys checked by the database, and (student_id, course_id, term) as a composite key forbids accidental duplicates while allowing retakes across terms.",
      choices: [
        { text: "A junction table lets the database check both references, prevents duplicate pairings, and gives the pairing its own facts like term and grade", correct: true, feedback: "Correct — all four wins in one design." },
        { text: "Both work; the comma column is just old-fashioned", correct: false, feedback: "The comma column is not a style choice — it breaks integrity, performance and the data itself (no home for grades)." },
        { text: "Junctions are only needed when there are more than two tables", correct: false, feedback: "Junctions exist precisely for TWO tables with many on both sides." },
      ],
    },
    {
      id: "a-i4",
      tier: "intermediate",
      mode: "concept",
      title: "The orphan the database refused",
      prompt: "In the banking database, someone tries to insert a transaction row for account_id 999 — but no account 999 exists. The insert fails with a foreign-key violation. A colleague says: 'Annoying! We should remove that constraint so data entry never blocks.' What is the strongest correct response?",
      dataset: "banking",
      sampleTables: ["transactions", "accounts"],
      hint: "What would the table full of transactions be worth if any of them could point at nothing?",
      concepts: ["referential integrity", "foreign keys", "data quality"],
      explanation: "The refusal is not an obstacle to good data — it is the definition of good data. A transaction that references no account cannot appear in any customer's statement, any branch total or any audit: it is money movement that belongs to nobody. Removing the constraint converts every future mistake from a one-second readable error into silent data rot discovered months later. The right fix is always to repair the input (use a real account id, or create the account first), never to remove the guarantee.",
      choices: [
        { text: "The constraint is protecting the ledger: an unfixable reference is exactly the data rot the database exists to prevent", correct: true, feedback: "Correct — reject-at-the-door beats months of silent corruption." },
        { text: "Agree — constraints should only apply during business hours", correct: false, feedback: "Integrity is not a schedule-dependent courtesy; the bad row is just as bad at 2am." },
        { text: "Agree — the program can clean up orphans later", correct: false, feedback: "'Later' cleanup requires exactly the guarantees that were removed; in practice orphans are discovered by broken reports, not tidy scripts." },
      ],
    },

    /* -------------------------- advanced ---------------------------- */
    {
      id: "a-a1",
      tier: "advanced",
      mode: "concept",
      title: "Design the admissions table",
      prompt: "You are designing the hospital's admissions table from scratch. Each admission is one patient's stay, overseen by one doctor, in one department, with an admission timestamp, a discharge timestamp (null while the patient is still in), a room, a diagnosis and a bill total. Which set of columns correctly uses keys for every connection?",
      dataset: "hospital",
      sampleTables: ["admissions", "patients", "doctors", "departments"],
      hint: "Each connection should be a foreign key — an id referencing another table — never a copied name.",
      concepts: ["schema design", "foreign keys", "one-to-many"],
      explanation: "The correct design holds patient_id, doctor_id and dept_id as foreign keys referencing the patients, doctors and departments tables, plus the admission's own facts (timestamps, room, diagnosis, bill). Copying names instead of ids would reintroduce redundancy: two spellings of the same doctor, a department renamed in some rows but not others, a patient's age drifting with every admission. Each admission refers to exactly one patient, one doctor and one department — three one-to-many relationships, three FK columns, all three checked by the database.",
      choices: [
        { text: "patient_id, doctor_id, dept_id as foreign keys, plus admitted_at, discharged_at, room, diagnosis, bill_total", correct: true, feedback: "Correct — connections by key, facts about the stay on the row itself." },
        { text: "patient_name, doctor_name, dept_name copied onto each admission row, so reports are faster to write", correct: false, feedback: "Copied names are redundancy: every rename and typo drifts independently — the update anomaly from lesson a-08." },
        { text: "Only patient_id; the doctor and department can be derived from the patient's history", correct: false, feedback: "A patient is treated by different doctors in different departments across visits — the admission, not the patient, owns those facts." },
      ],
    },
    {
      id: "a-a2",
      tier: "advanced",
      mode: "concept",
      title: "Find the self-reference",
      prompt: "In the HeliosWorks employee database, the employees table has a manager_id column whose values are employee ids from the same table. Amara (employee 1, the CEO) has NULL there; everyone else names their manager. Which statement best describes this design?",
      dataset: "hr",
      sampleTables: ["employees"],
      hint: "Who is on each end of manager_id? Can both sides be the same table?",
      concepts: ["self-reference", "one-to-many", "org structure"],
      explanation: "manager_id is a foreign key from employees to employees — a self-referencing one-to-many relationship: one manager has many reports (all rows naming them), and each employee has at most one manager (the single value in their row, NULL for the CEO, who reports to nobody). This elegant trick stores an entire reporting tree of any depth in one table. When you reach recursive CTEs in Part G, you will walk this exact tree from the CEO down to every level — and with joins, list every employee beside their manager's name.",
      choices: [
        { text: "A self-referencing 1:N: manager_id points at another row of the same employees table", correct: true, feedback: "Correct — one table, one FK, an org chart of unlimited depth." },
        { text: "An M:N relationship missing its junction table", correct: false, feedback: "Each employee names exactly ONE manager — many is only on the reports side, so 1:N fits without a junction." },
        { text: "A mistake: a foreign key may only point at a different table", correct: false, feedback: "PostgreSQL happily enforces self-references; the values are still checked against real rows of the referenced table." },
      ],
    },
    {
      id: "a-a3",
      tier: "advanced",
      mode: "concept",
      title: "Diagnose the flat design",
      prompt: "A startup stores its whole operation in one wide table, orders_flat: each row has order id, order date, status, total, plus customer name, customer email, customer city, product name, product price and product category. The same customer appears on many rows; the same product appears on many rows. Which problem list is MOST accurate and complete?",
      dataset: "ecommerce",
      sampleTables: ["orders", "order_items", "customers", "products"],
      hint: "Think about what happens when a customer's email changes, when a product is renamed, and whether order 501's total can even be stored once.",
      concepts: ["normalization", "redundancy", "update anomalies", "design"],
      explanation: "The flat design repeats customer facts on every order and product facts on every line, so any change (a customer changes email, a product is renamed, a category is reorganized) must be applied consistently across uncounted rows — and never is, producing update anomalies. Worse, one row per order cannot hold multi-product orders without repeating the order header per item (total stored many times, drifting per row) or cramming products into one column (unqueryable). The relational answer is the design you have studied: customers, products, orders and order_items as separate tables, connected by primary and foreign keys, each fact stored exactly once. Part J turns this instinct into a formal discipline called normalization.",
      choices: [
        { text: "Redundant customer and product facts invite update anomalies; multi-product orders force the order header to repeat per item, so even the total is stored many times", correct: true, feedback: "Correct — both failure layers: repeated facts across rows, and repeated headers within an order." },
        { text: "No problems: one table is simpler and SQL can query it directly", correct: false, feedback: "Simpler to SELECT from, perhaps — but the data inside is already contradicting itself." },
        { text: "The only problem is that the table needs more columns", correct: false, feedback: "Widening a flat table deepens the redundancy; the cure is splitting by thing, not adding more repeated facts." },
      ],
    },
    {
      id: "a-a4",
      tier: "advanced",
      mode: "concept",
      title: "Relationship census",
      prompt: "Consider three pairs from the HeliosWorks employee database. (1) Employees and departments: each employee works in exactly one department, and a department employs many people. (2) Employees and projects: an employee staffs many projects, and a project has many employees. (3) A fact check: the role (lead, contributor, reviewer) and allocation percentage live on the employee_projects row itself. Which classification is correct?",
      dataset: "hr",
      sampleTables: ["departments", "employee_projects"],
      hint: "For each pair, ask 'how many?' both ways. For (3), ask where the role lives.",
      concepts: ["relationships", "classification", "junction tables"],
      explanation: "(1) is one-to-many — employees.dept_id is the FK on the many side, since a department has many employees but each belongs to one. (2) is many-to-many, resolved by the employee_projects junction, which also carries each pairing's role and allocation percentage. (3) is neither: role and allocation are attributes of the junction row — facts about the pairing, stored on it, exactly like a grade lives on a university enrollment row. Telling relationships (1, 2) apart from column placement (3) is exactly the design judgment this part has been building.",
      choices: [
        { text: "(1) one-to-many; (2) many-to-many via a junction; (3) columns on the junction row", correct: true, feedback: "Correct on all three — and the distinction between a relationship and a column is the skill." },
        { text: "(1) many-to-many; (2) one-to-many; (3) a foreign key to a roles table", correct: false, feedback: "(1) is one department per employee — 1:N; and a role is a value on the pairing, not a reference." },
        { text: "All three are many-to-many", correct: false, feedback: "Only (2) is — (1) has one on the employee side, and (3) is not a relationship at all but a stored fact." },
      ],
    },
  ],

  /* ------------------------------------------------------------------ */
  assessment: [
    {
      id: "a-as-1",
      prompt: "Which sentence best captures the difference between data and information?",
      options: [
        { text: "Data is numbers; information is text", correct: false, feedback: "Both can be either — a date is data, a written paragraph can be data too." },
        { text: "Data is the raw recorded fact; information is data arranged to answer a question", correct: true, feedback: "Correct — arrangement and purpose make the difference." },
        { text: "Information is data that has been printed", correct: false, feedback: "The medium is irrelevant; a screen can show either." },
      ],
      explanation: "Data is captured fact; information is fact arranged to answer a question. Databases hold data; queries produce information.",
    },
    {
      id: "a-as-2",
      prompt: "Which of these is NOT one of the four jobs a DBMS does that plain files cannot?",
      options: [
        { text: "Concurrency — coordinating many simultaneous readers and writers", correct: false, feedback: "That is a core DBMS job." },
        { text: "Durability — keeping saved data safe through crashes and power loss", correct: false, feedback: "Also a core DBMS job." },
        { text: "Graphic design — making data look attractive in presentations", correct: true, feedback: "Correct — presentation is a reporting-tool concern, not a DBMS guarantee." },
        { text: "Integrity — rejecting values that break declared rules", correct: false, feedback: "That is integrity, one of the four jobs." },
      ],
      explanation: "The four jobs are concurrency, integrity, durability and fast access. Making data look good belongs to reporting tools on top of the database.",
    },
    {
      id: "a-as-3",
      prompt: "The relational model connects tables how?",
      options: [
        { text: "Through physical pointers drawn between rows", correct: false, feedback: "The model deliberately avoids physical links." },
        { text: "Through shared column values that the database can check", correct: true, feedback: "Correct — matching values, declared as keys, are the connection." },
        { text: "Through file paths stored in a special column", correct: false, feedback: "Paths would be fragile, uncheckable and belong to the file world." },
      ],
      explanation: "Connection by shared value: an order row's customer_id means 'the customer whose primary key equals this value' — logical, checkable, robust.",
    },
    {
      id: "a-as-4",
      prompt: "In the ShopSphere order_items table, the primary key is (order_id, product_id). What is this kind of key called?",
      options: [
        { text: "A composite key", correct: true, feedback: "Correct — identity from the combination of two columns." },
        { text: "A surrogate key", correct: false, feedback: "A surrogate is a single meaningless number like item_id would be." },
        { text: "A natural key", correct: false, feedback: "Natural keys come from the real world (ISBN, country code); neither column alone is real-world identity here." },
      ],
      explanation: "When no single column identifies a row but a combination does, the key is composite — here, which order AND which product.",
    },
    {
      id: "a-as-5",
      prompt: "A declared foreign key on orders.customer_id guarantees all of the following EXCEPT:",
      options: [
        { text: "No order can be stored for a customer_id that does not exist", correct: false, feedback: "That is exactly what it guarantees — inserts are checked." },
        { text: "Two orders can never share the same customer_id", correct: true, feedback: "Correct — that would be a uniqueness rule; foreign keys permit many rows to reference the same target. That is what makes one-to-many work." },
        { text: "The referenced customer row cannot simply vanish while orders point at it", correct: false, feedback: "With the default rules, that delete is refused — referential integrity in the other direction." },
      ],
      explanation: "Foreign keys check that references resolve; they do NOT make the referencing values unique. Many orders pointing at one customer is the whole point of one-to-many.",
    },
    {
      id: "a-as-6",
      prompt: "Students take many courses; courses have many students. Where does this many-to-many relationship physically live in the university database?",
      options: [
        { text: "In a courses column on each student row", correct: false, feedback: "One column cannot hold many values cleanly — the spreadsheet habit." },
        { text: "In the enrollments table, whose rows are pairings of student and course", correct: true, feedback: "Correct — the junction table, carrying term and grade as its own facts." },
        { text: "In the students table's primary key", correct: false, feedback: "Primary keys identify rows; they do not express relationships to other tables." },
      ],
      explanation: "Many-to-many is implemented as a junction table: each enrollments row is one student-course-term pairing, with its own facts.",
    },
    {
      id: "a-as-7",
      prompt: "A product's price is stored on 400 order-item rows because each row records what was paid. Months later, the catalog price changes. Which statement is TRUE?",
      options: [
        { text: "The 400 rows must be updated — they are now wrong", correct: false, feedback: "They were never copies of the catalog price; they are records of what was actually paid at sale time." },
        { text: "Nothing is wrong: unit_price records the historical sale price; the catalog price lives once in products", correct: true, feedback: "Correct — two different facts, each stored in its right place exactly once." },
        { text: "This proves redundancy is unavoidable", correct: false, feedback: "It proves the opposite: two DIFFERENT facts need two columns — copying is what must be avoided." },
      ],
      explanation: "unit_price on an order item and price on a product are different facts: what was paid then, versus what it costs now. Good design stores each fact once in its own column — no anomaly, no update needed.",
    },
    {
      id: "a-as-8",
      prompt: "Which situation is the STRONGEST signal that a team should move from spreadsheets to a database?",
      options: [
        { text: "The sheet has more than 50 rows", correct: false, feedback: "Row count alone is a weak signal; a 500-row personal list is still a spreadsheet job." },
        { text: "Several people must edit the same data, it must obey rules, and it must outlive any one person's laptop", correct: true, feedback: "Correct — concurrency, integrity and durability: three of the four DBMS jobs at once." },
        { text: "The team wants colored charts", correct: false, feedback: "Charting is a presentation feature — spreadsheets and BI tools both do it." },
      ],
      explanation: "Shared editing, enforced rules and long life are exactly the DBMS jobs files cannot promise. That is the moment to move.",
    },
  ],

  /* ------------------------------------------------------------------ */
  project: {
    title: "Design a Community Library Database",
    brief:
      "Your town's volunteer library keeps everything in one spreadsheet — members, books, loans — and it is quietly falling apart: two spellings of the same member, loans pointing at books that were withdrawn, and no way to answer 'which books are overdue?' without an afternoon of filtering. You are the database designer. On paper (no SQL yet!), you will identify the things the library cares about, give each one a table with a sensible primary key, connect them with correctly placed foreign keys, and handle the many-to-many reality of members borrowing books over time. This is the same discipline every real database was born with — you are just doing it before you know the syntax, which is exactly how good designers work.",
    requirements: [
      "Identify at least four things that need their own table (member, book, loan, and one more you can justify — for example, a genre or author table)",
      "For every table, choose a primary key and justify it in one sentence (why unique, why never missing, why stable)",
      "Represent 'one member borrows many books over time' correctly, with the foreign key on the many side",
      "Handle the many-to-many between members and books with a junction table, and give the junction its own facts (borrowed date, returned date)",
      "State what the database should REFUSE: the loan rules your foreign keys enforce (no loan without a member; no loan without a book)",
      "List three business questions your design can now answer that the spreadsheet could not answer reliably",
    ],
    steps: [
      "List every kind of thing the library tracks. Watch for things hiding inside columns of the spreadsheet (authors! genres!) — each distinct kind of thing is a candidate table.",
      "For each table, write its columns. Ask of every column: is this a fact about THIS thing, or a fact about something else that belongs on that thing's table?",
      "Choose a primary key per table. Prefer surrogate ids; if you pick a natural key (say, ISBN for books), note the risk you are accepting.",
      "Draw the relationships: member-to-loan, book-to-loan, and any others. Label each 1:1, 1:N or M:N, and say where each foreign key lives.",
      "Design the loan junction row exactly: which columns make it unique, and which facts (borrowed date, returned date) live on it rather than on member or book?",
      "Write the refusal list: which inserts or deletes should the database reject, and which key makes each rejection possible?",
      "Test your design against three questions: 'which books are overdue?', 'which member borrows the most?', 'which books has this member still not returned?' — can each be answered by following keys?",
      "Compare your design with the university database's enrollments pattern from lesson a-07 — members borrowing books over time is structurally the same problem as students taking courses across terms.",
    ],
    starter: `-- Community Library Database — paper design (Part A mini project)
-- No SQL to run yet: fill in this design document with your decisions.
--
-- TABLES (things the library cares about):
--   1. members   — one row = ???      primary key = ???
--   2. books     — one row = ???      primary key = ???
--   3. ???       — one row = ???      primary key = ???
--   4. ???       — one row = ???      primary key = ???
--
-- RELATIONSHIPS (label 1:1, 1:N or M:N; say where the FK lives):
--   members  --- ??? --- books
--   (which junction table carries the pairing? what facts live on it?)
--
-- REFUSALS (what the database should reject, and why):
--   - no loan without a ???   (enforced by ???)
--   - no ??? without a ???    (enforced by ???)
--
-- QUESTIONS MY DESIGN ANSWERS THAT THE SPREADSHEET COULD NOT:
--   1. ???
--   2. ???
--   3. ???`,
    concepts: ["entities", "primary keys", "foreign keys", "relationships", "junction tables", "integrity"],
    extension:
      "The library adds a rule: a member may hold at most five books at once. Where would that rule live — a key, a column, or something you check at loan time? Sketch your answer; Part D's constraints lesson will show you the tool PostgreSQL gives you for exactly this (a CHECK constraint), and Part J returns to it in depth.",
  },
};
