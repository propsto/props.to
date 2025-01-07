// More config options in file://./auth.edge.ts

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
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import { type OAuthConfig } from "next-auth/providers";
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

function getGoogleProvider(): [OAuthConfig<GoogleProfile>] | [] {
  if (constServer.GOOGLE_CLIENT_ID && constServer.GOOGLE_CLIENT_SECRET) {
    return [
      GoogleProvider({
        clientId: constServer.GOOGLE_CLIENT_ID,
        clientSecret: constServer.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope:
              "openid email profile https://www.googleapis.com/auth/admin.directory.user.readonly",
          },
        },
        checks: ["none"],
        profile: (profile: GoogleProfile) => {
          return {
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            /*emailVerified: profile.email_verified ? new Date() : null, << DOESN'T WORK, events.linkAccount takes care of this */
            image: profile.picture,
          };
        },
      }),
    ];
  }
  return [];
}

export const nextAuthConfig = {
  ...edgeNextAuthConfig,
  adapter: PropstoAdapter(),
  providers: [
    getEmailProvider(),
    Passkey,
    ...getGoogleProvider(),
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
