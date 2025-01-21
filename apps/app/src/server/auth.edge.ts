import NextAuth, { type NextAuthConfig } from "next-auth";
import { nextAuthConfig as edgeNextAuthConfig } from "@propsto/auth/edge.config";

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
