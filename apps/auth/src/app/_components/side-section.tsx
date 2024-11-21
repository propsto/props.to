"use client";

import { useRef } from "react";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { Quote } from "@propsto/ui/molecules/quote";

export function SideSection(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="flex flex-col bg-secondary-background border-r border-primary/10 p-10 relative"
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
