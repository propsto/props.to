import NextAuth from "next-auth";
import "next-auth/jwt";
import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";
import { PropstoAdapter } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import NodemailerProvider, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { constServer, constOther } from "@propsto/constants";
import { type EmailConfig } from "next-auth/providers/email";
import { logger } from "@propsto/logger?authConfig";

function getEmailProvider(): EmailConfig | NodemailerConfig {
  if (constOther.emailProvider === "resend") {
    logger("resend used");
    return Resend({ apiKey: constServer.RESEND_API_KEY });
  }
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
        email: { type: "email" },
        password: { type: "password" },
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
    verifyRequest: "/verify",
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
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
