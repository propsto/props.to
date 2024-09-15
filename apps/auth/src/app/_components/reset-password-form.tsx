"use client";

import { cn } from "@propsto/ui/utils/cn";
import { startTransition, useRef } from "react";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { passwordResetAction } from "@/server/password-reset-action";

export function ResetPasswordForm({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>): React.ReactNode {
  const [result, action, isPending, progress] = useResetableActionState(
    passwordResetAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className={cn("grid gap-6 relative", className)} {...props}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        ref={formRef}
      >
        <div className="grid gap-2">
          <FormInputError
            controlName="Email"
            isPending={isPending}
            result={result}
          />
          <SubmitButton
            result={result}
            isPending={isPending}
            progress={progress}
          >
            Reset password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
