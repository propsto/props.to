import { getUser } from "@propsto/data/repos";
import { sendFeedbackReceivedEmail } from "@propsto/email";
import { constServer } from "@propsto/constants/server";
import { createLogger } from "@propsto/logger";

const logger = createLogger("app:feedback");

// Tells the recipient they have feedback. Sent when feedback becomes visible to
// them: on submit for unmoderated feedback, on approval for moderated feedback.
// Never throws; a failed send must not fail the submission or the approval.
export async function notifyFeedbackRecipient(input: {
  recipientId: string;
  fields: { id: string; type: string }[];
  fieldsData: Record<string, unknown>;
  isAnonymous: boolean;
  senderName?: string | null;
  feedbackType: string;
  values?: string[]; // Names of the org values the feedback is tagged with
}): Promise<void> {
  try {
    const userResult = await getUser({ id: input.recipientId });
    if (!userResult.success || !userResult.data?.email) return;
    const recipientName =
      userResult.data.firstName ?? userResult.data.email.split("@")[0];
    // Preview: the first long-text answer, else the first text answer, else the generic body
    const textAnswer = (type: string): string | undefined =>
      input.fields
        .filter(f => f.type === type)
        .map(f => input.fieldsData[f.id])
        .find((v): v is string => typeof v === "string");
    const feedbackPreview = textAnswer("TEXTAREA") ?? textAnswer("TEXT");

    await sendFeedbackReceivedEmail(userResult.data.email, {
      recipientName,
      feedbackPreview: input.isAnonymous ? undefined : feedbackPreview,
      senderName: input.isAnonymous
        ? undefined
        : (input.senderName ?? undefined),
      isAnonymous: input.isAnonymous,
      feedbackType: input.feedbackType.replace(/_/g, " "),
      values: input.values,
      dashboardUrl: `${constServer.PROPSTO_APP_URL}/feedback`,
    });
  } catch (emailError) {
    logger("Failed to send feedback notification email:", emailError);
  }
}
