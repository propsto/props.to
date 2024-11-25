"use server";

import { setPasswordByToken } from "@propsto/data/repos";
import { sendPasswordChanged } from "@propsto/email";
import { logger } from "@propsto/logger?auth";
import { redirect } from "next/navigation";
import { type NewPasswordFormType, newPasswordFormSchema } from "@/app/types";
import { isPasswordValid } from "@/lib/is-password-valid";

export async function newPasswordAction(
  prevState: PropstoFormState<NewPasswordFormType>,
  formData: FormData,
): Promise<PropstoFormState<NewPasswordFormType>> {
  const { success, error, data } = newPasswordFormSchema.safeParse({
    password: formData.get("password"),
    repeatPassword: formData.get("repeatPassword"),
    token: formData.get("token"),
  });
  if (!success) {
    logger("newPasswordAction", error.flatten());
    return {
      success: false,
      errors: error.flatten().fieldErrors,
      message: "Please correct the errors.",
    };
  }

  if (data.password !== data.repeatPassword) {
    logger("newPasswordAction > passwords don't match");
    return { success: false, message: "Passwords don't match" };
  }

  if (!isPasswordValid(data.password)) {
    logger("newPasswordAction > password not valid");
    return { success: false, message: "Password is not valid" };
  }

  const result = await setPasswordByToken(data.token, data.password);
  if (!result.success) return result;

  const emailSent = await sendPasswordChanged(result.data.email);

  if (!emailSent.success) {
    logger("newPasswordAction > sendPasswordChanged no success");
    return { success: false, message: "Unexpected error" };
  }

  redirect("/");
}
