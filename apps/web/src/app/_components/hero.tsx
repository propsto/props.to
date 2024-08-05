"use client";

import { useRef } from "react";
import Link from "next/link";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms";
import { useTypeWriter } from "@/hooks/type-writer";

export function Hero(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  // Use the typewriter effect for the placeholder text
  const placeholderText = useTypeWriter([
    "https://instagram.com/cristiano",
    "john.doe@gmail.com",
    "https://apple.com/ipad-mini",
    "type any URI here!",
  ]);

  return (
    <div ref={ref}>
      {/* Pass ref to triangles for background effects */}
      <Triangles parentRef={ref} />
      <div className="pt-32 pb-12 md:pt-48 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center pb-12 md:pb-16">
              <h2 className="text-5xl font-black">
                props.to/
                <Input
                  placeholder={placeholderText} // Use typewriter effect here
                  type="text"
                  className="font-sans w-[70%] inline-block bg-white h-16 font-extralight rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-800 focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:text-5xl sm:leading-6"
                />
              </h2>
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
