"use client";

import dynamic from "next/dynamic";
import { SpeechBubbles } from "@propsto/ui/molecules/speech-bubbles";
import { Logo } from "@propsto/ui/atoms/logo";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="grid lg:grid-cols-3 h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <div className="lg:col-span-2 overflow-y-auto" id="main-content">
        <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider">
          <SpeechBubbles scale={0.4} />
          <Logo className="mr-2 z-20" size="lg" />
          Props.to
        </div>
        <div className="min-h-full flex flex-col justify-center items-center py-5">
          {children}
          <DynamicThemeToggle />
        </div>
      </div>
      <SideSection />
    </div>
  );
}
