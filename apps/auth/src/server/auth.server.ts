// More config options in file://./auth.edge.ts

import { type EmailConfig } from "next-auth/providers/email";
import { createLogger } from "@propsto/logger";
import {
  getUserByEmailAndPassword,
  getUserByEmail,
  createUser,
  updateUser,
  getUserByAccount,
} from "@propsto/data/repos/user";
import { createPendingAccountLink } from "@propsto/data/repos/pending-account-link";
import { linkAccount } from "@propsto/data/repos/account";
import Passkey from "next-auth/providers/passkey";
import { PropstoAdapter } from "@propsto/data";
import Credentials from "next-auth/providers/credentials";
import NodemailerProvider, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { constServer } from "@propsto/constants/server";
import NextAuth, { CredentialsSignin } from "next-auth";
import { nextAuthConfig as edgeNextAuthConfig } from "./auth.edge";

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

interface GoogleTokenInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  hd?: string; // Hosted domain (Google Workspace)
  exp: string;
}

async function validateGoogleIdToken(
  idToken: string,
): Promise<GoogleTokenInfo | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );
    if (!response.ok) {
      logger("Google token validation failed:", response.status);
      return null;
    }
    const tokenInfo = (await response.json()) as GoogleTokenInfo;

    // Verify the token is for our app
    if (tokenInfo.aud !== constServer.GOOGLE_CLIENT_ID) {
      logger("Google token audience mismatch");
      return null;
    }

    // Check expiration
    if (Number(tokenInfo.exp) * 1000 < Date.now()) {
      logger("Google token expired");
      return null;
    }

    return tokenInfo;
  } catch (error) {
    logger("Error validating Google token:", error);
    return null;
  }
}

function getGoogleCredentialsProvider() {
  if (!constServer.GOOGLE_CLIENT_ID || !constServer.GOOGLE_CLIENT_SECRET) {
    return [];
  }

  return [
    Credentials({
      id: "google-one-tap",
      name: "Google",
      credentials: {
        credential: { type: "text" },
      },
      authorize: async ({ credential }) => {
        if (!credential || typeof credential !== "string") {
          throw new CustomError("Missing Google credential");
        }

        // Validate the Google ID token
        const tokenInfo = await validateGoogleIdToken(credential);
        if (!tokenInfo) {
          throw new CustomError("Invalid Google credential");
        }

        // Validate hosted domain if configured
        if (
          allowedDomains.length > 0 &&
          allowedDomains[0] !== "" &&
          (!tokenInfo.hd || !allowedDomains.includes(tokenInfo.hd))
        ) {
          throw new CustomError("Google Workspace domain not allowed");
        }

        const email = tokenInfo.email;
        const providerAccountId = tokenInfo.sub;

        // Check if Google account is already linked to a user
        const existingGoogleAccount = await getUserByAccount({
          provider: "google-one-tap",
          providerAccountId,
        });

        if (existingGoogleAccount?.data) {
          // User exists with linked Google account - return them
          logger("Google sign-in: existing user with linked account", {
            email,
          });
          return existingGoogleAccount.data;
        }

        // Check if user with this email already exists
        const existingUser = await getUserByEmail(email);

        if (existingUser.data) {
          // User exists but Google not linked - create pending link
          logger("Google sign-in: existing user needs account linking", {
            email,
          });

          const pendingLink = await createPendingAccountLink({
            email,
            provider: "google-one-tap",
            providerAccountId,
            hostedDomain: tokenInfo.hd,
            isGoogleWorkspaceAdmin: false, // Can't check without access token
          });

          if (pendingLink.success && pendingLink.data) {
            // Return a special error that the client can handle
            throw new CustomError(
              `ACCOUNT_LINKING_REQUIRED:${pendingLink.data.token}`,
            );
          }

          throw new CustomError("Failed to create account link");
        }

        // New user - create account and link Google
        logger("Google sign-in: creating new user", { email });

        const newUser = await createUser({
          email,
          hostedDomain: tokenInfo.hd,
          isGoogleWorkspaceAdmin: false,
        });

        if (!newUser.data) {
          throw new CustomError("Failed to create user");
        }

        // Update with additional profile info from Google
        await updateUser(newUser.data.id, {
          firstName: tokenInfo.given_name,
          lastName: tokenInfo.family_name,
          image: tokenInfo.picture,
          emailVerified: new Date(), // Google verified the email
        });

        // Link the Google account
        await linkAccount({
          userId: newUser.data.id,
          type: "oidc",
          provider: "google-one-tap",
          providerAccountId,
        });

        // Return user with updated fields
        return {
          ...newUser.data,
          firstName: tokenInfo.given_name,
          lastName: tokenInfo.family_name,
          image: tokenInfo.picture,
          emailVerified: new Date(),
        };
      },
    }),
  ];
}

export const nextAuthConfig = {
  ...edgeNextAuthConfig,
  adapter: PropstoAdapter(),
  providers: [
    getEmailProvider(),
    Passkey,
    ...getGoogleCredentialsProvider(),
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
