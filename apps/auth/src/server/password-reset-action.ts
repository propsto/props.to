"use server";

import { deletePasswordResetToken, getUserByEmail } from "@propsto/data/repos";
import { generatePasswordResetToken } from "@propsto/data/utils/password-reset-token";
import { sendPasswordResetEmail } from "@propsto/email";
import { createLogger } from "@propsto/logger";
import {
  type ResetPasswordFormType,
  resetPasswordFormSchema,
} from "@/app/types";
import { checkPasswordResetRateLimit } from "@/lib/ratelimit";

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

  // Rate limit check
  const rateLimitResult = await checkPasswordResetRateLimit(data.email);
  if (!rateLimitResult.success) {
    logger("passwordResetAction > rate limited");
    return {
      errors: {
        email: ["Too many requests. Please try again later."],
      },
    };
  }

  // Always return success to prevent email enumeration attacks
  // Log internally but don't reveal whether email exists
  const successMessage =
    "If an account exists with this email, you will receive a password reset link.";

  const user = await getUserByEmail(data.email);
  if (!user.data) {
    logger("passwordResetAction > no user found (not revealed to client)");
    return { success: true, message: successMessage };
  }

  const token = await generatePasswordResetToken(data.email);
  if (!token.data) {
    logger("passwordResetAction > generatePasswordResetToken no success");
    // Still return success to avoid leaking info
    return { success: true, message: successMessage };
  }

  const emailSent = await sendPasswordResetEmail(data.email, token.data.token);
  if (!emailSent.success) {
    logger("passwordResetAction > sendPasswordResetEmail no success");
    await deletePasswordResetToken(token.data.id);
    // Still return success to avoid leaking info
    return { success: true, message: successMessage };
  }

  return { success: true, message: successMessage };
}
