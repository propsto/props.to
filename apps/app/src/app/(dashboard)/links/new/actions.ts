"use server";

import { auth } from "@/server/auth.server";
import { createFeedbackLink } from "@propsto/data/repos";
import { FeedbackType, FeedbackVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface CreateLinkInput {
  name: string;
  templateId: string;
  feedbackType: FeedbackType;
  visibility: FeedbackVisibility;
  maxResponses?: number;
  isHidden?: boolean;
}

interface CreateLinkResult {
  success: boolean;
  error?: string;
  linkId?: string;
}

export async function createLinkAction(
  input: CreateLinkInput,
): Promise<CreateLinkResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await createFeedbackLink({
    userId: session.user.id,
    name: input.name,
    templateId: input.templateId,
    feedbackType: input.feedbackType,
    visibility: input.visibility,
    maxResponses:
      input.maxResponses && input.maxResponses > 0
        ? input.maxResponses
        : undefined,
    isHidden: input.isHidden,
  });

  if (!result.success) {
    console.error("createFeedbackLink failed:", result.error);
    return { success: false, error: result.error ?? "Failed to create link" };
  }

  revalidatePath("/links");

  return { success: true, linkId: result.data.id };
}
