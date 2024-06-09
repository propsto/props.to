"use server";

import { type SubmitButtonProps } from "@propsto/ui/molecules/submit-button";
import * as z from "zod";
import { createUser } from "@propsto/data/repos";
import { sendWelcomeEmail } from "@propsto/email";

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

export async function signUpAction(
  prevState: SubmitButtonProps,
  formData: FormData
): Promise<SubmitButtonProps> {
  await sleep(3000);
  const { success, error, data } = formSchema.safeParse({
    email: formData.get("email"),
  });
  if (!success) {
    return {
      retry: prevState.retry + 1,
      message: error.issues[0].message,
      iconName: "Failure",
      variant: "error",
    };
  }
  await createUser(data); // TODO try/catch, show error w/code in docs
  await sendWelcomeEmail(data); // TODO try/catch, show error w/code in docs
  return {
    retry: 0,
    message: `Signed up successfully`,
    iconName: "Success",
  };
}
