import { type Step } from "@stepperize/react";
import { type JSX } from "react";

interface StepModule {
  name: string;
  module: {
    StepComponent: React.FC;
    defaults: (param: any) => any; // More flexible type to handle nested objects
    config: Step;
  };
}

// Utility function to generate step components
export const createStepComponents = (
  steps: StepModule[],
): Record<string, () => JSX.Element> =>
  Object.fromEntries(
    steps.map(({ name, module }) => [name, () => <module.StepComponent />]),
  );

// Utility function to generate form defaults
export const createFormDefaults = (
  steps: StepModule[],
): Record<string, (param: any) => any> => // More flexible return type
  Object.fromEntries(steps.map(({ name, module }) => [name, module.defaults]));

// Utility function to generate config array
export const createConfig = (steps: StepModule[]): Step[] =>
  steps.map(({ module }) => module.config);
