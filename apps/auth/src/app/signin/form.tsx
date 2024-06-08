"use client";

import { cn } from "@propsto/ui/utils/cn";
import { useFormState, useFormStatus } from "react-dom";
import { Label, Input, Button } from "@propsto/ui/atoms";
import { signIn } from "next-auth/webauthn";
import { SubmitButton } from "@propsto/ui/molecules/submit-button";
import { signInAction } from "./action";

export function SigninForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
  const [state, action] = useFormState(signInAction, { retry: 0, message: "" });
  const { pending } = useFormStatus();

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-4">
          <div className="grid gap-1 relative">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={pending}
              name="email"
              placeholder="name@example.com"
              type="email"
            />
          </div>
          <SubmitButton state={state}>Sign in with email link</SubmitButton>
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
          disabled={pending}
        >
          Sign in with Passkey
        </Button>
      </form>
    </div>
  );
}
