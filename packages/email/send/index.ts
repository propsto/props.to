import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";
import { createLogger } from "@propsto/logger";
import { constServer } from "@propsto/constants/server";
import { createOutboxEmail } from "@propsto/data/repos";
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

const logger = createLogger("email");

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
  const to = typeof email === "string" ? email : email.email;
  if (constServer.EMAIL_PROVIDER === "outbox") {
    const stored = await createOutboxEmail({
      to,
      subject,
      html: await render(chosenTemplate(...emailArgs)),
    });
    if (!stored.success)
      throw new Error(stored.error ?? "Failed to store outbox email");
    return {
      messageId: stored.data.id,
    } as unknown as SMTPTransport.SentMessageInfo;
  }
  if (constServer.EMAIL_PROVIDER === "resend") {
    return new Resend(constServer.RESEND_API_KEY).emails.send({
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
