import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Types for user preferences
export type NotificationPreferences = {
  emailNotifications: boolean;
  feedbackAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
};

export type PrivacySettings = {
  profileVisibility: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
  allowFeedbackFromAnyone: boolean;
  showEmailInProfile: boolean;
};

export type AccountSettings = {
  accountType: "INDIVIDUAL" | "ORGANIZATION";
  organizationName?: string | null;
};

// Create or update notification preferences
export async function upsertNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
) {
  try {
    logger("upsertNotificationPreferences", { userId, preferences });

    const result = await db.userNotificationPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: preferences.emailNotifications,
        feedbackAlerts: preferences.feedbackAlerts,
        weeklyDigest: preferences.weeklyDigest,
        marketingEmails: preferences.marketingEmails,
        updatedAt: new Date(),
      },
      create: {
        userId,
        emailNotifications: preferences.emailNotifications,
        feedbackAlerts: preferences.feedbackAlerts,
        weeklyDigest: preferences.weeklyDigest,
        marketingEmails: preferences.marketingEmails,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Create or update privacy settings
export async function upsertPrivacySettings(
  userId: string,
  settings: PrivacySettings,
) {
  try {
    logger("upsertPrivacySettings", { userId, settings });

    const result = await db.userPrivacySettings.upsert({
      where: { userId },
      update: {
        profileVisibility: settings.profileVisibility,
        allowFeedbackFromAnyone: settings.allowFeedbackFromAnyone,
        showEmailInProfile: settings.showEmailInProfile,
        updatedAt: new Date(),
      },
      create: {
        userId,
        profileVisibility: settings.profileVisibility,
        allowFeedbackFromAnyone: settings.allowFeedbackFromAnyone,
        showEmailInProfile: settings.showEmailInProfile,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Create or update account settings
export async function upsertAccountSettings(
  userId: string,
  settings: AccountSettings,
) {
  try {
    logger("upsertAccountSettings", { userId, settings });

    const result = await db.userAccountSettings.upsert({
      where: { userId },
      update: {
        accountType: settings.accountType,
        organizationName: settings.organizationName,
        updatedAt: new Date(),
      },
      create: {
        userId,
        accountType: settings.accountType,
        organizationName: settings.organizationName,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Get all user preferences
export async function getUserPreferences(userId: string) {
  try {
    logger("getUserPreferences", { userId });

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
        privacySettings: true,
        accountSettings: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return handleSuccess({
      notificationPreferences: user.notificationPreferences,
      privacySettings: user.privacySettings,
      accountSettings: user.accountSettings,
    });
  } catch (e) {
    return handleError(e);
  }
}

// Get notification preferences
export async function getNotificationPreferences(userId: string) {
  try {
    logger("getNotificationPreferences", { userId });

    const preferences = await db.userNotificationPreferences.findUnique({
      where: { userId },
    });

    return handleSuccess(preferences);
  } catch (e) {
    return handleError(e);
  }
}

// Get privacy settings
export async function getPrivacySettings(userId: string) {
  try {
    logger("getPrivacySettings", { userId });

    const settings = await db.userPrivacySettings.findUnique({
      where: { userId },
    });

    return handleSuccess(settings);
  } catch (e) {
    return handleError(e);
  }
}

// Get account settings
export async function getAccountSettings(userId: string) {
  try {
    logger("getAccountSettings", { userId });

    const settings = await db.userAccountSettings.findUnique({
      where: { userId },
    });

    return handleSuccess(settings);
  } catch (e) {
    return handleError(e);
  }
}
