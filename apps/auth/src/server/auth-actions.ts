"use server";

import { type SubmitButtonProps } from "@propsto/ui/molecules";
import { signIn } from "./auth";

async function sleep(milliseconds: number): Promise<void> {
  const ok = await Promise.resolve(true);
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds && ok);
}

export async function signUpAction(
  prevState: SubmitButtonProps,
  formData: FormData
): Promise<SubmitButtonProps> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Temporary
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };
  await sleep(5000);
  // mutate data
  //revalidatePath("/");
  return {
    message: "Signed up successfully",
    iconName: "Success",
  };
}

export async function signInAction(formData: FormData): Promise<never> {
  const provider = formData.get("provider") as string;
  return signIn(provider);
}
