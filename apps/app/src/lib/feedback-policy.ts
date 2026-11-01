import {
  getOrganizationSettings,
  getUserOrganizationMembership,
  hasOtherOrgAdmin,
} from "@propsto/data/repos";

export interface FeedbackPolicy {
  enabled: boolean; // enableOrganizationFeedback
  allowAnonymous: boolean; // allowAnonymousFeedback (always true for personal links)
  membersOnly: boolean; // !allowExternalFeedback
  isMember: boolean;
  moderated: boolean; // held PENDING_MODERATION until an org admin approves
}

// What an org's settings allow on one of its links. Personal links have no policy.
// Defaults mirror the schema: feedback on, anonymous off, external off.
// Entity links are public by design: see the entity branch below.
export async function getFeedbackPolicy(
  link: {
    organizationId: string | null;
    userId: string | null;
    entityId?: string | null;
  },
  userId?: string,
): Promise<FeedbackPolicy> {
  if (!link.organizationId) {
    return {
      enabled: true,
      allowAnonymous: true,
      membersOnly: false,
      isMember: false,
      moderated: false,
    };
  }
  const settings = await getOrganizationSettings(link.organizationId);
  const feedback = settings.data?.feedbackSettings;
  const members = settings.data?.defaultUserSettings;
  const membership = userId
    ? await getUserOrganizationMembership({
        userId,
        organizationId: link.organizationId,
      })
    : null;
  const isMember = Boolean(membership?.data);
  const enabled = feedback?.enableOrganizationFeedback ?? true;
  // Entity links (feedback on a product, event, service) take anyone: signed in
  // or not, named or anonymous, whatever the member settings say. Outsiders'
  // submissions always wait for an admin; there is no recipient to exempt.
  if (link.entityId) {
    return {
      enabled,
      allowAnonymous: true,
      membersOnly: false,
      isMember,
      moderated: needsModeration(feedback, isMember),
    };
  }
  // Nobody moderates feedback about themselves, so with no other OWNER/ADMIN
  // (e.g. a new org's sole owner) holding it would strand it: approve instead
  const moderated =
    needsModeration(feedback, isMember) &&
    (!link.userId ||
      (await hasOtherOrgAdmin(link.organizationId, link.userId)).data !==
        false);
  return {
    enabled,
    allowAnonymous: feedback?.allowAnonymousFeedback ?? false,
    membersOnly: !(members?.allowExternalFeedback ?? false),
    isMember,
    moderated,
  };
}

// External feedback always waits for an admin. Member feedback waits only when
// moderation is on and autoApproveInternalFeedback is off: with moderation on,
// auto-approve is what lets colleagues' props through without an admin.
export function needsModeration(
  settings:
    | {
        enableFeedbackModeration?: boolean | null;
        autoApproveInternalFeedback?: boolean | null;
      }
    | null
    | undefined,
  isMember: boolean,
): boolean {
  if (!isMember) return true;
  if (!(settings?.enableFeedbackModeration ?? true)) return false;
  return !(settings?.autoApproveInternalFeedback ?? true);
}

// The reason a submission is refused, or null when it may proceed.
export function feedbackRefusal(
  policy: FeedbackPolicy,
  isAnonymous: boolean,
): string | null {
  if (!policy.enabled) return "Feedback is disabled for this organization";
  if (policy.membersOnly && !policy.isMember)
    return "Only members of this organization can give feedback here";
  if (isAnonymous && !policy.allowAnonymous)
    return "Anonymous feedback is not allowed for this organization";
  return null;
}

// The recipient's level expectations are internal: only for a person's own org
// link (not a group or entity link) and only when the viewer is a member of that org
export function showsRecipientLevel(
  link: {
    organizationId: string | null;
    groupId: string | null;
    entityId?: string | null;
  },
  policy: Pick<FeedbackPolicy, "isMember">,
): boolean {
  return (
    Boolean(link.organizationId) &&
    !link.groupId &&
    !link.entityId &&
    policy.isMember
  );
}
