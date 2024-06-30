import { server } from "./server";

const emailProvider =
  server.RESEND_API_KEY && server.NODE_ENV === "production"
    ? "resend"
    : "email";

export const other = { emailProvider };
