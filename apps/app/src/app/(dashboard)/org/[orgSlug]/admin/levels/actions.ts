"use server";

import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  createAuditLog,
  createOrgLevel,
  updateOrgLevel,
  reorderOrgLevels,
  setOrgLevelExpectations,
  type CreateOrgLevelInput,
  type OrgLevelExpectationInput,
  type UpdateOrgLevelInput,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";

/**
 * Verify user has admin access to the organization
 */
async function verifyAdminAccess(orgSlug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated", orgId: null, userId: null };
  }

  const membershipResult = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membershipResult.success || !membershipResult.data) {
    return { error: "Not authorized", orgId: null, userId: null };
  }

  return {
    error: null,
    orgId: membershipResult.data.organization.id,
    userId: session.user.id,
  };
}

/**
 * Create a new org level
 */
export async function createLevelAction(
  orgSlug: string,
  data: Omit<CreateOrgLevelInput, "organizationId">,
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await createOrgLevel({ ...data, organizationId: orgId });

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "LEVEL_CREATED",
      resourceType: "level",
      resourceId: result.data.id,
      details: { name: result.data.name },
    });
    revalidatePath(`/org/${orgSlug}/admin/levels`);
  }

  return result;
}

/**
 * Rename an org level or change its summary or rubric
 */
export async function updateLevelAction(
  orgSlug: string,
  levelId: string,
  data: UpdateOrgLevelInput,
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await updateOrgLevel(levelId, orgId, data);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "LEVEL_UPDATED",
      resourceType: "level",
      resourceId: levelId,
      details: {
        name: result.data.name,
        ...(data.rubric && { rubricUpdated: true }),
      },
    });
    revalidatePath(`/org/${orgSlug}/admin/levels`);
    revalidatePath(`/org/${orgSlug}/admin/levels/${levelId}`);
  }

  return result;
}

/**
 * Save what each org value looks like at this level
 */
export async function setLevelExpectationsAction(
  orgSlug: string,
  levelId: string,
  expectations: OrgLevelExpectationInput[],
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await setOrgLevelExpectations(levelId, orgId, expectations);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "LEVEL_UPDATED",
      resourceType: "level",
      resourceId: levelId,
      details: { expectationsUpdated: result.data.saved },
    });
    revalidatePath(`/org/${orgSlug}/admin/levels/${levelId}`);
  }

  return result;
}

/**
 * Save a new display order for the org's levels
 */
export async function reorderLevelsAction(
  orgSlug: string,
  orderedIds: string[],
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await reorderOrgLevels(orgId, orderedIds);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "LEVEL_UPDATED",
      resourceType: "level",
      details: { reordered: orderedIds },
    });
    revalidatePath(`/org/${orgSlug}/admin/levels`);
  }

  return result;
}
