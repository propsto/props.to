import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@propsto/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@propsto/ui/atoms/card";

export default function ThankYouPage(): React.ReactNode {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your feedback helps people grow and improve. Thank you for taking
            the time to share your thoughts.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/">Learn More About Props.to</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
