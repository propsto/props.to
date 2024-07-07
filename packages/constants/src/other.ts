import { constServer } from "./server";

const emailProvider =
  constServer.RESEND_API_KEY && constServer.PROPSTO_ENV === "production"
    ? "resend"
    : "email";

export const constOther = { emailProvider };
