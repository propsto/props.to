"use server";

import { auth } from "@/server/auth.server";
import {
  assignTemplateToOrganization,
  verifyOrgAdminAccess,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";

/**
 * Add a default template to an organization
 */
export async function addDefaultTemplateToOrgAction(
  templateId: string,
  organizationId: string,
  orgSlug: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify admin access
  const membershipResult = await verifyOrgAdminAccess(
    session.user.id,
    orgSlug,
  );
  if (!membershipResult.success || !membershipResult.data) {
    return { success: false, error: "Not authorized" };
  }

  // Assign template to organization
  const result = await assignTemplateToOrganization(templateId, organizationId);
  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to add template" };
  }

  revalidatePath(`/org/${orgSlug}/admin/templates`);
  return { success: true };
}
