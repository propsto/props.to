"use server";

import { put, type PutBlobResult } from "@vercel/blob";
import { z } from "zod";
import { logger } from "@propsto/logger";
import {
  type BasicUserData,
  updateUser,
  upsertNotificationPreferences,
  upsertPrivacySettings,
  upsertAccountSettings,
  upsertOrganizationDefaultUserSettings,
  upsertOrganizationSettings,
  upsertOrganizationFeedbackSettings,
  addOrganizationMember,
  getUser,
  getOrganizationByHostedDomain,
} from "@propsto/data/repos";
import { type OrganizationJoinFormValues } from "@components/welcome-stepper/steps/organization-join-step";
import { type PersonalFormValues } from "@components/welcome-stepper/steps/personal-step";
import { type AccountFormValues } from "@components/welcome-stepper/steps/account-step";
import { type OrganizationFormValues } from "@components/welcome-stepper/steps/organization-step";
import { updateSession } from "./auth.server";

const personalServerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  image: z.unknown().optional(),
});

const isFileArray = (value: unknown): value is File[] =>
  Array.isArray(value) && value.every(item => item instanceof File);

const accountServerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  notificationPreferences: z.object({
    emailNotifications: z.boolean(),
    feedbackAlerts: z.boolean(),
    weeklyDigest: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  privacySettings: z.object({
    profileVisibility: z.enum(["public", "private", "organization"]),
    allowFeedbackFromAnyone: z.boolean(),
    showEmailInProfile: z.boolean(),
  }),
});

export async function personalHandler(
  values: Omit<PersonalFormValues, "image"> & { image?: File[] | string },
  userId: string,
): Promise<
  HandleEvent<
    BasicUserData | null | undefined,
    Omit<PersonalFormValues, "image"> & { image?: File[] | string }
  >
> {
  const parsed = personalServerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { image, dateOfBirth, ...rest } = parsed.data;
  const trimmedDateOfBirth = dateOfBirth?.trim();
  if (trimmedDateOfBirth && Number.isNaN(Date.parse(trimmedDateOfBirth))) {
    return {
      success: false,
      error: "Invalid date of birth",
      fieldErrors: {
        dateOfBirth: ["Invalid date of birth"],
      },
    };
  }

  let blob: PutBlobResult | undefined;
  if (isFileArray(image) && image.length > 0) {
    const [file] = image;
    // TODO abstract to saveAvatar to let others use another method away from Vercel
    blob = await put(`avatars/${userId}`, file, {
      access: "public",
      contentType: file.type,
    });
  }
  const userUpdated = await updateUser(userId, {
    ...rest,
    ...(trimmedDateOfBirth
      ? { dateOfBirth: new Date(trimmedDateOfBirth).toISOString() }
      : {}),
    ...(blob ? { image: blob.url } : {}),
  });
  if (userUpdated.data) await updateSession({ user: userUpdated.data });
  return userUpdated;
}

export async function accountHandler(
  values: AccountFormValues,
  userId: string,
): Promise<HandleEvent<BasicUserData | null | undefined, AccountFormValues>> {
  try {
    const parsed = accountServerSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Extract the account settings from the form values (no role - it's auto-detected)
    const { username, notificationPreferences, privacySettings } = parsed.data;

    // Update the user's slug with the new username if provided
    const trimmedUsername = username.trim();

    if (trimmedUsername) {
      const { db } = await import("@propsto/data/db");

      // Get the current user with slug and organization membership info
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        include: {
          slug: true,
          organizations: {
            include: { organization: true },
          },
        },
      });

      if (!currentUser?.slug) {
        return {
          success: false,
          error: "User or slug not found",
          fieldErrors: {
            username: ["User or slug not found"],
          },
        };
      }

      // Determine if user is an organization user with locked username
      const isOrgUser = Boolean(currentUser.hostedDomain);

      // For organization users, their username is locked to their email prefix
      // and will be updated when they join/create an organization (in org handlers)
      // Skip the collision check and slug update here for org users
      if (isOrgUser) {
        logger(
          "info: Skipping username update for org user - will be handled in organization step %o",
          { userId, hostedDomain: currentUser.hostedDomain },
        );
      } else {
        // Personal users: check against GLOBAL scope slugs only
        // (personal accounts share namespace with organizations at top level)
        const existingSlug = await db.slug.findFirst({
          where: {
            slug: trimmedUsername.toLowerCase(),
            scope: "GLOBAL",
            scopedToOrgId: null,
            id: { not: currentUser.slug.id }, // Exclude current user's slug
          },
        });

        if (existingSlug) {
          return {
            success: false,
            error: "Username is already taken",
            fieldErrors: {
              username: ["Username is already taken"],
            },
          };
        }

        // Update the user's slug with the new username (GLOBAL scope for personal users)
        await db.slug.update({
          where: { id: currentUser.slug.id },
          data: {
            slug: trimmedUsername.toLowerCase(),
            scope: "GLOBAL",
            scopedToOrgId: null,
          },
        });
      }
    }

    // Get current user data (role is already set by auth flow)
    const userUpdated = await updateUser(userId, {});

    // Store notification preferences in dedicated table
    const notificationResult = await upsertNotificationPreferences(userId, {
      emailNotifications: notificationPreferences.emailNotifications,
      feedbackAlerts: notificationPreferences.feedbackAlerts,
      weeklyDigest: notificationPreferences.weeklyDigest,
      marketingEmails: notificationPreferences.marketingEmails,
    });

    if (!notificationResult.success) {
      logger("error: Failed to save notification preferences %o", {
        error: notificationResult.error,
      });
    }

    // Store privacy settings in dedicated table
    const privacyResult = await upsertPrivacySettings(userId, {
      profileVisibility: privacySettings.profileVisibility.toUpperCase() as
        | "PUBLIC"
        | "PRIVATE"
        | "ORGANIZATION",
      allowFeedbackFromAnyone: privacySettings.allowFeedbackFromAnyone,
      showEmailInProfile: privacySettings.showEmailInProfile,
    });

    if (!privacyResult.success) {
      logger("error: Failed to save privacy settings %o", {
        error: privacyResult.error,
      });
    }

    // Log successful persistence
    logger("info: Successfully persisted account preferences %o", {
      username: trimmedUsername ? "Updated" : "Not changed",
      notificationPreferences: notificationResult.success ? "Saved" : "Failed",
      privacySettings: privacyResult.success ? "Saved" : "Failed",
    });

    // Update session with new user data
    if (userUpdated.data) {
      await updateSession({ user: userUpdated.data });
    }

    return userUpdated;
  } catch (error) {
    logger("error: Account handler error %o", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update account settings",
    };
  }
}

