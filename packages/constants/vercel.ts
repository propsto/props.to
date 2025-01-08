import dotenvExpand from "dotenv-expand";

const { parsed } = dotenvExpand.expand({
  parsed: {
    AUTH_URL: "https://auth-git-$VERCEL_GIT_COMMIT_REF-propsto.vercel.app",
    PROPSTO_HOST: "vercel.app",
    PROPSTO_APP_URL:
      "https://app-git-$VERCEL_GIT_COMMIT_REF-propsto.vercel.app",
  },
});

const out = parsed?.env ?? {};

export const env = out;
