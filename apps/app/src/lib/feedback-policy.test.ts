import { describe, expect, it, vi } from "vitest";
import {
  getOrganizationSettings,
  getUserOrganizationMembership,
  hasOtherOrgAdmin,
} from "@propsto/data/repos";
import {
  feedbackRefusal,
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

describe("showsRecipientLevel", () => {
  const orgLink = { organizationId: "org", groupId: null };

  it("shows the level to a member on a person's org link", () => {
    expect(showsRecipientLevel(orgLink, { isMember: true })).toBe(true);
  });

  it("hides it from outsiders, even when the org takes external feedback", () => {
    expect(showsRecipientLevel(orgLink, { isMember: false })).toBe(false);
  });

  it("hides it on group links and personal links", () => {
    expect(
      showsRecipientLevel(
        { organizationId: "org", groupId: "g" },
        { isMember: true },
      ),
    ).toBe(false);
    expect(
      showsRecipientLevel(
        { organizationId: null, groupId: null },
        { isMember: true },
      ),
    ).toBe(false);
  });

  it("hides it on entity links: there is no person", () => {
    expect(
      showsRecipientLevel(
        { organizationId: "org", groupId: null, entityId: "e" },
        { isMember: true },
      ),
    ).toBe(false);
  });
});

describe("entity link policy", () => {
  const entityLink = { organizationId: "org", userId: null, entityId: "e" };
  // The strictest member settings: members only, no anonymous
  const strict = {
    data: {
      feedbackSettings: { allowAnonymousFeedback: false },
      defaultUserSettings: { allowExternalFeedback: false },
    },
  } as never;
  const member = { data: { role: "MEMBER" } } as never;

  it("takes anyone, signed out and anonymous, whatever the member settings", async () => {
    vi.mocked(getOrganizationSettings).mockResolvedValueOnce(strict);
    const policy = await getFeedbackPolicy(entityLink);
    expect(feedbackRefusal(policy, true)).toBeNull();
    expect(feedbackRefusal(policy, false)).toBeNull();
  });

  it("holds every outsider's submission for moderation", async () => {
    vi.mocked(getOrganizationSettings).mockResolvedValueOnce({
      data: {
        feedbackSettings: { enableFeedbackModeration: false },
      },
    } as never);
    expect((await getFeedbackPolicy(entityLink, "visitor")).moderated).toBe(
      true,
    );
  });

  it("lets members through as on other links, with no recipient check", async () => {
    vi.mocked(hasOtherOrgAdmin).mockClear();
    vi.mocked(getUserOrganizationMembership).mockResolvedValueOnce(member);
    const policy = await getFeedbackPolicy(entityLink, "mike");
    expect(policy.moderated).toBe(false);
    expect(hasOtherOrgAdmin).not.toHaveBeenCalled();
  });

  it("still honours the org switching feedback off", async () => {
    vi.mocked(getOrganizationSettings).mockResolvedValueOnce({
      data: { feedbackSettings: { enableOrganizationFeedback: false } },
    } as never);
    expect(feedbackRefusal(await getFeedbackPolicy(entityLink), true)).toBe(
      "Feedback is disabled for this organization",
    );
  });
});

describe("feedbackRefusal on other links is unchanged", () => {
  it("keeps member links members-only and named by default", async () => {
    vi.mocked(hasOtherOrgAdmin).mockResolvedValue({ data: true } as never);
    const policy = await getFeedbackPolicy({
      organizationId: "org",
      userId: "john",
    });
    expect(feedbackRefusal(policy, false)).toBe(
      "Only members of this organization can give feedback here",
    );
    expect(feedbackRefusal({ ...policy, isMember: true }, true)).toBe(
      "Anonymous feedback is not allowed for this organization",
    );
  });

  it("leaves personal links open", async () => {
    const policy = await getFeedbackPolicy({
      organizationId: null,
      userId: "john",
    });
    expect(feedbackRefusal(policy, true)).toBeNull();
  });
});
