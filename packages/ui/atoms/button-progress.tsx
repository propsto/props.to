import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

export type ButtonProgressVariant = VariantProps<
  typeof buttonVariants
>["variant"];

export interface ButtonProgressProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  progress?: number;
}

const ButtonProgress = React.forwardRef<HTMLButtonElement, ButtonProgressProps>(
  ({ className, variant, size, progress, children, ...props }, ref) => {
    const progressValues = {
      0: "w-[0%]",
      1: "w-[20%]",
      2: "w-[40%]",
      3: "w-[60%]",
      4: "w-[80%]",
      5: "w-[100%]",
    };
    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {progress ? (
          <div
            className={cn(
              "bg-primary-foreground/20 left-0 h-11 absolute",
              progressValues[progress as keyof typeof progressValues],
            )}
          />
        ) : null}
        {children}
      </button>
    );
  },
);
ButtonProgress.displayName = "ButtonProgress";

export { ButtonProgress, buttonVariants };
