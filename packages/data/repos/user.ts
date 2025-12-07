import { logger } from "@propsto/logger?data";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { v4 as uuidv4 } from "uuid";
import { compare, hash } from "bcryptjs";
import { User } from "../generated/client";

export type BasicUserData = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    image: true;
    dateOfBirth: true;
    emailVerified: true;
    role: true;
  };
}>;

type UserMapperArgs =
  | Prisma.UserGetPayload<{
      include: {
        slug: true;
        organization: { include: { slug: true } };
      };
    }>
  | null
  | undefined;

type UserMapperReturnType =
  | (BasicUserData & {
      username?: string;
      organization?: string;
    })
  | null
  | undefined;

function userMapper(
  userData?: UserMapperArgs,
  addOns?: (keyof User)[],
): UserMapperReturnType {
  if (userData) {
    return {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      image: userData.image,
      role: userData.role,
      emailVerified: userData.emailVerified,
      dateOfBirth: userData.dateOfBirth || null,
      username: userData.slug?.slug,
      organization: userData.organization?.slug?.slug,
      ...(addOns
        ? Object.fromEntries(addOns.map(key => [key, userData[key]]))
        : {}),
    };
  }
  return null;
}

const userInclude = {
  slug: true,
  organization: { include: { slug: true } },
} satisfies Prisma.UserInclude;

export async function createUser(data: { email: string }) {
  try {
    const dataWithSlug = {
      ...data,
      slug: { create: { slug: `user-${uuidv4()}` } },
    };
    logger("createUser", dataWithSlug);
    const newUser = await db.user.create({
      data: dataWithSlug,
      include: userInclude,
    });
    return handleSuccess(userMapper(newUser));
  } catch (e) {
    return handleError(e);
  }
}

export async function getUser(data: { id: string }) {
  try {
    logger("getUser", data);
    const existingUser = await db.user.findUnique({
      where: data,
      include: userInclude,
    });
    return handleSuccess(userMapper(existingUser));
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByEmail<T extends (keyof User)[]>(
  email: string,
  addOns?: T,
): Promise<HandleEvent<UserMapperReturnType & Pick<User, T[number]>>> {
  try {
    logger("getUserByEmail", email);
    const existingUser = await db.user.findUnique({
      where: { email },
      include: userInclude,
    });

    const result = userMapper(existingUser, addOns);
    return handleSuccess(
      result as UserMapperReturnType & Pick<User, T[number]>,
    );
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByEmailAndPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    logger("getUserByEmailAndPassword", { email });
    const existingUser = await db.user.findUnique({
      where: { email },
      include: userInclude,
    });
    if (!existingUser) throw new Error("user-invalid");
    const isPasswordValid = await compare(password, existingUser.password!);
    if (!isPasswordValid) throw new Error("password-invalid");
    return handleSuccess(userMapper(existingUser));
  } catch (e) {
    return handleError(e);
  }
}

export async function getUserByAccount(providerAccountId: {
  provider: string;
  providerAccountId: string;
}) {
  try {
    logger("getUserByAccount", providerAccountId);
    const existingUser = await db.account.findUnique({
      where: { provider_providerAccountId: providerAccountId },
      include: {
        user: {
          include: userInclude,
        },
      },
    });
    return handleSuccess(userMapper(existingUser?.user));
  } catch (e) {
    return handleError(e);
  }
}

export async function updateUser(
  id: string,
  data: Prisma.UserUncheckedUpdateInput,
) {
  try {
    const { password, ...updateData } = data;
    logger("updateUser", { id, updateData });
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(password && { password: await hash(password as string, 10) }),
      },
      include: userInclude,
    });
    return handleSuccess(userMapper(updatedUser));
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteUser(id: string) {
  try {
    logger("deleteUser", { id });
    const deletedUser = await db.user.delete({
      where: { id },
      include: userInclude,
    });
    return handleSuccess(userMapper(deletedUser));
  } catch (e) {
    return handleError(e);
  }
}
