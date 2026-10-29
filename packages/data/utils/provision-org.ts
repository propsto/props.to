// Pure helpers for org provisioning. Kept free of `db` so they can be unit tested.

type Role = "OWNER" | "ADMIN" | "MEMBER";

export type ProvisionPlan = {
  createOrganization: boolean;
  ownerAction: "add" | "promote" | "none";
};

// Idempotence guard: an existing org is never recreated, only its owner is ensured.
export function planOrgProvisioning(state: {
  organizationExists: boolean;
  ownerRole: Role | null;
}): ProvisionPlan {
  if (!state.organizationExists) {
    return { createOrganization: true, ownerAction: "add" };
  }
  if (state.ownerRole === null) {
    return { createOrganization: false, ownerAction: "add" };
  }
  if (state.ownerRole !== "OWNER") {
    return { createOrganization: false, ownerAction: "promote" };
  }
  return { createOrganization: false, ownerAction: "none" };
}

// Normalized domain, as stored at org creation and matched on employee auto-join
export function normalizeHostedDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

// Org-scoped username derived from the email local part, as onboarding does
export function orgUsernameFromEmail(email: string): string | undefined {
  return (
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9_-]/g, "") || undefined
  );
}
