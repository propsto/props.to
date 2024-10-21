import { type JSX } from "react";
import { constOther } from "@propsto/constants/other";
import { cn } from "../utils/cn";

export function Quote({
  className,
}: React.ComponentProps<"div">): JSX.Element | undefined {
  const { quotes } = constOther;
  const quote = quotes[Math.floor(Math.random() * quotes.length)] as
    | (typeof quotes)[number]
    | undefined;
  if (quote) {
    return (
      <div className={cn("relative z-20 mt-auto", className)}>
        <blockquote className="space-y-2">
          <p className="text-lg" suppressHydrationWarning>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            className="text-sm font-cal tracking-wider"
            suppressHydrationWarning
          >
            –{quote.author}
          </p>
        </blockquote>
      </div>
    );
  }
}
