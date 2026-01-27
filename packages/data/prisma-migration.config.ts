/**
 * Minimal Prisma config for running migrations during Vercel builds.
 * This config only requires DATABASE_URL to be set, unlike the main
 * prisma.config.ts which validates all environment variables.
 */
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
