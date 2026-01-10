"use server";

import { deletePasswordResetToken, getUserByEmail } from "@propsto/data/repos";
import { generatePasswordResetToken } from "@propsto/data/utils/password-reset-token";
import { sendPasswordResetEmail } from "@propsto/email";
import { createLogger } from "@propsto/logger";
import {
  type ResetPasswordFormType,
  resetPasswordFormSchema,
} from "@/app/types";

const logger = createLogger("auth");

export async function passwordResetAction(
  prevState: PropstoFormState<ResetPasswordFormType>,
  formData: FormData,
): Promise<PropstoFormState<ResetPasswordFormType>> {
  const { success, error, data } = resetPasswordFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!success) {
    logger("passwordResetAction", error.flatten());
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  const user = await getUserByEmail(data.email);
  if (!user.data) {
    logger("passwordResetAction > no user found");
    return { success: false, message: "No user found" };
  }

  const token = await generatePasswordResetToken(data.email);
  if (!token.data) {
    logger("passwordResetAction > generatePasswordResetToken no success");
    return { success: false, message: "Unexpected error" };
  }

  const emailSent = await sendPasswordResetEmail(data.email, token.data.token);
  if (!emailSent.success) {
    logger("passwordResetAction > sendPasswordResetEmail no success");
    await deletePasswordResetToken(token.data.id);
    return { success: false, message: "Unexpected error" };
  }

  return { success: true, message: "Email sent!" };
}
