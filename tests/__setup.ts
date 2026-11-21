/**
 * Test bootstrap — MUST be the first import of every test file.
 * Points Prisma at the isolated test database (db/test.db) before any
 * module instantiates the PrismaClient singleton.
 *
 * The test DB is created by `bun run test` (prisma db push) — never
 * touch db/custom.db (the demo database).
 */
process.env.DATABASE_URL = "file:/home/z/my-project/db/test.db";
process.env.LOG_LEVEL = "error";
