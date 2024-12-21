import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { SigninForm } from "@components/signin-form";

export default async function SigninPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (session?.user) redirect("/welcome");

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
