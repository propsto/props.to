"use client";

import { useEffect } from "react";
import useDeviceSize from "@/lib/useDeviceSize";
import Link from "next/link";
import gsap from "gsap";

function findFirstDivisorWithNoRemainder(x: number) {
  // Start from 2 since 1 is a divisor for all numbers
  for (let i = 2; i <= x; i++) {
    if (x % i === 0) {
      return i; // Found the first divisor
    }
  }
  return null; // If no divisor found
}

function Triangles() {
  const [width, height] = useDeviceSize();
  var size = 70;
  var maxTileX = Math.ceil(width / size),
    maxTileY = Math.ceil(height / size);
  console.log({ maxTileX, maxTileY });
  var types = ["TL", "TR", "BL", "BR"];
  useEffect(() => {
    if (maxTileX > 0 && maxTileY > 0) {
      gsap.to(`.triangle`, {
        scale: 1,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2.5,
      });
    }
  }, []);
  return (
    <div
      id="container"
      className="absolute w-full"
      style={{ height: maxTileY * size }}
    >
      {[...Array(maxTileX)].map((x, i) =>
        [...Array(maxTileY)].map((y, j) => {
          return (
            <div
              key={`${i}${j}`}
              className={`triangle ${types[Math.floor(Math.random() * 4)]}`}
            />
          );
        })
      )}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="">
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
                    href="#early-access"
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
