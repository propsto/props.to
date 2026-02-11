"use server";

import { auth } from "@/server/auth.server";
import {
  isSlugAvailable,
  isSlugAvailableExcludingOrg,
  updateOrganizationSlug,
  auditHelpers,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isReservedSlug } from "@propsto/constants/other";
import { createLogger } from "@propsto/logger";

const logger = createLogger("app:org-settings");

const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(30, "Slug must be at most 30 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  )
  .refine(
    s => !s.startsWith("-") && !s.endsWith("-"),
    "Slug cannot start or end with a hyphen",
  );

export async function checkSlugAvailability(
  slug: string,
): Promise<{ available: boolean; error?: string }> {
  try {
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      return { available: false, error: parsed.error.errors[0]?.message };
    }

    // Check reserved slugs
    if (isReservedSlug(slug)) {
      return { available: false, error: "This URL is reserved" };
    }

    // Check if slug exists (globally scoped)
    const availableResult = await isSlugAvailable(slug, "GLOBAL");
    if (!availableResult.success) {
      return { available: false, error: "Failed to check availability" };
    }

    if (!availableResult.data) {
      return { available: false, error: "This URL is already taken" };
    }

    return { available: true };
  } catch (error) {
    logger("Failed to check slug availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

export async function updateOrgSlug(
  currentSlug: string,
  newSlug: string,
): Promise<{ success: boolean; error?: string; newSlug?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify user is OWNER of this org (only owners can change slug)
    const membership = session.user.organizations?.find(
      org => org.organizationSlug === currentSlug,
    );

    if (!membership || membership.role !== "OWNER") {
      return {
        success: false,
        error: "Only organization owners can change the URL",
      };
    }

    // Validate new slug
    const parsed = slugSchema.safeParse(newSlug);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const normalizedSlug = newSlug.toLowerCase();

    // Check reserved
    if (isReservedSlug(normalizedSlug)) {
      return { success: false, error: "This URL is reserved" };
    }

    // Check availability (excluding current org's slug)
    const availableResult = await isSlugAvailableExcludingOrg(
      normalizedSlug,
      currentSlug,
    );
    if (!availableResult.success) {
      return { success: false, error: "Failed to check availability" };
    }
    if (!availableResult.data) {
      return { success: false, error: "This URL is already taken" };
    }

    // Update the slug
    const updateResult = await updateOrganizationSlug(
      currentSlug,
      normalizedSlug,
    );
    if (!updateResult.success || !updateResult.data) {
      return { success: false, error: "Organization not found" };
    }

    // Log the audit event
    await auditHelpers.logOrgUrlChange(
      updateResult.data.organizationId,
      session.user.id,
      currentSlug,
      normalizedSlug,
    );

    // Revalidate old and new paths
    revalidatePath(`/org/${currentSlug}`, "layout");
    revalidatePath(`/org/${normalizedSlug}`, "layout");

    return { success: true, newSlug: normalizedSlug };
  } catch (error) {
    logger("Failed to update org slug:", error);
    return { success: false, error: "Failed to update URL" };
  }
}
