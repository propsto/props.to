import { ErrorResponse } from "resend";

function isErrorResponse(error: any): error is ErrorResponse {
  return (<ErrorResponse>error).message !== undefined;
}

export function handleError(e: any) {
  if (isErrorResponse(e)) {
    switch (e.name) {
      case "rate_limit_exceeded":
        return {
          success: false,
          data: null,
          error: "Contact your admin, emails can't be sent.",
        };
      default:
        return { success: false, data: null, error: "Unexpected error" };
    }
  }
  return { success: false, data: null, error: "Unexpected error" };
}
