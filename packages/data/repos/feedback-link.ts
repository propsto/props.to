import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { FeedbackType, FeedbackVisibility } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const logger = createLogger("data");

// Types for feedback link data
export type FeedbackLinkWithRelations = Prisma.FeedbackLinkGetPayload<{
  include: {
    user: {
      select: { id: true; firstName: true; lastName: true; image: true };
    };
    template: { select: { id: true; name: true; feedbackType: true } };
    organization: { select: { id: true; name: true } };
    group: { select: { id: true; name: true } };
    _count: { select: { feedbacks: true } };
  };
}>;

const feedbackLinkInclude = Prisma.validator<Prisma.FeedbackLinkInclude>()({
  user: { select: { id: true, firstName: true, lastName: true, image: true } },
  template: { select: { id: true, name: true, feedbackType: true } },
  organization: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
  _count: { select: { feedbacks: true } },
});

// Generate a unique slug for feedback links
function generateLinkSlug(): string {
  return uuidv4().split("-")[0]; // Use first part of UUID (8 chars)
}

// Create a feedback link
export async function createFeedbackLink(data: {
  userId: string;
  templateId: string;
  name: string;
  slug?: string;
  organizationId?: string;
  groupId?: string;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
  expiresAt?: Date;
  maxResponses?: number;
  isHidden?: boolean;
}): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("createFeedbackLink", { userId: data.userId, name: data.name });

    // Generate unique slug if not provided
    let slug = data.slug ?? generateLinkSlug();

    // Check for slug collision within same user+org context
    const existingSlug = await db.feedbackLink.findFirst({
      where: {
        slug,
        userId: data.userId,
        organizationId: data.organizationId ?? null,
      },
    });
    if (existingSlug) {
      // Regenerate if collision
      slug = generateLinkSlug();
    }

    const link = await db.feedbackLink.create({
      data: {
        slug,
        name: data.name,
        userId: data.userId,
        templateId: data.templateId,
        organizationId: data.organizationId,
        groupId: data.groupId,
        visibility: data.visibility ?? "PRIVATE",
        feedbackType: data.feedbackType ?? "RECOGNITION",
        expiresAt: data.expiresAt,
        maxResponses: data.maxResponses,
        isHidden: data.isHidden ?? false,
      },
      include: feedbackLinkInclude,
    });

    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback link by ID
