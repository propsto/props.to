"use client";

import dynamic from "next/dynamic";
import { Triangles } from "@propsto/ui/molecules";
import { Logo } from "@propsto/ui/atoms";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="grid lg:grid-cols-3 h-screen">
      <div className="lg:col-span-2 overflow-y-auto">
        <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider">
          <Triangles size="small" />
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
