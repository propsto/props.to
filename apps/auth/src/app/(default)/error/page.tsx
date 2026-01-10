import { constOther } from "@propsto/constants/other";
import { Button } from "@propsto/ui/atoms/button";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

function getErrorMessage(code = ""): string {
  const message = constOther.errorCodes[code];
  if (!message) return "Something went wrong.";
  return message;
}

export default async function ErrorPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const code = (await searchParams).code;
  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <div className="flex flex-col items-center space-y-8">
        <TriangleAlert className="size-24 text-foreground" />
        <h1 className="text-muted-foreground">{getErrorMessage(code)}</h1>
        <Button>
          {code === "InvalidSession" ? (
            <Link href="/api/auth/signout">Sign out</Link>
          ) : (
            <Link href="/">Go home</Link>
          )}
        </Button>
      </div>
    </div>
  );
}
