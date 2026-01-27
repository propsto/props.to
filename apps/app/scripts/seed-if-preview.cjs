#!/usr/bin/env node

/**
 * Seed database if running in Vercel preview environment.
 * This ensures E2E tests have the necessary test data.
 */

const { execSync } = require("child_process");

const VERCEL_ENV = process.env.VERCEL_ENV;

async function main() {
  console.log(`VERCEL_ENV: ${VERCEL_ENV}`);

  if (VERCEL_ENV !== "preview") {
    console.log("Not a preview environment, skipping seed.");
    return;
  }

  console.log("Preview environment detected, seeding database...");

  try {
    // Run the seed command from the data package
    execSync("pnpm --filter @propsto/data db-seed", {
      stdio: "inherit",
      cwd: process.cwd().replace(/\/apps\/app$/, ""), // Go to monorepo root
    });
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error.message);
    // Don't fail the build if seeding fails - the app should still deploy
    // E2E tests will fail but at least we can debug
  }
}

main();
