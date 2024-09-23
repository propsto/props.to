import { constServer } from "@propsto/constants";
import { PasswordChanged, PasswordResetTokenEmail } from "../templates";
import type { SendEmailReturn, Email } from "../types";
import { handleError } from "../utils/error-handling";
import { send } from ".";

export async function sendPasswordResetEmail(
  email: Email,
  token: string,
): SendEmailReturn {
  try {
    const resetLink = `${constServer.AUTH_URL}/new-password?token=${token}`;
    const sent = await send(
      email,
      "Reset your password",
      PasswordResetTokenEmail,
      resetLink,
    );
    return { success: true, data: sent, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function sendPasswordChanged(email: Email): SendEmailReturn {
  try {
    const sent = await send(email, "Password changed", PasswordChanged);
    return { success: true, data: sent, error: null };
  } catch (e) {
    return handleError(e);
  }
}
