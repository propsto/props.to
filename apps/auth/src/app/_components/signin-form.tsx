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
              placeholder="Password"
              controlName="password"
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
          variant="outline"
          type="button"
          onClick={() => {
            void signIn("google");
          }}
          disabled={isPending}
          className="space-x-2"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="size-4"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span>Sign in with Google</span>
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
