"use client";

import Image from "next/image";
import AppProvider from "../app-provider";
import SupportHeader from "./header";
import SupportSidebar from "./sidebar";
import Illustration from "@/public/images/support-illustration.svg";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SupportHeader />

      {/* Page content */}
      <main className="grow">
        <section className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10">
            <Image
              className="max-w-none"
              src={Illustration}
              alt="Page illustration"
              priority
              aria-hidden="true"
            />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Main content */}
            <div className="md:flex md:justify-between">
              <SupportSidebar />
              {children}
            </div>
          </div>
        </section>
      </main>
    </AppProvider>
  );
}
