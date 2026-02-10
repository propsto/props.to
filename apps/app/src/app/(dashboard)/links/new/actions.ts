"use server";

import { auth } from "@/server/auth.server";
import {
  createFeedbackLink,
  checkFeedbackLinkSlugAvailable,
  getUserOrganizationMembership,
  getOrganizationFeedbackSettingsData,
  getOrganizationTemplates,
} from "@propsto/data/repos";
import { FeedbackType, FeedbackVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkSlugCheckRateLimit } from "@/lib/ratelimit";

interface CreateLinkInput {
  name: string;
  slug: string;
  templateId: string;
  feedbackType: FeedbackType;
  visibility: FeedbackVisibility;
  maxResponses?: number;
  isHidden?: boolean;
  organizationId?: string;
}

interface CreateLinkResult {
  success: boolean;
  error?: string;
  linkId?: string;
}

export async function createLinkAction(
  input: CreateLinkInput,
): Promise<CreateLinkResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify org membership if creating an org link
  if (input.organizationId) {
    const membership = await getUserOrganizationMembership({
      userId: session.user.id,
      organizationId: input.organizationId,
    });
    if (!membership.success || !membership.data) {
      return {
        success: false,
        error: "You are not a member of this organization",
      };
    }

    // Check if org restricts member form creation
    const feedbackSettings = await getOrganizationFeedbackSettingsData(
      input.organizationId,
    );
    if (
      feedbackSettings.success &&
      feedbackSettings.data &&
      !feedbackSettings.data.allowMemberFormCreation
    ) {
      // Verify template belongs to this org (fail-closed: reject if we can't verify)
      const orgTemplates = await getOrganizationTemplates(input.organizationId);
      if (!orgTemplates.success) {
        return {
          success: false,
          error: "Unable to verify template permissions. Please try again.",
        };
      }
      const isOrgTemplate = orgTemplates.data.some(
        t => t.id === input.templateId,
      );
      if (!isOrgTemplate) {
        return {
          success: false,
          error:
            "This organization requires using organization-provided templates",
        };
      }
    }
  }

  const result = await createFeedbackLink({
    userId: session.user.id,
    name: input.name,
    slug: input.slug,
    templateId: input.templateId,
    feedbackType: input.feedbackType,
    visibility: input.visibility,
    maxResponses:
      input.maxResponses && input.maxResponses > 0
        ? input.maxResponses
        : undefined,
    isHidden: input.isHidden,
    organizationId: input.organizationId,
  });

  if (!result.success) {
    console.error("createFeedbackLink failed:", result.error);
    return { success: false, error: result.error ?? "Failed to create link" };
  }

  revalidatePath("/links");

  return { success: true, linkId: result.data.id };
}

export async function checkSlugAvailableAction(
  slug: string,
): Promise<{ available: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { available: false };
  }

  // Rate limit check for slug availability
  const rateLimitResult = await checkSlugCheckRateLimit();
  if (!rateLimitResult.success) {
    return { available: false, error: "Too many requests. Please try again." };
  }

  const result = await checkFeedbackLinkSlugAvailable(slug, session.user.id);
  return { available: result.success ? result.data : false };
}
