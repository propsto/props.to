"use server";

import type { ConversationStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  addConversationStep,
  attachFeedbackToConversation,
  createAuditLog,
  createConversation,
  getConversation,
  getMembershipByOrgSlug,
  getOrgMemberBySlug,
  resolveConversation,
} from "@propsto/data/repos";
import { auth } from "@/server/auth.server";
import {
  canAddStage,
  getConversationAccess,
  type ConversationAccess,
} from "@/server/conversation-access";
import {
  notifyConversationSubject,
  notifyOrgAdminsOfEscalation,
} from "@/lib/conversation-email";
import { STAGES, personName } from "@/lib/conversation-labels";

export type StepPayload = {
  stage: string;
  sharedNote: string;
  internalNote?: string;
  reviewAt?: string; // YYYY-MM-DD from a date input, or empty
  consequence?: string;
};

type Result = { success: true } | { success: false; error: string };

type Context = {
  actor: { id: string; name: string };
  org: { id: string; name: string };
  subject: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  access: ConversationAccess;
  orgSlug: string;
  memberSlug: string;
};

// The viewer, org and subject all come from the session and the URL parts,
// never from client-supplied ids. Only leads of the subject and org admins
// may write.
async function authorize(
  orgSlug: string,
  memberSlug: string,
): Promise<{ error: string } | { error: null; ctx: Context }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const membership = await getMembershipByOrgSlug(session.user.id, orgSlug);
  if (!membership.success || !membership.data) {
    return { error: "Not authorized" };
  }
  const org = membership.data.organization;
  const member = await getOrgMemberBySlug(org.id, memberSlug);
  if (!member.success || !member.data) return { error: "Member not found" };
  const subject = member.data.user;
  const access = await getConversationAccess(
    session.user.id,
    org.id,
    subject.id,
  );
  if (!access.canWrite) return { error: "Not authorized" };
  return {
    error: null,
    ctx: {
      actor: {
        id: session.user.id,
        name:
          `${session.user.firstName ?? ""} ${session.user.lastName ?? ""}`.trim() ||
          session.user.email ||
          "A lead",
      },
      org: { id: org.id, name: org.name },
      subject,
      access,
      orgSlug,
      memberSlug,
    },
  };
}

type CleanStep = {
  stage: ConversationStage;
  sharedNote: string;
  internalNote: string | null;
  reviewAt: Date | null;
  consequence: string | null;
};

function parseStep(
  payload: StepPayload,
  access: ConversationAccess,
): { error: string } | { error: null; step: CleanStep } {
  const stage = STAGES.find(s => s === payload.stage);
  if (!stage) return { error: "Invalid stage" };
  if (!canAddStage(access, stage)) {
    return { error: "Only an organization admin can record the final step" };
  }
  const sharedNote = payload.sharedNote.trim();
  if (!sharedNote) return { error: "What the member hears is required" };
  const reviewAt = payload.reviewAt
    ? new Date(`${payload.reviewAt}T00:00:00Z`)
    : null;
  if (reviewAt && Number.isNaN(reviewAt.getTime())) {
    return { error: "Invalid review date" };
  }
  return {
    error: null,
    step: {
      stage,
      sharedNote,
      internalNote: payload.internalNote?.trim() || null,
      reviewAt,
      consequence: payload.consequence?.trim() || null,
    },
  };
}

// A conversation id from the client only counts if it is about this subject
async function loadOwnConversation(ctx: Context, conversationId: string) {
  const result = await getConversation(conversationId, ctx.org.id);
  if (
    !result.success ||
    !result.data ||
    result.data.subjectUserId !== ctx.subject.id
  ) {
    return null;
  }
  return result.data;
}

async function notify(ctx: Context, step: CleanStep): Promise<void> {
  await notifyConversationSubject({
    subject: ctx.subject,
    orgName: ctx.org.name,
    stage: step.stage,
    reviewAt: step.reviewAt,
    hasConsequence: Boolean(step.consequence),
  });
  await notifyOrgAdminsOfEscalation({
    organizationId: ctx.org.id,
    orgName: ctx.org.name,
    orgSlug: ctx.orgSlug,
    memberName: personName(ctx.subject),
    memberSlug: ctx.memberSlug,
    subjectId: ctx.subject.id,
    ownerId: ctx.actor.id,
    ownerName: ctx.actor.name,
    stage: step.stage,
  });
}

