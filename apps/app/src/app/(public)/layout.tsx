import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Props.to
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline">
            Props.to
          </Link>
        </div>
      </footer>
    </div>
  );
}
