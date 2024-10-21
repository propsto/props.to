"use client";

import { type JSX, useRef } from "react";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { Quote } from "@propsto/ui/molecules/quote";

export function SideSection(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative hidden h-full flex-col bg-secondary-background border-r border-primary/10 p-10 lg:flex overflow-hidden"
    >
      <Triangles parentRef={ref} />
      <div className="relative z-20 flex items-center text-lg font-medium font-cal tracking-wider">
        <Logo className="mr-2" />
        Props.to
      </div>
      <Quote />
    </div>
  );
}
