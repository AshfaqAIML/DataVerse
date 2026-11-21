/**
 * Sample datasets for the Data Visualization course — the Playground's
 * built-ins and the lesson charts' shared numbers. Small, honest and
 * internally consistent (the same coffee figures appear in a-03's chart-
 * choice demo and the playground's "Coffee Sales" dataset, so learners
 * meet numbers they already know).
 *
 * Column-oriented: every dataset is a list of typed columns, which is
 * what the Playground's mapper and the CSV uploader produce.
 */

export type ColumnType = "numeric" | "categorical";

export interface DataColumn {
  name: string;
  type: ColumnType;
  values: (number | string)[];
}

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  columns: DataColumn[];
}

const num = (name: string, values: number[]): DataColumn => ({ name, type: "numeric", values });
const cat = (name: string, values: string[]): DataColumn => ({ name, type: "categorical", values });

/* ------------------------------------------------ monthly revenue (24 mo) */

export const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const REVENUE_2024: number[] = [
  124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204,
];
export const REVENUE_2023: number[] = [
  102, 108, 112, 109, 117, 121, 126, 124, 129, 133, 141, 148,
];
export const EXPENSES_2024: number[] = [
  98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134,
];

/* --------------------------------------------------- coffee shop (4 prod) */

export const COFFEE_PRODUCTS = ["Espresso", "Latte", "Filter", "Cold Brew"];
export const COFFEE_Q1 = [412, 588, 301, 476];
export const COFFEE_Q2 = [438, 612, 286, 542];
export const COFFEE_Q3 = [451, 596, 274, 618];
export const COFFEE_Q4 = [489, 647, 258, 671];

/* -------------------------------------------------------- iris (30 rows) */

export const IRIS_SEPAL_LENGTH = [
  5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9,
  5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1,
  6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 5.7, 6.0, 6.4,
];
export const IRIS_SEPAL_WIDTH = [
  3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
  3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8,
  3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.8, 3.4, 3.1,
];
export const IRIS_PETAL_LENGTH = [
  1.4, 1.4, 1.5, 1.4, 1.5, 1.7, 1.4, 1.5, 1.4, 1.5,
  1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5,
  4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.5, 4.7, 4.5, 4.9,
];
export const IRIS_SPECIES = [
  "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa",
  "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa",
  "setosa", "setosa", "setosa", "setosa", "setosa", "setosa",
  "versicolor", "versicolor", "versicolor", "versicolor", "versicolor",
  "versicolor", "versicolor", "versicolor", "versicolor", "versicolor",
];

/* ------------------------------------------------- city temperatures (°C) */

export const CITIES = ["Lisbon", "Oslo", "Cairo", "Singapore"];
export const TEMPS: Record<string, number[]> = {
  Lisbon: [11, 12, 14, 16, 19, 22, 25, 25, 23, 19, 15, 12],
  Oslo: [-3, -3, 1, 5, 11, 15, 17, 16, 12, 6, 1, -2],
  Cairo: [19, 20, 23, 27, 30, 32, 33, 33, 31, 28, 24, 20],
  Singapore: [27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27],
};

/* ------------------------------------------------- website traffic (28 d) */

export const TRAFFIC_DAYS = Array.from({ length: 28 }, (_, i) => `Day ${i + 1}`);
export const TRAFFIC_VISITORS = [
  1180, 1240, 1310, 1290, 1350, 2100, 2260, 1220, 1280, 1330, 1300, 1380,
  2190, 2340, 1290, 1360, 1410, 1390, 1440, 2280, 2410, 1350, 1420, 1470,
  1510, 1460, 2340, 2520,
];
export const TRAFFIC_SIGNUPS = [
  23, 26, 29, 27, 30, 44, 49, 24, 27, 30, 28, 31, 47, 52, 26, 31, 33, 30,
  34, 50, 55, 28, 33, 35, 38, 33, 52, 58,
];
const visitors = TRAFFIC_VISITORS;
const signups = TRAFFIC_SIGNUPS;
const days = TRAFFIC_DAYS;

/* ---------------------------------------------------- employee survey */

