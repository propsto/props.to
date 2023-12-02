import { Inter, Inter_Tight } from "next/font/google";
import "@/styles/globals.css";

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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="grow">
        <section className="relative before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:h-80 before:bg-gradient-to-b before:from-zinc-100">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <div className="px-4 sm:px-6">{children}</div>
          </div>
        </section>
      </main>
    </>
  );
}
