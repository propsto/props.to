"use client";

import Link from "next/link";
import Triangles from "@/components/triangles";

export default function Hero() {
  return (
    <section>
      <Triangles />
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center pb-12 md:pb-16">
              <h1 className="font-cal leading-[100%] md:!leading-xl tracking-[-0.002em] md:text-[65px] lg:text-[69px] text-shadow-gray">
                Open source <br /> recognition software
              </h1>
              <p className="text-xl text-zinc-800 my-8">
                Unleashing Human Potential
              </p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <a
                    className="btn text-zinc-600 bg-white hover:text-zinc-900 w-full shadow"
                    href="/request-early-access"
                  >
                    Request early access
                  </a>
                </div>
                <div>
                  <Link
                    className="btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800 w-full shadow"
                    href="https://github.com/propsto/props.to"
                  >
                    Contribute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
