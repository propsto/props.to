import { join } from "path";
import { config as loadEnv } from "dotenv";
import { configDefaults, defineConfig } from "vitest/config";

// Locally the database comes from the root .env (the Docker Postgres); in CI from the job env.
loadEnv({ path: join(__dirname, "../../.env") });

// The repo tests truncate every table, so they never run against the database in
// DATABASE_URL itself: they use TEST_DATABASE_URL as given, or the same server
// with a `<name>_test` database next to DATABASE_URL's (always a different one).
// `prisma migrate deploy` creates it when missing.
function testDatabaseUrl(): string {
  if (process.env.PROPSTO_ENV === "production") {
    throw new Error(
      "Refusing to run the repo tests with PROPSTO_ENV=production",
    );
  }
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(
    process.env.DATABASE_URL ?? "postgresql://postgres@localhost:5432/postgres",
  );
  const name = url.pathname.replace(/^\//, "") || "postgres";
  url.pathname = `/${name}_test`;
  return url.toString();
}

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          exclude: [...configDefaults.exclude, "test/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "repos",
          include: ["test/**/*.test.ts"],
          globalSetup: ["test/global-setup.ts"],
          setupFiles: ["test/setup.ts"],
          // One database: files run one after another so truncation never races
          fileParallelism: false,
          env: {
            DATABASE_URL: testDatabaseUrl(),
            PROPSTO_ENV: "test",
            EMAIL_FROM: process.env.EMAIL_FROM ?? "test@props.to",
            AUTH_SECRET: process.env.AUTH_SECRET ?? "repo-tests",
            PROPSTO_HOST: "localhost",
            PROPSTO_APP_URL: "http://localhost:3000",
            AUTH_URL: "http://localhost:3002",
          },
        },
      },
    ],
  },
});
