import { constOther } from "@propsto/constants/other";
import { cn } from "../utils/cn";

export function Quote({
  className,
}: React.ComponentProps<"div">): React.ReactElement | undefined {
  const { quotes } = constOther;
  const quote = quotes[Math.floor(Math.random() * quotes.length)] as
    | (typeof quotes)[number]
    | undefined;
  if (quote) {
    return (
      <div className={cn("relative z-20 mt-auto", className)}>
        <blockquote className="space-y-2">
          <p suppressHydrationWarning className="text-lg">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            suppressHydrationWarning
            className="text-sm font-cal tracking-wider"
          >
            –{quote.author}
          </p>
        </blockquote>
      </div>
    );
  }
}
