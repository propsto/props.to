import {
  getOrganizationSettings,
  getUserOrganizationMembership,
} from "@propsto/data/repos";

export interface FeedbackPolicy {
  enabled: boolean; // enableOrganizationFeedback
  allowAnonymous: boolean; // allowAnonymousFeedback (always true for personal links)
  membersOnly: boolean; // !allowExternalFeedback
  isMember: boolean;
}

// What an org's settings allow on one of its links. Personal links have no policy.
// Defaults mirror the schema: feedback on, anonymous off, external off.
export async function getFeedbackPolicy(
  link: { organizationId: string | null },
  userId?: string,
): Promise<FeedbackPolicy> {
  if (!link.organizationId) {
    return {
      enabled: true,
      allowAnonymous: true,
      membersOnly: false,
      isMember: false,
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
  return {
    enabled: feedback?.enableOrganizationFeedback ?? true,
    allowAnonymous: feedback?.allowAnonymousFeedback ?? false,
    membersOnly: !(members?.allowExternalFeedback ?? false),
    isMember: Boolean(membership?.data),
  };
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
