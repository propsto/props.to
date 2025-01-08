import { type NextConfig } from "next";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand({ parsed: { ...process.env } as Record<string, string> });

export default {
  experimental: {
    serverActions: {},
  },
} satisfies NextConfig;
