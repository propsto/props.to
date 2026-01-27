"use server";

import {
  createFeedback,
  incrementLinkResponseCount,
  getFeedbackLink,
} from "@propsto/data/repos";
import { FeedbackStatus, FeedbackVisibility } from "@prisma/client";
import type { Prisma } from "@prisma/client";

interface SubmitFeedbackInput {
  linkId: string;
  submitterName?: string;
  submitterEmail?: string;
  isAnonymous: boolean;
  fieldsData: Prisma.InputJsonValue;
}

interface SubmitFeedbackResult {
  success: boolean;
  error?: string;
}

export async function submitFeedbackAction(
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResult> {
  // Get the link to verify it exists and get related data
  const linkResult = await getFeedbackLink(input.linkId);
  if (!linkResult.success || !linkResult.data) {
    return { success: false, error: "Feedback link not found" };
  }

  const link = linkResult.data;

  // Check if link is still active
  if (!link.isActive) {
    return { success: false, error: "This feedback link is no longer active" };
  }

  // Check expiration
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return { success: false, error: "This feedback link has expired" };
  }

  // Check max responses
  if (link.maxResponses && link.responseCount >= link.maxResponses) {
    return {
      success: false,
      error: "This feedback link has reached its maximum responses",
    };
  }

  // Determine visibility
  const visibility: FeedbackVisibility = input.isAnonymous
    ? "ANONYMOUS"
    : link.visibility;

  // Create the feedback
  const feedbackResult = await createFeedback({
    userId: link.userId,
    feedbackType: link.feedbackType,
    visibility,
    status: link.organization
      ? ("PENDING_MODERATION" as FeedbackStatus)
      : ("APPROVED" as FeedbackStatus),
    templateId: link.templateId,
    linkId: link.id,
    organizationId: link.organizationId ?? undefined,
    groupId: link.groupId ?? undefined,
    submitterName: input.isAnonymous ? undefined : input.submitterName,
    submitterEmail: input.isAnonymous ? undefined : input.submitterEmail,
    fieldsData: input.fieldsData,
  });

  if (!feedbackResult.success) {
    return { success: false, error: "Failed to submit feedback" };
  }

  // Increment the response count
  await incrementLinkResponseCount(link.id);

  return { success: true };
}
