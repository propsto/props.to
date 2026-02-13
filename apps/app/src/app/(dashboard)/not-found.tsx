import Link from "next/link";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound(): React.ReactNode {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
