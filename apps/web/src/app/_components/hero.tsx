"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { Button } from "@propsto/ui/atoms/button";
import { Input } from "@propsto/ui/atoms";
import { ArrowRight } from "lucide-react";
import { Quote } from "@propsto/ui/molecules/quote";
import { useTypeWriter } from "@/hooks/type-writer";

export function Hero(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      {/* Pass ref to triangles for background effects */}
      <Triangles parentRef={ref} />
      <div className="pt-28 pb-12 md:pt-44 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center pb-12 md:pb-16">
              <TypeWriterCTA />
              <Quote className="mt-8 text-xl font-semibold" />
              <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4 my-8">
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

function TypeWriterCTA(): React.ReactNode {
  const [showNotice, setShowNotice] = useState(false);
  const placeholderText = useTypeWriter([
    "https://youtube.com/mrbeast",
    "john.doe@company.com",
    "company/john.doe",
    "https://x.com/elonmusk",
    "type any URI here!",
  ]);
  return (
    <>
      {showNotice ? (
        <>
          <h2 className="text-5xl font-black">Thank you for your interest!</h2>
          <p className="mt-4 text-2xl">
            We are still developing this platform. But be sure to request early
            <br />
            access to be able to use it when the time comes!
          </p>
        </>
      ) : (
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black flex flex-col md:flex-row items-center gap-1 flex-wrap justify-center">
          props.to/
          <Input
            placeholder={placeholderText}
            type="text"
            className="peer text-2xl focus:placeholder:text-white md:placeholder:text-3xl lg:placeholder:text-5xl placeholder:text-2xl font-sans placeholder:font-sans w-[80%] md:w-[70%] md:min-w-[70%] inline-block bg-white h-10 md:h-14 lg:h-16 font-extralight rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-800 focus:ring-2 focus:ring-inset focus:ring-gray-600 md:text-3xl lg:text-5xl sm:leading-6"
          />
          <Button
            variant="default"
            className="peer-focus:visible active:visible hover:visible invisible md:text-xl h-10 md:h-14 lg:h-16"
            onClick={() => {
              setShowNotice(true);
            }}
          >
            Go&nbsp;
            <ArrowRight className="md:size-6 size-4" />
          </Button>
        </h2>
      )}
    </>
  );
}
