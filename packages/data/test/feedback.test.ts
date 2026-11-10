import { describe, expect, it } from "vitest";
import { db } from "../db";
import { createFeedback } from "../repos/feedback";
import {
  createGroupRow,
  createOrganization,
  createTemplate,
  createUser,
} from "./fixtures";

describe("Feedback_one_recipient check constraint", () => {
  it("refuses a row with no recipient at all", async () => {
    const template = await createTemplate();
    await expect(
      db.feedback.create({ data: { templateId: template.id } }),
    ).rejects.toThrow();
    expect(await db.feedback.count()).toBe(0);
  });

  it("accepts a group as the recipient when there is no person or entity", async () => {
    const org = await createOrganization();
    const group = await createGroupRow(org.id);
    const template = await createTemplate();
    const row = await db.feedback.create({
      data: { templateId: template.id, groupId: group.id },
    });
    expect(row.groupId).toBe(group.id);
  });

  it("createFeedback refuses a submission without a recipient", async () => {
    const template = await createTemplate();
    const result = await createFeedback({ templateId: template.id });
    expect(result.success).toBe(false);
    expect(await db.feedback.count()).toBe(0);
  });
});

describe("createFeedback maxResponses", () => {
  it("stops at the cap and rolls back the counter of the refused submission", async () => {
    const recipient = await createUser("recipient");
    const template = await createTemplate();
    const link = await db.feedbackLink.create({
      data: {
        slug: "capped",
        name: "Capped",
        userId: recipient.id,
        templateId: template.id,
        maxResponses: 1,
      },
    });

    const first = await createFeedback({
      userId: recipient.id,
      templateId: template.id,
      linkId: link.id,
    });
    expect(first.success).toBe(true);

    const second = await createFeedback({
      userId: recipient.id,
      templateId: template.id,
      linkId: link.id,
    });
    expect(second).toMatchObject({
      success: false,
      error: "This feedback link has reached its maximum responses",
    });

    expect(await db.feedback.count({ where: { linkId: link.id } })).toBe(1);
    const after = await db.feedbackLink.findUniqueOrThrow({
      where: { id: link.id },
    });
    expect(after.responseCount).toBe(1);
  });
});
