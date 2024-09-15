"use server";

import { constOther } from "@propsto/constants";
import { getUserByEmail } from "@propsto/data/repos";
import { logger } from "@propsto/logger?auth";
import { signIn } from "@/server/auth";
import {
  type ResetPasswordFormType,
  ResetPasswordFormSchema,
} from "@/app/types";

export async function passwordResetAction(
  prevState: PropstoFormState<ResetPasswordFormType>,
  formData: FormData,
): Promise<PropstoFormState<ResetPasswordFormType>> {
  const { success, error, data } = ResetPasswordFormSchema.safeParse({
    email: formData.get("email"),
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
  const { emailProvider } = constOther;
  let provider = "email";
  if (emailProvider === "resend") {
    provider = "resend";
  }
  logger("signInAction > signIn", provider);
  await signIn(provider, data);
}
