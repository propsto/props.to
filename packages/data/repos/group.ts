import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { v4 as uuidv4 } from "uuid";
import { SlugScope } from "@prisma/client";

const logger = createLogger("data");

// Types for group data
export type GroupWithMembers = Prisma.GroupGetPayload<{
  include: {
    slug: true;
    organization: { select: { id: true; name: true } };
    parent: { select: { id: true; name: true } };
    children: {
      select: { id: true; name: true; slug: { select: { slug: true } } };
    };
    users: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        image: true;
      };
    };
    admins: {
      include: {
        user: {
          select: { id: true; firstName: true; lastName: true; image: true };
        };
      };
    };
    _count: {
      select: { feedbacks: true; feedbackLinks: true; children: true };
    };
  };
}>;

const groupInclude = Prisma.validator<Prisma.GroupInclude>()({
  slug: true,
  organization: { select: { id: true, name: true } },
  parent: { select: { id: true, name: true } },
  children: {
    select: { id: true, name: true, slug: { select: { slug: true } } },
  },
  users: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
    },
  },
  admins: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, image: true },
      },
    },
  },
  _count: { select: { feedbacks: true, feedbackLinks: true, children: true } },
});

// Every id-addressed group function is scoped to the org, so an id from
// another org never matches
async function assertGroupInOrg(
  id: string,
  organizationId: string,
): Promise<void> {
  const group = await db.group.findFirst({
    where: { id, organizationId },
    select: { id: true },
  });
  if (!group) throw new Error("Group not found");
}

// Create a group
export async function createGroup(data: {
  name: string;
  organizationId: string;
  slug?: string;
  description?: string;
  visibility?: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
  parentGroupId?: string;
  adminUserIds?: string[];
  memberUserIds?: string[];
}): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("createGroup", {
      name: data.name,
      organizationId: data.organizationId,
      parentGroupId: data.parentGroupId,
    });

    // Validate parent group nesting depth (max 2 levels)
    if (data.parentGroupId) {
      const parentGroup = await db.group.findUnique({
        where: { id: data.parentGroupId },
        select: { parentGroupId: true, organizationId: true },
      });

      if (!parentGroup) {
        return handleError(new Error("Parent group not found"));
      }

      if (parentGroup.organizationId !== data.organizationId) {
        return handleError(
          new Error("Parent group must be in the same organization"),
        );
      }

      if (parentGroup.parentGroupId) {
        return handleError(
          new Error(
            "Maximum nesting depth is 2 levels (subgroups cannot have subgroups)",
          ),
        );
      }
    }

    // Generate slug if not provided
    const slugValue = data.slug ?? `group-${uuidv4().split("-")[0]}`;

    // Check for slug collision within org
    const existingSlug = await db.slug.findFirst({
      where: {
        slug: slugValue.toLowerCase(),
        scope: SlugScope.ORGANIZATION,
        scopedToOrgId: data.organizationId,
      },
    });

    if (existingSlug) {
      return handleError(
        new Error("Group slug already exists in this organization"),
      );
    }

    // Create slug first
    const newSlug = await db.slug.create({
      data: {
        slug: slugValue.toLowerCase(),
        scope: SlugScope.ORGANIZATION,
        scopedToOrgId: data.organizationId,
      },
    });

    // Create group with slug reference
    const group = await db.group.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        slugId: newSlug.id,
        description: data.description,
        visibility: data.visibility ?? "ORGANIZATION",
        parentGroupId: data.parentGroupId,
        ...(data.memberUserIds && {
          users: { connect: data.memberUserIds.map(id => ({ id })) },
        }),
        ...(data.adminUserIds && {
          admins: {
            create: data.adminUserIds.map(userId => ({ userId })),
          },
        }),
      },
      include: groupInclude,
    });

    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Get group by ID within an organization
