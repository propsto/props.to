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
import { z } from "zod";
import { createLogger } from "@propsto/logger";

const logger = createLogger("app:feedback");

// Constants for input limits
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_FIELD_TEXT_LENGTH = 10000;

/**
 * Strips HTML tags from a string to prevent XSS attacks.
 * Uses a simple regex approach safe for server-side sanitization.
 */
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitizes a text field by stripping HTML and limiting length.
 */
function sanitizeText(
  input: string | undefined,
  maxLength: number,
): string | undefined {
  if (!input) return undefined;
  const stripped = stripHtmlTags(input);
  return stripped.slice(0, maxLength);
}

/**
 * Recursively sanitizes string values in JSON data.
 */
function sanitizeFieldsData(
  data: Prisma.InputJsonValue,
): Prisma.InputJsonValue {
  if (typeof data === "string") {
    return sanitizeText(data, MAX_FIELD_TEXT_LENGTH) ?? "";
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeFieldsData);
  }
  if (data !== null && typeof data === "object") {
    const sanitized: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeFieldsData(value as Prisma.InputJsonValue);
    }
    return sanitized;
  }
  return data;
}

// Input validation schema
const submitFeedbackSchema = z.object({
  linkId: z.string().uuid(),
  submitterName: z
    .string()
    .max(MAX_NAME_LENGTH)
    .transform(s => sanitizeText(s, MAX_NAME_LENGTH))
    .optional(),
  submitterEmail: z.string().email().max(MAX_EMAIL_LENGTH).optional(),
  isAnonymous: z.boolean(),
  fieldsData: z.unknown().transform(data => {
    return sanitizeFieldsData(data as Prisma.InputJsonValue);
  }),
});

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

  // Validate and sanitize input
  const parseResult = submitFeedbackSchema.safeParse(input);
  if (!parseResult.success) {
    logger("Invalid feedback submission input:", parseResult.error.flatten());
    return { success: false, error: "Invalid input" };
  }
  const sanitizedInput = parseResult.data;
  // Get the link to verify it exists and get related data
  const linkResult = await getFeedbackLink(sanitizedInput.linkId);
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
  const visibility: FeedbackVisibility = sanitizedInput.isAnonymous
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
    submitterName: sanitizedInput.isAnonymous
      ? undefined
      : sanitizedInput.submitterName,
    submitterEmail: sanitizedInput.isAnonymous
      ? undefined
      : sanitizedInput.submitterEmail,
    fieldsData: sanitizedInput.fieldsData,
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
      const feedbackData = sanitizedInput.fieldsData as { feedback?: string };
      const feedbackPreview = feedbackData?.feedback;

      await sendFeedbackReceivedEmail(userResult.data.email, {
        recipientName,
        feedbackPreview: sanitizedInput.isAnonymous
          ? undefined
          : feedbackPreview,
        senderName: sanitizedInput.isAnonymous
          ? undefined
          : sanitizedInput.submitterName,
        isAnonymous: sanitizedInput.isAnonymous,
        feedbackType: link.feedbackType.replace(/_/g, " "),
        dashboardUrl: `${constServer.PROPSTO_APP_URL}/feedback`,
      });
    }
  } catch (emailError) {
    // Log but don't fail the submission if email fails
    logger("Failed to send feedback notification email:", emailError);
  }

  return { success: true };
}
