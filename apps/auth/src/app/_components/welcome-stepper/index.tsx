"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm, type UseFormReturn, FormProvider } from "react-hook-form";
import { type z } from "zod";
import { defineStepper } from "@stepperize/react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { type User as NextAuthUser } from "next-auth";
import { Button, Separator, Card } from "@propsto/ui/atoms";
import { User, Cog, Building2, Check } from "lucide-react";
import { constServer } from "@propsto/constants/server";
import { cn } from "@propsto/ui/lib/utils";
import {
  accountHandler,
  personalHandler,
  organizationHandler,
} from "@/server/welcome-stepper-action";
import {
  config,
  formDefaults,
  stepComponents,
  type StepNames,
  type PersonalFormValues,
  type AccountFormValues,
  type OrganizationFormValues,
  canUserAccessStep,
  getNextStepForUser,
} from "./steps";

const { useStepper } = defineStepper(...config);

const stepIcons = {
  account: Cog,
  personal: User,
  organization: Building2,
  complete: Check,
};

export function WelcomeStepper({
  user,
  initialStep,
}: Readonly<{
  user: NextAuthUser & { id: string; email: string };
  initialStep: StepNames;
}>): React.ReactElement {
  const stepper = useStepper(initialStep);
  const router = useRouter();
  const pathname = usePathname();

  // Store form data across steps
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const form = useForm<z.infer<typeof stepper.current.schema>>({
    resolver: zodResolver(stepper.current.schema as z.ZodType<any>),
    defaultValues: formDefaults[stepper.current.id](user),
  }) as UseFormReturn<any>;

  const navigateToStep = (step: StepNames): void => {
    const searchParams = new URLSearchParams({ step });
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    stepper.goTo(initialStep);
  }, [initialStep, stepper]);

  // Reset form with correct default values when step changes
  useEffect(() => {
    const currentStepDefaults = formDefaults[stepper.current.id](user);

    // Merge stored form data with defaults for the current step
    const mergedDefaults = {
      ...currentStepDefaults,
      ...(formData[stepper.current.id] as Record<string, any>),
    };

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

  const onSubmit = async (values: any): Promise<void> => {
    // Save current step data before proceeding
    setFormData(prev => ({
      ...prev,
      [stepper.current.id]: values,
    }));

    await stepper.switch({
      account: async () => {
        const result = await accountHandler(
          values as AccountFormValues,
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "account");
          navigateToStep(nextStep);
        }
      },
      personal: async () => {
        const result = await personalHandler(
          values as PersonalFormValues,
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "personal");
          navigateToStep(nextStep);
        }
      },
      organization: async () => {
        const result = await organizationHandler(
          values as OrganizationFormValues,
          user.id,
        );
        if (result.success) {
          const nextStep = getNextStepForUser(user, "organization");
          navigateToStep(nextStep);
        }
      },
      complete: () => redirect(constServer.PROPSTO_APP_URL),
    });
  };

  const handleStepClick = (stepId: StepNames): void => {
    // Check if user can access this step
    if (!canUserAccessStep(user, stepId)) {
      return; // Don't allow navigation to restricted steps
    }

    // Save current form data before switching
    saveCurrentStepData();
    stepper.goTo(stepId);
    navigateToStep(stepId);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={event => void form.handleSubmit(onSubmit)(event)}
        className="space-y-6 p-6 border rounded-lg lg:w-3/4"
      >
        <div className="flex">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium">Welcome!</h2>
            <p>Lets setup your account to start sending and receiving props.</p>
          </div>
        </div>

        {/* Enhanced Step Navigation */}
        <Card className="p-4">
          <nav aria-label="Account setup steps" className="group">
            <ol className="flex items-center justify-between gap-2">
              {stepper.all.map((step, index, array) => {
                const StepIcon = stepIcons[step.id as keyof typeof stepIcons];
                return (
                  <React.Fragment key={step.id}>
                    <li className="flex flex-col items-center gap-2 flex-shrink-0">
                      {/* Step Button with Enhanced Styling */}
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
          {stepper.switch(stepComponents)}
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
            <Button onClick={stepper.reset}>Reset</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
