"use server";

import { createUser, checkUserExistance } from "@propsto/data/repos";
import { sendWelcomeEmail } from "@propsto/email";
import logger from "@propsto/logger?auth";
import { type SignUpFormState, SignupFormSchema } from "../types";

export async function signUpAction(
  state: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
  // Parse the form data against expected schema
  const { data, success, error } = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!success) {
    logger("signUpAction %O", error.flatten().fieldErrors);
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  // Check user doesn't exist yet before creating
  const existingUser = await checkUserExistance(data);
  if (existingUser.data) {
    logger("signUpAction", { existingUser });
    return {
      message: "Email already exists, please use a different email or login.",
    };
  }

  // Proceed to create the user since it doesn't exist
  const newUser = await createUser(data);
  if (!newUser.success) {
    logger("signUpAction", { newUser });
    return {
      message: newUser.error,
    };
  }

  // End process with email
  await sendWelcomeEmail(data);
}
