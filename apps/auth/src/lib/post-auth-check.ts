import { type User } from "next-auth";
import { createLogger } from "@propsto/logger";

const logger = createLogger("auth");

/* 
  Once the user logs in, we want to check if they need to go over
  any extra step before going to the app.

  Since this check may be repeated throughout the apps, this check
  was moved here for convenience
*/
export function canUserMoveOn(user: User): boolean {
  const result = Boolean(
    user.firstName &&
      user.lastName &&
      user.image &&
      user.dateOfBirth &&
      user.username &&
      user.username.length < 41, // username is autoassigned at first, we need the user to choose one before moving on
  );
  logger("canUserMoveOn", { user, result });
  return result;
}
