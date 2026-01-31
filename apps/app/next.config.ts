// Trigger rebuild for E2E tests
import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
