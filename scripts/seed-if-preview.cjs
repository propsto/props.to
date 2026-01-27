#!/usr/bin/env node

/**
 * Seed database if running in Vercel preview environment.
 * This ensures E2E tests have the necessary test data.
 *
 * In Vercel, DATABASE_URL is injected by the Vercel-Neon integration,
 * so we run the seed script directly without needing dotenv.
 *
 * This script should be called from any app's vercel-build script:
 *   "vercel-build": "node ../../scripts/seed-if-preview.cjs && next build"
 */

const { execSync } = require("child_process");
const path = require("path");

const VERCEL_ENV = process.env.VERCEL_ENV;

async function main() {
  console.log(`VERCEL_ENV: ${VERCEL_ENV}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "[SET]" : "[NOT SET]"}`);

  if (VERCEL_ENV !== "preview") {
    console.log("Not a preview environment, skipping seed.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set, cannot seed database.");
    return;
  }

  console.log("Preview environment detected, seeding database...");

  try {
    // This script is at /scripts, so root is one level up
    const monorepoRoot = path.resolve(__dirname, "..");
    const seedPath = path.join(monorepoRoot, "packages", "data", "seed.ts");
    const schemaPath = path.join(monorepoRoot, "packages", "data", "schema.prisma");

    console.log(`Monorepo root: ${monorepoRoot}`);
    console.log(`Schema path: ${schemaPath}`);
    console.log(`Seed script path: ${seedPath}`);

    // For Neon preview branches, the database is created from the main branch
    // which already has the schema applied. We just need to run migrations
    // to ensure any new migrations are applied.
    // Use --url flag to pass DATABASE_URL directly since prisma.config.ts
    // uses @propsto/constants which has Zod validation that may fail.
    console.log("Running migrations...");
    execSync(`npx prisma migrate deploy --schema="${schemaPath}" --url="${process.env.DATABASE_URL}"`, {
      stdio: "inherit",
      cwd: monorepoRoot,
      env: {
        ...process.env,
      },
    });
    console.log("Migrations applied successfully!");

    // Then run the seed script directly with tsx
    // DATABASE_URL is already in the environment from Vercel-Neon integration
    console.log("Running seed script...");
    execSync(`npx tsx "${seedPath}"`, {
      stdio: "inherit",
      cwd: monorepoRoot,
      env: {
        ...process.env,
      },
    });
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error.message);
    // Don't fail the build if seeding fails - the app should still deploy
    // E2E tests will fail but at least we can debug
  }
}

main();
