import { Prisma } from "../db";
import { createLogger } from "@propsto/logger";

const logger = createLogger("data");

export function handleError(e: unknown): HandleErrorEvent {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger("handleError", e.code, e.message);
    // Map common Prisma error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      P2002: "A record with this value already exists",
      P2003: "Invalid reference - the related record does not exist",
      P2025: "Record not found",
    };
    const message = errorMessages[e.code] ?? `Database error: ${e.code}`;
    return { success: false, data: undefined, error: message };
  }
  if (e instanceof Error) {
    logger("handleError", e.message);
    return { success: false, data: undefined, error: e.message };
  }
  logger("handleError", String(e));
  return { success: false, data: undefined, error: "Unexpected error" };
}
