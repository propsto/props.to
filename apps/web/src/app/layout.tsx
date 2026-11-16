import "@propsto/ui/base.css";
import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Inter_Tight as InterTight } from "next/font/google";
import { cn } from "@propsto/ui/lib/utils";
import { Analytics } from "@vercel/analytics/react";

const calFont = localFont({
  src: "../../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-cal",
  preload: true,
  display: "block",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = InterTight({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://props.to"),
  title: "Props.to: feedback and props you keep",
  description:
    "Open-source feedback and recognition platform. A personal feedback link for teams, clients and communities, signed or anonymous, that stays yours when you change jobs. Optional company layers for values, levels and moderation.",
  alternates: { types: { "text/plain": "/llms.txt" } },
  openGraph: {
    images: ["https://props.to/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          interTight.className,
          calFont.className,
          "font-inter antialiased bg-white text-zinc-900 tracking-tight",
        )}
      >
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-white/50">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
