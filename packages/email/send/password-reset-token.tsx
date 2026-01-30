import { PasswordChangedEmail, PasswordResetTokenEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendPasswordResetEmail(
  email: Email,
  token: string,
  userName?: string,
): Promise<HandleEmailEvent> {
  try {
    const resetLink = `${process.env.AUTH_URL ?? ""}/new-password?token=${token}`;
    const sent = await send(
      email,
      "Reset your password",
      PasswordResetTokenEmail,
      { userName, resetLink, expiresInMinutes: 60 },
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}

export async function sendPasswordChanged(
  email: Email,
  userName?: string,
): Promise<HandleEmailEvent> {
  try {
    const loginUrl = `${process.env.AUTH_URL ?? ""}/sign-in`;
    const sent = await send(
      email,
      "Your password was changed",
      PasswordChangedEmail,
      { userName, loginUrl, changedAt: new Date() },
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
