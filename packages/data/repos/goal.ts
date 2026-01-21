import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { GoalStatus } from "@prisma/client";

const logger = createLogger("data");

// Types for goal data
export type GoalWithFeedback = Prisma.GoalGetPayload<{
  include: {
    user: {
      select: { id: true; firstName: true; lastName: true; image: true };
    };
    organization: { select: { id: true; name: true } };
    linkedFeedback: {
      include: {
        submitter: {
          select: { id: true; firstName: true; lastName: true; image: true };
        };
        template: { select: { name: true } };
      };
    };
  };
}>;

const goalInclude = Prisma.validator<Prisma.GoalInclude>()({
  user: { select: { id: true, firstName: true, lastName: true, image: true } },
  organization: { select: { id: true, name: true } },
  linkedFeedback: {
    include: {
      submitter: {
        select: { id: true, firstName: true, lastName: true, image: true },
      },
      template: { select: { name: true } },
    },
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 10,
  },
});

// Create a goal
export async function createGoal(data: {
  userId: string;
  title: string;
  description?: string;
  targetDate?: Date;
  organizationId?: string;
  status?: GoalStatus;
}): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("createGoal", { userId: data.userId, title: data.title });
    const goal = await db.goal.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
        organizationId: data.organizationId,
        status: data.status ?? "NOT_STARTED",
      },
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Get goal by ID
export async function getGoal(
  id: string,
): Promise<HandleEvent<GoalWithFeedback | null>> {
  try {
    logger("getGoal", { id });
    const goal = await db.goal.findUnique({
      where: { id },
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Update goal
export async function updateGoal(
  id: string,
  data: {
    title?: string;
    description?: string;
    targetDate?: Date | null;
    status?: GoalStatus;
    progress?: number;
  },
): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("updateGoal", { id, data });
    const goal = await db.goal.update({
      where: { id },
      data,
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Delete goal
export async function deleteGoal(
  id: string,
): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("deleteGoal", { id });
    const goal = await db.goal.delete({
      where: { id },
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Get goals for a user
export async function getUserGoals(
  userId: string,
  options?: {
    status?: GoalStatus[];
    organizationId?: string;
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ goals: GoalWithFeedback[]; total: number }>> {
  try {
    logger("getUserGoals", { userId, options });
    const where: Prisma.GoalWhereInput = {
      userId,
      ...(options?.status && { status: { in: options.status } }),
      ...(options?.organizationId !== undefined && {
        organizationId: options.organizationId,
      }),
    };

    const [goals, total] = await Promise.all([
      db.goal.findMany({
        where,
        include: goalInclude,
        orderBy: [
          { status: "asc" },
          { targetDate: "asc" },
          { createdAt: "desc" },
        ],
        skip: options?.skip,
        take: options?.take ?? 20,
      }),
      db.goal.count({ where }),
    ]);

    return handleSuccess({ goals, total });
  } catch (e) {
    return handleError(e);
  }
}

// Get goals for an organization
export async function getOrganizationGoals(
  organizationId: string,
  options?: {
    status?: GoalStatus[];
    userId?: string;
    skip?: number;
    take?: number;
  },
): Promise<HandleEvent<{ goals: GoalWithFeedback[]; total: number }>> {
  try {
    logger("getOrganizationGoals", { organizationId, options });
    const where: Prisma.GoalWhereInput = {
      organizationId,
      ...(options?.status && { status: { in: options.status } }),
      ...(options?.userId && { userId: options.userId }),
    };

    const [goals, total] = await Promise.all([
      db.goal.findMany({
        where,
        include: goalInclude,
        orderBy: [
          { status: "asc" },
          { targetDate: "asc" },
          { createdAt: "desc" },
        ],
        skip: options?.skip,
        take: options?.take ?? 20,
      }),
      db.goal.count({ where }),
    ]);

    return handleSuccess({ goals, total });
  } catch (e) {
    return handleError(e);
  }
}

// Link feedback to a goal
export async function linkFeedbackToGoal(
  goalId: string,
  feedbackId: bigint,
): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("linkFeedbackToGoal", { goalId, feedbackId: feedbackId.toString() });
    const goal = await db.goal.update({
      where: { id: goalId },
      data: {
        linkedFeedback: { connect: { id: feedbackId } },
      },
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Unlink feedback from a goal
export async function unlinkFeedbackFromGoal(
  goalId: string,
  feedbackId: bigint,
): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("unlinkFeedbackFromGoal", {
      goalId,
      feedbackId: feedbackId.toString(),
    });
    const goal = await db.goal.update({
      where: { id: goalId },
      data: {
        linkedFeedback: { disconnect: { id: feedbackId } },
      },
      include: goalInclude,
    });
    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Update goal progress
export async function updateGoalProgress(
  id: string,
  progress: number,
): Promise<HandleEvent<GoalWithFeedback>> {
  try {
    logger("updateGoalProgress", { id, progress });

    // Clamp progress between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));

    // Auto-update status based on progress
    let status: GoalStatus | undefined;
    if (clampedProgress === 0) {
      status = "NOT_STARTED";
    } else if (clampedProgress === 100) {
      status = "COMPLETED";
    } else {
      status = "IN_PROGRESS";
    }

    const goal = await db.goal.update({
      where: { id },
      data: { progress: clampedProgress, status },
      include: goalInclude,
    });

    return handleSuccess(goal);
  } catch (e) {
    return handleError(e);
  }
}

// Get goal stats for a user
export async function getGoalStats(userId: string): Promise<
  HandleEvent<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    cancelled: number;
    averageProgress: number;
  }>
> {
  try {
    logger("getGoalStats", { userId });

    const [total, completed, inProgress, notStarted, cancelled, avgResult] =
      await Promise.all([
        db.goal.count({ where: { userId } }),
        db.goal.count({ where: { userId, status: "COMPLETED" } }),
        db.goal.count({ where: { userId, status: "IN_PROGRESS" } }),
        db.goal.count({ where: { userId, status: "NOT_STARTED" } }),
        db.goal.count({ where: { userId, status: "CANCELLED" } }),
        db.goal.aggregate({
          where: { userId, status: { not: "CANCELLED" } },
          _avg: { progress: true },
        }),
      ]);

    return handleSuccess({
      total,
      completed,
      inProgress,
      notStarted,
      cancelled,
      averageProgress: avgResult._avg.progress ?? 0,
    });
  } catch (e) {
    return handleError(e);
  }
}
