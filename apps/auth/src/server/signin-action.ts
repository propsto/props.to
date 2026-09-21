"use server";

import { constServer } from "@propsto/constants/server";
import { getUserByEmail } from "@propsto/data/repos";
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
  const user = await getUserByEmail(data.email, ["password"]);
  // Unknown email: credentials get the same error as a wrong password (no enumeration);
  // magic link proceeds so the provider can create the account (invited newcomers).
  if (!user.data && signInMethod === "credentials") {
    logger("signInAction > no user found");
    return { success: false, message: "Wrong credentials!" };
  }

  // No password sent: always ask for one, whether or not the account exists or has one set
  // (accounts without a password use "forgot password"). Anything else is an enumeration oracle.
  if (!formPassword && signInMethod === "credentials") {
    logger("signInAction > password required");
    return { code: "password-set" };
  }

  let provider: string = signInMethod;
  if (signInMethod === "email" && constServer.EMAIL_PROVIDER === "resend") {
    provider = "resend";
  }
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
    // Only allow relative URLs (not protocol-relative like //evil.com) or URLs to our domain
    const isRelativeUrl = result.startsWith("/") && !result.startsWith("//");
    if (isRelativeUrl || result.startsWith(constServer.PROPSTO_APP_URL)) {
      redirect(result);
    }
  }

  // Default redirect to home if no valid URL
  redirect("/");
}
