"use client";

import { cn } from "@propsto/ui/lib/utils";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { passwordResetAction } from "@/server/password-reset-action";

export function ResetPasswordForm({
  className,
  email,
  ...props
}: Readonly<
  React.HTMLAttributes<HTMLDivElement> & { email: string }
>): React.ReactNode {
  const [result, action, isPending, progress] = useResetableActionState(
    passwordResetAction,
    undefined,
  );

  return (
    <div className={cn("grid gap-6 relative", className)} {...props}>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <FormInputError
            controlName="email"
            placeholder="Email"
            defaultValue={email}
            isPending={isPending}
            result={result}
            type="email"
          />
          <SubmitButton
            result={result}
            isPending={isPending}
            progress={progress}
          >
            Send reset password link
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
