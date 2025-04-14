/* eslint-disable camelcase -- Google exports not in camelcase */
import "./globals.css";

import { Inter, Inter_Tight } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { cn } from "@propsto/ui/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inter_tight = Inter_Tight({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Props.to - Application",
  description: "Open Source Feedback Platform",
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          inter_tight.className,
          "font-inter antialiased bg-sidebar text-primary tracking-tight",
        )}
      >
        <ThemeProvider>
          <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
