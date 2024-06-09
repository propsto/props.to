"use server";

import { type SubmitButtonProps } from "@propsto/ui/molecules/submit-button";
import * as z from "zod";
import { signIn } from "@/server/auth";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

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
  await sleep(3000);
  const { success, error } = formSchema.safeParse({
    email: formData.get("email"),
  });
  if (!success)
    return {
      retry: prevState.retry + 1,
      message: error.issues[0].message,
      iconName: "Failure",
      variant: "error",
    };
  await signIn("resend", formData);
  return {
    retry: 0,
    message: "Welcome!",
    iconName: "Success",
  };
}