export async function getFeedbackLink(
  id: string,
): Promise<HandleEvent<FeedbackLinkWithRelations | null>> {
  try {
    logger("getFeedbackLink", { id });
    const link = await db.feedbackLink.findUnique({
      where: { id },
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback link by slug (for public pages)
// Slug is unique per user+org context
export async function getFeedbackLinkBySlug(
  slug: string,
  userId: string,
  organizationId?: string | null,
): Promise<HandleEvent<FeedbackLinkWithRelations | null>> {
  try {
    logger("getFeedbackLinkBySlug", { slug, userId, organizationId });
    const link = await db.feedbackLink.findFirst({
      where: {
        slug,
        userId,
        organizationId: organizationId ?? null,
      },
      include: feedbackLinkInclude,
    });

    // Check if link is active and not expired
    if (link) {
      const now = new Date();
      if (!link.isActive) {
        return handleSuccess(null);
      }
      if (link.expiresAt && link.expiresAt < now) {
        return handleSuccess(null);
      }
      if (link.maxResponses && link.responseCount >= link.maxResponses) {
        return handleSuccess(null);
      }
    }

    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Update feedback link
export async function updateFeedbackLink(
  id: string,
  data: {
    name?: string;
    templateId?: string;
    visibility?: FeedbackVisibility;
    feedbackType?: FeedbackType;
    expiresAt?: Date | null;
    maxResponses?: number | null;
    isActive?: boolean;
    isHidden?: boolean;
  },
): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("updateFeedbackLink", { id, data });
    const link = await db.feedbackLink.update({
      where: { id },
      data,
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Delete feedback link
export async function deleteFeedbackLink(
  id: string,
): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("deleteFeedbackLink", { id });
    const link = await db.feedbackLink.delete({
      where: { id },
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Get all feedback links for a user
export async function getUserFeedbackLinks(
  userId: string,
  options?: {
    organizationId?: string;
    isActive?: boolean;
    isHidden?: boolean;
    excludeHidden?: boolean; // For public profile pages - exclude hidden links
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ links: FeedbackLinkWithRelations[]; total: number }>> {
  try {
    logger("getUserFeedbackLinks", { userId, options });
    const where: Prisma.FeedbackLinkWhereInput = {
      userId,
      ...(options?.organizationId !== undefined && {
        organizationId: options.organizationId,
      }),
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
      ...(options?.isHidden !== undefined && { isHidden: options.isHidden }),
      ...(options?.excludeHidden && { isHidden: false }),
    };

    const [links, total] = await Promise.all([
      db.feedbackLink.findMany({
        where,
        include: feedbackLinkInclude,
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take ?? 20,
      }),
      db.feedbackLink.count({ where }),
    ]);

    return handleSuccess({ links, total });
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback links for an organization
export async function getOrganizationFeedbackLinks(
  organizationId: string,
  options?: {
    isActive?: boolean;
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ links: FeedbackLinkWithRelations[]; total: number }>> {
  try {
    logger("getOrganizationFeedbackLinks", { organizationId, options });
    const where: Prisma.FeedbackLinkWhereInput = {
      organizationId,
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
    };

    const [links, total] = await Promise.all([
      db.feedbackLink.findMany({
        where,
        include: feedbackLinkInclude,
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take ?? 20,
      }),
      db.feedbackLink.count({ where }),
    ]);

    return handleSuccess({ links, total });
  } catch (e) {
    return handleError(e);
  }
}

// Get all feedback links from members of an organization
export async function getOrganizationMemberFeedbackLinks(
  organizationId: string,
  options?: {
    isActive?: boolean;
    skip?: number;
    take?: number;
    excludeHidden?: boolean;
  },
): Promise<HandleEvent<{ links: FeedbackLinkWithRelations[]; total: number }>> {
  try {
    logger("getOrganizationMemberFeedbackLinks", { organizationId, options });
    const where: Prisma.FeedbackLinkWhereInput = {
      user: {
        organizations: {
          some: { organizationId },
        },
      },
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
      ...(options?.excludeHidden && { isHidden: false }),
    };

    const [links, total] = await Promise.all([
      db.feedbackLink.findMany({
        where,
        include: feedbackLinkInclude,
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take ?? 50,
      }),
      db.feedbackLink.count({ where }),
    ]);

    return handleSuccess({ links, total });
  } catch (e) {
    return handleError(e);
  }
}

// Increment response count for a link
export async function incrementLinkResponseCount(
  id: string,
): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("incrementLinkResponseCount", { id });
    const link = await db.feedbackLink.update({
      where: { id },
      data: { responseCount: { increment: 1 } },
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Deactivate a feedback link (pause)
export async function deactivateFeedbackLink(
  id: string,
): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("deactivateFeedbackLink", { id });
    const link = await db.feedbackLink.update({
      where: { id },
      data: { isActive: false },
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Activate a feedback link (resume)
export async function activateFeedbackLink(
  id: string,
): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("activateFeedbackLink", { id });
    const link = await db.feedbackLink.update({
      where: { id },
      data: { isActive: true },
      include: feedbackLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Check if a link can accept more responses
export async function canLinkAcceptResponses(
  linkId: string,
): Promise<HandleEvent<boolean>> {
  try {
    logger("canLinkAcceptResponses", { linkId });
    const link = await db.feedbackLink.findUnique({
      where: { id: linkId },
      select: {
        isActive: true,
        expiresAt: true,
        maxResponses: true,
        responseCount: true,
      },
    });

    if (!link) {
      return handleSuccess(false);
    }

    const now = new Date();
    if (!link.isActive) {
      return handleSuccess(false);
    }
    if (link.expiresAt && link.expiresAt < now) {
      return handleSuccess(false);
    }
    if (link.maxResponses && link.responseCount >= link.maxResponses) {
      return handleSuccess(false);
    }

    return handleSuccess(true);
  } catch (e) {
    return handleError(e);
  }
}

// Check if a feedback link slug is available for a user
export async function checkFeedbackLinkSlugAvailable(
  slug: string,
  userId: string,
  organizationId?: string,
): Promise<HandleEvent<boolean>> {
  try {
    logger("checkFeedbackLinkSlugAvailable", { slug, userId, organizationId });

    const existing = await db.feedbackLink.findFirst({
      where: {
        slug,
        userId,
        organizationId: organizationId ?? null,
      },
    });

    return handleSuccess(!existing);
  } catch (e) {
    return handleError(e);
  }
}
