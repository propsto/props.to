import type { CreateEmailResponse } from "resend";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type * as templates from "./templates";

// Create a type for all function names
export type EmailTemplateNames = keyof typeof templates;

// Create a type for all the utility functions
export type EmailTemplate = (typeof templates)[EmailTemplateNames];

// Create a type to capture the argument types of each function
export type EmailTemplateArguments<T extends EmailTemplateNames> = Parameters<
  (typeof templates)[T]
>;

// Create a type to capture the return type of each function
export type EmailTemplateReturnType<T extends EmailTemplateNames> = ReturnType<
  (typeof templates)[T]
>;

// Create a conditional type to check if a function takes no arguments
export type NoArguments<T extends EmailTemplateNames> =
  EmailTemplateArguments<T> extends [] ? true : false;

// Create a type for the arguments for each template send function
export type Email = string | { email: string };

export type HandleEmailEvent =
  | HandleSuccessEvent<CreateEmailResponse | SMTPTransport.SentMessageInfo>
  | HandleErrorEvent;
