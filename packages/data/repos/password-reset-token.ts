import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { getUserByEmail, updateUser } from "./user";

const logger = createLogger("data");

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
    logger("setPasswordByToken");
    const tokenDetails = await getPasswordResetTokenByToken(token);
    if (!tokenDetails.data || tokenDetails.data.expires < new Date()) {
      throw Error("Invalid token details");
    }
    const user = await getUserByEmail(tokenDetails.data.email);
    if (!user.data) throw Error("Invalid user");
    // Consume the token before changing the password. The conditional delete
    // matches for exactly one caller and never for an expired row, so a link
    // works once and only inside its lifetime, whatever the caller checked.
    const { count } = await db.passwordResetToken.deleteMany({
      where: { id: tokenDetails.data.id, expires: { gt: new Date() } },
    });
    if (count !== 1) throw Error("Invalid token details");
    const updatedUser = await updateUser(user.data.id, { password });
    if (!updatedUser.data) throw Error("Couldn't update password");
    return handleSuccess(updatedUser.data);
  } catch (e) {
    return handleError(e);
  }
};
