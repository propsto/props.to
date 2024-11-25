import { WelcomeEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendWelcomeEmail(
  email: Email,
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(email, "Welcome to Props.to", WelcomeEmail);
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
