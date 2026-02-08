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

  const user = await getUserByEmail(data.email, ["password"]);
  if (!user.data) {
    logger("signInAction > no user found");
    return { success: false, message: "No user found" };
  }

  const { password: formPassword, signInMethod } = data;
  const {
    data: { password: userPassword },
  } = user;
  if (!formPassword && signInMethod === "credentials") {
    if (userPassword) {
      const out = {
        code: "password-set",
      };
      logger("signInAction > password already set");
      return out;
    }
    return redirect(`/reset-password?code=no-password-set&email=${data.email}`);
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
    // Only allow relative URLs or URLs to our domain
    if (
      result.startsWith("/") ||
      result.startsWith(constServer.PROPSTO_APP_URL)
    ) {
      redirect(result);
    }
  }

  // Default redirect to home if no valid URL
  redirect("/");
}
