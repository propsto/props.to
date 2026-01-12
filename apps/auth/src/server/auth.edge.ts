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

      return baseUrl;
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    newUser: "/welcome",
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
  debug: constServer.PROPSTO_ENV !== "production",
  cookies: {
    sessionToken: {
      name: secureCookies
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax", // Prevents CSRF while allowing subdomain sharing
        path: "/",
        secure: secureCookies,
        domain: `${constServer.PROPSTO_HOST === "localhost" ? "" : "."}${constServer.PROPSTO_HOST}`, // Use the common domain for subdomains
      },
    },
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
