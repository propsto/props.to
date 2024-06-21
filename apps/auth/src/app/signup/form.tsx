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
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Name
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={pending}
              name="name"
              placeholder="Name"
              type="name"
            />
            {state?.errors?.name ? (
              <p className="text-sm text-left text-red-500">
                {state.errors.name}
              </p>
            ) : null}
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={pending}
              name="email"
              placeholder="Email"
              type="email"
            />
            {state?.errors?.email ? (
              <p className="text-sm text-left text-red-500">
                {state.errors.email}
              </p>
            ) : null}
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              autoCapitalize="none"
              autoCorrect="off"
              disabled={pending}
              name="password"
              placeholder="Password"
              type="password"
            />
            {state?.errors?.password ? (
              <p className="text-sm text-left text-red-500">
                {state.errors.password}
              </p>
            ) : null}
          </div>
          {state?.message ? (
            <p className="text-sm text-left text-red-500">{state.message}</p>
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
