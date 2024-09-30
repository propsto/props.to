import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "../atoms";

export interface SubmitButtonProps extends React.PropsWithChildren {
  isPending: boolean;
  name?: string;
  value?: string;
  result: PropstoFormState<Record<string, string>>;
  progress?: number;
  disabled?: boolean;
}

export function SubmitButton({
  isPending,
  children,
  name,
  result,
  value,
  progress,
  disabled,
}: Readonly<SubmitButtonProps>): JSX.Element {
  return (
    <Button
      aria-disabled={isPending}
      disabled={disabled}
      name={name}
      progress={progress}
      type="submit"
      value={value}
    >
      {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
      {result?.success === true ? (
        <CheckCircle2 className="mr-2 size-4" />
      ) : null}
      {result?.success === false && result.message ? (
        <XCircle className="mr-2 size-4" />
      ) : null}
      {result?.message ?? result?.button ?? children}
    </Button>
  );
}
