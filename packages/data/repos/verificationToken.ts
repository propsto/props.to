import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { handleError } from "../utils/errorHandling";

export async function createVerificationToken(tokenData: any) {
  try {
    logger("createVerificationToken", { tokenData });
    const token = await db.verificationToken.create({ data: tokenData });
    return { success: true, data: token, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function useVerificationToken(identifier_token: {
  identifier: string;
  token: string;
}) {
  try {
    logger("useVerificationToken", { identifier_token });
    const verificationToken = await db.verificationToken.delete({
      where: { identifier_token },
    });
    return { success: true, data: verificationToken, error: null };
  } catch (e) {
    return handleError(e);
  }
}
