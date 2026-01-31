"use server";

import { auth } from "@/server/auth.server";
import { db } from "@propsto/data";
import {
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

  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: {
          slug: orgSlug,
        },
      },
      role: { in: ["OWNER", "ADMIN"] },
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    return { error: "Not authorized", orgId: null };
  }

  return { error: null, orgId: membership.organization.id };
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
export async function deleteCategoryAction(orgSlug: string, categoryId: string) {
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
