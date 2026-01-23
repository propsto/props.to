"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { constClient } from "@propsto/constants/client";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  disabled,
  onError,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const clientId = constClient.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If Google Client ID is not configured, don't render the button
  if (!clientId) {
    return null;
  }

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError?.("No credential received from Google");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("google-one-tap", {
        credential: credentialResponse.credential,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's an account linking error
        if (result.error.startsWith("ACCOUNT_LINKING_REQUIRED:")) {
          const token = result.error.replace("ACCOUNT_LINKING_REQUIRED:", "");
          window.location.href = `/welcome?step=link-account&token=${token}`;
          return;
        }
        onError?.(result.error);
      } else if (result?.ok) {
        // Redirect to welcome/onboarding page
        window.location.href = "/welcome";
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      onError?.("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    onError?.("Google sign-in was cancelled or failed");
  };

  if (disabled || isLoading) {
    return (
      <div className="flex items-center justify-center h-10 w-full border rounded-md bg-muted text-muted-foreground text-sm">
        {isLoading ? "Signing in..." : "Google Sign-In disabled"}
      </div>
    );
  }

  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
}
