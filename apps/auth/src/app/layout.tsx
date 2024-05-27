import "@propsto/ui/base.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "./_components/theme-toogle";

const inter = Inter({ subsets: ["latin"] });

const quotes = [
  {
    text: "We all need people who will give us feedback. That’s how we improve.",
    author: "Bill Gates",
  },
  {
    text: "Criticism, like rain, should be gentle enough to nourish a man’s growth without destroying his roots.",
    author: "Frank A. Clark",
  },
  {
    text: "Feedback is the breakfast of champions.",
    author: "Ken Blanchard",
  },
  {
    text: "There is no failure. Only feedback.",
    author: "Robert Allen",
  },
  {
    text: "Make feedback normal. Not a performance review.",
    author: "Ed Batista",
  },
  {
    text: "True intuitive expertise is learned from prolonged experience with good feedback on mistakes.",
    author: "Daniel Kahneman",
  },
  {
    text: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
  },
];

export default function RootLayout({
  children,
}: Readonly<React.PropsWithChildren>) {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <main className="overflow-hidden">
            <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 dark:bg-zinc-800 bg-white">
              <div className="relative hidden h-full flex-col bg-muted p-10 bg-zinc-800 dark:bg-black text-white lg:flex border-r dark:border-black overflow-hidden">
                <Triangles />
                <div className="relative z-20 flex items-center text-lg font-medium">
                  <Logo className="mr-2" />
                  Props.to
                </div>
                <div className="relative z-20 mt-auto">
                  <blockquote className="space-y-2">
                    <p className="text-lg">&ldquo;{quote.text}&rdquo;</p>
                    <footer className="text-sm">{quote.author}</footer>
                  </blockquote>
                </div>
              </div>
              <div className="lg:p-8">
                <div className="mx-auto text-center flex w-full flex-col justify-center space-y-4 sm:w-[350px] dark:text-white">
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
