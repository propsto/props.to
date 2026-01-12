"use client";

import { z } from "zod";
import { type Step } from "@stepperize/react";
import { CheckCircle } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

const completeSchema = z.object({});

export type CompleteFormValues = z.infer<typeof completeSchema>;

const cssVarToHex = (varName: string): string => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return /^#(?:[0-9a-fA-F]{6})$/.test(v) ? v : "#FFFFFF";
};

const cssVarsToHexArray = (varNames: string[]): string[] => {
  return varNames.map(cssVarToHex);
};

export function StepComponent(): React.ReactElement {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    setWidth(mainContent?.clientWidth ?? window.innerWidth);
    setHeight(mainContent?.clientHeight ?? window.innerHeight);
  }, []);
  return (
    <div className="text-center space-y-6">
      {width !== 0 && height !== 0 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={250}
          colors={((): string[] => {
            return cssVarsToHexArray([
              "--bubble-color-0-hex",
              "--bubble-color-1-hex",
              "--bubble-color-2-hex",
              "--bubble-color-3-hex",
              "--bubble-color-4-hex",
              "--bubble-color-5-hex",
            ]);
          })()}
        />
      )}
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-primary">
          Your account has been successfully set up with your preferences.
        </h2>
      </div>

      <div className="space-y-4 text-left bg-muted p-4 rounded-lg">
        <h3 className="font-semibold text-sm">What we&apos;ve configured:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✓ Your username and profile settings</li>
          <li>✓ Notification preferences</li>
          <li>✓ Privacy settings</li>
          <li>✓ Account type and role</li>
        </ul>
      </div>

      <div className="space-y-2 flex flex-col">
        <p className="text-sm text-muted-foreground">
          You can always update these settings later in your account
          preferences.
        </p>
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
