import { send } from ".";
import { WelcomeEmailTemplate } from "../templates";
import { Email } from "../types";
import { handleError } from "./errorHandling";

export async function sendWelcomeEmail(email: Email) {
  try {
    const sent = await send(email, "Welcome to Props.to", WelcomeEmailTemplate);
    return { success: true, data: sent, error: null };
  } catch (e) {
    return handleError(e);
  }
}
