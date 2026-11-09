import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NOT_ORG_ADMIN,
  NOT_SIGNED_IN,
  ok,
  withOrgAdmin,
} from "./with-org-admin";

const repos = vi.hoisted(() => ({
  verifyOrgAdminAccess: vi.fn(),
  createAuditLog: vi.fn(),
}));
const auth = vi.hoisted(() => vi.fn());

vi.mock("@propsto/data/repos", () => repos);
vi.mock("@/server/auth.server", () => ({ auth }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ user: { id: "user_1", name: " Ada " } });
  repos.verifyOrgAdminAccess.mockResolvedValue({
    success: true,
    data: { role: "ADMIN", organization: { id: "org_1", name: "Acme" } },
  });
});

describe("withOrgAdmin", () => {
  it("refuses a signed-out caller without checking membership", async () => {
    auth.mockResolvedValue(null);
    const fn = vi.fn();

    const result = await withOrgAdmin("acme", fn);

    expect(result).toEqual({ success: false, error: NOT_SIGNED_IN });
    expect(repos.verifyOrgAdminAccess).not.toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("refuses a caller who is not an OWNER or ADMIN of the org", async () => {
    repos.verifyOrgAdminAccess.mockResolvedValue({
      success: true,
      data: null,
    });
    const fn = vi.fn();

    const result = await withOrgAdmin("acme", fn);

    expect(repos.verifyOrgAdminAccess).toHaveBeenCalledWith("user_1", "acme");
    expect(result).toEqual({ success: false, error: NOT_ORG_ADMIN });
    expect(fn).not.toHaveBeenCalled();
  });

  it("runs the action with the admin's context and returns its result", async () => {
    const result = await withOrgAdmin("acme", async ctx => {
      expect(ctx).toMatchObject({
        userId: "user_1",
        userName: "Ada",
        role: "ADMIN",
        org: { id: "org_1", name: "Acme" },
      });
      return ok({ answer: 42 });
    });

    expect(result).toEqual({ success: true, data: { answer: 42 } });
  });

  it("audits against the admin's org with the admin as actor", async () => {
    await withOrgAdmin("acme", async ({ audit }) => {
      await audit("VALUE_CREATED", { type: "value", id: "v_1" }, { name: "X" });
      return ok();
    });

    expect(repos.createAuditLog).toHaveBeenCalledWith({
      organizationId: "org_1",
      actorId: "user_1",
      action: "VALUE_CREATED",
      resourceType: "value",
      resourceId: "v_1",
      details: { name: "X" },
    });
  });
});
