import { MagicLinkEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendMagicLinkEmail(
  email: Email,
  url: string,
  expires: Date,
): Promise<HandleEmailEvent> {
  try {
    const expiresInHours = Math.max(
      1,
      Math.round((expires.getTime() - Date.now()) / 3_600_000),
    );
    const sent = await send(email, "Sign in to Props.to", MagicLinkEmail, {
      url,
      expiresInHours,
    });
    // Resend reports failures in the response instead of throwing
    if ("error" in sent && sent.error) throw sent.error;
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
