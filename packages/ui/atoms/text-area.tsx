"use client";

import * as React from "react";
import { cn } from "../utils/cn";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">): React.ReactNode {
  return (
    <textarea
      className={cn(
        "flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
