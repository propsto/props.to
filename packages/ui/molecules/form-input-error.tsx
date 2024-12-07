import { type ChangeEventHandler, type CSSProperties } from "react";
import { Input, Label } from "../atoms";
import { cn } from "../utils/cn";

type FormInputErrorProps = {
  result: PropstoFormState<Record<string, string | null>>;
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
  className,
  placeholder,
  type,
  style,
  onChange,
  ...rest
}: FormInputErrorProps): React.ReactElement {
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
        name={controlName}
        onChange={onChange}
        placeholder={placeholder ?? controlName}
        type={type}
      />
      {result?.errors?.[controlName] ? (
        <p className="text-sm text-red-500 text-left">
          {result.errors[controlName]}
        </p>
      ) : null}
    </div>
  );
}
