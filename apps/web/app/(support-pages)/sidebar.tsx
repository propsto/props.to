import { useRef, useEffect } from "react";
import { useAppProvider } from "@/app/app-provider";
import { useSelectedLayoutSegments } from "next/navigation";
import { Transition } from "@headlessui/react";
import SidebarLink from "./sidebar-link";
import SidebarLinkGroup from "./sidebar-link-group";

export default function SupportSidebar() {
  const sidebar = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen } = useAppProvider();
  const segments = useSelectedLayoutSegments();

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!sidebar.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      {/* Backdrop */}
      <Transition
        className="md:hidden fixed inset-0 z-10 bg-white bg-opacity-75 transition-opacity"
        show={sidebarOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-out duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div ref={sidebar}>
        <Transition
          show={sidebarOpen}
          unmount={false}
          as="aside"
          id="sidebar"
          className="fixed left-0 top-0 bottom-0 w-64 h-screen bg-white border-r border-slate-200 px-4 sm:px-6 md:ml-0 md:pr-8 md:left-auto overflow-y-auto no-scrollbar md:shrink-0 z-10 md:!opacity-100 md:!block"
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-x-full"
          enterTo="opacity-100 translate-x-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pt-28 pb-12 md:pt-36 md:pb-16">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Popular topics
            </h3>

            {/* Support nav */}
            <nav className="md:block">
              <ul className="space-y-3">
                <SidebarLinkGroup
                  title="Welcome"
                  open={segments.includes("welcome")}
                >
                  <li>
                    <SidebarLink href="/support/welcome/installation">
                      Installation
                    </SidebarLink>
                  </li>
                  <li>
                    <SidebarLink href="/support/welcome/quick-from">
                      Quick From
                    </SidebarLink>
                  </li>
                  <li>
                    <SidebarLink href="/support/welcome/folder-content">
                      Folder content
                    </SidebarLink>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="Sending money"
                  open={segments.includes("sending-money")}
                >
                  <li>
                    <SidebarLink href="/support/sending-money/how-do-i-send-money-to-a-bank-account-or-card">
                      How do I send money to a bank account or card?
                    </SidebarLink>
                  </li>
                  <li>
                    <SidebarLink href="/support/sending-money/what-recipient-account-details-do-i-need">
                      What recipient account details do I need?
                    </SidebarLink>
                  </li>
                  <li>
                    <SidebarLink href="/support/sending-money/how-do-i-download-my-transfer-confirmation">
                      How do I download my transfer confirmation?
                    </SidebarLink>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="Account management"
                  open={segments.includes("account-management")}
                >
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup title="Card" open={segments.includes("card")}>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="Credit products"
                  open={segments.includes("credit-products")}
                >
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="App features"
                  open={segments.includes("app-features")}
                >
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="Insurance"
                  open={segments.includes("insurance")}
                >
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
                <SidebarLinkGroup
                  title="Wealth and trading"
                  open={segments.includes("wealth-and-trading")}
                >
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                  <li>
                    <a className="text-slate-600 font-[350]" href="#0">
                      Link
                    </a>
                  </li>
                </SidebarLinkGroup>
              </ul>
            </nav>
          </div>
        </Transition>
      </div>
    </>
  );
}
