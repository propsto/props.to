import {
  createConfig,
  createFormDefaults,
  createStepComponents,
} from "@/lib/stepper-utils";
import * as personalStep from "./personal-step";
import * as accountStep from "./account-step";
import * as completeStep from "./complete-step";

export type { PersonalFormValues } from "./personal-step";
export type { AccountFormValues } from "./account-step";
export type { CompleteFormValues } from "./complete-step";

/*export const stepComponents = {
  personal: () => <personalStep.StepComponent />,
  account: () => <accountStep.StepComponent />,
  complete: () => <completeStep.StepComponent />,
};*/

const steps = [
  { name: "personal", module: personalStep },
  { name: "account", module: accountStep },
  { name: "complete", module: completeStep },
];

export const formDefaults = createFormDefaults(steps);
export const config = createConfig(steps);
export const stepComponents = createStepComponents(steps);
export const stepNames = steps.map(step => step.name);
export type StepNames = (typeof steps)[number]["name"];
