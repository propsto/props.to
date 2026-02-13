import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";
import { FileQuestion } from "lucide-react";

export default function PublicNotFound(): React.ReactNode {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        The profile or feedback link you&apos;re looking for doesn&apos;t exist
        or may have been removed.
      </p>
      <Button asChild>
        <Link href="https://props.to">Go to props.to</Link>
      </Button>
    </div>
  );
}
