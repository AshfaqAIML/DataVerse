-- ============================================================================
-- TRAILHEAD OUTDOORS — RETAIL CHAIN SAMPLE DATABASE
-- A brick-and-mortar outdoor-gear chain (not e-commerce: physical stores,
-- stock rooms, suppliers, purchase orders). Designed edge cases:
--   * inventory is per (store, product) — composite primary key
--   * products below reorder level while others overstock (CASE lessons)
--   * purchase orders with mixed statuses; one expected_on NULL (overdue?)
--   * product 19 is a deliberate loss-leader (price 3.99 below cost 4.80)
--   * a supplier with no purchase orders yet
--   * stores in the same state for GROUP BY state vs GROUP BY city
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE stores (
  store_id INT PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  city     TEXT NOT NULL,
  state    TEXT NOT NULL,
  opened   DATE NOT NULL,
  sqft     INT NOT NULL CHECK (sqft > 0)
);

INSERT INTO stores (store_id, name, city, state, opened, sqft) VALUES
  (1, 'Downtown Flagship', 'Springfield', 'OR', '2012-04-20', 22000),
  (2, 'Riverside Commons', 'Riverton',    'WA', '2015-09-11', 15000),
  (3, 'Lakewood Plaza',    'Lakewood',    'OR', '2018-06-02', 12000),
  (4, 'Fairview Mall',     'Fairview',    'WA', '2020-11-13', 9500),
  (5, 'Northgate Outpost', 'Northgate',   'OR', '2023-03-17', 8000);

CREATE TABLE suppliers (
  supplier_id     INT PRIMARY KEY,
  name            TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  phone           TEXT,
  lead_time_days  INT NOT NULL CHECK (lead_time_days > 0)
);

INSERT INTO suppliers (supplier_id, name, contact_name, phone, lead_time_days) VALUES
  (1, 'SummitTextile Co.',    'Wanda Ortiz',  '555-0201', 14),
  (2, 'GraniteGear Works',    'Erik Sandvik', '555-0202', 21),
  (3, 'BlueRiver Footwear',   'Chen Wei',     '555-0203', 10),
  (4, 'Nordic Sleep Systems', 'Ingrid Aas',   '555-0204', 28),
  (5, 'CanyonCook Ltd.',      'Miguel Torres','555-0205', 18),
  (6, 'AuroraOptics',         'Sana Iqbal',   '555-0206', 35),
  (7, 'RidgePole Tents',      'Bert Kaminski','555-0207', 12),
  (8, 'WildWaters Paddles',   'Nate Whitlow', NULL,        25);

CREATE TABLE products (
  product_id  INT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  cost        NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  supplier_id INT NOT NULL REFERENCES suppliers(supplier_id)
);

INSERT INTO products (product_id, name, category, cost, price, supplier_id) VALUES
  ( 1, 'Alpine 45L Backpack',      'Backpacking',  84.00, 149.00, 1),
  ( 2, 'RidgeDay 22L Daypack',     'Hiking',       28.00,  49.00, 1),
  ( 3, 'SummitDown 20F Sleeping Bag', 'Camping',   96.00, 179.00, 4),
  ( 4, 'BaseCamp Pad Regular',     'Camping',      32.00,  59.00, 4),
  ( 5, 'Granite Trekking Poles (pair)', 'Hiking',  24.00,  45.00, 2),
  ( 6, 'Skyline 2P Tent',          'Camping',     138.00, 249.00, 7),
  ( 7, 'Cirrus 4P Family Tent',    'Camping',     176.00, 299.00, 7),
  ( 8, 'Trailhead Merino Hiking Socks', 'Apparel',  6.50,  14.00, 1),
  ( 9, 'CanyonStove Portable Burner', 'Camping',   31.00,  59.00, 5),
  (10, 'CastIron Camp Dutch Oven', 'Camping',      38.00,  69.00, 5),
  (11, 'Rapidsport Water Sandals', 'Paddling',     21.00,  39.00, 8),
  (12, 'Crestline Kayak Paddle',   'Paddling',     58.00, 109.00, 8),
  (13, 'Horizon Polarized Sunglasses', 'Apparel',  34.00,  79.00, 6),
  (14, 'Vista 8x32 Binoculars',    'Optics',       92.00, 169.00, 6),
  (15, 'GraniteHeadlamp 400lm',    'Hiking',       17.00,  34.00, 2),
  (16, 'StormShell Rain Jacket',   'Apparel',      79.00, 149.00, 1),
  (17, 'ThermalBase Layer Top',    'Apparel',      23.00,  45.00, 1),
  (18, 'TrailRun Grip Gloves',     'Running',      12.00,  25.00, 2),
  (19, 'Everest Water Bottle 1L',  'Hiking',        4.80,   3.99, 5),
  (20, 'Ridgeline Camp Chair',     'Camping',      26.00,  49.00, 2),
  (21, 'AuroraHeadlamp 900lm',     'Hiking',       36.00,  79.00, 6),
  (22, 'Solstice Sun Hat',         'Apparel',       9.50,  25.00, 1),
  (23, 'PeakBrew Camp Coffee Kit', 'Camping',      28.00,  65.00, 5),
  (24, 'RapidDry Towel Large',     'Camping',      11.00,  29.00, 5);

