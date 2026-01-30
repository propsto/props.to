"use server";

import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isReservedSlug } from "@propsto/constants/other";

const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(30, "Slug must be at most 30 characters")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .refine((s) => !s.startsWith("-") && !s.endsWith("-"), "Slug cannot start or end with a hyphen");

export async function checkSlugAvailability(
  slug: string
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
    const existing = await db.slug.findFirst({
      where: {
        slug: slug.toLowerCase(),
        scope: "GLOBAL",
      },
    });

    if (existing) {
      return { available: false, error: "This URL is already taken" };
    }

    return { available: true };
  } catch (error) {
    console.error("Failed to check slug availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

export async function updateOrgSlug(
  currentSlug: string,
  newSlug: string
): Promise<{ success: boolean; error?: string; newSlug?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify user is OWNER of this org (only owners can change slug)
    const membership = session.user.organizations?.find(
      (org) => org.organizationSlug === currentSlug
    );

    if (!membership || membership.role !== "OWNER") {
      return { success: false, error: "Only organization owners can change the URL" };
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

    // Check availability
    const existing = await db.slug.findFirst({
      where: {
        slug: normalizedSlug,
        scope: "GLOBAL",
        NOT: {
          organization: {
            slug: {
              slug: currentSlug,
            },
          },
        },
      },
    });

    if (existing) {
      return { success: false, error: "This URL is already taken" };
    }

    // Get the organization
    const org = await db.organization.findFirst({
      where: {
        slug: {
          slug: currentSlug,
        },
      },
      include: { slug: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Update the slug
    await db.slug.update({
      where: { id: org.slug.id },
      data: { slug: normalizedSlug },
    });

    // Revalidate old and new paths
    revalidatePath(`/org/${currentSlug}/admin/settings`);
    
    return { success: true, newSlug: normalizedSlug };
  } catch (error) {
    console.error("Failed to update org slug:", error);
    return { success: false, error: "Failed to update URL" };
  }
}
