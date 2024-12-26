import NextAuth from "next-auth";
import { type JWT } from "next-auth/jwt";
import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig, User as NextAuthUser } from "next-auth";
import { PropstoAdapter } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import NodemailerProvider, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { constServer } from "@propsto/constants/server";
import { type EmailConfig } from "next-auth/providers/email";
import { logger } from "@propsto/logger?authConfig";
import { getUserByEmailAndPassword } from "@propsto/data/repos/user";

function getEmailProvider(): EmailConfig | NodemailerConfig {
  if (constServer.EMAIL_PROVIDER === "resend") {
    logger("resend used");
    return Resend({ apiKey: constServer.RESEND_API_KEY });
  }
  logger("nodemailer used");
  return NodemailerProvider({
    id: "email",
    name: "email",
    server: constServer.EMAIL_SERVER,
    from: constServer.EMAIL_FROM,
  });
}

const config = {
  adapter: PropstoAdapter(),
  providers: [
    getEmailProvider(),
    Passkey,
    Credentials({
      credentials: {
        email: { type: "email", required: true },
        password: { type: "password", required: true },
      },
      authorize: async ({ email, password }) => {
        if (!email || !password) return null;
        const user = await getUserByEmailAndPassword({ email, password });
        if (user.data) return user.data;
        return null;
      },
    }),
  ],
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
  debug: constServer.PROPSTO_ENV !== "production",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

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
