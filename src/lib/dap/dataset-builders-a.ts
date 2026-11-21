/**
 * Dataset builders — part A (retail, e-commerce, sales, customer,
 * marketing, financial).
 *
 * Every builder is deterministic given its seeded Rng and returns row
 * objects whose keys are exactly the columns of the project's data
 * dictionary. Defects (missing cells, duplicates, inconsistent labels,
 * impossible values, messy formats) are injected deliberately — each
 * project's instructor reference lists what was planted and the intended
 * treatment, so "data quality assessment" has real findings to find.
 */
import type { Rng } from "./rng";
import { messyCurrency } from "./rng";

export type DatasetRow = Record<string, string | number | boolean | null>;
export type DatasetBuilder = (r: Rng, rows: number) => DatasetRow[];

/* ================================================================ 1 RETAIL */

/** RET-01 — single-store grocery transactions, 12 months. */
export const ret1: DatasetBuilder = (r, rows) => {
  const cats: Array<[string, string[], number]> = [
    ["Beverages", ["Cola", "Orange Juice", "Sparkling Water", "Energy Drink"], 3.5],
    ["Bakery", ["Sourdough Loaf", "Croissant", "Bagel", "Muffin"], 3.0],
    ["Produce", ["Bananas 1kg", "Apples 1kg", "Tomatoes 500g", "Salad Bag"], 2.8],
    ["Dairy", ["Whole Milk 2L", "Greek Yogurt", "Cheddar 250g", "Butter"], 4.2],
    ["Snacks", ["Potato Chips", "Chocolate Bar", "Mixed Nuts", "Pretzels"], 2.4],
    ["Household", ["Dish Soap", "Paper Towels", "Trash Bags", "Sponges"], 5.1],
  ];
  const pay = ["Credit Card", "Debit Card", "Cash", "Wallet App"];
  const cust = ["Member", "Non-member"];
  const out: DatasetRow[] = [];
  const start = new Date("2025-01-01T00:00:00Z");
  for (let i = 0; i < rows; i++) {
    const [category, subs, base] = r.pick(cats);
    const sub = r.pick(subs);
    const qty = r.pickWeighted([1, 1, 2, 3, 4, 5], [30, 25, 20, 12, 8, 5]);
    let price = r.round(r.posNorm(base, base * 0.25), 2);
    if (r.chance(0.0008)) price = 199.99; // planted outlier
    const catLabel =
      r.chance(0.12) ? category.toLowerCase() : category; // planted casing
    const payLabel =
      pay.includes("Credit Card") && r.chance(0.08) ? "cc" : r.pick(pay); // planted variant
    const day = new Date(start.getTime() + r.int(0, 364) * 86400000);
    out.push({
      transaction_id: 100000 + i,
      date: day.toISOString().slice(0, 10),
      daypart: r.pickWeighted(["Morning", "Afternoon", "Evening"], [3, 4, 3]),
      weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day.getUTCDay()],
      category: catLabel,
      subcategory: sub,
      quantity: r.chance(0.004) ? -qty : qty, // planted negative (mis-keyed refunds)
      unit_price: price,
      total_amount: r.chance(0.02) ? "" : r.round(price * qty, 2), // planted missing
      payment_method: payLabel,
      customer_type: r.chance(0.015) ? "" : r.pick(cust), // planted missing
    });
  }
  // planted duplicates
  for (let i = 0; i < Math.round(rows * 0.012); i++) {
    out.push({ ...out[r.int(0, out.length - 1)] });
  }
  return out;
};

