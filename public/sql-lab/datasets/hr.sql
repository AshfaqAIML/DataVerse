-- ============================================================================
-- HELIOSWORKS — EMPLOYEE MANAGEMENT SAMPLE DATABASE
-- A 28-person technology company. The heart of it is the org chart:
-- employees report to employees (manager_id is a self-reference; the CEO
-- has NULL), with salary history, projects, and review cycles around it.
-- Designed edge cases:
--   * manager_id self-reference: CEO (NULL), VPs, managers, staff — 4 levels
--   * two former employees (terminated NOT NULL) still in the table
--   * salary history with multiple raises for some employees (LAG lessons)
--   * projects with NULL end_date still running
--   * 100% allocation edge: an employee on two projects at once (M:N)
--   * the Data department is brand new with a single hire (employee 28)
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE departments (
  dept_id  INT PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  budget   NUMERIC(12,2) NOT NULL
);

INSERT INTO departments (dept_id, name, location, budget) VALUES
  (1, 'Executive',        'New York',     450000.00),
  (2, 'Engineering',      'New York',    3800000.00),
  (3, 'Product',          'New York',    1650000.00),
  (4, 'Sales',            'Chicago',     2400000.00),
  (5, 'Marketing',        'Remote',      1300000.00),
  (6, 'Customer Success', 'Austin',       890000.00),
  (7, 'People Ops',       'New York',     620000.00),
  (8, 'Data',             'Remote',       400000.00);

CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  dept_id     INT NOT NULL REFERENCES departments(dept_id),
  job_title   TEXT NOT NULL,
  manager_id  INT REFERENCES employees(employee_id),
  hire_date   DATE NOT NULL,
  salary      NUMERIC(10,2) NOT NULL CHECK (salary > 0),
  terminated  DATE,
  is_remote   BOOLEAN NOT NULL DEFAULT false
);

