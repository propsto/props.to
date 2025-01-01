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
import { nextAuthConfig as edgeNextAuthConfig } from "./auth.edge";

function getEmailProvider(): EmailConfig | NodemailerConfig {
  if (constServer.EMAIL_PROVIDER === "resend") {
    logger("resend used");
    return Resend({
      apiKey: constServer.RESEND_API_KEY,
      from: constServer.EMAIL_FROM,
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
