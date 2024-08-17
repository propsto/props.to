import { resolve } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { constCommon } from "./common";

// Load .env
const envPath = resolve("../../.env");
config({ path: envPath });

export const constClient = createEnv({
  client: {
    // Nothing here yet
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,
  extends: [constCommon],
});
