"use server";

import { auth } from "@/server/auth.server";
import {
  adoptManagedLink,
  getAvailableManagedLinks,
  getUserOrganizations,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";

// Infer the inner type from getAvailableManagedLinks
type ManagedLinksResult = Awaited<ReturnType<typeof getAvailableManagedLinks>>;
type ManagedLinksData = Extract<ManagedLinksResult, { success: true }>["data"];

export async function getAvailableManagedLinksForUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const userId = session.user.id;

  // Get user's organizations
  const orgsResult = await getUserOrganizations(userId);
  if (!orgsResult.success) {
    return { success: false as const, error: "Failed to fetch organizations" };
  }

  const allAvailable: Array<{
    orgId: string;
    orgName: string;
    available: ManagedLinksData["available"];
    adopted: ManagedLinksData["adopted"];
  }> = [];

  // Get managed links from each org
  for (const membership of orgsResult.data) {
    const result = await getAvailableManagedLinks(
      userId,
      membership.organization.id,
    );
    if (result.success && result.data.available.length > 0) {
      allAvailable.push({
        orgId: membership.organization.id,
        orgName: membership.organization.name,
        available: result.data.available,
        adopted: result.data.adopted,
      });
    }
  }

  return { success: true as const, data: allAvailable };
}

export async function adoptManagedLinkAction(
  sourceManagedId: string,
  customSlug?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const result = await adoptManagedLink({
    sourceManagedId,
    userId: session.user.id,
    slug: customSlug || undefined,
  });

  if (!result.success) {
    return {
      success: false as const,
      error: result.error ?? "Failed to adopt link",
    };
  }

  revalidatePath("/links");
  return { success: true as const, data: result.data };
}
