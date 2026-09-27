import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { bootstrapTemplates } from "../bootstrap";

// Idempotent: safe to run on production after every migration.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

bootstrapTemplates(prisma)
  .then(() => console.log("Global templates bootstrapped."))
  .catch(e => {
    console.error("Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
