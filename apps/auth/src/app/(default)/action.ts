"use server";

import { logger } from "@propsto/logger?auth";
import { constServer } from "@propsto/constants/server";
import { signIn } from "@/server/auth";
import { type SigninFormType, SigninFormSchema } from "./types";

export async function signInAction(
  prevState: PropstoFormState<SigninFormType>,
  formData: FormData
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
  await signIn(
    data.signInMethod === "email" && constServer.EMAIL_PROVIDER === "resend"
      ? "resend"
      : "email",
    data
  );
}
