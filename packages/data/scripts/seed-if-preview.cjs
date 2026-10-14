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
 * Steps:
 * 1. Run migrations using prisma-migration.config.ts (minimal config that only needs DATABASE_URL)
 * 2. Run the seed script to populate test data
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

  // The seed wipes every table. Only the Neon Vercel integration provisions a
  // per-git-branch database, and it always sets DATABASE_URL_UNPOOLED next to
  // DATABASE_URL. A project with a hand-set DATABASE_URL (the app project pointed
  // preview builds at production until 2026-09-27) must never be seeded.
  // ponytail: heuristic marker; replace with an explicit PREVIEW_DB_SEED=1 once every project uses the integration
  if (!process.env.DATABASE_URL_UNPOOLED) {
    console.error(
      "[@propsto/data] DATABASE_URL_UNPOOLED is not set, so this is not a Neon per-branch preview database. Refusing to migrate or seed it.",
    );
    return;
  }

  console.log("[@propsto/data] Preview environment detected, seeding database...");

  // This script is at packages/data/scripts, so package root is one level up
  const packageRoot = path.resolve(__dirname, "..");
  const seedPath = path.join(packageRoot, "seed.ts");
  const migrationConfigPath = path.join(packageRoot, "prisma-migration.config.ts");
  // Monorepo root is two levels up from package root
  const monorepoRoot = path.resolve(packageRoot, "../..");

  console.log(`[@propsto/data] Package root: ${packageRoot}`);
  console.log(`[@propsto/data] Migration config: ${migrationConfigPath}`);
  console.log(`[@propsto/data] Seed script path: ${seedPath}`);

  // Step 1: Run migrations using minimal config that only requires DATABASE_URL
  // The main prisma.config.ts uses @propsto/constants which validates all env vars,
  // but during Vercel build not all env vars are available. prisma-migration.config.ts
  // only requires DATABASE_URL.
  console.log("[@propsto/data] Running migrations...");
  // A freshly created Neon preview branch can take a few seconds before its endpoint
  // accepts connections (P1001), so retry before treating it as a real failure.
  const MIGRATE_ATTEMPTS = 5;
  for (let attempt = 1; ; attempt++) {
    try {
      execSync(`npx prisma migrate deploy --config="${migrationConfigPath}"`, {
        stdio: "inherit",
        cwd: packageRoot,
        env: {
          ...process.env,
        },
      });
      console.log("[@propsto/data] Migrations applied successfully!");
      break;
    } catch (error) {
      if (attempt < MIGRATE_ATTEMPTS) {
        console.warn(`[@propsto/data] Migration attempt ${attempt} failed, retrying in 10s...`);
        execSync("sleep 10");
        continue;
      }
      // A schema that did not migrate must not deploy: the app would boot against stale tables.
      console.error("[@propsto/data] Migration failed, aborting build:", error.message);
      process.exit(1);
    }
  }

  try {
    // Step 2: Run the seed script directly with tsx
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
