import { createLogger } from "@propsto/logger";
import { db, Prisma } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";
import { v4 as uuidv4 } from "uuid";
import { compare, hash } from "bcryptjs";
import { User } from "@prisma/client";

const logger = createLogger("data");

export type BasicUserData = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    image: true;
    dateOfBirth: true;
    emailVerified: true;
    onboardingCompletedAt: true;
    role: true;
    hostedDomain: true;
    isGoogleWorkspaceAdmin: true;
    personalEmail: true;
    personalEmailVerified: true;
  };
}>;

type UserMapperArgs =
  | Prisma.UserGetPayload<{
      include: {
        slug: true;
        organizationSlugs: true;
        organizations: {
          include: {
            organization: { include: { slug: true } };
          };
        };
      };
    }>
  | null
  | undefined;

type OrganizationMembership = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: string;
  userOrgSlug?: string; // User's slug within this org
};

type UserMapperReturnType =
  | (BasicUserData & {
      username?: string; // Personal (GLOBAL) username
      organizations?: OrganizationMembership[];
    })
  | null
  | undefined;

function userMapper(
  userData?: UserMapperArgs,
  addOns?: (keyof User)[],
): UserMapperReturnType {
  if (userData) {
    // Map org slugs by orgId for easy lookup
    const orgSlugsByOrgId = new Map(
      userData.organizationSlugs?.map(s => [s.scopedToOrgId, s.slug]) ?? [],
    );

    return {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      image: userData.image,
      role: userData.role,
      emailVerified: userData.emailVerified,
      dateOfBirth: userData.dateOfBirth || null,
      hostedDomain: userData.hostedDomain,
      isGoogleWorkspaceAdmin: userData.isGoogleWorkspaceAdmin,
      personalEmail: userData.personalEmail,
      personalEmailVerified: userData.personalEmailVerified,
      onboardingCompletedAt: userData.onboardingCompletedAt,
      username: userData.slug?.slug, // Personal (GLOBAL) username
      organizations: userData.organizations?.map(m => ({
        organizationId: m.organizationId,
        organizationSlug: m.organization.slug?.slug ?? "",
        organizationName: m.organization.name,
        role: m.role,
        userOrgSlug: orgSlugsByOrgId.get(m.organizationId), // User's slug in this org
      })),
      ...(addOns
        ? Object.fromEntries(addOns.map(key => [key, userData[key]]))
        : {}),
    };
  }
  return null;
}

const userInclude = Prisma.validator<Prisma.UserInclude>()({
  slug: true,
  organizationSlugs: true,
  organizations: {
    include: {
      organization: { include: { slug: true } },
    },
  },
});

