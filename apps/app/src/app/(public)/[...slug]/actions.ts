"use server";

import {
  createFeedback,
  getFeedbackLink,
  getOrgValues,
} from "@propsto/data/repos";
import type { FeedbackVisibility, Prisma } from "@prisma/client";
import { checkFeedbackRateLimit } from "@/lib/ratelimit";
import { notifyFeedbackRecipient } from "@/lib/feedback-email";
import { auth } from "@/server/auth.server";
import { feedbackRefusal, getFeedbackPolicy } from "@/lib/feedback-policy";
import { z } from "zod";
import { createLogger } from "@propsto/logger";
import { validateFieldAnswers } from "@/lib/template-fields";

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
  linkId: z.string().cuid(), // FeedbackLink.id is @default(cuid())
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
  valueIds: z.array(z.string().cuid()).max(50).optional(),
});

interface SubmitFeedbackInput {
  linkId: string;
  submitterName?: string;
  submitterEmail?: string;
  isAnonymous: boolean;
  fieldsData: Prisma.InputJsonValue;
  valueIds?: string[];
}

interface SubmitFeedbackResult {
  success: boolean;
  error?: string;
}

export async function submitFeedbackAction(
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResult> {
  // Validate and sanitize input
  const parseResult = submitFeedbackSchema.safeParse(input);
  if (!parseResult.success) {
    logger("Invalid feedback submission input:", parseResult.error.flatten());
    return { success: false, error: "Invalid input" };
  }
  const sanitizedInput = parseResult.data;

  // Rate limit per link+IP (with a per-IP ceiling), after validation so the
  // key is a well-formed link id
  const rateLimitResult = await checkFeedbackRateLimit(sanitizedInput.linkId);
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }
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

  // Answers must match the template that drives the form (public, unauthenticated input)
  const answers = validateFieldAnswers(
    link.template.fields,
    sanitizedInput.fieldsData,
  );
  if (answers.error !== undefined) {
    return { success: false, error: answers.error };
  }
  const fieldsData = answers.data;

  // Effective anonymity: the toggle or an ANONYMOUS link; the org policy and the
  // stored submitter fields must follow it, not just the toggle
  const isAnonymous =
    sanitizedInput.isAnonymous || link.visibility === "ANONYMOUS";
  const visibility: FeedbackVisibility = isAnonymous
    ? "ANONYMOUS"
    : link.visibility;

  // Org settings: feedback enabled, members-only, anonymous allowed
  const session = await auth();
  const policy = await getFeedbackPolicy(link, session?.user?.id);
  const refusal = feedbackRefusal(policy, isAnonymous);
  if (refusal) {
    return { success: false, error: refusal };
  }

  // Value tags must be values of the link's org; personal links have none
  const valueIds = [...new Set(sanitizedInput.valueIds ?? [])];
  let valueNames: string[] = [];
  if (valueIds.length > 0) {
    const orgValues = link.organizationId
      ? await getOrgValues(link.organizationId)
      : null;
    const known = orgValues?.success ? orgValues.data : [];
    const tagged = known.filter(v => valueIds.includes(v.id));
    if (tagged.length !== valueIds.length) {
      return { success: false, error: "Invalid input" };
    }
    valueNames = tagged.map(v => v.name);
  }

  // Create the feedback
  const feedbackResult = await createFeedback({
    userId: link.userId,
    // A signed-in submitter is recorded so their Sent list shows it; anonymous stays unlinked
    submitterId: isAnonymous ? undefined : session?.user?.id,
    feedbackType: link.feedbackType,
    visibility,
    status: policy.moderated ? "PENDING_MODERATION" : "APPROVED",
    templateId: link.templateId,
    linkId: link.id,
    organizationId: link.organizationId ?? undefined,
    groupId: link.groupId ?? undefined,
    submitterName: isAnonymous ? undefined : sanitizedInput.submitterName,
    submitterEmail: isAnonymous ? undefined : sanitizedInput.submitterEmail,
    fieldsData,
    valueIds,
  });

  if (!feedbackResult.success) {
    return {
      success: false,
      error: feedbackResult.error?.includes("maximum responses")
        ? "This feedback link has reached its maximum responses"
        : "Failed to submit feedback",
    };
  }

  // Moderated feedback notifies the recipient on approval instead
  if (!policy.moderated) {
    await notifyFeedbackRecipient({
      recipientId: link.userId,
      fields: link.template.fields,
      fieldsData,
      isAnonymous,
      senderName: sanitizedInput.submitterName,
      feedbackType: link.feedbackType,
      values: valueNames,
    });
  }

  return { success: true };
}
