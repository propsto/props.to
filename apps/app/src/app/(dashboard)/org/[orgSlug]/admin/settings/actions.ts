"use server";

import {
  upsertOrganizationDefaultSettings,
  upsertOrganizationFeedbackSettings,
  updateOrganizationSettingsSwitches,
  auditHelpers,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@propsto/logger";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

const logger = createLogger("app:org-settings");

const updateMemberSettingsSchema = z.object({
  orgSlug: z.string(),
  allowExternalFeedback: z.boolean(),
});

export type UpdateMemberSettingsInput = z.infer<
  typeof updateMemberSettingsSchema
>;

export async function updateMemberSettings(
  rawInput: UpdateMemberSettingsInput,
): Promise<ActionResult> {
  // Server actions take whatever the client sends; refuse it before any DB call
  const parsed = updateMemberSettingsSchema.safeParse(rawInput);
  if (!parsed.success) return fail("Invalid settings");
  const input = parsed.data;

  try {
    // The membership is checked against the DB, not the JWT, so a demoted admin loses access immediately
    return await withOrgAdmin(input.orgSlug, async ({ userId, org }) => {
      const currentSettings = org.defaultUserSettings;

      // The repo returns failures instead of throwing; don't audit or report success
      const saved = await upsertOrganizationDefaultSettings(org.id, {
        allowExternalFeedback: input.allowExternalFeedback,
      });
      if (!saved.success) {
        logger("Failed to save member settings:", saved.error);
        return fail(saved.error, "Failed to update settings");
      }

      // Log the audit event
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      if (
        currentSettings?.allowExternalFeedback !== input.allowExternalFeedback
      ) {
        changes.allowExternalFeedback = {
          old: currentSettings?.allowExternalFeedback ?? false,
          new: input.allowExternalFeedback,
        };
      }

      if (Object.keys(changes).length > 0) {
        await auditHelpers.logSettingsUpdate(
          org.id,
          userId,
          "member_defaults",
          changes,
        );
      }

      revalidatePath(`/org/${input.orgSlug}/admin/settings`);
      return ok();
    });
  } catch (error) {
    logger("Failed to update member settings:", error);
    return fail("Failed to update settings");
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
): Promise<ActionResult> {
  const parsed = updateMembershipSettingsSchema.safeParse(rawInput);
  if (!parsed.success) return fail("Invalid settings");
  const input = parsed.data;

  try {
    return await withOrgAdmin(input.orgSlug, async ({ userId, org }) => {
      const current = org.organizationSettings;

      // Only the switches the form sent; every other column stays as stored
      const saved = await updateOrganizationSettingsSwitches(org.id, {
        autoJoinByDomain: input.autoJoinByDomain,
        enableConversations: input.enableConversations,
      });
      // The repo returns failures instead of throwing; don't audit or report success
      if (!saved.success) return fail("Failed to update settings");

      const changes: Record<string, { old: boolean; new: boolean }> = {};
      if (
        input.autoJoinByDomain !== undefined &&
        (current?.autoJoinByDomain ?? false) !== input.autoJoinByDomain
      ) {
        changes.autoJoinByDomain = {
          old: current?.autoJoinByDomain ?? false,
          new: input.autoJoinByDomain,
        };
      }
      if (
        input.enableConversations !== undefined &&
        (current?.enableConversations ?? true) !== input.enableConversations
      ) {
        changes.enableConversations = {
          old: current?.enableConversations ?? true,
          new: input.enableConversations,
        };
      }
      if (Object.keys(changes).length > 0) {
        await auditHelpers.logSettingsUpdate(
          org.id,
          userId,
          "membership_settings",
          changes,
        );
      }

      revalidatePath(`/org/${input.orgSlug}/admin/settings`);
      // The conversations switch changes the member pages and the sidebar
      revalidatePath(`/org/${input.orgSlug}`, "layout");
      return ok();
    });
  } catch (error) {
    logger("Failed to update membership settings:", error);
    return fail("Failed to update settings");
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
): Promise<ActionResult> {
  const parsed = updateFeedbackSettingsSchema.safeParse(rawInput);
  if (typeof orgSlug !== "string" || !parsed.success) {
    return fail("Invalid settings");
  }
  const input = parsed.data;

  try {
    return await withOrgAdmin(orgSlug, async ({ userId, org }) => {
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
        return fail(saved.error, "Failed to update settings");
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
        currentSettings?.allowMemberFormCreation !==
        input.allowMemberFormCreation
      ) {
        changes.allowMemberFormCreation = {
          old: currentSettings?.allowMemberFormCreation ?? true,
          new: input.allowMemberFormCreation,
        };
      }

      if (Object.keys(changes).length > 0) {
        await auditHelpers.logSettingsUpdate(
          org.id,
          userId,
          "feedback_settings",
          changes,
        );
      }

      revalidatePath(`/org/${orgSlug}/admin/settings`);
      return ok();
    });
  } catch (error) {
    logger("Failed to update feedback settings:", error);
    return fail("Failed to update settings");
  }
}
