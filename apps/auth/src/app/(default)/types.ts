import * as z from "zod";

export const SigninFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type SigninFormType = z.infer<typeof SigninFormSchema>;