function pagePath(ctx: Context): string {
  return `/org/${ctx.orgSlug}/people/${ctx.memberSlug}/conversations`;
}

export async function openConversationAction(
  orgSlug: string,
  memberSlug: string,
  input: { valueId: string | null; step: StepPayload },
): Promise<Result> {
  const authz = await authorize(orgSlug, memberSlug);
  if (authz.error !== null) return { success: false, error: authz.error };
  const { ctx } = authz;
  const parsed = parseStep(input.step, ctx.access);
  if (parsed.error !== null) return { success: false, error: parsed.error };

  const result = await createConversation({
    organizationId: ctx.org.id,
    subjectUserId: ctx.subject.id,
    openedById: ctx.actor.id,
    valueId: input.valueId || null,
    firstStep: parsed.step,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Could not open" };
  }

  await createAuditLog({
    organizationId: ctx.org.id,
    actorId: ctx.actor.id,
    action: "CONVERSATION_OPENED",
    resourceType: "conversation",
    resourceId: result.data.id,
    details: { subjectId: ctx.subject.id, stage: parsed.step.stage },
  });
  await notify(ctx, parsed.step);
  revalidatePath(pagePath(ctx));
  return { success: true };
}

export async function addStepAction(
  orgSlug: string,
  memberSlug: string,
  conversationId: string,
  payload: StepPayload,
): Promise<Result> {
  const authz = await authorize(orgSlug, memberSlug);
  if (authz.error !== null) return { success: false, error: authz.error };
  const { ctx } = authz;
  const parsed = parseStep(payload, ctx.access);
  if (parsed.error !== null) return { success: false, error: parsed.error };
  if (!(await loadOwnConversation(ctx, conversationId))) {
    return { success: false, error: "Conversation not found" };
  }

  const result = await addConversationStep(conversationId, ctx.org.id, {
    ...parsed.step,
    ownerId: ctx.actor.id,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Could not add step" };
  }

  await createAuditLog({
    organizationId: ctx.org.id,
    actorId: ctx.actor.id,
    action: "CONVERSATION_STEP_ADDED",
    resourceType: "conversation",
    resourceId: conversationId,
    details: { subjectId: ctx.subject.id, stage: parsed.step.stage },
  });
  await notify(ctx, parsed.step);
  revalidatePath(pagePath(ctx));
  return { success: true };
}

export async function attachEvidenceAction(
  orgSlug: string,
  memberSlug: string,
  conversationId: string,
  feedbackId: string,
): Promise<Result> {
  const authz = await authorize(orgSlug, memberSlug);
  if (authz.error !== null) return { success: false, error: authz.error };
  const { ctx } = authz;
  if (!/^\d{1,18}$/.test(feedbackId)) {
    return { success: false, error: "Feedback not found" };
  }
  if (!(await loadOwnConversation(ctx, conversationId))) {
    return { success: false, error: "Conversation not found" };
  }

  const result = await attachFeedbackToConversation(
    conversationId,
    ctx.org.id,
    BigInt(feedbackId),
  );
  if (!result.success) {
    return { success: false, error: result.error ?? "Could not attach" };
  }
  revalidatePath(pagePath(ctx));
  return { success: true };
}

export async function resolveConversationAction(
  orgSlug: string,
  memberSlug: string,
  conversationId: string,
): Promise<Result> {
  const authz = await authorize(orgSlug, memberSlug);
  if (authz.error !== null) return { success: false, error: authz.error };
  const { ctx } = authz;
  if (!(await loadOwnConversation(ctx, conversationId))) {
    return { success: false, error: "Conversation not found" };
  }

  const result = await resolveConversation(conversationId, ctx.org.id);
  if (!result.success) {
    return { success: false, error: result.error ?? "Could not resolve" };
  }

  await createAuditLog({
    organizationId: ctx.org.id,
    actorId: ctx.actor.id,
    action: "CONVERSATION_RESOLVED",
    resourceType: "conversation",
    resourceId: conversationId,
    details: { subjectId: ctx.subject.id },
  });
  revalidatePath(pagePath(ctx));
  return { success: true };
}
