import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec("SELECT 1");
async function q(label: string, sql: string) {
  try {
    const res = await db.query(sql);
    const cols = res.fields.map((f: any) => f.name);
    console.log(`### ${label}`);
    console.log(cols.join(" | "));
    for (const r of res.rows as any[]) console.log(cols.map((c: string) => JSON.stringify(r[c])).join(" | "));
  } catch (e: any) { console.log(`### ${label} ERROR: ${e.message}`); }
}
await q("float8-add", `SELECT 0.1::double precision + 0.2::double precision AS float8_sum, 0.1::numeric(10,2) + 0.2::numeric(10,2) AS exact_sum`);
await q("drift-1000", `SELECT sum(0.1::real) AS float4_total, sum(0.1::double precision) AS float8_total, sum(0.1::numeric(10,2)) AS exact_total FROM generate_series(1, 1000) AS n`);
