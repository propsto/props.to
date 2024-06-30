import * as z from "zod";

export const SigninFormSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    signInMethod: z.enum(["credentials", "email"]),
  })
  .refine(
    (data) => data.signInMethod === "email" || data.password,
    "Password is required, must be at least 8 characters"
  );

export type SigninFormType = z.infer<typeof SigninFormSchema>;
