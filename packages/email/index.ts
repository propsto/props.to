import { Resend } from "resend";
import {
  EmailTemplate,
  EmailTemplateArguments,
  EmailTemplateNames,
  NoArguments,
} from "./types";
import { WelcomeEmailTemplate } from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

type Email = string | { email: string };

async function send<T extends EmailTemplateNames>(
  email: Email,
  subject: string,
  template: EmailTemplate,
  ...args: NoArguments<T> extends true ? [] : EmailTemplateArguments<T>
) {
  const chosenTemplate = template as (...args: any[]) => any;

  return await resend.emails.send({
    from: "Props.to <hello@comm.props.to>",
    to: [typeof email === "string" ? email : email.email],
    subject,
    react: chosenTemplate(...args),
  });
}

export async function sendWelcomeEmail(email: Email) {
  return await send(email, "Welcome to Props.to", WelcomeEmailTemplate);
}
