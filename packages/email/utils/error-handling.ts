import { type ErrorResponse } from "resend";
import { logger } from "@propsto/logger?email";

function isErrorResponse(error: unknown): error is ErrorResponse {
  return typeof error === "object" && error !== null && "message" in error;
}

export function handleError(e: unknown): HandleErrorEvent {
  logger("handleError %O", e);
  if (isErrorResponse(e)) {
    if (e.name === "rate_limit_exceeded") {
      return {
        success: false,
        data: undefined,
        error: "Contact your admin, emails can't be sent.",
      };
    }
  }
  return { success: false, data: undefined, error: "Unexpected error" };
}
