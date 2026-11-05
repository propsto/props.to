import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  // The web zone proxies props.to/<user> to this app while keeping the apex
  // URL, so relative /_next/* asset URLs would resolve against props.to (the
  // web zone) and 404. Serve this zone's assets under a unique prefix the web
  // middleware forwards here, and map it back to /_next so direct app.props.to
  // visits still resolve. (Next.js Multi-Zones asset routing.)
  assetPrefix: "/app-static",
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/app-static/_next/:path*", destination: "/_next/:path*" },
      ],
    };
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  reactStrictMode: true,
} satisfies NextConfig;
