import { z } from "zod";

export const RequestEarlyAccessFormSchema = z.object({
  firstName: z
    .string()
    .min(5, "Your first name must have at least 5 characters"),
  lastName: z.string().min(5, "Your last name must have at least 5 characters"),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  projectDetails: z
    .string()
    .min(50, "Your project details must have at least 50 characters"),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
    }
  | undefined;
