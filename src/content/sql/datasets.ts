/**
 * SQL Lab dataset registry — metadata for the six sample databases.
 *
 * The SQL itself lives in public/sql-lab/datasets/<id>.sql (the single
 * source of truth, executed by PGlite in the browser worker AND by the
 * Node verifier). This file adds human documentation: what each database
 * is, what each table means, and how the tables relate — used by the
 * schema explorer and the case studies.
 */
import type { DatasetId } from "@/lib/sqlcourse/types";

export interface ColumnDoc {
  name: string;
  note: string;
}

export interface TableDoc {
  name: string;
  purpose: string;
  columns?: ColumnDoc[];
}

export interface RelationDoc {
  from: string;
  to: string;
  kind: "1:1" | "1:N" | "M:N" | "self";
  note: string;
}

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  domain: string;
  blurb: string;
  icon: string;
  tables: TableDoc[];
  relations: RelationDoc[];
}

export const DATASETS: DatasetMeta[] = [
  {
    id: "ecommerce",
    name: "ShopSphere",
    domain: "E-commerce",
    icon: "ShoppingCart",
    blurb:
      "An online gear store: customers, product catalog, orders with line items, one payment per order, and honest (sometimes brutal) product reviews.",
    tables: [
      { name: "categories", purpose: "Product groupings (Laptops, Audio, ...)." },
      {
        name: "customers",
        purpose: "People with accounts. Two have never ordered anything.",
        columns: [{ name: "phone", note: "NULL when the customer opted out" }],
      },
      {
        name: "products",
        purpose: "The catalog with price, stock and average rating.",
        columns: [
          { name: "rating", note: "NULL until enough reviews exist" },
          { name: "price", note: "numeric(10,2) — exact money" },
        ],
      },
      {
        name: "orders",
        purpose: "One row per order; status spans pending to cancelled.",
        columns: [{ name: "total", note: "equals the sum of its order_items" }],
      },
      {
        name: "order_items",
        purpose: "Line items; (order_id, product_id) is the key.",
      },
      {
        name: "payments",
        purpose: "One payment per paid order (UNIQUE order_id = 1:1).",
      },
      { name: "reviews", purpose: "Stars 1-5 left by customers on products." },
    ],
    relations: [
      { from: "orders.customer_id", to: "customers.customer_id", kind: "1:N", note: "A customer places many orders." },
      { from: "order_items.order_id", to: "orders.order_id", kind: "1:N", note: "An order contains many items." },
      { from: "payments.order_id", to: "orders.order_id", kind: "1:1", note: "Exactly one payment per paid order." },
      { from: "reviews.customer_id", to: "customers.customer_id", kind: "M:N", note: "Customers review products." },
      { from: "products.category_id", to: "categories.category_id", kind: "1:N", note: "Products belong to a category." },
    ],
  },
  {
    id: "hospital",
    name: "St. Marlowe General",
    domain: "Hospital",
    icon: "HeartPulse",
    blurb:
      "A city hospital: departments, doctors, patients, admissions (some still open), prescriptions and lab results with abnormal flags.",
    tables: [
      { name: "departments", purpose: "Wards/units with a floor and phone extension." },
      { name: "doctors", purpose: "Clinical staff with specialization and on-call status." },
      { name: "patients", purpose: "People treated at the hospital." },
      {
        name: "admissions",
        purpose: "One row per hospital stay.",
        columns: [
          { name: "discharged_at", note: "NULL while the patient is still admitted" },
          { name: "bill_total", note: "NULL until discharge (final amount unknown)" },
        ],
      },
      {
        name: "prescriptions",
        purpose: "Medications given during an admission.",
        columns: [{ name: "end_date", note: "NULL while the prescription is ongoing" }],
      },
      { name: "lab_results", purpose: "Test values with an abnormal flag." },
    ],
    relations: [
      { from: "admissions.patient_id", to: "patients.patient_id", kind: "1:N", note: "Patients can be admitted repeatedly." },
      { from: "admissions.doctor_id", to: "doctors.doctor_id", kind: "1:N", note: "A doctor oversees many admissions." },
      { from: "prescriptions.admission_id", to: "admissions.admission_id", kind: "1:N", note: "Each stay can have many prescriptions." },
      { from: "lab_results.admission_id", to: "admissions.admission_id", kind: "1:N", note: "Many tests per stay." },
      { from: "doctors.dept_id", to: "departments.dept_id", kind: "1:N", note: "Doctors belong to departments." },
    ],
  },
  {
    id: "university",
    name: "Northgate University",
    domain: "University",
    icon: "GraduationCap",
    blurb:
      "A small university: departments, professors, students, courses with a prerequisite graph, term-by-term enrollments and grades.",
    tables: [
      { name: "departments", purpose: "Academic departments with budgets." },
      { name: "professors", purpose: "Faculty with rank (assistant/associate/full)." },
      {
        name: "students",
        purpose: "Enrolled students.",
        columns: [{ name: "gpa", note: "NULL for freshmen with no graded courses yet" }],
      },
      { name: "courses", purpose: "Catalog with credits, capacity and professor." },
      {
        name: "course_prerequisites",
        purpose: "Which courses unlock which — a recursive graph.",
      },
      {
        name: "enrollments",
        purpose: "Who took what, in which term.",
        columns: [{ name: "grade", note: "NULL while the course is in progress" }],
      },
    ],
    relations: [
      { from: "courses.dept_id", to: "departments.dept_id", kind: "1:N", note: "Courses belong to departments." },
      { from: "enrollments.student_id", to: "students.student_id", kind: "M:N", note: "Students take many courses; courses have many students." },
      { from: "course_prerequisites", to: "courses.course_id", kind: "self", note: "A course points at other courses." },
      { from: "students.major_dept_id", to: "departments.dept_id", kind: "1:N", note: "Students major in a department." },
    ],
  },
  {
    id: "banking",
    name: "Meridian Trust",
    domain: "Banking",
    icon: "Landmark",
    blurb:
      "A regional bank: branches, customers, accounts, a transaction ledger with running balances, and loans with payment histories.",
    tables: [
      { name: "branches", purpose: "Physical locations with total assets." },
      { name: "customers", purpose: "Account holders with a risk rating." },
      {
        name: "accounts",
        purpose: "Checking/savings/business/CD accounts.",
        columns: [{ name: "is_active", note: "false for closed accounts (history remains)" }],
      },
      {
        name: "transactions",
        purpose: "Every account movement.",
        columns: [
          { name: "balance_after", note: "the running balance — window-function gold" },
          { name: "amount", note: "always positive; the type says the direction" },
        ],
      },
      { name: "loans", purpose: "Principal, rate, term, status (active/paid_off/defaulted)." },
      { name: "loan_payments", purpose: "Money actually paid toward loans." },
    ],
    relations: [
      { from: "accounts.customer_id", to: "customers.customer_id", kind: "1:N", note: "One customer can hold several accounts." },
      { from: "transactions.account_id", to: "accounts.account_id", kind: "1:N", note: "Accounts have many transactions." },
      { from: "loans.customer_id", to: "customers.customer_id", kind: "1:N", note: "A customer can have multiple loans." },
      { from: "loan_payments.loan_id", to: "loans.loan_id", kind: "1:N", note: "Payments against a loan." },
      { from: "accounts.branch_id", to: "branches.branch_id", kind: "1:N", note: "Branches hold many accounts." },
    ],
  },
  {
    id: "retail",
    name: "Trailhead Outdoors",
    domain: "Retail chain",
    icon: "Store",
    blurb:
      "A brick-and-mortar outdoor gear chain: stores, suppliers, products with cost and price, per-store inventory, purchase orders and their line items.",
    tables: [
      { name: "stores", purpose: "Five physical stores with size in square feet." },
      { name: "suppliers", purpose: "Who we buy from, and how slow they are." },
      {
        name: "products",
        purpose: "Gear with cost and retail price.",
        columns: [{ name: "cost", note: "what we pay the supplier" }],
      },
      {
        name: "inventory",
        purpose: "Stock per (store, product) with a reorder level.",
        columns: [{ name: "reorder_level", note: "on_hand below this = reorder soon" }],
      },
      { name: "purchase_orders", purpose: "Restock orders with status and expected date." },
      { name: "po_items", purpose: "Line items of a purchase order." },
    ],
    relations: [
      { from: "inventory.store_id", to: "stores.store_id", kind: "1:N", note: "Every store stocks many products." },
      { from: "inventory.product_id", to: "products.product_id", kind: "1:N", note: "A product is stocked at many stores (M:N via inventory)." },
      { from: "po_items.po_id", to: "purchase_orders.po_id", kind: "1:N", note: "Orders contain many line items." },
      { from: "products.supplier_id", to: "suppliers.supplier_id", kind: "1:N", note: "Each product comes from one supplier." },
      { from: "purchase_orders.store_id", to: "stores.store_id", kind: "1:N", note: "Stores place restock orders." },
    ],
  },
  {
    id: "hr",
    name: "HeliosWorks",
    domain: "Employee management",
    icon: "Users",
    blurb:
      "A 30-person tech company: departments, an org chart (managers are employees too), salary history with raises, projects with staff allocations and review cycles.",
    tables: [
      { name: "departments", purpose: "Eight departments across locations." },
      {
        name: "employees",
        purpose: "The org chart.",
        columns: [
          { name: "manager_id", note: "points at another employee; NULL for the CEO" },
          { name: "terminated", note: "NULL for current staff — the row stays after leaving" },
        ],
      },
      {
        name: "salaries",
        purpose: "Effective-dated salary history.",
        columns: [{ name: "effective", note: "raises appear as new rows, old ones stay" }],
      },
      { name: "projects", purpose: "Work streams with budget and status." },
      {
        name: "employee_projects",
        purpose: "Who works on what, at what allocation.",
      },
      { name: "performance_reviews", purpose: "Half-yearly ratings with written comments." },
    ],
    relations: [
      { from: "employees.manager_id", to: "employees.employee_id", kind: "self", note: "The reporting tree; recursive CTE territory." },
      { from: "employees.dept_id", to: "departments.dept_id", kind: "1:N", note: "Departments employ many people." },
      { from: "salaries.employee_id", to: "employees.employee_id", kind: "1:N", note: "One row per raise." },
      { from: "employee_projects.employee_id", to: "employees.employee_id", kind: "M:N", note: "Employees serve on many projects." },
      { from: "performance_reviews.reviewer_id", to: "employees.employee_id", kind: "self", note: "Reviews are written by other employees." },
    ],
  },
];

export const DATASET_MAP: Record<DatasetId, DatasetMeta> = Object.fromEntries(
  DATASETS.map((d) => [d.id, d])
) as Record<DatasetId, DatasetMeta>;

export function datasetName(id: DatasetId): string {
  return DATASET_MAP[id]?.name ?? id;
}
