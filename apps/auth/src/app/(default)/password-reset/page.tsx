import { redirect } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { auth } from "@/server/auth";
import { ResetPasswordForm } from "@components/reset-password-form";

const internalMessages = {
  "no-password-set": "You have not set a password for your account.",
} as const;

const resetPasswordParamsSchema = z.object({
  code: z.string().optional(),
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<JSX.Element> {
  const { code } = resetPasswordParamsSchema.parse(searchParams);
  const session = await auth();
  if (session?.user) redirect("/welcome");

  return (
    <div className="w-full h-full relative">
      {code ? (
        <Link href="/" className="absolute top-1" title="Back to Get Started">
          <ChevronLeft className="size-6 text-primary" />
        </Link>
      ) : null}
      <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider">
        <Triangles size="small" />
        <Logo className="mr-2 z-20" size="large" />
        Props.to
      </div>
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
        <ResetPasswordForm />
      </div>
    </div>
  );
}
