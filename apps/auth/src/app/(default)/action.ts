"use server";

import * as z from "zod";
import logger from "@propsto/logger?auth";
import { signIn } from "@/server/auth";
import { type FormState } from "../types";

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
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await sleep(3000);
  const { success, error } = formSchema.safeParse({
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
