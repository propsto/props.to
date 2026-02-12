"use server";

import { revalidatePath } from "next/cache";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMembers,
  removeGroupMembers,
} from "@propsto/data/repos";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createGroupAction(data: {
  name: string;
  organizationId: string;
  slug?: string;
  parentGroupId?: string;
}): Promise<ActionResult> {
  const result = await createGroup(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to create group",
    };
  }

  revalidatePath("/org/[orgSlug]/admin/groups", "page");
  return { success: true };
}

export async function updateGroupAction(
  id: string,
  data: { name?: string; parentGroupId?: string | null },
): Promise<ActionResult> {
  const result = await updateGroup(id, data);

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to update group",
    };
  }

  revalidatePath("/org/[orgSlug]/admin/groups", "page");
  return { success: true };
}

export async function deleteGroupAction(id: string): Promise<ActionResult> {
  const result = await deleteGroup(id);

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Failed to delete group",
    };
  }

  revalidatePath("/org/[orgSlug]/admin/groups", "page");
  return { success: true };
}

export async function updateGroupMembersAction(
  groupId: string,
  data: {
    addUserIds?: string[];
    removeUserIds?: string[];
  },
): Promise<ActionResult> {
  try {
    // Remove members first
    if (data.removeUserIds && data.removeUserIds.length > 0) {
      const removeResult = await removeGroupMembers(groupId, data.removeUserIds);
      if (!removeResult.success) {
        return {
          success: false,
          error: removeResult.error ?? "Failed to remove members",
        };
      }
    }

    // Then add new members
    if (data.addUserIds && data.addUserIds.length > 0) {
      const addResult = await addGroupMembers(groupId, data.addUserIds);
      if (!addResult.success) {
        return {
          success: false,
          error: addResult.error ?? "Failed to add members",
        };
      }
    }

    revalidatePath("/org/[orgSlug]/admin/groups", "page");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update members",
    };
  }
}
