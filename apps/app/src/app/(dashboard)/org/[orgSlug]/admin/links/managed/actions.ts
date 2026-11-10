"use server";

import {
  createManagedFeedbackLink,
  updateManagedFeedbackLink,
  deleteManagedFeedbackLink,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import { cleanLinkInput } from "@/lib/link-input";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";
import type { FeedbackVisibility, FeedbackType } from "@prisma/client";

interface CreateManagedLinkInput {
  orgSlug: string;
  templateId: string;
  name: string;
  slug?: string;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
}

export async function createManagedLinkAction(
  input: CreateManagedLinkInput,
): Promise<ActionResult> {
  return withOrgAdmin(input.orgSlug, async ({ userId, org }) => {
    const cleaned = cleanLinkInput({ name: input.name, slug: input.slug });
    if (!cleaned.success) return fail(cleaned.error);

    const result = await createManagedFeedbackLink({
      organizationId: org.id,
      managedByUserId: userId,
      templateId: input.templateId,
      name: cleaned.name!,
      slug: cleaned.slug,
      visibility: input.visibility,
      feedbackType: input.feedbackType,
    });
    if (!result.success) return fail("Failed to create managed link");

    revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
    return ok();
  });
}

interface UpdateManagedLinkInput {
  linkId: string;
  orgSlug: string;
  name?: string;
  templateId?: string;
  isActive?: boolean;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
}

export async function updateManagedLinkAction(
  input: UpdateManagedLinkInput,
): Promise<ActionResult> {
  return withOrgAdmin(input.orgSlug, async ({ org }) => {
    const result = await updateManagedFeedbackLink(input.linkId, org.id, {
      name: input.name,
      templateId: input.templateId,
      isActive: input.isActive,
      visibility: input.visibility,
      feedbackType: input.feedbackType,
    });
    if (!result.success) return fail("Failed to update managed link");

    revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
    return ok();
  });
}

interface DeleteManagedLinkInput {
  linkId: string;
  orgSlug: string;
}

export async function deleteManagedLinkAction(
  input: DeleteManagedLinkInput,
): Promise<ActionResult> {
  return withOrgAdmin(input.orgSlug, async ({ org }) => {
    const result = await deleteManagedFeedbackLink(input.linkId, org.id);
    if (!result.success) return fail("Failed to delete managed link");

    revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
    return ok();
  });
}
