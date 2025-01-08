import { type NextConfig } from "next";
import { env } from "@propsto/constants/vercel";

export default {
  experimental: {
    serverActions: {},
  },
  env,
} satisfies NextConfig;
