import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type JSX } from "react";
import { z } from "zod";
import { ResetPasswordForm } from "@components/reset-password-form";
import { auth } from "@/server/auth";

const internalMessages = {
  "no-password-set": "You have not set a password for your account.",
} as const;

const resetPasswordParamsSchema = z.object({
  code: z.string().optional(),
  email: z.string().optional(),
});

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string>>;
}>): Promise<JSX.Element> {
  const { code, email = "" } = resetPasswordParamsSchema.parse(
    await searchParams,
  );
  const session = await auth();
  if (session?.user) redirect("/welcome");

  return (
    <div className="w-full h-full relative">
      {code ? (
        <Link href="/" className="absolute top-1" title="Back to Get Started">
          <ChevronLeft className="size-6 text-primary" />
        </Link>
      ) : null}
      <div className="mx-auto text-center flex relative flex-col justify-center space-y-4 w-80 h-full">
        <div className="flex flex-col space-y-2 text-center">
          <h1>Reset password</h1>
          <p className="text-sm text-muted-foreground">
            {code
              ? `${internalMessages[code as keyof typeof internalMessages]} `
              : null}
            Enter your email address to get a reset password link.
          </p>
        </div>
        <ResetPasswordForm email={email} />
      </div>
    </div>
  );
}
