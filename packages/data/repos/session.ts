import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { handleError } from "../utils/errorHandling";

export async function getSession(sessionToken: string) {
  try {
    logger("createSession", { sessionToken });
    const result = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    return { success: true, data: result, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function createSession(sessionData: any) {
  try {
    logger("createSession", { sessionData });
    const session = await db.session.create({ data: sessionData });
    return { success: true, data: session, error: null };
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
    return { success: true, data: session, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    logger("deleteSession", { sessionToken });
    const session = await db.session.delete({ where: { sessionToken } });
    return { success: true, data: session, error: null };
  } catch (e) {
    return handleError(e);
  }
}
