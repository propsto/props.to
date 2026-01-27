import { FeedbackReceivedEmail } from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

interface SendFeedbackReceivedEmailParams {
  recipientName: string;
  feedbackPreview?: string;
  senderName?: string;
  isAnonymous: boolean;
  feedbackType: string;
  dashboardUrl: string;
}

export async function sendFeedbackReceivedEmail(
  email: Email,
  params: SendFeedbackReceivedEmailParams,
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(
      email,
      params.isAnonymous
        ? "You received anonymous feedback"
        : `${params.senderName ?? "Someone"} sent you feedback`,
      FeedbackReceivedEmail,
      params,
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
