import logger from "@propsto/logger?data";
import { db, type DbResult } from "../db";
import { handleError } from "./errorHandling";

export async function createUser(data: { email: string }): Promise<DbResult> {
  try {
    logger("createUser", data);
    const newUser = await db.user.create({ data });
    return { success: true, data: newUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function checkUserExistance(data: {
  email: string;
}): Promise<DbResult> {
  try {
    logger("checkUserExistance", data);
    const existingUser = await db.user.findFirst({
      where: data,
    });
    return { success: true, data: existingUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}
