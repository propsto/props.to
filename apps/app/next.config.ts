import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
