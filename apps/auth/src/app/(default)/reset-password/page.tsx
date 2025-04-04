import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ResetPasswordForm } from "@components/reset-password-form";
import { auth } from "@/server/auth.server";

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
}>): Promise<React.ReactElement> {
  const { code, email = "" } = resetPasswordParamsSchema.parse(
    await searchParams,
  );
  const session = await auth();

  if (session?.user) {
    const queryString = new URLSearchParams(await searchParams).toString();
    const redirectTo = queryString ? `/welcome?${queryString}` : "/welcome";
    redirect(redirectTo);
  }

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
