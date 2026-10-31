import type { ConversationStage, OrganizationRole } from "@prisma/client";
import {
  getConversationViewerContext,
  type ConversationViewerContext,
} from "@propsto/data/repos";

export type ConversationAccess = {
  // Viewer is the person the conversation is about
  isSubject: boolean;
  // Stage, shared note, review date, consequence
  canRead: boolean;
  // Internal notes
  canReadInternal: boolean;
  // Open conversations, add steps, attach evidence, resolve
  canWrite: boolean;
  // Only org admins may escalate to the final stage
  canCreateFinal: boolean;
};

const NONE: ConversationAccess = {
  isSubject: false,
  canRead: false,
  canReadInternal: false,
  canWrite: false,
  canCreateFinal: false,
};

function isOrgAdmin(role: OrganizationRole | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Who may do what with conversations about a member.
 *
 * - The subject reads shared fields only, and never writes, even when they are
 *   also an org admin or a lead elsewhere.
 * - A lead (group admin of any group the subject is in) and org admins read
 *   everything and write.
 * - Only org admins may create a FINAL step.
 * - Anyone else, including non-members and other members, gets nothing.
 */
export function resolveConversationAccess(
  viewerId: string,
  subjectUserId: string,
  context: ConversationViewerContext,
): ConversationAccess {
  if (!context.orgRole) return NONE;

  if (viewerId === subjectUserId) {
    return { ...NONE, isSubject: true, canRead: true };
  }

  const admin = isOrgAdmin(context.orgRole);
  if (!admin && !context.leadsSubject) return NONE;

  return {
    isSubject: false,
    canRead: true,
    canReadInternal: true,
    canWrite: true,
    canCreateFinal: admin,
  };
}

/**
 * Load the viewer's context and resolve their access to conversations about a
 * member. Fails closed: a lookup error grants nothing.
 */
export async function getConversationAccess(
  viewerId: string,
  organizationId: string,
  subjectUserId: string,
): Promise<ConversationAccess> {
  const result = await getConversationViewerContext(
    viewerId,
    organizationId,
    subjectUserId,
  );
  if (!result.success || !result.data) return NONE;
  return resolveConversationAccess(viewerId, subjectUserId, result.data);
}

export function canAddStage(
  access: ConversationAccess,
  stage: ConversationStage,
): boolean {
  if (!access.canWrite) return false;
  return stage !== "FINAL" || access.canCreateFinal;
}

/**
 * Strip what the viewer may not see. Returns null when they may not read the
 * conversation at all. Internal notes are removed unless the viewer may read them.
 */
export function redactConversation<
  T extends { steps: { internalNote: string | null }[] },
>(conversation: T, access: ConversationAccess): T | null {
  if (!access.canRead) return null;
  if (access.canReadInternal) return conversation;
  return {
    ...conversation,
    steps: conversation.steps.map(step => ({ ...step, internalNote: null })),
  };
}
