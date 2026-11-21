-- ============================================================================
-- SHOPSPHERE — E-COMMERCE SAMPLE DATABASE
-- A mid-sized online store. Customers browse products grouped into
-- categories, place orders made of line items, pay (one payment per order)
-- and leave reviews. All money is numeric(10,2); every price/timestamp is
-- realistic. Designed edge cases:
--   * customers with no orders at all (LEFT JOIN lessons)
--   * one payment per order, some orders not yet paid (pending)
--   * products with no reviews, reviews with duplicate stars (DISTINCT, ties)
--   * two products sharing the same price (ORDER BY tie-breaking)
--   * cancelled orders that must be excluded from revenue exercises
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE categories (
  category_id  INT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT
);

INSERT INTO categories (category_id, name, description) VALUES
  (1, 'Laptops',      'Notebooks and desktop replacements'),
  (2, 'Audio',        'Headphones, earbuds and speakers'),
  (3, 'Wearables',    'Smart watches and fitness trackers'),
  (4, 'Photography',  'Cameras, lenses and accessories'),
  (5, 'Gaming',       'Consoles, controllers and accessories'),
  (6, 'Tablets',      'Slates and e-readers'),
  (7, 'Accessories',  'Bags, cables, stands and chargers'),
  (8, 'Smart Home',   'Lights, plugs, cameras and hubs');

CREATE TABLE customers (
  customer_id  INT PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL,
  signup_date  DATE NOT NULL,
  phone        TEXT
);

INSERT INTO customers (customer_id, first_name, last_name, email, city, state, signup_date, phone) VALUES
  ( 1, 'Amelia',   'Watson',    'amelia.watson@example.com',   'Portland',    'OR', '2024-01-12', '+1-503-555-0142'),
  ( 2, 'Marcus',   'Chen',      'marcus.chen@example.com',     'Seattle',     'WA', '2024-02-03', '+1-206-555-0198'),
  ( 3, 'Priya',    'Sharma',    'priya.sharma@example.com',    'Austin',      'TX', '2024-02-17', NULL),
  ( 4, 'Diego',    'Alvarez',  'diego.alvarez@example.com',   'Miami',       'FL', '2024-03-05', '+1-305-555-0177'),
  ( 5, 'Hannah',   'Kowalski', 'hannah.k@example.com',        'Chicago',     'IL', '2024-03-22', '+1-312-555-0110'),
  ( 6, 'Tom',      'Fletcher', 'tom.fletcher@example.com',    'Denver',      'CO', '2024-04-09', '+1-720-555-0166'),
  ( 7, 'Sofia',    'Rossi',    'sofia.rossi@example.com',     'Boston',      'MA', '2024-05-11', NULL),
  ( 8, 'Liam',     'O''Brien', 'liam.obrien@example.com',     'Dublin',      'CA', '2024-05-30', '+1-925-555-0133'),
  ( 9, 'Nina',     'Patel',    'nina.patel@example.com',      'Jersey City', 'NJ', '2024-06-14', '+1-201-555-0189'),
  (10, 'Owen',     'Davis',    'owen.davis@example.com',      'Portland',    'OR', '2024-07-02', '+1-503-555-0125'),
  (11, 'Grace',    'Kim',      'grace.kim@example.com',       'Seattle',     'WA', '2024-08-19', '+1-206-555-0154'),
  (12, 'Victor',   'Nguyen',   'victor.nguyen@example.com',   'Houston',     'TX', '2024-09-08', NULL),
  (13, 'Elena',    'Petrova',  'elena.petrova@example.com',   'Chicago',     'IL', '2024-09-27', '+1-312-555-0171'),
  (14, 'James',    'Whitfield','james.whitfield@example.com', 'Atlanta',     'GA', '2024-10-15', '+1-404-555-0102'),
  (15, 'Ayesha',   'Khan',     'ayesha.khan@example.com',     'Austin',      'TX', '2024-11-04', '+1-512-555-0148'),
  (16, 'Noah',     'Berger',   'noah.berger@example.com',     'Denver',      'CO', '2025-01-21', '+1-720-555-0190'),
  (17, 'Lucia',    'Moreno',   'lucia.moreno@example.com',    'Miami',       'FL', '2025-02-14', NULL),
  (18, 'Ethan',    'Brooks',   'ethan.brooks@example.com',    'Boston',      'MA', '2025-03-30', '+1-617-555-0119'),
  (19, 'Mina',     'Tanaka',   'mina.tanaka@example.com',     'Seattle',     'WA', '2025-05-06', '+1-206-555-0183'),
  (20, 'Carl',     'Jensen',   'carl.jensen@example.com',     'Portland',    'OR', '2025-07-18', '+1-503-555-0176');

