import { type ErrorResponse } from "resend";
import { logger } from "@propsto/logger?email";

function isErrorResponse(error: unknown): error is ErrorResponse {
  return typeof error === "object" && error !== null && "message" in error;
}

export interface HandleErrorReturn {
  success: boolean;
  data: null;
  error: string;
}

export function handleError(e: unknown): HandleErrorReturn {
  logger("handleError %O", e);
  if (isErrorResponse(e)) {
    if (e.name === "rate_limit_exceeded") {
      return {
        success: false,
        data: null,
        error: "Contact your admin, emails can't be sent.",
      };
    }
  }
  return { success: false, data: null, error: "Unexpected error" };
}
