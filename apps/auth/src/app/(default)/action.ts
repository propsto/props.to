"use server";

import logger from "@propsto/logger?auth";
import { signIn } from "@/server/auth";
import { type SigninFormType, SigninFormSchema } from "./types";

export async function signInAction(
  prevState: PropstoFormState<SigninFormType>,
  formData: FormData
): Promise<PropstoFormState<SigninFormType>> {
  await new Promise((resolve) => {
    // TODO Remove delay
    setTimeout(resolve, 5000);
  });
  const { success, error } = SigninFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!success) {
    logger("signUpAction", error.flatten().fieldErrors);
    return {
      errors: error.flatten().fieldErrors,
    };
  }
  await signIn("resend", formData);
}
