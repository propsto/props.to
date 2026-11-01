import type { ConversationStage } from "@prisma/client";
import { getOrganizationAdmins } from "@propsto/data/repos";
import {
  sendConversationEscalationEmail,
  sendConversationStepEmail,
} from "@propsto/email";
import { constServer } from "@propsto/constants/server";
import { createLogger } from "@propsto/logger";
import { STAGE_LABELS } from "./conversation-labels";

const logger = createLogger("app:conversation");

// Tells the subject a step was recorded. Shared fields only, never the notes.
// Never throws; a failed send must not fail the step.
export async function notifyConversationSubject(input: {
  subject: { email: string; firstName: string | null };
  orgName: string;
  stage: ConversationStage;
  reviewAt: Date | null;
  hasConsequence: boolean;
}): Promise<void> {
  try {
    await sendConversationStepEmail(input.subject.email, {
      recipientName:
        input.subject.firstName ?? input.subject.email.split("@")[0],
      orgName: input.orgName,
      stageLabel: STAGE_LABELS[input.stage],
      reviewDate: input.reviewAt?.toLocaleDateString(undefined, {
        timeZone: "UTC",
      }),
      hasConsequence: input.hasConsequence,
      url: `${constServer.PROPSTO_APP_URL}/conversations`,
    });
  } catch (e) {
    logger("Failed to send conversation step email:", e);
  }
}

// From the second step on, owners and admins hear there is a recurring
// problem being worked on. The step owner is not mailed about their own step,
// and a subject who is also an admin gets the subject notice instead.
export async function notifyOrgAdminsOfEscalation(input: {
  organizationId: string;
  orgName: string;
  orgSlug: string;
  memberName: string;
  memberSlug: string;
  subjectId: string;
  ownerId: string;
  ownerName: string;
  stage: ConversationStage;
}): Promise<void> {
  if (input.stage === "DIRECT") return;
  try {
    const admins = await getOrganizationAdmins(input.organizationId);
    const url = `${constServer.PROPSTO_APP_URL}/org/${input.orgSlug}/people/${input.memberSlug}/conversations`;
    await Promise.all(
      (admins.data ?? [])
        .filter(
          admin => admin.id !== input.ownerId && admin.id !== input.subjectId,
        )
        .map(admin =>
          sendConversationEscalationEmail(admin.email, {
            recipientName: admin.firstName ?? admin.email.split("@")[0],
            orgName: input.orgName,
            memberName: input.memberName,
            ownerName: input.ownerName,
            stageLabel: STAGE_LABELS[input.stage],
            url,
          }),
        ),
    );
  } catch (e) {
    logger("Failed to send conversation escalation email:", e);
  }
}
