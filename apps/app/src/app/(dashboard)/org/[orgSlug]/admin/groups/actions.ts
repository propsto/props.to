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
  addGroupAdmin,
  removeGroupAdmin,
  getOrganizationMembers,
  createGroupFeedbackLink,
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
  if (error || !orgId)
    return { success: false, error: error ?? "Organization not found" };

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
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId)
    return { success: false, error: error ?? "Organization not found" };

  // Scoped to the org: a group or parent id from another org is not found
  const result = await updateGroup(id, orgId, {
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

export async function deleteGroupAction(
  orgSlug: string,
  id: string,
): Promise<ActionResult> {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId)
    return { success: false, error: error ?? "Organization not found" };

  const result = await deleteGroup(id, orgId);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to delete group" };
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}

// Create a team feedback link: the group is the recipient, so submissions go
// to the team's page and its leads, never to a member's personal record.
export async function createTeamLinkAction(
  orgSlug: string,
  groupId: string,
): Promise<ActionResult & { path?: string }> {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId)
    return { success: false, error: error ?? "Organization not found" };

  const group = await getGroup(groupId, orgId);
  if (!group.success || !group.data) {
    return { success: false, error: "Group not found" };
  }

  const result = await createGroupFeedbackLink({
    groupId,
    organizationId: orgId,
    name: `Feedback for ${group.data.name}`,
  });
  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to create team link",
    };
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return {
    success: true,
    path: `/${orgSlug}/${group.data.slug.slug}/${result.data.slug}`,
  };
}

export async function updateGroupMembersAction(
  orgSlug: string,
  groupId: string,
  data: {
    addUserIds?: string[];
    removeUserIds?: string[];
    addLeadIds?: string[];
    removeLeadIds?: string[];
  },
): Promise<ActionResult> {
  const { error, orgId } = await verifyAdminAccess(orgSlug);
  if (error || !orgId)
    return { success: false, error: error ?? "Organization not found" };

  // Refuse a group id from another org before changing anything
  const group = await getGroup(groupId, orgId);
  if (!group.success || !group.data) {
    return { success: false, error: "Group not found" };
  }

  // Only org members can be placed in an org's group
  const members = await getOrganizationMembers(orgId);
  const memberIds = new Set((members.data ?? []).map(m => m.userId));
  const addUserIds = (data.addUserIds ?? []).filter(id => memberIds.has(id));
  const removeUserIds = data.removeUserIds ?? [];
  // A lead must stay a member: removed members can't be made leads in the same save
  const addLeadIds = (data.addLeadIds ?? []).filter(
    id => memberIds.has(id) && !removeUserIds.includes(id),
  );
  const removeLeadIds = data.removeLeadIds ?? [];

  if (removeUserIds.length > 0) {
    const removeResult = await removeGroupMembers(
      groupId,
      orgId,
      removeUserIds,
    );
    if (!removeResult.success) {
      return {
        success: false,
        error: removeResult.error ?? "Failed to remove members",
      };
    }
  }

  if (addUserIds.length > 0) {
    const addResult = await addGroupMembers(groupId, orgId, addUserIds);
    if (!addResult.success) {
      return {
        success: false,
        error: addResult.error ?? "Failed to add members",
      };
    }
  }

  for (const userId of removeLeadIds) {
    const result = await removeGroupAdmin(groupId, orgId, userId);
    if (!result.success) {
      return { success: false, error: result.error ?? "Failed to remove lead" };
    }
  }

  for (const userId of addLeadIds) {
    const result = await addGroupAdmin(groupId, orgId, userId);
    if (!result.success) {
      return { success: false, error: result.error ?? "Failed to add lead" };
    }
  }

  revalidatePath(`/org/${orgSlug}/admin/groups`);
  return { success: true };
}