export const DEPARTMENTS = ["Engineering", "Sales", "Support", "Design", "Ops"];
export const SATISFACTION_BY_DEPT: Record<string, number[]> = {
  Engineering: [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
  Sales: [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
  Support: [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
  Design: [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
  Ops: [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
};

/* ------------------------------------------------------------- datasets */

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "revenue",
    name: "Monthly Revenue",
    description: "Two years of revenue with 2024 expenses — trend, season and margin in one table.",
    columns: [
      cat("month", [...months, ...months]),
      cat("year", Array(12).fill("2023").concat(Array(12).fill("2024"))),
      num("revenue", [...REVENUE_2023, ...REVENUE_2024]),
      num(
        "expenses",
        [
          90, 93, 92, 98, 101, 103, 104, 106, 109, 112, 118, 124,
          ...EXPENSES_2024,
        ],
      ),
    ],
  },
  {
    id: "coffee",
    name: "Coffee Sales",
    description: "Four products across four quarters — the comparison and composition dataset.",
    columns: [
      cat("product", COFFEE_PRODUCTS.flatMap((p) => [p, p, p, p])),
      cat("quarter", ["Q1", "Q2", "Q3", "Q4"].flatMap((q) => [q, q, q, q])),
      num("cups", [
        COFFEE_Q1[0], COFFEE_Q2[0], COFFEE_Q3[0], COFFEE_Q4[0],
        COFFEE_Q1[1], COFFEE_Q2[1], COFFEE_Q3[1], COFFEE_Q4[1],
        COFFEE_Q1[2], COFFEE_Q2[2], COFFEE_Q3[2], COFFEE_Q4[2],
        COFFEE_Q1[3], COFFEE_Q2[3], COFFEE_Q3[3], COFFEE_Q4[3],
      ]),
    ],
  },
  {
    id: "iris",
    name: "Iris Measurements",
    description: "30 flowers, two species — the classic relationship-and-distribution dataset.",
    columns: [
      num("sepal length (cm)", IRIS_SEPAL_LENGTH),
      num("sepal width (cm)", IRIS_SEPAL_WIDTH),
      num("petal length (cm)", IRIS_PETAL_LENGTH),
      cat("species", IRIS_SPECIES),
    ],
  },
  {
    id: "temps",
    name: "City Temperatures",
    description: "Twelve months × four cities — seasonality, range and climate identity.",
    columns: [
      cat("month", [months, months, months, months].flat()),
      cat("city", CITIES.flatMap((c) => Array(12).fill(c))),
      num("temp (°C)", CITIES.flatMap((c) => TEMPS[c])),
    ],
  },
  {
    id: "traffic",
    name: "Website Traffic",
    description: "28 days of visitors and signups — weekday/weekend rhythm and a conversion story.",
    columns: [cat("day", days), num("visitors", visitors), num("signups", signups)],
  },
  {
    id: "survey",
    name: "Employee Survey",
    description: "Satisfaction scores (1–10) across five departments — distributions and outliers.",
    columns: [
      cat(
        "department",
        DEPARTMENTS.flatMap((d) => Array(SATISFACTION_BY_DEPT[d].length).fill(d)),
      ),
      num("satisfaction", DEPARTMENTS.flatMap((d) => SATISFACTION_BY_DEPT[d])),
    ],
  },
];

/* ------------------------------------------------------------- utilities */

export function datasetRows(ds: SampleDataset): (number | string)[][] {
  const n = ds.columns[0]?.values.length ?? 0;
  return Array.from({ length: n }, (_, i) => ds.columns.map((c) => c.values[i]));
}

/** Parse a CSV string into a SampleDataset (client-side, best-effort). */
export function parseCsv(id: string, name: string, text: string): SampleDataset {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row");
  const delimiter = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const header = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((l) => l.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, "")));
  const columns: DataColumn[] = header.map((h, colIdx) => {
    const raw = rows.map((r) => r[colIdx] ?? "");
    const numeric = raw.every((v) => v !== "" && !Number.isNaN(Number(v)));
    if (numeric) return num(h, raw.map((v) => Number(v)));
    return cat(h, raw);
  });
  return {
    id,
    name,
    description: `${rows.length} rows uploaded from CSV`,
    columns,
  };
}
