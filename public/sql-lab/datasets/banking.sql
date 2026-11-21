-- ============================================================================
-- MERIDIAN TRUST — BANKING SAMPLE DATABASE
-- A regional bank. Customers hold accounts at branches; every account
-- movement is a transaction with a running balance_after (window-function
-- heaven); loans have payment histories. Designed edge cases:
--   * transactions carry balance_after — running totals / LAG lessons
--   * closed accounts (is_active false) that still have history
--   * a customer with 3 accounts; customers with none (prospects)
--   * defaulted and paid-off loans
--   * a loan payment after the loan was marked paid_off (data-quality bug
--     for the case study to find)
--   * fees (txn_type 'fee') with small amounts for HAVING filters
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE branches (
  branch_id INT PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  city      TEXT NOT NULL,
  opened    DATE NOT NULL,
  assets    NUMERIC(14,2) NOT NULL
);

INSERT INTO branches (branch_id, name, city, opened, assets) VALUES
  (1, 'Downtown',      'Springfield', '1974-06-01', 412000000.00),
  (2, 'Riverside',     'Riverton',    '1988-09-15', 268000000.00),
  (3, 'Lakewood Plaza','Lakewood',    '1999-03-20', 187000000.00),
  (4, 'Fairview',      'Fairview',    '2005-11-02', 142000000.00),
  (5, 'Northgate Uni', 'Northgate',   '2015-08-18',  96000000.00);

CREATE TABLE customers (
  customer_id  INT PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  city         TEXT NOT NULL,
  since        DATE NOT NULL,
  risk_rating  TEXT NOT NULL DEFAULT 'low' CHECK (risk_rating IN ('low','medium','high'))
);

INSERT INTO customers (customer_id, first_name, last_name, email, city, since, risk_rating) VALUES
  ( 1, 'Raymond',  'Castillo',  'r.castillo@meridian.example',  'Springfield', '2010-04-12', 'low'),
  ( 2, 'Diana',    'Whitmore',  'd.whitmore@meridian.example',  'Riverton',    '2012-09-30', 'low'),
  ( 3, 'Kwame',    'Mensah',    'k.mensah@meridian.example',     'Lakewood',    '2015-01-22', 'medium'),
  ( 4, 'Elena',    'Sokolova',  'e.sokolova@meridian.example',  'Springfield', '2016-07-14', 'low'),
  ( 5, 'Frank',    'Delgado',   'f.delgado@meridian.example',   'Fairview',    '2018-02-05', 'high'),
  ( 6, 'Aisha',    'Bello',     'a.bello@meridian.example',     'Springfield', '2011-11-28', 'low'),
  ( 7, 'Gustav',   'Lindgren',  'g.lindgren@meridian.example',  'Lakewood',    '2019-05-19', 'low'),
  ( 8, 'Paula',    'Okafor',    'p.okafor@meridian.example',    'Riverton',    '2013-03-08', 'medium'),
  ( 9, 'Vincent',  'Cho',       'v.cho@meridian.example',       'Northgate',   '2020-10-11', 'low'),
  (10, 'Bridget',  'Callahan',  'b.callahan@meridian.example',  'Springfield', '2009-08-25', 'low'),
  (11, 'Andre',    'Laurent',   'a.laurent@meridian.example',   'Fairview',    '2021-06-30', 'medium'),
  (12, 'Sandra',   'Vance',     's.vance@meridian.example',     'Riverton',    '2014-12-17', 'low'),
  (13, 'Trevor',   'Bishop',    't.bishop@meridian.example',    'Lakewood',    '2017-04-03', 'high'),
  (14, 'Yasmin',   'Farouk',    'y.farouk@meridian.example',    'Northgate',   '2022-02-14', 'low'),
  (15, 'Colin',    'Doyle',     'c.doyle@meridian.example',     'Springfield', '2018-10-09', 'low'),
  (16, 'Marta',    'Nowak',     'm.nowak@meridian.example',     'Fairview',    '2020-01-27', 'medium'),
  (17, 'Reginald', 'Ashton',    'r.ashton@meridian.example',    'Springfield', '2007-05-16', 'low'),
  (18, 'Lena',     'Brandt',    'l.brandt@meridian.example',    'Northgate',   '2023-09-04', 'low'),
  (19, 'Hank',     'Mori',      'h.mori@meridian.example',      'Lakewood',    '2016-06-21', 'medium'),
  (20, 'Celia',    'Moreau',    'c.moreau@meridian.example',    'Riverton',    '2024-03-11', 'low');

