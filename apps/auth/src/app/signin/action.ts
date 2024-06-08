"use server";

import { SubmitButtonProps } from "@propsto/ui/molecules/submit-button";
import { signIn } from "@/server/auth";

async function sleep(milliseconds: number): Promise<void> {
  const ok = await Promise.resolve(true);
  const date = Date.now();
  let currentDate: number | null = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds && ok);
}

export async function signInAction(
  prevState: SubmitButtonProps,
  formData: FormData
): Promise<SubmitButtonProps> {
  sleep(3000);
  if (!formData.get("email")) {
    return {
      retry: prevState.retry + 1,
      message: "Email missing!",
      iconName: "Failure",
      variant: "error",
    };
  }
  await signIn("resend", formData);
  return {
    retry: 0,
    message: "Welcome!",
    iconName: "Success",
  };
}
