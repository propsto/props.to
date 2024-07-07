import { type Resend } from "resend";
import { WelcomeEmail } from "../templates";
import { type Email } from "../types";
import { handleError, type HandleErrorReturn } from "./error-handling";
import { send } from ".";

type SendEmailReturn = Promise<
  | HandleErrorReturn
  | {
      success: boolean;
      data: Awaited<ReturnType<Resend["emails"]["send"]>>;
      error: null;
    }
>;

export async function sendWelcomeEmail(email: Email): SendEmailReturn {
  try {
    const sent = await send(email, "Welcome to Props.to", WelcomeEmail);
    return { success: true, data: sent, error: null };
  } catch (e) {
    return handleError(e);
  }
}
