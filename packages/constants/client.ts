import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { vercelPreviewEnvVars } from "./other";

export const constClient = createEnv({
  client: {
    NEXT_PUBLIC_AUTH_URL: z.preprocess(
      () => vercelPreviewEnvVars.AUTH_URL,
      z.string().url(),
    ),
    NEXT_PUBLIC_PROPSTO_APP_URL: z.preprocess(
      () => vercelPreviewEnvVars.PROPSTO_APP_URL,
      z.string().url(),
    ),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "NEXT_PUBLIC_",

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,
});
