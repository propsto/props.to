"use client";

import { cn } from "@propsto/ui/utils/cn";
import { Button } from "@propsto/ui/atoms";
import { signIn } from "next-auth/webauthn";
import { useActionState } from "react";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { signInAction } from "./action";

export function SigninForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>): React.ReactNode {
  const [result, action, isPending] = useActionState(signInAction, undefined);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-4">
          <FormInputError
            controlName="Email"
            isPending={isPending}
            result={result}
          />
          <SubmitButton result={result} isPending={isPending}>
            Sign in
          </SubmitButton>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
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
      </form>
    </div>
  );
}
