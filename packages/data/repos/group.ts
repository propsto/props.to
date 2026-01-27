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
    _count: { select: { feedbacks: true; feedbackLinks: true } };
  };
}>;

const groupInclude = Prisma.validator<Prisma.GroupInclude>()({
  slug: true,
  organization: { select: { id: true, name: true } },
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
  _count: { select: { feedbacks: true, feedbackLinks: true } },
});

// Create a group
export async function createGroup(data: {
  name: string;
  organizationId: string;
  slug?: string;
  adminUserIds?: string[];
  memberUserIds?: string[];
}): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("createGroup", {
      name: data.name,
      organizationId: data.organizationId,
    });

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

// Get group by ID
export async function getGroup(
  id: string,
): Promise<HandleEvent<GroupWithMembers | null>> {
  try {
    logger("getGroup", { id });
    const group = await db.group.findUnique({
      where: { id },
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
  data: {
    name?: string;
  },
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("updateGroup", { id, data });
    const group = await db.group.update({
      where: { id },
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
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("deleteGroup", { id });
    const group = await db.group.delete({
      where: { id },
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
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupMember", { groupId, userId });
    const group = await db.group.update({
      where: { id: groupId },
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
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupMember", { groupId, userId });

    // Also remove from admins if they are one
    await db.groupAdmin.deleteMany({
      where: { groupId, userId },
    });

    const group = await db.group.update({
      where: { id: groupId },
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
  userIds: string[],
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupMembers", { groupId, userIds });
    const group = await db.group.update({
      where: { id: groupId },
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
  userIds: string[],
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupMembers", { groupId, userIds });

    // Also remove from admins
    await db.groupAdmin.deleteMany({
      where: { groupId, userId: { in: userIds } },
    });

    const group = await db.group.update({
      where: { id: groupId },
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
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("addGroupAdmin", { groupId, userId });

    // First ensure user is a member
    await db.group.update({
      where: { id: groupId },
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

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: groupInclude,
    });

    return handleSuccess(group!);
  } catch (e) {
    return handleError(e);
  }
}

// Remove group admin
export async function removeGroupAdmin(
  groupId: string,
  userId: string,
): Promise<HandleEvent<GroupWithMembers>> {
  try {
    logger("removeGroupAdmin", { groupId, userId });
    await db.groupAdmin.deleteMany({
      where: { groupId, userId },
    });

    const group = await db.group.findUnique({
      where: { id: groupId },
      include: groupInclude,
    });

    return handleSuccess(group!);
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
        user: {
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
    const where: Prisma.FeedbackWhereInput = { groupId, status: "APPROVED" };

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: {
          user: {
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
