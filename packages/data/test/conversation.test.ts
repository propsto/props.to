import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  addConversationStep,
  createConversation,
  resolveConversation,
} from "../repos/conversation";
import { addMember, createOrganization, createUser } from "./fixtures";

async function openConversation(stage: "DIRECT" | "REPEATED" | "FINAL") {
  const org = await createOrganization();
  const lead = await createUser("lead");
  const subject = await createUser("subject");
  await addMember(lead.id, org.id, "ADMIN");
  await addMember(subject.id, org.id);
  const result = await createConversation({
    organizationId: org.id,
    subjectUserId: subject.id,
    openedById: lead.id,
    firstStep: { stage, sharedNote: "First talk" },
  });
  if (!result.success) throw new Error(result.error);
  return { org, lead, conversation: result.data };
}

describe("addConversationStep", () => {
  it("refuses a step at an earlier stage than one already reached", async () => {
    const { org, lead, conversation } = await openConversation("REPEATED");

    const back = await addConversationStep(conversation.id, org.id, {
      stage: "DIRECT",
      ownerId: lead.id,
      sharedNote: "Going back",
    });
    expect(back).toMatchObject({
      success: false,
      error: "A step cannot go back to an earlier stage",
    });

    const same = await addConversationStep(conversation.id, org.id, {
      stage: "REPEATED",
      ownerId: lead.id,
      sharedNote: "Again",
    });
    expect(same.success).toBe(true);

    const forward = await addConversationStep(conversation.id, org.id, {
      stage: "FINAL",
      ownerId: lead.id,
      sharedNote: "Last one",
    });
    expect(forward.success).toBe(true);

    expect(
      await db.conversationStep.count({
        where: { conversationId: conversation.id },
      }),
    ).toBe(3);
  });

  it("refuses a step on a resolved conversation or from another org", async () => {
    const { org, lead, conversation } = await openConversation("DIRECT");
    const other = await createOrganization("other");
    const step = {
      stage: "DIRECT" as const,
      ownerId: lead.id,
      sharedNote: "x",
    };

    expect(
      (await addConversationStep(conversation.id, other.id, step)).success,
    ).toBe(false);
    expect((await resolveConversation(conversation.id, org.id)).success).toBe(
      true,
    );
    expect(
      (await addConversationStep(conversation.id, org.id, step)).success,
    ).toBe(false);
  });
});
