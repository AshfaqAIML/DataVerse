-- ============================================================================
-- NORTHGATE UNIVERSITY — ACADEMIC SAMPLE DATABASE
-- A small private university. Departments employ professors and enroll
-- students; courses belong to departments, have prerequisites (a recursive
-- structure), and students take courses across terms with grades.
-- Designed edge cases:
--   * course_prerequisites is a self-referencing many-to-many structure
--     (recursive CTE lessons: "which courses unlock CS 340?")
--   * in-progress enrollments have grade NULL (current 2026F term)
--   * freshmen have gpa NULL (no grades yet)
--   * professors teaching in a different department than their own
--   * CS 495 is new for 2026F and has zero enrollments so far
--   * a student who retook a course in a later term (grade improvement)
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE departments (
  dept_id INT PRIMARY KEY,
  code    TEXT NOT NULL UNIQUE,
  name    TEXT NOT NULL,
  building TEXT NOT NULL,
  budget  NUMERIC(12,2) NOT NULL
);

INSERT INTO departments (dept_id, code, name, building, budget) VALUES
  (1, 'CS',   'Computer Science',   'Turing Hall',    2450000.00),
  (2, 'MATH', 'Mathematics',        'Noether Hall',   1810000.00),
  (3, 'PHYS', 'Physics',            'Fermi Hall',     1990000.00),
  (4, 'BIO',  'Biology',            'Darwin Hall',    2100000.00),
  (5, 'ECON', 'Economics',          'Smith Hall',     1750000.00),
  (6, 'HIST', 'History',            'Herodotus Hall',  980000.00);

CREATE TABLE professors (
  prof_id     INT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  dept_id     INT NOT NULL REFERENCES departments(dept_id),
  email       TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL CHECK (title IN ('assistant','associate','full')),
  hire_date   DATE NOT NULL,
  salary      NUMERIC(10,2) NOT NULL
);

INSERT INTO professors (prof_id, first_name, last_name, dept_id, email, title, hire_date, salary) VALUES
  ( 1, 'Elena',   'Volkova',  1, 'e.volkova@northgate.edu',  'full',      '2008-08-15', 152000.00),
  ( 2, 'Marcus',  'Feld',     1, 'm.feld@northgate.edu',     'associate',  '2015-01-10', 128000.00),
  ( 3, 'Jennifer','Okafor',   1, 'j.okafor@northgate.edu',   'assistant',  '2021-08-20', 104000.00),
  ( 4, 'Stefan',  'Brandt',   2, 's.brandt@northgate.edu',   'full',      '2005-02-01', 158000.00),
  ( 5, 'Anika',   'Rao',      2, 'a.rao@northgate.edu',      'associate',  '2017-09-01', 126000.00),
  ( 6, 'Tomas',   'Lindqvist',3, 't.lindqvist@northgate.edu','full',      '2010-08-25', 149000.00),
  ( 7, 'Rosa',    'Delgado',  3, 'r.delgado@northgate.edu',  'assistant',  '2019-01-15', 101000.00),
  ( 8, 'Kenji',   'Watanabe', 4, 'k.watanabe@northgate.edu', 'associate',  '2014-03-01', 131000.00),
  ( 9, 'Fatima',  'Haddad',   5, 'f.haddad@northgate.edu',   'full',      '2012-08-10', 145000.00),
  (10, 'Gordon',  'Blackwood',5, 'g.blackwood@northgate.edu','assistant',  '2022-01-05',  98000.00),
  (11, 'Isabel',  'Ferreira', 6, 'i.ferreira@northgate.edu', 'associate',  '2016-08-20', 119000.00),
  (12, 'Cheng',   'Liu',      6, 'c.liu@northgate.edu',      'assistant',  '2023-01-10',  95000.00);

CREATE TABLE students (
  student_id       INT PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  major_dept_id    INT NOT NULL REFERENCES departments(dept_id),
  enrollment_year  INT NOT NULL CHECK (enrollment_year BETWEEN 2020 AND 2026),
  gpa              NUMERIC(3,2) CHECK (gpa BETWEEN 0.00 AND 4.00),
  city             TEXT NOT NULL
);

