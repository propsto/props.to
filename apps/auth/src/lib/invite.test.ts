import { describe, expect, it } from "vitest";
import { inviteRejection } from "./invite";

const now = new Date("2026-09-20T12:00:00Z");
const invite = {
  email: "Ana@Acme.com",
  expiresAt: new Date("2026-09-21T12:00:00Z"),
  acceptedAt: null,
  revokedAt: null,
};

describe("inviteRejection", () => {
  it("accepts the invited work email regardless of case", () => {
    expect(inviteRejection(invite, { email: "ana@acme.com" }, now)).toBeNull();
  });

  it("accepts a verified personal email", () => {
    const user = { email: "other@x.com", personalEmail: "ana@acme.com", personalEmailVerified: now };
    expect(inviteRejection(invite, user, now)).toBeNull();
  });

  it("rejects an unverified personal email", () => {
    const user = { email: "other@x.com", personalEmail: "ana@acme.com", personalEmailVerified: null };
    expect(inviteRejection(invite, user, now)).toBe("wrong-account");
  });

  it("rejects a different account", () => {
    expect(inviteRejection(invite, { email: "mallory@evil.com" }, now)).toBe("wrong-account");
  });

  it("rejects expired, accepted and revoked invites", () => {
    expect(inviteRejection({ ...invite, expiresAt: now }, { email: "ana@acme.com" }, now)).toBe("expired");
    expect(inviteRejection({ ...invite, acceptedAt: now }, { email: "ana@acme.com" }, now)).toBe("used");
    expect(inviteRejection({ ...invite, revokedAt: now }, { email: "ana@acme.com" }, now)).toBe("used");
  });
});
