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
    weeklyDigest: z.boolean().default(false),
    marketingEmails: z.boolean().default(false),
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

export function StepComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountFormValues>();

  const { field: profileVisibilityField } = useController<AccountFormValues, "privacySettings.profileVisibility">({
    name: "privacySettings.profileVisibility",
  });

  const { field: emailNotificationsField } = useController<AccountFormValues, "notificationPreferences.emailNotifications">({
    name: "notificationPreferences.emailNotifications",
  });
  const { field: feedbackAlertsField } = useController<AccountFormValues, "notificationPreferences.feedbackAlerts">({
    name: "notificationPreferences.feedbackAlerts",
  });
  const { field: weeklyDigestField } = useController<AccountFormValues, "notificationPreferences.weeklyDigest">({
    name: "notificationPreferences.weeklyDigest",
  });
  const { field: marketingEmailsField } = useController<AccountFormValues, "notificationPreferences.marketingEmails">({
    name: "notificationPreferences.marketingEmails",
  });

  const { field: allowFeedbackField } = useController<AccountFormValues, "privacySettings.allowFeedbackFromAnyone">({
    name: "privacySettings.allowFeedbackFromAnyone",
  });
  const { field: showEmailField } = useController<AccountFormValues, "privacySettings.showEmailInProfile">({
    name: "privacySettings.showEmailInProfile",
  });

  return (
    <div className="space-y-6 text-start">
      {/* Username */}
      <div className="space-y-2">
        <Label
          htmlFor={register("username").name}
          className="block text-sm font-medium text-primary"
        >
          Username
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
          This will be your unique identifier on the platform (e.g.,
          props.to/username)
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

export const defaults = (_user?: User): AccountFormValues => ({
  username: "",
  notificationPreferences: {
    emailNotifications: true,
    feedbackAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  },
  privacySettings: {
    profileVisibility: "public",
    allowFeedbackFromAnyone: true,
    showEmailInProfile: false,
  },
});
