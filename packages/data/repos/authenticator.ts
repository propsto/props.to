import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { handleError } from "../utils/errorHandling";

export async function createAuthenticator(authenticator) {
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
export async function getAuthenticator(credentialID) {
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
export async function listAuthenticatorsByUserId(userId) {
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
export async function updateAuthenticatorCounter(credentialID, counter) {
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
