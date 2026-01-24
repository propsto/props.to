import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Props.to - Authenticate",
  description: "Open Source Feedback Infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
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
