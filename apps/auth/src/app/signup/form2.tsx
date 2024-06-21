"use client";

import { Button } from "@propsto/ui/atoms";
import {
  Step,
  Stepper,
  useStepper,
  type StepItem,
} from "@propsto/ui/organisms/stepper";

const steps = [
  { label: "Step 1", description: "Description 1" },
  { label: "Step 2", description: "Description 2" },
  { label: "Step 3", description: "Description 3" },
] satisfies StepItem[];

export default function StepperDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Stepper initialstep={0} steps={steps} orientation="vertical">
        {steps.map(({ label }, index) => {
          return (
            <Step key={label} label={label} index={index}>
              <div className="h-40 flex items-center justify-center my-4 border bg-secondary text-primary rounded-md">
                <h1 className="text-xl">Step {index + 1}</h1>
              </div>
            </Step>
          );
        })}
        <Footer />
      </Stepper>
    </div>
  );
}

function Footer() {
  const {
    nextStep,
    prevStep,
    resetSteps,
    isDisabledStep,
    hasCompletedAllSteps,
    isLastStep,
    isOptionalStep,
  } = useStepper();
  return (
    <>
      {hasCompletedAllSteps ? (
        <div className="h-40 flex items-center justify-center my-4 border bg-secondary text-primary rounded-md">
          <h1 className="text-xl">Woohoo! All steps completed! 🎉</h1>
        </div>
      ) : null}
      <div className="w-full flex justify-end gap-2">
        {hasCompletedAllSteps ? (
          <Button size="sm" onClick={resetSteps}>
            Reset
          </Button>
        ) : (
          <>
            <Button
              disabled={isDisabledStep}
              onClick={prevStep}
              size="sm"
              variant="secondary"
            >
              Prev
            </Button>
            <Button size="sm" onClick={nextStep}>
              {(() => {
                if (isLastStep) {
                  return "Finish";
                } else if (isOptionalStep) {
                  return "Skip";
                }
                return "Next";
              })()}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
