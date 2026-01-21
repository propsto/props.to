// More config options in file://./auth.edge.ts

import { type EmailConfig } from "next-auth/providers/email";
import { createLogger } from "@propsto/logger";
import { getUserByEmailAndPassword } from "@propsto/data/repos/user";
import Passkey from "next-auth/providers/passkey";
import { PropstoAdapter, Role } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import NodemailerProvider, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { constServer } from "@propsto/constants/server";
import NextAuth, { CredentialsSignin } from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import { type OAuthConfig } from "next-auth/providers";
import { nextAuthConfig as edgeNextAuthConfig } from "./auth.edge";

// Set AUTH_REDIRECT_PROXY_URL on process.env for Auth.js to read
// This enables OAuth proxy pattern for preview environments
if (constServer.AUTH_REDIRECT_PROXY_URL) {
  process.env.AUTH_REDIRECT_PROXY_URL = constServer.AUTH_REDIRECT_PROXY_URL;
}

const logger = createLogger("authConfig");
class CustomError extends CredentialsSignin {
  code = "custom";
}

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

const allowedDomains: string[] = (
  constServer.GOOGLE_ALLOWED_HOSTED_DOMAINS ?? ""
).split(",");

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
        profile: async (profile: GoogleProfile, tokens) => {
          // Validate hosted domain if GOOGLE_ALLOWED_HOSTED_DOMAINS is configured
          if (
            allowedDomains.length > 0 &&
            allowedDomains[0] !== "" &&
            (!profile.hd || !allowedDomains.includes(profile.hd))
          ) {
            throw Error("Google Hosted Domain not allowed");
          }

          // Check if user is a Google Workspace admin
          let isGoogleWorkspaceAdmin = false;
          try {
            if (tokens.access_token && profile.hd) {
              const response = await fetch(
                `https://admin.googleapis.com/admin/directory/v1/users/${profile.email}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    Accept: "application/json",
                  },
                },
              );

              if (response.ok) {
                const adminData = (await response.json()) as Record<
                  string,
                  unknown
                >;
                isGoogleWorkspaceAdmin = Boolean(adminData?.isAdmin);
              }
            }
          } catch (error) {
            logger("Error fetching admin directory data:", error);
          }

          return {
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            image: profile.picture,
            hostedDomain: profile.hd, // Pass through for storage and onboarding logic
            isGoogleWorkspaceAdmin, // Flag for onboarding step logic
            role: Role.USER, // Always USER, org roles are in OrganizationMember
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
        const result = await getUserByEmailAndPassword({
          email: email as string,
          password: password as string,
        });
        if (result.data) return result.data;
        if (result.error) throw new CustomError(result.error);
        return null;
      },
    }),
  ],
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth(nextAuthConfig);