-- Org chart: 1 -> CEO (NULL manager)
--   2 (VP Eng) 3 (VP Sales) 4 (VP Product) 5 (Head of People) report to 1
--   Engineers/reporters report to 2/3/4/5; some depth-3 under 2.
INSERT INTO employees (employee_id, first_name, last_name, email, dept_id, job_title, manager_id, hire_date, salary, terminated, is_remote) VALUES
  ( 1, 'Amara',    'Osei',        'amara.osei@heliosworks.example',       1, 'Chief Executive Officer',    NULL, '2017-01-09', 385000.00, NULL, false),
  ( 2, 'Daniel',   'Kramer',      'daniel.kramer@heliosworks.example',    2, 'VP of Engineering',          1, '2018-03-12', 245000.00, NULL, false),
  ( 3, 'Sofia',    'Mancini',     'sofia.mancini@heliosworks.example',    4, 'VP of Sales',                1, '2019-06-17', 232000.00, NULL, false),
  ( 4, 'Priya',    'Nair',        'priya.nair@heliosworks.example',       3, 'VP of Product',              1, '2020-02-24', 228000.00, NULL, true),
  ( 5, 'Gerald',   'Weiss',       'gerald.weiss@heliosworks.example',     7, 'Head of People',             1, '2018-09-03', 175000.00, NULL, false),
  ( 6, 'Lena',     'Hoffman',     'lena.hoffman@heliosworks.example',     2, 'Engineering Manager',        2, '2019-04-15', 198000.00, NULL, false),
  ( 7, 'Marcus',   'Tran',        'marcus.tran@heliosworks.example',      2, 'Engineering Manager',        2, '2020-07-20', 192000.00, NULL, true),
  ( 8, 'Elena',    'Petrova',     'elena.petrova@heliosworks.example',    2, 'Senior Backend Engineer',    6, '2019-11-04', 168000.00, NULL, false),
  ( 9, 'James',    'Okoro',       'james.okoro@heliosworks.example',      2, 'Senior Backend Engineer',    6, '2021-01-18', 162000.00, NULL, true),
  (10, 'Aisha',    'Rahman',      'aisha.rahman@heliosworks.example',     2, 'Backend Engineer',           6, '2022-05-09', 134000.00, NULL, false),
  (11, 'Tom',      'Lindqvist',   'tom.lindqvist@heliosworks.example',    2, 'Backend Engineer',           6, '2023-02-13', 128000.00, NULL, true),
  (12, 'Grace',    'Park',        'grace.park@heliosworks.example',       2, 'Senior Frontend Engineer',   7, '2020-09-07', 158000.00, NULL, false),
  (13, 'Noah',     'Feldman',     'noah.feldman@heliosworks.example',     2, 'Frontend Engineer',          7, '2022-08-22', 126000.00, NULL, true),
  (14, 'Ingrid',   'Sorensen',    'ingrid.sorensen@heliosworks.example',  2, 'DevOps Engineer',            7, '2021-06-14', 149000.00, NULL, false),
  (15, 'Diego',    'Fuentes',     'diego.fuentes@heliosworks.example',    2, 'QA Engineer',                7, '2023-09-05', 104000.00, NULL, false),
  (16, 'Yuki',     'Tanaka',     'yuki.tanaka@heliosworks.example',       2, 'QA Engineer',                7, '2024-01-08',  98000.00, NULL, true),
  (17, 'Robert',   'McAllister',  'robert.mcallister@heliosworks.example',3, 'Principal Product Manager',  4, '2019-08-26', 186000.00, NULL, false),
  (18, 'Chloe',    'Dubois',      'chloe.dubois@heliosworks.example',     3, 'Product Manager',            4, '2021-03-01', 152000.00, NULL, true),
  (19, 'Hassan',   'Al-Farsi',    'hassan.alfarsi@heliosworks.example',   3, 'Product Manager',            4, '2022-11-14', 145000.00, NULL, false),
  (20, 'Maria',    'Gonzalez',    'maria.gonzalez@heliosworks.example',   3, 'Product Designer',          17, '2020-10-19', 138000.00, NULL, true),
  (21, 'Kevin',    'O''Brien',    'kevin.obrien@heliosworks.example',     4, 'Enterprise Account Exec',    3, '2021-09-13', 142000.00, NULL, false),
  (22, 'Nadia',    'Cheung',      'nadia.cheung@heliosworks.example',     4, 'Account Executive',          3, '2022-04-11', 118000.00, NULL, false),
  (23, 'Victor',   'Adeyemi',     'victor.adeyemi@heliosworks.example',   4, 'Sales Development Rep',     22, '2024-06-03',  82000.00, NULL, true),
  (24, 'Freya',    'Johansson',   'freya.johansson@heliosworks.example',  5, 'Marketing Manager',          1, '2020-05-25', 156000.00, NULL, false),
  (25, 'Omar',     'Haddad',      'omar.haddad@heliosworks.example',      5, 'Content Strategist',        24, '2023-01-30', 108000.00, NULL, true),
  (26, 'Beatrice','Laurent',      'beatrice.laurent@heliosworks.example', 6, 'Customer Success Manager',   1, '2021-11-08', 124000.00, NULL, false),
  (27, 'Sam',      'Whitfield',   'sam.whitfield@heliosworks.example',    6, 'Support Specialist',        26, '2024-03-18',  76000.00, NULL, false),
  (28, 'Tara',     'Singh',       'tara.singh@heliosworks.example',       8, 'Analytics Engineer',         2, '2026-08-10', 141000.00, NULL, true),
  (29, 'Peter',    'Novak',       'peter.novak@heliosworks.example',      2, 'Backend Engineer',           6, '2021-05-10', 130000.00, '2026-06-30', false),
  (30, 'Lucia',    'Moreno',      'lucia.moreno@heliosworks.example',     4, 'Account Executive',          3, '2022-09-26', 115000.00, '2025-12-31', true);

-- Effective-dated salary history. Some employees have multiple raises.
CREATE TABLE salaries (
  employee_id INT NOT NULL REFERENCES employees(employee_id),
  effective   DATE NOT NULL,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  PRIMARY KEY (employee_id, effective)
);

