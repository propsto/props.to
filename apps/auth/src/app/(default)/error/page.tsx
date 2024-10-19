import { constOther } from "@propsto/constants";
import { Button } from "@propsto/ui/atoms";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";

function getErrorMessage(code = ""): string {
  const message = constOther.errorMessages[code];
  if (!message) return "Something went wrong.";
  return message;
}

export default async function ErrorPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<JSX.Element> {
  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <div className="flex flex-col items-center space-y-8">
        <TriangleAlert className="size-24 text-foreground" />
        <h1 className="text-muted-foreground">
          {getErrorMessage((await searchParams).code)}
        </h1>
        <Button>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