export async function organizationHandler(
  values: OrganizationFormValues,
  userId: string,
): Promise<
  HandleEvent<BasicUserData | null | undefined, OrganizationFormValues>
> {
  try {
    const {
      organizationName,
      organizationSlug,
      hostedDomain,
      defaultUserSettings,
      organizationSettings,
      feedbackSettings,
    } = values;

    const { db } = await import("@propsto/data/db");

    // Check if organization slug is already taken in the GLOBAL namespace
    // (organizations and personal users share the top-level namespace)
    const existingOrgSlug = await db.slug.findFirst({
      where: {
        slug: organizationSlug.toLowerCase(),
        scope: "GLOBAL",
        scopedToOrgId: null,
      },
    });

    if (existingOrgSlug) {
      return {
        success: false,
        error: "Organization slug is already taken",
        fieldErrors: {
          organizationSlug: ["Organization slug is already taken"],
        },
      };
    }

    // Check if hostedDomain is already associated with another organization
    if (hostedDomain) {
      const existingOrgWithDomain = await db.organization.findFirst({
        where: {
          hostedDomain,
        },
      });

      if (existingOrgWithDomain) {
        return {
          success: false,
          error: "An organization for this domain already exists",
          fieldErrors: {
            organizationName: [
              "An organization for this domain already exists",
            ],
          },
        };
      }
    }

    // Create organization with slug and hosted domain
    // Organization slugs are in the GLOBAL namespace (top-level URLs like props.to/acme)
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        hostedDomain: hostedDomain ?? null,
        slug: {
          create: {
            slug: organizationSlug.toLowerCase(),
            scope: "GLOBAL",
            scopedToOrgId: null,
          },
        },
      },
      include: {
        slug: true,
      },
    });

    // Add user as organization owner
    await addOrganizationMember({
      userId,
      organizationId: organization.id,
      role: "OWNER",
    });

    // Get the user to find their slug and email
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      include: { slug: true },
    });

    if (currentUser?.slug) {
      // Update the user's slug to be scoped to the new organization
      // Username is derived from their email prefix
      const emailUsername = currentUser.email
        .split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

      // Check for collision within the org scope (shouldn't happen for new org, but be safe)
      const existingSlug = await db.slug.findFirst({
        where: {
          slug: emailUsername,
          scope: "ORGANIZATION",
          scopedToOrgId: organization.id,
          id: { not: currentUser.slug.id },
        },
      });

      if (!existingSlug && emailUsername) {
        await db.slug.update({
          where: { id: currentUser.slug.id },
          data: {
            slug: emailUsername,
            scope: "ORGANIZATION",
            scopedToOrgId: organization.id,
          },
        });
      }
    }

    // Get updated user data
    const userUpdated = await getUser({ id: userId });

    // Store organization-specific account settings
    const accountResult = await upsertAccountSettings(userId, {
      accountType: "ORGANIZATION",
      organizationName,
    });

    if (!accountResult.success) {
      logger("error: Failed to save organization account settings %o", {
        error: accountResult.error,
      });
    }

    // Store organization default user settings
    const defaultUserSettingsResult =
      await upsertOrganizationDefaultUserSettings(organization.id, {
        defaultProfileVisibility:
          defaultUserSettings.defaultProfileVisibility.toUpperCase() as
            | "PUBLIC"
            | "PRIVATE"
            | "ORGANIZATION",
        allowExternalFeedback: defaultUserSettings.allowExternalFeedback,
        requireApprovalForPublicProfiles:
          defaultUserSettings.requireApprovalForPublicProfiles,
      });

    if (!defaultUserSettingsResult.success) {
      logger("error: Failed to save organization default user settings %o", {
        error: defaultUserSettingsResult.error,
      });
    }

    // Store organization general settings
    const organizationSettingsResult = await upsertOrganizationSettings(
      organization.id,
      {
        allowUserInvites: organizationSettings.allowUserInvites,
        enableGroupManagement: organizationSettings.enableGroupManagement,
        requireEmailVerification: organizationSettings.requireEmailVerification,
        enableSSOIntegration: organizationSettings.enableSSOIntegration,
      },
    );

    if (!organizationSettingsResult.success) {
      logger("error: Failed to save organization settings %o", {
        error: organizationSettingsResult.error,
      });
    }

    // Store organization feedback settings
    const feedbackSettingsResult = await upsertOrganizationFeedbackSettings(
      organization.id,
      {
        enableOrganizationFeedback: feedbackSettings.enableOrganizationFeedback,
        allowAnonymousFeedback: feedbackSettings.allowAnonymousFeedback,
        enableFeedbackModeration: feedbackSettings.enableFeedbackModeration,
        autoApproveInternalFeedback:
          feedbackSettings.autoApproveInternalFeedback,
      },
    );

    if (!feedbackSettingsResult.success) {
      logger("error: Failed to save organization feedback settings %o", {
        error: feedbackSettingsResult.error,
      });
    }

    // Log successful organization creation and settings persistence
    logger(
      "info: Successfully created organization and persisted settings %o",
      {
        organizationId: organization.id,
        organizationName,
        organizationSlug: organizationSlug.toLowerCase(),
        userId,
        accountSettings: accountResult.success ? "Saved" : "Failed",
        defaultUserSettings: defaultUserSettingsResult.success
          ? "Saved"
          : "Failed",
        organizationSettings: organizationSettingsResult.success
          ? "Saved"
          : "Failed",
        feedbackSettings: feedbackSettingsResult.success ? "Saved" : "Failed",
      },
    );

    // Update session with new user data
    if (userUpdated.data) {
      await updateSession({ user: userUpdated.data });
    }

    return userUpdated;
  } catch (error) {
    logger("error: Organization handler error %o", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization",
    };
  }
}

