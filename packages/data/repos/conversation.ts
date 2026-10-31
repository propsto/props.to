import { createLogger } from "@propsto/logger";
import type {
  ConversationStage,
  ConversationStatus,
  FeedbackVisibility,
  OrganizationRole,
} from "@prisma/client";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

export type ConversationStepInput = {
  stage: ConversationStage;
  ownerId: string;
  sharedNote: string;
  internalNote?: string | null;
  reviewAt?: Date | null;
  consequence?: string | null;
};

export type CreateConversationInput = {
  organizationId: string;
  subjectUserId: string;
  openedById: string;
  valueId?: string | null;
  firstStep: Omit<ConversationStepInput, "ownerId">;
};

// What the access helper needs to know about a viewer and a subject
export type ConversationViewerContext = {
  orgRole: OrganizationRole | null;
  leadsSubject: boolean;
};

const STAGE_ORDER: Record<ConversationStage, number> = {
  DIRECT: 0,
  REPEATED: 1,
  FINAL: 2,
};

function optionalText(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
}

function cleanStep(step: ConversationStepInput) {
  const sharedNote = step.sharedNote.trim();
  if (!sharedNote) {
    throw new Error("A shared note is required");
  }
  return {
    stage: step.stage,
    ownerId: step.ownerId,
    sharedNote,
    internalNote: optionalText(step.internalNote),
    reviewAt: step.reviewAt ?? null,
    consequence: optionalText(step.consequence),
  };
}

// Feedback a lead or admin may see as evidence: approved, and shared beyond the
// recipient. Private feedback stays the recipient's record.
const EVIDENCE_VISIBILITIES: FeedbackVisibility[] = ["PUBLIC", "ORGANIZATION"];

const conversationInclude = {
  subject: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  openedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  value: { select: { id: true, name: true } },
  steps: {
    orderBy: { createdAt: "asc" as const },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  evidence: {
    // Re-checked on read: feedback can be hidden or re-moderated after it is attached
    where: {
      status: "APPROVED" as const,
      visibility: { in: EVIDENCE_VISIBILITIES },
    },
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      createdAt: true,
      feedbackType: true,
      template: { select: { name: true } },
    },
  },
};

/**
 * The viewer's org role and whether they lead the subject: a lead is a group
 * admin of any group in this organization the subject belongs to.
 */
export async function getConversationViewerContext(
  viewerId: string,
  organizationId: string,
  subjectUserId: string,
) {
  try {
    logger("getConversationViewerContext", {
      viewerId,
      organizationId,
      subjectUserId,
    });

    const [membership, subjectMembership, lead] = await Promise.all([
      db.organizationMember.findUnique({
        where: { userId_organizationId: { userId: viewerId, organizationId } },
        select: { role: true },
      }),
      db.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: subjectUserId, organizationId },
        },
        select: { id: true },
      }),
      db.groupAdmin.findFirst({
        where: {
          userId: viewerId,
          group: { organizationId, users: { some: { id: subjectUserId } } },
        },
        select: { id: true },
      }),
    ]);

    const context: ConversationViewerContext = {
      orgRole: membership?.role ?? null,
      // Leading only counts while both are members of the organization
      leadsSubject: Boolean(membership && subjectMembership && lead),
    };
    return handleSuccess(context);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Open a conversation about an org member with its first step. Snapshots the
 * subject's level name, and refuses a value from another organization.
 */
export async function createConversation(input: CreateConversationInput) {
  try {
    logger("createConversation", {
      organizationId: input.organizationId,
      subjectUserId: input.subjectUserId,
    });

    const firstStep = cleanStep({
      ...input.firstStep,
      ownerId: input.openedById,
    });

    const conversation = await db.$transaction(async tx => {
      const subject = await tx.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: input.subjectUserId,
            organizationId: input.organizationId,
          },
        },
        select: { level: { select: { name: true } } },
      });
      if (!subject) {
        throw new Error("Member not found");
      }

      if (input.valueId) {
        const value = await tx.orgValue.findFirst({
          where: { id: input.valueId, organizationId: input.organizationId },
          select: { id: true },
        });
        if (!value) {
          throw new Error("Value not found");
        }
      }

      return tx.conversation.create({
        data: {
          organizationId: input.organizationId,
          subjectUserId: input.subjectUserId,
          openedById: input.openedById,
          valueId: input.valueId ?? null,
          levelNameSnapshot: subject.level?.name ?? null,
          steps: { create: firstStep },
        },
        include: conversationInclude,
      });
    });

    return handleSuccess(conversation);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Add a step to an open conversation. Stages never go backwards.
 */
