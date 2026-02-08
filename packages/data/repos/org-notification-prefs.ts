import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data:org-notification-prefs");

/**
 * Get notification preferences for a specific org membership
 */
export async function getOrgMemberNotificationPrefs(memberId: string) {
  try {
    logger("getOrgMemberNotificationPrefs", { memberId });
    const prefs = await db.orgMemberNotificationPrefs.findUnique({
      where: { memberId },
    });
    return handleSuccess(prefs);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get notification preferences by userId and orgId
 */
export async function getOrgNotificationPrefsByUserAndOrg(
  userId: string,
  organizationId: string,
) {
  try {
    logger("getOrgNotificationPrefsByUserAndOrg", { userId, organizationId });
    const member = await db.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { notificationPreferences: true },
    });
    return handleSuccess(member?.notificationPreferences ?? null);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Upsert notification preferences for an org membership
 */
export async function upsertOrgMemberNotificationPrefs(
  memberId: string,
  data: {
    emailNotifications?: boolean;
    feedbackAlerts?: boolean;
    weeklyDigest?: boolean;
    mentionNotifications?: boolean;
  },
) {
  try {
    logger("upsertOrgMemberNotificationPrefs", { memberId, data });
    const prefs = await db.orgMemberNotificationPrefs.upsert({
      where: { memberId },
      create: {
        memberId,
        ...data,
      },
      update: data,
    });
    return handleSuccess(prefs);
  } catch (e) {
    return handleError(e);
  }
}
