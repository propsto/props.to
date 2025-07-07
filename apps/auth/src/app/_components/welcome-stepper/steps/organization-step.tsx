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

const organizationSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  organizationSlug: z
    .string()
    .min(3, "Organization slug must be at least 3 characters")
    .max(50, "Organization slug must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Organization slug can only contain letters, numbers, and hyphens",
    ),
  defaultUserSettings: z.object({
    defaultProfileVisibility: z
      .enum(["public", "private", "organization"])
      .default("organization"),
    allowExternalFeedback: z.boolean().default(false),
    requireApprovalForPublicProfiles: z.boolean().default(true),
  }),
  organizationSettings: z.object({
    allowUserInvites: z.boolean().default(true),
    enableGroupManagement: z.boolean().default(true),
    requireEmailVerification: z.boolean().default(true),
    enableSSOIntegration: z.boolean().default(false),
  }),
  feedbackSettings: z.object({
    enableOrganizationFeedback: z.boolean().default(true),
    allowAnonymousFeedback: z.boolean().default(false),
    enableFeedbackModeration: z.boolean().default(true),
    autoApproveInternalFeedback: z.boolean().default(true),
  }),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function StepComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<OrganizationFormValues>();

  // Organization basic settings
  const organizationName = watch("organizationName");

  // Default user settings controllers
  const { field: defaultProfileVisibilityField } = useController<OrganizationFormValues, "defaultUserSettings.defaultProfileVisibility">({
    name: "defaultUserSettings.defaultProfileVisibility",
  });
  const { field: allowExternalFeedbackField } = useController<OrganizationFormValues, "defaultUserSettings.allowExternalFeedback">({
    name: "defaultUserSettings.allowExternalFeedback",
  });
  const { field: requireApprovalField } = useController<OrganizationFormValues, "defaultUserSettings.requireApprovalForPublicProfiles">({
    name: "defaultUserSettings.requireApprovalForPublicProfiles",
  });

  // Organization settings controllers
  const { field: allowUserInvitesField } = useController<OrganizationFormValues, "organizationSettings.allowUserInvites">({
    name: "organizationSettings.allowUserInvites",
  });
  const { field: enableGroupManagementField } = useController<OrganizationFormValues, "organizationSettings.enableGroupManagement">({
    name: "organizationSettings.enableGroupManagement",
  });
  const { field: requireEmailVerificationField } = useController<OrganizationFormValues, "organizationSettings.requireEmailVerification">({
    name: "organizationSettings.requireEmailVerification",
  });
  const { field: enableSSOField } = useController<OrganizationFormValues, "organizationSettings.enableSSOIntegration">({
    name: "organizationSettings.enableSSOIntegration",
  });

  // Feedback settings controllers
  const { field: enableOrgFeedbackField } = useController<OrganizationFormValues, "feedbackSettings.enableOrganizationFeedback">({
    name: "feedbackSettings.enableOrganizationFeedback",
  });
  const { field: allowAnonymousField } = useController<OrganizationFormValues, "feedbackSettings.allowAnonymousFeedback">({
    name: "feedbackSettings.allowAnonymousFeedback",
  });
  const { field: enableModerationField } = useController<OrganizationFormValues, "feedbackSettings.enableFeedbackModeration">({
    name: "feedbackSettings.enableFeedbackModeration",
  });
  const { field: autoApproveInternalField } = useController<OrganizationFormValues, "feedbackSettings.autoApproveInternalFeedback">({
    name: "feedbackSettings.autoApproveInternalFeedback",
  });

  // Auto-generate slug from organization name
  const handleOrganizationNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Update the slug field
    const slugField = register("organizationSlug");
    void slugField.onChange({ target: { value: slug } });
  };

  return (
    <div className="space-y-6 text-start">
      {/* Organization Basic Information */}

      <div className="space-y-2">
        <Label
          htmlFor={register("organizationName").name}
          className="block text-sm font-medium text-primary"
        >
          Organization Name
        </Label>
        <Input
          id={register("organizationName").name}
          {...register("organizationName")}
          placeholder="Enter your organization name"
          className="block w-full"
          onChange={e => {
            void register("organizationName").onChange(e);
            handleOrganizationNameChange(e);
          }}
        />
        {errors.organizationName ? (
          <span className="text-sm text-destructive">
            {errors.organizationName.message}
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={register("organizationSlug").name}
          className="block text-sm font-medium text-primary"
        >
          Organization URL Slug
        </Label>
        <Input
          id={register("organizationSlug").name}
          {...register("organizationSlug")}
          placeholder="organization-slug"
          className="block w-full"
        />
        {errors.organizationSlug ? (
          <span className="text-sm text-destructive">
            {errors.organizationSlug.message}
          </span>
        ) : null}
        <p className="text-xs text-muted-foreground">
          This will be used in URLs:{" "}
          <b>
            props.to/org/
            {organizationName
              ? organizationName
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9\s-]/g, "")
                  .replace(/\s+/g, "-")
              : "your-org"}
          </b>
          &nbsp;or&nbsp;
          <b>
            {organizationName
              ? organizationName
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9\s-]/g, "")
                  .replace(/\s+/g, "-")
              : "your-org"}
            .props.to
          </b>
        </p>
      </div>

      <div className="space-y-2">
        <Label className="block text-sm font-medium text-primary">
          Default Profile Visibility
        </Label>
        <Select
          value={defaultProfileVisibilityField.value}
          onValueChange={defaultProfileVisibilityField.onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select default visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="organization">
              Organization Only - Recommended for most organizations
            </SelectItem>
            <SelectItem value="public">Public - Visible to everyone</SelectItem>
            <SelectItem value="private">
              Private - Only visible to the user
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allowExternalFeedback"
          checked={allowExternalFeedbackField.value}
          onCheckedChange={allowExternalFeedbackField.onChange}
        />
        <Label htmlFor="allowExternalFeedback" className="text-sm">
          Allow users to receive feedback from external sources by default
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="requireApproval"
          checked={requireApprovalField.value}
          onCheckedChange={requireApprovalField.onChange}
        />
        <Label htmlFor="requireApproval" className="text-sm">
          Require admin approval for users to make their profiles public
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allowUserInvites"
          checked={allowUserInvitesField.value}
          onCheckedChange={allowUserInvitesField.onChange}
        />
        <Label htmlFor="allowUserInvites" className="text-sm">
          Allow users to invite others to the organization
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableGroupManagement"
          checked={enableGroupManagementField.value}
          onCheckedChange={enableGroupManagementField.onChange}
        />
        <Label htmlFor="enableGroupManagement" className="text-sm">
          Enable group management (teams, departments, etc.)
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="requireEmailVerification"
          checked={requireEmailVerificationField.value}
          onCheckedChange={requireEmailVerificationField.onChange}
        />
        <Label htmlFor="requireEmailVerification" className="text-sm">
          Require email verification for new users
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableSSO"
          checked={enableSSOField.value}
          onCheckedChange={enableSSOField.onChange}
        />
        <Label htmlFor="enableSSO" className="text-sm">
          Enable SSO integration (Google Workspace, etc.)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableOrgFeedback"
          checked={enableOrgFeedbackField.value}
          onCheckedChange={enableOrgFeedbackField.onChange}
        />
        <Label htmlFor="enableOrgFeedback" className="text-sm">
          Enable organization-wide feedback collection
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="allowAnonymous"
          checked={allowAnonymousField.value}
          onCheckedChange={allowAnonymousField.onChange}
        />
        <Label htmlFor="allowAnonymous" className="text-sm">
          Allow anonymous feedback within the organization
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableModeration"
          checked={enableModerationField.value}
          onCheckedChange={enableModerationField.onChange}
        />
        <Label htmlFor="enableModeration" className="text-sm">
          Enable feedback moderation and review process
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autoApproveInternal"
          checked={autoApproveInternalField.value}
          onCheckedChange={autoApproveInternalField.onChange}
        />
        <Label htmlFor="autoApproveInternal" className="text-sm">
          Auto-approve feedback between organization members
        </Label>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "organization",
  label: "Organization",
  schema: organizationSchema,
};

export const defaults = (_user?: User): OrganizationFormValues => ({
  organizationName: "",
  organizationSlug: "",
  defaultUserSettings: {
    defaultProfileVisibility: "organization",
    allowExternalFeedback: false,
    requireApprovalForPublicProfiles: true,
  },
  organizationSettings: {
    allowUserInvites: true,
    enableGroupManagement: true,
    requireEmailVerification: true,
    enableSSOIntegration: false,
  },
  feedbackSettings: {
    enableOrganizationFeedback: true,
    allowAnonymousFeedback: false,
    enableFeedbackModeration: true,
    autoApproveInternalFeedback: true,
  },
});
