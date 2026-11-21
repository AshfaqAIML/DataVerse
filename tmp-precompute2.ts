/* Temporary: multi-statement exec tests. Delete after use. */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

function cell(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof Date) return v.toISOString().replace("T", " ").replace("Z", "");
  return String(v);
}

async function runMulti(ds: string | null, label: string, sql: string) {
  const db = new PGlite();
  await db.exec("SELECT 1");
  if (ds) await db.exec(readFileSync(`public/sql-lab/datasets/${ds}.sql`, "utf8"));
  try {
    const results = await db.exec(sql);
    const last = results[results.length - 1];
    console.log(`\n### ${label} [${ds ?? "scratch"}] cmd=${(last as any).command ?? "?"}`);
    const cols = (last as any).fields.map((f: any) => f.name);
    console.log(cols.join(" | "));
    for (const r of (last as any).rows) console.log(cols.map((c: string) => cell((r as any)[c])).join(" | "));
  } catch (e: any) {
    console.log(`\n### ${label} [${ds ?? "scratch"}] ERROR: ${String(e?.message ?? e)}`);
  }
}

async function main() {
  await runMulti("banking", "ex-db4", `CREATE TABLE guestbook_entries (entry_id int PRIMARY KEY, guest text NOT NULL, message text NOT NULL, mood text NOT NULL DEFAULT 'happy', posted date NOT NULL);
INSERT INTO guestbook_entries (entry_id, guest, message, posted) VALUES (1, 'Ana Petrov', 'First!', DATE '2026-11-01'), (2, 'Ben Okafor', 'Hello world', DATE '2026-11-02');
SELECT entry_id, guest, mood FROM guestbook_entries ORDER BY entry_id`);

  await runMulti("university", "ex-di4", `CREATE TABLE support_tickets (ticket_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, summary text NOT NULL, opened date NOT NULL);
INSERT INTO support_tickets (summary, opened) VALUES ('login broken', DATE '2026-11-02'), ('billing question', DATE '2026-11-04'), ('refund request', DATE '2026-11-09') RETURNING ticket_id, summary;
SELECT ticket_id, summary, opened FROM support_tickets ORDER BY ticket_id`);

  await runMulti("ecommerce", "ex-da1", `CREATE TABLE mixtapes (mixtape_id int PRIMARY KEY, title text NOT NULL);
CREATE TABLE mixtape_songs (song_id int PRIMARY KEY, mixtape_id int NOT NULL REFERENCES mixtapes(mixtape_id) ON DELETE CASCADE, title text NOT NULL);
INSERT INTO mixtapes (mixtape_id, title) VALUES (1, 'Morning Run'), (2, 'Late Night');
INSERT INTO mixtape_songs (song_id, mixtape_id, title) VALUES (1, 1, 'Fast Start'), (2, 1, 'Hill Sprint'), (3, 2, 'Slow Jam'), (4, 2, 'Wind Down');
DELETE FROM mixtapes WHERE mixtape_id = 1;
SELECT song_id, mixtape_id, title FROM mixtape_songs ORDER BY song_id`);

  await runMulti("retail", "ex-da3", `CREATE TABLE import_prices (product_id int PRIMARY KEY, price numeric(10,2) NOT NULL);
INSERT INTO import_prices (product_id, price) VALUES (1, 199.00), (2, -49.00), (3, 89.00), (4, -9.99), (5, 59.00);
DELETE FROM import_prices WHERE price < 0 RETURNING product_id, price;
ALTER TABLE import_prices ADD CONSTRAINT prices_nonnegative CHECK (price >= 0);
SELECT product_id, price FROM import_prices ORDER BY product_id`);

  await runMulti("ecommerce", "ex-da4", `UPDATE products SET price = round(price * 0.95, 2) WHERE category = 'Gaming' RETURNING product_id, name, price;
UPDATE products SET price = price + 2.00 WHERE product_id = 24 RETURNING product_id, name, price;
SELECT product_id, name, price FROM products WHERE product_id IN (17, 18, 19, 24) ORDER BY product_id`);

  await runMulti(null, "lab-d01", `CREATE TABLE team_tasks (
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

  await runMulti(null, "lab-d02", `CREATE TABLE temp_signups (
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

  await runMulti(null, "lab-d06", `CREATE TABLE waitlist (
  position_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person      text NOT NULL,
  added       date NOT NULL
);
INSERT INTO waitlist (person, added) VALUES ('Ana Petrov', DATE '2026-11-01') RETURNING position_id, person;
INSERT INTO waitlist (person, added) VALUES ('Ben Okafor', DATE '2026-11-02') RETURNING position_id, person;
DELETE FROM waitlist WHERE person = 'Ana Petrov';
INSERT INTO waitlist (person, added) VALUES ('Cleo Fontaine', DATE '2026-11-03') RETURNING position_id, person;
SELECT position_id, person FROM waitlist ORDER BY position_id`);

  await runMulti(null, "lab-d07-alter", `ALTER TABLE legacy_contacts ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE legacy_contacts ADD CONSTRAINT legacy_email_unique UNIQUE (email);
ALTER TABLE legacy_contacts ADD CONSTRAINT legacy_value_nonneg CHECK (lifetime_value >= 0);
SELECT contact_id, full_name, email, status, lifetime_value FROM legacy_contacts ORDER BY contact_id`);

  // reorder variant check
  const db = new PGlite();
  await db.exec("SELECT 1");
  await db.exec(readFileSync(`public/sql-lab/datasets/retail.sql`, "utf8"));
  const res = await db.query(`SELECT store_id, count(*) FILTER (WHERE on_hand <= reorder_level) AS at_or_below
FROM inventory GROUP BY store_id ORDER BY store_id`);
  console.log("\n### reorder-variant [retail]");
  for (const r of res.rows as any[]) console.log(r.store_id, "|", r.at_or_below);

  // d-04 bigint block
  await runMulti(null, "d04-bigint", `CREATE TABLE big_values_big (val bigint);
INSERT INTO big_values_big (val) VALUES (3000000000);
SELECT val FROM big_values_big`);

  // d-04 notes select
  await runMulti(null, "d04-notes", `CREATE TABLE notes (subject varchar(10) NOT NULL, body text NOT NULL);
INSERT INTO notes (subject, body) VALUES ('week 3', 'The toast landed butter-side down twice, the bike got a flat, and the database class was cancelled.');
SELECT subject, char_length(body) AS body_chars FROM notes`);

  // d-01 full lesson sequence
  await runMulti(null, "d01-lesson", `CREATE TABLE sale_items (
  item_id  int PRIMARY KEY,
  name     text NOT NULL,
  price    numeric(10,2) NOT NULL CHECK (price > 0),
  discount numeric(4,2) NOT NULL DEFAULT 0.00,
  stock    int NOT NULL
);
INSERT INTO sale_items (item_id, name, price, discount, stock) VALUES
  (1, 'Trail Sneakers',   129.00, 0.00, 12),
  (2, 'Insulated Bottle',  24.50, 0.00, 64),
  (3, 'Wool Beanie',       18.00, 0.00, 75),
  (4, 'LED Headlamp',      34.90, 0.00, 30),
  (5, 'Camp Stool',        27.50, 0.00, 90),
  (6, 'Dry Bag 10L',       19.90, 0.00, 8);
SELECT item_id, name, price, discount, stock FROM sale_items ORDER BY item_id;
UPDATE sale_items SET price = 149.00 WHERE item_id = 1 RETURNING item_id, name, price;
UPDATE sale_items SET discount = 0.10, price = price * 0.90 WHERE stock > 50 RETURNING item_id, price, discount;
UPDATE sale_items SET discount = 0.50 RETURNING item_id, name, discount;
UPDATE sale_items SET discount = 0.00 RETURNING item_id, discount;
UPDATE sale_items SET price = 0.01 WHERE item_id = 999;
SELECT item_id, name, price, discount, stock FROM sale_items ORDER BY item_id`);

  // d-02 lesson sequence
  await runMulti(null, "d02-lesson", `CREATE TABLE cart_items (
  cart_id   int PRIMARY KEY,
  shopper   text NOT NULL,
  product   text NOT NULL,
  added_at  date NOT NULL,
  quantity  int NOT NULL CHECK (quantity > 0)
);
INSERT INTO cart_items (cart_id, shopper, product, added_at, quantity) VALUES
  (1, 'Amelia', 'Insulated Bottle', DATE '2026-11-12', 2),
  (2, 'Marcus', 'Wool Beanie',      DATE '2026-11-10', 1),
  (3, 'Priya',  'LED Headlamp',     DATE '2026-10-02', 1),
  (4, 'Diego',  'Camp Stool',       DATE '2026-09-18', 2),
  (5, 'Hannah', 'Dry Bag 10L',      DATE '2026-11-11', 3),
  (6, 'Tom',    'Trail Sneakers',   DATE '2026-08-30', 1),
  (7, 'Sofia',  'Insulated Bottle', DATE '2026-11-13', 1),
  (8, 'Liam',   'Wool Beanie',      DATE '2026-10-21', 2);
SELECT cart_id, shopper, product, added_at, quantity FROM cart_items ORDER BY cart_id;
SELECT cart_id, shopper, product, added_at FROM cart_items WHERE added_at < DATE '2026-11-01' ORDER BY cart_id;
DELETE FROM cart_items WHERE added_at < DATE '2026-11-01' RETURNING cart_id, shopper, product;
SELECT cart_id, shopper, product, added_at FROM cart_items ORDER BY cart_id;
DELETE FROM cart_items;
SELECT count(*) AS rows_left FROM cart_items;
INSERT INTO cart_items (cart_id, shopper, product, added_at, quantity) VALUES
  (9,  'Nina', 'Wool Beanie',      DATE '2026-11-14', 1),
  (10, 'Owen', 'Insulated Bottle', DATE '2026-11-14', 2),
  (11, 'Paula','Camp Stool',       DATE '2026-11-15', 1);
TRUNCATE TABLE cart_items;
SELECT count(*) AS rows_left FROM cart_items;
DELETE FROM cart_items WHERE shopper = 'nobody'`);

  // d-03 lesson sequence
  await runMulti(null, "d03-lesson", `CREATE TABLE clubs (
  club_id int PRIMARY KEY,
  name    text NOT NULL UNIQUE,
  email   text NOT NULL UNIQUE,
  dues    numeric(6,2) NOT NULL CHECK (dues >= 0)
);
CREATE TABLE club_members (
  member_id int PRIMARY KEY,
  club_id   int NOT NULL REFERENCES clubs(club_id),
  member_name text NOT NULL,
  joined     date NOT NULL
);
INSERT INTO clubs (club_id, name, email, dues) VALUES
  (1, 'Trail Runners', 'run@example.com', 15.00),
  (2, 'Photo Walks', 'photo@example.com', 0.00),
  (3, 'Chess Circle', 'chess@example.com', 5.00);
INSERT INTO club_members (member_id, club_id, member_name, joined) VALUES
  (1, 1, 'Ana Petrov', DATE '2026-02-01'),
  (2, 1, 'Ben Okafor', DATE '2026-02-10'),
  (3, 2, 'Cleo Fontaine', DATE '2026-03-05'),
  (4, 3, 'Dmitri Volkov', DATE '2026-03-18');
SELECT club_id, name, email, dues FROM clubs ORDER BY club_id;
DROP TABLE club_members;
CREATE TABLE club_members (
  member_id int PRIMARY KEY,
  club_id   int NOT NULL REFERENCES clubs(club_id) ON DELETE CASCADE,
  member_name text NOT NULL,
  joined     date NOT NULL
);
INSERT INTO club_members (member_id, club_id, member_name, joined) VALUES
  (1, 1, 'Ana Petrov', DATE '2026-02-01'),
  (2, 1, 'Ben Okafor', DATE '2026-02-10'),
  (3, 2, 'Cleo Fontaine', DATE '2026-03-05'),
  (4, 3, 'Dmitri Volkov', DATE '2026-03-18');
SELECT member_id, club_id, member_name FROM club_members ORDER BY member_id;
DELETE FROM clubs WHERE club_id = 1;
SELECT member_id, club_id, member_name FROM club_members ORDER BY member_id`);

  // d-06 lesson sequence
  await runMulti(null, "d06-lesson", `CREATE TABLE hand_numbered (id int PRIMARY KEY, label text NOT NULL);
INSERT INTO hand_numbered (id, label) VALUES (1, 'first clerk row');
CREATE TABLE signups (
  signup_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person    text NOT NULL,
  logged    date NOT NULL
);
INSERT INTO signups (person, logged) VALUES ('Ana Petrov', DATE '2026-11-02') RETURNING signup_id, person;
INSERT INTO signups (person, logged) VALUES
  ('Ben Okafor', DATE '2026-11-02'),
  ('Cleo Fontaine', DATE '2026-11-03') RETURNING signup_id, person;
INSERT INTO signups (signup_id, person, logged) OVERRIDING SYSTEM VALUE VALUES (99, 'Backfill Row', DATE '2026-11-03');
DELETE FROM signups WHERE signup_id = 2;
INSERT INTO signups (person, logged) VALUES ('Elena Vik', DATE '2026-11-05') RETURNING signup_id, person;
SELECT signup_id, person, logged FROM signups ORDER BY signup_id`);
}

main();
