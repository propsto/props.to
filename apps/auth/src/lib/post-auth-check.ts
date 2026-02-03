import { type User } from "next-auth";
import { createLogger } from "@propsto/logger";
import {
  areAllStepsComplete,
  type OrganizationStatus,
  type LinkAccountStatus,
  type WelcomeUser,
} from "../app/_components/welcome-stepper/steps/step-completion-checks";

const logger = createLogger("auth");

/*
  Once the user logs in, we want to check if they need to go over
  any extra step before going to the app.

  Since this check may be repeated throughout the apps, this check
  was moved here for convenience.

  This function delegates to step-specific completion checks to determine
  if all required steps are complete for the user.
*/
export function canUserMoveOn(
  user: User,
  orgStatus: OrganizationStatus = "none",
  linkStatus: LinkAccountStatus = "none",
): boolean {
  const result = areAllStepsComplete(
    user as WelcomeUser,
    orgStatus,
    linkStatus,
  );
  logger("canUserMoveOn", { user, orgStatus, linkStatus, result });
  return result;
}
