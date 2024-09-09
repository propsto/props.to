import dynamic from "next/dynamic";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="relative h-screen flex-col items-center lg:justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <SideSection />
      <div className="lg:p-8">
        {children}
        <DynamicThemeToggle />
      </div>
    </div>
  );
}
