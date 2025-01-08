import { redirect } from "next/navigation";
import { auth } from "@/server/auth.server";
import { SigninForm } from "@components/signin-form";
import { canUserMoveOn } from "@/lib/post-auth-check";

export default async function SigninPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const session = await auth();

  if (session?.user) {
    if (canUserMoveOn(session.user)) {
      return redirect(
        (await searchParams).callbackUrl ?? process.env.PROPSTO_APP_URL ?? "",
      );
    }
    const queryString = new URLSearchParams(
      (await searchParams) as Record<string, string>,
    ).toString();
    const redirectTo = queryString ? `/welcome?${queryString}` : "/welcome";
    redirect(redirectTo);
  }

  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <div className="flex flex-col space-y-2 text-center">
        <h1>Get Started</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address to get a link to sign in or sign up
        </p>
      </div>
      <SigninForm />
    </div>
  );
}
