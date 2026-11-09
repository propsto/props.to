import { describe, expect, it } from "vitest";
import {
  inviteBatchError,
  isModerationDecision,
  MAX_INVITE_EMAILS,
  MAX_INVITE_MESSAGE,
} from "./admin-input";

const emails = (n: number) =>
  Array.from({ length: n }, (_, i) => `person${i}@example.com`);

describe("inviteBatchError", () => {
  it("accepts a batch at the cap with a message at the cap", () => {
    expect(
      inviteBatchError(
        emails(MAX_INVITE_EMAILS),
        "x".repeat(MAX_INVITE_MESSAGE),
      ),
    ).toBeNull();
  });

  it("accepts a batch without a message", () => {
    expect(inviteBatchError(emails(3), undefined)).toBeNull();
  });

  it("refuses a batch over the cap", () => {
    expect(inviteBatchError(emails(MAX_INVITE_EMAILS + 1), undefined)).toMatch(
      /at most/,
    );
  });

  it("does not count blank entries toward the cap", () => {
    expect(
      inviteBatchError([...emails(MAX_INVITE_EMAILS), " ", ""], undefined),
    ).toBeNull();
  });

  it("refuses a message over the cap", () => {
    expect(
      inviteBatchError(emails(1), "x".repeat(MAX_INVITE_MESSAGE + 1)),
    ).toMatch(/characters or fewer/);
  });

  it("refuses input that is not a list of strings", () => {
    expect(inviteBatchError("a@example.com", undefined)).not.toBeNull();
    expect(inviteBatchError([1, 2], undefined)).not.toBeNull();
    expect(inviteBatchError(emails(1), 42)).not.toBeNull();
  });
});

describe("isModerationDecision", () => {
  it("accepts approve and reject only", () => {
    expect(isModerationDecision("approve")).toBe(true);
    expect(isModerationDecision("reject")).toBe(true);
    for (const value of ["Approve", "delete", "", null, undefined, 1]) {
      expect(isModerationDecision(value)).toBe(false);
    }
  });
});
