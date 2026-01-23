"use client";

import { GoogleOAuthProvider as GoogleProvider } from "@react-oauth/google";
import { constClient } from "@propsto/constants/client";

export function GoogleOAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = constClient.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If Google Client ID is not configured, just render children without provider
  if (!clientId) {
    return <>{children}</>;
  }

  return <GoogleProvider clientId={clientId}>{children}</GoogleProvider>;
}
