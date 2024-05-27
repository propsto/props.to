/* eslint-disable @typescript-eslint/require-await -- Server actions must be async functions */
"use server";

import { signIn } from "./auth";

export interface SignUpFormStateProps {
  message: string;
  code: number;
}

function sleep(milliseconds: number) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

export async function signUpAction(
  prevState: SignUpFormStateProps,
  formData: FormData
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Temporary
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };
  sleep(5000);
  // mutate data
  //revalidatePath("/");
  return { message: "Signed up successfully", code: 200 };
}

export async function signInAction(formData: FormData) {
  const provider = formData.get("provider") as string;
  return signIn(provider);
}
