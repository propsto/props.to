import { constServer } from "./server";

const emailProvider =
  constServer.RESEND_API_KEY && constServer.PROPSTO_ENV === "production"
    ? "resend"
    : "email";

const errorMessages: Record<string, string> = {
  InvalidNewPassordToken: "The provided token is invalid",
} as const;

const errorCodes = Object.fromEntries(
  new Map(Object.keys(errorMessages).map(i => [i, i])),
);

export const constOther = { emailProvider, errorMessages, errorCodes };
