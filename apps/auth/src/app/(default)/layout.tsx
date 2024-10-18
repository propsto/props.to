import dynamic from "next/dynamic";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { SideSection } from "@components/side-section";

const DynamicThemeToggle = dynamic(() => import("@components/theme-toogle"));

export default function Layout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactNode {
  return (
    <div className="relative lg:h-screen flex-col items-center lg:justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <SideSection />
      <div className="lg:p-8 lg:h-screen">
        <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider">
          <Triangles size="small" />
          <Logo className="mr-2 z-20" size="large" />
          Props.to
        </div>
        {children}
        <DynamicThemeToggle />
      </div>
    </div>
  );
}
