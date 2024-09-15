"use server";

import { constOther } from "@propsto/constants";
import { getUserByEmail } from "@propsto/data/repos";
import { logger } from "@propsto/logger?auth";
import { redirect } from "next/navigation";
import { signIn } from "@/server/auth";
import { type SigninFormType, SigninFormSchema } from "@/app/types";

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

  const user = await getUserByEmail(data.email, { password: true });
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
      logger("signInAction > password set");
      return out;
    }
    return redirect("/reset-password");
  }
  const { emailProvider } = constOther;
  let provider = "email";
  if (signInMethod === "email" && emailProvider === "resend") {
    provider = "resend";
  }
  logger("signInAction > signIn", provider);
  await signIn(provider, data);
}
