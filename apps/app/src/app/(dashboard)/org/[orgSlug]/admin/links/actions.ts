"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth.server";
import { setGroupLinkActive, verifyOrgAdminAccess } from "@propsto/data/repos";

type Result = { success: boolean; error?: string };

// Pause or resume a team link. The org comes from the admin membership, never
// from the client; the repo only matches a team link of that org, so members'
// own links stay out of reach.
export async function setTeamLinkActiveAction(
  orgSlug: string,
  linkId: string,
  isActive: boolean,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  const membership = await verifyOrgAdminAccess(session.user.id, orgSlug);
  if (!membership.success || !membership.data) {
    return { success: false, error: "Not authorized" };
  }
  const result = await setGroupLinkActive(
    linkId,
    membership.data.organization.id,
    isActive,
  );
  if (!result.success) {
    return { success: false, error: "Team link not found" };
  }
  revalidatePath(`/org/${orgSlug}/admin/links`);
  return { success: true };
}
