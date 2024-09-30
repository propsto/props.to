"use client";

import { cn } from "@propsto/ui/utils/cn";
import { Button } from "@propsto/ui/atoms";
import { signIn } from "next-auth/webauthn";
import { startTransition, useEffect, useState } from "react";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { signInAction } from "@/server/signin-action";

export function SigninForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>): React.ReactNode {
  const [result, action, isPending, progress] = useResetableActionState(
    signInAction,
    undefined,
  );
  const [signInMethod, setSignInMethod] = useState<"email" | "credentials">(
    "email",
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (result?.code === "password-set") {
      setShowPassword(true);
    }
  }, [result?.code]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className={cn("grid gap-6 relative", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <FormInputError
            controlName="email"
            placeholder="Email"
            isPending={isPending}
            result={result}
            type="email"
          />
          {showPassword ? (
            <FormInputError
              controlName="Password"
              className={cn(
                "overflow-hidden transition-all duration-300",
                signInMethod === "credentials"
                  ? "max-h-[100px] opacity-100 translate-x-0"
                  : "max-h-0 opacity-0 -translate-x-full",
              )}
              isPending={isPending}
              result={result}
              type="password"
              autocomplete="off"
            />
          ) : null}
          <input type="hidden" name="signInMethod" value={signInMethod} />
          <SubmitButton
            result={result}
            isPending={isPending}
            progress={progress}
          >
            {signInMethod === "credentials" && showPassword
              ? "Sign in"
              : "Continue"}{" "}
            with {signInMethod === "credentials" ? "password" : "magic link"}
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
          Continue with {signInMethod === "email" ? "password" : "magic link"}
        </Button>
      </form>
    </div>
  );
}
