"use server";

import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlug,
  upsertOrganizationDefaultSettings,
  upsertOrganizationFeedbackSettings,
  upsertOrganizationSettings,
  auditHelpers,
  verifyOrgAdminAccess,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@propsto/logger";

const logger = createLogger("app:org-settings");

const updateMemberSettingsSchema = z.object({
  orgSlug: z.string(),
  defaultProfileVisibility: z.enum(["PUBLIC", "PRIVATE", "ORGANIZATION"]),
  allowExternalFeedback: z.boolean(),
  requireApprovalForPublicProfiles: z.boolean(),
});

export type UpdateMemberSettingsInput = z.infer<
  typeof updateMemberSettingsSchema
>;

export async function updateMemberSettings(
  rawInput: UpdateMemberSettingsInput,
): Promise<{ success: boolean; error?: string }> {
  // Server actions take whatever the client sends; refuse it before any DB call
  const parsed = updateMemberSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Invalid settings" };
  }
  const input = parsed.data;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify against the DB, not the JWT, so a demoted admin loses access immediately
    const membership = await verifyOrgAdminAccess(
      session.user.id,
      input.orgSlug,
    );
    if (!membership.success || !membership.data) {
      return { success: false, error: "Not authorized" };
    }

    // Get organization with current settings
    const orgResult = await getOrganizationBySlug(input.orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return { success: false, error: "Organization not found" };
    }
    const org = orgResult.data;
    const currentSettings = org.defaultUserSettings;

    // The repo returns failures instead of throwing; don't audit or report success
    const saved = await upsertOrganizationDefaultSettings(org.id, {
      defaultProfileVisibility: input.defaultProfileVisibility,
      allowExternalFeedback: input.allowExternalFeedback,
      requireApprovalForPublicProfiles: input.requireApprovalForPublicProfiles,
    });
    if (!saved.success) {
      logger("Failed to save member settings:", saved.error);
      return {
        success: false,
        error: saved.error ?? "Failed to update settings",
      };
    }

    // Log the audit event
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    if (
      currentSettings?.defaultProfileVisibility !==
      input.defaultProfileVisibility
    ) {
      changes.defaultProfileVisibility = {
        old: currentSettings?.defaultProfileVisibility ?? "none",
        new: input.defaultProfileVisibility,
      };
    }
    if (
      currentSettings?.allowExternalFeedback !== input.allowExternalFeedback
    ) {
      changes.allowExternalFeedback = {
        old: currentSettings?.allowExternalFeedback ?? false,
        new: input.allowExternalFeedback,
      };
    }
    if (
      currentSettings?.requireApprovalForPublicProfiles !==
      input.requireApprovalForPublicProfiles
    ) {
      changes.requireApprovalForPublicProfiles = {
        old: currentSettings?.requireApprovalForPublicProfiles ?? true,
        new: input.requireApprovalForPublicProfiles,
      };
    }

    if (Object.keys(changes).length > 0) {
      await auditHelpers.logSettingsUpdate(
        org.id,
        session.user.id,
        "member_defaults",
        changes,
      );
    }

    revalidatePath(`/org/${input.orgSlug}/admin/settings`);
    return { success: true };
  } catch (error) {
    logger("Failed to update member settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

const updateMembershipSettingsSchema = z.object({
  orgSlug: z.string(),
  // Each switch is sent only when it changed, so a stale page does not
  // overwrite the other one with what it loaded
  autoJoinByDomain: z.boolean().optional(),
  enableConversations: z.boolean().optional(),
});

export type UpdateMembershipSettingsInput = z.infer<
  typeof updateMembershipSettingsSchema
>;

export async function updateMembershipSettings(
  rawInput: UpdateMembershipSettingsInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = updateMembershipSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Invalid settings" };
  }
  const input = parsed.data;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify against the DB, not the JWT, so a demoted admin loses access immediately
    const membership = await verifyOrgAdminAccess(
      session.user.id,
      input.orgSlug,
    );
    if (!membership.success || !membership.data) {
      return { success: false, error: "Not authorized" };
    }

    const orgResult = await getOrganizationBySlug(input.orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return { success: false, error: "Organization not found" };
    }
    const org = orgResult.data;
    const current = org.organizationSettings;

    const autoJoinByDomain =
      input.autoJoinByDomain ?? current?.autoJoinByDomain ?? false;
    const enableConversations =
      input.enableConversations ?? current?.enableConversations ?? true;

    // Preserve the other general settings; only domain join and conversations are editable here
    const saved = await upsertOrganizationSettings(org.id, {
      allowUserInvites: current?.allowUserInvites ?? true,
      autoJoinByDomain,
      enableConversations,
      enableGroupManagement: current?.enableGroupManagement ?? true,
      requireEmailVerification: current?.requireEmailVerification ?? true,
      enableSSOIntegration: current?.enableSSOIntegration ?? false,
    });
    // The repo returns failures instead of throwing; don't audit or report success
    if (!saved.success) {
      return { success: false, error: "Failed to update settings" };
    }

    const changes: Record<string, { old: boolean; new: boolean }> = {};
    if ((current?.autoJoinByDomain ?? false) !== autoJoinByDomain) {
      changes.autoJoinByDomain = {
        old: current?.autoJoinByDomain ?? false,
        new: autoJoinByDomain,
      };
    }
    if ((current?.enableConversations ?? true) !== enableConversations) {
      changes.enableConversations = {
        old: current?.enableConversations ?? true,
        new: enableConversations,
      };
    }
    if (Object.keys(changes).length > 0) {
      await auditHelpers.logSettingsUpdate(
        org.id,
        session.user.id,
        "membership_settings",
        changes,
      );
    }

    revalidatePath(`/org/${input.orgSlug}/admin/settings`);
    // The conversations switch changes the member pages and the sidebar
    revalidatePath(`/org/${input.orgSlug}`, "layout");
    return { success: true };
  } catch (error) {
    logger("Failed to update membership settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

const updateFeedbackSettingsSchema = z.object({
  allowAnonymousFeedback: z.boolean(),
  enableFeedbackModeration: z.boolean(),
  autoApproveInternalFeedback: z.boolean(),
  allowMemberFormCreation: z.boolean(),
});

export type UpdateFeedbackSettingsInput = z.infer<
  typeof updateFeedbackSettingsSchema
>;

export async function updateFeedbackSettingsAction(
  orgSlug: string,
  rawInput: UpdateFeedbackSettingsInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = updateFeedbackSettingsSchema.safeParse(rawInput);
  if (typeof orgSlug !== "string" || !parsed.success) {
    return { success: false, error: "Invalid settings" };
  }
  const input = parsed.data;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify against the DB, not the JWT, so a demoted admin loses access immediately
    const membership = await verifyOrgAdminAccess(session.user.id, orgSlug);
    if (!membership.success || !membership.data) {
      return { success: false, error: "Not authorized" };
    }

    // Get organization with current settings
    const orgResult = await getOrganizationBySlug(orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return { success: false, error: "Organization not found" };
    }
    const org = orgResult.data;
    const currentSettings = org.feedbackSettings;

    // The repo returns failures instead of throwing; don't audit or report success
    const saved = await upsertOrganizationFeedbackSettings(org.id, {
      enableOrganizationFeedback:
        currentSettings?.enableOrganizationFeedback ?? true,
      allowAnonymousFeedback: input.allowAnonymousFeedback,
      enableFeedbackModeration: input.enableFeedbackModeration,
      autoApproveInternalFeedback: input.autoApproveInternalFeedback,
      allowMemberFormCreation: input.allowMemberFormCreation,
      defaultTemplateId: currentSettings?.defaultTemplateId ?? null,
    });
    if (!saved.success) {
      logger("Failed to save feedback settings:", saved.error);
      return {
        success: false,
        error: saved.error ?? "Failed to update settings",
      };
    }

    // Log the audit event
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    if (
      currentSettings?.allowAnonymousFeedback !== input.allowAnonymousFeedback
    ) {
      changes.allowAnonymousFeedback = {
        old: currentSettings?.allowAnonymousFeedback ?? false,
        new: input.allowAnonymousFeedback,
      };
    }
    if (
      currentSettings?.enableFeedbackModeration !==
      input.enableFeedbackModeration
    ) {
      changes.enableFeedbackModeration = {
        old: currentSettings?.enableFeedbackModeration ?? true,
        new: input.enableFeedbackModeration,
      };
    }
    if (
      currentSettings?.autoApproveInternalFeedback !==
      input.autoApproveInternalFeedback
    ) {
      changes.autoApproveInternalFeedback = {
        old: currentSettings?.autoApproveInternalFeedback ?? true,
        new: input.autoApproveInternalFeedback,
      };
    }
    if (
      currentSettings?.allowMemberFormCreation !== input.allowMemberFormCreation
    ) {
      changes.allowMemberFormCreation = {
        old: currentSettings?.allowMemberFormCreation ?? true,
        new: input.allowMemberFormCreation,
      };
    }

    if (Object.keys(changes).length > 0) {
      await auditHelpers.logSettingsUpdate(
        org.id,
        session.user.id,
        "feedback_settings",
        changes,
      );
    }

    revalidatePath(`/org/${orgSlug}/admin/settings`);
    return { success: true };
  } catch (error) {
    logger("Failed to update feedback settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
