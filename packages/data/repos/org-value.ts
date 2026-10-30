import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

export type CreateOrgValueInput = {
  name: string;
  description?: string;
  organizationId: string;
};

export type UpdateOrgValueInput = {
  name?: string;
  description?: string;
};

/**
 * Get an organization's values in display order
 */
export async function getOrgValues(organizationId: string) {
  try {
    logger("getOrgValues", { organizationId });

    const values = await db.orgValue.findMany({
      where: { organizationId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { feedbacks: true } } },
    });

    return handleSuccess(values);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Create a value at the end of the organization's list
 */
export async function createOrgValue(input: CreateOrgValueInput) {
  try {
    logger("createOrgValue", { input });

    const existing = await db.orgValue.findFirst({
      where: { name: input.name, organizationId: input.organizationId },
    });
    if (existing) {
      throw new Error("A value with this name already exists");
    }

    const last = await db.orgValue.findFirst({
      where: { organizationId: input.organizationId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const value = await db.orgValue.create({
      data: {
        name: input.name,
        description: input.description,
        organizationId: input.organizationId,
        order: (last?.order ?? -1) + 1,
      },
    });

    return handleSuccess(value);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Update a value of this organization
 */
export async function updateOrgValue(
  valueId: string,
  organizationId: string,
  input: UpdateOrgValueInput,
) {
  try {
    logger("updateOrgValue", { valueId, organizationId, input });

    const existing = await db.orgValue.findFirst({
      where: { id: valueId, organizationId },
    });
    if (!existing) {
      throw new Error("Value not found");
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await db.orgValue.findFirst({
        where: { name: input.name, organizationId, NOT: { id: valueId } },
      });
      if (duplicate) {
        throw new Error("A value with this name already exists");
      }
    }

    const value = await db.orgValue.update({
      where: { id: valueId },
      data: { name: input.name, description: input.description ?? null },
    });

    return handleSuccess(value);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Set the display order of an organization's values.
 * orderedIds must list exactly the organization's values.
 */
export async function reorderOrgValues(
  organizationId: string,
  orderedIds: string[],
) {
  try {
    logger("reorderOrgValues", { organizationId, orderedIds });

    const current = await db.orgValue.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const currentIds = new Set(current.map(v => v.id));
    if (
      orderedIds.length !== currentIds.size ||
      new Set(orderedIds).size !== orderedIds.length ||
      orderedIds.some(id => !currentIds.has(id))
    ) {
      throw new Error("Value list is out of date, reload and try again");
    }

    await db.$transaction(
      orderedIds.map((id, order) =>
        db.orgValue.update({ where: { id }, data: { order } }),
      ),
    );

    return handleSuccess({ reordered: true });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Delete a value of this organization. Refused while any feedback is tagged with it.
 */
export async function deleteOrgValue(valueId: string, organizationId: string) {
  try {
    logger("deleteOrgValue", { valueId, organizationId });

    const existing = await db.orgValue.findFirst({
      where: { id: valueId, organizationId },
      include: { _count: { select: { feedbacks: true } } },
    });
    if (!existing) {
      throw new Error("Value not found");
    }
    if (existing._count.feedbacks > 0) {
      throw new Error(
        "This value is used by feedback and cannot be deleted. Rename it instead.",
      );
    }

    await db.orgValue.delete({ where: { id: valueId } });

    return handleSuccess({ deleted: true, name: existing.name });
  } catch (e) {
    return handleError(e);
  }
}
