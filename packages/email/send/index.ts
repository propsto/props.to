import { Resend } from "resend";
import type {
  EmailTemplate,
  EmailTemplateArguments,
  EmailTemplateNames,
  NoArguments,
  Email,
} from "../types";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function send<T extends EmailTemplateNames>(
  email: Email,
  subject: string,
  template: EmailTemplate,
  ...args: NoArguments<T> extends true ? [] : [...EmailTemplateArguments<T>]
): Promise<ReturnType<Resend["emails"]["send"]>> {
  const chosenTemplate = template as (...args: unknown[]) => JSX.Element;

  return await resend.emails.send({
    from: "Props.to <hello@comm.props.to>",
    to: [typeof email === "string" ? email : email.email],
    subject,
    react: chosenTemplate(...args),
  });
}
