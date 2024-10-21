import { z } from "zod";

export const RequestEarlyAccessFormSchema = z.object({
  "First Name": z
    .string({ required_error: "First name is required" })
    .min(1, { message: "You must enter a valid first name" }),
  "Last Name": z
    .string({ required_error: "Last name is required" })
    .min(1, { message: "You must enter a valid last name" }),
  Email: z.string().email("Please enter a valid email.").trim(),
  Description: z.string().optional(),
});

export type RequestEarlyAccessFormType = z.infer<
  typeof RequestEarlyAccessFormSchema
>;
