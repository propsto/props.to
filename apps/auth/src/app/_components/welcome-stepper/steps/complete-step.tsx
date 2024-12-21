"use client";

import { z } from "zod";
import { type Step } from "@stepperize/react";

const completeSchema = z.object({});

export type CompleteFormValues = z.infer<typeof completeSchema>;

export function StepComponent(): React.ReactElement {
  return <div className="text-center">Thank you!</div>;
}

export const config: Step = {
  id: "complete",
  label: "Complete",
  schema: completeSchema,
};

export const defaults = (): CompleteFormValues => ({});
