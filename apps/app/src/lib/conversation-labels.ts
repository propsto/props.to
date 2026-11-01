import type { ConversationStage, ConversationStatus } from "@prisma/client";

// The three steps of the escalation path, in order
export const STAGES: ConversationStage[] = ["DIRECT", "REPEATED", "FINAL"];

export const STAGE_LABELS: Record<ConversationStage, string> = {
  DIRECT: "Direct feedback",
  REPEATED: "Repeated without change",
  FINAL: "Final conversation",
};

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
