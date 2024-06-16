import { z } from "zod";

export const SignupFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
});

export const SigninFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
    }
  | undefined;

export interface SessionPayload {
  userId: string | number;
  expiresAt: Date;
}
