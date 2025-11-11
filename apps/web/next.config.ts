import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  experimental: {
    serverActions: {},
  },
} satisfies NextConfig;
