"use server";

import { logger } from "@propsto/logger?auth";
import { constOther } from "@propsto/constants";
import { getUserByEmail } from "@propsto/data/repos";
import { signIn } from "@/server/auth";
import { type SigninFormType, SigninFormSchema } from "./types";

export async function signInAction(
  prevState: PropstoFormState<SigninFormType>,
  formData: FormData
): Promise<PropstoFormState<SigninFormType>> {
  const { success, error, data } = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    signInMethod: formData.get("signInMethod"),
  });
  if (!success) {
    logger("signUpAction", error.flatten());
    return {
      errors: error.flatten().fieldErrors,
    };
  }
  if (!data.password && data.signInMethod === "credentials") {
    const user = await getUserByEmail(data, { password: true });
    if (user.data) {
      if (user.data.password) {
        // TODO
      }
    } else {
      // TODO
    }
  }
  await signIn(
    data.signInMethod === "email" && constOther.emailProvider === "resend"
      ? "resend"
      : "email",
    data
  );
}
