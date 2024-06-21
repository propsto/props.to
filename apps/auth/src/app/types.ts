import { z } from "zod";

export const SignupFormSchema = z.object({
  name: z.string().min(5, "Please enter a name with at least 5 characters."),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(8, "Password must not be lesser than 8 characters"),
});

export const SigninFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type SignUpFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SignInFormState =
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