CREATE TABLE accounts (
  account_id   INT PRIMARY KEY,
  customer_id  INT NOT NULL REFERENCES customers(customer_id),
  branch_id    INT NOT NULL REFERENCES branches(branch_id),
  account_type TEXT NOT NULL CHECK (account_type IN ('checking','savings','business','cd')),
  balance      NUMERIC(12,2) NOT NULL,
  opened       DATE NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO accounts (account_id, customer_id, branch_id, account_type, balance, opened, is_active) VALUES
  ( 1,  1, 1, 'checking',  10939.50, '2010-04-15', true),
  ( 2,  1, 1, 'savings',  28900.00, '2012-06-01', true),
  ( 3,  1, 5, 'business', 15420.75, '2019-03-10', true),
  ( 4,  2, 2, 'checking',  8789.25, '2012-10-02', true),
  ( 5,  2, 2, 'savings',  17500.00, '2013-01-20', true),
  ( 6,  3, 3, 'checking',   892.40, '2015-02-01', true),
  ( 7,  3, 3, 'savings',   5400.00, '2017-08-15', false),
  ( 8,  4, 1, 'checking',  6702.90, '2016-07-20', true),
  ( 9,  5, 4, 'checking',   154.67, '2018-02-10', true),
  (10,  6, 1, 'checking',  5281.30, '2011-12-05', true),
  (11,  6, 1, 'savings',  41200.00, '2012-03-30', true),
  (12,  7, 3, 'checking',  2945.80, '2019-05-25', true),
  (13,  8, 2, 'checking',  1873.55, '2013-03-15', true),
  (14,  8, 2, 'business',  9840.00, '2016-09-01', true),
  (15,  9, 5, 'checking',  1350.00, '2020-10-15', true),
  (16,  9, 5, 'savings',   2600.00, '2021-01-10', true),
  (17, 10, 1, 'checking',  29425.00, '2009-09-01', true),
  (18, 10, 1, 'savings',  63500.00, '2010-05-20', true),
  (19, 11, 4, 'checking',   620.10, '2021-07-05', true),
  (20, 12, 2, 'checking',  5275.40, '2015-01-02', true),
  (21, 12, 2, 'savings',  12800.00, '2016-06-14', true),
  (22, 13, 3, 'checking',   -48.20, '2017-04-10', true),
  (23, 14, 5, 'checking',  2105.00, '2022-02-20', true),
  (24, 14, 5, 'savings',   5100.00, '2023-04-30', true),
  (25, 15, 1, 'checking',  3698.25, '2018-10-15', true),
  (26, 16, 4, 'checking',   940.60, '2020-02-01', true),
  (27, 17, 1, 'checking',  8245.00, '2007-06-01', true),
  (28, 17, 1, 'savings',  92000.00, '2008-02-15', true),
  (29, 17, 1, 'cd',       50000.00, '2023-10-01', true),
  (30, 19, 3, 'checking',  1088.90, '2016-06-25', true),
  (31, 20, 2, 'checking',   745.00, '2024-03-15', true);

-- Every account movement, with the balance AFTER the transaction —
-- a ready-made running-total dataset for window functions.
CREATE TABLE transactions (
  txn_id        INT PRIMARY KEY,
  account_id    INT NOT NULL REFERENCES accounts(account_id),
  txn_type      TEXT NOT NULL CHECK (txn_type IN ('deposit','withdrawal','transfer_in','transfer_out','fee')),
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(12,2) NOT NULL,
  occurred_at   TIMESTAMP NOT NULL,
  channel       TEXT NOT NULL CHECK (channel IN ('branch','atm','online','mobile')),
  description   TEXT
);

INSERT INTO transactions (txn_id, account_id, txn_type, amount, balance_after, occurred_at, channel, description) VALUES
  ( 1,  1, 'deposit',     2500.00,  2500.00, '2026-01-05 09:15', 'branch', 'Payroll deposit'),
  ( 2,  1, 'withdrawal',   820.00,  1680.00, '2026-01-08 14:30', 'atm',    'ATM withdrawal'),
  ( 3,  1, 'deposit',     2500.00,  4180.00, '2026-01-20 09:16', 'branch', 'Payroll deposit'),
  ( 4,  1, 'fee',            5.00,  4175.00, '2026-01-31 23:59', 'online', 'Monthly maintenance fee'),
  ( 5,  1, 'withdrawal',   640.50,  3534.50, '2026-02-04 18:20', 'online', 'Electric bill'),
  ( 6,  1, 'deposit',     2500.00,  6034.50, '2026-02-20 09:14', 'branch', 'Payroll deposit'),
  ( 7,  1, 'withdrawal',   985.00,  5049.50, '2026-03-02 10:40', 'online', 'Insurance premium'),
  ( 8,  1, 'transfer_out',1500.00,  3549.50, '2026-03-15 11:00', 'online', 'Transfer to savings'),
  ( 9,  2, 'transfer_in', 1500.00, 28900.00, '2026-03-15 11:00', 'online', 'From checking'),
  (10,  1, 'deposit',     2500.00,  6049.50, '2026-03-20 09:15', 'branch', 'Payroll deposit'),
  (11,  1, 'withdrawal', 1200.00,  4849.50, '2026-04-01 16:55', 'atm',    'ATM withdrawal'),
  (12,  1, 'deposit',     2500.00,  7349.50, '2026-04-20 09:16', 'branch', 'Payroll deposit'),
  (13,  1, 'fee',            5.00,  7344.50, '2026-04-30 23:59', 'online', 'Monthly maintenance fee'),
  (14,  1, 'withdrawal', 1560.00,  5784.50, '2026-05-06 09:30', 'online', 'Rent'),
  (15,  1, 'deposit',     2500.00,  8284.50, '2026-05-20 09:15', 'branch', 'Payroll deposit'),
  (16,  1, 'withdrawal',  980.00,  7304.50, '2026-06-03 12:10', 'online', 'Car loan payment'),
  (17,  1, 'deposit',     2500.00,  9804.50, '2026-06-20 09:14', 'branch', 'Payroll deposit'),
  (18,  1, 'withdrawal', 2010.00,  7794.50, '2026-07-01 08:45', 'online', 'Summer holiday booking'),
  (19,  1, 'deposit',     2500.00, 10294.50,'2026-07-20 09:15', 'branch', 'Payroll deposit'),
  (20,  1, 'withdrawal', 2500.00,  7794.50, '2026-08-05 19:30', 'online', 'Tuition payment'),
  (21,  1, 'deposit',     2500.00, 10294.50,'2026-08-20 09:16', 'branch', 'Payroll deposit'),
  (22,  1, 'withdrawal', 1500.00,  8794.50, '2026-09-04 17:20', 'online', 'Credit card payment'),
  (23,  1, 'deposit',     2500.00, 11294.50,'2026-09-20 09:15', 'branch', 'Payroll deposit'),
  (24,  1, 'withdrawal', 1120.00, 10174.50,'2026-10-02 14:00', 'online', 'Groceries monthly'),
  (25,  1, 'deposit',     2500.00, 12674.50,'2026-10-20 09:14', 'branch', 'Payroll deposit'),
  (26,  1, 'withdrawal', 1800.00, 10874.50,'2026-11-01 09:00', 'online', 'Rent'),
  (27,  1, 'deposit',     2500.00, 13374.50,'2026-11-05 09:15', 'branch', 'Payroll deposit'),
  (28,  1, 'withdrawal', 2430.00, 10944.50,'2026-11-08 20:15', 'online', 'Flights to Lisbon'),
  (29,  1, 'fee',            5.00,  10939.50, '2026-11-10 23:59', 'online', 'Overseas transaction fee'),
  (30,  4, 'deposit',     3000.00,  3000.00, '2026-02-01 10:00', 'branch', 'Initial deposit'),
  (31,  4, 'withdrawal',  1420.00,  1580.00, '2026-02-10 15:30', 'online', 'Dentist'),
  (32,  4, 'deposit',     2400.00,  3980.00, '2026-03-01 09:30', 'branch', 'Payroll deposit'),
  (33,  4, 'withdrawal',   815.75,  3164.25, '2026-03-18 11:45', 'online', 'Groceries'),
  (34,  4, 'deposit',     2400.00,  5564.25, '2026-04-01 09:31', 'branch', 'Payroll deposit'),
  (35,  4, 'withdrawal', 1900.00,  3664.25, '2026-04-22 16:00', 'online', 'Rent'),
  (36,  4, 'deposit',     2400.00,  6064.25, '2026-05-01 09:30', 'branch', 'Payroll deposit'),
  (37,  4, 'fee',            5.00,  6059.25, '2026-05-31 23:59', 'online', 'Monthly maintenance fee'),
  (38,  4, 'withdrawal',  640.00,  5419.25, '2026-06-12 13:20', 'atm',    'ATM withdrawal'),
  (39,  4, 'deposit',     2400.00,  7819.25, '2026-06-30 09:30', 'branch', 'Payroll deposit'),
  (40,  4, 'withdrawal', 2300.00,  5519.25, '2026-07-15 10:05', 'online', 'Car repair'),
  (41,  4, 'deposit',     2400.00,  7919.25, '2026-07-31 09:30', 'branch', 'Payroll deposit'),
  (42,  4, 'withdrawal',  1560.00,  6359.25, '2026-08-01 08:50', 'online', 'Rent'),
  (43,  4, 'deposit',     2400.00,  8759.25, '2026-08-29 09:30', 'branch', 'Payroll deposit'),
  (44,  4, 'withdrawal', 3400.00,  5359.25, '2026-09-13 18:40', 'online', 'Appliance purchase'),
  (45,  4, 'deposit',     2400.00,  7759.25, '2026-09-30 09:31', 'branch', 'Payroll deposit'),
  (46,  4, 'withdrawal', 1560.00,  6199.25, '2026-10-01 09:00', 'online', 'Rent'),
  (47,  4, 'deposit',     2400.00,  8599.25, '2026-10-30 09:30', 'branch', 'Payroll deposit'),
  (48,  4, 'withdrawal',  2210.00,  6389.25, '2026-11-04 20:10', 'online', 'Winter tires'),
  (49,  4, 'deposit',     2400.00,  8789.25, '2026-11-12 09:30', 'branch', 'Payroll deposit'),
  (50,  6, 'withdrawal',   180.00,   820.00, '2026-03-15 14:20', 'atm',    'ATM withdrawal'),
  (51,  6, 'deposit',      450.00,  1270.00, '2026-03-29 10:00', 'mobile', 'Check deposit'),
  (52,  6, 'fee',           35.00,  1235.00, '2026-04-10 00:00', 'online', 'Overdraft fee'),
  (53,  6, 'deposit',      600.00,  1835.00, '2026-04-28 09:00', 'mobile', 'Check deposit'),
  (54,  6, 'withdrawal',   950.00,   885.00, '2026-05-20 16:30', 'online', 'Phone purchase'),
  (55,  6, 'deposit',      520.00,  1405.00, '2026-06-15 11:00', 'mobile', 'Refund'),
  (56,  6, 'withdrawal',   610.00,   795.00, '2026-07-08 13:45', 'atm',    'ATM withdrawal'),
  (57,  6, 'deposit',      480.00,  1275.00, '2026-08-12 15:00', 'mobile', 'Check deposit'),
  (58,  6, 'withdrawal',   725.00,   550.00, '2026-09-19 10:20', 'online', 'Groceries'),
  (59,  6, 'deposit',      390.00,   940.00, '2026-10-14 09:30', 'mobile', 'Cash deposit'),
  (60,  6, 'withdrawal',   400.00,   540.00, '2026-10-30 17:55', 'online', 'Utility bill'),
  (61,  6, 'deposit',      352.40,   892.40, '2026-11-09 09:00', 'branch', 'Interest credit'),
  (62, 17, 'deposit',     9800.00,  9800.00, '2026-01-15 10:30', 'branch', 'Pension deposit'),
  (63, 17, 'withdrawal',  2100.00,  7700.00, '2026-02-01 09:00', 'online', 'Property tax'),
  (64, 17, 'deposit',     4900.00, 12600.00, '2026-02-15 10:31', 'branch', 'Pension deposit'),
  (65, 17, 'withdrawal',  3400.00,  9200.00, '2026-03-04 14:15', 'online', 'Kitchen renovation'),
  (66, 17, 'deposit',     4900.00, 14100.00, '2026-03-15 10:30', 'branch', 'Pension deposit'),
  (67, 17, 'transfer_out',2000.00, 12100.00, '2026-04-01 11:00', 'online', 'Transfer to savings'),
  (68, 28, 'transfer_in', 2000.00, 92000.00, '2026-04-01 11:00', 'online', 'From checking'),
  (69, 17, 'deposit',     4900.00, 17000.00, '2026-04-15 10:32', 'branch', 'Pension deposit'),
  (70, 17, 'withdrawal',  1875.00, 15125.00, '2026-05-02 16:40', 'online', 'Granddaughter tuition gift'),
  (71, 17, 'deposit',     4900.00, 20025.00, '2026-05-15 10:30', 'branch', 'Pension deposit'),
  (72, 17, 'withdrawal',  1250.00, 18775.00, '2026-06-06 12:20', 'branch', 'Cash withdrawal'),
  (73, 17, 'deposit',     4900.00, 23675.00, '2026-06-15 10:31', 'branch', 'Pension deposit'),
  (74, 17, 'withdrawal',  2800.00, 20875.00, '2026-07-14 10:00', 'online', 'Roof repair'),
  (75, 17, 'deposit',     4900.00, 25775.00, '2026-07-15 10:33', 'branch', 'Pension deposit'),
  (76, 17, 'withdrawal',  3900.00, 26775.00, '2026-08-20 09:50', 'online', 'Charitable donation'),
  (77, 17, 'deposit',     4900.00, 30675.00, '2026-08-15 10:30', 'branch', 'Pension deposit'),
  (78, 17, 'withdrawal',  1650.00, 30025.00, '2026-09-17 11:25', 'online', 'Insurance premium'),
  (79, 17, 'deposit',     4900.00, 31675.00, '2026-09-15 10:34', 'branch', 'Pension deposit'),
  (80, 17, 'withdrawal',  2400.00, 27625.00, '2026-10-12 15:10', 'online', 'Winter getaway'),
  (81, 17, 'deposit',     4900.00, 32525.00, '2026-10-15 10:30', 'branch', 'Pension deposit'),
  (82, 17, 'withdrawal',  3100.00, 29425.00, '2026-11-02 10:45', 'branch', 'Cash withdrawal'),
  (83, 22, 'deposit',     2000.00,  2000.00, '2026-03-01 09:00', 'branch', 'Initial deposit'),
  (84, 22, 'withdrawal',  1450.00,   550.00, '2026-03-20 18:30', 'online', 'Car repair'),
  (85, 22, 'deposit',     1100.00,  1650.00, '2026-04-05 09:15', 'mobile', 'Check deposit'),
  (86, 22, 'withdrawal',  1820.00,  -170.00, '2026-04-21 20:40', 'online', 'Rent (overdraft)'),
  (87, 22, 'fee',           35.00,  -205.00, '2026-04-22 00:00', 'online', 'Overdraft fee'),
  (88, 22, 'deposit',      310.00,   105.00, '2026-05-08 14:00', 'mobile', 'Refund'),
  (89, 22, 'withdrawal',   240.00,  -135.00, '2026-05-30 19:15', 'atm',    'ATM withdrawal'),
  (90, 22, 'fee',           35.00,  -170.00, '2026-05-31 00:00', 'online', 'Overdraft fee'),
  (91, 22, 'deposit',      160.00,    -10.00, '2026-06-14 11:30', 'branch', 'Cash deposit'),
  (92, 22, 'withdrawal',    38.20,   -48.20, '2026-06-28 16:50', 'online', 'Streaming subscriptions'),
  (93, 20, 'deposit',      900.00,  5430.40, '2026-03-12 10:00', 'branch', 'Payroll deposit'),
  (94, 20, 'withdrawal',    155.00,  5275.40, '2026-04-02 12:30', 'online', 'Phone bill'),
  (95, 25, 'deposit',     3200.00,  3200.00, '2026-01-10 09:00', 'branch', 'Payroll deposit'),
  (96, 25, 'withdrawal',  1560.00,  1640.00, '2026-02-01 08:55', 'online', 'Rent'),
  (97, 25, 'deposit',     3200.00,  4840.00, '2026-02-10 09:00', 'branch', 'Payroll deposit'),
  (98, 25, 'withdrawal',   890.00,  3950.00, '2026-02-28 17:25', 'online', 'Groceries'),
  (99, 25, 'deposit',     3200.00,  7150.00, '2026-03-10 09:01', 'branch', 'Payroll deposit'),
  (100,25, 'withdrawal', 3451.75,  3698.25, '2026-03-25 14:40', 'online', 'Tax payment');

-- Loans, with payment history. Note loan 8: a payment arrived in
-- September 2026 even though the loan was paid off in August — a
-- data-quality bug the banking case study asks you to find.
CREATE TABLE loans (
  loan_id        INT PRIMARY KEY,
  customer_id    INT NOT NULL REFERENCES customers(customer_id),
  principal      NUMERIC(12,2) NOT NULL CHECK (principal > 0),
  interest_rate  NUMERIC(4,3) NOT NULL CHECK (interest_rate > 0),
  term_months    INT NOT NULL CHECK (term_months BETWEEN 6 AND 360),
  started        DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('active','paid_off','defaulted'))
);

