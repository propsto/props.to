import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Types for template categories
export type CreateCategoryInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  organizationId: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
};

/**
 * Get all categories for an organization (includes global categories)
 */
export async function getOrganizationCategories(organizationId: string) {
  try {
    logger("getOrganizationCategories", { organizationId });

    const categories = await db.templateCategory.findMany({
      where: {
        OR: [
          { organizationId }, // Org-specific categories
          { organizationId: null }, // Global categories
        ],
      },
      orderBy: [
        { organizationId: "desc" }, // Org categories first (non-null > null)
        { name: "asc" },
      ],
    });

    return handleSuccess(categories);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get only custom categories for an organization (excludes global)
 */
export async function getCustomCategories(organizationId: string) {
  try {
    logger("getCustomCategories", { organizationId });

    const categories = await db.templateCategory.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });

    return handleSuccess(categories);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get only global/system categories
 */
export async function getGlobalCategories() {
  try {
    logger("getGlobalCategories");

    const categories = await db.templateCategory.findMany({
      where: { organizationId: null },
      orderBy: { name: "asc" },
    });

    return handleSuccess(categories);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(categoryId: string) {
  try {
    logger("getCategoryById", { categoryId });

    const category = await db.templateCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { templates: true },
        },
      },
    });

    return handleSuccess(category);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Create a new organization-specific category
 */
export async function createCategory(input: CreateCategoryInput) {
  try {
    logger("createCategory", { input });

    // Check if category with same name already exists for this org
    const existing = await db.templateCategory.findFirst({
      where: {
        name: input.name,
        organizationId: input.organizationId,
      },
    });

    if (existing) {
      throw new Error("A category with this name already exists");
    }

    const category = await db.templateCategory.create({
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        organizationId: input.organizationId,
      },
    });

    return handleSuccess(category);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Update an existing category
 * Only allows updating org-specific categories (not global ones)
 */
export async function updateCategory(
  categoryId: string,
  organizationId: string,
  input: UpdateCategoryInput,
) {
  try {
    logger("updateCategory", { categoryId, organizationId, input });

    // Verify category belongs to this organization
    const existing = await db.templateCategory.findFirst({
      where: {
        id: categoryId,
        organizationId, // Must be org-specific
      },
    });

    if (!existing) {
      throw new Error("Category not found or cannot be modified");
    }

    // If name is being changed, check for duplicates
    if (input.name && input.name !== existing.name) {
      const duplicate = await db.templateCategory.findFirst({
        where: {
          name: input.name,
          organizationId,
          NOT: { id: categoryId },
        },
      });

      if (duplicate) {
        throw new Error("A category with this name already exists");
      }
    }

    const category = await db.templateCategory.update({
      where: { id: categoryId },
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
      },
    });

    return handleSuccess(category);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Delete a category
 * Only allows deleting org-specific categories (not global ones)
 * Templates using this category will have their categoryId set to null
 */
export async function deleteCategory(
  categoryId: string,
  organizationId: string,
) {
  try {
    logger("deleteCategory", { categoryId, organizationId });

    // Verify category belongs to this organization
    const existing = await db.templateCategory.findFirst({
      where: {
        id: categoryId,
        organizationId, // Must be org-specific
      },
    });

    if (!existing) {
      throw new Error("Category not found or cannot be deleted");
    }

    // Delete the category (templates will have categoryId set to null due to onDelete: SetNull)
    await db.templateCategory.delete({
      where: { id: categoryId },
    });

    return handleSuccess({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
