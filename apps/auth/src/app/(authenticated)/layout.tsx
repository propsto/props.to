"use client";

import dynamic from "next/dynamic";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="grid grid-cols-3 h-screen">
      <div className="col-span-2 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center items-center">
          {children}
          <DynamicThemeToggle />
        </div>
      </div>
      <SideSection />
    </div>
  );
}
