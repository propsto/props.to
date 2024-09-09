import { logger } from "@propsto/logger?data";
import { db, type DbResult } from "../db";
import { handleError } from "../utils/errorHandling";
import { v4 as uuidv4 } from "uuid";
import { AdapterAccount } from "@auth/core/adapters";

export async function createUser(data: { email: string }): Promise<DbResult> {
  try {
    const dataWithUsername = { ...data, username: `user-${uuidv4()}` };
    logger("createUser", dataWithUsername);
    const newUser = await db.user.create({ data: dataWithUsername });
    return { success: true, data: newUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function getUser(data: { id: string }) {
  try {
    logger("getUser", data);
    const existingUser = await db.user.findUnique({ where: data });
    return { success: true, data: existingUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByEmail(data: { email: string }) {
  try {
    logger("getUserByEmail", data);
    const existingUser = await db.user.findUnique({ where: data });
    return { success: true, data: existingUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByAccount(
  providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
) {
  try {
    logger("getUserByAccount", { data: { providerAccountId } });
    const existingUser = await db.account.findUnique({
      where: { provider_providerAccountId: providerAccountId },
      select: { user: true },
    });
    return { success: true, data: existingUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function updateUser(id: string, data: any) {
  try {
    logger("updateUser", { id, data });
    const updatedUser = await db.user.update({ where: { id }, data });
    return { success: true, data: updatedUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteUser(id: string) {
  try {
    logger("deleteUser", { id });
    const deletedUser = await db.user.delete({ where: { id } });
    return { success: true, data: deletedUser, error: null };
  } catch (e) {
    return handleError(e);
  }
}
