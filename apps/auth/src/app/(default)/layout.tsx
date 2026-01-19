"use client";

import dynamic from "next/dynamic";
import { Logo } from "@propsto/ui/atoms/logo";
import { SpeechBubbles } from "@propsto/ui/molecules/speech-bubbles";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="relative lg:h-screen flex-col items-center lg:justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <SideSection />
      <div className="lg:p-8 lg:h-screen" id="main-content">
        <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center">
          <SpeechBubbles scale={0.4} />
          <Logo className="mr-2 z-20" size="lg" />
          <span className="text-2xl font-medium font-cal tracking-wider z-20">
            Props.to
          </span>
        </div>
        {children}
        <DynamicThemeToggle />
      </div>
    </div>
  );
}
