import { describe, expect, it, vi } from "vitest";
import { needsModeration } from "./feedback-policy";

vi.mock("@propsto/data/repos", () => ({}));

describe("needsModeration", () => {
  it("holds everything when moderation is on (the default)", () => {
    expect(needsModeration(undefined, true)).toBe(true);
    expect(needsModeration({ enableFeedbackModeration: true }, true)).toBe(
      true,
    );
  });

  it("auto-approves members when moderation is off", () => {
    expect(needsModeration({ enableFeedbackModeration: false }, true)).toBe(
      false,
    );
  });

  it("keeps members pending when auto-approve is off", () => {
    expect(
      needsModeration(
        { enableFeedbackModeration: false, autoApproveInternalFeedback: false },
        true,
      ),
    ).toBe(true);
  });

  it("always keeps external feedback pending", () => {
    expect(
      needsModeration(
        { enableFeedbackModeration: false, autoApproveInternalFeedback: true },
        false,
      ),
    ).toBe(true);
  });
});
