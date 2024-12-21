import { Prisma } from "../db";
import { logger } from "@propsto/logger?data";

export function handleError(e: any): HandleErrorEvent {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger("handleError", e.code, e.message);
    if (e.code) {
      return { success: false, data: null, error: "Invalid email" };
    } else {
      return { success: false, data: null, error: "Unexpected error" };
    }
  }
  if (e instanceof Error) {
    logger("handleError", e.message);
    return { success: false, data: null, error: e.message };
  }
  return { success: false, data: null, error: "Unexpected error" };
}