INSERT INTO salaries (employee_id, effective, amount) VALUES
  ( 1, '2017-01-09', 290000.00), ( 1, '2020-01-01', 340000.00), ( 1, '2024-01-01', 385000.00),
  ( 2, '2018-03-12', 205000.00), ( 2, '2021-01-01', 228000.00), ( 2, '2024-07-01', 245000.00),
  ( 3, '2019-06-17', 198000.00), ( 3, '2022-01-01', 215000.00), ( 3, '2025-01-01', 232000.00),
  ( 4, '2020-02-24', 196000.00), ( 4, '2023-01-01', 214000.00), ( 4, '2025-07-01', 228000.00),
  ( 5, '2018-09-03', 152000.00), ( 5, '2023-01-01', 175000.00),
  ( 6, '2019-04-15', 165000.00), ( 6, '2022-01-01', 180000.00), ( 6, '2024-01-01', 198000.00),
  ( 7, '2020-07-20', 168000.00), ( 7, '2023-07-01', 192000.00),
  ( 8, '2019-11-04', 138000.00), ( 8, '2022-07-01', 156000.00), ( 8, '2025-01-01', 168000.00),
  ( 9, '2021-01-18', 135000.00), ( 9, '2024-01-01', 162000.00),
  (10, '2022-05-09', 122000.00), (10, '2025-01-01', 134000.00),
  (11, '2023-02-13', 120000.00), (11, '2025-07-01', 128000.00),
  (12, '2020-09-07', 132000.00), (12, '2023-01-01', 148000.00), (12, '2025-07-01', 158000.00),
  (13, '2022-08-22', 116000.00), (13, '2024-07-01', 126000.00),
  (14, '2021-06-14', 128000.00), (14, '2024-01-01', 149000.00),
  (15, '2023-09-05',  98000.00), (15, '2025-09-01', 104000.00),
  (16, '2024-01-08',  92000.00), (16, '2025-09-01',  98000.00),
  (17, '2019-08-26', 158000.00), (17, '2022-07-01', 175000.00), (17, '2025-01-01', 186000.00),
  (18, '2021-03-01', 132000.00), (18, '2024-01-01', 152000.00),
  (19, '2022-11-14', 130000.00), (19, '2025-07-01', 145000.00),
  (20, '2020-10-19', 118000.00), (20, '2023-07-01', 130000.00), (20, '2025-07-01', 138000.00),
  (21, '2021-09-13', 122000.00), (21, '2024-07-01', 142000.00),
  (22, '2022-04-11', 105000.00), (22, '2025-01-01', 118000.00),
  (23, '2024-06-03',  76000.00), (23, '2025-06-01',  82000.00),
  (24, '2020-05-25', 134000.00), (24, '2024-01-01', 156000.00),
  (25, '2023-01-30',  98000.00), (25, '2025-01-01', 108000.00),
  (26, '2021-11-08', 112000.00), (26, '2024-07-01', 124000.00),
  (27, '2024-03-18',  72000.00), (27, '2025-03-01',  76000.00),
  (28, '2026-08-10', 141000.00),
  (29, '2021-05-10', 118000.00), (29, '2024-01-01', 130000.00),
  (30, '2022-09-26', 104000.00), (30, '2024-07-01', 115000.00);

CREATE TABLE projects (
  project_id  INT PRIMARY KEY,
  name        TEXT NOT NULL,
  dept_id     INT NOT NULL REFERENCES departments(dept_id),
  start_date  DATE NOT NULL,
  end_date    DATE,
  budget      NUMERIC(12,2) NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('planned','active','done','cancelled'))
);

INSERT INTO projects (project_id, name, dept_id, start_date, end_date, budget, status) VALUES
  (1, 'Checkout Rewrite',         2, '2025-01-06', '2025-11-21', 850000.00, 'done'),
  (2, 'Mobile App v2',            2, '2025-03-10', '2026-02-27', 1200000.00, 'done'),
  (3, 'Billing Platform Migration', 2, '2026-01-05', NULL,        950000.00, 'active'),
  (4, 'Search Relevance Tuning',  2, '2026-04-01', NULL,          320000.00, 'active'),
  (5, 'Self-Serve Onboarding',    3, '2025-09-01', '2026-06-30',  410000.00, 'active'),
  (6, 'Pricing Experiments',      3, '2026-02-16', NULL,          180000.00, 'active'),
  (7, 'EMEA Expansion',           4, '2025-06-02', '2026-01-30',  640000.00, 'done'),
  (8, 'Brand Refresh 2026',       5, '2026-03-02', NULL,          240000.00, 'active'),
  (9, 'Data Warehouse Revival',   8, '2026-07-13', NULL,          280000.00, 'active'),
  (10, 'Partner Marketplace',     3, '2026-11-02', NULL,           520000.00, 'planned');

