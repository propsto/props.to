import { logger } from "@propsto/logger?data";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { v4 as uuidv4 } from "uuid";
import { AdapterAccount } from "@auth/core/adapters";
import { compare, hash } from "bcryptjs";

export async function createUser(data: { email: string }) {
  try {
    const dataWithUsername = { ...data, username: `user-${uuidv4()}` };
    logger("createUser", dataWithUsername);
    const newUser = await db.user.create({ data: dataWithUsername });
    return handleSuccess(newUser);
  } catch (e) {
    return handleError(e);
  }
}

export async function getUser(data: { id: string }) {
  try {
    logger("getUser", data);
    const existingUser = await db.user.findUnique({ where: data });
    return handleSuccess(existingUser);
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByEmail(
  email: string,
  select?: Parameters<typeof db.user.findUnique>[0]["select"],
) {
  try {
    logger("getUserByEmail", email);
    const existingUser = await db.user.findUnique({
      where: { email },
      select,
    });
    return handleSuccess(existingUser);
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByEmailAndPassword({
  email,
  password,
}: {
  email: unknown;
  password: unknown;
}) {
  try {
    const hashedPassword = await hash(password as string, 10);
    logger("getUserByEmailAndPassword", email, hashedPassword);
    const existingUser = await db.user.findUnique({
      where: { email: email as string },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        password: true,
        username: true,
        dateOfBirth: true,
      },
    });
    if (!existingUser) throw Error("User does not exist");
    const { password: userPassword, dateOfBirth, ...rest } = existingUser;
    if (!userPassword) throw Error("Password is not defined");
    const comparePassword = await compare(password as string, userPassword);
    if (!comparePassword) throw Error("Password is not correct");
    return handleSuccess({
      ...rest,
      dateOfBirth: dateOfBirth && new Date(dateOfBirth),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByAccount(
  providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">,
) {
  try {
    logger("getUserByAccount", { data: { providerAccountId } });
    const existingUser = await db.account.findUnique({
      where: { provider_providerAccountId: providerAccountId },
      select: { user: true },
    });
    return handleSuccess(existingUser);
  } catch (e) {
    return handleError(e);
  }
}

export async function updateUser<T extends Prisma.UserSelect>(
  id: string,
  data: Prisma.UserUncheckedUpdateInput,
  select: T = { id: true } as T,
) {
  try {
    const { password, ...noPasswordParams } = data;
    logger("updateUser", { id, noPasswordParams });
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...noPasswordParams,
        ...(password ? { password: await hash(password as string, 10) } : {}),
      },
      select,
    });
    return handleSuccess(updatedUser);
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteUser(id: string) {
  try {
    logger("deleteUser", { id });
    const deletedUser = await db.user.delete({ where: { id } });
    return handleSuccess(deletedUser);
  } catch (e) {
    return handleError(e);
  }
}
