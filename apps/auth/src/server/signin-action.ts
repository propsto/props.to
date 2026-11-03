"use server";

import { constServer } from "@propsto/constants/server";
import { createLogger } from "@propsto/logger";
import { redirect } from "next/navigation";
import { signIn } from "@/server/auth.server";
import { type SigninFormType, SigninFormSchema } from "@/app/types";

const logger = createLogger("auth");

export async function signInAction(
  prevState: PropstoFormState<SigninFormType>,
  formData: FormData,
): Promise<PropstoFormState<SigninFormType>> {
  const { success, error, data } = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    signInMethod: formData.get("signInMethod"),
  });
  if (!success) {
    logger("signUpAction", error.flatten());
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  const { password: formPassword, signInMethod } = data;

  // No password sent: always ask for one, before looking the account up, whether or not it
  // exists or has a password (accounts without one use "forgot password"). Anything else is
  // an enumeration oracle.
  if (!formPassword && signInMethod === "credentials") {
    logger("signInAction > password required");
    return { code: "password-set" };
  }

  // Unknown email with a password goes through the same signIn path as a wrong password
  // (the credentials provider runs a bcrypt compare either way, so timing matches too).
  // Magic link proceeds so the provider can create the account (invited newcomers).
  const provider: string = signInMethod;
  logger("signInAction > signIn", provider);
  let result: unknown;
  try {
    result = await signIn(provider, {
      ...data,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("password-invalid")) {
        const out = {
          success: false,
          message: "Wrong credentials!",
        };
        logger("signInAction > error", e, out);
        return out;
      }
      // Log unexpected errors but don't expose details
      logger("signInAction > unexpected error", e);
    }
    return { success: false, message: "Sign in failed. Please try again." };
  }

  // Validate redirect URL before using it
  if (typeof result === "string" && result.length > 0) {
    // Auth.js with redirect:false returns a URL; failures come back as ?error=
    if (result.includes("error=")) {
      logger("signInAction > provider returned error url");
      return { success: false, message: "Sign in failed. Please try again." };
    }
    // Magic link requested: the email provider's only success URL is
    // verify-request, so show "check your email" instead of a silent reload.
    if (signInMethod === "email") {
      return { code: "verify-request", values: data };
    }
    // Only allow relative URLs (not protocol-relative like //evil.com) or URLs to our domain
    const isRelativeUrl = result.startsWith("/") && !result.startsWith("//");
    if (isRelativeUrl || result.startsWith(constServer.PROPSTO_APP_URL)) {
      redirect(result);
    }
  }

  // Default redirect to home if no valid URL
  redirect("/");
}
