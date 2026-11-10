import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  addGroupMember,
  deleteGroup,
  getGroup,
  updateGroup,
} from "../repos/group";
import {
  addMember,
  createGroupRow,
  createOrganization,
  createUser,
} from "./fixtures";

async function twoOrgs() {
  const acme = await createOrganization("acme");
  const globex = await createOrganization("globex");
  const group = await createGroupRow(acme.id, "acme-team");
  return { acme, globex, group };
}

describe("group org scoping", () => {
  it("does not read a group through another organization", async () => {
    const { acme, globex, group } = await twoOrgs();
    expect((await getGroup(group.id, globex.id)).data).toBeNull();
    expect((await getGroup(group.id, acme.id)).data?.id).toBe(group.id);
  });

  it("does not update, add members to, or delete a group through another organization", async () => {
    const { globex, group } = await twoOrgs();
    const user = await createUser();
    await addMember(user.id, globex.id);

    expect(
      (await updateGroup(group.id, globex.id, { name: "taken" })).success,
    ).toBe(false);
    expect((await addGroupMember(group.id, globex.id, user.id)).success).toBe(
      false,
    );
    expect((await deleteGroup(group.id, globex.id)).success).toBe(false);

    const after = await db.group.findUniqueOrThrow({
      where: { id: group.id },
      include: { users: true },
    });
    expect(after.name).toBe(group.name);
    expect(after.users).toHaveLength(0);
  });

  it("refuses a parent group from another organization", async () => {
    const { acme, globex, group } = await twoOrgs();
    const foreignParent = await createGroupRow(globex.id, "globex-parent");
    const result = await updateGroup(group.id, acme.id, {
      parentGroupId: foreignParent.id,
    });
    expect(result).toMatchObject({
      success: false,
      error: "Parent group not found",
    });
  });
});
