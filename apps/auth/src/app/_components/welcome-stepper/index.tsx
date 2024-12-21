"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { defineStepper } from "@stepperize/react";
import { Button, Separator } from "@propsto/ui/atoms";
import { Form } from "@propsto/ui/molecules";
import { constCommon } from "@propsto/constants/common";
import { redirect, usePathname, useRouter } from "next/navigation";
import { type User } from "next-auth";
import {
  accountHandler,
  personalHandler,
} from "@/server/welcome-stepper-action";
import {
  config,
  formDefaults,
  stepComponents,
  type StepNames,
  type PersonalFormValues,
  type AccountFormValues,
} from "./steps";

const { useStepper, steps } = defineStepper(...config);

export function WelcomeStepper({
  user,
  initialStep,
}: Readonly<{
  user: Required<Omit<User, "name">>;
  initialStep: StepNames;
}>): React.ReactElement {
  const stepper = useStepper(initialStep);
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm<z.infer<typeof stepper.current.schema>>({
    resolver: zodResolver(stepper.current.schema),
    defaultValues: formDefaults[stepper.current.id](user),
  });

  const navigateToStep = (step: StepNames): void => {
    const searchParams = new URLSearchParams({ step });
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  useEffect(() => {
    stepper.goTo(initialStep);
  }, [initialStep, stepper]);

  const onSubmit = async (
    values: z.infer<typeof stepper.current.schema>,
  ): Promise<void> => {
    await stepper.switch({
      account: async () => {
        const result = await accountHandler(values as AccountFormValues);
        if (result.success) {
          navigateToStep("complete");
        }
      },
      personal: async () => {
        const result = await personalHandler(
          values as PersonalFormValues,
          user.id,
        );
        if (result.success) {
          navigateToStep("account");
        }
      },
      complete: () => redirect(constCommon.PROPSTO_APP_URL),
    });
  };

  return (
    <Form {...form}>
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
        <nav aria-label="Account setup steps" className="group my-4">
          <ol className="flex items-center justify-between gap-2">
            {stepper.all.map((step, index, array) => (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-4 flex-shrink-0">
                  <Button
                    type="button"
                    role="tab"
                    variant={
                      index <= stepper.current.index ? "default" : "secondary"
                    }
                    aria-current={
                      stepper.current.id === step.id ? "step" : undefined
                    }
                    aria-posinset={index + 1}
                    aria-setsize={steps.length}
                    aria-selected={stepper.current.id === step.id}
                    className="flex size-10 items-center justify-center rounded-full"
                    onClick={() => {
                      stepper.goTo(step.id);
                    }}
                  >
                    {index + 1}
                  </Button>
                  <span className="text-sm font-medium">{step.label}</span>
                </li>
                {index < array.length - 1 && (
                  <Separator
                    className={`flex-1 ${
                      index < stepper.current.index ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
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
    </Form>
  );
}
