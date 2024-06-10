import logger from "@propsto/logger";
import { db, type DbResult } from "../db";
import { handleError } from "./errorHandling";

export async function createUser(data: { email: string }): Promise<DbResult> {
  try {
    logger("createUser %O", data.email);
    const newUser = db.user.create({ data });
    return { success: true, data: newUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}
