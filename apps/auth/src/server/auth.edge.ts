// More config options in file://./auth.server.ts

import NextAuth from "next-auth";
import { type JWT } from "next-auth/jwt";
import type { NextAuthConfig, User as NextAuthUser } from "next-auth";
import { constServer } from "@propsto/constants/server";
import { updateUser } from "@propsto/data/repos";

const secureCookies = constServer.PROPSTO_ENV === "production";

export const nextAuthConfig = {
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth);
    },
    jwt: ({ token, user }: { token: JWT; user?: NextAuthUser }) => {
      if (!token.email) {
        return null;
      }
      if (user) {
        token.user = user;
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
    createUser(message) {
      // eslint-disable-next-line no-console -- To tackle
      console.log("next-auth > event > createUser", message);
      //await sendWelcomeEmail(params); // <-- send welcome email
    },
    linkAccount: async ({ user }) => {
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
        domain:
          process.env.PROPSTO_HOST === "localhost"
            ? process.env.PROPSTO_HOST
            : `.${process.env.PROPSTO_HOST ?? ""}`, // Use the common domain for subdomains
      },
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);

declare module "next-auth" {
  interface User {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | null;
    username?: string;
    email?: string | null;
    image?: string | null;
  }
}
