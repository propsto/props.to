"use server";

import { SubmitButtonProps } from "@propsto/ui/molecules/submit-button";

async function sleep(milliseconds: number): Promise<void> {
  const ok = await Promise.resolve(true);
  const date = Date.now();
  let currentDate: number | null = null;
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
    retry: 0,
    message: "Signed up successfully",
    iconName: "Success",
  };
}
