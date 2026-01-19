import { type User } from "next-auth";
import {
  createConfig,
  createFormDefaults,
  createStepComponents,
} from "../../../../lib/stepper-utils";
import * as personalStep from "./personal-step";
import * as accountStep from "./account-step";
import * as organizationStep from "./organization-step";
import * as organizationJoinStep from "./organization-join-step";
import * as pendingOrganizationStep from "./pending-organization-step";
import * as completeStep from "./complete-step";

export type { PersonalFormValues } from "./personal-step";
export type { AccountFormValues } from "./account-step";
export type { OrganizationFormValues } from "./organization-step";
export type { OrganizationJoinFormValues } from "./organization-join-step";
export type { PendingOrganizationFormValues } from "./pending-organization-step";
export type { CompleteFormValues } from "./complete-step";

// Organization status:
// - "none": no hostedDomain
// - "exists": org exists for domain
// - "not_exists": org doesn't exist yet for domain
// - "member": user is already a member of the org for their domain
export type OrganizationStatus = "none" | "exists" | "not_exists" | "member";

// Extended user type with Google Workspace fields
export type WelcomeUser = User & {
  role?: string;
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
};

// All steps - always shown in UI
const allSteps = [
  { name: "personal", module: personalStep },
  { name: "account", module: accountStep },
  { name: "organization", module: organizationStep },
  { name: "organization-join", module: organizationJoinStep },
  { name: "pending-organization", module: pendingOrganizationStep },
  { name: "complete", module: completeStep },
];

// Create configurations with all steps
export const formDefaults = createFormDefaults(allSteps);
export const config = createConfig(allSteps);
export const stepComponents = createStepComponents(allSteps);
export const stepNames = allSteps.map(step => step.name);
export type StepNames = (typeof allSteps)[number]["name"];

/**
 * Determines which organization-related step the user should see based on:
 * - hostedDomain: User's Google Workspace domain (if any)
 * - isGoogleWorkspaceAdmin: Whether user is an admin in their workspace
 * - orgStatus: Whether an organization for their domain already exists
 *
 * Flow:
 * - No hostedDomain → skip all org steps
 * - Already a member → skip all org steps
 * - Admin + org doesn't exist → "organization" (create new org)
 * - Admin + org exists → "organization-join" (join as admin)
 * - Non-admin + org exists → "organization-join" (join as member)
 * - Non-admin + org doesn't exist → "pending-organization" (info only)
 */
export function getOrganizationStep(
  user: WelcomeUser,
  orgStatus: OrganizationStatus,
): StepNames | null {
  // No Google Workspace domain - skip org steps
  if (!user.hostedDomain || orgStatus === "none") {
    return null;
  }

  // User is already a member of the organization - skip org steps
  if (orgStatus === "member") {
    return null;
  }

  if (user.isGoogleWorkspaceAdmin) {
    // Admin: create org if doesn't exist, join as admin if exists
    return orgStatus === "not_exists" ? "organization" : "organization-join";
  }

  // Non-admin: join if exists, show pending if doesn't exist
  return orgStatus === "exists" ? "organization-join" : "pending-organization";
}

// Function to check if user can access a specific step
export function canUserAccessStep(
  user: WelcomeUser,
  stepName: string,
  orgStatus: OrganizationStatus,
): boolean {
  switch (stepName) {
    case "personal":
    case "account":
    case "complete":
      return true; // All users can access these steps
    case "organization":
    case "organization-join":
    case "pending-organization": {
      // Only allow access to the correct organization step for this user
      const expectedOrgStep = getOrganizationStep(user, orgStatus);
      return stepName === expectedOrgStep;
    }
    default:
      return false;
  }
}

// Function to get the next step for a user after completing current step
export function getNextStepForUser(
  user: WelcomeUser,
  currentStep: string,
  orgStatus: OrganizationStatus,
): string {
  switch (currentStep) {
    case "personal":
      return "account";
    case "account": {
      // After account, go to appropriate org step or complete
      const orgStep = getOrganizationStep(user, orgStatus);
      return orgStep ?? "complete";
    }
    case "organization":
    case "organization-join":
    case "pending-organization":
      return "complete";
    default:
      return "complete";
  }
}

// Function to check if a step should be skipped for the user
export function shouldSkipStep(
  user: WelcomeUser,
  stepName: string,
  orgStatus: OrganizationStatus,
): boolean {
  if (
    stepName === "organization" ||
    stepName === "organization-join" ||
    stepName === "pending-organization"
  ) {
    const expectedOrgStep = getOrganizationStep(user, orgStatus);
    return stepName !== expectedOrgStep;
  }
  return false;
}

// Get the list of steps to display in the stepper UI for this user
export function getVisibleSteps(
  user: WelcomeUser,
  orgStatus: OrganizationStatus,
): StepNames[] {
  const baseSteps: StepNames[] = ["personal", "account"];
  const orgStep = getOrganizationStep(user, orgStatus);
  if (orgStep) {
    baseSteps.push(orgStep);
  }
  baseSteps.push("complete");
  return baseSteps;
}
