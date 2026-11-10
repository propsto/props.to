import { afterAll, beforeEach } from "vitest";
import { db } from "../db";

// Every test starts from empty tables; the migration history stays.
beforeEach(async () => {
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations'`;
  if (tables.length === 0) return;
  const list = tables.map(t => `"${t.tablename}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await db.$disconnect();
});
