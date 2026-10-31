import { describe, expect, it, vi } from "vitest";
import { getConversationViewerContext } from "@propsto/data/repos";
import {
  canAddStage,
  getConversationAccess,
  redactConversation,
  resolveConversationAccess,
} from "./conversation-access";

vi.mock("@propsto/data/repos", () => ({
  getConversationViewerContext: vi.fn(),
}));

const SUBJECT = "subject";

describe("resolveConversationAccess", () => {
  it("lets the subject read shared fields only", () => {
    const access = resolveConversationAccess(SUBJECT, SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: false,
    });
    expect(access).toMatchObject({
      isSubject: true,
      canRead: true,
      canReadInternal: false,
      canWrite: false,
    });
  });

  it("keeps an admin subject to shared fields on their own conversations", () => {
    const access = resolveConversationAccess(SUBJECT, SUBJECT, {
      orgRole: "OWNER",
      leadsSubject: false,
    });
    expect(access.canReadInternal).toBe(false);
    expect(access.canWrite).toBe(false);
    expect(access.canCreateFinal).toBe(false);
  });

  it("lets a lead read everything and write, but not escalate to final", () => {
    const access = resolveConversationAccess("lead", SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: true,
    });
    expect(access).toMatchObject({
      canRead: true,
      canReadInternal: true,
      canWrite: true,
      canCreateFinal: false,
    });
    expect(canAddStage(access, "DIRECT")).toBe(true);
    expect(canAddStage(access, "REPEATED")).toBe(true);
    expect(canAddStage(access, "FINAL")).toBe(false);
  });

  it.each(["ADMIN", "OWNER"] as const)(
    "lets an org %s do everything",
    orgRole => {
      const access = resolveConversationAccess("admin", SUBJECT, {
        orgRole,
        leadsSubject: false,
      });
      expect(access.canReadInternal).toBe(true);
      expect(canAddStage(access, "FINAL")).toBe(true);
    },
  );

  it("gives a member who does not lead the subject nothing", () => {
    const access = resolveConversationAccess("peer", SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: false,
    });
    expect(access.canRead).toBe(false);
    expect(canAddStage(access, "DIRECT")).toBe(false);
  });

  it("gives a non-member nothing, even as the subject", () => {
    expect(
      resolveConversationAccess(SUBJECT, SUBJECT, {
        orgRole: null,
        leadsSubject: false,
      }).canRead,
    ).toBe(false);
    expect(
      resolveConversationAccess("former-lead", SUBJECT, {
        orgRole: null,
        leadsSubject: true,
      }).canRead,
    ).toBe(false);
  });
});

describe("getConversationAccess", () => {
  it("fails closed when the lookup fails", async () => {
    vi.mocked(getConversationViewerContext).mockResolvedValue({
      success: false,
      data: undefined,
      error: "boom",
    } as never);
    const access = await getConversationAccess("admin", "org", SUBJECT);
    expect(access.canRead).toBe(false);
  });

  it("resolves from the loaded context", async () => {
    vi.mocked(getConversationViewerContext).mockResolvedValue({
      success: true,
      data: { orgRole: "MEMBER", leadsSubject: true },
    } as never);
    const access = await getConversationAccess("lead", "org", SUBJECT);
    expect(access.canWrite).toBe(true);
    expect(access.canCreateFinal).toBe(false);
  });
});

describe("redactConversation", () => {
  const conversation = {
    id: "c1",
    steps: [
      { sharedNote: "shared", internalNote: "internal" },
      { sharedNote: "shared 2", internalNote: null },
    ],
  };

  it("removes internal notes for the subject", () => {
    const access = resolveConversationAccess(SUBJECT, SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: false,
    });
    const redacted = redactConversation(conversation, access);
    expect(redacted?.steps.map(s => s.internalNote)).toEqual([null, null]);
    expect(redacted?.steps[0].sharedNote).toBe("shared");
    // The original is untouched
    expect(conversation.steps[0].internalNote).toBe("internal");
  });

  it("keeps internal notes for a lead", () => {
    const access = resolveConversationAccess("lead", SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: true,
    });
    expect(
      redactConversation(conversation, access)?.steps[0].internalNote,
    ).toBe("internal");
  });

  it("returns null for someone who may not read", () => {
    const access = resolveConversationAccess("peer", SUBJECT, {
      orgRole: "MEMBER",
      leadsSubject: false,
    });
    expect(redactConversation(conversation, access)).toBeNull();
  });
});
