import { Input, Label } from "../atoms";
import { cn } from "../utils/cn";

type FormInputErrorProps = {
  result: PropstoFormState<Record<string, string>>;
  isPending: boolean;
  controlName: string;
  className?: string;
} & Partial<Pick<HTMLInputElement, "autocapitalize" | "autocomplete">>;

export function FormInputError({
  result,
  isPending,
  controlName,
  autocapitalize,
  autocomplete,
  className,
}: FormInputErrorProps): JSX.Element {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
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
