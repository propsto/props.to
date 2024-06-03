"use client";

import { useFormStatus } from "react-dom";
import { icons } from "../atoms/icons";
import { Button } from "../atoms/button";

export const AvailableIcons = {
  Success: "Success",
  Failure: "Failure",
} as const;

type AvailableIconNames = (typeof AvailableIcons)[keyof typeof AvailableIcons];

const availableIcons: Record<AvailableIconNames, React.ElementType> = {
  [AvailableIcons.Success]: icons.Check,
  [AvailableIcons.Failure]: icons.Cross,
};

export interface SubmitButtonProps {
  message: string;
  iconName?: AvailableIconNames;
}

export function SubmitButton({
  state,
  children,
}: {
  state: SubmitButtonProps;
  children: React.ReactNode;
}): JSX.Element {
  const { pending } = useFormStatus();
  const { message, iconName } = state;
  const Icon = iconName ? availableIcons[iconName] : undefined;

  return (
    <Button disabled={pending}>
      {pending ? (
        <icons.LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
      {message || children}
    </Button>
  );
}
