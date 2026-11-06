import { describe, expect, it } from "vitest";
import { emailMatchesDomain, mayAutoJoinByDomain } from "./domain-membership";

describe("emailMatchesDomain", () => {
  it("matches the org's verified domain, case/space-insensitively", () => {
    expect(emailMatchesDomain("Leo@Juga.com", "juga.com")).toBe(true);
    expect(emailMatchesDomain("  leo@juga.com  ", " JUGA.com ")).toBe(true);
  });

  it("rejects a personal address and look-alike domains", () => {
    // The invite that prompted this: a personal address into a company org
    expect(emailMatchesDomain("hello+member@leog.me", "jugacompany.com")).toBe(
      false,
    );
    expect(emailMatchesDomain("leo@notjuga.com", "juga.com")).toBe(false); // substring, not the domain
    expect(emailMatchesDomain("leo@sub.juga.com", "juga.com")).toBe(false); // subdomain, not the domain
  });

  it("matches nothing when the org has no verified domain", () => {
    expect(emailMatchesDomain("leo@juga.com", null)).toBe(false);
    expect(emailMatchesDomain("leo@juga.com", "")).toBe(false);
  });
});

describe("mayAutoJoinByDomain", () => {
  it("lets Workspace admins in regardless of the toggle", () => {
    expect(
      mayAutoJoinByDomain({
        autoJoinByDomain: false,
        isGoogleWorkspaceAdmin: true,
      }),
    ).toBe(true);
  });

  it("gates everyone else on the org opting in", () => {
    expect(
      mayAutoJoinByDomain({
        autoJoinByDomain: false,
        isGoogleWorkspaceAdmin: false,
      }),
    ).toBe(false);
    expect(
      mayAutoJoinByDomain({
        autoJoinByDomain: true,
        isGoogleWorkspaceAdmin: false,
      }),
    ).toBe(true);
  });
});
