"use server";

import {
  createFeedback,
  incrementLinkResponseCount,
  getFeedbackLink,
  getUser,
} from "@propsto/data/repos";
import { sendFeedbackReceivedEmail } from "@propsto/email";
import { FeedbackStatus, FeedbackVisibility } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { constServer } from "@propsto/constants/server";
import { checkFeedbackRateLimit } from "@/lib/ratelimit";

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
  // Rate limit check
  const rateLimitResult = await checkFeedbackRateLimit();
  if (!rateLimitResult.success) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

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

  // Send email notification to recipient
  try {
    const userResult = await getUser({ id: link.userId });
    if (userResult.success && userResult.data?.email) {
      const recipientName =
        userResult.data.firstName ?? userResult.data.email.split("@")[0];
      const feedbackData = input.fieldsData as { feedback?: string };
      const feedbackPreview = feedbackData?.feedback;

      await sendFeedbackReceivedEmail(userResult.data.email, {
        recipientName,
        feedbackPreview: input.isAnonymous ? undefined : feedbackPreview,
        senderName: input.isAnonymous ? undefined : input.submitterName,
        isAnonymous: input.isAnonymous,
        feedbackType: link.feedbackType.replace(/_/g, " "),
        dashboardUrl: `${constServer.PROPSTO_APP_URL}/feedback`,
      });
    }
  } catch (emailError) {
    // Log but don't fail the submission if email fails
    console.error("Failed to send feedback notification email:", emailError);
  }

  return { success: true };
}
