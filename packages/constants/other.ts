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

export const vercelPreviewEnvVars = {
  AUTH_URL:
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_PULL_REQUEST_ID &&
    process.env.PROPSTO_HOST
      ? `https://auth.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${process.env.PROPSTO_HOST}`
      : process.env.AUTH_URL,

  // OAuth proxy URL - stable auth domain for Google OAuth callbacks
  // Auth.js uses this to encode the preview URL in the OAuth state parameter
  AUTH_REDIRECT_PROXY_URL:
    process.env.VERCEL_ENV === "preview" && process.env.PROPSTO_HOST
      ? `https://auth.${process.env.PROPSTO_HOST}/api/auth`
      : undefined,

  PROPSTO_APP_URL:
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_PULL_REQUEST_ID &&
    process.env.PROPSTO_HOST
      ? `https://app.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${process.env.PROPSTO_HOST}`
      : process.env.PROPSTO_APP_URL,
};
