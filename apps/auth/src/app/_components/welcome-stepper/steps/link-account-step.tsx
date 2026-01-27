"use client";

import { z } from "zod";
import { Input, Label, Button, Card } from "@propsto/ui/atoms";
import { useFormContext } from "react-hook-form";
import { type Step } from "@stepperize/react";
import { type User } from "next-auth";
import {
  LinkIcon,
  KeyIcon,
  MailIcon,
  AlertCircleIcon,
  InfoIcon,
  CheckCircleIcon,
} from "lucide-react";
import { useState } from "react";

const linkAccountSchema = z.object({
  verificationMethod: z.enum(["password", "magic-link"]).default("password"),
  password: z.string().optional(),
});

export type LinkAccountFormValues = z.infer<typeof linkAccountSchema>;

interface StepComponentProps {
  email?: string | null;
  hostedDomain?: string | null;
  magicLinkSent?: boolean;
  onMagicLinkSent?: () => void;
}

export function StepComponent({
  email,
  hostedDomain,
  magicLinkSent: initialMagicLinkSent = false,
}: StepComponentProps): React.ReactElement {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<LinkAccountFormValues>();

  const [magicLinkSent, setMagicLinkSent] = useState(initialMagicLinkSent);
  const verificationMethod = watch("verificationMethod") ?? "password";

  const handleMethodChange = (method: "password" | "magic-link") => {
    setValue("verificationMethod", method);
    if (method === "password") {
      setMagicLinkSent(false);
    }
  };

  // Extract organization name from domain
  const orgName = hostedDomain
    ? hostedDomain.split(".")[0]?.charAt(0).toUpperCase() +
      hostedDomain.split(".")[0]?.slice(1)
    : null;

  return (
    <div className="space-y-6 text-start">
      {/* Info Card */}
      <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex gap-3">
          <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-800 dark:text-blue-200">
            <p className="font-semibold">Link your existing account</p>
            <p className="mt-1 text-sm">
              An account with <strong>{email}</strong> already exists. To use
              Google sign-in{orgName ? ` and join ${orgName}` : ""}, please
              verify you own this account.
            </p>
          </div>
        </div>
      </Card>

      {/* Verification Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-primary">
          Choose verification method
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={verificationMethod === "password" ? "default" : "outline"}
            onClick={() => handleMethodChange("password")}
            className="flex flex-col items-center justify-center h-24 gap-2"
          >
            <KeyIcon className="h-6 w-6" />
            <span className="text-sm">Use Password</span>
          </Button>

          <Button
            type="button"
            variant={
              verificationMethod === "magic-link" ? "default" : "outline"
            }
            onClick={() => handleMethodChange("magic-link")}
            className="flex flex-col items-center justify-center h-24 gap-2"
          >
            <MailIcon className="h-6 w-6" />
            <span className="text-sm">Send Magic Link</span>
          </Button>
        </div>
      </div>

      {/* Password Input */}
      {verificationMethod === "password" && (
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-primary"
          >
            Enter your password
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="Your existing account password"
            className="block w-full"
            autoComplete="current-password"
          />
          {errors.password ? (
            <span className="text-sm text-destructive">
              {errors.password.message}
            </span>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Enter the password you use to sign in to your existing account.
          </p>
        </div>
      )}

      {/* Magic Link Info */}
      {verificationMethod === "magic-link" && (
        <div className="space-y-4">
          {magicLinkSent ? (
            <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <div className="flex gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-800 dark:text-green-200">
                  <p className="font-semibold">Check your email</p>
                  <p className="mt-1 text-sm">
                    We&apos;ve sent a verification link to{" "}
                    <strong>{email}</strong>. Click the link in the email to
                    complete account linking.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Click <strong>Next</strong> to send a verification link to{" "}
                <strong>{email}</strong>. Once you click the link, your Google
                account will be linked automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden field for verification method */}
      <input type="hidden" {...register("verificationMethod")} />

      {/* What happens after linking */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          What happens after verification?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Your Google account will be linked to your existing account</li>
          <li>- You can sign in with either Google or your password</li>
          {hostedDomain && (
            <li>
              - You&apos;ll continue to set up your <strong>{orgName}</strong>{" "}
              organization membership
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "link-account",
  label: "Link Account",
  schema: linkAccountSchema,
};

export const defaults = (_user?: User): LinkAccountFormValues => ({
  verificationMethod: "password",
  password: undefined,
});

/**
 * Check if the link account step is complete
 * This step is only required when there's a pending account link.
 * @param linkStatus - "none" means no pending link (step complete/not needed), "pending" means user must complete linking
 */
export function isStepComplete(
  linkStatus: "none" | "pending" = "none",
): boolean {
  // Step is complete (or not required) when there's no pending link
  return linkStatus === "none";
}
