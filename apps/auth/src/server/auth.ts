import NextAuth from "next-auth";
import "next-auth/jwt";
import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";
import { PrismaClient, PrismaAdapter } from "@propsto/prisma";
import { z } from "zod";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";

const prisma = new PrismaClient();

const sessionShape = z.object({
  user: z.object({
    name: z.string(),
  }),
});

const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend,
    Passkey,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: () => {
        console.log(">>>>>> CredentialsProvider.authorize");
        return { name: "Leo", email: "hello@leog.me", image: "", id: "1" };
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      console.log(">>>>>> callbacks.authorized");
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return Boolean(auth);
      return true;
    },
    jwt({ token, trigger, session }) {
      console.log(">>>>>> callbacks.jwt");
      console.log({ token, trigger, session });
      const data = sessionShape.parse(session);
      if (trigger === "update") token.name = data.user.name;
      return token;
    },
    session({ session, token }) {
      console.log(">>>>>> callbacks.session");
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
  pages: {
    signIn: "/signin",
  },
  debug: process.env.NODE_ENV !== "production",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