INSERT INTO students (student_id, first_name, last_name, email, major_dept_id, enrollment_year, gpa, city) VALUES
  ( 1, 'Jonah',   'Reyes',      'j.reyes@northgate.edu',     1, 2020, 3.65, 'Northgate'),
  ( 2, 'Alice',   'Bennett',    'a.bennett@northgate.edu',   1, 2021, 3.82, 'Riverside'),
  ( 3, 'Dev',     'Malhotra',   'd.malhotra@northgate.edu',  1, 2022, 3.41, 'Northgate'),
  ( 4, 'Sophie',  'Laurent',    's.laurent@northgate.edu',   2, 2021, 3.90, 'Fairview'),
  ( 5, 'Omar',    'Haddadi',    'o.haddadi@northgate.edu',   1, 2023, 3.12, 'Riverside'),
  ( 6, 'Grace',   'Sullivan',   'g.sullivan@northgate.edu',  3, 2022, 3.58, 'Northgate'),
  ( 7, 'Ken',     'Ishikawa',   'k.ishikawa@northgate.edu',  2, 2020, 3.05, 'Lakewood'),
  ( 8, 'Mila',    'Novak',      'm.novak@northgate.edu',     4, 2023, 3.75, 'Fairview'),
  ( 9, 'Tobias',  'Fischer',    't.fischer@northgate.edu',   3, 2024, 2.98, 'Northgate'),
  (10, 'Leah',    'Brennan',    'l.brennan@northgate.edu',   5, 2022, 3.47, 'Riverside'),
  (11, 'Adrian',  'Costa',      'a.costa@northgate.edu',     1, 2024, 3.20, 'Northgate'),
  (12, 'Nadia',   'Rahman',     'n.rahman@northgate.edu',    5, 2023, 3.68, 'Lakewood'),
  (13, 'Felix',   'Steiner',    'f.steiner@northgate.edu',   3, 2021, 3.11, 'Fairview'),
  (14, 'Bianca',  'Rossi',      'b.rossi@northgate.edu',     4, 2022, 3.33, 'Northgate'),
  (15, 'Hugo',    'Andersen',   'h.andersen@northgate.edu',  4, 2025, NULL, 'Riverside'),
  (16, 'Talia',   'Mizrahi',    't.mizrahi@northgate.edu',   1, 2025, NULL, 'Northgate'),
  (17, 'Peter',   'Kovacs',     'p.kovacs@northgate.edu',    2, 2025, NULL, 'Lakewood'),
  (18, 'Ingrid',  'Sorensen',   'i.sorensen@northgate.edu',  6, 2024, 3.28, 'Fairview'),
  (19, 'Marcus',  'Diallo',     'm.diallo@northgate.edu',    6, 2023, 3.52, 'Northgate'),
  (20, 'Yuki',    'Ono',        'y.ono@northgate.edu',       2, 2026, NULL, 'Northgate'),
  (21, 'Clara',   'Duarte',     'c.duarte@northgate.edu',    6, 2024, 3.61, 'Riverside'),
  (22, 'Ravi',    'Patel',      'r.patel@northgate.edu',     5, 2026, NULL, 'Fairview');

CREATE TABLE courses (
  course_id INT PRIMARY KEY,
  dept_id   INT NOT NULL REFERENCES departments(dept_id),
  code      TEXT NOT NULL UNIQUE,
  title     TEXT NOT NULL,
  credits   INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
  capacity  INT NOT NULL,
  prof_id   INT NOT NULL REFERENCES professors(prof_id)
);

INSERT INTO courses (course_id, dept_id, code, title, credits, capacity, prof_id) VALUES
  ( 1, 1, 'CS 101', 'Introduction to Programming',      4, 120, 3),
  ( 2, 1, 'CS 201', 'Data Structures',                  4,  90, 2),
  ( 3, 1, 'CS 220', 'Computer Systems',                 3,  80, 2),
  ( 4, 1, 'CS 301', 'Databases',                        4,  70, 1),
  ( 5, 1, 'CS 340', 'Algorithms',                       4,  60, 1),
  ( 6, 1, 'CS 410', 'Machine Learning',                 4,  50, 3),
  ( 7, 2, 'MATH 101','Calculus I',                      4, 150, 5),
  ( 8, 2, 'MATH 201','Linear Algebra',                  4, 100, 4),
  ( 9, 2, 'MATH 310','Probability and Statistics',      4,  80, 5),
  (10, 3, 'PHYS 101','Classical Mechanics',             4, 110, 6),
  (11, 3, 'PHYS 210','Electromagnetism',                4,  70, 6),
  (12, 4, 'BIO 120', 'Cell Biology',                    4,  95, 8),
  (13, 4, 'BIO 310', 'Genetics',                        4,  60, 8),
  (14, 5, 'ECON 101','Principles of Microeconomics',    4, 140, 9),
  (15, 5, 'ECON 210','Statistics for Economists',       4,  85, 10),
  (16, 6, 'HIST 110','World History to 1500',           3, 100, 11),
  (17, 6, 'HIST 240','The Roman Republic',              3,  45, 11),
  (18, 6, 'HIST 320','Historical Research Methods',     4,  30, 12),
  (19, 1, 'CS 495', 'Special Topics: Quantum Computing', 3,  35, 1);

-- A course can require other courses first (self-referencing M:N).
CREATE TABLE course_prerequisites (
  course_id  INT NOT NULL REFERENCES courses(course_id),
  prereq_id  INT NOT NULL REFERENCES courses(course_id),
  PRIMARY KEY (course_id, prereq_id),
  CHECK (course_id <> prereq_id)
);

