"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth.server";
import {
  verifyOrgAdminAccess,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addGroupMembers,
  removeGroupMembers,
  getOrganizationMembers,
} from "@propsto/data/repos";

interface ActionResult {
  success: boolean;
  error?: string;
}

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

// Groups are addressed by id from the client, so confirm the id belongs to the authorized org.
async function verifyGroupInOrg(orgSlug: string, groupId: string) {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) return { error: error ?? "Organization not found", orgId: null };
  const group = await getGroup(groupId);
  if (!group.success || !group.data || group.data.organizationId !== orgId) {
    return { error: "Group not found", orgId: null };
  }
  return { error: undefined, orgId };
}

export async function createGroupAction(
  orgSlug: string,
  data: {
    name: string;
    slug?: string;
    description?: string;
    visibility?: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
    parentGroupId?: string;
  },
): Promise<ActionResult> {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId) return { success: false, error: error ?? "Organization not found" };

  // Explicit payload: extra client fields (memberUserIds, adminUserIds, organizationId) never reach the repo
  const result = await createGroup({
    organizationId: orgId,
    name: data.name,
    slug: data.slug,
    description: data.description,
    visibility: data.visibility,
    parentGroupId: data.parentGroupId,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to create group" };
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}

export async function updateGroupAction(
  orgSlug: string,
  id: string,
  data: {
    name?: string;
    description?: string;
    visibility?: "PUBLIC" | "PRIVATE" | "ORGANIZATION";
    parentGroupId?: string | null;
  },
): Promise<ActionResult> {
  const { error, orgId } = await verifyGroupInOrg(orgSlug, id);
  if (error || !orgId) return { success: false, error: error ?? "Group not found" };

  if (data.parentGroupId) {
    const parent = await getGroup(data.parentGroupId);
    if (!parent.success || parent.data?.organizationId !== orgId) {
      return { success: false, error: "Parent group not found" };
    }
  }

  const result = await updateGroup(id, {
    name: data.name,
    description: data.description,
    visibility: data.visibility,
    parentGroupId: data.parentGroupId,
  });
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to update group" };
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}

export async function deleteGroupAction(orgSlug: string, id: string): Promise<ActionResult> {
  const { error, orgId } = await verifyGroupInOrg(orgSlug, id);
  if (error || !orgId) return { success: false, error: error ?? "Group not found" };

  const result = await deleteGroup(id);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to delete group" };
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}

export async function updateGroupMembersAction(
  orgSlug: string,
  groupId: string,
  data: {
    addUserIds?: string[];
    removeUserIds?: string[];
  },
): Promise<ActionResult> {
  const { error, orgId } = await verifyGroupInOrg(orgSlug, groupId);
  if (error || !orgId) return { success: false, error: error ?? "Group not found" };

  // Only org members can be placed in an org's group
  const members = await getOrganizationMembers(orgId);
  const memberIds = new Set((members.data ?? []).map(m => m.userId));
  const addUserIds = (data.addUserIds ?? []).filter(id => memberIds.has(id));
  const removeUserIds = data.removeUserIds ?? [];

  if (removeUserIds.length > 0) {
    const removeResult = await removeGroupMembers(groupId, removeUserIds);
    if (!removeResult.success) {
      return { success: false, error: removeResult.error ?? "Failed to remove members" };
    }
  }

  if (addUserIds.length > 0) {
    const addResult = await addGroupMembers(groupId, addUserIds);
    if (!addResult.success) {
      return { success: false, error: addResult.error ?? "Failed to add members" };
    }
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}
