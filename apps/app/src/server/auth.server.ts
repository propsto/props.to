import NextAuth, { type NextAuthConfig } from "next-auth";
import { nextAuthConfig as edgeNextAuthConfig } from "@propsto/auth/server.config";

// Extend the shared config with custom pages
export const nextAuthConfig = {
  ...edgeNextAuthConfig,
  pages: {},
} satisfies NextAuthConfig;

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth(nextAuthConfig);
