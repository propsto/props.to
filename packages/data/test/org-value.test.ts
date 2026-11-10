import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  createOrgValue,
  deleteOrgValue,
  getOrgValues,
  reorderOrgValues,
  setOrgValueArchived,
} from "../repos/org-value";
import { createOrganization, createTemplate, createUser } from "./fixtures";

async function valuesOf(organizationId: string, names: string[]) {
  const ids: string[] = [];
  for (const name of names) {
    const result = await createOrgValue({ name, organizationId });
    if (!result.success) throw new Error(result.error);
    ids.push(result.data.id);
  }
  return ids;
}

describe("deleteOrgValue", () => {
  it("refuses a value that tagged feedback references, and keeps it", async () => {
    const org = await createOrganization();
    const [valueId] = await valuesOf(org.id, ["Candor"]);
    const recipient = await createUser();
    const template = await createTemplate();
    await db.feedback.create({
      data: {
        userId: recipient.id,
        templateId: template.id,
        organizationId: org.id,
        values: { create: { valueId } },
      },
    });

    const result = await deleteOrgValue(valueId, org.id);
    expect(result.success).toBe(false);
    expect(await db.orgValue.count({ where: { id: valueId } })).toBe(1);
  });

  it("deletes an unreferenced value, only within its organization", async () => {
    const org = await createOrganization();
    const other = await createOrganization("other");
    const [valueId] = await valuesOf(org.id, ["Candor"]);

    expect((await deleteOrgValue(valueId, other.id)).success).toBe(false);
    expect((await deleteOrgValue(valueId, org.id)).success).toBe(true);
    expect(await db.orgValue.count({ where: { id: valueId } })).toBe(0);
  });
});

describe("reorderOrgValues", () => {
  it("requires exactly the organization's active ids", async () => {
    const org = await createOrganization();
    const [a, b, c] = await valuesOf(org.id, ["A", "B", "C"]);

    expect((await reorderOrgValues(org.id, [c, b])).success).toBe(false);
    expect((await reorderOrgValues(org.id, [c, b, b])).success).toBe(false);
    expect((await reorderOrgValues(org.id, [c, b, a, "x"])).success).toBe(
      false,
    );

    expect((await reorderOrgValues(org.id, [c, a, b])).success).toBe(true);
    const listed = await getOrgValues(org.id);
    expect(listed.success && listed.data.map(v => v.id)).toEqual([c, a, b]);
  });
});

describe("setOrgValueArchived", () => {
  it("hides an archived value from the active list and the reorder set", async () => {
    const org = await createOrganization();
    const [a, b] = await valuesOf(org.id, ["A", "B"]);

    expect((await setOrgValueArchived(a, org.id, true)).success).toBe(true);

    const active = await getOrgValues(org.id);
    expect(active.success && active.data.map(v => v.id)).toEqual([b]);
    const all = await getOrgValues(org.id, { includeArchived: true });
    expect(all.success && all.data.map(v => v.id).sort()).toEqual(
      [a, b].sort(),
    );
    expect((await reorderOrgValues(org.id, [b])).success).toBe(true);
  });
});
