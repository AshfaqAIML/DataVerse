-- ============================================================================
-- ST. MARLOWE GENERAL — HOSPITAL SAMPLE DATABASE
-- A mid-sized city hospital. Patients are admitted to departments under
-- doctors, receive prescriptions and lab tests, and are billed on
-- discharge. Designed edge cases:
--   * 3 patients currently admitted (discharged_at NULL, bill_total NULL)
--   * repeat admissions (same patient admitted more than once)
--   * one readmission within 30 days of discharge (case-study material)
--   * doctors with no admissions yet (new hires)
--   * abnormal vs normal lab results for HAVING / percentage exercises
--   * prescriptions still ongoing (end_date NULL)
-- ============================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE departments (
  dept_id  INT PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  floor    INT NOT NULL,
  phone    TEXT
);

INSERT INTO departments (dept_id, name, floor, phone) VALUES
  (1, 'Cardiology',      3, 'ext. 3010'),
  (2, 'Neurology',       4, 'ext. 4010'),
  (3, 'Pediatrics',      2, 'ext. 2010'),
  (4, 'Orthopedics',     1, 'ext. 1010'),
  (5, 'Emergency',       0, NULL),
  (6, 'General Surgery', 5, 'ext. 5010');

CREATE TABLE doctors (
  doctor_id     INT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  dept_id       INT NOT NULL REFERENCES departments(dept_id),
  specialization TEXT NOT NULL,
  hire_date     DATE NOT NULL,
  salary        NUMERIC(10,2) NOT NULL CHECK (salary > 0),
  on_call       BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO doctors (doctor_id, first_name, last_name, dept_id, specialization, hire_date, salary, on_call) VALUES
  ( 1, 'Abigail', 'Turner',    1, 'Interventional cardiology', '2015-03-02', 289000.00, false),
  ( 2, 'Rahul',   'Mehta',     1, 'Heart failure',             '2019-07-15', 246000.00, true),
  ( 3, 'Clara',   'Nyberg',    2, 'Epilepsy',                  '2017-01-09', 251000.00, false),
  ( 4, 'Samuel',  'Adeyemi',   2, 'Stroke care',               '2021-02-22', 218000.00, true),
  ( 5, 'Isabelle','Moreau',    3, 'Neonatal care',             '2016-09-05', 233000.00, false),
  ( 6, 'Daniel',  'Park',      3, 'Pediatric asthma',          '2020-11-30', 207000.00, false),
  ( 7, 'Gloria',  'Hernandez', 4, 'Sports injuries',           '2014-05-19', 272000.00, false),
  ( 8, 'Yusuf',   'Demir',     4, 'Spine surgery',             '2018-08-13', 264000.00, true),
  ( 9, 'Patrick', 'O''Neill',  5, 'Trauma',                    '2015-10-26', 295000.00, true),
  (10, 'Mei-Lin', 'Chen',      5, 'Emergency medicine',        '2022-04-11', 214000.00, false),
  (11, 'Robert',  'Kowalczyk', 6, 'Minimally invasive surgery','2013-06-03', 301000.00, false),
  (12, 'Fatima',  'Al-Rashid', 6, 'Colorectal surgery',        '2026-09-01', 225000.00, false);

CREATE TABLE patients (
  patient_id INT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  dob        DATE NOT NULL,
  gender     TEXT NOT NULL CHECK (gender IN ('F','M','X')),
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city       TEXT NOT NULL,
  phone      TEXT
);

INSERT INTO patients (patient_id, first_name, last_name, dob, gender, blood_type, city, phone) VALUES
  ( 1, 'Margaret', 'Boyle',     '1948-02-11', 'F', 'A+',  'Springfield', '555-0101'),
  ( 2, 'Harold',   'Webb',      '1955-07-30', 'M', 'O+',  'Springfield', '555-0102'),
  ( 3, 'Lucy',     'Ramirez',   '1990-12-03', 'F', 'B+',  'Riverton',    '555-0103'),
  ( 4, 'Arthur',   'Pennington','1962-04-17', 'M', 'AB-', 'Springfield', '555-0104'),
  ( 5, 'Rose',     'Abernathy', '1939-09-25', 'F', 'O-',  'Fairview',    NULL),
  ( 6, 'Douglas',  'Kimura',    '1971-01-08', 'M', 'A-',  'Riverton',    '555-0106'),
  ( 7, 'Beatrice', 'Lavigne',   '1957-11-19', 'F', 'A+',  'Springfield', '555-0107'),
  ( 8, 'Walter',   'Osei',      '1944-06-02', 'M', 'O+',  'Lakewood',    '555-0108'),
  ( 9, 'Fiona',    'Calloway',  '1983-03-27', 'F', 'B-',  'Springfield', '555-0109'),
  (10, 'Simon',    'Vasquez',   '1978-08-14', 'M', 'O+',  'Riverton',    '555-0110'),
  (11, 'Edith',    'Barlow',    '1941-12-29', 'F', 'AB+', 'Fairview',    '555-0111'),
  (12, 'George',   'Fitzgerald','1959-05-21', 'M', 'A+',  'Springfield', '555-0112'),
  (13, 'Hazel',    'Nakamura',  '1968-10-05', 'F', 'O+',  'Lakewood',    '555-0113'),
  (14, 'Martin',   'Delacroix', '1975-02-18', 'M', 'B+',  'Riverton',    NULL),
  (15, 'Iris',     'Thornbury', '1952-07-09', 'F', 'A-',  'Springfield', '555-0115'),
  (16, 'Bernard',  'Silverstein','1966-11-11','M', 'O-',  'Springfield', '555-0116'),
  (17, 'Celia',    'Fontaine',  '1988-04-30', 'F', 'A+',  'Lakewood',    '555-0117'),
  (18, 'Oscar',    'Hartley',   '1946-09-07', 'M', 'B+',  'Fairview',    '555-0118'),
  (19, 'Nora',     'Ellsworth', '1995-06-23', 'F', 'O+',  'Riverton',    '555-0119'),
  (20, 'Felix',    'Mendoza',   '2001-01-16', 'M', 'A+',  'Springfield', '555-0120');

CREATE TABLE admissions (
  admission_id  INT PRIMARY KEY,
  patient_id    INT NOT NULL REFERENCES patients(patient_id),
  doctor_id     INT NOT NULL REFERENCES doctors(doctor_id),
  dept_id       INT NOT NULL REFERENCES departments(dept_id),
  admitted_at   TIMESTAMP NOT NULL,
  discharged_at TIMESTAMP,
  room          TEXT NOT NULL,
  diagnosis     TEXT NOT NULL,
  bill_total    NUMERIC(10,2) CHECK (bill_total IS NULL OR bill_total >= 0)
);

INSERT INTO admissions (admission_id, patient_id, doctor_id, dept_id, admitted_at, discharged_at, room, diagnosis, bill_total) VALUES
  ( 1,  1, 1, 1, '2024-05-02 08:40', '2024-05-06 14:15', '301', 'Atrial fibrillation',        14850.00),
  ( 2,  2, 9, 5, '2024-05-10 22:05', '2024-05-11 10:30', 'E-4', 'Concussion',                 3100.00),
  ( 3,  3, 6, 3, '2024-06-18 16:20', '2024-06-20 11:45', '208', 'Acute asthma attack',        4200.00),
  ( 4,  4, 3, 2, '2024-07-01 09:10', '2024-07-08 17:00', '401', 'Migraine with aura',         9750.00),
  ( 5,  5, 1, 1, '2024-08-12 07:55', '2024-08-19 12:10', '305', 'Congestive heart failure',  19300.00),
  ( 6,  6, 8, 4, '2024-09-05 13:35', '2024-09-09 09:50', '112', 'Herniated disc',            16700.00),
  ( 7,  7, 2, 1, '2024-10-21 10:15', '2024-10-24 15:30', '302', 'Angina pectoris',            8600.00),
  ( 8,  8, 4, 2, '2024-11-30 19:45', '2024-12-07 13:20', '403', 'Ischemic stroke',           28400.00),
  ( 9,  9, 10, 5, '2025-01-14 03:30', '2025-01-14 12:00', 'E-2', 'Ankle sprain',              1800.00),
  (10, 10, 7, 4, '2025-02-08 08:00', '2025-02-12 16:40', '110', 'Torn rotator cuff',         13900.00),
  (11,  1, 1, 1, '2025-03-19 11:25', '2025-03-23 10:05', '301', 'Atrial fibrillation',       12100.00),
  (12, 11, 11, 6, '2025-04-02 07:30', '2025-04-05 14:55', '501', 'Gallbladder removal',       18400.00),
  (13, 12, 9, 5, '2025-05-17 21:15', '2025-05-18 08:45', 'E-5', 'Food poisoning',             2450.00),
  (14, 13, 2, 1, '2025-06-09 10:50', '2025-06-14 12:30', '304', 'Cardiac arrhythmia',        15250.00),
  (15, 14, 3, 2, '2025-07-23 15:05', '2025-07-28 11:15', '405', 'Epilepsy monitoring',       16800.00),
  (16, 15, 5, 3, '2025-08-04 09:40', '2025-08-06 16:20', '205', 'Bronchiolitis (infant)',     6300.00),
  (17,  8, 4, 2, '2025-08-29 08:30', '2025-09-03 13:45', '403', 'Transient ischemic attack',  17250.00),
  (18, 16, 8, 4, '2025-09-15 14:25', '2025-09-18 10:10', '114', 'Spinal stenosis',           15350.00),
  (19, 17, 10, 5, '2025-10-02 23:50', '2025-10-03 07:30', 'E-1', 'Laceration repair',          990.00),
  (20, 18, 11, 6, '2025-10-27 08:15', '2025-10-30 15:00', '502', 'Appendectomy',              12750.00),
  (21,  2, 9, 5, '2025-11-08 20:40', '2025-11-09 09:15', 'E-3', 'Concussion',                 2950.00),
  (22,  5, 2, 1, '2026-01-13 06:20', '2026-01-21 14:35', '305', 'Heart failure exacerbation', 23150.00),
  (23, 19, 6, 3, '2026-02-25 12:10', '2026-02-27 10:50', '207', 'Asthma flare-up',            5150.00),
  (24,  3, 6, 3, '2026-03-30 15:55', NULL,               '208', 'Asthma and wheezing',         NULL),
  (25, 20, 9, 5, '2026-06-14 17:30', '2026-06-15 08:20', 'E-2', 'Wrist fracture',             2350.00),
  (26,  7, 1, 1, '2026-08-02 09:05', '2026-08-06 13:40', '302', 'Unstable angina',           13850.00),
  (27, 10, 7, 4, '2026-09-19 10:35', NULL,               '111', 'Knee ligament tear',          NULL),
  (28, 11, 11, 6, '2026-10-08 07:45', NULL,               '501', 'Bowel obstruction',          NULL),
  (29, 15, 5, 3, '2026-11-02 14:15', NULL,               '206', 'Pneumonia (pediatric)',       NULL),
  (30,  1, 2, 1, '2025-03-28 09:00', '2025-03-30 12:20', '303', 'Post-op monitoring',         4800.00);

CREATE TABLE prescriptions (
  prescription_id INT PRIMARY KEY,
  admission_id    INT NOT NULL REFERENCES admissions(admission_id),
  medication      TEXT NOT NULL,
  dosage          TEXT NOT NULL,
  frequency       TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE,
  prescribed_by   INT NOT NULL REFERENCES doctors(doctor_id)
);

INSERT INTO prescriptions (prescription_id, admission_id, medication, dosage, frequency, start_date, end_date, prescribed_by) VALUES
  ( 1,  1, 'Warfarin',       '5 mg',   'once daily',     '2024-05-02', '2024-05-06', 1),
  ( 2,  1, 'Metoprolol',     '50 mg',  'twice daily',    '2024-05-02', '2024-06-02', 1),
  ( 3,  2, 'Ibuprofen',      '400 mg', 'every 8 hours',  '2024-05-10', '2024-05-13', 9),
  ( 4,  3, 'Prednisolone',   '20 mg',  'once daily',     '2024-06-18', '2024-06-22', 6),
  ( 5,  3, 'Salbutamol',     '100 mcg','as needed',      '2024-06-18', NULL,         6),
  ( 6,  4, 'Sumatriptan',    '50 mg',  'as needed',      '2024-07-01', '2024-07-15', 3),
  ( 7,  5, 'Furosemide',     '40 mg',  'once daily',     '2024-08-12', '2024-09-12', 1),
  ( 8,  5, 'Lisinopril',     '10 mg',  'once daily',     '2024-08-12', NULL,         1),
  ( 9,  6, 'Oxycodone',      '5 mg',   'every 6 hours',  '2024-09-05', '2024-09-09', 8),
  (10,  7, 'Nitroglycerin',  '0.4 mg', 'as needed',      '2024-10-21', '2024-11-04', 2),
  (11,  8, 'Aspirin',        '81 mg',  'once daily',     '2024-11-30', NULL,         4),
  (12,  8, 'Atorvastatin',   '40 mg',  'once daily',     '2024-11-30', NULL,         4),
  (13,  9, 'Paracetamol',    '500 mg', 'every 6 hours',  '2025-01-14', '2025-01-16', 10),
  (14, 10, 'Diclofenac',     '75 mg',  'twice daily',    '2025-02-08', '2025-02-15', 7),
  (15, 11, 'Warfarin',       '5 mg',   'once daily',     '2025-03-19', '2025-03-23', 1),
  (16, 12, 'Cefazolin',      '1 g',    'every 8 hours',  '2025-04-02', '2025-04-05', 11),
  (17, 13, 'Ondansetron',    '4 mg',   'every 8 hours',  '2025-05-17', '2025-05-18', 9),
  (18, 14, 'Amiodarone',     '200 mg', 'once daily',     '2025-06-09', '2025-06-20', 2),
  (19, 15, 'Levetiracetam',  '500 mg', 'twice daily',    '2025-07-23', NULL,         3),
  (20, 16, 'Salbutamol',     '100 mcg','every 4 hours',  '2025-08-04', '2025-08-07', 5),
  (21, 17, 'Clopidogrel',    '75 mg',  'once daily',     '2025-08-29', '2025-10-01', 4),
  (22, 18, 'Gabapentin',     '300 mg', 'three times daily', '2025-09-15', '2025-09-25', 8),
  (23, 19, 'Paracetamol',    '500 mg', 'as needed',      '2025-10-02', '2025-10-04', 10),
  (24, 20, 'Morphine',       '2 mg',   'every 4 hours',  '2025-10-27', '2025-10-29', 11),
  (25, 21, 'Ibuprofen',      '400 mg', 'every 8 hours',  '2025-11-08', '2025-11-11', 9),
  (26, 22, 'Furosemide',     '80 mg',  'once daily',     '2026-01-13', '2026-02-13', 2),
  (27, 23, 'Prednisolone',   '30 mg',  'once daily',     '2026-02-25', '2026-03-04', 6),
  (28, 24, 'Salbutamol',     '100 mcg','every 4 hours',  '2026-03-30', NULL,         6),
  (29, 25, 'Paracetamol',    '500 mg', 'every 6 hours',  '2026-06-14', '2026-06-17', 9),
  (30, 26, 'Nitroglycerin',  '0.4 mg', 'as needed',      '2026-08-02', '2026-08-10', 1),
  (31, 27, 'Ibuprofen',      '600 mg', 'three times daily', '2026-09-19', NULL,      7),
  (32, 28, 'Ceftriaxone',    '1 g',    'every 12 hours', '2026-10-08', NULL,         11),
  (33, 29, 'Amoxicillin',    '250 mg', 'three times daily', '2026-11-02', NULL,      5),
  (34, 30, 'Enoxaparin',     '40 mg',  'once daily',     '2025-03-28', '2025-03-30', 2);

CREATE TABLE lab_results (
  result_id    INT PRIMARY KEY,
  admission_id INT NOT NULL REFERENCES admissions(admission_id),
  test_name    TEXT NOT NULL,
  result_value NUMERIC(6,2) NOT NULL,
  unit         TEXT NOT NULL,
  is_abnormal  BOOLEAN NOT NULL,
  taken_at     TIMESTAMP NOT NULL
);

INSERT INTO lab_results (result_id, admission_id, test_name, result_value, unit, is_abnormal, taken_at) VALUES
  ( 1,  1, 'INR',             3.80, 'ratio',     true,  '2024-05-02 10:00'),
  ( 2,  1, 'Hemoglobin',     13.10, 'g/dL',      false, '2024-05-02 10:05'),
  ( 3,  2, 'Glucose',       108.00, 'mg/dL',     false, '2024-05-10 23:00'),
  ( 4,  3, 'White blood cell', 9.80, '10^3/uL',  false, '2024-06-18 18:00'),
  ( 5,  3, 'Oxygen saturation', 91.00, 'percent', true, '2024-06-18 18:01'),
  ( 6,  4, 'MRI brain scan',  0.00, 'lesion count', false, '2024-07-01 12:00'),
  ( 7,  5, 'BNP',          1250.00, 'pg/mL',     true,  '2024-08-12 09:30'),
  ( 8,  5, 'Creatinine',      1.90, 'mg/dL',     true,  '2024-08-13 07:00'),
  ( 9,  6, 'ESR',             42.00, 'mm/hr',    true,  '2024-09-05 16:00'),
  (10,  7, 'Troponin I',       0.03, 'ng/mL',    false, '2024-10-21 12:30'),
  (11,  8, 'Glucose',       186.00, 'mg/dL',     true,  '2024-11-30 21:15'),
  (12,  8, 'Hemoglobin',     10.20, 'g/dL',      true,  '2024-12-01 07:00'),
  (13,  9, 'X-ray ankle',     0.00, 'fracture count', false, '2025-01-14 05:30'),
  (14, 10, 'MRI shoulder',    2.00, 'tear grade', true, '2025-02-08 11:00'),
  (15, 11, 'INR',             3.60, 'ratio',     true,  '2025-03-19 13:00'),
  (16, 12, 'White blood cell', 14.20, '10^3/uL', true,  '2025-04-02 10:00'),
  (17, 13, 'Sodium',        134.00, 'mmol/L',    true,  '2025-05-17 22:30'),
  (18, 14, 'Troponin I',      0.02, 'ng/mL',    false, '2025-06-09 12:00'),
  (19, 15, 'EEG abnormality', 7.00, 'spikes/hr', true,  '2025-07-24 09:00'),
  (20, 16, 'Oxygen saturation', 89.00, 'percent', true, '2025-08-04 11:00'),
  (21, 17, 'Creatinine',      1.10, 'mg/dL',    false, '2025-08-29 10:20'),
  (22, 18, 'ESR',             28.00, 'mm/hr',   false, '2025-09-15 16:40'),
  (23, 19, 'White blood cell', 6.10, '10^3/uL', false, '2025-10-03 01:15'),
  (24, 20, 'White blood cell', 15.80, '10^3/uL', true, '2025-10-27 10:00'),
  (25, 21, 'CT head',         0.00, 'bleed count', false, '2025-11-08 21:50'),
  (26, 22, 'BNP',           980.00, 'pg/mL',     true,  '2026-01-13 08:00'),
  (27, 23, 'Oxygen saturation', 93.00, 'percent', true, '2026-02-25 13:00'),
  (28, 24, 'Oxygen saturation', 90.00, 'percent', true, '2026-03-30 17:00'),
  (29, 25, 'X-ray wrist',     1.00, 'fracture count', true, '2026-06-14 18:10'),
  (30, 26, 'Troponin I',      0.05, 'ng/mL',    true,  '2026-08-02 11:00'),
  (31, 27, 'MRI knee',        3.00, 'tear grade', true, '2026-09-19 12:30'),
  (32, 28, 'Lactate',         3.10, 'mmol/L',   true,  '2026-10-08 09:45'),
  (33, 29, 'White blood cell', 17.40, '10^3/uL', true, '2026-11-02 16:00'),
  (34, 30, 'Hemoglobin',     12.90, 'g/dL',    false, '2025-03-28 11:00');
