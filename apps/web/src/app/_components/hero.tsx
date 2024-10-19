"use client";

import { useRef } from "react";
import Link from "next/link";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { Button } from "@propsto/ui/atoms/button";
import { type JSX } from "react";

export function Hero(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      <Triangles parentRef={ref} />
      <div className="pt-32 pb-12 md:pt-48 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center pb-12 md:pb-16">
              <h1 className="font-cal leading-[100%] md:!leading-xl tracking-[-0.002em] md:text-[65px] lg:text-[69px] text-shadow-gray">
                Open Source <br /> Feedback Platform
              </h1>
              <p className="text-xl text-zinc-800 my-8">
                Unleashing Human Potential
              </p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <Button asChild>
                    <Link href="/request-early-access">
                      Request early access
                    </Link>
                  </Button>
                </div>
                <div>
                  <Button asChild variant="outline">
                    <Link href="https://github.com/propsto/props.to">
                      Contribute
                    </Link>
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
