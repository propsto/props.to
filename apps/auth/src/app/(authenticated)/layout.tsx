import dynamic from "next/dynamic";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="relative h-screen flex-col items-center lg:justify-center grid lg:max-w-none lg:grid-cols-3 lg:px-0">
      <div className="lg:p-8 col-span-2 relative">
        {children}
        <DynamicThemeToggle />
      </div>
      <SideSection />
    </div>
  );
}
