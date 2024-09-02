"use client";

import { cn } from "@propsto/ui/utils/cn";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { useFormState } from "react-dom";
import { signUpAction } from "./action";

export function SignupForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>): JSX.Element {
  const [result, action, isPending] = useFormState(signUpAction, undefined);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={action}>
        <div className="grid gap-2">
          <FormInputError
            result={result}
            isPending={isPending}
            controlName="Name"
            autocapitalize="words"
          />
          <FormInputError
            result={result}
            isPending={isPending}
            controlName="Email"
          />
          <FormInputError
            result={result}
            isPending={isPending}
            controlName="Password"
            autocapitalize="none"
            autocomplete="off"
          />
          <SubmitButton result={result} isPending={isPending}>
            Create your account
          </SubmitButton>
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
