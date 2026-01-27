import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
} satisfies NextConfig;
