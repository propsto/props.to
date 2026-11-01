import {
  ConversationEscalationEmail,
  ConversationStepEmail,
} from "../templates";
import type { Email, HandleEmailEvent } from "../types";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { send } from ".";

export async function sendConversationStepEmail(
  email: Email,
  params: {
    recipientName: string;
    orgName: string;
    stageLabel: string;
    reviewDate?: string;
    hasConsequence: boolean;
    url: string;
  },
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(
      email,
      `A conversation about your work at ${params.orgName} was updated`,
      ConversationStepEmail,
      params,
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}

export async function sendConversationEscalationEmail(
  email: Email,
  params: {
    recipientName: string;
    orgName: string;
    memberName: string;
    ownerName: string;
    stageLabel: string;
    url: string;
  },
): Promise<HandleEmailEvent> {
  try {
    const sent = await send(
      email,
      `Recurring problem with ${params.memberName}: ${params.stageLabel}`,
      ConversationEscalationEmail,
      params,
    );
    return handleSuccess(sent);
  } catch (e) {
    return handleError(e);
  }
}
