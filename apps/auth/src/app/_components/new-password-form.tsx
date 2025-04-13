"use client";

import { cn } from "@propsto/ui/lib/utils";
import { useResetableActionState } from "@propsto/ui/hooks/use-resetable-action-state";
import { FormInputError, SubmitButton } from "@propsto/ui/molecules";
import { Check, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { newPasswordAction } from "@/server/new-password-action";
import { isPasswordValid } from "@/lib/is-password-valid";

export function NewPasswordForm({
  className,
  token,
  ...props
}: Readonly<
  React.HTMLAttributes<HTMLDivElement> & { token: string }
>): React.ReactNode {
  const [passwordValue, setPasswordValue] = useState("");
  const [repeatPasswordValue, setRepeatPasswordValue] = useState("");
  const [passwordCheck, setPasswordCheck] = useState<
    ReturnType<typeof isPasswordValid> | undefined
  >(undefined);
  const [result, action, isPending, progress] = useResetableActionState(
    newPasswordAction,
    undefined,
  );

  useEffect(() => {
    if (passwordValue) {
      setPasswordCheck(isPasswordValid(passwordValue, true));
    }
  }, [passwordValue]);

  useEffect(() => {
    if (result?.success === false) {
      setPasswordValue("");
      setRepeatPasswordValue("");
    }
  }, [result]);

  return (
    <div className={cn("grid gap-6 relative", className)} {...props}>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <input type="hidden" name="token" value={token} />
          <FormInputError
            controlName="password"
            placeholder="Password"
            isPending={isPending}
            onChange={e => {
              setPasswordValue(e.target.value);
            }}
            type="password"
            result={result}
          />
          <ul className="ml-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              {passwordCheck?.caplow !== true ? (
                <Circle className="fill-transparent inline-block mr-1 w-4 h-2" />
              ) : (
                <Check
                  strokeWidth={3}
                  className="inline-block mr-1 size-4 text-green-600"
                />
              )}
              Mix of uppercase &amp; lowercase letters
            </li>
            <li className="flex items-center">
              {passwordCheck?.min !== true ? (
                <Circle className="fill-transparent inline-block mr-1 w-4 h-2" />
              ) : (
                <Check
                  strokeWidth={3}
                  className="inline-block mr-1 size-4 text-green-600"
                />
              )}
              Minimum 8 characters long
            </li>
            <li className="flex items-center">
              {passwordCheck?.num !== true ? (
                <Circle className="fill-transparent inline-block mr-1 w-4 h-2" />
              ) : (
                <Check
                  strokeWidth={3}
                  className="inline-block mr-1 size-4 text-green-600"
                />
              )}
              Contain at least 1 number
            </li>
          </ul>
          <FormInputError
            controlName="repeatPassword"
            placeholder="Repeat password"
            isPending={isPending}
            onChange={e => {
              setRepeatPasswordValue(e.target.value);
            }}
            type="password"
            result={result}
          />
          <SubmitButton
            result={result}
            isPending={isPending}
            progress={progress}
            disabled={
              !passwordCheck?.caplow ||
              !passwordCheck.min ||
              !passwordCheck.num ||
              passwordValue !== repeatPasswordValue
            }
          >
            Set password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
