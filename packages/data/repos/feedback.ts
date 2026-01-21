import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import {
  FeedbackStatus,
  FeedbackType,
  FeedbackVisibility,
} from "@prisma/client";

const logger = createLogger("data");

// Types for feedback data
export type FeedbackWithRelations = Prisma.FeedbackGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        image: true;
      };
    };
    submitter: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        image: true;
      };
    };
    template: { select: { id: true; name: true; feedbackType: true } };
    organization: { select: { id: true; name: true } };
    group: { select: { id: true; name: true } };
    link: { select: { id: true; slug: true; name: true } };
    goals: { select: { id: true; title: true } };
  };
}>;

export type FeedbackStats = {
  received: number;
  sent: number;
  pendingModeration: number;
  averageRating: number | null;
  recentCount: number; // Last 30 days
};

export type OrgFeedbackStats = FeedbackStats & {
  totalMembers: number;
  membersWithFeedback: number;
  feedbackByType: Record<FeedbackType, number>;
};

const feedbackInclude = Prisma.validator<Prisma.FeedbackInclude>()({
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
    },
  },
  submitter: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
    },
  },
  template: { select: { id: true, name: true, feedbackType: true } },
  organization: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
  link: { select: { id: true, slug: true, name: true } },
  goals: { select: { id: true, title: true } },
});

