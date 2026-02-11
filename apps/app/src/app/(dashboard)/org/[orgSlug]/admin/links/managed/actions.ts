"use server";

import { auth } from "@/server/auth.server";
import {
  createManagedFeedbackLink,
  updateManagedFeedbackLink,
  deleteManagedFeedbackLink,
  verifyOrgAdminAccess,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import type { FeedbackVisibility, FeedbackType } from "@prisma/client";

interface CreateManagedLinkInput {
  organizationId: string;
  orgSlug: string;
  templateId: string;
  name: string;
  slug?: string;
  visibility?: FeedbackVisibility;
  feedbackType?: FeedbackType;
}

export async function createManagedLinkAction(
  input: CreateManagedLinkInput,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is org admin
  const adminCheck = await verifyOrgAdminAccess(session.user.id, input.orgSlug);
  if (!adminCheck.success || !adminCheck.data) {
    return { success: false, error: "Only admins can create managed links" };
  }

  const result = await createManagedFeedbackLink({
    organizationId: input.organizationId,
    managedByUserId: session.user.id,
    templateId: input.templateId,
    name: input.name,
    slug: input.slug,
    visibility: input.visibility,
    feedbackType: input.feedbackType,
  });

  if (!result.success) {
    return { success: false, error: "Failed to create managed link" };
  }

  revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
  return { success: true };
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
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is org admin
  const adminCheck = await verifyOrgAdminAccess(session.user.id, input.orgSlug);
  if (!adminCheck.success || !adminCheck.data) {
    return { success: false, error: "Only admins can update managed links" };
  }

  const result = await updateManagedFeedbackLink(input.linkId, {
    name: input.name,
    templateId: input.templateId,
    isActive: input.isActive,
    visibility: input.visibility,
    feedbackType: input.feedbackType,
  });

  if (!result.success) {
    return { success: false, error: "Failed to update managed link" };
  }

  revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
  return { success: true };
}

interface DeleteManagedLinkInput {
  linkId: string;
  orgSlug: string;
}

export async function deleteManagedLinkAction(
  input: DeleteManagedLinkInput,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user is org admin
  const adminCheck = await verifyOrgAdminAccess(session.user.id, input.orgSlug);
  if (!adminCheck.success || !adminCheck.data) {
    return { success: false, error: "Only admins can delete managed links" };
  }

  const result = await deleteManagedFeedbackLink(input.linkId);

  if (!result.success) {
    return { success: false, error: "Failed to delete managed link" };
  }

  revalidatePath(`/org/${input.orgSlug}/admin/links/managed`);
  return { success: true };
}
