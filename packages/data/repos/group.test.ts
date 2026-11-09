import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addGroupAdmin,
  addGroupMember,
  addGroupMembers,
  deleteGroup,
  getGroup,
  removeGroupAdmin,
  removeGroupMember,
  removeGroupMembers,
  updateGroup,
} from "./group";

// The org scope is checked in the where clause, so a fake that matches on
// both id and organizationId stands in for the database
const GROUP = { id: "group_acme", organizationId: "org_acme" };

const db = vi.hoisted(() => ({
  group: {
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  groupAdmin: {
    findFirst: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  feedbackLink: { count: vi.fn() },
  feedback: { count: vi.fn() },
}));

vi.mock("../db", () => ({
  db,
  Prisma: {
    validator: () => (value: unknown) => value,
    PrismaClientKnownRequestError: class extends Error {},
  },
}));
vi.mock("@prisma/client", () => ({ SlugScope: {} }));
vi.mock("@propsto/logger", () => ({ createLogger: () => () => undefined }));

function matches(where: { id?: string; organizationId?: string }): boolean {
  return (
    where.id === GROUP.id &&
    (where.organizationId === undefined ||
      where.organizationId === GROUP.organizationId)
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  db.group.findFirst.mockImplementation(
    ({ where }: { where: { id: string; organizationId?: string } }) =>
      Promise.resolve(matches(where) ? { ...GROUP, children: [] } : null),
  );
  db.group.update.mockResolvedValue(GROUP);
  db.group.delete.mockResolvedValue(GROUP);
  db.groupAdmin.findFirst.mockResolvedValue(null);
  db.feedbackLink.count.mockResolvedValue(0);
  db.feedback.count.mockResolvedValue(0);
});

describe("group repo org scoping", () => {
  it("does not return a group to another org", async () => {
    expect((await getGroup(GROUP.id, GROUP.organizationId)).data).toEqual(
      expect.objectContaining(GROUP),
    );
    expect((await getGroup(GROUP.id, "org_globex")).data).toBeNull();
  });

  const mutations: [string, () => Promise<HandleEvent<unknown>>][] = [
    ["updateGroup", () => updateGroup(GROUP.id, "org_globex", { name: "x" })],
    ["deleteGroup", () => deleteGroup(GROUP.id, "org_globex")],
    ["addGroupMember", () => addGroupMember(GROUP.id, "org_globex", "u1")],
    [
      "removeGroupMember",
      () => removeGroupMember(GROUP.id, "org_globex", "u1"),
    ],
    ["addGroupMembers", () => addGroupMembers(GROUP.id, "org_globex", ["u1"])],
    [
      "removeGroupMembers",
      () => removeGroupMembers(GROUP.id, "org_globex", ["u1"]),
    ],
    ["addGroupAdmin", () => addGroupAdmin(GROUP.id, "org_globex", "u1")],
    ["removeGroupAdmin", () => removeGroupAdmin(GROUP.id, "org_globex", "u1")],
  ];

  it.each(mutations)(
    "%s refuses a group id from another org and writes nothing",
    async (_name, call) => {
      const result = await call();

      expect(result).toEqual(
        expect.objectContaining({ success: false, error: "Group not found" }),
      );
      expect(db.group.update).not.toHaveBeenCalled();
      expect(db.group.delete).not.toHaveBeenCalled();
      expect(db.groupAdmin.create).not.toHaveBeenCalled();
      expect(db.groupAdmin.deleteMany).not.toHaveBeenCalled();
    },
  );

  it("refuses a parent group from another org", async () => {
    const result = await updateGroup(GROUP.id, GROUP.organizationId, {
      parentGroupId: "group_globex",
    });

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        error: "Parent group not found",
      }),
    );
    expect(db.group.update).not.toHaveBeenCalled();
  });

  it("scopes the write itself to the org", async () => {
    await updateGroup(GROUP.id, GROUP.organizationId, { name: "Renamed" });

    expect(db.group.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: GROUP.id, organizationId: GROUP.organizationId },
      }),
    );
  });
});
