"use client";

import { z } from "zod";
import { Label, Button } from "@propsto/ui/atoms";
import { useFormContext } from "react-hook-form";
import { type Step } from "@stepperize/react";
import { type User } from "next-auth";
import { Building2Icon, CheckCircleIcon } from "lucide-react";

const organizationJoinSchema = z.object({
  // Confirmation that user wants to join the organization
  confirmJoin: z.boolean().default(true),
});

export type OrganizationJoinFormValues = z.infer<typeof organizationJoinSchema>;

interface StepComponentProps {
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
}

export function StepComponent({
  hostedDomain,
  isGoogleWorkspaceAdmin,
}: StepComponentProps): React.ReactElement {
  const { setValue, watch } = useFormContext<OrganizationJoinFormValues>();
  const confirmJoin = watch("confirmJoin");

  // Extract organization name from domain (e.g., "acme.com" -> "Acme")
  const orgNameFromDomain = hostedDomain
    ? hostedDomain.split(".")[0].charAt(0).toUpperCase() +
      hostedDomain.split(".")[0].slice(1)
    : "your organization";

  const roleDescription = isGoogleWorkspaceAdmin
    ? "As a Google Workspace administrator, you'll join as an admin with organization management privileges."
    : "You'll join as a member and will be able to receive and give feedback within your organization.";

  return (
    <div className="space-y-6 text-start">
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-shrink-0">
          <Building2Icon className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Join {orgNameFromDomain} on Props.to
          </h3>
          <p className="text-sm text-muted-foreground">
            Your organization ({hostedDomain}) is already set up on Props.to.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <Label className="block text-sm font-medium text-primary mb-2">
            Your Role
          </Label>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium">
              {isGoogleWorkspaceAdmin ? "Administrator" : "Member"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {roleDescription}
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              - You&apos;ll be added to <strong>{orgNameFromDomain}</strong> on
              Props.to
            </li>
            <li>
              - Your personal account remains separate from your work account
            </li>
            <li>
              - You can receive feedback at{" "}
              <strong>
                props.to/{hostedDomain?.split(".")[0]}/your-username
              </strong>
            </li>
            {isGoogleWorkspaceAdmin ? (
              <li>- You can manage organization settings and members</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center pt-4">
        <Button
          type="button"
          variant={confirmJoin ? "default" : "outline"}
          onClick={() => {
            setValue("confirmJoin", true);
          }}
          className="w-full max-w-xs"
        >
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          Join {orgNameFromDomain}
        </Button>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "organization-join",
  label: "Join Organization",
  schema: organizationJoinSchema,
};

export const defaults = (_user?: User): OrganizationJoinFormValues => ({
  confirmJoin: true,
});
