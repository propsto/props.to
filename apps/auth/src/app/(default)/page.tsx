"use client";

import { useRef } from "react";
import { Logo } from "@propsto/ui/atoms/logo";
import { Triangles } from "@propsto/ui/molecules/triangles";
import { SigninForm } from "./form";

export default function SigninPage(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className="flex lg:!hidden mb-5 h-12 overflow-hidden justify-center relative items-center text-2xl font-medium font-cal tracking-wider"
        ref={ref}
      >
        <Triangles size="small" parentRef={ref} />
        <Logo className="mr-2 z-20" size="large" />
        Props.to
      </div>
      <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80">
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
