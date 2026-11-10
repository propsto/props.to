import { createLogger } from "@propsto/logger";
import { hash } from "bcryptjs";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { getUserByEmail } from "./user";

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
    const tokenId = tokenDetails.data.id;
    const userId = user.data.id;
    const hashedPassword = await hash(password, 10);
    // Consume the token and change the password in one transaction. The
    // conditional delete matches for exactly one caller and never for an
    // expired row, so a link works once and only inside its lifetime; if the
    // password update fails, the token is restored and the link can be retried.
    const updatedUser = await db.$transaction(async tx => {
      const { count } = await tx.passwordResetToken.deleteMany({
        where: { id: tokenId, expires: { gt: new Date() } },
      });
      if (count !== 1) throw Error("Invalid token details");
      return tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
        select: { id: true, email: true },
      });
    });
    return handleSuccess(updatedUser);
  } catch (e) {
    return handleError(e);
  }
};
