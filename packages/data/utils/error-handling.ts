import { Prisma } from "../db";
import { createLogger } from "@propsto/logger";

const logger = createLogger("data");

export function handleError(e: any): HandleErrorEvent {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger("handleError", e.code, e.message);
    if (e.code) {
      return { success: false, data: undefined, error: "Invalid email" };
    } else {
      return { success: false, data: undefined, error: "Unexpected error" };
    }
  }
  if (e instanceof Error) {
    logger("handleError", e.message);
    return { success: false, data: undefined, error: e.message };
  }
  logger("handleError", e.message);
  return { success: false, data: undefined, error: "Unexpected error" };
}
