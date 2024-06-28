import { type CSSProperties } from "react";
import { Input, Label } from "../atoms";
import { cn } from "../utils/cn";

type FormInputErrorProps = {
  result: PropstoFormState<Record<string, string>>;
  isPending: boolean;
  controlName: string;
  className?: string;
  style?: CSSProperties;
} & Partial<Pick<HTMLInputElement, "autocapitalize" | "autocomplete">>;

export function FormInputError({
  result,
  isPending,
  controlName,
  autocapitalize,
  autocomplete,
  className,
  style,
  ...rest
}: FormInputErrorProps): JSX.Element {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      {...rest}
      style={style}
    >
      <Label className="sr-only" htmlFor={controlName.toLowerCase()}>
        {controlName}
      </Label>
      <Input
        autoCapitalize={autocapitalize}
        autoComplete={autocomplete ?? controlName.toLowerCase()}
        className={cn(result?.errors?.name && "!border-red-500")}
        disabled={isPending}
        id={controlName.toLowerCase()}
        name={controlName.toLowerCase()}
        placeholder={controlName}
        type={controlName}
      />
      {result?.errors?.[controlName.toLowerCase()] ? (
        <p className="text-sm text-red-500 text-left">
          {result.errors[controlName.toLowerCase()]}
        </p>
      ) : null}
    </div>
  );
}
