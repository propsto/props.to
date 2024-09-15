import { z } from "zod";

export const SigninFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  signInMethod: z.enum(["credentials", "email"]),
});

export const ResetPasswordFormSchema = SigninFormSchema.pick({ email: true });

export type SigninFormType = z.infer<typeof SigninFormSchema>;
export type ResetPasswordFormType = z.infer<typeof ResetPasswordFormSchema>;
