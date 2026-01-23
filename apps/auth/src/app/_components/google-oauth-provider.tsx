"use client";

import { GoogleOAuthProvider as GoogleProvider } from "@react-oauth/google";
import { createContext, useContext } from "react";

const GoogleClientIdContext = createContext<string | undefined>(undefined);

export function useGoogleClientId() {
  return useContext(GoogleClientIdContext);
}

export function GoogleOAuthProvider({
  clientId,
  children,
}: {
  clientId?: string;
  children: React.ReactNode;
}) {
  // If Google Client ID is not configured, just render children without provider
  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleClientIdContext.Provider value={clientId}>
      <GoogleProvider clientId={clientId}>{children}</GoogleProvider>
    </GoogleClientIdContext.Provider>
  );
}
