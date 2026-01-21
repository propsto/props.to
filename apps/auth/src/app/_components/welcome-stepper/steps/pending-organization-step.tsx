"use client";

import { z } from "zod";
import { type Step } from "@stepperize/react";
import { type User } from "next-auth";
import { Building2Icon, ClockIcon, BellIcon } from "lucide-react";

const pendingOrganizationSchema = z.object({
  // Acknowledgment that user understands org is pending
  acknowledged: z.boolean().default(true),
});

export type PendingOrganizationFormValues = z.infer<
  typeof pendingOrganizationSchema
>;

interface StepComponentProps {
  hostedDomain?: string | null;
}

export function StepComponent({
  hostedDomain,
}: StepComponentProps): React.ReactElement {
  // Extract organization name from domain (e.g., "acme.com" -> "Acme")
  const orgNameFromDomain = hostedDomain
    ? hostedDomain.split(".")[0].charAt(0).toUpperCase() +
      hostedDomain.split(".")[0].slice(1)
    : "your organization";

  return (
    <div className="space-y-6 text-start">
      <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
        <div className="flex-shrink-0">
          <ClockIcon className="w-12 h-12 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {orgNameFromDomain} isn&apos;t on Props.to yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Your organization hasn&apos;t been set up on Props.to by an
            administrator.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building2Icon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">What this means</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A Google Workspace administrator from {hostedDomain} needs to sign
            in to Props.to first to set up your organization. Once they do,
            you&apos;ll be able to join automatically.
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center gap-2 mb-2">
            <BellIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium">In the meantime</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Your personal Props.to account is ready to use</li>
            <li>- You can receive feedback at your personal profile</li>
            <li>
              - When {orgNameFromDomain} is set up, you&apos;ll be notified
            </li>
            <li>
              - All your feedback history will be preserved on your personal
              account
            </li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg border-dashed">
          <p className="text-sm text-center text-muted-foreground">
            You can continue to complete your profile setup. We&apos;ll let you
            know when your organization is ready!
          </p>
        </div>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "pending-organization",
  label: "Organization",
  schema: pendingOrganizationSchema,
};

export const defaults = (_user?: User): PendingOrganizationFormValues => ({
  acknowledged: true,
});

// Extended user type that includes hostedDomain and isGoogleWorkspaceAdmin
type WelcomeUser = User & {
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
};

// Organization status type
type OrganizationStatus = "none" | "exists" | "not_exists" | "member";

/**
 * Check if the pending-organization step is complete or not required
 * This step is informational only for non-admin users when no org exists for their domain.
 * It's always considered "complete" since user just needs to acknowledge and move on.
 * @param user - The user object with hostedDomain and isGoogleWorkspaceAdmin
 * @param orgStatus - The organization status for the user's domain
 */
export function isStepComplete(
  user?: WelcomeUser,
  orgStatus: OrganizationStatus = "none",
): boolean {
  // No hosted domain means no org step needed
  if (!user?.hostedDomain || orgStatus === "none") {
    return true;
  }

  // User is already a member of the org for their domain
  if (orgStatus === "member") {
    return true;
  }

  // This step is only for non-admins when org doesn't exist
  // For admins, they go to "organization" step
  // For non-admins when org exists, they go to "organization-join" step
  if (user.isGoogleWorkspaceAdmin || orgStatus === "exists") {
    return true;
  }

  // Non-admin with no existing org - this is just informational
  // Since there's no action required (just acknowledgement), we consider this
  // step as "always passable" - the user can proceed without blocking
  return true;
}
