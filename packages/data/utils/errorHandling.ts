import { Prisma, type DbError } from "../db";
import { logger } from "@propsto/logger?data";

export function handleError(e: any): DbError {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger("repos/handleError", e.code, e.message);
    switch (e.code) {
      case "P2002":
        return { success: false, data: null, error: "Invalid email" };
      default:
        return { success: false, data: null, error: "Unexpected error" };
    }
  }
  if (e instanceof Error) {
    logger("repos/handleError", e.message);
    return { success: false, data: null, error: e.message };
  }
  return { success: false, data: null, error: "Unexpected error" };
}
