import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

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
