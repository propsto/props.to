import { logger } from "@propsto/logger?data";
import { db, Prisma } from "../db";
import { handleError } from "../utils/errorHandling";
import { AdapterAuthenticator } from "@auth/core/adapters";

export async function createAuthenticator(authenticator: AdapterAuthenticator) {
  try {
    logger("createAuthenticator", { authenticator });
    const result = await db.authenticator.create({
      data: authenticator,
    });
    return { success: true, data: result, error: null };
  } catch (e) {
    return handleError(e);
  }
}
export async function getAuthenticator(credentialID: string) {
  try {
    logger("getAuthenticator", { credentialID });
    const result = await db.authenticator.findUnique({
      where: { credentialID },
    });
    return { success: true, data: result, error: null };
  } catch (e) {
    return handleError(e);
  }
}
export async function listAuthenticatorsByUserId(userId: string) {
  try {
    logger("listAuthenticatorsByUserId", { userId });
    const result = await db.authenticator.findMany({
      where: { userId },
    });
    return { success: true, data: result, error: null };
  } catch (e) {
    return handleError(e);
  }
}
export async function updateAuthenticatorCounter(credentialID: string, counter: number) {
  try {
    logger("updateAuthenticatorCounter", { credentialID, counter });
    const result = await db.authenticator.update({
      where: { credentialID },
      data: { counter },
    });
    return { success: true, data: result, error: null };
  } catch (e) {
    return handleError(e);
  }
}
