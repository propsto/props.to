"use client";

import { Header } from "@components/ui/header";
import { Footer } from "@components/ui/footer";

export default function DefaultLayout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer />
    </>
  );
}
