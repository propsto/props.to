"use server";

import {
  createOrgLevel,
  updateOrgLevel,
  reorderOrgLevels,
  setOrgLevelArchived,
  setOrgLevelExpectations,
  type CreateOrgLevelInput,
  type OrgLevelExpectationInput,
  type UpdateOrgLevelInput,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

/**
 * Create a new org level
 */
export async function createLevelAction(
  orgSlug: string,
  data: Omit<CreateOrgLevelInput, "organizationId">,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await createOrgLevel({ ...data, organizationId: org.id });
    if (!result.success) return fail(result.error, "Failed to save level");

    await audit(
      "LEVEL_CREATED",
      { type: "level", id: result.data.id },
      { name: result.data.name },
    );
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    return ok();
  });
}

/**
 * Rename an org level or change its summary or rubric
 */
export async function updateLevelAction(
  orgSlug: string,
  levelId: string,
  data: UpdateOrgLevelInput,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await updateOrgLevel(levelId, org.id, data);
    if (!result.success) return fail(result.error, "Failed to save level");

    await audit(
      "LEVEL_UPDATED",
      { type: "level", id: levelId },
      {
        name: result.data.name,
        ...(data.rubric && { rubricUpdated: true }),
      },
    );
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    revalidatePath(`/org/${orgSlug}/admin/levels/${levelId}`);
    return ok();
  });
}

/**
 * Save what each org value looks like at this level
 */
export async function setLevelExpectationsAction(
  orgSlug: string,
  levelId: string,
  expectations: OrgLevelExpectationInput[],
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await setOrgLevelExpectations(levelId, org.id, expectations);
    if (!result.success) {
      return fail(result.error, "Failed to save expectations");
    }

    await audit(
      "LEVEL_UPDATED",
      { type: "level", id: levelId },
      { expectationsUpdated: result.data.saved },
    );
    revalidatePath(`/org/${orgSlug}/admin/levels/${levelId}`);
    return ok();
  });
}

/**
 * Save a new display order for the org's levels
 */
export async function reorderLevelsAction(
  orgSlug: string,
  orderedIds: string[],
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await reorderOrgLevels(org.id, orderedIds);
    if (!result.success) return fail(result.error, "Failed to reorder levels");

    await audit("LEVEL_UPDATED", { type: "level" }, { reordered: orderedIds });
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    return ok();
  });
}

/**
 * Archive an org level so it leaves pickers, or restore it
 */
export async function setLevelArchivedAction(
  orgSlug: string,
  levelId: string,
  archived: boolean,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org, audit }) => {
    const result = await setOrgLevelArchived(levelId, org.id, archived);
    if (!result.success) return fail(result.error, "Failed to archive level");

    await audit(
      "LEVEL_UPDATED",
      { type: "level", id: levelId },
      { name: result.data.name, archived },
    );
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    return ok();
  });
}
