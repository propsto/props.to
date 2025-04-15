import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

process.env.EMAIL_PROVIDER =
  process.env.RESEND_API_KEY && process.env.PROPSTO_ENV === "production"
    ? "resend"
    : "email";

export const constServer = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_SERVER: z.string().optional(),
    EMAIL_FROM: z.string(),
    AUTH_SECRET: z
      .string()
      .min(1, "Run `openssl rand -base64 32` to set an AUTH_SECRET"),
    PROPSTO_ENV: z.enum(["development", "test", "production"]),
    PROPSTO_APP_URL: z.preprocess(
      str =>
        process.env.VERCEL_ENV === "preview" &&
        process.env.VERCEL_GIT_PULL_REQUEST_ID &&
        process.env.PROPSTO_HOST
          ? `https://app.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${process.env.PROPSTO_HOST}`
          : str,
      z.string().url(),
    ),
    AUTH_URL: z.preprocess(
      str =>
        process.env.VERCEL_ENV === "preview" &&
        process.env.VERCEL_GIT_PULL_REQUEST_ID &&
        process.env.PROPSTO_HOST
          ? `https://auth.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${process.env.PROPSTO_HOST}`
          : str,
      z.string().url(),
    ),
    PROPSTO_HOST: z.string(),
    EMAIL_PROVIDER: z.string(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_ALLOWED_HOSTED_DOMAINS: z.string().optional(),
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
