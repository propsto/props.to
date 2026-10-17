import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./schema.prisma",
  // Read directly, not via constServer: `prisma generate` runs in every project's install
  // (postinstall), including web, which has no database. Commands that connect still fail loudly.
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx ./seed.ts",
  },
});
