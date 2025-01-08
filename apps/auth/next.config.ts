import { type NextConfig } from "next";
import { env } from "@propsto/constants/vercel";

export default {
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
  env,
} satisfies NextConfig;
