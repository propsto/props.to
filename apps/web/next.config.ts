import { type NextConfig } from "next";
import dotenvExpand from "dotenv-expand";

const { parsed: env } = dotenvExpand.expand({
  parsed: { ...process.env } as Record<string, string>,
});

export default {
  experimental: {
    serverActions: {},
  },
  env,
} satisfies NextConfig;
