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
  // Omitted keeps the current description; an empty string clears it
  description?: string;
};

function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }
  return trimmed;
}

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
    const name = cleanName(input.name);
    const { organizationId } = input;

    // Lock the org row so concurrent creates append in turn instead of sharing an order
    const value = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${organizationId} FOR UPDATE`;

      const existing = await tx.orgValue.findFirst({
        where: { name, organizationId },
      });
      if (existing) {
        throw new Error("A value with this name already exists");
      }

      const last = await tx.orgValue.findFirst({
        where: { organizationId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      return tx.orgValue.create({
        data: {
          name,
          description: input.description?.trim() || null,
          organizationId,
          order: (last?.order ?? -1) + 1,
        },
      });
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

    const name = input.name === undefined ? undefined : cleanName(input.name);
    if (name && name !== existing.name) {
      const duplicate = await db.orgValue.findFirst({
        where: { name, organizationId, NOT: { id: valueId } },
      });
      if (duplicate) {
        throw new Error("A value with this name already exists");
      }
    }

    const value = await db.orgValue.update({
      where: { id: valueId },
      data: {
        name,
        description:
          input.description === undefined
            ? undefined
            : input.description.trim() || null,
      },
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

    // Lock the value row: tagging feedback takes a key-share lock on it through the
    // foreign key, so no tag can be added between the reference check and the delete
    const name = await db.$transaction(async tx => {
      const locked = await tx.$queryRaw<{ name: string }[]>`
        SELECT name FROM "OrgValue"
        WHERE id = ${valueId} AND "organizationId" = ${organizationId}
        FOR UPDATE`;
      if (locked.length === 0) {
        throw new Error("Value not found");
      }

      const references = await tx.feedbackValue.count({ where: { valueId } });
      if (references > 0) {
        throw new Error(
          "This value is used by feedback and cannot be deleted. Rename it instead.",
        );
      }

      await tx.orgValue.delete({ where: { id: valueId } });
      return locked[0].name;
    });

    return handleSuccess({ deleted: true, name });
  } catch (e) {
    return handleError(e);
  }
}