CREATE TABLE products (
  product_id   INT PRIMARY KEY,
  category_id  INT NOT NULL REFERENCES categories(category_id),
  name         TEXT NOT NULL,
  brand        TEXT NOT NULL,
  price        NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock        INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating       NUMERIC(2,1) CHECK (rating BETWEEN 1.0 AND 5.0),
  launched     DATE NOT NULL
);

INSERT INTO products (product_id, category_id, name, brand, price, stock, rating, launched) VALUES
  ( 1, 1, 'AeroBook 14 Laptop',        'Aeronix',    1299.00, 14, 4.6, '2025-02-10'),
  ( 2, 1, 'AeroBook 16 Pro Laptop',    'Aeronix',    2199.00,  6, 4.8, '2025-09-01'),
  ( 3, 1, 'WorkMate 15 Business',      'ClearLane',   899.00, 22, 4.1, '2024-06-15'),
  ( 4, 1, 'StudioBook X Creator',      'Vantura',    2499.00,  3, 4.9, '2025-11-02'),
  ( 5, 1, 'BudgetBook 11 Everyday',    'ClearLane',   399.00, 55, 3.7, '2024-03-20'),
  ( 6, 2, 'SoundCore ANC Headphones',  'Auralux',     249.00, 48, 4.5, '2024-10-05'),
  ( 7, 2, 'SoundCore Lite Earbuds',    'Auralux',     129.00, 80, 4.2, '2025-04-18'),
  ( 8, 2, 'BassStation Mini Speaker',  'Boomwerk',     89.00, 35, 4.0, '2024-08-22'),
  ( 9, 2, 'StudioMic Pro USB',         'Auralux',     179.00, 18, 4.4, '2025-01-27'),
  (10, 2, 'WaveRider Waterproof Buds', 'Boomwerk',    129.00, 25, NULL, '2025-10-12'),
  (11, 3, 'PulseFit 5 Smartwatch',     'Pulseon',     329.00, 30, 4.3, '2025-03-08'),
  (12, 3, 'PulseFit SE Tracker',       'Pulseon',      99.00, 60, 4.0, '2024-05-30'),
  (13, 3, 'Altitude GPS Watch',        'Trailmark',   449.00, 12, 4.7, '2025-07-19'),
  (14, 4, 'Zenith X20 Mirrorless',     'Optiq',      1499.00,  9, 4.8, '2025-06-04'),
  (15, 4, 'Optiq 50mm Prime Lens',     'Optiq',       299.00, 20, 4.6, '2024-11-11'),
  (16, 4, 'TravelPod Tripod Kit',      'Optiq',        79.00, 42, 4.1, '2024-04-26'),
  (17, 5, 'GameStation 5 Console',     'PlayWorks',   549.00, 15, 4.9, '2024-09-15'),
  (18, 5, 'ProPad Elite Controller',   'PlayWorks',    69.00, 70, 4.3, '2025-02-21'),
  (19, 5, 'RacingWheel GT Set',        'PlayWorks',   299.00,  8, 4.2, '2025-08-09'),
  (20, 6, 'TabSlate 11 Tablet',        'Vantura',     649.00, 17, 4.4, '2025-05-16'),
  (21, 6, 'InkReader 7 E-ink',         'Pagefold',    189.00, 28, 4.5, '2024-12-01'),
  (22, 7, 'ChargeHub 100W GaN',        'Voltcraft',    59.00, 90, 4.6, '2025-01-09'),
  (23, 7, 'TrailBack 25L Backpack',    'Trailmark',    79.00, 44, 4.5, '2024-07-23'),
  (24, 7, 'FlexStand Aluminum Dock',   'Voltcraft',    49.00, 36, 3.9, '2024-10-30'),
  (25, 8, 'HomeEye Indoor Camera',     'Nestara',      89.00, 33, 4.1, '2025-04-02'),
  (26, 8, 'SmartPlug 4-Pack',          'Nestara',      39.00,120, 4.4, '2024-06-08'),
  (27, 8, 'Guardian Hub v2',           'Nestara',     149.00, 11, 3.8, '2025-09-25'),
  (28, 8, 'MoodLight Strip 5m',        'Lumeno',       29.00, 75, 4.2, '2025-08-30');

