"use client";

import type { JSX } from "react";
import { Footer } from "@components/ui/footer";
import { Header } from "@components/ui/header";

export default function DefaultLayout({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element {
  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer />
    </>
  );
}
