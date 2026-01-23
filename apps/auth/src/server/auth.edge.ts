// More config options in file://./auth.server.ts

import NextAuth from "next-auth";
import { type JWT } from "next-auth/jwt";
import type {
  Account,
  NextAuthConfig,
  User as NextAuthUser,
  Profile,
} from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { constServer } from "@propsto/constants/server";
import { updateUser } from "@propsto/data/repos";
import { createLogger } from "@propsto/logger";

const logger = createLogger("auth");
const secureCookies = constServer.PROPSTO_ENV === "production";

// Shared cookie domain for OAuth proxy pattern - allows cookies to be shared
// between production (auth.props.to) and preview (auth.pr-XX.props.to)
const cookieDomain =
  constServer.PROPSTO_HOST === "localhost"
    ? undefined
    : `.${constServer.PROPSTO_HOST}`;

// Common cookie options for all auth cookies
const sharedCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: secureCookies,
  domain: cookieDomain,
};

// Helper to create cookie config with secure prefix when needed
const createCookieConfig = (name: string) => ({
  name: secureCookies ? `__Secure-authjs.${name}` : `authjs.${name}`,
  options: sharedCookieOptions,
});

export const nextAuthConfig = {
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth);
    },
    jwt: ({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: { user: Record<string, string> };
    }) => {
      if (!token.email) {
        return null;
      }
      if (user) {
        token.user = user;
      }
      if (trigger === "update" && session) {
        logger("authConfig:jwt:update", session.user);
        token.user = session.user;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: (token.user ?? session.user) as NextAuthUser,
      };
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      // Allow redirects to any subdomain of PROPSTO_HOST (for preview environments)
      // With shared domain (e.g., auth.props.to and auth.pr-35.props.to both under .props.to),
      // cookies are shared and OAuth proxy pattern works correctly
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        // Allow redirects to any subdomain of PROPSTO_HOST
        if (hostname.endsWith(constServer.PROPSTO_HOST)) {
          return url;
        }
      } catch {
        // Invalid URL, fall through to default
      }

      return baseUrl;
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  events: {
    linkAccount: async ({ user }) => {
      logger("authConfig:events:linkAccount", { user });
      if (user.id) {
        await updateUser(user.id, {
          emailVerified: new Date(),
        });
      }
    },
  },
  debug:
    constServer.PROPSTO_ENV !== "production" ||
    process.env.DEBUG_AUTH === "true",
  // All cookies use shared domain for OAuth proxy pattern between
  // production (auth.props.to) and preview (auth.pr-XX.props.to)
  cookies: {
    sessionToken: createCookieConfig("session-token"),
    state: createCookieConfig("state"),
    pkceCodeVerifier: createCookieConfig("pkce.code_verifier"),
    callbackUrl: createCookieConfig("callback-url"),
  },
} satisfies NextAuthConfig;

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth(nextAuthConfig);

declare module "next-auth" {
  interface User {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | null;
    username?: string;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}
