import { describe, expect, it } from "vitest";
import {
  normalizeHostedDomain,
  orgUsernameFromEmail,
  planOrgProvisioning,
} from "./provision-org";

describe("planOrgProvisioning", () => {
  it("creates the org and adds the owner when no org exists", () => {
    expect(
      planOrgProvisioning({ organizationExists: false, ownerRole: null }),
    ).toEqual({ createOrganization: true, ownerAction: "add" });
  });

  it("never recreates an existing org and adds a missing owner", () => {
    expect(
      planOrgProvisioning({ organizationExists: true, ownerRole: null }),
    ).toEqual({ createOrganization: false, ownerAction: "add" });
  });

  it("promotes an existing non-owner member", () => {
    for (const ownerRole of ["ADMIN", "MEMBER"] as const) {
      expect(
        planOrgProvisioning({ organizationExists: true, ownerRole }),
      ).toEqual({ createOrganization: false, ownerAction: "promote" });
    }
  });

  it("does nothing on a re-run once the owner is in place", () => {
    expect(
      planOrgProvisioning({ organizationExists: true, ownerRole: "OWNER" }),
    ).toEqual({ createOrganization: false, ownerAction: "none" });
  });
});

describe("provisioning normalizers", () => {
  it("normalizes the hosted domain", () => {
    expect(normalizeHostedDomain("  Props.TO ")).toBe("props.to");
  });

  it("derives the org username from the email local part", () => {
    expect(orgUsernameFromEmail("Leo.G+x@props.to")).toBe("leogx");
    expect(orgUsernameFromEmail("@props.to")).toBeUndefined();
  });
});
