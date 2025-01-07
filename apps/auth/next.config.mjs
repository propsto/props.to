import dotenvExpand from "dotenv-expand";

dotenvExpand.expand({ parsed: { ...process.env } });

/** @type {import("next").NextConfig} */
export default {
  images: {
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
};
