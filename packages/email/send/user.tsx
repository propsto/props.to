import { WelcomeEmail } from "../templates";
import type { SendEmailReturn, Email } from "../types";
import { handleError } from "../utils/error-handling";
import { send } from ".";

export async function sendWelcomeEmail(email: Email): SendEmailReturn {
  try {
    const sent = await send(email, "Welcome to Props.to", WelcomeEmail);
    return { success: true, data: sent, error: null };
  } catch (e) {
    return handleError(e);
  }
}
