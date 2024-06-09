import { buttonVariants } from "@propsto/ui/atoms/button";
import { cn } from "@propsto/ui/utils/cn";
import type { Metadata } from "next";
import Link from "next/link";
import { SigninForm } from "./form";

export const metadata: Metadata = {
  title: "Props.to - Sign in",
  description: "Sign in to the biggest feedback open source community",
};

export default function SigninPage(): JSX.Element {
  return (
    <>
      <Link
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
        href="/signup"
      >
        Sign up
      </Link>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to get a link to sign in
        </p>
      </div>
      <SigninForm />
    </>
  );
}
