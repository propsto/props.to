import { type User } from "next-auth";
import {
  createConfig,
  createFormDefaults,
  createStepComponents,
} from "../../../../lib/stepper-utils";
import * as personalStep from "./personal-step";
import * as accountStep from "./account-step";
import * as organizationStep from "./organization-step";
import * as completeStep from "./complete-step";

export type { PersonalFormValues } from "./personal-step";
export type { AccountFormValues } from "./account-step";
export type { OrganizationFormValues } from "./organization-step";
export type { CompleteFormValues } from "./complete-step";

// All steps - always shown in UI
const allSteps = [
  { name: "personal", module: personalStep },
  { name: "account", module: accountStep },
  { name: "organization", module: organizationStep },
  { name: "complete", module: completeStep },
];

// Create configurations with all steps
export const formDefaults = createFormDefaults(allSteps);
export const config = createConfig(allSteps);
export const stepComponents = createStepComponents(allSteps);
export const stepNames = allSteps.map(step => step.name);
export type StepNames = (typeof allSteps)[number]["name"];

// Function to check if user can access a specific step
export function canUserAccessStep(user: User & { role?: string }, stepName: string): boolean {
  switch (stepName) {
    case "personal":
    case "account":
    case "complete":
      return true; // All users can access these steps
    case "organization":
      return user.role === "ORGANIZATION_ADMIN"; // Only org admins can access organization step
    default:
      return false;
  }
}

// Function to get the next step for a user after completing current step
export function getNextStepForUser(user: User & { role?: string }, currentStep: string): string {
  switch (currentStep) {
    case "personal":
      return "account";
    case "account":
      // Skip organization step for non-org admins
      return user.role === "ORGANIZATION_ADMIN" ? "organization" : "complete";
    case "organization":
      return "complete";
    default:
      return "complete";
  }
}

// Function to check if a step should be skipped for the user
export function shouldSkipStep(user: User & { role?: string }, stepName: string): boolean {
  return stepName === "organization" && user.role !== "ORGANIZATION_ADMIN";
}