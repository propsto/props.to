import { type User } from "next-auth";
import {
  createConfig,
  createFormDefaults,
  createStepComponents,
} from "../../../../lib/stepper-utils";
import * as linkAccountStep from "./link-account-step";
import * as personalStep from "./personal-step";
import * as accountStep from "./account-step";
import * as personalEmailStep from "./personal-email-step";
import * as organizationStep from "./organization-step";
import * as organizationJoinStep from "./organization-join-step";
import * as pendingOrganizationStep from "./pending-organization-step";
import * as completeStep from "./complete-step";

// Import server-compatible step completion checks and types
export {
  stepCompletionChecks,
  isLinkAccountStepComplete,
  isPersonalStepComplete,
  isAccountStepComplete,
  isPersonalEmailStepComplete,
  isOrganizationStepComplete,
  isOrganizationJoinStepComplete,
  isPendingOrganizationStepComplete,
  isCompleteStepComplete,
  getOrganizationStep,
  areAllStepsComplete,
  type WelcomeUser,
  type OrganizationStatus,
  type LinkAccountStatus,
} from "./step-completion-checks";

import {
  stepCompletionChecks as completionChecks,
  getOrganizationStep,
  type WelcomeUser,
  type OrganizationStatus,
  type LinkAccountStatus,
} from "./step-completion-checks";

export type { LinkAccountFormValues } from "./link-account-step";
export type { PersonalFormValues } from "./personal-step";
export type { AccountFormValues } from "./account-step";
export type { PersonalEmailFormValues } from "./personal-email-step";
export type { OrganizationFormValues } from "./organization-step";
export type { OrganizationJoinFormValues } from "./organization-join-step";
export type { PendingOrganizationFormValues } from "./pending-organization-step";
export type { CompleteFormValues } from "./complete-step";

// All steps - link-account is conditional (first step when linking is needed)
// personal-email is for Google Workspace users only (after account, before org steps)
const allSteps = [
  { name: "link-account", module: linkAccountStep },
  { name: "personal", module: personalStep },
  { name: "account", module: accountStep },
  { name: "personal-email", module: personalEmailStep },
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

// Note: getOrganizationStep is now imported from step-completion-checks.ts
// and re-exported above to avoid pulling React dependencies

// Function to check if user can access a specific step
export function canUserAccessStep(
  user: WelcomeUser,
  stepName: string,
  orgStatus: OrganizationStatus,
  linkStatus: LinkAccountStatus = "none",
): boolean {
  switch (stepName) {
    case "link-account":
      // Only accessible when account linking is pending
      return linkStatus === "pending";
    case "personal":
    case "account":
    case "complete":
      return true; // All users can access these steps
    case "personal-email":
      // Only accessible for Google Workspace users
      return Boolean(user.hostedDomain);
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
    case "link-account":
      // After linking account, continue with personal step
      return "personal";
    case "personal":
      return "account";
    case "account": {
      // After account, Google Workspace users go to personal-email step
      if (user.hostedDomain) {
        return "personal-email";
      }
      // Non-Google Workspace users go straight to complete
      return "complete";
    }
    case "personal-email": {
      // After personal email, go to appropriate org step or complete
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
  linkStatus: LinkAccountStatus = "none",
): boolean {
  // Link account step is skipped when not pending
  if (stepName === "link-account") {
    return linkStatus !== "pending";
  }
  // Personal email step is skipped for non-Google Workspace users
  if (stepName === "personal-email") {
    return !user.hostedDomain;
  }
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
  linkStatus: LinkAccountStatus = "none",
): StepNames[] {
  const steps: StepNames[] = [];

  // Link account step comes first when pending
  if (linkStatus === "pending") {
    steps.push("link-account");
  }

  // Always include personal and account steps
  steps.push("personal", "account");

  // Google Workspace users get the personal-email step
  if (user.hostedDomain) {
    steps.push("personal-email");
  }

  // Add appropriate org step if applicable
  const orgStep = getOrganizationStep(user, orgStatus);
  if (orgStep) {
    steps.push(orgStep);
  } else if (orgStatus === "member" && user.hostedDomain) {
    // User already completed an org step - show it in the trail
    // Determine which step based on their role: owners created the org, others joined
    const userOrgRole = user.organizations?.find(
      org => org.organizationSlug, // Has at least one org
    )?.role;
    if (userOrgRole === "OWNER") {
      // User created the organization
      steps.push("organization");
    } else if (userOrgRole) {
      // User joined an existing organization
      steps.push("organization-join");
    }
  }

  // Always end with complete
  steps.push("complete");

  return steps;
}

// Note: areAllStepsComplete is now imported from step-completion-checks.ts
// and re-exported above to avoid pulling React dependencies when imported externally
