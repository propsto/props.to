#!/usr/bin/env node

/**
 * Seed database if running in Vercel preview environment.
 * This ensures E2E tests have the necessary test data.
 *
 * In Vercel, DATABASE_URL is injected by the Vercel-Neon integration,
 * so we run the seed script directly without needing dotenv.
 *
 * This script is part of @propsto/data and runs during the data package's build.
 *
 * Note: Neon preview branches are created from the main branch, which already
 * has the schema applied. We skip migrations and just run the seed script.
 */

const { execSync } = require("child_process");
const path = require("path");

const VERCEL_ENV = process.env.VERCEL_ENV;

async function main() {
  console.log(`[@propsto/data] VERCEL_ENV: ${VERCEL_ENV}`);
  console.log(`[@propsto/data] DATABASE_URL: ${process.env.DATABASE_URL ? "[SET]" : "[NOT SET]"}`);

  if (VERCEL_ENV !== "preview") {
    console.log("[@propsto/data] Not a preview environment, skipping seed.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("[@propsto/data] DATABASE_URL is not set, cannot seed database.");
    return;
  }

  console.log("[@propsto/data] Preview environment detected, seeding database...");

  try {
    // This script is at packages/data/scripts, so package root is one level up
    const packageRoot = path.resolve(__dirname, "..");
    const seedPath = path.join(packageRoot, "seed.ts");
    // Monorepo root is two levels up from package root
    const monorepoRoot = path.resolve(packageRoot, "../..");

    console.log(`[@propsto/data] Package root: ${packageRoot}`);
    console.log(`[@propsto/data] Seed script path: ${seedPath}`);

    // Neon preview branches are created from the main branch, which already
    // has the schema and migrations applied. We skip migrations and just
    // run the seed script directly with tsx.
    // DATABASE_URL is already in the environment from Vercel-Neon integration.
    console.log("[@propsto/data] Running seed script...");
    execSync(`npx tsx "${seedPath}"`, {
      stdio: "inherit",
      cwd: monorepoRoot,
      env: {
        ...process.env,
      },
    });
    console.log("[@propsto/data] Database seeded successfully!");
  } catch (error) {
    console.error("[@propsto/data] Failed to seed database:", error.message);
    // Don't fail the build if seeding fails - the app should still deploy
    // E2E tests will fail but at least we can debug
  }
}

main();
