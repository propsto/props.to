"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import { Button } from "../atoms/button";
import { type ButtonVariant } from "../atoms/button";

export const AvailableIcons = {
  Success: "Success",
  Failure: "Failure",
} as const;

type AvailableIconNames = (typeof AvailableIcons)[keyof typeof AvailableIcons];

const availableIcons: Record<AvailableIconNames, React.ElementType> = {
  [AvailableIcons.Success]: Check,
  [AvailableIcons.Failure]: CircleX,
};

export type SubmitButtonProps = {
  retry: number;
  message: string;
  iconName?: keyof typeof availableIcons;
  variant?: ButtonVariant;
};

export function SubmitButton({
  state,
  children,
}: Readonly<{
  state: SubmitButtonProps;
  children: React.ReactNode;
}>): JSX.Element {
  const [inState, setInState] = React.useState<SubmitButtonProps>(state);
  const { pending } = useFormStatus();
  const Icon = inState.iconName ? availableIcons[inState.iconName] : undefined;

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (state.message) {
      setInState(state);
      timeoutId = setTimeout(() => {
        setInState({
          retry: state.retry,
          message: "",
          iconName: undefined,
          variant: undefined,
        });
      }, 4000);
    }

    return () => clearTimeout(timeoutId);
  }, [state.retry]);

  return (
    <Button
      disabled={pending || !!inState.message}
      type="submit"
      variant={inState.variant}
    >
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
      {inState.message || children}
    </Button>
  );
}
