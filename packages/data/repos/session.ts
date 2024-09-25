import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

export async function getSession(sessionToken: string) {
  try {
    logger("createSession", { sessionToken });
    const result = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    return handleSuccess(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function createSession(sessionData: any) {
  try {
    logger("createSession", { sessionData });
    const session = await db.session.create({ data: sessionData });
    return handleSuccess(session);
  } catch (e) {
    return handleError(e);
  }
}

export async function updateSession(sessionData: any) {
  try {
    logger("createSession", { sessionData });
    const session = await db.session.update({
      where: { sessionToken: sessionData.sessionToken },
      data: sessionData,
    });
    return handleSuccess(session);
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    logger("deleteSession", { sessionToken });
    const session = await db.session.delete({ where: { sessionToken } });
    return handleSuccess(session);
  } catch (e) {
    return handleError(e);
  }
}
