import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextAuth.js Example",
  description:
    "This is an example site to demonstrate how to use NextAuth.js for authentication",
};

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
