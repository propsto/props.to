import { redirect, notFound } from "next/navigation";
import { getMembershipByOrgSlug } from "@propsto/data/repos";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";

/**
 * Page-level admin guard. Must be awaited at the TOP of every org admin page,
 * before any data fetch.
 *
 * A notFound()/redirect() in the admin LAYOUT does not stop its child pages from
 * rendering and streaming their data in the App Router, so the layout guard alone
 * lets a non-member read another org's data by URL. Each page guards itself here.
 *
 * Non-members get 404 (the org is not disclosed); non-admin members are sent to the
 * org landing page, matching the layout.
 */
export async function requireOrgAdmin(orgSlug: string): Promise<{
  userId: string;
  org: { id: string; name: string };
  role: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(constServer.AUTH_URL);
  }
  const membershipResult = await getMembershipByOrgSlug(
    session.user.id,
    orgSlug,
  );
  if (!membershipResult.success || !membershipResult.data) {
    notFound();
  }
  const membership = membershipResult.data;
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    redirect(`/org/${orgSlug}`);
  }
  return {
    userId: session.user.id,
    org: membership.organization,
    role: membership.role,
  };
}
