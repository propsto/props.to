"use server";

import { revalidatePath } from "next/cache";
import {
  approveFeedback,
  getFeedbackTemplate,
  rejectFeedback,
} from "@propsto/data/repos";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";
import {
  notifyFeedbackRecipient,
  notifyTeamFeedbackAdmins,
} from "@/lib/feedback-email";
import { isModerationDecision } from "@/lib/admin-input";

// Approve or reject one pending org submission. The org comes from the admin
// membership, never from the client; the repo update only matches a pending
// item of that org not addressed to the moderator.
export async function moderateFeedbackAction(
  orgSlug: string,
  feedbackId: string,
  decision: "approve" | "reject",
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ userId: moderatorId, org, audit }) => {
    // Anything but approve or reject changes nothing
    if (!isModerationDecision(decision)) return fail("Invalid decision");
    if (!/^\d{1,18}$/.test(feedbackId)) return fail("Feedback not found");
    const id = BigInt(feedbackId);

    const result =
      decision === "approve"
        ? await approveFeedback(id, org.id, moderatorId)
        : await rejectFeedback(id, org.id, moderatorId);
    if (!result.success) return fail("Feedback is no longer pending");
    const feedback = result.data;

    await audit(
      decision === "approve" ? "FEEDBACK_APPROVED" : "FEEDBACK_REJECTED",
      { type: "feedback", id: feedbackId },
      feedback.entityId
        ? { entityId: feedback.entityId }
        : feedback.userId
          ? { recipientId: feedback.userId }
          : { groupId: feedback.groupId },
    );

    if (decision === "approve") {
      const template = await getFeedbackTemplate(feedback.templateId);
      const notification = {
        fields: template.data?.fields ?? [],
        fieldsData:
          (feedback.fieldsData as Record<string, unknown> | null) ?? {},
        isAnonymous: feedback.visibility === "ANONYMOUS",
        senderName: feedback.submitterName ?? feedback.submitter?.firstName,
        feedbackType: feedback.feedbackType,
        values: feedback.values.map(v => v.value.name),
      };
      // Team feedback goes to the group's leads; entity feedback to nobody
      if (feedback.groupId && !feedback.userId && !feedback.entityId) {
        await notifyTeamFeedbackAdmins({
          groupId: feedback.groupId,
          ...notification,
        });
      } else {
        await notifyFeedbackRecipient({
          recipientId: feedback.userId,
          ...notification,
        });
      }
    }

    revalidatePath(`/org/${orgSlug}/admin/moderation`);
    // The recipient's received list and the detail page show the new state
    revalidatePath("/feedback");
    revalidatePath(`/feedback/${feedbackId}`);
    return ok();
  });
}