export async function organizationJoinHandler(
  _values: OrganizationJoinFormValues,
  userId: string,
  hostedDomain: string,
  isGoogleWorkspaceAdmin: boolean,
): Promise<
  HandleEvent<BasicUserData | null | undefined, OrganizationJoinFormValues>
> {
  try {
    if (!hostedDomain) {
      return {
        success: false,
        error: "No hosted domain provided",
      };
    }

    // Find the organization by hosted domain
    const orgResult = await getOrganizationByHostedDomain(hostedDomain);

    if (!orgResult.success || !orgResult.data) {
      return {
        success: false,
        error: "Organization not found for your domain",
      };
    }

    const organization = orgResult.data;

    // Determine the role based on Google Workspace admin status
    const role = isGoogleWorkspaceAdmin ? "ADMIN" : "MEMBER";

    // Add user to the organization
    const memberResult = await addOrganizationMember({
      userId,
      organizationId: organization.id,
      role,
    });

    if (!memberResult.success) {
      return {
        success: false,
        error: memberResult.error ?? "Failed to join organization",
      };
    }

    const { db } = await import("@propsto/data/db");

    // Get the user to find their slug and email
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      include: { slug: true },
    });

    if (currentUser?.slug) {
      // Update the user's slug to be scoped to the organization
      // Username is derived from their email prefix
      const emailUsername = currentUser.email
        .split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

      // Check for collision within the org scope
      const existingSlug = await db.slug.findFirst({
        where: {
          slug: emailUsername,
          scope: "ORGANIZATION",
          scopedToOrgId: organization.id,
          id: { not: currentUser.slug.id },
        },
      });

      if (existingSlug) {
        // Username collision within org - this shouldn't happen with email-based usernames
        // but handle gracefully by keeping the auto-generated slug
        logger("warn: Username collision for org user %o", {
          userId,
          emailUsername,
          organizationId: organization.id,
        });
      } else if (emailUsername) {
        await db.slug.update({
          where: { id: currentUser.slug.id },
          data: {
            slug: emailUsername,
            scope: "ORGANIZATION",
            scopedToOrgId: organization.id,
          },
        });
      }
    }

    // Get updated user data
    const userUpdated = await getUser({ id: userId });

    // Log successful organization join
    logger("info: Successfully joined organization %o", {
      organizationId: organization.id,
      organizationName: organization.name,
      userId,
      role,
    });

    // Update session with new user data
    if (userUpdated.data) {
      await updateSession({ user: userUpdated.data });
    }

    return userUpdated;
  } catch (error) {
    logger("error: Organization join handler error %o", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to join organization",
    };
  }
}
