import { constServer } from "@propsto/constants/server";
import { PasswordChanged, PasswordResetTokenEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendPasswordResetEmail(
  email: Email,
  token: string,
): Promise<HandleEmailEvent> {
  try {
    const resetLink = `${constServer.AUTH_URL}/new-password?token=${token}`;
    const sent = await send(
      email,
      "Reset your password",
      PasswordResetTokenEmail,
      resetLink,
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}

export async function sendPasswordChanged(
  email: Email,
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(email, "Password changed", PasswordChanged);
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
