"use client";

import { type JSX, useRef } from "react";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";

const quotes = [
  {
    text: "We all need people who will give us feedback. That’s how we improve.",
    author: "Bill Gates",
  },
  {
    text: "Criticism, like rain, should be gentle enough to nourish a man’s growth without destroying his roots.",
    author: "Frank A. Clark",
  },
  {
    text: "Feedback is the breakfast of champions.",
    author: "Ken Blanchard",
  },
  {
    text: "There is no failure. Only feedback.",
    author: "Robert Allen",
  },
  {
    text: "Make feedback normal. Not a performance review.",
    author: "Ed Batista",
  },
  {
    text: "True intuitive expertise is learned from prolonged experience with good feedback on mistakes.",
    author: "Daniel Kahneman",
  },
  {
    text: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
  },
];

function Quote(): JSX.Element | undefined {
  const quote = quotes[Math.floor(Math.random() * quotes.length)] as
    | (typeof quotes)[number]
    | undefined;
  if (quote) {
    return (
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p suppressHydrationWarning className="text-lg">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            suppressHydrationWarning
            className="text-sm font-cal tracking-wider"
          >
            –{quote.author}
          </p>
        </blockquote>
      </div>
    );
  }
}

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
