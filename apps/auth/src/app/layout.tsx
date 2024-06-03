import "@propsto/ui/base.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { ThemeToggle } from "@components/theme-toogle";
import { SideSection } from "@components/side-section";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Props.to - Authenticate",
  description: "Open Source Feedback Platform",
};

export function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <main className="overflow-hidden">
            <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
              <SideSection />
              <div className="lg:p-8">
                <div className="mx-auto text-center flex flex-col justify-center space-y-4 sm:w-[350px]">
                  {children}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
