import { Prisma, type DbError } from "../db";
import { logger } from "@propsto/logger?data";

export function handleError(e: any): DbError {
  debugger;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logger("repos/handleError", e.code, e.message);
    switch (e.code) {
      case "P2002":
        return { success: false, data: null, error: "Invalid email" };
      default:
        return { success: false, data: null, error: "Unexpected error" };
    }
  }
  return { success: false, data: null, error: "Unexpected error" };
}
