import { Input, Label } from "../atoms";
import { cn } from "../utils/cn";

type FormInputErrorProps = {
  result: PropstoFormState<Record<string, string>>;
  isPending: boolean;
  controlName: string;
} & Partial<Pick<HTMLInputElement, "autocapitalize" | "autocomplete">>;

/**
 *             name="name"
            autocomplete="name"
            placeholder="Name"
            id="name"
            label="Name"
            type="name"
 */

export function FormInputError({
  result,
  isPending,
  controlName,
  autocapitalize,
  autocomplete,
}: FormInputErrorProps): JSX.Element {
  return (
    <>
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
    </>
  );
}