CREATE TABLE orders (
  order_id    INT PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  order_date  TIMESTAMP NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total       NUMERIC(10,2) NOT NULL CHECK (total >= 0)
);

-- NOTE: customers 17 and 19 signed up but never placed an order (a
-- deliberate LEFT JOIN teaching case). Order ids are not contiguous,
-- exactly like in a real store where cancelled carts skip numbers.
INSERT INTO orders (order_id, customer_id, order_date, status, total) VALUES
  ( 1,  1, '2024-03-01 10:15', 'delivered', 1407.00),
  ( 2,  2, '2024-03-04 16:40', 'delivered',  378.00),
  ( 3,  3, '2024-03-18 09:05', 'delivered',  249.00),
  ( 4,  4, '2024-04-02 21:30', 'cancelled',  549.00),
  ( 5,  1, '2024-04-20 14:25', 'delivered',  129.00),
  ( 6,  5, '2024-05-11 08:50', 'delivered',  948.00),
  ( 7,  6, '2024-05-29 19:10', 'delivered',   89.00),
  ( 8,  7, '2024-06-15 12:00', 'delivered',  249.00),
  ( 9,  8, '2024-07-01 17:45', 'delivered',  718.00),
  (10,  2, '2024-07-22 11:20', 'delivered', 1499.00),
  (11,  9, '2024-08-09 15:35', 'delivered',  189.00),
  (12, 10, '2024-08-25 10:05', 'delivered',  549.00),
  (13,  3, '2024-09-12 13:50', 'delivered',  329.00),
  (14, 11, '2024-09-28 09:40', 'delivered',  718.00),
  (15,  4, '2024-10-14 18:15', 'delivered',   79.00),
  (16, 12, '2024-11-02 20:30', 'delivered',  618.00),
  (17,  5, '2024-11-20 16:55', 'delivered',   99.00),
  (18, 13, '2024-12-08 08:20', 'delivered',  978.00),
  (19,  1, '2025-01-05 14:10', 'delivered',   59.00),
  (20, 14, '2025-01-19 11:35', 'delivered',  249.00),
  (21,  6, '2025-02-02 09:25', 'delivered', 2348.00),
  (22, 15, '2025-02-17 15:00', 'delivered',  189.00),
  (23,  9, '2025-03-05 10:45', 'delivered',  129.00),
  (24, 16, '2025-03-21 17:20', 'cancelled',  449.00),
  (25,  7, '2025-04-26 19:40', 'delivered', 1499.00),
  (27,  2, '2025-05-14 08:30', 'delivered',   59.00),
  (28, 18, '2025-06-01 12:15', 'delivered',  329.00),
  (29, 10, '2025-06-19 16:50', 'delivered', 1798.00),
  (31, 13, '2025-07-25 14:35', 'delivered',   99.00),
  (32, 20, '2025-08-12 21:00', 'delivered',   29.00),
  (33, 15, '2025-08-30 09:55', 'delivered',  128.00),
  (34, 11, '2025-09-17 18:25', 'delivered',  179.00),
  (36,  4, '2025-10-21 15:45', 'shipped',    129.00),
  (37,  6, '2025-11-05 08:05', 'shipped',     98.00),
  (38,  9, '2025-11-12 13:30', 'paid',       649.00),
  (39,  3, '2026-01-08 10:50', 'delivered',   89.00),
  (40, 12, '2026-02-14 12:20', 'delivered', 2199.00),
  (41,  1, '2026-03-02 17:15', 'delivered',   49.00),
  (42, 18, '2026-04-18 09:00', 'cancelled',  449.00),
  (43, 14, '2026-05-27 14:40', 'delivered', 1798.00),
  (45,  5, '2026-07-21 11:30', 'delivered',  129.00),
  (46, 20, '2026-08-14 16:05', 'delivered',   29.00),
  (47,  7, '2026-09-02 10:35', 'shipped',    549.00),
  (48, 11, '2026-10-19 15:20', 'paid',      2499.00),
  (49,  2, '2026-11-01 08:45', 'pending',   189.00),
  (50, 15, '2026-11-10 13:10', 'pending',    99.00);

