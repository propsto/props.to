import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Types for organization settings
export type OrganizationDefaultUserSettings = {
  defaultProfileVisibility: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
  allowExternalFeedback: boolean;
  requireApprovalForPublicProfiles: boolean;
};

export type OrganizationGeneralSettings = {
  allowUserInvites: boolean;
  enableGroupManagement: boolean;
  requireEmailVerification: boolean;
  enableSSOIntegration: boolean;
};

export type OrganizationFeedbackSettings = {
  enableOrganizationFeedback: boolean;
  allowAnonymousFeedback: boolean;
  enableFeedbackModeration: boolean;
  autoApproveInternalFeedback: boolean;
  allowMemberFormCreation: boolean;
  defaultTemplateId?: string | null;
};

// Create or update organization default user settings
export async function upsertOrganizationDefaultUserSettings(
  organizationId: string,
  settings: OrganizationDefaultUserSettings,
) {
  try {
    logger("upsertOrganizationDefaultUserSettings", {
      organizationId,
      settings,
    });

    const result = await db.organizationDefaultUserSettings.upsert({
      where: { organizationId },
      update: {
        defaultProfileVisibility: settings.defaultProfileVisibility,
        allowExternalFeedback: settings.allowExternalFeedback,
        requireApprovalForPublicProfiles:
          settings.requireApprovalForPublicProfiles,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        defaultProfileVisibility: settings.defaultProfileVisibility,
        allowExternalFeedback: settings.allowExternalFeedback,
        requireApprovalForPublicProfiles:
          settings.requireApprovalForPublicProfiles,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Create or update organization general settings
export async function upsertOrganizationSettings(
  organizationId: string,
  settings: OrganizationGeneralSettings,
) {
  try {
    logger("upsertOrganizationSettings", { organizationId, settings });

    const result = await db.organizationSettings.upsert({
      where: { organizationId },
      update: {
        allowUserInvites: settings.allowUserInvites,
        enableGroupManagement: settings.enableGroupManagement,
        requireEmailVerification: settings.requireEmailVerification,
        enableSSOIntegration: settings.enableSSOIntegration,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        allowUserInvites: settings.allowUserInvites,
        enableGroupManagement: settings.enableGroupManagement,
        requireEmailVerification: settings.requireEmailVerification,
        enableSSOIntegration: settings.enableSSOIntegration,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Create or update organization feedback settings
export async function upsertOrganizationFeedbackSettings(
  organizationId: string,
  settings: OrganizationFeedbackSettings,
) {
  try {
    logger("upsertOrganizationFeedbackSettings", { organizationId, settings });

    const result = await db.organizationFeedbackSettings.upsert({
      where: { organizationId },
      update: {
        enableOrganizationFeedback: settings.enableOrganizationFeedback,
        allowAnonymousFeedback: settings.allowAnonymousFeedback,
        enableFeedbackModeration: settings.enableFeedbackModeration,
        autoApproveInternalFeedback: settings.autoApproveInternalFeedback,
        allowMemberFormCreation: settings.allowMemberFormCreation,
        defaultTemplateId: settings.defaultTemplateId,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        enableOrganizationFeedback: settings.enableOrganizationFeedback,
        allowAnonymousFeedback: settings.allowAnonymousFeedback,
        enableFeedbackModeration: settings.enableFeedbackModeration,
        autoApproveInternalFeedback: settings.autoApproveInternalFeedback,
        allowMemberFormCreation: settings.allowMemberFormCreation,
        defaultTemplateId: settings.defaultTemplateId,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Set organization default template
export async function setOrganizationDefaultTemplate(
  organizationId: string,
  templateId: string | null,
) {
  try {
    logger("setOrganizationDefaultTemplate", { organizationId, templateId });

    // If setting a template (not unsetting), validate it belongs to this org
    if (templateId !== null) {
      const template = await db.feedbackTemplate.findFirst({
        where: {
          id: templateId,
          organizations: {
            some: {
              id: organizationId,
            },
          },
        },
      });

      if (!template) {
        throw new Error(
          "Template not found or does not belong to this organization",
        );
      }
    }

    const result = await db.organizationFeedbackSettings.upsert({
      where: { organizationId },
      update: {
        defaultTemplateId: templateId,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        defaultTemplateId: templateId,
      },
    });

    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization default template
export async function getOrganizationDefaultTemplate(organizationId: string) {
  try {
    logger("getOrganizationDefaultTemplate", { organizationId });

    const settings = await db.organizationFeedbackSettings.findUnique({
      where: { organizationId },
      include: {
        defaultTemplate: {
          include: {
            fields: true,
          },
        },
      },
    });

    return handleSuccess(settings?.defaultTemplate ?? null);
  } catch (e) {
    return handleError(e);
  }
}

// Get all organization settings
export async function getOrganizationSettings(organizationId: string) {
  try {
    logger("getOrganizationSettings", { organizationId });

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        slug: true,
        defaultUserSettings: true,
        organizationSettings: true,
        feedbackSettings: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return handleSuccess({
      organization,
      defaultUserSettings: organization.defaultUserSettings,
      organizationSettings: organization.organizationSettings,
      feedbackSettings: organization.feedbackSettings,
    });
  } catch (e) {
    return handleError(e);
  }
}

// Get organization default user settings
export async function getOrganizationDefaultUserSettings(
  organizationId: string,
) {
  try {
    logger("getOrganizationDefaultUserSettings", { organizationId });

    const settings = await db.organizationDefaultUserSettings.findUnique({
      where: { organizationId },
    });

    return handleSuccess(settings);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization general settings
export async function getOrganizationGeneralSettings(organizationId: string) {
  try {
    logger("getOrganizationGeneralSettings", { organizationId });

    const settings = await db.organizationSettings.findUnique({
      where: { organizationId },
    });

    return handleSuccess(settings);
  } catch (e) {
    return handleError(e);
  }
}

// Get organization feedback settings
export async function getOrganizationFeedbackSettingsData(
  organizationId: string,
) {
  try {
    logger("getOrganizationFeedbackSettingsData", { organizationId });

    const settings = await db.organizationFeedbackSettings.findUnique({
      where: { organizationId },
    });

    return handleSuccess(settings);
  } catch (e) {
    return handleError(e);
  }
}
