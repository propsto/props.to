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
  OAuthAccountNotLinked:
    "An account with this email already exists. Please verify your identity to link your Google account.",
  AccountLinkingExpired:
    "Your account linking session has expired. Please try signing in with Google again.",
  AccountLinkingFailed: "Failed to link your Google account. Please try again.",
} as const;

export const constOther = { quotes, errorCodes };

export const examplePropsToInput = [
  "john.doe@acme.com",
  "acme/john.doe",
  `acme/townhall-${new Date().getFullYear().toString()}`,
  "type any URI here!",
];

/**
 * Reserved slugs that cannot be used as usernames or organization names.
 * These match routes in the web app and common reserved paths.
 */
export const reservedSlugs = [
  // Current web routes
  "request-early-access",
  "api",

  // Common marketing pages (current or future)
  "about",
  "pricing",
  "blog",
  "docs",
  "help",
  "support",
  "contact",
  "careers",
  "press",
  "partners",
  "enterprise",
  "features",
  "integrations",
  "changelog",
  "roadmap",
  "status",

  // Legal pages
  "privacy",
  "terms",
  "cookies",
  "gdpr",
  "security",
  "compliance",

  // Auth/account related
  "login",
  "signin",
  "signup",
  "register",
  "logout",
  "signout",
  "auth",
  "account",
  "settings",
  "profile",
  "dashboard",
  "admin",
  "app",

  // Common reserved words
  "www",
  "mail",
  "email",
  "ftp",
  "cdn",
  "assets",
  "static",
  "images",
  "img",
  "css",
  "js",
  "fonts",
  "media",
  "downloads",
  "files",

  // Props.to specific
  "props",
  "propsto",
  "feedback",
  "templates",
  "links",
  "goals",
  "reports",
  "organizations",
  "teams",
  "groups",
  "users",
  "members",

  // Misc reserved
  "null",
  "undefined",
  "true",
  "false",
  "new",
  "edit",
  "delete",
  "create",
  "update",
  "search",
  "explore",
  "trending",
  "popular",
  "recent",
  "all",
  "me",
  "my",
  "you",
  "home",
  "index",
  "root",
  "system",
  "internal",
  "test",
  "demo",
  "example",
] as const;

export type ReservedSlug = (typeof reservedSlugs)[number];

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return reservedSlugs.includes(slug.toLowerCase() as ReservedSlug);
}

// Compute AUTH_URL based on environment:
// - Development: http://{PROPSTO_AUTH_HOSTNAME}:{PROPSTO_AUTH_PORT} (from env vars)
// - Preview: https://auth.pr-{PR_ID}.{PROPSTO_HOST}
// - Production: https://auth.{PROPSTO_HOST} (computed, not from env var)
// Note: Auth.js v5 recommends NOT setting AUTH_URL explicitly so it can infer from headers.
// We compute it here for our internal use but avoid setting it as an env var for Auth.js.
const computeAuthUrl = (): string | undefined => {
  const isPreview =
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_PULL_REQUEST_ID;
  const isDevelopment = process.env.PROPSTO_ENV === "development";
  const host = process.env.PROPSTO_HOST;

  if (!host) return process.env.AUTH_URL;

  if (isDevelopment) {
    const authHostname = process.env.PROPSTO_AUTH_HOSTNAME;
    const authPort = process.env.PROPSTO_AUTH_PORT;
    if (authHostname && authPort) {
      return `http://${authHostname}:${authPort}`;
    }
    return process.env.AUTH_URL;
  }

  if (isPreview) {
    return `https://auth.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${host}`;
  }

  // For production, compute from PROPSTO_HOST instead of requiring AUTH_URL env var
  return `https://auth.${host}`;
};

export const vercelPreviewEnvVars = {
  AUTH_URL: computeAuthUrl(),

  // Compute PROPSTO_APP_URL similarly to AUTH_URL
  PROPSTO_APP_URL: (() => {
    const isPreview =
      process.env.VERCEL_ENV === "preview" &&
      process.env.VERCEL_GIT_PULL_REQUEST_ID;
    const isDevelopment = process.env.PROPSTO_ENV === "development";
    const host = process.env.PROPSTO_HOST;

    if (!host) return process.env.PROPSTO_APP_URL;

    if (isDevelopment) {
      const appHostname = process.env.PROPSTO_APP_HOSTNAME;
      const appPort = process.env.PROPSTO_APP_PORT;
      if (appHostname && appPort) {
        return `http://${appHostname}:${appPort}`;
      }
      return process.env.PROPSTO_APP_URL;
    }

    if (isPreview) {
      return `https://app.pr-${process.env.VERCEL_GIT_PULL_REQUEST_ID}.${host}`;
    }

    // For production, compute from PROPSTO_HOST
    return `https://app.${host}`;
  })(),
};