-- M:N with a role and allocation percentage.
CREATE TABLE employee_projects (
  employee_id    INT NOT NULL REFERENCES employees(employee_id),
  project_id     INT NOT NULL REFERENCES projects(project_id),
  role           TEXT NOT NULL CHECK (role IN ('lead','contributor','reviewer')),
  allocation_pct INT NOT NULL CHECK (allocation_pct BETWEEN 10 AND 100),
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO employee_projects (employee_id, project_id, role, allocation_pct) VALUES
  ( 2, 1, 'lead',        30),
  ( 6, 1, 'lead',        60),
  ( 8, 1, 'contributor', 80),
  ( 9, 1, 'contributor', 70),
  (10, 1, 'contributor', 50),
  (14, 1, 'contributor', 40),
  (15, 1, 'reviewer',    30),
  ( 6, 2, 'lead',        40),
  (12, 2, 'lead',        60),
  (13, 2, 'contributor', 80),
  (16, 2, 'reviewer',    50),
  ( 2, 3, 'lead',        40),
  ( 8, 3, 'contributor', 60),
  (11, 3, 'contributor', 90),
  (14, 3, 'contributor', 50),
  ( 9, 4, 'lead',        60),
  (10, 4, 'contributor', 40),
  (17, 5, 'lead',        50),
  (18, 5, 'contributor', 60),
  (20, 5, 'contributor', 40),
  (19, 6, 'lead',        50),
  (18, 6, 'contributor', 30),
  ( 3, 7, 'lead',        40),
  (21, 7, 'contributor', 70),
  (22, 7, 'contributor', 60),
  (24, 8, 'lead',        50),
  (25, 8, 'contributor', 60),
  (28, 9, 'lead',        80),
  ( 9, 9, 'contributor', 20),
  ( 4, 10, 'lead',       30),
  (17, 10, 'contributor',40);

CREATE TABLE performance_reviews (
  review_id    INT PRIMARY KEY,
  employee_id  INT NOT NULL REFERENCES employees(employee_id),
  review_cycle TEXT NOT NULL,
  rating       NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  reviewer_id  INT NOT NULL REFERENCES employees(employee_id),
  comments     TEXT
);

INSERT INTO performance_reviews (review_id, employee_id, review_cycle, rating, reviewer_id, comments) VALUES
  ( 1,  8, '2025-H1', 4.5,  6, 'Exceptional technical depth; anchor of the checkout rewrite.'),
  ( 2,  9, '2025-H1', 4.0,  6, 'Strong delivery; growing mentorship skills.'),
  ( 3, 10, '2025-H1', 3.5,  6, 'Solid contributor; needs more ownership in ambiguous tasks.'),
  ( 4, 11, '2025-H1', 3.0,  6, 'Met expectations; watch latency on code reviews.'),
  ( 5, 12, '2025-H1', 4.5,  7, 'Design system work lifted every squad velocity.'),
  ( 6, 13, '2025-H1', 3.5,  7, 'Good execution; occasionally under-tests edge cases.'),
  ( 7, 14, '2025-H1', 4.0,  7, 'Reliable infrastructure; led the zero-downtime deploy work.'),
  ( 8, 15, '2025-H1', 3.5,  7, 'Testing discipline improving steadily.'),
  ( 9, 16, '2025-H1', 3.0,  7, 'Onboarding well; ask for help sooner.'),
  (10, 17, '2025-H1', 4.5,  4, 'Clear product vision; the onboarding revamp shows it.'),
  (11, 18, '2025-H1', 4.0,  4, 'Strong discovery instincts.'),
  (12, 19, '2025-H1', 3.5,  4, 'Good ownership of the pricing backlog.'),
  (13, 20, '2025-H1', 4.0, 17, 'Prototypes keep winning user tests.'),
  (14, 21, '2025-H1', 4.5,  3, 'Broke the EMEA enterprise record.'),
  (15, 22, '2025-H1', 3.5,  3, 'Consistent closer; pipeline hygiene improved.'),
  (16, 23, '2025-H1', 3.0, 22, 'First full cycle; learning the motion.'),
  (17, 25, '2025-H1', 4.0, 24, 'Content engine is now a real acquisition channel.'),
  (18, 27, '2025-H1', 3.5, 26, 'CSAT handling strong for tenure.'),
  (19,  8, '2025-H2', 4.5,  6, 'Continued excellence; now leading billing migration work.'),
  (20,  9, '2025-H2', 4.0,  6, 'Delivered search relevance wins.'),
  (21, 10, '2025-H2', 4.0,  6, 'Ownership visibly grew this half.'),
  (22, 11, '2025-H2', 3.5,  6, 'Latency fixed; quality up.'),
  (23, 12, '2025-H2', 5.0,  7, 'Promoted scope; platform-level impact.'),
  (24, 13, '2025-H2', 4.0,  7, 'Shipped the new mobile design language.'),
  (25, 14, '2025-H2', 4.0,  7, 'Migration automation saved weeks.'),
  (26, 15, '2025-H2', 4.0,  7, 'Test coverage at all-time high.'),
  (27, 16, '2025-H2', 3.5,  7, 'Steady; ready for more complexity.'),
  (28, 18, '2025-H2', 4.5,  4, 'Onboarding flow conversion +18 percent.'),
  (29, 19, '2025-H2', 4.0,  4, 'Pricing experiments matured.'),
  (30, 21, '2025-H2', 4.5,  3, 'Top enterprise revenue again.'),
  (31, 22, '2025-H2', 4.0,  3, 'Strong quarter; mentoring SDRs.'),
  (32, 23, '2025-H2', 3.5, 22, 'Pipeline generation doubled.'),
  (33,  6, '2025-H2', 4.5,  2, 'Ran two major releases without drama.'),
  (34, 26, '2025-H2', 4.0,  1, 'Renewals at record high.'),
  (35, 28, '2026-H1', 4.0,  2, 'Warehouse revival ahead of schedule for a new hire.'),
  (36,  7, '2025-H2', 4.0,  2, 'Mobile v2 shipped on time.');
