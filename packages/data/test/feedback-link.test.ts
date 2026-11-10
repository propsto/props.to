import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  adoptManagedLink,
  createManagedFeedbackLink,
} from "../repos/feedback-link";
import {
  addMember,
  createOrganization,
  createTemplate,
  createUser,
} from "./fixtures";

async function managedLink() {
  const org = await createOrganization();
  const admin = await createUser("admin");
  await addMember(admin.id, org.id, "ADMIN");
  const template = await createTemplate(org.id);
  const result = await createManagedFeedbackLink({
    organizationId: org.id,
    managedByUserId: admin.id,
    templateId: template.id,
    name: "Quarterly",
  });
  if (!result.success) throw new Error(result.error);
  return { org, admin, link: result.data };
}

describe("adoptManagedLink", () => {
  it("gives a member one personal, unmanaged copy", async () => {
    const { org, link } = await managedLink();
    const member = await createUser("member");
    await addMember(member.id, org.id);

    const adopted = await adoptManagedLink({
      sourceManagedId: link.id,
      userId: member.id,
    });
    expect(adopted.success).toBe(true);
    expect(adopted.data).toMatchObject({
      userId: member.id,
      organizationId: org.id,
      isManaged: false,
      sourceManagedId: link.id,
    });

    const again = await adoptManagedLink({
      sourceManagedId: link.id,
      userId: member.id,
    });
    expect(again).toMatchObject({
      success: false,
      error: "You have already adopted this link",
    });
    expect(
      await db.feedbackLink.count({ where: { sourceManagedId: link.id } }),
    ).toBe(1);
  });

  it("refuses a user outside the organization", async () => {
    const { link } = await managedLink();
    const outsider = await createUser("outsider");
    const result = await adoptManagedLink({
      sourceManagedId: link.id,
      userId: outsider.id,
    });
    expect(result).toMatchObject({
      success: false,
      error: "User is not a member of this organization",
    });
  });

  it("refuses a paused managed link and a link that is not managed", async () => {
    const { org, link } = await managedLink();
    const member = await createUser("member");
    await addMember(member.id, org.id);

    await db.feedbackLink.update({
      where: { id: link.id },
      data: { isActive: false },
    });
    expect(
      await adoptManagedLink({ sourceManagedId: link.id, userId: member.id }),
    ).toMatchObject({ success: false, error: "This managed link is paused" });

    const personal = await db.feedbackLink.create({
      data: {
        slug: "personal",
        name: "Personal",
        userId: member.id,
        organizationId: org.id,
        templateId: link.templateId,
      },
    });
    expect(
      await adoptManagedLink({
        sourceManagedId: personal.id,
        userId: member.id,
      }),
    ).toMatchObject({ success: false, error: "This is not a managed link" });
  });
});
