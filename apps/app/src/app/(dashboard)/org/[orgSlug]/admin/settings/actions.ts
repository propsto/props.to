"use server";

import { auth } from "@/server/auth.server";
import {
  getOrganizationBySlug,
  upsertOrganizationDefaultSettings,
  auditHelpers,
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
  input: UpdateMemberSettingsInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify user is admin of this org
    const membership = session.user.organizations?.find(
      org => org.organizationSlug === input.orgSlug,
    );

    if (
      !membership ||
      (membership.role !== "OWNER" && membership.role !== "ADMIN")
    ) {
      return { success: false, error: "Not authorized" };
    }

    // Get organization with current settings
    const orgResult = await getOrganizationBySlug(input.orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return { success: false, error: "Organization not found" };
    }
    const org = orgResult.data;
    const currentSettings = org.defaultUserSettings;

    // Upsert the settings
    await upsertOrganizationDefaultSettings(org.id, {
      defaultProfileVisibility: input.defaultProfileVisibility,
      allowExternalFeedback: input.allowExternalFeedback,
      requireApprovalForPublicProfiles: input.requireApprovalForPublicProfiles,
    });

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
