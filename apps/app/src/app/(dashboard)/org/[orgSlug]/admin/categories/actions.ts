"use server";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

/**
 * Create a new feedback category
 */
export async function createCategoryAction(
  orgSlug: string,
  data: Omit<CreateCategoryInput, "organizationId">,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await createCategory({ ...data, organizationId: org.id });
    if (!result.success) return fail(result.error, "Failed to create category");

    revalidatePath(`/org/${orgSlug}/admin/categories`);
    return ok();
  });
}

/**
 * Update an existing feedback category
 */
export async function updateCategoryAction(
  orgSlug: string,
  categoryId: string,
  data: UpdateCategoryInput,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await updateCategory(categoryId, org.id, data);
    if (!result.success) return fail(result.error, "Failed to update category");

    revalidatePath(`/org/${orgSlug}/admin/categories`);
    return ok();
  });
}

/**
 * Delete a feedback category
 */
export async function deleteCategoryAction(
  orgSlug: string,
  categoryId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await deleteCategory(categoryId, org.id);
    if (!result.success) return fail(result.error, "Failed to delete category");

    revalidatePath(`/org/${orgSlug}/admin/categories`);
    return ok();
  });
}
