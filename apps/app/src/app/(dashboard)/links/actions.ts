"use server";

import { auth } from "@/server/auth.server";
import {
  activateFeedbackLink,
  deactivateFeedbackLink,
  deleteFeedbackLink,
  getFeedbackLink,
} from "@propsto/data/repos";
import { revalidatePath } from "next/cache";

type LinkActionResult = { success: true } | { success: false; error: string };

// Owner-only: the link id comes from the client, so it is only trusted after
// checking the link belongs to the session user.
async function withOwnedLink(
  linkId: string,
  mutate: (id: string) => Promise<{ success: boolean }>,
): Promise<LinkActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const link = await getFeedbackLink(linkId);
  if (!link.success || link.data?.userId !== session.user.id) {
    return { success: false, error: "Link not found" };
  }
  const result = await mutate(link.data.id);
  if (!result.success) {
    return { success: false, error: "Failed to update link" };
  }
  revalidatePath("/links");
  return { success: true };
}

export async function pauseLinkAction(
  linkId: string,
): Promise<LinkActionResult> {
  return withOwnedLink(linkId, deactivateFeedbackLink);
}

export async function resumeLinkAction(
  linkId: string,
): Promise<LinkActionResult> {
  return withOwnedLink(linkId, activateFeedbackLink);
}

// Hard delete: received feedback is kept (Feedback.linkId is SetNull) and the
// public URL 404s because the slug no longer resolves.
export async function deleteLinkAction(
  linkId: string,
): Promise<LinkActionResult> {
  return withOwnedLink(linkId, deleteFeedbackLink);
}
