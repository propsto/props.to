// More config options in file://./auth.server.ts

import NextAuth from "next-auth";
import { type JWT } from "next-auth/jwt";
import type {
  Account,
  NextAuthConfig,
  User as NextAuthUser,
  Profile,
} from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { constServer } from "@propsto/constants/server";
import {
  updateUser,
  getUser,
  getUserByEmail,
  getUserByAccount,
  createPendingAccountLink,
} from "@propsto/data/repos";
import { createLogger } from "@propsto/logger";

const logger = createLogger("auth");
const secureCookies = constServer.PROPSTO_ENV === "production";

// Shared cookie domain - allows cookies to be shared between
// production (auth.props.to) and preview (auth.pr-XX.props.build)
const cookieDomain =
  constServer.PROPSTO_HOST === "localhost"
    ? undefined
    : `.${constServer.PROPSTO_HOST}`;

// Common cookie options for all auth cookies
const sharedCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: secureCookies,
  domain: cookieDomain,
};

// Helper to create cookie config with secure prefix when needed
const createCookieConfig = (name: string) => ({
  name: secureCookies ? `__Secure-authjs.${name}` : `authjs.${name}`,
  options: sharedCookieOptions,
});

export const nextAuthConfig = {
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth);
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as { hd?: string; email?: string };
        const email = googleProfile.email;

        if (!email) {
          return false;
        }

        // Check if user with this email already exists
        const existingUser = await getUserByEmail(email);

        // Check if a Google account is already linked to this user
        const existingGoogleAccount = await getUserByAccount({
          provider: "google",
          providerAccountId: account.providerAccountId,
        });

        // If user exists but Google account is NOT linked, initiate account linking flow
        // This handles the "future-proofing" scenario where a Google Workspace user
        // already has a personal account created via email/password
        if (existingUser.data && !existingGoogleAccount?.data) {
          logger("signIn: Existing user needs account linking", {
            email,
            hasExistingUser: true,
            hasLinkedGoogle: false,
          });

          // Check Google Workspace admin status for the pending link data
          let isGoogleWorkspaceAdmin = false;
          try {
            if (account.access_token && googleProfile.hd) {
              const response = await fetch(
                `https://admin.googleapis.com/admin/directory/v1/users/${email}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
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
            logger("signIn: Error checking admin status for linking:", error);
          }

          // Create pending account link with OAuth data
          const pendingLink = await createPendingAccountLink({
            email,
            provider: "google",
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            hostedDomain: googleProfile.hd,
            isGoogleWorkspaceAdmin,
          });

          if (pendingLink.success && pendingLink.data) {
            // Redirect to account linking flow instead of completing sign-in
            return `/welcome?step=link-account&token=${pendingLink.data.token}`;
          }

          // If pending link creation failed, redirect to error page
          return `/error?code=AccountLinkingFailed`;
        }

        // For existing users with linked Google account, update Google Workspace data on each sign-in.
        // Skip for new users - their data is set via the profile callback and adapter.createUser.
        if (existingGoogleAccount?.data) {
          let isGoogleWorkspaceAdmin = false;
          try {
            if (account.access_token && googleProfile.hd) {
              const response = await fetch(
                `https://admin.googleapis.com/admin/directory/v1/users/${email}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
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
            logger(
              "signIn: Error checking Google Workspace admin status:",
              error,
            );
          }

          await updateUser(existingGoogleAccount.data.id, {
            isGoogleWorkspaceAdmin,
            hostedDomain: googleProfile.hd,
          });
        }
      }
      return true;
    },
    async jwt({
      token,
      user,
      account,
      trigger,
      session,
    }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: { user: Record<string, string> };
    }) {
      if (!token.email) {
        return null;
      }
      if (user) {
        // For Google OAuth sign-in, fetch the updated user from DB
        // (signIn callback has already updated isGoogleWorkspaceAdmin)
        if (account?.provider === "google" && user.id) {
          const updatedUser = await getUser({ id: user.id });
          if (updatedUser.data) {
            token.user = updatedUser.data;
          } else {
            token.user = user;
          }
        } else {
          token.user = user;
        }
      }

      if (trigger === "update" && session) {
        logger("authConfig:jwt:update", session.user);
        token.user = session.user;
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

      // Allow redirects to any subdomain of PROPSTO_HOST (for preview environments)
      // e.g., auth.props.build and auth.pr-35.props.build both under .props.build
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // Allow redirects to any subdomain of PROPSTO_HOST
        if (hostname.endsWith(constServer.PROPSTO_HOST)) {
          return url;
        }
      } catch {
        // Invalid URL, fall through to default
      }

      return baseUrl;
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
    linkAccount: async ({ user }) => {
      logger("authConfig:events:linkAccount", { user });
      if (user.id) {
        await updateUser(user.id, {
          emailVerified: new Date(),
        });
      }
    },
  },
  debug:
    constServer.PROPSTO_ENV !== "production" ||
    process.env.DEBUG_AUTH === "true",
  // All cookies use shared domain between
  // production (auth.props.to) and preview (auth.pr-XX.props.build)
  cookies: {
    sessionToken: createCookieConfig("session-token"),
    state: createCookieConfig("state"),
    pkceCodeVerifier: createCookieConfig("pkce.code_verifier"),
    callbackUrl: createCookieConfig("callback-url"),
  },
} satisfies NextAuthConfig;

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth(nextAuthConfig);

declare module "next-auth" {
  interface OrganizationMembership {
    organizationId: string;
    organizationSlug: string;
    organizationName: string;
    role: string;
  }

  interface User {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: Date | null;
    username?: string;
    email?: string | null;
    image?: string | null;
    role?: string;
    hostedDomain?: string | null;
    isGoogleWorkspaceAdmin?: boolean;
    onboardingCompletedAt?: Date | null;
    organizations?: OrganizationMembership[];
  }
}
