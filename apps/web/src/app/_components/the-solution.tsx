"use client";

import { CSSProperties, useRef } from "react";
import {
  BanIcon,
  CirclePauseIcon,
  ClipboardListIcon,
  Link2Icon,
  MessageSquareTextIcon,
  RefreshCwIcon,
} from "lucide-react";
import { AnimatedBeam } from "@propsto/ui/atoms/animated-beam";
import { cn } from "@propsto/ui/lib/utils";

export default function TheSolution(): React.ReactElement {
  const primaryContainerRef = useRef<HTMLDivElement>(null);
  const primaryStep1Ref = useRef<HTMLDivElement>(null);
  const primaryStep2Ref = useRef<HTMLDivElement>(null);
  const primaryStep3Ref = useRef<HTMLDivElement>(null);

  const secondaryContainerRef = useRef<HTMLDivElement>(null);
  const secondaryStep1Ref = useRef<HTMLDivElement>(null);
  const secondaryStep2Ref = useRef<HTMLDivElement>(null);
  const secondaryStep3Ref = useRef<HTMLDivElement>(null);

  const color1 = Math.floor(Math.random() * 6);
  const color2 =
    Math.floor(Math.random() * 6) === color1
      ? (color1 + 1) % 6
      : Math.floor(Math.random() * 6);
  const styles = {
    ["--color1"]: `var(--bubble-color-${color1}-hex)`,
    ["--color2"]: `var(--bubble-color-${color2}-hex)`,
  } as CSSProperties & {
    [key: string]: string | number | undefined;
  };

  return (
    <section className="relative" style={styles}>
      <div className="py-16 sm:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600 uppercase">
            The Solution
          </p>
          <h2 className="mx-auto mt-2 mb-4 text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Collect focused feedback with a single link.
          </h2>

          {/* Body Copy */}
          <div className="mx-auto mb-16 max-w-3xl space-y-6 text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
            <p className="text-foreground/90">
              Props.to gives you a personal feedback link.
            </p>
            <p>
              You share it at the exact moment feedback matters.
              <br />
              Not later. Not scheduled. Not forgotten.
            </p>
            <p>
              The link removes friction without removing intention.
              <br />
              It creates a clear signal that feedback is welcome now.
            </p>
          </div>

          <div className="mb-16 grid gap-12 md:grid-cols-2">
            {/* Primary Flow: Receiving Feedback */}
            <div className={cn("rounded-2xl border p-8", "bg-[var(--color1)]")}>
              <h3 className="mb-8 text-center text-xl font-semibold text-foreground">
                How feedback flows
              </h3>

              <div
                ref={primaryContainerRef}
                className="relative flex flex-col items-center gap-6"
              >
                <AnimatedBeam
                  className="z-0"
                  containerRef={primaryContainerRef}
                  fromRef={primaryStep1Ref}
                  toRef={primaryStep2Ref}
                  pathColor="hsl(var(--muted-foreground))"
                  pathOpacity={0.25}
                  gradientStartColor="hsl(var(--primary))"
                  gradientStopColor="hsl(var(--foreground))"
                />
                <AnimatedBeam
                  className="z-0"
                  containerRef={primaryContainerRef}
                  fromRef={primaryStep2Ref}
                  toRef={primaryStep3Ref}
                  pathColor="hsl(var(--muted-foreground))"
                  pathOpacity={0.25}
                  gradientStartColor="hsl(var(--primary))"
                  gradientStopColor="hsl(var(--foreground))"
                />
                {/* Step 1 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center pb-4",
                    "bg-[var(--color1)]",
                  )}
                >
                  <div
                    ref={primaryStep1Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Link2Icon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Share your feedback link
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Share a link scoped to a specific topic, decision, or
                      moment.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center py-4",
                    "bg-[var(--color1)]",
                  )}
                >
                  <div
                    ref={primaryStep2Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <MessageSquareTextIcon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Receive focused feedback
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Feedback comes back with context and intent, not noise.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center pt-4",
                    "bg-[var(--color1)]",
                  )}
                >
                  <div
                    ref={primaryStep3Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <ClipboardListIcon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Manage feedback into action
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Review feedback, extract patterns, and turn it into next
                      steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Flow: Controlling Feedback */}
            <div className={cn("rounded-2xl border p-8", "bg-[var(--color2)]")}>
              <h3 className="mb-8 text-center text-xl font-semibold text-muted-foreground">
                When feedback should stop
              </h3>

              <div
                ref={secondaryContainerRef}
                className="relative flex flex-col items-center gap-6"
              >
                <AnimatedBeam
                  className="z-0"
                  containerRef={secondaryContainerRef}
                  fromRef={secondaryStep1Ref}
                  toRef={secondaryStep2Ref}
                  pathColor="hsl(var(--muted-foreground))"
                  pathOpacity={0.22}
                  gradientStartColor="hsl(var(--muted-foreground))"
                  gradientStopColor="hsl(var(--foreground))"
                />
                <AnimatedBeam
                  className="z-0"
                  containerRef={secondaryContainerRef}
                  fromRef={secondaryStep2Ref}
                  toRef={secondaryStep3Ref}
                  pathColor="hsl(var(--muted-foreground))"
                  pathOpacity={0.22}
                  gradientStartColor="hsl(var(--muted-foreground))"
                  gradientStopColor="hsl(var(--foreground))"
                />
                {/* Step 1 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center pb-4",
                    "bg-[var(--color2)]",
                  )}
                >
                  <div
                    ref={secondaryStep1Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted-foreground/10 text-muted-foreground"
                  >
                    <CirclePauseIcon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Pause your feedback link
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Close the feedback window once the decision is made.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center py-4",
                    "bg-[var(--color2)]",
                  )}
                >
                  <div
                    ref={secondaryStep2Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted-foreground/10 text-muted-foreground"
                  >
                    <BanIcon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Stop receiving feedback
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Prevent late or redundant input from slowing progress.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-3 text-center pt-4",
                    "bg-[var(--color2)]",
                  )}
                >
                  <div
                    ref={secondaryStep3Ref}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted-foreground/10 text-muted-foreground"
                  >
                    <RefreshCwIcon className="size-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Resume or reuse later
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Resume feedback later, or create a new scoped link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hint about other workflows */}
          <div className="mb-12 text-center">
            <p className="text-sm text-muted-foreground">
              Other workflows include scoped feedback, anonymity controls, and
              feedback limits.
            </p>
          </div>

          {/* Closing Line */}
          <div className="text-center">
            <p className="text-balance text-xl font-semibold italic text-foreground md:text-2xl">
              Props.to is designed for moments that require clarity, not
              constant feedback.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
