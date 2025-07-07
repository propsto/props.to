"use client";

import { z } from "zod";
import { type Step } from "@stepperize/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@propsto/ui/atoms";

const completeSchema = z.object({});

export type CompleteFormValues = z.infer<typeof completeSchema>;

export function StepComponent(): React.ReactElement {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">Welcome to Props.to!</h2>
        <p className="text-muted-foreground">
          Your account has been successfully set up with your preferences.
        </p>
      </div>

      <div className="space-y-4 text-left bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-sm">What we&apos;ve configured:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✓ Your username and profile settings</li>
          <li>✓ Notification preferences</li>
          <li>✓ Privacy settings</li>
          <li>✓ Account type and role</li>
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          You can always update these settings later in your account preferences.
        </p>
        <Button 
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "complete",
  label: "Complete",
  schema: completeSchema,
};

export const defaults = (): CompleteFormValues => ({});