import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  reactStrictMode: true,
  // We run these separately in CI, so we can skip them here.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
