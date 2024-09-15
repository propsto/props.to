import { logger } from "@propsto/logger?data";
import { db, Prisma } from "../db";
import { handleError } from "../utils/errorHandling";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    logger("getPasswordResetTokenByToken", { token });
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });
    return { success: true, data: passwordResetToken, error: null };
  } catch (e) {
    return handleError(e);
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    logger("getPasswordResetTokenByEmail", { email });
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: { email },
    });
    return { success: true, data: passwordResetToken, error: null };
  } catch (e) {
    return handleError(e);
  }
};

export const createPasswordResetToken = async (
  data: Prisma.PasswordResetTokenCreateInput,
) => {
  try {
    logger("createPasswordResetToken", { data });
    const passwordResetToken = await db.passwordResetToken.create({ data });
    return { success: true, data: passwordResetToken, error: null };
  } catch (e) {
    return handleError(e);
  }
};

export const deletePasswordResetToken = async (id: string | undefined) => {
  try {
    logger("deletePasswordResetToken", { id });
    const passwordResetToken = await db.passwordResetToken.delete({
      where: { id },
    });
    return { success: true, data: passwordResetToken, error: null };
  } catch (e) {
    return handleError(e);
  }
};
