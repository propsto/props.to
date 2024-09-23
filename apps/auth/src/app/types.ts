import { z } from "zod";

export const SigninFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().nullish(),
  signInMethod: z.enum(["credentials", "email"]),
});

export const resetPasswordFormSchema = SigninFormSchema.pick({ email: true });

export type SigninFormType = z.infer<typeof SigninFormSchema>;
export type ResetPasswordFormType = z.infer<typeof resetPasswordFormSchema>;

export const newPasswordFormSchema = z.object({
  password: z.string(),
  repeatPassword: z.string(),
  token: z.string(),
});

export type NewPasswordFormType = z.infer<typeof newPasswordFormSchema>;
