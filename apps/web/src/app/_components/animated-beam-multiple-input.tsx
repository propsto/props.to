"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@propsto/ui/utils/cn";
import { AnimatedBeam } from "@propsto/ui/organisms/animated-beam";
import { Logo, LogoSymbol, BorderBeam } from "@propsto/ui/atoms";
import { User } from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-24 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamMultipleInput(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const div8Ref = useRef<HTMLDivElement>(null);
  const div9Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2 font-bold">
          <Circle className="shadow-[0_0_20px_-12px_rgba(0,0,0,0)]">
            <Circle
              ref={div1Ref}
              className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
            >
              Instagram
            </Circle>
          </Circle>
          <Circle ref={div2Ref} className="text-gray-500">
            Twitter/X
          </Circle>
          <Circle ref={div3Ref} className="text-[#0a66c2]">
            LinkedIn
          </Circle>
          <Circle ref={div4Ref} className="text-[#4078c0]">
            GitHub
          </Circle>
          <Circle ref={div5Ref} className="text-[#ff0000]">
            Youtube
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-14 text-sm font-bold items-center">
          <Circle ref={div8Ref} className="w-36">
            <LogoSymbol />
            Self-hosted
          </Circle>
          <Circle ref={div6Ref} className="size-16 -ml-4 relative">
            <BorderBeam size={50} borderWidth={2.5} />
            <Logo />
          </Circle>
          <Circle ref={div9Ref} className="w-36">
            <LogoSymbol />
            Organization
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref} className="size-16">
            <User className="text-black fill-black" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        duration={6}
        fromRef={div8Ref}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        duration={6}
        fromRef={div9Ref}
        toRef={div6Ref}
      />
    </div>
  );
}
