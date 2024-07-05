import { resolve } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";

// Load .env
const envPath = resolve(".env");
config({ path: envPath });

export const constServer = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_SERVER: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    AUTH_SECRET: z
      .string()
      .min(1, "Run `openssl rand -base64 32` to set an AUTH_SECRET"),
    PROPSTO_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
