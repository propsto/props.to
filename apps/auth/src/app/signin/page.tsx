import { buttonVariants } from "@propsto/ui/atoms/button";
import { cn } from "@propsto/ui/utils/cn";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign-in",
  description: "Sign-in to the biggest feedback open source community",
};

export default function SigninPage() {
  return (
    <>
      <Link
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
        href="/signup"
      >
        Sign-up
      </Link>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      Signin Form
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/terms"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}