INSERT INTO course_prerequisites (course_id, prereq_id) VALUES
  ( 2,  1),   -- CS 201 needs CS 101
  ( 3,  1),   -- CS 220 needs CS 101
  ( 4,  2),   -- CS 301 needs CS 201
  ( 4,  3),   -- CS 301 also needs CS 220
  ( 5,  2),   -- CS 340 needs CS 201
  ( 6,  5),   -- CS 410 needs CS 340
  ( 6,  8),   -- CS 410 also needs MATH 201
  ( 8,  7),   -- MATH 201 needs MATH 101
  ( 9,  8),   -- MATH 310 needs MATH 201
  (11, 10),   -- PHYS 210 needs PHYS 101
  (13, 12),   -- BIO 310 needs BIO 120
  (15, 14),   -- ECON 210 needs ECON 101
  (17, 16),   -- HIST 240 needs HIST 110
  (18, 17);   -- HIST 320 needs HIST 240

-- A student takes a course in a term; grade is NULL while in progress.
-- (student, course, term) is unique — retakes happen in a later term.
CREATE TABLE enrollments (
  student_id INT NOT NULL REFERENCES students(student_id),
  course_id  INT NOT NULL REFERENCES courses(course_id),
  term       TEXT NOT NULL CHECK (term ~ '^(20[12][0-9])(F|S)$'),
  grade      TEXT CHECK (grade IN ('A','B','C','D','F')),
  PRIMARY KEY (student_id, course_id, term)
);

INSERT INTO enrollments (student_id, course_id, term, grade) VALUES
  ( 1,  1, '2020F', 'A'), ( 1,  2, '2021S', 'A'), ( 1,  4, '2022F', 'B'),
  ( 1,  5, '2023S', 'B'),
  ( 2,  1, '2021F', 'A'), ( 2,  2, '2022S', 'A'), ( 2,  3, '2022F', 'A'),
  ( 2,  4, '2023F', 'A'), ( 2,  6, '2024F', 'A'),
  ( 3,  1, '2022F', 'B'), ( 3,  2, '2023S', 'B'), ( 3,  3, '2023F', 'C'),
  ( 3,  5, '2024F', 'B'),
  ( 4,  7, '2021F', 'A'), ( 4,  8, '2022S', 'A'), ( 4,  9, '2023S', 'A'),
  ( 5,  1, '2023F', 'B'), ( 5,  2, '2024S', 'C'), ( 5,  3, '2024F', 'B'),
  ( 5,  4, '2025F', NULL),
  ( 6, 10, '2022F', 'A'), ( 6, 11, '2023S', 'B'), ( 6,  7, '2024F', 'B'),
  ( 7,  7, '2020F', 'B'), ( 7,  8, '2021S', 'B'), ( 7,  9, '2022F', 'C'),
  ( 8, 12, '2023F', 'A'), ( 8, 13, '2025S', 'A'),
  ( 9, 10, '2024F', 'C'), ( 9,  7, '2025S', 'B'),
  (10, 14, '2022F', 'A'), (10, 15, '2023F', 'B'), (10,  9, '2025S', 'B'),
  (11,  1, '2024F', 'B'), (11,  2, '2025S', 'B'), (11,  5, '2025F', NULL),
  (12, 14, '2023F', 'A'), (12, 15, '2024F', 'A'), (12,  9, '2025F', 'A'),
  (13, 10, '2021F', 'B'), (13, 11, '2022S', 'C'), (13,  7, '2023F', 'B'),
  (14, 12, '2022F', 'B'), (14, 13, '2024S', 'B'),
  (15, 12, '2025F', 'B'),
  (16,  1, '2025F', 'A'), (16,  7, '2026S', 'B'),
  (17,  7, '2025F', 'C'),
  (18, 16, '2024F', 'A'), (18, 17, '2025F', 'A'), (18, 18, '2026F', NULL),
  (19, 16, '2023F', 'B'), (19, 17, '2025S', 'B'),
  (20,  7, '2026F', NULL),
  (21, 16, '2024F', 'A'), (21, 17, '2025F', 'B'), (21, 18, '2026F', NULL),
  (22, 14, '2026F', NULL),
  ( 3,  5, '2025S', 'A'),  -- Dev retook CS 340 and improved B -> A
  ( 5,  2, '2025S', 'B'),  -- Omar retook CS 201 and improved C -> B
  ( 9, 10, '2025S', 'B'),  -- Tobias retook PHYS 101, C -> B
  (14, 12, '2023F', 'A'),  -- Bianca retook BIO 120, B -> A
  ( 1,  6, '2025S', 'A');  -- Jonah finished the ML track late
