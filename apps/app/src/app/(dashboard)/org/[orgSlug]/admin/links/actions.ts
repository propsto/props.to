"use server";

import { revalidatePath } from "next/cache";
import { setGroupLinkActive } from "@propsto/data/repos";
import {
  withOrgAdmin,
  ok,
  fail,
  type ActionResult,
} from "@/server/with-org-admin";

// Pause or resume a team link. The org comes from the admin membership, never
// from the client; the repo only matches a team link of that org, so members'
// own links stay out of reach.
export async function setTeamLinkActiveAction(
  orgSlug: string,
  linkId: string,
  isActive: boolean,
): Promise<ActionResult> {
  return withOrgAdmin(orgSlug, async ({ org }) => {
    const result = await setGroupLinkActive(linkId, org.id, isActive);
    if (!result.success) return fail("Team link not found");

    revalidatePath(`/org/${orgSlug}/admin/links`);
    return ok();
  });
}
