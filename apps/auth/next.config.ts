import { type NextConfig } from "next";

export default {
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
  eslint: {
    // Disable the warning about Next.js plugin not being detected
    ignoreDuringBuilds: false,
  },
} satisfies NextConfig;
