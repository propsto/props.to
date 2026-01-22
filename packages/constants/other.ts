const quotes: { text: string; author?: string }[] = [
  {
    text: "We all need people who will give us feedback. That's how we improve.",
    author: "Bill Gates",
  },
  {
    text: "Criticism, like rain, should be gentle enough to nourish a man's growth without destroying his roots.",
    author: "Frank A. Clark",
  },
  {
    text: "Feedback is the breakfast of champions.",
    author: "Ken Blanchard",
  },
  {
    text: "There is no failure. Only feedback.",
    author: "Robert Allen",
  },
  {
    text: "Make feedback normal. Not a performance review.",
    author: "Ed Batista",
  },
  {
    text: "True intuitive expertise is learned from prolonged experience with good feedback on mistakes.",
    author: "Daniel Kahneman",
  },
  {
    text: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
  },
];

const errorCodes: Record<string, string> = {
  InvalidNewPassordToken: "The provided token is invalid.",
  RateLimitBlocked: "Your request was blocked by our rate limiter.",
  InvalidSession: "Your session is not valid, please signout to continue.",
} as const;

export const constOther = { quotes, errorCodes };

export const examplePropsToInput = [
  "john.doe@acme.com",
  "acme/john.doe",
  `acme/townhall-${new Date().getFullYear().toString()}`,
  "type any URI here!",
];

// Compute AUTH_URL based on environment:
// - Preview: https://auth.pr-{PR_ID}.{PROPSTO_HOST}
// - Production: https://auth.{PROPSTO_HOST} (computed, not from env var)
// Note: Auth.js v5 recommends NOT setting AUTH_URL explicitly so it can infer from headers.
// We compute it here for our internal use but avoid setting it as an env var for Auth.js.
const computeAuthUrl = (): string | undefined => {
  const isPreview =
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_PULL_REQUEST_ID;
  const host = process.env.PROPSTO_HOST;

  if (!host) return process.env.AUTH_URL;

  if (isPreview) {
    return `https://auth.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${host}`;
  }

  // For production, compute from PROPSTO_HOST instead of requiring AUTH_URL env var
  return `https://auth.${host}`;
};

export const vercelPreviewEnvVars = {
  AUTH_URL: computeAuthUrl(),

  // OAuth proxy URL - stable auth domain for Google OAuth callbacks
  // MUST be set on BOTH preview AND production for Auth.js proxy to work:
  // - Preview: uses AUTH_PROXY_HOST to proxy through production
  // - Production: enables recognition of proxy callbacks in OAuth state
  // See: https://authjs.dev/getting-started/deployment#securing-a-preview-deployment
  AUTH_REDIRECT_PROXY_URL:
    process.env.AUTH_PROXY_HOST || process.env.PROPSTO_HOST
      ? `https://auth.${process.env.AUTH_PROXY_HOST ?? process.env.PROPSTO_HOST}/api/auth`
      : undefined,

  // Compute PROPSTO_APP_URL similarly to AUTH_URL
  PROPSTO_APP_URL: (() => {
    const isPreview =
      process.env.VERCEL_ENV === "preview" &&
      process.env.VERCEL_GIT_PULL_REQUEST_ID;
    const host = process.env.PROPSTO_HOST;

    if (!host) return process.env.PROPSTO_APP_URL;

    if (isPreview) {
      return `https://app.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${host}`;
    }

    // For production, compute from PROPSTO_HOST
    return `https://app.${host}`;
  })(),
};
