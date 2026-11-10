import { execFileSync } from "child_process";
import { join } from "path";
import type { TestProject } from "vitest/node";

// Once per run: bring the test database to the latest migration (and create it
// when missing). Uses the migration config, which needs only DATABASE_URL.
export default function setup(project: TestProject) {
  const databaseUrl = project.config.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("The repos project sets no DATABASE_URL");
  execFileSync(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "deploy",
      "--config",
      "prisma-migration.config.ts",
    ],
    {
      cwd: join(__dirname, ".."),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    },
  );
}
