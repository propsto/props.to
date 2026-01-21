"use client";

import { z } from "zod";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@propsto/ui/atoms";
import { useFormContext, useController } from "react-hook-form";
import { type Step } from "@stepperize/react";
import { type User } from "next-auth";

const accountSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    feedbackAlerts: z.boolean().default(true),
    weeklyDigest: z.boolean().default(true),
    marketingEmails: z.boolean().default(true),
  }),
  privacySettings: z.object({
    profileVisibility: z
      .enum(["public", "private", "organization"])
      .default("public"),
    allowFeedbackFromAnyone: z.boolean().default(true),
    showEmailInProfile: z.boolean().default(false),
  }),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

interface StepComponentProps {
  hostedDomain?: string | null;
  email?: string | null;
}

export function StepComponent({
  hostedDomain,
}: StepComponentProps): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountFormValues>();

  // Personal username is ALWAYS editable - this is for the user's personal (GLOBAL) account
  // Organization-scoped usernames are handled separately when joining/creating orgs

  const { field: profileVisibilityField } = useController<
    AccountFormValues,
    "privacySettings.profileVisibility"
  >({
    name: "privacySettings.profileVisibility",
    defaultValue: "public",
  });

  const { field: emailNotificationsField } = useController<
    AccountFormValues,
    "notificationPreferences.emailNotifications"
  >({
    name: "notificationPreferences.emailNotifications",
  });
  const { field: feedbackAlertsField } = useController<
    AccountFormValues,
    "notificationPreferences.feedbackAlerts"
  >({
    name: "notificationPreferences.feedbackAlerts",
  });
  const { field: weeklyDigestField } = useController<
    AccountFormValues,
    "notificationPreferences.weeklyDigest"
  >({
    name: "notificationPreferences.weeklyDigest",
  });
  const { field: marketingEmailsField } = useController<
    AccountFormValues,
    "notificationPreferences.marketingEmails"
  >({
    name: "notificationPreferences.marketingEmails",
  });

  const { field: allowFeedbackField } = useController<
    AccountFormValues,
    "privacySettings.allowFeedbackFromAnyone"
  >({
    name: "privacySettings.allowFeedbackFromAnyone",
  });
  const { field: showEmailField } = useController<
    AccountFormValues,
    "privacySettings.showEmailInProfile"
  >({
    name: "privacySettings.showEmailInProfile",
  });

  return (
    <div className="space-y-6 text-start">
      {/* Personal Username */}
      <div className="space-y-2">
        <Label
          htmlFor={register("username").name}
          className="block text-sm font-medium text-primary"
        >
          Personal Username
        </Label>
        <Input
          id={register("username").name}
          {...register("username")}
          placeholder="Enter your unique username"
          className="block w-full"
        />
        {errors.username ? (
          <span className="text-sm text-destructive">
            {errors.username.message}
          </span>
        ) : null}
        <p className="text-xs text-muted-foreground">
          This is your personal username on the platform (e.g.,
          props.to/username).
          {hostedDomain ? (
            <>
              {" "}
              You&apos;ll also have a separate organization username based on
              your email when you join <b>{hostedDomain.split(".")[0]}</b>.
            </>
          ) : null}
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-primary">
          Privacy Settings
        </Label>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-primary">
            Profile Visibility
          </Label>
          <Select
            value={profileVisibilityField.value}
            onValueChange={profileVisibilityField.onChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select profile visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                Public - Anyone can view your profile
              </SelectItem>
              <SelectItem value="organization">
                Organization Only - Only organization members can view
              </SelectItem>
              <SelectItem value="private">
                Private - Only you can view your profile
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowFeedback"
            checked={allowFeedbackField.value}
            onCheckedChange={allowFeedbackField.onChange}
          />
          <Label htmlFor="allowFeedback" className="text-sm">
            Allow feedback from anyone
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showEmail"
            checked={showEmailField.value}
            onCheckedChange={showEmailField.onChange}
          />
          <Label htmlFor="showEmail" className="text-sm">
            Show email address in public profile
          </Label>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-primary">
          Notification Preferences
        </Label>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailNotifications"
              checked={emailNotificationsField.value}
              onCheckedChange={emailNotificationsField.onChange}
            />
            <Label htmlFor="emailNotifications" className="text-sm">
              Email notifications for important updates
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="feedbackAlerts"
              checked={feedbackAlertsField.value}
              onCheckedChange={feedbackAlertsField.onChange}
            />
            <Label htmlFor="feedbackAlerts" className="text-sm">
              Instant alerts when you receive feedback
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="weeklyDigest"
              checked={weeklyDigestField.value}
              onCheckedChange={weeklyDigestField.onChange}
            />
            <Label htmlFor="weeklyDigest" className="text-sm">
              Weekly digest of your feedback activity
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingEmails"
              checked={marketingEmailsField.value}
              onCheckedChange={marketingEmailsField.onChange}
            />
            <Label htmlFor="marketingEmails" className="text-sm">
              Marketing emails and product updates
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "account",
  label: "Account",
  schema: accountSchema,
};

// Check if username is the auto-generated one (user-<uuid> format, 41 chars)
const isAutoGeneratedUsername = (username?: string): boolean => {
  if (!username) return true;
  // Auto-generated usernames are "user-" followed by a UUID (41 chars total)
  return username.startsWith("user-") && username.length >= 41;
};

// Extract username suggestion from email (e.g., "john@acme.com" → "john")
const getUsernameFromEmail = (email?: string | null): string => {
  if (!email) return "";
  const localPart = email.split("@")[0] ?? "";
  // Clean up: only keep alphanumeric, underscores, and hyphens
  return localPart.toLowerCase().replace(/[^a-z0-9_-]/g, "");
};

export const defaults = (user?: User): AccountFormValues => {
  // Priority: 1) existing custom username, 2) suggestion from email, 3) empty
  let username = "";
  if (user?.username && !isAutoGeneratedUsername(user.username)) {
    username = user.username;
  } else if (user?.email) {
    username = getUsernameFromEmail(user.email);
  }

  return {
    username,
    notificationPreferences: {
      emailNotifications: true,
      feedbackAlerts: true,
      weeklyDigest: true,
      marketingEmails: true,
    },
    privacySettings: {
      profileVisibility: "public",
      allowFeedbackFromAnyone: true,
      showEmailInProfile: false,
    },
  };
};

/**
 * Check if the account step data requirements are met
 * User must have a valid username that is not auto-generated
 */
export function isStepComplete(user?: User): boolean {
  if (!user?.username) return false;
  // Username must not be auto-generated (user-<uuid> format, 41+ chars)
  return !isAutoGeneratedUsername(user.username);
}
