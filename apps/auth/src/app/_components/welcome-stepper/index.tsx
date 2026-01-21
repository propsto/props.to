"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { defineStepper } from "@stepperize/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { type User as NextAuthUser } from "next-auth";
import { Button, Separator, Card } from "@propsto/ui/atoms";
import {
  Building2Icon,
  CogIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
  LinkIcon,
} from "lucide-react";
import { constServer } from "@propsto/constants/server";
import { cn } from "@propsto/ui/lib/utils";
import {
  applyHandleEventToForm,
  type FormLike,
} from "@propsto/ui/lib/form-result";
import { constClient } from "@propsto/constants/client";
import {
  accountHandler,
  personalHandler,
  organizationHandler,
  organizationJoinHandler,
  linkAccountHandler,
} from "@/server/welcome-stepper-action";
import {
  config,
  formDefaults,
  stepComponents,
  type StepNames,
  type AccountFormValues,
  type OrganizationFormValues,
  type OrganizationJoinFormValues,
  type OrganizationStatus,
  type LinkAccountStatus,
  type LinkAccountFormValues,
  canUserAccessStep,
  getNextStepForUser,
  getVisibleSteps,
  type PersonalFormValues,
} from "./steps";
import { StepComponent as LinkAccountStepComponent } from "./steps/link-account-step";
import { StepComponent as AccountStepComponent } from "./steps/account-step";
import { StepComponent as OrganizationStepComponent } from "./steps/organization-step";
import { StepComponent as OrganizationJoinStepComponent } from "./steps/organization-join-step";
import { StepComponent as PendingOrganizationStepComponent } from "./steps/pending-organization-step";

const { useStepper } = defineStepper(...config);

const stepIcons: Record<string, typeof CogIcon> = {
  "link-account": LinkIcon,
  account: CogIcon,
  personal: UserIcon,
  organization: Building2Icon,
  "organization-join": Building2Icon,
  "pending-organization": Building2Icon,
  complete: CheckIcon,
};

type GenericFormValues = Record<string, unknown>;
type StepFormStore = Partial<Record<StepNames, GenericFormValues>>;

// Extended user type with Google Workspace fields and account linking
type WelcomeUser = NextAuthUser & {
  id: string;
  email: string;
  hostedDomain?: string | null;
  isGoogleWorkspaceAdmin?: boolean;
  pendingLinkToken?: string | null;
};

