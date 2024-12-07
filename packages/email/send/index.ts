import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";
import { logger } from "@propsto/logger?email";
import { constServer } from "@propsto/constants/server";
import { createTransport } from "nodemailer";
import { render } from "@react-email/components";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type {
  EmailTemplate,
  EmailTemplateArguments,
  EmailTemplateNames,
  NoArguments,
  Email,
} from "../types";

export async function send<T extends EmailTemplateNames>(
  email: Email,
  subject: string,
  template: EmailTemplate,
  ...emailArgs: NoArguments<T> extends true
    ? []
    : [...EmailTemplateArguments<T>]
): Promise<CreateEmailResponse | SMTPTransport.SentMessageInfo> {
  const chosenTemplate = template as (...args: unknown[]) => React.ReactElement;
  logger("send", { email, subject });
  if (constServer.EMAIL_PROVIDER === "resend") {
    return new Resend(process.env.AUTH_RESEND_KEY).emails.send({
      from: constServer.EMAIL_FROM,
      to: [typeof email === "string" ? email : email.email],
      subject,
      react: chosenTemplate(...emailArgs),
    });
  }
  const transporter = createTransport(constServer.EMAIL_SERVER);
  return transporter.sendMail({
    from: constServer.EMAIL_FROM,
    to: [typeof email === "string" ? email : email.email],
    subject,
    html: await render(chosenTemplate(...emailArgs)),
  });
}
