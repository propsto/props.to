"use client";

import { cn } from "@propsto/ui/utils/cn";
import { Button } from "@propsto/ui/atoms";
import { signIn } from "next-auth/webauthn";
import { useActionState, useState } from "react";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { signInAction } from "./action";

export function SigninForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  const [result, action, isPending] = useActionState(signInAction, undefined);
  const [signInMethod, setSignInMethod] = useState<"email" | "credentials">(
    "email"
  );

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <FormInputError
            controlName="Email"
            isPending={isPending}
            result={result}
          />
          <FormInputError
            controlName="Password"
            className={cn(
              "overflow-hidden transition-all duration-300",
              signInMethod === "credentials"
                ? "max-h-[100px] opacity-100 translate-x-0"
                : "max-h-0 opacity-0 -translate-x-full"
            )}
            isPending={isPending}
            result={result}
            autocomplete="off"
          />
          <input type="hidden" name="signInMethod" value={signInMethod} />
          <SubmitButton result={result} isPending={isPending}>
            Sign in with{" "}
            {signInMethod === "credentials" ? "password" : "magic link"}
          </SubmitButton>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            void signIn("passkey");
          }}
          disabled={isPending}
        >
          Sign in with Passkey
        </Button>
        <Button
          variant="ghost"
          type="button"
          name="signInMethod"
          value="credentials"
          onClick={() => {
            if (signInMethod === "email") {
              setSignInMethod("credentials");
            } else {
              setSignInMethod("email");
            }
          }}
          disabled={isPending}
        >
          Sign in with {signInMethod === "email" ? "password" : "magic link"}
        </Button>
      </form>
    </div>
  );
}
