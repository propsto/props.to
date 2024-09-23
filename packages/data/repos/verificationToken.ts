import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { handleError } from "../utils/errorHandling";
import { handleSuccess } from "../utils/successHandling";

export async function createVerificationToken(tokenData: any) {
  try {
    logger("createVerificationToken", { tokenData });
    const token = await db.verificationToken.create({ data: tokenData });
    return handleSuccess(token);
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
    return handleSuccess(verificationToken);
  } catch (e) {
    return handleError(e);
  }
}
