import type { ConversationStatus } from "@prisma/client";

// The escalation path is defined once, in @propsto/data
export { STAGES, STAGE_LABELS } from "@propsto/data/utils/conversation-stages";

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function personName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}
