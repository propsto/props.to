import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppProvider } from "@/app/app-provider";

interface SidebarLinkProps {
  children: React.ReactNode;
  href: string;
}

export default function SidebarLink({ children, href }: SidebarLinkProps) {
  const pathname = usePathname();
  const { setSidebarOpen } = useAppProvider();
  return (
    <Link
      className={`${
        pathname === href
          ? "text-blue-500 font-[550]"
          : "text-slate-600 font-[350]"
      }`}
      href={href}
      onClick={() => setSidebarOpen(false)}
    >
      {children}
    </Link>
  );
}
