import { describe, expect, it, vi } from "vitest";
import { hasOtherOrgAdmin } from "@propsto/data/repos";
import {
  getFeedbackPolicy,
  needsModeration,
  showsRecipientLevel,
} from "./feedback-policy";

vi.mock("@propsto/data/repos", () => ({
  getOrganizationSettings: vi.fn(async () => ({ data: null })),
  getUserOrganizationMembership: vi.fn(async () => ({ data: null })),
  hasOtherOrgAdmin: vi.fn(),
}));

describe("getFeedbackPolicy moderation fallback", () => {
  const link = { organizationId: "org", userId: "owner" };

  it("holds feedback when another admin can moderate it", async () => {
    vi.mocked(hasOtherOrgAdmin).mockResolvedValue({ data: true } as never);
    expect((await getFeedbackPolicy(link)).moderated).toBe(true);
  });

  it("approves feedback to an org's only admin instead of stranding it", async () => {
    vi.mocked(hasOtherOrgAdmin).mockResolvedValue({ data: false } as never);
    expect((await getFeedbackPolicy(link)).moderated).toBe(false);
  });
});

describe("needsModeration", () => {
  it("auto-approves members by default (moderation and auto-approve on)", () => {
    expect(needsModeration(undefined, true)).toBe(false);
    expect(
      needsModeration(
        { enableFeedbackModeration: true, autoApproveInternalFeedback: true },
        true,
      ),
    ).toBe(false);
  });

  it("holds members when moderation is on and auto-approve is off", () => {
    expect(
      needsModeration(
        { enableFeedbackModeration: true, autoApproveInternalFeedback: false },
        true,
      ),
    ).toBe(true);
  });

  it("publishes members when moderation is off", () => {
    expect(
      needsModeration(
        { enableFeedbackModeration: false, autoApproveInternalFeedback: false },
        true,
      ),
    ).toBe(false);
  });

  it("always keeps external feedback pending", () => {
    expect(needsModeration(undefined, false)).toBe(true);
    expect(
      needsModeration(
        { enableFeedbackModeration: false, autoApproveInternalFeedback: true },
        false,
      ),
    ).toBe(true);
  });
});
