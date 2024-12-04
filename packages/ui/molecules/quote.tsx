import { constOther } from "@propsto/constants/other";
import { cn } from "../utils/cn";

export function Quote({
  className,
  quotes = constOther.quotes,
}: React.ComponentProps<"div"> & { quotes?: typeof constOther.quotes }):
  | JSX.Element
  | undefined {
  const quote = quotes[Math.floor(Math.random() * quotes.length)] as
    | (typeof quotes)[number]
    | undefined;
  if (quote) {
    return (
      <div className={cn("relative z-20 mt-auto text-lg", className)}>
        <blockquote className="space-y-2">
          <p suppressHydrationWarning>
            {quote.author ? `&ldquo;${quote.text}&rdquo;` : quote.text}
          </p>
          {quote.author ? (
            <p
              suppressHydrationWarning
              className="text-sm font-cal tracking-wider"
            >
              –{quote.author}
            </p>
          ) : null}
        </blockquote>
      </div>
    );
  }
}
