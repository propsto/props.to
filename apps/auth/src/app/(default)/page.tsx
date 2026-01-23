import { redirect } from "next/navigation";
import { constServer } from "@propsto/constants/server";
import { auth } from "@/server/auth.server";
import { SigninForm } from "@components/signin-form";
import { canUserMoveOn } from "@/lib/post-auth-check";

export default async function SigninPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>): Promise<React.ReactElement> {
  const [session, params] = await Promise.all([auth(), searchParams]);

  if (session?.user) {
    if (canUserMoveOn(session.user)) {
      return redirect(params.callbackUrl ?? constServer.PROPSTO_APP_URL);
    }
    const queryString = new URLSearchParams(
      params as Record<string, string>,
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
      <SigninForm googleClientId={constServer.GOOGLE_CLIENT_ID} />
    </div>
  );
}
