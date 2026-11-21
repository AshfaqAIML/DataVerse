/**
 * DAP_REGISTRY — the Data Analyst Project Academy's project registry.
 *
 * 12 categories × 3 difficulty levels = 36 projects. Every project
 * carries its full engagement structure (15 sections), guided steps
 * with progressive hints, an independent brief, an instructor
 * reference solution and project-specific evaluation checks. Datasets
 * are generated deterministically from seeded builders
 * (src/lib/dap/datasets.ts).
 */
import type { DapCategory, DapProject } from "@/lib/dap/types";
import { RETAIL_PROJECTS } from "./retail";
import { ECOMMERCE_PROJECTS } from "./ecommerce";
import { SALES_PROJECTS } from "./sales";
import { CUSTOMER_PROJECTS } from "./customer";
import { MARKETING_PROJECTS } from "./marketing";
import { FINANCIAL_PROJECTS } from "./financial";
import { HEALTHCARE_PROJECTS } from "./healthcare";
import { EDUCATION_PROJECTS } from "./education";
import { HR_PROJECTS } from "./hr";
import { SPORTS_PROJECTS } from "./sports";
import { PUBLIC_PROJECTS } from "./public";
import { BI_PROJECTS } from "./bi";

export const DAP_CATEGORIES: DapCategory[] = [
  { id: "retail", code: "RET", name: "Retail Analytics", blurb: "Store performance, baskets, promotions and network planning.", icon: "ShoppingBag", accent: "text-viz-10" },
  { id: "ecommerce", code: "ECM", name: "E-Commerce Analytics", blurb: "Funnels, journeys, attribution and retention economics.", icon: "ShoppingCart", accent: "text-viz-2" },
  { id: "sales", code: "SAL", name: "Sales Analytics", blurb: "Pipeline health, win/loss drivers and territory design.", icon: "TrendingUp", accent: "text-viz-8" },
  { id: "customer", code: "CUS", name: "Customer Analytics", blurb: "Churn signals, RFM segmentation and health scores.", icon: "Users", accent: "text-viz-5" },
  { id: "marketing", code: "MKT", name: "Marketing Analytics", blurb: "Campaign ROI, attribution models and experiments.", icon: "Megaphone", accent: "text-viz-4" },
  { id: "financial", code: "FIN", name: "Financial Analytics", blurb: "Budgets, working capital and portfolio risk.", icon: "Landmark", accent: "text-viz-9" },
  { id: "healthcare", code: "HLT", name: "Healthcare Analytics", blurb: "No-shows, patient flow and capacity modelling.", icon: "HeartPulse", accent: "text-danger-text" },
  { id: "education", code: "EDU", name: "Education Analytics", blurb: "Course engagement, student risk and equity.", icon: "GraduationCap", accent: "text-warning-text" },
  { id: "hr", code: "HR", name: "HR Analytics", blurb: "Attrition, hiring funnels and pay equity.", icon: "IdCard", accent: "text-viz-3" },
  { id: "sports", code: "SPT", name: "Sports Analytics", blurb: "Season reviews, player efficiency and valuations.", icon: "Trophy", accent: "text-viz-6" },
  { id: "public", code: "PUB", name: "Public Datasets", blurb: "Open spending, air quality and development indicators.", icon: "Building2", accent: "text-ink-2" },
  { id: "bi", code: "BIQ", name: "Business Intelligence", blurb: "KPI reports, metrics layers and unit economics.", icon: "BarChart3", accent: "text-viz-1" },
];

const ALL: DapProject[] = [
  ...RETAIL_PROJECTS,
  ...ECOMMERCE_PROJECTS,
  ...SALES_PROJECTS,
  ...CUSTOMER_PROJECTS,
  ...MARKETING_PROJECTS,
  ...FINANCIAL_PROJECTS,
  ...HEALTHCARE_PROJECTS,
  ...EDUCATION_PROJECTS,
  ...HR_PROJECTS,
  ...SPORTS_PROJECTS,
  ...PUBLIC_PROJECTS,
  ...BI_PROJECTS,
];

export const DAP_REGISTRY = {
  categories: DAP_CATEGORIES,
  projects: ALL,
};

export const DAP_STATS = {
  projects: ALL.length,
  categories: DAP_CATEGORIES.length,
  beginner: ALL.filter((p) => p.difficulty === "beginner").length,
  intermediate: ALL.filter((p) => p.difficulty === "intermediate").length,
  advanced: ALL.filter((p) => p.difficulty === "advanced").length,
  hours: ALL.reduce((a, p) => a + p.hours, 0),
  guidedSteps: ALL.reduce((a, p) => a + p.guidedSteps.length, 0),
};

export { ALL as DAP_PROJECTS };
