"use client";

import { useRef } from "react";
import { Logo } from "@propsto/ui/atoms/logo";
import { SpeechBubbles } from "@propsto/ui/molecules/speech-bubbles";
import { Quote } from "@propsto/ui/molecules/quote";

export function SideSection(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative hidden h-full flex-col bg-secondary-background border-r border-primary/10 p-10 lg:flex overflow-hidden"
    >
      <SpeechBubbles />
      <div className="relative z-20 flex items-center text-lg font-medium font-cal tracking-wider">
        <Logo className="mr-2" />
        Props.to
      </div>
      <Quote />
    </div>
  );
}
