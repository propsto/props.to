"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>): React.ReactNode {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
}

export { Label };
