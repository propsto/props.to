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
    expect(
      inviteRejection(invite, { email: "ana@acme.com" }, null, now),
    ).toBeNull();
  });

  it("accepts a verified personal email", () => {
    const user = {
      email: "other@x.com",
      personalEmail: "ana@acme.com",
      personalEmailVerified: now,
    };
    expect(inviteRejection(invite, user, null, now)).toBeNull();
  });

  it("rejects an unverified personal email", () => {
    const user = {
      email: "other@x.com",
      personalEmail: "ana@acme.com",
      personalEmailVerified: null,
    };
    expect(inviteRejection(invite, user, null, now)).toBe("wrong-account");
  });

  it("rejects a different account", () => {
    expect(
      inviteRejection(invite, { email: "mallory@evil.com" }, null, now),
    ).toBe("wrong-account");
  });

  it("rejects expired, accepted and revoked invites", () => {
    expect(
      inviteRejection(
        { ...invite, expiresAt: now },
        { email: "ana@acme.com" },
        null,
        now,
      ),
    ).toBe("expired");
    expect(
      inviteRejection(
        { ...invite, acceptedAt: now },
        { email: "ana@acme.com" },
        null,
        now,
      ),
    ).toBe("used");
    expect(
      inviteRejection(
        { ...invite, revokedAt: now },
        { email: "ana@acme.com" },
        null,
        now,
      ),
    ).toBe("used");
  });

  describe("company-domain enforcement at acceptance", () => {
    it("accepts an on-domain invite for a Workspace org", () => {
      expect(
        inviteRejection(invite, { email: "ana@acme.com" }, "acme.com", now),
      ).toBeNull();
    });

    it("rejects an off-domain invite already sent, even to its own address", () => {
      // The pilot case: a personal address invited before the policy.
      const personal = { ...invite, email: "hello+member@leog.me" };
      expect(
        inviteRejection(
          personal,
          { email: "hello+member@leog.me" },
          "jugacompany.com",
          now,
        ),
      ).toBe("off-domain");
    });

    it("off-domain takes precedence over wrong-account", () => {
      expect(
        inviteRejection(invite, { email: "mallory@evil.com" }, "juga.com", now),
      ).toBe("off-domain");
    });

    it("still lets used/expired win over off-domain", () => {
      expect(
        inviteRejection(
          { ...invite, revokedAt: now },
          { email: "ana@acme.com" },
          "juga.com",
          now,
        ),
      ).toBe("used");
    });
  });
});