INSERT INTO loans (loan_id, customer_id, principal, interest_rate, term_months, started, status) VALUES
  ( 1,  1, 24000.00, 0.067, 60, '2023-03-15', 'active'),
  ( 2,  2, 15000.00, 0.059, 48, '2022-08-01', 'active'),
  ( 3,  5,  8000.00, 0.114, 36, '2024-01-20', 'defaulted'),
  ( 4,  6, 42000.00, 0.052, 84, '2021-06-10', 'active'),
  ( 5,  8, 12000.00, 0.071, 36, '2023-11-05', 'active'),
  ( 6, 10, 35000.00, 0.048, 60, '2020-10-15', 'paid_off'),
  ( 7, 12, 18000.00, 0.063, 48, '2023-05-30', 'active'),
  ( 8, 13,  6000.00, 0.129, 24, '2024-04-12', 'paid_off'),
  ( 9, 14,  9500.00, 0.075, 36, '2025-01-08', 'active'),
  (10, 17, 20000.00, 0.044, 36, '2019-09-25', 'paid_off'),
  (11, 19,  7500.00, 0.098, 24, '2025-07-01', 'active'),
  (12,  3, 11000.00, 0.082, 36, '2024-09-15', 'active');

CREATE TABLE loan_payments (
  payment_id INT PRIMARY KEY,
  loan_id    INT NOT NULL REFERENCES loans(loan_id),
  paid_on    DATE NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0)
);

