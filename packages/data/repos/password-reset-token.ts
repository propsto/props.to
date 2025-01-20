import { logger } from "@propsto/logger?data";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { getUserByEmail, updateUser } from "./user";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    logger("getPasswordResetTokenByToken", { token });
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });
    return handleSuccess(passwordResetToken);
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
    return handleSuccess(passwordResetToken);
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
    return handleSuccess(passwordResetToken);
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
    return handleSuccess(passwordResetToken);
  } catch (e) {
    return handleError(e);
  }
};

export const setPasswordByToken = async (token: string, password: string) => {
  try {
    logger("setPasswordByToken", { token });
    const tokenDetails = await getPasswordResetTokenByToken(token);
    if (!tokenDetails.data) throw Error("Invalid token details");
    const user = await getUserByEmail(tokenDetails.data.email);
    if (!user.data) throw Error("Invalid user");
    const updatedUser = await updateUser(user.data.id, { password });
    if (!updatedUser.data) throw Error("Couldn't update password");
    deletePasswordResetToken(tokenDetails.data.id);
    return handleSuccess(updatedUser.data);
  } catch (e) {
    return handleError(e);
  }
};