-- Stock levels per store. Composite PK (store_id, product_id).
CREATE TABLE inventory (
  store_id      INT NOT NULL REFERENCES stores(store_id),
  product_id    INT NOT NULL REFERENCES products(product_id),
  on_hand       INT NOT NULL CHECK (on_hand >= 0),
  reorder_level INT NOT NULL CHECK (reorder_level >= 0),
  last_counted  DATE NOT NULL,
  PRIMARY KEY (store_id, product_id)
);

INSERT INTO inventory (store_id, product_id, on_hand, reorder_level, last_counted) VALUES
  (1,  1, 18,  8, '2026-10-28'), (1,  2, 44, 20, '2026-10-28'),
  (1,  3, 12,  6, '2026-10-28'), (1,  4, 25, 10, '2026-10-28'),
  (1,  5, 37, 15, '2026-10-28'), (1,  6,  9,  6, '2026-10-28'),
  (1,  7,  5,  4, '2026-10-28'), (1,  8, 96, 40, '2026-10-28'),
  (1,  9, 22, 10, '2026-10-28'), (1, 10, 14,  8, '2026-10-28'),
  (1, 11, 17,  8, '2026-10-28'), (1, 12, 11,  6, '2026-10-28'),
  (1, 13, 29, 12, '2026-10-28'), (1, 14,  7,  5, '2026-10-28'),
  (1, 15, 41, 20, '2026-10-28'), (1, 16, 20, 10, '2026-10-28'),
  (1, 17, 33, 15, '2026-10-28'), (1, 18, 26, 12, '2026-10-28'),
  (1, 19, 88, 40, '2026-10-28'), (1, 20, 31, 14, '2026-10-28'),
  (1, 21, 12,  6, '2026-10-28'), (1, 22, 52, 24, '2026-10-28'),
  (1, 23, 19,  8, '2026-10-28'), (1, 24, 35, 16, '2026-10-28'),
  (2,  1, 10,  6, '2026-10-30'), (2,  2, 28, 14, '2026-10-30'),
  (2,  3,  6,  5, '2026-10-30'), (2,  4, 14,  8, '2026-10-30'),
  (2,  5, 21, 10, '2026-10-30'), (2,  6,  4,  4, '2026-10-30'),
  (2,  7,  3,  3, '2026-10-30'), (2,  8, 61, 30, '2026-10-30'),
  (2,  9, 12,  8, '2026-10-30'), (2, 10,  6,  6, '2026-10-30'),
  (2, 11,  9,  6, '2026-10-30'), (2, 12,  5,  4, '2026-10-30'),
  (2, 13, 15,  8, '2026-10-30'), (2, 14,  4,  3, '2026-10-30'),
  (2, 15, 22, 12, '2026-10-30'), (2, 16, 11,  6, '2026-10-30'),
  (2, 17, 18, 10, '2026-10-30'), (2, 18, 13,  8, '2026-10-30'),
  (2, 19, 54, 25, '2026-10-30'), (2, 20, 16,  8, '2026-10-30'),
  (2, 21,  6,  4, '2026-10-30'), (2, 22, 30, 15, '2026-10-30'),
  (2, 23,  8,  5, '2026-10-30'), (2, 24, 20, 10, '2026-10-30'),
  (3,  1,  7,  5, '2026-11-02'), (3,  2, 19, 10, '2026-11-02'),
  (3,  3,  4,  4, '2026-11-02'), (3,  4,  9,  6, '2026-11-02'),
  (3,  5, 13,  8, '2026-11-02'), (3,  6,  3,  3, '2026-11-02'),
  (3,  8, 37, 20, '2026-11-02'), (3,  9,  7,  5, '2026-11-02'),
  (3, 13,  9,  6, '2026-11-02'), (3, 15, 14,  8, '2026-11-02'),
  (3, 16,  6,  4, '2026-11-02'), (3, 17, 11,  6, '2026-11-02'),
  (3, 19, 41, 20, '2026-11-02'), (3, 20, 10,  6, '2026-11-02'),
  (3, 22, 24, 12, '2026-11-02'), (3, 24, 12,  8, '2026-11-02'),
  (4,  1,  4,  3, '2026-11-04'), (4,  2, 12,  8, '2026-11-04'),
  (4,  4,  5,  4, '2026-11-04'), (4,  5,  8,  6, '2026-11-04'),
  (4,  8, 23, 12, '2026-11-04'), (4,  9,  4,  3, '2026-11-04'),
  (4, 13,  6,  4, '2026-11-04'), (4, 15,  9,  6, '2026-11-04'),
  (4, 17,  7,  4, '2026-11-04'), (4, 19, 27, 14, '2026-11-04'),
  (4, 20,  5,  4, '2026-11-04'), (4, 22, 15,  8, '2026-11-04'),
  (4, 24,  8,  6, '2026-11-04'),
  (5,  2,  8,  6, '2026-11-06'), (5,  4,  3,  3, '2026-11-06'),
  (5,  5,  6,  4, '2026-11-06'), (5,  8, 16, 10, '2026-11-06'),
  (5,  9,  3,  2, '2026-11-06'), (5, 13,  4,  3, '2026-11-06'),
  (5, 15,  7,  5, '2026-11-06'), (5, 17,  5,  4, '2026-11-06'),
  (5, 19, 19, 10, '2026-11-06'), (5, 20,  4,  3, '2026-11-06'),
  (5, 22, 11,  6, '2026-11-06'), (5, 24,  6,  4, '2026-11-06');