export async function getGroup(
  id: string,
  organizationId: string,
): Promise<HandleEvent<GroupWithMembers | null>> {
  try {
    logger("getGroup", { id, organizationId });
    const group = await db.group.findFirst({
      where: { id, organizationId },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Get group by slug within an organization
export async function getGroupBySlug(
  slug: string,
  organizationId: string,
): Promise<HandleEvent<GroupWithMembers | null>> {
  try {
    logger("getGroupBySlug", { slug, organizationId });
    const slugRecord = await db.slug.findFirst({
      where: {
        slug: slug.toLowerCase(),
        scope: SlugScope.ORGANIZATION,
        scopedToOrgId: organizationId,
      },
    });

    if (!slugRecord) {
      return handleSuccess(null);
    }

    const group = await db.group.findFirst({
      where: { slugId: slugRecord.id },
      include: groupInclude,
    });

    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Update group
export async function updateGroup(
  id: string,
  organizationId: string,
  data: {
    name?: string;
    description?: string;
    visibility?: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
    parentGroupId?: string | null;
  },
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("updateGroup", { id, organizationId, data });

    const currentGroup = await db.group.findFirst({
      where: { id, organizationId },
      select: { children: { select: { id: true } } },
    });
    if (!currentGroup) {
      return handleError(new Error("Group not found"));
    }

    // Validate parent group nesting depth if changing parent
    if (data.parentGroupId !== undefined && data.parentGroupId !== null) {
      // A parent from another org never matches
      const parentGroup = await db.group.findFirst({
        where: { id: data.parentGroupId, organizationId },
        select: { parentGroupId: true },
      });

      if (!parentGroup) {
        return handleError(new Error("Parent group not found"));
      }

      if (parentGroup.parentGroupId) {
        return handleError(
          new Error(
            "Maximum nesting depth is 2 levels (subgroups cannot have subgroups)",
          ),
        );
      }

      // Cannot set as parent if current group already has children
      if (currentGroup.children.length > 0) {
        return handleError(
          new Error("Cannot make a group with subgroups into a subgroup"),
        );
      }
    }

    const group = await db.group.update({
      where: { id, organizationId },
      data,
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Delete group
export async function deleteGroup(
  id: string,
  organizationId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("deleteGroup", { id, organizationId });
    await assertGroupInOrg(id, organizationId);
    // Team-recipient rows would be stranded by SetNull (and then violate the
    // one-recipient constraint), so a group that has received team feedback or
    // carries team links cannot be deleted; deactivate its links instead.
    const teamRows = await db.feedbackLink.count({
      where: { groupId: id, userId: null, entityId: null },
    });
    const teamFeedback = await db.feedback.count({
      where: { groupId: id, userId: null, entityId: null },
    });
    if (teamRows > 0 || teamFeedback > 0) {
      return handleError(
        new Error(
          "This group has team feedback links or feedback and cannot be deleted",
        ),
      );
    }
    const group = await db.group.delete({
      where: { id, organizationId },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Get all groups for an organization
export async function getOrganizationGroups(
  organizationId: string,
  options?: {
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ groups: GroupWithMembers[]; total: number }>> {
  try {
    logger("getOrganizationGroups", { organizationId, options });
    const where: Prisma.GroupWhereInput = { organizationId };

    const [groups, total] = await Promise.all([
      db.group.findMany({
        where,
        include: groupInclude,
        orderBy: { name: "asc" },
        skip: options?.skip,
        take: options?.take ?? 50,
      }),
      db.group.count({ where }),
    ]);

    return handleSuccess({ groups, total });
  } catch (e) {
    return handleError(e);
  }
}

// Get groups a user belongs to
export async function getUserGroups(
  userId: string,
  organizationId?: string,
): Promise<HandleEvent<GroupWithMembers[]>> {
  try {
    logger("getUserGroups", { userId, organizationId });
    const groups = await db.group.findMany({
      where: {
        users: { some: { id: userId } },
        ...(organizationId && { organizationId }),
      },
      include: groupInclude,
      orderBy: { name: "asc" },
    });
    return handleSuccess(groups);
  } catch (e) {
    return handleError(e);
  }
}

// Add member to group
export async function addGroupMember(
  groupId: string,
  organizationId: string,
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupMember", { groupId, organizationId, userId });
    await assertGroupInOrg(groupId, organizationId);
    const group = await db.group.update({
      where: { id: groupId, organizationId },
      data: {
        users: { connect: { id: userId } },
      },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Remove member from group
export async function removeGroupMember(
  groupId: string,
  organizationId: string,
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupMember", { groupId, organizationId, userId });
    await assertGroupInOrg(groupId, organizationId);

    // Also remove from admins if they are one
    await db.groupAdmin.deleteMany({
      where: { groupId, userId },
    });

    const group = await db.group.update({
      where: { id: groupId, organizationId },
      data: {
        users: { disconnect: { id: userId } },
      },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Add multiple members to group
export async function addGroupMembers(
  groupId: string,
  organizationId: string,
  userIds: string[],
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupMembers", { groupId, organizationId, userIds });
    await assertGroupInOrg(groupId, organizationId);
    const group = await db.group.update({
      where: { id: groupId, organizationId },
      data: {
        users: { connect: userIds.map(id => ({ id })) },
      },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Remove multiple members from group
export async function removeGroupMembers(
  groupId: string,
  organizationId: string,
  userIds: string[],
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupMembers", { groupId, organizationId, userIds });
    await assertGroupInOrg(groupId, organizationId);

    // Also remove from admins
    await db.groupAdmin.deleteMany({
      where: { groupId, userId: { in: userIds } },
    });

    const group = await db.group.update({
      where: { id: groupId, organizationId },
      data: {
        users: { disconnect: userIds.map(id => ({ id })) },
      },
      include: groupInclude,
    });
    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Add group admin
export async function addGroupAdmin(
  groupId: string,
  organizationId: string,
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupAdmin", { groupId, organizationId, userId });
    await assertGroupInOrg(groupId, organizationId);

    // First ensure user is a member
    await db.group.update({
      where: { id: groupId, organizationId },
      data: { users: { connect: { id: userId } } },
    });

    // Check if already admin
    const existingAdmin = await db.groupAdmin.findFirst({
      where: { groupId, userId },
    });

    if (!existingAdmin) {
      await db.groupAdmin.create({
        data: { groupId, userId },
      });
    }

    const group = await db.group.findFirst({
      where: { id: groupId, organizationId },
      include: groupInclude,
    });
    if (!group) throw new Error("Group not found");

    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Remove group admin
export async function removeGroupAdmin(
  groupId: string,
  organizationId: string,
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupAdmin", { groupId, organizationId, userId });
    await assertGroupInOrg(groupId, organizationId);
    await db.groupAdmin.deleteMany({
      where: { groupId, userId },
    });

    const group = await db.group.findFirst({
      where: { id: groupId, organizationId },
      include: groupInclude,
    });
    if (!group) throw new Error("Group not found");

    return handleSuccess(group);
  } catch (e) {
    return handleError(e);
  }
}

// Check if user is group admin
export async function isGroupAdmin(
  groupId: string,
  userId: string,
): Promise<HandleEvent<boolean>> {
  try {
    logger("isGroupAdmin", { groupId, userId });
    const admin = await db.groupAdmin.findFirst({
      where: { groupId, userId },
    });
    return handleSuccess(!!admin);
  } catch (e) {
    return handleError(e);
  }
}

// Type for public group page data
export type PublicGroupData = {
  id: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
  organizationId: string;
  slug: { slug: string };
  organization: {
    id: string;
    name: string;
    slug: { slug: string };
  };
  users: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    organizationSlugs: Array<{ slug: string; scopedToOrgId: string | null }>;
  }>;
  feedbackLinks: Array<{
    id: string;
    slug: string;
    name: string;
    template: { name: string } | null;
    isActive: boolean;
    isHidden: boolean;
    userId: string | null;
    entityId: string | null;
  }>;
  // Subgroups the viewer may see, and the parent when the viewer may see it
  children: Array<{
    id: string;
    name: string;
    description: string | null;
    slug: { slug: string };
    memberCount: number;
  }>;
  parent: { name: string; slug: { slug: string } } | null;
  viewerIsMember: boolean;
};

// Get group for public page display (respects visibility)
export async function getGroupForPublicPage(
  groupId: string,
  viewerUserId?: string,
): Promise<HandleEvent<PublicGroupData | null>> {
  try {
    logger("getGroupForPublicPage", { groupId, viewerUserId });

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        slug: { select: { slug: true } },
        organization: {
          select: {
            id: true,
            name: true,
            slug: { select: { slug: true } },
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            organizationSlugs: {
              select: { slug: true, scopedToOrgId: true },
            },
          },
        },
        feedbackLinks: {
          where: { isActive: true, isHidden: false },
          select: {
            id: true,
            slug: true,
            name: true,
            template: { select: { name: true } },
            isActive: true,
            isHidden: true,
            userId: true,
            entityId: true,
          },
        },
        parent: {
          select: {
            name: true,
            visibility: true,
            slug: { select: { slug: true } },
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            visibility: true,
            slug: { select: { slug: true } },
            _count: { select: { users: true } },
          },
        },
      },
    });

    if (!group) {
      return handleSuccess(null);
    }

    // Membership decides ORGANIZATION-visibility for the group, its parent
    // and its subgroups in one place
    const isMember = viewerUserId
      ? Boolean(
          await db.organizationMember.findFirst({
            where: {
              userId: viewerUserId,
              organizationId: group.organizationId,
            },
          }),
        )
      : false;

    if (group.visibility === "PRIVATE") {
      return handleSuccess(null);
    }
    if (group.visibility === "ORGANIZATION" && !isMember) {
      return handleSuccess(null);
    }

    const visibleTo = (v: string): boolean =>
      v === "PUBLIC" || (v === "ORGANIZATION" && isMember);
    const { parent, children, ...rest } = group;

    return handleSuccess({
      ...rest,
      children: children
        .filter(c => visibleTo(c.visibility))
        .map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          slug: c.slug,
          memberCount: c._count.users,
        })),
      parent:
        parent && visibleTo(parent.visibility)
          ? { name: parent.name, slug: parent.slug }
          : null,
      viewerIsMember: isMember,
    } as PublicGroupData);
  } catch (e) {
    return handleError(e);
  }
}

// Check if user can view group based on visibility
export async function canViewGroup(
  groupId: string,
  viewerUserId?: string,
): Promise<HandleEvent<boolean>> {
  try {
    logger("canViewGroup", { groupId, viewerUserId });

    const group = await db.group.findUnique({
      where: { id: groupId },
      select: { visibility: true, organizationId: true },
    });

    if (!group) {
      return handleSuccess(false);
    }

    if (group.visibility === "PUBLIC") {
      return handleSuccess(true);
    }

    if (group.visibility === "PRIVATE") {
      return handleSuccess(false);
    }

    // ORGANIZATION visibility - check membership
    if (!viewerUserId) {
      return handleSuccess(false);
    }

    const isMember = await db.organizationMember.findFirst({
      where: {
        userId: viewerUserId,
        organizationId: group.organizationId,
      },
    });

    return handleSuccess(!!isMember);
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback for a group
export async function getGroupFeedback(
  groupId: string,
  options?: {
    skip?: number;
    take?: number;
  },
): Promise<
  HandleEvent<{
    feedbacks: Prisma.FeedbackGetPayload<{
      include: {
        submitter: {
          select: { id: true; firstName: true; lastName: true; image: true };
        };
        template: { select: { name: true } };
      };
    }>[];
    total: number;
  }>
> {
  try {
    logger("getGroupFeedback", { groupId, options });
    // Team-recipient rows only: a person's feedback that merely carries the
    // group as context stays on the person's record, never on the team's page
    const where: Prisma.FeedbackWhereInput = {
      groupId,
      status: "APPROVED",
      userId: null,
      entityId: null,
    };

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: {
          submitter: {
            select: { id: true, firstName: true, lastName: true, image: true },
          },
          template: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take ?? 20,
      }),
      db.feedback.count({ where }),
    ]);

    return handleSuccess({ feedbacks, total });
  } catch (e) {
    return handleError(e);
  }
}

// The leads to notify about team feedback: the group's name and each admin's
// email, nothing else leaves the repo
export async function getGroupAdminRecipients(groupId: string): Promise<
  HandleEvent<{
    groupName: string;
    // Where team feedback is read: the group's public page
    groupPath: string;
    admins: { email: string | null; firstName: string | null }[];
  } | null>
> {
  try {
    logger("getGroupAdminRecipients", { groupId });
    const group = await db.group.findUnique({
      where: { id: groupId },
      select: {
        name: true,
        slug: { select: { slug: true } },
        organization: { select: { slug: { select: { slug: true } } } },
        admins: {
          select: { user: { select: { email: true, firstName: true } } },
        },
      },
    });
    if (!group) return handleSuccess(null);
    return handleSuccess({
      groupName: group.name,
      groupPath: `/${group.organization.slug.slug}/${group.slug.slug}`,
      admins: group.admins.map(a => a.user),
    });
  } catch (e) {
    return handleError(e);
  }
}
