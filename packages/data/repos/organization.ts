import type { OrganizationRole, Prisma } from "@prisma/client";
import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import {
  normalizeHostedDomain,
  orgUsernameFromEmail,
} from "../utils/provision-org";
import {
  defaultOrganizationCreationSettings,
  type OrganizationCreationSettings,
} from "./organization-settings";
import { ensureOrgFeedbackLink } from "./feedback-link";

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
            // People feedback; entity feedback is counted on its entity
            feedbacks: { where: { entityId: null } },
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
            hostedDomain: true,
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

// Whether an OWNER/ADMIN other than userId exists, i.e. someone else can
// moderate feedback addressed to userId
export async function hasOtherOrgAdmin(organizationId: string, userId: string) {
  try {
    logger("hasOtherOrgAdmin", { organizationId, userId });
    const count = await db.organizationMember.count({
      where: {
        organizationId,
        userId: { not: userId },
        role: { in: ["OWNER", "ADMIN"] },
      },
    });
    return handleSuccess(count > 0);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization by hosted domain (for Google Workspace domain matching)
export async function getOrganizationByHostedDomain(hostedDomain: string) {
  try {
    logger("getOrganizationByHostedDomain", { hostedDomain });
    const organization = await db.organization.findUnique({
      // Normalize on read so a lookup matches the normalized value stored at org creation
      where: { hostedDomain: hostedDomain.trim().toLowerCase() },
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

// Create an organization with its GLOBAL slug, settings rows and an OWNER
// (plus their org-scoped username), as Google Workspace admin onboarding does.
// Callers check slug and hosted-domain availability first.
export async function createOrganizationWithOwner(data: {
  name: string;
  slug: string;
  hostedDomain: string;
  ownerId: string;
  ownerEmail: string;
  settings?: OrganizationCreationSettings;
}) {
  try {
    logger("createOrganizationWithOwner", data);
    const settings = data.settings ?? defaultOrganizationCreationSettings;
    const username = orgUsernameFromEmail(data.ownerEmail);
    const organization = await db.$transaction(async tx => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          hostedDomain: normalizeHostedDomain(data.hostedDomain),
          slug: {
            create: {
              slug: data.slug.toLowerCase(),
              scope: "GLOBAL",
              scopedToOrgId: null,
            },
          },
          defaultUserSettings: { create: settings.defaultUserSettings },
          organizationSettings: { create: settings.organizationSettings },
          feedbackSettings: { create: settings.feedbackSettings },
        },
        include: { slug: true },
      });
      await tx.organizationMember.create({
        data: { userId: data.ownerId, organizationId: org.id, role: "OWNER" },
      });
      // A new org has no org-scoped slugs yet, so the username is free
      if (username) {
        await tx.slug.create({
          data: {
            slug: username,
            scope: "ORGANIZATION",
            scopedToOrgId: org.id,
            orgSlugOwnerId: data.ownerId,
          },
        });
      }
      return org;
    });
    // Best effort: joining must not fail when the receiving link can't be made
    await ensureOrgFeedbackLink(data.ownerId, organization.id);
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
    // Best effort: joining must not fail when the receiving link can't be made
    await ensureOrgFeedbackLink(data.userId, data.organizationId);
    return handleSuccess(member);
  } catch (e) {
    return handleError(e);
  }
}

// Membership changes lock the org row, so two concurrent changes (two owners
// demoting each other) cannot both see another OWNER and leave the org with none.
async function changeKeepingAnOwner(
  tx: Prisma.TransactionClient,
  organizationId: string,
  change: () => Promise<unknown>,
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${organizationId} FOR UPDATE`;
  await change();
  const owners = await tx.organizationMember.count({
    where: { organizationId, role: "OWNER" },
  });
  if (owners === 0) {
    throw new Error("The organization must keep at least one owner");
  }
}

// Update a member's role in an organization. Refuses to demote the last OWNER.
export async function updateOrganizationMemberRole(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}) {
  try {
    logger("updateOrganizationMemberRole", data);
    await db.$transaction(tx =>
      changeKeepingAnOwner(tx, data.organizationId, () =>
        tx.organizationMember.update({
          where: {
            userId_organizationId: {
              userId: data.userId,
              organizationId: data.organizationId,
            },
          },
          data: { role: data.role },
        }),
      ),
    );
    return handleSuccess(true);
  } catch (e) {
    return handleError(e);
  }
}

// Remove a member from an organization: deactivates their org links, deletes
// their org-scoped slug (so /<org>/<user>/... stops resolving) and drops them
// from the org's groups. Managed links they authored pass to `actorId` so the
// org keeps a member as owner. Refuses to remove the last OWNER.
export async function removeOrganizationMember(data: {
  userId: string;
  organizationId: string;
  actorId: string;
}) {
  try {
    logger("removeOrganizationMember", data);
    const { userId, organizationId, actorId } = data;
    await db.$transaction(tx =>
      changeKeepingAnOwner(tx, organizationId, async () => {
        await tx.organizationMember.delete({
          where: { userId_organizationId: { userId, organizationId } },
        });
        // Managed links are org links the admin authored, not their own links
        await tx.feedbackLink.updateMany({
          where: { userId, organizationId, isManaged: false },
          data: { isActive: false },
        });
        await tx.feedbackLink.updateMany({
          where: { userId, organizationId, isManaged: true },
          data: { userId: actorId },
        });
        await tx.slug.deleteMany({
          where: {
            scope: "ORGANIZATION",
            scopedToOrgId: organizationId,
            orgSlugOwnerId: userId,
          },
        });
        const groups = await tx.group.findMany({
          where: { organizationId, users: { some: { id: userId } } },
          select: { id: true },
        });
        await tx.user.update({
          where: { id: userId },
          data: { groups: { disconnect: groups } },
        });
        await tx.groupAdmin.deleteMany({
          where: { userId, group: { organizationId } },
        });
      }),
    );
    return handleSuccess(true);
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
        organization: { hostedDomain: hostedDomain.trim().toLowerCase() },
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