export function WelcomeStepper({
  user,
  initialStep,
  orgStatus,
  linkStatus = "none",
}: Readonly<{
  user: WelcomeUser;
  initialStep: StepNames;
  orgStatus: OrganizationStatus;
  linkStatus?: LinkAccountStatus;
}>): React.ReactElement {
  const stepper = useStepper(initialStep);
  const router = useRouter();
  const pathname = usePathname();

  // Store form data across steps
  const [formData, setFormData] = useState<StepFormStore>({});

  const defaultValues = formDefaults[stepper.current.id](
    user,
  ) as GenericFormValues;

  // Use a type assertion to work around the deep instantiation issue
  const form = useForm<GenericFormValues>({
    defaultValues,
  });

  const navigateToStep = (step: StepNames): void => {
    const searchParams = new URLSearchParams({ step });
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    stepper.goTo(initialStep);
  }, [initialStep, stepper]);

  // Reset form with correct default values when step changes
  useEffect(() => {
    const currentStepDefaults = formDefaults[stepper.current.id](
      user,
    ) as GenericFormValues;

    // Merge stored form data with defaults for the current step
    const storedValues = formData[stepper.current.id];
    const mergedDefaults =
      storedValues && typeof storedValues === "object"
        ? { ...currentStepDefaults, ...storedValues }
        : currentStepDefaults;

    form.reset(mergedDefaults);
  }, [stepper.current.id, form, user, formData, stepper]);

  // Save form data when navigating away from a step
  const saveCurrentStepData = (): void => {
    const currentValues = form.getValues();
    setFormData(prev => ({
      ...prev,
      [stepper.current.id]: currentValues,
    }));
  };

  const onSubmit = async (values: GenericFormValues): Promise<void> => {
    // Save current step data before proceeding
    setFormData(prev => ({
      ...prev,
      [stepper.current.id]: values,
    }));

    await stepper.switch({
      "link-account": async () => {
        const result = await linkAccountHandler(
          values as LinkAccountFormValues,
          user.pendingLinkToken ?? "",
          user.email,
        );
        if (result.success) {
          if (result.data === null) {
            // Magic link was sent - stay on current step and update UI
            // The link-account-step component will show the "check email" message
            // when the form is submitted with magic-link method
            form.setError("root", {
              type: "info",
              message: "Magic link sent! Check your email to complete linking.",
            });
          } else {
            // Account linked successfully, continue with personal step
            const nextStep = getNextStepForUser(
              user,
              "link-account",
              orgStatus,
            );
            navigateToStep(nextStep);
          }
        } else {
          applyHandleEventToForm<LinkAccountFormValues>(
            form as unknown as FormLike<LinkAccountFormValues>,
            result,
            ["password", "verificationMethod"],
          );
        }
      },
      account: async () => {
        const result = await accountHandler(
          values as AccountFormValues,
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "account", orgStatus);
          navigateToStep(nextStep);
        } else {
          applyHandleEventToForm<AccountFormValues>(
            form as unknown as FormLike<AccountFormValues>,
            result,
            ["username"],
          );
        }
      },
      personal: async () => {
        const result = await personalHandler(
          {
            firstName: String(values.firstName),
            lastName: String(values.lastName),
            email: String(values.email),
            dateOfBirth: String(values.dateOfBirth ?? ""),
            image: values.image as string | File[] | undefined,
          },
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "personal", orgStatus);
          navigateToStep(nextStep);
        } else {
          applyHandleEventToForm<PersonalFormValues>(
            form as unknown as FormLike<PersonalFormValues>,
            result,
            ["firstName", "lastName", "email", "dateOfBirth", "image"],
          );
        }
      },
      organization: async () => {
        const result = await organizationHandler(
          values as OrganizationFormValues,
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "organization", orgStatus);
          navigateToStep(nextStep);
        } else {
          applyHandleEventToForm<OrganizationFormValues>(
            form as unknown as FormLike<OrganizationFormValues>,
            result,
            [
              "organizationName",
              "organizationSlug",
              "defaultUserSettings.defaultProfileVisibility",
              "organizationSettings.allowUserInvites",
              "feedbackSettings.enableOrganizationFeedback",
            ],
          );
        }
      },
      "organization-join": async () => {
        const result = await organizationJoinHandler(
          values as OrganizationJoinFormValues,
          user.id,
          user.hostedDomain ?? "",
          user.isGoogleWorkspaceAdmin ?? false,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(
            user,
            "organization-join",
            orgStatus,
          );
          navigateToStep(nextStep);
        } else {
          // Organization join has minimal form validation
          form.setError("root", { message: result.error });
        }
      },
      "pending-organization": async () => {
        // No server action needed - just navigate to complete
        const nextStep = getNextStepForUser(
          user,
          "pending-organization",
          orgStatus,
        );
        navigateToStep(nextStep);
      },
      complete: () => redirect(constServer.PROPSTO_APP_URL),
    });
  };

  const handleStepClick = (stepId: StepNames): void => {
    // Check if user can access this step
    if (!canUserAccessStep(user, stepId, orgStatus, linkStatus)) {
      return; // Don't allow navigation to restricted steps
    }

    // Save current form data before switching
    saveCurrentStepData();
    stepper.goTo(stepId);
    navigateToStep(stepId);
  };

  // Get only the steps visible for this user
  const visibleSteps = getVisibleSteps(user, orgStatus, linkStatus);
  const visibleStepConfigs = stepper.all.filter(step =>
    visibleSteps.includes(step.id),
  );

  // Create step components with user-specific props
  const stepComponentsWithProps = {
    ...stepComponents,
    "link-account": () => (
      <LinkAccountStepComponent
        email={user.email}
        hostedDomain={user.hostedDomain}
      />
    ),
    account: () => (
      <AccountStepComponent
        hostedDomain={user.hostedDomain}
        email={user.email}
      />
    ),
    organization: () => (
      <OrganizationStepComponent hostedDomain={user.hostedDomain} />
    ),
    "organization-join": () => (
      <OrganizationJoinStepComponent
        hostedDomain={user.hostedDomain}
        isGoogleWorkspaceAdmin={user.isGoogleWorkspaceAdmin}
      />
    ),
    "pending-organization": () => (
      <PendingOrganizationStepComponent hostedDomain={user.hostedDomain} />
    ),
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={event => void form.handleSubmit(onSubmit)(event)}
        className="space-y-6 p-6 border rounded-lg lg:w-3/4"
      >
        <Card className="p-4">
          <nav aria-label="Account setup steps" className="group">
            <ol className="flex items-center justify-between gap-2">
              {visibleStepConfigs.map((step, index, array) => {
                const StepIcon = stepIcons[step.id] ?? CogIcon;
                return (
                  <React.Fragment key={step.id}>
                    <li className="flex flex-col items-center gap-2 flex-shrink-0">
                      <Button
                        type="button"
                        role="tab"
                        size="lg"
                        variant={
                          stepper.current.id === step.id ? "default" : "outline"
                        }
                        aria-current={
                          stepper.current.id === step.id ? "step" : undefined
                        }
                        aria-posinset={index + 1}
                        aria-setsize={stepper.all.length}
                        aria-selected={stepper.current.id === step.id}
                        className={cn(
                          "relative flex size-12 items-center justify-center rounded-full transition-all duration-200",
                        )}
                        onClick={() => {
                          handleStepClick(step.id);
                        }}
                      >
                        <span>
                          <StepIcon className="size-5" />
                        </span>
                      </Button>

                      {/* Step Label with Status Badge */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium transition-colors text-primary">
                          {step.label}
                        </span>
                      </div>
                    </li>

                    {/* Enhanced Separator */}
                    {index < array.length - 1 && (
                      <Separator className="flex-1 h-0.5 bg-primary" />
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
          </nav>
        </Card>

        <div className="space-y-4">
          {stepper.switch(stepComponentsWithProps)}
          {!stepper.isLast ? (
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  router.back();
                }}
                disabled={stepper.isFirst}
              >
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          ) : (
            <div className="flex flex-row justify-end">
              <Button
                onClick={() => {
                  window.location.href =
                    constClient.NEXT_PUBLIC_PROPSTO_APP_URL;
                }}
                className="self-end"
              >
                Go to Dashboard <ArrowRightIcon className="size-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
