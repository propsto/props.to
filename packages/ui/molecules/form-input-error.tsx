import type { ChangeEventHandler, CSSProperties, JSX } from "react";
import { Input, Label } from "../atoms";
import { cn } from "../utils/cn";

type FormInputErrorProps = {
  result: PropstoFormState<Record<string, string>>;
  isPending: boolean;
  controlName: string;
  className?: string;
  style?: CSSProperties;
  onChange?: ChangeEventHandler<HTMLInputElement>;
} & Partial<
  Pick<
    HTMLInputElement,
    "autocapitalize" | "autocomplete" | "defaultValue" | "type" | "placeholder"
  >
>;

export function FormInputError({
  result,
  isPending,
  controlName,
  autocapitalize,
  autocomplete,
  defaultValue,
  className,
  style,
  type,
  onChange,
  placeholder,
  ...rest
}: FormInputErrorProps): JSX.Element {
  const errorKey = controlName.toLowerCase();
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
        className={cn(result?.errors?.[errorKey] && "!border-red-500")}
        defaultValue={defaultValue}
        disabled={isPending}
        id={controlName.toLowerCase()}
        name={controlName}
        onChange={onChange}
        placeholder={placeholder ?? controlName}
        type={type}
      />
      {result?.errors?.[errorKey] ? (
        <p className="text-sm text-red-500 text-left">
          {result.errors[errorKey]}
        </p>
      ) : null}
    </div>
  );
}
