"use client";

import { useRef } from "react";
import Link from "next/link";
import { SpeechBubbles } from "@propsto/ui/molecules/speech-bubbles";
import { Button } from "@propsto/ui/atoms/button";
import { useTypeWriter } from "@/hooks/type-writer";

const colorIndex = Math.floor(Math.random() * 6);

export function Hero(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative min-h-screen">
      <SpeechBubbles />
      <div className="pt-28 pb-12 md:pt-44 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              {/* Badge */}
              <div className="mb-8 inline-block">
                <span
                  style={{
                    backgroundColor: `var(--bubble-color-${colorIndex}-hex)`,
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary font-sans uppercase"
                >
                  Open Source
                </span>
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Feedback, when it actually matters.
              </h1>

              {/* Subheadline */}
              <h2
                style={{
                  color: `var(--bubble-color-${colorIndex}-hex)`,
                  filter: "brightness(0.5)",
                }}
                className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 lg:mb-6"
              >
                A personal feedback link you control for <br />
                teams, clients, and communities.
              </h2>

              {/* Supporting Line */}
              <p className="mb-10 text-balance text-sm text-muted-foreground md:text-base">
                Designed for moments that require clarity, not constant
                feedback.
              </p>

              {/* CTA Buttons */}
              <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4 my-8">
                <div>
                  <Button asChild>
                    <Link href="/request-early-access">
                      Request early access
                    </Link>
                  </Button>
                </div>
                <div>
                  <Button asChild variant="outline" className="bg-white">
                    <Link href="https://git.new/propsto">Contribute</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeWriterCTA(): React.ReactNode {
  const placeholderText = useTypeWriter([
    "A personal feedback link you control for teams, clients, and communities.",
    "One link to collect feedback when context is still fresh.",
  ]);
  return (
    <h2
      style={{
        color: `var(--bubble-color-${colorIndex}-hex)`,
        filter: "brightness(0.5)",
      }}
      className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 lg:mb-6"
    >
      &nbsp;{placeholderText}
    </h2>
  );
}
