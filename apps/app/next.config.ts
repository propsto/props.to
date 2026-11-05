import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { type NextConfig } from "next";

export default {
  env: {
    ...vercelPreviewEnvVars,
  },
  // The web zone proxies props.to/<user> to this app while keeping the apex
  // URL, so relative /_next/* asset URLs would resolve against props.to (the
  // web zone) and 404. Emit asset URLs against this zone's own origin instead,
  // so the browser loads /_next/* straight from app.props.to (which has them).
  // A relative prefix doesn't survive Vercel's asset CDN in production, so this
  // must be the absolute origin. (Next.js Multi-Zones asset routing.)
  assetPrefix: vercelPreviewEnvVars.PROPSTO_APP_URL,
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    // Feedback submit (and other public-page Server Actions) run in this zone
    // but are posted from the apex/preview origin the page is proxied under, so
    // the action's same-origin check must allow those hosts. (Multi-Zones.)
    serverActions: {
      allowedOrigins: ["props.to", "*.props.build"],
    },
  },
  reactStrictMode: true,
} satisfies NextConfig;
