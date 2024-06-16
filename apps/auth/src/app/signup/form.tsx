"use client";

import { cn } from "@propsto/ui/utils/cn";
import { useFormState, useFormStatus } from "react-dom";
import { Label, Input } from "@propsto/ui/atoms";
import { SubmitButton } from "@propsto/ui/molecules";
import { signUpAction } from "./action";

export function SignupForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>): JSX.Element {
  const [state, action] = useFormState(signUpAction, undefined);
  const { pending } = useFormStatus();

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            {state?.errors?.email ? (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            ) : null}
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
          {state?.message ? (
            <p className="text-sm text-red-500">{state.message}</p>
          ) : null}
          <SubmitButton>Create your account</SubmitButton>
        </div>
      </form>
      {/*<div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}{" "}
        GitHub
      </Button>*/}
    </div>
  );
}
