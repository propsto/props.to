import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";

// Load .env
config();

export const client = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {
    // Nothing here yet
  },
  runtimeEnv: process.env,
});