CREATE TABLE order_items (
  order_id   INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(product_id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

-- Every order total equals the sum of its line items
-- (quantity * unit_price) — the case study double-checks this.
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ( 1,  1, 1, 1299.00), ( 1, 22, 1,   59.00), ( 1, 24, 1,   49.00),
  ( 2,  6, 1,  249.00), ( 2,  7, 1,   129.00),
  ( 3,  6, 1,  249.00),
  ( 4, 17, 1,  549.00),
  ( 5,  7, 1,  129.00),
  ( 6,  3, 1,  899.00), ( 6, 24, 1,   49.00),
  ( 7,  8, 1,    89.00),
  ( 8,  6, 1,  249.00),
  ( 9, 20, 1,  649.00), ( 9, 18, 1,   69.00),
  (10, 14, 1, 1499.00),
  (11, 21, 1,  189.00),
  (12, 17, 1,  549.00),
  (13, 11, 1,  329.00),
  (14, 20, 1,  649.00), (14, 18, 1,   69.00),
  (15, 23, 1,    79.00),
  (16, 17, 1,  549.00), (16, 18, 1,   69.00),
  (17, 12, 1,    99.00),
  (18,  3, 1,  899.00), (18, 16, 1,   79.00),
  (19, 22, 1,    59.00),
  (20,  6, 1,  249.00),
  (21,  2, 1, 2199.00), (21, 27, 1,  149.00),
  (22, 21, 1,  189.00),
  (23, 10, 1,  129.00),
  (24, 13, 1,  449.00),
  (25, 14, 1, 1499.00),
  (27, 22, 1,    59.00),
  (28, 11, 1,  329.00),
  (29, 14, 1, 1499.00), (29, 15, 1,  299.00),
  (31, 12, 1,    99.00),
  (32, 28, 1,    29.00),
  (33,  7, 1,  128.00),
  (34,  9, 1,   179.00),
  (36, 10, 1,   129.00),
  (37, 26, 1,    39.00), (37, 22, 1,   59.00),
  (38, 20, 1,   649.00),
  (39, 25, 1,    89.00),
  (40,  2, 1, 2199.00),
  (41, 24, 1,    49.00),
  (42, 13, 1,   449.00),
  (43, 14, 1, 1499.00), (43, 15, 1,  299.00),
  (45,  7, 1,   129.00),
  (46, 28, 1,    29.00),
  (47, 17, 1,   549.00),
  (48,  4, 1,  2499.00),
  (49, 21, 1,   189.00),
  (50, 12, 1,    99.00);

-- One payment per order (UNIQUE order_id), only for orders that reached
-- payment — pending and cancelled orders have no payment row.
CREATE TABLE payments (
  payment_id INT PRIMARY KEY,
  order_id   INT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
  method     TEXT NOT NULL CHECK (method IN ('card','paypal','bank_transfer','apple_pay')),
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  paid_at    TIMESTAMP NOT NULL
);

INSERT INTO payments (payment_id, order_id, method, amount, paid_at) VALUES
  ( 1,  1, 'card',          1407.00, '2024-03-01 10:17'),
  ( 2,  2, 'paypal',         378.00, '2024-03-04 16:41'),
  ( 3,  3, 'card',           249.00, '2024-03-18 09:06'),
  ( 4,  5, 'apple_pay',      129.00, '2024-04-20 14:26'),
  ( 5,  6, 'card',           948.00, '2024-05-11 08:52'),
  ( 6,  7, 'paypal',          89.00, '2024-05-29 19:12'),
  ( 7,  8, 'card',           249.00, '2024-06-15 12:01'),
  ( 8,  9, 'bank_transfer',  718.00, '2024-07-01 17:50'),
  ( 9, 10, 'card',          1499.00, '2024-07-22 11:22'),
  (10, 11, 'apple_pay',      189.00, '2024-08-09 15:36'),
  (11, 12, 'card',           549.00, '2024-08-25 10:07'),
  (12, 13, 'paypal',         329.00, '2024-09-12 13:52'),
  (13, 14, 'card',           718.00, '2024-09-28 09:41'),
  (14, 15, 'card',            79.00, '2024-10-14 18:16'),
  (15, 16, 'paypal',         618.00, '2024-11-02 20:31'),
  (16, 17, 'apple_pay',       99.00, '2024-11-20 16:56'),
  (17, 18, 'card',           978.00, '2024-12-08 08:21'),
  (18, 19, 'card',            59.00, '2025-01-05 14:11'),
  (19, 20, 'paypal',         249.00, '2025-01-19 11:36'),
  (20, 21, 'card',          2348.00, '2025-02-02 09:27'),
  (21, 22, 'apple_pay',      189.00, '2025-02-17 15:01'),
  (22, 23, 'card',           129.00, '2025-03-05 10:46'),
  (23, 25, 'card',          1499.00, '2025-04-26 19:41'),
  (24, 27, 'card',            59.00, '2025-05-14 08:31'),
  (25, 28, 'paypal',         329.00, '2025-06-01 12:16'),
  (26, 29, 'bank_transfer', 1798.00, '2025-06-19 16:55'),
  (27, 31, 'card',            99.00, '2025-07-25 14:36'),
  (28, 32, 'apple_pay',       29.00, '2025-08-12 21:01'),
  (29, 33, 'paypal',         128.00, '2025-08-30 09:56'),
  (30, 34, 'card',           179.00, '2025-09-17 18:26'),
  (31, 36, 'card',           129.00, '2025-10-21 15:46'),
  (32, 37, 'paypal',          98.00, '2025-11-05 08:06'),
  (33, 38, 'card',           649.00, '2025-11-12 13:31'),
  (34, 39, 'apple_pay',       89.00, '2026-01-08 10:51'),
  (35, 40, 'bank_transfer', 2199.00, '2026-02-14 12:26'),
  (36, 41, 'card',            49.00, '2026-03-02 17:16'),
  (37, 43, 'card',          1798.00, '2026-05-27 14:41'),
  (38, 45, 'paypal',         129.00, '2026-07-21 11:31'),
  (39, 46, 'apple_pay',       29.00, '2026-08-14 16:06'),
  (40, 47, 'card',           549.00, '2026-09-02 10:36'),
  (41, 48, 'card',          2499.00, '2026-10-19 15:21');

-- Customers review products (not always ones they bought here, and not
-- always kindly). body is sometimes NULL — lazy reviewers are realistic.
CREATE TABLE reviews (
  review_id   INT PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  product_id  INT NOT NULL REFERENCES products(product_id),
  stars       INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  created_at  TIMESTAMP NOT NULL
);

INSERT INTO reviews (review_id, customer_id, product_id, stars, title, body, created_at) VALUES
  ( 1,  1,  1, 5, 'Fantastic daily driver', 'Six months in and the battery still lasts a full work day.', '2024-04-02 18:30'),
  ( 2,  2,  6, 5, 'Silence is golden', 'ANC on the subway is a game changer.', '2024-03-10 09:15'),
  ( 3,  3,  6, 4, 'Great sound, tight fit', 'Sound quality is superb but they clamp a bit.', '2024-04-01 20:45'),
  ( 4,  4, 17, 5, 'Worth every cent', 'The whole family plays on it now.', '2024-04-20 14:05'),
  ( 5,  5,  3, 3, 'Just okay', 'Screen is dim outdoors; fine for the price.', '2024-05-25 11:20'),
  ( 6,  6,  8, 4, 'Punchy little speaker', 'Bass surprised me for the size.', '2024-06-05 16:40'),
  ( 7,  7,  6, 5, 'My third pair', 'I keep buying these as gifts.', '2024-06-20 08:55'),
  ( 8,  8, 20, 4, 'Solid tablet', 'Great screen, speakers could be louder.', '2024-07-03 21:10'),
  ( 9,  9, 21, 5, 'E-ink convert', 'I read twice as much now.', '2024-08-12 19:35'),
  (10, 10, 17, 4, 'Fast, quiet', 'Loads games instantly.', '2024-09-01 12:50'),
  (11,  1, 22, 5, 'Charges everything', 'One brick for laptop, tablet and phone.', '2024-10-10 10:30'),
  (12, 11, 11, 4, 'Accurate tracking', 'GPS lock is quick; sleep data is iffy.', '2024-10-18 07:25'),
  (13, 12, 18, 3, 'Drift on sticks', 'Had to recalibrate twice in a month.', '2024-11-08 22:15'),
  (14, 13,  3, 2, 'Fan noise', 'Sounds like a hairdryer under load.', '2024-12-15 15:00'),
  (15,  5, 12, 4, 'Great value tracker', 'Battery lasts 10 days easily.', '2024-12-02 09:40'),
  (16, 14,  6, 5, 'Best under 300', 'Tried three brands; these win.', '2025-01-24 17:20'),
  (17,  6, 13, 5, 'Trail ready', 'Survived rain and mud, still precise.', '2025-02-09 13:05'),
  (18, 15, 21, 5, 'Bedtime hero', 'Frontlight is perfect at night.', '2025-02-20 21:55'),
  (19,  9,  7, 4, 'Good buds', 'Case is pocketable; mic is average.', '2025-03-08 11:45'),
  (20, 16, 13, 4, 'Hiking approved', 'Altimeter matches summit signs.', '2025-04-02 16:10'),
  (21,  7, 14, 5, 'Photos like a pro', 'Autofocus nailed my toddlers.', '2025-05-11 19:30'),
  (22, 18, 11, 3, 'Steps inflate', 'Counts driving as walking.', '2025-06-04 08:20'),
  (23, 10, 15, 5, 'Sharp glass', 'Bokeh is creamy. Worth the upgrade.', '2025-06-25 14:35'),
  (24, 20, 28, 4, 'Cozy glow', NULL, '2025-08-15 20:00'),
  (25,  2, 26, 5, 'Smart home starter kit', 'Scheduled lights = fake TV presence.', '2025-05-30 10:10'),
  (26, 13, 12, 5, 'Motivation machine', 'Rings closed, habits formed.', '2025-08-01 09:00'),
  (27, 11,  9, 4, 'Clear audio', 'Great for calls and podcasts.', '2025-09-20 15:45'),
  (28,  3, 25, 2, 'Disconnects', 'Loses WiFi twice a day; support was slow.', '2026-01-15 12:30'),
  (29, 14, 15, 4, 'Nifty fifty', 'Light, fast, cheap - pick two? All three.', '2025-11-12 18:05'),
  (30, 12,  2, 5, 'Desktop replacement', 'Compiles like a workstation.', '2026-03-01 10:40'),
  (31,  6, 27, 1, 'Dead on arrival', 'Hub never paired; replacement also failed.', '2026-01-20 21:25'),
  (32, 19,  6, 5, 'Loyal customer', NULL, '2026-04-08 16:50'),
  (33, 20, 26, 5, 'Energy savings visible', 'Bill dropped 8 dollars the first month.', '2026-05-19 11:15'),
  (34,  4, 23, 4, 'Comfortable pack', 'Hip belt saves my shoulders.', '2026-06-11 08:45'),
  (35,  1,  6, 4, 'Still my go-to', 'Two years of daily commute use.', '2026-07-02 19:20');
