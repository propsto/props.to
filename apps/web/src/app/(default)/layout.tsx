"use client";

import { Header } from "@components/ui/header";
import { Footer } from "@components/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer />
    </>
  );
}