CREATE TABLE purchase_orders (
  po_id       INT PRIMARY KEY,
  store_id    INT NOT NULL REFERENCES stores(store_id),
  supplier_id INT NOT NULL REFERENCES suppliers(supplier_id),
  ordered_on  DATE NOT NULL,
  expected_on DATE,
  status      TEXT NOT NULL CHECK (status IN ('pending','partial','received','cancelled')),
  total_cost  NUMERIC(10,2) NOT NULL CHECK (total_cost >= 0)
);

INSERT INTO purchase_orders (po_id, store_id, supplier_id, ordered_on, expected_on, status, total_cost) VALUES
  ( 1, 1, 1, '2026-07-14', '2026-07-30', 'received',  3355.00),
  ( 2, 1, 4, '2026-08-02', '2026-08-25', 'received',  4160.00),
  ( 3, 2, 7, '2026-08-19', '2026-09-02', 'received',  6090.00),
  ( 4, 1, 2, '2026-09-01', '2026-09-16', 'received',  2304.00),
  ( 5, 3, 5, '2026-09-12', '2026-10-06', 'received',  1464.00),
  ( 6, 2, 1, '2026-09-25', '2026-10-12', 'received',  1782.00),
  ( 7, 1, 7, '2026-10-03', '2026-10-20', 'partial',   8596.00),
  ( 8, 4, 6, '2026-10-10', '2026-11-14', 'pending',   2336.00),
  ( 9, 5, 1, '2026-10-15', '2026-11-05', 'received',  1425.00),
  (10, 3, 2, '2026-10-22', '2026-11-10', 'partial',    960.00),
  (11, 2, 8, '2026-10-29', NULL,         'pending',   1790.00),
  (12, 1, 5, '2026-11-02', '2026-11-20', 'pending',   1848.00),
  (13, 5, 2, '2026-11-05', '2026-11-24', 'pending',    900.00),
  (14, 4, 1, '2026-08-28', '2026-09-15', 'cancelled', 1840.00),
  (15, 3, 7, '2026-11-08', '2026-11-25', 'pending',   4596.00),
  (16, 2, 4, '2026-11-09', '2026-12-08', 'pending',   3360.00);

CREATE TABLE po_items (
  po_id      INT NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(product_id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  unit_cost  NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (po_id, product_id)
);

INSERT INTO po_items (po_id, product_id, quantity, unit_cost) VALUES
  ( 1,  1, 20, 84.00), ( 1,  2, 20, 28.00), ( 1, 16, 10, 79.00), ( 1,  8, 50,  6.50),
  ( 2,  3, 30, 96.00), ( 2,  4, 40, 32.00),
  ( 3,  6, 25, 138.00), ( 3,  7, 15, 176.00),
  ( 4,  5, 36, 24.00), ( 4, 15, 48, 17.00), ( 4, 20, 24, 26.00),
  ( 5,  9, 24, 31.00), ( 5, 19, 80,  4.80), ( 5, 23, 12, 28.00),
  ( 6,  8, 80,  6.50), ( 6, 17, 40, 23.00), ( 6, 22, 36,  9.50),
  ( 7,  6, 30, 138.00), ( 7,  7, 20, 176.00), ( 7, 20, 36, 26.00),
  ( 8, 14, 16, 92.00), ( 8, 21, 24, 36.00),
  ( 9,  2, 25, 28.00), ( 9, 22, 40,  9.50), ( 9, 17, 15, 23.00),
  (10,  5, 28, 24.00), (10, 18, 24, 12.00),
  (11, 12, 20, 58.00), (11, 11, 30, 21.00),
  (12, 10, 24, 38.00), (12, 23, 24, 28.00), (12, 24, 24, 11.00),
  (13, 15, 36, 17.00), (13, 18, 24, 12.00),
  (14, 16, 20, 79.00), (14,  8, 40,  6.50),
  (15,  6, 18, 138.00), (15,  7, 12, 176.00),
  (16,  3, 25, 96.00), (16,  4, 30, 32.00);