// Create feedback
export async function createFeedback(data: {
  userId: string; // Recipient
  templateId: string;
  fieldsData?: Prisma.InputJsonValue;
  organizationId?: string;
  groupId?: string;
  linkId?: string;
  submitterId?: string;
  submitterEmail?: string;
  submitterName?: string;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
  status?: FeedbackStatus;
  organizationNameSnapshot?: string;
  groupNameSnapshot?: string;
  userOrgRoleSnapshot?: string;
}): Promise<HandleEvent<FeedbackWithRelations>> {
  try {
    logger("createFeedback", {
      userId: data.userId,
      templateId: data.templateId,
    });
    const feedback = await db.feedback.create({
      data: {
        userId: data.userId,
        templateId: data.templateId,
        fieldsData: data.fieldsData,
        organizationId: data.organizationId,
        groupId: data.groupId,
        linkId: data.linkId,
        submitterId: data.submitterId,
        submitterEmail: data.submitterEmail,
        submitterName: data.submitterName,
        visibility: data.visibility ?? "PRIVATE",
        feedbackType: data.feedbackType ?? "RECOGNITION",
        status: data.status ?? "APPROVED",
        organizationNameSnapshot: data.organizationNameSnapshot,
        groupNameSnapshot: data.groupNameSnapshot,
        userOrgRoleSnapshot: data.userOrgRoleSnapshot,
      },
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Get single feedback by ID
export async function getFeedback(
  id: bigint,
): Promise<HandleEvent<FeedbackWithRelations | null>> {
  try {
    logger("getFeedback", { id: id.toString() });
    const feedback = await db.feedback.findUnique({
      where: { id },
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Update feedback
export async function updateFeedback(
  id: bigint,
  data: {
    fieldsData?: Prisma.InputJsonValue;
    visibility?: FeedbackVisibility;
    status?: FeedbackStatus;
  },
): Promise<HandleEvent<FeedbackWithRelations>> {
  try {
    logger("updateFeedback", { id: id.toString(), data });
    const feedback = await db.feedback.update({
      where: { id },
      data,
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Delete feedback
export async function deleteFeedback(
  id: bigint,
): Promise<HandleEvent<FeedbackWithRelations>> {
  try {
    logger("deleteFeedback", { id: id.toString() });
    const feedback = await db.feedback.delete({
      where: { id },
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback received by a user
export async function getFeedbackForUser(
  userId: string,
  options?: {
    skip?: number;
    take?: number;
    status?: FeedbackStatus[];
    feedbackType?: FeedbackType[];
    organizationId?: string;
  },
): Promise<HandleEvent<{ feedbacks: FeedbackWithRelations[]; total: number }>> {
  try {
    logger("getFeedbackForUser", { userId, options });
    const where: Prisma.FeedbackWhereInput = {
      userId,
      ...(options?.status && { status: { in: options.status } }),
      ...(options?.feedbackType && {
        feedbackType: { in: options.feedbackType },
      }),
      ...(options?.organizationId && {
        organizationId: options.organizationId,
      }),
    };

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: feedbackInclude,
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

// Get feedback sent by a user
export async function getFeedbackByUser(
  submitterId: string,
  options?: {
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ feedbacks: FeedbackWithRelations[]; total: number }>> {
  try {
    logger("getFeedbackByUser", { submitterId, options });
    const where: Prisma.FeedbackWhereInput = { submitterId };

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: feedbackInclude,
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

// Get feedback for an organization (admin view)
export async function getFeedbackForOrganization(
  organizationId: string,
  options?: {
    skip?: number;
    take?: number;
    status?: FeedbackStatus[];
    feedbackType?: FeedbackType[];
    userId?: string; // Filter by specific user
  },
): Promise<HandleEvent<{ feedbacks: FeedbackWithRelations[]; total: number }>> {
  try {
    logger("getFeedbackForOrganization", { organizationId, options });
    const where: Prisma.FeedbackWhereInput = {
      organizationId,
      ...(options?.status && { status: { in: options.status } }),
      ...(options?.feedbackType && {
        feedbackType: { in: options.feedbackType },
      }),
      ...(options?.userId && { userId: options.userId }),
    };

    const [feedbacks, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: feedbackInclude,
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

// Get pending moderation feedback for an organization
export async function getPendingModerationFeedback(
  organizationId: string,
): Promise<HandleEvent<FeedbackWithRelations[]>> {
  try {
    logger("getPendingModerationFeedback", { organizationId });
    const feedbacks = await db.feedback.findMany({
      where: {
        organizationId,
        status: "PENDING_MODERATION",
      },
      include: feedbackInclude,
      orderBy: { createdAt: "asc" },
    });
    return handleSuccess(feedbacks);
  } catch (e) {
    return handleError(e);
  }
}

// Approve feedback (moderation)
export async function approveFeedback(
  id: bigint,
  moderatorId: string,
): Promise<HandleEvent<FeedbackWithRelations>> {
  try {
    logger("approveFeedback", { id: id.toString(), moderatorId });
    const feedback = await db.feedback.update({
      where: { id },
      data: {
        status: "APPROVED",
        moderatedById: moderatorId,
        moderatedAt: new Date(),
      },
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Reject feedback (moderation)
export async function rejectFeedback(
  id: bigint,
  moderatorId: string,
  reason?: string,
): Promise<HandleEvent<FeedbackWithRelations>> {
  try {
    logger("rejectFeedback", { id: id.toString(), moderatorId, reason });
    const feedback = await db.feedback.update({
      where: { id },
      data: {
        status: "REJECTED",
        moderatedById: moderatorId,
        moderatedAt: new Date(),
        rejectReason: reason,
      },
      include: feedbackInclude,
    });
    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

// Get feedback stats for a user
export async function getFeedbackStats(
  userId: string,
): Promise<HandleEvent<FeedbackStats>> {
  try {
    logger("getFeedbackStats", { userId });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [received, sent, pendingModeration, recentCount] = await Promise.all([
      db.feedback.count({ where: { userId, status: "APPROVED" } }),
      db.feedback.count({ where: { submitterId: userId } }),
      db.feedback.count({ where: { userId, status: "PENDING_MODERATION" } }),
      db.feedback.count({
        where: {
          userId,
          status: "APPROVED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate average rating from fieldsData if rating field exists
    // This is a simplified version - in production you'd want to query the actual rating field
    const averageRating = null; // To be implemented based on template field structure

    return handleSuccess({
      received,
      sent,
      pendingModeration,
      averageRating,
      recentCount,
    });
  } catch (e) {
    return handleError(e);
  }
}

// Get organization feedback stats
export async function getOrganizationFeedbackStats(
  organizationId: string,
): Promise<HandleEvent<OrgFeedbackStats>> {
  try {
    logger("getOrganizationFeedbackStats", { organizationId });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      received,
      sent,
      pendingModeration,
      recentCount,
      totalMembers,
      membersWithFeedback,
      feedbackByTypeRaw,
    ] = await Promise.all([
      db.feedback.count({ where: { organizationId, status: "APPROVED" } }),
      db.feedback.count({
        where: {
          submitter: { organizations: { some: { organizationId } } },
        },
      }),
      db.feedback.count({
        where: { organizationId, status: "PENDING_MODERATION" },
      }),
      db.feedback.count({
        where: {
          organizationId,
          status: "APPROVED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.organizationMember.count({ where: { organizationId } }),
      db.feedback
        .groupBy({
          by: ["userId"],
          where: { organizationId },
          _count: true,
        })
        .then(res => res.length),
      db.feedback.groupBy({
        by: ["feedbackType"],
        where: { organizationId },
        _count: true,
      }),
    ]);

    const feedbackByType = feedbackByTypeRaw.reduce(
      (acc, item) => {
        acc[item.feedbackType] = item._count;
        return acc;
      },
      {} as Record<FeedbackType, number>,
    );

    return handleSuccess({
      received,
      sent,
      pendingModeration,
      averageRating: null,
      recentCount,
      totalMembers,
      membersWithFeedback,
      feedbackByType,
    });
  } catch (e) {
    return handleError(e);
  }
}

// Get recent feedback for dashboard
export async function getRecentFeedback(
  userId: string,
  limit: number = 5,
): Promise<HandleEvent<FeedbackWithRelations[]>> {
  try {
    logger("getRecentFeedback", { userId, limit });
    const feedbacks = await db.feedback.findMany({
      where: {
        userId,
        status: "APPROVED",
      },
      include: feedbackInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return handleSuccess(feedbacks);
  } catch (e) {
    return handleError(e);
  }
}
