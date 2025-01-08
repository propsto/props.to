import { type NextConfig } from "next";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand({
  parsed: { ...process.env } as Record<string, string>,
});

export default {
  reactStrictMode: true,

  /**
   * If you have the "experimental: \{ appDir: true \}" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  // We run these separately in CI, so we can skip them here.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
