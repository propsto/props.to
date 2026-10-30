"use server";

import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  createAuditLog,
  createOrgValue,
  updateOrgValue,
  reorderOrgValues,
  deleteOrgValue,
  type CreateOrgValueInput,
  type UpdateOrgValueInput,
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
 * Create a new org value
 */
export async function createValueAction(
  orgSlug: string,
  data: Omit<CreateOrgValueInput, "organizationId">,
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await createOrgValue({ ...data, organizationId: orgId });

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "VALUE_CREATED",
      resourceType: "value",
      resourceId: result.data.id,
      details: { name: result.data.name },
    });
    revalidatePath(`/org/${orgSlug}/admin/values`);
  }

  return result;
}

/**
 * Rename or redescribe an org value
 */
export async function updateValueAction(
  orgSlug: string,
  valueId: string,
  data: UpdateOrgValueInput,
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await updateOrgValue(valueId, orgId, data);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "VALUE_UPDATED",
      resourceType: "value",
      resourceId: valueId,
      details: { name: result.data.name },
    });
    revalidatePath(`/org/${orgSlug}/admin/values`);
  }

  return result;
}

/**
 * Save a new display order for the org's values
 */
export async function reorderValuesAction(
  orgSlug: string,
  orderedIds: string[],
) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await reorderOrgValues(orgId, orderedIds);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "VALUE_UPDATED",
      resourceType: "value",
      details: { reordered: orderedIds },
    });
    revalidatePath(`/org/${orgSlug}/admin/values`);
  }

  return result;
}

/**
 * Delete an org value (refused while feedback references it)
 */
export async function deleteValueAction(orgSlug: string, valueId: string) {
  const { error, orgId, userId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId || !userId) {
    return { success: false, error: error ?? "Organization not found" };
  }

  const result = await deleteOrgValue(valueId, orgId);

  if (result.success) {
    await createAuditLog({
      organizationId: orgId,
      actorId: userId,
      action: "VALUE_DELETED",
      resourceType: "value",
      resourceId: valueId,
      details: { name: result.data.name },
    });
    revalidatePath(`/org/${orgSlug}/admin/values`);
  }

  return result;
}