/** RET-02 — multi-store chain line items with promotions. */
export const ret2: DatasetBuilder = (r, rows) => {
  const stores = [
    ["S01", "Supercentre"], ["S02", "Supercentre"], ["S03", "Supermarket"],
    ["S04", "Supermarket"], ["S05", "Convenience"], ["S06", "Convenience"],
  ] as const;
  const depts = [" Grocery ", "Bakery", "Dairy", "Frozen", "Household", "Produce"]; // planted trailing space on one
  const bands = ["Value", "Core", "Premium"];
  const items: Record<string, string[]> = {
    Grocery: ["Pasta 500g", "Rice 1kg", "Canned Beans", "Olive Oil"],
    Bakery: ["Sliced Bread", "Brioche Roll", "Baguette"],
    Dairy: ["Milk 2L", "Yogurt Pack", "Cheese Block"],
    Frozen: ["Frozen Peas", "Ice Cream", "Pizza"],
    Household: ["Laundry Liquid", "Surface Cleaner", "Bin Liners"],
    Produce: ["Apples 1kg", "Carrots 1kg", "Bananas"],
  };
  const start = new Date("2025-03-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const [store, format] = r.pick(stores);
    const dept = r.pick(depts);
    const clean = dept.trim();
    const band = r.pick(bands);
    const cost = r.round(r.posNorm(1.8, 0.7), 2);
    const price = r.round(cost * (band === "Premium" ? 2.4 : band === "Core" ? 1.7 : 1.25), 2);
    const promo = r.chance(0.22);
    const day = new Date(start.getTime() + r.int(0, 239) * 86400000);
    out.push({
      receipt_id: 550000 + i,
      store_id: store,
      store_format: format,
      date: day.toISOString().slice(0, 10),
      hour: r.pickWeighted([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], [3, 5, 6, 7, 9, 8, 6, 6, 7, 9, 10, 7, 4]),
      department: dept, // note: includes the trailing space
      item_name: r.pick(items[clean]),
      price_band: band,
      unit_cost: r.chance(0.03) ? "" : cost,
      quantity: r.chance(0.006) ? 0 : r.int(1, 6),
      unit_price: promo ? r.round(price * 0.8, 2) : price,
      promo_flag: r.chance(0.05)
        ? (promo ? "Y" : "N")
        : promo, // planted mixed boolean encodings
      loyalty_member: r.chance(0.02) ? "" : r.pick(["Yes", "No"]),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.009); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** RET-03 — store-week panel for network optimisation. */
export const ret3: DatasetBuilder = (r, rows) => {
  const regions = ["North", "South", "East", "West", "Central"];
  const formats = ["Supercentre", "Supermarket", "Convenience"];
  const stores: Array<{ id: string; region: string; format: string; sqm: number; income: number; parking: number }> = [];
  for (let i = 0; i < 24; i++) {
    stores.push({
      id: `ST${String(i + 1).padStart(2, "0")}`,
      region: r.pick(regions),
      format: r.pick(formats),
      sqm: r.round(r.posNorm(2400, 900), 0),
      income: r.round(r.posNorm(58000, 12000), 0),
      parking: r.int(40, 320),
    });
  }
  const weeks = Math.ceil(rows / stores.length);
  const out: DatasetRow[] = [];
  const start = new Date("2024-01-07T00:00:00Z");
  for (let w = 0; w < weeks; w++) {
    const weekDate = new Date(start.getTime() + w * 7 * 86400000).toISOString().slice(0, 10);
    const holiday = w % 52 === 50 || w % 52 === 51; // festive weeks
    for (const s of stores) {
      const foot = Math.round(s.sqm * (holiday ? 4.2 : 2.8) * r.posNorm(1, 0.12));
      const conv = 0.32 * (s.format === "Convenience" ? 1.3 : 1) * r.posNorm(1, 0.08);
      let sales = foot * conv * r.posNorm(14, 2.2);
      if (holiday) sales *= 1.35;
      if (r.chance(0.0006)) sales *= 10; // planted data error
      const competitors = r.chance(0.004) ? -r.int(1, 3) : r.int(0, 5); // planted negative
      const incomeLabel = r.chance(0.02) ? "" : s.income; // planted missing
      out.push({
        store_id: s.id,
        week: weekDate,
        format: s.format,
        region: r.chance(0.03) ? s.region.toUpperCase() : s.region, // planted casing
        sqm: s.sqm,
        staff_fte: r.round(r.posNorm(s.sqm / 95, 2), 1),
        parking_bays: s.parking,
        median_income_zip: incomeLabel,
        competitor_count_1km: competitors,
        footfall: r.chance(0.008) ? "" : foot, // planted outage
        transactions: Math.round(foot * conv),
        sales: r.chance(0.01) ? "" : r.round(sales, 2), // planted outage
        promo_spend: r.round(sales * r.float(0.01, 0.05), 2),
        markdown_pct: r.round(r.float(0.5, 6.5), 2),
      });
    }
  }
  for (let i = 0; i < 14; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ============================================================ 2 E-COMMERCE */

/** ECM-01 — session funnel for a D2C storefront. */
export const ecm1: DatasetBuilder = (r, rows) => {
  const devices = ["Mobile", "Desktop", "Tablet"];
  const sources = ["Paid Search", "Organic Search", "Social", "Email", "Direct", "googleads"];
  const stages = ["visit", "product", "cart", "checkout", "purchase"];
  const weights = [22, 38, 18, 12, 10];
  const landings = ["/home", "/collections/new", "/product/best-seller", "/sale"];
  const start = new Date("2025-05-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const stage = r.pickWeighted(stages, weights);
    const stageLabel = r.chance(0.06) ? stage[0].toUpperCase() + stage.slice(1) : stage; // planted casing
    const bounce = ["visit", "product"].includes(stage) && r.chance(0.45);
    const dev = r.chance(0.03) ? "" : r.pickWeighted(devices, [62, 33, 5]); // planted missing
    out.push({
      session_id: 7000000 + i,
      visit_date: r.date(start, 120),
      device_type: dev,
      traffic_source: r.pickWeighted(sources, [24, 30, 18, 9, 14, 5]),
      landing_page: r.pick(landings),
      stage_reached: stageLabel,
      session_duration_sec:
        r.chance(0.005)
          ? -r.int(30, 400) // planted negative glitch
          : Math.max(0, Math.round(r.posNorm(320, 260))),
      pages_viewed: r.int(1, 22),
      is_returning: r.pick([0, 1]),
      bounce: bounce ? (r.chance(0.1) ? "" : "TRUE") : "FALSE", // planted mixed labels + missing
    });
  }
  for (let i = 0; i < Math.round(rows * 0.008); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** ECM-02 — event stream with carts and orders. */
export const ecm2: DatasetBuilder = (r, rows) => {
  const types = ["view", "cart", "checkout", "purchase"];
  const wTypes = [58, 22, 11, 9];
  const devices = ["Mobile", "Desktop", "Tablet"];
  const sources = ["Paid Search", "Organic Search", "Social", "Email", "Affiliate"];
  const cats = ["Apparel", "Footwear", "Accessories", "Home", "Beauty"];
  const codes = ["", "", "", "WELCOME10", "SPRING20", "VIP15"];
  const start = new Date("2025-04-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const t = r.pickWeighted(types, wTypes);
    const typeLabel = r.chance(0.012) ? "veiw" : t; // planted typo
    const value = t === "cart" ? r.round(r.posNorm(78, 40), 2) : t === "purchase" ? r.round(r.posNorm(112, 55), 2) : 0;
    out.push({
      event_id: 9000000 + i,
      timestamp: r.datetime(start, 150, 7, 23),
      session_id: 7000000 + r.int(0, Math.round(rows / 2.6)),
      user_id: r.chance(0.04) ? "" : 40000 + r.int(0, 5200), // planted guest gap
      event_type: typeLabel,
      device: r.pickWeighted(devices, [64, 31, 5]),
      traffic_source: r.pickWeighted(sources, [26, 31, 17, 10, 16]),
      product_category: r.pick(cats),
      cart_value: t === "cart" ? (r.chance(0.06) ? messyCurrency(value) : value) : "", // planted messy format
      order_value: t === "purchase" ? (r.chance(0.03) ? "" : value) : "", // planted missing
      discount_code: t === "purchase" && r.chance(0.3) ? r.pick(codes) : "",
    });
  }
  for (let i = 0; i < Math.round(rows * 0.007); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** ECM-03 — 18 months of orders for cohort / retention work. */
export const ecm3: DatasetBuilder = (r, rows) => {
  const channels = ["Paid Search", "Organic Search", "Social", "Email", "Referral"];
  const devices = ["Mobile", "Desktop"];
  const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];
  const cats = ["Mixed", "Apparel", "Home", "Beauty", "Footwear"];
  const start = new Date("2024-04-01T00:00:00Z");
  const totalDays = 540;
  const nCustomers = 6200;
  const firstOrder = new Map<number, string>();
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const cust = 20000 + r.int(0, nCustomers);
    const orderDay = r.int(0, totalDays - 1);
    // customer first order: earlier for lower ids (skewed) — keeps cohorts varied
    if (!firstOrder.has(cust)) {
      const bias = 1 - (cust - 20000) / nCustomers;
      firstOrder.set(cust, new Date(start.getTime() + Math.floor(orderDay * bias * r.float(0.1, 1)) * 86400000).toISOString().slice(0, 10));
    }
    const first = firstOrder.get(cust)!;
    const gmv = r.round(r.posNorm(86, 48), 2);
    const disc = r.round(gmv * r.float(0, 0.35), 2);
    out.push({
      order_id: 300000 + i,
      customer_id: cust,
      order_date: new Date(start.getTime() + orderDay * 86400000).toISOString().slice(0, 10),
      first_order_date: r.chance(0.025) ? "" : first, // planted missing (recomputable)
      channel: r.pickWeighted(channels, [26, 30, 16, 11, 17]),
      device: r.pickWeighted(devices, [63, 37]),
      category_mix: r.pickWeighted(cats, [38, 20, 18, 14, 10]),
      gmv: r.chance(0.004) ? -gmv : gmv, // planted refunds mixed into orders
      discount: disc,
      items: r.int(1, 9),
      region: r.chance(0.03) ? r.pick(regions).toLowerCase() : r.pick(regions), // planted casing
    });
  }
  for (let i = 0; i < Math.round(rows * 0.006); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ================================================================== 3 SALES */

/** SAL-01 — CRM pipeline snapshot. */
export const sal1: DatasetBuilder = (r, rows) => {
  const reps = ["A. Okafor", "J. Mercier", "S. Devi", "T. Silva", "M. Chen", "L. Haddad", "P. Novak", "R. Garcia"];
  const regions = ["EMEA", "AMER", "APAC"];
  const segments = ["SMB", "Mid-Market", "Enterprise"];
  const products = ["Platform", "Analytics Suite", "Automation", "Support Tier"];
  const sources = ["Outbound", "Inbound", "Partner", "Event", "Referral"];
  const statuses = ["Won", "Lost", "Open"];
  const start = new Date("2025-01-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const status = r.pickWeighted(statuses, [24, 58, 18]);
    const statusLabel = r.chance(0.05) ? status.toLowerCase() : status; // planted casing
    const created = r.int(0, 320);
    const cycle = r.int(14, 180);
    const amount = r.round(r.posNorm(42000, 30000), 0);
    const closed = status !== "Open";
    out.push({
      deal_id: 41000 + i,
      created_date: r.date(start, created),
      close_date: closed
        ? (r.chance(0.02) ? "" : new Date(start.getTime() + (created + cycle) * 86400000).toISOString().slice(0, 10)) // planted missing
        : "",
      status: statusLabel,
      rep: r.pick(reps),
      region: r.pick(regions),
      segment: r.pickWeighted(segments, [45, 35, 20]),
      product_line: r.pick(products),
      amount: r.chance(0.07) ? messyCurrency(amount) : amount, // planted messy format
      source: r.chance(0.02) ? "" : r.pick(sources),
      activities_count: Math.max(1, Math.round(cycle / r.float(3, 9))),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.01); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** SAL-02 — win/loss driver analysis table. */
export const sal2: DatasetBuilder = (r, rows) => {
  const segments = ["SMB", "Mid-Market", "Enterprise"];
  const industries = ["Technology", "Manufacturing", "", "Financial Services", "Healthcare", "Retail", "Education"];
  const arrBands = ["<50k", "50k-150k", "150k-400k", "400k+"];
  const competitors = ["LegacyCorp", "BestOfBreed Inc", "In-House Build", "No Competitor"];
  const regions = ["AMER", "EMEA", "APAC"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const won = r.chance(0.31);
    const employees = r.pickWeighted([40, 350, 1800, 9000, 26000], [28, 32, 22, 12, 6]);
    const demo = r.chance(won ? 0.86 : 0.4);
    const cycle = Math.round(r.posNorm(72, 30));
    const disc = r.round(r.float(0, 30), 1);
    out.push({
      deal_id: 52000 + i,
      created_quarter: `Q${r.int(1, 4)} ${r.pick([2024, 2024, 2025])}`,
      close_date: r.date(new Date("2024-01-15T00:00:00Z"), 420),
      status: won ? "Won" : "Lost",
      segment: r.pickWeighted(segments, [42, 36, 22]),
      industry: r.chance(0.06) ? "" : r.pick(industries.slice(0, 6).concat([industries[2]])), // planted missing
      employees: employees,
      arr_band: r.chance(0.04) ? r.pick(arrBands).toLowerCase() : r.pick(arrBands),
      amount: r.round(r.posNorm(85000, 55000), 0),
      discount_pct: r.chance(0.09) ? `${disc}%` : disc / 100, // planted percent-string mix
      cycle_days: r.chance(0.006) ? cycle + 700 : cycle, // planted outliers
      meetings: Math.max(1, Math.round(cycle / r.float(6, 14))),
      demo_given: demo ? 1 : 0,
      champion_change: r.chance(0.18) ? 1 : 0,
      competitor: r.pickWeighted(competitors, [30, 26, 14, 30]),
      region: r.pick(regions),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.008); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** SAL-03 — three years of bookings with rep-year quotas. */
export const sal3: DatasetBuilder = (r, rows) => {
  const names = ["A. Okafor", "J. Mercier", "S. Devi", "T. Silva", "M. Chen", "L. Haddad", "P. Novak", "R. Garcia", "K. Osei", "D. Petrov", "N. Farah", "C. Lindqvist", "E. Rossi", "H. Nakamura", "B. Costa", "F. Ahmadi"];
  const segments = ["SMB", "Mid-Market", "Enterprise"];
  const products = ["Platform", "Analytics Suite", "Automation"];
  const territories: Record<string, string[]> = {
    "AMER-East": [], "AMER-West": [], "EMEA-North": [], "EMEA-South": [], "APAC": [],
  };
  const terrKeys = Object.keys(territories);
  const reps = names.map((name, idx) => {
    const t = terrKeys[idx % terrKeys.length];
    territories[t].push(name);
    return { name, territory: t, quota: 520000 + r.int(0, 14) * 40000, start: new Date("2023-01-01T00:00:00Z") };
  });
  const start = new Date("2023-01-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const rep = r.pick(reps);
    const day = r.int(0, 1085);
    const amount = r.round(r.posNorm(64000, 42000), 0);
    const year = 2023 + Math.floor(day / 365);
    const quotaYear = r.chance(0.03) ? "" : rep.quota * (year === 2025 ? 1.12 : year === 2024 ? 1.06 : 1); // planted missing quota
    const tenure = Math.round((day) / 365 * 12 + (rep.start ? 0 : 0) + r.int(1, 30));
    out.push({
      booking_id: 63000 + i,
      order_date: new Date(start.getTime() + day * 86400000).toISOString().slice(0, 10),
      close_date: new Date(start.getTime() + (day + r.int(1, 4)) * 86400000).toISOString().slice(0, 10),
      rep_id: 800 + reps.indexOf(rep),
      rep_name: rep.name,
      tenure_months: r.chance(0.004) ? -tenure : tenure, // planted negative
      ramp_status: tenure < 6 ? "Ramping" : "Full",
      territory: rep.territory,
      region: rep.territory.split("-")[0],
      segment: r.pickWeighted(segments, [40, 37, 23]),
      product: r.pick(products),
      amount: r.chance(0.06) ? amount.toLocaleString("en-US") : amount, // planted formatted numbers
      quota_year: quotaYear,
      quota: quotaYear,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.005); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* =============================================================== 4 CUSTOMER */

/** CUS-01 — subscription snapshot with churn flags. */
export const cus1: DatasetBuilder = (r, rows) => {
  const plans = ["Basic", "Standard", "Pro", "Enterprise"];
  const payMethods = ["Card", "Direct Debit", "Invoice", "PayPal"];
  const start = new Date("2022-06-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const plan = r.pickWeighted(plans, [42, 34, 18, 6]);
    const churned = r.chance(plan === "Enterprise" ? 0.06 : plan === "Pro" ? 0.13 : 0.22);
    const tenure = r.int(1, 42);
    const churnLabel = r.chance(0.07)
      ? (churned ? "yes" : "no") // planted variant
      : churned
        ? r.chance(0.5) ? "TRUE" : "True"
        : r.chance(0.5) ? "FALSE" : "False";
    out.push({
      customer_id: 1000 + i,
      signup_date: r.date(start, 1200),
      plan: r.chance(0.05) ? plan.toUpperCase() : plan, // planted casing
      monthly_fee: r.round(plan === "Basic" ? 29 : plan === "Standard" ? 79 : plan === "Pro" ? 199 : 999, 2),
      contract_months: r.pick([1, 12, 12, 24]),
      payment_method: r.pick(payMethods),
      support_tickets: r.int(0, churned ? 14 : 5),
      tenure_months: r.chance(0.005) ? -tenure : tenure, // planted negative
      usage_hours_month: r.chance(0.03) ? "" : r.round(r.posNorm(plan === "Enterprise" ? 210 : plan === "Pro" ? 96 : 22, 18), 1), // planted missing
      auto_renew: r.pick([0, 1]),
      churned: churnLabel,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.01); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** CUS-02 — transaction log for RFM segmentation. */
export const cus2: DatasetBuilder = (r, rows) => {
  const cats = ["Apparel", "Home", "Electronics", "Beauty", "Grocery"];
  const channels = ["Web", "Mobile App", "In-Store", "Phone"];
  const nCust = 3800;
  const start = new Date("2024-09-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const amount = r.round(r.posNorm(74, 52), 2);
    const d = new Date(start.getTime() + r.int(0, 420) * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const dateCell = r.chance(0.05)
      ? iso.replace(/-/g, "/") // planted mixed format
      : iso;
    const returned = r.chance(0.07);
    out.push({
      transaction_id: 880000 + i,
      customer_id: 50000 + r.int(0, nCust),
      transaction_date: dateCell,
      amount: r.chance(0.005) ? r.round(amount * 12, 2) : amount, // planted outliers
      product_category: r.pick(cats),
      channel: r.chance(0.03) ? "" : r.pick(channels), // planted missing
      discount_used: r.pick([0, 0, 0, 1]),
      returned: returned ? (r.chance(0.15) ? "Y" : "Yes") : r.chance(0.15) ? "N" : "No", // planted variant
    });
  }
  for (let i = 0; i < Math.round(rows * 0.009); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** CUS-03 — customer-week usage panel for churn drivers. */
export const cus3: DatasetBuilder = (r, rows) => {
  const plans = ["Starter", "Growth", "Scale"];
  const nCust = 2400;
  const start = new Date("2025-01-06T00:00:00Z");
  const weeks = 26;
  const custPlans = new Map<number, { plan: string; seats: number; base: number }>();
  for (let c = 0; c < nCust; c++) {
    const plan = r.pickWeighted(plans, [40, 42, 18]);
    custPlans.set(30000 + c, { plan, seats: plan === "Starter" ? r.int(3, 10) : plan === "Growth" ? r.int(10, 40) : r.int(40, 120), base: r.posNorm(1, 0.25) });
  }
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const cust = 30000 + r.int(0, nCust - 1);
    const meta = custPlans.get(cust)!;
    const week = r.int(1, weeks);
    const decaying = meta.base * (1 - week * 0.004);
    const churnNext = r.chance(Math.max(0.015, 0.05 - decaying * 0.02));
    const active = Math.max(1, Math.round(7 * decaying * r.posNorm(1, 0.2)));
    const sessions = Math.max(1, Math.round(meta.seats * decaying * r.posNorm(4, 1.4)));
    const weekDate = new Date(start.getTime() + (week - 1) * 7 * 86400000).toISOString().slice(0, 10);
    out.push({
      week: weekDate,
      customer_id: cust,
      plan: meta.plan,
      seats: r.chance(0.003) ? 0 : meta.seats, // planted zero-seat errors
      active_days: active,
      sessions: sessions,
      minutes_used: r.chance(0.025) ? "" : Math.round(sessions * r.posNorm(18, 6)), // planted missing
      feature_a_events: Math.round(sessions * r.float(0.4, 2.1)),
      feature_b_events: r.chance(0.02) ? "" : Math.round(sessions * r.float(0.1, 0.9) * (meta.plan === "Scale" ? 2 : 1)),
      support_tickets: r.chance(0.14) ? 1 : r.chance(0.05) ? r.int(2, 5) : 0,
      nps: r.chance(0.06) ? -999 : r.int(0, 10), // planted sentinel
      payment_failures: r.chance(0.05) ? r.int(1, 3) : 0,
      churned_next_month: r.chance(0.02) ? "" : churnNext ? 1 : 0, // planted missing
    });
  }
  for (let i = 0; i < Math.round(rows * 0.004); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* ============================================================== 5 MARKETING */

/** MKT-01 — campaign daily performance. */
export const mkt1: DatasetBuilder = (r, rows) => {
  const campaigns = [
    ["Spring Launch", "Paid Search"], ["Spring Launch", "Social"],
    ["Summer Sale", "Paid Search"], ["Summer Sale", "Display"],
    ["Always-On Brand", "Display"], ["Always-On Brand", "Social"],
    ["Retargeting Q3", "Email"], ["Retargeting Q3", "Paid Search"],
  ] as const;
  const days = Math.ceil(rows / campaigns.length);
  const out: DatasetRow[] = [];
  const start = new Date("2025-03-01T00:00:00Z");
  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    for (const [camp, chan] of campaigns) {
      const spend = r.round(r.posNorm(1400, 380), 2);
      const impressions = Math.round(spend * r.float(210, 460));
      const clicks = Math.round(impressions * r.float(0.008, 0.028));
      const conv = Math.round(clicks * r.float(0.02, 0.09));
      const revenue = r.round(conv * r.posNorm(120, 40), 2);
      out.push({
        date,
        campaign: camp,
        channel: r.chance(0.04) ? chan.toLowerCase() : chan, // planted casing
        spend: r.chance(0.08) ? messyCurrency(spend) : spend, // planted messy format
        impressions,
        clicks: r.chance(0.02) ? "" : clicks, // planted missing
        conversions: conv,
        revenue: r.chance(0.006) ? -revenue : revenue, // planted negative (refund day)
      });
    }
  }
  for (let i = 0; i < 16; i++) out.push({ ...out[r.int(0, out.length - 1)] }); // planted duplicates
  return out;
};

/** MKT-02 — multi-touch attribution log. */
export const mkt2: DatasetBuilder = (r, rows) => {
  const channels = ["Paid Search", "Organic Search", "Social", "Email", "Display", "Affiliate"];
  const w = [24, 26, 18, 12, 12, 8];
  const positions = ["first", "mid", "last"];
  const devices = ["Mobile", "Desktop"];
  const campaigns = ["Brand Terms", "Category Terms", "Spring Launch", "Summer Sale", "Newsletter", "Retarget", "Affiliate Network"];
  const nSessions = Math.round(rows / 2.4);
  const convSession = new Set<number>();
  for (let i = 0; i < nSessions * 0.09; i++) convSession.add(r.int(0, nSessions));
  const start = new Date("2025-02-01T00:00:00Z");
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const session = r.int(0, nSessions);
    const converted = convSession.has(session);
    const chan = r.pickWeighted(channels, w);
    const pos = r.pickWeighted(positions, [30, 42, 28]);
    const posLabel = r.chance(0.02) ? (pos === "mid" ? "middle" : pos) : pos; // planted label variant
    out.push({
      touch_id: 100000 + i,
      session_id: session,
      customer_id: 70000 + (session % 4300),
      touch_date: r.date(start, 200),
      channel: chan,
      campaign: campaigns[channels.indexOf(chan)],
      position: posLabel,
      cost_per_touch: r.chance(0.03) ? "" : r.round(r.posNorm(1.7, 1.1), 2), // planted missing
      converted: r.chance(0.01) ? "" : converted ? 1 : 0, // planted missing
      conversion_value: converted && pos === "last" ? r.round(r.posNorm(128, 60), 2) : 0,
      device: r.pickWeighted(devices, [61, 39]),
    });
  }
  for (let i = 0; i < Math.round(rows * 0.006); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** MKT-03 — A/B/n experiment with pre/post metrics. */
export const mkt3: DatasetBuilder = (r, rows) => {
  const variants = ["Control", "Treatment A", "Treatment B"];
  const platforms = ["iOS", "Android", "Web"];
  const regions = ["North America", "Europe", "LATAM", "APAC"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const variant = r.pickWeighted(variants, [34, 33, 33]);
    const vLabel = r.chance(0.05) ? variant.toLowerCase() : variant; // planted casing
    const plat = r.pickWeighted(platforms, [38, 44, 18]);
    const preSess = Math.round(r.posNorm(14, 5));
    const lift = variant === "Treatment A" ? 1.06 : variant === "Treatment B" ? 0.98 : 1;
    const postSess = Math.max(0, Math.round(preSess * lift * r.posNorm(1.02, 0.24)));
    const purchase = r.chance(0.09 * lift) ? 1 : 0;
    const revenue = purchase === 1 ? r.round(r.posNorm(96, 42), 2) : 0;
    out.push({
      user_id: 500000 + i,
      variant: vLabel,
      platform: plat,
      region: r.chance(0.03) ? r.pick(regions).toUpperCase() : r.pick(regions), // planted casing
      signup_week: r.date(new Date("2025-06-02T00:00:00Z"), 42),
      pre_period_sessions: r.chance(0.004) ? Math.round(preSess * 40) : preSess, // planted outlier
      pre_period_revenue: r.round(r.posNorm(9, 6), 2),
      post_period_sessions: r.chance(0.02) ? "" : postSess, // planted missing
      post_period_revenue: revenue,
      post_purchases: purchase,
      support_contacts: r.chance(0.1) ? r.int(1, 3) : 0,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.004); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/* =============================================================== 6 FINANCIAL */

/** FIN-01 — GL budget vs actual lines. */
export const fin1: DatasetBuilder = (r, rows) => {
  const depts = [
    ["Marketing", "Mktg"], ["Engineering", "Eng"], ["Sales", "Sales"],
    ["Operations", "Ops"], ["People", "HR"], ["Finance", "Fin"],
  ] as const;
  const accounts: Array<[string, string, string]> = [
    ["6100", "Salaries & Wages", "People"], ["6200", "Software & SaaS", "Technology"],
    ["6300", "Advertising", "Marketing"], ["6400", "Travel & Entertainment", "Travel"],
    ["6500", "Professional Services", "Outside Services"], ["6600", "Office & Facilities", "Facilities"],
    ["6700", "Cloud Infrastructure", "Technology"],
  ];
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"];
  const out: DatasetRow[] = [];
  let id = 1;
  // Grain: one row per month-department-account (the summary ledger export).
  for (const month of months) {
    for (const [dept, abbrev] of depts) {
      for (const [code, name] of r.sample(accounts, r.int(4, 6))) {
        const budget = r.round(r.posNorm(42000, 18000), 0);
        const actual = r.round(budget * r.float(0.62, 1.24), 0);
        out.push({
          entry_id: id++,
          month,
          department: r.chance(0.07) ? abbrev : dept, // planted abbreviation variants
          cost_center: `CC-${100 + depts.findIndex((d) => d[0] === dept)}`,
          account_code: code,
          account_name: name,
          budget: r.chance(0.09) ? budget.toLocaleString("en-US") : budget, // planted formatted numbers
          actual: r.chance(0.03) ? "" : r.chance(0.004) ? -actual : actual, // planted missing + rebate negatives
          expense_type: name.includes("Salaries") ? "Fixed" : "Variable",
        });
      }
    }
  }
  for (let i = 0; i < 12; i++) out.push({ ...out[r.int(0, out.length - 1)] }); // planted duplicates
  return out;
};

/** FIN-02 — AR/AP invoice register. */
export const fin2: DatasetBuilder = (r, rows) => {
  const vendors = ["Northwind Supplies", "Acme Logistics", "Vertex Media", "Cobalt Systems", "Harbour Legal", "Quanta Energy"];
  const customers = ["Bergen Retail AS", "Delta Foods GmbH", "Umbra SpA", "Crestline Ltd", "Vantage SARL", "Polaris AB"];
  const depts = ["Marketing", "Operations", "Engineering", "Sales"];
  const currencies = ["USD", "USD", "USD", "USD", "EUR", "GBP"];
  const out: DatasetRow[] = [];
  for (let i = 0; i < rows; i++) {
    const isAR = r.chance(0.58);
    const issue = new Date("2025-01-01T00:00:00Z").getTime() + r.int(0, 240) * 86400000;
    let due = issue + r.pick([30, 45, 60]) * 86400000;
    if (r.chance(0.004)) due = issue - 10 * 86400000; // planted impossible due date
    const status = r.pickWeighted(["Paid", "Open", "Overdue", "PARTIALLY PAID"], [55, 22, 15, 8]);
    const statusLabel = r.chance(0.04) ? status.toLowerCase() : status; // planted casing
    const paid = status === "Paid" || status === "PARTIALLY PAID";
    const amount = r.round(r.posNorm(8400, 6200), 2);
    out.push({
      invoice_id: `INV-${2025}-${String(10000 + i)}`,
      type: isAR ? "AR" : "AP",
      issue_date: new Date(issue).toISOString().slice(0, 10),
      due_date: new Date(due).toISOString().slice(0, 10),
      paid_date: paid ? (r.chance(0.05) ? "" : new Date(issue + r.int(5, 75) * 86400000).toISOString().slice(0, 10)) : "", // planted missing
      counterparty: isAR ? r.pick(customers) : r.pick(vendors),
      amount: r.chance(0.06) ? messyCurrency(amount) : amount, // planted messy format
      currency: r.pick(currencies),
      department: r.chance(0.02) ? "" : r.pick(depts),
      status: statusLabel,
    });
  }
  for (let i = 0; i < Math.round(rows * 0.006); i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};

/** FIN-03 — long-format daily asset prices. */
export const fin3: DatasetBuilder = (r, rows) => {
  const assets: Array<[string, string, string, number]> = [
    ["NOVA", "Equity", "Technology", 148],
    ["ORION", "Equity", "Healthcare", 82],
    ["QUARRY", "Equity", "Materials", 61],
    ["HARBOR", "Equity", "Financials", 96],
    ["GRID", "Equity", "Utilities", 74],
    ["TIDE-USD", "Cash", "Money Market", 100],
    ["CORE-BOND", "Fixed Income", "Aggregate", 104],
    ["GLD-X", "Commodity", "Gold", 198],
  ];
  const days = Math.ceil(rows / assets.length);
  const paths = new Map<string, number>();
  for (const a of assets) paths.set(a[0], a[3]);
  const out: DatasetRow[] = [];
  const start = new Date("2024-04-01T00:00:00Z");
  let day = start;
  for (let d = 0; d < days; d++) {
    const date = day.toISOString().slice(0, 10);
    for (const [ticker, cls, sector, _] of assets) {
      const px = paths.get(ticker)!;
      const vol = cls === "Equity" ? 0.016 : cls === "Commodity" ? 0.011 : 0.003;
      const drift = cls === "Equity" ? 0.0006 : cls === "Commodity" ? 0.0004 : 0.0002;
      let close = px * (1 + drift + r.norm(0, vol));
      if (r.chance(0.0007)) close = px * 10; // planted data error
      paths.set(ticker, close);
      out.push({
        date,
        ticker: r.chance(0.004) ? ticker.toLowerCase() : ticker, // planted casing
        asset_class: cls,
        sector,
        close: r.chance(0.012) ? "" : r.round(close, 2), // planted missing
        volume: r.chance(0.006) ? 0 : Math.round(r.posNorm(2_400_000, 900_000)), // planted zero
        dividends: r.chance(0.02) ? r.round(close * 0.002, 3) : 0,
      });
    }
    // advance past weekends for realism
    do {
      day = new Date(day.getTime() + 86400000);
    } while (day.getUTCDay() === 0 || day.getUTCDay() === 6);
  }
  for (let i = 0; i < 10; i++) out.push({ ...out[r.int(0, out.length - 1)] });
  return out;
};
