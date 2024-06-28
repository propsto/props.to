import NextAuth from "next-auth";
import "next-auth/jwt";
import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";
import { PrismaClient, PrismaAdapter } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/nodemailer";
import { server } from "@propsto/constants";

const prisma = new PrismaClient();

const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({}),
    Passkey,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: () => {
        return { name: "Leo", email: "hello@leog.me", image: "", id: "1" };
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return Boolean(auth);
      return true;
    },
    jwt: ({ token, user }) => {
      if (!token.email) {
        return {};
      }
      token.user = user;
      return token;
    },
    session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
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
    createUser(message) {
      const params = {
        user: {
          name: message.user.name,
          email: message.user.email,
        },
      };
      // eslint-disable-next-line no-console -- Lala
      console.log(params);
      //await sendWelcomeEmail(params); // <-- send welcome email
    },
  },
  debug: server.NODE_ENV !== "production",
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
