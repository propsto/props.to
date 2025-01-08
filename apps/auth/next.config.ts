import { type NextConfig } from "next";
import dotenvExpand from "dotenv-expand";

const { parsed: env } = dotenvExpand.expand({
  parsed: { ...process.env } as Record<string, string>,
});

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
