import { type NextConfig } from "next";

export default {
  reactStrictMode: true,
  // We run these separately in CI, so we can skip them here.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
