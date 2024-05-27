"use client";

import { cn } from "@propsto/ui/utils/cn";
import { useFormState, useFormStatus } from "react-dom";
import { Icons, Button, Label, Input } from "@propsto/ui/atoms";
import { type SignUpFormStateProps, signUpAction } from "@/server/auth-actions";

export function SignupForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [state, action] = useFormState(signUpAction, {
    message: "",
    code: 0,
  });
  const { pending } = useFormStatus();

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={pending}
              id="email"
              placeholder="name@example.com"
              type="email"
            />
          </div>
          <LoginButton state={state} />
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

function LoginButton({ state }: { state: SignUpFormStateProps }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>
      {pending ? <Icons.Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
      {state.code === 200 && <Icons.Check className="mr-2 h-4 w-4" />}
      {state.message || "Create your account"}
    </Button>
  );
}
