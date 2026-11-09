export const MAX_INVITE_EMAILS = 50;
export const MAX_INVITE_MESSAGE = 1000;

// One invite call sends one email per address, so the batch and the personal
// message are capped before anything is created or sent
export function inviteBatchError(
  emails: unknown,
  message: unknown,
): string | null {
  if (!Array.isArray(emails) || emails.some(e => typeof e !== "string")) {
    return "Invalid email list";
  }
  const count = (emails as string[]).filter(e => e.trim()).length;
  if (count > MAX_INVITE_EMAILS) {
    return `You can invite at most ${MAX_INVITE_EMAILS} people at once`;
  }
  if (message !== undefined && typeof message !== "string") {
    return "Invalid message";
  }
  if (typeof message === "string" && message.length > MAX_INVITE_MESSAGE) {
    return `The message must be ${MAX_INVITE_MESSAGE} characters or fewer`;
  }
  return null;
}

export type ModerationDecision = "approve" | "reject";

export function isModerationDecision(
  decision: unknown,
): decision is ModerationDecision {
  return decision === "approve" || decision === "reject";
}
