import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { AdapterAuthenticator } from "@auth/core/adapters";

const logger = createLogger("data");

export async function createAuthenticator(authenticator: AdapterAuthenticator) {
  try {
    logger("createAuthenticator", { authenticator });
    const result = await db.authenticator.create({
      data: authenticator,
    });
    return handleSuccess(result);
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
    return handleSuccess(result);
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
    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}
export async function updateAuthenticatorCounter(
  credentialID: string,
  counter: number,
) {
  try {
    logger("updateAuthenticatorCounter", { credentialID, counter });
    const result = await db.authenticator.update({
      where: { credentialID },
      data: { counter },
    });
    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}
