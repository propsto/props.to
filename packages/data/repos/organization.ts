import type { OrganizationRole } from "@prisma/client";
import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Get organization by slug
export async function getOrganizationBySlug(slug: string) {
  try {
    logger("getOrganizationBySlug", { slug });
    const organization = await db.organization.findFirst({
      where: {
        slug: {
          slug: slug.toLowerCase(),
        },
      },
      include: {
        slug: true,
        organizationSettings: true,
        defaultUserSettings: true,
        feedbackSettings: true,
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by slug with member/template/feedback counts (for admin overview)
export async function getOrganizationBySlugWithCounts(slug: string) {
  try {
    logger("getOrganizationBySlugWithCounts", { slug });
    const organization = await db.organization.findFirst({
      where: {
        slug: {
          slug: slug.toLowerCase(),
        },
      },
      include: {
        slug: true,
        _count: {
          select: {
            members: true,
            templates: true,
            feedbacks: true,
          },
        },
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by slug with members list (for admin members page)
export async function getOrganizationBySlugWithMembers(slug: string) {
  try {
    logger("getOrganizationBySlugWithMembers", { slug });
    const organization = await db.organization.findFirst({
      where: {
        slug: {
          slug: slug.toLowerCase(),
        },
      },
      include: {
        slug: true,
        members: {
          include: {
            user: {
              include: {
                slug: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by slug with categories (for admin categories page)
export async function getOrganizationBySlugWithCategories(slug: string) {
  try {
    logger("getOrganizationBySlugWithCategories", { slug });
    const organization = await db.organization.findFirst({
      where: {
        slug: {
          slug: slug.toLowerCase(),
        },
      },
      include: {
        slug: true,
        categories: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by slug with settings (for admin settings page)
export async function getOrganizationBySlugWithSettings(slug: string) {
  try {
    logger("getOrganizationBySlugWithSettings", { slug });
    const organization = await db.organization.findFirst({
      where: {
        slug: {
          slug: slug.toLowerCase(),
        },
      },
      include: {
        slug: true,
        organizationSettings: true,
        defaultUserSettings: true,
        feedbackSettings: true,
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get user's membership in an organization by org slug
export async function getMembershipByOrgSlug(userId: string, orgSlug: string) {
  try {
    logger("getMembershipByOrgSlug", { userId, orgSlug });
    const membership = await db.organizationMember.findFirst({
      where: {
        userId,
        organization: {
          slug: {
            slug: orgSlug.toLowerCase(),
          },
        },
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    return handleSuccess(membership);
  } catch (e) {
    return handleError(e);
  }
}

// Update or create organization default user settings
export async function upsertOrganizationDefaultSettings(
  organizationId: string,
  settings: {
    defaultProfileVisibility?: "PUBLIC" | "ORGANIZATION" | "PRIVATE";
    allowExternalFeedback?: boolean;
    requireApprovalForPublicProfiles?: boolean;
  },
) {
  try {
    logger("upsertOrganizationDefaultSettings", { organizationId, settings });
    const result = await db.organizationDefaultUserSettings.upsert({
      where: { organizationId },
      update: settings,
      create: {
        organizationId,
        ...settings,
      },
    });
    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Verify user has admin access (OWNER or ADMIN role) to an organization by slug
export async function verifyOrgAdminAccess(userId: string, orgSlug: string) {
  try {
    logger("verifyOrgAdminAccess", { userId, orgSlug });
    const membership = await db.organizationMember.findFirst({
      where: {
        userId,
        organization: {
          slug: {
            slug: orgSlug.toLowerCase(),
          },
        },
        role: { in: ["OWNER", "ADMIN"] },
      },
      include: {
        organization: true,
      },
    });
    return handleSuccess(membership);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by hosted domain (for Google Workspace domain matching)
export async function getOrganizationByHostedDomain(hostedDomain: string) {
  try {
    logger("getOrganizationByHostedDomain", { hostedDomain });
    const organization = await db.organization.findUnique({
      where: { hostedDomain },
      include: {
        slug: true,
        organizationSettings: true,
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by ID
export async function getOrganizationById(organizationId: string) {
  try {
    logger("getOrganizationById", { organizationId });
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        slug: true,
        organizationSettings: true,
        defaultUserSettings: true,
        feedbackSettings: true,
      },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Create organization with hosted domain
export async function createOrganization(data: {
  name: string;
  slug: string;
  hostedDomain?: string;
}) {
  try {
    logger("createOrganization", data);
    const organization = await db.organization.create({
      data: {
        name: data.name,
        hostedDomain: data.hostedDomain,
        slug: {
          create: { slug: data.slug.toLowerCase() },
        },
      },
      include: { slug: true },
    });
    return handleSuccess(organization);
  } catch (e) {
    return handleError(e);
  }
}

// Add a member to an organization
export async function addOrganizationMember(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}) {
  try {
    logger("addOrganizationMember", data);
    const member = await db.organizationMember.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role,
      },
      include: {
        organization: { include: { slug: true } },
        user: true,
      },
    });
    return handleSuccess(member);
  } catch (e) {
    return handleError(e);
  }
}

// Update a member's role in an organization
export async function updateOrganizationMemberRole(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}) {
  try {
    logger("updateOrganizationMemberRole", data);
    const member = await db.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      },
      data: { role: data.role },
      include: {
        organization: { include: { slug: true } },
        user: true,
      },
    });
    return handleSuccess(member);
  } catch (e) {
    return handleError(e);
  }
}

// Remove a member from an organization
export async function removeOrganizationMember(data: {
  userId: string;
  organizationId: string;
}) {
  try {
    logger("removeOrganizationMember", data);
    const member = await db.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      },
    });
    return handleSuccess(member);
  } catch (e) {
    return handleError(e);
  }
}

// Get user's organization memberships
export async function getUserOrganizations(userId: string) {
  try {
    logger("getUserOrganizations", { userId });
    const memberships = await db.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            slug: true,
            organizationSettings: true,
          },
        },
      },
    });
    return handleSuccess(memberships);
  } catch (e) {
    return handleError(e);
  }
}

// Get user's membership for a specific organization
export async function getUserOrganizationMembership(data: {
  userId: string;
  organizationId: string;
}) {
  try {
    logger("getUserOrganizationMembership", data);
    const membership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      },
      include: {
        organization: { include: { slug: true } },
      },
    });
    return handleSuccess(membership);
  } catch (e) {
    return handleError(e);
  }
}

// Check if user is a member of any organization with the given hosted domain
export async function isUserMemberOfDomain(
  userId: string,
  hostedDomain: string,
) {
  try {
    logger("isUserMemberOfDomain", { userId, hostedDomain });
    const membership = await db.organizationMember.findFirst({
      where: {
        userId,
        organization: { hostedDomain },
      },
      include: {
        organization: { include: { slug: true } },
      },
    });
    return handleSuccess(membership);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization members with pagination
export async function getOrganizationMembers(
  organizationId: string,
  options?: { skip?: number; take?: number },
) {
  try {
    logger("getOrganizationMembers", { organizationId, options });
    const members = await db.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { joinedAt: "desc" },
    });
    return handleSuccess(members);
  } catch (e) {
    return handleError(e);
  }
}

// Delete an organization and its associated slugs
export async function deleteOrganization(organizationId: string) {
  try {
    logger("deleteOrganization", { organizationId });

    // Get organization with its slugs before deletion
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        slug: true,
        scopedSlugs: true, // Slugs scoped to this organization (member usernames, groups)
      },
    });

    if (!organization) {
      return handleError(new Error("Organization not found"));
    }

    // Collect all slug IDs to delete
    const slugIdsToDelete = [
      organization.slugId, // Organization's own slug
      ...organization.scopedSlugs.map(s => s.id), // All org-scoped slugs
    ];

    // Delete the organization (cascades to members, settings, etc.)
    const deletedOrganization = await db.organization.delete({
      where: { id: organizationId },
      include: { slug: true },
    });

    // Delete the orphaned slugs
    await db.slug.deleteMany({
      where: { id: { in: slugIdsToDelete } },
    });

    logger("deleteOrganization: deleted organization and slugs", {
      organizationId,
      slugsDeleted: slugIdsToDelete.length,
    });

    return handleSuccess(deletedOrganization);
  } catch (e) {
    return handleError(e);
  }
}