INSERT INTO loan_payments (payment_id, loan_id, paid_on, amount) VALUES
  ( 1,  1, '2026-05-15', 471.20),
  ( 2,  1, '2026-06-15', 471.20),
  ( 3,  1, '2026-07-15', 471.20),
  ( 4,  1, '2026-08-15', 471.20),
  ( 5,  1, '2026-09-15', 471.20),
  ( 6,  1, '2026-10-15', 471.20),
  ( 7,  1, '2026-11-15', 471.20),
  ( 8,  2, '2026-06-01', 352.60),
  ( 9,  2, '2026-08-01', 352.60),
  (10,  2, '2026-09-01', 352.60),
  (11,  2, '2026-10-01', 352.60),
  (12,  2, '2026-11-01', 352.60),
  (13,  3, '2024-06-12', 268.40),
  (14,  3, '2024-07-12', 268.40),
  (15,  3, '2024-08-12', 268.40),
  (16,  4, '2026-05-10', 590.75),
  (17,  4, '2026-06-10', 590.75),
  (18,  4, '2026-07-10', 590.75),
  (19,  4, '2026-08-10', 590.75),
  (20,  4, '2026-09-10', 590.75),
  (21,  4, '2026-10-10', 590.75),
  (22,  4, '2026-11-10', 590.75),
  (23,  5, '2026-05-05', 371.00),
  (24,  5, '2026-07-05', 371.00),
  (25,  5, '2026-10-05', 371.00),
  (26,  6, '2026-04-18', 655.30),
  (27,  7, '2026-06-30', 424.85),
  (28,  7, '2026-07-30', 424.85),
  (29,  7, '2026-09-30', 424.85),
  (30,  7, '2026-10-30', 424.85),
  (31,  8, '2026-06-12', 285.90),
  (32,  8, '2026-07-12', 285.90),
  (33,  8, '2026-08-12', 11225.50),
  (34,  8, '2026-09-12', 285.90),
  (35,  9, '2026-05-08', 295.10),
  (36,  9, '2026-06-08', 295.10),
  (37,  9, '2026-07-08', 295.10),
  (38,  9, '2026-08-08', 295.10),
  (39,  9, '2026-09-08', 295.10),
  (40,  9, '2026-10-08', 295.10),
  (41,  9, '2026-11-08', 295.10),
  (42, 10, '2022-09-25', 594.20),
  (43, 10, '2022-10-25', 594.20),
  (44, 11, '2026-08-01', 345.60),
  (45, 11, '2026-09-01', 345.60),
  (46, 11, '2026-10-01', 345.60),
  (47, 11, '2026-11-01', 345.60),
  (48, 12, '2026-05-15', 346.20),
  (49, 12, '2026-07-15', 346.20),
  (50, 12, '2026-09-15', 346.20),
  (51, 12, '2026-10-15', 346.20);
