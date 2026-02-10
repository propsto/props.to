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

// ============= MANAGED LINKS =============

// Type for managed links with adoption stats
export type ManagedFeedbackLinkWithStats = Prisma.FeedbackLinkGetPayload<{
  include: {
    managedBy: {
      select: { id: true; firstName: true; lastName: true };
    };
    template: { select: { id: true; name: true; feedbackType: true } };
    organization: { select: { id: true; name: true } };
    _count: { select: { adoptedLinks: true; feedbacks: true } };
  };
}>;

const managedLinkInclude = Prisma.validator<Prisma.FeedbackLinkInclude>()({
  managedBy: { select: { id: true, firstName: true, lastName: true } },
  template: { select: { id: true, name: true, feedbackType: true } },
  organization: { select: { id: true, name: true } },
  _count: { select: { adoptedLinks: true, feedbacks: true } },
});

// Create a managed feedback link (admin only)
export async function createManagedFeedbackLink(data: {
  organizationId: string;
  managedByUserId: string; // Admin who creates it
  templateId: string;
  name: string;
  slug?: string;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
  isHidden?: boolean;
}): Promise<HandleEvent<ManagedFeedbackLinkWithStats>> {
  try {
    logger("createManagedFeedbackLink", {
      organizationId: data.organizationId,
      name: data.name,
    });

    // Generate unique slug if not provided
    let slug = data.slug ?? generateLinkSlug();

    // For managed links, we use a special "system" user context for the slug uniqueness
    // The managedByUserId owns the link, but it's an org-level resource
    const link = await db.feedbackLink.create({
      data: {
        slug,
        name: data.name,
        userId: data.managedByUserId, // The admin who creates it is the owner
        templateId: data.templateId,
        organizationId: data.organizationId,
        visibility: data.visibility ?? "ORGANIZATION",
        feedbackType: data.feedbackType ?? "RECOGNITION",
        isHidden: data.isHidden ?? false,
        isManaged: true,
        managedByUserId: data.managedByUserId,
      },
      include: managedLinkInclude,
    });

    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Get all managed links for an organization
export async function getOrganizationManagedLinks(
  organizationId: string,
  options?: {
    skip?: number;
    take?: number;
  },
): Promise<
  HandleEvent<{ links: ManagedFeedbackLinkWithStats[]; total: number }>
> {
  try {
    logger("getOrganizationManagedLinks", { organizationId, options });
    const where: Prisma.FeedbackLinkWhereInput = {
      organizationId,
      isManaged: true,
    };

    const [links, total] = await Promise.all([
      db.feedbackLink.findMany({
        where,
        include: managedLinkInclude,
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

// Adopt a managed link - create a personal copy for the employee
export async function adoptManagedLink(data: {
  sourceManagedId: string; // The managed link to adopt from
  userId: string; // The employee adopting the link
  slug?: string; // Optional custom slug for their adopted link
}): Promise<HandleEvent<FeedbackLinkWithRelations>> {
  try {
    logger("adoptManagedLink", {
      sourceManagedId: data.sourceManagedId,
      userId: data.userId,
    });

    // Get the managed link
    const managedLink = await db.feedbackLink.findUnique({
      where: { id: data.sourceManagedId },
      include: { organization: true },
    });

    if (!managedLink) {
      return handleError(new Error("Managed link not found"));
    }

    if (!managedLink.isManaged) {
      return handleError(new Error("This is not a managed link"));
    }

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: managedLink.organizationId!,
        },
      },
    });

    if (!membership) {
      return handleError(
        new Error("User is not a member of this organization"),
      );
    }

    // Check if user already adopted this managed link
    const existingAdoption = await db.feedbackLink.findFirst({
      where: {
        sourceManagedId: data.sourceManagedId,
        userId: data.userId,
      },
    });

    if (existingAdoption) {
      return handleError(new Error("You have already adopted this link"));
    }

    // Generate or use provided slug
    let slug = data.slug ?? generateLinkSlug();

    // Check for slug collision
    const existingSlug = await db.feedbackLink.findFirst({
      where: {
        slug,
        userId: data.userId,
        organizationId: managedLink.organizationId,
      },
    });
    if (existingSlug) {
      slug = generateLinkSlug();
    }

    // Create the adopted link
    const adoptedLink = await db.feedbackLink.create({
      data: {
        slug,
        name: managedLink.name,
        userId: data.userId,
        templateId: managedLink.templateId,
        organizationId: managedLink.organizationId,
        visibility: managedLink.visibility,
        feedbackType: managedLink.feedbackType,
        isHidden: managedLink.isHidden,
        isManaged: false, // Adopted links are not managed
        sourceManagedId: data.sourceManagedId,
      },
      include: feedbackLinkInclude,
    });

    return handleSuccess(adoptedLink);
  } catch (e) {
    return handleError(e);
  }
}

// Get managed links available for a user to adopt
export async function getAvailableManagedLinks(
  userId: string,
  organizationId: string,
): Promise<
  HandleEvent<{
    available: ManagedFeedbackLinkWithStats[];
    adopted: FeedbackLinkWithRelations[];
  }>
> {
  try {
    logger("getAvailableManagedLinks", { userId, organizationId });

    // Get all managed links for the org
    const managedLinks = await db.feedbackLink.findMany({
      where: {
        organizationId,
        isManaged: true,
        isActive: true,
      },
      include: managedLinkInclude,
    });

    // Get links the user has already adopted from managed links
    const adoptedLinks = await db.feedbackLink.findMany({
      where: {
        userId,
        organizationId,
        sourceManagedId: { not: null },
      },
      include: feedbackLinkInclude,
    });

    // Filter out already adopted managed links
    const adoptedSourceIds = new Set(
      adoptedLinks.map(l => l.sourceManagedId).filter(Boolean),
    );
    const available = managedLinks.filter(ml => !adoptedSourceIds.has(ml.id));

    return handleSuccess({ available, adopted: adoptedLinks });
  } catch (e) {
    return handleError(e);
  }
}

// Update a managed link (admin only)
export async function updateManagedFeedbackLink(
  id: string,
  data: {
    name?: string;
    templateId?: string;
    visibility?: FeedbackVisibility;
    feedbackType?: FeedbackType;
    isActive?: boolean;
    isHidden?: boolean;
  },
): Promise<HandleEvent<ManagedFeedbackLinkWithStats>> {
  try {
    logger("updateManagedFeedbackLink", { id, data });
    const link = await db.feedbackLink.update({
      where: { id, isManaged: true },
      data,
      include: managedLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Delete a managed link (also removes adoption references)
export async function deleteManagedFeedbackLink(
  id: string,
): Promise<HandleEvent<ManagedFeedbackLinkWithStats>> {
  try {
    logger("deleteManagedFeedbackLink", { id });

    // Clear the sourceManagedId from adopted links first
    await db.feedbackLink.updateMany({
      where: { sourceManagedId: id },
      data: { sourceManagedId: null },
    });

    const link = await db.feedbackLink.delete({
      where: { id, isManaged: true },
      include: managedLinkInclude,
    });
    return handleSuccess(link);
  } catch (e) {
    return handleError(e);
  }
}

// Get adoption stats for a managed link
export async function getManagedLinkAdoptionStats(
  managedLinkId: string,
): Promise<
  HandleEvent<{
    totalAdoptions: number;
    totalResponses: number;
    adoptedBy: Array<{
      userId: string;
      userName: string;
      linkId: string;
      responseCount: number;
    }>;
  }>
> {
  try {
    logger("getManagedLinkAdoptionStats", { managedLinkId });

    const adoptedLinks = await db.feedbackLink.findMany({
      where: { sourceManagedId: managedLinkId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const totalResponses = adoptedLinks.reduce(
      (sum, link) => sum + link.responseCount,
      0,
    );

    const adoptedBy = adoptedLinks.map(link => ({
      userId: link.userId,
      userName:
        [link.user.firstName, link.user.lastName].filter(Boolean).join(" ") ||
        "Unknown",
      linkId: link.id,
      responseCount: link.responseCount,
    }));

    return handleSuccess({
      totalAdoptions: adoptedLinks.length,
      totalResponses,
      adoptedBy,
    });
  } catch (e) {
    return handleError(e);
  }
}
