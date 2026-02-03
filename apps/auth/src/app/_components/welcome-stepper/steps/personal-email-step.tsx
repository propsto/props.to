"use client";

import { z } from "zod";
import { Input, Label, Button, Card } from "@propsto/ui/atoms";
import { useFormContext } from "react-hook-form";
import { type Step } from "@stepperize/react";
import { type User } from "next-auth";
import {
  MailIcon,
  ShieldCheckIcon,
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  Loader2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { sendPersonalEmailCodeHandler } from "@/server/welcome-stepper-action";

// Common personal email domains that are acceptable
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "zoho.com",
  "fastmail.com",
  "tutanota.com",
];

const personalEmailSchema = z.object({
  personalEmail: z
    .string()
    .email("Please enter a valid email address"),
  verificationCode: z.string().length(6, "Code must be 6 digits").optional(),
});

export type PersonalEmailFormValues = z.infer<typeof personalEmailSchema>;

interface StepComponentProps {
  workEmail?: string | null;
  hostedDomain?: string | null;
  userId?: string;
  userName?: string;
}

export function StepComponent({
  workEmail,
  hostedDomain,
  userId,
  userName,
}: StepComponentProps): React.ReactElement {
  const {
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useFormContext<PersonalEmailFormValues>();

  const [verificationSent, setVerificationSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const personalEmail = watch("personalEmail");

  // Extract organization name from domain
  const orgName = hostedDomain
    ? hostedDomain.split(".")[0]?.charAt(0).toUpperCase() +
      hostedDomain.split(".")[0]?.slice(1)
    : "your company";

  // Check if entered email looks like a work email (same domain as work)
  const emailDomain = personalEmail?.split("@")[1]?.toLowerCase();
  const isWorkDomain = emailDomain === hostedDomain?.toLowerCase();
  const isPersonalDomain = emailDomain && PERSONAL_EMAIL_DOMAINS.includes(emailDomain);

  const handleSendCode = () => {
    if (!personalEmail || !userId) return;

    clearErrors();

    if (isWorkDomain) {
      setError("personalEmail", {
        message: "Please use a personal email, not your work email",
      });
      return;
    }

    startTransition(async () => {
      const result = await sendPersonalEmailCodeHandler(
        personalEmail,
        userId,
        userName,
        workEmail ?? undefined,
      );

      if (result.success) {
        setVerificationSent(true);
      } else {
        setError("personalEmail", {
          message: result.error ?? "Failed to send verification code",
        });
      }
    });
  };

  return (
    <div className="space-y-6 text-start">
      {/* Why This Matters Card */}
      <Card className="p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <div className="flex gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-800 dark:text-amber-200">
            <p className="font-semibold">Your feedback belongs to you</p>
            <p className="mt-1 text-sm">
              If you ever leave {orgName}, you&apos;ll lose access to{" "}
              <strong>{workEmail}</strong>. Your personal email ensures you keep
              all the feedback you&apos;ve received — it&apos;s yours, not the
              company&apos;s.
            </p>
          </div>
        </div>
      </Card>

      {!verificationSent ? (
        <>
          {/* Personal Email Input */}
          <div className="space-y-2">
            <Label
              htmlFor="personalEmail"
              className="block text-sm font-medium text-primary"
            >
              Personal email address
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="personalEmail"
                type="email"
                {...register("personalEmail")}
                placeholder="you@gmail.com"
                className="pl-10"
                autoComplete="email"
              />
            </div>
            {errors.personalEmail ? (
              <span className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                {errors.personalEmail.message}
              </span>
            ) : isWorkDomain ? (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                This looks like your work email. Please use a personal email.
              </span>
            ) : isPersonalDomain ? (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircleIcon className="h-3 w-3" />
                Great choice! This is a personal email you&apos;ll always have access to.
              </span>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use a personal email you&apos;ll always have access to (Gmail, Outlook, etc.)
              </p>
            )}
          </div>

          {/* Send Code Button */}
          <Button
            type="button"
            onClick={handleSendCode}
            disabled={!personalEmail || isWorkDomain || isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              "Send verification code"
            )}
          </Button>
        </>
      ) : (
        <>
          {/* Verification Sent Confirmation */}
          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <div className="flex gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-green-800 dark:text-green-200">
                <p className="font-semibold">Verification code sent</p>
                <p className="mt-1 text-sm">
                  We&apos;ve sent a 6-digit code to <strong>{personalEmail}</strong>.
                  Enter it below to verify your email.
                </p>
              </div>
            </div>
          </Card>

          {/* Verification Code Input */}
          <div className="space-y-2">
            <Label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-primary"
            >
              Verification code
            </Label>
            <Input
              id="verificationCode"
              type="text"
              {...register("verificationCode")}
              placeholder="123456"
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
            {errors.verificationCode && (
              <span className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                {errors.verificationCode.message}
              </span>
            )}
          </div>

          {/* Resend Option */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setVerificationSent(false)}
              className="text-sm"
            >
              Use a different email
            </Button>
          </div>
        </>
      )}

      {/* What This Means */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
          What happens with your personal email?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• You can receive feedback at both work and personal emails</li>
          <li>• If you leave {orgName}, feedback transfers to your personal email</li>
          <li>• You can always sign in with your personal email as backup</li>
          <li>• Your personal email stays private — colleagues won&apos;t see it</li>
        </ul>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "personal-email",
  label: "Backup Email",
  schema: personalEmailSchema,
};

export const defaults = (_user?: User): PersonalEmailFormValues => ({
  personalEmail: "",
  verificationCode: undefined,
});

/**
 * Check if the personal email step is complete
 * This step is only required for Google Workspace users.
 * It's complete when they have a verified personal email linked.
 */
export function isStepComplete(
  user?: User & { personalEmailVerified?: Date | string | null; hostedDomain?: string | null },
): boolean {
  // Non-Google Workspace users skip this step
  if (!user?.hostedDomain) {
    return true;
  }
  // Google Workspace users need a verified personal email
  return Boolean(user.personalEmailVerified);
}
