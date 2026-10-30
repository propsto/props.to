"use server";

import { revalidatePath } from "next/cache";
import {
  approveFeedback,
  createAuditLog,
  getFeedbackTemplate,
  rejectFeedback,
  verifyOrgAdminAccess,
} from "@propsto/data/repos";
import { auth } from "@/server/auth.server";
import { notifyFeedbackRecipient } from "@/lib/feedback-email";

type Result = { success: true } | { success: false; error: string };

// Approve or reject one pending org submission. The org comes from the admin
// membership, never from the client; the repo update only matches a pending
// item of that org not addressed to the moderator.
export async function moderateFeedbackAction(
  orgSlug: string,
  feedbackId: string,
  decision: "approve" | "reject",
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  const membership = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membership.success || !membership.data) {
    return { success: false, error: "Not authorized" };
  }
  if (!/^\d{1,18}$/.test(feedbackId)) {
    return { success: false, error: "Feedback not found" };
  }
  const orgId = membership.data.organization.id;
  const moderatorId = session.user.id;
  const id = BigInt(feedbackId);

  const result =
    decision === "approve"
      ? await approveFeedback(id, orgId, moderatorId)
      : await rejectFeedback(id, orgId, moderatorId);
  if (!result.success) {
    return { success: false, error: "Feedback is no longer pending" };
  }
  const feedback = result.data;

  await createAuditLog({
    organizationId: orgId,
    actorId: moderatorId,
    action: decision === "approve" ? "FEEDBACK_APPROVED" : "FEEDBACK_REJECTED",
    resourceType: "feedback",
    resourceId: feedbackId,
    details: { recipientId: feedback.userId },
  });

  if (decision === "approve") {
    const template = await getFeedbackTemplate(feedback.templateId);
    await notifyFeedbackRecipient({
      recipientId: feedback.userId,
      fields: template.data?.fields ?? [],
      fieldsData: (feedback.fieldsData as Record<string, unknown> | null) ?? {},
      isAnonymous: feedback.visibility === "ANONYMOUS",
      senderName: feedback.submitterName ?? feedback.submitter?.firstName,
      feedbackType: feedback.feedbackType,
      values: feedback.values.map(v => v.value.name),
    });
  }

  revalidatePath(`/org/${orgSlug}/admin/moderation`);
  return { success: true };
}