export async function addConversationStep(
  conversationId: string,
  organizationId: string,
  input: ConversationStepInput,
) {
  try {
    logger("addConversationStep", { conversationId, organizationId });

    const step = cleanStep(input);

    const created = await db.$transaction(async tx => {
      // Lock the conversation so concurrent steps and resolves apply in turn
      const locked = await tx.$queryRaw<{ status: ConversationStatus }[]>`
        SELECT status FROM "Conversation"
        WHERE id = ${conversationId} AND "organizationId" = ${organizationId}
        FOR UPDATE`;
      if (locked.length === 0) {
        throw new Error("Conversation not found");
      }
      if (locked[0].status !== "OPEN") {
        throw new Error("This conversation is no longer open");
      }

      // Compare with the highest stage reached, not the latest timestamp, which
      // can tie or invert under concurrent writes
      const reached = await tx.conversationStep.findMany({
        where: { conversationId },
        distinct: ["stage"],
        select: { stage: true },
      });
      const highest = Math.max(-1, ...reached.map(r => STAGE_ORDER[r.stage]));
      if (STAGE_ORDER[step.stage] < highest) {
        throw new Error("A step cannot go back to an earlier stage");
      }

      return tx.conversationStep.create({
        data: { ...step, conversationId },
      });
    });

    return handleSuccess(created);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Mark an open conversation RESOLVED or CLOSED.
 */
export async function resolveConversation(
  conversationId: string,
  organizationId: string,
  status: Exclude<ConversationStatus, "OPEN"> = "RESOLVED",
) {
  try {
    logger("resolveConversation", { conversationId, organizationId, status });

    const result = await db.conversation.updateMany({
      where: { id: conversationId, organizationId, status: "OPEN" },
      data: { status, resolvedAt: new Date() },
    });
    if (result.count === 0) {
      throw new Error("Conversation not found or already resolved");
    }

    return handleSuccess({ id: conversationId, status });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Attach a feedback row the subject received in this organization as evidence.
 * Only approved feedback shared beyond the recipient qualifies. Feedback already
 * attached to another conversation is refused; re-attaching to the same one is
 * a no-op.
 */
export async function attachFeedbackToConversation(
  conversationId: string,
  organizationId: string,
  feedbackId: bigint,
) {
  try {
    logger("attachFeedbackToConversation", {
      conversationId,
      organizationId,
      feedbackId: feedbackId.toString(),
    });

    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, organizationId },
      select: { subjectUserId: true },
    });
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const result = await db.feedback.updateMany({
      where: {
        id: feedbackId,
        organizationId,
        userId: conversation.subjectUserId,
        status: "APPROVED",
        visibility: { in: EVIDENCE_VISIBILITIES },
        OR: [{ conversationId: null }, { conversationId }],
      },
      data: { conversationId },
    });
    if (result.count === 0) {
      const attachedElsewhere = await db.feedback.findFirst({
        where: {
          id: feedbackId,
          organizationId,
          userId: conversation.subjectUserId,
          conversationId: { not: null },
          NOT: { conversationId },
        },
        select: { id: true },
      });
      throw new Error(
        attachedElsewhere
          ? "This feedback is already evidence in another conversation"
          : "Feedback not found",
      );
    }

    return handleSuccess({ attached: true });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get one conversation with its steps and evidence. Unredacted: callers must
 * pass it through the app's conversation access helper before showing it.
 */
export async function getConversation(
  conversationId: string,
  organizationId: string,
) {
  try {
    logger("getConversation", { conversationId, organizationId });

    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, organizationId },
      include: conversationInclude,
    });

    return handleSuccess(conversation);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * List the conversations about a member, newest first. Unredacted, like
 * getConversation.
 */
export async function getConversationsForSubject(
  organizationId: string,
  subjectUserId: string,
) {
  try {
    logger("getConversationsForSubject", { organizationId, subjectUserId });

    const conversations = await db.conversation.findMany({
      where: { organizationId, subjectUserId },
      orderBy: { createdAt: "desc" },
      include: conversationInclude,
    });

    return handleSuccess(conversations);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Whether a user is the subject of at least one conversation in an
 * organization (drives the subject's "Conversations" nav entry).
 */
export async function hasConversationsAsSubject(
  organizationId: string,
  subjectUserId: string,
) {
  try {
    logger("hasConversationsAsSubject", { organizationId, subjectUserId });

    const found = await db.conversation.findFirst({
      where: { organizationId, subjectUserId },
      select: { id: true },
    });

    return handleSuccess(Boolean(found));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * One member of an organization by the user's personal slug, for the
 * /org/<org>/people/<slug> pages. Null when they are not a member.
 */
export async function getOrgMemberBySlug(
  organizationId: string,
  userSlug: string,
) {
  try {
    logger("getOrgMemberBySlug", { organizationId, userSlug });

    const member = await db.organizationMember.findFirst({
      where: {
        organizationId,
        user: { slug: { slug: userSlug.toLowerCase(), scope: "GLOBAL" } },
      },
      select: {
        role: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return handleSuccess(member);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Members the viewer leads in an organization: everyone in a group of that
 * organization the viewer administers, except the viewer.
 */
export async function getLedMembers(organizationId: string, viewerId: string) {
  try {
    logger("getLedMembers", { organizationId, viewerId });

    const members = await db.organizationMember.findMany({
      where: {
        organizationId,
        userId: { not: viewerId },
        user: {
          groups: {
            some: { organizationId, admins: { some: { userId: viewerId } } },
          },
        },
      },
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            slug: { select: { slug: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return handleSuccess(members.map(m => m.user));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Feedback about the subject that may still be attached as evidence: approved,
 * shared beyond the recipient, received in this organization, not attached yet.
 */
export async function getAttachableFeedback(
  organizationId: string,
  subjectUserId: string,
) {
  try {
    logger("getAttachableFeedback", { organizationId, subjectUserId });

    const feedback = await db.feedback.findMany({
      where: {
        organizationId,
        userId: subjectUserId,
        status: "APPROVED",
        visibility: { in: EVIDENCE_VISIBILITIES },
        conversationId: null,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        feedbackType: true,
        template: { select: { name: true } },
      },
    });

    return handleSuccess(feedback);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Owners and admins of an organization: the people the escalation path keeps
 * in the loop from the second step on.
 */
export async function getOrganizationAdmins(organizationId: string) {
  try {
    logger("getOrganizationAdmins", { organizationId });

    const admins = await db.organizationMember.findMany({
      where: { organizationId, role: { in: ["OWNER", "ADMIN"] } },
      select: {
        user: { select: { id: true, email: true, firstName: true } },
      },
    });

    return handleSuccess(admins.map(a => a.user));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Every conversation a user is the subject of, across organizations, newest
 * first. Unredacted, like getConversation.
 */
export async function getConversationsForUser(userId: string) {
  try {
    logger("getConversationsForUser", { userId });

    const conversations = await db.conversation.findMany({
      where: { subjectUserId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        ...conversationInclude,
        organization: {
          select: { id: true, name: true, slug: { select: { slug: true } } },
        },
      },
    });

    return handleSuccess(conversations);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Whether a user is the subject of any conversation, in any organization
 * (drives the "Conversations" nav entry).
 */
export async function userIsConversationSubject(userId: string) {
  try {
    logger("userIsConversationSubject", { userId });

    const found = await db.conversation.findFirst({
      where: { subjectUserId: userId },
      select: { id: true },
    });

    return handleSuccess(Boolean(found));
  } catch (e) {
    return handleError(e);
  }
}

export type ConversationWithDetails = NonNullable<
  Awaited<ReturnType<typeof getConversation>>["data"]
>;