export async function createUser(data: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
}) {
  try {
    const dataWithSlug = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      image: data.image,
      hostedDomain: data.hostedDomain,
      isGoogleWorkspaceAdmin: data.isGoogleWorkspaceAdmin ?? false,
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

/**
 * Verify a user's password without returning user data.
 * Useful for account linking where we need to verify ownership.
 */
export async function verifyUserPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<HandleEvent<boolean>> {
  try {
    logger("verifyUserPassword", { email });
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { password: true },
    });
    if (!existingUser?.password) {
      return handleSuccess(false);
    }
    const isPasswordValid = await compare(password, existingUser.password);
    return handleSuccess(isPasswordValid);
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

    // Get user with their slugs before deletion
    const user = await db.user.findUnique({
      where: { id },
      include: {
        ...userInclude,
        organizationSlugs: true,
      },
    });

    if (!user) {
      return handleError(new Error("User not found"));
    }

    // Collect all slug IDs to delete (personal + org-scoped)
    const slugIdsToDelete = [
      user.slugId, // Personal slug
      ...user.organizationSlugs.map(s => s.id), // Org-scoped slugs
    ];

    // Delete the user first (this will work because of the cascade setup)
    const deletedUser = await db.user.delete({
      where: { id },
      include: userInclude,
    });

    // Delete the orphaned slugs
    await db.slug.deleteMany({
      where: { id: { in: slugIdsToDelete } },
    });

    logger("deleteUser: deleted user and slugs", {
      userId: id,
      slugsDeleted: slugIdsToDelete.length,
    });

    return handleSuccess(userMapper(deletedUser));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Create an organization-scoped slug for a user.
 * This is their username within a specific organization.
 */
export async function createUserOrgSlug(data: {
  userId: string;
  organizationId: string;
  slug: string;
}): Promise<HandleEvent<{ id: string; slug: string }>> {
  try {
    logger("createUserOrgSlug", data);

    // Check for collision within the org scope
    const existingSlug = await db.slug.findFirst({
      where: {
        slug: data.slug.toLowerCase(),
        scope: "ORGANIZATION",
        scopedToOrgId: data.organizationId,
      },
    });

    if (existingSlug) {
      return handleError(
        new Error("Username already taken in this organization"),
      );
    }

    const newSlug = await db.slug.create({
      data: {
        slug: data.slug.toLowerCase(),
        scope: "ORGANIZATION",
        scopedToOrgId: data.organizationId,
        orgSlugOwnerId: data.userId,
      },
    });

    return handleSuccess({ id: newSlug.id, slug: newSlug.slug });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Update a user's organization-scoped slug.
 */
export async function updateUserOrgSlug(data: {
  userId: string;
  organizationId: string;
  newSlug: string;
}): Promise<HandleEvent<{ id: string; slug: string }>> {
  try {
    logger("updateUserOrgSlug", data);

    // Find existing slug for this user in this org
    const existingUserSlug = await db.slug.findFirst({
      where: {
        orgSlugOwnerId: data.userId,
        scope: "ORGANIZATION",
        scopedToOrgId: data.organizationId,
      },
    });

    if (!existingUserSlug) {
      // Create new one if doesn't exist
      return createUserOrgSlug({
        userId: data.userId,
        organizationId: data.organizationId,
        slug: data.newSlug,
      });
    }

    // Check for collision (excluding current slug)
    const collision = await db.slug.findFirst({
      where: {
        slug: data.newSlug.toLowerCase(),
        scope: "ORGANIZATION",
        scopedToOrgId: data.organizationId,
        id: { not: existingUserSlug.id },
      },
    });

    if (collision) {
      return handleError(
        new Error("Username already taken in this organization"),
      );
    }

    const updatedSlug = await db.slug.update({
      where: { id: existingUserSlug.id },
      data: { slug: data.newSlug.toLowerCase() },
    });

    return handleSuccess({ id: updatedSlug.id, slug: updatedSlug.slug });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Get a user's slug for a specific organization.
 */
export async function getUserOrgSlug(data: {
  userId: string;
  organizationId: string;
}): Promise<HandleEvent<{ slug: string } | null>> {
  try {
    logger("getUserOrgSlug", data);

    const orgSlug = await db.slug.findFirst({
      where: {
        orgSlugOwnerId: data.userId,
        scope: "ORGANIZATION",
        scopedToOrgId: data.organizationId,
      },
    });

    if (!orgSlug) {
      return handleSuccess(null);
    }

    return handleSuccess({ slug: orgSlug.slug });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * Update a user's personal (GLOBAL) slug.
 */
export async function updateUserPersonalSlug(data: {
  userId: string;
  newSlug: string;
}): Promise<HandleEvent<{ id: string; slug: string }>> {
  try {
    logger("updateUserPersonalSlug", data);

    // Get user's current personal slug
    const user = await db.user.findUnique({
      where: { id: data.userId },
      include: { slug: true },
    });

    if (!user?.slug) {
      return handleError(new Error("User or personal slug not found"));
    }

    // Check for collision in GLOBAL scope
    const collision = await db.slug.findFirst({
      where: {
        slug: data.newSlug.toLowerCase(),
        scope: "GLOBAL",
        scopedToOrgId: null,
        id: { not: user.slug.id },
      },
    });

    if (collision) {
      return handleError(new Error("Username already taken"));
    }

    const updatedSlug = await db.slug.update({
      where: { id: user.slug.id },
      data: { slug: data.newSlug.toLowerCase() },
    });

    return handleSuccess({ id: updatedSlug.id, slug: updatedSlug.slug });
  } catch (e) {
    return handleError(e);
  }
}
