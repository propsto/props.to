import { redirect } from "next/navigation";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { auth } from "@/server/auth";
import { SigninForm } from "@components/signin-form";

export default async function SigninPage(): Promise<JSX.Element> {
  const session = await auth();
  if (session?.user) redirect("/welcome");

  return (
    <>
      <div className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider">
        <Triangles size="small" />
        <Logo className="mr-2 z-20" size="large" />
        Props.to
      </div>
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
        <div className="flex flex-col space-y-2 text-center">
          <h1>Get Started</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address to get a link to sign in or sign up
          </p>
        </div>
        <SigninForm />
      </div>
    </>
  );
}
