import { WelcomeEmail, PersonalEmailVerification } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendWelcomeEmail(
  email: Email,
  userName: string,
): Promise<HandleEmailEvent> {
  try {
    const dashboardUrl = `${process.env.PROPSTO_APP_URL ?? "https://app.props.to"}`;
    const sent = await send(
      email,
      "Welcome to props.to 🎉",
      WelcomeEmail,
      { userName, dashboardUrl },
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}

export async function sendPersonalEmailVerification(
  email: Email,
  code: string,
  userName?: string,
  workEmail?: string,
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(
      email,
      `Your verification code: ${code}`,
      PersonalEmailVerification,
      { code, userName, workEmail },
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
