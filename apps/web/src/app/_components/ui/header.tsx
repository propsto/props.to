import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";
import { Logo } from "@propsto/ui/atoms";

export function Header(): React.ReactElement {
  return (
    <header className="fixed top-2 md:top-6 w-full z-30">
      <div className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex drop-shadow-md items-center justify-between h-14 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg px-3">
            {/* Site branding */}
            <div className="shrink-0 mr-4">
              {/* Logo */}
              <Link className="" href="/">
                <Logo size="xl" />
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="flex grow">
              {/* Desktop sign in links */}
              <ul className="flex grow justify-end flex-wrap items-center">
                <li>
                  <Button asChild size="sm">
                    <Link href="/request-early-access">
                      Request early access
                    </Link>
                  </Button>
                </li>
                <li className="ml-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="https://git.new/propsto">Contribute</Link>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
