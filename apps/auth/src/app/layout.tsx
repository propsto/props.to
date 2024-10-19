import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { type JSX } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Props.to - Authenticate",
  description: "Open Source Feedback Platform",
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <main className="overflow-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
