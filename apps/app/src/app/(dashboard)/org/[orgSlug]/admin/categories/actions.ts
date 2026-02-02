"use server";

import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";

/**
 * Verify user has admin access to the organization
 */
async function verifyAdminAccess(orgSlug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated", orgId: null };
  }

  const membershipResult = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membershipResult.success || !membershipResult.data) {
    return { error: "Not authorized", orgId: null };
  }

  return { error: null, orgId: membershipResult.data.organization.id };
}

/**
 * Create a new feedback category
 */
export async function createCategoryAction(
  orgSlug: string,
  data: Omit<CreateCategoryInput, "organizationId">,
) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await createCategory({
    ...data,
    organizationId: orgId,
  });

  if (result.success) {
    revalidatePath(`/org/${orgSlug}/admin/categories`);
  }

  return result;
}

/**
 * Update an existing feedback category
 */
export async function updateCategoryAction(
  orgSlug: string,
  categoryId: string,
  data: UpdateCategoryInput,
) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await updateCategory(categoryId, orgId, data);

  if (result.success) {
    revalidatePath(`/org/${orgSlug}/admin/categories`);
  }

  return result;
}

/**
 * Delete a feedback category
 */
export async function deleteCategoryAction(
  orgSlug: string,
  categoryId: string,
) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await deleteCategory(categoryId, orgId);

  if (result.success) {
    revalidatePath(`/org/${orgSlug}/admin/categories`);
  }

  return result;
}
