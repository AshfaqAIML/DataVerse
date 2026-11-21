/**
 * The Complete SQL & PostgreSQL Course — course assembly.
 *
 * Ten parts (A-J) that take an absolute beginner from "what is data?"
 * to advanced SQL, teaching databases before syntax and verifying every
 * claimed query result against real PostgreSQL (PGlite). Six realistic
 * sample databases power the lessons, the exercises (auto-graded), the
 * case studies and the free-form SQL Lab.
 */
import type { SqlCourse } from "@/lib/sqlcourse/types";
import { SQL_PART_A } from "./chapters/part-a";
import { SQL_PART_B } from "./chapters/part-b";
import { SQL_PART_C } from "./chapters/part-c";
import { SQL_PART_D } from "./chapters/part-d";
import { SQL_PART_E } from "./chapters/part-e";
import { SQL_PART_F } from "./chapters/part-f";
import { SQL_PART_G } from "./chapters/part-g";
import { SQL_PART_H } from "./chapters/part-h";
import { SQL_PART_I } from "./chapters/part-i";
import { SQL_PART_J } from "./chapters/part-j";

export const SQL_COURSE: SqlCourse = {
  slug: "sql",
  title: "The Complete SQL & PostgreSQL Course",
  subtitle: "From zero to professional SQL — databases first, syntax second",
  description:
    "A complete SQL and PostgreSQL programme for absolute beginners. Part A teaches what data, databases, tables, keys and relationships actually ARE before a single line of SQL. From Part B on, every query runs against real PostgreSQL — in your browser — against six realistic sample databases: an e-commerce store, a hospital, a university, a bank, a retail chain and an employee-management system. Every lesson output, every exercise solution and every case study answer is machine-verified against the real engine. No fake output, ever.",
  level: "Absolute beginner to advanced",
  audience:
    "Anyone who wants to work with data: future analysts, developers, data scientists and product people. No programming or database experience required.",
  parts: [
    SQL_PART_A,
    SQL_PART_B,
    SQL_PART_C,
    SQL_PART_D,
    SQL_PART_E,
    SQL_PART_F,
    SQL_PART_G,
    SQL_PART_H,
    SQL_PART_I,
    SQL_PART_J,
  ],
};
