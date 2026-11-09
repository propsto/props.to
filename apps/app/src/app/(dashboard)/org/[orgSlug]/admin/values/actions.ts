"use server";

import {
  createOrgValue,
  updateOrgValue,
  reorderOrgValues,
  setOrgValueArchived,
  deleteOrgValue,
  type CreateOrgValueInput,
  type UpdateOrgValueInput,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

/**
 * Create a new org value
 */
export async function createValueAction(
  orgSlug: string,
  data: Omit<CreateOrgValueInput, "organizationId">,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await createOrgValue({ ...data, organizationId: org.id });
    if (!result.success) return fail(result.error, "Failed to save value");

    await audit(
      "VALUE_CREATED",
      { type: "value", id: result.data.id },
      { name: result.data.name },
    );
    revalidatePath(`/org/${orgSlug}/admin/values`);
    return ok();
  });
}

/**
 * Rename or redescribe an org value
 */
export async function updateValueAction(
  orgSlug: string,
  valueId: string,
  data: UpdateOrgValueInput,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await updateOrgValue(valueId, org.id, data);
    if (!result.success) return fail(result.error, "Failed to save value");

    await audit(
      "VALUE_UPDATED",
      { type: "value", id: valueId },
      { name: result.data.name },
    );
    revalidatePath(`/org/${orgSlug}/admin/values`);
    return ok();
  });
}

/**
 * Save a new display order for the org's values
 */
export async function reorderValuesAction(
  orgSlug: string,
  orderedIds: string[],
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await reorderOrgValues(org.id, orderedIds);
    if (!result.success) return fail(result.error, "Failed to reorder values");

    await audit("VALUE_UPDATED", { type: "value" }, { reordered: orderedIds });
    revalidatePath(`/org/${orgSlug}/admin/values`);
    return ok();
  });
}

/**
 * Delete an org value (refused while feedback references it)
 */
export async function deleteValueAction(
  orgSlug: string,
  valueId: string,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await deleteOrgValue(valueId, org.id);
    if (!result.success) return fail(result.error, "Failed to delete value");

    await audit(
      "VALUE_DELETED",
      { type: "value", id: valueId },
      { name: result.data.name },
    );
    revalidatePath(`/org/${orgSlug}/admin/values`);
    return ok();
  });
}

/**
 * Archive an org value so it leaves pickers, or restore it
 */
export async function setValueArchivedAction(
  orgSlug: string,
  valueId: string,
  archived: boolean,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await setOrgValueArchived(valueId, org.id, archived);
    if (!result.success) return fail(result.error, "Failed to archive value");

    await audit(
      "VALUE_UPDATED",
      { type: "value", id: valueId },
      { name: result.data.name, archived },
    );
    revalidatePath(`/org/${orgSlug}/admin/values`);
    return ok();
  });
}
