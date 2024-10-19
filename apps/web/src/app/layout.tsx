/* eslint-disable camelcase -- Google exports without camelcase */
import "@propsto/ui/base.css";
import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Inter_Tight } from "next/font/google";
import { type JSX } from "react";

const calFont = localFont({
  src: "../../public/fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "block",
});

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
  title: "Props.to",
  description: "Open Source Feedback Platform",
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter_tight.variable} ${calFont.variable} font-inter antialiased bg-white text-zinc-900 tracking-tight`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
