import { type EmailConfig } from "next-auth/providers/email";
import { logger } from "@propsto/logger?authConfig";
import { getUserByEmailAndPassword } from "@propsto/data/repos/user";
import Passkey from "next-auth/providers/passkey";
import { PropstoAdapter } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import NodemailerProvider, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { constServer } from "@propsto/constants/server";
import NextAuth from "next-auth";
import { sendVerificationRequest } from "../lib/auth-send-request";
import { nextAuthConfig as edgeNextAuthConfig } from "./auth.edge";

function parseUrl(url?: string): {
  origin: string;
  host: string;
  path: string;
  base: string;
  toString: () => string;
} {
  let outUrl: string | undefined;
  const defaultUrl = new URL("http://localhost:3000/api/auth");

  if (url && !url.startsWith("http")) {
    outUrl = `https://${url}`;
  }

  const _url = new URL(outUrl ?? defaultUrl);
  const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, "");

  const base = `${_url.origin}${path}`;

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  };
}

// eslint-disable-next-line no-console -- debug
console.log({
  baseUrl: parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
  basePath: parseUrl(process.env.NEXTAUTH_URL).path,
  baseUrlServer: parseUrl(
    process.env.NEXTAUTH_URL_INTERNAL ??
      process.env.NEXTAUTH_URL ??
      process.env.VERCEL_URL,
  ).origin,
  basePathServer: parseUrl(
    process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL,
  ).path,
  _lastSync: 0,
  _session: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- debug
  _getSession: () => {},
  nextAuthUrl: process.env.NEXTAUTH_URL,
  vercelUrl: process.env.VERCEL_URL,
});

function getEmailProvider(): EmailConfig | NodemailerConfig {
  if (constServer.EMAIL_PROVIDER === "resend") {
    logger("resend used");
    return Resend({
      apiKey: constServer.RESEND_API_KEY,
      from: constServer.EMAIL_FROM,
      sendVerificationRequest,
    });
  }
  logger("nodemailer used");
  return NodemailerProvider({
    id: "email",
    name: "email",
    server: constServer.EMAIL_SERVER,
    from: constServer.EMAIL_FROM,
  });
}

export const nextAuthConfig = {
  ...edgeNextAuthConfig,
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);
