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
  getPendingAccountLink,
  consumePendingAccountLink,
  linkAccount,
  getUserByEmail,
  verifyUserPassword,
  createPersonalEmailVerification,
  verifyPersonalEmailCode,
  isPersonalEmailAvailable,
} from "@propsto/data/repos";
import { sendPersonalEmailVerification } from "@propsto/email/send/user";
import { type OrganizationJoinFormValues } from "@components/welcome-stepper/steps/organization-join-step";
import { type PersonalFormValues } from "@components/welcome-stepper/steps/personal-step";
import { type AccountFormValues } from "@components/welcome-stepper/steps/account-step";
import { type OrganizationFormValues } from "@components/welcome-stepper/steps/organization-step";
import { type LinkAccountFormValues } from "@components/welcome-stepper/steps/link-account-step";
import { updateSession, signIn } from "./auth.server";

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

    // Update the user's PERSONAL slug with the new username
    // This is separate from organization-scoped slugs
    const trimmedUsername = username.trim();

    if (trimmedUsername) {
      const { db } = await import("@propsto/data/db");

      // Get the current user with their personal slug
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        include: { slug: true },
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

      // Check for collision in GLOBAL scope (personal usernames + org slugs)
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

      // Update the user's PERSONAL slug (GLOBAL scope)
      // Organization-scoped slugs are handled separately in org handlers
      await db.slug.update({
        where: { id: currentUser.slug.id },
        data: {
          slug: trimmedUsername.toLowerCase(),
          scope: "GLOBAL",
          scopedToOrgId: null,
        },
      });
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

    // Get the user to find their email for org slug
    const currentUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (currentUser) {
      // Create a SEPARATE org-scoped slug for the user (their username within this org)
      // This is independent from their personal (GLOBAL) slug
      const emailUsername = currentUser.email
        .split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

      if (emailUsername) {
        // Check for collision within the org scope (shouldn't happen for new org, but be safe)
        const existingOrgUserSlug = await db.slug.findFirst({
          where: {
            slug: emailUsername,
            scope: "ORGANIZATION",
            scopedToOrgId: organization.id,
          },
        });

        if (!existingOrgUserSlug) {
          // Create org-scoped slug for user
          await db.slug.create({
            data: {
              slug: emailUsername,
              scope: "ORGANIZATION",
              scopedToOrgId: organization.id,
              orgSlugOwnerId: userId,
            },
          });
        }
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

    // Get the user to find their email for org slug
    const currentUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (currentUser) {
      // Create a SEPARATE org-scoped slug for the user (their username within this org)
      // This is independent from their personal (GLOBAL) slug
      const emailUsername = currentUser.email
        .split("@")[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

      if (emailUsername) {
        // Check for collision within the org scope
        const existingOrgUserSlug = await db.slug.findFirst({
          where: {
            slug: emailUsername,
            scope: "ORGANIZATION",
            scopedToOrgId: organization.id,
          },
        });

        if (existingOrgUserSlug) {
          // Username collision within org - this shouldn't happen with email-based usernames
          // but handle gracefully by adding a suffix
          logger("warn: Username collision for org user, adding suffix %o", {
            userId,
            emailUsername,
            organizationId: organization.id,
          });

          // Try with a numeric suffix
          let suffix = 1;
          let uniqueSlug = `${emailUsername}${suffix}`;
          while (
            await db.slug.findFirst({
              where: {
                slug: uniqueSlug,
                scope: "ORGANIZATION",
                scopedToOrgId: organization.id,
              },
            })
          ) {
            suffix++;
            uniqueSlug = `${emailUsername}${suffix}`;
          }

          await db.slug.create({
            data: {
              slug: uniqueSlug,
              scope: "ORGANIZATION",
              scopedToOrgId: organization.id,
              orgSlugOwnerId: userId,
            },
          });
        } else {
          // Create org-scoped slug for user
          await db.slug.create({
            data: {
              slug: emailUsername,
              scope: "ORGANIZATION",
              scopedToOrgId: organization.id,
              orgSlugOwnerId: userId,
            },
          });
        }
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

const linkAccountServerSchema = z.object({
  verificationMethod: z.enum(["password", "magic-link"]),
  password: z.string().optional(),
});

export async function linkAccountHandler(
  values: LinkAccountFormValues,
  pendingLinkToken: string,
  email: string,
): Promise<
  HandleEvent<BasicUserData | null | undefined, LinkAccountFormValues>
> {
  try {
    const parsed = linkAccountServerSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { verificationMethod, password } = parsed.data;

    // Retrieve pending link data
    const pendingLink = await getPendingAccountLink(pendingLinkToken);
    if (!pendingLink.success || !pendingLink.data) {
      return {
        success: false,
        error:
          "Your account linking session has expired. Please try signing in with Google again.",
      };
    }

    const pendingData = pendingLink.data;

    // Verify the email matches
    if (pendingData.email !== email) {
      return {
        success: false,
        error: "Email mismatch. Please start over.",
      };
    }

    // Get the existing user
    const existingUser = await getUserByEmail(pendingData.email, ["password"]);
    if (!existingUser.data) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (verificationMethod === "password") {
      // Verify password using the data package function
      const passwordResult = await verifyUserPassword({
        email: pendingData.email,
        password: password ?? "",
      });

      if (!passwordResult.success || !passwordResult.data) {
        // Check if user has no password set
        if (!existingUser.data.password) {
          return {
            success: false,
            error:
              "This account doesn't have a password. Please use magic link verification.",
          };
        }
        return {
          success: false,
          error: "Incorrect password",
          fieldErrors: {
            password: ["Incorrect password"],
          },
        };
      }
    } else {
      // Magic link verification
      // Send magic link with callback to complete linking
      await signIn("email", {
        email: pendingData.email,
        redirect: false,
        callbackUrl: `/welcome?step=link-account&token=${pendingLinkToken}&verified=true`,
      });

      // Return success with null data to indicate magic link was sent
      // The UI should check for null data and show the "check your email" message
      return {
        success: true,
        data: null,
      };
    }

    // Password verification successful - link the OAuth account
    const linkResult = await linkAccount({
      userId: existingUser.data.id!,
      type: "oauth",
      provider: pendingData.provider,
      providerAccountId: pendingData.providerAccountId,
      access_token: pendingData.accessToken ?? undefined,
      refresh_token: pendingData.refreshToken ?? undefined,
      expires_at: pendingData.expiresAt ?? undefined,
    });

    if (!linkResult.success) {
      return {
        success: false,
        error: "Failed to link account. Please try again.",
      };
    }

    // Update user with Google Workspace data
    const userUpdated = await updateUser(existingUser.data.id!, {
      emailVerified: new Date(),
      hostedDomain: pendingData.hostedDomain,
      isGoogleWorkspaceAdmin: pendingData.isGoogleWorkspaceAdmin ?? false,
    });

    // Consume the pending link token
    await consumePendingAccountLink(pendingLinkToken);

    // Log successful account linking
    logger("info: Successfully linked Google account %o", {
      userId: existingUser.data.id,
      provider: pendingData.provider,
      hostedDomain: pendingData.hostedDomain,
    });

    // Update session with new user data
    if (userUpdated.data) {
      await updateSession({ user: userUpdated.data });
    }

    return userUpdated;
  } catch (error) {
    logger("error: Link account handler error %o", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link account",
    };
  }
}

// Schema for personal email step
const personalEmailServerSchema = z.object({
  personalEmail: z
    .string()
    .email("Please enter a valid email address"),
  verificationCode: z.string().optional(),
});

export type PersonalEmailFormValues = z.infer<typeof personalEmailServerSchema>;

/**
 * Handler for sending personal email verification code
 */
export async function sendPersonalEmailCodeHandler(
  personalEmail: string,
  userId: string,
  userName?: string,
  workEmail?: string,
  hostedDomain?: string,
): Promise<HandleEvent<{ sent: boolean }, PersonalEmailFormValues>> {
  try {
    // Validate email format
    const parsed = personalEmailServerSchema.safeParse({ personalEmail });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid email",
      };
    }

    // Server-side validation: personal email must not be from work domain
    const personalEmailDomain = personalEmail.split("@")[1]?.toLowerCase();
    if (hostedDomain && personalEmailDomain === hostedDomain.toLowerCase()) {
      return {
        success: false,
        error: "Please use a personal email, not your work email",
      };
    }

    // Check if email is available
    const available = await isPersonalEmailAvailable(personalEmail, userId);
    if (!available.success || !available.data) {
      return {
        success: false,
        error: "This email is already in use by another account",
      };
    }

    // Create verification code
    const verification = await createPersonalEmailVerification(userId, personalEmail);
    if (!verification.success || !verification.data) {
      return {
        success: false,
        error: "Failed to create verification code",
      };
    }

    // Send verification email
    const emailSent = await sendPersonalEmailVerification(
      personalEmail,
      verification.data.code,
      userName,
      workEmail,
    );

    if (!emailSent.success) {
      logger("error: Failed to send personal email verification %o", { error: emailSent.error });
      return {
        success: false,
        error: "Failed to send verification email",
      };
    }

    logger("info: Personal email verification sent to %s for user %s", personalEmail, userId);

    return {
      success: true,
      data: { sent: true },
    };
  } catch (error) {
    logger("error: Send personal email code error %o", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send verification code",
    };
  }
}

/**
 * Handler for verifying personal email code
 */
export async function verifyPersonalEmailHandler(
  code: string,
  userId: string,
): Promise<HandleEvent<BasicUserData | null | undefined, PersonalEmailFormValues>> {
  try {
    // Verify the code
    const verification = await verifyPersonalEmailCode(userId, code);
    if (!verification.success) {
      return {
        success: false,
        error: verification.error ?? "Verification failed",
      };
    }

    if (!verification.data?.valid) {
      const errorMsg = "error" in verification.data ? verification.data.error : "Invalid or expired code";
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Get updated user data
    const updatedUser = await getUser({ id: userId });
    if (updatedUser.success && updatedUser.data) {
      await updateSession({ user: updatedUser.data });
    }

    const verifiedEmail = "email" in verification.data ? verification.data.email : "unknown";
    logger("info: Personal email verified for user %s: %s", userId, verifiedEmail);

    return updatedUser;
  } catch (error) {
    logger("error: Verify personal email error %o", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Handler for the complete step
 * Marks the user's onboarding as complete by setting onboardingCompletedAt
 */
export async function completeHandler(
  userId: string,
): Promise<HandleEvent<BasicUserData | null | undefined, object>> {
  try {
    const userUpdated = await updateUser(userId, {
      onboardingCompletedAt: new Date(),
    });

    if (userUpdated.data) {
      await updateSession({ user: userUpdated.data });
    }

    logger("info: Onboarding completed for user %s", userId);

    return userUpdated;
  } catch (error) {
    logger("error: Complete handler error %o", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
    };
  }
}
